import type { FxSound } from '@/game/cues'
import { NOTE, crackle, fm, heft, noiseBurst, swell, thump, tone, vol, whoosh, type Synth } from '@/use/sfxKit'

/**
 * ─── Axe (`cleave`) — its voices ────────────────────────────────────────────
 *
 * WEIGHT and FIRE. The sword (`runeSfx/melee.ts`) is steel in the top of the
 * key; the axe lives an octave and more below it, and nothing it says rings
 * like metal — it thuds, crunches and burns.
 *
 *   cleave     the swing (fired as the wind-up STARTS; the slam lands
 *              ~130 ms later). A low groan as it is hauled back, then a big
 *              low whoosh that opens up and TRAVELS across the stereo field
 *              with the arc, fire crackling along the edge.
 *   cleaveHit  the slam on three tiles at once. Transient: a dull, dark
 *              crack. Body: a deep A1 kick-drum thud and a hollow FM "chunk"
 *              where the head bites in. Crunch: two gravel crackles, one each
 *              side, so the blow is as WIDE as the fan. Tail: debris
 *              rumbling down. Sweetener: embers sizzling on into the room.
 *
 * Every pitch through `NOTE()` (D minor); `r` jitters pitch; `heft` adds a
 * sub and a longer rumble from Lv 2.
 *
 * `N()` nudges every NOISE layer's start half a sample off the grid: Chrome's
 * buffer source glitches (one sample, up to −0.5 dBFS) when a start lands a
 * hair past a whole frame — see `runeSfx/melee.ts`.
 */

const N = (delay = 0): number => delay + 0.5 / 48000
const jitter = (r: number): number => 1 + (r - 0.5) * 0.05
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

export const CLEAVE_SFX: Partial<Record<FxSound, Synth>> = {
  cleave: (ctx, p, r, o) => {
    const j = jitter(r)
    const g = 0.7 + 0.3 * clamp01(p)
    const h = heft(o.level)
    // The haul back: a low groan rising under the wind-up.
    tone(ctx, { freq: NOTE(-7) * j, toFreq: NOTE(-3) * j, duration: 0.16, gain: vol(0.1 * g), type: 'triangle', filter: 380, attack: 0.09, space: 0.05 })
    swell(ctx, { duration: 0.1, from: 160, to: 420, gain: vol(0.06 * g), q: 1.1, delay: N(), space: 0.06 })
    // The swing: a big, low, wide whoosh cresting at the slam, travelling
    // from one side of the fan to the other.
    const dir = (r < 0.5 ? -1 : 1) * 0.6
    whoosh(ctx, { duration: 0.2, from: 210 * j, to: 950 * j, gain: vol((0.24 + 0.07 * h) * g), q: 0.75, rise: 0.66, delay: N(0.02), pan: -dir, panTo: dir, space: 0.08 })
    // Fire along the edge: a sparse crackle riding the swing.
    crackle(ctx, { duration: 0.18, density: 75, gain: vol(0.08 * g), freq: 2100, q: 1.2, grainMs: 6, delay: N(0.05), decay: false, space: 0.1 })
  },

  cleaveHit: (ctx, p, r, o) => {
    const j = jitter(r)
    const g = 0.55 + 0.45 * clamp01(p)
    const h = heft(o.level)
    // Transient: a dull, dark crack — no sparkle on top.
    noiseBurst(ctx, { duration: 0.08, gain: vol(0.26 * g), filterFrom: 3200, filterTo: 260, q: 0.8, delay: N(), space: 0.04 })
    // Body: the thud — a deep kick on the key's A.
    thump(ctx, { freq: NOTE(-10) * j, duration: 0.36, gain: vol(0.3 * g), punch: 4, click: vol(0.07 * g), delay: N(), space: 0.06 })
    // The chunk where the head bites: hollow, inharmonic, low — NOT a ring.
    fm(ctx, { freq: NOTE(-3) * j, ratio: 1.41, index: 3.5, indexTo: 0.4, duration: 0.2, gain: vol(0.09 * g), space: 0.1 })
    // The crunch, one side each so the blow is as wide as the fan.
    crackle(ctx, { duration: 0.16, density: 300, gain: vol(0.26 * g), freq: 850, q: 1.1, grainMs: 6, delay: N(), pan: -0.5, space: 0.08 })
    crackle(ctx, { duration: 0.15, density: 280, gain: vol(0.22 * g), freq: 1350, q: 1.3, grainMs: 5, delay: N(0.018), pan: 0.5, space: 0.08 })
    // Tail: debris rumbling down.
    noiseBurst(ctx, { duration: 0.34 + 0.2 * h, gain: vol((0.09 + 0.06 * h) * g), filterFrom: 700, filterTo: 90, q: 0.7, delay: N(0.03), space: 0.2 })
    // Sweetener: embers sizzling on, into the room.
    crackle(ctx, { duration: 0.7, density: 42, gain: vol(0.09 * g), freq: 3800, q: 2.4, grainMs: 4, delay: N(0.06), space: 0.3 })
    // Lv 2+: a sub under everything.
    if (h > 0) thump(ctx, { freq: NOTE(-14), duration: 0.42, gain: vol(0.22 * h * g), punch: 2.2, delay: 0.004, space: 0.04 })
  }
}
