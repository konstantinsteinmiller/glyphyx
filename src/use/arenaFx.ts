import { glyphPath } from '@/game/glyphs'
import { aimRegionOuterEdge, aimRegionPolygon, aimRegionShape, type Dir, type RuneType } from '@/game/rules'
import { emit as emitParticle, qualityTier, registerSprite, type EmitOptions, type QualityTier } from '@/use/useVfx'

/**
 * ─── Arena effects: baked light, painted per frame ──────────────────────────
 *
 * Every effect the resolution plays — the slash, the arrow, the beam, the
 * dome, the heal, the merge, the shatter, the clash, the capture — as one
 * PAINTER (`paintX(ctx, t01, …)`, a pure function of the event's progress) or
 * one SPAWNER (`spawnX(…)`, which drops particles into `useVfx`'s pool).
 *
 * The one rule: NOTHING here sets `shadowBlur` or `filter`, ever. Blur is a
 * per-pixel convolution the rasteriser re-runs on every frame of every glow,
 * and it is the single most expensive thing a 2D canvas can be asked to do on
 * a phone. Light here comes from SPRITES baked once per colour and size
 * bucket — a radial ramp, a ring, a streak, a dome, a crack — blitted with
 * `drawImage`, often in `lighter` mode so overlapping light adds up the way
 * light does. Gradients that must be live (a beam of arbitrary length) are
 * drawn in a rotated local space so the gradient object itself is fixed and
 * cached.
 *
 * Coordinates are CSS pixels with y DOWN, the renderer's own. `size` is one
 * tile. The particle pool's world is y UP, so the spawners flip on the way in
 * (`y: -y, vy: -vy`), exactly as `useArenaArt`'s `spark` does; the renderer
 * keeps projecting with `toY = (wy) => -wy`.
 *
 * Everything is total: with no offscreen context (jsdom, a lost context) every
 * bake returns `null` and the painters fall back to plain strokes — dimmer,
 * never wrong, never a throw.
 */

// ─── Colour helpers (cached, allocation-free on the hot path) ───────────────

const rgbCache = new Map<string, [number, number, number]>()

/** `#rgb` / `#rrggbb` / `rgb(a)` → [r, g, b]. Cached per string. */
export const hexRgb = (color: string): [number, number, number] => {
  const hit = rgbCache.get(color)
  if (hit) return hit
  let out: [number, number, number] = [255, 255, 255]
  const m = /^#([0-9a-f]{3,8})$/i.exec(color.trim())
  if (m) {
    let h = m[1]!
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('')
    out = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  } else {
    const n = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(color)
    if (n) out = [Number(n[1]), Number(n[2]), Number(n[3])]
  }
  rgbCache.set(color, out)
  return out
}

const rgbaCache = new Map<string, string>()

/** `rgba()` string for a colour at alpha `a` (alpha bucketed to 1/100). */
export const rgba = (color: string, a: number): string => {
  const q = Math.round(Math.max(0, Math.min(1, a)) * 100)
  const key = `${color}|${q}`
  const hit = rgbaCache.get(key)
  if (hit) return hit
  const [r, g, b] = hexRgb(color)
  const s = `rgba(${r},${g},${b},${q / 100})`
  if (rgbaCache.size > 2048) rgbaCache.clear()
  rgbaCache.set(key, s)
  return s
}

/** Mix two colours (0 = a, 1 = b) into an `rgb()` string. */
export const mix = (a: string, b: string, k: number): string => {
  const [r1, g1, b1] = hexRgb(a)
  const [r2, g2, b2] = hexRgb(b)
  const t = Math.max(0, Math.min(1, k))
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
const easeOutBack = (t: number): number => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const easeInQuad = (t: number): number => t * t

/** A cheap, deterministic hash → [0, 1). Used for crackle and shard variety. */
export const hash01 = (n: number): number => {
  let x = Math.imul(n | 0, 0x9e3779b1) ^ 0x85ebca6b
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d)
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39)
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296
}

// ─── The sprite bakery ──────────────────────────────────────────────────────
//
// Own cache, separate from `useGradientRamps`' 64-slot ring: that one is
// dropped whenever the art layer changes, and it is sized for a dozen smoke
// colours. These sprites depend on nothing but a colour and a size bucket.

const bakes = new Map<string, HTMLCanvasElement | null>()
// Ten rune modules bake their own light now: 18 bench scenarios alone fill
// ~200 slots before the board's glows and previews add theirs.
const BAKE_LIMIT = 480

/** Bake `draw` into a `px`×`px` canvas under `key`, once. `null` where there is no 2D context. */
export const bakeSprite = (
  key: string, px: number, draw: (ctx: CanvasRenderingContext2D, px: number) => void
): HTMLCanvasElement | null => {
  const hit = bakes.get(key)
  if (hit !== undefined) return hit
  let made: HTMLCanvasElement | null = null
  try {
    const c = document.createElement('canvas')
    c.width = px
    c.height = px
    const t = c.getContext('2d')
    if (t) { draw(t, px); made = c }
  } catch { made = null }
  if (bakes.size >= BAKE_LIMIT) {
    // Drop the OLDEST quarter (a Map iterates in insertion order), never the
    // lot: clearing everything re-baked every effect's light mid-match, a
    // frame hitch per sprite. Anything a module or the particle pool still
    // holds keeps working — they own their own references.
    let n = Math.floor(BAKE_LIMIT / 4)
    for (const k of bakes.keys()) { bakes.delete(k); if (--n <= 0) break }
  }
  bakes.set(key, made)
  return made
}

/** How many sprites are baked right now (tests, the debug HUD). */
export const bakedSpriteCount = (): number => bakes.size
/** Drop every bake (a DPR change, tests). */
export const clearFxSprites = (): void => { bakes.clear(); spriteIds.clear() }

/** Size buckets, in source pixels: a glow drawn at any size is blitted from the nearest bucket. */
export const bucketFor = (px: number): number => (px <= 56 ? 48 : px <= 120 ? 96 : 192)

/** A soft radial glow: bright core, transparent edge. */
export const glowSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`glow|${color}|${b}`, b, (t, s) => {
    const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, rgba(color, 1))
    g.addColorStop(0.28, rgba(color, 0.55))
    g.addColorStop(0.6, rgba(color, 0.14))
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
  })
}

/** A white-hot core inside a coloured glow — the head of an arrow, the tip of a spark. */
export const coreSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`core|${color}|${b}`, b, (t, s) => {
    const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.18, rgba(color, 0.95))
    g.addColorStop(0.5, rgba(color, 0.3))
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
  })
}

/** A soft ring (band centred at 0.78 of the radius), for shockwaves and pulses. */
export const ringSprite = (color: string, px: number, width = 0.16): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  const w = Math.round(width * 100)
  return bakeSprite(`ring|${color}|${b}|${w}`, b, (t, s) => {
    const mid = 0.78
    const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, rgba(color, 0))
    g.addColorStop(Math.max(0, mid - width), rgba(color, 0))
    g.addColorStop(mid - width * 0.35, rgba(color, 0.9))
    g.addColorStop(mid, 'rgba(255,255,255,0.95)')
    g.addColorStop(Math.min(1, mid + width * 0.35), rgba(color, 0.9))
    g.addColorStop(Math.min(1, mid + width), rgba(color, 0))
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
  })
}

/** A horizontal streak: bright at the right (the head), fading to the left (the tail). */
export const streakSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`streak|${color}|${b}`, b, (t, s) => {
    const along = t.createLinearGradient(0, 0, s, 0)
    along.addColorStop(0, rgba(color, 0))
    along.addColorStop(0.55, rgba(color, 0.35))
    along.addColorStop(0.88, rgba(color, 0.95))
    along.addColorStop(1, 'rgba(255,255,255,1)')
    t.fillStyle = along
    t.fillRect(0, 0, s, s)
    // Soften across the streak so it reads as a ribbon, not a bar.
    const across = t.createLinearGradient(0, 0, 0, s)
    across.addColorStop(0, 'rgba(0,0,0,1)')
    across.addColorStop(0.5, 'rgba(0,0,0,0)')
    across.addColorStop(1, 'rgba(0,0,0,1)')
    t.globalCompositeOperation = 'destination-out'
    t.fillStyle = across
    t.fillRect(0, 0, s, s)
  })
}

/** A small mote: a soft dot with a bright pin-point. */
export const moteSprite = (color: string): HTMLCanvasElement | null =>
  bakeSprite(`mote|${color}`, 32, (t, s) => {
    const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.3, rgba(color, 0.9))
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
  })

