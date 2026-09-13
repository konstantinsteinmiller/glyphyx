<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { MAX_RUNE_RANK, RUNES, type RuneType } from '@/game/rules'
import useRuneRanks, { freeRankAvailable, freeRankRune } from '@/use/useRuneRanks'
import useSkins from '@/use/useSkins'
import { nextRuneUnlock, unlockedRunes } from '@/use/useCampaign'
import { RUNE_UNLOCK_NODES, chapterOf, indexInChapter } from '@/game/campaign'
import { adInFlight, canOfferVideo } from '@/use/useAdGate'
import { coins } from '@/use/useEconomy'
import { isNative } from '@/use/useUser'
import { playFx } from '@/use/useGameAudio'

/**
 * ─── One rune's rank ladder, in four lines ─────────────────────────────────
 *
 * The stone, the name, five stars, and what the next star costs. That is the
 * whole card, and the restraint IS the design: this tab is where a young
 * player meets a wall of numbers if you let it.
 *
 * Everything that used to sit here — "Rank 2/5" under the meter, the current
 * hit points, the "+2 HP" already earned, the "Next: +1 HP" — either repeated
 * something the stars already say, or restated a rule that is the SAME for
 * every rune. A rule that never varies belongs in the tab's header once, not
 * on nine cards.
 *
 * The coins-still-needed line was cut with them and has been PUT BACK, because
 * it is not one of those: the next rank costs 70 on one card and 560 on
 * another, so the gap to it is this card's own number. The power-rune and skin
 * cards had kept printing it all along, which left the ladder as the one tab
 * that asked the player to do the subtraction.
 *
 * The stars carry the progress: five of them, lit as they are earned, a shape
 * that reads as "two of five" without reading a number at all. The number
 * still reaches a screen reader through the meter's label.
 *
 * ── The three ways to pay ──
 *
 *   COINS  — the coin and the price, and nothing else. A wallet that is short
 *            leaves the button disabled, which says "not yet" without a
 *            sentence. Where no video can play it is the whole control.
 *   VIDEO  — the other half of the same switch, only where a video can
 *            actually play (`canOfferVideo`: a real ad provider AND a ready
 *            slot), and ALWAYS behind the film mark. On local dev and the
 *            CrazyGames pre-release build there is no such half at all: it
 *            used to stand there showing only an arrow, because the film mark
 *            rightly refuses to promise a video that cannot play.
 *            It carries no sentence either: "Watch ad" is two short words in
 *            English and "Werbung ansehen" in German, which pushed this button
 *            clean out of its card. Only a NATIVE build, which has the width,
 *            spells the words out beside the frame.
 *   FREE   — when this is the rune the rotating gift has landed on. No price
 *            and NO film mark: it costs nothing, and an ad icon on a free
 *            button would be a lie. The gift's countdown lives on the tab's
 *            header, because there is only ever one gift to count down.
 *
 * ── The promise: a rune not owned yet ──
 *
 * A locked rune is not shown as a rank ladder with the buttons taken away —
 * that is a card about a thing you cannot do. It is shown as a SILHOUETTE: the
 * rune's own shape, blacked out, under its name and the stage that hands it
 * over. The player can picture what is coming and knows how to get it.
 *
 * The silhouette is `PebblePreview` under a filter, deliberately: it is the
 * real stone's outline, not a second drawing that could drift from it.
 *
 * Only ONE locked rune is ever shown this way — the one the campaign gives
 * next, which the result screen has already teased. `RankShopPanel` draws
 * `MysteryRuneCard` for the rest, and that component's header explains why.
 */
interface Props {
  type: RuneType
}
const props = defineProps<Props>()

const { t } = useI18n()
const { activeSkin } = useSkins()
const {
  runeRanks, rankOfRune, nextRankPrice, canAffordRank, isRankMaxed,
  buyRankWithCoins, buyRankByAd, claimFreeRank
} = useRuneRanks()

/** `runeRanks` is the reactive source; the helpers read the same ref. */
const rank = computed(() => runeRanks.value[props.type] ?? rankOfRune(props.type))
const maxed = computed(() => rank.value >= MAX_RUNE_RANK || isRankMaxed(props.type))
const owned = computed(() => unlockedRunes.value.includes(props.type))

