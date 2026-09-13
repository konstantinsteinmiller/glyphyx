import { bakeSprite, bucketFor, glowSprite, mix, rgba, ringSprite } from './kit'

/**
 * ─── The shield's honeycomb dome ────────────────────────────────────────────
 *
 * The one shape the shield is learned by: a bubble of HEXAGONAL energy over a
 * stone, drawn in three cheap layers —
 *
 *   1. the BODY, a baked sprite: a Fresnel bubble (clear in the middle, bright
 *      at the rim) with the whole honeycomb lattice etched into it, curved as
 *      if wrapped round a sphere, and a specular highlight;
 *   2. the CELLS, the same lattice's hexagons filled one by one — only the ones
 *      a ripple, a hot spot, the raise sweep or a twinkle is lighting this
 *      frame. Their vertices are projected ONCE, here, at module load, so a
 *      lit cell is a six-point path with a cached fill and nothing else;
 *   3. the RIM, a ring sprite flashed when the barrier takes a blow.
 *
 * The lattice the cells light and the lattice baked into the body are one and
 * the same (`CELL_*` below), so a ripple runs exactly along the etched lines.
 *
 * Everything is total: no 2D context → the sprites are `null` and the painter
 * draws the cells alone (they are paths), never throws.
 */

const TAU = Math.PI * 2
const SQ3 = Math.sqrt(3)

// ─── The lattice ────────────────────────────────────────────────────────────
//
// Flat-top hexagons of circumradius `HEX_A` on the unit "surface" disc,
// projected onto the bubble as if the disc were wrapped over a hemisphere seen
// head-on: a point `rho` from the centre lands `sin(rho · THETA)` from it, so
// the cells crowd and flatten toward the rim the way tiles on a ball do.

const HEX_A = 0.178
const THETA = (Math.PI / 2) * 0.8
const P_NORM = 1 / Math.sin(THETA)
/** Cells whose centre is further out than this are only etched, never lit. */
const LIT_RHO = 0.95
/** A lit cell is the lattice hexagon shrunk toward its centre, so the etched seams show between tiles. */
const INSET = 0.8

const projX = (u: number, v: number): number => {
  const rho = Math.hypot(u, v)
  if (rho < 1e-9) return 0
  return (u / rho) * Math.sin(Math.min(1.08, rho) * THETA) * P_NORM
}
const projY = (u: number, v: number): number => {
  const rho = Math.hypot(u, v)
  if (rho < 1e-9) return 0
  return (v / rho) * Math.sin(Math.min(1.08, rho) * THETA) * P_NORM
}

interface Cell { u: number; v: number }
const cellsWithin = (rings: number): Cell[] => {
  const out: Cell[] = []
  for (let q = -rings; q <= rings; q++) {
    for (let r = -rings; r <= rings; r++) {
      const s = -q - r
      if (Math.abs(s) > rings) continue
      out.push({ u: HEX_A * 1.5 * q, v: HEX_A * SQ3 * (r + q / 2) })
    }
  }
  return out
}

const LIT = cellsWithin(3).filter((c) => Math.hypot(c.u, c.v) <= LIT_RHO)
/** How many cells can light. */
export const CELL_N = LIT.length
/** Each lit cell's projected centre on the unit bubble (x right, y down). */
export const CELL_X = new Float32Array(CELL_N)
export const CELL_Y = new Float32Array(CELL_N)
/** Six projected, inset vertices per cell: x0 y0 x1 y1 … */
const CELL_V = new Float32Array(CELL_N * 12)
/** 0 at the bubble's foot, 1 at its crown: the order the raise lights them in. */
const CELL_UP = new Float32Array(CELL_N)
/** A per-cell phase for the idle twinkle. */
const CELL_PH = new Float32Array(CELL_N)
/** Fresnel weight: cells toward the rim read brighter, as the rim does. */
const CELL_FR = new Float32Array(CELL_N)

