// ─── Game-state field catalogue ─────────────────────────────────────────────
//
// Field names INSIDE the single `glyphyx_state` blob (see `useGlyphyxState.ts`).
// These are NOT separate localStorage keys — they are properties of the one
// persisted object — but they are still a contract with the player base:
// renaming any of them strands existing players' progress on the old field.
// Treat them as load-bearing constants.
//
// Everything is `gx_`-prefixed so `SaveMergePolicy.isPayloadKey` can allowlist
// the whole surface with a single prefix.

// ─── Meta progression ───────────────────────────────────────────────────────

/** Meta currency (gold coins), earned by conquest and the forge, spent on skins. */
export const COINS_KEY = 'gx_coins'
/** Lifetime coins earned — never decremented by spending. */
export const TOTAL_COINS_KEY = 'gx_total_coins'
/**
 * The campaign node the player is on, as a GLOBAL 1-based index
 * (chapter 1 = nodes 1–8, chapter 2 = 9–16, …). A node's setup is regenerated
 * deterministically from this number alone, so a reload — or opening the game
 * on another device after a cloud sync — drops the player at the node they were
 * playing, never back at 1-1.
 */
export const NODE_KEY = 'gx_node'
/** Highest node ever cleared — the headline progress number and the leaderboard score. */
export const BEST_NODE_KEY = 'gx_best_node'
/** Lifetime matches finished (wins + losses). */
export const MATCHES_KEY = 'gx_matches'
/** Lifetime wins. */
export const WINS_KEY = 'gx_wins'
/** Current consecutive-win streak — drives the flame aura and the gold multiplier. */
export const STREAK_KEY = 'gx_streak'
/** Best streak ever — the leaderboard's second column. */
export const BEST_STREAK_KEY = 'gx_best_streak'
/** Highest number of enemy runes shattered in one resolution, ever. */
export const BEST_COMBO_KEY = 'gx_best_combo'
/** Rune types the player has unlocked, as an array of `RuneType`. */
export const UNLOCKED_RUNES_KEY = 'gx_unlocked_runes'
/** Pebble skins owned, as an array of `SkinId`. */
export const SKINS_OWNED_KEY = 'gx_skins_owned'
/** The equipped pebble skin. */
export const SKIN_KEY = 'gx_skin'

// ─── Adaptive difficulty ────────────────────────────────────────────────────

/** Losses per node, as `{ [nodeId]: count }`. Cleared for a node the moment it is won. */
export const FAILED_NODES_KEY = 'gx_failed_nodes'
/** Consecutive losses overall. A win zeroes it. */
export const LOSS_STREAK_KEY = 'gx_loss_streak'

// ─── The offline rune forge ─────────────────────────────────────────────────

/** Epoch ms of the last forge claim. 0/absent = never claimed (a first-time
 *  player finds a forge that is already partly filled — see `useRuneForge`). */
export const FORGE_AT_KEY = 'gx_forge_at'
/** When the skin chest was last opened (epoch ms). See `useSkinChest`. */
export const SKIN_CHEST_AT_KEY = 'gx_skin_chest_at'

// ─── Onboarding / one-shot UI nudges ────────────────────────────────────────

/** The player has placed their first rune ever — retires the ghost hand. */
export const TUTORIAL_KEY = 'gx_tutorial_seen'
/** The player has aimed a rune with a swipe at least once — retires the aim hint. */
export const AIMED_KEY = 'gx_aimed'
/** How many result screens the player has seen — drives the first-few-screens pointers. */
export const RESULTS_SEEN_KEY = 'gx_results_seen'
/** The textless goal intro (eight tiles → crown) has played once, on the first real conquest match. */
export const GOAL_SEEN_KEY = 'gx_goal_seen'
/** Placements per rune type, as `{ [type]: count }` — retires each rune's tooltip after a few uses. */
export const RUNE_USES_KEY = 'gx_rune_uses'
/** Power runes owned (armed for the next match), as `{ [type]: count }`. Bought with coins or a rewarded ad. */
export const POWER_RUNES_KEY = 'gx_power_runes'

/**
 * Permanent rune RANKS, as `{ [type]: 0..MAX_RUNE_RANK }`. Each rank is worth
 * `RANK_HP_PER_RANK` maximum hit points on the player's runes of that type,
 * and is bought with coins, one rewarded video, or the rotating free gift.
 * The single biggest coin sink in the game, so it is also the field a lost
 * save hurts most — it rides the cloud blob like everything else.
 */
export const RUNE_RANKS_KEY = 'gx_rune_ranks'
/**
 * The `freeRankWindow()` index whose free upgrade has already been taken.
 * One gift per 20-minute window: storing the WINDOW rather than a count is
 * what makes the offer un-farmable by reloading, and self-clearing when the
 * clock rolls on.
 */
export const FREE_RANK_KEY = 'gx_free_rank_window'

// ─── Leaderboard identity + posting bookkeeping ─────────────────────────────

export const PLAYER_ID_KEY = 'gx_player_id'
export const PLAYER_NAME_KEY = 'gx_player_name'
export const SDK_NAME_KEY = 'gx_sdk_name'
export const ANON_NAME_KEY = 'gx_anon_name'
export const POSTED_NAME_KEY = 'gx_posted_name'
/** The highest node already sent to the leaderboard — the client writes ONLY when it is beaten. */
export const SUBMITTED_NODE_KEY = 'gx_submitted_node'

// ─── User settings ──────────────────────────────────────────────────────────

export const SOUND_KEY = 'gx_user_sound_volume'
export const MUSIC_KEY = 'gx_user_music_volume'
export const LANGUAGE_KEY = 'gx_user_language'
export const DIFFICULTY_KEY = 'gx_user_difficulty'
export const MUSIC_TRACK_KEY = 'gx_user_music_track'
/** Mobile-only hard audio mute (boolean). */
export const MOBILE_MUTE_KEY = 'gx_mobile_mute'
