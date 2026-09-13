<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onArtChanged, spriteFor } from '@/game/art'
import ArtIcon from '@/components/icons/ArtIcon.vue'
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

/**
 * ─── Fill the bar to win ────────────────────────────────────────────────────
 *
 * This used to be two numbers — "4 YOU" and "FOE 5" — and a number is a thing
 * you have to do arithmetic with. Five rounds of blind testers never once said
 * they knew whether they were winning. One of them could not even reconcile the
 * counters with the board in front of her: "the YOU/FOE tile-count numbers
 * never matched the number of tiles I could actually see" (2026-09-13). She was
 * not wrong — tiles are owned by standing on them AND by the two home rows, so
 * counting the stones gives a different answer to counting the tiles.
 *
 * So the numbers stop being the message. Each side gets a TRACK with the crown
 * at the end of it, and the whole rule becomes one sentence a six-year-old can
 * act on: *fill your bar to the crown*. Both tracks grow toward the middle of
 * the screen, so the pair also reads as a tug of war at a glance, and the side
 * that is ahead is simply the one whose bar is longer — no counting, no
 * comparing, nothing to remember between turns.
 *
 * The numbers stay, small, inside the track. They are no longer the thing being
 * read, they cannot disagree with the bar beside them (same source, same
 * element), and a player who wants the exact figure still has it.
 */
const pct = (n: number): string =>
  `${Math.max(0, Math.min(1, n / CONQUEST_TILES)) * 100}%`

/** Who is ahead right now — the only comparison the player should ever make. */
const youLead = computed(() => props.you > props.foe)
const foeLead = computed(() => props.foe > props.you)
</script>

<template lang="pug">
  //- Non-interactive: the plaques are a readout, and a finger that lands on one
  //- is a finger aiming at the board behind it.
  div.conquest(v-if="rects" aria-hidden="false")
    //- Yours: the bar grows toward the crown in the middle.
    div.conquest__plate.conquest__plate--you(
      :class="{ 'is-reached': youReached, 'is-lead': youLead }"
      :style="{ ...boxStyle(rects.you), ...fontStyle(rects.you), backgroundImage: plate('you') }"
      role="img"
      :aria-label="`${t('canvas.you')}: ${t('hud.tiles', { n: you, total: CONQUEST_TILES })}`"
    )
      span.conquest__n(aria-hidden="true") {{ you }}
      span.conquest__track(aria-hidden="true")
        span.conquest__fill(:style="{ width: pct(you) }")
      span.conquest__crown(aria-hidden="true")
        ArtIcon(kind="ui" id="crown" fallback="trophy")
    //- Theirs: mirrored, so the two bars race toward each other.
    div.conquest__plate.conquest__plate--foe(
      :class="{ 'is-reached': foeReached, 'is-lead': foeLead }"
      :style="{ ...boxStyle(rects.foe), ...fontStyle(rects.foe), backgroundImage: plate('foe'), '--foe': foeColor }"
      role="img"
      :aria-label="`${t('canvas.foe')}: ${t('hud.tiles', { n: foe, total: CONQUEST_TILES })}`"
    )
      span.conquest__crown(aria-hidden="true")
        ArtIcon(kind="ui" id="crown" fallback="trophy")
      span.conquest__track(aria-hidden="true")
        span.conquest__fill.is-foe(:style="{ width: pct(foe) }")
      span.conquest__n(aria-hidden="true") {{ foe }}
</template>

<style lang="sass" scoped>
.conquest
  position: absolute
  inset: 0
  pointer-events: none

// ── Why the pair sits in the MIDDLE ──
//
// It used to be `space-between`, which pinned the number to one end of the
// plaque and the caption to the other. Both ends of a pill are its rounded
// caps, so the two things you actually have to read were sitting on the one
// part of the plate that is curving away, dimmest and narrowest — and on the
// painted plaque, right on its bevel. The middle is flat, evenly lit and has
// the room; the pair goes there as one group, and the plate's width becomes
// breathing space rather than a gap that pushes them apart.
//
// The ORDER still mirrors the board: the player's number is on the left of its
// pair and the enemy's on the right of its own, so each count sits on the side
// of the screen that side is playing from.
.conquest__plate
  position: absolute
  display: flex
  align-items: center
  justify-content: center
  padding: 0 0.45em
  gap: 0.3em
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

