// Pins the literal string values of SAVE_KEYS. These keys are a contract with
// every player's save blob — renaming one strands existing players' progress on
// the old field, and the cloud strategies key their manifests off these exact
// strings. `src/keys.ts` is the single source of truth; this test is the tripwire
// that catches an accidental rename during a refactor.

import { describe, expect, it } from 'vitest'
import { SAVE_KEYS, isPayloadKey, META_KEY } from '@/utils/save/SaveMergePolicy'
import { STATE_KEY } from '@/use/useGlyphyxState'

describe('SAVE_KEYS values are stable', () => {
  it('BEST_NODE key is the literal "gx_best_node"', () => {
    expect(SAVE_KEYS.BEST_NODE).toBe('gx_best_node')
  })
  it('COINS key is the literal "gx_coins"', () => {
    expect(SAVE_KEYS.COINS).toBe('gx_coins')
  })
  it('UNLOCKED_RUNES key is the literal "gx_unlocked_runes"', () => {
    expect(SAVE_KEYS.UNLOCKED_RUNES).toBe('gx_unlocked_runes')
  })
  it('MATCHES key is the literal "gx_matches"', () => {
    expect(SAVE_KEYS.MATCHES).toBe('gx_matches')
  })
})

describe('the persisted surface is exactly one state blob plus the meta blob', () => {
  it('accepts the state blob and the meta blob', () => {
    expect(STATE_KEY).toBe('glyphyx_state')
    expect(isPayloadKey(STATE_KEY)).toBe(true)
    expect(isPayloadKey(META_KEY)).toBe(true)
  })

  it('accepts stray per-field gx_* writes so nothing is silently dropped', () => {
    expect(isPayloadKey(SAVE_KEYS.COINS)).toBe(true)
    expect(isPayloadKey('gx_anything_new')).toBe(true)
  })

  it('rejects foreign keys so ad-tech / dev scribbles never reach the cloud', () => {
    for (const key of ['debug', 'cheat', 'prebid11_exp', 'li-module-enabled', 'epic_stage', 'ts_coins', 'tower_state']) {
      expect(isPayloadKey(key)).toBe(false)
    }
  })
})
