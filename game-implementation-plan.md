# Glyphyx — implementation plan / state of the build

Resume point for any later session. Read this first, then `GDD.md`. Every
item under **Done** is built, type-checked and unit-tested; the browser runs
were driven in a real Chrome (own headless profile, Playwright on the installed
`chrome` channel) at 320×658, 390×844, 412×839, 667×375, 844×390 and 1440×900.

The base repo was the Survivalist crowd-runner. Everything platform-shaped
(SaveManager, strategies, ad providers, pause/mute gates, CSP, F-components,
i18n loader, perf probe, leaderboard worker) is reused. Everything gameplay-
shaped was replaced.

---

## 1. Architecture

```
src/game/                pure domain — no Vue, no DOM, fully unit-testable
  rules.ts               grid size, rune roster + stats, phase timings, win rules,
                         economy numbers, skins, factions — EVERY number lives here
  glyphs.ts              the five glyph paths + palette
  rng.ts                 mulberry32 seeded PRNG (deterministic AI + tests)
  board.ts               tiles, rune instances, placement validity, stacking
  resolve.ts             ONE deterministic resolution step → time-stamped event list
  ai.ts                  enemy decision: every legal move scored through resolve()
  hand.ts                deck + 3-card hand + reroll (no triples)
  campaign.ts            chapter 1 authored, chapters ≥ 2 generated from the id
  match.ts               planning → reveal → resolve → next / ended (pure)
  view.ts                the renderer / input / battle contract (ArenaView, BattleApi)
  cues.ts                the audio cue vocabulary (FxSound)
  art.ts                 drop-in bitmap probe (public/images/<kind>/<id>.webp)
  artPreload.ts          tier-0 behind the splash (10 s cap), the rest on idle
  artCatalogue.ts        every paintable id per kind
  spriteStrip.ts         slices a painted N-panel strip into frames

src/use/                 reactive layer — module singletons
  useGlyphyxState.ts     THE single save blob `glyphyx_state` (+ debounced persist)
  useEconomy.ts          coins (gx_coins / gx_total_coins)
  useCampaign.ts         node progress, unlocked runes, chest payout (once per node)
  useBattle.ts           the live match: clocks, drag protocol, animation timeline,
                         payout, `onEvent` bus, cue playback for transitions
  useStreak.ts           win-streak multiplier (×1 … ×3) + aura level
  useRuneForge.ts        offline coin forge (12/h, 8 h cap, 45-min head start)
  useSkins.ts            pebble skins (coin sink) — owned + active
  useArenaArt.ts         the Canvas 2D renderer (board, runes, hand, VFX, ghost hand,
                         timer ring, counters) + the pebble sprite bake seam
  useArenaInput.ts       pointer state machine: drag → drop → swipe-aim → commit
  useVfx.ts              pooled particles / float text / decals + quality tiers
  useGameAudio.ts        synth + sample cue router (`playFx`) — 40 glyphyx cues
  useAssets.ts           loader: pebble bake + tier-0 art behind the splash
  useLeaderboard.ts      best NODE reached, best streak as second column
  (kept as-is)           useAds, useAdGate, useGamePause*, useSound, useUser,
                         useSaveStatus, useCrazyGames, useMobileAudioMute, …

src/views/GameScene.vue  canvas + RAF + HUD + result flow + ad ordering + dev seam
src/components/game/     StreakFlame, RuneForge, StageBadge(+CampaignModal),
                         ConquestBar, EnemyBadge, ControlHint, TurnBanner,
                         ChestReveal, RuneUnlockCard
src/components/organisms/ SkinsModal, CampaignModal, OptionsModal, LeaderboardModal,
                         CoinBadge
tests/game/  tests/use/  tests/save/  tests/platforms/  tests/render/  tests/audio/
tests/ui/    tests/e2e/ (Playwright: gameplay, hydrate, layout)
```

### The save blob

`glyphyx_state` (one localStorage key, one cloud object). Field names in
`src/keys.ts`, all `gx_`-prefixed. `SaveMergePolicy` allowlists `gx_` and the
two blobs. Conflict score = bestNode×500 + unlockedRunes×150 + matches×10.

Load order (unchanged from the proven base): platform SDK init awaited →
`saveManager.init()` awaited → `reloadGlyphyxState()` → App import →
`bumpSaveDataVersion` re-reads every composable. `battle.startNode()` with no
argument resumes `gx_node`. Proven by `tests/save/GlyphyxStateCloudHydrate.test.ts`
(fake CrazyGames `sdk.data`) and `tests/e2e/hydrate.spec.ts` (real browser reload).

### The arena is ONE canvas

Board, runes, hand, timer ring, tile counters, reveal arrows, projectiles,
particles and the ghost-hand tutorial all draw on one canvas with one pointer
capture. The DOM owns the HUD: top bar (streak flame + coins + forge column,
stage badge + conquest bar, enemy badge), control hint pill, bottom bar
(mute / leaderboard / settings left, skins right), modals, result overlay.

Layout is measured, not guessed: the scene hands the renderer the top/bottom
HUD heights, and the renderer fits the largest square board into what is left,
with the hand row under it (portrait) or beside it (landscape). On a landscape
PHONE (height ≤ 480) the bottom bar stops being an inset (its buttons live in
the corners) and the hint pill moves to the free column left of the board.

### Rules as built (from the GDD, with the gaps decided)

* 4×4 board. Placement on ANY unoccupied tile, or a friendly same-type Lv 1
  rune (→ Lv 2 merge: hp = min(lv2.hp, hp×2), the new swipe re-aims it).
* Both sides pick in secret (AI decides at planning start); reveal shows
  both placements + every trajectory; then one deterministic resolution:
  1 placements/clashes · 2 Lv 2 shield auras · 3 support heals (+atk buff at Lv 2)
  · 4 ranged (archer skip, mage diagonal, Lv 2 cross) · 5 melee (+knockback at
  Lv 2) · 6 settle. **Captures are emitted in the settle step only**, as a diff of
  the input board against the result (place/shatter/knockback carry none).
* **Clash**: both sides drop on the same empty tile → the higher-HP rune
  survives with the other's HP subtracted; equal → both shatter, tile neutral.
* Tiles: owned by whoever has a rune on them; a shattered rune neutralises the
  tile; empty owned tiles stay owned and can be taken by a placement.
* Objectives: `eliminate` (tutorial: no enemy rune left; the turn limit is a
  loss), `conquest` (8 tiles either side; limit → most tiles; tie → sudden death),
  `siege` (player 8 → win; player 0 tiles → overrun; at the limit the player
  wins if ≥ the biggest single faction, ties count as held).
