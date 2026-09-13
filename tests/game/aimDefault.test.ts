import { describe, expect, it } from 'vitest'
import { addRune, createBoard, usefulDir } from '@/game/board'
import { nodeConfig } from '@/game/campaign'
import { strikeCells, type Cell, type Dir, type RuneType } from '@/game/rules'

/**
 * ─── Which way an unaimed stone points ──────────────────────────────────────
 *
 * `defaultDir` answers "towards the other side", which is right in a duel and
 * meaningless in a siege. `usefulDir` asks the board instead. It decides every
 * placement a player makes without aiming — the common case for a first-timer,
 * who carries a pebble to a tile and lets go in the middle of it.
 *
 * The rule it must keep: it never aims BETTER than the player, it only stops
 * the game aiming WORSE than they did. Nothing in reach, or a tie, keeps the
 * facing the game always used.
 */

const at = (col: number, row: number): Cell => ({ col, row })
const key = (c: Cell): string => `${c.col},${c.row}`
const cells = (type: RuneType, dir: Dir, from: Cell, level = 1): string[] =>
  strikeCells(type, level, dir, from).map(key).sort()

describe('strikeCells', () => {
  it('gives a sword the one tile it faces, and nothing off the board', () => {
    expect(cells('melee', 'up', at(1, 2))).toEqual(['1,1'])
    expect(cells('melee', 'up', at(1, 0))).toEqual([])
  })

  it('makes an arrow skip the tile in front of it — the whole lesson of 1-2', () => {
    expect(cells('archer', 'up', at(1, 3))).toEqual(['1,1'])
    // Lv 2 adds the tile behind that one; the skipped tile is still not a target.
    expect(cells('archer', 'up', at(1, 3), 2)).toEqual(['1,0', '1,1'])
  })

  it('runs the orb two tiles along its diagonal and stops at the edge', () => {
    expect(cells('mage', 'ur', at(0, 3))).toEqual(['1,2', '2,1'])
    expect(cells('mage', 'ur', at(3, 3))).toEqual([])
  })

  it('gives a shield and a cross nothing to point at', () => {
    expect(cells('defense', 'omni', at(1, 1))).toEqual([])
    expect(cells('support', 'omni', at(1, 1))).toEqual([])
  })
})

describe('usefulDir', () => {
  const emptyBoard = () => createBoard(nodeConfig(7, 'medium'), 1)

  it('points a sword at the enemy beside it rather than at empty board', () => {
    const b = emptyBoard()
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 2, dir: 'down', hp: 1 })
    expect(usefulDir(b, 'player', 'melee', at(1, 2))).toBe('left')
  })

  it('keeps the default when nothing is in reach', () => {
    const b = emptyBoard()
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 0, dir: 'down', hp: 1 })
    expect(usefulDir(b, 'player', 'melee', at(3, 3))).toBe('up')
  })

  it('never aims at the player\'s own stones', () => {
    const b = emptyBoard()
    addRune(b, { side: 'player', faction: null, type: 'melee', col: 1, row: 1, dir: 'up' })
    expect(usefulDir(b, 'player', 'melee', at(1, 2))).toBe('up')
  })

  it('reads an archer\'s skip: the stone one tile ahead is not a target, the one behind it is', () => {
    const b = emptyBoard()
    // Directly above the bow: out of its reach, so it stays on the default.
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 2, dir: 'down', hp: 1 })
    expect(usefulDir(b, 'player', 'archer', at(1, 2))).toBe('up')
    // From (2,2) the same skeleton IS two tiles away — exactly where an arrow
    // lands — so the bow turns to it.
    expect(usefulDir(b, 'player', 'archer', at(2, 2))).toBe('left')
    // And a stone two tiles up is what makes the bow face up from (1,2).
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'archer', col: 1, row: 0, dir: 'down', hp: 1 })
    expect(usefulDir(b, 'player', 'archer', at(1, 2))).toBe('up')
  })

  it('counts the level it will be placed at, so a stack sees further', () => {
    const b = emptyBoard()
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 3, dir: 'down', hp: 1 })
    // Lv 1 reaches two tiles: (1,3) from (3,3). Nothing there.
    expect(usefulDir(b, 'player', 'archer', at(3, 3))).toBe('up')
    // Lv 2 also reaches three: (0,3), where the skeleton stands.
    expect(usefulDir(b, 'player', 'archer', at(3, 3), 2)).toBe('left')
  })

  it('faces the side a siege is actually coming from', () => {
    // The whole reason this is not `defaultDir`: in 1v3 the enemy is on three
    // sides, and "up" is only one of them.
    const b = emptyBoard()
    addRune(b, { side: 'enemy', faction: 'orc', type: 'melee', col: 3, row: 1, dir: 'left', hp: 3 })
    expect(usefulDir(b, 'player', 'melee', at(2, 1))).toBe('right')
  })

  it('leaves a shield and a cross omni', () => {
    const b = emptyBoard()
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 1, row: 1, dir: 'down', hp: 1 })
    expect(usefulDir(b, 'player', 'defense', at(1, 2))).toBe('omni')
    expect(usefulDir(b, 'player', 'support', at(1, 2))).toBe('omni')
  })

  it('prefers the facing that hits MORE of them', () => {
    const b = emptyBoard()
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 1, row: 1, dir: 'down', hp: 1 })
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 1, dir: 'down', hp: 1 })
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 2, row: 1, dir: 'down', hp: 1 })
    // A cleave's fan takes all three at once; every other facing takes one.
    expect(usefulDir(b, 'player', 'cleave', at(1, 2))).toBe('up')
    addRune(b, { side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 2, dir: 'down', hp: 1 })
    expect(usefulDir(b, 'player', 'melee', at(1, 2))).toBe('up')
  })
})
