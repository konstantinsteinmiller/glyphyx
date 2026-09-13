// ─── The mortar's effects (`runeFx/bombard.ts`, `runeSfx/bombard*.ts`) ──────
//
// What is particular to the mortar: the shell ALWAYS lands (and is heard)
// whether or not its footprint holds a stone, a tube with no footprint on the
// board still fires, the landing is a heavy blow, the tube's acting comes back
// to rest, the frame path builds no gradients on the arena canvas — and the
// click-free noise voices really do start silent.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RUNE_FX, type FxApi, type RuneEvent } from '@/use/runeFx'
import type { Shot } from '@/use/runeFx/types'
import { SCENARIOS, build, type Scenario } from '@/use/runeFx/scenarios'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

// The audio layer reaches the shared context through `useAssets`; the voices
// test hands its own context in, so the asset loader's graph is not needed.
vi.mock('@/use/useAssets', () => ({
  getAudioContext: () => null,
  isAudioSuspended: () => false,
  loadAudioBuffer: async () => null,
  resourceCache: { images: new Map(), audio: new Map(), audioBuffers: new Map() },
  registerHtmlAudio: () => undefined,
  unregisterHtmlAudio: () => undefined,
  registerOneShotSource: () => undefined,
  suspendAllAudio: () => undefined,
  resumeAllAudio: () => undefined,
  killOneShotSfx: () => undefined,
  __audioDebugSnapshot: () => ({})
}))

interface Rec {
  sounds: { id: string; power: number }[]
  shakes: string[]
  poses: Map<number, [number, number, number, number]>
  gradients: number
}

const makeCtx = (rec: Rec): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1 }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient' || k === 'createConicGradient') {
        return () => { rec.gradients++; return { addColorStop: () => undefined } }
      }
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
}

const makeApi = (tier: 0 | 1 | 2 = 2): FxApi & { rec: Rec } => {
  const rec: Rec = { sounds: [], shakes: [], poses: new Map(), gradients: 0 }
  const size = 80
  return {
    rec,
    ctx: makeCtx(rec),
    size,
    tier,
    mul: 1,
    canEmit: true,
    now: 0,
    board: { x: 0, y: 0, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col) => col * size + size / 2,
    cy: (_c, row) => row * size + size / 2,
    pose: (id, ox, oy, sx = 1, sy = 1) => { rec.poses.set(id, [ox, oy, sx, sy]) },
    flash: () => undefined,
    shake: (kind) => { rec.shakes.push(kind) },
    sound: (id, power) => { rec.sounds.push({ id, power }) },
    sideColor: (side) => (side === 'player' ? '#4aa8ff' : '#8dff5a'),
    stoneOf: () => '#8a8f9c',
    inkOf: () => '#1b1206',
    art: () => null
  }
}

const shellOf = (sc: Scenario): Shot => {
  const e = build(sc).events.find((x) => x.kind === 'shot' && x.from.type === 'bombard')
  if (!e || e.kind !== 'shot') throw new Error(`${sc.id}: no shell`)
  return e
}

const play = (e: Shot, api: FxApi): void => {
  const mod = RUNE_FX.bombard
  const ia = mod.impactAt?.(e) ?? 0.66
  const end = 1 + (mod.tailMs?.(e) ?? 220) / e.dur
  mod.start?.(e, api)
  let hit = false
  for (let p = 0; p <= end; p += 1000 / 60 / e.dur) {
    if (!hit && p >= ia) { mod.impact?.(e, api); hit = true }
    mod.paint?.(e, p, api)
  }
}

const P = 'player' as const
const E = 'enemy' as const

beforeEach(() => {
  resetVfx()
  __setQualityTier('high')
})

describe('the mortar', () => {
  it('lands inside the contract window, before a stone it kills starts to shatter', () => {
    const e = shellOf(SCENARIOS.find((s) => s.id === 'bombard-shell')!)
    const ia = RUNE_FX.bombard.impactAt!(e)!
    expect(ia).toBeGreaterThanOrEqual(0.3)
    // The first ranged event's shatters start at 0.75 of its window.
    expect(ia).toBeLessThan(0.75)
    expect(RUNE_FX.bombard.tailMs!(e)!).toBeLessThanOrEqual(450)
    const heal = build(SCENARIOS.find((s) => s.id === 'support-heal')!).events.find((x) => x.kind === 'heal') as RuneEvent
    expect(RUNE_FX.bombard.impactAt!(heal)).toBeUndefined()
  })

  it('fires, lands heavily, and puts the tube back at rest', () => {
    const e = shellOf(SCENARIOS.find((s) => s.id === 'bombard-shell')!)
    const api = makeApi()
    play(e, api)
    expect(api.rec.sounds.map((s) => s.id)).toEqual(['shell', 'shellHit'])
    expect(api.rec.shakes).toEqual(['strong'])
    expect(api.rec.poses.get(e.from.id)).toEqual([0, 0, 1, 1])
    expect(particleCount()).toBeGreaterThan(40)
  })

  it('lands on an empty footprint just the same — the blast is what teaches the reach', () => {
    const e = shellOf({ id: 't-empty', rune: 'bombard', title: '', runes: [[P, 'bombard', 1, 3, 'up']] })
    expect(e.hits).toEqual([])
    expect(e.path.length).toBe(3)
    const api = makeApi()
    play(e, api)
    const hit = api.rec.sounds.find((s) => s.id === 'shellHit')
    expect(hit?.power).toBe(1)
    expect(api.rec.shakes).toEqual(['strong'])
  })

  it('a tube with no footprint on the board still fires, and is heard landing beyond it', () => {
    const e = shellOf({ id: 't-out', rune: 'bombard', title: '', runes: [[P, 'bombard', 1, 1, 'up']] })
    expect(e.path).toEqual([])
    const api = makeApi()
    play(e, api)
    const hit = api.rec.sounds.find((s) => s.id === 'shellHit')
    expect(hit, 'shellHit must always play').toBeDefined()
    expect(hit!.power).toBeLessThan(0.6)
    expect(api.rec.shakes).toEqual([])
  })

  it('an enemy tube and a Lv 2 tube play through cleanly', () => {
    const api = makeApi()
    play(shellOf({ id: 't-enemy', rune: 'bombard', title: '', runes: [[E, 'bombard', 2, 0, 'down'], [P, 'crown', 2, 3, 'up', 2]] }), api)
    play(shellOf({ id: 't-lv2', rune: 'bombard', title: '', runes: [[P, 'bombard', 1, 3, 'up', 2], [E, 'crown', 1, 1, 'down', 2]] }), api)
    expect(api.rec.sounds.filter((s) => s.id === 'shellHit').length).toBe(2)
  })

  it('builds no gradient on the arena canvas, at any tier', () => {
    for (const tier of [2, 1, 0] as const) {
      const api = makeApi(tier)
      play(shellOf(SCENARIOS.find((s) => s.id === 'bombard-shell')!), api)
      expect(api.rec.gradients, `tier ${tier}`).toBe(0)
    }
  })
})