for (let i = 0; i < CELL_N; i++) {
  const c = LIT[i]!
  CELL_X[i] = projX(c.u, c.v)
  CELL_Y[i] = projY(c.u, c.v)
  CELL_UP[i] = (1 - CELL_Y[i]!) / 2
  CELL_PH[i] = ((i * 0.618034) % 1) * TAU
  CELL_FR[i] = 0.72 + 0.4 * Math.hypot(c.u, c.v)
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU
    const u = c.u + Math.cos(a) * HEX_A * INSET
    const v = c.v + Math.sin(a) * HEX_A * INSET
    CELL_V[i * 12 + k * 2] = projX(u, v)
    CELL_V[i * 12 + k * 2 + 1] = projY(u, v)
  }
}

// ─── Palette ────────────────────────────────────────────────────────────────

export const SH_CORE = '#4aa8ff'
/** The renderer's own shield tint (`SHIELD_COLOR`): the lattice and the hot light. */
export const SH_HOT = '#7fd8ff'
export const SH_ICE = '#d9f6ff'
export const SH_CYAN = '#5ff2ff'
export const SH_DEEP = '#1d4e8f'

/** Cell fills from barely-lit blue to white-hot, picked by intensity — cached strings, never built per frame. */
const TINT: readonly string[] = [
  SH_CORE, mix(SH_CORE, SH_HOT, 0.5), SH_HOT, mix(SH_HOT, SH_ICE, 0.6), mix(SH_ICE, '#ffffff', 0.5)
]
const tintFor = (v: number): string => TINT[v < 0.25 ? 0 : v < 0.45 ? 1 : v < 0.65 ? 2 : v < 0.85 ? 3 : 4]!

// ─── Sprites ────────────────────────────────────────────────────────────────

const hexPath = (t: CanvasRenderingContext2D, x: number, y: number, r: number, flat = true): void => {
  t.beginPath()
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU + (flat ? 0 : Math.PI / 6)
    const px = x + Math.cos(a) * r
    const py = y + Math.sin(a) * r
    if (k === 0) t.moveTo(px, py); else t.lineTo(px, py)
  }
  t.closePath()
}

/** Every hexagon of `rings` rings, projected, as one path on the bubble of radius `r` at (c, c). */
const latticePath = (t: CanvasRenderingContext2D, c: number, r: number, rings: number, inset: number): void => {
  t.beginPath()
  for (const cell of cellsWithin(rings)) {
    if (Math.hypot(cell.u, cell.v) > 1.25) continue
    for (let k = 0; k <= 6; k++) {
      const a = ((k % 6) / 6) * TAU
      const u = cell.u + Math.cos(a) * HEX_A * inset
      const v = cell.v + Math.sin(a) * HEX_A * inset
      const px = c + projX(u, v) * r
      const py = c + projY(u, v) * r
      if (k === 0) t.moveTo(px, py); else t.lineTo(px, py)
    }
  }
}

/** Where the bubble's circle sits in its sprite (radius, as a share of the sprite). */
const BUBBLE_R = 0.44

/**
 * The dome body: a clear bubble, rim-lit, the honeycomb etched into it (faint
 * in the middle, strong at the rim), a specular crescent upper left and a soft
 * halo just outside. `hot` bakes the FLASH frame instead: every cell filled.
 */
