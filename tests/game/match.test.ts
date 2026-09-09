import { describe, expect, it } from 'vitest'
import {
  beginPlanning, canReaim, commitPlayerMove, createMatch, evaluateResult, nextTurn, placementKindFor, reaimPlayerMove,
  rerollHand, resolveCurrentTurn, tutorialHand
} from '@/game/match'
import { nodeConfig } from '@/game/campaign'
import { addRune, createBoard, runesOf } from '@/game/board'
import {
  HAND_SIZE, NO_HANDICAP, REROLLS_PER_MATCH, dirsFor, statsFor, type Handicap, type MatchState, type Move
} from '@/game/rules'
import { drawHand, fillHand } from '@/game/hand'
import { planEnemyMove } from '@/game/ai'
import { p, testConfig } from './helpers'

const ALL = ['melee', 'archer', 'mage', 'defense', 'support'] as const
const playerMove = (type: Move['type'], col: number, row: number, dir: Move['dir']): Move =>
  ({ side: 'player', faction: null, type, col, row, dir })

describe('the hand', () => {
  it('draws HAND_SIZE pebbles from the deck', () => {
    const [hand] = drawHand(['melee', 'archer'], 5)
    expect(hand).toHaveLength(HAND_SIZE)
    for (const t of hand) expect(['melee', 'archer']).toContain(t)
  })
  it('tops a short hand up without touching what is there', () => {
    const [hand] = fillHand(['mage'], ['melee'], 5)
    expect(hand[0]).toBe('mage')
    expect(hand).toHaveLength(HAND_SIZE)
  })
  it('a one-type deck can only ever deal that type', () => {
    const [hand] = drawHand(['melee'], 9)
    expect(hand).toEqual(['melee', 'melee', 'melee'])
  })
  it('falls back to the sword when handed an empty deck', () => {
    const [hand] = drawHand([], 1)
    expect(hand).toEqual(['melee', 'melee', 'melee'])
  })
})

describe('node 1-1, the whole loop', () => {
  it('a sword dropped at (1,2) and turned LEFT wins in one turn', () => {
    const config = nodeConfig(1, 'medium')
    let s = createMatch(config, ['melee'], 1, 1000)
    expect(s.phase).toBe('planning')
    expect(s.hand).toEqual(['melee', 'melee', 'melee'])
    expect(s.rerollsLeft).toBe(REROLLS_PER_MATCH)
    expect(s.enemyMoves).toEqual([])

    s = beginPlanning(s, 'medium')
    expect(s.enemyMoves).toEqual([]) // passive dummy

    expect(placementKindFor(s, 'melee', { col: 1, row: 2 })).toBe('empty')
    expect(placementKindFor(s, 'melee', { col: 0, row: 2 })).toBe('invalid') // the skeleton stands there

    s = commitPlayerMove(s, playerMove('melee', 1, 2, 'left'))
    expect(s.phase).toBe('reveal')
    expect(s.hand).toHaveLength(2)
    expect(s.playerMove).toMatchObject({ type: 'melee', col: 1, row: 2, dir: 'left', side: 'player' })

    const { state, events } = resolveCurrentTurn(s)
    expect(state.phase).toBe('resolve')
    expect(events.some((e) => e.kind === 'shatter')).toBe(true)
    expect(state.kills).toBe(1)

    const done = nextTurn(state, 6500, 'medium')
    expect(done.phase).toBe('ended')
    expect(done.result).toMatchObject({ won: true, reason: 'eliminated', turns: 1, kills: 1, durationMs: 5500 })
  })

  it('placing the sword elsewhere does not end the match; the hand refills next turn', () => {
    const config = nodeConfig(1, 'medium')
    let s = beginPlanning(createMatch(config, ['melee'], 1, 0), 'medium')
    s = commitPlayerMove(s, playerMove('melee', 3, 3, 'up'))
    const after = nextTurn(resolveCurrentTurn(s).state, 0, 'medium')
    expect(after.phase).toBe('planning')
    expect(after.turn).toBe(2)
    expect(after.hand).toHaveLength(HAND_SIZE)
    expect(after.result).toBeNull()
  })
})

