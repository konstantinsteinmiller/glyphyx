import { RESOLVE_TIMELINE } from '@/game/rules'

/**
 * ─── Bow (`archer`) — the beat, shared by the picture and the sound ─────────
 *
 * `runeFx/archer.ts` draws on these shares of the event's window and
 * `runeSfx/archer.ts` times the string and the zip from the same numbers.
 */

/** The ranged step's window, ms — every arrow's `dur`. */
export const ARROW_WINDOW_MS = RESOLVE_TIMELINE.ranged.dur
/** The release: the end of the draw. */
export const ARROW_RELEASE = 0.28
/** The arrow arrives (the renderer applies the damage then). */
export const ARROW_IMPACT = 0.55
/** Seconds from the cue (asked for at the event's start) to the release, and the flight's length. */
export const ARROW_RELEASE_S = (ARROW_RELEASE * ARROW_WINDOW_MS) / 1000
export const ARROW_FLIGHT_S = ((ARROW_IMPACT - ARROW_RELEASE) * ARROW_WINDOW_MS) / 1000
