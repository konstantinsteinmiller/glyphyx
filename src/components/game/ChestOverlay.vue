<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FReward from '@/components/atoms/FReward.vue'
import ChestReveal from '@/components/game/ChestReveal.vue'
import RewardStage from '@/components/game/RewardStage.vue'
import RewardConfetti from '@/components/game/RewardConfetti.vue'
import { CHEST_AUTO_CONTINUE_MS, RUNES, SKINS, type ChestReward } from '@/game/rules'
import { isGamePaused } from '@/use/useGamePause'

/**
 * ─── The chest, on a screen of its own ──────────────────────────────────────
 *
 * The result screen used to hold the chest, its loot, the coins, the ×3 and
 * the actions all at once, and the moment the chest opened the whole thing
 * turned into a wall. Now the reward is a beat of its own: one overlay, one
 * chest, and once it is open ONLY what was inside — then a tap continues to
 * the result screen (or, on a tutorial node, straight into the next stage).
 *
 * ── This file is the conductor ──
 *
 * Three layers make the moment, and they are stacked here so the order is
 * decided in ONE place rather than guessed at by three components:
 *
 *   z 0  `RewardStage`     the light-and-dark rays behind everything
 *   z 2  the chest and the gift it hands over (`FReward`'s own frame)
 *   z 3  `RewardConfetti`  the fall, in front of the prize
 *
 * The two planes are handed to `FReward`'s `#stage` slot rather than rendered
 * inline — the frame scales its body in `fit` mode, and a transform would drag
 * a full-bleed layer along with it.
 *
 * Both decorative planes are `pointer-events: none`, which is what keeps
 * "click anywhere to continue" true: the tap falls straight through them to
 * `FReward`'s own overlay handler.
 *
 * They are also lit on a SCHEDULE rather than all on the frame of the tap. The
 * chest takes the hit first, the rays flare as the lid leaves, and the confetti
 * follows a beat later — a reveal that fires everything at once reads as a
 * glitch, not as a celebration. `BEATS` below is that schedule, and it is the
 * only place the timing lives.
 *
 * THE LOOT STAYS. Nothing here hands over on its own until the player has had
 * `CHEST_AUTO_CONTINUE_MS` to look at what they won — the thin bar under the
 * loot is that clock draining, so the hand-over never comes as a surprise. A
 * tap after the loot has settled continues sooner. Either way `continue` is
 * emitted exactly once per opening.
 *
 * The continue hint waits `SETTLE_MS` after the chest opens so a quick second
 * tap — the natural thing after "tap the chest!" — cannot skip the reward
 * before it has been seen. `FReward` only emits `continue` while its hint is
 * up, so the gate is one boolean. The clock freezes while the game is paused
 * (an ad, a hidden tab, a modal): a reward nobody is looking at does not tick.
 */
interface Props {
  modelValue: boolean
  reward: ChestReward | null
  opened: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'open'): void
  (e: 'continue'): void
}>()
const { t } = useI18n()

const SETTLE_MS = 600
/** The auto-continue clock advances in steps of this many ms. */
const TICK_MS = 100

/**
 * When each plane lights, in ms after the tap. The chest's own squash and its
 * shockwave own the first 60 ms alone; the rays flare as the lid leaves, and
 * the confetti is thrown a beat after that so it falls THROUGH the flare
 * rather than arriving with it.
 */
const BEATS = { stage: 90, confetti: 170 } as const

const chestRef = ref<InstanceType<typeof ChestReveal> | null>(null)
/** The chest element, for the scene's coin burst. */
const chestEl = (): HTMLElement | null => chestRef.value?.rootEl ?? null
defineExpose({ chestEl })

const canContinue = ref(false)
/** The rays have flared / the confetti has been thrown, for this opening. */
const stageLit = ref(false)
const confettiFired = ref(false)
/** ms until the screen continues on its own. */
const autoLeftMs = ref(CHEST_AUTO_CONTINUE_MS)
const autoFraction = computed(() => Math.max(0, Math.min(1, autoLeftMs.value / CHEST_AUTO_CONTINUE_MS)))
/** `continue` has gone out for this opening — by tap or by the clock, never both. */
let fired = false
let settleTimer: number | null = null
let ticker: number | null = null
/** The two beat timers, cleared with everything else. */
let beatTimers: number[] = []

/**
 * The prize's own colour, and the thread that ties the three layers together:
 * the rays behind it, the confetti falling over it and the card itself all
 * burn in the same light. Coins alone have no colour of their own, so they
 * keep the game's gold.
 */
const tone = computed<string>(() => {
  const r = props.reward
  if (!r) return '#ffd93c'
  if (r.unlockRune) return RUNES[r.unlockRune].color
  if (r.unlockSkin) return SKINS[r.unlockSkin].rim
  return '#ffd93c'
})

const stopTimers = (): void => {
  if (settleTimer !== null) clearTimeout(settleTimer)
  settleTimer = null
  if (ticker !== null) clearInterval(ticker)
  ticker = null
  for (const id of beatTimers) clearTimeout(id)
  beatTimers = []
}

const fire = (): void => {
  if (fired) return
  fired = true
  emit('continue')
}

