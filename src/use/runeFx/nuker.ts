import { GRID } from '@/game/rules'
import type { FxApi, Nuke, RuneEvent, RuneFx } from './types'
import {
  blit, clamp01, count, easeInQuad, easeOutBack, easeOutCubic, easeOutQuad, lerp, runeColor, span, spawn
} from './kit'
import {
  ASH, DEEP, HOT, LIME, TOXIC, ashId, coreSprite, flashSprite, frontSprite, glowSprite, moteId, tileSprite, trefoilSprite
} from './nuker.art'

/**
 * ─── Warhead (`nuker`) — the board-wide blast ───────────────────────────────
 *
 * Events: `nuke`, fired on the PLACEMENT itself: the whole board at once.
 * `hits` are the Lv 2+ runes that lived through it (both sides), `vaporised`
 * the Lv 1 runes it destroyed outright — their `shatter` events follow at the
 * end of the step and the renderer plays them QUIETLY (a third of a normal
 * burst, no cue, no shake): this event is the sound and the shake for all of
 * them.
 *
 * THE FRONT: the renderer cracks each vaporised stone when the blast reaches
 * its tile, at `size × (0.2 + easeOutCubic(p) × NUKE_WAVE_TILES)` from the
 * origin (`NUKE_WAVE_TILES` = 5). Everything here that travels — the shock
 * front, the tiles lighting up, each stone's own flare — runs on `frontAt`,
 * that same curve, so a stone cracks exactly as the light reaches it.
 *
 * THE LOOK — implosion → explosion across the whole board, radioactive lime:
 *
 *   pinch    for the first frame the board DIMS — the light sucked into the
 *            core — and the warhead squeezes down on itself.
 *   flash    one blinding lime-white flash over the BOARD rect only (the HUD
 *            above never strobes), brightest over ground zero, decaying in
 *            ~100 ms; the hazard trefoil — the stone's own glyph — is branded
 *            across the middle of the board by it.
 *   front    a razor shell of white-lime light with a soft wake crosses the
 *            board at the crack front's speed; every tile lights up as it
 *            passes, every stone flares and throws motes and ash; two heat
 *            rings chase it.
 *   linger   a radioactive afterglow over ground zero, heat shimmer rings,
 *            glowing motes rising, ash drifting — and the AFTERWIND: streaks
 *            of light pulled back into the core as the air rushes in behind
 *            the blast (the second implosion).
 *
 * Everything painted is clipped to the board. `shake('big')` is reserved for
 * this event.
 *
 * Cues: `nuke` (`runeSfx/nuker.ts`).
 */

const CORE = runeColor('nuker')
/** The front's reach, in tiles — must match the renderer's crack front. */
export const NUKE_WAVE_TILES = 5

/**
 * THE INHALE: the first share of the window, before anything goes off. The
 * light is drawn INTO the warhead — the board darkens, a ring and streaks of
 * light collapse onto it, the stone squeezes — and only then does it blow.
 * 0.28 of the 280 ms window puts the flash's peak on the cue's crack (85 ms).
 * The blast below runs on the rest of the window, in its own progress `b`.
 */
export const NUKE_INHALE = 0.28

/** Event progress → blast progress (negative during the inhale, past 1 in the tail). */
export const blastProgress = (p: number): number => (p - NUKE_INHALE) / (1 - NUKE_INHALE)

/** The front's radius at BLAST progress `b`, px. */
export const frontAt = (p: number, size: number): number => size * (0.2 + easeOutCubic(clamp01(p)) * NUKE_WAVE_TILES)

/**
 * The renderer's crack front at EVENT progress `p`, px: nothing moves during
 * the inhale, then the blast front. `useArenaArt` cracks each vaporised stone
 * on exactly this curve — it imports it rather than keeping a copy.
 */
export const nukeFrontAt = (p: number, size: number): number => frontAt(Math.max(0, blastProgress(p)), size)

