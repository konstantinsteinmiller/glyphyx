/**
 * ─── Glyphyx rules: the whole game's numbers and types in one file ──────────
 *
 * Pure. No Vue, no DOM. Everything the domain modules (`board`, `resolve`,
 * `ai`, `hand`, `campaign`, `match`) and the renderer share lives here so the
 * rule table in the GDD is readable in one place — and so a balance pass is
 * one file.
 *
 * Coordinates: `col` 0..3 left→right, `row` 0..3 TOP→bottom. The player's base
 * row in a 1v1 is row 3 (bottom), the enemy's is row 0. "Up" therefore means
 * `dy = -1`, toward the enemy.
 */

// ─── The board ──────────────────────────────────────────────────────────────

export const GRID = 4
export const TILE_COUNT = GRID * GRID
/** First side to hold this many tiles at the end of a resolution wins. */
export const CONQUEST_TILES = 8
/** Turns before the match is decided on tile count (ties → sudden death). */
export const TURN_LIMIT = 10
/**
 * A tutorial node's limit. Its enemies are dummies that never place, so the
 * turn limit is the ONLY way to lose one — and a lesson must not be losable
 * by taking one's time. Never shown: the HUD prints the turn, not the limit.
 */
export const TUTORIAL_TURN_LIMIT = 200
/**
 * Highest level a stacked rune reaches. A same-type pebble dropped onto a
 * friendly rune of ANY level below this raises it one level; Lv 3 and up
 * extrapolate the GDD's Lv 1 / Lv 2 pair linearly (see `statsFor`).
 */
export const MAX_LEVEL = 8
export const HAND_SIZE = 3
export const REROLLS_PER_MATCH = 2

// ─── Phase timings (ms) ─────────────────────────────────────────────────────

export const PLANNING_MS = 5000
export const REVEAL_MS = 300
export const RESOLVE_MS = 1200
/** The "play again" board wipe. */
export const RESET_MS = 200
/** Breathing room between the end of a resolution and the next planning phase. */
export const BETWEEN_TURNS_MS = 350
/**
 * After a placement locks, the player may still re-aim it for this long by
 * pressing down again and swiping. The reveal waits for the window to close.
 * A second the player does not use costs nothing; a rune facing the wrong way
 * costs the turn.
 */
export const LOCK_WINDOW_MS = 1000
/** A swipe STROKE this long (px) sets the facing — small on purpose: a thumb
 *  flick, not a drag across the tile. */
export const AIM_STROKE_PX = 12
/** How far back the stroke vector is accumulated. Reversals inside the window
 *  read as a new stroke, which is what lets a player correct with one flick. */
export const AIM_STROKE_WINDOW_MS = 140
/** The finger has LANDED on a tile once it has been inside it this long; only
 *  then do strokes aim rather than travel. */
export const AIM_LAND_MS = 60
/** Leaving the landed tile by more than this many tiles from its centre is a
 *  re-target, not a swipe. */
export const AIM_UNLOCK_TILES = 0.85
/** The planning window can never be stretched past this by relief. */
export const PLANNING_MAX_MS = 9000
/**
 * A rune placed by TAP (select a hand pebble, tap a tile) has not been aimed at
 * all, so its correction window is longer than a drag's.
 */
export const LOCK_WINDOW_TAP_MS = 2500
/** During the window, tappable facing chevrons sit this far (in tiles) from the stone's centre… */
export const LOCK_CHEVRON_TILES = 0.78
/** …and a press within this radius (tiles) of a chevron picks that facing. */
export const LOCK_CHEVRON_HIT_TILES = 0.3
/**
 * On a lesson whose ghost script has a `reaim`, the first window of the match
 * does not drain until the player has turned the rune the way the ghost shows —
 * capped here so nobody is stuck forever.
 */
export const LESSON_REAIM_HOLD_MS = 8000
/** A rune's tooltip is shown while it has been placed fewer times than this. */
export const RUNE_TOOLTIP_USES = 6
/** The chest step continues on its own this long after the loot is shown. */
export const CHEST_AUTO_CONTINUE_MS = 8000
/** A lesson cleared for coins alone hands over to the next one after this beat — no chest, no result screen. */
export const LESSON_HANDOVER_MS = 1400
/**
 * The stall-breaker. A match that has run this long is being dragged out, so
 * from here the enemy starts making very stupid mistakes — random moves,
 * skipped turns, softer hits — ramping to full strength at
 * `STALL_BREAKER_FULL_MS`. Unlike every other relief it applies on every
 * difficulty, on lessons, and keeps its skip chance in sudden death: that is
 * what ends a stalled sudden death.
 */
export const STALL_BREAKER_MS = 75_000
export const STALL_BREAKER_FULL_MS = 120_000

/**
 * Where inside the 1.2 s resolution each step lands. `at` is the offset the
 * step's first event starts on, `dur` is how long one event of that step is
 * animated for. `resolve.ts` stamps every event with these so the renderer
 * plays a timeline rather than a list.
 */
export const RESOLVE_TIMELINE = {
  place: { at: 0, dur: 160 },
  // The nuke sits immediately after the placements that fire it and before
  // anything acts: its dead are swept at the end of this slot, so a rune the
  // blast vaporised never gets to swing. It deliberately overlaps `clash` —
  // both are consequences of the same placement step — and the renderer plays
  // them on one clock.
  nuke: { at: 160, dur: 280 },
  clash: { at: 160, dur: 220 },
  aura: { at: 120, dur: 180 },
  heal: { at: 260, dur: 220 },
  ranged: { at: 420, dur: 320 },
  melee: { at: 760, dur: 240 },
  settle: { at: 1000, dur: 200 }
} as const

export type ResolveStep = keyof typeof RESOLVE_TIMELINE

// ─── Runes ──────────────────────────────────────────────────────────────────

