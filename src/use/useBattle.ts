import { ref, watch, type Ref } from 'vue'
import {
  AIM_LAND_MS, AIM_STROKE_PX, AIM_STROKE_WINDOW_MS, AIM_UNLOCK_TILES, BETWEEN_TURNS_MS, GRID,
  LESSON_REAIM_HOLD_MS, LOCK_WINDOW_MS, LOCK_WINDOW_TAP_MS, LOSS_COINS_FRACTION, PLANNING_MAX_MS, PLANNING_MS,
  RESET_MS, RESOLVE_MS, REVEAL_MS, RUNES, RUNE_TYPES,
  TURN_LIMIT, WIN_COINS_BASE, WIN_COINS_PER_KILL, WIN_COINS_PER_TILE, defaultDir, dirsFor, snapDir,
  streakMultiplier,
  type BoardState, type Cell, type ChestReward, type Dir, type MatchPhase, type MatchResult, type MatchState,
  type Move, type NodeConfig, type RuneType, type Tile
} from '@/game/rules'
import type { ArenaView, BattleApi, CanvasLabels, DragState, GhostHint, LockState, PlacementKind } from '@/game/view'
import {
  beginPlanning, canReaim, commitPlayerMove, createMatch, evaluateResult, nextTurn, placementKindFor,
  reaimPlayerMove, rerollHand, resolveCurrentTurn
} from '@/game/match'
import { cloneBoard, countTiles, runesOf } from '@/game/board'
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

/** The aim region the point stands in for `type` on `cell`, or `null` when unknown. */
const regionAt = (type: RuneType, cell: Cell, x: number, y: number): Dir | null => {
  const f = cellFraction(cell, x, y)
  return f ? dirFromCellPoint(type, f.fx, f.fy) : null
}

/** True while the point is inside `cell` itself, not merely near it. */
const insideCell = (cell: Cell, x: number, y: number): boolean => {
  const f = cellFraction(cell, x, y)
  return f !== null && f.fx >= 0 && f.fx <= 1 && f.fy >= 0 && f.fy <= 1
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
  lastTurn: 'LAST TURN'
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
  isDragging.value = false
  isAiming.value = false
  lastValidCell = null
  lastValidKind = null
  dragOverKey = -1
  landMs = 0
  keyDir = null
  clearStrokes()
  syncActiveRune()
}

/** Tap-to-place: nothing is selected any more (and no key facing waits for it). */
const clearSelection = (): void => {
  keyDir = null
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
  if (!beat || placedThisMatch) return null
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
  tutorialHold = view.ghost !== null || (!s.config.timer && !placedThisMatch)
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
  view.skin = activeSkin.value
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
  if (!state || view.phase !== 'planning' || hasPlaced.value || view.resetting || view.drag) return false
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
  landMs = 0
  clearStrokes()
  return true
}

const isValidKind = (k: PlacementKind | null): k is 'empty' | 'stack' => k === 'empty' || k === 'stack'

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
    // Landed. Strokes aim; only a real departure — most of a tile from the
    // tile's centre — re-targets, so a flick may cross into the neighbour and
    // the pebble stays where it was put.
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
    drag.over = over
    drag.kind = over ? placementKindFor(state, drag.type, over) : null
    if (over && isValidKind(drag.kind)) {
      lastValidCell = over
      lastValidKind = drag.kind
      lastValidEnterX = x
      lastValidEnterY = y
    }
  }
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
const commitMove = (type: RuneType, cell: Cell, dir: Dir, source: 'drag' | 'tap'): boolean => {
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
  // A shield or a totem has no facing to correct: straight to the reveal.
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
const placeSelected = (cell: Cell): boolean => {
  if (handBusy()) return false
  const index = view.selected
  const type = index >= 0 ? state!.hand[index] : undefined
  if (!type) return false
  if (!isValidKind(placementKindFor(state!, type, cell))) return false
  const dir = keyDir !== null && dirsFor(type).includes(keyDir) ? keyDir : defaultDir(type, 'player')
  return commitMove(type, cell, dir, 'tap')
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

const beginCorrection = (x: number, y: number): boolean => {
  const lock = view.lock
  if (!state || !lock || view.phase !== 'planning' || view.drag || view.resetting) return false
  if (lock.leftMs <= 0) return false
  const drag: DragState = {
    mode: 'correct', handIndex: -1, type: lock.type, x, y,
    over: { col: lock.cell.col, row: lock.cell.row }, kind: null, aiming: true, dir: lock.dir, anchor: { x, y }
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

  // The pebble has landed on a tile and the strokes are its facing.
  if (drag.aiming && drag.over && isValidKind(drag.kind)) {
    commitMove(drag.type, drag.over, drag.dir, 'drag')
    return
  }
  // Released over a valid tile before landing: no stroke, so the facing a key
  // chose on the way — else the default (toward the enemy).
  if (drag.over && isValidKind(drag.kind)) {
    const dir = keyDir !== null && dirsFor(drag.type).includes(keyDir) ? keyDir : defaultDir(drag.type, 'player')
    commitMove(drag.type, drag.over, dir, 'drag')
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
      tl.elapsedMs += dt
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
watch(activeSkin, (skin) => { view.skin = skin })

export const battle: Battle = {
  view,
  beginDrag, updateDrag, setAim, endDrag, beginCorrection, selectHand, placeSelected, aimKey, reroll, tick,
  phase, turn, turnLimit, suddenDeath, playerTiles, enemyTiles, rerollsLeft, timerLeftMs, timerPaused,
  result, node, matchActive, hasPlaced, isDragging, isAiming, lockOpen, selectedHand, activeRune, ghostActive, lastSummary,
  startNode, retryNode, nextNode, setLabels, onEvent, setPaused
}

/** Test seam: the live match state, read-only. */
export const __matchState = (): MatchState | null => state

/** Test seam: the relief bookkeeping for this match, read-only. */
export const __relief = (): Readonly<MatchRelief> => relief

/**
 * Cheat / test seam: end the current match as a win right now.
 *
 * Goes through the same `finishMatch` as a real verdict so the streak, the
 * chest, the coins and the leaderboard post all happen exactly as they would
 * — the only thing skipped is the fighting.
 */
export const __winMatchNow = (): void => {
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
      won: true, reason: 'conquest', turns: state.turn,
      playerTiles: countTiles(state.board, 'player'), enemyTiles: countTiles(state.board, 'enemy'),
      maxCombo: state.maxCombo, kills: state.kills, durationMs: Math.max(0, now - state.startedAt)
    }
  }
  finishMatch(state, now)
}

const useBattle = (): Battle => battle
export default useBattle
