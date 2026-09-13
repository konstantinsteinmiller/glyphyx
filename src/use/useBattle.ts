import { ref, watch, type Ref } from 'vue'
import {
  AIM_LAND_MS, AIM_STROKE_PX, AIM_STROKE_WINDOW_MS, AIM_UNLOCK_TILES, BETWEEN_TURNS_MS, GRID,
  LESSON_HINT_TURNS, LESSON_REAIM_HOLD_MS, LESSON_RESOLVE_SCALE, LOCK_WINDOW_MS, LOCK_WINDOW_TAP_MS,
  LOSS_COINS_FRACTION,
  PLANNING_MAX_MS, PLANNING_MS,
  MAX_LEVEL, RESET_MS, RESOLVE_MS, REVEAL_MS, RUNES, RUNE_TYPES,
  TURN_LIMIT, WIN_COINS_BASE, WIN_COINS_PER_KILL, WIN_COINS_PER_TILE, defaultDir, dirFromCellPoint, dirsFor,
  isAimChosen, snapDir,
  streakMultiplier,
  type BoardState, type Cell, type ChestReward, type Dir, type MatchPhase, type MatchResult, type MatchState,
  type Move, type NodeConfig, type RuneType, type Tile
} from '@/game/rules'
import type { ArenaView, BattleApi, CanvasLabels, DragState, GhostHint, LockState, PlacementKind } from '@/game/view'
import {
  beginPlanning, canReaim, commitPlayerMove, createMatch, evaluateResult, nextTurn, placementKindFor,
  reaimPlayerMove, rerollHand, rescueMove, resolveCurrentTurn
} from '@/game/match'
import { cloneBoard, countTiles, runeAt, runesOf, usefulDir } from '@/game/board'
import { seedFrom } from '@/game/rng'
import { getState, setState } from '@/use/useGlyphyxState'
import { flushSaveNow } from '@/use/useSaveStatus'
import { AIMED_KEY, BEST_COMBO_KEY, TUTORIAL_KEY } from '@/keys'
import useUser from '@/use/useUser'
import useEconomy from '@/use/useEconomy'
import {
  bestNode, currentNode, markNodeCleared, markNodeLost, nodeConfigFor, setCurrentNode, unlockedRunes
} from '@/use/useCampaign'
import { bestStreak, recordLoss, recordWin, streak } from '@/use/useStreak'
import { activeSkin } from '@/use/useSkins'
import { reportMatch } from '@/use/useLeaderboard'
import { playFx } from '@/use/useGameAudio'
import { handicapFor, recordResult, type MatchRelief } from '@/use/useAdaptive'
import { recordRuneUse } from '@/use/useRuneUses'
import { armedBoons, consumePowerRune } from '@/use/usePowerRunes'
import { rankTable } from '@/use/useRuneRanks'

/**
 * ─── The battle: the one place the match is driven from ────────────────────
 *
 * Owns the `MatchState` (pure, from `@/game/match`) and the mutable
 * `ArenaView` the renderer reads every frame. Everything that moves the match
 * along — the planning clock, the player's drag, the correction window, the
 * reveal and resolution windows, the verdict, the payout — passes through
 * here, and nothing else ever touches the state.
 *
 * The view is allocated ONCE and mutated in place; the renderer holds a
 * reference and never sees it replaced. The handful of numbers the HUD
 * binds to are mirrored into refs on the same object, so a Vue template can
 * read `battle.turn` while the canvas reads `battle.view.turn` with no proxy
 * in the frame loop.
 *
 * `tick` is called from the scene's RAF loop. On an ordinary frame it does
 * arithmetic on a few fields and nothing else — every allocation happens on a
 * phase transition.
 *
 * ─── The gesture, in one paragraph ──────────────────────────────────────────
 *
 * Press a hand pebble, carry it over the board. The pebble LANDS on a tile
 * once the finger has been inside it for `AIM_LAND_MS`; from then on the
 * pebble stays put and the finger's STROKES aim it — a flick of
 * `AIM_STROKE_PX` in any direction is a facing, a flick back is the opposite
 * facing, and nothing is measured against where the finger was a second ago.
 * Carrying the finger `AIM_UNLOCK_TILES` from the tile is not a stroke, it is
 * a re-target: the pebble follows again. Release locks the placement — and
 * opens a `LOCK_WINDOW_MS` window in which pressing anywhere and flicking
 * re-aims the rune just placed. The reveal begins when that window closes.
 *
 * ── And on a MOUSE, the tile is its own compass ──
 *
 * A precise pointer does not need any of that. Each tile is carved into one
 * region per facing the rune has (`rules.dirFromCellPoint`: triangles for a
 * cardinal rune, quadrants for the orb), the region under the cursor IS the
 * facing, and the renderer lights it before the click. Because the player has
 * already seen the answer, an aimed precise placement skips the correction
 * window entirely and goes straight to the reveal — a second saved every turn.
 *
 * Near the middle of a tile nothing is chosen (`AIM_CENTRE_DEAD_ZONE`): the
 * centre is just where you click a tile, so the facing holds whatever it was
 * and the window comes back. That is what lets a player pre-aim with an arrow
 * key and then click the tile without losing the key they pressed.
 *
 * Touch is untouched by all of this — a finger covers the very regions it
 * would be choosing between, so it keeps the strokes and the window.
 *
 * Two more ways in, for hands that do not want to drag:
 *
 *   • TAP a hand pebble to SELECT it, then tap a tile: the pebble is placed
 *     with its default facing and gets a longer window (`LOCK_WINDOW_TAP_MS`)
 *     because nothing has aimed it yet;
 *   • an ARROW KEY / WASD (desktop) or a CHEVRON tap around the locked stone
 *     (touch) is a facing without a stroke — `aimKey` — for the pebble being
 *     dragged, the pebble selected, or the rune inside its window.
 *
 * And the lesson: on a node whose ghost script has a `reaim`, the first
 * window of the match is HELD — it does not drain until the rune faces the
 * way the ghost shows (or `LESSON_REAIM_HOLD_MS` passes), while the ghost
 * finger presses the stone and flicks that way.
 */

// ─── Summary / events (the contract the HUD and result screen bind to) ──────

/** What the result screen shows once a match is over. */
export interface MatchSummary {
  node: NodeConfig
  result: MatchResult
  /** Coins banked for this match (after the streak multiplier). */
  coins: number
  streakMultiplier: number
  /** The chest, if the node was cleared for the FIRST time; `null` otherwise. */
  chest: ChestReward | null
  isRecord: boolean
  /** Match time, ms. */
  durationMs: number
}

export type BattleEvent =
  | { kind: 'matchStart'; node: NodeConfig }
  | { kind: 'turnStart'; turn: number }
  /** The player locked a placement. */
  | { kind: 'placed' }
  | { kind: 'reveal' }
  | { kind: 'resolveStart' }
  | { kind: 'resolveEnd' }
  | { kind: 'suddenDeath' }
  | { kind: 'matchEnd'; summary: MatchSummary }
  /** The 0.2 s reset wipe began. */
  | { kind: 'reset' }

export interface BattleRefs {
  phase: Ref<MatchPhase>
  turn: Ref<number>
  turnLimit: Ref<number>
  suddenDeath: Ref<boolean>
  playerTiles: Ref<number>
  /** Enemy runes still standing — what an `eliminate` node is counting down. */
  enemyRunes: Ref<number>
  enemyTiles: Ref<number>
  rerollsLeft: Ref<number>
  /** Throttled to ~10 Hz — for a DOM readout, not the canvas ring. */
  timerLeftMs: Ref<number>
  timerPaused: Ref<boolean>
  result: Ref<MatchResult | null>
  node: Ref<NodeConfig | null>
  /** A match exists and is not over. */
  matchActive: Ref<boolean>
  /** The player committed this turn. */
  hasPlaced: Ref<boolean>
  isDragging: Ref<boolean>
  isAiming: Ref<boolean>
  /** The correction window after a placement is open (see `LOCK_WINDOW_MS`). */
  lockOpen: Ref<boolean>
  /** The hand slot selected by tap-to-place, `-1` when none. */
  selectedHand: Ref<number>
  /** The rune the player is holding right now — dragged or selected — for the tooltip. `null` otherwise. */
  activeRune: Ref<RuneType | null>
  /** True while the ghost hand is being shown. */
  ghostActive: Ref<boolean>
  lastSummary: Ref<MatchSummary | null>
  /** The last refusal, for the pill that explains it. See `RejectReason`. */
  rejected: Ref<{ reason: RejectReason; seq: number } | null>
}

export interface Battle extends BattleApi, BattleRefs {
  /** Start (or resume) the node the save points at, or `id` when given. */
  startNode: (id?: number) => void
  /** Play the same node again (0.2 s wipe). */
  retryNode: () => void
  /** Advance to the next node and start it. */
  nextNode: () => void
  /** Give the renderer its words. Call once the i18n instance exists, and on locale change. */
  setLabels: (labels: CanvasLabels) => void
  onEvent: (cb: (e: BattleEvent) => void) => () => void
  /** Pause / resume the planning clock (ads, modals, tab hidden). */
  setPaused: (paused: boolean) => void
}

