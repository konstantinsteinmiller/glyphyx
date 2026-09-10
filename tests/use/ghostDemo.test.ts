import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nodeConfig } from '@/game/campaign'

/**
 * ─── The ghost hand demonstrates the gesture the game is played with ────────
 *
 * 1-1 is the whole tutorial for placement, and for a long time it taught the
 * wrong thing: the ghost dropped a sword in the middle of a tile facing
 * nothing, and then pressed the stone and flicked it round inside a correction
 * window that was HELD open until the player copied it. Two gestures, a second
 * of waiting, and the second gesture is now the FALLBACK — the game aims by
 * where inside the tile the stone is released.
 *
 * So the demonstration has to be the one-gesture placement, and it has to look
 * like the player's own: the same compass, from the same painter, lighting the
 * same wedge. This file pins that, because it is invisible to a mount — the
 * ghost is painted onto a canvas jsdom will not rasterise, and a regression
 * here does not fail anything else. It reads the source instead.
 *
 * Line endings are normalised first: this repo is LF (see `.gitattributes`),
 * but a tool that writes CRLF once would otherwise turn every `indexOf`
 * anchor below into a silent -1.
 */

const src = readFileSync(resolve(__dirname, '../../src/use/useArenaArt.ts'), 'utf8').replace(/\r\n/g, '\n')

/** The body of a top-level painter in `useArenaArt`, up to the next one. */
const painter = (name: string): string => {
  const start = src.indexOf(`const ${name} = (`)
  expect(start, `${name} is gone from useArenaArt`).toBeGreaterThan(-1)
  const rest = src.slice(start + 8)
  const next = rest.search(/\n {2}const \w+ = \(/)
  return next < 0 ? rest : rest.slice(0, next)
}

describe('the 1-1 ghost teaches the one-gesture placement', () => {
  it('carries the stone into the region that faces the target and lets go there', () => {
    const body = painter('drawGhost')
    // The release point is the region's OWN anchor, so the demonstration and
    // the hit test cannot drift apart: both read `regionAnchors`.
    expect(body).toMatch(/const \[ax, ay\] = regionAnchors\(type, g\.dir\)/)
    expect(body).toMatch(/const aimX = rect\.x \+ rect\.w \* ax/)
    // The finger travels from the tile's middle to that anchor…
    expect(body).toMatch(/fx = tx \+ \(aimX - tx\) \* k/)
    // …and the stone is released THERE, not back in the middle.
    expect(body).toMatch(/pebbleX = aimX/)
  })

  it('lights the tile\'s compass twice: while carrying, and at the release', () => {
    const body = painter('drawGhost')
    expect(body.match(/drawGhostCompass\(/g) ?? []).toHaveLength(2)
  })

  it('paints that compass with the player\'s own painter, at the finger\'s weights', () => {
    const body = painter('drawGhostCompass')
    // The same function the hover path calls — not a look-alike. A second
    // implementation would let the lesson and the game disagree on the shape
    // of a wedge, which is the one thing this demonstration exists to teach.
    expect(body).toMatch(/paintAimRegion\(ctx, rect, type/)
    // Every facing on offer, not only the chosen one: the point is that a tile
    // holds four of them.
    expect(body).toMatch(/for \(const d of aimRegions\(type\)\)/)
    // Leaned out toward the rim and rimmed heavy, because the ghost is a finger.
    expect(body).toMatch(/TOUCH_LEAN/)
    expect(body).toMatch(/rim: TOUCH_RIM/)
  })

  it('keeps the press-and-flick beat for the correction it still is', () => {
    // The old gesture is not deleted — it is how a finger fixes a mis-drop and
    // how a keyboard aims — it just is not what minute one teaches. Its beat
    // stays reachable for any lesson whose ghost script carries a `reaim`.
    expect(painter('drawReaimBeat')).toMatch(/drawGhostArrow\(tx, ty, dir, turn, size\)/)
    expect(painter('drawGhost')).toMatch(/if \(g\.mode === 'reaim'\)/)
  })

  it('and 1-1 asks for exactly that: one drop, aimed at the skeleton', () => {
    const g = nodeConfig(1, 'medium').ghost!
    expect(g).toMatchObject({ type: 'melee', to: { col: 1, row: 2 }, dir: 'left' })
    // No `reaim`: nothing to correct, so nothing holds the window open.
    expect(g.reaim).toBeUndefined()
  })
})
