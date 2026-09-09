# Board prompts — tiles, frame, HUD chips, effects

Generated from `src/game/artSheet.ts` — do not hand-edit; run `pnpm art:prompts` (or export from `/#/art-sheets`) instead.

One sheet per generation. The tile sheet and the frame FILL their panels edge to edge;
everything else floats on flat magenta. Attach the clean sheet, paste the block.

Every prompt below is one fenced block. Open this file in a markdown preview and
use the block's copy button — one click takes the whole prompt to the clipboard,
ready to paste at the image model. The heading above a block says which file to
attach with it and where the return lands; it is NOT part of the prompt.

## Board tiles — player, enemy, neutral  (sheet-tiles.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A FLOOR TILE.
One image, 512 x 512 pixels — square, 1:1 — holding 4 SEPARATE
panels laid out 2 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 4 panels. Not 1, not 2, not 8. Exactly 2 rows of 2 — do not add a row.
· ONE big painting of a single floor tile filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Draw ONLY what the reference shows in each panel. No board, no other
  tiles, no stones standing on it, no hands, no scenery, no text.
· The reference settles every argument about what belongs.

WHAT IT IS: One square floor tile of the arena in each of its three states. The board is a 4×4 grid of these; the owner's tint is the difference between them. Each tile fills its panel edge to edge with square corners — they sit side by side in play.

READ THE PANELS: Top-left: a tile the PLAYER holds (a cool teal-blue glow in its bevel). Top-right: a tile the ENEMY holds (a hot red-magenta glow). Bottom-left: an unclaimed NEUTRAL tile (plain slate with a faint violet edge light). Bottom-right is blank on purpose.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Player tile, teal glow: a square slate floor tile with a bevelled edge and a few faint cracks, its bevel lit teal-blue because the player holds it. Colour identity (keep the HUE, muted and paper-toned): dark blue-grey slate around #23283a, bevel light teal-blue around #4fd6ff, a violet edge glow around #8a5cff
2. (row 1, column 2) Enemy tile, red glow: the same slate tile, its bevel lit hot red-magenta because the enemy holds it. Colour identity (keep the HUE, muted and paper-toned): dark blue-grey slate around #23283a, bevel light red around #ff4d5a, a violet edge glow around #8a5cff
3. (row 2, column 1) Neutral tile, unclaimed: the same slate tile unclaimed: plain, with only the faint violet edge light of the arena grid. Colour identity (keep the HUE, muted and paper-toned): dark blue-grey slate around #23283a with a faint violet edge glow around #8a5cff
4. (row 2, column 2) BLANK — leave it flat magenta.

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE TILE.
The three tiles are the SAME slate tile with a different edge light. Same
bevel, same cracks, same stone, same size. Only the glow colour changes.

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
· NO frames, borders, cards, vignettes, matting or paper background inside a
  panel. The object itself fills the panel edge to edge, corner to corner.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/2 of the width and 1/2 of the height.
Each floor tile fills its panel EDGE TO EDGE, corner to corner, with SQUARE
corners and NO margin: in play these sit side by side, and a polite
border shows as a seam around every one of them.
Do NOT draw the panel edges as lines: the tiles meet, nothing marks the join.

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
· 2 panels across, 2 down, 4 in all, 1 of them blank.
· The canvas is square, 1:1.
· Every tile reaches all four edges of its panel with square corners.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 512 x 512 pixels (1:1, square). If your
tool has an aspect-ratio control, set it to 1:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## The board frame  (sheet-frame.png)