/** A hemisphere seen from slightly above: the shield dome. */
export const domeSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`dome|${color}|${b}`, b, (t, s) => {
    const r = s * 0.46
    const cx = s / 2
    const cy = s * 0.56
    // Body: faint fill brighter toward the rim (a Fresnel-ish read).
    const body = t.createRadialGradient(cx, cy, r * 0.2, cx, cy, r)
    body.addColorStop(0, rgba(color, 0.05))
    body.addColorStop(0.75, rgba(color, 0.16))
    body.addColorStop(0.93, rgba(color, 0.55))
    body.addColorStop(1, rgba(color, 0))
    t.fillStyle = body
    t.beginPath(); t.arc(cx, cy, r, Math.PI, 0); t.closePath(); t.fill()
    // Rim light along the equator.
    t.strokeStyle = 'rgba(255,255,255,0.85)'
    t.lineWidth = s * 0.025
    t.beginPath(); t.ellipse(cx, cy, r, r * 0.22, 0, 0, Math.PI * 2); t.stroke()
    // Specular arc, upper left.
    t.strokeStyle = 'rgba(255,255,255,0.7)'
    t.lineWidth = s * 0.02
    t.beginPath(); t.arc(cx, cy, r * 0.86, Math.PI * 1.15, Math.PI * 1.55); t.stroke()
  })
}

/** Radial cracks — the clash flash's signature. Deterministic per colour. */
export const crackSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`crack|${color}|${b}`, b, (t, s) => {
    const cx = s / 2
    const cy = s / 2
    t.strokeStyle = rgba(color, 0.95)
    t.lineCap = 'round'
    const arms = 9
    for (let i = 0; i < arms; i++) {
      const a0 = (i / arms) * Math.PI * 2 + hash01(i * 7 + 1) * 0.5
      let x = cx
      let y = cy
      let a = a0
      const segs = 4 + Math.floor(hash01(i * 13 + 2) * 3)
      const len = s * (0.32 + hash01(i * 17 + 3) * 0.16) / segs
      t.lineWidth = s * 0.03
      t.beginPath(); t.moveTo(x, y)
      for (let k = 0; k < segs; k++) {
        a += (hash01(i * 31 + k * 5) - 0.5) * 0.9
        x += Math.cos(a) * len
        y += Math.sin(a) * len
        t.lineTo(x, y)
        t.lineWidth = s * 0.03 * (1 - k / segs)
        // A side branch every other segment.
        if (k % 2 === 1) {
          const ba = a + (hash01(i * 41 + k) - 0.5) * 1.6
          t.moveTo(x, y)
          t.lineTo(x + Math.cos(ba) * len * 0.6, y + Math.sin(ba) * len * 0.6)
          t.moveTo(x, y)
        }
      }
      t.stroke()
    }
    // Bright centre.
    const g = t.createRadialGradient(cx, cy, 0, cx, cy, s * 0.22)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
  })
}

/** A four-pointed star glint. */
export const glintSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`glint|${color}|${b}`, b, (t, s) => {
    const c = s / 2
    const draw = (len: number, wid: number, alpha: number): void => {
      t.fillStyle = rgba(color, alpha)
      t.beginPath()
      t.moveTo(c, c - len); t.lineTo(c + wid, c); t.lineTo(c, c + len); t.lineTo(c - wid, c); t.closePath()
      t.fill()
      t.beginPath()
      t.moveTo(c - len, c); t.lineTo(c, c - wid); t.lineTo(c + len, c); t.lineTo(c, c + wid); t.closePath()
      t.fill()
    }
    draw(s * 0.48, s * 0.05, 0.5)
    draw(s * 0.34, s * 0.035, 0.9)
    const g = t.createRadialGradient(c, c, 0, c, c, s * 0.16)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(1, rgba(color, 0))
    t.fillStyle = g
    t.fillRect(0, 0, s, s)
  })
}

/** A hexagon outline, for shield shards and the aura. */
export const hexSprite = (color: string, px: number): HTMLCanvasElement | null => {
  const b = bucketFor(px)
  return bakeSprite(`hex|${color}|${b}`, b, (t, s) => {
    const c = s / 2
    const r = s * 0.42
    t.strokeStyle = rgba(color, 0.95)
    t.lineWidth = s * 0.06
    t.lineJoin = 'round'
    t.beginPath()
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * Math.PI * 2 - Math.PI / 6
      const x = c + Math.cos(th) * r
      const y = c + Math.sin(th) * r
      if (k === 0) t.moveTo(x, y); else t.lineTo(x, y)
    }
    t.closePath()
    t.stroke()
    t.fillStyle = rgba(color, 0.18)
    t.fill()
  })
}

/** A rounded chip of stone, for dust-free debris. */
export const chipSprite = (color: string): HTMLCanvasElement | null =>
  bakeSprite(`chip|${color}`, 24, (t, s) => {
    t.fillStyle = color
    t.beginPath()
    t.moveTo(s * 0.2, s * 0.3); t.lineTo(s * 0.75, s * 0.15); t.lineTo(s * 0.85, s * 0.65); t.lineTo(s * 0.4, s * 0.9); t.closePath()
    t.fill()
    t.fillStyle = 'rgba(255,255,255,0.35)'
    t.beginPath(); t.moveTo(s * 0.2, s * 0.3); t.lineTo(s * 0.75, s * 0.15); t.lineTo(s * 0.5, s * 0.4); t.closePath(); t.fill()
  })

/** A confetti rectangle in two tones (front / back), flipped by the particle's rotation. */
export const confettiSprite = (color: string): HTMLCanvasElement | null =>
  bakeSprite(`confetti|${color}`, 24, (t, s) => {
    t.fillStyle = color
    t.fillRect(s * 0.15, s * 0.3, s * 0.7, s * 0.4)
    t.fillStyle = 'rgba(255,255,255,0.45)'
    t.fillRect(s * 0.15, s * 0.3, s * 0.7, s * 0.12)
  })

/**
 * The `i`-th of `n` pie-slice pieces of a rune: the glyph in `ink` on a chip of
 * `stone`, clipped to its sector. Spawned as shards when a rune shatters, so
 * the pieces are recognisably the thing that broke.
 */
export const glyphShardSprite = (type: RuneType, stone: string, ink: string, i: number, n: number): HTMLCanvasElement | null =>
  bakeSprite(`gshard|${type}|${stone}|${ink}|${i}/${n}`, 48, (t, s) => {
    const c = s / 2
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1) / n) * Math.PI * 2
    t.beginPath()
    t.moveTo(c, c)
    t.arc(c, c, s * 0.5, a0, a1)
    t.closePath()
    t.clip()
    t.fillStyle = stone
    t.beginPath(); t.arc(c, c, s * 0.46, 0, Math.PI * 2); t.fill()
    t.fillStyle = 'rgba(0,0,0,0.25)'
    t.beginPath(); t.arc(c + s * 0.06, c + s * 0.08, s * 0.46, 0, Math.PI * 2); t.fill()
    t.translate(c - s * 0.32, c - s * 0.32)
    t.scale(s * 0.64 / 100, s * 0.64 / 100)
    t.fillStyle = ink
    t.fill(glyphPath(type), 'nonzero')
  })

// ─── Sprite ids for the particle pool ───────────────────────────────────────

const spriteIds = new Map<string, number>()

/** The pool's id for a baked sprite (registered once), or -1 when it could not be baked. */
export const poolSprite = (key: string, make: () => HTMLCanvasElement | null): number => {
  const hit = spriteIds.get(key)
  if (hit !== undefined) return hit
  const spr = make()
  const id = spr ? registerSprite(spr) : -1
  spriteIds.set(key, id)
  return id
}

// ─── Blitting ───────────────────────────────────────────────────────────────

/** Draw a baked sprite centred at (x, y), `w`×`h`, optionally rotated, in the given blend. */
export const blit = (
  ctx: CanvasRenderingContext2D, spr: HTMLCanvasElement | null, x: number, y: number,
  w: number, h: number, alpha: number, additive = true, rot = 0
): boolean => {
  if (!spr || alpha <= 0.005) return false
  ctx.save()
  if (additive) ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = Math.min(1, alpha)
  if (rot !== 0) {
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.drawImage(spr, -w / 2, -h / 2, w, h)
  } else {
    ctx.drawImage(spr, x - w / 2, y - h / 2, w, h)
  }
  ctx.restore()
  return true
}

