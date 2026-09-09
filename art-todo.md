# Art todo — drop-in manifest

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
(Mortar), `nuker` (Warhead). Skins: `river`, `obsidian`, `jade`, `amber`,
`marble`, `ember`. Factions: `skeleton`, `goblin`, `orc`, `undead`.

The last FOUR are the campaign's late unlocks and were added after the first
art pass, so **every one of their 84 files is still un-painted** (21 each: 12
player stones, 8 enemy stones, 1 glyph) — they are the
largest single gap in this manifest. Their glyphs, in the same words the
prompts use: the Axe is a broad crescent bit with drooping horns on a short
haft; the Boulder is a chipped round rock mid-roll with two cracks and speed
bars behind it; the Mortar is a squat tube canted up-right on a base plate with
its shell already in the air; and the Warhead is a three-bladed hazard trefoil,
a solid round core with three heavy wedges around it and a clear ring of empty
space between — the one rune drawn as a SIGN rather than a weapon, because it
is the one rune nobody aims.

| Path | Subject | Size | Stays live over it |
| --- | --- | --- | --- |
| `public/images/runes/<type>-<skin>-lv1.webp` | the player's stone: the rune's glyph cut into that skin's material and silhouette (54 files) | 256² | direction arrow, HP pips, glow pulse |
| `public/images/runes/<type>-<skin>-lv2.webp` | the same, level 2: a little larger and heavier, a gold rim, a small gold crest on the shoulder, a stronger glow — **no wreath** (54 files) | 256² | same; the wreath is `fx/laurel.webp` |
| `public/images/runes/<type>-e-<faction>-lv1.webp` | the enemy's stone in the faction's red-tinted rock, the faction's accent on the rim (36 files) | 256² | same |
| `public/images/runes/<type>-e-<faction>-lv2.webp` | level 2 of the above (36 files) | 256² | same |
| `public/images/runes/<type>.webp` | the glyph ALONE on transparency — the unlock card, the campaign map, the shop | 256² | the stone under it |

Every stone is a single square still, the stone centred and spanning roughly
80 % of the file. A skin decides the stone's **shape** (pebble / shard / oval /
hex / disc / slab) and how the glyph is **cut** (engraved / neon / inlay / gem /
carved / ember) — see `SKINS` in `src/game/rules.ts` for the exact colours.

**A level-2 stone carries NO wreath of its own.** It differs from level 1 by a
gold rim, a small gold crest on the shoulder and a stronger glow, and that is
all. The laurel is `images/fx/laurel.webp`, one file the renderer lays over
every upgraded stone — painted into a stone that already has one, it ends up
under a second.

Reference sheets: `sheet-runes-<type>.png` (six skins × two levels, 4×3) and
`sheet-runes-enemy-<type>.png` (four factions × two levels, 4×2), prompts in
`art-sheets/PROMPTS-RUNES.md`.

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
| `public/images/fx/laurel.webp` | the gold laurel wreath the game lays around a **level-2 stone** — two branches, open at the top, nothing inside it | 256² | ONE file for all 180 stones; drawn in the stone's own box, so it is blitted straight over the pebble |

Glows must stay tight to their shape: a halo over the key colour cannot be
removed. Reference sheet `sheet-fx.png`; prompts in `PROMPTS-BOARD.md`.

## HUD

| Path | Subject | Size | Notes |
| --- | --- | --- | --- |
| `public/images/ui/forge.webp` | the Rune Forge chip (anvil with a glowing rune) | 256² | drawn today; drain overlay and countdown drawn over it |
| `public/images/ui/reroll.webp` | the reroll chip (a blank pebble with two chasing arrows) | 256² | drawn today |
| `public/images/ui/chest.webp` | the reward chest | 256² | reused today (128²) |
| `public/images/ui/crown.webp` | the elite crown | 256² | reused today |
| `public/images/ui/coin.webp` | the wallet coin | 256² | reused today |
| `public/images/ui/ribbon.webp` | the result banner, nine-sliced by CSS at the outer 17 %, the middle a plain band | 597×256 | reused today; keep the middle EMPTY |
| `public/images/logo/logo_512x512.png` (+192) | **the Glyphyx logo** — the PWA/portal icons still carry the previous game's mark | 512² PNG | replace before any store listing |
| `public/favicon.ico` | derive from the new logo | 48² | — |

Reference sheet `sheet-ui.png`; prompts in `PROMPTS-BOARD.md`.

## Cast (bitmaps that already ship; a restyle is optional)

| Path | Subject | Size | Notes |
| --- | --- | --- | --- |
| `public/images/monsters/bonecap.webp` | Bone Dummies commander, 8-panel walk strip | 8 × 228×256 | animated on the HUD badge with `steps(8)` |
| `public/images/monsters/nibbler.webp` | Goblin Archers commander | 8 × 228×256 | — |
| `public/images/monsters/snaggletusk.webp` | Orc Berserkers commander | 8 × 228×256 | — |
| `public/images/monsters/marrowknight.webp` | Undead Mages commander | 8 × 228×256 | — |
| `public/images/heroes/teal.webp` | the player's commander run cycle | 8 × 192² | — |
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
