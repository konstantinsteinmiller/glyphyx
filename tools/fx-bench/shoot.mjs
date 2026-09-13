#!/usr/bin/env node
/**
 * ─── FX bench: one rune's effect, frame by frame, and its sound ─────────────
 *
 *   node tools/fx-bench/shoot.mjs --rune archer            # every archer scenario
 *   node tools/fx-bench/shoot.mjs --scenarios melee-hit,cleave-fan
 *   node tools/fx-bench/shoot.mjs --all --lineup           # all 18 + a side-by-side sheet
 *   node tools/fx-bench/shoot.mjs --list                   # what scenarios exist
 *
 * For each scenario it writes into `--out` (default `fx-bench-out/`):
 *
 *   <id>.png         a contact sheet: the board, `--frames` moments across the
 *                    event (time stamped), cropped to the board
 *   <id>.mp4         (with --video) every frame, 30 fps — to judge MOTION
 *   <id>.wav         the scenario's SOUND: every cue the game asked for, rendered
 *                    offline through the real recipes, room and glue compressor
 *   <id>-spec.png    its spectrogram (log frequency, 40 Hz – 16 kHz)
 *   <id>.json        the numbers: events, peak live particles, draw ms per
 *                    frame, canvas ops per frame, and the audio's peak /
 *                    loudness / length / brightness / stereo width
 *   lineup.png       (with --lineup) every scenario's IMPACT moment side by side
 *                    — the test for "can you tell the runes apart"
 *
 * It drives `/#/fx-bench` (src/views/FxBench.vue) on a Vite dev server with the
 * clean feed (`?clean=1`) and the quality ladder pinned (`?tier=`), `Math.random`
 * seeded, so two runs of the same code draw the same particles.
 *
 * Other flags: --port 2090 (dev server; started if nothing answers, and checked
 * to be Glyphyx), --size 390x844, --dpr 2, --fps 30, --tier high|medium|low|min,
 * --seed 7, --no-sound, --headed, --warm (the planning-time rune warm-up first),
 * --throttle 4 (CDP CPU throttling — for PAINT
 * COST compare two trees headed and throttled; headless skips raster work).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import sharp from 'sharp'
import { startServer, assertOwnServer } from '../preview-video/lib/server.mjs'
import { randomSeedSource } from '../preview-video/lib/determinism.mjs'
import { launchBrowser } from '../preview-video/lib/browser.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')

// ─── Arguments ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const flag = (n) => argv.includes(`--${n}`)
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d }
const port = Number(opt('port', '2090'))
const [vw, vh] = String(opt('size', '390x844')).split('x').map(Number)
const dpr = Number(opt('dpr', '2'))
const fps = Number(opt('fps', '30'))
const tier = opt('tier', 'high')
const seed = Number(opt('seed', '7'))
const framesWanted = Number(opt('frames', '14'))
const out = resolve(ROOT, opt('out', 'fx-bench-out'))
const wantSound = !flag('no-sound')
const wantVideo = flag('video')

const log = {
  info: (m) => console.log(`  · ${m}`),
  ok: (m) => console.log(`  ✓ ${m}`),
  warn: (m) => console.warn(`  ! ${m}`),
  error: (m) => console.error(`  ✗ ${m}`)
}

// ─── Page-side instrumentation ──────────────────────────────────────────────

/** Count every canvas call per frame — exact, where a timing delta is noise. */
const OP_CENSUS = `
(() => {
  const P = CanvasRenderingContext2D.prototype
  const ops = {}
  const wrap = (name) => {
    const f = P[name]
    if (typeof f !== 'function') return
    P[name] = function (...a) { ops[name] = (ops[name] || 0) + 1; return f.apply(this, a) }
  }
  for (const n of ['drawImage', 'fill', 'stroke', 'fillRect', 'arc', 'createRadialGradient', 'createLinearGradient', 'save', 'restore', 'fillText', 'strokeText', 'beginPath', 'getImageData']) wrap(n)
  window.__ops = { take: () => { const o = { ...ops }; for (const k in ops) ops[k] = 0; return o } }
})()
`

// ─── Helpers ────────────────────────────────────────────────────────────────

const pngFromDataUrl = (d) => Buffer.from(d.slice(d.indexOf(',') + 1), 'base64')

const label = (text, w, h = 22) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#0b0d14"/>` +
  `<text x="6" y="${h - 7}" font-family="Segoe UI, system-ui, sans-serif" font-size="13" fill="#9fb0c8">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`
)

const ffmpegPath = async () => {
  try { return (await import('ffmpeg-static')).default } catch { return null }
}

// ─── Main ───────────────────────────────────────────────────────────────────

