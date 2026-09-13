// ─── The cue table is complete and every sample it names exists ─────────────
//
// The mixer's vocabulary (`FxSound` in `src/game/cues.ts`) is frozen: the
// renderer and the battle composable call `playFx('place')` and friends, and a
// cue that is in the union but has no sound behind it fails SILENTLY — the
// call returns, nothing plays, and no test that mounts a canvas would ever
// notice. So the table is asserted directly, against a hard-coded copy of the
// union: adding a cue there without a sound here fails this file.
//
// Likewise a sample cue naming a file that is not in `public/audio/sfx` is a
// 404 in a portal QA console, which reads as a broken build. The directory is
// read from disk so the check cannot drift from what ships.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { FxSound } from '@/game/cues'

// ─── A minimal Web Audio double ─────────────────────────────────────────────
//
// jsdom has no AudioContext. The stub counts every node the synth builds so a
// cue that reaches `synth` provably does SOMETHING, and it accepts the whole
// parameter-automation surface (`setValueAtTime`, ramps) so no cue can throw
// on a method the real API has and the double forgot.

let nodesBuilt = 0

const param = () => ({
  value: 0,
  setValueAtTime: () => undefined,
  exponentialRampToValueAtTime: () => undefined,
  linearRampToValueAtTime: () => undefined
})

const node = () => {
  nodesBuilt++
  const n: Record<string, unknown> = {
    connect: (to: unknown) => to,
    disconnect: () => undefined,
    start: () => undefined,
    stop: () => undefined,
    addEventListener: () => undefined,
    buffer: null,
    loop: false,
    type: 'sine',
    curve: null,
    oversample: 'none',
    normalize: true,
    delayTime: param(),
    threshold: param(),
    knee: param(),
    ratio: param(),
    attack: param(),
    release: param(),
    playbackRate: param(),
    frequency: param(),
    detune: param(),
    Q: param(),
    gain: param(),
    pan: param()
  }
  return n
}

const makeCtx = (state: 'running' | 'suspended' = 'running', sampleRate = 48000) => ({
  state,
  currentTime: 0,
  sampleRate,
  destination: node(),
  createBuffer: (_ch: number, len: number, sr: number) => ({
    sampleRate: sr,
    getChannelData: () => new Float32Array(len)
  }),
  createBufferSource: node,
  createBiquadFilter: node,
  createGain: node,
  createOscillator: node,
  createStereoPanner: node,
  // The master chain and the shared room (`audioBus.ts`). A runtime missing any
  // of these degrades to a dry voice rather than a silent one, which is worth
  // having covered too — see the `no bus` test below.
  createConvolver: node,
  createDynamicsCompressor: node,
  createWaveShaper: node,
  createDelay: node
})

let ctx: ReturnType<typeof makeCtx> | null = makeCtx()
const playSound = vi.fn()

