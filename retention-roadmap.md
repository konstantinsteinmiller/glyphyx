# Glyphyx — retention roadmap

Eighteen features, ranked by *impact per hour of work*, aimed at four numbers:

* **D1** — do they come back tomorrow?
* **APT** — average playtime per session (target: 10–20 min, i.e. 8–15 matches)
* **Pick-up** — how fast a stranger understands drag → swipe → reveal
* **Put-down resistance** — how hard it is to stop after a result screen

Each item names the metric it moves, the concrete implementation against the
files that exist today, the effort, and the risk of it backfiring. Nothing here
needs a new engine: everything sits on `src/game/*` (pure rules), `useBattle`,
`useCampaign`, `useArenaArt` and the F-component design system.

> **Read this first.** The two numbers that decide everything below are the
> ones the tutorial nodes already optimise: time-to-first-win (< 15 s on 1-1)
> and the reward cadence (a chest every ~45 s through 1-3). Re-measure both
> after ANY change to `campaign.ts` — a roadmap feature bolted onto an opening
> that lost its first win is worth nothing.

---

## Tier 1 — build these first (highest impact, ≤ 1 day each)

### 1. Auto-advance on the result screen
**Moves:** put-down resistance, APT · **Effort:** 2 h · **Risk:** low

A result screen is a full stop. The next match should start before the decision
to stop is made.

*Implementation:* in `GameScene.vue`, after the chest sequence, draw a thin
radial timer on the primary action (`FButton` gets an `autoAfterMs` prop that
paints a conic ring under the glyph) and fire `battle.nextNode()` /
`battle.retryNode()` when it completes, cancelled by any pointer-down anywhere.
Keep it off on the first three result screens (the player is still reading).
Measure: matches per session.

### 2. "One more turn" undo of a mis-drop, once per match
**Moves:** pick-up, D1 · **Effort:** 3 h · **Risk:** low

The single most common first-session frustration in drag-to-place games is a
pebble landing one tile off. A committed placement cannot be taken back today.

*Implementation:* `useBattle.endDrag` already knows the last committed move;
add `undoLast()` that is legal only while `phase === 'reveal'` and
`reveal.elapsedMs < 250` (before the arrows have fanned out) and only once per
match (`undosLeft` on `MatchState`). Show a small "↶" chip next to the hand for
that window. The AI's hidden move is unaffected (it was decided at planning
start), so there is nothing to re-plan.

### 3. Milestone chests every 4 nodes on the campaign map
**Moves:** D1, put-down resistance · **Effort:** 3 h · **Risk:** low

> **Half of this shipped (2026-09-09).** The RUNE half is built: the campaign
> now hands out three more runes (axe 2-1, boulder 2-5, mortar 3-1) and
> `NextUnlockTeaser` advertises the next one — stone, name and "Win Stage 2-1
> for" — on the result screen and above the campaign map, off the
> `nextRuneUnlock` selector in `useCampaign`. Still open: the same treatment
> for the SKIN milestones (nodes 4 and 8 of each chapter), the "2 stages to go"
> counter, and the chest chip on `ConquestBar` / `StageBadge`.

A goal 2–3 stages ahead is the cheapest way to stop a session ending at 1-5.

*Implementation:* `campaign.ts` already marks every 4th and 8th node with a
skin; surface it BEFORE it is reached: `CampaignModal` and `StageBadge` show a
chest chip with "2 stages to go" (`t('campaign.toGo', { n })`), and
`ConquestBar` grows a tiny chest icon at its end on the node before a milestone.
Persist nothing new — it is all derivable from `bestNode`.

### 3b. Rune ranks + the rotating free upgrade — **SHIPPED 2026-09-09**
**Moves:** D1–D7, put-down resistance · **Effort:** done · **Risk:** low

Not on the original list, and it turned out to be the strongest item on it: a
permanent per-rune upgrade ladder (5 ranks, +1 max HP each, 70→560 coins) gives
the coin economy a floor-less sink — 12 510 coins to fill — and the **rotating
free upgrade** gives the player a reason to open the app that is not a match.
One rank, on one rune, free; another rune drawn every 20 minutes; the window
comes off the clock, so it keeps turning while the game is shut and cannot be
farmed by reloading. A rank can also be bought with one rewarded video.

