import { watch } from 'vue'
import {
  archerRange, bombardCells, cleaveCells, CONQUEST_TILES, DEFENSE_MITIGATION, DIR_VEC, FACTION_DEFS, GRID, HAND_SIZE,
  LOCK_CHEVRON_HIT_TILES, RUNE_TYPES,
  LOCK_CHEVRON_TILES, MAGE_REACH, MAX_LEVEL, RESET_MS, REVEAL_MS, rollerLane, RUNES, SKINS, STARTING_SKIN,
  aimRegionOuterEdge, aimRegionPolygon, aimRegionShape, aimRegions, cellIndex, defaultDir, dirsFor, inBounds,
  type BoardState, type Cell, type Dir, type Faction, type Hit, type Move, type Owner,
  type ResolveEvent, type Rune, type RuneSnapshot, type RuneType, type SkinId, type Side, type Weapon
} from '@/game/rules'
import type { FxSound } from '@/game/cues'
import type { ArenaLayout, ArenaView, CanvasLabels, DragState, HitTarget, HoverState, Rect } from '@/game/view'
import { drawGlyph, glyphSpin } from '@/game/glyphs'
import { placementKind, runeAt } from '@/game/board'
import {
  ENEMY_STONE, GRID_GLOW, RIDGE_SKYLINE, damageStage, enemyStone, laurelFit, paintBoardFrame, paintDamage, paintLaurel,
  paintPebble, paintPebbleOrnaments, paintRerollChip, paintRidge, paintSky, paintTile, resolveGlow, type DamageStage
} from '@/use/arenaPainters'
import { onArtChanged, spriteFor, type ArtKind } from '@/game/art'
import { CLEAN_FEED } from '@/game/cleanFeed'
import {
  blit, bucketFor, glowSprite, paintAimRefused, paintAimRegion, paintAimScrim, paintBeam, paintCaptureWave, paintClashFlash,
  paintComet, paintGlow, paintLanding, paintMergeRing, paintRing, paintShockwave, spawnCaptureSparks, spawnChips,
  spawnCometEmbers, spawnDefeatAsh, spawnImpactSparks, spawnMergeFountain, spawnShatter, spawnTileDust, spawnVictoryShower
} from '@/use/arenaFx'
import { rand, seedFrom } from '@/game/rng'
import {
  drawParticles, emit as emitParticle, emitDecal, emitText, getDecals, getTexts,
  qualityTier, renderScaleTier, resetVfx, sampleFrame, stepDecals, stepParticles, stepTexts
} from '@/use/useVfx'
import { clearRamps } from '@/use/useGradientRamps'
import { measureLabel } from '@/use/useTextMetrics'
import { useScreenshake } from '@/use/useScreenshake'
import { playFx } from '@/use/useGameAudio'
import { RUNE_FX, intercepted, ownerOf, type FxApi, type RuneEvent, type SoundAt } from '@/use/runeFx'
import { nukeFrontAt } from '@/use/runeFx/nuker'

/**
 * ─── The arena renderer ─────────────────────────────────────────────────────
 *
 * One canvas, everything the player looks at during a match: the backdrop, the
 * stone board, the pebbles, the hand, the timer, the counters, the reveal
 * arrows, every resolution effect, the particles, the ghost hand of the
 * tutorial and the banners. The DOM owns the HUD around it.
 *
 * It CONSUMES `ArenaView` (see `view.ts`) and never mutates it. The battle
 * composable owns the match; this module owns pixels.
 *
 * ── Performance ──
 *
 * Everything that can be baked is baked: the backdrop, the board plate, one
 * sprite per (type, level, tint, size) pebble, the glyph glows, the arrows,
 * the tile tints, the flames, the finger. A frame is then a few dozen
 * `drawImage` calls, a handful of arcs and the particle pool. Nothing in the
 * per-frame path allocates: colour strings and fonts are cached, the visual
 * rune table is reused, events are walked by index with a stage byte each.
 *
 * ── Coordinates ──
 *
 * CSS pixels, y down. The particle pool is fed with y flipped (world y = -css
 * y) and projected back, so gravity is a positive number and spark streaks
 * point along their velocity — see `useVfx`.
 */

// ─── Small maths ────────────────────────────────────────────────────────────

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
/** How far the nuke's front travels, in TILES — enough to clear a 4x4's far corner. */
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3)
const easeOutQuad = (t: number): number => { const c = clamp01(t); return 1 - (1 - c) * (1 - c) }
const easeInOutQuad = (t: number): number => {
  const c = clamp01(t)
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2
}
const easeOutBack = (t: number): number => {
  const c = clamp01(t)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2)
}

// ─── Colours ────────────────────────────────────────────────────────────────

const PLAYER_COLOR = '#4aa8ff'
const PLAYER_ARROW = '#7fd0ff'
/** A facing with nothing of the enemy's in it — see `drawStandingLines`. */
const NO_TARGET = '#8c93a6'
const ENEMY_ARROW = '#ff5a5a'
/** Enemy GROUND — one colour for every faction, so side reads before identity. */
const ENEMY_TERRITORY = '#e03a4e'
const NEUTRAL_COLOR = '#7b8397'
const GOLD = '#ffd75e'
const GOLD_DARK = '#b8860b'
const VALID_EMPTY = '#35e07a'
/**
 * ─── The aim compass's own colour ───────────────────────────────────────────
 *
 * The compass used to be drawn in the RUNE's colour, which is the colour of
 * the stone being carried over it — so the menu and the thing covering the
 * menu were the same hue, and the facing was hard to read at the one moment it
 * had to be. It is green now, because green is already this game's word for
 * "this placement is legal" (`VALID_EMPTY`): the tile ring that says a stone
 * may go here and the wedge that says which way it will point are one idea.
 *
 * Deliberately NOT the cyan the reach cone uses — green answers "which way",
 * cyan answers "what it hits", and a player should be able to tell those two
 * readings apart at a glance.
 */
const AIM_OFFER = '#1f9c57'
const AIM_CHOSEN = '#5cffa6'
const VALID_STACK = '#ffd23f'
const INVALID = '#ff3b4a'
const HEAL_COLOR = '#5cff9a'
const BUFF_COLOR = '#ffb347'
const SHIELD_COLOR = '#7fd8ff'
/** The victory shower's palette. */
const RESULT_COLORS: readonly string[] = ['#ffd75e', '#7fd0ff', '#ffffff', '#ff8ad8']

const rgbCache = new Map<string, readonly [number, number, number]>()
const hexRgb = (hex: string): readonly [number, number, number] => {
  let v = rgbCache.get(hex)
  if (!v) {
    const h = hex.replace('#', '')
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    rgbCache.set(hex, v)
  }
  return v
}

/** `rgba()` for a hex + alpha, cached so the frame loop allocates no strings. */
const rgbaCache = new Map<string, Map<number, string>>()
const rgba = (hex: string, alpha: number): string => {
  let inner = rgbaCache.get(hex)
  if (!inner) { inner = new Map(); rgbaCache.set(hex, inner) }
  const key = Math.round(clamp01(alpha) * 100)
  let s = inner.get(key)
  if (!s) {
    const [r, g, b] = hexRgb(hex)
    s = `rgba(${r},${g},${b},${key / 100})`
    inner.set(key, s)
  }
  return s
}

const fontCache = new Map<number, string>()
const font = (px: number): string => {
  const k = Math.max(6, Math.round(px))
  let f = fontCache.get(k)
  if (!f) { f = `900 ${k}px Angry, sans-serif`; fontCache.set(k, f) }
  return f
}

const dirAngle = (dir: Dir): number => {
  const [dx, dy] = DIR_VEC[dir]
  return Math.atan2(dy, dx)
}

// ─── Per-weapon timing ──────────────────────────────────────────────────────
//
// The look and the sound of every attack live in its rune's module
// (`runeFx/<rune>.ts`, `runeSfx/<rune>.ts`); a module may also move its impact
// moment (`impactAt`). These are the defaults — a TABLE, so a new member of
// the `Weapon` union is a compile error here rather than silently a sword.

/** Where inside the event's window its damage lands. */
const WEAPON_IMPACT: Record<Weapon, number> = {
  blade: 0.45, arrow: 0.6, beam: 0.42, cleave: 0.48, roll: 0.62, shell: 0.66
}

const sideColor = (side: Side, faction: Faction | null): string =>
  side === 'player' ? PLAYER_COLOR : FACTION_DEFS[faction ?? 'orc'].color

const ownerColor = (owner: Owner, faction: Faction | null): string =>
  owner === 'player' ? PLAYER_COLOR : owner === 'enemy' ? FACTION_DEFS[faction ?? 'orc'].color : NEUTRAL_COLOR

// ─── Geometry ───────────────────────────────────────────────────────────────

export interface Insets {
  top: number
  bottom: number
  left: number
  right: number
}

export interface ArenaGeometry extends ArenaLayout {
  cssW: number
  cssH: number
  orientation: 'portrait' | 'landscape'
  /** The stone frame around the board. */
  frame: Rect
  counters: { you: Rect; foe: Rect }
}

const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h })

/** How much of the canvas's short side the board's FRAME takes in a clean feed. */
export const CLEAN_BOARD_SHARE = { portrait: 0.88, landscape: 0.82 } as const

/**
 * The clean-feed layout (`CLEAN_FEED`): the board alone, centred in the whole
 * canvas. Nothing but the arena is drawn, so nothing else gets room — the HUD
 * insets are ignored, and the hand, reroll chip, timer and counters are parked
 * past the bottom edge. The hand slots sit just below it rather than far away,
 * so a scripted placement's pebble still lifts from somewhere sensible and
 * flies up into frame; none of the four is ever on screen.
 */
const cleanArenaLayout = (cssW: number, cssH: number): ArenaGeometry => {
  const landscape = cssW > cssH
  const F = 0.035 // the frame margin, as in computeArenaLayout
  const share = landscape ? CLEAN_BOARD_SHARE.landscape : CLEAN_BOARD_SHARE.portrait
  const s = Math.max(80, (Math.min(cssW, cssH) * share) / (1 + 2 * F))
  const f = s * F
  const x0 = (cssW - s) / 2
  const y0 = (cssH - s) / 2
  const tile = s / GRID
  const slot = Math.max(44, s * 0.2)
  const slotGap = s * 0.04
  const hx0 = cssW / 2 - (HAND_SIZE * slot + (HAND_SIZE - 1) * slotGap) / 2
  const hand: Rect[] = []
  for (let i = 0; i < HAND_SIZE; i++) hand.push(rect(hx0 + i * (slot + slotGap), cssH + slot * 0.5, slot, slot))
  const parked = rect(cssW / 2, cssH + s, 1, 1)
  return {
    cssW, cssH, orientation: landscape ? 'landscape' : 'portrait',
    board: rect(x0, y0, s, s), tile, frame: rect(x0 - f, y0 - f, s + 2 * f, s + 2 * f),
    tileRect: (col, row) => rect(x0 + col * tile, y0 + row * tile, tile, tile),
    hand, reroll: parked, timer: parked, counters: { you: parked, foe: parked }, swipeThreshold: tile * 0.3
  }
}

/**
 * Fit the arena into what the HUD leaves.
 *
 * Portrait stacks board / timer row / hand row and takes the largest square
 * the width or the stack allows; landscape puts the hand in a column to the
 * right and the counters above the board. Every measure is a fraction of the
 * board side, so nothing here is a pixel constant except the 44 px floor a
 * finger needs. Pure, so a test can assert it without a canvas.
 */
export const computeArenaLayout = (cssW: number, cssH: number, insets: Insets, clean = false): ArenaGeometry => {
  if (clean) return cleanArenaLayout(cssW, cssH)
  const availW = Math.max(120, cssW - insets.left - insets.right)
  const availH = Math.max(120, cssH - insets.top - insets.bottom)
  const landscape = cssW > cssH
  const m = Math.max(6, Math.min(18, 0.03 * Math.min(cssW, cssH)))
  const gap = m
  // Frame margin as a share of the board side.
  const F = 0.035

  if (!landscape) {
    // board (1 + 2F) + gap + timer row 0.15 + gap + hand row 0.24
    const s = Math.max(80, Math.min((availW - 2 * m) / (1 + 2 * F), (availH - 2 * m - 2 * gap) / (1 + 2 * F + 0.15 + 0.24)))
    const f = s * F
    const blockH = s * (1 + 2 * F + 0.15 + 0.24) + 2 * gap
    const x0 = insets.left + (availW - s) / 2
    const y0 = insets.top + Math.max(0, (availH - blockH) / 2) + f
    const board = rect(x0, y0, s, s)
    const tile = s / GRID
    const rowY = y0 + s + f + gap
    const rowH = s * 0.15
    const timer = rect(x0 + s / 2 - rowH / 2, rowY, rowH, rowH)
    const counterW = s * 0.34
    const counters = { you: rect(x0, rowY, counterW, rowH), foe: rect(x0 + s - counterW, rowY, counterW, rowH) }
    const handY = rowY + rowH + gap
    const slot = Math.max(44, s * 0.2)
    const slotGap = s * 0.04
    const rerollW = s * 0.28
    const rerollGap = s * 0.06
    const total = HAND_SIZE * slot + (HAND_SIZE - 1) * slotGap + rerollGap + rerollW
    const hx0 = x0 + s / 2 - total / 2
    const hand: Rect[] = []
    for (let i = 0; i < HAND_SIZE; i++) hand.push(rect(hx0 + i * (slot + slotGap), handY, slot, slot))
    const reroll = rect(hx0 + HAND_SIZE * (slot + slotGap) - slotGap + rerollGap, handY + (slot - slot * 0.72) / 2, rerollW, slot * 0.72)
    return {
      cssW, cssH, orientation: 'portrait',
      board, tile, frame: rect(x0 - f, y0 - f, s + 2 * f, s + 2 * f),
      tileRect: (col, row) => rect(x0 + col * tile, y0 + row * tile, tile, tile),
      hand, reroll, timer, counters, swipeThreshold: tile * 0.3
    }
  }

  // Landscape: [board (1 + 2F)] gap [column 0.26]; above the board a counter row 0.12.
  const colW = 0.26
  const s = Math.max(80, Math.min((availH - 2 * m - gap) / (1 + 2 * F + 0.12), (availW - 2 * m - gap) / (1 + 2 * F + colW)))
  const f = s * F
  const blockW = s * (1 + 2 * F + colW) + gap
  const blockH = s * (1 + 2 * F + 0.12) + gap
  const x0 = insets.left + Math.max(0, (availW - blockW) / 2) + f
  const y0 = insets.top + Math.max(0, (availH - blockH) / 2) + s * 0.12 + gap + f
  const board = rect(x0, y0, s, s)
  const tile = s / GRID
  const counterH = s * 0.11
  const counterY = y0 - f - gap - counterH
  const counterW = s * 0.34
  const counters = { you: rect(x0, counterY, counterW, counterH), foe: rect(x0 + s - counterW, counterY, counterW, counterH) }
  const colX = x0 + s + f + gap
  const slot = Math.max(44, Math.min(s * 0.2, s * colW))
  const timerSize = s * 0.16
  const timer = rect(colX + (s * colW - timerSize) / 2, counterY - (timerSize - counterH) / 2, timerSize, timerSize)
  const slotGap = s * 0.04
  const hand: Rect[] = []
  for (let i = 0; i < HAND_SIZE; i++) hand.push(rect(colX + (s * colW - slot) / 2, y0 + i * (slot + slotGap), slot, slot))
  const rerollH = s * 0.14
  const reroll = rect(colX, y0 + s - rerollH, s * colW, rerollH)
  return {
    cssW, cssH, orientation: 'landscape',
    board, tile, frame: rect(x0 - f, y0 - f, s + 2 * f, s + 2 * f),
    tileRect: (col, row) => rect(x0 + col * tile, y0 + row * tile, tile, tile),
    hand, reroll, timer, counters, swipeThreshold: tile * 0.3
  }
}

// ─── Attack geometry (mirrors the rules, for arrows and cones) ──────────────

/**
 * The cells an attack from (col,row) facing `dir` reaches. `out.skipped` is
 * the cells the projectile crosses without hitting (the archer's first tile).
 * Fills preallocated cells and returns counts — no allocation per call.
 */
const attackCells = (
  type: RuneType, level: number, dir: Dir, col: number, row: number,
  hits: Cell[], skipped: Cell[]
): { hits: number; skipped: number } => {
  let nh = 0
  let ns = 0
  if (dir === 'omni') return { hits: 0, skipped: 0 }
  const [dx, dy] = DIR_VEC[dir]
  if (type === 'melee' || type === 'crown') {
    // A sword's reach, and the crown has exactly the same one — it takes the
    // stone it faces. Highlighting the tile is the whole preview: the player
    // sees WHICH rune they would be walking away with before they let go.
    const c = col + dx
    const r = row + dy
    if (inBounds(c, r)) { hits[nh]!.col = c; hits[nh]!.row = r; nh++ }
  } else if (type === 'archer') {
    const s = col + dx
    const t = row + dy
    if (inBounds(s, t)) { skipped[ns]!.col = s; skipped[ns]!.row = t; ns++ }
    for (const step of archerRange(level)) {
      const c = col + dx * step
      const r = row + dy * step
      if (inBounds(c, r)) { hits[nh]!.col = c; hits[nh]!.row = r; nh++ }
    }
  } else if (type === 'mage') {
    for (let step = 1; step <= MAGE_REACH; step++) {
      const c = col + dx * step
      const r = row + dy * step
      if (!inBounds(c, r)) break
      hits[nh]!.col = c; hits[nh]!.row = r; nh++
    }
  } else if (type === 'cleave' || type === 'roller' || type === 'bombard') {
    // The three late runes hit SHAPES, and the shapes are the resolver's own
    // (`rules.ts`), never a second copy of them here: the preview a player aims
    // by has to be exactly what the resolution will do, or the bombard's
    // placement rule is unlearnable.
    //
    // An empty result is meaningful, not a failure — a bombard whose footprint
    // falls off the board highlights nothing, which is the only way the player
    // finds out it must stand three ranks back from what it means to shell.
    fromScratch.col = col
    fromScratch.row = row
    const cells = type === 'cleave'
      ? cleaveCells(fromScratch, dir)
      : type === 'roller'
        ? rollerLane(fromScratch, dir)
        : bombardCells(fromScratch, dir, level)
    // Copied into the caller's scratch, and never past its end.
    for (let i = 0; i < cells.length && nh < hits.length; i++) {
      hits[nh]!.col = cells[i]!.col
      hits[nh]!.row = cells[i]!.row
      nh++
    }
  }
  return { hits: nh, skipped: ns }
}

/** The `Cell` handed to the shared geometry helpers, mutated rather than rebuilt. */
const fromScratch: Cell = { col: 0, row: 0 }

/**
 * Room for the widest pattern any rune has, with headroom: a Lv 2 bombard's
 * footprint is FOUR cells and a roller's lane three. Sized once here so a new
 * shape cannot silently write past the end of the array.
 */
const newScratch = (n: number): Cell[] => Array.from({ length: n }, () => ({ col: 0, row: 0 }))
const hitScratch: Cell[] = newScratch(6)
const skipScratch: Cell[] = newScratch(4)

// ─── Sprite bakes (module level, shared by every renderer instance) ─────────

const pebbleCache = new Map<string, HTMLCanvasElement>()
const glowCache = new Map<string, HTMLCanvasElement>()
const arrowCache = new Map<string, HTMLCanvasElement>()
/** The Lv 2 wreath + crest, baked apart from the stone so they never turn with it. */
const ornamentCache = new Map<string, HTMLCanvasElement>()
const tintCache = new Map<string, HTMLCanvasElement>()
const flameCache = new Map<string, HTMLCanvasElement>()
const fingerCache = new Map<string, HTMLCanvasElement>()
const rerollCache = new Map<string, HTMLCanvasElement>()
/** Baked damage overlays, keyed on stage + the stone's own seed + size. */
const damageCache = new Map<string, HTMLCanvasElement>()
/** Baked hand sockets and static HUD captions. See `socketSprite`, `captionSprite`. */
const socketCache = new Map<string, HTMLCanvasElement>()
const captionCache = new Map<string, HTMLCanvasElement>()

const makeCanvas = (wCss: number, hCss: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null => {
  try {
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.ceil(wCss * dpr))
    c.height = Math.max(1, Math.ceil(hCss * dpr))
    const ctx = c.getContext('2d')
    if (!ctx) return null
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return [c, ctx]
  } catch {
    return null
  }
}

/** Sprite side as a multiple of the tile — the stone fills `STONE_FILL` of it, the rest is glow. */
const PEBBLE_PAD = 1.2

/** The cache key's tint half: the skin for the player's stones, the faction for the enemy's. */
const tintKey = (side: Side, skin: SkinId, faction: Faction | null): string =>
  side === 'player' ? `p:${skin}` : `e:${faction ?? 'orc'}`

/** The drop-in id a painted stone is filed under (see `artCatalogue`). */
const runeArtId = (type: RuneType, level: number, side: Side, skin: SkinId, faction: Faction | null): string =>
  side === 'player' ? `${type}-${skin}-lv${Math.min(2, level)}` : `${type}-e-${faction ?? 'orc'}-lv${Math.min(2, level)}`

/**
 * One stone and the wreath round it, baked together — a painted file when the
 * art layer has one, the painter otherwise.
 *
 * This is the layer the arena TURNS. A rune fires along the way it faces, and
 * since every glyph was drawn facing somewhere already (`glyphs.GLYPH_HEADING`
 * — the sword's point up, the bow's arrow right) the renderer can simply spin
 * the stone until the drawing agrees with the facing.
 *
 * ── Why the wreath turns WITH it ──
 *
 * It was briefly a separate upright layer, on the reasoning that a wreath hung
 * on a stone should not lie on its side. That is true of a LABEL and false of
 * this: the wreath is cut to the stone's own silhouette, so the moment the
 * stone turned a quarter and the wreath did not, it was hugging a shape that
 * had rotated out from under it — leaves biting into the rock down one side
 * and hanging in mid-air down the other. A stone and its wreath are one medal.
 * Turn the medal.
 *
 * What genuinely cannot turn is the crest — a small plaque with the level
 * written on it — and that is all `bakeCrest` is left holding.
 */
