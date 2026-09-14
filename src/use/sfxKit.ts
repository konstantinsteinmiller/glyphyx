import { busFor, space } from '@/use/audioBus'
import useUser from '@/use/useUser'
import type { SfxOpts } from '@/game/cues'

/**
 * ─── The synthesis kit ──────────────────────────────────────────────────────
 *
 * Every instrument the board's sounds are built from, shared by the base cues
 * (`useGameAudio.ts`) and the per-rune recipes (`runeSfx/<rune>.ts`). A recipe
 * is a function `(ctx, p, r, o)` that calls these; nothing here knows which cue
 * it is part of.
 *
 * ── The palette ──
 *
 * Two rules turn a pile of beeps into a sound DESIGN, and both live here:
 *
 * 1. EVERYTHING IS IN THE SAME KEY. The music is D minor (`@/game/music`), so
 *    every pitched voice is a note of D minor — `NOTE(d)` is the only place a
 *    melodic frequency comes from. In key, forty cues an encounter sit INSIDE
 *    the music instead of fighting it; out of key they are a chord nobody
 *    wrote, and the fatigue that produces is what players call "annoying".
 * 2. EVERYTHING IS IN THE SAME ROOM. Each voice sends some of itself to the
 *    shared reverb in `audioBus.ts` (`space`, 0…1 — a click almost none, a bell
 *    a lot), so the board sounds like a place rather than a mixing desk.
 *
 * ── Placement ──
 *
 * `playFx` opens a VOICE around each cue (`beginVoice` / `endVoice`): every
 * instrument the recipe plays lands on that voice's stereo panner, so the
 * whole cue sits where its event happened. Offline renders also use the
 * voice's start offset (`at`) to schedule a timeline of cues.
 *
 * ── Budget ──
 *
 * A reveal fires every rune on the board inside one second. Each instrument
 * below says how many nodes it builds; keep a recipe under ~48 (the cue test
 * enforces it). Prefer automation (a gain spike train, a filter sweep) over
 * more nodes.
 *
 * Everything runs on the context it is handed — the SHARED one in play, which
 * the ad / pause gate suspends, so "no game audio during an ad" covers every
 * synthesised voice for free.
 */

export type AudioCtx = BaseAudioContext

/** A cue's recipe: `p` the 0…1 intensity hint, `r` a fresh random, `o` where / how big. */
export type Synth = (ctx: AudioCtx, p: number, r: number, o: Required<Pick<SfxOpts, 'pan' | 'level'>> & SfxOpts) => void

// ─── Volume ─────────────────────────────────────────────────────────────────

const { userSoundVolume } = useUser()

/** Master gain for a synthesised voice, folding in the player's SFX slider. */
export const vol = (base: number): number =>
  Math.max(0, Math.min(1, base * (userSoundVolume.value ?? 0.7)))

// ─── The key ────────────────────────────────────────────────────────────────

/** D minor, three octaves, as MIDI. The scale every pitched cue is drawn from. */
export const D_MINOR = [50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81, 82, 84, 86]

/**
 * A degree of the scale, in hertz. `d` is an index into `D_MINOR` (0 = D3, 7 =
 * D4, 14 = D5), so a cue asks for "the fifth above the tonic" rather than for
 * 293 Hz, and the whole game transposes if the music ever does. Negative
 * degrees drop octaves (−7 = D2).
 */