// ─── Drag metrics ───────────────────────────────────────────────────────────
//
// The geometry the drag protocol needs and the layout owns. The input module
// hands over the real numbers through `setDragMetrics` on every press; the
// defaults are sane on every phone and are what the unit tests run on.

export interface DragMetrics {
  /** Swipe length that counts as an aim on a fast flick THROUGH a tile (the release fallback). */
  swipeThresholdPx: number
  /** Side of one board tile, CSS px — the unit `AIM_UNLOCK_TILES` is measured in. */
  tilePx: number
  /**
   * The centre of a tile, or `null` when the layout is not known (tests): the
   * un-land distance is then measured from the point the finger landed on.
   */
  tileCenter: ((cell: Cell) => { x: number; y: number }) | null
}

const metrics: DragMetrics = { swipeThresholdPx: 24, tilePx: 80, tileCenter: null }

/** Let the input layer state the real tile-relative distances. */
export const setDragMetrics = (m: Partial<DragMetrics>): void => {
  if (Number.isFinite(m.swipeThresholdPx) && m.swipeThresholdPx! > 0) metrics.swipeThresholdPx = m.swipeThresholdPx!
  if (Number.isFinite(m.tilePx) && m.tilePx! > 0) metrics.tilePx = m.tilePx!
  if (m.tileCenter !== undefined) metrics.tileCenter = m.tileCenter
}

/**
 * A correction stroke that is still under the finger when the window runs out
 * gets this much longer — the flick is worth waiting for, the hesitation is
 * not.
 */
const LOCK_GRACE_MS = 500

/**
 * Where inside `cell` the point (`x`, `y`) falls, 0..1 with y down — the unit
 * space `dirFromCellPoint` reads.
 *
 * `null` when the layout has not told us where tiles are (`tileCenter` is
 * unset, which is the default and what most unit tests run on). That null is
 * load-bearing rather than a gap: with no tile geometry there is no position
 * to aim from, so the whole position path stands down and the stroke path —
 * which needs no layout at all — is the only aim. The feature degrades to
 * exactly the behaviour that shipped before it.
 */
const cellFraction = (cell: Cell, x: number, y: number): { fx: number; fy: number } | null => {
  if (!metrics.tileCenter || !(metrics.tilePx > 0)) return null
  const c = metrics.tileCenter(cell)
  return { fx: (x - c.x) / metrics.tilePx + 0.5, fy: (y - c.y) / metrics.tilePx + 0.5 }
}

// ─── The view ───────────────────────────────────────────────────────────────

const blankBoard = (): BoardState => {
  const tiles: Tile[] = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) tiles.push({ col, row, owner: 'neutral', faction: null, runeId: null })
  }
  return { tiles, runes: {}, nextRuneId: 1 }
}

/** Stands in until the first `startNode`. `id: 0` is never a real node. */
const placeholderConfig = (): NodeConfig => ({
  id: 0, chapter: 1, index: 1, mode: '1v1', objective: 'conquest', enemies: [], presets: [],
  playerDeck: null, tutorial: null, timer: true, turnLimit: TURN_LIMIT,
  reward: { coins: 0, unlockRune: null, unlockSkin: null, big: false }, seed: 0
})

const defaultLabels = (): CanvasLabels => ({
  level: (n) => `Lv.${n}`,
  combo: (n) => `×${n} COMBO`,
  clash: 'CLASH!',
  victory: 'VICTORY!',
  defeat: 'DEFEAT',
  reveal: 'REVEAL',
  suddenDeath: 'SUDDEN DEATH',
  turn: (n) => `TURN ${n}`,
  you: 'YOU',
  foe: 'FOE',
  reroll: 'REROLL',
  lastTurn: 'LAST TURN',
  firesIn: 'FIRES IN',
  yourTurn: 'YOUR MOVE'
})

const view: ArenaView = {
  config: placeholderConfig(),
  board: blankBoard(),
  phase: 'planning',
  turn: 1,
  turnLimit: TURN_LIMIT,
  suddenDeath: false,
  hand: [],
  rerollsLeft: 0,
  playerMove: null,
  timer: { totalMs: PLANNING_MS, leftMs: PLANNING_MS, paused: true },
  drag: null,
  selected: -1,
  lock: null,
  hover: null,
  reveal: null,
  timeline: null,
  ghost: null,
  skin: activeSkin.value,
  result: null,
  playerTiles: 0,
  enemyTiles: 0,
  streak: streak.value,
  ageMs: 0,
  resetting: false,
  labels: defaultLabels()
}

// ─── Refs (the HUD's half) ──────────────────────────────────────────────────

const phase = ref<MatchPhase>('planning')
const turn = ref(1)
const turnLimit = ref(TURN_LIMIT)
const suddenDeath = ref(false)
const playerTiles = ref(0)
const enemyRunes = ref(0)
const enemyTiles = ref(0)
const rerollsLeft = ref(0)
const timerLeftMs = ref(PLANNING_MS)
const timerPaused = ref(true)
const result = ref<MatchResult | null>(null)
const node = ref<NodeConfig | null>(null)
const matchActive = ref(false)
const hasPlaced = ref(false)
const isDragging = ref(false)
const isAiming = ref(false)
const lockOpen = ref(false)
const selectedHand = ref(-1)
const activeRune = ref<RuneType | null>(null)
const ghostActive = ref(false)
const lastSummary = ref<MatchSummary | null>(null)

/**
 * ─── Why nothing happened ───────────────────────────────────────────────────
 *
 * Every refusal used to be silent. The hand looks the same whether it can be
 * played or not, so a drag that arrived a beat early — during the correction
 * window, the reveal or the resolution, about two to three seconds after every
 * placement — simply did nothing, and the same drag a second later worked.
 * Three of the five blind testers read that as a broken game; one of them
 * counted it as "about half" of all their drags (2026-09-11).
 *
 * So a refusal now says which of the three things it was, once, and the scene
 * puts it in the hint pill:
 *
 *   placed  one rune per turn, and this turn's is already down
 *   phase   the runes are firing; the hand comes back when they stop
 *   tile    that tile will not take this rune
 *
 * `seq` only exists so the scene can tell two identical refusals apart.
 */
export type RejectReason = 'placed' | 'phase' | 'tile' | 'lateAim'
const rejected = ref<{ reason: RejectReason; seq: number } | null>(null)
let rejectSeq = 0

/** Refuse an action out loud: the reason for the pill, the thud for the ear. */
const refuse = (reason: RejectReason): false => {
  rejected.value = { reason, seq: ++rejectSeq }
  playFx('uiReject', 0.4)
  return false
}

// ─── Internal state ─────────────────────────────────────────────────────────

let state: MatchState | null = null
/** External pause (ads, modals, tab hidden) — gates every clock. */
let externalPaused = false
/** The tutorial's hold: no clock until the player has placed once. */
let tutorialHold = false
/** The player has committed at least once in THIS match. */
let placedThisMatch = false
/** ms since the reset wipe began; `-1` when not resetting. */
let resetElapsed = -1
let pendingNodeId = 0
/** Wall-clock ms of the last `timerLeftMs` publish — the 10 Hz throttle. */
let lastTimerPublish = 0

/**
 * How the player is keeping up, for the adaptive relief. A "pass" is a
 * planning window that ran out with nothing placed — the clearest sign a
 * player cannot keep up with the enemy's turns, and the one the enemy answers
 * by skipping its own. Reset per match.
 */
const relief: MatchRelief = { playerPassedLastTurn: false, passesThisMatch: 0 }

// Drag bookkeeping ------------------------------------------------------------

/** Where the pebble was picked up — a release back here is a cancel, never a flick. */
let dragStartX = 0
let dragStartY = 0
/** The last VALID tile the pointer crossed while travelling, and where it was entered. */
let lastValidCell: Cell | null = null
let lastValidKind: PlacementKind | null = null
let lastValidEnterX = 0
let lastValidEnterY = 0
let dragOverKey = -1
/** ms the finger has spent inside the current candidate tile (the landing clock). */
let landMs = 0
/** The point un-landing is measured from: the landed tile's centre, or the landing point. */
let landRefX = 0
let landRefY = 0
/**
 * A facing chosen without a stroke — an arrow key, WASD, a chevron — while the
 * pebble is still being carried or is merely selected. Applied when the pebble
 * lands, when a tap places the selection, or on a release that never landed;
 * cleared with the drag / the selection it belongs to. A stroke after it wins
 * (strokes always aim the landed pebble directly).
 */
let keyDir: Dir | null = null
/**
 * The region of the current tile the pebble was carried IN through — the edge
 * nearest the hand it came from, which is a fact about where the tray is and
 * not a facing anybody chose.
 *
 * SPENT (set to null) the moment the player does choose something: a different
 * region of the same tile, a stroke, a key. While it is unspent it is the only
 * thing that has ever aimed this pebble, and the dead zone in the middle of the
 * tile — which holds the facing rather than choosing one — must not hold IT.
 * That is how a pebble carried up from the tray and released in the middle of a
 * tile came to face DOWN, into the player's own back row, on every phone: three
 * of four blind testers spent a one-move lesson shooting backwards (2026-09-11).
 */
