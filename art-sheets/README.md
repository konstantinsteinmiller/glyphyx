# Art sheets — the procedural → painted round trip

Glyphyx draws itself: every stone, glyph, tile and chip is Canvas 2D in
`src/use/arenaPainters.ts`, baked to sprites at runtime. This folder is how
those drawings leave the renderer, get repainted in the game's hand-drawn
mythical-fantasy style by an image model, and come back as drop-in bitmaps —
**with no renderer change**. A painting is found at the path `spriteFor()`
already probes; a missing file means the drawing keeps drawing.

```
  arenaPainters (the drawings)
        │  /#/art-sheets bakes every drawable onto a strict 256 px lattice
        ▼
  sheet-*.png (magenta ground)  +  PROMPTS-*.md  +  sheet-index.json
        │  you: paste the block, attach the clean sheet, paint
        ▼
  painted/<same name>.png
        │  pnpm art:slice — key → fit onto the drawing → cut → WebP
        ▼
  public/images/<kind>/<id>.webp
        │  spriteFor(kind, id), behind the art flag
        ▼
  the game, and /#/playground to look at it
```

## The loop

1. **Export the references.** `pnpm dev` (or `npx vite --port 2062`), open
   `/#/art-sheets`, press **Export all sheets** — or headlessly:
   `pnpm art:export` against a running dev server. This writes every
   `sheet-*.png` (clean, magenta ground), `sheet-*-key.png` (the captions —
   for you, never for the painter), `walk-*.png`, `bg-*.png`, the four
   `PROMPTS-*.md` and `sheet-index.json` (every rect, every target, and the
   measured `fit` of every panel).
2. **Paint one sheet per generation.** Attach the CLEAN sheet and paste its
   block from `PROMPTS-RUNES.md` / `PROMPTS-BOARD.md` / `PROMPTS-CAST.md`.
   Open that file in a markdown **preview**: every prompt is a fenced block, so
   its copy button takes the whole thing in one click — the heading above it
   (which file to attach, where the return lands) stays out of the clipboard.
   Ask for PNG at the stated size and aspect ratio.
3. **Drop the return in `painted/`** under the sheet's own name
   (`sheet-runes-melee.png`, `walk-bonecap.png`, `bg-ridge-far.png`). A bare
   id works for walks and bands (`bonecap.png`); sheets keep their full name.
4. **`pnpm art:slice`** (`-- --dry` first after any manifest change). It keys
   the magenta, measures where the painting sits in each panel, normalises it
   onto the box the drawing occupied, cuts the lattice with integer
   arithmetic and writes WebP at **≤ 256 px per frame** into `public/images/`.
   It refuses rather than guesses: a re-composed grid, an unknown file, a
   stale name that would overwrite a good sprite — all loud.
5. **Look at it moving.** `/#/playground` shows every drawable through the
   game's own painters with a **painted / drawn** toggle. Then
   `pnpm art:measure -- cells` for the arithmetic the eye misses.
6. **Compress it.** The slicer encodes for correctness, not for size:
   `pnpm art:compress --dry-run` shows what a per-file quality search would
   save (about **-45 %** on sliced sprites), then run it without `--dry-run`.
   Originals go to `public-backup/`, so a later `--force` re-compresses from
   the pristine copy instead of stacking a second generation loss — never
   compress twice without it. See the Dev tools section of the root README.
7. **Ship it** by setting `VITE_ENABLE_ART_OVERRIDES=true` in a build's env.
   Until then `?art=on` tries it on one device and `?art=off` turns it back
   off with no rebuild — see `src/game/art.ts`.

**When a return is bad, fix the prompt, not the file.** Prompts are generated
from `src/game/artSheet.ts`; a hand-edited `PROMPTS-*.md` is overwritten on
the next export. Change the blurb, the colour line or the style block there,
run `pnpm art:prompts`, paint again.

## The Art Desk — steps 2 to 6 without the busywork

`pnpm art:desk` opens a local page (`tools/art-desk/`) that lists every
reference with its prompt and where it stands, and does the return trip —
file it under the right name, slice it, compress what was cut — one painting
at a time. Nothing about the pipeline changes: it reads the same
`PROMPTS-*.md`, calls the same slicer and compressor, and a painting it files
is exactly the file you would have saved by hand.

* **Find it.** Type a sheet, a sprite id or a word (`cleave jade` finds the
  axe sheet). **To paint** (the default) shows only what has no painting yet
  or needs a repaint; **Not sliced**, **Done** and **All** are one click away.
* **By hand.** **Copy image, then prompt** (<kbd>b</kbd>) puts the reference on
  the clipboard; paste it at Gemini, come back, and the prompt is on the
  clipboard instead. Press Gemini's download button: the desk is watching your
  Downloads folder for the job you copied from, and files, slices and
  compresses what lands there. Dropping or pasting an image onto the job works
  too. <kbd>i</kbd> image, <kbd>c</kbd> prompt, <kbd>/</kbd> search, <kbd>j</kbd>/<kbd>k</kbd> move.
* **By queue.** **Paint with Gemini** / **+ all to paint** drive
  gemini.google.com in a Chrome window of the desk's own
  (`~/.art-desk/gemini-chrome`, shared by every project — sign in there once),
  one generation at a time: 90 s apart plus up to 60 s of jitter, at most 40 a
  day across all projects, one re-roll per job, and a stop on a quota message,
  a sign-out or three failures in a row. All of it is in the **throttle**
  panel and `art-desk.config.json`. The Gemini API has no free tier for image
  output, so a free account means the web app; the selectors are structural
  because the app's labels are localised (German here).
