import type { FxApi, RuneEvent, RuneFx, Shot } from './types'
import type { Hit } from '@/game/rules'
import {
  blit, bump, clamp01, coreSprite, count, dirAngle, easeInOutCubic, easeOutBack, easeOutCubic, poolSprite, spawn, span
} from './kit'
import {
  DOME_RX, DOME_RY, SH_CORE, SH_CYAN, SH_DEEP, SH_HOT, SH_ICE, blitFloor, bubbleSprite, domeCy, flare6, flare6Sprite, glassSprite,
  hexMoteSprite, hexRing, hexRingSprite, hitPointX, hitPointY, iceGlow, newDomeLook, paintDome, rimRing, shardSprite, sigil, thread
} from './defense.dome'

/**
 * ─── Shield (`defense`) — the aura, the absorb, the wall ────────────────────
 *
 * The one rune whose whole identity is DEFENCE, and whose whole look is one
 * shape: a bubble of HEXAGONAL energy (`defense.dome.ts`) — clear in the
 * middle, rim-lit, a honeycomb etched into it — whose cells light up in a
 * ripple running out from wherever it was struck. Cold sky blue, ice and white;
 * hex tiles, glass shards and ricochet sparks; resonant, glassy sound.
 *
 *   · `aura` — a Lv 2 shield raising domes over its neighbours. The shield
 *     GATHERS (motes drawn in, a hex sigil blooming on its floor, the stone
 *     squashing down), RELEASES (a hex pulse, beads of light running down a
 *     thread to each neighbour), and each neighbour's dome RISES off the
 *     ground where the bead lands — its cells assembling bottom to top — then
 *     LOCKS with a flash of the whole honeycomb, holds, twinkles and settles.
 *   · `absorb(hit)` — damage eaten by a shield or by mitigation. A FULL block
 *     (`amount === 0`) is the dome snapping up solid and bright, a white rim,
 *     sparks skating round its surface and a hex shock ring: it held. A
 *     PARTIAL one flickers — the barrier straining — and chips off glass shards
 *     as it gives. A shield STONE's own dome is drawn once: by the wall when the
 *     blow was a projectile it stopped, otherwise by the absorb (see `pending`).
 *   · `interceptImpact` / `interceptPaint` — an arrow, a beam or a blade that
 *     stopped on a shield stone, each its own block: the ARROW dies on the
 *     barrier in a six-spike flare with a tight fast ripple and ricochets; the
 *     BEAM splashes — a hot spot held for as long as it pushes, ripple after
 *     ripple, sparks sheeting off round the curve; the BLADE is parried — the
 *     dome dents in and springs back, a scrape of light runs along its skin and
 *     sparks skate off in the swing.
 *
 * Cues: `shield` (absorb), `aura` (the raise), `intercept` (the wall) (`runeSfx/defense.ts`).
 */

const TAU = Math.PI * 2

// ─── Particle sprites (registered once) ─────────────────────────────────────

// The makers are hoisted so a lookup builds no closure; the keys are constants.
const mkBubble = (): HTMLCanvasElement | null => bubbleSprite(192, false)
const mkBubbleHot = (): HTMLCanvasElement | null => bubbleSprite(192, true)
const mkGlass = (): HTMLCanvasElement | null => glassSprite(192)
const mkHexRing = (): HTMLCanvasElement | null => hexRingSprite(SH_CORE, 192)
const mkCore = (): HTMLCanvasElement | null => coreSprite(SH_HOT, 48)
const mkFlare = (): HTMLCanvasElement | null => flare6Sprite(96)
const SHARD_KEYS = ['sh|shard|0', 'sh|shard|1', 'sh|shard|2'] as const
const SHARD_MAKERS = [(): HTMLCanvasElement | null => shardSprite(0), (): HTMLCanvasElement | null => shardSprite(1), (): HTMLCanvasElement | null => shardSprite(2)] as const

const pBubble = (): number => poolSprite('sh|bubble', mkBubble)
const pGlass = (): number => poolSprite('sh|glass', mkGlass)
const pBubbleHot = (): number => poolSprite('sh|bubble-hot', mkBubbleHot)
const pHexRing = (): number => poolSprite('sh|hexring', mkHexRing)
const pMote = (): number => poolSprite('sh|hexmote', hexMoteSprite)
const pShard = (i: number): number => poolSprite(SHARD_KEYS[i % 3]!, SHARD_MAKERS[i % 3]!)
const pCore = (): number => poolSprite('sh|core', mkCore)
const pFlare = (): number => poolSprite('sh|flare6', mkFlare)

