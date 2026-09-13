# Art todo — drop-in manifest

> **Status, 2026-09-14: there is nothing left to paint.** `art-sheets/PAINT-STATUS.md`
> reads 38 sliced · 0 need a repaint · 0 painted-unreceipted · 0 outstanding,
> `.env` has `VITE_ENABLE_ART_OVERRIDES=true`, and every one of the ten runes
> has its 26 files in `public/images/runes/` (18 player stones, 8 enemy stones)
> plus its glyph single. The "still un-painted" and "has to be repainted"
> passages below are the history of how the manifest got here — they were true
> when written and are kept for the reasoning, not as a queue. `PAINT-STATUS.md`
> is the live answer; this file is the contract for WHAT each path holds.

Glyphyx draws its whole board from code: the slate tiles, the stone frame, the
sandstone runes with their engraved glyphs, the reveal arrows, projectiles,
beams, shards and rings are Canvas 2D (`src/use/arenaPainters.ts`), baked to
sprites at runtime and blitted. Nothing below is required for the game to ship
— each entry is an *optional upgrade* that replaces a drawing with a painting,
with **no code change**: drop the file at the exact path and the renderer picks
it up on its next probe. A missing or still-decoding file always falls back to
the drawing.

**There is a pipeline for producing these** — reference sheets baked from the
drawings, generated prompts in the game's hand-drawn mythical-fantasy style, a
slicer that registers each return onto the drawing it replaces, and a
playground to check the result in motion. Start at `art-sheets/README.md`.
Everything in this file is the *contract* that pipeline honours; you can also
hand-paint any single file and drop it in.

The runtime catalogue is `src/game/artCatalogue.ts` (the id scheme lives
there); the probe is `spriteFor(kind, id)` in `src/game/art.ts`, which looks
for `public/images/<folder>/<id>.webp`. Staged loading is
`src/game/artPreload.ts`: the first screen's paintings wait behind the splash
(10 s cap), the first reveals' stones follow one at a time, everything else
arrives on an idle slot.

