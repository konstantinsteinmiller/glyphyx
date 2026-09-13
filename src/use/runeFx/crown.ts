import type { Crown, FxApi, RuneEvent, RuneFx } from './types'
import {
  blit, bump, clamp01, coreSprite, count, easeInCubic, easeInQuad, easeOutBack, easeOutCubic, glintSprite, glowSprite,
  mix, moteSprite, poolSprite, ringSprite, runeColor, span, spawn, spawnCaptureSparks, streakSprite
} from './kit'
import { GOLD, GOLD_HOT, flareSprite, linkSprite, shackleSprite, sigilSprite, starSprite } from './crown.art'

/**
 * ─── Crown (`crown`) — taking an enemy rune ─────────────────────────────────
 *
 * Events: `crown`, fired on the placement: the crown takes the rune it
 * faces and is spent doing it. `from` is the crown as it landed (its own
 * `shatter` follows 90 ms in), `turned` the taken rune AFTER it changed
 * sides, `was` the side it fought for a moment ago.
 *
 * The renderer re-cuts the taken stone in its new owner's colours at `start`
 * (and gives it a pop); this draws the moment around that, over the event's
 * window (`p`, 260 ms in play):
 *
 *   0 … 0.2        THE SIGIL. The crown on the stone lifts off it as a gold
 *                  crown — the rune's own silhouette, cast and inked — on a
 *                  shaft of indigo light, in an indigo aura. The stone rises
 *                  under it.
 *   0.06 … BIND    THE CHAINS. Two chains of gold (three from Lv 2), each over
 *                  a beam of indigo light, lash out from the sigil and wrap
 *                  the target; a shackle of links closes round it and
 *                  tightens. The target is swallowed in indigo light — so the
 *                  recolour the renderer did at `start` is not seen until it
 *                  is SEALED — and dragged toward the crown, shivering.
 *   BIND           THE ROYAL FLARE: the chains burst into flying links, an
 *                  eight-pointed gold star over an indigo bloom and a fast
 *                  indigo shock ring, gold stars thrown out, and the
 *                  conversion ripple in the NEW OWNER's colour; the stone
 *                  pops, revealed on its new side.
 *   … tail         The sigil rises off its breaking stone and dissolves into
 *                  glints; the ripple runs out; an indigo halo settles.
 *
 * The squint test: a crown shape, curved chains and an eight-point star. No
 * other rune draws any of the three.
 *
 * Cues: `crown` (`runeSfx/crown.ts`), from `start`; its chord is timed to land
 * on BIND.
 */

const CORE = runeColor('crown')
const INDIGO_HOT = mix(CORE, '#ffffff', 0.45)

/** The chains cinch and the flare goes up: `impactAt`. (BIND × 260 ms ≈ 110 ms — the fanfare's chord.) */
const BIND = 0.42
const TAIL_MS = 440

// ─── Geometry, per frame, into scratch ──────────────────────────────────────

const G = {
  /** The crown stone, the target, the sigil's resting place. */
  x0: 0, y0: 0, tx: 0, ty: 0, sx: 0, sy: 0,
  /** Unit vector sigil → target, and its perpendicular. */
  ux: 0, uy: -1, px: 1, py: 0
}

const geometry = (e: Crown, api: FxApi): void => {
  const size = api.size
  G.x0 = api.cx(e.from.col, e.from.row)
  G.y0 = api.cy(e.from.col, e.from.row)
  G.tx = api.cx(e.turned.col, e.turned.row)
  G.ty = api.cy(e.turned.col, e.turned.row)
  G.sx = G.x0
  G.sy = G.y0 - size * 0.3
  const dx = G.tx - G.sx
  const dy = G.ty - G.sy
  const d = Math.hypot(dx, dy) || 1
  G.ux = dx / d
  G.uy = dy / d
  G.px = -G.uy
  G.py = G.ux
}

// ─── Per-event memory ───────────────────────────────────────────────────────

const F_STONE = 1
const F_DISSOLVE = 2
const F_BOUND = 4

