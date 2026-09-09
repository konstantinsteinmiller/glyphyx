import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArenaLayout, BattleApi, HitTarget } from '@/game/view'
import { LOCK_CHEVRON_HIT_TILES, LOCK_CHEVRON_TILES } from '@/game/rules'

/**
 * ─── Pointer + keyboard → battle ────────────────────────────────────────────
 *
 * The input module against a fake renderer and a spying battle: which
 * composable call each pointer event and key turns into, and that the
 * layout's geometry reaches the composable before a drag starts.
 */

vi.mock('@/use/useGameAudio', () => ({ playFx: vi.fn() }))

/** The modal gate, flippable per test. */
const modal = vi.hoisted(() => ({ value: false }))
vi.mock('@/use/useModalState', () => ({ isAnyModalOpen: modal }))

type Input = typeof import('@/use/useArenaInput')

const TILE = 80
/** The board at (0,0)…(320,320), the hand below it, the reroll chip beside the hand. */
const layout: ArenaLayout = {
  board: { x: 0, y: 0, w: 4 * TILE, h: 4 * TILE },
  tile: TILE,
  tileRect: (col, row) => ({ x: col * TILE, y: row * TILE, w: TILE, h: TILE }),
  hand: [0, 1, 2].map((i) => ({ x: 20 + i * 100, y: 400, w: 80, h: 80 })),
  reroll: { x: 330, y: 400, w: 60, h: 60 },
  timer: { x: 0, y: 340, w: 320, h: 20 },
  swipeThreshold: TILE * 0.3
}

const hitTest = (x: number, y: number): HitTarget => {
  if (x >= 0 && x < 4 * TILE && y >= 0 && y < 4 * TILE) return { kind: 'tile', col: Math.floor(x / TILE), row: Math.floor(y / TILE) }
  for (let i = 0; i < 3; i++) {
    const h = layout.hand[i]!
    if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return { kind: 'hand', index: i }
  }
  const r = layout.reroll
  if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return { kind: 'reroll' }
  return null
}

const renderer = { layout: () => layout, hitTest } as unknown as import('@/use/useArenaArt').ArenaRenderer

const fakeBattle = () => {
  const view = {
    drag: null as unknown as { mode: string; type: string } | null,
    lock: null as unknown as { cell: { col: number; row: number }; type: string; dir: string; leftMs: number; totalMs: number } | null,
    selected: -1,
    hand: ['melee', 'mage', 'defense'],
    rerollsLeft: 2
  }
  const api = {
    view,
    beginDrag: vi.fn((i: number, _x: number, _y: number) => { view.selected = -1; view.drag = { mode: 'place', type: view.hand[i]! }; return true }),
    updateDrag: vi.fn(),
    setAim: vi.fn(),
    endDrag: vi.fn(() => { view.drag = null }),
    beginCorrection: vi.fn((_x: number, _y: number) => { view.drag = { mode: 'correct', type: view.lock?.type ?? 'melee' }; return true }),
    selectHand: vi.fn((i: number) => { view.selected = i === view.selected ? -1 : i; return true }),
    placeSelected: vi.fn((_c: { col: number; row: number }) => { view.selected = -1; return true }),
    aimKey: vi.fn((_d: string) => true),
    reroll: vi.fn(() => { view.rerollsLeft-- }),
    tick: vi.fn()
  }
  return api as unknown as BattleApi & typeof api
}

const fire = (el: HTMLElement, type: string, x: number, y: number, extra: Record<string, unknown> = {}): void => {
  const e = new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true, cancelable: true, ...extra })
  el.dispatchEvent(e)
}

/** jsdom stamps events itself; pin the clock so a tap and a hold can be told apart. */
const stamped = <E extends Event>(e: E, at: number): E => {
  Object.defineProperty(e, 'timeStamp', { value: at, configurable: true })
  return e
}

/** Down and up in place: a tap. `ms` is the hold — past TAP_MAX_MS (1.2 s) it is no tap. */
const tap = (el: HTMLElement, x: number, y: number, ms = 80): void => {
  const t0 = 10_000
  el.dispatchEvent(stamped(new PointerEvent('pointerdown', { clientX: x, clientY: y, pointerId: 1, bubbles: true, cancelable: true }), t0))
  el.dispatchEvent(stamped(new PointerEvent('pointerup', { clientX: x + 2, clientY: y + 1, pointerId: 1, bubbles: true, cancelable: true }), t0 + ms))
}

