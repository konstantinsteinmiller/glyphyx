import { getAudioContext, isAudioSuspended } from '@/use/useAssets'
import { bus, space } from '@/use/audioBus'
import { isMobileAudioMuted } from '@/use/useMobileAudioMute'
import useUser from '@/use/useUser'
import useSounds from '@/use/useSound'
import type { FxSound } from '@/game/cues'

/**
 * ─── Glyphyx audio ──────────────────────────────────────────────────────────
 *
 * Two sources, one entry point (`playFx`):
 *
 *   SAMPLES   — where a recorded sound is unmistakably better: the victory
 *               and defeat stingers, the chest, the coin, the UI. These route
 *               through the shared `useSound` fast path (decoded AudioBuffers).
 *   SYNTHESIS — the whole board layer. A pebble landing, an arrow leaving a
 *               bow, a rune shattering into rubble: each is built from
 *               oscillators and filtered noise, per event, with randomised
 *               pitch and envelope so no two placements sound identical and
 *               the combat mix costs zero bytes of download.
 *
 * The stone THUD of a placement is the one cue the whole game is built around
 * — it is the tactile confirmation the GDD asks for ("pebble placements
 * produce a heavy stone thud") — so it gets the most layers: a pitched body, a
 * sub, the slate crack, and a quiet recorded stone tap underneath.
 *
 * Everything runs on the SHARED AudioContext from `useAssets`, which the ad /
 * pause gate suspends — so "no game audio during an ad" covers synthesised
 * sound for free: a suspended context produces silence.
 *
 * The cue VOCABULARY lives in `@/game/cues` so the renderer and the battle
 * composable can import the type without dragging the synthesis in.
 */

// ─── Throttling ─────────────────────────────────────────────────────────────
//
// A reveal fires every rune on the board inside one second, and a combo
// shatters several at once. Without a per-cue budget the mix turns to mud and
// the main thread spends real time building oscillator graphs. Each cue gets a
// minimum gap AND a per-window voice cap; the renderer staggers same-step
// events by a few ms, so the caps are set to let a whole board through.

interface Throttle { minGapMs: number; maxPerWindow: number; windowMs: number }

const THROTTLES: Partial<Record<FxSound, Throttle>> = {
  // input
  pickup: { minGapMs: 60, maxPerWindow: 4, windowMs: 300 },
  hover: { minGapMs: 60, maxPerWindow: 8, windowMs: 300 },
  invalid: { minGapMs: 120, maxPerWindow: 3, windowMs: 400 },
  aim: { minGapMs: 40, maxPerWindow: 8, windowMs: 300 },
  place: { minGapMs: 80, maxPerWindow: 4, windowMs: 400 },
  reroll: { minGapMs: 150, maxPerWindow: 2, windowMs: 500 },
  // clock
  tick: { minGapMs: 200, maxPerWindow: 3, windowMs: 1000 },
  tickFinal: { minGapMs: 200, maxPerWindow: 2, windowMs: 1000 },
  reveal: { minGapMs: 250, maxPerWindow: 2, windowMs: 1000 },
  // resolution — several runes fire in the same step
  arrow: { minGapMs: 30, maxPerWindow: 8, windowMs: 300 },
  arrowHit: { minGapMs: 45, maxPerWindow: 6, windowMs: 300 },
  beam: { minGapMs: 30, maxPerWindow: 8, windowMs: 300 },
  beamHit: { minGapMs: 45, maxPerWindow: 6, windowMs: 300 },
  slash: { minGapMs: 30, maxPerWindow: 8, windowMs: 300 },
  slashHit: { minGapMs: 45, maxPerWindow: 6, windowMs: 300 },
  cleave: { minGapMs: 30, maxPerWindow: 8, windowMs: 300 },
  cleaveHit: { minGapMs: 45, maxPerWindow: 6, windowMs: 300 },
  // The boulder and the shell are long, loud and rare — a tighter budget than
  // the blades, or two of them in one step swamp the step's other voices.
  roll: { minGapMs: 60, maxPerWindow: 4, windowMs: 400 },
  rollHit: { minGapMs: 45, maxPerWindow: 6, windowMs: 300 },
  shell: { minGapMs: 60, maxPerWindow: 4, windowMs: 400 },
  shellHit: { minGapMs: 60, maxPerWindow: 3, windowMs: 500 },
  explode: { minGapMs: 80, maxPerWindow: 3, windowMs: 500 },
  // The loudest voice in the game, and the rarest. ONE per window, full stop:
  // two nukes can land in the same resolution (two nukers placed at once), and
  // two of these on top of each other is a clipped mess rather than a bigger
  // bang — the second detonation is carried by the shake and the flash.
  nuke: { minGapMs: 900, maxPerWindow: 1, windowMs: 1200 },
  crown: { minGapMs: 250, maxPerWindow: 2, windowMs: 700 },
  shield: { minGapMs: 40, maxPerWindow: 6, windowMs: 300 },
  heal: { minGapMs: 40, maxPerWindow: 6, windowMs: 300 },
  buff: { minGapMs: 40, maxPerWindow: 6, windowMs: 300 },
  shatter: { minGapMs: 70, maxPerWindow: 5, windowMs: 400 },
  clash: { minGapMs: 150, maxPerWindow: 2, windowMs: 500 },
  knockback: { minGapMs: 80, maxPerWindow: 3, windowMs: 400 },
  capture: { minGapMs: 50, maxPerWindow: 8, windowMs: 400 },
  merge: { minGapMs: 120, maxPerWindow: 3, windowMs: 500 },
  combo: { minGapMs: 200, maxPerWindow: 2, windowMs: 600 },
  // meta
  coin: { minGapMs: 60, maxPerWindow: 6, windowMs: 300 },
  countUp: { minGapMs: 30, maxPerWindow: 12, windowMs: 300 },
  streak: { minGapMs: 300, maxPerWindow: 2, windowMs: 1000 },
  forge: { minGapMs: 300, maxPerWindow: 2, windowMs: 1000 }
}

