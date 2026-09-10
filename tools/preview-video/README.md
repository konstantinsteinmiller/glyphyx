# Preview videos — scripted, not screen-recorded

```bash
pnpm preview:video                          # every format, both scenarios, both qualities
pnpm preview:video --formats 30s            # just the 30 s 1080p pair
pnpm preview:video --scenarios success      # one scenario, every format
pnpm preview:video --no-clean               # with the interface on
pnpm preview:video --help                   # every flag
```

A full run records **eight clips** — a `success` and a `fail` scenario, each in
portrait and landscape, in two formats — and encodes every clip twice from the
same capture. Output (gitignored — these are build artifacts):

```
preview-videos/
  lossless/   the masters: H.264 High 4:4:4, qp 0
  high/       the uploads: H.264 High, yuv420p, CRF 14 — "MP4 · H.264"
    success-10s-portrait-720x1280.mp4     fail-10s-portrait-720x1280.mp4
    success-10s-landscape-1280x720.mp4    fail-10s-landscape-1280x720.mp4
    success-30s-portrait-1080x1920.mp4    fail-30s-portrait-1080x1920.mp4
    success-30s-landscape-1920x1080.mp4   fail-30s-landscape-1920x1080.mp4
    …each with a same-stem .png poster
```

Every clip is a **clean feed** by default: pure gameplay — no HUD, no score
counters, no text, no buttons, no banners, no result screen, no logo.

A hand-made screen recording drops frames when the machine is busy, catches a
mouse cursor, and has to be re-shot after every art change. This scripts the
clip instead: the game is driven to an exact board, the page clock is taken over
by the recorder, and every frame is stepped and captured deliberately. A 30 s
clip is exactly 900 frames at 30 fps however long the machine takes to render
them.

**How reproducible, exactly.** `Math.random` is pinned to a seeded mulberry32
(`--seed 7`), which is what makes the gameplay identical run to run: without it
`arenaFx` re-rolls every spark and two takes of the same script matched at only
26.8 dB PSNR, collapsing to 15 dB across an explosion. With it, two takes match
at **39.1 dB, minimum 32 dB** — the residue is the planning-timer readout,
because `setup()` runs in real time. The board, the runes, the resolution and
every particle are the same. It is not byte-identical and is not trying to be.

## The files that matter

| file | what it is |
|---|---|
| `record.mjs` + `lib/` | the recorder. Game-agnostic — the `gameplay-video-pipeline` skill copies it into other projects verbatim |
| `preview.config.mjs` | the two formats, both qualities, the clean feed, the dev-server port, the URL params that pin the adaptive ladder |
| `scenarios/success.mjs`, `fail.mjs` | the 10 s beat sheets — **"Behind, level, won"** and **"Seized it, threw it"** |
| `scenarios/success-30s.mjs`, `fail-30s.mjs` | the 30 s beat sheets, mapped in by `formats['30s'].scenarios` — each is its own story, not a padded 10 s one; the beat sheet is in each file's header |
| `scenarios/_drive.mjs`, `_constants.mjs` | the Glyphyx-specific driving: save fixture, boot, deterministic board staging, placement, the enemy's authored turns, the game's phase timings |

`CONTRACT.md` is the module contract (v2) the code is held to.

## How it runs

1. starts a vite dev server on **2063** (`{port}` in `server.args` follows
   `--port`; never 2050 / `pnpm dev`, never 2051 / the e2e suite) and **checks
   the served `<title>` is Glyphyx** — a stale server from another project
   answers on a free port perfectly happily;
2. opens system Chrome (Playwright `channel: 'chrome'` — Playwright's own
   chromium is not downloaded in this repo) at the variant's CSS size and dpr,
   with three init scripts: the seeded RNG, the clean feed, the virtual clock.
   The page's WebSockets to the dev server are answered locally and never
   connected (`muteSocketsTo`), so hot reload cannot navigate it mid-take;
3. runs `scenario.setup()` in **real, unrecorded** time: seeds the save, boots
   to node 7, pauses the planning clock and stages the exact board;
4. arms `window.__vclock`, which takes over `requestAnimationFrame`, the timers
   **and** every CSS animation;
5. per frame: advance the clock so the scenario's next beat fires, let it go
   quiet, step the page by exactly one frame, screenshot;
6. pipes each PNG into one `ffmpeg-static` encoder per quality, and writes the
   poster into each quality folder.

The dev server is required, not incidental: `window.__glyphyx`, `window.__arena`
and both clean-feed flags only exist under `import.meta.env.DEV`.

## The clean feed — three levers

