import { intercepted, type Explode, type FxApi, type RuneEvent, type RuneFx, type Shot } from './types'
import {
  blit, bump, clamp01, count, easeInQuad, easeOutBack, easeOutCubic, easeOutExpo, easeOutQuad, hash01, newShotLine,
  runeColor, shotLine, span, spawn, spawnChips
} from './kit'
import {
  CYAN, DEEP, LAVENDER, VIOLET, bandCore, bandHalo, bandInk, bloomSprite, circleSprite, glowCyan, glowViolet, hotCore, moteCId,
  moteVId, pillarSprite, ringCyan, ringViolet, shardId, shardSprite, sigilSprite
} from './mage.art'

/**
 * ─── Orb (`mage`) — the diagonal beam, and its Lv 2 cross ───────────────────
 *
 * Events: `shot` with `weapon: 'beam'` (a beam along the diagonal it faces,
 * through every rune in reach — stopped by a shield like an arrow) and
 * `explode` (a Lv 2 orb's cross of five cells at the beam's end; `cells` are
 * the cross, `hits` what it damaged).
 *
 * THE LOOK — precise arcane magic, violet with a cyan edge:
 *
 *   charge   a RUNE CIRCLE snaps open around the orb and spins up (rings, a
 *            band of carved glyphs, the four diagonal sparks of the orb's own
 *            glyph, a hexagram turning the other way); motes spiral IN; the
 *            stone squats as it gathers.
 *   fire     the beam races down the diagonal — a white-hot filament in a
 *            violet body — and the stone kicks back along it.
 *   impact   the ARCANE BLOOM: a white flash, six violet petals opening round
 *            the target, a cyan shock ring, glyph shards thrown down the line.
 *   sustain  the beam holds: a wobbling energy strand, a cyan crackle that
 *            re-strikes every 40 ms, glyph sparks riding it to the target.
 *   release  the beam narrows and its tail runs INTO the target; the circle
 *            closes in a last whirl; the line dissolves into glyph dust.
 *
 *   Lv 2     a second, counter-turning outer circle and a heavier beam — then
 *            `explode`: five sigils ignite across the cross (the beam's light
 *            racing out along its arms) and FIVE PILLARS of light erupt.
 *
 * Cues: `beam` (the charge and ignition), `beamHit` (the bloom), `explode`
 * (the pillars) — `runeSfx/mage.ts`.
 */

const CORE = runeColor('mage')
/** Where in the beam's window the blow lands (the renderer's default for a beam). */
const IMPACT = 0.42
/** The beam leaves the orb… */
const FIRE = 0.3
/** …and its head reaches the end of the line. */
const REACH = 0.4
/** Where in the cross's window the pillars erupt. */
const CROSS_IMPACT = 0.35
const line = newShotLine()

// ─── Per-event memory (a ring of slots, matched by reference; nothing allocated per frame) ─

interface Slot { e: RuneEvent | null; flags: number }
const SLOTS: Slot[] = Array.from({ length: 8 }, () => ({ e: null, flags: 0 }))
let nextSlot = 0
const slotFor = (e: RuneEvent): Slot => {
  for (let i = 0; i < SLOTS.length; i++) if (SLOTS[i]!.e === e) return SLOTS[i]!
  const s = SLOTS[nextSlot]!
  nextSlot = (nextSlot + 1) % SLOTS.length
  s.e = e
  s.flags = 0
  return s
}
const F_DUST = 1
const F_POSED = 2

// ─── Particle options, reused (the pool copies every field on the way in) ───

type SpawnOpts = NonNullable<Parameters<typeof spawn>[7]>
const SO: SpawnOpts = {}
const opts = (
  shape: 0 | 1 | 2 | 3 | 4 | 5 | 6, sprite: number, gravity: number, drag: number, fade: 0 | 1 | 2, vrot = 0, additive = true, grow: 0 | 1 | 2 = 0
): SpawnOpts => {
  SO.shape = sprite < 0 && shape >= 4 ? 0 : shape
  SO.sprite = sprite
  SO.gravity = gravity
  SO.drag = drag
  SO.fade = fade
  SO.vrot = vrot
  SO.additive = additive
  SO.grow = grow
  SO.alpha = 1
  SO.rot = Math.random() * Math.PI * 2
  return SO
}

