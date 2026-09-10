<template lang="pug">
  Transition(name="splash-fade")
    div.splash-backdrop.no-os-ui(v-if="!backdropHidden")

  //- The loading read-out only renders during the loading sequence. Once `done`
  //- flips true (progress = 100% OR the 8s fallback fires) it fades out and
  //- unmounts.
  //-
  //- ─── The greeting ─────────────────────────────────────────────────────────
  //-
  //- THE KEEPER, holding a rune up in the dark, over the game's mark. It is the
  //- same picture as the inline static splash in `index.html`, at the SAME size
  //- in the SAME place, so when Vue mounts and that element fades out nothing
  //- moves — the rune simply keeps glowing. Change one, change both.
  //-
  //- Why a drawing and not a painting: this is the first frame of the game,
  //- before a single asset has been fetched. An <img> here would arrive late
  //- and pop. The one bitmap on the card is the LOGO, which is allowed to fade
  //- in a beat later because the hero is already lighting the screen.
  //-
  //- The figure is inline SVG rather than a canvas painter for the same reason
  //- the static splash exists at all: it paints from the HTML, with no script.
  //-
  //- The PAINTED Keeper, once the art pipeline has made one, rides on top:
  //- baked into the static splash at build time (so it too is in the first
  //- frame) and taken over from there, or probed and crossfaded in when it was
  //- not baked — see `paintedKeeper` below.
  Transition(name="loader-fade")
    div.no-os-ui(
      v-if="!done"
      class="fixed z-[200] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    )
      div.greet
        div.greet-hero(aria-hidden="true")
          svg.greet-svg(viewBox="0 0 200 200" :class="{ 'greet-svg--out': paintedKeeper }")
            defs
              radialGradient(id="splashStone" cx="0.38" cy="0.32" r="0.75")
                stop(offset="0" stop-color="#6b7590")
                stop(offset="0.45" stop-color="#3a4150")
                stop(offset="1" stop-color="#151922")
              radialGradient(id="splashGlow" cx="0.5" cy="0.5" r="0.5")
                stop(offset="0" stop-color="#ff5c66" stop-opacity="0.85")
                stop(offset="1" stop-color="#ff3b4a" stop-opacity="0")
              linearGradient(id="splashCloak" x1="0.15" y1="0" x2="0.85" y2="1")
                stop(offset="0" stop-color="#49557f")
                stop(offset="0.55" stop-color="#2a3149")
                stop(offset="1" stop-color="#151a28")
              linearGradient(id="splashHood" x1="0.2" y1="0" x2="0.9" y2="1")
                stop(offset="0" stop-color="#414c74")
                stop(offset="1" stop-color="#1d2233")
            g(transform="translate(-4 0)")
              ellipse(cx="84" cy="188" rx="56" ry="8" fill="rgba(0,0,0,0.5)")
              ellipse(cx="132" cy="190" rx="16" ry="5" fill="rgba(0,0,0,0.4)")
              //- The staff, planted, leaning back into the frame. It is what
              //- makes the silhouette read as somebody at a hundred pixels: a
              //- hooded shape alone is a hooded shape, a hooded shape with a
              //- staff is a keeper.
              path(d="M148 30L158 32L136 190L126 188Z" fill="#4a3a2c" stroke="#0b0d12" stroke-width="3.5" stroke-linejoin="round")
              path(d="M150 30L154 31L133 189L129 188Z" fill="rgba(255,190,140,0.18)")
              //- Its binding, where the hand goes.
              path(d="M142 92L156 94L153 108L139 106Z" fill="#6b5236" stroke="#0b0d12" stroke-width="3" stroke-linejoin="round")
              //- The cloak: shoulders, a heavy fall, and a hem torn into five
              //- points so the outline has teeth.
              path(d="M80 84C56 84 42 102 38 126L28 182L44 189L58 178L72 189L88 178L104 189L118 178L128 185L120 126C116 102 102 84 80 84Z" fill="url(#splashCloak)" stroke="#0b0d12" stroke-width="4" stroke-linejoin="round")
              //- The side away from the rune, in its own shadow.
              path(d="M80 84C56 84 42 102 38 126L28 182L44 189L58 178L72 189L80 184Z" fill="rgba(0,0,0,0.32)")
              //- A fold, so the cloak has a front and a side.
              path(d="M86 100L92 140L96 180" fill="none" stroke="#0b0d12" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round")
              //- The hood, peaked and leaning — the one line that stops this
              //- being a bell jar with eyes.
              path(d="M70 16C58 26 40 48 42 78C44 93 58 101 80 101C102 101 116 93 118 78C120 46 98 24 70 16Z" fill="url(#splashHood)" stroke="#0b0d12" stroke-width="4" stroke-linejoin="round")
              ellipse(cx="82" cy="74" rx="21" ry="16" fill="#090b11")
              ellipse.greet-eye(cx="74" cy="73" rx="4" ry="3.4" fill="#ffd79a")
              ellipse.greet-eye(cx="90" cy="73" rx="4" ry="3.4" fill="#ffd79a")
              //- The arm across to the staff, with a cuff and a hand on it.
              path(d="M104 92C118 86 130 86 142 92L139 106C129 101 118 101 108 106Z" fill="url(#splashCloak)" stroke="#0b0d12" stroke-width="4" stroke-linejoin="round")
              path(d="M136 88C146 86 152 90 152 97C152 105 145 108 136 105Z" fill="#c9ad86" stroke="#0b0d12" stroke-width="3" stroke-linejoin="round")
              //- The light of the whole picture, on top of the staff.
              circle.greet-glow(cx="153" cy="30" r="44" fill="url(#splashGlow)")
              ellipse(cx="153" cy="30" rx="27" ry="24" fill="url(#splashStone)" stroke="#0b0d12" stroke-width="4")
              ellipse(cx="144" cy="20" rx="11" ry="5" fill="rgba(255,255,255,0.11)")
              path.greet-glyph(transform="translate(137 13) scale(1.36)" d="M12 1.4 14.5 5.4 13.5 13.6H10.5L9.5 5.4 12 1.4ZM6.6 13.8H17.4A1.5 1.5 0 0 1 17.4 16.8H6.6A1.5 1.5 0 0 1 6.6 13.8ZM10.7 16.9H13.3V20.2H10.7ZM12 19.6A1.7 1.7 0 1 1 12 23 1.7 1.7 0 0 1 12 19.6Z" fill="#ff5c66")
              //- Rim light down the edges the rune actually reaches, and nowhere
              //- else: one light source, honestly drawn, is most of what makes a
              //- flat shape look solid.
              path(d="M74 18C100 26 118 48 118 78" fill="none" stroke="#ffb27a" stroke-opacity="0.5" stroke-width="3.2" stroke-linecap="round")
              path(d="M112 104L120 128L127 180" fill="none" stroke="#ffb27a" stroke-opacity="0.3" stroke-width="3" stroke-linecap="round")
              //- A second rune at the belt, dim: they come in a set.
              ellipse(cx="103" cy="122" rx="9" ry="8" fill="#2c3346" stroke="#0b0d12" stroke-width="2.5")
              ellipse(cx="103" cy="122" rx="3" ry="2.6" fill="#ff5c66" opacity="0.65")
              //- Three embers off the stone, on three different clocks.
              circle.greet-mote.greet-mote-a(cx="130" cy="48" r="2.5" fill="#ffc98a")
              circle.greet-mote.greet-mote-b(cx="178" cy="44" r="1.9" fill="#ff9a6a")
              circle.greet-mote.greet-mote-c(cx="156" cy="8" r="1.6" fill="#ffdaa8")
          Transition(name="keeper-swap")
            img.greet-painted(v-if="paintedKeeper" :src="paintedKeeper" alt="" draggable="false")

        div.greet-logo
          img.greet-wordmark(:src="logoSrc" :alt="t('gameName')" width="640" height="232" decoding="async" fetchpriority="high")

        span(class="percentage-text text-shadow text-amber-500") {{ Math.round(progress) }}%

        Transition(name="hint-fade")
          div.stuck-hint(v-if="showStuckHint") {{ t('loading.tooLong') }}
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { artOverridesEnabled } from '@/game/art'
import useAssets from '@/use/useAssets'
import { useArtImage } from '@/use/useArtImage'
import { stopLoading } from '@/use/useCrazyGames'
import { armFirstLoadInterstitial, notifySplashGone } from '@/use/useFirstLoadInterstitial'
import { prependBaseUrl } from '@/utils/function'

const { t } = useI18n()

/**
 * The mark, from `public/` rather than through the bundler.
 *
 * The static splash in `index.html` has to name the same file, and it cannot
 * see a hashed build asset — so the URL is one both can write. The bitmap is
 * already in the browser's cache by the time this component mounts, which is
 * what makes the handover between the two invisible.
 */
const logoSrc = prependBaseUrl('images/logo/wordmark.webp')

/**
 * The painted Keeper, or null while the drawing stands in.
 *
 * When the build shipped art, the static splash already carries the painting
 * as a data: URI (`src/game/keeperSplash.ts`). Taking ITS src is a picture the
 * browser has decoded, with no request, so the handover to this component
 * shows the same image in the same place — read now, in setup, because the
 * static splash is removed half a second after mount.
 *
 * Without one — a build that ships drawings but `?art=on` asked for paint, a
 * portal wrapper that serves its own index.html, or a painting too big to
 * inline — it is probed like every other drop-in and crossfaded in over the
 * drawing when it decodes. With the art layer off it stays the drawing and not
 * one request is made. (A remembered `?art=off` on an art build swaps back to
 * the drawing at the handover: the static splash cannot read the flag, only
 * the build default.)
 */
const bakedKeeper = document.querySelector<HTMLImageElement>('#static-splash .splash-painted')?.getAttribute('src') ?? null
const probedKeeper = !bakedKeeper && artOverridesEnabled() ? useArtImage('hero', 'keeper') : null
const paintedKeeper = computed(() => (artOverridesEnabled() ? (bakedKeeper ?? probedKeeper?.value ?? null) : null))

const { loadingProgress, preloadAssets } = useAssets()
const progress = computed(() => loadingProgress.value)

void preloadAssets()

// First-load interstitial — kept ON for GamePix only (its portal QA requires the
// post-load ad). GameDistribution / GameMonetize fire on the first Play instead
// — see `useFirstStartInterstitial`. Env-literal gate so Rollup DCEs the branch.
if (import.meta.env.VITE_APP_GAMEPIX === 'true') {
  armFirstLoadInterstitial()
}

const done = ref(false)
const backdropHidden = ref(false)
const showStuckHint = ref(false)
let stuckHintId: number | null = null
let settleFallbackId: number | null = null

/**
 * Hand the static splash's breathing over to this one, mid-breath.
 *
 * The two are the same picture at the same size, and for the 400 ms the static
 * splash spends fading out they are both on screen — so if their animations
 * are at different points the crossfade shows the pebble breathing against
 * itself. `getAnimations()` hands back the live CSS animations and
 * `currentTime` is writable, so the new one is set to wherever the old one had
 * got to. Wrapped because a stripped-down portal webview can lack the API.
 */
const adoptAnimationClock = (from: Element | null | undefined, to: Element | null): void => {
  if (!from || !to || typeof from.getAnimations !== 'function') return
  const was = from.getAnimations()
  const now = to.getAnimations()
  for (let i = 0; i < Math.min(was.length, now.length); i++) {
    const t = was[i]?.currentTime
    if (t !== null && t !== undefined) now[i]!.currentTime = t
  }
}

onMounted(() => {
  const staticSplash = document.getElementById('static-splash')
  if (staticSplash) {
    adoptAnimationClock(
      staticSplash.querySelector('.splash-hero'),
      document.querySelector('.greet-hero')
    )
    staticSplash.classList.add('hidden')
    setTimeout(() => staticSplash.remove(), 500)
  }

  // Hard fallback so the splash always clears, even if the asset loader never
  // reports 100% (offline / blocked images / dropped requests). Sits PAST the
  // loader's own wait ceilings so it is a true last resort rather than the
  // normal exit; the hint moves earlier so a slow load says something first.
  settleFallbackId = window.setTimeout(() => {
    if (!done.value) done.value = true
  }, 8000)
  stuckHintId = window.setTimeout(() => {
    if (!done.value) showStuckHint.value = true
  }, 5000)
})
onUnmounted(() => {
  if (settleFallbackId !== null) clearTimeout(settleFallbackId)
  if (stuckHintId !== null) clearTimeout(stuckHintId)
})

// `immediate: true` fires the handler with the current value the moment the
// watcher is set up — an asset loader that already reports 100% (instant boots)
// would otherwise never trip it.
watch(progress, (val) => {
  if (val >= 100 && !done.value) {
    setTimeout(() => { done.value = true }, 100)
  }
}, { immediate: true })

let cgLoadSignaled = false
const signalGameReadyToCG = () => {
  if (cgLoadSignaled) return
  cgLoadSignaled = true
  try { stopLoading() } catch (e) { console.warn('[FLogoProgress] CG ready-to-play failed', e) }
}

// Playgama's `game_ready` is certification-mandatory — fire it on the same
// splash-resolved edge as CG's loadingStop. Inline `import.meta.env` literal so
// Rollup eliminates the dynamic-import branch on non-Playgama builds.
let playgamaLoadSignaled = false
const signalGameReadyToPlaygama = () => {
  if (playgamaLoadSignaled) return
  if (import.meta.env.VITE_APP_PLAYGAMA !== 'true') return
  playgamaLoadSignaled = true
  void import('@/utils/playgamaPlugin').then(({ playgamaGameLoadingStop }) => {
    try { playgamaGameLoadingStop() }
    catch (e) { console.warn('[FLogoProgress] Playgama game_ready failed', e) }
  })
}

// GamePix's `gameLoaded` is the analogous certification-critical edge.
let gamepixLoadSignaled = false
const signalGameReadyToGamepix = () => {
  if (gamepixLoadSignaled) return
  if (import.meta.env.VITE_APP_GAMEPIX !== 'true') return
  gamepixLoadSignaled = true
  void import('@/utils/gamepixPlugin').then(({ gamePixGameLoadingStop }) => {
    try { gamePixGameLoadingStop() }
    catch (e) { console.warn('[FLogoProgress] GamePix gameLoaded failed', e) }
  })
}

// Poki's `gameLoadingFinished()` is the ONE strictly-required SDK call.
let pokiLoadSignaled = false
const signalGameReadyToPoki = () => {
  if (pokiLoadSignaled) return
  if (import.meta.env.VITE_APP_POKI !== 'true') return
  pokiLoadSignaled = true
  void import('@/utils/pokiPlugin').then(({ pokiGameLoadingFinished }) => {
    try { pokiGameLoadingFinished() }
    catch (e) { console.warn('[FLogoProgress] Poki gameLoadingFinished failed', e) }
  })
}

// Yandex's `LoadingAPI.ready()` is certification-mandatory.
let yandexLoadSignaled = false
const signalGameReadyToYandex = () => {
  if (yandexLoadSignaled) return
  if (import.meta.env.VITE_APP_YANDEX !== 'true') return
  yandexLoadSignaled = true
  void import('@/utils/yandexPlugin').then(({ yandexLoadingReady }) => {
    try { yandexLoadingReady() }
    catch (e) { console.warn('[FLogoProgress] Yandex LoadingAPI.ready failed', e) }
  })
}

watch(done, (isDone) => {
  if (isDone) {
    setTimeout(() => {
      backdropHidden.value = true
      signalGameReadyToCG()
      signalGameReadyToPlaygama()
      signalGameReadyToGamepix()
      signalGameReadyToYandex()
      signalGameReadyToPoki()
      // Triggers the GamePix first-load interstitial (no-op elsewhere).
      notifySplashGone()
    }, 150)
  }
})
</script>

<style scoped lang="sass">
.no-os-ui
  caret-color: transparent
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none
  -webkit-tap-highlight-color: transparent

  &, & *
    -webkit-user-drag: none

// --- The greeting card -----------------------------------------------------
//
// Every measurement below is shared with the inline static splash in
// `index.html`, which draws the same pebble at the same size in the same place
// so the handover between the two is invisible. Change one, change both.

$greet-w: clamp(200px, 58vmin, 340px)

.greet
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.55rem
  width: $greet-w

.greet-hero
  position: relative
  width: 62%
  aspect-ratio: 1
  animation: greet-breathe 2.6s ease-in-out infinite

.greet-svg
  display: block
  width: 100%
  height: 100%
  overflow: visible
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6))
  transition: opacity 0.35s ease-out

