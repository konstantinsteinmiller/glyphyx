import { rollerPierce } from '@/game/rules'
import type { FxApi, RuneEvent, RuneFx, Shot } from './types'
import {
  blit, bump, clamp01, coreSprite, count, dirAngle, easeOutBack, easeOutCubic, glintSprite, glowSprite, hash01, lerp, mix,
  poolSprite, ringSprite, runeColor, span, spawn, spawnChips
} from './kit'
import {
  DUST, DUST_DARK, GRAVEL_KINDS, TEAL_HOT, burstSprite, crackMark, crystalSprite, dustRingSprite, fractureSprite, gravelSprite, pitMark,
  puffSprite, rockBody, rockShade, shadowSprite, shardSprite
} from './roller.art'

/**
 * ─── Boulder (`roller`) — the stone down its lane ───────────────────────────
 *
 * Events: `shot` with `weapon: 'roll'`. `path` is the lane the boulder
 * travels, ending where it stopped; `hits` everything it struck on the way —
 * and it can strike its OWN side (friendly fire), which is why it paints in
 * the rune's teal and the colours of rock and dust, never in a side colour.
 * Never intercepted.
 *
 * The beat, over the event's window (`p`, 320 ms in play):
 *
 *   0 … LAUNCH     THE HEAVE. The roller's stone leans back and squashes; in
 *                  front of it the floor cracks and a boulder heaves up out of
 *                  it — rock, inked, with teal crystal in it — in a spray of
 *                  grit.
 *   LAUNCH         The stone lunges and SHOVES it: it goes.
 *   … IMPACT       THE ROLL. Accelerating (it is heavy — fastest at the end),
 *                  its surface turning under a fixed light, billows of dust
 *                  laid down behind it, grit flicked off the sides, the stones
 *                  ahead shivering on their tiles. A stone it breaks is
 *                  crunched flat as it rolls through.
 *   IMPACT         THE CRUSH on the stone that stops it: a jagged teal-white
 *                  impact frame, a teal ring and a dust ring thrown along the
 *                  floor, a fan of fractures glowing teal, gravel and crystal
 *                  splinters, the stone shoved back.
 *   … tail         It rocks back off the stone, splits along teal cracks and
 *                  crumbles into rubble; the dust settles, the fissures cool.
 *
 * The squint test: a round inked MASS with a trail of dust behind it and a
 * flattened ring on the floor where it stops. Nothing else on the board rolls.
 *
 * Cues: `roll` (the heave and the roll, from `start`), `rollHit` (power 1 for
 * the crush, ~0.5 for a stone rolled through) — `runeSfx/roller.ts`.
 */

const CORE = runeColor('roller')

/** When the rock is shoved off. */
const LAUNCH = 0.2
/** When it strikes the stone that stops it — the renderer applies every hit here. */
const IMPACT = 0.72
const TAIL_MS = 440
/** How long after the blow the rock gives out and crumbles. */
const CRUMBLE_MS = 130
/** The dust wake: one billow every this many tiles of travel. */
const WAKE_STEP = 0.28

// ─── The lane, worked out per frame into one scratch object ─────────────────

interface Lane {
  /** The roller's tile. */
  x0: number; y0: number
  /** Unit heading, and its angle. */
  dx: number; dy: number; ang: number
  /** Where the rock heaves up, and where it is at the moment of the blow. */
  sx: number; sy: number; ex: number; ey: number
  /** px between the two. */
  len: number
  /** The rock's radius, px. */
  r: number
  /** Index into `hits` of the stone that stopped it, or −1 (it rolled to the edge). */
  stop: number
  /** The stones it rolls THROUGH: their index into `hits`, and where along the travel (0…1) it meets them. */
  passN: number
  pass: number[]
  passAt: number[]
}

const L: Lane = {
  x0: 0, y0: 0, dx: 0, dy: -1, ang: -Math.PI / 2, sx: 0, sy: 0, ex: 0, ey: 0, len: 1, r: 1,
  stop: -1, passN: 0, pass: [0, 0, 0, 0], passAt: [0, 0, 0, 0]
}

