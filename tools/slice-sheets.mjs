#!/usr/bin/env node
/**
 * ─── Sheet slicer ───────────────────────────────────────────────────────────
 *
 * The return half of the art pipeline. `/#/art-sheets` bakes the procedural
 * cast onto a 256 px lattice and out to an image model; this takes the
 * repainted sheet and cuts it back into the drop-in bitmaps `spriteFor()`
 * probes for — `public/images/runes/melee-river-lv1.webp` and the rest.
 *
 *   node tools/slice-sheets.mjs art-sheets/painted/sheet-runes-melee.png
 *   pnpm art:slice                         # every image in art-sheets/painted/
 *   pnpm art:slice -- --dry                # print the plan, write nothing
 *
 * WHAT IT DOES TO A PANEL
 *
 * A lattice sheet is cut on the index's rects. Every panel with a target is
 * keyed (magenta → transparent), then NORMALISED onto the reference: the
 * bench recorded where the drawing sat in its panel (`fit`: the solid-pixel
 * box as fractions of the panel), the return is measured the same way, and
 * one scale-and-move puts the painted stone exactly where the drawn one was.
 * The renderer then blits the file into the same box it paints in, and the
 * painting replaces the drawing 1:1 without a scale knob anywhere. A panel
 * the index marks `fill` (a tile, the frame) is trimmed to its own edges
 * instead: it must reach all four sides or it tiles with a seam.
 *
 * WHY IT DRIVES A BROWSER
 *
 * The renderer only ever probes for `.webp`, and Node has no image encoder in
 * the standard library. The choice was a native dependency (`sharp`) in a
 * project that ships to eight portals, or the encoder that is already installed
 * on this machine. Chrome decodes the PNG, crops on a canvas and encodes WebP
 * in three lines — so the pipeline stays dependency-free, and it is the same
 * isolated-profile harness the export bench is driven with.
 *
 * WHAT IT REFUSES TO DO
 *
 * The whole contract is that cell N comes back at the pixels cell N went out
 * at. An image model that re-composed the grid produces a file that still looks
 * fine and slices into garbage — every sprite a few pixels off centre, which
 * nobody notices until the board looks subtly wrong. So a sheet whose grid no
 * longer matches the index is REJECTED rather than best-guessed.
 *
 * That test is a SHAPE test, and it is deliberately not a strict one. A return
 * whose proportions drifted a percent — 1456x720 for a 1024x506 sheet — has not
 * re-composed anything: the rects are read per axis (`c.x * sx`, `c.y * sy`),
 * so every panel still lands on its own content and is resampled back to its
 * nominal box on the way out. Refusing that throws away a good generation over
 * arithmetic this file already does for strips and walks. A grid that really
 * WAS re-composed misses by an order of magnitude more (the glyph sheet re-laid
 * from 3 across to 5 came back 19% off), so the threshold separates them
 * cleanly.
 *
 * WHAT IT REFUSES TO DO TWICE
 *
 * A painting is a snapshot of a DRAWING, and the drawing moves. The bow was
 * re-cut after its stones were painted, and nothing in the pipeline noticed:
 * `pnpm art:slice` would have cheerfully re-installed twelve stones carrying
 * the old silhouette over the corrected one, silently, on the next run anybody
 * made for an unrelated sheet.
 *
 * So a successful slice leaves a RECEIPT (`painted/.sliced.json`) naming the
 * revision of the reference each file was cut against — the hash of the clean
 * sheet the bench exported. When the reference has changed since, the painting
 * is refused with the reason, because it is now a painting of something else.
 * `--stale-ok` slices it anyway for the cases where the change was cosmetic and
 * the operator knows it.
 *
 * Without a receipt (a fresh clone, a first run) nothing is refused: mtimes
 * after a checkout say nothing, so an older-looking file is a WARNING and the
 * slice goes ahead.
 *
 * WHAT IT READS BEFORE IT CUTS
 *
 * A lattice cut is blind: it trusts that cell N's paint is inside cell N's
 * rect and nothing else is. An audit of every slice in the game (2026-09-11)
 * found five ways that was false, none of which the shape test can see, so
 * the painting is now read WHOLE before a single rect is cut (`prepareInPage`):
 *
 *   · RE-COMPOSED GRIDS. Three stone sheets came back with THREE states per
 *     skin — eight stones a row where the lattice holds six — at the exact
 *     2:1 the sheet asked for. Every one of the 62 files cut from them held
 *     two half-stones. Now: when paint wider than a line runs across more
 *     than a tenth of the interior cut length, the painting is refused.
 *   · PAINTED GRID LINES. The key sheet's lattice, copied in as thin dark
 *     lines. They survived the key as a frame around every crown, glyph and
 *     warhead, and they were measured as the SUBJECT, so each stone was
 *     normalised against a box the size of its cell and shipped shrunken.
 *     Now: long thin straight runs of paint along a cut line are erased.
 *   · NEIGHBOURS. A stone that drifted across its cut line leaves a sliver in
 *     the next file and a flat side on its own. Now: every blob of paint
 *     belongs to the cell that holds most of it. A cell erases the blobs it
 *     does not own, and cuts wider to take in the ones it does (the fit then
 *     puts the whole stone back in the box).
 *   · MARKS THE DRAWING NEVER HAD. Cell numbers ("1." to "18."), captions
 *     ("Laurel · Sword, Lv 2"), a gold silhouette inside a wreath. Now: a
 *     detached blob, up to STRAY_MAX of a cell, that does not come near
 *     anything in the reference drawing is erased, and the console says so.
 *   · A GROUND THAT IS NOT MAGENTA. The boulder sheet came back on dusty
 *     purple. A few JPEG pixels passed the magenta test, that switched the
 *     flood off, and the spill step turned the purple into a grey card behind
 *     the stone. Now: the key counts as having found the ground only when it
 *     cleared the cell's own border, and a slice whose border is still opaque
 *     where the drawing leaves margin is refused rather than written.
 *
 * `--no-clean` cuts blind as before; `--grid-ok` cuts a painting whose cut
 * lines run through paint anyway.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync,
  existsSync, readdirSync, statSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname, basename, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INDEX = join(ROOT, 'art-sheets', 'sheet-index.json')
const PAINTED = join(ROOT, 'art-sheets', 'painted')
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
]

// ─── Arguments ──────────────────────────────────────────────────────────────

// Options that consume the next argument. Everything else that is not a flag
// is an input path — walked in order rather than filtered, so `--out public`
// cannot leave "public" behind looking like a file to slice.
const VALUED = new Set(['--sheet', '--out', '--size', '--quality', '--fit', '--frames'])
const argv = process.argv.slice(2)
const opts = {}
const files = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (VALUED.has(a)) {
    if (i + 1 >= argv.length) { console.error(`${a} needs a value`); process.exit(1) }
    opts[a] = argv[++i]
  } else if (a.startsWith('-')) {
    opts[a] = true
  } else {
    files.push(a)
  }
}

const flag = (name) => opts[name] === true
const num = (name, fallback) => {
  if (opts[name] === undefined) return fallback
  const v = Number(opts[name])
  if (!Number.isFinite(v)) { console.error(`${name} must be a number`); process.exit(1) }
  return v
}

const DRY = flag('--dry')
const STALE_OK = flag('--stale-ok')
const OUT_ROOT = resolve(ROOT, opts['--out'] ?? 'public')
const QUALITY = num('--quality', 0.92)
const FORCE_SHEET = opts['--sheet'] ?? null

/**
 * The cap on a frame's height, px — 256 unless `--size` says otherwise.
 *
 * 256 is where the payload and the eye agreed in every project so far: monster
 * strips at 341 px per frame, for creatures drawn at a fraction of that on a
 * phone, were 1.9 MB of a 4.2 MB payload, and 256 took the whole set to 2.2 MB
 * with nothing visibly lost. So it is the DEFAULT, not a flag remembered on a
 * good day. Three things bend it:
 *
 *   · the manifest's own `maxEdge` (if the index carries one) can only LOWER
 *     it — a coin is 20 px in play, and 256 of it is payload;
 *   · a sheet that ships resized copies (`extra` in the index) keeps whatever
 *     its biggest copy needs, because an extra is cut from the master and a
 *     512 PWA icon upsampled from a 256 master is a blurred icon;
 *   · an explicit `--size` FORCES the edge for one run, manifest or not;
 *   · a sheet the index marks `exact` is written at its manifest size whatever
 *     else is asked — the file is read at that size by something outside the
 *     game (a PWA manifest and its 512 icon).
 */
const DEFAULT_EDGE = 256
const SIZE = num('--size', DEFAULT_EDGE)
const SIZE_FORCED = opts['--size'] != null
const edgeCap = (sheet) => {
  const manifest = sheet.maxEdge ?? DEFAULT_EDGE
  const cap = sheet.exact ? manifest : SIZE_FORCED ? SIZE : Math.min(SIZE, manifest)
  return Math.max(cap, ...(sheet.extra ?? []).map((ex) => ex.size ?? 0))
}

/**
 * How tall one frame of a walk strip is written, in px.
 *
 * Never larger than the painting actually came back at — upsampling a return
 * buys file size and no detail — and never larger than the cap above.
 */
const walkEdge = (sheet, cell, sy) =>
  Math.min(edgeCap(sheet), Math.round(cell.h * sy))
// Accept a walk sheet whose grid came back with a different number of panels,
// treating what arrived as one cycle. Only honoured when it matches what the
// detector actually measured, so it cannot be used to force a bad cut.
const FRAMES_OVERRIDE = num('--frames', null)
const NO_CHROMA = flag('--no-chroma')
const NO_TRIM = flag('--no-trim')
const NO_AUTO_BG = flag('--no-auto-bg')
const NO_FIT = flag('--no-fit')
const NO_CLEAN = flag('--no-clean')
const GRID_OK = flag('--grid-ok')
/**
 * How much of the interior cut length may run through paint before the
 * painting counts as re-composed. The four re-composed returns measured 33-39%,
 * every good one 0-1.6% (a stone that drifted a little over one line).
 */
const GRID_CROSS_MAX = 0.1
/**
 * The biggest detached blob, as a share of its cell, that is erased for lying
 * where the reference has nothing. Text and cell numbers are well under 1%,
 * the silhouettes painted into the laurels 5-16%. Bigger than this it is more
 * likely an idea the painter had than a mistake, so it stays.
 */
const STRAY_MAX = 0.2
// How to square up a single-cell image that did not come back square.
const FIT = opts['--fit'] ?? 'squash'
if (!['squash', 'crop'].includes(FIT)) {
  console.error("--fit must be 'squash' or 'crop'")
  process.exit(1)
}

if (flag('--help') || flag('-h')) {
  console.log(`
Slice repainted contact sheets back into drop-in bitmaps.

  node tools/slice-sheets.mjs [files…] [options]

  files            One or more PNGs, or a directory. Defaults to art-sheets/painted/.
  --sheet <id>     Force the target: a sheet (runes-melee, runes-enemy-mage, glyphs,
                   tiles, frame, ui, fx), a walk (bonecap, teal, bolt), a band
                   (ridge-far) or a single (single-melee-river-lv1). Otherwise
                   inferred from the filename, then from the aspect ratio.
  --out <dir>      Where targets are written, relative to the repo. Default: public
  --size <px>      Force a frame's height, in px, for this run. Default: 256,
                   lowered to the sheet's own cap where the index carries a
                   smaller one, raised to the biggest resized copy it ships.
  --quality <0-1>  WebP quality. Default: 0.92
  --no-chroma      Keep a magenta background instead of keying it out.
  --no-auto-bg     Do not flood-fill a uniform background away. Auto-removal
                   handles white, cream and painted-in checkerboards; it is
                   skipped on panels the index marks 'fill' (tiles, the frame),
                   whose borders are artwork.
  --no-trim        Keep a tile's margin instead of cropping it back to its own
                   edges. Tiles must reach all four sides or they sit with a
                   seam, so this is on by default for 'fill' panels.
  --no-fit         Do not normalise a panel onto the reference's measured box.
  --fit squash|crop  How to square up a single-cell image that came back
                   non-square. squash (default) keeps every feature and
                   distorts; crop keeps proportions and loses the edges.
  --frames <n>     Accept a walk sheet that came back with n panels instead of
                   the 8 it was asked for, and play them as one cycle. Must
                   match the grid the slicer measured.
  --stale-ok       Slice a painting whose reference has been REDRAWN since it
                   was painted. Off by default: the receipt in
                   painted/.sliced.json is what stops a re-cut rune quietly
                   getting its old silhouette back on the next unrelated run.
  --no-clean       Cut the rects blind: no painted grid lines erased, no
                   neighbour slivers or stray marks removed, no widened cut
                   for a subject that overhangs its cell.
  --grid-ok        Cut a painting whose cut lines run through painted subjects
                   (a re-composed grid). Off by default: every slice of one
                   holds pieces of two stones.
  --size <px>      See above. 256 is the rule (LOADING.md, payload sizing).
  --dry            Print the plan and write nothing.
`)
  process.exit(0)
}

// ─── Inputs ─────────────────────────────────────────────────────────────────

if (!existsSync(INDEX)) {
  console.error(`No ${relative(ROOT, INDEX)}. Run the /art-sheets bench first.`)
  process.exit(1)
}
const index = JSON.parse(readFileSync(INDEX, 'utf-8'))

const collect = (p) => {
  const full = resolve(ROOT, p)
  if (!existsSync(full)) { console.error(`not found: ${p}`); process.exit(1) }
  if (statSync(full).isDirectory()) {
    return readdirSync(full).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)).map((f) => join(full, f))
  }
  return [full]
}

const inputs = (files.length ? files : [PAINTED]).flatMap((p) => {
  if (!files.length && !existsSync(PAINTED)) {
    console.error(`No input given and ${relative(ROOT, PAINTED)}/ does not exist.`)
    console.error('Put the repainted sheets there, or pass a path.')
    process.exit(1)
  }
  return collect(p)
})

if (!inputs.length) { console.error('nothing to slice'); process.exit(1) }

/**
 * Which sheet is this file?
 *
 * The filename first, because it survives round-tripping through a chat window
 * far more often than anything else. Aspect ratio is the fallback, and it is
 * only trusted when exactly one sheet matches — two sheets with the same shape
 * would make a wrong guess silently destructive.
 */