```text
WHAT COMES BACK IS ONE OBJECT: a square RING, the frame around a game board,
in a single square image 1024 x 1024 pixels. The inside of the ring is empty
magenta — the board is drawn there by the game — and the ring reaches all
four edges of the image. Not a picture of a board. Not a plaque, not a card.

WHAT IT IS NOT — read this before the subject.
· Draw ONLY what the reference shows in each panel. No board, no other
  tiles, no stones standing on it, no hands, no scenery, no text.
· The reference settles every argument about what belongs.

WHAT IT IS: The carved stone frame around the 4×4 board: a square RING of weathered sandstone with runic ornament in the corners and a plain repeatable band along the middle of each side. The inside of the ring is EMPTY — the tiles show through it. It is nine-sliced at the outer 12 %, so the corners are the ornament and the sides must stretch.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1 to 4) Frame, nine-sliced ring: a square ring of carved sandstone, ornamented at the four corners, plain along the sides, EMPTY in the middle. Colour identity (keep the HUE, muted and paper-toned): warm sandstone around #b39b73, lit edge #d9c9a6, shadow #7d6547, faint violet rune light in the corner carvings around #8a5cff

THE VIEW — seen from straight above, flat, the way a game token lies on a
table. No three-quarter view, no perspective, no tilt, no foreshortening.
The light comes from the top-left; the shadow side is lower-right.

ONE HAND.
Every stone frame on this sheet is painted by the same hand at the same
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
· NO frames, borders, cards, vignettes, matting or paper background inside a
  panel. The object itself fills the panel edge to edge, corner to corner.
· Do not invent content for a panel that is blank in the reference. Leave
  it blank — flat magenta and nothing else.
· Keep each object the same subject and silhouette it already has. This is
  a RESTYLE, not a redesign: the reference decides what is there.

LAYOUT — the grid is a cutting guide, and it is cut blindly.
Each panel is exactly 1/4 of the width and 1/4 of the height.
Each stone frame fills its panel EDGE TO EDGE, corner to corner, with SQUARE
corners and NO margin: in play these sit side by side, and a polite
border shows as a seam around every one of them.
Do NOT draw the panel edges as lines: the tiles meet, nothing marks the join.

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
· One square ring reaching all four edges, empty magenta inside it.
· The canvas is square, 1:1.
· Every tile reaches all four edges of its panel with square corners.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 1024 pixels (1:1, square). If your
tool has an aspect-ratio control, set it to 1:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## HUD chips — chest, crown, coin, forge, reroll, ribbon  (sheet-ui.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A HUD CHIP.
One image, 1024 x 512 pixels — landscape, twice as wide as it is tall (2:1) — holding 6 SEPARATE
panels laid out 4 across and 2 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 6 panels. Not 1, not 4, not 12. Exactly 2 rows of 4 — do not add a row.
· ONE big painting of a single HUD chip filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE HUD chip and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The HUD's small pictures: the reward chest, the elite crown, the coin, the Rune Forge chip, the reroll stone and the result ribbon. Each is a single object on flat magenta; the ribbon is the one wide panel.

READ THE PANELS: Top row: chest, crown, coin, forge. Bottom row: the reroll chip, then the ribbon spanning the last three panels.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Chest, reward: a closed wooden treasure chest with iron bands and a gold lock, seen from the front, slightly above. Colour identity (keep the HUE, muted and paper-toned): dark oak around #5a3a1e, iron bands #3a3f4a, gold fittings #e6b84a
2. (row 1, column 2) Crown, elite mark: a small gold crown with three points and a red jewel, a badge not a portrait. Colour identity (keep the HUE, muted and paper-toned): gold around #e6b84a with a ruby around #d8283c
3. (row 1, column 3) Coin, currency: a single gold coin seen face-on with a rune stamped into it. Colour identity (keep the HUE, muted and paper-toned): gold around #f2c14e, shadow #9a6a12
4. (row 1, column 4) Forge, offline chip: the Rune Forge chip: a small stone anvil with a glowing rune resting on it, a chip-sized emblem. Colour identity (keep the HUE, muted and paper-toned): dark iron anvil around #3a3f4a on a sandstone base around #b39b73, the rune glowing violet around #8a5cff
5. (row 2, column 1) Reroll, hand chip: the reroll chip: a small blank river pebble with two curved arrows chasing each other around its face, no text. Colour identity (keep the HUE, muted and paper-toned): river sandstone around #b39b73, arrows in pale teal around #4fd6ff
6. (row 2, column 2 to 4) Ribbon, result banner: a wide heraldic ribbon banner, its ends folded and notched, the middle a plain band (a caption is printed over it in play — leave it EMPTY). Colour identity (keep the HUE, muted and paper-toned): deep crimson cloth around #a8232f with gold edging around #e6b84a

THE VIEW — flat, square on, the way an emblem or a badge is drawn. No
perspective, no vanishing point, no tilt.

ONE HAND.
Every HUD chip on this sheet is painted by the same hand at the same
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
The HUD chip is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest HUD chip spans about 100% of its panel's width
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
· 4 panels across, 2 down, 6 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No HUD chip is anywhere near filling its panel, and none touches an edge.
· Every panel holds one HUD chip, at the size the reference has it, centred.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1024 x 512 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```

---

## Effects — rings, dome, smoke, scorch, flashes, the six Lv 2 laurels  (sheet-fx.png)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A EFFECT.
One image, 1536 x 768 pixels — landscape, twice as wide as it is tall (2:1) — holding 18 SEPARATE
panels laid out 6 across and 3 down, on the same grid as the attached
reference, read left to right along each row, top row first.
· 18 panels. Not 1, not 16, not 36. Exactly 3 rows of 6 — do not add a row.
· ONE big painting of a single effect filling the canvas is the wrong answer
  however well it is painted, and so is a re-composed grid.

WHAT IT IS NOT — read this before the subject.
· Each panel holds ONE effect and nothing else: no board, no tile under
  it, no hand, no table, no ground, no cast shadow on the ground, no
  scenery, no text, no numbers, no labels.
· The reference settles every argument about what belongs. If it is not in
  the reference panel, it is not in the picture.

WHAT IT IS: The arena's effects: three shockwave rings, the shield dome, the absorb flash, the smoke puff, the scorch mark a shattered rune leaves, the archer's muzzle flash, two crests, the mage beam's travelling spark, the archer's arrow, and six gold laurels — one per stone silhouette — the game lays around a level-2 stone. Soft light on flat magenta — every glow must stay TIGHT to its own shape, because a halo over magenta cannot be keyed.

