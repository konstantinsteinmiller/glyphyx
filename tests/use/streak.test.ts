import { describe, expect, it, vi } from 'vitest'

let lastState: typeof import('@/use/useGlyphyxState') | null = null

const load = async (blob: Record<string, unknown> = {}) => {
  lastState?.flushPersist()
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify(blob))
  const streak = await import('@/use/useStreak')
  const state = await import('@/use/useGlyphyxState')
  lastState = state
  return { ...streak, state }
}

describe('the win streak', () => {
  it('climbs on a win and the multiplier follows the table', async () => {
    const s = await load()
    expect(s.streak.value).toBe(0)
    expect(s.multiplier.value).toBe(1)
    expect(s.recordWin()).toBe(1)
    expect(s.multiplier.value).toBe(1)
    s.recordWin()
    expect(s.multiplier.value).toBe(1.5)
    s.recordWin()
    expect(s.streak.value).toBe(3)
    expect(s.multiplier.value).toBe(2)
    s.recordWin()
    s.recordWin()
    s.recordWin()
    // Capped at the last entry of the table — a ten-win streak is not ×10.
    expect(s.multiplier.value).toBe(3)
  })

  it('a loss resets the streak but never the best', async () => {
    const s = await load()
    s.recordWin()
    s.recordWin()
    s.recordWin()
    expect(s.bestStreak.value).toBe(3)
    s.recordLoss()
    expect(s.streak.value).toBe(0)
    expect(s.bestStreak.value).toBe(3)
    expect(s.multiplier.value).toBe(1)
  })

  it('lights the aura in steps of two wins', async () => {
    const s = await load()
    expect(s.auraLevel.value).toBe(0)
    s.recordWin()
    expect(s.auraLevel.value).toBe(0)
    s.recordWin()
    expect(s.auraLevel.value).toBe(1)
    s.recordWin(); s.recordWin()
    expect(s.auraLevel.value).toBe(2)
    for (let i = 0; i < 6; i++) s.recordWin()
    expect(s.auraLevel.value).toBe(3)
  })

  it('persists both numbers into the state blob', async () => {
    const s = await load()
    s.recordWin()
    s.recordWin()
    s.state.flushPersist()
    const blob = JSON.parse(localStorage.getItem('glyphyx_state') || '{}')
    expect(blob.gx_streak).toBe(2)
    expect(blob.gx_best_streak).toBe(2)
  })

  it('boots from a stored streak and refreshes on hydrate', async () => {
    const s = await load({ gx_streak: 4, gx_best_streak: 7 })
    expect(s.streak.value).toBe(4)
    expect(s.bestStreak.value).toBe(7)
    localStorage.setItem('glyphyx_state', JSON.stringify({ gx_streak: 0, gx_best_streak: 7 }))
    s.state.reloadGlyphyxState()
    const { saveDataVersion } = await import('@/use/useSaveStatus')
    saveDataVersion.value++
    await Promise.resolve()
    expect(s.streak.value).toBe(0)
  })
})
