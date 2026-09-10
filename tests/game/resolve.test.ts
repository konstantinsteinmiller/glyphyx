import { describe, expect, it } from 'vitest'
import {
  MAX_LEVEL, NUKE_DAMAGE, RESOLVE_TIMELINE, RESOLVE_MS, RUNE_TYPES, SHIELD_BLOCKS_PROJECTILES,
  dirsFor, statsFor, type BoardState, type Dir, type ResolveEvent, type RuneType
} from '@/game/rules'
import { resolveTurn } from '@/game/resolve'
import { countTiles, placementKind, runeAt } from '@/game/board'
import { boardWith, boardWithRanks, p, mv, fullPower, dummies, ranked, at, empty, ownerOf } from './helpers'

const kinds = (events: ResolveEvent[], kind: ResolveEvent['kind']) => events.filter((e) => e.kind === kind)
const shots = (events: ResolveEvent[]) => events.filter((e) => e.kind === 'shot') as Extract<ResolveEvent, { kind: 'shot' }>[]

describe('placements', () => {
  it('a placement stands a Lv 1 rune with full stats and claims the tile', () => {
    const { board, events } = resolveTurn(boardWith(), [mv('player', 'melee', 1, 2, 'up')], fullPower)
    const r = at(board, 1, 2)
    expect(r).toMatchObject({ type: 'melee', side: 'player', level: 1, hp: 3, maxHp: 3, dir: 'up', faction: null })
    expect(ownerOf(board, 1, 2)).toBe('player')
    expect(kinds(events, 'place')).toHaveLength(1)
    // The tile was neutral: the settle diff reports the claim.
    expect(kinds(events, 'capture')).toEqual([expect.objectContaining({ col: 1, row: 2, owner: 'player', prev: 'neutral' })])
  })

  it('stacking merges to Lv 2: the dropped pebble adds its own body (capped), attack doubles, the new swipe re-aims', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up'))
    at(b, 1, 2).hp = 2
    const { board, events } = resolveTurn(b, [mv('player', 'melee', 1, 2, 'left')], fullPower)
    const r = at(board, 1, 2)
    expect(r.level).toBe(2)
    // 2 + a Lv 1 sword's 3 — a wounded rune is healed by the stone stacked onto it.
    expect(r.hp).toBe(5)
    expect(r.maxHp).toBe(6)
    expect(r.dir).toBe('left')
    expect(kinds(events, 'merge')).toHaveLength(1)
    expect(kinds(events, 'place')).toHaveLength(0)
    expect(Object.keys(board.runes)).toHaveLength(1)
  })

  it('a full-HP stack lands exactly on the Lv 2 maximum', () => {
    const b = boardWith(p('player', 'archer', 0, 3, 'up'))
    const { board } = resolveTurn(b, [mv('player', 'archer', 0, 3, 'up')], fullPower)
    expect(at(board, 0, 3).hp).toBe(4)
  })

  it('an illegal placement is ignored, never applied', () => {
    const b = boardWith(p('enemy', 'melee', 1, 1, 'down'))
    const { board, events } = resolveTurn(b, [mv('player', 'archer', 1, 1, 'up')], fullPower)
    expect(at(board, 1, 1).side).toBe('enemy')
    expect(kinds(events, 'place')).toHaveLength(0)
  })
})

describe('clash', () => {
  it('the higher-HP rune survives with the other subtracted', () => {
    const { board, events } = resolveTurn(boardWith(), [mv('player', 'defense', 1, 1, 'omni'), mv('enemy', 'melee', 1, 1, 'down')], fullPower)
    const r = at(board, 1, 1)
    expect(r.type).toBe('defense')
    expect(r.side).toBe('player')
    expect(r.hp).toBe(6) // 9 − 3
    const clash = kinds(events, 'clash')[0] as Extract<ResolveEvent, { kind: 'clash' }>
    expect(clash.survivor?.type).toBe('defense')
    expect(clash.a.hp).toBe(9)
    expect(clash.b.hp).toBe(3)
    expect(kinds(events, 'shatter')).toHaveLength(1)
    expect(ownerOf(board, 1, 1)).toBe('player')
  })

  it('equal HP shatters both and leaves the tile neutral', () => {
    const b = boardWith()
    const { board, events } = resolveTurn(b, [mv('player', 'melee', 0, 3, 'up'), mv('enemy', 'melee', 0, 3, 'down')], fullPower)
    expect(empty(board, 0, 3)).toBe(true)
    expect(ownerOf(board, 0, 3)).toBe('neutral')
    const clash = kinds(events, 'clash')[0] as Extract<ResolveEvent, { kind: 'clash' }>
    expect(clash.survivor).toBeNull()
    expect(kinds(events, 'shatter')).toHaveLength(2)
    // A neutralised player base tile is reported as a capture.
    expect(kinds(events, 'capture')).toEqual([expect.objectContaining({ col: 0, row: 3, owner: 'neutral', prev: 'player' })])
  })
})

describe('melee', () => {
  it('hits the adjacent tile it faces and nothing else', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up'), p('enemy', 'melee', 1, 1, 'left'), p('enemy', 'archer', 2, 2, 'up'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 1).hp).toBe(1)      // 3 − 2
    expect(at(board, 2, 2).hp).toBe(2)      // untouched: the sword faces up
    const blade = shots(events).find((s) => s.from.side === 'player')!
    expect(blade.weapon).toBe('blade')
    expect(blade.path).toEqual([{ col: 1, row: 1 }])
    expect(blade.hits[0]).toMatchObject({ amount: 2, absorbed: 0, hpAfter: 1 })
  })

  it('a sword facing off the board fires at nothing', () => {
    const b = boardWith(p('player', 'melee', 0, 3, 'down'))
    const { events } = resolveTurn(b, [], fullPower)
    const blade = shots(events)[0]!
    expect(blade.path).toEqual([])
    expect(blade.hits).toEqual([])
  })

  it('Lv 2 knocks a surviving target back one tile when it is free', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up', { level: 2 }), p('enemy', 'defense', 1, 1, 'omni'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 1)).toBe(true)
    const pushed = at(board, 1, 0)
    expect(pushed.type).toBe('defense')
    expect(pushed.hp).toBe(6) // 9 − (4 − 1 mitigation)
    expect(kinds(events, 'knockback')[0]).toMatchObject({ from: { col: 1, row: 1 }, to: { col: 1, row: 0 } })
    expect(ownerOf(board, 1, 1)).toBe('neutral')
    expect(ownerOf(board, 1, 0)).toBe('enemy')
  })

  it('Lv 2 knockback is blocked by the edge and by an occupied tile', () => {
    const edge = boardWith(p('player', 'melee', 1, 1, 'up', { level: 2 }), p('enemy', 'defense', 1, 0, 'omni'))
    const e = resolveTurn(edge, [], fullPower)
    expect(at(e.board, 1, 0).type).toBe('defense')
    expect(kinds(e.events, 'knockback')).toHaveLength(0)

    const blocked = boardWith(
      p('player', 'melee', 1, 2, 'up', { level: 2 }), p('enemy', 'defense', 1, 1, 'omni'), p('enemy', 'support', 1, 0, 'omni')
    )
    const k = resolveTurn(blocked, [], fullPower)
    expect(at(k.board, 1, 1).type).toBe('defense')
    expect(kinds(k.events, 'knockback')).toHaveLength(0)
  })

  it('a dead target is never knocked back', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up', { level: 2 }), p('enemy', 'archer', 1, 1, 'left'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 1)).toBe(true)
    expect(empty(board, 1, 0)).toBe(true)
    expect(kinds(events, 'knockback')).toHaveLength(0)
    expect(kinds(events, 'shatter')).toHaveLength(1)
  })
})

