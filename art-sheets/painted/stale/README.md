# Paintings of a drawing that has since changed

Nothing in here is cut by `pnpm art:slice` — it only reads the top level of
`painted/`. These are kept because they are still the best reference for what
the style should look like when they are painted again, and because throwing
away a generation somebody paid for is not a decision a tool should make.

| File | Why it is here |
| --- | --- |
| `sheet-runes-archer.jpg` | The Bow was **re-cut**: its limb is a crescent of even thickness now, not a filled belly. The old shape only read as a bow while a skin outlined its glyph — jade's inlay, marble's carved ink, amber's lit interior and obsidian's neon all fill it, and the painting turned those four panels into a solid sail. Repaint from `art-sheets/sheet-runes-archer.png`. |
| `sheet-runes-enemy-archer.jpg` | The same bow, on the four faction stones. |
| `sheet-glyphs.jpg` | The glyph sheet was **re-laid** when the roster reached ten runes: 3 columns × 3 rows became 5 × 2, so its nine panels no longer land anywhere near the lattice. The slicer refuses it outright (`aspect ratio changed … 19.1%`). Repaint from `art-sheets/sheet-glyphs.png`. |
| `sheet-runes-*.jpg` (melee, archer→`-preshapes`, mage, defense, support, cleave) | The **silhouette moved from the skin to the rune**. Until now a skin owned the shape, so all ten runes of a skin were one stone with ten different marks cut into it; now each rune type has an outline of its own (a shield is blocky and points DOWN, a bow is a slim spindle, an axe is a bit with two horns) and the skin decides only the finish. Three skins arrived with it — sapphire, ruby, diamond — so a stone sheet is 6×3 (1536×768) where it was 4×3. Every panel is a different stone in a different cell. Repaint whole from the re-exported reference. |
| `sheet-runes-enemy-*.jpg` (melee, mage, defense, support) | The same silhouettes, on the four faction stones. The grid is unchanged (4×2); the stones are not. |
| `sheet-fx.jpg` | The fx sheet was **re-laid** when the wreath became a per-RUNE drawable: the six laurels moved to `sheet-laurels.png` (ten of them, one per rune) and fx went from 6 columns to 4. Its old panels no longer land on the lattice. |
| `sheet-runes-melee-recomposed.jpg`, `sheet-runes-mage-recomposed.jpg`, `sheet-runes-bombard-recomposed.jpg` | **Re-composed grid** (parked 2026-09-11). Painted THREE states per skin — eight stones a row where the lattice holds six — at exactly the 2:1 the sheet asked for, so the shape test passed it and every one of the 54 slices held two half-stones. `slice-sheets.mjs` now refuses it (`36-38% of the cut lines run through painted subjects`). Repaint from the reference; the prompt already says 6 across — the model did not listen. |
| `sheet-runes-mage-regrid.jpg` | **Re-composed grid, again** (parked 2026-09-13). The orb's second attempt after `sheet-runes-mage-recomposed.jpg` came back with the same fault: `36% of the cut lines run through painted subjects`, so the model laid its own grid over the sheet's size instead of painting into the reference's cells. It was never sliced, which is why the player's nine orb stones are the only rune in the game still drawing itself at both levels while the four faction orbs are painted. Repaint from `art-sheets/sheet-runes-mage.png`. |
| `sheet-runes-enemy-mage-recomposed.jpg` | The same fault on the faction stones: six stones a row across four cells (33%). |
| `sheet-fx-cards.jpg` | **No ground** (parked 2026-09-11). The rings on a muted magenta the key cannot reach inside them, everything else painted on parchment tiles; the guard came back a blue flash and both crests with a letter on them. The slicer refuses 7 of the 12 panels as cards or filled rings, and therefore the whole sheet. |
| `sheet-laurels.jpg` | **Two panels carry the rune's own weapon, and none of the ten follow a silhouette** (parked 2026-09-13). The repaint that replaced `sheet-laurels-silhouettes.jpg` came back clean on eight panels and wrong on two: the axe's wreath has the bit's two crescent blades painted in place of its top leaves, and the crown's has a solid gold crown lying across the middle of the ring — laid over a Lv 2 stone it covers the rune's own glyph, which is the exact fault the sheet before it was parked for. The other eight are usable, but all ten came back as the SAME round wreath, so the one thing a per-rune wreath exists to do — hug a shield, a cloverleaf, a triangle — none of them does. Parked whole rather than in part: a board showing eight painted wreaths and two drawn ones is the split this file warns about further down. Every Lv 2 stone wears the drawn wreath until it is repainted, and the drawn one is now cut to the stone exactly — per rune AND per skin (`arenaPainters.paintLaurel`), which the paintings never were. Repaint from `art-sheets/sheet-laurels.png`; the prompt already forbids anything but the wreath. |
| `sheet-laurels-silhouettes.jpg` | **Captions and a stone** (parked 2026-09-11). Every panel carried "Laurel · <Rune>, Lv 2" copied from the key sheet and a solid gold silhouette of the stone inside the wreath; laid over a Lv 2 stone it covered the stone. The slicer erases the captions and 7 of the silhouettes, but the shield and mortar are painted fused to the wreath and the warhead sits on its knot. Parked whole so every Lv 2 stone wears the same drawn wreath until the sheet is repainted. |

Every sliced stone under `public/images/runes/` was removed alongside the
paintings above — twelve `archer-*.webp` the first time, and all sixty-four of
them when the silhouette moved to the rune; and all ten `laurel-*.webp` under
`public/images/fx/` when the wreath sheet went the same way. With them gone the renderer falls
back to the drawing, which is the corrected shape. Leaving them would have
shipped the old silhouette on any build with `VITE_ENABLE_ART_OVERRIDES` on,
and — worse than shipping it wholesale — shipped it for the four runes that had
been painted while the six that had not drew themselves correctly, so the one
thing the split exists to fix would have been visibly broken in half.

Going forward this is caught by the slicer rather than by hand: a successful
slice records the revision of the reference it cut against in
`painted/.sliced.json`, and a painting whose reference has changed since is
refused with the reason (`--stale-ok` overrides).
