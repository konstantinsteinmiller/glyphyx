import type { FxSound } from '@/game/cues'
import { NOTE, crackle, fm, heft, noiseBurst, swell, thump, tone, vol, whoosh, type Synth } from '@/use/sfxKit'

/**
 * ─── Orb (`mage`) — its voices ──────────────────────────────────────────────
 *
 * The recipes for `beam`, `beamHit`, `explode`. Each is `(ctx, p, r, o)`: `p` the 0…1
 * intensity the renderer asked for, `r` a fresh random for jitter, `o.pan`
 * where on the board it happened (the kit's voice already places every
 * instrument there), `o.level` the rune's level (1…8), `o.side` whose rune.
 * Built from `@/use/sfxKit`; every pitch through `NOTE()` (D minor).
 *
 * THE FAMILY — ARCANE GLASS. Everything the orb says is either a hum (two FM
 * voices a few cents apart, so they BEAT — the sound's own wobble) or glass
 * (FM at the inharmonic 3.5 : 1 ratio, bright at the strike and ringing
 * down). Nothing here is metal (the sword, the shield), wood or string (the
 * bow), stone (the boulder) or fire (the mortar, the warhead): a player hears
 * the orb as the one rune that is made of light.
 *
 * Node counts (the cue test holds each to 48) are noted per line; the voice's
 * own stereo panner is +1.
 */

/** ±2 % of pitch per call, so ten beams in a match are ten beams and not one sample. */
const jitter = (r: number, k = 0.04): number => 1 + (r - 0.5) * k

export const MAGE_SFX: Partial<Record<FxSound, Synth>> = {
  // THE CHARGE AND THE IGNITION (a launch: −30…−20 dB). No transient at the
  // top — a spell GATHERS. Air rising, a sine gliding up the octave, and under
  // it the hum, one voice each side; then, as the beam leaves the orb
  // (~95 ms), a glassy zap. A Lv 2+ orb adds the hum an octave down.
  beam: (ctx, _p, r, o) => {
    const j = jitter(r)
    const h = heft(o.level)
    swell(ctx, { duration: 0.1, from: 700 * j, to: 4200 * j, gain: vol(0.05), q: 1.4, space: 0.3 }) // 4
    tone(ctx, { freq: NOTE(7) * j, toFreq: NOTE(14) * j, duration: 0.11, gain: vol(0.022), attack: 0.08, space: 0.3 }) // 3
    fm(ctx, { freq: NOTE(0) * j, ratio: 2, index: 1.4, indexTo: 0.5, duration: 0.44, gain: vol(0.045), attack: 0.07, pan: -0.35, space: 0.35 }) // 6
    fm(ctx, { freq: NOTE(0) * j * 1.011, ratio: 3, index: 1, indexTo: 0.3, duration: 0.44, gain: vol(0.04), attack: 0.07, pan: 0.35, space: 0.35 }) // 6
    fm(ctx, { freq: NOTE(14) * j, ratio: 3.51, index: 5, indexTo: 0.3, duration: 0.17, gain: vol(0.04), delay: 0.09, space: 0.35 }) // 5
    tone(ctx, { freq: NOTE(21) * j, toFreq: NOTE(10) * j, duration: 0.07, gain: vol(0.03), type: 'triangle', filter: 5200, delay: 0.09, space: 0.2 }) // 4
    if (h > 0) {
      fm(ctx, { freq: NOTE(-7) * j, ratio: 2, index: 1.2, indexTo: 0.4, duration: 0.42, gain: vol(0.02 + 0.05 * h), attack: 0.07, space: 0.25 }) // 5
    }
  },

  // THE BLOOM (a regular hit: −24…−16 dB). TRANSIENT a bright tick of glass;
  // BODY glass struck (3.5 : 1 FM) with a bell partial over it and a small low
  // thump so the blow lands on a stone; SWEETENER the zap falling through the
  // octave — the beam's energy dumping out; TAIL a high shimmer blooming into
  // the room.
  beamHit: (ctx, _p, r, o) => {
    const j = jitter(r, 0.05)
    const h = heft(o.level)
    noiseBurst(ctx, { duration: 0.025, gain: vol(0.1), filterFrom: 9000, filterTo: 4000, type: 'highpass', q: 0.7, space: 0 }) // 3
    fm(ctx, { freq: NOTE(17) * j, ratio: 3.5, index: 4.5, indexTo: 0.25, duration: 0.5, gain: vol(0.085), space: 0.45 }) // 5
    fm(ctx, { freq: NOTE(21) * j, ratio: 2.76, index: 2, indexTo: 0.1, duration: 0.32, gain: vol(0.04), delay: 0.006, space: 0.5 }) // 5
    tone(ctx, { freq: NOTE(19) * j, toFreq: NOTE(5) * j, duration: 0.1, gain: vol(0.07), type: 'triangle', filter: 4200, space: 0.2 }) // 4
    thump(ctx, { freq: NOTE(-7), duration: 0.16, gain: vol(0.2 + 0.1 * h), punch: 2.4, space: 0.05 }) // 3
    noiseBurst(ctx, { duration: 0.5, gain: vol(0.03), filterFrom: 7000, filterTo: 2600, type: 'bandpass', q: 2.5, delay: 0.02, space: 0.75 }) // 4
  },

  // THE CROSS (a heavy hit: −20…−12 dB). The pillars rising (a short upward
  // rush the blast lands on), the SUB of the floor dropping out, a wide burst
  // closing down, then GLASS: a spray of tiny grains and three struck shards
  // placed round the field — and the BLOOM, a D ringing on into the room.
  explode: (ctx, _p, r, o) => {
    const j = jitter(r)
    const h = heft(o.level)
    whoosh(ctx, { duration: 0.28, from: 280, to: 2600, gain: vol(0.06), rise: 0.3, q: 1.1, space: 0.35 }) // 4
    thump(ctx, { freq: NOTE(-10), duration: 0.6, gain: vol(0.17 + 0.07 * h), punch: 3.2, click: vol(0.05), space: 0.08 }) // 6
    noiseBurst(ctx, { duration: 0.5, gain: vol(0.085), filterFrom: 3400, filterTo: 140, q: 0.8, space: 0.25 }) // 4
    crackle(ctx, { duration: 0.42, density: 70, gain: vol(0.07), freq: 6400, q: 3, grainMs: 5, delay: 0.012, space: 0.45 }) // 4
    fm(ctx, { freq: NOTE(14) * j, ratio: 3.5, index: 3, indexTo: 0.2, duration: 0.38, gain: vol(0.03), delay: 0.018, pan: -0.55, space: 0.5 }) // 6
    fm(ctx, { freq: NOTE(16) * j, ratio: 3.5, index: 3, indexTo: 0.2, duration: 0.34, gain: vol(0.026), delay: 0.05, pan: 0.55, space: 0.5 }) // 6
    fm(ctx, { freq: NOTE(19) * j, ratio: 3.5, index: 2.5, indexTo: 0.15, duration: 0.3, gain: vol(0.022), delay: 0.085, space: 0.5 }) // 5
    fm(ctx, { freq: NOTE(0) * j, ratio: 2, index: 1.6, indexTo: 0.3, duration: 1.1, gain: vol(0.05), attack: 0.025, space: 0.9 }) // 5
  }
}