// ─── Painters ───────────────────────────────────────────────────────────────

/** `blit` with the sprite looked up by the caller — additive, centred. */
const glow = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, d: number, a: number, rot = 0): void => {
  if (a > 0.005 && d > 0.5) blit(ctx, spr, x, y, d, d, a, true, rot)
}

/**
 * The rune circle at (x, y): `grow` 0…1 opens it, `close` 0…1 shuts it,
 * `spin` in radians. The outer circle and the hexagram turn opposite ways.
 */
const paintCircle = (
  ctx: CanvasRenderingContext2D, x: number, y: number, d: number, alpha: number, spin: number, outer: boolean, tier: 0 | 1 | 2
): void => {
  if (alpha <= 0.01 || d <= 1) return
  glow(ctx, circleSprite(), x, y, d, alpha, spin)
  glow(ctx, sigilSprite(), x, y, d * 0.8, alpha * 0.6, -spin * 1.6)
  // Lv 2: a second, larger circle counter-turning outside the first.
  if (outer && tier > 0) glow(ctx, circleSprite(), x, y, d * 1.32, alpha * 0.4, -spin * 0.55 + 0.4)
}

/**
 * The beam, drawn in a local frame rotated onto the line so every layer is a
 * straight blit: a halo, the core cross-section, then (tier ≥ 1) a wobbling
 * energy strand and (tier 2) a cyan crackle and glyph sparks riding it.
 * `s0`…`s1` is the lit part of the line, in px from the orb.
 */
const paintBeamBody = (
  ctx: CanvasRenderingContext2D, x0: number, y0: number, ang: number, s0: number, s1: number, w: number,
  ms: number, seed: number, env: number, tier: 0 | 1 | 2, size: number, lite = false
): void => {
  const len = s1 - s0
  if (len < 1 || w <= 0.2 || env <= 0.01) return
  const ink = bandInk()
  const halo = bandHalo()
  const core = bandCore()
  ctx.save()
  ctx.translate(x0, y0)
  ctx.rotate(ang)
  // The ink: a dark violet shadow under the light, so it reads on the slate.
  if (ink && tier > 0 && !lite) {
    ctx.globalAlpha = Math.min(1, env * 0.55)
    ctx.drawImage(ink, s0, -w * 2.6, len, w * 5.2)
  }
  ctx.globalCompositeOperation = 'lighter'
  if (halo && !lite) {
    ctx.globalAlpha = Math.min(1, env * 0.85)
    ctx.drawImage(halo, s0, -w * 3.4, len, w * 6.8)
  }
  if (core) {
    ctx.globalAlpha = Math.min(1, env)
    ctx.drawImage(core, s0, -w, len, w * 2)
  }
  // The filament: the one white thing in the beam (tier 0 keeps to the baked
  // bands; with no bake at all this stroke IS the beam).
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (tier > 0 || !core) {
    ctx.strokeStyle = core ? '#ffffff' : CORE
    ctx.globalAlpha = Math.min(1, env * (core ? 0.85 : 1))
    ctx.lineWidth = core ? Math.max(1, w * 0.34) : w
    ctx.beginPath(); ctx.moveTo(s0, 0); ctx.lineTo(s1, 0); ctx.stroke()
  }
  if (tier > 0 && !lite) {
    // The wobble: an energy strand travelling down the beam, pinned at both ends.
    const segs = 30
    const amp = w * 1.05
    ctx.strokeStyle = LAVENDER
    ctx.globalAlpha = Math.min(1, env * 0.7)
    ctx.lineWidth = Math.max(1, w * 0.22)
    ctx.beginPath()
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const yy = Math.sin(u * Math.PI * 5 - ms * 0.03) * amp * Math.sin(u * Math.PI)
      if (i === 0) ctx.moveTo(s0, 0); else ctx.lineTo(s0 + u * len, yy)
    }
    ctx.stroke()
  }
  if (tier > 1 && !lite) {
    // The crackle: a jagged cyan arc that re-strikes every 40 ms.
    const segs = 12
    const frame = Math.floor(ms / 40)
    ctx.strokeStyle = CYAN
    ctx.globalAlpha = Math.min(1, env * 0.9)
    ctx.lineWidth = Math.max(1, w * 0.17)
    ctx.beginPath()
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const n = hash01(seed * 131 + frame * 17 + i * 7) - 0.5
      const yy = n * w * 3 * Math.sin(u * Math.PI)
      if (i === 0) ctx.moveTo(s0, 0); else ctx.lineTo(s0 + u * len, yy)
    }
    ctx.stroke()
    // Glyph sparks riding the line to the target.
    for (let i = 0; i < 4; i++) {
      const u = (ms / 240 + i * 0.25 + hash01(seed + i) * 0.1) % 1
      const at = u * s1
      if (at < s0) continue
      const a = bump(u) * env
      const gs = size * 0.26
      blit(ctx, shardSprite(i + seed), at, Math.sin(ms * 0.02 + i * 2) * w * 1.2, gs, gs, a, true, ms * 0.012 + i * 1.7)
    }
  }
  ctx.restore()
}

