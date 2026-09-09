# Cast prompts — walk cycles and the horizon

Generated from `src/game/artSheet.ts` — do not hand-edit; run `pnpm art:prompts` (or export from `/#/art-sheets`) instead.

These restyle bitmaps that already ship. Attach `art-sheets/walk-<id>.png` or
`bg-<id>.png` and paste the block beside it. A walk sheet is a grid of panels showing
ONE character through ONE cycle, and the whole job is that it comes back as one
character and not eight.

Every prompt below is one fenced block. Open this file in a markdown preview and
use the block's copy button — one click takes the whole prompt to the clipboard,
ready to paste at the image model. The heading above a block says which file to
attach with it and where the return lands; it is NOT part of the prompt.

## Bone Dummies commander  (walk-bonecap.png → images/monsters/bonecap.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PORTRAIT. One image, 912 x 512 pixels
— landscape, 57:32 — holding 8 SEPARATE panels, 4 across and 2 down,
on the same grid as the attached reference, read left to right along the top
row and then the bottom row. Every panel is the SAME character at a different moment of one walking step.
· 8 panels. Not 12, not 16. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual: identical colours,
identical clothing and gear, identical proportions, identical silhouette.
Only the POSE changes, and it changes exactly as the reference shows —
same limb positions, same body lean, same head angle, panel for panel.
· ONE colour scheme in every panel. A character that is one colour in one panel and
  another in the next is not one character animated, it is several side by side,
  and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· It faces LEFT in the reference. Keep that direction in all 8 panels.
· Do not re-scale it: the same size in every panel, and the same size as the
  reference. Do not move it around inside its panel.

WHAT IT IS: Bone Dummies commander — a small skeleton in a cracked bone cap, shambling, a training dummy of a warrior.

Colour identity (keep the HUE, muted and paper-toned): bone white around #d9d9e8, cap shadow #6c6c80.

THIS IS A RESTYLE of the reference strip into the style below, not a new
design: keep the silhouette, the gear and the gait the reference has.

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
Each panel is exactly 1/4 of the width and 1/2 of the height. The character
does NOT fill its panel — it is centred, at the size the reference draws it,
with clear magenta all round. Never let a limb, weapon, streak or shadow
cross into a neighbouring panel. Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included. The panels are found by measuring.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the character bobs as it moves.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, 57:32.
· Every panel holds the same character, at the same size, in the same colours, facing LEFT.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one image, 912 x 512 pixels (57:32). If your tool has an
aspect-ratio control, set it to match. PNG. No labels or watermarks.
```

---

## Goblin Archers commander  (walk-nibbler.png → images/monsters/nibbler.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PORTRAIT. One image, 912 x 512 pixels
— landscape, 57:32 — holding 8 SEPARATE panels, 4 across and 2 down,
on the same grid as the attached reference, read left to right along the top
row and then the bottom row. Every panel is the SAME character at a different moment of one walking step.
· 8 panels. Not 12, not 16. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual: identical colours,
identical clothing and gear, identical proportions, identical silhouette.
Only the POSE changes, and it changes exactly as the reference shows —
same limb positions, same body lean, same head angle, panel for panel.
· ONE colour scheme in every panel. A character that is one colour in one panel and
  another in the next is not one character animated, it is several side by side,
  and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· It faces LEFT in the reference. Keep that direction in all 8 panels.
· Do not re-scale it: the same size in every panel, and the same size as the
  reference. Do not move it around inside its panel.

WHAT IT IS: Goblin Archers commander — a wiry goblin archer with a short bow on its back and a wide grin, scampering.

Colour identity (keep the HUE, muted and paper-toned): goblin green around #8dff5a with a brown leather jerkin.

THIS IS A RESTYLE of the reference strip into the style below, not a new
design: keep the silhouette, the gear and the gait the reference has.

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
Each panel is exactly 1/4 of the width and 1/2 of the height. The character
does NOT fill its panel — it is centred, at the size the reference draws it,
with clear magenta all round. Never let a limb, weapon, streak or shadow
cross into a neighbouring panel. Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included. The panels are found by measuring.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the character bobs as it moves.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, 57:32.
· Every panel holds the same character, at the same size, in the same colours, facing LEFT.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one image, 912 x 512 pixels (57:32). If your tool has an
aspect-ratio control, set it to match. PNG. No labels or watermarks.
```

---