/** A particle sprite drawn `2 × size` across holds the bubble's circle at 0.88 of that: size for a dome of radius `r`. */
const BUBBLE_PARTICLE = 0.44 * 2

// ─── Shared scratch ─────────────────────────────────────────────────────────

const look = newDomeLook()
/** The beam splash's particle options: one object, reused by the per-frame emitter. */
const SPLASH: NonNullable<Parameters<typeof spawn>[7]> = { shape: 2, drag: 3.5 }

const resetLook = (x: number, y: number, size: number): void => {
  look.x = x; look.y = y; look.size = size
  look.scale = 1; look.rise = 1; look.body = 0; look.flash = 0; look.rim = 0
  look.hx = Number.NaN; look.hy = Number.NaN; look.wave = 0; look.waveA = 0; look.heat = 0
  look.sweep = -1; look.twinkle = 0; look.clock = 0; look.dent = 1; look.dentAng = 0; look.cells = 1; look.reveal = 3
}

// ─── Bursts ─────────────────────────────────────────────────────────────────

/** Spark streaks thrown from (x, y) round `ang` ± `spread`, `speed` tiles/s. */
const sparks = (
  x: number, y: number, s: number, n: number, ang: number, spread: number, speed: number, life: number, color: string, gravity = 0
): void => {
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    const a = ang + (Math.random() - 0.5) * 2 * spread
    const v = s * speed * (0.55 + Math.random() * 0.7)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, life * (0.65 + Math.random() * 0.6), s * (0.035 + Math.random() * 0.03), color,
      { shape: 2, drag: 3.2, gravity: gravity * s })
  }
}

/** Sparks skating round a dome's skin from the unit-bubble angle `at`, both ways round (dir 0) or one way (±1). */
const skate = (x: number, y: number, s: number, n: number, at: number, dir: number, speed: number): void => {
  const k = count(n, 1)
  const cy = domeCy(y, s)
  for (let i = 0; i < k; i++) {
    const a = at + (Math.random() - 0.5) * 0.9
    const px = x + Math.cos(a) * s * DOME_RX * 0.98
    const py = cy + Math.sin(a) * s * DOME_RY * 0.98
    const way = dir !== 0 ? dir : (i % 2 === 0 ? 1 : -1)
    const t = a + way * Math.PI / 2
    const v = s * speed * (0.6 + Math.random() * 0.6)
    spawn(px, py, Math.cos(t) * v + Math.cos(a) * v * 0.25, Math.sin(t) * v + Math.sin(a) * v * 0.25,
      170 + Math.random() * 150, s * (0.03 + Math.random() * 0.025), i % 3 === 0 ? '#ffffff' : SH_ICE, { shape: 2, drag: 3.8 })
  }
}

/** Hex motes drifting up off a dome. */
const motes = (x: number, y: number, s: number, n: number, spreadX: number): void => {
  const id = pMote()
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    spawn(x + (Math.random() - 0.5) * s * spreadX, y + (Math.random() - 0.3) * s * 0.5,
      (Math.random() - 0.5) * s * 0.4, -s * (0.35 + Math.random() * 0.55),
      520 + Math.random() * 420, s * (0.07 + Math.random() * 0.05), SH_HOT,
      { shape: 4, sprite: id, drag: 1.1, fade: 1, rot: 0, vrot: (Math.random() - 0.5) * 2 })
  }
}

/** Glass shards chipping off a straining barrier, thrown round `ang`, then falling like glass. */
const shards = (x: number, y: number, s: number, n: number, ang: number, spread: number): void => {
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    const a = ang + (Math.random() - 0.5) * 2 * spread
    const v = s * (1 + Math.random() * 1.3)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v * 0.7 - s * 0.45, 380 + Math.random() * 200, s * (0.065 + Math.random() * 0.045), SH_HOT,
      { shape: 4, sprite: pShard(i), gravity: s * 10, drag: 1.2, vrot: (Math.random() - 0.5) * 16, fade: 2 })
  }
}

