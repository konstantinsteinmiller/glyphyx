// ─── Boulder (`roller`): the effects beyond the catalogue's one lane ────────
//
// `runeFx.test.ts` runs `roller-lane` through the module. These boards cover
// the rest of what a boulder can do — the lanes that are not straight up, the
// stone that is right in front of it, the empty lane that runs it into the
// board's edge, the Lv 2 that ploughs through a survivor, the friendly fire,
// two boulders in one resolution — through the REAL resolver, at every tier,
// and hold the module to the contract: the timing it promises the renderer,
// no drawing outside `paint`, every stone it poses put back on its tile, a
// crunch for every stone it rolls through, a crush only when something stops
// it, and a particle budget that shrinks with the tier.

import { beforeEach, describe, expect, it } from 'vitest'
import type { Shot, FxApi } from '@/use/runeFx/types'
import { RUNE_FX } from '@/use/runeFx'
import { build, type Scenario } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx, type QualityTier } from '@/use/useVfx'

const P = 'player' as const
const E = 'enemy' as const

const BOARDS: Scenario[] = [
  { id: 'lane-up', rune: 'roller', title: 'the catalogue lane, again',
    runes: [[P, 'roller', 1, 3, 'up'], [E, 'nuker', 1, 2, 'down', 1], [E, 'crown', 1, 0, 'down', 3]] },
  { id: 'lane-right', rune: 'roller', title: 'right, through one, into the edge',
    runes: [[P, 'roller', 0, 2, 'right'], [E, 'nuker', 2, 2, 'down', 1]] },
  { id: 'lane-left', rune: 'roller', title: 'left into a survivor',
    runes: [[P, 'roller', 3, 1, 'left'], [E, 'crown', 1, 1, 'down', 3]] },
  { id: 'adjacent', rune: 'roller', title: 'stopped by the stone right in front of it',
    runes: [[P, 'roller', 1, 3, 'up'], [E, 'crown', 1, 2, 'down', 3]] },
  { id: 'empty', rune: 'roller', title: 'an empty lane',
    runes: [[P, 'roller', 2, 3, 'up'], [E, 'crown', 0, 0, 'down']] },
  { id: 'lv2-pierce', rune: 'roller', title: 'Lv 2 ploughs one survivor, stopped by the next',
    runes: [[P, 'roller', 1, 3, 'up', 2], [E, 'crown', 1, 2, 'down', 3], [E, 'crown', 1, 0, 'down', 4]] },
  { id: 'enemy-down-ff', rune: 'roller', title: 'an enemy boulder through its own stone',
    runes: [[E, 'roller', 2, 0, 'down'], [E, 'nuker', 2, 1, 'down', 1], [P, 'crown', 2, 3, 'up', 3]] },
  { id: 'two-rollers', rune: 'roller', title: 'two boulders in one resolution',
    runes: [[P, 'roller', 0, 3, 'up'], [P, 'roller', 3, 3, 'up'], [E, 'crown', 0, 1, 'down', 3], [E, 'nuker', 3, 1, 'down', 1]] }
]

// ─── Doubles ────────────────────────────────────────────────────────────────

let blur: string[] = []
const makeCtx = (): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over', shadowBlur: 0, filter: 'none' }
  const gradient = { addColorStop: () => undefined }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => gradient
      if (k === 'canvas') return { width: 400, height: 400 }
      return () => undefined
    },
    set(t, k: string, v) {
      if (k === 'shadowBlur' && Number(v) > 0) blur.push(`shadowBlur = ${v}`)
      if (k === 'filter' && v !== 'none') blur.push(`filter = ${v}`)
      t[k] = v
      return true
    }
  }) as unknown as CanvasRenderingContext2D
}

/** A context that fails the test if it is touched at all — lent during `start` / `impact`. */
const forbidden = new Proxy({}, {
  get(_t, k) { throw new Error(`start/impact touched ctx.${String(k)}`) },
  set(_t, k) { throw new Error(`start/impact set ctx.${String(k)}`) }
}) as unknown as CanvasRenderingContext2D

