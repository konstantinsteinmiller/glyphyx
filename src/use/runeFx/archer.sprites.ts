import {
  bakeSprite, coreSprite, glintSprite, glowSprite, moteSprite, poolSprite, rgba, ringSprite, runeColor, streakSprite
} from './kit'

/**
 * ─── Bow (`archer`) — the palette and the baked pieces ──────────────────────
 *
 * Everything the bow draws that has a SHAPE is baked here once and blitted:
 * the arrow itself (inked, like the stones), the piercing star, the leaf /
 * fletching fleck and the wind wisp — plus the handful of stock glows the
 * module leans on. Every getter is memoised on a CONSTANT key, so the frame
 * path builds no key strings, no closures and no gradients: one call is one
 * variable read after the first.
 *
 * With no 2D context every bake is `null` and the module falls back to plain
 * strokes (or nothing).
 */

// ─── Palette ────────────────────────────────────────────────────────────────

/** Emerald — the bow's neon. */
export const CORE = runeColor('archer')
/** Pale wind green, nearly white: the ribbon's bright strand, the arrow's tip. */
export const HOT = '#d9ffe4'
/** Deep forest: the dark of the ribbon's halo and the leaves' shade. */
export const DEEP = '#0f6b3a'
/** Spring lime: fletching tips, the odd leaf. */
export const ACCENT = '#e9ffb0'
/** The support rune's gold, for a bow the cross has sharpened. */
export const GOLD = '#ffd23f'
/** The ink every hand-painted thing on the board is outlined in. */
export const INK = '#0b1f14'
/** Wind: the ribbon's bright strand and the wisps — green light, never white. */
export const WIND = '#86ff9f'

// ─── The arrow ──────────────────────────────────────────────────────────────

/**
 * The arrow is baked horizontally, tip pointing +x, into a 128² canvas; this is
 * the band of it the arrow occupies. `blitArrow` draws only that band, so the
 * blit has the arrow's own aspect and never a mostly-empty square.
 */
const BAND_Y = 42
const BAND_H = 44

const drawArrow = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  t.lineJoin = 'round'
  t.lineCap = 'round'
  // ── Fletching: two vanes swept back from the nock. ──
  const fl = t.createLinearGradient(4, 0, 40, 0)
  fl.addColorStop(0, ACCENT)
  fl.addColorStop(0.55, CORE)
  fl.addColorStop(1, rgba(CORE, 0.9))
  for (let k = 0; k < 2; k++) {
    const sgn = k === 0 ? -1 : 1
    t.beginPath()
    t.moveTo(40, c + sgn * 2)
    t.quadraticCurveTo(26, c + sgn * 13, 5, c + sgn * 16)
    t.lineTo(13, c + sgn * 4)
    t.quadraticCurveTo(24, c + sgn * 3, 40, c + sgn * 2)
    t.closePath()
    t.strokeStyle = INK
    t.lineWidth = 4.5
    t.stroke()
    t.fillStyle = fl
    t.fill()
  }
  // ── Shaft: ink first, then the pale wood over it. ──
  t.strokeStyle = INK
  t.lineWidth = 7.5
  t.beginPath(); t.moveTo(6, c); t.lineTo(104, c); t.stroke()
  t.strokeStyle = '#f3ffe9'
  t.lineWidth = 3.2
  t.beginPath(); t.moveTo(8, c); t.lineTo(103, c); t.stroke()
  // Bindings at both ends of the shaft.
  t.strokeStyle = CORE
  t.lineWidth = 3
  t.beginPath()
  t.moveTo(42, c - 3); t.lineTo(42, c + 3)
  t.moveTo(46, c - 3); t.lineTo(46, c + 3)
  t.moveTo(92, c - 3); t.lineTo(92, c + 3)
  t.stroke()
  // ── The broadhead: a leaf of white-hot steel with an emerald edge. ──
  const head = (): void => {
    t.beginPath()
    t.moveTo(125, c)
    t.quadraticCurveTo(111, c - 13, 96, c - 10)
    t.lineTo(101, c)
    t.lineTo(96, c + 10)
    t.quadraticCurveTo(111, c + 13, 125, c)
    t.closePath()
  }
  head()
  t.strokeStyle = INK
  t.lineWidth = 4.5
  t.stroke()
  const hg = t.createLinearGradient(96, 0, 125, 0)
  hg.addColorStop(0, CORE)
  hg.addColorStop(0.5, HOT)
  hg.addColorStop(1, '#ffffff')
  t.fillStyle = hg
  head()
  t.fill()
  // The spine catching the light.
  t.strokeStyle = 'rgba(255,255,255,0.95)'
  t.lineWidth = 1.6
  t.beginPath(); t.moveTo(102, c); t.lineTo(121, c); t.stroke()
}