export const bubbleSprite = (px: number, hot = false): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`shbubble|${hot ? 'hot' : 'cold'}|${b}`, b, (t, s) => {
    const c = s / 2
    const r = s * BUBBLE_R
    // 1 · the lattice, clipped to the bubble.
    t.save()
    t.beginPath(); t.arc(c, c, r * 0.99, 0, TAU); t.clip()
    if (hot) {
      t.fillStyle = rgba(SH_CORE, 0.3)
      latticePath(t, c, r, 4, INSET)
      t.fill()
    }
    t.strokeStyle = rgba(SH_ICE, 0.95)
    t.lineWidth = Math.max(1, s * (hot ? 0.014 : 0.01))
    t.lineJoin = 'round'
    latticePath(t, c, r, 4, 1)
    t.stroke()
    t.restore()
    // 2 · keep the lattice faint through the middle and strong at the rim.
    t.globalCompositeOperation = 'destination-in'
    const m = t.createRadialGradient(c, c, 0, c, c, r)
    m.addColorStop(0, `rgba(0,0,0,${hot ? 0.55 : 0.18})`)
    m.addColorStop(0.55, `rgba(0,0,0,${hot ? 0.7 : 0.34})`)
    m.addColorStop(0.9, 'rgba(0,0,0,0.95)')
    m.addColorStop(1, 'rgba(0,0,0,1)')
    t.fillStyle = m
    t.fillRect(0, 0, s, s)
    // 3 · the bubble body UNDER the lattice: Fresnel — clear centre, bright rim.
    t.globalCompositeOperation = 'destination-over'
    const g = t.createRadialGradient(c, c, 0, c, c, r * 1.12)
    g.addColorStop(0, rgba(SH_CORE, hot ? 0.22 : 0.04))
    g.addColorStop(0.5, rgba(SH_CORE, hot ? 0.28 : 0.08))
    g.addColorStop(0.74, rgba(SH_CORE, hot ? 0.4 : 0.22))
    g.addColorStop(0.86, rgba(SH_HOT, 0.72))
    g.addColorStop(0.9, rgba(SH_CORE, 0.3))
    g.addColorStop(1, rgba(SH_CORE, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
    // 4 · on top: the rim line and a specular crescent, upper left.
    t.globalCompositeOperation = 'source-over'
    t.strokeStyle = hot ? rgba(SH_ICE, 1) : 'rgba(235,250,255,0.75)'
    t.lineWidth = s * (hot ? 0.018 : 0.013)
    t.beginPath(); t.arc(c, c, r * 0.985, 0, TAU); t.stroke()
    t.strokeStyle = 'rgba(255,255,255,0.8)'
    t.lineCap = 'round'
    t.lineWidth = s * 0.022
    t.beginPath(); t.arc(c, c, r * 0.8, Math.PI * 1.08, Math.PI * 1.42); t.stroke()
    t.lineWidth = s * 0.012
    t.beginPath(); t.arc(c, c, r * 0.8, Math.PI * 1.48, Math.PI * 1.56); t.stroke()
  })
}

/**
 * The GLASS: the bubble's body as a translucent blue tint, drawn in normal
 * blending UNDER the glowing lattice. Additive light alone cannot make a bright
 * stone look blue — cyan added to a tan pebble is white — so the barrier tints
 * what it covers, and the lattice and rim glow on top of that.
 */
export const glassSprite = (px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`shglass|${b}`, b, (t, s) => {
    const c = s / 2
    const r = s * BUBBLE_R
    const g = t.createRadialGradient(c - r * 0.18, c - r * 0.22, r * 0.1, c, c, r)
    g.addColorStop(0, rgba('#3f8fe0', 0.2))
    g.addColorStop(0.6, rgba('#2f7ad6', 0.36))
    g.addColorStop(0.88, rgba('#2a6fc9', 0.62))
    g.addColorStop(0.97, rgba('#3d8ff0', 0.5))
    g.addColorStop(1, rgba('#3d8ff0', 0))
    t.fillStyle = g
    t.beginPath(); t.arc(c, c, r, 0, TAU); t.fill()
  })
}

/** A soft glowing hexagon outline (flat-top): ripples, the aura's floor sigil. */
export const hexRingSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`shhexring|${color}|${b}`, b, (t, s) => {
    const c = s / 2
    const r = s * 0.4
    t.lineJoin = 'round'
    const pass = (w: number, style: string): void => { t.strokeStyle = style; t.lineWidth = s * w; hexPath(t, c, c, r); t.stroke() }
    pass(0.1, rgba(color, 0.14))
    pass(0.055, rgba(color, 0.4))
    pass(0.026, rgba(SH_ICE, 0.95))
    pass(0.01, 'rgba(255,255,255,1)')
  })
}