export const NOTE = (d: number): number => {
  const i = Math.round(d)
  const oct = i < 0 ? Math.floor(i / 7) : 0
  const idx = Math.max(0, Math.min(D_MINOR.length - 1, i - oct * 7))
  const midi = D_MINOR[idx]! + oct * 12
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// ─── The voice ──────────────────────────────────────────────────────────────

let voiceIn: AudioNode | null = null
let voiceCtx: AudioCtx | null = null
let voiceAt = 0

/**
 * Open a voice for one cue on `ctx`: a stereo panner at `o.pan` that every
 * instrument lands on, and a start offset `atSec` (0 in play; a timeline
 * position in an offline render). Synchronous by design — `playFx` opens,
 * runs the recipe, closes — so one module-level slot is enough.
 */
export const beginVoice = (ctx: AudioCtx, o?: SfxOpts, atSec = 0): void => {
  voiceCtx = ctx
  voiceAt = atSec
  voiceIn = null
  const pan = o?.pan ?? 0
  if (pan === 0 || typeof ctx.createStereoPanner !== 'function') return
  try {
    const b = busFor(ctx)
    const p = ctx.createStereoPanner()
    p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime + atSec)
    p.connect(b.sfx)
    voiceIn = p
  } catch {
    voiceIn = null
  }
}

export const endVoice = (): void => {
  voiceIn = null
  voiceCtx = null
  voiceAt = 0
}

/**
 * When a voice's note starts: now, plus the voice's offset, plus the note's own
 * delay — SNAPPED to half a sample past the frame grid.
 *
 * Chrome's buffer sources click when a start time lands a hair past a whole
 * sample (a 0.085 s delay at 48 kHz is sample 4080.0000000000005): one sample
 * spiking to −0.5 dBFS whatever the voice's gain. Round-millisecond delays hit
 * it constantly — it is why the old cues peaked 20–30 dB above their loudness.
 * Half a sample off the grid never does, and nobody hears 10 µs.
 */
export const startAt = (ctx: AudioCtx, delay = 0): number => {
  const t = ctx.currentTime + (voiceCtx === ctx ? voiceAt : 0) + delay
  const sr = ctx.sampleRate
  return sr > 0 ? (Math.floor(t * sr) + 0.5) / sr : t
}

/**
 * Where a voice lands: the cue's panner (or the sfx bus), with a send to the
 * room. Every instrument ends here.
 */
export const land = (ctx: AudioCtx, node: AudioNode, amount: number): void => {
  let b: ReturnType<typeof busFor> | null
  try { b = busFor(ctx) } catch { b = null }
  if (!b) {
    node.connect(ctx.destination)
    return
  }
  space(b, node, voiceCtx === ctx && voiceIn ? voiceIn : b.sfx, amount)
}

// ─── Noise ──────────────────────────────────────────────────────────────────

/**
 * Shared white noise: the bus owns one for the life of the context (the music
 * engine uses the same one). Rebuilding noise per event would be a second of
 * `Math.random()` per resolution.
 */
export const getNoise = (ctx: AudioCtx): AudioBuffer => busFor(ctx).noise

/**
 * An optional stereo placement INSIDE the cue's own. `pan` is where the note
 * starts (−1 … +1) and `panTo` where it ends — a whoosh travelling across.
 * Browsers without a panner play it centred.
 */
export const withPan = (
  ctx: AudioCtx, node: AudioNode, pan: number | undefined, panTo: number | undefined, now: number, duration: number
): AudioNode => {
  if (pan === undefined || typeof ctx.createStereoPanner !== 'function') return node
  try {
    const p = ctx.createStereoPanner()
    p.pan.setValueAtTime(pan, now)
    if (panTo !== undefined && panTo !== pan) p.pan.linearRampToValueAtTime(panTo, now + duration)
    node.connect(p)
    return p
  } catch {
    return node
  }
}

// ─── The stock instruments (moved from `useGameAudio`, unchanged) ───────────

export interface NoiseOpts {
  duration: number
  gain: number
  /** Filter sweep, Hz. Either direction: a rising cutoff is a whoosh opening up. */
  filterFrom: number
  filterTo: number
  type?: BiquadFilterType
  q?: number
  delay?: number
  /** Playback-rate jitter centre; 1 = as recorded. */
  rate?: number
  pan?: number
  panTo?: number
  /** How much of this voice goes to the shared room, 0…1. Default: a little. */
  space?: number
  /**
   * Loop the shared 1.2 s noise buffer (from a random point). Off by default,
   * which is how every stock cue was tuned — a burst longer than the buffer
   * simply ends where the noise does. Turn it on for a long tail.
   */
  loop?: boolean
}

