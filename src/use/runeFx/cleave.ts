import type { Hit } from '@/game/rules'
import type { FxApi, RuneEvent, RuneFx, Shot } from './types'
import { blit, count, dirAngle, easeOutCubic, easeInQuad, hash01, poolSprite, spawn, spawnChips, span } from './kit'
import {
  CHAR, CORE, DEEP, EMBER, EMBER_KEY, GOLD, GOLD_KEY, HOT, SMOKE, emberSprite, fanRadius, fillBlade, fillFan, fissureCharSprite,
  fissureCoolSprite, fissureHotSprite, flameSprite, glowCoreSprite, glowEmberSprite, glowGoldSprite, glowHotSprite,
  goldSprite, hotChipSprite, pinSprite
} from './cleave.draw'

/**
 * ─── Axe (`cleave`) — the burning fan across the three tiles ahead ──────────
 *
 * Events: `shot` with `weapon: 'cleave'`. `path` is the three-tile fan in
 * front of the axe (the tile it faces and its two neighbours across the
 * rank), `hits` every rune in it. Never intercepted: a shield inside the fan
 * is struck like anything else.
 *
 * The arc is centred on the FACING (`e.from.dir`), not on the last cell of the
 * path — that cell is a corner of the fan.
 *
 * The LOOK is WEIGHT. Where the sword is a flick, the axe is a heave:
 *
 *   0 – 30 %   the wind-up: the stone hauls back and to one side and coils;
 *              heat gathers on it and the axe head rises, glowing, at the
 *              end of the fan the swing will start from.
 *   30 – 54 %  the swing, accelerating: a WIDE burning band — ember red
 *              under molten orange under a white-gold edge, flames licking
 *              off its back — sweeps round the axe across all three tiles,
 *              shedding embers, the stone lunging behind it.
 *   54 %       the slam: the whole arc flashes white-hot over all three
 *              tiles at once, a heat front rolls forward off it, the ground
 *              splits into glowing fissures round every tile of the fan, and
 *              each struck stone throws gold sparks, heavy embers and chips
 *              with burning rims (an empty tile: sparks, grit and soot). A
 *              strong shake for a fan that hits two or more, or a Lv 2 axe.
 *   54 % →     the follow-through: the arc cools from gold to ember red and
 *              burns away from its tail, embers drift up off it, and the
 *              fissures cool and close.
 *
 * Cues: `cleave`, `cleaveHit` (`runeSfx/cleave.ts`).
 */

/** Where in the window the axe lands: later than a blade's 0.45 — the wind-up is the point. */
const IMPACT = 0.54
/** The wind-up ends here and the swing begins. */
const WIND = 0.3
const TAIL_MS = 360
/** Half the fan's sweep when both horns of the fan are on the board, radians off the facing. */
const SPAN = 1.0
/** …and how far it reaches toward a horn the board's edge cut off. */
const STUB = 0.36

// ─── Scratch ───────────────────────────────────────────────────────────────

let ax = 0
let ay = 0
let face = 0
let fx = 0
let fy = 0
/** The fan's scale, px: the tile ahead sits at `reach`. */
let reach = 0
/** Where the swing starts and ends, radians off the facing. */
let th0 = 0
let th1 = 0
/** The two ends of the fan whatever the swing's direction. */
let thL = 0
let thR = 0
/** +1: the swing runs toward the facing's clockwise side; −1 the other way. */
let sgn = 1

const aimFan = (e: Shot, api: FxApi): void => {
  ax = api.cx(e.from.col, e.from.row)
  ay = api.cy(e.from.col, e.from.row)
  face = dirAngle(e.from.dir)
  fx = Math.cos(face)
  fy = Math.sin(face)
  // Which horns of the fan are on the board? (+ = the clockwise side.)
  let hasL = false
  let hasR = false
  for (let i = 0; i < e.path.length; i++) {
    const c = e.path[i]!
    const s = (c.col - e.from.col) * -fy + (c.row - e.from.row) * fx
    if (s < -0.5) hasL = true
    else if (s > 0.5) hasR = true
  }
  // An axe facing off the board still swings — short, across its own front.
  reach = api.size * (e.path.length === 0 ? 0.55 : e.from.level >= 2 ? 1.05 : 1)
  thL = hasL ? -SPAN : -STUB
  thR = hasR ? SPAN : STUB
  sgn = (e.from.id & 1) === 0 ? 1 : -1
  th0 = sgn > 0 ? thL : thR
  th1 = sgn > 0 ? thR : thL
}