describe('commitPlayerMove validation', () => {
  const start = () => beginPlanning(createMatch(testConfig(), [...ALL], 3, 0), 'medium')

  it('rejects a type not in the hand, an invalid tile and a wrong facing', () => {
    const s = start()
    const missing = ALL.find((t) => !s.hand.includes(t))!
    expect(commitPlayerMove(s, playerMove(missing, 1, 2, 'up'))).toBe(s)
    expect(commitPlayerMove(s, playerMove(s.hand[0]!, 9, 9, 'up'))).toBe(s)
    const type = s.hand[0]!
    const badDir = type === 'mage' ? 'up' : type === 'defense' || type === 'support' ? 'up' : 'ul'
    expect(commitPlayerMove(s, playerMove(type, 1, 2, badDir))).toBe(s)
  })

  it('a pass is a reveal with no move', () => {
    const s = commitPlayerMove(start(), null)
    expect(s.phase).toBe('reveal')
    expect(s.playerMove).toBeNull()
    expect(s.hand).toHaveLength(HAND_SIZE)
  })

  it('cannot commit outside planning', () => {
    const s = commitPlayerMove(start(), null)
    expect(commitPlayerMove(s, playerMove(s.hand[0]!, 1, 2, 'up'))).toBe(s)
  })

  it('resolving straight from planning counts as a pass', () => {
    const s = start()
    const { state } = resolveCurrentTurn(s)
    expect(state.phase).toBe('resolve')
    expect(state.playerMove).toBeNull()
  })
})

describe('reroll', () => {
  it('redraws the whole hand, costs one reroll, and stops at zero', () => {
    let s = beginPlanning(createMatch(testConfig(), [...ALL], 11, 0), 'medium')
    const first = s.hand.slice()
    s = rerollHand(s)
    expect(s.rerollsLeft).toBe(REROLLS_PER_MATCH - 1)
    expect(s.hand).toHaveLength(HAND_SIZE)
    s = rerollHand(s)
    expect(s.rerollsLeft).toBe(0)
    const spent = rerollHand(s)
    expect(spent).toBe(s)
    // Somewhere across the two rerolls the hand actually changed.
    expect(first.join() === s.hand.join() && first.join() === spent.hand.join()).toBe(false)
  })

  it('is refused outside planning', () => {
    const s = commitPlayerMove(beginPlanning(createMatch(testConfig(), [...ALL], 2, 0), 'medium'), null)
    expect(rerollHand(s)).toBe(s)
  })
})

describe('siege turn order', () => {
  it('rotates through the factions one per turn', () => {
    const config = nodeConfig(8, 'medium')
    let s = beginPlanning(createMatch(config, [...ALL], 5, 0), 'medium')
    const factions: string[] = []
    for (let i = 0; i < 6; i++) {
      expect(s.enemyMoves.length).toBeLessThanOrEqual(1)
      factions.push(s.enemyMoves[0]?.faction ?? 'none')
      s = nextTurn(resolveCurrentTurn(commitPlayerMove(s, null)).state, 0, 'medium')
      if (s.phase === 'ended') break
    }
    expect(factions.slice(0, 3)).toEqual(['goblin', 'orc', 'undead'])
    expect(factions.slice(3, 6)).toEqual(factions.slice(0, 3).slice(0, factions.length - 3))
  })
})

// ─── Verdicts ─────────────────────────────────────────────────────────────────

/** A state whose board is hand-built, for asking `evaluateResult` directly. */
const verdictState = (over: Partial<MatchState>, build: (b: ReturnType<typeof createBoard>) => void): MatchState => {
  const config = over.config ?? testConfig()
  const board = createBoard(config)
  build(board)
  return {
    config, board, turn: 1, phase: 'resolve', hand: [], deck: ['melee'], rerollsLeft: 0, playerMove: null,
    enemyMoves: [], enemyTurnIndex: 0, suddenDeath: false, result: null, maxCombo: 1, kills: 2, rng: 1, startedAt: 100,
    handicap: NO_HANDICAP,
    ...over
  }
}
const own = (b: ReturnType<typeof createBoard>, side: 'player' | 'enemy', cells: Array<[number, number]>): void => {
  for (const [col, row] of cells) {
    const t = b.tiles[row * 4 + col]!
    t.owner = side
    t.faction = side === 'enemy' ? 'goblin' : null
  }
}

