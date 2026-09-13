import type { Buff, FxApi, Heal, RuneEvent, RuneFx } from './types'
import { blit, bump, coreSprite, count, easeInCubic, easeInOutCubic, easeOutCubic, poolSprite, qualityMul, spawn, span } from './kit'
import {
  CX_DEEP, CX_GOLD, CX_HEAL, CX_HOT, chevron, columnGold, columnHeal, flareGold, flareHeal, glint,
  glowGold, glowHeal, halo, moteSprite, plusSprite, ringGold, ringHeal
} from './support.sprites'

/**
 * ─── Cross (`support`) — the heal, and its Lv 2 buff ────────────────────────
 *
 * Warm gold holy light that RISES — the one rune whose moments are gifts, so
 * its motion runs the other way from every blow on the board: light gathers
 * up out of the floor and sinks INTO the stone it reaches, instead of flying
 * out of a stone that was hit. Its shapes are the plus and the upward stroke.
 *
 *   · `heal` (drawn on `e.to`): a thread of gold arcs over from the cross; a
 *     sacred circle blooms on the floor under the wounded stone and a column
 *     of light lifts out of it, motes rising. At the impact (the renderer sets
 *     HP and floats "+N" then) a green pulse CONTRACTS into the stone, a tall
 *     plus-shaped flare of green light stands over it, the stone swells with a
 *     breath, and plus sparkles float up while the column lifts away. A heal
 *     of 0 (full HP) keeps the gesture — circle, column, motes — smaller, in
 *     gold only: the blessing arrived and had nothing to mend.
 *   · `buff` (a Lv 2 cross sharpening `e.to`'s attack): a quick golden spark
 *     from the cross, then an upward surge — chevrons climbing through the
 *     stone, a narrow column shooting up, a gold shock ring on the floor — the
 *     stone stretching tall, and a star glint catching its shoulder: honed.
 *
 * Cues: `heal`, `buff` (`runeSfx/support.ts`).
 */

const HEAL_TAIL = 450
const BUFF_TAIL = 420
/** Where the buff's surge lands, ms into its window. */
const BUFF_HIT = 95

// ─── Particle sprites ───────────────────────────────────────────────────────

// Makers hoisted and keys constant, so a lookup (the tail's pluses run per frame) builds nothing.
const mkPlusGold = (): HTMLCanvasElement | null => plusSprite(CX_GOLD)
const mkPlusHeal = (): HTMLCanvasElement | null => plusSprite(CX_HEAL)
const mkMoteGold = (): HTMLCanvasElement | null => moteSprite(CX_GOLD)
const mkMoteHeal = (): HTMLCanvasElement | null => moteSprite(CX_HEAL)
const mkCore = (): HTMLCanvasElement | null => coreSprite(CX_GOLD, 48)
const K_MOTE_GOLD = `mote|${CX_GOLD}`
const K_MOTE_HEAL = `mote|${CX_HEAL}`
const K_CORE = `core|${CX_GOLD}`

const pPlusGold = (): number => poolSprite('cx|plus|gold', mkPlusGold)
const pPlusHeal = (): number => poolSprite('cx|plus|heal', mkPlusHeal)
const pMoteGold = (): number => poolSprite(K_MOTE_GOLD, mkMoteGold)
const pMoteHeal = (): number => poolSprite(K_MOTE_HEAL, mkMoteHeal)
const pCore = (): number => poolSprite(K_CORE, mkCore)

/**
 * Plus sparkles floating up round (x, y): upright, always — a plus turned is an
 * X. They start on the stone's SHOULDERS (left and right of `x`, never on its
 * face), so the glyph under them stays readable.
 */
/** One options object for every plus (the tail emits them per frame): only its sprite changes. */
const PLUS: NonNullable<Parameters<typeof spawn>[7]> = { shape: 4, sprite: -1, rot: 0, vrot: 0, drag: 1.1, fade: 1, grow: 2 }

