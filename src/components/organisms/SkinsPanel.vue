<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { RUNE_TYPES, SKINS, SKIN_IDS, type RuneType, type SkinId } from '@/game/rules'
import useSkins from '@/use/useSkins'
import useEconomy from '@/use/useEconomy'
import { isNative } from '@/use/useUser'
import { adInFlight, canOfferReward } from '@/use/useAdGate'
import { unlockedRunes } from '@/use/useCampaign'
import { playFx } from '@/use/useGameAudio'

/**
 * ─── The skin shop, as a panel ──────────────────────────────────────────────
 *
 * Nine materials the player's runes can be cut from — and a material is not a
 * tint: it is a different way of WORKING the stone (carved and bordered,
 * knapped, worn round, faceted, quarried, blunted into a slab, step cut,
 * domed, brilliant cut) and a different way of cutting the glyph into it (see
 * `SKINS`), so the shop has to SHOW that rather than name it. What a skin does
 * NOT change is the outline: that belongs to the rune, which is why the hero
 * shows the whole roster in the selected material — nine stones that are
 * plainly the same stuff and plainly different runes.
 *
 * Two parts. The HERO is the selected material worn by every rune the game
 * has — the sword at Lv 2, big and breathing, and the five runes at Lv 1 under
 * it — with the material's name, one line on what makes it different, and the
 * actions that apply (buy with coins, watch a video, equip, equipped). The
 * LIST is the nine materials as cards; a tap previews, it never spends. Every
 * stone on this screen is painted by the same `PebblePreview` the field uses,
 * so the thing bought and the thing placed are one drawing.
 *
 * Buying is instant and cannot fail halfway — `useSkins` spends first and
 * grants only if that succeeded — and it equips, because a player who just
 * paid for a look wants to see it, not find a second button. A rewarded video
 * is the alternative payment: offered only while the ads layer says one can
 * actually play, granted only after it did.
 *
 * Lives inside `ShopModal` (the "Skins" tab) and inside the legacy
 * `SkinsModal` wrapper. The wallet row can be hidden when the host shows one.
 */
interface Props {
  /** The tagline + wallet row under the hero; off when the host has its own. */
  showWallet?: boolean
}
const props = withDefaults(defineProps<Props>(), { showWallet: true })

const { t } = useI18n()
const { coins } = useEconomy()
const { activeSkin, ownedSkins, isSkinOwned, priceOf, buySkin, equipSkin, unlockSkinByAd } = useSkins()

interface Row {
  id: SkinId
  price: number
  owned: boolean
  equipped: boolean
  affordable: boolean
}

const rows = computed<Row[]>(() => {
  void ownedSkins.value
  return SKIN_IDS.map((id) => {
    const owned = isSkinOwned(id)
    return {
      id,
      price: priceOf(id),
      owned,
      equipped: activeSkin.value === id,
      affordable: coins.value >= priceOf(id)
    }
  })
})

/** The material on the hero stage. Opens on the one the player wears. */
const selected = ref<SkinId>(activeSkin.value)
watch(activeSkin, (id) => { selected.value = id })
const sel = computed<Row>(() => rows.value.find((r) => r.id === selected.value) ?? rows.value[0]!)
const shortfall = computed(() => Math.max(0, sel.value.price - coins.value))

/** A video is on its way for this material; the buttons wait for it. */
const busy = ref(false)

/** Only a native build has the width to spell "Watch ad" out beside the frame. */
const showAdWord = isNative

const select = (row: Row): void => {
  if (selected.value === row.id) return
  selected.value = row.id
  playFx('uiOpen', 0.5)
}

const onAction = (row: Row): void => {
  if (row.owned) {
    if (row.equipped) return
    if (equipSkin(row.id)) playFx('uiOpen')
    return
  }
  if (buySkin(row.id)) playFx('skinBuy')
  else playFx('uiReject')
}

const onWatch = async (row: Row): Promise<void> => {
  if (row.owned || busy.value || adInFlight.value) return
  busy.value = true
  try {
    if (await unlockSkinByAd(row.id)) playFx('skinBuy')
  } finally {
    busy.value = false
  }
}

