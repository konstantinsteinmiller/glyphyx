<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconCoin from '@/components/icons/IconCoin.vue'
import RuneUnlockCard from '@/components/game/RuneUnlockCard.vue'
import { useArtImage } from '@/use/useArtImage'
import type { ChestReward } from '@/game/rules'

/**
 * ─── The rune chest ─────────────────────────────────────────────────────────
 *
 * The reward beat, on a screen of its own (`ChestOverlay`). The chest lands,
 * bounces, and asks for ONE tap; the tap is the celebration — coins burst
 * toward the wallet (the scene spawns them from this element), and whatever
 * the chest held slides up under it: the coins, a new rune's card, a new
 * material's card.
 *
 * The chest button is never `disabled`: a disabled button swallows the click
 * outright, and once the chest is open that click has to reach the overlay
 * behind it, which is what continues. `aria-disabled` says the same thing to a
 * screen reader without eating the event.
 *
 * It is a component of its own rather than markup in the overlay because the
 * chapter-end chest (`big`) and the ordinary one share every state and differ
 * only in size and glow.
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
    div.chest__main
      button.chest__btn(
        ref="rootEl"
        type="button"
        :aria-disabled="opened"
        :aria-label="t('result.chestTap')"
        @click="onTap"
      )
        //- The burst behind an opened chest: two rings and a glow.
        span.chest__burst(v-if="opened" aria-hidden="true")
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
          //- The lid: closed it is an arch over the body; open it tips back.
          path.chest__lid(d="M6 28 Q32 8 58 28 Z" fill="url(#chestLid)" stroke="#2a1607" stroke-width="2")
          rect(x="26" y="34" width="12" height="14" rx="2" fill="#fcd34d" stroke="#5a3408" stroke-width="1.5")
          circle(cx="32" cy="40" r="2" fill="#5a3408")
          rect(x="6" y="38" width="52" height="3" fill="#3a1d09" opacity="0.6")
          rect(x="6" y="50" width="52" height="3" fill="#3a1d09" opacity="0.6")
      span.chest__tap(v-if="!opened") {{ t('result.chestTap') }}
      Transition(name="loot")
        div.chest__coins(v-if="opened && reward.coins > 0")
          IconCoin.chest__coin
          span.chest__coins-value +{{ reward.coins }}

    //- What was inside, once it is open.
    Transition(name="loot")
      div.chest__loot(v-if="opened && (reward.unlockRune || reward.unlockSkin)")
        RuneUnlockCard(v-if="reward.unlockRune" :rune="reward.unlockRune")
        RuneUnlockCard(v-else-if="reward.unlockSkin" :skin="reward.unlockSkin")
</template>

<style scoped lang="sass">
.chest
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.3rem, 1.6vmin, 0.6rem)

.chest__main
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.3rem, 1.6vmin, 0.6rem)

.chest__btn
  position: relative
  display: block
  width: clamp(5rem, 26vmin, 8rem)
  height: clamp(5rem, 26vmin, 8rem)
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  animation: chest-bounce 0.9s ease-in-out infinite alternate

  &:active
    transform: scale(0.94)

.is-open .chest__btn
  cursor: default
  animation: chest-open 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) forwards

  &:active
    transform: none

.is-big .chest__btn
  width: clamp(6rem, 32vmin, 10rem)
  height: clamp(6rem, 32vmin, 10rem)

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

// The lid tips back around its hinge once opened.
.chest__lid
  transform-origin: 32px 28px
  transition: transform 0.35s cubic-bezier(0.2, 1.4, 0.4, 1)

.is-open .chest__lid
  transform: rotate(-38deg) translateY(-4px)

.chest__light
  animation: chest-light 0.6s ease-out

.chest__burst
  position: absolute
  inset: 0
  pointer-events: none

.chest__ring
  position: absolute
  inset: 10%
  border-radius: 50%
  border: 3px solid rgba(255, 217, 60, 0.9)
  animation: chest-ring 0.7s ease-out forwards

  &.is-late
    animation-delay: 0.12s
    border-color: rgba(255, 255, 255, 0.7)

.chest__tap
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.06em
  font-size: clamp(0.7rem, 3.4vmin, 1rem)
  text-shadow: 2px 2px 0 #000
  animation: tap-pulse 1.1s ease-in-out infinite

.chest__loot
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.3rem, 1.6vmin, 0.6rem)

.chest__coins
  display: inline-flex
  align-items: center
  gap: 0.35rem

.chest__coin
  width: clamp(1.3rem, 6vmin, 2rem)
  height: clamp(1.3rem, 6vmin, 2rem)
  object-fit: contain

.chest__coins-value
  color: #ffd93c
  font-weight: 900
  font-size: clamp(1.2rem, 6vmin, 2.1rem)
  line-height: 1
  text-shadow: 3px 3px 0 #000

@keyframes chest-bounce
  from
    transform: translateY(0) rotate(-2deg)
  to
    transform: translateY(-0.5rem) rotate(2deg)

@keyframes chest-open
  0%
    transform: scale(1)
  40%
    transform: scale(1.25)
  100%
    transform: scale(1.05)

@keyframes chest-ring
  from
    transform: scale(0.4)
    opacity: 1
  to
    transform: scale(2.4)
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

.loot-enter-active
  transition: opacity 0.35s ease 0.15s, transform 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) 0.15s
.loot-enter-from
  opacity: 0
  transform: translateY(0.8rem) scale(0.8)

// Landscape phone: the chest and its card side by side — a column would push
// the card under the fold.
@media (orientation: landscape) and (max-height: 30rem)
  .chest
    flex-direction: row
    align-items: center
    gap: clamp(0.6rem, 3vw, 1.4rem)

  .chest__btn
    width: clamp(4rem, 24vmin, 6rem)
    height: clamp(4rem, 24vmin, 6rem)

  .is-big .chest__btn
    width: clamp(4.6rem, 28vmin, 7rem)
    height: clamp(4.6rem, 28vmin, 7rem)

@media (prefers-reduced-motion: reduce)
  .chest__btn
    animation: none
</style>
