# Glyphyx — performance experiment ledger

Every performance change is a hypothesis that has to beat the un-optimized path
on the target device profile before it ships. **Null results are the valuable
rows** — they are what stops the same idea being re-tried next project.

Procedure: the user-level `web-game-performance-optimize` skill.
Seams: `src/use/perfVariants.ts` (boot-frozen flags), `src/use/usePerfProbe.ts`
(`window.__perf`), `scripts/perf-ab.mjs` (interleaved A/B/A/B over CDP).

---

## The budget

| | |
|---|---|
| **Target device profile** | mid-range 2021 Android, Chrome. Desktop proxy: **4× CPU throttle, 412×915, DPR 2, mobile + touch**, headed Chrome on a private profile |
| **Target** | 60 fps ⇒ **16.7 ms/frame** |
| **Primary metric** | median-across-reps of each rep's **`drawMean`** (mean ms in the draw phase). Was p95 work-per-frame until 2026-09-10, when an A-vs-A null test showed the p95 swinging ±25 % between identical arms |
| **Veto metrics** | RAF interval p95 (GPU backpressure), long tasks, heap slope, boot time, the test suite |
| **Scenario** | continuous play from boot through several turns — planning clock, reveal, resolve VFX |
| **Build** | **production** (`vite build`, obfuscated), served from a local static server. Never the dev server |
| **Pinned** | `?tier=high` (quality ladder frozen) + a fixed node-7 save fixture + seeded `Math.random`. Without all three the runner cannot tell two identical arms apart |

`--throttle 6` is used as a "worst phone that must still run" check. It is much
noisier: at 6× the baseline's own spread routinely spans a factor of two, so
nothing short of a disjoint result means anything there.

---

## 2026-09-09 — `resize-rebake-legacy` — **SHIPPED**

**Hypothesis.** `GameScene`'s 1 s HUD-inset re-measure calls `renderer.resize()`
on every tick, and `resize()` unconditionally drops `backdrop`, `plate`, the
mote field and every gradient ramp. So a measurement that found the HUD exactly
as tall as it was a second ago still pays a full-screen backdrop re-bake. Making
`resize()` a no-op when width, height, DPR and all four insets are unchanged
should cut p95 work-per-frame by ≥ 10 % and roughly halve long tasks.

**Instrumented evidence, before the fix** (25 s capture, 4×, unminified build):

```
getImageData          96 calls   1455 ms   (3 per backdrop bake -> ~32 bakes / 25 s)
bakeBackdrop                     1590 ms   5.1 % of all CPU, ~17 % of render time
canvas elements created     59-106 per 10 s, in EVERY 10 s window, forever
```

A 10-minute-long window-by-window count settled it: `getImageData` was **exactly
30 per 10 s in every window**, not a startup cost. One full-screen (618×1373,
~3.4 MB) canvas allocated and discarded per second, for the whole session.

**Result** (`perf:ab --a "perf=resize-rebake-legacy" --b "" --reps 5 --frames 900 --throttle 4`):

```
median-of-rep workP95   A 13.500 ms  ->  B 11.900 ms   (-11.9 %)
paired wins for B       4/5 reps
long tasks              A [47,33,42,41,47] med 42  ->  B [11,20,26,24,21] med 21   DISJOINT
RAF interval p95        A 33.40 ms -> B 33.00 ms
heap slope              A 0.4 KB/f -> B 0.4 KB/f
```

The headline is the long tasks, not the 11.9 %: every B rep sits below every A
rep, and long tasks are what the player feels as stutter. A follow-up run with
the fix in *both* arms put the new baseline at workP95 ≈ 8.5 ms and
**intervalP95 17.2 ms — 60 fps, where it had been pinned at 33.4 ms / 30 fps.**

**Verified after:** `getImageData` 96 → **3** for a whole session; `bakeBackdrop`,
`bottomColourOf` and `bakePebble` no longer appear in the profile at all.
1216 tests pass.

**VERDICT: keep.** Flag and legacy branch deleted.

