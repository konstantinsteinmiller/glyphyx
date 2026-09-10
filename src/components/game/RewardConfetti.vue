<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mix } from '@/use/arenaFx'

/**
 * ─── The burst ──────────────────────────────────────────────────────────────
 *
 * Paper thrown over the reward screen when the chest opens, on a canvas of its
 * own IN FRONT of the prize — confetti falling behind the thing you just won
 * is confetti nobody sees.
 *
 * `pointer-events: none` on that canvas is load-bearing, not hygiene: a tap
 * anywhere on the reward overlay is what continues to the next screen, and a
 * full-viewport canvas that swallowed it would strand the player on a screen
 * whose only exit is an eight-second timer.
 *
 * ── Three things make paper look like paper ──
 *
 * 1. **It has a back.** Every piece spins about its own vertical axis, and at
 *    the halfway point of that spin you are looking at the SHADOWED side of
 *    the sheet — so the sprite is swapped for a darker one as `cos(flip)`
 *    changes sign. A piece that keeps one flat colour through the whole turn
 *    reads as a coloured brick, however fast it tumbles.
 * 2. **It catches light.** Each face is a gradient with a specular streak
 *    across it rather than a flat fill, so a sheet brightens as it turns.
 * 3. **It is not the backdrop.** The reward stage is a gold sunburst, and gold
 *    confetti on it disappears — the first version of this was white, gold and
 *    amber over amber rays and read as noise laid across the prize. The
 *    palette is now built around COLD accents (cyan, violet, spring, rose)
 *    that the rays cannot swallow, with the gift's own tone woven through so
 *    the burst still belongs to the thing that was won.
 *
 * On top of that each piece sways (`pswayf`/`pdrift`), because paper is light
 * enough for air to push it sideways, and sits at one of three DEPTHS that
 * scale its size, speed and brightness together — a field where everything is
 * the same size is a field with no volume.
 *
 * ── Where it comes from ──
 *
 * Not one point. A single origin in the middle of the screen buries the prize
 * under the celebration for it. Three sources instead, staggered in time:
 *
 *   • the chest's MOUTH — the pop, up and out, on the frame the lid flies;
 *   • two CANNONS in the bottom corners, angled inward and fast enough to
 *     cross the screen, which frames the prize instead of covering it;
 *   • a slow RAIN entering from above the top edge over the next second and a
 *     half, so the screen is still alive while the player reads the card.
 *
 * ── The engineering ──
 *
 * This fires on a phone, during a celebration that is already animating, right
 * before the next match starts. So it follows the arena's own discipline (see
 * `arenaFx.ts`):
 *
 *   • ONE pool of typed arrays, allocated once and reused — a structure of
 *     arrays, no per-piece objects, nothing allocated inside the frame loop;
 *   • every piece is ONE `drawImage` from a small pre-rendered atlas (nine
 *     colours × lit face / shadowed face / spark). Gradients and specular
 *     streaks are paid for once per burst instead of per piece per frame, and
 *     the draw loop touches no fill styles and walks no paths at all;
 *   • the canvas is cleared by DIRTY RECTANGLE — the box the last frame
 *     actually drew into, not the whole viewport. A full-screen clear at 60 Hz
 *     is pure fill rate, and for most of a burst the paper occupies a fraction
 *     of the screen;
 *   • the backing store is capped at 1.5× DPR. This layer is fast-moving
 *     confetti; nobody has ever seen its third device pixel, and on a phone
 *     that cap is most of the cost;
 *   • the RAF exists only while pieces are alive and stops itself on the last
 *     one, so nothing of this survives into the match that follows.
 *
 * With `prefers-reduced-motion` it emits nothing at all. Half-speed confetti
 * is still confetti; the rays and the prize carry the moment instead.
 */

interface Props {
  /** Fire a burst. Flipping false→true starts one; true→false stops and clears. */
  burst?: boolean
  /** The prize's own colour, woven through the palette so the paper matches the gift. */
  tone?: string
  /** Hard ceiling on pieces. Default modest; the component may use FEWER. */
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  burst: false,
  tone: '#ffd93c',
  count: 170
})

// ─── The pool ───────────────────────────────────────────────────────────────
//
// Capacity is fixed for the life of the component and never reallocated;
// `count` only decides how many of these slots a burst fills. One instance of
// this component exists at a time (the reward screen), but the arrays are
// per-instance rather than module-scope so two of them could never share a
// live piece.

