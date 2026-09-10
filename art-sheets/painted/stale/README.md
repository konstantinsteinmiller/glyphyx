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

Every sliced stone under `public/images/runes/` was removed alongside the
paintings above — twelve `archer-*.webp` the first time, and all sixty-four of
them when the silhouette moved to the rune. With them gone the renderer falls
back to the drawing, which is the corrected shape. Leaving them would have
shipped the old silhouette on any build with `VITE_ENABLE_ART_OVERRIDES` on,
and — worse than shipping it wholesale — shipped it for the four runes that had
been painted while the six that had not drew themselves correctly, so the one
thing the split exists to fix would have been visibly broken in half.

Going forward this is caught by the slicer rather than by hand: a successful
slice records the revision of the reference it cut against in
`painted/.sliced.json`, and a painting whose reference has changed since is
refused with the reason (`--stale-ok` overrides).
