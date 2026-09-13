<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconCoin from '@/components/icons/IconCoin.vue'
import useEconomy from '@/use/useEconomy'
import { useRuneForge } from '@/use/useRuneForge'
import { spawnCoinExplosion } from '@/use/useCoinExplosion'
import { playFx } from '@/use/useGameAudio'

/**
 * The offline Rune Forge, on the wallet column.
 *
 * Everything about WHEN it pays and HOW MUCH lives in `useRuneForge.ts`; this
 * file is the forge itself — the drawn anvil with its glowing rune, the drain
 * that shows how full it is, the payout chip under it, and the coins that fly
 * to the badge when it is tapped.
 *
 * It sits UNDER the coin badge because that is where its coins go: the payout
 * is a short journey the eye can follow rather than a number that changes.
 */
interface Props {
  /** Element the coin explosion flies to (the coin badge). */
  targetEl?: HTMLElement | null
}
const props = withDefaults(defineProps<Props>(), { targetEl: null })

const { t } = useI18n()
const { addCoins } = useEconomy()
const { accrued, fill01, isReady, isFull, timeDisplay, ratePerHour, collect } = useRuneForge()

const rootEl = ref<HTMLElement | null>(null)

const onClick = (): void => {
  const won = collect()
  if (won <= 0) {
    playFx('uiReject')
    return
  }
  addCoins(won)
  playFx('forge')
  if (rootEl.value && props.targetEl) {
    spawnCoinExplosion({
      sourceEl: rootEl.value,
      targetEl: props.targetEl,
      count: Math.min(40, 10 + Math.round(won / 3))
    })
  }
}
</script>

<template lang="pug">
  //- A real button: it is reached by keyboard and a screen reader is told which
  //- of the three states it is in — the count on the chip is announced as
  //- nothing at all.
  button.forge(
    type="button"
    ref="rootEl"
    :class="{ 'is-ready': isReady, 'is-full': isFull }"
    :disabled="!isReady"
    :aria-label="isReady ? t('forge.ready', { n: accrued }) : (isFull ? t('forge.full') : t('forge.filling'))"
    @click="onClick"
  )
    //- The drawing: an anvil on a stone block with a rune glowing on its face,
    //- an ember sitting on the horn. Drop-in paintable later (`art-todo.md`);
    //- for now the SVG is the whole thing.
    svg.forge__svg(viewBox="0 0 64 64" aria-hidden="true")
      defs
        linearGradient(id="forgeIron" x1="0" y1="0" x2="0" y2="1")
          stop(offset="0" stop-color="#6c7791")
          stop(offset="1" stop-color="#252b3b")
        linearGradient(id="forgeBlock" x1="0" y1="0" x2="0" y2="1")
          stop(offset="0" stop-color="#5a4130")
          stop(offset="1" stop-color="#2b1d13")
        radialGradient(id="forgeGlow" cx="0.5" cy="0.5" r="0.5")
          stop(offset="0" stop-color="#ffd23f" stop-opacity="0.95")
          stop(offset="1" stop-color="#ff7a1a" stop-opacity="0")
        clipPath(id="forgeClip")
          path(d="M8 22h48v9H39l4.5 12H20.5L25 31H8z")
          rect(x="18" y="44" width="28" height="12" rx="2")
      //- The stone block.
      rect(x="18" y="44" width="28" height="12" rx="2" fill="url(#forgeBlock)" stroke="#12100d" stroke-width="2")
      //- The anvil.
      path(d="M8 22h48v9H39l4.5 12H20.5L25 31H8z" fill="url(#forgeIron)" stroke="#12100d" stroke-width="2" stroke-linejoin="round")
      //- The rune carved into its face, lit by the forge.
      circle.forge__glow(cx="32" cy="36" r="9" fill="url(#forgeGlow)")
      path.forge__rune(d="M32 27.5l1.6 2.6-1.6 6-1.6-6zM28.6 36.5h6.8v1.8h-6.8z" fill="#fff2b0")
      //- The ember on the horn.
      path.forge__spark(d="M50 12l1.4 3.4 3.4 1.4-3.4 1.4L50 21.6l-1.4-3.4-3.4-1.4 3.4-1.4z" fill="#ffd23f")
      //- The drain: a dark shutter clipped to the forge's own outline that
      //- rises as the forge fills, so an empty forge reads as cold iron and a
      //- full one as lit.
      rect.forge__shutter(x="0" :y="64 * fill01" width="64" :height="64 * (1 - fill01)" fill="rgba(4, 6, 14, 0.62)" clip-path="url(#forgeClip)")

    //- Status label: a countdown while it forges, the payout once it is ready.
    //- Both sit in the same slot so the footprint never jumps.
    div.forge__label(aria-hidden="true")
      span.forge__timer(v-if="!isReady") {{ timeDisplay }}
      span.forge__payout(v-else :class="{ 'is-full': isFull }")
        IconCoin.forge__coin
        span.forge__value +{{ accrued }}
    span.sr-only {{ t('forge.perHour', { n: ratePerHour }) }}
