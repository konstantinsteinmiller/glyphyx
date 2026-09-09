import { expect, test } from '@playwright/test'
import {
  center, chevronPoint, coins, collectConsoleErrors, correctionStroke, currentNode, dragRuneToTile,
  expectNoConsoleErrors, hand, layout, phase, tapAt, waitForGame, waitForTurnEnd
} from './helpers'

/**
 * ─── The first fifteen seconds ──────────────────────────────────────────────
 *
 * A brand-new player boots straight into 1-1, is shown the ghost hand, drops
 * the sword beside the skeleton, turns it to face left inside the correction
 * window (the lesson holds the window until they do), and wins in one
 * resolution. The chest opens on its own step, the bow is unlocked, the loot
 * stays until they continue, and 1-2 begins. Then one bow shot on 1-2 proves
 * the archer shoots over a friendly stone.
 *
 * Everything here is driven with REAL pointer events on the canvas — the
 * gesture is the game, and a unit test cannot prove it.
 */

test.describe('onboarding flow', () => {
  test('a new player wins 1-1 by dropping the sword and turning it in the held window, then lands on 1-2', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto('/')
    await waitForGame(page)

    expect(await currentNode(page)).toBe(1)
    expect(await phase(page)).toBe('planning')
    const startHand = await hand(page)
    expect(startHand.every((t) => t === 'melee')).toBe(true)

    // The ghost hand is up for a player who has never placed a rune.
    expect(await page.evaluate(() => (window as any).__glyphyx.battle.ghostActive.value)).toBe(true)
    // …and so is the control hint, in words.
    await expect(page.getByText('Drag a rune onto the board')).toBeVisible()

    const coinsBefore = await coins(page)

    // The lesson: drop the sword on (1,2) WITHOUT aiming — it lands facing up,
    // at nothing, and the window holds until it is turned toward the skeleton
    // on (0,2). The ghost hand shows the press-and-flick meanwhile.
    await dragRuneToTile(page, 0, 1, 2, 'none')
    const lockState = () => page.evaluate(() => {
      const v = (window as any).__glyphyx.battle.view
      return v.lock ? { held: v.lock.held, dir: v.lock.dir } : null
    })
    await expect.poll(lockState).toEqual({ held: true, dir: 'up' })
    expect(await page.evaluate(() => (window as any).__glyphyx.battle.view.ghost?.mode ?? null)).toBe('reaim')
    await page.waitForTimeout(400)
    expect(await lockState()).toEqual({ held: true, dir: 'up' })
    // Turn it left: the arrow key on a keyboard, a flick anywhere on touch.
    if (test.info().project.name === 'desktop') await page.keyboard.press('ArrowLeft')
    else await correctionStroke(page, 'left')
    await expect.poll(() => page.evaluate(() => (window as any).__glyphyx.battle.view.playerMove?.dir ?? null)).toBe('left')
    await expect.poll(() => phase(page)).not.toBe('planning')
    await waitForTurnEnd(page)

    // One resolution, one win.
    await expect.poll(() => page.evaluate(() => (window as any).__glyphyx.battle.result.value?.won ?? null))
      .toBe(true)

    // The chest opens on its own reward step (no result overlay on a lesson): tap it, the bow is revealed.
    const chest = page.getByRole('button', { name: /chest/i })
    await expect(chest).toBeVisible()
    await chest.click({ force: true })
    await expect(page.getByText('Unlocked!')).toBeVisible()
    await expect(page.getByText('Bow', { exact: true })).toBeVisible()

    // Coins were banked (chest + win).
    await expect.poll(() => coins(page)).toBeGreaterThan(coinsBefore)

    // The loot STAYS on screen — nothing moves on by itself for a good while
    // (the saved progress pointer already reads 1-2; the SCREEN must not).
    await page.waitForTimeout(1600)
    await expect(page.getByText('Bow', { exact: true })).toBeVisible()
    const shown = () => page.evaluate(() => {
      const g = (window as any).__glyphyx
      return { chest: g.overlays.showChest.value as boolean, node: g.battle.node.value?.id as number, live: g.battle.matchActive.value as boolean }
    })
    expect(await shown()).toEqual({ chest: true, node: 1, live: false })

    // A tap anywhere on the reward step continues: 1-2 starts, no result screen.
    const vp = page.viewportSize()!
    await page.mouse.click(vp.width / 2, vp.height * 0.94)
    await expect.poll(() => currentNode(page), { timeout: 15_000 }).toBe(2)
    await expect.poll(async () => (await shown()).chest).toBe(false)
    await expect.poll(() => page.evaluate(() => (window as any).__glyphyx.battle.matchActive.value)).toBe(true)
    // The hand now draws from the widened deck.
    await expect.poll(async () => (await hand(page)).includes('archer')).toBe(true)

    expectNoConsoleErrors(errors)
  })

  test('on 1-2 the bow shoots over your own sword: the near skeleton falls, the far archer stands', async ({ page }) => {
    await page.addInitScript(() => {
      // A player who has finished 1-1: node 2, bow unlocked, tutorial seen.
      localStorage.setItem('glyphyx_state', JSON.stringify({
        gx_node: 2, gx_best_node: 1, gx_unlocked_runes: ['melee', 'archer'],
        gx_tutorial_seen: true, gx_coins: 15, gx_matches: 1, gx_wins: 1
      }))
    })
    await page.goto('/')
    await waitForGame(page)
    expect(await currentNode(page)).toBe(2)

    const enemyRunes = () => page.evaluate(() => {
      const b = (window as any).__glyphyx.battle.view.board
      return Object.values(b.runes).filter((r: any) => r.side === 'enemy').length
    })
    expect(await enemyRunes()).toBe(2)

    const h = await hand(page)
    const bow = h.indexOf('archer')
    expect(bow).toBeGreaterThanOrEqual(0)
    // The lesson: your sword already stands at (1,2) under a 3-HP skeleton at
    // (1,1), with a skeleton archer behind it at (1,0). The bow goes BEHIND the
    // sword at (1,3) and shoots over it — an arrow only counts enemy stones on
    // its path — so the skeleton takes the arrow AND the sword's blow and falls;
    // the archer two tiles further stands (a Lv 1 bow reaches exactly one tile
    // past the one it skips).
    await dragRuneToTile(page, bow, 1, 3, 'up')
    await waitForTurnEnd(page)

    await expect.poll(enemyRunes).toBe(1)
    const survivor = await page.evaluate(() => {
      const b = (window as any).__glyphyx.battle.view.board
      const r: any = Object.values(b.runes).find((x: any) => x.side === 'enemy')
      return r ? { col: r.col, row: r.row, type: r.type } : null
    })
    expect(survivor).toEqual({ col: 1, row: 0, type: 'archer' })
  })
})

