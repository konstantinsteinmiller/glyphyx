import { beforeAll, describe, expect, it } from 'vitest'
import {
  ENEMY_STONE, STONE_FILL, enemyStone, materialOf, mixHex, paintBoardFrame, paintForge, paintGlyph,
  paintLaurel, paintPebble, paintRerollChip, paintRidge, paintSky, paintStoneShape, paintTile, resolveGlow,
  stoneFill, stoneOutline,
  laurelRimAt,
} from '@/use/arenaPainters'
import { MAX_LEVEL } from '@/game/rules'
import { FACTION_DEFS, RUNES, RUNE_TYPES, SKINS, type Faction, type GlyphStyle, type PebbleShape, type SkinId } from '@/game/rules'

/**
 * jsdom has no rasteriser, so the painters are exercised against a RECORDING
 * context: every method is a counting no-op, gradients accept stops, and the
 * save/restore depth is tracked. What is asserted is the contract the three
 * consumers rely on — every stone paints without throwing, leaves the context
 * state balanced, and the pure helpers are deterministic.
 */

type Mock = CanvasRenderingContext2D & { __depth: () => number; __min: () => number; __calls: () => Map<string, number> }

const mockCtx = (): Mock => {
  let depth = 0
  let min = 0
  const calls = new Map<string, number>()
  const gradient = { addColorStop: (): void => {} }
  const target: Record<string, unknown> = {}
  const count = (key: string): void => { calls.set(key, (calls.get(key) ?? 0) + 1) }
  return new Proxy(target, {
    get(t, key: string) {
      if (key === '__depth') return () => depth
      if (key === '__min') return () => min
      if (key === '__calls') return () => calls
      if (key === 'save') return () => { depth++; count(key) }
      if (key === 'restore') return () => { depth--; min = Math.min(min, depth); count(key) }
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => { count(key); return gradient }
      if (key === 'measureText') return () => ({ width: 10 })
      if (key in t) return t[key]
      return () => { count(key) }
    },
    set(t, key: string, v: unknown) { t[key] = v; return true }
  }) as unknown as Mock
}

/** Fewer leaves per branch than the painter draws — the count may be tuned, the wreath may not vanish. */
const LAUREL_LEAVES_MIN = 4

const SHAPES: PebbleShape[] = ['pebble', 'shard', 'oval', 'hex', 'disc', 'slab']
const STYLES: GlyphStyle[] = ['engraved', 'neon', 'inlay', 'gem', 'carved', 'ember']
const SKIN_IDS = Object.keys(SKINS) as SkinId[]
const FACTIONS = Object.keys(FACTION_DEFS) as Faction[]

beforeAll(() => {
  // The glyphs are `Path2D`s; jsdom has none, and the recorder never looks inside one.
  const g = globalThis as unknown as { Path2D?: unknown }
  if (typeof g.Path2D === 'undefined') g.Path2D = class { constructor(_d?: string) { /* geometry is not inspected */ } }
})

