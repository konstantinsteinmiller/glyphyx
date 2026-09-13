/**
 * ─── The arena view: what the renderer draws and what the input drives ──────
 *
 * The contract between three modules that are built independently:
 *
 *   `useBattle`      owns the match and PRODUCES an `ArenaView` every frame
 *   `useArenaArt`    CONSUMES the view and draws it on the canvas
 *   `useArenaInput`  turns pointer events into the `BattleApi` drag calls
 *
 * The view is a PLAIN MUTABLE OBJECT, not a Vue ref: it is read sixty times a
 * second by a canvas loop, and reactive proxies in that loop are what drop
 * frames on a phone. The HUD gets the handful of numbers it needs as refs on
 * `BattleApi` instead.
 */

import type {
  BoardState, Cell, Dir, MatchPhase, MatchResult, Move, NodeConfig, ResolveEvent, RuneType, SkinId
} from './rules'

// ─── Drag / aim state ───────────────────────────────────────────────────────

export type PlacementKind = 'empty' | 'stack' | 'invalid'

export interface DragState {
  /**
   * `place` — a pebble lifted off the hand and carried onto the board.
   * `correct` — a press-and-swipe inside the lock window that re-aims the rune
   * just placed; nothing is carried, only the facing changes.
   */
  mode: 'place' | 'correct'
  /** Which hand slot the pebble came from (`-1` for a correction). */
  handIndex: number
  type: RuneType
  /** Pointer position, CSS px on the canvas. */
  x: number
  y: number
  /** The tile under the pebble, or `null` when it is off the board. */
  over: Cell | null
  /** Whether `over` would accept the pebble. */
  kind: PlacementKind | null
  /**
   * True once the pebble has SNAPPED to `over` and the finger is now choosing
   * a direction: the pebble stays on the tile while the pointer roams.
   */
  aiming: boolean
  /** The facing the swipe has snapped to (or the default). */
  dir: Dir
  /** Where the pointer was when aiming began — the swipe is measured from here. */
  anchor: { x: number; y: number } | null
  /**
   * The aim REGION the pointer is standing in (`rules.dirFromCellPoint`), or
   * `null` when it is not inside a tile the pebble can take. This is the
   * position-aimed facing; `dir` is what the placement will actually use, and
   * the two agree whenever the pointer is inside the tile.
   */
  region: Dir | null
  /**
   * The pointer is a MOUSE or a pen: fine control, and a hover the player can
   * see BEFORE they commit.
   *
   * It does NOT gate position aiming — the tile's compass works for a finger
   * too, and a thumb sliding toward the edge it wants is easier than a flick
   * with a distance threshold in it. What `precise` gates is the CORRECTION
   * WINDOW: a mouse cursor is a few pixels that never hides the tile, so an
   * aimed click needs no second chance, while a fingertip covers the middle of
   * the very tile it is choosing on and keeps its window.
   */
  precise: boolean
}

/**
 * The placement is locked but may still be re-aimed: the pebble sits on its
 * tile, face up, with a ring draining over `LOCK_WINDOW_MS`. The reveal begins
 * when the window closes.
 */
export interface LockState {
  cell: Cell
  type: RuneType
  dir: Dir
  leftMs: number
  totalMs: number
  /** `tap` placements get the longer window (`LOCK_WINDOW_TAP_MS`) and no default aim of their own. */
  source: 'drag' | 'tap'
  /**
   * The window is not draining: a lesson is waiting for the player to turn the
   * rune the way the ghost shows. The renderer draws a full, pulsing ring.
   */
  held: boolean
}

/**
 * What the pointer is hovering over while a pebble is in hand — dragged, or
 * selected by a tap — with the facing that tile's regions would give it.
 *
 * The renderer draws the tile's compass from this: every region outlined with
 * the orientation it would produce, and the one under the pointer lit. It is
 * how the player sees all four choices at once instead of committing and
 * correcting.
 */
export interface HoverState {
  cell: Cell
  /** Whether the tile would accept the pebble at all. */
  kind: PlacementKind
  /**
   * The facing the rune would actually take if it were placed right now. Inside
   * the tile's centre dead zone this is the HELD facing (a pre-aimed key, or
   * the default), not the region under the pointer.
   */
  dir: Dir
  /**
   * The pointer is far enough from the tile's centre to have CHOSEN `dir`
   * (`rules.isAimChosen`). False in the middle of the tile, where the player is
   * still moving through and nothing has been picked — the compass draws its
   * regions but lights none of them.
   */
  chosen: boolean
  /** The rune being placed — the regions are carved to ITS aim. */
  type: RuneType
  /**
   * A mouse or a pen. The compass is drawn either way — a finger dragging a
   * pebble is choosing a facing too — but a touch drag hides the middle of the
   * tile under the fingertip, so the renderer leans its marks outward and the
   * placement keeps its correction window.
   */
  precise: boolean
}

export interface RevealState {
  player: Move | null
  enemies: Move[]
  /** ms since the reveal began. */
  elapsedMs: number
}

export interface TimelineState {
  /** The board BEFORE the resolution — the renderer mutates its own copy as events play. */
  before: BoardState
  /** …and after, swapped in when the clock passes `RESOLVE_MS`. */
  after: BoardState
  events: ResolveEvent[]
  /** ms since the resolution began. */
  elapsedMs: number
}

/**
 * The ghost hand of the onboarding: an animated finger that drags a hand
 * pebble to a tile and swipes `dir`. `null` once the player has done it.
 */
