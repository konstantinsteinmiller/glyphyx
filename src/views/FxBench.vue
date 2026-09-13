<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createArenaRenderer, type ArenaRenderer } from '@/use/useArenaArt'
import { nodeConfig } from '@/game/campaign'
import type { BoardState, ResolveEvent } from '@/game/rules'
import type { ArenaView } from '@/game/view'
import { ownerOf } from '@/use/runeFx'
import { LABELS, SCENARIOS, build } from '@/use/runeFx/scenarios'
import { eventImpactFrac } from '@/use/useArenaArt'
import { __setSfxTap } from '@/use/useGameAudio'
import { __setQualityTier, particleCount, registeredSpriteCount, resetVfx, type QualityTier } from '@/use/useVfx'
import { bakedSpriteCount } from '@/use/arenaFx'
import { warmRune } from '@/use/runeFx/warm'
import { RUNE_TYPES } from '@/game/rules'
import { measure, renderCues, spectrogram, wavBase64, type CueCall } from '@/use/sfxOffline'

/**
 * ─── FX bench (DEV) ─────────────────────────────────────────────────────────
 *
 * One rune's attack — or its defence — on a staged board, through the REAL
 * pipeline: the scenario's runes go through `addRune`, the domain's own
 * `resolveTurn` produces the events (so every path, hit, intercept and
 * shatter is authentic), and the game's own renderer plays them. Nothing here
 * is a lookalike.
 *
 * It exists so each rune's effects can be built and judged in isolation:
 * `tools/fx-bench/shoot.mjs` drives `window.__fxbench` headlessly — load a
 * scenario, step the clock frame by frame, grab frames into a contact sheet,
 * and render the scenario's SOUND offline (every cue the game asked for,
 * through the real recipes and the real bus) into a WAV and a spectrogram.
 *
 * Open it by hand at `/?clean=1#/fx-bench?s=archer-hit` to watch one loop.
 *
 * ISOLATION: only the scenario rune's events (plus the board's own — the
 * placements, shatters, captures and combos that follow from them) are kept;
 * every other rune on the board is a passive dummy (a pre-placed warhead or
 * crown never acts) or has its events dropped. The kept events are re-timed
 * to start 150 ms in.
 */

const canvas = ref<HTMLCanvasElement | null>(null)
const current = ref<string>('')
let renderer: ArenaRenderer | null = null
let view: ArenaView | null = null
let now = 0
let endMs = 0
let cues: CueCall[] = []
let raf = 0
let auto = true

const makeView = (before: BoardState, after: BoardState, events: ResolveEvent[]): ArenaView => {
  const count = (o: string) => before.tiles.reduce((n, t) => n + (t.owner === o ? 1 : 0), 0)
  return {
    config: nodeConfig(7, 'medium'),
    board: before,
    phase: 'resolve',
    turn: 3,
    turnLimit: 30,
    suddenDeath: false,
    hand: [],
    rerollsLeft: 0,
    playerMove: null,
    timer: { totalMs: 10_000, leftMs: 10_000, paused: true },
    drag: null,
    selected: -1,
    lock: null,
    hover: null,
    reveal: null,
    timeline: { before, after, events, elapsedMs: 0 },
    ghost: null,
    skin: 'river',
    result: null,
    playerTiles: count('player'),
    enemyTiles: count('enemy'),
    streak: 0,
    ageMs: 0,
    resetting: false,
    labels: LABELS
  }
}

const resize = (): void => {
  const c = canvas.value
  if (!c || !renderer) return
  const w = c.clientWidth
  const h = c.clientHeight
  const dpr = Math.min(3, window.devicePixelRatio || 1)
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  renderer.resize(w, h, dpr, { top: 0, bottom: 0, left: 0, right: 0 })
}

/** Load a scenario and rewind to t = 0. Returns what the harness needs to plan its frames. */
const load = (id: string) => {
  const sc = SCENARIOS.find((s) => s.id === id)
  if (!sc || !renderer) throw new Error(`no scenario ${id}`)
  const b = build(sc)
  resetVfx()
  view = makeView(b.before, b.after, b.events)
  now = 0
  endMs = b.endMs
  cues = []
  current.value = id
  renderer.draw(view, 16, now)
  return {
    id, rune: sc.rune, title: sc.title, endMs,
    events: b.events.map((e) => ({ kind: e.kind, at: e.at, dur: e.dur, impact: e.at + e.dur * eventImpactFrac(e), owner: ownerOf(e) })),
    board: renderer.layout().board
  }
}

/** Advance the clock by `dt` ms and draw one frame. */
const step = (dt: number): { t: number; particles: number; drawMs: number } => {
  if (!view || !renderer) return { t: now, particles: 0, drawMs: 0 }
  now += dt
  if (view.timeline) view.timeline.elapsedMs = now
  view.ageMs = now
  const t0 = performance.now()
  renderer.draw(view, dt, now)
  return { t: now, particles: particleCount(), drawMs: performance.now() - t0 }
}

/** The canvas as a PNG data URL. */
const snap = (): string => canvas.value?.toDataURL('image/png') ?? ''

/** Render every cue the scenario asked for, offline, through the real recipes and bus. */
const sound = async (): Promise<{ wav: string; spec: string; stats: ReturnType<typeof measure>; cues: CueCall[] }> => {
  const buf = await renderCues(cues)
  return { wav: wavBase64(buf), spec: spectrogram(buf).toDataURL('image/png'), stats: measure(buf), cues }
}

const loop = (): void => {
  raf = requestAnimationFrame(loop)
  if (!auto || !view) return
  step(1000 / 60)
  if (now > endMs + 400) load(current.value)
}

onMounted(() => {
  const c = canvas.value
  if (!c) return
  renderer = createArenaRenderer(c)
  resize()
  window.addEventListener('resize', resize)
  // Every cue the game asks for, with the bench clock's time — before any
  // gating, so a headless run with no audio context still records them.
  __setSfxTap((id, power, opts) => { cues.push({ id, power, opts, atMs: now }) })
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '')
  load(q.get('s') ?? SCENARIOS[0]!.id)
  ;(window as unknown as Record<string, unknown>).__fxbench = {
    scenarios: () => SCENARIOS.map((s) => ({ id: s.id, rune: s.rune, title: s.title })),
    load: (id: string) => { auto = false; return load(id) },
    step,
    snap,
    sound,
    tier: (t: QualityTier) => __setQualityTier(t),
    play: () => { auto = true },
    /** Run the planning-time warm-up for every rune (what the game does before a resolution). */
    warm: () => {
      const size = renderer?.layout().tile ?? 80
      for (const t of RUNE_TYPES) warmRune(t, size, 2, 1)
    },
    /** How full the shared bake cache (480) and the particle-sprite registry (512) are. */
    caches: () => ({ baked: bakedSpriteCount(), registered: registeredSpriteCount() })
  }
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  __setSfxTap(null)
  renderer?.dispose()
  renderer = null
  delete (window as unknown as Record<string, unknown>).__fxbench
})
</script>

<template lang="pug">
  div.fx-bench
    canvas.fx-bench__canvas(ref="canvas")
    div.fx-bench__label {{ current }}
</template>

<style scoped lang="sass">
.fx-bench
  position: fixed
  inset: 0
  background: #0b0d14

.fx-bench__canvas
  width: 100%
  height: 100%
  display: block

.fx-bench__label
  position: absolute
  left: 8px
  top: 6px
  font: 12px system-ui, sans-serif
  color: #8d9bb0
</style>