/** A glow at (x, y) of radius `r` — the sprite, or a live radial ramp where none could be baked. */
export const paintGlow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number, additive = true): void => {
  if (alpha <= 0.005 || r <= 0) return
  if (blit(ctx, glowSprite(color, r * 2), x, y, r * 2, r * 2, alpha, additive)) return
  ctx.save()
  if (additive) ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = Math.min(1, alpha)
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(color, 0.9))
  g.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

/** A ring of radius `r` — the sprite, or a live stroke. */
export const paintRing = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number, width = 0.16): void => {
  if (alpha <= 0.005 || r <= 0) return
  const d = r / 0.78 * 2
  if (blit(ctx, ringSprite(color, d, width), x, y, d, d, alpha, true)) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(1, r * width * 0.8)
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()
}

// ─── Quality ────────────────────────────────────────────────────────────────

/** Particle-count multiplier for the live tier (the renderer's own curve). */
export const qualityMul = (tier: QualityTier = qualityTier()): number =>
  tier === 'high' ? 1 : tier === 'medium' ? 0.6 : tier === 'low' ? 0.35 : 0.2

// ─── Spawners (into the pool; CSS-space in, world-space out) ────────────────

interface SpawnOpts {
  additive?: boolean
  shape?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  gravity?: number
  drag?: number
  alpha?: number
  vrot?: number
  rot?: number
  sprite?: number
  fade?: 0 | 1 | 2
  grow?: 0 | 1 | 2
}

/**
 * The ONE emit record every `spawn` fills and hands to the pool. `emit` copies
 * each field into its typed arrays and keeps nothing, so reusing it is safe —
 * and a burst of forty sparks used to be forty objects and forty colour arrays
 * for the collector, on every effect in the game.
 */
const EMIT: EmitOptions = {
  x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0, color: [255, 255, 255], additive: true, shape: 0,
  gravity: 0, drag: 0, alpha: 1, rot: 0, vrot: 0, sprite: -1, fade: 0, grow: 0
}
const NO_SPAWN_OPTS: SpawnOpts = {}

/** One particle, CSS coordinates (y down); the pool's y is flipped on the way in. Allocates nothing. */
export const spawn = (
  x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, o: SpawnOpts = NO_SPAWN_OPTS
): void => {
  EMIT.x = x
  EMIT.y = -y
  EMIT.vx = vx
  EMIT.vy = -vy
  EMIT.life = life
  EMIT.size = size
  // The cached tuple itself: the pool reads its three numbers and lets go.
  EMIT.color = hexRgb(color)
  EMIT.additive = o.additive ?? true
  EMIT.shape = o.shape ?? 0
  EMIT.gravity = o.gravity ?? 0
  EMIT.drag = o.drag ?? 0
  EMIT.alpha = o.alpha ?? 1
  EMIT.rot = o.rot ?? Math.random() * Math.PI * 2
  EMIT.vrot = o.vrot ?? 0
  EMIT.sprite = o.sprite ?? -1
  EMIT.fade = o.fade ?? 0
  EMIT.grow = o.grow ?? 0
  emitParticle(EMIT)
}

const count = (n: number, min = 2): number => Math.max(min, Math.round(n * qualityMul()))

/** Sparks fanning out of an impact, biased along `angle` (the blow's direction). */
export const spawnImpactSparks = (x: number, y: number, size: number, color: string, angle: number, n = 18): void => {
  const id = poolSprite(`core|${color}`, () => coreSprite(color, 48))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = angle + (Math.random() - 0.5) * 1.6
    const v = size * (2.2 + Math.random() * 3.6)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 220 + Math.random() * 260, size * (0.05 + Math.random() * 0.06), color,
      { shape: 2, gravity: size * 6, drag: 2.6 })
  }
  // A few bright pin-points that hang.
  const m = count(n * 0.3, 1)
  for (let i = 0; i < m; i++) {
    const a = Math.random() * Math.PI * 2
    spawn(x, y, Math.cos(a) * size * 0.8, Math.sin(a) * size * 0.8, 380 + Math.random() * 300, size * (0.12 + Math.random() * 0.1), color,
      { shape: 4, sprite: id, drag: 3, fade: 1 })
  }
}

/** Dust kicked off a tile — a soft, non-additive puff that settles. */
export const spawnTileDust = (x: number, y: number, size: number, n = 6, color = '#c9cfdc'): void => {
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2
    spawn(x + Math.cos(a) * size * 0.25, y + size * 0.2, Math.cos(a) * size * 0.9, -size * 0.3 * Math.random(),
      420 + Math.random() * 260, size * (0.16 + Math.random() * 0.14), color, { additive: false, shape: 3, alpha: 0.45, drag: 2.5, grow: 1 })
  }
}

/** Chips of stone off a hit (or a wall) — small, gravity-bound, non-additive. */
export const spawnChips = (x: number, y: number, size: number, stone: string, angle: number, n = 8): void => {
  const id = poolSprite(`chip|${stone}`, () => chipSprite(stone))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = angle + (Math.random() - 0.5) * 2.2
    const v = size * (1.5 + Math.random() * 2.5)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 1.5, 480 + Math.random() * 320, size * (0.07 + Math.random() * 0.07), stone,
      { additive: false, shape: id >= 0 ? 4 : 1, sprite: id, gravity: size * 9, drag: 0.8, vrot: (Math.random() - 0.5) * 16, fade: 2 })
  }
}

/** The arrow's ribbon: a streak particle left behind each frame it flies. */
export const spawnArrowTrail = (x: number, y: number, dirX: number, dirY: number, size: number, color: string): void => {
  spawn(x, y, -dirX * size * 0.5, -dirY * size * 0.5, 160, size * 0.06, color, { shape: 2, drag: 4 })
}

/** Crackle along a beam: a mote at a random point of it, drifting off. */
export const spawnBeamCrackle = (x0: number, y0: number, x1: number, y1: number, size: number, color: string, n = 2): void => {
  const id = poolSprite(`mote|${color}`, () => moteSprite(color))
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    const t = Math.random()
    const x = x0 + (x1 - x0) * t
    const y = y0 + (y1 - y0) * t
    spawn(x, y, (Math.random() - 0.5) * size * 1.4, (Math.random() - 0.5) * size * 1.4, 240 + Math.random() * 200, size * (0.08 + Math.random() * 0.08), color,
      { shape: 4, sprite: id, drag: 3, fade: 1 })
  }
}

/** The Lv 2 orb's burst at the beam's end: a ring of motes flung outward from each cell. */
export const spawnBurstMotes = (x: number, y: number, size: number, color: string, n = 14): void => {
  const id = poolSprite(`mote|${color}`, () => moteSprite(color))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + Math.random() * 0.3
    const v = size * (1.6 + Math.random() * 1.8)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 320 + Math.random() * 260, size * (0.1 + Math.random() * 0.1), color,
      { shape: 4, sprite: id, drag: 2.4, fade: 0 })
  }
}

/** Hex shards off a struck (or broken) shield. */
export const spawnShieldShards = (x: number, y: number, size: number, color: string, n = 10): void => {
  const id = poolSprite(`hex|${color}`, () => hexSprite(color, 48))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2
    const v = size * (1.2 + Math.random() * 2.4)
    spawn(x, y - size * 0.1, Math.cos(a) * v, Math.sin(a) * v - size * 1.2, 520 + Math.random() * 300, size * (0.12 + Math.random() * 0.1), color,
      { shape: 4, sprite: id, gravity: size * 7, drag: 0.9, vrot: (Math.random() - 0.5) * 10, fade: 2 })
  }
}

/** Heal motes rising in a loose spiral around the healed stone. */
export const spawnHealMotes = (x: number, y: number, size: number, color: string, n = 12): void => {
  const id = poolSprite(`mote|${color}`, () => moteSprite(color))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2
    const r = size * (0.2 + Math.random() * 0.25)
    spawn(x + Math.cos(a) * r, y + size * 0.3 + Math.sin(a) * r * 0.4, -Math.sin(a) * size * 0.35, -size * (0.9 + Math.random() * 0.7),
      700 + Math.random() * 400, size * (0.09 + Math.random() * 0.08), color, { shape: 4, sprite: id, drag: 0.6, fade: 1, grow: 2 })
  }
}

/** One glint rising off a buffed stone. */
export const spawnBuffGlint = (x: number, y: number, size: number, color: string): void => {
  const id = poolSprite(`glint|${color}`, () => glintSprite(color, 48))
  const k = count(3, 1)
  for (let i = 0; i < k; i++) {
    spawn(x + (Math.random() - 0.5) * size * 0.5, y - size * 0.1 + (Math.random() - 0.5) * size * 0.4, 0, -size * 0.5,
      500 + Math.random() * 300, size * (0.18 + Math.random() * 0.12), color, { shape: 4, sprite: id, vrot: 1.5, fade: 1, grow: 2 })
  }
}