---

## 2026-09-09 — `counter-text-legacy` — **REVERTED (null result)**

**Hypothesis.** `drawCounters` redraws both conquest pills every frame — plate,
border and four `drawText` calls. Each `drawText` assigns `ctx.font`, and
`set font` measured **2249 ms in a 25 s capture (7.3 % of all CPU)** because
Chrome re-parses the CSS font shorthand and re-resolves the `Angry` face on
every assignment. Baking each pill into a sprite keyed by its text should
remove 4 font sets, 4 stroke+fillText and 2 stroked round-rects per frame, for
≥ 10 % off p95.

**Result.**

```
4x throttle:  median-of-rep workP95   A 8.500 -> B 9.100 ms  (+7.1 %)   2/5 paired wins
6x throttle:  median-of-rep workP95   A 26.500 -> B 22.200 ms (-16.2 %)  2/5 paired wins
              ranges  A [14.700, 34.600]  B [17.300, 41.600]  overlapping
```

**Why it is a null and not a win.** At 4× it was a small regression. At 6× the
median moved 16 % the right way, but A's own reps span 14.7–34.6 ms — a factor
of 2.4 — so the effect is far inside the noise floor, and B won only 2 of 5
paired reps, worse than a coin flip. The rule is "below the noise floor, prefer
the simpler code."

**What it probably traded.** The bake replaces cheap-ish text with one large
alpha-blended `drawImage` per pill per frame, and the cache key includes the
tile count, so the sprite is re-baked every time a tile changes hands.

**The underlying cost is still real and still unattacked.** After the resize fix,
`drawCounters` is the single most expensive thing the renderer does:

```
drawCounters   13.2 % of total CPU     (~39 % of all render time)
  drawText     13.3 %
    set font    9.5 %                  6 font assignments per frame
```

Anything tried here next must beat the noise floor to ship. Ideas not yet
measured: reuse one font string for all six texts (removing the *change*, not
the assignment); draw the counters into the DOM HUD instead of the canvas.

**VERDICT: revert.** Branch and flag deleted; the code is back to the simpler path.

---

## 2026-09-09 — DOM HUD CSS animations — **DIAGNOSTIC, product decision pending**

Not a variant — a measurement of what the HUD costs, to size the prize before
anyone spends effort on it. Same build, interleaved arms, 16 s captures, 4×.

```
arm         workP95  intervalP95  longTasks  UpdLayoutTree  Layerize  Paint
full            8.4         17.2          6           994       891     729
noanim          6.7         16.9          1            10        35      11
nofilter        8.7         17.2          0          1080       918     790
nobackdrop     10.0         17.6          4          1061      1017     780
noshadow       10.6         17.6          1          1062       995     774
promote         8.6         17.2          0          1100       986     745
```

- **Only `noanim` removes it** — killing `animation`/`transition` takes style
  recalc from ~1000 ms to 10 ms per 16 s, layerization 891 → 35, paint 729 → 11.
  A ~99 % reduction, consistent across every rep.
- Killing `filter`, `backdrop-filter` or `box-shadow` changes **nothing**. The
  cost is the animations themselves, not the effects they animate.
- **`promote` — `will-change: transform, opacity` on every element with a
  running animation — changes nothing either.** Compositor promotion is not the
  fix; Blink still recalculates style for an animating element every frame.

**Seven** animations run continuously during normal play:

| animation | element | animates |
|---|---|---|
| `coin-shine` | `.coin-badge::before` | `background-position` — never composited, repaints every frame |
| `forge-bob` | RuneForge | `transform` |
| `forge-glow` | RuneForge | `opacity` |
| `forge-spark` | RuneForge | `transform` + `opacity` |
| `enemy-walk` | `.enemy__strip` | `transform` (steps(8) walk cycle) |
| `hint-breathe` | `.control-hint__pill` | `opacity`, on a `backdrop-filter: blur(3px)` element |
| `shop-gift-pulse` | `.shop-button__gift` | — |

