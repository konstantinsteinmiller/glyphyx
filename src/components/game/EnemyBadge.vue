<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FACTION_DEFS, type EnemySetup } from '@/game/rules'
import { mobileCheck, prependBaseUrl } from '@/utils/function'
import { windowHeight, windowWidth } from '@/use/useUser'

/**
 * ─── The enemy commander ────────────────────────────────────────────────────
 *
 * Top-right of the HUD: who the player is fighting, drawn from the painted
 * monster strips that ship in `public/images/monsters/` (eight panels of
 * 228×256, one walk cycle). The lead faction's commander is big and animated;
 * in a siege the other two stand small beside it, so "surrounded by three"
 * is visible before a single rune has been placed.
 *
 * The strip is animated in CSS with `steps(8)` — no JS per frame, and the
 * `<img>` decodes off the boot path because the badge mounts after the splash.
 */
interface Props {
  enemies: EnemySetup[]
  turn: number
  turnLimit: number
  suddenDeath: boolean
}
const props = defineProps<Props>()
const { t } = useI18n()

const lead = computed(() => props.enemies[0] ?? null)
const others = computed(() => props.enemies.slice(1))

const avatarSrc = (e: EnemySetup): string =>
  prependBaseUrl(`images/monsters/${FACTION_DEFS[e.faction].avatar}.webp`)
const factionName = (e: EnemySetup): string => t(`factions.${e.faction}`)
const factionColor = (e: EnemySetup): string => FACTION_DEFS[e.faction].color

const turnLabel = computed(() => t('hud.turn', { n: props.turn }))

const roomy = computed(() => isRoomyViewport(windowWidth.value, windowHeight.value, mobileCheck()))
</script>

<script lang="ts">
/**
 * A roomy desktop viewport has a top-right corner nothing else wants, so the
 * commander grows into it — the portrait scales with the height it has
 * (`vh`), so a 720 px window gets a modest bump and a 1080 px one the full
 * double. Phones and short embeds keep the compact badge exactly as it was.
 * Exported from a plain script block (a `<script setup>` may not export) so a
 * test can pin the rule without a layout engine.
 */
export const ROOMY_MIN_WIDTH = 1024
export const ROOMY_MIN_HEIGHT = 720
export const isRoomyViewport = (width: number, height: number, mobile: boolean): boolean =>
  !mobile && width >= ROOMY_MIN_WIDTH && height >= ROOMY_MIN_HEIGHT
</script>

<template lang="pug">
  div.enemy(v-if="lead" role="group" :aria-label="t('hud.enemy')" :class="{ 'is-roomy': roomy }")
    div.enemy__row
      //- The other two factions of a siege, small, under the lead.
      div.enemy__others(v-if="others.length")
        div.enemy__mini(v-for="e in others" :key="e.faction" :style="{ '--tint': factionColor(e) }" :title="factionName(e)")
          div.enemy__mini-window
            img.enemy__strip(:src="avatarSrc(e)" :alt="factionName(e)" decoding="async" loading="lazy" draggable="false")
      div.enemy__lead(:style="{ '--tint': factionColor(lead) }")
        div.enemy__window
          img.enemy__strip(:src="avatarSrc(lead)" :alt="factionName(lead)" decoding="async" draggable="false")
    span.enemy__name {{ factionName(lead) }}
    div.enemy__chips
      span.enemy__turn {{ turnLabel }}
      Transition(name="sd")
        span.enemy__sudden(v-if="suddenDeath") {{ t('hud.suddenDeath') }}
</template>

<style scoped lang="sass">
.enemy
  display: flex
  flex-direction: column
  align-items: flex-end
  gap: 0.1rem
  pointer-events: none

.enemy__row
  display: flex
  align-items: flex-end
  gap: clamp(0.15rem, 0.8vw, 0.3rem)

