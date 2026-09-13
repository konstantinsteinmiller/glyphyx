import { bakeSprite, coreSprite, glowSprite, poolSprite, rgba, ringSprite, runeColor } from './kit'

/**
 * ─── Mortar (`bombard`) — the palette and the baked pieces ──────────────────
 *
 * The shell, the muzzle flare, the fireball, the painterly smoke puffs (plain
 * and lit from below by the fire), the scorch ring and the pit, the shrapnel,
 * the shell's shadow. Every getter is memoised on a CONSTANT key, so the
 * frame path builds no key strings, closures or gradients.
 *
 * With no 2D context every bake is `null`; the module then draws plain
 * shapes or nothing.
 */

// ─── Palette ────────────────────────────────────────────────────────────────

/** Magenta fire — the mortar's neon. */
export const CORE = runeColor('bombard')
/** The white-hot heart of the blast, warm. */
export const HOT = '#fff0da'
/** Deep wine: the fire's dark edge. */
export const DEEP = '#6a1458'
/** Orange fire, the accent the magenta burns into. */
export const ACCENT = '#ff9a3c'
/** Smoke, with a cold violet cast so it sits in the magenta's family: the muzzle's ring… */
export const SMOKE = '#77707e'
/** …the pale corkscrew the round leaves (lit by its fuse)… */
export const SMOKE_TRAIL = '#a69cae'
/** …and the charcoal of the cloud. */
export const SMOKE_DARK = '#4a4053'
export const INK = '#170c16'

// ─── Bakes ──────────────────────────────────────────────────────────────────

/** The round: a dark iron ball, inked, a magenta rim light and one white glint. */
const drawShell = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const r = s * 0.34
  const body = t.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r)
  body.addColorStop(0, '#9b8fa3')
  body.addColorStop(0.45, '#40374a')
  body.addColorStop(1, '#17111c')
  t.fillStyle = body
  t.beginPath(); t.arc(c, c, r, 0, Math.PI * 2); t.fill()
  t.strokeStyle = INK
  t.lineWidth = s * 0.06
  t.stroke()
  // A cast seam round its middle — it is what makes the spin visible.
  t.strokeStyle = 'rgba(10,6,12,0.85)'
  t.lineWidth = s * 0.045
  t.beginPath(); t.ellipse(c, c, r * 0.95, r * 0.32, 0, 0, Math.PI * 2); t.stroke()
  // Rim light from the fuse's own fire.
  t.strokeStyle = rgba(CORE, 0.95)
  t.lineWidth = s * 0.05
  t.beginPath(); t.arc(c, c, r * 0.86, Math.PI * 0.05, Math.PI * 0.7); t.stroke()
  t.fillStyle = 'rgba(255,255,255,0.9)'
  t.beginPath(); t.arc(c - r * 0.38, c - r * 0.42, r * 0.16, 0, Math.PI * 2); t.fill()
}

/** The muzzle flare: a tongue of fire straight up out of the tube, and short spikes round it. Additive. */
const drawFlare = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const g = t.createRadialGradient(c, c * 1.15, 0, c, c * 1.15, s * 0.5)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, rgba(HOT, 1))
  g.addColorStop(0.4, rgba(ACCENT, 0.9))
  g.addColorStop(0.7, rgba(CORE, 0.7))
  g.addColorStop(1, rgba(CORE, 0))
  t.fillStyle = g
  // The tongue: a teardrop pointing up.
  t.beginPath()
  t.moveTo(c, s * 0.02)
  t.quadraticCurveTo(c + s * 0.2, c * 0.9, c + s * 0.16, c * 1.25)
  t.quadraticCurveTo(c, c * 1.55, c - s * 0.16, c * 1.25)
  t.quadraticCurveTo(c - s * 0.2, c * 0.9, c, s * 0.02)
  t.fill()
  // Side spikes, splayed up and out.
  for (let k = 0; k < 6; k++) {
    const a = -Math.PI / 2 + (k - 2.5) * 0.42
    const len = s * (k === 2 || k === 3 ? 0.3 : 0.4)
    const w = s * 0.035
    const bx = c
    const by = c * 1.18
    t.beginPath()
    t.moveTo(bx + Math.cos(a) * len, by + Math.sin(a) * len)
    t.lineTo(bx - Math.sin(a) * w, by + Math.cos(a) * w)
    t.lineTo(bx + Math.sin(a) * w, by - Math.cos(a) * w)
    t.closePath()
    t.fill()
  }
}