let entryRegion: Dir | null = null
/**
 * Has the player aimed this pebble ON THE TILE IT IS OVER — a region they moved
 * into, a stroke, a key?
 *
 * `entryRegion` alone was not enough, and the way it failed is worth keeping.
 * A pebble carried across the board LANDS on the tiles it crosses, and
 * un-landing is deliberately late (`AIM_UNLOCK_TILES`), so the pointer is
 * often already in the next tile's DEAD ZONE by the time the drag notices it
 * changed tiles at all. There is no entry region to record at that point — and
 * with only "is the entry region unspent" to go on, the facing left over from
 * the tile before was held, which is exactly the backwards-facing drop this is
 * all about. Reset on every tile change; set by any deliberate aim.
 */
let chosenOnTile = false
/** ms a lesson's held window has been waiting for the player's correction. */
let holdMs = 0
/** Once the lesson's facing is right, the held window drains this quickly: the arrow has been seen turning. */
const HOLD_RELEASE_MS = 400

/**
 * The stroke buffer: pointer motion since landing, one bucket per frame of
 * the drag clock, oldest first. The stroke vector is the sum of the buckets
 * inside the trailing `AIM_STROKE_WINDOW_MS`; a bucket that opposes the
 * running vector starts a fresh stroke, which is what makes a flick back
 * read as the opposite facing rather than as "less of the first one".
 *
 * Buckets rather than raw samples so a 1000 Hz mouse and a 60 Hz thumb fill
 * the same fixed buffer at the same rate.
 */
const STROKE_BUCKETS = 32
const strokeX = new Float64Array(STROKE_BUCKETS)
const strokeY = new Float64Array(STROKE_BUCKETS)
const strokeT = new Float64Array(STROKE_BUCKETS)
let strokeHead = 0
let strokeCount = 0

const listeners = new Set<(e: BattleEvent) => void>()

const emit = (e: BattleEvent): void => {
  for (const cb of listeners) {
    try { cb(e) } catch (err) { console.warn('[battle] listener threw', err) }
  }
}

const difficulty = (): 'easy' | 'medium' | 'hard' => useUser().userDifficulty.value

const publishTimer = (force: boolean, now: number): void => {
  if (!force && now - lastTimerPublish < 100) return
  lastTimerPublish = now
  timerLeftMs.value = Math.max(0, Math.round(view.timer.leftMs))
}

const syncTimerPaused = (): void => {
  view.timer.paused = externalPaused || tutorialHold
  timerPaused.value = view.timer.paused
}

const syncCounts = (): void => {
  view.playerTiles = countTiles(view.board, 'player')
  view.enemyTiles = countTiles(view.board, 'enemy')
  playerTiles.value = view.playerTiles
  enemyTiles.value = view.enemyTiles
  // The number a LESSON is actually about. Its objective is `eliminate`, so
  // tiles held say nothing about winning it — and the HUD showing tiles is why
  // four testers came away with four different readings of what YOU and FOE
  // meant (2026-09-11).
  enemyRunes.value = runesOf(view.board, 'enemy').length
}

// ─── The stroke buffer ──────────────────────────────────────────────────────

const clearStrokes = (): void => {
  strokeHead = 0
  strokeCount = 0
}

/** The motion inside the trailing window, as one vector. */
const strokeVector = (out: { x: number; y: number }): void => {
  out.x = 0
  out.y = 0
  const since = view.ageMs - AIM_STROKE_WINDOW_MS
  for (let i = 0; i < strokeCount; i++) {
    const k = (strokeHead + i) % STROKE_BUCKETS
    if (strokeT[k]! <= since) continue
    out.x += strokeX[k]!
    out.y += strokeY[k]!
  }
}

const strokeScratch = { x: 0, y: 0 }

const pushStroke = (dx: number, dy: number): void => {
  if (dx === 0 && dy === 0) return
  const t = view.ageMs
  if (strokeCount > 0) {
    strokeVector(strokeScratch)
    // A reversal is a NEW stroke — the old one has been answered already.
    if (dx * strokeScratch.x + dy * strokeScratch.y < 0) clearStrokes()
  }
  if (strokeCount > 0) {
    const last = (strokeHead + strokeCount - 1) % STROKE_BUCKETS
    if (strokeT[last] === t) {
      strokeX[last] = strokeX[last]! + dx
      strokeY[last] = strokeY[last]! + dy
      return
    }
  }
  if (strokeCount === STROKE_BUCKETS) {
    // Full: the oldest bucket is long outside the window anyway.
    strokeHead = (strokeHead + 1) % STROKE_BUCKETS
    strokeCount--
  }
  const k = (strokeHead + strokeCount) % STROKE_BUCKETS
  strokeX[k] = dx
  strokeY[k] = dy
  strokeT[k] = t
  strokeCount++
}

/** What the player is holding right now, for the tooltip: the dragged rune, else the selected one. */
const syncActiveRune = (): void => {
  const drag = view.drag
  activeRune.value = drag && drag.mode === 'place' ? drag.type
    : view.selected >= 0 ? (view.hand[view.selected] ?? null) : null
}

const clearDrag = (): void => {
  view.drag = null
  view.hover = null
  isDragging.value = false
  isAiming.value = false
  lastValidCell = null
  lastValidKind = null
  dragOverKey = -1
  entryRegion = null
  chosenOnTile = false
  landMs = 0
  keyDir = null
  clearStrokes()
  syncActiveRune()
}

/** Tap-to-place: nothing is selected any more (and no key facing waits for it). */
const clearSelection = (): void => {
  keyDir = null
  // The compass belongs to the pebble in hand, and there is no longer one.
  if (!view.drag) view.hover = null
  if (view.selected !== -1) {
    view.selected = -1
    selectedHand.value = -1
  }
  syncActiveRune()
}

/**
 * The ghost hand for this match, or `null`.
 *
 * Shown until the player has placed once in THIS match. The first beat — the
 * drag itself — additionally retires for good once `TUTORIAL_KEY` is set: a
 * returning player replaying 1-1 has nothing to be shown.
 *
 * A node that scripts its ghost (`config.ghost`) says exactly which rune goes
 * where, facing which way; the hand is guaranteed to hold that rune (see
 * `tutorialHand`). Without a script the beat itself names the rune and the
 * ghost points at the tile under the skeleton.
 */
const ghostFor = (s: MatchState): GhostHint | null => {
  const beat = s.config.tutorial
  // Not a lesson, but the node may still open with one taught move — see
  // `NodeConfig.guide`. Turn 1 only, and gone the moment the player places.
  if (!beat) return guideFor(s)
  // ── The rescue's first step ──
  //
  // A lesson that has gone `LESSON_HINT_TURNS` without hurting the enemy has
  // stopped teaching and started trapping, and the player has usually placed
  // long ago — so this outranks both "only until the first placement" and the
  // retired-for-good check below. It shows a move that would actually land
  // (`rescueMove`), not the scripted one, which by now is often on a tile that
  // is no longer free.
  if (s.stallTurns >= LESSON_HINT_TURNS) {
    const rescue = rescueMove(s)
    const slot = rescue ? s.hand.indexOf(rescue.type) : -1
    if (rescue && slot >= 0) {
      return { handIndex: slot, to: { col: rescue.col, row: rescue.row }, dir: rescue.dir, mode: 'place' }
    }
  }
  if (placedThisMatch) return null
  if (beat === 'drag' && getState<boolean>(TUTORIAL_KEY, false) === true) return null
  const script = s.config.ghost
  // Every beat but `drag` and `stack` is NAMED after the rune it teaches, so
  // the beat itself is the fallback when a node has no script. (`drag` and
  // `stack` are gestures, and both are taught with the sword.)
  const want: RuneType = script ? script.type
    : (RUNE_TYPES as readonly string[]).includes(beat) ? beat as RuneType : 'melee'
  let handIndex = s.hand.indexOf(want)
  if (handIndex < 0) handIndex = s.hand.length > 0 ? 0 : -1
  if (handIndex < 0) return null
  const type = s.hand[handIndex]!
  if (script && type === script.type) {
    return { handIndex, to: { col: script.to.col, row: script.to.row }, dir: script.dir, mode: 'place', reaim: script.reaim }
  }
  let to: Cell = { col: 1, row: 2 }
  if (beat === 'stack') {
    const mine = runesOf(s.board, 'player').find((r) => r.type === type && r.level === 1)
    if (mine) to = { col: mine.col, row: mine.row }
  }
  return { handIndex, to, dir: defaultDir(type, 'player'), mode: 'place' }
}

/**
 * The opening move a non-lesson node offers, if it offers one. Shown until the
 * player places anything, on the first turn only: a fight that keeps pointing
 * at the same square on turn 6 is not guiding, it is nagging.
 *
 * The script's rune is a PREFERENCE, not a requirement. A real node deals a
 * real hand — unlike a lesson, whose deck is authored — so the named rune is
 * often not in it: on the first browser run of 1-7's guide the hand came up
 * `archer, support, defense` and the guide simply never appeared. That is the
 * worst possible outcome for the one lesson the mode has. And it is
 * unnecessary, because the rule being taught — a rune you place takes the tile
 * it stands on — is true of every rune in the game. So it teaches with
 * whatever is in hand, and only the FACING falls back: a rune the script did
 * not choose gets the facing that actually threatens something
 * (`usefulDir`), so the taught move is a good move as well as a legal one.
 */
