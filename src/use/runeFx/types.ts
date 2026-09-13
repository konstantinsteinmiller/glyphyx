import type { FxSound } from '@/game/cues'
import type { ArtKind } from '@/game/art'
import type { Faction, Hit, ResolveEvent, RuneSnapshot, RuneType, Side, Weapon } from '@/game/rules'

/**
 * ─── Per-rune effects: the contract ─────────────────────────────────────────
 *
 * Every rune owns its own LOOK and its own SOUND, in its own file
 * (`runeFx/<rune>.ts` for the pixels, `runeSfx/<rune>.ts` for the voices). The
 * renderer (`useArenaArt`) keeps everything that is a FACT about the match —
 * hit points, damage numbers, the stone the crown turned, the tile a knockback
 * lands on, the crack a nuke's front leaves — and hands each rune's event to
 * that rune's module for the rest: the swing, the flight, the flash, the
 * particles, the shake, the cue.
 *
 * WHICH module gets an event (`ownerOf`):
 *
 *   shot        → the attacker's own type (`blade` is always a sword, …)
 *   explode     → mage     (the orb's Lv 2 cross)
 *   knockback   → melee    (the sword's Lv 2 shove)
 *   aura        → defense  (the Lv 2 shield raising its dome over neighbours)
 *   heal / buff → support
 *   nuke        → nuker
 *   crown       → crown
 *
 * …and two DEFENSE moments go to the defense module whatever struck:
 * `absorb` (damage eaten by a shield or by mitigation) and `intercept*` (an
 * arrow, a beam or a blade that stopped on a shield stone). The attacker's
 * own `impact` still fires on an intercepted shot, so it can play its own
 * part — `intercepted(e)` says whether it should shower chips or leave the
 * wall to the shield.
 *
 * THE RULES every module keeps (see `src/use/arenaFx.ts` for why):
 *
 *   · No `shadowBlur`, no `filter`, ever. Light is baked sprites (`paintGlow`,
 *     `paintRing`, `bakeSprite`) blitted — usually additive.
 *   · The per-frame path allocates nothing: no closures, arrays or gradient
 *     objects built per frame unless cached; colours through `rgba()`.
 *   · Particle counts go through the tier: `count(n)` (see `kit.ts`) already
 *     multiplies by `api.mul`; `api.tier` gates whole passes (2 everything,
 *     1 no per-frame trails / halos, 0 baked sprites only).
 *   · Total: with no 2D context (tests) every bake is `null` and a painter
 *     falls back to plain strokes or nothing — never a throw.
 *   · Coordinates are CSS pixels, y DOWN; `size` is one tile. The particle
 *     pool is y UP and `kit.spawn` flips for you.
 */

export type Shot = Extract<ResolveEvent, { kind: 'shot' }>
export type Aura = Extract<ResolveEvent, { kind: 'aura' }>
export type Heal = Extract<ResolveEvent, { kind: 'heal' }>
export type Buff = Extract<ResolveEvent, { kind: 'buff' }>
export type Explode = Extract<ResolveEvent, { kind: 'explode' }>
export type Nuke = Extract<ResolveEvent, { kind: 'nuke' }>
export type Crown = Extract<ResolveEvent, { kind: 'crown' }>
export type Knockback = Extract<ResolveEvent, { kind: 'knockback' }>

/** Every event a rune module can be handed. */
export type RuneEvent = Shot | Aura | Heal | Buff | Explode | Nuke | Crown | Knockback

/** The rune whose module draws `e`, or `null` for a board event (place, merge, clash, shatter, capture, combo). */
export const ownerOf = (e: ResolveEvent): RuneType | null => {
  switch (e.kind) {
    case 'shot': return e.from.type
    case 'explode': return 'mage'
    case 'knockback': return 'melee'
    case 'aura': return 'defense'
    case 'heal': case 'buff': return 'support'
    case 'nuke': return 'nuker'
    case 'crown': return 'crown'
    default: return null
  }
}

/** Is `e` one of the rune events a module draws? */
export const isRuneEvent = (e: ResolveEvent): e is RuneEvent => ownerOf(e) !== null

/**
 * Only a PROJECTILE can be stopped by a shield standing in its way. A shield
 * inside a cleave's fan, a boulder's lane or a shell's footprint is a target
 * like any other.
 */
export const interceptable = (w: Weapon): boolean => w === 'arrow' || w === 'beam' || w === 'blade'

/** A shot that ended on a shield stone: the defense module draws the wall. */
export const intercepted = (e: Shot): boolean => {
  if (!interceptable(e.weapon)) return false
  for (let i = 0; i < e.hits.length; i++) if (e.hits[i]!.target.type === 'defense') return true
  return false
}

