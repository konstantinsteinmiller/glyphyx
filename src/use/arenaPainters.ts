// ─── The painters ───────────────────────────────────────────────────────────
//
// Every drawable the arena shows, as ONE pure draw call reachable from outside
// the game loop. Three consumers share them and that is the whole point:
//
//   • `useArenaArt` bakes them into the sprites it blits every frame,
//   • `PebblePreview.vue` paints them into a small canvas for the shop, the
//     unlock card and the campaign map,
//   • the art bench (`/art-sheets`) paints them onto reference sheets an image
//     model repaints — so a painted return is registered against EXACTLY the
//     drawing it replaces (the pipeline's first rule).
//
// Contract: each painter draws into the box (0, 0, w, h) of the given context,
// centred, with transparent surroundings, and leaves the context state as it
// found it. Nothing here reads the DOM, the clock or Vue. Every speck, chip and
// vein comes from a seeded generator keyed on what is being drawn, so a stone
// looks the same on the field, in the shop and on the sheet.
//
// ── The look ──
//
// A rune is a STONE with a glyph cut into it: a warm, chipped river pebble lit
// from the top-left, a dark engraved glyph with the rune's own colour glowing
// up out of the cut, and — at Lv 2 — a gold rim, a laurel around its foot and a
// small gold crest on the shoulder (the laurel is its own layer; see below). The enemy's stones are the same material fired rust-red, whatever
// skin the player wears, because side has to read before anything else does.
// A skin changes the MATERIAL, the SILHOUETTE and the WAY THE GLYPH IS CUT
// (obsidian is knapped and its glyph is a neon line; jade is a polished oval
// with a gold inlay; …), so a skin is recognisable from the hand tray.

import {
  FACTION_DEFS, RUNES,
  type Faction, type GlyphStyle, type Owner, type RuneType, type SkinDef, type StoneCut
} from '@/game/rules'
import { glyphPath } from '@/game/glyphs'
import { rand, seedFrom } from '@/game/rng'
import { RIBBON_PLATE } from '@/game/artCatalogue'

export interface PebbleOpts {
  type: RuneType
  /** 1 … MAX_LEVEL; 2 and above wear the gold crest. */
  level: number
  /** `player` runes wear the skin; `enemy` runes wear the faction's stone. */
  owner: 'player' | 'enemy'
  faction?: Faction | null
  skin: SkinDef
  /** Draw the glyph only (for the unlock card, the map, a hand icon). */
  glyphOnly?: boolean
  /** 0..1 glow pulse phase for idle breathing; painters default to 0.5. */
  pulse?: number
  /** The Lv 2 crest's caption (the scene passes the localised "Lv.2"); a bare crest without. */
  label?: string
  /**
   * Draw the Lv 2 laurel into the stone. Default true — a self-contained
   * stone, which is what the DOM previews want. The arena and the reference
   * bench pass `false` and put `paintLaurel` on as its own layer: the sheet
   * must not show a wreath it does not want painted, and the arena has to be
   * able to lay ONE wreath over a stone it got as a bitmap.
   */
  laurel?: boolean
  /**
   * Draw the Lv 2 crest (the little gold plaque with the level on it) into the
   * stone. Default true, for the same reason `laurel` is: a DOM preview wants
   * one self-contained drawing.
   *
   * The arena passes `false` and puts the crest on as part of its own upright
   * ornament layer, because the arena TURNS a stone to face the way it fires
   * — and a level plaque that rotates with it is unreadable at the two
   * facings that put it on its side or its head.
   */
  crest?: boolean
}

export interface TileOpts {
  owner: Owner
  faction?: Faction | null
}

/** Fraction of the frame's edge that is ornament (the nine-slice cap). */
export const FRAME_CAP = 0.12

/** Board colours shared with the renderer's HUD. */
export const PLAYER_TILE = '#4aa8ff'
export const GRID_GLOW = '#9b6bff'
export const GOLD = '#ffd75e'
const GOLD_LIGHT = '#ffefb0'
const GOLD_DEEP = '#a8741a'
const GOLD_DARK = '#5a3a06'

// ─── Colour maths ───────────────────────────────────────────────────────────

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

const rgbCache = new Map<string, readonly [number, number, number]>()
export const hexRgb = (hex: string): readonly [number, number, number] => {
  let v = rgbCache.get(hex)
  if (!v) {
    const h = hex.replace('#', '')
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    rgbCache.set(hex, v)
  }
  return v
}

const hex2 = (n: number): string => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')

/** `t` of the way from `a` to `b`, as hex. */
export const mixHex = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = hexRgb(a)
  const [br, bg, bb] = hexRgb(b)
  const k = clamp01(t)
  return `#${hex2(ar + (br - ar) * k)}${hex2(ag + (bg - ag) * k)}${hex2(ab + (bb - ab) * k)}`
}
const lighten = (hex: string, t: number): string => mixHex(hex, '#ffffff', t)
const darken = (hex: string, t: number): string => mixHex(hex, '#000000', t)

const rgba = (hex: string, alpha: number): string => {
  const [r, g, b] = hexRgb(hex)
  return `rgba(${r},${g},${b},${Math.round(clamp01(alpha) * 1000) / 1000})`
}

// ─── Deterministic noise ────────────────────────────────────────────────────

const makeRng = (seed: number): (() => number) => {
  let s = seed
  return () => {
    const [v, next] = rand(s)
    s = next
    return v
  }
}

const TAU = Math.PI * 2
const angDiff = (a: number, b: number): number => {
  let d = (a - b) % TAU
  if (d > Math.PI) d -= TAU
  if (d < -Math.PI) d += TAU
  return d
}
const gauss = (u: number): number => Math.exp(-u * u)

// Seeds `stoneOutline`, so a knapped stone of one rune is not the knapped
// stone of another. The VALUE is arbitrary but load-bearing: change one and
// that rune's raw stones are re-knapped, silently. New types append; they
// never renumber the ones that shipped.
const TYPE_IDX: Record<RuneType, number> =
  { melee: 1, archer: 2, mage: 3, defense: 4, support: 5, cleave: 6, roller: 7, bombard: 8, nuker: 9, crown: 10 }
const CUT_IDX: Record<StoneCut, number> = {
  carved: 1, knapped: 2, polished: 3, faceted: 4, quarried: 5, slab: 6, step: 7, cabochon: 8, brilliant: 9
}

/**
 * The seed `paintPebble` knaps a stone with. Exported so a tool that redraws a
 * stone outside the canvas (the splash tile, `tools/splash-tile.mjs`) draws
 * THIS stone and not a sibling with its flakes in other places.
 */
export const pebbleSeed = (type: RuneType, cut: StoneCut): number =>
  seedFrom(TYPE_IDX[type] * 7919 + 17, CUT_IDX[cut] * 104729)

// ─── Outlines ───────────────────────────────────────────────────────────────

export interface Pt { x: number; y: number }

/**
 * ─── The rune says the SHAPE, the skin says the CUT ─────────────────────────
 *
 * A stone has to say which rune it is twice over. The glyph is one of those,
 * and at hand-tray size it is four dark strokes in a hole; the SILHOUETTE is
 * the other, and it is the whole object. So the outline belongs to the rune
 * TYPE — a shield is blocky and flat-topped, a bow is a slim spindle, an axe
 * is a bit with two horns — and the skin only decides how that outline is
 * worked: carved with a border, knapped into flats, worn round, blunted into a
 * slab, cut as a gem.
 *
 * It was the other way round once, and that is the bug this split fixes: the
 * SKIN owned the shape, so all ten runes of a skin were one outline with ten
 * different glyphs cut into it, and the shape said nothing at all.
 *
 * A profile is HALF an outline — the right side, from the apex on the axis
 * down to the foot on the axis — as cubic segments, mirrored to the left. Two
 * reasons it is written that way and not drawn freehand: the two sides come
 * out exactly equal (a hand-wobbled plaque reads as a mistake where a
 * hand-wobbled pebble reads as a pebble), and every one of the nine cuts can
 * be applied to the same few control points instead of nine drawings each.
 * None of them draws a random number: same rune, same skin, same stone, always.
 */
export interface RuneProfile {
  /** The right half, apex → foot, as cubic beziers. First point and last point sit on x = 0. */
  half: readonly (readonly [Pt, Pt, Pt, Pt])[]
  /** Samples per segment. A cut scales these; FEW samples leave the curve as visible flats. */
  steps: readonly number[]
  /**
   * The glyph's extent as a multiple of the stone's radius, and how far down
   * its centre sits. Both are the PROFILE's, because they are questions about
   * this silhouette: a mortar's field is low and a crown's is under the peaks.
   */
  glyph: { scale: number; drop: number }
}

const pt = (x: number, y: number): Pt => ({ x, y })
type Seg = readonly [Pt, Pt, Pt, Pt]
const seg = (a: Pt, b: Pt, c: Pt, d: Pt): Seg => [a, b, c, d]

export const RUNE_PROFILES: Record<RuneType, RuneProfile> = {
  // Sword — the blade. The original carved plaque, and the shape every other
  // one is read against: a sharp point at the top, shoulders sweeping down into
  // a full belly, a round base.
  melee: {
    half: [
      seg(pt(0, -1), pt(0.12, -0.965), pt(0.58, -0.80), pt(0.78, -0.42)),
      seg(pt(0.78, -0.42), pt(0.96, -0.02), pt(0.90, 0.52), pt(0.50, 0.87)),
      seg(pt(0.50, 0.87), pt(0.33, 0.99), pt(0.16, 1), pt(0, 1))
    ],
    steps: [7, 12, 7],
    glyph: { scale: 0.90, drop: 0.11 }
  },
  // Bow — the spindle. The narrow one: long tapers at both ends and a belly
  // only two thirds as wide as the stone is tall.
  archer: {
    half: [
      seg(pt(0, -1), pt(0.06, -0.96), pt(0.30, -0.90), pt(0.50, -0.62)),
      seg(pt(0.50, -0.62), pt(0.74, -0.26), pt(0.74, 0.26), pt(0.50, 0.62)),
      seg(pt(0.50, 0.62), pt(0.30, 0.90), pt(0.06, 0.96), pt(0, 1))
    ],
    steps: [8, 12, 8],
    glyph: { scale: 0.74, drop: 0 }
  },
  // Orb — the egg. Smooth all the way round, no corner anywhere, taller than
  // it is wide so it never reads as the boulder.
  mage: {
    half: [
      seg(pt(0, -1), pt(0.36, -0.99), pt(0.70, -0.76), pt(0.80, -0.42)),
      seg(pt(0.80, -0.42), pt(0.90, -0.05), pt(0.90, 0.30), pt(0.78, 0.62)),
      seg(pt(0.78, 0.62), pt(0.62, 0.90), pt(0.34, 1.0), pt(0, 1))
    ],
    steps: [9, 13, 9],
    glyph: { scale: 0.88, drop: 0.02 }
  },
  // Shield — the block. The widest stone, and the ONLY one whose point is at
  // the BOTTOM: a flat top with square shoulders, straight sides, a blunt point
  // under it. A heater shield lying on its face.
  defense: {
    half: [
      seg(pt(0, -1), pt(0.44, -1.0), pt(0.78, -1.0), pt(0.95, -0.92)),
      seg(pt(0.95, -0.92), pt(1.0, -0.86), pt(1.0, 0.10), pt(0.94, 0.34)),
      seg(pt(0.94, 0.34), pt(0.80, 0.78), pt(0.42, 0.96), pt(0, 1))
    ],
    steps: [5, 8, 9],
    glyph: { scale: 1.0, drop: -0.08 }
  },
  // Cross — the quatrefoil. Four shallow lobes with a soft armpit between
  // them: a medallion that is already a cross before the glyph is cut into it.
  support: {
    half: [
      seg(pt(0, -1), pt(0.26, -0.99), pt(0.40, -0.94), pt(0.44, -0.72)),
      seg(pt(0.44, -0.72), pt(0.48, -0.56), pt(0.62, -0.48), pt(0.76, -0.46)),
      seg(pt(0.76, -0.46), pt(0.92, -0.44), pt(0.99, -0.30), pt(0.99, -0.02)),
      seg(pt(0.99, -0.02), pt(0.99, 0.26), pt(0.92, 0.42), pt(0.74, 0.44)),
      seg(pt(0.74, 0.44), pt(0.60, 0.46), pt(0.46, 0.56), pt(0.44, 0.74)),
      seg(pt(0.44, 0.74), pt(0.42, 0.94), pt(0.26, 0.99), pt(0, 1))
    ],
    steps: [5, 4, 5, 4, 5, 5],
    glyph: { scale: 0.84, drop: 0 }
  },
  // Axe — the bit. Narrow at the poll, flaring into a crescent whose two horns
  // are the LOWEST points on the stone, with the cutting edge curving back up
  // between them. The one outline that is not lowest on the axis.
  cleave: {
    half: [
      seg(pt(0, -1), pt(0.20, -0.99), pt(0.38, -0.94), pt(0.50, -0.82)),
      seg(pt(0.50, -0.82), pt(0.72, -0.62), pt(0.86, -0.28), pt(0.90, 0.10)),
      seg(pt(0.90, 0.10), pt(0.95, 0.50), pt(0.95, 0.88), pt(0.92, 1.0)),
      seg(pt(0.92, 1.0), pt(0.72, 0.80), pt(0.34, 0.60), pt(0, 0.55))
    ],
    steps: [5, 7, 7, 7],
    glyph: { scale: 1.0, drop: -0.05 }
  },
  // Boulder — the squat round. Wider than it is tall, with a knocked flat down
  // each side (two samples on that segment, so it is a chord and not a curve).
  roller: {
    half: [
      seg(pt(0, -0.88), pt(0.34, -0.86), pt(0.70, -0.74), pt(0.86, -0.52)),
      seg(pt(0.86, -0.52), pt(1.0, -0.30), pt(1.0, 0.16), pt(0.90, 0.44)),
      seg(pt(0.90, 0.44), pt(0.78, 0.72), pt(0.42, 0.88), pt(0, 0.88))
    ],
    steps: [7, 2, 7],
    glyph: { scale: 0.98, drop: 0.0 }
  },
  // Mortar — the base plate. Narrow and flat at the top, flaring the whole way
  // down to a wide plate with SQUARE bottom corners and a dead-flat foot.
  bombard: {
    half: [
      seg(pt(0, -1), pt(0.20, -1.0), pt(0.32, -0.99), pt(0.36, -0.88)),
      seg(pt(0.36, -0.88), pt(0.42, -0.52), pt(0.60, -0.12), pt(0.74, 0.28)),
      seg(pt(0.74, 0.28), pt(0.86, 0.54), pt(0.98, 0.60), pt(1.0, 0.72)),
      seg(pt(1.0, 0.72), pt(1.0, 0.90), pt(0.99, 1.0), pt(0.84, 1.0)),
      seg(pt(0.84, 1.0), pt(0.56, 1.0), pt(0.28, 1.0), pt(0, 1))
    ],
    steps: [3, 8, 4, 3, 3],
    glyph: { scale: 0.92, drop: 0.18 }
  },
  // Warhead — the spike. A needle apex over a narrow body, with a hard STEP out
  // to a collar near the foot: the thinnest body on the roster, as the roster
  // says it should be.
  nuker: {
    half: [
      seg(pt(0, -1), pt(0.06, -0.97), pt(0.20, -0.86), pt(0.30, -0.60)),
      seg(pt(0.30, -0.60), pt(0.44, -0.22), pt(0.56, 0.14), pt(0.62, 0.42)),
      seg(pt(0.62, 0.42), pt(0.64, 0.50), pt(0.80, 0.52), pt(0.82, 0.56)),
      seg(pt(0.82, 0.56), pt(0.84, 0.74), pt(0.80, 0.92), pt(0.70, 1.0)),
      seg(pt(0.70, 1.0), pt(0.46, 1.0), pt(0.22, 1.0), pt(0, 1))
    ],
    steps: [6, 8, 2, 4, 3],
    glyph: { scale: 0.82, drop: 0.22 }
  },
  // Crown — the three peaks. The band is the body; the peaks are the top edge,
  // and they are what a player sees first at hand-tray size.
  crown: {
    half: [
      seg(pt(0, -1), pt(0.10, -1.0), pt(0.18, -0.96), pt(0.24, -0.72)),
      seg(pt(0.24, -0.72), pt(0.30, -0.52), pt(0.38, -0.44), pt(0.46, -0.52)),
      seg(pt(0.46, -0.52), pt(0.54, -0.62), pt(0.62, -0.82), pt(0.70, -0.94)),
      seg(pt(0.70, -0.94), pt(0.80, -0.70), pt(0.88, -0.44), pt(0.92, -0.16)),
      seg(pt(0.92, -0.16), pt(0.98, 0.10), pt(1.0, 0.46), pt(0.94, 0.80)),
      seg(pt(0.94, 0.80), pt(0.90, 0.94), pt(0.80, 1.0), pt(0, 1))
    ],
    steps: [4, 4, 4, 5, 6, 4],
    glyph: { scale: 0.92, drop: 0.26 }
  }
}

