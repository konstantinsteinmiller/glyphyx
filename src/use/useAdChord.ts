// ─── The QA interstitial chord ──────────────────────────────────────────────
//
// 30 consecutive taps on the CoinBadge force an interstitial, bypassing the
// pacing clock and the placement rules in `useAdGate`.
//
// Why it has to exist: a portal reviewer has to SEE an interstitial to sign a
// build off, and every rule that makes our placement honest also makes one
// hard to reach on demand. The first `canShowInterstitial` of a session only
// STARTS the 121 s clock rather than passing it; `mayBreakAt` refuses the whole
// six-lesson tutorial and refuses to land in front of a defeat. A reviewer
// would have to play past the lessons and then win at the right moment — and
// if they do not, the finding comes back as "we never saw an ad".
//
// This is the deterministic route for that. It is not a gameplay placement and
// never fires on its own: nothing taps a badge thirty times in a row by
// accident.
//
// NO ON-SCREEN COUNTER, deliberately. It is a hidden developer route, and a
// visible "12 / 30" creeping up the HUD is a bug report from anybody who
// brushed the badge. The one `console.info` on the fire is the whole readout —
// enough to tell "the chord did not register" apart from "the chord fired and
// the SDK had no ad".
import { showMidgameAd } from '@/use/useAds'
import { adInFlight, markInterstitialFailed, markInterstitialShown } from '@/use/useAdGate'

/** Consecutive taps that force the ad. */
export const AD_CHORD_TAPS = 30

/**
 * Longest pause allowed BETWEEN taps before the streak is forgotten.
 *
 * "Consecutive" is a streak, not a rolling window: pausing resets to zero.
 * That is what keeps the chord unreachable by accident — a badge tapped a few
 * times per session across ten minutes never accumulates, where a 60 s window
 * eventually would.
 */
const AD_CHORD_GAP_MS = 2000

const TAG = '[ads]'

let streak = 0
let lastTapAt = 0
// One physical tap on a touch device sends `pointerdown` AND a synthesised
// `click`. Rather than time-coalescing them (which miscounts a slow press,
// where the click lands well after the pointerdown), the badge binds both and
// the click path stands down permanently as soon as any pointer event proves
// pointer events are being delivered. Exactly one count per physical tap, on
// every browser, with no timing assumption.
let sawPointer = false

/** Which listener a tap arrived on. */
export type AdChordSource = 'pointer' | 'click'

/** Test seam: forget the streak. */
export const __resetAdChord = (): void => {
  streak = 0
  lastTapAt = 0
  sawPointer = false
}

/**
 * Show an interstitial now, outside the pacing rules.
 *
 * It still takes `adInFlight`, so the chord cannot stack a second ad on top of
 * a rewarded video or a paced break already on its way, and it still charges
 * the pacing clock on success — a forced ad is a real impression as far as the
 * portal's one-every-two-minutes limit is concerned, and the natural placements
 * must not immediately follow it with another.
 */
const forceInterstitial = async (): Promise<void> => {
  if (adInFlight.value) return
  adInFlight.value = true
  markInterstitialShown()
  console.info(`${TAG} ▶ chord interstitial — ${AD_CHORD_TAPS} taps, pacing bypassed`)
  try {
    const outcome = await showMidgameAd()
    if (outcome !== 'shown') markInterstitialFailed()
    console.info(`${TAG} ⏹ chord interstitial — ${outcome}`)
  } catch (e) {
    // `showMidgameAd` contains its own errors; this is for a provider surface
    // that forgot to. The clock must not stay charged for an ad that threw.
    markInterstitialFailed()
    console.warn(`${TAG} ✖ chord interstitial failed`, e)
  } finally {
    adInFlight.value = false
  }
}

/**
 * Register one tap on the chord trigger (the CoinBadge).
 *
 * Returns true only on the tap that reached the threshold and started the ad —
 * the caller needs nothing from it, but it is what the tests assert on.
 */
export const registerAdChordTap = (source: AdChordSource, now: number = Date.now()): boolean => {
  if (source === 'pointer') sawPointer = true
  else if (sawPointer) return false

  streak = now - lastTapAt > AD_CHORD_GAP_MS ? 1 : streak + 1
  lastTapAt = now

  if (streak < AD_CHORD_TAPS) return false
  streak = 0
  void forceInterstitial()
  return true
}
