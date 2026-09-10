// @vitest-environment node
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'
import { SHEETS, WALKS, SCENERY, SINGLES, promptDocs, promptForSheet, promptForWalk, promptForScenery, promptForSingle } from '@/game/artSheet'
// @ts-expect-error — plain .mjs tool, no types
import { imageSize, parsePromptDoc } from '../../tools/art-desk/jobs.mjs'
// @ts-expect-error — plain .mjs tool, no types
import { fileReturn } from '../../tools/art-desk/pipeline.mjs'

/** What the desk sends is the builder's text minus its `# name (file → target)` line. */
const body = (text: string): string => text.slice(text.indexOf('\n') + 1).replace(/^\n+/, '')

describe('the Art Desk sends exactly what the manifest wrote', () => {
  const parsed = Object.entries(promptDocs()).flatMap(([doc, text]) => parsePromptDoc(text, doc))
  const byRef = new Map(parsed.map((j: { refName: string }) => [j.refName, j]))

  it('finds one job per prompt block, in every document', () => {
    expect(parsed.length).toBe(SHEETS.length + WALKS.length + SCENERY.length + SINGLES.length)
    expect(byRef.size).toBe(parsed.length)
  })

  it('every prompt is byte-identical to its builder, so automating it changes nothing', () => {
    const expected: [string, string][] = [
      ...SHEETS.map((s) => [`${s.file}.png`, body(promptForSheet(s))] as [string, string]),
      ...WALKS.map((w) => [`${w.file}.png`, body(promptForWalk(w))] as [string, string]),
      ...SCENERY.map((a) => [`${a.file}.png`, body(promptForScenery(a))] as [string, string]),
      ...SINGLES.map((t) => [`${t.file}.png`, body(promptForSingle(t))] as [string, string])
    ]
    for (const [ref, text] of expected) expect(byRef.get(ref)?.prompt, ref).toBe(text)
  })

  it('reads the target out of the heading when it has one', () => {
    const w = WALKS[0]
    expect(byRef.get(`${w.file}.png`)?.target).toBe(w.target)
    expect(byRef.get(`${SHEETS[0].file}.png`)?.target).toBeNull()
  })

  it('survives a title with brackets and a body that holds a fence of its own', () => {
    const doc = ['## Stones (the big ones)  (sheet-x.png → images/x.webp)', '', '````text', 'line', '```', 'inner', '```', 'last', '````'].join('\n')
    expect(parsePromptDoc(doc, 'D.md')).toEqual([
      { title: 'Stones (the big ones)', refName: 'sheet-x.png', target: 'images/x.webp', prompt: 'line\n```\ninner\n```\nlast', doc: 'D.md' }
    ])
  })
})

describe('imageSize reads the three formats Gemini hands back', () => {
  it.each(['png', 'jpeg', 'webp'] as const)('%s', async (fmt) => {
    const buf = await sharp({ create: { width: 1200, height: 896, channels: 3, background: '#f0f' } })[fmt]().toBuffer()
    expect(imageSize(buf)).toMatchObject({ w: 1200, h: 896 })
  })
})

describe('filing a return', () => {
  let dir = ''
  afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }) })

  it('archives the painting it replaces, and drops that painting\'s receipt line', async () => {
    dir = mkdtempSync(join(tmpdir(), 'desk-'))
    const painted = join(dir, 'painted')
    mkdirSync(painted)
    writeFileSync(join(painted, 'sheet-a.jpg'), await sharp({ create: { width: 8, height: 6, channels: 3, background: '#f0f' } }).jpeg().toBuffer())
    writeFileSync(join(painted, '.sliced.json'), JSON.stringify({ files: { 'sheet-a.jpg': { rev: 'old' }, 'sheet-b.png': { rev: 'b' } } }))
    const fresh = await sharp({ create: { width: 8, height: 6, channels: 3, background: '#0f0' } }).png().toBuffer()

    const r = fileReturn({ root: dir, paintedDir: painted }, { stem: 'sheet-a', refSize: { w: 8, h: 6 } }, fresh)

    expect(readdirSync(painted).filter((f) => !f.startsWith('.'))).toEqual(['replaced', 'sheet-a.png'])
    expect(readdirSync(join(painted, 'replaced'))).toHaveLength(1)
    expect(readFileSync(join(painted, 'sheet-a.png')).equals(fresh)).toBe(true)
    expect(JSON.parse(readFileSync(join(painted, '.sliced.json'), 'utf-8')).files).toEqual({ 'sheet-b.png': { rev: 'b' } })
    expect(r.archived).toEqual(['sheet-a.jpg'])
  })
})
