import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Time-paced interstitials: one every 121 s at a natural break, never inside
 * the gap, never on the first opportunity — and a request that showed nothing
 * must not cost the player two more minutes of silence, nor be hammered.
 *
 * The clock is tested with explicit `now` values (no fake timers), so every
 * boundary is exact.
 */

type Opts = {
  interstitialReady?: boolean
  /** What `useAds.showMidgameAd` answers. */
  outcome?: 'shown' | 'no-fill' | 'error' | 'throw'
}

const loadGate = async (opts: Opts = {}) => {
  vi.resetModules()
  vi.doMock('@/use/useUser', () => ({ isCrazyWeb: false }))
  vi.doMock('@/use/useMatch', () => ({ isCrazyGamesFullRelease: false }))
  const showMidgameAd = vi.fn(async () => {
    if (opts.outcome === 'throw') throw new Error('sdk exploded')
    return opts.outcome ?? 'shown'
  })
  const showRewardedAd = vi.fn(async () => true)
  vi.doMock('@/use/useAds', async () => {
    const { ref } = await import('vue')
    return {
      adProviderName: 'playgama',
      isRewardedReady: ref(true),
      isInterstitialReady: ref(opts.interstitialReady ?? true),
      showRewardedAd,
      showMidgameAd
    }
  })
  const mod = await import('@/use/useAdGate')
  mod.__resetInterstitialClock()
  mod.__resetRewardWindow()
  return { ...mod, showMidgameAd, showRewardedAd }
}

const T0 = 1_000_000_000

beforeEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('the 121 s clock', () => {
  it('refuses the first opportunity of a session and starts the clock there', async () => {
    const g = await loadGate()
    expect(g.canShowInterstitial(T0)).toBe(false)
    expect(g.msUntilNextInterstitial(T0)).toBe(g.INTERSTITIAL_PACE_MS)
  })

  it('is closed at 120 s and open at 121 s', async () => {
    const g = await loadGate()
    g.canShowInterstitial(T0)
    expect(g.canShowInterstitial(T0 + 120_000)).toBe(false)
    expect(g.msUntilNextInterstitial(T0 + 120_000)).toBe(1_000)
    expect(g.canShowInterstitial(T0 + 121_000)).toBe(true)
    expect(g.msUntilNextInterstitial(T0 + 121_000)).toBe(0)
  })

  it('restarts from the moment an ad is shown', async () => {
    const g = await loadGate()
    g.canShowInterstitial(T0)
    g.markInterstitialShown(T0 + 130_000)
    expect(g.canShowInterstitial(T0 + 130_000 + 120_999)).toBe(false)
    expect(g.canShowInterstitial(T0 + 130_000 + 121_000)).toBe(true)
  })

  it('does not charge the clock for a request that showed nothing — a retry is allowed after 61 s', async () => {
    const g = await loadGate()
    g.canShowInterstitial(T0)
    // Due at T0 + 121 s; the request goes out and comes back empty.
    const at = T0 + 121_000
    expect(g.canShowInterstitial(at)).toBe(true)
    g.markInterstitialShown(at)
    g.markInterstitialFailed(at)
    // Not immediately — every request is a network call and Yandex spaces them.
    expect(g.canShowInterstitial(at + 60_000)).toBe(false)
    expect(g.msUntilNextInterstitial(at + 60_000)).toBe(1_000)
    // …but well inside the two minutes a shown ad would have cost.
    expect(g.canShowInterstitial(at + 61_000)).toBe(true)
  })

  it('a failed request never shortens a gap that is still owed to the last real ad', async () => {
    const g = await loadGate()
    g.canShowInterstitial(T0)
    g.markInterstitialShown(T0 + 121_000) // a real one ran here
    // A stray attempt 30 s later (some other break) fails.
    g.markInterstitialShown(T0 + 151_000)
    g.markInterstitialFailed(T0 + 151_000)
    // The retry rule alone would allow T0 + 212 s; the last real ad still owes
    // its full gap until T0 + 242 s.
    expect(g.canShowInterstitial(T0 + 212_000)).toBe(false)
    expect(g.canShowInterstitial(T0 + 241_999)).toBe(false)
    expect(g.canShowInterstitial(T0 + 242_000)).toBe(true)
  })
})