describe('archer', () => {
  it('skips the first tile and strikes the second', () => {
    const b = boardWith(p('player', 'archer', 1, 3, 'up'), p('enemy', 'melee', 1, 2, 'left'), p('enemy', 'melee', 1, 1, 'left'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(3)
    expect(at(board, 1, 1).hp).toBe(1)
    const arrow = shots(events).find((s) => s.weapon === 'arrow')!
    expect(arrow.path).toEqual([{ col: 1, row: 2 }, { col: 1, row: 1 }])
    expect(arrow.hits).toHaveLength(1)
    expect(arrow.hits[0]!.target.row).toBe(1)
  })

  it('Lv 2 fires a volley at the second AND third tiles', () => {
    const b = boardWith(
      p('player', 'archer', 1, 3, 'up', { level: 2 }),
      p('enemy', 'melee', 1, 1, 'left'), p('enemy', 'melee', 1, 0, 'left')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 1)).toBe(true) // 3 hp − 4
    expect(empty(board, 1, 0)).toBe(true)
    const arrow = shots(events).find((s) => s.weapon === 'arrow')!
    expect(arrow.path).toHaveLength(3)
    expect(arrow.hits).toHaveLength(2)
  })

  it('an arrow that leaves the board hits nothing', () => {
    const b = boardWith(p('player', 'archer', 1, 1, 'up'), p('enemy', 'melee', 1, 0, 'left'))
    const { board } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 0).hp).toBe(3) // the first tile is skipped, the second is off the board
  })
})

describe('mage', () => {
  it('beams two diagonal tiles and damages every enemy on the path', () => {
    const b = boardWith(p('player', 'mage', 0, 3, 'ur'), p('enemy', 'melee', 1, 2, 'left'), p('enemy', 'archer', 2, 1, 'left'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 2)).toBe(true) // 3 − 3
    expect(empty(board, 2, 1)).toBe(true) // 2 − 3
    const beam = shots(events).find((s) => s.weapon === 'beam')!
    expect(beam.path).toEqual([{ col: 1, row: 2 }, { col: 2, row: 1 }])
    expect(beam.hits).toHaveLength(2)
    expect(kinds(events, 'explode')).toHaveLength(0)
  })

  it('clips the beam at the edge', () => {
    const b = boardWith(p('player', 'mage', 2, 1, 'ur'))
    const { events } = resolveTurn(b, [], fullPower)
    expect(shots(events)[0]!.path).toEqual([{ col: 3, row: 0 }])
  })

  it('never hurts friendlies on the path', () => {
    const b = boardWith(p('player', 'mage', 0, 3, 'ur'), p('player', 'melee', 1, 2, 'up'))
    const { board } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(3)
  })

  it('Lv 2 explodes in a cross at the beam end; an enemy on the end tile takes both', () => {
    const b = boardWith(
      p('player', 'mage', 0, 3, 'ur', { level: 2 }),
      p('enemy', 'defense', 2, 1, 'omni', { level: 2 }), // end tile: 18 hp
      p('enemy', 'melee', 2, 0, 'down'),                // above the end: in the cross
      p('enemy', 'melee', 3, 1, 'down'),                // right of the end: in the cross
      p('enemy', 'melee', 3, 0, 'down')                 // diagonal from the end: NOT in the cross
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    // 18 − (5 − 1) beam − (5 − 1) explosion = 10
    expect(at(board, 2, 1).hp).toBe(10)
    expect(empty(board, 2, 0)).toBe(true)
    expect(empty(board, 3, 1)).toBe(true)
    expect(at(board, 3, 0).hp).toBe(3)
    const boom = kinds(events, 'explode')[0] as Extract<ResolveEvent, { kind: 'explode' }>
    expect(boom.center).toEqual({ col: 2, row: 1 })
    expect(boom.cells).toHaveLength(5)
    expect(boom.hits).toHaveLength(3)
  })

  it('a Lv 2 mage facing the void neither beams nor explodes', () => {
    const b = boardWith(p('player', 'mage', 3, 0, 'ur', { level: 2 }))
    const { events } = resolveTurn(b, [], fullPower)
    expect(shots(events)[0]!.path).toEqual([])
    expect(kinds(events, 'explode')).toHaveLength(0)
  })
})

describe('cleave', () => {
  it('fans across the three tiles ahead in one swing', () => {
    const b = boardWith(
      p('player', 'cleave', 1, 2, 'up'),
      p('enemy', 'melee', 0, 1, 'up'), p('enemy', 'archer', 1, 1, 'up'), p('enemy', 'melee', 2, 1, 'up')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 0, 1).hp).toBe(1)      // 3 − 2, the same damage a sword deals
    expect(empty(board, 1, 1)).toBe(true)   // the 2-HP bow breaks
    expect(at(board, 2, 1).hp).toBe(1)
    const swing = shots(events).find((s) => s.weapon === 'cleave')!
    expect(swing.path).toEqual([{ col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }])
    expect(swing.hits).toHaveLength(3)
  })

  it('swung along the edge the arc is clipped, and friendlies inside it are never touched', () => {
    const b = boardWith(
      p('player', 'cleave', 0, 2, 'up'),
      p('enemy', 'melee', 0, 1, 'up'),
      p('player', 'support', 1, 1, 'omni')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 0, 1).hp).toBe(1)
    expect(at(board, 1, 1).hp).toBe(3)      // your own cross, standing in the arc, unharmed
    const swing = shots(events).find((s) => s.weapon === 'cleave')!
    // The off-board horn is dropped, not clamped onto a neighbour.
    expect(swing.path).toEqual([{ col: 0, row: 1 }, { col: 1, row: 1 }])
    expect(swing.hits).toHaveLength(1)
  })

  it('the whole arc is drawn whether or not anything stood in it', () => {
    const b = boardWith(p('player', 'cleave', 1, 2, 'up'))
    const { events } = resolveTurn(b, [], fullPower)
    const swing = shots(events)[0]!
    expect(swing.path).toHaveLength(3)
    expect(swing.hits).toEqual([])
  })

  it('never knocks back, at any level', () => {
    const b = boardWith(p('player', 'cleave', 1, 2, 'up', { level: 2 }), p('enemy', 'defense', 1, 1, 'omni'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 1).hp).toBe(6)      // 9 − (4 − 1 mitigation): it held its tile
    expect(kinds(events, 'knockback')).toHaveLength(0)
  })
})

describe('roller', () => {
  it('rolls on through what it breaks and stops on the first rune that holds', () => {
    const b = boardWith(
      p('player', 'roller', 1, 3, 'up'),
      p('enemy', 'archer', 1, 2, 'left'), p('enemy', 'melee', 1, 1, 'left'), p('enemy', 'melee', 1, 0, 'left')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 2)).toBe(true)   // broken — the boulder rolls over it
    expect(at(board, 1, 1).hp).toBe(1)      // 3 − 2: it held, so the roll ends here
    expect(at(board, 1, 0).hp).toBe(3)      // never reached
    const roll = shots(events).find((s) => s.weapon === 'roll')!
    expect(roll.path).toEqual([{ col: 1, row: 2 }, { col: 1, row: 1 }])
    expect(roll.hits).toHaveLength(2)
  })

  it('runs the lane to the edge when nothing is standing in it', () => {
    const b = boardWith(p('player', 'roller', 1, 3, 'up'))
    const { events } = resolveTurn(b, [], fullPower)
    const roll = shots(events)[0]!
    expect(roll.path).toEqual([{ col: 1, row: 2 }, { col: 1, row: 1 }, { col: 1, row: 0 }])
    expect(roll.hits).toEqual([])
  })

  it('flattens FRIENDLIES in the lane, and the loss scores for the other side', () => {
    const b = boardWith(
      p('player', 'roller', 1, 3, 'up'),
      p('player', 'archer', 1, 2, 'left'),
      p('enemy', 'melee', 1, 1, 'left')
    )
    const { board, events, enemyKills } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 2)).toBe(true)   // your own bow, broken by your own boulder
    expect(at(board, 1, 1).hp).toBe(1)      // and the enemy behind it stops the roll
    expect(enemyKills).toBe(1)              // a player rune shattered: scored against you
    const roll = shots(events).find((s) => s.weapon === 'roll')!
    expect(roll.hits.map((h) => h.target.side)).toEqual(['player', 'enemy'])
  })

  it('a Lv 2 ploughs through exactly one survivor before it comes to rest', () => {
    const b = boardWith(
      p('player', 'roller', 1, 3, 'up', { level: 2 }),
      p('enemy', 'defense', 1, 2, 'omni'), p('enemy', 'defense', 1, 1, 'omni'), p('enemy', 'melee', 1, 0, 'left')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(6)      // 9 − (4 − 1): held, and ploughed through
    expect(at(board, 1, 1).hp).toBe(6)      // held too — this one stops the boulder
    expect(at(board, 1, 0).hp).toBe(3)      // never reached
    const roll = shots(events).find((s) => s.weapon === 'roll')!
    expect(roll.path).toEqual([{ col: 1, row: 2 }, { col: 1, row: 1 }])
  })
})