const pluses = (x: number, y: number, s: number, n: number, heal: boolean, spreadX: number, rise: number): void => {
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    const green = heal && i % 3 !== 2
    const side = i % 2 === 0 ? 1 : -1
    PLUS.sprite = green ? pPlusHeal() : pPlusGold()
    spawn(x + side * s * spreadX * (0.22 + Math.random() * 0.3), y + (Math.random() - 0.5) * s * 0.4,
      (Math.random() - 0.5) * s * 0.35, -s * rise * (0.55 + Math.random() * 0.7),
      620 + Math.random() * 380, s * (0.09 + Math.random() * 0.07), green ? CX_HEAL : CX_GOLD, PLUS)
  }
}

/** Soft motes rising from a ring on the floor. */
const risingMotes = (x: number, y: number, s: number, n: number, color: string, id: number, r: number): void => {
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + Math.random() * 0.4
    spawn(x + Math.cos(a) * s * r, y + Math.sin(a) * s * r * 0.4, -Math.cos(a) * s * 0.1, -s * (0.55 + Math.random() * 0.6),
      700 + Math.random() * 350, s * (0.06 + Math.random() * 0.05), color, { shape: 4, sprite: id, drag: 0.5, fade: 1, grow: 2 })
  }
}

// ─── The gift's thread: an arc of gold from the cross to the stone ──────────

const arc = { x0: 0, y0: 0, x1: 0, y1: 0, cx: 0, cy: 0 }

/** Lay the arc from the cross (e.from) to the stone (e.to): bowed to one side, never back on itself. */
const layArc = (e: Heal | Buff, api: FxApi): void => {
  const s = api.size
  arc.x0 = api.cx(e.from.col, e.from.row)
  arc.y0 = api.cy(e.from.col, e.from.row) - s * 0.18
  arc.x1 = api.cx(e.to.col, e.to.row)
  arc.y1 = api.cy(e.to.col, e.to.row) - s * 0.22
  const dx = arc.x1 - arc.x0
  const dy = arc.y1 - arc.y0
  const len = Math.hypot(dx, dy) || 1
  // The perpendicular that points UP the screen (or right, for a vertical pair).
  let nx = dy / len
  let ny = -dx / len
  if (ny > 0 || (Math.abs(ny) < 1e-3 && nx < 0)) { nx = -nx; ny = -ny }
  arc.cx = (arc.x0 + arc.x1) / 2 + nx * len * 0.42
  arc.cy = (arc.y0 + arc.y1) / 2 + ny * len * 0.42
}
const arcX = (u: number): number => { const v = 1 - u; return v * v * arc.x0 + 2 * v * u * arc.cx + u * u * arc.x1 }
const arcY = (u: number): number => { const v = 1 - u; return v * v * arc.y0 + 2 * v * u * arc.cy + u * u * arc.y1 }

/** The travelling spark and its trail of fading light. */
const paintArc = (ctx: CanvasRenderingContext2D, u: number, s: number, tier: 0 | 1 | 2, head: number): void => {
  if (u <= 0 || u >= 1) return
  const g = glowGold(s * 2)
  if (tier >= 1) {
    for (let i = 6; i >= 1; i--) {
      const w = u - i * 0.055
      if (w <= 0) continue
      const a = (1 - i / 7) * 0.7
      blit(ctx, g, arcX(w), arcY(w), s * (0.26 - i * 0.02), s * (0.26 - i * 0.02), a)
    }
  }
  const hx = arcX(u)
  const hy = arcY(u)
  blit(ctx, g, hx, hy, s * 0.62 * head, s * 0.62 * head, 0.9)
  blit(ctx, flareGold(s * 1.2), hx, hy, s * 0.42 * head, s * 0.42 * head, 1)
}

/** A sprite squashed onto the floor. */
const floor = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, w: number, h: number, alpha: number, rot = 0): void => {
  if (!spr || alpha <= 0.005) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.translate(x, y)
  ctx.scale(1, h / w)
  if (rot !== 0) ctx.rotate(rot)
  ctx.drawImage(spr, -w / 2, -w / 2, w, w)
  ctx.restore()
}

