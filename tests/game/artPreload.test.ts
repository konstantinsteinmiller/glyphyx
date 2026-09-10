import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = new Map<string, unknown>()
vi.mock('@/use/useGlyphyxState', () => ({
  getState: (key: string, fallback?: unknown) => (state.has(key) ? state.get(key) : fallback)
}))

const settled: [string, string, string | undefined][] = []
let overridesOn = true
vi.mock('@/game/art', () => ({
  artOverridesEnabled: () => overridesOn,
  artSettled: (kind: string, id: string, priority?: string) => {
    settled.push([kind, id, priority])
    return Promise.resolve()
  }
}))

import {
  criticalArtWants, earlyArtWants, allArtWants, artTiers, resumeNode, resumeRunes, resumeSkin, skinStoneWants, factionStoneWants,
  preloadRemainingArt, __resetArtPreload
} from '@/game/artPreload'
import { allArtIds, ART_CATALOGUE } from '@/game/artCatalogue'
import { nodeConfig } from '@/game/campaign'
import { FACTION_DEFS, SKIN_IDS } from '@/game/rules'
import { NODE_KEY, SKIN_KEY, UNLOCKED_RUNES_KEY } from '@/keys'

const key = (w: readonly [string, string]): string => `${w[0]}/${w[1]}`

beforeEach(() => {
  state.clear()
  settled.length = 0
  overridesOn = true
  __resetArtPreload()
})
afterEach(() => { vi.useRealTimers() })

describe('what the save says', () => {
  it('resumes at node 1 and the starting skin with no save, and never trusts a surprise', () => {
    expect(resumeNode()).toBe(1)
    expect(resumeSkin()).toBe('river')
    state.set(NODE_KEY, '7.9')
    state.set(SKIN_KEY, 'ember')
    expect(resumeNode()).toBe(7)
    expect(resumeSkin()).toBe('ember')
    state.set(NODE_KEY, 'NaN')
    state.set(SKIN_KEY, 'granite')
    expect(resumeNode()).toBe(1)
    expect(resumeSkin()).toBe('river')
  })

  it('reads the unlocked roster, and a garbled one still holds the sword', () => {
    // No save at all: one rune, so the splash waits for two stones.
    expect(resumeRunes()).toEqual(['melee'])
    state.set(UNLOCKED_RUNES_KEY, ['melee', 'archer', 'cleave'])
    expect(resumeRunes()).toEqual(['melee', 'archer', 'cleave'])
    // Junk, duplicates and a rune that no longer exists are dropped; the
    // starting sword is added back whatever the blob says.
    state.set(UNLOCKED_RUNES_KEY, ['archer', 'archer', 'catapult', 7, null])
    expect(resumeRunes()).toEqual(['archer', 'melee'])
    state.set(UNLOCKED_RUNES_KEY, 'not an array')
    expect(resumeRunes()).toEqual(['melee'])
  })
})

describe('tier 0 — the first screen', () => {
  it('holds the board, the horizon, the chips, the commanders of the node and the EQUIPPED skin\'s UNLOCKED stones', () => {
    state.set(SKIN_KEY, 'jade')
    state.set(UNLOCKED_RUNES_KEY, ['melee', 'archer', 'mage', 'defense', 'support'])
    const wants = criticalArtWants(nodeConfig(1, 'medium')).map(key)
    for (const id of ['tile/player', 'tile/enemy', 'tile/neutral', 'tile/frame', 'bg/ridge-far', 'bg/ridge-near',
      'ui/chest', 'ui/ribbon', 'ui/coin', 'ui/forge', 'ui/reroll', 'hero/teal']) {
      expect(wants).toContain(id)
    }
    // Both levels of each of the five runes this save has earned…
    const jade = skinStoneWants('jade', ['melee', 'archer', 'mage', 'defense', 'support']).map(key)
    expect(jade.length).toBe(10)
    for (const id of jade) expect(wants).toContain(id)
    // …and not one stone for the three the campaign has not handed over yet.
    for (const locked of ['cleave', 'roller', 'bombard']) {
      expect(wants.some((w) => w.startsWith(`rune/${locked}-`))).toBe(false)
    }
    // Not the other skins — an ember orb is bought in chapter 3.
    expect(wants.some((w) => w.includes('-ember-'))).toBe(false)
    // Only the node's own commander(s), not all four.
    const commanders = wants.filter((w) => w.startsWith('monster/'))
    expect(commanders.length).toBe(new Set(nodeConfig(1, 'medium').enemies.map((e) => e.faction)).size)
  })

  it('fetches every commander when the node is unknown', () => {
    const wants = criticalArtWants(null).map(key)
    for (const f of Object.values(FACTION_DEFS)) expect(wants).toContain(`monster/${f.avatar}`)
  })

  it('never lists a want twice', () => {
    const wants = criticalArtWants(null).map(key)
    expect(new Set(wants).size).toBe(wants.length)
  })
})