/** The progress at which the front reaches `tiles` tiles from ground zero (the inverse of `frontAt`). */
export const frontArrival = (tiles: number): number => {
  const k = clamp01((tiles - 0.2) / NUKE_WAVE_TILES)
  return 1 - Math.cbrt(1 - k)
}

const TAIL_MS = 440

// ─── Per-event memory: where the front was last frame (a ring of slots, by reference) ─

interface Slot { e: Nuke | null; p: number; flags: number }
const SLOTS: Slot[] = Array.from({ length: 4 }, () => ({ e: null, p: -1, flags: 0 }))
let nextSlot = 0
const slotFor = (e: Nuke): Slot => {
  for (let i = 0; i < SLOTS.length; i++) if (SLOTS[i]!.e === e) return SLOTS[i]!
  const s = SLOTS[nextSlot]!
  nextSlot = (nextSlot + 1) % SLOTS.length
  s.e = e
  s.p = -1
  s.flags = 0
  return s
}
const F_POSED = 1
const F_DETONATED = 2

// ─── Particle options, reused ───────────────────────────────────────────────

type SpawnOpts = NonNullable<Parameters<typeof spawn>[7]>
const SO: SpawnOpts = {}
const opts = (
  shape: 0 | 1 | 2 | 3 | 4 | 5 | 6, sprite: number, gravity: number, drag: number, fade: 0 | 1 | 2, vrot = 0, additive = true, alpha = 1
): SpawnOpts => {
  SO.shape = sprite < 0 && shape >= 4 ? 0 : shape
  SO.sprite = sprite
  SO.gravity = gravity
  SO.drag = drag
  SO.fade = fade
  SO.vrot = vrot
  SO.additive = additive
  SO.alpha = alpha
  SO.grow = 0
  SO.rot = Math.random() * Math.PI * 2
  return SO
}

const glow = (ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number, d: number, a: number, rot = 0): void => {
  if (a > 0.005 && d > 0.5) blit(ctx, spr, x, y, d, d, a, true, rot)
}

/** A thin ring, stroked (crisp at any radius — a baked ring would blur at board scale). */
const ring = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, w: number, color: string, a: number): void => {
  if (a <= 0.01 || r <= 0.5) return
  ctx.globalAlpha = Math.min(1, a)
  ctx.strokeStyle = color
  ctx.lineWidth = w
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
}

/**
 * A stone the front just reached: it flares (the renderer's white flash on
 * the pebble), and the blast strips light and ash off it, outward.
 */
const burstStone = (x: number, y: number, gx: number, gy: number, size: number, survivor: boolean): void => {
  const d = Math.max(1, Math.hypot(x - gx, y - gy))
  const ux = (x - gx) / d
  const uy = (y - gy) / d
  const ang = Math.atan2(uy, ux)
  const mid = moteId()
  const nm = count(survivor ? 3 : 4)
  for (let i = 0; i < nm; i++) {
    const a = ang + (Math.random() - 0.5) * 1.6
    const v = size * (0.6 + Math.random() * 1.4)
    spawn(x + (Math.random() - 0.5) * size * 0.3, y + (Math.random() - 0.5) * size * 0.3, Math.cos(a) * v, Math.sin(a) * v - size * 0.45,
      700 + Math.random() * 500, size * (0.05 + Math.random() * 0.05), i % 2 === 0 ? LIME : TOXIC, opts(6, mid, -size * 0.25, 1.4, 1))
  }
  const ns = count(6)
  for (let i = 0; i < ns; i++) {
    const a = ang + (Math.random() - 0.5) * 1.1
    const v = size * (3 + Math.random() * 3.5)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 150 + Math.random() * 170, size * (0.035 + Math.random() * 0.03), i % 2 === 0 ? '#ffffff' : HOT,
      opts(2, -1, 0, 2.8, 0))
  }
  if (!survivor) {
    const aid = ashId()
    const na = count(3)
    for (let i = 0; i < na; i++) {
      const a = ang + (Math.random() - 0.5) * 1.4
      const v = size * (0.8 + Math.random() * 1.4)
      spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 0.3, 900 + Math.random() * 600, size * (0.05 + Math.random() * 0.04), ASH,
        opts(5, aid, size * 0.5, 1.3, 2, (Math.random() - 0.5) * 9, false, 0.85))
    }
  }
}