/** Slots. A burst never asks for more; `spawn` stops at the ceiling. */
const CAPACITY = 220

const px = new Float32Array(CAPACITY)
const py = new Float32Array(CAPACITY)
const pvx = new Float32Array(CAPACITY)
const pvy = new Float32Array(CAPACITY)
/**
 * Seconds lived, and the total this piece gets. `plife` starts NEGATIVE for a
 * piece that is still in its cannon: that is the whole staggering mechanism —
 * a delayed piece is skipped by the integrator and by the draw, and costs a
 * float add per frame until its turn comes.
 */
const plife = new Float32Array(CAPACITY)
const pmax = new Float32Array(CAPACITY)
/** Half-extents, CSS px, already scaled by the piece's depth. */
const pw = new Float32Array(CAPACITY)
const ph = new Float32Array(CAPACITY)
/** In-plane tumble, and its rate. */
const prot = new Float32Array(CAPACITY)
const pvrot = new Float32Array(CAPACITY)
/** Rotation about the piece's own vertical axis — the face turn. */
const pflip = new Float32Array(CAPACITY)
const pvflip = new Float32Array(CAPACITY)
/** Sway: a sine on the horizontal, per piece — phase, frequency, amplitude. */
const pphase = new Float32Array(CAPACITY)
const pswayf = new Float32Array(CAPACITY)
const pdrift = new Float32Array(CAPACITY)
/** Its own gravity: a heavier scrap falls past a fluttering one. */
const pgrav = new Float32Array(CAPACITY)
/** Depth, 0…1 — dims the far pieces so the field has volume. */
const pdim = new Float32Array(CAPACITY)
/** 0 = sheet, 1 = ribbon, 2 = spark. */
const pshape = new Uint8Array(CAPACITY)
/** Index into `palette` — and, with the face, into the atlas. */
const pcol = new Uint8Array(CAPACITY)

/** Pieces occupy slots `0 … alive - 1`; a dead one is swapped with the last. */
let alive = 0

/** Rebuilt per burst from `tone`; indexed by `pcol`, never allocated per frame. */
let palette: string[] = []

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let last = 0
/** Canvas size in CSS px, re-measured on resize. */
let cssW = 0
let cssH = 0
let dpr = 1

// ─── Tuning ─────────────────────────────────────────────────────────────────

/** Exponential damping per second — paper sheds speed fast. */
const DRAG = 0.9
/** The chest's mouth sits above centre; the pop leaves from there. */
const ORIGIN_Y = 0.44
/** A screen this big gets the full count; smaller ones get proportionally fewer. */
const REFERENCE_AREA = 900 * 700
/** Atlas cell, device px. Big enough for the largest piece, small enough to be free. */
const SPRITE = 32

const reducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/**
 * How many pieces this viewport gets. Scaled DOWN from the ceiling on a small
 * screen and never up: a phone has less room for paper, less GPU to spend, and
 * is the device most likely to be mid-animation when this fires. A machine
 * that admits to few cores gives up another third — the burst is decoration,
 * and the match loading behind it is not.
 */
const pieceCount = (): number => {
  const area = Math.max(1, cssW * cssH)
  const cores = typeof navigator !== 'undefined' ? Number(navigator.hardwareConcurrency) || 8 : 8
  const budget = cores <= 4 ? 0.66 : 1
  // Floored at 0.62 of the ceiling as well as scaled: a phone is the screen
  // most likely to be SEEN, and a burst thin enough to count is not a burst.
  const scaled = Math.round(props.count * Math.max(0.62, Math.min(1, area / REFERENCE_AREA)) * budget)
  return Math.max(0, Math.min(CAPACITY, Math.min(props.count, Math.max(30, scaled))))
}

/**
 * The palette, weighted by REPETITION rather than by a sampling table — the
 * spawn loop picks a slot uniformly, so a colour listed twice is twice as
 * likely and nothing has to be allocated to say so.
 *
 * The cold four carry the burst because the stage behind it is gold; the
 * gift's own tone and its lightened twin keep the paper related to the prize.
 */