/** The merge's golden fountain: sparks up and out, falling back as motes. */
export const spawnMergeFountain = (x: number, y: number, size: number, gold = '#ffd24a', n = 34): void => {
  const id = poolSprite(`mote|${gold}`, () => moteSprite(gold))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.3
    const v = size * (2.4 + Math.random() * 3.2)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 620 + Math.random() * 420, size * (0.07 + Math.random() * 0.08), gold,
      { shape: i % 3 === 0 ? 2 : 4, sprite: id, gravity: size * 8, drag: 0.7, fade: 2 })
  }
}

/**
 * A rune breaks: its own glyph in pieces, a shockwave, embers, dust.
 *
 * `scale` thins the burst without changing its shape. A nuke shatters up to
 * fifteen stones in one 280 ms window, and fifteen full bursts is both a
 * particle storm no phone should pay for and a screen nobody can read — the
 * nuke's own flash and ring are the event, the individual stones only need to
 * be seen going. Every other caller leaves it at 1 and is byte-identical.
 */
export const spawnShatter = (
  type: RuneType, x: number, y: number, size: number, stone: string, ink: string, ember: string, scale = 1
): void => {
  const s = Math.max(0, Math.min(1, scale))
  if (s <= 0) return
  // `pieces` stays 6 whatever the scale: it keys the baked shard sprites, and
  // a second value would bake a second set of them for no visual gain. Only
  // how MANY of the six are thrown is scaled.
  const pieces = 6
  const k = Math.max(2, Math.round(count(pieces * 2, pieces) * s))
  for (let i = 0; i < k; i++) {
    const sector = i % pieces
    const id = poolSprite(`gshard|${type}|${stone}|${ink}|${sector}`, () => glyphShardSprite(type, stone, ink, sector, pieces))
    const a = ((sector + 0.5) / pieces) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
    const v = size * (1.6 + Math.random() * 2.6)
    spawn(x + Math.cos(a) * size * 0.12, y + Math.sin(a) * size * 0.12, Math.cos(a) * v, Math.sin(a) * v - size * 2.2,
      560 + Math.random() * 380, size * (0.26 + Math.random() * 0.1), stone,
      { additive: false, shape: id >= 0 ? 4 : 1, sprite: id, gravity: size * 9, drag: 0.7, vrot: (Math.random() - 0.5) * 12, fade: 2 })
  }
  const eid = poolSprite(`core|${ember}`, () => coreSprite(ember, 48))
  const em = Math.max(2, Math.round(count(16) * s))
  for (let i = 0; i < em; i++) {
    const a = Math.random() * Math.PI * 2
    const v = size * (1 + Math.random() * 3)
    spawn(x, y, Math.cos(a) * v, Math.sin(a) * v - size * 0.8, 400 + Math.random() * 500, size * (0.06 + Math.random() * 0.08), ember,
      { shape: 4, sprite: eid, gravity: size * 3, drag: 1.4, fade: 1 })
  }
  spawnTileDust(x, y, size, Math.max(2, Math.round(6 * s)), '#9aa3b8')
}

/** Dust dragged behind a knocked-back stone. */
export const spawnKnockbackDust = (x: number, y: number, dirX: number, dirY: number, size: number, n = 8): void => {
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const s = Math.random()
    spawn(x - dirX * size * s * 0.8, y + size * 0.15 - dirY * size * s * 0.8, -dirX * size * 0.6 + (Math.random() - 0.5) * size * 0.4, -size * 0.2,
      360 + Math.random() * 240, size * (0.12 + Math.random() * 0.12), '#c9cfdc', { additive: false, shape: 3, alpha: 0.4, drag: 2, grow: 1 })
  }
}

/**
 * Grit thrown out from under the rolling boulder. Heavier and lower than
 * `spawnTileDust`: it leaves along the lane BEHIND the stone and settles fast,
 * so the trail reads as weight rather than smoke. Fired every few frames of
 * the roll, so the count is deliberately tiny.
 */
export const spawnRollDust = (x: number, y: number, dirX: number, dirY: number, size: number, n = 4): void => {
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    // Sideways spill is perpendicular to the heading; the rest goes backwards.
    const spill = (Math.random() - 0.5) * size * 1.1
    spawn(
      x - dirX * size * 0.22, y - dirY * size * 0.22 + size * 0.16,
      -dirX * size * (0.5 + Math.random()) - dirY * spill,
      -dirY * size * (0.5 + Math.random()) + dirX * spill - size * 0.35,
      380 + Math.random() * 280, size * (0.13 + Math.random() * 0.12), '#b9ab93',
      { additive: false, shape: 3, alpha: 0.5, drag: 2.2, grow: 1 }
    )
  }
}

/** The corner spark when a tile changes hands. */
export const spawnCaptureSparks = (x: number, y: number, size: number, color: string): void => {
  const id = poolSprite(`core|${color}`, () => coreSprite(color, 48))
  const k = count(10)
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2
    const r = size * 0.42
    spawn(x + Math.cos(a) * r, y + Math.sin(a) * r, Math.cos(a) * size * 0.9, Math.sin(a) * size * 0.9, 300 + Math.random() * 200, size * (0.08 + Math.random() * 0.06), color,
      { shape: 4, sprite: id, drag: 3, fade: 1 })
  }
}

/** Confetti and embers raining over a rectangle — the victory shower. */
export const spawnVictoryShower = (x: number, y: number, w: number, h: number, size: number, colors: readonly string[], n = 120): void => {
  const k = count(n)
  for (let i = 0; i < k; i++) {
    const color = colors[i % colors.length] ?? '#ffd24a'
    const conf = i % 2 === 0
    const id = conf ? poolSprite(`confetti|${color}`, () => confettiSprite(color)) : poolSprite(`core|${color}`, () => coreSprite(color, 48))
    spawn(x + Math.random() * w, y - h * 0.1 - Math.random() * h * 0.4, (Math.random() - 0.5) * size * 1.2, size * (0.6 + Math.random() * 1.2),
      1800 + Math.random() * 1600, size * (conf ? 0.12 + Math.random() * 0.1 : 0.07 + Math.random() * 0.06), color,
      { additive: !conf, shape: conf ? 5 : 4, sprite: id, gravity: -size * 1.4, drag: 0.9, vrot: (Math.random() - 0.5) * 9, fade: 2 })
  }
}

/** Ash drifting down over a rectangle — the defeat fall. */
export const spawnDefeatAsh = (x: number, y: number, w: number, h: number, size: number, n = 60): void => {
  const id = poolSprite('mote|#6b6f7a', () => moteSprite('#6b6f7a'))
  const k = count(n)
  for (let i = 0; i < k; i++) {
    spawn(x + Math.random() * w, y - Math.random() * h * 0.3, (Math.random() - 0.5) * size * 0.5, size * (0.25 + Math.random() * 0.4),
      2400 + Math.random() * 1800, size * (0.06 + Math.random() * 0.08), '#6b6f7a', { additive: false, shape: 4, sprite: id, alpha: 0.55, drag: 0.3, fade: 2, grow: 2 })
  }
}

/** Embers idling up from a burning (ember-skin) or scorched spot. */
export const spawnEmbers = (x: number, y: number, size: number, color: string, n = 4): void => {
  const id = poolSprite(`core|${color}`, () => coreSprite(color, 48))
  const k = count(n, 1)
  for (let i = 0; i < k; i++) {
    spawn(x + (Math.random() - 0.5) * size * 0.5, y + (Math.random() - 0.5) * size * 0.3, (Math.random() - 0.5) * size * 0.3, -size * (0.4 + Math.random() * 0.6),
      600 + Math.random() * 600, size * (0.05 + Math.random() * 0.05), color, { shape: 6, sprite: id, drag: 0.5, fade: 1 })
  }
}

// ─── Painters (per frame, `t` = 0..1 of the event) ──────────────────────────

