<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FHudButton from '@/components/atoms/FHudButton.vue'
import ShopModal, { type ShopTab } from '@/components/organisms/ShopModal.vue'
import { powerRuneTotal } from '@/use/usePowerRunes'
import { freeRankAvailable, freeRankRune } from '@/use/useRuneRanks'

/**
 * The shop's HUD chip and its modal, as one feature (the Button+Modal
 * template every meta feature follows). The badge counts the power runes in
 * stock — armed for the next match — so a player who bought one sees it
 * waiting from the field. `open(tab)` is exposed for the result screen's
 * "skins" button, which opens straight onto the materials.
 *
 * ── The gift has to be visible from the field ──
 *
 * The rotating free rank is the game's retention hook, and a hook nobody can
 * see is not one: a player would have to open the shop and change tabs to
 * discover a gift that expires in twenty minutes. So when one is waiting the
 * chip wears a pulsing dot INSTEAD of the stock count (a gift outranks an
 * inventory number — the count is still there when the shop opens), and the
 * button lands on the Ranks tab rather than the power runes.
 */
const { t } = useI18n()
const isOpen = ref(false)
const tab = ref<ShopTab>('runes')

/** A free rank is waiting on a rune the player can actually spend it on. */
const giftWaiting = computed(() => freeRankAvailable.value && freeRankRune.value !== null)

const open = (which?: ShopTab): void => {
  // No argument = "the player tapped the chip": send them where the news is.
  tab.value = which ?? (giftWaiting.value ? 'ranks' : 'runes')
  isOpen.value = true
}
defineExpose({ open, isOpen })
</script>

<template lang="pug">
  div.shop-button
    FHudButton(
      tone="gold"
      icon="shop"
      :aria-label="t('shop.title')"
      @click="open()"
    )
      //- A waiting gift outranks the stock count: one dot, pulsing, and the
      //- tap lands on the tab that holds it.
      template(#badge v-if="giftWaiting")
        span.shop-button__gift(:aria-label="t('ranks.freeGift')")
      template(#badge v-else-if="powerRuneTotal > 0")
        span.shop-button__count {{ powerRuneTotal }}
    ShopModal(v-model="isOpen" :initial-tab="tab")
</template>

<style scoped lang="sass">
.shop-button
  display: inline-flex

.shop-button__count
  color: #3a2504
  font-weight: 900
  font-size: clamp(0.55rem, 2.6vw, 0.75rem)
  line-height: 1

// The gift: a filled dot that breathes. No glyph and no number — at badge size
// either would be mush, and the only thing it has to say is "something new".
.shop-button__gift
  display: block
  width: clamp(0.4rem, 1.9vw, 0.55rem)
  aspect-ratio: 1
  border-radius: 50%
  background: #fff6b8
  box-shadow: 0 0 0.35rem #ffd93c, 0 0 0.9rem rgba(255, 217, 60, 0.65)
  animation: shop-gift-pulse 1.6s ease-in-out infinite

@keyframes shop-gift-pulse
  0%, 100%
    transform: scale(1)
    opacity: 1
  50%
    transform: scale(1.35)
    opacity: 0.75

// A player who has asked for less motion gets the dot without the breathing.
@media (prefers-reduced-motion: reduce)
  .shop-button__gift
    animation: none
</style>
