import type { FxSound } from '@/game/cues'
import { NOTE, crackle, fm, heft, noiseBurst, swell, thump, tone, vol, whoosh, type Synth } from '@/use/sfxKit'

/**
 * ─── Warhead (`nuker`) — its voice ──────────────────────────────────────────
 *
 * The recipe for `nuke`. `(ctx, p, r, o)`: `p` the 0…1 intensity the renderer
 * asked for, `r` a fresh random for jitter, `o.pan` where on the board it
 * happened (the kit's voice already places every instrument there), `o.level`
 * the rune's level, `o.side` whose rune. Built from `@/use/sfxKit`; every
 * pitch through `NOTE()` (D minor).
 *
 * THE BIGGEST SOUND IN THE GAME (−14…−8 dB short-term), and the only one that
 * is WIDE: every other voice sits on its tile, this one fills the field. It is
 * throttled to one per window (`THROTTLES.nuke`), so two warheads in a
 * resolution are one blast — and one blast is all the mix can take.
 *
 * In order: the INHALE (a reverse swell, the air sucked into the core — the
 * blast lands 50 ms late, the way thunder follows the flash), the CRACK, the
 * SUB DROP (a D falling out of the floor with a kick under it), the BLAST
 * itself as two decorrelated bodies of noise hard left and right, the long
 * RUMBLE, DEBRIS raining back down on both sides — and the sweetener that
 * makes it the warhead and not the mortar: an inharmonic GROWL under the
 * blast and sparse GEIGER TICKS in the tail, the radiation that stays.
 *
 * Node counts (the cue test holds it to 48) are noted per line; the voice's
 * own stereo panner is +1.
 */

/** The blast lands this long after the cue starts: the inhale is in front of it. */
const BLAST = 0.085

export const NUKER_SFX: Partial<Record<FxSound, Synth>> = {
  nuke: (ctx, _p, r, o) => {
    const j = 1 + (r - 0.5) * 0.03
    // A stacked warhead does not get LOUDER (it is already the ceiling of the
    // mix) — it gets LONGER: the rumble and the debris run on.
    const h = heft(o.level)
    // The inhale ends a hair BEFORE the blast: the suck, a gap you cannot hear, then the crack.
    swell(ctx, { duration: BLAST - 0.004, from: 250, to: 5200, gain: vol(0.18), q: 0.7, space: 0.4 }) // 4
    noiseBurst(ctx, { duration: 0.3, gain: vol(0.13), filterFrom: 11000, filterTo: 1200, q: 0.6, delay: BLAST, space: 0.25 }) // 4
    // The kick is the crack's punch; the sub drop swells in behind it and
    // peaks ~75 ms later — the heavy BOOM after the crack. Their peaks never
    // stack, the compressor is already holding, and the blast stays loud for
    // a tenth of a second instead of one spike.
    thump(ctx, { freq: NOTE(-10), duration: 0.8, gain: vol(0.18), punch: 4, delay: BLAST, space: 0.05 }) // 3
    tone(ctx, { freq: NOTE(-7) * j, toFreq: NOTE(-18), duration: 1.5, gain: vol(0.3), attack: 0.035, delay: BLAST + 0.04, space: 0 }) // 2
    // The two bodies swell in over ~25 ms, a beat behind the crack: the bus's
    // compressor is already holding when they land, so they fill rather than clip.
    whoosh(ctx, { duration: 1.25, from: 4600, to: 110, q: 0.45, rise: 0.04, gain: vol(0.36), delay: BLAST + 0.006, pan: -0.95, space: 0.35 }) // 5
    whoosh(ctx, { duration: 1.4, from: 3800, to: 90, q: 0.45, rise: 0.04, gain: vol(0.36), delay: BLAST + 0.016, pan: 0.95, space: 0.35 }) // 5
    noiseBurst(ctx, { duration: 2.5 + 0.8 * h, gain: vol(0.13), filterFrom: 360, filterTo: 42, q: 0.9, delay: BLAST + 0.1, space: 0.45, loop: true }) // 4
    crackle(ctx, { duration: 1.5 + 0.5 * h, density: 42, gain: vol(0.065), freq: 2300, q: 1.4, grainMs: 10, delay: BLAST + 0.22, pan: -0.7, space: 0.3 }) // 5
    crackle(ctx, { duration: 1.4 + 0.5 * h, density: 38, gain: vol(0.055), freq: 3300, q: 1.6, grainMs: 8, delay: BLAST + 0.3, pan: 0.7, space: 0.3 }) // 5
    fm(ctx, { freq: NOTE(-7) * j, ratio: 1.41, index: 4, indexTo: 0.4, duration: 1.2, gain: vol(0.07), delay: BLAST, space: 0.2 }) // 5
    crackle(ctx, { duration: 1.6, density: 14, gain: vol(0.045), freq: 5200, q: 0.9, grainMs: 2.5, delay: 0.7, decay: false, space: 0.08 }) // 4
  }
}
