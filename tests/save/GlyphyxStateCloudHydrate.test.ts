import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// ─── Cloud → composable hydrate (the "fresh user" regression) ───────────────
//
// THE BUG THIS FILE EXISTS TO PREVENT:
//   A returning player reloads. The platform SDK's cloud read is async. The
//   Vue module graph evaluates first, every composable reads an empty blob and
//   initialises to defaults, and the player is rendered as a brand-new install:
//   node 1-1, no coins, one rune. The next write then commits those defaults
//   over the real cloud save and the loss becomes permanent.
//
// The whole game state lives in ONE `glyphyx_state` blob (an allowlisted
// payload key), so the strategy mirrors it verbatim. `reloadGlyphyxState()` is
// wired into the `saveDataVersion` bump inside `useSaveStatus` — and the ORDER
// matters: the blob must be re-read BEFORE the bump, or every
// `watch(saveDataVersion)` consumer re-reads the stale pre-hydrate snapshot and
// the bug survives.

const MANIFEST_KEY = '__save_internal__crazy_keys'
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

const flush = async (): Promise<void> => { await nextTick(); await nextTick() }

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
  // The battle posts the result to the leaderboard; a test must never reach
  // the network, and the module is not what is under test here.
  vi.doMock('@/use/useLeaderboard', () => ({
    reportMatch: vi.fn(async () => {}),
    rankFor: () => 0,
    leaderboardEnabled: false
  }))
})

/** A cloud snapshot for a player who is well into chapter 1, plus the meta blob
 *  the merge resolver needs in order to pick remote over an empty local. */
const seededCloud = async () => {
  const { META_KEY } = await import('@/utils/save/SaveMergePolicy')
  const cloudBlob = {
    // 1-7: the first clocked duel. The lesson nodes before it hand out the rune
    // they teach, so only here is the hand a proof of the hydrated roster.
    gx_node: 7,
    gx_best_node: 6,
    gx_coins: 1250,
    gx_unlocked_runes: ['melee', 'archer', 'mage'],
    gx_streak: 3,
    gx_best_streak: 3,
    gx_matches: 9,
    gx_wins: 4,
    gx_user_language: 'es',
    gx_user_sound_volume: 0.4,
    gx_skin: 'jade',
    gx_skins_owned: ['river', 'jade']
  }
  const meta = {
    savedAt: '2026-09-01T00:00:00.000Z',
    // bestNode 4 × 500 + 3 unlocked runes × 150 + 9 matches × 10
    progressScore: 4 * 500 + 3 * 150 + 9 * 10,
    schemaVersion: 1,
    maxStage: 4
  }
  return makeFakeData({
    [MANIFEST_KEY]: JSON.stringify([STATE_KEY, META_KEY]),
    [STATE_KEY]: JSON.stringify(cloudBlob),
    [META_KEY]: JSON.stringify(meta)
  })
}

/** Boot the CrazyGames cloud-only configuration: gameplay state lives in memory
 *  only and `sdk.data` is the sole persistence backend. */
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
  await flush()
  return manager
}

