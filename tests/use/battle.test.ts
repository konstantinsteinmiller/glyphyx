import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AIM_LAND_MS, BETWEEN_TURNS_MS, LESSON_REAIM_HOLD_MS, LOCK_WINDOW_MS, LOCK_WINDOW_TAP_MS, NO_HANDICAP,
  LESSON_RESOLVE_SCALE, PLANNING_MS, RESET_MS, RESOLVE_MS, REVEAL_MS
} from '@/game/rules'
import { runeAt } from '@/game/board'

/**
 * ─── The battle composable, driven like the scene drives it ────────────────
 *
 * Real domain modules underneath (board, resolve, ai, campaign, match). Only
 * the leaderboard is mocked — it is the one thing here that would touch the
 * network, and it is not what is under test — and, per test, the adaptive
 * rule, so the enemy's dice stay the enemy's.
 */

type BattleModule = typeof import('@/use/useBattle')

/**
 * The previous test's module instance may still hold a debounced persist
 * timer; drained before the next seed lands, or it fires mid-import and hands
 * the fresh modules the OLD blob — a phantom hydrate.
 */
let lastState: typeof import('@/use/useGlyphyxState') | null = null

interface LoadOptions {
  /** Replace the adaptive rule for this test. */
  handicap?: (input: import('@/game/rules').HandicapInput) => import('@/game/rules').Handicap
  /**
   * Rewrite the node the campaign hands back, so a test can drive a node SHAPE
   * the rules support but no shipped node uses today — see `REAIM_LESSON`.
   * Everything else about the node stays real.
   */
  patchNode?: (cfg: import('@/game/rules').NodeConfig) => import('@/game/rules').NodeConfig
}

const load = async (blob: Record<string, unknown> = {}, opts: LoadOptions = {}) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  if (opts.patchNode) {
    // `useCampaign` builds every node through this one function, so patching it
    // reaches `nodeConfigFor` — and the battle — without mocking a composable.
    const actual = await vi.importActual<typeof import('@/game/campaign')>('@/game/campaign')
    vi.doMock('@/game/campaign', () => ({
      ...actual,
      nodeConfig: (id: number, difficulty: 'easy' | 'medium' | 'hard') => opts.patchNode!(actual.nodeConfig(id, difficulty))
    }))
  }
  const reportMatch = vi.fn(async () => {})
  vi.doMock('@/use/useLeaderboard', () => ({ reportMatch, rankFor: () => 0, leaderboardEnabled: false }))
  const computeHandicap = vi.fn(opts.handicap ?? (() => ({ ...NO_HANDICAP })))
  vi.doMock('@/game/adaptive', () => ({ computeHandicap }))
  const mod: BattleModule = await import('@/use/useBattle')
  const campaign = await import('@/use/useCampaign')
  const economy = (await import('@/use/useEconomy')).default()
  const streak = await import('@/use/useStreak')
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  const events: string[] = []
  mod.battle.onEvent((e) => events.push(e.kind))
  return { battle: mod.battle, mod, campaign, economy, streak, state, events, reportMatch, computeHandicap }
}

/**
 * A node with a clock, a real opponent and NO teaching hand on it.
 *
 * This was 7 — the first such node — until 1-7 gained a `guide`: one taught
 * opening move on a node that is otherwise a real fight, added because
 * conquest was the one thing the campaign never taught. A guide holds the
 * planning clock exactly the way a lesson's ghost does (a player being shown a
 * move must not be timed out mid-lesson), so 7 is no longer the right board to
 * assert clock behaviour against. 2-1 is the next conquest node and carries no
 * guide.
 */
const NORMAL = 9
const normalBlob = (extra: Record<string, unknown> = {}) =>
  ({ gx_best_node: NORMAL - 1, gx_node: NORMAL, gx_tutorial_seen: true, ...extra })

/** Run the RAF clock forward in frame-sized steps — `tick` clamps a single dt. */
const advance = (battle: BattleModule['battle'], ms: number): void => {
  let t = 0
  while (t < ms) {
    const dt = Math.min(50, ms - t)
    t += dt
    battle.tick(Date.now() + t, dt)
  }
}

/** Drag hand slot `index` onto `cell`, let it land, release, and let the correction window close. */
const placeAt = (battle: BattleModule['battle'], index: number, cell: { col: number; row: number }): void => {
  expect(battle.beginDrag(index, 100, 600)).toBe(true)
  battle.updateDrag(120, 420, cell)
  advance(battle, AIM_LAND_MS + 40)
  battle.endDrag(true)
  if (battle.lockOpen.value) advance(battle, LOCK_WINDOW_MS + 20)
}

/**
 * ─── A lesson that drills the correction ────────────────────────────────────
 *
 * 1-1 used to drop the sword facing nothing and then hold the correction
 * window open until the player pressed the stone and flicked it left. It does
 * not any more: where you release inside a tile IS the facing, so the drop and
 * the aim are one gesture and the lesson is over when the pebble lands.
 *
 * The held window itself is still a rule — `GhostSpec.reaim` arms it, and any
 * lesson that wants to teach the correction can ask for it again. No shipped
 * node does today, so the tests that cover it build one: 1-1 with `reaim` put
 * back on its ghost and nothing else touched.
 */
const REAIM_LESSON: LoadOptions = {
  patchNode: (cfg) => (cfg.id === 1 && cfg.ghost ? { ...cfg, ghost: { ...cfg.ghost, reaim: 'left' } } : cfg)
}

/** The metrics an 85 px tile hands over, with the board's origin at (0, 0). */
const TILE = 85
const tileMetrics = () => ({
  swipeThresholdPx: TILE * 0.3,
  tilePx: TILE,
  tileCenter: (c: { col: number; row: number }) => ({ x: c.col * TILE + TILE / 2, y: c.row * TILE + TILE / 2 })
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('starting a node', () => {
  it('boots 1-1 with the sword hand, the skeleton, the scripted ghost and no clock', async () => {
    const { battle, events } = await load()
    battle.startNode(1)
    expect(battle.node.value?.id).toBe(1)
    expect(battle.matchActive.value).toBe(true)
    expect(battle.phase.value).toBe('planning')
    expect(battle.turn.value).toBe(1)
    expect(battle.view.hand).toEqual(['melee', 'melee', 'melee'])
    expect(battle.rerollsLeft.value).toBe(2)
    // The ghost hand shows the ONE gesture the game is played with — the sword
    // carried to (1,2) and released on the side facing the skeleton — and the
    // clock waits for it. No re-aim: the drop is the aim.
    expect(battle.ghostActive.value).toBe(true)
    expect(battle.view.ghost).toEqual({ handIndex: 0, to: { col: 1, row: 2 }, dir: 'left', mode: 'place' })
    expect(battle.view.ghost!.reaim).toBeUndefined()
    expect(battle.timerPaused.value).toBe(true)
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.selectedHand.value).toBe(-1)
    expect(battle.activeRune.value).toBeNull()
    // The skeleton stands LEFT of the ghost's tile, on (0,2); the player owns the bottom row.
    const skeleton = Object.values(battle.view.board.runes).find((r) => r.side === 'enemy')
    expect(skeleton).toMatchObject({ col: 0, row: 2, hp: 1, type: 'melee' })
    expect(battle.playerTiles.value).toBe(4)
    expect(battle.enemyTiles.value).toBe(5)
    expect(events).toEqual(['matchStart', 'turnStart'])
  })

  it('the ghost points at the scripted rune wherever it sits in the hand', async () => {
    const { battle } = await load({ gx_best_node: 3, gx_node: 4, gx_tutorial_seen: true })
    // 1-4 teaches the orb: the ghost carries the mage, whichever slot holds it.
    battle.startNode(4)
    const ghost = battle.view.ghost!
    expect(ghost).not.toBeNull()
    expect(battle.view.hand[ghost.handIndex]).toBe('mage')
    expect(ghost).toMatchObject({ to: { col: 1, row: 2 }, dir: 'ur' })
  })

  it('resumes the saved node when called with no argument', async () => {
    const { battle } = await load({ gx_node: 3, gx_best_node: 2, gx_unlocked_runes: ['melee', 'archer'] })
    battle.startNode()
    expect(battle.node.value?.id).toBe(3)
  })

  it('clamps a node past the unlocked frontier', async () => {
    const { battle, campaign } = await load({ gx_best_node: 1 })
    battle.startNode(7)
    expect(battle.node.value?.id).toBe(2)
    expect(campaign.currentNode.value).toBe(2)
  })

  it('does not hold the clock for a returning player on a normal node', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    expect(battle.ghostActive.value).toBe(false)
    expect(battle.timerPaused.value).toBe(false)
    expect(battle.timerLeftMs.value).toBe(PLANNING_MS)
  })
})

