<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { MAX_RUNE_RANK, RANK_HP_PER_RANK, RUNES, statsWithRank, type RuneType } from '@/game/rules'
import useRuneRanks, {
  freeRankAvailable, freeRankLeftMs, freeRankRune
} from '@/use/useRuneRanks'
import useSkins from '@/use/useSkins'
import { unlockedRunes } from '@/use/useCampaign'
import { coins } from '@/use/useEconomy'
import { adInFlight, canOfferReward } from '@/use/useAdGate'
import { playFx } from '@/use/useGameAudio'

/**
 * ─── One rune's rank ladder ─────────────────────────────────────────────────
 *
 * The card the player spends a campaign's worth of coins on, so it has to be
 * worth looking at. It carries the STONE — the same painter the field and the
 * hand use, in the player's own skin, so the thing being upgraded and the thing
 * that lands on the board are one drawing — the rune's name, a five-pip meter
 * that says at a glance how far along this rune is, the body it stands up with
 * today and what the next rank adds, and the ways to pay for it.
 *
 * ── The three ways to pay, and why the card only ever shows what applies ──
 *
 *   COINS  — the default. Disabled, with the shortfall spelled out, when the
 *            wallet is short: a button that fails on a tap reads as a bug.
 *   VIDEO  — only while the ads layer says one can actually play
 *            (`canOfferReward`), and ALWAYS behind the film mark. Every
 *            rewarded surface in this game wears that icon so a player never
 *            starts a video by accident.
 *   FREE   — when this is the rune the rotating gift has landed on. No price
 *            and NO film mark: it costs nothing, and an ad icon on a free
 *            button would be a lie. The card wears a ribbon and counts down to
 *            the next draw instead.
 *
 * Three terminal states, each of which must read as deliberate rather than
 * broken: MAXED (every pip lit, no buttons — this rune is finished), LOCKED
 * (the player does not own the rune yet; the campaign map is where it is
 * advertised, not here), and TAKEN (the gift is spent, come back next window).
 */
interface Props {
  type: RuneType
}
const props = defineProps<Props>()

const { t } = useI18n()
const { activeSkin } = useSkins()
const { runeRanks, rankOfRune, nextRankPrice, canAffordRank, isRankMaxed, buyRankWithCoins, buyRankByAd, claimFreeRank } = useRuneRanks()

/** `runeRanks` is the reactive source; the helpers read the same ref. */
const rank = computed(() => runeRanks.value[props.type] ?? rankOfRune(props.type))
const maxed = computed(() => rank.value >= MAX_RUNE_RANK || isRankMaxed(props.type))
const owned = computed(() => unlockedRunes.value.includes(props.type))

const price = computed(() => nextRankPrice(props.type))
const affordable = computed(() => canAffordRank(props.type))
const shortfall = computed(() => Math.max(0, (price.value ?? 0) - coins.value))

/** The body this rune stands up with now, and after the rank being sold. */
const hpNow = computed(() => statsWithRank(props.type, 1, rank.value).hp)
/** `--rank-frac` drives the halo: 0 on an untouched rune, 1 on a maxed one. */
const style = computed(() => ({
  '--glow': RUNES[props.type].color,
  '--rank-frac': String(rank.value / MAX_RUNE_RANK)
}))

/** This rune is the window's gift, and the gift has not been taken yet. */
const isGift = computed(() => owned.value && !maxed.value && freeRankRune.value === props.type)
const giftLive = computed(() => isGift.value && freeRankAvailable.value)

