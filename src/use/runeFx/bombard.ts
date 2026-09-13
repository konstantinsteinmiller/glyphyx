import type { FxApi, RuneEvent, RuneFx, Shot } from './types'
import { blit, clamp01, count, dirAngle, easeInQuad, easeOutCubic, spawn, spawnChips, span } from './kit'
import {
  ACCENT, CORE, DEEP, HOT, SMOKE, coreHot, emberAccentId, emberCoreId, fireSpr, flareSpr, glowAccent, glowCore,
  glowWhite, pitSpr, reticleSpr, ringAccent, ringCore, scorchSpr, shadowSpr, shellSpr, shrapnelId, smokeDarkSpr, smokeLitSpr,
  smokeSpr
} from './bombard.sprites'
import { SHELL_IMPACT, SHELL_LAUNCH } from './bombard.timing'

/**
 * ─── Mortar (`bombard`) — the lobbed shell ──────────────────────────────────
 *
 * Events: `shot` with `weapon: 'shell'`. The round is lobbed over the board
 * and lands three ranks away; `path` is its FOOTPRINT (every tile it
 * flattens, empty ones included), `hits` what it struck. It lands whether or
 * not it found anything — the round going off on bare stone is what teaches
 * where it reaches — so `impact` always plays. Never intercepted.
 *
 * The beat, on the event's 320 ms clock (`bombard.timing.ts`):
 *
 *   0 … LAUNCH   the CROUCH: the tube squats into its bed, magenta light
 *                gathering in the barrel.
 *   LAUNCH       the SHOT: the stone slams down (recoil) and springs back, a
 *                tongue of fire and sparks straight up, a ring of smoke blown
 *                out round the muzzle.
 *   … IMPACT     the LOB: an iron ball climbs HIGH over the board (growing as
 *                it nears the eye), its shadow crossing the floor beneath it,
 *                a burning tracer and a CORKSCREW of smoke left hanging in the
 *                air; target rings tighten on the footprint as it comes down.
 *   IMPACT       the BLAST, on every footprint tile: a white-magenta flash, a
 *                fireball on each tile, a scorch ring, shrapnel, embers, a
 *                ground shock stretched along the footprint — and over its
 *                middle the signature, a MUSHROOM: a stem and a rolling cap,
 *                fire first, then smoke lit from below, rising and spreading.
 *
 * Silhouette: a high arc, then a stem-and-cap cloud — the only thing on the
 * board that leaves the ground and the only cloud with a cap.
 *
 * Cues: `shell` (clink · thoomp · the incoming whistle), `shellHit` (the blast)
 * — `runeSfx/bombard.ts`.
 */

const LAUNCH = SHELL_LAUNCH
const IMPACT = SHELL_IMPACT
/** How long past the window the blast keeps drawing: the cloud needs it. */
const TAIL_MS = 440
/** The smoke corkscrew: one puff every STEP of the flight, each living LIFE ms. */
const STEP = 0.0625
const PUFF_LIFE = 420

/** One event's geometry, rebuilt per call into this ONE scratch object. y down, CSS px. */
const S = {
  /** The tube's tile. */
  bx: 0, by: 0,
  /** Its muzzle (the top of the stone) and that height above the floor. */
  mx: 0, my: 0, mh: 0,
  /** Where the round comes down: the footprint's middle. */
  cx: 0, cy: 0,
  /** The arc: its lift at the top, and a sideways bow for a shot along the screen's vertical. */
  lift: 0, lx: 0,
  /** The footprint runs across the facing. */
  axis: 0,
  n: 0,
  /** The footprint tile nearest the middle: the one under the cloud. */
  mid: 0,
  empty: false,
  big: false
}

/** Footprint tiles: centre, and what happened there (−1 nothing struck, 0 a stone that held, 1 a stone it killed). */
const cells: { x: number; y: number; hit: number }[] = []
for (let i = 0; i < 8; i++) cells.push({ x: 0, y: 0, hit: -1 })