// Sheets, singles, bands and walks are the same thing to the slicer: a name,
// a size, and a list of rects. Flattening them into one list means none needs
// a second code path — identification, the aspect guard and the cutting are
// shared.
const TARGETS = [
  // Lattice sheets. Every cell carries its own target, its own measured
  // `fit`, and `fill` where the drawing reaches the panel's edges.
  ...index.sheets.map((s) => ({
    id: s.id, kind: 'sheet',
    stems: [s.files.clean.replace(/\.png$/, '')],
    width: s.width, height: s.height, cells: s.cells
  })),
  // One object per image: the rect is the whole image, so a repaint has
  // nothing to stay aligned with and cannot drift out of a lattice.
  ...index.sheets.flatMap((s) => (s.singles ?? []).map((t) => ({
    id: t.id, kind: 'cell',
    stems: [basename(t.file).replace(/\.png$/, '')],
    width: t.width, height: t.height, cells: t.cells
  }))),
  // Landscape bands: not lattice cells and not square, so the whole image IS
  // the asset and its declared shape is the shape it is written at.
  ...(index.scenery ?? []).map((a) => ({
    id: a.id, kind: 'scenery',
    // Both `bg-ridge-far` and a plain `ridge-far` are accepted: the prefix is
    // a convenience of the export, not something a painter has to preserve
    // through a chat window and a download folder.
    stems: [a.file.replace(/\.png$/, ''), a.id],
    width: a.width, height: a.height,
    tileable: a.tileable,
    bg: a.bg ?? 'magenta',
    cells: [{
      id: a.id, label: a.id, variant: 'scenery',
      x: 0, y: 0, w: a.width, h: a.height, target: a.target
    }]
  })),
  // Walk cycles. A grid of panels in, ONE horizontal strip out — the panels
  // are frames of a single animation, so they are cut, keyed and de-fringed
  // separately and then composed into the file the game loads.
  //
  // Nothing here is trimmed. Every other sprite is registered to its own
  // content; doing that per frame would re-centre each pose independently
  // and the character would jitter around its own feet for the entire walk.
  ...(index.walks ?? []).map((a) => ({
    id: a.id, kind: 'walk',
    // Where the reference sits inside a panel, so a return painted at a
    // different size can be normalised back onto it.
    fit: a.fit ?? null, anchor: a.anchor ?? 'feet',
    // The bolt's box is a hard boundary — the renderer turns the whole panel
    // to the arrow's heading — so it is fitted INSIDE it on both axes. A
    // commander's box is not: it stands on open ground, and shrinking it
    // because a painted arm swings wider would lift its feet off the line.
    tight: a.kind === 'round',
    // `walk-bonecap` and a bare `bonecap` both land; longest stem wins, so
    // the prefixed form is never mistaken for anything else.
    stems: [a.file.replace(/\.png$/, ''), a.id],
    width: a.width, height: a.height,
    frames: a.frames, cols: a.cols, rows: a.rows,
    target: a.target,
    cells: Array.from({ length: a.frames }, (_, i) => ({
      id: `${a.id}#${i}`,
      label: a.id,
      variant: `frame ${i + 1}/${a.frames}`,
      x: (i % a.cols) * a.panel.w,
      y: Math.floor(i / a.cols) * a.panel.h,
      w: a.panel.w, h: a.panel.h,
      target: a.target,
      frame: i
    }))
  }))
]

const identify = (file, w, h) => {
  if (FORCE_SHEET) {
    const t = TARGETS.find((x) => x.id === FORCE_SHEET)
    if (!t) {
      throw new Error(`--sheet ${FORCE_SHEET} is unknown. Try one of:\n  `
        + TARGETS.map((x) => x.id).join(', '))
    }
    return t
  }
  const name = basename(file).toLowerCase()
  /** The leading `word-` of a name, including the dash, or '' if it has none. */
  const prefixOf = (n) => (n.includes('-') ? n.slice(0, n.indexOf('-') + 1) : '')

  // Longest stem wins, so "strip-blocks-r1" beats "blocks", and
  // "mountains-near" beats a bare "mountains".
  //
  // A BARE-ID hit is refused when the file carries somebody else's prefix.
  // Every walk and band entry answers to its id alone, so a retired sheet's
  // file left in painted/ — `old-bolt.png`, say — would otherwise match the
  // bolt's walk on the bare id and be sliced straight over a good strip, with
  // no trace but a sprite silently getting smaller on disk.
  const byName = TARGETS
    .map((t) => {
      const hit = t.stems.filter((st) => name.includes(st.toLowerCase()))
        .sort((a, b) => b.length - a.length)[0]
      if (!hit) return { t, hit: undefined }
      const primary = t.stems[0].toLowerCase()
      // Stale when the match came only from the bare id AND the file leads
      // with somebody else's prefix. `mountains-far` still answers to its own
      // id because the name STARTS with it; `mount-archer` does not.
      const stale = !name.includes(primary)
        && !name.startsWith(hit.toLowerCase())
        && !(prefixOf(primary) && name.startsWith(prefixOf(primary)))
      return { t, hit: stale ? undefined : hit }
    })
    .filter((x) => x.hit)
    .sort((a, b) => b.hit.length - a.hit.length)
  if (byName.length) return byName[0].t

  const ratio = w / h
  const byShape = TARGETS.filter((t) => Math.abs(t.width / t.height - ratio) < 0.01)
  if (byShape.length === 1) return byShape[0]
  throw new Error(byShape.length
    ? `${w}x${h} matches ${byShape.length} targets (${byShape.map((t) => t.id).join(', ')}) — pass --sheet <id>`
    : `${w}x${h} matches nothing in the index — pass --sheet <id>`)
}

// ─── Chrome, for decode / crop / WebP encode ────────────────────────────────

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p))
if (!chromePath) {
  console.error('No Chrome found. Tried:\n  ' + CHROME_CANDIDATES.join('\n  '))
  process.exit(1)
}

const PORT = 9336 + (process.pid % 200)
// An isolated profile, always. The shared one is held by the user's own browser
// and two clients on one profile deadlock with no recovery.
const profile = mkdtempSync(join(tmpdir(), 'ts-slice-'))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--disable-gpu', 'about:blank'
], { stdio: 'ignore' })

let ws
let msgId = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((res, rej) => {
  const m = { id: ++msgId, method, params }
  pending.set(m.id, { res, rej })
  ws.send(JSON.stringify(m))
})

const shutdown = (code) => {
  try { ws?.close() } catch {}
  try { chrome.kill() } catch {}
  setTimeout(() => {
    try { rmSync(profile, { recursive: true, force: true }) } catch {}
    process.exit(code)
  }, 300)
}

/** Guard against a target that would escape the output root. */
const safeTarget = (target) => {
  const full = resolve(OUT_ROOT, target)
  const rel = relative(OUT_ROOT, full)
  return rel && !rel.startsWith('..') && !rel.startsWith(sep) ? full : null
}

// ─── The receipt ────────────────────────────────────────────────────────────
//
// One line per painted file: the revision of the REFERENCE it was cut against.
// A revision is the first 12 hex of a sha1 over the clean sheet's bytes, so it
// changes exactly when the drawing does and not when a file is copied, cloned
// or re-dated.
//
// It lives beside the paintings rather than in `art-sheets/`, because it
// describes them and not the manifest, and a `painted/` folder someone shares
// carries its own provenance with it.

const RECEIPT = join(PAINTED, '.sliced.json')

const readReceipt = () => {
  if (!existsSync(RECEIPT)) return {}
  try {
    const r = JSON.parse(readFileSync(RECEIPT, 'utf-8'))
    return r && typeof r === 'object' ? (r.files ?? {}) : {}
  } catch {
    // A corrupt receipt must never stop a slice — it only ever ADDS a refusal,
    // so the safe failure is to behave as if nobody had sliced anything yet.
    return {}
  }
}

const receipt = readReceipt()
/** What this run proved: written back only when it actually wrote something. */
const receiptNext = { ...receipt }

/** The clean reference a painting was made from, if it is still on disk. */
const referenceOf = (sheet) => {
  const stem = sheet.stems?.[0]
  if (!stem) return null
  for (const p of [join(ROOT, 'art-sheets', `${stem}.png`), join(ROOT, 'art-sheets', 'singles', `${stem}.png`)]) {
    if (existsSync(p)) return p
  }
  return null
}

const revOf = (file) => createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12)

/**
 * Is this painting a painting of the CURRENT drawing?
 *
 * `{ ok }` to go ahead, `{ ok: false, why }` to refuse, and a `warn` either
 * way. The receipt is the only hard evidence: without one, an older mtime is
 * worth saying out loud and nothing more, because a checkout rewrites mtimes
 * and refusing a whole folder after a clone would be its own bug.
 */
const freshness = (file, sheet) => {
  const ref = referenceOf(sheet)
  if (!ref) return { ok: true }
  const rev = revOf(ref)
  const own = revOf(file)
  let seen = receipt[basename(file)]
  // A receipt line describes the PAINTING it was written for, not the name it
  // had. A re-roll saved over the old file is a new painting under the same
  // name; judging it by the old line refused every fresh repaint of a re-cut
  // drawing as "redrawn after this was painted". Lines from before `painting`
  // was recorded carry no hash, and keep the strict reading.
  if (seen?.painting && seen.painting !== own) seen = undefined
  if (seen?.rev && seen.rev !== rev) {
    return {
      ok: false,
      rev,
      why: `the reference was REDRAWN after this was painted (${seen.rev} → ${rev}).`
        + `\n    ${relative(ROOT, ref)} is not the picture this file was painted over any more.`
        + '\n    Repaint it from the new sheet, or pass --stale-ok to cut it anyway.'
    }
  }
  if (!seen && statSync(ref).mtimeMs > statSync(file).mtimeMs + 60_000) {
    return {
      ok: true,
      rev,
      own,
      warn: `no receipt for this one yet, and ${basename(ref)} is newer than it.`
        + ' If the drawing changed since it was painted, this cuts the OLD one — check it, or repaint.'
    }
  }
  return { ok: true, rev, own }
}

