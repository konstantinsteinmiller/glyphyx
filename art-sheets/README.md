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
6. **Ship it** by setting `VITE_ENABLE_ART_OVERRIDES=true` in a build's env.
   Until then `?art=on` tries it on one device and `?art=off` turns it back
   off with no rebuild — see `src/game/art.ts`.

**When a return is bad, fix the prompt, not the file.** Prompts are generated
from `src/game/artSheet.ts`; a hand-edited `PROMPTS-*.md` is overwritten on
the next export. Change the blurb, the colour line or the style block there,
run `pnpm art:prompts`, paint again.

## Adding a drawable

One line in `src/game/artSheet.ts` (a cell in a sheet, or a new sheet) plus its
id in `src/game/artCatalogue.ts` — the parity test in
`tests/game/artSheet.test.ts` fails until both agree. `pnpm art:prompts` then
writes its prompt with no browser involved, and the next export bakes its
reference. Nothing in the renderer changes: it probes the id already.

## What is in here

| file | what |
| --- | --- |
| `sheet-runes-<type>.png` | the player's stones: six skins × Lv 1 / Lv 2 on a 4×3 grid (1024×768) |
| `sheet-runes-enemy-<type>.png` | the enemy's stones: four factions × Lv 1 / Lv 2 on a 4×2 grid (1024×512) |
| `sheet-glyphs.png` | the five glyph icons, no stone (three panels blank) |
| `sheet-tiles.png`, `sheet-frame.png` | the board — these FILL their panels edge to edge |
| `sheet-ui.png`, `sheet-fx.png` | HUD chips and effects |
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
pnpm art:measure -- cells       # every sliced panel vs its recorded fit
pnpm art:measure -- strips public/images/monsters
```

The slicer encodes WebP through the Chrome that is already on the machine
(an isolated, headless profile of its own) — no native image dependency.
`sharp` is not installed and not needed.