// The mixer reaches the audio layer through `useAssets` (the shared context)
// and `useSound` (the sample path). Both are replaced so the test needs neither
// a real context nor the asset loader's own import graph.
vi.mock('@/use/useAssets', () => ({
  getAudioContext: () => ctx,
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

vi.mock('@/use/useSound', () => ({
  default: () => ({ playSound, playRandomVariant: vi.fn(), playLoop: vi.fn() }),
  useMusic: () => ({}),
  forceStopMusic: () => undefined,
  resumeMusicAfterAd: () => undefined
}))

/** Every member of the `FxSound` union, copied by hand on purpose: the union
 *  is a type and cannot be enumerated at runtime, and the whole point is to
 *  catch a member added to it that the table forgot. */
const ALL_CUES: readonly FxSound[] = [
  'pickup', 'hover', 'invalid', 'aim', 'place', 'reroll',
  'tick', 'tickFinal', 'reveal',
  'arrow', 'arrowHit', 'beam', 'beamHit', 'slash', 'slashHit',
  'cleave', 'cleaveHit', 'roll', 'rollHit', 'shell', 'shellHit', 'explode', 'nuke', 'crown',
  'shield', 'aura', 'intercept', 'heal', 'buff', 'shatter', 'clash', 'knockback', 'capture', 'merge', 'combo',
  'victory', 'defeat', 'suddenDeath', 'reset',
  'chestPop', 'chestOpen', 'unlock', 'coin', 'countUp', 'streak', 'forge', 'skinBuy', 'uiOpen', 'uiReject'
]

const SFX_DIR = resolve(__dirname, '../../public/audio/sfx')
const shipped = new Set(readdirSync(SFX_DIR).filter((f) => f.endsWith('.ogg')).map((f) => f.slice(0, -4)))

beforeEach(() => {
  ctx = makeCtx()
  nodesBuilt = 0
  playSound.mockClear()
})

describe('the cue table', () => {
  it('has a sound behind every member of the FxSound union', async () => {
    const { __cueIsDefined } = await import('@/use/useGameAudio')
    const missing = ALL_CUES.filter((id) => !__cueIsDefined(id))
    expect(missing).toEqual([])
  })

  it('only names samples that ship under public/audio/sfx', async () => {
    const { SAMPLE_CUES, LAYER_SAMPLES } = await import('@/use/useGameAudio')
    const named = [...Object.values(SAMPLE_CUES), ...Object.values(LAYER_SAMPLES)].map(([file]) => file)
    expect(named.length).toBeGreaterThan(0)
    const absent = named.filter((f) => !shipped.has(f))
    expect(absent, 'sample files missing from public/audio/sfx').toEqual([])
  })

  it('keeps every sample volume inside the mix (a ratio, not a gain)', async () => {
    const { SAMPLE_CUES, LAYER_SAMPLES } = await import('@/use/useGameAudio')
    for (const [, ratio] of [...Object.values(SAMPLE_CUES), ...Object.values(LAYER_SAMPLES)]) {
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(0.2)
    }
  })
})

describe('playFx', () => {
  it('plays every cue at every power without throwing, and each one does something', async () => {
    const audio = await import('@/use/useGameAudio')
    for (const id of ALL_CUES) {
      for (const power of [0, 0.5, 1, Number.NaN]) {
        audio.__resetThrottles()
        const before = nodesBuilt
        const calls = playSound.mock.calls.length
        expect(() => audio.playFx(id, power)).not.toThrow()
        const synthesised = nodesBuilt > before
        const sampled = playSound.mock.calls.length > calls
        expect(synthesised || sampled, `${id} at power ${power} produced no sound`).toBe(true)
      }
    }
  })

  it('routes a sample cue to the sample player and builds no synth graph', async () => {
    const audio = await import('@/use/useGameAudio')
    audio.__resetThrottles()
    audio.playFx('coin')
    expect(playSound).toHaveBeenCalledTimes(1)
    expect(playSound.mock.calls[0]![0]).toBe('coin-pickup')
    expect(nodesBuilt).toBe(0)
  })

  it('layers a recorded sample UNDER the synthesised placement thud', async () => {
    const audio = await import('@/use/useGameAudio')
    audio.__resetThrottles()
    audio.playFx('place', 1)
    expect(playSound).toHaveBeenCalledTimes(1)
    expect(playSound.mock.calls[0]![0]).toBe('stone-cut')
    expect(nodesBuilt).toBeGreaterThan(0)
  })

  it('throttles a cue fired back to back inside its minimum gap', async () => {
    const audio = await import('@/use/useGameAudio')
    audio.__resetThrottles()
    audio.playFx('shatter', 1)
    const after = nodesBuilt
    audio.playFx('shatter', 1)
    expect(nodesBuilt).toBe(after)
  })

  it('is silent — and safe — when there is no AudioContext at all', async () => {
    const audio = await import('@/use/useGameAudio')
    ctx = null
    audio.__resetThrottles()
    expect(() => audio.playFx('merge', 1)).not.toThrow()
    expect(nodesBuilt).toBe(0)
    expect(() => audio.warmAudio()).not.toThrow()
  })

  it('does not queue voices into a context that has not been unlocked yet', async () => {
    const audio = await import('@/use/useGameAudio')
    ctx = makeCtx('suspended')
    nodesBuilt = 0
    audio.__resetThrottles()
    audio.playFx('reveal')
    expect(nodesBuilt).toBe(0)
  })

  it('builds its buffers once and reuses them, however many cues fire', async () => {
    const audio = await import('@/use/useGameAudio')
    // A sample rate no earlier test used, so nothing cached on the context (the
    // noise, the reverb's impulse) can be satisfied from an earlier one.
    const c = makeCtx('running', 22050)
    ctx = c
    const spy = vi.spyOn(c, 'createBuffer')
    audio.warmAudio()
    audio.warmAudio()
    // Warming builds the shared bus: one room (the convolver's impulse) and one
    // white-noise buffer, and never more than that.
    const afterWarm = spy.mock.calls.length
    expect(afterWarm).toBeLessThanOrEqual(2)
    audio.__resetThrottles()
    for (const cue of ['shatter', 'place', 'roll', 'nuke'] as const) {
      audio.__resetThrottles()
      audio.playFx(cue, 0.5)
    }
    // Every one of those is built on noise; not one of them allocated another.
    expect(spy).toHaveBeenCalledTimes(afterWarm)
  })
})

// ─── The rune voices (`runeSfx/`) ───────────────────────────────────────────
//
// Each rune owns its attack / defence cues in its own file. The renderer calls
// them with a PLACEMENT (`pan`, `level`, `side`), so every one must cope with
// the whole range — and because a reveal fires every rune on the board inside
// a second, each recipe is held to a node budget.

/** Nodes one cue may build. A reveal is up to ~16 of these at once. */
const NODE_BUDGET = 48

describe('rune voices', () => {
  it('each rune owns at least one cue, and no cue belongs to two runes or shadows a base cue', async () => {
    const { RUNE_SFX_BY_RUNE } = await import('@/use/runeSfx')
    const seen = new Map<string, string>()
    for (const [rune, table] of Object.entries(RUNE_SFX_BY_RUNE)) {
      const cues = Object.keys(table)
      expect(cues.length, `${rune} has no voice`).toBeGreaterThan(0)
      for (const c of cues) {
        expect(seen.get(c), `${c} is claimed by ${seen.get(c)} and ${rune}`).toBeUndefined()
        seen.set(c, rune)
        expect(ALL_CUES as readonly string[], `${c} (${rune}) is not an FxSound`).toContain(c)
      }
    }
  })

  it('plays every rune cue at every level and pan without throwing, inside the node budget', async () => {
    const audio = await import('@/use/useGameAudio')
    const { RUNE_SFX_BY_RUNE } = await import('@/use/runeSfx')
    audio.warmAudio()
    for (const table of Object.values(RUNE_SFX_BY_RUNE)) {
      for (const id of Object.keys(table) as FxSound[]) {
        for (const level of [1, 2, 4, 8]) {
          for (const pan of [-0.8, 0, 0.8]) {
            for (const side of ['player', 'enemy'] as const) {
              audio.__resetThrottles()
              const before = nodesBuilt
              expect(() => audio.playFx(id, 0.8, { pan, level, side })).not.toThrow()
              const built = nodesBuilt - before
              expect(built, `${id} Lv ${level} pan ${pan} built nothing`).toBeGreaterThan(0)
              expect(built, `${id} Lv ${level} built ${built} nodes`).toBeLessThanOrEqual(NODE_BUDGET)
            }
          }
        }
      }
    }
  })

  it('tells the bench tap about every cue asked for, before any gating', async () => {
    const audio = await import('@/use/useGameAudio')
    const heard: string[] = []
    audio.__setSfxTap((id) => { heard.push(id) })
    audio.__resetThrottles()
    audio.playFx('slash', 1, { pan: 0.5, level: 2 })
    audio.playFx('slash', 1, { pan: 0.5, level: 2 }) // throttled — still tapped
    audio.__setSfxTap(null)
    expect(heard).toEqual(['slash', 'slash'])
  })
})