// ─── The module ─────────────────────────────────────────────────────────────

export const support: RuneFx = {
  type: 'support',
  palette: { core: CX_GOLD, hot: CX_HOT, deep: CX_DEEP, accent: CX_HEAL },

  impactAt: (e) => (e.kind === 'heal' ? 0.5 : e.kind === 'buff' ? Math.max(0.3, Math.min(0.8, BUFF_HIT / Math.max(1, e.dur))) : undefined),
  tailMs: (e) => (e.kind === 'heal' ? HEAL_TAIL : e.kind === 'buff' ? BUFF_TAIL : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'heal' && e.kind !== 'buff') return
    const s = api.size
    const x = api.cx(e.to.col, e.to.row)
    const y = api.cy(e.to.col, e.to.row)
    const sx = api.cx(e.from.col, e.from.row)
    const sy = api.cy(e.from.col, e.from.row)
    if (e.kind === 'heal') {
      const mends = e.amount > 0
      api.sound('heal', mends ? 0.8 : 0.35, { x, level: e.from.level, side: e.from.side })
      // Motes lifting off the circle's rim as it blooms, and a blessing off the cross.
      risingMotes(x, y + s * 0.32, s, mends ? 8 : 4, CX_GOLD, pMoteGold(), 0.42)
      pluses(sx, sy - s * 0.15, s, mends ? 3 : 2, false, 0.5, 0.8)
    } else {
      api.sound('buff', 0.8, { x, level: e.from.level, side: e.from.side })
      const c = pCore()
      const k = count(4, 1)
      for (let i = 0; i < k; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
        spawn(sx, sy - s * 0.15, Math.cos(a) * s * 1.2, Math.sin(a) * s * 1.2, 220 + Math.random() * 120, s * 0.1, CX_GOLD,
          { shape: 4, sprite: c, drag: 3, fade: 2 })
      }
    }
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'heal' && e.kind !== 'buff') return
    const s = api.size
    const x = api.cx(e.to.col, e.to.row)
    const y = api.cy(e.to.col, e.to.row)
    if (e.kind === 'heal') {
      const mends = e.amount > 0
      pluses(x, y - s * 0.16, s, mends ? 10 : 4, mends, 1, 1.1)
      if (mends) {
        const id = pMoteHeal()
        const k = count(7, 1)
        for (let i = 0; i < k; i++) {
          const a = (i / k) * Math.PI * 2
          spawn(x + Math.cos(a) * s * 0.15, y + Math.sin(a) * s * 0.12, Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.6 - s * 0.5,
            420 + Math.random() * 260, s * (0.07 + Math.random() * 0.05), CX_HEAL, { shape: 4, sprite: id, drag: 2.2, fade: 1, grow: 2 })
        }
      }
    } else {
      // The surge: gold sparks shooting UP out of the stone, and a few pluses.
      const k = count(10, 2)
      for (let i = 0; i < k; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9
        const v = s * (2.2 + Math.random() * 2)
        spawn(x + (Math.random() - 0.5) * s * 0.4, y + s * 0.1, Math.cos(a) * v, Math.sin(a) * v, 260 + Math.random() * 180,
          s * (0.035 + Math.random() * 0.03), i % 3 === 0 ? '#ffffff' : CX_GOLD, { shape: 2, drag: 2.6, gravity: s * 2 })
      }
      pluses(x, y - s * 0.2, s, 4, false, 0.6, 1.2)
      risingMotes(x, y + s * 0.3, s, 4, CX_GOLD, pMoteGold(), 0.35)
    }
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind === 'heal') paintHeal(e, p, api)
    else if (e.kind === 'buff') paintBuff(e, p, api)
  }
}

// ─── Heal ───────────────────────────────────────────────────────────────────

/**
 * When a heal last painted on each stone (`api.now`). A Lv 2 cross heals AND
 * buffs the same neighbour 40 ms apart; the buff reads this and yields its
 * column and glow to the heal, so two gifts on one stone do not white it out.
 */
