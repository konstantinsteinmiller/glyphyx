import type { FxSound } from '@/game/cues'
import { NOTE, fm, heft, thump, tone, vol, type Synth } from '@/use/sfxKit'
import { SHELL_IMPACT_S, SHELL_LAUNCH_S } from '@/use/runeFx/bombard.timing'
import { air, grit, noise, rise, whistle } from './bombard.voices'

/**
 * ─── Mortar (`bombard`) — its voices ────────────────────────────────────────
 *
 * The family is ARTILLERY: a hollow tube, a falling round, a blast with fire
 * in it. Everything in D minor through `NOTE()`. The noise voices are the
 * click-free twins in `bombard.voices.ts` (see there for why).
 *
 * `shell` is asked for when the event STARTS and plays the whole launch on the
 * effect's own clock (`runeFx/bombard.timing.ts`: the tube fires 32 ms in, the
 * round lands at 230 ms):
 *
 *   crouch    a small iron CLINK — the round dropped down the tube
 *   launch    TRANSIENT the thump's click · BODY the "thoomp": a low sine drop,
 *             a hollow band of noise ringing in the tube, its D3→A2 resonance ·
 *             a puff of gas and the round rushing up out of it
 *   SWEETENER the incoming WHISTLE: from high over the board it falls D6 → Bb4,
 *             wobbling as the round tumbles and swelling all the way down, with
 *             a thin band of air riding it — cut off by the landing
 *
 * `shellHit` is placed where the round lands (`p` < 0.6: it sailed off the
 * board and is heard from beyond it — shorter, duller):
 *
 *   TRANSIENT a hard crack · BODY the boom (A1 sub with a punch, a lowpassed
 *   blast) · SWEETENER the fireball's roar opening as the cloud climbs ·
 *   TAIL shrapnel ticks, clods and grit raining back, a long low rumble in
 *   the room.
 *
 * Nothing here is struck metal (the sword), rolling (the boulder) or a
 * reversed swell into a sub drop (the warhead).
 */

const L = SHELL_LAUNCH_S
const HIT = SHELL_IMPACT_S

export const BOMBARD_SFX: Partial<Record<FxSound, Synth>> = {
  shell: (ctx, _p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    // ── The round dropped into the tube: a small iron clink. ──
    fm(ctx, { freq: NOTE(16) * j, ratio: 2.76, index: 2.4, indexTo: 0.3, duration: 0.07, gain: vol(0.04), space: 0.1 })
    // ── The thoomp. ──
    thump(ctx, { freq: NOTE(-7), duration: 0.3 + h * 0.08, gain: vol(0.16 + h * 0.04), punch: 2.4, delay: L, space: 0.08 })
    noise(ctx, { duration: 0.012, gain: vol(0.03), filterFrom: 6000, filterTo: 2000, type: 'highpass', q: 0.7, delay: L, space: 0 })
    noise(ctx, { duration: 0.17, gain: vol(0.13), filterFrom: 480, filterTo: 150, type: 'bandpass', q: 4.5, delay: L, space: 0.18 })
    tone(ctx, { freq: NOTE(0) * j, toFreq: NOTE(-3) * j, duration: 0.14, gain: vol(0.07), type: 'triangle', delay: L, space: 0.12 })
    // The gas out of the muzzle, and the round rushing up out of it.
    noise(ctx, { duration: 0.11, gain: vol(0.06), filterFrom: 2600, filterTo: 500, delay: L + 0.004, space: 0.12 })
    air(ctx, { duration: 0.11, from: 500, to: 1600, gain: vol(0.035), q: 2, rise: 0.3, delay: L + 0.02, space: 0.1 })
    // ── The incoming whistle, falling all the way to the landing. ──
    const wStart = L + 0.045
    const wLen = HIT - wStart
    whistle(ctx, { from: NOTE(21) * j, to: NOTE(12) * j, duration: wLen, gain: vol(0.07 + h * 0.015), delay: wStart, wobble: 0.014, space: 0.1 })
    rise(ctx, { duration: wLen, from: NOTE(21) * 2.1, to: NOTE(12) * 2.1, gain: vol(0.04), q: 9, delay: wStart, space: 0.08 })
  },

  shellHit: (ctx, p, r, o) => {
    const h = heft(o.level)
    const far = p < 0.6
    const g = far ? 0.45 : 1
    // ── TRANSIENT: the crack of the burst. ──
    noise(ctx, { duration: 0.022, gain: vol(0.3 * g), filterFrom: far ? 3000 : 8000, filterTo: 2200, type: 'highpass', q: 0.7, space: 0.05 })
    // ── BODY: the boom. ──
    thump(ctx, { freq: NOTE(-10), duration: 0.55 + h * 0.2, gain: vol((0.38 + h * 0.06) * g), punch: 3.2, space: 0.1 })
    noise(ctx, { duration: 0.012, gain: vol(0.08 * g), filterFrom: 6000, filterTo: 2000, type: 'highpass', q: 0.7, space: 0 })
    noise(ctx, { duration: 0.5, gain: vol(0.28 * g), filterFrom: far ? 900 : 2600, filterTo: 90, type: 'lowpass', q: 0.8, space: 0.28 })
    if (far) return
    // ── SWEETENER: the fireball's roar, opening as the cloud climbs. ──
    air(ctx, { duration: 0.6, from: 260, to: 760, gain: vol(0.1), q: 0.9, rise: 0.16, delay: 0.02, space: 0.35 })
    // ── TAIL: shrapnel ticks, clods raining back, the rumble in the room. ──
    grit(ctx, { duration: 0.34, density: 120, gain: vol(0.07), freq: 5200, q: 1.5, grainMs: 3, delay: 0.01, space: 0.1 })
    grit(ctx, { duration: 0.62, density: 42, gain: vol(0.11), freq: 2300, q: 1.2, grainMs: 10, delay: 0.06, space: 0.22 })
    noise(ctx, { duration: 1.1 + h * 0.3, gain: vol(0.12), filterFrom: 380, filterTo: 50, type: 'lowpass', loop: true, delay: 0.04, space: 0.5 })
    if (h > 0) thump(ctx, { freq: NOTE(-14), duration: 0.7, gain: vol(0.22 * h), punch: 2, space: 0.1 })
    // A last clod or two, a beat late.
    noise(ctx, { duration: 0.05, gain: vol(0.05), filterFrom: 1400, filterTo: 300, type: 'bandpass', q: 1.5, delay: 0.32 + r * 0.08, space: 0.2 })
  }
}
