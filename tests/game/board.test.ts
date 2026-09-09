import { describe, expect, it } from 'vitest'
import {
  addRune, cloneBoard, countTiles, createBoard, factionTiles, legalPlacements, neighbors, placementKind, runeAt, runesOf
} from '@/game/board'
import { MAX_LEVEL, statsFor } from '@/game/rules'
import { testConfig, p, ownerOf } from './helpers'

describe('createBoard', () => {
  it('lays out a 1v1: player bottom row, enemy top row, middle neutral', () => {
    const b = createBoard(testConfig())
    expect(b.tiles).toHaveLength(16)
    for (let col = 0; col < 4; col++) {
      expect(ownerOf(b, col, 3)).toBe('player')
      expect(ownerOf(b, col, 0)).toBe('enemy')
      expect(b.tiles[col]!.faction).toBe('goblin')
      expect(ownerOf(b, col, 1)).toBe('neutral')
      expect(ownerOf(b, col, 2)).toBe('neutral')
    }
    expect(countTiles(b, 'player')).toBe(4)
    expect(countTiles(b, 'enemy')).toBe(4)
    expect(countTiles(b, 'neutral')).toBe(8)
  })

  it('lays out a siege: centre 2×2 player, three factions around, bottom row neutral', () => {
    const b = createBoard(testConfig({
      mode: 'siege', objective: 'siege',
      enemies: [
        { faction: 'goblin', post: 'north', deck: ['archer'], ai: 'easy', atkMul: 1 },
        { faction: 'orc', post: 'west', deck: ['melee'], ai: 'easy', atkMul: 1 },
        { faction: 'undead', post: 'east', deck: ['mage'], ai: 'easy', atkMul: 1 }
      ]
    }))
    for (const [col, row] of [[1, 1], [2, 1], [1, 2], [2, 2]]) expect(ownerOf(b, col!, row!)).toBe('player')
    for (let col = 0; col < 4; col++) {
      expect(ownerOf(b, col, 0)).toBe('enemy')
      expect(b.tiles[col]!.faction).toBe('goblin')
      expect(ownerOf(b, col, 3)).toBe('neutral')
    }
    expect(b.tiles[4]!.faction).toBe('orc')
    expect(b.tiles[8]!.faction).toBe('orc')
    expect(b.tiles[7]!.faction).toBe('undead')
    expect(b.tiles[11]!.faction).toBe('undead')
    expect(factionTiles(b)).toEqual({ goblin: 4, orc: 2, undead: 2 })
    expect(countTiles(b, 'player')).toBe(4)
    expect(countTiles(b, 'enemy')).toBe(8)
  })

  it('stands presets on the board with full stats, honouring an HP override', () => {
    const b = createBoard(testConfig({
      presets: [
        p('enemy', 'melee', 1, 1, 'down', { hp: 1, faction: 'skeleton' }),
        p('player', 'defense', 0, 3, 'omni', { level: 2 })
      ]
    }))
    const skel = runeAt(b, 1, 1)!
    expect(skel.hp).toBe(1)
    expect(skel.maxHp).toBe(1)
    expect(skel.faction).toBe('skeleton')
    expect(ownerOf(b, 1, 1)).toBe('enemy')
    expect(b.tiles[5]!.faction).toBe('skeleton')
    const shield = runeAt(b, 0, 3)!
    expect(shield.level).toBe(2)
    expect(shield.hp).toBe(18)
    expect(shield.faction).toBeNull()
  })

  it('stands a WOUNDED rune when the preset names a higher maximum', () => {
    const b = createBoard(testConfig({
      presets: [
        p('player', 'melee', 1, 2, 'up', { hp: 1, maxHp: 3 }),
        // A maximum below the HP is nonsense; the HP wins.
        p('player', 'archer', 0, 3, 'up', { hp: 2, maxHp: 1 })
      ]
    }))
    expect(runeAt(b, 1, 2)).toMatchObject({ hp: 1, maxHp: 3 })
    expect(runeAt(b, 0, 3)).toMatchObject({ hp: 2, maxHp: 2 })
  })
})

