import { bakeSprite, rgba, runeColor } from './kit'

/**
 * ─── Crown (`crown`) — the baked pieces ─────────────────────────────────────
 *
 * The crown's light is REGAL: indigo (the rune's neon) for the aura and the
 * bloom, gold for the things that are made — the sigil, the chain, the star —
 * each inked in warm umber like the stones on the board. Every bake is one
 * fixed size under one key; `null` where there is no 2D context (tests).
 */

export const GOLD = '#ffd35a'
export const GOLD_HOT = '#fff2c0'
export const GOLD_DEEP = '#a8690f'
export const INK = '#2e1b05'
/** The rune's neon: the stones set in the sigil. */
const INDIGO = runeColor('crown')

/**
 * A sprite getter that bakes on its first call and hands back the same canvas
 * after that — so the per-frame path passes no closure and builds no key. A
 * canvas held here outlives a clear of `bakeSprite`'s cache harmlessly: it is a
 * finished bitmap that depends on nothing but its own constants.
 */
const memo = (key: string, px: number, draw: (t: CanvasRenderingContext2D, s: number) => void): (() => HTMLCanvasElement | null) => {
  let c: HTMLCanvasElement | null | undefined
  return () => (c !== undefined ? c : (c = bakeSprite(key, px, draw)))
}

/** The gold every made thing is cast in: pale at the top, deep at the foot. */
const goldRamp = (t: CanvasRenderingContext2D, y0: number, y1: number): CanvasGradient => {
  const g = t.createLinearGradient(0, y0, 0, y1)
  g.addColorStop(0, '#fff6c4')
  g.addColorStop(0.35, '#ffd24c')
  g.addColorStop(0.75, '#dd9a1f')
  g.addColorStop(1, GOLD_DEEP)
  return g
}

/**
 * The crown sigil: the rune's own silhouette — three peaks, the middle one
 * tallest, over a heavy band — cast in gold with orbs on the points, an
 * indigo stone set in the band and one in the tall peak.
 */