/** Pose a stone along the facing: `o` tiles forward, `lat` tiles clockwise-sideways, `st` stretch along the axis. */
const poseAlong = (api: FxApi, id: number, o: number, lat: number, st: number): void => {
  const size = api.size
  const cross = 1 / Math.sqrt(st)
  const horizontal = Math.abs(fx) > Math.abs(fy)
  api.pose(id, (fx * o - fy * lat) * size, (fy * o + fx * lat) * size, horizontal ? st : cross, horizontal ? cross : st)
}

/** Where the axe stone sits this frame (for the heat to ride it). */
let stoneX = 0
let stoneY = 0

// The per-frame emitters' options, one object each, rewritten in place (the
// per-frame path allocates nothing of its own).
const GATHER = { shape: 2, drag: 0.5 } as const
const FLUNG: { shape: 6; sprite: number; gravity: number; drag: number; fade: 1 } = { shape: 6, sprite: -1, gravity: 0, drag: 1.8, fade: 1 }
const WAKE: { shape: 6; sprite: number; gravity: number; drag: number; fade: 1 } = { shape: 6, sprite: -1, gravity: 0, drag: 1.2, fade: 1 }

/** Haul back, heave, slam, settle. */
const actAxe = (e: Shot, p: number, api: FxApi): void => {
  const size = api.size
  if (p >= 0.98) {
    stoneX = ax
    stoneY = ay
    api.pose(e.from.id, 0, 0, 1, 1)
    return
  }
  const side0 = th0 > 0 ? 1 : -1
  let o: number
  let lat: number
  let st: number
  if (p < WIND) {
    const w = easeOutCubic(p / WIND)
    o = -0.19 * w
    lat = 0.08 * w * side0
    st = 1 - 0.11 * w
  } else if (p < IMPACT) {
    const s = span(p, WIND, IMPACT)
    const e3 = s * s * s
    o = -0.19 + 0.48 * e3
    lat = 0.08 * side0 * (1 - s) - 0.04 * side0 * e3
    st = 0.89 + 0.23 * e3
  } else if (p < 0.66) {
    o = 0.29
    lat = -0.04 * side0
    st = 0.86
  } else {
    const r = easeOutCubic(span(p, 0.66, 0.98))
    o = 0.29 * (1 - r)
    lat = -0.04 * side0 * (1 - r)
    st = 0.86 + 0.14 * r
  }
  stoneX = ax + (fx * o - fy * lat) * size
  stoneY = ay + (fy * o + fx * lat) * size
  poseAlong(api, e.from.id, o, lat, st)
}

// ─── The swing ─────────────────────────────────────────────────────────────