/** A filtered noise burst — the backbone of impacts, debris and air. 4–5 nodes. */
export const noiseBurst = (ctx: AudioCtx, o: NoiseOpts): void => {
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.playbackRate.value = (o.rate ?? 1) * (0.85 + Math.random() * 0.3)

  const filter = ctx.createBiquadFilter()
  filter.type = o.type ?? 'lowpass'
  filter.Q.value = o.q ?? 1
  const now = startAt(ctx, o.delay)
  filter.frequency.setValueAtTime(Math.max(40, o.filterFrom), now)
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, o.filterTo), now + o.duration)

  const gain = ctx.createGain()

  gain.gain.value = 0 // silent until its first automation event — never the default 1.0
  gain.gain.setValueAtTime(o.gain, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)

  src.connect(filter).connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, o.panTo, now, o.duration), o.space ?? 0.1)
  if (o.loop) {
    src.loop = true
    src.start(now, Math.random() * 0.9)
  } else {
    src.start(now)
  }
  src.stop(now + o.duration + 0.02)
}

export interface ToneOpts {
  freq: number
  toFreq?: number
  duration: number
  gain: number
  type?: OscillatorType
  delay?: number
  /** Optional lowpass to take the edge off a raw saw/square. */
  filter?: number
  /** Attack, seconds. 4 ms by default — the click-free minimum. A swell wants more. */
  attack?: number
  pan?: number
  panTo?: number
  /** How much of this voice goes to the shared room, 0…1. Default: a little. */
  space?: number
  /** Detune, cents. */
  detune?: number
}

/** A single pitched voice with an exponential envelope. 3–5 nodes. */
export const tone = (ctx: AudioCtx, o: ToneOpts): void => {
  const now = startAt(ctx, o.delay)
  const osc = ctx.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(Math.max(20, o.freq), now)
  if (o.toFreq && o.toFreq !== o.freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.toFreq), now + o.duration)
  }
  if (o.detune) osc.detune.value = o.detune

  const attack = Math.min(o.attack ?? 0.004, o.duration * 0.5)
  const gain = ctx.createGain()
  gain.gain.value = 0 // silent until its first automation event — never the default 1.0
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)

  let node: AudioNode = osc
  if (o.filter) {
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = o.filter
    osc.connect(f)
    node = f
  }
  node.connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, o.panTo, now, o.duration), o.space ?? 0.12)
  osc.start(now)
  osc.stop(now + o.duration + 0.02)
}

/**
 * A struck, ringing voice: a fundamental with two inharmonic partials over it,
 * each dying on its own clock. The sound of something being GAINED — a heal, a
 * merge, a coin — and one function so all of those are recognisably relatives.
 * 3 tones.
 */
export const bellTone = (
  ctx: AudioCtx, o: { freq: number; duration: number; gain: number; delay?: number; space?: number; pan?: number }
): void => {
  const partials: [number, number, number][] = [[1, 1, 1], [2.76, 0.26, 0.6], [5.4, 0.09, 0.35]]
  for (const [mul, amp, life] of partials) {
    tone(ctx, {
      freq: o.freq * mul, duration: o.duration * life, gain: o.gain * amp, type: 'sine',
      delay: o.delay, attack: 0.004, space: o.space ?? 0.3, pan: o.pan
    })
  }
}

// ─── The new instruments ────────────────────────────────────────────────────

