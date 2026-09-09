import { expect, type Page } from '@playwright/test'

/**
 * Shared helpers for the e2e specs.
 *
 * Everything goes through the two dev seams the scene publishes:
 *   `window.__glyphyx` — `{ battle, campaign, economy, layout }` (reactive refs
 *                        are unwrapped with `.value` inside `page.evaluate`)
 *   `window.__arena`   — `{ layout, hitTest }` from the canvas renderer
 */

export interface TileRect { x: number; y: number; w: number; h: number }

/** Wait until the scene has booted: the seam exists and a match is active. */
export const waitForGame = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => {
    const g = (window as any).__glyphyx
    return !!g && !!g.battle && g.battle.matchActive.value === true && !!(window as any).__arena
  }, null, { timeout: 30_000 })
  // The splash fades over ~0.5 s; wait for it to be gone so clicks land.
  await page.waitForFunction(() => !document.getElementById('static-splash'))
  // …and the Vue splash behind it (the logo progress backdrop), which still
  // covers the canvas for a moment after the static one is gone.
  await page.waitForFunction(() => !document.querySelector('.splash-backdrop'))
  // The stage banner plays for the first second of a match; a press during it
  // races the HUD measuring its insets. Every spec starts after it has gone.
  await page.waitForFunction(() => !document.querySelector('.turn-banner'), null, { timeout: 8_000 }).catch(() => {})
  await page.waitForTimeout(150)
}

export const currentNode = (page: Page): Promise<number> =>
  page.evaluate(() => (window as any).__glyphyx.campaign.currentNode.value as number)

export const coins = (page: Page): Promise<number> =>
  page.evaluate(() => (window as any).__glyphyx.economy.coins.value as number)

export const phase = (page: Page): Promise<string> =>
  page.evaluate(() => (window as any).__glyphyx.battle.phase.value as string)

export const hand = (page: Page): Promise<string[]> =>
  page.evaluate(() => (window as any).__glyphyx.battle.view.hand.slice() as string[])

/** Canvas layout rects, in CSS px relative to the viewport (the canvas fills it). */
export const layout = async (page: Page) => page.evaluate(() => {
  const l = (window as any).__arena.layout()
  const tiles: TileRect[][] = []
  for (let row = 0; row < 4; row++) {
    tiles.push([])
    for (let col = 0; col < 4; col++) tiles[row]!.push(l.tileRect(col, row))
  }
  return {
    board: l.board as TileRect,
    tile: l.tile as number,
    tiles,
    hand: l.hand as TileRect[],
    reroll: l.reroll as TileRect,
    swipeThreshold: l.swipeThreshold as number
  }
})

export const center = (r: TileRect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })

/** A tap: down and up in place, quickly — selects a hand pebble, places a selected one, hits a chevron. */
export const tapAt = async (page: Page, p: { x: number; y: number }): Promise<void> => {
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.waitForTimeout(60)
  await page.mouse.up()
}

/**
 * A correction stroke inside the lock window: press ANYWHERE (here: the
 * reroll chip, well away from the board) and flick `dir`. The battle reads the
 * stroke, not the place it started.
 */
export const correctionStroke = async (page: Page, dir: 'up' | 'down' | 'left' | 'right'): Promise<void> => {
  const l = await layout(page)
  const from = center(l.reroll)
  const d = Math.max(24, l.swipeThreshold * 1.4)
  const dx = dir === 'left' ? -d : dir === 'right' ? d : 0
  const dy = dir === 'up' ? -d : dir === 'down' ? d : 0
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.waitForTimeout(30)
  for (let i = 1; i <= 4; i++) await page.mouse.move(from.x + dx * (i / 4), from.y + dy * (i / 4))
  await page.waitForTimeout(40)
  await page.mouse.up()
}

/** The tappable facing chevron for `dir` around the tile (col, row) — mirrors `LOCK_CHEVRON_TILES`. */
export const chevronPoint = (l: Awaited<ReturnType<typeof layout>>, col: number, row: number, dir: 'up' | 'down' | 'left' | 'right') => {
  const c = center(l.tiles[row]![col]!)
  const k = 0.78 * l.tile
  return { x: c.x + (dir === 'left' ? -k : dir === 'right' ? k : 0), y: c.y + (dir === 'up' ? -k : dir === 'down' ? k : 0) }
}

/**
 * The whole gesture the game is built on: pick a hand slot up, drag it onto a
 * tile, swipe a direction, release. Uses real mouse events on the canvas so
 * the pointer state machine is exercised end to end.
 */
export const dragRuneToTile = async (
  page: Page, handIndex: number, col: number, row: number,
  dir: 'up' | 'down' | 'left' | 'right' | 'none' = 'up'
): Promise<void> => {
  const l = await layout(page)
  const from = center(l.hand[handIndex]!)
  const to = center(l.tiles[row]![col]!)
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  // A few intermediate moves so `pointermove` fires and the drag hovers.
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(from.x + (to.x - from.x) * (i / 6), from.y + (to.y - from.y) * (i / 6))
  }
  // Rest on the tile: the pebble LANDS once the finger has been inside the
  // tile for AIM_LAND_MS (60 ms); only then do strokes aim instead of travel,
  // so a drag to the top row does not lock onto the first tile it crosses.
  await page.waitForTimeout(170)
  if (dir !== 'none') {
    const d = l.swipeThreshold * 1.6
    const dx = dir === 'left' ? -d : dir === 'right' ? d : 0
    const dy = dir === 'up' ? -d : dir === 'down' ? d : 0
    for (let i = 1; i <= 4; i++) await page.mouse.move(to.x + dx * (i / 4), to.y + dy * (i / 4))
    await page.waitForTimeout(40)
  }
  await page.mouse.up()
}

/** Wait until the resolution has played and the game is back in planning or ended. */
export const waitForTurnEnd = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => {
    const b = (window as any).__glyphyx.battle
    return b.phase.value === 'planning' || b.phase.value === 'ended'
  }, null, { timeout: 15_000 })
}

export const expectNoConsoleErrors = (errors: string[]): void => {
  const real = errors.filter((e) => !/favicon|ERR_BLOCKED_BY_CLIENT|net::ERR_|CORS policy/.test(e))
  expect(real, `console errors:\n${real.join('\n')}`).toEqual([])
}

export const collectConsoleErrors = (page: Page): string[] => {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  return errors
}