const lastAt: Partial<Record<FxSound, number>> = {}
const windowHits: Partial<Record<FxSound, number[]>> = {}

const passesThrottle = (id: FxSound): boolean => {
  const t = THROTTLES[id]
  if (!t) return true
  const now = performance.now()
  if (now - (lastAt[id] ?? -Infinity) < t.minGapMs) return false
  const hits = (windowHits[id] ??= [])
  while (hits.length > 0 && now - hits[0]! > t.windowMs) hits.shift()
  if (hits.length >= t.maxPerWindow) return false
  hits.push(now)
  lastAt[id] = now
  return true
}

/** Test seam: forget every throttle so a suite can fire each cue back to back. */
export const __resetThrottles = (): void => {
  for (const k of Object.keys(lastAt)) delete lastAt[k as FxSound]
  for (const k of Object.keys(windowHits)) delete windowHits[k as FxSound]
}

// ─── Volume ─────────────────────────────────────────────────────────────────

const { userSoundVolume } = useUser()

/** Master gain for a synthesised voice, folding in the player's SFX slider. */
const vol = (base: number): number =>
  Math.max(0, Math.min(1, base * (userSoundVolume.value ?? 0.7)))

const canPlay = (): boolean => !isAudioSuspended() && !isMobileAudioMuted.value

// ─── Synthesis primitives ───────────────────────────────────────────────────

/**
 * Shared white noise. The bus owns one for the life of the context and the
 * music engine uses the same one — rebuilding noise per event would be a
 * second of `Math.random()` per resolution, and two copies of it would be two.
 * The local fallback is for a context the bus could not be built on.
 */
let noiseBuffer: AudioBuffer | null = null
const getNoise = (ctx: AudioContext): AudioBuffer => {
  const b = bus()
  if (b && b.ctx === ctx && b.noise.sampleRate === ctx.sampleRate) return b.noise
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer
  const len = Math.floor(ctx.sampleRate * 1.2)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buf
  return buf
}

/**
 * ─── The palette ────────────────────────────────────────────────────────────
 *
 * Two rules turn a pile of beeps into a sound DESIGN, and both are here rather
 * than in any one cue.
 *
 * 1. EVERYTHING IS IN THE SAME KEY. The music is D minor (`@/game/music`), so
 *    every pitched cue in the game is built on a note of D minor — `NOTE`
 *    below is the only place a melodic frequency comes from. Before this, cues
 *    were tuned by ear in raw hertz: 620, 880, 2400. Any one of them sounds
 *    fine alone; underneath a track in D they are a chord nobody wrote, and the
 *    listening fatigue that produces is the thing players describe as "the
 *    sounds are annoying" without being able to say why. In key, forty cues an
 *    encounter sit INSIDE the music instead of fighting it.
 *
 * 2. EVERYTHING IS IN THE SAME ROOM. Each voice sends a little of itself to the
 *    shared reverb in `audioBus.ts` — a click almost none, a bell a lot — so
 *    the board sounds like a place rather than a mixing desk. The same file
 *    puts a compressor and a soft-clip across the sum, which is what lets a
 *    nuke be LOUD on top of a full board instead of clipped.
 *
 * The families are deliberately distinct, so a player can name what happened
 * with their eyes closed. Wood and stone are the BOARD (placing, ticking,
 * capturing); metal is a BLADE; a plucked string is the bow; glass is the orb
 * and anything magical; a struck bell is a GAIN (heal, merge, coin); a low
 * drum is a LOSS (shatter, defeat); and the two board-wide events — the nuke
 * and the crown — are the only voices allowed a sub-bass and a fanfare
 * respectively.
 */

/** D minor, three octaves, as MIDI. The scale every pitched cue is drawn from. */
const D_MINOR = [50, 52, 53, 55, 57, 58, 60, 62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81, 82, 84, 86]

/**
 * A degree of the scale, in hertz. `d` is an index into `D_MINOR` (0 = D3), so
 * a cue asks for "the fifth above the tonic" rather than for 293 Hz, and the
 * whole game transposes if the music ever does.
 */
const NOTE = (d: number): number => {
  const midi = D_MINOR[Math.max(0, Math.min(D_MINOR.length - 1, Math.round(d)))]!
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/**
 * An optional stereo placement. `pan` is where the voice starts (-1 left …
 * +1 right) and `panTo` where it ends by the time the voice is over — the
 * board-wipe whoosh travels across the screen. Browsers without a panner
 * (rare, and every test runtime) simply play it centred.
 */
const withPan = (
  ctx: AudioContext, node: AudioNode, pan: number | undefined, panTo: number | undefined,
  now: number, duration: number
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

interface NoiseOpts {
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
}

/**
 * Where a voice lands: the sfx bus, with a send to the room. Falls back to the
 * raw destination if the bus could not be built (a context without a
 * convolver, a test double), so a missing node type is a dry cue and never a
 * silent one.
 */
const land = (ctx: AudioContext, node: AudioNode, amount: number): void => {
  const b = bus()
  if (!b || b.ctx !== ctx) {
    node.connect(ctx.destination)
    return
  }
  space(b, node, b.sfx, amount)
}

/** A filtered noise burst — the backbone of impacts, debris and air. */
const noiseBurst = (ctx: AudioContext, o: NoiseOpts): void => {
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.playbackRate.value = (o.rate ?? 1) * (0.85 + Math.random() * 0.3)

  const filter = ctx.createBiquadFilter()
  filter.type = o.type ?? 'lowpass'
  filter.Q.value = o.q ?? 1
  const now = ctx.currentTime + (o.delay ?? 0)
  filter.frequency.setValueAtTime(Math.max(40, o.filterFrom), now)
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, o.filterTo), now + o.duration)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(o.gain, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)

  src.connect(filter).connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, o.panTo, now, o.duration), o.space ?? 0.1)
  src.start(now)
  src.stop(now + o.duration + 0.02)
}