export interface FmOpts {
  /** Carrier frequency, Hz. */
  freq: number
  /** Carrier pitch at the end (a glide). */
  toFreq?: number
  /** Modulator : carrier ratio. Integer = harmonic (brass, bell); 1.41, 3.5 … = inharmonic (metal, glass). */
  ratio: number
  /** Modulation index at the strike (× carrier Hz): the brightness. */
  index: number
  /** …and where it falls to by the end: the tone mellowing as it rings. */
  indexTo?: number
  duration: number
  gain: number
  attack?: number
  delay?: number
  type?: OscillatorType
  pan?: number
  space?: number
}

/**
 * Two-operator FM: a modulator bending a carrier's pitch at audio rate. The
 * index falling over the note is what makes FM sound STRUCK — bright at the
 * hit, mellow as it rings — and it is the cheapest way to a convincing metal,
 * glass or bell. 4–5 nodes.
 */
export const fm = (ctx: AudioCtx, o: FmOpts): void => {
  const now = startAt(ctx, o.delay)
  const car = ctx.createOscillator()
  car.type = o.type ?? 'sine'
  car.frequency.setValueAtTime(Math.max(20, o.freq), now)
  if (o.toFreq && o.toFreq !== o.freq) car.frequency.exponentialRampToValueAtTime(Math.max(20, o.toFreq), now + o.duration)

  const mod = ctx.createOscillator()
  mod.frequency.setValueAtTime(Math.max(1, o.freq * o.ratio), now)
  if (o.toFreq && o.toFreq !== o.freq) mod.frequency.exponentialRampToValueAtTime(Math.max(1, o.toFreq * o.ratio), now + o.duration)
  const depth = ctx.createGain()
  depth.gain.setValueAtTime(Math.max(0.0001, o.index * o.freq), now)
  depth.gain.exponentialRampToValueAtTime(Math.max(0.0001, (o.indexTo ?? o.index * 0.1) * o.freq), now + o.duration)
  mod.connect(depth).connect(car.frequency)

  const attack = Math.min(o.attack ?? 0.003, o.duration * 0.5)
  const gain = ctx.createGain()
  gain.gain.value = 0 // silent until its first automation event — never the default 1.0
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)
  car.connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, undefined, now, o.duration), o.space ?? 0.2)
  mod.start(now)
  car.start(now)
  mod.stop(now + o.duration + 0.02)
  car.stop(now + o.duration + 0.02)
}

/**
 * Struck metal: five inharmonic partials of a free bar (the ratios of a real
 * one), each with its own decay — the highs die first, the fundamental rings.
 * A sword's edge, an anvil, a shield boss. `bright` 0…1 keeps more of the top.
 * 5 tones.
 */
export const metal = (
  ctx: AudioCtx, o: { freq: number; duration: number; gain: number; bright?: number; delay?: number; pan?: number; space?: number }
): void => {
  const b = o.bright ?? 0.5
  const partials: [number, number, number][] = [
    [1, 1, 1], [2.32, 0.55 + b * 0.3, 0.7], [4.25, 0.3 + b * 0.35, 0.45], [6.63, 0.12 + b * 0.25, 0.3], [9.38, 0.05 + b * 0.2, 0.18]
  ]
  for (const [mul, amp, life] of partials) {
    tone(ctx, {
      freq: o.freq * mul, duration: o.duration * life, gain: o.gain * amp, type: 'sine',
      delay: o.delay, attack: 0.002, space: o.space ?? 0.25, pan: o.pan
    })
  }
}

// Karplus–Strong strings, rendered once per pitch bucket and cached: a burst
// of filtered noise fed round a delay line one period long, each pass averaged
// with the next sample. That averaging IS the string losing its highs, which
// is why a plucked KS voice sounds like gut and not like a synth.
const pluckCache = new Map<string, AudioBuffer>()

/**
 * A plucked string — the bow's release, a lute, a snapped cord. `bright` 0…1
 * is where it was plucked (near the bridge = bright). 2–4 nodes.
 */