const paintAxe = (e: Shot, p: number, api: FxApi): void => {
  aimFan(e, api)
  actAxe(e, p, api)
  const ctx = api.ctx
  const size = api.size
  const tier = api.tier
  const lv2 = e.from.level >= 2
  const segs = tier === 2 ? 22 : tier === 1 ? 14 : 10

  // ── The wind-up: heat gathering on the stone, the head raised ──
  const wk = easeOutCubic(span(p, 0, WIND))
  const sk = span(p, WIND, IMPACT)
  if (p < IMPACT + 0.1) {
    const fade = 1 - span(p, IMPACT - 0.05, IMPACT + 0.1)
    blit(ctx, glowCoreSprite(), stoneX, stoneY, size * (0.8 + 0.5 * wk), size * (0.8 + 0.5 * wk), 0.6 * wk * fade)
  }
  // The head: drawn back over the stone's shoulder on the side the swing
  // starts from, glowing hotter as it goes; then flung round, close in while
  // it is still behind the fan, out onto the arc once it is inside it.
  const e2 = Math.pow(sk, 1.7)
  const thRaise = th0 - sgn * 0.95
  const thH = sk > 0 ? thRaise + (th1 - thRaise) * e2 : th0 - sgn * 0.95 * wk
  if (p < IMPACT) {
    const before = sgn * (th0 - thH)
    const inside = sk > 0 ? 1 - Math.min(1, Math.max(0, before / 0.6)) : 0
    const thC = thH < thL ? thL : thH > thR ? thR : thH
    const rH = reach * (sk > 0 ? 0.5 + (fanRadius(thC) - 0.5) * inside : 0.6 - 0.12 * wk)
    const hx = ax + Math.cos(face + thH) * rH
    const hy = ay + Math.sin(face + thH) * rH
    const a = sk > 0 ? 1 : 0.4 + 0.6 * wk
    blit(ctx, glowGoldSprite(), hx, hy, size * (0.55 + 0.35 * a), size * (0.55 + 0.35 * a), 0.8 * a)
    if (sk < 0.6) {
      // The blade itself, until the band's own head takes over.
      const bw = size * (lv2 ? 0.21 : 0.18)
      ctx.save()
      ctx.fillStyle = EMBER
      ctx.globalAlpha = 0.9 * a
      fillBlade(ctx, ax, ay, rH, face + thH, 0.36, bw)
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = CORE
      ctx.globalAlpha = 0.95 * a
      fillBlade(ctx, ax, ay, rH, face + thH, 0.33, bw * 0.8)
      ctx.fillStyle = HOT
      ctx.globalAlpha = a
      fillBlade(ctx, ax, ay, rH + bw * 0.4, face + thH, 0.27, bw * 0.34)
      ctx.restore()
    }
    if (tier > 0) blit(ctx, pinSprite(), hx, hy, size * 0.3 * (0.6 + 0.4 * a), size * 0.3 * (0.6 + 0.4 * a), a)
    // Heat gathering: sparks drawn IN to the raised head while it coils.
    if (sk <= 0 && p > 0.04 && api.canEmit && tier === 2) {
      const n = count(2, 0)
      for (let j = 0; j < n; j++) {
        const a2 = Math.random() * Math.PI * 2
        const d = size * (0.35 + Math.random() * 0.2)
        // Launched outward-in: life short enough that they die on arrival.
        spawn(hx + Math.cos(a2) * d, hy + Math.sin(a2) * d, -Math.cos(a2) * d * 4.5, -Math.sin(a2) * d * 4.5, 200,
          size * (0.03 + Math.random() * 0.02), GOLD, GATHER)
      }
    }
    // Embers flung off the head as it comes round.
    if (sk > 0.05 && api.canEmit && tier > 0) {
      FLUNG.sprite = poolSprite(EMBER_KEY, emberSprite)
      FLUNG.gravity = -size * 0.6
      const n = count(2, 0)
      const back = face + thH - sgn * Math.PI / 2
      for (let j = 0; j < n; j++) {
        const a2 = back + (Math.random() - 0.5) * 0.9
        const v = size * (0.6 + Math.random() * 0.9)
        spawn(hx, hy, Math.cos(a2) * v, Math.sin(a2) * v - size * 0.3, 350 + Math.random() * 300, size * (0.04 + Math.random() * 0.03), CORE, FLUNG)
      }
    }
  }

  // ── The burning band ──
  // During the swing it grows from the start of the fan to the head; at the
  // slam it spans the whole fan; then it burns away from its tail.
  let tail = th0
  let head = th1
  if (p < IMPACT) head = sgn > 0 ? Math.max(th0, thH) : Math.min(th0, thH)
  else tail = th0 + (th1 - th0) * easeInQuad(span(p, IMPACT + 0.05, 1.3))
  const alive = 1 - span(p, IMPACT + 0.25, 1.45)
  const cool = span(p, IMPACT + 0.02, 1.15)
  const flash = p >= IMPACT ? 1 - span(p, IMPACT, IMPACT + 0.13) : 0
  const W = size * (lv2 ? 0.3 : 0.24) * (p < IMPACT ? 0.55 + 0.45 * Math.min(1, sk * 1.4) : 0.45 + 0.55 * alive)
  if (sk > 0 && alive > 0 && Math.abs(head - tail) > 0.02) {
    ctx.save()
    // An ember-red bed, painted (so the fire keeps its colour on a pale stone)…
    ctx.fillStyle = EMBER
    ctx.globalAlpha = 0.6 * alive
    fillFan(ctx, ax, ay, face, reach, 0, tail, head, W, 0.5, 1.5, 1.2, segs)
    // …and the light over it.
    ctx.globalCompositeOperation = 'lighter'
    if (tier === 2) {
      ctx.fillStyle = CORE
      ctx.globalAlpha = 0.22 * alive
      fillFan(ctx, ax, ay, face, reach, 0, tail, head, W * 2.3, 1.1, 1.0, 1.2, segs)
    }
    ctx.fillStyle = CORE
    ctx.globalAlpha = 0.9 * alive * (1 - cool * 0.6)
    fillFan(ctx, ax, ay, face, reach, 0, tail, head, W, 0.5, 1, 1.25, segs)
    if (tier === 2) {
      // Whose axe it is: a thin rim of the attacker's colour on the inside edge.
      ctx.fillStyle = api.sideColor(e.from.side, e.from.faction)
      ctx.globalAlpha = 0.45 * alive
      fillFan(ctx, ax, ay, face, reach, 0, tail, head, W, -0.8, 1.02, 1.25, segs)
    }
    if (cool > 0) {
      ctx.fillStyle = DEEP
      ctx.globalAlpha = 0.5 * alive * cool
      fillFan(ctx, ax, ay, face, reach, 0, tail, head, W, 0.5, 1, 1.25, segs)
    }
    if (tier > 0) {
      const hot = p < IMPACT ? 1 : 1 - span(p, IMPACT, IMPACT + 0.4)
      if (hot > 0) {
        ctx.fillStyle = HOT
        ctx.globalAlpha = 0.95 * hot * alive
        fillFan(ctx, ax, ay, face, reach, W * 0.2, tail, head, W * 0.42, 0.7, 0.35, 1.35, segs)
      }
    }
    // The slam: the whole arc goes white for a frame or two.
    if (flash > 0) {
      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = flash
      fillFan(ctx, ax, ay, face, reach, W * 0.1, tail, head, W * 0.8, 0.6, 0.7, 1.2, segs)
    }
    ctx.restore()

    // Flames licking back off the band (per frame, so the top tier only).
    if (tier === 2) {
      const fl = flameSprite()
      if (fl) {
        const frame = Math.floor(api.now / 45)
        const n = lv2 ? 9 : 7
        const heat = p < IMPACT ? 1 : alive * (1 - cool * 0.5)
        for (let i = 0; i < n; i++) {
          const u = 0.08 + 0.86 * (i / (n - 1))
          const th = tail + (head - tail) * u
          const rr = reach * fanRadius(th) + W * 0.2
          const bx = ax + Math.cos(face + th) * rr
          const by = ay + Math.sin(face + th) * rr
          const flick = 0.65 + 0.35 * hash01(frame * 13 + i * 7 + e.from.id)
          const len = size * (0.26 + 0.2 * Math.sin(Math.PI * u)) * flick * (0.5 + 0.5 * heat)
          // Trailing the stroke, leaning out from the axe.
          const fa = face + th - sgn * 1.05
          blit(ctx, fl, bx + Math.cos(fa) * len * 0.42, by + Math.sin(fa) * len * 0.42, len, len * 0.62, 0.9 * heat, true, fa)
        }
      }
    }
  }

  if (p < IMPACT) return

  // ── After the slam ──
  // The heat front: a thin gold arc rolling forward off the band.
  const k3 = span(p, IMPACT, IMPACT + 0.5)
  if (k3 < 1 && tier > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = GOLD
    ctx.globalAlpha = 0.75 * (1 - k3)
    fillFan(ctx, ax, ay, face, reach, size * (0.1 + 0.4 * easeOutCubic(k3)), thL, thR, W * 0.34 * (1 - k3 * 0.5), 0.6, 0.6, 1, segs)
    ctx.restore()
  }
  // The slam's light on every tile of the fan, and the ground splitting under it.
  const g = easeOutCubic(span(p, IMPACT, IMPACT + 0.18))
  const heat = 1 - span(p, IMPACT + 0.15, 1.75)
  const gone = 1 - span(p, 1.35, Math.min(2.1, 1 + TAIL_MS / Math.max(1, e.dur) - 0.02))
  const S = size * (lv2 ? 1.18 : 1.02) * (0.5 + 0.5 * g)
  for (let i = 0; i < e.path.length; i++) {
    const c = e.path[i]!
    const cx = api.cx(c.col, c.row)
    const cy = api.cy(c.col, c.row)
    const a = Math.atan2(cy - ay, cx - ax)
    const v = (e.from.id + i) % 3
    if (gone > 0) {
      blit(ctx, fissureCharSprite(v), cx, cy + size * 0.05, S, S, 0.55 * gone, false, a)
      blit(ctx, fissureHotSprite(v), cx, cy + size * 0.05, S, S, heat * gone, true, a)
      if (heat < 1) blit(ctx, fissureCoolSprite(v), cx, cy + size * 0.05, S, S, (1 - heat) * gone * 0.9, true, a)
    }
    if (flash > 0) {
      blit(ctx, glowHotSprite(), cx, cy, size * 1.05, size * 1.05, flash * 0.55)
    }
    const burn = 1 - span(p, IMPACT, IMPACT + 0.6)
    if (burn > 0 && tier > 0) blit(ctx, glowEmberSprite(), cx, cy + size * 0.1, size * 1.2, size * 0.9, burn * 0.45)
  }

  // The ember wake: embers peeling up off the cooling band (top tier only).
  if (tier === 2 && api.canEmit && alive > 0.05 && p < 1.15) {
    WAKE.sprite = poolSprite(GOLD_KEY, goldSprite)
    WAKE.gravity = -size * 0.4
    const n = count(2, 0)
    for (let j = 0; j < n; j++) {
      const th = tail + (head - tail) * Math.random()
      const rr = reach * fanRadius(th)
      spawn(ax + Math.cos(face + th) * rr, ay + Math.sin(face + th) * rr, (Math.random() - 0.5) * size * 0.4, -size * (0.4 + Math.random() * 0.6),
        400 + Math.random() * 300, size * (0.03 + Math.random() * 0.025), GOLD, WAKE)
    }
  }
}