describe('the drag protocol', () => {
  it('follows the finger while it travels and lands once it has stayed on a tile', async () => {
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    expect(battle.beginDrag(0, 100, 600)).toBe(true)
    expect(battle.isDragging.value).toBe(true)
    const drag = battle.view.drag!
    expect(drag.mode).toBe('place')
    expect(drag.type).toBe('melee')
    expect(drag.dir).toBe('up')

    // Crossing the bottom row on the way up: valid, but still travelling.
    battle.updateDrag(127, 297, { col: 1, row: 3 })
    expect(drag.over).toEqual({ col: 1, row: 3 })
    expect(drag.kind).toBe('empty')
    expect(drag.aiming).toBe(false)
    // Keeps moving → the target follows.
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, 16)
    expect(drag.over).toEqual({ col: 1, row: 2 })
    expect(drag.aiming).toBe(false)
    // Stays → landed, anchored where the finger is.
    advance(battle, AIM_LAND_MS + 10)
    expect(drag.aiming).toBe(true)
    expect(battle.isAiming.value).toBe(true)
    expect(drag.anchor).toEqual({ x: 127, y: 212 })
    // A flick onto the neighbour does NOT retarget — that is the stroke.
    battle.updateDrag(127, 160, { col: 1, row: 1 })
    expect(drag.over).toEqual({ col: 1, row: 2 })
    expect(drag.aiming).toBe(true)
  })

  it('inside a tile there is no distance threshold at all — the position IS the facing', async () => {
    // This used to pin the twelve-pixel stroke threshold. Inside a tile there
    // is no longer a threshold to pin: the pointer's position answers directly,
    // so the only thing that decides the facing is which region it stands in.
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    expect(drag.type).toBe('melee')
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    // The centre chooses nothing, so the pebble still faces the way it arrived.
    expect(drag.dir).toBe('up')
    // A few pixels toward the left edge is already left — no minimum travel.
    battle.updateDrag(100, 212, { col: 1, row: 2 })
    expect(drag.dir).toBe('left')
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('entering a tile at its edge, every facing is reachable without leaving it', async () => {
    // The complaint this pins: "if I enter a grid spot on one edge and stay
    // there, it is really hard to change the attack vector". Position aiming
    // answers it directly — the facing IS the edge the pointer is nearest, so
    // reaching another one is a slide across the same tile rather than a flick
    // that has to clear a distance threshold.
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    // Two pixels inside the right edge of (1,2) — the tile spans x 85..170.
    battle.updateDrag(168, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(drag.aiming).toBe(true)
    expect(drag.dir).toBe('right')
    // Every other facing, from the same landed tile, by sliding across it.
    battle.updateDrag(92, 212, { col: 1, row: 2 })
    expect(drag.dir).toBe('left')
    battle.updateDrag(127, 178, { col: 1, row: 2 })
    expect(drag.dir).toBe('up')
    battle.updateDrag(127, 247, { col: 1, row: 2 })
    expect(drag.dir).toBe('down')
    // …and the stone never moved off the tile it was put on.
    expect(drag.over).toEqual({ col: 1, row: 2 })
  })

  it('a flick OUT past the edge still aims, for a thumb that cannot see the tile', async () => {
    // Position aims while the pointer is inside the tile; the stroke path is
    // what answers once it leaves, and it is still the only aim a finger has
    // when it has slid off the stone it is placing.
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    battle.updateDrag(168, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(drag.dir).toBe('right')
    // Out of the tile to the right: a stroke, not a position.
    battle.updateDrag(176, 212, { col: 2, row: 2 })
    battle.updateDrag(183, 212, { col: 2, row: 2 })
    expect(drag.region).toBeNull()
    expect(drag.dir).toBe('right')
    expect(drag.over).toEqual({ col: 1, row: 2 })
  })

  it('refuses a drop ON a tile that cannot take the rune, instead of putting it next door', async () => {
    // The lesson tells the player to "drop a matching rune on yours to level it
    // up". A blind tester did exactly that onto a stone that could not take it
    // and the rune landed on the square NEXT DOOR — the last legal tile the
    // pebble had crossed — silently, every time (2026-09-12). The swipe-through
    // fallback is for a flick off the BOARD; a deliberate drop onto an illegal
    // tile has to be told no, because the refusal is the rule.
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    const before = battle.rejected.value?.seq ?? 0
    battle.beginDrag(0, 100, 600)
    // Across a legal tile first, so the fallback has something to land on —
    // carried, not landed, because a LANDED pebble keeps its own tile.
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    // …then onto the skeleton at (0, 2), which no player rune may occupy.
    battle.updateDrag(42, 212, { col: 0, row: 2 })
    battle.endDrag(true)
    expect(battle.view.drag).toBeNull()
    expect(battle.hasPlaced.value).toBe(false)
    expect(runeAt(battle.view.board, 1, 2)).toBeNull()
    expect(battle.rejected.value?.reason).toBe('tile')
    expect(battle.rejected.value!.seq).toBeGreaterThan(before)
  })

  it('a small wobble never flips the facing; crossing to the far side does', async () => {
    // The old failure mode this guards was jitter reading as a stroke. Position
    // aiming cannot jitter at all: the answer depends only on where the pointer
    // IS, and near the middle nothing is chosen, so a hand shaking over the
    // centre holds its facing instead of flickering between two.
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    battle.updateDrag(127, 185, { col: 1, row: 2 })
    expect(drag.dir).toBe('up')
    // Back toward the middle: inside the dead zone, so the facing holds.
    battle.updateDrag(127, 203, { col: 1, row: 2 })
    expect(drag.region).toBeNull()
    expect(drag.dir).toBe('up')
    // Across to the far half: now it is a different choice.
    battle.updateDrag(127, 245, { col: 1, row: 2 })
    expect(drag.dir).toBe('down')
  })

  it('a diagonal rune reads its tile as four quadrants, not four triangles', async () => {
    // 1-4 is the orb lesson: its hand is guaranteed to hold a mage.
    const { battle, mod } = await load({ gx_best_node: 3, gx_node: 4, gx_tutorial_seen: true })
    mod.setDragMetrics(tileMetrics())
    battle.startNode(4)
    const slot = battle.view.hand.indexOf('mage')
    expect(slot).toBeGreaterThanOrEqual(0)
    battle.beginDrag(slot, 100, 600)
    const drag = battle.view.drag!
    expect(drag.type).toBe('mage')
    expect(drag.dir).toBe('ur')
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    // The orb's tile is cut into quadrants, so the lower-left one is `dl`.
    battle.updateDrag(105, 235, { col: 1, row: 2 })
    expect(drag.dir).toBe('dl')
    // Back through the middle: nothing chosen there, so it holds…
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    expect(drag.dir).toBe('dl')
    // …and the upper-right quadrant is `ur`.
    battle.updateDrag(150, 188, { col: 1, row: 2 })
    expect(drag.dir).toBe('ur')
  })

  it('re-targets once the finger has carried on most of a tile from the tile it landed on', async () => {
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(battle.view.drag!.aiming).toBe(true)
    // Half a tile of stroke stays landed…
    battle.updateDrag(127, 170, { col: 1, row: 1 })
    expect(battle.view.drag!.aiming).toBe(true)
    expect(battle.view.drag!.over).toEqual({ col: 1, row: 2 })
    // …two tiles away is a new destination, facing forward again.
    battle.updateDrag(297, 212, { col: 3, row: 2 })
    expect(battle.view.drag!.aiming).toBe(false)
    expect(battle.view.drag!.anchor).toBeNull()
    expect(battle.view.drag!.dir).toBe('up')
    expect(battle.view.drag!.over).toEqual({ col: 3, row: 2 })
  })

  it('a pause on the way up never aims the final placement against a stale anchor', async () => {
    // The bug this pins: the finger rested on the bottom row for a moment
    // (aim engaged there), carried on to the tile it meant, swiped up — and the
    // facing was computed from the OLD anchor, two tiles behind the finger.
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(127, 297, { col: 1, row: 3 })
    advance(battle, AIM_LAND_MS + 10)
    expect(battle.view.drag!.aiming).toBe(true)
    expect(battle.view.drag!.anchor).toEqual({ x: 127, y: 297 })
    // On to the tile under the skeleton, a full tile further up.
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    expect(battle.view.drag!.aiming).toBe(false)
    expect(battle.view.drag!.over).toEqual({ col: 1, row: 2 })
    // Stays again: a FRESH anchor, where the finger actually is.
    advance(battle, AIM_LAND_MS + 10)
    expect(battle.view.drag!.aiming).toBe(true)
    expect(battle.view.drag!.anchor).toEqual({ x: 127, y: 212 })
    // A flick to the left is measured from THERE.
    battle.updateDrag(112, 212, { col: 1, row: 2 })
    expect(battle.view.drag!.dir).toBe('left')
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('without the layout, the un-land distance is measured from the landing point', async () => {
    const { battle, mod } = await load()
    mod.setDragMetrics({ swipeThresholdPx: 26, tilePx: 86, tileCenter: null })
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    battle.updateDrag(100, 390, { col: 1, row: 1 })
    expect(battle.view.drag!.aiming).toBe(true)
    battle.updateDrag(300, 440, { col: 3, row: 2 })
    expect(battle.view.drag!.aiming).toBe(false)
    expect(battle.view.drag!.over).toEqual({ col: 3, row: 2 })
  })

  it('only accepts a facing the rune can take', async () => {
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.setAim('ul')
    expect(battle.view.drag!.dir).toBe('up')
    battle.setAim('left')
    expect(battle.view.drag!.dir).toBe('left')
  })

  it('reports the tile it cannot go to', async () => {
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    // The skeleton's tile, left of the ghost's.
    battle.updateDrag(40, 380, { col: 0, row: 2 })
    expect(battle.view.drag!.kind).toBe('invalid')
    battle.updateDrag(100, 200, null)
    expect(battle.view.drag!.over).toBeNull()
    expect(battle.view.drag!.kind).toBeNull()
  })

  it('a release with nothing under it puts the pebble back', async () => {
    const { battle, events } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 590, null)
    battle.endDrag(true)
    expect(battle.view.drag).toBeNull()
    expect(battle.hasPlaced.value).toBe(false)
    expect(battle.phase.value).toBe('planning')
    expect(events).not.toContain('placed')
  })

  it('a release on a tile before landing faces what is in reach, not a fixed default', async () => {
    // 1-1's skeleton stands at (0,2), immediately LEFT of the tile the pebble
    // is dropped on. An unaimed drop used to take `defaultDir` ('up', into
    // empty board) or — worse, once a tile had been crossed — the edge the
    // pebble came in through. It now points at the thing it can hit.
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 1, row: 2 })
    battle.endDrag(true)
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('an unaimed drop with nothing in reach still takes the default facing', async () => {
    // Same lesson, a tile the skeleton is nowhere near: no enemy in any of the
    // sword's four facings, so the answer is the one it always was.
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 3, row: 3 })
    battle.endDrag(true)
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.view.playerMove).toMatchObject({ col: 3, row: 3, dir: 'up' })
  })

  it('a fast flick through a tile and off the board commits to that tile, aimed by the flick', async () => {
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 1, row: 2 })
    battle.updateDrag(100, 300, null)
    battle.endDrag(true)
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.view.playerMove).toMatchObject({ type: 'melee', col: 1, row: 2, dir: 'up' })
  })

  it('locks the placement and opens an ordinary correction window — on 1-1 too, the lesson ended at the drop', async () => {
    const { battle, events, state } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    // Locked: the pebble is on its tile facing forward, the window is open, the reveal waits.
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.lockOpen.value).toBe(true)
    expect(battle.phase.value).toBe('planning')
    expect(battle.view.lock).toEqual({
      cell: { col: 1, row: 2 }, type: 'melee', dir: 'up', leftMs: LOCK_WINDOW_MS, totalMs: LOCK_WINDOW_MS, source: 'drag', held: false
    })
    expect(battle.view.playerMove).toMatchObject({ side: 'player', type: 'melee', col: 1, row: 2, dir: 'up' })
    expect(battle.view.hand).toHaveLength(2)
    expect(battle.activeRune.value).toBeNull()
    expect(events[events.length - 1]).toBe('placed')
    // The ghost hand goes with the drop — nothing is demonstrated on a placed stone.
    expect(battle.ghostActive.value).toBe(false)
    expect(battle.view.ghost).toBeNull()
    // No second drag, no reroll, no selection this turn.
    expect(battle.beginDrag(0, 100, 600)).toBe(false)
    expect(battle.selectHand(0)).toBe(false)
    // The window is a correction, not a lesson: it drains on its own, and a
    // correction inside it turns the rune.
    advance(battle, 300)
    expect(battle.view.lock!.leftMs).toBeLessThan(LOCK_WINDOW_MS)
    expect(battle.aimKey('left')).toBe(true)
    expect(battle.view.lock).toMatchObject({ dir: 'left', held: false })
    // The correction did not buy any more time — the ring runs out where it was.
    advance(battle, battle.view.lock!.leftMs + 20)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.view.lock).toBeNull()
    expect(battle.view.reveal?.player).toMatchObject({ side: 'player', type: 'melee', col: 1, row: 2, dir: 'left' })
    expect(events.slice(-2)).toEqual(['placed', 'reveal'])
    // The first placement ever is remembered — the ghost never comes back.
    expect(state.getState('gx_tutorial_seen')).toBe(true)
    // …and the correction was a real aim.
    expect(state.getState('gx_aimed', false)).toBe(true)
  })

  it('a lesson whose ghost carries a re-aim HOLDS the window until the player performs it', async () => {
    const { battle, events, state } = await load({}, REAIM_LESSON)
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    // Locked: the pebble is on its tile facing forward, the window is open, the reveal waits.
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.lockOpen.value).toBe(true)
    expect(battle.phase.value).toBe('planning')
    expect(battle.view.lock).toEqual({
      cell: { col: 1, row: 2 }, type: 'melee', dir: 'up', leftMs: LOCK_WINDOW_MS, totalMs: LOCK_WINDOW_MS, source: 'drag', held: true
    })
    expect(battle.view.playerMove).toMatchObject({ side: 'player', type: 'melee', col: 1, row: 2, dir: 'up' })
    expect(battle.view.hand).toHaveLength(2)
    expect(battle.activeRune.value).toBeNull()
    expect(events[events.length - 1]).toBe('placed')
    // The lesson: the ghost finger now works on the placed stone, pressing it and flicking left.
    expect(battle.ghostActive.value).toBe(true)
    expect(battle.view.ghost).toEqual({ handIndex: -1, to: { col: 1, row: 2 }, dir: 'left', mode: 'reaim', reaim: 'left' })
    // No second drag, no reroll, no selection this turn.
    expect(battle.beginDrag(0, 100, 600)).toBe(false)
    expect(battle.selectHand(0)).toBe(false)
    // Held: three seconds pass and the ring has not drained a millisecond.
    advance(battle, 3000)
    expect(battle.phase.value).toBe('planning')
    expect(battle.view.lock!.leftMs).toBe(LOCK_WINDOW_MS)
    expect(battle.view.lock!.held).toBe(true)
    // A wrong correction keeps it held…
    expect(battle.aimKey('right')).toBe(true)
    expect(battle.view.lock).toMatchObject({ dir: 'right', held: true })
    advance(battle, 500)
    expect(battle.phase.value).toBe('planning')
    // …the right one releases it: the finger goes, the window drains out quickly.
    expect(battle.aimKey('left')).toBe(true)
    expect(battle.view.lock).toMatchObject({ dir: 'left', held: false })
    expect(battle.view.lock!.leftMs).toBeLessThanOrEqual(400)
    expect(battle.ghostActive.value).toBe(false)
    expect(battle.view.ghost).toBeNull()
    advance(battle, 450)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.view.lock).toBeNull()
    expect(battle.view.reveal?.player).toMatchObject({ side: 'player', type: 'melee', col: 1, row: 2, dir: 'left' })
    expect(events.slice(-2)).toEqual(['placed', 'reveal'])
    // The first placement ever is remembered — the ghost never comes back.
    expect(state.getState('gx_tutorial_seen')).toBe(true)
    // …and the correction was a real aim.
    expect(state.getState('gx_aimed', false)).toBe(true)
  })

  it('the held window gives up after LESSON_REAIM_HOLD_MS and the rune goes as it faces', async () => {
    const { battle } = await load({}, REAIM_LESSON)
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    expect(battle.view.lock!.held).toBe(true)
    advance(battle, LESSON_REAIM_HOLD_MS - 100)
    expect(battle.phase.value).toBe('planning')
    advance(battle, 200)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.reveal?.player).toMatchObject({ dir: 'up' })
    expect(battle.view.ghost).toBeNull()
  })

  it('a placement already facing the way the ghost shows is the lesson learned: no hold', async () => {
    const { battle, mod } = await load({}, REAIM_LESSON)
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    // Slid to the tile's left region while still holding.
    battle.updateDrag(95, 212, { col: 1, row: 2 })
    expect(battle.view.drag!.dir).toBe('left')
    battle.endDrag(true)
    expect(battle.view.lock).toMatchObject({ dir: 'left', held: false, leftMs: LOCK_WINDOW_MS })
    expect(battle.view.ghost).toBeNull()
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.phase.value).toBe('reveal')
  })

  it('an external pause freezes a held window\'s patience too', async () => {
    const { battle } = await load({}, REAIM_LESSON)
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    battle.setPaused(true)
    advance(battle, LESSON_REAIM_HOLD_MS + 500)
    expect(battle.phase.value).toBe('planning')
    expect(battle.view.lock!.held).toBe(true)
    battle.setPaused(false)
    advance(battle, LESSON_REAIM_HOLD_MS + 100)
    expect(battle.phase.value).toBe('reveal')
  })

  it('only the first placement of a lesson is held', async () => {
    const { battle } = await load({}, REAIM_LESSON)
    battle.startNode(1)
    // Turn 1: the sword faces up at nothing; the hold expires and the turn resolves.
    placeAt(battle, 0, { col: 1, row: 2 })
    advance(battle, LESSON_REAIM_HOLD_MS + 100)
    advance(battle, REVEAL_MS + (RESOLVE_MS + BETWEEN_TURNS_MS) * LESSON_RESOLVE_SCALE + 100)
    expect(battle.turn.value).toBe(2)
    expect(battle.matchActive.value).toBe(true)
    // Turn 2: a placement gets an ordinary window.
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(200, 420, { col: 2, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    expect(battle.view.lock).toMatchObject({ held: false, leftMs: LOCK_WINDOW_MS })
    expect(battle.view.ghost).toBeNull()
  })

  it('remembers a real swipe', async () => {
    const { battle, state } = await load(normalBlob())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.setAim('left')
    battle.endDrag(true)
    expect(state.getState('gx_aimed')).toBe(true)
  })
})

