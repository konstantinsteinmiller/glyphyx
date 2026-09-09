import { expect, test, type Page } from '@playwright/test'
import { layout, waitForGame, type TileRect } from './helpers'

/**
 * ─── Responsive layout ──────────────────────────────────────────────────────
 *
 * Runs in three projects (phone portrait, phone landscape, desktop) and on the
 * 320×658 floor: the board fits inside the viewport, the hand never overlaps
 * it, every HUD control is on screen and clear of the board, and the page
 * never scrolls sideways.
 */

const overlaps = (a: TileRect, b: TileRect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

const inside = (r: TileRect, w: number, h: number): boolean =>
  r.x >= -0.5 && r.y >= -0.5 && r.x + r.w <= w + 0.5 && r.y + r.h <= h + 0.5

const checkLayout = async (page: Page): Promise<void> => {
  const vp = page.viewportSize()!
  const l = await layout(page)

  // The board is on screen and its tiles are tappable.
  expect(inside(l.board, vp.width, vp.height)).toBe(true)
  expect(l.tile).toBeGreaterThanOrEqual(40)

  // The hand is on screen, tappable, and never under the board.
  expect(l.hand.length).toBe(3)
  for (const slot of l.hand) {
    expect(inside(slot, vp.width, vp.height)).toBe(true)
    expect(Math.min(slot.w, slot.h)).toBeGreaterThanOrEqual(44)
    expect(overlaps(slot, l.board)).toBe(false)
  }
  expect(overlaps(l.reroll, l.board)).toBe(false)

  // Every HUD control is visible and clear of the board.
  const controls = page.locator('button[aria-label]:visible')
  const n = await controls.count()
  expect(n).toBeGreaterThanOrEqual(2)
  for (let i = 0; i < n; i++) {
    const bb = await controls.nth(i).boundingBox()
    expect(bb, `control ${i} has a box`).not.toBeNull()
    if (!bb) continue
    // Playwright boxes are {width, height}; the layout rects are {w, h}.
    const box: TileRect = { x: bb.x, y: bb.y, w: bb.width, h: bb.height }
    expect(inside(box, vp.width, vp.height), `control ${i} inside viewport`).toBe(true)
    expect(overlaps(box, l.board), `control ${i} does not overlap the board`).toBe(false)
  }

  // No horizontal scroll, ever.
  const scroll = await page.evaluate(() => ({
    w: document.documentElement.scrollWidth, iw: window.innerWidth
  }))
  expect(scroll.w).toBeLessThanOrEqual(scroll.iw)
}

test.describe('layout', () => {
  test('fits the board, hand and HUD in the viewport', async ({ page }, testInfo) => {
    await page.goto('/')
    await waitForGame(page)
    await checkLayout(page)
    await page.screenshot({ path: testInfo.outputPath(`layout-${testInfo.project.name}.png`) })
  })

  test('survives the 320×658 floor', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone-portrait', 'one project is enough for the floor')
    await page.setViewportSize({ width: 320, height: 658 })
    await page.goto('/')
    await waitForGame(page)
    await checkLayout(page)
    await page.screenshot({ path: testInfo.outputPath('layout-320x658.png') })
  })

  test('re-lays out on an orientation change', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone-portrait', 'one project is enough')
    await page.goto('/')
    await waitForGame(page)
    const before = await layout(page)
    await page.setViewportSize({ width: 844, height: 390 })
    await page.waitForTimeout(400)
    const after = await layout(page)
    expect(after.board.w).not.toBe(before.board.w)
    await checkLayout(page)
  })
})
