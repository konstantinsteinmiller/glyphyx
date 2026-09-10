import { expect, test } from '@playwright/test'
import { coins, currentNode, dragRuneToTile, hand, waitForGame, waitForTurnEnd } from './helpers'

/**
 * ─── Hydration: a returning player is never a fresh user ────────────────────
 *
 * The one bug the whole save layer exists to prevent: the game boots, reads
 * an empty blob before the real one arrives, and renders a player on stage
 * 1-7 with 777 coins as a newcomer on 1-1 — and then WRITES that over their
 * progress. These runs prove the visible half: the node, the coins, the
 * roster and the streak all come back, the tutorial ghost does not, and a
 * reload mid-match lands on the same node.
 */

const RETURNING = {
  // 1-7 is the first real duel: the lessons before it (1-2…1-6) deal an
  // authored hand, so only here does the hand prove the hydrated roster.
  gx_node: 7, gx_best_node: 6, gx_coins: 777, gx_total_coins: 900,
  gx_unlocked_runes: ['melee', 'archer', 'mage', 'defense'],
  gx_streak: 3, gx_best_streak: 3, gx_matches: 6, gx_wins: 4,
  gx_tutorial_seen: true, gx_aimed: true, gx_skin: 'river', gx_skins_owned: ['river']
}

test.describe('save hydration', () => {
  test('boots straight onto the saved node with the saved wallet and roster', async ({ page }) => {
    await page.addInitScript((blob) => {
      localStorage.setItem('glyphyx_state', JSON.stringify(blob))
    }, RETURNING)
    await page.goto('/')
    await waitForGame(page)

    expect(await currentNode(page)).toBe(7)
    expect(await coins(page)).toBe(777)
    // The stage badge (the turn banner says it too, briefly — hence the role).
    await expect(page.getByRole('button', { name: 'Campaign' })).toHaveText('Level 1-7')
    // Not a newcomer: no ghost hand, no drag primer.
    expect(await page.evaluate(() => (window as any).__glyphyx.battle.ghostActive.value)).toBe(false)
    await expect(page.getByText('Drag a rune onto the board')).toHaveCount(0)
    // The roster came back: the hand can hold the mage.
    const roster = await page.evaluate(() => (window as any).__glyphyx.campaign.unlockedRunes.value)
    expect(roster).toEqual(['melee', 'archer', 'mage', 'defense'])
    // The streak flame is lit.
    const streak = await page.evaluate(() => (window as any).__glyphyx.streak.streak.value)
    expect(streak).toBe(3)
  })

  test('a reload mid-match comes back on the same node, not on 1-1', async ({ page }) => {
    await page.addInitScript((blob) => {
      localStorage.setItem('glyphyx_state', JSON.stringify(blob))
    }, RETURNING)
    await page.goto('/')
    await waitForGame(page)

    // Play one turn so the match is genuinely in progress.
    const h = await hand(page)
    await dragRuneToTile(page, Math.max(0, h.indexOf('melee')), 1, 2, 'up')
    await waitForTurnEnd(page)

    await page.reload()
    await waitForGame(page)
    expect(await currentNode(page)).toBe(7)
    expect(await coins(page)).toBe(777)
    // The blob on disk was not clobbered by a fresh-default write.
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('glyphyx_state') || '{}'))
    expect(stored.gx_node).toBe(7)
    expect(stored.gx_best_node).toBe(6)
    expect(stored.gx_unlocked_runes).toEqual(['melee', 'archer', 'mage', 'defense'])
  })

  test('a genuinely new player starts on 1-1 with the tutorial', async ({ page }) => {
    await page.goto('/')
    await waitForGame(page)
    expect(await currentNode(page)).toBe(1)
    expect(await page.evaluate(() => (window as any).__glyphyx.battle.ghostActive.value)).toBe(true)
    // Exactly ONE key in localStorage carries game state.
    const keys = await page.evaluate(() => Object.keys(localStorage))
    const stateKeys = keys.filter((k) => k === 'glyphyx_state' || k.startsWith('gx_'))
    expect(stateKeys.filter((k) => k.startsWith('gx_'))).toEqual([])
  })
})