describe('the correction window', () => {
  const lockOne = async () => {
    const ctx = await load(normalBlob())
    ctx.mod.setDragMetrics(tileMetrics())
    ctx.battle.startNode(NORMAL)
    ctx.battle.beginDrag(0, 100, 600)
    ctx.battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(ctx.battle, AIM_LAND_MS + 10)
    ctx.battle.endDrag(true)
    expect(ctx.battle.lockOpen.value).toBe(true)
    expect(ctx.battle.view.lock).toMatchObject({ cell: { col: 1, row: 2 }, type: 'melee', dir: 'up' })
    return ctx
  }

  it('a press anywhere starts a correction stroke; a flick re-aims the locked move', async () => {
    const { battle, mod, state } = await lockOne()
    // Nowhere near the tile: the bottom-right corner of the hand.
    expect(battle.beginCorrection(300, 640)).toBe(true)
    const drag = battle.view.drag!
    expect(drag).toMatchObject({ mode: 'correct', handIndex: -1, type: 'melee', over: { col: 1, row: 2 }, aiming: true, dir: 'up' })
    expect(drag.anchor).toEqual({ x: 300, y: 640 })
    expect(battle.isDragging.value).toBe(true)
    battle.updateDrag(292, 640, null)
    expect(battle.view.lock!.dir).toBe('up')
    battle.updateDrag(286, 640, null)
    expect(battle.view.lock!.dir).toBe('left')
    expect(battle.view.playerMove!.dir).toBe('left')
    expect(mod.__matchState()!.playerMove!.dir).toBe('left')
    expect(state.getState('gx_aimed')).toBe(true)
    // Flick back down: 'down'.
    battle.updateDrag(286, 655, null)
    expect(battle.view.lock!.dir).toBe('down')
    battle.endDrag(true)
    expect(battle.view.drag).toBeNull()
    // The window is still draining, and closes on what the rune faces now.
    expect(battle.lockOpen.value).toBe(true)
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.reveal?.player).toMatchObject({ col: 1, row: 2, dir: 'down' })
  })

  it('setAim works the same way during a correction', async () => {
    const { battle } = await lockOne()
    battle.beginCorrection(50, 50)
    battle.setAim('right')
    expect(battle.view.lock!.dir).toBe('right')
    // A facing the rune cannot take is ignored.
    battle.setAim('ur')
    expect(battle.view.lock!.dir).toBe('right')
    battle.endDrag(false)
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.view.reveal?.player).toMatchObject({ dir: 'right' })
  })

  it('a stroke still under the finger when the window empties gets a short grace, then the reveal', async () => {
    const { battle } = await lockOne()
    advance(battle, LOCK_WINDOW_MS - 100)
    expect(battle.beginCorrection(200, 300)).toBe(true)
    advance(battle, 200)
    // Past the window, finger still down: waiting.
    expect(battle.phase.value).toBe('planning')
    expect(battle.lockOpen.value).toBe(true)
    battle.updateDrag(214, 300, null)
    expect(battle.view.lock!.dir).toBe('right')
    battle.endDrag(true)
    // The release is what the reveal was waiting for.
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.reveal?.player).toMatchObject({ dir: 'right' })
  })

  it('…but not forever: half a second of hesitation and the rune goes as it faces', async () => {
    const { battle } = await lockOne()
    advance(battle, LOCK_WINDOW_MS - 50)
    battle.beginCorrection(200, 300)
    advance(battle, 50 + 500 + 20)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.drag).toBeNull()
    expect(battle.view.reveal?.player).toMatchObject({ dir: 'up' })
  })

  it('the window is closed to a press once the reveal has begun', async () => {
    const { battle } = await lockOne()
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.beginCorrection(200, 300)).toBe(false)
    expect(battle.view.drag).toBeNull()
  })

  it('a shield has no facing to correct: no window, straight to the reveal', async () => {
    // 1-5 is the shield lesson: its hand is guaranteed to hold a defense rune.
    const { battle } = await load({ gx_best_node: 4, gx_node: 5, gx_tutorial_seen: true })
    battle.startNode(5)
    const slot = battle.view.hand.indexOf('defense')
    expect(slot).toBeGreaterThanOrEqual(0)
    battle.beginDrag(slot, 100, 600)
    expect(battle.view.drag!.type).toBe('defense')
    battle.updateDrag(100, 440, { col: 0, row: 2 })
    expect(battle.view.drag!.kind).toBe('empty')
    advance(battle, AIM_LAND_MS + 10)
    // Strokes do nothing to an omni rune.
    battle.updateDrag(80, 440, { col: 0, row: 2 })
    expect(battle.view.drag!.dir).toBe('omni')
    battle.endDrag(true)
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.view.lock).toBeNull()
    expect(battle.phase.value).toBe('reveal')
    expect(battle.beginCorrection(100, 100)).toBe(false)
  })

  it('a pass has nothing to correct', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    advance(battle, PLANNING_MS + 20)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.lockOpen.value).toBe(false)
  })

  it('an external pause freezes the window', async () => {
    const { battle } = await lockOne()
    battle.setPaused(true)
    advance(battle, LOCK_WINDOW_MS * 2)
    expect(battle.phase.value).toBe('planning')
    expect(battle.view.lock!.leftMs).toBe(LOCK_WINDOW_MS)
    battle.setPaused(false)
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.phase.value).toBe('reveal')
  })

  it('a reset wipes the window', async () => {
    const { battle } = await lockOne()
    battle.retryNode()
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.view.lock).toBeNull()
    advance(battle, RESET_MS + 20)
    expect(battle.turn.value).toBe(1)
    expect(battle.hasPlaced.value).toBe(false)
  })
})

