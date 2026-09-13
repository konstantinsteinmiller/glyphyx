import { ref, computed } from 'vue'
import { isLessonNode } from '@/game/campaign'
import { isCrazyWeb } from '@/use/useUser'
import { isCrazyGamesFullRelease } from '@/use/useMatch'
import { adProviderName, isInterstitialReady, isRewardedReady, showMidgameAd, showRewardedAd } from '@/use/useAds'

/**
 * ─── Reward gating ──────────────────────────────────────────────────────────
 *
 * A perk is paid for with a rewarded video on every build that HAS one, and is
 * simply free on every build that does not.
 *
 * It used to read `isCrazyWeb && isCrazyGamesFullRelease`, which was written
 * when CrazyGames was the only portal wired for rewarded ads. It is now wrong
 * in the expensive direction: Playgama, GamePix, GameMonetize, Yandex and
 * GameDistribution all resolve real providers, so that predicate was handing
 * out every rewarded perk for free on five shipping portals — the ad never
 * played, the placement never earned, and a reviewer clicking a button marked
 * with a video icon saw no video.
 *
 * The rule is now the honest one: is a real provider resolved?
 *
 *   • any real provider  → gated, the video plays.
 *   • CG PRE-release     → NOT gated, and nothing is OFFERED either. See
 *                          `isCrazyPreRelease` below.
 *   • noop (local dev,
 *     plain web, itch…)  → not gated, perks are free.
 *
 * ─── Every rewarded surface goes through ONE core ───────────────────────────
 *
 * The ×3 on the result screen (`claimReward`), a skin bought with a video and a
 * power rune from the shop (`watchRewarded`) are the same transaction with a
 * different label, so they share `runRewarded` and therefore the same gates,
 * in this order:
 *
 *   1. the CG pre-release build offers nothing (no inventory, no free grant);
 *   2. an ungated build (no provider) grants for free — a perk must not become
 *      unreachable where there is no video to play;
 *   3. nothing while another ad is in flight (`adInFlight`);
 *   4. the rewarded RATE LIMIT below (requests, not grants);
 *   5. readiness: the provider has a rewarded loaded AND the watch throttle in
 *      `useAds.isRewardedReady` is open — a button that then fails reads as the
 *      game being broken, so `canOfferReward` hides the surface first and the
 *      core refuses second.
 *
 * A granted video also restarts the interstitial clock: a player who has just
 * sat through a rewarded owes no midgame for another two minutes, whatever the
 * portals' per-format limits say.
 */
export const isRewardGated =
  adProviderName !== 'noop' && (!isCrazyWeb || isCrazyGamesFullRelease)

/**
 * The CrazyGames PRE-release build — `VITE_APP_CRAZY_WEB=true` with
 * `VITE_APP_CRAZY_GAMES_FULL_RELEASE=false`. This is the build CG's reviewers
 * play before approval, and it has NO ad inventory: `requestAd` resolves without
 * ever showing a video.
 *
 * That leaves a rewarded surface with two possible behaviours, and both are QA
 * findings. Gated, the player taps a button marked with a film-frame icon and no
 * video plays. Ungated — which is what `isRewardGated` above resolves to here —
 * the ×3 pays out for free, so the reviewer sees the game hand over its entire
 * run income for a button press.
 *
 * So on this build the offer is not made at all: `canOfferReward` is false, the
 * result screen never renders the button, `rewardWasOffered` stays false (so
 * leaving the screen is not recorded as a decline — the player declined
 * nothing), and `claimReward` refuses outright. Build-time constants, so Rollup
 * folds the whole branch away on every other build.
 */
const isCrazyPreRelease = isCrazyWeb && !isCrazyGamesFullRelease

// ─── Rewarded rate limit ────────────────────────────────────────────────────
//
// A hard ceiling on how many rewarded videos may be REQUESTED in a rolling
// window, independent of what the provider's own readiness API says.
//
// Two reasons this has to live on our side. Portals treat a game that hammers
// the rewarded placement as abusive inventory use and reject it; and a player
// who can watch ads back to back will, then resent the game for letting them.
// The limit counts REQUESTS, not grants: a dismissed or unfilled ad still cost
// the network a call, and not counting it would let a player farm no-fills.