/**
 * The piercing star: a long spike FORWARD (the way the arrow went — through),
 * a shorter one back at the shooter, short cross spikes and four thin
 * diagonals. Additive; rotate it to the flight's angle.
 */
/** The star's spikes, as one path: `grow` fattens them for the ink under-layer. */
const starPath = (t: CanvasRenderingContext2D, s: number, grow: number): void => {
  const c = s / 2
  const spike = (ang: number, len: number, wid: number): void => {
    const dx = Math.cos(ang)
    const dy = Math.sin(ang)
    const l = len * (1 + grow * 0.06)
    const w = wid * (1 + grow)
    t.moveTo(c + dx * l, c + dy * l)
    t.lineTo(c - dy * w, c + dx * w)
    t.lineTo(c - dx * w * 0.8, c - dy * w * 0.8)
    t.lineTo(c + dy * w, c - dx * w)
    t.closePath()
  }
  t.beginPath()
  spike(0, s * 0.47, s * 0.065)
  spike(Math.PI, s * 0.27, s * 0.055)
  spike(Math.PI / 2, s * 0.23, s * 0.05)
  spike(-Math.PI / 2, s * 0.23, s * 0.05)
  for (let k = 0; k < 4; k++) spike(Math.PI / 4 + (k * Math.PI) / 2, s * 0.14, s * 0.024)
}

const drawStar = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const g = t.createRadialGradient(c, c, 0, c, c, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.12, rgba(HOT, 1))
  g.addColorStop(0.3, rgba(WIND, 1))
  g.addColorStop(0.7, rgba(CORE, 0.8))
  g.addColorStop(1, rgba(CORE, 0))
  t.fillStyle = g
  starPath(t, s, 0)
  t.fill()
  const hot = t.createRadialGradient(c, c, 0, c, c, s * 0.14)
  hot.addColorStop(0, 'rgba(255,255,255,1)')
  hot.addColorStop(1, 'rgba(255,255,255,0)')
  t.fillStyle = hot
  t.fillRect(0, 0, s, s)
}

/**
 * The star's INK: the same spikes, fattened, in deep forest green. Laid under
 * the additive star in normal blend, so the star keeps its shape and its hue
 * even over a stone the renderer has just flashed white.
 */
const drawStarInk = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const g = t.createRadialGradient(c, c, 0, c, c, s / 2)
  g.addColorStop(0, rgba(INK, 0.9))
  g.addColorStop(0.7, rgba(DEEP, 0.75))
  g.addColorStop(1, rgba(DEEP, 0))
  t.fillStyle = g
  starPath(t, s, 0.9)
  t.fill()
}

/** A leaf / torn fletching: an inked almond with a pale midrib. Tumbles as confetti. */
const drawLeaf = (t: CanvasRenderingContext2D, s: number): void => {
  const leaf = (): void => {
    t.beginPath()
    t.moveTo(s * 0.1, s * 0.5)
    t.quadraticCurveTo(s * 0.45, s * 0.12, s * 0.92, s * 0.5)
    t.quadraticCurveTo(s * 0.45, s * 0.88, s * 0.1, s * 0.5)
    t.closePath()
  }
  leaf()
  t.strokeStyle = INK
  t.lineWidth = s * 0.1
  t.lineJoin = 'round'
  t.stroke()
  const g = t.createLinearGradient(0, 0, s, s)
  g.addColorStop(0, ACCENT)
  g.addColorStop(1, CORE)
  t.fillStyle = g
  leaf()
  t.fill()
  t.strokeStyle = 'rgba(255,255,255,0.7)'
  t.lineWidth = s * 0.05
  t.beginPath(); t.moveTo(s * 0.18, s * 0.5); t.lineTo(s * 0.82, s * 0.5); t.stroke()
}

/**
 * A wind wisp: a thin crescent of pale light, bright in the middle and gone at
 * both tips, bowed toward −y (so a blit rotated by `a + π/2` bows along `a`).
 */
const drawWisp = (t: CanvasRenderingContext2D, s: number): void => {
  const g = t.createLinearGradient(s * 0.1, 0, s * 0.9, 0)
  g.addColorStop(0, rgba(CORE, 0))
  g.addColorStop(0.5, rgba(CORE, 0.9))
  g.addColorStop(1, rgba(CORE, 0))
  t.strokeStyle = g
  t.lineCap = 'round'
  t.lineWidth = s * 0.08
  t.beginPath(); t.arc(s / 2, s * 0.8, s * 0.42, Math.PI * 1.2, Math.PI * 1.8); t.stroke()
  const w = t.createLinearGradient(s * 0.25, 0, s * 0.75, 0)
  w.addColorStop(0, rgba(WIND, 0))
  w.addColorStop(0.5, rgba(WIND, 0.9))
  w.addColorStop(1, rgba(WIND, 0))
  t.strokeStyle = w
  t.lineWidth = s * 0.028
  t.beginPath(); t.arc(s / 2, s * 0.8, s * 0.42, Math.PI * 1.32, Math.PI * 1.68); t.stroke()
}

