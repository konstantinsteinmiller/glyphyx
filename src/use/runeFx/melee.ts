import { intercepted, type FxApi, type Knockback, type RuneEvent, type RuneFx, type Shot } from './types'
import {
  blit, clamp01, count, dirAngle, easeInQuad, easeOutCubic, easeOutQuad, poolSprite, spawn, spawnChips, span
} from './kit'
import {
  CORE, DEEP, DUST, EMBER_KEY, HOT, SCUFF, SPARK, STEEL, emberSprite, fillBand, glintSteelSprite, glowCoreSprite,
  glowHotSprite, glowWhiteSprite, pinSprite, ringCoreSprite, slitSprite, sliverSprite, streakCoreSprite
} from './melee.draw'

/**
 * ─── Sword (`melee`) — the blade, and its Lv 2 shove ────────────────────────
 *
 * Events: `shot` with `weapon: 'blade'` (the swing at the tile it faces) and
 * `knockback` (a Lv 2 sword pushing its surviving target one tile back — the
 * renderer slides the stone; this draws the shove).
 *
 * The LOOK is one fast, clean CRESCENT. In 240 ms:
 *
 *   0 – 14 %   the coil: the stone draws back a hair and a steel glint winks
 *              on it — the only warning a sword gives.
 *   14 – 45 %  the lunge, and the crescent whipping across the target: a thin
 *              crimson band with a white-hot cutting edge, its belly toward the
 *              head, an afterimage smear (tinted the attacker's side) behind.
 *   45 %       the blow: a hair-thin slash-cut line flashes straight across
 *              the stone along the crescent's chord — the sword's signature —
 *              with a white pop, a directional fan of white-hot sparks along
 *              the blade's path, steel slivers, a few crimson embers and chips
 *              of the struck stone. Lv 2 adds a crimson shock ring.
 *   45 % →     the recoil, the cut closing to nothing, the crescent peeling
 *              away from its tail.
 *
 * A blow that lands on a SHIELD stone (or is eaten whole by a shield) is
 * turned: no cut, no chips — the sparks spray back off the barrier and the
 * shield module draws the wall.
 *
 * The shove is the same crescent language: a crimson bow wave pressed against
 * the stone's back, speed lines, two skid marks and the dust of the stop.
 *
 * Cues: `slash`, `slashHit`, `knockback` (`runeSfx/melee.ts`).
 */

/** Where in the window the blade lands (the renderer's default for a blade). */
const IMPACT = 0.45
/** How long the crescent, the cut and the shove keep painting past the window. */
const BLADE_TAIL_MS = 240
const SHOVE_TAIL_MS = 300

// ─── Scratch (the per-frame path allocates nothing) ────────────────────────

/** The blow's geometry for the event being painted: filled by `aim`. */
let ax = 0
let ay = 0
let tx = 0
let ty = 0
let fx = 0
let fy = 0
let ang = 0
/** +1 / −1: which way this blade cuts (fixed per rune, so a stone always swings the same way). */
let sgn = 1
/** A swing at nothing (a sword on the board's edge, facing off it): smaller, on its own tile. */
let whiff = false

const aim = (e: Shot, api: FxApi): void => {
  ax = api.cx(e.from.col, e.from.row)
  ay = api.cy(e.from.col, e.from.row)
  const last = e.path[e.path.length - 1]
  whiff = !last
  if (last) {
    tx = api.cx(last.col, last.row)
    ty = api.cy(last.col, last.row)
    ang = Math.atan2(ty - ay, tx - ax)
  } else {
    ang = dirAngle(e.from.dir)
    tx = ax + Math.cos(ang) * api.size * 0.3
    ty = ay + Math.sin(ang) * api.size * 0.3
  }
  fx = Math.cos(ang)
  fy = Math.sin(ang)
  sgn = (e.from.id & 1) === 0 ? 1 : -1
}

