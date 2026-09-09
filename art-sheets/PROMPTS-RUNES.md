# Rune prompts — the stones and the glyph icons

Generated from `src/game/artSheet.ts` — do not hand-edit; run `pnpm art:prompts` (or export from `/#/art-sheets`) instead.

One sheet per generation. Attach `art-sheets/<sheet>.png` (the CLEAN sheet, not the
`-key` one) and paste the block below it. Every panel is named, because a whole-sheet
pass that infers subjects from pixels turns a bow into a harp.

Drop the return in `art-sheets/painted/` under the same name, then `pnpm art:slice`.

Every prompt below is one fenced block. Open this file in a markdown preview and
use the block's copy button — one click takes the whole prompt to the clipboard,
ready to paste at the image model. The heading above a block says which file to
attach with it and where the return lands; it is NOT part of the prompt.

## Sword stones — the player's six skins  (sheet-runes-melee.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 768 pixels — landscape, 4:3 — holding 12 SEPARATE
panels laid out 4 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 12 panels. Not 1, not 10, not 24. Exactly 3 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The player's Sword rune, cut into each of the six stone skins the shop sells, at level 1 and level 2. The glyph is a straight sword point-up: tapered blade, cross-guard, grip, round pommel, in crimson; it is the SAME glyph in every panel — the same rune carved into six different materials.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Sword rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own crimson (#ff3b4a).
2. (row 1, column 2) River, Lv 2: the Sword rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own crimson (#ff3b4a).
3. (row 1, column 3) Obsidian, Lv 1: the Sword rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Sword rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 2, column 1) Jade, Lv 1: the Sword rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 2, column 2) Jade, Lv 2: the Sword rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 3) Amber, Lv 1: the Sword rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 4) Amber, Lv 2: the Sword rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 3, column 1) Marble, Lv 1: the Sword rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own crimson (#ff3b4a).
10. (row 3, column 2) Marble, Lv 2: the Sword rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own crimson (#ff3b4a).
11. (row 3, column 3) Ember, Lv 1: the Sword rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 3, column 4) Ember, Lv 2: the Sword rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 12 panels carry the SAME glyph — a straight sword point-up: tapered blade, cross-guard, grip, round pommel —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 78% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape). If your
tool has an aspect-ratio control, set it to 4:3 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Bow stones — the player's six skins  (sheet-runes-archer.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 768 pixels — landscape, 4:3 — holding 12 SEPARATE
panels laid out 4 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 12 panels. Not 1, not 10, not 24. Exactly 3 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The player's Bow rune, cut into each of the six stone skins the shop sells, at level 1 and level 2. The glyph is a bow with the string drawn and an arrow nocked, flying to the right, in emerald; it is the SAME glyph in every panel — the same rune carved into six different materials.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Bow rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own emerald (#35e07a).
2. (row 1, column 2) River, Lv 2: the Bow rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own emerald (#35e07a).
3. (row 1, column 3) Obsidian, Lv 1: the Bow rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Bow rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 2, column 1) Jade, Lv 1: the Bow rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 2, column 2) Jade, Lv 2: the Bow rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 3) Amber, Lv 1: the Bow rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 4) Amber, Lv 2: the Bow rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 3, column 1) Marble, Lv 1: the Bow rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own emerald (#35e07a).
10. (row 3, column 2) Marble, Lv 2: the Bow rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own emerald (#35e07a).
11. (row 3, column 3) Ember, Lv 1: the Bow rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 3, column 4) Ember, Lv 2: the Bow rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 12 panels carry the SAME glyph — a bow with the string drawn and an arrow nocked, flying to the right —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 78% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape). If your
tool has an aspect-ratio control, set it to 4:3 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Orb stones — the player's six skins  (sheet-runes-mage.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 768 pixels — landscape, 4:3 — holding 12 SEPARATE
panels laid out 4 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 12 panels. Not 1, not 10, not 24. Exactly 3 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The player's Orb rune, cut into each of the six stone skins the shop sells, at level 1 and level 2. The glyph is an arcane orb: a solid core inside a ring, four diagonal sparks, in amethyst violet; it is the SAME glyph in every panel — the same rune carved into six different materials.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Orb rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own amethyst violet (#b57bff).
2. (row 1, column 2) River, Lv 2: the Orb rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own amethyst violet (#b57bff).
3. (row 1, column 3) Obsidian, Lv 1: the Orb rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Orb rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 2, column 1) Jade, Lv 1: the Orb rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 2, column 2) Jade, Lv 2: the Orb rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 3) Amber, Lv 1: the Orb rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 4) Amber, Lv 2: the Orb rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 3, column 1) Marble, Lv 1: the Orb rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own amethyst violet (#b57bff).
10. (row 3, column 2) Marble, Lv 2: the Orb rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own amethyst violet (#b57bff).
11. (row 3, column 3) Ember, Lv 1: the Orb rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 3, column 4) Ember, Lv 2: the Orb rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 12 panels carry the SAME glyph — an arcane orb: a solid core inside a ring, four diagonal sparks —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 78% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape). If your
tool has an aspect-ratio control, set it to 4:3 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Shield stones — the player's six skins  (sheet-runes-defense.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 768 pixels — landscape, 4:3 — holding 12 SEPARATE
panels laid out 4 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 12 panels. Not 1, not 10, not 24. Exactly 3 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The player's Shield rune, cut into each of the six stone skins the shop sells, at level 1 and level 2. The glyph is a heater shield with a cross cut out of its face, in sapphire blue; it is the SAME glyph in every panel — the same rune carved into six different materials.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Shield rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own sapphire blue (#4aa8ff).
2. (row 1, column 2) River, Lv 2: the Shield rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own sapphire blue (#4aa8ff).
3. (row 1, column 3) Obsidian, Lv 1: the Shield rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Shield rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 2, column 1) Jade, Lv 1: the Shield rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 2, column 2) Jade, Lv 2: the Shield rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 3) Amber, Lv 1: the Shield rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 4) Amber, Lv 2: the Shield rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 3, column 1) Marble, Lv 1: the Shield rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own sapphire blue (#4aa8ff).
10. (row 3, column 2) Marble, Lv 2: the Shield rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own sapphire blue (#4aa8ff).
11. (row 3, column 3) Ember, Lv 1: the Shield rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 3, column 4) Ember, Lv 2: the Shield rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 12 panels carry the SAME glyph — a heater shield with a cross cut out of its face —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 78% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape). If your
tool has an aspect-ratio control, set it to 4:3 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Cross stones — the player's six skins  (sheet-runes-support.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 768 pixels — landscape, 4:3 — holding 12 SEPARATE
panels laid out 4 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 12 panels. Not 1, not 10, not 24. Exactly 3 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The player's Cross rune, cut into each of the six stone skins the shop sells, at level 1 and level 2. The glyph is a radiant cross, four flared arms and a small burst at the centre, in topaz gold; it is the SAME glyph in every panel — the same rune carved into six different materials.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Cross rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own topaz gold (#ffd23f).
2. (row 1, column 2) River, Lv 2: the Cross rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own topaz gold (#ffd23f).
3. (row 1, column 3) Obsidian, Lv 1: the Cross rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Cross rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 2, column 1) Jade, Lv 1: the Cross rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 2, column 2) Jade, Lv 2: the Cross rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 3) Amber, Lv 1: the Cross rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 4) Amber, Lv 2: the Cross rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 3, column 1) Marble, Lv 1: the Cross rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own topaz gold (#ffd23f).
10. (row 3, column 2) Marble, Lv 2: the Cross rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own topaz gold (#ffd23f).
11. (row 3, column 3) Ember, Lv 1: the Cross rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 3, column 4) Ember, Lv 2: the Cross rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 12 panels carry the SAME glyph — a radiant cross, four flared arms and a small burst at the centre —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 78% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 3 down, 12 in all.
· The canvas is landscape, 4:3.
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 768 pixels (4:3, landscape). If your
tool has an aspect-ratio control, set it to 4:3 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Sword stones — the four enemy factions  (sheet-runes-enemy-melee.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The enemy's Sword rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance; the glyph is a straight sword point-up: tapered blade, cross-guard, grip, round pommel, in crimson, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Sword rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Sword rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Sword rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Sword rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Sword rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Sword rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Sword rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Sword rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 8 panels carry the SAME glyph — a straight sword point-up: tapered blade, cross-guard, grip, round pommel —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 77% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Bow stones — the four enemy factions  (sheet-runes-enemy-archer.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The enemy's Bow rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance; the glyph is a bow with the string drawn and an arrow nocked, flying to the right, in emerald, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Bow rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Bow rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Bow rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Bow rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Bow rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Bow rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Bow rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Bow rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 8 panels carry the SAME glyph — a bow with the string drawn and an arrow nocked, flying to the right —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 76% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Orb stones — the four enemy factions  (sheet-runes-enemy-mage.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The enemy's Orb rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance; the glyph is an arcane orb: a solid core inside a ring, four diagonal sparks, in amethyst violet, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Orb rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Orb rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Orb rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Orb rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Orb rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Orb rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Orb rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Orb rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 8 panels carry the SAME glyph — an arcane orb: a solid core inside a ring, four diagonal sparks —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 76% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Shield stones — the four enemy factions  (sheet-runes-enemy-defense.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The enemy's Shield rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance; the glyph is a heater shield with a cross cut out of its face, in sapphire blue, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Shield rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Shield rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Shield rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Shield rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Shield rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Shield rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Shield rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Shield rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 8 panels carry the SAME glyph — a heater shield with a cross cut out of its face —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 74% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Cross stones — the four enemy factions  (sheet-runes-enemy-support.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single rune stone filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE rune stone and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The enemy's Cross rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance; the glyph is a radiant cross, four flared arms and a small burst at the centre, in topaz gold, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Cross rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Cross rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Cross rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Cross rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Cross rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Cross rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Cross rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Cross rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE GLYPH.
All 8 panels carry the SAME glyph — a radiant cross, four flared arms and a small burst at the centre —
identical in shape, proportion and orientation in every panel. It is one
rune cut into different stones, not a set of similar runes. Only the STONE
changes between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 78% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Glyph icons — the five runes, no stone  (sheet-glyphs.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A GLYPH ICON.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 8 panels. Not 1, not 6, not 16. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single glyph icon filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE glyph icon and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The five rune glyphs on their own, as UI icons: the unlock card, the campaign map and the shop show a rune without its stone. Bold, flat, one strong silhouette each, readable at 24 px. Three panels are blank on purpose.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Sword, glyph icon: the Sword glyph ALONE, no stone: a straight sword point-up: tapered blade, cross-guard, grip, round pommel, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight crimson (about #ff3b4a, kept muted and paper-toned, never neon) glow
2. (row 1, column 2) Bow, glyph icon: the Bow glyph ALONE, no stone: a bow with the string drawn and an arrow nocked, flying to the right, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight emerald (about #35e07a, kept muted and paper-toned, never neon) glow
3. (row 1, column 3) Orb, glyph icon: the Orb glyph ALONE, no stone: an arcane orb: a solid core inside a ring, four diagonal sparks, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight amethyst violet (about #b57bff, kept muted and paper-toned, never neon) glow
4. (row 1, column 4) Shield, glyph icon: the Shield glyph ALONE, no stone: a heater shield with a cross cut out of its face, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon) glow
5. (row 2, column 1) Cross, glyph icon: the Cross glyph ALONE, no stone: a radiant cross, four flared arms and a small burst at the centre, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight topaz gold (about #ffd23f, kept muted and paper-toned, never neon) glow
6. (row 2, column 2) BLANK — leave it flat magenta.
7. (row 2, column 3) BLANK — leave it flat magenta.
8. (row 2, column 4) BLANK — leave it flat magenta.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE HAND.
Every glyph icon on this sheet is painted by the same hand at the same
scale of detail, in the same light, so they read as one set.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game piece. Match this in every panel:
· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line
  weight varying like a real pen, a little uneven. The drawing should look
  DRAWN, with the linework still showing through the paint.
· PAINTERLY WASHES inside the lines — gouache and watercolour with visible
  brush texture, softly mottled, a gentle sense of volume from ONE light
  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.
· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads
  at thumbnail size; small detail is suggested with a few confident marks.
· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly
  desaturated — with the arcane accents (the glyph glows, the violet grid
  light) as the ONLY saturated notes. Rich, not candy-bright.
· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in
  the grooves. Charming craft rather than slick rendering.

AVOID — this is exactly how earlier attempts went wrong:
· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic
  edges, no smooth 3D-rendered shading, no lens flares.
· NO photorealism and no vector-flat icon look either — it is a painting.
· NO heavy uniform black outlines, no hard cel-shaded banding.
· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.
· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,
  it is wrong; if the GLOW looks vivid, that part is right.
· NO frames, borders, cards, vignettes, matting or paper background behind
  the drawing. Nothing but flat magenta behind it, right up to its outline.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/2 of the height.
The glyph icon is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest glyph icon spans about 82% of its panel's width
and never touches the edges. If yours reaches the panel edge it is too big;
if it is under half the panel it is too small. Bigger is not clearer here.

WHERE it sits is not a composition choice: the exact centre of a panel is
where the game places it. Do not re-centre it on its own outline, do not
tidy the arrangement, do not even out the spacing.
Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included.

BACKGROUND — read this before anything else. It matters more than the style.
Fill every pixel that is not the object itself with solid, flat, pure magenta
#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.
· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty
  pink, not mauve, not a soft or tinted version of it. Only the true colour
  can be cut away cleanly; a near miss has to be flood-filled instead, and a
  flood fill eats any pale paint it can reach.
· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD
  and then baked into the artwork as though the squares were paint.
· NOT white, cream, parchment, paper, or any tinted or textured ground.
· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle
  of any kind. The magenta must touch the outline of the object on every side.
· No drop shadow onto the background, and no vignette.
· The object itself must contain no magenta or hot pink.
· The muted, earthy palette above is for the OBJECT. The ground is not part
  of the painting and is not toned down with it: it stays a vivid,
  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink
  and mauve are the failure this whole clause is about.
· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is
  measured as part of the object when the return is fitted back onto the
  reference — a wide aura comes back as a tiny stone inside a huge smear —
  and it cannot be keyed: soft light over magenta turns pink, not
  transparent. A glow belongs inside the shape's own outline, or within a
  hair of it.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all, 3 of them blank.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No glyph icon is anywhere near filling its panel, and none touches an edge.
· Every panel holds one glyph icon, at the size the reference has it, centred.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```
