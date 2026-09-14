import { bakeSprite, coreSprite, glintSprite, glowSprite, mix, rgba, ringSprite, runeColor, streakSprite } from './kit'

/**
 * ─── Sword (`melee`) — its palette, its baked sprites, its crescent ─────────
 *
 * Private to `melee.ts`. Everything here is baked ONCE (constant keys, cached
 * in module slots, so the per-frame path never even builds a key string) or is
 * an allocation-free path painter.
 */

/** The rune's neon: the crimson the player learns the sword by. */
export const CORE = runeColor('melee')
/** White-hot steel with a blush of the crimson — the cutting edge, the flash. */
export const HOT = mix(CORE, '#ffffff', 0.8)
/** Dried-blood crimson for the deep end of the palette. */
export const DEEP = mix(CORE, '#000000', 0.5)
/** Cold steel: the glint, the slivers. */
export const STEEL = '#e4ecff'
/** A spark straight off a grindstone. */
export const SPARK = '#fff3e2'
/** Dust a shoved stone kicks up (the board's grey-brown, not the sword's colour). */
export const DUST = '#d8d0c4'
/** The dark of a skid mark on the tile. */
export const SCUFF = '#1a0c10'

// ─── Baked sprites (lazy, one slot each) ───────────────────────────────────

let slit: HTMLCanvasElement | null | undefined
let glowCore: HTMLCanvasElement | null | undefined
let glowHot: HTMLCanvasElement | null | undefined
let glowWhite: HTMLCanvasElement | null | undefined
let pin: HTMLCanvasElement | null | undefined
let glint: HTMLCanvasElement | null | undefined
let streakCore: HTMLCanvasElement | null | undefined

/**
 * THE sword's signature: the slash-cut line left across the target — a thin
 * lens of white-hot light in a crimson glow, pointed at both ends. Baked to
 * fill its whole square so it can be blitted at any aspect: long and hair-thin
 * the frame after the blow, thinner still as it closes.
 */
export const slitSprite = (): HTMLCanvasElement | null => {
  if (slit !== undefined) return slit
  slit = bakeSprite('melee.slit', 128, (t, s) => {
    const m = s / 2
    const across = t.createLinearGradient(0, 0, 0, s)
    across.addColorStop(0, rgba(CORE, 0))
    across.addColorStop(0.26, rgba(CORE, 0.22))
    across.addColorStop(0.43, rgba(CORE, 0.9))
    across.addColorStop(0.485, 'rgba(255,240,242,1)')
    across.addColorStop(0.5, 'rgba(255,255,255,1)')
    across.addColorStop(0.515, 'rgba(255,240,242,1)')
    across.addColorStop(0.57, rgba(CORE, 0.9))
    across.addColorStop(0.74, rgba(CORE, 0.22))
    across.addColorStop(1, rgba(CORE, 0))
    t.fillStyle = across
    t.beginPath()
    t.moveTo(0, m)
    t.quadraticCurveTo(m, -m, s, m)
    t.quadraticCurveTo(m, s + m, 0, m)
    t.closePath()
    t.fill()
    // Fade both tips so the cut dies INTO the air rather than stopping.
    const along = t.createLinearGradient(0, 0, s, 0)
    along.addColorStop(0, 'rgba(0,0,0,0)')
    along.addColorStop(0.16, 'rgba(0,0,0,1)')
    along.addColorStop(0.84, 'rgba(0,0,0,1)')
    along.addColorStop(1, 'rgba(0,0,0,0)')
    t.globalCompositeOperation = 'destination-in'
    t.fillStyle = along
    t.fillRect(0, 0, s, s)
  })
  return slit
}

export const glowCoreSprite = (): HTMLCanvasElement | null =>
  glowCore !== undefined ? glowCore : (glowCore = glowSprite(CORE, 96))
export const glowHotSprite = (): HTMLCanvasElement | null =>
  glowHot !== undefined ? glowHot : (glowHot = glowSprite(HOT, 96))
export const glowWhiteSprite = (): HTMLCanvasElement | null =>
  glowWhite !== undefined ? glowWhite : (glowWhite = glowSprite('#ffffff', 48))
/** A white-hot pin in a crimson halo: the blade's tip as it travels. */
export const pinSprite = (): HTMLCanvasElement | null =>
  pin !== undefined ? pin : (pin = coreSprite(CORE, 48))
/** The steel twinkle on the blade before the swing. */
export const glintSteelSprite = (): HTMLCanvasElement | null =>
  glint !== undefined ? glint : (glint = glintSprite(STEEL, 48))
export const streakCoreSprite = (): HTMLCanvasElement | null =>
  streakCore !== undefined ? streakCore : (streakCore = streakSprite(CORE, 96))
/** The Lv 2 blow's crimson shock ring (band at 0.78 of the radius, see `ringSprite`). */
export const ringCoreSprite = (): HTMLCanvasElement | null =>
  ring !== undefined ? ring : (ring = ringSprite(CORE, 96, 0.1))
let ring: HTMLCanvasElement | null | undefined

/** The pool key of the crimson ember (the stock `core|<colour>` pin, shared with anything else crimson). */
export const EMBER_KEY = `core|${CORE}`
export const emberSprite = (): HTMLCanvasElement | null => coreSprite(CORE, 48)

/** A thin sliver of steel for the pool: a long needle with one bright facet. */
export const sliverSprite = (): HTMLCanvasElement | null =>
  bakeSprite('melee.sliver', 32, (t, s) => {
    const m = s / 2
    t.fillStyle = '#9aa6bd'
    t.beginPath()
    t.moveTo(s * 0.04, m); t.lineTo(m, m - s * 0.085); t.lineTo(s * 0.96, m); t.lineTo(m, m + s * 0.085)
    t.closePath()
    t.fill()
    t.fillStyle = STEEL
    t.beginPath()
    t.moveTo(s * 0.04, m); t.lineTo(m, m - s * 0.085); t.lineTo(s * 0.96, m)
    t.closePath()
    t.fill()
    t.strokeStyle = 'rgba(255,255,255,0.95)'
    t.lineWidth = s * 0.03
    t.beginPath(); t.moveTo(s * 0.14, m - s * 0.01); t.lineTo(s * 0.86, m - s * 0.01); t.stroke()
  })

// ─── The crescent ──────────────────────────────────────────────────────────

/** Thickness across a band, 0 at both ends; `bias` > 1 pushes the belly toward the head. */
const profile = (u: number, bias: number): number => {
  const v = Math.pow(u, bias)
  const s = Math.sin(Math.PI * v)
  return s <= 0 ? 0 : Math.pow(s, 0.8)
}

/**
 * Fill a tapered arc band around (cx, cy) at radius `r`, from `a0` (its tail)
 * to `a1` (its head), in whatever fill / alpha / blend the caller has set.
 * Its thickness is `w` at the belly, laid `outK · w` outside the radius and
 * `inK · w` inside — a crescent is a band whose edge hugs the outside. Pure
 * path work: `segs` + 1 points each way, nothing allocated.
 */
export const fillBand = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, a0: number, a1: number,
  w: number, outK: number, inK: number, bias: number, segs: number
): void => {
  ctx.beginPath()
  for (let i = 0; i <= segs; i++) {
    const u = i / segs
    const a = a0 + (a1 - a0) * u
    const rr = r + w * profile(u, bias) * outK
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  for (let i = segs; i >= 0; i--) {
    const u = i / segs
    const a = a0 + (a1 - a0) * u
    const rr = r - w * profile(u, bias) * inK
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fill()
}
