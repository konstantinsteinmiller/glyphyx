import { bakeSprite, bucketFor, glintSprite, glowSprite, mix, moteSprite, rgba, ringSprite } from './kit'

/**
 * ─── The cross's light ──────────────────────────────────────────────────────
 *
 * Warm holy light, RISING: a sacred circle on the floor, a column of light
 * lifting out of it, plus-shaped sparkles, a green pulse sinking INTO the
 * stone it mends (the reverse of a blow, which flies out of one), and for the
 * buff an upward golden surge of chevrons. Every shape here is either a plus
 * or points up — the cross's silhouette — and nothing is a hexagon (that is
 * the shield's) or a ring flung outward on impact (that is a blow's).
 *
 * All sprites are baked once per size bucket and held in slots here, so the
 * per-frame path never builds a cache key.
 */

const TAU = Math.PI * 2

export const CX_GOLD = '#ffd23f'
export const CX_HOT = '#fff4c2'
export const CX_DEEP = '#a8740e'
export const CX_AMBER = '#ffb347'
export const CX_HEAL = '#5cff9a'
export const CX_HEAL_HOT = '#d8ffe6'

/** A rounded plus, `arm` long and `w` thick, centred at (c, c). */
const plusPath = (t: CanvasRenderingContext2D, c: number, arm: number, w: number): void => {
  const h = w / 2
  t.beginPath()
  t.moveTo(c - h, c - arm)
  t.lineTo(c + h, c - arm)
  t.lineTo(c + h, c - h)
  t.lineTo(c + arm, c - h)
  t.lineTo(c + arm, c + h)
  t.lineTo(c + h, c + h)
  t.lineTo(c + h, c + arm)
  t.lineTo(c - h, c + arm)
  t.lineTo(c - h, c + h)
  t.lineTo(c - arm, c + h)
  t.lineTo(c - arm, c - h)
  t.lineTo(c - h, c - h)
  t.closePath()
}

/** A plus-shaped sparkle: a glowing Greek cross with a white-hot heart. For particles. */
export const plusSprite = (color: string): HTMLCanvasElement | null =>
  bakeSprite(`cxplus|${color}`, 48, (t, s) => {
    const c = s / 2
    const g = t.createRadialGradient(c, c, 0, c, c, c)
    g.addColorStop(0, rgba(color, 0.55))
    g.addColorStop(0.45, rgba(color, 0.18))
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
    t.lineJoin = 'round'
    t.fillStyle = rgba(color, 0.95)
    plusPath(t, c, s * 0.34, s * 0.16)
    t.fill()
    t.fillStyle = mix(color, '#ffffff', 0.75)
    plusPath(t, c, s * 0.24, s * 0.075)
    t.fill()
    const k = t.createRadialGradient(c, c, 0, c, c, s * 0.12)
    k.addColorStop(0, 'rgba(255,255,255,1)')
    k.addColorStop(1, 'rgba(255,255,255,0)')
    t.fillStyle = k
    t.fillRect(0, 0, s, s)
  })

/**
 * The holy flare: a plus of light with long thin rays on its four arms — the
 * heal's pulse. Upright, always: the cross's silhouette, drawn in light.
 */
export const flareSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`cxflare|${color}|${b}`, b, (t, s) => {
    const c = s / 2
    const g = t.createRadialGradient(c, c, 0, c, c, c)
    g.addColorStop(0, rgba(color, 0.42))
    g.addColorStop(0.3, rgba(color, 0.14))
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
    // The rays: thin diamonds along the four arms, the vertical one longest.
    const ray = (dx: number, dy: number, len: number, w: number, style: string): void => {
      t.fillStyle = style
      t.beginPath()
      t.moveTo(c + dx * len, c + dy * len)
      t.lineTo(c - dy * w, c + dx * w)
      t.lineTo(c - dx * len, c - dy * len)
      t.lineTo(c + dy * w, c - dx * w)
      t.closePath()
      t.fill()
    }
    ray(0, 1, s * 0.49, s * 0.045, rgba(color, 0.75))
    ray(1, 0, s * 0.4, s * 0.04, rgba(color, 0.7))
    ray(0, 1, s * 0.36, s * 0.02, rgba('#ffffff', 0.9))
    ray(1, 0, s * 0.3, s * 0.018, rgba('#ffffff', 0.85))
    // The plus body — slim, so the stone under it still reads through the light.
    t.fillStyle = rgba(color, 0.7)
    plusPath(t, c, s * 0.16, s * 0.07)
    t.fill()
    t.fillStyle = 'rgba(255,255,255,0.85)'
    plusPath(t, c, s * 0.11, s * 0.03)
    t.fill()
  })
}