Three of the seven are on one small widget (RuneForge).

**Size of the prize:** ~2.7 s of main-thread style/layer/paint per 16 s of play
≈ **17 % of one core**, permanently, for decorative HUD motion.

**This is a fidelity decision, not an optimization** — the only measured remedy
is running fewer animations. It belongs to the product owner, not to this
ledger. The obvious shape if it is taken: gate decorative HUD animations on
`renderScaleTier`, so `low`/`min` devices get a still HUD and `high` keeps it.
`coin-shine` should move from `background-position` to `transform: translateX`
regardless — same look, and it is the one clearly non-composited property here.

---

## 2026-09-09 — probe publish cadence — **harness fix, not a game change**

`installPerfProbe` republished `perfSummary()` every 250 ms. That is five
percentiles, each copying the 10 000-entry ring buffer into a fresh `Array` and
sorting it — **~3 % of total CPU in a 25 s profiled run, and it grows with run
length**, so a longer run measured worse than a short one purely from
instrumentation. Cadence is now 1 s; the A/B runner polls at 500 ms and only
ever uses the final value, so nothing is lost.

Only ever active with `?perfprobe=1`, so no player was affected — but it was
biasing every experiment above, in both arms.

---

## 2026-09-10 — the harness itself — **three fixes, and an honest noise floor**

Before running any more experiments, the instrument was calibrated by running
the runner with **both arms identical** (`--a "" --b ""`). It should report
"no difference". It did not:

```
A-vs-A, workP95, 4 reps      A 10.500 -> B 13.050 ms   (+24.3 %)   "3/4 wins"
```

An instrument that reports ±25 % between two identical arms cannot adjudicate a
10 % change — and it had already been trusted to reject one. Three causes,
fixed in order:

1. **Nothing was pinned.** Every rep booted fresh at node 1-1, advanced through
   matches at its own pace, and rolled its own hands and particle bursts. The
   runner now seeds `localStorage.glyphyx_state` with a fixed mid-campaign
   fixture (node 7 — the lesson nodes are clockless and would measure a
   different game) and replaces `Math.random` with a seeded mulberry32 before
   any app code runs. `--nofixture` restores the old cold-boot behaviour.
2. **The metric was a tail statistic.** `workP95` is set by the rare stalls the
   runner cannot control. `drawMean` — mean ms in the draw phase, now exported
   from the probe — moves only when per-frame work actually changes, and is the
   new default metric. Watch the p95 as a *stutter* signal; judge draw-path work
   on the mean.
3. **The quality ladder was free to diverge.** This was the big one. The tier
   picks the canvas DPR cap and gates whole passes (the mote field is skipped
   below `medium`), so two reps of the *same* arm could render a different scene
   at a different resolution. `useVfx` has documented a `?tier=` pin for exactly
   this since it was written; the runner simply never used it. It now pins
   `high` by default (`--tier off` to let it adapt).

```
A-vs-A after all three, drawMean   A 7.215 -> B 7.598 ms   (+5.3 %)
```

**The honest floor is now ~10 % on `drawMean` at 4x with 4-5 reps**, with the
occasional rep still ruined by a background stall. Good enough for the findings
below; not good enough for a 5 % change. So where a change simply *removes*
work, the canvas op census — exact and deterministic — is the primary evidence
and the A/B is a regression guard.

---

## 2026-09-10 — `perf-lite`: gate the always-on HUD animations — **SHIPPED**

The open item from the 2026-09-09 diagnostic. `useHudMotion` stamps `perf-lite`
on `<body>` when `renderScaleTier` settles on `low` or `min`; a block in
`index.sass` names the seven continuously-running decorative animations and
stops them. The list is enumerated rather than a blanket `animation: none`,
because most animation in this game is transient and load-bearing (the chest
ceremony, modal entrances, the conquest pulse) and killing those would turn a
performance setting into a broken-looking game.

Measured with the tier **pinned to `high` in both arms**, so this isolates the
animation gating from the DPR and mote changes that also come with a low tier:

