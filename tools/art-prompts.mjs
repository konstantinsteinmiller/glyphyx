#!/usr/bin/env node
/**
 * Regenerate `art-sheets/PROMPTS-*.md` from the manifest, with no browser.
 *
 *   pnpm art:prompts            # writes the four prompt documents
 *   pnpm art:prompts --check    # exits 1 if they are out of date (CI)
 *
 * The bench (`/#/art-sheets`) writes the same files on export, with the fits
 * it measured folded into the SIZE clauses. This script reads those measured
 * fits back out of `art-sheets/sheet-index.json` when one exists, so the two
 * routes produce the same text — and so a manifest change (a new stone, a new
 * skin, a reworded blurb) has its prompt the moment this runs, before anyone
 * opens a browser. The manifest chain is pure TypeScript with no Vue and no
 * `import.meta.env` in it; `tools/ts-resolve.mjs` is what lets Node load it.
 *
 * Run through the `--import` hook (the pnpm script does):
 *   node --import ./tools/ts-resolve.mjs tools/art-prompts.mjs
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'art-sheets')
const INDEX = join(OUT, 'sheet-index.json')
const PAINTED = join(OUT, 'painted')
const CHECK = process.argv.includes('--check')

const manifest = await import(pathToFileURL(join(ROOT, 'src', 'game', 'artSheet.ts')).href)

/** The fits the bench measured last time it exported, if it has. */
const fitsFromIndex = () => {
  if (!existsSync(INDEX)) return undefined
  try {
    const index = JSON.parse(readFileSync(INDEX, 'utf-8'))
    const fits = {}
    for (const s of index.sheets ?? []) for (const c of s.cells ?? []) if (c.fit) fits[c.id] = c.fit
    return Object.keys(fits).length ? fits : undefined
  } catch {
    return undefined
  }
}

const fits = fitsFromIndex()
const docs = manifest.promptDocs(fits)
mkdirSync(OUT, { recursive: true })

let stale = 0
for (const [name, text] of Object.entries(docs)) {
  const file = join(OUT, name)
  const current = existsSync(file) ? readFileSync(file, 'utf-8') : null
  if (current === text) {
    console.log(`  = ${name}  unchanged`)
    continue
  }
  stale++
  if (CHECK) {
    console.error(`  ! ${name} is out of date — run pnpm art:prompts`)
    continue
  }
  writeFileSync(file, text, 'utf-8')
  console.log(`  ✓ ${name}  ${(text.length / 1024).toFixed(0)} kB`)
}

// ─── What is painted, what is not, and what has gone out of date ────────────
//
// The prompts say how to paint every sheet; they never said which ones still
// NEED painting, so that was worked out by hand each time — and the one state
// nobody thinks to look for, a painting whose drawing has since been re-cut,
// is invisible until it is sliced back over the corrected art.
//
// This is that answer as a file. It is written here and not by the bench,
// because it is a fact about the filesystem (what is in `painted/`, what the
// slicer's receipt says) and the bench runs in a browser. It is a REPORT, so
// `--check` does not police it: it goes out of date the moment a painting
// lands, and running `pnpm art:prompts` again is the whole fix.
//
// The revision of a sheet is the first 12 hex of a sha1 over the CLEAN
// reference the bench exported — the same number `tools/slice-sheets.mjs`
// records, so "the reference changed since this was painted" is one string
// comparison in both tools.

const revOf = (file) => (existsSync(file) ? createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12) : null)

const receipt = (() => {
  const f = join(PAINTED, '.sliced.json')
  if (!existsSync(f)) return {}
  try { return JSON.parse(readFileSync(f, 'utf-8')).files ?? {} } catch { return {} }
})()

/** Every image sitting in `painted/`, by the stem the slicer identifies it with. */
const paintings = existsSync(PAINTED)
  ? readdirSync(PAINTED).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  : []
const quarantined = existsSync(join(PAINTED, 'stale'))
  ? readdirSync(join(PAINTED, 'stale')).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  : []

const paintingFor = (stem) => paintings.find((f) => basename(f).replace(/\.[^.]+$/, '') === stem)
  ?? paintings.find((f) => basename(f).toLowerCase().includes(stem.toLowerCase()))