/**
 * How a skin works the rune's silhouette. Five knobs, nine skins — because the
 * family resemblance is the point: a jade bow and a marble bow have to read as
 * the same object in two materials, and a jade bow and a jade shield have to
 * read as two different runes in the same one.
 */
interface Cut {
  /** Samples per segment, as a multiple of the profile's own. Under 1 leaves flats. */
  density: number
  /** Width bias: the rune's proportions, nudged by what the material wants to be. */
  wide: number
  /** Corner-rounding passes. Sharp corners round off; smooth runs barely move. */
  smooth: number
  /** Toward the block it was cut from: 0 the rune's own outline, 1 a rectangle. */
  blunt: number
  /** Radial jitter, so a knapped stone is not a machined one. */
  knap: number
  /** A raised border round a sunken field — see `paintFrame`. Carved stones only. */
  framed: boolean
}

const CUTS: Record<StoneCut, Cut> = {
  // River: the reference. The rune's outline exactly as it is written, carved
  // smooth, with the border that gives the glyph a field to sit in.
  carved: { density: 1, wide: 1, smooth: 0, blunt: 0, knap: 0, framed: true },
  // Obsidian: knapped. Few samples, so the sides are long straight chords, and
  // a little radial jitter so no two flakes come off the same.
  knapped: { density: 0.38, wide: 0.98, smooth: 0, blunt: 0, knap: 0.1, framed: false },
  // Jade: worn. Every corner rounded off — a point becomes a nose — and a
  // touch narrower, the way a thing carried in a pocket ends up.
  polished: { density: 1.3, wide: 0.96, smooth: 3, blunt: 0, knap: 0, framed: true },
  // Amber: cut. The same outline sampled coarsely, so the light breaks along an
  // edge instead of sliding round a curve.
  faceted: { density: 0.42, wide: 0.97, smooth: 0, blunt: 0, knap: 0, framed: true },
  // Marble: quarried. Broader and heavier, its sides filled part of the way out
  // toward the block — a stone that was cut down rather than shaped.
  quarried: { density: 0.9, wide: 1.04, smooth: 0, blunt: 0.2, knap: 0, framed: true },
  // Ember: a slab. Blunted a third of the way to a rectangle and then rounded
  // off — a THIRD and not a half, because at a half a bow and an orb come back
  // as the same rounded brick and the silhouette has stopped saying anything.
  slab: { density: 0.7, wide: 1.02, smooth: 2, blunt: 0.32, knap: 0.04, framed: false },
  // Sapphire: a step cut. The coarsest sampling of the nine — long hard flats
  // with chamfered corners, and squared off toward the table.
  step: { density: 0.3, wide: 1.0, smooth: 0, blunt: 0.24, knap: 0, framed: false },
  // Ruby: a cabochon. Rounded until there is not a facet left on it, and a
  // little plumper than the rune draws itself.
  cabochon: { density: 1.4, wide: 1.03, smooth: 5, blunt: 0, knap: 0, framed: false },
  // Diamond: brilliant. Many small crisp flats and the faintest irregularity,
  // so the girdle sparkles instead of reading as a machined outline.
  brilliant: { density: 0.6, wide: 0.99, smooth: 0, blunt: 0, knap: 0.05, framed: false }
}

/** Whether this cut carries a raised border round a sunken field. */
export const cutIsFramed = (cut: StoneCut): boolean => CUTS[cut]!.framed

const bezier = (s: Seg, t: number): Pt => {
  const u = 1 - t
  const [p0, p1, p2, p3] = s
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
  }
}

/** One pass of corner rounding: every vertex slides halfway toward its neighbours' midpoint. */
const roundOff = (pts: Pt[]): Pt[] =>
  pts.map((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length]!
    const b = pts[(i + 1) % pts.length]!
    return { x: (p.x + (a.x + b.x) / 2) / 2, y: (p.y + (a.y + b.y) / 2) / 2 }
  })

/**
 * Toward the block: each point slides out along its own ray to where that ray
 * leaves the outline's bounding rectangle. The extremes do not move (their ray
 * already leaves at the box), so a blunted stone keeps the rune's silhouette at
 * its corners and fills out everywhere between — a slab of THIS rune, not a
 * slab of nothing.
 */
const towardBlock = (pts: Pt[], t: number): Pt[] => {
  if (t <= 0) return pts
  let hw = 0
  let hh = 0
  for (const p of pts) { hw = Math.max(hw, Math.abs(p.x)); hh = Math.max(hh, Math.abs(p.y)) }
  if (hw <= 0 || hh <= 0) return pts
  return pts.map((p) => {
    const r = Math.hypot(p.x, p.y)
    if (r < 1e-9) return p
    const dx = p.x / r
    const dy = p.y / r
    const box = Math.min(Math.abs(dx) < 1e-9 ? Infinity : hw / Math.abs(dx), Math.abs(dy) < 1e-9 ? Infinity : hh / Math.abs(dy))
    const k = (r + (box - r) * t) / r
    return { x: p.x * k, y: p.y * k }
  })
}

/**
 * The silhouette of a stone as a closed polygon in a unit box: every point has
 * |x| ≤ 1 and |y| ≤ 1 and at least one touches ±1, so a caller scales by ONE
 * radius. The RUNE decides the shape, the CUT decides the finish, and `seed`
 * only ever moves a cut that has chance in it (the knapped ones).
 */
export const stoneOutline = (cut: StoneCut, type: RuneType, seed: number): Pt[] => {
  const profile = RUNE_PROFILES[type]!
  const f = CUTS[cut]!

  // Down the right side from the apex…
  const right: Pt[] = []
  for (const [i, s] of profile.half.entries()) {
    const steps = Math.max(1, Math.round((profile.steps[i] ?? 6) * f.density))
    for (let k = i === 0 ? 0 : 1; k <= steps; k++) right.push(bezier(s, k / steps))
  }
  // …and back up the left, skipping the two points that sit on the axis.
  let pts = [...right]
  for (let i = right.length - 2; i >= 1; i--) {
    const q = right[i]!
    pts.push({ x: -q.x, y: q.y })
  }

  if (f.wide !== 1) pts = pts.map((p) => ({ x: p.x * f.wide, y: p.y }))
  pts = towardBlock(pts, f.blunt)
  for (let i = 0; i < f.smooth; i++) pts = roundOff(pts)
  if (f.knap > 0) {
    // After the mirror on purpose: a knapped stone that is perfectly symmetric
    // reads as a machined one, which is the opposite of the point.
    const rng = makeRng(seed ^ 0x7d)
    pts = pts.map((p) => {
      const k = 1 + (rng() - 0.5) * 2 * f.knap
      return { x: p.x * k, y: p.y * k }
    })
  }

  // Normalise so the widest extent touches the unit box.
  let m = 0
  for (const p of pts) m = Math.max(m, Math.abs(p.x), Math.abs(p.y))
  if (m > 0) for (const p of pts) { p.x /= m; p.y /= m }
  return pts
}

const trace = (ctx: CanvasRenderingContext2D, pts: readonly Pt[], cx: number, cy: number, R: number, ox = 0, oy = 0): void => {
  ctx.beginPath()
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    const x = cx + ox + p.x * R
    const y = cy + oy + p.y * R
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

// ─── Materials ──────────────────────────────────────────────────────────────

export type Material =
  | 'sandstone' | 'obsidian' | 'jade' | 'amber' | 'marble' | 'lava'
  | 'sapphire' | 'ruby' | 'diamond'

/** The way the glyph is cut tells you what the stone is made of. */
export const materialOf = (style: GlyphStyle): Material => {
  switch (style) {
    case 'neon': return 'obsidian'
    case 'inlay': return 'jade'
    case 'gem': return 'amber'
    case 'carved': return 'marble'
    case 'ember': return 'lava'
    case 'starcut': return 'sapphire'
    case 'blood': return 'ruby'
    case 'prism': return 'diamond'
    default: return 'sandstone'
  }
}

/** The enemy's stone: the same sandstone, fired rust-red. */
export const ENEMY_STONE: SkinDef = {
  id: 'river', price: 0, cut: 'carved', glyph: 'engraved',
  hi: '#d4886a', base: '#9c4b3a', lo: '#4a1c16', rim: '#ffb89c', ink: '#1e0c09', glow: null
}

const enemyStoneCache = new Map<string, SkinDef>()

/** The enemy stone tinted a little toward its faction, so a goblin's and an orc's still differ. */
export const enemyStone = (faction: Faction | null): SkinDef => {
  const key = faction ?? '-'
  const hit = enemyStoneCache.get(key)
  if (hit) return hit
  if (!faction) { enemyStoneCache.set(key, ENEMY_STONE); return ENEMY_STONE }
  const c = FACTION_DEFS[faction].color
  const def: SkinDef = {
    ...ENEMY_STONE,
    hi: mixHex(ENEMY_STONE.hi, c, 0.22),
    base: mixHex(ENEMY_STONE.base, c, 0.16),
    lo: mixHex(ENEMY_STONE.lo, c, 0.1),
    rim: mixHex(ENEMY_STONE.rim, c, 0.55)
  }
  enemyStoneCache.set(key, def)
  return def
}

/** The glyph's glow for a stone: the skin's own, or the rune type's neon. */
export const resolveGlow = (skin: SkinDef, type: RuneType): string => skin.glow ?? RUNES[type].color

interface Body {
  cx: number
  cy: number
  R: number
  pts: readonly Pt[]
  skin: SkinDef
  seed: number
  /** The halo colour under the stone. */
  glow: string
}

const paintSandstone = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, skin } = b
  const rng = makeRng(b.seed ^ 0x51)
  // Grain.
  for (let i = 0; i < 110; i++) {
    const x = cx + (rng() - 0.5) * 2.1 * R
    const y = cy + (rng() - 0.5) * 1.9 * R
    const r = R * (0.012 + rng() * 0.02)
    ctx.fillStyle = rng() < 0.45 ? rgba('#ffffff', 0.05 + rng() * 0.1) : rgba(skin.lo, 0.12 + rng() * 0.16)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.fill()
  }
  // Sediment bands.
  ctx.strokeStyle = rgba(skin.lo, 0.14)
  ctx.lineWidth = R * 0.06
  ctx.lineCap = 'round'
  for (let k = 0; k < 2; k++) {
    const y0 = cy + (rng() * 1.2 - 0.6) * R
    ctx.beginPath()
    ctx.moveTo(cx - 1.1 * R, y0 + (rng() - 0.5) * 0.2 * R)
    ctx.quadraticCurveTo(cx, y0 + (rng() - 0.5) * 0.5 * R, cx + 1.1 * R, y0 + (rng() - 0.5) * 0.3 * R)
    ctx.stroke()
  }
  // Chips near the rim: a dark hollow with a lit lower edge.
  for (let k = 0; k < 2; k++) {
    const th = rng() * TAU
    const px = cx + Math.cos(th) * R * 0.8
    const py = cy + Math.sin(th) * R * 0.7
    const r = R * (0.07 + rng() * 0.06)
    ctx.fillStyle = rgba(skin.lo, 0.45)
    ctx.beginPath()
    ctx.ellipse(px, py, r, r * 0.75, th, 0, TAU)
    ctx.fill()
    ctx.fillStyle = rgba(lighten(skin.hi, 0.2), 0.4)
    ctx.beginPath()
    ctx.ellipse(px + r * 0.22, py + r * 0.25, r * 0.7, r * 0.45, th, 0, TAU)
    ctx.fill()
  }
}

const paintObsidian = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, pts, skin } = b
  const rng = makeRng(b.seed ^ 0x93)
  // Knapped facets radiating from a flake point.
  const ox = cx - R * 0.35
  const oy = cy - R * 0.4
  const step = Math.max(1, Math.floor(pts.length / 7))
  let k = 0
  for (let i = 0; i < pts.length; i += step, k++) {
    const p0 = pts[i]!
    const p1 = pts[(i + step) % pts.length]!
    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(cx + p0.x * R, cy + p0.y * R)
    ctx.lineTo(cx + p1.x * R, cy + p1.y * R)
    ctx.closePath()
    ctx.fillStyle = rgba(k % 2 === 0 ? skin.hi : skin.lo, 0.1 + rng() * 0.14)
    ctx.fill()
    ctx.strokeStyle = rgba(skin.rim, 0.22)
    ctx.lineWidth = Math.max(0.5, R * 0.012)
    ctx.stroke()
  }
  // Conchoidal ripples.
  ctx.strokeStyle = rgba(skin.rim, 0.08)
  ctx.lineWidth = R * 0.02
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(ox, oy, R * (0.4 + i * 0.28), 0, TAU)
    ctx.stroke()
  }
  // Specular streak.
  ctx.fillStyle = rgba('#ffffff', 0.32)
  ctx.beginPath()
  ctx.ellipse(cx - R * 0.3, cy - R * 0.42, R * 0.36, R * 0.09, -0.6, 0, TAU)
  ctx.fill()
}

const paintJade = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, skin } = b
  const rng = makeRng(b.seed ^ 0x2b)
  // Cloudy translucence.
  for (let k = 0; k < 4; k++) {
    const bx = cx + (rng() - 0.5) * 1.4 * R
    const by = cy + (rng() - 0.5) * 1.2 * R
    const rad = R * (0.25 + rng() * 0.3)
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, rad)
    g.addColorStop(0, rgba(lighten(skin.hi, 0.2), 0.35))
    g.addColorStop(1, rgba(skin.hi, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(bx, by, rad, 0, TAU)
    ctx.fill()
  }
  // Dark veins.
  ctx.strokeStyle = rgba(darken(skin.lo, 0.2), 0.3)
  ctx.lineWidth = R * 0.03
  ctx.lineCap = 'round'
  for (let k = 0; k < 2; k++) {
    let x = cx + (rng() - 0.5) * 1.6 * R
    let y = cy - R
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < 6; s++) {
      x += (rng() - 0.5) * 0.5 * R
      y += 0.35 * R
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  // Gloss.
  ctx.fillStyle = rgba('#ffffff', 0.22)
  ctx.beginPath()
  ctx.ellipse(cx - R * 0.3, cy - R * 0.38, R * 0.42, R * 0.2, -0.5, 0, TAU)
  ctx.fill()
  ctx.fillStyle = rgba('#ffffff', 0.6)
  ctx.beginPath()
  ctx.arc(cx - R * 0.45, cy - R * 0.48, R * 0.07, 0, TAU)
  ctx.fill()
}

const paintAmber = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, pts, skin } = b
  const rng = makeRng(b.seed ^ 0x77)
  const glowC = skin.glow ?? skin.rim
  // Lit from inside.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(cx, cy + R * 0.1, 0, cx, cy, R * 0.9)
  g.addColorStop(0, rgba(glowC, 0.5))
  g.addColorStop(1, rgba(glowC, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, TAU)
  ctx.fill()
  ctx.restore()
  // Inclusions and bubbles.
  for (let k = 0; k < 9; k++) {
    ctx.fillStyle = rgba(skin.lo, 0.7)
    ctx.beginPath()
    ctx.arc(cx + (rng() - 0.5) * 1.5 * R, cy + (rng() - 0.5) * 1.5 * R, R * (0.015 + rng() * 0.03), 0, TAU)
    ctx.fill()
  }
  ctx.strokeStyle = rgba('#ffffff', 0.5)
  ctx.lineWidth = Math.max(0.5, R * 0.012)
  for (let k = 0; k < 3; k++) {
    ctx.beginPath()
    ctx.arc(cx + (rng() - 0.5) * 1.3 * R, cy + (rng() - 0.5) * 1.3 * R, R * (0.03 + rng() * 0.03), 0, TAU)
    ctx.stroke()
  }
  // Facets: the table and the spokes to the girdle.
  ctx.strokeStyle = rgba(skin.rim, 0.35)
  ctx.lineWidth = Math.max(0.5, R * 0.02)
  trace(ctx, pts, cx, cy, R * 0.68)
  ctx.stroke()
  if (pts.length <= 8) {
    ctx.beginPath()
    for (const p of pts) {
      ctx.moveTo(cx + p.x * R, cy + p.y * R)
      ctx.lineTo(cx + p.x * R * 0.68, cy + p.y * R * 0.68)
    }
    ctx.stroke()
  }
  // Gloss on the table.
  ctx.fillStyle = rgba('#ffffff', 0.18)
  ctx.beginPath()
  ctx.ellipse(cx - R * 0.25, cy - R * 0.3, R * 0.3, R * 0.14, -0.6, 0, TAU)
  ctx.fill()
}