describe('the turn clock', () => {
  it('runs through reveal and resolution and wins 1-1 in one turn', async () => {
    const { battle, events, campaign, economy, streak, reportMatch, state, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    // The lesson's own gesture: the sword is carried onto (1,2) and released on
    // the LEFT side of it, so it lands already facing the skeleton on (0,2).
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    battle.updateDrag(95, 212, { col: 1, row: 2 })
    expect(battle.view.drag!.dir).toBe('left')
    battle.endDrag(true)
    expect(battle.view.lock).toMatchObject({ dir: 'left', held: false })
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.phase.value).toBe('reveal')

    advance(battle, REVEAL_MS + 20)
    expect(battle.phase.value).toBe('resolve')
    const tl = battle.view.timeline!
    expect(tl).not.toBeNull()
    const kinds = tl.events.map((e) => e.kind)
    expect(kinds).toContain('place')
    expect(kinds).toContain('shot')
    expect(kinds).toContain('shatter')
    expect(events).toContain('resolveStart')

    // A LESSON's resolution plays at `LESSON_RESOLVE_SCALE` of speed — the
    // whole turn is otherwise over in 1.2 s, which is not enough for a player
    // who has never seen a sword swing or an arrow fly.
    advance(battle, (RESOLVE_MS + BETWEEN_TURNS_MS) * LESSON_RESOLVE_SCALE + 20)
    expect(battle.phase.value).toBe('ended')
    expect(battle.matchActive.value).toBe(false)
    expect(battle.result.value?.won).toBe(true)
    expect(battle.result.value?.reason).toBe('eliminated')
    expect(events.slice(-2)).toEqual(['resolveEnd', 'matchEnd'])

    const summary = battle.lastSummary.value!
    expect(summary.node.id).toBe(1)
    expect(summary.chest).toEqual({ coins: 15, unlockRune: 'archer', unlockSkin: null, big: false })
    expect(summary.isRecord).toBe(true)
    expect(summary.streakMultiplier).toBe(1)
    // 20 base + 5 tiles × 2 + 1 kill × 1, at ×1.
    expect(summary.coins).toBe(31)
    expect(economy.coins.value).toBe(31 + 15)
    expect(streak.streak.value).toBe(1)
    expect(campaign.bestNode.value).toBe(1)
    expect(campaign.currentNode.value).toBe(2)
    expect(campaign.unlockedRunes.value).toContain('archer')
    expect(reportMatch).toHaveBeenCalledWith(1, 1, { force: true })
    // A win leaves nothing for the relief to work from.
    expect(state.getState('gx_loss_streak', 0)).toBe(0)
    expect(state.getState('gx_failed_nodes', {})).toEqual({})
  })

  it('passes the turn when the planning window runs out', async () => {
    const { battle, events } = await load(normalBlob())
    battle.startNode(NORMAL)
    expect(battle.timerPaused.value).toBe(false)
    advance(battle, PLANNING_MS + 20)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.reveal?.player).toBeNull()
    expect(events).not.toContain('placed')
    advance(battle, REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 40)
    expect(battle.phase.value).toBe('planning')
    expect(battle.turn.value).toBe(2)
    expect(battle.hasPlaced.value).toBe(false)
    // The advance overshoots the transition by a frame or two.
    expect(battle.view.timer.leftMs).toBeGreaterThan(PLANNING_MS - 100)
    expect(battle.view.hand).toHaveLength(3)
  })

  it('freezes every clock while paused', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    battle.setPaused(true)
    expect(battle.timerPaused.value).toBe(true)
    advance(battle, PLANNING_MS * 2)
    expect(battle.phase.value).toBe('planning')
    expect(battle.view.timer.leftMs).toBe(PLANNING_MS)
    battle.setPaused(false)
    expect(battle.timerPaused.value).toBe(false)
    advance(battle, 500)
    expect(battle.view.timer.leftMs).toBeLessThan(PLANNING_MS)
  })

  it('publishes the DOM timer at ten hertz, not sixty', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    let now = Date.now()
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    battle.tick(now, 16)
    const first = battle.timerLeftMs.value
    now += 16
    battle.tick(now, 16)
    expect(battle.timerLeftMs.value).toBe(first)
    now += 200
    battle.tick(now, 16)
    expect(battle.timerLeftMs.value).toBeLessThan(first)
  })
})

