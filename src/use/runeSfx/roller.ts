import type { FxSound } from '@/game/cues'
import { NOTE, crackle, fm, heft, noiseBurst, swell, thump, tone, vol, type Synth } from '@/use/sfxKit'

/**
 * ─── Boulder (`roller`) — its voices ────────────────────────────────────────
 *
 * EARTH. Every other rune's voice has something bright in it — steel, a
 * string, glass, brass, a fuse. This one is the family with no top: stone on
 * stone, a mass you hear through the floor before you hear it in the air.
 *
 *   roll     (from `start`) the HEAVE — a grinding scrape rising as the stone
 *            leans back — a KNOCK as the rock drops out of it (~65 ms, the
 *            launch frame), then the ROLL: a low rumble made of irregular
 *            bumps (a spike train through a 120 Hz band, not a drone), a sub
 *            sliding down under it, gravel crunching in the mid band, and
 *            three knocks as it drops over the tile seams, closing up because
 *            it is gathering speed. Launch loudness (≈ −25 dB short-term).
 *   rollHit  (from `impact`, power 1; ~0.5 from `paint` for a stone it rolls
 *            THROUGH) the CRUNCH — a hard broadband crack, a sub thump that
 *            drops from 3× (the weight), rock grinding on rock sweeping down,
 *            then the debris: gravel scattering and a few pebbles bouncing,
 *            and a low rumble left in the room. Lv 2+ digs a sub under it all.
 *            At power 1 it is a heavy hit (≈ −15 dB short-term).
 *
 * `r` jitters pitch ±2.5 % and the grain timing; `heft(level)` adds weight.
 * Every pitched voice is D minor: D2 / A1 / D1 under a rune whose whole
 * character is being LOW.
 */

export const ROLLER_SFX: Partial<Record<FxSound, Synth>> = {
  roll: (ctx, p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    const g = Math.max(0.4, Math.min(1, p || 0.85))
    // The heave: stone grinding against the floor as it leans back.
    swell(ctx, { duration: 0.075, from: 150, to: 420, gain: vol(0.07 * g), q: 1.3, space: 0.04 })
    // The rock drops out of the stone.
    thump(ctx, { freq: NOTE(-7) * j, duration: 0.2, gain: vol((0.16 + 0.05 * h) * g), punch: 2.4, delay: 0.062 })
    noiseBurst(ctx, { duration: 0.05, gain: vol(0.07 * g), filterFrom: 1400, filterTo: 380, q: 0.9, delay: 0.062, space: 0.05 })
    // The roll: irregular low bumps, not a steady tone — a mass turning over.
    crackle(ctx, { duration: 0.28, density: 36, gain: vol(0.42 * g), freq: 120 * j, q: 0.8, grainMs: 28, delay: 0.07, decay: false, space: 0.08 })
    // …over a continuous bed of low grinding, so the roll carries the whole way.
    noiseBurst(ctx, { duration: 0.3, gain: vol(0.16 * g), filterFrom: 420, filterTo: 150, q: 0.7, loop: true, rate: 0.6, delay: 0.065, space: 0.06 })
    tone(ctx, { freq: NOTE(-10) * j, toFreq: NOTE(-14) * j, duration: 0.3, gain: vol((0.1 + 0.05 * h) * g), attack: 0.04, delay: 0.07, space: 0.05 })
    // Gravel crunching under it.
    crackle(ctx, { duration: 0.26, density: 60, gain: vol(0.06 * g), freq: 1500 * j, q: 1.5, grainMs: 6, delay: 0.08, space: 0.1 })
    // Three knocks as it drops over the seams — closer together as it gathers speed.
    for (let i = 0; i < 3; i++) {
      noiseBurst(ctx, {
        duration: 0.04, gain: vol((0.09 + i * 0.02) * g), filterFrom: 560 * j, filterTo: 230, type: 'bandpass', q: 1.8,
        delay: 0.11 + i * 0.058 - i * i * 0.008 + (r - 0.5) * 0.01, space: 0.06
      })
    }
    if (h > 0) tone(ctx, { freq: NOTE(-14), duration: 0.34, gain: vol(0.1 * h * g), attack: 0.05, delay: 0.06, space: 0 })
  },

  rollHit: (ctx, p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    const power = Math.max(0.3, Math.min(1, Number.isFinite(p) && p > 0 ? p : 1))
    const big = power >= 0.75
    // The crack: stone splitting, one hard broadband edge.
    noiseBurst(ctx, { duration: 0.024, gain: vol(0.17 * power), filterFrom: 7500, filterTo: 1600, type: 'highpass', q: 0.7, space: 0.02 })
    // The weight: a sub thump dropping from three times its pitch.
    thump(ctx, { freq: (big ? NOTE(-10) : NOTE(-7)) * j, duration: big ? 0.45 : 0.2, gain: vol((big ? 0.33 : 0.2) + 0.06 * h), punch: 3.2, space: 0.06 })
    // Rock grinding on rock, sweeping down.
    noiseBurst(ctx, { duration: big ? 0.2 : 0.12, gain: vol(0.18 * power), filterFrom: 2800, filterTo: 260, q: 1.1, rate: 0.75, space: 0.12 })
    noiseBurst(ctx, { duration: 0.1, gain: vol(0.12 * power), filterFrom: 950 * j, filterTo: 480, type: 'bandpass', q: 2.6, delay: 0.004, space: 0.08 })
    // The debris: gravel scattering, then a few pebbles bouncing.
    crackle(ctx, { duration: big ? 0.5 : 0.24, density: 72, gain: vol(0.09 * power), freq: 2100 * j, q: 1.4, grainMs: 5, delay: 0.025, space: 0.22 })
    crackle(ctx, { duration: big ? 0.42 : 0.2, density: 15, gain: vol(0.08 * power), freq: 620 * j, q: 2.4, grainMs: 14, delay: big ? 0.1 : 0.06, space: 0.18 })
    if (big) {
      // What is left in the room: a low rumble settling.
      noiseBurst(ctx, { duration: 0.7, gain: vol(0.12 + 0.05 * h), filterFrom: 240, filterTo: 55, q: 0.8, loop: true, delay: 0.02, space: 0.4 })
      // The crystal in the rock giving: one dull glassy knock, far under the rest.
      fm(ctx, { freq: NOTE(14) * j, ratio: 3.51, index: 1.6, indexTo: 0.1, duration: 0.16, gain: vol(0.012), delay: 0.012, space: 0.3 })
      if (h > 0) tone(ctx, { freq: NOTE(-14), toFreq: NOTE(-17), duration: 0.55, gain: vol(0.16 * h), attack: 0.006, space: 0.05 })
    }
  }
}