/** The sword's arc sweeping over the target, plus its flash at the blow. */
export const paintSlash = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, o: { angle: number; color: string; lean?: boolean }): void => {
  const k = clamp01(t)
  if (k <= 0 || k >= 1) return
  const a = Math.sin(k * Math.PI)
  const sweep = 1.3
  const start = o.angle - 1.1 + k * sweep
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  // Three passes, widest first: a coloured halo (skipped when lean), the colour, a white core.
  ctx.strokeStyle = o.color
  if (!o.lean) {
    ctx.globalAlpha = a * 0.35
    ctx.lineWidth = size * 0.2
    ctx.beginPath(); ctx.arc(x, y, size * 0.44, start, start + 0.9); ctx.stroke()
  }
  ctx.globalAlpha = a * 0.9
  ctx.lineWidth = size * 0.09
  ctx.beginPath(); ctx.arc(x, y, size * 0.44, start, start + 0.9); ctx.stroke()
  ctx.globalAlpha = a
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.035
  ctx.beginPath(); ctx.arc(x, y, size * 0.44, start + 0.15, start + 0.85); ctx.stroke()
  ctx.restore()
  // The blow itself lands mid-sweep: a flash that pops and dies fast.
  const flash = clamp01(1 - Math.abs(k - 0.5) / 0.25)
  paintGlow(ctx, x, y, size * 0.45, o.color, flash * 0.9)
}

/** The arrow in flight: a bright head, a ribbon trailing behind it. */
export const paintArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, o: { angle: number; color: string; alpha?: number }): void => {
  const a = o.alpha ?? 1
  const len = size * 0.9
  const streak = streakSprite(o.color, 96)
  if (streak) {
    blit(ctx, streak, x - Math.cos(o.angle) * len * 0.45, y - Math.sin(o.angle) * len * 0.45, len, size * 0.22, a * 0.9, true, o.angle)
  } else {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = a * 0.8
    ctx.strokeStyle = o.color
    ctx.lineWidth = size * 0.05
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - Math.cos(o.angle) * len, y - Math.sin(o.angle) * len)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.restore()
  }
  const head = coreSprite(o.color, 48)
  if (!blit(ctx, head, x, y, size * 0.3, size * 0.3, a)) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = a
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(x, y, size * 0.06, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

/** Impact of an arrow: a flash and chips (the spawner half is `spawnChips`). */
export const paintArrowImpact = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color: string): void => {
  const k = clamp01(t)
  if (k >= 1) return
  paintGlow(ctx, x, y, size * (0.25 + k * 0.3), color, (1 - k) * 0.9)
  paintRing(ctx, x, y, size * (0.15 + easeOutCubic(k) * 0.35), color, (1 - k) * 0.8, 0.2)
}

/**
 * The orb's beam: a wide halo, a coloured body, a white core and two crackle
 * lines whose noise runs along it with `phase`. Drawn in a local space
 * rotated to the beam so the cross-section gradient is one cached object.
 */
export const paintBeam = (
  ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, size: number,
  o: { color: string; env: number; phase: number; seed?: number; lean?: boolean }
): void => {
  const env = clamp01(o.env)
  if (env <= 0) return
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy)
  if (len < 1) return
  const ang = Math.atan2(dy, dx)
  const w = size * 0.18 * (0.8 + 0.2 * env)
  ctx.save()
  ctx.translate(x0, y0)
  ctx.rotate(ang)
  ctx.globalCompositeOperation = 'lighter'
  // Halo: a cached cross-section gradient (in local y), stretched over the length.
  const halo = beamGradient(ctx, o.color, w * 2.4)
  ctx.globalAlpha = env * 0.7
  ctx.fillStyle = halo
  ctx.fillRect(0, -w * 2.4, len, w * 4.8)
  // Body.
  ctx.globalAlpha = env * 0.85
  ctx.lineCap = 'round'
  ctx.strokeStyle = o.color
  ctx.lineWidth = w
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke()
  // Core.
  ctx.globalAlpha = env
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = w * 0.32
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke()
  // Crackle: two polylines of running noise, thin and bright (none when lean).
  const seed = (o.seed ?? 0) | 0
  const segs = Math.max(4, Math.min(14, Math.round(len / (size * 0.16))))
  ctx.lineWidth = Math.max(0.8, w * 0.12)
  for (let line = 0; line < (o.lean ? 0 : 2); line++) {
    ctx.globalAlpha = env * (line === 0 ? 0.9 : 0.6)
    ctx.strokeStyle = line === 0 ? '#ffffff' : o.color
    ctx.beginPath()
    for (let i = 0; i <= segs; i++) {
      const u = i / segs
      const n = hash01(seed + line * 977 + i * 31 + Math.floor(o.phase * 12)) - 0.5
      const yy = n * w * 2.2 * Math.sin(u * Math.PI)
      if (i === 0) ctx.moveTo(0, 0); else ctx.lineTo(u * len, yy)
    }
    ctx.stroke()
  }
  ctx.restore()
  // Light at both ends.
  paintGlow(ctx, x0, y0, size * 0.3, o.color, env * 0.8)
  paintGlow(ctx, x1, y1, size * 0.42, o.color, env)
}

const beamRamps = new Map<string, CanvasGradient>()
/** The beam's cross-section ramp (local y from -h to +h), one per colour and width bucket. */
const beamGradient = (ctx: CanvasRenderingContext2D, color: string, h: number): CanvasGradient => {
  const key = `${color}|${Math.round(h)}`
  const hit = beamRamps.get(key)
  if (hit) return hit
  const g = ctx.createLinearGradient(0, -h, 0, h)
  g.addColorStop(0, rgba(color, 0))
  g.addColorStop(0.5, rgba(color, 0.55))
  g.addColorStop(1, rgba(color, 0))
  if (beamRamps.size > 64) beamRamps.clear()
  beamRamps.set(key, g)
  return g
}

/** The Lv 2 orb's cross: each cell flares and a ring runs out of it. */
export const paintCrossBurst = (
  ctx: CanvasRenderingContext2D, t: number, cells: readonly { x: number; y: number }[], size: number, color: string, n = cells.length
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = 1 - k
  for (let i = 0; i < n; i++) {
    const c = cells[i]!
    paintGlow(ctx, c.x, c.y, size * (0.2 + easeOutCubic(k) * 0.45), color, a * 0.85)
    paintRing(ctx, c.x, c.y, size * (0.12 + easeOutCubic(k) * 0.42), '#ffffff', a * 0.7, 0.14)
  }
}

/**
 * The axe's fan: ONE wide arc centred on the attacker, swung across the three
 * tiles ahead of it. Deliberately not three `paintSlash`es — the whole point of
 * the rune is that it is a single stroke, and three arcs read as three swings.
 * `reach` is the radius in tiles (1 = the rank in front).
 */
export const paintCleaveArc = (
  ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number,
  o: { angle: number; color: string; reach?: number; lean?: boolean }
): void => {
  const k = clamp01(t)
  if (k <= 0 || k >= 1) return
  const a = Math.sin(k * Math.PI)
  // Wide enough to cover the two diagonals as well as the tile dead ahead.
  const span = 1.9
  const r = size * (o.reach ?? 1)
  const head = o.angle - span / 2 + k * span
  const tail = Math.max(o.angle - span / 2, head - span * 0.45)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.strokeStyle = o.color
  if (!o.lean) {
    ctx.globalAlpha = a * 0.3
    ctx.lineWidth = size * 0.3
    ctx.beginPath(); ctx.arc(x, y, r, tail, head); ctx.stroke()
  }
  ctx.globalAlpha = a * 0.85
  ctx.lineWidth = size * 0.14
  ctx.beginPath(); ctx.arc(x, y, r, tail, head); ctx.stroke()
  ctx.globalAlpha = a
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.045
  ctx.beginPath(); ctx.arc(x, y, r, tail + 0.1, head); ctx.stroke()
  ctx.restore()
  // The edge itself, brightest at the leading end of the stroke.
  paintGlow(ctx, x + Math.cos(head) * r, y + Math.sin(head) * r, size * 0.3, o.color, a * 0.8)
}

/**
 * The boulder in its lane: a solid stone disc, NOT additive — this is the one
 * projectile in the game that is mass rather than light — with a rim lit in the
 * rune's colour and two cracks that turn with `spin` so the roll is visible.
 */
export const paintBoulder = (
  ctx: CanvasRenderingContext2D, x: number, y: number, size: number,
  o: { color: string; spin: number; alpha?: number }
): void => {
  const a = clamp01(o.alpha ?? 1)
  if (a <= 0) return
  const r = size * 0.3
  ctx.save()
  ctx.globalAlpha = a
  ctx.fillStyle = '#3a3630'
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = o.color
  ctx.lineWidth = size * 0.045
  ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, Math.PI * 2); ctx.stroke()
  ctx.lineWidth = size * 0.028
  for (let i = 0; i < 2; i++) {
    const ang = o.spin + i * 2.1
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(ang) * r * 0.15, y + Math.sin(ang) * r * 0.15)
    ctx.lineTo(x + Math.cos(ang) * r * 0.78, y + Math.sin(ang) * r * 0.78)
    ctx.stroke()
  }
  ctx.restore()
  paintGlow(ctx, x, y, r * 1.5, o.color, a * 0.35)
}