// ─── The slam's debris ─────────────────────────────────────────────────────

const burstStone = (h: Hit, hx: number, hy: number, a: number, api: FxApi, lv2: boolean): void => {
  const size = api.size
  const more = lv2 ? 1.3 : 1
  const ember = poolSprite(EMBER_KEY, emberSprite)
  const gold = poolSprite(GOLD_KEY, goldSprite)
  // Gold sparks, driven on through the stone.
  const ns = count(12 * more)
  for (let j = 0; j < ns; j++) {
    const b = a + (Math.random() - 0.5) * 2.2
    const v = size * (2.4 + Math.random() * 3)
    spawn(hx, hy, Math.cos(b) * v, Math.sin(b) * v - size * 0.6, 180 + Math.random() * 200, size * (0.03 + Math.random() * 0.028), GOLD,
      { shape: 2, gravity: size * 6, drag: 2.4 })
  }
  // Heavy embers: thrown up, and falling back.
  const ne = count(5 * more)
  for (let j = 0; j < ne; j++) {
    const b = a + (Math.random() - 0.5) * 2.6
    const v = size * (1.1 + Math.random() * 1.6)
    spawn(hx, hy, Math.cos(b) * v, Math.sin(b) * v - size * 1.6, 460 + Math.random() * 280, size * (0.05 + Math.random() * 0.035), CORE,
      { shape: 6, sprite: ember, gravity: size * 5, drag: 1.2, fade: 1 })
  }
  // Chips of the stone, their edges burning.
  const stone = api.stoneOf(h.target)
  const chip = poolSprite(`cleave.chip|${stone}`, () => hotChipSprite(stone))
  const nc = count(4 * more)
  for (let j = 0; j < nc; j++) {
    const b = a + (Math.random() - 0.5) * 2.4
    const v = size * (1.3 + Math.random() * 1.8)
    spawn(hx, hy, Math.cos(b) * v, Math.sin(b) * v - size * 1.7, 420 + Math.random() * 260, size * (0.07 + Math.random() * 0.045), stone,
      { additive: false, shape: chip >= 0 ? 4 : 1, sprite: chip, gravity: size * 9, drag: 0.8, vrot: (Math.random() - 0.5) * 14, fade: 2 })
  }
  // The wake: a few embers that drift UP and hang.
  const nw = count(3 * more)
  for (let j = 0; j < nw; j++) {
    spawn(hx + (Math.random() - 0.5) * size * 0.5, hy + (Math.random() - 0.3) * size * 0.3, (Math.random() - 0.5) * size * 0.35, -size * (0.35 + Math.random() * 0.5),
      650 + Math.random() * 350, size * (0.03 + Math.random() * 0.022), GOLD, { shape: 6, sprite: gold, gravity: -size * 0.5, drag: 1.1, fade: 1 })
  }
}