const guideFor = (s: MatchState): GhostHint | null => {
  const script = s.config.guide
  if (!script || placedThisMatch || s.turn > 1 || s.hand.length === 0) return null
  const wanted = s.hand.indexOf(script.type)
  const handIndex = wanted >= 0 ? wanted : 0
  const type = s.hand[handIndex]!
  const to: Cell = { col: script.to.col, row: script.to.row }
  // Never point at a tile this rune cannot take (the board changes under a
  // guide the way it does under anything else).
  if (!isValidKind(placementKindFor(s, type, to))) return null
  return {
    handIndex,
    to,
    dir: wanted >= 0 ? script.dir : usefulDir(s.board, 'player', type, to),
    mode: 'place'
  }
}

/** The planning window this turn: the relief's number, inside the rules' bounds. */
const planningWindowMs = (s: MatchState): number =>
  Math.max(1000, Math.min(PLANNING_MAX_MS, Number(s.handicap?.timerMs) || PLANNING_MS))

const closeLockQuietly = (): void => {
  // The lesson's finger lives on the window; it goes with it.
  if (view.ghost && view.ghost.mode === 'reaim') {
    view.ghost = null
    ghostActive.value = false
  }
  holdMs = 0
  view.lock = null
  lockOpen.value = false
}

/** Mirror a planning-phase state into the view and the refs. */
const syncPlanning = (s: MatchState, firstTurn: boolean): void => {
  view.config = s.config
  view.board = s.board
  view.phase = 'planning'
  view.turn = s.turn
  view.turnLimit = s.config.turnLimit
  view.suddenDeath = s.suddenDeath
  view.hand = s.hand
  view.rerollsLeft = s.rerollsLeft
  view.playerMove = null
  view.reveal = null
  view.timeline = null
  view.result = null
  const windowMs = planningWindowMs(s)
  view.timer.totalMs = windowMs
  view.timer.leftMs = windowMs
  closeLockQuietly()
  clearSelection()
  view.ghost = ghostFor(s)
  ghostActive.value = view.ghost !== null
  // No clock while the ghost is teaching, and none on a tutorial node until the
  // player has placed once — a lazy learner must never be timed out of the
  // lesson.
  // Held for the whole of planning on a clockless node — not merely until the
  // first placement. The turn ends when the player plays it and at no other
  // time, which is the entire point of having no clock.
  tutorialHold = view.ghost !== null || !s.config.timer
  syncTimerPaused()
  syncCounts()

  phase.value = 'planning'
  turn.value = s.turn
  turnLimit.value = s.config.turnLimit
  suddenDeath.value = s.suddenDeath
  rerollsLeft.value = s.rerollsLeft
  hasPlaced.value = false
  result.value = null
  node.value = s.config
  matchActive.value = true
  publishTimer(true, Date.now())
  if (firstTurn) emit({ kind: 'matchStart', node: s.config })
  emit({ kind: 'turnStart', turn: s.turn })
}

const enterReveal = (s: MatchState): void => {
  closeLockQuietly()
  view.playerMove = s.playerMove
  view.reveal = { player: s.playerMove, enemies: s.enemyMoves, elapsedMs: 0 }
  view.phase = 'reveal'
  view.ghost = null
  ghostActive.value = false
  phase.value = 'reveal'
  hasPlaced.value = true
  // The reveal whoosh belongs to the transition, not to the renderer: it has
  // to sound even on a turn the player passed and nothing of theirs lands.
  playFx('reveal')
  emit({ kind: 'reveal' })
}

const startResolve = (): void => {
  if (!state) return
  const before = cloneBoard(state.board)
  const out = resolveCurrentTurn(state)
  state = out.state
  view.timeline = { before, after: cloneBoard(state.board), events: out.events, elapsedMs: 0 }
  view.reveal = null
  view.phase = 'resolve'
  phase.value = 'resolve'
  emit({ kind: 'resolveStart' })
}

const coinsFor = (r: MatchResult, newStreak: number): number => {
  const base = r.won
    ? WIN_COINS_BASE + r.playerTiles * WIN_COINS_PER_TILE + r.kills * WIN_COINS_PER_KILL
    : WIN_COINS_BASE * LOSS_COINS_FRACTION
  return Math.round(base * (r.won ? streakMultiplier(newStreak) : 1))
}

const finishMatch = (s: MatchState, now: number): void => {
  const r: MatchResult = s.result ?? evaluateResult(s, now) ?? {
    won: false, reason: 'turnLimit', turns: s.turn, playerTiles: countTiles(s.board, 'player'),
    enemyTiles: countTiles(s.board, 'enemy'), maxCombo: s.maxCombo, kills: s.kills, durationMs: now - s.startedAt
  }
  const nodeId = s.config.id

  // The streak first: the multiplier the payout uses is the one this match
  // just earned, so a third win in a row pays ×2 rather than the ×1.5 it was
  // walking in with.
  const newStreak = r.won ? recordWin() : (recordLoss(), 0)
  const mult = r.won ? streakMultiplier(newStreak) : 1
  const outcome = r.won ? markNodeCleared(nodeId) : (markNodeLost(nodeId), null)
  const coins = coinsFor(r, newStreak)
  if (coins > 0) useEconomy().addCoins(coins)
  // What the NEXT match on this node (and the next match anywhere) is relieved by.
  recordResult(nodeId, r.won)

  const bestCombo = Number(getState(BEST_COMBO_KEY, 0)) || 0
  if (r.maxCombo > bestCombo) setState(BEST_COMBO_KEY, r.maxCombo)

  // Fire-and-forget, never awaited: the board is a decoration on a game that
  // works without it, and `reportMatch` swallows every failure itself.
  void reportMatch(bestNode.value, bestStreak.value, { force: true })
  void flushSaveNow()

  const summary: MatchSummary = {
    node: s.config,
    result: r,
    coins,
    streakMultiplier: mult,
    chest: outcome && outcome.first ? s.config.reward : null,
    isRecord: outcome?.isRecord ?? false,
    durationMs: r.durationMs
  }

  view.board = s.board
  view.phase = 'ended'
  view.result = r
  view.streak = streak.value
  view.timeline = null
  view.reveal = null
  closeLockQuietly()
  syncCounts()
  phase.value = 'ended'
  result.value = r
  matchActive.value = false
  lastSummary.value = summary
  playFx(r.won ? 'victory' : 'defeat')
  // The flame climbing a step is its own moment — the second win in a row is
  // where the aura first lights, and every step after is a bigger multiplier.
  if (r.won && streak.value >= 2) playFx('streak', Math.min(1, streak.value / 6))
  emit({ kind: 'matchEnd', summary })
}

/**
 * The relief for the turn about to be planned, judged on the board as it
 * stands after the resolution and on the turn the match is ENTERING — the
 * sudden-death rule switches every skip off, so it has to be known one turn
 * early, before `nextTurn` sets the flag.
 */
const nextTurnHandicap = (s: MatchState) => {
  const atLimit = s.turn >= s.config.turnLimit
  const sudden = s.suddenDeath || (atLimit && s.config.objective === 'conquest')
  return handicapFor({ ...s, turn: s.turn + 1, suddenDeath: sudden }, relief)
}

const endResolve = (now: number): void => {
  if (!state) return
  emit({ kind: 'resolveEnd' })
  const wasSudden = state.suddenDeath
  state = nextTurn(state, now, difficulty(), nextTurnHandicap(state))
  if (state.phase === 'ended' || state.result) {
    finishMatch(state, now)
    return
  }
  if (!wasSudden && state.suddenDeath) {
    playFx('suddenDeath')
    emit({ kind: 'suddenDeath' })
  }
  syncPlanning(state, false)
}

// ─── Public API ─────────────────────────────────────────────────────────────

const clampToUnlocked = (id: number): number =>
  Math.max(1, Math.min(bestNode.value + 1, Math.floor(Number(id) || 1)))

const startNode = (id?: number): void => {
  const nodeId = clampToUnlocked(id ?? currentNode.value)
  if (nodeId !== currentNode.value) setCurrentNode(nodeId)
  const now = Date.now()
  const config = nodeConfigFor(nodeId)
  placedThisMatch = false
  resetElapsed = -1
  relief.playerPassedLastTurn = false
  relief.passesThisMatch = 0
  clearDrag()
  closeLockQuietly()
  const seed = seedFrom(nodeId, now & 0xffff)
  // Power runes bought in the shop arm the first placement of their type, and
  // the permanent rune ranks ride in as a COPY — a rank bought from the shop
  // over a finished board must not change runes that are already standing.
  const fresh = createMatch(config, unlockedRunes.value, seed, now, armedBoons(), rankTable())
  state = beginPlanning(fresh, difficulty(), handicapFor(fresh, relief))
  // A node may pin its own material (1-1 is cut from obsidian); otherwise the
  // player's choice wins.
  view.skin = config.skin ?? activeSkin.value
  view.streak = streak.value
  view.ageMs = 0
  view.resetting = false
  lastSummary.value = null
  syncPlanning(state, true)
}

