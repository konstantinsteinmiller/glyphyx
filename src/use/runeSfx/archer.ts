import type { FxSound } from '@/game/cues'
import { NOTE, fm, heft, thump, tone, vol, type Synth } from '@/use/sfxKit'
import { ARROW_FLIGHT_S, ARROW_RELEASE_S } from '@/use/runeFx/archer.timing'
// The kit's noise voices, as their click-free twins (see `bombard.voices.ts`):
// same arguments, same sound, no one-sample spike at the note's start.
import { grit as crackle, noise as noiseBurst, rise as swell, string as pluck, air as whoosh } from './bombard.voices'

/**
 * ─── Bow (`archer`) — its voices ────────────────────────────────────────────
 *
 * The family is STRING AND WIND: gut and yew, never steel. Everything in
 * D minor through `NOTE()`.
 *
 * `arrow` is asked for when the event STARTS, and plays the whole draw-and-loose
 * on the effect's own clock (`runeFx/archer.ts`: the release lands 28 % into
 * the 320 ms window, ~90 ms in; the arrow arrives at 55 %, ~176 ms):
 *
 *   draw      a thin creak of the bow taking the pull (rising band + grain)
 *   release   TRANSIENT the string's slap · BODY a Karplus–Strong pluck on F3
 *             with its octave-and-a-third over it, the limb's low thrum ·
 *             SWEETENER the zip: a narrow band of air falling as the arrow
 *             leaves, and a faint in-key whistle (G5 → D5) riding it
 *   tail      the string ringing out into the room
 *
 * `arrowHit` is placed where the arrow lands. `p` says what it met:
 *
 *   ≥ 0.95    a killing blow    · 0.7…0.95  a stone it sticks in
 *   ~0.45     the bare floor    · < 0.4     a shield it glances off
 *
 *   TRANSIENT a hard click and a hollow, woody FM knock — the "thwock" ·
 *   BODY a short punchy thump and a band of struck noise · TAIL splinters (a
 *   fast, bright crackle) · SWEETENER the stuck shaft's quiver, a soft pluck.
 *
 * Nothing here rings like metal (the sword's family) or sits as low as the
 * axe, the boulder or the mortar.
 */

/** The release, seconds after `arrow` is asked for. */
const REL = ARROW_RELEASE_S
/** Release → arrival. */
const FLY = ARROW_FLIGHT_S

export const ARCHER_SFX: Partial<Record<FxSound, Synth>> = {
  arrow: (ctx, _p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    // ── The draw: the bow creaking as it bends. ──
    swell(ctx, { duration: REL, from: 650, to: 1800, gain: vol(0.045), q: 3.5, space: 0.05 })
    crackle(ctx, { duration: REL * 0.9, density: 60, gain: vol(0.05), freq: 1300, q: 5, grainMs: 6, decay: false, space: 0.02 })
    // ── The release. ──
    // The string's slap: a click the ear places before the note.
    noiseBurst(ctx, { duration: 0.014, gain: vol(0.14), filterFrom: 7000, filterTo: 2600, type: 'highpass', q: 0.7, delay: REL, space: 0.02 })
    // The string itself — a short thrum, not a note — and the bright partial a bowstring throws off.
    pluck(ctx, { freq: NOTE(2) * j, duration: 0.26 + h * 0.08, gain: vol(0.11 + h * 0.04), bright: 0.65, delay: REL, space: 0.16 })
    pluck(ctx, { freq: NOTE(11) * j, duration: 0.12, gain: vol(0.045), bright: 0.9, delay: REL + 0.002, space: 0.2 })
    if (h > 0) pluck(ctx, { freq: NOTE(-3) * j, duration: 0.34, gain: vol(0.09 * h), bright: 0.5, delay: REL, space: 0.15 })
    // The limb's thrum under it.
    thump(ctx, { freq: NOTE(-3), duration: 0.1, gain: vol(0.1), punch: 2, delay: REL, space: 0.03 })
    // ── The zip: air torn along the line, falling as it leaves you. ──
    whoosh(ctx, { duration: FLY + 0.08, from: 6500, to: 2300, gain: vol(0.15), q: 4.5, rise: 0.2, delay: REL + 0.004, space: 0.14 })
    tone(ctx, { freq: NOTE(17) * j, toFreq: NOTE(14) * j, duration: FLY + 0.05, gain: vol(0.035), attack: 0.02, delay: REL + 0.008, space: 0.25 })
  },

  arrowHit: (ctx, p, r, o) => {
    const h = heft(o.level)
    const j = 1 + (r - 0.5) * 0.05
    if (p < 0.4) {
      // Glanced off a shield: a light tick and the shaft snapping. The shield's
      // own clang is the moment; this only says it was an ARROW that broke.
      noiseBurst(ctx, { duration: 0.02, gain: vol(0.3), filterFrom: 5200, filterTo: 2400, type: 'bandpass', q: 2, space: 0.05 })
      crackle(ctx, { duration: 0.1, density: 130, gain: vol(0.18), freq: 3600, q: 1.8, grainMs: 4, space: 0.08 })
      pluck(ctx, { freq: NOTE(11) * j, duration: 0.14, gain: vol(0.12), bright: 0.9, delay: 0.004 })
      return
    }
    const floor = p < 0.6
    const g = floor ? 0.55 : 1
    // ── TRANSIENT: the thwock — a hard click and a hollow, woody knock. ──
    noiseBurst(ctx, { duration: 0.012, gain: vol(0.26 * g), filterFrom: 6500, filterTo: 1800, type: 'highpass', q: 0.7, space: 0 })
    fm(ctx, { freq: NOTE(floor ? 2 : 8) * j, ratio: 1.48, index: floor ? 1.6 : 3.2, indexTo: 0.2, duration: 0.09, gain: vol(0.38 * g), space: 0.08 })
    // ── BODY: the blow going in. ──
    thump(ctx, { freq: NOTE(-5), duration: 0.14 + h * 0.05, gain: vol((0.3 + h * 0.1) * g), punch: 4, space: 0.04 })
    noiseBurst(ctx, {
      duration: floor ? 0.12 : 0.07, gain: vol(0.18 * g), filterFrom: floor ? 1200 : 2400, filterTo: floor ? 200 : 450,
      type: floor ? 'lowpass' : 'bandpass', q: 1.1, space: 0.08
    })
    // ── TAIL: splinters. ──
    crackle(ctx, { duration: 0.2, density: 110, gain: vol(0.14 * g), freq: 4200, q: 1.6, grainMs: 4, delay: 0.008, space: 0.12 })
    // ── SWEETENER: the stuck shaft's quiver. ──
    pluck(ctx, { freq: NOTE(9) * j, duration: 0.3, gain: vol(0.08), bright: 0.45, delay: 0.022, space: 0.22 })
    if (p >= 0.95) {
      // A killing blow: the stone gives under it.
      thump(ctx, { freq: NOTE(-10), duration: 0.22, gain: vol(0.2), punch: 3, delay: 0.012, space: 0.06 })
      crackle(ctx, { duration: 0.28, density: 55, gain: vol(0.09), freq: 1700, q: 1.2, grainMs: 9, delay: 0.02, space: 0.15 })
    }
  }
}