/** A billowing fireball: white heart, gold, orange, a magenta rim. Additive. */
const drawFireball = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const lump = (x: number, y: number, r: number, a: number): void => {
    const g = t.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, rgba(HOT, a))
    g.addColorStop(0.3, rgba('#ffc76b', a * 0.9))
    g.addColorStop(0.58, rgba(ACCENT, a * 0.7))
    g.addColorStop(0.82, rgba(CORE, a * 0.45))
    g.addColorStop(1, rgba(CORE, 0))
    t.fillStyle = g
    t.beginPath(); t.arc(x, y, r, 0, Math.PI * 2); t.fill()
  }
  t.globalCompositeOperation = 'lighter'
  lump(c, c, s * 0.47, 0.95)
  lump(c - s * 0.14, c - s * 0.08, s * 0.25, 0.6)
  lump(c + s * 0.15, c - s * 0.06, s * 0.23, 0.6)
  lump(c + s * 0.02, c + s * 0.14, s * 0.23, 0.5)
}

/** The puff's lumps: (dx, dy, r) as shares of the sprite. */
const LUMPS: readonly (readonly [number, number, number])[] = [
  [0, 0.07, 0.3], [-0.2, 0.1, 0.21], [0.21, 0.1, 0.2], [-0.11, -0.12, 0.22], [0.14, -0.11, 0.2], [0.01, -0.2, 0.16]
]

/**
 * A cel-painted puff, like the game's painted smoke: hard-edged lumps with an
 * INK rim round their union, a lighter lobe on each lump's upper left, a shade
 * across the lower right; `lit` burns the underside orange-magenta with the
 * fire beneath it. `ink` is the rim's alpha (a thin trail puff wants less).
 */
const drawPuff = (t: CanvasRenderingContext2D, s: number, base: string, light: string, lit: boolean, ink: number): void => {
  const c = s / 2
  const rim = s * 0.035
  if (ink > 0) {
    t.fillStyle = rgba(INK, ink)
    for (const [dx, dy, r] of LUMPS) { t.beginPath(); t.arc(c + dx * s, c + dy * s, r * s + rim, 0, Math.PI * 2); t.fill() }
  }
  t.fillStyle = base
  for (const [dx, dy, r] of LUMPS) { t.beginPath(); t.arc(c + dx * s, c + dy * s, r * s, 0, Math.PI * 2); t.fill() }
  t.globalCompositeOperation = 'source-atop'
  // Cel highlights: a lighter lobe up and left inside every lump.
  t.fillStyle = light
  for (const [dx, dy, r] of LUMPS) { t.beginPath(); t.arc(c + dx * s - r * s * 0.22, c + dy * s - r * s * 0.26, r * s * 0.68, 0, Math.PI * 2); t.fill() }
  // …and the body's shade across the lower right.
  const sh = t.createRadialGradient(c + s * 0.16, c + s * 0.22, 0, c + s * 0.16, c + s * 0.22, s * 0.4)
  sh.addColorStop(0, 'rgba(16,8,18,0.45)')
  sh.addColorStop(1, 'rgba(16,8,18,0)')
  t.fillStyle = sh
  t.fillRect(0, 0, s, s)
  if (lit) {
    // Only the underside catches the fire: warm at the very bottom, a magenta
    // bloom above it, grey smoke from the middle up.
    const u = t.createLinearGradient(0, s * 0.9, 0, s * 0.42)
    u.addColorStop(0, rgba('#ffb45a', 0.9))
    u.addColorStop(0.35, rgba(ACCENT, 0.62))
    u.addColorStop(0.7, rgba(CORE, 0.32))
    u.addColorStop(1, rgba(CORE, 0))
    t.fillStyle = u
    t.fillRect(0, 0, s, s)
  }
  t.globalCompositeOperation = 'source-over'
}

