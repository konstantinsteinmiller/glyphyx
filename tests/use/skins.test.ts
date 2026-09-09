import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

/** The rewarded video, as a switch: resolves what the test says, records the reason. */
const gate = vi.hoisted(() => ({ granted: true, calls: [] as string[] }))
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
  const skins = await import('@/use/useSkins')
  const economy = (await import('@/use/useEconomy')).default()
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  return { ...skins, economy, state }
}

describe('pebble skins', () => {
  it('a fresh player owns and wears the river stone', async () => {
    const s = await load()
    expect(s.ownedSkins.value).toEqual(['river'])
    expect(s.activeSkin.value).toBe('river')
    expect(s.isSkinOwned('river')).toBe(true)
    expect(s.isSkinOwned('obsidian')).toBe(false)
    expect(s.priceOf('obsidian')).toBe(120)
  })

  it('refuses a purchase the wallet cannot cover', async () => {
    const s = await load()
    expect(s.buySkin('obsidian')).toBe(false)
    expect(s.ownedSkins.value).toEqual(['river'])
    expect(s.economy.coins.value).toBe(0)
  })

  it('spends the coins, owns the skin and wears it', async () => {
    const s = await load()
    s.economy.addCoins(150)
    expect(s.buySkin('obsidian')).toBe(true)
    expect(s.economy.coins.value).toBe(30)
    expect(s.ownedSkins.value).toEqual(['river', 'obsidian'])
    expect(s.activeSkin.value).toBe('obsidian')
    // Buying it twice is a no-op, not a second charge.
    expect(s.buySkin('obsidian')).toBe(false)
    expect(s.economy.coins.value).toBe(30)
  })

  it('only equips what is owned', async () => {
    const s = await load()
    expect(s.equipSkin('jade')).toBe(false)
    expect(s.activeSkin.value).toBe('river')
    expect(s.grantSkin('jade')).toBe(true)
    expect(s.grantSkin('jade')).toBe(false)
    expect(s.equipSkin('jade')).toBe(true)
    expect(s.activeSkin.value).toBe('jade')
  })

  it('persists into the state blob', async () => {
    const s = await load()
    s.grantSkin('amber')
    s.equipSkin('amber')
    s.state.flushPersist()
    const blob = JSON.parse(localStorage.getItem('glyphyx_state') || '{}')
    expect(blob.gx_skins_owned).toEqual(['river', 'amber'])
    expect(blob.gx_skin).toBe('amber')
  })

  it('never wears a skin the blob says is equipped but not owned', async () => {
    const s = await load({ gx_skin: 'ember', gx_skins_owned: ['river'] })
    expect(s.activeSkin.value).toBe('river')
  })

  it('a rewarded video owns and wears a skin, but only when it was watched', async () => {
    const s = await load()
    expect(await s.unlockSkinByAd('ember')).toBe(true)
    expect(s.ownedSkins.value).toEqual(['river', 'ember'])
    expect(s.activeSkin.value).toBe('ember')
    expect(s.economy.coins.value).toBe(0)
    expect(gate.calls).toEqual(['skin'])
    // Already owned: no video is even asked for.
    expect(await s.unlockSkinByAd('ember')).toBe(false)
    expect(gate.calls).toEqual(['skin'])
    // Dismissed / no fill: nothing granted.
    gate.granted = false
    expect(await s.unlockSkinByAd('marble')).toBe(false)
    expect(s.ownedSkins.value).toEqual(['river', 'ember'])
  })

  it('refreshes on hydrate', async () => {
    const s = await load()
    localStorage.setItem('glyphyx_state', JSON.stringify({ gx_skin: 'jade', gx_skins_owned: ['river', 'jade'] }))
    s.state.reloadGlyphyxState()
    const { saveDataVersion } = await import('@/use/useSaveStatus')
    saveDataVersion.value++
    await Promise.resolve()
    expect(s.ownedSkins.value).toEqual(['river', 'jade'])
    expect(s.activeSkin.value).toBe('jade')
  })
})