```
arm      workP95  intervalP95  UpdLayoutTree  Layerize   Paint
full         8.9         17.3            923       827     211
lite         7.9         17.4            125       227     273
noanim       5.8         17.5              8        24       8
```

Style recalculation **923 -> 125 ms** per 16 s (-86 %), layerization
**827 -> 227 ms** (-73 %), consistent across every rep. A separate check
confirmed **zero** CSS animations still running under `perf-lite`, so the list
is complete — a new always-on HUD animation belongs in that block too.

**VERDICT: keep.** Fidelity is spent where the ladder already spends it.

## 2026-09-10 — `coin-shine` on transform — **SHIPPED, all devices**

The one animation in the set with a genuinely free fix: it animated
`background-position`, which is not a compositable property, so it repainted the
coin badge every frame for the whole session. It now translates an over-wide
gradient behind the badge's existing `overflow: hidden`.

Visible in the table above: `Paint` in the **`full`** arm is 211 ms, against
**729 ms** measured for the same arm the day before. Unlike `perf-lite` this is
unconditional — every device gets it, including the ones holding `high`.

Style recalc did **not** move (an animation still recalculates style whether or
not its property composites), which is exactly what the 2026-09-09 `nofilter`
and `promote` arms predicted.

## 2026-09-10 — baked hand sockets and static captions — **SHIPPED**

Two changes of the same shape: stop rebuilding, every frame, something that only
changes when the layout or the locale does.

- **`socketSprite`** — `drawHand` was calling `createLinearGradient` plus two
  `addColorStop`s per slot per frame, then stroking two round-rects over it, to
  produce a plate that changes only on resize. ~180 identical gradient objects a
  second at 60 fps.
- **`captionSprite`** — "YOU", "FOE" and "REROLL" are static words, and each
  live `drawText` costs a `ctx.font` assignment, the most expensive single
  operation in this renderer. The *numbers* beside them still draw live.
  Captions are placed by their **glyph** edge, not their canvas edge, so the
  baked word sits exactly where the live text did.

Evidence is the op census, which is exact rather than statistical:

```
                          before      after
ctx.font assignments    6.0/frame   3.1/frame    (-48 %)
fillText / strokeText   6.0/6.0     3.1/3.0
createLinearGradient    3.0/frame   0.5/frame    (-83 %)
```

Both replace a multi-op live construction with one small blit, and neither adds
a cost of comparable size, so they ship on the census plus a screenshot
confirming pixel placement. Not individually resolvable by the A/B at its
current noise floor — stated plainly rather than dressed up as a timing win.

## 2026-09-10 — `motes-path-legacy` — **REVERTED (regression)**

**Hypothesis.** The mote field is 40 `beginPath`/`arc`/`fill` triples per frame,
each with its own `fillStyle` write — the largest single source of path work in
the census. Blitting one baked dot sprite instead should be cheaper.

```
median-of-rep drawMean   A 9.916 -> B 10.260 ms   (+3.5 %)
paired wins for B        2/5 reps
ranges                   A [9.028, 12.578]   B [8.509, 17.312]
B's bad reps             drawMean 16.0 and 17.3, with 62 and 80 long tasks
```

**VERDICT: revert.** Forty small blits are not cheaper than forty small paths
here, and B's tail is materially worse.

**This is the second paths-to-blits swap this renderer has rejected**
(`counter-text-legacy` was the first). Two independent results now say the same
thing: in this Canvas2D renderer, replacing a small live path with a small
`drawImage` is not a reliable win, and each one has to be measured rather than
assumed. Note also that `drawMotes` returns early below the `medium` tier, so no
struggling device ever paid this cost in the first place — it was only ever an
optimization for hardware that already had headroom.

## 2026-09-10 — `document.fonts.ready` — **correctness, not performance**

The latent bug noted on 2026-09-09. Sprites with words baked into them (the
level crest on a pebble, the reroll caption) freeze whatever face `ctx.font`
resolved to at bake time, and nothing ever re-made them — so a bake landing
before `Angry` finished downloading kept the sans-serif fallback for the whole
session. Usually won on a warm cache; frequently lost on a cold first load,
which is every portal's first impression.