// The drawing steps back as the painting arrives. When the painting was baked
// into the static splash it is there from the first render, and neither side
// animates: a transition needs a state to come from.
.greet-svg--out
  opacity: 0

.greet-painted
  position: absolute
  inset: 0
  display: block
  width: 100%
  height: 100%
  object-fit: contain
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6))

.keeper-swap-enter-active
  transition: opacity 0.35s ease-out

.keeper-swap-enter-from
  opacity: 0

.greet-glow
  animation: greet-glow 2.6s ease-in-out infinite

.greet-glyph
  filter: drop-shadow(0 0 6px #ff3b4a) drop-shadow(0 0 1px #fff)

.greet-eye
  filter: drop-shadow(0 0 5px #ffae55)
  animation: greet-eyes 5.6s ease-in-out infinite

.greet-mote
  animation: greet-mote 3.4s ease-in-out infinite

.greet-mote-b
  animation-duration: 4.6s
  animation-delay: -1.4s

.greet-mote-c
  animation-duration: 5.2s
  animation-delay: -2.6s

.greet-logo
  display: flex
  justify-content: center
  width: 100%

.greet-wordmark
  display: block
  width: 100%
  height: auto
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.55))

.percentage-text
  font-size: clamp(0.9rem, 4vw, 1.35rem)
  font-weight: 900