* Siege factions place round-robin (N→W→E); every enemy rune fires every turn.
* Planning window 5 s; committing ends it early; the timer ticks at 3-2-1.
  Lesson nodes (1-1 … 1-6) have no clock at all.
* **The shield is a wall** (`SHIELD_BLOCKS_PROJECTILES`): defense hp 9 / 18, so a
  Lv 1 shield stands through four Lv 1 hits of any type; a mage beam stops at the
  first enemy shield (a Lv 2 cross bursts around the shield's tile); an arrow is
  intercepted by an enemy shield on any tile it flies over, the skipped tile
  included; friendly shields never block; blades are unaffected.
* **Adaptive relief** (`adaptive.ts`, never announced, never on a lesson, no
  skips in sudden death): a passed turn is mirrored by an enemy skip (easy 1 /
  medium 0.75 / hard 0.4); a tile deficit ≥ 3 / ≥ 5 adds random moves and a skip
  chance; 1 / 2 / ≥ 3 losses on the same node scale enemy attacks ×0.85 / 0.75 /
  0.65, add random moves and +1 / +2 / +3 s of planning time; a loss streak ≥ 2
  adds more; hard halves every delta, easy ×1.25; clamps skip ≤ 0.8, random ≤ 0.6,
  atk ≥ ×0.6, timer ≤ 9 s. `useAdaptive` persists `gx_failed_nodes` /
  `gx_loss_streak` and feeds `beginPlanning` / `nextTurn` every turn.
* **Stacking to Lv 8** (`MAX_LEVEL`): a same-type pebble dropped on a friendly rune
  of any level below 8 raises it one level; every stacked pebble adds its own
  Lv 1 body (`hp = min(max, hp + lv1.hp)`), stats extrapolate the GDD's Lv 1/2 pair
  linearly (`statsFor`), every "Lv 2" special applies at Lv 2 and above, a Lv N
  cross heals N, a Lv 2+ bow fires at two tiles.
* **Power runes (boons):** the shop's consumables — the player's FIRST placement
  of that type in a match lands at Lv 3 (`MatchState.boons`, `Move.level`), spent
  on commit, stock in `gx_power_runes` (180 coins or one rewarded video).
* **Stall-breaker:** past 75 s of match time the relief ramps to full at 120 s
  (random moves ≥ 0.5→0.9, skips ≥ 0.3→0.6, attacks ×0.75) on every difficulty and
  it keeps its skips in sudden death — a stalled match cannot be dragged out.
  Lessons have a 200-turn limit (never printed).
* Hand: 3 pebbles from the unlocked deck (never three identical when the deck
  has variety), refilled after each placement, 2 free rerolls per match. A
  tutorial node guarantees the rune it teaches is in the opening hand.
* Payout: win `20 + 2×tiles + kills` × streak multiplier; loss 5. The chest
  (coins / rune / skin) pays once, the first time a node is cleared.

### The drag protocol (round 2: strokes + a correction window)

1. Press a hand pebble and carry it. Once the finger has been inside a valid
   tile for `AIM_LAND_MS` (60 ms) the pebble LANDS: `drag.aiming = true`, the
   anchor is the landing point, `drag.over` freezes on that tile.
2. From then on STROKES aim: the motion vector over the trailing
   `AIM_STROKE_WINDOW_MS` (140 ms) that reaches `AIM_STROKE_PX` (12 px) is
   snapped by `snapDir` and applied; the buffer resets after every recognised
   stroke and on a reversal, so a flick back is the opposite facing. The anchor
   is always the start of the latest stroke — never a rest a tile back.
3. Carrying beyond `AIM_UNLOCK_TILES` (0.85 tile) from the landed tile's centre
   un-lands: the pebble follows again. Release: landed + valid → commit with the
   stroked facing; valid but not landed → default facing.
4. Commit opens the **lock window** (`LOCK_WINDOW_MS` = 1 s): `view.lock`
   (ring draining, arrow bold), `lockOpen = true`; the reveal waits for it.
   Omni runes (shield, cross) skip the window.
5. During the window a press ANYWHERE starts a `mode: 'correct'` drag; strokes
   go `updateDrag → setAim → reaimPlayerMove` (guarded by `canReaim`) and the
   locked move's facing follows live. A stroke still under the finger when the
   window empties gets 500 ms grace. The renderer draws the ring, the arrow and
   the correction stroke; the scene shows the `correct` hint for the first three
   windows of a session. `setDragMetrics({ swipeThresholdPx, tilePx, tileCenter })`
   is fed by the input layer from the live layout.
6. **Tap-to-place**: a tap on a hand pebble selects it (`view.selected`, the
   pebble rises, legal tiles glow); a tap on a tile places it with the default
   facing and opens a longer window (`LOCK_WINDOW_TAP_MS` = 2.5 s). A tap on
   empty canvas clears; a drag always wins.
7. **Keys and chevrons**: arrows / WASD (Q/E/Z/C for diagonals; an orb reads the
   arrows as quadrants) aim the carried pebble, the selection's pending facing,
   or the rune in the window (`aimKey`); during the window every other legal
   facing is a tappable chevron `LOCK_CHEVRON_TILES` out from the tile centre.
8. **The lesson's held window** (`GhostSpec.reaim`): a lesson may hold the
   player's first window open (`lock.held`, ghost `mode: 'reaim'`) until the
   rune faces the way the ghost shows, capped by `LESSON_REAIM_HOLD_MS`. 1-1
   used it and no longer does — with the compass it drilled the FALLBACK
   gesture — so nothing shipped arms it today; it stays for a later lesson that
   wants to teach the correction, and `tests/use/battle.test.ts` covers it on a
   synthetic node (`REAIM_LESSON`).
9. **Short phones**: below 40 px of strip the control pill borrows the stage
   badge's slot like the rune card does (the card outranks it), so nothing ever
   sits on the top row of tiles.

### Campaign

Chapter 1 is authored (onboarding), later chapters generated:

| Node | Lesson (ghost script) | Board | Chest |
| --- | --- | --- | --- |
| 1-1 | `drag` — sword carried to (1,2) and RELEASED on its left side, so it lands facing the skeleton: one gesture, no correction step. Cut from obsidian whatever the save wears | 1-HP skeleton at (0,2) | 15 coins + Bow |
| 1-2 | `archer` — bow → (1,3) up shoots OVER your sword preset at (1,2) | archer at (1,0), 3-HP skeleton the sword finishes next turn | 20 coins |
| 1-3 | `stack` — sword ONTO your sword preset at (2,1) → Lv 2 | 5-HP brute on the top edge | 25 coins + Arcane Orb |
| 1-4 | `mage` — orb → (1,2) ur, one beam sweeps both | skeleton dummies (2,1) / (3,0), hp 3 | 30 coins + Shield |
| 1-5 | `defense` — shield → (1,1): intercepts the arrow, your bow shoots over it | your archer (1,2) hp 2; enemy archer (1,0) hp 4 fires every turn, never places | 35 coins + Radiant Cross |
| 1-6 | `support` — cross → (0,2): the heal lets your wounded sword win | your sword (1,2) hp 1/3; orc sword (1,1) hp 6, atk ×0.5 | 40 coins |
| 1-7 | first clocked duel: Goblins, easy | conquest 8 | 45 coins + Obsidian skin |
| 1-8 | 1v3 siege, medium factions, big chest | siege | 100 coins + Jade skin |

Lessons 1-1 … 1-6: no clock, passive enemies, `objective: 'eliminate'`, turn
limit 30, an AUTHORED deck that hands out the rune being taught
(`tutorialHand` guarantees the ghost's rune in the opening hand — which is why
save fixtures that assert "hand ⊆ unlocked" must sit on node 7 or later), a
`ghost` script per node (`dir: 'omni'` for the shield and the cross), and a
textless hint pill per beat. Floor guards (`tests/game/floor.test.ts`): a
ghost-follower clears every lesson on 20/20 seeds within two turns; a careless
random player clears 1-7 22 % and 1-8 33 % of the time; zero input never wins
1-7. Chapter N ≥ 2:
nodes alternate 1v1 / siege, factions rotate, AI medium → hard → brutal, decks
widen from chapter 3, coins 30 + 5×chapter (×2 on the chapter boss), later
skins on 2-4, 2-8, 3-4. The difficulty setting only feeds the AI's dice.

### Cue ownership (so nothing is doubled)

* `useBattle`: place (on lock), reveal, tick/tickFinal, suddenDeath, victory,
  defeat, streak.
* Renderer: hover, invalid, place (landing at reveal), arrow/beam/slash (+hits),
  explode, shield, heal, buff, shatter, clash, knockback, capture, merge, combo.
* Input: pickup, aim, reroll, uiReject. Scene/HUD: chestOpen, unlock, countUp,
  reset, forge, uiOpen, skinBuy.

---

## 2. Execution order (checklist)

- [x] Read the whole base project; decide the architecture above
- [x] Write this plan
- [x] Rename the state layer → `useGlyphyxState` / `glyphyx_state` / `gx_*`
- [x] Delete Survivalist gameplay (game/, composables, components, tests, benches)
- [x] Pure domain: rules, glyphs, rng, board, resolve, hand, ai, campaign, match
- [x] Unit tests for the domain (90 — resolution table, priorities, clash, win rules, AI legality fuzz, campaign)
- [x] i18n: full `en.ts` + all 20 other locales (parity test green)
- [x] Composables: state/economy/campaign/streak/forge/skins/battle (+ tests)
- [x] Renderer (`useArenaArt`) + input (`useArenaInput`) + VFX + audio cues
- [x] Assets: art override kinds, staged preload, pebble bake seam, splash rewrite
- [x] GameScene + HUD components + modals + result flow (ad-before-result kept)
- [x] Type-check + unit suite green (596 tests)
- [x] Real-browser runs: boot 2.5 s, 1-1 → chest → 1-2 flow, AI match, siege, every modal, all viewports
- [x] E2E tests (Playwright on the installed Chrome channel) — `pnpm test:e2e`
- [x] Docs: README, description.md, art-todo.md, sound-todo.md, retention-roadmap.md
- [x] Cleanup: unreferenced public assets pruned (2.2 MB left), old scripts, env ids cleared
- [x] `pnpm build` (type-check + production build)

### Round 2 — polish (2026-09-08)

- [x] Rune design: `arenaPainters.ts` (six stone shapes × six glyph cuts, tan
      engraved sandstone default, rust-red enemy stones, gold Lv 2 crest, violet
      grid), bakes at 2× through the painters, `PebblePreview.vue` shared by the
      shop / unlock card, bolder glyph silhouettes
- [x] Art generation pipeline: `artSheet.ts` manifest, `/#/art-sheets` bench,
      `/#/playground`, `tools/{art-prompts,export-sheets,slice-sheets}.mjs`,
      `tools/measure-art.py`, generated `art-sheets/PROMPTS-*.md`, staged
      `artPreload` tiers keyed on the save
- [x] Adaptive difficulty (`adaptive.ts` + `useAdaptive.ts`), the shield wall,
      chapter 1 as six lessons with ghost scripts, floor guards
- [x] Stroke aiming + the 1 s correction window (`view.lock`, `beginCorrection`)
- [x] Result screen without the stats row; chest on its own `ChestOverlay`
      (FReward) step; rank line; `SkinsModal` redesign; hints for orb / shield /
      cross / re-aim in all 21 locales
- [x] 742 unit tests, e2e updated for the lessons + chest step, real-browser pass
      (fresh first minute, lessons 1-4 … 1-6, node-7 turn with jade, chest → loot →
      result, skins modal, desktop + landscape) with zero console errors, `pnpm build`

### Round 3 — controls, stacking, shop, goal, VFX (2026-09-09)

- [x] Stacking to Lv 8 (linear stats, "each pebble adds its body" merge, specials at ≥ 2)
- [x] 1-1 teaches the placement gesture itself: the ghost carries the sword into the tile's LEFT region — lighting the same compass the player's own finger lights (`drawGhostCompass`) — and lets go there; no held window, no second gesture
- [x] Tap-to-place (select → tile, 2.5 s window), arrows / WASD / Q E Z C, tappable chevrons
- [x] Chest step stays: tap or 8 s auto-continue with a draining bar; lessons hand over from it
- [x] Roomy desktop enemy preview; rune tooltip while held/selected, retired after 6 uses (`gx_rune_uses`)
- [x] Adaptive stall-breaker after 75 s; power-rune boons (Lv 3 first placement)
- [x] Shop (`ShopButton` → Power Runes / Skins tabs): 180 coins or a rewarded video each; skins by rewarded video
- [x] The goal explained without text: conquest rail with a crown at 8 + tap tooltip; `GoalIntro` once on the first conquest match (`gx_goal_seen`)
- [x] Ads: 121 s paced interstitials (`showPacedInterstitial` at match end, next node, the map), `watchRewarded(reason)`
- [x] VFX: `arenaFx.ts` baked-sprite effects wired into the resolution, no per-frame `shadowBlur`
- [x] e2e: 1-1 won with one aimed drop (real pointer events, desktop + phone), loot stays, tap-to-place + chevron, goal intro
- [x] The Lv 2 laurel follows each stone's silhouette (a ray-cast of the outline, `laurelRimAt`)
      and is one painted drawable PER SHAPE (`fx/laurel-<shape>`, six panels on a 6-column fx sheet)
- [x] "Watch ad" buttons in the shop are the blue secondary style, never green
- [x] The chest ceremony is for GIFTS only (`chestIsGift`: a rune or a skin); coins-only clears show
      the chest coins on the result screen, and a coins-only lesson hands over after `LESSON_HANDOVER_MS`
      with the coins flying to the wallet; the chest's tap gate is 600 ms
- [x] A press that never moved is a tap up to 1.2 s (`TAP_MAX_MS`): a slow phone delivering pointer-up
      late must not turn a tap into a pebble that snaps back; the e2e waits for the stage banner before pressing

### Round 4 — three more runes, and a reason to want them (2026-09-09)

The roster was five runes, all handed over inside chapter 1, and nothing ever
told a new player that battles GIVE runes. So the campaign now keeps giving,
and every screen the player rests on names what is coming.

- [x] **The roster is eight.** `RuneType` gains `cleave`, `roller`, `bombard`; their
      shapes are pure helpers in `rules.ts` (`cleaveCells`, `rollerLane` + `rollerPierce`,
      `bombardCells` + `BOMBARD_RANGE`/`BOMBARD_MID_RANGE`/`BOMBARD_IS_LOBBED`) so the
      resolver, the AI and the aim preview cannot drift apart:
  - **Axe** (`cleave`, 4/2) swings with the swords across the three tiles ahead — the one it
        faces and the two beside it. Never knocks back.
  - **Boulder** (`roller`, 3/2) rolls its lane in the ranged step and hits EVERYTHING in it,
        friendlies included; it rolls on through what it breaks and rests on the first rune it
        does not (`rollerPierce` = level − 1 survivors ploughed through).
  - **Mortar** (`bombard`, 2/2) lobs onto the three side-by-side tiles three ranks ahead — the
        one attack a shield cannot intercept, and one that can only reach from the far rank.
        Lv 2 drops a second shell halfway.
- [x] The campaign hands them over at **2-1**, **2-5** and **3-1** (`RUNE_UNLOCK_NODES`);
      from chapter 4 the enemy decks carry one each (orc → axe, goblin → boulder, undead → mortar)
- [x] **And teaches each one the node after it is given** (`LATE_LESSON_NODES`): 2-2, 2-6 and 3-2
      are authored lessons carved out of the generated chapters — chapter 1's contract exactly
      (ghost script, bone dummies that never place and cannot hurt, no clock, `TUTORIAL_TURN_LIMIT`,
      `eliminate`), each won by the ghost's single placement in ONE turn on every seed, each keeping
      the coins the fight it replaced would have paid and opening no chest. Three dummies abreast for
      the axe, three down one lane for the boulder, three on the far rank behind the player's own
      shield for the mortar. New `TutorialBeat`s, control hints and `hints.*` keys in all 21 locales
- [x] **The teaser** (`NextUnlockTeaser`, `nextRuneUnlock`): "Win Level 2-1 for" + the stone itself
      at mid size, on the result screen (win AND loss) and above the campaign map. It scans forward
      from `bestNode + 1`, never `currentNode` — a replayed node pays no chest, so it can never be
      the answer — and renders nothing once the roster is complete
- [x] Glyphs, 24 px icons, `RUNE_WORDS` art prompts, `TYPE_IDX`, the eight-panel glyph sheet
- [x] i18n: `runes.names.*`, `runes.descriptions.*`, `shop.boosts.*`, `campaign.nextUnlock(Aria)`
      in all 21 locales (the dangling "for" is English-only; every other locale governs the stone
      that follows it)
- [x] The shop sells power runes only for runes the player has UNLOCKED — a boon arms the first
      placement of its type, so one bought for a locked rune is coins spent on nothing
- [x] Tier 0 art preload narrowed to the equipped skin's UNLOCKED stones (`resumeRunes`): a brand-new
      player waits behind the splash for two stones, not sixteen; the locked ones ride tier 1

### Round 5 — a ninth rune, a rank ladder, and a gift that rotates (2026-09-09)

The coin economy had a ceiling: six skins and a consumable, then nothing to
buy. Round 5 gives it a floor-less sink and hangs the game's D1–D7 hook off it.

- [x] **Rune ranks.** Every rune carries a rank 0–5 (`MAX_RUNE_RANK`), each worth
      **+1 maximum HP** (`RANK_HP_PER_RANK`) on the player's runes of that type and nothing
      else. `statsWithRank` is the only function that knows a rank exists; `statsFor` stays
      the roster's own table, shared with the enemy — who never has ranks. Ladder
      70/140/240/380/560 (`RANK_PRICES`): 1390 a rune, 13 900 for the roster of ten.
  - **The balance argument, in one line:** attack is the dangerous currency here (2–5
        against bodies of 2–9, so +1 attack on a sword is a 50 % buff), hit points are the
        safe one, and the SAME number for every rune means no rune can pull ahead of
        another *by construction* — there is no per-rune table to get wrong. Flat rather
        than level-scaled, so it is transformative on a Lv 1 bow and a rounding error on a
        Lv 8 sword: worth most where a struggling player needs it. `rules.test.ts` asserts
        the equality across all nine runes × six ranks × three levels rather than describing it.
  - Threaded player-side only through `createBoard` / `addRune` / `resolveTurn`'s
        `playerRanks`, and COPIED into `MatchState.ranks` at `createMatch`, so a rank bought
        from the shop over a finished board cannot change runes already standing
- [x] **The rotating free upgrade** (`useRuneRanks`): one rank, one rune, free — no coins,
      no video — redrawn every 20 minutes (`FREE_RANK_WINDOW_MS`). The window comes off the
      CLOCK (`freeRankWindow(now)`), not a stored counter, so it keeps turning while the game
      is shut and cannot be farmed by reloading; the pick is `mulberry32(seedFrom(playerSeed,
      window))` over the runes that are **not** capped, so the gift is always spendable and
      differs per player. One claim per window (`FREE_RANK_KEY` stores the window, not a count).
      Surfaced on the HUD: the shop chip wears a pulsing dot when a gift is waiting and opens
      straight onto the Ranks tab — a retention hook nobody can see is not one
- [x] **The nuker**, the ninth rune and the last the campaign gives (4-1, lesson at 4-2).
      Detonates ONCE, on the placement itself, and never attacks again. Every Lv 1 rune on the
      board is vaporised outright — **friendlies included**, whatever its hit points, a 9-HP Lv 1
      shield exactly like a 2-HP bow — and Lv 2+ survive with `NUKE_DAMAGE` (3, chosen below
      the smallest Lv 2 body of 4 so "stacks survive" is a rule, not an accident). The nuker
      itself is untouched: from behind it wipes a board you are losing, from in front it clears
      everything but the stacks you built. Also unlockable early for one rewarded video
- [x] **The shop's third tab**, `RankShopPanel` + `RuneRankCard`: the stone, a five-pip rank
      meter, the HP now and next, and three ways to pay — coins, a video, or the gift
- [x] **The film mark, everywhere and only where it is true.** `RewardAdIcon` now gates
      ITSELF on `isRewardGated` rather than each call site gating it: the mark is a promise
      that a video follows, and on a build with no inventory (local, itch, plain web) the perk
      is simply granted, so the icon would have been a lie. One predicate in one file makes
      every rewarded button correct — including the ones added later, which is exactly where a
      per-call-site `v-if` gets forgotten. A derived source-scan test holds the invariant
- [x] New `RewardedReason`s (`runeRank`, `nukerUnlock`), glyph/icons/art words for the nuker,
      the nuke's VFX and cue, and `ranks.*` + nuker strings in all 21 locales

### Round 6 — the tile is a compass, and the shop keeps a secret (2026-09-09)

- [x] **Position aiming.** A tile now carves into one region per facing the rune actually
      has — four triangles cut by the diagonals for a cardinal rune, four corner quadrants
      for the orb, one whole tile for a shield — and the pointer's POSITION picks the
      facing (`aimRegionShape` / `dirFromCellPoint` / `aimRegionPolygon` in `rules.ts`,
      pure, swept over every point of every tile for every rune). The region under the
      cursor lights and grows inward from the edge it faces, with every other option drawn
      beside it, so the player chooses by moving instead of by committing and correcting.
  - **A dead zone at the centre, and only there** (`AIM_CENTRE_DEAD_ZONE`, 18 %) — every
        point still NAMES a region, because the renderer has to draw something everywhere,
        but inside that radius the player has not CHOSEN: the facing holds whatever it
        already was. So nothing flickers as a pointer crosses the middle, a key pressed
        before the click is not silently overridden by it, and a stone dropped dead-centre
        does not count as aimed and keep its window. The four-way TIE at the exact centre
        falls on the player's own `defaultDir`: the middle of a tile is where a pebble
        snaps and where an unaimed drop lands, so the accidental answer must not be the
        one that points a fresh rune at the player's own base.
- [x] **And therefore no correction window on a mouse.** The 1 s window exists because a
      stroke can be misread and a finger cannot see what it covers. A player who watched
      the region light up before clicking has already confirmed the facing, so an aimed
      precise placement goes straight to the reveal. The window is KEPT for touch, for
      tap-to-place with no direction, for a pebble released outside every region — and
      always on a node whose ghost script has a `reaim` — a lesson that drills the
      correction must not vanish on a desktop. (1-1 no longer asks for one: it teaches
      the release-side gesture itself, in one move.)
- [x] **Touch gets the compass too** — sliding a thumb toward the edge you want beats a
      flick with a distance threshold in it — but KEEPS its window and its chevrons,
      because a fingertip covers the middle of the tile it is aiming and the window is the
      cheap insurance against that. The renderer leans a touch compass's marks outward,
      away from the contact patch. The flick survives on both as the correction gesture.
      `precise` therefore no longer gates aiming or drawing: it decides one thing only,
      whether the window may be skipped
- [x] **The mystery ladder.** The rank tab shows the runes you own, then exactly ONE
      silhouette — the rune the campaign hands over next, named, with the stage that gives
      it — then question marks for everything after. One concrete goal plus a visible COUNT
      of unknowns: a fully hidden item cannot be wanted specifically, and a fully revealed
      list is a chore. It also reuses the reveal the result screen already makes through
      `nextRuneUnlock`, so the two surfaces reinforce each other
  - Deliberately **not** applied to the skins panel: every skin is buyable with coins
        at any moment, so a mystery card there would hide something the player could act on
        right now and suppress the exact intent the shop exists for

### Round 7 — the reward is a gift on its own plane (2026-09-09)

The chest opened and the loot faded in under it, on a screen that scrolled. It
is now the game's set piece.

- [x] **`RewardStage`** — the plane behind the prize: a sunburst of alternating
      LIT and SHADOWED wedges (not lit-and-transparent — on a dark backdrop a
      transparent gap is just more backdrop, and the contrast is the effect),
      two counter-rotating layers masked empty at the centre so no spoke runs
      behind the prize, a bloom in the prize's own colour, and a vignette. Pure
      CSS, two composited transforms, no canvas and no per-frame JS
- [x] **`RewardConfetti`** — a pooled canvas burst in front of the prize: one
      preallocated pool, a RAF that exists only while pieces are alive and stops
      itself, DPR capped at 2, fewer pieces on a small screen, and nothing at all
      under `prefers-reduced-motion`
- [x] **The choreography** (`ChestReveal`): the tap is an event, not a fade —
      the chest takes the hit and the lid flies, a shockwave leaves it, the
      prize is born at the chest's MOUTH and climbs out onto its own plane
      overshooting as it comes, the chest shrinks and dims (giving up its
      SPACE as well as its brightness, which is what leaves room on a phone),
      and the gift lands on a floor of light
- [x] **`RuneUnlockCard` is a trophy, not a datasheet**: the stone stands on a
      lit plinth, rim-lit in its own neon, floating, with a slow gloss across
      it. The HP/ATK chips are gone — they were the tallest thing on the card
      that nobody reads at the moment of winning, and the stats are taught
      where they are used (the in-hand tooltip, the shop). Cutting them also
      makes both prize kinds ONE shape, which is what lets the card promise a
      bounded height
- [x] **It fits, and that is measured.** Every dimension is `vmin`/`vh` — the
      SHORT axis, the one that runs out in both orientations — the card is
      capped and its description clamped to two lines so a long translation
      cannot grow it, and `FReward` gained an opt-in no-scroll mode (the result
      screen keeps its scrolling default). Checked in a real browser at
      320×658, 390×844, 412×839, 667×375, 844×390 and 1440×900
- [x] Every decorative layer is `pointer-events: none`, because a tap anywhere
      on the plane is what continues — a beautiful layer that swallows it reads
      to the player as the game freezing on the reward screen

### Round 8 — the tutorial teaches the gesture the game is played with (2026-09-09)

The compass shipped in round 6 and 1-1 was still drilling what it replaced: drop
a sword facing nothing, then press it and flick it round, with the correction
window HELD open until the player copied it. That is two gestures and a second
of waiting to teach the slower way to play — the first thing a new player learns
was the fallback.

- [x] **1-1 is one move now**: the ghost carries the sword onto (1,2) and
      releases it on the LEFT side of that tile, where the skeleton stands. The
      script lost its `reaim` (`campaign.ts`, chapter 1, case 1), so no window
      is held and nothing waits for a second gesture
- [x] **The demonstration uses the player's own compass** (`drawGhostCompass`):
      the ghost's finger travels from the tile's middle to the region anchor
      `regionAnchors` reports — the same point the hit test reads, so the lesson
      and the rule cannot drift — and lights all four wedges with
      `paintAimRegion`, the chosen one grown in from its edge, leaned outward
      and rimmed heavy because the ghost is a FINGER. One painter, one look
- [x] **The touch aim hint follows the gesture**: `hints.aim.touch` was "Swipe
      to aim, release to lock" — the fallback — and now says where to let go, in
      all 21 locales
- [x] **The held window survives as a capability, not as dead weight**: the
      rule, `LESSON_REAIM_HOLD_MS` and the `mode: 'reaim'` ghost beat are all
      still there for a lesson that wants to drill the correction, and
      `tests/use/battle.test.ts` keeps its five cases by patching a synthetic
      node (`REAIM_LESSON`) instead of pretending 1-1 still does it
- [x] **Pinned**: `tests/use/ghostDemo.test.ts` (a source scan — the ghost is
      painted onto a canvas jsdom will not rasterise), the rewritten battle and
      floor cases, and the e2e onboarding flow driven with REAL pointer events,
      green on desktop and phone. 1176 unit tests, 10 e2e

### Round 9 — the tenth rune takes a stone instead of breaking it (2026-09-09)

Nine runes, nine ways of killing something — on a board that is won by HOLDING
EIGHT OF SIXTEEN TILES. The last rune plays the objective instead of the fight.

- [x] **The Crown** (`crown`, royal indigo, cardinal, HP 2 / Atk 0). On the
      placement itself, the Lv 1 rune it faces changes side — same body, same
      hit points, turned to face the way its new owner's runes face — and the
      crown is spent doing it. A stack, a friendly, an empty tile or the board's
      edge: nothing happens and nothing is paid, and the aim preview shows which
      of those it is before the pebble is released
  - **A body for a body.** Its tile empties as theirs changes hands, so the
        swing is ONE tile, not two, and nothing is left standing to crown a
        second stone. That is what keeps the last rune in the game from being
        the only rune in the game
  - **`crownTurns` reads LEVELS**, like the nuke's rule: a Lv 1 crown takes Lv 1
        stones, and only a crown stacked to Lv 2 takes a Lv 2 stack — so "can
        they steal the tower I built?" answers "only by building one themselves"
  - **The stolen stone fights the same turn.** The crown step sits before the
        blast and before every attack (`RESOLVE_TIMELINE.crown`, at 150 ms),
        which is the whole reason to spend a rune taking one rather than
        breaking it. Its going is nobody's KILL, either: no combo, no coins, no
        adaptive relief for a rune its owner chose to spend
- [x] **Never in an enemy deck**, at any chapter, and the campaign test pins it:
      having a stone you built taken and turned on you is the sourest thing
      these rules can express, and there is no counter-play to it
- [x] **4-5 gives it, 4-6 teaches it** — one chapter's play after the nuke,
      because those two are the opposite answers to a board that has gone wrong
      and meeting them together would blur both. The lesson is the only one that
      does not clear the board by breaking it: a sword with a 2-HP bow behind it
      in one file, so the crown takes the sword and the sword kills the bow in
      the same resolution. One drop, both halves of the rune, one turn, every
      seed (`tests/game/floor.test.ts`, which now reads its list off
      `LATE_LESSON_NODES` rather than a hard-coded four)
- [x] **The art**: a three-peaked crown over a heavy band with one gem cut clean
      out of it — regalia, not an implement, the way the nuker is a sign and not
      a weapon. One path, nonzero, in both the canvas glyph and the DOM icon.
      The manifest's `ui/crown` (the elite badge) became `ui/elite`: a cell id is
      a filename stem, and the manifest's own uniqueness test caught the
      collision before it could overwrite a prompt
- [x] The glyph sheet went from 3 across to 5 (two rows of ten, 1280 × 512).
      Ten tiles no tidy ratio, and of "no blank panels" and "a pretty aspect",
      the blank is the one that ruins a sheet — an image model fills it in
- [x] `runes.names.crown`, its description, its shop boost and its tutorial hint
      in all 21 locales; a rising three-note fanfare for the cue, because every
      other combat voice in the game is an impact and this one is a GAIN
- [x] **Verified in a real browser**: dragged onto 4-6's board with real pointer
      events, released on the up wedge — the skeleton changed sides at full
      health, killed the bow behind it, the crown was spent, the node was won in
      one turn, no console errors

### Round 10 — the bow, re-cut, and the art pipeline caught up (2026-09-09)

- [x] **The Bow's limb is a crescent of even thickness**, not a filled belly.
      The old one read as a bow only while a skin OUTLINED its glyph; every
      skin that FILLS one — jade's gold inlay, marble's carved ink, amber's lit
      interior, obsidian's neon — turned the belly into a solid sail with a
      stick through it, so the same rune was a bow on two materials and a blob
      on four. A stroke of steady width survives all six ways this game carves
      a glyph, which is the only test a glyph has to pass
  - **One bow, not two.** The canvas glyph and the DOM icon had drifted into
        different drawings — the icon was already a proper crescent, the stone
        was not. `glyphs.ts` now carries the icon's geometry at 100 units and
        `iconPaths.ts` the same at 24, so the stone in the hand and the icon on
        the unlock card are the same object
  - The arrow crosses the WHOLE box, diamond flight to broad head. That
        horizontal axis is what says "this one flies past the tile in front of
        it", and it stops the bow reading as a letter D
- [x] **Prompts and reference sheets regenerated and exported** — 25 sheets, 238
      singles. Ten new files for the late runes (a player sheet and an enemy
      sheet each for the axe, boulder, mortar, warhead and crown), the archer's
      two sheets redrawn, and the glyph sheet re-laid at 5 across
- [x] The Bow's prompt now names the shape explicitly ("a crescent of EVEN
      thickness bulging right, never a filled belly"), because the returns
      copied the ambiguity faithfully the first time

- [x] **The stale paintings cannot ship or come back.** The twelve
      `archer-*.webp` stones were removed — the renderer falls back to the
      drawing, which is the corrected bow — and the three paintings that are
      pictures of a drawing that has since moved (the bow's player and enemy
      sheets, and the glyph sheet at its old 3×3 lattice) are parked in
      `painted/stale/`, which the slicer does not read. Proved with `?art=on`:
      painted tiles, frame and swords, a DRAWN bow, no console errors
- [x] **The slicer will not re-install a painting of a drawing that moved.** A
      successful slice writes `painted/.sliced.json` — the revision of the
      reference each file was cut against, a sha1 over the clean sheet — and a
      painting whose reference has changed since is refused with the reason.
      `--stale-ok` cuts it anyway. Without a receipt (a clone, a first run)
      nothing is refused: a checkout rewrites mtimes, so an older-looking file
      is a warning and the slice goes ahead
  - This is the bug the bow found. Nothing in the pipeline noticed that a
        drawing had been re-cut under a painting, so the next `art:slice` for
        an unrelated sheet would have put the old silhouette back, silently
- [x] **A uniform drift is no longer thrown away.** A lattice sheet's rects are
        read per axis (`c.x * sx`, `c.y * sy`), so a return whose proportions
        came back 1.1% out still lands every panel on its own content — and was
        being refused as "the model re-composed the grid", which cost five
        painted enemy sheets. Sheets now get a 6% allowance (strips and walks
        keep their 15%), and a grid that really was re-composed still fails: the
        re-laid glyph sheet misses by 19%. The dry run went from 9 refusals to 1
- [x] **`pnpm art:prompts` writes `PAINT-STATUS.md`** — every sheet, the prompt
      file its block lives in, its reference revision, and which of four states
      it is in (sliced / repaint / painted-but-unreceipted / outstanding). What
      to paint next was detective work before; it is a table now

**What is left for the image model** (nobody can generate art here): repaint the
bow's two sheets and the glyph sheet from the new references in `art-sheets/`,
drop the returns in `painted/`, and run `pnpm art:slice`. `PAINT-STATUS.md`
names them, and the ten late-rune sheets that have never been painted at all.

### Round 11 — the audio has a room, a key and a band (2026-09-09)

Forty synthesised cues, each mixed on its own, each connected straight to
`ctx.destination`, each tuned by ear in raw hertz. Every one of them was fine
alone. Together they were a pile.

- [x] **One room, one master** (`src/use/audioBus.ts`). A convolution reverb on
      an impulse built in a millisecond (noise under an exponential decay,
      darkened as it falls, behind an 18 ms pre-delay), a 3:1 glue compressor
      and a `tanh` soft clip across the sum, and a −3.5 dB shelf over 6 kHz.
      Every voice sends a little of itself to the room — a click almost none, a
      bell a lot — so a slate crack and a cello sound like they are in the same
      place. Missing a node type on an old browser costs that stage and nothing
      else: a dry mix, never silence
- [x] **Everything is in one key.** The music is D minor, so every pitched cue
      is now drawn from `NOTE()` — a degree of that scale — instead of a
      hand-picked frequency. Before: `merge` was a C major arpeggio, `capture` a
      G major triad fired up to eight times in a settle wave, `victory` in G,
      `crown` in C. Any one is fine; underneath a track in D they are a chord
      nobody wrote, and that is what "the sounds are annoying" means when a
      player cannot say why
  - The harsh ones went with it: `aim` was a square wave at 2.4 kHz — where a
        phone speaker is worst and the ear most sensitive — and is a triangle on
        the top D; `tickFinal`, `hover`, `shield`, `heal` and `merge` are struck
        BELLS now (one shared `bellTone`), which is what makes "something was
        gained" one recognisable family
  - `tick` climbs the SCALE over the last seconds (A, B♭, C, D) rather than
        sliding: the countdown is a melody the player learns
- [x] **"Emberlight"** — a 60-second loop for piano, violin, cello and hand
      percussion, written as a SCORE (`src/game/music.ts`) and performed by
      `useMusicEngine`. 16 bars of 4/4 at 64 BPM is exactly 60.000 s
  - **Seamless because nothing restarts.** A look-ahead scheduler walks the
        beat count forever and wraps it, so the piano's decay, the cello's
        release and the reverb tail all cross the join. The composition does the
        rest: bar 16 is the dominant (A) and bar 1 the tonic it resolves to, the
        violin is gone by bar 15, and the last two bars are the quietest in the
        piece
  - **The instruments are built, not sampled**: a piano of three partials at
        1 / 2.01 / 3.03 (a struck string is stiff — that inharmonicity IS the
        piano) with a noise hammer; bowed strings of two saws six cents apart
        under a filter that opens as the note speaks, with vibrato that fades in
        after a quarter second; a shaker, a frame drum and a wood tick
  - **One borrowed chord**: bars 12 and 16 are A major, whose C♯ is outside D
        minor. That single accidental is the whole mystical colour — a loop that
        never leaves its own scale is cozy but flat
  - It is the default track; the two inherited `.ogg` loops are still there for
        anyone who prefers them, and the mute gates apply to both (the
        procedural one was the easier one to forget — a test now says so)
- [x] **Measured, not asserted.** A browser harness (`__audioBus` / `__music`,
      DEV-only seams) taps both buses before the limiter and reports numbers:
      70 s of music at 10 Hz — **0 silent samples, 0 clipped**, peak 0.082, and
      the join at 60 s carries MORE energy than the piece's quietest moment, so
      there is no hole in it. The ten-second profile shows the arrangement's own
      arc (0.0075 alone at the top → 0.0104 under the violin → 0.0082 as it
      falls away). Then every cue fired one at a time: nuke 0.32, place 0.24,
      down to hover 0.013 — a 25× range, nothing silent, nothing clipped

### Round 12 — the first frame gets a mark and a mascot (2026-09-10)

- [x] **The logo, not the word.** The splash showed `t('gameName')` set in the
      UI font; it shows the painted mark now — a carved slab with the name in
      hot runic letters. The press kit's files are SQUARE canvases with 60 % of
      their pixels transparent, which sized by width would have pushed the card
      apart, so `wordmark.webp` is that mark trimmed to its own alpha bounds
      (640 × 232, 34 kB) and the square icons went to `public/images/logo/`,
      where the PWA manifest has been naming the PREVIOUS game's mark all along
- [x] **The Keeper.** The greeting was an ellipse with a sword glyph on it. It
      is a character now: a hooded figure in a torn cloak, one hand on a staff
      whose rune stone is the only light in the picture, a second rune at the
      belt, eyes that blink on a long clock, three embers off the stone
  - It is inline SVG in BOTH the component and `index.html`, because the
        static splash paints before a single request returns — and the two are
        translated from one source rather than typed twice, which is how they
        stayed identical through a redesign this size
  - The one bitmap on the card is the logo, which may arrive a beat late: the
        hero is already lighting the screen, and both splashes name the same URL
        so the browser has it cached before Vue mounts
- [x] **He is in the art pipeline** (`sheet-splash.png`, prompt in
      `PROMPTS-BOARD.md`): the SVG baked to `public/images/heroes/keeper.webp`
      is the reference a painter restyles. The splash will keep drawing its own
      — a painting of him is for the campaign map, the result screen and the
      store tiles, and the splash can adopt it later behind a fade

### Round 13 — the stones are carved plaques (2026-09-10)

- [x] **A new silhouette, `plaque`**, and it is what a new player now holds: a
      rounded triangle with its point at the TOP and a wide round base, exactly
      symmetric, drawn from three Bézier segments and mirrored. The first
      control point is the whole shape — at x = 0.12 the curve leaves the apex
      almost vertically and the top is a point; the first attempt had it at
      0.40 and the plaque came back an egg
  - It draws no random numbers at all. Every plaque is the same plaque, which
        is what makes it read as MANUFACTURED where the pebble, the shard and
        the slab read as found — and those five keep their own irregular cuts
- [x] **A carved border with a sunken field** (`paintFrame`), the structure the
      reference is really about. It is drawn as the INVERSE of the body's own
      bevel: the stone has a light edge at its top-left and a dark one at its
      bottom-right, and the field gets a dark edge at ITS top-left (the rim
      casting a shadow into the hollow) and a light one at its bottom-right
      (light bouncing off the far wall). Four strokes, and a flat sprite has
      depth
  - Plus one honest cheat: a faint even lightening of the rim band all the
        way round, because a border the eye can only follow for half its length
        is not a border
  - The glyph is refitted for it — 0.90 R instead of 1.14, and a tenth of a
        radius lower, because the apex takes the top of the box and the field's
        optical centre is below the geometric one
- [x] **The knock-ons, all of which were silent until a test said otherwise:**
      the Lv 2 laurel hugs the stone's silhouette, so the set of wreaths is the
      set of shapes the SKINS cut — it was a hand-written list containing
      `pebble`, and is now read off the roster in the manifest, the preloader
      and the test. The river prompt's shape sentence, `LAUREL_STONE`, the art
      catalogue and the GDD's stone diagram all moved with it
- [x] **The six stale river paintings were removed** (`melee`, `mage`,
      `defense` × Lv 1/Lv 2) so the game draws the new shape; the river pair of
      those three sheets needs a repaint, and `art-todo.md` says so. The other
      ten panels of each sheet are untouched — the change was one skin
- [x] Verified in a real browser: every player stone on the board and in the
      hand tray is the plaque, the HP pips and the facing arrow still clear it,
      and the Lv 2 gold rim and laurel follow the new outline. (A first look
      showed painted pebbles beside drawn plaques — an earlier probe had left
      `?art=on` remembered in that profile. Very convincing, not a bug.)
- [x] **…and then three more skins joined it.** Jade, amber and marble were an
      oval, a hex and a disc; they are cuts of the same plaque now, which makes
      the four of them a FAMILY — one geometry, four sets of numbers, so a
      player reads them as relatives and still tells them apart in the tray:
  - **jade** a polished pendant (the point softened, the edges worn round);
  - **amber** the same silhouette CUT rather than polished — the outline is
        sampled at 3/5/2 points instead of 9/14/8, so the curve comes back as
        visible FLATS and the light breaks along an edge. Same maths, different
        resolution: the cheapest facet in the business;
  - **marble** a quarried tablet, the broadest and heaviest, a shallow point
        over a nearly flat base.
  - Obsidian and ember stay RAW — a knapped shard and a cracked slab, no
        border at all. A roster where every stone is carved has nothing left to
        say about the two that were never carved
- [x] Twenty-four more painted stones removed (the river, jade, amber and
      marble pairs of `melee`, `mage` and `defense`), leaving only their
      obsidian and ember panels standing. Those three sheets are worth
      repainting whole — eight of twelve panels changed — and `art-todo.md`
      says so

## 3. Known trade-offs / follow-ups

* The leaderboard worker is reused unchanged: `score` = best node reached,
  `squad` column = best win streak. Both baked boards (`data/leaderboard-seed.json`,
  `data/leaderboard-snapshot.json`) were regenerated for nodes/streaks; give the
  Worker a fresh D1 before launch (see `worker/SETUP.md`).
* `.env.development` empties `VITE_LEADERBOARD_URL` so localhost never hits the
  Worker's CORS wall; dev and the e2e suite run on the baked board.
* `scripts/portal-qa.mjs` now proves the loop on the match clock
  (`window.__glyphyx.battle.view.ageMs`, published when `localStorage.cheat` is
  set) and uses a trusted tap instead of the old steer drag; run it against a
  built bundle before a portal submission.
* Painted art is still procedural: the pipeline is in place (`pnpm art:prompts`
  → `pnpm art:export` → paint → `pnpm art:slice` → `/#/playground`), see
  `art-sheets/README.md` and `art-todo.md`; keep `VITE_ENABLE_ART_OVERRIDES`
  off until paintings exist. The PWA logo files are still the previous game's mark.
* The leaderboard Worker under `glyphyx-leaderboard.hyperg8.workers.dev` answers
  404 until it is deployed from a logged-in shell (`worker/SETUP.md`); the client
  already speaks its wire shape and shows the baked board meanwhile.
* Renderer nits to judge with real art: the Lv 2 crest sits as a diagonal tag at
  the stone's top-right edge (the reference had a bottom emblem); enemy tiles
  keep the FACTION colour rather than a universal red. `CampaignModal`'s reward
  column still uses icon glyphs, not `PebblePreview`.
* Dev seams: `window.__glyphyx = { battle, campaign, economy, streak, skins,
  overlays, winNow, layout, stripRoom }` and `window.__arena`; `localStorage.cheat`.
* Follow-ups after round 3: the campaign map's reward column still uses icon
  glyphs; Yandex could report an explicit no-fill so the paced clock refunds
  instantly (the 6 s never-opened cap covers it today).
* The player hero strip (`heroes/teal.webp`) is catalogued but not yet drawn
  anywhere — reserved for the campaign map / result screen.
* Round 4 follow-ups: the mortar is the rune to watch. On a 4×4 board a shell
  only lands when it is placed on the rank furthest from its target, so a
  player who plants it anywhere else gets a rune that does nothing. 3-2 teaches
  the right placement and the aim preview shows an empty footprint from the
  wrong one — but that rule is the least forgiving thing in the roster, so
  watch it in a real playtest.
* The late lessons replace three generated fights (2-2 and 2-6 were sieges,
  3-2 a siege), which is why `tests/game/campaign.test.ts` skips
  `LATE_LESSON_NODES` in its duel/siege alternation check and reads the
  chapter-3 deck widening off 3-3 instead of 3-2. A save fixture or an e2e that
  needs a planning CLOCK must now avoid nodes 10, 14 and 18 as well as 1–6.
* `npx biome check` aborts on a pre-existing configuration error (`biome.json`
  lists `useVue*` rules the installed Biome does not know). It fails the same
  way on an untouched tree, but nobody can lint until it is fixed.
* The art manifest's largest gap is now the 63 files of the three new runes
  (21 each: 12 player stones, 8 enemy stones, 1 glyph) — see `art-todo.md`.
