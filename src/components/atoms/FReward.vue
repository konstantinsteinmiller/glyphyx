<template lang="pug">
  Transition(name="fade")
    div.reward-root.fixed.inset-0.flex.flex-col.items-center.justify-center.touch-none.cursor-pointer(
      v-if="modelValue"
      :class="[\
        isAdShowing ? 'z-0' : 'z-[100]',\
        fit ? 'is-fit backdrop-blur-sm' : 'backdrop-blur-md',\
        fit ? 'bg-black/80' : 'bg-black/60'\
      ]"
      @click="handleOverlayClick"
    )
      //- ── The stage: full-bleed layers BEHIND the prize ──────────────────────
      //-
      //- Anything full-screen — god rays, a confetti canvas — belongs here and
      //- NOT in the default slot. Two reasons, both of which bite silently:
      //-
      //-   • in `fit` mode the body's content is wrapped in a `scale()`
      //-     transform, and a transform makes its element a containing block
      //-     for `position: fixed` descendants. A ray plane rendered in the
      //-     default slot would therefore be positioned against the scaled
      //-     wrapper AND scaled along with it, which is exactly what a
      //-     full-bleed layer must never be;
      //-   • the body is a scroll container, so a layer inside it inherits a
      //-     scroll position it has no business having.
      //-
      //- This wrapper sits outside both, so its children resolve against this
      //- root — which is `inset-0` and, deliberately, UNPADDED (see
      //- `.reward-frame`), so `position: fixed; inset: 0` really is the whole
      //- viewport rather than the viewport minus a padding ring.
      div.reward-layers(v-if="$slots.stage" aria-hidden="true")
        slot(name="stage")

      //- ── The frame: everything the player reads ─────────────────────────────
      //- The padding lives HERE rather than on the root so that the stage above
      //- can be full-bleed. Visually identical to the padding the root used to
      //- carry.
      div.reward-frame(
        :class="{ 'is-compact': isCompact }"
        :style="framePadding"
      )
        //- The banner: a plate sized by its own caption, so the title is centred
        //- by flex and nothing else. Painted through `images/ui/ribbon.webp` when
        //- the art layer has it, drawn in CSS otherwise — see `.banner`.
        div.banner.relative.shrink-0(
          v-if="$slots.ribbon"
          :class="{ 'is-compact': isCompact, 'is-drawn': !paintedBanner }"
          :style="bannerStyle"
        )
          div.banner__text
            slot(name="ribbon")
              span {{ t('rewards') }}

        //- Content area. Scrollable by default (the result screen has more to
        //- say than a short window can hold); in `fit` mode it never scrolls
        //- and the whole composition is scaled down to what is available.
        div.reward-body(ref="bodyEl" :class="{ 'is-fit': fit }")
          div.reward-body__fit(
            v-if="fit"
            ref="fitEl"
            :style="{ transform: `scale(${fitScale})` }"
          )
            slot
          slot(v-else)

        //- Tap-to-continue. The whole plane is the button, so this only has to
        //- SAY so — and be legible over a bright celebration, which is why it is
        //- a plate rather than bare text. Neutral chrome on purpose: it must not
        //- read as part of the prize. In landscape it sits INLINE in the flow so
        //- it can never overlap the centred content; otherwise it floats.
        Transition(name="fade")
          div.reward-continue.flex.justify-center.pointer-events-none(
            v-if="showContinue"
            :class="isCompact ? 'shrink-0 pt-1 pb-1' : 'absolute bottom-8 left-0 right-0 sm:bottom-12'"
          )
            div.continue-hint.brawl-text(:class="{ 'is-compact': isCompact }")
              | {{ isMobile ? t('tapToContinue') : t('clickToContinue') }}
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobileLandscape, isShortViewport } from '@/use/useUser'
import { useArtImage } from '@/use/useArtImage'
import { RIBBON_PLATE } from '@/game/artCatalogue'
// Sink the reward overlay below the ad layer whenever an interstitial/rewarded
// is on screen. GameMonetize (and several other portals) inject their ad
// container at a z-index lower than this modal's z-[100], so without this the
// modal — including its backdrop-blur — paints OVER the playing ad.
import { isAdShowing } from '@/use/useGamePause'