const beginReset = (nextId: number): void => {
  if (resetElapsed >= 0) return
  pendingNodeId = nextId
  resetElapsed = 0
  view.resetting = true
  clearDrag()
  closeLockQuietly()
  emit({ kind: 'reset' })
}

const retryNode = (): void => {
  beginReset(state ? state.config.id : currentNode.value)
}

const nextNode = (): void => {
  const from = state ? state.config.id : currentNode.value
  beginReset(clampToUnlocked(from + 1))
}

const beginDrag = (index: number, x: number, y: number, precise = false): boolean => {
  if (!state || view.resetting || view.drag) return false
  // Two different noes, and the player cannot tell them apart from the hand:
  // "you have already played this turn" and "the runes are firing, wait".
  if (view.phase !== 'planning') return refuse(hasPlaced.value ? 'placed' : 'phase')
  if (hasPlaced.value) return refuse('placed')
  const type = state.hand[index]
  if (!type) return false
  // A drag is the other way in: whatever was selected by tap is let go.
  clearSelection()
  const drag: DragState = {
    mode: 'place', handIndex: index, type, x, y, over: null, kind: null, aiming: false,
    dir: defaultDir(type, 'player'), anchor: null, region: null, precise
  }
  view.drag = drag
  isDragging.value = true
  isAiming.value = false
  syncActiveRune()
  dragStartX = x
  dragStartY = y
  lastValidCell = null
  lastValidKind = null
  dragOverKey = -1
  entryRegion = null
  chosenOnTile = false
  landMs = 0
  clearStrokes()
  return true
}

const isValidKind = (k: PlacementKind | null): k is 'empty' | 'stack' => k === 'empty' || k === 'stack'

/**
 * The tile's compass under the pointer — what the renderer draws so the player
 * sees every facing on offer BEFORE committing to one.
 *
 * It exists only while a pebble is in hand, so it is cleared by `clearDrag` and
 * `clearSelection`, which between them cover every way a pebble leaves it
 * (a commit, a cancel, a new turn, a reveal). A compass left standing over a
 * resolving board is a bug the renderer cannot defend itself against.
 */
const setHoverState = (type: RuneType, cell: Cell, dir: Dir, chosen: boolean, precise: boolean): void => {
  if (!state) { view.hover = null; return }
  view.hover = {
    cell: { col: cell.col, row: cell.row },
    kind: placementKindFor(state, type, cell),
    dir,
    chosen,
    type,
    precise
  }
}

/**
 * The facing a pebble with no region under it would be placed with: whatever a
 * key chose for it, else the most useful facing on that tile. `placeSelected`
 * and `setHover` BOTH read this, so what the compass promises inside the dead
 * zone is exactly what a click there delivers.
 *
 * `cell` is optional only for the callers that have no tile yet; without one
 * the answer is the plain default, as it always was.
 */
const heldFacing = (type: RuneType, cell?: Cell | null): Dir => {
  if (keyDir !== null && dirsFor(type).includes(keyDir)) return keyDir
  if (!state || !cell) return defaultDir(type, 'player')
  return usefulDir(state.board, 'player', type, cell, placedLevel(type, cell))
}

/**
 * The level the pebble would stand at once placed — one higher when it is being
 * stacked onto a matching stone, which is what decides an archer's range and a
 * bombard's footprint, and therefore what "useful" means on that tile.
 */
const placedLevel = (type: RuneType, cell: Cell): number => {
  if (!state) return 1
  const under = runeAt(state.board, cell.col, cell.row)
  return under && under.side === 'player' && under.type === type
    ? Math.min(MAX_LEVEL, under.level + 1)
    : 1
}

/** Mirror a drag's own tile and region into the compass. */
const syncHoverFromDrag = (drag: DragState): void => {
  const cell = drag.over
  if (drag.mode !== 'place' || !cell || !isValidKind(drag.kind)) { view.hover = null; return }
  // `drag.dir`, never `drag.region`: for a precise pointer that has chosen they
  // are the same (the region aimed it), and otherwise the region is merely
  // where the pointer is, not what the rune will do. `chosen` is exactly
  // "a region was picked", which is what `drag.region` records.
  setHoverState(drag.type, cell, drag.dir, drag.region !== null, drag.precise)
}

/** The finger has been inside a valid tile long enough: the pebble stays, the strokes aim. */
const land = (drag: DragState): void => {
  drag.aiming = true
  drag.anchor = { x: drag.x, y: drag.y }
  const c = drag.over && metrics.tileCenter ? metrics.tileCenter(drag.over) : null
  landRefX = c ? c.x : drag.x
  landRefY = c ? c.y : drag.y
  isAiming.value = true
  clearStrokes()
  // A facing chosen by key while the pebble was still travelling lands with it.
  if (keyDir !== null && dirsFor(drag.type).includes(keyDir)) drag.dir = keyDir
}

/** The finger has carried on: the pebble follows it again, facing forward. */
const unland = (drag: DragState): void => {
  drag.aiming = false
  drag.anchor = null
  drag.dir = keyDir !== null && dirsFor(drag.type).includes(keyDir) ? keyDir : defaultDir(drag.type, 'player')
  isAiming.value = false
  landMs = 0
  dragOverKey = -1
  clearStrokes()
}

/**
 * A lesson's held window: the ring stops draining until the rune faces the way
 * the ghost shows. Called after every change of the lock's facing; once the
 * facing is right the finger goes and the window drains out quickly.
 */
const settleHold = (lock: LockState): void => {
  if (!lock.held) return
  const want = view.ghost && view.ghost.mode === 'reaim' ? view.ghost.reaim : undefined
  if (want === undefined || lock.dir !== want) return
  lock.held = false
  lock.leftMs = Math.min(lock.leftMs, HOLD_RELEASE_MS)
  view.ghost = null
  ghostActive.value = false
}

/**
 * Turn the locked move to face `dir`, by any means (a stroke, a key, a
 * chevron). True when the rune now faces it — it already did, or just turned.
 */
const reaimLock = (dir: Dir): boolean => {
  const lock = view.lock
  if (!state || !lock) return false
  if (dir === lock.dir) return true
  if (!canReaim(state, dir)) return false
  const next = reaimPlayerMove(state, dir)
  if (!next.playerMove || next.playerMove.dir !== dir) return false
  state = next
  lock.dir = dir
  view.playerMove = state.playerMove
  // A correction is a real aim, whatever the first facing was.
  if (getState<boolean>(AIMED_KEY, false) !== true) setState(AIMED_KEY, true)
  settleHold(lock)
  return true
}

/** Re-aim the locked move inside the correction window (a stroke). */
const reaim = (drag: DragState, dir: Dir): void => {
  if (reaimLock(dir)) drag.dir = dir
}

const applyAim = (drag: DragState, dir: Dir): void => {
  // A stroke or a key is unambiguously a choice, whatever the pointer is over.
  chosenOnTile = true
  if (drag.mode === 'correct') reaim(drag, dir)
  else drag.dir = dir
}

/** Read the stroke buffer; a stroke long enough is a facing. */
const recogniseStroke = (drag: DragState): void => {
  strokeVector(strokeScratch)
  const vx = strokeScratch.x
  const vy = strokeScratch.y
  if (Math.hypot(vx, vy) < AIM_STROKE_PX) return
  const dir = snapDir(drag.type, 'player', vx, vy, AIM_STROKE_PX)
  if (dir === 'omni') return
  // The swipe is measured from where THIS stroke began — never from a rest a
  // tile back, never from the landing point of a stroke already answered.
  drag.anchor = { x: drag.x - vx, y: drag.y - vy }
  // Answered: the next flick starts from nothing, so a flick across the first
  // is read on its own and not as the sum of the two.
  clearStrokes()
  if (dir !== drag.dir) applyAim(drag, dir)
}

/**
 * ─── Position aims a MOUSE; strokes still aim a finger ──────────────────────
 *
 * PRECEDENCE, stated once. `drag.region` — which of the tile's regions the
 * pointer stands in — is recorded for every pointer, because it is simply a
 * fact about where the pointer is and the renderer draws from it. But it only
 * AIMS the pebble for a PRECISE pointer, and then only while that pointer is
 * inside the tile; the moment it leaves, strokes take over again.
 *
 * The `precise` half is not a detail, it is the whole reconciliation. A mouse
 * has a visible cursor and no finger in the way, so position is strictly better
 * than a stroke: it is absolute, it needs no threshold, and it shows its answer
 * before the click. A FINGER covers the very regions it would be choosing
 * between, and the flick — including the small flick from a tile's edge that
 * `tests/use/battle.test.ts` pins as a real player complaint — is the gesture
 * that works when you cannot see under your own thumb. Letting position aim a
 * finger would silently delete that gesture: every one of those stroke tests
 * fails, which is how this was caught.
 *
 * So touch behaves exactly as it did before this feature existed, and
 * `beginCorrection` (a press that can land anywhere on the canvas, with no tile
 * under it) is untouched for both.
 *
 * Returns true when POSITION OWNS this move — that is, whenever the pointer is
 * inside the tile — so the caller leaves the stroke buffer alone. Note that
 * includes the dead zone, where position's answer is "hold what you have":
 * letting a stroke run there would flip the facing on the very wobble the dead
 * zone exists to absorb.
 */