/** The aura's floor sigil: a hexagon inside a hexagon, spokes, six bright nodes. */
export const sigilSprite = (px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`shsigil|${b}`, b, (t, s) => {
    const c = s / 2
    const r = s * 0.42
    const g = t.createRadialGradient(c, c, 0, c, c, r)
    g.addColorStop(0, rgba(SH_CORE, 0.34))
    g.addColorStop(0.7, rgba(SH_CORE, 0.12))
    g.addColorStop(1, rgba(SH_CORE, 0))
    t.fillStyle = g
    hexPath(t, c, c, r); t.fill()
    t.lineJoin = 'round'
    t.strokeStyle = rgba(SH_HOT, 0.5); t.lineWidth = s * 0.05; hexPath(t, c, c, r); t.stroke()
    t.strokeStyle = rgba(SH_ICE, 1); t.lineWidth = s * 0.018; hexPath(t, c, c, r); t.stroke()
    t.strokeStyle = rgba(SH_ICE, 0.7); t.lineWidth = s * 0.012; hexPath(t, c, c, r * 0.62, false); t.stroke()
    t.beginPath()
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU
      t.moveTo(c + Math.cos(a) * r * 0.62, c + Math.sin(a) * r * 0.62)
      t.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
    }
    t.strokeStyle = rgba(SH_HOT, 0.6); t.lineWidth = s * 0.01; t.stroke()
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU
      const nx = c + Math.cos(a) * r
      const ny = c + Math.sin(a) * r
      const n = t.createRadialGradient(nx, ny, 0, nx, ny, s * 0.05)
      n.addColorStop(0, 'rgba(255,255,255,1)')
      n.addColorStop(1, rgba(SH_HOT, 0))
      t.fillStyle = n
      t.fillRect(nx - s * 0.05, ny - s * 0.05, s * 0.1, s * 0.1)
    }
  })
}

/** A struck point on the barrier: six thin spikes (the shield's hex, as light) round a white core. */
export const flare6Sprite = (px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`shflare6|${b}`, b, (t, s) => {
    const c = s / 2
    const g = t.createRadialGradient(c, c, 0, c, c, s / 2)
    g.addColorStop(0, rgba(SH_HOT, 0.7))
    g.addColorStop(0.25, rgba(SH_CORE, 0.3))
    g.addColorStop(1, rgba(SH_CORE, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU - Math.PI / 2
      const len = s * (k % 2 === 0 ? 0.48 : 0.3)
      const w = s * 0.034
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      t.fillStyle = rgba(SH_ICE, 0.95)
      t.beginPath()
      t.moveTo(c + ca * len, c + sa * len)
      t.lineTo(c - sa * w, c + ca * w)
      t.lineTo(c - ca * len * 0.15, c - sa * len * 0.15)
      t.lineTo(c + sa * w, c - ca * w)
      t.closePath()
      t.fill()
    }
    const k = t.createRadialGradient(c, c, 0, c, c, s * 0.16)
    k.addColorStop(0, 'rgba(255,255,255,1)')
    k.addColorStop(0.5, 'rgba(255,255,255,0.8)')
    k.addColorStop(1, rgba(SH_HOT, 0))
    t.fillStyle = k
    t.fillRect(0, 0, s, s)
  })
}

/** A glassy shard of barrier: a broken wedge of a hex tile with bright edges. Three cuts. */
export const shardSprite = (i: number): HTMLCanvasElement | null =>
  bakeSprite(`shshard|${i % 3}`, 32, (t, s) => {
    const c = s / 2
    const cut = i % 3
    t.beginPath()
    if (cut === 0) { t.moveTo(c, c - s * 0.4); t.lineTo(c + s * 0.34, c + s * 0.2); t.lineTo(c - s * 0.3, c + s * 0.3) }
    else if (cut === 1) { t.moveTo(c - s * 0.36, c - s * 0.2); t.lineTo(c + s * 0.4, c - s * 0.26); t.lineTo(c + s * 0.12, c + s * 0.36); t.lineTo(c - s * 0.2, c + s * 0.22) }
    else { t.moveTo(c - s * 0.1, c - s * 0.42); t.lineTo(c + s * 0.3, c - s * 0.05); t.lineTo(c + s * 0.05, c + s * 0.4); t.lineTo(c - s * 0.32, c + s * 0.05) }
    t.closePath()
    t.fillStyle = rgba(SH_HOT, 0.55)
    t.fill()
    t.strokeStyle = 'rgba(255,255,255,0.95)'
    t.lineWidth = Math.max(1, s * 0.07)
    t.lineJoin = 'round'
    t.stroke()
  })