test.describe('tap-to-place and the facing chevrons', () => {
  test('tap a pebble, tap a tile: the longer window opens and a chevron re-aims it', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('glyphyx_state', JSON.stringify({
        gx_node: 7, gx_best_node: 6, gx_unlocked_runes: ['melee', 'archer', 'mage', 'defense', 'support'],
        gx_tutorial_seen: true, gx_aimed: true, gx_coins: 60, gx_matches: 6, gx_wins: 6, gx_results_seen: 6,
        gx_goal_seen: true
      }))
    })
    await page.goto('/')
    await waitForGame(page)
    expect(await currentNode(page)).toBe(7)

    // A sword or a bow in hand (the deal is random; rerolls are free here).
    let slot = -1
    for (let i = 0; i < 3 && slot < 0; i++) {
      slot = (await hand(page)).findIndex((t) => t === 'melee' || t === 'archer')
      if (slot < 0) await page.evaluate(() => (window as any).__glyphyx.battle.reroll())
    }
    expect(slot).toBeGreaterThanOrEqual(0)

    const l = await layout(page)
    await tapAt(page, center(l.hand[slot]!))
    await expect.poll(() => page.evaluate(() => (window as any).__glyphyx.battle.view.selected as number)).toBe(slot)
    await expect(page.getByText(/tap a tile|click a tile/i)).toBeVisible()

    // On a keyboard the facing can be chosen before the tile.
    const desktop = test.info().project.name === 'desktop'
    if (desktop) await page.keyboard.press('ArrowRight')

    await tapAt(page, center(l.tiles[2]![1]!))
    const lock = await page.evaluate(() => {
      const v = (window as any).__glyphyx.battle.view
      return v.lock ? { source: v.lock.source, total: v.lock.totalMs, dir: v.lock.dir, col: v.lock.cell.col, row: v.lock.cell.row } : null
    })
    expect(lock).toMatchObject({ source: 'tap', total: 2500, col: 1, row: 2 })
    if (desktop) expect(lock!.dir).toBe('right')

    // The left chevron turns it.
    await tapAt(page, chevronPoint(l, 1, 2, 'left'))
    await expect.poll(() => page.evaluate(() => (window as any).__glyphyx.battle.view.playerMove?.dir ?? null)).toBe('left')
    await expect.poll(() => phase(page), { timeout: 8_000 }).not.toBe('planning')
  })
})