describe('conquest verdicts', () => {
  it('eight tiles wins, for either side', () => {
    const win = verdictState({}, (b) => own(b, 'player', [[0, 2], [1, 2], [2, 2], [3, 2]]))
    expect(evaluateResult(win, 600)).toMatchObject({ won: true, reason: 'conquest', playerTiles: 8, enemyTiles: 4, durationMs: 500, maxCombo: 1, kills: 2 })
    const loss = verdictState({}, (b) => own(b, 'enemy', [[0, 1], [1, 1], [2, 1], [3, 1]]))
    expect(evaluateResult(loss, 600)).toMatchObject({ won: false, reason: 'conquest' })
  })

  it('is undecided before the limit, decided on tiles at the limit, sudden death on a tie', () => {
    expect(evaluateResult(verdictState({ turn: 5 }, () => {}), 0)).toBeNull()
    const ahead = verdictState({ turn: 10 }, (b) => own(b, 'player', [[0, 2]]))
    expect(evaluateResult(ahead, 0)).toMatchObject({ won: true, reason: 'turnLimit', turns: 10 })
    const behind = verdictState({ turn: 10 }, (b) => own(b, 'enemy', [[0, 2]]))
    expect(evaluateResult(behind, 0)).toMatchObject({ won: false, reason: 'turnLimit' })
    const tied = verdictState({ turn: 10 }, () => {})
    expect(evaluateResult(tied, 0)).toBeNull()
    const next = nextTurn(tied, 0, 'medium')
    expect(next.suddenDeath).toBe(true)
    expect(next.turn).toBe(11)
    expect(next.phase).toBe('planning')
  })

  it('sudden death ends the moment the counts differ', () => {
    const still = verdictState({ turn: 12, suddenDeath: true }, () => {})
    expect(evaluateResult(still, 0)).toBeNull()
    const won = verdictState({ turn: 12, suddenDeath: true }, (b) => own(b, 'player', [[2, 1]]))
    expect(evaluateResult(won, 0)).toMatchObject({ won: true, reason: 'suddenDeath' })
    const lost = verdictState({ turn: 12, suddenDeath: true }, (b) => own(b, 'enemy', [[2, 2]]))
    expect(evaluateResult(lost, 0)).toMatchObject({ won: false, reason: 'suddenDeath' })
  })
})

describe('eliminate verdicts', () => {
  const cfg = testConfig({ objective: 'eliminate' })
  it('wins when no enemy rune stands, loses only at the turn limit', () => {
    const clear = verdictState({ config: cfg }, () => {})
    expect(evaluateResult(clear, 0)).toMatchObject({ won: true, reason: 'eliminated' })
    const standing = verdictState({ config: cfg, turn: 3 }, (b) => { addRune(b, p('enemy', 'melee', 1, 1, 'down')) })
    expect(evaluateResult(standing, 0)).toBeNull()
    const late = verdictState({ config: cfg, turn: 10 }, (b) => { addRune(b, p('enemy', 'melee', 1, 1, 'down')) })
    expect(evaluateResult(late, 0)).toMatchObject({ won: false, reason: 'turnLimit' })
  })
})

describe('siege verdicts', () => {
  const cfg = nodeConfig(8, 'medium')
  it('eight tiles breaks out, zero tiles is overrun', () => {
    const out = verdictState({ config: cfg }, (b) => own(b, 'player', [[0, 3], [1, 3], [2, 3], [3, 3]]))
    expect(evaluateResult(out, 0)).toMatchObject({ won: true, reason: 'conquest' })
    const overrun = verdictState({ config: cfg }, (b) => own(b, 'enemy', [[1, 1], [2, 1], [1, 2], [2, 2]]))
    expect(evaluateResult(overrun, 0)).toMatchObject({ won: false, reason: 'overrun' })
  })
  it('at the limit the player must match the biggest single faction; a tie holds', () => {
    // North holds 4; the player holds 4 → held.
    expect(evaluateResult(verdictState({ config: cfg, turn: 10 }, () => {}), 0)).toMatchObject({ won: true, reason: 'siegeHeld' })
    // North grows to 5 → broken.
    const broken = verdictState({ config: cfg, turn: 10 }, (b) => {
      const t = b.tiles[3 * 4 + 0]!
      t.owner = 'enemy'
      t.faction = 'goblin'
    })
    expect(evaluateResult(broken, 0)).toMatchObject({ won: false, reason: 'siegeBroken' })
    expect(evaluateResult(verdictState({ config: cfg, turn: 9 }, () => {}), 0)).toBeNull()
  })
})