/** Does this blow cut stone, or is it turned by a barrier (a shield stone, or a shield that ate all of it)? */
const turned = (e: Shot): boolean => {
  if (intercepted(e)) return true
  if (e.hits.length === 0) return false
  for (let i = 0; i < e.hits.length; i++) if (e.hits[i]!.amount > 0) return false
  return true
}

/** Pose a stone along its own axis: `o` tiles of offset, `st` stretch along the axis. */
const poseAlong = (api: FxApi, id: number, o: number, st: number): void => {
  const size = api.size
  const cross = 1 / Math.sqrt(st)
  const horizontal = Math.abs(fx) > Math.abs(fy)
  api.pose(id, fx * o * size, fy * o * size, horizontal ? st : cross, horizontal ? cross : st)
}

/** Where the sword stone sits this frame, in tiles along its facing (for the glint to ride it). */
let lungeO = 0

/** The shove's per-frame dust: one options object for every puff (the per-frame path allocates nothing). */
const SLIDE_DUST = { additive: false, shape: 3, alpha: 0.3, drag: 2.6, grow: 1 } as const

/** Coil, lunge, contact, recoil — returns nothing, leaves `lungeO` set. */
const actBlade = (e: Shot, p: number, api: FxApi): void => {
  if (p >= 0.98) {
    lungeO = 0
    api.pose(e.from.id, 0, 0, 1, 1)
    return
  }
  let o: number
  let st = 1
  if (p < 0.14) {
    const k = easeOutQuad(p / 0.14)
    o = -0.08 * k
    st = 1 - 0.06 * k
  } else if (p < 0.43) {
    // Accelerating INTO the blow: the stone is still travelling when it lands.
    const k = easeInQuad(span(p, 0.14, 0.43))
    o = -0.08 + 0.4 * k
    st = 0.94 + 0.18 * k
  } else if (p < 0.52) {
    // Contact: a hard stop, squashed against the target.
    o = 0.32
    st = 0.9
  } else if (p < 0.8) {
    const k = easeOutCubic(span(p, 0.52, 0.8))
    o = 0.32 - 0.38 * k
    st = 0.9 + 0.1 * k
  } else {
    o = -0.06 * (1 - span(p, 0.8, 0.98))
  }
  lungeO = o
  poseAlong(api, e.from.id, o, st)
}

// ─── The swing ─────────────────────────────────────────────────────────────