describe('bombard', () => {
  it('shells the three side-by-side tiles three ranks ahead', () => {
    const b = boardWith(
      p('player', 'bombard', 1, 3, 'up'),
      p('enemy', 'melee', 0, 0, 'down'), p('enemy', 'archer', 1, 0, 'down'),
      p('enemy', 'melee', 2, 0, 'down'), p('enemy', 'melee', 3, 0, 'down')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 0, 0).hp).toBe(1)      // 3 − 2
    expect(empty(board, 1, 0)).toBe(true)
    expect(at(board, 2, 0).hp).toBe(1)
    expect(at(board, 3, 0).hp).toBe(3)      // one column outside the footprint
    const shell = shots(events).find((s) => s.weapon === 'shell')!
    expect(shell.path).toEqual([{ col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }])
    expect(shell.hits).toHaveLength(3)
  })

  it('a Lv 2 drops a second shell on the middle rank, dead ahead', () => {
    const b = boardWith(
      p('player', 'bombard', 1, 3, 'up', { level: 2 }),
      p('enemy', 'melee', 1, 1, 'down'), p('enemy', 'melee', 1, 0, 'down')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 1)).toBe(true)   // 3 − 4: the extra shell breaks it
    expect(empty(board, 1, 0)).toBe(true)
    const shell = shots(events).find((s) => s.weapon === 'shell')!
    expect(shell.path[0]).toEqual({ col: 1, row: 1 })  // the near shell first
    expect(shell.path).toHaveLength(4)
  })

  it('is LOBBED: a shield in the way neither stops it nor is touched by it', () => {
    const b = boardWith(
      p('player', 'bombard', 1, 3, 'up'),
      p('enemy', 'defense', 1, 2, 'omni'), p('enemy', 'defense', 1, 1, 'omni'), p('enemy', 'melee', 1, 0, 'left')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    // Two enemy walls stand between the tube and the impact. An arrow or a
    // beam would have died on the first; the shell flies over both.
    expect(at(board, 1, 2).hp).toBe(9)
    expect(at(board, 1, 1).hp).toBe(9)
    expect(at(board, 1, 0).hp).toBe(1)      // 3 − 2, landed regardless
    const shell = shots(events).find((s) => s.weapon === 'shell')!
    expect(shell.hits).toHaveLength(1)
  })

  it('with no legal footprint it fires into nothing — an event, an empty path, no hits', () => {
    const b = boardWith(
      p('player', 'bombard', 1, 2, 'up'),
      p('enemy', 'melee', 1, 1, 'left'), p('enemy', 'melee', 1, 0, 'left')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 1).hp).toBe(3)      // nothing near the tube is ever in danger
    expect(at(board, 1, 0).hp).toBe(3)
    const shell = shots(events).find((s) => s.weapon === 'shell')!
    expect(shell.path).toEqual([])
    expect(shell.hits).toEqual([])
  })
})

describe('defense and support', () => {
  it('a defense rune mitigates 1 from every hit', () => {
    const b = boardWith(p('player', 'defense', 1, 2, 'omni'), p('enemy', 'melee', 1, 1, 'down'), p('enemy', 'archer', 1, 0, 'down'))
    const { board, events } = resolveTurn(b, [], fullPower)
    // arrow skips (1,1) and hits (1,2): 2 − 1; blade: 2 − 1 → 9 − 1 − 1 = 7
    expect(at(board, 1, 2).hp).toBe(7)
    for (const s of shots(events)) for (const h of s.hits) expect(h.absorbed).toBe(1)
  })

  it('a Lv 2 defense shields its neighbours for one round, and the shield absorbs before HP', () => {
    // The shield stands BESIDE the sword, off the arrow's line: an arrow that
    // flew over an enemy shield would be intercepted by it (see "the shield is a wall").
    const b = boardWith(
      p('player', 'defense', 0, 3, 'omni', { level: 2 }), p('player', 'melee', 1, 3, 'up'),
      p('enemy', 'archer', 1, 1, 'down') // skips (1,2), hits the sword at (1,3)
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    const aura = kinds(events, 'aura')[0] as Extract<ResolveEvent, { kind: 'aura' }>
    expect(aura.to.map((r) => r.id)).toEqual([at(b, 1, 3).id])
    const sword = at(board, 1, 3)
    expect(sword.hp).toBe(2) // 3 − (2 − 1 shield)
    expect(sword.shield).toBe(0)
    const arrow = shots(events).find((s) => s.weapon === 'arrow')!
    expect(arrow.hits[0]).toMatchObject({ amount: 1, absorbed: 1, hpAfter: 2 })
  })

  it('the aura is rebuilt every resolution, never stacked across turns', () => {
    const b = boardWith(p('player', 'defense', 1, 2, 'omni', { level: 2 }), p('player', 'melee', 1, 3, 'up'))
    const once = resolveTurn(b, [], fullPower).board
    const twice = resolveTurn(once, [], fullPower).board
    expect(at(twice, 1, 3).shield).toBe(1)
  })

  it('a support heals damaged neighbours, capped at max HP, and emits nothing at full', () => {
    const b = boardWith(p('player', 'support', 1, 2, 'omni'), p('player', 'melee', 1, 3, 'up'), p('player', 'archer', 0, 2, 'up'))
    at(b, 1, 3).hp = 1
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 3).hp).toBe(2)
    expect(at(board, 0, 2).hp).toBe(2)
    expect(kinds(events, 'heal')).toHaveLength(1)
    expect(kinds(events, 'buff')).toHaveLength(0)
  })

  it('a Lv 2 support heals 2 and lends +1 attack for the round', () => {
    const b = boardWith(p('player', 'support', 1, 2, 'omni', { level: 2 }), p('player', 'melee', 1, 3, 'up'), p('enemy', 'defense', 1, 1, 'omni'))
    at(b, 1, 3).hp = 1
    // The buffed sword at (1,3) faces up into… the support at (1,2). Aim it at nothing to isolate the heal,
    // then check the bonus on a sword that actually hits.
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 3).hp).toBe(3)
    expect(kinds(events, 'buff')).toHaveLength(1)

    const b2 = boardWith(p('player', 'support', 0, 2, 'omni', { level: 2 }), p('player', 'melee', 1, 2, 'up'), p('enemy', 'defense', 1, 1, 'omni'))
    const r2 = resolveTurn(b2, [], fullPower)
    // (2 + 1 bonus) − 1 mitigation = 2 → 9 − 2
    expect(at(r2.board, 1, 1).hp).toBe(7)
    expect(at(r2.board, 1, 2).atkBonus).toBe(1)
  })

  it('heals land BEFORE the ranged step, so a healed rune survives a hit it would have died to', () => {
    const b = boardWith(p('player', 'support', 0, 2, 'omni'), p('player', 'melee', 1, 2, 'left'), p('enemy', 'archer', 1, 0, 'down'))
    at(b, 1, 2).hp = 2 // healed to 3, then the arrow (skipping (1,1)) lands 2 → 1
    const { board } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(1)
  })
})