`createArenaRenderer` now drops the sprite caches once when
`document.fonts.ready` settles, and re-primes. Deliberately
**`invalidateSprites()` and not `invalidate()`**: the backdrop and the plate
contain no text, and dropping them would buy a full-screen re-bake and three
`getImageData` readbacks to fix a font they never used. Guarded against firing
after `dispose`.

---

## 2026-09-10 — the conquest counters move to the DOM — **SHIPPED**

The open item from the two previous entries, and the largest single cost left in
the renderer. `drawCounters` redrew both plaques every frame — plate, border and
four `drawText` calls, each one a `ctx.font` assignment — for two numbers that
change a handful of times a match.

It is now `ConquestCounters.vue`, positioned from `geom.counters` (the
renderer's own rects, taken verbatim rather than re-derived in CSS where they
would drift from the canvas) and fed by the `playerTiles` / `enemyTiles` refs
`syncCounts` already publishes on board change.

**Evidence — the function is gone, not merely cheaper:**

```
                       before      after
drawCounters          10.03 %      absent from the profile
draw (whole renderer) 25.79 %     20.38 %   of total CPU
drawMean               8.17 ms     6.58 ms  (-19 %, tier pinned high, 4x)
```

This one needs no statistics: `drawCounters` no longer runs. The CPU profiler
simply stops listing it.

**What did NOT come for free.** `drawText` fell only 8.41 % → 7.10 %, because
`drawCounters` was not its only caller — `drawHpPips` prints `hp/maxHp` on every
rune above 6 max HP, and the banners, ghost and timer all draw text. `set font`
is still 5.79 % of CPU. The next text win, if one is wanted, is the HP readout,
not the HUD.

**Two traps worth recording:**

- **A new catalogue id must be tiered.** Adding `ui/counter-you` and
  `ui/counter-foe` to `ART_CATALOGUE` immediately failed
  `artPreload.test.ts` — the three tiers must cover every id exactly once. They
  went into tier 0 beside the coin and the forge: the plaques are on screen from
  turn 1, so the point is to have the bytes cached before the component mounts.
- **The DOM must honour the art contract too.** The obvious
  `background-image: url(images/ui/counter-you.webp)` re-requests a 404 on every
  mount for a drawable nobody has painted yet, and a portal's QA console reports
  each one as a broken build. It goes through `spriteFor` instead — probed once,
  remembered as missing, repainted via `onArtChanged` when a painting lands, and
  not requested at all with the art flag off.

## 2026-09-10 — the plaques become art — **prompts generated, painting outstanding**

`paintCounterPlate` in `arenaPainters.ts` draws the plaque: a wide carved slate
tablet, rounded ends, bevelled rim, four rivets, empty face. It is rendered in
the game by nothing — the counters are DOM now. It exists because:

1. it is the **reference panel** on the UI contact sheet, so the painter
   restyles *this* plaque rather than inventing one (a plaque described only in
   words comes back different on every sheet — the laurel taught us that); and
2. it is the **design of record for the CSS fallback**, which has to be the same
   object when the `.webp` is absent or the flag is off.

Two manifest cells on `sheet-ui`, two panels wide each, `letterboxed` to
581×256 the way the ribbon is — a wide object drawn at its true ~2.3:1 inside a
2:1 panel. The sheet went from 4×2 to 4×3, which keeps it on a standard aspect
(4:3); a non-standard sheet comes back re-composed and every rect in the index
is wrong.

`pnpm art:export` renders the references and `pnpm art:prompts` writes the
blocks; the SIZE clause now carries the bench's measured fit (97 % of the panel
width) rather than the nominal guess. Prompt blocks:
`art-sheets/PROMPTS-BOARD.md` (the sheet) and `art-sheets/PROMPTS-SINGLES.md`
(one plaque at a time).