/** Rolling window length, ms. */
const REWARD_WINDOW_MS = 5 * 60 * 1000
/** Requests allowed inside one window. */
const REWARD_WINDOW_MAX = 6

/** Timestamps of rewarded requests inside the current window, oldest first. */
let rewardRequests: number[] = []
/** Bumped on every change so the `canOfferReward` computed re-evaluates. */
const rewardTick = ref(0)

const pruneRewardWindow = (now: number): void => {
  const cutoff = now - REWARD_WINDOW_MS
  if (rewardRequests.length > 0 && rewardRequests[0]! <= cutoff) {
    rewardRequests = rewardRequests.filter((t) => t > cutoff)
    rewardTick.value++
  }
}

/** True while the player has spent their rewarded allowance for this window. */
export const isRewardRateLimited = (): boolean => {
  void rewardTick.value
  pruneRewardWindow(Date.now())
  return rewardRequests.length >= REWARD_WINDOW_MAX
}

/** Seconds until the next rewarded slot frees up. 0 when one is available. */
export const rewardCooldownLeft = (): number => {
  const now = Date.now()
  pruneRewardWindow(now)
  if (rewardRequests.length < REWARD_WINDOW_MAX) return 0
  const oldest = rewardRequests[0]!
  return Math.max(0, Math.ceil((oldest + REWARD_WINDOW_MS - now) / 1000))
}

const recordRewardRequest = (): void => {
  rewardRequests.push(Date.now())
  rewardTick.value++
}

/** Test seam: forget every recorded request. */
export const __resetRewardWindow = (): void => {
  rewardRequests = []
  rewardTick.value++
}

/**
 * True while a full-screen ad started by this module is on its way — a gated
 * reward waiting on its video, or a paced interstitial. Every button that could
 * start another ad, or leave the screen the ad is about to cover, disables on
 * it, which is why it is exposed rather than each call site inventing its own
 * busy flag.
 */
export const adInFlight = ref(false)

// ─── The rewarded core ──────────────────────────────────────────────────────

/** What a rewarded video is paying for — for telemetry and the outcome hook. */
/**
 * What the player is buying with a video. Purely a label — every reason runs
 * the identical transaction — but it is what the outcome listeners and the
 * portals' own placement reporting see, so each surface names itself.
 */
export type RewardedReason =
  | 'multiplier' | 'skin' | 'powerRune'
  /** One permanent rune rank, from the shop's Ranks tab. */
  | 'runeRank'
  /** The nuker, unlocked early instead of waiting for Stage 4-1. */
  | 'nukerUnlock'

type RewardedOutcomeListener = (reason: RewardedReason, granted: boolean) => void
const rewardedListeners = new Set<RewardedOutcomeListener>()

/**
 * Hear about every rewarded request that reached the provider, granted or not.
 * Returns the unsubscribe. Optional telemetry — nothing in the game depends on
 * it, and a listener that throws is contained.
 */
export const onRewardedOutcome = (cb: RewardedOutcomeListener): (() => void) => {
  rewardedListeners.add(cb)
  return () => { rewardedListeners.delete(cb) }
}

const notifyRewarded = (reason: RewardedReason, granted: boolean): void => {
  for (const cb of rewardedListeners) {
    try { cb(reason, granted) } catch (e) { console.warn('[ads] rewarded listener threw', e) }
  }
}

/**
 * The one transaction behind every rewarded surface (see the header).
 *
 * `grant` runs only on a real grant (or for free on an ungated build). With
 * `rethrow`, a provider rejection propagates so the caller's catch keeps
 * logging it (`claimReward`'s long-standing contract); without it the rejection
 * is contained and reads as "not granted" (`watchRewarded` never throws).
 */