/**
 * The bombard's round, arcing from the tube to the middle of its footprint. The
 * lift is what says LOBBED: the round leaves the board's plane, so nothing it
 * passes over is implied to be in its way.
 */
export const paintShellArc = (
  ctx: CanvasRenderingContext2D, t: number, x0: number, y0: number, x1: number, y1: number, size: number,
  o: { color: string; lean?: boolean }
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const lift = size * 1.15
  const dots = o.lean ? 3 : 6
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = o.color
  for (let i = 1; i <= dots; i++) {
    const s = k - i * 0.06
    if (s <= 0) continue
    const px = x0 + (x1 - x0) * s
    const py = y0 + (y1 - y0) * s - Math.sin(s * Math.PI) * lift
    ctx.globalAlpha = (1 - i / (dots + 1)) * 0.5
    ctx.beginPath(); ctx.arc(px, py, size * 0.05, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
  const hx = x0 + (x1 - x0) * k
  const hy = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * lift
  if (!blit(ctx, coreSprite(o.color, 48), hx, hy, size * 0.34, size * 0.34, 1)) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = o.color
    ctx.beginPath(); ctx.arc(hx, hy, size * 0.08, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

/**
 * Where the shells land: a short flash and the dirt it throws up, on each tile
 * of the footprint. Shorter-lived and dirtier than `paintCrossBurst` on purpose
 * — the orb's cross is clean arcane light, this is a hole in the ground.
 */
export const paintShellBurst = (
  ctx: CanvasRenderingContext2D, t: number, cells: readonly { x: number; y: number }[], size: number, color: string, n = cells.length
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = 1 - k
  const e = easeOutCubic(k)
  for (let i = 0; i < n; i++) {
    const c = cells[i]!
    paintGlow(ctx, c.x, c.y, size * (0.16 + e * 0.28), color, a * 0.8)
    // The dirt: non-additive, so it darkens the tile instead of lighting it.
    ctx.save()
    ctx.globalAlpha = a * 0.4
    ctx.fillStyle = '#6b6154'
    ctx.beginPath(); ctx.arc(c.x, c.y, size * (0.12 + e * 0.32), 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}

/** The shield's dome, with a ripple where it was struck (`hit` = 0..1 of the ripple). */
export const paintShieldDome = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, o: { color: string; alpha: number; hit?: number }): void => {
  const a = clamp01(o.alpha)
  if (a <= 0) return
  const d = size * 1.16
  if (!blit(ctx, domeSprite(o.color, d), x, y - size * 0.1, d, d, a)) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = a * 0.6
    ctx.strokeStyle = o.color
    ctx.lineWidth = size * 0.05
    ctx.beginPath(); ctx.arc(x, y - size * 0.05, size * 0.5, Math.PI, 0); ctx.stroke()
    ctx.restore()
  }
  if (o.hit !== undefined && o.hit > 0 && o.hit < 1) {
    const k = easeOutCubic(clamp01(o.hit))
    paintRing(ctx, x, y - size * 0.1, size * (0.2 + k * 0.4), '#ffffff', (1 - k) * 0.9, 0.12)
  }
}

/** The heal: a soft cross-shaped flare over the stone and a ring rising off it. */
export const paintHealFlare = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color: string): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = Math.sin(k * Math.PI)
  const glint = glintSprite(color, 96)
  const s = size * (0.9 + k * 0.5)
  if (!blit(ctx, glint, x, y - size * 0.05, s, s, a * 0.9, true, k * 0.6)) {
    paintGlow(ctx, x, y, size * 0.4, color, a * 0.7)
  }
  paintRing(ctx, x, y + size * 0.05 - k * size * 0.3, size * (0.2 + k * 0.3), color, (1 - k) * 0.7, 0.18)
}

/** The buff: a glint turning over the stone's shoulder. */
export const paintBuffGlint = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color: string): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = Math.sin(k * Math.PI)
  const s = size * 0.5 * (0.6 + a * 0.5)
  if (!blit(ctx, glintSprite(color, 48), x + size * 0.28, y - size * 0.3, s, s, a, true, k * 2.2)) {
    paintGlow(ctx, x + size * 0.28, y - size * 0.3, size * 0.15, color, a)
  }
  paintRing(ctx, x, y, size * 0.44, color, a * 0.6, 0.1)
}

/** The merge: a gold ring spinning out (dashed, rotating) and a bloom at the centre. */
export const paintMergeRing = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, gold = '#ffd24a'): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = 1 - k
  const r = size * (0.3 + easeOutCubic(k) * 0.7)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = a
  ctx.translate(x, y)
  ctx.rotate(k * 2.4)
  ctx.strokeStyle = gold
  ctx.lineCap = 'round'
  ctx.lineWidth = size * 0.07 * (1 - k * 0.5)
  for (let i = 0; i < 8; i++) {
    const s0 = (i / 8) * Math.PI * 2
    ctx.beginPath(); ctx.arc(0, 0, r, s0, s0 + 0.5); ctx.stroke()
  }
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.03
  ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()
  paintGlow(ctx, x, y, size * 0.5, gold, a * 0.8)
  paintRing(ctx, x, y, r * 1.1, gold, a * 0.5, 0.12)
}

/** A shockwave ring leaving a point. */
export const paintShockwave = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color: string, reach = 1.1): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const e = easeOutCubic(k)
  paintRing(ctx, x, y, size * (0.15 + e * reach), color, (1 - k) * 0.9, 0.14 * (1 - k * 0.5) + 0.04)
  paintGlow(ctx, x, y, size * 0.5 * (1 - k), '#ffffff', (1 - k) * 0.5)
}

/**
 * The nuke's white-out, painted over the BOARD RECT and nothing else.
 *
 * Deliberately not a full-canvas flash: the HUD is DOM sitting above this
 * canvas, and a flash that covered the whole surface would strobe the coin
 * counter and the stage badge along with the board. It is also never pure
 * white — it peaks at `PEAK` alpha in the nuker's own acid colour over a white
 * core, so the tiles stay readable underneath on a light backdrop and the
 * player can see WHAT went off, not just that something did.
 *
 * `t` is 0..1 across the event. The curve is deliberately asymmetric: two
 * frames to full, the rest of the window to fade, which is what reads as a
 * detonation rather than a pulse.
 */
export const paintNukeFlash = (
  ctx: CanvasRenderingContext2D, t: number, x: number, y: number, w: number, h: number, color: string
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  /** Hard ceiling on the wash — above this the board stops being legible. */
  const PEAK = 0.55
  const RISE = 0.12
  const a = k < RISE ? (k / RISE) * PEAK : PEAK * (1 - easeInQuad((k - RISE) / (1 - RISE)))
  if (a <= 0.01) return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = a
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
  // A white core on top of the tint, fading twice as fast — the first frames
  // read as a flashbulb, the tail as the rune's own colour hanging in the air.
  ctx.globalAlpha = a * a * 0.9
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

/**
 * The blast front: a thick double ring crossing the whole board from the tile
 * the nuker landed on. `reach` is in TILES, so a 4×4 board wants ~5 to clear
 * its far corner. Bigger, slower and hotter than `paintShockwave`, which is a
 * one-tile event — this one is the only ring in the game that leaves the tile
 * it started on.
 */
export const paintNukeWave = (
  ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color: string, reach = 5
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const e = easeOutCubic(k)
  const fade = 1 - k
  // The front, and a second ring chasing it a beat behind for weight.
  paintRing(ctx, x, y, size * (0.2 + e * reach), color, fade * 0.95, 0.1 + 0.06 * fade)
  paintRing(ctx, x, y, size * (0.2 + easeOutCubic(clamp01(k - 0.12)) * reach), '#ffffff', fade * 0.5, 0.05 + 0.04 * fade)
  paintGlow(ctx, x, y, size * (0.9 - 0.6 * k), '#ffffff', fade * 0.7)
}

/** The clash: cracks and a white flash, then the ring. */
export const paintClashFlash = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color = '#ffffff'): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = 1 - easeInQuad(k)
  const s = size * (1.1 + k * 0.5)
  if (!blit(ctx, crackSprite(color, s), x, y, s, s, a, true, 0)) {
    paintGlow(ctx, x, y, size * 0.5, color, a)
  }
  paintGlow(ctx, x, y, size * 0.4 * (1 - k), '#ffffff', a)
  paintShockwave(ctx, k, x, y, size, color, 0.8)
}