describe('the shield is a wall', () => {
  /** Resolve the same standing board `n` times with nobody placing. */
  const stand = (b: BoardState, n: number): BoardState => {
    let board = b
    for (let i = 0; i < n; i++) board = resolveTurn(board, [], fullPower).board
    return board
  }

  it('is switched on', () => {
    expect(SHIELD_BLOCKS_PROJECTILES).toBe(true)
  })

  it('a beam stops at the first enemy shield; nothing behind it is touched', () => {
    const b = boardWith(p('player', 'mage', 0, 3, 'ur'), p('enemy', 'defense', 1, 2, 'omni'), p('enemy', 'archer', 2, 1, 'left'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(7)  // 9 − (3 − 1 mitigation)
    expect(at(board, 2, 1).hp).toBe(2)  // untouched behind the wall
    const beam = shots(events).find((s) => s.weapon === 'beam')!
    expect(beam.path).toEqual([{ col: 1, row: 2 }]) // cut at the wall, so the renderer stops the beam there
    expect(beam.hits).toHaveLength(1)
    expect(beam.hits[0]!.target.type).toBe('defense')
  })

  it('a Lv 2 orb blocked on its first tile bursts its cross around the shield, not the beam end', () => {
    const b = boardWith(
      p('player', 'mage', 0, 3, 'ur', { level: 2 }),
      p('enemy', 'defense', 1, 2, 'omni'),   // the wall, on the first diagonal tile
      p('enemy', 'melee', 1, 1, 'down'),     // above the wall: in its cross
      p('enemy', 'archer', 2, 1, 'left')     // the old beam end: behind the wall, out of the cross
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(1)      // 9 − 4 beam − 4 cross
    expect(empty(board, 1, 1)).toBe(true)   // 3 − 5
    expect(at(board, 2, 1).hp).toBe(2)      // untouched
    const boom = kinds(events, 'explode')[0] as Extract<ResolveEvent, { kind: 'explode' }>
    expect(boom.center).toEqual({ col: 1, row: 2 })
  })

  it('an arrow is intercepted by an enemy shield on the tile it would skip', () => {
    const b = boardWith(p('player', 'archer', 1, 3, 'up'), p('enemy', 'defense', 1, 2, 'omni'), p('enemy', 'melee', 1, 1, 'left'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 2).hp).toBe(8)  // the shield took the arrow: 9 − (2 − 1)
    expect(at(board, 1, 1).hp).toBe(3)  // the intended target took nothing
    const arrow = shots(events).find((s) => s.weapon === 'arrow')!
    expect(arrow.path).toEqual([{ col: 1, row: 2 }])
    expect(arrow.hits).toHaveLength(1)
    expect(arrow.hits[0]!.target.type).toBe('defense')
  })

  it('a Lv 2 volley ends at a shield on its second tile; the third is untouched', () => {
    const b = boardWith(
      p('player', 'archer', 1, 3, 'up', { level: 2 }), p('enemy', 'defense', 1, 1, 'omni'), p('enemy', 'melee', 1, 0, 'left')
    )
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 1).hp).toBe(6)  // 9 − (4 − 1)
    expect(at(board, 1, 0).hp).toBe(3)
    const arrow = shots(events).find((s) => s.weapon === 'arrow')!
    expect(arrow.path).toEqual([{ col: 1, row: 2 }, { col: 1, row: 1 }])
  })

  it('a friendly shield is never in the way of its own side\'s projectiles', () => {
    const over = boardWith(p('player', 'archer', 1, 3, 'up'), p('player', 'defense', 1, 2, 'omni'), p('enemy', 'melee', 1, 1, 'left'))
    const a = resolveTurn(over, [], fullPower)
    expect(at(a.board, 1, 1).hp).toBe(1)  // 3 − 2: the arrow flew over the friendly shield
    expect(at(a.board, 1, 2).hp).toBe(9)
    expect(shots(a.events).find((s) => s.weapon === 'arrow')!.path).toHaveLength(2)

    const through = boardWith(p('player', 'mage', 0, 3, 'ur'), p('player', 'defense', 1, 2, 'omni'), p('enemy', 'archer', 2, 1, 'left'))
    const m = resolveTurn(through, [], fullPower)
    expect(empty(m.board, 2, 1)).toBe(true) // 2 − 3: the beam passed the friendly shield
    expect(shots(m.events).find((s) => s.weapon === 'beam')!.path).toHaveLength(2)
  })

  it('a blade is unaffected: it strikes the shield it faces, as ever', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up'), p('enemy', 'defense', 1, 1, 'omni'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 1).hp).toBe(8) // 9 − (2 − 1)
    expect(shots(events)[0]!.path).toEqual([{ col: 1, row: 1 }])
  })

  it('a Lv 1 shield stands through four Lv 1 hits from a sword, a bow and an orb', () => {
    const sword = boardWith(p('player', 'defense', 1, 2, 'omni'), p('enemy', 'melee', 1, 1, 'down'))
    expect(at(stand(sword, 4), 1, 2).hp).toBe(5)  // 9 − 4 × (2 − 1)
    const bow = boardWith(p('player', 'defense', 1, 2, 'omni'), p('enemy', 'archer', 1, 0, 'down'))
    expect(at(stand(bow, 4), 1, 2).hp).toBe(5)    // the arrow skips (1,1) and strikes the shield
    const orb = boardWith(p('player', 'defense', 1, 2, 'omni'), p('enemy', 'mage', 0, 1, 'dr'))
    expect(at(stand(orb, 4), 1, 2).hp).toBe(1)    // 9 − 4 × (3 − 1)
    // …and the fifth orb hit shatters it.
    expect(empty(stand(orb, 5), 1, 2)).toBe(true)
  })

  it('a Lv 2 shield stands through eight orb hits and falls on the ninth', () => {
    const orb = boardWith(p('player', 'defense', 1, 2, 'omni', { level: 2 }), p('enemy', 'mage', 0, 1, 'dr'))
    expect(at(stand(orb, 8), 1, 2).hp).toBe(2)    // 18 − 8 × 2
    expect(empty(stand(orb, 9), 1, 2)).toBe(true)
  })
})

