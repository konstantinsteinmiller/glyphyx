import { bakeSprite, hash01, mix, rgba } from './kit'

/**
 * ─── Boulder (`roller`) — the baked pieces ──────────────────────────────────
 *
 * Everything the boulder is drawn from, baked ONCE per key (never per size:
 * the rock is one fixed 160 px bake blitted at whatever the tile is, and the
 * small pieces are 32–64 px). All of it is gouache-and-ink like the stones on
 * the board: warm grey rock, umber ink, and the rune's teal only where there
 * is crystal in the rock or light coming out of a crack.
 *
 * The rock is drawn in three layers so it can ROLL in a top-down view without
 * its lighting turning with it:
 *
 *   body     the silhouette and the stone colour, lit from the upper left;
 *   features crystals, cracks and pits on the sphere's surface, moved across
 *            the disc by the roll (see `roller.ts` → `paintRock`);
 *   shade    the terminator, the teal bounce light and the ink contour, drawn
 *            OVER the features so they darken as they turn away.
 *
 * Every bake is `null` where there is no 2D context (tests); the module then
 * draws nothing, which is the contract.
 */

// ─── The palette ────────────────────────────────────────────────────────────

export const TEAL = '#00d4c8'
export const TEAL_HOT = '#9ffff6'
export const TEAL_DEEP = '#00524d'
export const INK = '#1e160f'
/** Dust off a stone floor: pale, a little warm, never the teal (and never mud — it is tinted by multiply). */
export const DUST = '#dcd3c4'
export const DUST_DARK = '#b3a998'
/** Three tones of the rock, light → dark. */
export const ROCK: readonly string[] = ['#a39683', '#7c705f', '#5b5045']

const BODY_PX = 160

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

// ─── Shared silhouette ──────────────────────────────────────────────────────

/** A lumpy closed outline around (cx, cy): `n` vertices, radius jittered by `jit`, smoothed through midpoints. */
const rockOutline = (t: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number, n: number, jit: number): void => {
  const xs: number[] = []
  const ys: number[] = []
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + (hash01(seed + k * 7) - 0.5) * (1.1 / n) * Math.PI
    const rr = r * (1 - jit + 2 * jit * hash01(seed + k * 13 + 3))
    xs.push(cx + Math.cos(a) * rr)
    ys.push(cy + Math.sin(a) * rr)
  }
  t.beginPath()
  t.moveTo((xs[n - 1]! + xs[0]!) / 2, (ys[n - 1]! + ys[0]!) / 2)
  for (let k = 0; k < n; k++) {
    const k1 = (k + 1) % n
    t.quadraticCurveTo(xs[k]!, ys[k]!, (xs[k]! + xs[k1]!) / 2, (ys[k]! + ys[k1]!) / 2)
  }
  t.closePath()
}

const BODY_SEED = 41
const bodyOutline = (t: CanvasRenderingContext2D, s: number): void =>
  rockOutline(t, s / 2, s / 2, s * 0.44, BODY_SEED, 11, 0.04)

// ─── The rock ───────────────────────────────────────────────────────────────

/** The rock's body: stone colour, soft mottling, lit from the upper left. No contour — `rockShade` carries it. */
export const rockBody = memo('roller|body', BODY_PX, (t, s) => {
  const c = s / 2
  const r = s * 0.44
  bodyOutline(t, s)
  const g = t.createRadialGradient(c - r * 0.35, c - r * 0.42, r * 0.08, c, c, r * 1.05)
  g.addColorStop(0, '#b3a58e')
  g.addColorStop(0.45, ROCK[1]!)
  g.addColorStop(1, '#463c32')
  t.fillStyle = g
  t.fill()
  t.save()
  t.clip()
  // Mottling: low-contrast washes, so they read as the stone's colour rather
  // than as surface detail (the surface detail is what rolls).
  for (let i = 0; i < 16; i++) {
    const x = c + (hash01(i * 31 + 5) - 0.5) * r * 1.7
    const y = c + (hash01(i * 37 + 9) - 0.5) * r * 1.7
    const rr = r * (0.12 + hash01(i * 11 + 2) * 0.22)
    t.fillStyle = i % 2 === 0 ? 'rgba(52,42,33,0.16)' : 'rgba(196,184,160,0.12)'
    t.beginPath(); t.ellipse(x, y, rr, rr * (0.6 + hash01(i * 3) * 0.4), hash01(i * 17) * 3, 0, Math.PI * 2); t.fill()
  }
  // Grain.
  for (let i = 0; i < 70; i++) {
    const x = c + (hash01(i * 53 + 1) - 0.5) * r * 2
    const y = c + (hash01(i * 59 + 7) - 0.5) * r * 2
    t.fillStyle = i % 3 === 0 ? 'rgba(230,220,200,0.35)' : 'rgba(30,22,15,0.3)'
    t.fillRect(x, y, 1.4, 1.4)
  }
  t.restore()
})