describe('stoneOutline', () => {
  it('is deterministic in its seed and fills the unit box', () => {
    for (const shape of SHAPES) {
      const a = stoneOutline(shape, 1234)
      const b = stoneOutline(shape, 1234)
      expect(a).toEqual(b)
      expect(a.length).toBeGreaterThanOrEqual(6)
      let extent = 0
      for (const p of a) {
        expect(Math.abs(p.x)).toBeLessThanOrEqual(1 + 1e-9)
        expect(Math.abs(p.y)).toBeLessThanOrEqual(1 + 1e-9)
        extent = Math.max(extent, Math.abs(p.x), Math.abs(p.y))
      }
      expect(extent).toBeCloseTo(1, 9)
    }
  })

  it('cuts a different stone for a different seed where the shape has any chance in it', () => {
    // A pebble and a shard draw a handful of numbers, so two seeds never agree.
    for (const shape of ['pebble', 'shard'] as PebbleShape[]) {
      expect(stoneOutline(shape, 1)).not.toEqual(stoneOutline(shape, 2))
    }
    // A slab makes ONE choice (which corner is knocked off), so neighbouring
    // seeds may coincide; across a few seeds more than one corner must go.
    const slabs = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => JSON.stringify(stoneOutline('slab', seed))))
    expect(slabs.size).toBeGreaterThan(1)
    // …and the shapes with no chance in them are the same under every seed.
    expect(stoneOutline('hex', 1)).toEqual(stoneOutline('hex', 2))
    expect(stoneOutline('oval', 1)).toEqual(stoneOutline('oval', 2))
  })

  it('gives each silhouette its own character', () => {
    expect(stoneOutline('hex', 7).length).toBe(6)
    expect(stoneOutline('shard', 7).length).toBeGreaterThanOrEqual(6)
    expect(stoneOutline('shard', 7).length).toBeLessThanOrEqual(8)
    expect(stoneOutline('oval', 7).length).toBe(48)
    // The oval is wider than tall; the disc is round.
    const oval = stoneOutline('oval', 7)
    const disc = stoneOutline('disc', 7)
    const tallest = (pts: { y: number }[]): number => Math.max(...pts.map((p) => Math.abs(p.y)))
    expect(tallest(oval)).toBeLessThan(0.85)
    expect(tallest(disc)).toBeCloseTo(1, 6)
  })
})

describe('skins and materials', () => {
  it('maps every shipped skin to its own material', () => {
    const mats = new Set(SKIN_IDS.map((id) => materialOf(SKINS[id].glyph)))
    expect(mats.size).toBe(SKIN_IDS.length)
    for (const style of STYLES) expect(typeof materialOf(style)).toBe('string')
  })

  it('resolves a null glow to the rune type\'s own colour', () => {
    expect(SKINS.river.glow).toBeNull()
    for (const type of RUNE_TYPES) expect(resolveGlow(SKINS.river, type)).toBe(RUNES[type].color)
    expect(resolveGlow(SKINS.obsidian, 'mage')).toBe(SKINS.obsidian.glow)
  })

  it('keeps the enemy on the rust pebble whatever the faction, tinted and cached', () => {
    expect(enemyStone(null)).toBe(ENEMY_STONE)
    for (const f of FACTIONS) {
      const s = enemyStone(f)
      expect(s.shape).toBe('pebble')
      expect(s.glyph).toBe('engraved')
      expect(s.hi).not.toBe(ENEMY_STONE.hi)
      expect(enemyStone(f)).toBe(s)
    }
    expect(enemyStone('goblin').hi).not.toBe(enemyStone('undead').hi)
  })

  it('mixes colours linearly and clamps the blend', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mixHex('#ff0000', '#0000ff', 0)).toBe('#ff0000')
    expect(mixHex('#ff0000', '#0000ff', 2)).toBe('#0000ff')
  })

  it('leaves glow room around the stone and grows a Lv 2', () => {
    expect(STONE_FILL[2]).toBeGreaterThan(STONE_FILL[1])
    expect(STONE_FILL[2]).toBeLessThan(0.8)
  })

  it('stoneFill follows the table at Lv 1 / Lv 2, then grows a touch per level and stops', () => {
    expect(stoneFill(1)).toBe(STONE_FILL[1])
    expect(stoneFill(2)).toBe(STONE_FILL[2])
    let prev = stoneFill(2)
    for (let L = 3; L <= MAX_LEVEL; L++) {
      const f = stoneFill(L)
      expect(f).toBeGreaterThanOrEqual(prev)
      expect(f).toBeLessThanOrEqual(STONE_FILL[2] + 0.04)
      prev = f
    }
    expect(stoneFill(MAX_LEVEL)).toBeLessThan(0.8)
    expect(stoneFill(0)).toBe(STONE_FILL[1])
    expect(stoneFill(Number.NaN)).toBe(STONE_FILL[1])
  })
})

