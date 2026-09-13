import { intercepted, type FxApi, type RuneEvent, type RuneFx, type Shot } from './types'
import {
  blit, clamp01, count, dirAngle, easeInQuad, easeOutCubic, hash01, mix, spawn, spawnChips, spawnTileDust, span
} from './kit'
import {
  ACCENT, CORE, DEEP, GOLD, HOT, WIND, arrowSpr, blitArrow, coreHot, glintHot, glowCore, glowHot, glowWhite, goldGlintId, leafId,
  moteId, ringCore, ringHot, starInk, starSpr, streakGold, streakHot, wispId
} from './archer.sprites'
import { ARROW_IMPACT, ARROW_RELEASE } from './archer.timing'

/**
 * ─── Bow (`archer`) — the wind arrow ────────────────────────────────────────
 *
 * Events: `shot` with `weapon: 'arrow'` — an arrow that skips the tile in
 * front of the bow and flies to the end of its reach (`e.path`, skipped cells
 * included), striking every rune in `e.hits` on the way. When the rune it
 * stops on is a shield stone it is INTERCEPTED: the defense module draws the
 * wall, and the arrow only glances off it.
 *
 * The beat, on the event's 320 ms clock:
 *
 *   0 … DRAW_END      the DRAW. A string of light pulls back into a V, the arrow
 *                     materialises on it and slides back, wind motes spiral into
 *                     its head, the stone leans against the pull.
 *   DRAW_END          the RELEASE. The string snaps and shivers, torn fletching
 *                     and a puff of wind leave the bow, the stone jolts.
 *   … IMPACT          the FLIGHT: dead straight and fast, a white-hot tip, a
 *                     speed streak, and the signature — a twin-strand wind RIBBON
 *                     spiralling round the line it flew.
 *   IMPACT            the PIERCE: a star whose long spike runs on THROUGH the
 *                     stone, splinters sprayed out the far side, chips back at the
 *                     shooter, leaves, a ring. The arrow sticks and quivers (a
 *                     stone it kills drops it); a shield throws it off spinning.
 *   tail              the ribbon unwinds and blows away as wisps.
 *
 * Silhouette: a straight streak ending in a pointed star — nothing else on
 * the board is a line with a point on the end.
 *
 * The painted bolt (`api.art('round', 'bolt')`) is deliberately NOT used: its
 * bake carries its parchment ground (opaque over ~95 % of the bitmap), so in
 * flight it reads as a pale card, not an arrow. The inked procedural arrow in
 * `archer.sprites.ts` is the one look, art layer on or off.
 *
 * Cues: `arrow` (draw creak → string → wind zip), `arrowHit` (`runeSfx/archer.ts`).
 */

/** The release: the end of the draw, as a share of the window. */
const DRAW_END = ARROW_RELEASE
/** Where in the window the arrow arrives (the renderer applies the damage then). */
const IMPACT = ARROW_IMPACT
/** How long past the window the ribbon, the stuck arrow and the star keep drawing. */
const TAIL_MS = 380
/** How long a pierce star lives. */
const STAR_MS = 210
/** How long the ribbon takes to unwind and blow away after the arrow lands. */
const RIBBON_MS = 230

const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t))

/** The arrow's length, in tiles. */
const ARROW_LEN = 0.62

const HIT = 0
const WALL = 1
const MISS = 2
const OUT = 3

/**
 * One event's geometry, rebuilt per call into this ONE scratch object (the
 * frame path allocates nothing). y down, CSS px.
 */
const G = {
  bx: 0, by: 0,
  /** Unit vector of the flight, and its normal. */
  fx: 0, fy: -1, nx: 1, ny: 0, ang: -Math.PI / 2,
  /** The arrowhead at the release. */
  hx0: 0, hy0: 0,
  /** Where the arrowhead stops. */
  ex: 0, ey: 0,
  /** Where the ribbon starts: the bow's front. */
  sx: 0, sy: 0,
  /** Distance, along the flight, from the ribbon's start to the stop. */
  span: 0,
  /** Distance from the release head to the stop, along the flight. */
  fly: 0,
  kind: HIT as 0 | 1 | 2 | 3,
  /** Index into `e.hits` of the stone the arrow stops in, or −1. */
  last: -1,
  killed: false,
  len: 0
}