// ─── Reading the painting whole ─────────────────────────────────────────────
//
// See "WHAT IT READS BEFORE IT CUTS" at the top. This runs IN THE PAGE (it is
// passed over as source), so it may use nothing from this module. It leaves
// the cleaned painting in `globalThis.__sheet` and, per blob of paint, who
// owns it in `globalThis.__prep`; the cut reads both.
//
// `a.cells` are rects in painting pixels; `a.vcuts`/`a.hcuts` are the lines
// the lattice is cut on (grid lines are looked for there); `a.seams` are the
// interior lines between two cells whose paint must not cross.
async function prepareInPage (a) {
  const src = globalThis.__sheet
  const W = src.naturalWidth || src.width
  const H = src.naturalHeight || src.height
  const N = W * H
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d', { willReadFrequently: true })
  g.drawImage(src, 0, 0)
  const img = g.getImageData(0, 0, W, H)
  const d = img.data
  const report = { grounds: [], lines: 0, linePx: 0, crossing: 0, crossRows: 0, cells: {} }
  const l1 = (r, gg, b, c) => Math.abs(r - c[0]) + Math.abs(gg - c[1]) + Math.abs(b - c[2])

  // ── What the ground is ──
  //
  // Magenta and its JPEG smear always. Plus any flat colour that makes up a
  // quarter of a ring sampled just INSIDE the frame — the boulder sheet's
  // dusty purple — because a ground the key misses would otherwise read as one
  // blob of paint covering the whole sheet. Inside the frame, so a painted
  // border line along the edge is not taken for the ground; never dark, for
  // the same reason.
  const inset = Math.max(2, Math.round(a.minCell * 0.04))
  const q = (i) => ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4)
  const counts = new Map()
  let ringN = 0
  const sample = (x, y) => {
    const key = q((y * W + x) * 4)
    counts.set(key, (counts.get(key) || 0) + 1)
    ringN++
  }
  for (let x = inset; x < W - inset; x += 2) { sample(x, inset); sample(x, H - 1 - inset) }
  for (let y = inset; y < H - inset; y += 2) { sample(inset, y); sample(W - 1 - inset, y) }
  const centre = (k) => [((k >> 8) & 15) * 16 + 8, ((k >> 4) & 15) * 16 + 8, (k & 15) * 16 + 8]
  const clusters = []
  for (const [key, n] of [...counts].sort((x, y) => y[1] - x[1])) {
    const c = centre(key)
    const hit = clusters.find((cl) => l1(c[0], c[1], c[2], cl.c) <= 64)
    if (hit) hit.n += n
    else clusters.push({ c, n })
  }
  const grounds = clusters
    .filter((cl) => cl.n >= ringN * 0.25 && cl.c[0] + cl.c[1] + cl.c[2] > 150)
    .slice(0, 3).map((cl) => cl.c)
  // Reported: the grounds the magenta key would not have reached on its own.
  report.grounds = grounds
    .filter((c) => Math.abs(c[0] - 255) + c[1] + Math.abs(c[2] - 255) >= 150)
    .map((c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''))
  const P = new Uint8Array(N)
  for (let k = 0, i = 0; k < N; k++, i += 4) {
    const r = d[i], gg = d[i + 1], b = d[i + 2]
    if (Math.abs(r - 255) + gg + Math.abs(b - 255) < 150) continue
    let ground = false
    for (const c of grounds) if (l1(r, gg, b, c) <= 60) { ground = true; break }
    if (!ground) P[k] = 1
  }

  // ── A ground that is not magenta becomes magenta ──
  //
  // The boulder sheet came back dusty purple WITH magenta lines drawn over it
  // along the lattice. Each cell's border then keyed perfectly, the purple
  // inside it never did, and the spill step greyed it into a card. So the odd
  // ground is recoloured here, once, for the whole sheet, and every cell goes
  // down the well-worn magenta path. Only ground CONNECTED to a cut line or
  // the frame: a purple enclosed by a stone's outline is the stone's.
  const odd = grounds.filter((c) => Math.abs(c[0] - 255) + c[1] + Math.abs(c[2] - 255) >= 150)
  report.recoloured = 0
  if (odd.length) {
    const seen = new Uint8Array(N)
    const st = new Int32Array(N)
    let sp = 0
    const seed = (x, y) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return
      const k = y * W + x
      if (!P[k] && !seen[k]) { seen[k] = 1; st[sp++] = k }
    }
    for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1) }
    for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y) }
    for (const c of a.cells) {
      for (let x = c.x0; x < c.x1; x++) { seed(x, c.y0); seed(x, c.y1 - 1) }
      for (let y = c.y0; y < c.y1; y++) { seed(c.x0, y); seed(c.x1 - 1, y) }
    }
    while (sp) {
      const k = st[--sp]
      const i = k * 4
      if (odd.some((c) => l1(d[i], d[i + 1], d[i + 2], c) <= 60)) {
        d[i] = 255; d[i + 1] = 0; d[i + 2] = 255
        report.recoloured++
      }
      const x = k % W, y = (k - x) / W
      if (x > 0) seed(x - 1, y)
      if (x < W - 1) seed(x + 1, y)
      if (y > 0) seed(x, y - 1)
      if (y < H - 1) seed(x, y + 1)
    }
  }
  // A grid line is painted over with the ground just beyond it, so it becomes
  // exactly what surrounds it: magenta on a magenta sheet, keyed with the rest;
  // purple on a purple one, flooded with the rest. Pure magenta there made a
  // keyed-looking band round every cell of a sheet the key could not clear.
  const erase = (k, rgb) => {
    const i = k * 4
    d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255
    P[k] = 0
  }

  // ── Painted grid lines ──
  //
  // A run of paint at most `tmax` across, with ground on both sides, inside a
  // band either side of a cut line; runs on successive rows chained into one
  // straight line at least a fifth of a cell long. A stone's own outline near
  // the band curves away long before that, and a subject that reaches the
  // band edge is not flanked by ground, so neither is ever a candidate.
  if (a.lines) {
    const scan = (cut, vertical) => {
      const across = vertical ? W : H
      const b = Math.max(4, Math.round(cut.cell * 0.06))
      const tmax = Math.max(4, Math.round(cut.cell * 0.03))
      const lo = Math.max(0, cut.at - b)
      const hi = Math.min(across - 1, cut.at + b)
      const at = vertical ? (u, v) => v * W + u : (u, v) => u * W + v
      const runs = []
      for (let v = Math.max(0, cut.from); v < Math.min(vertical ? H : W, cut.to); v++) {
        let u = lo
        while (u <= hi) {
          if (!P[at(u, v)]) { u++; continue }
          const r0 = u
          while (u <= hi && P[at(u, v)]) u++
          const r1 = u - 1
          const open = (r0 > lo || lo === 0) && (r1 < hi || hi === across - 1)
          if (open && r1 - r0 + 1 <= tmax) runs.push({ v, r0, r1, c: (r0 + r1) / 2 })
        }
      }
      const chains = []
      for (const r of runs) {
        let best = null
        for (const ch of chains) {
          if (r.v === ch.lastV || r.v - ch.lastV > tmax + 2) continue
          const dc = Math.abs(ch.lastC - r.c)
          if (dc <= 2.5 && (!best || dc < Math.abs(best.lastC - r.c))) best = ch
        }
        if (best) {
          best.runs.push(r)
          best.lastV = r.v
          best.lastC = r.c
          best.minC = Math.min(best.minC, r.c)
          best.maxC = Math.max(best.maxC, r.c)
        } else {
          chains.push({ runs: [r], firstV: r.v, lastV: r.v, lastC: r.c, minC: r.c, maxC: r.c })
        }
      }
      // The ground beside a run: three pixels out, past the line's own soft
      // edge, whichever side is ground; magenta when neither is.
      const beside = (r) => {
        for (const u of [r.r0 - 3, r.r1 + 3, r.r0 - 2, r.r1 + 2]) {
          if (u < 0 || u >= across) continue
          const k = at(u, r.v)
          if (!P[k]) return [d[k * 4], d[k * 4 + 1], d[k * 4 + 2]]
        }
        return [255, 0, 255]
      }
      for (const ch of chains) {
        const span = ch.lastV - ch.firstV + 1
        if (span < cut.len * 0.2 || ch.runs.length < span * 0.6 || ch.maxC - ch.minC > cut.cell * 0.04) continue
        report.lines++
        for (const r of ch.runs) {
          const rgb = beside(r)
          for (let u = Math.max(0, r.r0 - 1); u <= Math.min(across - 1, r.r1 + 1); u++) {
            const k = at(u, r.v)
            if (P[k]) report.linePx++
            erase(k, rgb)
          }
        }
      }
    }
    for (const c of a.vcuts) scan(c, true)
    for (const c of a.hcuts) scan(c, false)
  }

  // ── Does paint run across the cut lines? ──
  //
  // Rows where paint spans the whole ±d neighbourhood of a seam: a stone cut
  // through, not a line drawn along it.
  let cross = 0, len = 0
  for (const s of a.seams) {
    const across = s.vertical ? W : H
    for (let v = s.from; v < s.to; v++) {
      let all = true
      for (let u = s.at - s.d; u <= s.at + s.d; u++) {
        if (u < 0 || u >= across || !P[s.vertical ? v * W + u : u * W + v]) { all = false; break }
      }
      if (all) cross++
      len++
    }
  }
  report.crossing = len ? cross / len : 0
  report.crossRows = cross

  g.putImageData(img, 0, 0)
  globalThis.__sheet = cv
  if (!a.own) return JSON.stringify(report)

  // ── Blobs, and who owns each ──
  const lab = new Int32Array(N)
  const size = [0], bx0 = [0], by0 = [0], bx1 = [0], by1 = [0]
  const stack = new Int32Array(N)
  let nLab = 0
  for (let k0 = 0; k0 < N; k0++) {
    if (!P[k0] || lab[k0]) continue
    const l = ++nLab
    let sp = 0, n = 0, mnx = W, mny = H, mxx = -1, mxy = -1
    stack[sp++] = k0
    lab[k0] = l
    while (sp) {
      const k = stack[--sp]
      n++
      const x = k % W, y = (k - x) / W
      if (x < mnx) mnx = x
      if (x > mxx) mxx = x
      if (y < mny) mny = y
      if (y > mxy) mxy = y
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= H) continue
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= W) continue
          const kk = yy * W + xx
          if (P[kk] && !lab[kk]) { lab[kk] = l; stack[sp++] = kk }
        }
      }
    }
    size.push(n); bx0.push(mnx); by0.push(mny); bx1.push(mxx); by1.push(mxy)
  }
  const cells = a.cells
  const owner = new Int32Array(nLab + 1).fill(-1)
  const ownN = new Int32Array(nLab + 1)
  const inCell = cells.map((c) => {
    const m = new Map()
    for (let y = Math.max(0, c.y0); y < Math.min(H, c.y1); y++) {
      for (let x = Math.max(0, c.x0); x < Math.min(W, c.x1); x++) {
        const l = lab[y * W + x]
        if (l) m.set(l, (m.get(l) || 0) + 1)
      }
    }
    return m
  })
  inCell.forEach((m, ci) => {
    for (const [l, n] of m) if (n > ownN[l]) { ownN[l] = n; owner[l] = ci }
  })

  // ── Marks the drawing never had ──
  //
  // The reference, scaled onto the painting and grown by an eighth of a cell
  // to allow for a painter who enlarged or nudged the subject. A blob that
  // touches none of it, is not its cell's biggest, and is small, is a mark.
  const stray = new Uint8Array(nLab + 1)
  let refMask = null
  if (a.ref) {
    const ri = new Image()
    ri.src = a.ref
    await ri.decode()
    const RW = ri.naturalWidth, RH = ri.naturalHeight
    const rc = document.createElement('canvas')
    rc.width = RW
    rc.height = RH
    const rg = rc.getContext('2d', { willReadFrequently: true })
    rg.drawImage(ri, 0, 0)
    const rd = rg.getImageData(0, 0, RW, RH).data
    const ref = new Uint8Array(N)
    for (let y = 0; y < H; y++) {
      const ry = Math.min(RH - 1, Math.floor((y * RH) / H))
      for (let x = 0; x < W; x++) {
        const i = (ry * RW + Math.min(RW - 1, Math.floor((x * RW) / W))) * 4
        if (rd[i + 3] > 8 && Math.abs(rd[i] - 255) + rd[i + 1] + Math.abs(rd[i + 2] - 255) >= 60) ref[y * W + x] = 1
      }
    }
    refMask = ref
    // Grown INSIDE each cell only. Grown across the sheet, the bottom of one
    // row's wreaths reached the captions painted at the top of the next, and
    // the stone to the left reached this one's cell number, and both stayed.
    const grow = (r) => {
      const tmp = new Uint8Array(N), dil = new Uint8Array(N)
      for (const c of cells) {
        const cx0 = Math.max(0, c.x0), cx1 = Math.min(W, c.x1), cy0 = Math.max(0, c.y0), cy1 = Math.min(H, c.y1)
        for (let y = cy0; y < cy1; y++) {
          const row = y * W
          let run = 0
          for (let j = cx0; j < cx0 + r && j < cx1; j++) run += ref[row + j]
          for (let x = cx0; x < cx1; x++) {
            if (x + r < cx1) run += ref[row + x + r]
            if (x - r - 1 >= cx0) run -= ref[row + x - r - 1]
            tmp[row + x] = run > 0 ? 1 : 0
          }
        }
        for (let x = cx0; x < cx1; x++) {
          let run = 0
          for (let j = cy0; j < cy0 + r && j < cy1; j++) run += tmp[j * W + x]
          for (let y = cy0; y < cy1; y++) {
            if (y + r < cy1) run += tmp[(y + r) * W + x]
            if (y - r - 1 >= cy0) run -= tmp[(y - r - 1) * W + x]
            dil[y * W + x] = run > 0 ? 1 : 0
          }
        }
      }
      return dil
    }
    // Touching counts inside the blob's OWN cell only.
    const touching = (dil) => {
      const t = new Uint8Array(nLab + 1)
      cells.forEach((c, ci) => {
        for (let y = Math.max(0, c.y0); y < Math.min(H, c.y1); y++) {
          for (let x = Math.max(0, c.x0); x < Math.min(W, c.x1); x++) {
            const k = y * W + x, l = lab[k]
            if (l && dil[k] && owner[l] === ci) t[l] = 1
          }
        }
      })
      return t
    }
    const far = touching(grow(Math.max(2, Math.round(a.minCell * 0.12))))
    // Text sits at the top of a cell in every return that carried it, often
    // closer to a big stone than the wide margin above allows — "12." beside
    // a Lv 2 stone. So a TINY mark wholly inside the top band is judged by a
    // tight margin instead.
    const near = touching(grow(Math.max(1, Math.round(a.minCell * 0.03))))
    const biggest = new Int32Array(cells.length)
    for (let l = 1; l <= nLab; l++) {
      const ci = owner[l]
      if (ci >= 0 && (!biggest[ci] || size[l] > size[biggest[ci]])) biggest[ci] = l
    }
    for (let l = 1; l <= nLab; l++) {
      const ci = owner[l]
      if (ci < 0 || biggest[ci] === l) continue
      const c = cells[ci]
      const area = (c.x1 - c.x0) * (c.y1 - c.y0)
      if (!far[l] && size[l] <= area * a.strayMax) stray[l] = 1
      else if (!near[l] && size[l] <= area * 0.006 && by1[l] < c.y0 + (c.y1 - c.y0) * 0.14) stray[l] = 1
    }

    // A SHAPE the drawing does not have, sitting inside the subject — the gold
    // sword painted into the middle of every laurel, where the drawing is an
    // empty wreath. Near the wreath's knot, so no margin test catches it. The
    // painting is registered onto the reference first (the same box-to-box
    // scale the fit will use), then a sizeable blob that lands on almost none
    // of the drawing goes. Sizeable only: the splash's little floating rune is
    // an addition too, and a welcome one.
    const reg = grow(Math.max(1, Math.round(a.minCell * 0.04)))
    cells.forEach((c, ci) => {
      if (!c.fit || !c.target || c.fill) return
      const cw = c.x1 - c.x0, ch = c.y1 - c.y0, area = cw * ch
      let px0 = W, py0 = H, px1 = -1, py1 = -1
      const cand = []
      for (let l = 1; l <= nLab; l++) {
        if (owner[l] !== ci || stray[l]) continue
        if (size[l] >= area * 0.01) {
          px0 = Math.min(px0, bx0[l]); py0 = Math.min(py0, by0[l])
          px1 = Math.max(px1, bx1[l]); py1 = Math.max(py1, by1[l])
        }
        if (l !== biggest[ci] && size[l] >= area * 0.03 && size[l] <= area * a.strayMax) cand.push(l)
      }
      if (!cand.length || px1 < 0) return
      const k = Math.sqrt(((c.fit.w * cw) / (px1 - px0 + 1)) * ((c.fit.h * ch) / (py1 - py0 + 1)))
      const pcx = (px0 + px1 + 1) / 2, pcy = (py0 + py1 + 1) / 2
      const rcx = c.x0 + c.fit.cx * cw, rcy = c.y0 + c.fit.cy * ch
      const hit = new Map(), tot = new Map()
      for (const l of cand) { hit.set(l, 0); tot.set(l, 0) }
      for (let y = Math.max(0, py0); y <= Math.min(H - 1, py1); y++) {
        for (let x = Math.max(0, px0); x <= Math.min(W - 1, px1); x++) {
          const l = lab[y * W + x]
          if (!l || !tot.has(l)) continue
          tot.set(l, tot.get(l) + 1)
          const rx = Math.round(rcx + (x - pcx) * k), ry = Math.round(rcy + (y - pcy) * k)
          if (rx >= c.x0 && rx < c.x1 && ry >= c.y0 && ry < c.y1 && reg[ry * W + rx]) hit.set(l, hit.get(l) + 1)
        }
      }
      for (const l of cand) if (tot.get(l) && hit.get(l) / tot.get(l) < 0.1) stray[l] = 1
    })
  }

  // ── Per cell: what it loses, what it gains ──
  cells.forEach((c, ci) => {
    if (!c.target || c.fill) return
    const cw = c.x1 - c.x0, ch = c.y1 - c.y0, area = cw * ch
    let foreignPx = 0
    const from = {}
    for (const [l, n] of inCell[ci]) {
      if (owner[l] === ci || size[l] < area * 0.002) continue
      foreignPx += n
      const o = cells[owner[l]].id
      from[o] = (from[o] || 0) + n
    }
    let strayN = 0, strayPx = 0
    let sx0 = W, sy0 = H, sx1 = -1, sy1 = -1
    let ox0 = c.x0, oy0 = c.y0, ox1 = c.x1 - 1, oy1 = c.y1 - 1
    for (let l = 1; l <= nLab; l++) {
      if (owner[l] !== ci) continue
      if (stray[l]) {
        if (size[l] < 8) continue
        strayN++
        strayPx += size[l]
        sx0 = Math.min(sx0, bx0[l]); sy0 = Math.min(sy0, by0[l])
        sx1 = Math.max(sx1, bx1[l]); sy1 = Math.max(sy1, by1[l])
        continue
      }
      if (size[l] < area * 0.01) continue
      ox0 = Math.min(ox0, bx0[l]); oy0 = Math.min(oy0, by0[l])
      ox1 = Math.max(ox1, bx1[l]); oy1 = Math.max(oy1, by1[l])
    }
    // How solidly the DRAWING fills its own box: a ring a third, a plaque
    // nearly all of it. A return far more solid than that is a card.
    //
    // And how much of that box is a HOLE — ground the drawing walls in, the
    // middle of a ring. Topology survives any fit, so it is compared directly.
    let refFill = null, refHole = null
    if (refMask) {
      const cx0 = Math.max(0, c.x0), cx1 = Math.min(W, c.x1), cy0 = Math.max(0, c.y0), cy1 = Math.min(H, c.y1)
      let rx0 = W, ry0 = H, rx1 = -1, ry1 = -1, on = 0
      for (let y = cy0; y < cy1; y++) {
        for (let x = cx0; x < cx1; x++) {
          if (!refMask[y * W + x]) continue
          on++
          if (x < rx0) rx0 = x
          if (x > rx1) rx1 = x
          if (y < ry0) ry0 = y
          if (y > ry1) ry1 = y
        }
      }
      if (rx1 >= 0) {
        const box = (rx1 - rx0 + 1) * (ry1 - ry0 + 1)
        refFill = on / box
        const out = new Uint8Array((cx1 - cx0) * (cy1 - cy0))
        const cw2 = cx1 - cx0
        const st = []
        const push = (x, y) => {
          if (x < cx0 || y < cy0 || x >= cx1 || y >= cy1) return
          const j = (y - cy0) * cw2 + (x - cx0)
          if (out[j] || refMask[y * W + x]) return
          out[j] = 1
          st.push(x, y)
        }
        for (let x = cx0; x < cx1; x++) { push(x, cy0); push(x, cy1 - 1) }
        for (let y = cy0; y < cy1; y++) { push(cx0, y); push(cx1 - 1, y) }
        while (st.length) {
          const y = st.pop(), x = st.pop()
          push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
        }
        let holes = 0
        for (let y = ry0; y <= ry1; y++) {
          for (let x = rx0; x <= rx1; x++) {
            if (!refMask[y * W + x] && !out[(y - cy0) * cw2 + (x - cx0)]) holes++
          }
        }
        refHole = holes / box
      }
    }
    const capX = Math.round(cw * 0.3), capY = Math.round(ch * 0.3)
    report.cells[c.id] = {
      refFill,
      refHole,
      foreignPx,
      from,
      strayN,
      strayPx,
      strayBox: strayN ? [(sx0 - c.x0) / cw, (sy0 - c.y0) / ch, (sx1 + 1 - c.x0) / cw, (sy1 + 1 - c.y0) / ch] : null,
      pad: {
        l: Math.min(capX, c.x0 - ox0),
        t: Math.min(capY, c.y0 - oy0),
        r: Math.min(capX, ox1 - (c.x1 - 1)),
        b: Math.min(capY, oy1 - (c.y1 - 1))
      }
    }
  })
  globalThis.__prep = { lab, owner, stray, W, H }
  return JSON.stringify(report)
}

