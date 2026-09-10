<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import type { TabOption } from '@/components/atoms/FTabs.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import PowerRuneCard from '@/components/organisms/PowerRuneCard.vue'
import RankShopPanel from '@/components/organisms/RankShopPanel.vue'
import MysteryRuneCard from '@/components/organisms/MysteryRuneCard.vue'
import SkinsPanel from '@/components/organisms/SkinsPanel.vue'
import { RANK_HP_PER_RANK, RUNE_TYPES, type RuneType } from '@/game/rules'
import { POWER_RUNE_LEVEL } from '@/use/usePowerRunes'
import { coins } from '@/use/useEconomy'
import { unlockedRunes } from '@/use/useCampaign'

/**
 * ─── The shop ───────────────────────────────────────────────────────────────
 *
 * Three tabs under one ribbon:
 *
 *   • POWER RUNES — consumables. One of a type is armed for the next match;
 *     the first pebble of that type the player places lands at
 *     `POWER_RUNE_LEVEL` instead of Lv 1. Coins, or one rewarded video each.
 *   • RANKS — the permanent ladder, `RankShopPanel`: five ranks per rune, one
 *     maximum hit point each, coins or a video — and the rotating free gift.
 *     The only sink deep enough to hold a whole campaign's coins.
 *   • SKINS — the materials, `SkinsPanel`, coins or a video each.
 *
 * A banner strip carries the shop's name, the tab's one-line promise and the
 * wallet, so the player never has to leave to check what they can afford.
 */
export type ShopTab = 'runes' | 'ranks' | 'skins'

interface Props {
  /** Which tab opens first. */
  initialTab?: ShopTab
}
const props = withDefaults(defineProps<Props>(), { initialTab: 'runes' })
const model = defineModel<boolean>({ required: true })
const { t } = useI18n()

const tab = ref<ShopTab>(props.initialTab)
watch(model, (open) => { if (open) tab.value = props.initialTab })
watch(() => props.initialTab, (v) => { if (model.value) tab.value = v })

const tabs = computed<TabOption[]>(() => [
  { label: t('shop.tabs.runes'), value: 'runes' },
  // Deliberately short in every locale: three tabs have to fit a 320 px strip.
  { label: t('ranks.tab'), value: 'ranks' },
  { label: t('shop.tabs.skins'), value: 'skins' }
])
const onTab = (v: string | number): void => {
  tab.value = v === 'skins' ? 'skins' : v === 'ranks' ? 'ranks' : 'runes'
}

const tagline = computed(() => {
  if (tab.value === 'ranks') return t('ranks.tagline', { n: RANK_HP_PER_RANK })
  if (tab.value === 'skins') return t('skins.tagline')
  return t('shop.runesTagline', { n: POWER_RUNE_LEVEL })
})

/**
 * Only runes the player has actually unlocked are for sale. A power rune arms
 * the FIRST placement of its type, so one bought for a rune that is not in the
 * deck yet is coins spent on nothing — and with the roster now running past
 * the chapter-1 five, a shop listing all of them would sell exactly that.
 * The campaign map is where a locked rune is advertised; the shop is not.
 */
const offered = computed<readonly RuneType[]>(() =>
  RUNE_TYPES.filter((t) => unlockedRunes.value.includes(t))
)

/** Something is still to come, so the grid ends with one mystery tile. */
const hasLocked = computed(() => offered.value.length < RUNE_TYPES.length)
</script>

<template lang="pug">
  FModal(v-model="model" :tabs="tabs" :active-tab="tab" @update:active-tab="onTab")
    div.shop(:data-tab="tab")
      header.shop__banner
        div.shop__banner-text
          span.shop__title {{ t('shop.title') }}
          span.shop__tagline {{ tagline }}
        div.shop__wallet(:aria-label="t('coins')")
          IconCoin.shop__wallet-icon
          span.shop__wallet-value {{ coins }}

      div.shop__runes(v-if="tab === 'runes'")
        div.shop__grid
          PowerRuneCard(v-for="type in offered" :key="type" :type="type")
          //- ONE tile for everything still to come, never one per locked rune.
          //- Listing them would be a wall of things that cannot be bought, and
          //- drawing their stones would hand over the identities the campaign
          //- is saving — the skins tab used to do exactly that. A single
          //- question mark says "there is more" and spoils nothing.
          MysteryRuneCard(v-if="hasLocked")
        p.shop__note {{ t('shop.landsAt', { n: POWER_RUNE_LEVEL }) }}

      RankShopPanel(v-else-if="tab === 'ranks'")

      SkinsPanel(v-else :show-wallet="false")
</template>

<style scoped lang="sass">
.shop
  display: flex
  flex-direction: column
  gap: clamp(0.4rem, 2vw, 0.7rem)
  width: 100%

// ─── The banner ──────────────────────────────────────────────────────────────

.shop__banner
  display: flex
  align-items: center
  justify-content: space-between
  gap: 0.5rem
  padding: clamp(0.4rem, 2vw, 0.7rem) clamp(0.55rem, 2.6vw, 0.9rem)
  border: 2px solid #3b2a08
  border-radius: clamp(0.6rem, 2.6vw, 1rem)
  background: linear-gradient(115deg, #3a2a0c 0%, #6e4b10 45%, #3a2a0c 100%)
  box-shadow: inset 0 1px 0 rgba(255, 230, 150, 0.25), 0 3px 0 #1a1204

.shop__banner-text
  display: flex
  flex-direction: column
  min-width: 0
  gap: 0.1rem

.shop__title
  color: #fff3c4
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.06em
  font-size: clamp(0.9rem, 4.4vw, 1.3rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000

.shop__tagline
  color: #ffe9a8
  font-weight: 900
  font-size: clamp(0.56rem, 2.6vw, 0.78rem)
  line-height: 1.2

.shop__wallet
  display: inline-flex
  flex: 0 0 auto
  align-items: center
  gap: 0.3rem
  padding: 0.1em 0.6em 0.1em 0.4em
  border: 2px solid rgba(0, 0, 0, 0.5)
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.75)

.shop__wallet-icon
  width: clamp(1rem, 4.4vw, 1.35rem)
  height: clamp(1rem, 4.4vw, 1.35rem)
  object-fit: contain

.shop__wallet-value
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.85rem, 4vw, 1.2rem)
  text-shadow: 2px 2px 0 #000

// ─── The power runes ─────────────────────────────────────────────────────────
//
// Two across on a phone, three on a tablet, five on a desktop — one fluid
// column rule, no breakpoints, and a card can never collapse under its stone.

.shop__runes
  display: flex
  flex-direction: column
  gap: clamp(0.35rem, 1.8vw, 0.6rem)

.shop__grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(clamp(7.4rem, 40vw, 9.5rem), 1fr))
  gap: clamp(0.35rem, 1.8vw, 0.6rem)

.shop__note
  margin: 0
  color: #9fb2d0
  font-weight: 900
  text-align: center
  font-size: clamp(0.56rem, 2.6vw, 0.78rem)
  line-height: 1.25
  text-wrap: balance

// ─── Landscape phone ─────────────────────────────────────────────────────────
@media (orientation: landscape) and (max-height: 30rem)
  .shop__banner
    padding: 0.35rem 0.6rem

  .shop__grid
    grid-template-columns: repeat(3, minmax(0, 1fr))
    gap: 0.35rem
</style>
