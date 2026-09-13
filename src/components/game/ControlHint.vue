<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { isMobilePortrait } from '@/use/useUser'
import { mobileCheck } from '@/utils/function'

/**
 * The on-screen control primer.
 *
 * Glyphyx teaches itself through the ghost hand and the reveal, so this pill
 * is the SECOND voice, never the first: one line, phrased for the device the
 * player is holding, retired the moment the thing it names has happened.
 *
 *   drag      — the only verb there is
 *   tap       — the other way in: a hand pebble is selected, a tile places it
 *   aim       — the swipe (or an arrow key), shown while a pebble is on a tile
 *   archer    — bows skip a tile (node 1-2)
 *   stack     — a matching rune levels up (node 1-3)
 *   mage      — the orb beams two tiles diagonally (node 1-4)
 *   defense   — the shield blocks arrows and beams (node 1-5)
 *   support   — the cross heals and sharpens its neighbours (node 1-6)
 *   correct   — the re-aim window after a placement, the first few times
 *   conquest  — the win rule, on the first real match
 *   siege     — the first time the player is surrounded
 */
export type HintId =
  | 'drag' | 'tap' | 'aim' | 'archer' | 'stack' | 'mage' | 'defense' | 'support' | 'correct' | 'conquest'
  // The conquest pair: the GOAL, then the RULE that gets you there.
  | 'conquestClaim' | 'siege'
  | 'cleave' | 'roller' | 'bombard'
  // …and the three that say why nothing happened (`useBattle.RejectReason`).
  // Not primers: they answer an action the player just took and expire on
  // their own. A refused drag used to be completely silent, which reads as a
  // broken game rather than as a rule.
  | 'busyPlaced' | 'busyPhase' | 'busyTile'
  // …and the one that says the game is waiting for YOU: a lesson has no clock,
  // so a board that has stopped moving is a board waiting for a move.
  | 'yourMove'

interface Props {
  hint: HintId | null
}
const props = defineProps<Props>()
const { t } = useI18n()

const isTouch = computed(() => mobileCheck() || isMobilePortrait.value
  || (typeof window !== 'undefined' && navigator.maxTouchPoints > 0))

const text = computed(() => {
  if (!props.hint) return ''
  return t(`hints.${props.hint}.${isTouch.value ? 'touch' : 'desktop'}`)
})
</script>

<template lang="pug">
  //- The transition rides on the outer element and the breathing on the inner
  //- one, deliberately apart: Vue times an enter by the LONGER of an element's
  //- transition and its animation, and an infinite breathe on the same element
  //- left the enter's `translate` on the pill long after it had landed.
  Transition(name="hint" mode="out-in")
    div.control-hint(v-if="hint" :key="hint")
      div.control-hint__pill
        svg.control-hint__icon(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true")
          path(d="M9 11V6a2 2 0 1 1 4 0v5")
          path(d="M13 8a2 2 0 1 1 4 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.4L4 15a1.6 1.6 0 0 1 2.6-1.9L8 15")
        span.control-hint__text {{ text }}
</template>

<style scoped lang="sass">
.control-hint
  display: inline-flex
  max-width: min(90vw, 26rem)
  pointer-events: none

.control-hint__pill
  display: inline-flex
  align-items: center
  gap: clamp(0.25rem, 1.4vw, 0.5rem)
  min-height: 1.75rem
  max-width: 100%
  padding: clamp(0.22rem, 1.2vw, 0.45rem) clamp(0.55rem, 3vw, 1rem)
  border: 2px solid rgba(255, 255, 255, 0.18)
  border-radius: 999px
  background-color: rgba(8, 14, 28, 0.72)
  backdrop-filter: blur(3px)
  animation: hint-breathe 2.4s ease-in-out infinite

.control-hint__icon
  flex: 0 0 auto
  width: clamp(0.85rem, 3.6vw, 1.1rem)
  height: clamp(0.85rem, 3.6vw, 1.1rem)
  color: #ffd93c

.control-hint__text
  color: #fff
  font-weight: 900
  text-align: center
  line-height: 1.2
  font-size: clamp(0.62rem, 2.9vw, 0.92rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.85)

.hint-enter-active, .hint-leave-active
  transition: opacity 260ms ease-out, translate 260ms ease-out

.hint-enter-from, .hint-leave-to
  opacity: 0
  translate: 0 0.5rem

@keyframes hint-breathe
  0%, 100%
    opacity: 0.92
  50%
    opacity: 0.68
</style>
