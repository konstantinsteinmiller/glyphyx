import { ref } from 'vue'
import { bus, space, type AudioBus } from '@/use/audioBus'
import { isAudioSuspended } from '@/use/useAssets'
import { isMobileAudioMuted } from '@/use/useMobileAudioMute'
import useUser from '@/use/useUser'
import { LOOP_BEATS, SCORE, SECONDS_PER_BEAT, midiHz, type Note, type Part } from '@/game/music'

/**
 * ─── The band ───────────────────────────────────────────────────────────────
 *
 * Plays `@/game/music` — a piano, a violin, a cello and three hand percussion
 * voices, built out of oscillators and filtered noise on the shared
 * AudioContext. There is no audio file: sixty seconds of stereo would be a
 * megabyte, and a file cannot loop without a seam.
 *
 * ── How each instrument is faked, and why it works ──
 *
 * PIANO. Three partials at 1, 2.01 and 3.03 — the small stretch is real: a
 * struck string is stiff, its overtones sit slightly sharp of the harmonic
 * series, and that inharmonicity is most of what the ear calls "piano". A
 * two-millisecond noise tick at the onset is the hammer. Each partial decays
 * on its own clock, the higher ones fastest, so the note gets rounder as it
 * rings the way a real one does.
 *
 * BOWED STRINGS. A sawtooth is close to what a bow does to a string, so the
 * work is all in the envelope and the filter: 120 ms to speak (350 ms for the
 * cello — a big string takes its time), a lowpass that opens as the note
 * arrives and closes as it leaves, and vibrato that FADES IN after a quarter
 * of a second, because a player does not start a note with it. Two detuned
 * saws per note, six cents apart, give the ensemble width a single oscillator
 * cannot.
 *
 * PERCUSSION. A shaker is a short bandpassed noise; a frame drum is a sine
 * dropping a fifth under a soft skin of noise; a wood tick is a triangle with
 * nothing after it. All three are quiet by design — cozy is a volume as much
 * as a timbre.
 *
 * ── How the loop has no seam ──
 *
 * Nothing restarts. A look-ahead scheduler walks the beat count forever and
 * takes it modulo the loop, so bar 16 is followed by bar 1 the same way bar 3
 * is followed by bar 4: the piano's decay, the cello's release and the reverb
 * tail all cross the join, because as far as the graph is concerned there is
 * no join. The composition does the rest (see `music.ts`).
 *
 * ── Behaving in a browser ──
 *
 * The scheduler is a 120 ms timer that queues the next 500 ms of notes, which
 * is the standard shape: `setTimeout` is not accurate enough to start a note,
 * and the audio clock is. While the context is suspended — an ad, a
 * backgrounded tab, the pause gate — it queues NOTHING and re-anchors its
 * clock on the way back, so a minute behind an interstitial does not come back
 * as a minute of music arriving at once.
 */

const { userMusicVolume } = useUser()

/** True while the band is meant to be playing. */
export const isMusicPlaying = ref(false)

type Voice = (b: AudioBus, n: Note, at: number, gain: number) => void

/** Per-part level, so the arrangement is mixed here and not in the score. */
const LEVEL: Record<Part, number> = {
  piano: 0.22,
  violin: 0.12,
  cello: 0.14,
  bell: 0.085,
  // The shaker is the one voice with any real top end, and measured against
  // the piece it was inaudible on a phone at 0.05 — the whole high band sat
  // 60 dB under the mid. It carries the lilt, so it is allowed to be heard.
  shaker: 0.085,
  drum: 0.17,
  wood: 0.07
}

/** How wet each part is. The struck things stay close; the bowed ones bloom. */
const SEND: Record<Part, number> = {
  piano: 0.22, violin: 0.34, cello: 0.28, bell: 0.45, shaker: 0.08, drum: 0.1, wood: 0.12
}

/** Where each part sits across the stereo field — a seat in a small room. */
const PAN: Record<Part, number> = {
  piano: -0.12, violin: 0.22, cello: -0.28, bell: 0.34, shaker: 0.3, drum: 0, wood: -0.36
}

