import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nodeId } from '@/game/campaign'
import { RUNE_TYPES } from '@/game/rules'

/**
 * ─── The next rune, as a promise ────────────────────────────────────────────
 *
 * `nextRuneUnlock` is what the teaser on the result screen and the campaign map
 * read: the next node that will hand over a rune the player does not own yet.
 *
 * The rule with teeth is that it scans forward from the best node CLEARED, not
 * from the node being played. A chest pays once (`markNodeCleared`'s `first`),
 * so a node behind the player can never hand anything over again — a teaser
 * pointing at one would promise a reward that will never arrive.
 *
 * Driven through the real save blob rather than by poking the refs, so what is
 * under test is the thing the app actually builds on boot.
 */

let lastState: typeof import('@/use/useGlyphyxState') | null = null

const load = async (blob: Record<string, unknown> = {}) => {
  // Drain the previous module instance's persist timer — see campaign.test.ts.
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  const campaign = await import('@/use/useCampaign')
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  return campaign
}

/**
 * The whole roster, derived rather than typed out: a tenth rune must break the
 * "nothing left to promise" case loudly rather than leave it quietly asserting
 * something weaker than its name.
 */
const EVERY_RUNE = [...RUNE_TYPES]
/** The chapter-1 roster: what a player holds the moment the tutorial is behind them. */
const AFTER_CHAPTER_ONE = ['melee', 'archer', 'mage', 'defense', 'support']

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('the next rune unlock', () => {
  it('points a brand-new player at 1-1 and the bow', async () => {
    const c = await load()
    expect(c.bestNode.value).toBe(0)
    expect(c.nextRuneUnlock.value).toEqual({ nodeId: 1, chapter: 1, index: 1, rune: 'archer' })
  })

  it('points a player who has finished the tutorial at Stage 2-1 and the axe', async () => {
    const c = await load({ gx_best_node: 8, gx_node: 9, gx_unlocked_runes: AFTER_CHAPTER_ONE })
    expect(c.nextRuneUnlock.value).toEqual({ nodeId: nodeId(2, 1), chapter: 2, index: 1, rune: 'cleave' })
  })

  it('skips the node it has already been paid for, and names the one after', async () => {
    // 2-1 is cleared and the axe is in hand; the promise moves on to 2-5.
    const c = await load({
      gx_best_node: nodeId(2, 1),
      // Replaying the node they just cleared: the scan must ignore where they
      // ARE and start after the best node they have CLEARED.
      gx_node: nodeId(2, 1),
      gx_unlocked_runes: [...AFTER_CHAPTER_ONE, 'cleave']
    })
    expect(c.currentNode.value).toBe(nodeId(2, 1))
    expect(c.nextRuneUnlock.value).toEqual({ nodeId: nodeId(2, 5), chapter: 2, index: 5, rune: 'roller' })
  })

  it('names the artillery once the boulder is in hand', async () => {
    const c = await load({
      gx_best_node: nodeId(2, 5),
      gx_unlocked_runes: [...AFTER_CHAPTER_ONE, 'cleave', 'roller']
    })
    expect(c.nextRuneUnlock.value).toEqual({ nodeId: nodeId(3, 1), chapter: 3, index: 1, rune: 'bombard' })
  })

  it('promises nothing to a player who holds the whole roster', async () => {
    const c = await load({ gx_best_node: nodeId(4, 1), gx_unlocked_runes: EVERY_RUNE })
    expect(c.nextRuneUnlock.value).toBeNull()
  })

  it('promises nothing when every rune node is behind the player', async () => {
    // A save that lost its roster: the sword is restored, but the nodes that
    // hand the rest over are all cleared, so there is nothing honest to show.
    const c = await load({ gx_best_node: nodeId(5, 1), gx_unlocked_runes: ['melee'] })
    expect(c.unlockedRunes.value).toEqual(['melee'])
    expect(c.nextRuneUnlock.value).toBeNull()
  })

  it('terminates far past the end of the handouts', async () => {
    const c = await load({ gx_best_node: 4000, gx_unlocked_runes: ['melee'] })
    expect(c.nextRuneUnlock.value).toBeNull()
  })

  it('re-reads when a cleared node hands the rune over', async () => {
    const c = await load({ gx_best_node: 8, gx_node: 9, gx_unlocked_runes: AFTER_CHAPTER_ONE })
    expect(c.nextRuneUnlock.value?.rune).toBe('cleave')
    // Winning 2-1 banks the axe; the computed must move on by itself.
    const outcome = c.markNodeCleared(nodeId(2, 1))
    expect(outcome.newRune).toBe('cleave')
    expect(c.nextRuneUnlock.value).toEqual({ nodeId: nodeId(2, 5), chapter: 2, index: 5, rune: 'roller' })
  })

  it('is on the composable as well as the module', async () => {
    const c = await load({ gx_best_node: 8, gx_unlocked_runes: AFTER_CHAPTER_ONE })
    expect(c.default().nextRuneUnlock.value).toEqual(c.nextRuneUnlock.value)
  })
})
