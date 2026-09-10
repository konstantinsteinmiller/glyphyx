<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConquestBar from '@/components/game/ConquestBar.vue'
import CampaignModal from '@/components/organisms/CampaignModal.vue'
import { playFx } from '@/use/useGameAudio'

/**
 * ─── The stage badge ────────────────────────────────────────────────────────
 *
 * Top centre of the HUD: "Level 1-3" and the conquest rail under it. It is a
 * Button + Modal pair — tapping it opens the campaign map — so the number a
 * player looks at all match is also the way to the map, and nothing else on
 * the HUD has to be learned for it.
 */
interface Props {
  chapter: number
  node: number
  playerTiles: number
  enemyTiles: number
  /** Disable the tap (mid-resolution, result screen up). */
  locked?: boolean
}
const props = withDefaults(defineProps<Props>(), { locked: false })
const emit = defineEmits<{ (e: 'open'): void; (e: 'close'): void }>()

const { t } = useI18n()
const showMap = ref(false)

const open = (): void => {
  if (props.locked) return
  playFx('uiOpen')
  showMap.value = true
  emit('open')
}
</script>

<template lang="pug">
  div.stage
    button.stage__btn(
      type="button"
      :disabled="locked"
      :aria-label="t('campaign.title')"
      @click="open"
    )
      span.stage__shadow(aria-hidden="true")
      span.stage__body
        span.stage__label {{ t('hud.stage', { c: chapter, n: node }) }}
    ConquestBar.stage__bar(:player="playerTiles" :enemy="enemyTiles")
    CampaignModal(v-model="showMap" @update:model-value="(v) => { if (!v) emit('close') }")
</template>

<style scoped lang="sass">
.stage
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(0.15rem, 0.8vw, 0.3rem)
  width: clamp(7rem, 34vw, 11rem)
  pointer-events: auto

.stage__btn
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  min-height: 1.9rem
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 90ms ease-out

  &:active:not(:disabled)
    transform: translateY(2px) scale(0.97)

  &:disabled
    cursor: default

.stage__shadow
  position: absolute
  inset: 0
  transform: translateY(3px)
  border-radius: clamp(0.45rem, 2vw, 0.7rem)
  background-color: #1a2b4b

.stage__body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  min-height: 1.9rem
  padding: clamp(0.15rem, 0.8vw, 0.3rem) clamp(0.7rem, 3.4vw, 1.1rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.45rem, 2vw, 0.7rem)
  background-image: linear-gradient(to bottom, #4a5878, #2d3855)

.stage__label
  color: #fff
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  white-space: nowrap
  font-size: clamp(0.8rem, 4vw, 1.2rem)
  line-height: 1
  text-shadow: 2px 2px 0 #000, 0 0 12px rgba(120, 200, 255, 0.35)

.stage__bar
  width: 100%
</style>
