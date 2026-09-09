import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  bakeSprite, bakedSpriteCount, blit, bucketFor, chipSprite, clearFxSprites, confettiSprite, coreSprite, crackSprite,
  domeSprite, glintSprite, glowSprite, glyphShardSprite, hash01, hexRgb, hexSprite, mix, moteSprite, paintArrow,
  paintArrowImpact, paintAuraLink, paintBeam, paintBoulder, paintBuffGlint, paintCaptureWave, paintCleaveArc,
  paintClashFlash, paintCrossBurst,
  paintGlow, paintHealFlare, paintKnockbackStreak, paintLanding, paintMergeRing, paintPopText, paintRing,
  paintNukeFlash, paintNukeWave,
  paintShellArc, paintShellBurst, paintShieldDome, paintShockwave, paintSlash, qualityMul, rgba, ringSprite,
  spawnArrowTrail, spawnBeamCrackle,
  spawnBuffGlint, spawnBurstMotes, spawnCaptureSparks, spawnChips, spawnDefeatAsh, spawnEmbers, spawnHealMotes,
  spawnImpactSparks, spawnKnockbackDust, spawnMergeFountain, spawnRollDust, spawnShatter, spawnShieldShards, spawnTileDust,
  spawnVictoryShower, streakSprite
} from '@/use/arenaFx'
import {
  TIER_CAPACITY, __clearSpriteRegistry, __setQualityTier, clearParticles, particleCount, registeredSpriteCount
} from '@/use/useVfx'
import { RUNE_TYPES } from '@/game/rules'

/**
 * jsdom has no rasteriser. The effects are exercised against a RECORDING
 * context that counts every call, tracks save/restore depth and — the point of
 * this suite — records every property the painters SET, so the one rule of the
 * module ("never `shadowBlur`, never `filter`") is asserted rather than hoped.
 * The same recorder stands in for offscreen bakes, so a bake yields a real
 * (fake) canvas and the cache can be checked for identity.
 */

type Mock = CanvasRenderingContext2D & {
  __depth: () => number
  __min: () => number
  __calls: () => Map<string, number>
  __sets: () => Set<string>
}

const mockCtx = (): Mock => {
  let depth = 0
  let min = 0
  const calls = new Map<string, number>()
  const sets = new Set<string>()
  const gradient = { addColorStop: (): void => {} }
  const target: Record<string, unknown> = {}
  const count = (key: string): void => { calls.set(key, (calls.get(key) ?? 0) + 1) }
  return new Proxy(target, {
    get(t, key: string) {
      if (key === '__depth') return () => depth
      if (key === '__min') return () => min
      if (key === '__calls') return () => calls
      if (key === '__sets') return () => sets
      if (key === 'save') return () => { depth++; count(key) }
      if (key === 'restore') return () => { depth--; min = Math.min(min, depth); count(key) }
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => { count(key); return gradient }
      if (key === 'measureText') return () => ({ width: 10 })
      if (key in t) return t[key]
      return () => { count(key) }
    },
    set(t, key: string, v: unknown) { sets.add(key); t[key] = v; return true }
  }) as unknown as Mock
}

/** Every bake context made since the last reset, so bakes can be audited too. */
const bakeCtxs: Mock[] = []

beforeAll(() => {
  const g = globalThis as unknown as { Path2D?: unknown }
  if (typeof g.Path2D === 'undefined') g.Path2D = class { constructor(_d?: string) { /* not inspected */ } }
  // Offscreen bakes: hand every canvas a recorder instead of jsdom's `null`.
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
    const c = mockCtx()
    bakeCtxs.push(c)
    return c as unknown as CanvasRenderingContext2D
  } as unknown as typeof HTMLCanvasElement.prototype.getContext
})

beforeEach(() => {
  clearFxSprites()
  __clearSpriteRegistry()
  clearParticles()
  __setQualityTier('high')
  bakeCtxs.length = 0
})

afterEach(() => {
  for (const c of bakeCtxs) {
    expect(c.__sets().has('shadowBlur'), 'a bake set shadowBlur').toBe(false)
    expect(c.__sets().has('filter'), 'a bake set filter').toBe(false)
  }
})

const expectClean = (ctx: Mock): void => {
  expect(ctx.__depth()).toBe(0)
  expect(ctx.__min()).toBe(0)
  expect(ctx.__sets().has('shadowBlur')).toBe(false)
  expect(ctx.__sets().has('shadowColor')).toBe(false)
  expect(ctx.__sets().has('filter')).toBe(false)
}

const SIZE = 80
const TS = [0, 0.001, 0.25, 0.5, 0.75, 0.999, 1]

