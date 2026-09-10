import { afterEach, describe, expect, it, vi } from 'vitest'
import { onArtChanged, setArtOverrides, spriteFor, type ArtChange } from '@/game/art'
import { ART_CATALOGUE } from '@/game/artCatalogue'
import { FACTION_DEFS, MAX_LEVEL, RUNE_TYPES, SKIN_IDS } from '@/game/rules'
import { dropBakesFor, paintingsInPebble } from '@/use/useArenaArt'

/**
 * ─── Only rebuild what changed ──────────────────────────────────────────────
 *
 * Every painting that decodes used to throw away every baked sprite, the
 * backdrop and the plate — 91 full re-bakes in the first seconds of play. The
 * art layer now says WHICH painting arrived, and the renderer drops only the
 * bakes made from it. These pin the two halves of that: the message, and the
 * map from a bake back to the paintings it is made of.
 */

/** An `Image` that loads when the test says so, since jsdom never fetches one. */
class FakeImage {
  static made: FakeImage[] = []
  naturalWidth = 0
  src = ''
  decoding = ''
  private handlers: Record<string, () => void> = {}
  constructor () { FakeImage.made.push(this) }
  addEventListener (type: string, fn: () => void): void { this.handlers[type] = fn }
  fire (type: 'load' | 'error', width = 256): void { this.naturalWidth = width; this.handlers[type]?.() }
}

describe('the art layer says which painting arrived', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('names the painting on a decode, and says "everything" when the flag flips', () => {
    vi.stubGlobal('Image', FakeImage)
    const heard: ArtChange[] = []
    const off = onArtChanged((c) => heard.push(c))
    setArtOverrides(true, false)
    expect(heard).toEqual([null, null]) // the refresh, then the switch itself

    heard.length = 0
    spriteFor('rune', 'melee-river-lv1')
    FakeImage.made.at(-1)!.fire('load')
    expect(heard).toEqual([{ kind: 'rune', id: 'melee-river-lv1' }])

    // A miss changes nothing on screen, so it tells nobody.
    spriteFor('tile', 'neutral')
    FakeImage.made.at(-1)!.fire('error')
    expect(heard).toHaveLength(1)
    off()
  })
})

describe('a baked stone knows which paintings it is made of', () => {
  it('its own stone, and from Lv 2 its rune\'s wreath', () => {
    expect(paintingsInPebble('melee|1|p:river|64')).toEqual(['rune/melee-river-lv1'])
    expect(paintingsInPebble('archer|5|e:goblin|72')).toEqual(['rune/archer-e-goblin-lv2', 'fx/laurel-archer'])
  })

  it('names a catalogued painting for every stone the arena can bake', () => {
    const catalogued = new Set(Object.entries(ART_CATALOGUE).flatMap(([k, ids]) => ids.map((id) => `${k}/${id}`)))
    const tints = [...SKIN_IDS.map((s) => `p:${s}`), ...Object.keys(FACTION_DEFS).map((f) => `e:${f}`)]
    for (const type of RUNE_TYPES) {
      for (let level = 1; level <= MAX_LEVEL; level++) {
        for (const tint of tints) {
          for (const art of paintingsInPebble(`${type}|${level}|${tint}|64`)) expect(catalogued, art).toContain(art)
        }
      }
    }
  })
})

describe('an arrival drops only the renderer bakes that hold it', () => {
  it.each([
    ['bg', 'sky', { backdrop: true, plate: false }],
    ['bg', 'ridge-near', { backdrop: true, plate: false }],
    ['tile', 'frame', { backdrop: false, plate: true }],
    ['tile', 'neutral', { backdrop: false, plate: true }],
    ['tile', 'player', { backdrop: false, plate: false }],
    ['rune', 'melee-river-lv1', { backdrop: false, plate: false }],
    ['fx', 'laurel-melee', { backdrop: false, plate: false }],
    ['ui', 'reroll', { backdrop: false, plate: false }],
    ['monster', 'bonecap', { backdrop: false, plate: false }]
  ] as const)('%s/%s', (kind, id, held) => {
    expect(dropBakesFor(kind, id)).toEqual(held)
  })
})