/** The dome as PARTICLES, for moments with no frame hook (an absorb): body, flash frame, ring. */
const domeBurst = (x: number, y: number, s: number, full: boolean): void => {
  const cy = domeCy(y, s)
  const size = (s * DOME_RX) / BUBBLE_PARTICLE * 1.04
  // The glass (normal blend, drawn under the light) and the body: solid for a
  // block that held, flickering — straining — for one that gave.
  spawn(x, cy, 0, 0, full ? 400 : 300, size, SH_CORE, { additive: false, shape: 4, sprite: pGlass(), rot: 0, fade: full ? 2 : 1, grow: 2, alpha: 0.75 })
  spawn(x, cy, 0, 0, full ? 400 : 300, size, SH_CORE, { shape: 4, sprite: pBubble(), rot: 0, fade: full ? 2 : 1, grow: 2, alpha: full ? 0.82 : 0.7 })
  // The flash frame: every cell lit for a few frames.
  spawn(x, cy, 0, 0, full ? 130 : 90, size, SH_CORE, { shape: 4, sprite: pBubbleHot(), rot: 0, grow: 2, alpha: full ? 0.45 : 0.32 })
  // A hex shock ring pulsing out through the barrier.
  spawn(x, cy, 0, 0, full ? 300 : 240, s * (full ? 0.42 : 0.36), SH_CORE, { shape: 4, sprite: pHexRing(), rot: 0, grow: 1, alpha: full ? 1 : 0.7 })
}

// ─── Absorb ─────────────────────────────────────────────────────────────────
//
// A shield STONE's absorb (its own mitigation) is followed, in the same call
// stack, by `interceptImpact` whenever the blow was a projectile it stopped —
// and then the wall draws the dome, dented and rippling from the struck side.
// Any other blow on a shield stone (an axe, a boulder, a shell, a blast) has
// no wall, so its absorb must draw the dome itself. The absorb cannot know
// which it is, so a shield stone's burst is PARKED here and spawned on the
// next microtask unless an intercept at the same spot claimed it first. One
// frame late at worst, never drawn twice.

interface Parked { x: number; y: number; s: number; full: boolean; live: boolean }
const PARK_N = 8
const parked: Parked[] = Array.from({ length: PARK_N }, () => ({ x: 0, y: 0, s: 0, full: false, live: false }))
let flushQueued = false

const absorbBurst = (x: number, y: number, s: number, full: boolean): void => {
  domeBurst(x, y, s, full)
  const cy = domeCy(y, s)
  if (full) {
    // It held: sparks skate round the skin and a few motes rise off the crown.
    skate(x, y, s, 10, -Math.PI / 2, 0, 2.2)
    motes(x, cy - s * 0.2, s, 3, 0.6)
    const f = pFlare()
    spawn(x, cy - s * DOME_RY * 0.85, 0, 0, 200, s * 0.28, SH_ICE, { shape: 4, sprite: f, rot: 0, grow: 2 })
  } else {
    // It gave: glass chips off the crown, a spit of sparks, the barrier flickers out.
    shards(x, cy - s * 0.3, s, 5, -Math.PI / 2, 1.1)
    sparks(x, cy - s * 0.25, s, 6, -Math.PI / 2, 1.4, 2.2, 260, SH_CYAN, 4)
    motes(x, cy, s, 2, 0.7)
  }
}

const flushParked = (): void => {
  flushQueued = false
  for (let i = 0; i < PARK_N; i++) {
    const p = parked[i]!
    if (!p.live) continue
    p.live = false
    try { absorbBurst(p.x, p.y, p.s, p.full) } catch { /* a late burst is never worth a throw */ }
  }
}

const park = (x: number, y: number, s: number, full: boolean): boolean => {
  for (let i = 0; i < PARK_N; i++) {
    const p = parked[i]!
    if (p.live) continue
    p.x = x; p.y = y; p.s = s; p.full = full; p.live = true
    if (!flushQueued) {
      flushQueued = true
      if (typeof queueMicrotask === 'function') queueMicrotask(flushParked)
      else void Promise.resolve().then(flushParked)
    }
    return true
  }
  return false
}

/** An intercept at (x, y) takes over the dome a parked absorb was about to draw. */
const claimParked = (x: number, y: number): void => {
  for (let i = 0; i < PARK_N; i++) {
    const p = parked[i]!
    if (p.live && Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1) p.live = false
  }
}

