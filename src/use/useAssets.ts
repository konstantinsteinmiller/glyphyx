import { ref } from 'vue'
import { prependBaseUrl } from '@/utils/function'
import { artOverridesEnabled, preloadArtOverrides } from '@/game/art'
import { criticalArtWants, preloadRemainingArt, resumeNode } from '@/game/artPreload'
import {
  bakePebbleSlice, pebbleBakeProgress01, pebbleSpritesReady, primePebbleSprites
} from '@/use/useArenaArt'
import type { NodeConfig } from '@/game/rules'

// Glyphyx draws its field programmatically (Canvas 2D) and uses inline SVG for
// HUD icons. The loader's job is therefore small and precise: bake the pebble
// sprite set (procedural art is still art — it appears in no network waterfall,
// so a loader that only awaited images would report "done" while the board had
// nothing to draw), hold for the first screen's painted bitmaps when the art
// layer is on, and then get out of the way. SFX decode on an idle slot after
// first paint; music is fetched on demand when a match starts.

const loadingProgress = ref(100)
const areAllAssetsLoaded = ref(true)

export const resourceCache = {
  images: new Map<string, HTMLImageElement>(),
  audio: new Map<string, HTMLAudioElement>(),
  audioBuffers: new Map<string, AudioBuffer>()
}

let sharedAudioCtx: AudioContext | null = null
let resumeListenerArmed = false
/** Counts every active reason the audio layer should be globally
 *  silent. The single driver is now `useGamePauseAudio`, which holds one
 *  slot for the whole `isGamePaused` gate (ad mid-show, tab hidden,
 *  platform SDK pause, app modal). Each `suspendAllAudio()` increments,
 *  each `resumeAllAudio()` decrements; the AudioContext only resumes when
 *  the counter hits 0 — so an overlapping suspend (e.g. modal opened
 *  during an ad) can never re-unmute early. */
let suspendDepth = 0

export const getAudioContext = (): AudioContext | null => {
  if (sharedAudioCtx) return sharedAudioCtx
  const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext
  if (!Ctor) return null
  try {
    sharedAudioCtx = new Ctor() as AudioContext
  } catch {
    return null
  }
  // Born into an already-suspended world. A context constructed on a page that
  // has seen a user gesture starts `running`, so one created AFTER a mute has
  // landed (a portal `soundOff` at boot, a tab hidden before the first sound, an
  // ad opening before any SFX has played) would come up audible underneath it —
  // `suspendAllAudio` had already run and had nothing to suspend. The depth
  // counter is the honest record of whether anything wants silence right now.
  if (suspendDepth > 0) {
    try { void sharedAudioCtx.suspend() } catch { /* older impls */ }
  }
  armResumeOnGesture()
  return sharedAudioCtx
}

/** True while engine audio is globally suspended (an ad is on-screen, the
 *  tab is hidden, etc.). SFX entry points (`useSound`) read this to refuse
 *  starting a new one-shot during an ad — so nothing leaks past the mute. */
export const isAudioSuspended = (): boolean => suspendDepth > 0

const armResumeOnGesture = (): void => {
  if (resumeListenerArmed) return
  resumeListenerArmed = true
  const resume = () => {
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended' && suspendDepth === 0) {
      void sharedAudioCtx.resume()
    }
  }
  window.addEventListener('pointerdown', resume, { once: true })
  window.addEventListener('keydown', resume, { once: true })
}

/** Bookkeeping for HTMLAudio elements (music, fallback SFX path) so
 *  the suspend/resume helpers can pause + restart them alongside the
 *  Web Audio context. Loops register on creation in useSound. */
const trackedAudioElements = new Set<HTMLAudioElement>()
const pausedByGlobalSuspend = new WeakSet<HTMLAudioElement>()

export const registerHtmlAudio = (el: HTMLAudioElement) => {
  trackedAudioElements.add(el)
}
export const unregisterHtmlAudio = (el: HTMLAudioElement) => {
  trackedAudioElements.delete(el)
  pausedByGlobalSuspend.delete(el)
}

/** Suspend all engine audio — Web Audio context goes to `suspended`
 *  and any registered HTMLAudio element is paused (and remembered so a
 *  later resume can restart only the ones we actually paused). Stacks:
 *  multiple `suspendAllAudio()` calls require matching `resume` calls
 *  before audio plays again. */
export const suspendAllAudio = (): void => {
  suspendDepth += 1
  if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
    void sharedAudioCtx.suspend()
  }
  for (const el of trackedAudioElements) {
    if (!el.paused) {
      pausedByGlobalSuspend.add(el)
      try { el.pause() } catch { /* ignore */ }
    }
  }
}

export const resumeAllAudio = (): void => {
  suspendDepth = Math.max(0, suspendDepth - 1)
  if (suspendDepth > 0) return
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume()
  }
  for (const el of trackedAudioElements) {
    if (pausedByGlobalSuspend.has(el)) {
      pausedByGlobalSuspend.delete(el)
      void el.play().catch(() => { /* autoplay blocked / element gone */ })
    }
  }
}