/**
 * ─── The reward overlay's frame ─────────────────────────────────────────────
 *
 * The ribbon, the body and the tap-to-continue hint; the content is the
 * caller's. Two callers, and they want different things from it:
 *
 *   • the RESULT screen (`GameScene`) has a headline, a coin line, a rank
 *     badge, a rewarded button and two actions. On a short window that is
 *     genuinely more than fits, so it scrolls. This is the default.
 *   • the CHEST screen (`ChestOverlay`) is one prize on a celebration plane.
 *     A reward the player has to scroll to see is a reward they may never see,
 *     so it passes `fit` and the composition is SCALED to the viewport instead.
 *
 * ── Why `fit` scales rather than clips ──
 *
 * The content is authored by the caller and its natural size is not knowable
 * here, so "make it fit" cannot be done with `overflow: hidden` (that clips)
 * or with viewport units in the children (that only helps if every child
 * cooperates). Measuring the natural box and scaling it down is the only
 * approach that guarantees the whole prize is on screen, whatever the caller
 * put in the slot and whatever the window is.
 *
 * The scale is capped at 1: content that already fits is never blown up.
 */

// "Compact" layout = the short-viewport treatment: mobile landscape OR any
// short embed (≤500px tall, e.g. a CG iframe on a Chromebook).
const isCompact = computed(() => isMobileLandscape.value || isShortViewport.value)

const props = withDefaults(defineProps<{
  modelValue: boolean
  showContinue: boolean
  /**
   * Scale the content to the viewport instead of scrolling it, and dress the
   * backdrop for a celebration rather than for reading. Opt-in: the result
   * screen leaves it off and keeps its scroll.
   */
  fit?: boolean
}>(), { fit: false })

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'continue'): void
}>()

const { t } = useI18n()

// ─── Fitting the content to the window ───────────────────────────────────────
//
// `offsetWidth`/`offsetHeight` are the UNTRANSFORMED layout box — the one thing
// that stays honest once a `scale()` is on the element — so the natural size can
// be re-read every time without the measurement chasing its own transform.
// (`getBoundingClientRect` would return the scaled box and converge on nothing.)
// Because a transform does not affect layout, writing the scale cannot resize
// anything, so neither observer can loop.

const bodyEl = ref<HTMLElement | null>(null)
const fitEl = ref<HTMLElement | null>(null)
const fitScale = ref(1)

const measureFit = (): void => {
  const outer = bodyEl.value
  const inner = fitEl.value
  if (!props.fit || !outer || !inner) {
    fitScale.value = 1
    return
  }
  const naturalW = inner.offsetWidth
  const naturalH = inner.offsetHeight
  const availableW = outer.clientWidth
  const availableH = outer.clientHeight
  // A zero anywhere means the box has not been laid out yet (or we are in a
  // test renderer with no layout at all). Scale 1 is the honest answer there —
  // never a division that yields `NaN` or `Infinity`.
  if (naturalW <= 0 || naturalH <= 0 || availableW <= 0 || availableH <= 0) {
    fitScale.value = 1
    return
  }
  fitScale.value = Math.min(1, availableW / naturalW, availableH / naturalH)
}

let observer: ResizeObserver | null = null

const stopObserving = (): void => {
  observer?.disconnect()
  observer = null
}

const startObserving = (): void => {
  stopObserving()
  if (!props.fit) return
  if (typeof ResizeObserver === 'undefined') {
    // No observer (jsdom, very old browsers): measure once and stand down.
    measureFit()
    return
  }
  observer = new ResizeObserver(measureFit)
  // BOTH boxes: the inner one changes when the loot arrives, the outer one when
  // the window resizes or the keyboard opens.
  if (fitEl.value) observer.observe(fitEl.value)
  if (bodyEl.value) observer.observe(bodyEl.value)
  measureFit()
}