const lane = (e: Shot, api: FxApi): Lane => {
  const size = api.size
  L.x0 = api.cx(e.from.col, e.from.row)
  L.y0 = api.cy(e.from.col, e.from.row)
  const last = e.path[e.path.length - 1]
  let lx: number
  let ly: number
  if (last) {
    lx = api.cx(last.col, last.row)
    ly = api.cy(last.col, last.row)
  } else {
    const a = dirAngle(e.from.dir)
    lx = L.x0 + Math.cos(a) * size
    ly = L.y0 + Math.sin(a) * size
  }
  const d = Math.hypot(lx - L.x0, ly - L.y0) || 1
  L.dx = (lx - L.x0) / d
  L.dy = (ly - L.y0) / d
  L.ang = Math.atan2(L.dy, L.dx)
  L.r = size * (e.from.level >= 2 ? 0.38 : 0.34)
  // Who stops it: the first survivor once the pierce budget is spent (the
  // resolver's own rule, read back off the hits).
  let pierce = rollerPierce(e.from.level)
  L.stop = -1
  L.passN = 0
  for (let i = 0; i < e.hits.length; i++) {
    const h = e.hits[i]!
    if (h.hpAfter > 0) {
      if (pierce > 0) pierce--
      else { L.stop = i; break }
    }
    if (L.passN < L.pass.length) L.pass[L.passN++] = i
  }
  const rest = L.r + size * 0.24
  let reach = Infinity
  if (L.stop >= 0) {
    // It comes to rest against the front of the stone that held…
    const t = e.hits[L.stop]!.target
    const tx = api.cx(t.col, t.row)
    const ty = api.cy(t.col, t.row)
    reach = (tx - L.x0) * L.dx + (ty - L.y0) * L.dy
    L.ex = tx - L.dx * rest
    L.ey = ty - L.dy * rest
  } else {
    // …or runs out of lane at the board's edge.
    L.ex = lx + L.dx * size * 0.2
    L.ey = ly + L.dy * size * 0.2
  }
  // It heaves up at the front edge of the roller's tile — nearer, when the
  // stone that will stop it is right there.
  const lead = Math.max(size * 0.25, Math.min(size * 0.54, reach - rest - size * 0.2))
  L.sx = L.x0 + L.dx * lead
  L.sy = L.y0 + L.dy * lead
  L.len = Math.max(1, (L.ex - L.sx) * L.dx + (L.ey - L.sy) * L.dy)
  for (let k = 0; k < L.passN; k++) {
    const t = e.hits[L.pass[k]!]!.target
    const along = (api.cx(t.col, t.row) - L.sx) * L.dx + (api.cy(t.col, t.row) - L.sy) * L.dy
    L.passAt[k] = clamp01((along - size * 0.26) / L.len)
  }
  return L
}

/** Travel 0…1 → distance 0…1: shoved off, then gathering speed, fastest at the blow. */
const travel = (k: number): number => 0.3 * k + 0.7 * k * k
/** …and back: the travel (0…1) at which it has covered distance `f`. */
const travelAt = (f: number): number => (-0.3 + Math.sqrt(0.09 + 2.8 * clamp01(f))) / 1.4

// ─── Per-event memory (a small ring; nothing allocated per frame) ───────────

const F_LAUNCHED = 1
const F_ROLLER = 2
const F_STOPPER = 4
const F_CRUMBLED = 8
const F_PASS = 16 // << k: a pass-through crunch has fired
const F_PASS_DONE = 256 // << k: …and its stone has been let go

interface Slot { e: Shot | null; flags: number; seams: number; passMs: number[] }

const SLOTS: Slot[] = [0, 1, 2, 3, 4, 5].map(() => ({ e: null, flags: 0, seams: 0, passMs: [0, 0, 0, 0] }))
let slotNext = 0

const slotOf = (e: Shot): Slot => {
  for (let i = 0; i < SLOTS.length; i++) if (SLOTS[i]!.e === e) return SLOTS[i]!
  const s = SLOTS[slotNext]!
  slotNext = (slotNext + 1) % SLOTS.length
  s.e = e
  s.flags = 0
  s.seams = 0
  return s
}

// ─── Pebble acting ──────────────────────────────────────────────────────────

/** Pose a stone along the lane: `off` tiles along the heading, `side` across it, and a scale along / across it. */
const poseLane = (api: FxApi, id: number, off: number, along?: number, across?: number, side = 0): void => {
  const size = api.size
  const ox = (L.dx * off - L.dy * side) * size
  const oy = (L.dy * off + L.dx * side) * size
  if (along === undefined || across === undefined) { api.pose(id, ox, oy); return }
  if (Math.abs(L.dx) > Math.abs(L.dy)) api.pose(id, ox, oy, along, across)
  else api.pose(id, ox, oy, across, along)
}

