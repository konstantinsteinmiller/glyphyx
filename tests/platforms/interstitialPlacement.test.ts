import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CLASH_LESSON_NODE, LATE_LESSON_NODES, isLessonNode, nodeId } from '@/game/campaign'

/**
 * WHERE a break may land, as opposed to WHEN one is due (`interstitialPacing`).
 *
 * Both rules pinned here came out of the blind playtests (2026-09-11/12) and
 * until now lived as an expression written inline in `GameScene.vue` with a
 * second copy of it in `CampaignModal.vue` — the placement rule the playtest
 * paid for, in two untested copies. `mayBreakAt` is the single copy; this is
 * the pin.
 *
 * The lesson table is read from `campaign.ts` rather than restated, so a lesson
 * added later is covered by these tests the day it is added.
 */

type Opts = { interstitialReady?: boolean }

const loadGate = async (opts: Opts = {}) => {
  vi.resetModules()
  vi.doMock('@/use/useUser', () => ({ isCrazyWeb: false }))
  vi.doMock('@/use/useMatch', () => ({ isCrazyGamesFullRelease: false }))
  const showMidgameAd = vi.fn(async () => 'shown' as const)
  vi.doMock('@/use/useAds', async () => {
    const { ref } = await import('vue')
    return {
      adProviderName: 'playgama',
      isRewardedReady: ref(true),
      isInterstitialReady: ref(opts.interstitialReady ?? true),
      showRewardedAd: vi.fn(async () => true),
      showMidgameAd
    }
  })
  const mod = await import('@/use/useAdGate')
  mod.__resetInterstitialClock()
  mod.__resetRewardWindow()
  return { ...mod, showMidgameAd }
}

/** What both call sites do: ask the placement first, then the pacing. */
const breakAt = async (
  g: Awaited<ReturnType<typeof loadGate>>,
  beat: Parameters<typeof g.mayBreakAt>[0],
  o: { nodeId: number; won?: boolean }
): Promise<boolean> => (g.mayBreakAt(beat, o) ? g.showPacedInterstitial() : false)

/** The six that open the game, by their global ids. */
const OPENING_LESSONS = [1, 2, 3, 4, 5, 6]
/** The first node that is a real match. */
const FIRST_REAL_NODE = 7

const BEATS = ['matchEnd', 'leavingResult', 'nodeStart'] as const

beforeEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('the tutorial arc is ad-free', () => {
  it('refuses every beat on each of the six opening lessons', async () => {
    const g = await loadGate()
    for (const id of OPENING_LESSONS) {
      expect(isLessonNode(id), `node ${id} should be a lesson`).toBe(true)
      for (const beat of BEATS) {
        expect(g.mayBreakAt(beat, { nodeId: id, won: true }), `${beat} on node ${id}`).toBe(false)
      }
    }
  })

  it('refuses every beat on the LATE lessons too — the clash and the rune lessons', async () => {
    const g = await loadGate()
    const late = [CLASH_LESSON_NODE, ...Object.keys(LATE_LESSON_NODES).map(Number)]
    expect(late.length).toBeGreaterThan(1)
    for (const id of late) {
      expect(isLessonNode(id), `node ${id} should be a lesson`).toBe(true)
      for (const beat of BEATS) {
        expect(g.mayBreakAt(beat, { nodeId: id, won: true }), `${beat} on node ${id}`).toBe(false)
      }
    }
  })

  it('never even ASKS for an ad across the whole opening arc, so the clock stays unseeded', async () => {
    const g = await loadGate()
    // Six lessons, won, each started and then left by the player's own tap.
    // The arc ENDS at 1-6: starting 1-7 is the first real match, and that beat
    // is allowed — it is the seeding opportunity the next test pins.
    for (const id of OPENING_LESSONS) {
      expect(await breakAt(g, 'nodeStart', { nodeId: id })).toBe(false)
      expect(await breakAt(g, 'matchEnd', { nodeId: id, won: true })).toBe(false)
      expect(await breakAt(g, 'leavingResult', { nodeId: id })).toBe(false)
    }
    expect(g.showMidgameAd).not.toHaveBeenCalled()
    // Untouched: `canShowInterstitial` seeds the clock on its first call, and
    // nothing in the arc called it. A lesson must not spend the session's
    // first opportunity on the player's behalf. `msUntilNextInterstitial`
    // returns the pace EXACTLY while unseeded, so this is a clock that has
    // never been read, not one read a millisecond ago.
    expect(g.msUntilNextInterstitial()).toBe(g.INTERSTITIAL_PACE_MS)
  })
})

describe('the first real match, and after', () => {
  it('allows the break on node 7 — and it is the session-seeding one, so nothing plays yet', async () => {
    const g = await loadGate()
    expect(isLessonNode(FIRST_REAL_NODE)).toBe(false)
    expect(g.mayBreakAt('matchEnd', { nodeId: FIRST_REAL_NODE, won: true })).toBe(true)
    expect(await breakAt(g, 'matchEnd', { nodeId: FIRST_REAL_NODE, won: true })).toBe(false)
    expect(g.showMidgameAd).not.toHaveBeenCalled()
  })

  it('fires at the first legal beat past the gap', async () => {
    vi.useFakeTimers()
    const g = await loadGate()
    vi.setSystemTime(new Date(1_000_000_000))
    // Node 7 ends: the opportunity that starts the session clock.
    expect(await breakAt(g, 'matchEnd', { nodeId: FIRST_REAL_NODE, won: true })).toBe(false)
    vi.setSystemTime(new Date(1_000_000_000 + g.INTERSTITIAL_PACE_MS))
    expect(await breakAt(g, 'matchEnd', { nodeId: 8, won: true })).toBe(true)
    expect(g.showMidgameAd).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('still refuses a lesson that comes AFTER the gap has opened', async () => {
    vi.useFakeTimers()
    const g = await loadGate()
    vi.setSystemTime(new Date(1_000_000_000))
    await breakAt(g, 'matchEnd', { nodeId: FIRST_REAL_NODE, won: true }) // seeds
    vi.setSystemTime(new Date(1_000_000_000 + g.INTERSTITIAL_PACE_MS))
    // 2-2 is the cleave lesson. Due, and still refused.
    expect(g.mayBreakAt('matchEnd', { nodeId: nodeId(2, 2), won: true })).toBe(false)
    expect(await breakAt(g, 'matchEnd', { nodeId: nodeId(2, 2), won: true })).toBe(false)
    expect(g.showMidgameAd).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})

describe('a defeat is not interrupted', () => {
  it('gives a LOSS no break at match end, but takes the one on the way out', async () => {
    const g = await loadGate()
    expect(g.mayBreakAt('matchEnd', { nodeId: FIRST_REAL_NODE, won: false })).toBe(false)
    // The player's own tap off the result screen — Retry or Next — is a stop
    // they chose, so the ad a defeat did not get lands there instead.
    expect(g.mayBreakAt('leavingResult', { nodeId: FIRST_REAL_NODE })).toBe(true)
  })

  it('treats a missing `won` as not-won rather than as a win', async () => {
    const g = await loadGate()
    expect(g.mayBreakAt('matchEnd', { nodeId: FIRST_REAL_NODE })).toBe(false)
  })

  it('keeps the WIN ordering: the ad is allowed before the overlay', async () => {
    const g = await loadGate()
    expect(g.mayBreakAt('matchEnd', { nodeId: FIRST_REAL_NODE, won: true })).toBe(true)
  })
})