// The elements only exist while the overlay is open, so (re)bind whenever it
// opens, closes, or switches mode.
watch(
  () => [props.modelValue, props.fit] as const,
  async () => {
    stopObserving()
    fitScale.value = 1
    if (!props.modelValue || !props.fit) return
    // Wait for the body/wrapper refs to be attached before measuring them.
    await Promise.resolve()
    startObserving()
  },
  { immediate: true, flush: 'post' }
)

onBeforeUnmount(stopObserving)

// ─── The banner's picture ────────────────────────────────────────────────────
//
// `images/ui/ribbon.webp` is a level, mirror-symmetric plate whose ends sit in
// the outer `cap` of its width; the middle is a plain band of one height
// precisely because it gets stretched to the caption, and its centre line is
// the image's so a caption centred by flex sits ON it. `RIBBON_PLATE` binds the
// painting to the CSS cut. It is declared (not read off the file) because the
// file's size is a payload decision and the slice must be a FRACTION of
// whatever arrived — and it is the same number `paintRibbon` draws the
// reference to, so the painter, the slicer and this cut cannot drift apart.
const BANNER = RIBBON_PLATE

const paintedBanner = useArtImage('ui', 'ribbon')
const bannerStyle = computed(() => paintedBanner.value
  ? {
      '--banner-src': `url("${paintedBanner.value}")`,
      '--banner-slice': `${(BANNER.cap * 100).toFixed(2)}%`,
      '--banner-cap': ((BANNER.cap * BANNER.w) / BANNER.h).toFixed(3),
      // Lift the caption onto the cloth — see `RIBBON_PLATE.mid`. Half of it
      // as padding under the text moves the flex centre up by the whole shift.
      '--banner-lift': (0.5 - BANNER.mid).toFixed(4)
    }
  : {})

/** The safe-area padding, moved off the root so the stage can be full-bleed. */
const framePadding = {
  paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
  paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
  paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
  paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))'
} as const

const isMobile = computed(() => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
})

const handleOverlayClick = () => {
  if (props.showContinue) emit('continue')
}

// Desktop shortcut: Space / Enter triggers the same "continue" action the
// overlay click does, but only while the reward is up AND in continue-mode.
const onContinueKey = (e: KeyboardEvent) => {
  if (!props.modelValue || !props.showContinue) return
  if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'NumpadEnter') return
  const t = e.target
  if (t instanceof HTMLElement) {
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return
    if (t.isContentEditable) return
  }
  e.preventDefault()
  emit('continue')
}

watch(() => props.modelValue, (open) => {
  if (open) window.addEventListener('keydown', onContinueKey)
  else window.removeEventListener('keydown', onContinueKey)
}, { immediate: true })

onUnmounted(() => {
  window.removeEventListener('keydown', onContinueKey)
})
</script>

<style scoped lang="sass">
.fade-enter-active, .fade-leave-active
  transition: opacity 0.4s ease

.fade-enter-from, .fade-leave-to
  opacity: 0

// ─── Leaving: the words go first, the dark goes last ────────────────────────
//
// The host starts the next match as soon as this overlay is dismissed, so for
// the length of the leave the next level is already drawn UNDERNEATH it. With
// one fade on the root, the backdrop thinned at exactly the same rate as the
// text it was hiding — so "REWARDS", the rune's description and "tap to
// continue" hung legibly over a fully lit board for four hundred milliseconds.
// Two blind testers filed that as a rendering glitch, a round apart, and a
// round-four verdict called it fixed on the strength of nobody mentioning it
// (2026-09-13, Camila, screenshot 007).
//
// So the CONTENT leaves in a tenth of the time and the backdrop keeps the
// rest: the board is revealed from behind a dimming veil with nothing written
// on it. Cheaper and more robust than sequencing the next match behind the
// transition, which would put a transition's timing in the scene's critical
// path.
.fade-leave-active .reward-frame,
.fade-leave-active .reward-layers
  transition: opacity 0.12s ease-out

