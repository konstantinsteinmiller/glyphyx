import { describe, expect, it } from 'vitest'
import { RANDOM_CHANCE_CAP, effectiveRandomChance, enumerateEnemyMoves, planEnemyMove, randomChance, scoreMove } from '@/game/ai'
import { LATE_LESSON_NODES, nodeConfig } from '@/game/campaign'
import { createMatch, beginPlanning, commitPlayerMove, resolveCurrentTurn, nextTurn } from '@/game/match'
import { placementKind } from '@/game/board'
import { NO_HANDICAP, RUNE_TYPES, dirsFor, type EnemySetup, type MatchState } from '@/game/rules'
import { seedFrom } from '@/game/rng'
import { boardWith, p, testConfig, fullPower } from './helpers'

const goblin: EnemySetup = { faction: 'goblin', post: 'top', deck: ['melee', 'archer'], ai: 'brutal', atkMul: 1 }

const stateWith = (board = boardWith(), over: Partial<MatchState> = {}): MatchState => ({
  config: testConfig({ enemies: [goblin] }),
  board,
  turn: 1, phase: 'planning', hand: ['melee'], deck: ['melee'], rerollsLeft: 2, playerMove: null,
  enemyMoves: [], enemyTurnIndex: 0, suddenDeath: false, result: null, maxCombo: 0, kills: 0, rng: 1, startedAt: 0,
  handicap: NO_HANDICAP,
  ...over
})

describe('randomChance', () => {
  it('follows the AI level and the difficulty setting, clamped', () => {
    expect(randomChance('brutal', 'medium')).toBe(0)
    expect(randomChance('brutal', 'hard')).toBe(0)
    expect(randomChance('hard', 'medium')).toBeCloseTo(0.05)
    expect(randomChance('easy', 'easy')).toBeCloseTo(0.5)
    expect(randomChance('medium', 'hard')).toBeCloseTo(0.1)
    expect(randomChance('passive', 'medium')).toBe(1)
  })

  it('the relief adds to it, capped below certainty', () => {
    expect(effectiveRandomChance('brutal', 'medium')).toBe(0)
    expect(effectiveRandomChance('brutal', 'medium', 0.4)).toBeCloseTo(0.4)
    expect(effectiveRandomChance('easy', 'easy', 0.6)).toBe(RANDOM_CHANCE_CAP)
    expect(effectiveRandomChance('hard', 'hard', -1)).toBe(randomChance('hard', 'hard'))
  })
})