/** A tiny glowing hex, for motes that drift off the barrier. */
export const hexMoteSprite = (): HTMLCanvasElement | null =>
  bakeSprite('shhexmote', 32, (t, s) => {
    const c = s / 2
    const g = t.createRadialGradient(c, c, 0, c, c, c)
    g.addColorStop(0, rgba(SH_HOT, 0.55))
    g.addColorStop(1, rgba(SH_CORE, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
    t.fillStyle = rgba(SH_ICE, 0.95)
    hexPath(t, c, c, s * 0.2)
    t.fill()
    t.fillStyle = 'rgba(255,255,255,1)'
    hexPath(t, c, c, s * 0.09)
    t.fill()
  })

/** A soft bar of light, bright along its middle: the aura's links. Stretched to any length. */
export const threadSprite = (): HTMLCanvasElement | null =>
  bakeSprite('shthread', 32, (t, s) => {
    const g = t.createLinearGradient(0, 0, 0, s)
    g.addColorStop(0, rgba(SH_CORE, 0))
    g.addColorStop(0.3, rgba(SH_CORE, 0.35))
    g.addColorStop(0.46, rgba(SH_ICE, 0.95))
    g.addColorStop(0.5, 'rgba(255,255,255,1)')
    g.addColorStop(0.54, rgba(SH_ICE, 0.95))
    g.addColorStop(0.7, rgba(SH_CORE, 0.35))
    g.addColorStop(1, rgba(SH_CORE, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
    const e = t.createLinearGradient(0, 0, s, 0)
    e.addColorStop(0, 'rgba(0,0,0,1)')
    e.addColorStop(0.12, 'rgba(0,0,0,0)')
    e.addColorStop(0.88, 'rgba(0,0,0,0)')
    e.addColorStop(1, 'rgba(0,0,0,1)')
    t.globalCompositeOperation = 'destination-out'
    t.fillStyle = e
    t.fillRect(0, 0, s, s)
  })

// ─── Cached references (the per-frame path never builds a key) ─────────────

const bubbleCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined, undefined, undefined, undefined]
const slot = (px: number): number => (px <= 56 ? 0 : px <= 120 ? 1 : 2)
/** The dome body (or its flash frame) for a bubble `px` across. */
export const bubble = (px: number, hot: boolean): HTMLCanvasElement | null => {
  const i = slot(px) + (hot ? 3 : 0)
  let s = bubbleCache[i]
  if (s === undefined) { s = bubbleSprite(px, hot); bubbleCache[i] = s }
  return s
}

const glassCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined]
/** The dome's glass tint for a bubble `px` across. */
export const glass = (px: number): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = glassCache[i]
  if (s === undefined) { s = glassSprite(px); glassCache[i] = s }
  return s
}

const ringCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined]
/** The rim-flash ring, white-hot on ice blue. */
export const rimRing = (px: number): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = ringCache[i]
  if (s === undefined) { s = ringSprite(SH_HOT, px, 0.07); ringCache[i] = s }
  return s
}

const glowCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined]
/** A soft ice-blue glow. */
export const iceGlow = (px: number): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = glowCache[i]
  if (s === undefined) { s = glowSprite(SH_HOT, px); glowCache[i] = s }
  return s
}

const hexRingCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined]
export const hexRing = (px: number): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = hexRingCache[i]
  if (s === undefined) { s = hexRingSprite(SH_CORE, px); hexRingCache[i] = s }
  return s
}

const sigilCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined]
export const sigil = (px: number): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = sigilCache[i]
  if (s === undefined) { s = sigilSprite(px); sigilCache[i] = s }
  return s
}

const flareCache: Array<HTMLCanvasElement | null | undefined> = [undefined, undefined, undefined]
export const flare6 = (px: number): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = flareCache[i]
  if (s === undefined) { s = flare6Sprite(px); flareCache[i] = s }
  return s
}

let threadCache: HTMLCanvasElement | null | undefined
export const thread = (): HTMLCanvasElement | null => {
  if (threadCache === undefined) threadCache = threadSprite()
  return threadCache
}

// ─── The painter ────────────────────────────────────────────────────────────

/**
 * One dome's look for one frame. A single module-level instance is filled in
 * and handed to `paintDome`, so a frame builds no object.
 */