.fade-leave-to .reward-frame,
.fade-leave-to .reward-layers
  opacity: 0

@media (prefers-reduced-motion: reduce)
  .fade-enter-active, .fade-leave-active,
  .fade-leave-active .reward-frame,
  .fade-leave-active .reward-layers
    transition-duration: 0.01s

.brawl-text
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

// ─── The layers, named once ──────────────────────────────────────────────────
//
// The root is a stacking context (z-index + backdrop-filter), so everything
// below is ordered against each other and nothing else:
//
//   0   the stage's own children (god rays)          — set by the caller
//   2   the frame: banner, body, the prize
//   3   the stage's foreground children (confetti)   — set by the caller
//   4   the continue hint
//
// The frame MUST be positioned with a z-index. A `position: fixed` child of the
// stage with `z-index: 0` paints above a static sibling, so an unpositioned
// frame would sit behind the rays — the prize hidden by its own celebration.

.reward-layers
  // Positioned so it leaves the frame's flex column, and NOTHING else: no
  // transform, filter, `contain` or `will-change`. Any of those would make this
  // wrapper a containing block for `position: fixed` children and quietly
  // re-anchor the rays and the confetti to it. As written, a fixed child still
  // resolves against the ROOT — which owns a `backdrop-filter`, so it IS the
  // containing block, and is `inset-0` and unpadded, so that box is the
  // viewport exactly.
  position: absolute
  inset: 0
  // Not a hit target: the click belongs to the root, which is the button.
  pointer-events: none

.reward-frame
  position: relative
  z-index: 2
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  width: 100%
  height: 100%
  min-height: 0

.reward-continue
  z-index: 4

// ─── The continue hint ───────────────────────────────────────────────────────
//
// A plate, not bare text. Over a god-ray plane and falling confetti, white
// italics with a drop shadow are legible only some of the time and only in
// some places; a dark capsule is legible everywhere. It is deliberately
// NEUTRAL — no gold, no glow — so it reads as the way onward rather than as
// another thing that was won.
.continue-hint
  display: inline-flex
  align-items: center
  padding: 0.35em 1.15em
  border-radius: 999px
  background-color: rgba(8, 12, 24, 0.72)
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16), 0 3px 10px rgba(0, 0, 0, 0.5)
  color: #fff
  font-weight: 900
  font-style: italic
  text-transform: uppercase
  letter-spacing: 0.1em
  line-height: 1.1
  white-space: nowrap
  font-size: clamp(0.85rem, 3.4vmin, 1.5rem)
  animation: continue-breathe 1.6s ease-in-out infinite

  &.is-compact
    padding: 0.3em 0.9em
    font-size: clamp(0.65rem, 2.6vmin, 0.85rem)

@keyframes continue-breathe
  0%, 100%
    opacity: 1
  50%
    opacity: 0.62

// ─── The body ────────────────────────────────────────────────────────────────