interface ToneOpts {
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
}

/** A single pitched voice with an exponential envelope. */
const tone = (ctx: AudioContext, o: ToneOpts): void => {
  const now = ctx.currentTime + (o.delay ?? 0)
  const osc = ctx.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(Math.max(20, o.freq), now)
  if (o.toFreq && o.toFreq !== o.freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.toFreq), now + o.duration)
  }

  const attack = Math.min(o.attack ?? 0.004, o.duration * 0.5)
  const gain = ctx.createGain()
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
 * each dying on its own clock. It is the sound of something being GAINED —
 * a heal, a merge, a tile taken, a coin — and it is one function so that all
 * of those are recognisably relatives.
 */
const bellTone = (
  ctx: AudioContext, o: { freq: number; duration: number; gain: number; delay?: number; space?: number }
): void => {
  const partials: [number, number, number][] = [[1, 1, 1], [2.76, 0.26, 0.6], [5.4, 0.09, 0.35]]
  for (const [mul, amp, life] of partials) {
    tone(ctx, {
      freq: o.freq * mul,
      duration: o.duration * life,
      gain: o.gain * amp,
      type: 'sine',
      delay: o.delay,
      attack: 0.004,
      space: o.space ?? 0.3
    })
  }
}

// ─── Cue definitions ────────────────────────────────────────────────────────

// Resolved LAZILY, on the first cue, not at module scope. `useSound` imports
// `useAssets` (for the shared AudioContext), and `useAssets` reaches the
// renderer for the pebble bake, which imports this mixer — so a module-scope
// `useSounds()` here runs while `useSound` is still half-evaluated in that
// cycle and its default export is not a function yet. The first `playFx` is
// always long after every module has settled.
let sounds: ReturnType<typeof useSounds> | null = null
const playSound: ReturnType<typeof useSounds>['playSound'] = (effect, ratio, pitch) =>
  (sounds ??= useSounds()).playSound(effect, ratio, pitch)

/**
 * Cues that ARE a shipped sample: `[file basename, volumeRatio]`. Nothing is
 * synthesised for these. Replace the sound by replacing the file.
 */
export const SAMPLE_CUES: Partial<Record<FxSound, [string, number]>> = {
  chestPop: ['happy', 0.08],
  chestOpen: ['win', 0.09],
  unlock: ['level-up', 0.07],
  coin: ['coin-pickup', 0.05],
  skinBuy: ['reward-continue', 0.06],
  uiOpen: ['modal-open', 0.07],
  uiReject: ['obstacle-hit', 0.03]
}

/**
 * Cues that play a sample UNDER their synthesised layer. The recording gives
 * the transient a body no oscillator has; the synth on top is what makes it
 * scale with `power` and never repeat exactly.
 */
export const LAYER_SAMPLES: Partial<Record<FxSound, [string, number]>> = {
  place: ['stone-cut', 0.025],
  shatter: ['shrapnel', 0.03],
  victory: ['celebration-1', 0.09],
  defeat: ['lose', 0.11]
}


type Synth = (ctx: AudioContext, p: number, r: number) => void

/**
 * One function per synthesised cue.
 *
 * `p` is the 0..1 intensity hint the caller derives from context (how many
 * runes a combo took, how heavy the placement was); `r` is a fresh random for
 * pitch jitter. `p` never changes WHICH sound plays — only how big it is — so
 * the mix stays legible.
 */