describe('glyphyx_state cloud hydrate → composable refresh', () => {
  it('hydrates the blob into localStorage before the app graph reads it', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    const blob = JSON.parse(window.localStorage.getItem(STATE_KEY) || '{}')
    expect(blob.gx_best_node).toBe(6)
    expect(blob.gx_coins).toBe(1250)
  })

  it('refreshes the economy composable — the player is NOT a fresh user', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    const { default: useEconomy } = await import('@/use/useEconomy')
    expect(useEconomy().coins.value).toBe(1250)
  })

  it('refreshes the campaign: node, best node and the unlocked roster', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    const campaign = await import('@/use/useCampaign')
    expect(campaign.currentNode.value).toBe(7)
    expect(campaign.bestNode.value).toBe(6)
    expect(campaign.unlockedRunes.value).toEqual(['melee', 'archer', 'mage'])
    expect(campaign.matchesPlayed.value).toBe(9)
    // Node 7 is playable (bestNode + 1); node 8 is not.
    expect(campaign.isNodeUnlocked(7)).toBe(true)
    expect(campaign.isNodeUnlocked(8)).toBe(false)
  })

  it('refreshes the streak and the equipped skin', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    const { streak, bestStreak, multiplier } = await import('@/use/useStreak')
    expect(streak.value).toBe(3)
    expect(bestStreak.value).toBe(3)
    expect(multiplier.value).toBe(2)

    const { activeSkin, ownedSkins } = await import('@/use/useSkins')
    expect(activeSkin.value).toBe('jade')
    expect(ownedSkins.value).toEqual(['river', 'jade'])
  })

  it('refreshes user settings so the player keeps their language and volume', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    const { default: useUser } = await import('@/use/useUser')
    const u = useUser()
    expect(u.userLanguage.value).toBe('es')
    expect(u.userSoundVolume.value).toBe(0.4)
  })

  it('resumes the saved node rather than dropping the player back to 1-1', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    const { battle } = await import('@/use/useBattle')
    battle.startNode()
    expect(battle.node.value?.id).toBe(7)
    expect(battle.matchActive.value).toBe(true)
    // The hand is drawn from the hydrated roster, not the fresh-install sword.
    expect(battle.view.hand.every((t) => ['melee', 'archer', 'mage'].includes(t))).toBe(true)
    expect(battle.view.skin).toBe('jade')

    // Drain this module instance's pending persist timer. `vi.resetModules()`
    // gives the NEXT test fresh modules but cannot cancel a timer already
    // scheduled by this one — and when it fired it would write this test's blob
    // into the next test's store, which reads as a phantom hydrate.
    const { flushPersist } = await import('@/use/useGlyphyxState')
    flushPersist()
  })

  it('keeps nothing but the two blobs in raw localStorage on a cloud-only build', async () => {
    const data = await seededCloud()
    await bootCloudOnly(data)

    // Cloud-only mode: gameplay state is in-memory; the proxy serves reads.
    // Nothing must leak into the raw store.
    const raw: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k) raw.push(k)
    }
    expect(raw.filter((k) => k.startsWith('gx_'))).toEqual([])
  })
})