describe('simultaneity and priority', () => {
  it('two archers shooting each other both fire and both shatter', () => {
    const b = boardWith(p('player', 'archer', 1, 3, 'up'), p('enemy', 'archer', 1, 1, 'down'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(Object.keys(board.runes)).toHaveLength(0)
    expect(shots(events)).toHaveLength(2)
    expect(kinds(events, 'shatter')).toHaveLength(2)
  })

  it('ranged resolves before melee: a sword killed by an arrow never swings', () => {
    const b = boardWith(p('enemy', 'archer', 1, 0, 'down'), p('player', 'melee', 1, 2, 'up'), p('enemy', 'melee', 1, 1, 'down'))
    // enemy arrow skips (1,1), hits the player's sword (3 − 2 = 1 → survives).
    // Make the sword weaker so it dies to the arrow:
    at(b, 1, 2).hp = 2
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(empty(board, 1, 2)).toBe(true)
    expect(at(board, 1, 1).hp).toBe(3) // the player's sword never got to swing
    expect(shots(events).filter((s) => s.weapon === 'blade' && s.from.side === 'player')).toHaveLength(0)
  })

  it('events are stamped inside the resolution window in step order', () => {
    const b = boardWith(
      p('player', 'defense', 0, 2, 'omni', { level: 2 }), p('player', 'support', 1, 3, 'omni'),
      p('player', 'archer', 0, 3, 'up'), p('player', 'melee', 1, 2, 'up'),
      p('enemy', 'melee', 1, 1, 'down'), p('enemy', 'archer', 0, 0, 'down')
    )
    at(b, 1, 2).hp = 1
    const { events } = resolveTurn(b, [mv('player', 'mage', 2, 2, 'ur')], fullPower)
    const order = ['place', 'aura', 'heal', 'shot', 'capture'] as const
    let last = -1
    for (const k of order) {
      const first = events.find((e) => e.kind === k)!
      expect(first.at).toBeGreaterThanOrEqual(last)
      last = first.at
    }
    for (const e of events) {
      expect(e.at).toBeGreaterThanOrEqual(0)
      expect(e.at).toBeLessThan(RESOLVE_MS)
      expect(e.dur).toBeGreaterThan(0)
    }
    const blades = shots(events).filter((s) => s.weapon === 'blade')
    for (const s of blades) expect(s.at).toBeGreaterThanOrEqual(RESOLVE_TIMELINE.melee.at)
    const arrows = shots(events).filter((s) => s.weapon !== 'blade')
    for (const s of arrows) expect(s.at).toBeLessThan(RESOLVE_TIMELINE.melee.at)
  })

  it('a scaled-down attack never rounds to nothing: the relief makes hits softer, not harmless', () => {
    const b = boardWith(p('enemy', 'melee', 1, 1, 'down'), p('player', 'defense', 1, 2, 'omni'))
    // 2 × 0.3 = 0.6 → would round to 1 anyway; 1 damage − 1 mitigation = 0 lands.
    const soft = resolveTurn(b, [], { enemyAtkMul: () => 0.3 })
    expect(shots(soft.events)[0]!.hits[0]).toMatchObject({ amount: 0, absorbed: 1 })
    // Against something without mitigation the floor shows: 2 × 0.3 → 1, never 0.
    const c = boardWith(p('enemy', 'melee', 1, 1, 'down'), p('player', 'support', 1, 2, 'omni'))
    const hit = resolveTurn(c, [], { enemyAtkMul: () => 0.3 })
    expect(shots(hit.events)[0]!.hits[0]!.amount).toBe(1)
  })

  it('a training dummy (atkMul 0) fires but never wounds', () => {
    const b = boardWith(p('enemy', 'melee', 1, 1, 'down'), p('player', 'archer', 1, 2, 'up'))
    const { board, events } = resolveTurn(b, [], dummies)
    expect(at(board, 1, 2).hp).toBe(2)
    const blade = shots(events).find((s) => s.weapon === 'blade')!
    expect(blade.path).toEqual([{ col: 1, row: 2 }])
    expect(blade.hits).toEqual([])
  })
})

describe('tile control', () => {
  it('a shattered rune neutralises its tile and the settle step reports it once', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up'), p('enemy', 'archer', 1, 1, 'left'))
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(ownerOf(board, 1, 1)).toBe('neutral')
    const captures = kinds(events, 'capture')
    expect(captures).toHaveLength(1)
    expect(captures[0]).toMatchObject({ col: 1, row: 1, owner: 'neutral', prev: 'enemy' })
    expect(kinds(events, 'place')).toHaveLength(0)
  })

  it('empty territory keeps its owner across a resolution', () => {
    const { board, events } = resolveTurn(boardWith(), [], fullPower)
    expect(countTiles(board, 'player')).toBe(4)
    expect(countTiles(board, 'enemy')).toBe(4)
    expect(kinds(events, 'capture')).toHaveLength(0)
  })

  it('placing on empty enemy territory takes it without a fight', () => {
    const { board, events } = resolveTurn(boardWith(), [mv('player', 'archer', 2, 0, 'up')], fullPower)
    expect(ownerOf(board, 2, 0)).toBe('player')
    expect(board.tiles[2]!.faction).toBeNull()
    expect(kinds(events, 'capture')[0]).toMatchObject({ col: 2, row: 0, owner: 'player', prev: 'enemy' })
  })

  it('counts kills per side and announces a combo at two or more', () => {
    const b = boardWith(
      p('player', 'mage', 0, 3, 'ur'), p('enemy', 'archer', 1, 2, 'left'), p('enemy', 'archer', 2, 1, 'left'),
      p('enemy', 'melee', 3, 3, 'left'), p('player', 'archer', 2, 3, 'up')
    )
    const out = resolveTurn(b, [], fullPower)
    expect(out.playerKills).toBe(2)
    expect(out.enemyKills).toBe(1) // the orc's sword at (3,3) kills the archer at (2,3)
    const combo = kinds(out.events, 'combo')[0] as Extract<ResolveEvent, { kind: 'combo' }>
    expect(combo).toMatchObject({ count: 2, side: 'player' })
  })

  it('never mutates the input board', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up'), p('enemy', 'archer', 1, 1, 'left'))
    const before = JSON.stringify(b)
    resolveTurn(b, [mv('player', 'archer', 0, 2, 'up')], fullPower)
    expect(JSON.stringify(b)).toBe(before)
    expect(runeAt(b, 1, 1)!.hp).toBe(2)
  })
})

describe('stacking beyond Lv 2', () => {
  const stackTo = (type: RuneType, level: number, dir: Dir = 'up') => {
    let b = boardWith(p('player', type, 1, 2, dir))
    for (let l = 2; l <= level; l++) b = resolveTurn(b, [mv('player', type, 1, 2, dir)], fullPower).board
    return b
  }

  it('climbs one level per pebble up to MAX_LEVEL, with the linear stats at every step', () => {
    for (const type of RUNE_TYPES) {
      let b = boardWith(p('player', type, 1, 2, dirsFor(type)[0]!))
      for (let level = 2; level <= MAX_LEVEL; level++) {
        const dir = dirsFor(type)[0]!
        const before = at(b, 1, 2)
        const { board, events } = resolveTurn(b, [mv('player', type, 1, 2, dir)], fullPower)
        const r = at(board, 1, 2)
        expect(r.level, `${type} → Lv ${level}`).toBe(level)
        expect(r.maxHp).toBe(statsFor(type, level).hp)
        // Full before, full after: every pebble is worth exactly one Lv 1 body.
        expect(r.hp).toBe(Math.min(statsFor(type, level).hp, before.hp + statsFor(type, 1).hp))
        expect(kinds(events, 'merge')).toHaveLength(1)
        expect(Object.keys(board.runes)).toHaveLength(1)
        b = board
      }
      expect(at(b, 1, 2).level).toBe(MAX_LEVEL)
    }
  })

  it('a Lv 8 sword is 24 HP / 16 attack and a Lv 8 orb 16 / 17', () => {
    expect(at(stackTo('melee', 8), 1, 2)).toMatchObject({ level: 8, hp: 24, maxHp: 24 })
    expect(statsFor('melee', 8)).toEqual({ hp: 24, atk: 16 })
    expect(statsFor('mage', 8)).toEqual({ hp: 16, atk: 17 })
  })

  it('a rune at the cap refuses another pebble: the placement is simply ignored', () => {
    const b = stackTo('melee', MAX_LEVEL)
    expect(placementKind(b, 'player', 'melee', 1, 2)).toBe('invalid')
    const { board, events } = resolveTurn(b, [mv('player', 'melee', 1, 2, 'up')], fullPower)
    expect(at(board, 1, 2).level).toBe(MAX_LEVEL)
    expect(kinds(events, 'merge')).toHaveLength(0)
    expect(kinds(events, 'place')).toHaveLength(0)
  })

  it('a Lv 3 bow fires at two tiles', () => {
    const b = boardWith(p('player', 'archer', 1, 3, 'up', { level: 3 }), p('enemy', 'melee', 1, 1, 'down'), p('enemy', 'melee', 1, 0, 'down'))
    const { events } = resolveTurn(b, [], dummies)
    const arrow = shots(events).find((s) => s.weapon === 'arrow')!
    expect(arrow.hits.map((h) => `${h.target.col},${h.target.row}`).sort()).toEqual(['1,0', '1,1'])
  })

  it('a Lv 3 orb bursts in a cross at the beam end', () => {
    const b = boardWith(p('player', 'mage', 0, 3, 'ur', { level: 3 }), p('enemy', 'melee', 2, 1, 'down'), p('enemy', 'melee', 3, 1, 'down'))
    const { events } = resolveTurn(b, [], dummies)
    expect(kinds(events, 'explode')).toHaveLength(1)
  })

  it('a Lv 3 sword knocks a surviving target back', () => {
    const b = boardWith(p('player', 'melee', 1, 2, 'up', { level: 3 }), p('enemy', 'defense', 1, 1, 'omni'))
    const { board, events } = resolveTurn(b, [], dummies)
    expect(kinds(events, 'knockback')).toHaveLength(1)
    expect(empty(board, 1, 1)).toBe(true)
    expect(at(board, 1, 0).type).toBe('defense')
  })

  it('a Lv 3 cross heals 3 and still lends the attack bonus', () => {
    const b = boardWith(p('player', 'support', 1, 2, 'omni', { level: 3 }), p('player', 'melee', 1, 3, 'up', { level: 3 }))
    at(b, 1, 3).hp = 2
    const { board, events } = resolveTurn(b, [], fullPower)
    expect(at(board, 1, 3).hp).toBe(5)
    expect(kinds(events, 'heal')).toEqual([expect.objectContaining({ amount: 3 })])
    expect(kinds(events, 'buff')).toHaveLength(1)
  })
})