interface Rec {
  sounds: Array<{ id: string; power: number }>
  shakes: string[]
  poses: Map<number, { ox: number; oy: number; sx?: number; sy?: number }>
}

const makeApi = (tier: 0 | 1 | 2, rec: Rec): FxApi & { ctx: CanvasRenderingContext2D } => {
  const size = 80
  const api = {
    ctx: makeCtx(),
    size,
    tier,
    mul: tier === 2 ? 1 : tier === 1 ? 0.35 : 0.2,
    canEmit: true,
    now: 0,
    board: { x: 0, y: 0, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col: number) => col * size + size / 2,
    cy: (_c: number, row: number) => row * size + size / 2,
    pose: (id: number, ox: number, oy: number, sx?: number, sy?: number) => { rec.poses.set(id, { ox, oy, sx, sy }) },
    flash: () => undefined,
    shake: (k: 'small' | 'strong' | 'big') => { rec.shakes.push(k) },
    sound: (id: string, power: number) => { rec.sounds.push({ id, power }) },
    sideColor: (side: string) => (side === 'player' ? '#7fd0ff' : '#ff5a5a'),
    stoneOf: () => '#8a8f9c',
    inkOf: () => '#1b1206',
    art: () => null
  }
  return api as unknown as FxApi & { ctx: CanvasRenderingContext2D }
}

const TIERS: Array<[0 | 1 | 2, QualityTier]> = [[2, 'high'], [1, 'low'], [0, 'min']]

/** Play every roller shot of a board the way the renderer does: start, paint each frame, impact at the module's own moment. */
const play = (sc: Scenario, tier: 0 | 1 | 2): Rec & { shots: Shot[]; particles: number } => {
  const rec: Rec = { sounds: [], shakes: [], poses: new Map() }
  const api = makeApi(tier, rec)
  const paintCtx = api.ctx
  const shots = build(sc).events.filter((e): e is Shot => e.kind === 'shot' && e.from.type === 'roller')
  const mod = RUNE_FX.roller
  for (const e of shots) {
    const at = mod.impactAt?.(e) ?? 0.62
    const end = 1 + (mod.tailMs?.(e) ?? 220) / e.dur
    api.ctx = forbidden
    mod.start?.(e, api)
    let hit = false
    for (let t = 0; t <= end * e.dur + 1e-9; t += 1000 / 60) {
      const p = t / e.dur
      if (!hit && p >= at) {
        api.ctx = forbidden
        mod.impact?.(e, api)
        hit = true
      }
      api.ctx = paintCtx
      mod.paint?.(e, p, api)
    }
    // …and one more on the tail's last frame.
    api.ctx = paintCtx
    mod.paint?.(e, end, api)
  }
  return { ...rec, shots, particles: particleCount() }
}

beforeEach(() => {
  blur = []
  resetVfx()
  __setQualityTier('high')
})

describe('the boulder: its timing contract', () => {
  it('lands its blow inside 0.3…0.8 of the window and keeps its tail inside 450 ms', () => {
    for (const sc of BOARDS) {
      for (const e of build(sc).events) {
        if (e.kind !== 'shot' || e.from.type !== 'roller') continue
        const at = RUNE_FX.roller.impactAt?.(e)
        expect(at, sc.id).toBeGreaterThanOrEqual(0.3)
        expect(at, sc.id).toBeLessThanOrEqual(0.8)
        expect(RUNE_FX.roller.tailMs?.(e) ?? 0, sc.id).toBeLessThanOrEqual(450)
      }
    }
  })
})

