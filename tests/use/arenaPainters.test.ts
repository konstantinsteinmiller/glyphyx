import { beforeAll, describe, expect, it } from 'vitest'
import {
  ENEMY_STONE, STONE_FILL, enemyStone, materialOf, mixHex, paintBoardFrame, paintForge, paintGlyph,
  paintLaurel, paintPebble, paintRerollChip, paintRidge, paintSky, paintStoneShape, paintTile, resolveGlow,
  stoneFill, stoneOutline,
  LAUREL_REF_CUT, laurelFit, laurelRimAt, pebbleSeed,
} from '@/use/arenaPainters'
import { MAX_LEVEL } from '@/game/rules'
import { FACTION_DEFS, RUNES, RUNE_TYPES, SKINS, SKIN_IDS, type Faction, type GlyphStyle, type RuneType, type SkinId, type StoneCut } from '@/game/rules'

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

const CUTS: StoneCut[] = [
  'carved', 'knapped', 'polished', 'faceted', 'quarried', 'slab', 'step', 'cabochon', 'brilliant'
]
/** The cuts with no chance in them: same rune, same skin, same stone, every time. */
const EXACT: StoneCut[] = ['carved', 'polished', 'faceted', 'quarried', 'step', 'cabochon']
const STYLES: GlyphStyle[] = ['engraved', 'neon', 'inlay', 'gem', 'carved', 'ember', 'starcut', 'blood', 'prism']
const widthOf = (pts: { x: number }[]): number => Math.max(...pts.map((q) => Math.abs(q.x)))
const heightOf = (pts: { y: number }[]): number => Math.max(...pts.map((q) => Math.abs(q.y)))
const SKIN_IDS = Object.keys(SKINS) as SkinId[]
const FACTIONS = Object.keys(FACTION_DEFS) as Faction[]

beforeAll(() => {
  // The glyphs are `Path2D`s; jsdom has none, and the recorder never looks inside one.
  const g = globalThis as unknown as { Path2D?: unknown }
  if (typeof g.Path2D === 'undefined') g.Path2D = class { constructor(_d?: string) { /* geometry is not inspected */ } }
})