const paintMarble = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, skin } = b
  const rng = makeRng(b.seed ^ 0xa5)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // Veins: a grey line with a lighter ghost beside it.
  for (let k = 0; k < 3; k++) {
    const startX = cx + (rng() - 0.5) * 1.8 * R
    let x = startX
    let y = cy - R * 1.05
    const seg: Pt[] = [{ x, y }]
    for (let s = 0; s < 7; s++) {
      x += (rng() - 0.5) * 0.55 * R
      y += 0.32 * R
      seg.push({ x, y })
    }
    const draw = (ox: number, oy: number, style: string, width: number): void => {
      ctx.strokeStyle = style
      ctx.lineWidth = width
      ctx.beginPath()
      for (let i = 0; i < seg.length; i++) {
        const p = seg[i]!
        if (i === 0) ctx.moveTo(p.x + ox, p.y + oy)
        else ctx.lineTo(p.x + ox, p.y + oy)
      }
      ctx.stroke()
    }
    draw(R * 0.03, R * 0.03, rgba('#ffffff', 0.35), R * (0.02 + rng() * 0.02))
    draw(0, 0, rgba(skin.lo, 0.28 + k * 0.1), R * (0.015 + rng() * 0.03))
  }
  // A faint secondary network.
  ctx.strokeStyle = rgba(skin.lo, 0.12)
  ctx.lineWidth = Math.max(0.5, R * 0.012)
  for (let k = 0; k < 4; k++) {
    const x = cx + (rng() - 0.5) * 1.6 * R
    const y = cy + (rng() - 0.5) * 1.6 * R
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (rng() - 0.5) * 0.6 * R, y + (rng() - 0.5) * 0.6 * R)
    ctx.stroke()
  }
  // Polish.
  ctx.fillStyle = rgba('#ffffff', 0.3)
  ctx.beginPath()
  ctx.ellipse(cx - R * 0.32, cy - R * 0.4, R * 0.4, R * 0.18, -0.55, 0, TAU)
  ctx.fill()
}

const paintLava = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, skin } = b
  const rng = makeRng(b.seed ^ 0xe1)
  const glowC = skin.glow ?? '#ffb060'
  // The crust darkens toward the edge.
  const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.1)
  g.addColorStop(0, rgba(skin.lo, 0))
  g.addColorStop(1, rgba(darken(skin.lo, 0.4), 0.55))
  ctx.fillStyle = g
  ctx.fillRect(cx - R * 1.2, cy - R * 1.2, R * 2.4, R * 2.4)
  // Fissures: magma showing through, in three passes.
  const cracks: Pt[][] = []
  for (let k = 0; k < 6; k++) {
    const th = (k / 6) * TAU + rng() * 0.8
    let x = cx + Math.cos(th) * R * 0.15
    let y = cy + Math.sin(th) * R * 0.15
    const seg: Pt[] = [{ x, y }]
    for (let s = 0; s < 4; s++) {
      x += Math.cos(th + (rng() - 0.5) * 1.2) * R * 0.28
      y += Math.sin(th + (rng() - 0.5) * 1.2) * R * 0.28
      seg.push({ x, y })
    }
    cracks.push(seg)
  }
  const pass = (style: string, width: number, additive: boolean): void => {
    ctx.save()
    if (additive) ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = style
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (const seg of cracks) {
      for (let i = 0; i < seg.length; i++) {
        const p = seg[i]!
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
    }
    ctx.stroke()
    ctx.restore()
  }
  pass(rgba(glowC, 0.45), R * 0.1, true)
  pass(skin.ink, R * 0.032, false)
  pass(rgba('#fff0c0', 0.55), R * 0.012, true)
  // Char.
  for (let k = 0; k < 10; k++) {
    ctx.fillStyle = rgba('#000000', 0.35)
    ctx.beginPath()
    ctx.arc(cx + (rng() - 0.5) * 1.7 * R, cy + (rng() - 0.5) * 1.5 * R, R * (0.02 + rng() * 0.03), 0, TAU)
    ctx.fill()
  }
}

/**
 * Sapphire: a STEP cut, so the light is in long straight bands rather than
 * sparkles — the facets run parallel to the girdle, and the table holds a
 * six-armed star of white where the light gathers.
 */
const paintSapphire = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, skin } = b
  const rng = makeRng(b.seed ^ 0x3f)
  // Step facets: bands parallel to the outline, each a shade of its own.
  for (let k = 0; k < 4; k++) {
    const t = 1 - k * 0.2
    const g = ctx.createLinearGradient(cx - R * t, cy - R * t, cx + R * t, cy + R * t)
    g.addColorStop(0, rgba(lighten(skin.hi, 0.25), 0.28 - k * 0.04))
    g.addColorStop(0.55, rgba(skin.base, 0))
    g.addColorStop(1, rgba(darken(skin.lo, 0.3), 0.3))
    ctx.strokeStyle = g
    ctx.lineWidth = R * 0.13
    ctx.lineJoin = 'round'
    trace(ctx, b.pts, cx, cy, R * t)
    ctx.stroke()
  }
  // The table: a flat plane across the middle, brighter than the steps round it.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const table = ctx.createLinearGradient(cx - R * 0.5, cy - R * 0.5, cx + R * 0.4, cy + R * 0.5)
  table.addColorStop(0, rgba(skin.rim, 0.3))
  table.addColorStop(0.7, rgba(skin.hi, 0.05))
  ctx.fillStyle = table
  trace(ctx, b.pts, cx, cy, R * 0.52)
  ctx.fill()
  // The star under the table: six short arms of white.
  ctx.strokeStyle = rgba('#ffffff', 0.5)
  ctx.lineWidth = Math.max(0.6, R * 0.018)
  ctx.lineCap = 'round'
  for (let k = 0; k < 6; k++) {
    const th = (k / 6) * TAU + 0.3
    ctx.beginPath()
    ctx.moveTo(cx - R * 0.06, cy - R * 0.08)
    ctx.lineTo(cx - R * 0.06 + Math.cos(th) * R * 0.42, cy - R * 0.08 + Math.sin(th) * R * 0.42)
    ctx.stroke()
  }
  ctx.restore()
  // A couple of internal reflections, off-centre so it does not read as a logo.
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = rgba('#ffffff', 0.1 + rng() * 0.12)
    ctx.beginPath()
    ctx.ellipse(cx + (rng() - 0.5) * 1.2 * R, cy + (rng() - 0.5) * 1.2 * R, R * 0.2, R * 0.05, rng() * TAU, 0, TAU)
    ctx.fill()
  }
}

/**
 * Ruby: a CABOCHON, so there is no facet at all — one dome, one long highlight
 * sliding round it, and the deep red glow of light that went in and came back
 * out. The dark heart under the highlight is what makes it read as a dome
 * rather than as a red disc.
 */
const paintRuby = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, skin } = b
  const rng = makeRng(b.seed ^ 0x6c)
  // The dome: deep in the middle, hot toward the rim where light escapes.
  const dome = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.3, R * 0.05, cx, cy, R * 1.05)
  dome.addColorStop(0, rgba(lighten(skin.hi, 0.3), 0.55))
  dome.addColorStop(0.42, rgba(skin.base, 0.15))
  dome.addColorStop(0.78, rgba(darken(skin.lo, 0.25), 0.5))
  dome.addColorStop(1, rgba(skin.rim, 0.35))
  ctx.fillStyle = dome
  ctx.fillRect(cx - R * 1.2, cy - R * 1.2, R * 2.4, R * 2.4)
  // Silk: the fine parallel needles a cabochon ruby is cut to show.
  ctx.strokeStyle = rgba(lighten(skin.hi, 0.4), 0.14)
  ctx.lineWidth = Math.max(0.5, R * 0.014)
  for (let k = 0; k < 7; k++) {
    const off = (k - 3) * R * 0.22
    ctx.beginPath()
    ctx.moveTo(cx - R * 0.9 + off * 0.3, cy + off)
    ctx.lineTo(cx + R * 0.9 + off * 0.3, cy + off * 0.6)
    ctx.stroke()
  }
  // The highlight, and its small companion — the two marks that say "dome".
  ctx.fillStyle = rgba('#ffffff', 0.5)
  ctx.beginPath()
  ctx.ellipse(cx - R * 0.32, cy - R * 0.4, R * 0.34, R * 0.15, -0.55, 0, TAU)
  ctx.fill()
  ctx.fillStyle = rgba('#ffffff', 0.75)
  ctx.beginPath()
  ctx.arc(cx - R * 0.46, cy - R * 0.48, R * 0.07, 0, TAU)
  ctx.fill()
  // Bounced light pooling at the bottom of the dome.
  const pool = ctx.createRadialGradient(cx + R * 0.2, cy + R * 0.52, 0, cx + R * 0.2, cy + R * 0.52, R * 0.6)
  pool.addColorStop(0, rgba(skin.rim, 0.3 + rng() * 0.1))
  pool.addColorStop(1, rgba(skin.rim, 0))
  ctx.fillStyle = pool
  ctx.fillRect(cx - R * 1.2, cy - R * 1.2, R * 2.4, R * 2.4)
}

/**
 * Diamond: BRILLIANT cut, and the only stone with no colour of its own. All of
 * its character is the light it splits — small hard facets, a hot white
 * highlight, and three tiny spectral flashes. The flashes are the whole reason
 * this material exists; without them a colourless gem is a grey pebble.
 */
const paintDiamond = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, pts, skin } = b
  const rng = makeRng(b.seed ^ 0xd1)
  // Kite facets from the girdle to the table.
  const step = Math.max(1, Math.floor(pts.length / 12))
  let k = 0
  for (let i = 0; i < pts.length; i += step, k++) {
    const p0 = pts[i]!
    const p1 = pts[(i + step) % pts.length]!
    ctx.beginPath()
    ctx.moveTo(cx + p0.x * R * 0.42, cy + p0.y * R * 0.42)
    ctx.lineTo(cx + p0.x * R, cy + p0.y * R)
    ctx.lineTo(cx + p1.x * R, cy + p1.y * R)
    ctx.lineTo(cx + p1.x * R * 0.42, cy + p1.y * R * 0.42)
    ctx.closePath()
    ctx.fillStyle = rgba(k % 3 === 0 ? '#ffffff' : k % 3 === 1 ? skin.lo : skin.hi, 0.1 + rng() * 0.2)
    ctx.fill()
    ctx.strokeStyle = rgba('#ffffff', 0.25)
    ctx.lineWidth = Math.max(0.5, R * 0.01)
    ctx.stroke()
  }
  // The table, flat and bright.
  ctx.fillStyle = rgba('#ffffff', 0.16)
  trace(ctx, pts, cx, cy, R * 0.42)
  ctx.fill()
  ctx.strokeStyle = rgba('#ffffff', 0.4)
  ctx.lineWidth = Math.max(0.5, R * 0.014)
  ctx.stroke()
  // Fire: three spectral flashes, small and saturated, on a colourless stone.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const fire = ['#ff5a6e', '#5affc8', '#6ea8ff']
  for (let i = 0; i < 3; i++) {
    const th = rng() * TAU
    const rr = R * (0.35 + rng() * 0.45)
    const g = ctx.createRadialGradient(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr, 0, cx + Math.cos(th) * rr, cy + Math.sin(th) * rr, R * 0.26)
    g.addColorStop(0, rgba(fire[i]!, 0.55))
    g.addColorStop(1, rgba(fire[i]!, 0))
    ctx.fillStyle = g
    ctx.fillRect(cx - R * 1.2, cy - R * 1.2, R * 2.4, R * 2.4)
  }
  ctx.restore()
  // The one hard specular.
  ctx.fillStyle = rgba('#ffffff', 0.85)
  ctx.beginPath()
  ctx.arc(cx - R * 0.4, cy - R * 0.44, R * 0.08, 0, TAU)
  ctx.fill()
}

const paintMaterial = (ctx: CanvasRenderingContext2D, b: Body, mat: Material): void => {
  switch (mat) {
    case 'obsidian': paintObsidian(ctx, b); break
    case 'jade': paintJade(ctx, b); break
    case 'amber': paintAmber(ctx, b); break
    case 'marble': paintMarble(ctx, b); break
    case 'lava': paintLava(ctx, b); break
    case 'sapphire': paintSapphire(ctx, b); break
    case 'ruby': paintRuby(ctx, b); break
    case 'diamond': paintDiamond(ctx, b); break
    default: paintSandstone(ctx, b)
  }
}

/**
 * The stone itself: halo, body gradient, material, bevels, rim light, outline,
 * and the gold ring of a Lv 2. `level` 0 = a bare stone (previews, the key).
 */
/**
 * The carved border of a framed stone: a sunken field inside a raised rim.
 *
 * It is drawn as the INVERSE of the body's own bevel, which is the whole
 * trick — a recess is lit from the opposite side to the thing around it. The
 * body has a light edge at its top-left and a dark one at its bottom-right;
 * the field gets a dark edge at ITS top-left (the rim casting a shadow into
 * the hollow) and a light one at its bottom-right (light bouncing back off the
 * far wall). Between them the eye reads depth, from four strokes and no
 * gradients to speak of.
 *
 * `INSET` is how far in the rim sits, as a fraction of the radius. Anything
 * under about 0.1 reads as a scratch rather than a border; anything over 0.2
 * leaves the glyph nowhere to go.
 */
export const INSET = 0.155

