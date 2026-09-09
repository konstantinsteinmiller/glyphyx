<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import PebblePreview from '@/components/game/PebblePreview.vue'
import RuneRankCard from '@/components/organisms/RuneRankCard.vue'
import { RUNES, RUNE_TYPES } from '@/game/rules'
import useSkins from '@/use/useSkins'
import { unlockRune, unlockedRunes } from '@/use/useCampaign'
import { adInFlight, canOfferReward, watchRewarded } from '@/use/useAdGate'
import { playFx } from '@/use/useGameAudio'

/**
 * ─── The ranks tab ──────────────────────────────────────────────────────────
 *
 * The whole roster as a ladder: one card per rune, five ranks each, +1 maximum
 * hit point per rank. It is the game's only bottomless coin sink, and — through
 * the rotating free gift one of these cards is wearing at any moment — the one
 * reason to open the app that is not a match.
 *
 * Runes the player has not unlocked yet stay in the grid, greyed. That is
 * deliberate: the ladder is also a picture of the roster, and a gap where a
 * rune will be is a goal. The one thing that gap can be acted on is the NUKER,
 * the last rune the campaign gives (4-1) — so when it is still locked and the
 * ads layer can play a video, the tab ends with an offer to unlock it now. It
 * appears only under both conditions: with no video to play there is nothing to
 * offer, and the campaign hands it over regardless.
 */
const { t } = useI18n()
const { activeSkin } = useSkins()

const nukerOwned = computed(() => unlockedRunes.value.includes('nuker'))
const offerNuker = computed(() => !nukerOwned.value && canOfferReward.value)
const nukerStyle = computed(() => ({ '--glow': RUNES.nuker.color }))

const busy = ref(false)

const onUnlockNuker = async (): Promise<void> => {
  if (busy.value || adInFlight.value) return
  busy.value = true
  try {
    // The rune is granted ONLY on a granted video: a no-fill or a dismissal
    // hands over nothing, exactly as every other rewarded surface behaves.
    if (await watchRewarded('nukerUnlock')) {
      if (unlockRune('nuker')) playFx('unlock')
    }
  } finally {
    busy.value = false
  }
}
</script>

<template lang="pug">
  div.ranks
    //- The tagline is NOT repeated here: the shop's own banner already carries
    //- it for whichever tab is open, and printing it twice, three lines apart,
    //- read as a mistake rather than as emphasis.
    header.ranks__head
      span.ranks__title {{ t('ranks.title') }}

    div.ranks__grid
      RuneRankCard(v-for="type in RUNE_TYPES" :key="type" :type="type")

    //- ── The last rune, early ──────────────────────────────────────────────
    section.nuker(v-if="offerNuker" :style="nukerStyle")
      div.nuker__stone
        PebblePreview(type="nuker" :skin="activeSkin" :level="1" animated)
      div.nuker__body
        span.nuker__title {{ t('ranks.nukerUnlock') }}
        span.nuker__note {{ t('ranks.nukerLocked') }}
        FButton.nuker__ad(
          size="sm"
          type="secondary"
          :is-disabled="busy || adInFlight"
          @click="onUnlockNuker"
        )
          RewardAdIcon.nuker__ad-icon
          span {{ t('shop.watchAd') }}
</template>

<style scoped lang="sass">
.ranks
  display: flex
  flex-direction: column
  gap: clamp(0.35rem, 1.8vw, 0.6rem)

.ranks__head
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1rem
  text-align: center

.ranks__title
  color: #fff
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.05em
  font-size: clamp(0.78rem, 3.6vw, 1.05rem)
  text-shadow: 2px 2px 0 #000

// Two across on a phone, more as the room appears — the same fluid column rule
// the power-rune grid uses, so the two tabs feel like one shop.
.ranks__grid
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(clamp(6.6rem, 36vw, 8.6rem), 1fr))
  gap: clamp(0.35rem, 1.8vw, 0.6rem)
  // The gift ribbon sits above its card's top edge; without a little room the
  // first row would clip it against the grid's bounding box.
  padding-top: 0.55rem

// ─── The nuker's early unlock ───────────────────────────────────────────────

.nuker
  display: flex
  align-items: center
  gap: clamp(0.5rem, 2.4vw, 0.9rem)
  padding: clamp(0.4rem, 2vw, 0.7rem) clamp(0.5rem, 2.4vw, 0.85rem)
  border: 2px solid color-mix(in srgb, var(--glow) 55%, #0f1a30)
  border-radius: clamp(0.7rem, 3vw, 1.1rem)
  background: radial-gradient(ellipse at 12% 50%, color-mix(in srgb, var(--glow) 22%, transparent), transparent 60%), linear-gradient(to bottom, #1b2145, #0e1528)
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px color-mix(in srgb, var(--glow) 22%, transparent)

.nuker__stone
  flex: 0 0 auto
  width: clamp(2.8rem, 15vw, 4rem)
  filter: drop-shadow(0 0.25rem 0.45rem rgba(0, 0, 0, 0.7))

.nuker__body
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 0.15rem
  min-width: 0

.nuker__title
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.68rem, 3.2vw, 0.95rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000, 0 0 10px color-mix(in srgb, var(--glow) 55%, transparent)

.nuker__note
  color: #cfe6ff
  font-size: clamp(0.52rem, 2.4vw, 0.72rem)
  line-height: 1.25
  text-wrap: balance

.nuker__ad
  margin-top: 0.15rem

.nuker__ad :deep(.f-button__text)
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 0.3rem

.nuker__ad-icon
  flex: 0 0 auto
  width: 1.3em
  height: 1em

@media (orientation: landscape) and (max-height: 30rem)
  .ranks__grid
    grid-template-columns: repeat(5, minmax(0, 1fr))
    gap: 0.3rem
</style>
