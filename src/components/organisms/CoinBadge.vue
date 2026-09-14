<script setup lang="ts">
import { ref } from 'vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import useEconomy from '@/use/useEconomy'
import { registerAdChordTap, type AdChordSource } from '@/use/useAdChord'

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

// The badge doubles as the hidden QA trigger: 30 consecutive taps force an
// interstitial past the pacing clock, so a portal reviewer can see one on
// demand instead of having to play past the tutorial and win at the right
// moment. Silent by design — no counter, no feedback until the ad opens.
// See `useAdChord.ts`. Both listeners are bound; the module counts each
// physical tap once.
const onChordTap = (source: AdChordSource): void => { registerAdChordTap(source) }
</script>

<template lang="pug">
  div.coin-badge(
    ref="rootEl"
    @pointerdown="onChordTap('pointer')"
    @click="onChordTap('click')"
  )
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
  // NEVER SHRINK. On a landscape phone `.scene__player` turns into a row, and
  // a flex item's default `flex-shrink: 1` let this badge be squeezed narrower
  // than its own number — which `overflow: hidden` (there for the sheen) then
  // cut off, so a six-figure wallet rendered as "148". The row wraps instead;
  // see `.scene__player`.
  flex: 0 0 auto
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
  // The badge is the QA ad chord's trigger (see the script block), so thirty
  // fast taps have to land as thirty taps: `manipulation` drops the
  // double-tap-zoom wait on touch, and suppressing selection stops the rapid
  // clicking from turning the wallet into a highlighted text run.
  touch-action: manipulation
  -webkit-user-select: none
  user-select: none
  -webkit-tap-highlight-color: transparent

  // The sheen sweeps by TRANSFORM, not by `background-position`.
  // Background-position is not a compositable property: animating it repaints
  // the badge every frame for the life of the session. Translating an
  // over-wide gradient behind the badge's `overflow: hidden` looks the same
  // and is the one animation here that had a genuinely free fix.
  &::before
    content: ''
    position: absolute
    top: 0
    bottom: 0
    left: 0
    width: 250%
    background: linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.35) 50%, transparent 65%)
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
  // The wallet reaches six figures; wrapping it inside a pill would break the
  // badge's height rather than its width, which is worse.
  white-space: nowrap
  color: #fff7d6
  font-weight: 900
  font-size: clamp(0.8rem, 3.6vw, 1.1rem)
  line-height: 1
  letter-spacing: 0.02em
  text-shadow: 0 1px 0 #000, 0 0 6px rgba(252, 211, 77, 0.7)

@keyframes coin-shine
  0%
    transform: translateX(-100%)
  100%
    transform: translateX(0%)
</style>
