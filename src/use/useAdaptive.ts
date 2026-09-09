import { computeHandicap } from '@/game/adaptive'
import { countTiles, runesOf } from '@/game/board'
import type { Handicap, HandicapInput, MatchState } from '@/game/rules'
import { getState, setState } from '@/use/useGlyphyxState'
import { FAILED_NODES_KEY, LOSS_STREAK_KEY } from '@/keys'
import useUser from '@/use/useUser'

/**
 * ─── Adaptive difficulty: the bookkeeping half ──────────────────────────────
 *
 * The rule itself is pure and lives in `@/game/adaptive` (`computeHandicap`).
 * This module owns the two numbers it needs that outlive a match — how often
 * THIS node has been lost, and how many matches in a row have been lost — and
 * assembles the per-turn input from the live match. Both numbers sit in the
 * one `glyphyx_state` blob, so a player who struggles on a phone is relieved
 * on the tablet too.
 *
 * Nothing here is ever announced. The enemy plays worse; the player plays on.
 */

/** What the battle tracks per match and hands over each turn. */
export interface MatchRelief {
  /** The previous planning window ran out with nothing placed. */
  playerPassedLastTurn: boolean
  /** Windows that ran out this match. */
  passesThisMatch: number
}

const readFails = (): Record<string, number> => {
  const raw = getState<unknown>(FAILED_NODES_KEY, null)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as Record<string, number>
}

const count = (v: unknown): number => Math.max(0, Math.floor(Number(v) || 0))

/** Losses on `nodeId` since it was last won. */
export const nodeFails = (nodeId: number): number => count(readFails()[String(nodeId)])

/** Consecutive losses, any node. */
export const lossStreak = (): number => count(getState(LOSS_STREAK_KEY, 0))

/**
 * A match ended. A win wipes the node's count and the streak — relief is for
 * a player who is stuck, not a discount that lingers once they are through.
 */
export const recordResult = (nodeId: number, won: boolean): void => {
  const key = String(nodeId)
  const fails = readFails()
  if (won) {
    if (key in fails) {
      const rest = { ...fails }
      delete rest[key]
      setState(FAILED_NODES_KEY, rest)
    }
    if (lossStreak() !== 0) setState(LOSS_STREAK_KEY, 0)
    return
  }
  setState(FAILED_NODES_KEY, { ...fails, [key]: count(fails[key]) + 1 })
  setState(LOSS_STREAK_KEY, lossStreak() + 1)
}

/**
 * The rule's input for the turn `state` is about to plan. `now` is the wall
 * clock the match's age is measured against (the stall-breaker ramps the
 * relief after a long match); the default is the real one.
 */
export const buildHandicapInput = (state: MatchState, relief: MatchRelief, now: number = Date.now()): HandicapInput => {
  const board = state.board
  const startedAt = Number(state.startedAt) || now
  return {
    matchElapsedMs: Math.max(0, now - startedAt),
    difficulty: useUser().userDifficulty.value,
    nodeFails: nodeFails(state.config.id),
    lossStreak: lossStreak(),
    playerPassedLastTurn: relief.playerPassedLastTurn,
    passesThisMatch: relief.passesThisMatch,
    tileDeficit: countTiles(board, 'enemy') - countTiles(board, 'player'),
    runeDeficit: runesOf(board, 'enemy').length - runesOf(board, 'player').length,
    turn: state.turn,
    suddenDeath: state.suddenDeath,
    tutorial: state.config.tutorial !== null
  }
}

/** How much the enemy holds back on the turn `state` is about to plan. */
export const handicapFor = (state: MatchState, relief: MatchRelief): Handicap =>
  computeHandicap(buildHandicapInput(state, relief))

const useAdaptive = () => ({ nodeFails, lossStreak, recordResult, buildHandicapInput, handicapFor })
export default useAdaptive
