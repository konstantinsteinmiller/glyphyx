import { describe, expect, it } from 'vitest'
import { GLYPH_COLORS, GLYPH_PATHS, glyphSvgPath } from '@/game/glyphs'
import { RUNES, RUNE_TYPES } from '@/game/rules'

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