describe('the adaptive relief', () => {
  it('asks the rule at every planning start, with the passes it has seen', async () => {
    const { battle, computeHandicap, mod } = await load(normalBlob({ gx_failed_nodes: { [String(NORMAL)]: 2 }, gx_loss_streak: 1 }))
    battle.startNode(NORMAL)
    expect(computeHandicap).toHaveBeenCalledTimes(1)
    expect(computeHandicap.mock.calls[0]![0]).toMatchObject({
      difficulty: 'medium', nodeFails: 2, lossStreak: 1, playerPassedLastTurn: false, passesThisMatch: 0,
      turn: 1, suddenDeath: false, tutorial: false
    })
    expect(mod.__relief()).toEqual({ playerPassedLastTurn: false, passesThisMatch: 0 })
    // Let the clock run out: a pass.
    advance(battle, PLANNING_MS + REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 60)
    expect(battle.turn.value).toBe(2)
    expect(computeHandicap).toHaveBeenCalledTimes(2)
    expect(computeHandicap.mock.calls[1]![0]).toMatchObject({ playerPassedLastTurn: true, passesThisMatch: 1, turn: 2 })
    // Place this turn: the next input says so.
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    battle.endDrag(true)
    advance(battle, LOCK_WINDOW_MS + REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 80)
    expect(battle.turn.value).toBe(3)
    expect(computeHandicap.mock.calls[2]![0]).toMatchObject({ playerPassedLastTurn: false, passesThisMatch: 1, turn: 3 })
  })

  it('the rule\'s answer reaches the match and the clock', async () => {
    const { battle, mod } = await load(normalBlob(), {
      handicap: (i) => i.playerPassedLastTurn
        ? { skipChance: 1, extraRandom: 0.2, atkMul: 0.8, timerMs: 7000 }
        : { ...NO_HANDICAP }
    })
    battle.startNode(NORMAL)
    expect(battle.view.timer.totalMs).toBe(PLANNING_MS)
    expect(mod.__matchState()!.handicap).toEqual(NO_HANDICAP)
    advance(battle, PLANNING_MS + REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 60)
    expect(battle.turn.value).toBe(2)
    // The enemy mirrors the pass: it planned nothing this turn.
    const s = mod.__matchState()!
    expect(s.handicap).toEqual({ skipChance: 1, extraRandom: 0.2, atkMul: 0.8, timerMs: 7000 })
    expect(s.enemyMoves).toEqual([])
    expect(battle.view.timer.totalMs).toBe(7000)
    expect(battle.view.timer.leftMs).toBeGreaterThan(7000 - 100)
    expect(battle.timerLeftMs.value).toBeGreaterThan(7000 - 100)
  })

  it('the clock never stretches past the rules\' ceiling', async () => {
    const { battle } = await load(normalBlob(), {
      handicap: () => ({ skipChance: 0, extraRandom: 0, atkMul: 1, timerMs: 60_000 })
    })
    battle.startNode(NORMAL)
    expect(battle.view.timer.totalMs).toBe(9000)
  })

  it('a tutorial node is never relieved and never counts a pass', async () => {
    const { battle, computeHandicap } = await load()
    battle.startNode(1)
    expect(computeHandicap.mock.calls[0]![0]).toMatchObject({ tutorial: true })
    // No clock on a lesson: nothing to run out.
    advance(battle, PLANNING_MS * 3)
    expect(battle.phase.value).toBe('planning')
    expect(battle.turn.value).toBe(1)
  })
})

describe('rerolling', () => {
  it('redraws the hand and spends a reroll', async () => {
    const { battle } = await load(normalBlob({ gx_unlocked_runes: ['melee', 'archer', 'mage'] }))
    battle.startNode(NORMAL)
    battle.reroll()
    expect(battle.rerollsLeft.value).toBe(1)
    expect(battle.view.hand).toHaveLength(3)
    battle.reroll()
    expect(battle.rerollsLeft.value).toBe(0)
    battle.reroll()
    expect(battle.rerollsLeft.value).toBe(0)
  })

  it('is refused once the move is locked', async () => {
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    expect(battle.lockOpen.value).toBe(true)
    battle.reroll()
    expect(battle.rerollsLeft.value).toBe(2)
  })
})