const layout = (e: Shot, api: FxApi): void => {
  const size = api.size
  const bx = api.cx(e.from.col, e.from.row)
  const by = api.cy(e.from.col, e.from.row)
  G.bx = bx
  G.by = by
  // The flight's direction: the path's line (a straight ray), else the facing.
  const lastCell = e.path[e.path.length - 1]
  let dx = 0
  let dy = -1
  if (lastCell) {
    const lx = api.cx(lastCell.col, lastCell.row) - bx
    const ly = api.cy(lastCell.col, lastCell.row) - by
    const d = Math.hypot(lx, ly)
    if (d > 1e-3) { dx = lx / d; dy = ly / d }
  } else {
    const a = dirAngle(e.from.dir)
    dx = Math.cos(a)
    dy = Math.sin(a)
  }
  G.fx = dx
  G.fy = dy
  G.nx = -dy
  G.ny = dx
  G.ang = Math.atan2(dy, dx)
  G.len = ARROW_LEN * size
  G.sx = bx + dx * size * 0.3
  G.sy = by + dy * size * 0.3
  G.hx0 = bx + dx * size * 0.4
  G.hy0 = by + dy * size * 0.4
  G.last = -1
  G.killed = false
  let ex: number
  let ey: number
  if (!lastCell) {
    G.kind = OUT
    ex = bx + dx * size * 2.4
    ey = by + dy * size * 2.4
  } else if (intercepted(e)) {
    // It meets the dome's face, not the stone.
    G.kind = WALL
    ex = api.cx(lastCell.col, lastCell.row) - dx * size * 0.42
    ey = api.cy(lastCell.col, lastCell.row) - dy * size * 0.42
  } else if (e.hits.length > 0) {
    G.kind = HIT
    // The furthest stone struck is the one the arrow stops in.
    let best = -Infinity
    for (let i = 0; i < e.hits.length; i++) {
      const t = e.hits[i]!.target
      const along = (api.cx(t.col, t.row) - bx) * dx + (api.cy(t.col, t.row) - by) * dy
      if (along > best) { best = along; G.last = i }
    }
    const t = e.hits[G.last]!
    G.killed = t.hpAfter <= 0
    ex = api.cx(t.target.col, t.target.row) - dx * size * 0.08
    ey = api.cy(t.target.col, t.target.row) - dy * size * 0.08
  } else {
    // Nothing in reach: it buries itself in the floor at the end of its range.
    G.kind = MISS
    ex = api.cx(lastCell.col, lastCell.row) - dx * size * 0.05
    ey = api.cy(lastCell.col, lastCell.row) - dy * size * 0.05
  }
  G.ex = ex
  G.ey = ey
  G.span = Math.max(1, (ex - G.sx) * dx + (ey - G.sy) * dy)
  G.fly = Math.max(1, (ex - G.hx0) * dx + (ey - G.hy0) * dy)
}

/** Events whose release has been played (the release is a moment, not a frame). */
const released = new WeakSet<object>()

/**
 * Every bake the effect uses, in the order it first needs them. The first bow
 * of a session bakes them a couple per frame through the draw (`warm`), so
 * the release and the pierce bake nothing. After that each call is one read.
 */
const WARM: readonly (() => unknown)[] = [
  arrowSpr, glowCore, coreHot, moteId, leafId, wispId, glowHot, ringCore, streakHot, starSpr, starInk, glowWhite, glintHot, streakGold, goldGlintId
]
const warm = (p: number): void => {
  const upto = Math.min(WARM.length, 4 + Math.ceil(clamp01(p / (DRAW_END * 0.9)) * (WARM.length - 4)))
  for (let i = 0; i < upto; i++) WARM[i]!()
}

// Side colour → the ribbon's halo (emerald with a hint of whose bow it is). Cached: `mix` builds a string.
const haloCache = new Map<string, string>()
const haloFor = (side: string): string => {
  let h = haloCache.get(side)
  if (!h) {
    h = mix(CORE, side, 0.22)
    if (haloCache.size > 16) haloCache.clear()
    haloCache.set(side, h)
  }
  return h
}
const BUFF_STRAND = mix(CORE, GOLD, 0.6)

/** The flight's per-frame wisp: its options, reused (see the flight). */
const FLIGHT_WISP: { shape: 2 | 4; sprite: number; rot: number; vrot: number; drag: number; fade: 0; grow: 1 } = {
  shape: 4, sprite: -1, rot: 0, vrot: 0, drag: 2.5, fade: 0, grow: 1
}

