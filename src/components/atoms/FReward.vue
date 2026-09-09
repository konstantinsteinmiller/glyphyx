<template lang="pug">
  Transition(name="fade")
    div.fixed.inset-0.flex.flex-col.items-center.justify-center.backdrop-blur-md.touch-none.cursor-pointer(
      v-if="modelValue"
      class="bg-black/60"
      :class="[isAdShowing ? 'z-0' : 'z-[100]', isCompact ? 'p-2' : 'p-4']"
      :style="{\
        paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',\
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',\
        paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',\
        paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))'\
      }"
      @click="handleOverlayClick"
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

      //- Content area. One bounded, scrollable flex child in every mode.
      div.reward-body
        slot

      //- Tap-to-continue hint. In landscape it sits INLINE in the flow so it can
      //- never overlap the centred content; otherwise it floats at the bottom.
      Transition(name="fade")
        div.flex.justify-center.animate-pulse.pointer-events-none(
          v-if="showContinue"
          :class="isCompact ? 'shrink-0 pt-1 pb-1' : 'absolute bottom-8 left-0 right-0 sm:bottom-12'"
        )
          div.text-white.font-black.uppercase.italic.tracking-widest.brawl-text.continue-hint(
            :class="{ 'is-compact': isCompact }"
          )
            | {{ isMobile ? t('tapToContinue') : t('clickToContinue') }}
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobileLandscape, isShortViewport } from '@/use/useUser'
import { useArtImage } from '@/use/useArtImage'
// Sink the reward overlay below the ad layer whenever an interstitial/rewarded
// is on screen. GameMonetize (and several other portals) inject their ad
// container at a z-index lower than this modal's z-[100], so without this the
// modal — including its backdrop-blur — paints OVER the playing ad.
import { isAdShowing } from '@/use/useGamePause'

/**
 * The result overlay's frame. The ribbon, the scrollable body and the
 * tap-to-continue hint; the content is the caller's.
 */

// "Compact" layout = the short-viewport treatment: mobile landscape OR any
// short embed (≤500px tall, e.g. a CG iframe on a Chromebook).
const isCompact = computed(() => isMobileLandscape.value || isShortViewport.value)

const props = defineProps<{
  modelValue: boolean
  showContinue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'continue'): void
}>()

const { t } = useI18n()

// ─── The banner's picture ────────────────────────────────────────────────────
//
// `images/ui/ribbon.webp` is a 597×256 plate whose detail sits in the outer 17 %
// of its width; the middle is a plain band precisely because it gets stretched
// to the caption. The three numbers below bind the painting to the CSS cut, and
// they are declared HERE (not read off the file) because the file's size is a
// payload decision and the slice must be a FRACTION of whatever arrived.
const BANNER = { w: 597, h: 256, cap: 0.171 } as const

const paintedBanner = useArtImage('ui', 'ribbon')
const bannerStyle = computed(() => paintedBanner.value
  ? {
      '--banner-src': `url("${paintedBanner.value}")`,
      '--banner-slice': `${(BANNER.cap * 100).toFixed(2)}%`,
      '--banner-cap': ((BANNER.cap * BANNER.w) / BANNER.h).toFixed(3)
    }
  : {})

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

.brawl-text
  text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000

.continue-hint
  font-size: clamp(0.85rem, 3.4vmin, 1.5rem)

  &.is-compact
    font-size: clamp(0.65rem, 2.6vmin, 0.85rem)

// ─── The body ────────────────────────────────────────────────────────────────

.reward-body
  position: relative
  width: 100%
  // `0 1 auto`: the body takes the height its content needs and no more, so the
  // overlay's own `justify-center` centres the BANNER AND THE CONTENT AS ONE
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
  > *
    margin-block: auto

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
  border-width: 0 calc(2.5em * var(--banner-cap, 0.4))
  border-image-source: var(--banner-src)
  border-image-slice: 0 var(--banner-slice, 17%) 0 var(--banner-slice, 17%) fill
  border-image-width: 0 calc(2.5em * var(--banner-cap, 0.4))
  border-image-repeat: stretch
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.55))

  // No painting yet: a plate of blackened iron bound in gold, drawn in CSS.
  // The same silhouette the painting is made to — a swallow-tailed ribbon —
  // so the swap changes the material and nothing else.
  &.is-drawn
    border-width: 0
    padding-inline: clamp(1.2rem, 5vw, 2.2rem)
    background: linear-gradient(to bottom, #3a3f4c 0%, #24272f 55%, #15171d 100%)
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
</style>
