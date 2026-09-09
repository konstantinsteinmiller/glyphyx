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
  type Faction, type GlyphStyle, type Owner, type PebbleShape, type RuneType, type SkinDef
} from '@/game/rules'
import { glyphPath } from '@/game/glyphs'
import { rand, seedFrom } from '@/game/rng'

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

// Seeds `stoneOutline` (with the skin's shape), so each rune type gets its own
// cut of the same material. The VALUE is arbitrary but load-bearing: change one
// and that rune's stones are re-knapped into a different silhouette, silently.
// New types append; they never renumber the five that shipped.
const TYPE_IDX: Record<RuneType, number> =
  { melee: 1, archer: 2, mage: 3, defense: 4, support: 5, cleave: 6, roller: 7, bombard: 8, nuker: 9 }
const SHAPE_IDX: Record<PebbleShape, number> = { pebble: 1, shard: 2, oval: 3, hex: 4, disc: 5, slab: 6 }

// ─── Outlines ───────────────────────────────────────────────────────────────

export interface Pt { x: number; y: number }

/**
 * The silhouette of a stone as a closed polygon in a unit box: every point has
 * |x| ≤ 1 and |y| ≤ 1 and at least one touches ±1, so a caller scales by ONE
 * radius. Deterministic in `seed`; the same seed always cuts the same stone.
 */
