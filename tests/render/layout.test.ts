import { describe, expect, it } from 'vitest'
import { CLEAN_BOARD_SHARE, computeArenaLayout } from '@/use/useArenaArt'
import { GRID, HAND_SIZE } from '@/game/rules'

/**
 * The layout is pure arithmetic: fit the largest square board into what the
 * HUD leaves, put the hand under it (portrait) or beside it (landscape), and
 * never let a finger target shrink below 44 px. These are the viewports the
 * game is required to look right on.
 */

const insets = { top: 58, bottom: 52, left: 0, right: 0 }

const inside = (r: { x: number; y: number; w: number; h: number }, W: number, H: number): boolean =>
  r.x >= -0.5 && r.y >= -0.5 && r.x + r.w <= W + 0.5 && r.y + r.h <= H + 0.5

const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

const VIEWPORTS: Array<[number, number]> = [[320, 658], [390, 844], [412, 915], [768, 1024], [844, 390], [1024, 768], [1920, 1080], [764, 385]]

describe('computeArenaLayout', () => {
  it('produces a square board of four equal tiles on every viewport', () => {
    for (const [w, h] of VIEWPORTS) {
      const g = computeArenaLayout(w, h, insets)
      expect(g.board.w).toBeCloseTo(g.board.h, 5)
      expect(g.tile).toBeCloseTo(g.board.w / GRID, 5)
      const last = g.tileRect(GRID - 1, GRID - 1)
      expect(last.x + last.w).toBeCloseTo(g.board.x + g.board.w, 5)
      expect(last.y + last.h).toBeCloseTo(g.board.y + g.board.h, 5)
    }
  })

  it('keeps everything inside the viewport and clear of the HUD insets', () => {
    for (const [w, h] of VIEWPORTS) {
      const g = computeArenaLayout(w, h, insets)
      const all = [g.frame, g.board, g.timer, g.reroll, g.counters.you, g.counters.foe, ...g.hand]
      for (const r of all) {
        expect(inside(r, w, h), `${w}x${h}: ${JSON.stringify(r)}`).toBe(true)
        expect(r.y, `${w}x${h} top inset`).toBeGreaterThanOrEqual(insets.top - 0.5)
        expect(r.y + r.h, `${w}x${h} bottom inset`).toBeLessThanOrEqual(h - insets.bottom + 0.5)
      }
    }
  })

  it('gives every hand slot a finger-sized target and keeps the slots apart', () => {
    for (const [w, h] of VIEWPORTS) {
      const g = computeArenaLayout(w, h, insets)
      expect(g.hand.length).toBe(HAND_SIZE)
      for (const s of g.hand) {
        expect(s.w).toBeGreaterThanOrEqual(44)
        expect(s.h).toBeGreaterThanOrEqual(44)
      }
      for (let i = 0; i < g.hand.length; i++) {
        for (let j = i + 1; j < g.hand.length; j++) expect(overlaps(g.hand[i]!, g.hand[j]!)).toBe(false)
        expect(overlaps(g.hand[i]!, g.board)).toBe(false)
        expect(overlaps(g.hand[i]!, g.reroll)).toBe(false)
      }
      expect(overlaps(g.timer, g.board)).toBe(false)
      expect(overlaps(g.reroll, g.board)).toBe(false)
    }
  })

  it('stacks the hand under the board in portrait and beside it in landscape', () => {
    const p = computeArenaLayout(390, 844, insets)
    expect(p.orientation).toBe('portrait')
    for (const s of p.hand) expect(s.y).toBeGreaterThan(p.board.y + p.board.h)
    const l = computeArenaLayout(844, 390, insets)
    expect(l.orientation).toBe('landscape')
    for (const s of l.hand) expect(s.x).toBeGreaterThan(l.board.x + l.board.w)
  })

  it('uses the full width of a narrow phone', () => {
    const g = computeArenaLayout(320, 658, insets)
    expect(g.board.w).toBeGreaterThan(260)
    expect(g.swipeThreshold).toBeGreaterThan(10)
  })

  it('maps a point back to the tile under it', () => {
    const g = computeArenaLayout(390, 844, insets)
    const r = g.tileRect(2, 1)
    expect(r.x).toBeCloseTo(g.board.x + 2 * g.tile, 5)
    expect(r.y).toBeCloseTo(g.board.y + 1 * g.tile, 5)
  })
})

/**
 * The clean feed (`?clean=1`, for scripted gameplay capture) draws the arena
 * and nothing else, so its layout owes the HUD nothing: the board is centred
 * in the whole canvas whatever the insets say, and everything that is not the
 * board is parked off screen — a clean frame that still showed a sliver of the
 * hand tray would fail the very spec the mode exists for.
 */
describe('computeArenaLayout — clean feed', () => {
  const CAPTURE: Array<[number, number]> = [[360, 640], [540, 960], [800, 450], [640, 360], ...VIEWPORTS]

  it('centres a square board in the whole canvas and ignores the HUD insets', () => {
    for (const [w, h] of CAPTURE) {
      const g = computeArenaLayout(w, h, insets, true)
      expect(g.board.w).toBeCloseTo(g.board.h, 5)
      expect(g.board.x + g.board.w / 2).toBeCloseTo(w / 2, 5)
      expect(g.board.y + g.board.h / 2).toBeCloseTo(h / 2, 5)
      expect(inside(g.frame, w, h)).toBe(true)
      expect(computeArenaLayout(w, h, { top: 0, bottom: 0, left: 0, right: 0 }, true).board).toEqual(g.board)
    }
  })

  it('sizes the board frame as a fixed share of the short side', () => {
    for (const [w, h] of CAPTURE) {
      const share = w > h ? CLEAN_BOARD_SHARE.landscape : CLEAN_BOARD_SHARE.portrait
      expect(computeArenaLayout(w, h, insets, true).frame.w).toBeCloseTo(Math.min(w, h) * share, 5)
    }
  })

  it('parks the hand, reroll, timer and counters entirely off screen', () => {
    for (const [w, h] of CAPTURE) {
      const g = computeArenaLayout(w, h, insets, true)
      expect(g.hand).toHaveLength(HAND_SIZE)
      for (const r of [...g.hand, g.reroll, g.timer, g.counters.you, g.counters.foe]) {
        expect(r.y).toBeGreaterThanOrEqual(h)
      }
    }
  })
})
