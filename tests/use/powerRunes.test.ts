import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

/**
 * ─── Power runes: stock, payment, the armed boons ───────────────────────────
 *
 * The rewarded video is the ad gate's `watchRewarded`, mocked here as a
 * switch: it resolves what the test says and records the reason it was asked
 * for. Nothing in this file touches a provider.
 */
const gate = vi.hoisted(() => ({
  granted: true,
  calls: [] as string[],
  canOfferReward: { value: true },
  adInFlight: { value: false }
}))

vi.mock('@/use/useAdGate', () => ({
  watchRewarded: vi.fn(async (reason: string) => { gate.calls.push(reason); return gate.granted }),
  claimReward: vi.fn(async (grant: () => void) => { if (gate.granted) grant(); return gate.granted }),
  canOfferReward: ref(true),
  adInFlight: ref(false)
}))

let lastState: typeof import('@/use/useGlyphyxState') | null = null

const load = async (blob: Record<string, unknown> = {}) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  gate.calls = []
  gate.granted = true
  const pr = await import('@/use/usePowerRunes')
  const economy = (await import('@/use/useEconomy')).default()
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  return { ...pr, economy, state }
}

describe('power runes', () => {
  it('a fresh player has nothing armed', async () => {
    const p = await load()
    expect(p.powerRuneTotal.value).toBe(0)
    expect(p.powerRuneCount('melee')).toBe(0)
    expect(p.armedBoons()).toEqual({})
    expect(p.canAffordPowerRune.value).toBe(false)
  })

  it('refuses a purchase the wallet cannot cover, and never half-happens', async () => {
    const p = await load()
    p.economy.addCoins(p.POWER_RUNE_PRICE - 1)
    expect(p.buyPowerRune('archer')).toBe(false)
    expect(p.powerRuneCount('archer')).toBe(0)
    expect(p.economy.coins.value).toBe(p.POWER_RUNE_PRICE - 1)
  })

  it('spends the coins and arms one at the power level', async () => {
    const p = await load()
    p.economy.addCoins(200)
    expect(p.buyPowerRune('melee')).toBe(true)
    expect(p.economy.coins.value).toBe(200 - p.POWER_RUNE_PRICE)
    expect(p.powerRuneCount('melee')).toBe(1)
    expect(p.powerRuneTotal.value).toBe(1)
    expect(p.armedBoons()).toEqual({ melee: p.POWER_RUNE_LEVEL })
    expect(p.POWER_RUNE_LEVEL).toBe(3)
  })

  it('a rewarded video arms one only when it was actually watched', async () => {
    const p = await load()
    expect(await p.earnPowerRuneByAd('mage')).toBe(true)
    expect(p.powerRuneCount('mage')).toBe(1)
    expect(gate.calls).toEqual(['powerRune'])

    gate.granted = false
    expect(await p.earnPowerRuneByAd('mage')).toBe(false)
    expect(p.powerRuneCount('mage')).toBe(1)
    // A bad type never even asks for a video.
    expect(await p.earnPowerRuneByAd('dragon' as never)).toBe(false)
    expect(gate.calls).toEqual(['powerRune', 'powerRune'])
  })

  it('stock stacks per type and is spent one at a time', async () => {
    const p = await load()
    p.addPowerRune('defense', 2)
    p.addPowerRune('support')
    expect(p.powerRunes.value).toMatchObject({ defense: 2, support: 1, melee: 0 })
    expect(p.armedBoons()).toEqual({ defense: 3, support: 3 })
    expect(p.consumePowerRune('defense')).toBe(true)
    expect(p.powerRuneCount('defense')).toBe(1)
    expect(p.consumePowerRune('defense')).toBe(true)
    expect(p.consumePowerRune('defense')).toBe(false)
    expect(p.armedBoons()).toEqual({ support: 3 })
    expect(p.powerRuneTotal.value).toBe(1)
  })

  it('persists into the state blob and comes back on the next load', async () => {
    const p = await load()
    p.addPowerRune('archer', 2)
    p.state.flushPersist()
    const blob = JSON.parse(localStorage.getItem('glyphyx_state') || '{}')
    expect(blob.gx_power_runes).toEqual({ archer: 2 })

    const again = await load({ gx_power_runes: { archer: 2, mage: 'garbage', dragon: 4 } })
    expect(again.powerRuneCount('archer')).toBe(2)
    expect(again.powerRuneCount('mage')).toBe(0)
    expect(again.powerRuneTotal.value).toBe(2)
  })

  it('re-reads the blob after a hydrate', async () => {
    const p = await load()
    p.state.setState('gx_power_runes', { support: 5 })
    expect(p.powerRuneCount('support')).toBe(0)
    p.reloadPowerRunes()
    expect(p.powerRuneCount('support')).toBe(5)
  })
})