export const stoneOutline = (shape: PebbleShape, seed: number): Pt[] => {
  const rng = makeRng(seed)
  const pts: Pt[] = []
  switch (shape) {
    case 'pebble': {
      const N = 48
      const a1 = rng() * TAU
      const a2 = rng() * TAU
      const a3 = rng() * TAU
      const chipA = rng() * TAU
      const chipB = chipA + Math.PI * (0.7 + rng() * 0.6)
      const d1 = 0.05 + rng() * 0.05
      const d2 = 0.03 + rng() * 0.04
      for (let i = 0; i < N; i++) {
        const th = (i / N) * TAU
        const wob = 1 + 0.05 * Math.sin(2 * th + a1) + 0.04 * Math.sin(3 * th + a2) + 0.018 * Math.sin(5 * th + a3)
        const chip = -d1 * gauss(angDiff(th, chipA) / 0.2) - d2 * gauss(angDiff(th, chipB) / 0.15)
        const r = wob + chip
        pts.push({ x: Math.cos(th) * r, y: Math.sin(th) * r * 0.86 })
      }
      break
    }
    case 'oval': {
      const N = 48
      for (let i = 0; i < N; i++) {
        const th = (i / N) * TAU
        pts.push({ x: Math.cos(th), y: Math.sin(th) * 0.78 })
      }
      break
    }
    case 'disc': {
      const N = 48
      for (let i = 0; i < N; i++) {
        const th = (i / N) * TAU
        pts.push({ x: Math.cos(th), y: Math.sin(th) })
      }
      break
    }
    case 'hex': {
      for (let k = 0; k < 6; k++) {
        const th = -Math.PI / 2 + (k * Math.PI) / 3
        pts.push({ x: Math.cos(th), y: Math.sin(th) })
      }
      break
    }
    case 'shard': {
      const n = 6 + Math.floor(rng() * 3)
      const step = TAU / n
      const start = rng() * TAU
      for (let k = 0; k < n; k++) {
        const th = start + k * step + (rng() - 0.5) * step * 0.5
        const r = 0.72 + rng() * 0.28
        pts.push({ x: Math.cos(th) * r, y: Math.sin(th) * r * 0.92 })
      }
      break
    }
    case 'slab': {
      const hw = 0.95
      const hh = 0.76
      const rr = 0.2
      const chipped = Math.floor(rng() * 4)
      const arc = (cx: number, cy: number, from: number): void => {
        for (let i = 0; i <= 6; i++) {
          const th = from + (i / 6) * (Math.PI / 2)
          pts.push({ x: cx + Math.cos(th) * rr, y: cy + Math.sin(th) * rr })
        }
      }
      // Clockwise from the top edge; one corner is knocked off.
      const corner = (k: number, cx: number, cy: number, from: number, sx: number, sy: number): void => {
        if (k !== chipped) { arc(cx, cy, from); return }
        // A jagged chamfer in place of the rounded corner.
        pts.push({ x: cx + sx * (rr - 0.34), y: cy + sy * rr })
        pts.push({ x: cx + sx * (rr - 0.1), y: cy + sy * (rr - 0.12) })
        pts.push({ x: cx + sx * rr, y: cy + sy * (rr - 0.34) })
      }
      corner(0, hw - rr, -hh + rr, -Math.PI / 2, 1, -1)
      corner(1, hw - rr, hh - rr, 0, 1, 1)
      corner(2, -hw + rr, hh - rr, Math.PI / 2, -1, 1)
      corner(3, -hw + rr, -hh + rr, Math.PI, -1, -1)
      break
    }
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

export type Material = 'sandstone' | 'obsidian' | 'jade' | 'amber' | 'marble' | 'lava'

/** The way the glyph is cut tells you what the stone is made of. */
export const materialOf = (style: GlyphStyle): Material => {
  switch (style) {
    case 'neon': return 'obsidian'
    case 'inlay': return 'jade'
    case 'gem': return 'amber'
    case 'carved': return 'marble'
    case 'ember': return 'lava'
    default: return 'sandstone'
  }
}

/** The enemy's stone: the same sandstone, fired rust-red. */
export const ENEMY_STONE: SkinDef = {
  id: 'river', price: 0, shape: 'pebble', glyph: 'engraved',
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
  if (skin.shape === 'disc') {
    // The raised rim: a recessed inner face.
    const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R)
    g.addColorStop(0, rgba(skin.lo, 0.55))
    g.addColorStop(1, rgba('#ffffff', 0.4))
    ctx.strokeStyle = g
    ctx.lineWidth = R * 0.06
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.8, 0, TAU)
    ctx.stroke()
  }
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

const paintMaterial = (ctx: CanvasRenderingContext2D, b: Body, mat: Material): void => {
  switch (mat) {
    case 'obsidian': paintObsidian(ctx, b); break
    case 'jade': paintJade(ctx, b); break
    case 'amber': paintAmber(ctx, b); break
    case 'marble': paintMarble(ctx, b); break
    case 'lava': paintLava(ctx, b); break
    default: paintSandstone(ctx, b)
  }
}

/**
 * The stone itself: halo, body gradient, material, bevels, rim light, outline,
 * and the gold ring of a Lv 2. `level` 0 = a bare stone (previews, the key).
 */
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

/** The outline the laurel of `shape` hugs: the sword's cut of that stone, so every rune of a skin wears the same wreath. */
const laurelOutline = (shape: PebbleShape): Pt[] =>
  stoneOutline(shape, seedFrom(TYPE_IDX.melee * 7919 + 17, SHAPE_IDX[shape] * 104729))

/**
 * The rim of a `shape` stone at absolute angle `a` (0 = right, π/2 = down),
 * as a fraction of the stone's radius. Exported so the tests can pin that an
 * oval's wreath sits closer under the stone than a disc's.
 */
export const laurelRimAt = (shape: PebbleShape, a: number): number => rayHit(laurelOutline(shape), a)

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
export const paintLaurel = (ctx: CanvasRenderingContext2D, w: number, h: number, shape: PebbleShape = 'pebble'): void => {
  const size = Math.min(w, h)
  const cx = w / 2
  const cy = h / 2
  // The rim of a Lv 2 stone in this box; the wreath sits just outside it — and
  // follows the SILHOUETTE: an oval's foot is closer than a disc's, a hex has
  // corners, a slab is flat. One wreath shape per stone shape, never a circle
  // floating under a stone that is not one.
  const R = (size / 2) * stoneFill(2)
  const pts = laurelOutline(shape)
  const rimAt = (a: number): number => R * rayHit(pts, a) * 1.06
  const gold = ctx.createLinearGradient(cx - R, cy, cx + R, cy + R * 1.2)
  gold.addColorStop(0, GOLD_LIGHT)
  gold.addColorStop(0.5, '#e6b53a')
  gold.addColorStop(1, GOLD_DEEP)

  const A0 = 0.07 * Math.PI
  const A1 = 0.48 * Math.PI
  const angle = (s: number, t: number): number => Math.PI / 2 + s * (A0 + (A1 - A0) * t)
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

const compact = (shape: PebbleShape): boolean => shape === 'hex' || shape === 'shard' || shape === 'disc'

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
  const seed = seedFrom(TYPE_IDX[o.type] * 7919 + 17, SHAPE_IDX[skin.shape] * 104729)
  const pts = stoneOutline(skin.shape, seed)
  paintBody(ctx, { cx, cy, R, pts, skin, seed, glow }, o.level)
  const gsize = R * (compact(skin.shape) ? 1.0 : 1.14)
  drawStyledGlyph(ctx, cx, cy + R * 0.02, gsize, o.type, skin.glyph, skin.ink, glow, skin.hi, pulse)
  if (o.level >= 2) {
    if (o.laurel !== false) paintLaurel(ctx, w, h, skin.shape)
    paintCrest(ctx, cx, cy, R, o.label)
  }
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
  const pts = stoneOutline('pebble', seed)
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

/** The bare stone silhouette of a shape, for previews and the sheet's key. */
export const paintStoneShape = (ctx: CanvasRenderingContext2D, w: number, h: number, shape: PebbleShape, skin: SkinDef): void => {
  const size = Math.min(w, h)
  const seed = seedFrom(SHAPE_IDX[shape] * 31 + 5)
  const pts = stoneOutline(shape, seed)
  const body: SkinDef = { ...skin, shape }
  ctx.save()
  paintBody(ctx, { cx: w / 2, cy: h / 2, R: (size / 2) * 0.86, pts, skin: body, seed, glow: skin.glow ?? skin.rim }, 0)
  ctx.restore()
}