// ─── Active one-shot SFX registry ─────────────────────────────────────────
// Transient one-shot SFX (the Web Audio fast path in `useSound`) play on the
// shared AudioContext and aren't HTMLAudio elements, so the suspend gate only
// FREEZES them via `ctx.suspend()`. On an early gate-drop they'd resume and
// tail audibly under an ad. We track them so an ad can hard-STOP them outright.
const activeOneShotSources = new Set<AudioBufferSourceNode>()

/** Register a one-shot Web Audio source so `killOneShotSfx()` can stop it.
 *  Auto-removes itself when the source finishes. */
export const registerOneShotSource = (source: AudioBufferSourceNode): void => {
  activeOneShotSources.add(source)
  source.addEventListener('ended', () => activeOneShotSources.delete(source), { once: true })
}

/**
 * Hard-stop EVERY in-flight one-shot SFX so nothing tails into an ad — called
 * right before an interstitial / rewarded ad is requested. Covers:
 *   • Web Audio one-shots  (stopped outright), and
 *   • non-looping tracked HTMLAudio (the decode-fallback one-shots) — paused
 *     AND dropped from the auto-resume set so the gate's resume can't restart
 *     them under or after the ad.
 * Intentionally leaves the bg music (HTMLAudio with `loop=true` → owned by
 * `forceStopMusic`) and the gameplay Web Audio LOOP (owned by the scene's
 * pause watcher) alone, so each is restored by its proper lifecycle.
 */
export const killOneShotSfx = (): void => {
  for (const s of [...activeOneShotSources]) {
    try { s.stop() } catch { /* already ended */ }
    activeOneShotSources.delete(s)
  }
  for (const el of trackedAudioElements) {
    if (el.loop) continue // bg music — forceStopMusic owns its stop/restart
    pausedByGlobalSuspend.delete(el)
    if (!el.paused) { try { el.pause() } catch { /* ignore */ } }
  }
}

// Visibility-driven suspend lives in the unified pause gate: `useGamePause`
// owns the `visibilitychange` listener and `useGamePauseAudio` suspends /
// resumes audio off that gate for ALL builds — one suspend driver, not two.

// Test harness: exposes the live audio state so a Chrome MCP run can assert
// "no sound during the fake interstitial". Reads the module-private
// AudioContext + tracked-element registry that aren't otherwise observable from
// the page. Paired with `window.__testInterstitial` / `window.__audioDebug` in
// `useAds.ts`.
export const __audioDebugSnapshot = () => ({
  audioCtxState: sharedAudioCtx ? sharedAudioCtx.state : 'none',
  suspendDepth,
  trackedAudioCount: trackedAudioElements.size,
  trackedAudioPaused: [...trackedAudioElements].map((e) => e.paused),
  anyTrackedAudioPlaying: [...trackedAudioElements].some((e) => !e.paused),
  activeOneShotSfx: activeOneShotSources.size
})

export const getCachedImage = (src: string): HTMLImageElement => {
  // Route every bitmap src through `prependBaseUrl` so the URL matches
  // the build's base. Critical for wavedash (and any other build that
  // ships with `--base=./`) where the CDN serves the bundle under a
  // hashed path prefix — bare `/images/foo.webp` 404s against the CDN
  // root, but `<base>/images/foo.webp` hits the build folder. Cache
  // keys off the prefixed URL so multiple callers (one passing the
  // leading slash, another not) still hit the same entry after the
  // helper's normalisation.
  const prefixed = prependBaseUrl(src)
  const existing = resourceCache.images.get(prefixed)
  if (existing) return existing
  const img = new Image()
  img.src = prefixed
  resourceCache.images.set(prefixed, img)
  return img
}

const pendingDecodes = new Map<string, Promise<AudioBuffer | null>>()

export const loadAudioBuffer = async (src: string): Promise<AudioBuffer | null> => {
  const cached = resourceCache.audioBuffers.get(src)
  if (cached) return cached
  const existing = pendingDecodes.get(src)
  if (existing) return existing

  const ctx = getAudioContext()
  if (!ctx) return null

  const promise = (async () => {
    try {
      const res = await fetch(src)
      if (!res.ok) return null
      const arrayBuffer = await res.arrayBuffer()
      const buffer = await ctx.decodeAudioData(arrayBuffer)
      resourceCache.audioBuffers.set(src, buffer)
      return buffer
    } catch (e) {
      console.warn(`[assets] decodeAudioData failed for ${src}`, e)
      return null
    } finally {
      pendingDecodes.delete(src)
    }
  })()
  pendingDecodes.set(src, promise)
  return promise
}

/**
 * How long the splash may wait on the pebble bake before letting the player in
 * anyway. A ceiling, not a target: the whole set lands in well under a second
 * even on a thread with no idle time. But a loading screen that can hang
 * forever is a worse bug than a pebble that bakes on its first draw.
 */
const PEBBLE_BAKE_TIMEOUT_MS = 6000

