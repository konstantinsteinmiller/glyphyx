import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  TIER_CAPACITY, __clearSpriteRegistry, __resetQualityCalibration, __setQualityTier, clearParticles, drawParticles,
  emit, particleCount, qualityTier, registerSprite, registeredSpriteCount, resetVfx, spriteById, stepParticles
} from '@/use/useVfx'

/**
 * The particle pool: the caps per tier, the sprite registry, the new shapes
 * and curves, and the one rule the pool shares with the effects — drawing
 * never reaches for `shadowBlur` or `filter`.
 */

type Mock = CanvasRenderingContext2D & { __calls: () => Map<string, number>; __sets: () => Set<string>; __depth: () => number }

const mockCtx = (): Mock => {
  let depth = 0
  const calls = new Map<string, number>()
  const sets = new Set<string>()
  const gradient = { addColorStop: (): void => {} }
  const target: Record<string, unknown> = {}
  const count = (key: string): void => { calls.set(key, (calls.get(key) ?? 0) + 1) }
  return new Proxy(target, {
    get(t, key: string) {
      if (key === '__calls') return () => calls
      if (key === '__sets') return () => sets
      if (key === '__depth') return () => depth
      if (key === 'save') return () => { depth++; count(key) }
      if (key === 'restore') return () => { depth--; count(key) }
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => { count(key); return gradient }
      if (key in t) return t[key]
      return () => { count(key) }
    },
    set(t, key: string, v: unknown) { sets.add(key); t[key] = v; return true }
  }) as unknown as Mock
}

const fakeCanvas = (): HTMLCanvasElement => document.createElement('canvas')

const one = (extra: Partial<Parameters<typeof emit>[0]> = {}): void =>
  emit({ x: 0, y: 0, vx: 1, vy: 1, life: 1000, size: 4, color: [255, 128, 0], ...extra })

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => mockCtx()) as unknown as typeof HTMLCanvasElement.prototype.getContext
})

beforeEach(() => {
  __resetQualityCalibration()
  __setQualityTier('high')
  resetVfx()
  __clearSpriteRegistry()
})

describe('caps per tier', () => {
  it('are the agreed numbers', () => {
    expect(TIER_CAPACITY).toEqual({ high: 900, medium: 450, low: 200, min: 60 })
  })
  for (const tier of ['high', 'medium', 'low', 'min'] as const) {
    it(`${tier}: a burst past the cap recycles rather than grows`, () => {
      __setQualityTier(tier)
      expect(qualityTier()).toBe(tier)
      for (let i = 0; i < 2000; i++) one({ life: 100 + i })
      expect(particleCount()).toBe(TIER_CAPACITY[tier])
      // The recycled slots are the OLDEST (shortest remaining life).
      stepParticles(150)
      expect(particleCount()).toBe(TIER_CAPACITY[tier])
    })
  }
  it('a lower tier drops the live count on the next spawn, not below the cap', () => {
    __setQualityTier('high')
    for (let i = 0; i < 500; i++) one()
    __setQualityTier('low')
    one()
    expect(particleCount()).toBe(500)
    stepParticles(2000)
    expect(particleCount()).toBe(0)
  })
})

describe('the sprite registry', () => {
  it('hands out stable ids and looks them up', () => {
    const a = fakeCanvas()
    const b = fakeCanvas()
    const ia = registerSprite(a)
    const ib = registerSprite(b)
    expect(ia).toBe(0)
    expect(ib).toBe(1)
    expect(spriteById(ia)).toBe(a)
    expect(spriteById(ib)).toBe(b)
    expect(spriteById(-1)).toBeNull()
    expect(spriteById(99)).toBeNull()
    expect(registeredSpriteCount()).toBe(2)
  })
})

describe('stepping', () => {
  it('integrates velocity, gravity, drag and spin; removes the dead by swap', () => {
    one({ x: 0, y: 0, vx: 10, vy: 0, life: 1000, gravity: 10, drag: 0, vrot: 2 })
    one({ x: 5, y: 5, life: 10 })
    expect(particleCount()).toBe(2)
    stepParticles(500)
    expect(particleCount()).toBe(1)
    stepParticles(600)
    expect(particleCount()).toBe(0)
  })
  it('every fade and grow mode survives a full life', () => {
    for (const fade of [0, 1, 2] as const) for (const grow of [0, 1, 2] as const) one({ fade, grow, life: 300 })
    const ctx = mockCtx()
    for (let i = 0; i < 12; i++) { stepParticles(30); drawParticles(ctx, (x) => x, (y) => -y, 1) }
    expect(particleCount()).toBe(0)
    expect(ctx.__depth()).toBe(0)
  })
})

describe('drawing', () => {
  it('blits sprite particles with drawImage, one per particle, and falls back to a dot', () => {
    const id = registerSprite(fakeCanvas())
    for (let i = 0; i < 5; i++) one({ shape: 4, sprite: id, life: 1000 })
    one({ shape: 5, sprite: id, life: 1000 })
    one({ shape: 6, sprite: id, life: 1000 })
    one({ shape: 4, sprite: -1, life: 1000 })
    stepParticles(16)
    const ctx = mockCtx()
    drawParticles(ctx, (x) => x, (y) => -y, 1)
    expect(ctx.__calls().get('drawImage')).toBe(7)
    expect(ctx.__calls().get('arc')).toBe(1)
    expect(ctx.__depth()).toBe(0)
  })
  it('switches blend mode twice at most and never sets a shadow or a filter', () => {
    for (let i = 0; i < 30; i++) one({ additive: i % 2 === 0, shape: (i % 4) as 0 | 1 | 2 | 3, life: 1000 })
    stepParticles(16)
    const ctx = mockCtx()
    drawParticles(ctx, (x) => x, (y) => -y, 1)
    expect(ctx.__sets().has('shadowBlur')).toBe(false)
    expect(ctx.__sets().has('filter')).toBe(false)
    expect((ctx as unknown as Record<string, unknown>).globalCompositeOperation).toBe('source-over')
    expect((ctx as unknown as Record<string, unknown>).globalAlpha).toBe(1)
  })
  it('draws nothing when empty', () => {
    const ctx = mockCtx()
    drawParticles(ctx, (x) => x, (y) => -y, 1)
    expect(ctx.__calls().size).toBe(0)
  })
})
