import { describe, expect, it } from 'vitest'
import { lockChevronPoints } from '@/use/useArenaArt'
import { LOCK_CHEVRON_TILES, dirsFor } from '@/game/rules'

/**
 * The lock window's facing chevrons are drawn by the renderer and hit-tested
 * by the input layer from ONE function, so the two can never disagree about
 * where a tap lands. These pin the geometry that function promises.
 */
describe('lockChevronPoints', () => {
  it('puts one chevron per legal facing, LOCK_CHEVRON_TILES out from the tile centre', () => {
    const pts = lockChevronPoints('melee', 'up', 100, 200, 80)
    expect(pts.map((p) => p.dir).sort()).toEqual([...dirsFor('melee')].sort())
    for (const p of pts) {
      expect(Math.hypot(p.x - 100, p.y - 200)).toBeCloseTo(80 * LOCK_CHEVRON_TILES, 6)
    }
    const up = pts.find((p) => p.dir === 'up')!
    expect(up.x).toBeCloseTo(100, 6)
    expect(up.y).toBeLessThan(200)
    const right = pts.find((p) => p.dir === 'right')!
    expect(right.x).toBeGreaterThan(100)
    expect(right.y).toBeCloseTo(200, 6)
  })

  it('marks exactly the current facing as current', () => {
    const pts = lockChevronPoints('archer', 'left', 0, 0, 64)
    expect(pts.filter((p) => p.current).map((p) => p.dir)).toEqual(['left'])
  })

  it('gives a diagonal rune its four diagonals, unit-normalised to the same radius', () => {
    const pts = lockChevronPoints('mage', 'ur', 50, 50, 100)
    expect(pts.map((p) => p.dir).sort()).toEqual(['dl', 'dr', 'ul', 'ur'])
    for (const p of pts) expect(Math.hypot(p.x - 50, p.y - 50)).toBeCloseTo(100 * LOCK_CHEVRON_TILES, 6)
    const ur = pts.find((p) => p.dir === 'ur')!
    expect(ur.x).toBeGreaterThan(50)
    expect(ur.y).toBeLessThan(50)
  })

  it('gives an omni rune nothing to tap', () => {
    expect(lockChevronPoints('defense', 'omni', 0, 0, 80)).toEqual([])
    expect(lockChevronPoints('support', 'omni', 0, 0, 80)).toEqual([])
  })
})
