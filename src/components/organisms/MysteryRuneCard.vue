<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * ─── An unknown rung on the ladder ──────────────────────────────────────────
 *
 * A rune the player has not reached yet and is not about to: no name, no
 * stone, no stage — a question mark on a dark plate.
 *
 * ── Why this and not "hide it", and not "show them all" ──
 *
 * The rank ladder shows nine runes, and early on the player owns one of them.
 * Listing all nine with prices makes the tab a wall of things that cannot be
 * bought; hiding the eight makes it a stub with no future in it. Neither one
 * gives the player anything to want.
 *
 * So the ladder is: everything owned, then exactly ONE named promise (the rune
 * the campaign hands over next, which the result screen has already teased),
 * then a visible number of unknown rungs. One concrete goal is what a session
 * is spent on; the unknowns behind it are what makes tomorrow interesting. A
 * fully hidden item cannot be wanted specifically, and a fully revealed list is
 * a chore — this is the shape that serves both playtime and D1.
 *
 * The card therefore keeps the FOOTPRINT of a real one. It is a rung with the
 * light off, not a hole in the ladder: the player can count what is left.
 *
 * It is deliberately not a BUTTON — not focusable, nothing to activate, no
 * promise of an action, because there is none to offer.
 *
 * It does answer a tap, though. A six-year-old in the shop audit pressed these
 * cards over and over and got nothing back at all, and read the whole game as
 * broken: "it just sits there". Silence is not the same as honesty. So a press
 * gives it a small shake — the universal "not this one, not yet" — which says
 * the game heard you without pretending the card can be opened.
 */
const { t } = useI18n()

const nudging = ref(false)
let nudgeTimer: ReturnType<typeof setTimeout> | null = null

const nudge = (): void => {
  if (nudging.value) return
  nudging.value = true
  nudgeTimer = setTimeout(() => { nudging.value = false; nudgeTimer = null }, 420)
}
onBeforeUnmount(() => { if (nudgeTimer !== null) clearTimeout(nudgeTimer) })
</script>

<template lang="pug">
  //- `role="img"` with one whole-sentence label: a screen reader should hear
  //- "a rune you have not unlocked yet", not "question mark, question mark".
  article.mrc(
    role="img"
    :aria-label="t('ranks.mysteryAria')"
    :class="{ 'is-nudging': nudging }"
    @pointerdown="nudge"
  )
    div.mrc__stage(aria-hidden="true")
      span.mrc__plate
      span.mrc__sheen
      span.mrc__mark ?
    span.mrc__name(aria-hidden="true") {{ t('ranks.mystery') }}
    span.mrc__hint(aria-hidden="true") {{ t('ranks.mysteryHint') }}
</template>

<style scoped lang="sass">
// The frame matches `RuneRankCard`'s so the grid stays a grid — same border
// weight, same radius, same padding — but the tint is NEUTRAL slate. A rune's
// own neon here would hand over its identity, which is the one thing this card
// exists not to do.
.mrc
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: clamp(0.15rem, 1vw, 0.3rem)
  min-width: 0
  // A FLOOR, not a height. This card keeps the footprint of a real rung so the
  // ladder can be counted — but the grid already stretches every cell to its
  // row, so a tall minimum here does not match the real cards, it OVERRULES
  // them: at 12rem it was setting a 192 px row for cards whose content is 144,
  // and three of those rows are what put the tab into a scroll. The floor now
  // only guards a row that happens to be all mystery.
  min-height: clamp(5rem, 26vw, 7rem)
  padding: clamp(0.45rem, 2.2vw, 0.8rem) clamp(0.35rem, 1.8vw, 0.6rem)
  border: 2px solid #26314f
  border-radius: clamp(0.7rem, 3vw, 1.1rem)
  background: radial-gradient(ellipse at 50% 40%, rgba(126, 156, 214, 0.1), transparent 62%), linear-gradient(to bottom, #131b31, #0b1120)
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03)
  overflow: hidden
  // Inert by construction: nothing to press, nothing to select, no cursor
  // promising otherwise.
  cursor: default
  user-select: none
  -webkit-user-select: none

  // Pressed: a shake, and the hint brightens for the length of it. Nothing
  // opens, and nothing pretends to.
  &.is-nudging
    animation: mrc-nudge 0.42s ease-in-out

  &.is-nudging .mrc__hint
    color: #a9c0e6

.mrc__stage
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: clamp(3.4rem, 18vw, 5rem)
  aspect-ratio: 1

// A recessed disc where the stone would sit — the socket the rune will drop
// into, so the card reads as WAITING rather than as failed to load.
.mrc__plate
  position: absolute
  inset: 6%
  border-radius: 50%
  background: radial-gradient(circle at 50% 35%, #1c2745, #0a1020 70%)
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.75), inset 0 -1px 0 rgba(255, 255, 255, 0.05)

.mrc__mark
  position: relative
  color: #7e9cd6
  font-weight: 900
  font-size: clamp(1.6rem, 9vw, 2.6rem)
  line-height: 1
  text-shadow: 0 2px 0 #05080f, 0 0 14px rgba(126, 156, 214, 0.45)

// A slow sheen drifting across the plate: the one thing that says this card is
// alive and holding something back, rather than switched off.
.mrc__sheen
  position: absolute
  inset: 0
  border-radius: 50%
  background: linear-gradient(115deg, transparent 38%, rgba(180, 205, 255, 0.16) 50%, transparent 62%)
  background-size: 260% 100%
  animation: mrc-sheen 4.5s ease-in-out infinite

.mrc__name
  color: #7e9cd6
  font-weight: 900
  letter-spacing: 0.14em
  font-size: clamp(0.66rem, 3.1vw, 0.92rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000

.mrc__hint
  color: #6b7d9e
  text-align: center
  font-size: clamp(0.5rem, 2.3vw, 0.68rem)
  line-height: 1.25
  text-wrap: balance

@keyframes mrc-sheen
  0%
    background-position: 130% 0
  55%, 100%
    background-position: -30% 0

@keyframes mrc-nudge
  0%, 100%
    translate: 0 0
  20%
    translate: -3% 0
  45%
    translate: 2.4% 0
  70%
    translate: -1.4% 0

@media (prefers-reduced-motion: reduce)
  .mrc__sheen
    animation: none
    opacity: 0.5

  // The shake goes; the hint still brightens, so a press is still answered.
  .mrc.is-nudging
    animation: none
</style>
