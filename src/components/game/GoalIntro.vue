<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ArtIcon from '@/components/icons/ArtIcon.vue'
import { CONQUEST_TILES, GRID, TILE_COUNT } from '@/game/rules'
import { isMobilePortrait } from '@/use/useUser'
import { mobileCheck } from '@/utils/function'
import { playFx } from '@/use/useGameAudio'

/**
 * ─── The goal, shown once, without a word ───────────────────────────────────
 *
 * The first real match is the first time "hold eight tiles" matters, and a
 * number in a bar does not teach it. So, before that match's first turn: a
 * little board, its tiles lighting up in the player's colour one by one while
 * the count climbs, and when the eighth lights a crown stamps down on it.
 * Three seconds, a tap skips it, and it never plays again.
 *
 * `v-model` opens it; `done` fires exactly once, whether it ran out or was
 * tapped, and the model closes with it. The host pauses the match meanwhile
 * (it gates its clock on the overlay flag the same way it does for the chest).
 */
interface Props {
  modelValue: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'done'): void
}>()
const { t } = useI18n()

/** ms between one tile lighting and the next. */
const STEP_MS = 230
/** ms after the eighth tile before the crown lands… */
const CROWN_DELAY_MS = 250
/** …and how long the crowned board stays before the overlay lets go. */
const HOLD_MS = 900

const count = ref(0)
const crowned = ref(false)
let stepTimer: number | null = null
let doneFired = false

const isTouch = computed(() => mobileCheck() || isMobilePortrait.value
  || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))
const countLabel = computed(() => t('hud.tiles', { n: count.value, total: CONQUEST_TILES }))
/** The same sentence the conquest rail says when tapped. */
const rule = computed(() => t(`hints.conquest.${isTouch.value ? 'touch' : 'desktop'}`))

/**
 * Which tiles are lit at `count`: the player's two home rows, filled from the
 * bottom-left as if the player had walked up the board. Index `i` is the tile
 * in reading order (row 0 at the top).
 */
const litOrder = (i: number): number => {
  const row = Math.floor(i / GRID)
  const col = i % GRID
  const fromBottom = GRID - 1 - row
  return fromBottom * GRID + col
}
const isLit = (i: number): boolean => litOrder(i) < count.value

const clear = (): void => {
  if (stepTimer !== null) clearTimeout(stepTimer)
  stepTimer = null
}

const finish = (): void => {
  clear()
  if (doneFired) return
  doneFired = true
  emit('done')
  emit('update:modelValue', false)
}

const step = (): void => {
  stepTimer = null
  if (count.value < CONQUEST_TILES) {
    count.value += 1
    playFx('capture', 0.35)
    if (count.value < CONQUEST_TILES) {
      stepTimer = window.setTimeout(step, STEP_MS)
    } else {
      stepTimer = window.setTimeout(() => {
        stepTimer = null
        crowned.value = true
        playFx('unlock', 0.8)
        stepTimer = window.setTimeout(finish, HOLD_MS)
      }, CROWN_DELAY_MS)
    }
  }
}

const start = (): void => {
  clear()
  count.value = 0
  crowned.value = false
  doneFired = false
  stepTimer = window.setTimeout(step, STEP_MS)
}

watch(() => props.modelValue, (open) => {
  if (open) start()
  else clear()
}, { immediate: true })

onUnmounted(clear)
</script>

<template lang="pug">
  Transition(name="goal")
    div.goal(
      v-if="modelValue"
      role="dialog"
      aria-modal="true"
      :aria-label="t('hud.conquest')"
      @click="finish"
    )
      div.goal__card(:class="{ 'is-crowned': crowned }")
        div.goal__board(aria-hidden="true")
          span.goal__cell(
            v-for="i in TILE_COUNT"
            :key="i"
            :class="{ 'is-lit': isLit(i - 1) }"
          )
          span.goal__crown
            ArtIcon(kind="ui" id="crown" fallback="trophy")
        div.goal__count
          span.goal__count-num {{ countLabel }}
        //- The rule, in words, under the animation of it. "Shown once, without
        //- a word" was the intent and the animation is good — but a blind
        //- tester watched the whole thing and wrote "no label, no explanation
        //- of what it was tracking. I still don't know what it meant"
        //- (2026-09-12). The mime keeps the beat; this says what it mimed.
        div.goal__rule {{ rule }}
      span.goal__hint {{ isTouch ? t('tapToContinue') : t('clickToContinue') }}