const runRewarded = async (
  reason: RewardedReason, grant: (() => void) | null, rethrow: boolean
): Promise<boolean> => {
  // Belt and braces: the button is not rendered on a CG pre-release build, but a
  // free perk must not be reachable by any other route either.
  if (isCrazyPreRelease) return false
  if (!isRewardGated) {
    grant?.()
    return true
  }
  if (adInFlight.value) return false
  if (isRewardRateLimited()) return false
  if (!isRewardedReady.value) return false
  adInFlight.value = true
  recordRewardRequest()
  try {
    const ok = await showRewardedAd()
    if (ok) {
      // A video was just watched: no interstitial for another full gap.
      markInterstitialShown()
      grant?.()
    }
    notifyRewarded(reason, ok)
    return ok
  } catch (e) {
    notifyRewarded(reason, false)
    if (rethrow) throw e
    console.warn('[ads] rewarded request failed', e)
    return false
  } finally {
    adInFlight.value = false
  }
}

/**
 * Run `grant` behind a rewarded video where the build calls for it.
 *
 * Returns whether the perk was granted. On a gated build a no-fill, a dismissed
 * ad or a blocked ad all resolve to `false` and grant nothing — the caller is
 * responsible for leaving its UI in a sane state, which is why `adInFlight` is
 * exposed rather than each call site inventing its own busy flag.
 *
 * The rate limit is enforced here as well as in `canOfferReward`, because a
 * button is not the only way into this function and a limit that only hides UI
 * is not a limit.
 */
export const claimReward = (grant: () => void): Promise<boolean> =>
  runRewarded('multiplier', grant, true)

/**
 * Watch a rewarded video for something that is not the ×3 — a skin, a power
 * rune. Resolves `true` only when the provider granted (or the build is
 * ungated, where the thing is free). Never throws: every refusal and every
 * failure is `false`, so a shop can `await` it and simply not deliver.
 */
export const watchRewarded = (reason: Exclude<RewardedReason, 'multiplier'> | 'multiplier'): Promise<boolean> =>
  runRewarded(reason, null, false)

/**
 * Can a rewarded perk be offered right now?
 *
 * On a CG pre-release build: never — there is no inventory to offer against.
 * On an ungated build: always. On a gated build: only when the provider
 * actually has a rewarded ad ready AND the player has rewarded allowance left
 * in the current window. Offering a button that then fails reads as the game
 * being broken, which is exactly as true for a rate-limited refusal as for a
 * no-fill. The same flag serves the ×3, the skin shop and the power runes.
 */
export const canOfferReward = computed(
  () => !isCrazyPreRelease && (!isRewardGated || (isRewardedReady.value && !isRewardRateLimited()))
)

/**
 * Can a VIDEO be offered as the other way to pay for something that also has
 * a coin price — a rune rank, a power rune, a skin?
 *
 * Only where one can really play: a real ad provider resolved (`isRewardGated`)
 * AND `canOfferReward`. On a build with no callable provider — local dev, the
 * CrazyGames pre-release build, itch, plain web — `canOfferReward` would still
 * say yes and grant the perk for nothing, and the button it offered could not
 * wear the film mark (`RewardAdIcon` draws it only where a video plays), so it
 * came out as an empty blue half beside the price. There the coin price is the
 * whole control instead.
 *
 * The perks with NO coin price (the result screen's ×3, the nuker's early
 * unlock) keep `canOfferReward`: on an ad-free build they are simply granted,
 * because otherwise they would be unreachable there.
 */
export const canOfferVideo = computed(() => isRewardGated && canOfferReward.value)

// ─── Interstitial pacing ────────────────────────────────────────────────────

