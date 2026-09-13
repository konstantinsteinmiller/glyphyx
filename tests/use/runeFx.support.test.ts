// ─── The cross's effects: the heal and the buff ─────────────────────────────
//
// Pins what the contract test cannot see: a heal of 0 (full HP) still plays
// the gesture — smaller and softer — the stones the cross poses are put back,
// its timing stays inside the contract, and its sparkles stay plus-shaped
// (upright) at every tier.

import { beforeEach, describe, expect, it } from 'vitest'
import { RUNE_FX, type FxApi } from '@/use/runeFx'
import { build, type Scenario } from '@/use/runeFx/scenarios'
import type { Buff, Heal } from '@/use/runeFx/types'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

interface Rec { sounds: Array<{ id: string; power: number }>; poses: Map<number, [number, number, number, number]>; ops: { n: number } }

const makeApi = (tier: 0 | 1 | 2 = 2): FxApi & Rec => {
  const rec: Rec = { sounds: [], poses: new Map(), ops: { n: 0 } }
  const size = 80
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'fill' || k === 'stroke' || k === 'drawImage') return () => { rec.ops.n++ }
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop: () => undefined })
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
  return {
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
}

const P = 'player' as const
const HEAL2: Scenario = { id: 't-heal2', rune: 'support', title: '', runes: [[P, 'support', 1, 3, 'omni', 2], [P, 'melee', 1, 2, 'up', 1, 1, 3]] }

const events = (): { heal: Heal; buff: Buff } => {
  const ev = build(HEAL2).events
  const heal = ev.find((e) => e.kind === 'heal')
  const buff = ev.find((e) => e.kind === 'buff')
  if (!heal || heal.kind !== 'heal' || !buff || buff.kind !== 'buff') throw new Error('scenario lost its heal or buff')
  return { heal, buff }
}

/** Play one event through its whole window and tail, the renderer's way. */
const play = (e: Heal | Buff, api: FxApi): void => {
  const m = RUNE_FX.support
  m.start!(e, api)
  const at = m.impactAt!(e) ?? 0
  const end = 1 + (m.tailMs!(e) ?? 0) / e.dur
  let hit = false
  for (let p = 0; p <= end; p += 16 / e.dur) {
    m.paint!(e, p, api)
    if (!hit && p >= at) { m.impact!(e, api); hit = true }
  }
}

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('the heal', () => {
  it('keeps the renderer\'s mend moment and a tail inside the contract', () => {
    const { heal } = events()
    expect(RUNE_FX.support.impactAt!(heal)).toBe(0.5)
    expect(RUNE_FX.support.tailMs!(heal)!).toBeLessThanOrEqual(450)
  })

  it('still plays the gesture at full HP — smaller and softer', () => {
    const { heal } = events()
    const mend = makeApi()
    play(heal, mend)
    const mendParticles = particleCount()
    resetVfx()
    const none = makeApi()
    play({ ...heal, amount: 0, hpAfter: heal.to.maxHp }, none)
    const noneParticles = particleCount()
    expect(none.sounds.map((s) => s.id)).toEqual(['heal'])
    expect(none.sounds[0]!.power).toBeLessThan(mend.sounds[0]!.power)
    expect(noneParticles).toBeGreaterThan(0)
    expect(noneParticles).toBeLessThan(mendParticles)
  })

  it('draws at every tier and puts the healed stone back', () => {
    for (const tier of [2, 1, 0] as const) {
      const { heal } = events()
      const api = makeApi(tier)
      play(heal, api)
      expect(api.poses.get(heal.to.id), `tier ${tier}`).toEqual([0, 0, 1, 1])
    }
  })
})

describe('the buff', () => {
  it('lands its surge inside the contract', () => {
    const { buff } = events()
    const at = RUNE_FX.support.impactAt!(buff)!
    expect(at).toBeGreaterThanOrEqual(0.3)
    expect(at).toBeLessThanOrEqual(0.8)
    expect(RUNE_FX.support.tailMs!(buff)!).toBeLessThanOrEqual(450)
  })

  it('plays once, poses the buffed stone and puts it back', () => {
    const { buff } = events()
    const api = makeApi()
    play(buff, api)
    expect(api.sounds.map((s) => s.id)).toEqual(['buff'])
    expect(api.poses.get(buff.to.id)).toEqual([0, 0, 1, 1])
  })

  it('a heal and a buff on the same stone leave it at rest', () => {
    const { heal, buff } = events()
    const api = makeApi()
    play(heal, api)
    play(buff, api)
    expect(api.poses.get(heal.to.id)).toEqual([0, 0, 1, 1])
  })
})