const main = async () => {
  mkdirSync(out, { recursive: true })
  const server = await startServer({ repoRoot: ROOT, port, log })
  let browser
  try {
    await assertOwnServer({ url: server.url, expectTitle: 'Glyphyx', log })
    browser = (await launchBrowser({ headed: flag('headed'), log })).browser
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dpr })
    // Vite's HMR socket, answered locally and never connected: a file saved
    // mid-capture must not reload the bench under the frames being taken.
    await ctx.routeWebSocket(/^wss?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//, () => {})
    await ctx.addInitScript(randomSeedSource(seed))
    await ctx.addInitScript(OP_CENSUS)
    const page = await ctx.newPage()
    const throttle = Number(opt('throttle', '0'))
    if (throttle > 1) {
      const cdp = await ctx.newCDPSession(page)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })
      log.info(`CPU throttled ×${throttle}`)
    }
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    // `art=on` — the painted stones, whatever the server's `.env` says (a fresh
    // worktree has no `.env`: it is gitignored).
    await page.goto(`${server.url}/?clean=1&art=on&tier=${tier}#/fx-bench`, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => !!window.__fxbench, null, { timeout: 30_000 })
    await page.evaluate((t) => window.__fxbench.tier(t), tier)

    const all = await page.evaluate(() => window.__fxbench.scenarios())
    if (flag('list')) {
      for (const s of all) console.log(`${s.id.padEnd(20)} ${s.rune.padEnd(8)} ${s.title}`)
      return
    }
    const wanted = flag('all') ? all.map((s) => s.id)
      : opt('scenarios') ? String(opt('scenarios')).split(',')
        : opt('rune') ? all.filter((s) => s.rune === opt('rune')).map((s) => s.id)
          : (() => { throw new Error('say --all, --rune <type> or --scenarios <ids> (or --list)') })()

    if (flag('warm')) {
      await page.evaluate(() => window.__fxbench.warm())
      await page.waitForTimeout(50)
      log.info('rune effects warmed (the game does this during planning)')
    }
    // Warm up: bake the pebbles, glows and ramps once, so the first scenario's
    // numbers measure its effect and not the renderer's cold start.
    for (const id of wanted.slice(0, 2)) {
      await page.evaluate((s) => window.__fxbench.load(s), id)
      for (let i = 0; i < 24; i++) await page.evaluate((d) => window.__fxbench.step(d), 1000 / fps)
    }

    const lineup = []
    const ffmpeg = wantVideo ? await ffmpegPath() : null
    for (const id of wanted) {
      const info = await page.evaluate((s) => window.__fxbench.load(s), id)
      await page.evaluate(() => window.__ops.take())
      const dt = 1000 / fps
      const nFrames = Math.ceil(info.endMs / dt)
      const first = info.events.reduce((m, e) => Math.min(m, e.at), Infinity)
      const start = Math.max(0, first - 60)
      const pick = new Set()
      for (let i = 0; i < framesWanted; i++) pick.add(Math.round((start + (info.endMs - start) * (i / (framesWanted - 1))) / dt))
      // The impact moment of the scenario's own rune events, for the lineup.
      const own = info.events.filter((e) => e.owner === info.rune)
      const hero = Math.round(((own[0]?.impact ?? first + 150) + 70) / dt)
      pick.add(hero)

      const frames = []
      const all30 = []
      const stats = { maxParticles: 0, drawMs: [], ops: [] }
      const b = info.board
      const pad = 0.3 * (b.w / 4)
      // The canvas's REAL scale: the renderer caps its DPR per quality tier
      // (1.25 at `low`), so the requested `--dpr` is not what the pixels are.
      const cw = await page.evaluate(() => document.querySelector('canvas').width)
      const k = cw / vw
      const crop = {
        left: Math.max(0, Math.round((b.x - pad) * k)),
        top: Math.max(0, Math.round((b.y - pad) * k)),
        width: Math.round((b.w + pad * 2) * k),
        height: Math.round((b.h + pad * 2) * k)
      }
      crop.width = Math.min(crop.width, cw - crop.left)
      crop.height = Math.min(crop.height, Math.round(vh * k) - crop.top)
      for (let i = 1; i <= nFrames; i++) {
        const s = await page.evaluate((d) => window.__fxbench.step(d), dt)
        const ops = await page.evaluate(() => window.__ops.take())
        stats.maxParticles = Math.max(stats.maxParticles, s.particles)
        stats.drawMs.push(s.drawMs)
        stats.ops.push(ops)
        if (pick.has(i) || (wantVideo && ffmpeg)) {
          const png = pngFromDataUrl(await page.evaluate(() => window.__fxbench.snap()))
          const cut = await sharp(png).extract(crop).png().toBuffer()
          if (pick.has(i)) frames.push({ t: Math.round(s.t), png: cut })
          if (i === hero) lineup.push({ id, png: cut })
          if (wantVideo && ffmpeg) all30.push(cut)
        }
      }

      // Contact sheet: 7 across, each frame labelled with its time.
      const tw = Math.round(crop.width / 2)
      const th = Math.round(crop.height / 2)
      const cols = 7
      const rows = Math.ceil(frames.length / cols)
      const cells = await Promise.all(frames.map(async (f) => ({
        t: f.t, img: await sharp(f.png).resize(tw, th).png().toBuffer()
      })))
      const LH = 22
      const sheet = sharp({ create: { width: cols * tw, height: rows * (th + LH) + 30, channels: 4, background: '#0b0d14' } })
      const comp = [{ input: label(`${id} — ${info.title}`, cols * tw, 30), left: 0, top: 0 }]
      cells.forEach((c, i) => {
        const x = (i % cols) * tw
        const y = 30 + Math.floor(i / cols) * (th + LH)
        comp.push({ input: label(`${c.t} ms`, tw, LH), left: x, top: y })
        comp.push({ input: c.img, left: x, top: y + LH })
      })
      await sheet.composite(comp).png().toFile(resolve(out, `${id}.png`))

      if (wantVideo && ffmpeg && all30.length) {
        await new Promise((ok, fail) => {
          const p = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16',
            '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', resolve(out, `${id}.mp4`)], { stdio: ['pipe', 'ignore', 'ignore'] })
          p.on('error', fail)
          p.on('exit', (c) => (c === 0 ? ok() : fail(new Error(`ffmpeg exited ${c}`))))
          for (const f of all30) p.stdin.write(f)
          p.stdin.end()
        })
      }

      // Sound.
      let audio = null
      if (wantSound) {
        const r = await page.evaluate(() => window.__fxbench.sound())
        writeFileSync(resolve(out, `${id}.wav`), Buffer.from(r.wav, 'base64'))
        writeFileSync(resolve(out, `${id}-spec.png`), pngFromDataUrl(r.spec))
        audio = { ...r.stats, cues: r.cues.map((c) => `${c.id}@${Math.round(c.atMs)}${c.opts?.pan ? ` pan ${c.opts.pan.toFixed(2)}` : ''}`) }
      }

      const sum = (k) => stats.ops.reduce((m, o) => Math.max(m, o[k] || 0), 0)
      const mean = (arr) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)
      const report = {
        id, rune: info.rune, title: info.title, events: info.events,
        frames: nFrames, maxParticles: stats.maxParticles,
        drawMs: { mean: +mean(stats.drawMs).toFixed(2), max: +Math.max(...stats.drawMs).toFixed(2) },
        opsPerFrameMax: { drawImage: sum('drawImage'), fill: sum('fill'), stroke: sum('stroke'), arc: sum('arc'),
          gradients: Math.max(...stats.ops.map((o) => (o.createRadialGradient || 0) + (o.createLinearGradient || 0))), save: sum('save'),
          getImageData: sum('getImageData') },
        audio
      }
      writeFileSync(resolve(out, `${id}.json`), JSON.stringify(report, null, 2))
      const a = audio ? `  audio peak ${audio.peakDb.toFixed(1)} dB, hit ${audio.maxShortDb.toFixed(1)} dB, ${audio.audibleSec.toFixed(2)} s, ${Math.round(audio.centroidHz)} Hz, width ${audio.width.toFixed(2)}` : ''
      log.ok(`${id}: ${nFrames} frames, ≤${stats.maxParticles} particles, draw ${report.drawMs.mean}/${report.drawMs.max} ms, ` +
        `≤${report.opsPerFrameMax.drawImage} drawImage, ≤${report.opsPerFrameMax.gradients} gradients/frame${a}`)
    }

    if (flag('lineup') && lineup.length) {
      const tw = 300
      const cells = await Promise.all(lineup.map(async (l) => {
        const img = await sharp(l.png).resize({ width: tw }).png().toBuffer()
        const m = await sharp(img).metadata()
        return { id: l.id, img, h: m.height }
      }))
      const th = Math.max(...cells.map((c) => c.h))
      const cols = 6
      const rows = Math.ceil(cells.length / cols)
      const comp = []
      cells.forEach((c, i) => {
        const x = (i % cols) * tw
        const y = Math.floor(i / cols) * (th + 22)
        comp.push({ input: label(c.id, tw, 22), left: x, top: y })
        comp.push({ input: c.img, left: x, top: y + 22 })
      })
      await sharp({ create: { width: cols * tw, height: rows * (th + 22), channels: 4, background: '#0b0d14' } })
        .composite(comp).png().toFile(resolve(out, 'lineup.png'))
      log.ok(`lineup.png (${cells.length} scenarios)`)
    }
    const caches = await page.evaluate(() => window.__fxbench.caches?.())
    if (caches) log.info(`caches after the run: ${caches.baked}/480 baked sprites, ${caches.registered}/512 particle sprites`)
    if (errors.length) { log.warn(`page errors:\n    ${errors.slice(0, 8).join('\n    ')}`); process.exitCode = 1 }
  } finally {
    await browser?.close().catch(() => {})
    await server.stop()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