/**
 * The roster. The first five are the chapter-1 lessons; the last three are the
 * late unlocks — an area blade, a boulder that ploughs a line, and artillery
 * that shells the far rank. Order is the order they are TAUGHT, and every list
 * in the game (the hand's deck, the shop grid, the campaign map) reads it.
 */
export type RuneType =
  | 'melee' | 'archer' | 'mage' | 'defense' | 'support' | 'cleave' | 'roller' | 'bombard' | 'nuker'
export const RUNE_TYPES: readonly RuneType[] =
  ['melee', 'archer', 'mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker']

export type AimKind = 'cardinal' | 'diagonal' | 'omni'

export interface RuneStats {
  hp: number
  atk: number
}

export interface RuneDef {
  type: RuneType
  aim: AimKind
  lv1: RuneStats
  lv2: RuneStats
  /** Neon glyph colour (the GDD's palette). */
  color: string
}

/** The GDD's roster table, verbatim. */
export const RUNES: Record<RuneType, RuneDef> = {
  melee: { type: 'melee', aim: 'cardinal', lv1: { hp: 3, atk: 2 }, lv2: { hp: 6, atk: 4 }, color: '#ff3b4a' },
  archer: { type: 'archer', aim: 'cardinal', lv1: { hp: 2, atk: 2 }, lv2: { hp: 4, atk: 4 }, color: '#35e07a' },
  mage: { type: 'mage', aim: 'diagonal', lv1: { hp: 2, atk: 3 }, lv2: { hp: 4, atk: 5 }, color: '#b57bff' },
  // Sturdier than the GDD's first draft on purpose: with 1 mitigation a Lv 1
  // shield now stands through four Lv 1 hits of ANY type (a mage's 3 costs it 2)
  // and falls on the fifth — a wall, not a speed bump.
  defense: { type: 'defense', aim: 'omni', lv1: { hp: 9, atk: 0 }, lv2: { hp: 18, atk: 0 }, color: '#4aa8ff' },
  support: { type: 'support', aim: 'omni', lv1: { hp: 3, atk: 0 }, lv2: { hp: 6, atk: 0 }, color: '#ffd23f' },
  // ── The three late unlocks ──
  // A wide axe: the same reach as a sword, swung across THREE tiles (the one
  // it faces and the two forward diagonals). Its damage is a sword's, so its
  // value is the spread — and a lone target it kills no faster.
  cleave: { type: 'cleave', aim: 'cardinal', lv1: { hp: 4, atk: 2 }, lv2: { hp: 8, atk: 4 }, color: '#ff8a2b' },
  // A boulder set rolling down its lane: it hits everything in the line —
  // FRIENDLIES INCLUDED — and stops at the first rune it fails to break.
  roller: { type: 'roller', aim: 'cardinal', lv1: { hp: 3, atk: 2 }, lv2: { hp: 6, atk: 4 }, color: '#00d4c8' },
  // Artillery: it lobs a shell over everything onto the three side-by-side
  // tiles three ranks ahead. Nothing near it is ever in danger, which is the
  // whole trade — it must be planted at the back and defended.
  bombard: { type: 'bombard', aim: 'cardinal', lv1: { hp: 2, atk: 2 }, lv2: { hp: 4, atk: 4 }, color: '#ff4fd8' },
  // The last rune in the game, and the only one that is not a weapon: dropping
  // it CLEARS THE BOARD (see `NUKE_DAMAGE`). Its `atk` is 0 because it never
  // attacks — the blast happens once, on the placement itself — and its body is
  // the thinnest on the roster, because what it leaves behind is a bare tile
  // holder standing in the wreckage.
  nuker: { type: 'nuker', aim: 'omni', lv1: { hp: 2, atk: 0 }, lv2: { hp: 4, atk: 0 }, color: '#e8ff3d' }
}

/** Clamp any number to a real level. */
export const clampLevel = (level: number): number =>
  Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(level) || 1)))

/**
 * The stats of a rune at `level`. Lv 1 and Lv 2 are the GDD table verbatim;
 * above that HP grows by the Lv 1 body per level and attack by the Lv 1 → Lv 2
 * step per level, so a Lv 8 sword is 24 HP / 16 attack and a Lv 8 orb 16 / 17.
 */
export const statsFor = (type: RuneType, level: number): RuneStats => {
  const L = clampLevel(level)
  const { lv1, lv2 } = RUNES[type]
  if (L === 1) return lv1
  if (L === 2) return lv2
  return { hp: lv1.hp * L, atk: lv1.atk + (lv2.atk - lv1.atk) * (L - 1) }
}

/** Defense mitigates this much from EVERY hit it takes. */
export const DEFENSE_MITIGATION = 1
/** A Lv 2 defense grants adjacent friendlies this much temporary shield each round. */
export const DEFENSE_AURA_SHIELD = 1
/** Support heals adjacent friendlies by this much per level. */
export const SUPPORT_HEAL: Record<1 | 2, number> = { 1: 1, 2: 2 }
/** …and one more per level above that: a Lv N cross heals N. */
export const supportHeal = (level: number): number => clampLevel(level)
/** A Lv 2 support grants adjacent friendlies this much bonus attack for the round. */
export const SUPPORT_ATK_BONUS = 1
/** Archer strikes the tile this many steps ahead (skipping the ones before). */
export const ARCHER_RANGE: Record<1 | 2, readonly number[]> = { 1: [2], 2: [2, 3] }
/** The steps an archer of `level` strikes: Lv 2 and above fire at two tiles. */
export const archerRange = (level: number): readonly number[] => (level >= 2 ? ARCHER_RANGE[2] : ARCHER_RANGE[1])
/** Mage beam length in diagonal tiles. */
export const MAGE_REACH = 2
/**
 * A defense rune is a WALL. A beam stops at the first enemy shield on its path
 * (the shield takes the hit, nothing behind it does; a Lv 2 mage's cross then
 * bursts around the shield's own tile), and an archer's arrow — which skips the
 * tile in front of the bow — is INTERCEPTED by an enemy shield standing on any
 * tile it flies over, shield included. Melee is unaffected: a sword only ever
 * reaches the tile it faces.
 */
