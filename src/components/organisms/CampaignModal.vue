<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import NextUnlockTeaser from '@/components/game/NextUnlockTeaser.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import type { GameIconName } from '@/components/icons/iconNames'
import { FACTION_DEFS, RUNES, type NodeConfig, type RuneType } from '@/game/rules'
import { NODES_PER_CHAPTER, chapterOf, isLessonNode, nodeId } from '@/game/campaign'
import useCampaign from '@/use/useCampaign'
import useBattle from '@/use/useBattle'
import { playFx } from '@/use/useGameAudio'
import { adInFlight, showPacedInterstitial } from '@/use/useAdGate'

/**
 * ─── The campaign map ───────────────────────────────────────────────────────
 *
 * The current chapter's eight nodes as a path: cleared, current, locked. Each
 * row says the mode, the objective, who is waiting there and what the chest
 * holds — and a tap on any unlocked node starts it. Replaying a cleared node
 * pays coins for the win but never its chest twice (`useCampaign`).
 */
const model = defineModel<boolean>({ required: true })
const { t } = useI18n()
const { currentNode, bestNode, nodeConfigFor, setCurrentNode, isNodeCleared, isNodeUnlocked } = useCampaign()
const battle = useBattle()

const GLYPH: Record<RuneType, GameIconName> = {
  melee: 'sword', archer: 'bow', mage: 'orb', defense: 'shield', support: 'cross',
  cleave: 'cleave', roller: 'roller', bombard: 'bombard', nuker: 'nuker', crown: 'crown'
}

const chapter = computed(() => chapterOf(currentNode.value))

interface Row {
  cfg: NodeConfig
  state: 'cleared' | 'current' | 'locked'
  foe: string
  unlocked: boolean
}

const rows = computed<Row[]>(() => {
  // Touch the refs so the map re-reads when a node clears.
  void bestNode.value
  const out: Row[] = []
  for (let i = 1; i <= NODES_PER_CHAPTER; i++) {
    const id = nodeId(chapter.value, i)
    const cfg = nodeConfigFor(id)
    const lead = cfg.enemies[0]
    const state: Row['state'] = isNodeCleared(id) ? 'cleared' : id === currentNode.value ? 'current' : 'locked'
    out.push({
      cfg,
      state: state === 'locked' && isNodeUnlocked(id) ? 'current' : state,
      foe: lead ? t(`factions.${lead.faction}`) : '',
      unlocked: isNodeUnlocked(id)
    })
  }
  return out
})

const stateIcon = (s: Row['state']): GameIconName => (s === 'cleared' ? 'check' : s === 'current' ? 'star' : 'lock')
const factionColor = (cfg: NodeConfig): string => {
  const lead = cfg.enemies[0]
  return lead ? FACTION_DEFS[lead.faction].color : '#ff5a3d'
}

const play = async (row: Row): Promise<void> => {
  if (!row.unlocked) {
    playFx('uiReject')
    return
  }
  if (adInFlight.value) return
  playFx('uiOpen')
  model.value = false
  // A natural break: the map closes and a node starts. Only when no match is
  // live (the map opened from the result screen), and only past the 121 s
  // pace — inside the gap this is a no-op.
  // …and never on the way INTO a lesson: the tutorial arc is ad-free, for the
  // same reason `GameScene.adsAllowedAfter` keeps ads out of its handovers.
  if (!battle.matchActive.value && !isLessonNode(row.cfg.id)) await showPacedInterstitial()
  setCurrentNode(row.cfg.id)
  battle.startNode(row.cfg.id)
}
</script>

<template lang="pug">
  FModal(v-model="model" :title="t('campaign.title')")
    div.map
      div.map__chapter {{ t('campaign.chapter', { n: chapter }) }}
      //- The map is where a player reads the road ahead, so it says what the
      //- road pays: the next stage that hands over a rune, and the stone.
      NextUnlockTeaser.map__teaser
      div.map__list
        button.node(
          v-for="row in rows"
          :key="row.cfg.id"
          type="button"
          :class="[`is-${row.state}`, { 'is-siege': row.cfg.mode === 'siege' }]"
          :disabled="!row.unlocked"
          :aria-label="t('hud.stage', { c: row.cfg.chapter, n: row.cfg.index })"
          :style="{ '--tint': factionColor(row.cfg) }"
          @click="play(row)"
        )
          //- The path: a rail down the left with the node's marker on it.
          span.node__rail(aria-hidden="true")
          span.node__marker(aria-hidden="true")
            GameIcon.node__marker-icon(:name="stateIcon(row.state)")

          div.node__body
            div.node__head
              span.node__stage {{ t('hud.stage', { c: row.cfg.chapter, n: row.cfg.index }) }}
              span.node__mode {{ t(`campaign.modes.${row.cfg.mode}`) }}
            span.node__objective {{ t(`campaign.objectives.${row.cfg.objective}`) }}
            span.node__foe(v-if="row.foe") {{ t('banner.vs', { name: row.foe }) }}

          //- The chest: coins, and the rune or skin it holds.
          div.node__reward(:aria-label="t('campaign.reward')")
            span.node__coins(v-if="row.cfg.reward.coins > 0")
              IconCoin.node__coin
              | {{ row.cfg.reward.coins }}
            span.node__unlock(v-if="row.cfg.reward.unlockRune" :style="{ color: RUNES[row.cfg.reward.unlockRune].color }")
              GameIcon.node__unlock-icon(:name="GLYPH[row.cfg.reward.unlockRune]")
            span.node__unlock.is-skin(v-else-if="row.cfg.reward.unlockSkin")
              GameIcon.node__unlock-icon(name="skin")
            span.node__state {{ row.state === 'cleared' ? t('campaign.cleared') : row.state === 'current' ? t('campaign.current') : t('campaign.locked') }}