/**
 * The inhale, `k` 0…1: the board darkens toward the blast's own dim, a lime
 * ring collapses from far out down to where the blast's pinch picks it up, the
 * warhead gathers light and squeezes, and light is pulled in off the board.
 */
const paintInhale = (e: Nuke, k: number, api: FxApi): void => {
  const ctx = api.ctx
  const size = api.size
  const b = api.board
  const x = api.cx(e.from.col, e.from.row)
  const y = api.cy(e.from.col, e.from.row)
  const s = 1 - 0.1 * easeInQuad(k)
  api.pose(e.from.id, (Math.random() - 0.5) * size * 0.03 * k, (Math.random() - 0.5) * size * 0.03 * k, s, s)
  ctx.save()
  ctx.beginPath()
  ctx.rect(b.x, b.y, b.w, b.h)
  ctx.clip()
  const dim = 0.4 * easeInQuad(k)
  if (dim > 0.01) {
    ctx.globalAlpha = dim
    ctx.fillStyle = '#05070a'
    ctx.fillRect(b.x, b.y, b.w, b.h)
  }
  ctx.globalCompositeOperation = 'lighter'
  // The ring, from 2.6 tiles out to the 1.5 the blast's pinch starts at.
  if (api.tier > 0) ring(ctx, x, y, size * (2.6 - 1.1 * easeInQuad(k)), size * (0.03 + 0.03 * k), LIME, 0.25 + 0.65 * k)
  // The core gathering.
  glow(ctx, glowSprite(), x, y, size * (0.6 + 0.5 * k), 0.25 + 0.55 * easeInQuad(k))
  glow(ctx, coreSprite(), x, y, size * (0.25 + 0.2 * k), 0.5 * k)
  ctx.restore()
  // Light pulled in off the board: streaks converging on the core.
  if (api.tier > 1 && api.canEmit) {
    const n = count(3)
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const r = size * (1.6 + Math.random() * 1.2)
      const v = size * (7 + Math.random() * 3)
      spawn(x + Math.cos(a) * r, y + Math.sin(a) * r, -Math.cos(a) * v, -Math.sin(a) * v, 120 + Math.random() * 60,
        size * (0.03 + Math.random() * 0.02), i % 2 === 0 ? LIME : HOT, opts(2, -1, 0, 0.5, 0))
    }
  }
}

// ─── The paint ──────────────────────────────────────────────────────────────