const buildPalette = (tone: string): string[] => [
  '#4fe3ff', '#4fe3ff',
  '#a97bff', '#a97bff',
  '#4be08a',
  '#ff5f8f',
  tone,
  mix(tone, '#ffffff', 0.6),
  '#ffffff'
]

// ─── The atlas ──────────────────────────────────────────────────────────────
//
// Three rows per colour: the LIT face, the SHADOWED face it turns onto, and a
// spark. Painted once per burst, then every piece on every frame is a single
// `drawImage` out of it.
//
// Each cell is painted INSET by a pixel, so the transparent gutter is what a
// scaled sample bleeds into. Without it a shrunken piece picks up its
// neighbour's colour along the edge; with it the edge goes soft, which is what
// a sheet of paper in motion looks like anyway.

let atlas: HTMLCanvasElement | null = null

const paintFace = (a: CanvasRenderingContext2D, x: number, y: number, hi: string, mid: string, lo: string): void => {
  const g = a.createLinearGradient(x, y, x + SPRITE, y + SPRITE)
  g.addColorStop(0, hi)
  g.addColorStop(0.55, mid)
  g.addColorStop(1, lo)
  a.fillStyle = g
  a.fillRect(x + 1, y + 1, SPRITE - 2, SPRITE - 2)
  // The specular streak: the reason a turning sheet flashes rather than just
  // changing colour.
  const s = a.createLinearGradient(x, y + SPRITE, x + SPRITE, y)
  s.addColorStop(0, 'rgba(255,255,255,0)')
  s.addColorStop(0.5, 'rgba(255,255,255,0.5)')
  s.addColorStop(1, 'rgba(255,255,255,0)')
  a.fillStyle = s
  a.fillRect(x + 1, y + 1, SPRITE - 2, SPRITE - 2)
}

const paintSpark = (a: CanvasRenderingContext2D, x: number, y: number, col: string): void => {
  const r = SPRITE / 2
  const g = a.createRadialGradient(x + r, y + r, 0, x + r, y + r, r - 1)
  g.addColorStop(0, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.45, col)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  a.fillStyle = g
  a.fillRect(x, y, SPRITE, SPRITE)
}

/** The tone the atlas in hand was painted for; a repeat burst repaints nothing. */
let atlasTone = ''

const buildAtlas = (pal: string[]): void => {
  atlas = null
  if (typeof document === 'undefined') return
  const c = document.createElement('canvas')
  c.width = SPRITE * pal.length
  c.height = SPRITE * 3
  let a: CanvasRenderingContext2D | null = null
  // jsdom has no 2D context; the draw loop falls back to flat rectangles.
  try { a = c.getContext('2d') } catch { a = null }
  if (!a) return
  for (let i = 0; i < pal.length; i++) {
    const col = pal[i] ?? '#ffffff'
    const x = i * SPRITE
    paintFace(a, x, 0, mix(col, '#ffffff', 0.5), col, mix(col, '#000000', 0.35))
    paintFace(a, x, SPRITE, mix(col, '#000000', 0.2), mix(col, '#000000', 0.45), mix(col, '#000000', 0.7))
    paintSpark(a, x, SPRITE * 2, col)
  }
  atlas = c
}

/**
 * The palette and its atlas, ready before they are needed.
 *
 * Called on MOUNT as well as from `spawn`, and that is the point: the chest
 * knows its prize's colour long before the lid comes off, so the twenty-seven
 * gradient fills that paint the atlas happen on a quiet frame instead of on
 * the one frame of the whole game that is already doing the most — the reveal,
 * which mounts the card, lights the stage and starts the burst at once. On a
 * repeat burst of the same tone it does nothing at all.
 */
const ensureAtlas = (): void => {
  if (atlas && atlasTone === props.tone) return
  palette = buildPalette(props.tone)
  buildAtlas(palette)
  atlasTone = props.tone
}

const rand = (a: number, b: number): number => a + Math.random() * (b - a)

/**
 * Fill the pool from the three sources. Allocates nothing but the palette and
 * the atlas, both once.
 */