/** A point on the arc (and its shadow on the floor, and its height). */
const A = { x: 0, y: 0, gx: 0, gy: 0, h: 0 }
const B = { x: 0, y: 0, gx: 0, gy: 0, h: 0 }

const layout = (e: Shot, api: FxApi): void => {
  const size = api.size
  S.bx = api.cx(e.from.col, e.from.row)
  S.by = api.cy(e.from.col, e.from.row)
  S.mh = size * 0.3
  S.mx = S.bx
  S.my = S.by - S.mh
  S.big = e.from.level >= 2
  const n = Math.min(cells.length, e.path.length)
  let sx = 0
  let sy = 0
  for (let i = 0; i < n; i++) {
    const c = cells[i]!
    const cell = e.path[i]!
    c.x = api.cx(cell.col, cell.row)
    c.y = api.cy(cell.col, cell.row)
    c.hit = -1
    for (let j = 0; j < e.hits.length; j++) {
      const t = e.hits[j]!
      if (t.target.col === cell.col && t.target.row === cell.row) c.hit = t.hpAfter <= 0 ? 1 : 0
    }
    sx += c.x
    sy += c.y
  }
  S.n = n
  S.empty = n === 0
  if (n > 0) {
    S.cx = sx / n
    S.cy = sy / n
  } else {
    // No footprint on the board: the round sails off the edge the tube faces.
    const a = dirAngle(e.from.dir)
    S.cx = S.bx + Math.cos(a) * size * 3
    S.cy = S.by + Math.sin(a) * size * 3
  }
  let best = Infinity
  S.mid = 0
  for (let i = 0; i < n; i++) {
    const d = Math.abs(cells[i]!.x - S.cx) + Math.abs(cells[i]!.y - S.cy)
    if (d < best) { best = d; S.mid = i }
  }
  const dx = S.cx - S.bx
  const dy = S.cy - S.by
  const vertical = Math.abs(dy) > Math.abs(dx)
  // The board is seen from high above, so height reads mostly as SCALE (the
  // round swells toward the eye, `paintShell`) and only partly as lift.
  S.lift = size * (vertical ? 1.0 : 1.2)
  // A shot up or down the screen has its lift on the same axis as its travel,
  // and a lob straight up a column reads as a line. So its height is drawn
  // tipped sideways (toward the board's middle): the round swings out in a
  // clear arc while its SHADOW runs straight up the column underneath.
  S.lx = vertical ? (S.bx <= api.board.x + api.board.w / 2 ? 1 : -1) * size * 0.68 : 0
  S.axis = Math.atan2(dy, dx) + Math.PI / 2
}

/** The round at `u` (0 muzzle … 1 landing) into `o`: on screen, its shadow on the floor, its height. */
const arcAt = (u: number, o: typeof A): void => {
  const b = 4 * u * (1 - u)
  o.gx = S.bx + (S.cx - S.bx) * u
  o.gy = S.by + (S.cy - S.by) * u
  o.h = S.lift * b + (1 - u) * S.mh
  o.x = o.gx + S.lx * b
  o.y = o.gy - o.h
}

/** Events whose launch has been played (a moment, not a frame). */
const launched = new WeakSet<object>()

/** The flight's per-frame fuse spark: its options, reused. */
const FUSE_SPARK: { shape: 2; gravity: number; drag: number } = { shape: 2, gravity: 0, drag: 2 }

/**
 * Every bake the effect uses, in the order it first needs them. The first
 * mortar of a session bakes them a couple per frame through the crouch and the
 * flight (`warm`), so the landing frame — the one that must not hitch — bakes
 * nothing. After that each call is one variable read.
 */