/**
 * The rock's light: the terminator darkening the lower right, a warm highlight
 * upper left, a teal bounce along the shadow side (the crystal in the rock
 * lighting its own underside), and the inked contour with a few chips in it.
 */
export const rockShade = memo('roller|shade', BODY_PX, (t, s) => {
  const c = s / 2
  const r = s * 0.44
  t.save()
  bodyOutline(t, s)
  t.clip()
  const term = t.createRadialGradient(c - r * 0.3, c - r * 0.36, r * 0.35, c - r * 0.1, c - r * 0.12, r * 1.3)
  term.addColorStop(0, 'rgba(18,12,8,0)')
  term.addColorStop(0.55, 'rgba(18,12,8,0.05)')
  term.addColorStop(1, 'rgba(18,12,8,0.72)')
  t.fillStyle = term
  t.fillRect(0, 0, s, s)
  // Teal bounce light hugging the lower-right rim.
  t.lineCap = 'round'
  t.strokeStyle = rgba(TEAL, 0.22)
  t.lineWidth = s * 0.09
  t.beginPath(); t.arc(c, c, r * 0.93, Math.PI * 0.02, Math.PI * 0.72); t.stroke()
  t.strokeStyle = rgba(TEAL_HOT, 0.55)
  t.lineWidth = s * 0.025
  t.beginPath(); t.arc(c, c, r * 0.95, Math.PI * 0.1, Math.PI * 0.6); t.stroke()
  // Warm highlight.
  const hi = t.createRadialGradient(c - r * 0.38, c - r * 0.44, 0, c - r * 0.38, c - r * 0.44, r * 0.55)
  hi.addColorStop(0, 'rgba(255,244,222,0.42)')
  hi.addColorStop(1, 'rgba(255,244,222,0)')
  t.fillStyle = hi
  t.fillRect(0, 0, s, s)
  t.restore()
  // The ink: a contour of varying weight (two passes, the second offset down
  // right, so the line is heavier on the shadow side like a pen stroke).
  t.lineJoin = 'round'
  t.strokeStyle = INK
  t.lineWidth = s * 0.03
  bodyOutline(t, s)
  t.stroke()
  t.save()
  t.translate(s * 0.008, s * 0.012)
  t.lineWidth = s * 0.022
  t.beginPath(); t.arc(c, c, r * 0.99, Math.PI * 0.05, Math.PI * 0.8); t.stroke()
  t.restore()
  // Chips knocked out of the rim.
  t.lineWidth = s * 0.016
  for (let i = 0; i < 5; i++) {
    const a = hash01(i * 71 + 4) * Math.PI * 2
    const x = c + Math.cos(a) * r * 0.97
    const y = c + Math.sin(a) * r * 0.97
    t.beginPath()
    t.moveTo(x, y)
    t.lineTo(x - Math.cos(a + 0.5) * s * 0.05, y - Math.sin(a + 0.5) * s * 0.05)
    t.stroke()
  }
})

// ─── Surface features (they roll) ──────────────────────────────────────────

/**
 * A geode of teal crystal set in the rock: four hexagonal crystal points seen
 * from above, each cut into six facets lit from the upper left, inked, in a
 * teal wash where the crystal lights the stone round it.
 */