// ─── Memoised getters (constant keys: nothing is built per frame) ───────────

type Spr = HTMLCanvasElement | null
let arrowS: Spr | undefined
let starS: Spr | undefined
let glowCoreS: Spr | undefined
let glowHotS: Spr | undefined
let glowWhiteS: Spr | undefined
let coreHotS: Spr | undefined
let ringCoreS: Spr | undefined
let ringHotS: Spr | undefined
let streakS: Spr | undefined
let streakGoldS: Spr | undefined
let glintS: Spr | undefined

export const arrowSpr = (): Spr => (arrowS !== undefined ? arrowS : (arrowS = bakeSprite(`archer|arrow|${CORE}`, 128, drawArrow)))
export const starSpr = (): Spr => (starS !== undefined ? starS : (starS = bakeSprite(`archer|star|${CORE}`, 128, drawStar)))
let starInkS: Spr | undefined
export const starInk = (): Spr => (starInkS !== undefined ? starInkS : (starInkS = bakeSprite(`archer|star-ink|${CORE}`, 128, drawStarInk)))
export const glowCore = (): Spr => (glowCoreS !== undefined ? glowCoreS : (glowCoreS = glowSprite(CORE, 96)))
export const glowHot = (): Spr => (glowHotS !== undefined ? glowHotS : (glowHotS = glowSprite(HOT, 96)))
export const glowWhite = (): Spr => (glowWhiteS !== undefined ? glowWhiteS : (glowWhiteS = glowSprite('#ffffff', 96)))
export const coreHot = (): Spr => (coreHotS !== undefined ? coreHotS : (coreHotS = coreSprite(CORE, 48)))
export const ringCore = (): Spr => (ringCoreS !== undefined ? ringCoreS : (ringCoreS = ringSprite(CORE, 96, 0.16)))
export const ringHot = (): Spr => (ringHotS !== undefined ? ringHotS : (ringHotS = ringSprite(HOT, 96, 0.1)))
export const streakHot = (): Spr => (streakS !== undefined ? streakS : (streakS = streakSprite(HOT, 96)))
export const streakGold = (): Spr => (streakGoldS !== undefined ? streakGoldS : (streakGoldS = streakSprite(GOLD, 96)))
export const glintHot = (): Spr => (glintS !== undefined ? glintS : (glintS = glintSprite(HOT, 48)))

// Particle shapes (registered with the pool once; `poolSprite` caches the id).
const makeLeaf = (): Spr => bakeSprite(`archer|leaf|${CORE}`, 32, drawLeaf)
const makeWisp = (): Spr => bakeSprite(`archer|wisp|${CORE}`, 64, drawWisp)
const makeMote = (): Spr => moteSprite(CORE)
const makeGoldGlint = (): Spr => glintSprite(GOLD, 48)
const LEAF_KEY = `archer|leaf|${CORE}`
const WISP_KEY = `archer|wisp|${CORE}`
const MOTE_KEY = `mote|${CORE}`
const GOLD_KEY = `glint|${GOLD}`
export const leafId = (): number => poolSprite(LEAF_KEY, makeLeaf)
export const wispId = (): number => poolSprite(WISP_KEY, makeWisp)
export const moteId = (): number => poolSprite(MOTE_KEY, makeMote)
export const goldGlintId = (): number => poolSprite(GOLD_KEY, makeGoldGlint)

/**
 * Draw the arrow band of the baked arrow with its TIP at (x, y), pointing
 * along `ang`, `len` px long, at `alpha`, in normal blend. One `drawImage`.
 */
export const blitArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, alpha: number): void => {
  if (alpha <= 0.01) return
  const spr = arrowSpr()
  ctx.save()
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.translate(x, y)
  ctx.rotate(ang)
  if (spr) {
    const h = len * (BAND_H / 128)
    // The tip sits ~3 px in from the bake's right edge.
    ctx.drawImage(spr, 0, BAND_Y, 128, BAND_H, -len * (125 / 128), -h / 2, len, h)
  } else {
    ctx.strokeStyle = HOT
    ctx.lineWidth = Math.max(1, len * 0.05)
    ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, 0); ctx.stroke()
  }
  ctx.restore()
}
