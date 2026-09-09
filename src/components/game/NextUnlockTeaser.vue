<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { nextRuneUnlock } from '@/use/useCampaign'
import { activeSkin } from '@/use/useSkins'
import { RUNES } from '@/game/rules'

/**
 * ─── The carrot ─────────────────────────────────────────────────────────────
 *
 * A new player has no way of knowing that the campaign hands out RUNES — the
 * chest that opens after 1-1 is a surprise, and a surprise nobody is waiting
 * for is not a goal. So every screen where the player pauses says which stage
 * pays the next one, and shows the stone itself:
 *
 *     Win Stage 2-1 for   ▸   [ the stone ]  CLEAVER
 *
 * The stone is painted by the SAME painter the field and the shop use
 * (`PebblePreview`), so the thing being promised and the thing that will land
 * in the hand are one drawing — and it is mid size on purpose: bigger than a
 * HUD icon so it reads as a prize, smaller than the unlock card's hero stone
 * so the reveal at the chest is still the bigger moment.
 *
 * `useCampaign.nextRuneUnlock` decides WHAT (the next node whose chest holds a
 * rune the player does not own) and returns `null` once the roster is
 * complete — at which point this renders nothing at all.
 *
 * The visible text is a fragment ("Win Stage 2-1 for"), so the band carries
 * the whole sentence as its label and hides its parts from the reader.
 */
interface Props {
  /** The result screen on a short landscape phone: same band, less of it. */
  compact?: boolean
  /** Breathe the stone's glow. One teaser is a hero preview; a grid of them would not be. */
  animated?: boolean
}
withDefaults(defineProps<Props>(), { compact: false, animated: true })

const { t } = useI18n()

const next = computed(() => nextRuneUnlock.value)
/** The band's tint: the rune's own neon, as the unlock card does it. */
const glow = computed(() => (next.value ? RUNES[next.value.rune].color : '#ffd93c'))
const label = computed(() => (next.value
  ? t('campaign.nextUnlockAria', {
    c: next.value.chapter, n: next.value.index, rune: t(`runes.names.${next.value.rune}`)
  })
  : ''))
</script>

<template lang="pug">
  div.teaser(
    v-if="next"
    role="img"
    :class="{ 'is-compact': compact }"
    :style="{ '--glow': glow }"
    :aria-label="label"
  )
    div.teaser__text(aria-hidden="true")
      span.teaser__line {{ t('campaign.nextUnlock', { c: next.chapter, n: next.index }) }}
      span.teaser__name {{ t(`runes.names.${next.rune}`) }}
    div.teaser__stone(aria-hidden="true")
      PebblePreview(:type="next.rune" :skin="activeSkin" :level="1" :animated="animated")
</template>

<style scoped lang="sass">
.teaser
  display: inline-flex
  align-items: center
  gap: clamp(0.4rem, 2vmin, 0.8rem)
  max-width: min(92vw, 22rem)
  padding: clamp(0.2rem, 1.2vmin, 0.4rem) clamp(0.5rem, 2.4vmin, 0.85rem)
  border: 2px solid color-mix(in srgb, var(--glow) 45%, transparent)
  border-radius: clamp(0.5rem, 2.4vmin, 0.85rem)
  background: linear-gradient(to bottom, color-mix(in srgb, var(--glow) 14%, rgba(8, 14, 28, 0.86)), rgba(8, 14, 28, 0.86))
  box-shadow: 0 0 0.9rem color-mix(in srgb, var(--glow) 22%, transparent)
  user-select: none
  -webkit-user-select: none

.teaser__text
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 0.05rem
  min-width: 0

// The fragment: quiet, because the eye is meant to travel on to the stone.
.teaser__line
  color: #cfe6ff
  font-weight: 700
  line-height: 1.15
  font-size: clamp(0.56rem, 2.5vmin, 0.78rem)
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.85)
  text-wrap: balance

.teaser__name
  color: var(--glow)
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.03em
  line-height: 1.1
  font-size: clamp(0.7rem, 3.2vmin, 1rem)
  text-shadow: 2px 2px 0 #000

// Mid size: a prize, not an icon — and never the hero stone of the unlock card.
.teaser__stone
  flex: 0 0 auto
  width: clamp(2.4rem, 11vmin, 3.4rem)
  filter: drop-shadow(0 0.2rem 0.35rem rgba(0, 0, 0, 0.6))

// The result screen on a short landscape phone: the band gives up height so
// the ×3 button and the actions under it keep theirs.
.teaser.is-compact
  gap: 0.4rem
  padding: 0.15rem 0.5rem

  .teaser__stone
    width: clamp(1.9rem, 8vmin, 2.6rem)

  .teaser__line
    font-size: clamp(0.5rem, 2.2vmin, 0.68rem)

  .teaser__name
    font-size: clamp(0.62rem, 2.8vmin, 0.85rem)

@media (orientation: landscape) and (max-height: 30rem)
  .teaser
    gap: 0.4rem
    padding: 0.15rem 0.5rem

  .teaser__stone
    width: clamp(1.9rem, 8vmin, 2.6rem)
</style>