/** The scorch: a charred ring with cracks, its middle left CLEAR — whatever stands there stays visible. */
const drawScorch = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const g = t.createRadialGradient(c, c, 0, c, c, s / 2)
  g.addColorStop(0, 'rgba(20,10,18,0)')
  g.addColorStop(0.5, 'rgba(20,10,18,0)')
  g.addColorStop(0.7, 'rgba(26,14,22,0.62)')
  g.addColorStop(0.86, 'rgba(34,20,26,0.35)')
  g.addColorStop(1, 'rgba(34,20,26,0)')
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
  t.strokeStyle = 'rgba(18,8,14,0.85)'
  t.lineCap = 'round'
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + (k % 3) * 0.2
    const r0 = s * 0.3
    const r1 = s * (0.44 + (k % 2) * 0.05)
    t.lineWidth = s * 0.02
    t.beginPath()
    t.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0)
    const m = (r0 + r1) / 2
    t.lineTo(c + Math.cos(a + 0.12) * m, c + Math.sin(a + 0.12) * m)
    t.lineTo(c + Math.cos(a - 0.04) * r1, c + Math.sin(a - 0.04) * r1)
    t.stroke()
  }
}

/** The pit: a crater with a dark heart and a dirt lip — only for a tile left empty. */
const drawPit = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const g = t.createRadialGradient(c, c + s * 0.03, 0, c, c, s * 0.42)
  g.addColorStop(0, 'rgba(10,5,10,0.92)')
  g.addColorStop(0.55, 'rgba(30,18,24,0.8)')
  g.addColorStop(0.8, 'rgba(58,40,40,0.45)')
  g.addColorStop(1, 'rgba(58,40,40,0)')
  t.fillStyle = g
  t.beginPath(); t.ellipse(c, c, s * 0.42, s * 0.36, 0, 0, Math.PI * 2); t.fill()
  // The lip, lit from above.
  t.strokeStyle = 'rgba(150,120,110,0.45)'
  t.lineWidth = s * 0.03
  t.beginPath(); t.ellipse(c, c, s * 0.3, s * 0.25, 0, Math.PI * 1.05, Math.PI * 1.95); t.stroke()
}

/** Shrapnel: a jagged iron chip with one hot edge. */
const drawShrapnel = (t: CanvasRenderingContext2D, s: number): void => {
  t.fillStyle = '#2a2230'
  t.strokeStyle = INK
  t.lineWidth = s * 0.08
  t.beginPath()
  t.moveTo(s * 0.12, s * 0.4); t.lineTo(s * 0.55, s * 0.12); t.lineTo(s * 0.9, s * 0.45); t.lineTo(s * 0.62, s * 0.62)
  t.lineTo(s * 0.7, s * 0.9); t.lineTo(s * 0.3, s * 0.75); t.closePath()
  t.fill()
  t.stroke()
  t.strokeStyle = rgba(ACCENT, 1)
  t.lineWidth = s * 0.07
  t.beginPath(); t.moveTo(s * 0.18, s * 0.38); t.lineTo(s * 0.55, s * 0.16); t.stroke()
}

/** The artillery reticle: a ring, four ticks pointing in, a pip in the middle. Additive. */
const drawReticle = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const r = s * 0.38
  t.lineCap = 'round'
  // A soft magenta halo under a crisp line.
  t.strokeStyle = rgba(CORE, 0.35)
  t.lineWidth = s * 0.09
  t.beginPath(); t.arc(c, c, r, 0, Math.PI * 2); t.stroke()
  t.strokeStyle = rgba(CORE, 1)
  t.lineWidth = s * 0.035
  t.beginPath(); t.arc(c, c, r, 0, Math.PI * 2); t.stroke()
  t.strokeStyle = 'rgba(255,235,250,0.95)'
  t.lineWidth = s * 0.03
  t.beginPath()
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2
    t.moveTo(c + Math.cos(a) * r * 1.12, c + Math.sin(a) * r * 1.12)
    t.lineTo(c + Math.cos(a) * r * 0.62, c + Math.sin(a) * r * 0.62)
  }
  t.stroke()
  t.fillStyle = rgba(CORE, 1)
  t.beginPath(); t.arc(c, c, s * 0.035, 0, Math.PI * 2); t.fill()
}

