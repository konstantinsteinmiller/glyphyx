// ─── The warhead's contract with the renderer ───────────────────────────────
//
// The blast front is a FACT the renderer owns (it cracks each vaporised stone
// when the front reaches its tile) and a LOOK the warhead module owns (the
// shock shell, the tiles lighting up, each stone's flare). The two must travel
// together, the wash must never leave the board rect (the HUD sits above it),
// `shake('big')` and the `nuke` cue fire once per blast, and the facts (a
// survivor's lost hit points) land only once the front has reached them.

import { beforeEach, describe, expect, it } from 'vitest'
import { GRID } from '@/game/rules'
import { RUNE_FX, type FxApi, type RuneEvent } from '@/use/runeFx'
import type { Nuke } from '@/use/runeFx/types'
import { NUKE_INHALE, NUKE_WAVE_TILES, frontArrival, frontAt, nukeFrontAt, nuker } from '@/use/runeFx/nuker'
import { SCENARIOS, build } from '@/use/runeFx/scenarios'
import { __setQualityTier, resetVfx } from '@/use/useVfx'

const SIZE = 80
const BOARD = { x: 40, y: 120, w: SIZE * GRID, h: SIZE * GRID }

interface Rec {
  sounds: string[]
  shakes: string[]
  flashes: number[]
  fills: Array<[number, number, number, number]>
  clips: number
  touched: string[]
}

/** A 2D context that records what the blast paints, and where. */
const makeCtx = (rec: Rec): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over' }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'fillRect') return (x: number, y: number, w: number, h: number) => { rec.fills.push([x, y, w, h]) }
      if (k === 'clip') return () => { rec.clips++ }
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop: () => undefined })
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
}

/** A context that fails the test if anything reads it — `start` and `impact` must not. */
const untouchable = (rec: Rec): CanvasRenderingContext2D =>
  new Proxy({}, { get(_t, k: string) { rec.touched.push(k); return () => undefined } }) as unknown as CanvasRenderingContext2D

const makeApi = (rec: Rec, ctx: CanvasRenderingContext2D, tier: 0 | 1 | 2 = 2): FxApi => ({
  ctx,
  size: SIZE,
  tier,
  mul: 1,
  canEmit: true,
  now: 0,
  board: BOARD,
  scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
  cx: (col) => BOARD.x + col * SIZE + SIZE / 2,
  cy: (_c, row) => BOARD.y + row * SIZE + SIZE / 2,
  pose: () => undefined,
  flash: (id) => { rec.flashes.push(id) },
  shake: (k) => { rec.shakes.push(k) },
  sound: (id) => { rec.sounds.push(id) },
  sideColor: () => '#7fd0ff',
  stoneOf: () => '#8a8f9c',
  inkOf: () => '#1b1206',
  art: () => null
})

const newRec = (): Rec => ({ sounds: [], shakes: [], flashes: [], fills: [], clips: 0, touched: [] })

const theNuke = (): Nuke => {
  const sc = SCENARIOS.find((s) => s.id === 'nuker-nuke')!
  const e = build(sc).events.find((x) => x.kind === 'nuke')
  if (!e || e.kind !== 'nuke') throw new Error('nuker-nuke has no nuke event')
  return e
}

/**
 * The crack front, written out by hand: nothing moves during the inhale, then
 * `size × (0.2 + easeOutCubic(b) × 5)` over the blast's own progress `b`. The
 * renderer imports `nukeFrontAt`; this is the independent statement of it.
 */