export interface DomeLook {
  /** The stone's centre. */
  x: number
  y: number
  size: number
  /** Overall scale (the raise's overshoot, the fade's shrink). */
  scale: number
  /** 0 → a flat disc on the ground, 1 → the full bubble; anchored at the foot. */
  rise: number
  /** Body alpha. */
  body: number
  /** The flash frame (every cell lit) laid over the body, 0…1. */
  flash: number
  /** Rim ring flash, 0…1. */
  rim: number
  /** The struck point, in unit-bubble coordinates (x right, y down), or NaN for none. */
  hx: number
  hy: number
  /** Ripple front, unit-bubble radii from the struck point (0 … 2.4). */
  wave: number
  /** Ripple strength 0…1. */
  waveA: number
  /** Hot spot round the struck point, 0…1. */
  heat: number
  /** Raise sweep, bottom → top (0 … 1.3), or < 0 for none. */
  sweep: number
  /** Idle twinkle 0…1 and its clock (ms). */
  twinkle: number
  clock: number
  /** A squash along `dentAng`: 1 = none, < 1 pressed in, > 1 bulged. */
  dent: number
  dentAng: number
  /** Overall strength of the lit cells (tier / mood). */
  cells: number
  /**
   * How far the barrier has spread from the struck point, unit-bubble radii
   * (≥ 2.2 = all of it). Below that the glass, body and rim are clipped to an
   * ellipse growing out of (hx, hy): the wall materialises where it was hit.
   */
  reveal: number
}

export const newDomeLook = (): DomeLook => ({
  x: 0, y: 0, size: 1, scale: 1, rise: 1, body: 0, flash: 0, rim: 0, hx: Number.NaN, hy: Number.NaN,
  wave: 0, waveA: 0, heat: 0, sweep: -1, twinkle: 0, clock: 0, dent: 1, dentAng: 0, cells: 1, reveal: 3
})

/** Bubble half-width / half-height, as a share of a tile. A touch taller than wide: an egg over a standing stone. */
export const DOME_RX = 0.5
export const DOME_RY = 0.53
/** The bubble's centre sits this far above the stone's (a share of a tile). */
export const DOME_LIFT = 0.05

/** Where a dome's centre is for a stone at `y` (CSS px). */
export const domeCy = (y: number, size: number): number => y - size * DOME_LIFT

/**
 * Paint one dome. `tier` 0 blits the baked body alone; 1 and 2 add the lit
 * cells. Leaves the context's state as it found it.
 */
