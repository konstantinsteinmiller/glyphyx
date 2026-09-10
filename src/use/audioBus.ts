import { getAudioContext } from '@/use/useAssets'

/**
 * ─── One room, one master ───────────────────────────────────────────────────
 *
 * Every sound the game makes — the synthesised board layer, the shipped
 * samples, the music engine — used to connect straight to `ctx.destination`.
 * Each voice was mixed on its own, nothing shared a space, and eight of them
 * landing in the same 200 ms simply added up until the output clipped. It is
 * the difference you hear between a game that sounds *made* and one that
 * sounds *assembled*, and it is fixed with about forty lines of graph:
 *
 *   voice ──┬─────────────────────────────► sfx / music bus ─┐
 *           └─ send ─► REVERB (one shared room) ─────────────┤
 *                                                            ▼
 *                                       glue compressor ─► soft clip ─► out
 *
 * ── The room ──
 *
 * A convolution reverb on an impulse response built here, in about a
 * millisecond: noise under an exponential decay, darkened as it falls (a real
 * room loses its highs first) behind a short pre-delay. One shared room is
 * what makes a slate crack and a cello sound like they are in the same place,
 * and the send is per voice, so a click stays dry and a bell blooms.
 *
 * ── The glue ──
 *
 * A gentle compressor (3:1, soft knee) rides the sum, then a `tanh` curve
 * catches anything still over the line. Neither is doing tone: they exist so
 * that a nuke landing on top of a full board is LOUD rather than CLIPPED, and
 * so the quiet things underneath it are still there when it passes.
 *
 * ── Easy on the ears ──
 *
 * A high shelf takes 3.5 dB off everything above 6 kHz. Synthesis is full of
 * energy up there — every filtered-noise transient in the game has some — and
 * on the small hard speaker of a phone that band is the one that turns a
 * forty-minute session into a headache. Nothing else in the mix has to be
 * tamed for it, and nothing sounds dull: it is the shelf a mastering engineer
 * would reach for first.
 *
 * Built once per AudioContext and cached. Any browser missing a node type
 * (older Safari has no `createConvolver` worth using) simply loses that stage:
 * `bus()` degrades to a plain gain rather than throwing, because silence in a
 * portal build is a bug report and a dry mix is not.
 */

export interface AudioBus {
  ctx: AudioContext
  /** Where a synthesised or sampled EFFECT goes. */
  sfx: GainNode
  /** Where the music engine goes — its own fader, so the two sliders are real. */
  music: GainNode
  /** Feed a voice in here to put it in the room. Gain is per voice, not here. */
  reverb: AudioNode | null
  /** Shared white noise, one buffer for the life of the context. */
  noise: AudioBuffer
}

const buses = new WeakMap<AudioContext, AudioBus>()

/**
 * The impulse: 1.9 s of noise, decaying exponentially and getting darker as it
 * goes, after 18 ms of pre-delay. Stereo, with the two channels decorrelated —
 * the same noise in both ears is a mono room, and a mono room around a stereo
 * board is worse than no room at all.
 */
const impulse = (ctx: AudioContext): AudioBuffer => {
  const sr = ctx.sampleRate
  const len = Math.floor(sr * 1.9)
  const pre = Math.floor(sr * 0.018)
  const buf = ctx.createBuffer(2, len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    // A one-pole lowpass whose cutoff falls with the tail: the late reflections
    // are duller than the early ones, which is the whole character of a stone
    // room and the reason a flat noise burst sounds like static.
    let lp = 0
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / (len - pre)
      const decay = Math.pow(1 - t, 2.6)
      const a = 0.35 - 0.28 * t
      lp += a * ((Math.random() * 2 - 1) - lp)
      d[i] = lp * decay
    }
  }
  return buf
}

/** A soft saturation curve — linear until it is not, and never past ±1. */
const softClip = (ctx: AudioContext): WaveShaperNode | null => {
  if (typeof ctx.createWaveShaper !== 'function') return null
  const n = 1024
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(x * 1.35) / Math.tanh(1.35)
  }
  const ws = ctx.createWaveShaper()
  ws.curve = curve
  ws.oversample = '2x'
  return ws
}

const build = (ctx: AudioContext): AudioBus => {
  const master = ctx.createGain()
  master.gain.value = 1

  let tail: AudioNode = master
  // The shelf first, so the compressor is not reacting to energy that is about
  // to be taken out anyway.
  if (typeof ctx.createBiquadFilter === 'function') {
    const shelf = ctx.createBiquadFilter()
    shelf.type = 'highshelf'
    shelf.frequency.value = 6000
    shelf.gain.value = -3.5
    tail.connect(shelf)
    tail = shelf
  }
  if (typeof ctx.createDynamicsCompressor === 'function') {
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -16
    comp.knee.value = 14
    comp.ratio.value = 3
    comp.attack.value = 0.006
    comp.release.value = 0.19
    tail.connect(comp)
    tail = comp
  }
  const clip = softClip(ctx)
  if (clip) {
    tail.connect(clip)
    tail = clip
  }
  tail.connect(ctx.destination)

  const sfx = ctx.createGain()
  sfx.gain.value = 1
  sfx.connect(master)
  const music = ctx.createGain()
  music.gain.value = 1
  music.connect(master)

  // The room hangs off the master rather than either bus, so a wet effect and a
  // wet cello share it — one space, not two.
  let reverb: AudioNode | null = null
  if (typeof ctx.createConvolver === 'function') {
    try {
      const conv = ctx.createConvolver()
      conv.buffer = impulse(ctx)
      const wet = ctx.createGain()
      wet.gain.value = 0.9
      conv.connect(wet).connect(master)
      reverb = conv
    } catch {
      reverb = null
    }
  }

  // One noise buffer for everything. Rebuilding it per voice was a second of
  // `Math.random()` per resolution on a phone.
  const len = Math.floor(ctx.sampleRate * 1.2)
  const noise = ctx.createBuffer(1, len, ctx.sampleRate)
  const nd = noise.getChannelData(0)
  for (let i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1

  return { ctx, sfx, music, reverb, noise }
}

/** The bus for the shared context, built on first use. `null` before unlock. */
export const bus = (): AudioBus | null => {
  const ctx = getAudioContext()
  if (!ctx) return null
  const hit = buses.get(ctx)
  if (hit && hit.noise.sampleRate === ctx.sampleRate) return hit
  const made = build(ctx)
  buses.set(ctx, made)
  return made
}

/**
 * Dev-only probe, the same pattern as `__assetDebug` and `__arena`: a browser
 * harness cannot otherwise reach the graph. A dynamic `import()` of this module
 * from a page script is a SECOND module instance with its own context, so a
 * harness that measured through it would be listening to a bus nothing plays
 * into — which is exactly the wrong answer, arrived at silently. Gated on DEV,
 * so it is eliminated from every platform build.
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__audioBus = () => bus()
}

/**
 * Put `node` in the room at `amount` (0…1) as well as sending it dry to `to`.
 * A voice with no send stays where it is; the room is an ingredient, not a
 * setting.
 */
export const space = (b: AudioBus, node: AudioNode, to: AudioNode, amount: number): void => {
  node.connect(to)
  if (!b.reverb || amount <= 0) return
  const send = b.ctx.createGain()
  send.gain.value = amount
  node.connect(send)
  send.connect(b.reverb)
}
