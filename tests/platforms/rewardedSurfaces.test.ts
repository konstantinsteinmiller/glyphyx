import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `watchRewarded` — the rewarded video behind a skin or a power rune.
 *
 * Same transaction as the result screen's ×3 (`claimReward`), so the same
 * gates: nothing on the CG pre-release build, free where no provider resolved,
 * refused while another ad is in flight, refused past the rate limit, refused
 * without a loaded rewarded — and NEVER a throw: a shop awaits it and simply
 * does not deliver.
 */

type Opts = {
  crazy?: boolean
  fullRelease?: boolean
  provider?: string
  rewardedReady?: boolean
  granted?: boolean | 'throw'
}

const loadGate = async (opts: Opts = {}) => {
  vi.resetModules()
  vi.doMock('@/use/useUser', () => ({ isCrazyWeb: opts.crazy ?? false }))
  vi.doMock('@/use/useMatch', () => ({ isCrazyGamesFullRelease: opts.fullRelease ?? false }))
  const showRewardedAd = vi.fn(async () => {
    if (opts.granted === 'throw') throw new Error('no fill')
    return opts.granted ?? true
  })
  const showMidgameAd = vi.fn(async () => 'shown' as const)
  vi.doMock('@/use/useAds', async () => {
    const { ref } = await import('vue')
    return {
      adProviderName: opts.provider ?? 'playgama',
      isRewardedReady: ref(opts.rewardedReady ?? true),
      isInterstitialReady: ref(true),
      showRewardedAd,
      showMidgameAd
    }
  })
  const mod = await import('@/use/useAdGate')
  mod.__resetRewardWindow()
  mod.__resetInterstitialClock()
  return { ...mod, showRewardedAd }
}

beforeEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('watchRewarded', () => {
  it('plays the video and reports the grant on a portal with rewarded inventory', async () => {
    const g = await loadGate()
    await expect(g.watchRewarded('skin')).resolves.toBe(true)
    expect(g.showRewardedAd).toHaveBeenCalledTimes(1)
    expect(g.adInFlight.value).toBe(false)
  })

  it('reports false when the video was not completed', async () => {
    const g = await loadGate({ granted: false })
    await expect(g.watchRewarded('powerRune')).resolves.toBe(false)
  })

  it('never throws — a provider rejection is a refusal', async () => {
    const g = await loadGate({ granted: 'throw' })
    await expect(g.watchRewarded('powerRune')).resolves.toBe(false)
    // A stuck flag would disable every rewarded button for the rest of the run.
    expect(g.adInFlight.value).toBe(false)
  })

  it('refuses without a loaded rewarded ad, and offers nothing', async () => {
    const g = await loadGate({ rewardedReady: false })
    expect(g.canOfferReward.value).toBe(false)
    await expect(g.watchRewarded('skin')).resolves.toBe(false)
    expect(g.showRewardedAd).not.toHaveBeenCalled()
  })

  it('refuses while another ad is in flight', async () => {
    const g = await loadGate()
    let release: (v: boolean) => void = () => {}
    g.showRewardedAd.mockImplementationOnce(() => new Promise<boolean>((r) => { release = r }))
    const first = g.watchRewarded('skin')
    expect(g.adInFlight.value).toBe(true)
    await expect(g.watchRewarded('powerRune')).resolves.toBe(false)
    expect(g.showRewardedAd).toHaveBeenCalledTimes(1)
    release(true)
    await expect(first).resolves.toBe(true)
  })

  it('refuses past the rate limit without touching the provider', async () => {
    const g = await loadGate()
    for (let i = 0; i < 6; i++) await g.watchRewarded('skin')
    await expect(g.watchRewarded('skin')).resolves.toBe(false)
    expect(g.showRewardedAd).toHaveBeenCalledTimes(6)
    expect(g.canOfferReward.value).toBe(false)
  })

  it('shares the allowance with the ×3 — a skin video counts against the same window', async () => {
    const g = await loadGate()
    for (let i = 0; i < 5; i++) await g.watchRewarded('skin')
    await expect(g.claimReward(vi.fn())).resolves.toBe(true)
    await expect(g.claimReward(vi.fn())).resolves.toBe(false)
    expect(g.showRewardedAd).toHaveBeenCalledTimes(6)
  })

  it('is free where no ad provider resolved', async () => {
    const g = await loadGate({ provider: 'noop' })
    await expect(g.watchRewarded('skin')).resolves.toBe(true)
    expect(g.showRewardedAd).not.toHaveBeenCalled()
  })

  it('offers nothing on the CrazyGames pre-release build', async () => {
    const g = await loadGate({ crazy: true, fullRelease: false, provider: 'crazygames' })
    expect(g.canOfferReward.value).toBe(false)
    await expect(g.watchRewarded('powerRune')).resolves.toBe(false)
    expect(g.showRewardedAd).not.toHaveBeenCalled()
  })

  it('tells the outcome hook what was paid for, granted or not', async () => {
    const g = await loadGate({ granted: false })
    const seen: Array<[string, boolean]> = []
    const off = g.onRewardedOutcome((reason, granted) => seen.push([reason, granted]))
    await g.watchRewarded('powerRune')
    g.showRewardedAd.mockResolvedValueOnce(true)
    await g.claimReward(vi.fn())
    off()
    await g.watchRewarded('skin')
    expect(seen).toEqual([['powerRune', false], ['multiplier', true]])
  })

  it('keeps claimReward rethrowing a provider rejection (its long-standing contract)', async () => {
    const g = await loadGate({ granted: 'throw' })
    await expect(g.claimReward(vi.fn())).rejects.toThrow('no fill')
    expect(g.adInFlight.value).toBe(false)
  })
})
