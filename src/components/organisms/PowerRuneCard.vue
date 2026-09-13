<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { RUNES, statsFor, type RuneType } from '@/game/rules'
import usePowerRunes, { POWER_RUNE_LEVEL, POWER_RUNE_PRICE } from '@/use/usePowerRunes'
import useSkins from '@/use/useSkins'
import { isNative } from '@/use/useUser'
import { coins } from '@/use/useEconomy'
import { adInFlight, canOfferVideo } from '@/use/useAdGate'
import { playFx } from '@/use/useGameAudio'

/**
 * One power rune in the shop.
 *
 * The stone at the level it will LAND at, wearing the player's own skin so the
 * card shows exactly what will hit the board, inside an aura in the rune's
 * colour (gradients and a turning ring — no blur filters, this grid can hold
 * five of them on a phone). Under it: the name, what the boost buys, the
 * numbers it lands with, and the two ways to pay — coins, or one video where
 * a video can really play (`canOfferVideo`). An "armed ×N" badge says how many are in
 * stock; the first placement of this type in the next match spends one.
 */
interface Props {
  type: RuneType
}
const props = defineProps<Props>()

const { t } = useI18n()

/** Only a native build has the width to spell "Watch ad" out beside the frame. */
const showAdWord = isNative
const { activeSkin } = useSkins()
const { powerRunes, canAffordPowerRune, buyPowerRune, earnPowerRuneByAd } = usePowerRunes()

const armed = computed(() => powerRunes.value[props.type] ?? 0)
const stats = computed(() => statsFor(props.type, POWER_RUNE_LEVEL))
const shortfall = computed(() => Math.max(0, POWER_RUNE_PRICE - coins.value))
const levelLabel = computed(() => t('runes.level', { n: POWER_RUNE_LEVEL }))
const style = computed(() => ({ '--glow': RUNES[props.type].color }))

/** A video is on its way for this card; both buttons wait for it. */
const busy = ref(false)

/**
 * Set for one beat after a rune is armed, so the card can CELEBRATE it.
 *
 * Without this the only thing a purchase changed was a small badge appearing
 * at the stone's shoulder: the price stayed, the "N more coins" stayed, and
 * both testers in the shop audit — one of them six years old — came away
 * unsure whether the tap had done anything. The rank card has bounced on a
 * purchase all along; this is that same beat, on the same 700 ms clock.
 */
const landed = ref(false)
let landedTimer: ReturnType<typeof setTimeout> | null = null

const celebrate = (): void => {
  playFx('skinBuy')
  landed.value = true
  if (landedTimer !== null) clearTimeout(landedTimer)
  landedTimer = setTimeout(() => { landed.value = false; landedTimer = null }, 700)
}
onBeforeUnmount(() => { if (landedTimer !== null) clearTimeout(landedTimer) })

const onBuy = (): void => {
  if (buyPowerRune(props.type)) celebrate()
  else playFx('uiReject')
}

const onWatch = async (): Promise<void> => {
  if (busy.value || adInFlight.value) return
  busy.value = true
  try {
    if (await earnPowerRuneByAd(props.type)) celebrate()
  } finally {
    busy.value = false
  }
}
</script>

<template lang="pug">
  article.prc(:style="style" :class="{ 'is-armed': armed > 0, 'is-landed': landed }" :data-type="type")
    div.prc__stage
      span.prc__aura(aria-hidden="true")
      span.prc__ring(aria-hidden="true")
      div.prc__stone
        PebblePreview(:type="type" :skin="activeSkin" :level="POWER_RUNE_LEVEL" :label="levelLabel")
      span.prc__armed(v-if="armed > 0") {{ t('shop.armed', { n: armed }) }}
    div.prc__body
      span.prc__name {{ t(`runes.names.${type}`) }}
      span.prc__boost {{ t(`shop.boosts.${type}`) }}
      div.prc__stats
        span.prc__stat
          span.prc__stat-key {{ t('runes.hp') }}
          span.prc__stat-val {{ stats.hp }}
        span.prc__stat(v-if="stats.atk > 0")
          span.prc__stat-key {{ t('runes.atk') }}
          span.prc__stat-val {{ stats.atk }}
      div.prc__pay
        //- The price and what is still missing from it are ONE thing. They
        //- were not: the shortfall sat on its own line under the whole row,
        //- directly beneath the video button, and a blind tester read
        //- "130 more coins" as what the video would PAY him (2026-09-11). It
        //- belongs to the coin button, so it lives with the coin button.
        div.prc__buycol
          FButton.prc__buy(
            size="sm"
            type="warning"
            :is-disabled="!canAffordPowerRune || busy"
            @click="onBuy"
          )
            IconCoin.prc__coin
            span {{ POWER_RUNE_PRICE }}
          span.prc__need(v-if="!canAffordPowerRune") {{ t('skins.needMore', { n: shortfall }) }}
        //- Only where a video can really play; elsewhere the coin price above
        //- is the whole offer (`canOfferVideo`).
        FButton.prc__ad(
          v-if="canOfferVideo"
          :aria-label="t('shop.watchAd')"
          size="sm"
          type="secondary"
          :is-disabled="busy || adInFlight"
          @click="onWatch"
        )
          RewardAdIcon.prc__ad-icon
          //- Less text, same offer — see `RuneRankCard`'s upgrade switch, which
          //- set this style after "Werbung ansehen" tore a card open.
          span.prc__adword(v-if="showAdWord") {{ t('shop.watchAd') }}
</template>

