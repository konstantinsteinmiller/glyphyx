import { prependBaseUrl } from '@/utils/function'
import { ART_FOLDERS, type ArtKind } from './artCatalogue'
import { devParam } from './cleanFeed'

/**
 * ─── Art contract ───────────────────────────────────────────────────────────
 *
 * Glyphyx draws its own field: the pebbles, the glyphs, the stone tiles and
 * every effect are Canvas 2D, baked to sprites at runtime. That keeps the
 * download tiny, makes the art crisp at any DPR, and means the game is
 * playable the instant the JS parses.
 *
 * When painted art arrives it drops in with NO renderer change: `spriteFor()`
 * probes `public/images/<folder>/<id>.webp` and, if the image decodes, the
 * renderer blits it instead of drawing. A missing file simply means "keep
 * drawing it". Every id is catalogued in `artCatalogue.ts`, the drop-in
 * manifest for artists is `art-todo.md`, and the pipeline that turns the
 * drawings into paintings — reference sheets, prompts, slicer, playground —
 * is `art-sheets/README.md` (bench at `/#/art-sheets`, dev only).
 *
 * ─── The feature flag ───────────────────────────────────────────────────────
 *
 * Three layers, most specific first:
 *
 *   1. `?art=on` / `?art=off` in the URL — flips it for this device and is
 *      REMEMBERED, so a reload keeps the answer and the param can be dropped.
 *   2. Whatever was remembered from a previous `?art=`.
 *   3. `VITE_ENABLE_ART_OVERRIDES` — the build's default, and the only layer a
 *      portal ever sees.
 *
 * The build default has to stay the floor because a miss is only free for the
 * GAME. CrazyGames' QA console reports every 404 as `Missing resource detected:
 * …/images/monsters/grumpling.webp`, one line per drawable, which reads as a
 * broken build to a reviewer. So art is shipped off until it is ready, while a
 * URL param still lets it be switched on and — the point of the flag — straight
 * back OFF, live, with no rebuild, when the new art turns out worse than the
 * drawn version.
 *
 * Read as a plain boolean rather than a `ref`: `spriteFor` runs per drawable
 * per frame, and a reactive read in that loop costs dependency tracking on every
 * body on the road for a value that changes when a human clicks something.
 */

/**
 * The folder layout and the id scheme live in `artCatalogue.ts` — the sheet
 * manifest and the Node-side prompt generator read them without touching
 * `window`, and this module re-exports them so every renderer import keeps
 * working. See there for what `melee-river-lv2` or `archer-e-goblin-lv1` mean.
 */
export { ART_FOLDERS, type ArtKind }

const BUILD_DEFAULT = import.meta.env.VITE_ENABLE_ART_OVERRIDES === 'true'
const STORAGE_KEY = 'artOverrides'

const readStored = (): boolean | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : !!JSON.parse(raw)
  } catch { return null }
}

const readParam = (): boolean | null => {
  try {
    // The router is on hash history, so a param can arrive in either half of
    // the URL — `?art=on#/` from a typed link, `#/?art=on` from a route push.
    const url = new URL(window.location.href)
    const hashQuery = url.hash.includes('?') ? url.hash.slice(url.hash.indexOf('?') + 1) : ''
    const raw = url.searchParams.get('art') ?? new URLSearchParams(hashQuery).get('art')
    if (raw === null) return null
    return ['1', 'on', 'true', 'yes'].includes(raw.toLowerCase())
  } catch { return null }
}

/**
 * `?artdeny=fx/laurel-,rune/support-obsidian-` — DEV only. A painting whose
 * `kind/id` starts with any listed prefix is treated as absent for this page
 * load, so its drawable falls back to the procedural painter while every
 * other painting stays on.
 *
 * It exists for scripted capture (`tools/preview-video`): a returned painting
 * can carry a defect a clip must not show — a caption the image model copied
 * off the reference sheet, a cell number the slicer kept — and this keeps it
 * out of the frame without a re-slice, a rebuild, or `?art=off` taking the
 * whole painted look down with it. Resolved once, at module load.
 */
const DENIED: readonly string[] = import.meta.env.DEV
  ? (devParam('artdeny') ?? '').split(',').map((p) => p.trim()).filter(Boolean)
  : []

let enabled = BUILD_DEFAULT
/** Bumped on every explicit refresh, to bust the HTTP cache. See `spriteFor`. */
let probeGeneration = 0

type ProbeState = 'loading' | 'ready' | 'missing'

interface Probe {
  state: ProbeState
  img: HTMLImageElement | null
  /** Resolves once this probe has decoded or failed. Never rejects. */
  settled: Promise<void>
}

