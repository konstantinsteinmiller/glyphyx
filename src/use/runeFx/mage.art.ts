import { bakeSprite, poolSprite, rgba } from './kit'

/**
 * ─── Orb (`mage`) — its baked light ─────────────────────────────────────────
 *
 * Every sprite the orb's effects blit, baked ONCE under a constant key (so the
 * frame path never builds a key string or a closure) and redrawn by the
 * bakery only if its cache is dropped. With no 2D context (tests) every getter
 * returns `null` and the painters in `mage.ts` draw nothing — never a throw.
 *
 * The look: ARCANE LIGHT. A spinning rune circle (two rings, a band of carved
 * glyphs, the four diagonal sparks of the orb's own glyph), a hexagram sigil,
 * a beam cross-section that is violet at the rim and white-hot at the core, a
 * six-petal bloom, a pillar of light, and glyph shards for debris.
 */

/** The orb's neon — `RUNES.mage.color`. */
export const VIOLET = '#b57bff'
/**
 * The saturated violet the GLOWS are made of. Light adds up: the neon itself,
 * stacked additively over the blue slate, clips to pink-white in two layers,
 * so every halo is this deeper hue and only the thinnest cores go pale.
 */
export const GLOW = '#8a45ff'
/** The hot, lighter violet of lit lines. */
export const LAVENDER = '#dcc4ff'
/** The deep shade — the ink under the beam. */
export const DEEP = '#2c0f66'
/** The arcane accent: used for sparks, the crackle and the sigil's points. */
export const CYAN = '#7ff3ff'
const WHITE = '#f6efff'

type Draw = (t: CanvasRenderingContext2D, s: number) => void

/** A sprite getter: the bake under a constant key. */
const sprite = (key: string, px: number, draw: Draw) => (): HTMLCanvasElement | null => bakeSprite(key, px, draw)

// ─── Bake-time helpers (never on the frame path) ────────────────────────────

const radial = (t: CanvasRenderingContext2D, s: number, stops: ReadonlyArray<readonly [number, string]>): void => {
  const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  for (const [o, c] of stops) g.addColorStop(o, c)
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
}

/**
 * A luminous line without a blur: the same path three times, wide and faint,
 * medium, then thin and hot — the way an inked glow is painted by hand.
 */
const glowStroke = (t: CanvasRenderingContext2D, path: () => void, w: number, glow: string, core: string, k = 1): void => {
  t.lineCap = 'round'
  t.lineJoin = 'round'
  t.strokeStyle = rgba(glow, Math.min(1, 0.16 * k))
  t.lineWidth = w * 6
  path(); t.stroke()
  t.strokeStyle = rgba(glow, Math.min(1, 0.55 * k))
  t.lineWidth = w * 2.6
  path(); t.stroke()
  t.strokeStyle = core
  t.lineWidth = w
  path(); t.stroke()
}

/** Carved rune marks, as polylines in a unit box [-1, 1]² (y down). */
const GLYPHS: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>> = [
  [[0, 1, 0, -1], [0, -0.3, 0.7, -0.9], [0, 0.25, 0.7, -0.35]],
  [[0, 1, 0, -1], [0, -0.25, -0.7, -0.95], [0, -0.25, 0.7, -0.95]],
  [[-0.75, 0.8, 0, -0.9, 0.75, 0.8, -0.75, 0.8]],
  [[0, -1, 0.62, 0, 0, 1, -0.62, 0, 0, -1]],
  [[0, 1, 0, -1], [0, -0.6, 0.66, 0, 0, 0.6]],
  [[-0.7, -0.8, 0.7, 0.8], [0.7, -0.8, -0.7, 0.8], [-0.85, 0, 0.85, 0]]
]

const glyphPathAt = (t: CanvasRenderingContext2D, g: number, x: number, y: number, r: number, rot: number): void => {
  const lines = GLYPHS[g % GLYPHS.length]!
  const c = Math.cos(rot)
  const sn = Math.sin(rot)
  t.beginPath()
  for (const pl of lines) {
    for (let i = 0; i + 1 < pl.length; i += 2) {
      const gx = pl[i]! * r
      const gy = pl[i + 1]! * r
      const px = x + gx * c - gy * sn
      const py = y + gx * sn + gy * c
      if (i === 0) t.moveTo(px, py); else t.lineTo(px, py)
    }
  }
}

const circlePath = (t: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  t.beginPath()
  t.arc(x, y, r, 0, Math.PI * 2)
}

// ─── The rune circle ────────────────────────────────────────────────────────