## Orc Berserkers commander  (walk-snaggletusk.png → images/monsters/snaggletusk.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PORTRAIT. One image, 912 x 512 pixels
— landscape, 57:32 — holding 8 SEPARATE panels, 4 across and 2 down,
on the same grid as the attached reference, read left to right along the top
row and then the bottom row. Every panel is the SAME character at a different moment of one walking step.
· 8 panels. Not 12, not 16. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual: identical colours,
identical clothing and gear, identical proportions, identical silhouette.
Only the POSE changes, and it changes exactly as the reference shows —
same limb positions, same body lean, same head angle, panel for panel.
· ONE colour scheme in every panel. A character that is one colour in one panel and
  another in the next is not one character animated, it is several side by side,
  and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· It faces LEFT in the reference. Keep that direction in all 8 panels.
· Do not re-scale it: the same size in every panel, and the same size as the
  reference. Do not move it around inside its panel.

WHAT IT IS: Orc Berserkers commander — a broad orc with one snagged tusk, a cleaver in hand, stomping.

Colour identity (keep the HUE, muted and paper-toned): orc hide around #ff5a3d muted to brick, iron cleaver.

THIS IS A RESTYLE of the reference strip into the style below, not a new
design: keep the silhouette, the gear and the gait the reference has.

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
Each panel is exactly 1/4 of the width and 1/2 of the height. The character
does NOT fill its panel — it is centred, at the size the reference draws it,
with clear magenta all round. Never let a limb, weapon, streak or shadow
cross into a neighbouring panel. Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included. The panels are found by measuring.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the character bobs as it moves.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, 57:32.
· Every panel holds the same character, at the same size, in the same colours, facing LEFT.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one image, 912 x 512 pixels (57:32). If your tool has an
aspect-ratio control, set it to match. PNG. No labels or watermarks.
```

---

## Undead Mages commander  (walk-marrowknight.png → images/monsters/marrowknight.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PORTRAIT. One image, 912 x 512 pixels
— landscape, 57:32 — holding 8 SEPARATE panels, 4 across and 2 down,
on the same grid as the attached reference, read left to right along the top
row and then the bottom row. Every panel is the SAME character at a different moment of one walking step.
· 8 panels. Not 12, not 16. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual: identical colours,
identical clothing and gear, identical proportions, identical silhouette.
Only the POSE changes, and it changes exactly as the reference shows —
same limb positions, same body lean, same head angle, panel for panel.
· ONE colour scheme in every panel. A character that is one colour in one panel and
  another in the next is not one character animated, it is several side by side,
  and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· It faces LEFT in the reference. Keep that direction in all 8 panels.
· Do not re-scale it: the same size in every panel, and the same size as the
  reference. Do not move it around inside its panel.

WHAT IT IS: Undead Mages commander — a gaunt undead knight in tattered robes, a violet flame in one hand, gliding.

Colour identity (keep the HUE, muted and paper-toned): ashen robes around #c98cff muted to mauve.

THIS IS A RESTYLE of the reference strip into the style below, not a new
design: keep the silhouette, the gear and the gait the reference has.

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
Each panel is exactly 1/4 of the width and 1/2 of the height. The character
does NOT fill its panel — it is centred, at the size the reference draws it,
with clear magenta all round. Never let a limb, weapon, streak or shadow
cross into a neighbouring panel. Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included. The panels are found by measuring.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the character bobs as it moves.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, 57:32.
· Every panel holds the same character, at the same size, in the same colours, facing LEFT.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one image, 912 x 512 pixels (57:32). If your tool has an
aspect-ratio control, set it to match. PNG. No labels or watermarks.
```

---

## The player's commander  (walk-teal.png → images/heroes/teal.webp)

```text
WHAT COMES BACK IS A SPRITE SHEET, NOT A PORTRAIT. One image, 768 x 384 pixels
— landscape, twice as wide as it is tall (2:1) — holding 8 SEPARATE panels, 4 across and 2 down,
on the same grid as the attached reference, read left to right along the top
row and then the bottom row. Every panel is the SAME character at a different moment of one running stride.
· 8 panels. Not 12, not 16. Exactly 2 rows of 4 — do not add a row.

ONE CHARACTER — read this before anything else.
All 8 panels must show the same individual: identical colours,
identical clothing and gear, identical proportions, identical silhouette.
Only the POSE changes, and it changes exactly as the reference shows —
same limb positions, same body lean, same head angle, panel for panel.
· ONE colour scheme in every panel. A character that is one colour in one panel and
  another in the next is not one character animated, it is several side by side,
  and the result is unusable.
· Do not redesign it. Do not add or remove parts between panels.
· It faces RIGHT in the reference. Keep that direction in all 8 panels.
· Do not re-scale it: the same size in every panel, and the same size as the
  reference. Do not move it around inside its panel.

WHAT IT IS: The player's commander — a young rune-keeper in a teal cloak with a satchel of stones, running.

Colour identity (keep the HUE, muted and paper-toned): teal cloak around #2fb8a8, sandstone satchel.

THIS IS A RESTYLE of the reference strip into the style below, not a new
design: keep the silhouette, the gear and the gait the reference has.

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
Each panel is exactly 1/4 of the width and 1/2 of the height. The character
does NOT fill its panel — it is centred, at the size the reference draws it,
with clear magenta all round. Never let a limb, weapon, streak or shadow
cross into a neighbouring panel. Do not add, drop, merge or reorder panels.
Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,
in any colour, magenta included. The panels are found by measuring.

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

The feet land on the same line in every panel — the same height from the
bottom of the panel as in the reference. If the feet drift up or down
between panels the character bobs as it moves.

BEFORE YOU CALL IT FINISHED, count and check:
· 4 panels across, 2 down, 8 in all.
· The canvas is landscape, twice as wide as it is tall (2:1).
· Every panel holds the same character, at the same size, in the same colours, facing RIGHT.
· Every pixel that is not the subject is flat, vivid #FF00FF.

OUTPUT: one image, 768 x 384 pixels (2:1). If your tool has an
aspect-ratio control, set it to match. PNG. No labels or watermarks.
```