const aimFromPosition = (drag: DragState, cell: Cell, x: number, y: number): boolean => {
  // This function OWNS `drag.region` — including clearing it — so that "the
  // pointer has not chosen a region" and "it chose one that did not aim the
  // pebble" stay two different answers. Collapsing them lost the finger's
  // region, which the renderer still wants.
  const f = cellFraction(cell, x, y)
  const inside = f !== null && f.fx >= 0 && f.fx <= 1 && f.fy >= 0 && f.fy <= 1
  // Outside the tile there is no position to read: the strokes have it.
  if (!f || !inside) { drag.region = null; return false }
  // Inside, the pointer is answering with its position, so nothing it did on
  // the way here counts as a swipe — a stroke left in the buffer would fire the
  // moment it crossed the edge.
  clearStrokes()
  // NAMING a region and CHOOSING one are different acts. `dirFromCellPoint` is
  // total — the renderer needs an answer for every pixel — but within
  // `AIM_CENTRE_DEAD_ZONE` of the middle the player has not chosen anything:
  // the centre is simply where you click a tile. So the facing HOLDS there,
  // which is what lets a pre-aimed arrow key survive a click in the middle
  // instead of being silently overwritten by the default.
  //
  // "Holds" means holds a CHOICE. Before the player has made one, what it used
  // to hold was the region the pebble happened to cross on its way in — the
  // edge nearest the hand — so a drop in the middle of a tile faced down on a
  // phone and right on a desktop, away from the enemy either way. Until
  // something is chosen the unaimed facing is `heldFacing`'s answer instead.
  if (!isAimChosen(f.fx, f.fy)) {
    drag.region = null
    // "Holds" means holds a CHOICE — a key, a stroke, a region the player moved
    // into. While `entryRegion` is unspent, the only thing that has aimed this
    // pebble is the edge it was carried in through, and holding that is what
    // pointed a centre drop back at the player's own side.
    if (!chosenOnTile) drag.dir = heldFacing(drag.type, cell)
    return true
  }
  const dir = dirFromCellPoint(drag.type, f.fx, f.fy)
  if (!dirsFor(drag.type).includes(dir)) { drag.region = null; return true }
  drag.region = dir
  if (dir === entryRegion && !chosenOnTile) {
    // The edge it was carried in through, SHOWN — the pebble points that way
    // while the pointer is there, and the compass says so — but not CHOSEN, so
    // the dead zone in the middle will not hold it. Set directly rather than
    // through `applyAim`, which is what spends the entry region.
    drag.dir = dir
    return true
  }
  // Anywhere else in the tile is a choice: the pointer went there.
  chosenOnTile = true
  if (dir !== drag.dir) applyAim(drag, dir)
  return true
}

const updateDrag = (x: number, y: number, over: Cell | null): void => {
  const drag = view.drag
  if (!drag || !state) return
  const dx = x - drag.x
  const dy = y - drag.y
  drag.x = x
  drag.y = y

  if (drag.mode === 'correct') {
    pushStroke(dx, dy)
    recogniseStroke(drag)
    return
  }

  if (drag.aiming) {
    // Landed. Position aims while the pointer is still on the stone's tile;
    // otherwise strokes aim, and only a real departure — most of a tile from
    // the tile's centre — re-targets, so a flick may cross into the neighbour
    // and the pebble stays where it was put.
    if (drag.over && aimFromPosition(drag, drag.over, x, y)) return
    const far = Math.hypot(x - landRefX, y - landRefY) > AIM_UNLOCK_TILES * metrics.tilePx
    if (!far) {
      pushStroke(dx, dy)
      recogniseStroke(drag)
      return
    }
    unland(drag)
  }

  const key = over ? over.row * GRID + over.col : -1
  if (key !== dragOverKey) {
    dragOverKey = key
    landMs = 0
    // COPIED, never held by reference. `useArenaInput` hands the same mutable
    // `Cell` object to every `updateDrag` — it is scratch, rewritten on each
    // pointer move — so storing it made `drag.over` silently follow the finger
    // across tiles. Everything downstream then misread the board: the landed
    // pebble's own tile was always "the tile under the pointer", so
    // `aimFromPosition` always said the pointer was inside it, `updateDrag`
    // returned early every frame, and THIS block never ran again for the rest
    // of the drag. The facing bookkeeping stayed pinned to the first tile the
    // pebble ever landed on, which is what kept a centre drop pointing the way
    // it had been carried in. Found by probing a real drag in the browser
    // after the unit tests — which pass a fresh object each call — all passed.
    drag.over = over ? { col: over.col, row: over.row } : null
    drag.kind = over ? placementKindFor(state, drag.type, over) : null
    if (over && isValidKind(drag.kind)) {
      lastValidCell = { col: over.col, row: over.row }
      lastValidKind = drag.kind
      lastValidEnterX = x
      lastValidEnterY = y
      // Which edge the pebble crossed to get here. Not a choice — see `entryRegion`.
      const f = cellFraction(over, x, y)
      const at = f !== null && isAimChosen(f.fx, f.fy) ? dirFromCellPoint(drag.type, f.fx, f.fy) : null
      entryRegion = at !== null && dirsFor(drag.type).includes(at) ? at : null
    } else {
      entryRegion = null
    }
    // A facing is chosen ON a tile, and it stays there. Carrying the pebble to
    // another tile re-bases it, because un-landing is distance-gated
    // (`AIM_UNLOCK_TILES`): a pebble carried briskly onto a new tile can be
    // released before one pointer event has arrived to re-aim it, and it then
    // commits whatever the tile BELOW pointed at. Measured in a real browser —
    // 1-4's orb, dropped dead centre, kept the facing it crossed the tile below
    // with and its one taught move missed both skeletons (2026-09-12).
    if (chosenOnTile && over) drag.dir = heldFacing(drag.type, over)
    chosenOnTile = false
  }

  // Still travelling: the tile under the pointer aims the pebble as soon as it
  // is over one that will take it, so the facing is already right when the
  // pointer stops. Waiting for `AIM_LAND_MS` first would mean the pebble spent
  // its whole journey pointing the wrong way.
  if (over && isValidKind(drag.kind)) aimFromPosition(drag, over, x, y)
  else drag.region = null
  syncHoverFromDrag(drag)
}

const setAim = (dir: Dir): void => {
  const drag = view.drag
  if (!drag) return
  if (!dirsFor(drag.type).includes(dir)) return
  applyAim(drag, dir)
}

/**
 * Lock the placement in: `type` (from the drag or the selection) onto `cell`,
 * facing `dir`. False when the rules refused it — a hand/board disagreement
 * the view could not see — in which case the pebble goes back and the turn
 * stays open rather than half-committing.
 */
/**
 * `aimed`: the placement was pointed somewhere DELIBERATELY, by a pointer
 * precise enough to have shown the player the answer first — a mouse standing
 * in one of the tile's aim regions. See the window rule at the end.
 */
const commitMove = (type: RuneType, cell: Cell, dir: Dir, source: 'drag' | 'tap', aimed = false): boolean => {
  if (!state) return false
  const move: Move = { side: 'player', faction: null, type, col: cell.col, row: cell.row, dir }
  const boonBefore = state.boons[type]
  const next = commitPlayerMove(state, move)
  if (next.phase !== 'reveal') { clearDrag(); clearSelection(); return false }
  const firstPlacement = !placedThisMatch
  state = next
  // The rules spent the boon on this placement: the shop's stock follows.
  if (boonBefore !== undefined && state.boons[type] === undefined) consumePowerRune(type)
  const wasDefault = dir === defaultDir(type, 'player')
  if (getState<boolean>(TUTORIAL_KEY, false) !== true) setState(TUTORIAL_KEY, true)
  if (!wasDefault && getState<boolean>(AIMED_KEY, false) !== true) setState(AIMED_KEY, true)
  // One more time this rune has been placed — its tooltip retires after a few.
  recordRuneUse(type)
  placedThisMatch = true
  relief.playerPassedLastTurn = false
  tutorialHold = false
  syncTimerPaused()
  clearDrag()
  clearSelection()
  view.hand = state.hand
  view.rerollsLeft = state.rerollsLeft
  rerollsLeft.value = state.rerollsLeft
  view.playerMove = state.playerMove
  view.ghost = null
  ghostActive.value = false
  hasPlaced.value = true
  // The heavy stone thud at the moment the placement LOCKS. The renderer
  // plays the landing again, quieter, when the pebble slams down at reveal.
  playFx('place', 1)
  emit({ kind: 'placed' })
  // A shield or a totem has no facing to correct: straight to the reveal. (It
  // is also the reason an `omni` rune needs no `aimed` exception below — this
  // line has always skipped its window, for every input, and the correction
  // window was never an undo for it either.)
  if (RUNES[type].aim === 'omni') { enterReveal(state); return true }
  // Everything else sits on its tile, face up, for one more second — longer
  // after a tap, which has not aimed it at all.
  const windowMs = source === 'tap' ? LOCK_WINDOW_TAP_MS : LOCK_WINDOW_MS
  // The lesson: the first placement on a node whose ghost script has a
  // `reaim` does not move on until the rune faces the way the ghost shows —
  // unless the player aimed it that way already, which is the lesson learned.
  const script = state.config.ghost
  const want = script?.reaim
  const held = firstPlacement && want !== undefined && want !== dir && dirsFor(type).includes(want)

  /**
   * ─── When the correction window is worth a second of the player's time ────
   *
   * It exists to undo a facing the player could not see before committing. A
   * MOUSE standing in one of the tile's aim regions could: the compass was
   * drawn under the cursor, lit, before the click. So an aimed precise
   * placement goes straight to the reveal and the game runs a second faster
   * every single turn.
   *
   * It is KEPT for a finger (which covers the tile it is choosing on), for a
   * tap that named no direction, and for a pebble released without ever
   * entering a region — none of those saw the answer first.
   *
   * And it is kept, always, on a node whose ghost teaches the re-aim: 1-1's
   * whole lesson IS this window, and a lesson must not evaporate because the
   * player happens to be on a desktop.
   */
  const lessonNeedsWindow = firstPlacement && want !== undefined
  if (aimed && !lessonNeedsWindow) { enterReveal(state); return true }
  view.lock = { cell: { col: cell.col, row: cell.row }, type, dir, leftMs: windowMs, totalMs: windowMs, source, held }
  lockOpen.value = true
  holdMs = 0
  if (held && want !== undefined) {
    view.ghost = { handIndex: -1, to: { col: cell.col, row: cell.row }, dir: want, mode: 'reaim', reaim: want }
    ghostActive.value = true
  }
  return true
}

