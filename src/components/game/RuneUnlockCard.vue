<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { activeSkin } from '@/use/useSkins'
import { RUNES, SKINS, statsFor, type RuneType, type SkinId } from '@/game/rules'

/**
 * The card a chest hands over.
 *
 * Two things can be in it, and both are shown as THE STONE ITSELF, painted by
 * the same `PebblePreview` the shop and the field use — so the thing unlocked
 * and the thing placed next turn are one drawing:
 *
 *   `rune` — a new rune: its stone in the player's current skin, the name, one
 *            line of what it does, and its Lv 1 numbers.
 *   `skin` — a new material: the sword cut from it, the material's name and
 *            what makes it different.
 *
 * Exactly one of the two is given; `rune` wins if both are.
 */
interface Props {
  rune?: RuneType | null
  skin?: SkinId | null
}
const props = withDefaults(defineProps<Props>(), { rune: null, skin: null })
const { t } = useI18n()

const isRune = computed(() => props.rune !== null)
const runeType = computed<RuneType>(() => props.rune ?? 'melee')
const skinId = computed<SkinId>(() => (isRune.value ? activeSkin.value : (props.skin ?? activeSkin.value)))
/** The card's glow: the rune's neon, or the material's rim light. */
const glow = computed(() => (isRune.value ? RUNES[runeType.value].color : SKINS[skinId.value].rim))
const stats = computed(() => statsFor(runeType.value, 1))
</script>

<template lang="pug">
  div.unlock(:class="{ 'is-skin': !isRune }" :style="{ '--glow': glow }")
    span.unlock__tag {{ isRune ? t('banner.unlocked') : t('result.newSkin') }}
    div.unlock__stone
      PebblePreview(:type="runeType" :skin="skinId" :level="isRune ? 1 : 2" animated)
    template(v-if="isRune")
      span.unlock__name {{ t(`runes.names.${runeType}`) }}
      span.unlock__desc {{ t(`runes.descriptions.${runeType}`) }}
      div.unlock__stats
        span.unlock__stat
          span.unlock__stat-key {{ t('runes.hp') }}
          span.unlock__stat-val {{ stats.hp }}
        span.unlock__stat
          span.unlock__stat-key {{ t('runes.atk') }}
          span.unlock__stat-val {{ stats.atk }}
    template(v-else)
      span.unlock__name {{ t(`skins.names.${skinId}`) }}
      span.unlock__desc {{ t(`skins.blurbs.${skinId}`) }}
</template>

<style scoped lang="sass">
.unlock
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.2rem, 1.2vmin, 0.4rem)
  width: min(88vw, 20rem)
  padding: clamp(0.5rem, 2.4vmin, 0.9rem) clamp(0.7rem, 3vmin, 1.2rem)
  border: 2px solid color-mix(in srgb, var(--glow) 55%, transparent)
  border-radius: clamp(0.7rem, 3vmin, 1.1rem)
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--glow) 22%, transparent), rgba(10, 16, 30, 0.9) 70%)
  box-shadow: 0 0 18px color-mix(in srgb, var(--glow) 35%, transparent)
  animation: unlock-in 0.5s cubic-bezier(0.2, 1.5, 0.4, 1)

.unlock__tag
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.08em
  font-size: clamp(0.55rem, 2.6vmin, 0.75rem)
  text-shadow: 2px 2px 0 #000

// The stone: sized on the short axis so it is big in both orientations and
// never taller than the card can afford. The preview fills this box.
.unlock__stone
  width: clamp(4rem, 22vmin, 6.5rem)
  filter: drop-shadow(0 0.3rem 0.5rem rgba(0, 0, 0, 0.6))

.unlock__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.85rem, 4.2vmin, 1.25rem)
  line-height: 1.1
  text-align: center
  text-shadow: 2px 2px 0 #000

.unlock__desc
  color: #cfe6ff
  text-align: center
  font-size: clamp(0.6rem, 2.8vmin, 0.85rem)
  line-height: 1.25
  text-wrap: balance

.unlock__stats
  display: flex
  gap: clamp(0.4rem, 2vmin, 0.8rem)

.unlock__stat
  display: inline-flex
  align-items: baseline
  gap: 0.25em
  padding: 0.1em 0.55em
  border-radius: 999px
  background-color: rgba(0, 0, 0, 0.35)

.unlock__stat-key
  color: #9fb2d0
  font-weight: 900
  font-size: clamp(0.5rem, 2.3vmin, 0.68rem)
  letter-spacing: 0.04em

.unlock__stat-val
  color: #fff
  font-weight: 900
  font-size: clamp(0.7rem, 3.2vmin, 0.95rem)
  text-shadow: 1px 1px 0 #000

@keyframes unlock-in
  from
    opacity: 0
    transform: scale(0.6) translateY(1rem)
  to
    opacity: 1
    transform: scale(1) translateY(0)

// Landscape phone: the card sits beside the chest, so it trades height for width.
@media (orientation: landscape) and (max-height: 30rem)
  .unlock
    width: min(44vw, 18rem)
    gap: 0.15rem
    padding: 0.4rem 0.7rem

  .unlock__stone
    width: clamp(3rem, 16vmin, 4.5rem)
</style>
