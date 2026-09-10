import {
  CARDINALS, DIR_VEC, LOCK_CHEVRON_HIT_TILES, LOCK_CHEVRON_TILES, RUNES, dirFromCellPoint, dirsFor,
  isAimChosen,
  type Cell, type Dir, type RuneType
} from '@/game/rules'
import type { BattleApi, HitTarget } from '@/game/view'
import type { ArenaRenderer } from '@/use/useArenaArt'
import type { DragMetrics } from '@/use/useBattle'
import { playFx } from '@/use/useGameAudio'
import { isAnyModalOpen } from '@/use/useModalState'

/**
 * ─── Pointer + keyboard → battle ────────────────────────────────────────────
 *
 * One pointer, four gestures, every one decided by the battle composable:
 *
 *   • press a hand pebble, carry it over the board, let it land on the tile
 *     you mean, flick for the facing, release;
 *   • TAP a hand pebble (down and up in place) to SELECT it, then tap the
 *     tile it should go to — the pebble is placed facing forward and gets a
 *     longer correction window;
 *   • press ANYWHERE while the rune just placed is still in its correction
 *     window, flick, release — the rune turns to face the flick;
 *   • tap one of the CHEVRONS around that rune during the window — the rune
 *     turns to face it at once.
 *
 * And the keyboard, for a desktop hand: the arrow keys and WASD are the four
 * facings (Q / E / Z / C the diagonals; a diagonal rune reads the arrows as
 * quadrants), applied to whatever is being aimed — the pebble carried, the
 * pebble selected, or the rune in its window.
 *
 * The composable owns every decision — what counts as landing, what a stroke
 * is, what a release means, the flick fallback — and this module only feeds
 * it positions, the tile under the finger and the facing a key or a chevron
 * named. The one thing it knows that the composable does not is geometry:
 * the tile under the pointer, the tile size and each tile's centre are the
 * renderer's, handed over once per press through `setDragMetrics` so the
 * composable's distances agree with the board on screen; the chevrons are
 * hit-tested here from the same layout the renderer draws them on.
 *
 * Touch and mouse are one code path through pointer events, with capture so
 * a finger that wanders off the canvas still releases cleanly.
 *
 * ─── The tile's compass ─────────────────────────────────────────────────────
 *
 * A tile is carved into regions — one per facing the rune has — and the
 * pointer's position inside it names the facing (`dirFromCellPoint`). This
 * module publishes what is under the pointer (`battle.setHover`) so the
 * renderer can draw those regions and light the one being chosen.
 *
 * WHEN it is published differs by pointer, because hovering does:
 *
 *   • a MOUSE hovers without pressing, so the compass follows the cursor
 *     whenever a pebble is in hand — carried, or selected by a click;
 *   • a FINGER has no hover at all, but a finger DRAGGING a pebble is
 *     choosing a facing with every millimetre it moves, so the compass
 *     follows it too. A touch that is not dragging has nothing to say, and
 *     a TAP is a single point with no travel to read a region from — so
 *     tap-to-place still lands on the default facing.
 *
 * `precise` is a narrower thing than it looks: it no longer decides whether
 * a rune may be aimed by position, only whether the placement may SKIP the
 * correction window. A mouse may, because the region it chose was visible
 * before the click; a finger keeps its window, because the thumb covered the
 * tile it was choosing on. The composable is the only place that acts on it.
 */

export interface ArenaInputOptions {
  /** Pass the layout's distances on to the composable. */
  setDragMetrics?: (m: Partial<DragMetrics>) => void
}

const TAP_SLOP_PX = 10
/**
 * A press that never moved is a tap however long it took: on a slow phone the
 * pointer-up can arrive a few hundred ms after the finger lifted, and a tap
 * that turns into a cancelled drag is a pebble that snaps back for no reason.
 * The bound only stops a deliberate long hold from counting.
 */
const TAP_MAX_MS = 1200

/** Which facing a key names. Letters are matched lower-cased. */
export const KEY_DIRS: Readonly<Record<string, Dir>> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  q: 'ul', e: 'ur', z: 'dl', c: 'dr'
}

/** A diagonal rune reads the four arrows as quadrants, clockwise from the top. */
const ARROW_TO_DIAGONAL: Readonly<Partial<Record<Dir, Dir>>> = { up: 'ur', right: 'dr', down: 'dl', left: 'ul' }

/**
 * The facing a key means for a rune of `type` — `null` when the key is not a
 * facing at all. Exported so the tests (and the hint copy) agree with the map.
 */