/** The streak a knocked-back stone leaves between two points. */
export const paintKnockbackStreak = (ctx: CanvasRenderingContext2D, t: number, x0: number, y0: number, x1: number, y1: number, size: number, color: string): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const a = Math.sin(k * Math.PI)
  const px = x0 + (x1 - x0) * easeOutCubic(k)
  const py = y0 + (y1 - y0) * easeOutCubic(k)
  const ang = Math.atan2(y1 - y0, x1 - x0)
  const len = Math.hypot(x1 - x0, y1 - y0) * 0.6 * a
  const streak = streakSprite(color, 96)
  if (!blit(ctx, streak, px - Math.cos(ang) * len * 0.5, py - Math.sin(ang) * len * 0.5, len, size * 0.5, a * 0.7, true, ang)) {
    paintGlow(ctx, px, py, size * 0.3, color, a * 0.6)
  }
}

/**
 * A tile changing hands: a band of the new owner's colour sweeps across the
 * tile (clipped to it), the border flashes, and a glint runs the corner.
 */
export const paintCaptureWave = (
  ctx: CanvasRenderingContext2D, t: number, rect: { x: number; y: number; w: number; h: number }, size: number, color: string, lean = false
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const e = easeOutCubic(k)
  if (!lean) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.clip()
  ctx.globalCompositeOperation = 'lighter'
  // The band: a bright leading edge travelling from the bottom-left corner.
  const band = rect.w * 0.35
  const pos = -band + (rect.w + rect.h + band) * e
  ctx.translate(rect.x, rect.y)
  ctx.rotate(-Math.PI / 4)
  ctx.globalAlpha = (1 - k) * 0.85
  const g = captureGradient(ctx, color, band)
  ctx.fillStyle = g
  ctx.fillRect(pos - band, -rect.h * 2, band, rect.h * 4 + rect.w * 2)
  ctx.restore()
  }
  // The border.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 1 - k
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.05
  const inset = size * 0.06
  ctx.strokeRect(rect.x + inset, rect.y + inset, rect.w - inset * 2, rect.h - inset * 2)
  ctx.restore()
  // The corner glint.
  const gx = rect.x + rect.w * (0.15 + 0.7 * e)
  const gy = rect.y + rect.h * 0.15
  const s = size * 0.3 * (1 - k)
  blit(ctx, glintSprite(color, 48), gx, gy, s, s, 1 - k, true, e * 1.5)
}

const captureRamps = new Map<string, CanvasGradient>()
const captureGradient = (ctx: CanvasRenderingContext2D, color: string, band: number): CanvasGradient => {
  const key = `${color}|${Math.round(band)}`
  const hit = captureRamps.get(key)
  if (hit) return hit
  const g = ctx.createLinearGradient(0, 0, band, 0)
  g.addColorStop(0, rgba(color, 0))
  g.addColorStop(0.7, rgba(color, 0.5))
  g.addColorStop(1, 'rgba(255,255,255,0.9)')
  if (captureRamps.size > 64) captureRamps.clear()
  captureRamps.set(key, g)
  return g
}

