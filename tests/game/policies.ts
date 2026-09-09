/**
 * ─── Scripted players ───────────────────────────────────────────────────────
 *
 * Headless policies that play a node through the real state machine, so a
 * test can ask "who clears this, and how often" instead of guessing. Three
 * skill levels, as the onboarding skill prescribes:
 *
 *   zeroInput  never places — the absolute floor
 *   careless   a random hand rune on a random legal tile, default facing,
 *              never rerolls — the tester who has not understood the controls
 *   greedy     the best single move by the resolver's own judgement — a
 *              player who has
 *
 * …plus `ghostThen(policy)`: does what the ghost hand shows on turn 1, then
 * hands over to `policy`.
 */

import {
  NO_HANDICAP, RUNE_TYPES, defaultDir, dirsFor, type Faction, type Handicap, type MatchState, type Move, type RuneType
} from '@/game/rules'
import { beginPlanning, commitPlayerMove, createMatch, nextTurn, resolveCurrentTurn } from '@/game/match'
import { countTiles, legalPlacements } from '@/game/board'
import { resolveTurn } from '@/game/resolve'
import { randInt, seedFrom } from '@/game/rng'
import { nodeConfig } from '@/game/campaign'
import type { Difficulty } from '@/game/ai'

export type Policy = (s: MatchState) => Move | null

/**
 * The deck a scripted player draws from. Deliberately the CHAPTER-1 five and
 * not the whole roster: every node these policies play is in chapter 1, and
 * the campaign does not hand over the axe, the boulder or the mortar until
 * 2-1, 2-5 and 3-1. A policy holding them would be measuring a player who
 * cannot exist, and the floor numbers below would stop meaning anything.
 * Tests that want the full roster pass `FULL_ROSTER` explicitly.
 */
export const ALL_RUNES: RuneType[] = ['melee', 'archer', 'mage', 'defense', 'support']
/** Everything the campaign ever hands out — for nodes past chapter 3. */
export const FULL_ROSTER: RuneType[] = [...RUNE_TYPES]

/** Play node `id` to its end (or 80 turns, whichever comes first). */
export const playNode = (
  id: number, difficulty: Difficulty, seed: number, policy: Policy,
  handicap: Handicap = NO_HANDICAP, unlocked: readonly RuneType[] = ALL_RUNES
): MatchState => {
  const config = nodeConfig(id, difficulty)
  let s = beginPlanning(createMatch(config, unlocked, seed, 0), difficulty, handicap)
  for (let guard = 0; s.phase !== 'ended' && guard < 400; guard++) {
    s = commitPlayerMove(s, policy(s))
    s = nextTurn(resolveCurrentTurn(s).state, 0, difficulty, handicap)
  }
  return s
}

/** Fraction of `seeds` runs of `id` the policy wins. */
export const clearRate = (
  id: number, difficulty: Difficulty, seeds: number, make: (seed: number) => Policy, handicap: Handicap = NO_HANDICAP
): number => {
  let wins = 0
  for (let seed = 1; seed <= seeds; seed++) {
    if (playNode(id, difficulty, seed, make(seed), handicap).result?.won) wins++
  }
  return wins / seeds
}

export const zeroInput = (): Policy => () => null

export const careless = (seed: number): Policy => {
  let rng = seedFrom(seed, 0x5eed)
  return (s) => {
    if (s.hand.length === 0) return null
    const [ti, r1] = randInt(rng, s.hand.length)
    rng = r1
    const type = s.hand[ti]!
    const legal = legalPlacements(s.board, 'player', type)
    if (legal.length === 0) return null
    const [li, r2] = randInt(rng, legal.length)
    rng = r2
    const { cell } = legal[li]!
    return { side: 'player', faction: null, type, col: cell.col, row: cell.row, dir: defaultDir(type, 'player') }
  }
}

const enemyAtkMulOf = (s: MatchState) => {
  const byFaction = new Map<Faction, number>()
  for (const e of s.config.enemies) byFaction.set(e.faction, e.atkMul)
  return (f: Faction | null): number => (f ? (byFaction.get(f) ?? 1) : 1)
}

/** The move that does the most on THIS board (the enemy's hidden move is unknown to it, as to a player). */
export const greedy: Policy = (s) => {
  const opts = { enemyAtkMul: enemyAtkMulOf(s) }
  const tilesBefore = countTiles(s.board, 'player')
  let best: Move | null = null
  let bestScore = -Infinity
  for (const type of new Set(s.hand)) {
    for (const { cell, kind } of legalPlacements(s.board, 'player', type)) {
      for (const dir of dirsFor(type)) {
        const move: Move = { side: 'player', faction: null, type, col: cell.col, row: cell.row, dir }
        const out = resolveTurn(s.board, [move], opts)
        let damage = 0
        for (const e of out.events) {
          if (e.kind === 'shot' || e.kind === 'explode') for (const h of e.hits) if (h.target.side === 'enemy') damage += h.amount
        }
        const score = 6 * out.playerKills + 3 * damage - 5 * out.enemyKills
          + 2 * (countTiles(out.board, 'player') - tilesBefore) + (kind === 'stack' ? 1 : 0)
        if (score > bestScore + 1e-9) {
          bestScore = score
          best = move
        }
      }
    }
  }
  return best
}

/** Turn 1 is what the ghost hand shows; every turn after is `after`'s. */
export const ghostThen = (after: Policy): Policy => (s) => {
  const g = s.config.ghost
  if (s.turn === 1 && g && s.hand.includes(g.type)) {
    return { side: 'player', faction: null, type: g.type, col: g.to.col, row: g.to.row, dir: g.dir }
  }
  return after(s)
}
