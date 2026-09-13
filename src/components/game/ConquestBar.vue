<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ArtIcon from '@/components/icons/ArtIcon.vue'
import { CONQUEST_TILES, TILE_COUNT } from '@/game/rules'
import { isMobilePortrait } from '@/use/useUser'
import { mobileCheck } from '@/utils/function'

/**
 * The conquest rail.
 *
 * Sixteen cells — the whole board, one per tile — with the player's tiles
 * filling from the left in blue and the enemy's from the right in red. The
 * centre mark is THE GOAL, and it has to read as one: a crown standing on the
 * win line with the number beside it, so "fill your colour up to the crown"
 * is the whole rule at a glance. The rail pulses whenever a count changes,
 * and a tap on it says the rule in words, briefly, for anyone who wants them.
 */
interface Props {
  player: number
  enemy: number
}
const props = defineProps<Props>()
const { t } = useI18n()

const clamp = (v: number): number => Math.max(0, Math.min(TILE_COUNT, Math.round(Number.isFinite(v) ? v : 0)))
const cells = computed(() => {
  const p = clamp(props.player)
  const e = clamp(props.enemy)
  const out: Array<'player' | 'enemy' | 'neutral'> = []
  for (let i = 0; i < TILE_COUNT; i++) {
    if (i < p) out.push('player')
    else if (i >= TILE_COUNT - e) out.push('enemy')
    else out.push('neutral')
  }
  return out
})
/**
 * ─── One number, not two ────────────────────────────────────────────────────
 *
 * This rail used to PRINT "4 / 8" under itself while `ConquestCounters`
 * printed "YOU 4" a few pixels away — the same tile count, twice, and one of
 * them under a crown. A blind tester read the pair as two different resources
 * and could not tell which decided the match: "I could not tell if losing a
 * piece cost me a trophy, a life, or a square" (2026-09-12).
 *
 * So the rail is a PICTURE now — sixteen tiles filling from both ends, the
 * crown standing on the win line with the number it takes to reach it — and
 * the counters own the live numbers. The text survives as this rail's
 * accessible name, where it competes with nothing — still clamped at the
 * goal, because "9 / 8" is a contradiction whoever reads it.
 */
const label = computed(() => t('hud.tiles', { n: Math.min(CONQUEST_TILES, clamp(props.player)), total: CONQUEST_TILES }))
const nearWin = computed(() => clamp(props.player) >= CONQUEST_TILES - 1)

// ─── The pulse ──────────────────────────────────────────────────────────────
const PULSE_MS = 520
const pulsing = ref(false)
let pulseTimer: number | null = null
const pulse = (): void => {
  if (pulseTimer !== null) clearTimeout(pulseTimer)
  pulsing.value = false
  // Re-arm on the next frame so back-to-back changes restart the animation.
  pulseTimer = window.setTimeout(() => {
    pulsing.value = true
    pulseTimer = window.setTimeout(() => { pulsing.value = false; pulseTimer = null }, PULSE_MS)
  }, 0)
}
watch(() => [clamp(props.player), clamp(props.enemy)], ([p, e], [pp, pe]) => {
  if (p !== pp || e !== pe) pulse()
})

// ─── The tooltip ────────────────────────────────────────────────────────────
const TIP_MS = 2200
const tipShown = ref(false)
let tipTimer: number | null = null
const isTouch = computed(() => mobileCheck() || isMobilePortrait.value
  || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))
const tip = computed(() => t(`hints.conquest.${isTouch.value ? 'touch' : 'desktop'}`))
const showTip = (): void => {
  if (tipTimer !== null) clearTimeout(tipTimer)
  tipShown.value = true
  tipTimer = window.setTimeout(() => { tipShown.value = false; tipTimer = null }, TIP_MS)
}

onUnmounted(() => {
  if (pulseTimer !== null) clearTimeout(pulseTimer)
  if (tipTimer !== null) clearTimeout(tipTimer)
})
</script>