| interface | where | how it goes |
|---|---|---|
| HUD, counters, buttons, turn banner, result screen, enemy portrait | DOM | `lib/clean.mjs` hides every `<body>` node but `canvas.scene__canvas` (`visibility`, so nothing reflows) |
| damage numbers, HP and level labels, captions | canvas text | `fillText`/`strokeText` no-op'd at document start — and the renderer's own `drawText` / caption sprites are off too |
| hand tray, reroll chip, planning timer, correction ring, ghost hand | painted by the renderer | `?clean=1` → `CLEAN_FEED` (`src/game/cleanFeed.ts`): those draw calls are skipped and `computeArenaLayout(…, clean)` centres the board alone (`CLEAN_BOARD_SHARE` portrait 0.88 / landscape 0.82 of the short side) |

And a fourth thing no lever reaches: **defects baked into painted art**. Every
`fx/laurel-*` painting carries its sheet caption ("Laurel · Shield, Lv 2"), the
obsidian support stone its sheet cell number ("3." / "4."), and the obsidian
sword a green sliver of the neighbouring cell (large at Lv 2+). The config
denies all three for the recording
(`?artdeny=fx/laurel-,rune/support-obsidian-,rune/melee-obsidian-`,
`src/game/art.ts`), so they fall back to the procedural drawing while every
other painting stays on. Re-slicing those sheets removes the need — then delete
the entries. Re-check with a zoomed contact sheet after any art change.

## Quality

`quality: ['lossless', 'high']` — one capture, two encodes, two folders.
`lossless` (`-qp 0 -pix_fmt yuv444p`) is the master; it is H.264 too, but High
4:4:4, which Safari, QuickTime and many upload validators refuse. `high` (CRF 14,
yuv420p, High profile) is visually identical and is the file to upload.
`--quality lossless-rgb` is bit-exact and plays almost nowhere; `--quality
balanced` is for iterating.

## Dpr, and why 1080p is dpr 2

`GameScene` caps the canvas at **2x** on the high tier. A 1080x1920 clip at
dpr 3 would be a 720x1280 canvas upscaled — soft. So the 30 s format records
at dpr 2: 540x960 / 960x540 CSS. The clean layout sizes the board by share of
the short side, so the composition matches the 10 s clips exactly.

## Re-cutting for a portal

Add a format rather than passing sizes by hand — the skill's
`reference/portal-specs.md` has the verified shapes:

```js
// CrazyGames: 15-20 s, landscape 16:9 + portrait 2:3, both 1080p, no sound
crazygames: { durationMs: 16_000, quality: 'high', orientations: {
  landscape: { width: 1920, height: 1080, dpr: 2 },
  portrait:  { width: 1080, height: 1620, dpr: 2 } } },
```
```bash
pnpm preview:video --formats crazygames
```

Do not letterbox an existing clip — re-record at the target aspect so the game
lays itself out for it.

## Gotchas that cost time here

- **Hot reload kills takes.** Anything written under the project — another
  session exporting art into `public/` — made Vite broadcast a full reload and
  navigated the page mid-capture ("Execution context was destroyed"). The
  recorder now answers the page's dev-server WebSockets locally
  (`muteSocketsTo`); `server.hotReload: true` re-enables it for authoring only.
  Shadowing `location.reload` does NOT work — Location members are unforgeable
  in Chrome and the `try/catch` around it hides that.
- **The painted orb (mage) renders twice**, half a tile offset — the beat sheets
  avoid the orb rather than deny it. Other slivers of neighbouring sheet cells
  exist on stones the clips do not use; the obsidian sword's, which they do, is
  denied (above). `--url-param art=off` records the procedural drawing instead.
- **Two runs agree on gameplay, not always to the frame.** Takes recorded back
  to back match at codec-noise level (43.7 dB), but a take made as the sixth
  clip of a full run landed a beat apart by second 5: the state at `arm()` comes
  out of real time (a timer in flight when setup returns keeps its REMAINING
  real time), and a cold dev server makes setup slower. Every exchange logs its
  phase and tiles, and every clip logs its verdict — compare those, not files.
- **`page.goto` to the same URL is a no-op.** vue-router leaves `#/` on the
  address, so `boot` bounces through `about:blank` — and re-opens the runner's
  URL, which already carries every clean/format/`--url-param` parameter — then
  asserts it landed on a conquest node.
- **A side can gain at most one tile per turn**, so the widest legal comeback in
  two exchanges is 6 → 7 → 8. Stage what the rules permit.
- Never `waitFor` inside `record()` — the page only advances when the capture
  loop steps it, and the loop is waiting for the scenario to go quiet. That is a
  deadlock, so `ctx.waitFor` throws there; use `ctx.stepUntil`.
- A draft of a 30 s beat sheet does not need 1080p: `--formats 30s --fps 15
  --portrait 540x960 --dpr 1 --quality balanced` keeps the layout and costs a
  fraction of the time.

The generalised procedure for installing this in another game is the user-level
`gameplay-video-pipeline` skill.