describe('painters on a recording context', () => {
  const balanced = (ctx: Mock): void => {
    expect(ctx.__depth()).toBe(0)
    expect(ctx.__min()).toBe(0)
  }

  it('paints every stone of every skin, level and side, and leaves the context balanced', () => {
    for (const id of SKIN_IDS) {
      for (const type of RUNE_TYPES) {
        for (const level of [1, 2] as const) {
          const ctx = mockCtx()
          paintPebble(ctx, 96, 96, { type, level, owner: 'player', skin: SKINS[id], label: 'Lv.2' })
          balanced(ctx)
          expect(ctx.__calls().get('fill') ?? 0).toBeGreaterThan(3)
          for (const f of FACTIONS) {
            const e = mockCtx()
            paintPebble(e, 96, 96, { type, level, owner: 'enemy', faction: f, skin: SKINS[id] })
            balanced(e)
          }
        }
      }
    }
  })

  it('paints every level up to MAX_LEVEL, with the captioned crest from Lv 2 on', () => {
    for (const level of [1, 2, 5, MAX_LEVEL]) {
      const ctx = mockCtx()
      paintPebble(ctx, 96, 96, { type: 'melee', level, owner: 'player', skin: SKINS.river, label: `Lv.${level}` })
      balanced(ctx)
      const captions = ctx.__calls().get('fillText') ?? 0
      if (level >= 2) expect(captions).toBeGreaterThan(0)
      else expect(captions).toBe(0)
      const enemy = mockCtx()
      paintPebble(enemy, 96, 96, { type: 'archer', level, owner: 'enemy', faction: 'goblin', skin: SKINS.river, label: `Lv.${level}` })
      balanced(enemy)
    }
  })

  // The wreath is a LAYER: one drawable over any stone, painted or drawn. What
  // that buys is a single wreath across 120 stones, and what it costs is this
  // contract — a stone must be paintable WITHOUT one (the reference sheet and
  // the arena both ask for that), and Lv 1 must never grow one.
  it('the wreath hugs each silhouette: an oval\'s foot is nearer than a disc\'s, a shard has corners, nothing floats', () => {
    const down = Math.PI / 2
    const side = 0
    expect(laurelRimAt('oval', down)).toBeCloseTo(0.78, 1)
    expect(laurelRimAt('oval', side)).toBeCloseTo(1, 1)
    expect(laurelRimAt('disc', down)).toBeGreaterThan(laurelRimAt('oval', down))
    for (const shape of ['pebble', 'shard', 'oval', 'hex', 'disc', 'slab'] as const) {
      for (let k = 0; k <= 12; k++) {
        const a = Math.PI / 2 + (k / 12 - 0.5) * Math.PI
        const r = laurelRimAt(shape, a)
        expect(r).toBeGreaterThan(0.5)
        expect(r).toBeLessThanOrEqual(1.45)
      }
    }
    // A laurel paints for every shape without throwing, at any size.
    for (const shape of ['pebble', 'shard', 'oval', 'hex', 'disc', 'slab'] as const) {
      const ctx = mockCtx()
      paintLaurel(ctx, 96, 96, shape)
      balanced(ctx)
    }
  })

  it('draws the Lv 2 laurel on its own, at any size, and leaves the context balanced', () => {
    for (const size of [32, 96, 512]) {
      const ctx = mockCtx()
      paintLaurel(ctx, size, size)
      balanced(ctx)
      // Leaves are ellipses; a wreath with no leaves is a stem.
      expect(ctx.__calls().get('ellipse') ?? 0).toBeGreaterThanOrEqual(2 * LAUREL_LEAVES_MIN)
      expect(ctx.__calls().get('stroke') ?? 0).toBeGreaterThan(4)
    }
  })

  it('wears the laurel from Lv 2, and never when the caller layers it itself', () => {
    const leaves = (o: Parameters<typeof paintPebble>[3]): number => {
      const ctx = mockCtx()
      paintPebble(ctx, 96, 96, o)
      balanced(ctx)
      return ctx.__calls().get('ellipse') ?? 0
    }
    // The stone draws ellipses of its own (sandstone pits), so the wreath is
    // the DIFFERENCE the flag makes, not the raw count.
    const base = { type: 'melee', owner: 'player', skin: SKINS.river, label: 'Lv.2' } as const
    const worn = leaves({ ...base, level: 2 })
    const layered = leaves({ ...base, level: 2, laurel: false })
    expect(worn - layered).toBeGreaterThanOrEqual(2 * LAUREL_LEAVES_MIN)
    // Lv 1 has no wreath to suppress, so the flag changes nothing there…
    expect(leaves({ ...base, level: 1 })).toBe(leaves({ ...base, level: 1, laurel: false }))
    // …and every level above 2 wears exactly the one wreath.
    expect(leaves({ ...base, level: MAX_LEVEL }) - leaves({ ...base, level: MAX_LEVEL, laurel: false })).toBe(worn - layered)
  })

  // The backdrop is three drawables now (sky + two bands), and the arena draws
  // each of them into a box whose shape it does not control: a phone in
  // portrait, a desktop in landscape, and a 4:1 band inside both.
  it('paints the sky and both ridges at any shape, and leaves the context balanced', () => {
    for (const [w, h] of [[1024, 576], [360, 780], [1920, 400], [64, 64]] as [number, number][]) {
      const sky = mockCtx()
      paintSky(sky, w, h)
      balanced(sky)
      // A sky with no fill is a hole in the backdrop: it MUST cover its box.
      expect(sky.__calls().get('fillRect') ?? 0).toBeGreaterThan(0)
      for (const layer of ['far', 'near'] as const) {
        const band = mockCtx()
        paintRidge(band, w, h, layer)
        balanced(band)
        expect(band.__calls().get('fill') ?? 0).toBeGreaterThan(0)
      }
    }
  })

  it('draws the same sky twice — a seeded starfield, not a random one', () => {
    // The backdrop is baked once and re-baked on every resize, an ad, a pause.
    // A star that moves when the window does is the tell that a painter reached
    // for Math.random, and it would also make the reference unreproducible.
    const trace = (): string => {
      const ctx = mockCtx()
      paintSky(ctx, 400, 300)
      return JSON.stringify([...ctx.__calls()].sort())
    }
    expect(trace()).toBe(trace())
  })

  it('paints the glyph alone, in every style, and the crest without a caption', () => {
    for (const style of STYLES) {
      const ctx = mockCtx()
      paintGlyph(ctx, 64, 64, 'defense', style, '#101010', '#4aa8ff')
      balanced(ctx)
    }
    const alone = mockCtx()
    paintPebble(alone, 48, 48, { type: 'mage', level: 1, owner: 'player', skin: SKINS.jade, glyphOnly: true })
    balanced(alone)
    const bare = mockCtx()
    paintPebble(bare, 120, 120, { type: 'melee', level: 2, owner: 'player', skin: SKINS.ember, pulse: 1 })
    balanced(bare)
    expect(bare.__calls().get('fillText') ?? 0).toBe(0)
  })

  it('paints tiles for every owner, the frame, the forge, the chip and each bare shape', () => {
    for (const owner of ['neutral', 'player', 'enemy'] as const) {
      const ctx = mockCtx()
      paintTile(ctx, 80, 80, { owner, faction: owner === 'enemy' ? 'orc' : null })
      balanced(ctx)
    }
    const frame = mockCtx()
    paintBoardFrame(frame, 340, 340)
    balanced(frame)
    const forge = mockCtx()
    paintForge(forge, 96, 96)
    balanced(forge)
    for (const [w, h] of [[120, 40], [48, 48]] as const) {
      const chip = mockCtx()
      paintRerollChip(chip, w, h)
      balanced(chip)
    }
    for (const shape of SHAPES) {
      const ctx = mockCtx()
      paintStoneShape(ctx, 72, 72, shape, SKINS.marble)
      balanced(ctx)
    }
  })
})