export const keyToDir = (key: string, type: RuneType): Dir | null => {
  const raw = key.length === 1 ? key.toLowerCase() : key
  const dir = KEY_DIRS[raw]
  if (!dir) return null
  if (RUNES[type].aim === 'diagonal' && CARDINALS.includes(dir)) return ARROW_TO_DIAGONAL[dir] ?? dir
  return dir
}

/**
 * A pointer with a visible hover and pixel precision: a mouse, or a pen, which
 * behaves like one. Everything else — a finger, and anything that declines to
 * say what it is — is imprecise and keeps the correction window.
 */
export const isPrecisePointer = (pointerType: string | undefined): boolean =>
  pointerType === 'mouse' || pointerType === 'pen'

/** Where the chevron for `dir` sits around the stone at (cx, cy) — the renderer draws it there too. */
export const chevronCentre = (dir: Dir, cx: number, cy: number, tile: number): { x: number; y: number } => {
  const [dx, dy] = DIR_VEC[dir]
  const n = Math.hypot(dx, dy) || 1
  return { x: cx + (dx / n) * LOCK_CHEVRON_TILES * tile, y: cy + (dy / n) * LOCK_CHEVRON_TILES * tile }
}

const isTyping = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null
  if (!el || typeof el.tagName !== 'string') return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true
}