// ─── Painters ───────────────────────────────────────────────────────────────

/** `a` sprite at (x, y), `w`×`h`, additive, rotated — skipped cleanly with no sprite. */
const glow = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, r: number, alpha: number): void => {
  blit(ctx, spr, x, y, r * 2, r * 2, alpha, true, 0)
}

/**
 * The string of light: bow tips at the stone's front corners, pulled back into
 * a V to the nock while drawing; snapped straight (and shivering) after.
 */
const paintString = (ctx: CanvasRenderingContext2D, size: number, nockX: number, nockY: number, alpha: number, tier: number): void => {
  if (alpha <= 0.01) return
  const tipF = size * 0.1
  const tipW = size * 0.34
  const ax = G.bx + G.fx * tipF + G.nx * tipW
  const ay = G.by + G.fy * tipF + G.ny * tipW
  const bx = G.bx + G.fx * tipF - G.nx * tipW
  const by = G.by + G.fy * tipF - G.ny * tipW
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(ax, ay)
  ctx.lineTo(nockX, nockY)
  ctx.lineTo(bx, by)
  if (tier >= 2) {
    ctx.globalAlpha = alpha * 0.35
    ctx.strokeStyle = CORE
    ctx.lineWidth = size * 0.06
    ctx.stroke()
  }
  ctx.globalAlpha = alpha
  ctx.strokeStyle = HOT
  ctx.lineWidth = size * 0.02
  ctx.stroke()
  ctx.restore()
}

/**
 * The wind ribbon: `strands` helical strands wrapping the flight line from
 * `xs` to `xe` (distances along the flight from the bow's front), drawn in the
 * flight's own rotated frame. Amplitude is 0 at the head and swells behind it;
 * `unwind` (0…) widens it as it dissipates. Each strand's path is built once
 * and stroked twice (a soft halo at tier 2, then the bright line).
 */
const paintRibbon = (
  ctx: CanvasRenderingContext2D, size: number, tier: number, xs: number, xe: number, tMs: number,
  alpha: number, unwind: number, strands: number, halo: string, buffed: boolean
): void => {
  if (alpha <= 0.01 || xe - xs < 2) return
  // Enough points that the helix stays a smooth curve, never a zig-zag (the
  // orb's crackle is the jagged one).
  const n = Math.max(12, Math.min(tier >= 2 ? 44 : 24, Math.round((xe - xs) / (size * 0.04))))
  const amp = size * (strands > 2 ? 0.095 : 0.08) * (1 + unwind)
  const twist = (Math.PI * 2) / (size * 0.58)
  const spin = (Math.PI * 2) / 110
  const headFade = size * 0.36
  const tailFade = size * 0.24
  ctx.save()
  ctx.translate(G.sx, G.sy)
  ctx.rotate(G.ang)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let j = 0; j < strands; j++) {
    const ph = (j * Math.PI * 2) / strands
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const x = xs + ((xe - xs) * i) / n
      const hk = clamp01((xe - x) / headFade)
      const tk = clamp01((x - xs) / tailFade)
      const env = hk * (2 - hk) * (0.25 + 0.75 * tk * (2 - tk))
      const y = amp * env * Math.sin(x * twist - tMs * spin + ph)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    // Ink: a soft forest-green under-stroke in normal blend. It takes the blue
    // out of the slate beneath, so the light laid on it stays GREEN (additive
    // green on blue alone reads cyan) — and it is the game's inked look.
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = alpha * 0.5
    ctx.strokeStyle = DEEP
    ctx.lineWidth = size * 0.05
    ctx.stroke()
    ctx.globalCompositeOperation = 'lighter'
    if (tier >= 2) {
      ctx.globalAlpha = alpha * 0.26
      ctx.strokeStyle = halo
      ctx.lineWidth = size * 0.07
      ctx.stroke()
    }
    ctx.globalAlpha = alpha * (j === 0 ? 0.95 : 0.8)
    ctx.strokeStyle = j === 0 ? WIND : j === 1 ? (buffed ? BUFF_STRAND : CORE) : ACCENT
    ctx.lineWidth = size * (j === 0 ? 0.022 : 0.02)
    ctx.stroke()
  }
  ctx.restore()
}

