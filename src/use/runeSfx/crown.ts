import type { FxSound } from '@/game/cues'
import { NOTE, fm, heft, swell, thump, tone, vol, type Synth } from '@/use/sfxKit'

/**
 * ─── Crown (`crown`) — its voice ────────────────────────────────────────────
 *
 * REGAL. Every other combat voice is an impact — something struck something.
 * This one is a proclamation, and it has to read as a GAIN even though a rune
 * leaves the board, so it is built from the instruments of a coronation, not
 * of a fight:
 *
 *   the herald   one brass pickup (two-operator FM at 1 : 1, the ratio that
 *                makes a sawtooth-bright BRASS spectrum) while the chains lash
 *                out, and a bright air swell rising into…
 *   the chord    …a brass triad that lands on the seal (`BIND` in
 *                `runeFx/crown.ts`, ≈ 110 ms in), its FM index swelling as it
 *                sustains — brass getting brighter as it is blown harder.
 *                The player's crown sounds the key's relative MAJOR (F A C,
 *                every note in D minor): a triumph. The enemy's sounds the
 *                tonic minor (D F A): the same pageant, for the other throne.
 *   the gong     under the chord, an inharmonic FM strike (ratio 1.41) on D2
 *                with a soft mallet thump: the weight of the moment.
 *   the chimes   three high struck sines above it, a rising D-minor sparkle
 *                over the flying gold stars.
 *
 * Gains are softer than blows: ≈ −21 dB short-term, under a sword's hit.
 * `r` jitters the pitch ±1 %; `heft(level)` deepens the gong and adds a sub.
 */

/** When the chord lands: the seal — `BIND` (0.42) × the crown event's 260 ms. */
const SEAL = 0.11

export const CROWN_SFX: Partial<Record<FxSound, Synth>> = {
  crown: (ctx, _p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.02
    const enemy = o.side === 'enemy'
    // The chord on the seal, and the herald's pickup a fourth/fifth under its top.
    const chord = enemy ? [7, 9, 11] : [9, 11, 13] // D4 F4 A4 | F4 A4 C5
    const pickup = enemy ? NOTE(4) : NOTE(6) //         A3     | C4
    // Air rushing up into the seal.
    swell(ctx, { duration: SEAL, from: 2200, to: 7500, gain: vol(0.028), q: 1.1, space: 0.3 })
    // The herald: one brassy stab while the chains fly.
    fm(ctx, { freq: pickup * j, ratio: 1, index: 1.1, indexTo: 1.9, duration: 0.085, gain: vol(0.05), attack: 0.012, delay: 0.012, space: 0.3 })
    // The chord: three brass voices, bright and swelling, long enough to ring into the room.
    for (let i = 0; i < chord.length; i++) {
      fm(ctx, {
        freq: NOTE(chord[i]!) * j, ratio: 1, index: 1.3, indexTo: 2.8, duration: 0.62 - i * 0.04,
        gain: vol(0.036 - i * 0.003), attack: 0.03, delay: SEAL + i * 0.006, space: 0.42
      })
    }
    // The gong under it: struck, inharmonic, long; and the mallet.
    fm(ctx, { freq: NOTE(-7) * j, ratio: 1.41, index: 2.4, indexTo: 0.15, duration: 1.25, gain: vol(0.048 + 0.02 * h), attack: 0.004, delay: SEAL, space: 0.55 })
    thump(ctx, { freq: NOTE(-7) * j, duration: 0.22, gain: vol(0.05 + 0.03 * h), punch: 1.8, delay: SEAL, space: 0.1 })
    // The chimes: a rising sparkle over the stars.
    const top = enemy ? [16, 18, 21] : [18, 20, 21] // F5 A5 D6 | A5 C6 D6
    for (let i = 0; i < top.length; i++) {
      tone(ctx, { freq: NOTE(top[i]!) * j, duration: 0.5 - i * 0.06, gain: vol(0.024 - i * 0.003), delay: SEAL + 0.05 + i * 0.07, attack: 0.003, space: 0.65 })
    }
    if (h > 0) tone(ctx, { freq: NOTE(-14), duration: 0.7, gain: vol(0.06 * h), attack: 0.02, delay: SEAL, space: 0.1 })
  }
}
