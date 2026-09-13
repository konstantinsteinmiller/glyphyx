import { bakeSprite, coreSprite, glowSprite, hash01, mix, rgba, runeColor } from './kit'

/**
 * ─── Axe (`cleave`) — its palette, its baked sprites, its fan ───────────────
 *
 * Private to `cleave.ts`. Sprites are baked once under constant keys and kept
 * in module slots; the fan painter is pure path work.
 */

/** The rune's neon: molten orange. */
export const CORE = runeColor('cleave')
/** The white-gold of metal at forging heat — the edge, the slam. */
export const HOT = '#fff0c4'
/** Gold, for sparks and the rising heat. */
export const GOLD = '#ffc54a'
/** Ember red: what the arc cools to. */
export const EMBER = '#e0431a'
/** The deep of the palette. */
export const DEEP = mix(EMBER, '#000000', 0.45)
/** Soot over a scorched tile. */
export const SMOKE = '#4a3a31'
/** The burnt black of a fissure's lips. */
export const CHAR = '#150803'

// ─── The fan: a band laid along the arc of the swing ───────────────────────

/**
 * How far out the swing passes at `th` (radians off the facing), in tiles. A
 * circle about the axe passes the tile ahead at 1 but the two diagonals at
 * √2 — no circle crosses all three — so the arc is flattened toward the
 * rank: `1 / cos^0.55`. It still reads as one curved stroke round the axe,
 * and it crosses all three stones.
 */
export const fanRadius = (th: number): number => 1 / Math.pow(Math.max(0.3, Math.cos(th)), 0.55)

const profile = (u: number, bias: number): number => {
  const v = Math.pow(u, bias)
  const s = Math.sin(Math.PI * v)
  return s <= 0 ? 0 : Math.pow(s, 0.6)
}

/**
 * Fill a band along the fan from `th0` (its tail) to `th1` (its head), both
 * radians off `face`, around (ax, ay) with the fan scaled by `reach` px (+
 * `push` px further out). Thickness `w` at its belly, `outK · w` outside the
 * curve and `inK · w` inside. Nothing allocated.
 */