const paintBlade = (e: Shot, p: number, api: FxApi): void => {
  aim(e, api)
  actBlade(e, p, api)
  const ctx = api.ctx
  const size = api.size
  const tier = api.tier
  const lv2 = e.from.level >= 2
  const hit = e.hits.length > 0

  // ── The coil's glint: steel winking on the blade before it moves. ──
  if (p < 0.34 && tier > 0) {
    const g = Math.sin(clamp01(p / 0.34) * Math.PI)
    const sx = ax + fx * lungeO * size + fx * size * 0.16 - fy * size * 0.14 * sgn
    const sy = ay + fy * lungeO * size + fy * size * 0.16 + fx * size * 0.14 * sgn
    blit(ctx, glowHotSprite(), sx, sy, size * 0.42 * g, size * 0.42 * g, g * 0.35)
    blit(ctx, glintSteelSprite(), sx, sy, size * 0.5 * g, size * 0.5 * g, g, true, p * 5)
  }

  // ── The crescent ──
  //
  // An arc whose APEX sits on the target's centre and whose ends curl back
  // toward the attacker, tilted off the line of the blow so it cuts on the
  // diagonal. The head sweeps from one end to the other, crossing the apex
  // exactly at the blow; the tail then peels away behind it.
  const R = size * (whiff ? 0.4 : lv2 ? 0.76 : 0.68)
  const nA = ang + sgn * 0.42
  const ccx = tx - Math.cos(nA) * R
  const ccy = ty - Math.sin(nA) * R
  const H = 1.0
  const a0 = nA - sgn * H
  const a1 = nA + sgn * H
  const sw = span(p, 0.32, 0.58)
  const sk = sw * sw * (3 - 2 * sw)
  const head = a0 + (a1 - a0) * sk
  const tail = a0 + (a1 - a0) * easeInQuad(span(p, 0.54, 1.05))
  const vis = 1 - span(p, 0.72, 1.2)
  const w = size * (whiff ? 0.12 : lv2 ? 0.22 : 0.185) * (0.5 + 0.5 * vis)
  if (sw > 0 && vis > 0 && Math.abs(head - tail) > 0.03) {
    const segs = tier === 2 ? 18 : tier === 1 ? 12 : 8
    ctx.save()
    // The crimson is PAINT, not light: laid source-over so it holds its
    // colour on a pale stone (additive crimson on beige is white).
    if (tier === 2) {
      // The afterimage smear: two ghosts of the blade lagging behind the
      // head, inside the crescent — the second in the attacker's own colour.
      const lag = sgn * 0.34 * (1 - span(p, 0.58, 0.8))
      ctx.fillStyle = api.sideColor(e.from.side, e.from.faction)
      ctx.globalAlpha = 0.22 * vis
      fillBand(ctx, ccx, ccy, R * 0.8, tail, head - lag * 2, w * 0.55, 0.3, 1, 1.5, segs)
      ctx.fillStyle = CORE
      ctx.globalAlpha = 0.3 * vis
      fillBand(ctx, ccx, ccy, R * 0.9, tail, head - lag, w * 0.75, 0.3, 1, 1.5, segs)
    }
    if (tier > 0) {
      // A soft inner falloff: the band's colour bleeding back toward the hilt.
      ctx.fillStyle = CORE
      ctx.globalAlpha = 0.32 * vis
      fillBand(ctx, ccx, ccy, R, tail, head, w, 0.3, 2.3, 1.5, segs)
    }
    ctx.fillStyle = CORE
    ctx.globalAlpha = 0.92 * vis
    fillBand(ctx, ccx, ccy, R, tail, head, w, 0.3, 1, 1.6, segs)
    // Light on top: a crimson halo, then the white-hot cutting edge riding
    // the outer rim.
    ctx.globalCompositeOperation = 'lighter'
    if (tier === 2) {
      ctx.fillStyle = CORE
      ctx.globalAlpha = 0.2 * vis
      fillBand(ctx, ccx, ccy, R, tail, head, w * 2.4, 0.7, 1.1, 1.6, segs)
    }
    if (tier > 0) {
      ctx.fillStyle = HOT
      ctx.globalAlpha = 0.9 * vis
      fillBand(ctx, ccx, ccy, R + w * 0.2, tail, head, w * 0.42, 0.55, 0.3, 1.7, segs)
      ctx.fillStyle = '#ffffff'
      ctx.globalAlpha = vis
      fillBand(ctx, ccx, ccy, R + w * 0.26, tail, head, w * 0.16, 0.6, 0.2, 1.8, segs)
    }
    ctx.restore()
    // The blade's tip, while it travels.
    if (sw < 1) {
      const hx = ccx + Math.cos(head) * R
      const hy = ccy + Math.sin(head) * R
      blit(ctx, glowCoreSprite(), hx, hy, size * 0.7, size * 0.7, 0.5)
      blit(ctx, pinSprite(), hx, hy, size * 0.34, size * 0.34, 1)
    }
  }

  // ── The blow: the cut, the pop, the ring ──
  if (hit && p >= IMPACT) {
    const k = span(p, IMPACT, IMPACT + 0.55)
    if (k < 1) {
      const blocked = turned(e)
      const cut = nA + Math.PI / 2
      if (!blocked) {
        // The cut: full length the frame after the blow, hair-thin, then it
        // closes toward its middle and goes out.
        const len = size * (lv2 ? 1.9 : 1.7) * (1 - 0.35 * easeInQuad(k))
        const thick = size * (lv2 ? 0.28 : 0.23) * Math.pow(1 - k, 2) + size * 0.016
        blit(ctx, slitSprite(), tx, ty, len, thick, 1 - easeInQuad(k), true, cut)
      }
      const f = 1 - k
      blit(ctx, glowCoreSprite(), tx, ty, size * (0.8 + 0.3 * k), size * (0.8 + 0.3 * k), f * f * f * (blocked ? 0.35 : 0.55))
      blit(ctx, glowWhiteSprite(), tx, ty, size * 0.45, size * 0.45, f * f * f * f)
      if (lv2 && tier > 0 && !blocked) {
        const k2 = span(p, IMPACT, IMPACT + 0.32)
        if (k2 < 1) {
          const rr = size * (0.2 + 0.42 * easeOutCubic(k2))
          blit(ctx, ringCoreSprite(), tx, ty, rr / 0.78 * 2, rr / 0.78 * 2, (1 - k2) * 0.85)
        }
      }
    }
  }
}