interface Slot { e: Crown | null; flags: number }
const SLOTS: Slot[] = [0, 1, 2, 3].map(() => ({ e: null, flags: 0 }))
let slotNext = 0
const slotOf = (e: Crown): Slot => {
  for (let i = 0; i < SLOTS.length; i++) if (SLOTS[i]!.e === e) return SLOTS[i]!
  const s = SLOTS[slotNext]!
  slotNext = (slotNext + 1) % SLOTS.length
  s.e = e
  s.flags = 0
  return s
}

// ─── The chains ─────────────────────────────────────────────────────────────

/** A quadratic from (ax, ay) over (cx, cy) to (bx, by), links laid along it up to `reach`, over a beam of light. */
const paintChain = (
  ctx: CanvasRenderingContext2D, size: number, tier: number,
  ax: number, ay: number, cx: number, cy: number, bx: number, by: number, reach: number, alpha: number
): void => {
  if (reach <= 0 || alpha <= 0.01) return
  // The light first: the sub-curve [0, reach] (de Casteljau), indigo glow, gold core.
  const qx = ax + (cx - ax) * reach
  const qy = ay + (cy - ay) * reach
  const ex = (1 - reach) * (1 - reach) * ax + 2 * (1 - reach) * reach * cx + reach * reach * bx
  const ey = (1 - reach) * (1 - reach) * ay + 2 * (1 - reach) * reach * cy + reach * reach * by
  if (tier > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    ctx.strokeStyle = CORE
    ctx.globalAlpha = 0.6 * alpha
    ctx.lineWidth = size * 0.14
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(qx, qy, ex, ey); ctx.stroke()
    ctx.strokeStyle = INDIGO_HOT
    ctx.globalAlpha = 0.55 * alpha
    ctx.lineWidth = size * 0.04
    ctx.stroke()
    ctx.restore()
  }
  // The links: one every ~0.085 tile, alternating flat and edge-on.
  const face = linkSprite(true)
  const edge = linkSprite(false)
  const chord = Math.hypot(bx - ax, by - ay)
  const bow = Math.hypot(cx - (ax + bx) / 2, cy - (ay + by) / 2)
  const arc = chord * (1 + (8 / 3) * (bow / Math.max(1, chord)) * (bow / Math.max(1, chord)))
  const n = Math.max(3, Math.min(18, Math.round(arc / (size * 0.085))))
  const lw = size * 0.13
  if (face && edge) {
    for (let i = 0; i <= n; i++) {
      const t = i / n
      if (t > reach) break
      const u = 1 - t
      const x = u * u * ax + 2 * u * t * cx + t * t * bx
      const y = u * u * ay + 2 * u * t * cy + t * t * by
      const tx = 2 * u * (cx - ax) + 2 * t * (bx - cx)
      const ty = 2 * u * (cy - ay) + 2 * t * (by - cy)
      blit(ctx, i % 2 === 0 ? face : edge, x, y, lw, lw, alpha, false, Math.atan2(ty, tx))
    }
  } else {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = GOLD
    ctx.lineWidth = Math.max(1, size * 0.03)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(qx, qy, ex, ey); ctx.stroke()
    ctx.restore()
  }
  // The lashing tip.
  if (reach < 1) blit(ctx, coreGold(), ex, ey, size * 0.34, size * 0.34, alpha, true)
}

/** The chain's anchors and control point for chain `side` (−1, +1 round the flanks, 0 straight), at tightness `tight` 0…1. */
const CH = { ax: 0, ay: 0, cx: 0, cy: 0, bx: 0, by: 0 }
const chainPoints = (side: number, size: number, tight: number): typeof CH => {
  CH.ax = G.sx + G.px * side * size * 0.2
  CH.ay = G.sy + G.py * side * size * 0.2 + size * 0.05
  if (side === 0) {
    CH.bx = G.tx - G.ux * size * 0.3
    CH.by = G.ty - G.uy * size * 0.3
    CH.cx = (CH.ax + CH.bx) / 2
    CH.cy = (CH.ay + CH.by) / 2
    return CH
  }
  const wrap = size * (0.4 - 0.06 * tight)
  CH.bx = G.tx + G.px * side * wrap + G.ux * size * 0.02
  CH.by = G.ty + G.py * side * wrap + G.uy * size * 0.02
  const bow = size * (0.3 - 0.16 * tight)
  CH.cx = (CH.ax + CH.bx) / 2 + G.px * side * bow
  CH.cy = (CH.ay + CH.by) / 2 + G.py * side * bow
  return CH
}