describe('play again and next', () => {
  it('retry wipes for RESET_MS and restarts the same node', async () => {
    const { battle, events } = await load(normalBlob())
    battle.startNode(NORMAL)
    advance(battle, 300)
    battle.retryNode()
    expect(battle.view.resetting).toBe(true)
    expect(events[events.length - 1]).toBe('reset')
    advance(battle, RESET_MS + 20)
    expect(battle.view.resetting).toBe(false)
    expect(battle.node.value?.id).toBe(NORMAL)
    expect(battle.turn.value).toBe(1)
    // A fresh clock — the advance overshoots the wipe by a frame.
    expect(battle.view.timer.leftMs).toBeGreaterThan(PLANNING_MS - 100)
    expect(events.slice(-2)).toEqual(['matchStart', 'turnStart'])
  })

  it('next moves on to the following node after a win', async () => {
    const { battle, mod } = await load()
    battle.startNode(1)
    mod.__winMatchNow()
    expect(battle.result.value?.won).toBe(true)
    battle.nextNode()
    advance(battle, RESET_MS + 20)
    expect(battle.node.value?.id).toBe(2)
    expect(battle.matchActive.value).toBe(true)
  })

  it('a loss zeroes the streak, pays the consolation and is remembered for the relief', async () => {
    const { battle, streak, economy, campaign, state } = await load(normalBlob({ gx_streak: 2 }))
    battle.startNode(NORMAL)
    // Pass every turn; the goblins take the board.
    for (let turn = 0; turn < 12 && battle.matchActive.value; turn++) {
      advance(battle, PLANNING_MS + REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 100)
    }
    expect(battle.matchActive.value).toBe(false)
    const r = battle.result.value!
    expect(r.won).toBe(false)
    expect(streak.streak.value).toBe(0)
    expect(economy.coins.value).toBe(5)
    expect(campaign.matchesPlayed.value).toBe(1)
    expect(campaign.currentNode.value).toBe(NORMAL)
    expect(state.getState('gx_loss_streak')).toBe(1)
    expect(state.getState('gx_failed_nodes')).toEqual({ [String(NORMAL)]: 1 })
  })
})

describe('tap-to-place', () => {
  it('selects a hand slot, toggles it off again, and refuses what is not there', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    expect(battle.selectHand(-1)).toBe(false)
    expect(battle.selectHand(9)).toBe(false)
    expect(battle.selectHand(1)).toBe(true)
    expect(battle.view.selected).toBe(1)
    expect(battle.selectedHand.value).toBe(1)
    expect(battle.activeRune.value).toBe(battle.view.hand[1])
    // Another slot moves the selection; the same slot lets it go.
    expect(battle.selectHand(0)).toBe(true)
    expect(battle.view.selected).toBe(0)
    expect(battle.selectHand(0)).toBe(true)
    expect(battle.view.selected).toBe(-1)
    expect(battle.selectedHand.value).toBe(-1)
    expect(battle.activeRune.value).toBeNull()
    expect(battle.selectHand(1)).toBe(true)
    expect(battle.selectHand(-1)).toBe(true)
    expect(battle.view.selected).toBe(-1)
  })

  it('places the selected pebble on a tapped tile, facing forward, with the longer window', async () => {
    const { battle, events, mod } = await load(normalBlob())
    battle.startNode(NORMAL)
    const type = battle.view.hand[0]!
    expect(battle.placeSelected({ col: 1, row: 2 })).toBe(false)
    expect(battle.selectHand(0)).toBe(true)
    expect(battle.placeSelected({ col: 1, row: 2 })).toBe(true)
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.view.selected).toBe(-1)
    expect(battle.activeRune.value).toBeNull()
    expect(battle.view.playerMove).toMatchObject({ type, col: 1, row: 2 })
    expect(mod.__matchState()!.playerMove).toMatchObject({ type, col: 1, row: 2 })
    expect(events[events.length - 1]).toBe('placed')
    if (type === 'defense' || type === 'support') {
      expect(battle.phase.value).toBe('reveal')
    } else {
      expect(battle.view.lock).toMatchObject({ cell: { col: 1, row: 2 }, type, source: 'tap', held: false, leftMs: LOCK_WINDOW_TAP_MS, totalMs: LOCK_WINDOW_TAP_MS })
      advance(battle, LOCK_WINDOW_TAP_MS - 50)
      expect(battle.phase.value).toBe('planning')
      advance(battle, 100)
      expect(battle.phase.value).toBe('reveal')
    }
  })

  it('a key pressed while selected is the facing the tap places with', async () => {
    const { battle } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    battle.startNode(NORMAL)
    expect(battle.selectHand(0)).toBe(true)
    expect(battle.aimKey('left')).toBe(true)
    expect(battle.aimKey('ul')).toBe(false)
    expect(battle.placeSelected({ col: 1, row: 2 })).toBe(true)
    expect(battle.view.playerMove).toMatchObject({ type: 'melee', col: 1, row: 2, dir: 'left' })
    expect(battle.view.lock).toMatchObject({ dir: 'left', source: 'tap' })
  })

  it('refuses a tile the rules refuse, and keeps the selection', async () => {
    const { battle } = await load()
    battle.startNode(1)
    expect(battle.selectHand(0)).toBe(true)
    // The skeleton's tile.
    expect(battle.placeSelected({ col: 0, row: 2 })).toBe(false)
    expect(battle.view.selected).toBe(0)
    expect(battle.hasPlaced.value).toBe(false)
  })

  it('a drag, a reroll and a new turn let the selection go; a lock and a placement refuse one', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    expect(battle.selectHand(1)).toBe(true)
    expect(battle.beginDrag(0, 100, 600)).toBe(true)
    expect(battle.view.selected).toBe(-1)
    expect(battle.activeRune.value).toBe(battle.view.hand[0])
    expect(battle.selectHand(1)).toBe(false)
    battle.endDrag(false)
    expect(battle.activeRune.value).toBeNull()
    expect(battle.selectHand(1)).toBe(true)
    battle.reroll()
    expect(battle.view.selected).toBe(-1)
    expect(battle.selectHand(1)).toBe(true)
    placeAt(battle, 0, { col: 1, row: 2 })
    expect(battle.view.selected).toBe(-1)
    expect(battle.selectHand(0)).toBe(false)
    advance(battle, REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 100)
    if (battle.matchActive.value) {
      expect(battle.turn.value).toBe(2)
      expect(battle.view.selected).toBe(-1)
      expect(battle.selectHand(0)).toBe(true)
    }
  })
})

describe('aiming by key', () => {
  it('before the pebble lands, a key is the facing it lands with — and un-landing keeps it', async () => {
    const { battle, mod } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    expect(battle.aimKey('right')).toBe(true)
    expect(battle.view.drag!.dir).toBe('right')
    expect(battle.view.drag!.aiming).toBe(false)
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(battle.view.drag!.aiming).toBe(true)
    expect(battle.view.drag!.dir).toBe('right')
    // Carried on to another tile: still right, not back to the default.
    battle.updateDrag(297, 212, { col: 3, row: 2 })
    expect(battle.view.drag!.aiming).toBe(false)
    expect(battle.view.drag!.dir).toBe('right')
    advance(battle, AIM_LAND_MS + 10)
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 3, row: 2, dir: 'right' })
  })

  it('over a tile that will take it, a key lands the pebble at once', async () => {
    const { battle, mod } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    expect(battle.view.drag!.aiming).toBe(false)
    expect(battle.aimKey('down')).toBe(true)
    expect(battle.view.drag!.aiming).toBe(true)
    expect(battle.isAiming.value).toBe(true)
    expect(battle.view.drag!.dir).toBe('down')
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'down' })
  })

  it('a release before landing carries the key facing, not the default', async () => {
    const { battle } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    expect(battle.aimKey('left')).toBe(true)
    // Over the hand there is nothing to land on; the key waits.
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    // …released the instant it arrives, before AIM_LAND_MS.
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('moving into a region after a key wins, as the later aim always does', async () => {
    // A key pre-aims; sliding into a region afterwards is a deliberate second
    // answer and takes precedence, exactly as a stroke used to. (Stopping in
    // the dead zone does NOT — that case is pinned separately.)
    const { battle, mod } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    battle.aimKey('right')
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    // The centre chose nothing, so the key still stands…
    expect(battle.view.drag!.dir).toBe('right')
    // …until the pointer moves into the top region.
    battle.updateDrag(127, 180, { col: 1, row: 2 })
    expect(battle.view.drag!.dir).toBe('up')
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ dir: 'up' })
  })

  it('only a facing the rune can take; nothing to aim is false', async () => {
    const { battle } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    battle.startNode(NORMAL)
    expect(battle.aimKey('left')).toBe(false)
    battle.beginDrag(0, 100, 600)
    expect(battle.aimKey('ur')).toBe(false)
    expect(battle.aimKey('omni')).toBe(false)
    expect(battle.view.drag!.dir).toBe('up')
    battle.endDrag(false)
    expect(battle.aimKey('left')).toBe(false)
  })

  it('inside the correction window a key re-aims the locked move without a stroke', async () => {
    const { battle, mod, state } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    expect(battle.view.lock).toMatchObject({ dir: 'up', source: 'drag' })
    expect(battle.aimKey('left')).toBe(true)
    expect(battle.view.lock!.dir).toBe('left')
    expect(battle.view.playerMove!.dir).toBe('left')
    expect(mod.__matchState()!.playerMove!.dir).toBe('left')
    expect(state.getState('gx_aimed')).toBe(true)
    // The same facing again is fine; the window keeps draining.
    expect(battle.aimKey('left')).toBe(true)
    advance(battle, LOCK_WINDOW_MS - 200)
    expect(battle.aimKey('down')).toBe(true)
    advance(battle, 250)
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.reveal?.player).toMatchObject({ dir: 'down' })
    // Closed: nothing to aim any more.
    expect(battle.aimKey('right')).toBe(false)
  })

  it('a key during a correction stroke turns the rune and the stroke\'s facing alike', async () => {
    const { battle } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(120, 420, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 40)
    battle.endDrag(true)
    expect(battle.beginCorrection(300, 640)).toBe(true)
    expect(battle.aimKey('right')).toBe(true)
    expect(battle.view.drag!.dir).toBe('right')
    expect(battle.view.lock!.dir).toBe('right')
    battle.endDrag(true)
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.view.reveal?.player).toMatchObject({ dir: 'right' })
  })
})

