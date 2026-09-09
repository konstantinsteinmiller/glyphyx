import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { MAX_RUNE_RANK, RANK_PRICES, RUNE_TYPES, FREE_RANK_WINDOW_MS, type RuneType } from '@/game/rules'

/**
 * ─── Rune ranks: the ladder, the three ways to pay, and the rotating gift ────
 *
 * The rewarded video is the ad gate's `watchRewarded`, mocked as a switch that
 * resolves what the test says and records the reason it was asked for — nothing
 * here touches a provider.
 *
 * The gift rotates on the CLOCK, so every case that cares about it pins the
 * clock with fake timers before the module is imported (the composable samples
 * `Date.now()` at load) and moves it with `__setFreeRankNow`, which is the same
 * ref the module's own one-second tick writes.
 */
const gate = vi.hoisted(() => ({ granted: true, calls: [] as string[] }))

vi.mock('@/use/useAdGate', () => ({
  watchRewarded: vi.fn(async (reason: string) => { gate.calls.push(reason); return gate.granted }),
  claimReward: vi.fn(async (grant: () => void) => { if (gate.granted) grant(); return gate.granted }),
  canOfferReward: ref(true),
  adInFlight: ref(false)
}))

let lastState: typeof import('@/use/useGlyphyxState') | null = null

/** A window well away from 0, so "the window before" is also a real window. */
const W = 500
const atWindow = (w: number, offsetMs = 1000): number => w * FREE_RANK_WINDOW_MS + offsetMs

const load = async (blob: Record<string, unknown> = {}, nowMs?: number) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  gate.calls = []
  gate.granted = true
  if (nowMs !== undefined) {
    vi.useFakeTimers()
    vi.setSystemTime(nowMs)
  }
  const rr = await import('@/use/useRuneRanks')
  const economy = (await import('@/use/useEconomy')).default()
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  return { ...rr, economy, state }
}

/** Every rune capped except `keep`. */
const allCappedBut = (keep: RuneType | null): Record<string, number> =>
  Object.fromEntries(RUNE_TYPES.filter((t) => t !== keep).map((t) => [t, MAX_RUNE_RANK]))

afterEach(() => { vi.useRealTimers() })

