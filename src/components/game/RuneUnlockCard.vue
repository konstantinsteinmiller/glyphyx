<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PebblePreview from '@/components/game/PebblePreview.vue'
import { activeSkin } from '@/use/useSkins'
import { RUNES, SKINS, type RuneType, type SkinId } from '@/game/rules'

/**
 * ─── The prize ──────────────────────────────────────────────────────────────
 *
 * What the chest hands over, and it is meant to read as a TROPHY rather than
 * as a datasheet that happens to appear at a celebration. The stone is the
 * hero: it stands on a lit plinth, wears the rim light of its own neon, floats
 * a little as though it were being held out, and a slow gloss travels across
 * it. Everything else on the card is a caption to that.
 *
 * Two things can be in it, and both are shown as THE STONE ITSELF, painted by
 * the same `PebblePreview` the shop and the field use — so the thing unlocked
 * and the thing placed next turn are one drawing:
 *
 *   `rune` — a new rune: its stone in the player's current skin, the name, and
 *            one line of what it does.
 *   `skin` — a new material: the sword cut from it, the material's name and
 *            what makes it different.
 *
 * Exactly one of the two is given; `rune` wins if both are.
 *
 * ── Why there are no HP / ATK chips any more ──
 *
 * They were the tallest thing on the card that nobody reads. A player meeting a
 * rune for the first time is not comparing numbers — they are looking at what
 * they won. The stats are taught where they are actually used: `RuneTooltip`
 * puts them under the rune the first few times it is held, and the shop shows
 * them beside a price. Cutting them also makes the two prizes ONE shape, which
 * is what lets the card promise a bounded height.
 *
 * ── The height is bounded on purpose ──
 *
 * This card lives inside a reward overlay that must not scroll at any size the
 * game supports — 320×658 up to 1440×900, and the landscape phones at 667×375
 * and 844×390, where the whole window is shorter than this card used to be.
 * So it is sized in `vmin` (the SHORT axis, which is the one that runs out in
 * both orientations) and capped with `max-height`, and the description is
 * clamped to two lines so a long translation cannot grow it. The overlay is
 * then free to centre it instead of scrolling it.
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
/** The prize's light: the rune's neon, or the material's rim light. */
const glow = computed(() => (isRune.value ? RUNES[runeType.value].color : SKINS[skinId.value].rim))
</script>

<template lang="pug">
  div.unlock(:class="{ 'is-skin': !isRune }" :style="{ '--glow': glow }")
    span.unlock__tag {{ isRune ? t('banner.unlocked') : t('result.newSkin') }}

    //- The plinth: a pool of the prize's own light with the stone standing in
    //- it. Not a bordered box — a box says "information", a lit pedestal says
    //- "this is yours now".
    div.unlock__plinth
      span.unlock__pool(aria-hidden="true")
      div.unlock__stone
        PebblePreview(:type="runeType" :skin="skinId" :level="isRune ? 1 : 2" animated)
        //- The gloss that travels across the stone. Circular and blended, so it
        //- reads as a specular sweep on the pebble rather than as a band with
        //- square corners crossing a square box.
        span.unlock__sheen(aria-hidden="true")

    span.unlock__name {{ isRune ? t(`runes.names.${runeType}`) : t(`skins.names.${skinId}`) }}
    span.unlock__desc {{ isRune ? t(`runes.descriptions.${runeType}`) : t(`skins.blurbs.${skinId}`) }}
</template>

<style scoped lang="sass">
// The cap, in one place. `vmin` is the short axis, which is the one that runs
// out in BOTH orientations — a landscape phone is 375 px tall and a narrow
// portrait phone is 320 px wide, and this card has to survive each.
.unlock
  --unlock-max-h: min(46vmin, 17rem)

  position: relative
  display: flex
  flex: 0 1 auto
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 1vmin, 0.35rem)
  width: min(88vw, 19rem)
  max-height: var(--unlock-max-h)
  min-height: 0
  padding: clamp(0.35rem, 1.8vmin, 0.7rem) clamp(0.6rem, 2.6vmin, 1rem)
  animation: unlock-in 0.55s cubic-bezier(0.2, 1.5, 0.4, 1)

