import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AIM_LAND_MS, BETWEEN_TURNS_MS, LESSON_REAIM_HOLD_MS, LOCK_WINDOW_MS, LOCK_WINDOW_TAP_MS, NO_HANDICAP,
  PLANNING_MS, RESET_MS, RESOLVE_MS, REVEAL_MS
} from '@/game/rules'

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
}

const load = async (blob: Record<string, unknown> = {}, opts: LoadOptions = {}) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
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

/** The first node with a clock and a real opponent: chapter 1's seventh, after the six lessons. */
const NORMAL = 7
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
    // The ghost hand teaches the drag AND the re-aim, on the node's own script;
    // the clock waits for it.
    expect(battle.ghostActive.value).toBe(true)
    expect(battle.view.ghost).toEqual({ handIndex: 0, to: { col: 1, row: 2 }, dir: 'left', mode: 'place', reaim: 'left' })
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

  it('a twelve-pixel flick is a facing', async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    expect(drag.type).toBe('melee')
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(drag.dir).toBe('up')
    // Eight pixels: not yet.
    battle.updateDrag(119, 212, { col: 1, row: 2 })
    expect(drag.dir).toBe('up')
    // Fourteen: left.
    battle.updateDrag(113, 212, { col: 1, row: 2 })
    expect(drag.dir).toBe('left')
    expect(drag.anchor).toEqual({ x: 127, y: 212 })
    battle.endDrag(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'left' })
  })

  it('entering a tile at its edge and staying there, a small flick still turns the rune', async () => {
    // The complaint this pins: "if I enter a grid spot on one edge and stay
    // there with my mouse, it is really hard to change the attack vector".
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    // Two pixels inside the right edge of (1,2) — the tile spans x 85..170.
    battle.updateDrag(168, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    expect(drag.aiming).toBe(true)
    // A flick OUTWARD crosses into (2,2) at once; the input reports that tile.
    battle.updateDrag(176, 212, { col: 2, row: 2 })
    battle.updateDrag(183, 212, { col: 2, row: 2 })
    expect(drag.dir).toBe('right')
    expect(drag.over).toEqual({ col: 1, row: 2 })
    // …and back the other way, still without leaving.
    battle.updateDrag(175, 212, { col: 2, row: 2 })
    battle.updateDrag(168, 212, { col: 1, row: 2 })
    expect(drag.dir).toBe('left')
    // Up, down: every facing from the same spot.
    battle.updateDrag(168, 198, { col: 1, row: 2 })
    expect(drag.dir).toBe('up')
    battle.updateDrag(168, 213, { col: 1, row: 2 })
    expect(drag.dir).toBe('down')
    expect(drag.over).toEqual({ col: 1, row: 2 })
  })

  it('a flick back inside the window is the opposite facing, not less of the first', async () => {
    const { battle, mod } = await load(normalBlob())
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    const drag = battle.view.drag!
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    battle.updateDrag(127, 190, { col: 1, row: 2 })
    expect(drag.dir).toBe('up')
    // Six pixels back is jitter…
    battle.updateDrag(127, 196, { col: 1, row: 2 })
    expect(drag.dir).toBe('up')
    // …thirteen is a stroke.
    battle.updateDrag(127, 203, { col: 1, row: 2 })
    expect(drag.dir).toBe('down')
  })

  it('a diagonal rune snaps a flick to its diagonals', async () => {
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
    battle.updateDrag(117, 222, { col: 1, row: 2 })
    expect(drag.dir).toBe('dl')
    battle.updateDrag(127, 212, { col: 1, row: 2 })
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

  it('a release on a tile before landing takes the default facing', async () => {
    const { battle } = await load()
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(100, 440, { col: 1, row: 2 })
    battle.endDrag(true)
    expect(battle.hasPlaced.value).toBe(true)
    expect(battle.view.playerMove).toMatchObject({ col: 1, row: 2, dir: 'up' })
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

  it('locks the placement and opens the correction window; on 1-1 the window is HELD until the re-aim the ghost shows', async () => {
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
    const { battle } = await load()
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
    const { battle, mod } = await load()
    mod.setDragMetrics(tileMetrics())
    battle.startNode(1)
    battle.beginDrag(0, 100, 600)
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    // A flick left while still holding.
    battle.updateDrag(120, 212, { col: 1, row: 2 })
    battle.updateDrag(113, 212, { col: 1, row: 2 })
    expect(battle.view.drag!.dir).toBe('left')
    battle.endDrag(true)
    expect(battle.view.lock).toMatchObject({ dir: 'left', held: false, leftMs: LOCK_WINDOW_MS })
    expect(battle.view.ghost).toBeNull()
    advance(battle, LOCK_WINDOW_MS + 20)
    expect(battle.phase.value).toBe('reveal')
  })

  it('an external pause freezes a held window\'s patience too', async () => {
    const { battle } = await load()
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
    const { battle } = await load()
    battle.startNode(1)
    // Turn 1: the sword faces up at nothing; the hold expires and the turn resolves.
    placeAt(battle, 0, { col: 1, row: 2 })
    advance(battle, LESSON_REAIM_HOLD_MS + 100)
    advance(battle, REVEAL_MS + RESOLVE_MS + BETWEEN_TURNS_MS + 100)
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
    const { battle, events, campaign, economy, streak, reportMatch, state } = await load()
    battle.startNode(1)
    // The sword lands facing up at nothing; the lesson holds the window until
    // it is turned toward the skeleton on the left.
    placeAt(battle, 0, { col: 1, row: 2 })
    expect(battle.view.lock).toMatchObject({ dir: 'up', held: true })
    expect(battle.aimKey('left')).toBe(true)
    advance(battle, 450)
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

    advance(battle, RESOLVE_MS + BETWEEN_TURNS_MS + 20)
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

  it('a stroke after a key wins, as strokes always do', async () => {
    const { battle, mod } = await load(normalBlob({ gx_unlocked_runes: ['melee'] }))
    mod.setDragMetrics(tileMetrics())
    battle.startNode(NORMAL)
    battle.beginDrag(0, 100, 600)
    battle.aimKey('right')
    battle.updateDrag(127, 212, { col: 1, row: 2 })
    advance(battle, AIM_LAND_MS + 10)
    battle.updateDrag(127, 205, { col: 1, row: 2 })
    battle.updateDrag(127, 198, { col: 1, row: 2 })
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
