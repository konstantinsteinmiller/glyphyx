import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { FORGE_CAP_HOURS, FORGE_COINS_PER_HOUR, FORGE_HEAD_START_MIN } from '@/game/rules'

/**
 * ─── The offline forge ──────────────────────────────────────────────────────
 *
 * Every number here is a retention decision: how fast the forge fills, where
 * it caps, and how far along a brand-new player finds it. They are pinned so a
 * balance pass cannot move one by accident.
 */

const HOUR = 3_600_000
const T0 = new Date('2026-09-08T12:00:00Z').getTime()

let lastState: typeof import('@/use/useGlyphyxState') | null = null

const load = async (blob: Record<string, unknown> = {}) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  const mod = await import('@/use/useRuneForge')
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  // The composable owns an interval and releases it on unmount, so it wants a
  // component instance around it.
  let forge!: ReturnType<typeof mod.useRuneForge>
  const wrapper = mount(defineComponent({
    setup() {
      forge = mod.useRuneForge()
      return () => h('div')
    }
  }))
  return { forge, wrapper, state, mod }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(T0)
})
afterEach(() => {
  vi.useRealTimers()
})

describe('accrual', () => {
  it('pays FORGE_COINS_PER_HOUR per hour of absence', async () => {
    const { forge, wrapper } = await load({ gx_forge_at: T0 - 2 * HOUR })
    expect(forge.accrued.value).toBe(2 * FORGE_COINS_PER_HOUR)
    expect(forge.isReady.value).toBe(true)
    expect(forge.isFull.value).toBe(false)
    expect(forge.fill01.value).toBeCloseTo(2 / FORGE_CAP_HOURS, 5)
    wrapper.unmount()
  })

  it('caps at FORGE_CAP_HOURS', async () => {
    const { forge, wrapper } = await load({ gx_forge_at: T0 - 30 * HOUR })
    expect(forge.accrued.value).toBe(FORGE_CAP_HOURS * FORGE_COINS_PER_HOUR)
    expect(forge.isFull.value).toBe(true)
    expect(forge.fill01.value).toBe(1)
    wrapper.unmount()
  })

  it('a brand-new player finds it already FORGE_HEAD_START_MIN minutes along', async () => {
    const { forge, wrapper } = await load()
    const expected = Math.floor((FORGE_HEAD_START_MIN / 60) * FORGE_COINS_PER_HOUR)
    expect(forge.accrued.value).toBe(expected)
    expect(forge.isReady.value).toBe(expected >= 1)
    wrapper.unmount()
  })

  it('is exact arithmetic', async () => {
    const { mod } = await load()
    expect(mod.accruedFor(0)).toBe(0)
    expect(mod.accruedFor(HOUR / FORGE_COINS_PER_HOUR - 1)).toBe(0)
    expect(mod.accruedFor(HOUR / FORGE_COINS_PER_HOUR)).toBe(1)
    expect(mod.accruedFor(FORGE_CAP_HOURS * HOUR * 5)).toBe(FORGE_CAP_HOURS * FORGE_COINS_PER_HOUR)
    expect(mod.accruedFor(-HOUR)).toBe(0)
  })
})

describe('collecting', () => {
  it('pays out, restarts the clock and persists the claim', async () => {
    const { forge, wrapper, state } = await load({ gx_forge_at: T0 - 3 * HOUR })
    const won = forge.collect()
    expect(won).toBe(3 * FORGE_COINS_PER_HOUR)
    expect(forge.accrued.value).toBe(0)
    expect(forge.isReady.value).toBe(false)
    state.flushPersist()
    const blob = JSON.parse(localStorage.getItem('glyphyx_state') || '{}')
    expect(blob.gx_forge_at).toBe(T0)
    // A second tap right away pays nothing.
    expect(forge.collect()).toBe(0)
    wrapper.unmount()
  })

  it('ticks along in real time after a claim', async () => {
    const { forge, wrapper } = await load({ gx_forge_at: T0 - 3 * HOUR })
    forge.collect()
    vi.setSystemTime(T0 + HOUR)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(forge.accrued.value).toBe(FORGE_COINS_PER_HOUR)
    wrapper.unmount()
  })

  it('counts down to the next whole coin', async () => {
    const { forge, wrapper } = await load({ gx_forge_at: T0 })
    // One coin every 5 minutes at 12/h.
    expect(forge.timeDisplay.value).toBe('05:00')
    // The 1 Hz tick advances the fake clock by the second it waits for.
    vi.setSystemTime(T0 + 89_000)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(forge.timeDisplay.value).toBe('03:30')
    wrapper.unmount()
  })
})

describe('hydration', () => {
  it('re-reads the claim when a cloud save lands after boot', async () => {
    const { forge, wrapper, state } = await load({ gx_forge_at: T0 - 5 * HOUR })
    expect(forge.accrued.value).toBe(5 * FORGE_COINS_PER_HOUR)
    // Another device claimed a minute ago.
    localStorage.setItem('glyphyx_state', JSON.stringify({ gx_forge_at: T0 - 60_000 }))
    state.reloadGlyphyxState()
    const { saveDataVersion } = await import('@/use/useSaveStatus')
    saveDataVersion.value++
    await Promise.resolve()
    expect(forge.accrued.value).toBe(0)
    wrapper.unmount()
  })
})
