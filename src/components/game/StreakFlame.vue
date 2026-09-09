<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import useStreak from '@/use/useStreak'

/**
 * The win-streak flame.
 *
 * A chip that appears with the first win and grows hotter with the streak:
 * `auraLevel` (0..3) picks the colour and how hard the flame breathes, and the
 * gold multiplier is printed beside it once it is worth more than ×1 — the
 * streak is a reward, so it is shown as one rather than as a warning.
 *
 * Hidden at streak 0: an empty flame is a promise the game has not kept yet.
 */
const { t } = useI18n()
const { streak, multiplier, auraLevel } = useStreak()

const show = computed(() => streak.value > 0)
const multLabel = computed(() => t('hud.streakMult', { n: multiplier.value }))
</script>

<template lang="pug">
  Transition(name="flame")
    div.streak(v-if="show" :class="`is-aura-${auraLevel}`" role="status" :aria-label="t('hud.streak')")
      span.streak__flame
        GameIcon.streak__icon(name="flame")
      span.streak__count {{ streak }}
      span.streak__mult(v-if="multiplier > 1") {{ multLabel }}
</template>

<style scoped lang="sass">
.streak
  display: inline-flex
  align-items: center
  gap: clamp(0.15rem, 0.9vw, 0.3rem)
  min-height: 1.6rem
  padding: clamp(0.1rem, 0.6vw, 0.2rem) clamp(0.45rem, 2vw, 0.7rem) clamp(0.1rem, 0.6vw, 0.2rem) clamp(0.3rem, 1.4vw, 0.45rem)
  border: 2px solid rgba(0, 0, 0, 0.55)
  border-radius: 999px
  background-color: rgba(30, 12, 6, 0.78)
  color: #ff9a4a
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45)

.streak__flame
  display: inline-flex
  width: clamp(0.85rem, 3.8vw, 1.15rem)
  height: clamp(0.85rem, 3.8vw, 1.15rem)
  animation: flame-breathe 1.4s ease-in-out infinite
  filter: drop-shadow(0 0 4px rgba(255, 140, 40, 0.7))

.streak__count
  color: #fff
  font-weight: 900
  font-size: clamp(0.72rem, 3.3vw, 1rem)
  line-height: 1
  text-shadow: 2px 2px 0 #000

.streak__mult
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.52rem, 2.4vw, 0.72rem)
  line-height: 1
  letter-spacing: 0.03em
  text-shadow: 1px 1px 0 #000

// Hotter with every aura step: colour, glow and the breathing amplitude.
.is-aura-1
  color: #ffb347
  border-color: rgba(255, 179, 71, 0.45)
.is-aura-2
  color: #ff7a3d
  border-color: rgba(255, 122, 61, 0.6)
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45), 0 0 10px rgba(255, 122, 61, 0.45)
  .streak__flame
    animation-duration: 1s
.is-aura-3
  color: #ffe45c
  border-color: rgba(255, 228, 92, 0.75)
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45), 0 0 16px rgba(255, 170, 40, 0.75)
  .streak__flame
    animation-duration: 0.7s
    filter: drop-shadow(0 0 7px rgba(255, 210, 60, 0.95))

@keyframes flame-breathe
  0%, 100%
    transform: scale(1) translateY(0)
  50%
    transform: scale(1.18) translateY(-8%)

.flame-enter-active, .flame-leave-active
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 1.4, 0.4, 1)
.flame-enter-from, .flame-leave-to
  opacity: 0
  transform: scale(0.6)
</style>