export const paintDome = (ctx: CanvasRenderingContext2D, d: DomeLook, tier: 0 | 1 | 2): void => {
  if (d.scale <= 0.01 || (d.body <= 0.005 && d.flash <= 0.005 && d.rim <= 0.005 && d.waveA <= 0.005 && d.heat <= 0.005 && d.sweep < 0 && d.twinkle <= 0.005)) return
  const rx = d.size * DOME_RX * d.scale
  const ryFull = d.size * DOME_RY * d.scale
  const rise = d.rise < 0.02 ? 0.02 : d.rise
  const ry = ryFull * rise
  const foot = domeCy(d.y, d.size) + ryFull
  const cx = d.x
  const cy = foot - ry
  const bw = (rx / BUBBLE_R)
  const bh = (ry / BUBBLE_R)
  // Sprites are picked for the DEVICE size (a phone is ~2 px per CSS px), so the
  // lattice stays crisp instead of being a 96 px bake stretched over 200.
  const spx = bw * 2
  const dented = d.dent !== 1

  ctx.save()
  if (dented) {
    ctx.translate(cx, cy)
    ctx.rotate(d.dentAng)
    ctx.scale(d.dent, 1 + (1 - d.dent) * 0.35)
    ctx.rotate(-d.dentAng)
    ctx.translate(-cx, -cy)
  }
  // The spread from the struck point: everything below but the cells is clipped to it.
  const clipped = tier >= 1 && d.reveal < 2.2 && d.hx === d.hx
  if (clipped) {
    if (d.reveal <= 0.02) { ctx.restore(); return }
    ctx.beginPath()
    ctx.ellipse(cx + d.hx * rx, cy + d.hy * ry, d.reveal * rx, d.reveal * ry, 0, 0, TAU)
    ctx.clip()
  }

  // 0 · the glass tint, in normal blending, under everything else.
  if (d.body > 0.005) {
    const g = glass(spx)
    if (g) { ctx.globalAlpha = Math.min(1, d.body); ctx.drawImage(g, cx - bw / 2, cy - bh / 2, bw, bh) }
  }
  ctx.globalCompositeOperation = 'lighter'

  // 1 · body, and the flash frame over it.
  if (d.body > 0.005) {
    const spr = bubble(spx, false)
    if (spr) { ctx.globalAlpha = Math.min(1, d.body); ctx.drawImage(spr, cx - bw / 2, cy - bh / 2, bw, bh) }
    else {
      ctx.globalAlpha = Math.min(1, d.body) * 0.7
      ctx.strokeStyle = SH_HOT
      ctx.lineWidth = Math.max(1, d.size * 0.03)
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke()
    }
  }
  if (d.flash > 0.005) {
    const spr = bubble(spx, true)
    if (spr) { ctx.globalAlpha = Math.min(1, d.flash); ctx.drawImage(spr, cx - bw / 2, cy - bh / 2, bw, bh) }
  }

  // 2 · the lit cells.
  if (tier >= 1 && d.cells > 0.01) {
    const hasHit = d.hx === d.hx
    const band = 0.3
    for (let i = 0; i < CELL_N; i++) {
      const px = CELL_X[i]!
      const py = CELL_Y[i]!
      let v = 0
      if (hasHit && (d.waveA > 0.005 || d.heat > 0.005)) {
        const dist = Math.hypot(px - d.hx, py - d.hy)
        if (d.waveA > 0.005) {
          const w = 1 - Math.abs(dist - d.wave) / band
          if (w > 0) v = w * w * d.waveA
        }
        if (d.heat > 0.005 && dist < 0.55) {
          const f = 1 - dist / 0.55
          const h = f * f * d.heat
          if (h > v) v = h
        }
      }
      if (d.sweep >= 0) {
        const s = 1 - Math.abs(CELL_UP[i]! - d.sweep) / 0.28
        if (s > v) v = s
      }
      if (d.twinkle > 0.005) {
        const tw = Math.sin(d.clock * 0.0042 + CELL_PH[i]! * 3.1)
        const s = tw > 0.82 ? (tw - 0.82) / 0.18 * d.twinkle : 0
        if (s > v) v = s
      }
      v *= CELL_FR[i]! * d.cells
      if (v < 0.035) continue
      if (v > 1) v = 1
      ctx.globalAlpha = v * 0.8
      ctx.fillStyle = tintFor(v)
      const o = i * 12
      ctx.beginPath()
      ctx.moveTo(cx + CELL_V[o]! * rx, cy + CELL_V[o + 1]! * ry)
      for (let k = 2; k < 12; k += 2) ctx.lineTo(cx + CELL_V[o + k]! * rx, cy + CELL_V[o + k + 1]! * ry)
      ctx.closePath()
      ctx.fill()
    }
  }

  // 3 · the rim.
  if (d.rim > 0.005) {
    const spr = rimRing(spx)
    const w = (rx / 0.78) * 2
    const h = (ry / 0.78) * 2
    if (spr) { ctx.globalAlpha = Math.min(1, d.rim); ctx.drawImage(spr, cx - w / 2, cy - h / 2, w, h) }
  }
  ctx.restore()
}

/** The struck point on a bubble, in unit coordinates, for a blow travelling at `ang` (it lands on the near side). */
export const hitPointX = (ang: number): number => -Math.cos(ang) * 0.86
export const hitPointY = (ang: number): number => -Math.sin(ang) * 0.86

/** Draw a sprite squashed onto the ground plane (a floor marking): `w` across, `h` deep, turned `rot` in the plane. */
export const blitFloor = (
  ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, w: number, h: number, alpha: number, rot = 0
): boolean => {
  if (!spr || alpha <= 0.005) return false
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.translate(x, y)
  ctx.scale(1, h / w)
  if (rot !== 0) ctx.rotate(rot)
  ctx.drawImage(spr, -w / 2, -w / 2, w, w)
  ctx.restore()
  return true
}