const price = computed(() => nextRankPrice(props.type))
const affordable = computed(() => canAffordRank(props.type))
/**
 * What the wallet is still short. The power-rune and skin cards have always
 * printed this under a disabled price; the ladder made the player do the
 * subtraction themselves, one tab away from where the same feature is spelled
 * out — the single most-repeated note in the shop audit.
 */
const shortfall = computed(() => Math.max(0, (price.value ?? 0) - coins.value))

/** `--rank-frac` drives the halo: 0 on an untouched rune, 1 on a maxed one. */
const style = computed(() => ({
  '--glow': RUNES[props.type].color,
  '--rank-frac': String(rank.value / MAX_RUNE_RANK)
}))

/** The rune the campaign hands over next — the one locked rune worth naming. */
const isNextUp = computed(() => !owned.value && nextRuneUnlock.value?.rune === props.type)

/**
 * Where this rune is won, as chapter + index.
 *
 * Two sources, in order. `nextRuneUnlock` knows the node for whichever rune is
 * next, wherever the campaign authored it — that covers the chapter-1 runes,
 * which are hand-written rather than tabled. `RUNE_UNLOCK_NODES` covers the
 * late four by lookup, which is what a rune revealed early (the nuker, behind
 * its video offer) needs. Neither → no stage line rather than a guess.
 */
const stage = computed<{ chapter: number; index: number } | null>(() => {
  const next = nextRuneUnlock.value
  if (next && next.rune === props.type) return { chapter: next.chapter, index: next.index }
  for (const [node, rune] of Object.entries(RUNE_UNLOCK_NODES)) {
    if (rune === props.type) return { chapter: chapterOf(Number(node)), index: indexInChapter(Number(node)) }
  }
  return null
})

/** This rune is the window's gift, and the gift has not been taken yet. */
const isGift = computed(() => owned.value && !maxed.value && freeRankRune.value === props.type)
const giftLive = computed(() => isGift.value && freeRankAvailable.value)

/**
 * The rewarded half names itself differently depending on where there is room
 * for words. A packaged NATIVE build (Tauri: desktop and the mobile shells)
 * runs full-screen with no portal chrome around it, so it can afford "Watch
 * ad" beside the frame; a card in a web embed cannot, and the film frame plus
 * the up-arrow already say "upgrade, paid with a video".
 */
