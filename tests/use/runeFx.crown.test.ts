// ─── Crown (`crown`): the take, from every side ─────────────────────────────
//
// `runeFx.test.ts` runs `crown-take` (a player crown facing up). These boards
// cover the rest — an enemy crown taking one of the player's stones, a crown
// facing sideways, and a stacked Lv 2 crown taking a Lv 2 stone — through the
// REAL resolver, at every tier. The module is held to its contract: the
// staging it asks of the renderer, no drawing outside `paint`, both stones it
// poses put back on their tiles, the fanfare once per take, the conversion
// painted in the NEW owner's colour, and a budget that shrinks with the tier.

import { beforeEach, describe, expect, it } from 'vitest'
import type { Crown, FxApi } from '@/use/runeFx/types'
import { RUNE_FX } from '@/use/runeFx'
import { build, type Scenario } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx, type QualityTier } from '@/use/useVfx'

const P = 'player' as const
const E = 'enemy' as const

const BOARDS: Scenario[] = [
  { id: 'player-up', rune: 'crown', title: 'the catalogue take, again',
    runes: [[E, 'melee', 1, 1, 'down'], [E, 'crown', 3, 0, 'down']],
    moves: [{ side: 'player', faction: null, type: 'crown', col: 1, row: 2, dir: 'up' }] },
  { id: 'enemy-down', rune: 'crown', title: 'an enemy crown takes the player\'s stone below it',
    runes: [[P, 'melee', 1, 2, 'up'], [E, 'crown', 3, 0, 'down']],
    moves: [{ side: 'enemy', faction: 'goblin', type: 'crown', col: 1, row: 1, dir: 'down' }] },
  { id: 'player-right', rune: 'crown', title: 'a crown takes the stone to its right',
    runes: [[E, 'archer', 2, 1, 'down'], [E, 'crown', 3, 0, 'down']],
    moves: [{ side: 'player', faction: null, type: 'crown', col: 1, row: 1, dir: 'right' }] },
  { id: 'lv2', rune: 'crown', title: 'a stacked Lv 2 crown takes a Lv 2 stone',
    runes: [[P, 'crown', 1, 2, 'up'], [E, 'melee', 1, 1, 'down', 2]],
    moves: [{ side: 'player', faction: null, type: 'crown', col: 1, row: 2, dir: 'up' }] }
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

const forbidden = new Proxy({}, {
  get(_t, k) { throw new Error(`start/impact touched ctx.${String(k)}`) },
  set(_t, k) { throw new Error(`start/impact set ctx.${String(k)}`) }
}) as unknown as CanvasRenderingContext2D

interface Rec {
  sounds: string[]
  colours: string[]
  poses: Map<number, { ox: number; oy: number }>
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
    pose: (id: number, ox: number, oy: number) => { rec.poses.set(id, { ox, oy }) },
    flash: () => undefined,
    shake: () => undefined,
    sound: (id: string) => { rec.sounds.push(id) },
    sideColor: (side: string) => { const c = side === 'player' ? '#7fd0ff' : '#ff5a5a'; rec.colours.push(side); return c },
    stoneOf: () => '#8a8f9c',
    inkOf: () => '#1b1206',
    art: () => null
  }
  return api as unknown as FxApi & { ctx: CanvasRenderingContext2D }
}

const TIERS: Array<[0 | 1 | 2, QualityTier]> = [[2, 'high'], [1, 'low'], [0, 'min']]

const play = (sc: Scenario, tier: 0 | 1 | 2): Rec & { takes: Crown[]; particles: number } => {
  const rec: Rec = { sounds: [], colours: [], poses: new Map() }
  const api = makeApi(tier, rec)
  const paintCtx = api.ctx
  const takes = build(sc).events.filter((e): e is Crown => e.kind === 'crown')
  const mod = RUNE_FX.crown
  for (const e of takes) {
    const at = mod.impactAt?.(e) ?? 0
    const end = 1 + (mod.tailMs?.(e) ?? 120) / e.dur
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
  }
  return { ...rec, takes, particles: particleCount() }
}

beforeEach(() => {
  blur = []
  resetVfx()
  __setQualityTier('high')
})

describe('the crown: its staging contract', () => {
  it('seals inside 0.3…0.8 of the window and keeps its tail inside 450 ms', () => {
    for (const sc of BOARDS) {
      for (const e of build(sc).events) {
        if (e.kind !== 'crown') continue
        const at = RUNE_FX.crown.impactAt?.(e)
        expect(at, sc.id).toBeGreaterThanOrEqual(0.3)
        expect(at, sc.id).toBeLessThanOrEqual(0.8)
        expect(RUNE_FX.crown.tailMs?.(e) ?? 0, sc.id).toBeLessThanOrEqual(450)
      }
    }
  })
})

describe('the crown on every board, at every tier', () => {
  for (const sc of BOARDS) {
    it(`${sc.id}: never throws, never blurs, draws only in paint, plays the fanfare once and puts both stones back`, () => {
      for (const [tier, name] of TIERS) {
        resetVfx()
        __setQualityTier(name)
        const r = play(sc, tier)
        expect(r.takes.length, `${sc.id} produced no take`).toBe(1)
        expect(r.sounds.filter((s) => s === 'crown'), `${sc.id} at ${name}`).toHaveLength(1)
        const e = r.takes[0]!
        expect(r.poses.has(e.from.id) && r.poses.has(e.turned.id), `${sc.id}: the crown and the target were both acted`).toBe(true)
        for (const [id, pose] of r.poses) {
          expect([id, pose.ox, pose.oy], `${sc.id} at ${name}: stone ${id} left off its tile`).toEqual([id, 0, 0])
        }
      }
      expect(blur, `${sc.id}: shadowBlur / filter set`).toEqual([])
    })
  }

  it('paints the conversion in the NEW owner\'s colour, never the side it fought for', () => {
    for (const sc of BOARDS) {
      const r = play(sc, 2)
      const e = r.takes[0]!
      expect(r.colours.length, sc.id).toBeGreaterThan(0)
      expect(new Set(r.colours), sc.id).toEqual(new Set([e.turned.side]))
      expect(e.turned.side, sc.id).not.toBe(e.was)
    }
  })
})

describe('the crown\'s particle budget', () => {
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