describe('the crown', () => {
  /** The single crown event of a resolution. */
  const crownOf = (events: ResolveEvent[]) => {
    const list = events.filter((e) => e.kind === 'crown') as Extract<ResolveEvent, { kind: 'crown' }>[]
    expect(list).toHaveLength(1)
    return list[0]!
  }

  it('takes the Lv 1 rune it faces: same body, same hit points, new side', () => {
    const b = boardWith(p('enemy', 'melee', 1, 1, 'down'))
    at(b, 1, 1).hp = 2
    const { board, events } = resolveTurn(b, [mv('player', 'crown', 1, 2, 'up')], fullPower)
    const taken = at(board, 1, 1)
    expect(taken).toMatchObject({ type: 'melee', side: 'player', level: 1, hp: 2, faction: null })
    // It turns around: a stolen sword still pointing at your own line would be
    // a punishment for winning.
    expect(taken.dir).toBe('up')
    const ev = crownOf(events)
    expect(ev.was).toBe('enemy')
    expect(ev.turned).toMatchObject({ id: taken.id, side: 'player' })
    // The tile comes with it.
    expect(ownerOf(board, 1, 1)).toBe('player')
  })

  it('is spent doing it, and its going is nobody\'s kill', () => {
    const b = boardWith(p('enemy', 'archer', 2, 1, 'down'))
    const { board, events, playerKills, enemyKills } = resolveTurn(b, [mv('player', 'crown', 2, 2, 'up')], fullPower)
    // The crown is gone from the board and its tile with it…
    expect(empty(board, 2, 2)).toBe(true)
    expect(ownerOf(board, 2, 2)).toBe('neutral')
    expect(Object.values(board.runes).map((r) => r.type)).toEqual(['archer'])
    // …and it shattered, so the renderer has something to play.
    expect(kinds(events, 'shatter')).toHaveLength(1)
    // But nobody BROKE it. A self-spent rune counted as a kill would move the
    // combo counter, the coin payout and the adaptive relief, none of which
    // anybody earned.
    expect(playerKills).toBe(0)
    expect(enemyKills).toBe(0)
  })

  it('the stone it takes fights for its new owner on the very turn it changes hands', () => {
    // The whole reason to spend a rune taking one rather than breaking it: the
    // crown step runs before every attack, so the sword swings for the player
    // this resolution. Behind it, a 2-HP bow it now faces.
    const b = boardWith(p('enemy', 'melee', 1, 1, 'down'), p('enemy', 'archer', 1, 0, 'down', { hp: 2 }))
    const { board, events, playerKills } = resolveTurn(b, [mv('player', 'crown', 1, 2, 'up')], dummies)
    expect(at(board, 1, 1)).toMatchObject({ type: 'melee', side: 'player' })
    // The bow is gone, killed by the rune that was defending it a moment ago.
    expect(empty(board, 1, 0)).toBe(true)
    expect(playerKills).toBe(1)
    expect(kinds(events, 'crown')).toHaveLength(1)
  })

  it('cannot turn a stack: a Lv 1 crown facing a Lv 2 rune does nothing, and is not spent', () => {
    // A Lv 2 SHIELD, so nothing swings back — a Lv 2 sword would knock the
    // crown off its tile and the assertion below would be about the wrong rule.
    const b = boardWith(p('enemy', 'defense', 1, 1, 'omni', { level: 2 }))
    const { board, events } = resolveTurn(b, [mv('player', 'crown', 1, 2, 'up')], dummies)
    expect(at(board, 1, 1).side).toBe('enemy')
    expect(kinds(events, 'crown')).toHaveLength(0)
    // Nothing happened, so nothing was paid: the crown is still standing.
    expect(at(board, 1, 2)).toMatchObject({ type: 'crown', side: 'player', hp: 2 })
  })

  it('a Lv 2 crown takes a Lv 2 stack, which is the only way to have a tower off somebody', () => {
    const b = boardWith(p('player', 'crown', 1, 2, 'up'), p('enemy', 'melee', 1, 1, 'down', { level: 2 }))
    // Stacked in place, and it fires as it lands.
    const { board, events } = resolveTurn(b, [mv('player', 'crown', 1, 2, 'up')], dummies)
    expect(kinds(events, 'merge')).toHaveLength(1)
    const taken = at(board, 1, 1)
    expect(taken).toMatchObject({ type: 'melee', side: 'player', level: 2 })
    expect(crownOf(events).was).toBe('enemy')
    expect(empty(board, 1, 2)).toBe(true)
  })

  it('facing nothing, a friend, or the board\'s edge, it just stands there', () => {
    for (const [board0, where] of [
      [boardWith(), 'an empty tile'],
      [boardWith(p('player', 'melee', 1, 1, 'up')), 'a friendly rune']
    ] as const) {
      const { board, events } = resolveTurn(board0, [mv('player', 'crown', 1, 2, 'up')], dummies)
      expect(kinds(events, 'crown'), where).toHaveLength(0)
      expect(at(board, 1, 2), where).toMatchObject({ type: 'crown', side: 'player' })
    }
    // Off the board: the top rank, facing up.
    const { board, events } = resolveTurn(boardWith(), [mv('player', 'crown', 1, 0, 'up')], dummies)
    expect(kinds(events, 'crown')).toHaveLength(0)
    expect(at(board, 1, 0).type).toBe('crown')
  })

  it('takes what it faces and nothing else: the neighbours are not touched', () => {
    const b = boardWith(
      p('enemy', 'melee', 1, 1, 'down'),
      p('enemy', 'melee', 0, 2, 'down'),
      p('enemy', 'melee', 2, 2, 'down'),
      p('enemy', 'melee', 1, 3, 'down')
    )
    const { board } = resolveTurn(b, [mv('player', 'crown', 1, 2, 'up')], dummies)
    expect(at(board, 1, 1).side).toBe('player')
    for (const [c, r] of [[0, 2], [2, 2], [1, 3]] as const) expect(at(board, c, r).side, `${c},${r}`).toBe('enemy')
  })

  it('an enemy crown works exactly the same way: the rule has no favourite side', () => {
    // No shipped faction deck holds one (see `campaign.test.ts`), but the rule
    // is written side-agnostic and is asserted that way rather than left for
    // whoever changes that to discover.
    const b = boardWith(p('player', 'melee', 1, 2, 'up'))
    const { board, events } = resolveTurn(b, [mv('enemy', 'crown', 1, 1, 'down')], dummies)
    const taken = at(board, 1, 2)
    expect(taken).toMatchObject({ type: 'melee', side: 'enemy', faction: 'goblin', dir: 'down' })
    expect(crownOf(events).was).toBe('player')
    expect(ownerOf(board, 1, 2)).toBe('enemy')
  })

  it('drops the shield and the attack buff the old side had put on the stone', () => {
    // Both are rebuilt from zero every resolution anyway; what this pins is
    // that nothing carried IN on the rune survives the change of hands.
    const b = boardWith(p('enemy', 'melee', 1, 1, 'down'))
    at(b, 1, 1).shield = 3
    at(b, 1, 1).atkBonus = 2
    const { board } = resolveTurn(b, [mv('player', 'crown', 1, 2, 'up')], dummies)
    expect(at(board, 1, 1)).toMatchObject({ side: 'player', shield: 0, atkBonus: 0 })
  })

  it('fires on the placement only: a crown left standing never takes anything later', () => {
    // Turn one: it lands facing an empty tile and stays.
    const first = resolveTurn(boardWith(), [mv('player', 'crown', 1, 2, 'up')], dummies)
    expect(at(first.board, 1, 2).type).toBe('crown')
    // Turn two: an enemy walks into the tile it faces. The crown is inert.
    const second = resolveTurn(first.board, [mv('enemy', 'melee', 1, 1, 'down')], dummies)
    expect(kinds(second.events, 'crown')).toHaveLength(0)
    expect(at(second.board, 1, 1).side).toBe('enemy')
    expect(at(second.board, 1, 2).type).toBe('crown')
  })
})