const paintNuke = (e: Nuke, p: number, api: FxApi): void => {
  const ctx = api.ctx
  const size = api.size
  const tier = api.tier
  const b = api.board
  const x = api.cx(e.from.col, e.from.row)
  const y = api.cy(e.from.col, e.from.row)
  const ms = p * e.dur
  // A stacked (Lv 2+) warhead: a bigger brand and a third heat ring.
  const big = e.from.level >= 2 ? 1.15 : 1
  const slot = slotFor(e)
  const R = frontAt(p, size)
  const prevR = slot.p < 0 ? -1 : frontAt(slot.p, size)
  slot.p = p

  // ── The stones the front reached since last frame ──
  if (R > prevR) {
    for (let i = 0; i < e.vaporised.length; i++) {
      const r = e.vaporised[i]!
      const sx = api.cx(r.col, r.row)
      const sy = api.cy(r.col, r.row)
      const d = Math.hypot(sx - x, sy - y)
      if (d > prevR && d <= R) {
        api.flash(r.id, 1)
        burstStone(sx, sy, x, y, size, false)
      }
    }
    for (let i = 0; i < e.hits.length; i++) {
      const h = e.hits[i]!
      const sx = api.cx(h.target.col, h.target.row)
      const sy = api.cy(h.target.col, h.target.row)
      const d = Math.hypot(sx - x, sy - y)
      if (d > prevR && d <= R) {
        api.flash(h.target.id, 1)
        burstStone(sx, sy, x, y, size, true)
      }
    }
  }

  // ── The warhead itself: squeezes down (the inhale), then bursts out of it ──
  if (p < 0.05) {
    const s = 0.9 - 0.14 * span(p, 0, 0.05)
    api.pose(e.from.id, 0, 0, s, s)
  } else if (p < 0.4) {
    const s = lerp(0.76, 1, easeOutBack(span(p, 0.05, 0.4)))
    api.pose(e.from.id, 0, 0, s, s)
  } else if ((slot.flags & F_POSED) === 0) {
    slot.flags |= F_POSED
    api.pose(e.from.id, 0, 0, 1, 1)
  }

  ctx.save()
  // Everything the blast paints stays on the BOARD: the HUD must not strobe.
  ctx.beginPath()
  ctx.rect(b.x, b.y, b.w, b.h)
  ctx.clip()

  // ── The pinch: the board dims for a frame — the light sucked into the core ──
  const dim = 0.4 * (1 - span(p, 0.015, 0.09))
  if (dim > 0.01) {
    ctx.globalAlpha = dim
    ctx.fillStyle = '#05070a'
    ctx.fillRect(b.x, b.y, b.w, b.h)
  }
  ctx.globalCompositeOperation = 'lighter'
  if (p < 0.07 && tier > 0) {
    // …the last of it converging on the warhead.
    const k = span(p, 0, 0.06)
    ring(ctx, x, y, size * 1.4 * (1 - easeInQuad(k)) + size * 0.1, size * 0.06, LIME, 0.9 * (1 - k))
  }

  // ── The flash: ONE bright pulse that decays — board rect only ──
  const rise = span(p, 0.012, 0.065)
  const flash = rise * (1 - easeOutQuad(span(p, 0.065, 0.42)))
  const white = rise * (1 - span(p, 0.065, 0.2))
  if (flash > 0.01) {
    ctx.globalAlpha = 0.12 * flash
    ctx.fillStyle = LIME
    ctx.fillRect(b.x, b.y, b.w, b.h)
    glow(ctx, flashSprite(), x, y, size * 9, 0.66 * flash)
  }
  if (white > 0.01) {
    ctx.globalAlpha = 0.16 * white * white
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(b.x, b.y, b.w, b.h)
  }

  // ── The fireball's heart: white for an instant, then cooling to lime ──
  const kc = span(p, 0, 0.22)
  const coreR = size * (0.3 + 1.2 * easeOutCubic(kc)) * (1 - 0.55 * easeOutQuad(span(p, 0.2, 0.9)))
  const coreA = clamp01(p / 0.025) * (1 - span(p, 0.18, 0.75))
  glow(ctx, coreSprite(), x, y, coreR * 2, coreA)
  glow(ctx, glowSprite(), x, y, size * (1 + 1.4 * easeOutCubic(kc)), 0.7 * clamp01(p / 0.03) * (1 - span(p, 0.3, 1.2)))

  // ── The brand: the hazard trefoil, seared across the middle of the board ──
  const kt = span(p, 0.02, 0.36)
  const brand = clamp01(kt * 3.5) * (1 - easeInQuad(span(p, 0.3, 1.0))) * 0.72
  glow(ctx, trefoilSprite(), x, y, size * (0.9 + 2.1 * easeOutCubic(kt)) * big, brand, -0.4 + p * 0.7)

  // ── The front: a razor shell of light and its wake, at the crack front's radius ──
  const fa = span(p, 0.035, 0.08) * (1 - span(p, 0.6, 0.95))
  if (fa > 0.01) {
    if (!blit(ctx, frontSprite(), x, y, R * 2, R * 2, fa * 0.95, true)) {
      ring(ctx, x, y, R, size * 0.1, LIME, fa * 0.7)
    }
    if (tier > 0) {
      ctx.globalCompositeOperation = 'lighter'
      ring(ctx, x, y, R, size * 0.16, TOXIC, fa * 0.22)
      ring(ctx, x, y, R, Math.max(1.5, size * 0.035), '#ffffff', fa * 0.95)
      // Heat rings chasing it — two, or three for a stacked warhead.
      const rings = big > 1 ? 3 : 2
      for (let j = 1; j <= rings; j++) {
        const pj = p - 0.11 * j
        if (pj <= 0) continue
        const aj = (1 - span(pj, 0.35, 0.85)) * (j === 1 ? 0.55 : j === 2 ? 0.35 : 0.25)
        ring(ctx, x, y, frontAt(pj, size), size * Math.max(0.018, 0.05 - 0.012 * j), j === 2 ? TOXIC : LIME, aj)
      }
    }
  }

  // ── The board lights up, tile by tile, as the front crosses it ──
  const tile = tileSprite()
  const tileFade = 1 - span(p, 0.7, 1.15)
  if (tileFade > 0) {
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const tx = api.cx(col, row)
        const ty = api.cy(col, row)
        const u = (R - Math.hypot(tx - x, ty - y)) / size
        if (u <= 0 || u >= 1.8) continue
        const a = (u < 0.18 ? u / 0.18 : 1 - (u - 0.18) / 1.62) * 0.6 * tileFade
        if (tile) glow(ctx, tile, tx, ty, size, a)
        else if (a > 0.01) {
          ctx.globalAlpha = a * 0.4
          ctx.fillStyle = LIME
          ctx.fillRect(tx - size * 0.45, ty - size * 0.45, size * 0.9, size * 0.9)
        }
      }
    }
  }

  // ── The linger: a radioactive afterglow, and heat shimmering off ground zero ──
  const after = span(p, 0.2, 0.45) * (1 - span(p, 1.0, 1 + TAIL_MS / Math.max(1, e.dur)))
  if (after > 0.01) {
    const pulse = 0.8 + 0.2 * Math.sin(ms * 0.018)
    glow(ctx, glowSprite(), x, y, size * 3, 0.6 * after * pulse)
    glow(ctx, glowSprite(), x, y, size * 1.2, 0.55 * after * pulse)
    if (tier > 0) {
      ctx.globalCompositeOperation = 'lighter'
      for (let j = 0; j < 2; j++) {
        const q = ((ms - 90) / 520 + j * 0.5) % 1
        if (ms < 90 + j * 260) continue
        ring(ctx, x, y, size * (0.35 + 1.5 * easeOutQuad(q)), size * 0.035, j === 0 ? LIME : TOXIC, 0.4 * (1 - q) * after)
      }
    }
  }
  ctx.restore()

  // ── The afterwind: light pulled back into the core; motes rising off it ──
  if (tier > 1 && api.canEmit && p > 0.42 && p < 1.5) {
    const fade = 1 - span(p, 1.1, 1.5)
    const k = count(3 * fade, 0)
    for (let i = 0; i < k; i++) {
      const a = Math.random() * Math.PI * 2
      const r = size * (1.3 + Math.random() * 1.6)
      const sx = x + Math.cos(a) * r
      const sy = y + Math.sin(a) * r
      if (sx < b.x || sx > b.x + b.w || sy < b.y || sy > b.y + b.h) continue
      const v = size * (2.4 + Math.random() * 1.2)
      spawn(sx, sy, -Math.cos(a) * v, -Math.sin(a) * v, (r / v) * 850, size * (0.04 + Math.random() * 0.03), i % 2 === 0 ? LIME : HOT,
        opts(2, -1, 0, 0.6, 0))
    }
    const nm = count(2 * fade, 0)
    const mid = moteId()
    for (let i = 0; i < nm; i++) {
      spawn(x + (Math.random() - 0.5) * size * 0.4, y - size * 0.1, (Math.random() - 0.5) * size * 0.3, -size * (0.8 + Math.random() * 0.8),
        480 + Math.random() * 300, size * (0.05 + Math.random() * 0.04), LIME, opts(6, mid, 0, 0.8, 1))
    }
  }
}