export const pluck = (
  ctx: AudioCtx, o: { freq: number; duration: number; gain: number; bright?: number; delay?: number; pan?: number; space?: number }
): void => {
  const sr = ctx.sampleRate
  const bright = Math.max(0, Math.min(1, o.bright ?? 0.6))
  const key = `${Math.round(o.freq)}|${Math.round(bright * 10)}|${Math.round(o.duration * 20)}|${sr}`
  let buf = pluckCache.get(key)
  if (!buf) {
    const len = Math.max(1, Math.floor(sr * o.duration))
    buf = ctx.createBuffer(1, len, sr)
    const d = buf.getChannelData(0)
    const period = Math.max(2, Math.round(sr / Math.max(30, o.freq)))
    const line = new Float32Array(period)
    // The excitation: noise, darkened for a soft pluck.
    let lp = 0
    for (let i = 0; i < period; i++) {
      lp += (0.25 + bright * 0.75) * ((Math.random() * 2 - 1) - lp)
      line[i] = lp
    }
    // A touch less than 0.5 so the note dies; brighter strings ring longer.
    const decay = 0.4955 + bright * 0.0035
    let idx = 0
    for (let i = 0; i < len; i++) {
      const cur = line[idx]!
      const nxt = line[(idx + 1) % period]!
      const out = (cur + nxt) * decay
      line[idx] = out
      d[i] = cur
      idx = (idx + 1) % period
    }
    if (pluckCache.size > 48) pluckCache.clear()
    pluckCache.set(key, buf)
  }
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const gain = ctx.createGain()
  gain.gain.value = 0 // silent until its first automation event — never the default 1.0
  gain.gain.setValueAtTime(o.gain, now)
  gain.gain.setValueAtTime(o.gain, now + o.duration * 0.8)
  gain.gain.linearRampToValueAtTime(0.0001, now + o.duration)
  src.connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, undefined, now, o.duration), o.space ?? 0.18)
  src.start(now)
  src.stop(now + o.duration + 0.02)
}

/**
 * Air moving: band-passed noise that SWELLS (the attack is a share of the
 * length, not a click) and sweeps its centre `from` → `to` Hz, optionally
 * travelling `pan` → `panTo`. A swing, a flight, a rush. 4–5 nodes.
 */
export const whoosh = (
  ctx: AudioCtx,
  o: { duration: number; from: number; to: number; gain: number; q?: number; rise?: number; delay?: number; pan?: number; panTo?: number; space?: number }
): void => {
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.loop = true
  src.playbackRate.value = 0.9 + Math.random() * 0.2
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = o.q ?? 1.4
  f.frequency.setValueAtTime(Math.max(60, o.from), now)
  f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), now + o.duration)
  const g = ctx.createGain()
  g.gain.value = 0 // silent until its first automation event — never the default 1.0
  const peak = now + o.duration * Math.max(0.05, Math.min(0.9, o.rise ?? 0.4))
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), peak)
  g.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)
  src.connect(f).connect(g)
  land(ctx, withPan(ctx, g, o.pan, o.panTo, now, o.duration), o.space ?? 0.15)
  src.start(now, Math.random() * 0.5)
  src.stop(now + o.duration + 0.02)
}

/**
 * Crackle: ONE noise source through a band-pass, its gain driven by a random
 * train of spikes — electricity, fire, grit, ice. Grains are automation
 * events, not nodes, so a dense crackle still costs 4 nodes. `density` is
 * spikes per second.
 */
