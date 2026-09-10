<script setup lang="ts">
/**
 * ─── The plane the prize stands on ──────────────────────────────────────────
 *
 * A reward screen that is only a dimmed board with a card on it reads as a
 * dialog. This is what turns it into a STAGE: a sunburst of alternating lit and
 * shadowed rays turning slowly behind the prize, a pool of light at their
 * centre for the prize to sit in, and a vignette pulling the edges down so the
 * eye has nowhere else to go.
 *
 * ── The layers, back to front ──
 *
 *   bloom     a soft radial pool in the prize's own colour. It is the BOTTOM
 *             layer and it shows through the middle of the rays, because the
 *             rays are masked away there — so the prize never has a spoke
 *             running behind it, and always has light under it.
 *   rays back a wide, slow, dim sunburst turning one way…
 *   rays front …and a finer, faster, brighter one turning the other. Two of
 *             them is what makes the light read as three-dimensional rather
 *             than as a wagon wheel; one alone is a spinning graphic.
 *   vignette  the outer dark. Without it the rays run into the screen edges
 *             and the whole thing looks like wallpaper instead of a stage.
 *
 * ── Light AND dark rays ──
 *
 * The wedges alternate lit and SHADOWED rather than lit and transparent. A
 * shadowed wedge is what gives the sunburst its contrast on an already-dark
 * backdrop, where a transparent gap would simply be more backdrop. Both the lit
 * and the dark wedge are `color-mix`ed against the tone, so the effect works
 * for a gold chest, an acid-green warhead or a cold blue shield without anyone
 * choosing companion colours per rune.
 *
 * ── Cost ──
 *
 * Pure CSS: two gradient elements and two transforms, composited on the GPU.
 * No canvas (the confetti owns that), no per-frame JavaScript, and no
 * `filter: blur()` on a moving element — a blur that size re-rasterises every
 * frame on a phone, and a gradient IS the blur.
 *
 * ── It must never eat a tap ──
 *
 * `pointer-events: none`, and that is load-bearing rather than tidy: a tap
 * anywhere on the reward overlay is what continues to the next screen, so a
 * decorative layer that swallows the tap strands the player on the reward.
 */
interface Props {
  /** The plane is up: rays turning, bloom breathing. */
  active?: boolean
  /** The lid just came off — flare, once. Flipping false→true fires the beat. */
  burst?: boolean
  /** The prize's own colour; the rays and the bloom take their tint from it. */
  tone?: string
}
withDefaults(defineProps<Props>(), {
  active: false,
  burst: false,
  tone: '#ffd93c'
})
</script>

<template lang="pug">
  //- Decoration only: it says nothing a screen reader needs, and the prize
  //- itself carries the announcement.
  div.reward-stage(
    v-if="active"
    :class="{ 'is-burst': burst }"
    :style="{ '--tone': tone }"
    aria-hidden="true"
  )
    span.reward-stage__bloom
    span.reward-stage__rays.is-back
    span.reward-stage__rays.is-front
    span.reward-stage__vignette
</template>

<style scoped lang="sass">
.reward-stage
  position: fixed
  inset: 0
  z-index: 0
  // Load-bearing: the overlay's own click is what continues to the next
  // screen. See the header.
  pointer-events: none
  // The ray discs are deliberately larger than the viewport so a rotation
  // never swings an empty corner into view; nothing may leak a scrollbar.
  overflow: hidden

// ─── The pool of light the prize stands in ──────────────────────────────────

.reward-stage__bloom
  position: absolute
  left: 50%
  top: 50%
  width: 120vmax
  aspect-ratio: 1
  translate: -50% -50%
  border-radius: 50%
  background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--tone) 62%, transparent) 0%, color-mix(in srgb, var(--tone) 26%, transparent) 22%, color-mix(in srgb, var(--tone) 8%, transparent) 42%, transparent 66%)
  opacity: 0.85
  animation: stage-breathe 3.4s ease-in-out infinite