/** The speed streak: one baked streak, bright at the head, laid behind it. */
const paintStreak = (ctx: CanvasRenderingContext2D, size: number, hx: number, hy: number, back: number, alpha: number, buffed: boolean): void => {
  if (alpha <= 0.01 || back < 2) return
  const l = Math.min(back, size * 1.5)
  const cx = hx - G.fx * l * 0.5
  const cy = hy - G.fy * l * 0.5
  if (!blit(ctx, buffed ? streakGold() : streakHot(), cx, cy, l, size * 0.2, alpha, true, G.ang) && alpha > 0.05) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = alpha * 0.8
    ctx.strokeStyle = HOT
    ctx.lineWidth = size * 0.03
    ctx.beginPath(); ctx.moveTo(hx - G.fx * l, hy - G.fy * l); ctx.lineTo(hx, hy); ctx.stroke()
    ctx.restore()
  }
}

/**
 * The pierce at (x, y), `k` 0…1 through its life: a white flash for the first
 * frames, the star (long spike on through the stone), an emerald ring, and a
 * hot inner ring for a Lv 2+ bow or a killing blow.
 */
const paintPierce = (ctx: CanvasRenderingContext2D, size: number, x: number, y: number, k: number, big: boolean): void => {
  if (k < 0 || k >= 1) return
  const e = easeOutCubic(k)
  const fade = 1 - easeInQuad(k)
  // The flash is a frame or two and small: the STAR is the read, not a blob.
  if (k < 0.17) glow(ctx, glowWhite(), x, y, size * (big ? 0.36 : 0.3), (1 - k / 0.17) * 0.9)
  glow(ctx, glowCore(), x, y, size * (0.3 + 0.16 * e) * (big ? 1.2 : 1), fade * 0.42)
  const w = size * (big ? 1.75 : 1.5) * (0.85 + 0.25 * e)
  // Ink first (normal blend), so the star holds its shape over a white-flashed stone.
  blit(ctx, starInk(), x, y, w, w, fade * 0.8, false, G.ang)
  if (!blit(ctx, starSpr(), x, y, w, w, fade, true, G.ang) && fade > 0.05) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = fade
    ctx.strokeStyle = HOT
    ctx.lineWidth = size * 0.04
    ctx.beginPath()
    ctx.moveTo(x - G.fx * w * 0.25, y - G.fy * w * 0.25); ctx.lineTo(x + G.fx * w * 0.5, y + G.fy * w * 0.5)
    ctx.moveTo(x - G.nx * w * 0.2, y - G.ny * w * 0.2); ctx.lineTo(x + G.nx * w * 0.2, y + G.ny * w * 0.2)
    ctx.stroke()
    ctx.restore()
  }
  const rr = size * (0.14 + 0.34 * e)
  const d = (rr / 0.78) * 2
  blit(ctx, ringCore(), x, y, d, d, (1 - k) * 0.5, true, 0)
  if (big) {
    // A heavier blow (a Lv 2 bow, a killing shot) opens a second star behind
    // the first, turned an eighth — eight points instead of four.
    const w2 = w * 0.62 * (0.9 + 0.35 * e)
    blit(ctx, starSpr(), x, y, w2, w2, fade * 0.7, true, G.ang + Math.PI / 4 + k * 0.4)
  }
}

// ─── The stone's acting ─────────────────────────────────────────────────────

const poseBow = (e: Shot, p: number, dur: number, api: FxApi): void => {
  const id = e.from.id
  const size = api.size
  const ax = Math.abs(G.fx)
  const ay = Math.abs(G.fy)
  if (p < DRAW_END) {
    // The draw: the stone leans back against the pull and tenses along it.
    const k = easeOutCubic(clamp01(p / DRAW_END))
    const back = -0.055 * k * size
    const along = 1 - 0.07 * k
    const across = 1 + 0.05 * k
    api.pose(id, G.fx * back, G.fy * back, ax * along + ay * across, ay * along + ax * across)
    return
  }
  const t = (p - DRAW_END) * dur
  if (t < 240) {
    // The release: a jolt forward that rings out.
    const s = Math.sin((t / 60) * Math.PI) * Math.exp(-t / 70)
    const off = 0.06 * s * size
    const along = 1 + 0.09 * Math.exp(-t / 45) * Math.cos((t / 60) * Math.PI)
    const across = 2 - along
    api.pose(id, G.fx * off, G.fy * off, ax * along + ay * across, ay * along + ax * across)
    return
  }
  api.pose(id, 0, 0, 1, 1)
}

// ─── Moments (particles) ────────────────────────────────────────────────────

