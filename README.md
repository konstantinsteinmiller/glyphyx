# Glyphyx

A mobile-first 2D **tactical rune battler**. Drag one glowing stone rune onto a
4×4 board, swipe the direction it faces, and watch both sides fire at once:
swords strike the tile ahead, bows skip one and hit the next, arcane orbs cut
diagonals, shields absorb, crosses heal, a nuker levels everything on the board
that has not been stacked — your own runes included — and a crown takes the
enemy stone it faces and turns it on its own side. Stack two matching runes into
a Level 2 stone, shatter the enemy's into rubble, and hold eight tiles to win —
in about ninety seconds a match.

Built with Vue 3 + TypeScript + Pug + Tailwind + Canvas 2D, shipping to
CrazyGames, Playgama, GamePix, GameMonetize, GameDistribution, Glitch.fun,
itch.io, Wavedash, Yandex Games and Poki from one codebase.

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:2050
pnpm test         # ~740 unit + integration tests (vitest)
pnpm test:e2e     # Playwright on the installed Chrome: real drags on the canvas
pnpm type-check   # vue-tsc
pnpm build        # type-check + production build
pnpm art:prompts  # regenerate art-sheets/PROMPTS-*.md from the manifest (no browser)
pnpm art:export   # bake every drawable onto reference sheets (dev server on 2062 first)
pnpm art:slice    # cut painted returns in art-sheets/painted/ into public/images
```

## Highlights

* **Zero-text onboarding.** A first-time player boots straight into stage 1-1
  with an animated ghost hand showing the one gesture — drag the sword under
  the skeleton, flick up — and wins inside fifteen seconds. Stages 1-1 to 1-6
  are one-rune lessons that cannot be lost (drag, the bow's skip, stacking, the
  orb's diagonal, the shield wall, the healing cross), each scripted for the
  ghost hand and each paying a chest that unlocks the next rune.
* **Every tile is a compass.** It carves into one region per facing the rune
  actually has — triangles cut by the diagonals for a sword, corner quadrants for
  the orb, one whole tile for a shield — and the pointer's POSITION picks the
  facing, cursor or thumb alike. Move to the top of a tile and the sword faces
  up; that region lights and grows in from the edge you are aiming at, with every
  other option drawn beside it. The middle of a tile is a small dead zone that
  chooses nothing, so a pre-aimed arrow key survives a click in the centre and an
  absent-minded drop still gets its second chance.
  Because a cursor never covers the tile it is choosing on, an aimed click skips
  the correction window entirely and the turn resolves at once. A fingertip does
  cover it, so touch draws the same compass with its marks leaned outward and
  keeps the window: a 12 px flick still re-aims, the chevrons around the stone
  still turn it, and an arrow key / WASD still works. No drag needed either: tap
  a pebble, tap a tile. The very first lesson still teaches the correction with
  the ghost hand — the sword is dropped facing nothing and turned toward the
  skeleton — and keeps its window on every device.
  The shield is a wall: it stops beams and intercepts arrows, and stands through
  four hits.
* **Stack to Lv 8.** Drop a matching rune on your own stone again and again;
  every pebble adds its body, the crest counts up, the gold laurel hugs the rune's own
  silhouette, and a Lv 8 sword swings for sixteen. A shop sells power runes — the first placement of a type lands at
  Lv 3 — for coins or one rewarded video, and skins can be earned by video too.
* **The goal, shown not told.** The conquest rail carries a crown at eight, and
  the first real duel opens with a two-second wordless intro: eight tiles light
  up, a crown lands. After 75 s of one match the enemy starts blundering, so no
  duel can be dragged out.
* **Adaptive relief, never announced.** When a player lets a turn run out or
  keeps losing the same node, the enemy quietly plays worse — skips a turn,
  picks random moves, hits softer, and the planning window grows — scaled by
  the difficulty setting and switched off in sudden death and on every lesson
  (`src/game/adaptive.ts`).
* **Simultaneous turns.** Both sides plan in secret in a 5-second window, the
  board reveals every trajectory at once, then one deterministic resolution
  plays out in 1.2 s: shields → heals → ranged → melee → tile control.
  `src/game/resolve.ts` is a pure function with 90 tests behind it.
* **One canvas, one loop.** Board, runes, hand, timer, arrows, projectiles,
  shards and the ghost hand are all drawn by `useArenaArt.ts` on one canvas
  with one pointer capture — no browser drag/drop, no selectable images, ~2 ms
  of JS per frame. Pebble sprites are baked once behind the splash.
* **Fully responsive.** 320×658 portrait through desktop fullscreen; the board
  fits itself inside the measured HUD insets, the hand moves beside it in
  landscape, safe-area insets everywhere, no fixed pixel sizing in the UI.
* **One save object.** Every persisted value lives in the in-memory
  `glyphyx_state` record, written to exactly one localStorage key and mirrored
  to the SDK cloud store as one object. Hydration is verified in a real browser
  (`tests/e2e/hydrate.spec.ts`) and against a fake CrazyGames `sdk.data`
  (`tests/save/GlyphyxStateCloudHydrate.test.ts`).
* **Synthesised audio, music included.** Forty cues — the stone thud, the arrow
  twang, the beam hum, the shatter, the golden merge — are generated per event
  with pitch and envelope jitter, every one of them tuned to a degree of the
  game's key and sharing one convolution room with a compressor and a soft clip
  across the sum. The default music track, **"Emberlight"**, is a written score
  played live by the same engine: sixty seconds of D minor for piano, violin,
  cello and hand percussion that loops with no seam, because nothing restarts.
  See [`sound-todo.md`](./sound-todo.md).
* **21 languages**, key parity enforced by a test.
* **Retention engine.** Win streaks light a flame aura and multiply gold up to
  ×3; the Rune Forge pays coins for time away (8 h cap); coins buy pebble
  skins; a generated campaign never ends.
* **Optional global board.** Deepest stage reached, with best streak as the
  second column, posted to a Cloudflare Worker + D1 (`worker/`). Baked
  snapshots ship on the portals that forbid runtime requests.

## How it plays

| Beat | What happens |
| --- | --- |
| **Learn** | 1-1: a ghost finger drags the sword under a 1-HP skeleton and swipes up. Do it, the skeleton shatters, a chest pops, the Bow is yours, 1-2 starts on its own. |
| **Plan** | Three pebbles in your hand. Drag one onto any free tile — or onto your own rune of the same type to merge it into a **Lv 2** stone with double health and damage. Keep holding and flick to aim; release to lock — then you have one second to press anywhere and flick again if it faces the wrong way. The enemy is choosing at the same time, unseen. |
| **Reveal** | Both placements slam down and every rune on the board shows its trajectory. |
| **Resolve** | Everything fires together, in a fixed order. **Sword** hits the tile it faces (Lv 2 knocks back). **Bow** skips a tile and hits the next (Lv 2: two tiles). **Arcane Orb** beams two diagonal tiles (Lv 2 explodes in a cross at the end). **Shield** absorbs 1 from every hit, stops beams and intercepts arrows (Lv 2 shields neighbours). **Radiant Cross** heals neighbours (Lv 2 also buffs their attack). |
| **Clash** | Two pebbles dropped on the same free tile collide — the tougher survives with the difference in health; equal, both shatter. |
| **Conquer** | A rune owns the tile it stands on; a shattered rune neutralises it; an empty owned tile can be taken without a fight. **Hold 8 and you win.** After ten turns the side with more tiles wins; a tie goes to sudden death. |
| **Siege** | 1v3 stages start you in the centre 2×2, surrounded by Orc Berserkers (swords), Goblin Archers (bows) and Undead Mages (orbs) who place round-robin and all fire every turn. Break out to eight, or still hold the biggest share when the last turn ends. |
| **Streak** | Every consecutive win climbs the multiplier — ×1, ×1.5, ×2, ×2.5, ×3 — and the flame around the board grows with it. One loss resets it. |
| **Forge** | Coins accrue while the tab is closed, up to eight hours. Tap the anvil to collect. |
| **Open** | A chest that holds a rune or a skin gets a screen of its own. Tap it: the lid flies, a shockwave leaves the box, light-and-dark rays turn up behind, confetti falls in front, and the prize climbs out of the chest onto its own plane while the chest shrinks away. The whole thing is sized to the short axis of the window, so it fits a 320-px phone and a landscape one without a scrollbar — a reward you have to scroll to see is a reward you may never see. |
| **Spend** | Nine skins change the stone itself — and a skin no longer changes its SHAPE. Every rune type owns an outline of its own (a shield is blocky and points down, a bow is a slim spindle, an axe is a bit with two horns), so a stone says which rune it is twice over: in its glyph and in its silhouette. A skin decides how that outline is WORKED — four carved and bordered (river sandstone, a worn jade pendant, a faceted amber gem, a heavy marble tablet), two raw (knapped obsidian, a cracked lava slab) and three cut gems (a step-cut sapphire, a domed ruby cabochon, a brilliant-cut diamond) — plus its own glyph cut, previewed in the shop with the same painter that draws the field. Rune unlocks and bigger chests come from the campaign map. |
| **Rank** | Every rune carries a permanent rank, 0 to 5, each worth one more maximum hit point — the same number for every rune, so no rune can pull ahead of another. 70 → 560 coins a step, or one rewarded video. And one rank, on one rune, is **free** at any moment: another rune is drawn every twenty minutes, off the clock, so it keeps turning while the game is shut. |

Full player-facing copy lives in [`description.md`](./description.md); the
design is in [`GDD.md`](./GDD.md).

## Architecture

```
src/game/          pure, testable domain — no Vue, no DOM
  rules.ts         every type and every number (grid, runes, timings, economy)
  board.ts         tiles, runes, placement validity, stacking
  resolve.ts       ONE resolution → new board + time-stamped event list
  ai.ts            enemy placement: every legal move scored through the resolver
  hand.ts          deck + hand + reroll
  campaign.ts      chapter 1 by hand, every chapter after it generated from the id
  match.ts         planning → reveal → resolve → next / ended
  view.ts          the renderer / input / battle contract (ArenaView, BattleApi)
  cues.ts          the audio cue vocabulary
  art.ts           drop-in bitmap probe (public/images/<kind>/<id>.webp)

