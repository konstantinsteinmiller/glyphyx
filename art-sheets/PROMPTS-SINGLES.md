# Single-object prompts — one object per generation

Generated from `src/game/artSheet.ts` — do not hand-edit; run `pnpm art:prompts` (or export from `/#/art-sheets`) instead.

The sturdy route. An image model will not hold a lattice while it repaints; a single
has no lattice to lose. Export the singles from the bench (tick "singles"), attach
`art-sheets/singles/single-<id>.png`, paste the block. Slower, never mis-cut.

Every prompt below is one fenced block. Open this file in a markdown preview and
use the block's copy button — one click takes the whole prompt to the clipboard,
ready to paste at the image model. The heading above a block says which file to
attach with it and where the return lands; it is NOT part of the prompt.

## River — Lv 1  (single-melee-river-lv1.png → images/runes/melee-river-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own crimson (#ff3b4a).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 2  (single-melee-river-lv2.png → images/runes/melee-river-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own crimson (#ff3b4a).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 77%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 1  (single-melee-obsidian-lv1.png → images/runes/melee-obsidian-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 2  (single-melee-obsidian-lv2.png → images/runes/melee-obsidian-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 75%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 1  (single-melee-jade-lv1.png → images/runes/melee-jade-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 2  (single-melee-jade-lv2.png → images/runes/melee-jade-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 1  (single-melee-amber-lv1.png → images/runes/melee-amber-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 60%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 2  (single-melee-amber-lv2.png → images/runes/melee-amber-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 71%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 1  (single-melee-marble-lv1.png → images/runes/melee-marble-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own crimson (#ff3b4a).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 2  (single-melee-marble-lv2.png → images/runes/melee-marble-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own crimson (#ff3b4a).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 1  (single-melee-ember-lv1.png → images/runes/melee-ember-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 2  (single-melee-ember-lv2.png → images/runes/melee-ember-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 1  (single-archer-river-lv1.png → images/runes/archer-river-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own emerald (#35e07a).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 2  (single-archer-river-lv2.png → images/runes/archer-river-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own emerald (#35e07a).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 1  (single-archer-obsidian-lv1.png → images/runes/archer-obsidian-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 2  (single-archer-obsidian-lv2.png → images/runes/archer-obsidian-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 1  (single-archer-jade-lv1.png → images/runes/archer-jade-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 2  (single-archer-jade-lv2.png → images/runes/archer-jade-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 1  (single-archer-amber-lv1.png → images/runes/archer-amber-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 60%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 2  (single-archer-amber-lv2.png → images/runes/archer-amber-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 71%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 1  (single-archer-marble-lv1.png → images/runes/archer-marble-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own emerald (#35e07a).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 2  (single-archer-marble-lv2.png → images/runes/archer-marble-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own emerald (#35e07a).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 1  (single-archer-ember-lv1.png → images/runes/archer-ember-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 2  (single-archer-ember-lv2.png → images/runes/archer-ember-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 1  (single-mage-river-lv1.png → images/runes/mage-river-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own amethyst violet (#b57bff).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 2  (single-mage-river-lv2.png → images/runes/mage-river-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own amethyst violet (#b57bff).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 1  (single-mage-obsidian-lv1.png → images/runes/mage-obsidian-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 2  (single-mage-obsidian-lv2.png → images/runes/mage-obsidian-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 1  (single-mage-jade-lv1.png → images/runes/mage-jade-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 2  (single-mage-jade-lv2.png → images/runes/mage-jade-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 1  (single-mage-amber-lv1.png → images/runes/mage-amber-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 60%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 2  (single-mage-amber-lv2.png → images/runes/mage-amber-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 71%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 1  (single-mage-marble-lv1.png → images/runes/mage-marble-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own amethyst violet (#b57bff).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 2  (single-mage-marble-lv2.png → images/runes/mage-marble-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own amethyst violet (#b57bff).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 1  (single-mage-ember-lv1.png → images/runes/mage-ember-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 2  (single-mage-ember-lv2.png → images/runes/mage-ember-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 1  (single-defense-river-lv1.png → images/runes/defense-river-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own sapphire blue (#4aa8ff).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 66%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 2  (single-defense-river-lv2.png → images/runes/defense-river-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own sapphire blue (#4aa8ff).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 74%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 1  (single-defense-obsidian-lv1.png → images/runes/defense-obsidian-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 66%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 2  (single-defense-obsidian-lv2.png → images/runes/defense-obsidian-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 1  (single-defense-jade-lv1.png → images/runes/defense-jade-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 2  (single-defense-jade-lv2.png → images/runes/defense-jade-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 1  (single-defense-amber-lv1.png → images/runes/defense-amber-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 60%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 2  (single-defense-amber-lv2.png → images/runes/defense-amber-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 71%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 1  (single-defense-marble-lv1.png → images/runes/defense-marble-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own sapphire blue (#4aa8ff).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 2  (single-defense-marble-lv2.png → images/runes/defense-marble-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own sapphire blue (#4aa8ff).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 1  (single-defense-ember-lv1.png → images/runes/defense-ember-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 2  (single-defense-ember-lv2.png → images/runes/defense-ember-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 1  (single-support-river-lv1.png → images/runes/support-river-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a River stone at level 1: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own topaz gold (#ffd23f).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 69%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## River — Lv 2  (single-support-river-lv2.png → images/runes/support-river-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a River stone at level 2: an irregular rounded pebble with a couple of chipped facets, the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): warm river sandstone, tan and beige, faintly banded: lit face around #d9c9a6, body #b39b73, shadow side #7d6547, rim light #f2e6c8. Glyph ink #2c2218, its glow the rune's own topaz gold (#ffd23f).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 1  (single-support-obsidian-lv1.png → images/runes/support-obsidian-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Obsidian stone at level 1: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Obsidian — Lv 2  (single-support-obsidian-lv2.png → images/runes/support-obsidian-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Obsidian stone at level 2: an angular shard, straight-edged, faceted, the glyph is a cold neon line drawn on the dark glass; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light: lit face around #4a4f6a, body #1b1d2b, shadow side #0a0b12, rim light #9fb0ff. Glyph ink #05060a, its glow around #8ff0ff.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 75%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 1  (single-support-jade-lv1.png → images/runes/support-jade-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Jade stone at level 1: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Jade — Lv 2  (single-support-jade-lv2.png → images/runes/support-jade-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Jade stone at level 2: a smooth oval, egg-like, no facets, the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): polished green jade, translucent at the edges, faint cloudy veins: lit face around #6fcf9a, body #2f8a5f, shadow side #16503a, rim light #c8ffe4. Glyph ink #0d3324, its glow around #ffd76a.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 1  (single-support-amber-lv1.png → images/runes/support-amber-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Amber stone at level 1: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 60%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Amber — Lv 2  (single-support-amber-lv2.png → images/runes/support-amber-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Amber stone at level 2: a hexagonal gem with a flat table and bevelled facets, the glyph glows from INSIDE the gem, a warm light trapped in the amber; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): cut amber, honey to orange, with small dark inclusions trapped inside: lit face around #ffcf6b, body #d98a1e, shadow side #7a3f08, rim light #fff0b0. Glyph ink #3d1e05, its glow around #ffe28a.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 71%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 1  (single-support-marble-lv1.png → images/runes/support-marble-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Marble stone at level 1: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own topaz gold (#ffd23f).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Marble — Lv 2  (single-support-marble-lv2.png → images/runes/support-marble-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Marble stone at level 2: a flat coin-like disc with a rounded edge, the glyph is CARVED deep, a shadowed groove with no glow at all; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): white marble with grey veins, softly polished: lit face around #ffffff, body #d7dbe3, shadow side #8f97a6, rim light #ffffff. Glyph ink #3a4150, its glow the rune's own topaz gold (#ffd23f).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 1  (single-support-ember-lv1.png → images/runes/support-ember-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Ember stone at level 1: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ember — Lv 2  (single-support-ember-lv2.png → images/runes/support-ember-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross rune as a Ember stone at level 2: a rounded rectangular slab, thick, cracked, the glyph BURNS through the fissures, orange ember light in the cracks; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): a slab of cooled lava, black-brown crust cracked into plates: lit face around #5a3a36, body #2f1c1a, shadow side #140908, rim light #ff9a4a. Glyph ink #ff5a1f, its glow around #ffb060.

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 1  (single-melee-e-skeleton-lv1.png → images/runes/melee-e-skeleton-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 2  (single-melee-e-skeleton-lv2.png → images/runes/melee-e-skeleton-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 77%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 1  (single-melee-e-goblin-lv1.png → images/runes/melee-e-goblin-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 2  (single-melee-e-goblin-lv2.png → images/runes/melee-e-goblin-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 77%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 1  (single-melee-e-orc-lv1.png → images/runes/melee-e-orc-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 2  (single-melee-e-orc-lv2.png → images/runes/melee-e-orc-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 77%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 1  (single-melee-e-undead-lv1.png → images/runes/melee-e-undead-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 68%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 2  (single-melee-e-undead-lv2.png → images/runes/melee-e-undead-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Sword rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing crimson (about #ff3b4a, kept muted and paper-toned, never neon).

THE GLYPH is a straight sword point-up: tapered blade, cross-guard, grip, round pommel. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 77%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 1  (single-archer-e-skeleton-lv1.png → images/runes/archer-e-skeleton-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 2  (single-archer-e-skeleton-lv2.png → images/runes/archer-e-skeleton-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 1  (single-archer-e-goblin-lv1.png → images/runes/archer-e-goblin-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 2  (single-archer-e-goblin-lv2.png → images/runes/archer-e-goblin-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 1  (single-archer-e-orc-lv1.png → images/runes/archer-e-orc-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 2  (single-archer-e-orc-lv2.png → images/runes/archer-e-orc-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 1  (single-archer-e-undead-lv1.png → images/runes/archer-e-undead-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 2  (single-archer-e-undead-lv2.png → images/runes/archer-e-undead-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Bow rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing emerald (about #35e07a, kept muted and paper-toned, never neon).

THE GLYPH is a bow with the string drawn and an arrow nocked, flying to the right. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 1  (single-mage-e-skeleton-lv1.png → images/runes/mage-e-skeleton-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 2  (single-mage-e-skeleton-lv2.png → images/runes/mage-e-skeleton-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 1  (single-mage-e-goblin-lv1.png → images/runes/mage-e-goblin-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 2  (single-mage-e-goblin-lv2.png → images/runes/mage-e-goblin-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 1  (single-mage-e-orc-lv1.png → images/runes/mage-e-orc-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 2  (single-mage-e-orc-lv2.png → images/runes/mage-e-orc-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 1  (single-mage-e-undead-lv1.png → images/runes/mage-e-undead-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 67%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 2  (single-mage-e-undead-lv2.png → images/runes/mage-e-undead-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Orb rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing amethyst violet (about #b57bff, kept muted and paper-toned, never neon).

THE GLYPH is an arcane orb: a solid core inside a ring, four diagonal sparks. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 76%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 1  (single-defense-e-skeleton-lv1.png → images/runes/defense-e-skeleton-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 66%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 2  (single-defense-e-skeleton-lv2.png → images/runes/defense-e-skeleton-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 74%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 1  (single-defense-e-goblin-lv1.png → images/runes/defense-e-goblin-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 66%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 2  (single-defense-e-goblin-lv2.png → images/runes/defense-e-goblin-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 74%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 1  (single-defense-e-orc-lv1.png → images/runes/defense-e-orc-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 66%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 2  (single-defense-e-orc-lv2.png → images/runes/defense-e-orc-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 74%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 1  (single-defense-e-undead-lv1.png → images/runes/defense-e-undead-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 66%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 2  (single-defense-e-undead-lv2.png → images/runes/defense-e-undead-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Shield rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon).

THE GLYPH is a heater shield with a cross cut out of its face. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 74%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 1  (single-support-e-skeleton-lv1.png → images/runes/support-e-skeleton-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Bone Dummies stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 69%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bone Dummies — Lv 2  (single-support-e-skeleton-lv2.png → images/runes/support-e-skeleton-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Bone Dummies stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone, dusty and dry; a thin bleached bone-white accent on the rim (the faction's colour, about #d9d9e8). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 1  (single-support-e-goblin-lv1.png → images/runes/support-e-goblin-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Goblin Archers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 69%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Goblin Archers — Lv 2  (single-support-e-goblin-lv2.png → images/runes/support-e-goblin-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Goblin Archers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): rust-red sandstone with a mossy tint in the cracks; a thin acid green accent on the rim (the faction's colour, about #8dff5a). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 1  (single-support-e-orc-lv1.png → images/runes/support-e-orc-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Orc Berserkers stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 69%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orc Berserkers — Lv 2  (single-support-e-orc-lv2.png → images/runes/support-e-orc-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Orc Berserkers stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): dark blood-red rock, heavy and rough; a thin ember orange accent on the rim (the faction's colour, about #ff5a3d). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 1  (single-support-e-undead-lv1.png → images/runes/support-e-undead-lv1.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Undead Mages stone at level 1: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 69%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Undead Mages — Lv 2  (single-support-e-undead-lv2.png → images/runes/support-e-undead-lv2.webp)

```text
Repaint ONE rune stone, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the enemy's Cross rune as a Undead Mages stone at level 2: an irregular rounded pebble of the faction's own rock, the glyph cut in and glowing; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger. Colour identity (keep the HUE, muted and paper-toned): ashen maroon stone with a cold sheen; a thin pale violet accent on the rim (the faction's colour, about #c98cff). Glyph ink near-black, glowing topaz gold (about #ffd23f, kept muted and paper-toned, never neon).

THE GLYPH is a radiant cross, four flared arms and a small burst at the centre. Keep its shape exactly.

WHAT IT IS NOT:
· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal
  around the stone. The game lays its own gold wreath around a level-2
  stone afterwards; one painted into the picture ends up under a second.

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Sword — glyph icon  (single-melee.png → images/runes/melee.webp)

```text
Repaint ONE glyph icon, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Sword glyph ALONE, no stone: a straight sword point-up: tapered blade, cross-guard, grip, round pommel, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight crimson (about #ff3b4a, kept muted and paper-toned, never neon) glow

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 51%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bow — glyph icon  (single-archer.png → images/runes/archer.webp)

```text
Repaint ONE glyph icon, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Bow glyph ALONE, no stone: a bow with the string drawn and an arrow nocked, flying to the right, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight emerald (about #35e07a, kept muted and paper-toned, never neon) glow

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 82%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Orb — glyph icon  (single-mage.png → images/runes/mage.webp)

```text
Repaint ONE glyph icon, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Orb glyph ALONE, no stone: an arcane orb: a solid core inside a ring, four diagonal sparks, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight amethyst violet (about #b57bff, kept muted and paper-toned, never neon) glow

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 75%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Shield — glyph icon  (single-defense.png → images/runes/defense.webp)

```text
Repaint ONE glyph icon, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Shield glyph ALONE, no stone: a heater shield with a cross cut out of its face, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight sapphire blue (about #4aa8ff, kept muted and paper-toned, never neon) glow

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 70%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Cross — glyph icon  (single-support.png → images/runes/support.webp)

```text
Repaint ONE glyph icon, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Cross glyph ALONE, no stone: a radiant cross, four flared arms and a small burst at the centre, one bold flat pictogram. Colour identity (keep the HUE, muted and paper-toned): ink #2c2218 with a tight topaz gold (about #ffd23f, kept muted and paper-toned, never neon) glow

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 78%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Player tile — teal glow  (single-player.png → images/tiles/player.webp)

```text
Repaint ONE floor tile, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a square slate floor tile with a bevelled edge and a few faint cracks, its bevel lit teal-blue because the player holds it. Colour identity (keep the HUE, muted and paper-toned): dark blue-grey slate around #23283a, bevel light teal-blue around #4fd6ff, a violet edge glow around #8a5cff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

It fills the image EDGE TO EDGE with square corners and no margin.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Enemy tile — red glow  (single-enemy.png → images/tiles/enemy.webp)

```text
Repaint ONE floor tile, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the same slate tile, its bevel lit hot red-magenta because the enemy holds it. Colour identity (keep the HUE, muted and paper-toned): dark blue-grey slate around #23283a, bevel light red around #ff4d5a, a violet edge glow around #8a5cff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

It fills the image EDGE TO EDGE with square corners and no margin.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Neutral tile — unclaimed  (single-neutral.png → images/tiles/neutral.webp)

```text
Repaint ONE floor tile, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the same slate tile unclaimed: plain, with only the faint violet edge light of the arena grid. Colour identity (keep the HUE, muted and paper-toned): dark blue-grey slate around #23283a with a faint violet edge glow around #8a5cff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

It fills the image EDGE TO EDGE with square corners and no margin.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Frame — nine-sliced ring  (single-frame.png → images/tiles/frame.webp)

```text
Repaint ONE stone frame, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a square ring of carved sandstone, ornamented at the four corners, plain along the sides, EMPTY in the middle. Colour identity (keep the HUE, muted and paper-toned): warm sandstone around #b39b73, lit edge #d9c9a6, shadow #7d6547, faint violet rune light in the corner carvings around #8a5cff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

It fills the image EDGE TO EDGE with square corners and no margin.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Chest — reward  (single-chest.png → images/ui/chest.webp)

```text
Repaint ONE HUD chip, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a closed wooden treasure chest with iron bands and a gold lock, seen from the front, slightly above. Colour identity (keep the HUE, muted and paper-toned): dark oak around #5a3a1e, iron bands #3a3f4a, gold fittings #e6b84a

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 81%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Crown — elite mark  (single-crown.png → images/ui/crown.webp)

```text
Repaint ONE HUD chip, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a small gold crown with three points and a red jewel, a badge not a portrait. Colour identity (keep the HUE, muted and paper-toned): gold around #e6b84a with a ruby around #d8283c

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 97%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Coin — currency  (single-coin.png → images/ui/coin.webp)

```text
Repaint ONE HUD chip, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a single gold coin seen face-on with a rune stamped into it. Colour identity (keep the HUE, muted and paper-toned): gold around #f2c14e, shadow #9a6a12

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 97%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Forge — offline chip  (single-forge.png → images/ui/forge.webp)

```text
Repaint ONE HUD chip, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the Rune Forge chip: a small stone anvil with a glowing rune resting on it, a chip-sized emblem. Colour identity (keep the HUE, muted and paper-toned): dark iron anvil around #3a3f4a on a sandstone base around #b39b73, the rune glowing violet around #8a5cff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 86%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Reroll — hand chip  (single-reroll.png → images/ui/reroll.webp)

```text
Repaint ONE HUD chip, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the reroll chip: a small blank river pebble with two curved arrows chasing each other around its face, no text. Colour identity (keep the HUE, muted and paper-toned): river sandstone around #b39b73, arrows in pale teal around #4fd6ff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 100%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Ribbon — result banner  (single-ribbon.png → images/ui/ribbon.webp)

```text
Repaint ONE HUD chip, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a wide heraldic ribbon banner, its ends folded and notched, the middle a plain band (a caption is printed over it in play — leave it EMPTY). Colour identity (keep the HUE, muted and paper-toned): deep crimson cloth around #a8232f with gold edging around #e6b84a

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 71%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Heal ring — effect  (single-ring-heal.png → images/fx/ring-heal.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a thin expanding ring of soft golden light seen from above, brightest at the rim. Colour identity (keep the HUE, muted and paper-toned): warm gold around #ffd23f

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 91%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Shock ring — effect  (single-ring-shock.png → images/fx/ring-shock.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a thin expanding ring of white-blue impact light, the capture shockwave. Colour identity (keep the HUE, muted and paper-toned): cold white-blue around #cfe9ff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 89%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Heat ring — effect  (single-ring-heat.png → images/fx/ring-heat.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a thicker ring of violet-orange heat with a few sparks, the level-2 orb's burst. Colour identity (keep the HUE, muted and paper-toned): violet core around #b57bff to orange edge around #ff8a3d

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 88%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Dome — effect  (single-shield.png → images/fx/shield.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a translucent hemispherical dome of blue light with faint hexagonal facets. Colour identity (keep the HUE, muted and paper-toned): sapphire blue around #4aa8ff

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 93%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Absorb — effect  (single-guard.png → images/fx/guard.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a short bright flash where a hit meets a shield: a starburst of blue light. Colour identity (keep the HUE, muted and paper-toned): sapphire blue around #4aa8ff to white

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 80%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Smoke — effect  (single-smoke.png → images/fx/smoke.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a soft round puff of dust, a single cloud, no ground. Colour identity (keep the HUE, muted and paper-toned): neutral warm grey around #c9bfae

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 92%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Scorch — effect  (single-scorch.png → images/fx/scorch.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a dark scorch mark with cracked edges, the stain a shattered rune leaves on a tile, seen from above. Colour identity (keep the HUE, muted and paper-toned): near-black soot around #14100c with an ember rim around #ff5a1f

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 96%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Muzzle — effect  (single-muzzle.png → images/fx/muzzle.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a small bright flash with three short rays, the archer's release. Colour identity (keep the HUE, muted and paper-toned): pale emerald-white around #b8ffd6

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 94%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Crest S — effect  (single-crest-shield.png → images/fx/crest-shield.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a small heraldic crest: a shield emblem, one flat badge. Colour identity (keep the HUE, muted and paper-toned): sapphire blue around #4aa8ff, gold rim

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 94%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Crest G — effect  (single-crest-guard.png → images/fx/crest-guard.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: a small heraldic crest: a guard emblem, one flat badge. Colour identity (keep the HUE, muted and paper-toned): topaz gold around #ffd23f, dark rim

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 95%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Spark — beam round  (single-spark.png → images/rounds/spark.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the mage beam's travelling spark: a small bright violet star with a short trail, flying to the RIGHT. Colour identity (keep the HUE, muted and paper-toned): white core, violet around #b57bff, kept tight

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 55%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Laurel · pebble — Lv 2 wreath  (single-laurel-pebble.png → images/fx/laurel-pebble.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the level-2 laurel for a rounded river pebble: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 84%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Laurel · shard — Lv 2 wreath  (single-laurel-shard.png → images/fx/laurel-shard.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the level-2 laurel for an angular knapped shard: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 84%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Laurel · oval — Lv 2 wreath  (single-laurel-oval.png → images/fx/laurel-oval.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the level-2 laurel for a wide smooth oval: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 85%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Laurel · hex — Lv 2 wreath  (single-laurel-hex.png → images/fx/laurel-hex.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the level-2 laurel for a hexagonal cut gem: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 80%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Laurel · disc — Lv 2 wreath  (single-laurel-disc.png → images/fx/laurel-disc.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the level-2 laurel for a round flat disc: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 87%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Laurel · slab — Lv 2 wreath  (single-laurel-slab.png → images/fx/laurel-slab.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the level-2 laurel for a rounded rectangular slab: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: no stone, no shield, no medal, no ribbon banner, no glyph. Colour identity (keep the HUE, muted and paper-toned): polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 91%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```

---

## Bolt — arrow in flight  (single-bolt.png → images/rounds/bolt.webp)

```text
Repaint ONE effect, in a single square image 512 x 512 pixels.
The attached reference is exactly what to paint, at exactly the size and
position it is drawn at. Match both.

WHAT IT IS: the archer's arrow in flight, seen from the side and flying to the RIGHT: a straight ash shaft, a broad iron head at the right end, two emerald fletching vanes at the left end, and a short faint speed streak trailing off behind the nock — ONE arrow lying flat and level across the panel, not a bundle, not a quiver, not a bow. Colour identity (keep the HUE, muted and paper-toned): ash shaft around #b1935f, iron head around #8e98a6, emerald vanes around #35e07a, the streak pale mint #b8ffd6

THE VIEW — seen from straight above, flat, no perspective, no tilt. Light
from the top-left.

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

SIZE AND PLACEMENT — this is the part that goes wrong.
Do not enlarge it to fill the frame. In the reference it spans about 90%
of the image's width, centred, with flat magenta on every side. Keep it the
same fraction of the frame, in the same place. Bigger is not clearer here.

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

OUTPUT: one image, exactly 512 x 512 pixels (square, 1:1). PNG. No labels,
captions or watermarks.
```