export const sigilSprite = memo('crown|sigil', 128, (t, s) => {
  const indigo = INDIGO
  const X = (v: number): number => v * s
  const body = (): void => {
    t.beginPath()
    t.moveTo(X(0.18), X(0.68))
    t.lineTo(X(0.09), X(0.3))
    t.lineTo(X(0.33), X(0.5))
    t.lineTo(X(0.5), X(0.15))
    t.lineTo(X(0.67), X(0.5))
    t.lineTo(X(0.91), X(0.3))
    t.lineTo(X(0.82), X(0.68))
    t.closePath()
  }
  const band = (): void => {
    t.beginPath()
    t.moveTo(X(0.13), X(0.63))
    t.quadraticCurveTo(X(0.5), X(0.7), X(0.87), X(0.63))
    t.lineTo(X(0.87), X(0.81))
    t.quadraticCurveTo(X(0.5), X(0.9), X(0.13), X(0.81))
    t.closePath()
  }
  t.lineJoin = 'round'
  t.lineCap = 'round'
  // The body.
  t.fillStyle = goldRamp(t, X(0.14), X(0.7))
  body(); t.fill()
  // A shade down the right of each peak, for form.
  t.fillStyle = 'rgba(140,80,10,0.35)'
  t.beginPath(); t.moveTo(X(0.5), X(0.15)); t.lineTo(X(0.67), X(0.5)); t.lineTo(X(0.6), X(0.66)); t.lineTo(X(0.52), X(0.66)); t.closePath(); t.fill()
  t.beginPath(); t.moveTo(X(0.91), X(0.3)); t.lineTo(X(0.82), X(0.68)); t.lineTo(X(0.76), X(0.66)); t.closePath(); t.fill()
  t.strokeStyle = INK
  t.lineWidth = X(0.035)
  body(); t.stroke()
  // The band, a touch deeper, with a lit upper lip.
  t.fillStyle = goldRamp(t, X(0.58), X(0.92))
  band(); t.fill()
  t.stroke()
  t.strokeStyle = 'rgba(255,250,220,0.8)'
  t.lineWidth = X(0.018)
  t.beginPath(); t.moveTo(X(0.18), X(0.67)); t.quadraticCurveTo(X(0.5), X(0.735), X(0.82), X(0.67)); t.stroke()
  // Highlights up the lit edges of the peaks.
  t.strokeStyle = 'rgba(255,255,235,0.85)'
  t.lineWidth = X(0.02)
  t.beginPath(); t.moveTo(X(0.17), X(0.62)); t.lineTo(X(0.12), X(0.36)); t.stroke()
  t.beginPath(); t.moveTo(X(0.42), X(0.46)); t.lineTo(X(0.5), X(0.24)); t.stroke()
  // Orbs on the points.
  const orb = (x: number, y: number, r: number): void => {
    t.fillStyle = '#ffe58a'
    t.beginPath(); t.arc(X(x), X(y), X(r), 0, Math.PI * 2); t.fill()
    t.strokeStyle = INK
    t.lineWidth = X(0.025)
    t.stroke()
    t.fillStyle = 'rgba(255,255,255,0.9)'
    t.beginPath(); t.arc(X(x - r * 0.35), X(y - r * 0.35), X(r * 0.35), 0, Math.PI * 2); t.fill()
  }
  orb(0.09, 0.28, 0.05)
  orb(0.5, 0.12, 0.058)
  orb(0.91, 0.28, 0.05)
  // Stones: an indigo lozenge in the band, a drop in the tall peak, two studs.
  const gem = (x: number, y: number, w: number, h: number): void => {
    t.fillStyle = indigo
    t.beginPath(); t.moveTo(X(x), X(y - h)); t.lineTo(X(x + w), X(y)); t.lineTo(X(x), X(y + h)); t.lineTo(X(x - w), X(y)); t.closePath(); t.fill()
    t.fillStyle = 'rgba(255,255,255,0.35)'
    t.beginPath(); t.moveTo(X(x), X(y - h)); t.lineTo(X(x - w), X(y)); t.lineTo(X(x), X(y)); t.closePath(); t.fill()
    t.strokeStyle = INK
    t.lineWidth = X(0.022)
    t.beginPath(); t.moveTo(X(x), X(y - h)); t.lineTo(X(x + w), X(y)); t.lineTo(X(x), X(y + h)); t.lineTo(X(x - w), X(y)); t.closePath(); t.stroke()
    t.fillStyle = 'rgba(255,255,255,0.95)'
    t.beginPath(); t.arc(X(x - w * 0.3), X(y - h * 0.35), X(0.012), 0, Math.PI * 2); t.fill()
  }
  gem(0.5, 0.765, 0.07, 0.075)
  gem(0.5, 0.42, 0.045, 0.07)
  gem(0.27, 0.755, 0.035, 0.04)
  gem(0.73, 0.755, 0.035, 0.04)
})