/** Wind motes spiralling into the arrowhead while the bow is drawn. */
const spawnGather = (api: FxApi): void => {
  const size = api.size
  const id = moteId()
  const cx = G.bx + G.fx * size * 0.34
  const cy = G.by + G.fy * size * 0.34
  const n = count(7)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6
    const r = size * (0.45 + Math.random() * 0.22)
    const life = 95 + Math.random() * 30
    // Straight in, with a sideways swirl: they arrive together at the head.
    const vx = (-Math.cos(a) * r) / (life / 1000) - Math.sin(a) * size * 1.2
    const vy = (-Math.sin(a) * r) / (life / 1000) + Math.cos(a) * size * 1.2
    spawn(cx + Math.cos(a) * r, cy + Math.sin(a) * r, vx, vy, life, size * (0.06 + Math.random() * 0.04), HOT,
      { shape: id >= 0 ? 4 : 0, sprite: id, fade: 0, grow: 2 })
  }
}

/** The release: torn fletching thrown back and out, and the air the string pushed. */
const spawnRelease = (e: Shot, api: FxApi): void => {
  const size = api.size
  const leaf = leafId()
  const nx = G.bx - G.fx * size * 0.2
  const ny = G.by - G.fy * size * 0.2
  const n = count(4)
  for (let i = 0; i < n; i++) {
    const side = i % 2 === 0 ? 1 : -1
    const v = size * (0.9 + Math.random() * 1.1)
    spawn(nx, ny, -G.fx * v * 0.5 + G.nx * side * v, -G.fy * v * 0.5 + G.ny * side * v - size * 0.7,
      420 + Math.random() * 260, size * (0.055 + Math.random() * 0.03), CORE,
      { additive: false, shape: leaf >= 0 ? 5 : 1, sprite: leaf, gravity: size * 5, drag: 2, vrot: (Math.random() - 0.5) * 18, fade: 2 })
  }
  const w = wispId()
  const fx = G.bx + G.fx * size * 0.42
  const fy = G.by + G.fy * size * 0.42
  const m = count(5)
  for (let i = 0; i < m; i++) {
    const a = G.ang + ((m > 1 ? i / (m - 1) : 0.5) - 0.5) * 2.4
    const v = size * (1.3 + Math.random() * 0.9)
    spawn(fx, fy, Math.cos(a) * v, Math.sin(a) * v, 230 + Math.random() * 120, size * (0.13 + Math.random() * 0.06), HOT,
      { shape: w >= 0 ? 4 : 2, sprite: w, rot: a + Math.PI / 2, drag: 3.5, fade: 0, grow: 1 })
  }
  api.flash(e.from.id, 0.3)
}

// ─── The module ─────────────────────────────────────────────────────────────