export const attachArenaInput = (
  canvas: HTMLCanvasElement,
  renderer: ArenaRenderer,
  battle: BattleApi,
  opts: ArenaInputOptions = {}
): (() => void) => {
  let pointerId: number | null = null
  /** A gesture the battle accepted (a placement drag or a correction stroke) is under way. */
  let dragging = false
  let downX = 0
  let downY = 0
  let downAt = 0
  let downTarget: HitTarget = null
  /** The pointer that pressed: a mouse aims by position and skips the window. */
  let downPrecise = false
  const over: Cell = { col: 0, row: 0 }

  // ── The published hover, remembered so an unchanged one is never re-sent ──
  //
  // `pointermove` fires at screen rate, and the renderer only ever reads the
  // hovered TILE and the REGION under the pointer — so a move that changes
  // neither (most of them) must not reach the composable at all.
  const hoverCell: Cell = { col: 0, row: 0 }
  let hoverOn = false
  let hoverCol = -1
  let hoverRow = -1
  let hoverDir: Dir | null = null
  let hoverType: RuneType | null = null
  /** Whether the last published position counted as a CHOSEN facing. */
  let hoverChosen = false

  const local = (e: PointerEvent): [number, number] => {
    const r = canvas.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }

  const tileUnder = (x: number, y: number): Cell | null => {
    const hit = renderer.hitTest(x, y)
    if (!hit || hit.kind !== 'tile') return null
    over.col = hit.col
    over.row = hit.row
    return over
  }

  const publishMetrics = (): void => {
    const layout = renderer.layout()
    opts.setDragMetrics?.({
      swipeThresholdPx: layout.swipeThreshold,
      tilePx: layout.tile,
      tileCenter: (c) => {
        const r = layout.tileRect(c.col, c.row)
        return { x: r.x + r.w / 2, y: r.y + r.h / 2 }
      }
    })
  }

  /** The facing chevron under (x, y) during the lock window, if any. */
  const chevronAt = (x: number, y: number): Dir | null => {
    const lock = battle.view.lock
    if (!lock) return null
    const layout = renderer.layout()
    const r = layout.tileRect(lock.cell.col, lock.cell.row)
    const cx = r.x + r.w / 2
    const cy = r.y + r.h / 2
    const hit = LOCK_CHEVRON_HIT_TILES * layout.tile
    for (const d of dirsFor(lock.type)) {
      // The current facing wears the bold arrow, not a chevron.
      if (d === 'omni' || d === lock.dir) continue
      const c = chevronCentre(d, cx, cy, layout.tile)
      if (Math.hypot(x - c.x, y - c.y) <= hit) return d
    }
    return null
  }

  /**
   * The rune whose compass the cursor should be drawing — the one carried, or
   * the one selected by a tap. NOT the rune inside a correction window: that
   * one is already placed and wears chevrons of its own.
   */
  const pebbleInHand = (): RuneType | null => {
    const v = battle.view
    if (v.drag && v.drag.mode === 'place') return v.drag.type
    if (v.selected >= 0) return v.hand[v.selected] ?? null
    return null
  }

  /** Where inside its tile a canvas point falls, 0..1 each way. */
  const cellFraction = (col: number, row: number, x: number, y: number): [number, number] => {
    const r = renderer.layout().tileRect(col, row)
    return [r.w > 0 ? (x - r.x) / r.w : 0.5, r.h > 0 ? (y - r.y) / r.h : 0.5]
  }

  const clearHover = (): void => {
    if (!hoverOn) return
    hoverOn = false
    hoverCol = -1
    hoverRow = -1
    hoverDir = null
    hoverType = null
    hoverChosen = false
    battle.setHover(null)
  }

  /**
   * Publish the tile and region under a MOUSE. Called on every mouse move, and
   * silent unless the tile, the region or the rune in hand has actually
   * changed — the renderer reads nothing finer than those three.
   */
  const updateHover = (x: number, y: number): void => {
    const type = pebbleInHand()
    if (!type) { clearHover(); return }
    const hit = renderer.hitTest(x, y)
    if (!hit || hit.kind !== 'tile') { clearHover(); return }
    const [fx, fy] = cellFraction(hit.col, hit.row, x, y)
    const dir = dirFromCellPoint(type, fx, fy)
    // Crossing the dead zone changes what the compass says WITHOUT changing
    // the region, so it has to be part of the comparison — otherwise the
    // renderer would go on showing a facing as chosen after the pointer had
    // drifted back into the middle.
    const chosen = isAimChosen(fx, fy)
    if (hoverOn && hit.col === hoverCol && hit.row === hoverRow
      && dir === hoverDir && type === hoverType && chosen === hoverChosen) return
    hoverOn = true
    hoverCol = hit.col
    hoverRow = hit.row
    hoverDir = dir
    hoverType = type
    hoverChosen = chosen
    hoverCell.col = hit.col
    hoverCell.row = hit.row
    battle.setHover(hoverCell, fx, fy)
  }

  /** The rune a key would aim right now: carried, in its window, or selected. */
  const aimedType = (): RuneType | null => {
    const v = battle.view
    if (v.drag) return v.drag.type
    if (v.lock) return v.lock.type
    if (v.selected >= 0) return v.hand[v.selected] ?? null
    return null
  }

  const onDown = (e: PointerEvent): void => {
    if (pointerId !== null) return
    // In a portal iframe the frame does not hold keyboard focus on load; claim
    // it, and stop the browser from starting a scroll or a text selection.
    try { window.focus() } catch { /* a cross-origin parent may refuse */ }
    e.preventDefault()
    const [x, y] = local(e)
    pointerId = e.pointerId
    downX = x
    downY = y
    downAt = e.timeStamp
    downTarget = renderer.hitTest(x, y)
    downPrecise = isPrecisePointer(e.pointerType)
    dragging = false
    try { canvas.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    publishMetrics()
    // The correction window: a press anywhere on the canvas is a stroke on the
    // rune just placed — the player is not asked to find the tile again. A
    // press ON a chevron turns the rune that way at once; the stroke that may
    // follow can still turn it again.
    if (battle.view.lock) {
      const chevron = chevronAt(x, y)
      if (chevron) battle.aimKey(chevron)
      if (battle.beginCorrection(x, y)) {
        dragging = true
        return
      }
    }
    if (downTarget && downTarget.kind === 'hand') {
      if (battle.beginDrag(downTarget.index, x, y, downPrecise)) {
        dragging = true
        playFx('pickup', 0.7)
        battle.updateDrag(x, y, tileUnder(x, y))
        // The compass belongs to the pebble now in hand, not the one before it.
        updateHover(x, y)
      }
    }
  }

  const onMove = (e: PointerEvent): void => {
    // A mouse reports its position with nothing pressed, and that is exactly
    // when the compass matters — a pebble selected by a click, the cursor
    // roaming the board. A finger has no such thing, so a touch that is not
    // carrying anything still costs nothing here.
    const precise = isPrecisePointer(e.pointerType)
    const active = pointerId === e.pointerId && dragging
    if (!precise && !active) return
    const [x, y] = local(e)
    // …but a finger DRAGGING is aiming, every millimetre of the way, and the
    // renderer cannot draw the region under the thumb without being told
    // which one it is. The rect maths is only paid on the path that already
    // hit-tests a tile per move.
    updateHover(x, y)
    if (!active) return
    e.preventDefault()
    if (!battle.view.drag) { dragging = false; return }
    // The composable reads the strokes itself; the renderer clicks when the
    // facing changes.
    battle.updateDrag(x, y, tileUnder(x, y))
  }

  /** The pointer left the canvas: there is no tile under it any more. */
  const onLeave = (): void => {
    clearHover()
  }

  const release = (e: PointerEvent, cancelled: boolean): void => {
    if (pointerId !== e.pointerId) return
    const [x, y] = local(e)
    try { canvas.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    pointerId = null
    // A tap: down and up in place, quickly.
    const moved = Math.hypot(x - downX, y - downY)
    const isTap = !cancelled && moved <= TAP_SLOP_PX && e.timeStamp - downAt <= TAP_MAX_MS
    if (dragging) {
      dragging = false
      // Whatever this release turns out to be, the pebble is no longer being
      // carried over the tile the compass was drawn on.
      clearHover()
      // A tap on a hand pebble is a SELECTION, not a drag that went nowhere:
      // the pebble is put back and picked as the one the next tapped tile gets.
      const drag = battle.view.drag
      if (isTap && downTarget && downTarget.kind === 'hand' && drag && drag.mode === 'place') {
        battle.endDrag(false)
        battle.selectHand(downTarget.index)
        return
      }
      if (!cancelled) battle.updateDrag(x, y, tileUnder(x, y))
      // The composable decides what a release means (a placement, a flick, a
      // cancel, the end of a correction stroke); a pointercancel is the one
      // case that is never a placement.
      battle.endDrag(!cancelled)
      return
    }
    if (!isTap) return
    const up = renderer.hitTest(x, y)
    if (downTarget && downTarget.kind === 'reroll' && up && up.kind === 'reroll') {
      const before = battle.view.rerollsLeft
      battle.reroll()
      if (battle.view.rerollsLeft !== before) playFx('reroll', 0.8)
      else playFx('uiReject', 0.4)
      return
    }
    if (battle.view.selected < 0) return
    // Tap-to-place, step two: the selected pebble goes onto the tapped tile.
    // A tile that will not take it is not a "somewhere else" — the selection
    // stays, the board says no.
    if (up && up.kind === 'tile') {
      // A MOUSE clicked inside one of the tile's regions, and the player could
      // see which before they clicked — so the placement is already aimed and
      // needs no correction window. A finger gets the default facing and the
      // window, exactly as before: it cannot see what it is covering.
      const type = pebbleInHand()
      const cell = { col: up.col, row: up.row }
      let placed: boolean
      const [fx, fy] = downPrecise ? cellFraction(up.col, up.row, x, y) : [0.5, 0.5]
      // A click in the MIDDLE chose nothing. The centre is where a tile is
      // clicked by default, and where the pointer sits when the player did
      // not care which way the rune faced — so it must not overrule a facing
      // they had already set with a key, and it still earns the window.
      if (downPrecise && type && isAimChosen(fx, fy)) {
        placed = battle.placeSelected(cell, dirFromCellPoint(type, fx, fy))
      } else {
        placed = battle.placeSelected(cell)
      }
      if (!placed) playFx('uiReject', 0.4)
      else clearHover()
      return
    }
    // A tap anywhere else lets the selection go.
    clearHover()
    battle.selectHand(-1)
  }

  const onUp = (e: PointerEvent): void => release(e, false)
  const onCancel = (e: PointerEvent): void => release(e, true)
  const onBlur = (): void => {
    clearHover()
    if (pointerId === null) return
    pointerId = null
    if (dragging) { dragging = false; battle.endDrag(false) }
  }

  const onKey = (e: KeyboardEvent): void => {
    // Held keys repeat; a facing is a facing. Modifier combos are the cheats'
    // (and the browser's), a text field is the player typing their name, and
    // a modal has the keyboard for itself.
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
    if (isTyping(e.target) || isAnyModalOpen.value) return
    const type = aimedType()
    if (!type) return
    const dir = keyToDir(e.key, type)
    if (!dir) return
    if (battle.aimKey(dir)) e.preventDefault()
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  canvas.addEventListener('pointerleave', onLeave)
  window.addEventListener('blur', onBlur)
  window.addEventListener('keydown', onKey)
  publishMetrics()

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).__arena = {
      layout: () => renderer.layout(),
      hitTest: (x: number, y: number) => renderer.hitTest(x, y)
    }
  }

  return (): void => {
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onCancel)
    canvas.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('blur', onBlur)
    window.removeEventListener('keydown', onKey)
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      delete (window as unknown as Record<string, unknown>).__arena
    }
  }
}
