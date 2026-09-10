<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconCoin from '@/components/icons/IconCoin.vue'
import RuneUnlockCard from '@/components/game/RuneUnlockCard.vue'
import { useArtImage } from '@/use/useArtImage'
import type { ChestReward } from '@/game/rules'

/**
 * ─── The rune chest, and the gift that comes out of it ──────────────────────
 *
 * The reward beat, on a screen of its own (`ChestOverlay`). The chest lands,
 * breathes, and asks for ONE tap — and the tap is an EVENT, not a fade:
 *
 *    0 ms  the tap. The chest takes the hit: a squash, and the lid flies.
 *   60 ms  a shockwave leaves the chest, two rings and a flash.
 *  140 ms  the PRIZE is born INSIDE the chest — small, at the lid's mouth —
 *          and climbs out onto its own plane, overshooting as it comes.
 *  200 ms  the chest, having told its story, shrinks and dims. It gives up
 *          its space as well as its brightness, which is what leaves room for
 *          the gift on a small screen.
 *  560 ms  the gift LANDS: a soft squash, and a floor of light under it.
 *
 * The two decorative planes — `RewardStage`'s rays behind and
 * `RewardConfetti` in front — are mounted by the overlay and lit on their own
 * beats, so the sequence is owned in one place rather than spread across three
 * components that each guess at the timing.
 *
 * ── The whole thing FITS ──
 *
 * Every dimension here is viewport-relative (`vmin` / `vh`), and the open
 * chest is deliberately smaller than the closed one: a reward the player has
 * to scroll to see is not a reward, and this screen has to hold a chest, a
 * coin line, a card and a continue hint on a 320×658 phone AND on a 844×390
 * one. In landscape the column becomes a row — a column there runs off the
 * bottom no matter how small the parts are.
 *
 * The chest button is never `disabled`: a disabled button swallows the click
 * outright, and once the chest is open that click has to reach the overlay
 * behind it, which is what continues. `aria-disabled` says the same thing to a
 * screen reader without eating the event.
 */
interface Props {
  reward: ChestReward
  opened: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'open'): void }>()
const { t } = useI18n()

/** The painted chest once the art layer has it; the SVG below otherwise. */
const painted = useArtImage('ui', 'chest')

const rootEl = ref<HTMLElement | null>(null)
defineExpose({ rootEl })

const onTap = (e: MouseEvent): void => {
  if (props.opened) return
  // The first tap is the chest's alone — the overlay behind must not read it
  // as "continue".
  e.stopPropagation()
  emit('open')
}
</script>

<template lang="pug">
  div.chest(:class="{ 'is-open': opened, 'is-big': reward.big }")
    //- ── The box ─────────────────────────────────────────────────────────
    div.chest__stage
      button.chest__btn(
        ref="rootEl"
        type="button"
        :aria-disabled="opened"
        :aria-label="t('result.chestTap')"
        @click="onTap"
      )
        //- The shockwave: two rings travelling out and a flash off the lid.
        span.chest__shock(v-if="opened" aria-hidden="true")
          span.chest__flash
          span.chest__ring
          span.chest__ring.is-late
        img.chest__art(v-if="painted" :src="painted" alt="" draggable="false")
        svg.chest__svg(v-else viewBox="0 0 64 64" aria-hidden="true")
          defs
            linearGradient(id="chestBody" x1="0" y1="0" x2="0" y2="1")
              stop(offset="0" stop-color="#a05a2c")
              stop(offset="1" stop-color="#5a2e10")
            linearGradient(id="chestLid" x1="0" y1="0" x2="0" y2="1")
              stop(offset="0" stop-color="#c0732e")
              stop(offset="1" stop-color="#7d4017")
            radialGradient(id="chestLight" cx="0.5" cy="0.6" r="0.5")
              stop(offset="0" stop-color="#fff3b0")
              stop(offset="1" stop-color="#ffb02e" stop-opacity="0")
          //- The glow that spills out once the lid is up.
          ellipse.chest__light(v-if="opened" cx="32" cy="30" rx="26" ry="14" fill="url(#chestLight)")
          rect(x="6" y="28" width="52" height="28" rx="3" fill="url(#chestBody)" stroke="#2a1607" stroke-width="2")
          //- The lid: closed it is an arch over the body; open it flies back.
          path.chest__lid(d="M6 28 Q32 8 58 28 Z" fill="url(#chestLid)" stroke="#2a1607" stroke-width="2")
          rect(x="26" y="34" width="12" height="14" rx="2" fill="#fcd34d" stroke="#5a3408" stroke-width="1.5")
          circle(cx="32" cy="40" r="2" fill="#5a3408")
          rect(x="6" y="38" width="52" height="3" fill="#3a1d09" opacity="0.6")
          rect(x="6" y="50" width="52" height="3" fill="#3a1d09" opacity="0.6")
      span.chest__tap(v-if="!opened") {{ t('result.chestTap') }}

    //- ── The gift, on its own plane ──────────────────────────────────────
    //- Born at the chest's mouth and carried out. `v-if` rather than a
    //- transition wrapper: the rise IS the entrance, and a Transition would
    //- fight the keyframes for the same transform.
    div.chest__prize(v-if="opened")
      span.chest__floor(aria-hidden="true")
      div.chest__coins(v-if="reward.coins > 0")
        IconCoin.chest__coin
        span.chest__coins-value +{{ reward.coins }}
      div.chest__loot(v-if="reward.unlockRune || reward.unlockSkin")
        RuneUnlockCard(v-if="reward.unlockRune" :rune="reward.unlockRune")
        RuneUnlockCard(v-else-if="reward.unlockSkin" :skin="reward.unlockSkin")