/** A tile of the fan with nobody on it still takes the blow: sparks, grit and a split in the ground. */
const burstGround = (hx: number, hy: number, a: number, api: FxApi): void => {
  const size = api.size
  const ember = poolSprite(EMBER_KEY, emberSprite)
  const ns = count(5)
  for (let j = 0; j < ns; j++) {
    const b = a + (Math.random() - 0.5) * 1.8
    const v = size * (1.8 + Math.random() * 2.2)
    spawn(hx, hy + size * 0.1, Math.cos(b) * v, Math.sin(b) * v - size * 0.8, 160 + Math.random() * 160, size * (0.028 + Math.random() * 0.02), GOLD,
      { shape: 2, gravity: size * 6, drag: 2.4 })
  }
  const ne = count(4)
  for (let j = 0; j < ne; j++) {
    const b = a + (Math.random() - 0.5) * 2.4
    const v = size * (0.8 + Math.random() * 1.2)
    spawn(hx, hy + size * 0.1, Math.cos(b) * v, Math.sin(b) * v - size * 1.2, 450 + Math.random() * 300, size * (0.04 + Math.random() * 0.03), CORE,
      { shape: 6, sprite: ember, gravity: size * 5, drag: 1.2, fade: 1 })
  }
  spawnChips(hx, hy + size * 0.1, size, CHAR, a, 3)
  // Soot off the scorch — only where no stone stands in it.
  const nk = count(2)
  for (let j = 0; j < nk; j++) {
    spawn(hx + (Math.random() - 0.5) * size * 0.4, hy + size * 0.1, (Math.random() - 0.5) * size * 0.2, -size * (0.3 + Math.random() * 0.3),
      520 + Math.random() * 260, size * (0.1 + Math.random() * 0.05), SMOKE, { additive: false, shape: 3, alpha: 0.26, drag: 1.2, grow: 1 })
  }
}