/** A stone shivering on its tile, `amp` tiles. Deterministic in the renderer's clock. */
const tremble = (api: FxApi, id: number, amp: number): void => {
  const a = amp * api.size
  api.pose(id, a * Math.sin(api.now * 0.13 + id * 1.7), a * 0.7 * Math.sin(api.now * 0.17 + id * 2.9))
}

// ─── The rock ───────────────────────────────────────────────────────────────

/**
 * Surface features, as points on the sphere: [longitude, latitude, kind
 * (0 crystal, 1 crack, 2 pit), size × radius]. The roll turns the longitude,
 * so they come up over the back of the rock and go down its front.
 */
const FEAT = [
  0.0, 0.3, 0, 0.66,
  0.85, -0.55, 1, 0.55,
  1.6, 0.52, 2, 0.34,
  2.35, -0.12, 0, 0.54,
  3.1, 0.62, 1, 0.5,
  3.9, -0.5, 2, 0.32,
  4.6, 0.12, 1, 0.58,
  5.4, -0.4, 0, 0.46
]
const FEAT_N = FEAT.length / 4
/** Screen positions of the crystals drawn this frame (x, y, facing), for their glints. */
const glintAt = new Float32Array(FEAT_N * 3)
let glintN = 0

const paintRock = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ang: number, roll: number,
  along: number, across: number, alpha: number
): void => {
  glintN = 0
  const body = rockBody()
  const shade = rockShade()
  if (!body || !shade) {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#6f6456'
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = CORE
    ctx.lineWidth = r * 0.12
    ctx.stroke()
    ctx.restore()
    return
  }
  // The bake's silhouette is 0.88 of its width.
  const D = (r * 2) / 0.88
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  if (along !== 1 || across !== 1) { ctx.rotate(ang); ctx.scale(along, across); ctx.rotate(-ang) }
  ctx.drawImage(body, -D / 2, -D / 2, D, D)
  // The surface, in the heading's frame: +x is forward, so a feature crosses
  // the disc from the back edge to the front one as the rock turns.
  ctx.rotate(ang)
  const ca = Math.cos(ang)
  const sa = Math.sin(ang)
  for (let i = 0; i < FEAT_N; i++) {
    const th = FEAT[i * 4]! + roll
    const z = Math.cos(th)
    if (z <= 0.06) continue
    const phi = FEAT[i * 4 + 1]!
    const kind = FEAT[i * 4 + 2]!
    const cp = Math.cos(phi)
    const fx = r * 0.86 * cp * Math.sin(th)
    const fy = r * 0.86 * Math.sin(phi)
    const spr = kind === 0 ? crystalSprite() : kind === 1 ? crackMark(i & 1) : pitMark()
    if (!spr) continue
    const sc = FEAT[i * 4 + 3]! * r
    const w = sc * 2 * z
    const h = sc * 2 * cp
    ctx.globalAlpha = alpha * Math.min(1, z * 3)
    ctx.drawImage(spr, fx - w / 2, fy - h / 2, w, h)
    if (kind === 0 && z > 0.3) {
      glintAt[glintN * 3] = x + fx * ca - fy * sa
      glintAt[glintN * 3 + 1] = y + fx * sa + fy * ca
      glintAt[glintN * 3 + 2] = z
      glintN++
    }
  }
  ctx.rotate(-ang)
  ctx.globalAlpha = alpha
  ctx.drawImage(shade, -D / 2, -D / 2, D, D)
  ctx.restore()
}

// ─── Particles ──────────────────────────────────────────────────────────────

// Pool ids by constant key and maker, so a burst builds no strings and no closures.
const GRAVEL_KEYS = [0, 1, 2, 3].map((i) => `roller|gravel|${i}`)
const GRAVEL_MAKE = [0, 1, 2, 3].map((i) => () => gravelSprite(i))
const gravelId = (i: number): number => poolSprite(GRAVEL_KEYS[i % GRAVEL_KINDS]!, GRAVEL_MAKE[i % GRAVEL_KINDS]!)
const shardId = (): number => poolSprite('roller|shard', shardSprite)

