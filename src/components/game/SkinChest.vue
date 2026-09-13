<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PebblePreview from '@/components/game/PebblePreview.vue'
import RuneUnlockCard from '@/components/game/RuneUnlockCard.vue'
import { useSkinChest } from '@/use/useSkinChest'
import { equipSkin } from '@/use/useSkins'
import { playFx } from '@/use/useGameAudio'
import type { SkinId } from '@/game/rules'

/**
 * ─── The skin chest, on the wallet column ───────────────────────────────────
 *
 * A free material every ten minutes. It sits under the forge because the two
 * are the same promise — *wait, and the game gives you something* — and a
 * player who has learned to tap one has learned to tap the other. The forge
 * pays coins into the wallet above it; this pays a stone into the shop.
 *
 * ── What it shows ──
 *
 * The actual material it is about to give, drawn by the same `PebblePreview`
 * the shop and the board use, so the thing wanted and the thing won are one
 * drawing. While it counts down the stone sits behind a shutter that drains as
 * the wait passes — the forge's own device, for the same reason: a chest that
 * only shows a number makes the player read, and a chest that visibly fills
 * makes them look.
 *
 * ── When it is ready ──
 *
 * Gold. Everything else on this column is iron and coin-yellow, so a gold ring
 * with a slow breath on it is the one thing on the HUD that means "there is
 * something here for you". It is the loudest state in the component and it is
 * meant to be: a reward nobody notices is a reward nobody collects.
 *
 * Hidden entirely once all nine materials are owned — a chest with nothing in
 * it is a countdown to nothing.
 */
const { t } = useI18n()
const { isReady, fill01, timeDisplay, hasRewards, nextSkin, collect } = useSkinChest()

/**
 * The material just won, held up to be looked at.
 *
 * It used to be held only for a flash of animation on the chest itself, which
 * meant the chest gave a player something and never said what: two blind
 * testers tapped it and came away not knowing. Aisha — "it just went
 * dark/disabled with no visible popup… not sure what TAKE actually gave me";
 * Camila noticed only the side effect, "it silently reskinned the whole board"
 * (2026-09-13). The loud half worked — the gold halo got all three of them to
 * press an unlabelled button — and then the moment the mechanic had to sell
 * itself was silent.
 *
 * So the prize is shown on the same card the reward chest uses for a new rune,
 * which those testers call the clearest teaching in the game. Dismissed by a
 * tap or by its own clock, whichever comes first.
 */
const won = ref<SkinId | null>(null)
let wonTimer: number | null = null
const WON_MS = 2600

const onClick = (): void => {
  const got = collect()
  if (got === null) {
    playFx('uiReject')
    return
  }
  // Wear it at once. A material won and not seen is a number in a menu; the
  // next stone the player places is the reward, which is the whole point.
  equipSkin(got)
  playFx('skinBuy')
  won.value = got
  if (wonTimer !== null) window.clearTimeout(wonTimer)
  wonTimer = window.setTimeout(dismiss, WON_MS)
}

const dismiss = (): void => {
  won.value = null
  if (wonTimer !== null) { window.clearTimeout(wonTimer); wonTimer = null }
}

onBeforeUnmount(() => { if (wonTimer !== null) window.clearTimeout(wonTimer) })

/**
 * This component has two roots — a `Teleport` for the prize card and the
 * button itself — so Vue cannot decide which one an inherited `class` belongs
 * to, and drops it with a warning nobody reads. A parent that wrote
 * `SkinChest.scene__chest` got nothing, which is how the HUD column ended up
 * spacing this against a rule that never applied.
 *
 * So the button takes them, explicitly. Anything a parent puts on this
 * component lands on the thing a parent means: the chest.
 */
defineOptions({ inheritAttrs: false })
</script>

<template lang="pug">
  //- ── The prize, held up ──────────────────────────────────────────────────
  //- Teleported to the body so it is not clipped by the HUD column it lives
  //- in, and so its stacking has nothing to do with the badges around it.
  //- Dismissed by a tap anywhere or by its own clock.
  Teleport(to="body")
    Transition(name="won")
      div.won(v-if="won !== null" role="status" @click="dismiss")
        RuneUnlockCard.won__card(:skin="won")

  //- A real button: reachable by keyboard, and its label says which of the two
  //- states it is in rather than leaving a screen reader to read a countdown.
  button.chest(
    v-if="hasRewards"
    v-bind="$attrs"
    type="button"
    :class="{ 'is-ready': isReady, 'is-won': won !== null }"
    :disabled="!isReady"
    :aria-label="isReady ? t('skinChest.ready') : t('skinChest.waiting', { time: timeDisplay })"
    @click="onClick"
  )
    span.chest__halo(v-if="isReady" aria-hidden="true")
    span.chest__stone(aria-hidden="true")
      PebblePreview(v-if="nextSkin" type="melee" :skin="nextSkin" :level="1" :animated="isReady")
      //- The shutter: a dark plate over the stone that drains as the wait
      //- passes, so a chest halfway through reads as half full at a glance.
      span.chest__shutter(v-if="!isReady" :style="{ height: `${(1 - fill01) * 100}%` }")
    div.chest__label(aria-hidden="true")
      span.chest__timer(v-if="!isReady") {{ timeDisplay }}
      span.chest__take(v-else) {{ t('skinChest.take') }}
