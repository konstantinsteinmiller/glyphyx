import type { FxSound } from '@/game/cues'
import { NOTE, crackle, fm, heft, metal, noiseBurst, thump, vol, whoosh, type Synth } from '@/use/sfxKit'

/**
 * ─── Sword (`melee`) — its voices ───────────────────────────────────────────
 *
 * STEEL. Everything the sword says is bright, fast and metallic, and sits in
 * the top of the key — the axe (`runeSfx/cleave.ts`) is its opposite: low,
 * wide, chunky, burning.
 *
 *   slash      the swing (fired as the swing STARTS; the blade lands ~110 ms
 *              later). A thin high swish that crests as the edge crosses the
 *              target and travels across the swing, with the "shing" of steel
 *              singing through the air swelling under it and a glassy zing at
 *              the crest.
 *   slashHit   the blow. Transient: the edge biting (a bright click). Body: a
 *              struck steel bar in the key, a low thump so it lands, the
 *              stone cracking under it. Tail: the room. Sweetener: the shing
 *              ringing on after the clang has died.
 *   knockback  the Lv 2 shove. A short dense push of air, stone skidding over
 *              stone, the thud of it digging in — and a low steel hum under
 *              the push so it is still the sword's.
 *
 * Every pitch through `NOTE()` (D minor); `r` jitters pitch ±2.5 %; `heft`
 * adds weight from Lv 2.
 *
 * `N()` nudges every NOISE layer's start half a sample off the grid. Chrome's
 * buffer source glitches — one sample, up to −0.5 dBFS — when a start time
 * lands a hair PAST a whole sample frame (0.085 s × 48 kHz = 4080.0000000000005),
 * and round-millisecond delays on a grid-aligned clock land there all the
 * time. Half a sample (10 µs) is inaudible and keeps the frame's fraction far
 * from zero. (Oscillators are not affected.)
 */

const N = (delay = 0): number => delay + 0.5 / 48000
/** ±2.5 % around 1, from the cue's random. */
const jitter = (r: number): number => 1 + (r - 0.5) * 0.05
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

export const MELEE_SFX: Partial<Record<FxSound, Synth>> = {
  slash: (ctx, p, r, o) => {
    const j = jitter(r)
    const g = 0.7 + 0.3 * clamp01(p)
    const h = heft(o.level)
    // The swish: air torn by a thin edge — a narrow band sweeping up, cresting
    // as the blade crosses the target, travelling across the swing.
    whoosh(ctx, { duration: 0.15, from: 1300 * j, to: 6800 * j, gain: vol(0.32 * g), q: 1.3, rise: 0.62, delay: N(), pan: -0.25, panTo: 0.25, space: 0.08 })
    // A heavier blade moves more air: a lower body under it from Lv 2.
    if (h > 0) whoosh(ctx, { duration: 0.16, from: 520 * j, to: 1700 * j, gain: vol(0.12 * h), q: 0.9, rise: 0.6, delay: N(), space: 0.05 })
    // The shing: steel singing through the air — inharmonic FM swelling in, high in the key.
    fm(ctx, { freq: NOTE(21) * j, ratio: 2.76, index: 0.9, indexTo: 0.15, duration: 0.3, gain: vol(0.04 * g), attack: 0.05, delay: 0.045, space: 0.4 })
    // A glassy zing at the crest.
    noiseBurst(ctx, { duration: 0.05, gain: vol(0.07 * g), filterFrom: 6500, filterTo: 11000, type: 'highpass', q: 0.8, delay: N(0.085), space: 0.05 })
  },

  slashHit: (ctx, p, r, o) => {
    const j = jitter(r)
    const g = 0.6 + 0.4 * clamp01(p)
    const h = heft(o.level)
    // Transient: the edge biting.
    noiseBurst(ctx, { duration: 0.03, gain: vol(0.2 * g), filterFrom: 9000, filterTo: 3500, type: 'highpass', q: 0.7, delay: N(), space: 0 })
    // The clang: a struck steel bar on the key's F.
    metal(ctx, { freq: NOTE(9) * j, duration: 0.4, gain: vol(0.1 * g), bright: 0.8, space: 0.24 })
    // The stone cracking under it: a dense, short grit.
    crackle(ctx, { duration: 0.09, density: 280, gain: vol(0.2 * g), freq: 2400, q: 1.4, grainMs: 4, delay: N(), space: 0.05 })
    // The body: a low thump so the blow LANDS.
    thump(ctx, { freq: NOTE(-7) * j, duration: 0.16, gain: vol(0.16 * g), punch: 3.2, space: 0.04 })
    // Sweetener: the shing ringing on into the room after the clang.
    fm(ctx, { freq: NOTE(18) * j, ratio: 3.5, index: 1.4, indexTo: 0.08, duration: 0.55, gain: vol(0.034 * g), delay: 0.012, space: 0.45 })
    // Lv 2+: more weight under it.
    if (h > 0) thump(ctx, { freq: NOTE(-10), duration: 0.26, gain: vol(0.13 * h), punch: 2.5, delay: 0.005, space: 0.05 })
  },

  knockback: (ctx, p, r, o) => {
    const j = jitter(r)
    const g = 0.7 + 0.3 * clamp01(p)
    const h = heft(o.level)
    // The shove: a short, dense push of air.
    whoosh(ctx, { duration: 0.14, from: 380 * j, to: 1300 * j, gain: vol(0.12 * g), q: 0.9, rise: 0.25, delay: N(), space: 0.06 })
    // The skid: stone dragged over stone — grit, and a scrape sliding down.
    crackle(ctx, { duration: 0.17, density: 220, gain: vol(0.15 * g), freq: 1500, q: 2.2, grainMs: 8, delay: N(0.015), decay: false, space: 0.06 })
    noiseBurst(ctx, { duration: 0.18, gain: vol(0.08 * g), filterFrom: 2600 * j, filterTo: 450, type: 'bandpass', q: 3, delay: N(0.01), space: 0.06 })
    // The stop: it digs in (the slide is 180 ms).
    thump(ctx, { freq: NOTE(-3) * j, duration: 0.15, gain: vol((0.16 + 0.05 * h) * g), punch: 2.4, delay: 0.17, space: 0.08 })
    crackle(ctx, { duration: 0.12, density: 60, gain: vol(0.08 * g), freq: 3000, q: 2, grainMs: 5, delay: N(0.17), space: 0.12 })
    // Sweetener: the sword's force — a low steel hum under the push.
    fm(ctx, { freq: NOTE(0) * j, ratio: 1.41, index: 2.2, indexTo: 0.3, duration: 0.2, gain: vol(0.035 * g), attack: 0.02, space: 0.2 })
  }
}
