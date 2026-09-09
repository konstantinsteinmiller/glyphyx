# Arena effects — the per-event wiring

`arenaFx.ts` holds the effects; `useArenaArt.ts` decides WHEN. Every painter is
a pure function of the event's progress `p = (elapsed − e.at) / e.dur` and the
event's tile centres; every spawner is fired ONCE, at the moment named below
(keep a per-event `fired` flag next to `stages[]`). Coordinates are the
renderer's CSS pixels, `size` is `geom.tile`; the spawners flip y themselves.

Nothing in the table sets `shadowBlur` or `filter`. The renderer's remaining
blur sites are listed at the end — phase 2 replaces each with the effect named.

| event | per frame (painter) | once (spawner) | when |
| --- | --- | --- | --- |
| `place` | `paintLanding(ctx, k, x, y, size, sideColor)` for the 0.35 after the pebble lands (`k = (p − 0.7) / 0.3`) | `spawnTileDust(x, y, size, 5)` | at landing (`p ≥ 0.7`) |
| `merge` | the incoming pebble falls (existing); then `paintMergeRing(ctx, k, x, y, size)` for the second half | `spawnMergeFountain(x, y, size)`; keep the crest float text | at impact (`p ≥ impactFrac`) |
| `clash` | the two pebbles converge (existing); then `paintClashFlash(ctx, k, x, y, size)` | `spawnImpactSparks(x, y, size, '#ffffff', 0, 26)` + `spawnChips` for each shattered side (stone colour) | at impact |
| `aura` | `paintAuraLink(ctx, p, from, toCentres, size, SHIELD_COLOR)` | — | every frame of the event |
| `heal` | `paintHealFlare(ctx, p, x, y, size, HEAL_COLOR)` | `spawnHealMotes(x, y, size, HEAL_COLOR)` | at `p = 0` |
| `buff` | `paintBuffGlint(ctx, p, x, y, size, BUFF_COLOR)` | `spawnBuffGlint(x, y, size, BUFF_COLOR)` | at `p = 0` |
| `shot` / `blade` | the attacker lunges (existing `getVis` offset); `paintSlash(ctx, (p − 0.2) / 0.45, tx, ty, size, { angle, color })` | `spawnImpactSparks(tx, ty, size, color, angle)` + `spawnChips(tx, ty, size, targetStone, angle)` when a hit landed | at the blow (`p ≈ 0.42`) |
| `shot` / `arrow` | `paintArrow(ctx, px, py, size, { angle, color })` while flying (`fly < 1`); `paintArrowImpact(ctx, k, tx, ty, size, color)` after | `spawnArrowTrail(px, py, dirX, dirY, size, color)` every ~24 ms of flight (throttle with `lastEmitAt`); `spawnChips` at impact; on an INTERCEPT (path ends on a shield) `paintShieldDome(..., { hit })` + `spawnShieldShards` instead of chips | flight / impact |
| `shot` / `beam` | `paintBeam(ctx, x, y, tx, ty, size, { color: RUNES.mage.color, env, phase: p, seed: e.from.id })` | `spawnBeamCrackle(x, y, tx, ty, size, color)` every ~24 ms while `env > 0.5`; on an intercept `paintShieldDome` + `spawnShieldShards` at the wall | whole event |
| `explode` | `paintCrossBurst(ctx, p, cellCentres, size, RUNES.mage.color)` | `spawnBurstMotes(cx, cy, size, color)` per cell | at `p = 0` |
| `shatter` | the crack (existing `v.crack`); `paintShockwave(ctx, k, x, y, size, sideColor)` after the break | `spawnShatter(type, x, y, size, stone, ink, sideColor)` (stone / ink from the skin for the player, the faction stone for an enemy) + `emitDecal` | at the break (`p ≥ impactFrac`) |
| `knockback` | the pebble slides (existing); `paintKnockbackStreak(ctx, p, fromX, fromY, toX, toY, size, sideColor)` | `spawnKnockbackDust(toX, toY, dirX, dirY, size)` | at `p = 0` |
| `capture` | `paintCaptureWave(ctx, p, tileRect, size, ownerColor)` | `spawnCaptureSparks(x, y, size, ownerColor)` | at `p = 0` |
| `combo` | `paintPopText(ctx, p, bx, by, size × 1.6, { text: labels.combo(n), color: GOLD })` | `spawnImpactSparks(bx, by, size, GOLD, −π/2, 30)` | at `p = 0` |
| match end (won) | — | `spawnVictoryShower(board.x, board.y, board.w, board.h, size, [GOLD, PLAYER_ARROW, '#ffffff'])`, once | when `view.result` appears |
| match end (lost) | — | `spawnDefeatAsh(board.x, board.y, board.w, board.h, size)`, once | when `view.result` appears |
| idle | `paintGlow` under the hovered / selected tile instead of a blurred fill | — | every frame |

## Blur sites in `useArenaArt.ts` to replace in phase 2

| lines | what it is today | replacement |
| --- | --- | --- |
| 395–396 | arrow-head glow (`drawArrowAt`) | `paintGlow` behind the arrow head |
| 417–418, 429 | trajectory arrow glow | one `glowSprite` blit per arrow |
| 515–516 | text shadow on the canvas label | `strokeText` outline (`paintPopText` style) |
| 1710–1711, 1737–1738, 1752–1753 | hovered / valid tile glow (`drawTiles`) | `paintGlow` clipped to the tile, or a baked tile-glow sprite |
| 2033–2034 | the lock ring's glow | `paintRing` (ring sprite) |
| 2075–2083 | the breathing selected-pebble glow | `glowSprite` blit behind the pebble |
| 2225–2226 | the beam halo (`drawBeam`) | `paintBeam` |
| 2251 | the conquest bar's gold glow | `glowSprite` blit |
| 2303–2304 | the legal-tile glow for tap-to-place | `paintGlow` per tile |
| 2523–2524 | the sudden-death frame pulse | a baked frame-glow sprite (nine-slice not needed: blit a ring at frame scale) |

The bakes in `arenaPainters.ts` may keep their `shadowBlur`: they run once per
sprite, not per frame.