</template>

<style scoped lang="sass">
// ─── The composition ─────────────────────────────────────────────────────────
//
// A column that may never exceed the room it is given. `min-height: 0` on both
// the root and the prize is what lets the card shrink instead of pushing the
// bottom of the screen away — without it a flex child refuses to go below its
// content size and the overlay grows a scrollbar.
.chest
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.2rem, 1.4vmin, 0.5rem)
  width: 100%
  max-height: 100%
  min-height: 0

.chest__stage
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.2rem, 1.2vmin, 0.45rem)
  flex: 0 0 auto

// ─── The box ─────────────────────────────────────────────────────────────────

.chest__btn
  position: relative
  display: block
  width: clamp(4.2rem, 20vmin, 6.5rem)
  height: clamp(4.2rem, 20vmin, 6.5rem)
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  // The box AND its footprint shrink together — a transform alone would dim a
  // chest that still occupied a phone's worth of height.
  transition: width 420ms cubic-bezier(0.2, 0.9, 0.3, 1) 200ms, height 420ms cubic-bezier(0.2, 0.9, 0.3, 1) 200ms, opacity 420ms ease 200ms
  animation: chest-bounce 0.9s ease-in-out infinite alternate

  &:active
    transform: scale(0.94)

.is-big .chest__btn
  width: clamp(5rem, 25vmin, 8rem)
  height: clamp(5rem, 25vmin, 8rem)

// Opened: it takes the hit, then gets out of the way.
.is-open .chest__btn
  cursor: default
  width: clamp(2.4rem, 11vmin, 3.6rem)
  height: clamp(2.4rem, 11vmin, 3.6rem)
  opacity: 0.55
  animation: chest-jolt 520ms cubic-bezier(0.2, 1.5, 0.4, 1) forwards

  &:active
    transform: none

.is-open.is-big .chest__btn
  width: clamp(2.8rem, 13vmin, 4.2rem)
  height: clamp(2.8rem, 13vmin, 4.2rem)

.chest__art, .chest__svg
  position: relative
  display: block
  width: 100%
  height: 100%
  object-fit: contain
  user-select: none
  -webkit-user-drag: none
  pointer-events: none
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 10px rgba(255, 170, 30, 0.55))

.is-big .chest__art, .is-big .chest__svg
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 18px rgba(255, 200, 60, 0.9))

// The lid does not tip politely — it is thrown off its hinge.
.chest__lid
  transform-origin: 32px 28px
  transition: transform 0.35s cubic-bezier(0.2, 1.4, 0.4, 1)

.is-open .chest__lid
  animation: chest-lid 620ms cubic-bezier(0.15, 1.4, 0.35, 1) forwards

.chest__light
  animation: chest-light 0.6s ease-out

// ─── The shockwave ───────────────────────────────────────────────────────────

.chest__shock
  position: absolute
  inset: 0
  pointer-events: none

.chest__flash
  position: absolute
  inset: -30%
  border-radius: 50%
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(255, 217, 60, 0.5) 45%, transparent 70%)
  animation: chest-flash 340ms ease-out forwards

.chest__ring
  position: absolute
  inset: 10%
  border-radius: 50%
  border: 3px solid rgba(255, 217, 60, 0.9)
  animation: chest-ring 760ms ease-out 60ms forwards

  &.is-late
    animation-delay: 190ms
    border-color: rgba(255, 255, 255, 0.7)

.chest__tap
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.06em
  font-size: clamp(0.65rem, 3vmin, 0.95rem)
  text-shadow: 2px 2px 0 #000
  animation: tap-pulse 1.1s ease-in-out infinite

// ─── The gift ────────────────────────────────────────────────────────────────
//
// It starts inside the box — small, up at the lid's mouth — and climbs out
// onto its own plane, overshooting and settling. The whole group travels as
// ONE object, so the coins and the card arrive as a single gift rather than as
// two things that happened to fade in together.
.chest__prize
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.2rem, 1.4vmin, 0.5rem)
  flex: 0 1 auto
  min-height: 0
  transform-origin: 50% 0%
  animation: prize-rise 620ms cubic-bezier(0.16, 1.5, 0.32, 1) 140ms both

// The light the gift comes to rest on. It spreads as the gift lands, so the
// landing has a floor rather than simply stopping in mid-air.
.chest__floor
  position: absolute
  left: 50%
  top: 0
  width: min(78vw, 22rem)
  height: clamp(2.5rem, 14vmin, 5rem)
  translate: -50% -35%
  border-radius: 50%
  background: radial-gradient(ellipse at center, rgba(255, 240, 190, 0.5), rgba(255, 200, 80, 0.16) 45%, transparent 72%)
  pointer-events: none
  z-index: -1
  animation: prize-floor 700ms ease-out 320ms both