* **What it protects.** A replaced painting moves to `painted/replaced/`
  (ignored by git and by the slicer), never deleted. The compressor runs with
  `--fresh` on exactly the files the slicer wrote — without it, a re-cut sprite
  whose old backup is in `public-backup/` is either skipped (shipped
  uncompressed) or, with `--force`, compressed from the OLD art. And the
  slicer's receipt now records the painting's own hash, so a re-roll saved
  under the old name is judged as the new painting it is.

## What to paint next

`pnpm art:prompts` also writes **`PAINT-STATUS.md`** — every sheet, the prompt
file its block lives in, and which of four states it is in:

| | |
| --- | --- |
| ✓ | sliced, and the drawing has not moved since |
| ! | **repaint** — the drawing was re-cut after this was painted |
| ? | a painting is sitting in `painted/` with no receipt against it |
| · | nothing painted for this one yet |

It is a report, not a contract: re-run `pnpm art:prompts` after painting or
slicing anything.

## The staleness guard, and why it exists

A painting is a snapshot of a DRAWING, and the drawing moves. The Bow was
re-cut after its stones were painted, and nothing noticed: the next
`pnpm art:slice` anybody ran — for an unrelated sheet — would have quietly
re-installed twelve stones carrying the old silhouette over the corrected one.

So a successful slice now leaves a receipt at `painted/.sliced.json` naming the
**revision** of the reference each file was cut against (the first 12 hex of a
sha1 over the clean sheet). When the reference has changed since, the painting
is refused with the reason, because it is a painting of something else:

```
✗ sheet-runes-archer.jpg — the reference was REDRAWN after this was painted (4a08… → 9f21…).
    art-sheets/sheet-runes-archer.png is not the picture this file was painted over any more.
    Repaint it from the new sheet, or pass --stale-ok to cut it anyway.
```

Without a receipt — a fresh clone, a first run — nothing is refused: a checkout
rewrites mtimes, so an older-looking file is a warning and the slice goes ahead.

A painting that is already known to be out of date can be parked in
`painted/stale/`, which the slicer does not read; there is a note there saying
what happened to each one.

## Adding a drawable

One line in `src/game/artSheet.ts` (a cell in a sheet, or a new sheet) plus its
id in `src/game/artCatalogue.ts` — the parity test in
`tests/game/artSheet.test.ts` fails until both agree. `pnpm art:prompts` then
writes its prompt with no browser involved, and the next export bakes its
reference. Nothing in the renderer changes: it probes the id already.

## What is in here

| file | what |
| --- | --- |
| `sheet-runes-<type>.png` | the player's stones: nine skins × Lv 1 / Lv 2 on a 6×3 grid (1536×768) |
| `sheet-runes-enemy-<type>.png` | the enemy's stones: four factions × Lv 1 / Lv 2 on a 4×2 grid (1024×512) |
| `sheet-glyphs.png` | the five glyph icons, no stone (three panels blank) |
| `sheet-tiles.png`, `sheet-frame.png` | the board — these FILL their panels edge to edge |
| `sheet-ui.png`, `sheet-fx.png` | HUD chips and effects |
| `sheet-laurels.png` | the Lv 2 wreath, one per RUNE — it hugs the stone's own foot, and the foot is the rune's |
| `walk-<id>.png` | the commander strips and the bolt, laid out 4×2 for a restyle |
| `bg-ridge-*.png` | the two horizon bands (4:1) |
| `singles/single-<id>.png` | one object per image — the sturdy route when a sheet keeps losing its grid (tick **singles** on the bench) |
| `*-key.png` | the same lattice with captions and target markers; never send it to a painter |
| `PROMPTS-*.md` | one ready-to-paste block per reference, fenced for the preview's copy button; generated |
| `sheet-index.json` | every rect and target, with each panel's measured `fit`; the slicer's contract |
| `painted/` | where returns go; `pnpm art:slice` reads it |

Every sheet is a standard aspect ratio (1:1, 2:1, 4:3, 16:9) because that is
what an image tool can be told to return. The lattice is the contract: panels
are exact multiples of 256 px from the origin, no gutters, no captions inside a
panel (text in a panel is text the model repaints as art).

## The blit contract

A stone's painting is drawn by the renderer into **exactly the box
`paintPebble(ctx, w, h)` paints in** — same rect, no offset, no scale knob.
The slicer makes that safe: it normalises every returned panel onto the drawn
content's measured box (`fit` in the index, solid pixels at alpha > 140), so a
stone the painter enlarged to fill its panel lands back at the drawn size. The
same holds for the glyph icons, the chips and the effects. Tiles and the frame
are the exception: they fill their rect by contract and are trimmed to their
own edges instead.

## Commands

```bash
pnpm art:prompts                # regenerate PROMPTS-*.md from the manifest (no browser)
pnpm art:prompts -- --check     # exit 1 if they are stale
pnpm art:export                 # press "Export all sheets" in a private headless Chrome
pnpm art:export -- --singles    # …with one file per object as well
pnpm art:slice                  # slice everything in painted/ (256 px per frame)
pnpm art:slice -- --dry         # print the plan, write nothing
pnpm art:slice -- --sheet tiles painted/odd-name.png
pnpm art:desk                   # the Art Desk: find, copy, paint (by hand or queue), file, slice, compress
pnpm compress-folder public/images --backup-dir public-backup --fresh --only public/images/runes/a.webp  # one fresh file
pnpm art:measure -- cells       # every sliced panel vs its recorded fit
pnpm art:measure -- strips public/images/monsters
```

The slicer encodes WebP through the Chrome that is already on the machine
(an isolated, headless profile of its own) — no native image dependency.
`sharp` is not installed and not needed.
