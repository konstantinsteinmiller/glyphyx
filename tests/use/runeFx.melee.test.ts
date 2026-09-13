// ─── The sword's effects: its contract, beyond the shared one ───────────────
//
// `runeFx.test.ts` already plays every scenario at every tier for totality,
// blur and budget. This pins what is particular to the sword: when its blow
// lands, that it hands its stones back where it found them (the swinging
// sword AND the stone its Lv 2 shove moved), that a blow a shield turns
// throws no stone chips, and that the per-frame path builds no gradient on
// the arena's context.

import { beforeEach, describe, expect, it } from 'vitest'
import type { ResolveEvent } from '@/game/rules'
import { RUNE_FX, type FxApi, type RuneEvent } from '@/use/runeFx'
import { build, type Scenario } from '@/use/runeFx/scenarios'
import { __setQualityTier, resetVfx } from '@/use/useVfx'

interface Poses { [id: number]: [number, number, number, number] }
interface Rec { sounds: string[]; shakes: string[]; poses: Poses; stone: number; gradients: number }

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

const eventsOf = (sc: Scenario): ResolveEvent[] => build(sc).events

/** Play one event the way the renderer does: start, paint every ~frame into the tail, impact at its moment. */
const play = (e: ResolveEvent, api: FxApi & Rec): void => {
  const m = RUNE_FX.melee
  const re = e as RuneEvent
  const ia = m.impactAt?.(re) ?? (e.kind === 'knockback' ? 1 : 0.45)
  const tail = m.tailMs?.(re) ?? 220
  const end = 1 + tail / e.dur
  m.start?.(re, api)
  let hit = false
  for (let p = 0; p <= end + 1e-9; p += 0.04) {
    if (!hit && p >= ia) { hit = true; m.impact?.(re, api) }
    m.paint?.(re, p, api)
  }
}

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('sword timing', () => {
  it('lands its blow inside the contract window and keeps its tails short', () => {
    const [shot] = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 2, 'up'], [E, 'crown', 1, 1, 'down', 2]] })
    const ia = RUNE_FX.melee.impactAt?.(shot as RuneEvent)
    expect(ia).toBeGreaterThanOrEqual(0.3)
    expect(ia).toBeLessThanOrEqual(0.8)
    expect(RUNE_FX.melee.tailMs?.(shot as RuneEvent)).toBeLessThanOrEqual(450)
  })

  it('lands the blade BEFORE its own Lv 2 shove starts', () => {
    const evs = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 2, 'up', 2], [E, 'crown', 1, 1, 'down', 3]] })
    const shot = evs.find((e) => e.kind === 'shot')!
    const kb = evs.find((e) => e.kind === 'knockback')!
    expect(kb).toBeDefined()
    const blow = shot.at + shot.dur * (RUNE_FX.melee.impactAt?.(shot as RuneEvent) ?? 0.45)
    expect(blow).toBeLessThanOrEqual(kb.at)
    expect(RUNE_FX.melee.tailMs?.(kb as RuneEvent)).toBeLessThanOrEqual(450)
  })
})

describe('sword acting', () => {
  it('hands the swinging stone back at (0, 0, 1, 1), and lunges TOWARD its target', () => {
    for (const dir of ['up', 'down', 'left', 'right'] as const) {
      const [col, row, tc, tr] = dir === 'up' ? [1, 2, 1, 1] : dir === 'down' ? [1, 1, 1, 2] : dir === 'left' ? [2, 1, 1, 1] : [1, 1, 2, 1]
      const [shot] = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', col, row, dir], [E, 'crown', tc, tr, 'down', 3]] })
      if (shot?.kind !== 'shot') throw new Error('no shot')
      const api = makeApi()
      // Mid-lunge, the offset points at the target.
      RUNE_FX.melee.paint?.(shot as RuneEvent, 0.45, api)
      const [ox, oy] = api.poses[shot.from.id]!
      expect(Math.sign(Math.round(ox)), dir).toBe(Math.sign(tc - col))
      expect(Math.sign(Math.round(oy)), dir).toBe(Math.sign(tr - row))
      play(shot, api)
      expect(api.poses[shot.from.id], dir).toEqual([0, 0, 1, 1])
    }
  })

  it('leaves a shoved stone at rest on its new tile (the renderer keeps writing the slide through the tail)', () => {
    const evs = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 2, 'up', 2], [E, 'crown', 1, 1, 'down', 3]] })
    const kb = evs.find((e) => e.kind === 'knockback')!
    if (kb.kind !== 'knockback') throw new Error('no knockback')
    const api = makeApi()
    play(kb, api)
    expect(api.poses[kb.rune.id]).toEqual([0, 0, 1, 1])
    expect(api.sounds).toContain('knockback')
  })
})

describe('sword impacts', () => {
  it('cuts stone: a slash, a hit, a small shake and chips of the target', () => {
    const [shot] = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 2, 'up'], [E, 'crown', 1, 1, 'down', 2]] })
    const api = makeApi()
    play(shot!, api)
    expect(api.sounds).toEqual(['slash', 'slashHit'])
    expect(api.shakes).toEqual(['small'])
    expect(api.stone).toBeGreaterThan(0)
  })

  it('throws no stone chips when a SHIELD stone stops the blade (the shield draws that wall)', () => {
    const evs = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 2, 'up'], [E, 'defense', 1, 1, 'down']] })
    const shot = evs.find((e) => e.kind === 'shot' && e.from.type === 'melee')!
    const api = makeApi()
    play(shot, api)
    expect(api.sounds).toContain('slashHit')
    expect(api.stone).toBe(0)
  })

  it('swings at nothing without a hit sound or a shake', () => {
    const [shot] = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 0, 'up'], [E, 'crown', 3, 3, 'down']] })
    if (shot?.kind !== 'shot') throw new Error('no shot')
    expect(shot.path.length).toBe(0)
    const api = makeApi()
    play(shot, api)
    expect(api.sounds).toEqual(['slash'])
    expect(api.shakes).toEqual([])
  })

  it('builds no gradient on the arena context, at any tier (light is baked)', () => {
    for (const tier of [2, 1, 0] as const) {
      const evs = eventsOf({ id: 't', rune: 'melee', title: '', runes: [[P, 'melee', 1, 2, 'up', 2], [E, 'crown', 1, 1, 'down', 3]] })
      const api = makeApi(tier)
      for (const e of evs) if (e.kind === 'shot' || e.kind === 'knockback') play(e, api)
      expect(api.gradients, `tier ${tier}`).toBe(0)
    }
  })
})