const SYNTH: Partial<Record<FxSound, Synth>> = {
  // ── input ────────────────────────────────────────────────────────────────

  // A pebble lifted off the hand: a light stone tick with a puff of air.
  pickup: (ctx, _p, r) => {
    tone(ctx, { freq: 620 + r * 120, toFreq: 900, duration: 0.05, gain: vol(0.035), type: 'triangle', filter: 4000 })
    noiseBurst(ctx, { duration: 0.04, gain: vol(0.02), filterFrom: 6000, filterTo: 2500, type: 'bandpass', q: 1.5 })
  },

  // The drag crossed onto a tile that will take it: the softest tick in the
  // mix, and a bell rather than a beep — it fires dozens of times a turn, and
  // a beep that often is the cue players turn the sound off over.
  hover: (ctx) => {
    bellTone(ctx, { freq: NOTE(18), duration: 0.12, gain: vol(0.016), space: 0.25 })
  },

  // …onto one that will not: a dull double thud, deliberately unmusical.
  invalid: (ctx) => {
    tone(ctx, { freq: 180, toFreq: 120, duration: 0.09, gain: vol(0.07), filter: 600 })
    tone(ctx, { freq: 150, toFreq: 100, duration: 0.1, gain: vol(0.06), filter: 600, delay: 0.09 })
    noiseBurst(ctx, { duration: 0.05, gain: vol(0.02), filterFrom: 900, filterTo: 200 })
  },

  // The swipe snapped to a new facing: a detent on a dial, not a note. It used
  // to be a square wave at 2.4 kHz, which is exactly where a phone speaker is
  // harshest and where the ear is most sensitive — a triangle on the scale's
  // top D says the same thing and does not scrape.
  aim: (ctx) => {
    tone(ctx, { freq: NOTE(21), duration: 0.014, gain: vol(0.028), type: 'triangle', filter: 6000, space: 0.06 })
    noiseBurst(ctx, { duration: 0.012, gain: vol(0.035), filterFrom: 3500, filterTo: 5200, type: 'bandpass', q: 0.9, space: 0.05 })
  },

  // THE sound of the game: a pebble hitting slate. A pitched body falling
  // an octave, a sub under it, the crack of the stone's edge, and a quiet
  // recorded tap underneath (see LAYER_SAMPLES). `p` is the weight — a Lv 2
  // merge lands heavier than a first placement.
  place: (ctx, p) => {
    const w = 0.7 + Math.min(1, p) * 0.6
    // The body is the tonic two octaves down, so the heaviest, most repeated
    // sound in the game is the root of the key the music is in.
    tone(ctx, { freq: NOTE(0) / 2, toFreq: NOTE(0) / 4, duration: 0.22 * w, gain: vol(0.16 * w), space: 0.14 })
    tone(ctx, { freq: 48, toFreq: 28, duration: 0.3, gain: vol(0.12 * w) })
    noiseBurst(ctx, { duration: 0.09, gain: vol(0.09 * w), filterFrom: 2400, filterTo: 180, space: 0.16 })
    noiseBurst(ctx, { duration: 0.025, gain: vol(0.06), filterFrom: 2600, filterTo: 1400, type: 'highpass', q: 0.7 })
  },

  // Three stones rattling in a cup.
  reroll: (ctx, _p, r) => {
    for (let i = 0; i < 3; i++) {
      const d = i * 0.06
      noiseBurst(ctx, { duration: 0.05, gain: vol(0.05), filterFrom: 3800, filterTo: 900, type: 'bandpass', q: 1.4, delay: d, rate: 0.9 + i * 0.12 })
      tone(ctx, { freq: 300 + r * 200 + i * 60, toFreq: 150, duration: 0.04, gain: vol(0.03), type: 'triangle', delay: d })
    }
  },

  // ── the clock ────────────────────────────────────────────────────────────

  // Woodblock. `p` climbs 0 → 1 over the last three seconds, so 3-2-1 rises
  // by half an octave: the ear hears the deadline coming without a glance.
  // …and it climbs the SCALE rather than sliding: A, then B♭, C, D as the last
  // seconds go. Three steps of the key the music is in, so the countdown is a
  // melody the player learns rather than a rising beep.
  tick: (ctx, p) => {
    const f = NOTE(11 + Math.min(1, Math.max(0, p)) * 3)
    tone(ctx, { freq: f, duration: 0.07, gain: vol(0.055), type: 'triangle', filter: 5000, space: 0.12 })
    tone(ctx, { freq: f * 2.4, duration: 0.04, gain: vol(0.016) })
    noiseBurst(ctx, { duration: 0.02, gain: vol(0.018), filterFrom: 4500, filterTo: 2400, type: 'bandpass', q: 2 })
  },

  // The final second: the octave above, struck like a small bell so it rings
  // past the beat instead of poking at it.
  tickFinal: (ctx) => {
    bellTone(ctx, { freq: NOTE(18), duration: 0.3, gain: vol(0.055), space: 0.28 })
    noiseBurst(ctx, { duration: 0.025, gain: vol(0.022), filterFrom: 6000, filterTo: 3000, type: 'bandpass', q: 2 })
  },

  // Both moves shown, arrows fanning out: a whoosh opening upward under a
  // shimmering pair of detuned sines.
  reveal: (ctx) => {
    noiseBurst(ctx, { duration: 0.42, gain: vol(0.07), filterFrom: 400, filterTo: 4600, type: 'bandpass', q: 0.9, space: 0.3 })
    // The tonic, with its twin three hertz away: the slow beat between them is
    // the held breath before the board resolves.
    tone(ctx, { freq: NOTE(14), duration: 0.5, gain: vol(0.038), delay: 0.08, attack: 0.05, space: 0.35 })
    tone(ctx, { freq: NOTE(14) + 3, duration: 0.5, gain: vol(0.038), delay: 0.08, attack: 0.05, space: 0.35 })
    tone(ctx, { freq: NOTE(21), duration: 0.35, gain: vol(0.018), delay: 0.15, space: 0.4 })
    tone(ctx, { freq: NOTE(18), duration: 0.3, gain: vol(0.014), delay: 0.2, space: 0.4 })
  },

  // ── resolution ───────────────────────────────────────────────────────────

  // A plucked string with the air of the arrow leaving.
  arrow: (ctx, _p, r) => {
    tone(ctx, { freq: 220 + r * 30, toFreq: 180, duration: 0.11, gain: vol(0.06), type: 'sawtooth', filter: 2200 })
    noiseBurst(ctx, { duration: 0.02, gain: vol(0.04), filterFrom: 2500, filterTo: 1000, type: 'highpass', q: 0.7 })
    noiseBurst(ctx, { duration: 0.14, gain: vol(0.03), filterFrom: 3500, filterTo: 1200, type: 'bandpass', q: 1.2, delay: 0.02 })
  },

  // Thock: the arrow burying itself in stone.
  arrowHit: (ctx) => {
    tone(ctx, { freq: 320, toFreq: 110, duration: 0.08, gain: vol(0.07) })
    noiseBurst(ctx, { duration: 0.06, gain: vol(0.05), filterFrom: 1800, filterTo: 300 })
    tone(ctx, { freq: 900, toFreq: 400, duration: 0.04, gain: vol(0.03), type: 'triangle' })
  },

  // The arcane hum: two sines three hertz apart, swelling in, a shimmer rising
  // above them. The only cue in the combat mix with a slow attack.
  beam: (ctx) => {
    tone(ctx, { freq: NOTE(0), duration: 0.45, gain: vol(0.065), attack: 0.12, space: 0.4 })
    tone(ctx, { freq: NOTE(0) + 3, duration: 0.45, gain: vol(0.065), attack: 0.12, space: 0.4 })
    tone(ctx, { freq: NOTE(14), toFreq: NOTE(18), duration: 0.4, gain: vol(0.018), delay: 0.05, attack: 0.06, space: 0.45 })
    noiseBurst(ctx, { duration: 0.4, gain: vol(0.016), filterFrom: 2000, filterTo: 5200, type: 'bandpass', q: 2, space: 0.4 })
  },

  // Zap — glass, not a buzzer: the square wave that used to carry it read as
  // an error tone next to the rest of the mix.
  beamHit: (ctx) => {
    tone(ctx, { freq: NOTE(17), toFreq: NOTE(7), duration: 0.12, gain: vol(0.055), type: 'triangle', filter: 3200, space: 0.22 })
    tone(ctx, { freq: NOTE(21), duration: 0.09, gain: vol(0.02), space: 0.3 })
    noiseBurst(ctx, { duration: 0.08, gain: vol(0.033), filterFrom: 5200, filterTo: 800, type: 'bandpass', q: 1.5 })
  },

  // A blade through air: a highpass sweep opening upward, with the faintest
  // metallic partial riding it.
  slash: (ctx) => {
    noiseBurst(ctx, { duration: 0.16, gain: vol(0.06), filterFrom: 400, filterTo: 5000, type: 'highpass', q: 0.8 })
    tone(ctx, { freq: 2800, toFreq: 3400, duration: 0.12, gain: vol(0.015), type: 'triangle' })
  },

  // Steel on stone: a clank, a bright edge, and a low body so it lands.
  slashHit: (ctx, _p, r) => {
    tone(ctx, { freq: 1900 + r * 400, toFreq: 1400, duration: 0.07, gain: vol(0.05), type: 'triangle' })
    tone(ctx, { freq: 3100, toFreq: 2600, duration: 0.05, gain: vol(0.02), type: 'square', filter: 8000 })
    tone(ctx, { freq: 150, toFreq: 60, duration: 0.14, gain: vol(0.08) })
    noiseBurst(ctx, { duration: 0.07, gain: vol(0.05), filterFrom: 4000, filterTo: 600 })
  },

  // The axe: `slash`'s gesture swung wider and slower — more air moved, a
  // lower whistle, and a second body of air closing behind the head.
  cleave: (ctx) => {
    noiseBurst(ctx, { duration: 0.24, gain: vol(0.075), filterFrom: 300, filterTo: 3600, type: 'highpass', q: 0.7 })
    noiseBurst(ctx, { duration: 0.12, gain: vol(0.03), filterFrom: 1400, filterTo: 500, type: 'bandpass', q: 1.1, delay: 0.06 })
    tone(ctx, { freq: 1700, toFreq: 2100, duration: 0.16, gain: vol(0.018), type: 'triangle' })
  },

  // Three stones taking one blow: `slashHit`'s clank over a heavier body, with
  // a softer second strike a frame behind it so the fan reads as wide.
  cleaveHit: (ctx, _p, r) => {
    tone(ctx, { freq: 1500 + r * 300, toFreq: 900, duration: 0.09, gain: vol(0.05), type: 'triangle' })
    tone(ctx, { freq: 110, toFreq: 45, duration: 0.2, gain: vol(0.1) })
    noiseBurst(ctx, { duration: 0.1, gain: vol(0.06), filterFrom: 3200, filterTo: 400 })
    noiseBurst(ctx, { duration: 0.07, gain: vol(0.03), filterFrom: 2000, filterTo: 300, delay: 0.05 })
  },

  // The boulder under way: a long low grind with a rumble under it for mass,
  // and four rough teeth inside the roll so it is stone on stone, not wind.
  roll: (ctx, _p, r) => {
    tone(ctx, { freq: 60, toFreq: 42, duration: 0.5, gain: vol(0.13), attack: 0.04 })
    noiseBurst(ctx, { duration: 0.5, gain: vol(0.075), filterFrom: 700, filterTo: 260, q: 1.4, rate: 0.7 })
    for (let i = 0; i < 4; i++) {
      noiseBurst(ctx, {
        duration: 0.07, gain: vol(0.025), filterFrom: 900 + r * 300, filterTo: 320,
        type: 'bandpass', q: 2.2, delay: 0.06 + i * 0.1, rate: 0.8
      })
    }
  },

  // The boulder meeting something: a blunt crunch with no metal in it at all.
  rollHit: (ctx, _p, r) => {
    tone(ctx, { freq: 130 + r * 40, toFreq: 48, duration: 0.16, gain: vol(0.09) })
    noiseBurst(ctx, { duration: 0.11, gain: vol(0.06), filterFrom: 1600, filterTo: 220 })
    noiseBurst(ctx, { duration: 0.05, gain: vol(0.03), filterFrom: 2600, filterTo: 900, type: 'bandpass', q: 1.6 })
  },

  // The tube firing: a soft launch thump and the round going away from you.
  shell: (ctx) => {
    tone(ctx, { freq: 150, toFreq: 60, duration: 0.14, gain: vol(0.11) })
    noiseBurst(ctx, { duration: 0.1, gain: vol(0.05), filterFrom: 1200, filterTo: 300 })
    noiseBurst(ctx, { duration: 0.3, gain: vol(0.018), filterFrom: 2200, filterTo: 700, type: 'bandpass', q: 1.6, delay: 0.05 })
  },

  // …and the round landing three ranks off: `explode` heard from over there —
  // shorter, duller, with most of its top end left behind on the way.
  shellHit: (ctx) => {
    tone(ctx, { freq: 80, toFreq: 34, duration: 0.34, gain: vol(0.15) })
    noiseBurst(ctx, { duration: 0.3, gain: vol(0.09), filterFrom: 1200, filterTo: 90 })
    noiseBurst(ctx, { duration: 0.5, gain: vol(0.035), filterFrom: 500, filterTo: 70 })
  },

  // The mage's Lv 2 cross: sub thump, a wide body, a long dark tail, and the
  // crackle of stone on top.
  explode: (ctx) => {
    tone(ctx, { freq: 90, toFreq: 30, duration: 0.5, gain: vol(0.2) })
    noiseBurst(ctx, { duration: 0.55, gain: vol(0.14), filterFrom: 3000, filterTo: 100 })
    noiseBurst(ctx, { duration: 0.9, gain: vol(0.05), filterFrom: 700, filterTo: 80 })
    noiseBurst(ctx, { duration: 0.12, gain: vol(0.05), filterFrom: 5000, filterTo: 1500, type: 'bandpass', q: 1.5, delay: 0.03 })
  },

  // The nuke. Everything `explode` is, an octave lower and twice as long: a
  // sub that falls from 70 Hz to below hearing, a wide noise body opening then
  // closing over a second and a half, and a long dark tail under it — the
  // sound of the whole board going, not one tile. The tiny high crack at the
  // front is the detonation itself; without it the voice reads as a rumble
  // that started somewhere else.
  nuke: (ctx) => {
    tone(ctx, { freq: 70, toFreq: 18, duration: 1.1, gain: vol(0.26) })
    tone(ctx, { freq: 140, toFreq: 34, duration: 0.7, gain: vol(0.12), delay: 0.01 })
    noiseBurst(ctx, { duration: 0.16, gain: vol(0.13), filterFrom: 9000, filterTo: 2200, type: 'bandpass', q: 1.2 })
    noiseBurst(ctx, { duration: 1.0, gain: vol(0.17), filterFrom: 4200, filterTo: 90 })
    noiseBurst(ctx, { duration: 1.6, gain: vol(0.07), filterFrom: 500, filterTo: 60, delay: 0.08 })
  },

  // The crown changing heads. Every other combat voice in this file is an
  // impact — something struck something. This one is the opposite, so it is
  // built as a rising major arpeggio (a fanfare in three notes, 90 ms apart)
  // over a bright shimmer: the sound of a thing being GAINED. It has to read
  // as a reward even though a rune just left the board.
  crown: (ctx) => {
    // D, F, A — the tonic triad of the key, rising. It was a C major arpeggio,
    // which is a fanfare in somebody else's music.
    for (const [i, d] of [14, 16, 18].entries()) {
      tone(ctx, { freq: NOTE(d), duration: i === 2 ? 0.34 : 0.16, gain: vol(i === 2 ? 0.08 : 0.07), type: 'triangle', delay: i * 0.09, space: 0.35 })
    }
    bellTone(ctx, { freq: NOTE(18) * 2, duration: 0.5, gain: vol(0.022), delay: 0.18, space: 0.5 })
    noiseBurst(ctx, { duration: 0.35, gain: vol(0.03), filterFrom: 3000, filterTo: 8000, type: 'bandpass', q: 1.6, delay: 0.16, space: 0.4 })
  },

  // Damage eaten by a shield: struck glass, gone in a tenth of a second.
  shield: (ctx) => {
    bellTone(ctx, { freq: NOTE(19), duration: 0.16, gain: vol(0.042), space: 0.3 })
    noiseBurst(ctx, { duration: 0.03, gain: vol(0.013), filterFrom: 7000, filterTo: 4000, type: 'bandpass', q: 4 })
  },

  // Two struck notes rising a fourth, A → D. The one cue in the mix with no
  // noise in it at all — a health bar going UP has to sound like the opposite
  // of a hit, and it lands on the tonic, which is as settled as a note gets.
  heal: (ctx) => {
    bellTone(ctx, { freq: NOTE(11), duration: 0.26, gain: vol(0.042), space: 0.35 })
    bellTone(ctx, { freq: NOTE(14), duration: 0.36, gain: vol(0.042), delay: 0.11, space: 0.4 })
  },

  // The support sharpening a neighbour: the tonic triad, quick and bright.
  buff: (ctx) => {
    for (const [i, d] of [14, 16, 18].entries()) {
      tone(ctx, { freq: NOTE(d), duration: 0.14, gain: vol(0.035), type: 'triangle', filter: 5000, delay: i * 0.055, space: 0.28 })
    }
    noiseBurst(ctx, { duration: 0.12, gain: vol(0.01), filterFrom: 6000, filterTo: 8500, type: 'bandpass', q: 3, space: 0.3 })
  },

  // Stone breaking: two bursts, a low body, and debris tumbling for a quarter
  // of a second after. `p` is the size of the rune (a Lv 2 breaks bigger). A
  // quiet recorded `shrapnel` sits under all of it (LAYER_SAMPLES).
  shatter: (ctx, p, r) => {
    const s = 0.6 + Math.min(1, p) * 0.8
    noiseBurst(ctx, { duration: 0.2 * s, gain: vol(0.1 * s), filterFrom: 4000, filterTo: 300 })
    noiseBurst(ctx, { duration: 0.25, gain: vol(0.06 * s), filterFrom: 2500, filterTo: 200, delay: 0.02 })
    tone(ctx, { freq: 120, toFreq: 50, duration: 0.18, gain: vol(0.09 * s) })
    for (let i = 0; i < 5; i++) {
      const d = 0.03 + i * 0.035 + r * 0.01
      tone(ctx, { freq: 900 + r * 600 + i * 90, toFreq: 400, duration: 0.03, gain: vol(0.03), type: 'triangle', delay: d })
      noiseBurst(ctx, { duration: 0.02, gain: vol(0.025), filterFrom: 3000, filterTo: 1200, type: 'bandpass', q: 2, delay: d })
    }
  },

  // Two placements on one tile: two thuds a hair apart and the sparks between.
  clash: (ctx, _p, r) => {
    tone(ctx, { freq: 110, toFreq: 50, duration: 0.16, gain: vol(0.12) })
    tone(ctx, { freq: 95, toFreq: 45, duration: 0.18, gain: vol(0.1), delay: 0.05 })
    noiseBurst(ctx, { duration: 0.15, gain: vol(0.045), filterFrom: 7000, filterTo: 2500, type: 'bandpass', q: 3, delay: 0.03 })
    for (let i = 0; i < 3; i++) {
      tone(ctx, { freq: NOTE(19 + i) * (1 + r * 0.02), toFreq: NOTE(16), duration: 0.03, gain: vol(0.016), type: 'triangle', filter: 8000, delay: 0.04 + i * 0.03, space: 0.25 })
    }
  },

  // A rune shoved a tile back: a scrape sliding down, a low push under it.
  knockback: (ctx) => {
    noiseBurst(ctx, { duration: 0.22, gain: vol(0.06), filterFrom: 2400, filterTo: 400, type: 'bandpass', q: 2.5 })
    tone(ctx, { freq: 80, toFreq: 40, duration: 0.15, gain: vol(0.06) })
  },

  // A tile changing hands: a resonant flip, then the tonic triad settling onto
  // it. It fires up to eight times in a settle wave, so it is quiet and it is
  // consonant — eight of these in half a second used to be a G major chord
  // arriving on top of the music, one tile at a time.
  capture: (ctx) => {
    tone(ctx, { freq: NOTE(4), toFreq: NOTE(4) / 2, duration: 0.18, gain: vol(0.05), space: 0.2 })
    tone(ctx, { freq: NOTE(11), toFreq: NOTE(9), duration: 0.14, gain: vol(0.026), type: 'triangle', space: 0.25 })
    for (const d of [9, 11, 14]) {
      tone(ctx, { freq: NOTE(d), duration: 0.3, gain: vol(0.016), delay: 0.06, filter: 2500, attack: 0.02, space: 0.35 })
    }
  },

  // The golden Lv 2 burst: C-E-G-C rising over 180 ms, a shimmer opening
  // above it and a thump under it. The most satisfying sound in the game, on
  // purpose — stacking is the thing the player has to WANT to do.
  merge: (ctx) => {
    // D–F–A–D, struck as bells: the key's own triad and its octave, rising over
    // 180 ms. The most satisfying sound in the game, on purpose.
    for (const [i, d] of [14, 16, 18, 21].entries()) {
      bellTone(ctx, { freq: NOTE(d), duration: 0.34, gain: vol(0.05), delay: i * 0.06, space: 0.4 })
    }
    noiseBurst(ctx, { duration: 0.4, gain: vol(0.024), filterFrom: 3000, filterTo: 8500, type: 'bandpass', q: 1.2, space: 0.4 })
    tone(ctx, { freq: NOTE(0) / 2 * 1.2, toFreq: 45, duration: 0.2, gain: vol(0.075), space: 0.15 })
  },

  // Several runes shattered at once: a stacked impact and a bright hit whose
  // pitch climbs with the size of the combo.
  combo: (ctx, p) => {
    const k = Math.min(1, Math.max(0, p))
    tone(ctx, { freq: 140, toFreq: 55, duration: 0.2, gain: vol(0.14) })
    noiseBurst(ctx, { duration: 0.2, gain: vol(0.09), filterFrom: 3500, filterTo: 300 })
    // The bright hit climbs the SCALE with the size of the combo — two runes
    // and four runes are different notes, not just different volumes.
    const step = 14 + Math.round(k * 4)
    tone(ctx, { freq: NOTE(step), duration: 0.14, gain: vol(0.05), type: 'triangle', filter: 6000, delay: 0.02, space: 0.3 })
    bellTone(ctx, { freq: NOTE(step) * 2, duration: 0.3, gain: vol(0.022), delay: 0.03, space: 0.45 })
  },

  // ── match ────────────────────────────────────────────────────────────────

  // A triumphant triad swelling under the recorded fanfare (LAYER_SAMPLES).
  victory: (ctx) => {
    // The tonic triad with the ninth on top — in key, so it lands ON the music
    // rather than beside it, and open enough to sound like an arrival.
    for (const [i, d] of [7, 9, 11, 15].entries()) {
      tone(ctx, { freq: NOTE(d), duration: 0.9, gain: vol(0.045), type: 'triangle', filter: 3200, delay: i * 0.05, attack: 0.03, space: 0.45 })
    }
    noiseBurst(ctx, { duration: 0.6, gain: vol(0.026), filterFrom: 1200, filterTo: 6500, type: 'bandpass', q: 0.8, space: 0.5 })
  },

  // A sub drop under the recorded sting (LAYER_SAMPLES).
  defeat: (ctx) => {
    tone(ctx, { freq: 110, toFreq: 40, duration: 0.7, gain: vol(0.1) })
    tone(ctx, { freq: 165, toFreq: 82, duration: 0.6, gain: vol(0.04), type: 'sawtooth', filter: 900, delay: 0.05 })
  },

  // A low horn holding while a tension line climbs over it.
  suddenDeath: (ctx) => {
    // A hollow fifth on the tonic — D under A, no third at all. An open fifth
    // is the oldest "something is coming" in western music, and it is the one
    // chord that cannot be happy or sad, only imminent.
    tone(ctx, { freq: NOTE(0) / 2, toFreq: NOTE(0) / 2 + 4, duration: 1.0, gain: vol(0.13), type: 'sawtooth', filter: 700, attack: 0.02, space: 0.35 })
    tone(ctx, { freq: NOTE(4) / 2, duration: 0.9, gain: vol(0.075), type: 'sawtooth', filter: 900, delay: 0.04, attack: 0.02, space: 0.35 })
    tone(ctx, { freq: NOTE(4), toFreq: NOTE(11), duration: 1.1, gain: vol(0.045), delay: 0.1, attack: 0.1, space: 0.4 })
    noiseBurst(ctx, { duration: 1.0, gain: vol(0.04), filterFrom: 300, filterTo: 2500, type: 'bandpass', q: 1 })
  },

  // The 0.2 s board wipe: a whoosh that crosses the screen left to right.
  reset: (ctx) => {
    noiseBurst(ctx, { duration: 0.2, gain: vol(0.07), filterFrom: 200, filterTo: 4000, type: 'bandpass', q: 0.8, pan: -1, panTo: 1 })
    tone(ctx, { freq: 300, toFreq: 900, duration: 0.2, gain: vol(0.02), pan: -1, panTo: 1 })
  },

  // ── meta ─────────────────────────────────────────────────────────────────

  // The result screen's coin tally. Tiny, dry, and pitched up as it runs.
  countUp: (ctx, p) => {
    // Up the scale as the tally runs — seven steps, so a long count is a run
    // and not a siren.
    tone(ctx, { freq: NOTE(14 + Math.min(1, Math.max(0, p)) * 7), duration: 0.05, gain: vol(0.026), type: 'triangle', filter: 4500, space: 0.15 })
  },

  // The flame aura climbing a step: a whoosh, a rumble, and a bright ping.
  streak: (ctx) => {
    noiseBurst(ctx, { duration: 0.35, gain: vol(0.07), filterFrom: 300, filterTo: 3000, type: 'bandpass', q: 0.9 })
    tone(ctx, { freq: 70, toFreq: 50, duration: 0.3, gain: vol(0.05) })
    bellTone(ctx, { freq: NOTE(18) * 2, duration: 0.35, gain: vol(0.03), delay: 0.12, space: 0.45 })
  },

  // An anvil: inharmonic partials (the ratios of a struck bar, not a string)
  // over a strike transient and a short body.
  forge: (ctx) => {
    const f = 1320
    for (const [i, [ratio, g, d]] of ([[1, 0.05, 0.5], [1.77, 0.03, 0.4], [2.71, 0.02, 0.3], [3.42, 0.012, 0.22]] as const).entries()) {
      tone(ctx, { freq: f * ratio, duration: d, gain: vol(g), delay: i * 0.004 })
    }
    noiseBurst(ctx, { duration: 0.03, gain: vol(0.06), filterFrom: 6000, filterTo: 2000 })
    tone(ctx, { freq: 260, toFreq: 180, duration: 0.12, gain: vol(0.05) })
  }
}