/** A key press on the window. jsdom drops `repeat` from the init dict, so it is pinned by hand. */
const key = (k: string, extra: KeyboardEventInit = {}): KeyboardEvent => {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra })
  if (extra.repeat !== undefined) Object.defineProperty(e, 'repeat', { value: extra.repeat, configurable: true })
  window.dispatchEvent(e)
  return e
}

let mod: Input
let canvas: HTMLCanvasElement

beforeEach(async () => {
  vi.resetModules()
  modal.value = false
  mod = await import('@/use/useArenaInput')
  canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
})

describe('a placement drag', () => {
  it('press on a hand slot → move → release becomes beginDrag / updateDrag / endDrag(true)', () => {
    const battle = fakeBattle()
    const setDragMetrics = vi.fn()
    const detach = mod.attachArenaInput(canvas, renderer, battle, { setDragMetrics })
    // The layout's numbers reach the composable on attach and again on the press.
    expect(setDragMetrics).toHaveBeenCalledTimes(1)
    const m = setDragMetrics.mock.calls[0]![0]
    expect(m.tilePx).toBe(TILE)
    expect(m.swipeThresholdPx).toBe(TILE * 0.3)
    expect(m.tileCenter({ col: 2, row: 1 })).toEqual({ x: 200, y: 120 })

    fire(canvas, 'pointerdown', 60, 440)
    expect(setDragMetrics).toHaveBeenCalledTimes(2)
    expect(battle.beginDrag).toHaveBeenCalledWith(0, 60, 440)
    // The first update comes with the press itself (no tile under the hand).
    expect(battle.updateDrag).toHaveBeenLastCalledWith(60, 440, null)
    fire(canvas, 'pointermove', 120, 200)
    expect(battle.updateDrag).toHaveBeenLastCalledWith(120, 200, { col: 1, row: 2 })
    fire(canvas, 'pointerup', 120, 190)
    expect(battle.updateDrag).toHaveBeenLastCalledWith(120, 190, { col: 1, row: 2 })
    expect(battle.endDrag).toHaveBeenCalledWith(true)
    expect(battle.selectHand).not.toHaveBeenCalled()
    detach()
  })

  it('a pointercancel is never a placement', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 60, 440)
    fire(canvas, 'pointermove', 120, 200)
    fire(canvas, 'pointercancel', 120, 200)
    expect(battle.endDrag).toHaveBeenCalledWith(false)
    detach()
  })

  it('a press that the battle refuses is not a drag', () => {
    const battle = fakeBattle()
    battle.beginDrag.mockImplementation(() => false)
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 60, 440)
    fire(canvas, 'pointermove', 120, 200)
    fire(canvas, 'pointerup', 120, 200)
    expect(battle.updateDrag).not.toHaveBeenCalled()
    expect(battle.endDrag).not.toHaveBeenCalled()
    detach()
  })

  it('a second pointer while one is down is ignored', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 60, 440)
    fire(canvas, 'pointerdown', 160, 440, { pointerId: 2 })
    expect(battle.beginDrag).toHaveBeenCalledTimes(1)
    fire(canvas, 'pointermove', 120, 200, { pointerId: 2 })
    expect(battle.updateDrag).toHaveBeenCalledTimes(1)
    detach()
  })
})