// ─── The blow's debris ─────────────────────────────────────────────────────

const burstBlade = (e: Shot, api: FxApi): void => {
  const size = api.size
  const blocked = turned(e)
  const nA = ang + sgn * 0.42
  // The blade's own direction at the apex: sparks leave along its path.
  const along = nA + sgn * Math.PI / 2
  const spark = poolSprite(EMBER_KEY, emberSprite)
  const sliver = poolSprite('melee.sliver', sliverSprite)
  for (let i = 0; i < e.hits.length; i++) {
    const h = e.hits[i]!
    const hx = api.cx(h.target.col, h.target.row)
    const hy = api.cy(h.target.col, h.target.row)
    if (blocked) {
      // Turned by a barrier: white sparks skate back off it, toward the swing.
      const n = count(14)
      for (let j = 0; j < n; j++) {
        const a = ang + Math.PI + (Math.random() - 0.5) * 1.9
        const v = size * (2.2 + Math.random() * 3.2)
        spawn(hx - fx * size * 0.3, hy - fy * size * 0.3, Math.cos(a) * v, Math.sin(a) * v, 160 + Math.random() * 180,
          size * (0.03 + Math.random() * 0.025), SPARK, { shape: 2, gravity: size * 5, drag: 3 })
      }
      continue
    }
    // The fan: most of it along the blade's path, the rest down the line of the blow.
    const n = count(h.amount >= 4 ? 26 : 20)
    for (let j = 0; j < n; j++) {
      const base = j % 3 === 0 ? ang : along
      const a = base + (Math.random() - 0.5) * 1.0
      const v = size * (3 + Math.random() * 4)
      spawn(hx, hy, Math.cos(a) * v, Math.sin(a) * v, 150 + Math.random() * 190, size * (0.028 + Math.random() * 0.028), SPARK,
        { shape: 2, gravity: size * 5, drag: 3.2 })
    }
    const m = count(8)
    for (let j = 0; j < m; j++) {
      const a = along + (Math.random() - 0.5) * 1.4
      const v = size * (1.8 + Math.random() * 2.6)
      spawn(hx, hy, Math.cos(a) * v, Math.sin(a) * v, 200 + Math.random() * 220, size * (0.03 + Math.random() * 0.03), CORE,
        { shape: 2, gravity: size * 4, drag: 2.6 })
    }
    // Steel slivers, tumbling and falling.
    const s = count(6)
    for (let j = 0; j < s; j++) {
      const a = along + (Math.random() - 0.5) * 1.3
      const v = size * (1.4 + Math.random() * 2.2)
      spawn(hx, hy, Math.cos(a) * v, Math.sin(a) * v - size * 1.1, 380 + Math.random() * 260, size * (0.07 + Math.random() * 0.05), STEEL,
        { additive: false, shape: sliver >= 0 ? 4 : 1, sprite: sliver, gravity: size * 8, drag: 1, vrot: (Math.random() - 0.5) * 22, fade: 2 })
    }
    // A few crimson embers that hang in the air after it.
    const em = count(5)
    for (let j = 0; j < em; j++) {
      const a = ang + (Math.random() - 0.5) * 2.4
      const v = size * (0.5 + Math.random() * 1.2)
      spawn(hx, hy, Math.cos(a) * v, Math.sin(a) * v, 480 + Math.random() * 420, size * (0.05 + Math.random() * 0.04), CORE,
        { shape: 6, sprite: spark, gravity: -size * 0.7, drag: 1.6, fade: 1 })
    }
    spawnChips(hx, hy, size, api.stoneOf(h.target), ang, 5)
  }
}