describe('the nuke', () => {
  /** The single nuke event of a resolution. */
  const nukeOf = (events: ResolveEvent[]) => {
    const list = events.filter((e) => e.kind === 'nuke') as Extract<ResolveEvent, { kind: 'nuke' }>[]
    expect(list).toHaveLength(1)
    return list[0]!
  }
  const nukesIn = (events: ResolveEvent[]) =>
    events.filter((e) => e.kind === 'nuke') as Extract<ResolveEvent, { kind: 'nuke' }>[]

  it('vaporises every Lv 1 rune on the board, both sides, whatever its body', () => {
    // A 9-HP Lv 1 shield and a 2-HP Lv 1 bow go the same way: the blast reads
    // the level, not the hit points.
    const b = boardWith(
      p('player', 'archer', 0, 3, 'up'),
      p('player', 'defense', 3, 3, 'omni'),
      p('enemy', 'melee', 0, 0, 'down'),
      p('enemy', 'defense', 3, 0, 'omni')
    )
    expect(at(b, 3, 3).hp).toBe(9)
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    const nuke = nukeOf(events)
    expect(nuke.vaporised.map((r) => r.type).sort()).toEqual(['archer', 'defense', 'defense', 'melee'])
    expect(nuke.hits).toEqual([])
    // Only the bomb is left standing.
    expect(Object.values(board.runes).map((r) => r.type)).toEqual(['nuker'])
    expect(kinds(events, 'shatter')).toHaveLength(4)
  })

  it('leaves every Lv 2+ rune standing, wounded by NUKE_DAMAGE', () => {
    // Every facing points at an empty tile or off the board: what these runes
    // lose is the blast's doing and nothing else's.
    const b = boardWith(
      p('player', 'archer', 0, 3, 'down', { level: 2 }),
      p('enemy', 'melee', 0, 0, 'down', { level: 2 }),
      p('enemy', 'defense', 3, 0, 'omni', { level: 3 })
    )
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    const nuke = nukeOf(events)
    expect(nuke.vaporised).toEqual([])
    expect(nuke.hits).toHaveLength(3)
    // The smallest Lv 2 body in the game (4) outlives the blast (3).
    expect(at(board, 0, 3).hp).toBe(statsFor('archer', 2).hp - NUKE_DAMAGE)
    expect(at(board, 0, 0).hp).toBe(statsFor('melee', 2).hp - NUKE_DAMAGE)
    // A shield still mitigates one of it — living through the flash is not
    // being immune to it.
    expect(at(board, 3, 0).hp).toBe(statsFor('defense', 3).hp - (NUKE_DAMAGE - 1))
    expect(kinds(events, 'shatter')).toHaveLength(0)
  })

  it('never catches the bomb itself — that is what lets it deepen a lead', () => {
    const b = boardWith(p('enemy', 'melee', 0, 0, 'down'))
    const { board } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    const bomb = at(board, 1, 2)
    expect(bomb.type).toBe('nuker')
    expect(bomb.hp).toBe(statsFor('nuker', 1).hp)
    expect(ownerOf(board, 1, 2)).toBe('player')
  })

  it('takes the player OWN Lv 1 runes with it: there is no exempting yourself', () => {
    const b = boardWith(p('player', 'melee', 0, 3, 'up'), p('player', 'support', 2, 3, 'omni'))
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    expect(nukeOf(events).vaporised.map((r) => r.type).sort()).toEqual(['melee', 'support'])
    expect(empty(board, 0, 3)).toBe(true)
    expect(empty(board, 2, 3)).toBe(true)
  })

  it('a WOUNDED Lv 2 can still fall: Lv 2 survives the blast, it is not immune to it', () => {
    const b = boardWith(p('enemy', 'archer', 0, 0, 'down', { level: 2 }))
    at(b, 0, 0).hp = NUKE_DAMAGE
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    // It took damage rather than being vaporised — and the damage was enough.
    expect(nukeOf(events).vaporised).toEqual([])
    expect(nukeOf(events).hits).toHaveLength(1)
    expect(empty(board, 0, 0)).toBe(true)
    expect(kinds(events, 'shatter')).toHaveLength(1)
  })

  it('goes off on a STACK as well as a placement — you dropped another bomb', () => {
    const b = boardWith(p('player', 'nuker', 1, 2, 'omni'), p('enemy', 'melee', 0, 0, 'down'))
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    expect(kinds(events, 'merge')).toHaveLength(1)
    expect(nukeOf(events).vaporised.map((r) => r.type)).toEqual(['melee'])
    expect(at(board, 1, 2).level).toBe(2)
  })

  it('does NOT go off again on a later turn: the placement fires it, not a turn of attacking', () => {
    const b = boardWith(p('player', 'nuker', 1, 2, 'omni'), p('enemy', 'melee', 0, 0, 'down'))
    // A resolution in which no nuker is placed.
    const { board, events } = resolveTurn(b, [mv('player', 'melee', 2, 3, 'up')], fullPower)
    expect(nukesIn(events)).toHaveLength(0)
    expect(at(board, 0, 0).hp).toBe(statsFor('melee', 1).hp)
  })

  it('a rune the blast took never swings: it is dead before the ranged and melee steps', () => {
    // The Lv 1 enemy bow at (1,0) fires down column 1 every turn and would put
    // 2 into the player's Lv 2 sword at (1,2). The blast takes the bow first.
    const b = boardWith(p('enemy', 'archer', 1, 0, 'down'), p('player', 'melee', 1, 2, 'up', { level: 2 }))
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 3, 3, 'omni')], fullPower)
    expect(shots(events).some((e) => e.weapon === 'arrow')).toBe(false)
    // So the sword carries the nuke's damage and nothing else — no arrow landed.
    expect(at(board, 1, 2).hp).toBe(statsFor('melee', 2).hp - NUKE_DAMAGE)
  })

  it('neutralises the tiles of everything it vaporised, in the settle diff', () => {
    const b = boardWith(p('enemy', 'melee', 0, 0, 'down'), p('player', 'melee', 0, 3, 'up'))
    expect(ownerOf(b, 0, 0)).toBe('enemy')
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    expect(ownerOf(board, 0, 0)).toBe('neutral')
    expect(ownerOf(board, 0, 3)).toBe('neutral')
    const captures = kinds(events, 'capture') as Extract<ResolveEvent, { kind: 'capture' }>[]
    expect(captures).toContainEqual(expect.objectContaining({ col: 0, row: 0, owner: 'neutral', prev: 'enemy' }))
  })

  it('two bombs in one resolution both go off, in rune-id order, and the second finds less to burn', () => {
    // Both sides drop a nuker on a different tile. The first blast takes the two
    // swords AND the other bomb — a Lv 1 nuker is vaporised by someone else's
    // blast like anything else — but the second still goes off, because a rune
    // that is dying inside a step still acts in it. It finds only the bomb that
    // burned it, so the two wipe each other and the board is left bare.
    const b = boardWith(p('enemy', 'melee', 0, 0, 'down'), p('player', 'melee', 0, 3, 'up'))
    const { board, events } = resolveTurn(
      b, [mv('player', 'nuker', 1, 2, 'omni'), mv('enemy', 'nuker', 2, 1, 'omni')], fullPower
    )
    const nukes = nukesIn(events)
    expect(nukes).toHaveLength(2)
    // Ascending rune id — the order every other step resolves in.
    expect(nukes[0]!.from.id).toBeLessThan(nukes[1]!.from.id)
    expect(nukes[0]!.vaporised.map((r) => r.type).sort()).toEqual(['melee', 'melee', 'nuker'])
    // The second does not re-burn what the first already took, only the bomb
    // still standing: the one that burned it.
    expect(nukes[1]!.vaporised.map((r) => r.type)).toEqual(['nuker'])
    expect(nukes[1]!.hits).toEqual([])
    expect(Object.values(board.runes)).toEqual([])
  })

  it('a bomb that LOST its clash never landed, so nothing detonates', () => {
    // A player nuker (2 HP) and an enemy sword (3 HP) on the same tile: the
    // sword survives with 1, and the bomb was never placed.
    const b = boardWith(p('enemy', 'archer', 0, 0, 'down'))
    const { board, events } = resolveTurn(
      b, [mv('player', 'nuker', 1, 2, 'omni'), mv('enemy', 'melee', 1, 2, 'down')], fullPower
    )
    expect(nukesIn(events)).toHaveLength(0)
    expect(at(board, 1, 2).type).toBe('melee')
    // The bystander is untouched.
    expect(at(board, 0, 0).hp).toBe(statsFor('archer', 1).hp)
  })

  it('is stamped on its own timeline slot, before every attack in the same resolution', () => {
    const b = boardWith(p('enemy', 'melee', 0, 0, 'down', { level: 2 }))
    const { events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], fullPower)
    const nuke = nukeOf(events)
    expect(nuke.at).toBe(RESOLVE_TIMELINE.nuke.at)
    expect(nuke.dur).toBe(RESOLVE_TIMELINE.nuke.dur)
    expect(nuke.at).toBeGreaterThanOrEqual(RESOLVE_TIMELINE.place.at)
    expect(nuke.at).toBeLessThan(RESOLVE_TIMELINE.ranged.at)
    expect(nuke.at + nuke.dur).toBeLessThanOrEqual(RESOLVE_MS)
  })
})