describe('tap-to-place', () => {
  it('a tap on a hand pebble puts the drag back and selects the slot', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 160, 440)
    // The press started a drag (it might have become one); the tap undoes it…
    expect(battle.beginDrag).toHaveBeenCalledWith(1, 160, 440)
    expect(battle.endDrag).toHaveBeenCalledWith(false)
    // …and selects instead.
    expect(battle.selectHand).toHaveBeenCalledWith(1)
    expect(battle.view.selected).toBe(1)
    detach()
  })

  it('a slow press on a hand pebble is a drag that went nowhere, not a selection', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 160, 440, 1500)
    expect(battle.endDrag).toHaveBeenCalledWith(true)
    expect(battle.selectHand).not.toHaveBeenCalled()
    detach()
  })

  it('with a selection, a tap on a tile places there', () => {
    const battle = fakeBattle()
    battle.view.selected = 1
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 120, 200)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 })
    expect(battle.beginDrag).not.toHaveBeenCalled()
    detach()
  })

  it('a tile that refuses the pebble keeps the selection and says no', async () => {
    const battle = fakeBattle()
    battle.view.selected = 1
    battle.placeSelected.mockImplementation(() => false)
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 120, 40)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 0 })
    expect(battle.selectHand).not.toHaveBeenCalled()
    const { playFx } = await import('@/use/useGameAudio')
    expect(playFx).toHaveBeenCalledWith('uiReject', 0.4)
    detach()
  })

  it('a tap anywhere else lets the selection go', () => {
    const battle = fakeBattle()
    battle.view.selected = 1
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 200, 360)
    expect(battle.selectHand).toHaveBeenCalledWith(-1)
    expect(battle.placeSelected).not.toHaveBeenCalled()
    detach()
  })

  it('a tap on the selected pebble again is the composable\'s toggle', () => {
    const battle = fakeBattle()
    battle.view.selected = 1
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 160, 440)
    expect(battle.selectHand).toHaveBeenLastCalledWith(1)
    detach()
  })

  it('without a selection a tap on a tile does nothing', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 120, 200)
    expect(battle.placeSelected).not.toHaveBeenCalled()
    expect(battle.selectHand).not.toHaveBeenCalled()
    detach()
  })
})

describe('the correction window', () => {
  const lockAt12 = (type = 'melee', dir = 'up') =>
    ({ cell: { col: 1, row: 2 }, type, dir, leftMs: 800, totalMs: 1000 })

  it('a press ANYWHERE while the lock is open is a correction stroke, not a drag', () => {
    const battle = fakeBattle()
    battle.view.lock = lockAt12()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // On a hand slot, of all places — the lock wins.
    fire(canvas, 'pointerdown', 60, 440)
    expect(battle.beginCorrection).toHaveBeenCalledWith(60, 440)
    expect(battle.beginDrag).not.toHaveBeenCalled()
    expect(battle.aimKey).not.toHaveBeenCalled()
    fire(canvas, 'pointermove', 40, 440)
    expect(battle.updateDrag).toHaveBeenLastCalledWith(40, 440, null)
    fire(canvas, 'pointerup', 40, 440)
    expect(battle.endDrag).toHaveBeenCalledWith(true)
    detach()
  })

  it('falls back to the normal press when the battle has nothing to correct', () => {
    const battle = fakeBattle()
    battle.view.lock = { ...lockAt12(), leftMs: 0 }
    battle.beginCorrection.mockImplementation(() => false)
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 60, 440)
    expect(battle.beginCorrection).toHaveBeenCalled()
    expect(battle.beginDrag).toHaveBeenCalledWith(0, 60, 440)
    detach()
  })

  it('a press on a chevron turns the rune that way at once, then the stroke may go on', () => {
    const battle = fakeBattle()
    battle.view.lock = lockAt12()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // The tile (1,2) is centred on (120, 200); the left chevron sits LOCK_CHEVRON_TILES out.
    const cx = 120 - LOCK_CHEVRON_TILES * TILE
    fire(canvas, 'pointerdown', cx + 3, 200 - 4)
    expect(battle.aimKey).toHaveBeenCalledWith('left')
    expect(battle.beginCorrection).toHaveBeenCalledWith(cx + 3, 196)
    detach()
  })

  it('the current facing wears no chevron, and a press outside the hit radius is a plain stroke', () => {
    const battle = fakeBattle()
    battle.view.lock = lockAt12()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Where the 'up' chevron would be: it is the bold arrow instead.
    fire(canvas, 'pointerdown', 120, 200 - LOCK_CHEVRON_TILES * TILE)
    expect(battle.aimKey).not.toHaveBeenCalled()
    fire(canvas, 'pointerup', 120, 200 - LOCK_CHEVRON_TILES * TILE)
    // Just outside the right chevron's radius.
    const rx = 120 + LOCK_CHEVRON_TILES * TILE
    fire(canvas, 'pointerdown', rx + LOCK_CHEVRON_HIT_TILES * TILE + 2, 200)
    expect(battle.aimKey).not.toHaveBeenCalled()
    expect(battle.beginCorrection).toHaveBeenCalledTimes(2)
    detach()
  })

  it('a diagonal rune\'s chevrons sit on the diagonals', () => {
    const battle = fakeBattle()
    battle.view.lock = lockAt12('mage', 'ur')
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    const d = LOCK_CHEVRON_TILES * TILE / Math.SQRT2
    fire(canvas, 'pointerdown', 120 + d, 200 + d)
    expect(battle.aimKey).toHaveBeenCalledWith('dr')
    fire(canvas, 'pointerup', 120 + d, 200 + d)
    // A cardinal spot means nothing to an orb.
    fire(canvas, 'pointerdown', 120 - LOCK_CHEVRON_TILES * TILE, 200)
    expect(battle.aimKey).toHaveBeenCalledTimes(1)
    detach()
  })
})