const showAdWord = isNative
const adLabel = computed(() => `${t('ranks.upgrade')} · ${t('shop.watchAd')}`)

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
// star lights up either way.
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
    :class="{ 'is-maxed': maxed && owned, 'is-promise': !owned, 'is-next': isNextUp, 'is-gift': giftLive, 'is-landed': landed }"
    :data-type="type"
    :data-rank="rank"
  )
    //- The gift's ribbon rides over the top of the card, so a player scanning
    //- the grid finds it without reading a label. A locked rune wears the same
    //- ribbon shape to say NEXT UP — the two are never both true, since a gift
    //- is only ever drawn on a rune the player already owns.
    span.rrc__ribbon(v-if="giftLive") {{ t('ranks.freeGift') }}
    span.rrc__ribbon.is-next-ribbon(v-else-if="isNextUp") {{ t('ranks.nextUp') }}

    div.rrc__stage
      span.rrc__aura(v-if="owned" aria-hidden="true")
      //- The SAME painter either way: a silhouette here is the real stone
      //- under a filter, never a second shape that could drift from it.
      div.rrc__stone(:class="{ 'is-silhouette': !owned }")
        PebblePreview(:type="type" :skin="activeSkin" :level="1")
      span.rrc__maxed(v-if="maxed && owned") {{ t('ranks.maxed') }}

    span.rrc__name {{ t(`runes.names.${type}`) }}

    template(v-if="owned")
      //- The meter: five stars, and nothing under them.
      div.rrc__stars(
        role="img"
        :aria-label="t('ranks.rank', { n: rank, max: MAX_RUNE_RANK })"
      )
        GameIcon.rrc__star(
          v-for="i in MAX_RUNE_RANK"
          :key="i"
          :name="i <= rank ? 'star' : 'star-empty'"
          :class="{ 'is-lit': i <= rank, 'is-new': landed && i === rank }"
        )

      template(v-if="!maxed")
        //- The gift replaces the paid route while it stands.
        div.rrc__pay(v-if="giftLive")
          FButton.rrc__free(
            size="sm"
            type="success"
            :is-disabled="busy"
            @click="onFree"
          )
            span {{ t('ranks.free') }}
        //- ── The upgrade switch ────────────────────────────────────────────
        //- One control, two halves: pay with coins on the left, pay with a
        //- video on the right. Both end in the SAME up-arrow, because both do
        //- the same thing — the half you press only says which currency.
        //- Neither half carries a sentence: "Watch ad" is two words in English
        //- and "Werbung ansehen" in German, which is what tore this card open.
        div.rrc__pay.rrc__switch(v-else :class="{ 'has-video': canOfferVideo }")
          //- The price and what is still missing from it are ONE block, the
          //- shape the power-rune and skin cards use: a shortfall under the
          //- whole row would sit beneath the VIDEO half too, and a blind
          //- tester read exactly that as what the video would pay out.
          div.rrc__buycol
            FButton.rrc__buy(
              size="sm"
              type="warning"
              :is-disabled="!affordable || busy"
              :aria-label="t('ranks.upgrade')"
              @click="onBuy"
            )
              IconCoin.rrc__coin
              span.rrc__price {{ price }}
              //- First thing to go on a narrow rung — see the container queries.
              GameIcon.rrc__up.is-buy(name="up")
            span.rrc__need(v-if="!affordable") {{ t('skins.needMore', { n: shortfall }) }}
          FButton.rrc__ad(
            v-if="canOfferVideo"
            size="sm"
            type="secondary"
            :is-disabled="busy || adInFlight"
            :aria-label="adLabel"
            @click="onWatch"
          )
            RewardAdIcon.rrc__ad-icon
            //- A desktop/Tauri build has room for the word; a phone does not.
            span.rrc__adword(v-if="showAdWord") {{ t('shop.watchAd') }}
            GameIcon.rrc__up(name="up")

    //- Not owned: where it is won. If the campaign's table cannot say (it
    //- cannot happen today, but a hand-authored unlock could move), the plain
    //- "not unlocked yet" it falls back to.
    template(v-else)
      span.rrc__winsat(v-if="stage") {{ t('ranks.winsAt', { c: stage.chapter, n: stage.index }) }}
      span.rrc__locked(v-else) {{ t('ranks.locked') }}
</template>

<style scoped lang="sass">
// The smallest touch target that is reliably hittable on a phone.
$tap-target: 2.75rem

