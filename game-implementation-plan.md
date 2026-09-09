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
8. **The lesson's held window** (1-1): the ghost drops the sword WITHOUT a swipe
   and then presses it and flicks left (`GhostSpec.reaim`); the player's own
   first window holds (`lock.held`, ghost `mode: 'reaim'`) until the sword faces
   left, capped by `LESSON_REAIM_HOLD_MS`.
9. **Short phones**: below 40 px of strip the control pill borrows the stage
   badge's slot like the rune card does (the card outranks it), so nothing ever
   sits on the top row of tiles.

### Campaign

Chapter 1 is authored (onboarding), later chapters generated:

| Node | Lesson (ghost script) | Board | Chest |
| --- | --- | --- | --- |
| 1-1 | `drag` — sword → (1,2), dropped facing up, then re-aimed LEFT (the held window teaches the correction) | 1-HP skeleton at (0,2) | 15 coins + Bow |
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
- [x] 1-1 teaches the re-aim: ghost drops + flicks left, the window holds until the player turns it
- [x] Tap-to-place (select → tile, 2.5 s window), arrows / WASD / Q E Z C, tappable chevrons
- [x] Chest step stays: tap or 8 s auto-continue with a draining bar; lessons hand over from it
- [x] Roomy desktop enemy preview; rune tooltip while held/selected, retired after 6 uses (`gx_rune_uses`)
- [x] Adaptive stall-breaker after 75 s; power-rune boons (Lv 3 first placement)
- [x] Shop (`ShopButton` → Power Runes / Skins tabs): 180 coins or a rewarded video each; skins by rewarded video
- [x] The goal explained without text: conquest rail with a crown at 8 + tap tooltip; `GoalIntro` once on the first conquest match (`gx_goal_seen`)
- [x] Ads: 121 s paced interstitials (`showPacedInterstitial` at match end, next node, the map), `watchRewarded(reason)`
- [x] VFX: `arenaFx.ts` baked-sprite effects wired into the resolution, no per-frame `shadowBlur`
- [x] e2e: held 1-1 window (key on desktop, flick on touch), loot stays, tap-to-place + chevron, goal intro
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
- [x] **The teaser** (`NextUnlockTeaser`, `nextRuneUnlock`): "Win Stage 2-1 for" + the stone itself
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
      70/140/240/380/560 (`RANK_PRICES`): 1390 a rune, 12 510 for the roster.
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