/** A kit sprite fetched once and held: the per-frame path then builds no bake key. */
const once = (make: () => HTMLCanvasElement | null): (() => HTMLCanvasElement | null) => {
  let c: HTMLCanvasElement | null | undefined
  return () => (c !== undefined ? c : (c = make()))
}
const glintHot = once(() => glintSprite(TEAL_HOT, 48))
const GLINT_KEY = `glint|${TEAL_HOT}`
const glintId = (): number => poolSprite(GLINT_KEY, glintHot)
const ringTeal = once(() => ringSprite(CORE, 192, 0.12))
const ringHot = once(() => ringSprite(TEAL_HOT, 192, 0.08))
const coreTeal = once(() => coreSprite(CORE, 192))
const glowTeal = once(() => glowSprite(CORE, 192))

/** Gravel thrown from (x, y) round `ang` ± `spread`: inked rock chunks, tumbling, falling back. */
const gravel = (x: number, y: number, size: number, n: number, ang: number, spread: number, speed: number, big = 1, lift = 1): void => {
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = ang + (Math.random() - 0.5) * spread
    const v = size * speed * (0.45 + Math.random() * 0.75)
    const id = gravelId(i)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * lift * (0.8 + Math.random() * 1.2), 420 + Math.random() * 360,
      size * (0.04 + Math.random() * 0.04) * big, '#7c705f',
      { additive: false, shape: id >= 0 ? 4 : 1, sprite: id, gravity: size * 10, drag: 0.9, vrot: (Math.random() - 0.5) * 18, fade: 2 })
  }
}

/** Dust rolling out along the floor: soft, warm, non-additive, growing as it thins. */
const dust = (x: number, y: number, size: number, n: number, ang: number, spread: number, speed: number, big = 1, life = 1): void => {
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = ang + (Math.random() - 0.5) * spread
    const v = size * speed * (0.4 + Math.random() * 0.8)
    spawn(x + (Math.random() - 0.5) * size * 0.2, y + (Math.random() - 0.5) * size * 0.12, Math.cos(a) * v, Math.sin(a) * v * 0.55 - size * 0.12,
      (440 + Math.random() * 340) * life, size * (0.11 + Math.random() * 0.09) * big, i % 3 === 0 ? DUST_DARK : DUST,
      { additive: false, shape: 3, alpha: 0.36, drag: 2.8, grow: 1 })
  }
}

/** Teal crystal splinters: bright, additive, flying straight and falling. */
const splinters = (x: number, y: number, size: number, n: number, ang: number, spread: number, speed: number): void => {
  const id = shardId()
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = ang + (Math.random() - 0.5) * spread
    const v = size * speed * (0.5 + Math.random() * 0.7)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 0.8, 300 + Math.random() * 280, size * (0.07 + Math.random() * 0.05), CORE,
      { shape: id >= 0 ? 4 : 2, sprite: id, rot: -a, gravity: size * 6, drag: 1.6, vrot: (Math.random() - 0.5) * 3, fade: 1 })
  }
}

/** Velocity-aligned teal sparks off a blow. */
const sparks = (x: number, y: number, size: number, n: number, ang: number, spread: number): void => {
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = ang + (Math.random() - 0.5) * spread
    const v = size * (2.4 + Math.random() * 2.6)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 170 + Math.random() * 170, size * (0.035 + Math.random() * 0.03),
      Math.random() < 0.35 ? TEAL_HOT : CORE, { shape: 2, gravity: size * 5, drag: 3 })
  }
}

/** Crystal glints that hang in the air and twinkle out. */
const glints = (x: number, y: number, size: number, n: number, reach: number): void => {
  const id = glintId()
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2
    const d = size * reach * Math.random()
    spawn(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, Math.cos(a) * size * 0.3, -size * (0.3 + Math.random() * 0.4),
      320 + Math.random() * 260, size * (0.1 + Math.random() * 0.08), TEAL_HOT, { shape: id >= 0 ? 6 : 0, sprite: id, drag: 1.5, fade: 1, grow: 2 })
  }
}

// ─── The module ─────────────────────────────────────────────────────────────