export const crackle = (
  ctx: AudioCtx,
  o: { duration: number; density: number; gain: number; freq: number; q?: number; grainMs?: number; delay?: number; pan?: number; space?: number; decay?: boolean }
): void => {
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = o.freq
  f.Q.value = o.q ?? 2.2
  const g = ctx.createGain()
  g.gain.value = 0 // silent until its first automation event — never the default 1.0
  g.gain.setValueAtTime(0.0001, now)
  const n = Math.min(160, Math.max(1, Math.round(o.density * o.duration)))
  const grain = (o.grainMs ?? 7) / 1000
  let t = now
  for (let i = 0; i < n; i++) {
    t = now + (i + Math.random()) * (o.duration / n)
    const fall = o.decay === false ? 1 : 1 - (t - now) / o.duration
    const a = Math.max(0.0002, o.gain * (0.35 + Math.random() * 0.65) * fall)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(a, t + grain * 0.15)
    g.gain.exponentialRampToValueAtTime(0.0001, t + grain)
  }
  src.connect(f).connect(g)
  land(ctx, withPan(ctx, g, o.pan, undefined, now, o.duration), o.space ?? 0.12)
  src.start(now, Math.random() * 0.4)
  src.stop(now + o.duration + 0.05)
}

/**
 * A body blow: a sine that starts `punch`× its pitch and drops to it in a
 * few ms (the kick-drum trick — the drop is what the ear reads as WEIGHT),
 * then decays, with an optional noise click on top. 4–8 nodes.
 */
export const thump = (
  ctx: AudioCtx,
  o: { freq: number; duration: number; gain: number; punch?: number; click?: number; delay?: number; pan?: number; space?: number }
): void => {
  const now = startAt(ctx, o.delay)
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(Math.max(20, o.freq * (o.punch ?? 3)), now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.freq), now + Math.min(0.045, o.duration * 0.3))
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.freq * 0.8), now + o.duration)
  const g = ctx.createGain()
  g.gain.value = 0 // silent until its first automation event — never the default 1.0
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), now + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)
  osc.connect(g)
  land(ctx, withPan(ctx, g, o.pan, undefined, now, o.duration), o.space ?? 0.05)
  osc.start(now)
  osc.stop(now + o.duration + 0.02)
  if (o.click && o.click > 0) {
    noiseBurst(ctx, { duration: 0.012, gain: o.click, filterFrom: 6000, filterTo: 2000, type: 'highpass', q: 0.7, delay: o.delay, pan: o.pan, space: 0 })
  }
}

/**
 * A reversed swell: energy RISING into a moment — the breath before a blast,
 * a spell gathering. Noise band-passed and sweeping up (or down), its gain
 * climbing exponentially and cut short at the end. 4–5 nodes.
 */
export const swell = (
  ctx: AudioCtx,
  o: { duration: number; from: number; to: number; gain: number; q?: number; delay?: number; pan?: number; space?: number }
): void => {
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = o.q ?? 1.2
  f.frequency.setValueAtTime(Math.max(60, o.from), now)
  f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), now + o.duration)
  const g = ctx.createGain()
  g.gain.value = 0 // silent until its first automation event — never the default 1.0
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), now + o.duration * 0.96)
  g.gain.linearRampToValueAtTime(0.0001, now + o.duration)
  src.connect(f).connect(g)
  land(ctx, withPan(ctx, g, o.pan, undefined, now, o.duration), o.space ?? 0.25)
  src.start(now, Math.random() * 0.4)
  src.stop(now + o.duration + 0.02)
}

/**
 * A short arpeggio of struck bells on scale degrees — a gain, a sparkle, a
 * reward. `step` seconds between notes. 3 tones per note.
 */
export const shimmer = (
  ctx: AudioCtx,
  o: { degrees: readonly number[]; step: number; duration: number; gain: number; delay?: number; pan?: number; space?: number }
): void => {
  for (let i = 0; i < o.degrees.length; i++) {
    bellTone(ctx, {
      freq: NOTE(o.degrees[i]!), duration: o.duration, gain: o.gain * (1 - i * 0.08),
      delay: (o.delay ?? 0) + i * o.step, space: o.space ?? 0.4, pan: o.pan
    })
  }
}

/** A level's extra weight, 0 at Lv 1 rising to 1 at Lv 4+: lets a recipe add a sub or widen a body for bigger runes. */
export const heft = (level: number | undefined): number => Math.max(0, Math.min(1, ((level ?? 1) - 1) / 3))
