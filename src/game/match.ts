/**
 * ─── The match state machine ────────────────────────────────────────────────
 *
 * planning → reveal → resolve → (planning | ended), one turn at a time, as
 * pure transitions over `MatchState`. Nothing here knows about clocks or
 * canvases: the composable decides WHEN to call these, this module decides
 * what they do.
 *
 * `state.turn` is the turn whose moves are on the table. After
 * `resolveCurrentTurn` it is the turn whose result is on the board, and
 * `evaluateResult` / `nextTurn` read it as "turns played so far".
 */

import {
  CONQUEST_TILES, LESSON_RESCUE_TURNS, NO_HANDICAP, REROLLS_PER_MATCH, RUNES, STARTING_RUNES, clampLevel, dirsFor,
  strikeCells,
  type Cell, type Handicap, type Dir, type Faction, type MatchResult, type MatchState, type Move, type NodeConfig,
  type ResolveEvent, type RuneType
} from './rules'
import { countTiles, createBoard, factionTiles, legalPlacements, placementKind, runeAt, runesOf, sideHp } from './board'
import { drawHand, fillHand } from './hand'
import { planEnemyMove, type Difficulty } from './ai'
import { rand, seedFrom } from './rng'
import { resolveTurn, type ResolveOptions } from './resolve'
import type { PlacementKind } from './view'

const atkMulOf = (config: NodeConfig): ResolveOptions['enemyAtkMul'] => {
  const byFaction = new Map<Faction, number>()
  for (const e of config.enemies) byFaction.set(e.faction, e.atkMul)
  return (f) => (f ? (byFaction.get(f) ?? 1) : 1)
}

/**
 * A tutorial node teaches ONE rune, so that rune must be in the opening hand:
 * the ghost hand points at it, and a lesson about the bow with no bow to pick
 * up is a lesson the player cannot take. The rune is whatever the node's
 * `ghost` script drops; random draws are otherwise untouched. (The stack
 * lesson drops ONE sword onto a sword already standing, so one is enough.)
 */
export const tutorialHand = (config: NodeConfig, hand: readonly RuneType[]): RuneType[] => {
  const out = hand.slice()
  const want = config.tutorial ? config.ghost?.type : undefined
  if (!want || out.includes(want)) return out
  if (out.length === 0) return [want]
  out[0] = want
  return out
}

/** A fresh match at turn 1, phase `planning`, hand drawn, enemy moves NOT yet planned. */
/**
 * `boons`: power-rune boons from the shop, type → the level the player's first
 * placement of that type lands at. Copied, never consumed by the draw.
 *
 * `ranks`: the player's permanent rune ranks. COPIED here, once, and read from
 * the state for the rest of the match — so a rank bought while a match is up
 * (the shop is reachable from the result screen, and the result screen can sit
 * over a finished board) cannot retroactively change runes already standing.
 * A match stays a pure function of the state it was created with.
 */
export const createMatch = (
  config: NodeConfig, unlocked: readonly RuneType[], seed: number, now: number,
  boons: MatchState['boons'] = {}, ranks: MatchState['ranks'] = {}
): MatchState => {
  const deck = (config.playerDeck ?? (unlocked.length > 0 ? unlocked : STARTING_RUNES)).slice()
  const [drawn, rng] = drawHand(deck, seedFrom(seed))
  const hand = tutorialHand(config, drawn)
  return {
    config,
    board: createBoard(config, ranks),
    turn: 1,
    phase: 'planning',
    handicap: NO_HANDICAP,
    hand,
    deck,
    rerollsLeft: REROLLS_PER_MATCH,
    playerMove: null,
    enemyMoves: [],
    enemyTurnIndex: 0,
    suddenDeath: false,
    result: null,
    maxCombo: 0,
    kills: 0,
    rng,
    startedAt: now,
    boons: { ...boons },
    ranks: { ...ranks },
    stallTurns: 0
  }
}

/**
 * Enter planning for the current turn: enemy factions decide (hidden), the
 * hand is full.
 *
 * `handicap` is the adaptive relief in force this turn (`adaptive.ts`): the
 * acting faction may SKIP the turn (`skipChance`, one extra dice roll — only
 * rolled when there is a chance at all, so a match with no relief consumes the
 * same dice it always did), plays more random moves (`extraRandom`), and its
 * hits are scaled by `atkMul` when the turn resolves. The relief is stored on
 * the state so the resolver and the clock read the same numbers.
 */
