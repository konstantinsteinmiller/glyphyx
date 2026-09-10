<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import RewardAdIcon from '@/components/atoms/RewardAdIcon.vue'
import PebblePreview from '@/components/game/PebblePreview.vue'
import RuneRankCard from '@/components/organisms/RuneRankCard.vue'
import MysteryRuneCard from '@/components/organisms/MysteryRuneCard.vue'
import { RUNES, RUNE_TYPES, type RuneType } from '@/game/rules'
import useSkins from '@/use/useSkins'
import { freeRankAvailable, freeRankLeftMs, freeRankRune } from '@/use/useRuneRanks'
import { isNative } from '@/use/useUser'
import GameIcon from '@/components/icons/GameIcon.vue'
import { nextRuneUnlock, unlockRune, unlockedRunes } from '@/use/useCampaign'
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
 * ── What the ladder shows, and what it holds back ──
 *
 * Every rune keeps a rung, but only what the player can act on is named:
 *
 *   OWNED   → the full card: pips, stats, and the ways to pay.
 *   NEXT    → the one rune the campaign hands over next, as a named
 *             silhouette with the stage that gives it. The result screen has
 *             already teased this same rune, so the two surfaces agree.
 *   THE REST→ `MysteryRuneCard`: a question mark, same footprint. Its header
 *             carries the reasoning; the short version is that one concrete
 *             goal plus a countable number of unknowns behind it beats both a
 *             wall of unbuyable cards and a stub with no future in it.
 *
 * ── The nuker's early unlock, and the one exception it forces ──
 *
 * The NUKER is the last rune the campaign gives (4-1), so it is normally deep
 * in mystery. But when the ads layer can play a video the tab ends with an
 * offer to unlock it NOW — and a banner naming the Nuker directly under a card
 * hiding it would be the game contradicting itself on one screen. So while
 * that offer stands, the nuker's rung is REVEALED as a silhouette like any
 * named promise. One truth per screen: either the game is advertising this
 * rune or it is keeping it back, never both.
 */
const { t } = useI18n()
const { activeSkin } = useSkins()

const nukerOwned = computed(() => unlockedRunes.value.includes('nuker'))
const offerNuker = computed(() => !nukerOwned.value && canOfferReward.value)
const nukerStyle = computed(() => ({ '--glow': RUNES.nuker.color }))

/**
 * A rune is NAMED when the player owns it, when it is the campaign's next
 * hand-over, or when this tab is actively selling it (the nuker, above).
 * Everything else is a mystery rung.
 */
const isNamed = (type: RuneType): boolean =>
  unlockedRunes.value.includes(type)
  || nextRuneUnlock.value?.rune === type
  || (type === 'nuker' && offerNuker.value)

/** The rune this window's gift landed on, for the header's one countdown. */
const giftRune = computed(() => freeRankRune.value)

/** `freeRankLeftMs` ticks once a second; the header only ever shows mm:ss. */
const countdown = computed(() => {
  const total = Math.max(0, Math.ceil(freeRankLeftMs.value / 1000))
  const m = Math.floor(total / 60)
  const sec = total % 60
  return `${m}:${String(sec).padStart(2, '0')}`
})

/** Only a native build has the width to spell "Watch ad" out beside the frame. */
const showAdWord = isNative

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
      //- The gift's clock, ONCE. There is only ever one gift running, so a
      //- countdown per card was the same number printed nine times; the cards
      //- keep the ribbon that says WHICH rune it landed on and nothing else.
      span.ranks__gift(v-if="giftRune")
        | {{ freeRankAvailable ? t('ranks.freeIn', { t: countdown }) : t('ranks.freeTaken') }}

    //- Every rune keeps a rung; only the ones worth naming are named.
    div.ranks__grid
      template(v-for="type in RUNE_TYPES" :key="type")
        RuneRankCard(v-if="isNamed(type)" :type="type")
        MysteryRuneCard(v-else)

    //- ── The last rune, early ──────────────────────────────────────────────
    section.nuker(v-if="offerNuker" :style="nukerStyle")
      div.nuker__stone
        PebblePreview(type="nuker" :skin="activeSkin" :level="1" animated)
      div.nuker__body
        span.nuker__title {{ t('ranks.nukerUnlock') }}
        span.nuker__note {{ t('ranks.nukerLocked') }}
        //- Less text here too: the frame says "a video", the banner above it
        //- already says what is being unlocked.
        FButton.nuker__ad(
          size="sm"
          type="secondary"
          :is-disabled="busy || adInFlight"
          :aria-label="`${t('ranks.nukerUnlock')} · ${t('shop.watchAd')}`"
          @click="onUnlockNuker"
        )
          RewardAdIcon.nuker__ad-icon
          span.nuker__adword(v-if="showAdWord") {{ t('shop.watchAd') }}
          GameIcon.nuker__up(name="unlock")
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
.ranks__gift
  color: #6dffa8
  font-weight: 900
  text-align: center
  font-size: clamp(0.52rem, 2.4vw, 0.72rem)
  line-height: 1.2
  text-shadow: 1px 1px 0 #000

.ranks__grid
  display: grid
  // Denser than the power-rune grid on purpose: there are NINE rungs here and
  // the tab has to be readable without scrolling. Three across on a phone and
  // six on a desktop panel puts the whole ladder in three rows and two rows
  // respectively — the card is only a stone, a name, five stars and a price,
  // and it sizes to its own width (`container-type`), so it survives being
  // narrow instead of wrapping its buttons and growing every row.
  grid-template-columns: repeat(auto-fit, minmax(clamp(4.6rem, 26vw, 5.9rem), 1fr))
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

.nuker__adword
  white-space: nowrap

.nuker__up
  flex: 0 0 auto
  width: 1em
  height: 1em

@media (orientation: landscape) and (max-height: 30rem)
  .ranks__grid
    grid-template-columns: repeat(5, minmax(0, 1fr))
    gap: 0.3rem
</style>