/** A soft round shadow, blitted squashed under the shell. */
const drawShadow = (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  const g = t.createRadialGradient(c, c, 0, c, c, s / 2)
  g.addColorStop(0, 'rgba(8,4,10,0.85)')
  g.addColorStop(0.6, 'rgba(8,4,10,0.45)')
  g.addColorStop(1, 'rgba(8,4,10,0)')
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
}

/** The trail's smoke: pale, lavender-grey (lit by the fuse), a faint rim. */
const drawSmoke = (t: CanvasRenderingContext2D, s: number): void => drawPuff(t, s, SMOKE_TRAIL, '#ddd5e2', false, 0.45)
/** The cloud's cap: charcoal with a violet cast, cel-lit from above. */
const drawSmokeDark = (t: CanvasRenderingContext2D, s: number): void => drawPuff(t, s, SMOKE_DARK, '#8f8299', false, 0.9)
/** The cloud's stem and underside: the same smoke burning orange-magenta from below. */
const drawSmokeLit = (t: CanvasRenderingContext2D, s: number): void => drawPuff(t, s, SMOKE_DARK, '#8f8299', true, 0.9)

// ─── Memoised getters (constant keys) ───────────────────────────────────────

type Spr = HTMLCanvasElement | null
const memo = (key: string, px: number, draw: (t: CanvasRenderingContext2D, s: number) => void): (() => Spr) => {
  let v: Spr | undefined
  return () => (v !== undefined ? v : (v = bakeSprite(key, px, draw)))
}
const memoOf = (make: () => Spr): (() => Spr) => {
  let v: Spr | undefined
  return () => (v !== undefined ? v : (v = make()))
}

export const shellSpr = memo(`bombard|shell|${CORE}`, 64, drawShell)
export const flareSpr = memo(`bombard|flare|${CORE}`, 128, drawFlare)
export const fireSpr = memo(`bombard|fire|${CORE}`, 96, drawFireball)
export const smokeSpr = memo(`bombard|smoke|${SMOKE_TRAIL}`, 64, drawSmoke)
export const smokeDarkSpr = memo(`bombard|smoke-dark|${SMOKE_DARK}`, 96, drawSmokeDark)
export const smokeLitSpr = memo(`bombard|smoke-lit|${CORE}`, 96, drawSmokeLit)
export const scorchSpr = memo('bombard|scorch', 96, drawScorch)
export const pitSpr = memo('bombard|pit', 96, drawPit)
export const shadowSpr = memo('bombard|shadow', 64, drawShadow)
export const reticleSpr = memo(`bombard|reticle|${CORE}`, 96, drawReticle)
export const glowCore = memoOf(() => glowSprite(CORE, 96))
export const glowAccent = memoOf(() => glowSprite(ACCENT, 96))
export const glowWhite = memoOf(() => glowSprite('#ffffff', 96))
export const coreHot = memoOf(() => coreSprite(ACCENT, 48))
export const ringCore = memoOf(() => ringSprite(CORE, 96, 0.14))
export const ringAccent = memoOf(() => ringSprite(ACCENT, 192, 0.1))

// Particle shapes (registered once; `poolSprite` caches the id).
const makeShrapnel = (): Spr => bakeSprite('bombard|shrapnel', 24, drawShrapnel)
const makeEmberA = (): Spr => coreSprite(ACCENT, 48)
const makeEmberC = (): Spr => coreSprite(CORE, 48)
export const shrapnelId = (): number => poolSprite('bombard|shrapnel', makeShrapnel)
export const emberAccentId = (): number => poolSprite(`core|${ACCENT}`, makeEmberA)
export const emberCoreId = (): number => poolSprite(`core|${CORE}`, makeEmberC)