/**
 * Where a voice actually lands: a fader in front of the music bus, so starting
 * and stopping can ramp instead of cut. Built on first use — the context may
 * not exist when this module is imported.
 */
let fade: GainNode | null = null
const dest = (b: AudioBus): AudioNode => {
  if (!fade) {
    fade = b.ctx.createGain()
    fade.gain.value = 1
    fade.connect(b.music)
  }
  return fade
}

const panned = (b: AudioBus, node: AudioNode, part: Part): AudioNode => {
  if (typeof b.ctx.createStereoPanner !== 'function') return node
  try {
    const p = b.ctx.createStereoPanner()
    p.pan.value = PAN[part]
    node.connect(p)
    return p
  } catch {
    return node
  }
}

const noiseSource = (b: AudioBus, at: number, dur: number, rate = 1): AudioBufferSourceNode => {
  const src = b.ctx.createBufferSource()
  src.buffer = b.noise
  src.playbackRate.value = rate
  src.start(at, Math.random() * 0.4)
  src.stop(at + dur + 0.02)
  return src
}

// ─── The instruments ────────────────────────────────────────────────────────

const strike: Voice = (b, n, at, gain) => {
  const f = midiHz(n.midi)
  // Higher strings ring shorter — the same reason a piano's treble dies away
  // while its bass hangs on.
  const ring = Math.max(0.5, 2.6 - (n.midi - 40) * 0.035)
  const out = b.ctx.createGain()
  out.gain.value = 1
  const partials: [number, number, number][] = [[1, 1, ring], [2.01, 0.34, ring * 0.55], [3.03, 0.13, ring * 0.32]]
  for (const [mul, amp, life] of partials) {
    const osc = b.ctx.createOscillator()
    osc.type = mul === 1 ? 'triangle' : 'sine'
    osc.frequency.value = f * mul
    const g = b.ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * amp), at + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, at + life)
    osc.connect(g).connect(out)
    osc.start(at)
    osc.stop(at + life + 0.05)
  }
  // The hammer.
  const tick = b.ctx.createGain()
  tick.gain.setValueAtTime(gain * 0.5, at)
  tick.gain.exponentialRampToValueAtTime(0.0001, at + 0.03)
  const hp = b.ctx.createBiquadFilter()
  hp.type = 'bandpass'
  hp.frequency.value = Math.min(6000, f * 6)
  hp.Q.value = 0.8
  noiseSource(b, at, 0.03).connect(hp).connect(tick).connect(out)
  space(b, panned(b, out, n.part), dest(b), SEND[n.part])
}

/**
 * The bow. `open` is how far the filter lifts on the attack and `speak` how
 * long the note takes to arrive — the two numbers that separate a violin from
 * a cello more than pitch does.
 */
