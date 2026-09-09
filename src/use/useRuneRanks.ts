import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import {
  MAX_RUNE_RANK, RUNE_TYPES, clampRank, freeRankWindow, freeRankWindowLeft, rankHpBonus, rankOf, rankPrice,
  type RankTable, type RuneType
} from '@/game/rules'
import { FREE_RANK_KEY, PLAYER_ID_KEY, RUNE_RANKS_KEY } from '@/keys'
import { pick, seedFrom } from '@/game/rng'
import { getState, setState } from '@/use/useGlyphyxState'
import { flushSaveNow, saveDataVersion } from '@/use/useSaveStatus'
import useEconomy, { coins } from '@/use/useEconomy'
import { watchRewarded, type RewardedReason } from '@/use/useAdGate'

/**
 * ─── Rune ranks ─────────────────────────────────────────────────────────────
 *
 * The permanent half of the shop, and the game's deepest coin sink: every rune
 * carries a rank from 0 to `MAX_RUNE_RANK`, and each rank is worth
 * `RANK_HP_PER_RANK` maximum hit points on the PLAYER's runes of that type
 * (see the balance note in `rules.ts` — the same number for every rune, so no
 * rune can pull ahead of another). Stock lives in the save blob
 * (`gx_rune_ranks`) and rides the cloud like everything else.
 *
 * Three ways to pay for the next rank, and the shop offers whichever apply:
 *
 *   • coins            — `RANK_PRICES`, climbing 70 → 560
 *   • one rewarded ad  — `buyRankByAd`, on builds that have a video to play
 *   • the free gift    — `claimFreeRank`, once per 20-minute window
 *
 * ─── The rotating gift ──────────────────────────────────────────────────────
 *
 * At any moment ONE rune's next rank is free. Which rune is derived from the
 * clock (`freeRankWindow`) and the player's own id — never stored — so:
 *
 *   • it keeps turning while the game is shut, and a player who has been away
 *     comes back to a different rune rather than to a pile of unclaimed gifts;
 *   • it cannot be farmed by reloading, because the window is the clock;
 *   • two players are not shown the same rune, because the id seeds the draw.
 *
 * Only the CLAIM is persisted, as the window index it was taken in
 * (`gx_free_rank_window`), which is one integer and self-clearing: the moment
 * the clock rolls into the next window the stored value no longer matches and
 * the gift is live again.
 */

// ─── The stored ranks ───────────────────────────────────────────────────────

const sanitize = (raw: unknown): RankTable => {
  const out: RankTable = {}
  if (!raw || typeof raw !== 'object') return out
  for (const t of RUNE_TYPES) {
    const n = clampRank(Number((raw as Record<string, unknown>)[t]))
    if (n > 0) out[t] = n
  }
  return out
}

const ranks: Ref<RankTable> = ref(sanitize(getState<RankTable>(RUNE_RANKS_KEY, {})))

const persist = (next: RankTable): void => {
  ranks.value = next
  setState(RUNE_RANKS_KEY, next)
  // A rank costs up to 560 coins. It does not wait for the save debounce.
  void flushSaveNow()
}

/** Re-read after a hydrate (the state layer swaps the blob underneath us). */
export const reloadRuneRanks = (): void => {
  ranks.value = sanitize(getState<RankTable>(RUNE_RANKS_KEY, {}))
}

/** Reactive rank per type, every type present. */
export const runeRanks: ComputedRef<Record<RuneType, number>> = computed(() =>
  Object.fromEntries(RUNE_TYPES.map((t) => [t, rankOf(ranks.value, t)])) as Record<RuneType, number>
)

export const rankOfRune = (type: RuneType): number => rankOf(ranks.value, type)

export const isRankMaxed = (type: RuneType): boolean => rankOfRune(type) >= MAX_RUNE_RANK

/** Coins for this rune's next rank, or `null` when it is capped. */
export const nextRankPrice = (type: RuneType): number | null => rankPrice(rankOfRune(type))

export const canAffordRank = (type: RuneType): boolean => {
  const price = nextRankPrice(type)
  return price !== null && coins.value >= price
}

/** The maximum-HP bonus this rune's ranks are currently worth — for the card. */
export const rankBonusOf = (type: RuneType): number => rankHpBonus(rankOfRune(type))

/** The ranks a new match should be played with. Copied, never mutated by one. */
export const rankTable = (): RankTable => ({ ...ranks.value })

/** Raise `type` by one rank. False when it was already capped. */
const grantRank = (type: RuneType): boolean => {
  if (!RUNE_TYPES.includes(type) || isRankMaxed(type)) return false
  persist({ ...ranks.value, [type]: rankOfRune(type) + 1 })
  return true
}

// ─── The rotating free upgrade ──────────────────────────────────────────────

/**
 * A 32-bit hash of the player's stable id, so the draw differs per player.
 *
 * Read straight from the two places the identity lives rather than through
 * `resolveIdentity`, which is async and mints — this runs inside a computed on
 * every render, and a gift card must never be the thing that creates an
 * identity. Before an id exists (the first seconds of a fresh install) the seed
 * is simply 0, which draws a valid rune like any other seed.
 *
 * `glyphyx_uid` is `usePlayerIdentity`'s own device-level copy, deliberately
 * outside the `gx_` blob so a cloud round-trip cannot erase it; the literal is
 * duplicated here rather than exported, because nothing about this file should
 * be able to change it.
 */
