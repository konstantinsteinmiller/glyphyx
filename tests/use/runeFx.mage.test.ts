// ─── The orb's contract with the renderer ───────────────────────────────────
//
// The beam and its Lv 2 cross, played through the orb's module the way the
// renderer plays them: the blow lands at `impactAt`, the charge / bloom /
// cross cues fire at the right moments (and the bloom only when something was
// hit), `start` and `impact` never touch the canvas, the stone it acts with is
// posed back to rest, and every tier paints without throwing.

import { beforeEach, describe, expect, it } from 'vitest'
import { GRID } from '@/game/rules'
import type { FxApi, RuneEvent } from '@/use/runeFx'
import { intercepted, type Shot } from '@/use/runeFx/types'
import { mage } from '@/use/runeFx/mage'
import { SCENARIOS, build } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

const SIZE = 80

interface Rec { sounds: string[]; shakes: string[]; poses: Array<[number, number, number, number, number]>; touched: string[] }

const drawCtx = (): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over' }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop: () => undefined })
      return () => undefined
    },
    set(t, k: string, v) {
      if (k === 'shadowBlur' || k === 'filter') throw new Error(`${k} set on the frame path`)
      t[k] = v
      return true
    }
  }) as unknown as CanvasRenderingContext2D
}

const untouchable = (rec: Rec): CanvasRenderingContext2D =>
  new Proxy({}, { get(_t, k: string) { rec.touched.push(k); return () => undefined } }) as unknown as CanvasRenderingContext2D

const makeApi = (rec: Rec, ctx: CanvasRenderingContext2D, tier: 0 | 1 | 2 = 2): FxApi => ({
  ctx,
  size: SIZE,
  tier,
  mul: tier === 2 ? 1 : tier === 1 ? 0.35 : 0.2,
  canEmit: true,
  now: 0,
  board: { x: 0, y: 0, w: SIZE * GRID, h: SIZE * GRID },
  scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
  cx: (col) => col * SIZE + SIZE / 2,
  cy: (_c, row) => row * SIZE + SIZE / 2,
  pose: (id, ox, oy, sx = 1, sy = 1) => { rec.poses.push([id, ox, oy, sx, sy]) },
  flash: () => undefined,
  shake: (k) => { rec.shakes.push(k) },
  sound: (id) => { rec.sounds.push(id) },
  sideColor: () => '#7fd0ff',
  stoneOf: () => '#8a8f9c',
  inkOf: () => '#1b1206',
  art: () => null
})

const newRec = (): Rec => ({ sounds: [], shakes: [], poses: [], touched: [] })

const events = (id: string): RuneEvent[] =>
  build(SCENARIOS.find((s) => s.id === id)!).events.filter((e) => e.kind === 'shot' || e.kind === 'explode') as RuneEvent[]

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('the orb', () => {
  it('keeps its timing inside the contract', () => {
    for (const e of [...events('mage-beam'), ...events('mage-lv2')]) {
      const at = mage.impactAt!(e)!
      expect(at).toBeGreaterThanOrEqual(0.3)
      expect(at).toBeLessThanOrEqual(0.8)
      expect(mage.tailMs!(e)!).toBeLessThanOrEqual(450)
    }
  })

  it('charges on start, blooms on impact, and leaves the canvas alone outside `paint`', () => {
    const rec = newRec()
    const api = makeApi(rec, untouchable(rec))
    for (const e of events('mage-lv2')) {
      mage.start!(e, api)
      mage.impact!(e, api)
    }
    // The beam's charge, the bloom on the stone it hit, the cross — and only the cross shakes hard.
    expect(rec.sounds).toEqual(['beam', 'beamHit', 'explode'])
    expect(rec.shakes).toEqual(['strong'])
    expect(rec.touched).toEqual([])
  })

  it('makes no bloom sound when the beam hits nothing', () => {
    const rec = newRec()
    const api = makeApi(rec, untouchable(rec))
    const e = events('mage-beam')[0] as Shot
    const miss: Shot = { ...e, hits: [] }
    mage.start!(miss, api)
    mage.impact!(miss, api)
    expect(rec.sounds).toEqual(['beam'])
  })

  it('poses the orb and puts it back to rest', () => {
    const rec = newRec()
    const api = makeApi(rec, drawCtx())
    const e = events('mage-beam')[0] as Shot
    mage.start!(e, api)
    for (let p = 0; p <= 1.9; p += 1 / 60) mage.paint!(e, p, api)
    const own = rec.poses.filter((q) => q[0] === e.from.id)
    expect(own.length).toBeGreaterThan(3)
    // It really moved (a squat, a kick back along the line) …
    expect(own.some((q) => Math.abs(q[1]) + Math.abs(q[2]) > 1)).toBe(true)
    // … and the last word is rest.
    expect(own[own.length - 1]!.slice(1)).toEqual([0, 0, 1, 1])
  })

  it('paints every scenario it takes part in, at every tier, through the tail', () => {
    for (const id of ['mage-beam', 'mage-lv2', 'defense-beam']) {
      for (const tier of [2, 1, 0] as const) {
        resetVfx()
        __setQualityTier(tier === 2 ? 'high' : tier === 1 ? 'low' : 'min')
        const rec = newRec()
        const api = makeApi(rec, drawCtx(), tier)
        for (const e of events(id)) {
          if (e.kind === 'shot' && e.from.type !== 'mage') continue
          mage.start!(e, api)
          let hit = false
          for (let p = 0; p <= 2; p += 1 / 30) {
            mage.paint!(e, p, api)
            if (!hit && p >= mage.impactAt!(e)!) { mage.impact!(e, api); hit = true }
          }
        }
        expect(rec.sounds.length, `${id} tier ${tier}`).toBeGreaterThan(0)
      }
    }
    // The wall scenario: the beam stops on the shield and throws no stone chips of its own.
    const wall = events('defense-beam').find((e) => e.kind === 'shot' && e.from.type === 'mage') as Shot
    expect(intercepted(wall)).toBe(true)
  })

  it('spends less on a weaker device', () => {
    const run = (): number => {
      resetVfx()
      const rec = newRec()
      const api = makeApi(rec, drawCtx(), 2)
      for (const e of events('mage-lv2')) {
        mage.start!(e, api)
        mage.impact!(e, api)
        for (let p = 0; p <= 1.5; p += 0.05) mage.paint!(e, p, api)
      }
      return particleCount()
    }
    __setQualityTier('high')
    const high = run()
    __setQualityTier('low')
    const low = run()
    expect(high).toBeGreaterThan(40)
    expect(low).toBeLessThanOrEqual(Math.ceil(high * 0.5))
  })
})