</template>

<style scoped lang="sass">
.map
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.6vw, 0.55rem)
  width: 100%

.map__chapter
  color: #ffd93c
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.06em
  font-size: clamp(0.75rem, 3.4vw, 1rem)
  text-shadow: 2px 2px 0 #000

// The column stretches its children; the carrot is a band, not a row, so it
// keeps its own width and lines up under the chapter heading.
.map__teaser
  align-self: flex-start
  max-width: 100%

.map__list
  display: flex
  flex-direction: column
  gap: clamp(0.25rem, 1.4vw, 0.45rem)

.node
  position: relative
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto
  align-items: center
  gap: clamp(0.35rem, 2vw, 0.7rem)
  width: 100%
  min-height: 3.25rem
  padding: clamp(0.3rem, 1.6vw, 0.55rem) clamp(0.4rem, 2vw, 0.7rem)
  border: 2px solid #0f1a30
  border-radius: clamp(0.5rem, 2.4vw, 0.9rem)
  background-image: linear-gradient(to bottom, #2b3c63, #1a2540)
  text-align: left
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 90ms ease-out, filter 90ms ease-out

  &:active:not(:disabled)
    transform: translateY(2px) scale(0.99)

  &.is-locked
    filter: grayscale(0.7) brightness(0.7)
    cursor: not-allowed

  &.is-current
    border-color: #ffcd00
    box-shadow: 0 0 0 0.15rem rgba(255, 205, 0, 0.35), 0 0 14px rgba(255, 205, 0, 0.3)

  &.is-cleared
    background-image: linear-gradient(to bottom, #2f4a36, #1b2c22)

  &.is-siege
    background-image: linear-gradient(to bottom, #4a2f3b, #2a1b24)

  &.is-siege.is-cleared
    background-image: linear-gradient(to bottom, #3d4a36, #222c1b)

// The marker on the rail: a check, a star or a lock.
.node__marker
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: clamp(1.7rem, 8vw, 2.3rem)
  height: clamp(1.7rem, 8vw, 2.3rem)
  border: 2px solid rgba(0, 0, 0, 0.55)
  border-radius: 50%
  background-color: rgba(0, 0, 0, 0.35)
  color: #9fb2d0

  .is-cleared &
    color: #8fffc2
  .is-current &
    color: #ffd93c
    box-shadow: 0 0 10px rgba(255, 217, 60, 0.6)

  .node__marker-icon
    width: 58%
    height: 58%

.node__rail
  display: none

.node__body
  display: flex
  flex-direction: column
  gap: 0.05rem
  min-width: 0

.node__head
  display: flex
  align-items: baseline
  gap: 0.4em
  flex-wrap: wrap

.node__stage
  color: #fff
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.72rem, 3.4vw, 1rem)
  line-height: 1.1
  text-shadow: 2px 2px 0 #000

.node__mode
  color: #7fe3ff
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  font-size: clamp(0.5rem, 2.3vw, 0.68rem)

.node__objective
  color: #b9cbe8
  font-size: clamp(0.55rem, 2.6vw, 0.75rem)
  line-height: 1.2

.node__foe
  color: var(--tint)
  font-weight: 800
  font-size: clamp(0.5rem, 2.4vw, 0.7rem)
  line-height: 1.2
  text-shadow: 1px 1px 0 #000

.node__reward
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 0.15rem

.node__coins
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffd93c
  font-weight: 900
  font-size: clamp(0.65rem, 3vw, 0.9rem)
  text-shadow: 2px 2px 0 #000

.node__coin
  width: 1em
  height: 1em
  object-fit: contain

.node__unlock
  display: inline-flex
  width: clamp(1rem, 4.6vw, 1.3rem)
  height: clamp(1rem, 4.6vw, 1.3rem)
  filter: drop-shadow(0 0 4px currentColor)

  &.is-skin
    color: #c5b6ff

.node__state
  color: #9fb2d0
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.45rem, 2.1vw, 0.6rem)
  letter-spacing: 0.04em
</style>