/** The arcane bloom at a struck point: flash, petals, shock ring, a runic stamp. `k` 0…1 across the bloom. */
const paintBloom = (
  ctx: CanvasRenderingContext2D, x: number, y: number, size: number, k: number, p: number, scale: number, spinDir: number
): void => {
  if (k <= 0 || k >= 1) return
  const e = easeOutCubic(k)
  // The flash: 1–2 frames of white, no bigger than the stone.
  const flash = 1 - span(p, IMPACT, IMPACT + 0.08)
  glow(ctx, hotCore(), x, y, size * (0.55 + 0.4 * e) * scale, flash * 0.95)
  // The petals open and turn; the shock ring runs out past them.
  glow(ctx, bloomSprite(), x, y, size * (0.6 + 1.0 * e) * scale, (1 - easeInQuad(k)), spinDir * (0.25 + k * 0.8))
  glow(ctx, ringCyan(), x, y, size * (0.3 + 1.3 * e) * scale, (1 - k) * 0.9)
}

/** The mark the bloom leaves: the orb's sigil branded on the struck tile, turning slowly as it fades. */
const paintMark = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, k: number, scale: number, spin: number): void => {
  if (k <= 0 || k >= 1) return
  const a = clamp01(k * 5) * (1 - easeInQuad(k))
  glow(ctx, sigilSprite(), x, y, size * (0.95 + 0.15 * k) * scale, a * 0.7, spin)
  glow(ctx, glowViolet(), x, y, size * 1.05 * scale, a * 0.35)
}

// ─── The shot ───────────────────────────────────────────────────────────────