describe('bookkeeping', () => {
  it('every placement counts a use of the rune, dragged or tapped', async () => {
    const { battle, state } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    battle.startNode(NORMAL)
    placeAt(battle, 0, { col: 1, row: 2 })
    expect(state.getState('gx_rune_uses')).toEqual({ melee: 1 })
    advance(battle, REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 100)
    if (!battle.matchActive.value) return
    expect(battle.selectHand(0)).toBe(true)
    expect(battle.placeSelected({ col: 2, row: 2 })).toBe(true)
    expect(state.getState('gx_rune_uses')).toEqual({ melee: 2 })
  })

  it('a power rune in stock arms the match and is spent by the placement that uses it', async () => {
    const { battle, mod, state } = await load(normalBlob({ gx_unlocked_runes: ['melee'], gx_power_runes: { melee: 1 } }))
    battle.startNode(NORMAL)
    expect(mod.__matchState()!.boons).toEqual({ melee: 3 })
    placeAt(battle, 0, { col: 1, row: 2 })
    expect(mod.__matchState()!.boons).toEqual({})
    expect(state.getState('gx_power_runes', {})).toEqual({})
  })

  it('activeRune follows the drag and the selection', async () => {
    const { battle } = await load(normalBlob())
    battle.startNode(NORMAL)
    expect(battle.activeRune.value).toBeNull()
    battle.beginDrag(2, 100, 600)
    expect(battle.activeRune.value).toBe(battle.view.hand[2])
    battle.endDrag(false)
    expect(battle.activeRune.value).toBeNull()
    battle.selectHand(1)
    expect(battle.activeRune.value).toBe(battle.view.hand[1])
    battle.selectHand(-1)
    expect(battle.activeRune.value).toBeNull()
  })
})

/**
 * ─── Aiming by position: the tile's own compass ─────────────────────────────
 *
 * A precise pointer (a mouse) aims by WHERE it stands inside the tile, and an
 * aimed precise placement needs no correction window afterwards — the player
 * saw the facing lit under the cursor before they clicked. A finger keeps the
 * old stroke gesture and the old window, because it covers the very regions it
 * would be choosing between.
 *
 * Cell (1,2) with TILE = 85 spans x 85..170, y 170..255, centred (127.5, 212.5).
 */