/** Two rings, a band of twelve carved glyphs, a ring of ticks, and the orb glyph's four diagonal sparks. */
const drawCircle: Draw = (t, s) => {
  const c = s / 2
  const r1 = s * 0.45
  const r2 = s * 0.365
  glowStroke(t, () => circlePath(t, c, c, r1), s * 0.012, GLOW, VIOLET, 1.5)
  // A hairline of lavender on the outer ring's crest: lit, but still violet.
  t.strokeStyle = rgba(LAVENDER, 0.8)
  t.lineWidth = s * 0.004
  circlePath(t, c, c, r1); t.stroke()
  glowStroke(t, () => circlePath(t, c, c, r2), s * 0.007, GLOW, VIOLET, 1.2)
  // Ticks just outside the outer ring, every fourth one longer.
  t.strokeStyle = rgba(VIOLET, 0.9)
  t.lineCap = 'round'
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const long = i % 4 === 0
    t.lineWidth = s * (long ? 0.007 : 0.004)
    t.beginPath()
    t.moveTo(c + Math.cos(a) * (r1 + s * 0.012), c + Math.sin(a) * (r1 + s * 0.012))
    t.lineTo(c + Math.cos(a) * (r1 + s * (long ? 0.034 : 0.022)), c + Math.sin(a) * (r1 + s * (long ? 0.034 : 0.022)))
    t.stroke()
  }
  // The glyph band.
  const rb = (r1 + r2) / 2
  const n = 12
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / n
    const gx = c + Math.cos(a) * rb
    const gy = c + Math.sin(a) * rb
    glowStroke(t, () => glyphPathAt(t, (i * 5 + 1) % 6, gx, gy, s * 0.026, a + Math.PI / 2), s * 0.0065, GLOW, LAVENDER, 1)
  }
  // The orb glyph's four sparks, on the diagonals, sitting on the outer ring.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2
    const x = c + Math.cos(a) * r1
    const y = c + Math.sin(a) * r1
    const d = s * 0.036
    const g = t.createRadialGradient(x, y, 0, x, y, d * 2.4)
    g.addColorStop(0, rgba(CYAN, 0.55))
    g.addColorStop(1, rgba(CYAN, 0))
    t.fillStyle = g
    t.fillRect(x - d * 2.4, y - d * 2.4, d * 4.8, d * 4.8)
    t.fillStyle = WHITE
    t.beginPath()
    t.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d)
    t.lineTo(x + Math.cos(a + Math.PI / 2) * d * 0.55, y + Math.sin(a + Math.PI / 2) * d * 0.55)
    t.lineTo(x - Math.cos(a) * d, y - Math.sin(a) * d)
    t.lineTo(x - Math.cos(a + Math.PI / 2) * d * 0.55, y - Math.sin(a + Math.PI / 2) * d * 0.55)
    t.closePath()
    t.fill()
  }
}

/** The hexagram inside the circle, a small inner ring, cyan points at the star's tips. */
const drawSigil: Draw = (t, s) => {
  const c = s / 2
  const r = s * 0.36
  const tri = (off: number): void => {
    t.beginPath()
    for (let k = 0; k < 3; k++) {
      const a = off + (k / 3) * Math.PI * 2
      const x = c + Math.cos(a) * r
      const y = c + Math.sin(a) * r
      if (k === 0) t.moveTo(x, y); else t.lineTo(x, y)
    }
    t.closePath()
  }
  glowStroke(t, () => tri(-Math.PI / 2), s * 0.006, GLOW, VIOLET, 0.9)
  glowStroke(t, () => tri(Math.PI / 2), s * 0.006, GLOW, VIOLET, 0.9)
  glowStroke(t, () => circlePath(t, c, c, s * 0.2), s * 0.005, GLOW, VIOLET, 0.7)
  for (let k = 0; k < 6; k++) {
    const a = -Math.PI / 2 + (k / 6) * Math.PI * 2
    const x = c + Math.cos(a) * r
    const y = c + Math.sin(a) * r
    const g = t.createRadialGradient(x, y, 0, x, y, s * 0.04)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, rgba(CYAN, 0.85))
    g.addColorStop(1, rgba(CYAN, 0))
    t.fillStyle = g
    t.fillRect(x - s * 0.04, y - s * 0.04, s * 0.08, s * 0.08)
  }
}

export const circleSprite = sprite('mage|circle', 256, drawCircle)
export const sigilSprite = sprite('mage|sigil', 256, drawSigil)

// ─── Glows ──────────────────────────────────────────────────────────────────

export const glowViolet = sprite('mage|glow|v', 128, (t, s) => radial(t, s, [
  [0, rgba(VIOLET, 0.85)], [0.22, rgba(GLOW, 0.55)], [0.55, rgba(GLOW, 0.16)], [1, rgba(GLOW, 0)]
]))

export const glowCyan = sprite('mage|glow|c', 128, (t, s) => radial(t, s, [
  [0, rgba(CYAN, 0.85)], [0.3, rgba(CYAN, 0.4)], [0.65, rgba(CYAN, 0.1)], [1, rgba(CYAN, 0)]
]))