/**
 * Which runes may be SHOWN wearing this material. A locked rune's stone is its
 * identity, and the campaign is still saving it.
 */
const isOwned = (type: RuneType): boolean => unlockedRunes.value.includes(type)

/** The hero's glow and the cards' rims follow the material's own rim light. */
const rimOf = (id: SkinId) => ({ '--rim': SKINS[id].rim, '--stone': SKINS[id].base })
</script>

<template lang="pug">
  div.skins(:class="{ 'has-wallet': props.showWallet }")
    //- ── The hero: the selected material, worn by every rune ────────────
    section.hero(:style="rimOf(selected)" :class="{ 'is-owned': sel.owned }")
      div.hero__stage
        div.hero__big
          PebblePreview(type="melee" :skin="selected" :level="2" animated)
          span.hero__lv {{ t('runes.level', { n: 2 }) }}
        //- The material worn by the runes the player OWNS — and a question
        //- mark for each one still to come. Drawing every rune's glyph here
        //- was a spoiler hiding in the skins tab: the campaign spends chapters
        //- keeping the axe, the boulder, the mortar and the warhead back, and
        //- this row handed all four over to anyone who opened it on day one.
        div.hero__row
          template(v-for="type in RUNE_TYPES" :key="type")
            div.hero__slot(v-if="isOwned(type)")
              PebblePreview(:type="type" :skin="selected" :level="1")
            div.hero__slot.is-locked(v-else aria-hidden="true") ?

      div.hero__caption
        span.hero__name {{ t(`skins.names.${selected}`) }}
        span.hero__blurb {{ t(`skins.blurbs.${selected}`) }}
        div.hero__cta
          template(v-if="sel.owned")
            span.hero__state(v-if="sel.equipped")
              GameIcon.hero__state-icon(name="check")
              | {{ t('skins.equipped') }}
            FButton(
              v-else
              size="sm"
              type="primary"
              @click="onAction(sel)"
            ) {{ t('skins.equip') }}
          template(v-else)
            div.hero__pay
              FButton.hero__buy(
                size="sm"
                type="warning"
                :is-disabled="!sel.affordable || busy"
                @click="onAction(sel)"
              )
                span {{ t('skins.buy') }}
                IconCoin.hero__buy-coin
                span {{ sel.price }}
              //- Less text, same offer: the film frame carries it, and the
              //- word only appears where there is room for it (see the rank
              //- card's switch, which set this style).
              FButton.hero__ad(
                v-if="canOfferReward"
                size="sm"
                type="secondary"
                :is-disabled="busy || adInFlight"
                :aria-label="t('shop.watchAd')"
                @click="onWatch(sel)"
              )
                RewardAdIcon.hero__ad-icon
                span.hero__adword(v-if="showAdWord") {{ t('shop.watchAd') }}
            span.hero__need(v-if="!sel.affordable") {{ t('skins.needMore', { n: shortfall }) }}

    //- ── The wallet and the six materials ────────────────────────────────
    div.skins__bar(v-if="props.showWallet")
      span.skins__tagline {{ t('skins.tagline') }}
      div.skins__wallet
        IconCoin.skins__wallet-icon
        span.skins__wallet-value {{ coins }}

    div.skins__list
      button.card(
        v-for="row in rows"
        :key="row.id"
        type="button"
        :class="{ 'is-selected': row.id === selected, 'is-owned': row.owned, 'is-equipped': row.equipped, 'is-poor': !row.owned && !row.affordable }"
        :style="rimOf(row.id)"
        :aria-label="t(`skins.names.${row.id}`)"
        :aria-pressed="row.id === selected"
        @click="select(row)"
      )
        div.card__stone
          PebblePreview(type="melee" :skin="row.id" :level="1")
        span.card__name {{ t(`skins.names.${row.id}`) }}
        span.card__price(v-if="!row.owned")
          IconCoin.card__coin
          | {{ row.price }}
        span.card__state.is-equipped(v-else-if="row.equipped") {{ t('skins.equipped') }}
        span.card__state(v-else) {{ t('skins.owned') }}
</template>