const paintShot = (e: Shot, p: number, api: FxApi): void => {
  const ctx = api.ctx
  const size = api.size
  const tier = api.tier
  const l = shotLine(e, api, line)
  const lv2 = e.from.level >= 2
  const big = lv2 ? 1.28 : 1
  const ms = p * e.dur
  const dx = l.tx - l.x
  const dy = l.ty - l.y
  const L = Math.hypot(dx, dy)
  const slot = slotFor(e)

  // ── Pebble acting: squat while gathering, kick back along the line on fire ──
  if (p < FIRE) {
    const k = easeInQuad(span(p, 0.02, FIRE))
    api.pose(e.from.id, 0, size * 0.02 * k, 1 + 0.07 * k, 1 - 0.09 * k)
  } else if (p < 0.62) {
    const r = 1 - easeOutQuad(span(p, FIRE, 0.62))
    const kick = size * 0.09 * r
    api.pose(e.from.id, -Math.cos(l.ang) * kick, -Math.sin(l.ang) * kick, 1 - 0.05 * r, 1 + 0.08 * r)
  } else if ((slot.flags & F_POSED) === 0) {
    slot.flags |= F_POSED
    api.pose(e.from.id, 0, 0, 1, 1)
  }

  // ── The rune circle: snaps open, spins up, closes in a last whirl ──
  const cin = span(p, 0, 0.2)
  const cout = span(p, 0.72, 1.3)
  if (cin > 0 && cout < 1) {
    const d = size * 1.2 * big * (0.3 + 0.7 * easeOutBack(cin)) * (1 - 0.35 * easeInQuad(cout))
    const a = clamp01(cin * 2.2) * (1 - easeInQuad(cout)) * (1 + 0.35 * bump(span(p, FIRE - 0.04, FIRE + 0.12)))
    const spin = ms * 0.0045 - (1 - cin) * 1.4 + easeInQuad(cout) * 3.2
    paintCircle(ctx, l.x, l.y, d, Math.min(1, a), spin, lv2, tier)
  }

  // ── The gathering light at the orb, and the muzzle flare as it fires ──
  const charge = easeInQuad(span(p, 0.04, FIRE))
  const hold = 1 - span(p, 0.7, 1.05)
  if (p < FIRE) {
    glow(ctx, glowViolet(), l.x, l.y, size * (0.5 + 0.7 * charge) * big, 0.25 + 0.55 * charge)
    glow(ctx, hotCore(), l.x, l.y, size * (0.12 + 0.36 * charge) * big, 0.4 + 0.6 * charge)
  } else if (hold > 0) {
    const muzzle = 1 - span(p, FIRE, FIRE + 0.16)
    glow(ctx, hotCore(), l.x, l.y, size * (0.5 + 0.5 * muzzle) * big, Math.min(1, 0.45 * hold + muzzle))
    glow(ctx, glowViolet(), l.x, l.y, size * 1.05 * big, 0.55 * hold)
  }

  // ── The beam ──
  const head = easeOutQuad(span(p, FIRE, REACH))
  const back = easeInQuad(span(p, 0.8, 1.04))
  if (head > 0 && back < 1 && L > 1) {
    const surge = 1 + 0.45 * bump(span(p, REACH, 0.54))
    const thin = 1 - 0.7 * span(p, 0.72, 1.04)
    const flick = 0.9 + 0.1 * Math.sin(ms * 0.11 + e.from.id)
    const w = size * 0.1 * big * surge * thin * flick * (0.6 + 0.4 * head)
    paintBeamBody(ctx, l.x, l.y, l.ang, back * L, head * L, w, ms, e.from.id, 1, tier, size)
    // The racing head, bright until it lands.
    if (head < 1) glow(ctx, hotCore(), l.x + dx * head, l.y + dy * head, size * 0.55 * big, 1)
    // Tier 2: cyan sparks jumping off the live beam.
    if (tier > 1 && api.canEmit && p > REACH && p < 0.78) {
      const k = count(3, 0)
      const cid = moteCId()
      for (let i = 0; i < k; i++) {
        const u = back + Math.random() * (head - back)
        const side = Math.random() < 0.5 ? -1 : 1
        const v = size * (0.8 + Math.random() * 1.4)
        spawn(l.x + dx * u, l.y + dy * u, -Math.sin(l.ang) * v * side + Math.cos(l.ang) * size * 0.6, Math.cos(l.ang) * v * side + Math.sin(l.ang) * size * 0.6,
          150 + Math.random() * 140, size * (0.035 + Math.random() * 0.03), CYAN, opts(i === 0 ? 4 : 2, cid, 0, 3, 1))
      }
    }
  }

  // ── The dissolve: once, as the beam lets go, the line breaks into glyph dust ──
  if (p >= 0.8 && (slot.flags & F_DUST) === 0 && L > 1) {
    slot.flags |= F_DUST
    const k = count(9)
    const vid = moteVId()
    for (let i = 0; i < k; i++) {
      const u = 0.1 + (i / Math.max(1, k - 1)) * 0.85
      const side = i % 2 === 0 ? -1 : 1
      const v = size * (0.25 + Math.random() * 0.5)
      const glyph = i % 3 === 0
      spawn(l.x + dx * u, l.y + dy * u, -Math.sin(l.ang) * v * side, Math.cos(l.ang) * v * side - size * 0.35,
        320 + Math.random() * 280, size * (glyph ? 0.09 : 0.05 + Math.random() * 0.03), glyph ? LAVENDER : VIOLET,
        opts(4, glyph ? shardId(i) : vid, 0, 1.6, 1, glyph ? (Math.random() - 0.5) * 6 : 0))
    }
  }

  // ── Contact: the target burns while the beam holds on it ──
  const wall = intercepted(e)
  if (e.hits.length > 0 && p >= REACH && back < 1) {
    const onK = (1 - span(p, 0.72, 1.02))
    const pulse = 0.85 + 0.15 * Math.sin(ms * 0.09)
    glow(ctx, glowViolet(), l.tx, l.ty, size * 0.95 * big, 0.5 * onK * pulse)
    if (tier > 0) glow(ctx, glowCyan(), l.tx, l.ty, size * 0.34 * big, 0.5 * onK * pulse)
  }

  // ── The bloom: at the end of the line, and smaller on every rune it pierced ──
  if (p >= IMPACT && e.hits.length > 0) {
    const k = span(p, IMPACT, IMPACT + 0.42)
    const dir = e.from.id % 2 === 0 ? 1 : -1
    const scale = big * (wall ? 0.72 : 1)
    // The sigil it leaves behind, turning slowly through the tail.
    if (!wall) paintMark(ctx, l.tx, l.ty, size, span(p, IMPACT + 0.05, 1.85), scale, dir * ms * 0.0025)
    paintBloom(ctx, l.tx, l.ty, size, k, p, scale, dir)
    for (let i = 0; i < e.hits.length; i++) {
      const h = e.hits[i]!
      const hx = api.cx(h.target.col, h.target.row)
      const hy = api.cy(h.target.col, h.target.row)
      if (Math.abs(hx - l.tx) + Math.abs(hy - l.ty) < 1) continue
      paintBloom(ctx, hx, hy, size, k, p, 0.62 * big, -dir)
    }
  } else if (p >= REACH && e.hits.length === 0 && L > 1) {
    // Nothing in reach: the beam fizzles out at the end of its line.
    const k = span(p, REACH, 0.9)
    glow(ctx, ringViolet(), l.tx, l.ty, size * (0.2 + 0.5 * easeOutCubic(k)), (1 - k) * 0.7)
  }
}

