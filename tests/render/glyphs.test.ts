import { describe, expect, it } from 'vitest'
import { GLYPH_COLORS, GLYPH_HEADING, GLYPH_PATHS, glyphSpin, glyphSvgPath } from '@/game/glyphs'
import { DIR_VEC, RUNES, RUNE_TYPES, dirsFor, type Dir } from '@/game/rules'

/**
 * The five glyphs are single SVG paths filled once. jsdom cannot rasterise
 * them, so what is asserted is the contract the renderer relies on: every
 * rune has one, it parses as path syntax, it is closed, and it fits the box.
 */

const TOKEN = /^[MLHVCSQTAZmlhvcsqtaz]$|^-?\d+(\.\d+)?$/

describe('glyph paths', () => {
  it('exist for every rune type and carry the roster colour', () => {
    for (const type of RUNE_TYPES) {
      expect(GLYPH_PATHS[type].length).toBeGreaterThan(20)
      expect(GLYPH_COLORS[type]).toBe(RUNES[type].color)
      expect(glyphSvgPath(type)).toBe(GLYPH_PATHS[type])
    }
  })

  it('parse as path data: commands and numbers only', () => {
    for (const type of RUNE_TYPES) {
      const tokens = GLYPH_PATHS[type].replace(/([A-Za-z])/g, ' $1 ').trim().split(/[\s,]+/)
      for (const tok of tokens) expect(tok, `${type}: ${tok}`).toMatch(TOKEN)
    }
  })

  it('are closed sub-paths that stay inside the 100×100 box', () => {
    for (const type of RUNE_TYPES) {
      const d = GLYPH_PATHS[type]
      // Every M opens a sub-path that ends in a Z.
      expect((d.match(/M/g) ?? []).length).toBe((d.match(/Z/g) ?? []).length)
      const nums = d.replace(/[A-Za-z]/g, ' ').trim().split(/[\s,]+/).map(Number)
      for (const n of nums) {
        expect(Number.isFinite(n)).toBe(true)
        expect(Math.abs(n)).toBeLessThanOrEqual(100)
      }
    }
  })
})

/**
 * ─── Which way a stone turns ────────────────────────────────────────────────
 *
 * The renderer rotates a rune's stone so the glyph on it points the way the
 * rune fires. That only works while `GLYPH_HEADING` still describes the
 * drawing above it — a redrawn glyph that forgets to update its heading would
 * put every sword on the board at ninety degrees to its own arrow, silently.
 */
describe('glyph headings', () => {
  it('names a heading for every rune, and only a legal one', () => {
    for (const type of RUNE_TYPES) {
      const heading = GLYPH_HEADING[type]
      expect(heading, type).toBeDefined()
      if (heading === 'omni') continue
      // A heading has to be a facing the rune can actually take, or the stone
      // would start its turn from an angle the game never asks for.
      expect(dirsFor(type), `${type} heading ${heading}`).toContain(heading)
    }
  })

  it('does not turn what has nowhere to point', () => {
    // An omni rune has no facing; a rune wearing `omni` as its heading has no
    // direction drawn into its glyph. Neither ever turns.
    for (const type of RUNE_TYPES) {
      expect(glyphSpin(type, 'omni'), `${type}/omni`).toBe(0)
      if (GLYPH_HEADING[type] !== 'omni') continue
      for (const dir of dirsFor(type)) expect(glyphSpin(type, dir), `${type}/${dir}`).toBe(0)
    }
  })

  it('turns a rune exactly onto its facing', () => {
    // The test that matters: spin the glyph's own heading vector by the angle
    // and it must land on the facing's vector. That is the whole contract, and
    // it holds for every rune and every direction it can take.
    for (const type of RUNE_TYPES) {
      const heading = GLYPH_HEADING[type]
      if (heading === 'omni') continue
      const [hx, hy] = DIR_VEC[heading]
      for (const dir of dirsFor(type)) {
        if (dir === 'omni') continue
        const a = glyphSpin(type, dir)
        const [dx, dy] = DIR_VEC[dir]
        const n = Math.hypot(dx, dy) || 1
        const turnedX = hx * Math.cos(a) - hy * Math.sin(a)
        const turnedY = hx * Math.sin(a) + hy * Math.cos(a)
        const m = Math.hypot(turnedX, turnedY) || 1
        expect(turnedX / m, `${type}/${dir} x`).toBeCloseTo(dx / n, 6)
        expect(turnedY / m, `${type}/${dir} y`).toBeCloseTo(dy / n, 6)
      }
    }
  })

  it('always turns the SHORT way round', () => {
    // A stone re-aimed from left to up swings a quarter turn. An angle outside
    // (-PI, PI] would take it three quarters of the way round the other way,
    // through the facing the player had just rejected.
    for (const type of RUNE_TYPES) {
      for (const dir of dirsFor(type)) {
        const a = glyphSpin(type, dir)
        expect(Math.abs(a), `${type}/${dir}`).toBeLessThanOrEqual(Math.PI + 1e-9)
      }
    }
  })

  it('leaves a rune that is already pointing the right way alone', () => {
    for (const type of RUNE_TYPES) {
      const heading = GLYPH_HEADING[type] as Dir
      if (heading === 'omni') continue
      expect(glyphSpin(type, heading), type).toBe(0)
    }
  })
})