/** The colours a rune paints itself in. `core` is its `RUNES[type].color`. */
export interface RunePalette {
  /** The rune's neon — the colour a player learns it by. */
  core: string
  /** A lighter, hotter version for cores and flashes. */
  hot: string
  /** A darker, deeper version for smoke, trails and shadows. */
  deep: string
  /** A second hue, used sparingly, so an effect is not one flat colour. */
  accent: string
}

/** Where on the board a cue sits, and how big the rune behind it is. */
export interface SoundAt {
  /** CSS x of the sound's source; the renderer turns it into a stereo pan. */
  x?: number
  /** The rune's level (1…8): heavier runes may play heavier. */
  level?: number
  side?: Side
}

/**
 * What the renderer lends a module for one call. ONE object, reused for the
 * whole session — the renderer rewrites its fields every frame — so a module
 * must never keep a reference to it past the call.
 */
export interface FxApi {
  /** The arena canvas, already in CSS pixels. Save/restore around any state you change. */
  readonly ctx: CanvasRenderingContext2D
  /** One tile, CSS px. */
  readonly size: number
  /** 2 = full, 1 = low (skip per-frame trails, crackle, halos), 0 = min (baked sprites only). */
  readonly tier: 0 | 1 | 2
  /** The live particle multiplier (1, 0.6, 0.35, 0.2) — `kit.count()` applies it for you. */
  readonly mul: number
  /** True on frames a per-frame spawner may emit on (a ~24 ms throttle): trails, crackle. */
  readonly canEmit: boolean
  /** The renderer's clock, ms. */
  readonly now: number
  /** The board's rect, CSS px — for board-wide washes. */
  readonly board: Readonly<{ x: number; y: number; w: number; h: number }>
  /** Reusable scratch points (≥ 24) for painters that take a list of cells. */
  readonly scratch: { x: number; y: number }[]
  /** A tile's centre, CSS px. */
  cx(col: number, row: number): number
  cy(col: number, row: number): number
  /**
   * Pose a rune's pebble for THIS frame: an offset (a lunge, a recoil) and a
   * scale. The renderer resets every pose when a timeline starts; a module
   * that poses a stone should pose it back to (0, 0, 1, 1) at the end.
   */
  pose(id: number, ox: number, oy: number, sx?: number, sy?: number): void
  /** A white flash over a rune's pebble, 0…1; it decays on its own. */
  flash(id: number, k: number): void
  shake(kind: 'small' | 'strong' | 'big'): void
  /** Play one of the rune's cues, placed where it happens on the board. */
  sound(id: FxSound, power: number, at?: SoundAt): void
  /** The side's own colour (the player's blue, a faction's tint). */
  sideColor(side: Side, faction: Faction | null): string
  /** The stone a rune's chips are cut from, and the ink its glyph was carved in. */
  stoneOf(r: RuneSnapshot): string
  inkOf(r: RuneSnapshot): string
  /** A painted drop-in, when the art layer has one (the painted bolt), else `null`. */
  art(kind: ArtKind, id: string): HTMLImageElement | null
}

/**
 * One rune's effects. Every hook is optional; a missing hook draws nothing,
 * so the renderer never needs to know what a rune can do.
 *
 * `p` is the event's progress, `(elapsed − e.at) / e.dur`, UNCLAMPED: it runs
 * from 0 past 1 while the event's tail plays (`tailMs`), so a trail can fade
 * after the blow instead of freezing on its last frame.
 */
export interface RuneFx {
  readonly type: RuneType
  readonly palette: RunePalette
  /** Once, as the event begins. */
  start?(e: RuneEvent, api: FxApi): void
  /** Every frame from `e.at` until the tail ends. */
  paint?(e: RuneEvent, p: number, api: FxApi): void
  /** Once, when `p` reaches `impactAt(e)` — the renderer has just applied the damage. */
  impact?(e: RuneEvent, api: FxApi): void
  /** Where in the window the blow lands (0…1). `undefined` keeps the renderer's default. */
  impactAt?(e: RuneEvent): number | undefined
  /** How long past `at + dur` the event keeps painting, ms. `undefined` keeps the default. */
  tailMs?(e: RuneEvent): number | undefined

  // ── Defense moments, routed to the DEFENSE module whatever struck ──

  /** Damage eaten by a shield or by mitigation on the rune standing at (x, y). */
  absorb?(hit: Hit, x: number, y: number, api: FxApi): void
  /** A projectile stopped on a shield at (x, y): once, at the moment it stops. */
  interceptImpact?(e: Shot, x: number, y: number, api: FxApi): void
  /** …and every frame after, `k` = 0…1 across the rest of the window. */
  interceptPaint?(e: Shot, k: number, x: number, y: number, api: FxApi): void
}
