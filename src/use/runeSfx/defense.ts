import type { FxSound } from '@/game/cues'
import { NOTE, crackle, fm, heft, metal, noiseBurst, swell, thump, tone, vol, whoosh, type Synth } from '@/use/sfxKit'

/**
 * ─── Shield (`defense`) — its voices ────────────────────────────────────────
 *
 * The shield's family is an ENERGY BARRIER: cold, glassy, resonant. Its
 * signature is the "vwomm" — an FM voice at the tonic whose brightness falls
 * as it rings (bright at the strike, hollow as it hums) — with a glass ping
 * over it on an inharmonic ratio. Nothing here is a struck bell (that is the
 * cross's warmth) and nothing is a blade's steel shing.
 *
 *   `shield`    damage absorbed. Transient: a glassy tick. Body: the vwomm,
 *               sagging a whole step. Tail: the room. Sweetener: the glass
 *               ping — and for a block that HELD (`p` ≥ 0.9) a second ping a
 *               fifth up and a bright reflected shimmer; for one that GAVE, an
 *               electric crackle of energy leaking through.
 *   `aura`      the Lv 2 shield raising its domes. Anticipation: noise rising
 *               into the moment. Body: the tonic's harmonics D4 A4 D5 F5 A5
 *               swelling in one after another (a rising harmonic shimmer, soft
 *               attacks, never struck). At 0.1 s — when the domes lock on the
 *               screen — the vwomm and the ping land together.
 *   `intercept` a projectile or a blade stopped dead on the wall. Transient: a
 *               hard noise crack and a kick. Body: a struck plate (`metal`)
 *               with the barrier's FM glass under it. Tail: an electric
 *               crackle as the wall discharges. `p` is the blow's weight: an
 *               arrow (< 0.75) rings high and short with a ricochet zing; a
 *               beam (0.75 … 0.9) sizzles, its crackle and hiss held while it
 *               pushes; a blade (≥ 0.9) is a heavy parry — a lower, longer
 *               clang, a thump and a scrape down the barrier.
 *
 * Every pitch through `NOTE()` (D minor); `r` jitters pitch ±2–3 %; `heft`
 * adds a sub for Lv 2+ shields. Node budget ≤ 48 per cue (the heaviest, a
 * blade parry at Lv 2+, is 39).
 */