// ─── The click-free voices (`runeSfx/bombard.voices.ts`) ────────────────────

interface MockParam {
  value: number
  events: number
  /** Was `value` set to 0 before the first scheduled event? */
  silencedFirst: boolean | null
  setValueAtTime: () => void
  exponentialRampToValueAtTime: () => void
  linearRampToValueAtTime: () => void
}

const mockParam = (init: number): MockParam => {
  let v = init
  const p = {
    events: 0,
    silencedFirst: null as boolean | null,
    setValueAtTime: () => { p.events++ },
    exponentialRampToValueAtTime: () => { p.events++ },
    linearRampToValueAtTime: () => { p.events++ }
  } as MockParam
  Object.defineProperty(p, 'value', {
    get: () => v,
    set: (x: number) => { if (p.events === 0 && p.silencedFirst === null) p.silencedFirst = x === 0; v = x }
  })
  return p
}

const makeAudio = () => {
  const gains: { gain: MockParam }[] = []
  const node = () => ({
    connect: (to: unknown) => to, disconnect: () => undefined, start: () => undefined, stop: () => undefined,
    buffer: null as unknown, loop: false, type: 'sine', curve: null, oversample: 'none',
    frequency: mockParam(440), detune: mockParam(0), Q: mockParam(1), playbackRate: mockParam(1), pan: mockParam(0),
    threshold: mockParam(0), knee: mockParam(0), ratio: mockParam(1), attack: mockParam(0), release: mockParam(0),
    // A shelf filter's own gain (the bus's master shelf) — not a voice gain.
    gain: mockParam(0)
  })
  const ctx = {
    state: 'running', currentTime: 0, sampleRate: 48000, destination: node(),
    createBuffer: (_c: number, len: number, sr: number) => ({ sampleRate: sr, length: len, getChannelData: () => new Float32Array(len) }),
    createBufferSource: node, createBiquadFilter: node, createOscillator: node, createStereoPanner: node,
    createConvolver: node, createDynamicsCompressor: node, createWaveShaper: node, createDelay: node,
    createGain: () => { const g = { ...node(), gain: mockParam(1) }; gains.push(g); return g }
  }
  return { ctx: ctx as unknown as BaseAudioContext, gains }
}

describe('the click-free voices', () => {
  it('start every voice gain SILENT, not at the default 1 (no one-sample spike at the note\'s start)', async () => {
    const v = await import('@/use/runeSfx/bombard.voices')
    const { busFor } = await import('@/use/audioBus')
    const { ctx, gains } = makeAudio()
    busFor(ctx)
    const calls: Array<[string, () => void]> = [
      ['noise', () => v.noise(ctx, { duration: 0.1, gain: 0.2, filterFrom: 4000, filterTo: 1000, type: 'highpass', delay: 0.0123 })],
      ['air', () => v.air(ctx, { duration: 0.1, from: 500, to: 1500, gain: 0.1, delay: 0.0071 })],
      ['grit', () => v.grit(ctx, { duration: 0.1, density: 80, gain: 0.1, freq: 3000, delay: 0.0033 })],
      ['rise', () => v.rise(ctx, { duration: 0.1, from: 500, to: 1500, gain: 0.1, delay: 0.0019 })],
      ['string', () => v.string(ctx, { freq: 175, duration: 0.2, gain: 0.1, delay: 0.0091 })],
      ['whistle', () => v.whistle(ctx, { from: 1175, to: 466, duration: 0.15, gain: 0.05, delay: 0.0457 })]
    ]
    for (const [name, call] of calls) {
      const before = gains.length
      call()
      // The first gain a voice builds is its own envelope; the send to the room comes after.
      const own = name === 'whistle' ? gains[before + 1] : gains[before]
      expect(own, `${name} built no gain`).toBeDefined()
      expect(own!.gain.silencedFirst, `${name}'s gain was not silenced before its envelope`).toBe(true)
    }
  })
})