@keyframes greet-breathe
  0%, 100%
    transform: translateY(0) scale(1)
  50%
    transform: translateY(-4%) scale(1.04)

@keyframes greet-glow
  0%, 100%
    opacity: 0.55
  50%
    opacity: 1

// A blink, and a long one: eyes that pulse steadily read as a machine.
@keyframes greet-eyes
  0%, 42%, 100%
    opacity: 1
  46%, 48%
    opacity: 0.15

@keyframes greet-mote
  0%
    opacity: 0
    transform: translateY(0)
  20%
    opacity: 0.9
  100%
    opacity: 0
    transform: translateY(-14%)

@media (prefers-reduced-motion: reduce)
  .greet-hero, .greet-glow, .greet-eye, .greet-mote
    animation: none

.splash-backdrop
  position: fixed
  inset: 0
  z-index: 150
  // Matches the inline splash in index.html AND the arena's night sky, so the
  // handover is one continuous colour with no flash between the three.
  background: radial-gradient(circle at 50% 38%, #1b2b52 0%, #0a1224 70%)

.splash-fade-leave-active
  transition: opacity 0.4s ease-out
  pointer-events: none

.splash-fade-leave-to
  opacity: 0

.loader-fade-leave-active
  transition: opacity 0.35s ease-out, transform 0.35s ease-out
  pointer-events: none

.loader-fade-leave-to
  opacity: 0
  transform: translate(-50%, -50%) scale(0.85)

.stuck-hint
  color: rgba(255, 200, 0, 0.85)
  font-size: clamp(0.75rem, 3vw, 0.9rem)
  text-align: center
  max-width: 80vw
</style>
