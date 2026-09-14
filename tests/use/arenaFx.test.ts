import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  bakeSprite, bakedSpriteCount, blit, bucketFor, chipSprite, clearFxSprites, confettiSprite, coreSprite, crackSprite,
  domeSprite, glintSprite, glowSprite, glyphShardSprite, hash01, hexRgb, hexSprite, mix, moteSprite, paintArrow,
  paintArrowImpact, paintAuraLink, paintBeam, paintBoulder, paintBuffGlint, paintCaptureWave, paintCleaveArc,
  paintClashFlash, paintComet, paintCrossBurst,
  paintAimRefused, paintAimRegion, paintAimScrim,
  paintGlow, paintHealFlare, paintKnockbackStreak, paintLanding, paintMergeRing, paintPopText, paintRing,
  paintNukeFlash, paintNukeWave,
  paintShellArc, paintShellBurst, paintShieldDome, paintShockwave, paintSlash, qualityMul, rgba, ringSprite,
  spawnArrowTrail, spawnBeamCrackle,
  spawnBuffGlint, spawnBurstMotes, spawnCaptureSparks, spawnChips, spawnCometEmbers, spawnDefeatAsh, spawnEmbers, spawnHealMotes,
  spawnImpactSparks, spawnKnockbackDust, spawnMergeFountain, spawnRollDust, spawnShatter, spawnShieldShards, spawnTileDust,
  spawnVictoryShower, streakSprite
} from '@/use/arenaFx'
import {
  TIER_CAPACITY, __clearSpriteRegistry, __setQualityTier, clearParticles, particleCount, registeredSpriteCount
} from '@/use/useVfx'
import {
  DIR_VEC, RUNE_TYPES, aimRegionPolygon, aimRegionShape, aimRegions, dirFromCellPoint, type Dir, type RuneType
} from '@/game/rules'

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
    // The enemy's arrival. `t` is the flight, so t = 0 is the degenerate
    // zero-length tail and t = 1 the burnt-out head at the target tile.
    ['comet', (c, t) => paintComet(c, t, 140, -60, 50, 50, SIZE, '#ff3b4a')],
    ['comet (lean)', (c, t) => paintComet(c, t, 140, -60, 50, 50, SIZE, '#ff3b4a', { lean: true })],
    ['comet (straight down)', (c, t) => paintComet(c, t, 50, -60, 50, 50, SIZE, '#ff3b4a')],
    ['comet (no travel)', (c, t) => paintComet(c, t, 50, 50, 50, 50, SIZE, '#ff3b4a')],
    ['capture', (c, t) => paintCaptureWave(c, t, rect, SIZE, '#4aa8ff')],
    ['pop text', (c, t) => paintPopText(c, t, 50, 50, SIZE, { text: '×3', color: '#ffd24a' })],
    ['aura', (c, t) => paintAuraLink(c, t, { x: 50, y: 50 }, cells, SIZE, '#4aa8ff')],
    ['landing', (c, t) => paintLanding(c, t, 50, 50, SIZE, '#ffffff')],
    // The aim compass. `t` drives the lit wedge growing in from its own edge,
    // so t = 0 is the degenerate flat-against-the-edge case a painter is most
    // likely to divide by.
    ['aim region (triangle, lit)', (c, t) => paintAimRegion(c, rect, 'melee', 'up', SIZE, { color: '#ff3b4a', lit: true, grow: t })],
    ['aim region (triangle, unlit)', (c) => paintAimRegion(c, rect, 'melee', 'left', SIZE, { color: '#ff3b4a' })],
    ['aim region (quadrant, lit)', (c, t) => paintAimRegion(c, rect, 'mage', 'ur', SIZE, { color: '#b57bff', lit: true, grow: t })],
    ['aim region (quadrant, unlit)', (c) => paintAimRegion(c, rect, 'mage', 'dl', SIZE, { color: '#b57bff' })],
    ['aim region (whole tile)', (c, t) => paintAimRegion(c, rect, 'defense', 'omni', SIZE, { color: '#4aa8ff', lit: true, grow: t })],
    ['aim region (held, unchosen)', (c) => paintAimRegion(c, rect, 'melee', 'up', SIZE, { color: '#ff3b4a', held: true })],
    // The touch variant: a heavier rim, because it is the one cue a fingertip
    // does not cover.
    ['aim region (touch rim)', (c, t) => paintAimRegion(c, rect, 'melee', 'up', SIZE, { color: '#ff3b4a', lit: true, grow: t, rim: 1.7 })],
    ['aim region (rim 0)', (c, t) => paintAimRegion(c, rect, 'mage', 'ur', SIZE, { color: '#b57bff', lit: true, grow: t, rim: 0 })],
    ['aim region (invisible)', (c, t) => paintAimRegion(c, rect, 'melee', 'up', SIZE, { color: '#ff3b4a', lit: true, grow: t, alpha: 0 })],
    ['aim refused', (c, t) => paintAimRefused(c, rect, SIZE, '#ff3b4a', 1 - t)]
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