.reward-body
  position: relative
  width: 100%
  // `0 1 auto`: the body takes the height its content needs and no more, so the
  // frame's own `justify-center` centres the BANNER AND THE CONTENT AS ONE
  // GROUP. It still shrinks (and then scrolls) when the content cannot fit.
  flex: 0 1 auto
  min-height: 0
  display: flex
  flex-direction: column
  align-items: center
  overflow-y: auto
  overscroll-behavior: contain

  // Auto margins centre while it fits and collapse to zero when it does not —
  // centred flex content that overflows a scroll container is clipped at the
  // top and cannot be scrolled back to.
  &:not(.is-fit) > *
    margin-block: auto

  // Fitted: nothing scrolls, because nothing is ever out of view. The wrapper
  // overflows its box symmetrically before the scale is applied and is scaled
  // about its own centre, so what lands on screen is centred and whole.
  //
  // `overflow: visible`, NOT hidden. The scale is applied by `measureFit`, and
  // the loot arrives one layout AFTER the overlay opens — so for the frame
  // between the card mounting and the ResizeObserver answering, the content is
  // at scale 1 and taller than this box. Clipping it there cut the bottom off
  // the prize: measured at 294px of box holding 332px of card, taking 26px off
  // the rune's description — the one line that says what the rune DOES, at the
  // one moment the player is reading it. Two testers hit it on every unlock
  // they saw and both called it a bug (2026-09-12). Nothing scrolls either
  // way once the scale lands; the only thing `hidden` bought was the clip.
  &.is-fit
    justify-content: center
    overflow: visible

.reward-body__fit
  flex: 0 0 auto
  display: flex
  flex-direction: column
  align-items: center
  transform-origin: center center
  // Short, so a scale change follows the loot's own entrance rather than
  // fighting it, and settles before the player looks away from it.
  transition: transform 140ms ease-out
  will-change: transform

// ─── The banner ──────────────────────────────────────────────────────────────
//
// ONE image, three slices: an end piece each side kept at true size, and a
// middle stretched to the caption. So the banner's height is the caption's
// line and its width is the caption's width, and the title is centred by flex
// because there is nothing else in the box.
.banner
  display: inline-flex
  align-items: center
  justify-content: center
  max-width: min(94vw, 36rem)
  min-height: 2.5em
  font-size: clamp(1.05rem, 4.4vw, 1.9rem)
  margin-bottom: clamp(0.4rem, 2vh, 1.1rem)
  border-style: solid
  border-color: transparent
  border-width: 0 calc(2.5em * var(--banner-cap, 0.58))
  border-image-source: var(--banner-src)
  border-image-slice: 0 var(--banner-slice, 25%) 0 var(--banner-slice, 25%) fill
  border-image-width: 0 calc(2.5em * var(--banner-cap, 0.58))
  border-image-repeat: stretch
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.55))
  // The caption belongs on the CLOTH, and the cloth is not the middle of the
  // picture (see `RIBBON_PLATE.mid`). Padding under the text moves the flex
  // centre up by half of it, so the lift is applied doubled. Zero by default,
  // which is what the CSS-drawn ribbon below wants — that one IS symmetric.
  padding-bottom: calc(2.5em * var(--banner-lift, 0) * 2)

  // No painting yet: a band of night-indigo cloth trimmed in gold, drawn in
  // CSS in `paintRibbon`'s own colours. The same silhouette the painting is
  // made to — a level, swallow-tailed ribbon — so the swap changes the brush
  // and nothing else.
  &.is-drawn
    border-width: 0
    padding-inline: clamp(1.2rem, 5vw, 2.2rem)
    background: linear-gradient(to bottom, #565f9c 0%, #3c4379 50%, #282d57 100%)
    box-shadow: inset 0 0.18em 0 #c9a44a, inset 0 -0.18em 0 #8a6c2a, 0 0 0 0.12em #0b0c10
    clip-path: polygon(0 0, 100% 0, calc(100% - 0.9em) 50%, 100% 100%, 0 100%, 0.9em 50%)

  // Landscape phone / short embed: the caption is the banner, so shrinking the
  // type shrinks the whole thing, layout box included.
  &.is-compact
    font-size: clamp(0.85rem, 3.4vw, 1.3rem)
    margin-bottom: 0.3rem

.banner__text
  padding: 0.15em 0.35em
  color: #fff
  font-weight: 900
  font-style: italic
  text-transform: uppercase
  letter-spacing: -0.01em
  line-height: 1
  text-align: center
  text-wrap: balance
  text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

@media (prefers-reduced-motion: reduce)
  .continue-hint
    animation: none

  .reward-body__fit
    transition: none
</style>
