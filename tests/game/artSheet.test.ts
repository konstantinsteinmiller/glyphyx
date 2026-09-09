import { describe, expect, it } from 'vitest'
import {
  CELL, MAX_EDGE, SHEETS, WALKS, SCENERY, SINGLES, STONE_SPAN,
  sheetRows, sheetSize, aspectOf, manifestTargets, promptForSheet, promptForWalk, promptForScenery, promptForSingle, promptDocs,
  NO_LAUREL
} from '@/game/artSheet'
import { ART_CATALOGUE, allArtIds, artTarget } from '@/game/artCatalogue'
import { RUNE_TYPES, SKIN_IDS, FACTION_DEFS } from '@/game/rules'

/** The aspect ratios an image tool can actually be told to return. */
const STANDARD = new Set(['1:1', '2:1', '4:3', '16:9'])

describe('the manifest and the catalogue agree, both ways', () => {
  it('every catalogue id has exactly one manifest target, and every target is a catalogue id', () => {
    const targets = manifestTargets()
    const catalogue = new Set(allArtIds().map(([kind, id]) => artTarget(kind, id)))
    const missing = [...catalogue].filter((t) => !targets.has(t))
    const extra = [...targets.keys()].filter((t) => !catalogue.has(t))
    expect(missing).toEqual([])
    expect(extra).toEqual([])
    expect(targets.size).toBe(catalogue.size)
  })

  it('names every player stone (type × skin × level) and every enemy stone (type × faction × level)', () => {
    const runes = new Set(ART_CATALOGUE.rune)
    for (const t of RUNE_TYPES) {
      expect(runes.has(t)).toBe(true)
      for (const s of SKIN_IDS) {
        expect(runes.has(`${t}-${s}-lv1`)).toBe(true)
        expect(runes.has(`${t}-${s}-lv2`)).toBe(true)
      }
      for (const f of Object.keys(FACTION_DEFS)) {
        expect(runes.has(`${t}-e-${f}-lv1`)).toBe(true)
        expect(runes.has(`${t}-e-${f}-lv2`)).toBe(true)
      }
    }
    expect(ART_CATALOGUE.rune.length).toBe(RUNE_TYPES.length * (1 + SKIN_IDS.length * 2 + Object.keys(FACTION_DEFS).length * 2))
  })

  it('a target is never claimed twice', () => {
    const seen = new Map<string, string>()
    for (const s of SHEETS) {
      for (const c of s.cells) {
        if (!c.target) continue
        expect(seen.has(c.target), `${c.target} claimed by ${seen.get(c.target)} and ${s.id}`).toBe(false)
        seen.set(c.target, s.id)
      }
    }
    for (const w of WALKS) {
      expect(seen.has(w.target)).toBe(false)
      seen.set(w.target, w.file)
    }
    for (const a of SCENERY) {
      expect(seen.has(a.target)).toBe(false)
      seen.set(a.target, a.file)
    }
  })
})