Format for everything: **WebP**, sRGB, premultiplied alpha, at most **256 px
per frame** (the slicer's rule; only the frame is bigger). The renderer fits by
fraction, never by fixed offsets. Style: **hand-drawn, stylized mythical
fantasy** — ink contour lines, painterly gouache washes with visible brush
texture, warm sandstone / ochre / umber / slate, the glyph glows and the violet
grid light as the only saturated notes. Transparent surround unless the row
says the file fills its rect.

**The flag.** `VITE_ENABLE_ART_OVERRIDES` is `true` in the dev `.env` (probes
run, misses are silent) and should stay `false` in every `.env.<platform>`
until the paintings are in, because a portal QA console reports every 404 as a
broken resource. `?art=on` / `?art=off` flips it per device without a rebuild;
`window.__art.refresh()` re-probes after dropping new files.

## The blit contract (why a painting needs no tuning knob)

A stone file is drawn into **exactly the box `paintPebble(ctx, w, h)` paints
in** — the whole file maps to the whole box. So a painting must sit where the
drawing sat: centred, spanning the same fraction of the box. The slicer does
this for you (it measures the drawn extent when the sheet is exported and
normalises the return onto it); a hand-painted file should copy the reference
sheet's placement. Tiles and the frame are the opposite: they fill their file
edge to edge.

## Runes (the ones that matter most)

Ids: `<type>` ∈ `melee` (Sword), `archer` (Bow), `mage` (Orb), `defense`
(Shield), `support` (Cross), `cleave` (Axe), `roller` (Boulder), `bombard`
(Mortar), `nuker` (Warhead), `crown` (Crown). Skins: `river`, `obsidian`,
`jade`, `amber`, `marble`, `ember`. Factions: `skeleton`, `goblin`, `orc`,
`undead`.

The last FIVE are the campaign's late unlocks and were added after the first
art pass. **They were the largest gap in this manifest — 105 files — and they
are painted now** (2026-09-13; the orb was the last rune to land, split across
four sheets). Their glyphs, in the same words the
prompts use: the Axe is a broad crescent bit with drooping horns on a short
haft; the Boulder is a chipped round rock mid-roll with two cracks and speed
bars behind it; the Mortar is a squat tube canted up-right on a base plate with
its shell already in the air; the Warhead is a three-bladed hazard trefoil,
a solid round core with three heavy wedges around it and a clear ring of empty
space between — the one rune drawn as a SIGN rather than a weapon, because it
is the one rune nobody aims; and the Crown is a three-peaked crown on a heavy
band, the middle peak tallest, with one diamond gem cut clean out of the band —
regalia rather than an implement, because it is the one rune that does not
break a stone but takes it.

**The silhouette moved from the SKIN to the RUNE, so every painted stone is
stale.** A rune says what it is twice — in its glyph and in its outline — and
until now only the glyph did any of that work: a skin owned the shape, so all
ten runes of a skin were one stone with ten different marks cut into it. Now
each rune type has an outline of its own (a shield is blocky and points DOWN, a
bow is a slim spindle, an axe is a bit with two horns; see `RUNE_PROFILES` in
`arenaPainters.ts`) and a skin decides only how that outline is finished —
carved and bordered, knapped, worn round, faceted, quarried, blunted into a
slab, step cut, domed, brilliant cut.

Three more skins arrived with it — **sapphire, ruby and diamond**, the gem tier
— so a stone sheet is nine skins × two levels on a 6×3 grid (1536×768) where it
was six on 4×3. Every `sheet-runes-*` painting was therefore a picture of a
different grid AND a different stone, and every one of them had to be repainted
from the re-exported reference — which is what the 2026-09-11 to -13 passes
did. All 20 stone sheets are sliced against their current references; the
orb's needed splitting into four (`STONE_SPLITS` in `artSheet.ts`) before it
would come back on the lattice.

**The Bow's painted stones were REMOVED and had to be repainted** — they were,
on 2026-09-11 (`sheet-runes-archer`, rev `bc1b3aa9e346`), and the 26 archer
files are back in `public/images/runes/`. The reasoning is kept because it is
the clearest case of why a re-cut drawing invalidates its painting. The bow was
re-cut (a crescent of even thickness instead of a filled belly — see
`glyphs.ts`), because the old drawing only read as a bow while a skin OUTLINED
its glyph: every skin that fills one — jade's inlay, marble's carved ink,
amber's lit interior, obsidian's neon — turned the belly into a solid sail, and
the painted returns copied that faithfully, so the same rune was a bow on two
materials and a blob on four.

So the twelve `public/images/runes/archer-*.webp` went (the renderer fell back
to the drawing, which is the corrected bow) until the repaint landed, and the
three paintings that
are pictures of the old drawing — the bow's player and enemy sheets, and the
glyph sheet, whose lattice was re-laid from 3 columns to 5 for the tenth rune —
are parked in `art-sheets/painted/stale/`, which the slicer does not read. The
note in that folder says what happened to each.

**Which sheets still need painting is now a generated file**: `pnpm art:prompts`
writes `art-sheets/PAINT-STATUS.md` — sliced / repaint / painted-but-unreceipted
/ outstanding, per sheet, with the prompt block to paste for each. And a
re-cut drawing can no longer be silently re-installed from an old painting: the
slicer records the revision of the reference it cut against and refuses a
painting whose reference has moved since (`--stale-ok` overrides).

| Path | Subject | Size | Stays live over it |
| --- | --- | --- | --- |
| `public/images/runes/<type>-<skin>-lv1.webp` | the player's stone: the rune's own silhouette, worked in that skin's material, its glyph cut in (90 files) | 256² | direction arrow, HP pips, glow pulse |
| `public/images/runes/<type>-<skin>-lv2.webp` | the same, level 2: a little larger and heavier, a gold rim, a small gold crest on the shoulder, a stronger glow — **no wreath** (90 files) | 256² | same; the wreath is `fx/laurel-<rune>.webp` |
| `public/images/runes/<type>-e-<faction>-lv1.webp` | the enemy's stone in the faction's red-tinted rock, the faction's accent on the rim (36 files) | 256² | same |
| `public/images/runes/<type>-e-<faction>-lv2.webp` | level 2 of the above (36 files) | 256² | same |
| `public/images/runes/<type>.webp` | the glyph ALONE on transparency — the unlock card, the campaign map, the shop | 256² | the stone under it |

Every stone is a single square still, the stone centred and spanning roughly
80 % of the file. The RUNE decides the stone's **silhouette** (`RUNE_PROFILES`
in `src/use/arenaPainters.ts`); a skin decides how that silhouette is
**finished** (carved / knapped / polished / faceted / quarried / slab / step /
cabochon / brilliant) and how the glyph is **cut** into it (engraved / neon /
inlay / gem / carved / ember / starcut / blood / prism) — see `SKINS` in
`src/game/rules.ts` for the exact colours.