describe('the aim compass', () => {
  /**
   * The painters above are checked for balance and blur; this one is checked
   * for GEOMETRY, so it needs a context that remembers where the pen went.
   */
  const pathCtx = () => {
    const pts: [number, number][] = []
    const widths: number[] = []
    let fills = 0
    let strokes = 0
    let width = 0
    const ctx = new Proxy({} as Record<string, unknown>, {
      get(_t, key: string) {
        if (key === '__pts') return () => pts
        if (key === '__fills') return () => fills
        if (key === '__strokes') return () => strokes
        if (key === '__widths') return () => widths
        if (key === 'moveTo' || key === 'lineTo') {
          return (x: number, y: number) => { pts.push([x, y]) }
        }
        if (key === 'fill') return () => { fills++ }
        if (key === 'stroke') return () => { strokes++; widths.push(width) }
        // The lit wedge is filled with a gradient rather than a flat colour.
        if (key === 'createLinearGradient') return () => ({ addColorStop: () => {} })
        return () => {}
      },
      set(_t, key: string, v: unknown) {
        if (key === 'lineWidth') width = v as number
        return true
      }
    }) as unknown as CanvasRenderingContext2D & {
      __pts: () => [number, number][]
      __fills: () => number
      __strokes: () => number
      __widths: () => number[]
    }
    return ctx
  }

  const R = { x: 100, y: 200, w: 80, h: 80 }
  /** Back from canvas space into the tile's own 0..1 space. */
  const unit = ([x, y]: [number, number]): [number, number] => [(x - R.x) / R.w, (y - R.y) / R.h]

  it('draws each region where the pointer would actually pick it', () => {
    // The drawn shape and the hit test come from the same geometry, and this is
    // what proves they have not drifted: every vertex of a region's polygon, and
    // its centre of mass, must belong to the facing it claims to draw.
    for (const type of RUNE_TYPES) {
      if (aimRegionShape(type) === 'whole') continue
      for (const dir of aimRegions(type)) {
        const ctx = pathCtx()
        paintAimRegion(ctx, R, type, dir, SIZE, { color: '#ffffff' })
        const pts = ctx.__pts().map(unit)
        expect(pts.length, `${type}/${dir}`).toBeGreaterThanOrEqual(3)
        let sx = 0
        let sy = 0
        for (const [ux, uy] of pts) { sx += ux; sy += uy }
        expect(dirFromCellPoint(type, sx / pts.length, sy / pts.length), `${type}/${dir} centre`).toBe(dir)
      }
    }
  })

  it('grows the lit region OUTWARD, from the stone to the edge it fires through', () => {
    // The direction of the growth is the direction of the attack. It used to
    // run the other way — the outer edge fixed, the apex walking in from it —
    // which on a board where the enemy shoots at you reads as something
    // incoming, i.e. as the opposite of the facing it is announcing.
    const outer = (type: RuneType, dir: Dir, grow: number): [number, number] => {
      const ctx = pathCtx()
      paintAimRegion(ctx, R, type, dir, SIZE, { color: '#ffffff', lit: true, grow })
      // The region path is laid first; the chevron after it repeats points of
      // its own. The vertex that TRAVELS is whichever one is FURTHEST from the
      // tile's middle — a triangle's outer edge, a quadrant's outer corner.
      const poly = ctx.__pts().slice(0, aimRegionPolygon(type, dir).length).map(unit)
      const d2 = ([x, y]: [number, number]): number => (x - 0.5) ** 2 + (y - 0.5) ** 2
      return poly.reduce((a, b) => (d2(b) > d2(a) ? b : a))
    }
    // A cardinal triangle: at 0 the whole region is under the stone, at 1 its
    // outer edge has reached the side of the tile it names.
    expect(outer('melee', 'up', 0)).toEqual([0.5, 0.5])
    expect(outer('melee', 'up', 1)).toEqual([0, 0])
    expect(outer('melee', 'left', 0)).toEqual([0.5, 0.5])
    expect(outer('melee', 'left', 1)).toEqual([0, 1])
    // …and it travels monotonically, so the growth reads as one movement.
    let last = 1.1
    for (const g of [0, 0.25, 0.5, 0.75, 1]) {
      const [, uy] = outer('melee', 'up', g)
      expect(uy).toBeLessThan(last)
      last = uy
    }
    // A quadrant grows out of the same centre toward its own corner.
    expect(outer('mage', 'ul', 0)).toEqual([0.5, 0.5])
    expect(outer('mage', 'ul', 1)).toEqual([0, 0])
  })

  it('never outlines the lit wedge - a closed triangle is an arrow pointing the wrong way', () => {
    // A cardinal region has its apex at the tile's CENTRE, so stroking it
    // closed draws a hard arrowhead aimed back at the stone. The chosen facing
    // is shown as light instead: one gradient fill, and the only hard strokes
    // on it are the outward chevron (drawn twice - keyline, then white).
    const lit = pathCtx()
    paintAimRegion(lit, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 1 })
    expect(lit.__fills()).toBe(1)
    expect(lit.__strokes()).toBe(2)
    // Both of those strokes are the chevron, and the chevron's peak is OUTSIDE
    // the tile - past the edge the rune fires through, never behind it.
    const pts = lit.__pts().map(unit)
    const peak = pts[pts.length - 2]!
    expect(peak[0]).toBeCloseTo(0.5, 5)
    expect(peak[1]).toBeLessThan(0)
  })

  it('points the chevron out of the tile for every facing of every rune', () => {
    // The one mark the eye goes to first has to be readable as a direction,
    // and as the RIGHT direction, on every (type, facing) pair there is.
    for (const type of RUNE_TYPES) {
      if (aimRegionShape(type) === 'whole') continue
      for (const dir of aimRegions(type)) {
        const ctx = pathCtx()
        paintAimRegion(ctx, R, type, dir, SIZE, { color: '#ffffff', lit: true, grow: 1 })
        const pts = ctx.__pts().map(unit)
        const peak = pts[pts.length - 2]!
        // The peak sits past the tile's edge, along the facing's own vector.
        const [dx, dy] = DIR_VEC[dir]
        const n = Math.hypot(dx, dy) || 1
        const dot = (peak[0] - 0.5) * (dx / n) + (peak[1] - 0.5) * (dy / n)
        expect(dot, `${type}/${dir} chevron`).toBeGreaterThan(0.5)
      }
    }
  })

  it('fills only the lit region, so a tile can never show two answers', () => {
    const lit = pathCtx()
    paintAimRegion(lit, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 1 })
    expect(lit.__fills()).toBe(1)
    const dim = pathCtx()
    paintAimRegion(dim, R, 'melee', 'up', SIZE, { color: '#ffffff' })
    expect(dim.__fills()).toBe(0)
    // An offered region is outlined over a dark keyline, so it reads on any
    // tile the art happens to put under it rather than on the lucky ones.
    expect(dim.__strokes()).toBe(2)
    const widths = dim.__widths()
    expect(widths[0]).toBeGreaterThan(widths[1]!)
  })

  it('shows a HELD facing softly — filled, but never as the chosen one', () => {
    // The dead-zone state: the rune would face this way, but the player has not
    // picked it. It must read between the outline and the lit wedge, and it
    // must not wear the lit wedge's white edge.
    const held = pathCtx()
    paintAimRegion(held, R, 'melee', 'up', SIZE, { color: '#ffffff', held: true })
    expect(held.__fills()).toBe(1)
    // Keyline then outline, like every offered region - and NO chevron, which
    // is the mark reserved for a facing the player actually chose.
    expect(held.__strokes()).toBe(2)
    expect(held.__pts()).toHaveLength(3)
    // It is drawn at FULL size: nothing is travelling toward an unmade choice.
    const lit0 = pathCtx()
    paintAimRegion(lit0, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 0 })
    expect(held.__pts().slice(0, 3)).not.toEqual(lit0.__pts().slice(0, 3))
    const full = pathCtx()
    paintAimRegion(full, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 1 })
    expect(held.__pts().slice(0, 3)).toEqual(full.__pts().slice(0, 3))
  })

  it('keeps the lit region identifiable under a fingertip', () => {
    // Touch covers the middle of the tile, so the chosen region has to be
    // recognisable from its RIM: same fill, same two strokes, and a white outer
    // edge drawn heavier than the cursor's.
    const cursor = pathCtx()
    paintAimRegion(cursor, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 1 })
    const finger = pathCtx()
    paintAimRegion(finger, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 1, rim: 1.7 })

    expect(finger.__fills()).toBe(1)
    expect(finger.__strokes()).toBe(2)
    // The region itself is in exactly the same place - only its chevron is
    // louder, and reaches further out past the tile's edge.
    expect(finger.__pts().slice(0, 3)).toEqual(cursor.__pts().slice(0, 3))
    const rimWidth = (c: ReturnType<typeof pathCtx>): number => c.__widths()[c.__widths().length - 1]!
    expect(rimWidth(finger)).toBeGreaterThan(rimWidth(cursor))
    const peakY = (c: ReturnType<typeof pathCtx>): number => c.__pts()[c.__pts().length - 2]![1]!
    expect(peakY(finger)).toBeLessThan(peakY(cursor))

    // …and it still reads as lit rather than as one of the offered regions.
    const offered = pathCtx()
    paintAimRegion(offered, R, 'melee', 'up', SIZE, { color: '#ffffff', rim: 1.7 })
    expect(offered.__fills()).toBe(0)
    expect(offered.__pts()).toHaveLength(3)
  })

  it('lit beats held when both are asked for, so the tile has one answer', () => {
    const both = pathCtx()
    paintAimRegion(both, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, held: true, grow: 1 })
    expect(both.__strokes()).toBe(2)
  })

  it('darkens the tile before anything is drawn on it', () => {
    // The compass is a green overlay on painted slate. Without this wash its
    // marks were technically present and practically invisible, which is how a
    // player drops a rune facing a direction they never chose.
    const ctx = mockCtx()
    paintAimScrim(ctx, R)
    expect(ctx.__calls().get('fillRect')).toBe(1)
    expect(ctx.__depth()).toBe(0)
    // …and it obeys the one rule of this module.
    expect(ctx.__sets().has('shadowBlur')).toBe(false)
    expect(ctx.__sets().has('filter')).toBe(false)
  })

  it('draws no scrim at all when it is fully transparent', () => {
    const ctx = mockCtx()
    paintAimScrim(ctx, R, 0)
    expect(ctx.__calls().get('fillRect') ?? 0).toBe(0)
  })

  it('a refused tile is a cross, not a set of choices', () => {
    const ctx = pathCtx()
    paintAimRefused(ctx, R, SIZE, '#ff3b4a')
    // Two strokes of two points each — an X — and no region polygon at all.
    expect(ctx.__pts()).toHaveLength(4)
    expect(ctx.__strokes()).toBe(1)
  })

  it('draws nothing at all when it is fully transparent', () => {
    const ctx = pathCtx()
    paintAimRegion(ctx, R, 'melee', 'up', SIZE, { color: '#ffffff', lit: true, grow: 1, alpha: 0 })
    paintAimRefused(ctx, R, SIZE, '#ff3b4a', 0)
    expect(ctx.__pts()).toHaveLength(0)
    expect(ctx.__fills()).toBe(0)
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
      ['embers', () => spawnEmbers(50, 50, SIZE, '#ff9a4a')],
      ['comet embers', () => spawnCometEmbers(50, 50, 1.1, SIZE, '#ff3b4a')]
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