/**
 * Minimum gap between interstitials, ms.
 *
 * 121 s, not 120. CrazyGames and Playgama both rate-limit interstitials to one
 * every two minutes and REJECT the request that arrives early — so a gate set
 * to exactly the platform's own limit loses the race to clock skew, timer
 * coalescing in a background tab, or the few milliseconds between our check and
 * the SDK's. The extra second costs nothing and turns a rejected request into a
 * filled one.
 *
 * ─── Why one number and not a per-platform table ────────────────────────────
 *
 * The pacing is time-based on EVERY build — not keyed to stages or waves — so
 * the only thing that could vary per portal is the length of the gap. Walking
 * the shipped targets, 121 s is the maximum of every documented minimum, so a
 * table would today hold nine identical entries:
 *
 *   • CrazyGames  — one midgame ad per 2 min; an early request is rejected.
 *   • Playgama    — Bridge's own `minimumDelayBetweenInterstitial` is 120 s.
 *   • Yandex      — ≥ 60 s apart, and none in the first 60 s after load. 121 s
 *                   satisfies both, and the "first call starts the clock"
 *                   behaviour below covers the post-load half.
 *   • Poki        — paced server-side; the SDK's own bad-event gate is the only
 *                   client-side limit and it is about event SPACING, not ads.
 *   • GamePix / GameDistribution / GameMonetize — frequency-capped inside the
 *                   SDK, with published guidance of one interstitial every
 *                   2-3 min. 121 s is the floor, their cap is the ceiling.
 *
 * If a portal ever publishes a LONGER minimum, raise it here for that build
 * rather than reintroducing a stage counter — a stage-keyed cadence drifts with
 * how fast the player is, which is exactly what the portals' rules are not.
 *
 * ─── Only a SHOWN ad spends the gap ─────────────────────────────────────────
 *
 * A request that came back empty — no-fill, an SDK that never answered, a
 * thrown provider — must not cost the player-facing pacing: otherwise one
 * unlucky waterfall at a natural break silences monetisation for two more
 * minutes. But it must not be hammered either: every request is a network call
 * and Yandex spaces CALLS at 60 s. So a failed request may be retried after
 * `INTERSTITIAL_RETRY_MS`, while the last ad that actually ran still owes its
 * full `INTERSTITIAL_PACE_MS`. `showPacedInterstitial` applies both rules;
 * the scene's own call sites do it with `markInterstitialShown` /
 * `markInterstitialFailed`.
 */
export const INTERSTITIAL_PACE_MS = 121_000
/** A request that showed nothing may be tried again after this. */
export const INTERSTITIAL_RETRY_MS = 61_000

/** When an interstitial last ran (or the session's clock was seeded). 0 = never asked. */
let lastShownAt = 0
/** When an interstitial was last REQUESTED, shown or not. */
let lastAttemptAt = 0
/** `lastShownAt` before the attempt in flight — restored when it fails. */
let shownBeforeAttempt = 0

/**
 * True when enough time has passed to show another interstitial.
 *
 * The first call of a session returns false and starts the clock: an
 * interstitial in the opening seconds — before the player has seen the game
 * work — is the single most reliable way to lose them.
 */
export const canShowInterstitial = (now: number = Date.now()): boolean => {
  if (lastShownAt === 0) {
    lastShownAt = now
    return false
  }
  return now - lastShownAt >= INTERSTITIAL_PACE_MS && now - lastAttemptAt >= INTERSTITIAL_RETRY_MS
}

/**
 * Record that an interstitial was just requested and is expected to run,
 * restarting the full gap. Call BEFORE the show (so nothing else can slip a
 * second request in while it is on its way) and follow a request that showed
 * nothing with `markInterstitialFailed`.
 */
export const markInterstitialShown = (now: number = Date.now()): void => {
  shownBeforeAttempt = lastShownAt
  lastShownAt = now
  lastAttemptAt = now
}

/**
 * The request marked with `markInterstitialShown` showed nothing (no-fill,
 * never opened, threw): give the full gap back to the ad that really ran last,
 * and allow a retry after `INTERSTITIAL_RETRY_MS`.
 */
export const markInterstitialFailed = (now: number = Date.now()): void => {
  lastShownAt = shownBeforeAttempt
  lastAttemptAt = now
}

/** Milliseconds until the next interstitial is allowed; 0 when one is due. */
export const msUntilNextInterstitial = (now: number = Date.now()): number => {
  if (lastShownAt === 0) return INTERSTITIAL_PACE_MS
  return Math.max(
    0,
    lastShownAt + INTERSTITIAL_PACE_MS - now,
    lastAttemptAt + INTERSTITIAL_RETRY_MS - now
  )
}

/** Seconds until the next interstitial is allowed — debug/telemetry only. */
export const interstitialCooldownLeft = (): number => msUntilNextInterstitial() / 1000

/** Test seam: reset the pacing clock. */
export const __resetInterstitialClock = (): void => {
  lastShownAt = 0
  lastAttemptAt = 0
  shownBeforeAttempt = 0
}