export const crystalSprite = memo('roller|crystal', 64, (t, s) => {
  const c = s / 2
  const halo = t.createRadialGradient(c, c, 0, c, c, s * 0.48)
  halo.addColorStop(0, rgba(TEAL, 0.55))
  halo.addColorStop(0.55, rgba(TEAL, 0.16))
  halo.addColorStop(1, rgba(TEAL, 0))
  t.fillStyle = halo
  t.fillRect(0, 0, s, s)
  const light = -Math.PI * 0.75
  const point = (ox: number, oy: number, r: number, rot: number): void => {
    const x = c + ox * s
    const y = c + oy * s
    const R = r * s
    for (let k = 0; k < 6; k++) {
      const a0 = rot + (k / 6) * Math.PI * 2
      const a1 = rot + ((k + 1) / 6) * Math.PI * 2
      const lit = 0.5 + 0.5 * Math.cos((a0 + a1) / 2 - light)
      t.fillStyle = lit > 0.66 ? mix(TEAL, TEAL_HOT, (lit - 0.66) * 2.4) : mix(TEAL_DEEP, TEAL, lit * 1.5)
      t.beginPath(); t.moveTo(x, y); t.lineTo(x + Math.cos(a0) * R, y + Math.sin(a0) * R); t.lineTo(x + Math.cos(a1) * R, y + Math.sin(a1) * R); t.closePath(); t.fill()
    }
    t.strokeStyle = INK
    t.lineWidth = s * 0.028
    t.lineJoin = 'round'
    t.beginPath()
    for (let k = 0; k <= 6; k++) {
      const a = rot + (k / 6) * Math.PI * 2
      if (k === 0) t.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R)
      else t.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R)
    }
    t.stroke()
    // The point's tip catching the light.
    t.fillStyle = 'rgba(255,255,255,0.9)'
    t.beginPath(); t.arc(x - R * 0.18, y - R * 0.2, Math.max(1, R * 0.16), 0, Math.PI * 2); t.fill()
  }
  point(-0.15, 0.1, 0.13, 0.5)
  point(0.17, 0.13, 0.115, 1.0)
  point(0.11, -0.17, 0.095, 0.2)
  point(0.0, 0.0, 0.19, 0.15)
})

/** A crack knocked into the rock: an inked zig-zag with a pale lip under it. `v` picks one of two shapes. */
const crackDraw = (v: number) => (t: CanvasRenderingContext2D, s: number): void => {
  const pts = v === 0
    ? [0.12, 0.42, 0.34, 0.5, 0.46, 0.34, 0.66, 0.46, 0.88, 0.4]
    : [0.2, 0.2, 0.36, 0.42, 0.3, 0.6, 0.52, 0.72, 0.62, 0.9]
  const path = (dx: number, dy: number): void => {
    t.beginPath()
    t.moveTo(pts[0]! * s + dx, pts[1]! * s + dy)
    for (let i = 2; i < pts.length; i += 2) t.lineTo(pts[i]! * s + dx, pts[i + 1]! * s + dy)
  }
  t.lineCap = 'round'
  t.lineJoin = 'round'
  t.strokeStyle = 'rgba(214,202,178,0.7)'
  t.lineWidth = s * 0.045
  path(s * 0.02, s * 0.03); t.stroke()
  t.strokeStyle = INK
  t.lineWidth = s * 0.06
  path(0, 0); t.stroke()
  // A side branch.
  t.lineWidth = s * 0.035
  t.beginPath()
  t.moveTo(pts[4]! * s, pts[5]! * s)
  t.lineTo(pts[4]! * s + (v === 0 ? -0.06 : 0.14) * s, pts[5]! * s - 0.16 * s)
  t.stroke()
}
const CRACKS = [memo('roller|crack|0', 64, crackDraw(0)), memo('roller|crack|1', 64, crackDraw(1))]
export const crackMark = (v: number): HTMLCanvasElement | null => CRACKS[v & 1]!()

/** A pit in the rock: a dark hollow with a lit lower lip. */
export const pitMark = memo('roller|pit', 48, (t, s) => {
  const c = s / 2
  t.fillStyle = 'rgba(34,26,19,0.85)'
  t.beginPath(); t.ellipse(c, c, s * 0.3, s * 0.24, 0, 0, Math.PI * 2); t.fill()
  t.strokeStyle = 'rgba(214,202,178,0.75)'
  t.lineWidth = s * 0.06
  t.lineCap = 'round'
  t.beginPath(); t.ellipse(c, c, s * 0.3, s * 0.24, 0, Math.PI * 0.15, Math.PI * 0.85); t.stroke()
  t.strokeStyle = INK
  t.lineWidth = s * 0.05
  t.beginPath(); t.ellipse(c, c, s * 0.3, s * 0.24, 0, Math.PI * 1.05, Math.PI * 1.95); t.stroke()
})

// ─── On the ground ──────────────────────────────────────────────────────────

/** The soft contact shadow the rock drags along the lane (drawn non-additive). */
export const shadowSprite = memo('roller|shadow', 64, (t, s) => {
  const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(10,7,4,0.75)')
  g.addColorStop(0.6, 'rgba(10,7,4,0.35)')
  g.addColorStop(1, 'rgba(10,7,4,0)')
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
})