// ─── The sunburst ───────────────────────────────────────────────────────────
//
// `repeating-conic-gradient` draws the wedges with hard edges, which is what a
// sunburst wants — a smooth one reads as a smear. The mask does two jobs: it
// empties the CENTRE so the prize sits on the bloom rather than on spokes, and
// it fades the RIM so the rays dissolve instead of ending in a hard circle.

.reward-stage__rays
  position: absolute
  left: 50%
  top: 50%
  width: 230vmax
  aspect-ratio: 1
  translate: -50% -50%
  border-radius: 50%
  mask-image: radial-gradient(circle at 50% 50%, transparent 0 9%, #000 30%, #000 55%, transparent 84%)
  -webkit-mask-image: radial-gradient(circle at 50% 50%, transparent 0 9%, #000 30%, #000 55%, transparent 84%)
  will-change: rotate

  // The wide, slow one: the body of the light.
  &.is-back
    background: repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in srgb, var(--tone) 34%, transparent) 0deg 16deg, color-mix(in srgb, var(--tone) 10%, rgba(0, 0, 0, 0.72)) 16deg 28deg)
    opacity: 0.55
    animation: stage-sway 11s ease-in-out infinite

  // …and the finer, brighter one turning against it.
  &.is-front
    background: repeating-conic-gradient(from 6deg at 50% 50%, color-mix(in srgb, var(--tone) 62%, transparent) 0deg 8deg, color-mix(in srgb, var(--tone) 6%, rgba(0, 0, 0, 0.55)) 8deg 17.2deg)
    opacity: 0.42
    animation: stage-sway-back 8.5s ease-in-out infinite

// ─── The outer dark ─────────────────────────────────────────────────────────

.reward-stage__vignette
  position: absolute
  inset: 0
  background: radial-gradient(ellipse at 50% 48%, transparent 34%, rgba(4, 7, 16, 0.5) 72%, rgba(3, 5, 12, 0.82) 100%)

// ─── The lid coming off ─────────────────────────────────────────────────────
//
// One beat, ~700 ms, and it settles back to exactly the idle values so the
// animation can simply end and hold rather than needing to be cleaned up.

.reward-stage.is-burst
  .reward-stage__bloom
    animation: stage-flash 0.7s cubic-bezier(0.16, 1, 0.3, 1), stage-breathe 3.4s ease-in-out 0.7s infinite

  .reward-stage__rays.is-back
    animation: stage-kick 0.7s cubic-bezier(0.16, 1, 0.3, 1), stage-sway 11s ease-in-out 0.7s infinite

  .reward-stage__rays.is-front
    animation: stage-kick 0.7s cubic-bezier(0.16, 1, 0.3, 1), stage-sway-back 8.5s ease-in-out 0.7s infinite

// A SWAY, not a turn. Half as many rays, each more than twice as wide, means a
// full rotation reads as a wheel going round rather than as light — so the fans
// drift a few degrees and come back, in opposite directions and on periods that
// do not divide into each other, so they never settle into a pattern.
@keyframes stage-sway
  0%, 100%
    rotate: -3.5deg
  50%
    rotate: 3.5deg

@keyframes stage-sway-back
  0%, 100%
    rotate: 2.5deg
  50%
    rotate: -2.5deg

@keyframes stage-breathe
  0%, 100%
    opacity: 0.72
    scale: 1
  50%
    opacity: 0.95
    scale: 1.05

@keyframes stage-flash
  0%
    opacity: 1
    scale: 0.55
  35%
    opacity: 1
    scale: 1.22
  100%
    opacity: 0.72
    scale: 1

@keyframes stage-kick
  0%
    scale: 0.72
    filter: brightness(2.1)
  45%
    scale: 1.06
    filter: brightness(1.35)
  100%
    scale: 1
    filter: brightness(1)

// A player who has asked for less motion still gets the stage — a static
// sunburst and its pool of light — because the plane is what says "this is a
// prize". What they do not get is anything that turns, breathes or flares.
@media (prefers-reduced-motion: reduce)
  .reward-stage__bloom,
  .reward-stage__rays,
  .reward-stage.is-burst .reward-stage__bloom,
  .reward-stage.is-burst .reward-stage__rays
    animation: none
    scale: 1
    filter: none
</style>
