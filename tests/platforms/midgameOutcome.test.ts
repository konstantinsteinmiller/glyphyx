import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

/**
 * `useAds.showMidgameAd` reports what the request came to — `shown`, `no-fill`
 * or `error` — so the pacing clock is only spent on an ad that ran; and both
 * formats keep the audio guarantee: music hard-stopped and every one-shot
 * killed BEFORE the provider is asked, the pause gate held until it answers.
 */

const { forceStopMusicSpy, killOneShotSpy } = vi.hoisted(() => ({
  forceStopMusicSpy: vi.fn(),
  killOneShotSpy: vi.fn()
}))

vi.mock('@/use/useSound', () => ({
  forceStopMusic: forceStopMusicSpy,
  resumeMusicAfterAd: vi.fn(),
  default: () => ({ playSound: vi.fn(), playLoop: vi.fn() }),
  useMusic: () => ({
    initMusic: vi.fn(), isLoaded: ref(false), isPlaying: ref(false),
    pauseMusic: vi.fn(), continueMusic: vi.fn(),
    startBattleMusic: vi.fn(), stopBattleMusic: vi.fn()
  })
}))

vi.mock('@/use/useAssets', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  killOneShotSfx: killOneShotSpy
}))

const mockProvider = {
  name: 'mock',
  isReady: ref(true),
  isRewardedReady: ref(true),
  isInterstitialReady: ref(true),
  isAdsBlocked: ref(false),
  managesMidgameAudio: false,
  init: vi.fn(async () => {}),
  showRewardedAd: vi.fn(async (_onImpression?: () => void) => true),
  showMidgameAd: vi.fn(async (_onImpression?: () => void): Promise<void | boolean> => undefined)
}

vi.mock('@/platforms/resolveAdProvider', () => ({
  resolveAdProvider: () => mockProvider
}))

const importAds = async () => {
  vi.resetModules()
  forceStopMusicSpy.mockClear()
  killOneShotSpy.mockClear()
  mockProvider.managesMidgameAudio = false
  mockProvider.showMidgameAd.mockReset()
  mockProvider.showMidgameAd.mockResolvedValue(undefined)
  mockProvider.showRewardedAd.mockReset()
  mockProvider.showRewardedAd.mockResolvedValue(true)
  return await import('@/use/useAds')
}

beforeEach(() => {
  vi.useFakeTimers()
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  window.localStorage.clear()
})

/** Run `p` to completion under fake timers (the 200 ms audio drain, the caps). */
const settle = async <T,>(p: Promise<T>, ms = 1_000): Promise<T> => {
  await vi.advanceTimersByTimeAsync(ms)
  return p
}

describe('showMidgameAd outcome', () => {
  it('is `shown` when the provider settles without saying otherwise', async () => {
    const ads = await importAds()
    mockProvider.showMidgameAd.mockImplementation(async (onImpression) => { onImpression?.() })
    await expect(settle(ads.showMidgameAd())).resolves.toBe('shown')
  })

  it('is `shown` for a provider that cannot tell a no-fill apart (settles void, no impression)', async () => {
    // The safe side for pacing: an ad we cannot prove empty counts as run.
    const ads = await importAds()
    await expect(settle(ads.showMidgameAd())).resolves.toBe('shown')
  })

  it('is `no-fill` when the provider resolves false', async () => {
    const ads = await importAds()
    mockProvider.showMidgameAd.mockResolvedValue(false)
    await expect(settle(ads.showMidgameAd())).resolves.toBe('no-fill')
  })

  it('is `no-fill` when the SDK never reports opening (the 6 s cap)', async () => {
    const ads = await importAds()
    mockProvider.showMidgameAd.mockImplementation(() => new Promise<void>(() => {}))
    const p = ads.showMidgameAd()
    await vi.advanceTimersByTimeAsync(200 + 6_000 + 10)
    await expect(p).resolves.toBe('no-fill')
    // The pause gate came back down with it.
    const { isAdShowing } = await import('@/use/useGamePause')
    expect(isAdShowing.value).toBe(false)
  })

  it('is `error` when the provider rejects, and the gate still drops', async () => {
    const ads = await importAds()
    mockProvider.showMidgameAd.mockRejectedValue(new Error('sdk down'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(settle(ads.showMidgameAd())).resolves.toBe('error')
    const { isAdShowing } = await import('@/use/useGamePause')
    expect(isAdShowing.value).toBe(false)
    warn.mockRestore()
  })

  it('honours the mute-on-open providers too', async () => {
    const ads = await importAds()
    mockProvider.managesMidgameAudio = true
    mockProvider.showMidgameAd.mockImplementation(async (onImpression) => { onImpression?.() })
    await expect(settle(ads.showMidgameAd())).resolves.toBe('shown')
    expect(forceStopMusicSpy).toHaveBeenCalled()
  })
})

describe('the audio guarantee around every ad', () => {
  it('interstitial: music hard-stopped and one-shots killed BEFORE the provider is asked', async () => {
    const ads = await importAds()
    const order: string[] = []
    forceStopMusicSpy.mockImplementation(() => order.push('forceStopMusic'))
    killOneShotSpy.mockImplementation(() => order.push('killOneShotSfx'))
    mockProvider.showMidgameAd.mockImplementation(async () => { order.push('provider') })
    await settle(ads.showMidgameAd())
    expect(order.indexOf('forceStopMusic')).toBeLessThan(order.indexOf('provider'))
    expect(order.indexOf('killOneShotSfx')).toBeLessThan(order.indexOf('provider'))
  })

  it('rewarded: the same kill order, and the pause gate held until the provider answers', async () => {
    const ads = await importAds()
    const { isAdShowing } = await import('@/use/useGamePause')
    const order: string[] = []
    forceStopMusicSpy.mockImplementation(() => order.push('forceStopMusic'))
    killOneShotSpy.mockImplementation(() => order.push('killOneShotSfx'))
    let release: (v: boolean) => void = () => {}
    mockProvider.showRewardedAd.mockImplementation(() => {
      order.push('provider')
      return new Promise<boolean>((r) => { release = r })
    })
    const p = ads.showRewardedAd()
    await vi.advanceTimersByTimeAsync(300)
    expect(order).toEqual(['forceStopMusic', 'killOneShotSfx', 'provider'])
    expect(isAdShowing.value).toBe(true)
    release(true)
    await expect(p).resolves.toBe(true)
    expect(isAdShowing.value).toBe(false)
  })
})
