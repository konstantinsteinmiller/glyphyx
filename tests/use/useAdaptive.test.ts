import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * ─── The adaptive relief's bookkeeping ──────────────────────────────────────
 *
 * The two numbers that outlive a match — losses per node, losses in a row —
 * live in the one `glyphyx_state` blob, and the per-turn input is assembled
 * from the live match. The rule itself is `@/game/adaptive`'s and is tested
 * there.
 */

let lastState: typeof import('@/use/useGlyphyxState') | null = null

const load = async (blob: Record<string, unknown> = {}) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  const adaptive = await import('@/use/useAdaptive')
  const state = await import('@/use/useGlyphyxState')
  const match = await import('@/game/match')
  const campaign = await import('@/game/campaign')
  lastState = state
  return { ...adaptive, state, match, campaign }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('losses per node and in a row', () => {
  it('starts at zero for a fresh player', async () => {
    const { nodeFails, lossStreak } = await load()
    expect(nodeFails(7)).toBe(0)
    expect(lossStreak()).toBe(0)
  })

  it('counts a loss on the node and on the streak, and a win wipes both', async () => {
    const { nodeFails, lossStreak, recordResult, state } = await load()
    recordResult(7, false)
    recordResult(7, false)
    recordResult(8, false)
    expect(nodeFails(7)).toBe(2)
    expect(nodeFails(8)).toBe(1)
    expect(lossStreak()).toBe(3)
    // A win on 7 clears 7 and the streak; 8's count is its own.
    recordResult(7, true)
    expect(nodeFails(7)).toBe(0)
    expect(nodeFails(8)).toBe(1)
    expect(lossStreak()).toBe(0)
    // …and it all went through the one blob, under the catalogued fields.
    state.flushPersist()
    const blob = JSON.parse(localStorage.getItem('glyphyx_state')!)
    expect(blob.gx_failed_nodes).toEqual({ '8': 1 })
    expect(blob.gx_loss_streak).toBe(0)
  })

  it('reads what a previous session persisted, and shrugs at garbage', async () => {
    const a = await load({ gx_failed_nodes: { '7': 2 }, gx_loss_streak: 4 })
    expect(a.nodeFails(7)).toBe(2)
    expect(a.lossStreak()).toBe(4)
    const b = await load({ gx_failed_nodes: [1, 2], gx_loss_streak: 'many' })
    expect(b.nodeFails(7)).toBe(0)
    expect(b.lossStreak()).toBe(0)
    // Garbage does not stop a loss from being counted from zero.
    b.recordResult(7, false)
    expect(b.nodeFails(7)).toBe(1)
    expect(b.lossStreak()).toBe(1)
  })
})

describe('the per-turn input', () => {
  it('is assembled from the live match and the persisted numbers', async () => {
    const { buildHandicapInput, match, campaign } = await load({ gx_failed_nodes: { '7': 1 }, gx_loss_streak: 2, gx_user_difficulty: 'easy' })
    const config = campaign.nodeConfig(7, 'easy')
    const s = match.createMatch(config, ['melee', 'archer'], 42, 1000)
    const input = buildHandicapInput(s, { playerPassedLastTurn: true, passesThisMatch: 1 })
    expect(input).toMatchObject({
      difficulty: 'easy', nodeFails: 1, lossStreak: 2,
      playerPassedLastTurn: true, passesThisMatch: 1,
      turn: 1, suddenDeath: false, tutorial: false
    })
    // Nobody has placed: the two sides hold their home rows.
    expect(input.tileDeficit).toBe(0)
    expect(input.runeDeficit).toBe(0)
    // The match's age, against the clock it is handed (the real one by default).
    expect(buildHandicapInput(s, { playerPassedLastTurn: false, passesThisMatch: 0 }, 76_000).matchElapsedMs).toBe(75_000)
    expect(buildHandicapInput(s, { playerPassedLastTurn: false, passesThisMatch: 0 }, 500).matchElapsedMs).toBe(0)
    expect(input.matchElapsedMs).toBeGreaterThanOrEqual(0)
  })

  it('flags a tutorial node so the rule leaves it alone', async () => {
    const { buildHandicapInput, handicapFor, match, campaign } = await load({ gx_failed_nodes: { '1': 5 }, gx_loss_streak: 5 })
    const s = match.createMatch(campaign.nodeConfig(1, 'medium'), ['melee'], 1, 0)
    const relief = { playerPassedLastTurn: true, passesThisMatch: 3 }
    expect(buildHandicapInput(s, relief).tutorial).toBe(true)
    expect(handicapFor(s, relief)).toEqual({ skipChance: 0, extraRandom: 0, atkMul: 1, timerMs: 5000 })
  })

  it('measures the deficits on the board as it stands', async () => {
    const { buildHandicapInput, match, campaign } = await load()
    const s = match.createMatch(campaign.nodeConfig(1, 'medium'), ['melee'], 1, 0)
    // 1-1: the skeleton on (1,1) gives the enemy five tiles and one rune to
    // the player's four and none.
    const input = buildHandicapInput(s, { playerPassedLastTurn: false, passesThisMatch: 0 })
    expect(input.tileDeficit).toBe(1)
    expect(input.runeDeficit).toBe(1)
  })
})