/** A soft round dab of one colour — the brush the dust bakes are painted with (one gradient, reused). */
const dab = (color: string): HTMLCanvasElement | null => bakeSprite(`roller|dab|${color}`, 32, (t, s) => {
  const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, rgba(color, 1))
  g.addColorStop(0.5, rgba(color, 0.45))
  g.addColorStop(1, rgba(color, 0))
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
})

/** A lumpy ring of dust thrown out along the floor by the crush (non-additive), thick and billowing. */
export const dustRingSprite = memo('roller|dustring', 192, (t, s) => {
  const light = dab(DUST)
  const dark = dab(DUST_DARK)
  if (!light || !dark) return
  const c = s / 2
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + hash01(i * 5 + pass * 97) * 0.3
      const rr = s * (0.34 + (hash01(i * 7 + 1 + pass * 31) - 0.5) * 0.1)
      const x = c + Math.cos(a) * rr
      const y = c + Math.sin(a) * rr
      const r = s * (pass === 0 ? 0.11 + hash01(i * 13) * 0.05 : 0.06 + hash01(i * 17) * 0.04)
      t.globalAlpha = pass === 0 ? 0.75 : 0.9
      t.drawImage(pass === 0 ? light : (i % 2 === 0 ? dark : light), x - r, y - r, r * 2, r * 2)
    }
  }
  t.globalAlpha = 1
})

/** One billow of dust — a cluster of dabs, darker at its foot. The wake is laid from these. */
export const puffSprite = memo('roller|puff', 64, (t, s) => {
  const light = dab(DUST)
  const dark = dab(DUST_DARK)
  if (!light || !dark) return
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + hash01(i * 3 + 1) * 0.6
    const d = s * (i === 0 ? 0 : 0.16 + hash01(i * 11) * 0.08)
    const x = s / 2 + Math.cos(a) * d
    const y = s / 2 + Math.sin(a) * d * 0.8
    const r = s * (i === 0 ? 0.3 : 0.16 + hash01(i * 7) * 0.08)
    t.globalAlpha = i === 0 ? 0.85 : 0.7
    t.drawImage(y > s * 0.55 ? dark : light, x - r, y - r, r * 2, r * 2)
  }
  t.globalAlpha = 1
})

/**
 * The crush's impact frame: a jagged, uneven burst — rock splitting, not a
 * clean star — white at the heart running to teal at the spikes. Additive,
 * on screen for three frames. +x is the blow's direction; the long spikes
 * are thrown back and to the sides.
 */
export const burstSprite = memo('roller|burst', 192, (t, s) => {
  const c = s / 2
  const n = 11
  t.beginPath()
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + (hash01(i * 13 + 2) - 0.5) * 0.18
    const back = 0.5 - 0.5 * Math.cos(a) // 1 facing back (−x), 0 facing the blow
    const r = i % 2 === 0 ? s * (0.24 + back * 0.2 + hash01(i * 7) * 0.08) : s * (0.1 + hash01(i * 5) * 0.05)
    if (i === 0) t.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
    else t.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
  }
  t.closePath()
  const g = t.createRadialGradient(c, c, 0, c, c, s * 0.5)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, rgba(TEAL_HOT, 0.95))
  g.addColorStop(0.55, rgba(TEAL, 0.75))
  g.addColorStop(1, rgba(TEAL, 0))
  t.fillStyle = g
  t.fill()
})

/**
 * The crush's ground fracture: a FAN of cracks opening back toward where the
 * rock came from (+x of the bake is the blow's direction; the fan spreads over
 * the −x half), so they lie on the floor in front of the stone that stopped it
 * and never across that stone. `glow` bakes the same cracks as thin teal
 * fissures, for an additive pass over the dark ones.
 */