*Watch:* whether the 20-minute cadence is right. It is a session-shaped number
(come back after a coffee), not a day-shaped one — if the D1 lift shows up but
D7 does not, the next thing to try is a second, slower gift on a daily window
rather than shortening this one.

### 4. Daily first-win double gold
**Moves:** D1 · **Effort:** 2 h · **Risk:** low

The classic D1 hook, and it needs one key.

*Implementation:* `gx_first_win_day` (`'YYYY-MM-DD'` in the player's timezone,
same helper as the forge uses) in `keys.ts`; `useBattle.finishMatch` doubles
`coins` when the day differs and stamps it. Show it on the result screen as a
gold "First win today ×2" pill (`t('result.firstWin')`) and, on boot, a small
"×2 waiting" badge on `StageBadge` so the player knows before they play.

### 5. Streak insurance for one loss
**Moves:** APT, put-down resistance · **Effort:** 2 h · **Risk:** medium (softens the streak)

A five-win streak that dies to one bad clash is a session ender. Let the player
keep it ONCE — behind the rewarded ×3 button's sibling.

*Implementation:* on a loss with `streak ≥ 3`, `presentResult` offers a second
rewarded button "Keep streak" (same `claimReward` gate, `RewardAdIcon` first);
granting calls `useStreak.restore(prev)` (new; writes `STREAK_KEY` back).
Cap at once per streak via `gx_streak_saved` = the streak value it was used at.

---

## Tier 2 — the session-length engine (1–2 days each)

### 6. Endless "Gauntlet" mode after chapter 1
**Moves:** APT, hard-to-put-down · **Effort:** 1 d · **Risk:** low

The campaign is finite per session; a mode that scales forever is not.

*Implementation:* `campaign.ts` already generates chapters from the node id, so
a gauntlet is `nodeConfig(1000 + n)` with `ai` stepping easy→brutal every 3
nodes and coins ×1.1 per node. Expose it as a second entry on `CampaignModal`
("Gauntlet — best: 7") once `bestNode ≥ 8`; store `gx_gauntlet_best`. Post it
to the leaderboard as a second score column later (see 15).

### 7. Boss factions with a signature rune
**Moves:** APT, D1 · **Effort:** 1 d · **Risk:** medium (balance)

Chapter-end sieges are the same three factions with a bigger chest. Give the
8th node a boss commander with one rune the player cannot own yet.

*Implementation:* add `flame` (a mage variant whose Lv 2 explosion leaves a
burning tile that deals 1 per turn) to `RUNES` gated by `EnemySetup.deck`, a
`FACTION_DEFS.boss` avatar (the `marrowknight` strip is unused so far), and a
`presets` opening for the boss node with two Lv 2 runes already standing. The
GDD's Phase 2 hybrid runes start here.

### 8. Rune mastery: per-type kill counters that unlock a cosmetic glow
**Moves:** APT, D1 · **Effort:** 4 h · **Risk:** low

Long-term goals that cost nothing to balance.

*Implementation:* `gx_mastery: Record<RuneType, number>` counting shatters per
attacking type (the `shot` / `explode` events carry `from.type`). At 25 / 100 /
250 kills the glyph gets a stronger `glow` tier in `useArenaArt`'s pebble bake
(`bakePebble(type, level, owner, skin, masteryTier)`). Show progress bars in a
"Runes" tab of `SkinsModal`.

### 9. Turn replay scrub on the result screen
**Moves:** pick-up, APT · **Effort:** 1 d · **Risk:** low

Players who lose without understanding why quit; players who see the beam that
killed them learn.

*Implementation:* `useBattle` keeps the last match's `TimelineState[]` (board
before/after + events per turn, already produced). The result screen gets a
"Replay" glyph that re-plays the last two turns on the canvas at 0.6× speed
using the same `timeline` path the live game uses — zero new renderer code.

### 10. Rival name and taunt line on the enemy badge
**Moves:** pick-up, put-down resistance · **Effort:** 3 h · **Risk:** low

A faction is a deck; a rival is a person. Naming the enemy commander turns a
loss into a grudge.