const bowed = (speak: number, open: number, cut: number): Voice => (b, n, at, gain) => {
  const f = midiHz(n.midi)
  const dur = n.dur * SECONDS_PER_BEAT
  const out = b.ctx.createGain()
  out.gain.setValueAtTime(0.0001, at)
  out.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + speak)
  // A bowed note is not flat: it leans in and settles.
  out.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 0.72), at + Math.min(dur * 0.7, speak + 0.9))
  out.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.35)

  const lp = b.ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.9
  lp.frequency.setValueAtTime(Math.max(200, f * 1.6), at)
  lp.frequency.linearRampToValueAtTime(Math.min(cut, f * open), at + speak * 1.4)
  lp.frequency.linearRampToValueAtTime(Math.max(200, f * 2.2), at + dur + 0.3)
  lp.connect(out)

  // Vibrato, arriving late — nobody starts a note with it.
  let lfo: OscillatorNode | null = null
  let lfoGain: GainNode | null = null
  if (typeof b.ctx.createOscillator === 'function') {
    lfo = b.ctx.createOscillator()
    lfo.frequency.value = 5.2 + Math.random() * 0.7
    lfoGain = b.ctx.createGain()
    lfoGain.gain.setValueAtTime(0.0001, at)
    lfoGain.gain.linearRampToValueAtTime(f * 0.006, at + Math.min(dur * 0.6, 0.55))
    lfo.connect(lfoGain)
    lfo.start(at)
    lfo.stop(at + dur + 0.4)
  }

  for (const cents of [-6, 6]) {
    const osc = b.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = f * Math.pow(2, cents / 1200)
    if (lfoGain) lfoGain.connect(osc.frequency)
    const g = b.ctx.createGain()
    g.gain.value = 0.5
    osc.connect(g).connect(lp)
    osc.start(at)
    osc.stop(at + dur + 0.4)
  }
  // Bow noise, only while the note is speaking.
  const bowN = b.ctx.createGain()
  bowN.gain.setValueAtTime(0.0001, at)
  bowN.gain.linearRampToValueAtTime(gain * 0.1, at + speak)
  bowN.gain.exponentialRampToValueAtTime(0.0001, at + speak + 0.35)
  const bp = b.ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = Math.min(5200, f * 5)
  bp.Q.value = 1.1
  noiseSource(b, at, speak + 0.35).connect(bp).connect(bowN).connect(out)

  space(b, panned(b, out, n.part), dest(b), SEND[n.part])
}

const bell: Voice = (b, n, at, gain) => {
  const f = midiHz(n.midi)
  const out = b.ctx.createGain()
  out.gain.value = 1
  for (const [mul, amp, life] of [[1, 1, 2.4], [2.76, 0.3, 1.5], [5.4, 0.12, 0.9]] as const) {
    const osc = b.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f * mul
    const g = b.ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * amp), at + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, at + life)
    osc.connect(g).connect(out)
    osc.start(at)
    osc.stop(at + life + 0.05)
  }
  space(b, panned(b, out, n.part), dest(b), SEND[n.part])
}

const shaker: Voice = (b, n, at, gain) => {
  const g = b.ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.linearRampToValueAtTime(gain, at + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.075)
  const bp = b.ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 5200 + Math.random() * 900
  bp.Q.value = 1.6
  noiseSource(b, at, 0.09, 0.9 + Math.random() * 0.25).connect(bp).connect(g)
  space(b, panned(b, g, n.part), dest(b), SEND[n.part])
}

const drum: Voice = (b, n, at, gain) => {
  const out = b.ctx.createGain()
  out.gain.value = 1
  const osc = b.ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(96, at)
  osc.frequency.exponentialRampToValueAtTime(52, at + 0.16)
  const g = b.ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.34)
  osc.connect(g).connect(out)
  osc.start(at)
  osc.stop(at + 0.4)
  // The skin: a soft slap over the tone, gone in 60 ms.
  const skin = b.ctx.createGain()
  skin.gain.setValueAtTime(gain * 0.35, at)
  skin.gain.exponentialRampToValueAtTime(0.0001, at + 0.07)
  const lp = b.ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1400
  noiseSource(b, at, 0.08).connect(lp).connect(skin).connect(out)
  space(b, panned(b, out, n.part), dest(b), SEND[n.part])
}

const wood: Voice = (b, n, at, gain) => {
  const osc = b.ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(1180, at)
  osc.frequency.exponentialRampToValueAtTime(920, at + 0.05)
  const g = b.ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.09)
  osc.connect(g)
  osc.start(at)
  osc.stop(at + 0.12)
  space(b, panned(b, g, n.part), dest(b), SEND[n.part])
}

const VOICES: Record<Part, Voice> = {
  piano: strike,
  // A violin speaks in about 120 ms and opens to five times its fundamental;
  // a cello takes three times as long and stays darker. That, and the octave,
  // is the difference.
  violin: bowed(0.12, 6, 5200),
  cello: bowed(0.34, 4, 2600),
  bell,
  shaker,
  drum,
  wood
}

// ─── The scheduler ──────────────────────────────────────────────────────────

/** How far ahead notes are queued, and how often the queue is topped up. */
const LOOKAHEAD_S = 0.5
const TICK_MS = 120