export const beginPlanning = (state: MatchState, difficulty: Difficulty, handicap: Handicap = NO_HANDICAP): MatchState => {
  state = { ...state, handicap }
  let rng = state.rng
  const [hand, afterFill] = fillHand(state.hand, state.deck, rng)
  rng = afterFill

  const enemies = state.config.enemies
  let enemyMoves: Move[] = []
  let enemyTurnIndex = state.enemyTurnIndex
  if (enemies.length > 0) {
    const siege = state.config.mode === 'siege'
    const acting = siege ? enemies[enemyTurnIndex % enemies.length]! : enemies[0]!
    let skipped = false
    if (handicap.skipChance > 0) {
      const [roll, afterRoll] = rand(rng)
      rng = afterRoll
      skipped = roll < handicap.skipChance
    }
    if (!skipped) {
      const [move, afterPlan] = planEnemyMove({ ...state, hand, rng }, acting, rng, difficulty, handicap.extraRandom)
      rng = afterPlan
      if (move) enemyMoves = [move]
    }
    // A skipped faction still spends its place in the siege rotation.
    if (siege) enemyTurnIndex = (enemyTurnIndex + 1) % enemies.length
  }

  return { ...state, hand, rng, enemyMoves, enemyTurnIndex, phase: 'planning', playerMove: null }
}

/** Lock the player's move (or `null` to pass) → phase `reveal`. */
export const commitPlayerMove = (state: MatchState, move: Move | null): MatchState => {
  if (state.phase !== 'planning') return state
  if (move === null) return { ...state, playerMove: null, phase: 'reveal' }

  const slot = state.hand.indexOf(move.type)
  if (slot < 0) return state
  if (placementKind(state.board, 'player', move.type, move.col, move.row) === 'invalid') return state
  if (!dirsFor(move.type).includes(move.dir)) return state

  const hand = state.hand.slice()
  hand.splice(slot, 1)
  const locked: Move = { ...move, side: 'player', faction: null }
  delete locked.level
  // A power-rune boon: the first placement of its type lands at the boon's
  // level, and the boon is spent on commit (a stack ignores the level).
  const boon = state.boons[move.type]
  let boons = state.boons
  if (boon !== undefined) {
    locked.level = clampLevel(boon)
    boons = { ...state.boons }
    delete boons[move.type]
  }
  return { ...state, hand, boons, playerMove: locked, phase: 'reveal' }
}

export const rerollHand = (state: MatchState): MatchState => {
  if (state.phase !== 'planning' || state.rerollsLeft <= 0) return state
  const [hand, rng] = drawHand(state.deck, state.rng)
  return { ...state, hand, rng, rerollsLeft: state.rerollsLeft - 1 }
}

/** Apply every committed move and resolve → phase `resolve`. */
export const resolveCurrentTurn = (state: MatchState): { state: MatchState; events: ResolveEvent[] } => {
  const s = state.phase === 'planning' ? commitPlayerMove(state, null) : state
  const moves: Move[] = []
  if (s.playerMove) moves.push(s.playerMove)
  moves.push(...s.enemyMoves)
  // The node's own per-faction multiplier (0 = training dummy) times this
  // turn's relief; the resolver keeps any scaled hit at 1 or more.
  const nodeMul = atkMulOf(s.config)
  const reliefMul = s.handicap?.atkMul ?? 1
  const before = sideHp(s.board, 'enemy')
  const outcome = resolveTurn(s.board, moves, {
    enemyAtkMul: (f) => nodeMul(f) * reliefMul,
    // The match's own copy, not the shop's live one — see `createMatch`.
    playerRanks: s.ranks
  })
  // Did this turn do the enemy any harm at all? That, and not the turn
  // counter, is what says a match is going nowhere — see `MatchState.stallTurns`.
  const landed = sideHp(outcome.board, 'enemy') < before
  return {
    state: {
      ...s,
      board: outcome.board,
      phase: 'resolve',
      kills: s.kills + outcome.playerKills,
      maxCombo: Math.max(s.maxCombo, outcome.playerKills),
      stallTurns: landed ? 0 : s.stallTurns + 1
    },
    events: outcome.events
  }
}

/**
 * A move from the hand that would land on something this turn — what the
 * teaching hand comes back to show when a lesson stalls (`LESSON_HINT_TURNS`).
 *
 * Best by the same measure `usefulDir` uses — how many enemy stones the
 * placement's own shape covers — and a stack counts at the level it would
 * reach. `null` when the hand genuinely has nothing that touches anything,
 * which is when the rescue's second step takes over.
 */