describe('colour helpers', () => {
  it('parse hex and rgb strings, cached', () => {
    expect(hexRgb('#ff8000')).toEqual([255, 128, 0])
    expect(hexRgb('#f80')).toEqual([255, 136, 0])
    expect(hexRgb('rgb(1, 2, 3)')).toEqual([1, 2, 3])
    expect(hexRgb('rgba(4,5,6,0.5)')).toEqual([4, 5, 6])
    expect(hexRgb('#ff8000')).toBe(hexRgb('#ff8000'))
  })
  it('rgba buckets alpha and mix interpolates', () => {
    expect(rgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)')
    expect(rgba('#ff0000', 2)).toBe('rgba(255,0,0,1)')
    expect(mix('#000000', '#ffffff', 0.5)).toBe('rgb(128,128,128)')
    expect(mix('#000000', '#ffffff', 0)).toBe('rgb(0,0,0)')
  })
  it('hash01 is deterministic and inside [0, 1)', () => {
    for (let i = -50; i < 50; i++) {
      const h = hash01(i)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThan(1)
      expect(hash01(i)).toBe(h)
    }
    expect(hash01(1)).not.toBe(hash01(2))
  })
  it('size buckets are the three sources', () => {
    expect(bucketFor(10)).toBe(48)
    expect(bucketFor(56)).toBe(48)
    expect(bucketFor(57)).toBe(96)
    expect(bucketFor(120)).toBe(96)
    expect(bucketFor(121)).toBe(192)
    expect(bucketFor(1000)).toBe(192)
  })
  it('qualityMul follows the ladder', () => {
    expect(qualityMul('high')).toBe(1)
    expect(qualityMul('medium')).toBeLessThan(1)
    expect(qualityMul('low')).toBeLessThan(qualityMul('medium'))
    expect(qualityMul('min')).toBeLessThan(qualityMul('low'))
  })
})

describe('the bakery', () => {
  it('bakes once per key and hands the same canvas back', () => {
    const a = glowSprite('#ff3b4a', 50)
    const b = glowSprite('#ff3b4a', 40)
    expect(a).not.toBeNull()
    expect(b).toBe(a)
    expect(bakedSpriteCount()).toBe(1)
    const c = glowSprite('#ff3b4a', 150)
    expect(c).not.toBe(a)
    expect(bakedSpriteCount()).toBe(2)
  })
  it('bakes every sprite kind without a shadow or a filter', () => {
    const made = [
      glowSprite('#4aa8ff', 80), coreSprite('#4aa8ff', 48), ringSprite('#ffd24a', 96), ringSprite('#ffd24a', 96, 0.3),
      streakSprite('#35e07a', 96), moteSprite('#35e07a'), domeSprite('#4aa8ff', 96), crackSprite('#ffffff', 96),
      glintSprite('#ffd23f', 48), hexSprite('#4aa8ff', 48), chipSprite('#b39b73'), confettiSprite('#ff3b4a'),
      ...RUNE_TYPES.map((t) => glyphShardSprite(t, '#b39b73', '#2c2218', 0, 6))
    ]
    for (const m of made) expect(m).not.toBeNull()
    expect(bakedSpriteCount()).toBe(made.length)
    expect(bakeCtxs.length).toBe(made.length)
    for (const c of bakeCtxs) expect(c.__depth()).toBe(0)
  })
  it('caches the miss too, and clears on demand', () => {
    const before = bakedSpriteCount()
    const key = 'custom|x'
    const one = bakeSprite(key, 16, () => {})
    const two = bakeSprite(key, 16, () => { throw new Error('never re-run') })
    expect(two).toBe(one)
    expect(bakedSpriteCount()).toBe(before + 1)
    clearFxSprites()
    expect(bakedSpriteCount()).toBe(0)
  })
  it('blit draws a sprite once and skips invisible ones', () => {
    const ctx = mockCtx()
    const spr = glowSprite('#ffffff', 48)
    expect(blit(ctx, spr, 10, 10, 20, 20, 1)).toBe(true)
    expect(ctx.__calls().get('drawImage')).toBe(1)
    expect(blit(ctx, spr, 10, 10, 20, 20, 0)).toBe(false)
    expect(blit(ctx, null, 10, 10, 20, 20, 1)).toBe(false)
    expect(ctx.__calls().get('drawImage')).toBe(1)
    expectClean(ctx)
  })
})

