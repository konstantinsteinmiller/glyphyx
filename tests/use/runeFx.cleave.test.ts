// ─── The axe's effects: its contract, beyond the shared one ─────────────────
//
// `runeFx.test.ts` plays every scenario at every tier for totality, blur and
// budget. This pins what is particular to the axe: its later, wound-up blow
// stays inside the contract window, the stone hauls BACK before it lunges
// along its facing and is handed back at rest, a full fan shakes hard, every
// tile of the fan takes the slam (an empty one too), and the per-frame path
// builds no gradient on the arena's context.

import { beforeEach, describe, expect, it } from 'vitest'
import type { ResolveEvent } from '@/game/rules'
import { RUNE_FX, type FxApi, type RuneEvent } from '@/use/runeFx'
import { build, type Scenario } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

interface Rec { sounds: string[]; shakes: string[]; poses: Record<number, [number, number, number, number]>; stone: number; gradients: number }

const makeApi = (tier: 0 | 1 | 2 = 2): FxApi & Rec => {
  const rec: Rec = { sounds: [], shakes: [], poses: {}, stone: 0, gradients: 0 }
  const size = 80
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => { rec.gradients++; return { addColorStop: () => undefined } }
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
  const api = {
    ctx, size, tier, mul: 1, canEmit: true, now: 0,
    board: { x: 0, y: 0, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col: number) => col * size + size / 2,
    cy: (_c: number, row: number) => row * size + size / 2,
    pose: (id: number, ox: number, oy: number, sx?: number, sy?: number) => { rec.poses[id] = [ox, oy, sx ?? 1, sy ?? 1] },
    flash: () => undefined,
    shake: (k: string) => { rec.shakes.push(k) },
    sound: (id: string) => { rec.sounds.push(id) },
    sideColor: () => '#7fd0ff',
    stoneOf: () => { rec.stone++; return '#8a8f9c' },
    inkOf: () => '#1b1206',
    art: () => null
  }
  return Object.assign(rec, api) as unknown as FxApi & Rec
}

const P = 'player' as const
const E = 'enemy' as const

const shotOf = (sc: Scenario): Extract<ResolveEvent, { kind: 'shot' }> => {
  const e = build(sc).events.find((x) => x.kind === 'shot' && x.from.type === 'cleave')
  if (!e || e.kind !== 'shot') throw new Error('no axe shot')
  return e
}

const play = (e: ResolveEvent, api: FxApi & Rec): void => {
  const m = RUNE_FX.cleave
  const re = e as RuneEvent
  const ia = m.impactAt?.(re) ?? 0.48
  const end = 1 + (m.tailMs?.(re) ?? 220) / e.dur
  m.start?.(re, api)
  let hit = false
  for (let p = 0; p <= end + 1e-9; p += 0.04) {
    if (!hit && p >= ia) { hit = true; m.impact?.(re, api) }
    m.paint?.(re, p, api)
  }
}

const FAN: Scenario = {
  id: 't', rune: 'cleave', title: '',
  runes: [[P, 'cleave', 1, 2, 'up'], [E, 'crown', 0, 1, 'down', 2], [E, 'nuker', 1, 1, 'down', 1], [E, 'crown', 2, 1, 'down', 1]]
}

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('axe timing', () => {
  it('lands later than a blade — the wind-up is the point — but inside the contract window', () => {
    const shot = shotOf(FAN)
    const ia = RUNE_FX.cleave.impactAt?.(shot as RuneEvent) ?? 0
    expect(ia).toBeGreaterThan(0.45)
    expect(ia).toBeLessThanOrEqual(0.8)
    expect(RUNE_FX.cleave.tailMs?.(shot as RuneEvent)).toBeLessThanOrEqual(450)
  })
})

describe('axe acting', () => {
  it('hauls back against its facing, lunges along it, and is handed back at rest', () => {
    for (const dir of ['up', 'down', 'left', 'right'] as const) {
      const shot = shotOf({ id: 't', rune: 'cleave', title: '', runes: [[P, 'cleave', 1, 1, dir], [E, 'crown', 3, 3, 'down']] })
      const [fx, fy] = dir === 'up' ? [0, -1] : dir === 'down' ? [0, 1] : dir === 'left' ? [-1, 0] : [1, 0]
      const api = makeApi()
      const along = (): number => { const [ox, oy] = api.poses[shot.from.id]!; return ox * fx + oy * fy }
      RUNE_FX.cleave.paint?.(shot as RuneEvent, 0.28, api)
      expect(along(), `${dir} wind-up`).toBeLessThan(0)
      RUNE_FX.cleave.paint?.(shot as RuneEvent, 0.6, api)
      expect(along(), `${dir} lunge`).toBeGreaterThan(0)
      play(shot, api)
      expect(api.poses[shot.from.id], dir).toEqual([0, 0, 1, 1])
    }
  })
})

describe('axe impacts', () => {
  it('slams a full fan: its cues, a STRONG shake, and burning chips off every stone it hit', () => {
    const shot = shotOf(FAN)
    expect(shot.hits.length).toBe(3)
    const api = makeApi()
    play(shot, api)
    expect(api.sounds).toEqual(['cleave', 'cleaveHit'])
    expect(api.shakes).toEqual(['strong'])
    expect(api.stone).toBe(3)
  })

  it('still slams the ground of an empty fan (sparks and grit, a lighter shake)', () => {
    const shot = shotOf({ id: 't', rune: 'cleave', title: '', runes: [[P, 'cleave', 1, 2, 'up'], [E, 'crown', 3, 3, 'down']] })
    expect(shot.hits.length).toBe(0)
    const api = makeApi()
    play(shot, api)
    expect(api.sounds).toEqual(['cleave', 'cleaveHit'])
    expect(api.shakes).toEqual(['small'])
    expect(particleCount()).toBeGreaterThan(0)
  })

  it('builds no gradient on the arena context, at any tier (light is baked)', () => {
    for (const tier of [2, 1, 0] as const) {
      const api = makeApi(tier)
      play(shotOf(FAN), api)
      play(shotOf({ id: 't', rune: 'cleave', title: '', runes: [[P, 'cleave', 0, 2, 'up', 2], [E, 'crown', 0, 1, 'down', 3]] }), api)
      expect(api.gradients, `tier ${tier}`).toBe(0)
    }
  })
})