const spawn = (): void => {
  ensureAtlas()
  const n = pieceCount()
  const mouthX = cssW * 0.5
  const mouthY = cssH * ORIGIN_Y
  // Speed is tied to the smaller axis so the burst covers the same FRACTION of
  // a phone as of a desktop, rather than dribbling on one and leaving on the other.
  const reach = Math.max(320, Math.min(cssW, cssH))
  alive = 0
  for (let i = 0; i < n; i++) {
    const roll = i / n
    // Three sources, dealt in blocks so the shares are exact rather than
    // whatever the dice gave: the pop, the corner cannons, then the rain.
    const source = roll < 0.34 ? 0 : roll < 0.68 ? 1 : 2
    // Depth first: it scales size, speed and brightness together.
    const depth = rand(0.6, 1.18)

    if (source === 0) {
      // The pop, out of the chest's mouth: a wide cone, up and out.
      const side = Math.random() < 0.5 ? -1 : 1
      const angle = -Math.PI / 2 + side * rand(0.1, 1.15)
      const speed = rand(0.7, 1.7) * reach * depth
      px[i] = mouthX + rand(-16, 16)
      py[i] = mouthY + rand(-10, 10)
      pvx[i] = Math.cos(angle) * speed
      pvy[i] = Math.sin(angle) * speed
      plife[i] = -rand(0, 0.06)
      pmax[i] = rand(2.0, 3.2)
    } else if (source === 1) {
      // The corner cannons: low, fast, angled inward and steeply up, so the
      // paper arcs OVER the prize and comes down at the sides of it. Canvas y
      // points down, so up is a negative angle; the right cannon is the left
      // one reflected through the vertical.
      const left = i % 2 === 0
      const a2 = left ? -rand(0.98, 1.32) : -Math.PI + rand(0.98, 1.32)
      px[i] = left ? cssW * 0.04 : cssW * 0.96
      py[i] = cssH * 0.99
      // Fast enough to actually cross: a cannon that dies at knee height is a
      // pile of paper in the corner, which is what the first tuning gave.
      const speed = rand(2.05, 3.05) * reach * depth
      pvx[i] = Math.cos(a2) * speed
      pvy[i] = Math.sin(a2) * speed
      plife[i] = -rand(0.02, 0.16)
      pmax[i] = rand(2.6, 3.8)
    } else {
      // The rain: enters from above over the next second and a half and drifts
      // down past the card, so the screen is not dead while it is being read.
      px[i] = rand(-0.04, 1.04) * cssW
      py[i] = rand(-260, -20)
      pvx[i] = rand(-60, 60)
      pvy[i] = rand(60, 190)
      plife[i] = -rand(0.1, 1.5)
      pmax[i] = rand(3.4, 5.2)
    }

    const shape = Math.random()
    if (shape < 0.2) {
      // Ribbon: long, thin, tumbling slowly — it reads as streamer.
      pshape[i] = 1
      pw[i] = rand(3.2, 5) * depth
      ph[i] = rand(11, 20) * depth
      pvrot[i] = rand(-3.4, 3.4)
      pvflip[i] = rand(2.2, 5) * (Math.random() < 0.5 ? -1 : 1)
    } else if (shape < 0.3) {
      // Spark: a glitter mote, no faces, twinkling on its own clock.
      pshape[i] = 2
      pw[i] = rand(2.2, 4) * depth
      ph[i] = pw[i]!
      pvrot[i] = 0
      pvflip[i] = rand(9, 18)
    } else {
      pshape[i] = 0
      pw[i] = rand(5, 10) * depth
      ph[i] = rand(7, 13) * depth
      pvrot[i] = rand(-6.5, 6.5)
      pvflip[i] = rand(3.4, 9.5) * (Math.random() < 0.5 ? -1 : 1)
    }
    prot[i] = Math.random() * Math.PI * 2
    pflip[i] = Math.random() * Math.PI * 2
    pphase[i] = Math.random() * Math.PI * 2
    pswayf[i] = rand(2.1, 4.4)
    pdrift[i] = rand(16, 62) * depth
    // Lighter paper falls slower; a ribbon hangs longest of all.
    pgrav[i] = rand(720, 1180) * (pshape[i] === 1 ? 0.72 : 1) * (source === 1 ? 0.85 : 1)
    // Far pieces sit back: dimmer, so the near ones read as near.
    pdim[i] = 0.62 + 0.38 * Math.min(1, (depth - 0.6) / 0.58)
    pcol[i] = Math.floor(Math.random() * palette.length) % palette.length
    alive++
  }
}