.chest__loot
  display: flex
  flex-direction: column
  align-items: center
  min-height: 0
  gap: clamp(0.2rem, 1.4vmin, 0.5rem)

.chest__coins
  display: inline-flex
  align-items: center
  gap: 0.35rem

.chest__coin
  width: clamp(1.1rem, 5vmin, 1.8rem)
  height: clamp(1.1rem, 5vmin, 1.8rem)
  object-fit: contain

.chest__coins-value
  color: #ffd93c
  font-weight: 900
  font-size: clamp(1rem, 5vmin, 1.9rem)
  line-height: 1
  text-shadow: 3px 3px 0 #000

// ─── The beats ───────────────────────────────────────────────────────────────

@keyframes chest-bounce
  from
    transform: translateY(0) rotate(-2deg)
  to
    transform: translateY(-0.5rem) rotate(2deg)

// The box takes the hit: squashed, kicked up, then set back down small.
@keyframes chest-jolt
  0%
    transform: scale(1, 1)
  18%
    transform: scale(1.22, 0.82) translateY(0.1rem)
  42%
    transform: scale(0.94, 1.14) translateY(-0.5rem)
  70%
    transform: scale(1.04, 0.98) translateY(0)
  100%
    transform: scale(1) translateY(0)

@keyframes chest-lid
  0%
    transform: rotate(0) translateY(0)
  35%
    transform: rotate(-62deg) translateY(-8px)
  100%
    transform: rotate(-44deg) translateY(-5px)

@keyframes chest-flash
  0%
    opacity: 0
    transform: scale(0.35)
  25%
    opacity: 1
    transform: scale(1)
  100%
    opacity: 0
    transform: scale(1.7)

@keyframes chest-ring
  from
    transform: scale(0.35)
    opacity: 1
  to
    transform: scale(3)
    opacity: 0

@keyframes chest-light
  from
    opacity: 0
    transform: scale(0.3)
  to
    opacity: 1
    transform: scale(1)

@keyframes tap-pulse
  0%, 100%
    opacity: 1
    transform: scale(1)
  50%
    opacity: 0.6
    transform: scale(1.06)

// Out of the box, over the top, and down onto its plane — the last two frames
// are the landing squash, which is what makes it feel like it has weight.
@keyframes prize-rise
  0%
    opacity: 0
    transform: translateY(-46%) scale(0.24)
  35%
    opacity: 1
  72%
    transform: translateY(2%) scale(1.07)
  88%
    transform: translateY(0) scale(0.98, 1.02)
  100%
    opacity: 1
    transform: translateY(0) scale(1)

@keyframes prize-floor
  0%
    opacity: 0
    scale: 0.3 0.6
  45%
    opacity: 1
    scale: 1.06 1
  100%
    opacity: 0.75
    scale: 1 1

// ─── Landscape phone ─────────────────────────────────────────────────────────
//
// The chest and its gift side by side. A column here runs off the bottom
// however small the parts are, so the gift is carried sideways OUT of the box
// instead of upward.
@media (orientation: landscape) and (max-height: 30rem)
  .chest
    flex-direction: row
    align-items: center
    justify-content: center
    gap: clamp(0.5rem, 3vw, 1.2rem)

  .chest__btn
    width: clamp(3.4rem, 20vmin, 5rem)
    height: clamp(3.4rem, 20vmin, 5rem)

  .is-big .chest__btn
    width: clamp(4rem, 24vmin, 5.8rem)
    height: clamp(4rem, 24vmin, 5.8rem)

  .is-open .chest__btn,
  .is-open.is-big .chest__btn
    width: clamp(2.2rem, 12vmin, 3.2rem)
    height: clamp(2.2rem, 12vmin, 3.2rem)

  .chest__prize
    transform-origin: 0% 50%
    animation-name: prize-rise-side

  .chest__floor
    display: none

@keyframes prize-rise-side
  0%
    opacity: 0
    transform: translateX(-42%) scale(0.24)
  35%
    opacity: 1
  72%
    transform: translateX(2%) scale(1.07)
  88%
    transform: translateX(0) scale(1.02, 0.98)
  100%
    opacity: 1
    transform: translateX(0) scale(1)

// ─── Reduced motion ──────────────────────────────────────────────────────────
//
// The same information, none of the travel: the gift appears where it belongs,
// the box is already small, and nothing flies, spins or overshoots.
@media (prefers-reduced-motion: reduce)
  .chest__btn,
  .chest__lid,
  .chest__flash,
  .chest__ring,
  .chest__light,
  .chest__tap
    animation: none

  .chest__btn
    transition: none

  .is-open .chest__lid
    transform: rotate(-44deg) translateY(-5px)

  .chest__prize
    animation: prize-fade 220ms ease-out both

  .chest__floor
    animation: none
    opacity: 0.75

@keyframes prize-fade
  from
    opacity: 0
  to
    opacity: 1
</style>