/** The white-hot centre of a flash — a small white heart bleeding to violet. */
export const hotCore = sprite('mage|core', 128, (t, s) => radial(t, s, [
  [0, 'rgba(255,255,255,1)'], [0.1, 'rgba(255,255,255,0.9)'], [0.24, rgba(LAVENDER, 0.7)],
  [0.5, rgba(GLOW, 0.32)], [1, rgba(GLOW, 0)]
]))

/** A soft dark pool — the ink under a glow, so light reads against the slate. Drawn source-over. */
export const inkPool = sprite('mage|ink', 64, (t, s) => radial(t, s, [
  [0, rgba(DEEP, 0.7)], [0.5, rgba(DEEP, 0.35)], [1, rgba(DEEP, 0)]
]))

/** A thin ring of cyan light with a white crest — the bloom's shock. */
export const ringCyan = sprite('mage|ring|c', 128, (t, s) => radial(t, s, [
  [0, rgba(CYAN, 0)], [0.76, rgba(CYAN, 0)], [0.86, rgba(CYAN, 0.7)], [0.9, 'rgba(255,255,255,0.95)'],
  [0.94, rgba(CYAN, 0.6)], [1, rgba(CYAN, 0)]
]))

/** The same ring in violet, for the pillars' footprints. */
export const ringViolet = sprite('mage|ring|v', 128, (t, s) => radial(t, s, [
  [0, rgba(VIOLET, 0)], [0.7, rgba(VIOLET, 0)], [0.84, rgba(VIOLET, 0.75)], [0.9, rgba(LAVENDER, 0.95)],
  [0.95, rgba(VIOLET, 0.5)], [1, rgba(VIOLET, 0)]
]))

// ─── The beam's cross-sections (uniform along x, stretched to any length) ────

const band = (stops: ReadonlyArray<readonly [number, string]>): Draw => (t, s) => {
  const g = t.createLinearGradient(0, 0, 0, s)
  for (const [o, c] of stops) g.addColorStop(o, c)
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
}

/** The ink under the beam (drawn source-over): a dark violet shadow that makes the light read on the slate. */
export const bandInk = sprite('mage|band|ink', 64, band([
  [0, rgba(DEEP, 0)], [0.25, rgba(DEEP, 0.3)], [0.5, rgba(DEEP, 0.75)], [0.75, rgba(DEEP, 0.3)], [1, rgba(DEEP, 0)]
]))

/** The soft violet body around the beam. */
export const bandHalo = sprite('mage|band|halo', 64, band([
  [0, rgba(GLOW, 0)], [0.2, rgba(GLOW, 0.12)], [0.38, rgba(GLOW, 0.45)], [0.5, rgba(VIOLET, 0.75)],
  [0.62, rgba(GLOW, 0.45)], [0.8, rgba(GLOW, 0.12)], [1, rgba(GLOW, 0)]
]))

/** The beam proper: a violet body, lavender toward the middle. The white filament is stroked on top. */
export const bandCore = sprite('mage|band|core', 64, band([
  [0, rgba(GLOW, 0)], [0.2, rgba(GLOW, 0.4)], [0.38, rgba(VIOLET, 0.9)], [0.5, rgba(LAVENDER, 0.8)],
  [0.62, rgba(VIOLET, 0.9)], [0.8, rgba(GLOW, 0.4)], [1, rgba(GLOW, 0)]
]))

// ─── The bloom ──────────────────────────────────────────────────────────────

/**
 * The arcane bloom: six pointed violet petals with lit edges, six thin cyan
 * ones between them, open at the heart (the struck stone shows through).
 */
export const bloomSprite = sprite('mage|bloom', 192, (t, s) => {
  const c = s / 2
  const petal = (a: number, r0: number, len: number, wid: number, fill: string, edge: string, edgeW: number): void => {
    t.save()
    t.translate(c, c)
    t.rotate(a)
    // A pointed petal: two quadratic curves from the heart to the tip.
    const path = (): void => {
      t.beginPath()
      t.moveTo(r0, 0)
      t.quadraticCurveTo(r0 + len * 0.45, -wid, r0 + len, 0)
      t.quadraticCurveTo(r0 + len * 0.45, wid, r0, 0)
      t.closePath()
    }
    const g = t.createLinearGradient(r0, 0, r0 + len, 0)
    g.addColorStop(0, rgba(fill, 0.15))
    g.addColorStop(0.35, rgba(fill, 0.85))
    g.addColorStop(0.8, rgba(fill, 0.5))
    g.addColorStop(1, rgba(fill, 0))
    path()
    t.fillStyle = g
    t.fill()
    t.strokeStyle = rgba(edge, 0.9)
    t.lineWidth = edgeW
    t.lineJoin = 'round'
    t.stroke()
    t.restore()
  }
  t.globalCompositeOperation = 'lighter'
  for (let k = 0; k < 6; k++) petal((k / 6) * Math.PI * 2, s * 0.1, s * 0.39, s * 0.095, GLOW, LAVENDER, s * 0.008)
  for (let k = 0; k < 6; k++) petal(((k + 0.5) / 6) * Math.PI * 2, s * 0.14, s * 0.26, s * 0.03, CYAN, '#e6fdff', s * 0.005)
})