/** Drop slot `i`, filling the hole with the last live piece. */
const kill = (i: number): void => {
  const j = alive - 1
  if (i !== j) {
    px[i] = px[j]!; py[i] = py[j]!; pvx[i] = pvx[j]!; pvy[i] = pvy[j]!
    plife[i] = plife[j]!; pmax[i] = pmax[j]!; pw[i] = pw[j]!; ph[i] = ph[j]!
    prot[i] = prot[j]!; pvrot[i] = pvrot[j]!; pflip[i] = pflip[j]!; pvflip[i] = pvflip[j]!
    pphase[i] = pphase[j]!; pswayf[i] = pswayf[j]!; pdrift[i] = pdrift[j]!
    pgrav[i] = pgrav[j]!; pdim[i] = pdim[j]!; pshape[i] = pshape[j]!; pcol[i] = pcol[j]!
  }
  alive--
}

/**
 * Backing store to the device's pixels, capped at 1.5. This layer is paper
 * moving at a hundred pixels a frame: the third device pixel is invisible on
 * it and costs a third of the fill rate on the machines least able to spare it.
 */
const measure = (): void => {
  const el = canvas.value
  if (!el) return
  dpr = Math.min(1.5, Math.max(1, (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1))
  cssW = Math.max(1, Math.round(el.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 0) || 1))
  cssH = Math.max(1, Math.round(el.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 0) || 1))
  const w = Math.max(1, Math.round(cssW * dpr))
  const h = Math.max(1, Math.round(cssH * dpr))
  if (el.width !== w) el.width = w
  if (el.height !== h) el.height = h
}

// ─── The dirty rectangles ───────────────────────────────────────────────────
//
// Where the LAST frame actually put pixels: an (x, y, radius) triple per piece
// drawn, written in draw order into one flat array. The next frame clears
// exactly those boxes and nothing else.
//
// Per PIECE rather than one union box, because this burst deliberately spans
// the screen — a cannon at the bottom, rain at the top — so their union is the
// whole viewport within a few frames and would save nothing. Eighty small
// clears cost a fraction of one full-screen clear at 60 Hz, which on a phone
// is most of what a confetti layer spends.
//
// The list is independent of pool slots on purpose: `kill` swaps slots around,
// but a box drawn last frame has to be wiped whoever owns that slot now.

const dbox = new Float32Array(CAPACITY * 3)
let dboxN = 0

const clearDrawn = (): void => {
  if (!ctx) return
  for (let k = 0; k < dboxN; k++) {
    const x = dbox[k * 3]!
    const y = dbox[k * 3 + 1]!
    const r = dbox[k * 3 + 2]! + 1
    ctx.clearRect((x - r) * dpr, (y - r) * dpr, r * 2 * dpr, r * 2 * dpr)
  }
  dboxN = 0
}

const clearAll = (): void => {
  if (!ctx) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, cssW * dpr, cssH * dpr)
  dboxN = 0
}

const stop = (): void => {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  alive = 0
  clearAll()
}