const paintFrame = (ctx: CanvasRenderingContext2D, b: Body): void => {
  const { cx, cy, R, pts, skin } = b
  const r = R * (1 - INSET)
  ctx.save()
  trace(ctx, pts, cx, cy, R)
  ctx.clip()

  // The field itself, a shade darker than the rim around it and lit from the
  // BOTTOM — the floor of a hollow catches bounced light, not the sun.
  trace(ctx, pts, cx, cy, r)
  const field = ctx.createLinearGradient(cx, cy - r, cx, cy + r)
  field.addColorStop(0, rgba(darken(skin.base, 0.42), 0.95))
  field.addColorStop(0.62, rgba(darken(skin.base, 0.12), 0.55))
  field.addColorStop(1, rgba(lighten(skin.base, 0.18), 0.6))
  ctx.fillStyle = field
  ctx.fill()

  ctx.save()
  trace(ctx, pts, cx, cy, r)
  ctx.clip()
  ctx.lineJoin = 'round'
  // The shadow the rim throws into the hollow.
  const shade = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  shade.addColorStop(0, rgba(darken(skin.lo, 0.45), 0.9))
  shade.addColorStop(0.55, rgba(skin.lo, 0))
  ctx.lineWidth = R * 0.13
  ctx.strokeStyle = shade
  trace(ctx, pts, cx, cy, r)
  ctx.stroke()
  // …and the light coming back off the far wall.
  const bounce = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  bounce.addColorStop(0.5, rgba(skin.hi, 0))
  bounce.addColorStop(1, rgba(lighten(skin.hi, 0.3), 0.55))
  ctx.lineWidth = R * 0.1
  ctx.strokeStyle = bounce
  trace(ctx, pts, cx, cy, r)
  ctx.stroke()
  ctx.restore()

  // The border read as a BAND, all the way round.
  //
  // Physically the far side of a rim is in shadow and should stay dark, and
  // that is what the body's own bevel does. But a border the eye can only
  // follow for half its length is not a border, so it gets a faint even
  // lightening on top of the honest lighting — the same cheat a carved plaque
  // gets in every painted game, for the same reason.
  ctx.lineJoin = 'round'
  ctx.lineWidth = R * INSET * 0.9
  ctx.strokeStyle = rgba(lighten(skin.hi, 0.12), 0.16)
  trace(ctx, pts, cx, cy, R * (1 - INSET * 0.5))
  ctx.stroke()

  // The lip: a hard line where the rim breaks into the hollow, and a highlight
  // just outside it along the lit edge.
  ctx.lineWidth = Math.max(1, R * 0.022)
  ctx.strokeStyle = rgba(darken(skin.lo, 0.6), 0.85)
  trace(ctx, pts, cx, cy, r)
  ctx.stroke()
  const lip = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.4, cy + R * 0.4)
  lip.addColorStop(0, rgba(lighten(skin.rim, 0.2), 0.85))
  lip.addColorStop(0.65, rgba(skin.rim, 0))
  ctx.lineWidth = Math.max(1, R * 0.03)
  ctx.strokeStyle = lip
  trace(ctx, pts, cx, cy, r * 1.06)
  ctx.stroke()
  ctx.restore()
}

const paintBody = (ctx: CanvasRenderingContext2D, b: Body, level: number): void => {
  const { cx, cy, R, pts, skin } = b
  const mat = materialOf(skin.glyph)

  // A soft halo, so the stone sits in its own light.
  ctx.save()
  trace(ctx, pts, cx, cy, R)
  const crested = level >= 2
  ctx.shadowColor = crested ? GOLD : b.glow
  ctx.shadowBlur = R * (crested ? 0.34 : level === 1 ? 0.24 : 0.16)
  ctx.fillStyle = rgba(crested ? GOLD : b.glow, crested ? 0.55 : 0.35)
  ctx.fill()
  ctx.restore()

  // The body, lit from the top-left.
  ctx.save()
  trace(ctx, pts, cx, cy, R)
  const g = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.05, cx, cy, R * 1.3)
  g.addColorStop(0, skin.hi)
  g.addColorStop(0.5, skin.base)
  g.addColorStop(1, skin.lo)
  ctx.fillStyle = g
  ctx.fill()
  ctx.clip()

  paintMaterial(ctx, b, mat)

  // Bevel: a lit inner edge at the top-left, a dark one at the bottom-right.
  ctx.lineJoin = 'round'
  const lit = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R)
  lit.addColorStop(0, rgba(lighten(skin.hi, 0.35), 0.75))
  lit.addColorStop(0.5, rgba(skin.hi, 0))
  ctx.lineWidth = R * 0.16
  ctx.strokeStyle = lit
  trace(ctx, pts, cx, cy, R, -R * 0.05, -R * 0.06)
  ctx.stroke()
  const dark = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R)
  dark.addColorStop(0.45, rgba(skin.lo, 0))
  dark.addColorStop(1, rgba(darken(skin.lo, 0.5), 0.8))
  ctx.lineWidth = R * 0.2
  ctx.strokeStyle = dark
  trace(ctx, pts, cx, cy, R, R * 0.06, R * 0.07)
  ctx.stroke()
  // Rim light.
  const rim = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.6, cy + R * 0.6)
  rim.addColorStop(0, rgba(skin.rim, 0.9))
  rim.addColorStop(0.6, rgba(skin.rim, 0))
  ctx.lineWidth = R * 0.07
  ctx.strokeStyle = rim
  trace(ctx, pts, cx, cy, R)
  ctx.stroke()
  ctx.restore()

  if (cutIsFramed(skin.cut)) paintFrame(ctx, b)

  // Outline.
  ctx.save()
  ctx.lineJoin = 'round'
  trace(ctx, pts, cx, cy, R)
  ctx.lineWidth = Math.max(1, R * 0.045)
  ctx.strokeStyle = rgba(darken(skin.lo, 0.55), 0.9)
  ctx.stroke()
  ctx.restore()

  if (level >= 2) {
    ctx.save()
    ctx.lineJoin = 'round'
    const gg = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R)
    gg.addColorStop(0, GOLD_LIGHT)
    gg.addColorStop(0.5, '#e6b53a')
    gg.addColorStop(1, GOLD_DEEP)
    ctx.shadowColor = GOLD
    ctx.shadowBlur = R * 0.18
    ctx.lineWidth = R * 0.075
    ctx.strokeStyle = gg
    trace(ctx, pts, cx, cy, R)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.lineWidth = Math.max(0.75, R * 0.02)
    ctx.strokeStyle = rgba(GOLD_DARK, 0.85)
    trace(ctx, pts, cx, cy, R * 1.045)
    ctx.stroke()
    trace(ctx, pts, cx, cy, R * 0.96)
    ctx.stroke()
    ctx.restore()
  }
}

// ─── Glyph styles ───────────────────────────────────────────────────────────

/** Run `fn` with the glyph's 100×100 box mapped onto `size` px centred at (cx, cy). */
const withGlyph = (
  ctx: CanvasRenderingContext2D, type: RuneType, cx: number, cy: number, size: number,
  fn: (p: Path2D) => void
): void => {
  const p = glyphPath(type)
  ctx.save()
  ctx.translate(cx - size / 2, cy - size / 2)
  ctx.scale(size / 100, size / 100)
  fn(p)
  ctx.restore()
}

/**
 * A soft glow around the glyph, built from stepped strokes rather than a canvas
 * shadow: it looks the same at every DPR and under every transform, and it is
 * cheap enough to bake at any size.
 */
const bloom = (ctx: CanvasRenderingContext2D, type: RuneType, cx: number, cy: number, size: number, color: string, strength: number): void => {
  if (strength <= 0.01) return
  withGlyph(ctx, type, cx, cy, size, (p) => {
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = color
    const steps: ReadonlyArray<readonly [number, number]> = [[28, 0.045], [18, 0.08], [10, 0.13], [5, 0.2]]
    for (const [wd, a] of steps) {
      ctx.globalAlpha = a * strength
      ctx.lineWidth = wd
      ctx.stroke(p)
    }
    ctx.globalAlpha = 0.5 * strength
    ctx.fill(p)
  })
}

const drawStyledGlyph = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, type: RuneType,
  style: GlyphStyle, ink: string, glow: string, hi: string, pulse: number
): void => {
  const p = 0.55 + 0.45 * clamp01(pulse)
  ctx.save()
  switch (style) {
    case 'engraved': {
      bloom(ctx, type, cx, cy, size, glow, p)
      // The far wall of the cut catches the light.
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.translate(3.5, 4); ctx.fillStyle = rgba(hi, 0.85); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = ink; ctx.fill(path) })
      // Light rising out of the cut: a rim just inside the edge and a soft centre.
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        ctx.globalCompositeOperation = 'lighter'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = rgba(glow, 0.5 * p)
        ctx.lineWidth = 5
        ctx.stroke(path)
        const g = ctx.createRadialGradient(50, 50, 4, 50, 50, 58)
        g.addColorStop(0, rgba(glow, 0.4 * p))
        g.addColorStop(1, rgba(glow, 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 100, 100)
      })
      break
    }
    case 'neon': {
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(ink, 0.9); ctx.lineWidth = 7; ctx.stroke(path); ctx.fillStyle = ink; ctx.fill(path) })
      bloom(ctx, type, cx, cy, size, glow, 1.2 * p)
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = rgba(glow, 0.95); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createRadialGradient(50, 50, 0, 50, 50, 62)
        g.addColorStop(0, rgba('#ffffff', 0.85 * p))
        g.addColorStop(1, rgba('#ffffff', 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 100, 100)
      })
      break
    }
    case 'inlay': {
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.translate(2.5, 3.5); ctx.fillStyle = rgba('#000000', 0.45); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        const g = ctx.createLinearGradient(0, 0, 100, 100)
        g.addColorStop(0, lighten(glow, 0.45))
        g.addColorStop(0.5, glow)
        g.addColorStop(1, darken(glow, 0.35))
        ctx.fillStyle = g
        ctx.fill(path)
        ctx.lineJoin = 'round'
        ctx.strokeStyle = rgba(ink, 0.75)
        ctx.lineWidth = 1.8
        ctx.stroke(path)
      })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createLinearGradient(0, 0, 100, 100)
        g.addColorStop(0, rgba('#ffffff', 0.6))
        g.addColorStop(0.45, rgba('#ffffff', 0))
        ctx.lineJoin = 'round'
        ctx.strokeStyle = g
        ctx.lineWidth = 4
        ctx.stroke(path)
      })
      break
    }
    case 'gem': {
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = rgba(ink, 0.6); ctx.fill(path) })
      bloom(ctx, type, cx, cy, size, glow, 0.9 * p)
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createRadialGradient(42, 40, 2, 50, 50, 64)
        g.addColorStop(0, rgba('#ffffff', 0.8 * p))
        g.addColorStop(0.5, rgba(glow, 0.35))
        g.addColorStop(1, rgba(glow, 0.05))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 100, 100)
      })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(ink, 0.55); ctx.lineWidth = 2; ctx.stroke(path) })
      break
    }
    case 'carved': {
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.translate(3.5, 4); ctx.fillStyle = rgba(hi, 0.9); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = ink; ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createLinearGradient(0, 0, 100, 100)
        g.addColorStop(0, rgba('#000000', 0.6))
        g.addColorStop(0.6, rgba('#000000', 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 100, 100)
      })
      break
    }
    case 'ember': {
      bloom(ctx, type, cx, cy, size, glow, 1.3 * p)
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.lineJoin = 'round'; ctx.strokeStyle = rgba('#1a0806', 0.7); ctx.lineWidth = 5; ctx.stroke(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = ink; ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createRadialGradient(50, 52, 0, 50, 50, 60)
        g.addColorStop(0, rgba('#fff3c0', 0.9 * p))
        g.addColorStop(0.5, rgba(glow, 0.35))
        g.addColorStop(1, rgba(glow, 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 100, 100)
      })
      break
    }
    // Sapphire: the glyph is a POLISHED CHANNEL sunk into the step cut — a
    // hard white edge along the lit side, deep blue in the groove, and a cold
    // bloom rising out of it.
    case 'starcut': {
      bloom(ctx, type, cx, cy, size, glow, 0.8 * p)
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.translate(3, 3.5); ctx.fillStyle = rgba(hi, 0.7); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = ink; ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createLinearGradient(0, 0, 100, 100)
        g.addColorStop(0, rgba('#ffffff', 0.9 * p))
        g.addColorStop(0.4, rgba(glow, 0.4 * p))
        g.addColorStop(1, rgba(glow, 0))
        ctx.lineJoin = 'round'
        ctx.strokeStyle = g
        ctx.lineWidth = 6
        ctx.stroke(path)
      })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.lineJoin = 'round'; ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 1.4; ctx.stroke(path) })
      break
    }
    // Ruby: the glyph BURNS under the dome rather than being cut into it — no
    // hard edge anywhere, a soft red core and a halo held inside the outline.
    case 'blood': {
      bloom(ctx, type, cx, cy, size, glow, 1.35 * p)
      // A dark seat first, so the lit core has something to sit in — without it
      // a red glyph on a red dome is a shape you can only find by looking for it.
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(ink, 0.9); ctx.lineWidth = 6; ctx.stroke(path); ctx.fillStyle = rgba(ink, 0.95); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.fillStyle = rgba(glow, 0.95); ctx.fill(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createRadialGradient(46, 44, 2, 50, 50, 62)
        g.addColorStop(0, rgba('#fff2f4', 0.95 * p))
        g.addColorStop(0.4, rgba('#ffd0d8', 0.45 * p))
        g.addColorStop(1, rgba(glow, 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 100, 100)
      })
      break
    }
    // Diamond: the glyph SPLITS the light. It is the only one that is not a
    // single colour — red, green and blue slide across it — which is also the
    // only way a colourless stone reads as a diamond and not as glass.
    case 'prism': {
      withGlyph(ctx, type, cx, cy, size, (path) => { ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(ink, 0.85); ctx.lineWidth = 7; ctx.stroke(path) })
      withGlyph(ctx, type, cx, cy, size, (path) => {
        const g = ctx.createLinearGradient(6, 0, 94, 100)
        g.addColorStop(0, '#e0344f')
        g.addColorStop(0.3, '#e8a52a')
        g.addColorStop(0.58, '#1fb98a')
        g.addColorStop(1, '#3f6fd8')
        ctx.fillStyle = g
        ctx.fill(path)
        ctx.lineJoin = 'round'
        ctx.strokeStyle = rgba(ink, 0.9)
        ctx.lineWidth = 2.2
        ctx.stroke(path)
      })
      bloom(ctx, type, cx, cy, size, glow, 0.75 * p)
      withGlyph(ctx, type, cx, cy, size, (path) => {
        ctx.clip(path)
        const g = ctx.createLinearGradient(0, 0, 100, 60)
        g.addColorStop(0, rgba('#ffffff', 0.85 * p))
        g.addColorStop(0.35, rgba('#ffffff', 0))
        ctx.lineJoin = 'round'
        ctx.strokeStyle = g
        ctx.lineWidth = 5
        ctx.stroke(path)
      })
      break
    }
  }
  ctx.restore()
}

// ─── The Lv 2 crest ─────────────────────────────────────────────────────────