describe('planEnemyMove', () => {
  it('a passive faction places nothing and leaves the dice untouched', () => {
    const s = stateWith()
    expect(planEnemyMove(s, { ...goblin, ai: 'passive' }, 42, 'medium')).toEqual([null, 42])
  })

  it('a brutal sword takes the kill when one is on offer', () => {
    // A wounded player archer at (1,1); the enemy's only good move is a sword next to it, facing it.
    const board = boardWith(p('player', 'archer', 1, 1, 'up'))
    board.runes[1]!.hp = 1
    const s = stateWith(board)
    const [move] = planEnemyMove(s, { ...goblin, deck: ['melee'] }, seedFrom(3), 'medium')
    expect(move).not.toBeNull()
    expect(move!.type).toBe('melee')
    // Adjacent and facing the archer.
    const dx = 1 - move!.col
    const dy = 1 - move!.row
    expect(Math.abs(dx) + Math.abs(dy)).toBe(1)
    const facing = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[move!.dir as 'up' | 'down' | 'left' | 'right']
    expect(facing).toEqual([dx, dy])
  })

  it('is deterministic for a given dice state', () => {
    const s = stateWith(boardWith(p('player', 'melee', 1, 2, 'up')))
    const a = planEnemyMove(s, { ...goblin, ai: 'easy' }, 777, 'easy')
    const b = planEnemyMove(s, { ...goblin, ai: 'easy' }, 777, 'easy')
    expect(a).toEqual(b)
    expect(a[1]).not.toBe(777)
  })

  it('extra randomness changes the move distribution without touching the dice', () => {
    // A wounded player archer: the brutal sword takes the kill on every seed…
    const board = boardWith(p('player', 'archer', 1, 1, 'up'))
    board.runes[1]!.hp = 1
    const s = stateWith(board)
    const sword = { ...goblin, deck: ['melee'] as const }
    const isKill = (m: ReturnType<typeof planEnemyMove>[0]) =>
      m !== null && Math.abs(1 - m.col) + Math.abs(1 - m.row) === 1
    let kills = 0
    let relievedKills = 0
    for (let seed = 1; seed <= 40; seed++) {
      const [plain, afterPlain] = planEnemyMove(s, { ...sword, deck: [...sword.deck] }, seedFrom(seed), 'medium')
      const [relieved, afterRelieved] = planEnemyMove(s, { ...sword, deck: [...sword.deck] }, seedFrom(seed), 'medium', 0.9)
      if (isKill(plain)) kills++
      if (isKill(relieved)) relievedKills++
      // Same number of dice rolled either way.
      expect(afterRelieved).toBe(afterPlain)
    }
    expect(kills).toBe(40)
    // …and with 0.9 extra randomness it misses it most of the time.
    expect(relievedKills).toBeLessThan(20)
  })

  it('scores a killing blow above a placement that does nothing', () => {
    const board = boardWith(p('player', 'archer', 1, 1, 'up'))
    board.runes[1]!.hp = 1
    const kill = { move: { side: 'enemy' as const, faction: 'goblin' as const, type: 'melee' as const, col: 1, row: 0, dir: 'down' as const }, kind: 'empty' as const }
    const idle = { move: { side: 'enemy' as const, faction: 'goblin' as const, type: 'melee' as const, col: 3, row: 3, dir: 'down' as const }, kind: 'empty' as const }
    expect(scoreMove(board, kill, goblin, fullPower)).toBeGreaterThan(scoreMove(board, idle, goblin, fullPower))
  })

  it('enumerates only legal placements with legal facings', () => {
    const board = boardWith(p('enemy', 'melee', 1, 0, 'down'), p('player', 'melee', 1, 2, 'up'))
    const cands = enumerateEnemyMoves(board, goblin, ['melee', 'archer', 'melee'])
    expect(cands.length).toBeGreaterThan(0)
    for (const c of cands) {
      expect(placementKind(board, 'enemy', c.move.type, c.move.col, c.move.row)).not.toBe('invalid')
      expect(dirsFor(c.move.type)).toContain(c.move.dir)
      expect(c.move.side).toBe('enemy')
      expect(c.move.faction).toBe('goblin')
    }
    // The enemy's own Lv 1 sword at (1,0) is a stack for a sword, never for a bow.
    expect(cands.some((c) => c.kind === 'stack' && c.move.type === 'melee' && c.move.row === 0 && c.move.col === 1)).toBe(true)
    expect(cands.some((c) => c.move.type === 'archer' && c.move.row === 0 && c.move.col === 1)).toBe(false)
  })

  it('never returns an illegal move across every node of chapters 1–3, many seeds and several turns', () => {
    let decisions = 0
    for (let id = 1; id <= 24; id++) {
      const config = nodeConfig(id, 'medium')
      for (let seed = 0; seed < 8; seed++) {
        let s = beginPlanning(createMatch(config, ['melee', 'archer', 'mage', 'defense', 'support'], seed, 0), 'medium')
        for (let turn = 0; turn < 4 && s.phase === 'planning'; turn++) {
          for (const m of s.enemyMoves) {
            decisions++
            expect(m.side).toBe('enemy')
            expect(config.enemies.some((e) => e.faction === m.faction)).toBe(true)
            expect(placementKind(s.board, 'enemy', m.type, m.col, m.row)).not.toBe('invalid')
            expect(dirsFor(m.type)).toContain(m.dir)
          }
          // The player drops its first pebble on the first free tile it owns or on any empty tile.
          const type = s.hand[0]!
          const free = s.board.tiles.find((t) => placementKind(s.board, 'player', type, t.col, t.row) !== 'invalid')!
          s = commitPlayerMove(s, { side: 'player', faction: null, type, col: free.col, row: free.row, dir: dirsFor(type)[0]! })
          s = nextTurn(resolveCurrentTurn(s).state, 1000, 'medium')
        }
      }
    }
    expect(decisions).toBeGreaterThan(200)
  })

  it('plays the late runes legally once chapter 4 puts them in the enemy decks', () => {
    // Chapter 4 is where `widenedDeck` hands the axe, the boulder and the
    // mortar to the orcs, goblins and undead. The AI scores through the real
    // resolver, so this exercises the whole new stack at once: if a pattern
    // helper or a resolution step is wrong for a rune, a placement here is
    // illegal, mis-aimed, or the resolution throws.
    const seen = new Set<string>()
    let decisions = 0
    for (let id = 25; id <= 32; id++) {
      // Two of chapter 4's eight nodes are LESSONS now (4-2 the nuke, 4-6 the
      // crown): passive dummies that never place, so they contribute nothing
      // to a test about what the AI reaches for.
      if (LATE_LESSON_NODES[id]) continue
      const config = nodeConfig(id, 'medium')
      for (let seed = 0; seed < 8; seed++) {
        let s = beginPlanning(createMatch(config, [...RUNE_TYPES], seed, 0), 'medium')
        for (let turn = 0; turn < 4 && s.phase === 'planning'; turn++) {
          for (const m of s.enemyMoves) {
            decisions++
            seen.add(m.type)
            expect(placementKind(s.board, 'enemy', m.type, m.col, m.row)).not.toBe('invalid')
            expect(dirsFor(m.type)).toContain(m.dir)
          }
          const type = s.hand[0]!
          const free = s.board.tiles.find((t) => placementKind(s.board, 'player', type, t.col, t.row) !== 'invalid')!
          s = commitPlayerMove(s, { side: 'player', faction: null, type, col: free.col, row: free.row, dir: dirsFor(type)[0]! })
          s = nextTurn(resolveCurrentTurn(s).state, 1000, 'medium')
        }
      }
    }
    expect(decisions).toBeGreaterThan(150)
    // …and it actually reaches for them rather than only ever playing the old five.
    for (const late of ['cleave', 'roller', 'bombard'] as const) expect(seen).toContain(late)
  })
})
