<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * ─── The stage banner ───────────────────────────────────────────────────────
 *
 * Rides over the board for a moment at the start of every match — stage,
 * mode, who you are facing — and flashes SUDDEN DEATH when the turn limit runs
 * out on a tie. Deliberately not dismissable and deliberately without a
 * button: there is nothing to decide here, the planning clock is already
 * running underneath it.
 */
const { t } = useI18n()

interface Props {
  show: boolean
  chapter: number
  node: number
  mode: '1v1' | 'siege'
  /** The lead faction's display name, already translated. */
  foe: string
  /** The sudden-death variant: one line, red, urgent. */
  suddenDeath?: boolean
  /** What winning THIS match means. Named here because nowhere else named it. */
  objective?: 'conquest' | 'eliminate' | 'siege' | null
  /**
   * Where to centre the banner vertically, in CSS px — the BOARD's own centre,
   * handed over by the scene.
   *
   * Without it the banner sat at a flat 34% of the viewport, which knows
   * nothing about where the board ended up. In landscape the goal track is
   * positioned from the renderer's geometry just above the board, and 34% of a
   * short screen lands on top of it: the banner and the track printed over each
   * other. Anchoring to the board cannot collide with something that sits
   * outside the board by construction.
   */
  centerY?: number | null
}
const props = withDefaults(defineProps<Props>(), { suddenDeath: false, objective: null, centerY: null })

/** Falls back to the old 34% when the scene has no geometry yet. */
const placement = computed(() => (props.centerY == null ? {} : { top: `${props.centerY}px` }))
</script>

<template lang="pug">
  Transition(name="turn-banner")
    div.turn-banner(v-if="show" :class="{ 'is-sudden': suddenDeath }" :style="placement" aria-live="polite")
      template(v-if="suddenDeath")
        div.turn-banner__sudden {{ t('hud.suddenDeath') }}
      template(v-else)
        div.turn-banner__stage {{ t('hud.stage', { c: chapter, n: node }) }}
        div.turn-banner__mode
          span.turn-banner__mode-name {{ mode === 'siege' ? t('banner.siege') : t('banner.duel') }}
          span.turn-banner__vs {{ t('banner.vs', { name: foe }) }}
        //- The rule of the match, in words. Three blind testers cleared the
        //- whole tutorial without ever being told what winning meant — one
        //- found "destroy every enemy rune" only by backing out to the
        //- campaign map (2026-09-12). The map's own string, said here.
        div.turn-banner__goal(v-if="objective") {{ t(`campaign.objectives.${objective}`) }}
</template>

<style scoped lang="sass">
.turn-banner
  position: absolute
  left: 50%
  top: 34%
  transform: translate(-50%, -50%)
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.35rem, 2vw, 0.7rem)
  max-width: 92vw
  // Never eats a drag: the player may already be reaching for a pebble.
  pointer-events: none
  z-index: 45
  text-align: center

.turn-banner__goal
  font-weight: 800
  font-size: clamp(0.72rem, 3.4vmin, 1.05rem)
  letter-spacing: 0.06em
  text-transform: uppercase
  color: #ffd93c
  text-shadow: 2px 2px 0 #000

.turn-banner__stage
  font-weight: 900
  font-size: clamp(1.6rem, 9vmin, 3rem)
  letter-spacing: 0.04em
  color: #fff
  text-transform: uppercase
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.55), 0 0 1.6rem rgba(120, 200, 255, 0.5)

.turn-banner__mode
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.1rem
  padding: clamp(0.3rem, 1.6vw, 0.55rem) clamp(0.7rem, 3.4vw, 1.1rem)
  border-radius: 999px
  background-color: rgba(10, 20, 38, 0.86)
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.5), 0 0 0 0.14rem rgba(127, 227, 255, 0.32)

.turn-banner__mode-name
  font-weight: 900
  font-size: clamp(0.8rem, 4vmin, 1.1rem)
  color: #7fe3ff
  text-transform: uppercase
  letter-spacing: 0.06em

.turn-banner__vs
  font-weight: 800
  font-size: clamp(0.7rem, 3.4vmin, 0.95rem)
  color: #fff
  text-shadow: 1px 1px 0 #000

.turn-banner__sudden
  padding: clamp(0.3rem, 1.6vw, 0.55rem) clamp(0.9rem, 4vw, 1.4rem)
  border-radius: 999px
  border: 2px solid rgba(255, 80, 80, 0.8)
  background-color: rgba(40, 6, 8, 0.9)
  color: #ff5a5a
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.08em
  font-size: clamp(1rem, 6vmin, 1.8rem)
  text-shadow: 0 2px 0 #000, 0 0 1rem rgba(255, 60, 60, 0.7)
  animation: sudden-pulse 0.5s ease-in-out infinite alternate

@keyframes sudden-pulse
  from
    transform: scale(1)
  to
    transform: scale(1.06)

// Arrives fast and hard — it is a curtain-up, not a notification — and leaves
// slowly enough that it never looks like a flicker.
.turn-banner-enter-active
  transition: opacity 0.18s ease, transform 0.28s cubic-bezier(0.2, 1.6, 0.4, 1)

.turn-banner-leave-active
  transition: opacity 0.45s ease, transform 0.45s ease

.turn-banner-enter-from
  opacity: 0
  transform: translate(-50%, -50%) scale(0.7)

.turn-banner-leave-to
  opacity: 0
  transform: translate(-50%, -80%) scale(1.02)
</style>