describe('aiming by position', () => {
  /** A precise drag of the sword, ready to be moved over cell (1,2). */
  const swordDrag = async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    const slot = battle.view.hand.indexOf('melee')
    expect(slot).toBeGreaterThanOrEqual(0)
    battle.beginDrag(slot, 100, 600, true)
    return { battle, drag: battle.view.drag as NonNullable<typeof battle.view.drag> }
  }

  it('reads each of the four triangles of a cardinal rune', async () => {
    const { battle, drag } = await swordDrag()
    for (const [x, y, dir] of [
      [127.5, 180, 'up'], [163, 212.5, 'right'], [127.5, 245, 'down'], [92, 212.5, 'left']
    ] as const) {
      battle.updateDrag(x, y, { col: 1, row: 2 })
      expect(drag.region, `${x},${y}`).toBe(dir)
      expect(drag.dir, `${x},${y}`).toBe(dir)
    }
  })

  it('reads the four quadrants of a diagonal rune, and differs from a sword on the SAME point', async () => {
    const { battle, mod } = await load({ gx_best_node: 3, gx_node: 4, gx_tutorial_seen: true })
    mod.setDragMetrics(tileMetrics())
    battle.startNode(4)
    const slot = battle.view.hand.indexOf('mage')
    battle.beginDrag(slot, 100, 600, true)
    const drag = battle.view.drag as NonNullable<typeof battle.view.drag>
    for (const [x, y, dir] of [
      [110, 195, 'ul'], [145, 195, 'ur'], [145, 230, 'dr'], [110, 230, 'dl']
    ] as const) {
      battle.updateDrag(x, y, { col: 1, row: 2 })
      expect(drag.region, `${x},${y}`).toBe(dir)
    }
    // The orb's tile is cut on the midlines, the sword's on the diagonals, so
    // one point in the upper-left names two different facings.
    battle.updateDrag(100, 195, { col: 1, row: 2 })
    expect(drag.region).toBe('ul')
    const sword = await swordDrag()
    sword.battle.updateDrag(100, 195, { col: 1, row: 2 })
    expect(sword.drag.region).toBe('left')
  })

  it('a precise aimed placement skips the correction window and goes straight to reveal', async () => {
    const { battle, drag } = await swordDrag()
    battle.updateDrag(92, 212.5, { col: 1, row: 2 })
    expect(drag.dir).toBe('left')
    battle.endDrag(true)
    // No second of nothing: the facing was visible before the click.
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.view.lock).toBeNull()
    expect(battle.phase.value).toBe('reveal')
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('the centre of a tile is NOT a choice: the facing HOLDS there', async () => {
    // The middle is simply where you click a tile, so nothing is picked there.
    // The case that decides it: a player pre-aims with a key and then clicks
    // the tile centre. If the centre counted as a choice it would silently
    // overwrite their key with the default.
    const { battle, drag } = await swordDrag()
    battle.aimKey('right')
    expect(drag.dir).toBe('right')
    battle.updateDrag(127.5, 212.5, { col: 1, row: 2 })
    expect(drag.region).toBeNull()
    expect(drag.dir).toBe('right')
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'right' })
  })

  it('…and a MOUSE gets no correction window afterwards, centre or not', async () => {
    // The compass is drawn under the cursor the whole time, so a mouse has
    // already seen the answer. The window used to survive a centre drop — the
    // most natural placement there is — which put a second back on every turn
    // for the one input that never needed it.
    for (const [x, y] of [[127.5, 212.5], [127.5, 180]] as const) {
      const { battle } = await swordDrag()
      battle.updateDrag(x, y, { col: 1, row: 2 })
      battle.endDrag(true)
      expect(battle.lockOpen.value, `released at ${x},${y}`).toBe(false)
      expect(battle.phase.value).not.toBe('planning')
    }
  })

  it('a FINGER still gets one: it covers the tile it is choosing on', async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    const slot = battle.view.hand.indexOf('melee')
    battle.beginDrag(slot, 100, 600, false)
    battle.updateDrag(127.5, 212.5, { col: 1, row: 2 })
    battle.endDrag(true)
    expect(battle.lockOpen.value).toBe(true)
  })

  it('a pebble carried up from the tray and released in the middle does NOT face back down', async () => {
    // The gesture every blind tester used on a phone (2026-09-11): pick a
    // pebble out of the tray below the board, carry it straight up onto a tile,
    // let go in the middle of it. The pebble crosses the tile's bottom region
    // on the way in, and the dead zone used to HOLD that — so the stone landed
    // facing down, into the player's own back row, and the lesson that needed
    // one move took three testers the best part of a minute.
    //
    // The dead zone still chooses nothing. What it holds, before anything has
    // been chosen, is now the useful facing for that tile.
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag as NonNullable<typeof battle.view.drag>
    // Up through the bottom edge of (1,2) …
    battle.updateDrag(127.5, 250, { col: 1, row: 2 })
    expect(drag.region).toBe('down')
    // … and to rest in the middle of it.
    battle.updateDrag(127.5, 212.5, { col: 1, row: 2 })
    expect(drag.region).toBeNull()
    expect(drag.dir).toBe('left')
    battle.endDrag(true)
    // 1-1's skeleton is at (0,2): left of the tile, and now on the receiving end.
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
    // Unaimed, so the correction window is still there to change it with.
    expect(battle.lockOpen.value).toBe(true)
  })

  it('survives the input layer handing it the SAME cell object every move', async () => {
    // `useArenaInput` owns one mutable `Cell` and rewrites it on every pointer
    // move — so a drag that stores it by reference watches its own `over`
    // follow the finger across the board. That is what happened: once the
    // pebble had landed anywhere, `updateDrag` returned early every frame,
    // the tile-change bookkeeping never ran again, and the facing stayed
    // pinned to the first tile. Every test here passed throughout, because
    // they all hand over a fresh object; a probe of the real browser is what
    // caught it. So this one lies the way the input layer does.
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    const scratch = { col: 0, row: 0 }
    const at = (x: number, y: number) => {
      if (x < 0 || x >= 320 || y < 0 || y >= 320) return null
      scratch.col = Math.floor(x / 80)
      scratch.row = Math.floor(y / 80)
      return scratch
    }
    battle.beginDrag(0, 100, 600)
    // Up the board from the tray, through (1,3), to rest in the middle of (1,2).
    for (let i = 1; i <= 30; i++) {
      const x = 100 + (120 - 100) * (i / 30)
      const y = 600 + (200 - 600) * (i / 30)
      battle.updateDrag(x, y, at(x, y))
      advance(battle, 16)
    }
    const drag = battle.view.drag as NonNullable<typeof battle.view.drag>
    // The pebble knows which tile it is actually on, not wherever the finger is.
    expect(drag.over).toEqual({ col: 1, row: 2 })
    battle.endDrag(true)
    // 1-1's skeleton is at (0,2), left of the tile it was dropped on.
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('crossing the dead zone changes nothing, then choosing again does', async () => {
    // Not a flicker: the absence of one. The facing simply holds while the
    // pointer is near the middle.
    //
    // The pebble has to have LANDED first — the pointer stopped on this tile —
    // because that is what separates a facing the player chose from a region
    // the pebble merely crossed on its way in. See the tray-drop test above.
    const { battle, drag } = await swordDrag()
    // In through the bottom edge — where a pebble from the tray arrives, and
    // not a facing anybody picked — and then ACROSS to the left region, which
    // is. Only that second move is a choice, and it is the one the dead zone
    // has to keep hold of.
    battle.updateDrag(127.5, 250, { col: 1, row: 2 })
    expect(drag.region).toBe('down')
    battle.updateDrag(92, 212.5, { col: 1, row: 2 })
    expect(drag.dir).toBe('left')
    battle.updateDrag(127.5, 212.5, { col: 1, row: 2 })
    expect(drag.region).toBeNull()
    expect(drag.dir).toBe('left')
    battle.updateDrag(163, 212.5, { col: 1, row: 2 })
    expect(drag.region).toBe('right')
    expect(drag.dir).toBe('right')
  })

  it('the compass promises the held facing inside the dead zone, and says nothing was chosen', async () => {
    // Whatever `hover.dir` reports is what a click delivers — the renderer
    // draws its "nothing picked yet" state off `chosen`, so the two must agree.
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.selectHand(battle.view.hand.indexOf('melee'))
    battle.aimKey('left')
    battle.setHover({ col: 1, row: 2 }, 0.5, 0.5)
    expect(battle.view.hover).toMatchObject({ chosen: false, dir: 'left' })
    // …and a click in the middle keeps both the facing and the window.
    expect(battle.placeSelected({ col: 1, row: 2 })).toBe(true)
    expect(battle.view.playerMove).toMatchObject({ dir: 'left' })
    expect(battle.lockOpen.value).toBe(true)
  })

  it('a FINGER aims by position too — and still keeps its correction window', async () => {
    // Mobile gets the easier aiming: a thumb sliding toward the edge it wants
    // beats a flick with a distance threshold in it. What it does NOT lose is
    // the second chance, because a fingertip covers the middle of the very tile
    // it is choosing on. That is the only thing `precise` gates now.
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    const slot = battle.view.hand.indexOf('melee')
    battle.beginDrag(slot, 100, 600)
    const drag = battle.view.drag as NonNullable<typeof battle.view.drag>
    expect(drag.precise).toBe(false)
    battle.updateDrag(92, 212.5, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(drag.region).toBe('left')
    expect(drag.dir).toBe('left')
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
    // The window is the safety net touch keeps.
    expect(battle.lockOpen.value).toBe(true)
    expect(battle.view.lock?.source).toBe('drag')
    expect(battle.view.lock?.totalMs).toBe(LOCK_WINDOW_MS)
  })

  it('1-1 keeps its held re-aim window even for a precise pointer', async () => {
    // The lesson IS the correction window. It must not evaporate because the
    // player happens to be on a desktop.
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    battle.beginDrag(0, 100, 600, true)
    battle.updateDrag(127.5, 180, { col: 1, row: 2 })
    expect((battle.view.drag as NonNullable<typeof battle.view.drag>).region).toBe('up')
    battle.endDrag(true)
    expect(battle.lockOpen.value).toBe(true)
    expect(battle.view.lock?.held).toBe(true)
    expect(battle.ghostActive.value).toBe(true)
  })

  it('a tap that named no direction still gets the long window', async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.selectHand(0)
    expect(battle.placeSelected({ col: 1, row: 2 })).toBe(true)
    expect(battle.lockOpen.value).toBe(true)
    expect(battle.view.lock?.totalMs).toBe(LOCK_WINDOW_TAP_MS)
  })

  it('a click INSIDE a region places aimed and skips the window; without a hover it does not', async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.selectHand(battle.view.hand.indexOf('melee'))
    // The cursor was over that region first — that is what the player saw.
    battle.setHover({ col: 1, row: 2 }, 0.5, 0.95)
    expect(battle.view.hover).toMatchObject({ cell: { col: 1, row: 2 }, dir: 'down', precise: true })
    expect(battle.placeSelected({ col: 1, row: 2 }, 'down')).toBe(true)
    expect(battle.lockOpen.value).toBe(false)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'down' })

    // A named direction with NO hover behind it is not an aimed placement: the
    // skip is earned by the player having seen the facing, not by the caller.
    const b2 = await load(normalBlob())
    b2.mod.setDragMetrics(tileMetrics())
    b2.battle.startNode(NORMAL)
    b2.battle.selectHand(b2.battle.view.hand.indexOf('melee'))
    expect(b2.battle.placeSelected({ col: 1, row: 2 }, 'down')).toBe(true)
    expect(b2.battle.lockOpen.value).toBe(true)
  })

  it('the compass appears with a pebble in hand and is cleared by every way of letting go', async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    expect(battle.view.hover).toBeNull()
    // Nothing in hand: no compass, whatever the pointer does.
    battle.setHover({ col: 1, row: 2 }, 0.5, 0.1)
    expect(battle.view.hover).toBeNull()

    battle.selectHand(0)
    battle.setHover({ col: 1, row: 2 }, 0.5, 0.1)
    expect(battle.view.hover).toMatchObject({ cell: { col: 1, row: 2 }, type: battle.view.hand[0], precise: true })
    // Off the board.
    battle.setHover(null)
    expect(battle.view.hover).toBeNull()
    // Letting the selection go.
    battle.setHover({ col: 1, row: 2 }, 0.5, 0.1)
    battle.selectHand(-1)
    expect(battle.view.hover).toBeNull()

    // A drag keeps its own compass, and committing clears it.
    battle.beginDrag(battle.view.hand.indexOf('melee'), 100, 600, true)
    battle.updateDrag(127.5, 180, { col: 1, row: 2 })
    expect(battle.view.hover).toMatchObject({ cell: { col: 1, row: 2 }, dir: 'up' })
    battle.endDrag(true)
    expect(battle.view.hover).toBeNull()
  })

  it('a tile the pebble cannot take offers no compass and no region', async () => {
    // 1-2 stands enemy runes on the board, so there is a tile to refuse.
    const { battle, mod } = await load({ gx_best_node: 1, gx_node: 2, gx_tutorial_seen: true })
    mod.setDragMetrics(tileMetrics())
    battle.startNode(2)
    const slot = battle.view.hand.indexOf('archer')
    expect(slot).toBeGreaterThanOrEqual(0)
    battle.beginDrag(slot, 100, 600, true)
    const held = battle.view.board.tiles.find((t) => t.runeId !== null && t.owner === 'enemy')
    expect(held).toBeDefined()
    const cell = { col: held!.col, row: held!.row }
    // Well off the centre, so the dead zone is not what is answering.
    battle.updateDrag(cell.col * TILE + TILE * 0.5, cell.row * TILE + TILE * 0.08, cell)
    expect(battle.view.drag!.kind).toBe('invalid')
    expect(battle.view.hover).toBeNull()
    expect(battle.view.drag!.region).toBeNull()
  })
})

