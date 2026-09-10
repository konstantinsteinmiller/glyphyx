/**
 * ─── Glyphyx preview-video configuration ────────────────────────────────────
 *
 *   pnpm preview:video                          # all eight clips, both qualities
 *   pnpm preview:video --formats 30s            # just the 30 s 1080p pair
 *   pnpm preview:video --scenarios success      # one scenario, every format
 *   pnpm preview:video --no-clean               # with the interface on
 *   pnpm preview:video --only-setup             # stop on the opening frame
 *                                               #   (the scenario-authoring loop)
 *
 * Output, one folder per quality — each a complete, uniformly named set:
 *
 *   preview-videos/lossless/<scenario>-<format>-<orientation>-<W>x<H>.mp4 (+ .png poster)
 *   preview-videos/high/…     the same clips as upload-ready H.264 4:2:0
 */

export default {
  // The <title> the port-ownership check expects. A stale dev server from
  // another project answers on the port perfectly happily, and you find out by
  // watching ten seconds of somebody else's game.
  title: 'Glyphyx',

  // The dev server, NOT a production build: `window.__glyphyx` / `__arena` /
  // `__art` are `import.meta.env.DEV` only, and the scenarios are written
  // against them, as is the clean-feed flag. Port 2063 is the pipeline's own —
  // 2050 is `pnpm dev`, 2051 is the e2e suite, and colliding with either loses
  // somebody their session. `{port}` follows `--port`.
  server: {
    mode: 'dev',
    port: 2063,
    command: 'pnpm',
    args: ['exec', 'vite', '--port', '{port}', '--strictPort']
  },

  // ── The deliverables ──
  //
  // Output PIXELS; the CSS viewport is width/dpr x height/dpr. Two things
  // decide the dpr here, and neither is "what a phone has":
  //
  //  • The renderer CAPS the canvas at 2x on the high tier (`GameScene`'s
  //    `dprCap`). A 1080x1920 clip at dpr 3 would be a 720x1280 canvas
  //    upscaled by the browser — soft. So nothing here goes above 2.
  //  • In a clean feed the board is laid out as a fixed share of the short
  //    side (`CLEAN_BOARD_SHARE`), so the composition is the same at any CSS
  //    size; the dpr only decides how many pixels it is drawn with.
  //
  // Every ratio divides its output exactly, so no frame comes back a pixel off.
  // (With the interface on, landscape at dpr 1.6 was measured as the best fit
  // for the HUD layout: 800x450 CSS. It is kept for the 10 s cut.)
  formats: {
    '10s': {
      durationMs: 10_000,
      orientations: {
        portrait: { width: 720, height: 1280, dpr: 2, isMobile: true, hasTouch: true },
        landscape: { width: 1280, height: 720, dpr: 1.6, isMobile: false, hasTouch: false }
      }
    },
    // MP4 · H.264 · 30 seconds · 1920x1080 and 1080x1920. A 30-second clip is
    // a different STORY, not a longer one — it plays its own beat sheets.
    '30s': {
      durationMs: 30_000,
      orientations: {
        portrait: { width: 1080, height: 1920, dpr: 2, isMobile: true, hasTouch: true },
        landscape: { width: 1920, height: 1080, dpr: 2, isMobile: false, hasTouch: false }
      },
      scenarios: { success: 'success-30s', fail: 'fail-30s' }
    }
  },

  scenarios: ['success', 'fail'],

  fps: 30,
  // Both from ONE capture, one folder each:
  //   lossless — `-qp 0 -pix_fmt yuv444p`: the master. Big, and Safari and
  //              QuickTime will not play 4:4:4.
  //   high     — CRF 14, yuv420p, High profile: visually identical, plays
  //              everywhere, the file a portal's "MP4 · H.264" upload wants.
  quality: ['lossless', 'high'],
  outDir: 'preview-videos',
  capture: 'virtual',

  // ── Pure gameplay ──
  //
  // "No hardcoded text, score counters, watermarks, UI or logos" — for every
  // clip. Three levers (see lib/clean.mjs): the recorder hides every DOM node
  // but the arena canvas (the HUD, the counters, the result screen, the turn
  // banner, the enemy portrait); it no-ops canvas text (damage numbers, HP and
  // level labels); and `?clean=1` switches off what the renderer paints that
  // is interface but not text — the hand tray, the reroll chip, the planning
  // timer, the correction ring — and centres the board in the whole frame
  // (`src/game/cleanFeed.ts`). `--no-clean` records with all of it back.
  clean: {
    enabled: true,
    keep: ['canvas.scene__canvas'],
    suppressCanvasText: true,
    urlParams: {
      clean: '1',
      // Paintings with a defect a clip must not show, found 2026-09-10 by
      // contact-sheeting every sprite the clips use. Denied, they fall back to
      // the procedural painter for the recording only (`?artdeny`,
      // `src/game/art.ts`) — every other painting stays on. Re-slicing those
      // sheets removes the need; then delete the entry.
      //   fx/laurel-*              TEXT: every wreath has its sheet caption
      //                            painted in ("Laurel · Shield, Lv 2")
      //   rune/support-obsidian-*  TEXT: the sheet cell number ("3." / "4.")
      //   rune/melee-obsidian-*    a green sliver of the neighbouring cell on
      //                            the right edge — large at Lv 2+, on screen
      //                            on the Lv 3 swords of both 30 s clips
      artdeny: 'fx/laurel-,rune/support-obsidian-,rune/melee-obsidian-'
    }
  },

  urlParams: {
    // Pin the adaptive quality ladder. Without this the renderer is free to
    // settle on a different tier per run — different DPR, the mote pass gated —
    // so two recordings of the same scenario would not even draw the same scene.
    tier: 'high',
    // The painted art. `off` falls back to the procedural drawing, which is
    // clean but plainer. See NOTE below before flipping this.
    art: 'on'
  },

  // NOTE — painted-art defects visible at the time of writing (2026-09-10):
  // the ENEMY orb (mage) sprite renders TWICE, the second copy offset a
  // half-tile right and clipped by the board frame, and several player stones
  // carry a thin sliver of the neighbouring sheet frame on their left edge.
  // With art `off` every one of them renders correctly, so this is a slicing
  // defect in the painted sheets, not a renderer or staging bug. Both beat
  // sheets already avoid the orb entirely for that reason. If the slivers
  // bother you, record with `--url-param art=off` until the sheets are re-cut.

  async onPageReady() { /* the scenarios do their own booting via _drive.boot */ }
}