describe('nextTurn', () => {
  it('ends the match on a verdict and otherwise plans the next turn', () => {
    const cfg = testConfig({ objective: 'eliminate' })
    const won = nextTurn(verdictState({ config: cfg }, () => {}), 0, 'medium')
    expect(won.phase).toBe('ended')
    expect(won.result?.won).toBe(true)
    const going = nextTurn(verdictState({ config: cfg, turn: 2, hand: ['melee'] }, (b) => { addRune(b, p('enemy', 'melee', 1, 1, 'down')) }), 0, 'medium')
    expect(going.phase).toBe('planning')
    expect(going.turn).toBe(3)
    expect(going.hand).toHaveLength(HAND_SIZE)
    expect(going.enemyMoves.length).toBeLessThanOrEqual(1)
  })
})

describe('the tutorial hand', () => {
  it('always holds the rune the ghost hand is about to drop, on every lesson', () => {
    for (let id = 1; id <= 6; id++) {
      const config = nodeConfig(id, 'medium')
      const want = config.ghost!.type
      for (let seed = 1; seed <= 40; seed++) {
        const s = createMatch(config, ['melee', 'archer', 'mage', 'defense', 'support'], seed, 0)
        expect(s.hand).toContain(want)
        expect(s.hand).toHaveLength(HAND_SIZE)
      }
    }
  })

  it('touches nothing when the rune is already there, and nothing on a real node', () => {
    expect(tutorialHand(nodeConfig(4, 'medium'), ['mage', 'melee', 'archer'])).toEqual(['mage', 'melee', 'archer'])
    expect(tutorialHand(nodeConfig(4, 'medium'), ['melee', 'melee', 'archer'])).toEqual(['mage', 'melee', 'archer'])
    expect(tutorialHand(nodeConfig(7, 'medium'), ['melee', 'melee', 'archer'])).toEqual(['melee', 'melee', 'archer'])
    expect(tutorialHand(nodeConfig(4, 'medium'), [])).toEqual(['mage'])
  })
})

// ─── The adaptive relief, applied ─────────────────────────────────────────────