/**
 * The sacred circle under the healed stone: a double ring, a band of ticks,
 * four small crosses at the compass points, a soft pool of light inside. Drawn
 * squashed onto the floor.
 */
export const haloSprite = (px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`cxhalo|${b}`, b, (t, s) => {
    const c = s / 2
    const r = s * 0.44
    const pool = t.createRadialGradient(c, c, 0, c, c, r)
    pool.addColorStop(0, rgba(CX_HOT, 0.5))
    pool.addColorStop(0.55, rgba(CX_GOLD, 0.22))
    pool.addColorStop(1, rgba(CX_GOLD, 0))
    t.fillStyle = pool
    t.fillRect(0, 0, s, s)
    t.strokeStyle = rgba(CX_AMBER, 0.4)
    t.lineWidth = s * 0.07
    t.beginPath(); t.arc(c, c, r, 0, TAU); t.stroke()
    t.strokeStyle = rgba(CX_GOLD, 1)
    t.lineWidth = s * 0.026
    t.beginPath(); t.arc(c, c, r, 0, TAU); t.stroke()
    t.strokeStyle = rgba(CX_HOT, 0.9)
    t.lineWidth = s * 0.009
    t.beginPath(); t.arc(c, c, r, 0, TAU); t.stroke()
    t.strokeStyle = rgba(CX_GOLD, 0.9)
    t.lineWidth = s * 0.01
    t.beginPath(); t.arc(c, c, r * 0.8, 0, TAU); t.stroke()
    // The tick band between the rings.
    t.strokeStyle = rgba(CX_HOT, 0.75)
    t.lineWidth = s * 0.008
    t.beginPath()
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * TAU
      t.moveTo(c + Math.cos(a) * r * 0.84, c + Math.sin(a) * r * 0.84)
      t.lineTo(c + Math.cos(a) * r * (k % 2 === 0 ? 0.95 : 0.9), c + Math.sin(a) * r * (k % 2 === 0 ? 0.95 : 0.9))
    }
    t.stroke()
    // Four little crosses on the ring.
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU
      const x = c + Math.cos(a) * r
      const y = c + Math.sin(a) * r
      t.save()
      t.translate(x - c, y - c)
      t.fillStyle = rgba(CX_HOT, 1)
      plusPath(t, c, s * 0.045, s * 0.02)
      t.fill()
      t.restore()
    }
  })
}

/**
 * A column of light rising out of the floor, soft at its sides. It is DIM
 * where it passes the stone (its lower half) and brightest above the stone's
 * head, so the light climbs into the air instead of washing out the stone it
 * blesses — additive gold over a tan pebble is white.
 */
export const columnSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`cxcol2|${color}|${b}`, b, (t, s) => {
    const across = t.createLinearGradient(0, 0, s, 0)
    across.addColorStop(0, rgba(color, 0))
    across.addColorStop(0.25, rgba(color, 0.25))
    across.addColorStop(0.44, rgba(color, 0.8))
    across.addColorStop(0.5, 'rgba(255,255,255,0.95)')
    across.addColorStop(0.56, rgba(color, 0.8))
    across.addColorStop(0.75, rgba(color, 0.25))
    across.addColorStop(1, rgba(color, 0))
    t.fillStyle = across
    t.fillRect(0, 0, s, s)
    const up = t.createLinearGradient(0, 0, 0, s)
    up.addColorStop(0, 'rgba(0,0,0,0)')
    up.addColorStop(0.14, 'rgba(0,0,0,0.55)')
    up.addColorStop(0.36, 'rgba(0,0,0,1)')
    up.addColorStop(0.58, 'rgba(0,0,0,0.5)')
    up.addColorStop(0.8, 'rgba(0,0,0,0.16)')
    up.addColorStop(0.94, 'rgba(0,0,0,0.3)')
    up.addColorStop(1, 'rgba(0,0,0,0)')
    t.globalCompositeOperation = 'destination-in'
    t.fillStyle = up
    t.fillRect(0, 0, s, s)
  })
}