const stateOf = (stem) => {
  const ref = join(OUT, `${stem}.png`)
  const rev = revOf(ref)
  const painting = paintingFor(stem)
  if (!painting) {
    const parked = quarantined.find((f) => f.replace(/\.[^.]+$/, '') === stem)
    return parked
      ? { mark: '!', state: 'REPAINT — the old one is parked in `painted/stale/`', painting: parked, rev }
      : { mark: '·', state: 'not painted yet', painting: null, rev }
  }
  let seen = receipt[painting]
  // The receipt line belongs to the painting it was written for: the same name
  // with different bytes is a re-roll nobody has sliced yet.
  if (seen?.painting && seen.painting !== revOf(join(PAINTED, painting))) seen = undefined
  if (seen?.rev && rev && seen.rev !== rev) {
    return { mark: '!', state: `REPAINT — the reference changed (${seen.rev} → ${rev})`, painting, rev }
  }
  // No receipt only means nobody has sliced it SINCE receipts existed — the
  // sprites may well be on disk from before. It is not evidence either way,
  // which is exactly why it gets its own mark instead of a guess.
  if (!seen) return { mark: '?', state: 'painted; no receipt yet — `pnpm art:slice -- --dry` to check it', painting, rev }
  return { mark: '✓', state: `sliced ${String(seen.at).slice(0, 10)}`, painting, rev }
}

const docFor = (sheet) => (['stones', 'enemyStones', 'glyphs'].includes(sheet.kind) ? 'PROMPTS-RUNES.md' : 'PROMPTS-BOARD.md')

const rows = [
  ...manifest.SHEETS.map((s) => ({ what: 'sheet', id: s.id, title: s.title, stem: s.file, doc: docFor(s) })),
  ...manifest.WALKS.map((w) => ({ what: 'walk', id: w.id, title: w.name, stem: w.file, doc: 'PROMPTS-CAST.md' })),
  ...manifest.SCENERY.map((a) => ({ what: 'band', id: a.id, title: a.name ?? a.id, stem: a.file, doc: 'PROMPTS-CAST.md' }))
].map((r) => ({ ...r, ...stateOf(r.stem) }))

const tally = { '✓': 0, '!': 0, '?': 0, '·': 0 }
for (const r of rows) tally[r.mark]++

const status = [
  '# Paint status — generated by `pnpm art:prompts`',
  '',
  'A report, not a contract: it is a picture of `art-sheets/painted/` and the',
  'slicer\'s receipt at the moment it was written. Re-run `pnpm art:prompts`',
  'after painting or slicing anything.',
  '',
  `**${tally['✓']} sliced · ${tally['!']} need a repaint · ${tally['?']} painted, unreceipted · ${tally['·']} outstanding**`,
  '',
  '| | Sheet | Prompt block in | Reference | State |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.mark} | **${r.title}** | \`${r.doc}\` | \`${r.stem}.png\`${r.rev ? ` (rev \`${r.rev}\`)` : ' — *missing, run `pnpm art:export`*'} | ${r.state} |`),
  '',
  '## What the marks mean',
  '',
  '* **✓** sliced, and the drawing has not moved since.',
  '* **!** a painting of a drawing that has since been RE-CUT. `pnpm art:slice`',
  '  refuses it and says so; repaint from the reference, or `--stale-ok` if you',
  '  know the change was cosmetic.',
  '* **?** a painting is sitting in `painted/` with no receipt against it. That',
  '  is not evidence it was never cut — receipts are newer than the folder — so',
  '  run `pnpm art:slice -- --dry` and read what it says it would write.',
  '* **·** nothing painted for this one yet — attach the reference and paste its',
  '  block from the prompt file named above.',
  ''
].join('\n')

const statusFile = join(OUT, 'PAINT-STATUS.md')
if (!CHECK) {
  writeFileSync(statusFile, status, 'utf-8')
  console.log(`  ✓ PAINT-STATUS.md  ${tally['✓']} sliced, ${tally['!']} stale, ${tally['?']} uncut, ${tally['·']} outstanding`)
}

const sheets = manifest.SHEETS.length
const drawables = manifest.manifestTargets().size
console.log(`\n${sheets} sheets, ${manifest.WALKS.length} walks, ${manifest.SCENERY.length} bands, `
  + `${manifest.SINGLES.length} singles — ${drawables} drawables with a target`
  + (fits ? ' (SIZE clauses use the fits the bench measured)' : ' (no sheet-index.json yet — SIZE clauses use the nominal extent)'))
if (CHECK && stale) process.exit(1)