describe('the painters', () => {
  const cells = [{ x: 40, y: 40 }, { x: 120, y: 40 }, { x: 40, y: 120 }]
  const rect = { x: 20, y: 20, w: SIZE, h: SIZE }
  const painters: [string, (ctx: Mock, t: number) => void][] = [
    ['glow', (c) => paintGlow(c, 50, 50, 30, '#ff3b4a', 0.8)],
    ['ring', (c) => paintRing(c, 50, 50, 30, '#ff3b4a', 0.8)],
    ['slash', (c, t) => paintSlash(c, t, 50, 50, SIZE, { angle: 1, color: '#ff3b4a' })],
    ['arrow', (c, t) => paintArrow(c, 50 + t * 40, 50, SIZE, { angle: 0.3, color: '#35e07a', alpha: 1 - t * 0.5 })],
    ['arrow impact', (c, t) => paintArrowImpact(c, t, 50, 50, SIZE, '#35e07a')],
    ['beam', (c, t) => paintBeam(c, 10, 10, 170, 170, SIZE, { color: '#b57bff', env: 1 - t * 0.5, phase: t, seed: 7 })],
    ['beam (zero length)', (c, t) => paintBeam(c, 10, 10, 10, 10, SIZE, { color: '#b57bff', env: t, phase: t })],
    ['cross burst', (c, t) => paintCrossBurst(c, t, cells, SIZE, '#b57bff')],
    ['cleave arc', (c, t) => paintCleaveArc(c, t, 50, 50, SIZE, { angle: -Math.PI / 2, color: '#ff8a2b' })],
    ['cleave arc (lean)', (c, t) => paintCleaveArc(c, t, 50, 50, SIZE, { angle: 0.4, color: '#ff8a2b', reach: 1.2, lean: true })],
    ['boulder', (c, t) => paintBoulder(c, 20 + t * 100, 50, SIZE, { color: '#00d4c8', spin: t * 7, alpha: 1 - t })],
    ['shell arc', (c, t) => paintShellArc(c, t, 20, 200, 180, 40, SIZE, { color: '#ff4fd8' })],
    ['shell arc (lean)', (c, t) => paintShellArc(c, t, 20, 200, 180, 40, SIZE, { color: '#ff4fd8', lean: true })],
    ['shell burst', (c, t) => paintShellBurst(c, t, cells, SIZE, '#ff4fd8')],
    ['dome', (c, t) => paintShieldDome(c, 50, 50, SIZE, { color: '#4aa8ff', alpha: 1 - t, hit: t })],
    ['heal', (c, t) => paintHealFlare(c, t, 50, 50, SIZE, '#ffd23f')],
    ['buff', (c, t) => paintBuffGlint(c, t, 50, 50, SIZE, '#ffd23f')],
    ['merge ring', (c, t) => paintMergeRing(c, t, 50, 50, SIZE)],
    ['shockwave', (c, t) => paintShockwave(c, t, 50, 50, SIZE, '#ffffff')],
    ['nuke wave', (c, t) => paintNukeWave(c, t, 50, 50, SIZE, '#e8ff3d')],
    ['nuke flash', (c, t) => paintNukeFlash(c, t, 0, 0, 300, 300, '#e8ff3d')],
    ['clash', (c, t) => paintClashFlash(c, t, 50, 50, SIZE)],
    ['knockback', (c, t) => paintKnockbackStreak(c, t, 10, 10, 90, 10, SIZE, '#ff3b4a')],
    ['capture', (c, t) => paintCaptureWave(c, t, rect, SIZE, '#4aa8ff')],
    ['pop text', (c, t) => paintPopText(c, t, 50, 50, SIZE, { text: '×3', color: '#ffd24a' })],
    ['aura', (c, t) => paintAuraLink(c, t, { x: 50, y: 50 }, cells, SIZE, '#4aa8ff')],
    ['landing', (c, t) => paintLanding(c, t, 50, 50, SIZE, '#ffffff')]
  ]

  for (const [name, paint] of painters) {
    it(`${name} paints at every t without a throw, balanced, and never blurs`, () => {
      for (const t of TS) {
        const ctx = mockCtx()
        expect(() => paint(ctx, t)).not.toThrow()
        expectClean(ctx)
      }
    })
  }

  it('paints with live gradients when a sprite could not be baked, still without blur', () => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof original
    clearFxSprites()
    try {
      for (const [, paint] of painters) {
        const ctx = mockCtx()
        expect(() => paint(ctx, 0.5)).not.toThrow()
        expectClean(ctx)
      }
      expect(glowSprite('#ffffff', 48)).toBeNull()
      const ctx = mockCtx()
      paintGlow(ctx, 5, 5, 10, '#ffffff', 1)
      expect(ctx.__calls().get('createRadialGradient')).toBe(1)
      expect(ctx.__calls().get('drawImage') ?? 0).toBe(0)
    } finally {
      HTMLCanvasElement.prototype.getContext = original
    }
  })

  it('a painted glow is one drawImage, not a gradient', () => {
    const ctx = mockCtx()
    paintGlow(ctx, 5, 5, 10, '#ff3b4a', 1)
    expect(ctx.__calls().get('drawImage')).toBe(1)
    expect(ctx.__calls().get('createRadialGradient') ?? 0).toBe(0)
  })
})

