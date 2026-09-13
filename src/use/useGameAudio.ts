import { getAudioContext, isAudioSuspended } from '@/use/useAssets'
import { bus } from '@/use/audioBus'
import { isMobileAudioMuted } from '@/use/useMobileAudioMute'
import useSounds from '@/use/useSound'
import type { FxSound, SfxOpts } from '@/game/cues'
import { NOTE, beginVoice, bellTone, endVoice, getNoise, noiseBurst, tone, vol, type Synth } from '@/use/sfxKit'
import { RUNE_SFX } from '@/use/runeSfx'

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

export interface Throttle { minGapMs: number; maxPerWindow: number; windowMs: number }

export const THROTTLES: Partial<Record<FxSound, Throttle>> = {
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
  aura: { minGapMs: 60, maxPerWindow: 4, windowMs: 400 },
  intercept: { minGapMs: 45, maxPerWindow: 6, windowMs: 300 },
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

// ─── Gating ─────────────────────────────────────────────────────────────────

const canPlay = (): boolean => !isAudioSuspended() && !isMobileAudioMuted.value

// ─── Synthesis primitives ───────────────────────────────────────────────────
//
// The instruments — `tone`, `noiseBurst`, `bellTone`, and the richer `fm`,
// `metal`, `pluck`, `whoosh`, `crackle`, `thump`, `swell`, `shimmer` — live in
// `sfxKit.ts`, shared with the per-rune recipes in `runeSfx/`. The palette's
// two rules (one key, one room) are written up there.

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


/**
 * One function per synthesised cue.
 *
 * `p` is the 0..1 intensity hint the caller derives from context (how many
 * runes a combo took, how heavy the placement was); `r` is a fresh random for
 * pitch jitter. `p` never changes WHICH sound plays — only how big it is — so
 * the mix stays legible.
 */
const BASE_SYNTH: Partial<Record<FxSound, Synth>> = {
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

/**
 * Every synthesised cue: the board's own (above) and each rune's attack and
 * defence voices (`runeSfx/<rune>.ts`). A rune recipe overrides a base one of
 * the same name — there are none today; the cue test keeps it that way.
 */
const SYNTH: Partial<Record<FxSound, Synth>> = { ...BASE_SYNTH, ...RUNE_SFX }

/** Test / bench seam: the recipe behind a cue, or `undefined` for a sample-only cue. */
export const synthFor = (id: FxSound): Synth | undefined => SYNTH[id]

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
// ─── The bench's tap (DEV) ───────────────────────────────────────────────────

type SfxTap = (id: FxSound, power: number, opts: SfxOpts | undefined) => void
let sfxTap: SfxTap | null = null

/**
 * DEV / tests: hear every cue the game ASKS for, before any gating — muted,
 * throttled, suspended or not. The FX bench records a scenario's cues with it
 * and renders them offline (`sfxOffline.ts`), so a headless run can be
 * listened to. `null` removes it.
 */
export const __setSfxTap = (fn: SfxTap | null): void => { sfxTap = fn }

const NO_OPTS = { pan: 0, level: 1 } as const

export const playFx = (id: FxSound, power = 0, opts?: SfxOpts): void => {
  if (sfxTap) sfxTap(id, power, opts)
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

  // One VOICE around the whole recipe: every instrument it plays lands on the
  // same stereo panner, so the cue sits where its event happened.
  beginVoice(ctx, opts)
  try {
    synth(ctx, Number.isFinite(power) ? power : 0, Math.random(), opts ? { ...NO_OPTS, ...opts } : NO_OPTS)
  } catch {
    // Node budget exhausted or a context mid-teardown — the frame goes on.
  } finally {
    endVoice()
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