/** The moment it goes off (the end of the inhale): the shake, the flash, the spray. */
const detonate = (e: Nuke, api: FxApi): void => {
    const x = api.cx(e.from.col, e.from.row)
    const y = api.cy(e.from.col, e.from.row)
    const size = api.size
    // The heaviest shake in the game — this event's alone.
    api.shake('big')
    api.flash(e.from.id, 1)
    // The blast's own spray: white-hot streaks out at the front's speed…
    const ns = count(26)
    for (let i = 0; i < ns; i++) {
      const a = (i / ns) * Math.PI * 2 + Math.random() * 0.25
      const v = size * (5 + Math.random() * 5)
      spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 220 + Math.random() * 220, size * (0.04 + Math.random() * 0.035), i % 3 === 0 ? LIME : '#ffffff',
        opts(2, -1, 0, 2.2, 0))
    }
    // …glowing embers that hang over ground zero…
    const mid = moteId()
    const ne = count(8)
    for (let i = 0; i < ne; i++) {
      const a = Math.random() * Math.PI * 2
      const v = size * (0.8 + Math.random() * 1.8)
      spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 0.3, 800 + Math.random() * 500, size * (0.06 + Math.random() * 0.05), LIME,
        opts(6, mid, -size * 0.2, 1.5, 1))
    }
    // …and ash thrown out over the board, settling slowly.
    const aid = ashId()
    const na = count(8)
    for (let i = 0; i < na; i++) {
      const a = Math.random() * Math.PI * 2
      const v = size * (1.2 + Math.random() * 2.2)
      spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 1100 + Math.random() * 700, size * (0.05 + Math.random() * 0.045), ASH,
        opts(5, aid, size * 0.35, 1.25, 2, (Math.random() - 0.5) * 8, false, 0.85))
    }
}