describe('the spawners', () => {
  it('each spawner adds particles and registers its sprites once', () => {
    const spawners: [string, () => void][] = [
      ['impact sparks', () => spawnImpactSparks(50, 50, SIZE, '#ff3b4a', 1)],
      ['tile dust', () => spawnTileDust(50, 50, SIZE)],
      ['chips', () => spawnChips(50, 50, SIZE, '#b39b73', 1)],
      ['arrow trail', () => spawnArrowTrail(50, 50, 1, 0, SIZE, '#35e07a')],
      ['beam crackle', () => spawnBeamCrackle(0, 0, 100, 100, SIZE, '#b57bff')],
      ['burst motes', () => spawnBurstMotes(50, 50, SIZE, '#b57bff')],
      ['shield shards', () => spawnShieldShards(50, 50, SIZE, '#4aa8ff')],
      ['heal motes', () => spawnHealMotes(50, 50, SIZE, '#ffd23f')],
      ['buff glint', () => spawnBuffGlint(50, 50, SIZE, '#ffd23f')],
      ['merge fountain', () => spawnMergeFountain(50, 50, SIZE)],
      ['shatter', () => spawnShatter('melee', 50, 50, SIZE, '#b39b73', '#2c2218', '#ff3b4a')],
      ['knockback dust', () => spawnKnockbackDust(50, 50, 1, 0, SIZE)],
      ['roll dust', () => spawnRollDust(50, 50, 1, 0, SIZE)],
      ['capture sparks', () => spawnCaptureSparks(50, 50, SIZE, '#4aa8ff')],
      ['victory shower', () => spawnVictoryShower(0, 0, 300, 300, SIZE, ['#ffd24a', '#ff3b4a'])],
      ['defeat ash', () => spawnDefeatAsh(0, 0, 300, 300, SIZE)],
      ['embers', () => spawnEmbers(50, 50, SIZE, '#ff9a4a')]
    ]
    for (const [name, spawn] of spawners) {
      clearParticles()
      spawn()
      expect(particleCount(), name).toBeGreaterThan(0)
      const registered = registeredSpriteCount()
      spawn()
      expect(registeredSpriteCount(), `${name} re-registered a sprite`).toBe(registered)
    }
  })

  it('spawns fewer particles on a lower tier and never past the cap', () => {
    __setQualityTier('high')
    clearParticles()
    spawnShatter('mage', 50, 50, SIZE, '#b39b73', '#2c2218', '#b57bff')
    const high = particleCount()
    __setQualityTier('min')
    clearParticles()
    spawnShatter('mage', 50, 50, SIZE, '#b39b73', '#2c2218', '#b57bff')
    const min = particleCount()
    expect(min).toBeLessThan(high)
    expect(min).toBeLessThanOrEqual(TIER_CAPACITY.min)
    for (let i = 0; i < 40; i++) spawnVictoryShower(0, 0, 300, 300, SIZE, ['#ffd24a'])
    expect(particleCount()).toBeLessThanOrEqual(TIER_CAPACITY.min)
  })

  it('a scaled shatter is thinner but still a shatter, and bakes no extra sprites', () => {
    // The nuke path: up to fifteen stones break inside one 280 ms window, so
    // each of them gets a fraction of the usual burst. It must still emit
    // something (a stone that vanishes with no particles reads as a bug), and
    // it must not bake a SECOND set of shard sprites — the sector count keys
    // that cache, so only the number thrown is allowed to change.
    __setQualityTier('high')
    clearParticles()
    spawnShatter('melee', 50, 50, SIZE, '#b39b73', '#2c2218', '#ff3b4a')
    const full = particleCount()
    const sprites = registeredSpriteCount()

    clearParticles()
    spawnShatter('melee', 50, 50, SIZE, '#b39b73', '#2c2218', '#ff3b4a', 0.35)
    const thin = particleCount()
    expect(thin).toBeGreaterThan(0)
    expect(thin).toBeLessThan(full)
    expect(registeredSpriteCount(), 'a scaled shatter baked new sprites').toBe(sprites)

    // Scale 0 is the "draw nothing" case and must cost nothing at all.
    clearParticles()
    spawnShatter('melee', 50, 50, SIZE, '#b39b73', '#2c2218', '#ff3b4a', 0)
    expect(particleCount()).toBe(0)
  })

  it('the shatter shards are the rune in pieces (one sprite per sector)', () => {
    clearParticles()
    spawnShatter('defense', 50, 50, SIZE, '#b39b73', '#2c2218', '#4aa8ff')
    // 6 sectors + the ember core + nothing else registered for the dust (smoke is a ramp).
    expect(registeredSpriteCount()).toBe(7)
  })
})