/**
 * Did this panel come back standing on its ground? `null` when not, else the
 * lines that say why. `pc` is the whole-painting read's note on the cell.
 *
 * Three signs, each measured on real returns:
 *   · a border still solid where the DRAWING leaves room — a ground the key
 *     could not see (`r.card`, counted in the page);
 *   · a solid rectangle, flush with its own box on all four sides, where the
 *     drawing is not one — a tile of parchment floating on a magenta the key
 *     DID clear. Cards measured 96-100% solid and 75-100% flush on their
 *     weakest side; the solid stones (emerald cuts, plaques) 93-95% and 66%;
 *   · a hole in the drawing that the return does not have — the ground inside
 *     a ring, walled in where no key and no flood reach it. The rings: holes
 *     of 27-41% of the drawing's box, 0 in the return; nothing else drawn in
 *     this game has one over 5%.
 */
const groundVerdict = (r, pc, sheet) => {
  if (r.fill || r.frames !== undefined || sheet.bg === 'opaque') return null
  const id = r.id.padEnd(26)
  if (pc?.refHole >= 0.15 && r.hole < pc.refHole * 0.25) {
    return [
      `  ✗ ${id} its middle came back filled — the drawing has a hole there`
        + ` (${(pc.refHole * 100).toFixed(0)}% of its box), the return ${(r.hole * 100).toFixed(0)}%.`,
      '    The ground inside it was painted in. Not written; repaint it on flat magenta.'
    ]
  }
  const solidBox = r.bboxFill >= 0.93 && r.flush >= 0.75 && (pc?.refFill == null || pc.refFill < 0.9)
  if (!r.card && !solidBox) return null
  const names = ['top', 'bottom', 'right', 'left']
  return [
    `  ✗ ${id} the ground behind it was never removed — `
      + (r.card
        ? `its ${r.edges.map((v, i) => (v >= 0.5 ? names[i] : null)).filter(Boolean).join('/')} border is solid where the drawing leaves room.`
        : `it is a solid rectangle (${(r.bboxFill * 100).toFixed(0)}% of its box, flush on every side)`
          + (pc?.refFill != null ? `, the drawing fills ${(pc.refFill * 100).toFixed(0)}%.` : '.')),
    '    It would ship as a picture on a card. Not written; repaint it on flat magenta.'
  ]
}

let written = 0
let skipped = 0
let failed = 0