/** Test seam: is there a sound for this cue at all (sample, layered or synthesised)? */
export const __cueIsDefined = (id: FxSound): boolean =>
  id in SAMPLE_CUES || id in LAYER_SAMPLES || id in SYNTH

/**
 * Play one cue. Safe to call from the render loop at any density —
 * throttling, mute gating and ad suspension are all handled here, and a
 * browser refusing to allocate more nodes is not worth interrupting a frame
 * for: the visual feedback carries the moment on its own.
 *
 * @param power 0..1 intensity hint (a combo's size, a placement's weight, the
 *   clock's urgency). Never changes WHICH sound plays.
 */
export const playFx = (id: FxSound, power = 0): void => {
  if (!canPlay()) return
  if (!passesThrottle(id)) return

  const sample = SAMPLE_CUES[id]
  if (sample) {
    playSound(sample[0], sample[1], 0.94 + Math.random() * 0.12)
    return
  }

  const layer = LAYER_SAMPLES[id]
  if (layer) playSound(layer[0], layer[1], 0.94 + Math.random() * 0.12)

  const synth = SYNTH[id]
  if (!synth) return
  const ctx = getAudioContext()
  if (!ctx) return
  // A context that has never been unlocked by a gesture stays suspended; the
  // shared `armResumeOnGesture` in useAssets resumes it on the first tap, so we
  // skip until then rather than queueing a backlog of silent voices.
  if (ctx.state !== 'running') return

  try {
    synth(ctx, Number.isFinite(power) ? power : 0, Math.random())
  } catch {
    // Node budget exhausted or a context mid-teardown — the frame goes on.
  }
}

/** Warm the synthesis path (build the noise buffer) so the first placement of
 *  a session doesn't pay for a 1.2 s buffer fill mid-frame. */
export const warmAudio = (): void => {
  const ctx = getAudioContext()
  if (!ctx) return
  // Building the bus is what allocates the room's impulse response — about a
  // millisecond of noise and a decay curve. Doing it here means the first
  // placement of a session pays for a gain node and nothing else.
  bus()
  getNoise(ctx)
}
