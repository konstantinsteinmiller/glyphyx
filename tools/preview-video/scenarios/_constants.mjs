/**
 * Numbers copied from the game so a beat sheet can be scheduled without asking
 * the page anything. They mirror `src/game/rules.ts`; if a phase length changes
 * there, change it here and re-check the beat sheets.
 *
 * (They are copied rather than imported because this file is loaded by plain
 * Node, and `rules.ts` is TypeScript behind Vite's `@/` alias.)
 */

export const RUNE_TYPES = [
  'melee', 'archer', 'mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker', 'crown'
]

export const TIMING = {
  /** Planning window — irrelevant while the clock is frozen, listed for reference. */
  PLANNING_MS: 5000,
  /** Both sides' moves flip face-up. */
  REVEAL_MS: 300,
  /** The whole resolution animation: placements → nuke → auras → heals → ranged → melee → settle. */
  RESOLVE_MS: 1200,
  /** Breathing room between a resolution ending and the next planning phase. */
  BETWEEN_TURNS_MS: 350,
  /** The correction window after a DRAG placement… */
  LOCK_WINDOW_MS: 1000,
  /** …and after a TAP, which has not aimed the rune at all. Both are skipped by an aimed precise placement. */
  LOCK_WINDOW_TAP_MS: 2500,
  /** The "play again" board wipe. */
  RESET_MS: 200
}

/** Where each step of a resolution lands inside `RESOLVE_MS` — useful for timing a beat to the blast. */
export const RESOLVE_TIMELINE = {
  place: 0, crown: 150, nuke: 160, clash: 160, aura: 120, heal: 260, ranged: 420, melee: 760, settle: 1000
}