const fractureDraw = (glow: boolean) => (t: CanvasRenderingContext2D, s: number): void => {
  const c = s / 2
  t.lineCap = 'round'
  t.lineJoin = 'round'
  if (!glow) {
    // The dent under the rock.
    const d = t.createRadialGradient(c, c, 0, c, c, s * 0.2)
    d.addColorStop(0, 'rgba(22,15,9,0.55)')
    d.addColorStop(1, 'rgba(22,15,9,0)')
    t.fillStyle = d
    t.fillRect(0, 0, s, s)
  }
  const arms = 6
  for (let i = 0; i < arms; i++) {
    let a = Math.PI + ((i + 0.5) / arms - 0.5) * Math.PI * 0.85 + (hash01(i * 7 + 1) - 0.5) * 0.22
    let x = c
    let y = c
    const segs = 4
    const len = s * (0.34 + hash01(i * 17 + 3) * 0.12) / segs
    t.beginPath()
    t.moveTo(x, y)
    for (let k = 0; k < segs; k++) {
      a += (hash01(i * 31 + k * 5) - 0.5) * 0.8
      x += Math.cos(a) * len
      y += Math.sin(a) * len
      t.lineTo(x, y)
      if (k === 1) {
        const ba = a + (hash01(i * 41 + k) - 0.5) * 1.8
        t.moveTo(x, y)
        t.lineTo(x + Math.cos(ba) * len * 0.8, y + Math.sin(ba) * len * 0.8)
        t.moveTo(x, y)
      }
    }
    if (glow) {
      t.strokeStyle = rgba(TEAL, 0.55)
      t.lineWidth = s * 0.03
      t.stroke()
      t.strokeStyle = rgba(TEAL_HOT, 0.95)
      t.lineWidth = s * 0.011
      t.stroke()
    } else {
      t.strokeStyle = 'rgba(26,18,11,0.85)'
      t.lineWidth = s * 0.026
      t.stroke()
    }
  }
}
const FRACTURES = [memo('roller|fracture|0', 192, fractureDraw(false)), memo('roller|fracture|1', 192, fractureDraw(true))]
export const fractureSprite = (glow: boolean): HTMLCanvasElement | null => FRACTURES[glow ? 1 : 0]!()

// ─── Debris ─────────────────────────────────────────────────────────────────

/**
 * An angular chunk of the rock, inked, with a lit facet and a shaded one. `i`
 * 0…3 picks the tone and the cut: a slab, a wedge, a lump, a splinter.
 */
const gravelDraw = (i: number) => (t: CanvasRenderingContext2D, s: number): void => {
  const n = [4, 3, 6, 4][i % 4]!
  const stretch = [1.35, 1.1, 1, 1.8][i % 4]!
  const xs: number[] = []
  const ys: number[] = []
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + (hash01(i * 29 + k * 3) - 0.5) * (2.4 / n)
    const r = s * (0.26 + hash01(i * 13 + k * 11) * 0.14)
    xs.push(s / 2 + Math.cos(a) * r * stretch * 0.85)
    ys.push(s / 2 + Math.sin(a) * r / stretch * 1.1)
  }
  t.beginPath()
  for (let k = 0; k < n; k++) (k === 0 ? t.moveTo(xs[k]!, ys[k]!) : t.lineTo(xs[k]!, ys[k]!))
  t.closePath()
  t.fillStyle = ROCK[i % ROCK.length]!
  t.fill()
  t.fillStyle = 'rgba(20,14,8,0.35)'
  t.beginPath(); t.moveTo(xs[n - 1]!, ys[n - 1]!); t.lineTo(xs[n - 2]!, ys[n - 2]!); t.lineTo(s / 2, s / 2); t.closePath(); t.fill()
  t.fillStyle = 'rgba(255,240,215,0.4)'
  t.beginPath(); t.moveTo(xs[0]!, ys[0]!); t.lineTo(xs[1]!, ys[1]!); t.lineTo(s / 2, s / 2); t.closePath(); t.fill()
  t.lineJoin = 'round'
  t.strokeStyle = INK
  t.lineWidth = s * 0.055
  t.beginPath()
  for (let k = 0; k < n; k++) (k === 0 ? t.moveTo(xs[k]!, ys[k]!) : t.lineTo(xs[k]!, ys[k]!))
  t.closePath()
  t.stroke()
}
/** How many cuts of gravel there are. */
export const GRAVEL_KINDS = 4
const GRAVELS = [0, 1, 2, 3].map((i) => memo(`roller|gravel|${i}`, 32, gravelDraw(i)))
export const gravelSprite = (i: number): HTMLCanvasElement | null => GRAVELS[i % GRAVEL_KINDS]!()

/** A splinter of the teal crystal: a long diamond, white along its spine (additive). */
export const shardSprite = memo('roller|shard', 32, (t, s) => {
  const c = s / 2
  t.fillStyle = rgba(TEAL, 0.9)
  t.beginPath(); t.moveTo(c + s * 0.46, c); t.lineTo(c, c - s * 0.12); t.lineTo(c - s * 0.4, c); t.lineTo(c, c + s * 0.12); t.closePath(); t.fill()
  t.fillStyle = 'rgba(255,255,255,0.95)'
  t.beginPath(); t.moveTo(c + s * 0.4, c); t.lineTo(c, c - s * 0.04); t.lineTo(c - s * 0.26, c); t.lineTo(c, c + s * 0.04); t.closePath(); t.fill()
})