</template>

<style scoped lang="sass">
// ── The anvil and its chip are ONE box ──
//
// The chip used to hang below the button out of flow, which meant the column
// this sits in reserved not one pixel for it and whatever came next wore it:
// the skin chest's gold halo landed straight on the forge's countdown. The
// compensating margin lived two files away, on a class Vue was silently
// dropping (see `SkinChest`), so the whole arrangement was held together by a
// rule that never applied.
//
// So the button owns both, stacked, exactly the way the skin chest below it
// already does — two collectables that behave alike are one thing to learn,
// and now they are laid out alike too. The tap target growing to include the
// chip is a bonus on a phone, not a cost.
.forge
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1rem
  width: clamp(2.6rem, 11vw, 3.4rem)
  min-width: 2.6rem
  padding: 0
  border: 0
  background: none
  pointer-events: auto
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  cursor: default

  &:not(:disabled)
    cursor: pointer

  &:not(:disabled):active
    transform: translateY(2px) scale(0.94)

.forge__svg
  display: block
  width: 100%
  height: clamp(2.6rem, 11vw, 3.4rem)
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))

.forge__shutter
  transition: y 0.4s linear, height 0.4s linear

.forge__glow
  animation: forge-glow 2.2s ease-in-out infinite

.forge__spark
  transform-origin: 50px 16.8px
  animation: forge-spark 1.6s ease-in-out infinite

.is-ready .forge__svg
  animation: forge-bob 1s ease-in-out infinite alternate
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 8px rgba(255, 160, 0, 0.75))

.is-full .forge__svg
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 12px rgba(255, 200, 60, 0.95))

@keyframes forge-bob
  from
    transform: translateY(0)
  to
    transform: translateY(-3px)

@keyframes forge-glow
  0%, 100%
    opacity: 0.55
  50%
    opacity: 1

@keyframes forge-spark
  0%, 100%
    transform: scale(0.8) rotate(0deg)
    opacity: 0.7
  50%
    transform: scale(1.15) rotate(20deg)
    opacity: 1

// ─── Status label ───────────────────────────────────────────────────────────
.forge__label
  display: flex
  align-items: center
  justify-content: center
  // Reserved whether or not there is anything in it, so the anvil never
  // shifts between the countdown and the payout chip.
  min-height: 1.1em
  line-height: 1
  white-space: nowrap
  pointer-events: none

.forge__timer
  display: inline-block
  padding: 0.05em 0.4em
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.72)
  color: #cfdcf0
  font-weight: 900
  font-size: clamp(0.5rem, 2.1vw, 0.66rem)
  line-height: 1.5
  letter-spacing: 0.04em
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.8)

.forge__payout
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.2em
  padding: 0.1em 0.45em
  border: 2px solid #2a1c06
  border-radius: 999px
  background-image: linear-gradient(to bottom, #ffd85c, #f0a01c)
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45)
  line-height: 1

  &.is-full
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45), 0 0 12px rgba(255, 170, 30, 0.75)

.forge__coin
  flex: 0 0 auto
  width: clamp(0.5rem, 2.1vw, 0.7rem)
  height: clamp(0.5rem, 2.1vw, 0.7rem)
  object-fit: contain

.forge__value
  color: #fff
  font-weight: 900
  font-size: clamp(0.5rem, 2.1vw, 0.68rem)
  line-height: 1.4
  text-shadow: 1.5px 1.5px 0 rgba(0, 0, 0, 0.75)

.sr-only
  position: absolute
  width: 1px
  height: 1px
  overflow: hidden
  clip: rect(0 0 0 0)
  white-space: nowrap
</style>