export const DEFENSE_SFX: Partial<Record<FxSound, Synth>> = {
  shield: (ctx, p, r, o) => {
    const held = p >= 0.9
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    // Transient: glass taking the blow.
    noiseBurst(ctx, { duration: 0.02, gain: vol(0.06), filterFrom: 5600, filterTo: 2600, type: 'bandpass', q: 1.4, space: 0.05 })
    // Body: the vwomm — hollow FM at the tonic, its brightness draining, sagging a step.
    fm(ctx, { freq: NOTE(0) * j, toFreq: NOTE(-1) * j, ratio: 2, index: held ? 3.4 : 2.6, indexTo: 0.25, duration: held ? 0.44 : 0.32, gain: vol(0.085), attack: 0.008, space: 0.32 })
    // …an octave up and a hair sharp, so the two beat like a humming field.
    fm(ctx, { freq: NOTE(7) * j * 1.013, toFreq: NOTE(6) * j, ratio: 2, index: 1.4, indexTo: 0.1, duration: held ? 0.36 : 0.26, gain: vol(0.03), attack: 0.012, space: 0.32 })
    // Sweetener: the glass ping.
    fm(ctx, { freq: NOTE(18) * j, ratio: 3.5, index: 1.2, indexTo: 0.05, duration: held ? 0.55 : 0.3, gain: vol(held ? 0.03 : 0.022), space: 0.45 })
    if (held) {
      fm(ctx, { freq: NOTE(14) * j, ratio: 3.5, index: 0.9, indexTo: 0.04, duration: 0.5, gain: vol(0.022), delay: 0.012, space: 0.45 })
      whoosh(ctx, { duration: 0.22, from: 2600, to: 7600, gain: vol(0.014), q: 2.2, rise: 0.2, space: 0.3 })
    } else {
      crackle(ctx, { duration: 0.15, density: 120, gain: vol(0.035), freq: 5200, q: 2.6, grainMs: 5, space: 0.12 })
    }
    // A bigger stone's barrier hums an octave lower as well.
    if (h > 0) fm(ctx, { freq: NOTE(-7) * j, toFreq: NOTE(-8) * j, ratio: 2, index: 1.6, indexTo: 0.15, duration: 0.36, gain: vol(0.07 * (0.5 + 0.5 * h)), attack: 0.01, space: 0.12 })
  },

  aura: (ctx, _p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.04
    // Anticipation: energy gathering into the moment the domes stand.
    swell(ctx, { duration: 0.11, from: 700, to: 4400, gain: vol(0.035), q: 2.2, space: 0.2 })
    // Body: the tonic's harmonics swelling in, lowest first — a rising shimmer, never
    // struck — spread left and right, the way the domes rise on either side.
    const H = [7, 11, 14, 16, 18]
    for (let i = 0; i < H.length; i++) {
      const f = NOTE(H[i]!) * j
      tone(ctx, {
        freq: f * 0.985, toFreq: f, duration: 0.55 - i * 0.05, gain: vol(0.021 - i * 0.0025), attack: 0.045, delay: i * 0.022, space: 0.5,
        pan: i === 0 ? undefined : (i % 2 === 0 ? 0.35 : -0.35)
      })
    }
    // The lock: vwomm and glass together, as the domes stand.
    fm(ctx, { freq: NOTE(0) * j, toFreq: NOTE(-1) * j, ratio: 2, index: 2.8, indexTo: 0.2, duration: 0.42, gain: vol(0.07), attack: 0.01, delay: 0.1, space: 0.35 })
    fm(ctx, { freq: NOTE(18) * j, ratio: 3.5, index: 1, indexTo: 0.04, duration: 0.5, gain: vol(0.022), delay: 0.106, space: 0.5 })
    if (h > 0) tone(ctx, { freq: NOTE(-7), duration: 0.36, gain: vol(0.04 * h), attack: 0.01, delay: 0.1, space: 0.05 })
  },

  intercept: (ctx, p, r, o) => {
    const blade = p >= 0.9
    const beam = !blade && p >= 0.75
    const arrow = !blade && !beam
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    // Transient: the hard stop.
    noiseBurst(ctx, { duration: 0.026, gain: vol(blade ? 0.13 : 0.1), filterFrom: 7200, filterTo: 2200, type: 'bandpass', q: 0.9, space: 0.05 })
    thump(ctx, { freq: blade ? 82 : 110, punch: 2.6, duration: blade ? 0.2 : 0.12, gain: vol(blade ? 0.2 : 0.11), space: 0.05 })
    // Body: the plate rings — high and short for an arrow, low and long for a parried blade.
    metal(ctx, {
      freq: (blade ? NOTE(2) : arrow ? NOTE(9) : NOTE(4)) * j,
      duration: blade ? 0.7 : arrow ? 0.42 : 0.5,
      gain: vol(blade ? 0.06 : 0.048), bright: arrow ? 0.9 : 0.6, space: 0.35
    })
    // …and the barrier's glass resonating under it.
    fm(ctx, { freq: NOTE(blade ? 7 : 11) * j, ratio: 1.41, index: 2.2, indexTo: 0.1, duration: 0.34, gain: vol(0.03), space: 0.4 })
    // Tail: the wall discharging.
    crackle(ctx, { duration: beam ? 0.34 : 0.18, density: beam ? 130 : 90, gain: vol(beam ? 0.05 : 0.036), freq: beam ? 3800 : 5200, q: 2.4, grainMs: 6, space: 0.15 })
    if (arrow) {
      // The ricochet: a zing falling away, off to one side.
      tone(ctx, { freq: 2700 * j, toFreq: 1100 * j, duration: 0.15, gain: vol(0.014), type: 'triangle', delay: 0.02, space: 0.3, pan: 0, panTo: r < 0.5 ? -0.5 : 0.5 })
    } else if (beam) {
      // The beam's pressure: a hiss held against the barrier.
      whoosh(ctx, { duration: 0.3, from: 1900, to: 950, gain: vol(0.025), q: 3, rise: 0.15, space: 0.2 })
    } else {
      // The blade's edge scraping down the barrier.
      whoosh(ctx, { duration: 0.15, from: 5400, to: 1600, gain: vol(0.035), q: 2.5, rise: 0.1, space: 0.15 })
    }
    if (h > 0) thump(ctx, { freq: NOTE(-7), punch: 1.8, duration: 0.3, gain: vol(0.1 * h), space: 0.05 })
  }
}