export const nuker: RuneFx = {
  type: 'nuker',
  palette: { core: CORE, hot: HOT, deep: DEEP, accent: TOXIC },

  // The facts (a survivor's lost hit points) land once the front has reached
  // the farthest survivor — never before 0.3 of the window, never after 0.8.
  impactAt: (e) => {
    if (e.kind !== 'nuke') return undefined
    let far = 0
    for (let i = 0; i < e.hits.length; i++) {
      const t = e.hits[i]!.target
      far = Math.max(far, Math.hypot(t.col - e.from.col, t.row - e.from.row))
    }
    const b = frontArrival(far) + 0.03
    return Math.min(0.8, Math.max(0.3, NUKE_INHALE + (1 - NUKE_INHALE) * b))
  },
  tailMs: (e) => (e.kind === 'nuke' ? TAIL_MS : undefined),

  start(e: RuneEvent, api: FxApi) {
    if (e.kind !== 'nuke') return
    slotFor(e)
    // The cue carries its own inhale (a reverse swell into the crack), so it
    // starts with the event; everything that GOES OFF waits for `detonate`.
    api.sound('nuke', 1, { x: api.cx(e.from.col, e.from.row), level: e.from.level, side: e.from.side })
  },

  paint(e: RuneEvent, p: number, api: FxApi) {
    if (e.kind !== 'nuke') return
    if (p < NUKE_INHALE) { paintInhale(e, p / NUKE_INHALE, api); return }
    const slot = slotFor(e)
    if ((slot.flags & F_DETONATED) === 0) {
      slot.flags |= F_DETONATED
      detonate(e, api)
    }
    paintNuke(e, blastProgress(p), api)
  }
}