// ── The track: the thing that is actually read ──
//
// A trough with a fill and a crown at the end of it. The fill is the ONLY
// moving part, so a tile won or lost is a visible jump rather than a digit
// that changed while nobody was looking.
.conquest__track
  position: relative
  flex: 1 1 auto
  min-width: 0
  height: 0.42em
  border-radius: 999px
  background-color: rgba(0, 0, 0, 0.55)
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.7)
  overflow: hidden

.conquest__fill
  position: absolute
  top: 0
  bottom: 0
  left: 0
  border-radius: 999px
  background-image: linear-gradient(to bottom, #a0f0ff, #4fd0ff)
  box-shadow: 0 0 0.3em rgba(79, 208, 255, 0.8)
  // Slow enough to SEE, fast enough not to lag the board.
  transition: width 280ms ease-out

  &.is-foe
    left: auto
    right: 0
    background-image: linear-gradient(to bottom, #ff8a72, #ec1f22)
    box-shadow: 0 0 0.3em rgba(236, 31, 34, 0.75)

// The goal, at the end of the bar it belongs to. A crown you are filling
// toward says "win" without a word or a number in it.
.conquest__crown
  display: block
  flex: 0 0 auto
  width: 0.9em
  height: 0.9em
  color: rgba(255, 217, 60, 0.45)
  filter: drop-shadow(0 1px 0 #000)
  transition: color 200ms ease, transform 200ms ease

// ── Who is ahead, without a comparison ──
//
// The leader's plate lifts out of the dark and its crown lights. Two bars and
// one lit crown answer "am I winning" in a glance, which is the whole point.
.conquest__plate.is-lead
  border-color: rgba(255, 217, 60, 0.75)

  .conquest__crown
    color: #ffd93c
    transform: scale(1.12)

.conquest__plate--you
  --rim: rgba(79, 208, 255, 0.7)

.conquest__plate--foe
  --rim: var(--foe)

// A ring of dark offsets, not a blur.
//
// One soft shadow under light type on a mid-value painted stone is worth
// almost nothing — it darkens the plate a little and leaves the glyph edges
// touching it. Four hard offsets plus one tight blur give every edge its own
// contrast, which is what the canvas did with `strokeText` before this became
// DOM, and it is the difference between a caption you read and one you decode.
$ink: 0 0 2px rgba(4, 8, 18, 0.98), 1px 0 0 rgba(4, 8, 18, 0.92), -1px 0 0 rgba(4, 8, 18, 0.92), 0 1px 0 rgba(4, 8, 18, 0.92), 0 -1px 0 rgba(4, 8, 18, 0.92), 0 2px 3px rgba(0, 0, 0, 0.65)

.conquest__n
  // Demoted on purpose: the bar is the message, this is the footnote. It rides
  // inside the same plate so the two can never tell different stories, which
  // is what the old pair of big numbers did against the board.
  flex: 0 0 auto
  font-size: 0.66em
  color: rgba(255, 255, 255, 0.82)
  text-shadow: $ink
  font-variant-numeric: tabular-nums

.conquest__label
  font-size: 0.62em
  letter-spacing: 0.05em
  // The caption is the quieter half of the pair — the number is the readout,
  // the word only says whose it is — so it takes a little of the plate back.
  opacity: 0.92
  text-shadow: $ink

// The caption keeps the side's hue but lightened well past it: a saturated
// mid-tone word on a mid-tone plate is the lowest-contrast thing the HUD had.
// Whose plaque it is was never carried by the caption's colour anyway — the
// rim, the position and the word itself all say it already.
.conquest__plate--you .conquest__label
  color: #cdeeff

.conquest__plate--foe .conquest__label
  color: #ffe2ea

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