describe('rune ranks', () => {
  it('give the PLAYER extra maximum HP at every level, and the enemy none', () => {
    for (const level of [1, 2, MAX_LEVEL]) {
      const opts = ranked({ melee: 3 })
      const mine = resolveTurn(boardWith(), [{ ...mv('player', 'melee', 1, 2, 'up'), level }], opts)
      const theirs = resolveTurn(boardWith(), [{ ...mv('enemy', 'melee', 1, 1, 'down'), level }], opts)
      expect(at(mine.board, 1, 2).maxHp, `player lv${level}`).toBe(statsFor('melee', level).hp + 3)
      expect(at(mine.board, 1, 2).hp, `player lv${level}`).toBe(statsFor('melee', level).hp + 3)
      expect(at(theirs.board, 1, 1).maxHp, `enemy lv${level}`).toBe(statsFor('melee', level).hp)
    }
  })

  it('apply per rune type — an unranked rune is untouched', () => {
    const opts = ranked({ archer: 5 })
    const { board } = resolveTurn(
      boardWith(), [mv('player', 'archer', 0, 3, 'up'), mv('player', 'melee', 1, 3, 'up')], opts
    )
    expect(at(board, 0, 3).maxHp).toBe(statsFor('archer', 1).hp + 5)
    expect(at(board, 1, 3).maxHp).toBe(statsFor('melee', 1).hp)
  })

  it('rank 0 — and no table at all — resolve exactly as they did before ranks existed', () => {
    const move = [mv('player', 'melee', 1, 2, 'up')]
    const plain = resolveTurn(boardWith(), move, fullPower)
    const zero = resolveTurn(boardWith(), move, ranked({ melee: 0 }))
    const missing = resolveTurn(boardWith(), move, ranked({}))
    expect(JSON.stringify(zero.board)).toBe(JSON.stringify(plain.board))
    expect(JSON.stringify(missing.board)).toBe(JSON.stringify(plain.board))
    expect(JSON.stringify(zero.events)).toBe(JSON.stringify(plain.events))
  })

  it('a ranked stack lands on the ranked maximum, and heals a wounded rune by the ranked body', () => {
    const b = boardWithRanks({ melee: 2 }, p('player', 'melee', 1, 2, 'up'))
    // The preset stood up ranked: 3 + 2.
    expect(at(b, 1, 2).hp).toBe(5)
    at(b, 1, 2).hp = 1
    const { board } = resolveTurn(b, [mv('player', 'melee', 1, 2, 'up')], ranked({ melee: 2 }))
    const r = at(board, 1, 2)
    expect(r.level).toBe(2)
    expect(r.maxHp).toBe(statsFor('melee', 2).hp + 2)
    // 1 + the ranked Lv 1 body (5), capped at the ranked Lv 2 maximum (8).
    expect(r.hp).toBe(6)
  })

  it('a ranked rune is harder to remove but hits for exactly the same', () => {
    // Attack is untouched by ranks — the balance guarantee, at the resolver.
    const b = boardWithRanks({ melee: 5 }, p('player', 'melee', 1, 2, 'up'), p('enemy', 'defense', 1, 1, 'omni'))
    const { board } = resolveTurn(b, [], ranked({ melee: 5 }))
    // A Lv 1 sword's 2, less the shield's 1 mitigation — the same as unranked.
    expect(at(board, 1, 1).hp).toBe(statsFor('defense', 1).hp - (statsFor('melee', 1).atk - 1))
  })

  it('a nuke still reads the LEVEL of a ranked rune, not its swollen body', () => {
    // Five ranks make a Lv 1 bow a 7-HP rune; the blast still vaporises it.
    const b = boardWithRanks({ archer: 5 }, p('player', 'archer', 0, 3, 'up'))
    expect(at(b, 0, 3).hp).toBe(7)
    const { board, events } = resolveTurn(b, [mv('player', 'nuker', 1, 2, 'omni')], ranked({ archer: 5 }))
    const nuke = (events.filter((e) => e.kind === 'nuke') as Extract<ResolveEvent, { kind: 'nuke' }>[])[0]!
    expect(nuke.vaporised.map((r) => r.type)).toEqual(['archer'])
    expect(empty(board, 0, 3)).toBe(true)
  })
})
