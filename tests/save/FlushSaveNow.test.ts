import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── flushSaveNow — immediate checkpoint flush (the CG "node lost on reload"
// regression) ──────────────────────────────────────────────────────────────
//
// On the CrazyGames cloud-only build, a cleared node writes the new best node
// into `glyphyx_state`, but the push to `sdk.data` only fires after the persist
// (~200ms) + strategy-flush (~250ms) debounces, and the async cloud write then
// takes time to land. A player who clears a node and reloads a moment later
// beat that pipeline → the reload restored the OLD node.
//
// `flushSaveNow()` (called at every hard checkpoint) forces the whole pipeline
// to drain synchronously-as-possible: write `glyphyx_state` now → SaveManager
// proxy → strategy dirty → `manager.flush()` → backend. This test proves a
// checkpoint write reaches the (fake) backend right after `flushSaveNow()`
// WITHOUT advancing any timers — i.e. it does not wait for either debounce.

const STATE_KEY = 'glyphyx_state'

const makeFakeData = (seed: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(seed))
  return {
    store,
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { store.set(key, value) }),
    removeItem: vi.fn(async (key: string) => { store.delete(key) })
  }
}

const bootCloudOnly = async (data: ReturnType<typeof makeFakeData>) => {
  const { SaveManager } = await import('@/utils/save/SaveManager')
  const { CrazyGamesStrategy } = await import('@/utils/save/CrazyGamesStrategy')
  const { installSaveStatus } = await import('@/use/useSaveStatus')
  const manager = new SaveManager(
    new CrazyGamesStrategy(() => data),
    window.localStorage,
    { blob: { persistToRaw: false } }
  )
  installSaveStatus(manager)
  await manager.init()
  return manager
}

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
  vi.doMock('@/use/useLeaderboard', () => ({
    reportMatch: vi.fn(async () => {}), rankFor: () => 0, leaderboardEnabled: false
  }))
})

describe('flushSaveNow — immediate flush on a hard checkpoint', () => {
  it('pushes a pending node write to the backend without waiting for the debounce', async () => {
    const data = makeFakeData()
    await bootCloudOnly(data)

    const { setState } = await import('@/use/useGlyphyxState')
    const { flushSaveNow } = await import('@/use/useSaveStatus')

    // A cleared node writes the new best into glyphyx_state (still sitting on
    // the debounce timers — nothing has reached the cloud yet).
    setState('gx_best_node', 2)
    expect(data.store.get(STATE_KEY)).toBeUndefined()

    // The checkpoint flush drains everything immediately — no fake timers.
    await flushSaveNow()

    const cloudBlob = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloudBlob.gx_best_node).toBe(2)
  })

  it('also carries coexisting progress (coins) written in the same checkpoint', async () => {
    const data = makeFakeData()
    await bootCloudOnly(data)

    const { setState } = await import('@/use/useGlyphyxState')
    const { flushSaveNow } = await import('@/use/useSaveStatus')

    setState('gx_coins', 250)
    setState('gx_best_node', 3)
    await flushSaveNow()

    const cloudBlob = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloudBlob.gx_coins).toBe(250)
    expect(cloudBlob.gx_best_node).toBe(3)
  })

  it('a cleared node reaches the cloud through the campaign checkpoint itself', async () => {
    const data = makeFakeData()
    const manager = await bootCloudOnly(data)

    // `markNodeCleared` is the hard checkpoint: it flushes on its own, so the
    // caller never has to remember to.
    const { markNodeCleared } = await import('@/use/useCampaign')
    const outcome = markNodeCleared(1)
    expect(outcome.first).toBe(true)
    // The flush is fire-and-forget inside the composable; let it settle.
    await new Promise((r) => setTimeout(r, 0))
    await manager.flush()

    const cloudBlob = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloudBlob.gx_best_node).toBe(1)
    expect(cloudBlob.gx_node).toBe(2)
    expect(cloudBlob.gx_unlocked_runes).toEqual(['melee', 'archer'])
    expect(cloudBlob.gx_coins).toBe(15)
  })
})