*Implementation:* `FACTION_DEFS` gains `names: string[]` per faction (locale
keys `factions.names.orc.*`), picked by `seedFrom(nodeId)`; `EnemyBadge` shows
it, and the `TurnBanner` says "vs Grukk the Berserker". On a rematch after a
loss the banner adds `t('banner.rematch')`.

---

## Tier 3 — conversion and feel (½ day each)

### 11. Haptic language for every beat
**Moves:** pick-up · **Effort:** 2 h · **Risk:** none

`navigator.vibrate` is already the GDD's "haptic snap". Give each cue its own
pattern: place `[12]`, merge `[8, 20, 24]`, shatter `[30]`, victory
`[20, 40, 60]`. One map in `useGameAudio` next to `SAMPLE_CUES`, called from
`playFx` when `power` passes the throttle.

### 12. Smart hand: never three identical, never zero legal moves
**Moves:** pick-up · **Effort:** 2 h · **Risk:** low

`hand.ts` already avoids triples. Extend `fillHand` to reject a hand whose
every rune has zero legal placements (possible late in a siege) and to bias the
third slot toward a type the board has a stack target for — a visible merge
opportunity every few turns is what teaches stacking without a hint.

### 13. Pre-round "threat" preview on long-press
**Moves:** pick-up · **Effort:** 4 h · **Risk:** low

While dragging, the renderer shows the attack cone of the rune being placed.
Add the same cone for ENEMY runes on a 400 ms long-press of a tile
(`useArenaInput` → `battle.peek(cell)`), so a player can read what will fire
at them before committing. Free depth, no new rules.

### 14. Better first-loss recovery: "Rally" node relief
**Moves:** D1 · **Effort:** 3 h · **Risk:** medium

Losing the same node three times is the churn point. Copy the Survivalist
relief curve: `gx_failed_nodes: { [id]: n }`; `nodeConfigFor` lowers the AI a
level after 2 losses and reduces `atkMul` by 15 % after 3, never announced
mid-match, reset on a clear.

### 15. Leaderboard as a "beat your rival" chip
**Moves:** put-down resistance · **Effort:** 3 h · **Risk:** low

The rank chip says "#1130 of 2345". Make it a target: after every match show
the NEXT player above on the board ("Runeseer481 · stage 1-7 — 1 to go") using
the `dist` histogram already in `useLeaderboard`. No new backend.

### 16. Weekly rotating modifier ("Runic Tide")
**Moves:** D1 (weekly), APT · **Effort:** 1 d · **Risk:** medium

One rule tweak per ISO week, applied to the Gauntlet only: "beams reach 3",
"clashes always kill both", "Lv 2 costs a turn". `rules.ts` gains a
`Modifier` type consumed by `resolve.ts` through `ResolveOptions`; the week id
is `seedFrom(year, week)`. Show it on the map with a timer.

### 17. Share the winning board as an image
**Moves:** conversion · **Effort:** 3 h · **Risk:** low

`useArenaArt` can render the final board to an offscreen canvas at 1080×1080
with the stage, streak and "Glyphyx" wordmark; `navigator.share({ files })`
where available, else a download. Portal builds gate it behind
`capabilities.canShare` (Poki forbids external requests, but a local PNG is
fine).

### 18. A second currency-free progression: commander levels
**Moves:** D1, APT · **Effort:** 1 d · **Risk:** low

XP per match (win 30, loss 10, +5 per kill) into `gx_xp`; levels unlock cosmetic
board frames (drawn in `useArenaArt`, four variants) at 5 / 10 / 20 / 35. One
currency stays one currency (Poki-safe), yet every match moves a bar.

---

## Measuring

* `useBattle.onEvent` already emits `matchStart` / `matchEnd` / `placed`; a
  20-line `useTelemetry` that counts matches per session, time-to-first-place,
  result-screen dwell and reroll use into `sessionStorage` is enough to A/B any
  item above against a `?variant=` flag on a portal that allows it.
* Re-run `tests/game/ai.test.ts`'s 200-seed fuzz after every rule or AI change;
  it is the cheapest proof that a new rune did not create an unlosable line.