The blurb is emphatic that the face comes back **EMPTY** — no numbers, no
letters, no engraving. The number and the caption are live DOM text in
twenty-one languages, and a plaque with a painted "4" on it reads "4" forever.

Until someone paints them, `spriteFor` finds nothing and the CSS plate shows.
Nothing is broken by the art not existing yet; that is the whole point of the
drop-in contract.

## 2026-09-10 — `art-invalidate-legacy`: rebuild only what a painting changed — **SHIPPED**

**The question that found it.** "Is the procedural art still drawn underneath
when art overrides are on?" No. Every `spriteFor` site bakes the painting OR
the painter into a cached sprite, so the steady state costs the same either
way. The cost is in the ARRIVALS. `art.ts` fired one `artChanged()` per
decoded painting, and `useArenaArt`'s listener answered each one by dropping
every sprite cache, the backdrop and the plate, then re-priming about 120
bakes. That is 91 full re-bakes while the preload tiers land in the first
seconds of play.

**The change.** `artChanged` now carries the painting (`{ kind, id }`; `null`
still means "anything": the flag flipped, or the probes were refreshed).
`dropBakesFor(kind, id)` drops only the bakes made from it:

- the stone sprites whose key reads back to it (`paintingsInPebble`, built on
  the same `runeArtId` the bake asks with);
- the tile sprites for that owner;
- the reroll chip;
- the backdrop only for `bg/*`, and the plate only for `tile/frame` and
  `tile/neutral`.

Glows, arrows, flames, the finger, the sockets and the captions are never
painted, so no arrival touches them. The DOM listeners (`useArtImage`,
`ConquestCounters`, `spriteStrip`) re-read only their own painting.

**Census — exact** (headless dev build, node-7 fixture, `?tier=high`, 4×,
seeded; canvas and `getImageData` counted from `addInitScript`; 3 interleaved
reps; 27 paintings decoded, because 27 files were on disk by then, down from
91 at the first measurement — sprites were being re-cut; none was orphaned):

```
                                 legacy              scoped
canvases created, 30 s of play   163 / 173 / 169     9 / 9 / 10
getImageData, 30 s of play       3 / 3 / 3           0 / 0 / 0
getImageData, boot -> first turn 15 / 12 / 18        3 / 3 / 3   (5-6 backdrop bakes -> 1)
frames > 50 ms                   33 / 7 / 9          0 / 0 / 1
long tasks                       30 / 1 / 4          0 / 2 / 1
```

**Timing — production build, `perf:ab --a "perf=art-invalidate-legacy" --b ""
--reps 4 --frames 900 --throttle 4`:**

```
median-of-rep drawMean   A 6.872 ms  ->  B 6.396 ms   (-6.9 %)
paired wins for B        3/4 reps, ranges overlapping
long tasks               A [46,11,13,13]  ->  B [13,10,8,9]
RAF interval p95         A 17.60 ms -> B 17.05 ms
heap slope               A -0.2 KB/f -> B 0.1 KB/f
```

The runner called this "marginal", and it is, as a `drawMean`. The churn lives
in the first seconds of a 900-frame window and is averaged away, and the delta
is under this harness's ~10 % floor. So per The budget, the decision rests on
the census, which is not marginal: canvases created in play fall by 94 %, and
loading does one backdrop bake instead of five or six. The saving grows with
the art. Legacy churn is one whole-scene re-bake per painting (all 314 once
painted), while scoped work stays at one or two sprites per painting.

**Correctness.** Both arms end on the same fully painted scene: backdrop,
frame, all three tiles and the stones. There is no stale drawn sprite left
behind. `tests/game/artInvalidation.test.ts` pins three things: the payload,
the fact that every bakeable stone key reads back to a catalogued painting,
and which renderer bakes each kind drops. Also fixed: a smoke painting that
decoded after the first puff waited for the next stage to show, because
nothing on the arrival path dropped the puff cache. `fx/smoke` now does.

**VERDICT: keep.** Flag and legacy branch deleted.