watch(() => [props.modelValue, props.opened] as const, ([open, opened]) => {
  stopTimers()
  canContinue.value = false
  stageLit.value = false
  confettiFired.value = false
  autoLeftMs.value = CHEST_AUTO_CONTINUE_MS
  fired = false
  if (!(open && opened)) return

  // The sequence.
  beatTimers.push(window.setTimeout(() => { stageLit.value = true }, BEATS.stage))
  beatTimers.push(window.setTimeout(() => { confettiFired.value = true }, BEATS.confetti))

  settleTimer = window.setTimeout(() => {
    settleTimer = null
    canContinue.value = true
  }, SETTLE_MS)
  ticker = window.setInterval(() => {
    if (isGamePaused.value) return
    autoLeftMs.value = Math.max(0, autoLeftMs.value - TICK_MS)
    if (autoLeftMs.value > 0) return
    stopTimers()
    canContinue.value = true
    fire()
  }, TICK_MS)
}, { immediate: true })

onUnmounted(stopTimers)

const onModel = (v: boolean): void => emit('update:modelValue', v)
const onContinue = (): void => {
  if (!canContinue.value) return
  fire()
}
</script>

<template lang="pug">
  FReward(
    :model-value="modelValue"
    :show-continue="canContinue"
    fit
    @update:model-value="onModel"
    @continue="onContinue"
  )
    template(#ribbon)
      span.chest-overlay__ribbon {{ t('rewards') }}

    //- ── The full-bleed planes ────────────────────────────────────────────
    //- They go in `#stage`, NOT in the default slot: in `fit` mode the body's
    //- content is wrapped in a `scale()`, and a transform is a containing block
    //- for `position: fixed` — a ray plane in the default slot would be
    //- positioned against that wrapper and scaled with it, so it would be
    //- neither full-bleed nor still. See `FReward`'s own note.
    //-
    //- The order that matters is z, not DOM: `.reward-stage` is `z-index: auto`
    //- and therefore NOT a stacking context, so these two are compared directly
    //- against `.reward-frame` (z 2). The rays at 0 fall behind it, the confetti
    //- at 3 falls in front of the prize. Giving `.reward-stage` a z-index of its
    //- own would silently drop the confetti behind the gift.
    template(#stage)
      //- The plane arrives WITH the lid, not with the screen: a closed chest on a
      //- sunburst has already given the moment away, and the rays landing on the
      //- tap is what makes the tap feel like it did something.
      RewardStage(:active="opened" :burst="stageLit" :tone="tone")
      RewardConfetti(:burst="confettiFired" :tone="tone")

    div.chest-overlay(v-if="reward")
      div.chest-overlay__content
        ChestReveal(
          ref="chestRef"
          :reward="reward"
          :opened="opened"
          @open="emit('open')"
        )
        //- The auto-continue clock: a thin bar that empties over the wait.
        //- Shown with the continue hint, so the two arrive together.
        Transition(name="auto")
          div.chest-overlay__auto(v-if="canContinue" aria-hidden="true")
            span.chest-overlay__auto-fill(:style="{ width: `${(autoFraction * 100).toFixed(1)}%` }")
</template>

<style scoped lang="sass">
.chest-overlay__ribbon
  display: block

// The overlay's own box. It never scrolls and never grows: the composition
// inside is sized in `vmin`/`vh` so it fits, and if a translation ever pushed
// it, clipping is the honest failure rather than a scrollbar on a celebration.
.chest-overlay
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.4rem, 2vh, 0.9rem)
  width: 100%
  max-height: 100%
  min-height: 0

// The chest and its gift. The two decorative planes live in `FReward`'s stage
// slot and place themselves around this one, so all this layer has to do is
// hold the composition and be able to shrink.
.chest-overlay__content
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.4rem, 2vh, 0.9rem)
  width: 100%
  max-height: 100%
  min-height: 0

// The card runs its OWN entrance everywhere else it is used; inside this
// overlay the gift's rise is the entrance, and two of them compounding starts
// the stone at a fifth of its size. The prize group owns the arrival here.
.chest-overlay__content :deep(.unlock)
  animation: none

// The clock. Its width follows the loot card rather than the screen so it
// reads as part of the reward, not as a loading bar for the game.
.chest-overlay__auto
  flex: 0 0 auto
  width: min(72vw, 18rem)
  height: clamp(0.22rem, 0.7vmin, 0.4rem)
  border-radius: 999px
  background-color: rgba(255, 255, 255, 0.14)
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.6)
  overflow: hidden

.chest-overlay__auto-fill
  display: block
  height: 100%
  border-radius: inherit
  background: linear-gradient(to right, #ffd93c, #ff9a4a)
  box-shadow: 0 0 0.4rem rgba(255, 217, 60, 0.55)
  transition: width 120ms linear

.auto-enter-active, .auto-leave-active
  transition: opacity 260ms ease-out

.auto-enter-from, .auto-leave-to
  opacity: 0

@media (orientation: landscape) and (max-height: 30rem)
  .chest-overlay,
  .chest-overlay__content
    gap: 0.35rem

@media (prefers-reduced-motion: reduce)
  .chest-overlay__auto-fill
    transition: none
</style>
