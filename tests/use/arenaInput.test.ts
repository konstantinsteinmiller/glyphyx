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
    hover: null as unknown,
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
    placeSelected: vi.fn((_c: { col: number; row: number }, _d?: string) => { view.selected = -1; return true }),
    setHover: vi.fn(),
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

/**
 * The same event from a MOUSE. A bare `PointerEvent` reports `pointerType: ''`,
 * which the module reads as imprecise — so every existing case above is a
 * finger, and only these are a mouse.
 */
const mouse = (el: HTMLElement, type: string, x: number, y: number, extra: Record<string, unknown> = {}): void =>
  fire(el, type, x, y, { pointerType: 'mouse', ...extra })

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

/** A mouse click in place — down and up, quickly, at the same point. */
const clickAt = (el: HTMLElement, x: number, y: number): void => {
  const t0 = 10_000
  el.dispatchEvent(stamped(new PointerEvent('pointerdown', { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', bubbles: true, cancelable: true }), t0))
  el.dispatchEvent(stamped(new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', bubbles: true, cancelable: true }), t0 + 60))
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
    expect(battle.beginDrag).toHaveBeenCalledWith(0, 60, 440, false)
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
    expect(battle.beginDrag).toHaveBeenCalledWith(1, 160, 440, false)
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
    expect(battle.beginDrag).toHaveBeenCalledWith(0, 60, 440, false)
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

describe('the tile\'s compass, on a mouse', () => {
  /**
   * The hover is what the renderer draws the four regions from, so these pin
   * WHEN it is published, with what, and — just as load-bearing — when it is
   * not published at all.
   *
   * Tile (2,1) is the workhorse here precisely because it is NOT at the
   * origin: a fraction computed against the board instead of against the tile
   * would still look right on (0,0) and be wrong everywhere else.
   */
  it('tells the battle which pointer pressed: a mouse is precise, a finger is not', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    mouse(canvas, 'pointerdown', 60, 440)
    expect(battle.beginDrag).toHaveBeenLastCalledWith(0, 60, 440, true)
    mouse(canvas, 'pointerup', 60, 440)
    fire(canvas, 'pointerdown', 60, 440)
    expect(battle.beginDrag).toHaveBeenLastCalledWith(0, 60, 440, false)
    detach()
    // A pen is a mouse for this purpose; anything that will not say is not.
    expect(mod.isPrecisePointer('mouse')).toBe(true)
    expect(mod.isPrecisePointer('pen')).toBe(true)
    expect(mod.isPrecisePointer('touch')).toBe(false)
    expect(mod.isPrecisePointer('')).toBe(false)
    expect(mod.isPrecisePointer(undefined)).toBe(false)
  })

  it('publishes the tile and the region under the cursor while a pebble is selected', () => {
    const battle = fakeBattle()
    battle.view.selected = 0 // the sword: four triangles
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // (200, 90) is in tile (2,1), a fifth of the way down it → the UP triangle.
    mouse(canvas, 'pointermove', 200, 90)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    const call = battle.setHover.mock.calls[0]!
    expect(call[0]).toMatchObject({ col: 2, row: 1 })
    // Measured against the TILE, not the board: (200,90) inside (160,80,80,80).
    expect(call[1]).toBeCloseTo(0.5)
    expect(call[2]).toBeCloseTo(0.125)
    detach()
  })

  it('re-publishes only when the tile, the region or the rune changes', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    mouse(canvas, 'pointermove', 200, 90)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    // Still the up triangle of the same tile: nothing the renderer can see has
    // changed, so the composable must not hear about it.
    mouse(canvas, 'pointermove', 202, 92)
    mouse(canvas, 'pointermove', 198, 95)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    // Across the diagonal into the LEFT triangle of the same tile.
    mouse(canvas, 'pointermove', 165, 120)
    expect(battle.setHover).toHaveBeenCalledTimes(2)
    // …and onto a different tile.
    mouse(canvas, 'pointermove', 40, 120)
    expect(battle.setHover).toHaveBeenCalledTimes(3)
    expect(battle.setHover.mock.calls[2]![0]).toMatchObject({ col: 0, row: 1 })
    detach()
  })

  it('carves the orb\'s tile into quadrants instead of triangles', () => {
    const battle = fakeBattle()
    battle.view.selected = 1 // the mage
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Bottom-left of tile (2,1): a sword would read this as LEFT, an orb as dl.
    mouse(canvas, 'pointermove', 170, 150)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    // The region is the composable's to derive from the fraction we send, so
    // what this pins is that the fraction lands in the dl quadrant.
    const call = battle.setHover.mock.calls[0]!
    expect(call[1]).toBeLessThan(0.5)
    expect(call[2]).toBeGreaterThan(0.5)
    detach()
  })

  it('clears the hover off the board, off the canvas, and with nothing in hand', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    mouse(canvas, 'pointermove', 200, 90)
    expect(battle.setHover.mock.calls[0]![0]).toMatchObject({ col: 2, row: 1 })
    // Below the board, over the hand: there is no tile to aim in.
    mouse(canvas, 'pointermove', 60, 440)
    expect(battle.setHover).toHaveBeenLastCalledWith(null)
    // …and it is not repeated while the cursor stays off the board.
    const afterOff = battle.setHover.mock.calls.length
    mouse(canvas, 'pointermove', 62, 442)
    expect(battle.setHover).toHaveBeenCalledTimes(afterOff)
    // Back on, then out of the canvas entirely.
    mouse(canvas, 'pointermove', 200, 90)
    mouse(canvas, 'pointerleave', 200, 90)
    expect(battle.setHover).toHaveBeenLastCalledWith(null)
    // Nothing selected and nothing carried: no compass at all.
    battle.view.selected = -1
    battle.setHover.mockClear()
    mouse(canvas, 'pointermove', 200, 90)
    expect(battle.setHover).not.toHaveBeenCalled()
    detach()
  })


  it('re-publishes when the pointer drifts across the dead-zone edge', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Both points are in the UP triangle of tile (2,1) — the region never
    // changes — but one is a chosen facing and the other is not, and the
    // renderer draws those differently.
    mouse(canvas, 'pointermove', 200, 88)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    mouse(canvas, 'pointermove', 200, 114)
    expect(battle.setHover).toHaveBeenCalledTimes(2)
    detach()
  })

  it('draws no compass for a finger that is not dragging — a touch has no hover', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Moves with nothing down. On a touchscreen these do not happen at all;
    // what this pins is that the module never invents a hover without contact.
    fire(canvas, 'pointermove', 200, 90)
    fire(canvas, 'pointermove', 120, 200)
    expect(battle.setHover).not.toHaveBeenCalled()
    detach()
  })

  it('follows a FINGER that is dragging, and drops it on release', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // A thumb carrying a pebble is choosing a facing with every millimetre,
    // so the compass has to be under it — this is the mobile half of the
    // feature, and the players who need it most.
    fire(canvas, 'pointerdown', 60, 440)
    fire(canvas, 'pointermove', 200, 90)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    const call = battle.setHover.mock.calls[0]!
    expect(call[0]).toMatchObject({ col: 2, row: 1 })
    expect(call[1]).toBeCloseTo(0.5)
    expect(call[2]).toBeCloseTo(0.125)
    // …and it is still throttled: the same region twice is one call.
    fire(canvas, 'pointermove', 202, 92)
    expect(battle.setHover).toHaveBeenCalledTimes(1)
    fire(canvas, 'pointerup', 200, 90)
    expect(battle.setHover).toHaveBeenLastCalledWith(null)
    detach()
  })

  it('still reports a finger as imprecise, so its placement keeps the window', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Aiming and window-skipping are now separate things: a finger aims by
    // position like everyone else, and still gets its correction window.
    fire(canvas, 'pointerdown', 60, 440)
    expect(battle.beginDrag).toHaveBeenLastCalledWith(0, 60, 440, false)
    fire(canvas, 'pointermove', 200, 90)
    expect(battle.setHover).toHaveBeenCalled()
    detach()
  })

  it('follows the pebble being dragged, and drops it on release', () => {
    const battle = fakeBattle()
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    mouse(canvas, 'pointerdown', 60, 440)
    mouse(canvas, 'pointermove', 200, 90)
    expect(battle.setHover.mock.calls[battle.setHover.mock.calls.length - 1]![0])
      .toMatchObject({ col: 2, row: 1 })
    mouse(canvas, 'pointerup', 200, 90)
    expect(battle.setHover).toHaveBeenLastCalledWith(null)
    detach()
  })
})