/** `freeRankLeftMs` ticks once a second; the card only ever shows mm:ss. */
const countdown = computed(() => {
  const total = Math.max(0, Math.ceil(freeRankLeftMs.value / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

/** A video is on its way for this card; every button waits for it. */
const busy = ref(false)
/** Set for one beat after a rank lands, so the card can celebrate it. */
const landed = ref(false)
let landedTimer: ReturnType<typeof setTimeout> | null = null

const celebrate = (): void => {
  playFx('skinBuy')
  landed.value = true
  if (landedTimer !== null) clearTimeout(landedTimer)
  landedTimer = setTimeout(() => { landed.value = false; landedTimer = null }, 700)
}
onBeforeUnmount(() => { if (landedTimer !== null) clearTimeout(landedTimer) })
// A rank can also arrive from elsewhere (the panel's gift, a cloud sync): the
// pip lights up either way.
watch(rank, (next, prev) => { if (next > prev) landed.value = true })

const onBuy = (): void => {
  if (busy.value) return
  if (buyRankWithCoins(props.type)) celebrate()
  else playFx('uiReject')
}

const onWatch = async (): Promise<void> => {
  if (busy.value || adInFlight.value) return
  busy.value = true
  try {
    if (await buyRankByAd(props.type)) celebrate()
  } finally {
    busy.value = false
  }
}

const onFree = (): void => {
  if (busy.value) return
  if (claimFreeRank(props.type)) celebrate()
  else playFx('uiReject')
}
</script>

<template lang="pug">
  article.rrc(
    :style="style"
    :class="{ 'is-maxed': maxed, 'is-locked': !owned, 'is-gift': giftLive, 'is-landed': landed }"
    :data-type="type"
    :data-rank="rank"
  )
    //- The gift's ribbon rides over the corner of the card, so a player
    //- scanning the grid finds it without reading a single label.
    span.rrc__ribbon(v-if="giftLive") {{ t('ranks.freeGift') }}

    div.rrc__stage
      span.rrc__aura(aria-hidden="true")
      div.rrc__stone
        PebblePreview(:type="type" :skin="activeSkin" :level="1")
      span.rrc__maxed(v-if="maxed && owned") {{ t('ranks.maxed') }}

    span.rrc__name {{ t(`runes.names.${type}`) }}

    //- ── The meter: five pips, one per rank ────────────────────────────────
    div.rrc__pips(
      role="img"
      :aria-label="t('ranks.rank', { n: rank, max: MAX_RUNE_RANK })"
    )
      span.rrc__pip(
        v-for="i in MAX_RUNE_RANK"
        :key="i"
        :class="{ 'is-lit': i <= rank, 'is-new': landed && i === rank }"
        aria-hidden="true"
      )
    span.rrc__rank {{ t('ranks.rank', { n: rank, max: MAX_RUNE_RANK }) }}

    template(v-if="owned")
      div.rrc__stats
        span.rrc__stat
          span.rrc__stat-key {{ t('runes.hp') }}
          span.rrc__stat-val {{ hpNow }}
        span.rrc__gain(v-if="rank > 0") {{ t('ranks.hpGain', { n: rank * RANK_HP_PER_RANK }) }}
      span.rrc__next(v-if="!maxed") {{ t('ranks.next', { n: RANK_HP_PER_RANK }) }}

      //- ── Paying ────────────────────────────────────────────────────────────
      template(v-if="!maxed")
        //- The gift replaces both paid routes while it stands: no price, and
        //- deliberately no film mark.
        div.rrc__pay(v-if="giftLive")
          FButton.rrc__free(
            size="sm"
            type="success"
            :is-disabled="busy"
            @click="onFree"
          )
            span {{ t('ranks.free') }}
        div.rrc__pay(v-else)
          FButton.rrc__buy(
            size="sm"
            type="warning"
            :is-disabled="!affordable || busy"
            @click="onBuy"
          )
            IconCoin.rrc__coin
            span {{ price }}
          FButton.rrc__ad(
            v-if="canOfferReward"
            size="sm"
            type="secondary"
            :is-disabled="busy || adInFlight"
            @click="onWatch"
          )
            RewardAdIcon.rrc__ad-icon
            span {{ t('shop.watchAd') }}

        span.rrc__need(v-if="!giftLive && !affordable") {{ t('skins.needMore', { n: shortfall }) }}
        span.rrc__timer(v-if="isGift") {{ t('ranks.freeIn', { t: countdown }) }}
        span.rrc__taken(v-if="isGift && !freeRankAvailable") {{ t('ranks.freeTaken') }}

    span.rrc__locked(v-else) {{ t('ranks.locked') }}
</template>

<style scoped lang="sass">
.rrc
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 1vw, 0.3rem)
  min-width: 0
  padding: clamp(0.45rem, 2.2vw, 0.8rem) clamp(0.35rem, 1.8vw, 0.6rem)
  border: 2px solid color-mix(in srgb, var(--glow) 40%, #0f1a30)
  border-radius: clamp(0.7rem, 3vw, 1.1rem)
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--glow) 16%, transparent), transparent 58%), linear-gradient(to bottom, #172140, #0e1528)
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 0 16px color-mix(in srgb, var(--glow) 16%, transparent)
  transition: border-color 0.25s ease, box-shadow 0.25s ease
  user-select: none
  -webkit-user-select: none

  // Finished: the card stops asking for anything and simply reads as complete.
  &.is-maxed
    border-color: color-mix(in srgb, var(--glow) 85%, #fff)
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--glow) 30%, transparent), 0 0 22px color-mix(in srgb, var(--glow) 34%, transparent)

  // Not owned yet: present, greyed, and silent about price.
  &.is-locked
    filter: grayscale(0.85)
    opacity: 0.5

  &.is-gift
    border-color: #6dffa8
    box-shadow: inset 0 0 0 1px rgba(109, 255, 168, 0.28), 0 0 22px rgba(109, 255, 168, 0.35)

  &.is-landed
    animation: rrc-land 0.7s ease-out

// The gift's corner ribbon.
.rrc__ribbon
  position: absolute
  left: 50%
  top: calc(-0.55rem)
  translate: -50% 0
  z-index: 2
  padding: 0.1em 0.7em
  border: 2px solid #0c3d24
  border-radius: 999px
  background-image: linear-gradient(to bottom, #8dffbe, #24b872)
  color: #05301c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.48rem, 2.2vw, 0.62rem)
  line-height: 1.4
  white-space: nowrap
  box-shadow: 0 2px 0 #04150c
  animation: rrc-bob 1.8s ease-in-out infinite

// ─── The stage ──────────────────────────────────────────────────────────────

.rrc__stage
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: clamp(3.4rem, 18vw, 5rem)
  aspect-ratio: 1

// The halo grows with the rank: an untouched rune sits nearly dark, a maxed
// one burns. It is the same information as the pips, felt rather than counted.
.rrc__aura
  position: absolute
  inset: -14%
  border-radius: 50%
  background: radial-gradient(circle, color-mix(in srgb, var(--glow) 55%, transparent) 0%, color-mix(in srgb, var(--glow) 20%, transparent) 40%, transparent 70%)
  opacity: calc(0.18 + var(--rank-frac, 0) * 0.8)
  pointer-events: none

.rrc__stone
  position: relative
  width: 84%
  filter: drop-shadow(0 0.25rem 0.4rem rgba(0, 0, 0, 0.65))

.rrc__maxed
  position: absolute
  right: -0.35rem
  top: -0.25rem
  padding: 0.1em 0.5em
  border: 2px solid #3d2a05
  border-radius: 999px
  background-image: linear-gradient(to bottom, #ffd94a, #d99a12)
  color: #3a2504
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.46rem, 2.1vw, 0.6rem)
  line-height: 1.3
  white-space: nowrap
  box-shadow: 0 2px 0 #1a1204

// ─── Words, pips, numbers ───────────────────────────────────────────────────

.rrc__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  text-align: center
  font-size: clamp(0.66rem, 3.1vw, 0.92rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000, 0 0 10px color-mix(in srgb, var(--glow) 50%, transparent)

.rrc__pips
  display: flex
  align-items: center
  justify-content: center
  gap: clamp(0.15rem, 0.9vw, 0.3rem)
  margin-top: 0.1rem

// A hollow socket until it is earned; then a filled stone in the rune's own
// neon with a bloom around it, so a full meter glows as one bar.
.rrc__pip
  width: clamp(0.42rem, 2.1vw, 0.6rem)
  height: clamp(0.42rem, 2.1vw, 0.6rem)
  border: 2px solid color-mix(in srgb, var(--glow) 45%, #16223f)
  border-radius: 50%
  background-color: rgba(6, 10, 22, 0.85)
  transition: background-color 0.25s ease, box-shadow 0.25s ease, scale 0.25s ease

  &.is-lit
    border-color: color-mix(in srgb, var(--glow) 90%, #fff)
    background-image: radial-gradient(circle at 35% 30%, #fff, var(--glow) 65%)
    box-shadow: 0 0 6px color-mix(in srgb, var(--glow) 80%, transparent), 0 0 12px color-mix(in srgb, var(--glow) 45%, transparent)

  &.is-new
    animation: rrc-pip 0.7s cubic-bezier(0.2, 1.6, 0.4, 1)

.rrc__rank
  color: #9fb2d0
  font-weight: 900
  letter-spacing: 0.04em
  font-size: clamp(0.5rem, 2.3vw, 0.66rem)

.rrc__stats
  display: flex
  align-items: baseline
  gap: clamp(0.3rem, 1.6vw, 0.6rem)

.rrc__stat
  display: inline-flex
  align-items: baseline
  gap: 0.25em
  font-weight: 900
  font-size: clamp(0.58rem, 2.7vw, 0.8rem)

.rrc__stat-key
  color: #9fb2d0
  letter-spacing: 0.06em

.rrc__stat-val
  color: #ffd93c
  text-shadow: 1px 1px 0 #000

.rrc__gain
  color: #6dffa8
  font-weight: 900
  font-size: clamp(0.52rem, 2.4vw, 0.7rem)
  text-shadow: 1px 1px 0 #000

.rrc__next
  color: #cfe6ff
  text-align: center
  font-size: clamp(0.52rem, 2.4vw, 0.72rem)
  line-height: 1.2

.rrc__pay
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: clamp(0.25rem, 1.4vw, 0.45rem)
  margin-top: 0.15rem

.rrc__buy :deep(.f-button__text),
.rrc__ad :deep(.f-button__text),
.rrc__free :deep(.f-button__text)
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.3rem

.rrc__coin
  flex: 0 0 auto
  width: 1.15em
  height: 1.15em
  object-fit: contain

.rrc__ad-icon
  flex: 0 0 auto
  width: 1.3em
  height: 1em

.rrc__need
  color: #ff9a8f
  font-weight: 900
  font-size: clamp(0.5rem, 2.3vw, 0.68rem)
  text-shadow: 1px 1px 0 #000

.rrc__timer
  color: #8dffbe
  font-weight: 900
  font-size: clamp(0.48rem, 2.2vw, 0.64rem)

.rrc__taken
  color: #9fb2d0
  text-align: center
  font-size: clamp(0.48rem, 2.2vw, 0.64rem)
  line-height: 1.2

.rrc__locked
  color: #9fb2d0
  font-weight: 900
  text-align: center
  font-size: clamp(0.52rem, 2.4vw, 0.7rem)

@keyframes rrc-land
  0%
    scale: 1
  35%
    scale: 1.045
  100%
    scale: 1

@keyframes rrc-pip
  0%
    scale: 0.4
  55%
    scale: 1.5
  100%
    scale: 1

@keyframes rrc-bob
  0%, 100%
    translate: -50% 0
  50%
    translate: -50% -0.12rem

@media (prefers-reduced-motion: reduce)
  .rrc.is-landed,
  .rrc__pip.is-new,
  .rrc__ribbon
    animation: none
</style>