try {
  let page = null
  for (let i = 0; i < 60 && !page; i++) {
    try {
      page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json())
        .find((t) => t.type === 'page')
    } catch {}
    if (!page) await sleep(250)
  }
  if (!page) throw new Error('Chrome did not expose a debugging target')

  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', () => rej(new Error('could not attach to Chrome')), { once: true })
  })
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    const p = pending.get(m.id)
    if (!p) return
    pending.delete(m.id)
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result)
  })
  await send('Runtime.enable')

  for (const file of inputs) {
    const b64 = readFileSync(file).toString('base64')
    const mime = /\.png$/i.test(file) ? 'image/png'
      : /\.webp$/i.test(file) ? 'image/webp' : 'image/jpeg'
    if (mime === 'image/jpeg') {
      console.warn(`
  ! ${basename(file)} is a JPEG. JPEG cannot carry`
        + ' transparency, and its lossy chroma smears the magenta into the'
        + ' artwork at every edge, which leaves a pink fringe the key cannot'
        + ' fully remove. Ask for PNG.')
    }

    const probe = await send('Runtime.evaluate', {
      expression: `(async () => {
        const img = new Image();
        img.src = 'data:${mime};base64,${b64}';
        await img.decode();
        globalThis.__sheet = img;
        globalThis.__prep = null;
        return JSON.stringify({ w: img.naturalWidth, h: img.naturalHeight });
      })()`,
      awaitPromise: true, returnByValue: true
    })
    if (probe.exceptionDetails) throw new Error(`could not decode ${basename(file)}`)
    const { w, h } = JSON.parse(probe.result.value)

    let sheet
    try {
      sheet = identify(file, w, h)
    } catch (e) {
      console.error(`\n✗ ${basename(file)} — ${e.message}`)
      failed++
      continue
    }

    // A painting of a drawing that has since moved is not this drawing's
    // painting. See "WHAT IT REFUSES TO DO TWICE" at the top of this file.
    const fresh = freshness(file, sheet)
    if (!fresh.ok && !STALE_OK) {
      console.error(`\n✗ ${basename(file)} — ${fresh.why}`)
      failed++
      continue
    }
    if (!fresh.ok) console.warn(`\n  ! ${basename(file)} — ${fresh.why.split('\n')[0]} Slicing anyway (--stale-ok).`)
    if (fresh.warn) console.warn(`  ! ${fresh.warn}`)
    // Recorded once something was actually cut from it: a painting refused
    // further down (a re-composed grid, a card) was not "sliced against" rev X.
    const receiptLine = fresh.rev
      ? { sheet: sheet.id, rev: fresh.rev, painting: fresh.own, at: new Date().toISOString() }
      : null
    const writtenBefore = written

    // The sheet may come back at a different resolution than it left at, which
    // is fine and expected. What is NOT fine is a different SHAPE: that means
    // the grid was re-composed, and every rect in the index is then a lie.
    const sx = w / sheet.width
    const sy = h / sheet.height
    console.log(`\n${basename(file)} → ${sheet.kind} "${sheet.id}"  ${w}x${h} (${sx.toFixed(3)}x)`)

    // A STRIP is one row, so a uniform vertical squash is recoverable: the
    // cells still divide the width evenly, every cell is distorted by the same
    // factor, and stretching each one back to square restores the intent. An
    // image model that returns 1024x123 instead of 2048x256 has not re-composed
    // anything, it has just let the proportions drift, and refusing that would
    // throw away a good generation over arithmetic we can do ourselves.
    //
    // A multi-row SHEET gets no such benefit: there, a vertical mismatch means
    // the rows no longer land where the index says, and every rect is wrong.
    // A single-cell image has no lattice at all: the rect IS the image. Any
    // proportion it comes back at is simply resized to the target square, which
    // is why one object per file is the sturdiest way through — there is
    // nothing left for a repaint to knock out of alignment.
    if (sheet.kind === 'scenery' && Math.abs((w / h) / (sheet.width / sheet.height) - 1) > 0.06) {
      console.warn(`  ! aspect is ${(w / h).toFixed(2)}:1, wanted`
        + ` ${(sheet.width / sheet.height).toFixed(2)}:1 — it will be squeezed to fit.`)
    }
    if (sheet.tileable) {
      console.log('  · tileable band — checking the seam after slicing')
    }
    if (sheet.kind === 'cell' && Math.abs(w / h - 1) > 0.05) {
      console.warn(`  ! not square (${w}x${h}, ${(w / h).toFixed(2)}:1).`
        + ` Squaring by --fit ${FIT}${FIT === 'squash' ? ' (distorts)' : ' (crops the edges)'}.`)
      console.warn('    Set the aspect ratio in your image tool to 1:1 to avoid this.')
    }
    const drift = sheet.kind === 'cell' || sheet.kind === 'scenery'
      ? 0
      : Math.abs(sx - sy) / Math.max(sx, sy)
    if (drift > 0.01) {
      // A walk sheet is forgiven the same way a strip is, and for the same
      // reason: the panels still divide the frame evenly, every one is distorted
      // by the same factor, and each is resampled back to its nominal box on the
      // way out. Refusing a good generation over arithmetic we can do ourselves
      // is the more expensive mistake when a generation costs a re-roll.
      // How far a UNIFORM drift may go before it stops being a drift.
      //
      // A strip or a walk is one row, so it is forgiven generously: the panels
      // still divide the frame evenly, every one is distorted by the same
      // factor, and each is resampled back to its nominal box on the way out.
      //
      // A lattice sheet gets a tighter but real allowance for the same reason,
      // because the rects are read PER AXIS: `c.x * sx`, `c.y * sy`. A return
      // that came back 1.1% out of proportion still lands every panel on its
      // own content — refusing it threw away five painted enemy sheets over
      // arithmetic already written here. A grid that was genuinely re-composed
      // misses by far more: the glyph sheet re-laid from 3 columns to 5 came
      // back 19% off, and is still refused, with the reason.
      const allow = ['strip', 'walk'].includes(sheet.kind) ? 0.15 : 0.06
      if (drift > allow) {
        console.error(`  ✗ aspect ratio changed (${sx.toFixed(3)} vs ${sy.toFixed(3)}, ${(drift * 100).toFixed(1)}%).`)
        console.error(['strip', 'walk'].includes(sheet.kind)
          ? '    Too far off to correct — ask for it again at the stated size.'
          : '    The model re-composed the grid; the cell rects no longer apply.'
            + '\n    If the SHEET was re-laid since this was painted, repaint it from the new reference.')
        failed++
        continue
      }
      console.warn(`  ! proportions drifted ${(drift * 100).toFixed(1)}%`
        + ` — squares came back ${sy < sx ? 'squashed' : 'stretched'}; correcting to square.`)
    }

    // Chroma is simply ON unless refused.
    //
    // Two heuristics were tried for "does this image have a magenta ground" and
    // both were wrong for the same reason: a block fills its cell edge to edge
    // by contract, so on a block strip there is barely any background to find —
    // magenta shows only in the rounded corners. Border sampling saw artwork,
    // and a whole-image fraction came in under any sane threshold.
    //
    // The keyer's channel test (G under 70 with R and B both over 190) matches
    // nothing in `PALETTES` — the closest is the bat's #ff5ad0, clear by twenty
    // points of green — so running it on an image with no magenta in it is a
    // no-op rather than a risk. No detection needed.
    const chroma = !NO_CHROMA

    // ── What grid did we ACTUALLY get back? ──
    //
    // A walk sheet is the one thing here that cannot survive a re-composed
    // grid. Every other target is either a single object or a row whose cells
    // are square by contract; a walk is N panels of one animation, and cutting
    // 4x2 out of a sheet that came back 4x6 does not produce a wrong-looking
    // frame, it produces three-sixths of a frame, eight times.
    //
    // Two real returns forced this. One came back with the panel dividers drawn
    // in as magenta LINES on a dusty-pink ground — the background rule read as
    // an instruction to decorate with magenta rather than to fill with it. The
    // other silently grew from two rows to six.
    //
    // So the layout is measured off the pixels: bands of content separated by
    // runs of background. Only the COUNT is taken from the measurement. The cut
    // itself stays a uniform grid, because panels of unequal width resampled to
    // one output size would shift the creature between frames — the exact
    // jitter the no-trim rule exists to prevent.
    if (sheet.kind === 'walk') {
      const seen = await send('Runtime.evaluate', {
        expression: `(() => {
          const img = globalThis.__sheet;
          const W = img.naturalWidth, H = img.naturalHeight;
          const cv = document.createElement('canvas');
          cv.width = W; cv.height = H;
          const c2 = cv.getContext('2d');
          c2.drawImage(img, 0, 0);
          const d = c2.getImageData(0, 0, W, H).data;

          // The background is whatever the outer ring is made of. Up to four
          // colours, because a drawn divider that reaches the edge is part of
          // the furniture even though it is not the ground.
          const q = (i) => ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
          const counts = new Map();
          const ring = [];
          for (let x = 0; x < W; x++) { ring.push(x); ring.push((H - 1) * W + x); }
          for (let y = 0; y < H; y++) { ring.push(y * W); ring.push(y * W + W - 1); }
          for (const k of ring) {
            const key = q(k * 4);
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
          const centre = (k) => [((k >> 8) & 15) * 16 + 8, ((k >> 4) & 15) * 16 + 8, (k & 15) * 16 + 8];
          const near = (a, b, tol) =>
            Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= tol;
          const refs = [];
          for (const [key] of [...counts].sort((a, b) => b[1] - a[1])) {
            const c3 = centre(key);
            if (refs.some((r) => near(r, c3, 64))) continue;
            if (refs.length < 4) refs.push(c3);
          }
          // Magenta counts as background wherever it turns up, drawn on purpose
          // or not: nothing in the palette is within twenty points of it.
          const isBg = (k) => {
            const i = k * 4;
            if (d[i + 3] < 8) return true;
            if (d[i + 1] < 70 && d[i] > 190 && d[i + 2] > 190) return true;
            return refs.some((r) => near(r, [d[i], d[i + 1], d[i + 2]], 60));
          };

          // How much of one line, across the whole axis, is background.
          const bgLine = (a, m, at) => {
            let bg = 0;
            for (let b = 0; b < m; b++) if (isBg(at(a, b))) bg++;
            return bg / m;
          };

          // ── Snap to a uniform grid, do not trust raw content bands ──
          //
          // Bands alone are wrong, and a real return proved it: a shark whose
          // tail fin is drawn detached from its body has a full-height column
          // of background running down the middle of its own panel, so four
          // panels measured as six bands. What is actually being looked for is
          // a REPEATING cut, and the cut is uniform by construction.
          //
          // So each candidate count is tested directly: are all of its interior
          // cut lines clean, and does every panel it produces contain something?
          // The largest count that passes wins — the cuts of a 4-grid are a
          // subset of an 8-grid's, so asking "is it clean" alone would always
          // answer 1.
          const fit = (n, m, at) => {
            const best = { n: 1 };
            for (let k = 2; k <= 12; k++) {
              if (n / k < 32) break;
              let clean = true;
              for (let i = 1; i < k && clean; i++) {
                // A drawn divider has width, and a cut can land a pixel either
                // side of it, so the neighbourhood is what is tested.
                const at0 = Math.round((n * i) / k);
                let bestLine = 0;
                for (let o = -2; o <= 2; o++) {
                  const a = at0 + o;
                  if (a < 0 || a >= n) continue;
                  bestLine = Math.max(bestLine, bgLine(a, m, at));
                }
                if (bestLine < 0.985) clean = false;
              }
              if (!clean) continue;
              // Every panel has to hold a creature. Without this an empty
              // margin would happily split into more, smaller empty panels.
              const content = [];
              for (let i = 0; i < k; i++) {
                const s0 = Math.round((n * i) / k), e0 = Math.round((n * (i + 1)) / k);
                let on = 0;
                for (let a = s0; a < e0; a++) if (bgLine(a, m, at) < 0.98) on++;
                content.push(on / Math.max(1, e0 - s0));
              }
              const top = Math.max(...content);
              if (top <= 0 || Math.min(...content) < top * 0.3) continue;
              best.n = k;
            }
            return best.n;
          };

          const colsN = fit(W, H, (x, y) => y * W + x);
          const rowsN = fit(H, W, (y, x) => y * W + x);
          // The commonest colour on the outer ring IS the ground the painter
          // used, whatever they were asked for. Reported so a background that
          // is merely magenta-ish can be named rather than guessed at.
          const top = refs[0] ?? [0, 0, 0];
          const hex = '#' + top.map((v) => v.toString(16).padStart(2, '0')).join('');
          const isMagenta = top[1] < 70 && top[0] > 190 && top[2] > 190;
          return JSON.stringify({ cols: colsN, rows: rowsN, W, H, hex, isMagenta });
        })()`,
        returnByValue: true
      })
      const got = seen.exceptionDetails ? null : JSON.parse(seen.result.value)
      const wantCols = sheet.cols
      const wantRows = sheet.rows

      if (!got || got.cols < 1 || got.rows < 1) {
        console.warn('  ! could not read the panel grid — cutting the nominal'
          + ` ${wantCols}x${wantRows}. Check the result before shipping it.`)
      } else if (got.cols === wantCols && got.rows === wantRows) {
        console.log(`  · grid reads ${got.cols}x${got.rows}, as asked`)
      } else if (FRAMES_OVERRIDE && FRAMES_OVERRIDE === got.cols * got.rows) {
        console.warn(`  ! grid reads ${got.cols}x${got.rows} = ${got.cols * got.rows} panels,`
          + ` not ${wantCols}x${wantRows} — taking it as a ${FRAMES_OVERRIDE}-frame cycle.`)
        sheet = { ...sheet, cols: got.cols, rows: got.rows, frames: got.cols * got.rows }
      } else if (got.cols === 1 && got.rows === 1) {
        console.warn('  ! the whole sheet reads as ONE panel. Either the creatures'
          + ' touch each other or the background is not one flat colour.')
        console.warn(`    Cutting the nominal ${wantCols}x${wantRows} anyway.`)
      } else {
        const n = got.cols * got.rows
        console.error(`  ✗ grid came back ${got.cols}x${got.rows} = ${n} panels,`
          + ` asked for ${wantCols}x${wantRows} = ${sheet.frames}.`)
        console.error('    The panels are not where the cut expects them, so slicing'
          + ' this would shred every frame.')
        console.error(`    Re-generate it, or run again with --frames ${n} to accept`
          + ` it as a ${n}-frame cycle.`)
        failed++
        continue
      }

      // A ground that is only ROUGHLY magenta is the difference between a hard
      // key, which can never touch the artwork, and the flood fallback, which
      // eats any pale paint it can reach. One return came back on dusty pink and
      // lost three of its eight fish to exactly that.
      if (got && got.isMagenta === false) {
        console.warn(`  ! the background is ${got.hex}, not #ff00ff.`)
        console.warn('    Only true magenta can be keyed safely. Anything else falls')
        console.warn('    back to a flood fill, which eats pale artwork it can reach —')
        console.warn('    check every frame before shipping this.')
      }

      // Rebuild the cells on whatever grid we settled on. The index's rects
      // describe the sheet that went OUT; this describes the one that came in.
      const pw = sheet.width / sheet.cols
      const ph = sheet.height / sheet.rows
      sheet = {
        ...sheet,
        cells: Array.from({ length: sheet.frames }, (_, i) => ({
          id: `${sheet.id}#${i}`,
          label: sheet.id,
          variant: `frame ${i + 1}/${sheet.frames}`,
          x: (i % sheet.cols) * pw,
          y: Math.floor(i / sheet.cols) * ph,
          w: pw, h: ph,
          target: sheet.target,
          frame: i
        }))
      }
    }

    const slices = sheet.cells.filter((c) => c.target)
    if (!slices.length) {
      console.log(`  (no cell on this ${sheet.kind} has a drop-in target — reference only)`)
      continue
    }

    // ── Read the painting whole, before anything is cut ──
    //
    // See "WHAT IT READS BEFORE IT CUTS" at the top. Lattice sheets and walk
    // sheets only: a single or a band IS its own rect. A sheet with `fill`
    // panels (tiles, the frame) is left alone — its paint reaches the cut
    // lines by contract, so every test here would read it as a failure.
    const rectOf = (c) => ({
      x0: Math.round(c.x * sx), y0: Math.round(c.y * sy),
      x1: Math.round((c.x + c.w) * sx), y1: Math.round((c.y + c.h) * sy)
    })
    let prep = null
    if (!NO_CLEAN && ['sheet', 'walk'].includes(sheet.kind) && !sheet.cells.some((c) => c.fill)) {
      const cellsPx = sheet.cells.map((c) => ({
        id: c.id, target: c.target ?? null, fill: !!c.fill, fit: c.fit ?? null, ...rectOf(c)
      }))
      const minCell = Math.min(...cellsPx.map((c) => Math.min(c.x1 - c.x0, c.y1 - c.y0)))
      // Every edge of every cell is a line a grid may have been painted on.
      const seen = new Set()
      const vcuts = [], hcuts = []
      for (const c of cellsPx) {
        const cw = c.x1 - c.x0, ch = c.y1 - c.y0
        for (const at of [c.x0, c.x1]) {
          const key = `v${at}:${c.y0}`
          if (!seen.has(key)) { seen.add(key); vcuts.push({ at, from: c.y0, to: c.y1, cell: cw, len: ch }) }
        }
        for (const at of [c.y0, c.y1]) {
          const key = `h${at}:${c.x0}`
          if (!seen.has(key)) { seen.add(key); hcuts.push({ at, from: c.x0, to: c.x1, cell: ch, len: cw }) }
        }
      }
      // The lines two cells share, where one cell's paint must stop.
      const seams = []
      for (const a2 of cellsPx) {
        for (const b2 of cellsPx) {
          if (a2.x1 === b2.x0) {
            const from = Math.max(a2.y0, b2.y0), to = Math.min(a2.y1, b2.y1)
            if (to > from) seams.push({ vertical: true, at: a2.x1, from, to, d: Math.max(3, Math.round((a2.x1 - a2.x0) * 0.03)) })
          }
          if (a2.y1 === b2.y0) {
            const from = Math.max(a2.x0, b2.x0), to = Math.min(a2.x1, b2.x1)
            if (to > from) seams.push({ vertical: false, at: a2.y1, from, to, d: Math.max(3, Math.round((a2.y1 - a2.y0) * 0.03)) })
          }
        }
      }
      // The reference is only a map of this painting when the painting kept
      // its grid; a walk accepted with --frames at another layout has none.
      const base = TARGETS.find((t) => t.id === sheet.id)
      const refFile = referenceOf(sheet)
      const ref = refFile && (sheet.kind !== 'walk' || (base.cols === sheet.cols && base.rows === sheet.rows))
        ? `data:image/png;base64,${readFileSync(refFile).toString('base64')}`
        : null
      const res = await send('Runtime.evaluate', {
        expression: `(${prepareInPage.toString()})(${JSON.stringify({
          cells: cellsPx, vcuts, hcuts, seams, minCell, lines: true, own: true, ref, strayMax: STRAY_MAX
        })})`,
        awaitPromise: true, returnByValue: true
      })
      if (res.exceptionDetails) {
        console.warn(`  ! could not read the painting whole (${res.exceptionDetails.exception?.description?.split('\n')[0] ?? 'error'})`
          + ' — cutting blind. Check every slice.')
      } else {
        prep = JSON.parse(res.result.value)
      }
    }
    if (prep) {
      for (const hex of prep.grounds) {
        console.warn(`  ! the background is ${hex}, not #ff00ff. ${prep.recoloured} px of it that reach a cut line`
          + ' were turned magenta and keyed; that is only as good as the outlines around the art — check every slice.')
      }
      if (prep.lines) {
        console.log(`  · erased ${prep.lines} painted grid line${prep.lines > 1 ? 's' : ''} (${prep.linePx} px):`
          + ' the key sheet\'s lattice, copied in as art.')
      }
      if (prep.crossing > GRID_CROSS_MAX) {
        const say = GRID_OK ? console.warn : console.error
        say(`  ${GRID_OK ? '!' : '✗'} ${(prep.crossing * 100).toFixed(0)}% of the cut lines run through painted subjects.`)
        say('    The model re-composed the grid (more or fewer panels than the reference, at the')
        say('    same overall size), so every cut would slice subjects in half.')
        if (!GRID_OK) {
          console.error('    Repaint it from the reference, or pass --grid-ok to cut it anyway.')
          failed++
          continue
        }
      } else if (prep.crossRows) {
        console.log(`  · ${(prep.crossing * 100).toFixed(1)}% of the cut length crosses paint — a subject over its line;`
          + ' it is given back to the cell that holds most of it.')
      }
    }

    const plan = slices.map((c) => ({
      id: c.id,
      target: c.target,
      letterboxed: c.letterboxed ?? null,
      sx: Math.round(c.x * sx), sy: Math.round(c.y * sy),
      sw: Math.round(c.w * sx), sh: Math.round(c.h * sy),
      // Which blobs of the painting are this cell's (`globalThis.__prep`), and
      // how far its own subject overhangs the rect. The cut is widened by that
      // much so the fit can take the whole stone back into the box — only
      // where there is a fit to do it with, and never for a walk frame, whose
      // strip is fitted as one.
      ci: prep ? sheet.cells.indexOf(c) : -1,
      pad: prep && !NO_FIT && c.fit && !c.fill && c.frame === undefined && prep.cells[c.id]
        ? prep.cells[c.id].pad
        : { l: 0, t: 0, r: 0, b: 0 },
      // Square again. When the proportions drifted this is what undoes it;
      // when they did not, source and output are equal and nothing resamples.
      // A single-cell image is capped: a model handed back 1536x1536 would
      // otherwise become a 1536 px block sprite, which is six times the size
      // `art-todo.md` asks for and pure payload for no visible gain.
      fit: sheet.kind === 'cell' ? FIT : 'squash',
      // A panel the index marks `fill` (a tile, the frame) fills its rect by
      // contract: trimmed to its own edges, never flood-filled, never fitted.
      isBlock: !!c.fill,
      trim: !NO_TRIM && sheet.kind !== 'scenery',
      // Never on a fill panel: its border IS artwork and a flood fill would
      // eat straight into it. An OPAQUE band is all artwork, edge to edge.
      autoBg: !NO_AUTO_BG && !c.fill && sheet.bg !== 'opaque',
      // Where the DRAWN content sat in this panel, as fractions of the panel
      // (solid pixels, alpha > 140). The return is normalised onto it below.
      refFit: NO_FIT ? null : (c.fit ?? null),
      // Which frame edges may SEED the flood.
      //
      // A band whose sky is at the top has artwork touching the other three
      // edges: the mountain range's base runs along the bottom, and its uniform
      // pale wash was picked up as "the background", so the flood started there
      // and ate the entire range but one peak. The sky is contiguous from the
      // top, so seeding from that edge alone reaches all of it and can never
      // start inside the mountain.
      seedTopOnly: sheet.bg === 'magenta-sky',
      // Enclosed-pocket removal is for a checkerboard square walled in by
      // artwork. On a JPEG it does the opposite: lossy chroma sprays magenta
      // INTO pale artwork, those specks look like tiny gaps, and removing them
      // punched holes right through the logo's lettering. Lossless only.
      pockets: mime !== 'image/jpeg',
      // Which frame of a walk cycle this panel is, or undefined for everything
      // else. Its presence is what routes the panel into the strip composer
      // instead of straight to a file of its own.
      frame: c.frame,
      // Panels are written at the NOMINAL panel shape, not the returned one.
      //
      // That is what makes a sheet that came back 16:9 when it was asked for 2:1
      // usable instead of rejected: the squash is uniform across every panel, so
      // resampling each one back to the box it is supposed to be undoes it
      // exactly. Capped by height because a 4K return would otherwise compose
      // into an 8192 px strip — pure payload, when the frame box is ~156 px in
      // game and the bake already downsamples at maximum zoom on a 3x screen.
      // A walk frame is sized by its TALL edge, and `--size` caps it.
      //
      // The cap used to be the constant alone, which quietly made `--size` a
      // no-op for every strip in the game: a pass meant to shrink the payload
      // took 128 px off each block and left the seventeen monster strips —
      // by far the heaviest thing shipped — at full size.
      outW: sheet.kind === 'scenery'
        ? c.w
        : sheet.kind === 'walk'
          ? Math.round(walkEdge(sheet, c, sy) * (c.w / c.h))
          : undefined,
      outH: sheet.kind === 'scenery'
        ? c.h
        : sheet.kind === 'walk'
          ? walkEdge(sheet, c, sy)
          : undefined,
      // Every frame at most 256 px, in every branch — the manifest's own
      // `maxEdge` may only lower it (a crest is 128 in play) or, for the one
      // nine-sliced frame, declare that it needs the full 1024.
      out: SIZE_FORCED ? SIZE : Math.min(c.maxEdge ?? DEFAULT_EDGE,
        Math.round(Math.max(c.w * sx, c.h * sy)))
    }))

    const cut = await send('Runtime.evaluate', {
      expression: `(() => {
        const img = globalThis.__sheet;
        const plan = ${JSON.stringify(plan)};
        const q = ${QUALITY};
        const CHROMA = ${chroma && sheet.bg !== 'opaque'};
        const FIT_REF = ${JSON.stringify(sheet.fit ?? null)};
        const FIT_TIGHT = ${sheet.tight ? 'true' : 'false'};
        const ANCHOR_REF = ${JSON.stringify(sheet.anchor ?? 'feet')};
        const out = [];
        // Walk-cycle panels, held back so they can be composed into one strip.
        const strip = [];
        // Who owns each blob of paint, from the whole-painting read (null when
        // the painting was cut blind).
        const PREP = globalThis.__prep || null;
        for (const p of plan) {
          // Crop the cell 1:1 first, so measuring happens on real pixels —
          // widened by the pad where this cell's own subject overhangs it.
          // CW x CH is the crop; p.sw x p.sh stays the panel it is fitted into.
          const CW = p.sw + p.pad.l + p.pad.r, CH = p.sh + p.pad.t + p.pad.b;
          const padded = CW !== p.sw || CH !== p.sh;
          const cell = document.createElement('canvas');
          cell.width = CW; cell.height = CH;
          const cc = cell.getContext('2d', { willReadFrequently: true });
          cc.drawImage(img, p.sx - p.pad.l, p.sy - p.pad.t, CW, CH, 0, 0, CW, CH);

          const id = cc.getImageData(0, 0, CW, CH);
          const d = id.data;
          const N_PIX = CW * CH;
          let keyed = 0;

          // Paint this cell does not own goes back to ground before anything
          // is keyed or measured: a neighbour's blob that crossed the cut, a
          // stray mark the reference never had. Magenta, so every step below
          // treats it exactly like the ground around it.
          //
          // 'art' marks the pixels of the crop that are magenta only because
          // they were painted over here. The border tests below skip them: a
          // neighbour's sliver along one side, counted as ground, would make a
          // sheet the key could not clear look keyed.
          let foreignPx = 0;
          const art = new Uint8Array(N_PIX);
          if (PREP && p.ci >= 0) {
            const lab = PREP.lab, own = PREP.owner, stray = PREP.stray;
            const ox = p.sx - p.pad.l, oy = p.sy - p.pad.t;
            for (let y = 0; y < CH; y++) {
              const yy = oy + y;
              if (yy < 0 || yy >= PREP.H) continue;
              for (let x = 0; x < CW; x++) {
                const xx = ox + x;
                if (xx < 0 || xx >= PREP.W) continue;
                const l = lab[yy * PREP.W + xx];
                if (!l || (own[l] === p.ci && !stray[l])) continue;
                const i = (y * CW + x) * 4;
                d[i] = 255; d[i + 1] = 0; d[i + 2] = 255; d[i + 3] = 255;
                art[y * CW + x] = 1;
                foreignPx++;
              }
            }
          }

          // Did the key find the GROUND, or only a few pixels of it? Counted
          // on the cell's own border, where a ground has to be. The boulder
          // sheet came back on dusty purple: 3% of it passed the magenta test,
          // which switched the flood off, and the spill step below then turned
          // the purple into a grey card behind every other stone.
          let groundFound = false;

          // Chroma key. Asking an image model for a transparent background is
          // unreliable — one attempt came back fully opaque, and it painted the
          // grey-and-white transparency checkerboard in as if it were art. A
          // flat magenta ground is something it can actually draw, and this
          // removes it. The band between the two thresholds is the anti-aliased
          // edge: it gets partial alpha, and the magenta pulled back out of the
          // surviving colour so sprites do not wear a pink halo.
          if (CHROMA) {
            // A CHANNEL test, not a distance-to-magenta one. Distance banding
            // ate legitimate colour: the bat's accent is #ff5ad0, which sits
            // close enough to pure magenta that a soft distance key knocked it
            // to 39% alpha. Pure magenta is the only thing with G near zero AND
            // both R and B near full, and no palette in the game has that.
            const W = CW, H = CH, N = W * H;
            const bg = new Uint8Array(N);
            for (let k = 0; k < N; k++) {
              const i = k * 4;
              if (d[i + 1] < 70 && d[i] > 190 && d[i + 2] > 190) { bg[k] = 1; d[i + 3] = 0; keyed++; }
            }
            // A crop widened past the painting's edge is transparent there,
            // which is ground too. Painted-over pixels are no evidence either way.
            let ringK = 0, ringN = 0;
            const ring = (k) => {
              if (art[k]) return;
              ringN++;
              if (bg[k] || d[k * 4 + 3] < 8) ringK++;
            };
            for (let x = 0; x < W; x++) { ring(x); ring((H - 1) * W + x); }
            for (let y = 1; y < H - 1; y++) { ring(y * W); ring(y * W + W - 1); }
            // A fill panel reaches its border by contract, so there the old
            // whole-cell count is all there is to go on.
            groundFound = keyed > N_PIX * 0.03
              && (p.isBlock || ringN < 16 || ringK >= ringN * 0.35);
            // De-fringe ONLY where art meets keyed background. Anti-aliasing
            // leaves a pink rim there; running this over the whole cell instead
            // would desaturate every warm highlight in the sprite.
            for (let y = 0; y < H; y++) {
              for (let x = 0; x < W; x++) {
                const k = y * W + x;
                if (bg[k]) continue;
                const touches = (x > 0 && bg[k - 1]) || (x < W - 1 && bg[k + 1])
                  || (y > 0 && bg[k - W]) || (y < H - 1 && bg[k + W]);
                if (!touches) continue;
                const i = k * 4, r = d[i], g = d[i + 1], b = d[i + 2];
                if (r > g + 30 && b > g + 30) {
                  const spill = Math.min(r - g, b - g);
                  d[i] = r - spill;
                  d[i + 2] = b - spill;
                  d[i + 3] = Math.max(0, d[i + 3] - Math.round(spill * 0.8));
                }
              }
            }
            // ── Unmix the soft edge from the magenta ──
            //
            // A hard key only removes what IS the ground. The moon is painted
            // with a wide luminous halo, and where that halo lay over the
            // magenta the two MIXED: those pixels are not background, and they
            // are nowhere near an edge, so both the flood and the erode leave
            // them. The moon shipped wearing a thick pink ring.
            //
            // Its background colour is known exactly, so the mix can be undone.
            // Distance from magenta gives the coverage, and magenta's share is
            // then subtracted back out of the colour that remains.
            //
            // Gated on the hard key having found REAL ground, not on the shore
            // clustering — a halo is a gradient across dozens of buckets, which
            // is exactly the case the clustering gate rejects.
            if (groundFound) {
              const LO = 60, HI = 210;
              for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] < 8) continue;
                const dist = Math.abs(d[i] - 255) + d[i + 1] + Math.abs(d[i + 2] - 255);
                if (dist >= HI) continue;
                if (dist <= LO) { d[i + 3] = 0; keyed++; continue; }
                const a2 = (dist - LO) / (HI - LO);
                // P = a*F + (1-a)*B, with B = magenta  =>  F = (P - (1-a)*B) / a
                const un = (v, bg) => {
                  const f = (v - (1 - a2) * bg) / a2;
                  return f < 0 ? 0 : f > 255 ? 255 : Math.round(f);
                };
                d[i] = un(d[i], 255);
                d[i + 1] = un(d[i + 1], 0);
                d[i + 2] = un(d[i + 2], 255);
                d[i + 3] = Math.round(d[i + 3] * a2);
              }
            }

            // ── Boundary erode ──
            //
            // The difference key only reaches pixels within 210 of magenta, and
            // the very outermost rim of a soft edge sits beyond that — which is
            // why the sun kept a thin pink outline after everything else. Being
            // ADJACENT to keyed background is itself strong evidence, so the
            // rule can be much looser there than it could be image-wide.
            if (groundFound) {
              const W2 = CW, H2 = CH;
              const Aa = (k) => d[k * 4 + 3];
              for (let pass = 0; pass < 2; pass++) {
                const edits = [];
                for (let y = 0; y < H2; y++) {
                  for (let x = 0; x < W2; x++) {
                    const k = y * W2 + x, i = k * 4;
                    if (d[i + 3] < 8) continue;
                    const touches = (x > 0 && Aa(k - 1) < 8) || (x < W2 - 1 && Aa(k + 1) < 8)
                      || (y > 0 && Aa(k - W2) < 8) || (y < H2 - 1 && Aa(k + W2) < 8);
                    if (!touches) continue;
                    const dist = Math.abs(d[i] - 255) + d[i + 1] + Math.abs(d[i + 2] - 255);
                    if (dist >= 300) continue;
                    edits.push([i, Math.round(d[i + 3] * Math.max(0, (dist - 120) / 180))]);
                  }
                }
                if (!edits.length) break;
                for (const [i, a2] of edits) d[i + 3] = a2;
              }
            }

            // ── Spill suppression ──
            //
            // What is left after unmixing is a mauve ring: halo pixels far
            // enough from pure magenta that widening the unmix to reach them
            // would start eating the moon's own pale edge.
            //
            // So stop trying to make them transparent and take the magenta OUT
            // of them instead. Magenta's signature is red and blue both above
            // green; pulling the excess down leaves a neutral halo, which is
            // what the glow was supposed to be. Warm art is untouched — cream
            // and tan have blue BELOW green, so they show no excess at all.
            if (groundFound) {
              for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] < 8) continue;
                const g = d[i + 1];
                const spill = Math.min(d[i], d[i + 2]) - g;
                if (spill <= 0) continue;
                d[i] = Math.round(d[i] - spill * 0.9);
                d[i + 2] = Math.round(d[i + 2] - spill * 0.9);
              }
            }

            cc.putImageData(id, 0, 0);
          }

          // ── Whatever the background actually turned out to be ──
          //
          // The magenta key only removes magenta. Returns arrive on white, on
          // cream parchment, or with the transparency CHECKERBOARD painted in
          // as literal pixels — a texture no colour key can express.
          //
          // So: work out what the background IS from the edge of the artwork,
          // then flood inward. Flooding is the trick — it only removes what is
          // CONNECTED to an edge, so a cream highlight inside the sun survives
          // while the cream around it does not.
          //
          // SEEDS ARE THE SHORE, NOT THE FRAME. Seeding from the image border
          // failed on the logo, which came back as a cream card floating on
          // magenta: the key cleared the border first, so there were no opaque
          // border pixels left to start from and the card sailed through. The
          // seeds are therefore every opaque pixel that touches transparency or
          // the frame — the outline of whatever is actually left.
          //
          // AND IT ONLY RUNS WHEN THE KEY FOUND NOTHING.
          //
          // Seeding is from the frame (see below), so after a magenta key has
          // succeeded the only opaque pixels left on that frame are ARTWORK that
          // crossed the cut line — six pixels of thornwick's leaves in one panel,
          // seventeen in the next. A handful of artwork pixels are then 100% of
          // the seeds, they clear the 70% cluster gate by themselves, and the
          // flood adopts the creature's own pale timber as "the background" and
          // eats the frame from the inside. Two of thornwick's eight frames came
          // back empty, and a boss that vanishes for an eighth of a second every
          // stride is the kind of bug that reads as a rendering fault.
          //
          // There is nothing to lose by skipping it: this is the fallback for the
          // grounds a colour key cannot express — white, cream, painted-in
          // checkerboard, dusty pink — and if the key already cleared the ground,
          // everything still opaque is the drawing.
          //
          // The seed floor guards the same failure on the paths where the key is
          // off or found nothing: a real background reaches a good share of the
          // frame it is behind. A dozen pixels of leaf do not.
          //
          // "Found nothing" is judged on the cell's BORDER (groundFound, above),
          // not on a share of the whole cell: a purple ground with a few
          // magenta-passing JPEG pixels in it found something, and nothing it
          // could use.
          const shore = p.seedTopOnly ? CW : 2 * (CW + CH);
          if (p.autoBg && !groundFound) {
            const W = CW, H = CH, N = W * H;
            const A = (k) => d[k * 4 + 3];
            const q = (i) => ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);

            const seeds = [];
            for (let y = 0; y < H; y++) {
              for (let x = 0; x < W; x++) {
                const k = y * W + x;
                if (A(k) < 8) continue;
                // SEED FROM THE FRAME ONLY.
                //
                // Seeding from "opaque next to transparent" was seeding from
                // the ARTWORK'S OWN OUTLINE: once the magenta around a conifer
                // is keyed, the tree's silhouette becomes the shore, its
                // uniform dark green becomes "the background", and the flood
                // eats holes straight through the foliage.
                //
                // Background is by definition what reaches the edge of the
                // frame. Anything walled in by artwork is either a pocket
                // (handled separately) or it is the artwork.
                const onFrame = p.seedTopOnly
                  ? y === 0
                  : x === 0 || y === 0 || x === W - 1 || y === H - 1;
                if (onFrame) seeds.push(k);
              }
            }

            const counts = new Map();
            for (const k of seeds) {
              const key = q(k * 4);
              counts.set(key, (counts.get(key) ?? 0) + 1);
            }
            // CLUSTER the buckets, do not just take the top four.
            //
            // A JPEG smears one flat colour across a dozen neighbouring
            // buckets: the logo's magenta ring came back as 24 of them, and
            // taking the top four covered 68.9% — losing to a 70% gate by a
            // hair, on an image that was plainly magenta. Merging by proximity
            // measures what a human sees, which is one colour.
            const centre = (key) =>
              [((key >> 8) & 15) * 16 + 8, ((key >> 4) & 15) * 16 + 8, (key & 15) * 16 + 8];
            // 64, and the margin either side of that is the whole point.
            //
            // The logo's JPEG-smeared magenta spanned buckets about 48 apart,
            // so they must merge. Cream sits roughly 180 from magenta, so it
            // must NOT — at 96 it did, and the key ate the lettering entirely
            // and punched holes through the sun's face.
            const near = (a2, b2) =>
              Math.abs(a2[0] - b2[0]) + Math.abs(a2[1] - b2[1]) + Math.abs(a2[2] - b2[2]) <= 64;

            const ranked = [...counts].sort((a2, b2) => b2[1] - a2[1]);
            const refs = [];
            let covered = 0;
            for (const [key, n] of ranked) {
              const c2 = centre(key);
              const hit = refs.find((r2) => near(r2, c2));
              if (hit) { covered += n; continue; }
              if (refs.length < 4) { refs.push(c2); covered += n }
            }
            const keep = (i) => refs.some((r2) => near(r2, [d[i], d[i + 1], d[i + 2]]));

            // A flat ground clusters; a block's wood-grain border does not.
            if (seeds.length >= shore * 0.1 && covered / seeds.length >= 0.7) {
              const seen = new Uint8Array(N);
              const stack = [];
              for (const k of seeds) {
                if (keep(k * 4) && !seen[k]) { seen[k] = 1; stack.push(k); }
              }
              let removed = 0;
              while (stack.length) {
                const k = stack.pop();
                d[k * 4 + 3] = 0;
                removed++;
                const x = k % W, y = (k / W) | 0;
                const push = (nk) => {
                  if (nk < 0 || nk >= N || seen[nk]) return;
                  if (A(nk) < 8) { seen[nk] = 1; return; }
                  if (!keep(nk * 4)) return;
                  seen[nk] = 1; stack.push(nk);
                };
                if (x > 0) push(k - 1);
                if (x < W - 1) push(k + 1);
                if (y > 0) push(k - W);
                if (y < H - 1) push(k + W);
              }

              // ── Enclosed pockets ──
              //
              // A checkerboard square sitting in the gap between two of the
              // sun's rays is walled in by artwork, so the flood never reaches
              // it and it survives as grey speckle. Anything still matching the
              // background AND small enough to be a gap rather than a subject
              // goes too.
              // A pocket has to be a real gap, matched TIGHTLY.
              //
              // The loose match used for the flood is wrong here. JPEG noise
              // sprinkles single pixels that pass it, and removing those
              // punched magenta speckle right across the logo's card; a looser
              // match also ate two holes in the sun's face, where pale cream
              // came within range of checker-white. Cream sits ~89 from white,
              // so 32 protects it while still catching a true checker cell.
              const nearTight = (a2, b2) =>
                Math.abs(a2[0] - b2[0]) + Math.abs(a2[1] - b2[1]) + Math.abs(a2[2] - b2[2]) <= 32
              const pocketBg = (i) => refs.some((r2) => nearTight(r2, [d[i], d[i + 1], d[i + 2]]))
              const POCKET_MAX = p.pockets ? Math.max(64, Math.round(N * 0.004)) : 0
              /** Below this it is compression noise, not a gap in the drawing. */
              const POCKET_MIN = 8
              const comp = new Int32Array(N).fill(-1)
              for (let k0 = 0; k0 < N; k0++) {
                if (comp[k0] !== -1 || A(k0) < 8 || !pocketBg(k0 * 4)) continue
                const cells = []
                const st = [k0]
                comp[k0] = k0
                while (st.length) {
                  const k = st.pop()
                  cells.push(k)
                  const x = k % W, y = (k / W) | 0
                  const step = (nk) => {
                    if (nk < 0 || nk >= N || comp[nk] !== -1) return
                    if (A(nk) < 8 || !pocketBg(nk * 4)) return
                    comp[nk] = k0; st.push(nk)
                  }
                  if (x > 0) step(k - 1)
                  if (x < W - 1) step(k + 1)
                  if (y > 0) step(k - W)
                  if (y < H - 1) step(k + W)
                }
                if (cells.length >= POCKET_MIN && cells.length <= POCKET_MAX) {
                  for (const k of cells) { d[k * 4 + 3] = 0; removed++ }
                }
              }

              // ── De-fringe ──
              //
              // A checkerboard against ink leaves a rim of pixels that are a
              // BLEND of the two, matching neither bucket, which survives as
              // white speckle along every ray. How close a boundary pixel is to
              // the background decides how much alpha it keeps.
              for (let pass = 0; pass < 2; pass++) {
                const edits = [];
                for (let y = 0; y < H; y++) {
                  for (let x = 0; x < W; x++) {
                    const k = y * W + x, i = k * 4;
                    if (d[i + 3] < 8) continue;
                    const touches = (x > 0 && A(k - 1) < 8) || (x < W - 1 && A(k + 1) < 8)
                      || (y > 0 && A(k - W) < 8) || (y < H - 1 && A(k + W) < 8);
                    if (!touches) continue;
                    let best = 1e9;
                    for (const [rr, gg, bb] of refs) {
                      const dist = Math.abs(d[i] - rr) + Math.abs(d[i + 1] - gg) + Math.abs(d[i + 2] - bb);
                      if (dist < best) best = dist;
                    }
                    if (best < 70) edits.push([i, 0]);
                    else if (best < 170) edits.push([i, Math.round(d[i + 3] * (best - 70) / 100)]);
                  }
                }
                if (!edits.length) break;
                for (const [i, a2] of edits) { if (a2 === 0) removed++; d[i + 3] = a2; }
              }

              keyed += removed;
              cc.putImageData(id, 0, 0);
            }
          }

          let x0 = CW, y0 = CH, x1 = -1, y1 = -1, opaque = 0;
          // A SECOND box at a high alpha floor, for the fit measurement only.
          // The reference is measured the same way: a soft shadow belongs to
          // neither silhouette, and letting one into the comparison sinks the
          // sprite by the depth of a shadow the other side never painted.
          let fx0 = CW, fy0 = CH, fx1 = -1, fy1 = -1;
          for (let y = 0; y < CH; y++)
            for (let x = 0; x < CW; x++) {
              const a = d[(y * CW + x) * 4 + 3];
              if (a > 8) {
                opaque++;
                if (x < x0) x0 = x; if (x > x1) x1 = x;
                if (y < y0) y0 = y; if (y > y1) y1 = y;
              }
              if (a > 140) {
                if (x < fx0) fx0 = x; if (x > fx1) fx1 = x;
                if (y < fy0) fy0 = y; if (y > fy1) fy1 = y;
              }
            }
          if (fx1 < 0) { fx0 = x0; fy0 = y0; fx1 = x1; fy1 = y1; }
          if (x1 < 0) {
            // A dropped panel is the commonest way a walk sheet comes back wrong,
            // and it must not silently become a hole in the animation.
            if (p.frame !== undefined) strip.push({ frame: p.frame, empty: true });
            else out.push({ id: p.id, empty: true });
            continue;
          }

          // A block has to reach all four edges or it tiles with a seam, and an
          // illustrator's instinct is to leave a polite margin — this crops
          // that margin back off and lets the block fill its cell. Only for
          // blocks: an enemy is SUPPOSED to have space around it.
          let src = { x: 0, y: 0, w: CW, h: CH };
          let trimmed = false;
          if (p.isBlock && p.trim && x1 >= 0) {
            const touches = x0 === 0 && y0 === 0 && x1 === CW - 1 && y1 === CH - 1;
            if (!touches) {
              src = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
              trimmed = true;
            }
          }

          // ── Normalise onto the reference's box ──
          //
          // Every returned sheet so far enlarged the subject to fill its panel;
          // on its own that looks fine, against the drawing it replaces it is
          // a stone a third too big in a box the renderer sized for the drawn
          // one. The bench recorded where the drawing sat ('refFit', solid
          // pixels only); the return is measured the same way, and one scale
          // and move puts it back. Per panel, because every panel is its own
          // file — there is no cycle here to keep steady.
          //
          // Measured in crop pixels, stated as fractions of the PANEL: a crop
          // widened for an overhanging stone is bigger than the panel, and the
          // fit is what brings the whole stone back inside it.
          let fitNote = null;
          // Back to the panel's own size, drawing the crop through a transform.
          const toPanel = (tx, ty, k2, fx, fy) => {
            const to = document.createElement('canvas');
            to.width = p.sw; to.height = p.sh;
            const g2 = to.getContext('2d');
            g2.translate(tx, ty);
            g2.scale(k2, k2);
            g2.translate(-fx, -fy);
            g2.drawImage(cell, 0, 0);
            cell.width = p.sw; cell.height = p.sh;
            cc.drawImage(to, 0, 0);
          };
          if (p.refFit && !p.isBlock && !p.letterboxed && p.frame === undefined && fx1 >= 0) {
            const midX = (fx0 + fx1 + 1) / 2, midY = (fy0 + fy1 + 1) / 2;
            const gotW = (fx1 - fx0 + 1) / p.sw, gotH = (fy1 - fy0 + 1) / p.sh;
            const gotCx = (midX - p.pad.l) / p.sw, gotCy = (midY - p.pad.t) / p.sh;
            const kH = gotH > 0.01 ? p.refFit.h / gotH : 1;
            const kW = gotW > 0.01 ? p.refFit.w / gotW : 1;
            // Match the reference box's AREA: a painting with the reference's
            // own proportions is untouched, one drawn longer and slimmer
            // splits the difference.
            const k = Math.sqrt(kH * kW);
            // The box is the rect the renderer blits into, so the measurement
            // cannot be wild: a factor of four means a stone painted four
            // times too big, not a mis-measurement. A correction under 4% is
            // not worth resampling for — unless the crop was widened, which
            // always has to come back to the panel.
            if (k > 0.1 && k < 4 && (padded || Math.abs(k - 1) > 0.04
                || Math.abs(gotCx - p.refFit.cx) > 0.02
                || Math.abs(gotCy - p.refFit.cy) > 0.02)) {
              toPanel(p.refFit.cx * p.sw, p.refFit.cy * p.sh, k, midX, midY);
              fitNote = {
                k: +k.toFixed(3),
                dx: +(p.refFit.cx - gotCx).toFixed(3),
                dy: +(p.refFit.cy - gotCy).toFixed(3)
              };
            }
          }
          // A widened crop that could not be fitted is cut back to its panel.
          if (padded && !p.letterboxed && cell.width !== p.sw) toPanel(0, 0, 1, p.pad.l, p.pad.t);

          let dst;
          if (p.letterboxed) {
            // This cell holds an existing bitmap that was padded into a square.
            // Trim the padding back off and restore its real dimensions, or the
            // game gets a square file where it expects a 3:1 ribbon.
            const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
            dst = document.createElement('canvas');
            dst.width = p.letterboxed.w; dst.height = p.letterboxed.h;
            dst.getContext('2d').drawImage(cell, x0, y0, bw, bh, 0, 0, dst.width, dst.height);
          } else if (p.outW && p.outH) {
            // A landscape band: written at its declared shape, never squared.
            dst = document.createElement('canvas');
            dst.width = p.outW; dst.height = p.outH;
            dst.getContext('2d').drawImage(cell, 0, 0, p.outW, p.outH);
          } else if (!trimmed && p.out === p.sw && p.out === p.sh) {
            dst = cell;
          } else if (trimmed) {
            dst = document.createElement('canvas');
            dst.width = p.out; dst.height = p.out;
            dst.getContext('2d').drawImage(cell, src.x, src.y, src.w, src.h,
              0, 0, p.out, p.out);
          } else {
            dst = document.createElement('canvas');
            dst.width = p.out; dst.height = p.out;
            const dc = dst.getContext('2d');
            if (p.fit === 'crop' && p.sw !== p.sh) {
              // Keep the material's proportions and lose the outer edges.
              const side = Math.min(p.sw, p.sh);
              dc.drawImage(cell, (p.sw - side) / 2, (p.sh - side) / 2, side, side,
                0, 0, p.out, p.out);
            } else {
              dc.drawImage(cell, 0, 0, p.out, p.out);
            }
          }
          // How much of each edge of the cell is actually opaque. A building
          // block has to reach all four, or the tower shows a seam around every
          // one of them — rounded corners and a polite margin are exactly what
          // an illustrator draws unless told not to.
          // Measured on the keyed crop, before any fit moved it, and only on
          // pixels the painter put there ('art' above).
          const edge = (pick) => {
            let on = 0, n = 0;
            for (let t = 0; t < (pick < 2 ? CW : CH); t++) {
              const x = pick === 0 || pick === 1 ? t : (pick === 3 ? 0 : CW - 1);
              const y = pick === 0 ? 0 : pick === 1 ? CH - 1 : t;
              if (art[y * CW + x]) continue;
              n++;
              if (d[(y * CW + x) * 4 + 3] > 8) on++;
            }
            return n ? on / n : 0;
          };
          // top, bottom, right, left — the order edge() counts them in.
          const edges = [edge(0), edge(1), edge(2), edge(3)];

          // ── A card ──
          //
          // The border is still opaque on sides where the DRAWING leaves room:
          // the ground was never removed, and the subject sits on a square of
          // it. The effects sheet came back painted on parchment tiles, and the
          // boulders on a purple the key could not see. bboxFill (below) only
          // warns; this refuses, because a card written over a good file is
          // the silent corruption the whole slicer exists to prevent.
          let card = false;
          if (!p.isBlock && p.frame === undefined && p.refFit) {
            const f = p.refFit;
            const room = [f.cy - f.h / 2, 1 - (f.cy + f.h / 2), 1 - (f.cx + f.w / 2), f.cx - f.w / 2];
            card = edges.filter((v, i) => room[i] >= 0.06 && v >= 0.5).length >= 2;
          }

          // A walk-cycle panel is a FRAME, not a file. It is held with its
          // content bbox so the frames can be checked against each other, then
          // composed into one strip below.
          if (p.frame !== undefined) {
            strip.push({
              frame: p.frame, cv: dst, keyed, srcArea: p.sw * p.sh, foreignPx,
              // Where the drawing sits in its panel, as fractions of the panel.
              // These are what catch a creature that wandered between frames.
              foot: (y1 + 1) / p.sh, top: y0 / p.sh,
              midX: ((x0 + x1) / 2) / p.sw,
              box: { x0: fx0 / p.sw, y0: fy0 / p.sh, x1: (fx1 + 1) / p.sw, y1: (fy1 + 1) / p.sh },
              coverage: opaque / (p.sw * p.sh)
            });
            continue;
          }

          out.push({
            id: p.id,
            target: p.target,
            keyed,
            srcArea: p.sw * p.sh,
            // How much of the finished sprite's BORDER is opaque.
            //
            // Total transparency is the wrong signal: the logo came back with a
            // cream card behind it and a magenta strip along one edge, so a
            // fifth of it keyed out and a whole-image threshold saw nothing
            // wrong. What says "the background survived" is the edge — a sprite
            // meant to sit on the battlefield has see-through borders.
            // How solidly the sprite fills its own bounding box.
            //
            // The border was the wrong probe. Once the magenta ring around the
            // logo's cream card is keyed, the border IS transparent and the
            // check passes — while the card sits untouched in the middle. What
            // gives a card away is that it fills its bounding box completely;
            // a sun, a tree or a logo's lettering never does.
            //
            // And how much of each side of that box it presses against, two
            // pixels in: a card is a rectangle, flush with its box all round
            // (81-100% on every side, measured on the effects and boulder
            // cards); an emerald-cut stone or a plaque is solid too, but has at
            // least one side it only touches along part of (63% at most).
            ...(() => {
              const W = dst.width, H = dst.height;
              const q = dst.getContext('2d').getImageData(0, 0, W, H).data;
              const A = (x, y) => q[(y * W + x) * 4 + 3] >= 8;
              let x0 = W, y0 = H, x1 = -1, y1 = -1, on = 0;
              for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                  if (!A(x, y)) continue;
                  on++;
                  if (x < x0) x0 = x; if (x > x1) x1 = x;
                  if (y < y0) y0 = y; if (y > y1) y1 = y;
                }
              }
              if (x1 < 0) return { bboxFill: 0, flush: 0, hole: 0 };
              const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
              const i2 = Math.min(2, Math.floor(Math.min(bw, bh) / 4));
              let t = 0, b = 0, l = 0, r = 0;
              for (let x = x0; x <= x1; x++) { if (A(x, y0 + i2)) t++; if (A(x, y1 - i2)) b++; }
              for (let y = y0; y <= y1; y++) { if (A(x0 + i2, y)) l++; if (A(x1 - i2, y)) r++; }
              // Clear pixels the sprite walls in: the middle of a ring.
              const outside = new Uint8Array(W * H);
              const st = [];
              const push = (x, y) => {
                if (x < 0 || y < 0 || x >= W || y >= H) return;
                const j = y * W + x;
                if (outside[j] || A(x, y)) return;
                outside[j] = 1; st.push(j);
              };
              for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
              for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
              while (st.length) {
                const j = st.pop(), x = j % W, y = (j - x) / W;
                push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
              }
              let holes = 0;
              for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!A(x, y) && !outside[y * W + x]) holes++;
              return {
                bboxFill: on / (bw * bh),
                flush: Math.min(t / bw, b / bw, l / bh, r / bh),
                hole: holes / (bw * bh)
              };
            })(),
            edges,
            card,
            foreignPx,
            padded,
            trimmed,
            fill: p.isBlock,
            fitNote,
            w: dst.width, h: dst.height,
            coverage: opaque / (p.sw * p.sh),
            dataUrl: dst.toDataURL('image/webp', q)
          });
        }
        // ── Compose the walk cycle ──
        //
        // One image, frames left to right in cycle order, every panel the same
        // size. The runtime divides the width by the frame box's aspect to get
        // the frame count back, so the panels must be uniform and in order.
        if (strip.length) {
          const walkId = ((plan.find((x) => x.frame !== undefined) || {}).id || 'walk')
            .split('#')[0];
          strip.sort((a2, b2) => a2.frame - b2.frame);
          const solid = strip.filter((f) => !f.empty);
          if (!solid.length) {
            out.push({ id: walkId, empty: true });
          } else {
            const fw = solid[0].cv.width, fh = solid[0].cv.height;

            // ── Normalise onto the reference's box ──
            //
            // Every returned siege sheet so far enlarged the machine to fill its
            // panel and dropped it to the bottom — the catapult at more than
            // double size. On its own that looks fine; against the arm, which is
            // drawn live from the geometry, it is plainly a different machine.
            //
            // ONE correction for the whole strip, never per frame. Fitting each
            // frame to its own content is exactly what makes a cycle jitter, so
            // the union across all frames is measured, a single scale and offset
            // fall out of it, and every frame gets identical treatment.
            const FIT = FIT_REF;
            let fitNote = null;
            if (FIT && FIT.h > 0) {
              let bx0 = 1, by0 = 1, bx1 = 0, by1 = 0;
              for (const f of solid) {
                if (f.box.x0 < bx0) bx0 = f.box.x0;
                if (f.box.y0 < by0) by0 = f.box.y0;
                if (f.box.x1 > bx1) bx1 = f.box.x1;
                if (f.box.y1 > by1) by1 = f.box.y1;
              }
              const gotH = by1 - by0;
              const gotW = bx1 - bx0;
              const kH = gotH > 0.01 ? FIT.h / gotH : 1;
              // Match the reference box's AREA when the box is a boundary.
              //
              // Height alone lets a part that came back a different SHAPE — a
              // longer, slimmer barrel — overhang the block by however much its
              // proportions differ; the cannon reached a block and a quarter.
              // But taking the tighter axis instead is the opposite mistake: the
              // barrel then fits the width exactly and stands 40% shorter than
              // the drawn one, and every fixture on the tower reads shrunken.
              //
              // The geometric mean splits it. A painting with the reference's own
              // proportions is untouched, because both axes agree; one that is
              // half again as long comes back a quarter over on width and a
              // quarter under on height, which is what "the same size, drawn
              // differently" actually looks like.
              const kW = FIT_TIGHT && FIT.w > 0 && gotW > 0.01
                ? FIT.w / gotW
                : Infinity;
              const k = Number.isFinite(kW) ? Math.sqrt(kH * kW) : kH;
              const gotBottom = by1, gotCx = (bx0 + bx1) / 2;
              // A wild measurement must never obliterate the art, and a
              // correction under 4% is not worth resampling for.
              //
              // The floor is looser for a TIGHT box, because there the
              // measurement cannot be wild: the reference says exactly how
              // much room the part gets, so a factor of four means a part
              // painted four times too big, not a mis-measurement. The
              // repair crane came back at 4.15x — a good drawing, simply
              // filling its frame — and the 0.25 floor refused to shrink it,
              // which shipped a crane longer than the block it stands on.
              const floor = FIT_TIGHT ? 0.1 : 0.25;
              // A FIXTURE is centred in its box on both axes, whatever the
              // drawing did. The drawn parts sit wherever their procedural
              // code put them — a coil standing on the block's top edge, a
              // barrel with its carriage hanging below — and registering a
              // painting against that left every part high and to one side.
              // Centring also puts the turn axis through the part's own
              // middle, so a bow rotates in place instead of orbiting.
              const byFeet = ANCHOR_REF !== 'centre';
              const gotMidY = (by0 + by1) / 2;
              const fromY = FIT_TIGHT ? gotMidY : byFeet ? gotBottom : gotMidY;
              const toY = FIT_TIGHT ? 0.5 : byFeet ? FIT.bottom : 0.5;
              const toX = FIT_TIGHT ? 0.5 : FIT.cx;
              if (k > floor && k < 4 && (Math.abs(k - 1) > 0.04
                  || Math.abs(fromY - toY) > 0.02
                  || Math.abs(gotCx - toX) > 0.02)) {
                for (const f of solid) {
                  const to = document.createElement('canvas');
                  to.width = fw; to.height = fh;
                  const g2 = to.getContext('2d');
                  g2.translate(toX * fw, toY * fh);
                  g2.scale(k, k);
                  g2.translate(-gotCx * fw, -fromY * fh);
                  g2.drawImage(f.cv, 0, 0);
                  f.cv = to;
                }
                fitNote = { k: +k.toFixed(3), dy: +(FIT.bottom - gotBottom).toFixed(3) };
              }
            }
            const cv = document.createElement('canvas');
            cv.width = fw * strip.length;
            cv.height = fh;
            const g = cv.getContext('2d');
            for (let i = 0; i < strip.length; i++) {
              const f = strip[i];
              // A dropped panel holds its slot as a transparent frame rather
              // than shortening the strip: a missing frame is a visible hitch
              // in the walk, which is the point of reporting it.
              if (!f.empty) g.drawImage(f.cv, i * fw, 0);
            }
            out.push({
              id: walkId,
              target: (plan.find((x) => x.frame !== undefined) || {}).target,
              frames: strip.length,
              missing: strip.filter((f) => f.empty).map((f) => f.frame + 1),
              feet: solid.map((f) => f.foot),
              mids: solid.map((f) => f.midX),
              coverages: solid.map((f) => f.coverage),
              fitNote,
              keyed: solid.reduce((a2, f) => a2 + f.keyed, 0),
              foreignPx: solid.reduce((a2, f) => a2 + f.foreignPx, 0),
              srcArea: solid.reduce((a2, f) => a2 + f.srcArea, 0),
              w: cv.width, h: cv.height,
              dataUrl: cv.toDataURL('image/webp', q)
            });
          }
        }

        return JSON.stringify(out);
      })()`,
      returnByValue: true
    })
    if (cut.exceptionDetails) {
      throw new Error(cut.exceptionDetails.exception?.description ?? 'slice failed')
    }

    const results = JSON.parse(cut.result.value)
    // Panels whose ground was never removed (see groundVerdict). When a third
    // or more of a sheet's panels come back like that, the ground is broken
    // across the whole painting and the panels that squeaked through were cut
    // from the same broken ground — the effects sheet refused seven panels
    // and "passed" a flash, a scorch and an arrow still standing on ragged
    // parchment. So then nothing from it is written.
    const verdicts = new Map(results.filter((r) => !r.empty && r.dataUrl)
      .map((r) => [r.id, groundVerdict(r, prep?.cells?.[r.id], sheet)]))
    const cut2 = [...verdicts.values()]
    const bad = cut2.filter(Boolean).length
    if (bad >= 2 && bad >= cut2.length / 3) {
      for (const lines of cut2.filter(Boolean)) for (const l of lines) console.error(l)
      console.error(`  ✗ ${bad} of ${cut2.length} panels came back standing on their ground: it is broken across`
        + ' the whole painting, and the rest were cut from the same ground. Nothing from it is written.')
      failed += cut2.length
      continue
    }
    for (const r of results) {
      if (r.empty) {
        console.log(`  · ${r.id.padEnd(26)} empty cell, skipped`)
        skipped++
        continue
      }
      if (!r.dataUrl.startsWith('data:image/webp')) {
        console.error(`  ✗ ${r.id.padEnd(26)} browser would not encode WebP`)
        failed++
        continue
      }
      const full = safeTarget(r.target)
      if (!full) {
        console.error(`  ✗ ${r.id.padEnd(26)} target escapes ${relative(ROOT, OUT_ROOT)}/`)
        failed++
        continue
      }
      // What the whole-painting read took out of this cell, and gave back.
      const pc = prep?.cells?.[r.id]
      const refused = verdicts.get(r.id)
      if (refused) {
        for (const l of refused) console.error(l)
        failed++
        continue
      }
      if (pc?.foreignPx) {
        console.log(`    · erased ${pc.foreignPx} px of ${Object.keys(pc.from).join(', ')} that crossed into this cell.`)
      }
      if (pc?.strayN) {
        const b = pc.strayBox.map((v) => v.toFixed(2)).join(', ')
        console.log(`    · erased ${pc.strayN} mark${pc.strayN > 1 ? 's' : ''} (${pc.strayPx} px, in ${b} of the panel)`
          + ' where the reference has nothing: baked text, a cell number, stray paint.')
      }
      if (r.padded) {
        console.log('    · its subject overhung the cell — cut wider, and fitted back into the panel whole.')
      }
      if (r.frames !== undefined && r.foreignPx) {
        console.log(`    · erased ${r.foreignPx} px of neighbouring frames that crossed the panel lines.`)
      }
      if (r.fitNote) {
        console.log(`    · normalised onto the reference: scaled to`
          + ` ${(r.fitNote.k * 100).toFixed(0)}% and moved`
          + ` ${(r.fitNote.dx * 100).toFixed(0)}% / ${(r.fitNote.dy * 100).toFixed(0)}% of the panel.`)
      }
      // A sprite that is meant to sit ON something needs a background that was
      // actually removed. Fill panels are the exception: they fill their rect
      // by contract, so an opaque one is correct. An opaque band IS a solid
      // rectangle — that is its whole job.
      if (r.bboxFill !== undefined && r.bboxFill > 0.92
        && !r.fill
        && sheet.bg !== 'opaque') {
        console.warn(`    ! ${r.id} fills ${(r.bboxFill * 100).toFixed(0)}% of its own`
          + ' bounding box — it is a solid rectangle.')
        console.warn('      The subject was almost certainly painted onto a card or panel')
        console.warn('      that is now welded in. Re-generate it on flat magenta.')
      }

      // ── Walk-cycle sanity ──
      //
      // The strip is composed blind from a fixed grid, so everything that can go
      // wrong with it goes wrong quietly: a panel the model declined to paint, a
      // creature that grew between frames, a creature that walked out of its own
      // panel. None of that is visible in the file — it is visible in the game,
      // as a limp.
      if (r.frames !== undefined) {
        if (r.fitNote) {
          console.log(`    · normalised onto the reference: scaled to`
            + ` ${(r.fitNote.k * 100).toFixed(0)}% and`
            + ` moved ${(r.fitNote.dy * 100).toFixed(0)}% of a panel vertically.`)
          console.log('      It came back a different size from the sheet it was painted')
          console.log('      over, and the parts drawn live over it are not negotiable.')
        }
        if (r.missing?.length) {
          console.warn(`    ! frame${r.missing.length > 1 ? 's' : ''} ${r.missing.join(', ')}`
            + ` of ${r.frames} came back EMPTY — the walk will hitch there.`)
        }
        const spread = (xs) => (xs?.length ? Math.max(...xs) - Math.min(...xs) : 0)
        // The feet must land on one line. This is the difference between a walk
        // and a hop, and it is the single most likely thing to be wrong.
        // The bolt has no feet — it is centred — so the line-of-contact check
        // is meaningless for it and reads as the tool having got lost.
        const wheels = false
        if ((r.target ?? '').startsWith('images/rounds/')) r.feet = []
        const foot = spread(r.feet)
        if (foot > 0.04) {
          console.warn(`    ! the ${wheels ? 'wheels' : 'feet'} move`
            + ` ${(foot * 100).toFixed(0)}% of the panel height between frames —`
            + ` it will ${wheels ? 'hop as it rolls' : 'bob as it walks'}.`)
        }
        const mid = spread(r.mids)
        if (mid > 0.08) {
          console.warn(`    ! the body drifts ${(mid * 100).toFixed(0)}% of the panel width`
            + ` between frames — it will slide as it ${wheels ? 'rolls' : 'walks'}.`)
        }
        // A frame that is much bigger or smaller than its neighbours is a
        // redraw at a different scale, not a pose.
        const cov = spread(r.coverages)
        const avg = r.coverages?.length
          ? r.coverages.reduce((a, b) => a + b, 0) / r.coverages.length
          : 0
        if (avg > 0 && cov / avg > 0.5) {
          console.warn(`    ! frame sizes vary by ${((cov / avg) * 100).toFixed(0)}%`
            + ' — the creature was redrawn at different scales.')
        }
      }

      // A tile that does not reach its own edges sits with a gap.
      if (r.fill && r.edges && !r.trimmed) {
        const names = ['top', 'bottom', 'right', 'left']
        const short = r.edges
          .map((v, i) => ({ v, n: names[i] }))
          .filter((e) => e.v < 0.9)
        if (short.length) {
          console.warn(`    ! ${r.id} does not reach its ${short.map((e) => e.n).join('/')} edge`
            + ` (${short.map((e) => `${(e.v * 100).toFixed(0)}%`).join(', ')}).`
            + ' Side by side, this shows a seam — ask for square corners, no margin.')
        }
      }
      const bytes = Buffer.from(r.dataUrl.slice(r.dataUrl.indexOf(',') + 1), 'base64')
      const shown = `${r.target}  ${r.w}x${r.h}  ${(bytes.length / 1024).toFixed(1)}kB`
        + (r.trimmed ? '  (trimmed to fill)' : '')
        + (r.keyed ? `  (keyed ${(100 * r.keyed / r.srcArea).toFixed(0)}% bg)` : '')
      if (DRY) {
        console.log(`  → ${r.id.padEnd(26)} ${shown}`)
      } else {
        mkdirSync(dirname(full), { recursive: true })
        writeFileSync(full, bytes)
        console.log(`  ✓ ${r.id.padEnd(26)} ${shown}`)
      }
      written++
    }
    if (receiptLine && written > writtenBefore) receiptNext[basename(file)] = receiptLine
  }

  // The receipt records what was actually cut, so a dry run leaves it alone —
  // and so does a run into another --out, which installed nothing.
  if (written && !DRY && OUT_ROOT === resolve(ROOT, 'public')) {
    mkdirSync(PAINTED, { recursive: true })
    writeFileSync(RECEIPT, `${JSON.stringify({ note: 'written by tools/slice-sheets.mjs — the reference revision each painting was cut against', files: receiptNext }, null, 2)}\n`, 'utf-8')
  }

  console.log(`\n${DRY ? 'would write' : 'wrote'} ${written} file(s)`
    + `${skipped ? `, skipped ${skipped} empty` : ''}`
    + `${failed ? `, ${failed} FAILED` : ''}`)
  if (written && !DRY) {
    console.log('\nTo see it: open the game with  ?art=on   (remembered; ?art=off reverts).')
    console.log('Already open? Run  __art.refresh()  in the console to re-read from disk.')
    console.log('To ship it enabled, set VITE_ENABLE_ART_OVERRIDES=true in .env.')
  }
  shutdown(failed ? 1 : 0)
} catch (e) {
  console.error('\nERROR: ' + e.message)
  shutdown(1)
}