describe('stoneOutline', () => {
  it('is deterministic in its seed and fills the unit box', () => {
    for (const cut of CUTS) {
      for (const type of RUNE_TYPES) {
        const a = stoneOutline(cut, type, 1234)
        const b = stoneOutline(cut, type, 1234)
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
    }
  })

  // THE point of the split. Before it, the skin owned the shape, so all ten
  // runes of a skin were one outline with ten different glyphs cut into it —
  // and the silhouette, which is what a player reads across the board, said
  // nothing at all about which rune it was.
  it('gives every RUNE its own silhouette, in every cut', () => {
    for (const cut of CUTS) {
      const seen = new Set(RUNE_TYPES.map((t) => JSON.stringify(stoneOutline(cut, t, 7))))
      expect(seen.size, cut).toBe(RUNE_TYPES.length)
    }
  })

  it('gives every CUT its own finish, for every rune', () => {
    for (const type of RUNE_TYPES) {
      const seen = new Set(CUTS.map((c) => JSON.stringify(stoneOutline(c, type, 7))))
      expect(seen.size, type).toBe(CUTS.length)
    }
  })

  it('only lets the seed move a cut that has chance in it', () => {
    // Knapped glass and a cracked slab are struck, not machined: two seeds
    // never agree, and the asymmetry is the point.
    for (const cut of ['knapped', 'slab', 'brilliant'] as StoneCut[]) {
      expect(stoneOutline(cut, 'melee', 1), cut).not.toEqual(stoneOutline(cut, 'melee', 2))
    }
    // Everything else is a made object, and every one of them is the same
    // object. A carved plaque that varied would read as a mistake.
    for (const cut of EXACT) {
      for (const type of RUNE_TYPES) {
        expect(stoneOutline(cut, type, 1), `${cut} ${type}`).toEqual(stoneOutline(cut, type, 999))
      }
    }
  })

  it('is exactly symmetric wherever it is not knapped', () => {
    for (const cut of EXACT) {
      for (const type of RUNE_TYPES) {
        const pts = stoneOutline(cut, type, 7)
        for (const p of pts) {
          expect(
            pts.some((q) => Math.abs(q.x + p.x) < 1e-9 && Math.abs(q.y - p.y) < 1e-9),
            `${cut} ${type} ${p.x},${p.y}`
          ).toBe(true)
        }
      }
    }
  })

  it('carries each rune\'s character: the bow is the thinnest, the shield the blockiest, the axe has horns', () => {
    const carved = (t: RuneType): { x: number; y: number }[] => stoneOutline('carved', t, 7)

    // The bow is the slim one and the shield the wide one — the two the brief
    // named, and the two furthest apart on the roster.
    const widths = Object.fromEntries(RUNE_TYPES.map((t) => [t, widthOf(carved(t))])) as Record<RuneType, number>
    expect(Math.min(...RUNE_TYPES.map((t) => widths[t]))).toBe(widths.archer)
    expect(widths.archer).toBeLessThan(0.8)
    expect(widths.defense).toBeGreaterThan(0.95)
    expect(widths.defense).toBeGreaterThan(widths.melee)

    // The sword keeps its point at the top and its belly below the middle.
    const sword = carved('melee')
    const top = sword.reduce((a, b) => (a.y < b.y ? a : b))
    expect(top.y).toBeCloseTo(-1, 6)
    expect(Math.abs(top.x)).toBeLessThan(1e-9)
    expect(Math.max(...sword.filter((q) => q.y < -0.6).map((q) => Math.abs(q.x)))).toBeLessThan(0.8)

    // The shield is FLAT across the top — the only rune with shoulders that
    // wide that high — and comes down to a point instead of standing on one.
    const shield = carved('defense')
    expect(Math.max(...shield.filter((q) => q.y < -0.85).map((q) => Math.abs(q.x)))).toBeGreaterThan(0.7)
    expect(Math.max(...shield.filter((q) => q.y > 0.85).map((q) => Math.abs(q.x)))).toBeLessThan(0.55)

    // The boulder is the only rune wider than it is tall.
    expect(heightOf(carved('roller'))).toBeLessThan(0.95)
    expect(widthOf(carved('roller'))).toBeCloseTo(1, 6)

    // The axe's lowest points are its two HORNS, off the axis — it is the one
    // outline whose foot is not on the centreline.
    const axe = carved('cleave')
    const lowest = axe.reduce((a, b) => (a.y > b.y ? a : b))
    expect(Math.abs(lowest.x)).toBeGreaterThan(0.5)
    expect(axe.find((q) => Math.abs(q.x) < 1e-9 && q.y > 0)!.y).toBeLessThan(lowest.y)

    // The mortar stands on a flat plate: a run of points along its foot.
    expect(carved('bombard').filter((q) => q.y > 0.95).length).toBeGreaterThan(3)
  })

  it('gives each cut its own hand: flats, rounding, blunting, jitter', () => {
    // The coarse cuts sample far less than the carved one, which is what
    // leaves a flat where the carved stone has a curve.
    for (const cut of ['faceted', 'step', 'knapped'] as StoneCut[]) {
      expect(stoneOutline(cut, 'melee', 7).length, cut).toBeLessThan(stoneOutline('carved', 'melee', 7).length * 0.7)
    }
    // The cabochon has rounded the sword's point off; the carved one has not.
    const apexY = (cut: StoneCut): number => Math.min(...stoneOutline(cut, 'melee', 7).filter((q) => Math.abs(q.x) < 0.12).map((q) => q.y))
    expect(apexY('cabochon')).toBeGreaterThan(apexY('carved'))
    expect(apexY('polished')).toBeGreaterThan(apexY('carved'))
    // Blunting fills the sides out toward the block without moving the extremes.
    const area = (cut: StoneCut): number => {
      const pts = stoneOutline(cut, 'archer', 7)
      let a2 = 0
      for (let i = 0; i < pts.length; i++) {
        const q = pts[i]!
        const r = pts[(i + 1) % pts.length]!
        a2 += q.x * r.y - r.x * q.y
      }
      return Math.abs(a2) / 2
    }
    expect(area('slab')).toBeGreaterThan(area('carved'))
    expect(area('quarried')).toBeGreaterThan(area('carved'))
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

  it('keeps the enemy on the rust-red carved stone whatever the faction, tinted and cached', () => {
    expect(enemyStone(null)).toBe(ENEMY_STONE)
    for (const f of FACTIONS) {
      const s = enemyStone(f)
      expect(s.cut).toBe('carved')
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

  // The wreath is a LAYER: one drawable over any stone of that rune, painted
  // or drawn. What that buys is one wreath across all nine skins, and what it
  // costs is this contract — a stone must be paintable WITHOUT one (the
  // reference sheet and the arena both ask for that), and Lv 1 never grows one.
  it('the wreath hugs each RUNE\'s silhouette, and nothing floats', () => {
    const down = Math.PI / 2
    const side = 0
    // The wreath is keyed by the rune, because the rune owns the outline: the
    // bow tapers to a needle at the foot and the shield is far wider there, so
    // one wreath cannot serve both.
    expect(laurelRimAt('archer', side)).toBeLessThan(laurelRimAt('defense', side))
    expect(laurelRimAt('roller', down)).toBeLessThan(laurelRimAt('melee', down))
    for (const type of RUNE_TYPES) {
      for (let k = 0; k <= 12; k++) {
        const a = Math.PI / 2 + (k / 12 - 0.5) * Math.PI
        const r = laurelRimAt(type, a)
        expect(r, type).toBeGreaterThan(0.4)
        expect(r, type).toBeLessThanOrEqual(1.45)
      }
    }
    // A laurel paints for every rune without throwing, at any size.
    for (const type of RUNE_TYPES) {
      const ctx = mockCtx()
      paintLaurel(ctx, 96, 96, type)
      balanced(ctx)
    }
  })

  /**
   * ─── …and it hugs the STONE, not an idea of one ──────────────────────────
   *
   * Nine cuts take the same rune and widen it, blunt it, round it off or knap
   * a flake out of it, so "the wreath fits this rune" is ninety statements and
   * not ten. This walks all ninety and measures the gap between the radius the
   * wreath sits at and the radius the stone's rim is actually at, along the
   * arc a branch sweeps.
   *
   * It is a regression guard with a real number behind it: the wreath used to
   * hug the CONVEX HULL of one reference cut, which on the axe — whose bit
   * spans the box and whose haft is a stick — stood the branches half a radius
   * clear of the stone, in `carved`, the very cut it was cut against.
   */
  it('hugs the stone it is actually hung on, for every rune in every skin', () => {
    // The wreath's own arc, and the sliver it deliberately stands proud by.
    const A0 = 0.07 * Math.PI
    const A1 = 0.48 * Math.PI
    const PROUD = 1.06
    const rimOf = (pts: readonly { x: number; y: number }[], a: number): number => {
      const dx = Math.cos(a)
      const dy = Math.sin(a)
      let best = 0
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!
        const q = pts[(i + 1) % pts.length]!
        const ex = q.x - p.x
        const ey = q.y - p.y
        const den = dx * ey - dy * ex
        if (Math.abs(den) < 1e-9) continue
        const t = (p.x * ey - p.y * ex) / den
        const u = (p.x * dy - p.y * dx) / den
        if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6 && t > best) best = t
      }
      return best > 0 ? best : 1
    }
    let worstPair = ''
    let worst = 0
    for (const type of RUNE_TYPES) {
      for (const id of SKIN_IDS) {
        const cut = SKINS[id]!.cut
        const stone = stoneOutline(cut, type, pebbleSeed(type, cut))
        for (const s of [-1, 1]) {
          for (let k = 0; k <= 12; k++) {
            const a = Math.PI / 2 + s * (A0 + (A1 - A0) * (k / 12))
            const gap = laurelRimAt(type, a, cut) * PROUD - rimOf(stone, a)
            if (Math.abs(gap) > Math.abs(worst)) { worst = gap; worstPair = `${type}/${id}` }
          }
        }
      }
    }
    // A wreath rests ON a stone: a little proud of the rim is right, a sixth
    // of the radius of daylight under the leaves is the bug this replaced.
    expect(Math.abs(worst), `worst at ${worstPair}`).toBeLessThan(0.16)
  })

  it('fits a PAINTED wreath onto a cut it was not painted for', () => {
    // One painting per rune cannot be reshaped per skin, only resized, and
    // `laurelFit` is that one number. It is exactly 1 for the cut the painting
    // was made against — a wreath that needs no correction must get none.
    for (const type of RUNE_TYPES) {
      expect(laurelFit(type, LAUREL_REF_CUT), type).toBe(1)
      for (const id of SKIN_IDS) {
        const k = laurelFit(type, SKINS[id]!.cut)
        expect(Number.isFinite(k), `${type}/${id}`).toBe(true)
        // A correction, never a resize: the art keeps its own scale.
        expect(k, `${type}/${id}`).toBeGreaterThanOrEqual(0.8)
        expect(k, `${type}/${id}`).toBeLessThanOrEqual(1.25)
      }
    }
    // And it moves in the right direction: a quarried stone is broader than
    // the reference, a knapped one is flaked in off it.
    expect(laurelFit('melee', 'quarried')).toBeGreaterThan(laurelFit('melee', 'knapped'))
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
    for (const cut of CUTS) {
      for (const type of RUNE_TYPES) {
        const ctx = mockCtx()
        paintStoneShape(ctx, 72, 72, cut, type, SKINS.marble)
        balanced(ctx)
      }
    }
  })
})