// ─── Particles ──────────────────────────────────────────────────────────────

/** A kit sprite fetched once and held: the per-frame path then builds no bake key and passes no closure. */
const once = (make: () => HTMLCanvasElement | null): (() => HTMLCanvasElement | null) => {
  let c: HTMLCanvasElement | null | undefined
  return () => (c !== undefined ? c : (c = make()))
}
const glowIndigo = once(() => glowSprite(CORE, 192))
const glowIndigoHot = once(() => glowSprite(INDIGO_HOT, 96))
const glowGold = once(() => glowSprite(GOLD, 96))
const coreGoldHot = once(() => coreSprite(GOLD_HOT, 96))
const coreGold = once(() => coreSprite(GOLD, 48))
const shaft = once(() => streakSprite(INDIGO_HOT, 96))
const bindRing = once(() => ringSprite(CORE, 96, 0.2))
const shockRing = once(() => ringSprite(INDIGO_HOT, 192, 0.1))
const echoRing = once(() => ringSprite(INDIGO_HOT, 192, 0.08))
const moteHot = once(() => moteSprite(INDIGO_HOT))
const glintGold = once(() => glintSprite(GOLD_HOT, 48))

/** The new owner's colour, baked once per colour (a side is one of a handful). */
let sideKey = ''
let sideGlow: HTMLCanvasElement | null = null
let sideRing: HTMLCanvasElement | null = null
const sideSprites = (color: string): void => {
  if (color === sideKey) return
  sideKey = color
  sideGlow = glowSprite(color, 96)
  sideRing = ringSprite(color, 192, 0.1)
}

/** A glow of radius `r` from a held sprite. */
const glow = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, r: number, a: number, additive = true): void => {
  blit(ctx, spr, x, y, r * 2, r * 2, a, additive)
}
/** A ring of radius `r` (a ring sprite's band sits at 0.78 of its half-width). */
const ring = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, r: number, a: number): void => {
  const d = (r / 0.78) * 2
  blit(ctx, spr, x, y, d, d, a, true)
}

const LINK_KEYS = ['crown|link|0', 'crown|link|1']
const LINK_MAKE = [() => linkSprite(false), () => linkSprite(true)]
const MOTE_KEY = `mote|${INDIGO_HOT}`
const GLINT_KEY = `glint|${GOLD_HOT}`
const starId = (): number => poolSprite('crown|star', starSprite)
const linkId = (face: boolean): number => poolSprite(LINK_KEYS[face ? 1 : 0]!, LINK_MAKE[face ? 1 : 0]!)
const moteId = (): number => poolSprite(MOTE_KEY, moteHot)
const glintId = (): number => poolSprite(GLINT_KEY, glintGold)

/** Gold stars thrown out of (x, y), twinkling as they fall. */
const stars = (x: number, y: number, size: number, n: number, speed: number, up: number): void => {
  const id = starId()
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + Math.random() * 0.5
    const v = size * speed * (0.5 + Math.random() * 0.7)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * up, 520 + Math.random() * 320, size * (0.055 + Math.random() * 0.05), GOLD,
      { shape: id >= 0 ? 6 : 0, sprite: id, gravity: size * 2.6, drag: 1.9, vrot: (Math.random() - 0.5) * 7, fade: 1 })
  }
}