const WARM: readonly (() => unknown)[] = [
  shellSpr, flareSpr, shadowSpr, glowCore, glowWhite, coreHot, smokeSpr, reticleSpr, emberCoreId, fireSpr, smokeLitSpr,
  smokeDarkSpr, scorchSpr, pitSpr, glowAccent, ringAccent, shrapnelId, emberAccentId
]
const warm = (p: number): void => {
  const upto = Math.min(WARM.length, 7 + Math.ceil(clamp01(p / (IMPACT * 0.85)) * (WARM.length - 7)))
  for (let i = 0; i < upto; i++) WARM[i]!()
}

const glow = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, r: number, alpha: number): void => {
  blit(ctx, spr, x, y, r * 2, r * 2, alpha, true, 0)
}

// ─── The stone's acting ─────────────────────────────────────────────────────

const poseTube = (e: Shot, p: number, tL: number, api: FxApi): void => {
  const id = e.from.id
  const size = api.size
  if (p < LAUNCH) {
    // The crouch: squatting into its bed.
    const k = easeInQuad(clamp01(p / LAUNCH))
    api.pose(id, 0, size * 0.035 * k, 1 + 0.08 * k, 1 - 0.12 * k)
    return
  }
  if (tL < 280) {
    // The kick: slammed down by the recoil, then ringing back up.
    const s = Math.exp(-tL / 75) * Math.cos(tL * 0.034)
    api.pose(id, 0, size * 0.05 * s, 1 + 0.12 * s, 1 - 0.17 * s)
    return
  }
  api.pose(id, 0, 0, 1, 1)
}

// ─── Painters ───────────────────────────────────────────────────────────────

