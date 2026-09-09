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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'art-sheets')
const INDEX = join(OUT, 'sheet-index.json')
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

const sheets = manifest.SHEETS.length
const drawables = manifest.manifestTargets().size
console.log(`\n${sheets} sheets, ${manifest.WALKS.length} walks, ${manifest.SCENERY.length} bands, `
  + `${manifest.SINGLES.length} singles — ${drawables} drawables with a target`
  + (fits ? ' (SIZE clauses use the fits the bench measured)' : ' (no sheet-index.json yet — SIZE clauses use the nominal extent)'))
if (CHECK && stale) process.exit(1)