// ─── The shove ─────────────────────────────────────────────────────────────

const paintShove = (e: Knockback, p: number, api: FxApi): void => {
  const ctx = api.ctx
  const size = api.size
  const tier = api.tier
  const x0 = api.cx(e.from.col, e.from.row)
  const y0 = api.cy(e.from.col, e.from.row)
  const x1 = api.cx(e.to.col, e.to.row)
  const y1 = api.cy(e.to.col, e.to.row)
  const d = Math.hypot(x1 - x0, y1 - y0) || 1
  const dx = (x1 - x0) / d
  const dy = (y1 - y0) / d
  const dA = Math.atan2(dy, dx)
  const k = clamp01(p)
  const m = easeOutCubic(k)
  const px = x0 + (x1 - x0) * m
  const py = y0 + (y1 - y0) * m
  const speed = (1 - k) * (1 - k)

  // Skid marks: two dark scuffs from where it stood to where its back is now.
  const reach = d * m - size * 0.3
  if (tier > 0 && reach > 0) {
    const fade = 1 - span(p, 1, 1 + SHOVE_TAIL_MS / Math.max(1, e.dur))
    if (fade > 0) {
      ctx.save()
      ctx.globalAlpha = 0.38 * fade
      ctx.strokeStyle = SCUFF
      ctx.lineCap = 'round'
      ctx.lineWidth = size * 0.035
      ctx.beginPath()
      for (let j = -1; j <= 1; j += 2) {
        const ox = -dy * size * 0.15 * j
        const oy = dx * size * 0.15 * j
        ctx.moveTo(x0 + ox + dx * size * 0.1, y0 + oy + size * 0.2 + dy * size * 0.1)
        ctx.lineTo(x0 + ox + dx * reach, y0 + oy + size * 0.2 + dy * reach)
      }
      ctx.stroke()
      ctx.restore()
    }
  }

  if (k >= 1) {
    // The stone has been MOVED to its new tile (the renderer did it at the
    // impact), but the renderer's slide keeps writing the full offset for as
    // long as the event draws — which would show it a tile past where it
    // stands. Pose it home; this paint runs after that write.
    api.pose(e.rune.id, 0, 0, 1, 1)
    return
  }
  const vis = 1 - span(k, 0.25, 0.8)
  if (vis <= 0) return

  // The bow wave: the sword's crescent slammed against the stone's back — it
  // launches with the stone and falls behind as the slide slows.
  const lagK = span(k, 0, 0.8)
  const bx = px + dx * size * (0.14 - 0.3 * lagK)
  const by = py + dy * size * (0.14 - 0.3 * lagK)
  const back = dA + Math.PI
  const r = size * (0.44 + 0.16 * lagK)
  const w = size * 0.17 * (0.35 + 0.65 * vis)
  const segs = tier === 2 ? 16 : 10
  ctx.save()
  ctx.fillStyle = CORE
  ctx.globalAlpha = 0.9 * vis
  fillBand(ctx, bx, by, r, back - 1.15, back + 1.15, w, 0.8, 0.7, 1, segs)
  ctx.globalCompositeOperation = 'lighter'
  if (tier === 2) {
    ctx.globalAlpha = 0.22 * vis
    fillBand(ctx, bx, by, r, back - 1.15, back + 1.15, w * 2.6, 1.1, 0.8, 1, segs)
  }
  if (tier > 0) {
    ctx.fillStyle = HOT
    ctx.globalAlpha = vis
    fillBand(ctx, bx, by, r + w * 0.3, back - 1, back + 1, w * 0.4, 0.6, 0.3, 1, segs)
  }
  ctx.restore()

  // Speed lines streaming off behind it, longest while it is fastest.
  if (tier > 0) {
    for (let j = -1; j <= 1; j++) {
      const off = size * 0.24 * j
      const len = size * (0.4 + 1.0 * speed) * (j === 0 ? 1.2 : 0.85)
      const hx = px - dx * size * 0.36 - dy * off
      const hy = py - dy * size * 0.36 + dx * off
      blit(ctx, streakCoreSprite(), hx - dx * len * 0.5, hy - dy * len * 0.5, len, size * (j === 0 ? 0.18 : 0.14),
        vis * (j === 0 ? 1 : 0.75), true, dA)
    }
  }

  // A little dust dragged from under it while it slides.
  if (api.canEmit && tier > 0 && k < 0.8) {
    const n = count(2, 0)
    for (let j = 0; j < n; j++) {
      const s = (Math.random() - 0.5) * size * 0.5
      spawn(px - dx * size * 0.24 - dy * s, py + size * 0.24 - dy * size * 0.24 + dx * s,
        -dx * size * (0.3 + Math.random() * 0.4) - dy * s * 0.5, -dy * size * 0.3 - size * 0.2,
        240 + Math.random() * 160, size * (0.06 + Math.random() * 0.05), DUST, SLIDE_DUST)
    }
  }
}