<template lang="pug">
  div.conquest(
    role="progressbar"
    tabindex="0"
    :aria-valuenow="player"
    :aria-valuemin="0"
    :aria-valuemax="CONQUEST_TILES"
    :aria-label="`${t('hud.conquest')}: ${label}`"
    :class="{ 'is-pulse': pulsing }"
    @click="showTip"
    @keydown.enter.prevent="showTip"
  )
    div.conquest__rail(:class="{ 'is-near': nearWin }")
      span.conquest__cell(v-for="(c, i) in cells" :key="i" :class="`is-${c}`")
      span.conquest__mark(aria-hidden="true")
    //- The goal: the crown on the win line and the number it stands for.
    div.conquest__goal(aria-hidden="true")
      span.conquest__crown
        ArtIcon(kind="ui" id="crown" fallback="trophy")
      span.conquest__goal-num {{ CONQUEST_TILES }}
    Transition(name="tip")
      span.conquest__tip(v-if="tipShown" role="status") {{ tip }}
</template>

<style scoped lang="sass">
.conquest
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.15rem
  width: 100%
  // The crown stands above the rail; give it room so it never clips.
  padding-top: clamp(0.55rem, 2.6vw, 0.85rem)
  cursor: pointer
  outline: none
  -webkit-tap-highlight-color: transparent
  user-select: none
  -webkit-user-select: none

  &.is-pulse .conquest__rail
    animation: conquest-pulse 520ms ease-out

.conquest__rail
  position: relative
  display: grid
  grid-template-columns: repeat(16, 1fr)
  gap: 1px
  width: 100%
  min-width: 5.5rem
  height: clamp(0.4rem, 1.9vw, 0.6rem)
  padding: 1px
  border: 2px solid rgba(0, 0, 0, 0.6)
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.7)
  overflow: hidden

  &.is-near
    box-shadow: 0 0 10px rgba(79, 208, 255, 0.55)

.conquest__cell
  display: block
  border-radius: 2px
  background-color: rgba(255, 255, 255, 0.07)
  transition: background-color 180ms ease

  &.is-player
    background-image: linear-gradient(to bottom, #a0f0ff, #4fd0ff)
    box-shadow: 0 0 4px rgba(79, 208, 255, 0.6)
  &.is-enemy
    background-image: linear-gradient(to bottom, #ff8a72, #ec1f22)
    box-shadow: 0 0 4px rgba(236, 31, 34, 0.55)

// The win line: a hairline at the middle of the rail.
.conquest__mark
  position: absolute
  left: 50%
  top: 0
  bottom: 0
  width: 2px
  translate: -50% 0
  background-color: rgba(255, 217, 60, 0.85)
  box-shadow: 0 0 4px rgba(255, 217, 60, 0.9)
  pointer-events: none

// The crown on the line, the number beside it — sized off the rail, fluid.
.conquest__goal
  position: absolute
  left: 50%
  top: 0
  display: inline-flex
  align-items: center
  gap: 0.1rem
  translate: -50% 0
  pointer-events: none
  line-height: 1

.conquest__crown
  display: block
  width: clamp(0.7rem, 3.2vw, 1rem)
  height: clamp(0.7rem, 3.2vw, 1rem)
  color: #ffd93c
  filter: drop-shadow(0 1px 0 #000)

.conquest__goal-num
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.5rem, 2.4vw, 0.72rem)
  text-shadow: 1px 1px 0 #000

// The rule in words, under the rail, for as long as a glance takes.
.conquest__tip
  position: absolute
  top: 100%
  left: 50%
  z-index: 30
  margin-top: 0.2rem
  padding: clamp(0.2rem, 1vw, 0.35rem) clamp(0.5rem, 2.4vw, 0.8rem)
  border: 2px solid rgba(255, 217, 60, 0.7)
  border-radius: 999px
  background-color: rgba(8, 14, 28, 0.92)
  color: #fff
  font-weight: 900
  font-size: clamp(0.58rem, 2.7vw, 0.8rem)
  line-height: 1.2
  white-space: nowrap
  translate: -50% 0
  text-shadow: 1px 1px 0 #000
  pointer-events: none

.tip-enter-active, .tip-leave-active
  transition: opacity 180ms ease-out, translate 180ms ease-out

.tip-enter-from, .tip-leave-to
  opacity: 0
  translate: -50% -0.3rem

@keyframes conquest-pulse
  0%
    box-shadow: 0 0 0 0 rgba(255, 217, 60, 0.7)
  100%
    box-shadow: 0 0 0 0.45rem rgba(255, 217, 60, 0)

@media (prefers-reduced-motion: reduce)
  .conquest.is-pulse .conquest__rail
    animation: none
</style>