describe('placement', () => {
  it('empty tiles anywhere, stack on a friendly same-type rune below the cap, otherwise invalid', () => {
    const b = createBoard(testConfig({
      presets: [
        p('player', 'melee', 1, 2, 'up'),
        p('player', 'melee', 2, 2, 'up', { level: 2 }),
        p('player', 'melee', 3, 2, 'up', { level: MAX_LEVEL }),
        p('enemy', 'melee', 1, 0, 'down')
      ]
    }))
    expect(placementKind(b, 'player', 'melee', 0, 0)).toBe('empty')   // enemy territory, empty
    expect(placementKind(b, 'player', 'melee', 1, 2)).toBe('stack')
    expect(placementKind(b, 'player', 'archer', 1, 2)).toBe('invalid') // different type
    expect(placementKind(b, 'player', 'melee', 2, 2)).toBe('stack')    // Lv 2 climbs to Lv 3
    expect(placementKind(b, 'player', 'melee', 3, 2)).toBe('invalid')  // at the cap
    expect(placementKind(b, 'player', 'melee', 1, 0)).toBe('invalid')  // enemy rune
    expect(placementKind(b, 'enemy', 'melee', 1, 0)).toBe('stack')
    expect(placementKind(b, 'player', 'melee', 4, 0)).toBe('invalid')  // off board
  })

  it('legalPlacements lists every empty tile plus stacks', () => {
    const b = createBoard(testConfig({ presets: [p('player', 'archer', 0, 3, 'up')] }))
    const legal = legalPlacements(b, 'player', 'archer')
    expect(legal).toHaveLength(16)
    expect(legal.filter((l) => l.kind === 'stack')).toHaveLength(1)
    expect(legalPlacements(b, 'player', 'melee')).toHaveLength(15)
  })
})

describe('helpers', () => {
  it('neighbors are the in-bounds orthogonals', () => {
    expect(neighbors({ col: 0, row: 0 })).toEqual([{ col: 1, row: 0 }, { col: 0, row: 1 }])
    expect(neighbors({ col: 1, row: 1 })).toHaveLength(4)
  })

  it('runesOf is id-ascending per side', () => {
    const b = createBoard(testConfig({ presets: [p('enemy', 'melee', 0, 0, 'down'), p('player', 'melee', 0, 3, 'up'), p('player', 'archer', 1, 3, 'up')] }))
    expect(runesOf(b, 'player').map((r) => r.type)).toEqual(['melee', 'archer'])
    expect(runesOf(b, 'enemy')).toHaveLength(1)
  })

  it('cloneBoard shares nothing with the original', () => {
    const b = createBoard(testConfig({ presets: [p('player', 'melee', 0, 3, 'up')] }))
    const c = cloneBoard(b)
    c.runes[1]!.hp = 0
    c.tiles[0]!.owner = 'player'
    addRune(c, p('player', 'archer', 1, 3, 'up'))
    expect(b.runes[1]!.hp).toBe(3)
    expect(b.tiles[0]!.owner).toBe('enemy')
    expect(Object.keys(b.runes)).toHaveLength(1)
    expect(b.nextRuneId).toBe(2)
  })
})

describe('ranks on the board', () => {
  it('stand a PLAYER preset up with its rank bonus, and an enemy preset without', () => {
    const board = createBoard(testConfig(), { melee: 4 })
    addRune(board, p('player', 'melee', 1, 3, 'up'), { melee: 4 })
    addRune(board, p('enemy', 'melee', 1, 0, 'down'), { melee: 4 })
    expect(runeAt(board, 1, 3)!.maxHp).toBe(statsFor('melee', 1).hp + 4)
    expect(runeAt(board, 1, 3)!.hp).toBe(statsFor('melee', 1).hp + 4)
    expect(runeAt(board, 1, 0)!.maxHp).toBe(statsFor('melee', 1).hp)
  })

  it('leave an AUTHORED preset exactly as written — a lesson does not change shape when ranks are bought', () => {
    // 1-6 stands a wounded sword at 1 of 3 and measures the trade against a
    // 6-HP orc. If ranks moved those numbers the lesson's floor would move too.
    const ranks = { melee: 5, archer: 5 }
    const board = createBoard(testConfig(), ranks)
    addRune(board, p('player', 'melee', 1, 2, 'up', { hp: 1, maxHp: 3 }), ranks)
    addRune(board, p('player', 'archer', 0, 2, 'up', { hp: 2 }), ranks)
    expect(runeAt(board, 1, 2)).toMatchObject({ hp: 1, maxHp: 3 })
    expect(runeAt(board, 0, 2)).toMatchObject({ hp: 2, maxHp: 2 })
  })

  it('no table at all is the board it always was', () => {
    const plain = createBoard(testConfig())
    const empty = createBoard(testConfig(), {})
    expect(JSON.stringify(empty)).toBe(JSON.stringify(plain))
  })
})
