import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── Campaign progress ──────────────────────────────────────────────────────
 *
 * The two numbers that decide what a player sees on boot — the node they are
 * on and the best they have cleared — and the one rule that makes chests safe:
 * a node pays its chest exactly once, however often it is replayed.
 */

let lastState: typeof import('@/use/useGlyphyxState') | null = null

const load = async (blob: Record<string, unknown> = {}) => {
  // Drain the previous module instance's persist timer — see battle.test.ts.
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  const campaign = await import('@/use/useCampaign')
  const economy = await import('@/use/useEconomy')
  const skins = await import('@/use/useSkins')
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  return { ...campaign, economy: economy.default(), skins, state }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('a fresh player', () => {
  it('starts on node 1 with nothing cleared and only the sword', async () => {
    const c = await load()
    expect(c.currentNode.value).toBe(1)
    expect(c.bestNode.value).toBe(0)
    expect(c.unlockedRunes.value).toEqual(['melee'])
    expect(c.matchesPlayed.value).toBe(0)
    expect(c.wins.value).toBe(0)
  })

  it('may play node 1 and nothing past it', async () => {
    const c = await load()
    expect(c.isNodeUnlocked(1)).toBe(true)
    expect(c.isNodeUnlocked(2)).toBe(false)
    expect(c.isNodeCleared(1)).toBe(false)
  })

  it('hands back the sword even when the blob says otherwise', async () => {
    const c = await load({ gx_unlocked_runes: ['mage', 'bogus', 'archer'] })
    // Sanitised, sword always present, canonical order.
    expect(c.unlockedRunes.value).toEqual(['melee', 'archer', 'mage'])
  })
})

describe('clearing a node', () => {
  it('pays the chest the FIRST time: coins, the rune, the counters, the next node', async () => {
    const c = await load()
    const outcome = c.markNodeCleared(1)
    expect(outcome.first).toBe(true)
    expect(outcome.isRecord).toBe(true)
    expect(outcome.coins).toBe(15)
    expect(outcome.newRune).toBe('archer')
    expect(c.economy.coins.value).toBe(15)
    expect(c.unlockedRunes.value).toEqual(['melee', 'archer'])
    expect(c.bestNode.value).toBe(1)
    expect(c.currentNode.value).toBe(2)
    expect(c.matchesPlayed.value).toBe(1)
    expect(c.wins.value).toBe(1)
    expect(c.isNodeCleared(1)).toBe(true)
    expect(c.isNodeUnlocked(2)).toBe(true)
  })

  it('never pays the same chest twice', async () => {
    const c = await load()
    c.markNodeCleared(1)
    const again = c.markNodeCleared(1)
    expect(again.first).toBe(false)
    expect(again.coins).toBe(0)
    expect(again.newRune).toBeNull()
    expect(c.economy.coins.value).toBe(15)
    expect(c.wins.value).toBe(2)
    // Replaying a cleared node still moves the player on.
    expect(c.currentNode.value).toBe(2)
    expect(c.bestNode.value).toBe(1)
  })

  it('grants a skin when the chest holds one', async () => {
    const c = await load({ gx_best_node: 6, gx_node: 7 })
    const outcome = c.markNodeCleared(7)
    expect(outcome.newSkin).toBe('obsidian')
    expect(c.skins.ownedSkins.value).toContain('obsidian')
  })

  it('persists into the single state blob', async () => {
    const c = await load()
    c.markNodeCleared(1)
    c.state.flushPersist()
    const blob = JSON.parse(localStorage.getItem('glyphyx_state') || '{}')
    expect(blob.gx_best_node).toBe(1)
    expect(blob.gx_node).toBe(2)
    expect(blob.gx_unlocked_runes).toEqual(['melee', 'archer'])
    expect(blob.gx_coins).toBe(15)
    expect(blob.gx_wins).toBe(1)
    expect(blob.gx_matches).toBe(1)
  })
})

describe('losing a node', () => {
  it('counts the match and moves nothing else', async () => {
    const c = await load({ gx_best_node: 3, gx_node: 4 })
    c.markNodeLost(4)
    expect(c.matchesPlayed.value).toBe(1)
    expect(c.wins.value).toBe(0)
    expect(c.currentNode.value).toBe(4)
    expect(c.bestNode.value).toBe(3)
  })
})

describe('setCurrentNode', () => {
  it('clamps to the unlocked frontier', async () => {
    const c = await load({ gx_best_node: 2 })
    c.setCurrentNode(9)
    expect(c.currentNode.value).toBe(3)
    c.setCurrentNode(0)
    expect(c.currentNode.value).toBe(1)
    c.setCurrentNode(2)
    expect(c.currentNode.value).toBe(2)
  })
})

describe('node configs', () => {
  it('are memoised per node', async () => {
    const c = await load()
    expect(c.nodeConfigFor(3)).toBe(c.nodeConfigFor(3))
    expect(c.nodeConfigFor(3).id).toBe(3)
    expect(c.rewardOf(1).unlockRune).toBe('archer')
  })
})

describe('hydration', () => {
  it('re-reads every ref when the save version bumps', async () => {
    const c = await load()
    expect(c.currentNode.value).toBe(1)
    localStorage.setItem('glyphyx_state', JSON.stringify({
      gx_node: 5, gx_best_node: 4, gx_unlocked_runes: ['melee', 'archer', 'mage'], gx_matches: 9, gx_wins: 4
    }))
    c.state.reloadGlyphyxState()
    const { saveDataVersion } = await import('@/use/useSaveStatus')
    saveDataVersion.value++
    await Promise.resolve()
    expect(c.currentNode.value).toBe(5)
    expect(c.bestNode.value).toBe(4)
    expect(c.unlockedRunes.value).toEqual(['melee', 'archer', 'mage'])
    expect(c.matchesPlayed.value).toBe(9)
    expect(c.wins.value).toBe(4)
  })
})
