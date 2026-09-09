<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FReward from '@/components/atoms/FReward.vue'
import ChestReveal from '@/components/game/ChestReveal.vue'
import { CHEST_AUTO_CONTINUE_MS, type ChestReward } from '@/game/rules'
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

const chestRef = ref<InstanceType<typeof ChestReveal> | null>(null)
/** The chest element, for the scene's coin burst. */
const chestEl = (): HTMLElement | null => chestRef.value?.rootEl ?? null
defineExpose({ chestEl })

const canContinue = ref(false)
/** ms until the screen continues on its own. */
const autoLeftMs = ref(CHEST_AUTO_CONTINUE_MS)
const autoFraction = computed(() => Math.max(0, Math.min(1, autoLeftMs.value / CHEST_AUTO_CONTINUE_MS)))
/** `continue` has gone out for this opening — by tap or by the clock, never both. */
let fired = false
let settleTimer: number | null = null
let ticker: number | null = null

const stopTimers = (): void => {
  if (settleTimer !== null) clearTimeout(settleTimer)
  settleTimer = null
  if (ticker !== null) clearInterval(ticker)
  ticker = null
}

const fire = (): void => {
  if (fired) return
  fired = true
  emit('continue')
}

watch(() => [props.modelValue, props.opened] as const, ([open, opened]) => {
  stopTimers()
  canContinue.value = false
  autoLeftMs.value = CHEST_AUTO_CONTINUE_MS
  fired = false
  if (!(open && opened)) return
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
    @update:model-value="onModel"
    @continue="onContinue"
  )
    template(#ribbon)
      span.chest-overlay__ribbon {{ t('rewards') }}
    div.chest-overlay(v-if="reward")
      ChestReveal(
        ref="chestRef"
        :reward="reward"
        :opened="opened"
        @open="emit('open')"
      )
      //- The auto-continue clock: a thin bar that empties over the wait. Shown
      //- with the continue hint, so the two arrive together.
      Transition(name="auto")
        div.chest-overlay__auto(v-if="canContinue" aria-hidden="true")
          span.chest-overlay__auto-fill(:style="{ width: `${(autoFraction * 100).toFixed(1)}%` }")
</template>

<style scoped lang="sass">
.chest-overlay__ribbon
  display: block

.chest-overlay
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.6rem, 2.4vh, 1.1rem)
  width: 100%
  // Clear of the floating continue hint at the bottom of the overlay.
  padding-bottom: clamp(1.5rem, 8vh, 3.5rem)

// The clock. Its width follows the loot card rather than the screen so it
// reads as part of the reward, not as a loading bar for the game.
.chest-overlay__auto
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
  .chest-overlay
    gap: 0.4rem
    padding-bottom: 0

@media (prefers-reduced-motion: reduce)
  .chest-overlay__auto-fill
    transition: none
</style>