describe('tier 1 — the first reveals', () => {
  it('puts the node\'s own factions first, then the rest of the chapter, then the effects', () => {
    const config = nodeConfig(2, 'medium')
    const own = [...new Set(config.enemies.map((e) => e.faction))]
    const wants = earlyArtWants(config, ['undead', 'orc', ...own]).map(key)
    const ownStones = own.flatMap((f) => factionStoneWants(f).map(key))
    expect(wants.slice(0, ownStones.length)).toEqual(ownStones)
    expect(wants.filter((w) => w.startsWith('fx/')).length).toBe(ART_CATALOGUE.fx.length)
    expect(wants).toContain('round/spark')
  })
})

describe('the three tiers together', () => {
  it('cover every catalogue id exactly once, for a new player and for one deep in the campaign', () => {
    for (const [node, skin] of [[1, 'river'], [19, 'amber']] as const) {
      state.set(NODE_KEY, node)
      state.set(SKIN_KEY, skin)
      const config = nodeConfig(node, 'medium')
      const [t0, t1, t2] = artTiers(config, Object.keys(FACTION_DEFS) as (keyof typeof FACTION_DEFS)[])
      const all = [...t0, ...t1, ...t2].map(key)
      expect(new Set(all).size).toBe(all.length)
      expect(new Set(all)).toEqual(new Set(allArtIds().map(key)))
      expect(all.length).toBe(allArtWants().length)
      // The equipped skin's UNLOCKED stones are in tier 0 and the rest of that
      // skin in tier 1 (a chest can hand a locked rune over at any moment);
      // every other skin's stones wait for tier 2. Neither save here sets an
      // unlocked roster, so the sword is all either of them holds.
      for (const s of SKIN_IDS) {
        for (const w of skinStoneWants(s)) {
          const tier = s !== skin ? t2 : key(w).startsWith('rune/melee-') ? t0 : t1
          expect(tier.map(key)).toContain(key(w))
        }
      }
    }
  })
})

describe('preloadRemainingArt', () => {
  it('asks for nothing with the art layer off', async () => {
    overridesOn = false
    await preloadRemainingArt()
    expect(settled).toEqual([])
  })

  it('awaits tier 1 in order, then sweeps tier 2 at low priority, once', async () => {
    vi.useFakeTimers()
    state.set(NODE_KEY, 3)
    const run = preloadRemainingArt()
    await vi.runAllTimersAsync()
    await run
    const config = nodeConfig(3, 'medium')
    const [, t1, t2] = artTiers(config, Object.keys(FACTION_DEFS) as (keyof typeof FACTION_DEFS)[])
    expect(settled.length).toBe(t1.length + t2.length)
    expect(settled.slice(0, t1.length).map(([k, id]) => `${k}/${id}`)).toEqual(t1.map(key))
    for (const [, , priority] of settled.slice(t1.length)) expect(priority).toBe('low')
    // Idempotent.
    const again = preloadRemainingArt()
    await vi.runAllTimersAsync()
    await again
    expect(settled.length).toBe(t1.length + t2.length)
  })

  it('stops after tier 1 on a data-saver connection', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true })
    try {
      const run = preloadRemainingArt()
      await vi.runAllTimersAsync()
      await run
      const [, t1] = artTiers(nodeConfig(1, 'medium'), Object.keys(FACTION_DEFS) as (keyof typeof FACTION_DEFS)[])
      expect(settled.length).toBe(t1.length)
    } finally {
      Object.defineProperty(navigator, 'connection', { value: undefined, configurable: true })
    }
  })
})