const DEVICE_UID_KEY = 'glyphyx_uid'

const hashString = (s: string): number => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const playerSeed = (): number => {
  let id = ''
  try { id = getState<string>(PLAYER_ID_KEY, '') || '' } catch { id = '' }
  if (!id) {
    try { id = localStorage.getItem(DEVICE_UID_KEY) ?? '' } catch { id = '' }
  }
  return id ? hashString(id) : 0
}

/**
 * A clock the countdown can render against. One tick a second is nothing next
 * to the game's own RAF loop, and it is the only way a `computed` can show a
 * time remaining that actually moves.
 */
const nowMs: Ref<number> = ref(Date.now())
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => { nowMs.value = Date.now() }, 1000)
  // Never keep a Node process (or a test runner) alive for a cosmetic clock.
  ;(timer as unknown as { unref?: () => void }).unref?.()
}

/** For tests and teardown: advance the clock the countdown reads. */
export const __setFreeRankNow = (ms: number): void => { nowMs.value = ms }

/**
 * The rune whose next rank is free right now, or `null` when every rune is
 * capped and there is nothing left to give.
 *
 * The draw is over the runes that are NOT capped, so the gift can always be
 * spent. That does mean the pick can change inside a window if the eligible set
 * changes — which happens only when the player has just capped the rune it was
 * pointing at, by claiming this very gift or by buying that rank with coins. In
 * both cases the gift for the window is either spent or still spendable on the
 * new pick, so the rotation stays honest; it simply never points at a rune the
 * player cannot use.
 */
export const freeRankRune: ComputedRef<RuneType | null> = computed(() => {
  const eligible = RUNE_TYPES.filter((t) => rankOf(ranks.value, t) < MAX_RUNE_RANK)
  if (eligible.length === 0) return null
  const [chosen] = pick(seedFrom(playerSeed(), freeRankWindow(nowMs.value)), eligible)
  return chosen
})

const claimedWindow = (): number | null => {
  const raw = getState<unknown>(FREE_RANK_KEY)
  const n = Number(raw)
  return Number.isFinite(n) ? Math.floor(n) : null
}

/**
 * Is this window's gift still there?
 *
 * A stored window that does not match the current one means the gift is live —
 * including a stored window from the FUTURE, which a device with a wrong clock
 * or a cloud blob written by a later session can produce. Erring that way is
 * deliberate: the alternative locks a player out of the feature until their
 * clock catches up, which could be days, and the cost of being generous is at
 * most one extra free rank. The first claim overwrites it with the real
 * current window, so the state repairs itself.
 */
export const freeRankAvailable: ComputedRef<boolean> = computed(() => {
  if (freeRankRune.value === null) return false
  return claimedWindow() !== freeRankWindow(nowMs.value)
})

/** ms until another rune is drawn. */
export const freeRankLeftMs: ComputedRef<number> = computed(() => freeRankWindowLeft(nowMs.value))

/**
 * Take the free rank. `type` must BE this window's rune — the shop passes
 * `freeRankRune`, and anything else is refused so the gift cannot be
 * redirected onto a rune the player would rather have.
 *
 * Costs nothing and needs no video, so it is the one payment route that works
 * identically on a build with no ads at all.
 */
export const claimFreeRank = (type: RuneType): boolean => {
  if (!freeRankAvailable.value || freeRankRune.value !== type) return false
  if (!grantRank(type)) return false
  setState(FREE_RANK_KEY, freeRankWindow(nowMs.value))
  void flushSaveNow()
  return true
}

// ─── Paying for one ─────────────────────────────────────────────────────────

/**
 * Spend coins and raise the rank. False when capped or unaffordable. Coins are
 * spent FIRST and the rank granted only if that succeeded, so a purchase never
 * half-happens.
 */
export const buyRankWithCoins = (type: RuneType): boolean => {
  if (!RUNE_TYPES.includes(type)) return false
  const price = nextRankPrice(type)
  if (price === null) return false
  if (!useEconomy().spendCoins(price)) return false
  return grantRank(type)
}

/**
 * One rewarded video → one rank of `type`. Resolves to whether it was granted;
 * a no-fill, a dismissal or a blocked ad grant nothing.
 *
 */
const RANK_REWARD_REASON: RewardedReason = 'runeRank'

export const buyRankByAd = async (type: RuneType): Promise<boolean> => {
  if (!RUNE_TYPES.includes(type) || isRankMaxed(type)) return false
  const granted = await watchRewarded(RANK_REWARD_REASON)
  if (!granted) return false
  return grantRank(type)
}

const useRuneRanks = () => ({
  runeRanks, rankOfRune, rankBonusOf, nextRankPrice, canAffordRank, isRankMaxed, rankTable,
  freeRankRune, freeRankAvailable, freeRankLeftMs,
  buyRankWithCoins, buyRankByAd, claimFreeRank, reloadRuneRanks
})
export default useRuneRanks

// A cloud merge swaps the blob underneath every composable: re-read like the rest.
watch(saveDataVersion, reloadRuneRanks)