.rrc
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  justify-content: flex-start
  gap: clamp(0.15rem, 0.8vw, 0.3rem)
  min-width: 0
  // The card sizes to ITSELF, not to the window. These rungs live in a modal
  // whose width does not track the viewport, so `vw` type hit its maximum
  // inside a 115 px card on a desktop and wrapped the buttons — which grew
  // every card, which is what put the tab back into a scroll. `cqw` is the
  // card's own width, so a rung reads the same whether the grid packs three
  // across on a phone or five across on a desktop.
  container-type: inline-size
  padding: clamp(0.35rem, 4cqw, 0.6rem) clamp(0.2rem, 3cqw, 0.4rem)
  border: 2px solid color-mix(in srgb, var(--glow) 40%, #0f1a30)
  border-radius: clamp(0.7rem, 3vw, 1.1rem)
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--glow) 16%, transparent), transparent 58%), linear-gradient(to bottom, #172140, #0e1528)
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 0 16px color-mix(in srgb, var(--glow) 16%, transparent)
  transition: border-color 0.25s ease, box-shadow 0.25s ease
  user-select: none
  -webkit-user-select: none

  // Finished: the card stops asking for anything and reads as complete.
  &.is-maxed
    border-color: color-mix(in srgb, var(--glow) 85%, #fff)
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--glow) 30%, transparent), 0 0 22px color-mix(in srgb, var(--glow) 34%, transparent)

  // Not owned: a PROMISE, not a disabled product. The frame cools to slate so
  // it does not compete with the runes that can be bought, but the name and
  // the stage stay fully legible — that is the whole point of the card.
  &.is-promise
    border-color: #2b3757
    background: radial-gradient(ellipse at 50% 0%, rgba(126, 156, 214, 0.12), transparent 58%), linear-gradient(to bottom, #141d36, #0b1120)
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03)
    justify-content: center

  // …and the one the campaign hands over NEXT gets its colour back in the
  // frame: of everything locked, this is the one to want.
  &.is-next
    border-color: color-mix(in srgb, var(--glow) 55%, #0f1a30)
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 0 18px color-mix(in srgb, var(--glow) 22%, transparent)

  &.is-gift
    border-color: #6dffa8
    box-shadow: inset 0 0 0 1px rgba(109, 255, 168, 0.28), 0 0 22px rgba(109, 255, 168, 0.35)

  &.is-landed
    animation: rrc-land 0.7s ease-out

.rrc__ribbon
  position: absolute
  left: 50%
  // Anchored by its FOOT, a little over the card's top edge: a ribbon that
  // needs a second line then grows upward, into the gap the grid leaves for
  // it, instead of down over the stone.
  bottom: calc(100% - 0.55rem)
  translate: -50% 0
  z-index: 2
  padding: 0.1em 0.7em
  border-radius: 999px
  background: linear-gradient(to bottom, #7dffbc, #2fbd70)
  color: #06301a
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  // Sized and capped against the CARD, not against the word: Russian's
  // "Бесплатное улучшение!" is 21 characters to English's 13 and ran past both
  // edges of the rung it belongs to. The ribbon may hang a little over the
  // card's corners — that is the look — but never into its neighbour.
  //
  // It WRAPS rather than truncating. Capping it alone left the narrowest
  // phone reading "БЕСПЛАТНОЕ УЛУЧШЕ…", and this ribbon exists to advertise a
  // free gift — the one label in the shop that must not lose its own noun.
  max-width: 112%
  white-space: normal
  text-wrap: balance
  line-height: 1.12
  font-size: clamp(0.36rem, 7cqw, 0.56rem)
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.45)
  animation: rrc-bob 1.8s ease-in-out infinite

  &.is-next-ribbon
    background: linear-gradient(to bottom, color-mix(in srgb, var(--glow) 85%, #fff), var(--glow))
    color: #10131c

.rrc__stage
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: 100%

// The halo behind an upgraded stone: nothing at rank 0, a full bloom at five.
.rrc__aura
  position: absolute
  inset: 8% 18%
  border-radius: 50%
  background: radial-gradient(circle, color-mix(in srgb, var(--glow) 55%, transparent), transparent 70%)
  opacity: calc(0.15 + 0.85 * var(--rank-frac, 0))
  pointer-events: none

.rrc__stone
  position: relative
  width: clamp(1.9rem, 42cqw, 3.1rem)
  filter: drop-shadow(0 0.2rem 0.35rem rgba(0, 0, 0, 0.6))

  // The promise: the real stone, blacked out. Never a second drawing.
  &.is-silhouette
    filter: brightness(0) invert(0.26) drop-shadow(0 0.2rem 0.35rem rgba(0, 0, 0, 0.6))

.rrc__maxed
  position: absolute
  right: -0.1rem
  bottom: -0.2rem
  padding: 0.05em 0.5em
  border-radius: 999px
  background: linear-gradient(to bottom, #ffe89a, #e0a325)
  color: #3a2504
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.4rem, 8cqw, 0.52rem)
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.45)

.rrc__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  text-align: center
  letter-spacing: 0.02em
  font-size: clamp(0.5rem, 11cqw, 0.8rem)
  line-height: 1.1
  text-wrap: balance
  text-shadow: 2px 2px 0 #000

// Five stars, lit as they are earned. A star is a reward shape — it is read as
// "two of five" without reading a number, which is why the line that used to
// say exactly that could go.
.rrc__stars
  display: flex
  align-items: center
  justify-content: center
  gap: clamp(0.06rem, 1.6cqw, 0.18rem)

.rrc__star
  flex: 0 0 auto
  width: clamp(0.62rem, 13cqw, 1rem)
  height: clamp(0.62rem, 13cqw, 1rem)
  // Unearned: a hollow star that recedes, rather than a gap reading as damage.
  color: color-mix(in srgb, var(--glow) 28%, #2a3752)
  transition: color 0.25s ease, filter 0.25s ease, scale 0.25s ease

  &.is-lit
    color: var(--glow)
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--glow) 75%, transparent)) drop-shadow(0 1px 0 rgba(0, 0, 0, 0.8))

  // The one just earned pops, so a purchase is felt and not merely recorded.
  &.is-new
    animation: rrc-star 0.55s cubic-bezier(0.2, 1.7, 0.4, 1)