---

## The night sky  (bg-sky.png → images/bg/sky.webp)

```text
Repaint ONE full-bleed backdrop, a single image 1024 x 576 pixels
(16:9). The attached reference is exactly what to paint.

WHAT IT IS: the night sky over a rune world, seen from the ground: deep indigo shading to near-black at the bottom, a pale full moon high on the RIGHT with a soft halo, a violet aurora drifting across the upper left, a scatter of small stars, and a faint violet haze along the bottom where the mountains will stand. No ground, no mountains, no buildings, no birds, no lettering and NOTHING in the middle of the picture — the game board covers it.

IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background
behind it and NO magenta anywhere in this one: it is itself the background
the whole game is drawn on top of. No frame, no border, no vignette, no
card, no matting, no rounded corners, no letterboxing.

KEEP THE MIDDLE QUIET AND DARK. The board, its violet glow and a vignette
are drawn over the centre of this image; anything detailed or bright there
is noise under a grid of stones. The interest belongs in the top third.

Stay in the reference's own range of darkness: this is a night sky, not a
daylight one, and every colour in it is deep. Nothing in it may be as
bright or as saturated as a rune stone, or the board stops reading first.

STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated
bestiary or a hand-painted board-game board. Match this everywhere in it:
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
· NO frame, border, card, vignette, matting or paper edge: the painting runs
  off all four sides of the image.
· Keep the same layout the reference has — the same things in the same
  places, at the same size. This is a RESTYLE, not a redesign.

OUTPUT: one image, 1024 x 576 pixels (16:9). If your tool has an
aspect-ratio control, set it to match. PNG. No labels, captions or
watermarks.
```

---

## The far ridge  (bg-ridge-far.png → images/bg/ridge-far.webp)

```text
Repaint ONE landscape band, a single image 1024 x 256 pixels — four times as
wide as it is tall (4:1). The attached reference is exactly what to paint.

WHAT IT IS: a distant mountain ridge in silhouette, hazy and blue with moonlight catching its top edge, three tall stone pinnacles standing above the skyline; the sky above it is empty.

This band sits BEHIND the game board as a horizon. Its base runs along the
bottom edge of the image — the last row of pixels is rock, not background —
and everything above the ridge line is EMPTY: flat magenta sky, keyed out in
play. Paint no sky, no clouds, no moon, no sun, no stars, no birds: the sky
is a separate painting that goes behind this one.

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

OUTPUT: one image, 1024 x 256 pixels (4:1, a wide band). If your tool has an
aspect-ratio control, set it as close to 4:1 as it goes and keep the ridge
base on the bottom edge. PNG. No labels or watermarks.
```

---

## The near ridge  (bg-ridge-near.png → images/bg/ridge-near.webp)

```text
Repaint ONE landscape band, a single image 1024 x 256 pixels — four times as
wide as it is tall (4:1). The attached reference is exactly what to paint.

WHAT IT IS: a nearer ridge of broken black rock, its base running along the bottom edge, with five standing rune monoliths on it — rough megaliths the size of towers, two of them carved with a glowing violet glyph; the sky above it is empty.

This band sits BEHIND the game board as a horizon. Its base runs along the
bottom edge of the image — the last row of pixels is rock, not background —
and everything above the ridge line is EMPTY: flat magenta sky, keyed out in
play. Paint no sky, no clouds, no moon, no sun, no stars, no birds: the sky
is a separate painting that goes behind this one.

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

OUTPUT: one image, 1024 x 256 pixels (4:1, a wide band). If your tool has an
aspect-ratio control, set it as close to 4:1 as it goes and keep the ridge
base on the bottom edge. PNG. No labels or watermarks.
```