const probes = new Map<string, Probe>()

// ─── Repaint notification ───────────────────────────────────────────────────
//
// Probing is ASYNC. `spriteFor` returns null while the image is still in
// flight, so anything that BAKES a decision — the lane tile pattern, the
// backdrop, a tinted smoke sprite, a sliced strip — captures the procedural
// look and keeps it for the life of the page unless it is told otherwise.
// A canvas cannot bind to a value, so it has to be told.

/**
 * What changed: the ONE painting that just decoded, or `null` for "anything
 * may have" — the flag flipped, or the probes were refreshed.
 *
 * Arrivals are the common case by far (every painting on disk, one by one,
 * through the first seconds of play), and a listener that treats each as
 * "everything changed" re-bakes the whole scene per painting. Say which one,
 * and a listener can drop only the bakes that painting is part of.
 */
export type ArtChange = { kind: ArtKind; id: string } | null

const artListeners = new Set<(change: ArtChange) => void>()

/** Repaint when drop-in art arrives or the flag flips. Returns an unsubscribe. */
export const onArtChanged = (fn: (change: ArtChange) => void): (() => void) => {
  artListeners.add(fn)
  return () => { artListeners.delete(fn) }
}

const artChanged = (change: ArtChange = null): void => {
  for (const fn of artListeners) fn(change)
}

/**
 * Forget every probe result.
 *
 * A 404 is remembered FOREVER — that is what stops the renderer re-requesting a
 * file that is not coming. Which is also exactly wrong the moment new art lands
 * on disk: without this, dropping in `grumpling.webp` and flipping the flag
 * would change nothing, because the miss from boot is still cached.
 */
export const refreshArtOverrides = (): void => {
  probes.clear()
  probeGeneration++
  artChanged()
}

/** Whether drop-in bitmap art is being looked for right now. */
export const artOverridesEnabled = (): boolean => enabled

/** Where the current answer came from, for diagnostics. */
export const artOverrideSource = (): 'url' | 'stored' | 'build' =>
  readParam() !== null ? 'url' : readStored() !== null ? 'stored' : 'build'

/**
 * Turn drop-in art on or off for this device, live.
 *
 * `remember: false` flips it for the session only — useful for an A/B look
 * without leaving a flag behind on a machine that will later be used to check a
 * portal build.
 */
export const setArtOverrides = (on: boolean, remember = true): boolean => {
  if (remember) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(on)) } catch { /* harmless */ }
  }
  const changed = enabled !== on
  enabled = on
  // Always re-probe on an explicit switch-on, even if the flag was already on:
  // the reason somebody calls this is usually that the files changed.
  if (on) refreshArtOverrides()
  else if (changed) probes.clear()
  console.warn(`[art] Painted overrides ${on ? 'ENABLED' : 'DISABLED'}.`)
  artChanged()
  return enabled
}

// Resolve at module load. A `?art=` in the URL is treated as an instruction,
// so it is persisted immediately and the param becomes optional from then on.
if (typeof window !== 'undefined') {
  const fromUrl = readParam()
  const stored = readStored()
  if (fromUrl !== null) {
    enabled = fromUrl
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl)) } catch { /* harmless */ }
  } else if (stored !== null) {
    enabled = stored
  }

  // A console handle, so the flag can be worked without a UI. Attached
  // unconditionally because the whole point is to reach it on a built preview
  // — it is three closures over a boolean, not a debug surface worth gating.
  ;(window as unknown as Record<string, unknown>).__art = {
    on: () => setArtOverrides(true),
    off: () => setArtOverrides(false),
    refresh: () => { refreshArtOverrides(); console.warn('[art] probes cleared; art re-reads on next draw.') },
    /**
     * Why the art on screen is the art on screen.
     *
     * `enabled` and `source` answer "is it even looking" — and `source:
     * 'stored'` is the one that catches people out, because a single `?art=off`
     * months ago outranks the build flag for ever. `ready` / `missing` answer
     * "did it find anything": a folder full of freshly sliced WebPs with
     * `ready: 0` means the probes were resolved before the files existed, and
     * `__art.refresh()` (or a reload) is the whole fix.
     */
    status: () => {
      let ready = 0
      let missing = 0
      for (const probe of probes.values()) {
        if (probe.state === 'ready') ready++
        else if (probe.state === 'missing') missing++
      }
      return { enabled, source: artOverrideSource(), probes: probes.size, ready, missing }
    }
  }

  // One line in dev, because "I sliced the art and nothing changed" has three
  // causes and none of them are visible: the flag off, a remembered `?art=off`,
  // or probes that resolved to 404 before the files landed.
  if (import.meta.env.DEV) {
    console.info(`[art] overrides ${enabled ? 'ON' : 'OFF'} (from ${artOverrideSource()}).`
      + ' __art.status() / .on() / .off() / .refresh()')
  }
}

