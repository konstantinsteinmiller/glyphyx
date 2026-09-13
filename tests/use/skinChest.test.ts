import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { SKIN_CHEST_MINUTES, SKIN_IDS } from '@/game/rules'
import { SKIN_CHEST_AT_KEY } from '@/keys'

/**
 * ─── The skin chest ─────────────────────────────────────────────────────────
 *
 * A free material every ten minutes. What matters here is not the animation —
 * it is that the clock cannot be cheated and the chest cannot pay twice.
 */

vi.mock('@/use/useSaveStatus', async (orig) => ({
  ...(await orig<typeof import('@/use/useSaveStatus')>()),
  flushSaveNow: () => Promise.resolve()
}))

/** Run the composable inside a real component, so its interval is owned. */
const withChest = async () => {
  const { useSkinChest } = await import('@/use/useSkinChest')
  let api: ReturnType<typeof useSkinChest> | null = null
  const w = mount(defineComponent({
    setup: () => { api = useSkinChest(); return () => null }
  }))
  return { chest: api as unknown as ReturnType<typeof useSkinChest>, unmount: () => w.unmount() }
}

const COOLDOWN_MS = SKIN_CHEST_MINUTES * 60_000

beforeEach(async () => {
  vi.resetModules()
  const { setStates } = await import('@/use/useGlyphyxState')
  setStates({ [SKIN_CHEST_AT_KEY]: 0, gx_skins_owned: [], gx_skin: 'river' })
})
afterEach(() => { vi.useRealTimers() })

describe('the skin chest', () => {
  it('is READY for a player who has never opened one', async () => {
    // Nothing else on the HUD gives a skin away, so a first-timer meeting a
    // ten-minute countdown is being asked to believe a promise. They meet an
    // open chest instead.
    const { chest, unmount } = await withChest()
    expect(chest.isReady.value).toBe(true)
    expect(chest.timeDisplay.value).toBe('00:00')
    unmount()
  })

  it('grants a material the player does not own, and starts the clock', async () => {
    const { chest, unmount } = await withChest()
    const { isSkinOwned } = await import('@/use/useSkins')
    const won = chest.collect()
    expect(won).not.toBeNull()
    expect(isSkinOwned(won!)).toBe(true)
    expect(chest.isReady.value).toBe(false)
    expect(chest.timeDisplay.value).not.toBe('00:00')
    unmount()
  })

  it('cannot be opened twice — the second tap gives nothing', async () => {
    const { chest, unmount } = await withChest()
    expect(chest.collect()).not.toBeNull()
    expect(chest.collect()).toBeNull()
    unmount()
  })

  it('opens again once the cooldown has actually passed', async () => {
    const { setStates } = await import('@/use/useGlyphyxState')
    // A claim exactly one cooldown ago is due; a moment short of it is not.
    setStates({ [SKIN_CHEST_AT_KEY]: Date.now() - COOLDOWN_MS + 5_000 })
    const a = await withChest()
    expect(a.chest.isReady.value).toBe(false)
    a.unmount()

    setStates({ [SKIN_CHEST_AT_KEY]: Date.now() - COOLDOWN_MS - 1_000 })
    const b = await withChest()
    expect(b.chest.isReady.value).toBe(true)
    b.unmount()
  })

  it('never re-rolls its prize: the closed chest shows what it will give', async () => {
    // Keyed on the claim stamp rather than rolled per read, so a player cannot
    // reload for a better material and the preview is not a lie.
    const a = await withChest()
    const first = a.chest.nextSkin.value
    expect(first).not.toBeNull()
    expect(a.chest.nextSkin.value).toBe(first)
    a.unmount()
    const b = await withChest()
    expect(b.chest.nextSkin.value).toBe(first)
    b.unmount()
  })

  it('goes away entirely once every material is owned', async () => {
    const { setStates } = await import('@/use/useGlyphyxState')
    setStates({ gx_skins_owned: [...SKIN_IDS] })
    const { chest, unmount } = await withChest()
    expect(chest.hasRewards.value).toBe(false)
    // …and being "due" is not enough to make it pay out of an empty pool.
    expect(chest.isReady.value).toBe(false)
    expect(chest.collect()).toBeNull()
    unmount()
  })

  it('fills from empty to full across the wait', async () => {
    const { setStates } = await import('@/use/useGlyphyxState')
    setStates({ [SKIN_CHEST_AT_KEY]: Date.now() - COOLDOWN_MS / 2 })
    const { chest, unmount } = await withChest()
    expect(chest.fill01.value).toBeGreaterThan(0.4)
    expect(chest.fill01.value).toBeLessThan(0.6)
    unmount()
  })

  it('survives a nonsense clock rather than locking the chest shut', async () => {
    const { setStates } = await import('@/use/useGlyphyxState')
    for (const junk of ['', 'soon', null, -5, Number.NaN]) {
      setStates({ [SKIN_CHEST_AT_KEY]: junk })
      const { chest, unmount } = await withChest()
      expect(chest.isReady.value, `clock = ${String(junk)}`).toBe(true)
      unmount()
    }
  })
})