<style scoped lang="sass">
.skins
  display: flex
  flex-direction: column
  gap: clamp(0.4rem, 2vw, 0.7rem)
  width: 100%

// ─── The hero ────────────────────────────────────────────────────────────────

.hero
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.35rem, 1.8vw, 0.6rem)
  padding: clamp(0.5rem, 2.4vw, 0.9rem) clamp(0.5rem, 2.4vw, 1rem)
  border: 2px solid color-mix(in srgb, var(--rim) 45%, #0f1a30)
  border-radius: clamp(0.7rem, 3vw, 1.1rem)
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--rim) 22%, transparent), transparent 60%), linear-gradient(to bottom, #141d33, #0d1424)
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 0 22px color-mix(in srgb, var(--rim) 22%, transparent)

.hero__stage
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.25rem, 1.4vw, 0.5rem)
  width: 100%

.hero__big
  position: relative
  width: clamp(4.4rem, 24vw, 7rem)
  filter: drop-shadow(0 0.35rem 0.6rem rgba(0, 0, 0, 0.65))

.hero__lv
  position: absolute
  right: -0.35em
  bottom: 0
  padding: 0.05em 0.45em
  border: 2px solid #3d2a05
  border-radius: 999px
  background-image: linear-gradient(to bottom, #ffd94a, #d99a12)
  color: #3a2504
  font-weight: 900
  font-size: clamp(0.5rem, 2.4vw, 0.7rem)
  line-height: 1.3
  white-space: nowrap
  box-shadow: 0 2px 0 #1a1204

// The five runes at Lv 1: a five-column strip, each stone filling its column.
// Four to a row, so the eight-rune roster reads as two even ranks rather than
// a row of five and a stub of three — and so the stones stay big enough to
// tell apart. The count is not pinned to the roster's length on purpose: a
// ninth rune wraps instead of shrinking everything.
.hero__row
  display: grid
  grid-template-columns: repeat(4, minmax(0, 1fr))
  gap: clamp(0.2rem, 1.4vw, 0.55rem)
  width: min(100%, 18rem)

.hero__slot
  filter: drop-shadow(0 0.2rem 0.35rem rgba(0, 0, 0, 0.6))

// A rune still to come: the socket it will sit in, and nothing that says which
// rune it is.
.hero__slot.is-locked
  display: flex
  align-items: center
  justify-content: center
  aspect-ratio: 1
  border-radius: 50%
  border: 2px dashed rgba(159, 178, 208, 0.35)
  background-color: rgba(6, 10, 22, 0.5)
  color: rgba(159, 178, 208, 0.75)
  font-weight: 900
  font-size: clamp(0.6rem, 3vw, 0.95rem)
  filter: none

.hero__caption
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  width: 100%

.hero__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.95rem, 4.6vw, 1.4rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000, 0 0 12px color-mix(in srgb, var(--rim) 60%, transparent)

.hero__blurb
  max-width: 28rem
  color: #cfe6ff
  font-size: clamp(0.62rem, 2.9vw, 0.88rem)
  line-height: 1.25
  text-align: center
  text-wrap: balance

.hero__cta
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  margin-top: 0.15rem
  min-height: 2.2rem

.hero__pay
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: center
  gap: clamp(0.3rem, 1.6vw, 0.55rem)

.hero__state
  display: inline-flex
  align-items: center
  gap: 0.3em
  padding: 0.2em 0.8em
  border: 2px solid rgba(255, 217, 60, 0.55)
  border-radius: 999px
  background-color: rgba(30, 24, 6, 0.7)
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.62rem, 2.9vw, 0.85rem)

.hero__state .hero__state-icon
  width: 1em
  height: 1em

.hero__buy :deep(.f-button__text),
.hero__adword
  white-space: nowrap

.hero__ad :deep(.f-button__text)
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.35rem

.hero__buy-coin
  flex: 0 0 auto
  width: 1.15em
  height: 1.15em
  object-fit: contain

.hero__ad-icon
  flex: 0 0 auto
  width: 1.3em
  height: 1em

.hero__need
  color: #ff9a8f
  font-weight: 900
  font-size: clamp(0.55rem, 2.6vw, 0.75rem)
  text-shadow: 1px 1px 0 #000

