// ─── The bow's effects (`runeFx/archer.ts`) ─────────────────────────────────
//
// The shared contract test (`runeFx.test.ts`) proves every module is total,
// blur-free, audible and inside its particle budget. This one pins what is
// particular to the bow: its timing, the stone's acting coming back to rest,
// the arrow leaving a shield's moment to the shield, and the frame path
// building no gradients on the arena canvas.

import { beforeEach, describe, expect, it } from 'vitest'
import { RUNE_FX, intercepted, type FxApi, type RuneEvent } from '@/use/runeFx'
import type { Shot } from '@/use/runeFx/types'
import { SCENARIOS, build, type Scenario } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

interface Rec {
  sounds: { id: string; power: number }[]
  shakes: string[]
  poses: Map<number, [number, number, number, number]>
  stoneCalls: number
  gradients: number
}

const makeCtx = (rec: Rec): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1 }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient' || k === 'createConicGradient') {
        return () => { rec.gradients++; return { addColorStop: () => undefined } }
      }
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
}

const makeApi = (tier: 0 | 1 | 2 = 2): FxApi & { rec: Rec } => {
  const rec: Rec = { sounds: [], shakes: [], poses: new Map(), stoneCalls: 0, gradients: 0 }
  const size = 80
  return {
    rec,
    ctx: makeCtx(rec),
    size,
    tier,
    mul: 1,
    canEmit: true,
    now: 0,
    board: { x: 0, y: 0, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col) => col * size + size / 2,
    cy: (_c, row) => row * size + size / 2,
    pose: (id, ox, oy, sx = 1, sy = 1) => { rec.poses.set(id, [ox, oy, sx, sy]) },
    flash: () => undefined,
    shake: (kind) => { rec.shakes.push(kind) },
    sound: (id, power) => { rec.sounds.push({ id, power }) },
    sideColor: (side) => (side === 'player' ? '#4aa8ff' : '#8dff5a'),
    stoneOf: () => { rec.stoneCalls++; return '#8a8f9c' },
    inkOf: () => '#1b1206',
    art: () => null
  }
}

const bowShot = (sc: Scenario): Shot => {
  const e = build(sc).events.find((x) => x.kind === 'shot' && x.from.type === 'archer')
  if (!e || e.kind !== 'shot') throw new Error(`${sc.id}: no arrow`)
  return e
}
const scenario = (id: string): Scenario => SCENARIOS.find((s) => s.id === id)!

/** The renderer's own sequence: start, paint every frame through the tail, impact once at `impactAt`. */
const play = (e: Shot, api: FxApi): void => {
  const mod = RUNE_FX.archer
  const ia = mod.impactAt?.(e) ?? 0.6
  const end = 1 + (mod.tailMs?.(e) ?? 220) / e.dur
  mod.start?.(e, api)
  let hit = false
  for (let p = 0; p <= end; p += 1000 / 60 / e.dur) {
    if (!hit && p >= ia) { mod.impact?.(e, api); hit = true }
    mod.paint?.(e, p, api)
  }
}

const P = 'player' as const
const E = 'enemy' as const

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('the bow', () => {
  it('lands its blow inside the contract window and keeps its tail short', () => {
    const e = bowShot(scenario('archer-hit'))
    const ia = RUNE_FX.archer.impactAt!(e)!
    expect(ia).toBeGreaterThanOrEqual(0.3)
    expect(ia).toBeLessThanOrEqual(0.8)
    expect(RUNE_FX.archer.tailMs!(e)!).toBeLessThanOrEqual(450)
    const heal = build(scenario('support-heal')).events.find((x) => x.kind === 'heal') as RuneEvent
    expect(RUNE_FX.archer.impactAt!(heal)).toBeUndefined()
  })

  it('draws, looses and strikes: its two cues, a small shake, and the stone back at rest', () => {
    const e = bowShot(scenario('archer-hit'))
    const api = makeApi()
    play(e, api)
    expect(api.rec.sounds.map((s) => s.id)).toEqual(['arrow', 'arrowHit'])
    expect(api.rec.shakes).toEqual(['small'])
    expect(api.rec.poses.get(e.from.id)).toEqual([0, 0, 1, 1])
    expect(particleCount()).toBeGreaterThan(20)
  })

  it('a killing arrow hits hardest', () => {
    const api = makeApi()
    play(bowShot(scenario('archer-kill')), api)
    expect(api.rec.sounds.find((s) => s.id === 'arrowHit')!.power).toBeGreaterThanOrEqual(0.95)
  })

  it('leaves a shield\'s moment to the shield: no chips, only a glance', () => {
    const e = bowShot(scenario('defense-intercept'))
    expect(intercepted(e)).toBe(true)
    const api = makeApi()
    play(e, api)
    expect(api.rec.stoneCalls, 'chips were cut from the shield').toBe(0)
    const hit = api.rec.sounds.find((s) => s.id === 'arrowHit')!
    expect(hit.power).toBeLessThan(0.4)
    expect(api.rec.shakes).toEqual([])
  })

  it('looses into an empty lane and buries itself in the floor', () => {
    const api = makeApi()
    play(bowShot({ id: 't-miss', rune: 'archer', title: '', runes: [[P, 'archer', 0, 3, 'up']] }), api)
    const hit = api.rec.sounds.find((s) => s.id === 'arrowHit')
    expect(hit, 'a miss still lands somewhere').toBeDefined()
    expect(hit!.power).toBeGreaterThan(0.4)
    expect(hit!.power).toBeLessThan(0.6)
  })

  it('fired off the board edge: flies and thins away, no landing', () => {
    const e = bowShot({ id: 't-out', rune: 'archer', title: '', runes: [[P, 'archer', 3, 1, 'right']] })
    expect(e.path).toEqual([])
    const api = makeApi()
    play(e, api)
    expect(api.rec.sounds.map((s) => s.id)).toEqual(['arrow'])
  })

  it('a Lv 2 bow pierces both stones it strikes', () => {
    const e = bowShot({ id: 't-lv2', rune: 'archer', title: '', runes: [[P, 'archer', 1, 3, 'up', 2], [E, 'crown', 1, 1, 'down', 1], [E, 'crown', 1, 0, 'down', 2]] })
    expect(e.hits.length).toBe(2)
    const api = makeApi()
    play(e, api)
    // One chip burst per stone struck.
    expect(api.rec.stoneCalls).toBe(2)
  })

  it('builds no gradient on the arena canvas, at any tier', () => {
    for (const tier of [2, 1, 0] as const) {
      const api = makeApi(tier)
      play(bowShot(scenario('archer-hit')), api)
      play(bowShot(scenario('defense-intercept')), api)
      expect(api.rec.gradients, `tier ${tier}`).toBe(0)
    }
  })
})