export const rescueMove = (state: MatchState): Move | null => {
  let best: Move | null = null
  let bestScore = 0
  for (const type of new Set(state.hand)) {
    for (const { cell, kind } of legalPlacements(state.board, 'player', type)) {
      const under = runeAt(state.board, cell.col, cell.row)
      const level = kind === 'stack' && under ? clampLevel(under.level + 1) : clampLevel(state.boons[type] ?? 1)
      for (const dir of dirsFor(type)) {
        let score = 0
        for (const hit of strikeCells(type, level, dir, cell)) {
          const rune = runeAt(state.board, hit.col, hit.row)
          if (rune && rune.side === 'enemy') score++
        }
        if (score > bestScore) {
          bestScore = score
          best = { side: 'player', faction: null, type, col: cell.col, row: cell.row, dir }
        }
      }
    }
  }
  return best
}

/** The result the current board implies, or `null` while the match is undecided. */
export const evaluateResult = (state: MatchState, now: number): MatchResult | null => {
  const { board, config } = state
  const playerTiles = countTiles(board, 'player')
  const enemyTiles = countTiles(board, 'enemy')
  const atLimit = state.turn >= config.turnLimit
  const done = (won: boolean, reason: MatchResult['reason']): MatchResult => ({
    won, reason, turns: state.turn, playerTiles, enemyTiles,
    maxCombo: state.maxCombo, kills: state.kills, durationMs: Math.max(0, now - state.startedAt)
  })

  // A lesson that has gone nowhere for `LESSON_RESCUE_TURNS` is over: the
  // dummies crumble and it counts as taught. Lessons only — a real match that
  // stalls has the stall-breaker, sudden death and a turn limit to end it,
  // and none of those hand the player a win.
  if (config.tutorial && state.stallTurns >= LESSON_RESCUE_TURNS) return done(true, 'crumbled')

  switch (config.objective) {
    case 'eliminate': {
      if (runesOf(board, 'enemy').length === 0) return done(true, 'eliminated')
      if (atLimit) return done(false, 'turnLimit')
      return null
    }
    case 'conquest': {
      const p8 = playerTiles >= CONQUEST_TILES
      const e8 = enemyTiles >= CONQUEST_TILES
      if (p8 && !e8) return done(true, 'conquest')
      if (e8 && !p8) return done(false, 'conquest')
      if (state.suddenDeath) {
        if (playerTiles > enemyTiles) return done(true, 'suddenDeath')
        if (playerTiles < enemyTiles) return done(false, 'suddenDeath')
        return null
      }
      if (atLimit) {
        if (playerTiles > enemyTiles) return done(true, 'turnLimit')
        if (playerTiles < enemyTiles) return done(false, 'turnLimit')
      }
      return null
    }
    case 'siege': {
      if (playerTiles >= CONQUEST_TILES) return done(true, 'conquest')
      if (playerTiles === 0) return done(false, 'overrun')
      if (atLimit) {
        const biggest = Math.max(0, ...Object.values(factionTiles(board)).map((n) => n ?? 0))
        return playerTiles >= biggest ? done(true, 'siegeHeld') : done(false, 'siegeBroken')
      }
      return null
    }
  }
}

/**
 * After the resolution animation: decide the match or advance to the next
 * turn's planning. `handicap` is the relief for the turn about to begin.
 */
export const nextTurn = (state: MatchState, now: number, difficulty: Difficulty, handicap: Handicap = NO_HANDICAP): MatchState => {
  const result = evaluateResult(state, now)
  if (result) return { ...state, phase: 'ended', result }
  const atLimit = state.turn >= state.config.turnLimit
  const suddenDeath = state.suddenDeath || (atLimit && state.config.objective === 'conquest')
  const next: MatchState = {
    ...state, turn: state.turn + 1, suddenDeath, phase: 'planning', playerMove: null, enemyMoves: []
  }
  return beginPlanning(next, difficulty, handicap)
}

export const placementKindFor = (state: MatchState, type: RuneType, cell: Cell): PlacementKind =>
  placementKind(state.board, 'player', type, cell.col, cell.row)

/**
 * May the locked move be turned to face `dir`? Only inside the correction
 * window — the move is committed (`phase === 'reveal'`) and the board has not
 * resolved — and only for a rune that has a facing at all: a shield or a cross
 * is `omni`, there is nothing to correct. Whether the lock's clock is still
 * running is the composable's business.
 */
export const canReaim = (state: MatchState, dir: Dir): boolean => {
  const move = state.playerMove
  if (!move || state.phase !== 'reveal') return false
  if (RUNES[move.type].aim === 'omni') return false
  return dirsFor(move.type).includes(dir)
}

/** Re-aim the locked move (see `canReaim`). Returns the state unchanged when it may not. */
export const reaimPlayerMove = (state: MatchState, dir: Dir): MatchState => {
  if (!canReaim(state, dir)) return state
  return { ...state, playerMove: { ...state.playerMove!, dir } }
}