export interface GhostHint {
  /** `-1` in `reaim` mode: the finger works on the stone already on the board. */
  handIndex: number
  to: Cell
  dir: Dir
  /**
   * `place`: drag a hand pebble to `to` and (unless `reaim` is set) swipe
   * `dir`. With `reaim`, the loop drops the pebble, then presses it and flicks
   * toward `reaim`. `reaim`: the pebble is already on `to` (the player's own,
   * inside a held window) and the finger only shows the press-and-flick.
   */
  mode: 'place' | 'reaim'
  reaim?: Dir
}

/** Strings the canvas prints, resolved by the scene through i18n. */
export interface CanvasLabels {
  level: (n: number) => string
  combo: (n: number) => string
  clash: string
  victory: string
  defeat: string
  reveal: string
  suddenDeath: string
  turn: (n: number) => string
  you: string
  foe: string
  reroll: string
  lastTurn: string
  /** What the planning ring is counting down TO. */
  firesIn: string
  /** Why the planning ring is NOT counting down. */
  yourTurn: string
}

export interface ArenaView {
  config: NodeConfig
  board: BoardState
  phase: MatchPhase
  turn: number
  turnLimit: number
  suddenDeath: boolean
  hand: RuneType[]
  rerollsLeft: number
  /** The move the player has locked in this turn (drawn face-down until reveal). */
  playerMove: Move | null
  timer: { totalMs: number; leftMs: number; paused: boolean }
  drag: DragState | null
  /**
   * The hand slot selected by a TAP (`-1` = none): the renderer raises the
   * pebble and lights every tile it may go to; the next tap on such a tile
   * places it (`placeSelected`).
   */
  selected: number
  /** The correction window after a placement, or `null`. */
  lock: LockState | null
  /**
   * The tile's compass under the pointer, or `null`. Set while a pebble is
   * dragged or selected and the pointer is over the board.
   */
  hover: HoverState | null
  reveal: RevealState | null
  timeline: TimelineState | null
  ghost: GhostHint | null
  skin: SkinId
  result: MatchResult | null
  playerTiles: number
  enemyTiles: number
  /** Consecutive wins, for the flame aura around the board. */
  streak: number
  /** ms since the match began (for idle animation phase). */
  ageMs: number
  /** `true` for the 0.2 s wipe after play-again; the renderer draws the wave. */
  resetting: boolean
  labels: CanvasLabels
}

// ─── Layout (renderer → input) ──────────────────────────────────────────────

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface ArenaLayout {
  board: Rect
  /** Side of one tile in CSS px. */
  tile: number
  tileRect: (col: number, row: number) => Rect
  /** One rect per hand slot (HAND_SIZE of them). */
  hand: Rect[]
  reroll: Rect
  timer: Rect
  /** The swipe distance (CSS px) that counts as an aim. */
  swipeThreshold: number
}

export type HitTarget =
  | { kind: 'hand'; index: number }
  | { kind: 'tile'; col: number; row: number }
  | { kind: 'reroll' }
  | null

// ─── The battle API (composable → renderer/input/HUD) ───────────────────────

export interface BattleApi {
  /** The frame-rate object. Never replaced, always mutated in place. */
  view: ArenaView
  // Drag protocol, called by `useArenaInput`:
  /**
   * Start dragging hand slot `index`. Returns false when nothing can be dragged
   * now. `precise` marks a MOUSE — see `DragState.precise`.
   */
  beginDrag: (index: number, x: number, y: number, precise?: boolean) => boolean
  /** Pointer moved; `over` is the tile under it (input resolves it via the layout). */
  updateDrag: (x: number, y: number, over: Cell | null) => void
  /** The swipe snapped to a facing. */
  setAim: (dir: Dir) => void
  /** Release. `commit` true = lock the placement in; false = put the pebble back. */
  endDrag: (commit: boolean) => void
  /**
   * A press during the lock window: start a correction stroke. Returns false
   * when there is nothing to correct. Positions then flow through `updateDrag`
   * and the facing through `setAim`; `endDrag` ends the stroke.
   */
  beginCorrection: (x: number, y: number) => boolean
  /**
   * The player tried to turn a stone that is already down. Says why, once, and
   * only while it could still matter. Returns false when there was nothing to
   * say. See `useBattle.noteLateAim`.
   */
  noteLateAim: () => boolean
  /**
   * Tap-to-place, the alternative to dragging: select hand slot `index` (a
   * second tap on the same slot, or `-1`, clears it). Returns false when
   * nothing can be selected now.
   */
  selectHand: (index: number) => boolean
  /**
   * Place the selected pebble on `cell`. With `dir` — the region the pointer
   * clicked in — the placement is already aimed and, on a precise pointer,
   * needs no correction window; without one it lands on its default facing and
   * gets the longer window. Returns false when there is no selection or the
   * tile refuses it.
   */
  placeSelected: (cell: Cell, dir?: Dir) => boolean
  /**
   * The pointer moved over the board with a pebble in hand (dragged or
   * selected): `cell` is the tile under it and `fx`/`fy` are the position
   * INSIDE that tile, 0..1. `null` clears the hover. Only a precise pointer
   * needs to call this.
   */
  setHover: (cell: Cell | null, fx?: number, fy?: number) => void
  /**
   * A facing chosen without a stroke — a keyboard arrow / WASD, or a tap on a
   * chevron during the window. Applies to the pebble being dragged (landing
   * it first when it hovers a valid tile), to the selected pebble's pending
   * facing, or to the rune inside the lock window. Returns false when there
   * was nothing to aim.
   */
  aimKey: (dir: Dir) => boolean
  reroll: () => void
  /** Called once per frame by the scene with the frame time. */
  tick: (nowMs: number, dtMs: number) => void
}