/** The stop: dust and grit thrown ahead of the stone as it digs in. */
const burstShove = (e: Knockback, api: FxApi): void => {
  const size = api.size
  const x0 = api.cx(e.from.col, e.from.row)
  const y0 = api.cy(e.from.col, e.from.row)
  const x1 = api.cx(e.to.col, e.to.row)
  const y1 = api.cy(e.to.col, e.to.row)
  const d = Math.hypot(x1 - x0, y1 - y0) || 1
  const dx = (x1 - x0) / d
  const dy = (y1 - y0) / d
  const n = count(7)
  for (let j = 0; j < n; j++) {
    const a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2.8
    const v = size * (0.7 + Math.random() * 1.0)
    spawn(x1 + dx * size * 0.22, y1 + size * 0.26 + dy * size * 0.22, Math.cos(a) * v, Math.sin(a) * v * 0.5 - size * 0.2,
      280 + Math.random() * 200, size * (0.07 + Math.random() * 0.06), DUST, { additive: false, shape: 3, alpha: 0.34, drag: 3, grow: 1 })
  }
  spawnChips(x1 + dx * size * 0.2, y1 + size * 0.15, size, api.stoneOf(e.rune), Math.atan2(dy, dx), 4)
}

// ─── The module ────────────────────────────────────────────────────────────

export const melee: RuneFx = {
  type: 'melee',
  palette: { core: CORE, hot: HOT, deep: DEEP, accent: STEEL },

  impactAt: (e) => (e.kind === 'shot' ? IMPACT : undefined),

  tailMs: (e) => (e.kind === 'shot' ? BLADE_TAIL_MS : e.kind === 'knockback' ? SHOVE_TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind === 'shot') {
      api.pose(e.from.id, 0, 0, 1, 1)
      api.sound('slash', 0.85, { x: api.cx(e.from.col, e.from.row), level: e.from.level, side: e.from.side })
    } else if (e.kind === 'knockback') {
      api.sound('knockback', 0.8, { x: api.cx(e.from.col, e.from.row), level: e.rune.level, side: e.rune.side })
    }
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind === 'shot') paintBlade(e, p, api)
    else if (e.kind === 'knockback') paintShove(e, p, api)
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind === 'shot') {
      if (e.hits.length === 0) return
      aim(e, api)
      const blocked = turned(e)
      api.sound('slashHit', blocked ? 0.6 : 0.9, { x: tx, level: e.from.level, side: e.from.side })
      api.shake('small')
      burstBlade(e, api)
    } else if (e.kind === 'knockback') {
      burstShove(e, api)
    }
  }
}
