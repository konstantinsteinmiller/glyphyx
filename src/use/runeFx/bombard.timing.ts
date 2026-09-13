import { RESOLVE_TIMELINE } from '@/game/rules'

/**
 * ─── Mortar (`bombard`) — the beat, shared by the picture and the sound ─────
 *
 * `runeFx/bombard.ts` draws on these shares of the event's window and
 * `runeSfx/bombard.ts` times its voices from the same numbers, so the thoomp
 * lands on the muzzle flash and the incoming whistle runs out on the blast.
 */

/** The ranged step's window, ms — every shell's `dur`. */
export const SHELL_WINDOW_MS = RESOLVE_TIMELINE.ranged.dur
/** The tube fires (after a crouch). */
export const SHELL_LAUNCH = 0.1
/**
 * The round lands. Kept before 0.75: a stone the shell kills starts its
 * `shatter` 80 ms before the ranged step ends (`resolve.ts`), which is 0.75 of
 * the first ranged event's window — the blast has to be there first.
 */
export const SHELL_IMPACT = 0.72
/** Seconds from the cue (asked for at the event's start) to the launch and to the landing. */
export const SHELL_LAUNCH_S = (SHELL_LAUNCH * SHELL_WINDOW_MS) / 1000
export const SHELL_IMPACT_S = (SHELL_IMPACT * SHELL_WINDOW_MS) / 1000