export const SHIELD_BLOCKS_PROJECTILES = true

/**
 * How many SURVIVING runes a roller of `level` ploughs through before the
 * boulder comes to rest. Lv 1 stops at the first thing it fails to break; a
 * Lv 2 rolls on through one survivor and stops at the second.
 */
export const rollerPierce = (level: number): number => Math.max(0, clampLevel(level) - 1)
/** How far ahead a bombard drops its shell. */
export const BOMBARD_RANGE = 3
/** …and the nearer rank a Lv 2's second shell lands on, dead centre. */
export const BOMBARD_MID_RANGE = 2
/**
 * A shell is LOBBED: it arcs over whatever stands between the tube and the
 * impact, so a shield never intercepts it (unlike an arrow or a beam) and the
 * tiles it flies over are never touched.
 */
export const BOMBARD_IS_LOBBED = true

// ─── The nuke ───────────────────────────────────────────────────────────────
//
// Dropping a nuker detonates it, once, on the resolution it lands in — it is
// the placement that fires, not a turn of attacking, so a nuker that survives
// its own blast is an ordinary (and very soft) tile holder from then on.
//
// The blast reaches EVERY other rune on the board, both sides. What it does is
// decided by the target's LEVEL, not by its hit points, and that is the whole
// design: a Lv 1 rune is vaporised outright, whatever its body, so a 9-HP Lv 1
// shield goes the same way a 2-HP bow does — and a Lv 2 rune always lives
// through the flash, since `NUKE_DAMAGE` is below the smallest Lv 2 body on
// the roster (4). Stacked runes survive the apocalypse; unstacked ones do not.
//
// So it is a reset button with a price. Played from behind it wipes a board the
// player is losing; played from in front it clears everything but the stacks
// they have built, which is what turns a lead into a rout. It always takes the
// player's own Lv 1 runes with it: there is no aiming it, and no exempting
// yourself from it.

/** Runes of THIS level or higher live through a nuke; everything below is vaporised. */
export const NUKE_SURVIVES_LEVEL = 2
/**
 * What a survivor takes. Deliberately less than the smallest Lv 2 body
 * (`archer`/`mage`/`bombard`/`nuker` at 4), so "Lv 2 survives" is a rule the
 * player can rely on rather than an arithmetic accident — a survivor that had
 * already been wounded can still fall, which is honest.
 */
export const NUKE_DAMAGE = 3
/** True for a rune the blast destroys outright rather than damages. */
export const nukeVaporises = (level: number): boolean => clampLevel(level) < NUKE_SURVIVES_LEVEL

// ─── Rune ranks: the permanent, buyable upgrade ─────────────────────────────
//
// Every rune carries a RANK from 0 to `MAX_RUNE_RANK`, bought with coins, a
// rewarded video, or the rotating free gift. A rank is worth exactly
// `RANK_HP_PER_RANK` maximum hit points on the PLAYER's runes of that type,
// and nothing else.
//
// ── Why hit points, and why the same number for every rune ──
//
// The brief was "almost minimal per rank … exceptionally well balanced to not
// make one rune OP", and those two pull in the same direction. Damage is the
// dangerous currency here: the whole game is fought with attack values of 2 to
// 5 against bodies of 2 to 9, so a single point of attack on a sword is a 50 %
// damage buff and would end the roster's balance on its own. Hit points are the
// safe currency — they make a rune harder to remove without making it kill
// anything faster — and giving every rune the SAME number per rank means no
// rune can pull ahead of another by construction. There is no per-rune table to
// tune, and therefore no per-rune table to get wrong.
//
// The bonus is flat, not scaled by level, which self-balances the other way:
// +5 HP is transformative on a Lv 1 bow with a body of 2 and a rounding error
// on a Lv 8 sword with 24. It is worth most exactly where a struggling player
// needs it, and least where a player is already winning.
//
// The enemy never has ranks. This is the player's ladder.

export const MAX_RUNE_RANK = 5
/** Maximum hit points a single rank adds to the player's runes of that type. */
export const RANK_HP_PER_RANK = 1
/** Coins for rank 1, 2, 3, 4, 5. A full rune is 1390; the whole roster 12510. */
export const RANK_PRICES: readonly number[] = [70, 140, 240, 380, 560]

export const clampRank = (rank: number): number =>
  Math.max(0, Math.min(MAX_RUNE_RANK, Math.floor(Number(rank) || 0)))

/** The coin price of the NEXT rank from `rank`, or `null` at the cap. */
export const rankPrice = (rank: number): number | null =>
  clampRank(rank) >= MAX_RUNE_RANK ? null : RANK_PRICES[clampRank(rank)]!

/** The maximum-HP bonus a rune of `rank` carries. */
export const rankHpBonus = (rank: number): number => clampRank(rank) * RANK_HP_PER_RANK

/**
 * The stats of a player rune, rank included — the one function that knows a
 * rank exists. `statsFor` stays the roster's own table, shared with the enemy
 * and with every display that means "what this rune IS"; this is what a rune
 * the PLAYER places actually stands up with.
 */
export const statsWithRank = (type: RuneType, level: number, rank: number): RuneStats => {
  const base = statsFor(type, level)
  return { hp: base.hp + rankHpBonus(rank), atk: base.atk }
}

/** Rank per rune type, as it is persisted and passed into a match. Absent = 0. */
export type RankTable = Partial<Record<RuneType, number>>

/** The rank of `type` in `ranks`, clamped. Safe on a blob from an older build. */
export const rankOf = (ranks: RankTable | undefined, type: RuneType): number =>
  clampRank(ranks?.[type] ?? 0)

// ─── The rotating free upgrade ──────────────────────────────────────────────
//
// One rank, on one rune, is free at any moment — no coins, no video — and which
// rune it is changes every `FREE_RANK_WINDOW_MS`. It is deliberately a
// ROTATION rather than a stock: a player who takes it has to come back for the
// next one, and a player who is away is never accumulating a debt of unclaimed
// gifts. The window is derived from the clock rather than stored, so it keeps
// turning while the game is closed, and it cannot be farmed by reloading.