</template>

<style scoped lang="sass">
.goal
  position: fixed
  inset: 0
  // Above the field and the HUD, below the result overlay (100) and modals (110).
  z-index: 90
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.6rem, 3vh, 1.4rem)
  padding: calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))
  background-color: rgba(4, 8, 18, 0.72)
  cursor: pointer
  touch-action: manipulation
  user-select: none
  -webkit-user-select: none

.goal__card
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.4rem, 2vh, 0.8rem)
  padding: clamp(0.8rem, 4vw, 1.4rem)
  border: 2px solid rgba(160, 120, 255, 0.55)
  border-radius: clamp(0.8rem, 3.6vw, 1.4rem)
  background: radial-gradient(ellipse at 50% 0%, rgba(160, 120, 255, 0.22), transparent 60%), linear-gradient(to bottom, #141d33, #0d1424)
  box-shadow: 0 0 28px rgba(160, 120, 255, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)

// The little board: a square that scales with the shorter side of the screen.
.goal__board
  position: relative
  display: grid
  grid-template-columns: repeat(4, 1fr)
  grid-template-rows: repeat(4, 1fr)
  gap: clamp(0.15rem, 1vmin, 0.35rem)
  width: min(46vmin, 15rem)
  aspect-ratio: 1

.goal__cell
  display: block
  border: 2px solid rgba(160, 120, 255, 0.55)
  border-radius: clamp(0.2rem, 1.2vmin, 0.45rem)
  background-color: rgba(30, 40, 70, 0.8)
  transition: background-color 160ms ease-out, box-shadow 160ms ease-out, border-color 160ms ease-out

  &.is-lit
    border-color: #9fe8ff
    background-image: linear-gradient(to bottom, #6fdcff, #2f9fe0)
    box-shadow: 0 0 10px rgba(79, 208, 255, 0.75), inset 0 0 8px rgba(255, 255, 255, 0.35)

// The crown: waits above the board, unseen, then stamps onto its centre.
.goal__crown
  position: absolute
  left: 50%
  top: 50%
  width: 42%
  height: 42%
  translate: -50% -50%
  scale: 2.4
  opacity: 0
  color: #ffd93c
  filter: drop-shadow(0 0.25rem 0 rgba(0, 0, 0, 0.7))
  transition: scale 260ms cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 200ms ease-out
  pointer-events: none

.goal__card.is-crowned .goal__crown
  scale: 1
  opacity: 1

.goal__card.is-crowned .goal__cell.is-lit
  box-shadow: 0 0 14px rgba(255, 217, 60, 0.7), inset 0 0 8px rgba(255, 255, 255, 0.4)

.goal__count
  display: inline-flex
  align-items: baseline
  justify-content: center
  min-width: 5ch

.goal__count-num
  color: #ffd93c
  font-weight: 900
  font-size: clamp(1.4rem, 8vmin, 2.6rem)
  line-height: 1
  letter-spacing: 0.04em
  text-shadow: 3px 3px 0 #000

.goal__rule
  max-width: 22ch
  color: #cfe6ff
  font-weight: 800
  font-size: clamp(0.7rem, 3.2vmin, 0.98rem)
  line-height: 1.2
  text-align: center
  text-transform: uppercase
  letter-spacing: 0.05em
  text-shadow: 2px 2px 0 #000
  text-wrap: balance

.goal__hint
  color: #fff
  font-weight: 900
  font-style: italic
  text-transform: uppercase
  letter-spacing: 0.12em
  font-size: clamp(0.62rem, 2.9vw, 0.9rem)
  text-shadow: 2px 2px 0 #000
  animation: goal-hint 1.6s ease-in-out infinite

.goal-enter-active, .goal-leave-active
  transition: opacity 220ms ease-out

.goal-enter-from, .goal-leave-to
  opacity: 0

@keyframes goal-hint
  0%, 100%
    opacity: 0.55
  50%
    opacity: 1

@media (prefers-reduced-motion: reduce)
  .goal__crown
    transition: none
  .goal__hint
    animation: none
</style>
