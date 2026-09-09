// Background SFX preload — fires AFTER first paint so it never competes
// with the critical path.
//
// Without this, every sample pays its first-play decode cost the moment the
// game fires it: the chest's first pop stutters, the coin tally's first coin
// arrives a beat late. The decode is cheap individually (1-5 ms per .ogg) but
// it happens in a flurry during the first result screen of a session —
// exactly when the player is forming a first impression. Decoding everything
// once, on an idle callback, pushes that work off the rendering thread before
// it gets noticed.
//
// `loadAudioBuffer` is idempotent — repeat calls hit the cache or join
// the pending decode promise, so it's safe to call this preload more
// than once (e.g. on every GameScene mount). The visibility-hidden /
// ad-show suspend system in `useAssets.ts` doesn't affect decode — it
// only gates playback — so this works correctly even if the tab is
// backgrounded during preload.

import { prependBaseUrl } from '@/utils/function'
import { loadAudioBuffer } from '@/use/useAssets'

// Every sample the game can fire — the `SAMPLE_CUES` and `LAYER_SAMPLES` tables
// in `useGameAudio.ts`, plus the two the UI plays directly (`modal-open` from
// FModal, `happy` from the coin explosion). Kept as a flat list so a single
// allSettled covers them all. Order doesn't matter — they decode in parallel
// and fight for the AudioContext's decoder pool. Adding a new sample = add the
// basename here (no `.ogg`, no path prefix).
const GAMEPLAY_SFX: ReadonlyArray<string> = [
  'stone-cut',
  'shrapnel',
  'celebration-1',
  'lose',
  'happy',
  'win',
  'level-up',
  'coin-pickup',
  'reward-continue',
  'modal-open',
  'obstacle-hit'
]

let preloadStarted = false
let preloadDone: Promise<void> | null = null

/** Kick off background decode of every gameplay SFX. Idempotent; calling
 *  twice returns the SAME promise (resolves once every decode has settled), so
 *  callers can sequence work AFTER the sounds finish. Off the critical path —
 *  the asset preloader runs it only after the hot-path art + first paint are
 *  done. */
export const preloadGameplaySounds = (): Promise<void> => {
  if (preloadDone) return preloadDone
  preloadStarted = true
  preloadDone = Promise.allSettled(
    GAMEPLAY_SFX.map((name) => loadAudioBuffer(prependBaseUrl(`audio/sfx/${name}.ogg`)))
  ).then(() => undefined)
  return preloadDone
}

/** Schedule `preloadGameplaySounds()` on the first available idle slot.
 *  Falls back to `setTimeout(0)` on browsers that don't expose
 *  `requestIdleCallback` (mostly Safari). Either path runs after the
 *  current animation frame so the first paint isn't delayed. */
export const schedulePreloadOnIdle = (): void => {
  if (preloadStarted) return
  if (typeof window === 'undefined') return
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined
  if (typeof ric === 'function') {
    ric(() => preloadGameplaySounds(), { timeout: 2000 })
  } else {
    setTimeout(() => preloadGameplaySounds(), 0)
  }
}
