/**
 * ─── The rune modules' toolbox ──────────────────────────────────────────────
 *
 * Everything a `runeFx/<rune>.ts` may build with, in one import, so a module
 * never reaches into the renderer and two modules never import each other.
 *
 * Three layers, cheapest first:
 *
 *   1. BAKED SPRITES — `bakeSprite(key, px, draw)` caches any drawing by key
 *      (key it by colour and a size BUCKET, never a continuous value — the
 *      cache holds 480 and evicts its oldest quarter when full). `glowSprite`, `ringSprite`, `streakSprite`,
 *      `coreSprite`, `moteSprite`, `hexSprite`, `glintSprite`, `chipSprite`,
 *      `glyphShardSprite` are the stock ones. `blit` draws any of them.
 *   2. PARTICLES — `spawn(x, y, vx, vy, lifeMs, size, color, opts)` into the
 *      shared pool (CSS px in, y down; it flips). `poolSprite(key, make)`
 *      registers a baked sprite as a particle shape (shape 4 = rotated sprite,
 *      5 = tumbling card, 6 = twinkling). Built-in shapes: 0 soft dot, 1 shard,
 *      2 velocity-aligned spark streak, 3 smoke puff. `count(n)` scales a
 *      count by the live tier — use it for EVERY burst.
 *   3. PAINTERS — the per-frame light: `paintGlow`, `paintRing`, and every
 *      stock effect in `arenaFx` (`paintSlash`, `paintBeam`, …) a module can
 *      compose, re-colour or replace.
 *
 * Velocities are px per SECOND, gravity px/s², drag a 1/s coefficient; `life`
 * is ms.
 */

import { qualityMul, spawn as spawnParticle } from '@/use/arenaFx'
import type { Dir, RuneType } from '@/game/rules'
import { DIR_VEC, RUNES } from '@/game/rules'
import type { FxApi, Shot } from './types'

export {
  // colour
  hexRgb, rgba, mix, hash01,
  // sprites
  bakeSprite, bucketFor, blit, glowSprite, coreSprite, ringSprite, streakSprite, moteSprite, domeSprite, crackSprite,
  glintSprite, hexSprite, chipSprite, confettiSprite, glyphShardSprite, poolSprite,
  // light
  paintGlow, paintRing,
  // particles
  spawn, qualityMul,
  // stock spawners
  spawnImpactSparks, spawnTileDust, spawnChips, spawnArrowTrail, spawnBeamCrackle, spawnBurstMotes, spawnShieldShards,
  spawnHealMotes, spawnBuffGlint, spawnMergeFountain, spawnKnockbackDust, spawnRollDust, spawnCaptureSparks, spawnEmbers,
  // stock painters
  paintSlash, paintArrow, paintArrowImpact, paintBeam, paintCrossBurst, paintCleaveArc, paintBoulder, paintShellArc,
  paintShellBurst, paintShieldDome, paintHealFlare, paintBuffGlint, paintShockwave, paintNukeFlash, paintNukeWave,
  paintKnockbackStreak, paintAuraLink
} from '@/use/arenaFx'

export { RUNES }

// ─── Counts ─────────────────────────────────────────────────────────────────

/** `n` scaled by the live tier, never below `min`. Use it for every burst. */
export const count = (n: number, min = 1): number => Math.max(min, Math.round(n * qualityMul()))

// ─── Easing and maths (allocation-free) ─────────────────────────────────────

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
/** `t` remapped from [a, b] to [0, 1], clamped. */
export const span = (t: number, a: number, b: number): number => clamp01((t - a) / Math.max(1e-6, b - a))
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
export const easeInCubic = (t: number): number => t * t * t
export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t)
export const easeInQuad = (t: number): number => t * t
export const easeOutBack = (t: number): number => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
export const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
/** 0 → 1 → 0 over [0, 1]: a sine bump, for a flash that swells and dies. */
export const bump = (t: number): number => (t <= 0 || t >= 1 ? 0 : Math.sin(t * Math.PI))

/** The facing's angle, radians, y down (`omni` has none and reads as up). */
export const dirAngle = (dir: Dir): number => {
  if (dir === 'omni') return -Math.PI / 2
  const [dx, dy] = DIR_VEC[dir]
  return Math.atan2(dy, dx)
}

/** A rune's neon, straight from the rules — the colour its glyph is lit in. */
export const runeColor = (t: RuneType): string => RUNES[t].color

// ─── The stock bursts (the renderer's old per-hit defaults) ─────────────────


/**
 * `n` velocity-aligned streak sparks thrown in every direction from (x, y):
 * the renderer's original generic burst. `speed` px/s, `life` ms, `psize` px.
 */
export const sparkBurst = (
  x: number, y: number, n: number, color: string, speed: number, life: number, psize: number, gravity = 0
): void => {
  const k = Math.max(2, Math.round(n * qualityMul()))
  for (let i = 0; i < k; i++) {
    const a = Math.random() * Math.PI * 2
    const v = speed * (0.4 + Math.random() * 0.8)
    spawnParticle(x, y, Math.cos(a) * v, Math.sin(a) * v, life * (0.6 + Math.random() * 0.6), psize * (0.6 + Math.random() * 0.8), color,
      { additive: true, shape: 2, gravity, drag: 2.2, rot: Math.random() * Math.PI })
  }
}

/** The stock burst for one landed hit of `amount` damage, in the attacker's colour. */
export const hitBurst = (x: number, y: number, amount: number, color: string, size: number): void => {
  sparkBurst(x, y, amount >= 4 ? 16 : 9, color, size * 2.2, 380, size * 0.06)
}

// ─── Shot geometry ──────────────────────────────────────────────────────────

/** Where a shot starts, where it ends and the angle between — one per module, reused. */
export interface ShotLine { x: number; y: number; tx: number; ty: number; ang: number }

export const newShotLine = (): ShotLine => ({ x: 0, y: 0, tx: 0, ty: 0, ang: 0 })

/**
 * Fill `out` for `e`: (x, y) the attacker's tile, (tx, ty) the LAST cell of the
 * path (where a projectile stops, a blade lands, a boulder rests), and the
 * angle between. A shot with an empty path points along the attacker's facing.
 */
export const shotLine = (e: Shot, api: FxApi, out: ShotLine): ShotLine => {
  out.x = api.cx(e.from.col, e.from.row)
  out.y = api.cy(e.from.col, e.from.row)
  const last = e.path[e.path.length - 1]
  if (last) {
    out.tx = api.cx(last.col, last.row)
    out.ty = api.cy(last.col, last.row)
    out.ang = Math.atan2(out.ty - out.y, out.tx - out.x)
  } else {
    out.tx = out.x
    out.ty = out.y
    out.ang = dirAngle(e.from.dir)
  }
  return out
}