/** The window is over: whatever the rune faces now is what it does. */
const closeLock = (): void => {
  if (view.drag && view.drag.mode === 'correct') clearDrag()
  closeLockQuietly()
  if (state) enterReveal(state)
}

/** Nothing may be picked up, selected or placed right now. */
const handBusy = (): boolean =>
  !state || view.phase !== 'planning' || hasPlaced.value || view.resetting || view.drag !== null || view.lock !== null

/**
 * Tap-to-place, step one: select hand slot `index`. A tap on the selected slot
 * again — or `-1` — lets it go. True when something changed.
 */
const selectHand = (index: number): boolean => {
  if (handBusy()) return false
  if (index < 0 || index === view.selected) {
    const had = view.selected >= 0
    clearSelection()
    return had
  }
  if (!state!.hand[index]) return false
  keyDir = null
  view.selected = index
  selectedHand.value = index
  syncActiveRune()
  return true
}

/**
 * Tap-to-place, step two: the selected pebble goes onto `cell` with the
 * facing a key chose for it, else its default — and gets the longer window.
 */
const placeSelected = (cell: Cell, dir?: Dir): boolean => {
  if (handBusy()) {
    if (!state || view.resetting || view.drag) return false
    return refuse(hasPlaced.value ? 'placed' : view.phase !== 'planning' ? 'phase' : 'placed')
  }
  const index = view.selected
  const type = index >= 0 ? state!.hand[index] : undefined
  if (!type) return false
  if (!isValidKind(placementKindFor(state!, type, cell))) return refuse('tile')
  // A `dir` is the region the pointer CLICKED in — only a precise pointer has
  // one, and only after `setHover` has been drawing that region under the
  // cursor. Both halves are required: the skip is earned by the player having
  // SEEN the facing, not merely by the caller naming one.
  const named = dir !== undefined && dirsFor(type).includes(dir)
  const hover = view.hover
  const aimed = named && hover !== null && hover.precise
    && hover.cell.col === cell.col && hover.cell.row === cell.row
  const facing = named ? dir! : heldFacing(type, cell)
  return commitMove(type, cell, facing, 'tap', aimed)
}

/**
 * The pointer moved over the board with a pebble in hand. Maintains the tile's
 * compass (`view.hover`) that the renderer draws; `null` clears it.
 *
 * Only a precise pointer calls this — a finger covers the regions it would be
 * choosing between, so drawing them under it would be showing the player their
 * own thumb.
 */
const setHover = (cell: Cell | null, fx = 0.5, fy = 0.5): void => {
  if (!state || view.phase !== 'planning' || view.resetting) { view.hover = null; return }
  const drag = view.drag
  const type = drag && drag.mode === 'place' ? drag.type
    : view.selected >= 0 ? state.hand[view.selected] : undefined
  if (!cell || !type) { view.hover = null; return }
  // Inside the dead zone nothing has been picked, so the compass promises the
  // facing the pebble is ALREADY carrying — the same one a click there commits.
  const chosen = isAimChosen(fx, fy)
  const held = drag && drag.mode === 'place' ? drag.dir : heldFacing(type, cell)
  setHoverState(type, cell, chosen ? dirFromCellPoint(type, fx, fy) : held, chosen, true)
}

/**
 * A facing without a stroke: an arrow key, WASD, a chevron tap. Whatever the
 * player is aiming right now takes it — the pebble being dragged (landing it
 * first when it hovers a tile that will take it), the pebble selected, or the
 * rune inside its correction window. False when there was nothing to aim.
 */
const aimKey = (dir: Dir): boolean => {
  if (!state || view.phase !== 'planning' || view.resetting || dir === 'omni') return false
  const drag = view.drag
  if (drag) {
    if (!dirsFor(drag.type).includes(dir)) return false
    if (drag.mode === 'correct') {
      if (!reaimLock(dir)) return false
      drag.dir = dir
      return true
    }
    keyDir = dir
    if (!drag.aiming && drag.over && isValidKind(drag.kind)) land(drag)
    if (drag.aiming) applyAim(drag, dir)
    else drag.dir = dir
    return true
  }
  const lock = view.lock
  if (lock) {
    if (!lock.held && lock.leftMs <= 0) return false
    if (!dirsFor(lock.type).includes(dir)) return false
    return reaimLock(dir)
  }
  if (view.selected >= 0) {
    const type = state.hand[view.selected]
    if (!type || !dirsFor(type).includes(dir)) return false
    keyDir = dir
    return true
  }
  return false
}

/**
 * ─── The gesture the game does not have ─────────────────────────────────────
 *
 * A stone that is down is down: WHERE inside the tile it was released is what
 * turned it, and on a precise pointer there is no correction window afterwards
 * because the compass was lit under the cursor the whole time.
 *
 * Players do not know that yet. The observed failure is consistent: place a
 * rune, notice it faces the wrong way, and try to drag FROM the stone toward
 * the direction it should face — a gesture that does nothing at all, silently,
 * which reads as a broken game rather than as a rule. Saying so is the only
 * way anybody learns that the drop is the aim.
 *
 * Only worth saying while it could still be acted on — during planning, for a
 * stone placed this turn.
 */
const noteLateAim = (): boolean => {
  // NOT gated on `planning`. On a precise pointer a placement goes straight to
  // the reveal — there is no correction window to wait in — so by the time the
  // player has seen the facing and reached for the stone, the turn has already
  // moved on. That moment IS the one worth explaining; requiring the planning
  // phase meant the hint could never fire on the input it was written for.
  if (view.phase === 'ended' || !hasPlaced.value || view.lock !== null) return false
  return refuse('lateAim')
}

const beginCorrection = (x: number, y: number): boolean => {
  const lock = view.lock
  if (!state || !lock || view.phase !== 'planning' || view.drag || view.resetting) return false
  if (lock.leftMs <= 0) return false
  const drag: DragState = {
    mode: 'correct', handIndex: -1, type: lock.type, x, y,
    over: { col: lock.cell.col, row: lock.cell.row }, kind: null, aiming: true, dir: lock.dir, anchor: { x, y },
    // A correction is a STROKE, always: the press can land anywhere on the
    // canvas, not inside the stone's own tile, so there is no region to read
    // and nothing for a precise pointer to have seen in advance.
    region: null, precise: false
  }
  view.drag = drag
  isDragging.value = true
  isAiming.value = true
  clearStrokes()
  return true
}