// One row, and it may NOT grow past the card: the price takes the room it
// needs and the video is a square beside it.
.rrc__pay
  display: flex
  // The halves line up at their TOPS, not by stretching: the coin half carries
  // a shortfall line under its button, and stretching would have dragged the
  // video half down to match a line that is not its own.
  align-items: flex-start
  justify-content: center
  gap: clamp(0.15rem, 2cqw, 0.3rem)
  width: 100%
  margin-top: 0.1rem
  min-width: 0

// The upgrade SWITCH: two halves of one control. They sit flush, share a
// height, and each ends in the same up-arrow — the choice is only which
// currency, so nothing else about them should differ.
//
// The inner corners are squared on the parts `FButton` actually PAINTS — its
// body and its depth plate. They used to be squared on the button's root
// element, which draws nothing, so the two halves came out as two whole pills
// butting into each other. With no video on offer the coin half is the whole
// control and keeps every corner.
.rrc__switch
  gap: 0

  &.has-video
    .rrc__buy :deep(.f-button__body),
    .rrc__buy :deep(.f-button__shadow)
      border-top-right-radius: 0
      border-bottom-right-radius: 0

    .rrc__ad :deep(.f-button__body),
    .rrc__ad :deep(.f-button__shadow)
      border-top-left-radius: 0
      border-bottom-left-radius: 0

    // A hairline so the two halves read as a switch rather than one wide button.
    .rrc__ad :deep(.f-button__body)
      box-shadow: inset 1px 0 0 rgba(0, 0, 0, 0.45)

// The coin half may grow but never shrinks under its own content: the price is
// the one thing on this card that must be read whole. It used to be free to
// shrink (`flex: 1 1 auto; min-width: 0`), and beside a video half it did —
// to 46 px, with "140" clipped at both ends under the coin.
.rrc__buycol
  display: flex
  flex-direction: column
  align-items: stretch
  flex: 1 0 auto
  min-width: 0

.rrc__buycol .rrc__buy
  width: 100%

// Small, quiet, and the same sentence the other two tabs print.
.rrc__need
  color: #ff9a8f
  font-weight: 900
  text-align: center
  line-height: 1.15
  font-size: clamp(0.4rem, 8cqw, 0.58rem)
  text-shadow: 1px 1px 0 #000

.rrc__free
  flex: 1 1 auto
  min-width: 0

.rrc__ad
  flex: 0 0 auto

// Two halves share the row, so their words come down to the card's size. The
// size rule on `.f-button__body` below never reached them: `FButton` sets the TEXT
// span's own size from its variable, so the price stayed at full button size
// however narrow the card was — which is what pushed it out of its half. Only
// here, with a video beside it: a coin half that is the whole row keeps the
// button's own, bigger price. Capped at that same size (`--fbtn-font`, set on
// the button), so a roomy card never gets a price bigger than a normal button.
// …and the gift button, for the same reason in a different language: "Free" is
// four characters in English and "Бесплатно" is nine, which ran clean out of
// the green pill on a 320 px phone. Same rule, same cap.
.rrc__switch.has-video :deep(.f-button__text),
.rrc__free :deep(.f-button__text)
  font-size: clamp(0.46rem, 11cqw, var(--fbtn-font))