/** A hint to the browser's fetch scheduler. Only honoured on the request that
 *  creates a probe; a later call with a different hint changes nothing. */
export type FetchPriority = 'high' | 'low'

/**
 * Return a decoded override bitmap for `(kind, id)` or null when none exists.
 * Never throws, never blocks — a missing file simply means "keep drawing it".
 *
 * Probing is lazy and one-shot per id: the first call kicks off an `Image`
 * load; until (and unless) it decodes, the renderer's procedural path runs. A
 * 404 marks the id as "procedural forever" so it is never re-requested.
 */
export const spriteFor = (
  kind: ArtKind, id: string, priority?: FetchPriority
): HTMLImageElement | null => {
  // Before the cache, before the `Image` — with the feature off, not one
  // request is made and the renderer simply keeps drawing.
  if (!enabled) return null

  const cacheKey = `${kind}/${id}`
  // Denied for this capture (see `DENIED`): never probed, so never "ready" either.
  if (DENIED.length !== 0 && DENIED.some((p) => cacheKey.startsWith(p))) return null
  let probe = probes.get(cacheKey)

  if (!probe) {
    let done: () => void = () => {}
    probe = { state: 'loading', img: null, settled: new Promise<void>((r) => { done = r }) }
    probes.set(cacheKey, probe)
    const img = new Image()
    img.decoding = 'async'
    // `fetchPriority` is what lets the late tiers of `artPreload` go out
    // without elbowing the first stage's strips off the wire. A browser that
    // does not know the property ignores the assignment.
    if (priority) (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority
    img.addEventListener('load', () => {
      // A zero-size decode is as good as missing.
      if (img.naturalWidth > 0) {
        probe!.state = 'ready'
        probe!.img = img
        // The whole point: whoever painted before this arrived gets to repaint
        // — and is told WHICH painting, so it repaints only what used it.
        artChanged({ kind, id })
      } else probe!.state = 'missing'
      done()
    }, { once: true })
    img.addEventListener('error', () => { probe!.state = 'missing'; done() }, { once: true })
    // The generation suffix only appears AFTER an explicit refresh. A clean
    // load stays cacheable; a re-probe after dropping new files on disk has to
    // defeat the browser cache or the old bitmap comes straight back.
    const bust = probeGeneration > 0 ? `?v=${probeGeneration}` : ''
    img.src = prependBaseUrl(`${ART_FOLDERS[kind]}/${id}.webp${bust}`)
  }

  return probe.state === 'ready' ? probe.img : null
}

/** One bitmap the scene will ask for: a kind and the id it is keyed by. */
export type ArtWant = readonly [ArtKind, string]

/**
 * Start probing `(kind, id)` and hand back the promise that settles when it
 * has decoded or failed. Null with overrides off, so a caller can `await`
 * only what it actually asked for.
 */
export const artSettled = (
  kind: ArtKind, id: string, priority?: FetchPriority
): Promise<void> | null => {
  if (!enabled) return null
  spriteFor(kind, id, priority)
  return probes.get(`${kind}/${id}`)?.settled ?? null
}

/**
 * Wait for the bitmaps in `wants` to decode, so the splash can hold for them.
 *
 * WHICH bitmaps is the caller's business — `artPreload` derives the first
 * stage's set from the foe roster, and this module stays off that import path
 * on purpose.
 *
 * Without this the art POPS IN: the game starts on the procedural drawing and
 * swaps to paint a second or two later, prop by prop, which reads as the scene
 * glitching rather than as loading. The whole point of the painted art is the
 * first impression, and the first impression was the version without it.
 *
 * Only when overrides are actually on — a portal build with the flag off waits
 * for nothing and requests nothing, exactly as before.
 *
 * Never rejects and never blocks forever: a missing file settles as 'missing'
 * and the procedural path simply keeps drawing.
 */
export const preloadArtOverrides = async (
  wants: ReadonlyArray<ArtWant>,
  onProgress?: (done: number, total: number) => void
): Promise<void> => {
  if (!enabled) return
  const jobs: Promise<void>[] = []
  for (const [kind, id] of wants) {
    const p = artSettled(kind, id, 'high')
    if (p) jobs.push(p)
  }

  let done = 0
  const total = jobs.length
  onProgress?.(0, total)
  await Promise.allSettled(jobs.map((j) => j.then(() => { onProgress?.(++done, total) })))
}

/** How many probes have been created — a test seam and a status number. */
export const artProbeCount = (): number => probes.size