/** One chain link. `face` = seen flat (an oval ring); otherwise edge-on (a bar). Long axis along x. */
const linkDraw = (face: boolean) => (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  t.lineCap = 'round'
  if (face) {
    t.strokeStyle = INK
    t.lineWidth = s * 0.2
    t.beginPath(); t.ellipse(c, c, s * 0.34, s * 0.19, 0, 0, Math.PI * 2); t.stroke()
    t.strokeStyle = goldRamp(t, c - s * 0.25, c + s * 0.25)
    t.lineWidth = s * 0.11
    t.beginPath(); t.ellipse(c, c, s * 0.34, s * 0.19, 0, 0, Math.PI * 2); t.stroke()
    t.strokeStyle = 'rgba(255,255,240,0.9)'
    t.lineWidth = s * 0.04
    t.beginPath(); t.ellipse(c, c, s * 0.34, s * 0.19, 0, Math.PI * 1.1, Math.PI * 1.7); t.stroke()
  } else {
    t.strokeStyle = INK
    t.lineWidth = s * 0.24
    t.beginPath(); t.moveTo(s * 0.18, c); t.lineTo(s * 0.82, c); t.stroke()
    t.strokeStyle = '#e8a92c'
    t.lineWidth = s * 0.15
    t.beginPath(); t.moveTo(s * 0.18, c); t.lineTo(s * 0.82, c); t.stroke()
    t.strokeStyle = 'rgba(255,248,210,0.95)'
    t.lineWidth = s * 0.05
    t.beginPath(); t.moveTo(s * 0.22, c - s * 0.03); t.lineTo(s * 0.7, c - s * 0.03); t.stroke()
  }
}
const LINKS = [memo('crown|link|0', 32, linkDraw(false)), memo('crown|link|1', 32, linkDraw(true))]
export const linkSprite = (face: boolean): HTMLCanvasElement | null => LINKS[face ? 1 : 0]!()

/** A ring of fourteen links, alternating flat and edge-on: the shackle closed round a stone. */
export const shackleSprite = memo('crown|shackle', 160, (t, s) => {
  const fa = linkSprite(true)
  const ed = linkSprite(false)
  if (!fa || !ed) return
  const c = s / 2
  const n = 14
  const r = s * 0.4
  const L = (2 * Math.PI * r) / n
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    t.save()
    t.translate(c + Math.cos(a) * r, c + Math.sin(a) * r)
    t.rotate(a + Math.PI / 2)
    const w = L * 1.45
    t.drawImage(i % 2 === 0 ? fa : ed, -w / 2, -w / 2, w, w)
    t.restore()
  }
})

/**
 * The royal flare: an eight-pointed star — four long rays, four short — gold
 * running to white at the heart. Drawn additive over an indigo bloom.
 */
export const flareSprite = memo('crown|flare', 192, (t, s) => {
  const c = s / 2
  const long = t.createLinearGradient(0, 0, s * 0.49, 0)
  long.addColorStop(0, 'rgba(255,255,255,1)')
  long.addColorStop(0.25, rgba(GOLD_HOT, 0.95))
  long.addColorStop(0.7, rgba(GOLD, 0.5))
  long.addColorStop(1, rgba(GOLD, 0))
  const short = t.createLinearGradient(0, 0, s * 0.3, 0)
  short.addColorStop(0, 'rgba(255,255,255,0.95)')
  short.addColorStop(0.5, rgba(GOLD, 0.6))
  short.addColorStop(1, rgba(GOLD, 0))
  for (let i = 0; i < 8; i++) {
    const big = i % 2 === 0
    const L = s * (big ? 0.49 : 0.3)
    const W = s * (big ? 0.05 : 0.034)
    t.save()
    t.translate(c, c)
    t.rotate((i / 8) * Math.PI * 2)
    t.fillStyle = big ? long : short
    t.beginPath(); t.moveTo(-s * 0.02, 0); t.lineTo(0, -W); t.lineTo(L, 0); t.lineTo(0, W); t.closePath(); t.fill()
    t.restore()
  }
  const core = t.createRadialGradient(c, c, 0, c, c, s * 0.16)
  core.addColorStop(0, rgba(GOLD_HOT, 0.85))
  core.addColorStop(0.5, rgba(GOLD, 0.5))
  core.addColorStop(1, rgba(GOLD, 0))
  t.fillStyle = core
  t.fillRect(0, 0, s, s)
})

/** A five-pointed gold star with a white heart — the crown's spark (additive). */
export const starSprite = memo('crown|star', 32, (t, s) => {
  const c = s / 2
  t.fillStyle = GOLD
  t.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2
    const r = i % 2 === 0 ? s * 0.46 : s * 0.19
    if (i === 0) t.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
    else t.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
  }
  t.closePath()
  t.fill()
  const g = t.createRadialGradient(c, c, 0, c, c, s * 0.24)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
})