/** An upward chevron of light — the buff's surge. */
export const chevronSprite = (px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`cxchev|${b}`, b, (t, s) => {
    t.lineCap = 'round'
    t.lineJoin = 'round'
    const path = (): void => {
      t.beginPath()
      t.moveTo(s * 0.16, s * 0.68)
      t.lineTo(s * 0.5, s * 0.34)
      t.lineTo(s * 0.84, s * 0.68)
    }
    t.strokeStyle = rgba(CX_AMBER, 0.28); t.lineWidth = s * 0.2; path(); t.stroke()
    t.strokeStyle = rgba(CX_GOLD, 0.95); t.lineWidth = s * 0.1; path(); t.stroke()
    t.strokeStyle = 'rgba(255,250,225,1)'; t.lineWidth = s * 0.04; path(); t.stroke()
  })
}

// ─── Held references ────────────────────────────────────────────────────────

const slot = (px: number): number => (px <= 56 ? 0 : px <= 120 ? 1 : 2)
type Slots = Array<HTMLCanvasElement | null | undefined>
const held = (cache: Slots, px: number, make: (px: number) => HTMLCanvasElement | null): HTMLCanvasElement | null => {
  const i = slot(px)
  let s = cache[i]
  if (s === undefined) { s = make(px); cache[i] = s }
  return s
}

const haloC: Slots = [undefined, undefined, undefined]
const colGoldC: Slots = [undefined, undefined, undefined]
const colHealC: Slots = [undefined, undefined, undefined]
const flareHealC: Slots = [undefined, undefined, undefined]
const flareGoldC: Slots = [undefined, undefined, undefined]
const chevC: Slots = [undefined, undefined, undefined]
const glowGoldC: Slots = [undefined, undefined, undefined]
const glowHealC: Slots = [undefined, undefined, undefined]
const ringHealC: Slots = [undefined, undefined, undefined]
const ringGoldC: Slots = [undefined, undefined, undefined]
const glintC: Slots = [undefined, undefined, undefined]

// Makers hoisted: these getters run every frame, and a lambda per call is an allocation per call.
type Make = (px: number) => HTMLCanvasElement | null
const mkColGold: Make = (p) => columnSprite(CX_GOLD, p)
const mkColHeal: Make = (p) => columnSprite(CX_HEAL, p)
const mkFlareHeal: Make = (p) => flareSprite(CX_HEAL, p)
const mkFlareGold: Make = (p) => flareSprite(CX_GOLD, p)
const mkGlowGold: Make = (p) => glowSprite(CX_GOLD, p)
const mkGlowHeal: Make = (p) => glowSprite(CX_HEAL, p)
const mkRingHeal: Make = (p) => ringSprite(CX_HEAL, p, 0.12)
const mkRingGold: Make = (p) => ringSprite(CX_GOLD, p, 0.1)
const mkGlint: Make = (p) => glintSprite(CX_HOT, p)

export const halo = (px: number): HTMLCanvasElement | null => held(haloC, px, haloSprite)
export const columnGold = (px: number): HTMLCanvasElement | null => held(colGoldC, px, mkColGold)
export const columnHeal = (px: number): HTMLCanvasElement | null => held(colHealC, px, mkColHeal)
export const flareHeal = (px: number): HTMLCanvasElement | null => held(flareHealC, px, mkFlareHeal)
export const flareGold = (px: number): HTMLCanvasElement | null => held(flareGoldC, px, mkFlareGold)
export const chevron = (px: number): HTMLCanvasElement | null => held(chevC, px, chevronSprite)
export const glowGold = (px: number): HTMLCanvasElement | null => held(glowGoldC, px, mkGlowGold)
export const glowHeal = (px: number): HTMLCanvasElement | null => held(glowHealC, px, mkGlowHeal)
export const ringHeal = (px: number): HTMLCanvasElement | null => held(ringHealC, px, mkRingHeal)
export const ringGold = (px: number): HTMLCanvasElement | null => held(ringGoldC, px, mkRingGold)
export const glint = (px: number): HTMLCanvasElement | null => held(glintC, px, mkGlint)

export { moteSprite }