const healedAt = new Map<number, number>()

const paintHeal = (e: Heal, p: number, api: FxApi): void => {
  if (p <= 1.5) {
    if (healedAt.size > 64 && !healedAt.has(e.to.id)) healedAt.clear()
    healedAt.set(e.to.id, api.now)
  }
  const ctx = api.ctx
  const s = api.size
  const t = p * e.dur
  const hit = e.dur * 0.5
  const end = e.dur + HEAL_TAIL
  const mends = e.amount > 0
  // A bigger cross blooms a little wider; a heal with nothing to mend, smaller.
  const q = mends ? 1 + 0.07 * Math.min(3, e.from.level - 1) : 0.7
  const x = api.cx(e.to.col, e.to.row)
  const y = api.cy(e.to.col, e.to.row)
  const foot = y + s * 0.32

  // The thread of gold from the cross.
  layArc(e, api)
  paintArc(ctx, easeInOutCubic(span(t, 0, hit - 8)), s, api.tier, q)
  // …and the cross itself glowing as it gives.
  const give = bump(span(t, 0, hit + 120))
  if (give > 0.01) blit(ctx, glowGold(s * 2), arc.x0, arc.y0 + s * 0.18, s * 0.95, s * 0.95, give * 0.45)

  // The sacred circle blooming on the floor.
  const g = easeOutCubic(span(t, 0, 150))
  const haloA = 0.95 * span(t, 0, 60) * (1 - span(t, 330, end - 40))
  const hw = s * (0.6 + 0.55 * g) * q
  // (The art layer's painted `fx/ring-heal` is NOT drawn: the shipped webp has an
  // opaque mauve matte — alpha 255 away from the ring — which, added over the
  // board, paints a pink square under the stone. The baked circle carries it.)
  floor(ctx, halo(s * 2.4), x, foot, hw, hw * 0.4, haloA, t * 0.0022)

  // The column of light lifting out of it — and, after the pulse, lifting away.
  // Its base sits at the stone's middle, so it rises OUT of the stone into the air
  // and never lies over the glyph at full strength.
  const grow = easeOutCubic(span(t, 15, 210))
  const lift = s * 1.1 * easeInCubic(span(t, hit + 60, end - 60))
  const colH = s * 1.5 * grow * q
  const colA = span(t, 15, 80) * (1 - span(t, hit + 140, end - 30))
  if (colH > 1 && colA > 0.01) {
    const cy = y + s * 0.05 - lift - colH / 2
    if (mends) blit(ctx, columnHeal(s * 1.6), x, cy, s * 0.6 * q, colH, colA * 0.6)
    blit(ctx, columnGold(s * 1.6), x, cy, s * 0.3 * q, colH * 0.94, colA * 0.85)
  }

  // The pulse: a ring closing INTO the stone, a plus-shaped flare standing over it.
  if (t >= hit - 40) {
    const ki = span(t, hit - 40, hit + 120)
    if (ki < 1) {
      const r = s * (0.62 - 0.44 * easeInCubic(ki)) * q
      const d = (r / 0.78) * 2
      blit(ctx, mends ? ringHeal(s * 2) : ringGold(s * 2), x, y, d, d, bump(ki) * 0.95)
    }
    const k2 = span(t, hit, hit + 200)
    if (k2 < 1) {
      const fa = Math.pow(1 - k2, 1.6)
      const fs = s * (0.8 + 0.55 * easeOutCubic(k2)) * q
      blit(ctx, mends ? flareHeal(s * 3) : flareGold(s * 3), x, y - s * 0.1, fs, fs * 1.1, fa * (mends ? 0.7 : 0.5))
      blit(ctx, mends ? glowHeal(s * 2) : glowGold(s * 2), x, y, s * 0.95, s * 0.95, fa * 0.26)
    }
  }

  // The stone takes a breath as it is mended.
  const sw = bump(span(t, hit, hit + 190))
  if (sw > 0) api.pose(e.to.id, 0, -s * 0.02 * sw, 1 + 0.06 * sw * q, 1 + 0.06 * sw * q)
  else if (t >= hit + 190 && t < hit + 260) api.pose(e.to.id, 0, 0, 1, 1)

  // A last few pluses drifting up while the column lifts.
  if (api.canEmit && api.tier >= 1 && t > hit && t < hit + 320 && Math.random() < 0.45 * qualityMul()) {
    pluses(x, y - s * 0.1, s, 1, mends, 0.8, 0.9)
  }
}