// ─── The bar ─────────────────────────────────────────────────────────────────

.skins__bar
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  padding-inline: 0.2rem

.skins__tagline
  min-width: 0
  color: #9fb2d0
  font-weight: 900
  text-align: left
  font-size: clamp(0.58rem, 2.7vw, 0.8rem)
  line-height: 1.2

.skins__wallet
  display: inline-flex
  flex: 0 0 auto
  align-items: center
  gap: 0.3rem
  padding: 0.1em 0.6em 0.1em 0.4em
  border: 2px solid rgba(0, 0, 0, 0.5)
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.7)

.skins__wallet-icon
  width: clamp(1rem, 4.4vw, 1.35rem)
  height: clamp(1rem, 4.4vw, 1.35rem)
  object-fit: contain

.skins__wallet-value
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.85rem, 4vw, 1.2rem)
  text-shadow: 2px 2px 0 #000

// ─── The cards ───────────────────────────────────────────────────────────────
//
// Three across on a phone, six across on a desktop: `auto-fit` with a fluid
// minimum column does that with no breakpoint, and `minmax(0, …)` keeps a card
// from ever collapsing under its stone.

.skins__list
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(clamp(4.4rem, 24vw, 6.2rem), 1fr))
  gap: clamp(0.3rem, 1.6vw, 0.55rem)

.card
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 0.9vw, 0.3rem)
  min-width: 0
  padding: clamp(0.35rem, 1.8vw, 0.6rem) clamp(0.25rem, 1.2vw, 0.4rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, #2b3c63, #1a2540)
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: translate 90ms ease-out, box-shadow 120ms ease-out

  &:active
    translate: 0 1px

  &.is-selected
    border-color: color-mix(in srgb, var(--rim) 80%, #fff)
    box-shadow: 0 0 0 0.15rem color-mix(in srgb, var(--rim) 45%, transparent), 0 0 14px color-mix(in srgb, var(--rim) 45%, transparent)

  &.is-equipped::after
    content: ''
    position: absolute
    top: -0.3rem
    right: -0.3rem
    width: 0.9rem
    height: 0.9rem
    border: 2px solid #3d2a05
    border-radius: 50%
    background-image: linear-gradient(to bottom, #ffd94a, #d99a12)

  &.is-poor
    filter: saturate(0.6) brightness(0.8)

.card__stone
  width: clamp(2.6rem, 14vw, 3.8rem)
  filter: drop-shadow(0 0.2rem 0.35rem rgba(0, 0, 0, 0.6))

.card__name
  max-width: 100%
  overflow: hidden
  color: #fff
  font-weight: 900
  text-transform: uppercase
  text-align: center
  font-size: clamp(0.55rem, 2.6vw, 0.78rem)
  line-height: 1.1
  text-overflow: ellipsis
  white-space: nowrap
  text-shadow: 2px 2px 0 #000

.card__price
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.6rem, 2.8vw, 0.85rem)
  text-shadow: 2px 2px 0 #000

.card__coin
  width: 1em
  height: 1em
  object-fit: contain

.card__state
  color: #8fffc2
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.3vw, 0.68rem)
  letter-spacing: 0.04em

  &.is-equipped
    color: #ffd93c

// ─── Landscape phone: hero left, the six materials right ─────────────────────
@media (orientation: landscape) and (max-height: 30rem)
  .skins
    display: grid
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr)
    grid-template-rows: auto minmax(0, 1fr)
    column-gap: 0.6rem
    row-gap: 0.4rem
    align-items: start

  .hero
    grid-row: 1 / 3
    gap: 0.3rem
    padding: 0.5rem 0.6rem

  .hero__big
    width: clamp(3rem, 13vh, 4.5rem)

  .hero__row
    width: min(100%, 13rem)

  .hero__blurb
    font-size: clamp(0.58rem, 1.9vh, 0.78rem)

  .skins__list
    grid-template-columns: repeat(3, minmax(0, 1fr))
    gap: 0.35rem

  .card__stone
    width: clamp(2rem, 10vh, 3rem)
</style>