export const archer: RuneFx = {
  type: 'archer',
  palette: { core: CORE, hot: HOT, deep: DEEP, accent: ACCENT },

  impactAt: (e) => (e.kind === 'shot' ? IMPACT : undefined),
  tailMs: (e) => (e.kind === 'shot' ? TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    layout(e, api)
    api.sound('arrow', 0.85, { x: G.bx, level: e.from.level, side: e.from.side })
    spawnGather(api)
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind !== 'shot') return
    layout(e, api)
    const ctx = api.ctx
    const size = api.size
    const tier = api.tier
    const dur = Math.max(1, e.dur)
    const tMs = p * dur
    const tRel = tMs - DRAW_END * dur
    const tImp = tMs - IMPACT * dur
    const big = e.from.level >= 2
    const buffed = e.from.atkBonus > 0
    const strands = tier >= 2 ? (big ? 3 : 2) : tier >= 1 ? 2 : 0

    poseBow(e, p, dur, api)
    if (p < IMPACT) warm(p)
    if (p >= DRAW_END && !released.has(e)) {
      released.add(e)
      spawnRelease(e, api)
    }

    // ── The draw ──
    if (p < DRAW_END) {
      const k = easeOutCubic(clamp01(p / DRAW_END))
      const appear = clamp01(p / 0.1)
      // The nock slides back from the stone's face to behind its centre.
      const nockX = G.bx + G.fx * size * (0.04 - 0.26 * k)
      const nockY = G.by + G.fy * size * (0.04 - 0.26 * k)
      const hx = nockX + G.fx * G.len
      const hy = nockY + G.fy * G.len
      if (tier >= 1) paintString(ctx, size, nockX, nockY, appear * 0.9, tier)
      glow(ctx, glowCore(), hx, hy, size * (0.12 + 0.2 * k), appear * (0.35 + 0.55 * k))
      blitArrow(ctx, hx, hy, G.ang, G.len, appear)
      glow(ctx, coreHot(), hx, hy, size * (0.06 + 0.08 * k), appear * k)
      return
    }

    // ── The string, snapped and shivering ──
    if (tier >= 1 && tRel < 75) {
      const shiver = Math.sin(tRel * 0.14) * Math.exp(-tRel / 30)
      const midX = G.bx + G.fx * size * (0.1 + 0.08 * shiver)
      const midY = G.by + G.fy * size * (0.1 + 0.08 * shiver)
      paintString(ctx, size, midX, midY, 0.85 * (1 - span(tRel, 10, 75)), tier)
    }
    // The loose: a hot pinch of light where the string met the nock, and a
    // small, fast puff of air off the bow's face.
    if (tRel < 90) {
      const k = tRel / 90
      glow(ctx, glowHot(), G.bx + G.fx * size * 0.1, G.by + G.fy * size * 0.1, size * 0.2 * (1 - k * 0.5), (1 - k) * 0.8)
      const rr = size * (0.1 + 0.2 * easeOutCubic(k))
      const d = (rr / 0.78) * 2
      blit(ctx, ringCore(), G.bx + G.fx * size * 0.44, G.by + G.fy * size * 0.44, d, d, (1 - k) * 0.55, true, 0)
    }

    // ── The flight ──
    if (p < IMPACT) {
      const u = clamp01((p - DRAW_END) / (IMPACT - DRAW_END))
      const hx = G.hx0 + G.fx * G.fly * u
      const hy = G.hy0 + G.fy * G.fly * u
      const xe = (hx - G.sx) * G.fx + (hy - G.sy) * G.fy
      // Off the board it thins away rather than landing.
      const out = G.kind === OUT ? 1 - span(u, 0.55, 1) : 1
      if (strands > 0) paintRibbon(ctx, size, tier, 0, xe, tMs, out, 0, strands, haloFor(api.sideColor(e.from.side, e.from.faction)), buffed)
      paintStreak(ctx, size, hx, hy, xe + size * 0.1, out * 0.95, buffed)
      glow(ctx, glowCore(), hx, hy, size * (big ? 0.3 : 0.24), out * 0.85)
      blitArrow(ctx, hx, hy, G.ang, G.len, out)
      glow(ctx, coreHot(), hx, hy, size * 0.13, out)
      if (tier >= 2 && api.canEmit) {
        // Wisps shed off the head. One scratch options object: this runs per frame.
        const w = wispId()
        FLIGHT_WISP.shape = w >= 0 ? 4 : 2
        FLIGHT_WISP.sprite = w
        const n = count(2, 0)
        for (let i = 0; i < n; i++) {
          const s = (Math.random() - 0.5) * 2
          FLIGHT_WISP.rot = G.ang + (s > 0 ? 0 : Math.PI)
          FLIGHT_WISP.vrot = s * 6
          spawn(hx - G.fx * size * 0.25 * Math.random(), hy - G.fy * size * 0.25 * Math.random(),
            G.nx * s * size * 0.9 - G.fx * size * 0.6, G.ny * s * size * 0.9 - G.fy * size * 0.6,
            220 + Math.random() * 140, size * (0.1 + Math.random() * 0.06), HOT, FLIGHT_WISP)
        }
      }
      // A Lv 2 arrow runs THROUGH the first stone: its star goes as it passes.
      if (G.kind === HIT) paintPassStars(e, api, tMs, dur, big)
      return
    }

    // ── After the blow ──
    if (strands > 0) {
      // The wind follows the arrow in: the ribbon's tail rushes up the line
      // after it while the helix unwinds and thins away.
      const kR = clamp01(tImp / RIBBON_MS)
      const xs = G.span * 0.9 * easeInOutQuad(kR)
      paintRibbon(ctx, size, tier, xs, G.span, tMs, Math.pow(1 - kR, 1.4), 1.5 * kR, strands,
        haloFor(api.sideColor(e.from.side, e.from.faction)), buffed)
    }
    if (tImp < 70) paintStreak(ctx, size, G.ex, G.ey, G.span * (1 - tImp / 70), 0.95 * (1 - tImp / 70), buffed)

    switch (G.kind) {
      case HIT: {
        paintPassStars(e, api, tMs, dur, big)
        // The arrow sticks — driven a touch deeper on the blow — and quivers.
        const push = size * 0.07 * easeOutCubic(clamp01(tImp / 45))
        let hx = G.ex + G.fx * push
        let hy = G.ey + G.fy * push
        let ang = G.ang + 0.16 * Math.sin(tImp * 0.085) * Math.exp(-tImp / 120)
        let alpha = 1 - span(tImp, 290, 470)
        if (G.killed && tImp > 120) {
          // The stone it was in is breaking: the arrow drops with the rubble.
          const t = (tImp - 120) / 1000
          hy += size * (0.6 * t + 9 * t * t)
          hx += G.nx * size * 0.8 * t
          ang += t * 7
          alpha = 1 - span(tImp, 150, 330)
        }
        blitArrow(ctx, hx, hy, ang, G.len, alpha)
        break
      }
      case WALL: {
        // Glanced off the dome: a small glint and the arrow thrown back, spinning.
        if (tImp < 150) {
          const k = tImp / 150
          const s = size * 0.55 * (1 - k * 0.5)
          blit(ctx, glintHot(), G.ex, G.ey, s, s, 1 - k, true, k * 1.2)
        }
        const t = tImp / 1000
        const side = hash01(e.from.id * 7 + 3) < 0.5 ? -1 : 1
        const hx = G.ex - G.fx * size * 1.4 * t + G.nx * side * size * 2 * t
        const hy = G.ey - G.fy * size * 1.4 * t + G.ny * side * size * 2 * t + size * 10 * t * t
        blitArrow(ctx, hx, hy, G.ang + side * t * 20, G.len * 0.85, 1 - span(tImp, 110, 300))
        break
      }
      case MISS: {
        const ang = G.ang + 0.2 * Math.sin(tImp * 0.08) * Math.exp(-tImp / 130)
        blitArrow(ctx, G.ex, G.ey, ang, G.len, 1 - span(tImp, 260, 440))
        if (tImp < 180) {
          const k = tImp / 180
          const rr = size * (0.12 + 0.24 * easeOutCubic(k))
          const d = (rr / 0.78) * 2
          blit(ctx, ringHot(), G.ex, G.ey, d, d, (1 - k) * 0.45, true, 0)
        }
        break
      }
      default:
        break
    }
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    layout(e, api)
    const size = api.size
    const at = { x: G.ex, level: e.from.level, side: e.from.side }
    if (G.kind === OUT) return
    if (G.kind === WALL) {
      // The shield owns this moment; the arrow only glances (and splinters) off it.
      api.sound('arrowHit', 0.3, at)
      const n = count(5)
      for (let i = 0; i < n; i++) {
        const a = G.ang + Math.PI + (Math.random() - 0.5) * 2.4
        const v = size * (1.4 + Math.random() * 2.2)
        spawn(G.ex, G.ey, Math.cos(a) * v, Math.sin(a) * v, 160 + Math.random() * 120, size * (0.035 + Math.random() * 0.03), HOT,
          { shape: 2, gravity: size * 5, drag: 3 })
      }
      return
    }
    if (G.kind === MISS) {
      api.sound('arrowHit', 0.45, at)
      spawnTileDust(G.ex, G.ey, size, 3, '#b8c2a6')
      spawnLeaves(G.ex, G.ey, size, 3)
      return
    }
    // A clean hit: a pierce on every stone struck, the heaviest where it stops.
    api.sound('arrowHit', G.killed ? 1 : 0.8, at)
    let landed = false
    for (let i = 0; i < e.hits.length; i++) {
      const h = e.hits[i]!
      if (h.amount > 0) landed = true
      const hx = api.cx(h.target.col, h.target.row)
      const hy = api.cy(h.target.col, h.target.row)
      spawnPierce(hx, hy, size, h.hpAfter <= 0, e.from.level >= 2)
      spawnChips(hx, hy, size, api.stoneOf(h.target), G.ang + Math.PI, 4)
      if (e.from.atkBonus > 0) spawnGold(hx, hy, size)
    }
    // The ribbon lets go: wisps peel off along the line the arrow flew.
    const w = wispId()
    const n = count(4)
    for (let i = 0; i < n; i++) {
      const t = (i + Math.random()) / n
      const x = G.sx + (G.ex - G.sx) * t
      const y = G.sy + (G.ey - G.sy) * t
      const s = Math.random() < 0.5 ? -1 : 1
      const v = size * (0.7 + Math.random() * 0.8)
      spawn(x, y, G.nx * s * v + G.fx * size * 0.4, G.ny * s * v + G.fy * size * 0.4, 260 + Math.random() * 140,
        size * (0.14 + Math.random() * 0.08), HOT,
        { shape: w >= 0 ? 4 : 2, sprite: w, rot: Math.atan2(G.ny * s, G.nx * s) + Math.PI / 2, vrot: s * 3, drag: 2.2, fade: 0, grow: 1 })
    }
    if (landed) api.shake('small')
  }
}