describe('the handicap', () => {
  const ALL_RUNES = [...ALL]
  const duel = () => createMatch(nodeConfig(7, 'medium'), ALL_RUNES, 21, 0)

  it('is stored on the state and defaults to none', () => {
    expect(createMatch(testConfig(), ALL_RUNES, 1, 0).handicap).toEqual(NO_HANDICAP)
    const relief: Handicap = { skipChance: 0.5, extraRandom: 0.2, atkMul: 0.8, timerMs: 7000 }
    expect(beginPlanning(duel(), 'medium', relief).handicap).toEqual(relief)
    expect(beginPlanning(duel(), 'medium').handicap).toEqual(NO_HANDICAP)
  })

  it('with no relief the dice fall exactly as they did before relief existed', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const fresh = createMatch(nodeConfig(7, 'medium'), ALL_RUNES, seed, 0)
      const planned = beginPlanning(fresh, 'medium', { ...NO_HANDICAP })
      // Reconstruct the turn by hand: fill the hand, then one AI decision — no extra roll.
      const [hand, afterFill] = fillHand(fresh.hand, fresh.deck, fresh.rng)
      const [move, afterPlan] = planEnemyMove({ ...fresh, hand, rng: afterFill }, fresh.config.enemies[0]!, afterFill, 'medium')
      expect(planned.rng).toBe(afterPlan)
      expect(planned.enemyMoves).toEqual(move ? [move] : [])
      expect(planned.hand).toEqual(hand)
    }
  })

  it('a skip chance of 1 leaves the enemy without a move', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const s = beginPlanning(createMatch(nodeConfig(7, 'medium'), ALL_RUNES, seed, 0), 'medium', { ...NO_HANDICAP, skipChance: 1 })
      expect(s.enemyMoves).toEqual([])
      expect(s.phase).toBe('planning')
      expect(s.hand).toHaveLength(HAND_SIZE)
    }
  })

  it('a skip chance of 0 never rolls; a fractional one skips about that often', () => {
    let skipped = 0
    for (let seed = 1; seed <= 60; seed++) {
      const s = beginPlanning(createMatch(nodeConfig(7, 'medium'), ALL_RUNES, seed, 0), 'medium', { ...NO_HANDICAP, skipChance: 0.5 })
      if (s.enemyMoves.length === 0) skipped++
    }
    expect(skipped).toBeGreaterThan(15)
    expect(skipped).toBeLessThan(45)
  })

  it('a skipped siege faction still spends its place in the rotation', () => {
    let s = createMatch(nodeConfig(8, 'medium'), ALL_RUNES, 3, 0)
    s = beginPlanning(s, 'medium', { ...NO_HANDICAP, skipChance: 1 })
    expect(s.enemyMoves).toEqual([])
    expect(s.enemyTurnIndex).toBe(1)
    s = nextTurn(resolveCurrentTurn(commitPlayerMove(s, null)).state, 0, 'medium')
    expect(s.enemyMoves[0]?.faction).toBe('orc')
  })

  it('scales every enemy hit by atkMul when the turn resolves — the node\'s own dummies stay harmless', () => {
    // An enemy sword facing the player's cross (no mitigation): 2 → 1 at 0.65. The faction itself
    // stays passive so the preset sword is the only thing that swings.
    const config = testConfig({
      enemies: [{ faction: 'goblin', post: 'top', deck: ['melee'], ai: 'passive', atkMul: 1 }],
      presets: [p('enemy', 'melee', 1, 1, 'down'), p('player', 'support', 1, 2, 'omni')]
    })
    const full = resolveCurrentTurn(commitPlayerMove(beginPlanning(createMatch(config, ALL_RUNES, 1, 0), 'medium'), null))
    const soft = resolveCurrentTurn(commitPlayerMove(beginPlanning(createMatch(config, ALL_RUNES, 1, 0), 'medium', { ...NO_HANDICAP, atkMul: 0.65 }), null))
    const hp = (r: { state: MatchState }) => r.state.board.runes[2]!.hp
    expect(hp(full)).toBe(1)
    expect(hp(soft)).toBe(2)
    // A training dummy multiplied by relief is still a dummy.
    const dummy = testConfig({
      enemies: [{ faction: 'goblin', post: 'top', deck: ['melee'], ai: 'passive', atkMul: 0 }],
      presets: [p('enemy', 'melee', 1, 1, 'down'), p('player', 'support', 1, 2, 'omni')]
    })
    const harmless = resolveCurrentTurn(commitPlayerMove(beginPlanning(createMatch(dummy, ALL_RUNES, 1, 0), 'medium', { ...NO_HANDICAP, atkMul: 0.65 }), null))
    expect(hp(harmless)).toBe(3)
  })

  it('extra randomness reaches the AI', () => {
    // 1-7's goblins on 'hard' play their best move on every seed; with 0.9 extra they mostly do not.
    const best = new Map<number, string>()
    for (let seed = 1; seed <= 30; seed++) {
      const s = beginPlanning(createMatch(nodeConfig(7, 'hard'), ALL_RUNES, seed, 0), 'hard', { ...NO_HANDICAP, extraRandom: 0 })
      best.set(seed, JSON.stringify(s.enemyMoves))
    }
    let differs = 0
    for (let seed = 1; seed <= 30; seed++) {
      const s = beginPlanning(createMatch(nodeConfig(7, 'hard'), ALL_RUNES, seed, 0), 'hard', { ...NO_HANDICAP, extraRandom: 0.9 })
      if (JSON.stringify(s.enemyMoves) !== best.get(seed)) differs++
    }
    expect(differs).toBeGreaterThan(10)
  })

  it('nextTurn carries the relief for the turn about to begin', () => {
    let s = beginPlanning(duel(), 'medium')
    s = nextTurn(resolveCurrentTurn(commitPlayerMove(s, null)).state, 0, 'medium', { ...NO_HANDICAP, skipChance: 1, timerMs: 8000 })
    expect(s.turn).toBe(2)
    expect(s.enemyMoves).toEqual([])
    expect(s.handicap.timerMs).toBe(8000)
  })
})