// One panel of the eight-panel strip. The window is the panel's own aspect;
// the strip inside is 8x as wide and slides one panel per step.
.enemy__lead
  position: relative
  width: clamp(2.6rem, 11vw, 3.6rem)
  aspect-ratio: 228 / 256
  border-radius: clamp(0.4rem, 1.8vw, 0.65rem)
  border: 2px solid var(--tint, #ff5a3d)
  background: radial-gradient(circle at 50% 40%, rgba(60, 10, 14, 0.9), rgba(12, 6, 10, 0.92))
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.55), 0 0 10px color-mix(in srgb, var(--tint, #ff5a3d) 45%, transparent)
  overflow: hidden

.enemy__window
  position: absolute
  inset: 4% 0 0 0
  overflow: hidden

.enemy__others
  display: flex
  flex-direction: column
  gap: 0.15rem

.enemy__mini
  position: relative
  width: clamp(1.25rem, 5.2vw, 1.7rem)
  aspect-ratio: 228 / 256
  border-radius: 0.35rem
  border: 2px solid var(--tint, #ff5a3d)
  background: rgba(12, 6, 10, 0.92)
  overflow: hidden

.enemy__mini-window
  position: absolute
  inset: 0
  overflow: hidden

// Both overrides are load-bearing: Tailwind's preflight caps every image at
// `max-width: 100%`, which would squash eight panels into one panel's width.
.enemy__strip
  display: block
  max-width: none
  width: 800%
  height: 100%
  animation: enemy-walk 2.6s steps(8, end) infinite
  pointer-events: none

@keyframes enemy-walk
  from
    transform: translateX(0)
  to
    transform: translateX(-100%)

.enemy__name
  max-width: clamp(5.5rem, 26vw, 9rem)
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  color: #ffb3a8
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.03em
  font-size: clamp(0.5rem, 2.3vw, 0.68rem)
  line-height: 1.1
  text-shadow: 1px 1px 0 #000

.enemy__chips
  display: flex
  align-items: center
  gap: 0.25rem

.enemy__turn
  padding: 0.1em 0.5em
  border: 2px solid rgba(0, 0, 0, 0.55)
  border-radius: 999px
  background-color: rgba(10, 16, 30, 0.72)
  color: #fff
  font-weight: 900
  font-size: clamp(0.5rem, 2.3vw, 0.7rem)
  line-height: 1.3
  text-shadow: 1px 1px 0 #000

.enemy__sudden
  padding: 0.1em 0.5em
  border: 2px solid rgba(255, 80, 80, 0.7)
  border-radius: 999px
  background-color: rgba(40, 6, 8, 0.9)
  color: #ff5a5a
  font-weight: 900
  text-transform: uppercase
  font-size: clamp(0.45rem, 2.1vw, 0.62rem)
  line-height: 1.3
  animation: sd-pulse 0.5s ease-in-out infinite alternate

@keyframes sd-pulse
  from
    opacity: 0.7
  to
    opacity: 1

.sd-enter-active, .sd-leave-active
  transition: opacity 0.2s ease
.sd-enter-from, .sd-leave-to
  opacity: 0

// A landscape phone has no height to spend on a stacked badge: the avatar
// goes beside the name and the turn chip, at two thirds the size.
@media (orientation: landscape) and (max-height: 30rem)
  .enemy
    display: grid
    grid-template-columns: auto auto
    grid-template-rows: auto auto
    align-items: center
    column-gap: 0.35rem
    row-gap: 0.05rem

  .enemy__row
    grid-row: 1 / span 2

  .enemy__lead
    width: clamp(2rem, 6.5vh, 2.6rem)

  .enemy__mini
    width: clamp(0.95rem, 3.4vh, 1.25rem)

  .enemy__name
    max-width: 8rem
    font-size: clamp(0.5rem, 2.2vh, 0.62rem)

  .enemy__turn, .enemy__sudden
    font-size: clamp(0.48rem, 2.1vh, 0.6rem)

// ─── The roomy desktop tier ─────────────────────────────────────────────────
//
// The portrait grows with the height it has; the name and the turn sit under
// it, a step larger. Applied through a class rather than a media query so the
// tier can be asserted from a test and switched off for phones by the UA.
.enemy.is-roomy
  gap: 0.2rem

  .enemy__row
    gap: 0.35rem

  .enemy__lead
    width: clamp(4.6rem, 11vh, 7.2rem)
    border-width: 3px
    border-radius: clamp(0.65rem, 1.3vh, 1rem)
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.6), 0 0 16px color-mix(in srgb, var(--tint, #ff5a3d) 50%, transparent)

  .enemy__mini
    width: clamp(1.9rem, 4.4vh, 2.8rem)

  .enemy__name
    max-width: 16rem
    font-size: clamp(0.7rem, 1.6vh, 0.95rem)

  .enemy__turn
    font-size: clamp(0.64rem, 1.45vh, 0.82rem)

  .enemy__sudden
    font-size: clamp(0.58rem, 1.3vh, 0.74rem)

@media (prefers-reduced-motion: reduce)
  .enemy__strip
    animation-duration: 5.2s
</style>