const bakePebble = (
  type: RuneType, level: number, side: Side, skin: SkinId, faction: Faction | null,
  key: string, size: number, dpr: number, levelLabel: string
): HTMLCanvasElement | null => {
  const sideLen = Math.ceil(size * PEBBLE_PAD)
  const made = makeCanvas(sideLen, sideLen, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  const painted = spriteFor('rune', runeArtId(type, level, side, skin, faction))
  if (painted) ctx.drawImage(painted, 0, 0, sideLen, sideLen)
  else {
    paintPebble(ctx, sideLen, sideLen, {
      // A clean feed bakes no word into a stone: the crest falls back to its mark.
      type, level, owner: side, faction, skin: SKINS[skin] ?? SKINS.river, label: CLEAN_FEED ? '' : levelLabel,
      laurel: false, crest: false
    })
  }
  if (level >= 2) {
    // The wreath goes round THIS stone, and nine cuts give the same rune nine
    // different rims: marble is quarried broader, obsidian is knapped in off a
    // flake, ruby is a plump cabochon. A wreath that ignores which one it is
    // hanging on floats off the narrow ones and bites into the wide ones.
    const cut = (side === 'player' ? SKINS[skin] ?? SKINS.river : enemyStone(faction)).cut
    // A painted wreath goes on a PAINTED stone and nothing else. A stone that
    // falls back to the drawing would otherwise get a painted wreath laid over
    // it — two different hands, and two different silhouettes, on one rune. The
    // drawn wreath is cut to the drawn stone exactly, so a rune whose painting
    // is missing, parked, or still decoding simply wears the drawn pair until
    // its stone arrives, and then both swap together.
    const wreath = painted ? spriteFor('fx', `laurel-${type}`) : null
    if (wreath) {
      // A painting cannot be re-cut, only re-sized: `laurelFit` is the one
      // scale that puts a wreath painted against the reference cut closest to
      // this stone's rim. It is 1 for the reference cut itself, and for every
      // enemy stone, which is carved.
      const k = laurelFit(type, cut)
      if (k === 1) ctx.drawImage(wreath, 0, 0, sideLen, sideLen)
      else {
        ctx.save()
        ctx.translate(sideLen / 2, sideLen / 2)
        ctx.scale(k, k)
        ctx.drawImage(wreath, -sideLen / 2, -sideLen / 2, sideLen, sideLen)
        ctx.restore()
      }
    } else paintLaurel(ctx, sideLen, sideLen, type, cut)
  }
  pebbleCache.set(key, canvas)
  return canvas
}

/**
 * The one thing on a Lv 2 stone that must stay the right way up: the crest, a
 * little gold plaque with the level written across it. Baked apart from the
 * stone and blitted level over it, because a word on its side is not a word.
 *
 * Painter-only. A painted stone that came back with its level already written
 * on it keeps the one it has, and gets nothing from here.
 */
const bakeCrest = (
  type: RuneType, level: number, side: Side, skin: SkinId, faction: Faction | null,
  key: string, size: number, dpr: number, levelLabel: string
): HTMLCanvasElement | null => {
  const sideLen = Math.ceil(size * PEBBLE_PAD)
  const made = makeCanvas(sideLen, sideLen, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  if (!spriteFor('rune', runeArtId(type, level, side, skin, faction))) {
    paintPebbleOrnaments(ctx, sideLen, sideLen, {
      type, level, laurel: false, label: CLEAN_FEED ? '' : levelLabel
    })
  }
  ornamentCache.set(key, canvas)
  return canvas
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

/**
 * Sprites are keyed on a 4 px BUCKET of their CSS size, not the exact size.
 * The loader primes the set from a guessed tile and the scene's real tile is
 * a few pixels off; with exact keys every sprite would bake again on the
 * first frame. A bucket is drawn up to 2 px larger or smaller than it was
 * baked, which `drawImage` scales invisibly.
 */
const bucket = (size: number): number => Math.max(8, Math.round(size / 4) * 4)

export interface ChevronPoint {
  dir: Dir
  x: number
  y: number
  /** This chevron IS the current facing (drawn as the bold arrow, not as a chevron). */
  current: boolean
}

/**
 * Where the lock window's facing chevrons sit: one per legal facing of
 * `type`, `LOCK_CHEVRON_TILES` tiles out from the STONE'S TILE CENTRE (cx, cy).
 * The renderer draws them here and the input layer hit-tests the same points
 * within `LOCK_CHEVRON_HIT_TILES` — one function so the two can never drift.
 * An omni rune has no facings and gets an empty list.
 */
export const lockChevronPoints = (type: RuneType, dir: Dir, cx: number, cy: number, tile: number): ChevronPoint[] => {
  const out: ChevronPoint[] = []
  for (const d of dirsFor(type)) {
    if (d === 'omni') continue
    const [dx, dy] = DIR_VEC[d]
    const n = Math.hypot(dx, dy) || 1
    out.push({ dir: d, x: cx + (dx / n) * tile * LOCK_CHEVRON_TILES, y: cy + (dy / n) * tile * LOCK_CHEVRON_TILES, current: d === dir })
  }
  return out
}

const pebbleKey = (type: RuneType, level: number, tint: string, size: number): string =>
  `${type}|${level}|${tint}|${bucket(size)}`

/** The glyph alone, blurred wide, for the additive breathing over a pebble. */
const glyphGlow = (type: RuneType, color: string, size: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${type}|${color}|${bucket(size)}`
  const hit = glowCache.get(key)
  if (hit) return hit
  const side = Math.ceil(size * PEBBLE_PAD)
  const made = makeCanvas(side, side, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  ctx.translate(side / 2, side / 2)
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.3
  ctx.fillStyle = rgba(color, 0.85)
  drawGlyph(ctx, type, size * 0.44)
  drawGlyph(ctx, type, size * 0.44)
  glowCache.set(key, canvas)
  return canvas
}

/**
 * A stone's damage, baked. Keyed on the stage, the stone's own seed and the
 * size bucket, so sixteen runes wearing down over a match cost three bakes
 * each at most — the network itself is deterministic, so the same key is
 * always the same drawing.
 */
const damageSprite = (stage: DamageStage, seed: number, size: number, dpr: number): HTMLCanvasElement | null => {
  if (stage <= 0) return null
  const key = `${stage}|${seed}|${bucket(size)}`
  const hit = damageCache.get(key)
  if (hit) return hit
  const side = Math.ceil(size * PEBBLE_PAD)
  const made = makeCanvas(side, side, dpr)
  if (!made) return null
  const [canvas, c] = made
  paintDamage(c, side, side, stage, seed)
  damageCache.set(key, canvas)
  return canvas
}

/**
 * The arrow sprite's two sizes, both as a multiple of the tile.
 *
 * `ARROW_BOX` is the square it is BAKED into and `ARROW_DRAW` the footprint it
 * is drawn at, and they are different numbers on purpose. The head now carries
 * a heavy black keyline and a halo, and both of those need room around the
 * head that the old box — sized to the head itself — did not have. Growing the
 * box alone would have silently scaled up every arrow in the game by a third,
 * since a dozen call sites pass a `scale` that was tuned against the old one.
 * So the box grew, the drawn footprint did not, and `scale` still means what
 * it meant at every one of those call sites.
 */
const ARROW_BOX = 0.9
const ARROW_DRAW = 0.7

/**
 * The arrowhead's outline — a broad head with a stub of shaft behind it —
 * traced about (cx, cy) in a box `size` across, pointing UP.
 *
 * Module level, above `arrowSprite`, rather than a closure inside it: the
 * source guard in `noFrameBlur.test.ts` reads the nearest enclosing `const` to
 * decide whether a `shadowBlur` sits inside a bake helper, and a nested
 * arrow function defined before the blur hides the helper it belongs to.
 */
const arrowHeadPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void => {
  const hw = size * 0.3
  const hh = size * 0.26
  const sw = size * 0.115
  const sl = size * 0.17
  const nose = cy - hh * 0.62
  const barb = nose + hh
  ctx.beginPath()
  ctx.moveTo(cx, nose)
  ctx.lineTo(cx + hw / 2, barb)
  ctx.lineTo(cx + sw / 2, barb)
  ctx.lineTo(cx + sw / 2, barb + sl)
  ctx.lineTo(cx - sw / 2, barb + sl)
  ctx.lineTo(cx - sw / 2, barb)
  ctx.lineTo(cx - hw / 2, barb)
  ctx.closePath()
}

/**
 * A glowing arrowhead pointing UP, rotated at draw time.
 *
 * Drawn in three passes, outside in: a heavy black keyline, the colour, then a
 * white core. That order is the whole reason this mark survives — the board is
 * painted art, the arrow lands on slate, on lit tiles, on enemy red and on the
 * stone being carried, and a single-colour glyph is legible on some of those
 * and gone on the rest. Outline it and it is legible on all of them.
 *
 * It is also a proper ARROW now rather than a chevron: a broad head with a
 * stub of shaft behind it. A bare chevron is two strokes meeting at a point,
 * and at HUD size, on a tile that also carries a triangular aim wedge, two
 * strokes meeting at a point is exactly what everything else on the tile
 * already looks like.
 */
const arrowSprite = (color: string, size: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${color}|${bucket(size)}`
  const hit = arrowCache.get(key)
  if (hit) return hit
  const side = Math.ceil(size * ARROW_BOX)
  const made = makeCanvas(side, side, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  const cx = side / 2
  const cy = side / 2
  const hh = size * 0.26
  const nose = cy - hh * 0.62
  const barb = nose + hh
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  // 1 — the keyline, so the mark reads on any background at all.
  arrowHeadPath(ctx, cx, cy, size)
  ctx.strokeStyle = rgba('#000000', 0.85)
  ctx.lineWidth = Math.max(2, size * 0.062)
  ctx.stroke()
  // 2 — the colour, with its own halo (a bake, so the blur is paid once).
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.14
  ctx.fillStyle = color
  arrowHeadPath(ctx, cx, cy, size)
  ctx.fill()
  ctx.shadowBlur = 0
  // 3 — a white core down the middle of the head, which is what makes it read
  // as lit rather than as a coloured shape.
  ctx.fillStyle = rgba('#ffffff', 0.8)
  ctx.beginPath()
  ctx.moveTo(cx, nose + hh * 0.2)
  ctx.lineTo(cx + size * 0.078, barb - hh * 0.1)
  ctx.lineTo(cx - size * 0.078, barb - hh * 0.1)
  ctx.closePath()
  ctx.fill()
  arrowCache.set(key, canvas)
  return canvas
}

/** A whole tile — the slate, the bevel, the owner's glowing edge — painted or drawn. */
const tileSprite = (owner: Owner, faction: Faction | null, tile: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${owner}|${owner === 'enemy' ? (faction ?? 'orc') : '-'}|${bucket(tile)}`
  const hit = tintCache.get(key)
  if (hit) return hit
  const made = makeCanvas(tile, tile, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  const painted = spriteFor('tile', owner)
  if (painted) ctx.drawImage(painted, 0, 0, tile, tile)
  else paintTile(ctx, tile, tile, { owner, faction })
  // ── The board IS the scoreboard ──
  //
  // Conquest is won by holding tiles, so "am I winning" should be answerable
  // by looking at the board — whose colour covers more of it — with nothing to
  // count. Owned tiles used to differ from neutral ones by a rim and a faint
  // vignette, so every square read as the same grey stone and five rounds of
  // blind testers took the territory off nothing at all; one could not
  // reconcile the counters with the board in front of her (2026-09-13).
  //
  // It goes HERE rather than in `paintTile` because the tiles are painted:
  // `spriteFor` returns the painting and the drawn painter is never called, so
  // a wash added there changes nothing a player ever sees. Baked once per
  // owner into the same cached sprite, so it costs nothing per frame.
  if (owner !== 'neutral') {
    // Two colours on this board and no more: yours and theirs. The FACTION's
    // colour stays where identity belongs — the portrait, its rim, its name —
    // but territory is a scoreboard, and a scoreboard that speaks goblin-green
    // on the board and enemy-red on the goal bar is asking a player to learn
    // that those are the same side. Green is also already this game's word for
    // "you may place here", which is the last thing enemy ground should say.
    const edge = owner === 'player' ? PLAYER_COLOR : ENEMY_TERRITORY
    const g = ctx.createRadialGradient(tile / 2, tile / 2, tile * 0.1, tile / 2, tile / 2, tile * 0.75)
    g.addColorStop(0, rgba(edge, 0.22))
    g.addColorStop(1, rgba(edge, 0.5))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, tile, tile)
  }
  tintCache.set(key, canvas)
  return canvas
}

/**
 * The reroll chip's body and mark; the label and the count are drawn beside
 * the mark, in the chip's right-hand part.
 *
 * The PAINTING is not a chip body. It was commissioned as the mark alone — a
 * square pebble with the two arrows round its face (`artSheet.ts`, cell
 * `reroll`) — and it used to be blitted over the whole chip anyway: stretched
 * to twice its width into a flat oval, arrows and all, with the caption then
 * printed across the arrows because the caption goes where the drawn chip
 * leaves room for it. So the pebble goes where the drawn chip puts its cycle
 * mark, at its own aspect, and the caption keeps the rest of the chip.
 */
const rerollSprite = (w: number, h: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${bucket(w)}|${bucket(h)}`
  const hit = rerollCache.get(key)
  if (hit) return hit
  const made = makeCanvas(w, h, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  const painted = spriteFor('ui', 'reroll')
  if (painted?.naturalWidth && painted.naturalHeight) {
    // A touch under the chip's height and a touch left of the square's middle:
    // the painted pebble is far bigger than the drawn cycle mark, and at full
    // size its rim ran into the caption's first letter.
    const k = Math.min(h / painted.naturalWidth, h / painted.naturalHeight) * 0.94
    const pw = painted.naturalWidth * k
    const ph = painted.naturalHeight * k
    // The same left-square-or-centre rule `paintRerollChip` places its mark by.
    const cx = w > h * 1.6 ? h * 0.47 : w / 2
    ctx.drawImage(painted, cx - pw / 2, (h - ph) / 2, pw, ph)
  } else paintRerollChip(ctx, w, h)
  rerollCache.set(key, canvas)
  return canvas
}

/**
 * One empty hand socket — the gradient plate and both border strokes.
 *
 * `drawHand` used to build this live for every slot, every frame: a
 * `createLinearGradient` plus two `addColorStop`s, discarded microseconds
 * later, to produce a result that only changes when the layout does. The
 * endpoints are the slot's own rect, so at 60 fps with three slots that was
 * ~180 identical gradient objects a second. Bucketed by size, so a resize
 * re-bakes and nothing else does.
 */
const socketSprite = (w: number, h: number, size: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${bucket(w)}|${bucket(h)}|${Math.round(size)}`
  const hit = socketCache.get(key)
  if (hit) return hit
  const made = makeCanvas(w, h, dpr)
  if (!made) return null
  const [canvas, c] = made
  const g = c.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#171b28')
  g.addColorStop(1, '#232838')
  c.fillStyle = g
  c.strokeStyle = rgba('#000000', 0.7)
  c.lineWidth = Math.max(1, size * 0.02)
  roundRect(c, 0, 0, w, h, w * 0.2)
  c.fill()
  c.stroke()
  c.strokeStyle = rgba(GRID_GLOW, 0.28)
  roundRect(c, 1.5, 1.5, w - 3, h - 3, w * 0.18)
  c.stroke()
  socketCache.set(key, canvas)
  return canvas
}

/**
 * A STATIC caption — "YOU", "FOE", "REROLL" — baked once per wording and size.
 *
 * Assigning `ctx.font` is the single most expensive canvas operation this
 * renderer performs: Chrome re-parses the CSS font shorthand and re-resolves
 * the `Angry` face on every assignment, and the six per frame measured 9.5 % of
 * all CPU at 4x throttle. Three of those six are words that change only when
 * the locale does. The numbers beside them still draw live, because those
 * genuinely change.
 *
 * Only cached once the face has actually loaded — otherwise a bake landing in
 * the download window would freeze the fallback into the caption forever.
 * `createArenaRenderer`'s `document.fonts.ready` hook drops these anyway; this
 * is the belt to that braces.
 */
const captionSprite = (
  text: string, px: number, fill: string, dpr: number
): { sprite: HTMLCanvasElement; w: number; h: number; pad: number } | null => {
  if (CLEAN_FEED) return null
  const size = Math.max(6, Math.round(px))
  const key = `${text}|${size}|${fill}`
  const hit = captionCache.get(key)
  const pad = Math.ceil(Math.max(1.5, size * 0.16)) + 1
  if (hit) return { sprite: hit, w: hit.width / dpr, h: hit.height / dpr, pad }
  const probe = makeCanvas(1, 1, 1)
  if (!probe) return null
  probe[1].font = font(size)
  const tw = Math.ceil(probe[1].measureText(text).width) + pad * 2
  const th = Math.ceil(size * 1.5) + pad * 2
  const made = makeCanvas(tw, th, dpr)
  if (!made) return null
  const [canvas, c] = made
  c.font = font(size)
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.lineJoin = 'round'
  c.lineWidth = Math.max(1.5, size * 0.16)
  c.strokeStyle = rgba('#000000', 0.85)
  c.strokeText(text, tw / 2, th / 2)
  c.fillStyle = fill
  c.fillText(text, tw / 2, th / 2)
  let ready = true
  try { ready = document.fonts?.check(font(size)) !== false } catch { ready = true }
  if (ready) captionCache.set(key, canvas)
  return { sprite: canvas, w: tw, h: th, pad }
}

/** A teardrop flame, white-hot core to `color` to nothing, drawn additively. */
const flameSprite = (color: string, size: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${color}|${bucket(size)}`
  const hit = flameCache.get(key)
  if (hit) return hit
  const w = Math.ceil(size)
  const h = Math.ceil(size * 1.7)
  const made = makeCanvas(w, h, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  ctx.beginPath()
  ctx.moveTo(w / 2, 0)
  ctx.bezierCurveTo(w * 0.95, h * 0.45, w * 0.95, h * 0.8, w / 2, h)
  ctx.bezierCurveTo(w * 0.05, h * 0.8, w * 0.05, h * 0.45, w / 2, 0)
  ctx.closePath()
  const g = ctx.createRadialGradient(w / 2, h * 0.72, size * 0.05, w / 2, h * 0.6, size * 0.9)
  g.addColorStop(0, rgba('#ffffff', 0.9))
  g.addColorStop(0.35, rgba(color, 0.75))
  g.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = g
  ctx.fill()
  flameCache.set(key, canvas)
  return canvas
}

/** A pointing hand, stroked white over a dark underlay, for the ghost hint. */
const fingerSprite = (size: number, dpr: number): HTMLCanvasElement | null => {
  const key = `${bucket(size)}`
  const hit = fingerCache.get(key)
  if (hit) return hit
  const made = makeCanvas(size, size, dpr)
  if (!made) return null
  const [canvas, ctx] = made
  const p = new Path2D('M9 11V6a2 2 0 1 1 4 0v5 M13 8a2 2 0 1 1 4 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.4L4 15a1.6 1.6 0 0 1 2.6-1.9L8 15')
  const k = size / 24
  ctx.scale(k, k)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 4.2
  ctx.strokeStyle = rgba('#000000', 0.75)
  ctx.stroke(p)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ffffff'
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 3
  ctx.stroke(p)
  fingerCache.set(key, canvas)
  return canvas
}

// ─── The bake seam for the loader ───────────────────────────────────────────
//
// The loader primes the pebble set behind the splash so the first frame never
// bakes on the hot path. The size is a guess from the viewport; the renderer's
// real tile may differ a little, in which case the odd sprite bakes on demand
// (~1–2 ms) while the primed set covers everything else.

type BakeJob = () => void

let bakeQueue: BakeJob[] = []
let bakeTotal = 0
let bakeDone = 0
let primedSize = 0
let primedLabel = 'Lv.2'
/**
 * Stones bake at 2× whatever the screen is: a DPR-1 desktop then draws them
 * downscaled, which is what keeps the engraving crisp, and a DPR-3 phone is
 * capped at 2 by the render tier anyway. The lowest tier bakes at 1.
 */
const bakeDpr = (): number => {
  const real = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1
  return renderScaleTier.value === 'min' ? Math.min(1, real) : 2
}

const guessTileSize = (): number => {
  if (typeof window === 'undefined') return 72
  const w = window.innerWidth
  const h = window.innerHeight
  return computeArenaLayout(w, h, { top: h * 0.09, bottom: h * 0.08, left: 0, right: 0 }).tile
}

/**
 * Queue every sprite the first screen could need at `sizeCss` (guessed from the
 * viewport when omitted): the pebbles of every type, level and tint, then the
 * glyph glows, the facing arrows, the tile tints, the flames and the finger.
 * `skin` is the player's equipped skin; the other skins bake on demand.
 */
export const primePebbleSprites = (sizeCss?: number, levelLabel = primedLabel, skin: SkinId = STARTING_SKIN): void => {
  const size = bucket(sizeCss ?? guessTileSize())
  if (size === primedSize && bakeTotal > 0) return
  primedSize = size
  primedLabel = levelLabel
  bakeQueue = []
  const dpr = bakeDpr()
  const tints: Array<[Side, Faction | null]> = [['player', null]]
  for (const f of Object.keys(FACTION_DEFS) as Faction[]) tints.push(['enemy', f])
  for (const type of Object.keys(RUNES) as RuneType[]) {
    for (const level of [1, 2] as const) {
      for (const [side, faction] of tints) {
        const key = pebbleKey(type, level, tintKey(side, skin, faction), size)
        if (!pebbleCache.has(key)) bakeQueue.push(() => { if (!pebbleCache.has(key)) bakePebble(type, level, side, skin, faction, key, size, dpr, primedLabel) })
      }
    }
  }
  const skinDef = SKINS[skin] ?? SKINS.river
  for (const type of Object.keys(RUNES) as RuneType[]) {
    bakeQueue.push(() => { glyphGlow(type, resolveGlow(skinDef, type), size, dpr) })
    if (skinDef.glow) bakeQueue.push(() => { glyphGlow(type, RUNES[type].color, size, dpr) })
  }
  const colors = [PLAYER_COLOR, PLAYER_ARROW, ENEMY_ARROW, NEUTRAL_COLOR, ...Object.values(FACTION_DEFS).map((f) => f.color)]
  for (const c of colors) bakeQueue.push(() => { arrowSprite(c, size, dpr) })
  bakeQueue.push(() => { tileSprite('neutral', null, size, dpr) })
  bakeQueue.push(() => { tileSprite('player', null, size, dpr) })
  for (const f of Object.keys(FACTION_DEFS) as Faction[]) bakeQueue.push(() => { tileSprite('enemy', f, size, dpr) })
  for (const c of [GOLD, '#9fd8ff', '#7fb8ff']) bakeQueue.push(() => { flameSprite(c, size * 0.55, dpr) })
  bakeQueue.push(() => { fingerSprite(size * 0.95, dpr) })
  bakeTotal = bakeQueue.length
  bakeDone = 0
}

/** Bake as many queued pebbles as fit in `budgetMs` of wall clock. Returns how many. */
export const bakePebbleSlice = (budgetMs: number): number => {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now()
  let n = 0
  while (bakeQueue.length > 0) {
    const job = bakeQueue.shift()!
    try { job() } catch { /* a lost context bakes nothing; the draw path falls back */ }
    bakeDone++
    n++
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (now - t0 >= budgetMs) break
  }
  return n
}

export const pebbleSpritesReady = (): boolean => bakeQueue.length === 0
export const pebbleBakeProgress01 = (): number => (bakeTotal === 0 ? 1 : bakeDone / bakeTotal)

const invalidateSprites = (): void => {
  pebbleCache.clear()
  ornamentCache.clear()
  glowCache.clear()
  arrowCache.clear()
  tintCache.clear()
  flameCache.clear()
  fingerCache.clear()
  rerollCache.clear()
  damageCache.clear()
  socketCache.clear()
  captionCache.clear()
  bakeQueue = []
  bakeTotal = 0
  bakeDone = 0
  primedSize = 0
}

/**
 * The drop-in paintings a baked stone is made of, read back off its cache key
 * (`pebbleKey`): the stone's own file and, from Lv 2, its rune's wreath.
 *
 * Built with `runeArtId`, the function `bakePebble` asks `spriteFor` with, so
 * "which painting is this bake made of" cannot drift from "which painting did
 * the bake use".
 */
export const paintingsInPebble = (key: string): string[] => {
  const [type, lv, tint] = key.split('|') as [RuneType, string, string]
  const level = Number(lv)
  const who = tint.slice(2)
  const stone = tint.startsWith('p:')
    ? runeArtId(type, level, 'player', who as SkinId, null)
    : runeArtId(type, level, 'enemy', STARTING_SKIN, who as Faction)
  return level >= 2 ? [`rune/${stone}`, `fx/laurel-${type}`] : [`rune/${stone}`]
}

/**
 * One painting decoded: forget exactly the baked sprites it is part of, and
 * say whether the renderer's own two bakes (the backdrop, the board plate)
 * hold it too.
 *
 * Everything else stays. The glyph glows, arrows, flames, the finger, the hand
 * sockets and the captions are drawn and never painted, so no painting can
 * change them; dropping them on every arrival — as the whole-scene invalidate
 * did, 91 times in the first seconds of play — only bought them a re-bake.
 * What is dropped re-bakes on its next draw.
 *
 * `fx/ring-heal` and `round/bolt` are read fresh each frame, and monster and
 * hero art lives in the DOM, so they drop nothing here.
 */
export const dropBakesFor = (kind: ArtKind, id: string): { backdrop: boolean; plate: boolean } => {
  const art = `${kind}/${id}`
  if (kind === 'rune' || (kind === 'fx' && id.startsWith('laurel-'))) {
    for (const key of pebbleCache.keys()) if (paintingsInPebble(key).includes(art)) pebbleCache.delete(key)
    // The ornament layer is keyed the same way and is made of the same two
    // paintings: the wreath it blits, and the stone — because whether the
    // crest is drawn at all depends on whether that stone came back painted.
    for (const key of ornamentCache.keys()) if (paintingsInPebble(key).includes(art)) ornamentCache.delete(key)

  } else if (kind === 'tile' && id !== 'frame') {
    // `tileSprite` keys lead with the owner, which is the tile painting's id.
    for (const key of tintCache.keys()) if (key.startsWith(`${id}|`)) tintCache.delete(key)
  } else if (kind === 'ui' && id === 'reroll') {
    rerollCache.clear()
  } else if (kind === 'fx' && id === 'smoke') {
    // The tinted puffs share `useGradientRamps`' sprite cache, which nothing
    // else dropped on an arrival — a puff painting that decoded after the
    // first smoke waited for the next stage to show.
    clearRamps()
  }
  return {
    backdrop: kind === 'bg',
    // The plate is the frame painting with a neutral tile baked into every cell.
    plate: kind === 'tile' && (id === 'frame' || id === 'neutral')
  }
}

// ─── Visual state per rune ──────────────────────────────────────────────────

interface VisRune {
  /** Pixel offset from the tile centre (a slide, a lunge, a tremble). */
  ox: number
  oy: number
  sx: number
  sy: number
  alpha: number
  /** 0..1 white flash (a hit). */
  flash: number
  /** 0..1 crack overlay (about to shatter). */
  crack: number
  /** 0..1 blue shield flash (absorbed damage). */
  shield: number
  /** Deterministic breathing phase. */
  phase: number
  /**
   * The angle the stone is CURRENTLY turned to, easing toward the one its
   * facing asks for (`glyphSpin`). `null` until the rune has been drawn once,
   * so a stone that arrives already aimed is drawn aimed rather than swinging
   * round from north on the frame it appears.
   */
  spin: number | null
}

const newVis = (id: number): VisRune =>
  ({ ox: 0, oy: 0, sx: 1, sy: 1, alpha: 1, flash: 0, crack: 0, shield: 0, phase: (id * 0.61) % (Math.PI * 2), spin: null })

/**
 * Ease `from` toward `to` the SHORT way round, `k` of the way.
 *
 * Angles do not lerp: a stone re-aimed from left to up has to swing a quarter
 * turn, and the naive lerp between 3.14 and -1.57 takes it three quarters of
 * the way round the other way, through the facing the player just rejected.
 */
const easeAngle = (from: number, to: number, k: number): number => {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return Math.abs(d) < 0.002 ? to : from + d * k
}

/**
 * How fast a stone swings round to a new facing, as the fraction of the
 * remaining angle it closes per 16 ms.
 *
 * Fast enough that a re-aim inside the correction window looks like a
 * response to the flick and not an animation the player has to wait out;
 * slow enough that the eye catches WHICH WAY it turned, which is the whole
 * reason it turns at all rather than snapping.
 */
const SPIN_EASE = 0.26

// ─── Timeline event stages ──────────────────────────────────────────────────

const STAGE_IDLE = 0
const STAGE_STARTED = 1
const STAGE_IMPACTED = 2
const STAGE_DONE = 3

/** When inside an event's window its damage / mutation lands. The owning rune module may move it. */
const impactFrac = (e: ResolveEvent): number => {
  const owner = ownerOf(e)
  const own = owner ? RUNE_FX[owner].impactAt?.(e as RuneEvent) : undefined
  if (own !== undefined) return own
  switch (e.kind) {
    case 'shot': return WEAPON_IMPACT[e.weapon]
    case 'explode': return 0.35
    // Early: the damage lands with the flash, and the rest of the window is
    // the front travelling out over the stones it has already taken.
    case 'nuke': return 0.22
    case 'heal': return 0.5
    case 'shatter': return 0.35
    case 'knockback': return 1
    case 'capture': return 0.5
    case 'clash': return 0.55
    case 'merge': return 0.55
    case 'place': return 0.7
    default: return 0
  }
}

/** Bench / test seam: where inside an event's window its blow lands (0…1). */
export const eventImpactFrac = (e: ResolveEvent): number => impactFrac(e)

/** How long past `at + dur` an event keeps drawing (trails, fades). The owning rune module may extend it. */
const tailMs = (e: ResolveEvent): number => {
  const owner = ownerOf(e)
  const own = owner ? RUNE_FX[owner].tailMs?.(e as RuneEvent) : undefined
  if (own !== undefined) return own
  return e.kind === 'nuke' ? 320 : e.kind === 'shot' || e.kind === 'explode' || e.kind === 'combo' ? 220 : 120
}

// ─── The renderer ───────────────────────────────────────────────────────────

export interface ArenaRenderer {
  resize: (cssW: number, cssH: number, dpr: number, insets: Insets) => void
  draw: (view: ArenaView, dtMs: number, nowMs: number) => void
  layout: () => ArenaGeometry
  hitTest: (x: number, y: number) => HitTarget
  /** Drop every baked surface (a skin change, a resize, new art). */
  invalidate: () => void
  dispose: () => void
}

export const createArenaRenderer = (canvas: HTMLCanvasElement): ArenaRenderer => {
  const ctx = canvas.getContext('2d')
  const { triggerShake } = useScreenshake()

  let geom = computeArenaLayout(360, 640, { top: 0, bottom: 0, left: 0, right: 0 }, CLEAN_FEED)
  let dpr = 1
  let cssW = 0
  let cssH = 0
  let lastArgs: [number, number, number, Insets] | null = null
  /** The insets the current bakes were laid out for. Compared FIELD BY FIELD:
   *  the scene hands us a fresh object every tick, so identity never matches. */
  const lastInsets: Insets = { top: -1, bottom: -1, left: -1, right: -1 }
  /** Set by `dispose`, so an async font callback cannot rebuild a dead scene. */
  let disposed = false

  // Tile centres, precomputed per resize.
  const tileCX = new Float64Array(GRID * GRID)
  const tileCY = new Float64Array(GRID * GRID)

  // Baked surfaces (per size).
  let backdrop: HTMLCanvasElement | null = null
  let plate: HTMLCanvasElement | null = null

  // Motes.
  const MOTES = 40
  const mx = new Float32Array(MOTES)
  const my = new Float32Array(MOTES)
  const mvx = new Float32Array(MOTES)
  const mvy = new Float32Array(MOTES)
  const msz = new Float32Array(MOTES)
  const mph = new Float32Array(MOTES)
  const mcol = new Uint8Array(MOTES)
  let motesSeeded = false
  const MOTE_COLORS = [RUNES.mage.color, RUNES.defense.color, RUNES.support.color, RUNES.archer.color]

  // Visual runes + the displayed board.
  const vis = new Map<number, VisRune>()
  const getVis = (id: number): VisRune => {
    let v = vis.get(id)
    if (!v) { v = newVis(id); vis.set(id, v) }
    return v
  }
  /** The board on screen: the timeline's working copy while resolving, else the view's. */
  let disp: BoardState | null = null
  let dispSource: BoardState | null = null
  let runeList: Rune[] = []
  const rebuildRuneList = (): void => {
    runeList.length = 0
    if (!disp) return
    for (const id in disp.runes) {
      const r = disp.runes[id]
      if (r) runeList.push(r)
    }
    runeList.sort((a, b) => (a.row - b.row) || (a.col - b.col))
  }

  // Timeline bookkeeping.
  let tlRef: ArenaView['timeline'] = null
  let local: BoardState | null = null
  let stages = new Uint8Array(64)
  let lastEmitAt = 0

  // Phase / edge tracking.
  let lastPhase: ArenaView['phase'] | null = null
  let revealRef: ArenaView['reveal'] = null
  let resultAt = -1
  let resultWon = false
  let resetAt = -1
  let suddenAt = -1
  let lastSudden = false
  let fadeRunes: Array<{ rune: Rune; x: number; y: number }> = []
  let lastSkin: SkinId | null = null
  let lastDragOverKey = -2
  let lastDragKind: string | null = null
  let dragDir: Dir | null = null
  let labels: CanvasLabels | null = null
  let now = 0
  let age = 0

  // ── Sizing ──

  const tierCap = (): number => {
    const t = renderScaleTier.value
    return t === 'min' ? 0.8 : t === 'low' ? 1.25 : t === 'medium' ? 1.5 : 2
  }

  const resize = (w: number, h: number, dprIn: number, insets: Insets): void => {
    const cap = tierCap()
    const nextDpr = renderScaleTier.value === 'min' ? Math.min(dprIn || 1, 1) * cap : Math.min(dprIn || 1, cap)
    /**
     * NOTHING CHANGED — do not throw the bakes away.
     *
     * The scene re-measures its HUD insets on a 1 s timer (a wrapped faction
     * name or an appearing streak chip moves the board), and every one of those
     * calls landed here. Unconditionally this function drops the backdrop, the
     * plate, the mote field and every gradient ramp, so a measurement that
     * found the HUD exactly as tall as it was a second ago still cost a
     * full-screen backdrop re-bake — three `getImageData` GPU readbacks, a
     * ~3.4 MB canvas allocated and discarded, sixteen clipped tile-crack
     * passes — once per second, for the whole session. Measured at 4x CPU
     * throttle it was 17 % of all render time and about half the long tasks
     * (`PERF-LEDGER.md`, `resize-rebake-legacy`).
     *
     * The insets are compared field by field rather than by identity: the
     * caller builds a fresh object every tick, so an identity check never
     * matches and would leave the bug exactly where it was.
     */
    if (
      backdrop !== null
      && w === cssW && h === cssH && nextDpr === dpr
      && insets.top === lastInsets.top && insets.bottom === lastInsets.bottom
      && insets.left === lastInsets.left && insets.right === lastInsets.right
    ) {
      lastArgs = [w, h, dprIn, insets]
      return
    }
    lastArgs = [w, h, dprIn, insets]
    lastInsets.top = insets.top
    lastInsets.bottom = insets.bottom
    lastInsets.left = insets.left
    lastInsets.right = insets.right
    dpr = nextDpr
    cssW = w
    cssH = h
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (ctx) ctx.imageSmoothingQuality = 'high'
    geom = computeArenaLayout(w, h, insets, CLEAN_FEED)
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const i = cellIndex(col, row)
        tileCX[i] = geom.board.x + (col + 0.5) * geom.tile
        tileCY[i] = geom.board.y + (row + 0.5) * geom.tile
      }
    }
    backdrop = null
    plate = null
    motesSeeded = false
    clearRamps()
    // Whatever the loader baked at its guessed size, the real tile may want a
    // different bucket: queue the difference and let the frames drain it.
    primePebbleSprites(geom.tile, labels ? labels.level(2) : primedLabel, lastSkin ?? STARTING_SKIN)
  }

  const stopTierWatch = watch(renderScaleTier, () => { if (lastArgs) resize(...lastArgs) })
  // One painting arrived: drop only the bakes made from it (`dropBakesFor`,
  // PERF-LEDGER 2026-09-10). Dropping everything per arrival re-baked the
  // whole scene once per painting through the first seconds of play.
  const offArt = onArtChanged((change) => {
    if (!change) {
      // The flag flipped or the probes were refreshed: anything may have
      // changed, so everything goes.
      backdrop = null
      plate = null
      // A painted stone replaces a drawn one only if the drawn one is dropped.
      invalidateSprites()
      primePebbleSprites(geom.tile, labels ? labels.level(2) : primedLabel, lastSkin ?? STARTING_SKIN)
      return
    }
    const held = dropBakesFor(change.kind, change.id)
    if (held.backdrop) backdrop = null
    if (held.plate) plate = null
  })

  const invalidate = (): void => {
    invalidateSprites()
    backdrop = null
    plate = null
    clearRamps()
  }

  /**
   * ─── The face has to land before anything bakes text ────────────────────
   *
   * Several sprites have words baked into them — the level crest on a pebble,
   * the reroll chip's caption. A bake freezes whatever face `ctx.font` resolved
   * to at that moment, and nothing here ever re-made one, so a sprite baked in
   * the window before `Angry` finished downloading kept the sans-serif fallback
   * for the entire session. On a warm cache the race is usually won; on a cold
   * first load over a slow connection — which is every portal's first
   * impression — it frequently was not.
   *
   * So: when the font finishes loading, drop the bakes once and let them be
   * re-made against the real face. `document.fonts.ready` settles once and
   * costs nothing afterwards, and on a browser without the Font Loading API
   * this is simply skipped, which is the behaviour that shipped until now.
   */
  let fontsSettled = false
  try {
    void document.fonts?.ready.then(() => {
      // A late resolve after the scene is gone must not resurrect anything.
      if (fontsSettled || disposed) return
      fontsSettled = true
      // Only the SPRITES — not the backdrop or the plate. Neither of those has
      // a word in it, and dropping the backdrop would buy a full-screen re-bake
      // and three `getImageData` readbacks to fix a font it never used.
      invalidateSprites()
      primePebbleSprites(geom.tile, labels ? labels.level(2) : primedLabel, lastSkin ?? STARTING_SKIN)
    })
  } catch {
    // No Font Loading API — the bakes stand as they always did.
  }

  // ── Bakes bound to this canvas' size ──

  /**
   * The average colour of an image's LAST row, or null if it cannot be read.
   * Both backdrop layers continue downwards past where their file ends — the
   * ridge's rock to the bottom of the screen, the sky's night under a tall
   * phone — and both must continue in the painting's own colour rather than a
   * constant that was right for the drawing.
   *
   * Sixteen samples across the row, averaged, and not the one pixel in the
   * middle: on the ridge that pixel can land on an ink line, and then the
   * whole floor under the screen goes black.
   */
  const bottomColourOf = (img: HTMLImageElement): string | null => {
    const n = 16
    const probe = makeCanvas(n, 1, 1)
    if (!probe) return null
    const [, p] = probe
    try {
      p.drawImage(img, 0, img.naturalHeight - 1, img.naturalWidth, 1, 0, 0, n, 1)
      const px = p.getImageData(0, 0, n, 1).data
      let r = 0
      let g = 0
      let bl = 0
      let seen = 0
      for (let i = 0; i < n; i++) {
        if ((px[i * 4 + 3] ?? 0) <= 8) continue
        r += px[i * 4]!
        g += px[i * 4 + 1]!
        bl += px[i * 4 + 2]!
        seen++
      }
      return seen ? `rgb(${Math.round(r / seen)},${Math.round(g / seen)},${Math.round(bl / seen)})` : null
    } catch {
      // A tainted canvas (cross-origin art) — the caller's constant stands.
      return null
    }
  }

  const bakeBackdrop = (): void => {
    const made = makeCanvas(cssW, cssH, dpr)
    if (!made) return
    const [c, b] = made
    /**
     * The sky. A painting when there is one, the painter otherwise.
     *
     * FIT THE WIDTH, anchor the top, and continue the last row downwards —
     * never cover-fit. The sky is authored 16:9 and a phone is around 9:16, so
     * covering scales it by two and a half and shows the middle third: the
     * moon, the aurora and every star worth painting are outside that crop,
     * and the player gets a plain dark rectangle. Fitting the width keeps the
     * whole picture, and what is left under it is the sky's own bottom colour,
     * which the painting fades to anyway.
     */
    const sky = spriteFor('bg', 'sky')
    if (sky?.naturalWidth) {
      const dh = cssW * (sky.naturalHeight / sky.naturalWidth)
      b.drawImage(sky, 0, 0, cssW, dh)
      if (dh < cssH) {
        b.fillStyle = bottomColourOf(sky) ?? '#05070f'
        b.fillRect(0, dh - 1, cssW, cssH - dh + 1)
      }
    } else paintSky(b, cssW, cssH)
    // A soft glow behind the board.
    const bx = geom.board.x + geom.board.w / 2
    const by = geom.board.y + geom.board.h / 2
    const glow = b.createRadialGradient(bx, by, geom.board.w * 0.2, bx, by, geom.board.w * 0.95)
    glow.addColorStop(0, rgba('#7a5cff', 0.2))
    glow.addColorStop(1, rgba('#7a5cff', 0))
    b.fillStyle = glow
    b.fillRect(0, 0, cssW, cssH)
    // The ridges, behind the board's top edge.
    const far = spriteFor('bg', 'ridge-far')
    const near = spriteFor('bg', 'ridge-near')
    const horizon = geom.frame.y + geom.tile * 0.6
    const rw = Math.max(cssW * 1.15, geom.board.w * 1.8)
    /**
     * A ridge painting is sky-keyed on top and solid ground below, and it
     * ends where the file ends — a hard band across the backdrop. The ground
     * has to go on to the bottom of the canvas, and how it goes on is the
     * whole difference between rock and a rendering fault:
     *
     *   • a flat fill in the file's bottom colour left a hard seam right
     *     across the viewport — textured rock above, one colour below;
     *   • the band's bottom eighth STRETCHED to the bottom of the screen
     *     smeared every brushstroke into a vertical streak, hundreds of pixels
     *     long on a desktop and most of a phone's lower half. Players read it
     *     as a badly tiled texture, and they were right to;
     *   • the lower rock MIRRORED down, flip after flip, joined without a
     *     seam — but every diagonal ink line met its own reflection at the
     *     join and the ground came out printed with chevrons.
     *
     * So the file's edge is never shown at all. Under the band goes a floor
     * in the rock's own average colour; over the band's foot goes ONE copy of
     * its lower third (rock all the way across, clear of the menhirs and the
     * spires), at the painting's scale, feathered at both ends. Where the
     * file stops, the copy is fully opaque, so there is no edge to see; above
     * that it dissolves into the band, below it dissolves into the floor, and
     * the shadow fade after both bands takes the floor down into darkness.
     * Nothing is stretched, nothing repeats, nothing is reflected.
     */
    const ground = (img: HTMLImageElement, x: number, y: number, w: number, h: number, alpha: number): void => {
      b.globalAlpha = alpha
      b.drawImage(img, x, y, w, h)
      const foot = y + h
      if (foot >= cssH) return
      b.fillStyle = bottomColourOf(img) ?? '#0a0e22'
      b.fillRect(x, foot - 1, w, cssH - foot + 1)
      const sh = Math.max(1, Math.floor(img.naturalHeight / 3))
      const dh = h * (sh / img.naturalHeight)
      const made = makeCanvas(w, dh, dpr)
      if (!made) return
      const [copy, k] = made
      // Slid sideways and wrapped, so the marks in the copy do not sit right
      // under the same marks in the band and ghost twice through the dissolve.
      const slide = Math.round(w * 0.37)
      k.drawImage(img, 0, img.naturalHeight - sh, img.naturalWidth, sh, -slide, 0, w, dh)
      k.drawImage(img, 0, img.naturalHeight - sh, img.naturalWidth, sh, w - slide, 0, w, dh)
      // Opaque across the middle, where it straddles the file's last row.
      k.globalCompositeOperation = 'destination-in'
      const feather = k.createLinearGradient(0, 0, 0, dh)
      feather.addColorStop(0, 'rgba(0,0,0,0)')
      feather.addColorStop(0.42, 'rgba(0,0,0,1)')
      feather.addColorStop(0.62, 'rgba(0,0,0,1)')
      feather.addColorStop(1, 'rgba(0,0,0,0)')
      k.fillStyle = feather
      k.fillRect(0, 0, w, dh)
      b.drawImage(copy, x, foot - dh / 2, w, dh)
    }
    /**
     * The drawn ridge, into the SAME rect the painting would be blitted into,
     * and its rock continued to the bottom in its own base colour. The two
     * paths shared nothing before — the fallback drew its own hills against
     * `horizon` — so switching the art layer moved the skyline, which is the
     * one thing an A/B must never do.
     */
    const drawnRidge = (layer: 'far' | 'near', x: number, y: number, w: number, h: number, alpha: number): void => {
      b.globalAlpha = alpha
      b.save()
      b.translate(x, y)
      paintRidge(b, w, h, layer)
      b.restore()
      // The drawn band's own rock colour, continued the same way.
      b.fillStyle = layer === 'far' ? '#101838' : '#0a0e22'
      b.fillRect(x, y + h - 1, w, cssH - (y + h) + 1)
    }
    // The band is authored 4:1, so the drawn one is measured the same way and
    // neither path can drift from the other.
    const bandH = (img: HTMLImageElement | null): number =>
      rw * (img?.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.25)
    /**
     * Both bands are placed by their OWN skyline and drawn OPAQUE.
     *
     * They used to be blitted at half alpha, at an offset that predates this
     * art: the far band at 0.85 of its height above the horizon, the near one
     * at 0.6. With a skyline at 0.46 / 0.34 of the band that lifted the rock a
     * third of a band into the sky, and at 50 % alpha the stars came through
     * it — which on a desktop reads as a blur smeared across the viewport
     * rather than as a mountain. Rock is opaque; the haze in front of a distant
     * ridge belongs in the painting, and the prompt asks for it.
     */
    {
      const rh = bandH(far)
      const x = cssW / 2 - rw / 2
      const y = horizon - rh * RIDGE_SKYLINE.far
      if (far) ground(far, x, y, rw, rh, 1)
      else drawnRidge('far', x, y, rw, rh, 1)
    }
    const nearH = bandH(near)
    const nearFoot = horizon - nearH * RIDGE_SKYLINE.near + nearH
    {
      const x = cssW / 2 - rw / 2
      const y = nearFoot - nearH
      if (near) ground(near, x, y, rw, nearH, 1)
      else drawnRidge('near', x, y, rw, nearH, 1)
    }
    b.globalAlpha = 1
    {
      /**
       * …and let the ground fall into the deep bottom, so the board's own
       * shadow reads over darkness rather than over a flat plate.
       *
       * Keyed to where the near band's FILE ends, not spread evenly from the
       * horizon to the screen's foot: half dark at that line, so the rock is
       * already sinking where its feathered copy takes over, and near-black
       * most of a band's height further down, so the floor under it reads as
       * depth rather than as a flat plate. Spread evenly, that line sat at
       * about half strength on a desktop and about a seventh on a phone —
       * right where the eye was already looking.
       */
      const span = Math.max(1, cssH - horizon)
      const at = (py: number): number => Math.min(1, Math.max(0, (py - horizon) / span))
      const fade = b.createLinearGradient(0, horizon, 0, cssH)
      fade.addColorStop(0, rgba('#05070f', 0))
      fade.addColorStop(at(nearFoot), rgba('#05070f', 0.5))
      fade.addColorStop(Math.max(at(nearFoot), at(nearFoot + nearH * 0.8)), rgba('#05070f', 0.86))
      fade.addColorStop(1, rgba('#05070f', 0.9))
      b.fillStyle = fade
      b.fillRect(0, horizon, cssW, cssH - horizon)
    }
    // Vignette.
    const v = b.createRadialGradient(cssW / 2, cssH * 0.45, Math.min(cssW, cssH) * 0.35, cssW / 2, cssH * 0.5, Math.max(cssW, cssH) * 0.75)
    v.addColorStop(0, rgba('#000000', 0))
    v.addColorStop(1, rgba('#000000', 0.55))
    b.fillStyle = v
    b.fillRect(0, 0, cssW, cssH)
    backdrop = c
  }

  const bakePlate = (): void => {
    const f = geom.frame
    const made = makeCanvas(f.w, f.h, dpr)
    if (!made) return
    const [c, b] = made
    const tile = geom.tile
    const pad = geom.board.x - f.x
    const painted = spriteFor('tile', 'frame')
    if (painted) b.drawImage(painted, 0, 0, f.w, f.h)
    else paintBoardFrame(b, f.w, f.h)
    // Mortar.
    b.fillStyle = '#0c0f1e'
    b.fillRect(pad, pad, geom.board.w, geom.board.h)
    // Tiles: one baked slate, with its own cracks per cell so the floor is not wallpaper.
    const stone = tileSprite('neutral', null, tile, bakeDpr())
    let s = seedFrom(97)
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const x = pad + col * tile
        const y = pad + row * tile
        if (stone) b.drawImage(stone, x, y, tile, tile)
        const inset = tile * 0.05
        b.save()
        roundRect(b, x + inset, y + inset, tile - 2 * inset, tile - 2 * inset, tile * 0.1)
        b.clip()
        b.strokeStyle = rgba('#000000', 0.3)
        b.lineWidth = Math.max(1, tile * 0.012)
        const [nc, s1] = rand(s); s = s1
        const cracks = 1 + Math.floor(nc * 2)
        for (let k = 0; k < cracks; k++) {
          const [ax, s2] = rand(s); s = s2
          const [ay, s3] = rand(s); s = s3
          let px = x + inset + ax * (tile - 2 * inset)
          let py = y + inset + ay * (tile - 2 * inset)
          b.beginPath()
          b.moveTo(px, py)
          for (let seg = 0; seg < 4; seg++) {
            const [dx, s4] = rand(s); s = s4
            const [dy, s5] = rand(s); s = s5
            px += (dx - 0.5) * tile * 0.3
            py += (dy - 0.5) * tile * 0.3
            b.lineTo(px, py)
          }
          b.stroke()
        }
        b.restore()
      }
    }
    plate = c
  }

  const seedMotes = (): void => {
    let s = seedFrom(1234)
    for (let i = 0; i < MOTES; i++) {
      const [a, s1] = rand(s); s = s1
      const [b2, s2] = rand(s); s = s2
      const [c2, s3] = rand(s); s = s3
      const [d, s4] = rand(s); s = s4
      mx[i] = a * cssW
      my[i] = b2 * cssH
      mvx[i] = (c2 - 0.5) * 6
      mvy[i] = -4 - d * 8
      msz[i] = 1 + c2 * 2
      mph[i] = d * Math.PI * 2
      mcol[i] = i % MOTE_COLORS.length
    }
    motesSeeded = true
  }

  // ── Helpers that draw ──

  const drawText = (
    text: string, x: number, y: number, px: number, fill: string,
    align: CanvasTextAlign = 'center', outline = true, alpha = 1
  ): void => {
    if (!ctx || alpha <= 0.01 || CLEAN_FEED) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = font(px)
    ctx.textAlign = align
    ctx.textBaseline = 'middle'
    if (outline) {
      ctx.lineJoin = 'round'
      ctx.lineWidth = Math.max(1.5, px * 0.16)
      ctx.strokeStyle = rgba('#000000', 0.85)
      ctx.strokeText(text, x, y)
    }
    ctx.fillStyle = fill
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  /** The level a pebble dropped on `cell` would have: the rune there + 1 (capped), or 1 on an empty tile. */
  const targetLevel = (board: BoardState, cell: Cell | null): number => {
    if (!cell) return 1
    const id = board.tiles[cellIndex(cell.col, cell.row)]?.runeId
    const under = id != null ? board.runes[id] : undefined
    return under ? Math.min(MAX_LEVEL, under.level + 1) : 1
  }

  const pebbleSprite = (type: RuneType, level: number, side: Side, skin: SkinId, faction: Faction | null, size: number): HTMLCanvasElement | null => {
    const key = pebbleKey(type, level, tintKey(side, skin, faction), size)
    const hit = pebbleCache.get(key)
    if (hit) return hit
    const label = labels ? labels.level(level) : `Lv.${level}`
    return bakePebble(type, level, side, skin, faction, key, Math.round(size), bakeDpr(), label)
  }

  /**
   * The upright crest that goes over a turned stone. `null` below Lv 2 — there
   * is none.
   *
   * Baked on DEMAND, unlike the stones, which are all primed before the first
   * frame. Priming these too would be sixty more canvases — every rune, in
   * every tint — held from boot for a plaque nobody sees until they merge
   * something, on the device least able to spare the memory. One small bake at
   * the moment of a merge is hidden inside the merge's own effect.
   */
  const ornamentSprite = (type: RuneType, level: number, side: Side, skin: SkinId, faction: Faction | null, size: number): HTMLCanvasElement | null => {
    if (level < 2) return null
    const key = pebbleKey(type, level, tintKey(side, skin, faction), size)
    const hit = ornamentCache.get(key)
    if (hit) return hit
    const label = labels ? labels.level(level) : `Lv.${level}`
    return bakeCrest(type, level, side, skin, faction, key, Math.round(size), bakeDpr(), label)
  }

  /**
   * Blit a pebble centred at (x, y), `size` = the tile it was baked for.
   *
   * `spin` turns the stone about its own centre — the angle from
   * `glyphSpin`, so the glyph on it ends up pointing the way the rune fires.
   * Zero for everything that does not face anywhere, and the untransformed
   * path is kept for that case because it is nearly every blit on the board.
   */
  const blitPebble = (
    sprite: HTMLCanvasElement | null, x: number, y: number, size: number, sx = 1, sy = 1, alpha = 1, spin = 0
  ): void => {
    if (!ctx || !sprite) return
    const w = size * PEBBLE_PAD * sx
    const h = size * PEBBLE_PAD * sy
    if (spin === 0) {
      if (alpha < 1) ctx.globalAlpha = alpha
      ctx.drawImage(sprite, x - w / 2, y - h / 2, w, h)
      if (alpha < 1) ctx.globalAlpha = 1
      return
    }
    ctx.save()
    if (alpha < 1) ctx.globalAlpha = alpha
    ctx.translate(x, y)
    ctx.rotate(spin)
    ctx.drawImage(sprite, -w / 2, -h / 2, w, h)
    ctx.restore()
  }

  /**
   * A stone and its Lv 2 finery in one call: the stone and its wreath turned
   * to the facing together, the crest left level over the top.
   */
  const blitRuneStone = (
    type: RuneType, level: number, side: Side, skin: SkinId, faction: Faction | null,
    x: number, y: number, size: number, spin: number, sx = 1, sy = 1, alpha = 1
  ): void => {
    blitPebble(pebbleSprite(type, level, side, skin, faction, size), x, y, size, sx, sy, alpha, spin)
    blitPebble(ornamentSprite(type, level, side, skin, faction, size), x, y, size, sx, sy, alpha)
  }

  const drawShadow = (x: number, y: number, size: number, sx = 1, alpha = 0.42): void => {
    if (!ctx) return
    ctx.fillStyle = rgba('#000000', alpha)
    ctx.beginPath()
    ctx.ellipse(x, y + size * 0.3, size * 0.4 * sx, size * 0.13 * sx, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawArrowAt = (x: number, y: number, dir: Dir, color: string, size: number, alpha = 1, scale = 1): void => {
    if (!ctx || dir === 'omni') return
    const spr = arrowSprite(color, size, dpr)
    if (!spr) return
    const side = size * ARROW_DRAW * scale
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(x, y)
    ctx.rotate(dirAngle(dir) + Math.PI / 2)
    ctx.drawImage(spr, -side / 2, -side / 2, side, side)
    ctx.restore()
  }

  /** Emit a particle in CSS space (the pool's y is flipped). */
  const spark = (
    x: number, y: number, vx: number, vy: number, life: number, size: number,
    color: string, opts?: { additive?: boolean; shape?: 0 | 1 | 2 | 3; gravity?: number; drag?: number; alpha?: number; vrot?: number }
  ): void => {
    const [r, g, b] = hexRgb(color)
    emitParticle({
      x, y: -y, vx, vy: -vy, life, size, color: [r, g, b],
      additive: opts?.additive ?? true, shape: opts?.shape ?? 0,
      gravity: opts?.gravity ?? 0, drag: opts?.drag ?? 0, alpha: opts?.alpha ?? 1,
      rot: Math.random() * Math.PI, vrot: opts?.vrot ?? 0
    })
  }

  const qualityMul = (): number => {
    const q = qualityTier()
    return q === 'high' ? 1 : q === 'medium' ? 0.6 : q === 'low' ? 0.35 : 0.2
  }

  /**
   * How much of an effect the tier affords: 2 = everything, 1 = `low` (no
   * trails, no crackle, no halo passes), 0 = `min` (baked sprites only — no
   * per-frame strokes beyond the pieces themselves).
   */
  const fxQ = (): 0 | 1 | 2 => {
    const q = qualityTier()
    return q === 'min' ? 0 : q === 'low' ? 1 : 2
  }

  // Scratch for the painters that take a list of points: filled per frame,
  // never reallocated (the frame path allocates nothing).
  const cellScratch: { x: number; y: number }[] = Array.from({ length: 24 }, () => ({ x: 0, y: 0 }))
  /**
   * Runes a nuke vaporised in THIS resolution.
   *
   * Their `shatter` events arrive as usual, one per stone, and each of those
   * would normally fire its own shake, its own cue and a full particle burst.
   * Fifteen of them inside one 280 ms window is a particle storm, a shake that
   * never settles and fifteen stacked copies of the same sound. So a stone in
   * this set shatters QUIETLY: the nuke's own flash, ring, shake and voice are
   * the event, and the stones only have to be seen going. Cleared per timeline.
   */
  const nukedIds = new Set<number>()
  /** How much of a normal shatter burst a nuked stone gets. */
  const NUKED_SHATTER_SCALE = 0.35

  /** The stone colour a rune's shards are cut from. */
  const stoneOf = (r: RuneSnapshot): string =>
    r.side === 'player' ? (SKINS[lastSkin ?? 'river'] ?? SKINS.river).base : ENEMY_STONE.base
  /** …and the ink its glyph was carved in. */
  const inkOf = (r: RuneSnapshot): string =>
    r.side === 'player' ? (SKINS[lastSkin ?? 'river'] ?? SKINS.river).ink : ENEMY_STONE.ink

  /**
   * A soft glow around a rounded rectangle, baked once per size and colour:
   * six strokes of widening width and thinning alpha, which reads as a blur
   * and costs nothing per frame. For the sudden-death frame.
   */
  const frameGlows = new Map<string, HTMLCanvasElement | null>()
  const frameGlowSprite = (w: number, h: number, color: string): HTMLCanvasElement | null => {
    const key = `${Math.round(w)}x${Math.round(h)}|${color}`
    const hit = frameGlows.get(key)
    if (hit !== undefined) return hit
    const pad = Math.ceil(geom.tile * 0.5)
    const made = makeCanvas(w + pad * 2, h + pad * 2, bakeDpr())
    let out: HTMLCanvasElement | null = null
    if (made) {
      const [c, t] = made
      t.lineJoin = 'round'
      for (let i = 6; i >= 1; i--) {
        t.globalAlpha = 0.16 - i * 0.02
        t.strokeStyle = color
        t.lineWidth = geom.tile * 0.06 + i * geom.tile * 0.07
        roundRect(t, pad, pad, w, h, geom.tile * 0.2)
        t.stroke()
      }
      t.globalAlpha = 0.9
      t.lineWidth = geom.tile * 0.06
      roundRect(t, pad, pad, w, h, geom.tile * 0.2)
      t.stroke()
      out = c
    }
    if (frameGlows.size >= 6) frameGlows.clear()
    frameGlows.set(key, out)
    return out
  }



  const floatText = (x: number, y: number, text: string, color: string, size: number, crit = false, life = 900): void => {
    emitText({ x, y, vy: -size * 0.7, life, text, color, size, crit })
  }

  // ── Board access ──

  const cx = (col: number, row: number): number => tileCX[cellIndex(col, row)]!
  const cy = (col: number, row: number): number => tileCY[cellIndex(col, row)]!

  const putRune = (b: BoardState, r: RuneSnapshot): void => {
    b.runes[r.id] = { ...r }
    const t = b.tiles[cellIndex(r.col, r.row)]
    if (t) { t.runeId = r.id; t.owner = r.side; t.faction = r.faction }
    rebuildRuneList()
  }
  const removeRune = (b: BoardState, id: number): void => {
    const r = b.runes[id]
    if (!r) return
    delete b.runes[id]
    const t = b.tiles[cellIndex(r.col, r.row)]
    if (t && t.runeId === id) t.runeId = null
    rebuildRuneList()
  }
  const moveRune = (b: BoardState, id: number, to: Cell): void => {
    const r = b.runes[id]
    if (!r) return
    const from = b.tiles[cellIndex(r.col, r.row)]
    if (from && from.runeId === id) from.runeId = null
    r.col = to.col
    r.row = to.row
    const t = b.tiles[cellIndex(to.col, to.row)]
    if (t) { t.runeId = id; t.owner = r.side; t.faction = r.faction }
    rebuildRuneList()
  }
  const setHp = (b: BoardState, id: number, hp: number): void => {
    const r = b.runes[id]
    if (r) r.hp = hp
  }

  const cloneLocal = (b: BoardState): BoardState => ({
    tiles: b.tiles.map((t) => ({ ...t })),
    runes: Object.fromEntries(Object.entries(b.runes).map(([id, r]) => [id, { ...r }])),
    nextRuneId: b.nextRuneId
  })

  // ── Timeline ──

  const initTimeline = (tl: NonNullable<ArenaView['timeline']>): void => {
    local = cloneLocal(tl.before)
    if (stages.length < tl.events.length) stages = new Uint8Array(tl.events.length + 16)
    stages.fill(0)
    lastEmitAt = 0
    nukedIds.clear()
    disp = local
    dispSource = tl.before
    rebuildRuneList()
    // Carry breathing phases; the offsets start clean.
    for (const v of vis.values()) { v.ox = 0; v.oy = 0; v.sx = 1; v.sy = 1; v.alpha = 1; v.flash = 0; v.crack = 0; v.shield = 0 }
  }

  const hitColor = (h: Hit): string => (h.amount >= 4 ? '#ffd75e' : h.amount > 0 ? '#ffffff' : SHIELD_COLOR)

  // ── The rune modules' door (see `runeFx/types.ts`) ──
  //
  // ONE object for the session. `syncFxApi` rewrites its fields at the top of
  // every frame, so handing an event to a module allocates nothing. Modules
  // own the look and the sound; everything that is a FACT of the match (HP,
  // numbers, the stone a crown turns, where a knockback lands) stays here.
  const fxApi = {
    ctx: ctx as CanvasRenderingContext2D,
    size: 1,
    tier: 2 as 0 | 1 | 2,
    mul: 1,
    canEmit: false,
    now: 0,
    board: { x: 0, y: 0, w: 1, h: 1 },
    scratch: cellScratch,
    cx: (col: number, row: number): number => cx(col, row),
    cy: (col: number, row: number): number => cy(col, row),
    pose: (id: number, ox: number, oy: number, sx?: number, sy?: number): void => {
      const v = getVis(id)
      v.ox = ox
      v.oy = oy
      if (sx !== undefined) v.sx = sx
      if (sy !== undefined) v.sy = sy
    },
    flash: (id: number, k: number): void => {
      const v = getVis(id)
      if (k > v.flash) v.flash = k
    },
    shake: (kind: 'small' | 'strong' | 'big'): void => triggerShake(kind),
    sound: (id: FxSound, power: number, at?: SoundAt): void => {
      // Where on the board it happens, as a stereo pan: a bow on the left
      // twangs from the left. Kept inside ±0.8 so nothing is only in one ear.
      const b = geom.board
      const pan = at?.x === undefined
        ? 0
        : Math.max(-0.8, Math.min(0.8, ((at.x - (b.x + b.w / 2)) / Math.max(1, b.w / 2)) * 0.65))
      playFx(id, power, { pan, level: at?.level ?? 1, side: at?.side })
    },
    sideColor,
    stoneOf,
    inkOf,
    art: (kind: ArtKind, id: string): HTMLImageElement | null => spriteFor(kind, id)
  }
  const api: FxApi = fxApi
  const syncFxApi = (): void => {
    fxApi.size = geom.tile
    fxApi.tier = fxQ()
    fxApi.mul = qualityMul()
    fxApi.now = now
    fxApi.canEmit = now - lastEmitAt > 24
    const b = geom.board
    fxApi.board.x = b.x
    fxApi.board.y = b.y
    fxApi.board.w = b.w
    fxApi.board.h = b.h
  }

  // ── The warm-up: each rune's sprites baked during planning, not on the
  // first frame its effect plays (`runeFx/warm.ts`). One rune per idle slice,
  // once per tile-size bucket and tier.
  //
  // Loaded LAZILY: it plays the FX scenarios, which import the resolver — a
  // static import here would pull the whole domain into the boot chunk (the
  // renderer is on the eager path) for something that runs during planning.
  let warmQueue: RuneType[] = []
  let warmKey = ''
  let warmMod: typeof import('@/use/runeFx/warm') | null = null
  let warmLoading = false
  const pumpWarm = (): void => {
    if (disposed || warmQueue.length === 0) return
    if (!warmMod) {
      if (warmLoading) return
      warmLoading = true
      void import('@/use/runeFx/warm')
        .then((m) => { warmMod = m; pumpWarm() })
        .catch(() => { warmLoading = false })
      return
    }
    const run = (): void => {
      if (disposed) return
      const t = warmQueue.shift()
      if (t && warmMod) warmMod.warmRune(t, geom.tile, fxQ(), qualityMul())
      pumpWarm()
    }
    const idle = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (typeof idle === 'function') idle(run, { timeout: 2000 })
    else setTimeout(run, 80)
  }
  const scheduleWarm = (): void => {
    if (!ctx) return
    const key = `${bucketFor(geom.tile)}|${fxQ()}`
    if (key === warmKey) return
    warmKey = key
    const idle = warmQueue.length === 0
    warmQueue = RUNE_TYPES.slice()
    if (idle) pumpWarm()
  }

  /**
   * The FACTS of a set of hits: HP, the white flash, the shield tint, the
   * number. The look of each blow belongs to the attacker's module (`impact`);
   * a hit a shield ate — in part or whole — is also handed to the SHIELD's
   * module (`absorb`), whoever threw it.
   */
  const applyHits = (hits: Hit[], size: number, flash = 1): void => {
    if (!local) return
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i]!
      const x = cx(h.target.col, h.target.row)
      const y = cy(h.target.col, h.target.row)
      setHp(local, h.target.id, h.hpAfter)
      const v = getVis(h.target.id)
      // A blow the shield ate WHOLE barely touches the stone: the dome is the
      // moment, and a full white flash under it would wash it out.
      v.flash = Math.max(v.flash, h.amount === 0 ? Math.min(flash, 0.35) : flash)
      if (h.absorbed > 0) v.shield = 1
      if (h.absorbed > 0 || h.amount === 0) RUNE_FX.defense.absorb?.(h, x, y, api)
      if (h.amount > 0) {
        floatText(x, y - size * 0.3, `-${h.amount}`, hitColor(h), size * (h.amount >= 4 ? 0.34 : 0.26), h.amount >= 4)
      } else {
        floatText(x, y - size * 0.3, `0`, SHIELD_COLOR, size * 0.22)
      }
    }
  }

  const eventCenter = (e: ResolveEvent): [number, number] => {
    switch (e.kind) {
      case 'clash': case 'capture': return [cx(e.col, e.row), cy(e.col, e.row)]
      case 'explode': return [cx(e.center.col, e.center.row), cy(e.center.col, e.center.row)]
      case 'combo': return [geom.board.x + geom.board.w / 2, geom.board.y + geom.board.h / 2]
      // Every event that names its actor as `from` — the nuke's origin is the
      // tile the nuker landed on, which is where its ring starts.
      case 'aura': case 'shot': case 'nuke': return [cx(e.from.col, e.from.row), cy(e.from.col, e.from.row)]
      // The crown's beat starts on the crown's own tile and travels to the
      // stone it takes; `startEvent` draws the second half itself.
      case 'crown': return [cx(e.from.col, e.from.row), cy(e.from.col, e.from.row)]
      case 'heal': case 'buff': return [cx(e.to.col, e.to.row), cy(e.to.col, e.to.row)]
      case 'knockback': return [cx(e.from.col, e.from.row), cy(e.from.col, e.from.row)]
      default: return [cx(e.rune.col, e.rune.row), cy(e.rune.col, e.rune.row)]
    }
  }

  const startEvent = (e: ResolveEvent, view: ArenaView): void => {
    if (!local) return
    const size = geom.tile
    const [x, y] = eventCenter(e)
    // The rune events: the FACTS first, then the owner's look and sound.
    const owner = ownerOf(e)
    if (owner) {
      switch (e.kind) {
        case 'aura':
          for (const to of e.to) {
            const r = local.runes[to.id]
            if (r) r.shield = to.shield
            getVis(to.id).shield = 1
          }
          break
        case 'buff': {
          const r = local.runes[e.to.id]
          if (r) r.atkBonus = e.bonus
          break
        }
        case 'nuke':
          // Remember who the blast took, so their own shatters stay quiet.
          for (let i = 0; i < e.vaporised.length; i++) nukedIds.add(e.vaporised[i]!.id)
          break
        case 'crown': {
          // The stone changes hands HERE, on the local board the resolution is
          // drawn from, so the pebble is re-cut in its new owner's colours in
          // front of the player rather than after the dust settles.
          putRune(local, e.turned)
          const v = getVis(e.turned.id)
          v.sx = 1.35; v.sy = 1.35; v.flash = 0.9
          break
        }
        default:
          break
      }
      RUNE_FX[owner].start?.(e as RuneEvent, api)
      return
    }
    switch (e.kind) {
      case 'place': {
        putRune(local, e.rune)
        const v = getVis(e.rune.id)
        v.sx = 1.6; v.sy = 1.6; v.alpha = 0
        break
      }
      case 'merge':
      case 'clash':
        // Both are drawn by the continuous pass until their impact.
        break
      case 'shatter':
        getVis(e.rune.id).crack = 1
        break
      case 'capture':
        if (e.owner !== 'neutral') {
          spawnCaptureSparks(x, y, size, ownerColor(e.owner, e.faction))
          playFx('capture', e.owner === 'player' ? 0.8 : 0.5)
        }
        break
      case 'combo':
        floatText(x, y - size * 0.2, view.labels.combo(e.count), GOLD, size * 0.5, true, 1300)
        spawnImpactSparks(x, y, size, GOLD, -Math.PI / 2, 40)
        spawnMergeFountain(x, y + size * 0.3, size, GOLD, 30)
        triggerShake('strong')
        playFx('combo', Math.min(1, e.count / 4))
        break
      default:
        break
    }
  }

  const impactEvent = (e: ResolveEvent): void => {
    if (!local) return
    const size = geom.tile
    const [x, y] = eventCenter(e)
    const owner = ownerOf(e)
    if (owner) {
      // The FACTS of the blow, then the owner's look and sound.
      switch (e.kind) {
        case 'shot':
          applyHits(e.hits, size)
          // An arrow, a beam or a blade that stopped ON a shield stone: the
          // shield draws the wall, whoever threw it.
          if (intercepted(e)) {
            const last = e.path[e.path.length - 1]
            RUNE_FX.defense.interceptImpact?.(e, last ? cx(last.col, last.row) : x, last ? cy(last.col, last.row) : y, api)
          }
          break
        case 'explode':
          // Softer: five stones going white at once would drown the orb's
          // violet pillars for three frames.
          applyHits(e.hits, size, 0.6)
          break
        case 'nuke':
          applyHits(e.hits, size)
          break
        case 'heal':
          setHp(local, e.to.id, e.hpAfter)
          if (e.amount > 0) floatText(x, y - size * 0.35, `+${e.amount}`, HEAL_COLOR, size * 0.28)
          getVis(e.to.id).flash = 0.4
          break
        case 'knockback': {
          moveRune(local, e.rune.id, e.to)
          const v = getVis(e.rune.id)
          v.ox = 0; v.oy = 0; v.sx = 1; v.sy = 1
          break
        }
        default:
          break
      }
      RUNE_FX[owner].impact?.(e as RuneEvent, api)
      return
    }
    switch (e.kind) {
      case 'place':
        spawnTileDust(x, y, size, 5)
        playFx('place', e.rune.side === 'player' ? 0.9 : 0.6)
        break
      case 'merge': {
        putRune(local, e.rune)
        const v = getVis(e.rune.id)
        v.sx = 1.3; v.sy = 1.3; v.flash = 0.6
        spawnMergeFountain(x, y, size, GOLD)
        floatText(x, y - size * 0.45, labels ? labels.level(e.rune.level) : `Lv.${e.rune.level}`, GOLD, size * 0.34, true, 1100)
        triggerShake('small')
        playFx('merge', 1)
        break
      }
      case 'clash': {
        spawnImpactSparks(x, y, size, '#ffffff', -Math.PI / 2, 26)
        // Whichever stone broke leaves chips flying its own way.
        if (!e.survivor || e.survivor.id !== e.a.id) spawnChips(x, y, size, stoneOf(e.a), Math.PI, 6)
        if (!e.survivor || e.survivor.id !== e.b.id) spawnChips(x, y, size, stoneOf(e.b), 0, 6)
        floatText(x, y - size * 0.5, labels ? labels.clash : 'CLASH!', '#ffffff', size * 0.36, true, 1000)
        if (e.survivor) {
          putRune(local, e.survivor)
          const v = getVis(e.survivor.id)
          v.flash = 1; v.sx = 1.2; v.sy = 1.2
        }
        triggerShake('strong')
        playFx('clash', 1)
        break
      }
      case 'shatter': {
        const nuked = nukedIds.has(e.rune.id)
        removeRune(local, e.rune.id)
        vis.delete(e.rune.id)
        spawnShatter(
          e.rune.type, x, y, size, stoneOf(e.rune), inkOf(e.rune), RUNES[e.rune.type].color,
          nuked ? NUKED_SHATTER_SCALE : 1
        )
        emitDecal(x, y + size * 0.12, size * 0.34, 0.45)
        // A stone the nuke took makes no noise of its own and does not add to
        // the shake: the blast already did both, once, for all of them.
        if (!nuked) {
          triggerShake(e.rune.level >= 2 ? 'strong' : 'small')
          playFx('shatter', e.rune.level >= 2 ? 1 : 0.7)
        }
        break
      }
      case 'capture': {
        const t = local.tiles[cellIndex(e.col, e.row)]
        if (t) { t.owner = e.owner; t.faction = e.faction }
        break
      }
      default:
        break
    }
  }

  const processTimeline = (tl: NonNullable<ArenaView['timeline']>, view: ArenaView): void => {
    syncFxApi()
    const el = tl.elapsedMs
    const events = tl.events
    for (let i = 0; i < events.length; i++) {
      const e = events[i]!
      if (el < e.at) continue
      let st = stages[i]!
      if (st === STAGE_IDLE) { startEvent(e, view); st = STAGE_STARTED }
      const p = (el - e.at) / Math.max(1, e.dur)
      if (st === STAGE_STARTED && p >= impactFrac(e)) { impactEvent(e); st = STAGE_IMPACTED }
      if (st === STAGE_IMPACTED && p >= 1 + tailMs(e) / Math.max(1, e.dur)) st = STAGE_DONE
      stages[i] = st
    }
  }

  // ── Continuous effect drawing ──

  const drawBeam = (x0: number, y0: number, x1: number, y1: number, color: string, width: number, alpha: number): void => {
    if (!ctx || alpha <= 0.01) return
    paintBeam(ctx, x0, y0, x1, y1, width / 0.16, { color, env: alpha, phase: age * 0.001, seed: 11, lean: fxQ() < 2 })
  }

  const drawEvents = (tl: NonNullable<ArenaView['timeline']>): void => {
    if (!ctx) return
    const el = tl.elapsedMs
    const size = geom.tile
    const events = tl.events
    const fx = fxQ()
    const canEmit = now - lastEmitAt > 24
    for (let i = 0; i < events.length; i++) {
      const e = events[i]!
      if (el < e.at || stages[i] === STAGE_DONE) continue
      const praw = (el - e.at) / Math.max(1, e.dur)
      const p = clamp01(praw)
      const [x, y] = eventCenter(e)
      const owner = ownerOf(e)
      if (owner) {
        // The facts that MOVE stay here: where a knocked-back stone is, and
        // which stones a nuke's front has reached.
        // Only until the impact: `impactEvent` then MOVES the stone to `e.to`
        // and zeroes its pose, and an offset applied after that would draw it
        // a whole tile past where it now stands, for the rest of the tail.
        if (e.kind === 'knockback' && stages[i] === STAGE_STARTED) {
          const v = getVis(e.rune.id)
          const k = easeOutCubic(p)
          v.ox = (cx(e.to.col, e.to.row) - x) * k
          v.oy = (cy(e.to.col, e.to.row) - y) * k
          const squash = Math.sin(p * Math.PI) * 0.15
          v.sx = 1 + squash
          v.sy = 1 - squash
        } else if (e.kind === 'nuke') {
          // The front is what makes the wipe read as one blast travelling
          // rather than fifteen stones dying at once: a stone starts cracking
          // when the ring reaches ITS tile. Its own `shatter` finishes it off.
          // The curve is `runeFx/nuker.ts`'s own (an inhale, then the blast).
          const front = nukeFrontAt(p, size)
          for (let j = 0; j < e.vaporised.length; j++) {
            const r = e.vaporised[j]!
            const v = vis.get(r.id)
            if (!v) continue
            const d = Math.hypot(cx(r.col, r.row) - x, cy(r.col, r.row) - y)
            if (front >= d) v.crack = Math.max(v.crack, clamp01((front - d) / (size * 0.9)))
          }
        }
        RUNE_FX[owner].paint?.(e as RuneEvent, praw, api)
        // A projectile that stopped on a shield: the shield rings, whoever threw it.
        if (e.kind === 'shot' && intercepted(e)) {
          const ia = impactFrac(e)
          if (p >= ia) {
            const last = e.path[e.path.length - 1]
            const k = clamp01((p - ia) / Math.max(1e-6, 1 - ia))
            RUNE_FX.defense.interceptPaint?.(e, k, last ? cx(last.col, last.row) : x, last ? cy(last.col, last.row) : y, api)
          }
        }
        continue
      }
      switch (e.kind) {
        case 'place': {
          const v = getVis(e.rune.id)
          const k = easeOutBack(Math.min(1, p / 0.75))
          v.sx = lerp(1.6, 1, k); v.sy = v.sx
          v.alpha = clamp01(p / 0.2)
          v.oy = -size * 0.35 * (1 - easeOutCubic(Math.min(1, p / 0.7)))
          if (p >= 0.7 && fx > 0) paintLanding(ctx, (p - 0.7) / 0.3, x, y, size, sideColor(e.rune.side, e.rune.faction))
          break
        }
        case 'merge': {
          if (p < impactFrac(e)) {
            const k = easeOutCubic(p / impactFrac(e))
            const spr = pebbleSprite(e.rune.type, 1, e.rune.side, lastSkin ?? 'river', e.rune.faction, size)
            blitPebble(spr, x, y - size * 0.9 * (1 - k), size, lerp(1.4, 1, k), lerp(1.4, 1, k), clamp01(p * 4))
          } else {
            const k = clamp01((p - impactFrac(e)) / (1 - impactFrac(e)))
            const v = getVis(e.rune.id)
            v.sx = lerp(1.3, 1, easeOutBack(k)); v.sy = v.sx
            paintMergeRing(ctx, k, x, y, size, GOLD)
          }
          break
        }
        case 'clash': {
          if (p < impactFrac(e)) {
            const k = easeInOutQuad(p / impactFrac(e))
            const off = size * 0.45 * (1 - k)
            const sa = pebbleSprite(e.a.type, e.a.level, e.a.side, lastSkin ?? 'river', e.a.faction, size)
            const sb = pebbleSprite(e.b.type, e.b.level, e.b.side, lastSkin ?? 'river', e.b.faction, size)
            blitPebble(sa, x - off, y - size * 0.3 * (1 - k), size, 1.15, 1.15)
            blitPebble(sb, x + off, y - size * 0.3 * (1 - k), size, 1.15, 1.15)
          } else {
            const k = clamp01((p - impactFrac(e)) / (1 - impactFrac(e)))
            paintClashFlash(ctx, k, x, y, size)
          }
          break
        }
        case 'shatter': {
          if (p < impactFrac(e)) {
            const v = getVis(e.rune.id)
            v.crack = p / impactFrac(e)
            v.ox = (Math.random() - 0.5) * size * 0.05
            v.oy = (Math.random() - 0.5) * size * 0.05
          } else if (fx > 0) {
            const k = clamp01((p - impactFrac(e)) / (1 - impactFrac(e)))
            paintShockwave(ctx, k, x, y, size, RUNES[e.rune.type].color, 0.9)
          }
          break
        }
        case 'capture': {
          const color = ownerColor(e.owner, e.faction)
          paintCaptureWave(ctx, p, geom.tileRect(e.col, e.row), size, color, fx < 2)
          break
        }
        default:
          break
      }
    }
    if (canEmit) lastEmitAt = now
  }

  // ── Static layers ──

  const drawMotes = (dt: number): void => {
    if (!ctx) return
    const q = qualityTier()
    if (q === 'low' || q === 'min') return
    if (!motesSeeded) seedMotes()
    const dts = dt / 1000
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < MOTES; i++) {
      mx[i]! += mvx[i]! * dts
      my[i]! += mvy[i]! * dts
      if (my[i]! < -10) { my[i] = cssH + 10; mx[i] = Math.random() * cssW }
      if (mx[i]! < -10) mx[i] = cssW + 10
      if (mx[i]! > cssW + 10) mx[i] = -10
      const a = 0.12 + 0.12 * Math.sin(age * 0.0015 + mph[i]!)
      ctx.globalAlpha = a
      // Forty stroked paths a frame, and it stays that way: blitting a baked
      // dot instead measured WORSE here (+3.5 % draw time, 2/5 paired wins,
      // and two reps with 60-80 long tasks). See `PERF-LEDGER.md`,
      // `motes-path-legacy` — the second paths-to-blits swap this renderer has
      // rejected. `drawMotes` is skipped entirely below the `medium` tier, so
      // no struggling device pays this at all.
      ctx.fillStyle = MOTE_COLORS[mcol[i]!]!
      ctx.beginPath()
      ctx.arc(mx[i]!, my[i]!, msz[i]!, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  const drawStreakAura = (streak: number): void => {
    if (!ctx || streak < 2) return
    const level = streak >= 6 ? 3 : streak >= 4 ? 2 : 1
    const color = level === 3 ? GOLD : level === 2 ? '#9fd8ff' : '#7fb8ff'
    const spr = flameSprite(color, geom.tile * 0.55, dpr)
    if (!spr) return
    const f = geom.frame
    const n = 10 + level * 4
    const alpha = level === 3 ? 0.75 : level === 2 ? 0.55 : 0.35
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < n; i++) {
      // Along the bottom edge and up the two sides.
      const t = i / (n - 1)
      let x: number
      let y: number
      let rot: number
      if (t < 0.25) { x = f.x + f.w * 0.02; y = f.y + f.h * (1 - t * 2.8); rot = Math.PI / 2 }
      else if (t > 0.75) { x = f.x + f.w * 0.98; y = f.y + f.h * (1 - (1 - t) * 2.8); rot = -Math.PI / 2 }
      else { x = f.x + f.w * ((t - 0.25) * 2); y = f.y + f.h * 0.99; rot = 0 }
      const flick = 0.75 + 0.25 * Math.sin(age * 0.006 + i * 1.7) * Math.sin(age * 0.0037 + i * 0.6)
      const w = geom.tile * 0.55 * (0.8 + 0.2 * Math.sin(age * 0.004 + i))
      const h = geom.tile * (0.55 + level * 0.2) * flick
      ctx.globalAlpha = alpha * flick
      ctx.translate(x, y)
      ctx.rotate(rot)
      ctx.drawImage(spr, -w / 2, -h, w, h)
      ctx.rotate(-rot)
      ctx.translate(-x, -y)
    }
    ctx.restore()
  }

  const drawTiles = (board: BoardState, view: ArenaView): void => {
    if (!ctx) return
    const tile = geom.tile
    for (let i = 0; i < board.tiles.length; i++) {
      const t = board.tiles[i]!
      if (t.owner === 'neutral') continue
      const spr = tileSprite(t.owner, t.faction, tile, bakeDpr())
      if (!spr) continue
      ctx.drawImage(spr, geom.board.x + t.col * tile, geom.board.y + t.row * tile, tile, tile)
    }
    // Drag hover / validity.
    const drag = view.drag
    if (drag && drag.over && drag.kind) {
      const r = geom.tileRect(drag.over.col, drag.over.row)
      const color = drag.kind === 'empty' ? VALID_EMPTY : drag.kind === 'stack' ? VALID_STACK : INVALID
      const pulse = 0.75 + 0.25 * Math.sin(age * 0.012)
      paintGlow(ctx, r.x + r.w / 2, r.y + r.h / 2, tile * 0.62, color, pulse * 0.5)
      ctx.save()
      ctx.globalAlpha = pulse
      ctx.strokeStyle = color
      ctx.lineWidth = tile * 0.06
      roundRect(ctx, r.x + tile * 0.07, r.y + tile * 0.07, r.w - tile * 0.14, r.h - tile * 0.14, tile * 0.1)
      ctx.stroke()
      if (drag.kind === 'invalid') {
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(r.x + tile * 0.32, r.y + tile * 0.32); ctx.lineTo(r.x + tile * 0.68, r.y + tile * 0.68)
        ctx.moveTo(r.x + tile * 0.68, r.y + tile * 0.32); ctx.lineTo(r.x + tile * 0.32, r.y + tile * 0.68)
        ctx.stroke()
      }
      ctx.restore()
    }
    // Tap-to-place: with a hand pebble selected, every tile that would take it glows.
    const selType = view.selected >= 0 && !drag && view.phase === 'planning' && !view.lock ? view.hand[view.selected] : undefined
    if (selType) {
      const pulse = 0.3 + 0.2 * Math.sin(age * 0.006)
      for (let i = 0; i < board.tiles.length; i++) {
        const t = board.tiles[i]!
        const kind = placementKind(board, 'player', selType, t.col, t.row)
        if (kind === 'invalid') continue
        const r = geom.tileRect(t.col, t.row)
        const color = kind === 'stack' ? VALID_STACK : VALID_EMPTY
        paintGlow(ctx, r.x + r.w / 2, r.y + r.h / 2, tile * 0.58, color, (kind === 'stack' ? pulse + 0.25 : pulse) * 0.4)
        ctx.save()
        ctx.globalAlpha = kind === 'stack' ? pulse + 0.25 : pulse
        ctx.strokeStyle = color
        ctx.lineWidth = tile * 0.045
        roundRect(ctx, r.x + tile * 0.08, r.y + tile * 0.08, r.w - tile * 0.16, r.h - tile * 0.16, tile * 0.1)
        ctx.stroke()
        ctx.restore()
      }
    }
    // The ghost's target tile breathes.
    if (view.ghost && !drag) {
      const r = geom.tileRect(view.ghost.to.col, view.ghost.to.row)
      const pulse = 0.35 + 0.3 * Math.sin(age * 0.005)
      paintGlow(ctx, r.x + r.w / 2, r.y + r.h / 2, tile * 0.6, VALID_EMPTY, pulse * 0.45)
      ctx.save()
      ctx.globalAlpha = pulse
      ctx.strokeStyle = VALID_EMPTY
      ctx.lineWidth = tile * 0.05
      roundRect(ctx, r.x + tile * 0.07, r.y + tile * 0.07, r.w - tile * 0.14, r.h - tile * 0.14, tile * 0.1)
      ctx.stroke()
      ctx.restore()
    }
  }

  const drawDecals = (): void => {
    if (!ctx) return
    const decals = getDecals()
    for (let i = 0; i < decals.length; i++) {
      const d = decals[i]!
      const a = Math.min(1, d.life / 1500) * d.dark
      ctx.globalAlpha = a
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.ellipse(d.x, d.y, d.r, d.r * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  /**
   * ─── What a stone has left, and why a hit did nothing ────────────────────
   *
   * Three blind testers in round five, independently, made this their single
   * biggest complaint — the same one filed two rounds earlier. "Enemy runes
   * carry no visible health/state info… multi-hit fights are pure guesswork"
   * (Tom); "7-11 turns of watching nothing visibly change" (Camila); "I can't
   * see combat happen" (Aisha). The damage numbers and the cracks were there
   * the whole time; what was missing is anything to read BETWEEN turns, when
   * nothing is animating.
   *
   * Two changes came out of that, both here:
   *
   *   • the pips are bigger and a DAMAGED stone prints its number, so "how
   *     much is left" is readable at phone size rather than inferred from
   *     four dark slots. Camila asked for exactly this — "like the 8/9 the
   *     Shield rune already has", which was the one readout that worked for
   *     her.
   *   • a defense rune wears its ARMOUR, always. It mitigates
   *     `DEFENSE_MITIGATION` from every hit, so a Lv 1 rune hitting one takes
   *     its health to precisely nothing: the stone is undamaged, the cracks
   *     correctly show nothing, and all three testers read that as the game
   *     ignoring them. Tom lost a whole level to it — "I misread this as
   *     'tanky enemy'". A turn that changed nothing now says why.
   */
  const drawHpPips = (r: Rune, x: number, y: number, size: number, color: string): void => {
    if (!ctx) return
    const hp = Math.max(0, r.hp)
    if (r.maxHp <= 6) {
      const n = r.maxHp
      const pw = size * 0.095
      const gap = size * 0.028
      const total = n * pw + (n - 1) * gap
      let px = x - total / 2
      const py = y + size * 0.235
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i < hp ? color : rgba('#000000', 0.62)
        ctx.strokeStyle = rgba('#000000', 0.85)
        ctx.lineWidth = Math.max(1, size * 0.014)
        roundRect(ctx, px, py, pw, size * 0.055, size * 0.02)
        ctx.fill()
        ctx.stroke()
        px += pw + gap
      }
      // Only once it has been hit: an untouched stone's pips already say
      // "full", and a number on every rune on the board is noise.
      if (hp < r.maxHp) {
        drawText(`${hp}/${r.maxHp}`, x, py + size * 0.125, size * 0.13, '#ffffff')
      }
    } else {
      const bw = size * 0.52
      const bh = size * 0.075
      const bx = x - bw / 2
      const by = y + size * 0.215
      ctx.fillStyle = rgba('#000000', 0.65)
      roundRect(ctx, bx, by, bw, bh, bh / 2)
      ctx.fill()
      ctx.fillStyle = color
      roundRect(ctx, bx, by, bw * clamp01(hp / r.maxHp), bh, bh / 2)
      ctx.fill()
      // Ticks every six points, so a Lv 5 sword's 15 reads as "two and a half pips' worth".
      if (r.maxHp > 12) {
        ctx.strokeStyle = rgba('#000000', 0.55)
        ctx.lineWidth = Math.max(1, size * 0.01)
        for (let k = 6; k < r.maxHp; k += 6) {
          const tx = bx + bw * (k / r.maxHp)
          ctx.beginPath(); ctx.moveTo(tx, by); ctx.lineTo(tx, by + bh); ctx.stroke()
        }
      }
      drawText(r.maxHp > 6 ? `${hp}/${r.maxHp}` : String(hp), x, by + bh / 2, size * (r.maxHp > 9 ? 0.095 : 0.11), '#ffffff')
    }
    if (r.shield > 0) {
      const sx = x + size * 0.34
      const sy = y - size * 0.3
      ctx.fillStyle = SHIELD_COLOR
      ctx.strokeStyle = rgba('#000000', 0.8)
      ctx.lineWidth = Math.max(1, size * 0.012)
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const th = (k / 6) * Math.PI * 2 - Math.PI / 6
        const px = sx + Math.cos(th) * size * 0.07
        const py = sy + Math.sin(th) * size * 0.07
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
    // The armour a defense rune always carries — the answer to "my hit did
    // nothing". Drawn opposite the temporary-shield pip so a stone that has
    // both reads as two different things rather than one doubled one.
    if (r.type === 'defense' && DEFENSE_MITIGATION > 0) {
      const ax = x - size * 0.32
      const ay = y - size * 0.3
      const rr = size * 0.105
      ctx.save()
      ctx.fillStyle = rgba('#0b1220', 0.85)
      ctx.strokeStyle = SHIELD_COLOR
      ctx.lineWidth = Math.max(1, size * 0.018)
      // A shield outline: flat shoulders, a point at the foot.
      ctx.beginPath()
      ctx.moveTo(ax - rr, ay - rr * 0.85)
      ctx.lineTo(ax + rr, ay - rr * 0.85)
      ctx.lineTo(ax + rr, ay + rr * 0.15)
      ctx.quadraticCurveTo(ax + rr, ay + rr, ax, ay + rr * 1.15)
      ctx.quadraticCurveTo(ax - rr, ay + rr, ax - rr, ay + rr * 0.15)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
      drawText(String(DEFENSE_MITIGATION), ax, ay + rr * 0.1, size * 0.13, SHIELD_COLOR)
    }
    if (r.atkBonus > 0) {
      drawText(`+${r.atkBonus}`, x - size * 0.34, y - size * 0.3, size * 0.15, BUFF_COLOR)
    }
  }

  const drawRune = (r: Rune, skin: SkinId, dt: number, breathe: boolean): void => {
    if (!ctx) return
    const size = geom.tile
    const v = getVis(r.id)
    const x = cx(r.col, r.row) + v.ox
    const y = cy(r.col, r.row) + v.oy
    // Decay transient state.
    v.flash = Math.max(0, v.flash - dt / 160)
    v.shield = Math.max(0, v.shield - dt / 350)
    if (v.sx !== 1 || v.sy !== 1) {
      v.sx = lerp(v.sx, 1, Math.min(1, dt / 120))
      v.sy = lerp(v.sy, 1, Math.min(1, dt / 120))
      if (Math.abs(v.sx - 1) < 0.005) v.sx = 1
      if (Math.abs(v.sy - 1) < 0.005) v.sy = 1
    }
    if (v.alpha < 1) v.alpha = Math.min(1, v.alpha + dt / 150)

    // The stone faces the way it fires. A rune drawn for the first time is
    // already there; one that was re-aimed swings round, short way, so the
    // turn itself is the news.
    const want = glyphSpin(r.type, r.dir)
    v.spin = v.spin === null ? want : easeAngle(v.spin, want, Math.min(1, (dt / 16) * SPIN_EASE))
    const spin = v.spin

    drawShadow(x, y, size, v.sx, 0.42 * v.alpha)
    const spr = pebbleSprite(r.type, r.level, r.side, skin, r.faction, size)
    blitPebble(spr, x, y, size, v.sx, v.sy, v.alpha, spin)

    // What the stone has taken, painted ON the stone: three steps from a
    // hairline to a shattered face. Over the pebble so it reads as the SAME
    // stone breaking, under the hit flash and the glyph's breathing so a
    // landing blow still washes over it. See `paintDamage`.
    const dmg = damageSprite(damageStage(r.hp, r.maxHp), r.id, size, dpr)
    // Cracks are IN the stone, so they turn with it.
    if (dmg) blitPebble(dmg, x, y, size, v.sx, v.sy, v.alpha, spin)
    // The level plaque, level: a word on its side is not a word.
    blitPebble(ornamentSprite(r.type, r.level, r.side, skin, r.faction, size), x, y, size, v.sx, v.sy, v.alpha)

    if (breathe && qualityTier() !== 'min') {
      const glowColor = r.side === 'player' ? resolveGlow(SKINS[skin] ?? SKINS.river, r.type) : RUNES[r.type].color
      const g = glyphGlow(r.type, glowColor, size, dpr)
      if (g) {
        const a = (0.12 + 0.12 * Math.sin(age * 0.0025 + v.phase)) * v.alpha
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        blitPebble(g, x, y, size, v.sx, v.sy, a, spin)
        ctx.restore()
      }
    }
    if (v.flash > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = v.flash * 0.45
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.ellipse(x, y, size * 0.41 * v.sx, size * 0.36 * v.sy, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    if (v.shield > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = v.shield * 0.9
      ctx.strokeStyle = SHIELD_COLOR
      ctx.lineWidth = size * 0.06
      ctx.beginPath()
      ctx.ellipse(x, y, size * 0.46, size * 0.4, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    if (v.crack > 0) {
      ctx.save()
      ctx.globalAlpha = Math.min(1, v.crack * 1.2)
      ctx.strokeStyle = rgba('#000000', 0.8)
      ctx.lineWidth = Math.max(1, size * 0.02)
      ctx.lineCap = 'round'
      ctx.beginPath()
      for (let k = 0; k < 4; k++) {
        const th = k * 1.7 + v.phase
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(th) * size * 0.14, y + Math.sin(th) * size * 0.12)
        ctx.lineTo(x + Math.cos(th + 0.4) * size * 0.3, y + Math.sin(th + 0.4) * size * 0.26)
      }
      ctx.stroke()
      ctx.restore()
    }
    // Facing.
    if (r.dir !== 'omni') {
      const [dx, dy] = DIR_VEC[r.dir]
      const rx = size * 0.4
      const ry = size * 0.345
      const n = Math.hypot(dx, dy) || 1
      // A little smaller than it was. The stone itself now turns to face the
      // way it fires, so this mark no longer has to carry the facing on its
      // own — and sixteen of them on a full board were competing with the
      // runes they belong to.
      drawArrowAt(x + (dx / n) * rx * 1.12, y + (dy / n) * ry * 1.22, r.dir, sideColor(r.side, r.faction), size, v.alpha, 0.92)
    }
    drawHpPips(r, x, y, size, sideColor(r.side, r.faction))
  }

  const drawRunes = (skin: SkinId, dt: number, breathe: boolean): void => {
    for (let i = 0; i < runeList.length; i++) drawRune(runeList[i]!, skin, dt, breathe)
  }

  /**
   * ─── What your stones are about to do ───────────────────────────────────────
   *
   * During PLANNING, a faint line out of every stone of the player's, along the
   * way it faces — the same trajectory the reveal fans in, at a whisper.
   *
   * Two things the blind playtest said this has to answer (2026-09-11). The
   * strategy player never worked out when or why a rune attacks, because
   * nothing on a planning board says what the standing stones are aimed at.
   * And the monetization-savvy one spent his last minute with two back-row
   * stones facing each other and no way to see it: "nothing on screen told me
   * this had happened; I only found out by zooming into the sprites". A line
   * that reaches an enemy is drawn in the player's own blue; a line with
   * nothing in it goes grey, which is the whole warning.
   *
   * Player stones only. The enemy's committed move is secret until the reveal,
   * and drawing its standing stones' lines as well doubles the ink for
   * information the player cannot act on this turn.
   */
  const drawStandingLines = (view: ArenaView): void => {
    if (!ctx || view.phase !== 'planning' || view.resetting || view.result) return
    if (qualityTier() === 'min') return
    for (let i = 0; i < runeList.length; i++) {
      const r = runeList[i]!
      if (r.side !== 'player' || r.dir === 'omni') continue
      const res = attackCells(r.type, r.level, r.dir, r.col, r.row, hitScratch, skipScratch)
      if (res.hits === 0) continue
      let reaches = false
      for (let h = 0; h < res.hits; h++) {
        const c = hitScratch[h]!
        const other = runeAt(view.board, c.col, c.row)
        if (other && other.side === 'enemy') { reaches = true; break }
      }
      drawTrajectory(r.type, r.level, r.dir, r.col, r.row, reaches ? PLAYER_ARROW : NO_TARGET, reaches ? 0.3 : 0.18)
    }
  }

  /** The glowing trajectory line of an attack. */
  const drawTrajectory = (
    type: RuneType, level: number, dir: Dir, col: number, row: number, color: string, alpha: number
  ): void => {
    if (!ctx || dir === 'omni' || alpha <= 0.01) return
    const size = geom.tile
    const res = attackCells(type, level, dir, col, row, hitScratch, skipScratch)
    if (res.hits === 0) return
    const x0 = cx(col, row)
    const y0 = cy(col, row)
    // Where the line POINTS is not always the last cell of the pattern:
    //
    //   a fan  — the last cell is a horn of it, so the stroke would point off
    //            at a diagonal. It aims at the tile dead ahead instead.
    //   a lob  — the shell arcs into the middle of its footprint, so the head
    //            sits on the footprint's centre, not on one of its corners.
    //
    // A lane, an arrow and a beam all genuinely end at their last cell.
    const fan = type === 'cleave'
    const lob = type === 'bombard'
    let x1 = 0
    let y1 = 0
    if (fan) {
      const [fdx, fdy] = DIR_VEC[dir]
      const fc = col + fdx
      const fr = row + fdy
      x1 = inBounds(fc, fr) ? cx(fc, fr) : cx(hitScratch[0]!.col, hitScratch[0]!.row)
      y1 = inBounds(fc, fr) ? cy(fc, fr) : cy(hitScratch[0]!.col, hitScratch[0]!.row)
    } else if (lob) {
      for (let i = 0; i < res.hits; i++) {
        x1 += cx(hitScratch[i]!.col, hitScratch[i]!.row)
        y1 += cy(hitScratch[i]!.col, hitScratch[i]!.row)
      }
      x1 /= res.hits
      y1 /= res.hits
    } else {
      const last = hitScratch[res.hits - 1]!
      x1 = cx(last.col, last.row)
      y1 = cy(last.col, last.row)
    }
    // The shell's arc lifts off the board's plane; its head follows the tangent
    // coming DOWN out of that arc, not the straight line from the tube.
    const ctrlX = (x0 + x1) / 2
    const ctrlY = (y0 + y1) / 2 - size * 1.1
    const ang = lob ? Math.atan2(y1 - ctrlY, x1 - ctrlX) : Math.atan2(y1 - y0, x1 - x0)
    const stem = (): void => {
      ctx!.beginPath()
      ctx!.moveTo(x0, y0)
      // A lob passes OVER everything between the tube and the impact, so its
      // stroke must not lie on those tiles: it is a curve, not a line.
      if (lob) ctx!.quadraticCurveTo(ctrlX, ctrlY, x1, y1)
      else ctx!.lineTo(x1, y1)
      ctx!.stroke()
    }
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    ctx.globalAlpha = alpha * 0.35
    ctx.strokeStyle = color
    ctx.lineWidth = size * 0.16
    stem()
    ctx.globalAlpha = alpha
    ctx.lineWidth = size * 0.045
    stem()
    // Skipped cells: a hollow marker; hit cells: a solid one.
    for (let i = 0; i < res.skipped; i++) {
      const c = skipScratch[i]!
      ctx.beginPath(); ctx.arc(cx(c.col, c.row), cy(c.col, c.row), size * 0.1, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.fillStyle = color
    for (let i = 0; i < res.hits; i++) {
      const c = hitScratch[i]!
      ctx.beginPath(); ctx.arc(cx(c.col, c.row), cy(c.col, c.row), size * 0.1, 0, Math.PI * 2); ctx.fill()
    }
    // Head.
    ctx.translate(x1, y1)
    ctx.rotate(ang)
    ctx.beginPath()
    ctx.moveTo(size * 0.12, 0)
    ctx.lineTo(-size * 0.12, -size * 0.14)
    ctx.lineTo(-size * 0.12, size * 0.14)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  const drawAimCone = (type: RuneType, level: number, dir: Dir, col: number, row: number, color: string): void => {
    if (!ctx) return
    const size = geom.tile
    if (dir === 'omni') {
      // Auras / heals reach the four neighbours.
      ctx.save()
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(age * 0.01)
      ctx.fillStyle = color
      const around: ReadonlyArray<readonly [number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0]]
      for (const [dx, dy] of around) {
        const c = col + dx
        const r = row + dy
        if (!inBounds(c, r)) continue
        ctx.beginPath(); ctx.arc(cx(c, r), cy(c, r), size * 0.12, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
      return
    }
    const res = attackCells(type, level, dir, col, row, hitScratch, skipScratch)
    ctx.save()
    ctx.globalAlpha = 0.2 + 0.08 * Math.sin(age * 0.01)
    ctx.fillStyle = color
    for (let i = 0; i < res.hits; i++) {
      const c = hitScratch[i]!
      const r = geom.tileRect(c.col, c.row)
      roundRect(ctx, r.x + size * 0.08, r.y + size * 0.08, r.w - size * 0.16, r.h - size * 0.16, size * 0.1)
      ctx.fill()
    }
    ctx.strokeStyle = color
    ctx.lineWidth = size * 0.03
    ctx.setLineDash(DASH)
    for (let i = 0; i < res.skipped; i++) {
      const c = skipScratch[i]!
      const r = geom.tileRect(c.col, c.row)
      roundRect(ctx, r.x + size * 0.1, r.y + size * 0.1, r.w - size * 0.2, r.h - size * 0.2, size * 0.1)
      ctx.stroke()
    }
    ctx.setLineDash(NO_DASH)
    ctx.restore()
    drawTrajectory(type, level, dir, col, row, color, 0.8 + 0.2 * Math.sin(age * 0.012))
  }
  const DASH = [6, 5]
  const NO_DASH: number[] = []

  // ── The tile's compass ────────────────────────────────────────────────────
  //
  // While a pebble is in hand and a MOUSE is over a tile, that tile shows every
  // facing the pebble could take at once: each region outlined with the arrow it
  // would produce, and the one under the pointer lit and grown in from its own
  // edge. The player chooses by moving rather than by dropping and correcting,
  // which is what lets a precise placement skip the correction window entirely.
  //
  // It is drawn UNDER the runes, as a marking on the floor of the tile: a stack
  // target's stone has to stay readable while its compass is up.

  /**
   * The live turn of the two stones that are not on the board yet — the one in
   * the lock window and the one being carried over a tile. Board runes keep
   * theirs per-rune in `VisRune.spin`; these two are singular, so they live
   * here. `null` means "not turning yet": snap to the facing on the next draw.
   */
  let lockSpin: number | null = null
  let dragSpin: number | null = null
  /** Which cell `lockSpin` belongs to, so a new window never inherits the last one's angle. */
  let lockCell = -1

  /** How long the lit wedge takes to travel out to its edge. */
  const COMPASS_GROW_MS = 130
  let compassDir: Dir | null = null
  let compassCell = -1
  let compassAt = 0

  /**
   * Where a region's arrow sits, in unit space — memoised, since the polygons
   * never change.
   *
   * Two points per region. `mid` is the centre of mass, which is where the mark
   * belongs under a CURSOR: balanced inside its own wedge. `rim` is the middle
   * of the region's outer boundary — the top edge of a triangle, the outer
   * corner of a quadrant — which is where it belongs under a FINGERTIP, because
   * the contact patch covers the middle of the tile and the rim is the one part
   * of it the player can still see.
   */
  const anchorCache = new Map<string, readonly [number, number, number, number]>()
  const regionAnchors = (type: RuneType, dir: Dir): readonly [number, number, number, number] => {
    const key = `${type}|${dir}`
    let hit = anchorCache.get(key)
    if (!hit) {
      const poly = aimRegionPolygon(type, dir)
      let sx = 0
      let sy = 0
      for (const p of poly) { sx += p[0]; sy += p[1] }
      // Which point of the region faces out is `rules.aimRegionOuterEdge` —
      // the same fact the lit wedge's chevron is drawn from, so the arrow and
      // the chevron lean the same way on every facing of every rune.
      const { ax, ay } = aimRegionOuterEdge(type, dir)
      hit = [sx / poly.length, sy / poly.length, ax, ay] as const
      anchorCache.set(key, hit)
    }
    return hit
  }

  /** How far a touch drag pulls each mark from its centre of mass toward the rim. */
  const TOUCH_LEAN = 0.5
  /** …and how much heavier the chosen region's chevron is drawn for it. */
  const TOUCH_RIM = 1.5
  /**
   * How far the CHOSEN mark leans out under a cursor.
   *
   * A fingertip is not the only thing that covers the middle of a tile: on a
   * mouse the carried pebble is drawn at the cursor, and the lit arrow sits at
   * its region's centre of mass — which is exactly where the stone in hand is.
   * So the one mark that matters was the one hiding under the thing the player
   * was moving, and a facing chosen by pointing could be missed entirely. The
   * chosen mark leans clear; the others stay put, because their job is to show
   * the shape of the menu rather than to be read.
   */
  const CURSOR_LEAN = 0.42
  /** The chosen mark, drawn to be unmissable: bigger, opaque, its own colour. */
  const LIT_SCALE = 0.82
  const LIT_ALPHA = 1
  /**
   * …and the ones merely on offer.
   *
   * They were at 0.22, which on a painted board is not "quiet", it is absent —
   * the menu the compass exists to show was a rumour, and the tile read as
   * having one facing rather than four. They are quieter than the chosen one
   * and that is enough; the chosen one now has a gradient, a chevron and an
   * arrow twice this size to distinguish it, so the contrast no longer has to
   * be bought by making three quarters of the control invisible.
   */
  const OFFER_ALPHA = 0.6

  const drawAimCompass = (view: ArenaView): void => {
    const hover: HoverState | null = view.hover
    // Drawn for a finger as well as a cursor — a touch drag is choosing a
    // facing too. What changes is WHERE: see `regionAnchors`.
    if (!ctx || !hover) return
    const size = geom.tile
    const rect = geom.tileRect(hover.cell.col, hover.cell.row)

    if (hover.kind === 'invalid') {
      // A refused tile is not a menu. The drag path already draws its own
      // refusal mark, so only the SELECTED-pebble hover needs one here.
      if (!view.drag) paintAimRefused(ctx, rect, size, INVALID, 0.75 + 0.25 * Math.sin(age * 0.012))
      return
    }

    // Everything below is an overlay on painted slate. Darken the tile once
    // first and every mark on it gets its contrast from the game rather than
    // from whatever the art happens to be doing here. See `paintAimScrim`.
    paintAimScrim(ctx, rect)

    // The wedge grows from its edge each time a NEW facing is chosen. Sliding
    // back through the centre un-chooses, so leaving the dead zone again plays
    // the travel afresh rather than snapping to a shape already at full size.
    const cellId = cellIndex(hover.cell.col, hover.cell.row)
    const chosenDir = hover.chosen ? hover.dir : null
    if (chosenDir !== compassDir || cellId !== compassCell) {
      compassDir = chosenDir
      compassCell = cellId
      compassAt = age
    }
    const grow = easeOutCubic(clamp01((age - compassAt) / COMPASS_GROW_MS))
    // The compass's own green, not the rune's colour — see `AIM_OFFER`.
    const color = AIM_OFFER

    // An omni rune has nothing to aim: light the whole tile once, with no
    // arrows. Four identical marks around a shield would be four lies — and
    // the dead zone does not apply, because there is no facing to withhold.
    if (aimRegionShape(hover.type) === 'whole') {
      paintAimRegion(ctx, rect, hover.type, 'omni', size, { color: AIM_CHOSEN, lit: true, grow, alpha: 0.85 })
    } else {
      // Under a fingertip the middle of the tile is gone, so every mark moves
      // out toward the rim and the chosen region's white edge — which lies on
      // the tile border, clear of the contact patch — is drawn heavier.
      const lean = hover.precise ? 0 : TOUCH_LEAN
      const rim = hover.precise ? 1 : TOUCH_RIM
      for (const d of aimRegions(hover.type)) {
        // Three weights: the chosen facing, the facing it would take anyway
        // while the pointer sits in the middle, and the ones on offer.
        const lit = hover.chosen && d === hover.dir
        const held = !hover.chosen && d === hover.dir
        paintAimRegion(ctx, rect, hover.type, d, size, {
          color: lit ? AIM_CHOSEN : color, lit, held, grow,
          alpha: lit ? 1 : held ? 0.9 : OFFER_ALPHA, rim: lit ? Math.max(rim, TOUCH_RIM) : rim
        })
        const [mx, my, ox, oy] = regionAnchors(hover.type, d)
        // The chosen mark leans out from under whatever is covering the middle
        // — a fingertip, or the pebble being carried on a cursor.
        const pull = lit ? Math.max(lean, CURSOR_LEAN) : lean
        const ax = mx + (ox - mx) * pull
        const ay = my + (oy - my) * pull
        drawArrowAt(
          rect.x + ax * rect.w, rect.y + ay * rect.h, d,
          lit ? AIM_CHOSEN : color, size,
          lit ? LIT_ALPHA : held ? 0.85 : 0.55,
          lit ? LIT_SCALE : held ? 0.54 : 0.46
        )
      }
    }

    // The cone answers a different question — which tiles the attack would
    // REACH — and during a drag `drawDrag` already asks it. A pebble picked up
    // by TAP has no drag, so the hover asks it here instead; either way the
    // cone is drawn exactly once, over tiles the compass does not touch.
    if (!view.drag) {
      const level = hover.kind === 'stack' ? targetLevel(view.board, hover.cell) : 1
      drawAimCone(hover.type, level, hover.dir, hover.cell.col, hover.cell.row, PLAYER_ARROW)
    }
  }

  /** The re-aim stroke: a glowing streak from where the finger landed to where it is now. */
  const drawCorrectionStroke = (drag: DragState): void => {
    if (!ctx || !drag.anchor) return
    const size = geom.tile
    const dx = drag.x - drag.anchor.x
    const dy = drag.y - drag.anchor.y
    const len = Math.hypot(dx, dy)
    if (len < 2) return
    const shown = Math.min(len, size * 0.9)
    const ux = dx / len
    const uy = dy / len
    const x1 = drag.anchor.x + ux * shown
    const y1 = drag.anchor.y + uy * shown
    drawBeam(drag.anchor.x, drag.anchor.y, x1, y1, PLAYER_ARROW, size * 0.07, 0.85)
    paintGlow(ctx, x1, y1, size * 0.22, PLAYER_ARROW, 0.85)
    ctx.save()
    ctx.translate(x1, y1)
    ctx.rotate(Math.atan2(uy, ux))
    ctx.fillStyle = PLAYER_ARROW
    ctx.beginPath()
    ctx.moveTo(size * 0.16, 0)
    ctx.lineTo(-size * 0.1, -size * 0.14)
    ctx.lineTo(-size * 0.1, size * 0.14)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  /**
   * The correction window: the stone just placed sits face-up on its tile with
   * a ring draining round it, and a press-and-swipe anywhere re-aims it while
   * the ring lasts. The facing follows a correction stroke live.
   */
  const drawLock = (view: ArenaView): void => {
    if (!ctx) return
    const lock = view.lock
    if (!lock || view.phase !== 'planning') {
      // The window closed, so the next stone to open one starts from its own
      // facing rather than swinging round from where this one finished.
      lockSpin = null
      lockCell = -1
      return
    }
    const size = geom.tile
    const { col, row } = lock.cell
    if (cellIndex(col, row) !== lockCell) {
      lockSpin = null
      lockCell = cellIndex(col, row)
    }
    const x = cx(col, row)
    const y = cy(col, row)
    const level = targetLevel(view.board, lock.cell)
    const correcting = view.drag !== null && view.drag.mode === 'correct'
    const dir = correcting && view.drag ? view.drag.dir : lock.dir
    const frac = lock.held ? 1 : clamp01(lock.leftMs / Math.max(1, lock.totalMs))
    const pulse = 1 + 0.03 * Math.sin(age * 0.012)
    const aimable = RUNES[lock.type].aim !== 'omni'
    drawAimCone(lock.type, level, dir, col, row, PLAYER_ARROW)
    drawShadow(x, y, size, pulse, 0.4)
    // The stone turns live under a correction stroke: flick the facing and the
    // sword swings to it before the finger is up, which is the fastest way to
    // tell someone their re-aim landed.
    lockSpin = lockSpin === null ? glyphSpin(lock.type, dir) : easeAngle(lockSpin, glyphSpin(lock.type, dir), SPIN_EASE)
    blitRuneStone(lock.type, level, 'player', view.skin, null, x, y - size * 0.05, size, lockSpin, pulse, pulse)
    // A clean feed keeps the stone and its aim; the countdown ring and the
    // chevron tap targets are interface.
    if (CLEAN_FEED) return
    // The ring: a baked ring sprite carries the glow, the stroke carries the count.
    const r = size * 0.47
    const breathe = lock.held ? 0.5 + 0.5 * Math.sin(age * 0.005) : 0
    paintRing(ctx, x, y, r, PLAYER_ARROW, lock.held ? 0.3 + 0.5 * breathe : 0.15 + 0.45 * frac, 0.14)
    ctx.save()
    ctx.lineCap = 'round'
    ctx.strokeStyle = rgba('#ffffff', 0.14)
    ctx.lineWidth = size * 0.035
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = PLAYER_ARROW
    if (lock.held) {
      // Waiting for the player, not counting down: a full ring that breathes.
      ctx.globalAlpha = 0.55 + 0.45 * breathe
      ctx.lineWidth = size * (0.035 + 0.02 * breathe)
    }
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke()
    ctx.restore()
    // The other facings, as tap targets: a dim disc with a chevron pointing out.
    if (aimable) {
      const hit = size * LOCK_CHEVRON_HIT_TILES
      for (const p of lockChevronPoints(lock.type, dir, x, y, size)) {
        if (p.current) continue
        ctx.save()
        ctx.fillStyle = rgba('#000000', 0.38)
        ctx.strokeStyle = rgba('#ffffff', 0.28)
        ctx.lineWidth = Math.max(1, size * 0.018)
        ctx.beginPath(); ctx.arc(p.x, p.y, hit * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.restore()
        drawArrowAt(p.x, p.y, p.dir, PLAYER_ARROW, size, 0.55, 0.85)
      }
    }
    // The facing, bold.
    if (dir !== 'omni') {
      const [dx, dy] = DIR_VEC[dir]
      const n = Math.hypot(dx, dy) || 1
      const bold = 1.6 * (1 + 0.1 * Math.sin(age * 0.012))
      drawArrowAt(x + (dx / n) * size * 0.62, y - size * 0.05 + (dy / n) * size * 0.56, dir, PLAYER_ARROW, size, 1, bold)
    }
    // "Press to re-aim": a ripple leaves the stone every 0.7 s until a finger lands.
    if (aimable && !correcting) {
      const k = (age % 700) / 700
      ctx.save()
      ctx.globalAlpha = (1 - k) * 0.5
      ctx.strokeStyle = PLAYER_ARROW
      ctx.lineWidth = size * 0.03
      ctx.beginPath(); ctx.arc(x, y, size * (0.3 + 0.32 * k), 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }
  }

  const drawDrag = (view: ArenaView): void => {
    if (!ctx) return
    const drag = view.drag
    if (!drag) return
    if (drag.mode === 'correct') { drawCorrectionStroke(drag); return }
    const size = geom.tile
    const skin = view.skin
    const dragLevel = drag.kind === 'stack' ? targetLevel(view.board, drag.over) : 1
    const spr = pebbleSprite(drag.type, dragLevel, 'player', skin, null, size)
    if (drag.aiming && drag.over) {
      const x = cx(drag.over.col, drag.over.row)
      const y = cy(drag.over.col, drag.over.row)
      drawAimCone(drag.type, dragLevel, drag.dir, drag.over.col, drag.over.row, PLAYER_ARROW)
      drawShadow(x, y, size, 1, 0.4)
      // Turning WHILE the stone is still in hand is the point: the player sees
      // the sword swing as they slide across the tile, and lets go when it
      // points where they want it. The facing stops being a thing you find out
      // about after you commit.
      dragSpin = dragSpin === null ? glyphSpin(drag.type, drag.dir) : easeAngle(dragSpin, glyphSpin(drag.type, drag.dir), SPIN_EASE)
      blitRuneStone(drag.type, dragLevel, 'player', skin, null, x, y - size * 0.06, size, dragSpin, 1.05, 1.05)
      if (drag.dir !== 'omni') {
        const [dx, dy] = DIR_VEC[drag.dir]
        const n = Math.hypot(dx, dy) || 1
        const pulse = 1 + 0.12 * Math.sin(age * 0.012)
        drawArrowAt(x + (dx / n) * size * 0.62, y - size * 0.06 + (dy / n) * size * 0.56, drag.dir, PLAYER_ARROW, size, 1, 1.5 * pulse)
      }
    } else {
      // Lifted above the finger so a thumb does not cover it.
      const lift = size * 0.35
      drawShadow(drag.x, drag.y - lift + size * 0.1, size, 1.1, 0.3)
      // Off the board, a carried stone has no facing yet — it is drawn upright,
      // and starts turning the moment it is over a tile.
      dragSpin = null
      blitPebble(spr, drag.x, drag.y - lift, size, 1.15, 1.15, 0.95)
      blitPebble(ornamentSprite(drag.type, dragLevel, 'player', skin, null, size), drag.x, drag.y - lift, size, 1.15, 1.15, 0.95)
    }
  }

  /** Shortest flight a falling star is allowed, in tiles. */
  const MIN_COMET_TILES = 3.4

  /**
   * ─── Where the enemy's stone comes from ─────────────────────────────────
   *
   * Out of the sky on the enemy's side, leaning along the line the rune will
   * shoot down — so the tail is already pointing at what the stone is aimed
   * at before it has landed. `up` is the one facing that would have the star
   * rise out of the PLAYER's half, so the vertical component is pinned
   * upward and only the lean is taken from the direction.
   */
  const cometEntry = (m: Move, x: number, y: number, out: { x: number; y: number }): void => {
    const [dx] = DIR_VEC[m.dir]
    // A dead-vertical fall reads as a drop, not a star: a rune with no
    // sideways aim comes in over whichever half of the sky is wider.
    const ux = dx !== 0 ? -dx * 0.9 : (m.col * 2 < GRID ? 0.6 : -0.6)
    const uy = -1.15
    const mag = Math.hypot(ux, uy)
    const nx = ux / mag
    const ny = uy / mag
    const f = geom.frame
    const pad = geom.tile * 0.9
    // Out to the NEAREST side the ray leaves by — not the furthest. Taking the
    // furthest sends a star aimed at the bottom rank six tiles above the
    // canvas, and the player sees the last third of a flight that already
    // happened off screen.
    let d = (f.y - pad - y) / ny
    if (nx > 0) d = Math.min(d, (f.x + f.w + pad - x) / nx)
    else if (nx < 0) d = Math.min(d, (f.x - pad - x) / nx)
    // …but never so short that the arrival is over before it reads. A stone
    // dropped on the enemy's OWN back rank is barely a tile from the edge, and
    // that is the commonest placement they make; it starts off the canvas and
    // comes in from there, which is what a falling star does anyway.
    out.x = x + nx * Math.max(d, geom.tile * MIN_COMET_TILES)
    out.y = y + ny * Math.max(d, geom.tile * MIN_COMET_TILES)
  }

  const entry = { x: 0, y: 0 }

  /** Of the reveal, the share an incoming enemy stone spends in the air. */
  const COMET_FLIGHT = 0.6
  /** Each extra enemy stone is held back this much, so two arrivals are two events. */
  const COMET_STAGGER = 0.09

  const drawReveal = (view: ArenaView): void => {
    if (!ctx) return
    const rv = view.reveal
    if (!rv) return
    const t = clamp01(rv.elapsedMs / REVEAL_MS)
    const size = geom.tile
    const skin = view.skin
    const fx = fxQ()
    const quiet = view.timeline != null

    /**
     * Both sides reached for the same tile. Drawn side by side rather than one
     * on top of the other, because the clash that follows is about to pull
     * them apart and smash them together, and a player who never saw TWO
     * stones arrive has no idea what broke their rune. (The lesson for this is
     * 2-3; the rule applies on every board.)
     */
    const contested = (m: Move): boolean => {
      const p = rv.player
      if (!p) return false
      if (m.side === 'player') {
        for (let i = 0; i < rv.enemies.length; i++) {
          const e = rv.enemies[i]!
          if (e.col === m.col && e.row === m.row) return true
        }
        return false
      }
      return p.col === m.col && p.row === m.row
    }
    const lean = (m: Move): number => (contested(m) ? size * (m.side === 'player' ? -0.3 : 0.3) : 0)

    /** The player's own stone: it was already under their finger, so it just slams. */
    const drawOwn = (m: Move | null): void => {
      if (!m) return
      const x = cx(m.col, m.row) + lean(m)
      const y = cy(m.col, m.row)
      const slam = clamp01(t / 0.35)
      const scale = lerp(1.7, 1, easeOutBack(slam))
      const alpha = clamp01(t / 0.1)
      const lift = size * 0.5 * (1 - easeOutCubic(slam))
      drawShadow(x, y, size, scale, 0.4 * alpha * (1 - lift / (size * 0.5) * 0.5))
      blitRuneStone(m.type, 1, m.side, skin, m.faction, x, y - lift, size, glyphSpin(m.type, m.dir), scale, scale, alpha)
      if (slam >= 1 && !quiet && rv.elapsedMs - REVEAL_MS * 0.35 < 24) spawnTileDust(x, y, size, 4)
    }

    /**
     * An enemy stone: a falling star that crosses the sky and lands on the
     * tile it chose. The pebble rides the head of the comet, small and far
     * off at first, at full size when it touches down.
     */
    const drawIncoming = (m: Move, i: number): void => {
      const x = cx(m.col, m.row) + lean(m)
      const y = cy(m.col, m.row)
      const delay = COMET_STAGGER * i
      const k = clamp01((t - delay) / Math.max(0.05, COMET_FLIGHT - delay))
      const color = sideColor(m.side, m.faction)
      if (k <= 0) return
      if (k < 1) {
        cometEntry(m, x, y, entry)
        // Slightly quicker at the end than the start: a stone falling, not a balloon.
        const f = k * (0.68 + 0.32 * k)
        const px = lerp(entry.x, x, f)
        const py = lerp(entry.y, y, f)
        const ang = Math.atan2(y - entry.y, x - entry.x)
        // Painted on every tier: an enemy stone that simply appears is the
        // thing this exists to stop. `min` gets the head without the tail.
        paintComet(ctx, f, entry.x, entry.y, x, y, size, color, { lean: fx < 1 })
        // Small and far off at first, full size as it touches down — the trail
        // is what the eye follows, not the stone.
        const scale = lerp(0.42, 1.2, easeOutCubic(k))
        // The glyph is already turned the way it will fire, so the facing is
        // readable for the whole flight, not only after it lands.
        blitRuneStone(m.type, 1, m.side, skin, m.faction, px, py, size, glyphSpin(m.type, m.dir), scale, scale, clamp01(k / 0.18))
        if (fx > 0 && !quiet) spawnCometEmbers(px, py, ang, size, color, 4)
        return
      }
      // Landed. Every star touches down at `COMET_FLIGHT` whatever its
      // stagger — a held-back stone flies faster, it does not arrive late.
      const land = clamp01((t - COMET_FLIGHT) / Math.max(0.06, 1 - COMET_FLIGHT))
      const scale = lerp(1.2, 1, easeOutBack(land))
      drawShadow(x, y, size, scale, 0.4)
      blitRuneStone(m.type, 1, m.side, skin, m.faction, x, y, size, glyphSpin(m.type, m.dir), scale, scale, 1)
      if (fx > 0) paintLanding(ctx, land, x, y, size, color)
      if (!quiet && land < 0.12) {
        spawnTileDust(x, y, size, 5)
        spawnImpactSparks(x, y, size, color, Math.PI / 2, 10)
      }
    }

    drawOwn(rv.player)
    for (let i = 0; i < rv.enemies.length; i++) drawIncoming(rv.enemies[i]!, i)
    // Every rune's trajectory, fanning in once the last star is down.
    const arrowAlpha = clamp01((t - COMET_FLIGHT) / Math.max(0.08, 1 - COMET_FLIGHT))
    if (arrowAlpha > 0) {
      const board = view.board
      for (const id in board.runes) {
        const r = board.runes[id]
        if (!r) continue
        drawTrajectory(r.type, r.level, r.dir, r.col, r.row, r.side === 'player' ? PLAYER_ARROW : ENEMY_ARROW, arrowAlpha)
      }
      const incoming = (m: Move | null): void => {
        if (!m) return
        drawTrajectory(m.type, targetLevel(board, m), m.dir, m.col, m.row, m.side === 'player' ? PLAYER_ARROW : ENEMY_ARROW, arrowAlpha)
      }
      incoming(rv.player)
      for (let i = 0; i < rv.enemies.length; i++) incoming(rv.enemies[i]!)
    }
    // The word, briefly, in the timer slot.
    if (labels) {
      const tr = geom.timer
      const pop = easeOutBack(clamp01(t / 0.25))
      drawText(labels.reveal, tr.x + tr.w / 2, tr.y + tr.h / 2, geom.tile * 0.28 * pop, '#ffffff', 'center', true, 1 - clamp01((t - 0.72) / 0.28))
    }
  }

  /**
   * ─── The planning ring says what it is counting to ──────────────────────
   *
   * It used to be a bare number in a circle. Two blind testers, two rounds
   * apart, could not work out what it governed — "it counted down
   * inconsistently across levels, sometimes reset to 5, sometimes ticked to 0
   * without an obvious trigger I could tie to my actions", and, on sitting
   * through one deliberately, "a countdown timer pulsed red as if something
   * urgent was about to happen, hit zero, and… nothing" (2026-09-12).
   *
   * Nothing was wrong with the clock. It counts down to the moment every
   * aimed rune fires — the word this same slot then prints, `reveal` /
   * "FIRING" — and on a lesson it HOLDS, deliberately, so a slow learner is
   * never timed out. Both of those are good; neither was ever said. So the
   * ring now carries the word it is counting toward, and says whose turn it
   * is waiting on when it is holding. The "inconsistency" was the held state,
   * which is now the state that explains itself.
   */
  const drawTimer = (view: ArenaView): void => {
    if (!ctx) return
    const tr = geom.timer
    const x = tr.x + tr.w / 2
    const y = tr.y + tr.h / 2
    const r = tr.w / 2 * 0.86
    const size = geom.tile
    if (view.phase === 'planning') {
      if (view.timer.paused) {
        // No clock while the lesson runs: a quiet ring, no number — and the
        // reason, so a held ring reads as "waiting for you" and not as broken.
        ctx.save()
        ctx.globalAlpha = 0.35
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = r * 0.16
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
        ctx.restore()
        // Above the ring, in the same slot the counting state uses for its
        // caption — inside it, the words are wider than the circle.
        if (labels) drawText(labels.yourTurn, x, y - r - size * 0.14, size * 0.14, '#8fa8c8')
        return
      }
      // ── There is no clock any more ──
      //
      // Planning waits for the player, so `view.timer` never counts down and
      // this branch is only reached by a node that opts back into a timed
      // window. The held state above — a quiet ring and "YOUR MOVE" — is what
      // every node shows today. Kept rather than deleted because the state is
      // still honest if a timed variant is ever wanted, and because deleting
      // it would take the countdown's whole vocabulary with it.
      const frac = clamp01(view.timer.leftMs / Math.max(1, view.timer.totalMs))
      const secs = Math.ceil(view.timer.leftMs / 1000)
      const color = view.timer.leftMs <= 1000 ? INVALID : view.timer.leftMs <= 3000 ? BUFF_COLOR : '#8fd0ff'
      const urgent = view.timer.leftMs <= 3000 ? 1 + 0.08 * Math.sin(age * 0.02) : 1
      paintRing(ctx, x, y, r, color, view.timer.leftMs <= 3000 ? 0.45 + 0.3 * (urgent - 1) / 0.08 : 0.3, 0.2)
      ctx.save()
      ctx.strokeStyle = rgba('#ffffff', 0.14)
      ctx.lineWidth = r * 0.18
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = color
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke()
      ctx.restore()
      drawText(String(secs), x, y + r * 0.04, r * 1.05 * urgent, color)
      // Above the ring: what the number means. "LAST TURN" outranks it — it is
      // the more urgent thing to know and they share the one caption slot.
      if (labels) {
        const last = view.turn >= view.turnLimit && !view.suddenDeath
        drawText(
          last ? labels.lastTurn : labels.firesIn,
          x, y - r - size * 0.14, size * 0.14, last ? BUFF_COLOR : '#8fa8c8'
        )
      }
      return
    }
    if (labels && view.phase !== 'reveal') {
      drawText(labels.turn(view.turn), x, y, size * 0.2, '#cfe0ff')
    }
  }

  const drawHand = (view: ArenaView): void => {
    if (!ctx) return
    const size = geom.tile
    const skin = view.skin
    const canAct = view.phase === 'planning' && !view.resetting && view.result === null
    for (let i = 0; i < geom.hand.length; i++) {
      const r = geom.hand[i]!
      const type = view.hand[i]
      const empty = !type || (view.drag !== null && view.drag.handIndex === i)
      // Socket — baked; it only changes with the layout. See `socketSprite`.
      const socket = socketSprite(r.w, r.h, size, bakeDpr())
      if (socket) ctx.drawImage(socket, r.x, r.y, r.w, r.h)
      if (empty || !type) continue
      const selected = view.selected === i && canAct
      if (selected) {
        // The socket lights up under a selected pebble.
        const glow = 0.55 + 0.45 * Math.sin(age * 0.006)
        blit(ctx, glowSprite(VALID_EMPTY, r.w * 2), r.x + r.w / 2, r.y + r.h / 2, r.w * 2, r.h * 1.9, 0.45 * glow, true)
        ctx.save()
        ctx.globalAlpha = 0.5 + 0.5 * glow
        ctx.strokeStyle = VALID_EMPTY
        ctx.lineWidth = Math.max(1.5, size * 0.04)
        roundRect(ctx, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, r.w * 0.18)
        ctx.stroke()
        ctx.restore()
      }
      // ── Alive, or waiting ──
      //
      // The hand is unusable for two to three seconds after every placement
      // (the correction window, the reveal, the resolution), and the only sign
      // of it used to be a little less alpha. Testers read a drag in that
      // window — a drag that does nothing — as a broken game rather than as a
      // turn still running. So the pebbles STOP: no bob, no rim, dimmer. A
      // still hand and a breathing hand are telling apart at a glance, which
      // an alpha step is not.
      const bob = canAct ? Math.sin(age * (selected ? 0.005 : 0.003) + i * 1.4) * r.h * (selected ? 0.05 : 0.025) : 0
      const x = r.x + r.w / 2
      const y = r.y + r.h / 2 + bob - (selected ? r.h * 0.2 : 0)
      const drawSize = r.w * (selected ? 1.12 : 1.02)
      const spr = pebbleSprite(type, 1, 'player', skin, null, size)
      // A rim in the player's own colour while the hand is waiting to be
      // played: on a landscape phone the tray sits beside the board, where a
      // column of unlit stones reads as scenery — one blind tester spent her
      // whole session dragging the enemy's stone because it was the only thing
      // on screen that looked like a game piece (2026-09-11).
      if (canAct && !selected && view.drag === null) {
        const pulse = 0.5 + 0.5 * Math.sin(age * 0.0022 + i * 0.9)
        blit(ctx, glowSprite(PLAYER_ARROW, r.w * 1.7), x, y, r.w * 1.7, r.h * 1.6, 0.1 + 0.12 * pulse, true)
      }
      drawShadow(x, y + (selected ? r.h * 0.2 : 0), drawSize, 1, canAct ? 0.35 : 0.18)
      blitPebble(spr, x, y, drawSize, 1, 1, canAct ? 1 : 0.42)
      // ── The glyph again, lit, on the tray only ──
      //
      // On the board a rune is a big stone read at leisure; in the hand it is
      // a thumbnail read in a hurry, and the same drawing was doing both jobs.
      // A glyph CARVED into stone is a shadow, and at tray size the shadows
      // for the bow, the orb and the sword are the same smudge — two blind
      // testers picked the wrong rune and lost turns to it, and it was the one
      // change one of them asked for: "bow and arcane-orb icons look
      // near-identical at inventory thumbnail size… I wasted ~4 turns shooting
      // an empty lane" (2026-09-13).
      //
      // So the tray lights its glyph in the rune's own colour over a dark
      // backing, which restores the two things a thumbnail can carry — SHAPE
      // and HUE — without touching the stone on the board.
      ctx.save()
      ctx.globalAlpha = canAct ? 1 : 0.42
      ctx.translate(x, y)
      ctx.fillStyle = rgba('#04060e', 0.9)
      drawGlyph(ctx, type, drawSize * 0.52)
      // The PLAYER's cyan, not the rune's own hue. Colouring each rune
      // differently told them apart and cost more than it bought: melee's
      // colour is red, which is this game's word for "the enemy", and side has
      // to read before anything else does. The glyph's SHAPE is what
      // distinguishes a bow from an orb; its colour says whose it is.
      ctx.fillStyle = PLAYER_ARROW
      drawGlyph(ctx, type, drawSize * 0.44)
      ctx.restore()
    }
    // Reroll chip.
    const rr = geom.reroll
    const enabled = canAct && view.rerollsLeft > 0 && view.drag === null
    const chip = rerollSprite(rr.w, rr.h, bakeDpr())
    ctx.save()
    ctx.globalAlpha = enabled ? 1 : 0.45
    if (chip) ctx.drawImage(chip, rr.x, rr.y, rr.w, rr.h)
    ctx.restore()
    if (labels) {
      const lx = rr.x + rr.h * 0.95
      const half = rr.w - rr.h * 1.05
      let px = rr.h * 0.3
      const wide = measureLabel(ctx, labels.reroll, px)
      if (wide > half * 0.96) px *= (half * 0.96) / wide
      // The word is static; only its greying changes. Baked either way.
      const cap = captionSprite(labels.reroll, px, enabled ? '#ffffff' : '#9aa3b8', bakeDpr())
      if (cap) ctx.drawImage(cap.sprite, lx + half * 0.5 - cap.w / 2, rr.y + rr.h * 0.34 - cap.h / 2, cap.w, cap.h)
      else drawText(labels.reroll, lx + half * 0.5, rr.y + rr.h * 0.34, px, enabled ? '#ffffff' : '#9aa3b8')
      drawText(`×${view.rerollsLeft}`, lx + half * 0.5, rr.y + rr.h * 0.72, rr.h * 0.28, enabled ? GOLD : '#9aa3b8')
    }
  }

  /** The fingertip sprite, pressed `press` (0..1), at (fx, fy). */
  const drawFinger = (fx: number, fy: number, press: number, alpha: number, size: number): void => {
    if (!ctx) return
    const finger = fingerSprite(size * 0.95, dpr)
    if (!finger) return
    const fs = size * 0.95 * (1 - press * 0.12)
    ctx.save()
    ctx.globalAlpha = 0.9 * alpha
    // The fingertip is at the sprite's (9, 6) of 24 — offset so it points at the spot.
    ctx.drawImage(finger, fx - fs * 0.38, fy - fs * 0.25, fs, fs)
    ctx.restore()
  }

  /** The bold facing arrow the ghost's flick "turns": `k` 0..1 grows it. */
  const drawGhostArrow = (tx: number, ty: number, dir: Dir, k: number, size: number): void => {
    if (dir === 'omni' || k <= 0) return
    const [ddx, ddy] = DIR_VEC[dir]
    const n = Math.hypot(ddx, ddy) || 1
    drawArrowAt(tx + (ddx / n) * size * 0.62, ty + (ddy / n) * size * 0.56, dir, PLAYER_ARROW, size, k, 1.5)
  }

  /**
   * How far through its turn the re-aim beat is at `t` (0..1 over the beat).
   *
   * Shared by the beat itself and by the stone it is turning, so the arrow and
   * the sword under it swing together — the demonstration has to look like the
   * thing it is demonstrating.
   */
  const reaimTurn = (t: number): number =>
    t < 0.28 ? 0 : t < 0.62 ? easeOutCubic((t - 0.28) / 0.34) : 1

  /**
   * The ghost's re-aim beat: the finger appears on the stone at (tx, ty),
   * presses, flicks half a tile toward `dir` while the arrow turns that way,
   * lets go and fades. Shared by the `reaim` mode (the player's own stone
   * inside a held window) and the tail of a `place` loop with a `reaim`.
   * `t` is 0..1 over the beat; `from` is the facing the arrow turns away from.
   */
  const drawReaimBeat = (t: number, tx: number, ty: number, dir: Dir, from: Dir | null, size: number): void => {
    const [ddx, ddy] = DIR_VEC[dir]
    const n = Math.hypot(ddx, ddy) || 1
    let fx = tx + size * 0.08
    let fy = ty + size * 0.18
    let press = 0
    let alpha = 1
    let turn = 0
    if (t < 0.12) {
      alpha = clamp01(t / 0.1)
    } else if (t < 0.28) {
      press = easeOutQuad((t - 0.12) / 0.16)
    } else if (t < 0.62) {
      press = 1
      const k = reaimTurn(t)
      fx += (ddx / n) * size * 0.5 * k
      fy += (ddy / n) * size * 0.5 * k
      turn = k
    } else if (t < 0.78) {
      press = 1 - easeOutQuad((t - 0.62) / 0.16)
      fx += (ddx / n) * size * 0.5
      fy += (ddy / n) * size * 0.5
      turn = 1
    } else if (t < 0.92) {
      fx += (ddx / n) * size * 0.5
      fy += (ddy / n) * size * 0.5
      alpha = 1 - (t - 0.78) / 0.14
      turn = 1
    } else {
      return
    }
    // The old facing fades as the new one grows, so the turn reads as a turn.
    if (from && from !== dir && from !== 'omni') drawGhostArrow(tx, ty, from, 1 - turn, size)
    drawGhostArrow(tx, ty, dir, turn, size)
    // A ring pulse under the press says "the stone itself is the thing you touch".
    if (press > 0 && ctx) {
      ctx.save()
      ctx.globalAlpha = 0.35 * press * alpha
      ctx.strokeStyle = PLAYER_ARROW
      ctx.lineWidth = size * 0.04
      ctx.beginPath(); ctx.arc(tx, ty, size * 0.42, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    }
    drawFinger(fx, fy, press, alpha, size)
  }

  /**
   * The tile's compass under the ghost's finger — the SAME compass the player
   * gets under their own, painted by the same `paintAimRegion`: four wedges on
   * offer, the one the stone is being carried into lit and grown in from its
   * own edge.
   *
   * Drawn by the ghost rather than by the hover path because the ghost is not
   * a pointer — `view.hover` is null while it plays — but a demonstration that
   * showed a mark the player will never see again would teach nothing. It is
   * the whole compass and not just the chosen wedge on purpose: the lesson is
   * that a tile offers four facings and the release picks one.
   */
  const drawGhostCompass = (cell: Cell, type: RuneType, dir: Dir, k: number, size: number): void => {
    if (!ctx || k <= 0) return
    const rect = geom.tileRect(cell.col, cell.row)
    // The compass's own green, exactly as the player's is (`AIM_OFFER`). It
    // used to be drawn in the RUNE's colour, so the melee lesson — the first
    // thing a new player ever sees — taught the control in red, which is this
    // game's word for "you cannot place that here".
    const color = AIM_OFFER
    paintAimScrim(ctx, rect, k)
    if (aimRegionShape(type) === 'whole') {
      paintAimRegion(ctx, rect, type, 'omni', size, { color: AIM_CHOSEN, lit: true, grow: k, alpha: 0.85 * k })
      return
    }
    // A finger's compass, because the ghost IS a finger: every mark leaned out
    // toward the rim, where a real contact patch would not cover it, and the
    // chosen wedge's outer edge — the side the rune ends up facing — heavy.
    for (const d of aimRegions(type)) {
      const lit = d === dir
      paintAimRegion(ctx, rect, type, d, size, {
        color: lit ? AIM_CHOSEN : color, lit, grow: k, alpha: (lit ? 1 : OFFER_ALPHA) * k, rim: TOUCH_RIM
      })
      const [mx, my, ox, oy] = regionAnchors(type, d)
      const pull = lit ? Math.max(TOUCH_LEAN, CURSOR_LEAN) : TOUCH_LEAN
      const ax = mx + (ox - mx) * pull
      const ay = my + (oy - my) * pull
      drawArrowAt(
        rect.x + ax * rect.w, rect.y + ay * rect.h, d,
        lit ? AIM_CHOSEN : color, size, (lit ? 1 : 0.55) * k, lit ? LIT_SCALE : 0.46
      )
    }
  }

  /**
   * The ghost hand. `place`: lift a hand pebble, carry it to the tile, swipe
   * the facing, release, loop — or, when the script has a `reaim`, DROP it
   * without a swipe and then press the stone again and flick it round, so one
   * loop shows both gestures. `reaim`: only the press-and-flick, on the
   * player's own stone inside a held window.
   */
  const drawGhost = (view: ArenaView): void => {
    if (!ctx || !view.ghost || view.drag || view.phase !== 'planning') return
    // A player who is already aiming at a tile gets their OWN compass on it,
    // and the demonstration would put a second lit wedge on the same tile
    // pointing somewhere else — two answers to "which way will this face", one
    // of them a recording. The lesson stands down as soon as the hover starts.
    if (view.hover && view.hover.cell.col === view.ghost.to.col && view.hover.cell.row === view.ghost.to.row) return
    const size = geom.tile
    const g = view.ghost
    const tx = cx(g.to.col, g.to.row)
    const ty = cy(g.to.col, g.to.row)

    if (g.mode === 'reaim') {
      const dir = g.reaim ?? g.dir
      if (dir === 'omni') return
      const from = view.lock ? view.lock.dir : null
      const period = 1600
      drawReaimBeat((age % period) / period, tx, ty, dir, from, size)
      return
    }

    const slot = geom.hand[g.handIndex]
    const type = view.hand[g.handIndex]
    if (!slot || !type) return
    const sx = slot.x + slot.w / 2
    const sy = slot.y + slot.h / 2
    const reaim = g.reaim && g.reaim !== 'omni' ? g.reaim : null
    const period = reaim ? 3600 : 2600
    const t = (age % period) / period
    const spr = pebbleSprite(type, 1, 'player', view.skin, null, size)
    // Where inside the tile the stone has to be let go for this facing. The
    // ghost aims at the region's own middle, which is what the hit test reads
    // — so the demonstration and the rule cannot drift apart.
    const rect = geom.tileRect(g.to.col, g.to.row)
    const [ax, ay] = regionAnchors(type, g.dir)
    const aimX = rect.x + rect.w * ax
    const aimY = rect.y + rect.h * ay

    if (reaim) {
      // Drop without a swipe, then the re-aim beat on the stone.
      const dropDir = defaultDir(type, 'player')
      if (t < 0.1) {
        const press = easeOutQuad(t / 0.1)
        drawFinger(sx, sy, press, clamp01(t / 0.07), size)
      } else if (t < 0.42) {
        const k = easeInOutQuad((t - 0.1) / 0.32)
        const fx = lerp(sx, tx, k)
        const fy = lerp(sy, ty, k) - Math.sin(k * Math.PI) * size * 0.5
        blitPebble(spr, fx, fy - size * 0.3, size, 1.05, 1.05, 0.92)
        drawFinger(fx, fy, 1, 1, size)
      } else if (t < 0.5) {
        // Released: the stone sits with its default facing.
        const k = (t - 0.42) / 0.08
        blitPebble(spr, tx, ty - size * 0.06, size, 1.05, 1.05, 0.92, glyphSpin(type, dropDir))
        drawGhostArrow(tx, ty, dropDir, 1, size)
        drawFinger(tx, ty, 1 - easeOutQuad(k), 1 - k * 0.6, size)
      } else if (t < 0.92) {
        // The stone swings with the arrow, on the beat's own schedule.
        const beat = (t - 0.5) / 0.42
        const turned = easeAngle(glyphSpin(type, dropDir), glyphSpin(type, reaim), reaimTurn(beat))
        blitPebble(spr, tx, ty - size * 0.06, size, 1.05, 1.05, 0.92, turned)
        drawReaimBeat(beat, tx, ty, reaim, dropDir, size)
      }
      return
    }

    let fx = sx
    let fy = sy
    let pebbleX = sx
    let pebbleY = sy
    let showPebble = false
    let press = 0
    let alpha = 1
    /** The carried stone's turn, so the lesson shows the same cue the game does. */
    let ghostSpin = 0
    // ── The pick-up is a third of the loop, not a tenth ──
    //
    // The demonstration used to spend about a tenth of its loop at the tray
    // and the rest at the target tile — which is also where the enemy's lit
    // stone stands. A tester on a landscape phone, where the tray is a column
    // of unlit stones beside the board, watched that loop for forty seconds
    // and spent her whole session trying to drag the ENEMY's stone: it was the
    // only thing on screen that looked like a game piece, and the finger was
    // always hovering right beside it (2026-09-11).
    //
    // So the finger presses the pebble and STAYS there while its slot lights
    // up, and only then carries it.
    if (t < 0.3) {
      press = easeOutQuad(clamp01(t / 0.12))
      alpha = clamp01(t / 0.08)
      const pick = 0.35 + 0.65 * Math.sin(clamp01((t - 0.05) / 0.25) * Math.PI)
      blit(ctx, glowSprite(PLAYER_ARROW, slot.w * 2), sx, sy, slot.w * 2, slot.h * 1.9, 0.5 * pick, true)
      showPebble = true
      pebbleX = sx
      pebbleY = sy - size * 0.06 * press
    } else if (t < 0.62) {
      press = 1
      const k = easeInOutQuad((t - 0.3) / 0.32)
      fx = lerp(sx, tx, k)
      fy = lerp(sy, ty, k) - Math.sin(k * Math.PI) * size * 0.5
      pebbleX = fx
      pebbleY = fy - size * 0.3
      showPebble = true
    } else if (t < 0.82) {
      // ── The aim, as the game now works ────────────────────────────────
      //
      // The finger does NOT flick away from a stone parked in the middle of
      // the tile — that was the old stroke gesture, and a tutorial that
      // teaches it is teaching the harder way to play. It CARRIES the stone
      // into the region that faces the target and stops there, because that
      // is the whole move now: where you let go is which way it points.
      const k = easeOutCubic((t - 0.62) / 0.2)
      press = 1
      fx = tx + (aimX - tx) * k
      fy = ty + (aimY - ty) * k
      pebbleX = fx
      pebbleY = fy - size * 0.06
      showPebble = true
      // The tile's compass, lighting the region the stone is being carried
      // into — the same mark, from the same painter, that the player sees
      // under their own finger. It carries its own arrow, so no second one.
      drawGhostCompass(g.to, type, g.dir, k, size)
      ghostSpin = easeAngle(0, glyphSpin(type, g.dir), k)
    } else if (t < 0.95) {
      // Released THERE. The stone stays where it was let go.
      press = 1 - easeOutQuad((t - 0.82) / 0.13)
      fx = aimX
      fy = aimY
      pebbleX = aimX
      pebbleY = aimY - size * 0.06
      showPebble = true
      alpha = 1 - (t - 0.82) / 0.13
      drawGhostCompass(g.to, type, g.dir, 1, size)
      ghostSpin = glyphSpin(type, g.dir)
    } else {
      return
    }
    // A carried stone at half alpha, dark on a dark board, is barely there —
    // the tester above never registered that the finger was holding anything.
    if (showPebble) {
      blit(ctx, glowSprite(PLAYER_ARROW, size * 1.5), pebbleX, pebbleY, size * 1.5, size * 1.5, 0.22 * alpha, true)
      blitPebble(spr, pebbleX, pebbleY, size, 1.05, 1.05, 0.92 * alpha, ghostSpin)
    }
    drawFinger(fx, fy, press, alpha, size)
  }

  const drawBanners = (view: ArenaView): void => {
    if (!ctx || !labels) return
    const size = geom.tile
    const bx = geom.board.x + geom.board.w / 2
    const by = geom.board.y + geom.board.h / 2
    if (view.suddenDeath && view.result === null) {
      const pulse = 0.5 + 0.5 * Math.sin(age * 0.008)
      const f = geom.frame
      const spr = frameGlowSprite(f.w, f.h, INVALID)
      const pad = Math.ceil(size * 0.5)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = 0.35 + 0.55 * pulse
      if (spr) ctx.drawImage(spr, f.x - pad, f.y - pad, f.w + pad * 2, f.h + pad * 2)
      else {
        ctx.strokeStyle = INVALID
        ctx.lineWidth = size * 0.06
        roundRect(ctx, f.x, f.y, f.w, f.h, size * 0.2)
        ctx.stroke()
      }
      ctx.restore()
      const since = suddenAt >= 0 ? now - suddenAt : 9999
      if (since < 2200) {
        const pop = easeOutBack(clamp01(since / 500))
        const alpha = since > 1700 ? 1 - (since - 1700) / 500 : 1
        drawText(labels.suddenDeath, bx, by, size * 0.42 * pop, INVALID, 'center', true, alpha)
      }
    }
    if (view.result && resultAt >= 0) {
      const since = now - resultAt
      const pop = easeOutBack(clamp01(since / 520))
      const text = view.result.won ? labels.victory : labels.defeat
      const color = view.result.won ? GOLD : '#c8ccd8'
      const alpha = since > 2600 ? Math.max(0.55, 1 - (since - 2600) / 1500) : 1
      if (view.result.won) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.25 * pop * alpha
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, geom.board.w * 0.7)
        g.addColorStop(0, GOLD)
        g.addColorStop(1, rgba(GOLD, 0))
        ctx.fillStyle = g
        ctx.fillRect(geom.frame.x, geom.frame.y, geom.frame.w, geom.frame.h)
        ctx.restore()
      }
      drawText(text, bx, by, size * 0.62 * pop, color, 'center', true, alpha)
    }
  }

  const drawResetWave = (view: ArenaView): void => {
    if (!ctx || resetAt < 0) return
    const t = clamp01((now - resetAt) / RESET_MS)
    const size = geom.tile
    const b = geom.board
    const y = b.y + t * b.h
    // The last board fading under the sweep.
    for (let i = 0; i < fadeRunes.length; i++) {
      const fr = fadeRunes[i]!
      const gone = fr.y < y ? clamp01((y - fr.y) / (size * 0.6)) : 0
      if (gone >= 1) continue
      blitRuneStone(
        fr.rune.type, fr.rune.level, fr.rune.side, view.skin, fr.rune.faction,
        fr.x, fr.y - gone * size * 0.2, size, glyphSpin(fr.rune.type, fr.rune.dir),
        1 - gone * 0.3, 1 - gone * 0.3, 1 - gone
      )
    }
    ctx.save()
    ctx.beginPath()
    ctx.rect(b.x, b.y, b.w, b.h)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    const g = ctx.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.3)
    g.addColorStop(0, rgba('#8fd0ff', 0))
    g.addColorStop(0.8, rgba('#8fd0ff', 0.7))
    g.addColorStop(1, rgba('#ffffff', 0.9))
    ctx.fillStyle = g
    ctx.fillRect(b.x, y - size * 0.8, b.w, size * 1.1)
    ctx.restore()
    if (now - lastEmitAt > 16) {
      for (let i = 0; i < 3 * qualityMul(); i++) {
        spark(b.x + Math.random() * b.w, y, (Math.random() - 0.5) * size, -size * (0.5 + Math.random()), 300, size * 0.05, '#bfe4ff', { additive: true, shape: 2, drag: 2 })
      }
    }
    if (t >= 1) { resetAt = -1; fadeRunes = [] }
  }

  const drawTexts = (): void => {
    if (!ctx) return
    const texts = getTexts()
    for (let i = 0; i < texts.length; i++) {
      const t = texts[i]!
      const life = t.life / t.maxLife
      const a = life < 0.3 ? life / 0.3 : 1
      const pop = t.crit ? 1 + 0.2 * Math.sin(Math.min(1, (1 - life) * 6) * Math.PI) : 1
      drawText(t.text, t.x, t.y, t.size * pop, t.color, 'center', true, a)
    }
  }

  // ── The frame ──

  const draw = (view: ArenaView, dtMs: number, nowMs: number): void => {
    if (!ctx || cssW === 0) return
    const dt = Number.isFinite(dtMs) ? Math.max(0, Math.min(dtMs, 120)) : 16
    now = nowMs
    age += dt
    labels = view.labels
    sampleFrame(dt)
    // Finish any queued bakes a little at a time, never more than a frame can spare.
    if (!pebbleSpritesReady()) bakePebbleSlice(1.5)

    // ── Edges ──
    if (view.skin !== lastSkin) {
      lastSkin = view.skin
      primedSize = 0
      primePebbleSprites(geom.tile, labels.level(2), view.skin)
    }
    if (view.phase !== lastPhase) {
      if (view.phase === 'planning') { vis.clear() }
      lastPhase = view.phase
    }
    if (view.reveal !== revealRef) revealRef = view.reveal
    if (view.timeline !== tlRef) {
      tlRef = view.timeline
      if (tlRef) initTimeline(tlRef)
      else { local = null; disp = null; dispSource = null }
    }
    if (view.result && resultAt < 0) {
      resultAt = now
      resultWon = view.result.won
      const b = geom.board
      if (resultWon) {
        spawnVictoryShower(b.x, b.y, b.w, b.h, geom.tile, RESULT_COLORS)
        spawnImpactSparks(b.x + b.w / 2, b.y + b.h / 2, geom.tile, GOLD, -Math.PI / 2, 40)
        triggerShake('strong')
      } else {
        spawnDefeatAsh(b.x, b.y, b.w, b.h, geom.tile)
      }
    }
    if (!view.result) resultAt = -1
    if (view.suddenDeath && !lastSudden) suddenAt = now
    lastSudden = view.suddenDeath
    if (view.resetting && resetAt < 0) {
      resetAt = now
      fadeRunes = runeList.map((r) => ({ rune: r, x: cx(r.col, r.row), y: cy(r.col, r.row) }))
      resetVfx()
      vis.clear()
    }
    if (!view.resetting && resetAt >= 0 && now - resetAt > RESET_MS) { resetAt = -1; fadeRunes = [] }
    // Drag sounds: hover / invalid on tile change, aim on dir change.
    const drag = view.drag
    if (drag) {
      const key = drag.over ? cellIndex(drag.over.col, drag.over.row) : -1
      if (key !== lastDragOverKey || drag.kind !== lastDragKind) {
        if (drag.over && drag.kind) playFx(drag.kind === 'invalid' ? 'invalid' : 'hover', drag.kind === 'stack' ? 0.8 : 0.5)
        lastDragOverKey = key
        lastDragKind = drag.kind
      }
      if (drag.aiming && dragDir !== drag.dir) { if (dragDir !== null) playFx('aim', 0.6); dragDir = drag.dir }
      if (!drag.aiming) dragDir = null
    } else { lastDragOverKey = -2; lastDragKind = null; dragDir = null }

    // Quiet time: bake the effects' light before any of it is needed.
    if (view.phase === 'planning') scheduleWarm()

    // ── Which board is on screen ──
    if (view.timeline && local) {
      processTimeline(view.timeline, view)
    } else if (view.board !== dispSource) {
      disp = view.board
      dispSource = view.board
      rebuildRuneList()
    }
    const board = disp ?? view.board

    // ── Static layers ──
    if (!backdrop) bakeBackdrop()
    if (!plate) bakePlate()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (backdrop) ctx.drawImage(backdrop, 0, 0, cssW, cssH)
    else { ctx.fillStyle = '#0b1026'; ctx.fillRect(0, 0, cssW, cssH) }
    drawMotes(dt)
    drawStreakAura(view.streak)
    if (plate) ctx.drawImage(plate, geom.frame.x, geom.frame.y, geom.frame.w, geom.frame.h)

    drawTiles(board, view)
    drawDecals()
    // Under the runes: the compass is a marking on the tile's floor, so a
    // stack target's stone stays readable while its regions are lit.
    drawAimCompass(view)
    drawStandingLines(view)

    // ── The pieces ──
    const breathe = view.phase === 'planning' || view.phase === 'ended'
    if (!view.resetting) drawRunes(view.skin, dt, breathe)
    if (view.timeline && local) drawEvents(view.timeline)
    if (view.phase === 'reveal') drawReveal(view)
    if (view.lock) drawLock(view)

    // ── Particles + text ──
    stepParticles(dt)
    stepTexts(dt)
    stepDecals(dt)
    drawParticles(ctx, toX, toY, 1)
    drawDrag(view)
    drawTexts()

    // ── HUD on canvas ── (none of it in a clean feed; see `CLEAN_FEED`)
    if (!CLEAN_FEED) {
      drawTimer(view)
      // The conquest counters are DOM now (`ConquestCounters.vue`) — redrawing
      // two numbers here sixty times a second was 39 % of render time.
      drawHand(view)
      drawGhost(view)
      drawBanners(view)
    }
    drawResetWave(view)
  }

  const toX = (wx: number): number => wx
  const toY = (wy: number): number => -wy

  const hitTest = (x: number, y: number): HitTarget => {
    for (let i = 0; i < geom.hand.length; i++) {
      const r = geom.hand[i]!
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return { kind: 'hand', index: i }
    }
    const rr = geom.reroll
    if (x >= rr.x && x <= rr.x + rr.w && y >= rr.y && y <= rr.y + rr.h) return { kind: 'reroll' }
    const b = geom.board
    if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
      const col = Math.min(GRID - 1, Math.floor((x - b.x) / geom.tile))
      const row = Math.min(GRID - 1, Math.floor((y - b.y) / geom.tile))
      return { kind: 'tile', col, row }
    }
    return null
  }

  const dispose = (): void => {
    disposed = true
    stopTierWatch()
    offArt()
  }

  return { resize, draw, layout: () => geom, hitTest, invalidate, dispose }
}