describe('the rank ladder', () => {
  it('a fresh player is at rank 0 on every rune, and affords nothing', async () => {
    const r = await load()
    expect(r.runeRanks.value).toEqual(Object.fromEntries(RUNE_TYPES.map((t) => [t, 0])))
    expect(r.rankOfRune('melee')).toBe(0)
    expect(r.nextRankPrice('melee')).toBe(RANK_PRICES[0])
    expect(r.canAffordRank('melee')).toBe(false)
    expect(r.isRankMaxed('melee')).toBe(false)
    expect(r.rankBonusOf('melee')).toBe(0)
  })

  it('sanitises whatever the blob holds — junk, unknown runes, out-of-range ranks', async () => {
    const r = await load({
      gx_rune_ranks: { melee: 3, archer: 'two', mage: -4, defense: 99, dragon: 5, support: 2.7 }
    })
    expect(r.rankOfRune('melee')).toBe(3)
    expect(r.rankOfRune('archer')).toBe(0)
    expect(r.rankOfRune('mage')).toBe(0)
    expect(r.rankOfRune('defense')).toBe(MAX_RUNE_RANK)
    expect(r.rankOfRune('support')).toBe(2)
    expect(r.runeRanks.value).not.toHaveProperty('dragon')
  })

  it('a blob that is not an object at all reads as no ranks', async () => {
    const r = await load({ gx_rune_ranks: 'wiped' })
    expect(r.runeRanks.value.melee).toBe(0)
  })

  it('spends exactly the ladder price, one rank at a time, up the whole ladder', async () => {
    const r = await load()
    const total = RANK_PRICES.reduce((a, b) => a + b, 0)
    r.economy.addCoins(total)
    for (let rank = 0; rank < MAX_RUNE_RANK; rank++) {
      expect(r.nextRankPrice('archer')).toBe(RANK_PRICES[rank])
      expect(r.buyRankWithCoins('archer')).toBe(true)
      expect(r.rankOfRune('archer')).toBe(rank + 1)
    }
    expect(r.economy.coins.value).toBe(0)
    expect(r.isRankMaxed('archer')).toBe(true)
    expect(r.nextRankPrice('archer')).toBeNull()
    expect(r.rankBonusOf('archer')).toBe(MAX_RUNE_RANK)
  })

  it('refuses a purchase the wallet cannot cover, and never half-happens', async () => {
    const r = await load()
    r.economy.addCoins(RANK_PRICES[0]! - 1)
    expect(r.buyRankWithCoins('melee')).toBe(false)
    expect(r.rankOfRune('melee')).toBe(0)
    expect(r.economy.coins.value).toBe(RANK_PRICES[0]! - 1)
  })

  it('refuses to sell a sixth rank, and takes no coins for it', async () => {
    const r = await load({ gx_rune_ranks: { mage: MAX_RUNE_RANK } })
    r.economy.addCoins(9999)
    expect(r.buyRankWithCoins('mage')).toBe(false)
    expect(r.economy.coins.value).toBe(9999)
    expect(r.rankOfRune('mage')).toBe(MAX_RUNE_RANK)
    expect(r.canAffordRank('mage')).toBe(false)
  })

  it('a rewarded video raises the rank only when it was actually watched', async () => {
    const r = await load()
    expect(await r.buyRankByAd('defense')).toBe(true)
    expect(r.rankOfRune('defense')).toBe(1)
    expect(gate.calls).toEqual(['runeRank'])

    gate.granted = false
    expect(await r.buyRankByAd('defense')).toBe(false)
    expect(r.rankOfRune('defense')).toBe(1)
    expect(gate.calls).toEqual(['runeRank', 'runeRank'])
  })

  it('never asks for a video it cannot pay out — a capped rune, or a rune that does not exist', async () => {
    const r = await load({ gx_rune_ranks: { roller: MAX_RUNE_RANK } })
    expect(await r.buyRankByAd('roller')).toBe(false)
    expect(await r.buyRankByAd('dragon' as never)).toBe(false)
    expect(gate.calls).toEqual([])
  })

  it('persists into the state blob and comes back on the next load', async () => {
    const r = await load()
    r.economy.addCoins(RANK_PRICES[0]!)
    r.buyRankWithCoins('bombard')
    r.state.flushPersist()
    expect(JSON.parse(localStorage.getItem('glyphyx_state') || '{}').gx_rune_ranks).toEqual({ bombard: 1 })

    const again = await load({ gx_rune_ranks: { bombard: 1 } })
    expect(again.rankOfRune('bombard')).toBe(1)
    expect(again.rankTable()).toEqual({ bombard: 1 })
  })

  it('re-reads the blob after a hydrate', async () => {
    const r = await load()
    r.state.setState('gx_rune_ranks', { support: 4 })
    expect(r.rankOfRune('support')).toBe(0)
    r.reloadRuneRanks()
    expect(r.rankOfRune('support')).toBe(4)
  })
})