/** How long one free upgrade stands before another rune is drawn. */
export const FREE_RANK_WINDOW_MS = 20 * 60_000

/** The window index `now` falls in. The same integer on every device. */
export const freeRankWindow = (now: number): number =>
  Math.floor(Math.max(0, now) / FREE_RANK_WINDOW_MS)

/** ms until the current window ends — the countdown on the gift's card. */
export const freeRankWindowLeft = (now: number): number =>
  FREE_RANK_WINDOW_MS - (Math.max(0, now) % FREE_RANK_WINDOW_MS)

// ─── Sides, factions, directions ────────────────────────────────────────────

export type Side = 'player' | 'enemy'
export type Owner = Side | 'neutral'

/**
 * Who the enemy runes belong to. `skeleton` is the tutorial's training dummy
 * faction. In a siege the three real factions share ONE side (`enemy`) — they
 * never attack each other — and the faction only decides the deck, the AI's
 * taste and the pebble's tint.
 */
export type Faction = 'skeleton' | 'goblin' | 'orc' | 'undead'
export const FACTIONS: readonly Faction[] = ['skeleton', 'goblin', 'orc', 'undead']

export type Dir = 'up' | 'down' | 'left' | 'right' | 'ul' | 'ur' | 'dl' | 'dr' | 'omni'
export const CARDINALS: readonly Dir[] = ['up', 'right', 'down', 'left']
export const DIAGONALS: readonly Dir[] = ['ul', 'ur', 'dr', 'dl']

/** `[dx, dy]` per direction; `omni` is `[0, 0]`. Up is toward row 0. */
export const DIR_VEC: Record<Dir, readonly [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
  ul: [-1, -1], ur: [1, -1], dl: [-1, 1], dr: [1, 1],
  omni: [0, 0]
}

/** The directions a rune type may face. */
export const dirsFor = (type: RuneType): readonly Dir[] => {
  const aim = RUNES[type].aim
  return aim === 'cardinal' ? CARDINALS : aim === 'diagonal' ? DIAGONALS : ['omni']
}

/** The default facing when the player does not swipe: toward the enemy. */
export const defaultDir = (type: RuneType, side: Side): Dir => {
  const aim = RUNES[type].aim
  if (aim === 'omni') return 'omni'
  if (aim === 'cardinal') return side === 'player' ? 'up' : 'down'
  return side === 'player' ? 'ur' : 'dl'
}

/**
 * Snap a swipe vector to the nearest legal facing for `type`. `dx`/`dy` are in
 * screen space (y down). Returns the default when the swipe is shorter than
 * `threshold`.
 */