/** Combo / crit text: pops with overshoot, outlined, no shadow. */
export const paintPopText = (
  ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number,
  o: { text: string; color: string; font?: string; outline?: string; rise?: number }
): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const pop = easeOutBack(Math.min(1, k / 0.35))
  const a = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(x, y - (o.rise ?? size * 0.5) * k)
  ctx.scale(pop, pop)
  ctx.font = o.font ?? `900 ${Math.round(size * 0.42)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = o.outline ?? 'rgba(0,0,0,0.85)'
  ctx.lineWidth = size * 0.09
  ctx.strokeText(o.text, 0, 0)
  ctx.fillStyle = o.color
  ctx.fillText(o.text, 0, 0)
  ctx.restore()
}

/** The aura: a hex of light on each guarded stone and a thread to the source. */
export const paintAuraLink = (
  ctx: CanvasRenderingContext2D, t: number, from: { x: number; y: number }, to: readonly { x: number; y: number }[],
  size: number, color: string, n = to.length
): void => {
  const k = clamp01(t)
  const a = Math.sin(k * Math.PI)
  if (a <= 0) return
  const hex = hexSprite(color, 96)
  const s = size * (0.9 + 0.1 * a)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = a * 0.5
  ctx.strokeStyle = color
  ctx.lineWidth = size * 0.03
  for (let i = 0; i < n; i++) { const p = to[i]!; ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(p.x, p.y); ctx.stroke() }
  ctx.restore()
  for (let i = 0; i < n; i++) {
    const p = to[i]!
    if (!blit(ctx, hex, p.x, p.y, s, s, a * 0.9, true, 0)) paintRing(ctx, p.x, p.y, size * 0.42, color, a * 0.8, 0.12)
  }
  paintGlow(ctx, from.x, from.y, size * 0.4, color, a * 0.6)
}

/** A landing thud: a flattened ring and a dust flash under a placed stone. */
// ─── The tile's aim compass ─────────────────────────────────────────────────
//
// One region of a hovered tile — a triangle for a cardinal rune, a corner
// quadrant for the orb, the whole tile for an omni one. The geometry is
// `rules.aimRegionPolygon`, so the shape drawn here and the shape the pointer
// is hit-tested against can never drift apart.
//
// `grow` is what makes the control readable: the polygons come back wound from
// the region's OWN OUTER EDGE inward, so at `grow` 0 the lit region is flat
// against the edge it points at and at 1 it has reached the tile's centre. The
// player sees the wedge travel in from the side they are aiming at.

/** At most four points; a compass region is a triangle or a quad. */
const regionScratch = new Float64Array(8)

/**
 * `aimRegionPolygon` builds its literal on every call, and this runs once per
 * region per frame while the pointer is over a tile. The shapes are constant,
 * so they are memoised here and the hot path allocates nothing.
 */
const polyCache = new Map<string, readonly (readonly [number, number])[]>()
const regionPoly = (type: RuneType, dir: Dir): readonly (readonly [number, number])[] => {
  const key = `${type}|${dir}`
  let hit = polyCache.get(key)
  if (!hit) {
    hit = aimRegionPolygon(type, dir)
    polyCache.set(key, hit)
  }
  return hit
}

/**
 * Lay a region's polygon into `rect`, grown by `g`. Returns the point count.
 *
 * Every shape scales about the TILE'S CENTRE, so at `g` 0 the region is a
 * speck under the stone and at 1 it has reached the edge it names. One rule
 * for all three shapes: a cardinal triangle has its apex at the centre and a
 * diagonal quadrant has one corner there, so scaling about that point grows
 * each of them out of the middle along its own axis.
 *
 * ── Why OUT and not in ──
 *
 * It used to grow the other way: the outer edge stayed put and the apex walked
 * in from it, so the wedge arrived from the side the player was aiming at.
 * That is backwards, and it was the single worst thing on the tile. A rune
 * throws its attack AWAY from itself, and a shape sweeping inward says the
 * opposite — it reads as something incoming, and on a board where the enemy
 * genuinely does shoot at you that is the one wrong answer. Growing outward is
 * the attack leaving the stone, which is what the facing means.
 */
const layoutAimRegion = (
  type: RuneType, dir: Dir, rect: { x: number; y: number; w: number; h: number }, g: number
): number => {
  const poly = regionPoly(type, dir)
  const n = poly.length < 8 ? poly.length : 8
  const k = clamp01(g)
  for (let i = 0; i < n; i++) {
    const pt = poly[i]!
    regionScratch[i * 2] = rect.x + (0.5 + (pt[0] - 0.5) * k) * rect.w
    regionScratch[i * 2 + 1] = rect.y + (0.5 + (pt[1] - 0.5) * k) * rect.h
  }
  return n
}

/**
 * The outward-pointing chevron over a region's outward feature, laid into
 * `chevScratch`: two arms ending on the region itself, and a peak pushed out
 * past the tile's edge.
 *
 * This replaces the flat white bar the lit region used to wear. The bar was
 * the loudest mark on the tile and it said nothing — a line is a line whether
 * the rune fires up or down, so the brightest thing the player looked at was
 * the one thing that carried no direction. A chevron is the same stroke, in
 * the same place, that can only be read one way round.
 *
 * WHICH part of the region faces out is `rules.aimRegionOuterEdge`, so the
 * chevron and the arrow the renderer leans toward the rim agree by
 * construction — on a diagonal quadrant they are not the same two points, and
 * neither of them is the polygon's first vertex.
 */
const chevScratch = new Float64Array(6)
const outerCache = new Map<string, ReturnType<typeof aimRegionOuterEdge>>()
const layoutAimChevron = (
  type: RuneType, dir: Dir, rect: { x: number; y: number; w: number; h: number },
  size: number, grow: number, depth: number
): void => {
  const key = `${type}|${dir}`
  let edge = outerCache.get(key)
  if (!edge) { edge = aimRegionOuterEdge(type, dir); outerCache.set(key, edge) }
  const ax = regionScratch[edge.a * 2]!
  const ay = regionScratch[edge.a * 2 + 1]!
  const bx = regionScratch[edge.b * 2]!
  const by = regionScratch[edge.b * 2 + 1]!
  // The peak grows out of the region's own outward point, scaled by the same
  // `grow` the polygon was laid with so the chevron travels with its wedge.
  const k = clamp01(grow)
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const px = cx + (edge.ax - 0.5) * rect.w * k
  const py = cy + (edge.ay - 0.5) * rect.h * k
  const ox = px - cx
  const oy = py - cy
  const n = Math.hypot(ox, oy) || 1
  chevScratch[0] = ax; chevScratch[1] = ay
  chevScratch[2] = px + (ox / n) * size * depth
  chevScratch[3] = py + (oy / n) * size * depth
  chevScratch[4] = bx; chevScratch[5] = by
}

/**
 * A dark wash over a hovered tile, under everything the compass draws on it.
 *
 * The compass is a green overlay on a painted slate board that is already
 * mid-value and already carries its own coloured edge glow, and green on that
 * is green on grey-blue-teal: the marks were technically present and
 * practically invisible, which is how a player ends up dropping a rune facing
 * a direction they never chose. One flat darkening buys every mark after it
 * about two stops of contrast for one fill, and costs nothing on a phone —
 * and because it is a WASH rather than a tint, the tile underneath still reads
 * as the same tile, just in shadow with a light on it.
 */
export const paintAimScrim = (
  ctx: CanvasRenderingContext2D, rect: { x: number; y: number; w: number; h: number }, alpha = 1
): void => {
  const a = clamp01(alpha)
  if (a <= 0) return
  ctx.save()
  ctx.fillStyle = rgba('#05070f', 0.52 * a)
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.restore()
}

/**
 * One region of the compass, in one of three weights.
 *
 *   `lit`  — the player has CHOSEN this facing: it fills with a gradient that
 *            is brightest at the edge it names and fades to nothing at the
 *            stone, grows outward from the middle, and wears an outward
 *            CHEVRON on that edge. Exactly one region per tile is ever lit.
 *   `held` — the facing the rune would take right now, without the player
 *            having picked it (the pointer is in the tile's centre dead zone,
 *            so this is a pre-aimed key or the default). A soft even fill and
 *            no chevron: the tile still says which way it points, but it does
 *            not claim the choice was made.
 *   plain  — an outline over a dark keyline. Present, so the player can see
 *            there IS a choice; quiet enough not to compete with the board.
 *
 * Every weight is drawn over a dark keyline of its own. A single-stroke
 * overlay is at the mercy of whatever tile it lands on — the offered wedges
 * used to vanish completely against a lit enemy tile — and a dark line under a
 * bright one is how every readable HUD in the business survives an arbitrary
 * background.
 *
 * `rim` widens the lit region's chevron. Under a FINGERTIP that edge is the
 * only cue that is not covered — it lies on the tile's border, and the contact
 * patch is in the middle — so the touch path draws it heavier and the caller
 * leans the arrows out to meet it.
 */
export const paintAimRegion = (
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; w: number; h: number },
  type: RuneType,
  dir: Dir,
  size: number,
  o: { color: string; lit?: boolean; held?: boolean; grow?: number; alpha?: number; rim?: number }
): void => {
  const lit = o.lit === true
  const held = !lit && o.held === true
  // A held facing is shown at full size: nothing is travelling toward it,
  // because nothing has been chosen yet.
  const n = layoutAimRegion(type, dir, rect, lit ? (o.grow ?? 1) : 1)
  if (n < 3) return
  const a = clamp01(o.alpha ?? 1)
  if (a <= 0) return
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(regionScratch[0]!, regionScratch[1]!)
  for (let i = 1; i < n; i++) ctx.lineTo(regionScratch[i * 2]!, regionScratch[i * 2 + 1]!)
  ctx.closePath()
  if (lit) {
    // ── The lit wedge is NOT outlined, and that is the fix ──
    //
    // A cardinal region is a triangle with its apex at the tile's centre, so
    // outlining it draws a hard, high-contrast arrowhead pointing at the
    // stone — i.e. one pointing the opposite way to the facing it is there to
    // announce. It was the loudest shape on the tile and it was backwards.
    //
    // So the chosen region is shown as LIGHT rather than as a shape: a
    // gradient that is nothing at the stone and full strength at the edge the
    // rune fires through, which has no apex to misread because it has faded
    // out long before it gets there. Every hard edge left on the tile — the
    // chevron below, the arrow the caller puts on top — points outward.
    const cx = rect.x + rect.w / 2
    const cy = rect.y + rect.h / 2
    const ex = (regionScratch[0]! + regionScratch[2]!) / 2
    const ey = (regionScratch[1]! + regionScratch[3]!) / 2
    const grad = ctx.createLinearGradient(cx, cy, ex, ey)
    grad.addColorStop(0, rgba(o.color, 0))
    grad.addColorStop(0.45, rgba(o.color, 0.16 * a))
    grad.addColorStop(1, rgba(o.color, 0.7 * a))
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = grad
    ctx.fill()
    // The outer edge — the side the rune will face — carries the weight, and
    // carries it as an arrow rather than as a bar. See `layoutAimChevron`.
    const rim = o.rim === undefined ? 1 : Math.max(0, o.rim)
    if (dir === 'omni') { ctx.restore(); return }
    layoutAimChevron(type, dir, rect, size, o.grow ?? 1, 0.1 + 0.04 * rim)
    ctx.beginPath()
    ctx.moveTo(chevScratch[0]!, chevScratch[1]!)
    ctx.lineTo(chevScratch[2]!, chevScratch[3]!)
    ctx.lineTo(chevScratch[4]!, chevScratch[5]!)
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = rgba('#000000', 0.7 * a)
    ctx.lineWidth = size * 0.085 * rim
    ctx.stroke()
    ctx.strokeStyle = rgba('#ffffff', Math.min(1, 0.92 * rim) * a)
    ctx.lineWidth = size * 0.05 * rim
    ctx.stroke()
  } else {
    // The offered regions ARE drawn as shapes: they are a menu, and a menu has
    // to show where its items begin and end. Each goes over a dark keyline, so
    // the mark owns its contrast instead of borrowing whatever the tile art is
    // doing underneath it.
    ctx.strokeStyle = rgba('#000000', 0.42 * a)
    ctx.lineWidth = size * 0.038
    ctx.stroke()
    if (held) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = rgba(o.color, 0.16 * a)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.strokeStyle = rgba(o.color, 0.7 * a)
    ctx.lineWidth = size * (held ? 0.028 : 0.022)
    ctx.stroke()
  }
  ctx.restore()
}

/**
 * A hovered tile the pebble cannot take: one flat wash and a cross, with no
 * regions at all. A refused tile must not look like a menu of choices.
 */
export const paintAimRefused = (
  ctx: CanvasRenderingContext2D, rect: { x: number; y: number; w: number; h: number }, size: number, color: string, alpha = 1
): void => {
  const a = clamp01(alpha)
  if (a <= 0) return
  const inset = size * 0.16
  ctx.save()
  ctx.globalAlpha = a
  ctx.fillStyle = rgba(color, 0.16)
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.strokeStyle = rgba(color, 0.9)
  ctx.lineWidth = size * 0.055
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(rect.x + inset, rect.y + inset)
  ctx.lineTo(rect.x + rect.w - inset, rect.y + rect.h - inset)
  ctx.moveTo(rect.x + rect.w - inset, rect.y + inset)
  ctx.lineTo(rect.x + inset, rect.y + rect.h - inset)
  ctx.stroke()
  ctx.restore()
}

export const paintLanding = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, size: number, color: string): void => {
  const k = clamp01(t)
  if (k >= 1) return
  const e = easeOutCubic(k)
  ctx.save()
  ctx.translate(x, y + size * 0.28)
  ctx.scale(1, 0.42)
  ctx.translate(-x, -(y + size * 0.28))
  paintRing(ctx, x, y + size * 0.28, size * (0.15 + e * 0.55), color, (1 - k) * 0.8, 0.14)
  ctx.restore()
}
