import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The QA chord: 30 consecutive taps on the CoinBadge force an interstitial
 * past the pacing clock, so a portal reviewer can see one on demand.
 *
 * Two things are worth pinning. The COUNT has to be exact — a chord that trips
 * at fifteen because one physical tap arrived as both a `pointerdown` and a
 * synthesised `click` is a wallet that shows ads when a player prods it, which
 * is a rejection. And the STREAK has to reset on a pause, because that is the
 * whole reason the chord is unreachable by accident.
 */

const loadChord = async (opts: { outcome?: 'shown' | 'no-fill' | 'error' } = {}) => {
  vi.resetModules()
  vi.doMock('@/use/useUser', () => ({ isCrazyWeb: false }))
  vi.doMock('@/use/useMatch', () => ({ isCrazyGamesFullRelease: false }))
  const showMidgameAd = vi.fn(async () => opts.outcome ?? 'shown')
  vi.doMock('@/use/useAds', async () => {
    const { ref } = await import('vue')
    return {
      adProviderName: 'gamepix',
      isRewardedReady: ref(true),
      isInterstitialReady: ref(true),
      showRewardedAd: vi.fn(async () => true),
      showMidgameAd
    }
  })
  const gate = await import('@/use/useAdGate')
  const chord = await import('@/use/useAdChord')
  chord.__resetAdChord()
  gate.__resetInterstitialClock()
  return { ...chord, gate, showMidgameAd }
}

/** Tap `n` times, one tap every 100 ms of the fake clock. */
const tapTimes = (
  register: (source: 'pointer' | 'click', now?: number) => boolean,
  n: number,
  source: 'pointer' | 'click' = 'pointer',
  from = 1_000
): boolean[] => {
  const fired: boolean[] = []
  for (let i = 0; i < n; i++) fired.push(register(source, from + i * 100))
  return fired
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('the CoinBadge ad chord', () => {
  it('shows nothing for 29 taps and fires on the 30th', async () => {
    const { registerAdChordTap, AD_CHORD_TAPS, showMidgameAd } = await loadChord()
    expect(AD_CHORD_TAPS).toBe(30)

    const fired = tapTimes(registerAdChordTap, 29)
    expect(fired.some(Boolean)).toBe(false)
    expect(showMidgameAd).not.toHaveBeenCalled()

    expect(registerAdChordTap('pointer', 1_000 + 29 * 100)).toBe(true)
    await vi.waitFor(() => expect(showMidgameAd).toHaveBeenCalledTimes(1))
  })

  it('counts one physical tap once when a click follows the pointerdown', async () => {
    // A touch device sends `pointerdown` AND a synthesised `click` for the same
    // finger. 15 physical taps must not reach 30.
    const { registerAdChordTap, showMidgameAd } = await loadChord()
    for (let i = 0; i < 15; i++) {
      const at = 1_000 + i * 100
      registerAdChordTap('pointer', at)
      registerAdChordTap('click', at + 20)
    }
    expect(showMidgameAd).not.toHaveBeenCalled()
  })

  it('still counts on a browser that only delivers clicks', async () => {
    const { registerAdChordTap, showMidgameAd } = await loadChord()
    const fired = tapTimes(registerAdChordTap, 30, 'click')
    expect(fired.at(-1)).toBe(true)
    await vi.waitFor(() => expect(showMidgameAd).toHaveBeenCalledTimes(1))
  })

  it('forgets the streak after a pause, so idle taps never accumulate', async () => {
    const { registerAdChordTap, showMidgameAd } = await loadChord()
    // 29 taps, then a five-second pause, then 29 more. Never 30 in a row.
    tapTimes(registerAdChordTap, 29, 'pointer', 1_000)
    tapTimes(registerAdChordTap, 29, 'pointer', 1_000 + 29 * 100 + 5_000)
    expect(showMidgameAd).not.toHaveBeenCalled()
  })

  it('bypasses the pacing clock that refuses the first interstitial of a session', async () => {
    // `canShowInterstitial` returns false the first time it is asked — it only
    // STARTS the clock. The chord must fire anyway; that is its whole point.
    const { registerAdChordTap, gate, showMidgameAd } = await loadChord()
    expect(gate.canShowInterstitial()).toBe(false)
    tapTimes(registerAdChordTap, 30)
    await vi.waitFor(() => expect(showMidgameAd).toHaveBeenCalledTimes(1))
  })

  it('charges the pacing clock so a natural break does not follow it straight away', async () => {
    const { registerAdChordTap, gate, showMidgameAd } = await loadChord({ outcome: 'shown' })
    tapTimes(registerAdChordTap, 30)
    await vi.waitFor(() => expect(showMidgameAd).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(gate.adInFlight.value).toBe(false))
    expect(gate.canShowInterstitial()).toBe(false)
    expect(gate.msUntilNextInterstitial()).toBeGreaterThan(100_000)
  })

  it('refunds the clock when the forced request showed nothing', async () => {
    // Only `Date` is faked — the real timer queue has to keep running or the
    // awaits below never settle.
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      const { registerAdChordTap, gate, showMidgameAd } = await loadChord({ outcome: 'no-fill' })
      // Seed the session clock and let the full gap pass, so a natural break
      // is due at the moment the chord fires.
      gate.canShowInterstitial()
      vi.advanceTimersByTime(gate.INTERSTITIAL_PACE_MS + 1_000)
      expect(gate.canShowInterstitial()).toBe(true)

      tapTimes(registerAdChordTap, 30)
      await vi.waitFor(() => expect(showMidgameAd).toHaveBeenCalledTimes(1))
      await vi.waitFor(() => expect(gate.adInFlight.value).toBe(false))

      // A request that showed nothing owes only the shorter retry gap — the
      // full pace still belongs to the last ad that really ran.
      expect(gate.msUntilNextInterstitial()).toBeLessThanOrEqual(gate.INTERSTITIAL_RETRY_MS)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not stack an ad on top of one already in flight', async () => {
    const { registerAdChordTap, gate, showMidgameAd } = await loadChord()
    gate.adInFlight.value = true
    tapTimes(registerAdChordTap, 30)
    await Promise.resolve()
    expect(showMidgameAd).not.toHaveBeenCalled()
    gate.adInFlight.value = false
  })

  it('releases the in-flight flag when the provider throws', async () => {
    const { registerAdChordTap, gate, showMidgameAd } = await loadChord()
    showMidgameAd.mockRejectedValueOnce(new Error('sdk exploded'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    tapTimes(registerAdChordTap, 30)
    await vi.waitFor(() => expect(gate.adInFlight.value).toBe(false))
  })
})