// ─── The Lv 2 cross ─────────────────────────────────────────────────────────

const paintCross = (e: Explode, p: number, api: FxApi): void => {
  const ctx = api.ctx
  const size = api.size
  const tier = api.tier
  const ms = p * e.dur
  const cxc = api.cx(e.center.col, e.center.row)
  const cyc = api.cy(e.center.col, e.center.row)
  for (let i = 0; i < e.cells.length; i++) {
    const c = e.cells[i]!
    const x = api.cx(c.col, c.row)
    const y = api.cy(c.col, c.row)
    const centre = c.col === e.center.col && c.row === e.center.row
    const dir = i % 2 === 0 ? 1 : -1

    // The sigil ignites (centre first, the arms a beat later) and brands the floor.
    const kin = span(p, centre ? 0 : 0.08, CROSS_IMPACT)
    const kout = span(p, 0.55, 1.45)
    if (kin > 0 && kout < 1) {
      const d = size * (centre ? 1 : 0.82) * (0.25 + 0.75 * easeOutBack(kin))
      const flare = 1 + 0.8 * bump(span(p, CROSS_IMPACT - 0.02, 0.6))
      const a = Math.min(1, clamp01(kin * 2) * (1 - easeInQuad(kout)) * flare)
      glow(ctx, sigilSprite(), x, y, d, a * 0.9, dir * ms * 0.006)
      // The outer ring only while the sigil gathers: once the pillar is up it is the shape.
      const ringA = a * 0.55 * (1 - span(p, CROSS_IMPACT, 0.5))
      if (tier > 0 && ringA > 0.01) glow(ctx, circleSprite(), x, y, d * 1.05, ringA, -dir * ms * 0.004)
    }

    // The beam's light races out along the arms to the four outer sigils.
    if (!centre && tier > 0) {
      const head = easeOutQuad(span(p, 0.04, 0.3))
      const fade = 1 - span(p, CROSS_IMPACT, 0.46)
      if (head > 0 && fade > 0) {
        const ang = Math.atan2(y - cyc, x - cxc)
        const L = Math.hypot(x - cxc, y - cyc)
        paintBeamBody(ctx, cxc, cyc, ang, 0, L * head, size * 0.05, ms, e.from.id + i, fade, 1, size, true)
      }
    }

    // The pillar of light.
    const kp = span(p, CROSS_IMPACT, 1.3)
    if (kp > 0 && kp < 1) {
      const rise = easeOutExpo(span(p, CROSS_IMPACT, 0.5))
      const h = size * (centre ? 1.75 : 1.5) * rise * (1 + 0.18 * kp)
      const w = size * (centre ? 0.72 : 0.6) * (1 - 0.68 * easeOutCubic(kp))
      const a = 1 - easeInQuad(kp)
      const foot = y + size * 0.16
      const pil = pillarSprite()
      if (pil && h > 1 && w > 0.5) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        // The column's glow, wide and faint, then the column itself.
        if (tier > 0) {
          ctx.globalAlpha = Math.min(1, a * 0.4)
          ctx.drawImage(pil, x - w * 0.95, foot - h * 0.92, w * 1.9, h * 0.92)
        }
        ctx.globalAlpha = Math.min(1, a)
        ctx.drawImage(pil, x - w / 2, foot - h, w, h)
        // A second, narrower pass: the white-hot heart of the column.
        ctx.globalAlpha = Math.min(1, a * 0.85)
        ctx.drawImage(pil, x - w * 0.16, foot - h * 1.06, w * 0.32, h * 1.06)
        ctx.restore()
      }
      glow(ctx, hotCore(), x, foot - size * 0.1, size * (0.5 + 0.3 * kp) * (centre ? 1.2 : 1), 1 - span(p, CROSS_IMPACT, 0.55))
      glow(ctx, ringViolet(), x, y, size * (0.4 + 1.0 * easeOutCubic(kp)), (1 - kp) * 0.85)
    }
  }
}