WHAT EACH PANEL IS, in reading order:
1. (row 1, column 1) Heal ring, effect: a thin expanding ring of soft golden light seen from above, brightest at the rim. Colour identity (keep the HUE, muted and paper-toned): warm gold around #ffd23f
2. (row 1, column 2) Shock ring, effect: a thin expanding ring of white-blue impact light, the capture shockwave. Colour identity (keep the HUE, muted and paper-toned): cold white-blue around #cfe9ff
3. (row 1, column 3) Heat ring, effect: a thicker ring of violet-orange heat with a few sparks, the level-2 orb's burst. Colour identity (keep the HUE, muted and paper-toned): violet core around #b57bff to orange edge around #ff8a3d
4. (row 1, column 4) Dome, effect: a translucent hemispherical dome of blue light with faint hexagonal facets. Colour identity (keep the HUE, muted and paper-toned): sapphire blue around #4aa8ff
5. (row 1, column 5) Absorb, effect: a short bright flash where a hit meets a shield: a starburst of blue light. Colour identity (keep the HUE, muted and paper-toned): sapphire blue around #4aa8ff to white
6. (row 1, column 6) Smoke, effect: a soft round puff of dust, a single cloud, no ground. Colour identity (keep the HUE, muted and paper-toned): neutral warm grey around #c9bfae
7. (row 2, column 1) Scorch, effect: a dark scorch mark with cracked edges, the stain a shattered rune leaves on a tile, seen from above. Colour identity (keep the HUE, muted and paper-toned): near-black soot around #14100c with an ember rim around #ff5a1f
8. (row 2, column 2) Muzzle, effect: a small bright flash with three short rays, the archer's release. Colour identity (keep the HUE, muted and paper-toned): pale emerald-white around #b8ffd6
9. (row 2, column 3) Crest S, effect: a small heraldic crest: a shield emblem, one flat badge. Colour identity (keep the HUE, muted and paper-toned): sapphire blue around #4aa8ff, gold rim
10. (row 2, column 4) Crest G, effect: a small heraldic crest: a guard emblem, one flat badge. Colour identity (keep the HUE, muted and paper-toned): topaz gold around #ffd23f, dark rim
11. (row 2, column 5) Spark, beam round: the mage beam's travelling spark: a small bright violet star with a short trail, flying to the RIGHT. Colour identity (keep the HUE, muted and paper-toned): white core, violet around #b57bff, kept tight
12. (row 2, column 6) Laurel · pebble, Lv 2 wreath: the level-2 laurel for a rounded river pebble: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge
13. (row 3, column 1) Laurel · shard, Lv 2 wreath: the level-2 laurel for an angular knapped shard: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge
14. (row 3, column 2) Laurel · oval, Lv 2 wreath: the level-2 laurel for a wide smooth oval: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge
15. (row 3, column 3) Laurel · hex, Lv 2 wreath: the level-2 laurel for a hexagonal cut gem: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge
16. (row 3, column 4) Laurel · disc, Lv 2 wreath: the level-2 laurel for a round flat disc: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge
17. (row 3, column 5) Laurel · slab, Lv 2 wreath: the level-2 laurel for a rounded rectangular slab: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge
18. (row 3, column 6) Bolt, arrow in flight: the archer's arrow in flight, seen from the side and flying to the RIGHT: a straight ash shaft, a broad iron head at the right end, two emerald fletching vanes at the left end, and a short faint speed streak trailing off behind the nock — ONE arrow lying flat and level across the panel, not a bundle, not a quiver, not a bow. Colour identity (keep the HUE, muted and paper-toned): ash shaft around #b1935f, iron head around #8e98a6, emerald vanes around #35e07a, the streak pale mint #b8ffd6

THE VIEW — flat, square on, the way an emblem or a badge is drawn. No
perspective, no vanishing point, no tilt.

ONE HAND.
Every effect on this sheet is painted by the same hand at the same
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
Each panel is exactly 1/6 of the width and 1/3 of the height.
The effect is CENTRED in its panel and does not fill it: it floats
clear of all four panel edges with flat magenta around it, exactly as the
reference has it. Never let anything cross into a neighbouring panel.

SIZE — measure it against the PANEL, not against the paper. In the
reference the widest effect spans about 96% of its panel's width
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
· 6 panels across, 3 down, 18 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· No effect is anywhere near filling its panel, and none touches an edge.
· Every panel holds one effect, at the size the reference has it, centred.
· No text, numbers or labels anywhere.
· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it
  against a pure magenta swatch, not against your memory of one.

OUTPUT: one image, 1536 x 768 pixels (2:1, landscape). If your
tool has an aspect-ratio control, set it to 2:1 — a different ratio crushes the
grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.
```