const endDrag = (commit: boolean): void => {
  const drag = view.drag
  if (!drag || !state) return
  if (drag.mode === 'correct') {
    // The stroke is over; the window keeps draining. If it already ran out
    // while the finger was down, the reveal was waiting for exactly this.
    const expired = view.lock !== null && view.lock.leftMs <= 0
    clearDrag()
    if (expired) closeLock()
    return
  }
  if (!commit || view.phase !== 'planning' || hasPlaced.value) { clearDrag(); return }

  // ─── A mouse never gets a correction window ───────────────────────────────
  //
  // The tile's compass is drawn under the cursor the whole time a pebble is in
  // hand: every region outlined with the arrow it would produce, the one being
  // pointed at lit. A player with a mouse can SEE the answer before they let
  // go, so correcting afterwards is a second of their time spent on a question
  // that was already answered — every single turn.
  //
  // This used to be `drag.precise && drag.region !== null`, which skipped the
  // window only when the release landed inside one of the triangles. Dropping
  // in the MIDDLE of a tile is the natural thing to do, the middle is a
  // deliberate dead zone that chooses nothing, and so the window came back on
  // exactly the placement people make most. Pointing is the desktop gesture;
  // the middle of the tile is simply not where you aim from, and a first drop
  // that goes the wrong way teaches that faster than a correction window hides
  // it.
  //
  // A finger still gets the window: it covers the tile it is choosing on.
  const aimed = drag.precise
  // The pebble has landed on a tile and the strokes are its facing.
  if (drag.aiming && drag.over && isValidKind(drag.kind)) {
    commitMove(drag.type, drag.over, drag.dir, 'drag', aimed)
    return
  }
  // Released over a valid tile before landing: the region under the pointer if
  // there is one, else the facing a key chose on the way, else the default
  // (toward the enemy).
  if (drag.over && isValidKind(drag.kind)) {
    const dir = drag.region !== null ? drag.region : heldFacing(drag.type, drag.over)
    commitMove(drag.type, drag.over, dir, 'drag', aimed)
    return
  }
  // Released ON a tile this rune cannot go to — an enemy's stone, a friendly
  // one of the wrong type, or one already at the cap. The swipe-through
  // fallback below would quietly put it on the last LEGAL tile the pebble
  // crossed, which is a tile the player did not aim at. A blind tester
  // followed the lesson's own "drop a matching rune on yours to level it up",
  // dropped onto a rune that could not take it, and watched the stone go to
  // the square next door instead — over and over, never once merging, with
  // nothing said (2026-09-12). An aimed drop that cannot happen has to be
  // REFUSED, because the refusal is the only thing that teaches the rule.
  if (drag.over && !isValidKind(drag.kind)) {
    clearDrag()
    refuse('tile')
    return
  }
  // A fast flick THROUGH a tile and off the board — the GDD's "touch release +
  // swipe vector". The last valid tile crossed is the target and the travel
  // since entering it is the swipe. Not when the pebble was brought back
  // toward where it was picked up: that is a cancel.
  if (lastValidCell && isValidKind(lastValidKind)) {
    const backHome = Math.hypot(drag.x - dragStartX, drag.y - dragStartY) < metrics.swipeThresholdPx * 2
    if (!backHome) {
      commitMove(drag.type, lastValidCell, snapDir(drag.type, 'player', drag.x - lastValidEnterX, drag.y - lastValidEnterY, metrics.swipeThresholdPx), 'drag')
      return
    }
  }
  clearDrag()
}

const reroll = (): void => {
  if (!state || view.phase !== 'planning' || hasPlaced.value || view.drag || view.resetting) return
  if (state.rerollsLeft <= 0) return
  state = rerollHand(state)
  clearSelection()
  view.hand = state.hand
  view.rerollsLeft = state.rerollsLeft
  rerollsLeft.value = state.rerollsLeft
  // The lesson may now point at a different slot.
  view.ghost = ghostFor(state)
  ghostActive.value = view.ghost !== null
}

const tick = (nowMs: number, dtMs: number): void => {
  const dt = Number.isFinite(dtMs) ? Math.max(0, Math.min(dtMs, 250)) : 0
  view.ageMs += dt

  if (resetElapsed >= 0) {
    resetElapsed += dt
    if (resetElapsed >= RESET_MS) {
      resetElapsed = -1
      view.resetting = false
      startNode(pendingNodeId)
    }
    return
  }
  if (!state || externalPaused) return

  switch (view.phase) {
    case 'planning': {
      // The landing clock: a finger that has stayed inside a valid tile is
      // placing there, not still travelling.
      const drag = view.drag
      if (drag && drag.mode === 'place' && !drag.aiming) {
        if (drag.over && isValidKind(drag.kind)) {
          landMs += dt
          if (landMs >= AIM_LAND_MS) land(drag)
        } else landMs = 0
      }
      // The correction window drains whether or not a finger is down; a stroke
      // still under way when it empties gets a short grace, then the reveal.
      const lock = view.lock
      if (lock) {
        // A lesson's window waits for the player's correction — not forever.
        if (lock.held) {
          holdMs += dt
          if (holdMs >= LESSON_REAIM_HOLD_MS) {
            lock.held = false
            closeLock()
          }
          return
        }
        lock.leftMs -= dt
        if (lock.leftMs <= 0) {
          const strokeLive = drag !== null && drag.mode === 'correct'
          if (!strokeLive || lock.leftMs <= -LOCK_GRACE_MS) closeLock()
        }
        return
      }
      if (view.timer.paused || hasPlaced.value) return
      const secondsBefore = Math.ceil(view.timer.leftMs / 1000)
      view.timer.leftMs -= dt
      // The last three seconds tick, rising, and the final one is brighter — the
      // player's ear is on the board, so the clock has to be audible.
      const secondsAfter = Math.ceil(view.timer.leftMs / 1000)
      if (secondsAfter < secondsBefore && secondsAfter >= 1 && secondsAfter <= 3) {
        playFx(secondsAfter === 1 ? 'tickFinal' : 'tick', (3 - secondsAfter) / 2)
      }
      if (view.timer.leftMs <= 0) {
        view.timer.leftMs = 0
        publishTimer(true, nowMs)
        // Time's up: the turn passes with no placement — and the relief takes note.
        relief.passesThisMatch++
        relief.playerPassedLastTurn = true
        clearDrag()
        state = commitPlayerMove(state, null)
        enterReveal(state)
        return
      }
      publishTimer(false, nowMs)
      return
    }
    case 'reveal': {
      const reveal = view.reveal
      if (!reveal) { startResolve(); return }
      reveal.elapsedMs += dt
      if (reveal.elapsedMs >= REVEAL_MS) startResolve()
      return
    }
    case 'resolve': {
      const tl = view.timeline
      if (!tl) { endResolve(Date.now()); return }
      // A lesson's resolution runs at `LESSON_RESOLVE_SCALE` of speed. The
      // whole turn — swords, arrows, beams, a stone shattering — is over in
      // 1.2 s, and a first-time player is still reading the board when it
      // starts: "combat is basically invisible … units just silently vanish"
      // was the strategy tester's whole complaint (2026-09-11). Slowing the
      // CLOCK rather than the timeline keeps the resolver's own ordering
      // exactly as it is, and it returns to full speed at the first real duel.
      tl.elapsedMs += dt / (state?.config.tutorial ? LESSON_RESOLVE_SCALE : 1)
      // The renderer plays `before` + events until the window closes, then the
      // settled board takes over.
      if (tl.elapsedMs >= RESOLVE_MS && view.board !== tl.after) {
        view.board = tl.after
        syncCounts()
      }
      if (tl.elapsedMs >= RESOLVE_MS + BETWEEN_TURNS_MS) endResolve(Date.now())
      return
    }
    default:
      return
  }
}

const setLabels = (labels: CanvasLabels): void => { view.labels = labels }

const onEvent = (cb: (e: BattleEvent) => void): (() => void) => {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

const setPaused = (paused: boolean): void => {
  externalPaused = paused
  syncTimerPaused()
}

// A skin bought mid-match repaints the pebbles at once.
// Changing the equipped material repaints the board — unless THIS node pins
// one of its own, in which case the player's choice waits for the next node.
watch(activeSkin, (skin) => { if (!state?.config.skin) view.skin = skin })

export const battle: Battle = {
  view,
  beginDrag, updateDrag, setAim, endDrag, beginCorrection, noteLateAim, selectHand, placeSelected, setHover, aimKey,
  reroll, tick,
  phase, turn, turnLimit, suddenDeath, playerTiles, enemyTiles, enemyRunes, rerollsLeft, timerLeftMs, timerPaused,
  result, node, matchActive, hasPlaced, isDragging, isAiming, lockOpen, selectedHand, activeRune, ghostActive, lastSummary,
  rejected,
  startNode, retryNode, nextNode, setLabels, onEvent, setPaused
}

/** Test seam: the live match state, read-only. */
export const __matchState = (): MatchState | null => state

/** Test seam: the relief bookkeeping for this match, read-only. */
export const __relief = (): Readonly<MatchRelief> => relief

/**
 * Cheat / test seam: end the current match right now — won by default, lost
 * when asked. The losing side is what the RESULT flow is hardest to reach by
 * playing (a defeat takes a deliberately bad match), and the post-defeat ad
 * ordering has to be watched in a real browser.
 *
 * Goes through the same `finishMatch` as a real verdict so the streak, the
 * chest, the coins and the leaderboard post all happen exactly as they would
 * — the only thing skipped is the fighting.
 */
export const __winMatchNow = (won = true): void => {
  if (!state || !matchActive.value) return
  const now = Date.now()
  clearDrag()
  clearSelection()
  closeLockQuietly()
  resetElapsed = -1
  view.resetting = false
  state = {
    ...state,
    phase: 'ended',
    result: {
      won, reason: 'conquest', turns: state.turn,
      playerTiles: countTiles(state.board, 'player'), enemyTiles: countTiles(state.board, 'enemy'),
      maxCombo: state.maxCombo, kills: state.kills, durationMs: Math.max(0, now - state.startedAt)
    }
  }
  finishMatch(state, now)
}

const useBattle = (): Battle => battle
export default useBattle