export const roller: RuneFx = {
  type: 'roller',
  palette: { core: CORE, hot: TEAL_HOT, deep: mix(CORE, '#000000', 0.6), accent: DUST },

  impactAt: (e) => (e.kind === 'shot' ? IMPACT : undefined),
  tailMs: (e) => (e.kind === 'shot' ? TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    const s = slotOf(e)
    s.flags = 0
    s.seams = 0
    const l = lane(e, api)
    const size = api.size
    api.sound('roll', 0.85, { x: l.x0, level: e.from.level, side: e.from.side })
    // The floor gives where the rock comes up: grit and dust thrown up and out.
    gravel(l.sx, l.sy + size * 0.1, size, 5, -Math.PI / 2, Math.PI * 1.3, 1.3, 1, 0.9)
    dust(l.sx, l.sy + size * 0.18, size, 3, -Math.PI / 2, Math.PI * 2, 0.9, 0.9, 0.9)
    // Bake the rock now, so its first frame on screen does not pay for it.
    rockBody(); rockShade(); crystalSprite(); crackMark(0); crackMark(1); pitMark(); shadowSprite(); puffSprite(); fractureSprite(false)
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind !== 'shot') return
    const l = lane(e, api)
    const s = slotOf(e)
    const ctx = api.ctx
    const size = api.size
    const tier = api.tier
    const ms = p * e.dur
    const after = ms - IMPACT * e.dur
    const lv2 = e.from.level >= 2
    const stopped = l.stop >= 0

    // ── Where the rock is ──
    const k = p < LAUNCH ? 0 : span(p, LAUNCH, IMPACT)
    const f = travel(k)
    // A short lane (the stone that stops it is right there) gets a wind-up:
    // the rock rocks back into the roller's stone, then lunges.
    const wind = size * 0.16 * clamp01(1 - l.len / (size * 0.9))
    const run = l.len * f - wind * bump(clamp01(k / 0.5))
    let bx = l.sx + l.dx * run
    let by = l.sy + l.dy * run
    let grow = 1
    let alpha = 1
    let along = 1
    let across = 1
    let roll = (run / l.len) * 4.6
    if (p < LAUNCH) {
      // Heaved up out of the floor: it swells, rises from below and rocks back once.
      const a = p / LAUNCH
      grow = 0.3 + 0.7 * easeOutBack(a)
      alpha = clamp01(a * 4)
      by += size * 0.14 * (1 - easeOutCubic(a))
      roll = -0.4 * bump(a)
    } else if (after >= 0) {
      // The blow: a squash against the stone, then it rocks back and settles.
      const sq = bump(clamp01(after / 80))
      along = 1 - 0.22 * sq
      across = 1 + 0.15 * sq
      const back = size * (stopped ? 0.13 : 0.05) * easeOutCubic(clamp01((after - 20) / 90)) - size * 0.025 * bump(clamp01((after - 90) / 50))
      bx -= l.dx * back
      by -= l.dy * back
      roll -= back / l.r
      if (after >= CRUMBLE_MS) alpha = 1 - clamp01((after - CRUMBLE_MS) / 45)
    }
    const r = l.r * grow

    // ── The stones: the heave, the shiver, the crunch, the shove ──
    if (!(s.flags & F_ROLLER)) {
      if (p < LAUNCH) {
        const a = easeOutCubic(p / LAUNCH)
        poseLane(api, e.from.id, -0.09 * a, 1 - 0.2 * a, 1 + 0.15 * a)
      } else if (p < LAUNCH + 0.07) {
        poseLane(api, e.from.id, lerp(-0.09, 0.1, span(p, LAUNCH, LAUNCH + 0.07)), 1.16, 0.88)
      } else if (p < LAUNCH + 0.34) {
        const a = span(p, LAUNCH + 0.07, LAUNCH + 0.34)
        poseLane(api, e.from.id, 0.1 * (1 - easeOutCubic(a)) - 0.03 * bump(a))
      } else {
        api.pose(e.from.id, 0, 0, 1, 1)
        s.flags |= F_ROLLER
      }
    }
    const rockAlong = (bx - l.x0) * l.dx + (by - l.y0) * l.dy
    for (let j = 0; j < l.passN; j++) {
      const h = e.hits[l.pass[j]!]!
      const id = h.target.id
      if (s.flags & (F_PASS_DONE << j)) continue
      if (!(s.flags & (F_PASS << j))) {
        const ahead = (api.cx(h.target.col, h.target.row) - l.x0) * l.dx + (api.cy(h.target.col, h.target.row) - l.y0) * l.dy - rockAlong
        const near = clamp01(1 - (ahead - size * 0.3) / (size * 1.6))
        tremble(api, id, 0.006 + 0.03 * near * near)
      } else {
        const t = ms - s.passMs[j]!
        // Rolled over: pressed flat and shoved aside, then let go — well
        // before its own shatter takes it off the board.
        if (t < 120 && !(h.hpAfter <= 0 && p > 0.9)) {
          const b = bump(clamp01(t / 120))
          poseLane(api, id, 0.05 * b, 1 - 0.3 * b, 1 + 0.2 * b, (id & 1 ? 0.1 : -0.1) * b)
        } else {
          api.pose(id, 0, 0)
          s.flags |= F_PASS_DONE << j
        }
      }
    }
    if (stopped && !(s.flags & F_STOPPER)) {
      const id = e.hits[l.stop]!.target.id
      if (after < 0) {
        const ahead = Math.max(0, (l.ex - bx) * l.dx + (l.ey - by) * l.dy)
        const near = clamp01(1 - ahead / (size * 1.8))
        tremble(api, id, 0.006 + 0.034 * near * near)
      } else if (after < 170) {
        const b = 1 - easeOutCubic(clamp01(after / 170))
        const j = 0.02 * b * Math.sin(api.now * 0.2 + id)
        poseLane(api, id, 0.13 * b, after < 50 ? 0.84 : undefined, after < 50 ? 1.12 : undefined, j)
      } else {
        api.pose(id, 0, 0)
        s.flags |= F_STOPPER
      }
    }

    // ── What happens on the way: the shove, the seams, the stones rolled through, the crumble ──
    if (p >= LAUNCH && !(s.flags & F_LAUNCHED)) {
      s.flags |= F_LAUNCHED
      // Shoved: grit sprays out from under it, back and to the sides.
      gravel(l.sx, l.sy + size * 0.12, size, 5, l.ang + Math.PI, 2.6, 2.2, 1, 0.6)
      dust(l.sx, l.sy + size * 0.2, size, 3, l.ang + Math.PI, 2.4, 1.5)
      glints(l.sx, l.sy, size, 2, 0.4)
    }
    if (p >= LAUNCH && after < 0) {
      // A kick of dust where it drops over each tile seam.
      for (let i = 0; i < 3; i++) {
        if (s.seams & (1 << i)) continue
        const at = (i + 0.5) * size
        if (rockAlong < at || at < (l.sx - l.x0) * l.dx + (l.sy - l.y0) * l.dy) continue
        s.seams |= 1 << i
        const x = l.x0 + l.dx * at
        const y = l.y0 + l.dy * at
        for (let q = -1; q <= 1; q += 2) {
          spawn(x - l.dy * q * size * 0.3, y + l.dx * q * size * 0.3 + size * 0.1, -l.dy * q * size * 1.1, l.dx * q * size * 1.1 - size * 0.25,
            340 + Math.random() * 200, size * (0.1 + Math.random() * 0.04), DUST, { additive: false, shape: 3, alpha: 0.32, drag: 3, grow: 1 })
        }
      }
      // Grit flicked off its flanks (per frame, top tier only).
      if (tier > 1 && api.canEmit && k > 0.05 && Math.random() < 0.7) {
        const side = Math.random() < 0.5 ? 1 : -1
        gravel(bx - l.dx * r * 0.5 - l.dy * side * r * 0.8, by - l.dy * r * 0.5 + l.dx * side * r * 0.8 + r * 0.3, size, 1,
          l.ang + Math.PI - side * 1.25, 0.7, 1.7, 0.9, 0.6)
      }
    }
    for (let j = 0; j < l.passN; j++) {
      if (s.flags & (F_PASS << j)) continue
      if (p < LAUNCH || f < l.passAt[j]!) continue
      s.flags |= F_PASS << j
      s.passMs[j] = ms
      const h = e.hits[l.pass[j]!]!
      const tx = api.cx(h.target.col, h.target.row)
      const ty = api.cy(h.target.col, h.target.row)
      const cx = tx - l.dx * size * 0.24
      const cy = ty - l.dy * size * 0.24
      spawnChips(tx, ty, size, api.stoneOf(h.target), l.ang, 6)
      gravel(cx, cy, size, 5, l.ang, 2.6, 2.2)
      sparks(cx, cy, size, 6, l.ang, 1.6)
      dust(tx, ty + size * 0.2, size, 2, l.ang + Math.PI, 3, 1.1)
      api.flash(h.target.id, 0.85)
      api.sound('rollHit', 0.5, { x: tx, level: e.from.level, side: e.from.side })
      api.shake('small')
    }
    if (after >= CRUMBLE_MS && !(s.flags & F_CRUMBLED)) {
      s.flags |= F_CRUMBLED
      // It gives out: the rock splits into the rubble it was made of.
      gravel(bx, by, size, 7, -Math.PI / 2, Math.PI * 2, 1.6, 1.9, 0.8)
      dust(bx, by + r * 0.4, size, 3, -Math.PI / 2, Math.PI * 2, 0.9, 1.1, 1.1)
      splinters(bx, by, size, 4, -Math.PI / 2, 2.6, 2.4)
    }

    // ── Paint: the floor first, then the rock, then the light ──
    const contactX = l.ex + l.dx * l.r * 0.9
    const contactY = l.ey + l.dy * l.r * 0.9

    // Where it came up: the floor cracked open under it, closing as the dust settles.
    if (p < LAUNCH + 0.6) {
      const a = clamp01(p / (LAUNCH * 0.5)) * (1 - clamp01((p - LAUNCH) / 0.6)) * 0.75
      const w = size * 0.9
      blit(ctx, fractureSprite(false), l.sx, l.sy + size * 0.06, w, w * 0.7, a, false, 0)
      blit(ctx, fractureSprite(false), l.sx, l.sy + size * 0.06, w, w * 0.7, a, false, Math.PI)
    }
    // The fractures fanned out on the floor behind it, where it hit.
    if (after >= 0 && stopped) {
      const w = size * (lv2 ? 1.5 : 1.3)
      const fx = contactX - l.dx * size * 0.12
      const fy = contactY - l.dy * size * 0.12
      const dark = clamp01(after / 30) * (1 - clamp01((after - 230) / 230)) * 0.85
      blit(ctx, fractureSprite(false), fx, fy, w, w, dark, false, l.ang)
      if (tier > 0) {
        const hot = (1 - clamp01(after / 300)) * (0.75 + 0.25 * Math.sin(after * 0.09))
        blit(ctx, fractureSprite(true), fx, fy, w, w, hot, true, l.ang)
      }
    }
    // The dust wake: billows laid down as it passes, spreading and thinning.
    if (p >= LAUNCH) {
      const puff = puffSprite()
      const step = size * WAKE_STEP
      const n = Math.min(12, Math.floor(l.len / step))
      const span01 = IMPACT - LAUNCH
      for (let i = 0; i < n; i++) {
        const di = (i + 0.35) * step
        const born = LAUNCH + travelAt(di / l.len) * span01
        if (p < born) break
        const age = (p - born) * e.dur
        const life = clamp01(age / 520)
        const a = 0.36 * clamp01(age / 60) * Math.pow(1 - life, 1.3) * (i === 0 ? 0.6 : 1)
        if (a <= 0.01) continue
        const hsh = hash01(i * 7 + 3)
        const side = (i % 2 === 0 ? 1 : -1) * size * (0.06 + 0.2 * easeOutCubic(life)) * (0.6 + hsh * 0.6)
        const w = size * (0.3 + 0.36 * easeOutCubic(life)) * (0.85 + hsh * 0.35) * (lv2 ? 1.15 : 1)
        const x = l.sx + l.dx * (di - size * 0.08 * life) - l.dy * side
        const y = l.sy + l.dy * (di - size * 0.08 * life) + l.dx * side + size * 0.12
        blit(ctx, puff, x, y, w, w * 0.62, a, false)
      }
    }
    // The ground shock: a ring of dust along the floor, a teal ring inside it.
    if (after >= 0) {
      const big = stopped ? (lv2 ? 1.2 : 1) : 0.7
      const kd = clamp01(after / 400)
      const wd = size * (0.5 + 1.6 * easeOutCubic(kd)) * big
      blit(ctx, dustRingSprite(), contactX, contactY, wd, wd * 0.6, 0.8 * Math.pow(1 - kd, 1.3), false)
      if (stopped) {
        const kt = clamp01(after / 250)
        const wt = size * (0.4 + 1.35 * easeOutCubic(kt)) * big
        blit(ctx, ringTeal(), contactX, contactY, wt, wt * 0.6, (1 - kt) * 0.95, true)
        if (lv2 && after > 50) {
          const k2 = clamp01((after - 50) / 320)
          const w2 = size * (0.35 + 1.8 * easeOutCubic(k2))
          blit(ctx, ringHot(), contactX, contactY, w2, w2 * 0.6, (1 - k2) * 0.7, true)
        }
      }
    }

    // The rock itself.
    if (alpha > 0.01) {
      // The crystal in it lights the floor round it — stronger from Lv 2.
      if (tier > 0) blit(ctx, glowTeal(), bx, by, r * (lv2 ? 4 : 3.4), r * (lv2 ? 4 : 3.4), (lv2 ? 0.34 : 0.2) * alpha, true)
      blit(ctx, shadowSprite(), bx + r * 0.1, by + r * 0.78, r * 2.4 * across, r * 0.9, 0.6 * alpha, false)
      paintRock(ctx, bx, by, r, l.ang, roll, along, across, alpha)
      if (tier > 1) {
        const g = glintHot()
        for (let i = 0; i < glintN; i++) {
          const z = glintAt[i * 3 + 2]!
          const tw = 0.6 + 0.4 * Math.sin(ms * 0.05 + i * 2.1)
          blit(ctx, g, glintAt[i * 3]!, glintAt[i * 3 + 1]!, r * 0.7 * z, r * 0.7 * z, 0.75 * z * tw * alpha, true)
        }
      }
      // Splitting: teal light out of cracks running back from the struck face,
      // just before it gives out.
      if (after > 10 && tier > 0) {
        const c = clamp01((after - 10) / (CRUMBLE_MS - 10))
        blit(ctx, fractureSprite(true), bx + l.dx * r * 0.75, by + l.dy * r * 0.75, r * 2.6, r * 2.6, c * alpha, true, l.ang)
      }
    }

    // The impact frame: a jagged burst thrown back off the blow, three frames,
    // and a teal bloom — off the stone's face, so the stone stays readable.
    if (after >= 0 && after < 110) {
      const a = 1 - after / 110
      const bx2 = contactX - l.dx * size * 0.08
      const by2 = contactY - l.dy * size * 0.08
      if (stopped && after < 80) {
        const w = size * (1.25 + 0.6 * (after / 80)) * (lv2 ? 1.15 : 1)
        blit(ctx, burstSprite(), bx2, by2, w, w, 1 - after / 80, true, l.ang)
      }
      blit(ctx, coreTeal(), bx2, by2, size * (stopped ? 0.9 : 0.6), size * (stopped ? 0.9 : 0.6), a * 0.8, true)
    }
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'shot') return
    const l = lane(e, api)
    const size = api.size
    const cx = l.ex + l.dx * l.r * 0.9
    const cy = l.ey + l.dy * l.r * 0.9
    const back = l.ang + Math.PI
    if (l.stop >= 0) {
      const h = e.hits[l.stop]!
      const lv2 = e.from.level >= 2
      api.sound('rollHit', 1, { x: api.cx(h.target.col, h.target.row), level: e.from.level, side: e.from.side })
      api.shake('strong')
      // Dust thrown out ALONG the floor, both ways round the stone and back.
      dust(cx, cy + size * 0.08, size, lv2 ? 9 : 7, back, Math.PI * 1.7, 2.6, lv2 ? 1.1 : 0.95, 1)
      // Gravel fanned back off the blow, and chunks of the stone it hit.
      gravel(cx, cy, size, lv2 ? 12 : 10, back, 2.8, 3.4)
      spawnChips(cx, cy, size, api.stoneOf(h.target), l.ang, 5)
      // The crystal in the rock shatters teal.
      splinters(cx, cy, size, lv2 ? 11 : 8, back, 3.2, 3.6)
      sparks(cx, cy, size, 7, back, 2.8)
      glints(cx, cy, size, 3, 0.6)
      api.flash(h.target.id, 0.7)
    } else {
      // It ran out of lane: a heavy stop against the edge, and nothing to break.
      api.sound('rollHit', 0.45, { x: l.ex, level: e.from.level, side: e.from.side })
      api.shake('small')
      dust(cx, cy, size, 7, back, Math.PI * 1.4, 1.6)
      gravel(cx, cy, size, 5, back, 2.4, 2.2)
    }
  }
}