export const snapDir = (
  type: RuneType, side: Side, dx: number, dy: number, threshold: number
): Dir => {
  const aim = RUNES[type].aim
  if (aim === 'omni') return 'omni'
  if (Math.hypot(dx, dy) < threshold) return defaultDir(type, side)
  const angle = Math.atan2(dy, dx) // -PI..PI, 0 = right, -PI/2 = up
  if (aim === 'cardinal') {
    const a = ((angle + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2)
    const q = Math.round(a) % 4
    return (['right', 'down', 'left', 'up'] as const)[q]!
  }
  // Diagonal: the four quadrants of screen space are already centred on the
  // diagonals (down-right is 0..90°), so a plain floor is the sector.
  const a = ((angle + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2)
  const q = Math.floor(a) % 4
  return (['dr', 'dl', 'ul', 'ur'] as const)[q]!
}

// ─── Aiming by POSITION: the tile's own compass ─────────────────────────────
//
// A tile is carved into regions, one per facing the rune may take, and the
// pointer's position INSIDE the tile picks the facing. Hover the top of a tile
// and the sword faces up; slide to the left edge and it faces left. Nothing is
// measured against where the pointer was a moment ago, so there is no stroke to
// get wrong, no threshold to miss, and — on a mouse, where the hover is visible
// before the click — nothing left to correct afterwards.
//
// The carving follows the rune's own `aim`, so the regions are always exactly
// the facings that rune HAS:
//
//   cardinal → four TRIANGLES cut by the tile's diagonals (up/right/down/left);
//              the triangle's wide edge is the edge the rune faces, which is
//              what makes it readable at a glance.
//   diagonal → four QUADRANTS cut by the midlines (ul/ur/dr/dl); the orb faces
//              the corner its quadrant touches.
//   omni     → one region, the whole tile: a shield has nothing to aim.
//
// Unit space: `fx`/`fy` run 0..1 across the tile, y DOWN, matching screen space
// and `DIR_VEC`. Pure geometry — the renderer draws these, the input reads
// them, and neither owns them.

export type AimRegionShape = 'diagonals' | 'quadrants' | 'whole'

export const aimRegionShape = (type: RuneType): AimRegionShape => {
  const aim = RUNES[type].aim
  return aim === 'cardinal' ? 'diagonals' : aim === 'diagonal' ? 'quadrants' : 'whole'
}

/** The facings of `type`, in the order their regions are drawn. */
export const aimRegions = (type: RuneType): readonly Dir[] => dirsFor(type)

/**
 * The facing the point (`fx`, `fy`) inside a tile picks for `type`.
 *
 * Every point lands in exactly one region — there is no dead zone in the
 * middle. A centre dead zone tested worse than this: it makes the tile's
 * centre, which is where a pointer arrives from, the one place that says
 * nothing, so the rune's facing flickers as the pointer crosses it.
 * Out-of-range coordinates are clamped rather than rejected: a pointer a
 * fraction of a pixel outside the tile it is over should still aim it.
 */
export const dirFromCellPoint = (type: RuneType, fx: number, fy: number): Dir => {
  const shape = aimRegionShape(type)
  if (shape === 'whole') return 'omni'
  const x = Math.min(1, Math.max(0, Number.isFinite(fx) ? fx : 0.5))
  const y = Math.min(1, Math.max(0, Number.isFinite(fy) ? fy : 0.5))
  if (shape === 'quadrants') {
    return y < 0.5 ? (x < 0.5 ? 'ul' : 'ur') : (x < 0.5 ? 'dl' : 'dr')
  }
  // Which side of the two diagonals the point falls on. `y < x` is above the
  // ↘ diagonal, `y < 1 - x` is above the ↙ one; the pair names the triangle.
  const aboveMain = y < x
  const aboveAnti = y < 1 - x
  if (aboveMain && aboveAnti) return 'up'
  if (aboveMain) return 'right'
  if (aboveAnti) return 'left'
  return 'down'
}

/**
 * The region's outline in unit tile space, as a closed polygon — a triangle
 * with its apex at the tile's centre, or a corner quadrant. `omni` is the whole
 * tile. Returned counter-clockwise from the region's own edge so a renderer can
 * grow it from that edge toward the centre.
 */
export const aimRegionPolygon = (type: RuneType, dir: Dir): readonly (readonly [number, number])[] => {
  const shape = aimRegionShape(type)
  if (shape === 'whole') return [[0, 0], [1, 0], [1, 1], [0, 1]]
  if (shape === 'quadrants') {
    switch (dir) {
      case 'ul': return [[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]]
      case 'ur': return [[0.5, 0], [1, 0], [1, 0.5], [0.5, 0.5]]
      case 'dr': return [[0.5, 0.5], [1, 0.5], [1, 1], [0.5, 1]]
      default: return [[0, 0.5], [0.5, 0.5], [0.5, 1], [0, 1]]
    }
  }
  switch (dir) {
    case 'up': return [[0, 0], [1, 0], [0.5, 0.5]]
    case 'right': return [[1, 0], [1, 1], [0.5, 0.5]]
    case 'down': return [[1, 1], [0, 1], [0.5, 0.5]]
    default: return [[0, 1], [0, 0], [0.5, 0.5]]
  }
}

// ─── Board state ────────────────────────────────────────────────────────────

export interface Cell {
  col: number
  row: number
}

export const cellIndex = (col: number, row: number): number => row * GRID + col
export const inBounds = (col: number, row: number): boolean =>
  col >= 0 && col < GRID && row >= 0 && row < GRID
export const cellKey = (c: Cell): string => `${c.col},${c.row}`
export const sameCell = (a: Cell, b: Cell): boolean => a.col === b.col && a.row === b.row

// ─── The shapes of the three late runes ─────────────────────────────────────
//
// Cleave, roller and bombard hit patterns rather than a single tile, and three
// modules need the SAME pattern: the resolver (which does the damage), the AI
// (which scores through the resolver, so it gets them for free) and the
// renderer (which draws the arc, the lane and the shell's footprint before
// anything is placed). They live here, pure, so a tuning change is one edit.

/** The unit vector 90° clockwise from `dir` in screen space. `[0, 0]` for `omni`. */
export const perpVec = (dir: Dir): readonly [number, number] => {
  const [dx, dy] = DIR_VEC[dir]
  return [-dy, dx]
}

/**
 * The three tiles a cleave strikes from `from` facing `dir`: the tile it faces
 * and the two beside that one — a fan across the rank ahead. Off-board tiles
 * are dropped, so a cleave swung along the edge simply hits fewer.
 */
export const cleaveCells = (from: Cell, dir: Dir): Cell[] => {
  const [dx, dy] = DIR_VEC[dir]
  if (dx === 0 && dy === 0) return []
  const [px, py] = perpVec(dir)
  const out: Cell[] = []
  for (const side of [-1, 0, 1] as const) {
    const col = from.col + dx + px * side
    const row = from.row + dy + py * side
    if (inBounds(col, row)) out.push({ col, row })
  }
  return out
}

/**
 * Where a bombard's shells land: the three side-by-side tiles `BOMBARD_RANGE`
 * ranks ahead, and — from Lv 2 — one more dead ahead at `BOMBARD_MID_RANGE`.
 * Off-board tiles are dropped, so a tube with its back to the wrong edge has
 * nothing to shell and does nothing at all.
 */
export const bombardCells = (from: Cell, dir: Dir, level: number): Cell[] => {
  const [dx, dy] = DIR_VEC[dir]
  if (dx === 0 && dy === 0) return []
  const [px, py] = perpVec(dir)
  const out: Cell[] = []
  const push = (col: number, row: number): void => {
    if (inBounds(col, row) && !out.some((c) => c.col === col && c.row === row)) out.push({ col, row })
  }
  if (clampLevel(level) >= 2) {
    push(from.col + dx * BOMBARD_MID_RANGE, from.row + dy * BOMBARD_MID_RANGE)
  }
  for (const side of [-1, 0, 1] as const) {
    push(from.col + dx * BOMBARD_RANGE + px * side, from.row + dy * BOMBARD_RANGE + py * side)
  }
  return out
}

/** Every tile a roller's lane covers, from the tile in front of it to the edge. */
export const rollerLane = (from: Cell, dir: Dir): Cell[] => {
  const [dx, dy] = DIR_VEC[dir]
  if (dx === 0 && dy === 0) return []
  const out: Cell[] = []
  for (let i = 1; i < GRID; i++) {
    const col = from.col + dx * i
    const row = from.row + dy * i
    if (!inBounds(col, row)) break
    out.push({ col, row })
  }
  return out
}

export interface Rune extends Cell {
  /** Stable per match; the renderer keys its visual objects on it. */
  id: number
  type: RuneType
  side: Side
  /** Set for enemy runes; `null` for the player's. */
  faction: Faction | null
  level: number
  hp: number
  maxHp: number
  dir: Dir
  /** Temporary shield HP from a neighbouring Lv 2 defense. Rebuilt every round. */
  shield: number
  /** Temporary attack bonus from a neighbouring Lv 2 support. Rebuilt every round. */
  atkBonus: number
}

export interface Tile extends Cell {
  owner: Owner
  /** The faction whose territory this is, for the tint. `null` unless enemy-owned. */
  faction: Faction | null
  /** The rune standing on it, or `null`. */
  runeId: number | null
}

export interface BoardState {
  /** 16 tiles, index = `row * GRID + col`. */
  tiles: Tile[]
  /** Every living rune, keyed by id. Plain object so it is JSON-serialisable. */
  runes: Record<number, Rune>
  nextRuneId: number
}

/** A committed placement. `faction` is which enemy faction placed it (enemy only). */
export interface Move {
  side: Side
  faction: Faction | null
  type: RuneType
  col: number
  row: number
  dir: Dir
  /**
   * The level a placement on an EMPTY tile lands at (default 1). Set by
   * `commitPlayerMove` when the player carries a power-rune boon for this
   * type; a stack onto an existing rune ignores it and merges as usual.
   */
  level?: number
}

// ─── Resolution events (the domain → renderer contract) ─────────────────────

/** A frozen copy of a rune at the moment an event refers to it. */
export type RuneSnapshot = Readonly<Rune>

/**
 * What an attack LOOKS like, which is not the same as which rune threw it: the
 * renderer picks its animation and its sound off this and nothing else.
 *
 *   `blade`  a sword's swing at the tile it faces
 *   `arrow`  an arrow that skips the tile in front of the bow
 *   `beam`   the orb's diagonal beam
 *   `cleave` the axe's fan across the three tiles ahead
 *   `roll`   the boulder travelling down its lane
 *   `shell`  the bombard's lobbed round, drawn as an arc to its footprint
 */
export type Weapon = 'blade' | 'arrow' | 'beam' | 'cleave' | 'roll' | 'shell'

export interface Hit {
  target: RuneSnapshot
  /** Damage that actually landed (after mitigation and shields). */
  amount: number
  /** Damage eaten by mitigation + temporary shield. */
  absorbed: number
  hpAfter: number
}

/**
 * One animated beat. `at` / `dur` are ms inside the resolution window, stamped
 * from `RESOLVE_TIMELINE`, so the renderer plays them on a clock. Events of one
 * step share the same `at`; the renderer may stagger them a few ms for feel.
 */
export type ResolveEvent =
  /** A placement landed on an empty tile. */
  | { kind: 'place'; at: number; dur: number; rune: RuneSnapshot }
  /** A placement stacked onto a friendly rune — it is now Lv 2 (`rune` is the merged result). */
  | { kind: 'merge'; at: number; dur: number; rune: RuneSnapshot }
  /** Both sides dropped on the same empty tile. `survivor` is `null` when both shattered. */
  | { kind: 'clash'; at: number; dur: number; col: number; row: number; a: RuneSnapshot; b: RuneSnapshot; survivor: RuneSnapshot | null }
  /** A Lv 2 defense shielded its neighbours. */
  | { kind: 'aura'; at: number; dur: number; from: RuneSnapshot; to: RuneSnapshot[]; shield: number }
  /** A support healed a neighbour (`amount` may be 0 at full HP). */
  | { kind: 'heal'; at: number; dur: number; from: RuneSnapshot; to: RuneSnapshot; amount: number; hpAfter: number }
  /** A Lv 2 support buffed a neighbour's attack. */
  | { kind: 'buff'; at: number; dur: number; from: RuneSnapshot; to: RuneSnapshot; bonus: number }
  /**
   * An attack. `path` is every cell the projectile / beam / blade crosses in
   * order (including the cells it skips), `hits` what it damaged. `weapon`
   * picks the animation.
   */
  | { kind: 'shot'; at: number; dur: number; from: RuneSnapshot; weapon: Weapon; path: Cell[]; hits: Hit[] }
  /** The mage's Lv 2 cross explosion at the beam's end. */
  | { kind: 'explode'; at: number; dur: number; from: RuneSnapshot; center: Cell; cells: Cell[]; hits: Hit[] }
  /**
   * A nuker detonated on placement. `hits` are the Lv 2+ runes that lived
   * through it (both sides); `vaporised` are the Lv 1 runes it destroyed
   * outright, which get no `Hit` because no damage figure describes them. The
   * `shatter` events for those follow at the end of the step, as with any
   * other death.
   */
  | { kind: 'nuke'; at: number; dur: number; from: RuneSnapshot; hits: Hit[]; vaporised: RuneSnapshot[] }
  /** A rune reached 0 HP. */
  | { kind: 'shatter'; at: number; dur: number; rune: RuneSnapshot }
  /** A Lv 2 sword pushed its surviving target one tile back. */
  | { kind: 'knockback'; at: number; dur: number; rune: RuneSnapshot; from: Cell; to: Cell }
  /** A tile changed hands (or went neutral). */
  | { kind: 'capture'; at: number; dur: number; col: number; row: number; owner: Owner; faction: Faction | null; prev: Owner }
  /** Two or more enemy runes shattered in this resolution. */
  | { kind: 'combo'; at: number; dur: number; count: number; side: Side }

// ─── Match ──────────────────────────────────────────────────────────────────

export type MatchPhase = 'planning' | 'reveal' | 'resolve' | 'ended'

export type Objective = 'conquest' | 'eliminate' | 'siege'
export type MatchMode = '1v1' | 'siege'

export type AiLevel = 'passive' | 'easy' | 'medium' | 'hard' | 'brutal'

/** Where a faction's territory is at match start. */
export type EnemyPost = 'top' | 'north' | 'west' | 'east'

export interface EnemySetup {
  faction: Faction
  post: EnemyPost
  /** The faction's deck — the hand is drawn from this. */
  deck: RuneType[]
  ai: AiLevel
  /**
   * Multiplier on the faction's attack. `0` is a training dummy: it still
   * places and aims (so the reveal teaches something) but can never hurt.
   */
  atkMul: number
}

/** A rune standing on the board before turn 1. */
export interface PresetRune {
  side: Side
  faction: Faction | null
  type: RuneType
  col: number
  row: number
  dir: Dir
  level?: number
  /** Override the HP (the 1-HP skeleton of node 1-1). */
  hp?: number
  /**
   * Override the maximum separately, to stand a WOUNDED rune on the board
   * (`hp: 1, maxHp: 3` — the sword the support lesson saves). Defaults to
   * `hp`, so a plain override still makes a full-health rune.
   */
  maxHp?: number
}

export type SkinId = 'river' | 'obsidian' | 'jade' | 'amber' | 'marble' | 'ember'
export const SKIN_IDS: readonly SkinId[] = ['river', 'obsidian', 'jade', 'amber', 'marble', 'ember']

export interface ChestReward {
  coins: number
  unlockRune: RuneType | null
  unlockSkin: SkinId | null
  /** The chapter-end chest: bigger art, longer celebration. */
  big: boolean
}

/**
 * Only a REAL gift earns the chest ceremony: a new rune or a new skin. Coins
 * alone are banked the moment the node is cleared and shown on the result
 * screen (a lesson simply moves on) — a fancy chest for twenty coins is a
 * screen the player has to tap through for nothing.
 */
export const chestIsGift = (chest: ChestReward | null | undefined): boolean =>
  !!chest && (chest.unlockRune !== null || chest.unlockSkin !== null)

/**
 * Which lesson a node is. `drag` and `stack` teach a GESTURE; every other beat
 * is named after the rune it introduces, which is what lets the ghost, the
 * control hint and the i18n key all be derived from the beat alone. The last
 * three sit in chapters 2 and 3, one node after the chest that hands their
 * rune over.
 */
export type TutorialBeat =
  | 'drag' | 'archer' | 'stack' | 'mage' | 'defense' | 'support'
  | 'cleave' | 'roller' | 'bombard' | 'nuker'
  | null

/** The ghost hand's script for a tutorial node: which rune, onto which tile, facing where. */
export interface GhostSpec {
  type: RuneType
  to: Cell
  /** The facing the lesson expects in the end. */
  dir: Dir
  /**
   * When set, the ghost DROPS the pebble without a swipe (it lands with the
   * default facing) and then presses the stone again and flicks toward
   * `reaim` — the correction window is the lesson. The window of the player's
   * own placement holds until they have turned it this way (or
   * `LESSON_REAIM_HOLD_MS` passes).
   */
  reaim?: Dir
}

export interface NodeConfig {
  /** Global 1-based node index. */
  id: number
  chapter: number
  /** 1..8 inside the chapter. */
  index: number
  mode: MatchMode
  objective: Objective
  enemies: EnemySetup[]
  presets: PresetRune[]
  /** Restrict the player's deck for this node; `null` = everything unlocked. */
  playerDeck: RuneType[] | null
  tutorial: TutorialBeat
  /** The ghost hand's script, on tutorial nodes. */
  ghost?: GhostSpec
  /** `false` on the tutorial nodes: planning waits for the player. */
  timer: boolean
  turnLimit: number
  reward: ChestReward
  /** Deterministic seed for the AI's dice. */
  seed: number
}

// ─── Adaptive difficulty ────────────────────────────────────────────────────
//
// The enemy plays WORSE, and sometimes not at all, when the player is
// struggling — never announced, never applied to a tutorial, and never in
// sudden death. Computed by `adaptive.ts` from the numbers below; applied by
// `match.beginPlanning` / `resolveCurrentTurn` and the battle clock.

export interface HandicapInput {
  difficulty: 'easy' | 'medium' | 'hard'
  /** Losses on THIS node before this match (persisted). */
  nodeFails: number
  /** Consecutive losses overall (persisted). */
  lossStreak: number
  /** The player let the previous planning window run out. */
  playerPassedLastTurn: boolean
  /** Windows the player let run out in this match so far. */
  passesThisMatch: number
  /** enemyTiles − playerTiles on the board right now. */
  tileDeficit: number
  /** enemy runes − player runes on the board right now. */
  runeDeficit: number
  turn: number
  suddenDeath: boolean
  /** A tutorial node never needs relief and never gets any (the stall-breaker excepted). */
  tutorial: boolean
  /** ms since the match began — feeds the stall-breaker. */
  matchElapsedMs: number
}

export interface Handicap {
  /** Probability the acting faction places nothing this turn. */
  skipChance: number
  /** Added to the AI's random-move chance (see `ai.randomChance`). */
  extraRandom: number
  /** Multiplier on every enemy attack (≤ 1). */
  atkMul: number
  /** The player's planning window this turn. */
  timerMs: number
}

export const NO_HANDICAP: Readonly<Handicap> = { skipChance: 0, extraRandom: 0, atkMul: 1, timerMs: PLANNING_MS }

export interface MatchResult {
  won: boolean
  /** Why it ended. */
  reason: 'conquest' | 'eliminated' | 'overrun' | 'turnLimit' | 'suddenDeath' | 'siegeHeld' | 'siegeBroken'
  turns: number
  playerTiles: number
  enemyTiles: number
  maxCombo: number
  kills: number
  durationMs: number
}

export interface MatchState {
  config: NodeConfig
  board: BoardState
  /** 1-based; increments after each resolution. */
  turn: number
  phase: MatchPhase
  hand: RuneType[]
  deck: RuneType[]
  rerollsLeft: number
  /** The player's committed move for this turn, or `null`. */
  playerMove: Move | null
  /** The enemy moves for this turn (decided at planning start, hidden until reveal). */
  enemyMoves: Move[]
  /** Which siege faction places next (round-robin over `config.enemies`). */
  enemyTurnIndex: number
  suddenDeath: boolean
  result: MatchResult | null
  maxCombo: number
  kills: number
  /** PRNG state — plain number so the whole match is JSON-serialisable. */
  rng: number
  startedAt: number
  /** The relief in force this turn (set by `beginPlanning`, read by the resolver). */
  handicap: Handicap
  /**
   * Power-rune boons bought in the shop: type → the level the player's FIRST
   * placement of that type lands at this match. Spent on commit.
   */
  boons: Partial<Record<RuneType, number>>
  /**
   * The player's permanent rune ranks, copied in when the match is created so
   * the whole match stays a pure function of its state — a rank bought
   * mid-match cannot change a board that is already standing. The enemy never
   * has ranks; this is only ever applied to the player's side.
   */
  ranks: RankTable
}

// ─── Economy ────────────────────────────────────────────────────────────────

/** Coins for winning a node, before multipliers. */
export const WIN_COINS_BASE = 20
/** …plus this per tile held at the end. */
export const WIN_COINS_PER_TILE = 2
/** …plus this per enemy rune shattered. */
export const WIN_COINS_PER_KILL = 1
/** A lost match still pays this fraction of the base. */
export const LOSS_COINS_FRACTION = 0.25
/** Consecutive wins → gold multiplier. Index = streak (clamped). */
export const STREAK_MULTIPLIERS: readonly number[] = [1, 1, 1.5, 2, 2.5, 3]
export const streakMultiplier = (streak: number): number =>
  STREAK_MULTIPLIERS[Math.max(0, Math.min(STREAK_MULTIPLIERS.length - 1, Math.floor(streak)))]!

/** Rewarded ×3 on the result screen. */
export const REWARD_MULTIPLIER = 3

/** The forge: coins per hour of absence, and the longest absence it pays for. */
export const FORGE_COINS_PER_HOUR = 12
export const FORGE_CAP_HOURS = 8
/** A brand-new player finds the forge already this many minutes along. */
export const FORGE_HEAD_START_MIN = 45

/** The silhouette a skin's stones are cut to. */
export type PebbleShape = 'pebble' | 'shard' | 'oval' | 'hex' | 'disc' | 'slab'
/** How a skin's glyph is drawn into the stone. */
export type GlyphStyle = 'engraved' | 'neon' | 'inlay' | 'gem' | 'carved' | 'ember'

export interface SkinDef {
  id: SkinId
  price: number
  shape: PebbleShape
  glyph: GlyphStyle
  /** Stone body colours: lit face, base, shadowed edge, rim light. */
  hi: string
  base: string
  lo: string
  rim: string
  /** The glyph's ink (the cut) and its glow. `null` glow = the rune type's own neon. */
  ink: string
  glow: string | null
}

/**
 * Six materials, six silhouettes, six ways of carving — a skin has to be
 * recognisable from the hand tray, not only from a shop card. Prices climb
 * with how much the stone changes.
 */
export const SKINS: Record<SkinId, SkinDef> = {
  // The default: warm river sandstone, an irregular rounded pebble, the glyph cut in and lit by its own colour.
  river: { id: 'river', price: 0, shape: 'pebble', glyph: 'engraved', hi: '#d9c9a6', base: '#b39b73', lo: '#7d6547', rim: '#f2e6c8', ink: '#2c2218', glow: null },
  // Black volcanic glass, knapped into an angular shard; the glyph is a cold neon line.
  obsidian: { id: 'obsidian', price: 120, shape: 'shard', glyph: 'neon', hi: '#4a4f6a', base: '#1b1d2b', lo: '#0a0b12', rim: '#9fb0ff', ink: '#05060a', glow: '#8ff0ff' },
  // Polished green jade, a smooth oval, the glyph inlaid in gold.
  jade: { id: 'jade', price: 180, shape: 'oval', glyph: 'inlay', hi: '#6fcf9a', base: '#2f8a5f', lo: '#16503a', rim: '#c8ffe4', ink: '#0d3324', glow: '#ffd76a' },
  // Amber cut into a hexagonal gem with dark inclusions; the glyph glows from inside.
  amber: { id: 'amber', price: 220, shape: 'hex', glyph: 'gem', hi: '#ffcf6b', base: '#d98a1e', lo: '#7a3f08', rim: '#fff0b0', ink: '#3d1e05', glow: '#ffe28a' },
  // White marble turned into a coin-like disc, grey veins, the glyph carved deep and shadowed.
  marble: { id: 'marble', price: 260, shape: 'disc', glyph: 'carved', hi: '#ffffff', base: '#d7dbe3', lo: '#8f97a6', rim: '#ffffff', ink: '#3a4150', glow: null },
  // A cracked slab of cooled lava; the glyph burns orange through the fissures.
  ember: { id: 'ember', price: 320, shape: 'slab', glyph: 'ember', hi: '#5a3a36', base: '#2f1c1a', lo: '#140908', rim: '#ff9a4a', ink: '#ff5a1f', glow: '#ffb060' }
}

/** Every player starts with this rune and this skin. */
export const STARTING_RUNES: readonly RuneType[] = ['melee']
export const STARTING_SKIN: SkinId = 'river'

// ─── Factions ───────────────────────────────────────────────────────────────

export interface FactionDef {
  id: Faction
  deck: RuneType[]
  /** Pebble rim / glyph tint for the faction's runes. */
  color: string
  /** The painted monster strip under `public/images/monsters/` used as the commander. */
  avatar: string
}

export const FACTION_DEFS: Record<Faction, FactionDef> = {
  skeleton: { id: 'skeleton', deck: ['melee', 'melee', 'archer'], color: '#d9d9e8', avatar: 'bonecap' },
  goblin: { id: 'goblin', deck: ['archer', 'archer', 'archer', 'melee', 'support'], color: '#8dff5a', avatar: 'nibbler' },
  orc: { id: 'orc', deck: ['melee', 'melee', 'melee', 'defense', 'support'], color: '#ff5a3d', avatar: 'snaggletusk' },
  undead: { id: 'undead', deck: ['mage', 'mage', 'mage', 'defense', 'archer'], color: '#c98cff', avatar: 'marrowknight' }
}
