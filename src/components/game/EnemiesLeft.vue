<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * ─── What a lesson is counting ──────────────────────────────────────────────
 *
 * A lesson's objective is `eliminate`: shatter every enemy stone. The conquest
 * rail this stands in for counts TILES, which decide nothing on those nodes —
 * and the blind playtest (2026-09-11) measured exactly what that costs. Four
 * testers read the tile counters four different ways ("enemy health", "unit
 * count", "score to reduce to zero"), two of them watched the rail fill past
 * its own goal to 9/8 and 15/8 without winning, and none of them could say
 * what the game wanted from them.
 *
 * So a lesson shows the one number it is about: the stones still standing, one
 * pip each, going dark as they shatter.
 */
interface Props {
  /** Enemy runes still on the board. */
  left: number
  /** How many there were at the start — the pips that get drawn. */
  total?: number
}
const props = withDefaults(defineProps<Props>(), { total: 0 })
const { t } = useI18n()

const left = computed(() => Math.max(0, Math.round(Number.isFinite(props.left) ? props.left : 0)))
/** Never fewer pips than there are stones, and never a rail of nothing. */
const pips = computed(() => Math.max(1, Math.min(8, Math.max(left.value, Math.round(props.total) || 0))))
</script>

<template lang="pug">
  div.foes(:aria-label="t('hud.runesLeft', { n: left })")
    div.foes__pips(aria-hidden="true")
      span.foes__pip(
        v-for="i in pips"
        :key="i"
        :class="{ 'is-gone': i > left }"
      )
    span.foes__label {{ t('hud.runesLeft', { n: left }) }}
</template>

<style scoped lang="sass">
.foes
  display: flex
  align-items: center
  justify-content: center
  gap: clamp(0.25rem, 1.4vw, 0.45rem)
  width: 100%

.foes__pips
  display: flex
  align-items: center
  gap: clamp(0.1rem, 0.6vw, 0.2rem)

.foes__pip
  width: clamp(0.3rem, 1.4vw, 0.45rem)
  height: clamp(0.42rem, 2vw, 0.62rem)
  border-radius: 40% 40% 45% 45% / 55% 55% 45% 45%
  background: linear-gradient(180deg, #ff8d7e, #b33a2f)
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45), 0 0 6px rgba(255, 110, 90, 0.5)

.foes__pip.is-gone
  background: rgba(120, 130, 150, 0.28)
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35)

.foes__label
  color: #ffd9d2
  font-weight: 900
  font-size: clamp(0.55rem, 2.4vw, 0.78rem)
  letter-spacing: 0.02em
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8)
  white-space: nowrap
</style>
