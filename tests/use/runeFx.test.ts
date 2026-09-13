// ─── The per-rune effects contract ──────────────────────────────────────────
//
// Every rune's module (`src/use/runeFx/<rune>.ts`) is run through every FX
// scenario (`src/use/runeFx/scenarios.ts` — real boards, real `resolveTurn`
// events), at every quality tier, across the whole progress range including
// the tail. It must never throw, never touch `shadowBlur` or `filter`, make a
// sound for each of its own events, and keep its particles inside a budget
// that shrinks with the tier.

import { beforeEach, describe, expect, it } from 'vitest'
import { RUNE_TYPES, type Hit } from '@/game/rules'
import { RUNE_FX, intercepted, ownerOf, type FxApi, type RuneEvent } from '@/use/runeFx'
import { SCENARIOS, build } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx, type QualityTier } from '@/use/useVfx'

// ─── A 2D context double ────────────────────────────────────────────────────

const PROPS: Record<string, unknown> = {
  globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1,
  lineCap: 'butt', lineJoin: 'miter', miterLimit: 10, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic',
  shadowBlur: 0, shadowColor: 'transparent', shadowOffsetX: 0, shadowOffsetY: 0, filter: 'none', imageSmoothingEnabled: true,
  lineDashOffset: 0
}

let blurViolations: string[] = []

const makeCtx = (): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { ...PROPS }
  const gradient = { addColorStop: () => undefined }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient' || k === 'createConicGradient') return () => gradient
      if (k === 'createPattern') return () => ({})
      if (k === 'measureText') return () => ({ width: 10, actualBoundingBoxAscent: 7, actualBoundingBoxDescent: 2 })
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
      if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
      if (k === 'canvas') return { width: 400, height: 400 }
      return () => undefined
    },
    set(t, k: string, v) {
      if (k === 'shadowBlur' && Number(v) > 0) blurViolations.push(`shadowBlur = ${v}`)
      if (k === 'filter' && v !== 'none') blurViolations.push(`filter = ${v}`)
      t[k] = v
      return true
    }
  }) as unknown as CanvasRenderingContext2D
}

// ─── An FxApi double ────────────────────────────────────────────────────────

const TIERS: Array<[0 | 1 | 2, QualityTier]> = [[2, 'high'], [1, 'low'], [0, 'min']]

interface Recorded { sounds: string[]; shakes: string[] }

const makeApi = (tier: 0 | 1 | 2): FxApi & Recorded => {
  const rec: Recorded = { sounds: [], shakes: [] }
  const size = 80
  return {
    ...rec,
    ctx: makeCtx(),
    size,
    tier,
    mul: tier === 2 ? 1 : tier === 1 ? 0.35 : 0.2,
    canEmit: true,
    now: 0,
    board: { x: 0, y: 0, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col) => col * size + size / 2,
    cy: (_c, row) => row * size + size / 2,
    pose: () => undefined,
    flash: () => undefined,
    shake(kind) { rec.shakes.push(kind) },
    sound(id) { rec.sounds.push(id) },
    sideColor: (side) => (side === 'player' ? '#7fd0ff' : '#ff5a5a'),
    stoneOf: () => '#8a8f9c',
    inkOf: () => '#1b1206',
    art: () => null
  }
}

/** Play one scenario's rune events through their modules, the way the renderer does. */
const play = (id: string, tier: 0 | 1 | 2): Recorded & { particles: number; own: number } => {
  const sc = SCENARIOS.find((s) => s.id === id)!
  const { events } = build(sc)
  const api = makeApi(tier)
  let own = 0
  for (const e of events) {
    const owner = ownerOf(e)
    if (!owner) continue
    if (owner === sc.rune) own++
    // The shield takes part in OTHER runes' events: the wall it puts up, the hit it eats.
    if (sc.rune === 'defense' && e.kind === 'shot' && (intercepted(e) || e.hits.some((h) => h.absorbed > 0))) own++
    const mod = RUNE_FX[owner]
    const re = e as RuneEvent
    mod.start?.(re, api)
    for (let p = 0; p <= 1.45; p += 0.05) {
      mod.paint?.(re, p, api)
      if (e.kind === 'shot' && intercepted(e)) {
        const last = e.path[e.path.length - 1]!
        RUNE_FX.defense.interceptPaint?.(e, Math.min(1, p), api.cx(last.col, last.row), api.cy(last.col, last.row), api)
      }
      if (Math.abs(p - 0.5) < 0.026) {
        const hits: Hit[] = 'hits' in e ? e.hits : []
        for (const h of hits) {
          if (h.absorbed > 0 || h.amount === 0) RUNE_FX.defense.absorb?.(h, api.cx(h.target.col, h.target.row), api.cy(h.target.col, h.target.row), api)
        }
        if (e.kind === 'shot' && intercepted(e)) {
          const last = e.path[e.path.length - 1]!
          RUNE_FX.defense.interceptImpact?.(e, api.cx(last.col, last.row), api.cy(last.col, last.row), api)
        }
        mod.impact?.(re, api)
      }
    }
  }
  return { sounds: api.sounds, shakes: api.shakes, particles: particleCount(), own }
}

beforeEach(() => {
  blurViolations = []
  resetVfx()
  __setQualityTier('high')
})

describe('the registry', () => {
  it('has one module per rune type, keyed by its own type, with a full palette', () => {
    for (const t of RUNE_TYPES) {
      const m = RUNE_FX[t]
      expect(m, t).toBeDefined()
      expect(m.type).toBe(t)
      for (const k of ['core', 'hot', 'deep', 'accent'] as const) {
        expect(m.palette[k], `${t}.palette.${k}`).toMatch(/^(#[0-9a-f]{3,8}|rgba?\(.+\))$/i)
      }
    }
  })

  it('has a scenario for every rune', () => {
    for (const t of RUNE_TYPES) expect(SCENARIOS.some((s) => s.rune === t), t).toBe(true)
  })
})

describe('every scenario, every tier', () => {
  for (const sc of SCENARIOS) {
    it(`${sc.id} plays at every tier without throwing, blurring, or going silent`, () => {
      for (const [tier, name] of TIERS) {
        resetVfx()
        __setQualityTier(name)
        const r = play(sc.id, tier)
        expect(r.own, `${sc.id} produced no ${sc.rune} event — the scenario is broken`).toBeGreaterThan(0)
        expect(r.sounds.length, `${sc.id} made no sound at tier ${name}`).toBeGreaterThan(0)
      }
      expect(blurViolations, `${sc.id}: shadowBlur / filter set`).toEqual([])
    })
  }
})

// Live particles one scenario may leave in the pool at the top tier. A board
// resolves up to ~8 of these at once, and the pool holds 900.
const BUDGET_HIGH = 420
const BUDGET_BIG = 640
const BIG = new Set(['nuker-nuke', 'mage-lv2', 'cleave-fan'])

describe('particle budgets', () => {
  for (const sc of SCENARIOS) {
    it(`${sc.id} stays inside its budget, and spends less on a weaker device`, () => {
      __setQualityTier('high')
      resetVfx()
      const high = play(sc.id, 2).particles
      expect(high, `${sc.id} left ${high} particles at high`).toBeLessThanOrEqual(BIG.has(sc.id) ? BUDGET_BIG : BUDGET_HIGH)
      __setQualityTier('medium')
      resetVfx()
      const medium = play(sc.id, 2).particles
      // The tier multiplier must reach every burst: medium is 0.6 of high.
      if (high > 20) expect(medium, `${sc.id}: medium ${medium} vs high ${high}`).toBeLessThanOrEqual(Math.ceil(high * 0.8))
    })
  }
})