/**
 * Show an interstitial at a natural break — match end before the first
 * overlay, a new node started from the result screen or the campaign map — if
 * one is due. The whole pacing rule in one call:
 *
 *   • nothing while another ad is in flight;
 *   • nothing without inventory (`isInterstitialReady`);
 *   • nothing inside the gap (`canShowInterstitial`);
 *   • the clock is charged ONCE, up front, and refunded to the retry rule when
 *     the request showed nothing.
 *
 * `delayMs` leaves a stinger its window before the audio is killed (the result
 * screen passes ~500 ms). Resolves `true` only when an ad actually ran. Never
 * inside a match — that is the caller's promise, this module cannot see the
 * board.
 */
export const showPacedInterstitial = async (o: { delayMs?: number } = {}): Promise<boolean> => {
  if (adInFlight.value) return false
  if (!isInterstitialReady.value) return false
  if (!canShowInterstitial()) return false
  markInterstitialShown()
  adInFlight.value = true
  try {
    if (o.delayMs && o.delayMs > 0) await new Promise<void>((r) => setTimeout(r, o.delayMs))
    const outcome = await showMidgameAd()
    if (outcome !== 'shown') markInterstitialFailed()
    return outcome === 'shown'
  } catch (e) {
    // `showMidgameAd` contains its own errors; this is for a provider surface
    // that forgot to. The clock must not stay charged for an ad that threw.
    console.warn('[ads] paced interstitial failed', e)
    markInterstitialFailed()
    return false
  } finally {
    adInFlight.value = false
  }
}

// ─── Where a break may LAND ─────────────────────────────────────────────────
//
// Pacing answers "has enough time passed"; this answers "is this moment a
// moment the player already experiences as a stop". They are independent, and
// both have to say yes: an ad that is due but arrives mid-flow is read as a
// bug, not as an ad.
//
// The rules below are not taste. Each one is a thing blind testers reported
// (2026-09-11/12), and each was enforced until now by an expression written
// inline in `GameScene.vue` and a second copy of it in `CampaignModal.vue` —
// two untested copies of the placement rule the playtest paid for. They live
// here as one function so there is one copy and it can be pinned.

/** The beats a break can be requested at. Anything not named here is mid-flow. */
export type AdBeat =
  /** A match has just ended, before any overlay is shown. */
  | 'matchEnd'
  /** The player tapped off the result screen themselves — Next or Retry. */
  | 'leavingResult'
  /** A node is being started from the campaign map. */
  | 'nodeStart'

/**
 * May an interstitial be shown at this beat?
 *
 * NOT ANYWHERE IN THE TUTORIAL, whatever the beat. A lesson hands over
 * silently — the coins fly, the next lesson starts — so a break at a lesson
 * boundary reads as one dropped into the middle of a fight. Camila's fired at
 * a clean 1-6 → 1-7 handover and she reported it as "it cut into an active
 * fight". The whole six-lesson arc is about two minutes long and is the part
 * of the game that decides whether anybody plays the rest of it. `isLessonNode`
 * is the authority, so the late lessons (2-3's clash, and the three rune
 * lessons carved out of the generated chapters) are covered by the same rule
 * without a second table to keep in sync.
 *
 * NOT IN FRONT OF A DEFEAT. The ad-before-the-overlay ordering exists so a WIN
 * is never celebrated and then guillotined mid-jingle, and for a win it stays
 * exactly that. A loss is the other case: the player has just lost and still
 * does not know why, and both desktop testers called an ad there the worst
 * possible moment. So `matchEnd` is a win-only beat; a defeat's ad waits for
 * the player's own next tap, which arrives as `leavingResult`.
 *
 * This is a placement rule only — it says nothing about pacing, inventory or
 * whether another ad is in flight. `showPacedInterstitial` owns those, and a
 * caller needs both.
 */
export const mayBreakAt = (beat: AdBeat, o: { nodeId: number; won?: boolean }): boolean => {
  if (isLessonNode(o.nodeId)) return false
  if (beat === 'matchEnd') return o.won === true
  return true
}