test.describe('the goal intro', () => {
  test('the first real conquest match opens with the eight-tiles intro, which holds the clock until it is tapped away', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('glyphyx_state', JSON.stringify({
        gx_node: 7, gx_best_node: 6, gx_unlocked_runes: ['melee', 'archer', 'mage', 'defense', 'support'],
        gx_tutorial_seen: true, gx_aimed: true, gx_coins: 60, gx_matches: 6, gx_wins: 6, gx_results_seen: 6
      }))
    })
    await page.goto('/')
    await waitForGame(page)
    expect(await currentNode(page)).toBe(7)
    // The intro is up: the clock waits for it.
    const paused = () => page.evaluate(() => (window as any).__glyphyx.battle.timerPaused.value as boolean)
    await expect.poll(paused).toBe(true)
    // It plays itself out (or a tap skips it); then the match is live.
    const vp = page.viewportSize()!
    await page.waitForTimeout(600)
    await page.mouse.click(vp.width / 2, vp.height / 2)
    await expect.poll(paused, { timeout: 8_000 }).toBe(false)
    await expect.poll(
      () => page.evaluate(() => JSON.parse(localStorage.getItem('glyphyx_state') || '{}').gx_goal_seen ?? null),
      { timeout: 8_000 }
    ).toBe(true)
  })
})

test.describe('the planning clock', () => {
  test('a real node times out into a pass and keeps the match going', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('glyphyx_state', JSON.stringify({
        // 1-7: the first node with a clock (1-1…1-6 are clockless lessons).
        gx_node: 7, gx_best_node: 6, gx_unlocked_runes: ['melee', 'archer', 'mage', 'defense', 'support'],
        gx_tutorial_seen: true, gx_aimed: true, gx_coins: 60, gx_matches: 3, gx_wins: 3, gx_goal_seen: true
      }))
    })
    await page.goto('/')
    await waitForGame(page)
    expect(await currentNode(page)).toBe(7)
    expect(await page.evaluate(() => (window as any).__glyphyx.battle.timerPaused.value)).toBe(false)

    const turn = () => page.evaluate(() => (window as any).__glyphyx.battle.turn.value as number)
    expect(await turn()).toBe(1)
    // Do nothing: the 5 s window closes, the enemy still moves, turn 2 begins.
    await expect.poll(turn, { timeout: 12_000 }).toBe(2)
    expect(await page.evaluate(() => (window as any).__glyphyx.battle.matchActive.value)).toBe(true)
  })
})