// A rung is only ~110 px wide on a packed grid, so the switch's own text and
// padding are cut to fit rather than left to wrap — a wrapped button grows the
// card, and nine grown cards are what put the tab back into a scroll.
// `sm` ships a `--fbtn-min-w` floor of up to 6rem — two of those cannot fit a
// 115 px rung, which is what pushed the switch out of the card. The floor is an
// INLINE custom property on the button, so it cannot be overridden by setting
// the variable on an ancestor; the width has to be overridden on the element.
//
// But dropping the floor to nothing is how the video half became 20 px wide on
// a phone: it holds an icon and an arrow, and with no floor it shrank to them.
// A control the finger cannot land on is not a control, so BOTH halves keep a
// 44 px minimum — the smallest target that is reliably hittable — and the row
// gives up ornament instead of size when the rung is narrow.
.rrc__pay :deep(.f-button)
  min-width: 0
  min-height: $tap-target

.rrc__pay :deep(.f-button__body)
  min-width: 0
  padding-inline: clamp(0.15rem, 3cqw, 0.42rem)
  font-size: clamp(0.46rem, 10cqw, 0.72rem)
  gap: 0.25em

.rrc__pay :deep(.f-button__text)
  min-width: 0
  white-space: nowrap

// The price leads, the coin explains it, the arrow says what it buys.
.rrc__price
  font-variant-numeric: tabular-nums

.rrc__up
  flex: 0 0 auto
  width: 0.95em
  height: 0.95em

// Square, and never smaller: the video half is an icon and an arrow, so
// nothing in its content would stop it collapsing — it measured 20 px wide on
// a phone, which is not a control a finger can land on. Written as a `:deep()`
// rule rather than on `.rrc__ad` alone, because the blanket `min-width: 0`
// above is `.rrc__pay :deep(.f-button)` and outranks a lone class on the very
// same element: a plainly-written floor loses that fight silently.
.rrc__pay :deep(.rrc__ad)
  min-width: $tap-target

.rrc__adword
  white-space: nowrap

.rrc__buy :deep(.f-button__text),
.rrc__ad :deep(.f-button__text),
.rrc__free :deep(.f-button__text)
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.3rem
  min-width: 0

.rrc__coin
  flex: 0 0 auto
  width: 1em
  height: 1em
  object-fit: contain

.rrc__ad-icon
  flex: 0 0 auto
  width: 1.15em
  height: 0.9em

.rrc__locked,
.rrc__winsat
  color: #9fb2d0
  font-weight: 900
  text-align: center
  font-size: clamp(0.44rem, 9cqw, 0.66rem)
  line-height: 1.25
  text-wrap: balance

// Below this width the row cannot hold two 44 px targets AND the coin half's
// arrow, so the arrow goes: the stars above and the video half's own arrow
// already say "upgrade", and the touch target may not be traded for ornament.
@container (max-width: 8.2rem)
  .rrc__up.is-buy
    display: none

// Narrower still — a 320 px phone packing the grid three across — and the two
// halves cannot BOTH keep a 44 px target and a whole three-digit price side by
// side. They stack rather than clip: the coin half on top, the video half under
// it, each the full width of the card. A taller card beats a price nobody can
// read. (The query measures the card's CONTENT box: 5.6rem is a ~106 px card.)
@container (max-width: 5.6rem)
  .rrc__switch.has-video
    flex-direction: column
    gap: 0.35rem
    // Back to stretch for the stacked case. The row above aligns to the TOP so
    // the shortfall under the coin button cannot drag the video half down with
    // it — but in a column that same rule leaves both halves at their content
    // width, floating against the left edge of the card instead of spanning it.
    align-items: stretch

    .rrc__buy :deep(.f-button__body),
    .rrc__buy :deep(.f-button__shadow),
    .rrc__ad :deep(.f-button__body),
    .rrc__ad :deep(.f-button__shadow)
      border-radius: var(--fbtn-radius)

    .rrc__ad :deep(.f-button__body)
      box-shadow: none

@keyframes rrc-land
  0%
    scale: 1
  35%
    scale: 1.045
  100%
    scale: 1

@keyframes rrc-star
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
  .rrc__star.is-new,
  .rrc__ribbon
    animation: none
</style>