// ─── The module ────────────────────────────────────────────────────────────

export const cleave: RuneFx = {
  type: 'cleave',
  palette: { core: CORE, hot: HOT, deep: DEEP, accent: GOLD },

  impactAt: (e) => (e.kind === 'shot' ? IMPACT : undefined),

  tailMs: (e) => (e.kind === 'shot' ? TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    api.pose(e.from.id, 0, 0, 1, 1)
    api.sound('cleave', 0.9, { x: api.cx(e.from.col, e.from.row), level: e.from.level, side: e.from.side })
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind === 'shot') paintAxe(e, p, api)
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    aimFan(e, api)
    const size = api.size
    const lv2 = e.from.level >= 2
    const n = e.hits.length
    api.sound('cleaveHit', n > 0 ? 0.95 : 0.5, { x: ax + fx * size, level: e.from.level, side: e.from.side })
    api.shake(n >= 2 || lv2 ? 'strong' : 'small')
    for (let i = 0; i < e.path.length; i++) {
      const c = e.path[i]!
      const hx = api.cx(c.col, c.row)
      const hy = api.cy(c.col, c.row)
      const a = Math.atan2(hy - ay, hx - ax)
      let h: Hit | null = null
      for (let j = 0; j < n; j++) {
        const t = e.hits[j]!.target
        if (t.col === c.col && t.row === c.row) { h = e.hits[j]!; break }
      }
      if (h) burstStone(h, hx, hy, a, api, lv2)
      else burstGround(hx, hy, a, api)
    }
  }
}