// ─── The pillar (stretched to any width and height; its base is the bottom edge) ─

export const pillarSprite = sprite('mage|pillar', 128, (t, s) => {
  const across = t.createLinearGradient(0, 0, s, 0)
  across.addColorStop(0, rgba(GLOW, 0))
  across.addColorStop(0.2, rgba(GLOW, 0.22))
  across.addColorStop(0.37, rgba(GLOW, 0.8))
  across.addColorStop(0.45, rgba(VIOLET, 1))
  across.addColorStop(0.49, rgba(LAVENDER, 1))
  across.addColorStop(0.5, 'rgba(255,255,255,1)')
  across.addColorStop(0.51, rgba(LAVENDER, 1))
  across.addColorStop(0.55, rgba(VIOLET, 1))
  across.addColorStop(0.63, rgba(GLOW, 0.8))
  across.addColorStop(0.8, rgba(GLOW, 0.22))
  across.addColorStop(1, rgba(GLOW, 0))
  t.fillStyle = across
  t.fillRect(0, 0, s, s)
  // Fade the top away and round off the foot.
  const up = t.createLinearGradient(0, 0, 0, s)
  up.addColorStop(0, 'rgba(0,0,0,0)')
  up.addColorStop(0.18, 'rgba(0,0,0,0.45)')
  up.addColorStop(0.4, 'rgba(0,0,0,0.95)')
  up.addColorStop(0.92, 'rgba(0,0,0,1)')
  up.addColorStop(1, 'rgba(0,0,0,0.4)')
  t.globalCompositeOperation = 'destination-in'
  t.fillStyle = up
  t.fillRect(0, 0, s, s)
})

// ─── Particle shapes ────────────────────────────────────────────────────────

const moteDraw = (color: string): Draw => (t, s) => radial(t, s, [
  [0, 'rgba(255,255,255,1)'], [0.28, rgba(color, 0.9)], [0.6, rgba(color, 0.25)], [1, rgba(color, 0)]
])

const shardDraw = (g: number): Draw => (t, s) => {
  const c = s / 2
  // A faint violet halo so the shard reads as light, then the carved mark.
  const h = t.createRadialGradient(c, c, 0, c, c, c)
  h.addColorStop(0, rgba(VIOLET, 0.45))
  h.addColorStop(1, rgba(VIOLET, 0))
  t.fillStyle = h
  t.fillRect(0, 0, s, s)
  t.lineCap = 'round'
  t.lineJoin = 'round'
  t.strokeStyle = rgba(VIOLET, 0.8)
  t.lineWidth = s * 0.16
  glyphPathAt(t, g, c, c, s * 0.3, 0); t.stroke()
  t.strokeStyle = WHITE
  t.lineWidth = s * 0.065
  glyphPathAt(t, g, c, c, s * 0.3, 0); t.stroke()
}

const moteV = moteDraw(VIOLET)
const moteC = moteDraw(CYAN)
const makeMoteV = (): HTMLCanvasElement | null => bakeSprite('mage|mote|v', 32, moteV)
const makeMoteC = (): HTMLCanvasElement | null => bakeSprite('mage|mote|c', 32, moteC)
const SHARD_MAKERS = [0, 1, 2, 3].map((g) => {
  const draw = shardDraw(g)
  const key = `mage|shard|${g}`
  return (): HTMLCanvasElement | null => bakeSprite(key, 32, draw)
})
const SHARD_KEYS = ['mage|p|shard0', 'mage|p|shard1', 'mage|p|shard2', 'mage|p|shard3']

/** Pool ids for the particle shapes (registered once; −1 where nothing could be baked). */
export const moteVId = (): number => poolSprite('mage|p|mote|v', makeMoteV)
export const moteCId = (): number => poolSprite('mage|p|mote|c', makeMoteC)
export const shardId = (i: number): number => {
  const k = i & 3
  return poolSprite(SHARD_KEYS[k]!, SHARD_MAKERS[k]!)
}

/** Sprite getters for glyphs painted per frame (the sparks riding the beam). */
export const shardSprite = (i: number): HTMLCanvasElement | null => SHARD_MAKERS[i & 3]!()
