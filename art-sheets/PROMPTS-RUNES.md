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

## Sword stones — the player's 9 skins  (sheet-runes-melee.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Sword rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a BLADE-TIP plaque: a sharp point at the top, shoulders sweeping down into a full belly and a round base — the tallest and pointiest stone of the set. That silhouette is how a player tells a Sword from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a straight sword point-up: tapered blade, cross-guard, grip, round pommel, in crimson; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Sword rune as a River stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own crimson (#ff3b4a).
2. (row 1, column 2) River, Lv 2: the Sword rune as a River stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own crimson (#ff3b4a).
3. (row 1, column 3) Obsidian, Lv 1: the Sword rune as a Obsidian stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Sword rune as a Obsidian stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Sword rune as a Jade stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Sword rune as a Jade stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Sword rune as a Amber stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Sword rune as a Amber stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Sword rune as a Marble stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own crimson (#ff3b4a).
10. (row 2, column 4) Marble, Lv 2: the Sword rune as a Marble stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own crimson (#ff3b4a).
11. (row 2, column 5) Ember, Lv 1: the Sword rune as a Ember stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Sword rune as a Ember stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Sword rune as a Sapphire stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Sword rune as a Sapphire stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Sword rune as a Ruby stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Sword rune as a Ruby stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Sword rune as a Diamond stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Sword rune as a Diamond stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a BLADE-TIP plaque: a sharp point at the top, shoulders sweeping down into a full belly and a round base — the tallest and pointiest stone of the set —
and carry the SAME glyph —
a straight sword point-up: tapered blade, cross-guard, grip, round pommel —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 73% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Bow stones — the player's 9 skins  (sheet-runes-archer.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Bow rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a SLENDER SPINDLE: narrow and tall, drawn out to a long taper at the top AND at the foot, its belly barely two thirds as wide as the stone is tall — the thinnest stone of the set. That silhouette is how a player tells a Bow from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a recurve bow seen side-on with one arrow nocked and flying to the right: the limb is a crescent of EVEN thickness bulging right, never a filled belly, its two tips joined by a straight vertical string, and the arrow lies across the whole width — a diamond flight at the left, a broad triangular head at the right, standing clear of the limb, in emerald; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Bow rune as a River stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own emerald (#35e07a).
2. (row 1, column 2) River, Lv 2: the Bow rune as a River stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own emerald (#35e07a).
3. (row 1, column 3) Obsidian, Lv 1: the Bow rune as a Obsidian stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Bow rune as a Obsidian stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Bow rune as a Jade stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Bow rune as a Jade stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Bow rune as a Amber stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Bow rune as a Amber stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Bow rune as a Marble stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own emerald (#35e07a).
10. (row 2, column 4) Marble, Lv 2: the Bow rune as a Marble stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own emerald (#35e07a).
11. (row 2, column 5) Ember, Lv 1: the Bow rune as a Ember stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Bow rune as a Ember stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Bow rune as a Sapphire stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Bow rune as a Sapphire stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Bow rune as a Ruby stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Bow rune as a Ruby stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Bow rune as a Diamond stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Bow rune as a Diamond stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a SLENDER SPINDLE: narrow and tall, drawn out to a long taper at the top AND at the foot, its belly barely two thirds as wide as the stone is tall — the thinnest stone of the set —
and carry the SAME glyph —
a recurve bow seen side-on with one arrow nocked and flying to the right: the limb is a crescent of EVEN thickness bulging right, never a filled belly, its two tips joined by a straight vertical string, and the arrow lies across the whole width — a diamond flight at the left, a broad triangular head at the right, standing clear of the limb —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 65% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Orb stones — the player's 9 skins  (sheet-runes-mage.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Orb rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a SMOOTH UPRIGHT EGG: one unbroken oval, taller than it is wide, with no point and no corner anywhere on it. That silhouette is how a player tells a Orb from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is an arcane orb in THREE parts, all three required: (1) a RING, an open circle of even thickness; (2) a SOLID ROUND CORE floating at its centre, filled in, not an outline, about a third of the ring across, with a clear gap of stone between core and ring; (3) FOUR SMALL SPARKS, one at each diagonal — upper-left, upper-right, lower-left, lower-right — sitting just OUTSIDE the ring. A ring on its own, a ring with a stem or tail, a ring with the middle left empty, or a ring with fewer than four sparks is the WRONG glyph and reads as a different rune, in amethyst violet; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Orb rune as a River stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own amethyst violet (#b57bff).
2. (row 1, column 2) River, Lv 2: the Orb rune as a River stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own amethyst violet (#b57bff).
3. (row 1, column 3) Obsidian, Lv 1: the Orb rune as a Obsidian stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Orb rune as a Obsidian stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Orb rune as a Jade stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Orb rune as a Jade stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Orb rune as a Amber stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Orb rune as a Amber stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Orb rune as a Marble stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own amethyst violet (#b57bff).
10. (row 2, column 4) Marble, Lv 2: the Orb rune as a Marble stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own amethyst violet (#b57bff).
11. (row 2, column 5) Ember, Lv 1: the Orb rune as a Ember stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Orb rune as a Ember stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Orb rune as a Sapphire stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Orb rune as a Sapphire stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Orb rune as a Ruby stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Orb rune as a Ruby stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Orb rune as a Diamond stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Orb rune as a Diamond stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a SMOOTH UPRIGHT EGG: one unbroken oval, taller than it is wide, with no point and no corner anywhere on it —
and carry the SAME glyph —
an arcane orb in THREE parts, all three required: (1) a RING, an open circle of even thickness; (2) a SOLID ROUND CORE floating at its centre, filled in, not an outline, about a third of the ring across, with a clear gap of stone between core and ring; (3) FOUR SMALL SPARKS, one at each diagonal — upper-left, upper-right, lower-left, lower-right — sitting just OUTSIDE the ring. A ring on its own, a ring with a stem or tail, a ring with the middle left empty, or a ring with fewer than four sparks is the WRONG glyph and reads as a different rune —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 73% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Shield stones — the player's 9 skins  (sheet-runes-defense.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Shield rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a BLOCKY SHIELD tablet: a FLAT top with square shoulders and straight vertical sides, drawn down to a blunt point at the FOOT — a heater shield lying on its face, and the only stone of the set whose point is at the bottom. That silhouette is how a player tells a Shield from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a heater shield with a cross cut out of its face, in sapphire blue; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Shield rune as a River stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own sapphire blue (#4aa8ff).
2. (row 1, column 2) River, Lv 2: the Shield rune as a River stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own sapphire blue (#4aa8ff).
3. (row 1, column 3) Obsidian, Lv 1: the Shield rune as a Obsidian stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Shield rune as a Obsidian stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Shield rune as a Jade stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Shield rune as a Jade stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Shield rune as a Amber stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Shield rune as a Amber stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Shield rune as a Marble stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own sapphire blue (#4aa8ff).
10. (row 2, column 4) Marble, Lv 2: the Shield rune as a Marble stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own sapphire blue (#4aa8ff).
11. (row 2, column 5) Ember, Lv 1: the Shield rune as a Ember stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Shield rune as a Ember stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Shield rune as a Sapphire stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Shield rune as a Sapphire stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Shield rune as a Ruby stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Shield rune as a Ruby stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Shield rune as a Diamond stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Shield rune as a Diamond stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a BLOCKY SHIELD tablet: a FLAT top with square shoulders and straight vertical sides, drawn down to a blunt point at the FOOT — a heater shield lying on its face, and the only stone of the set whose point is at the bottom —
and carry the SAME glyph —
a heater shield with a cross cut out of its face —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Cross stones — the player's 9 skins  (sheet-runes-support.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Cross rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a FOUR-LOBED medallion: four shallow rounded arms, one up, one down and one to each side, with a soft notch between them — the stone is already a cross before any glyph is cut into it. That silhouette is how a player tells a Cross from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a radiant cross, four flared arms and a small burst at the centre, in topaz gold; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Cross rune as a River stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own topaz gold (#ffd23f).
2. (row 1, column 2) River, Lv 2: the Cross rune as a River stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own topaz gold (#ffd23f).
3. (row 1, column 3) Obsidian, Lv 1: the Cross rune as a Obsidian stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Cross rune as a Obsidian stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Cross rune as a Jade stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Cross rune as a Jade stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Cross rune as a Amber stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Cross rune as a Amber stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Cross rune as a Marble stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own topaz gold (#ffd23f).
10. (row 2, column 4) Marble, Lv 2: the Cross rune as a Marble stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own topaz gold (#ffd23f).
11. (row 2, column 5) Ember, Lv 1: the Cross rune as a Ember stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Cross rune as a Ember stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Cross rune as a Sapphire stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Cross rune as a Sapphire stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Cross rune as a Ruby stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Cross rune as a Ruby stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Cross rune as a Diamond stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Cross rune as a Diamond stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a FOUR-LOBED medallion: four shallow rounded arms, one up, one down and one to each side, with a soft notch between them — the stone is already a cross before any glyph is cut into it —
and carry the SAME glyph —
a radiant cross, four flared arms and a small burst at the centre —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Axe stones — the player's 9 skins  (sheet-runes-cleave.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Axe rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: an AXE BIT: narrow across the top, flaring out and down into a broad crescent whose two HORNS are the lowest points on the stone, the cutting edge sweeping back UP between them — an axe head seen face on. That silhouette is how a player tells a Axe from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a broad axe, bit upward: a wide crescent blade with drooping horns on a short haft with a round pommel, in burnt orange; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Axe rune as a River stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own burnt orange (#ff8a2b).
2. (row 1, column 2) River, Lv 2: the Axe rune as a River stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own burnt orange (#ff8a2b).
3. (row 1, column 3) Obsidian, Lv 1: the Axe rune as a Obsidian stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Axe rune as a Obsidian stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Axe rune as a Jade stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Axe rune as a Jade stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Axe rune as a Amber stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Axe rune as a Amber stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Axe rune as a Marble stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own burnt orange (#ff8a2b).
10. (row 2, column 4) Marble, Lv 2: the Axe rune as a Marble stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own burnt orange (#ff8a2b).
11. (row 2, column 5) Ember, Lv 1: the Axe rune as a Ember stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Axe rune as a Ember stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Axe rune as a Sapphire stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Axe rune as a Sapphire stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Axe rune as a Ruby stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Axe rune as a Ruby stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Axe rune as a Diamond stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Axe rune as a Diamond stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — an AXE BIT: narrow across the top, flaring out and down into a broad crescent whose two HORNS are the lowest points on the stone, the cutting edge sweeping back UP between them — an axe head seen face on —
and carry the SAME glyph —
a broad axe, bit upward: a wide crescent blade with drooping horns on a short haft with a round pommel —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Boulder stones — the player's 9 skins  (sheet-runes-roller.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Boulder rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a SQUAT BOULDER: wider than it is tall, heavy and round, with one long flat plane knocked off each side. That silhouette is how a player tells a Boulder from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a chipped round boulder mid-roll, two cracks knocked out of it and two short speed bars trailing behind it, in cold teal; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Boulder rune as a River stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own cold teal (#00d4c8).
2. (row 1, column 2) River, Lv 2: the Boulder rune as a River stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own cold teal (#00d4c8).
3. (row 1, column 3) Obsidian, Lv 1: the Boulder rune as a Obsidian stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Boulder rune as a Obsidian stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Boulder rune as a Jade stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Boulder rune as a Jade stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Boulder rune as a Amber stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Boulder rune as a Amber stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Boulder rune as a Marble stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own cold teal (#00d4c8).
10. (row 2, column 4) Marble, Lv 2: the Boulder rune as a Marble stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own cold teal (#00d4c8).
11. (row 2, column 5) Ember, Lv 1: the Boulder rune as a Ember stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Boulder rune as a Ember stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Boulder rune as a Sapphire stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Boulder rune as a Sapphire stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Boulder rune as a Ruby stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Boulder rune as a Ruby stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Boulder rune as a Diamond stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Boulder rune as a Diamond stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a SQUAT BOULDER: wider than it is tall, heavy and round, with one long flat plane knocked off each side —
and carry the SAME glyph —
a chipped round boulder mid-roll, two cracks knocked out of it and two short speed bars trailing behind it —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Mortar stones — the player's 9 skins  (sheet-runes-bombard.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Mortar rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a MORTAR on its base plate: narrow and flat across the top, flaring the whole way down to a broad heavy plate with SQUARE bottom corners and a dead-flat foot — bottom-heavy, like something meant to stay put. That silhouette is how a player tells a Mortar from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a squat mortar canted up to the right on a heavy base plate, its bore open, one shell already in the air above the muzzle, in hot magenta; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Mortar rune as a River stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own hot magenta (#ff4fd8).
2. (row 1, column 2) River, Lv 2: the Mortar rune as a River stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own hot magenta (#ff4fd8).
3. (row 1, column 3) Obsidian, Lv 1: the Mortar rune as a Obsidian stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Mortar rune as a Obsidian stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Mortar rune as a Jade stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Mortar rune as a Jade stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Mortar rune as a Amber stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Mortar rune as a Amber stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Mortar rune as a Marble stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own hot magenta (#ff4fd8).
10. (row 2, column 4) Marble, Lv 2: the Mortar rune as a Marble stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own hot magenta (#ff4fd8).
11. (row 2, column 5) Ember, Lv 1: the Mortar rune as a Ember stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Mortar rune as a Ember stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Mortar rune as a Sapphire stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Mortar rune as a Sapphire stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Mortar rune as a Ruby stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Mortar rune as a Ruby stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Mortar rune as a Diamond stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Mortar rune as a Diamond stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a MORTAR on its base plate: narrow and flat across the top, flaring the whole way down to a broad heavy plate with SQUARE bottom corners and a dead-flat foot — bottom-heavy, like something meant to stay put —
and carry the SAME glyph —
a squat mortar canted up to the right on a heavy base plate, its bore open, one shell already in the air above the muzzle —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Warhead stones — the player's 9 skins  (sheet-runes-nuker.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Warhead rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a WARHEAD SPIKE: a needle-sharp apex over a narrow body, stepping abruptly OUT to a square collar just above a flat foot — tall, thin and top-heavy. That silhouette is how a player tells a Warhead from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a three-bladed hazard trefoil: a solid round core with three heavy wedge blades spaced evenly around it, a clear ring of empty space between the core and the blades, in acid yellow-green; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Warhead rune as a River stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own acid yellow-green (#e8ff3d).
2. (row 1, column 2) River, Lv 2: the Warhead rune as a River stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own acid yellow-green (#e8ff3d).
3. (row 1, column 3) Obsidian, Lv 1: the Warhead rune as a Obsidian stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Warhead rune as a Obsidian stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Warhead rune as a Jade stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Warhead rune as a Jade stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Warhead rune as a Amber stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Warhead rune as a Amber stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Warhead rune as a Marble stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own acid yellow-green (#e8ff3d).
10. (row 2, column 4) Marble, Lv 2: the Warhead rune as a Marble stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own acid yellow-green (#e8ff3d).
11. (row 2, column 5) Ember, Lv 1: the Warhead rune as a Ember stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Warhead rune as a Ember stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Warhead rune as a Sapphire stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Warhead rune as a Sapphire stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Warhead rune as a Ruby stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Warhead rune as a Ruby stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Warhead rune as a Diamond stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Warhead rune as a Diamond stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a WARHEAD SPIKE: a needle-sharp apex over a narrow body, stepping abruptly OUT to a square collar just above a flat foot — tall, thin and top-heavy —
and carry the SAME glyph —
a three-bladed hazard trefoil: a solid round core with three heavy wedge blades spaced evenly around it, a clear ring of empty space between the core and the blades —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
The rune stone is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest rune stone spans about 71% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Crown stones — the player's 9 skins  (sheet-runes-crown.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A RUNE STONE.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
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

WHAT IT IS: The player's Crown rune, cut into each of the 9 stone skins the shop sells, at level 1 and level 2. EVERY PANEL IS THE SAME STONE SHAPE: a CROWNED band: a heavy rounded band whose TOP EDGE rises into three peaks, a tall one on the axis and a shorter one to each side, with a V-shaped valley between them. That silhouette is how a player tells a Crown from every other rune across the board, so it is the one thing that must not vary between panels — the material and the way the stone is finished are what change. The glyph is a three-peaked crown on a heavy band, the middle peak tallest, one diamond gem cut clean out of the band, in royal indigo; it too is the SAME in every panel.

READ THE PANELS: Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. Left to right, top to bottom: River, Obsidian, Jade, Amber, Marble, Ember, Sapphire, Ruby, Diamond — each as Lv 1 then Lv 2. A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) River, Lv 1: the Crown rune as a River stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own royal indigo (#6c5cff).
2. (row 1, column 2) River, Lv 2: the Crown rune as a River stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, CARVED SMOOTH and bordered: the outline is clean and unbroken, with a raised bevelled border running all the way around it and a shallow sunken field inside that border. An amulet somebody cut a rune into, not a rock they found — the two sides are exactly equal and the border is even the whole way round, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own royal indigo (#6c5cff).
3. (row 1, column 3) Obsidian, Lv 1: the Crown rune as a Obsidian stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
4. (row 1, column 4) Obsidian, Lv 2: the Crown rune as a Obsidian stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, KNAPPED: the same outline struck off in long straight flats instead of curves, its edges a little uneven, no border and no sunken field — raw worked glass, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.
5. (row 1, column 5) Jade, Lv 1: the Crown rune as a Jade stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
6. (row 1, column 6) Jade, Lv 2: the Crown rune as a Jade stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, WORN SMOOTH and bordered: every corner and point of the outline rounded off, as though carried in a pocket for years, with a raised bevelled border all the way round and a shallow sunken field inside it. Polished, not cut — no facet anywhere, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.
7. (row 2, column 1) Amber, Lv 1: the Crown rune as a Amber stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
8. (row 2, column 2) Amber, Lv 2: the Crown rune as a Amber stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, CUT and bordered: the same outline taken in flat planes rather than curves — a few facets down each side — so the light breaks along an edge instead of sliding round. A raised bevelled border all the way round and a shallow sunken field inside it, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.
9. (row 2, column 3) Marble, Lv 1: the Crown rune as a Marble stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own royal indigo (#6c5cff).
10. (row 2, column 4) Marble, Lv 2: the Crown rune as a Marble stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, QUARRIED HEAVY and bordered: the same outline, broader and thicker, its sides filled part of the way out toward the block it was cut from, with a raised bevelled border all the way round and a shallow sunken field inside it. The heaviest of the set, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own royal indigo (#6c5cff).
11. (row 2, column 5) Ember, Lv 1: the Crown rune as a Ember stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
12. (row 2, column 6) Ember, Lv 2: the Crown rune as a Ember stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, BLUNTED INTO A SLAB: the outline pushed most of the way out to the block, its corners knocked round, thick and cracked, with no border and no sunken field — the silhouette still shows at the corners, but softened, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.
13. (row 3, column 1) Sapphire, Lv 1: the Crown rune as a Sapphire stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
14. (row 3, column 2) Sapphire, Lv 2: the Crown rune as a Sapphire stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, STEP CUT: the outline taken in a FEW long hard flats with chamfered corners and squared-off sides, with wide facet bands running parallel to the edge and a flat table across the middle. No border, no sunken field — a cut gem, not a carved stone, the glyph is a polished channel sunk into the table, a hard white edge on its lit side and cold blue light in the groove; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): deep blue sapphire, glassy and cold, its depths almost ink at the shoulders: lit face around #7db4ff, body #1f4bbf, shadow side #0b1c58, rim light #dbe9ff. Glyph ink #04102e, its glow around #bcd8ff.
15. (row 3, column 3) Ruby, Lv 1: the Crown rune as a Ruby stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
16. (row 3, column 4) Ruby, Lv 2: the Crown rune as a Ruby stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, CABOCHON: the outline domed and rounded until there is not a facet or a corner left on it, a little plumper than the stone draws itself, with one long highlight sliding across the dome. No border, no sunken field, the glyph BURNS under the dome rather than being cut into it, a soft red core with no hard edge anywhere; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): pigeon-blood ruby, deep red and glowing, with fine silk needles inside: lit face around #ff7a90, body #c0113a, shadow side #5c0418, rim light #ffd0d8. Glyph ink #2a0209, its glow around #ff5570.
17. (row 3, column 5) Diamond, Lv 1: the Crown rune as a Diamond stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.
18. (row 3, column 6) Diamond, Lv 2: the Crown rune as a Diamond stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, BRILLIANT CUT: the outline taken in MANY small crisp flats, kite facets running from the edge in to a flat table, the girdle sparkling. No border, no sunken field, and no colour of its own — all of its character is the light it splits, the glyph SPLITS the light: it is the one glyph that is not a single colour, red through gold to green and blue across it; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): colourless diamond, brilliant and glassy, with tiny spectral flashes of red, green and blue: lit face around #ffffff, body #cfe4f2, shadow side #7d95a8, rim light #ffffff. Glyph ink #33465a, its glow around #eaf6ff.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 18 panels are the SAME STONE SHAPE — a CROWNED band: a heavy rounded band whose TOP EDGE rises into three peaks, a tall one on the axis and a shorter one to each side, with a V-shaped valley between them —
and carry the SAME glyph —
a three-peaked crown on a heavy band, the middle peak tallest, one diamond gem cut clean out of the band —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
Each panel is exactly 1/6 of the width and 1/3 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No rune stone is anywhere near filling its panel, and none touches an edge.
· Every panel holds one rune stone, at the size the reference has it, centred.
· The glyph is the same shape in every panel.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
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

WHAT IT IS: The enemy's Sword rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a BLADE-TIP plaque: a sharp point at the top, shoulders sweeping down into a full belly and a round base — the tallest and pointiest stone of the set — the same silhouette the player's Sword stones carry, because that outline is what says which rune it is; the glyph is a straight sword point-up: tapered blade, cross-guard, grip, round pommel, in crimson, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Sword rune as a Bone Dummies stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Sword rune as a Bone Dummies stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Sword rune as a Goblin Archers stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Sword rune as a Goblin Archers stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Sword rune as a Orc Berserkers stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Sword rune as a Orc Berserkers stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Sword rune as a Undead Mages stone at level 1: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Sword rune as a Undead Mages stone at level 2: the BLADE-TIP silhouette — a sharp point at the top over a full belly and a round base, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a BLADE-TIP plaque: a sharp point at the top, shoulders sweeping down into a full belly and a round base — the tallest and pointiest stone of the set —
and carry the SAME glyph —
a straight sword point-up: tapered blade, cross-guard, grip, round pommel —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
reference the widest rune stone spans about 71% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

WHAT IT IS: The enemy's Bow rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a SLENDER SPINDLE: narrow and tall, drawn out to a long taper at the top AND at the foot, its belly barely two thirds as wide as the stone is tall — the thinnest stone of the set — the same silhouette the player's Bow stones carry, because that outline is what says which rune it is; the glyph is a recurve bow seen side-on with one arrow nocked and flying to the right: the limb is a crescent of EVEN thickness bulging right, never a filled belly, its two tips joined by a straight vertical string, and the arrow lies across the whole width — a diamond flight at the left, a broad triangular head at the right, standing clear of the limb, in emerald, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Bow rune as a Bone Dummies stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Bow rune as a Bone Dummies stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Bow rune as a Goblin Archers stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Bow rune as a Goblin Archers stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Bow rune as a Orc Berserkers stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Bow rune as a Orc Berserkers stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Bow rune as a Undead Mages stone at level 1: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Bow rune as a Undead Mages stone at level 2: the SLENDER SPINDLE silhouette — narrow and tall, drawn to a long taper at both ends, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a SLENDER SPINDLE: narrow and tall, drawn out to a long taper at the top AND at the foot, its belly barely two thirds as wide as the stone is tall — the thinnest stone of the set —
and carry the SAME glyph —
a recurve bow seen side-on with one arrow nocked and flying to the right: the limb is a crescent of EVEN thickness bulging right, never a filled belly, its two tips joined by a straight vertical string, and the arrow lies across the whole width — a diamond flight at the left, a broad triangular head at the right, standing clear of the limb —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
reference the widest rune stone spans about 64% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

WHAT IT IS: The enemy's Orb rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a SMOOTH UPRIGHT EGG: one unbroken oval, taller than it is wide, with no point and no corner anywhere on it — the same silhouette the player's Orb stones carry, because that outline is what says which rune it is; the glyph is an arcane orb in THREE parts, all three required: (1) a RING, an open circle of even thickness; (2) a SOLID ROUND CORE floating at its centre, filled in, not an outline, about a third of the ring across, with a clear gap of stone between core and ring; (3) FOUR SMALL SPARKS, one at each diagonal — upper-left, upper-right, lower-left, lower-right — sitting just OUTSIDE the ring. A ring on its own, a ring with a stem or tail, a ring with the middle left empty, or a ring with fewer than four sparks is the WRONG glyph and reads as a different rune, in amethyst violet, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Orb rune as a Bone Dummies stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Orb rune as a Bone Dummies stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Orb rune as a Goblin Archers stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Orb rune as a Goblin Archers stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Orb rune as a Orc Berserkers stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Orb rune as a Orc Berserkers stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Orb rune as a Undead Mages stone at level 1: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Orb rune as a Undead Mages stone at level 2: the SMOOTH EGG silhouette — one unbroken upright oval, no point and no corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a SMOOTH UPRIGHT EGG: one unbroken oval, taller than it is wide, with no point and no corner anywhere on it —
and carry the SAME glyph —
an arcane orb in THREE parts, all three required: (1) a RING, an open circle of even thickness; (2) a SOLID ROUND CORE floating at its centre, filled in, not an outline, about a third of the ring across, with a clear gap of stone between core and ring; (3) FOUR SMALL SPARKS, one at each diagonal — upper-left, upper-right, lower-left, lower-right — sitting just OUTSIDE the ring. A ring on its own, a ring with a stem or tail, a ring with the middle left empty, or a ring with fewer than four sparks is the WRONG glyph and reads as a different rune —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
reference the widest rune stone spans about 71% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

WHAT IT IS: The enemy's Shield rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a BLOCKY SHIELD tablet: a FLAT top with square shoulders and straight vertical sides, drawn down to a blunt point at the FOOT — a heater shield lying on its face, and the only stone of the set whose point is at the bottom — the same silhouette the player's Shield stones carry, because that outline is what says which rune it is; the glyph is a heater shield with a cross cut out of its face, in sapphire blue, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Shield rune as a Bone Dummies stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Shield rune as a Bone Dummies stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Shield rune as a Goblin Archers stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Shield rune as a Goblin Archers stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Shield rune as a Orc Berserkers stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Shield rune as a Orc Berserkers stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Shield rune as a Undead Mages stone at level 1: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Shield rune as a Undead Mages stone at level 2: the BLOCKY SHIELD silhouette — flat across the top, straight sides, a blunt point at the FOOT, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a BLOCKY SHIELD tablet: a FLAT top with square shoulders and straight vertical sides, drawn down to a blunt point at the FOOT — a heater shield lying on its face, and the only stone of the set whose point is at the bottom —
and carry the SAME glyph —
a heater shield with a cross cut out of its face —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

WHAT IT IS: The enemy's Cross rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a FOUR-LOBED medallion: four shallow rounded arms, one up, one down and one to each side, with a soft notch between them — the stone is already a cross before any glyph is cut into it — the same silhouette the player's Cross stones carry, because that outline is what says which rune it is; the glyph is a radiant cross, four flared arms and a small burst at the centre, in topaz gold, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Cross rune as a Bone Dummies stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Cross rune as a Bone Dummies stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Cross rune as a Goblin Archers stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Cross rune as a Goblin Archers stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Cross rune as a Orc Berserkers stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Cross rune as a Orc Berserkers stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Cross rune as a Undead Mages stone at level 1: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Cross rune as a Undead Mages stone at level 2: the FOUR-LOBED silhouette — an arm up, an arm down and one to each side, with a notch between them, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a FOUR-LOBED medallion: four shallow rounded arms, one up, one down and one to each side, with a soft notch between them — the stone is already a cross before any glyph is cut into it —
and carry the SAME glyph —
a radiant cross, four flared arms and a small burst at the centre —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

## Axe stones — the four enemy factions  (sheet-runes-enemy-cleave.png)

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

WHAT IT IS: The enemy's Axe rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — an AXE BIT: narrow across the top, flaring out and down into a broad crescent whose two HORNS are the lowest points on the stone, the cutting edge sweeping back UP between them — an axe head seen face on — the same silhouette the player's Axe stones carry, because that outline is what says which rune it is; the glyph is a broad axe, bit upward: a wide crescent blade with drooping horns on a short haft with a round pommel, in burnt orange, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Axe rune as a Bone Dummies stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Axe rune as a Bone Dummies stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Axe rune as a Goblin Archers stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Axe rune as a Goblin Archers stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Axe rune as a Orc Berserkers stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Axe rune as a Orc Berserkers stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Axe rune as a Undead Mages stone at level 1: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Axe rune as a Undead Mages stone at level 2: the AXE-BIT silhouette — narrow on top, a broad crescent below with a horn at each bottom corner, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing burnt orange (about #ff8a2b, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — an AXE BIT: narrow across the top, flaring out and down into a broad crescent whose two HORNS are the lowest points on the stone, the cutting edge sweeping back UP between them — an axe head seen face on —
and carry the SAME glyph —
a broad axe, bit upward: a wide crescent blade with drooping horns on a short haft with a round pommel —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

## Boulder stones — the four enemy factions  (sheet-runes-enemy-roller.png)

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

WHAT IT IS: The enemy's Boulder rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a SQUAT BOULDER: wider than it is tall, heavy and round, with one long flat plane knocked off each side — the same silhouette the player's Boulder stones carry, because that outline is what says which rune it is; the glyph is a chipped round boulder mid-roll, two cracks knocked out of it and two short speed bars trailing behind it, in cold teal, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Boulder rune as a Bone Dummies stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Boulder rune as a Bone Dummies stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Boulder rune as a Goblin Archers stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Boulder rune as a Goblin Archers stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Boulder rune as a Orc Berserkers stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Boulder rune as a Orc Berserkers stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Boulder rune as a Undead Mages stone at level 1: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Boulder rune as a Undead Mages stone at level 2: the SQUAT BOULDER silhouette — wider than it is tall, with a flat plane knocked off each side, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing cold teal (about #00d4c8, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a SQUAT BOULDER: wider than it is tall, heavy and round, with one long flat plane knocked off each side —
and carry the SAME glyph —
a chipped round boulder mid-roll, two cracks knocked out of it and two short speed bars trailing behind it —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

## Mortar stones — the four enemy factions  (sheet-runes-enemy-bombard.png)

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

WHAT IT IS: The enemy's Mortar rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a MORTAR on its base plate: narrow and flat across the top, flaring the whole way down to a broad heavy plate with SQUARE bottom corners and a dead-flat foot — bottom-heavy, like something meant to stay put — the same silhouette the player's Mortar stones carry, because that outline is what says which rune it is; the glyph is a squat mortar canted up to the right on a heavy base plate, its bore open, one shell already in the air above the muzzle, in hot magenta, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Mortar rune as a Bone Dummies stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Mortar rune as a Bone Dummies stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Mortar rune as a Goblin Archers stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Mortar rune as a Goblin Archers stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Mortar rune as a Orc Berserkers stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Mortar rune as a Orc Berserkers stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Mortar rune as a Undead Mages stone at level 1: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Mortar rune as a Undead Mages stone at level 2: the MORTAR silhouette — narrow on top, flaring to a wide base plate with square bottom corners, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing hot magenta (about #ff4fd8, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a MORTAR on its base plate: narrow and flat across the top, flaring the whole way down to a broad heavy plate with SQUARE bottom corners and a dead-flat foot — bottom-heavy, like something meant to stay put —
and carry the SAME glyph —
a squat mortar canted up to the right on a heavy base plate, its bore open, one shell already in the air above the muzzle —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

## Warhead stones — the four enemy factions  (sheet-runes-enemy-nuker.png)

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

WHAT IT IS: The enemy's Warhead rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a WARHEAD SPIKE: a needle-sharp apex over a narrow body, stepping abruptly OUT to a square collar just above a flat foot — tall, thin and top-heavy — the same silhouette the player's Warhead stones carry, because that outline is what says which rune it is; the glyph is a three-bladed hazard trefoil: a solid round core with three heavy wedge blades spaced evenly around it, a clear ring of empty space between the core and the blades, in acid yellow-green, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Warhead rune as a Bone Dummies stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Warhead rune as a Bone Dummies stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Warhead rune as a Goblin Archers stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Warhead rune as a Goblin Archers stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Warhead rune as a Orc Berserkers stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Warhead rune as a Orc Berserkers stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Warhead rune as a Undead Mages stone at level 1: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Warhead rune as a Undead Mages stone at level 2: the WARHEAD SPIKE silhouette — a needle apex over a narrow body, stepping out to a collar at the foot, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a WARHEAD SPIKE: a needle-sharp apex over a narrow body, stepping abruptly OUT to a square collar just above a flat foot — tall, thin and top-heavy —
and carry the SAME glyph —
a three-bladed hazard trefoil: a solid round core with three heavy wedge blades spaced evenly around it, a clear ring of empty space between the core and the blades —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
reference the widest rune stone spans about 70% of its panel's width
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

## Crown stones — the four enemy factions  (sheet-runes-enemy-crown.png)

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

WHAT IT IS: The enemy's Crown rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells it from their own at a glance. EVERY PANEL IS THE SAME STONE SHAPE — a CROWNED band: a heavy rounded band whose TOP EDGE rises into three peaks, a tall one on the axis and a shorter one to each side, with a V-shaped valley between them — the same silhouette the player's Crown stones carry, because that outline is what says which rune it is; the glyph is a three-peaked crown on a heavy band, the middle peak tallest, one diamond gem cut clean out of the band, in royal indigo, the same glyph in every panel.

READ THE PANELS: Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. Left to right, top to bottom: Bone Dummies, Goblin Archers, Orc Berserkers, Undead Mages.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Bone Dummies, Lv 1: the enemy's Crown rune as a Bone Dummies stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
2. (row 1, column 2) Bone Dummies, Lv 2: the enemy's Crown rune as a Bone Dummies stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
3. (row 1, column 3) Goblin Archers, Lv 1: the enemy's Crown rune as a Goblin Archers stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
4. (row 1, column 4) Goblin Archers, Lv 2: the enemy's Crown rune as a Goblin Archers stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
5. (row 2, column 1) Orc Berserkers, Lv 1: the enemy's Crown rune as a Orc Berserkers stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
6. (row 2, column 2) Orc Berserkers, Lv 2: the enemy's Crown rune as a Orc Berserkers stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
7. (row 2, column 3) Undead Mages, Lv 1: the enemy's Crown rune as a Undead Mages stone at level 1: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).
8. (row 2, column 4) Undead Mages, Lv 2: the enemy's Crown rune as a Undead Mages stone at level 2: the CROWNED-BAND silhouette — a heavy band whose top edge rises into three peaks, cut from the faction's own rough rock, unbordered and weathered, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing royal indigo (about #6c5cff, kept muted and paper-toned, never neon).

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE SILHOUETTE, ONE GLYPH.
All 8 panels are the SAME STONE SHAPE — a CROWNED band: a heavy rounded band whose TOP EDGE rises into three peaks, a tall one on the axis and a shorter one to each side, with a V-shaped valley between them —
and carry the SAME glyph —
a three-peaked crown on a heavy band, the middle peak tallest, one diamond gem cut clean out of the band —
identical in outline, proportion and orientation in every panel. Each rune
in this game has an outline of its own, and that outline is how a player
tells one rune from another across the board — so it is the LAST thing that
may drift. Only the MATERIAL and the way the stone is finished change
between panels, exactly as the reference shows it.
· A pair of panels is one material at two levels: same stone, same cut,
  the level-2 one a little larger and heavier, with its gold rim and the
  small gold crest on its shoulder — and NOTHING else added.
· Do not re-scale a stone from the reference. Do not move it in its panel.
· Do not tidy the outline toward a plain oval or a rounded rectangle.
  Every corner, notch, horn, peak and taper in the reference is there
  because it says which rune this is.

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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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

## Glyph icons — the ten runes, no stone  (sheet-glyphs.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A GLYPH ICON.
One image, 1280 x 512 pixels — landscape, 5:2 — holding 10 SEPARATE
panels laid out 5 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 10 panels. Not 1, not 8, not 20. Exactly 2 rows of 5 — do not add a row.
· ONE big painting of a single glyph icon filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE glyph icon and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The ten rune glyphs on their own, as UI icons: the unlock card, the campaign map and the shop show a rune without its stone. Bold, flat, one strong silhouette each, readable at 24 px. Every panel carries a glyph — none is blank.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Sword, glyph icon: the Sword glyph ALONE, no stone: a straight sword point-up: tapered blade, cross-guard, grip, round pommel, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight crimson (about #ff3b4a, kept muted and paper-toned, never neon) glow
2. (row 1, column 2) Bow, glyph icon: the Bow glyph ALONE, no stone: a recurve bow seen side-on with one arrow nocked and flying to the right: the limb is a crescent of EVEN thickness bulging right, never a filled belly, its two tips joined by a straight vertical string, and the arrow lies across the whole width — a diamond flight at the left, a broad triangular head at the right, standing clear of the limb, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight emerald (about #35e07a, kept muted and paper-toned, never neon) glow
3. (row 1, column 3) Orb, glyph icon: the Orb glyph ALONE, no stone: an arcane orb in THREE parts, all three required: (1) a RING, an open circle of even thickness; (2) a SOLID ROUND CORE floating at its centre, filled in, not an outline, about a third of the ring across, with a clear gap of stone between core and ring; (3) FOUR SMALL SPARKS, one at each diagonal — upper-left, upper-right, lower-left, lower-right — sitting just OUTSIDE the ring. A ring on its own, a ring with a stem or tail, a ring with the middle left empty, or a ring with fewer than four sparks is the WRONG glyph and reads as a different rune, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight amethyst violet (about #b57bff, kept muted and paper-toned, never neon) glow
4. (row 1, column 4) Shield, glyph icon: the Shield glyph ALONE, no stone: a heater shield with a cross cut out of its face, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon) glow
5. (row 1, column 5) Cross, glyph icon: the Cross glyph ALONE, no stone: a radiant cross, four flared arms and a small burst at the centre, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight topaz gold (about #ffd23f, kept muted and paper-toned, never neon) glow
6. (row 2, column 1) Axe, glyph icon: the Axe glyph ALONE, no stone: a broad axe, bit upward: a wide crescent blade with drooping horns on a short haft with a round pommel, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight burnt orange (about #ff8a2b, kept muted and paper-toned, never neon) glow
7. (row 2, column 2) Boulder, glyph icon: the Boulder glyph ALONE, no stone: a chipped round boulder mid-roll, two cracks knocked out of it and two short speed bars trailing behind it, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight cold teal (about #00d4c8, kept muted and paper-toned, never neon) glow
8. (row 2, column 3) Mortar, glyph icon: the Mortar glyph ALONE, no stone: a squat mortar canted up to the right on a heavy base plate, its bore open, one shell already in the air above the muzzle, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight hot magenta (about #ff4fd8, kept muted and paper-toned, never neon) glow
9. (row 2, column 4) Warhead, glyph icon: the Warhead glyph ALONE, no stone: a three-bladed hazard trefoil: a solid round core with three heavy wedge blades spaced evenly around it, a clear ring of empty space between the core and the blades, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight acid yellow-green (about #e8ff3d, kept muted and paper-toned, never neon) glow
10. (row 2, column 5) Crown, glyph icon: the Crown glyph ALONE, no stone: a three-peaked crown on a heavy band, the middle peak tallest, one diamond gem cut clean out of the band, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight royal indigo (about #6c5cff, kept muted and paper-toned, never neon) glow

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
Each panel is exactly 1/5 of the width and 1/2 of the height.
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
· A HOLE THROUGH THE OBJECT IS BACKGROUND, not part of the object. Where a
  shape closes around an empty middle — a ring, an arch, a horseshoe, a
  closed loop, an open crescent — the magenta inside it is the SAME ground as
  the magenta outside it: one continuous colour that happens to be
  surrounded. Paint NOTHING in there. No stone, no disc, no plate, no
  shield, no medal, no emblem, no glow, no tint, not even a paler or warmer
  wash of the object's own colour. If you cannot see the panel's flat
  magenta straight through the middle of the shape, that panel is wrong and
  the whole sheet has to be painted again.
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
· 5 panels across, 2 down, 10 in all.
· The canvas is landscape, 5:2.
· No glyph icon is anywhere near filling its panel, and none touches an edge.
· Every panel holds one glyph icon, at the size the reference has it, centred.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1280 x 512 pixels (5:2, landscape). If your
tool has an aspect-ratio control, set it to 5:2 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```