describe('re-aiming the locked move', () => {
  const locked = (type: Move['type'], dir: Move['dir']) => {
    let s = beginPlanning(createMatch(testConfig({ playerDeck: [type] }), [...ALL], 4, 0), 'medium')
    s = commitPlayerMove(s, playerMove(type, 1, 2, dir))
    expect(s.phase).toBe('reveal')
    return s
  }

  it('turns a sword or a bow to any of its four facings while the move is locked', () => {
    const s = locked('melee', 'up')
    expect(canReaim(s, 'left')).toBe(true)
    const turned = reaimPlayerMove(s, 'left')
    expect(turned.playerMove).toMatchObject({ type: 'melee', col: 1, row: 2, dir: 'left' })
    expect(turned).not.toBe(s)
    expect(s.playerMove!.dir).toBe('up') // pure
    expect(reaimPlayerMove(turned, 'down').playerMove!.dir).toBe('down')
  })

  it('refuses a facing the rune cannot take', () => {
    const sword = locked('melee', 'up')
    expect(canReaim(sword, 'ul')).toBe(false)
    expect(reaimPlayerMove(sword, 'ul')).toBe(sword)
    const orb = locked('mage', 'ur')
    expect(canReaim(orb, 'up')).toBe(false)
    expect(reaimPlayerMove(orb, 'dl').playerMove!.dir).toBe('dl')
  })

  it('an omni rune has nothing to correct', () => {
    const shield = locked('defense', 'omni')
    expect(canReaim(shield, 'omni')).toBe(false)
    expect(canReaim(shield, 'up')).toBe(false)
    expect(reaimPlayerMove(shield, 'up')).toBe(shield)
  })

  it('only while the move is locked: not before, not once the board has resolved', () => {
    const planning = beginPlanning(createMatch(testConfig({ playerDeck: ['melee'] }), [...ALL], 4, 0), 'medium')
    expect(canReaim(planning, 'left')).toBe(false)
    const resolved = resolveCurrentTurn(locked('melee', 'up')).state
    expect(resolved.phase).toBe('resolve')
    expect(canReaim(resolved, 'left')).toBe(false)
    expect(reaimPlayerMove(resolved, 'left')).toBe(resolved)
    const passed = commitPlayerMove(planning, null)
    expect(canReaim(passed, 'left')).toBe(false)
  })
})