describe('hydrate failure modes', () => {
  it('does NOT overwrite a real cloud save when the local snapshot is empty', async () => {
    const data = await seededCloud()
    const manager = await bootCloudOnly(data)

    // A trivial post-boot write must not clobber the hydrated fields.
    const { setState } = await import('@/use/useGlyphyxState')
    const { flushSaveNow } = await import('@/use/useSaveStatus')
    setState('gx_tutorial_seen', true)
    await flushSaveNow()
    await manager.flush()

    const cloudBlob = JSON.parse(data.store.get(STATE_KEY) || '{}')
    expect(cloudBlob.gx_best_node).toBe(6)
    expect(cloudBlob.gx_coins).toBe(1250)
    expect(cloudBlob.gx_tutorial_seen).toBe(true)
  })

  it('retries a transient SDK failure before letting a returning player boot fresh', async () => {
    vi.useFakeTimers()
    try {
      const data = await seededCloud()
      const snapshot = new Map(data.store)
      let calls = 0
      data.getItem.mockImplementation(async (key: string) => {
        calls++
        // Fail the very first manifest read — the transient-blip failure mode.
        if (key === MANIFEST_KEY && calls === 1) throw new Error('transient SDK error')
        return snapshot.get(key) ?? null
      })

      const { SaveManager } = await import('@/utils/save/SaveManager')
      const { CrazyGamesStrategy } = await import('@/utils/save/CrazyGamesStrategy')
      const manager = new SaveManager(
        new CrazyGamesStrategy(() => data),
        window.localStorage,
        { blob: { persistToRaw: false } }
      )
      const init = manager.init()
      await vi.advanceTimersByTimeAsync(1_500)
      await init

      expect(manager.hydrateState).toBe('success-with-data')
      const blob = JSON.parse(window.localStorage.getItem(STATE_KEY) || '{}')
      expect(blob.gx_best_node).toBe(6)
    } finally {
      vi.clearAllTimers()
      vi.useRealTimers()
    }
  })

  it('treats a genuinely empty cloud as a real fresh install', async () => {
    const data = makeFakeData()
    await bootCloudOnly(data)

    const { default: useEconomy } = await import('@/use/useEconomy')
    const campaign = await import('@/use/useCampaign')
    expect(useEconomy().coins.value).toBe(0)
    expect(campaign.currentNode.value).toBe(1)
    expect(campaign.bestNode.value).toBe(0)
    expect(campaign.unlockedRunes.value).toEqual(['melee'])

    const { battle } = await import('@/use/useBattle')
    battle.startNode()
    expect(battle.node.value?.id).toBe(1)
  })

  it('survives a corrupt cloud blob without wiping the player', async () => {
    const { META_KEY } = await import('@/utils/save/SaveMergePolicy')
    const data = makeFakeData({
      [MANIFEST_KEY]: JSON.stringify([STATE_KEY, META_KEY]),
      [STATE_KEY]: '{not json at all',
      [META_KEY]: JSON.stringify({
        savedAt: '2026-09-01T00:00:00.000Z',
        progressScore: 5000, schemaVersion: 1, maxStage: 10
      })
    })
    // A corrupt blob must degrade to defaults, not throw during boot.
    await expect(bootCloudOnly(data)).resolves.toBeDefined()
    const { default: useEconomy } = await import('@/use/useEconomy')
    expect(useEconomy().coins.value).toBe(0)
  })
})

describe('reload round-trip', () => {
  it('a node cleared before the reload is still cleared after it', async () => {
    // ── Session 1: win node 1-1, which is a hard checkpoint. ──
    const data = makeFakeData()
    const m1 = await bootCloudOnly(data)
    const { default: useEconomy } = await import('@/use/useEconomy')
    const { battle, __winMatchNow } = await import('@/use/useBattle')

    useEconomy().addCoins(640)
    battle.startNode(1)
    __winMatchNow()
    expect(battle.result.value?.won).toBe(true)
    const campaign1 = await import('@/use/useCampaign')
    expect(campaign1.bestNode.value).toBe(1)
    expect(campaign1.currentNode.value).toBe(2)
    expect(campaign1.unlockedRunes.value).toContain('archer')
    await m1.flush()

    // ── Session 2: a cold boot against the same cloud store. ──
    // Drain session 1's pending persist timer first — see the note in the
    // resume test; a late fire would write session 1's blob into session 2.
    const { flushPersist } = await import('@/use/useGlyphyxState')
    flushPersist()
    await m1.flush()
    vi.resetModules()
    vi.doMock('@/use/useLeaderboard', () => ({
      reportMatch: vi.fn(async () => {}), rankFor: () => 0, leaderboardEnabled: false
    }))
    localStorage.clear()
    const data2 = makeFakeData(Object.fromEntries(data.store))
    await bootCloudOnly(data2)

    const { default: economy2 } = await import('@/use/useEconomy')
    const campaign2 = await import('@/use/useCampaign')
    expect(economy2().coins.value).toBeGreaterThanOrEqual(640)
    expect(campaign2.bestNode.value).toBe(1)
    expect(campaign2.unlockedRunes.value).toContain('archer')
    // Node 1 was cleared, so the resumed node is the NEXT one.
    const { battle: battle2 } = await import('@/use/useBattle')
    battle2.startNode()
    expect(battle2.node.value?.id).toBe(2)
    const { flushPersist: fp2 } = await import('@/use/useGlyphyxState')
    fp2()
  })
})