// ─── The bursts ─────────────────────────────────────────────────────────────

/** Glyph shards, cyan sparks and violet motes off a struck rune; `ang` the way the blow travelled. */
const burstHit = (x: number, y: number, ang: number, size: number, big: number, deflect: boolean): void => {
  const a0 = deflect ? ang + Math.PI : ang
  const spread = deflect ? 2.4 : 1.5
  const ns = count(7 * big)
  for (let i = 0; i < ns; i++) {
    const a = a0 + (Math.random() - 0.5) * spread
    const v = size * (1.6 + Math.random() * 2.4)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 0.6, 420 + Math.random() * 300, size * (0.09 + Math.random() * 0.06), LAVENDER,
      opts(4, shardId(i), size * 2.5, 2.2, 1, (Math.random() - 0.5) * 10))
  }
  const nk = count(12 * big)
  for (let i = 0; i < nk; i++) {
    const a = i < nk * 0.6 ? a0 + (Math.random() - 0.5) * 1.3 : Math.random() * Math.PI * 2
    const v = size * (2.6 + Math.random() * 3.4)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 160 + Math.random() * 180, size * (0.04 + Math.random() * 0.035), i % 3 === 0 ? '#ffffff' : CYAN,
      opts(2, -1, 0, 3.2, 0))
  }
  const nm = count(6 * big)
  const vid = moteVId()
  for (let i = 0; i < nm; i++) {
    const a = Math.random() * Math.PI * 2
    const v = size * (0.4 + Math.random() * 0.9)
    spawn(x + Math.cos(a) * size * 0.2, y + Math.sin(a) * size * 0.2, Math.cos(a) * v, Math.sin(a) * v - size * 0.5,
      520 + Math.random() * 380, size * (0.06 + Math.random() * 0.05), VIOLET, opts(4, vid, 0, 1.4, 1))
  }
}