describe('the lattice is the contract', () => {
  it('sheet ids, files and cell ids are unique', () => {
    const ids = SHEETS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    const files = SHEETS.map((s) => s.file)
    expect(new Set(files).size).toBe(files.length)
    const cellIds = SHEETS.flatMap((s) => s.cells.map((c) => `${s.id}/${c.id}`))
    expect(new Set(cellIds).size).toBe(cellIds.length)
    // A targeted cell's id is its filename stem, so those are unique across sheets too.
    const targeted = SHEETS.flatMap((s) => s.cells.filter((c) => c.target).map((c) => c.id))
    expect(new Set(targeted).size).toBe(targeted.length)
  })

  it('every cell sits on integer lattice coordinates inside its sheet, and no two overlap', () => {
    for (const s of SHEETS) {
      const rows = sheetRows(s)
      const taken: string[][] = []
      for (const c of s.cells) {
        for (const v of [c.col, c.row, c.cw, c.ch]) expect(Number.isInteger(v)).toBe(true)
        expect(c.cw).toBeGreaterThanOrEqual(1)
        expect(c.ch).toBeGreaterThanOrEqual(1)
        expect(c.col + c.cw).toBeLessThanOrEqual(s.cols)
        expect(c.row + c.ch).toBeLessThanOrEqual(rows)
        for (let y = c.row; y < c.row + c.ch; y++) {
          for (let x = c.col; x < c.col + c.cw; x++) {
            taken[y] ??= []
            expect(taken[y]![x], `${s.id}: ${c.id} overlaps ${taken[y]![x]} at ${x},${y}`).toBeUndefined()
            taken[y]![x] = c.id
          }
        }
      }
    }
  })

  it('every sheet is a whole number of cells and a standard aspect ratio', () => {
    for (const s of SHEETS) {
      const { w, h } = sheetSize(s)
      expect(w % CELL).toBe(0)
      expect(h % CELL).toBe(0)
      expect(STANDARD.has(aspectOf(w, h)), `${s.id} is ${aspectOf(w, h)}`).toBe(true)
    }
  })

  it('no frame is written above 256 px unless the manifest says so, and only the frame does', () => {
    for (const s of SHEETS) {
      for (const c of s.cells) {
        // A letterboxed bitmap is restored to its native size, whatever its panel.
        if (!c.target || c.letterboxed) continue
        const edge = Math.max(c.cw, c.ch) * CELL
        if (edge > MAX_EDGE) expect(c.maxEdge, `${c.id} is ${edge} px with no maxEdge`).toBeGreaterThanOrEqual(edge)
        if (c.maxEdge && c.maxEdge > MAX_EDGE) expect(c.id).toBe('frame')
      }
    }
  })

  it('every non-blank cell has a label, a blurb and a target; every blank has none', () => {
    for (const s of SHEETS) {
      for (const c of s.cells) {
        if (c.art.kind === 'blank') {
          expect(c.target).toBeUndefined()
          expect(c.blurb).toBe('')
        } else {
          expect(c.label.length).toBeGreaterThan(0)
          expect(c.blurb.length).toBeGreaterThan(20)
          expect(c.target).toMatch(/^images\/[a-z]+\/[a-z0-9-]+\.webp$/)
        }
      }
    }
  })

  it('the glyph sheet is one square panel per rune, with no blanks to lose', () => {
    // The grid is sized to the ROSTER, not the other way round: nine runes tile
    // three across exactly. A blank panel is the thing these prompts most often
    // lose — an image model fills it in — so the sheet that could most easily
    // grow one is pinned to have none, and to stay square.
    const g = SHEETS.find((s) => s.id === 'glyphs')!
    expect(g.cells).toHaveLength(RUNE_TYPES.length)
    expect(g.cells.map((c) => c.id)).toEqual([...RUNE_TYPES])
    expect(g.cells.some((c) => c.art.kind === 'blank')).toBe(false)
    expect(g.cols * sheetRows(g)).toBe(RUNE_TYPES.length)
    const { w, h } = sheetSize(g)
    expect(aspectOf(w, h)).toBe('1:1')
  })

  it('a cell that fills its panel is a tile or the frame, and a fill cell never carries a fit-normalised shape', () => {
    for (const s of SHEETS) {
      for (const c of s.cells) {
        if (c.fill) expect(['tiles', 'frame']).toContain(s.kind)
        if (s.kind === 'tiles' && c.art.kind !== 'blank') expect(c.fill).toBe(true)
      }
    }
  })

  it('walks are grids of the strip\'s own panels; bands are 4:1', () => {
    for (const w of WALKS) {
      expect(w.frames).toBe(w.cols * w.rows)
      expect(w.w).toBe(w.panelW * w.cols)
      expect(w.h).toBe(w.panelH * w.rows)
      // Within a percent of 16:9 or 2:1 — what a tool can be asked for.
      const r = w.w / w.h
      expect(Math.min(Math.abs(r - 16 / 9), Math.abs(r - 2))).toBeLessThan(0.02)
    }
    // A keyed band is 4:1; the sky is a full-bleed 16:9 backdrop, not a band.
    for (const a of SCENERY) expect(aspectOf(a.w, a.h)).toBe(a.bg === 'opaque' ? '16:9' : '4:1')
  })

  it('there is one single per targeted cell', () => {
    const targeted = SHEETS.flatMap((s) => s.cells.filter((c) => c.target))
    expect(SINGLES.length).toBe(targeted.length)
    expect(new Set(SINGLES.map((t) => t.file)).size).toBe(SINGLES.length)
  })
})