**A level-2 stone carries NO wreath of its own.** It differs from level 1 by a
gold rim, a small gold crest on the shoulder and a stronger glow, and that is
all. The laurel is `images/fx/laurel-<rune>.webp` — ten files, one per RUNE,
the renderer lays the matching one over every upgraded stone. It is keyed by
the rune and not by the skin because the wreath hugs the stone's FOOT, and the
foot is the rune's: a bow tapers to a needle where a mortar stands on a flat
plate. Painted into a stone that already has one, it ends up under a second.

Reference sheets: `sheet-runes-<type>.png` (nine skins × two levels, 6×3) and
`sheet-runes-enemy-<type>.png` (four factions × two levels, 4×2), the wreaths on
`sheet-laurels.png` (5×2), prompts in `art-sheets/PROMPTS-RUNES.md` and
`PROMPTS-BOARD.md`.

## Board

| Path | Subject | Size | Notes |
| --- | --- | --- | --- |
| `public/images/tiles/neutral.webp` | one slate tile, bevelled, faint cracks, a faint violet edge light | 256² | **fills the file edge to edge**, square corners |
| `public/images/tiles/player.webp` | the same tile, its bevel lit teal-blue | 256² | fills the file |
| `public/images/tiles/enemy.webp` | the same tile, its bevel lit red-magenta | 256² | fills the file |
| `public/images/tiles/frame.webp` | the carved sandstone ring around the 4×4, **nine-sliced** at the outer 12 %, EMPTY in the middle | 1024² | reaches all four edges; the streak flames and the sudden-death pulse are drawn over it |

Reference sheets: `sheet-tiles.png`, `sheet-frame.png`; prompts in `PROMPTS-BOARD.md`.

## Effects

| Path | Subject | Size | Notes |
| --- | --- | --- | --- |
| `public/images/fx/ring-heal.webp` | the heal ring (gold) | 256² | reused today; a restyle is optional |
| `public/images/fx/ring-shock.webp` | the capture / clash shockwave ring | 256² | reused today |
| `public/images/fx/ring-heat.webp` | the level-2 orb's burst ring | 256² | reused today |
| `public/images/fx/shield.webp` | the dome over a shielded rune | 256² | reused today |
| `public/images/fx/guard.webp`, `crest-shield.webp`, `crest-guard.webp` | the absorb flash and the two crests | 256² / 128² | reused today |
| `public/images/fx/smoke.webp` | the tinted dust puff | 192² | reused today |
| `public/images/fx/scorch.webp` | the mark a shattered rune leaves on its tile | 261×144 | reused today |
| `public/images/fx/muzzle.webp` | the flash at an archer's release | 128² | reused today |
| `public/images/rounds/bolt.webp` | the archer's arrow: ONE arrow lying flat, flying RIGHT — ash shaft, iron head, emerald vanes, a short streak | 256×64 | a single still, NOT a strip: the renderer rotates it to the heading |
| `public/images/rounds/spark.webp` | the mage beam's travelling spark (additive) | 128² | drawn today |
| `public/images/fx/laurel-<rune>.webp` | the gold laurel wreath the game lays around a **level-2 stone** — two branches, open at the top, nothing inside it (10 files, one per rune) | 256² | ONE file for all nine skins of a rune; it hugs the rune's own foot, and it is drawn in the stone's own box, so it is blitted straight over the pebble |

Glows must stay tight to their shape: a halo over the key colour cannot be
removed. Reference sheet `sheet-fx.png`; prompts in `PROMPTS-BOARD.md`.

## HUD

| Path | Subject | Size | Notes |
| --- | --- | --- | --- |
| `public/images/ui/forge.webp` | the Rune Forge chip (anvil with a glowing rune) | 256² | drawn today; drain overlay and countdown drawn over it |
| `public/images/ui/reroll.webp` | the reroll chip (a blank pebble with two chasing arrows) | 256² | drawn today |
| `public/images/ui/chest.webp` | the reward chest | 256² | reused today (128²) |
| `public/images/ui/elite.webp` | the elite mark (a small gold crown badge) | 256² | reused today; renamed from `crown.webp` when the CROWN RUNE arrived — a cell id is a filename stem, and two `crown`s would have collided |
| `public/images/ui/coin.webp` | the wallet coin | 256² | reused today |
| `public/images/ui/ribbon.webp` | the result banner, nine-sliced by CSS at the outer 17 %, the middle a plain band | 597×256 | reused today; keep the middle EMPTY |
| `public/images/logo/logo_512x512.png` (+192, +256 webp) | the Glyphyx mark — a carved stone slab with the name in hot runic letters. **Done**: copied from `src/assets/promotion/logo/`, which is where the press kit lives | 512² PNG | — |
| `public/images/logo/wordmark.webp` (+png) | the same mark trimmed to the slab's own alpha bounds, for the LOADING SCREEN. The press-kit files are square canvases with 60 % transparent air, which sized by width would push the splash card apart | 640 × 232 | the loading percentage under it |
| `public/favicon.ico` | **Done**: the new mark | 48² | — |