export const mage: RuneFx = {
  type: 'mage',
  palette: { core: CORE, hot: LAVENDER, deep: DEEP, accent: CYAN },

  impactAt: (e) => (e.kind === 'shot' ? IMPACT : e.kind === 'explode' ? CROSS_IMPACT : undefined),
  tailMs: (e) => (e.kind === 'shot' ? 300 : e.kind === 'explode' ? 320 : undefined),

  start(e: RuneEvent, api: FxApi) {
    const size = api.size
    slotFor(e)
    if (e.kind === 'shot') {
      const l = shotLine(e, api, line)
      api.sound('beam', 0.9, { x: l.x, level: e.from.level, side: e.from.side })
      // The charge: motes spiralling IN to the orb from a ring around it.
      const k = count(e.from.level >= 2 ? 16 : 12)
      const vid = moteVId()
      const cid = moteCId()
      const spinDir = e.from.id % 2 === 0 ? 1 : -1
      for (let i = 0; i < k; i++) {
        const a = (i / k) * Math.PI * 2 + Math.random() * 0.4
        const r = size * (0.62 + Math.random() * 0.3)
        const vin = size * (3.2 + Math.random() * 0.8)
        const vt = size * 2.2 * spinDir
        const cyan = i % 3 === 0
        spawn(l.x + Math.cos(a) * r, l.y + Math.sin(a) * r,
          -Math.cos(a) * vin - Math.sin(a) * vt, -Math.sin(a) * vin + Math.cos(a) * vt,
          210 + Math.random() * 90, size * (0.05 + Math.random() * 0.04), cyan ? CYAN : VIOLET, opts(4, cyan ? cid : vid, 0, 3.4, 0))
      }
    }
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind === 'shot') paintShot(e, p, api)
    else if (e.kind === 'explode') paintCross(e, p, api)
  },

  impact(e: RuneEvent, api: FxApi) {
    const size = api.size
    if (e.kind === 'shot') {
      if (e.hits.length === 0) return
      const l = shotLine(e, api, line)
      api.sound('beamHit', 0.8, { x: l.tx, level: e.from.level, side: e.from.side })
      const wall = intercepted(e)
      // A Lv 2 beam hits harder — but its cross follows 56 ms later and carries the weight.
      const big = e.from.level >= 2 ? 0.9 : 1
      for (let i = 0; i < e.hits.length; i++) {
        const h = e.hits[i]!
        const hx = api.cx(h.target.col, h.target.row)
        const hy = api.cy(h.target.col, h.target.row)
        const last = i === e.hits.length - 1
        burstHit(hx, hy, l.ang, size, last ? big : 0.6, wall && last)
        if (!wall) spawnChips(hx, hy, size, api.stoneOf(h.target), l.ang, 4)
      }
    } else if (e.kind === 'explode') {
      const x = api.cx(e.center.col, e.center.row)
      api.sound('explode', 1, { x, level: e.from.level, side: e.from.side })
      api.shake('strong')
      const vid = moteVId()
      for (let i = 0; i < e.cells.length; i++) {
        const c = e.cells[i]!
        const cx = api.cx(c.col, c.row)
        const cy = api.cy(c.col, c.row)
        // Cyan sparks burst from the foot of each pillar…
        const ns = count(7)
        for (let j = 0; j < ns; j++) {
          const a = Math.random() * Math.PI * 2
          const v = size * (2 + Math.random() * 2.6)
          spawn(cx, cy + size * 0.1, Math.cos(a) * v, Math.sin(a) * v * 0.6 - size * 0.8, 200 + Math.random() * 200, size * (0.04 + Math.random() * 0.03),
            j % 3 === 0 ? '#ffffff' : CYAN, opts(2, -1, size * 5, 2.6, 0))
        }
        // …and glyph shards climb the column.
        const ng = count(3)
        for (let j = 0; j < ng; j++) {
          spawn(cx + (Math.random() - 0.5) * size * 0.3, cy - Math.random() * size * 0.3, (Math.random() - 0.5) * size * 0.5, -size * (2 + Math.random() * 1.8),
            460 + Math.random() * 320, size * (0.08 + Math.random() * 0.05), LAVENDER, opts(4, shardId(i + j), 0, 1.8, 1, (Math.random() - 0.5) * 7))
        }
        const nm = count(2)
        for (let j = 0; j < nm; j++) {
          const a = Math.random() * Math.PI * 2
          spawn(cx + Math.cos(a) * size * 0.25, cy + Math.sin(a) * size * 0.2, Math.cos(a) * size * 0.4, -size * (0.5 + Math.random() * 0.6),
            620 + Math.random() * 360, size * (0.06 + Math.random() * 0.04), VIOLET, opts(4, vid, 0, 1, 1))
        }
      }
      for (let i = 0; i < e.hits.length; i++) {
        const h = e.hits[i]!
        spawnChips(api.cx(h.target.col, h.target.row), api.cy(h.target.col, h.target.row), size, api.stoneOf(h.target), -Math.PI / 2, 3)
      }
    }
  }
}
