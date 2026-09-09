<template lang="pug">
  Transition(name="splash-fade")
    div.splash-backdrop.no-os-ui(v-if="!backdropHidden")

  //- The loading read-out only renders during the loading sequence. Once `done`
  //- flips true (progress = 100% OR the 8s fallback fires) it fades out and
  //- unmounts.
  //-
  //- ─── The greeting ─────────────────────────────────────────────────────────
  //-
  //- A rune pebble breathing over the title. It is the same picture as the
  //- inline static splash in `index.html`, at the SAME size in the SAME place,
  //- so when Vue mounts and that element fades out nothing moves — the glyph
  //- simply keeps glowing. Change one, change both.
  Transition(name="loader-fade")
    div.no-os-ui(
      v-if="!done"
      class="fixed z-[200] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    )
      div.greet
        div.greet-pebble(aria-hidden="true")
          svg.greet-svg(viewBox="0 0 200 200")
            defs
              radialGradient(id="splashStone" cx="0.38" cy="0.32" r="0.75")
                stop(offset="0" stop-color="#6b7590")
                stop(offset="0.45" stop-color="#3a4150")
                stop(offset="1" stop-color="#151922")
              radialGradient(id="splashGlow" cx="0.5" cy="0.5" r="0.5")
                stop(offset="0" stop-color="#ff5c66" stop-opacity="0.85")
                stop(offset="1" stop-color="#ff3b4a" stop-opacity="0")
            ellipse.greet-shadow(cx="100" cy="176" rx="66" ry="12" fill="rgba(0,0,0,0.5)")
            ellipse(cx="100" cy="102" rx="80" ry="68" fill="url(#splashStone)" stroke="#0b0d12" stroke-width="4")
            ellipse(cx="82" cy="70" rx="34" ry="16" fill="rgba(255,255,255,0.09)")
            circle.greet-glow(cx="100" cy="104" r="46" fill="url(#splashGlow)")
            //- The sword glyph, carved and lit.
            path.greet-glyph(transform="translate(58 58) scale(3.5)" d="M12 1.4 14.5 5.4 13.5 13.6H10.5L9.5 5.4 12 1.4ZM6.6 13.8H17.4A1.5 1.5 0 0 1 17.4 16.8H6.6A1.5 1.5 0 0 1 6.6 13.8ZM10.7 16.9H13.3V20.2H10.7ZM12 19.6A1.7 1.7 0 1 1 12 23 1.7 1.7 0 0 1 12 19.6Z" fill="#ff5c66")

        div.greet-logo
          span.greet-wordmark {{ t('gameName') }}

        span(class="percentage-text text-shadow text-amber-500") {{ Math.round(progress) }}%

        Transition(name="hint-fade")
          div.stuck-hint(v-if="showStuckHint") {{ t('loading.tooLong') }}
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import useAssets from '@/use/useAssets'
import { stopLoading } from '@/use/useCrazyGames'
import { armFirstLoadInterstitial, notifySplashGone } from '@/use/useFirstLoadInterstitial'

const { t } = useI18n()

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
      staticSplash.querySelector('.splash-pebble'),
      document.querySelector('.greet-pebble')
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

.greet-pebble
  width: 46%
  aspect-ratio: 1
  animation: greet-breathe 2.6s ease-in-out infinite

.greet-svg
  display: block
  width: 100%
  height: 100%
  overflow: visible
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6))

.greet-glow
  animation: greet-glow 2.6s ease-in-out infinite

.greet-glyph
  filter: drop-shadow(0 0 6px #ff3b4a) drop-shadow(0 0 1px #fff)

.greet-logo
  display: flex
  justify-content: center
  width: 100%

.greet-wordmark
  color: #fff
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.14em
  font-size: clamp(2rem, 12vmin, 3.8rem)
  line-height: 1
  text-shadow: 0 0 0.35em rgba(120, 200, 255, 0.9), 0 0 0.9em rgba(80, 170, 255, 0.55), 3px 3px 0 #000

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

@media (prefers-reduced-motion: reduce)
  .greet-pebble, .greet-glow
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