describe('the boulder on every board, at every tier', () => {
  for (const sc of BOARDS) {
    it(`${sc.id}: never throws, never blurs, draws only in paint, and puts every stone back`, () => {
      for (const [tier, name] of TIERS) {
        resetVfx()
        __setQualityTier(name)
        const r = play(sc, tier)
        expect(r.shots.length, `${sc.id} produced no boulder`).toBeGreaterThan(0)
        expect(r.sounds.some((s) => s.id === 'roll'), `${sc.id} at ${name}: no roll`).toBe(true)
        for (const [id, pose] of r.poses) {
          expect([id, pose.ox, pose.oy], `${sc.id} at ${name}: stone ${id} left off its tile`).toEqual([id, 0, 0])
        }
      }
      expect(blur, `${sc.id}: shadowBlur / filter set`).toEqual([])
    })
  }
})

/** The three blows a boulder sounds: the crush on the stone that stopped it, a stone rolled through, the board's edge. */
const CRUSH = (s: { id: string; power: number }): boolean => s.id === 'rollHit' && s.power >= 0.99
const THROUGH = (s: { id: string; power: number }): boolean => s.id === 'rollHit' && s.power >= 0.48 && s.power < 0.99
const EDGE = (s: { id: string; power: number }): boolean => s.id === 'rollHit' && s.power < 0.48

describe('what the boulder does, it sounds and shakes', () => {
  it('crushes (rollHit at full power, a strong shake) only on the stone that stopped it', () => {
    const stopped = play(BOARDS.find((b) => b.id === 'lane-left')!, 2)
    expect(stopped.sounds.filter(CRUSH)).toHaveLength(1)
    expect(stopped.sounds.filter(EDGE)).toHaveLength(0)
    expect(stopped.shakes).toContain('strong')
    const edge = play(BOARDS.find((b) => b.id === 'empty')!, 2)
    expect(edge.sounds.filter(CRUSH), 'an empty lane crushed something').toHaveLength(0)
    expect(edge.sounds.filter(EDGE), 'an empty lane ends against the edge').toHaveLength(1)
    expect(edge.shakes).not.toContain('strong')
  })

  it('crunches every stone it rolls THROUGH, once each', () => {
    // Up the catalogue lane: one stone broken on the way, one that holds.
    const lane = play(BOARDS.find((b) => b.id === 'lane-up')!, 2)
    expect(lane.sounds.filter(THROUGH)).toHaveLength(1)
    expect(lane.sounds.filter(CRUSH)).toHaveLength(1)
    // Lv 2 ploughs through a survivor before the next one stops it.
    const lv2 = play(BOARDS.find((b) => b.id === 'lv2-pierce')!, 2)
    expect(lv2.sounds.filter(THROUGH)).toHaveLength(1)
    expect(lv2.sounds.filter(CRUSH)).toHaveLength(1)
  })

  it('keeps two boulders in one resolution apart: each one crushes its own stone', () => {
    const two = play(BOARDS.find((b) => b.id === 'two-rollers')!, 2)
    expect(two.shots).toHaveLength(2)
    expect(two.sounds.filter((s) => s.id === 'roll')).toHaveLength(2)
    // The left one is stopped by a Lv 3 crown; the right one breaks its stone and runs to the edge.
    expect(two.sounds.filter(CRUSH)).toHaveLength(1)
    expect(two.sounds.filter(THROUGH)).toHaveLength(1)
    expect(two.sounds.filter(EDGE)).toHaveLength(1)
  })
})

describe('the boulder\'s particle budget', () => {
  for (const sc of BOARDS) {
    it(`${sc.id} stays inside 420 at high, and spends less on a weaker device`, () => {
      __setQualityTier('high')
      resetVfx()
      const high = play(sc, 2).particles
      expect(high).toBeLessThanOrEqual(420)
      __setQualityTier('medium')
      resetVfx()
      const medium = play(sc, 2).particles
      if (high > 20) expect(medium, `${sc.id}: medium ${medium} vs high ${high}`).toBeLessThanOrEqual(Math.ceil(high * 0.8))
    })
  }
})
