<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { statsFor, type RuneType } from '@/game/rules'
import PebblePreview from '@/components/game/PebblePreview.vue'

/**
 * ─── What the rune in your hand does ────────────────────────────────────────
 *
 * A glyph is not self-explanatory, so while a rune is selected or carried its
 * card says the name, the one sentence that matters, and the Lv 1 numbers.
 * The scene decides WHEN (a rune is active and still new to this player — see
 * `useRuneUses`) and WHERE (a strip that never covers the board or the hand);
 * this component only says what.
 *
 * Two rows and no more — the name with its numbers, then the sentence — so
 * the card stays short enough for the strip above the board on a phone.
 *
 * `pointer-events: none`: the finger that is carrying the pebble passes
 * straight through it, and nothing here is ever a target.
 */
interface Props {
  /** The rune to explain, or `null` to fade the card out. */
  type: RuneType | null
}
const props = defineProps<Props>()
const { t } = useI18n()

// The card keeps its last rune while it fades out, so the text does not blank
// a frame before the transition ends.
const lastType = ref<RuneType | null>(props.type)
watch(() => props.type, (v) => { if (v) lastType.value = v })

const stats = computed(() => (lastType.value ? statsFor(lastType.value, 1) : null))
</script>

<template lang="pug">
  Transition(name="tip")
    div.rune-tip(v-if="type && lastType" role="status" :aria-label="t(`runes.names.${lastType}`)")
      div.rune-tip__glyph
        PebblePreview(:type="lastType" glyph-only)
      div.rune-tip__body
        div.rune-tip__head
          span.rune-tip__name {{ t(`runes.names.${lastType}`) }}
          div.rune-tip__stats(v-if="stats")
            span.rune-tip__stat
              span.rune-tip__stat-key {{ t('runes.hp') }}
              span.rune-tip__stat-value {{ stats.hp }}
            span.rune-tip__stat(v-if="stats.atk > 0")
              span.rune-tip__stat-key {{ t('runes.atk') }}
              span.rune-tip__stat-value {{ stats.atk }}
        span.rune-tip__desc {{ t(`runes.descriptions.${lastType}`) }}
</template>

<style scoped lang="sass">
.rune-tip
  display: inline-flex
  align-items: center
  gap: clamp(0.35rem, 1.6vw, 0.6rem)
  max-width: min(92vw, 24rem)
  padding: clamp(0.22rem, 1.1vw, 0.45rem) clamp(0.5rem, 2.4vw, 0.8rem)
  border: 2px solid rgba(255, 255, 255, 0.18)
  border-radius: clamp(0.55rem, 2.2vw, 0.85rem)
  // No blur. A `backdrop-filter` smears the painted art behind it — the
  // board, the stones, the backdrop — and the art is the thing people came
  // for. Separation comes from the plate's own opacity instead, which is
  // also free where a blur re-rasterises everything underneath it.
  background-color: rgba(8, 14, 28, 0.94)
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.55), 0 0 1rem rgba(0, 0, 0, 0.35)
  pointer-events: none
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none

.rune-tip__glyph
  flex: 0 0 auto
  width: clamp(1.6rem, 7vw, 2.4rem)

.rune-tip__body
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 0.08rem
  min-width: 0

.rune-tip__head
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: 0.15rem 0.4rem

.rune-tip__name
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.03em
  line-height: 1.1
  font-size: clamp(0.62rem, 2.8vw, 0.86rem)
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.85)

.rune-tip__desc
  color: #fff
  font-weight: 700
  line-height: 1.2
  font-size: clamp(0.56rem, 2.5vw, 0.76rem)
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.85)

.rune-tip__stats
  display: inline-flex
  gap: 0.25rem

.rune-tip__stat
  display: inline-flex
  align-items: baseline
  gap: 0.2em
  padding: 0 0.45em
  border: 2px solid rgba(0, 0, 0, 0.5)
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.72)
  font-size: clamp(0.5rem, 2.2vw, 0.66rem)
  line-height: 1.35

.rune-tip__stat-key
  color: #9fd8ff
  font-weight: 900
  text-transform: uppercase

.rune-tip__stat-value
  color: #fff
  font-weight: 900

.tip-enter-active, .tip-leave-active
  transition: opacity 200ms ease-out, translate 200ms ease-out

.tip-enter-from, .tip-leave-to
  opacity: 0
  translate: 0 0.4rem
</style>
