/**
 * ─── The enemy's turn ───────────────────────────────────────────────────────
 *
 * One placement per faction per turn, chosen by trying every legal one against
 * the real resolver (with the player passing) and scoring what it did. That
 * keeps the AI honest by construction: it cannot want something the rules do
 * not deliver, and a rule change retunes it for free.
 *
 * Difficulty is a dice roll on top: with probability `p` the faction plays a
 * random legal move instead of its best. Every decision is deterministic for a
 * given PRNG state, so a match replays in a test.
 */

import {
  CONQUEST_TILES, dirsFor, type AiLevel, type BoardState, type Cell, type EnemySetup, type Faction,
  type MatchState, type Move, type RuneType
} from './rules'
import { countTiles, legalPlacements, neighbors, runeAt } from './board'
import { drawHand } from './hand'
import { rand, randInt } from './rng'
import { resolveTurn, type ResolveOptions } from './resolve'
import type { PlacementKind } from './view'

export type Difficulty = 'easy' | 'medium' | 'hard'

/** Chance of a random move per AI level… */
const RANDOM_CHANCE: Record<AiLevel, number> = {
  passive: 1, easy: 0.35, medium: 0.15, hard: 0.05, brutal: 0
}
/** …nudged by the player's difficulty setting. */
const DIFFICULTY_NUDGE: Record<Difficulty, number> = { easy: 0.15, medium: 0, hard: -0.05 }

export const randomChance = (ai: AiLevel, difficulty: Difficulty): number =>
  Math.max(0, Math.min(1, RANDOM_CHANCE[ai] + DIFFICULTY_NUDGE[difficulty]))

/** Even a fully relieved enemy keeps a sliver of judgement. */
export const RANDOM_CHANCE_CAP = 0.95

/**
 * …plus the adaptive relief's `extraRandom` (see `adaptive.ts`), capped so a
 * struggling player still meets an enemy that sometimes plays the right move.
 */
export const effectiveRandomChance = (ai: AiLevel, difficulty: Difficulty, extraRandom = 0): number =>
  Math.min(RANDOM_CHANCE_CAP, randomChance(ai, difficulty) + Math.max(0, extraRandom))

export interface Candidate {
  move: Move
  kind: PlacementKind
}

/** Every legal (type, cell, dir) for `enemy` given the types in `hand`. */
export const enumerateEnemyMoves = (board: BoardState, enemy: EnemySetup, hand: readonly RuneType[]): Candidate[] => {
  const out: Candidate[] = []
  const types = [...new Set(hand)]
  for (const type of types) {
    for (const { cell, kind } of legalPlacements(board, 'enemy', type)) {
      for (const dir of dirsFor(type)) {
        out.push({ move: { side: 'enemy', faction: enemy.faction, type, col: cell.col, row: cell.row, dir }, kind })
      }
    }
  }
  return out
}

const nearPost = (post: EnemySetup['post'], c: Cell): boolean => {
  switch (post) {
    case 'top':
    case 'north': return c.row <= 1
    case 'west': return c.col <= 1
    case 'east': return c.col >= 2
  }
}

const atkMulOf = (state: MatchState): ResolveOptions['enemyAtkMul'] => {
  const byFaction = new Map<Faction, number>()
  for (const e of state.config.enemies) byFaction.set(e.faction, e.atkMul)
  return (f) => (f ? (byFaction.get(f) ?? 1) : 1)
}

/** How good `candidate` is on `board`, judged by what the resolver does with it. */
export const scoreMove = (board: BoardState, candidate: Candidate, enemy: EnemySetup, opts: ResolveOptions): number => {
  const { move, kind } = candidate
  const outcome = resolveTurn(board, [move], opts)
  let damage = 0
  for (const e of outcome.events) {
    if (e.kind === 'shot' || e.kind === 'explode') {
      for (const h of e.hits) if (h.target.side === 'player') damage += h.amount
    }
  }
  const tilesBefore = countTiles(board, 'enemy')
  const tilesAfter = countTiles(outcome.board, 'enemy')

  let score = 0
  score += 3 * damage
  score += 6 * outcome.enemyKills
  score += 2 * (tilesAfter - tilesBefore)
  score += 1 * Math.min(tilesAfter, CONQUEST_TILES)
  if (kind === 'stack') score += 2
  let friendsAdjacent = 0
  let pressure = false
  for (const n of neighbors(move)) {
    const r = runeAt(board, n.col, n.row)
    if (!r) continue
    if (r.side === 'player') pressure = true
    else friendsAdjacent++
  }
  if (pressure) score += 1
  score += 0.5 * friendsAdjacent
  if (nearPost(enemy.post, move)) score += 0.5
  return score
}

/**
 * Decide one enemy placement for `enemy` this turn. `null` when the faction
 * places nothing (a `passive` AI, or no legal tile). Deterministic for a given
 * `rng`; returns the advanced state. `extraRandom` is the adaptive relief's
 * addition to the random-move chance — it changes WHICH branch the same dice
 * pick, never how many dice are rolled, so a match with no relief replays
 * exactly as it did before relief existed.
 */
export const planEnemyMove = (
  state: MatchState, enemy: EnemySetup, rng: number, difficulty: Difficulty, extraRandom = 0
): [Move | null, number] => {
  if (enemy.ai === 'passive') return [null, rng]
  let s = rng
  const [hand, afterDraw] = drawHand(enemy.deck, s)
  s = afterDraw
  const candidates = enumerateEnemyMoves(state.board, enemy, hand)
  if (candidates.length === 0) return [null, s]

  const [roll, afterRoll] = rand(s)
  s = afterRoll
  if (roll < effectiveRandomChance(enemy.ai, difficulty, extraRandom)) {
    const [i, next] = randInt(s, candidates.length)
    return [candidates[i]!.move, next]
  }

  const opts: ResolveOptions = { enemyAtkMul: atkMulOf(state) }
  let best: Candidate[] = []
  let bestScore = -Infinity
  for (const c of candidates) {
    const sc = scoreMove(state.board, c, enemy, opts)
    if (sc > bestScore + 1e-9) {
      bestScore = sc
      best = [c]
    } else if (Math.abs(sc - bestScore) <= 1e-9) {
      best.push(c)
    }
  }
  const [i, next] = randInt(s, best.length)
  return [best[i]!.move, next]
}
