import { defineConfig, devices } from '@playwright/test'

/**
 * ─── End-to-end suite ───────────────────────────────────────────────────────
 *
 * Drives the REAL game in the installed Chrome (`channel: 'chrome'` — no
 * browser download, and the engine players actually run) against a Vite dev
 * server on its own port, so it never collides with a `pnpm dev` that is
 * already open, and never tests a stale `dist/`.
 *
 *   pnpm test:e2e              # everything
 *   pnpm test:e2e -g hydrate   # one spec
 *
 * The specs talk to the game through two dev-only seams the scene publishes on
 * `window` (`__glyphyx` for state, `__arena` for the canvas layout), plus real
 * pointer events on the canvas for the drag → swipe → release gesture — the
 * thing a unit test cannot prove.
 */

const PORT = 2051

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    channel: 'chrome',
    headless: true,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'phone-portrait', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    {
      name: 'phone-landscape',
      use: { ...devices['Pixel 7 landscape'], channel: 'chrome' },
      testMatch: /layout\.spec\.ts/
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
      testMatch: /(layout|gameplay)\.spec\.ts/
    }
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
    cwd: '../..'
  }
})