</template>

<style scoped lang="sass">
// ─── The prize, held up ──────────────────────────────────────────────────────
.won
  position: fixed
  inset: 0
  z-index: 120
  display: flex
  align-items: center
  justify-content: center
  padding: 1rem
  background-color: rgba(4, 6, 14, 0.86)
  cursor: pointer

.won__card
  animation: won-in 420ms cubic-bezier(0.22, 1.2, 0.36, 1)

.won-enter-active, .won-leave-active
  transition: opacity 200ms ease

.won-enter-from, .won-leave-to
  opacity: 0

@keyframes won-in
  0%
    transform: scale(0.7) translateY(0.6rem)
  100%
    transform: scale(1) translateY(0)

.chest
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1rem
  width: clamp(2.6rem, 11vw, 3.4rem)
  padding: 0
  border: 0
  background: none
  pointer-events: auto
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  cursor: default

  &:not(:disabled)
    cursor: pointer

  &:not(:disabled):active .chest__stone
    transform: translateY(2px) scale(0.94)

.chest__stone
  position: relative
  display: block
  width: clamp(2.1rem, 9vw, 2.8rem)
  height: clamp(2.1rem, 9vw, 2.8rem)
  border-radius: 50%
  overflow: hidden
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))
  transition: transform 120ms ease-out

// The drain, over the stone, falling as the wait passes.
.chest__shutter
  position: absolute
  left: 0
  right: 0
  top: 0
  background-color: rgba(4, 6, 14, 0.68)
  transition: height 400ms linear
  pointer-events: none

// ─── Ready: the one gold thing on the column ─────────────────────────────────
//
// A ring that breathes rather than flashes. The column already carries a coin
// badge and a streak flame, both warm, so the chest earns its attention with
// MOVEMENT and a halo behind it instead of with more yellow.
.chest__halo
  position: absolute
  left: 50%
  top: calc(clamp(2.1rem, 9vw, 2.8rem) / 2)
  width: clamp(3.2rem, 13vw, 4.2rem)
  height: clamp(3.2rem, 13vw, 4.2rem)
  translate: -50% -50%
  border-radius: 50%
  background: radial-gradient(circle, rgba(255, 210, 63, 0.55) 0%, rgba(255, 160, 26, 0.22) 45%, transparent 70%)
  pointer-events: none
  animation: chest-breathe 2.4s ease-in-out infinite

.chest.is-ready .chest__stone
  border: 2px solid #ffd23f
  box-shadow: 0 0 0.5rem rgba(255, 210, 63, 0.9), inset 0 0 0.4rem rgba(255, 210, 63, 0.5)
  animation: chest-bob 2.4s ease-in-out infinite

// The beat after it is opened: the won stone flares before the chest goes.
.chest.is-won .chest__stone
  animation: chest-pop 600ms ease-out

.chest__label
  display: flex
  align-items: center
  justify-content: center
  min-height: 0.9em
  line-height: 1

.chest__timer
  color: #9fb0cc
  font-weight: 800
  font-size: clamp(0.5rem, 2.2vw, 0.66rem)
  font-variant-numeric: tabular-nums
  text-shadow: 1px 1px 0 #000

.chest__take
  color: #ffd23f
  font-weight: 900
  font-size: clamp(0.5rem, 2.2vw, 0.66rem)
  text-transform: uppercase
  letter-spacing: 0.04em
  text-shadow: 1px 1px 0 #000

@keyframes chest-breathe
  0%, 100%
    opacity: 0.45
    scale: 0.92
  50%
    opacity: 0.9
    scale: 1.06

@keyframes chest-bob
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(-2px)

@keyframes chest-pop
  0%
    transform: scale(1)
  35%
    transform: scale(1.25)
  100%
    transform: scale(1)

@media (prefers-reduced-motion: reduce)
  .chest__halo,
  .chest.is-ready .chest__stone,
  .chest.is-won .chest__stone,
  .won__card
    animation: none

  // Still unmistakably ready — it simply stops moving.
  .chest__halo
    opacity: 0.8
</style>