<style scoped lang="sass">
.prc
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.25rem, 1.4vw, 0.5rem)
  min-width: 0
  padding: clamp(0.45rem, 2.2vw, 0.8rem) clamp(0.35rem, 1.8vw, 0.6rem)
  border: 2px solid color-mix(in srgb, var(--glow) 40%, #0f1a30)
  border-radius: clamp(0.7rem, 3vw, 1.1rem)
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--glow) 18%, transparent), transparent 55%), linear-gradient(to bottom, #172140, #0e1528)
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 0 18px color-mix(in srgb, var(--glow) 18%, transparent)
  user-select: none
  -webkit-user-select: none

  &.is-armed
    border-color: color-mix(in srgb, var(--glow) 75%, #fff)

  // The beat after a purchase: the same bounce the rank card uses, so arming a
  // rune and taking a rank feel like one shop.
  &.is-landed
    animation: prc-land 0.7s ease-out

// ─── The stage: aura, ring, stone ───────────────────────────────────────────

.prc__stage
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: clamp(4.2rem, 22vw, 6.4rem)
  aspect-ratio: 1

.prc__aura
  position: absolute
  inset: -18%
  border-radius: 50%
  background: radial-gradient(circle, color-mix(in srgb, var(--glow) 55%, transparent) 0%, color-mix(in srgb, var(--glow) 22%, transparent) 38%, transparent 68%)
  animation: prc-breathe 2.6s ease-in-out infinite
  pointer-events: none

// A slowly turning gradient ring, cut to a band with a radial mask.
.prc__ring
  position: absolute
  inset: -6%
  border-radius: 50%
  background: conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--glow) 85%, #fff) 60deg, transparent 120deg, color-mix(in srgb, var(--glow) 70%, #fff) 220deg, transparent 300deg)
  -webkit-mask: radial-gradient(circle, transparent 60%, #000 62%, #000 74%, transparent 76%)
  mask: radial-gradient(circle, transparent 60%, #000 62%, #000 74%, transparent 76%)
  animation: prc-turn 6s linear infinite
  pointer-events: none

.prc__stone
  position: relative
  width: 82%
  filter: drop-shadow(0 0.3rem 0.5rem rgba(0, 0, 0, 0.65))

.prc__armed
  position: absolute
  right: -0.4rem
  top: -0.3rem
  padding: 0.1em 0.5em
  border: 2px solid #3d2a05
  border-radius: 999px
  background-image: linear-gradient(to bottom, #ffd94a, #d99a12)
  color: #3a2504
  font-weight: 900
  font-size: clamp(0.5rem, 2.3vw, 0.66rem)
  line-height: 1.3
  white-space: nowrap
  box-shadow: 0 2px 0 #1a1204

// ─── The words and the price ────────────────────────────────────────────────

.prc__body
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  width: 100%
  min-width: 0

.prc__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  text-align: center
  font-size: clamp(0.72rem, 3.4vw, 1rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000, 0 0 10px color-mix(in srgb, var(--glow) 55%, transparent)

.prc__boost
  color: #cfe6ff
  text-align: center
  font-size: clamp(0.56rem, 2.6vw, 0.78rem)
  line-height: 1.25
  text-wrap: balance

.prc__stats
  display: flex
  gap: clamp(0.4rem, 2vw, 0.8rem)

.prc__stat
  display: inline-flex
  align-items: baseline
  gap: 0.25em
  font-weight: 900
  font-size: clamp(0.58rem, 2.7vw, 0.8rem)

.prc__stat-key
  color: #9fb2d0
  letter-spacing: 0.06em

.prc__stat-val
  color: #ffd93c
  text-shadow: 1px 1px 0 #000

.prc__pay
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: clamp(0.25rem, 1.4vw, 0.45rem)
  margin-top: 0.15rem

.prc__buy :deep(.f-button__text),
.prc__ad :deep(.f-button__text)
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.3rem

.prc__coin
  flex: 0 0 auto
  width: 1.15em
  height: 1.15em
  object-fit: contain

.prc__ad-icon
  flex: 0 0 auto
  width: 1.3em
  height: 1em

.prc__buycol
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1rem

.prc__need
  color: #ff9a8f
  font-weight: 900
  font-size: clamp(0.52rem, 2.4vw, 0.7rem)
  text-shadow: 1px 1px 0 #000

@keyframes prc-breathe
  0%, 100%
    opacity: 0.55
    scale: 0.94
  50%
    opacity: 1
    scale: 1.06

@keyframes prc-turn
  to
    rotate: 360deg

@keyframes prc-land
  0%
    scale: 1
  35%
    scale: 1.045
  100%
    scale: 1

@media (prefers-reduced-motion: reduce)
  .prc__aura, .prc__ring, .prc.is-landed
    animation: none
// ─── Landscape phone: the card has to fit the frame, not scroll out of it ────
//
// A 844x390 screen leaves the modal ~354 px of content, and this card stood
// 275 px tall with its shortfall line 11 px past the fold — the price was on
// screen and what it still needed was not. Same treatment the skins hero got:
// the picture gives up the room, the words keep theirs.
@media (orientation: landscape) and (max-height: 30rem)
  .prc
    gap: 0.2rem
    padding: 0.4rem 0.45rem

  .prc__stage
    width: clamp(2.6rem, 12vh, 3.8rem)

  .prc__boost
    font-size: clamp(0.5rem, 1.8vh, 0.66rem)
    line-height: 1.2

  .prc__name
    font-size: clamp(0.62rem, 2.2vh, 0.85rem)

  .prc__body
    gap: 0.12rem
</style>
