// ─── The shield's effects: the moments only it owns ─────────────────────────
//
// The contract test (`runeFx.test.ts`) proves every module is total and inside
// its budgets. This file pins the SHIELD's own choreography: a shield stone's
// dome is drawn exactly once whether the blow was stopped by the wall or not,
// every stone it poses is put back, its timing stays inside the contract, and
// its cues say how hard the barrier was hit.

import { beforeEach, describe, expect, it } from 'vitest'
import type { Hit } from '@/game/rules'
import { RUNE_FX, intercepted, type FxApi, type RuneEvent } from '@/use/runeFx'
import { build, type Scenario } from '@/use/runeFx/scenarios'
import type { Shot } from '@/use/runeFx/types'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

interface Rec { sounds: Array<{ id: string; power: number }>; poses: Map<number, [number, number, number, number]>; fills: number; draws: number }

const makeApi = (tier: 0 | 1 | 2 = 2): FxApi & Rec & { now: number } => {
  const rec: Rec = { sounds: [], poses: new Map(), fills: 0, draws: 0 }
  const size = 80
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'fill' || k === 'stroke') return () => { rec.fills++ }
      if (k === 'drawImage') return () => { rec.draws++ }
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop: () => undefined })
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
  const api = {
    ...rec,
    ctx,
    size,
    tier,
    mul: 1,
    canEmit: true,
    now: 0,
    board: { x: 0, y: 0, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col: number) => col * size + size / 2,
    cy: (_c: number, row: number) => row * size + size / 2,
    pose: (id: number, ox: number, oy: number, sx = 1, sy = 1) => { rec.poses.set(id, [ox, oy, sx, sy]) },
    flash: () => undefined,
    shake: () => undefined,
    sound: (id: string, power: number) => { rec.sounds.push({ id, power }) },
    sideColor: () => '#7fd0ff',
    stoneOf: () => '#8a8f9c',
    inkOf: () => '#1b1206',
    art: () => null
  }
  // `fills` / `draws` are read back live off `rec`.
  return Object.defineProperties(api, {
    fills: { get: () => rec.fills },
    draws: { get: () => rec.draws }
  }) as unknown as FxApi & Rec & { now: number }
}

const shotOf = (sc: Scenario): Shot => {
  const e = build(sc).events.find((x) => x.kind === 'shot')
  if (!e || e.kind !== 'shot') throw new Error(`${sc.id} has no shot`)
  return e
}

const P = 'player' as const
const E = 'enemy' as const
const ARROW: Scenario = { id: 't-arrow', rune: 'defense', title: '', runes: [[P, 'defense', 1, 2, 'omni'], [E, 'archer', 1, 0, 'down']], keep: ['defense', 'archer'] }
const BEAM: Scenario = { id: 't-beam', rune: 'defense', title: '', runes: [[P, 'defense', 1, 1, 'omni'], [E, 'mage', 0, 0, 'dr']], keep: ['defense', 'mage'] }
const BLADE: Scenario = { id: 't-blade', rune: 'defense', title: '', runes: [[P, 'defense', 1, 2, 'omni'], [E, 'melee', 1, 1, 'down']], keep: ['defense', 'melee'] }
const BLADE_FULL: Scenario = { id: 't-blade-full', rune: 'defense', title: '', runes: [[P, 'defense', 1, 3, 'omni', 2], [P, 'defense', 1, 2, 'omni'], [E, 'melee', 1, 1, 'down']], keep: ['defense', 'melee'] }
const CLEAVE: Scenario = { id: 't-cleave', rune: 'defense', title: '', runes: [[P, 'defense', 1, 1, 'omni'], [E, 'cleave', 1, 0, 'down']], keep: ['defense', 'cleave'] }
const AURA: Scenario = { id: 't-aura', rune: 'defense', title: '', runes: [[P, 'defense', 1, 2, 'omni', 2], [P, 'crown', 0, 2, 'up'], [P, 'crown', 2, 2, 'up'], [P, 'nuker', 1, 3, 'up']] }

/** The renderer's order at a shot's impact: every absorbed hit, then the wall. */
const impactOf = (e: Shot, api: FxApi): void => {
  for (const h of e.hits) {
    if (h.absorbed > 0 || h.amount === 0) RUNE_FX.defense.absorb!(h, api.cx(h.target.col, h.target.row), api.cy(h.target.col, h.target.row), api)
  }
  if (intercepted(e)) {
    const last = e.path[e.path.length - 1]!
    RUNE_FX.defense.interceptImpact!(e, api.cx(last.col, last.row), api.cy(last.col, last.row), api)
  }
}