describe('the prompts are generated, complete and deterministic', () => {
  it('a sheet prompt states the deliverable\'s shape, names every panel and carries the magenta rule', () => {
    for (const s of SHEETS) {
      const { w, h } = sheetSize(s)
      const p = promptForSheet(s)
      expect(p).toContain(`${w} x ${h} pixels`)
      expect(p).toContain('#FF00FF')
      expect(p).toContain(`(${s.file}.png)`)
      if (s.kind !== 'frame') expect(p).toContain(`· ${s.cells.length} panels.`)
      for (const c of s.cells) {
        if (c.art.kind === 'blank') expect(p).toContain('BLANK')
        else expect(p).toContain(c.blurb)
      }
      // The style block comes in the fill variant for the board and the part variant for everything else.
      expect(p).toContain(s.kind === 'tiles' || s.kind === 'frame' ? 'fills the panel edge to edge' : 'right up to its outline')
    }
  })

  it('a stone sheet insists on one glyph and says how big the stone is', () => {
    const p = promptForSheet(SHEETS[0]!)
    expect(p).toContain('ONE GLYPH.')
    expect(p).toContain(`${Math.round(STONE_SPAN * 100)}%`)
    // …and a measured fit replaces the nominal number.
    const fits = Object.fromEntries(SHEETS[0]!.cells.map((c) => [c.id, { w: 0.61, h: 0.6, cx: 0.5, cy: 0.5 }]))
    expect(promptForSheet(SHEETS[0]!, fits)).toContain('61%')
  })

  it('walk and band prompts state their size and the ONE CHARACTER rule', () => {
    for (const w of WALKS) {
      const p = promptForWalk(w)
      expect(p).toContain(`${w.w} x ${w.h} pixels`)
      expect(p).toContain(`· ${w.frames} panels.`)
      expect(p).toContain(w.faces.toUpperCase())
      expect(p).toContain('#FF00FF')
    }
    for (const a of SCENERY) {
      const p = promptForScenery(a)
      expect(p).toContain(`${a.w} x ${a.h} pixels`)
      expect(p).toContain(a.blurb)
    }
  })

  it('the documents hold one block per drawable and nothing time-dependent', () => {
    const docs = promptDocs()
    const blocks = (text: string): number => text.split('\n').filter((l) => l.startsWith('## ')).length
    const stones = SHEETS.filter((s) => s.kind === 'stones' || s.kind === 'enemyStones' || s.kind === 'glyphs').length
    expect(blocks(docs['PROMPTS-RUNES.md']!)).toBe(stones)
    expect(blocks(docs['PROMPTS-BOARD.md']!)).toBe(SHEETS.length - stones)
    expect(blocks(docs['PROMPTS-CAST.md']!)).toBe(WALKS.length + SCENERY.length)
    expect(blocks(docs['PROMPTS-SINGLES.md']!)).toBe(SINGLES.length)
    expect(promptDocs()).toEqual(docs)
    for (const text of Object.values(docs)) expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}T/)
  })

  // The copy button in a markdown preview belongs to a fenced block, so every
  // prompt has to BE one: opened and closed exactly once, with the heading and
  // the document's own prose outside it and nothing inside that could close it
  // early. A prompt that leaks a line past its fence is copied short.
  it('every prompt is one fenced block a preview can copy in a click', () => {
    for (const [name, text] of Object.entries(promptDocs())) {
      const headings = text.split('\n').filter((l) => l.startsWith('## ')).length
      const opens = text.match(/^`{3,}text$/gm)?.length ?? 0
      const fences = text.match(/^`{3,}(text)?$/gm)?.length ?? 0
      expect(opens, name).toBe(headings)
      expect(fences, name).toBe(headings * 2)
      // Inside a fence, a stray ``` would end the block early — the bodies carry none.
      let inside = false
      for (const line of text.split('\n')) {
        if (/^`{3,}(text)?$/.test(line)) inside = !inside
        else expect(inside ? line.includes('```') : false, `${name}: ${line}`).toBe(false)
      }
      expect(inside, name).toBe(false)
      expect(text, name).toContain('copy button')
    }
  })

  // The wreath used to live in WORDS in every stone prompt and in no reference
  // panel, so each generation designed its own and no two sheets matched. It is
  // a drawable now — one wreath, painted once, composited by the renderer — and
  // a stone prompt that asks for one again would put a second wreath under it.
  it('no stone prompt asks for a laurel, and every one forbids it', () => {
    const stoneSheets = SHEETS.filter((s) => s.kind === 'stones' || s.kind === 'enemyStones')
    const asks = (text: string): boolean => /laurel|wreath/i.test(text.replace(NO_LAUREL, ''))
    for (const s of stoneSheets) {
      const p = promptForSheet(s)
      expect(p).toContain(NO_LAUREL)
      expect(asks(p), s.id).toBe(false)
      for (const c of s.cells) expect(asks(`${c.blurb} ${c.colour ?? ''}`), c.id).toBe(false)
    }
    for (const t of SINGLES.filter((x) => stoneSheets.some((s) => s.id === x.sheet))) {
      const p = promptForSingle(t)
      expect(p).toContain(NO_LAUREL)
      expect(asks(p), t.id).toBe(false)
    }
  })

  it('the laurel is a drawable of its own — one per stone silhouette — on the fx sheet and in the catalogue', () => {
    for (const shape of ['pebble', 'shard', 'oval', 'hex', 'disc', 'slab'] as const) {
      const cell = SHEETS.flatMap((s) => s.cells).find((c) => c.id === `laurel-${shape}`)
      expect(cell?.target).toBe(artTarget('fx', `laurel-${shape}`))
      expect(cell?.art.kind).toBe('laurel')
      expect(ART_CATALOGUE.fx).toContain(`laurel-${shape}`)
    }
    const cell = SHEETS.flatMap((s) => s.cells).find((c) => c.id === 'laurel-pebble')
    // Its own prompt has to say the wreath comes back EMPTY, or it arrives
    // wrapped round a stone that the game will then draw its own stone behind.
    const p = promptForSheet(SHEETS.find((s) => s.cells.some((c) => c.id === 'laurel-pebble'))!)
    expect(p).toContain('no stone')
  })

  // The sky is the one drawable with no background behind it — it IS the
  // background. Handing it the magenta contract would weld a key colour into
  // the largest bitmap the game ships, and asking a painter to key a band's
  // sky is the opposite mistake: two prompts, and each must carry only its own
  // half of the contract.
  it('the sky prompt fills the frame and never mentions magenta; a band prompt always does', () => {
    const sky = SCENERY.find((a) => a.id === 'sky')!
    expect(sky.bg).toBe('opaque')
    const p = promptForScenery(sky)
    expect(p).toContain('IT FILLS THE IMAGE')
    expect(p).toContain('NO magenta anywhere')
    expect(p).not.toContain('#FF00FF')
    expect(p).toContain(`${sky.w} x ${sky.h} pixels`)
    for (const band of SCENERY.filter((a) => a.bg !== 'opaque')) {
      const b = promptForScenery(band)
      expect(b).toContain('#FF00FF')
      // …and a band must not paint the sky that now sits behind it.
      expect(b).toContain('no stars')
    }
  })

  it('every backdrop layer is drawn by the game, not restyled from a shipped bitmap', () => {
    // The ridges were the previous game's graveyard silhouettes; a restyle of a
    // graveyard is a graveyard, however the prompt describes it.
    for (const a of SCENERY) expect(a.art.kind, a.id).not.toBe('bitmap')
    expect(SCENERY.map((a) => a.id)).toContain('sky')
    for (const a of SCENERY) expect(ART_CATALOGUE.bg).toContain(a.id)
  })

  it('a single prompt is square and names its target', () => {
    const t = SINGLES.find((x) => x.id === 'melee-river-lv1')!
    const p = promptForSingle(t)
    expect(p).toContain('512 x 512')
    expect(p).toContain('images/runes/melee-river-lv1.webp')
    expect(p).toContain('THE GLYPH is')
  })
})