const rendererFront = (p: number, size: number): number => {
  const k = Math.max(0, Math.min(1, (p - NUKE_INHALE) / (1 - NUKE_INHALE)))
  return size * (0.2 + (1 - Math.pow(1 - k, 3)) * 5)
}

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('the warhead', () => {
  it('draws its front at the renderer\'s crack-front speed, to the pixel', () => {
    expect(NUKE_WAVE_TILES).toBe(5)
    for (let p = -0.2; p <= 1.6; p += 0.01) expect(nukeFrontAt(p, SIZE)).toBeCloseTo(rendererFront(p, SIZE), 6)
    // …and nothing moves before the inhale is over.
    expect(nukeFrontAt(NUKE_INHALE * 0.99, SIZE)).toBeCloseTo(SIZE * 0.2, 6)
  })

  it('knows when the front reaches a given distance (the inverse of the front)', () => {
    for (const tiles of [0.5, 1, Math.SQRT2, 2.24, 3, 4.24]) {
      expect(frontAt(frontArrival(tiles), 1)).toBeCloseTo(tiles, 6)
    }
  })

  it('lands the facts inside the contract window, and never before the front reaches a survivor', () => {
    const e = theNuke()
    const at = nuker.impactAt!(e)!
    expect(at).toBeGreaterThanOrEqual(0.3)
    expect(at).toBeLessThanOrEqual(0.8)
    for (const h of e.hits) {
      const d = Math.hypot(h.target.col - e.from.col, h.target.row - e.from.row)
      expect(nukeFrontAt(at, 1)).toBeGreaterThanOrEqual(d)
    }
    // A survivor in the far corner pushes the facts later — but never past 0.8.
    const far: Nuke = { ...e, from: { ...e.from, col: 0, row: 0 }, hits: [{ ...e.hits[0]!, target: { ...e.hits[0]!.target, col: 3, row: 3 } }] }
    const late = nuker.impactAt!(far)!
    expect(late).toBeGreaterThan(at)
    expect(late).toBeLessThanOrEqual(0.8)
    expect(nukeFrontAt(late, 1)).toBeGreaterThanOrEqual(Math.hypot(3, 3))
    expect(nuker.tailMs!(e)!).toBeLessThanOrEqual(450)
  })

  it('plays its cue at the start, shakes big ONCE at detonation, and leaves the canvas alone outside `paint`', () => {
    const rec = newRec()
    const e = theNuke()
    const api = makeApi(rec, untouchable(rec))
    nuker.start!(e as RuneEvent, api)
    nuker.impact?.(e as RuneEvent, api)
    // The cue carries its own inhale; nothing GOES OFF until the inhale ends.
    expect(rec.sounds).toEqual(['nuke'])
    expect(rec.shakes).toEqual([])
    expect(rec.touched).toEqual([])
    const painting = makeApi(rec, makeCtx(rec))
    for (let p = 0; p <= 2.6; p += 1 / 60) nuker.paint!(e as RuneEvent, p, painting)
    expect(rec.shakes).toEqual(['big'])
    expect(rec.sounds).toEqual(['nuke'])
  })

  it('keeps every wash on the board rect, clipped — the HUD above never strobes', () => {
    for (const tier of [2, 1, 0] as const) {
      const rec = newRec()
      const e = theNuke()
      const api = makeApi(rec, makeCtx(rec), tier)
      nuker.start!(e as RuneEvent, api)
      for (let p = 0; p <= 2.6; p += 1 / 60) RUNE_FX.nuker.paint!(e as RuneEvent, p, api)
      expect(rec.clips, `tier ${tier}: no clip`).toBeGreaterThan(0)
      expect(rec.fills.length, `tier ${tier}: no wash at all`).toBeGreaterThan(0)
      for (const [x, y, w, h] of rec.fills) {
        expect(x).toBeGreaterThanOrEqual(BOARD.x - 0.01)
        expect(y).toBeGreaterThanOrEqual(BOARD.y - 0.01)
        expect(x + w).toBeLessThanOrEqual(BOARD.x + BOARD.w + 0.01)
        expect(y + h).toBeLessThanOrEqual(BOARD.y + BOARD.h + 0.01)
      }
    }
  })

  it('flares every stone exactly once, as the front reaches it — however the frames fall', () => {
    for (const step of [1 / 60, 1 / 30, 0.05, 0.2]) {
      const rec = newRec()
      const e = theNuke()
      const api = makeApi(rec, makeCtx(rec))
      nuker.start!(e as RuneEvent, api)
      rec.flashes.length = 0
      for (let p = 0; p <= 1.4; p += step) nuker.paint!(e as RuneEvent, p, api)
      const ids = [...e.vaporised.map((r) => r.id), ...e.hits.map((h) => h.target.id)].sort((a, b) => a - b)
      // The warhead itself flashes once, as it goes off.
      expect(rec.flashes.filter((id) => id === e.from.id), `step ${step}: the warhead's own flash`).toEqual([e.from.id])
      expect(rec.flashes.filter((id) => id !== e.from.id).sort((a, b) => a - b), `step ${step}`).toEqual(ids)
    }
  })
})
