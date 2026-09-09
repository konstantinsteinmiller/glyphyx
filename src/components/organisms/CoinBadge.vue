<script setup lang="ts">
import { ref } from 'vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import useEconomy from '@/use/useEconomy'

/**
 * The wallet. Every coin the game pays flies INTO this badge, so it is exposed
 * as the fly-to target for `spawnCoinExplosion` (the forge, the chest, the
 * result screen all aim at it).
 *
 * Sized fluidly — the old `w-7 sm:w-8` / `text-sm sm:text-base` pairs jumped at
 * one breakpoint and were wrong on either side of it; `clamp()` keeps the badge
 * legible on a 320 px phone and modest on a desktop without ever collapsing.
 */
const { coins } = useEconomy()

const rootEl = ref<HTMLElement | null>(null)
defineExpose({ rootEl })
</script>

<template lang="pug">
  div.coin-badge(ref="rootEl")
    div.coin-badge__icon
      IconCoin(class="coin-badge__coin w-5 h-5")
    span.game-text.coin-badge__value {{ coins }}
</template>

<style scoped lang="sass">
.coin-badge
  position: relative
  display: inline-flex
  align-items: center
  gap: clamp(0.25rem, 1.4vw, 0.5rem)
  // The badge must stay a real touch-height so the forge that hangs under it
  // has something to centre on, and never shrink to a sliver in a tight row.
  min-height: 2rem
  min-width: 4rem
  padding: clamp(0.15rem, 0.8vw, 0.25rem) clamp(0.55rem, 2.6vw, 0.85rem) clamp(0.15rem, 0.8vw, 0.25rem) clamp(0.2rem, 1vw, 0.3rem)
  border-radius: 999px
  background: linear-gradient(135deg, #50aaff 0%, #2266ff 50%, #1b3e95 100%)
  border: 2px solid #fcd34d
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.4)
  overflow: hidden

  &::before
    content: ''
    position: absolute
    inset: 0
    background: linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.35) 50%, transparent 65%)
    background-size: 250% 100%
    animation: coin-shine 3.5s linear infinite
    pointer-events: none

.coin-badge__icon
  display: flex
  align-items: center
  justify-content: center
  flex: 0 0 auto
  width: clamp(1.5rem, 6.5vw, 2rem)
  height: clamp(1.5rem, 6.5vw, 2rem)
  border-radius: 999px
  background: radial-gradient(circle at 30% 30%, #fff7b0 0%, #fcd34d 35%, #b8860b 100%)
  box-shadow: 0 0 8px rgba(252, 211, 77, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)
  border: 1px solid #78350f

// `IconCoin` is an <img>; without an explicit box it falls through to its
// intrinsic 128×128 and bursts out of the badge.
.coin-badge__icon .coin-badge__coin
  width: 72%
  height: 72%
  object-fit: contain
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.4))

.coin-badge__value
  position: relative
  color: #fff7d6
  font-weight: 900
  font-size: clamp(0.8rem, 3.6vw, 1.1rem)
  line-height: 1
  letter-spacing: 0.02em
  text-shadow: 0 1px 0 #000, 0 0 6px rgba(252, 211, 77, 0.7)

@keyframes coin-shine
  0%
    background-position: 200% 0
  100%
    background-position: -100% 0
</style>
