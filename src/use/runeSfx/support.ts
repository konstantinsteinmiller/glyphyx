import type { FxSound } from '@/game/cues'
import { NOTE, fm, heft, noiseBurst, swell, thump, tone, vol, whoosh, type Synth } from '@/use/sfxKit'

/**
 * ─── Cross (`support`) — its voices ─────────────────────────────────────────
 *
 * The cross's family is WARM and RISING: struck bells climbing the relative
 * major (F A C lives inside D minor), air lifting, no noise transient at the
 * front of anything — a health bar going UP has to sound like the opposite of
 * a hit. Its bells are harmonic (FM at ratio 1, a warm Rhodes-like body) with
 * the bell's own 2.76× partial ringing briefly on top; the shield's voices,
 * by contrast, are inharmonic glass and a hollow hum.
 *
 *   `heal`  Transient: a breath of air rising (a swell, not a click). Body:
 *           three warm bells, A4 → C5 → F5, the last landing on the mend
 *           (0.1 s, when the green pulse sinks in). Tail: the room and an airy
 *           high shimmer lifting away. Sweetener: a soft F3 warmth under the
 *           mend, and for a Lv 2+ cross a D6 sparkle at the top. A heal of 0
 *           (`p` < 0.5, full HP) plays two bells, quieter, no warmth: the
 *           gesture without the mending.
 *   `buff`  Anticipation: a quick swoosh rising into the surge. Body: a bright
 *           ascending arpeggio D5 F5 A5 D6, 30 ms apart, brassy FM. The power
 *           WHOOMP as the surge lands (0.085 s): a soft low thump and a
 *           lowpass bloom. Sweetener: a pure high ping — the glint on the
 *           honed edge. Lv 2+ adds a sub under the whoomp.
 *
 * Every pitch through `NOTE()`; `r` jitters ±2 %. Node budget ≤ 48 (a Lv 2+
 * heal is 41, a Lv 2+ buff 38).
 */

/** A warm struck bell: a harmonic FM body and the bell's 2.76× partial dying fast over it. 8 nodes. */
const warmBell = (ctx: BaseAudioContext, freq: number, gain: number, duration: number, delay: number): void => {
  fm(ctx, { freq, ratio: 1, index: 1.1, indexTo: 0.06, duration, gain, attack: 0.004, delay, space: 0.45 })
  tone(ctx, { freq: freq * 2.76, duration: duration * 0.32, gain: gain * 0.28, attack: 0.002, delay, space: 0.5 })
}

export const SUPPORT_SFX: Partial<Record<FxSound, Synth>> = {
  heal: (ctx, p, r, o) => {
    const mends = p >= 0.5
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.04
    const g = mends ? 1 : 0.74
    // Transient: air lifting.
    swell(ctx, { duration: 0.12, from: 2800, to: 7200, gain: vol(0.014 * g), q: 0.9, space: 0.35 })
    // Body: the bells climbing — A4, C5, F5 on the mend.
    if (mends) {
      warmBell(ctx, NOTE(11) * j, vol(0.05), 0.5, 0)
      warmBell(ctx, NOTE(13) * j, vol(0.046), 0.5, 0.05)
      warmBell(ctx, NOTE(16) * j, vol(0.05), 0.62, 0.1)
      // Warmth under the mend.
      tone(ctx, { freq: NOTE(2) * j, duration: 0.5, gain: vol(0.024), attack: 0.07, delay: 0.07, space: 0.4 })
    } else {
      warmBell(ctx, NOTE(11) * j, vol(0.05 * g), 0.4, 0)
      warmBell(ctx, NOTE(14) * j, vol(0.05 * g), 0.45, 0.08)
    }
    // Tail: an airy shimmer lifting away.
    whoosh(ctx, { duration: 0.5, from: 5200, to: 10500, gain: vol(0.011 * g), q: 1.1, rise: 0.35, delay: 0.08, space: 0.55 })
    // A Lv 2+ cross: a sparkle at the very top.
    if (h > 0) fm(ctx, { freq: NOTE(21) * j, ratio: 1, index: 0.8, indexTo: 0.04, duration: 0.45, gain: vol(0.016 * (0.6 + h) * g), delay: 0.15, space: 0.55 })
  },

  buff: (ctx, _p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.04
    // Anticipation: the rush up into it.
    whoosh(ctx, { duration: 0.13, from: 500, to: 3800, gain: vol(0.03), q: 1.3, rise: 0.85, space: 0.2 })
    // Body: the bright arpeggio climbing the tonic triad.
    const A = [14, 16, 18, 21]
    for (let i = 0; i < A.length; i++) {
      fm(ctx, { freq: NOTE(A[i]!) * j, ratio: 1, index: 2.2, indexTo: 0.3, duration: 0.16 + i * 0.035, gain: vol(0.03 - i * 0.002), attack: 0.003, delay: i * 0.03, space: 0.32 })
    }
    // The power whoomp as the surge lands.
    thump(ctx, { freq: NOTE(-7), punch: 2.2, duration: 0.26, gain: vol(0.1), delay: 0.085, space: 0.1 })
    noiseBurst(ctx, { duration: 0.22, gain: vol(0.022), filterFrom: 280, filterTo: 2400, type: 'lowpass', q: 0.8, delay: 0.08, space: 0.2 })
    // The glint on the honed edge.
    tone(ctx, { freq: NOTE(21) * 2 * j, duration: 0.26, gain: vol(0.012), delay: 0.11, space: 0.5 })
    if (h > 0) tone(ctx, { freq: NOTE(-7), duration: 0.3, gain: vol(0.05 * h), attack: 0.01, delay: 0.085, space: 0.05 })
  }
}