export const fillFan = (
  ctx: CanvasRenderingContext2D, ax: number, ay: number, face: number, reach: number, push: number,
  th0: number, th1: number, w: number, outK: number, inK: number, bias: number, segs: number
): void => {
  ctx.beginPath()
  for (let i = 0; i <= segs; i++) {
    const u = i / segs
    const th = th0 + (th1 - th0) * u
    const rr = reach * fanRadius(th) + push + w * profile(u, bias) * outK
    const x = ax + Math.cos(face + th) * rr
    const y = ay + Math.sin(face + th) * rr
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  for (let i = segs; i >= 0; i--) {
    const u = i / segs
    const th = th0 + (th1 - th0) * u
    const rr = reach * fanRadius(th) + push - w * profile(u, bias) * inK
    ctx.lineTo(ax + Math.cos(face + th) * rr, ay + Math.sin(face + th) * rr)
  }
  ctx.closePath()
  ctx.fill()
}

/**
 * The axe head itself: a short, thick, curved blade on a circle of radius `r`
 * about (cx, cy), centred on `a` and `half` radians to either side, bellied
 * outward. Used while it is raised and on its way round, before the band
 * takes over.
 */
export const fillBlade = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a: number, half: number, w: number
): void => {
  const segs = 8
  ctx.beginPath()
  for (let i = 0; i <= segs; i++) {
    const u = i / segs
    const th = a - half + 2 * half * u
    const rr = r + w * Math.sin(Math.PI * u) * 0.8
    const x = cx + Math.cos(th) * rr
    const y = cy + Math.sin(th) * rr
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  for (let i = segs; i >= 0; i--) {
    const u = i / segs
    const th = a - half + 2 * half * u
    const rr = r - w * Math.sin(Math.PI * u) * 0.25
    ctx.lineTo(cx + Math.cos(th) * rr, cy + Math.sin(th) * rr)
  }
  ctx.closePath()
  ctx.fill()
}

// ─── Baked sprites ─────────────────────────────────────────────────────────

let flame: HTMLCanvasElement | null | undefined
let glowCore: HTMLCanvasElement | null | undefined
let glowGold: HTMLCanvasElement | null | undefined
let glowHot: HTMLCanvasElement | null | undefined
let glowEmber: HTMLCanvasElement | null | undefined
let pin: HTMLCanvasElement | null | undefined
const fissureHot: (HTMLCanvasElement | null | undefined)[] = [undefined, undefined, undefined]
const fissureCool: (HTMLCanvasElement | null | undefined)[] = [undefined, undefined, undefined]
const fissureChar: (HTMLCanvasElement | null | undefined)[] = [undefined, undefined, undefined]

/** One lick of flame, base at the left, tip at the right: white-gold → orange → gone. */
export const flameSprite = (): HTMLCanvasElement | null => {
  if (flame !== undefined) return flame
  flame = bakeSprite('cleave.flame', 64, (t, s) => {
    const m = s / 2
    const g = t.createLinearGradient(0, 0, s, 0)
    g.addColorStop(0, rgba(HOT, 0.95))
    g.addColorStop(0.28, rgba(GOLD, 0.9))
    g.addColorStop(0.62, rgba(CORE, 0.6))
    g.addColorStop(1, rgba(EMBER, 0))
    t.fillStyle = g
    t.beginPath()
    t.moveTo(s * 0.06, m)
    t.bezierCurveTo(s * 0.04, s * 0.16, s * 0.46, s * 0.2, s * 0.98, m - s * 0.04)
    t.bezierCurveTo(s * 0.5, s * 0.66, s * 0.08, s * 0.84, s * 0.06, m)
    t.closePath()
    t.fill()
  })
  return flame
}

export const glowCoreSprite = (): HTMLCanvasElement | null =>
  glowCore !== undefined ? glowCore : (glowCore = glowSprite(CORE, 96))
export const glowGoldSprite = (): HTMLCanvasElement | null =>
  glowGold !== undefined ? glowGold : (glowGold = glowSprite(GOLD, 96))
export const glowHotSprite = (): HTMLCanvasElement | null =>
  glowHot !== undefined ? glowHot : (glowHot = glowSprite(HOT, 96))
export const glowEmberSprite = (): HTMLCanvasElement | null =>
  glowEmber !== undefined ? glowEmber : (glowEmber = glowSprite(EMBER, 96))
/** The axe head's white-hot point. */
export const pinSprite = (): HTMLCanvasElement | null =>
  pin !== undefined ? pin : (pin = coreSprite(GOLD, 48))

/** The pool keys of the ember sprites (stock `core|<colour>` pins). */
export const EMBER_KEY = 'core|' + CORE
export const emberSprite = (): HTMLCanvasElement | null => coreSprite(CORE, 48)
export const GOLD_KEY = 'core|' + GOLD
export const goldSprite = (): HTMLCanvasElement | null => coreSprite(GOLD, 48)

/**
 * The fissure network for variant `v`, blown along +x: seven cracks all round,
 * the forward ones longest, each jittered and branching once. They START at
 * the struck stone's foot (a ring ~0.28 tile out when blitted a tile and a bit
 * wide) and run out across the tile's margin into its corners — the ground
 * splits AROUND the stone, it is not the stone that cracks.
 */
const crackPath = (t: CanvasRenderingContext2D, s: number, v: number, widthAt: (k: number) => number): void => {
  const c = s / 2
  const arms = 7
  for (let i = 0; i < arms; i++) {
    let a = (i / arms) * Math.PI * 2 + (hash01(v * 97 + i * 13) - 0.5) * 0.55
    // Forward (+x) arms run long, the ones behind stay stubby.
    const fwd = 0.5 + 0.5 * Math.cos(a)
    let x = c + Math.cos(a) * s * 0.24
    let y = c + Math.sin(a) * s * 0.24
    const total = s * (0.1 + 0.16 * fwd + hash01(v * 7 + i * 3) * 0.06)
    const segs = 4
    for (let k = 0; k < segs; k++) {
      a += (hash01(v * 53 + i * 17 + k * 5) - 0.5) * 0.85
      const nx = x + Math.cos(a) * total / segs
      const ny = y + Math.sin(a) * total / segs
      t.lineWidth = widthAt(k / segs)
      t.beginPath(); t.moveTo(x, y); t.lineTo(nx, ny); t.stroke()
      if (k === 1 && fwd > 0.3) {
        const ba = a + (hash01(v * 11 + i * 7) > 0.5 ? 0.8 : -0.8)
        t.lineWidth = widthAt(0.7)
        t.beginPath(); t.moveTo(nx, ny); t.lineTo(nx + Math.cos(ba) * total * 0.36, ny + Math.sin(ba) * total * 0.36); t.stroke()
      }
      x = nx
      y = ny
    }
  }
}

const bakeFissure = (key: string, v: number, kind: 0 | 1 | 2): HTMLCanvasElement | null =>
  bakeSprite(key, 128, (t, s) => {
    t.lineCap = 'round'
    t.lineJoin = 'round'
    if (kind === 0) {
      // Molten: a wide glow, then the white-gold seam.
      t.strokeStyle = rgba(CORE, 0.5)
      crackPath(t, s, v, (k) => s * 0.05 * (1 - k * 0.6))
      t.strokeStyle = rgba(HOT, 0.95)
      crackPath(t, s, v, (k) => s * 0.017 * (1 - k * 0.6))
    } else if (kind === 1) {
      // Cooling: the same seam gone to a dull ember red.
      t.strokeStyle = rgba(EMBER, 0.85)
      crackPath(t, s, v, (k) => s * 0.026 * (1 - k * 0.6))
    } else {
      // The burnt lips of the split, laid UNDER the light.
      t.strokeStyle = rgba(CHAR, 0.85)
      crackPath(t, s, v, (k) => s * 0.042 * (1 - k * 0.55))
    }
  })

const FISSURE_KEYS = [
  ['cleave.fis.hot.0', 'cleave.fis.hot.1', 'cleave.fis.hot.2'],
  ['cleave.fis.cool.0', 'cleave.fis.cool.1', 'cleave.fis.cool.2'],
  ['cleave.fis.char.0', 'cleave.fis.char.1', 'cleave.fis.char.2']
] as const

export const fissureHotSprite = (v: number): HTMLCanvasElement | null => {
  const i = v % 3
  const hit = fissureHot[i]
  return hit !== undefined ? hit : (fissureHot[i] = bakeFissure(FISSURE_KEYS[0][i]!, i, 0))
}
export const fissureCoolSprite = (v: number): HTMLCanvasElement | null => {
  const i = v % 3
  const hit = fissureCool[i]
  return hit !== undefined ? hit : (fissureCool[i] = bakeFissure(FISSURE_KEYS[1][i]!, i, 1))
}
export const fissureCharSprite = (v: number): HTMLCanvasElement | null => {
  const i = v % 3
  const hit = fissureChar[i]
  return hit !== undefined ? hit : (fissureChar[i] = bakeFissure(FISSURE_KEYS[2][i]!, i, 2))
}

/** A chip of the struck stone with a burning rim — keyed by the stone, so only a handful ever exist. */
export const hotChipSprite = (stone: string): HTMLCanvasElement | null =>
  bakeSprite(`cleave.chip|${stone}`, 24, (t, s) => {
    t.beginPath()
    t.moveTo(s * 0.2, s * 0.3); t.lineTo(s * 0.75, s * 0.15); t.lineTo(s * 0.85, s * 0.65); t.lineTo(s * 0.4, s * 0.88)
    t.closePath()
    t.fillStyle = stone
    t.fill()
    t.strokeStyle = rgba(CORE, 0.95)
    t.lineWidth = s * 0.1
    t.lineJoin = 'round'
    t.stroke()
    t.fillStyle = rgba(HOT, 0.9)
    t.beginPath(); t.arc(s * 0.72, s * 0.3, s * 0.08, 0, Math.PI * 2); t.fill()
  })