// ─── Buff ───────────────────────────────────────────────────────────────────

const paintBuff = (e: Buff, p: number, api: FxApi): void => {
  const ctx = api.ctx
  const s = api.size
  const t = p * e.dur
  const end = e.dur + BUFF_TAIL
  const x = api.cx(e.to.col, e.to.row)
  const y = api.cy(e.to.col, e.to.row)
  const foot = y + s * 0.32
  // A heal on the same stone right now: let its light lead.
  const healedMs = api.now - (healedAt.get(e.to.id) ?? -1e9)
  const yieldTo = healedMs >= 0 && healedMs < 60 ? 0.5 : 1

  // The spark from the cross: quick, direct.
  layArc(e, api)
  paintArc(ctx, easeInOutCubic(span(t, 0, BUFF_HIT - 15)), s, api.tier, 0.85)

  // The surge column shooting up through the stone.
  const kc = span(t, BUFF_HIT - 25, BUFF_HIT + 230)
  if (kc > 0 && kc < 1) {
    const h = s * 1.8 * easeOutCubic(Math.min(1, kc * 2.2))
    const lift = s * 0.9 * easeInCubic(kc)
    blit(ctx, columnGold(s * 1.6), x, foot - lift - h / 2, s * 0.32, h, bump(kc) * yieldTo)
  }

  // Chevrons climbing through the stone, one after another.
  const chev = chevron(s * 1.4)
  for (let i = 0; i < 3; i++) {
    const t0 = 20 + i * 42
    const ph = span(t, t0, t0 + 280)
    if (ph <= 0 || ph >= 1) continue
    const cy = foot + s * 0.05 - s * 1.15 * easeOutCubic(ph)
    const w = s * (0.5 + 0.2 * ph)
    const a = Math.pow(bump(Math.min(1, ph * 1.1)), 0.6) * (1 - span(t, end - 120, end))
    blit(ctx, chev, x, cy, w, w, a)
  }

  // A gold shock ring on the floor as the surge lands.
  const kr = span(t, BUFF_HIT, BUFF_HIT + 210)
  if (kr > 0 && kr < 1) {
    const w = s * (0.5 + 0.8 * easeOutCubic(kr))
    floor(ctx, ringGold(s * 2.4), x, foot, w, w * 0.4, (1 - kr) * 0.95)
  }

  // Honed: a star glint catching the stone's shoulder.
  const kg = span(t, BUFF_HIT, BUFF_HIT + 240)
  if (kg > 0 && kg < 1) {
    const gs = s * (0.78 - 0.36 * kg)
    blit(ctx, glint(s * 2), x + s * 0.22, y - s * 0.26, gs, gs, Math.pow(1 - kg, 1.2), true, kg * 1.3)
  }
  // …and a warm glow that stays on it for the round.
  const warm = span(t, BUFF_HIT - 20, BUFF_HIT + 40) * (1 - span(t, BUFF_HIT + 120, end - 20))
  if (warm > 0.01) blit(ctx, glowGold(s * 2), x, y, s * 0.95, s * 0.95, warm * 0.26 * yieldTo * yieldTo)

  // The stone stretches tall with it.
  const sk = bump(span(t, BUFF_HIT, BUFF_HIT + 200))
  if (sk > 0) api.pose(e.to.id, 0, -s * 0.03 * sk, 1 - 0.05 * sk, 1 + 0.1 * sk)
  else if (t >= BUFF_HIT + 200 && t < BUFF_HIT + 260) api.pose(e.to.id, 0, 0, 1, 1)
}
