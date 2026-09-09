import { computed, ref, watch, type Ref } from 'vue'
import { RUNE_TYPES, type RuneType } from '@/game/rules'
import { POWER_RUNES_KEY } from '@/keys'
import { getState, setState } from '@/use/useGlyphyxState'
import { flushSaveNow, saveDataVersion } from '@/use/useSaveStatus'
import useEconomy, { coins } from '@/use/useEconomy'
import { watchRewarded } from '@/use/useAdGate'

/**
 * ─── Power runes ────────────────────────────────────────────────────────────
 *
 * The shop's consumables: a power rune of a type is ARMED for the player's
 * next match — the first pebble of that type they place lands at
 * `POWER_RUNE_LEVEL` instead of Lv 1 — and is consumed the moment it is used
 * (not at match start, so a rune the player never draws is never wasted).
 * One armed per type per match; the rest of the stock waits for the match
 * after. Stock lives in the save blob (`gx_power_runes`).
 *
 * Bought with coins (`POWER_RUNE_PRICE`) or one rewarded ad. The battle reads
 * `armedBoons()` when a match starts and calls `consumePowerRune(type)` when
 * the domain reports the boon was spent.
 */

/** The level a power rune lands at. */
export const POWER_RUNE_LEVEL = 3
/** Coins per power rune — about four early wins, two on a streak. */
export const POWER_RUNE_PRICE = 180

type Stock = Partial<Record<RuneType, number>>

const sanitize = (raw: unknown): Stock => {
  const out: Stock = {}
  if (!raw || typeof raw !== 'object') return out
  for (const t of RUNE_TYPES) {
    const n = Number((raw as Record<string, unknown>)[t])
    if (Number.isFinite(n) && n > 0) out[t] = Math.floor(n)
  }
  return out
}

const stock: Ref<Stock> = ref(sanitize(getState<Stock>(POWER_RUNES_KEY, {})))

const persist = (next: Stock): void => {
  stock.value = next
  setState(POWER_RUNES_KEY, next)
}

/** Re-read after a hydrate (the state layer swaps the blob underneath us). */
export const reloadPowerRunes = (): void => {
  stock.value = sanitize(getState<Stock>(POWER_RUNES_KEY, {}))
}

/** Reactive stock, per type. */
export const powerRunes = computed<Record<RuneType, number>>(() =>
  Object.fromEntries(RUNE_TYPES.map((t) => [t, stock.value[t] ?? 0])) as Record<RuneType, number>
)

export const powerRuneCount = (type: RuneType): number => stock.value[type] ?? 0

/** Total armed, for a badge on the shop button. */
export const powerRuneTotal = computed(() => RUNE_TYPES.reduce((n, t) => n + (stock.value[t] ?? 0), 0))

/** One (or `n`) more of `type` in stock. The shop calls this after a purchase or a rewarded ad. */
export const addPowerRune = (type: RuneType, n = 1): void => {
  if (!RUNE_TYPES.includes(type) || n <= 0) return
  persist({ ...stock.value, [type]: powerRuneCount(type) + Math.floor(n) })
}

/** Spend one of `type`. Returns false when there was none. */
export const consumePowerRune = (type: RuneType): boolean => {
  const have = powerRuneCount(type)
  if (have <= 0) return false
  const next: Stock = { ...stock.value }
  if (have === 1) delete next[type]
  else next[type] = have - 1
  persist(next)
  return true
}

/**
 * The boons to hand a new match: every type in stock, at the power level.
 * Read-only — nothing is consumed until the domain reports the boon spent.
 */
export const armedBoons = (): Partial<Record<RuneType, number>> => {
  const out: Partial<Record<RuneType, number>> = {}
  for (const t of RUNE_TYPES) if ((stock.value[t] ?? 0) > 0) out[t] = POWER_RUNE_LEVEL
  return out
}

// ─── Paying for one ─────────────────────────────────────────────────────────

/** Why a rewarded video is being shown — the ads layer keys its telemetry on it. */
export type RewardedReason = 'multiplier' | 'skin' | 'powerRune'

/**
 * Run `grant` behind a rewarded video.
 *
 * The ad gate's `watchRewarded(reason)` never throws and resolves true only
 * after the provider said the video was watched — a no-fill, a dismissal or a
 * blocked ad resolve false and grant nothing. The reason rides along for the
 * provider's telemetry.
 */
export const watchRewardedFor = async (reason: RewardedReason, grant: () => void): Promise<boolean> => {
  const ok = await watchRewarded(reason)
  if (ok) grant()
  return ok
}

export const canAffordPowerRune = computed(() => coins.value >= POWER_RUNE_PRICE)

/**
 * Spend coins and stock one. False when unaffordable. Coins are spent FIRST
 * and the rune stocked only if that succeeded, so a purchase never half-happens.
 */
export const buyPowerRune = (type: RuneType): boolean => {
  if (!RUNE_TYPES.includes(type)) return false
  if (!useEconomy().spendCoins(POWER_RUNE_PRICE)) return false
  addPowerRune(type)
  void flushSaveNow()
  return true
}

/** One rewarded video → one power rune of `type`. Resolves to whether it was granted. */
export const earnPowerRuneByAd = (type: RuneType): Promise<boolean> => {
  if (!RUNE_TYPES.includes(type)) return Promise.resolve(false)
  return watchRewardedFor('powerRune', () => {
    addPowerRune(type)
    void flushSaveNow()
  })
}

const usePowerRunes = () => ({
  powerRunes, powerRuneCount, powerRuneTotal, canAffordPowerRune,
  addPowerRune, consumePowerRune, armedBoons, buyPowerRune, earnPowerRuneByAd, reloadPowerRunes
})
export default usePowerRunes

// A cloud merge swaps the blob underneath every composable: re-read like the rest.
watch(saveDataVersion, reloadPowerRunes)