// ─── The wall (intercepts) ──────────────────────────────────────────────────

interface Wall {
  /** `api.now` at the stop, and when the attacker's window closed (-1 while it is still open). */
  t0: number
  tEnd: number
  /** The blow's heading, radians (y down). */
  ang: number
  /** The shield stone's id, or -1. */
  id: number
  /** The wall ate the whole blow. */
  full: boolean
  /** The shield stone's level: a Lv 2+ wall stands in a second, outer shell. */
  level: number
}
/** One record per intercepted shot, made at the stop and read every frame after. */
const walls = new WeakMap<Shot, Wall>()

/** Blow weights for the intercept cue: the recipe plays a light ricochet, a sizzle or a heavy parry off it. */
const WALL_POWER = { arrow: 0.66, beam: 0.82, blade: 1 } as const

// ─── Aura timing (ms from the event's start) ────────────────────────────────

const AURA_TAIL = 450
const CHARGE = 100
const BEAD_T0 = 28
const RISE_T0 = 100
const RISE_MS = 150
const HOLD_T1 = 440
const STAGGER = 14

const from = { x: 0, y: 0 }

// ─── The module ─────────────────────────────────────────────────────────────

export const defense: RuneFx = {
  type: 'defense',
  palette: { core: SH_CORE, hot: SH_HOT, deep: SH_DEEP, accent: SH_CYAN },

  impactAt: (e) => (e.kind === 'aura' ? Math.max(0.3, Math.min(0.8, RISE_T0 / Math.max(1, e.dur))) : undefined),
  tailMs: (e) => (e.kind === 'aura' ? AURA_TAIL : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'aura') return
    const x = api.cx(e.from.col, e.from.row)
    const y = api.cy(e.from.col, e.from.row)
    const s = api.size
    api.sound('aura', Math.min(1, 0.6 + 0.1 * e.to.length), { x, level: e.from.level, side: e.from.side })
    // The gathering: hex motes drawn IN to the shield from all round it.
    const id = pMote()
    const k = count(10, 2)
    for (let i = 0; i < k; i++) {
      const a = (i / k) * TAU + Math.random() * 0.5
      const r = s * (0.6 + Math.random() * 0.25)
      const life = 95 + Math.random() * 30
      spawn(x + Math.cos(a) * r, y + Math.sin(a) * r, -Math.cos(a) * r / (life / 1000), -Math.sin(a) * r / (life / 1000),
        life, s * (0.06 + Math.random() * 0.04), SH_ICE, { shape: 4, sprite: id, rot: 0 })
    }
  },

  impact(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'aura') return
    const s = api.size
    const x0 = api.cx(e.from.col, e.from.row)
    const y0 = api.cy(e.from.col, e.from.row)
    // The release off the shield itself.
    spawn(x0, y0, 0, 0, 260, s * 0.4, SH_CORE, { shape: 4, sprite: pHexRing(), rot: 0, grow: 1, alpha: 0.9 })
    sparks(x0, y0, s, 6, -Math.PI / 2, Math.PI, 1.6, 240, SH_ICE)
    // Each dome lifts off its floor: motes and a spit of light from its foot.
    for (let j = 0; j < e.to.length; j++) {
      const t = e.to[j]!
      const x = api.cx(t.col, t.row)
      const y = api.cy(t.col, t.row)
      motes(x, y + s * 0.2, s, 4, 0.8)
      sparks(x, y + s * 0.3, s, 3, -Math.PI / 2, 0.8, 1.4, 260, SH_ICE)
      api.flash(t.id, 0.35)
    }
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind !== 'aura') return
    const ctx = api.ctx
    const s = api.size
    const t = p * e.dur
    const end = e.dur + AURA_TAIL
    const fade = span(t, HOLD_T1, end - 16)
    from.x = api.cx(e.from.col, e.from.row)
    from.y = api.cy(e.from.col, e.from.row)

    // ── The shield: gather, squash, release ──
    const g = easeOutCubic(span(t, 0, CHARGE + 10))
    const sigA = 0.95 * span(t, 0, 40) * (1 - span(t, 200, 400))
    const sigW = s * (0.55 + 0.6 * g)
    blitFloor(ctx, sigil(s * 2.6), from.x, from.y + s * 0.34, sigW, sigW * 0.42, sigA, t * 0.0016)
    const charge = span(t, 0, CHARGE)
    const rel = span(t, CHARGE, CHARGE + 220)
    const glowA = t < CHARGE ? 0.2 + 0.45 * charge : 0.6 * (1 - rel)
    blit(ctx, iceGlow(s * 3), from.x, from.y, s * (0.9 + 0.5 * charge), s * (0.9 + 0.5 * charge), glowA)
    if (t < CHARGE) {
      // The gather: a hex closing IN on the stone.
      const r = s * (0.78 - 0.4 * easeInOutCubic(charge))
      blit(ctx, hexRing(s * 3), from.x, from.y, r * 2.5, r * 2.5, 0.25 + 0.6 * charge)
    } else if (rel < 1) {
      // …and the release: the same hex thrown OUT, to the neighbours it is about to reach.
      const r = s * (0.38 + 0.47 * easeOutCubic(rel))
      blit(ctx, hexRing(s * 3), from.x, from.y, r * 2.5, r * 2.5, Math.pow(1 - rel, 1.3) * 0.9)
    }
    // The stone: pressed down while it gathers, popping up as it lets go.
    if (t < 300) {
      let sy = 1
      if (t < 70) sy = 1 - 0.08 * easeOutCubic(t / 70)
      else if (t < 130) sy = 0.92 + 0.16 * easeOutCubic((t - 70) / 60)
      else sy = 1.08 - 0.08 * easeInOutCubic(span(t, 130, 260))
      api.pose(e.from.id, 0, s * (1 - sy) * 0.35, 2 - sy, sy)
    } else if (t < 360) api.pose(e.from.id, 0, 0, 1, 1)

    // ── The links and the domes ──
    const n = e.to.length
    const threadSpr = thread()
    for (let j = 0; j < n; j++) {
      const to = e.to[j]!
      const x = api.cx(to.col, to.row)
      const y = api.cy(to.col, to.row)
      const st = j * STAGGER
      const dx = x - from.x
      const dy = y - from.y
      const dist = Math.hypot(dx, dy) || 1
      const ang = Math.atan2(dy, dx)
      // The bead runs down its thread, from the shield's rim to the dome's.
      const u = easeInOutCubic(span(t, BEAD_T0 + st, RISE_T0 + st))
      const r0 = s * 0.3
      const r1 = s * DOME_RX * 0.9
      const len = Math.max(0, (dist - r0 - r1) * u)
      // Bright while the bead runs, then a steady link for as long as the domes stand.
      const threadA = t < RISE_T0 + st ? 1 : 1 - 0.55 * span(t, RISE_T0 + st, RISE_T0 + st + 160)
      const linkA = threadA * (1 - fade) * (u > 0 ? 1 : 0)
      if (len > 1 && linkA > 0.01) {
        const mx = from.x + Math.cos(ang) * (r0 + len / 2)
        const my = from.y + Math.sin(ang) * (r0 + len / 2)
        blit(ctx, threadSpr, mx, my, len + s * 0.14, s * (t < RISE_T0 + st + 60 ? 0.24 : 0.17), linkA, true, ang)
      }
      if (u > 0 && u < 1) {
        const bx = from.x + Math.cos(ang) * (r0 + len)
        const by = from.y + Math.sin(ang) * (r0 + len)
        blit(ctx, iceGlow(s * 1.6), bx, by, s * 0.72, s * 0.72, 0.95)
        blit(ctx, flare6(s), bx, by, s * 0.5, s * 0.5, 1, true, u * 2)
      }

      // The dome rises where the bead landed.
      const rk = span(t, RISE_T0 + st, RISE_T0 + st + RISE_MS)
      if (rk <= 0) continue
      resetLook(x, y, s)
      look.rise = easeOutBack(rk)
      look.scale = (0.72 + 0.28 * easeOutCubic(rk)) * (1 - 0.1 * fade)
      look.body = (rk < 1 ? 0.3 + 0.35 * rk : 0.5 + 0.12 * bump(span(t, RISE_T0 + st + RISE_MS, RISE_T0 + st + RISE_MS + 120))) * (1 - fade)
      look.sweep = rk < 1 ? rk * 1.35 : -1
      look.flash = 0.38 * bump(span(t, RISE_T0 + st + RISE_MS - 25, RISE_T0 + st + RISE_MS + 45))
      look.rim = bump(span(t, RISE_T0 + st + RISE_MS - 40, RISE_T0 + st + RISE_MS + 150)) * 0.6
      look.hx = hitPointX(ang)
      look.hy = hitPointY(ang)
      const wk = span(t, RISE_T0 + st, RISE_T0 + st + 260)
      look.wave = easeOutCubic(wk) * 2.4
      look.waveA = 0.7 * (1 - span(t, RISE_T0 + st + 120, RISE_T0 + st + 300))
      look.twinkle = api.tier >= 2 ? 0.6 * span(t, RISE_T0 + st + RISE_MS, RISE_T0 + st + RISE_MS + 60) * (1 - fade) : 0
      look.clock = t + j * 97
      paintDome(ctx, look, api.tier)
      // Its footprint on the floor.
      const fk = span(t, RISE_T0 + st, RISE_T0 + st + 240)
      if (fk < 1) blitFloor(ctx, hexRing(s * 3), x, y + s * 0.34, s * (0.75 + 0.55 * easeOutCubic(fk)), s * (0.75 + 0.55 * easeOutCubic(fk)) * 0.4, (1 - fk) * 0.85)
      // The stone under it lifts a hair as the barrier takes its weight.
      const bob = span(t, RISE_T0 + st, RISE_T0 + st + 240)
      if (bob < 1) api.pose(to.id, 0, -s * 0.035 * bump(bob), 1, 1 + 0.035 * bump(bob))
      else if (t < RISE_T0 + st + 300) api.pose(to.id, 0, 0, 1, 1)
    }
  },

  absorb(hit: Hit, x: number, y: number, api: FxApi) {
    const full = hit.amount === 0
    api.sound('shield', full ? 1 : 0.55, { x, level: hit.target.level, side: hit.target.side })
    // A shield stone's own dome waits to see whether a wall claims it.
    if (hit.target.type === 'defense' && park(x, y, api.size, full)) return
    absorbBurst(x, y, api.size, full)
  },

  interceptImpact(e: Shot, x: number, y: number, api: FxApi) {
    const s = api.size
    claimParked(x, y)
    const ax = api.cx(e.from.col, e.from.row)
    const ay = api.cy(e.from.col, e.from.row)
    const ang = ax === x && ay === y ? dirAngle(e.from.dir) : Math.atan2(y - ay, x - ax)
    let id = -1
    let full = false
    let level = 1
    let side = e.from.side
    for (let i = 0; i < e.hits.length; i++) {
      const h = e.hits[i]!
      if (h.target.type !== 'defense') continue
      id = h.target.id
      full = h.amount === 0
      level = h.target.level
      side = h.target.side
    }
    walls.set(e, { t0: api.now, tEnd: -1, ang, id, full, level })
    const w = e.weapon === 'blade' || e.weapon === 'beam' ? e.weapon : 'arrow'
    api.sound('intercept', WALL_POWER[w], { x, level, side })

    // Where the blow met the barrier.
    const cy = domeCy(y, s)
    const hx = x + hitPointX(ang) * s * DOME_RX
    const hy = cy + hitPointY(ang) * s * DOME_RY
    const back = ang + Math.PI
    if (w === 'arrow') {
      // Stopped dead: a ricochet cone back the way it came.
      sparks(hx, hy, s, full ? 12 : 9, back, 0.95, 3.2, 300, SH_ICE, 2)
      sparks(hx, hy, s, 4, back, 1.4, 2.2, 220, '#ffffff')
      if (!full) shards(hx, hy, s, 3, back, 0.9)
      motes(hx, hy, s, 3, 0.4)
    } else if (w === 'beam') {
      // First contact: a splash; the rest is sheeted off frame by frame.
      sparks(hx, hy, s, 8, back, 1.2, 2.6, 260, SH_ICE)
      skate(x, y, s, 6, Math.atan2(hitPointY(ang), hitPointX(ang)), 0, 2.4)
      if (!full) shards(hx, hy, s, 2, back, 1)
      motes(hx, hy, s, 3, 0.5)
    } else {
      // Parried: the swing's sparks skate on round the skin, a heavier spray flies back.
      skate(x, y, s, 12, Math.atan2(hitPointY(ang), hitPointX(ang)), 1, 3)
      sparks(hx, hy, s, 8, back, 1.1, 2.6, 280, '#ffffff', 3)
      if (!full) shards(hx, hy, s, 5, back, 1.2)
      motes(hx, hy, s, 3, 0.5)
      api.shake('small')
    }
    if (full || level >= 2) {
      // The wall held completely, or a heavy wall took it: a hex shock ring through the whole barrier.
      spawn(x, cy, 0, 0, 300, s * 0.42, SH_CORE, { shape: 4, sprite: pHexRing(), rot: 0, grow: 1, alpha: full ? 1 : 0.75 })
    }
    const c = pCore()
    spawn(hx, hy, 0, 0, 180, s * 0.2, SH_ICE, { shape: 4, sprite: c, rot: 0, fade: 2 })
  },

  interceptPaint(e: Shot, k: number, x: number, y: number, api: FxApi) {
    const w = walls.get(e)
    if (!w) return
    if (k >= 1 && w.tEnd < 0) w.tEnd = api.now
    const ctx = api.ctx
    const s = api.size
    const m = api.now - w.t0
    const full = w.full
    const hold = full ? 70 : 0
    resetLook(x, y, s)
    look.hx = hitPointX(w.ang)
    look.hy = hitPointY(w.ang)
    const cy = domeCy(y, s)
    const hx = x + look.hx * s * DOME_RX
    const hy = cy + look.hy * s * DOME_RY
    let flareA = 0
    let flareS = 0
    let push = 0

    if (e.weapon === 'beam') {
      const on = w.tEnd < 0
      const off = on ? 0 : api.now - w.tEnd
      const release = span(off, 0, 240 + hold)
      const jitter = Math.sin(m * 0.09) * 0.5 + Math.sin(m * 0.23) * 0.5
      look.scale = 0.95 + 0.05 * easeOutBack(span(m, 0, 110))
      look.body = (0.25 + 0.45 * easeOutCubic(span(m, 0, 90)) + 0.08 * jitter) * (1 - release) * (full ? 1.1 : 1)
      look.flash = 0.2 * (1 - span(m, 0, 60))
      look.rim = (on ? 0.25 + 0.12 * jitter : 0.35 * (1 - release)) + 0.3 * (1 - span(m, 0, 140))
      look.wave = ((m % 130) / 130) * 2.4
      look.waveA = on ? 0.72 : 0.72 * (1 - span(off, 0, 150))
      look.heat = on ? 0.5 + 0.1 * jitter : 0.55 * (1 - span(off, 0, 200))
      if (!full && on) look.body *= 0.88 + 0.12 * Math.sin(m * 0.6)
      flareA = on ? 0.85 + 0.15 * jitter : 1 - span(off, 0, 120)
      flareS = s * (0.5 + 0.08 * jitter)
      push = on ? 0.03 + 0.004 * Math.sin(m * 0.9) : 0.03 * (1 - easeInOutCubic(span(off, 0, 180)))
      // The splash: sparks sheeting off round the curve for as long as it pushes.
      if (on && api.canEmit && api.tier >= 1) {
        const at = Math.atan2(look.hy, look.hx)
        const kk = count(3, 0)
        for (let i = 0; i < kk; i++) {
          const way = i % 2 === 0 ? 1 : -1
          const tang = at + way * (Math.PI / 2) + (Math.random() - 0.5) * 0.5
          const v = s * (1.6 + Math.random() * 1.4)
          spawn(hx, hy, Math.cos(tang) * v + Math.cos(w.ang + Math.PI) * v * 0.35, Math.sin(tang) * v + Math.sin(w.ang + Math.PI) * v * 0.35,
            160 + Math.random() * 120, s * (0.03 + Math.random() * 0.02), i % 3 === 2 ? '#ffffff' : SH_ICE, SPLASH)
        }
      }
    } else if (e.weapon === 'blade') {
      look.dent = 1 - 0.14 * Math.exp(-m / 75) * Math.cos(m * 0.034)
      look.dentAng = w.ang
      look.scale = 1
      look.body = (m < 90 + hold ? 0.3 + 0.44 * easeOutCubic(span(m, 0, 70)) : 0.74 - 0.74 * span(m, 90 + hold, 330 + hold)) * (full ? 1.12 : 1)
      look.flash = (full ? 0.32 : 0.22) * (1 - span(m, 0, 60))
      look.rim = bump(span(m, 0, 200 + hold)) * (full ? 0.9 : 0.6)
      look.wave = easeOutCubic(span(m, 0, 280)) * 2.5
      look.waveA = 0.9 * (1 - span(m, 90, 330))
      look.heat = 0.6 * (1 - span(m, 0, 230 + hold))
      if (!full) look.body *= 0.85 + 0.15 * Math.cos(m * 0.5)
      flareA = 1 - span(m, 0, 130)
      flareS = s * (0.72 - 0.25 * span(m, 0, 130))
      push = 0.06 * (m < 45 ? easeOutCubic(m / 45) : 1 - easeInOutCubic(span(m, 45, 250)))
    } else {
      look.scale = 0.93 + 0.07 * easeOutBack(span(m, 0, 130))
      look.body = (m < 70 + hold ? 0.25 + 0.45 * easeOutCubic(span(m, 0, 70)) : 0.7 - 0.7 * span(m, 70 + hold, 290 + hold)) * (full ? 1.15 : 1)
      look.flash = (full ? 0.3 : 0.2) * (1 - span(m, 0, 55))
      look.rim = bump(span(m, 0, 160 + hold)) * (full ? 0.85 : 0.55)
      look.wave = easeOutCubic(span(m, 0, 250)) * 2.4
      look.waveA = 0.9 * (1 - span(m, 70, 290))
      look.heat = 0.58 * (1 - span(m, 0, 190 + hold))
      if (!full) look.body *= 0.85 + 0.15 * Math.cos(m * 0.55)
      flareA = 1 - span(m, 0, 115)
      flareS = s * (0.62 - 0.22 * span(m, 0, 115))
      push = 0.04 * (m < 40 ? easeOutCubic(m / 40) : 1 - easeInOutCubic(span(m, 40, 220)))
    }

    look.body = clamp01(look.body)
    // The wall materialises from the struck point, a step ahead of its ripple.
    look.reveal = 0.35 + 2.2 * easeOutCubic(span(m, 0, e.weapon === 'beam' ? 150 : e.weapon === 'blade' ? 130 : 115))
    paintDome(ctx, look, api.tier)
    // A Lv 2+ shield stone stands in a second shell: a faint outer rim that flares with the first.
    if (w.level >= 2 && look.body > 0.02) {
      const rx = s * DOME_RX * look.scale * 1.14
      const ry = s * DOME_RY * look.scale * 1.14
      const d = (rx / 0.78) * 2
      blit(ctx, rimRing(d * 2), x, cy, d, (ry / 0.78) * 2, look.body * 0.35 + look.rim * 0.4)
    }

    // The blade's scrape: a streak of light running along the skin where it bit.
    if (e.weapon === 'blade' && api.tier >= 1) {
      const sk = span(m, 0, 190)
      if (sk < 1) {
        const at = Math.atan2(look.hy, look.hx)
        const mid = at - 0.75 + 1.5 * easeOutCubic(sk)
        const half = 0.5 * (1 - sk * 0.5)
        const a = 1 - sk
        const rxs = s * DOME_RX * look.dent
        const rys = s * DOME_RY
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.lineCap = 'round'
        ctx.globalAlpha = a * 0.5
        ctx.strokeStyle = SH_HOT
        ctx.lineWidth = s * 0.11
        ctx.beginPath(); ctx.ellipse(x, cy, rxs, rys, 0, mid - half, mid + half); ctx.stroke()
        ctx.globalAlpha = a
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = s * 0.035
        ctx.beginPath(); ctx.ellipse(x, cy, rxs, rys, 0, mid - half * 0.8, mid + half * 0.8); ctx.stroke()
        ctx.restore()
      }
    }

    // The struck point: a six-spike flare over a hot glow.
    if (flareA > 0.01) {
      blit(ctx, iceGlow(s * 2), hx, hy, flareS * 1.1, flareS * 1.1, flareA * 0.5)
      blit(ctx, flare6(s * 2), hx, hy, flareS, flareS, flareA, true, w.ang + Math.PI / 2)
    }

    // The stone braces against it, then settles.
    if (w.id >= 0) {
      if (push > 0.0005) {
        const px = Math.cos(w.ang) * push * s
        const py = Math.sin(w.ang) * push * s
        api.pose(w.id, px, py, 1 + push * 0.8, 1 - push * 0.8)
      } else {
        api.pose(w.id, 0, 0, 1, 1)
      }
    }
  }
}