/**
 * How long the splash may wait on the FIRST SCREEN's paintings, ms.
 *
 * Longer than the bake's cap because this is a network: giving up at six
 * seconds on a connection that would have delivered in seven costs exactly
 * what the wait was for. Past it the player is let in and the paintings swap
 * themselves in as they land.
 */
const CRITICAL_ART_TIMEOUT_MS = 10000

/** Where the bake's share of the bar ends when painted art is on: the last
 *  stretch belongs to the first screen's bitmaps, so the number keeps moving
 *  instead of parking at 100% while they land. */
const BAKE_END_WITH_ART = 0.7

// ─── Off-hot-path background warm-up ───────────────────────────────────────
// Runs ONCE, after the splash has hidden (hot path done + first paint):
// the remaining paintings first (all of them, low priority), then the SFX
// decode — an SFX that has not decoded costs a frame of latency the first time
// it fires; a painting that has not arrived is a drawing where a painting was
// promised. The art wins.
let backgroundWarmStarted = false

const runBackgroundWarmup = (): void => {
  if (backgroundWarmStarted) return
  backgroundWarmStarted = true
  void (async () => {
    await preloadRemainingArt()
    try {
      const sp = await import('@/use/useSoundPreload')
      await sp.preloadGameplaySounds()
    } catch { /* non-critical — sounds still decode on first play */ }
  })()
}

/**
 * The node the save resumes to, as a config — or `null` when the campaign
 * module cannot answer (it is imported lazily so the loader's own chunk stays
 * small; a failure here only widens tier 0 to every commander).
 */
const resumeConfig = async (): Promise<NodeConfig | null> => {
  try {
    const { nodeConfig } = await import('@/game/campaign')
    return nodeConfig(resumeNode(), 'medium')
  } catch {
    return null
  }
}

/**
 * Wait for the pebble sprites to bake, feeding the loading bar as they go.
 *
 * Drives the baker directly rather than waiting on idle slots: the splash is
 * up, so nothing else is animating and a fat slice is invisible — and it is
 * what stops a device that never goes idle from sitting here until the cap
 * expires. Always resolves within `PEBBLE_BAKE_TIMEOUT_MS`.
 */
const waitForPebbles = async (): Promise<void> => {
  if (pebbleSpritesReady()) return
  const deadline = Date.now() + PEBBLE_BAKE_TIMEOUT_MS
  while (!pebbleSpritesReady() && Date.now() < deadline) {
    bakePebbleSlice(8)
    const bakeEnd = artOverridesEnabled() ? BAKE_END_WITH_ART : 1
    loadingProgress.value = Math.round(bakeEnd * pebbleBakeProgress01() * 100)
    await new Promise((resolve) => setTimeout(resolve, 30))
  }
}

export default () => {
  const preloadAssets = async (): Promise<void> => {
    loadingProgress.value = 0
    areAllAssetsLoaded.value = false

    // ── Step 1: the pebble sprites ──
    // Procedural, baked into offscreen canvases, essential: a hand of blank
    // stones is the fallback and nobody should ever see it.
    primePebbleSprites()
    await waitForPebbles()

    // ── Step 2: the painted art the first screen needs ──
    // Only with overrides on — a portal build with the flag off waits for
    // nothing and requests nothing. Bounded, so a stalled CDN turns "the art
    // did not load" into a drawing, never into "the game did not load".
    if (artOverridesEnabled()) {
      const config = await resumeConfig()
      await Promise.race([
        preloadArtOverrides(criticalArtWants(config), (done, total) => {
          const k = total > 0 ? done / total : 1
          loadingProgress.value = Math.round((BAKE_END_WITH_ART + (1 - BAKE_END_WITH_ART) * k) * 100)
        }),
        new Promise<void>((resolve) => setTimeout(resolve, CRITICAL_ART_TIMEOUT_MS))
      ])
    }

    loadingProgress.value = 100
    areAllAssetsLoaded.value = true
    scheduleBackgroundWarmup()
  }

  return {
    loadingProgress,
    areAllAssetsLoaded,
    preloadAssets,
    resourceCache
  }
}

// Dev-only probe, same pattern as `__audioDebug` / `__testInterstitial` in
// `useAds`. Lets a browser harness assert that the pebble set really baked in
// THAT engine rather than inferring it from a screenshot. Gated on
// `import.meta.env.DEV`, so it is dead-code-eliminated from every platform build.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__assetDebug = () => ({
    loadingProgress: loadingProgress.value,
    areAllAssetsLoaded: areAllAssetsLoaded.value,
    pebblesReady: pebbleSpritesReady(),
    pebbleBake01: pebbleBakeProgress01()
  })
}

/** Schedule the off-hot-path warm-up on the first idle slot (rIC), falling back
 *  to a short timeout. Runs after the current frame so first paint isn't hit. */
const scheduleBackgroundWarmup = (): void => {
  if (typeof window === 'undefined') { runBackgroundWarmup(); return }
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined
  if (typeof ric === 'function') ric(() => runBackgroundWarmup(), { timeout: 3000 })
  else setTimeout(runBackgroundWarmup, 0)
}
