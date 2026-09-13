import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  __setPaintedManifestForTests, artProbeCount, refreshArtOverrides, setArtOverrides, spriteFor
} from '@/game/art'
import { ART_FOLDERS } from '@/game/artCatalogue'

/**
 * ─── The baked painted-art manifest ─────────────────────────────────────────
 *
 * A BUILD knows which paintings exist and bakes the list (`__PAINTED_ART__`,
 * from `vite.config.ts`). Everything else — dev server, this suite — has no
 * manifest and probes as it always did, because the paint → slice → reload loop
 * depends on finding a file that did not exist when the page booted.
 *
 * What this pins is the shipped half: a drawable with no painting on disk costs
 * ZERO requests. Before the manifest, ~70 parked paintings meant ~70 404s per
 * load, each one a "Missing resource detected" line in a portal's QA console.
 */

const key = (kind: keyof typeof ART_FOLDERS, id: string): string => `${ART_FOLDERS[kind]}/${id}`

beforeEach(() => {
  setArtOverrides(true, false)
  refreshArtOverrides()
})

afterEach(() => {
  __setPaintedManifestForTests(null)
  setArtOverrides(false, false)
})

describe('the painted-art manifest', () => {
  it('probes everything when there is no manifest — the art pipeline must stay able to find new files', () => {
    __setPaintedManifestForTests(null)
    expect(spriteFor('rune', 'melee-river-lv1')).toBeNull()
    expect(spriteFor('fx', 'laurel-melee')).toBeNull()
    // Null because nothing has decoded yet; the point is that both were ASKED for.
    expect(artProbeCount()).toBe(2)
  })

  it('asks for nothing outside the baked manifest, and still asks for what is in it', () => {
    __setPaintedManifestForTests([key('rune', 'melee-river-lv1')])
    expect(spriteFor('rune', 'melee-river-lv1')).toBeNull()
    expect(artProbeCount()).toBe(1)

    // Parked art: no file, so no request, so no 404 in a portal's console.
    expect(spriteFor('fx', 'laurel-melee')).toBeNull()
    expect(spriteFor('rune', 'mage-river-lv2')).toBeNull()
    expect(artProbeCount()).toBe(1)
  })

  it('costs nothing at all with overrides off, manifest or no manifest', () => {
    __setPaintedManifestForTests([key('rune', 'melee-river-lv1')])
    setArtOverrides(false, false)
    expect(spriteFor('rune', 'melee-river-lv1')).toBeNull()
    expect(artProbeCount()).toBe(0)
  })
})