let timer: number | null = null
/** Audio-clock time of beat 0 of the CURRENT pass through the loop. */
let anchor = 0
/** Beats already queued, measured from `anchor`. */
let cursor = 0

const level = (): number => Math.max(0, Math.min(1, (userMusicVolume.value ?? 0.6) * 0.5))

const schedule = (): void => {
  const b = bus()
  if (!b || !isMusicPlaying.value) return
  // Suspended (an ad, the pause gate, a backgrounded tab): queue nothing and
  // re-anchor, so the music picks up where the clock is rather than delivering
  // everything it missed at once.
  if (isAudioSuspended() || isMobileAudioMuted.value) {
    // Fold the cursor back into one pass and pin beat 0 to NOW, so the queue
    // resumes at the clock instead of half a minute in the future.
    cursor %= LOOP_BEATS
    anchor = b.ctx.currentTime - cursor * SECONDS_PER_BEAT
    return
  }
  const until = b.ctx.currentTime + LOOKAHEAD_S
  // Beats are unbounded and the score is not: the modulo IS the loop.
  let guard = 0
  while (anchor + cursor * SECONDS_PER_BEAT < until && guard++ < 512) {
    const beat = cursor % LOOP_BEATS
    for (const n of SCORE) {
      // Beat positions are eighths and the cursor only ever moves by exact
      // differences of them, but a float comparison on music is not a thing to
      // be brave about.
      if (Math.abs(n.at - beat) > 1e-6) continue
      const at = anchor + cursor * SECONDS_PER_BEAT
      const gain = n.vel * LEVEL[n.part] * level()
      if (gain > 0.0005) VOICES[n.part](b, n, at, gain)
    }
    // Advance to the next beat position that carries a note, never less than a
    // sixteenth, so an empty bar costs one iteration rather than sixteen.
    const next = SCORE.reduce<number>((best, n) => {
      const rel = n.at > beat ? n.at - beat : n.at + LOOP_BEATS - beat
      return Math.min(best, rel)
    }, LOOP_BEATS)
    cursor += Math.max(0.25, next)
  }
}

/** Start the band. Idempotent — a second call while playing does nothing. */
export const startMusic = (): void => {
  const b = bus()
  if (!b || isMusicPlaying.value) return
  isMusicPlaying.value = true
  anchor = b.ctx.currentTime + 0.12
  cursor = 0
  // Fade in over two beats: a loop that arrives at full level announces itself.
  const f = dest(b) as GainNode
  f.gain.cancelScheduledValues(b.ctx.currentTime)
  f.gain.setValueAtTime(0.0001, b.ctx.currentTime)
  f.gain.linearRampToValueAtTime(1, b.ctx.currentTime + 2 * SECONDS_PER_BEAT)
  schedule()
  timer = (typeof window !== 'undefined' ? window.setInterval(schedule, TICK_MS) : null)
}

/**
 * Stop it. Voices already queued are left to finish — cutting the graph
 * mid-note is a click, and the longest thing in flight is half a second.
 */
export const stopMusic = (): void => {
  isMusicPlaying.value = false
  if (timer !== null && typeof window !== 'undefined') window.clearInterval(timer)
  timer = null
  const b = bus()
  if (b && fade) {
    fade.gain.cancelScheduledValues(b.ctx.currentTime)
    fade.gain.setValueAtTime(fade.gain.value, b.ctx.currentTime)
    fade.gain.linearRampToValueAtTime(0.0001, b.ctx.currentTime + 0.35)
  }
}

// The same dev-only door as `__audioBus`, for the same reason: a harness has
// to start the band the APP loaded, not a second copy of it.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__music = {
    start: () => startMusic(),
    stop: () => stopMusic(),
    state: () => __musicState()
  }
}

/** Test seam: what the scheduler would do, without a clock. */
export const __musicState = (): { playing: boolean; cursor: number; anchor: number } =>
  ({ playing: isMusicPlaying.value, cursor, anchor })
