<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onArtChanged, spriteFor } from '@/game/art'
import { CONQUEST_TILES } from '@/game/rules'
import type { Rect } from '@/game/view'

/**
 * ─── The two conquest counters ──────────────────────────────────────────────
 *
 * "4 YOU" on the left, "FOE 5" on the right: how many of the sixteen tiles each
 * side holds, and the only number on screen that says who is winning.
 *
 * ── Why this is a component and not a canvas pass ──
 *
 * It used to be `drawCounters` in `useArenaArt`, redrawn sixty times a second.
 * Profiled at 4x CPU throttle that was the single most expensive thing the
 * renderer did — 13 % of ALL CPU, about 39 % of render time — because each of
 * its four `drawText` calls assigns `ctx.font`, and Chrome re-parses the CSS
 * font shorthand and re-resolves the `Angry` face on every assignment.
 *
 * The numbers change a handful of times per match. In the DOM they are two text
 * nodes that update when `syncCounts` publishes a new value and cost nothing on
 * any other frame. See `PERF-LEDGER.md`.
 *
 * ── Why it is positioned from the renderer's own geometry ──
 *
 * The board, the timer row and the hand are laid out by `computeArenaLayout`,
 * which owns every measure as a fraction of the board's side. The counters sit
 * in the timer row beside the clock. Taking `geom.counters` verbatim keeps them
 * pinned to the row on every viewport instead of re-deriving the same
 * arithmetic in CSS and drifting from it — which is exactly what would happen
 * the first time the landscape layout changed.
 *
 * ── Motion ──
 *
 * The gold "you can win now" pulse is the ONE animation here, and it only runs
 * while a side is actually at the conquest threshold. It is listed in the
 * `perf-lite` block in `index.sass`, so a device the quality ladder has put on
 * `low` gets the gold state without the pulse.
 */
const props = defineProps<{
  /** Tiles the player holds. */
  you: number
  /** Tiles the enemy holds. */
  foe: number
  /** The enemy faction's colour — the plaque's rim and the caption take it. */
  foeColor: string
  /** The renderer's own rects for the two plaques, in CSS px. */
  rects: { you: Rect; foe: Rect } | null
}>()

const { t } = useI18n()

/**
 * The painted plaque, once there is one.
 *
 * Routed through `spriteFor` rather than pointed straight at the URL from CSS,
 * so the DOM honours exactly the contract the canvas does: with the art flag
 * off not one request is made, a drawable nobody has painted yet is probed
 * ONCE and remembered as missing rather than re-requested by every render, and
 * a painting that arrives late repaints instead of being missed. A raw
 * `background-image` would re-ask for a 404 on every mount, and a portal's QA
 * console reports each one as a broken build.
 *
 * Until a painting exists this stays `none` and the CSS plate underneath —
 * drawn to match `arenaPainters.paintCounterPlate` — is what shows.
 */
const artVersion = ref(0)
const stopArtWatch = onArtChanged((change) => {
  if (!change || (change.kind === 'ui' && change.id.startsWith('counter-'))) artVersion.value++
})
onUnmounted(stopArtWatch)

const plate = (side: 'you' | 'foe'): string => {
  // Read the counter so a late-arriving painting re-evaluates this.
  void artVersion.value
  const img = spriteFor('ui', `counter-${side}`, 'high')
  return img ? `url("${img.src}")` : 'none'
}

const boxStyle = (r: Rect | undefined): Record<string, string> =>
  r
    ? { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` }
    : { display: 'none' }

/** Type size follows the plaque, so one rule serves phone and desktop. */
const fontStyle = (r: Rect | undefined): Record<string, string> =>
  r ? { fontSize: `${r.h * 0.46}px` } : {}

const youReached = computed(() => props.you >= CONQUEST_TILES)
const foeReached = computed(() => props.foe >= CONQUEST_TILES)
</script>

<template lang="pug">
  //- Non-interactive: the plaques are a readout, and a finger that lands on one
  //- is a finger aiming at the board behind it.
  div.conquest(v-if="rects" aria-hidden="false")
    div.conquest__plate.conquest__plate--you(
      :class="{ 'is-reached': youReached }"
      :style="{ ...boxStyle(rects.you), ...fontStyle(rects.you), backgroundImage: plate('you') }"
    )
      span.conquest__n {{ you }}
      span.conquest__label {{ t('canvas.you') }}
    div.conquest__plate.conquest__plate--foe(
      :class="{ 'is-reached': foeReached }"
      :style="{ ...boxStyle(rects.foe), ...fontStyle(rects.foe), backgroundImage: plate('foe'), '--foe': foeColor }"
    )
      span.conquest__label {{ t('canvas.foe') }}
      span.conquest__n {{ foe }}
</template>

<style lang="sass" scoped>
.conquest
  position: absolute
  inset: 0
  pointer-events: none

.conquest__plate
  position: absolute
  display: flex
  align-items: center
  justify-content: space-between
  padding: 0 0.55em
  gap: 0.4em
  border-radius: 999px
  font-family: 'Angry', sans-serif
  font-weight: 900
  line-height: 1
  white-space: nowrap
  // The CSS plate. It is what shows with the art flag off or the painting
  // missing, and it is drawn to match `arenaPainters.paintCounterPlate` — the
  // same object in two media, so switching the art layer never moves anything.
  background-color: rgba(10, 16, 32, 0.72)
  background-size: 100% 100%
  background-repeat: no-repeat
  background-position: center
  border: 2px solid var(--rim)
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 6px rgba(0, 0, 0, 0.5)

.conquest__plate--you
  --rim: rgba(79, 208, 255, 0.7)

.conquest__plate--foe
  --rim: var(--foe)

.conquest__n
  color: #ffffff
  // The canvas drew this with a stroked outline; a text-shadow ring is the
  // cheap DOM equivalent and survives over a painted plate.
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.95), 0 2px 0 rgba(0, 0, 0, 0.7)
  font-variant-numeric: tabular-nums

.conquest__label
  font-size: 0.7em
  letter-spacing: 0.04em
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.95), 0 2px 0 rgba(0, 0, 0, 0.7)

.conquest__plate--you .conquest__label
  color: #4fd0ff

.conquest__plate--foe .conquest__label
  color: var(--foe)

// At the conquest threshold the plaque goes gold: one side is a move away from
// taking the board, and that has to be visible without reading a number.
.is-reached
  --rim: #ffd23f
  animation: conquest-ready 1.1s ease-in-out infinite

  .conquest__n,
  .conquest__label
    color: #ffd23f

@keyframes conquest-ready
  0%, 100%
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 4px rgba(255, 210, 63, 0.5)
  50%
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 14px rgba(255, 210, 63, 0.95)

@media (prefers-reduced-motion: reduce)
  .is-reached
    animation: none
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 10px rgba(255, 210, 63, 0.8)
</style>