describe('showPacedInterstitial — the natural-break call', () => {
  it('shows once, charges the clock once, and reports true', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate({ outcome: 'shown' })
    g.canShowInterstitial() // session start
    vi.setSystemTime(T0 + 121_000)
    await expect(g.showPacedInterstitial()).resolves.toBe(true)
    expect(g.showMidgameAd).toHaveBeenCalledTimes(1)
    // Charged exactly once: the next one is a full gap away.
    expect(g.canShowInterstitial()).toBe(false)
    expect(g.msUntilNextInterstitial()).toBe(g.INTERSTITIAL_PACE_MS)
    expect(g.adInFlight.value).toBe(false)
  })

  it('does nothing on the first opportunity, inside the gap, or without inventory', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate()
    await expect(g.showPacedInterstitial()).resolves.toBe(false) // first opportunity seeds the clock
    vi.setSystemTime(T0 + 60_000)
    await expect(g.showPacedInterstitial()).resolves.toBe(false) // inside the gap
    expect(g.showMidgameAd).not.toHaveBeenCalled()

    const dry = await loadGate({ interstitialReady: false })
    dry.canShowInterstitial(T0)
    vi.setSystemTime(T0 + 200_000)
    await expect(dry.showPacedInterstitial()).resolves.toBe(false)
    expect(dry.showMidgameAd).not.toHaveBeenCalled()
  })

  it('refunds the clock to the retry rule when the ad did not fill', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate({ outcome: 'no-fill' })
    g.canShowInterstitial()
    vi.setSystemTime(T0 + 121_000)
    await expect(g.showPacedInterstitial()).resolves.toBe(false)
    expect(g.showMidgameAd).toHaveBeenCalledTimes(1)
    expect(g.msUntilNextInterstitial()).toBe(g.INTERSTITIAL_RETRY_MS)
    vi.setSystemTime(T0 + 121_000 + 61_000)
    expect(g.canShowInterstitial()).toBe(true)
  })

  it('treats a throwing provider like a no-fill and never rejects', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate({ outcome: 'throw' })
    g.canShowInterstitial()
    vi.setSystemTime(T0 + 121_000)
    await expect(g.showPacedInterstitial()).resolves.toBe(false)
    expect(g.adInFlight.value).toBe(false)
    expect(g.msUntilNextInterstitial()).toBe(g.INTERSTITIAL_RETRY_MS)
  })

  it('will not start while another ad is in flight', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate()
    g.canShowInterstitial()
    vi.setSystemTime(T0 + 121_000)
    g.adInFlight.value = true
    await expect(g.showPacedInterstitial()).resolves.toBe(false)
    expect(g.showMidgameAd).not.toHaveBeenCalled()
    g.adInFlight.value = false
  })

  it('waits the stinger delay before the audio is killed', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate()
    g.canShowInterstitial()
    vi.setSystemTime(T0 + 121_000)
    const p = g.showPacedInterstitial({ delayMs: 500 })
    await vi.advanceTimersByTimeAsync(400)
    expect(g.showMidgameAd).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(200)
    expect(g.showMidgameAd).toHaveBeenCalledTimes(1)
    await expect(p).resolves.toBe(true)
  })

  it('a watched rewarded video also restarts the interstitial clock', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(T0)
    const g = await loadGate()
    g.canShowInterstitial()
    vi.setSystemTime(T0 + 121_000)
    await expect(g.watchRewarded('skin')).resolves.toBe(true)
    // The player just sat through a video: no midgame for another full gap.
    expect(g.canShowInterstitial()).toBe(false)
    expect(g.msUntilNextInterstitial()).toBe(g.INTERSTITIAL_PACE_MS)
  })
})