src/use/           reactive layer (module-level singletons)
  useBattle        the live match: clocks, drag protocol, payout, events
  useArenaArt      the Canvas 2D renderer + pebble sprite bake seam
  useArenaInput    pointer state machine → BattleApi
  useCampaign      node progress, unlocked runes, chests
  useStreak / useRuneForge / useSkins / useEconomy
  useGlyphyxState  the single `glyphyx_state` blob + debounced persistence
  useGameAudio     synth + sample cue router (`playFx`)
  useVfx           pooled particles / float text / decals + quality tiers
  useLeaderboard   the global board — never throws, blocks or delays a match

src/platforms/     platform registry, CSP, capability gates, resolvers
src/utils/save/    SaveManager, BlobStorage, 8 cloud strategies
src/components/    F-* design system + game HUD + modals
src/views/GameScene.vue   canvas + RAF loop + HUD + result flow + ad ordering
worker/            Cloudflare Worker + D1 behind the leaderboard
```

**Rules contract:** `tests/game/` pins the roster table, the resolution order,
archer skip / mage cross / knockback / mitigation / aura / heal / merge / clash,
tile ownership, every win and loss rule, and fuzzes the AI over 200 seeds
across three chapters so it can never emit an illegal move.

**Performance contract:** the arena view is a plain mutable object read by the
canvas loop — never a reactive proxy. Only HUD scalars are refs. Pebbles are
baked to offscreen sprites per (type, level, owner, skin, size); particles live
in typed arrays with a free list; quality auto-degrades across four tiers off a
rolling FPS median, and the canvas DPR is ratcheted with it.

## Save & cloud hydration

Everything persists inside one object:

```text
glyphyx_state = {
  gx_node, gx_best_node, gx_unlocked_runes,      // the campaign
  gx_coins, gx_total_coins, gx_skin, gx_skins_owned,
  gx_streak, gx_best_streak, gx_best_combo, gx_matches, gx_wins,
  gx_rune_ranks, gx_free_rank_window,            // the permanent ladder + its gift
  gx_forge_at,                                   // the offline forge clock
  gx_tutorial_seen, gx_aimed, gx_results_seen,   // one-shot nudges
  gx_user_language, gx_user_sound_volume, ...    // settings
}
```

The load order is load-bearing and is what stops a returning player from being
rendered as a fresh install:

1. `main.ts` **awaits** the platform SDK init before `saveManager.init()`.
2. It **awaits** `saveManager.init()` before importing `App.vue`, so the whole
   module graph evaluates against hydrated storage.
3. `reloadGlyphyxState()` runs **before** the `saveDataVersion` bump, so every
   composable's watcher re-reads the hydrated blob rather than the stale one.
4. If hydrate didn't return data **and** local looks fresh, `SaveManager`
   retries 3× at 1 s spacing before letting the app boot.
5. `battle.startNode()` with no argument resumes `gx_node`; hard checkpoints
   (node cleared, match ended, skin bought, forge collected) call
   `flushSaveNow()` to bypass both debounces.

## Building for platforms

```bash
pnpm build:crazy-web        pnpm build:playgama
pnpm build:gamepix          pnpm build:gamemonetize
pnpm build:game-distribution pnpm build:glitch
pnpm build:itch             pnpm build:wavedash
pnpm build:yandex           pnpm build:poki
```

Each mode reads its `.env.<platform>` file (ids and keys are cleared — fill
them before a submission), DCEs the other platforms' SDK glue, and emits a
per-platform CSP. The leaderboard Worker is reused unchanged from the previous
game: `score` is the best node, the `squad` column carries the best streak;
give it a fresh D1 before launch and re-run `pnpm leaderboard:seed` for the
baked boards.

## Docs

| File | Contents |
| --- | --- |
| [`GDD.md`](./GDD.md) | The design: rules table, modes, onboarding script, art direction |
| [`game-implementation-plan.md`](./game-implementation-plan.md) | Build state, architecture map, decisions, what's next |
| [`description.md`](./description.md) | Store copy: short/long description, how to play, controls |
| [`retention-roadmap.md`](./retention-roadmap.md) | 18 prioritised retention / conversion features |
| [`art-todo.md`](./art-todo.md) | Drop-in bitmap manifest: every paintable target and what stays live over it |
| [`sound-todo.md`](./sound-todo.md) | Audio cue map + what's worth recording |
| [`worker/SETUP.md`](./worker/SETUP.md) | Deploying the leaderboard Worker + D1 |

## Dev tools

* Type `cmarc` anywhere to toggle debug mode (perf meter).
* `localStorage.cheat = 'true'` + reload enables the cheat shortcuts
  (`ctrl+shift+alt` + `k` coins, `n` next node, `r` retry, `u` unlock all runes,
  `s` own all skins, `w` win now; digits jump to a node) and publishes
  `window.__glyphyx` on built bundles for QA.
* `?tier=min|low|medium|high` pins the quality tier; `?perfprobe=1` publishes
  frame statistics on `window.__perf` for `pnpm perf:ab`.
* `pnpm qa:portal --platform gamepix` drives the BUILT bundle in a headed Chrome
  and asserts mute / pause / gameplay-bracket behaviour the portals grade.
* **Art pipeline** (dev only): `/#/art-sheets` bakes every drawable through the
  game's own painters onto magenta-keyed lattice sheets and exports them with a
  ready-to-paste prompt per sheet; `/#/playground` shows every drawable in
  motion with a live painted-vs-drawn toggle (`?art=on|off`). The loop is in
  [`art-sheets/README.md`](./art-sheets/README.md); the drop-in ids in
  [`art-todo.md`](./art-todo.md).
* **Image compression** — `pnpm art:compress` runs `scripts/compress-images.mjs`
  over `public/images` and replaces every png/jpg/webp with the smallest encode
  that still clears a measured quality floor (SSIM ≥ 0.98, PSNR ≥ 36 dB and an
  alpha-edge check, all scored over the sprite's content box composited on
  grey). Originals are kept in `public-backup/` — outside `public/`, because
  Vite copies that folder verbatim into every portal zip. Dry-run first
  (`pnpm art:compress --dry-run`), and re-run with `--force` to recompress from
  the backups rather than stacking a second generation loss. `pnpm
  compress-folder <dir>` does any other tree, `pnpm compress-bench <files>`
  re-derives the settings, `pnpm compress-restore <dir> --commit <sha>` pulls
  pre-compression originals back out of git. Use `pnpm`, never `npm run` — npm
  swallows the `--flags`.
* `window.__glyphyx` (dev builds and `localStorage.cheat`) exposes the battle,
  campaign, wallet, skins, the overlay flags, `winNow()` and `stripRoom` for
  scripted runs.