/** Every frame after the stop, on the renderer's clock, through a tail. */
const wallFrames = (e: Shot, api: FxApi & { now: number }, ms = 700): void => {
  const last = e.path[e.path.length - 1]!
  const x = api.cx(last.col, last.row)
  const y = api.cy(last.col, last.row)
  const window = e.dur * 0.55
  for (let t = 0; t <= ms; t += 16) {
    api.now = t
    RUNE_FX.defense.interceptPaint!(e, Math.min(1, t / window), x, y, api)
  }
}

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('the shield stone draws its dome once', () => {
  for (const sc of [ARROW, BEAM, BLADE, BLADE_FULL]) {
    it(`${sc.id}: an absorb followed by the wall adds nothing of its own`, async () => {
      const e = shotOf(sc)
      expect(intercepted(e)).toBe(true)
      // The wall alone…
      const a = makeApi()
      const last = e.path[e.path.length - 1]!
      RUNE_FX.defense.interceptImpact!(e, a.cx(last.col, last.row), a.cy(last.col, last.row), a)
      await flush()
      const wallOnly = particleCount()
      // …and the renderer's real order: the absorb first, then the wall.
      resetVfx()
      impactOf(e, makeApi())
      await flush()
      expect(particleCount()).toBe(wallOnly)
    })
  }

  it('a blow that is NOT a projectile (an axe) still gets its dome, one frame late', async () => {
    const e = shotOf(CLEAVE)
    expect(intercepted(e)).toBe(false)
    const h = e.hits.find((x) => x.target.type === 'defense')!
    expect(h.absorbed).toBeGreaterThan(0)
    const api = makeApi()
    RUNE_FX.defense.absorb!(h, api.cx(h.target.col, h.target.row), api.cy(h.target.col, h.target.row), api)
    expect(particleCount()).toBe(0)
    await flush()
    expect(particleCount()).toBeGreaterThan(0)
  })

  it('a shielded stone that is not a shield stone blooms at once', () => {
    const hit: Hit = {
      target: { id: 9, side: 'player', faction: null, type: 'crown', col: 1, row: 2, dir: 'up', level: 1, hp: 2, maxHp: 2, shield: 0, atkBonus: 0 } as Hit['target'],
      amount: 0, absorbed: 2, hpAfter: 2
    }
    RUNE_FX.defense.absorb!(hit, 120, 200, makeApi())
    expect(particleCount()).toBeGreaterThan(0)
  })
})

describe('the barrier says how hard it was hit', () => {
  it('a full block plays the absorb at full power, a partial one softer', () => {
    const e = shotOf(BLADE_FULL)
    const h = e.hits.find((x) => x.target.type === 'defense')!
    expect(h.amount).toBe(0)
    const api = makeApi()
    RUNE_FX.defense.absorb!(h, 0, 0, api)
    const partial = { ...h, amount: 1, absorbed: 1 }
    RUNE_FX.defense.absorb!(partial, 0, 0, api)
    expect(api.sounds.map((s) => s.id)).toEqual(['shield', 'shield'])
    expect(api.sounds[0]!.power).toBeGreaterThanOrEqual(0.9)
    expect(api.sounds[1]!.power).toBeLessThan(0.9)
  })

  it('the wall cue is lightest for an arrow, then a beam, heaviest for a parried blade', () => {
    const power = (sc: Scenario): number => {
      const api = makeApi()
      impactOf(shotOf(sc), api)
      return api.sounds.find((s) => s.id === 'intercept')!.power
    }
    const arrow = power(ARROW)
    const beam = power(BEAM)
    const blade = power(BLADE)
    expect(arrow).toBeLessThan(0.75)
    expect(beam).toBeGreaterThanOrEqual(0.75)
    expect(beam).toBeLessThan(0.9)
    expect(blade).toBeGreaterThanOrEqual(0.9)
  })
})

describe('the wall is drawn, and puts the stone back', () => {
  for (const sc of [ARROW, BEAM, BLADE, BLADE_FULL]) {
    it(`${sc.id}: paints a dome at every tier and leaves the shield stone at rest`, () => {
      for (const tier of [2, 1, 0] as const) {
        const e = shotOf(sc)
        const api = makeApi(tier)
        impactOf(e, api)
        wallFrames(e, api)
        const id = e.hits.find((h) => h.target.type === 'defense')!.target.id
        expect(api.poses.get(id), `${sc.id} tier ${tier}`).toEqual([0, 0, 1, 1])
        // With no 2D context every bake is null: tier 1+ still lights its cells (paths), tier 0 falls back to a stroke.
        expect(api.fills, `${sc.id} tier ${tier} drew nothing`).toBeGreaterThan(0)
      }
    })
  }

  it('paints nothing before the stop it belongs to', () => {
    const e = shotOf(ARROW)
    const api = makeApi()
    RUNE_FX.defense.interceptPaint!({ ...e }, 0.5, 120, 200, api)
    expect(api.fills + api.draws).toBe(0)
  })
})

describe('the aura', () => {
  const aura = (): Extract<RuneEvent, { kind: 'aura' }> => {
    const e = build(AURA).events.find((x) => x.kind === 'aura')
    if (!e || e.kind !== 'aura') throw new Error('no aura')
    return e
  }

  it('keeps its timing inside the contract', () => {
    const e = aura()
    const at = RUNE_FX.defense.impactAt!(e)!
    expect(at).toBeGreaterThanOrEqual(0.3)
    expect(at).toBeLessThanOrEqual(0.8)
    expect(RUNE_FX.defense.tailMs!(e)!).toBeLessThanOrEqual(450)
  })

  it('poses the shield and every neighbour, and puts them all back', () => {
    const e = aura()
    const api = makeApi()
    RUNE_FX.defense.start!(e, api)
    const end = 1 + RUNE_FX.defense.tailMs!(e)! / e.dur
    const at = RUNE_FX.defense.impactAt!(e)!
    let hit = false
    for (let p = 0; p <= end; p += 16 / e.dur) {
      RUNE_FX.defense.paint!(e, p, api)
      if (!hit && p >= at) { RUNE_FX.defense.impact!(e, api); hit = true }
    }
    expect(api.sounds.map((s) => s.id)).toEqual(['aura'])
    for (const id of [e.from.id, ...e.to.map((t) => t.id)]) expect(api.poses.get(id), `rune ${id}`).toEqual([0, 0, 1, 1])
  })
})