Reference sheet `sheet-ui.png`; prompts in `PROMPTS-BOARD.md`.

## Cast (bitmaps that already ship; a restyle is optional)

| Path | Subject | Size | Notes |
| --- | --- | --- | --- |
| `public/images/monsters/bonecap.webp` | Bone Dummies commander, 8-panel walk strip | 8 × 228×256 | animated on the HUD badge with `steps(8)` |
| `public/images/monsters/nibbler.webp` | Goblin Archers commander | 8 × 228×256 | — |
| `public/images/monsters/snaggletusk.webp` | Orc Berserkers commander | 8 × 228×256 | — |
| `public/images/monsters/marrowknight.webp` | Undead Mages commander | 8 × 228×256 | — |
| `public/images/heroes/teal.webp` | the player's commander run cycle | 8 × 192² | — |
| `public/images/heroes/keeper.webp` | **the Keeper** — the hooded figure holding a rune up on the loading screen, and the game's mascot. The file here is the splash's own inline SVG *baked*, so the pipeline has something to hand a painter; the splash keeps drawing its own, because it paints in the first frame before any request could return. A painting of him is for the campaign map, the result screen and the store tiles — and the splash can adopt it later behind a fade. Prompt: `PROMPTS-BOARD.md`, "The Keeper" | 256² | nothing — he is one picture |
| `public/images/bg/sky.webp` | the night sky the whole arena stands in: indigo to near-black, a moon high on the RIGHT, an aurora over the upper left, stars, a violet haze along the bottom | 1024×576 | **fills the file, no magenta** — it IS the background. Drawn at the screen's WIDTH from the top, so keep the interest in the top third and the middle quiet: the board covers it |
| `public/images/bg/ridge-far.webp` | the far ridge: hazy blue peaks with three tall stone pinnacles, moonlight on the top edge | 1024×256 | base on the bottom edge, magenta above |
| `public/images/bg/ridge-near.webp` | the near ridge: broken black rock carrying five standing rune monoliths, two lit with a violet glyph | 1024×256 | base on the bottom edge, magenta above |

Reference sheets `walk-<id>.png` (the strip laid out 4×2) and `bg-<id>.png`;
prompts in `PROMPTS-CAST.md`. The slicer composes a 4×2 return back into the
8-panel strip the game reads.

**The three backdrop layers are painted, and they stack.** The sky goes behind
everything; the far band sits over it at 30 % of the height, the near band at
45 %, and each one's rock is continued to the bottom of the screen in its own
base colour. So a band must be rock along its bottom edge and NOTHING above its
skyline — no sky, no moon, no stars — because the sky it would cover is a
painting of its own. Their references are drawn by the game
(`arenaPainters.paintSky` / `paintRidge`); the graveyard silhouettes that used
to ship here belonged to the game that lived in this repo before Glyphyx.

## Deliberately NOT bitmaps

* **Direction arrows, HP pips, the glow pulse, the timer ring, the tile
  counters, the ghost hand, the lock ring** — drawn over the stones every
  frame from the rune's own state; a painting would freeze them.
* **Reveal trajectories, beams, slash arcs, damage numbers** — animated from
  the resolution timeline and the layout; they scale with the board.
* **Particles** — shards, sparks and dust are a few pixels each, tinted per
  emitter and drawn from the pool; only the smoke puff and the spark are
  bitmaps.

## Promo art still needed for store listings

| Path | Size | Notes |
| --- | --- | --- |
| `src/assets/promotion/cover_1080x1920.webp` | 1080×1920 | Portrait key art: a Lv 2 sword mid-swing, an orb beam cutting the diagonal, shards flying. |
| `src/assets/promotion/cover_1920x1080.webp` | 1920×1080 | Landscape variant of the same moment. |
| `src/assets/promotion/cover_628x628.png` | 628² | Poki thumbnail: 1:1, full-bleed, **no text**. |
| `src/assets/promotion/cover_800x800.webp` | 800² | Square icon-ish crop — one glowing stone on slate. |