.unlock__tag
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.08em
  font-size: clamp(0.5rem, 2.2vmin, 0.7rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000

// ─── The plinth ──────────────────────────────────────────────────────────────

.unlock__plinth
  position: relative
  display: flex
  flex: 0 1 auto
  align-items: flex-end
  justify-content: center
  min-height: 0

// The light the stone stands in: an ellipse under it, in the prize's own
// colour, doubling as the shadow that plants it on something.
.unlock__pool
  position: absolute
  left: 50%
  bottom: -6%
  width: 118%
  height: 34%
  translate: -50% 0
  border-radius: 50%
  // The gradient already falls off; a blur on top of it only cost a raster.
  background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--glow) 70%, transparent), transparent 72%)
  pointer-events: none

// The stone itself, rim-lit rather than boxed, floating as though held out.
.unlock__stone
  position: relative
  width: clamp(3.2rem, 17vmin, 5.2rem)
  filter: drop-shadow(0 0.25rem 0.4rem rgba(0, 0, 0, 0.65)) drop-shadow(0 0 0.5rem color-mix(in srgb, var(--glow) 65%, transparent))
  animation: unlock-float 3.2s ease-in-out infinite

.unlock__sheen
  position: absolute
  inset: 4%
  border-radius: 50%
  overflow: hidden
  mix-blend-mode: screen
  pointer-events: none

  // A narrow diagonal band of light that crosses the stone and waits before
  // coming round again — a prize glints, it does not strobe.
  &::after
    content: ''
    position: absolute
    inset: -40%
    background: linear-gradient(66deg, transparent 42%, rgba(255, 255, 255, 0.75) 50%, transparent 58%)
    animation: unlock-sheen 3.6s ease-in-out infinite

.unlock__name
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.8rem, 3.6vmin, 1.15rem)
  line-height: 1.1
  text-align: center
  text-shadow: 2px 2px 0 #000, 0 0 0.6rem color-mix(in srgb, var(--glow) 55%, transparent)

// Two lines, hard. This is the one place a rune's rule is explained at the
// moment it is won, so it stays — but a long translation may not grow the card
// past its cap, and `line-clamp` is what keeps that a promise rather than a
// hope.
.unlock__desc
  // NEVER the element that gives way. It is a flex item in a column with a
  // hard `max-height`, so with the default `flex: 0 1 auto` it was what
  // shrank when the card hit its cap — down to ONE line, with
  // `overflow: hidden` eating the rest. Every rune unlock on a 1280x720
  // desktop read "Skips one tile and hits the", losing the word that
  // carries the rule (2026-09-12 playtest). The plinth is the shrinkable one.
  flex: 0 0 auto
  min-height: 2.5em
  display: -webkit-box
  -webkit-box-orient: vertical
  -webkit-line-clamp: 2
  line-clamp: 2
  overflow: hidden
  max-height: 2.6em
  color: #cfe6ff
  text-align: center
  font-size: clamp(0.56rem, 2.4vmin, 0.78rem)
  line-height: 1.25
  text-wrap: balance

@keyframes unlock-in
  from
    opacity: 0
    transform: scale(0.6) translateY(1rem)
  to
    opacity: 1
    transform: scale(1) translateY(0)

@keyframes unlock-float
  0%, 100%
    translate: 0 0
  50%
    translate: 0 -4%

@keyframes unlock-sheen
  0%, 62%
    transform: translateX(-115%)
  100%
    transform: translateX(115%)

// Landscape phone: the whole window is shorter than this card's portrait cap,
// so the cap comes down with it and the stone gives up the most.
@media (orientation: landscape) and (max-height: 30rem)
  .unlock
    --unlock-max-h: min(80vh, 11rem)
    width: min(44vw, 16rem)
    gap: 0.1rem
    padding: 0.3rem 0.6rem

  .unlock__stone
    width: clamp(2.4rem, 13vmin, 3.6rem)

// Everything here is decoration; none of it is information.
@media (prefers-reduced-motion: reduce)
  .unlock,
  .unlock__stone
    animation: none

  .unlock__sheen
    display: none
</style>