const step = (now: number): void => {
  // Clamped so a backgrounded tab does not resume with one enormous frame that
  // teleports every piece off screen.
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)) || 0.016
  last = now
  const damp = Math.pow(DRAG, dt)

  for (let i = alive - 1; i >= 0; i--) {
    const t = plife[i]! + dt
    plife[i] = t
    // Still in the cannon: no physics, no pixels, one add.
    if (t < 0) continue
    if (t >= pmax[i]!) { kill(i); continue }

    pvx[i]! *= damp
    pvy[i]! = pvy[i]! * damp + pgrav[i]! * dt
    // Air pushing the piece sideways; the phase and the frequency keep the
    // field from breathing as one animal.
    const sway = Math.sin(t * pswayf[i]! + pphase[i]!) * pdrift[i]!
    px[i]! += (pvx[i]! + sway) * dt
    py[i]! += pvy[i]! * dt
    prot[i]! += pvrot[i]! * dt
    pflip[i]! += pvflip[i]! * dt

    // Gone past the bottom with no way back — free the slot early.
    if (py[i]! - 40 > cssH && pvy[i]! > 0) kill(i)
  }

  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    clearDrawn()
    for (let i = 0; i < alive; i++) {
      const t = plife[i]!
      if (t < 0) continue
      const f = t / pmax[i]!
      // In quickly (so the rain does not pop into existence at the top edge),
      // full for most of the fall, then out — paper does not dim as it
      // travels, it leaves.
      let a = pdim[i]!
      if (t < 0.12) a *= t / 0.12
      if (f > 0.78) a *= 1 - (f - 0.78) / 0.22
      const shape = pshape[i]!
      const cf = Math.cos(pflip[i]!)
      if (shape === 2) {
        // A spark has no faces — it twinkles instead, on its own clock.
        a *= 0.55 + 0.45 * cf
      }
      if (a <= 0.01) continue
      // A ribbon seen edge-on collapses to a one-pixel scratch — a hair drawn
      // across the prize, which is exactly what the old burst's streamers
      // looked like. It is never allowed to close past a half.
      const squeeze = shape === 1
        ? (cf < 0 ? -1 : 1) * Math.max(0.45, Math.abs(cf))
        : shape === 2 ? 1 : cf
      const w = pw[i]!
      const h = ph[i]!
      const c = Math.cos(prot[i]!)
      const s = Math.sin(prot[i]!)
      // translate · rotate · scaleX, folded into one matrix and premultiplied
      // by the DPR: one call per piece, no save/restore churn.
      ctx.setTransform(dpr * c * squeeze, dpr * s * squeeze, dpr * -s, dpr * c, dpr * px[i]!, dpr * py[i]!)
      ctx.globalAlpha = a
      if (atlas) {
        // Row 0 lit, row 1 the shadowed back, row 2 the spark.
        const row = shape === 2 ? 2 : cf >= 0 ? 0 : 1
        ctx.drawImage(atlas, pcol[i]! * SPRITE, row * SPRITE, SPRITE, SPRITE, -w, -h, w * 2, h * 2)
      } else {
        ctx.fillStyle = palette[pcol[i]!] ?? '#ffffff'
        ctx.fillRect(-w, -h, w * 2, h * 2)
      }
      // Remember the box this piece could have touched, in CSS px, for the
      // next frame to wipe. Rotation is bounded by the diagonal, so the
      // half-diagonal covers every angle it might have been drawn at.
      const k = dboxN * 3
      dbox[k] = px[i]!
      dbox[k + 1] = py[i]!
      dbox[k + 2] = Math.hypot(w, h)
      dboxN++
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
  }

  // The loop exists only while there is something to draw.
  if (alive > 0) raf = requestAnimationFrame(step)
  else { raf = 0; clearAll() }
}

const fire = (): void => {
  if (reducedMotion()) return
  measure()
  clearAll()
  spawn()
  if (alive === 0) return
  last = typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (!raf) raf = requestAnimationFrame(step)
}

const onResize = (): void => { measure() }

onMounted(() => {
  const el = canvas.value
  if (el) {
    // jsdom has no 2D context: every path below survives `ctx === null`, which
    // is also what a lost context looks like.
    try { ctx = el.getContext('2d') } catch { ctx = null }
  }
  measure()
  if (typeof window !== 'undefined') window.addEventListener('resize', onResize)
  // Paint the atlas now, on a frame with nothing else to do.
  if (!reducedMotion()) ensureAtlas()
  if (props.burst) fire()
})

// A prize whose colour changes before the chest opens repaints ahead of time too.
watch(() => props.tone, () => { if (!reducedMotion()) ensureAtlas() })

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', onResize)
  stop()
  atlas = null
  atlasTone = ''
  ctx = null
})

watch(() => props.burst, (on) => { if (on) fire(); else stop() })

/**
 * Test-only seams. `capacity` is the pool's fixed size and must never change;
 * `alive` is how much of it is in use. Nothing in the app reads these.
 */
defineExpose({
  __capacity: (): number => CAPACITY,
  __alive: (): number => alive,
  __running: (): boolean => raf !== 0
})
</script>

<template lang="pug">
  canvas.reward-confetti(ref="canvas" aria-hidden="true")
</template>

<style scoped lang="sass">
// In FRONT of the prize (the rays are 0, the gift 2), and deaf to the pointer:
// a tap anywhere on this overlay is what continues to the next screen.
.reward-confetti
  position: fixed
  inset: 0
  z-index: 3
  width: 100%
  height: 100%
  pointer-events: none
  user-select: none
</style>