const paintCrest = (ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, label?: string): void => {
  const w = R * 0.86
  const h = R * 0.3
  ctx.save()
  ctx.translate(cx + R * 0.55, cy - R * 0.74)
  ctx.rotate(-0.32)
  ctx.fillStyle = rgba('#000000', 0.45)
  roundRect(ctx, -w / 2 + R * 0.02, -h / 2 + R * 0.035, w, h, h * 0.35)
  ctx.fill()
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
  g.addColorStop(0, GOLD_LIGHT)
  g.addColorStop(0.5, '#e6b53a')
  g.addColorStop(1, GOLD_DEEP)
  ctx.fillStyle = g
  roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.35)
  ctx.fill()
  ctx.lineWidth = Math.max(0.75, R * 0.028)
  ctx.strokeStyle = GOLD_DARK
  ctx.stroke()
  ctx.strokeStyle = rgba('#fff8d0', 0.8)
  ctx.lineWidth = Math.max(0.5, R * 0.018)
  ctx.beginPath()
  ctx.moveTo(-w / 2 + h * 0.4, -h / 2 + R * 0.03)
  ctx.lineTo(w / 2 - h * 0.4, -h / 2 + R * 0.03)
  ctx.stroke()
  // Laurel ticks at both ends.
  ctx.strokeStyle = rgba(GOLD_DARK, 0.7)
  ctx.lineWidth = Math.max(0.5, R * 0.02)
  ctx.lineCap = 'round'
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const x = sx * (w / 2 - h * 0.22 - k * h * 0.16)
      ctx.beginPath()
      ctx.moveTo(x, -h * 0.12)
      ctx.lineTo(x + sx * h * 0.1, h * 0.2)
      ctx.stroke()
    }
  }
  ctx.fillStyle = GOLD_DARK
  if (label) {
    let px = h * 0.74
    ctx.font = `900 ${px}px Angry, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const wide = ctx.measureText(label).width
    const room = w * 0.7
    if (wide > room) { px *= room / wide; ctx.font = `900 ${px}px Angry, sans-serif` }
    ctx.fillText(label, 0, h * 0.05)
  } else {
    roundRect(ctx, -h * 0.34, -h * 0.28, h * 0.18, h * 0.56, h * 0.06)
    ctx.fill()
    roundRect(ctx, h * 0.16, -h * 0.28, h * 0.18, h * 0.56, h * 0.06)
    ctx.fill()
  }
  ctx.restore()
}

// ─── Public painters ────────────────────────────────────────────────────────

/** How much of the box the stone fills; the rest is room for its glow. */
export const STONE_FILL: Record<1 | 2, number> = { 1: 0.68, 2: 0.74 }
/** Fill for any level: the table for Lv 1 / Lv 2, then a touch more per level, capped at Lv 7. */
export const stoneFill = (level: number): number => {
  const L = Math.max(1, Math.floor(Number(level) || 1))
  if (L <= 1) return STONE_FILL[1]
  return Math.min(STONE_FILL[2] + 0.04, STONE_FILL[2] + (L - 2) * 0.008)
}

// ─── The Lv 2 laurel ────────────────────────────────────────────────────────
//
// A LAYER, not a detail inside the stone. It was once neither: the stone
// prompts asked for "a small gold laurel emblem set into its lower rim", a
// thing the reference sheet never drew, and so every generation designed its
// own — a broad leafy wreath on one sheet, a sprig half the size on the next,
// no two alike across 120 stones. A part described in WORDS but absent from
// the reference is a part the painter invents afresh each time. So the wreath
// is drawn here, exported as a drawable of its own (`fx/laurel`), painted
// ONCE, and composited over whatever the stone layer produced.

/** Leaves per branch. */
const LAUREL_LEAVES = 5

/**
 * The convex hull of an outline (Andrew's monotone chain), which is the shape
 * a wreath actually lies against.
 *
 * A wreath laid on the raw outline follows every notch the rune has: it dives
 * into the cross's armpits, kinks at the warhead's collar, and — worst — ties
 * itself INSIDE the axe, whose foot on the centreline sits above its two
 * horns, so the bow of the wreath came out at the top of the crescent. A
 * branch resting against a stone bridges a hollow rather than entering it, and
 * the hull is exactly that bridge. It still differs per rune, which is the
 * whole point of ten wreaths: a bow's hull is slim, a shield's is wide.
 */
const convexHull = (pts: readonly Pt[]): Pt[] => {
  const sorted = [...pts].sort((a, b) => a.x - b.x || a.y - b.y)
  if (sorted.length < 3) return sorted
  const cross = (o: Pt, a: Pt, b: Pt): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const half = (src: Pt[]): Pt[] => {
    const out: Pt[] = []
    for (const q of src) {
      while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, q) <= 0) out.pop()
      out.push(q)
    }
    out.pop()
    return out
  }
  return [...half(sorted), ...half([...sorted].reverse())]
}

/**
 * Where a ray from the centre at angle `a` leaves a unit outline polygon — the
 * stone's rim in that direction, as a fraction of its radius. Every outline is
 * star-shaped around the centre, so one edge answers; `1` if none does.
 */
const rayHit = (pts: readonly Pt[], a: number): number => {
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

/**
 * The reference cut every painted wreath is drawn against.
 *
 * The wreath is ONE painting per rune — ninety would be ninety paintings — so
 * the sheet has to draw it against a definite stone, and this is that stone.
 * The arena then fits that one painting onto whichever cut it is actually
 * covering; see `laurelFit`.
 */
export const LAUREL_REF_CUT: StoneCut = 'carved'

/**
 * The outline the laurel of a rune hugs: that rune, in that cut, as it is
 * actually drawn.
 *
 * ── It used to hug the CONVEX HULL of it, and that was the bug ──
 *
 * A hull bridges every dent in a silhouette, so on a rune whose lower half is
 * narrower than its upper half the wreath was cut to the width of the WIDEST
 * part and then hung at the bottom, where the stone is not that wide. It sat in
 * mid-air with a gap you could see through. The axe was the worst of them — its
 * bit spans the whole box and its haft is a stick, so the wreath stood off the
 * haft by half the stone's radius — and the trefoil, the mortar and the radiant
 * cross were all wrong the same way. It was not a skin problem: the axe was 21%
 * out in `carved`, the very cut the wreath was cut against.
 *
 * The rim is SMOOTHED over a few degrees either side rather than read raw,
 * which is what the hull was really there for: a knapped stone's outline has
 * random jitter in it, and a branch that followed it point for point would
 * come out serrated. An average over ±5° follows the shape and loses the
 * flakes.
 */
const laurelOutline = (type: RuneType, cut: StoneCut): Pt[] =>
  stoneOutline(cut, type, pebbleSeed(type, cut))

/** How wide either side of a ray the rim is averaged, in radians. */
const LAUREL_SMOOTH: readonly number[] = [-0.09, -0.045, 0, 0.045, 0.09]

const laurelRimCache = new Map<string, Pt[]>()
const laurelPts = (type: RuneType, cut: StoneCut): Pt[] => {
  const key = `${type}|${cut}`
  let hit = laurelRimCache.get(key)
  if (!hit) { hit = laurelOutline(type, cut); laurelRimCache.set(key, hit) }
  return hit
}

/**
 * The rim of a `type` stone at absolute angle `a` (0 = right, π/2 = down), as a
 * fraction of the stone's radius. Exported so the tests can pin that the bow's
 * wreath sits closer in at the sides than the shield's.
 */
export const laurelRimAt = (type: RuneType, a: number, cut: StoneCut = LAUREL_REF_CUT): number => {
  const pts = laurelPts(type, cut)
  let sum = 0
  for (const d of LAUREL_SMOOTH) sum += rayHit(pts, a + d)
  return sum / LAUREL_SMOOTH.length
}

/** The arc one branch of the wreath sweeps, either side of straight down. */
const LAUREL_A0 = 0.07 * Math.PI
const LAUREL_A1 = 0.48 * Math.PI

/**
 * How much to scale a wreath PAINTED against `LAUREL_REF_CUT` so it lands on a
 * stone of `cut` instead.
 *
 * A painting cannot be reshaped, only moved and resized — so this is the one
 * number that puts it closest: the least-squares scale between the reference
 * rim and this cut's rim, over the arc the wreath actually occupies. Nine cuts
 * widen, blunt, round off and knap the same outline by up to a tenth of its
 * radius, which at a 90 px tile is a visible gap under the leaves.
 *
 * Drawn wreaths do not need it — they are cut to the stone directly.
 */
const laurelFitCache = new Map<string, number>()
export const laurelFit = (type: RuneType, cut: StoneCut): number => {
  if (cut === LAUREL_REF_CUT) return 1
  const key = `${type}|${cut}`
  const hit = laurelFitCache.get(key)
  if (hit !== undefined) return hit
  let num = 0
  let den = 0
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 16; k++) {
      const a = Math.PI / 2 + s * (LAUREL_A0 + (LAUREL_A1 - LAUREL_A0) * (k / 16))
      const ref = laurelRimAt(type, a, LAUREL_REF_CUT)
      num += ref * laurelRimAt(type, a, cut)
      den += ref * ref
    }
  }
  // Clamped: a fit is a correction, not a licence to resize the art by half.
  const k = den > 0 ? Math.min(1.25, Math.max(0.8, num / den)) : 1
  laurelFitCache.set(key, k)
  return k
}

/**
 * The Lv 2 laurel, drawn into the SAME box as the stone it wraps —
 * `paintLaurel(ctx, w, h)` for the box `paintPebble(ctx, w, h)` just filled.
 * That is what lets the arena composite a painted wreath over a painted stone
 * with one `drawImage` onto the same square and no arithmetic.
 *
 * It is deliberately a HORSESHOE, not a ring: the branches stop below the
 * stone's waist. A wreath that closes over the top reads as a second gold rim
 * around a stone that already has one, and at hand-tray size the two merge
 * into a hoop.
 */
export const paintLaurel = (
  ctx: CanvasRenderingContext2D, w: number, h: number, type: RuneType = 'melee', cut: StoneCut = LAUREL_REF_CUT
): void => {
  const size = Math.min(w, h)
  const cx = w / 2
  const cy = h / 2
  // The rim of a Lv 2 stone in this box; the wreath sits just outside it — and
  // follows the SILHOUETTE: a bow's foot is a narrow taper, a shield's is a
  // blunt point, a mortar's is a flat plate. One wreath per RUNE, never a
  // circle floating under a stone that is not one.
  //
  // `cut` is the stone it is going over. The reference sheet leaves it at the
  // default and paints one wreath per rune; the arena passes the real cut, so
  // a drawn wreath is cut to the stone rather than fitted to it.
  const R = (size / 2) * stoneFill(2)
  const rimAt = (a: number): number => R * laurelRimAt(type, a, cut) * 1.06
  const gold = ctx.createLinearGradient(cx - R, cy, cx + R, cy + R * 1.2)
  gold.addColorStop(0, GOLD_LIGHT)
  gold.addColorStop(0.5, '#e6b53a')
  gold.addColorStop(1, GOLD_DEEP)

  const angle = (s: number, t: number): number => Math.PI / 2 + s * (LAUREL_A0 + (LAUREL_A1 - LAUREL_A0) * t)
  const at = (s: number, t: number, extra = 0): [number, number] => {
    const a = angle(s, t)
    const r = rimAt(a) + extra
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  }
  /** The branch's direction at `t` — the tangent of the rim-hugging curve, not of a circle. */
  const tangent = (s: number, t: number): number => {
    const [ax, ay] = at(s, Math.max(0, t - 0.03))
    const [bx, by] = at(s, Math.min(1, t + 0.03))
    return Math.atan2(by - ay, bx - ax)
  }

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of [-1, 1]) {
    // A thin stem — thick enough to hold the leaves together, thin enough not
    // to read as a ring of its own next to the stone's gold rim.
    ctx.beginPath()
    for (let k = 0; k <= 20; k++) {
      const [x, y] = at(s, k / 20)
      if (k) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
    }
    ctx.strokeStyle = rgba(GOLD_DARK, 0.7)
    ctx.lineWidth = R * 0.045
    ctx.stroke()
    ctx.strokeStyle = gold
    ctx.lineWidth = R * 0.025
    ctx.stroke()

    // Leaves all point OUTWARD and up the branch, overlapping like real
    // laurel; alternating them in and out reads as a chain instead.
    for (let k = 0; k < LAUREL_LEAVES; k++) {
      const t = 0.08 + (k / LAUREL_LEAVES) * 0.88
      const scale = 1 - 0.28 * t
      const [x, y] = at(s, t, R * 0.11 * scale)
      ctx.save()
      ctx.translate(x, y)
      // Along the branch, then leaned out and forward: a leaf, not a bead.
      ctx.rotate(tangent(s, t) - s * (0.42 + (k % 2) * 0.14))
      ctx.beginPath()
      ctx.ellipse(0, 0, R * 0.155 * scale, R * 0.072 * scale, 0, 0, TAU)
      ctx.fillStyle = gold
      ctx.fill()
      ctx.lineWidth = Math.max(0.5, R * 0.016)
      ctx.strokeStyle = rgba(GOLD_DARK, 0.75)
      ctx.stroke()
      // The midrib, so a leaf still reads as a leaf at hand-tray size.
      ctx.beginPath()
      ctx.moveTo(-R * 0.11 * scale, 0)
      ctx.lineTo(R * 0.12 * scale, 0)
      ctx.strokeStyle = rgba(GOLD_DEEP, 0.5)
      ctx.lineWidth = Math.max(0.4, R * 0.012)
      ctx.stroke()
      ctx.restore()
    }
  }

  // The tie: one small band where the two branches meet. No tails — at 40 px
  // a knot with tails reads as a padlock hanging off the stone.
  ctx.save()
  ctx.translate(cx, cy + rimAt(Math.PI / 2))
  ctx.rotate(0)
  ctx.fillStyle = gold
  roundRect(ctx, -R * 0.085, -R * 0.05, R * 0.17, R * 0.1, R * 0.04)
  ctx.fill()
  ctx.lineWidth = Math.max(0.5, R * 0.016)
  ctx.strokeStyle = rgba(GOLD_DARK, 0.75)
  ctx.stroke()
  ctx.restore()
  ctx.restore()
}

/**
 * How big the glyph is drawn, as a multiple of the stone's radius, and how far
 * down it sits.
 *
 * Both numbers belong to the RUNE's profile, because both are questions about
 * this silhouette and no other: a mortar's field is down in the base plate, a
 * shield's is above the point, a crown's is under the peaks, and a bow has two
 * thirds of the width the rest of the roster has.
 *
 * The CUT then adjusts once: a framed stone spends `INSET` of its radius on
 * the border, so an unframed one — a shard, a slab, a gem — has room for a
 * fifth more glyph and needs less of the drop that kept the plaque's glyph
 * clear of its rim.
 */
export const glyphFit = (cut: StoneCut, type: RuneType): { scale: number; drop: number } => {
  const g = RUNE_PROFILES[type]!.glyph
  const framed = cutIsFramed(cut)
  return { scale: g.scale * (framed ? 1 : 1.2), drop: g.drop * (framed ? 1 : 0.8) }
}

/** A rune stone with its glyph, direction-less (the arrow is the renderer's). */
export const paintPebble = (ctx: CanvasRenderingContext2D, w: number, h: number, o: PebbleOpts): void => {
  const size = Math.min(w, h)
  const cx = w / 2
  const cy = h / 2
  const skin = o.owner === 'enemy' ? enemyStone(o.faction ?? null) : o.skin
  const glow = resolveGlow(skin, o.type)
  const pulse = o.pulse ?? 0.5
  ctx.save()
  if (o.glyphOnly) {
    drawStyledGlyph(ctx, cx, cy, size * 0.78, o.type, skin.glyph, skin.ink, glow, skin.hi, pulse)
    ctx.restore()
    return
  }
  const R = (size / 2) * stoneFill(o.level)
  const seed = pebbleSeed(o.type, skin.cut)
  const pts = stoneOutline(skin.cut, o.type, seed)
  paintBody(ctx, { cx, cy, R, pts, skin, seed, glow }, o.level)
  const fit = glyphFit(skin.cut, o.type)
  drawStyledGlyph(ctx, cx, cy + R * fit.drop, R * fit.scale, o.type, skin.glyph, skin.ink, glow, skin.hi, pulse)
  if (o.level >= 2) {
    if (o.laurel !== false) paintLaurel(ctx, w, h, o.type)
    if (o.crest !== false) paintCrest(ctx, cx, cy, R, o.label)
  }
  ctx.restore()
}

/**
 * The Lv 2 ornaments — wreath and crest — on their own, in the same box the
 * stone was painted in.
 *
 * This is the UPRIGHT half of a stone the arena turns. A wreath is a thing
 * hung on the rune rather than part of it, and the crest is a label; both stop
 * meaning what they mean the moment they lie on their side, so the renderer
 * blits the stone rotated and then this, level, over the top. The geometry is
 * `paintPebble`'s own, so the two halves land where they did when they were
 * one drawing.
 */
export const paintPebbleOrnaments = (
  ctx: CanvasRenderingContext2D, w: number, h: number,
  o: { type: RuneType; level: number; cut?: StoneCut; laurel?: boolean; crest?: boolean; label?: string }
): void => {
  if (o.level < 2) return
  const size = Math.min(w, h)
  const cx = w / 2
  const cy = h / 2
  const R = (size / 2) * stoneFill(o.level)
  ctx.save()
  if (o.laurel !== false) paintLaurel(ctx, w, h, o.type, o.cut ?? LAUREL_REF_CUT)
  if (o.crest !== false) paintCrest(ctx, cx, cy, R, o.label)
  ctx.restore()
}

/** The glyph alone, in the given style, filling the box. */
export const paintGlyph = (
  ctx: CanvasRenderingContext2D, w: number, h: number, type: RuneType, style: GlyphStyle, ink: string, glow: string
): void => {
  drawStyledGlyph(ctx, w / 2, h / 2, Math.min(w, h) * 0.8, type, style, ink, glow, lighten(ink, 0.55), 0.5)
}

/** One board tile (the slate, the bevel, the owner's tint, the glowing edge). */
export const paintTile = (ctx: CanvasRenderingContext2D, w: number, h: number, o: TileOpts): void => {
  const t = Math.min(w, h)
  const x0 = (w - t) / 2
  const y0 = (h - t) / 2
  const inset = t * 0.05
  const r = t * 0.1
  const neutral = o.owner === 'neutral'
  const edge = neutral ? GRID_GLOW : o.owner === 'player' ? PLAYER_TILE : FACTION_DEFS[o.faction ?? 'orc'].color
  ctx.save()
  const g = ctx.createLinearGradient(0, y0, 0, y0 + t)
  g.addColorStop(0, neutral ? '#363c58' : mixHex('#363c58', edge, 0.18))
  g.addColorStop(1, neutral ? '#1e2238' : mixHex('#1e2238', edge, 0.12))
  ctx.fillStyle = g
  roundRect(ctx, x0 + inset, y0 + inset, t - 2 * inset, t - 2 * inset, r)
  ctx.fill()
  ctx.save()
  ctx.clip()
  // Speckle.
  const rng = makeRng(seedFrom(neutral ? 3 : o.owner === 'player' ? 5 : 7))
  for (let k = 0; k < 14; k++) {
    ctx.fillStyle = k % 3 === 0 ? rgba('#ffffff', 0.07) : rgba('#000000', 0.16)
    ctx.beginPath()
    ctx.arc(x0 + inset + rng() * (t - 2 * inset), y0 + inset + rng() * (t - 2 * inset), t * 0.012, 0, TAU)
    ctx.fill()
  }
  if (!neutral) {
    // The owner's edge glow. The TERRITORY wash — the one that makes the board
    // readable as a scoreboard — lives in `useArenaArt.tileSprite` instead,
    // because a painted tile never reaches this function at all.
    const v = ctx.createRadialGradient(x0 + t / 2, y0 + t / 2, t * 0.1, x0 + t / 2, y0 + t / 2, t * 0.72)
    v.addColorStop(0, rgba(edge, 0.1))
    v.addColorStop(1, rgba(edge, 0.42))
    ctx.fillStyle = v
    ctx.fillRect(x0, y0, t, t)
  }
  // Bevel.
  ctx.lineWidth = Math.max(1, t * 0.03)
  ctx.strokeStyle = rgba('#ffffff', 0.12)
  ctx.beginPath()
  ctx.moveTo(x0 + inset, y0 + t - inset)
  ctx.lineTo(x0 + inset, y0 + inset)
  ctx.lineTo(x0 + t - inset, y0 + inset)
  ctx.stroke()
  ctx.strokeStyle = rgba('#000000', 0.42)
  ctx.beginPath()
  ctx.moveTo(x0 + inset, y0 + t - inset)
  ctx.lineTo(x0 + t - inset, y0 + t - inset)
  ctx.lineTo(x0 + t - inset, y0 + inset)
  ctx.stroke()
  ctx.restore()
  // The glowing edge.
  ctx.strokeStyle = rgba(edge, neutral ? 0.55 : 0.92)
  ctx.lineWidth = t * (neutral ? 0.03 : 0.045)
  ctx.shadowColor = edge
  ctx.shadowBlur = t * (neutral ? 0.1 : 0.2)
  roundRect(ctx, x0 + inset, y0 + inset, t - 2 * inset, t - 2 * inset, r)
  ctx.stroke()
  if (!neutral) ctx.stroke()
  // Grid nodes at the corners.
  ctx.fillStyle = rgba(edge, 0.9)
  ctx.shadowBlur = t * 0.08
  for (const [nx, ny] of [[inset, inset], [t - inset, inset], [inset, t - inset], [t - inset, t - inset]] as const) {
    ctx.beginPath()
    ctx.arc(x0 + nx, y0 + ny, t * 0.03, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** The carved stone frame around the board, nine-sliceable at `FRAME_CAP`. */
export const paintBoardFrame = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  const m = Math.min(w, h)
  const r = m * 0.05
  ctx.save()
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#2b3048')
  g.addColorStop(1, '#12162a')
  ctx.fillStyle = g
  roundRect(ctx, 0, 0, w, h, r)
  ctx.fill()
  ctx.lineWidth = Math.max(1, m * 0.006)
  ctx.strokeStyle = rgba('#000000', 0.75)
  ctx.stroke()
  ctx.strokeStyle = rgba('#ffffff', 0.07)
  roundRect(ctx, m * 0.008, m * 0.008, w - m * 0.016, h - m * 0.016, r * 0.9)
  ctx.stroke()
  // The violet inner line — uniform along every edge, so the middle stretches.
  const inset = m * 0.02
  ctx.strokeStyle = rgba(GRID_GLOW, 0.5)
  ctx.lineWidth = Math.max(1, m * 0.006)
  ctx.shadowColor = GRID_GLOW
  ctx.shadowBlur = m * 0.02
  roundRect(ctx, inset, inset, w - 2 * inset, h - 2 * inset, r * 0.8)
  ctx.stroke()
  ctx.shadowBlur = 0
  // Corner sigils inside the caps.
  const cap = m * FRAME_CAP
  ctx.strokeStyle = rgba('#b39bff', 0.42)
  ctx.fillStyle = rgba('#b39bff', 0.5)
  ctx.lineWidth = Math.max(1, m * 0.005)
  ctx.lineCap = 'round'
  for (const [cx, cy] of [[cap * 0.5, cap * 0.5], [w - cap * 0.5, cap * 0.5], [cap * 0.5, h - cap * 0.5], [w - cap * 0.5, h - cap * 0.5]] as const) {
    ctx.beginPath()
    ctx.arc(cx, cy, cap * 0.2, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, cap * 0.05, 0, TAU)
    ctx.fill()
    for (let k = 0; k < 4; k++) {
      const th = (k / 4) * TAU + Math.PI / 4
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(th) * cap * 0.26, cy + Math.sin(th) * cap * 0.26)
      ctx.lineTo(cx + Math.cos(th) * cap * 0.38, cy + Math.sin(th) * cap * 0.38)
      ctx.stroke()
    }
  }
  ctx.restore()
}

/** The Rune Forge chip: an anvil with a glowing rune stone on it. */
export const paintForge = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  const s = Math.min(w, h)
  const cx = w / 2
  const cy = h / 2
  ctx.save()
  // The block.
  const bg = ctx.createLinearGradient(0, cy + s * 0.12, 0, cy + s * 0.42)
  bg.addColorStop(0, '#4a3628')
  bg.addColorStop(1, '#1f150e')
  ctx.fillStyle = bg
  roundRect(ctx, cx - s * 0.24, cy + s * 0.14, s * 0.48, s * 0.26, s * 0.04)
  ctx.fill()
  ctx.strokeStyle = rgba('#000000', 0.8)
  ctx.lineWidth = Math.max(1, s * 0.02)
  ctx.stroke()
  // The anvil.
  const ig = ctx.createLinearGradient(0, cy - s * 0.2, 0, cy + s * 0.16)
  ig.addColorStop(0, '#7d8598')
  ig.addColorStop(0.5, '#4a5164')
  ig.addColorStop(1, '#232838')
  ctx.fillStyle = ig
  ctx.beginPath()
  ctx.moveTo(cx - s * 0.42, cy - s * 0.2)
  ctx.lineTo(cx + s * 0.42, cy - s * 0.2)
  ctx.lineTo(cx + s * 0.42, cy - s * 0.06)
  ctx.lineTo(cx + s * 0.14, cy - s * 0.06)
  ctx.lineTo(cx + s * 0.2, cy + s * 0.16)
  ctx.lineTo(cx - s * 0.2, cy + s * 0.16)
  ctx.lineTo(cx - s * 0.14, cy - s * 0.06)
  ctx.lineTo(cx - s * 0.42, cy - s * 0.06)
  ctx.closePath()
  ctx.fill()
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.strokeStyle = rgba('#ffffff', 0.35)
  ctx.beginPath()
  ctx.moveTo(cx - s * 0.38, cy - s * 0.18)
  ctx.lineTo(cx + s * 0.38, cy - s * 0.18)
  ctx.stroke()
  // The stone on the anvil, its glyph lit by the forge.
  const R = s * 0.15
  const seed = seedFrom(99)
  const pts = stoneOutline('carved', 'support', seed)
  const skin: SkinDef = { ...ENEMY_STONE, hi: '#d9c9a6', base: '#b39b73', lo: '#7d6547', rim: '#f2e6c8', ink: '#2c2218', glow: '#ffb347' }
  paintBody(ctx, { cx, cy: cy - s * 0.32, R, pts, skin, seed, glow: '#ffb347' }, 1)
  drawStyledGlyph(ctx, cx, cy - s * 0.31, R * 1.0, 'support', 'ember', '#ff8a2a', '#ffd27a', skin.hi, 0.8)
  // Sparks.
  const rng = makeRng(seed)
  ctx.globalCompositeOperation = 'lighter'
  for (let k = 0; k < 7; k++) {
    ctx.fillStyle = rgba(k % 2 === 0 ? '#ffd27a' : '#ff8a2a', 0.5 + rng() * 0.5)
    ctx.beginPath()
    ctx.arc(cx + (rng() - 0.5) * s * 0.7, cy - s * 0.3 - rng() * s * 0.22, s * (0.008 + rng() * 0.014), 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** The reroll stone chip, label-less: a slate chip with the cycle mark at its left. */
export const paintRerollChip = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  ctx.save()
  const r = h * 0.3
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#3d4560')
  g.addColorStop(1, '#222738')
  ctx.fillStyle = g
  roundRect(ctx, 1, 1, w - 2, h - 2, r)
  ctx.fill()
  ctx.strokeStyle = rgba('#000000', 0.7)
  ctx.lineWidth = Math.max(1, h * 0.03)
  ctx.stroke()
  ctx.strokeStyle = rgba(GRID_GLOW, 0.45)
  ctx.lineWidth = Math.max(1, h * 0.02)
  ctx.shadowColor = GRID_GLOW
  ctx.shadowBlur = h * 0.1
  roundRect(ctx, h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, r * 0.85)
  ctx.stroke()
  ctx.shadowBlur = 0
  // The cycle mark.
  const wide = w > h * 1.6
  const ix = wide ? h * 0.5 : w / 2
  const iy = h / 2
  const ir = h * 0.24
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(1.5, h * 0.07)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(ix, iy, ir, -Math.PI * 0.2, Math.PI * 1.3)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(ix + ir * 1.25, iy - ir * 0.75)
  ctx.lineTo(ix + ir * 0.55, iy - ir * 0.95)
  ctx.lineTo(ix + ir * 1.05, iy - ir * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** The archer's bolt: ash shaft, iron head, emerald vanes, a faint trail. */
const BOLT_VANE = '#35e07a'
const BOLT_VANE_LO = '#1f9c53'
const BOLT_TRAIL = '#b8ffd6'

/**
 * The archer's bolt: ONE arrow, pointing RIGHT, with a short speed streak
 * behind it. Drawn into the middle of the box at 4:1, the proportions the
 * sprite ships at.
 *
 * It is one still and not a flight strip. An arrow in flight does not animate
 * — the renderer moves it along the shot and rotates it to the heading, which
 * is simulation, not a cycle — and the eight-panel version of this asset asked
 * an image model for eight consistent arrows and got eight different ones. One
 * arrow has nothing to be inconsistent with.
 */
export const paintBolt = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  // The ink is 4:1 and centred, whatever box it is handed.
  const L = Math.min(w * 0.94, h * 3.76)
  const t = L / 4
  const cx = w / 2
  const cy = h / 2
  const x0 = cx - L / 2
  const shaft = t * 0.17

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'butt'

  // The speed streak, behind the nock and fading out backwards.
  const streak = ctx.createLinearGradient(x0 - L * 0.16, cy, x0 + L * 0.3, cy)
  streak.addColorStop(0, rgba(BOLT_TRAIL, 0))
  streak.addColorStop(1, rgba(BOLT_TRAIL, 0.55))
  ctx.strokeStyle = streak
  ctx.lineWidth = shaft * 1.6
  ctx.beginPath()
  ctx.moveTo(x0 - L * 0.16, cy)
  ctx.lineTo(x0 + L * 0.3, cy)
  ctx.stroke()

  // The shaft: ash, lit along its top edge.
  const wood = ctx.createLinearGradient(0, cy - shaft, 0, cy + shaft)
  wood.addColorStop(0, '#d8c39a')
  wood.addColorStop(0.55, '#b1935f')
  wood.addColorStop(1, '#7d6237')
  ctx.fillStyle = wood
  ctx.fillRect(x0 + L * 0.06, cy - shaft, L * 0.78, shaft * 2)
  ctx.strokeStyle = rgba('#4a381d', 0.9)
  ctx.lineWidth = Math.max(0.6, shaft * 0.35)
  ctx.strokeRect(x0 + L * 0.06, cy - shaft, L * 0.78, shaft * 2)

  // The head: a broad iron point, its own bevel.
  const hx = x0 + L * 0.78
  const hw = L * 0.22
  const hh = t * 0.5
  const iron = ctx.createLinearGradient(hx, cy - hh, hx + hw, cy + hh)
  iron.addColorStop(0, '#cfd6de')
  iron.addColorStop(0.5, '#8e98a6')
  iron.addColorStop(1, '#5b6472')
  ctx.beginPath()
  ctx.moveTo(hx, cy - hh)
  ctx.lineTo(hx + hw, cy)
  ctx.lineTo(hx, cy + hh)
  ctx.lineTo(hx + hw * 0.22, cy)
  ctx.closePath()
  ctx.fillStyle = iron
  ctx.fill()
  ctx.strokeStyle = rgba('#2c333d', 0.95)
  ctx.lineWidth = Math.max(0.6, shaft * 0.4)
  ctx.stroke()

  // The fletching: two emerald vanes at the nock, cut with a notch.
  const fx0 = x0 + L * 0.06
  const fw = L * 0.24
  const fh = t * 0.46
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(fx0, cy + s * shaft * 0.6)
    ctx.lineTo(fx0 + fw * 0.28, cy + s * fh)
    ctx.lineTo(fx0 + fw * 0.72, cy + s * fh)
    ctx.lineTo(fx0 + fw, cy + s * shaft * 0.9)
    ctx.lineTo(fx0 + fw * 0.62, cy + s * shaft * 0.8)
    ctx.closePath()
    ctx.fillStyle = s < 0 ? BOLT_VANE : BOLT_VANE_LO
    ctx.fill()
    ctx.strokeStyle = rgba('#12452a', 0.9)
    ctx.lineWidth = Math.max(0.6, shaft * 0.32)
    ctx.stroke()
  }
  ctx.restore()
}

// ─── The backdrop: the sky and the two ridges ───────────────────────────────
//
// All three are DRAWABLES, not decoration: the game draws them, the bench
// exports the drawing as the reference, and a painting drops in over the top
// (`bg/sky`, `bg/ridge-far`, `bg/ridge-near`).
//
// They had to become painters before they could become art. The sky was a bare
// three-stop gradient with no drawable at all, and the two ridges were BITMAPS
// inherited from the game that used to live in this repo — a graveyard of
// crosses, fences and dead trees. Restyling those would have kept the
// graveyard: the reference decides the subject and the prompt only decides the
// brief. So the subject is drawn here, in the arena's own palette, and the
// painter is asked to restyle a rune world instead of to imagine one.

/** The arena's night, top to bottom. A painted sky must stay in this range. */
const SKY_TOP = '#151d3d'
const SKY_MID = '#0b1026'
const SKY_DEEP = '#05070f'
/** The two ridges: far is hazy and lighter, near is almost black. */
const RIDGE_FAR = '#101838'
const RIDGE_NEAR = '#0a0e22'
/** The arcane accent every backdrop layer carries a little of. */
const ARCANE = '#7a5cff'

/**
 * Where each band's skyline sits, as a fraction of the band's height.
 *
 * The arena has to put THIS line on the horizon. It used to position the bands
 * by an offset tuned for the art of the game that was here before, whose ridge
 * ran along the top of its file; with a skyline at 46 % of the band, the same
 * offset lifted the whole thing a third of a band into the sky, where the rock
 * hung over the stars as a translucent smear.
 */
export const RIDGE_SKYLINE: Record<'far' | 'near', number> = { far: 0.46, near: 0.34 }

/**
 * The night sky behind the board, edge to edge and fully OPAQUE — there is no
 * background behind a background. A moon high on the right, an aurora over the
 * left, a seeded starfield, and a violet haze along the bottom for the ridges
 * to stand in.
 *
 * The middle stays dark on purpose: the board, its own violet glow and the
 * vignette all land on top of it, and a busy sky under a 4x4 grid of stones
 * reads as noise.
 */
export const paintSky = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  const rng = makeRng(seedFrom(0x5217))
  const unit = Math.min(w, h)
  ctx.save()
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, SKY_TOP)
  g.addColorStop(0.45, SKY_MID)
  g.addColorStop(1, SKY_DEEP)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Two aurora veils over the upper half, squashed and leaning.
  const veils: [number, number, number, number, string, number][] = [
    [w * 0.3, h * 0.2, w * 0.42, h * 0.3, ARCANE, 0.3],
    [w * 0.64, h * 0.34, w * 0.36, h * 0.22, '#2fb8a8', 0.14]
  ]
  for (const [cx, cy, rx, ry, tint, alpha] of veils) {
    const r = Math.max(rx, ry)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(-0.22)
    ctx.scale(1, ry / rx)
    // Built AFTER the transform and centred on the origin: a gradient made in
    // the outer space keeps its own centre through the squash, so the falloff
    // stops short of the ellipse on one side and the veil gets a hard rim.
    const veil = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    veil.addColorStop(0, rgba(tint, alpha))
    veil.addColorStop(0.55, rgba(tint, alpha * 0.45))
    veil.addColorStop(1, rgba(tint, 0))
    ctx.fillStyle = veil
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, TAU)
    ctx.fill()
    ctx.restore()
  }

  // Stars: thick up top, thinning out before the horizon haze.
  for (let i = 0; i < 150; i++) {
    const x = rng() * w
    const y = rng() ** 1.6 * h * 0.8
    ctx.fillStyle = rgba(rng() < 0.22 ? '#cfe0ff' : '#ffffff', 0.25 + rng() * 0.55)
    ctx.beginPath()
    ctx.arc(x, y, unit * (0.0012 + rng() * 0.0026), 0, TAU)
    ctx.fill()
  }
  // A few bright ones with a cross flare, so the field has a scale.
  for (let i = 0; i < 7; i++) {
    const x = rng() * w
    const y = rng() * h * 0.5
    const r = unit * 0.006
    const flare = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4)
    flare.addColorStop(0, rgba('#ffffff', 0.9))
    flare.addColorStop(1, rgba('#cfe0ff', 0))
    ctx.fillStyle = flare
    ctx.beginPath()
    ctx.arc(x, y, r * 2.4, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = rgba('#ffffff', 0.5)
    ctx.lineWidth = Math.max(0.5, unit * 0.0012)
    ctx.beginPath()
    ctx.moveTo(x - r * 2, y)
    ctx.lineTo(x + r * 2, y)
    ctx.moveTo(x, y - r * 2)
    ctx.lineTo(x, y + r * 2)
    ctx.stroke()
  }

  // The moon, hazed.
  const mx = w * 0.79
  const my = h * 0.18
  const mr = unit * 0.05
  const halo = ctx.createRadialGradient(mx, my, mr * 0.7, mx, my, mr * 4)
  halo.addColorStop(0, rgba('#cfe0ff', 0.22))
  halo.addColorStop(1, rgba('#cfe0ff', 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(mx, my, mr * 4, 0, TAU)
  ctx.fill()
  const face = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.35, mr * 0.1, mx, my, mr)
  face.addColorStop(0, '#f6f3e8')
  face.addColorStop(1, '#b9c2d8')
  ctx.fillStyle = face
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, TAU)
  ctx.fill()
  ctx.fillStyle = rgba('#8f9ab6', 0.35)
  for (const [ox, oy, orr] of [[-0.3, 0.25, 0.2], [0.3, -0.1, 0.14], [0.1, 0.45, 0.1]]) {
    ctx.beginPath()
    ctx.arc(mx + mr * (ox ?? 0), my + mr * (oy ?? 0), mr * (orr ?? 0.1), 0, TAU)
    ctx.fill()
  }

  // The horizon haze the ridges stand in.
  const haze = ctx.createLinearGradient(0, h * 0.55, 0, h)
  haze.addColorStop(0, rgba(ARCANE, 0))
  haze.addColorStop(0.75, rgba(ARCANE, 0.12))
  haze.addColorStop(1, rgba(ARCANE, 0.03))
  ctx.fillStyle = haze
  ctx.fillRect(0, h * 0.55, w, h * 0.45)
  ctx.restore()
}

/**
 * One ridge band. The skyline above it is EMPTY — transparent, so the bench
 * floods it with the key colour and the arena sees the sky through it — and
 * the rock runs to the bottom edge. It is drawn to the box it is blitted into,
 * so the drawn ridge and the painted one stand at exactly the same height.
 *
 * `far` is hazy and pale with tall pinnacles; `near` is broken and almost
 * black, and carries standing rune monoliths — what makes this a rune world
 * rather than a mountain range.
 */
export const paintRidge = (ctx: CanvasRenderingContext2D, w: number, h: number, layer: 'far' | 'near'): void => {
  const far = layer === 'far'
  const rng = makeRng(seedFrom(far ? 0x1d6e : 0x2a71))
  const base = h * RIDGE_SKYLINE[layer]
  const amp = h * (far ? 0.2 : 0.28)
  const skyline = (u: number): number =>
    base - amp * (0.55 * Math.sin(u * 7.3 + (far ? 1.9 : 0.4))
      + 0.3 * Math.sin(u * 17.1 + (far ? 0.7 : 2.2))
      + 0.15 * Math.sin(u * 31 + (far ? 2.6 : 1.1)))
  const n = 96

  ctx.save()
  // Pinnacles first, so their feet vanish into the rock drawn over them.
  if (far) {
    ctx.fillStyle = RIDGE_FAR
    for (const [u, tall] of [[0.22, 1], [0.53, 0.72], [0.79, 0.9]] as [number, number][]) {
      const x = u * w
      const y = skyline(u)
      // Sized off the ridge's own relief, and modestly: the band is stretched
      // to about 1.15 screens wide in play, so a pinnacle that looks bold in a
      // 1024 px reference arrives on a desktop as a tower.
      const ph = amp * (0.42 + tall * 0.34)
      const pw = w * 0.012 * (0.7 + tall * 0.6)
      ctx.beginPath()
      ctx.moveTo(x - pw, y + amp * 0.2)
      ctx.lineTo(x - pw * 0.35, y - ph)
      ctx.lineTo(x + pw * 0.2, y - ph * 0.82)
      ctx.lineTo(x + pw, y + amp * 0.2)
      ctx.closePath()
      ctx.fill()
    }
  }

  // The rock: the skyline, then straight down to the bottom edge.
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, skyline(0))
  for (let i = 0; i <= n; i++) {
    const u = i / n
    // The near ridge is broken rather than rolling: a notch every few steps.
    const jag = far ? 0 : (i % 7 === 0 ? amp * 0.18 * (rng() - 0.5) : 0)
    ctx.lineTo(u * w, skyline(u) + jag)
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fillStyle = far ? RIDGE_FAR : RIDGE_NEAR
  ctx.fill()

  if (far) {
    // A pale rim along the skyline: distance, and something for a painter to
    // catch the moonlight on.
    ctx.strokeStyle = rgba('#6b7ac0', 0.35)
    ctx.lineWidth = Math.max(1, h * 0.008)
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const u = i / n
      if (i) ctx.lineTo(u * w, skyline(u))
      else ctx.moveTo(0, skyline(0))
    }
    ctx.stroke()
  } else {
    // Standing monoliths: rune stones the size of towers, two of them lit.
    const stones: [number, number, boolean][] = [
      [0.13, 0.9, false], [0.34, 1.25, true], [0.58, 0.8, false], [0.72, 1.1, true], [0.9, 0.7, false]
    ]
    for (const [u, tall, lit] of stones) {
      const foot = skyline(u) + amp * 0.1
      // Clamped to the band: a monolith that leaves the top of the image is cut
      // off in the file and stays cut off in every painting made from it.
      const mh = Math.min(amp * (0.42 + tall * 0.38), foot - h * 0.06)
      const mw = w * 0.013 * (0.8 + tall * 0.4)
      ctx.save()
      ctx.translate(u * w, foot)
      ctx.rotate((rng() - 0.5) * 0.12)
      ctx.fillStyle = RIDGE_NEAR
      ctx.beginPath()
      ctx.moveTo(-mw, amp * 0.4)
      ctx.lineTo(-mw * 0.8, -mh)
      ctx.lineTo(mw * 0.75, -mh * 0.94)
      ctx.lineTo(mw, amp * 0.4)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = rgba('#2b3566', 0.9)
      ctx.lineWidth = Math.max(0.75, h * 0.005)
      ctx.stroke()
      if (lit) {
        // A glyph cut into it — the only saturated note in the whole backdrop.
        const gy = -mh * 0.55
        const gr = mw * 0.42
        const glow = ctx.createRadialGradient(0, gy, 0, 0, gy, gr * 3)
        glow.addColorStop(0, rgba(ARCANE, 0.55))
        glow.addColorStop(1, rgba(ARCANE, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, gy, gr * 3, 0, TAU)
        ctx.fill()
        // A RUNE, not a cross. The first version drew a vertical stroke with a
        // bar across it, which is a grave marker — the exact iconography this
        // backdrop exists to get away from. A diamond over a stem cannot be
        // read that way.
        ctx.strokeStyle = rgba('#cbb6ff', 0.85)
        ctx.lineWidth = Math.max(0.75, h * 0.006)
        ctx.beginPath()
        ctx.moveTo(0, gy - gr)
        ctx.lineTo(gr * 0.7, gy)
        ctx.lineTo(0, gy + gr * 0.7)
        ctx.lineTo(-gr * 0.7, gy)
        ctx.closePath()
        ctx.moveTo(0, gy + gr * 0.7)
        ctx.lineTo(0, gy + gr * 1.5)
        ctx.stroke()
      }
      ctx.restore()
    }
  }
  ctx.restore()
}

/** The bare stone silhouette of a rune in a cut, for previews and the sheet's key. */
export const paintStoneShape = (
  ctx: CanvasRenderingContext2D, w: number, h: number, cut: StoneCut, type: RuneType, skin: SkinDef
): void => {
  const size = Math.min(w, h)
  const seed = seedFrom(CUT_IDX[cut] * 31 + 5, TYPE_IDX[type] * 17)
  const pts = stoneOutline(cut, type, seed)
  const body: SkinDef = { ...skin, cut }
  ctx.save()
  paintBody(ctx, { cx: w / 2, cy: h / 2, R: (size / 2) * 0.86, pts, skin: body, seed, glow: skin.glow ?? skin.rim }, 0)
  ctx.restore()
}

/**
 * ─── The conquest counter plate ─────────────────────────────────────────────
 *
 * The carved plaque behind "YOU 4" / "FOE 5". It is drawn here for two reasons
 * and rendered in neither: the counters themselves live in the DOM now
 * (`ConquestCounters.vue`), because redrawing two numbers sixty times a second
 * on the canvas was the single most expensive thing this renderer did.
 *
 * What this painter is FOR:
 *
 *   1. The reference panel on the UI contact sheet, so a painter — human or
 *      model — restyles THIS plaque instead of inventing one. A prompt that
 *      describes a plaque in words comes back different on every sheet
 *      (`artSheet.ts`, and the laurel that taught us).
 *   2. The design of record for the CSS fallback, which has to look like the
 *      same object when the painted `.webp` is absent or the art flag is off.
 *
 * `side` only changes the rim and the etch light: the player's plaque is cold
 * blue, the enemy's is crimson, and the two must read as the same carved object
 * in two liveries rather than as two different props.
 *
 * The text is NOT painted. A caption baked into a plate is a caption in one
 * language, and this game ships twenty-one.
 */
export const paintCounterPlate = (
  ctx: CanvasRenderingContext2D, w: number, h: number, side: 'you' | 'foe'
): void => {
  const rim = side === 'you' ? '#4fd0ff' : '#ff5a5f'
  const deep = side === 'you' ? '#123049' : '#3c1418'
  const r = h * 0.46
  ctx.save()

  // The stone body: a cold slate slab, lit from above.
  const body = ctx.createLinearGradient(0, 0, 0, h)
  body.addColorStop(0, '#2b3350')
  body.addColorStop(0.45, '#171d30')
  body.addColorStop(1, '#0d1120')
  roundRect(ctx, h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, r)
  ctx.fillStyle = body
  ctx.fill()

  // A wash of the side's own colour, pooling at the ends where the numbers sit.
  const wash = ctx.createLinearGradient(0, 0, w, 0)
  wash.addColorStop(0, rgba(deep, 0.85))
  wash.addColorStop(0.5, rgba(deep, 0))
  wash.addColorStop(1, rgba(deep, 0.85))
  ctx.fillStyle = wash
  ctx.fill()

  // Carved groove: a dark inner line, then a light one below it, so the rim
  // reads as raised rather than as a drawn outline.
  ctx.strokeStyle = rgba('#000000', 0.75)
  ctx.lineWidth = Math.max(1.5, h * 0.055)
  roundRect(ctx, h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, r)
  ctx.stroke()
  ctx.strokeStyle = rgba(rim, 0.9)
  ctx.lineWidth = Math.max(1, h * 0.03)
  roundRect(ctx, h * 0.11, h * 0.11, w - h * 0.22, h - h * 0.22, r * 0.88)
  ctx.stroke()

  // The rim's own light, kept TIGHT — a halo over magenta cannot be keyed out
  // on the return trip (`artSheet.ts`, the background contract).
  ctx.strokeStyle = rgba(rim, 0.35)
  ctx.lineWidth = Math.max(1, h * 0.08)
  roundRect(ctx, h * 0.09, h * 0.09, w - h * 0.18, h - h * 0.18, r * 0.92)
  ctx.stroke()

  // Four rivets, one at each shoulder, so the plaque reads as fixed to
  // something rather than floating.
  const rivet = (x: number, y: number): void => {
    ctx.beginPath()
    ctx.arc(x, y, h * 0.055, 0, Math.PI * 2)
    ctx.fillStyle = '#5a6480'
    ctx.fill()
    ctx.strokeStyle = rgba('#000000', 0.7)
    ctx.lineWidth = Math.max(1, h * 0.018)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x - h * 0.015, y - h * 0.018, h * 0.02, 0, Math.PI * 2)
    ctx.fillStyle = rgba('#dfe6ff', 0.8)
    ctx.fill()
  }
  const inset = h * 0.26
  rivet(inset, h * 0.28)
  rivet(inset, h - h * 0.28)
  rivet(w - inset, h * 0.28)
  rivet(w - inset, h - h * 0.28)

  // A shallow highlight across the top third — one sweep of light on stone.
  const gloss = ctx.createLinearGradient(0, h * 0.08, 0, h * 0.5)
  gloss.addColorStop(0, rgba('#ffffff', 0.16))
  gloss.addColorStop(1, rgba('#ffffff', 0))
  roundRect(ctx, h * 0.13, h * 0.11, w - h * 0.26, h * 0.4, r * 0.7)
  ctx.fillStyle = gloss
  ctx.fill()

  ctx.restore()
}

/**
 * ─── The result ribbon ──────────────────────────────────────────────────────
 *
 * The banner behind "VICTORY!", "DEFEAT" and "REWARDS". Like the counter
 * plate it is never rendered in play: the DOM stretches the PAINTING of it
 * through a 9-slice (`FReward.vue`), and a missing painting falls back to a
 * CSS plate cut to the same silhouette in the same colours. This painter is
 * the reference a model repaints, and the design of record for that fallback.
 *
 * The shape is dictated by the 9-slice, and by what came back wrong:
 *
 *   · ONE band, a swallow-tail notch cut into each end — no separate tails.
 *     The first painting was a swagged ribbon, band high and tails hung low,
 *     and every caption sat on its lower rim. A reference with tails tucked in
 *     BEHIND the band came back straight but with the tails hung low again, a
 *     model's idea of what a ribbon is, and the slicer registers the whole
 *     silhouette, so a low tail lifts the band off centre. With nothing behind
 *     the band there is nothing to hang: the silhouette's box IS the band.
 *   · Mirror-symmetric in both axes, the band's centre line on the image's,
 *     because that is where a caption centred in its box lands.
 *   · The ends and their fold creases sit inside `RIBBON_PLATE.cap`, the part
 *     the 9-slice keeps at true size; everything between the caps is one plain
 *     band of constant height that stretches without a seam.
 *
 * Night-indigo, not crimson: red is the FOE's colour everywhere in this game
 * (its tiles, its plaque, its stones), and this banner reads over a victory as
 * much as a loss. Gold is the reward colour. The caption is NOT painted — the
 * game ships twenty-one languages.
 *
 * Draws into (0, 0, w, h) and assumes the plate's proportions; a caller with a
 * different box letterboxes first (the bench does).
 */
export const paintRibbon = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  const cy = h / 2
  const cap = w * RIBBON_PLATE.cap
  const ink = '#1b1206'
  const gold = '#e6b84a', goldDeep = '#9a6a12', goldLight = '#ffe7a0'
  const line = Math.max(1.5, h * 0.022)
  const top = h * 0.1, bottom = h * 0.9, bandH = bottom - top
  const inset = line / 2 + h * 0.01
  const notch = bandH * 0.42
  // Where each end turns back on itself — inside the cap, so it is never stretched.
  const fold = cap * 0.62
  ctx.save()
  ctx.lineJoin = 'round'

  const outline = (): void => {
    ctx.beginPath()
    ctx.moveTo(inset, top)
    ctx.lineTo(w - inset, top)
    ctx.lineTo(w - inset - notch, cy)
    ctx.lineTo(w - inset, bottom)
    ctx.lineTo(inset, bottom)
    ctx.lineTo(inset + notch, cy)
    ctx.closePath()
  }

  // The cloth, lit from above.
  outline()
  const body = ctx.createLinearGradient(0, top, 0, bottom)
  body.addColorStop(0, '#565f9c')
  body.addColorStop(0.5, '#3c4379')
  body.addColorStop(1, '#282d57')
  ctx.fillStyle = body
  ctx.fill()

  ctx.save()
  ctx.clip()
  // The ends a shade darker, as the cloth that has turned back.
  const endShade = (from: number, to: number): void => {
    const g = ctx.createLinearGradient(from, 0, to, 0)
    g.addColorStop(0, rgba('#0b0d22', 0.5))
    g.addColorStop(1, rgba('#0b0d22', 0.18))
    ctx.fillStyle = g
  }
  endShade(0, fold)
  ctx.fillRect(0, top, fold, bandH)
  endShade(w, w - fold)
  ctx.fillRect(w - fold, top, fold, bandH)
  // One sweep of light across the upper cloth.
  const gloss = ctx.createLinearGradient(0, top, 0, cy)
  gloss.addColorStop(0, rgba('#ffffff', 0.12))
  gloss.addColorStop(1, rgba('#ffffff', 0))
  ctx.fillStyle = gloss
  ctx.fillRect(0, top, w, bandH / 2)
  // Gold trim: two straight, parallel rails the whole length.
  const railH = bandH * 0.1
  const rail = (y: number): void => {
    const g = ctx.createLinearGradient(0, y, 0, y + railH)
    g.addColorStop(0, goldLight)
    g.addColorStop(0.5, gold)
    g.addColorStop(1, goldDeep)
    ctx.fillStyle = g
    ctx.fillRect(0, y, w, railH)
  }
  rail(top)
  rail(bottom - railH)
  // The fold creases: a gold seam between two lines of ink.
  const seam = h * 0.02
  for (const x of [fold, w - fold]) {
    ctx.fillStyle = gold
    ctx.fillRect(x - seam, top, seam * 2, bandH)
    ctx.strokeStyle = rgba(ink, 0.8)
    ctx.lineWidth = line * 0.6
    ctx.beginPath()
    ctx.moveTo(x - seam, top)
    ctx.lineTo(x - seam, bottom)
    ctx.moveTo(x + seam, top)
    ctx.lineTo(x + seam, bottom)
    ctx.stroke()
  }
  // A hairline of ink under each rail, so the trim reads as sewn ON.
  ctx.strokeStyle = rgba(ink, 0.7)
  ctx.lineWidth = line * 0.55
  ctx.beginPath()
  ctx.moveTo(0, top + railH)
  ctx.lineTo(w, top + railH)
  ctx.moveTo(0, bottom - railH)
  ctx.lineTo(w, bottom - railH)
  ctx.stroke()
  ctx.restore()

  // The edge: gold binding, then the ink line.
  outline()
  ctx.strokeStyle = gold
  ctx.lineWidth = h * 0.04
  ctx.stroke()
  ctx.strokeStyle = ink
  ctx.lineWidth = line
  ctx.stroke()

  ctx.restore()
}

// ─── Damage: the stone breaks before it dies ────────────────────────────────
//
// A rune used to give nothing away between the hit that landed and the hit
// that killed it. Three blind testers in a row said the same thing in their own
// words — "no crack, no number… until it suddenly died" (Tom), "most of my hits
// seemed to do nothing" (Camila), "no enemy health bar or attack animation"
// (Aisha) — so a shielded enemy read as invulnerable rather than as wearing
// down, and winning felt like something that happened TO the player.
//
// So a damaged stone is a BROKEN stone, in three visible steps: a hairline, a
// split with branches, and a shattered face with chips knocked out of it. The
// network is generated once per stone from its own seed and each step only
// reveals more of it, so a rune's damage never redraws itself into a different
// stone — the crack you saw at a hairline is the crack that widens.
//
// Cut, not drawn on: every fissure is painted twice, a warm highlight offset up
// and left (the light in this whole module comes from the top-left) and the
// dark fissure over it, so the break reads as depth in the stone rather than
// ink on top of it.

/** How broken a stone looks. 0 is whole, 3 is about to go. */
export type DamageStage = 0 | 1 | 2 | 3

/**
 * The stage a rune's remaining health puts it in. Proportional, so the same
 * three steps read on a 2 HP dummy and a 12 HP wall: any damage at all shows,
 * and a stone under a third of its health is visibly falling apart.
 */
export const damageStage = (hp: number, maxHp: number): DamageStage => {
  if (!(maxHp > 0) || !(hp > 0)) return 0
  const left = hp / maxHp
  if (left >= 1) return 0
  if (left > 0.66) return 1
  if (left > 0.33) return 2
  return 3
}

/** One fissure, in a unit box centred on (0, 0): the stone is 1 across. */
export interface Fissure {
  pts: Pt[]
  /** Relative stroke weight — the trunk is heavier than what branches off it. */
  weight: number
  /** The first stage that shows this one. */
  from: DamageStage
}

/** A chip knocked clean out of the face. Stage 3 only. */
export interface Chip {
  pts: Pt[]
}

export interface CrackNetwork {
  fissures: Fissure[]
  chips: Chip[]
}

/**
 * The stone's face, in box units: nothing may be drawn outside it. Inside the
 * narrowest silhouette any cut produces (a pebble is a teardrop, and its point
 * is well inside a circle), because a break that runs off the rim hangs in the
 * air over the tile behind the stone.
 */
const FACE_RX = 0.26
const FACE_RY = 0.24

/** Pull a point back onto the face. A clipped fissure is an amputated one. */
const onFace = (x: number, y: number): Pt => {
  const d = Math.hypot(x / FACE_RX, y / FACE_RY)
  if (d <= 1) return { x, y }
  return { x: (x / d), y: (y / d) }
}

/** Walk a fissure from `x, y` along `angle`, wandering as stone does. */
const walk = (
  x: number, y: number, angle: number, steps: number, reach: number, seed: number
): [Pt[], number] => {
  const start = onFace(x, y)
  const pts: Pt[] = [start]
  let s = seed
  let a = angle
  let px = start.x
  let py = start.y
  for (let i = 0; i < steps; i++) {
    const [t, s1] = rand(s); s = s1
    const [l, s2] = rand(s); s = s2
    // A break turns in short, sharp kinks, not a smooth arc.
    a += (t - 0.5) * 1.15
    const len = reach * (0.55 + l * 0.7)
    const next = onFace(px + Math.cos(a) * len, py + Math.sin(a) * len)
    px = next.x
    py = next.y
    pts.push(next)
  }
  return [pts, s]
}

/**
 * Every fissure a stone will ever have, keyed on `seed`. Deterministic: the
 * same stone breaks the same way on the field, in the shop and on a sheet.
 */
export const crackNetwork = (seed: number): CrackNetwork => {
  let s = seedFrom(seed, 811)
  const fissures: Fissure[] = []
  const chips: Chip[] = []

  // Stage 1 — the trunk. Starts at the rim, because stone gives at its edge,
  // and runs in toward the middle.
  const [entry, s1] = rand(s); s = s1
  const rim = entry * TAU
  const sx = Math.cos(rim) * FACE_RX
  const sy = Math.sin(rim) * FACE_RY
  const inward = Math.atan2(-sy, -sx)
  const [trunk, s2] = walk(sx, sy, inward, 3, 0.13, s); s = s2
  fissures.push({ pts: trunk, weight: 1, from: 1 })

  // Stage 2 — the trunk runs on past the middle, and one limb leaves it.
  const head = trunk[trunk.length - 1]!
  const prev = trunk[trunk.length - 2]!
  const heading = Math.atan2(head.y - prev.y, head.x - prev.x)
  const [run, s3] = walk(head.x, head.y, heading, 3, 0.14, s); s = s3
  fissures.push({ pts: run, weight: 0.85, from: 2 })
  const fork = trunk[1]!
  const [limb, s4] = walk(fork.x, fork.y, heading + 1.25, 2, 0.11, s); s = s4
  fissures.push({ pts: limb, weight: 0.6, from: 2 })

  // Stage 3 — the face lets go: two more limbs, a second break from the far
  // rim, and chips knocked out where the fissures meet.
  const [limbB, s5] = walk(run[1]!.x, run[1]!.y, heading - 1.4, 2, 0.1, s); s = s5
  fissures.push({ pts: limbB, weight: 0.55, from: 3 })
  const [far, s6] = rand(s); s = s6
  const fa = rim + Math.PI + (far - 0.5) * 1.2
  const [second, s7] = walk(Math.cos(fa) * FACE_RX, Math.sin(fa) * FACE_RY, fa + Math.PI, 3, 0.12, s); s = s7
  fissures.push({ pts: second, weight: 0.7, from: 3 })
  const [limbC, s8] = walk(second[1]!.x, second[1]!.y, fa + Math.PI + 1.3, 2, 0.09, s); s = s8
  fissures.push({ pts: limbC, weight: 0.5, from: 3 })

  for (const at of [trunk[2]!, run[2]!]) {
    const [r0, s9] = rand(s); s = s9
    const pts: Pt[] = []
    const n = 5
    const rad = 0.035 + r0 * 0.03
    for (let i = 0; i < n; i++) {
      const [j, sj] = rand(s); s = sj
      const a = (i / n) * TAU
      const rr = rad * (0.6 + j * 0.7)
      pts.push({ x: at.x + Math.cos(a) * rr, y: at.y + Math.sin(a) * rr })
    }
    chips.push({ pts })
  }

  return { fissures, chips }
}

/**
 * Paint a stone's damage into the box (0, 0, w, h). Nothing at stage 0.
 * Clipped to the stone's face so a fissure never runs off onto the tile.
 */
export const paintDamage = (
  ctx: CanvasRenderingContext2D, w: number, h: number, stage: DamageStage, seed: number
): void => {
  if (stage <= 0) return
  const { fissures, chips } = crackNetwork(seed)
  const cx = w / 2
  const cy = h / 2
  const unit = Math.min(w, h)

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(cx, cy, w * 0.32, h * 0.3, 0, 0, TAU)
  ctx.clip()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // A fracture is widest where it started and closes to nothing at its tip, so
  // every run is stroked SEGMENT BY SEGMENT with a falling width. One even
  // stroke end to end is what makes a crack read as a drawn line.
  const trace = (pts: Pt[], wide: number, style: string, nx = 0, ny = 0): void => {
    for (let i = 1; i < pts.length; i++) {
      const t = 1 - (i - 1) / Math.max(1, pts.length - 1)
      ctx.strokeStyle = style
      ctx.lineWidth = Math.max(0.6, wide * (0.25 + t * 0.75))
      ctx.beginPath()
      ctx.moveTo(cx + pts[i - 1]!.x * w + nx, cy + pts[i - 1]!.y * h + ny)
      ctx.lineTo(cx + pts[i]!.x * w + nx, cy + pts[i]!.y * h + ny)
      ctx.stroke()
    }
  }

  // Chips first: the fissures have to run over their edges, not under them.
  if (stage >= 3) {
    for (const chip of chips) {
      ctx.beginPath()
      ctx.moveTo(cx + chip.pts[0]!.x * w, cy + chip.pts[0]!.y * h)
      for (let i = 1; i < chip.pts.length; i++) ctx.lineTo(cx + chip.pts[i]!.x * w, cy + chip.pts[i]!.y * h)
      ctx.closePath()
      // A chip is a hole: dark inside, with the fresh broken edge catching the
      // light along its upper rim.
      ctx.fillStyle = rgba('#241708', 0.8)
      ctx.fill()
      ctx.strokeStyle = rgba('#ffe9c8', 0.38)
      ctx.lineWidth = Math.max(0.8, unit * 0.007)
      ctx.stroke()
    }
  }

  // The break opens as the stone goes: a hairline at first, a split at the end.
  const open = stage >= 3 ? 1.45 : stage >= 2 ? 1.15 : 1
  const lift = Math.max(0.6, unit * 0.011)
  for (const f of fissures) {
    if (f.from > stage) continue
    const wide = unit * 0.015 * f.weight * open
    // The lip the light catches, offset up and left — the direction every
    // other highlight in this module comes from — so the break has a near
    // wall and a far one instead of being a line lying on the surface.
    trace(f.pts, wide * 0.8, rgba('#fff3dc', 0.42), -lift, -lift)
    // The shadow in the bottom of it, just past the lip.
    trace(f.pts, wide * 0.7, rgba('#2a1a0d', 0.35), lift * 0.7, lift * 0.7)
    // And the break itself.
    trace(f.pts, wide, rgba('#140c06', stage >= 3 ? 0.9 : 0.8))
  }

  ctx.restore()
}