describe('a click that places AND aims', () => {
  it('sends the region the mouse clicked in, so nothing is left to correct', () => {
    const battle = fakeBattle()
    battle.view.selected = 0 // the sword
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Tile (1,2) spans (80,160)…(160,240); (120,170) is near its top edge.
    clickAt(canvas, 120, 170)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 }, 'up')
    detach()
  })

  it('reads the click\'s own corner for a diagonal rune', () => {
    const battle = fakeBattle()
    battle.view.selected = 1 // the mage
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Bottom-right of tile (1,2).
    clickAt(canvas, 150, 230)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 }, 'dr')
    detach()
  })

  it('a shield is placed with no facing to read at all', () => {
    const battle = fakeBattle()
    battle.view.selected = 2 // the defense rune
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    clickAt(canvas, 120, 170)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 }, 'omni')
    detach()
  })

  it('a FINGER still places on the default facing and keeps its window', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    tap(canvas, 120, 170)
    // One argument, not two: the composable must not read this as aimed.
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 })
    detach()
  })


  it('treats a click in the MIDDLE as choosing nothing', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // Dead centre of tile (1,2): a player who clicked here did not pick a
    // facing, and one who had already set it with a key must keep theirs.
    clickAt(canvas, 120, 200)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 })
    detach()
  })

  it('still aims from just outside the dead zone', () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    // AIM_CENTRE_DEAD_ZONE is 0.18 of a tile; 0.3 up from the centre is out
    // of it, so this one counts as chosen.
    clickAt(canvas, 120, 200 - 0.3 * TILE)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 2 }, 'up')
    detach()
  })

  it('a refused tile keeps the selection and says no', async () => {
    const battle = fakeBattle()
    battle.view.selected = 0
    battle.placeSelected.mockImplementation(() => false)
    const detach = mod.attachArenaInput(canvas, renderer, battle)
    clickAt(canvas, 120, 10)
    expect(battle.placeSelected).toHaveBeenCalledWith({ col: 1, row: 0 }, 'up')
    expect(battle.selectHand).not.toHaveBeenCalled()
    const { playFx } = await import('@/use/useGameAudio')
    expect(playFx).toHaveBeenCalledWith('uiReject', 0.4)
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
