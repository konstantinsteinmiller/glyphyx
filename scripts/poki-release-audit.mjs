#!/usr/bin/env node
// ─── Poki release gates, against the BUILT bundle ───────────────────────────
//
//   npx vite build --mode poki
//   node scripts/poki-release-audit.mjs            # expects dist/ served on :47621
//
// Companion to `portal-qa.mjs`, narrower on purpose: these are the checks that
// decide a POKI submission specifically, and every one of them is graded.
//
//   • load under 10 s, splash cleared, zero console errors
//   • the gameplay bracket — playbook rule 9 (no sub-50 ms stop→start pairs,
//     which silently switch off monetization for the session at ten of them)
//     and rule 9b (no `gameplayStart` before a trusted gesture, which is both
//     a QA rejection and an inflated conversion-to-play number)
//   • the canvas covers the frame at Poki's three graded sizes in BOTH
//     orientations, plus the Chromebook embed and the 320x658 floor
//
// The SDK is stubbed by injection and LOCKED with `defineProperty`, and the
// real CDN request is fulfilled with an empty script rather than aborted — an
// abort shows up as a console error and fails the run for a harness artefact.
//
// Not covered here, deliberately: mute and pause. Poki exposes NEITHER signal
// (the game owns both outright), so there is no portal lever to drive.

import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const require = createRequire('C:/Users/konst/Documents/__p/glyphyx/package.json')
const { chromium } = require('@playwright/test')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ORIGIN = 'http://127.0.0.1:47621'
const OUT = path.join(HERE, 'audit'); fs.mkdirSync(OUT, { recursive: true })

let pass = 0, fail = 0
const check = (name, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  ok ? pass++ : fail++
}

// The SDK stub: records the bracket, never fills an ad, and is LOCKED so the
// real CDN script cannot replace it.
const STUB = `
window.__qa = { ev: [], errors: [] };
var log = function (n) { window.__qa.ev.push({ t: Math.round(performance.now()), ev: n }); };
var sdk = {
  init: function () { log('init'); return Promise.resolve(); },
  gameLoadingFinished: function () { log('gameLoadingFinished'); },
  gameplayStart: function () { log('gameplayStart'); },
  gameplayStop: function () { log('gameplayStop'); },
  commercialBreak: function (cb) { log('commercialBreak'); if (cb) try { cb() } catch (e) {}; return Promise.resolve(); },
  rewardedBreak: function () { log('rewardedBreak'); return Promise.resolve(false); },
  measure: function () {}, captureError: function () {},
  getLanguage: function () { return 'en'; },
  getDeviceInfo: function () { return { category: 'desktop' }; },
  getURLParam: function () { return ''; }, isAdBlocked: function () { return false; },
  movePill: function () {}, muteAd: function () {}, setVolume: function () {}, setDebug: function () {}
};
Object.defineProperty(window, 'PokiSDK', { value: sdk, writable: false, configurable: false });
`

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio'] })

// ── 1. Load time, boot, console errors, bracket ────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'en-US' })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)) })
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 140)}`))
  await ctx.addInitScript({ content: STUB })
  await ctx.route('https://game-cdn.poki.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* stubbed by the audit */' }))
  const t0 = Date.now()
  await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => !document.getElementById('static-splash'), null, { timeout: 30000 }).catch(() => {})
  const loadMs = Date.now() - t0
  console.log('\n── Boot ──')
  check('load under Poki\'s 10 s cap', loadMs < 10000, `${(loadMs / 1000).toFixed(1)} s to playable`)
  check('splash cleared', !(await page.evaluate(() => !!document.getElementById('static-splash'))))
  check('canvas present', await page.evaluate(() => !!document.querySelector('canvas')))

  await page.waitForTimeout(4000)
  console.log('\n── Gameplay bracket (playbook rules 9 / 9b) ──')
  const before = await page.evaluate(() => window.__qa.ev.map((e) => e.ev))
  check('no gameplayStart before ANY player gesture', !before.includes('gameplayStart'), before.join(' | ') || '(no events)')
  check('gameLoadingFinished was sent', before.includes('gameLoadingFinished'))
  // A trusted gesture on an empty tile: cannot commit a placement.
  const box = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.x + r.width * 0.5, y: r.y + r.height * 0.2 } })
  await page.mouse.click(box.x, box.y)
  await page.waitForTimeout(2500)
  const after = await page.evaluate(() => window.__qa.ev)
  const starts = after.filter((e) => e.ev === 'gameplayStart')
  check('exactly one gameplayStart after the gesture', starts.length === 1, `${starts.length} start(s)`)
  // Rule 9: no start within 50 ms of a stop.
  let bad = 0
  for (let i = 1; i < after.length; i++) {
    if (after[i].ev === 'gameplayStart' && after[i - 1].ev === 'gameplayStop' && after[i].t - after[i - 1].t < 50) bad++
  }
  check('no sub-50 ms stop→start pairs (bad-event guard)', bad === 0, `${bad} bad pair(s)`)
  check('zero console errors', errors.length === 0, errors.join(' // ') || 'clean')
  await ctx.close()
}

// ── 2. Canvas coverage at Poki's required sizes ────────────────────────────
console.log('\n── Canvas coverage (Poki: full canvas, both orientations) ──')
for (const [w, h] of [[640, 360], [836, 470], [1031, 580], [360, 640], [470, 836], [580, 1031], [764, 385], [320, 658]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'en-US' })
  const page = await ctx.newPage()
  await ctx.addInitScript({ content: STUB })
  await ctx.route('https://game-cdn.poki.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* stubbed by the audit */' }))
  await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  const m = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    if (!c) return null
    const r = c.getBoundingClientRect()
    return {
      cw: Math.round(r.width), ch: Math.round(r.height),
      vw: window.innerWidth, vh: window.innerHeight,
      scrollX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollY: document.documentElement.scrollHeight > window.innerHeight + 1
    }
  })
  const covers = m && m.cw >= m.vw - 2 && m.ch >= m.vh - 2
  check(`${w}×${h} — canvas fills the frame`, !!covers, m ? `canvas ${m.cw}×${m.ch} vs ${m.vw}×${m.vh}${m.scrollX ? ' H-SCROLL' : ''}${m.scrollY ? ' V-SCROLL' : ''}` : 'no canvas')
  await page.screenshot({ path: path.join(OUT, `size-${w}x${h}.png`) })
  await ctx.close()
}

await browser.close()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