/** Stars for the stones the arrow passes THROUGH (a Lv 2 bow's first target), and the one it stops in. */
const paintPassStars = (e: Shot, api: FxApi, tMs: number, dur: number, big: boolean): void => {
  const size = api.size
  for (let i = 0; i < e.hits.length; i++) {
    const h = e.hits[i]!
    const x = api.cx(h.target.col, h.target.row)
    const y = api.cy(h.target.col, h.target.row)
    // When the head reaches this stone, on the flight's clock.
    const along = (x - G.hx0) * G.fx + (y - G.hy0) * G.fy
    const u = i === G.last ? 1 : clamp01(along / G.fly)
    const tHit = (DRAW_END + u * (IMPACT - DRAW_END)) * dur
    paintPierce(api.ctx, size, x, y, (tMs - tHit) / STAR_MS, big || h.hpAfter <= 0)
  }
}

/** The burst of one pierce: splinters out the far side, emerald spall back, leaves, wisps. */
const spawnPierce = (x: number, y: number, size: number, kill: boolean, big: boolean): void => {
  const n = count(big ? 10 : 8)
  for (let i = 0; i < n; i++) {
    const a = G.ang + (Math.random() - 0.5) * 1.1
    const v = size * (2.6 + Math.random() * 3.4)
    spawn(x + G.fx * size * 0.15, y + G.fy * size * 0.15, Math.cos(a) * v, Math.sin(a) * v, 170 + Math.random() * 170,
      size * (0.035 + Math.random() * 0.03), i % 3 === 0 ? ACCENT : HOT, { shape: 2, gravity: size * 4, drag: 3.2 })
  }
  const m = count(6)
  for (let i = 0; i < m; i++) {
    const a = G.ang + Math.PI + (Math.random() - 0.5) * 2.6
    const v = size * (1.4 + Math.random() * 2.2)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 200 + Math.random() * 180, size * (0.04 + Math.random() * 0.03), CORE,
      { shape: 2, gravity: size * 5, drag: 2.6 })
  }
  spawnLeaves(x, y, size, kill ? 6 : 4)
  const w = wispId()
  const k = count(kill ? 6 : 4)
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + Math.random() * 0.5
    const v = size * (1 + Math.random() * 0.6)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 260 + Math.random() * 160, size * (0.17 + Math.random() * 0.08), HOT,
      { shape: w >= 0 ? 4 : 2, sprite: w, rot: a + Math.PI / 2, drag: 3, fade: 0, grow: 1 })
  }
}

const spawnLeaves = (x: number, y: number, size: number, n: number): void => {
  const id = leafId()
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = G.ang + (Math.random() - 0.5) * 2.6
    const v = size * (0.9 + Math.random() * 1.5)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 0.9, 520 + Math.random() * 340, size * (0.06 + Math.random() * 0.035), CORE,
      { additive: false, shape: id >= 0 ? 5 : 1, sprite: id, gravity: size * 3.2, drag: 1.6, vrot: (Math.random() - 0.5) * 16, fade: 2 })
  }
}

/** A bow the cross sharpened leaves a few gold glints where it strikes. */
const spawnGold = (x: number, y: number, size: number): void => {
  const id = goldGlintId()
  const k = count(3)
  for (let i = 0; i < k; i++) {
    spawn(x + (Math.random() - 0.5) * size * 0.5, y + (Math.random() - 0.5) * size * 0.4, (Math.random() - 0.5) * size * 0.4, -size * (0.5 + Math.random() * 0.4),
      420 + Math.random() * 200, size * (0.12 + Math.random() * 0.06), GOLD, { shape: id >= 0 ? 4 : 0, sprite: id, vrot: 2, fade: 1, grow: 2 })
  }
}