/** The muzzle flash, `k` 0…1: a tongue of fire straight up, a hot bloom. */
const paintMuzzle = (ctx: CanvasRenderingContext2D, size: number, k: number, big: boolean): void => {
  const a = Math.pow(1 - k, 1.5)
  const w = size * (big ? 0.95 : 0.8) * (0.8 + 0.4 * easeOutCubic(k))
  const h = w * 1.35
  if (!blit(ctx, flareSpr(), S.mx, S.my - h * 0.32, w, h, a, true, 0) && a > 0.05) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = a
    ctx.fillStyle = ACCENT
    ctx.beginPath(); ctx.arc(S.mx, S.my - size * 0.15, size * 0.15, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
  glow(ctx, glowWhite(), S.mx, S.my, size * 0.26 * (1 - k * 0.5), (1 - k) * 0.9)
  glow(ctx, glowCore(), S.mx, S.my, size * 0.5, (1 - k) * 0.6)
}

/**
 * The smoke the round leaves hanging: one puff every STEP of the flight at a
 * FIXED place on the arc, each ageing on its own clock from the moment the
 * round passed it — offset round the path by an angle that turns along it, so
 * the puffs lay down a corkscrew. Rising a little and swelling as they age.
 */
const paintTrail = (ctx: CanvasRenderingContext2D, size: number, tier: number, u: number, tMs: number, dur: number): void => {
  const spr = smokeSpr()
  if (!spr) return
  const every = tier >= 2 ? 1 : 2
  const last = Math.floor(u / STEP)
  for (let k = 1; k <= last; k += every) {
    const uk = k * STEP
    const born = (LAUNCH + uk * (IMPACT - LAUNCH)) * dur
    const age = (tMs - born) / PUFF_LIFE
    if (age <= 0 || age >= 1) continue
    arcAt(uk, A)
    const th = uk * 40
    const r = size * (0.08 + 0.06 * age)
    const x = A.x + Math.cos(th) * r
    const y = A.y + Math.sin(th) * r * 0.7 - size * 0.2 * age
    const d = size * (0.2 + 0.28 * age) * (0.75 + 0.35 * clamp01(A.h / (S.lift + S.mh)))
    blit(ctx, spr, x, y, d, d, 0.8 * Math.pow(1 - age, 1.3), false, th)
  }
}

/**
 * The fuse's streak: the last short stretch of arc behind the round, in three
 * pieces that dim and thin toward the back — a burning comet tail, not a line.
 */
const paintFuseTail = (ctx: CanvasRenderingContext2D, size: number, u: number, alpha: number, tier: number): void => {
  if (alpha <= 0.01 || u <= 0.01) return
  const len = 0.13
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  for (let s = 0; s < 3; s++) {
    const a1 = u - (len * s) / 3
    const a0 = Math.max(0, u - (len * (s + 1)) / 3)
    if (a1 <= a0) break
    const k = 1 - s / 3
    ctx.beginPath()
    arcAt(a0, A); ctx.moveTo(A.x, A.y)
    arcAt((a0 + a1) / 2, A); ctx.lineTo(A.x, A.y)
    arcAt(a1, A); ctx.lineTo(A.x, A.y)
    if (tier >= 2) {
      ctx.globalAlpha = alpha * 0.4 * k
      ctx.strokeStyle = CORE
      ctx.lineWidth = size * 0.11 * k
      ctx.stroke()
    }
    ctx.globalAlpha = alpha * 0.9 * k
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = size * 0.04 * k
    ctx.stroke()
  }
  ctx.restore()
}

/** The round: a shadow on the floor, the iron ball (bigger as it climbs toward the eye), its fuse burning. */
const paintShell = (ctx: CanvasRenderingContext2D, size: number, u: number, tMs: number): void => {
  arcAt(u, A)
  arcAt(Math.max(0, u - 0.03), B)
  const hn = clamp01(A.h / (S.lift + S.mh))
  // The shadow: small and faint while the round is high, dark as it comes down.
  const sw = size * 0.56 * (1 - 0.35 * hn)
  blit(ctx, shadowSpr(), A.gx, A.gy + size * 0.12, sw, sw * 0.55, 0.8 * (1 - 0.45 * hn), false, 0)
  const w = size * 0.3 * (1 + 0.95 * hn) * (S.big ? 1.15 : 1)
  glow(ctx, glowCore(), A.x, A.y, w * 1.05, 0.75)
  if (!blit(ctx, shellSpr(), A.x, A.y, w, w, 1, false, tMs * 0.018)) {
    ctx.save()
    ctx.fillStyle = '#2b2430'
    ctx.beginPath(); ctx.arc(A.x, A.y, w * 0.34, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
  // The fuse, on the trailing side.
  const vx = A.x - B.x
  const vy = A.y - B.y
  const vl = Math.hypot(vx, vy) || 1
  const fx = A.x - (vx / vl) * w * 0.34
  const fy = A.y - (vy / vl) * w * 0.34
  glow(ctx, coreHot(), fx, fy, w * (0.42 + 0.08 * Math.sin(tMs * 0.09)), 0.95)
}

/** Artillery reticles tightening (and turning) on the footprint as the round comes down. */
const paintReticle = (ctx: CanvasRenderingContext2D, size: number, u: number, tMs: number): void => {
  const w = span(u, 0.3, 1)
  if (w <= 0) return
  const pulse = 0.72 + 0.28 * Math.sin(tMs * 0.05)
  const d = size * (1.2 - 0.36 * easeOutCubic(w))
  const spr = reticleSpr()
  for (let i = 0; i < S.n; i++) {
    const c = cells[i]!
    glow(ctx, glowCore(), c.x, c.y, size * 0.42, w * 0.16)
    if (!blit(ctx, spr, c.x, c.y, d, d, w * 0.75 * pulse, true, (1 - w) * 0.9)) {
      const rr = d * 0.38
      const dd = (rr / 0.78) * 2
      blit(ctx, ringCore(), c.x, c.y, dd, dd, w * 0.6 * pulse, true, 0)
    }
  }
}

/**
 * The mushroom over the footprint's middle, `tI` ms after the landing: a stem
 * and a skirt at its foot, a cap of puffs rolling out over the top — fire
 * first, then smoke lit from below as the fire dies inside it.
 */
const paintMushroom = (ctx: CanvasRenderingContext2D, size: number, tier: number, tI: number): void => {
  const c = cells[S.mid]!
  const x0 = S.n > 0 ? c.x : S.cx
  const y0 = S.n > 0 ? c.y : S.cy
  const sc = S.big ? 1.2 : 1
  const rise = easeOutCubic(clamp01(tI / 380))
  const spread = easeOutCubic(clamp01(tI / 320))
  // The cap's middle, its half-width and half-height, and the size of its puffs.
  const capY = y0 - size * (0.14 + 0.6 * rise) * sc
  const capR = size * (0.16 + 0.42 * spread) * sc
  const capH = capR * 0.42
  const puff = size * (0.14 + 0.1 * spread) * sc
  // Fire first; the smoke thickens round it; then everything thins away.
  const smokeA = span(tI, 45, 170) * (1 - span(tI, 330, 530))
  const fireA = 1 - span(tI, 90, 380)
  const hotA = 1 - span(tI, 0, 150)
  const dark = smokeDarkSpr()
  const lit = smokeLitSpr()
  const fire = fireSpr()
  const stems = tier >= 1 ? 3 : 1
  const caps = tier >= 1 ? 5 : 3

  // ── Smoke (normal blend) ──
  if (smokeA > 0.01) {
    if (tier >= 2) {
      // The skirt: the blast's foot rolling out along the floor.
      const sk = size * (0.18 + 0.34 * spread) * sc
      const sr = size * 0.15 * (1 + 0.4 * spread) * sc
      blit(ctx, dark, x0 - sk, y0 + size * 0.1, sr * 2, sr * 1.5, smokeA * 0.85, false, 0.4)
      blit(ctx, dark, x0 + sk, y0 + size * 0.1, sr * 2, sr * 1.5, smokeA * 0.85, false, 2.1)
    }
    // The stem: a narrow column of smoke, burning only at its foot.
    for (let i = 0; i < stems; i++) {
      const f = (i + 0.5) / stems
      const r = size * 0.115 * (1.3 - 0.4 * f) * (0.8 + 0.4 * rise) * sc
      blit(ctx, i === 0 ? lit : dark, x0 + Math.sin(tI * 0.02 + f * 4) * size * 0.02, y0 - (y0 - capY) * f * 0.92, r * 2, r * 2, smokeA, false, i * 1.7 + tI * 0.002)
    }
    // The cap: puffs along its upper arc and one crowning it (charcoal, lit on top)…
    for (let i = 0; i < caps; i++) {
      const th = Math.PI + ((i + 0.5) * Math.PI) / caps
      const r = puff * (1 - 0.15 * Math.abs(Math.cos(th)))
      blit(ctx, dark, x0 + Math.cos(th) * capR, capY + Math.sin(th) * capH, r * 2, r * 2, smokeA, false, i * 1.3 + tI * 0.0025 * (i % 2 === 0 ? 1 : -1))
    }
    blit(ctx, dark, x0, capY - capH * 0.6, puff * 2.4, puff * 2.4, smokeA, false, 0.7 + tI * 0.002)
    // …and its rolled underside, burning.
    if (tier >= 1) {
      for (let i = 0; i < 3; i++) {
        blit(ctx, lit, x0 + (i - 1) * capR * 0.62, capY + capH * 0.4, puff * 1.8, puff * 1.8, smokeA, false, 1.1 + i * 1.4)
      }
    }
  }

  // ── Fire (additive) ──
  if (fire) {
    // The fireball, climbing into the cap it becomes.
    if (hotA > 0.01) {
      const r = size * (0.42 + 0.2 * spread) * sc
      blit(ctx, fire, x0, lerpN(y0, capY, rise), r * 2, r * 2, hotA, true, 0.3)
      if (tI < 60) blit(ctx, fire, x0, y0, r * 2.4, r * 2.4, 1 - tI / 60, true, 2)
    }
    if (fireA > 0.01) {
      // The fire in the stem dies from the top down.
      for (let i = 0; i < stems; i++) {
        const f = (i + 0.5) / stems
        const r = size * 0.12 * (1.3 - 0.4 * f) * sc
        blit(ctx, fire, x0, y0 - (y0 - capY) * f * 0.92, r * 2, r * 2, fireA * 0.8 * (1 - span(tI, 60, 200) * f), true, i * 2)
      }
      // The glow inside the cap's underside.
      blit(ctx, fire, x0, capY + capH * 0.3, capR * 2.2, capR * 1.1, fireA * 0.75, true, 0)
    }
  }
}

const lerpN = (a: number, b: number, t: number): number => a + (b - a) * t

/** Everything after the landing, `tI` ms in. */
const paintBlast = (ctx: CanvasRenderingContext2D, size: number, tier: number, tI: number): void => {
  const fade = 1 - span(tI, 360, 520)
  // ── The ground: a scorch round every tile, a pit where a stone was blown away ──
  const pop = easeOutCubic(clamp01(tI / 60))
  const cs = size * (0.74 + 0.22 * pop)
  for (let i = 0; i < S.n; i++) {
    const c = cells[i]!
    blit(ctx, scorchSpr(), c.x, c.y + size * 0.04, cs, cs, fade * 0.7, false, i * 1.9)
    if (c.hit === 1 && tI > 110) blit(ctx, pitSpr(), c.x, c.y + size * 0.06, cs * 0.8, cs * 0.8, fade * clamp01((tI - 110) / 80), false, 0)
    if (tier >= 1) glow(ctx, glowAccent(), c.x, c.y + size * 0.04, size * 0.34, 0.5 * (1 - span(tI, 120, 440)))
  }
  // ── The ground shock, stretched along the footprint ──
  for (let r = 0; r < (S.big ? 2 : 1); r++) {
    const t = tI - r * 70
    if (t < 0 || t >= 260) continue
    const k = t / 260
    const rr = size * (0.3 + 0.62 * easeOutCubic(k))
    const d = (rr / 0.78) * 2
    ctx.save()
    ctx.translate(S.cx, S.cy + size * 0.06)
    ctx.rotate(S.axis)
    ctx.scale(1.6, 0.78)
    blit(ctx, ringAccent(), 0, 0, d, d, 0.6 * (1 - k) * (r === 0 ? 1 : 0.6), true, 0)
    ctx.restore()
  }
  // ── A fireball on every side tile (the middle one is the cloud's) ──
  const fa = 1 - span(tI, 80, 270)
  const grow = easeOutCubic(clamp01(tI / 110))
  if (fa > 0.01) {
    for (let i = 0; i < S.n; i++) {
      if (i === S.mid) continue
      const c = cells[i]!
      const r = size * (0.3 + 0.22 * grow)
      blit(ctx, fireSpr(), c.x, c.y - size * 0.06 * grow, r * 2, r * 2, fa, true, i * 1.3)
    }
  }
  // ── …and the smoke it leaves: two lit puffs rising off each side tile ──
  const sa = span(tI, 70, 170) * (1 - span(tI, 330, 520))
  if (sa > 0.01 && tier >= 1) {
    const lit = smokeLitSpr()
    const up = size * 0.32 * easeOutCubic(clamp01((tI - 70) / 400))
    for (let i = 0; i < S.n; i++) {
      if (i === S.mid) continue
      const c = cells[i]!
      const r = size * (0.14 + 0.08 * grow)
      blit(ctx, lit, c.x - size * 0.13, c.y - size * 0.08 - up, r * 2, r * 2, sa * 0.9, false, i * 2.3)
      blit(ctx, lit, c.x + size * 0.12, c.y - size * 0.18 - up * 1.2, r * 1.7, r * 1.7, sa * 0.8, false, i * 1.1 + 1)
      blit(ctx, fireSpr(), c.x, c.y - size * 0.1 - up, r * 2.2, r * 2.2, sa * fa * 0.7, true, i)
    }
  }
  paintMushroom(ctx, size, tier, tI)
  // ── The flash, over everything, for a frame or two ──
  if (tI < 85) {
    const k = tI / 85
    glow(ctx, glowWhite(), S.cx, S.cy - size * 0.1, size * 0.62 * (1 - 0.3 * k), (1 - k) * (1 - k) * 0.95)
    glow(ctx, glowCore(), S.cx, S.cy, size * (S.big ? 1.35 : 1.15), (1 - k) * 0.75)
  }
}

// ─── Moments (particles) ────────────────────────────────────────────────────

const spawnLaunch = (e: Shot, api: FxApi): void => {
  const size = api.size
  const n = count(S.big ? 10 : 8)
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9
    const v = size * (2.4 + Math.random() * 3)
    spawn(S.mx, S.my, Math.cos(a) * v, Math.sin(a) * v, 180 + Math.random() * 200, size * (0.04 + Math.random() * 0.03),
      i % 3 === 0 ? HOT : i % 3 === 1 ? ACCENT : CORE, { shape: 2, gravity: size * 6, drag: 2.2 })
  }
  // The smoke ring blown out round the muzzle.
  const m = count(8)
  for (let i = 0; i < m; i++) {
    const a = (i / m) * Math.PI * 2
    spawn(S.mx + Math.cos(a) * size * 0.1, S.my + Math.sin(a) * size * 0.05, Math.cos(a) * size * 1.15, Math.sin(a) * size * 0.45 - size * 0.35,
      420 + Math.random() * 220, size * (0.1 + Math.random() * 0.06), SMOKE, { additive: false, shape: 3, alpha: 0.55, drag: 3.2, grow: 1 })
  }
  api.flash(e.from.id, 0.45)
}

const spawnBlast = (e: Shot, api: FxApi): void => {
  const size = api.size
  const more = S.big ? 1.3 : 1
  const shr = shrapnelId()
  const emb = emberAccentId()
  for (let i = 0; i < S.n; i++) {
    const c = cells[i]!
    // Fire thrown up and out.
    const n = count(7 * more)
    for (let j = 0; j < n; j++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.8
      const v = size * (1.8 + Math.random() * 3.2)
      spawn(c.x, c.y, Math.cos(a) * v, Math.sin(a) * v, 220 + Math.random() * 240, size * (0.045 + Math.random() * 0.03),
        j % 3 === 0 ? HOT : j % 3 === 1 ? ACCENT : CORE, { shape: 2, gravity: size * 6, drag: 1.8 })
    }
    // Shrapnel and clods: iron and earth, tumbling back down.
    const m = count(4 * more)
    for (let j = 0; j < m; j++) {
      const a = Math.random() * Math.PI * 2
      const v = size * (1.2 + Math.random() * 2.2)
      spawn(c.x, c.y, Math.cos(a) * v, Math.sin(a) * v - size * 1.3, 450 + Math.random() * 300, size * (0.05 + Math.random() * 0.03), '#2a2230',
        { additive: false, shape: shr >= 0 ? 4 : 1, sprite: shr, gravity: size * 9, drag: 0.9, vrot: (Math.random() - 0.5) * 16, fade: 2 })
    }
    // (The smoke off each tile is PAINTED — `paintBlast` — not spawned: the pool
    // draws after every painter, so a smoke particle would sit on top of the
    // fireball from its first frame instead of rising out of it.)
    // Embers drifting up.
    const k = count(3)
    for (let j = 0; j < k; j++) {
      spawn(c.x + (Math.random() - 0.5) * size * 0.5, c.y + (Math.random() - 0.5) * size * 0.3, (Math.random() - 0.5) * size * 0.5, -size * (0.5 + Math.random() * 0.6),
        600 + Math.random() * 400, size * (0.05 + Math.random() * 0.03), ACCENT, { shape: emb >= 0 ? 6 : 0, sprite: emb, drag: 0.6, fade: 1 })
    }
  }
  // Stones struck: chips off them.
  for (let j = 0; j < e.hits.length; j++) {
    const h = e.hits[j]!
    spawnChips(api.cx(h.target.col, h.target.row), api.cy(h.target.col, h.target.row), size, api.stoneOf(h.target), -Math.PI / 2, 5)
  }
  // Magenta sparks up the stem.
  const c = cells[S.mid]!
  const ce = emberCoreId()
  const k = count(5 * more)
  for (let j = 0; j < k; j++) {
    spawn(c.x + (Math.random() - 0.5) * size * 0.2, c.y, (Math.random() - 0.5) * size * 0.5, -size * (1.3 + Math.random() * 1.1),
      480 + Math.random() * 260, size * (0.06 + Math.random() * 0.04), CORE, { shape: ce >= 0 ? 6 : 0, sprite: ce, drag: 1.4, fade: 1 })
  }
}

// ─── The module ─────────────────────────────────────────────────────────────

export const bombard: RuneFx = {
  type: 'bombard',
  palette: { core: CORE, hot: HOT, deep: DEEP, accent: ACCENT },

  impactAt: (e) => (e.kind === 'shot' ? IMPACT : undefined),
  tailMs: (e) => (e.kind === 'shot' ? TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    layout(e, api)
    api.sound('shell', 0.85, { x: S.bx, level: e.from.level, side: e.from.side })
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind !== 'shot') return
    layout(e, api)
    const ctx = api.ctx
    const size = api.size
    const tier = api.tier
    const dur = Math.max(1, e.dur)
    const tMs = p * dur
    const tL = tMs - LAUNCH * dur
    const tI = tMs - IMPACT * dur

    poseTube(e, p, tL, api)
    if (p < IMPACT) warm(p)
    if (p >= LAUNCH && !launched.has(e)) {
      launched.add(e)
      spawnLaunch(e, api)
    }

    // ── The crouch: light gathering in the barrel ──
    if (p < LAUNCH) {
      const k = clamp01(p / LAUNCH)
      glow(ctx, glowCore(), S.mx, S.my, size * (0.12 + 0.14 * k), 0.75 * k)
      return
    }
    if (tL < 130) paintMuzzle(ctx, size, tL / 130, S.big)

    if (p < IMPACT) {
      const u = clamp01((p - LAUNCH) / (IMPACT - LAUNCH))
      if (tier >= 1 && !S.empty) paintReticle(ctx, size, u, tMs)
      if (tier >= 1) paintTrail(ctx, size, tier, u, tMs, dur)
      if (tier >= 1) paintFuseTail(ctx, size, u, 1, tier)
      paintShell(ctx, size, u, tMs)
      if (tier >= 2 && api.canEmit) {
        // Sparks shed off the fuse. One scratch options object: this runs per frame.
        FUSE_SPARK.gravity = size * 3
        const n = count(2, 0)
        for (let i = 0; i < n; i++) {
          spawn(A.x, A.y, (Math.random() - 0.5) * size * 0.8, size * (0.2 + Math.random() * 0.5), 200 + Math.random() * 160,
            size * (0.03 + Math.random() * 0.02), i % 2 === 0 ? ACCENT : CORE, FUSE_SPARK)
        }
      }
      return
    }

    // ── After the landing ──
    if (tier >= 1) paintTrail(ctx, size, tier, 1, tMs, dur)
    if (!S.empty) paintBlast(ctx, size, tier, tI)
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    layout(e, api)
    // It lands whether or not it found anything: the blast always sounds.
    api.sound('shellHit', S.empty ? 0.5 : 1, { x: S.cx, level: e.from.level, side: e.from.side })
    if (S.empty) return
    spawnBlast(e, api)
    api.shake('strong')
  }
}