/** Indigo motes lifting off in a loose ring. */
const motes = (x: number, y: number, size: number, n: number, ring: number): void => {
  const id = moteId()
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + Math.random() * 0.4
    const r = size * ring * (0.6 + Math.random() * 0.5)
    spawn(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7, Math.cos(a) * size * 0.35, -size * (0.55 + Math.random() * 0.7),
      640 + Math.random() * 380, size * (0.08 + Math.random() * 0.07), INDIGO_HOT, { shape: id >= 0 ? 4 : 0, sprite: id, drag: 1.1, fade: 1, grow: 2 })
  }
}

// ─── The module ─────────────────────────────────────────────────────────────

export const crown: RuneFx = {
  type: 'crown',
  palette: { core: CORE, hot: INDIGO_HOT, deep: mix(CORE, '#000000', 0.55), accent: GOLD },

  impactAt: (e) => (e.kind === 'crown' ? BIND : undefined),
  tailMs: (e) => (e.kind === 'crown' ? TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'crown') return
    const s = slotOf(e)
    s.flags = 0
    geometry(e, api)
    const size = api.size
    // The sigil's birth: indigo motes and a few gold sparks lifting off the crown stone.
    motes(G.x0, G.y0 - size * 0.05, size, 10, 0.32)
    stars(G.x0, G.y0 - size * 0.2, size, 4, 0.9, 0.8)
    api.sound('crown', 1, { x: G.tx, level: e.from.level, side: e.from.side })
    // Bake now so the first frames do not.
    sigilSprite(); linkSprite(true); linkSprite(false); shackleSprite(); flareSprite()
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind !== 'crown') return
    geometry(e, api)
    const s = slotOf(e)
    const ctx = api.ctx
    const size = api.size
    const tier = api.tier
    const ms = p * e.dur
    const after = ms - BIND * e.dur
    const lv2 = e.from.level >= 2
    const big = lv2 ? 1.15 : 1
    sideSprites(api.sideColor(e.turned.side, e.turned.faction))

    // ── The crown stone lifts under its sigil, and settles before it breaks ──
    if (!(s.flags & F_STONE)) {
      if (p < 0.3) {
        const b = bump(p / 0.3)
        api.pose(e.from.id, 0, -size * 0.07 * b, 1 + 0.1 * b, 1 + 0.1 * b)
      } else {
        api.pose(e.from.id, 0, 0, 1, 1)
        s.flags |= F_STONE
      }
    }
    // ── The target: dragged toward the crown in its chains, shivering ──
    if (!(s.flags & F_BOUND)) {
      if (p >= 0.16 && after < 0) {
        const pull = easeInCubic(span(p, 0.16, BIND))
        const j = size * 0.016 * pull
        const ox = -G.ux * size * 0.11 * pull + j * Math.sin(api.now * 0.21 + e.turned.id)
        const oy = -G.uy * size * 0.11 * pull + j * Math.sin(api.now * 0.27 + e.turned.id * 2)
        api.pose(e.turned.id, ox, oy, 1 - 0.09 * pull, 1 - 0.09 * pull)
      } else if (after >= 0) {
        api.pose(e.turned.id, 0, 0)
        s.flags |= F_BOUND
      }
    }

    // ── The sigil: its lift, its flare, its ascent ──
    const rise = easeOutBack(span(p, 0, 0.2))
    let sy = G.y0 + (G.sy - G.y0) * rise
    let sAlpha = clamp01(p / 0.07)
    let sScale = (0.4 + 0.6 * rise) * big
    if (after >= 0) {
      sScale *= 1 + 0.14 * bump(clamp01(after / 110))
      const up = span(after, 70, 340)
      sy -= size * 0.4 * easeInQuad(up)
      sAlpha *= 1 - up
    } else {
      sy += size * 0.012 * Math.sin(ms * 0.03)
    }
    if (after >= 220 && !(s.flags & F_DISSOLVE)) {
      s.flags |= F_DISSOLVE
      const gid = glintId()
      const n = count(6)
      for (let i = 0; i < n; i++) {
        spawn(G.sx + (Math.random() - 0.5) * size * 0.5, sy + (Math.random() - 0.5) * size * 0.3, (Math.random() - 0.5) * size * 0.4, -size * (0.4 + Math.random() * 0.5),
          420 + Math.random() * 300, size * (0.07 + Math.random() * 0.06), GOLD_HOT, { shape: gid >= 0 ? 6 : 0, sprite: gid, drag: 1.2, fade: 1, grow: 2 })
      }
    }

    // The shaft of indigo light the sigil lifts on.
    if (p < 0.45 && tier > 0) {
      const a = bump(clamp01(p / 0.45))
      const len = size * 1.1
      blit(ctx, shaft(), G.x0, G.y0 + size * 0.2 - len / 2, len, size * 0.55, a * 0.85, true, -Math.PI / 2)
    }
    // The aura round the sigil — indigo, with a gold heart at the flare.
    if (sAlpha > 0.01) {
      const flare = after >= 0 ? 1 - clamp01(after / 150) : 0
      // Deep indigo first (a tint, so it stays indigo over a pale stone), light over it.
      glow(ctx, glowIndigo(), G.sx, sy, size * 0.62 * sScale, 0.45 * sAlpha, false)
      glow(ctx, glowIndigo(), G.sx, sy, size * 0.75 * sScale, (0.7 + 0.2 * flare) * sAlpha)
      if (tier > 0) glow(ctx, glowIndigoHot(), G.sx, sy, size * 0.4 * sScale, 0.22 * sAlpha)
      if (flare > 0) blit(ctx, glowGold(), G.sx, sy, size * 0.9 * sScale, size * 0.9 * sScale, 0.55 * flare * sAlpha, true)
      const w = size * 0.7 * sScale
      if (!blit(ctx, sigilSprite(), G.sx, sy, w, w, sAlpha, false)) {
        ctx.save()
        ctx.globalAlpha = sAlpha
        ctx.fillStyle = GOLD
        ctx.beginPath(); ctx.arc(G.sx, sy, w * 0.3, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      if (flare > 0) blit(ctx, coreGoldHot(), G.sx, sy - w * 0.05, w * 0.9, w * 0.9, flare * 0.6 * sAlpha, true)
    }

    // ── The chains, the shackle and the binding light (until they burst) ──
    if (after < 40) {
      const reach = easeOutCubic(span(p, 0.06, 0.26))
      const tight = easeInCubic(span(p, 0.2, BIND))
      const ca = after < 0 ? 1 : 1 - after / 40
      const bind = span(p, 0.08, BIND)
      if (bind > 0) {
        // A violet TINT (normal blend): additive light on a pale stone only climbs to white.
        glow(ctx, glowIndigo(), G.tx, G.ty, size * 0.6, 0.5 * bind * ca, false)
        if (tier > 0) blit(ctx, bindRing(), G.tx, G.ty, size * 1.1, size * 1.1, 0.5 * bind * ca, true)
      }
      for (let side = -1; side <= 1; side++) {
        if (side === 0 && !lv2) continue
        const c = chainPoints(side, size, tight)
        paintChain(ctx, size, tier, c.ax, c.ay, c.cx, c.cy, c.bx, c.by, side === 0 ? easeOutCubic(span(p, 0.1, 0.3)) : reach, ca)
      }
      const shut = span(p, 0.18, 0.3)
      if (shut > 0) {
        const w = size * (1.2 - 0.3 * tight) * (lv2 ? 1.05 : 1)
        blit(ctx, shackleSprite(), G.tx, G.ty + size * 0.03, w, w * 0.86, shut * ca, false, ms * 0.004)
      }
    }

    // ── The flare, the shock, the ripple in the new owner's colour, the halo ──
    if (after >= 0) {
      const kf = clamp01(after / 160)
      if (kf < 1) {
        glow(ctx, glowIndigo(), G.tx, G.ty, size * (0.72 + 0.35 * kf) * big, 0.62 * (1 - kf), false)
        glow(ctx, glowIndigo(), G.tx, G.ty, size * (0.9 + 0.4 * kf) * big, 0.32 * (1 - kf))
        const w = size * (0.85 + 0.85 * easeOutCubic(kf)) * big
        if (!blit(ctx, flareSprite(), G.tx, G.ty, w, w, 0.9 * Math.pow(1 - kf, 1.5), true, 0.18 + kf * 0.45)) {
          glow(ctx, glowGold(), G.tx, G.ty, size * 0.5, 1 - kf)
        }
      }
      // The royal shock: a fast indigo ring off the seal.
      const ks = clamp01(after / 160)
      if (ks < 1) ring(ctx, shockRing(), G.tx, G.ty, size * (0.2 + 0.43 * easeOutCubic(ks)) * big, 0.9 * (1 - ks))
      // The ripple: the stone's new colour running out over its tile.
      const kr = clamp01(after / 330)
      if (kr < 1) {
        blit(ctx, sideGlow, G.tx, G.ty, size * 1.15, size * 1.15, 0.4 * (1 - kr) * (1 - kr), false)
        ring(ctx, sideRing, G.tx, G.ty, size * (0.26 + 0.7 * easeOutCubic(kr)) * big, 0.9 * (1 - kr))
      }
      const kg = clamp01((after - 80) / 330)
      if (kg > 0 && kg < 1 && tier > 0) {
        ring(ctx, echoRing(), G.tx, G.ty, size * (0.22 + 0.62 * easeOutCubic(kg)) * big, 0.6 * (1 - kg))
      }
      // An indigo halo settling on the stone, a gold heart in it.
      if (tier > 0) {
        const h = bump(span(after, 60, 560))
        if (h > 0) {
          glow(ctx, glowIndigo(), G.tx, G.ty - size * 0.05, size * 0.6, 0.4 * h)
          blit(ctx, glowGold(), G.tx, G.ty - size * 0.05, size * 0.5, size * 0.5, 0.16 * h, true)
        }
      }
    }
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'crown') return
    geometry(e, api)
    const size = api.size
    const lv2 = e.from.level >= 2
    const newColor = api.sideColor(e.turned.side, e.turned.faction)
    // Sealed: it pops, revealed on its new side.
    api.pose(e.turned.id, 0, 0, 1.3, 1.3)
    api.flash(e.turned.id, 0.4)
    // The chains burst: their links fly, from along both chains.
    for (let side = -1; side <= 1; side += 2) {
      const c = chainPoints(side, size, 1)
      const n = count(lv2 ? 6 : 5)
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n
        const u = 1 - t
        const x = u * u * c.ax + 2 * u * t * c.cx + t * t * c.bx
        const y = u * u * c.ay + 2 * u * t * c.cy + t * t * c.by
        const id = linkId(i % 2 === 0)
        const out = Math.atan2(y - G.ty, x - G.tx) + (Math.random() - 0.5) * 0.9
        const v = size * (1.4 + Math.random() * 1.8)
        spawn(x, y, Math.cos(out) * v, Math.sin(out) * v - size * 1.3, 420 + Math.random() * 260, size * 0.07, GOLD,
          { additive: false, shape: id >= 0 ? 4 : 1, sprite: id, gravity: size * 9, drag: 0.8, vrot: (Math.random() - 0.5) * 16, fade: 2 })
      }
    }
    // The flare throws gold stars; indigo motes lift off the stone; the new
    // owner's colour sparks round the tile's edge.
    stars(G.tx, G.ty, size, lv2 ? 18 : 14, 3.0, 0.9)
    motes(G.tx, G.ty, size, lv2 ? 14 : 11, 0.42)
    spawnCaptureSparks(G.tx, G.ty, size, newColor)
    const gid = glintId()
    const n = count(3, 1)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      spawn(G.tx + Math.cos(a) * size * 0.3, G.ty + Math.sin(a) * size * 0.25, 0, -size * 0.25, 380 + Math.random() * 240,
        size * (0.14 + Math.random() * 0.08), GOLD_HOT, { shape: gid >= 0 ? 6 : 0, sprite: gid, drag: 1, fade: 1, grow: 2 })
    }
  }
}