describe('power-rune boons', () => {
  const dueling = () => nodeConfig(7, 'medium')

  it('the first placement of a boosted type lands at the boon\'s level with its stats, and the boon is spent', () => {
    const config = dueling()
    let s = beginPlanning(createMatch(config, ['melee', 'archer'], 3, 0, { melee: 3 }), 'medium')
    expect(s.boons).toEqual({ melee: 3 })
    const slot = s.hand.indexOf('melee')
    expect(slot).toBeGreaterThanOrEqual(0)
    s = commitPlayerMove(s, playerMove('melee', 2, 3, 'up'))
    expect(s.playerMove?.level).toBe(3)
    expect(s.boons).toEqual({})
    const { state } = resolveCurrentTurn(s)
    const mine = runesOf(state.board, 'player').find((r) => r.col === 2 && r.row === 3)!
    expect(mine).toMatchObject({ type: 'melee', level: 3, hp: statsFor('melee', 3).hp, maxHp: statsFor('melee', 3).hp })
  })

  it('a second placement of the same type is an ordinary Lv 1; other types are untouched', () => {
    const config = dueling()
    let s = beginPlanning(createMatch(config, ['melee', 'archer'], 3, 0, { melee: 3 }), 'medium')
    s = commitPlayerMove(s, playerMove('melee', 2, 3, 'up'))
    s = nextTurn(resolveCurrentTurn(s).state, 0, 'medium')
    // Reroll until the hand holds another sword (the deck is two types, so it never takes long).
    for (let guard = 0; !s.hand.includes('melee') && guard < 4; guard++) s = rerollHand(s)
    if (s.hand.includes('melee')) {
      s = commitPlayerMove(s, playerMove('melee', 3, 3, 'up'))
      expect(s.playerMove?.level).toBeUndefined()
      const { state } = resolveCurrentTurn(s)
      expect(runesOf(state.board, 'player').find((r) => r.col === 3 && r.row === 3)?.level).toBe(1)
    }
    const t = beginPlanning(createMatch(config, ['melee', 'archer'], 3, 0, { melee: 3 }), 'medium')
    const bow = commitPlayerMove(t, playerMove('archer', 1, 3, 'up'))
    expect(bow.playerMove?.level).toBeUndefined()
    expect(bow.boons).toEqual({ melee: 3 })
  })

  it('a boon never touches the enemy, and a match without boons rolls exactly the dice it always did', () => {
    const config = dueling()
    const plain = createMatch(config, ['melee', 'archer'], 5, 0)
    const boosted = createMatch(config, ['melee', 'archer'], 5, 0, { archer: 3 })
    expect(plain.boons).toEqual({})
    expect({ ...plain, boons: null }).toEqual({ ...boosted, boons: null })
    const a = beginPlanning(plain, 'medium')
    const b = beginPlanning(boosted, 'medium')
    expect(a.enemyMoves).toEqual(b.enemyMoves)
    expect(a.rng).toBe(b.rng)
    for (const m of b.enemyMoves) expect(m.level).toBeUndefined()
    // A stack ignores the level: the boon is spent but the merge is the usual one level up.
    let s = beginPlanning(createMatch(config, ['melee'], 8, 0, { melee: 3 }), 'medium')
    s = commitPlayerMove(s, playerMove('melee', 0, 3, 'up'))
    s = nextTurn(resolveCurrentTurn(s).state, 0, 'medium')
    expect(s.boons).toEqual({})
    s = commitPlayerMove(s, { ...playerMove('melee', 0, 3, 'up'), level: 5 })
    expect(s.playerMove?.level).toBeUndefined()
    const { state } = resolveCurrentTurn(s)
    expect(runesOf(state.board, 'player').find((r) => r.col === 0 && r.row === 3)?.level).toBe(4)
  })
})

describe('rune ranks in a match', () => {
  it('are copied onto the state, and a rank bought mid-match cannot change a board already standing', () => {
    const live = { melee: 2 }
    const s = createMatch(testConfig(), ALL, 1, 0, {}, live)
    expect(s.ranks).toEqual({ melee: 2 })
    // The shop is reachable from the result screen: mutating the table the
    // match was created from must not reach the match.
    live.melee = 5
    expect(s.ranks).toEqual({ melee: 2 })
    // Place whatever the hand actually drew, ranked at 2 across the roster.
    const ranked = createMatch(testConfig(), ALL, 1, 0, {}, Object.fromEntries(ALL.map((t) => [t, 2])))
    const planned = beginPlanning(ranked, 'medium')
    const type = planned.hand[0]!
    // The facing has to be legal for whatever was drawn: a shield is omni,
    // an orb diagonal, and an illegal facing is simply refused.
    const after = resolveCurrentTurn(commitPlayerMove(planned, playerMove(type, 1, 3, dirsFor(type)[0]!))).state
    const mine = runesOf(after.board, 'player').find((r) => r.type === type)!
    expect(mine.maxHp).toBe(statsFor(type, mine.level).hp + 2)
  })

  it('default to none, and a match with none is the match it always was', () => {
    const s = createMatch(testConfig(), ALL, 7, 0)
    expect(s.ranks).toEqual({})
    const withEmpty = createMatch(testConfig(), ALL, 7, 0, {}, {})
    expect(JSON.stringify(withEmpty)).toBe(JSON.stringify(s))
  })

  it('reach the runes the player places, never the enemy\'s', () => {
    const s = beginPlanning(
      createMatch(testConfig(), ALL, 3, 0, {}, Object.fromEntries(ALL.map((t) => [t, 3]))), 'medium'
    )
    const drawn = s.hand[0]!
    const after = resolveCurrentTurn(commitPlayerMove(s, playerMove(drawn, 1, 3, dirsFor(drawn)[0]!))).state
    for (const r of runesOf(after.board, 'player')) {
      expect(r.maxHp, r.type).toBe(statsFor(r.type, r.level).hp + 3)
    }
    for (const r of runesOf(after.board, 'enemy')) {
      expect(r.maxHp, r.type).toBe(statsFor(r.type, r.level).hp)
    }
  })
})