describe('the rotating free upgrade', () => {
  it('names one rune, and keeps naming it for the whole window', async () => {
    const r = await load({ gx_player_id: 'player-one-abcdefgh' }, atWindow(W))
    const first = r.freeRankRune.value
    expect(first).not.toBeNull()
    expect(RUNE_TYPES).toContain(first!)
    expect(r.freeRankAvailable.value).toBe(true)
    // Anywhere inside the same window it is still the same rune.
    r.__setFreeRankNow(atWindow(W, FREE_RANK_WINDOW_MS - 1))
    expect(r.freeRankRune.value).toBe(first)
  })

  it('draws another rune once the clock crosses the window, and re-arms the gift', async () => {
    const r = await load({ gx_player_id: 'player-one-abcdefgh' }, atWindow(W))
    const first = r.freeRankRune.value!
    expect(r.claimFreeRank(first)).toBe(true)
    expect(r.freeRankAvailable.value).toBe(false)

    // The next window: a fresh gift, whatever rune it lands on.
    r.__setFreeRankNow(atWindow(W + 1))
    expect(r.freeRankAvailable.value).toBe(true)
    // …and over a run of windows the pick genuinely moves around rather than
    // sticking to one rune.
    const seen = new Set<RuneType>()
    for (let w = W; w < W + 40; w++) {
      r.__setFreeRankNow(atWindow(w))
      seen.add(r.freeRankRune.value!)
    }
    expect(seen.size).toBeGreaterThan(1)
  })

  it('the countdown runs down inside the window and resets at the boundary', async () => {
    const r = await load({}, atWindow(W, 0))
    expect(r.freeRankLeftMs.value).toBe(FREE_RANK_WINDOW_MS)
    r.__setFreeRankNow(atWindow(W, FREE_RANK_WINDOW_MS - 1500))
    expect(r.freeRankLeftMs.value).toBe(1500)
    r.__setFreeRankNow(atWindow(W + 1, 0))
    expect(r.freeRankLeftMs.value).toBe(FREE_RANK_WINDOW_MS)
  })

  it('the clock ticks on its own, so the countdown moves without anyone poking it', async () => {
    const r = await load({}, atWindow(W, 0))
    expect(r.freeRankLeftMs.value).toBe(FREE_RANK_WINDOW_MS)
    vi.advanceTimersByTime(3000)
    expect(r.freeRankLeftMs.value).toBe(FREE_RANK_WINDOW_MS - 3000)
  })

  it('gives the rank away for free, once, and only for the rune it named', async () => {
    const r = await load({ gx_player_id: 'player-one-abcdefgh' }, atWindow(W))
    const free = r.freeRankRune.value!
    const other = RUNE_TYPES.find((t) => t !== free)!

    // Not this window's rune: refused, and nothing is spent or granted.
    expect(r.claimFreeRank(other)).toBe(false)
    expect(r.rankOfRune(other)).toBe(0)

    expect(r.claimFreeRank(free)).toBe(true)
    expect(r.rankOfRune(free)).toBe(1)
    expect(r.economy.coins.value).toBe(0)
    expect(gate.calls).toEqual([])

    // Twice in one window is refused — and the claim is what makes it so.
    expect(r.freeRankAvailable.value).toBe(false)
    expect(r.claimFreeRank(r.freeRankRune.value!)).toBe(false)
  })

  it('records the claim as the window it was taken in, and clears itself next window', async () => {
    const r = await load({ gx_player_id: 'player-one-abcdefgh' }, atWindow(W))
    r.claimFreeRank(r.freeRankRune.value!)
    expect(r.state.getState('gx_free_rank_window')).toBe(W)
    r.__setFreeRankNow(atWindow(W + 1))
    expect(r.freeRankAvailable.value).toBe(true)
  })

  it('never points at a rune that is already capped', async () => {
    // Eight of nine capped: the gift can only be the ninth, in every window.
    const r = await load({ gx_rune_ranks: allCappedBut('nuker'), gx_player_id: 'player-one-abcdefgh' }, atWindow(W))
    for (let w = W; w < W + 25; w++) {
      r.__setFreeRankNow(atWindow(w))
      expect(r.freeRankRune.value).toBe('nuker')
    }
  })

  it('has nothing to give once every rune is capped', async () => {
    const r = await load({ gx_rune_ranks: allCappedBut(null) }, atWindow(W))
    expect(r.freeRankRune.value).toBeNull()
    expect(r.freeRankAvailable.value).toBe(false)
    expect(r.claimFreeRank('melee')).toBe(false)
  })

  it('draws a different sequence for a different player', async () => {
    const windows = 30
    const runFor = async (id: string): Promise<string[]> => {
      const r = await load({ gx_player_id: id }, atWindow(W))
      const out: string[] = []
      for (let w = W; w < W + windows; w++) {
        r.__setFreeRankNow(atWindow(w))
        out.push(r.freeRankRune.value!)
      }
      return out
    }
    const a = await runFor('player-one-abcdefgh')
    const b = await runFor('player-two-ijklmnop')
    expect(a).toHaveLength(windows)
    expect(a).not.toEqual(b)
    // …and the same player draws the same sequence again: it is the clock and
    // the id, never a stored counter.
    expect(await runFor('player-one-abcdefgh')).toEqual(a)
  })

  it('a stored window from the FUTURE leaves the gift claimable rather than locking it away', async () => {
    // A device with a wrong clock, or a cloud blob written by a later session.
    const r = await load(
      { gx_free_rank_window: W + 99, gx_player_id: 'player-one-abcdefgh' },
      atWindow(W)
    )
    expect(r.freeRankAvailable.value).toBe(true)
    expect(r.claimFreeRank(r.freeRankRune.value!)).toBe(true)
    // …and the claim repairs the stored value to the real current window.
    expect(r.state.getState('gx_free_rank_window')).toBe(W)
  })

  it('survives a blob whose claim field is nonsense', async () => {
    const r = await load({ gx_free_rank_window: 'yesterday' }, atWindow(W))
    expect(r.freeRankAvailable.value).toBe(true)
  })
})