describe('the keyboard', () => {
  it('arrows and WASD are facings for the pebble being dragged', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 60, 440)
    expect(key('ArrowLeft').defaultPrevented).toBe(true)
    expect(battle.aimKey).toHaveBeenLastCalledWith('left')
    key('w')
    expect(battle.aimKey).toHaveBeenLastCalledWith('up')
    key('D')
    expect(battle.aimKey).toHaveBeenLastCalledWith('right')
    key('s')
    expect(battle.aimKey).toHaveBeenLastCalledWith('down')
    detach()
  })

  it('an orb reads the arrows as quadrants and Q / E / Z / C as its diagonals', () => {
    const battle = fakeBattle()
    battle.view.selected = 1 // the mage
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    key('ArrowUp'); expect(battle.aimKey).toHaveBeenLastCalledWith('ur')
    key('ArrowRight'); expect(battle.aimKey).toHaveBeenLastCalledWith('dr')
    key('ArrowDown'); expect(battle.aimKey).toHaveBeenLastCalledWith('dl')
    key('ArrowLeft'); expect(battle.aimKey).toHaveBeenLastCalledWith('ul')
    key('q'); expect(battle.aimKey).toHaveBeenLastCalledWith('ul')
    key('e'); expect(battle.aimKey).toHaveBeenLastCalledWith('ur')
    key('z'); expect(battle.aimKey).toHaveBeenLastCalledWith('dl')
    key('c'); expect(battle.aimKey).toHaveBeenLastCalledWith('dr')
    detach()
  })

  it('aims the rune in its window when nothing is held', () => {
    const battle = fakeBattle()
    battle.view.lock = { cell: { col: 1, row: 2 }, type: 'melee', dir: 'up', leftMs: 500, totalMs: 1000 }
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    key('a')
    expect(battle.aimKey).toHaveBeenCalledWith('left')
    detach()
  })

  it('is silent with nothing to aim, on other keys, on modifiers, and when the battle refuses', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    expect(key('ArrowLeft').defaultPrevented).toBe(false)
    expect(battle.aimKey).not.toHaveBeenCalled()
    fire(canvas, 'pointerdown', 60, 440)
    expect(key('x').defaultPrevented).toBe(false)
    expect(key('ArrowLeft', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(key('ArrowLeft', { repeat: true }).defaultPrevented).toBe(false)
    expect(battle.aimKey).not.toHaveBeenCalled()
    battle.aimKey.mockImplementation(() => false)
    expect(key('ArrowLeft').defaultPrevented).toBe(false)
    detach()
  })

  it('leaves the keyboard to a text field and to an open modal', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 60, 440)
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }))
    expect(battle.aimKey).not.toHaveBeenCalled()
    modal.value = true
    key('a')
    expect(battle.aimKey).not.toHaveBeenCalled()
    modal.value = false
    key('a')
    expect(battle.aimKey).toHaveBeenCalledWith('left')
    input.remove()
    detach()
  })

  it('keyToDir is the one map the copy and the tests agree on', () => {
    expect(mod.keyToDir('ArrowUp', 'melee')).toBe('up')
    expect(mod.keyToDir('W', 'archer')).toBe('up')
    expect(mod.keyToDir('ArrowUp', 'mage')).toBe('ur')
    expect(mod.keyToDir('q', 'melee')).toBe('ul')
    expect(mod.keyToDir('Enter', 'melee')).toBeNull()
  })
})

describe('taps', () => {
  it('a quick tap on the reroll chip rerolls', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    fire(canvas, 'pointerdown', 350, 420)
    fire(canvas, 'pointerup', 352, 421)
    expect(battle.reroll).toHaveBeenCalledTimes(1)
    detach()
  })

  it('detaching removes every listener, the keyboard\'s too', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    detach()
    fire(canvas, 'pointerdown', 60, 440)
    expect(battle.beginDrag).not.toHaveBeenCalled()
    battle.view.selected = 0
    key('ArrowLeft')
    expect(battle.aimKey).not.toHaveBeenCalled()
  })
})
