import { ref, watch, type Ref } from 'vue'
import { saveDataVersion } from '@/use/useSaveStatus'
import { COINS_KEY, TOTAL_COINS_KEY } from '@/keys'
import { getState, setStates, glyphyxState } from '@/use/useGlyphyxState'

/**
 * Coins — the META currency, and the only one.
 *
 * Earned by conquest (multiplied by the win streak), by the chests a cleared
 * node pays, and by the offline rune forge; spent on pebble skins. Persists
 * inside the single `glyphyx_state` blob.
 *
 * One currency on purpose: several portals (Poki among them) refuse a
 * secondary currency outright, and a coins-plus-shards economy would have to
 * collapse to one anyway on those builds.
 */

// Coins are stored as a plain number inside the blob. `Number(v)` falls back to
// 0 for any malformed leftover.
const readNumber = (key: string, fallback: number): number => {
  const v = getState<unknown>(key)
  if (v === undefined || v === null) return fallback
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}

const coins: Ref<number> = ref(readNumber(COINS_KEY, 0))
/** Lifetime coins earned — never decremented by spending. */
const lifetimeCoins: Ref<number> = ref(readNumber(TOTAL_COINS_KEY, 0))

const refresh = (): void => {
  coins.value = readNumber(COINS_KEY, coins.value)
  lifetimeCoins.value = readNumber(TOTAL_COINS_KEY, lifetimeCoins.value)
}

// Re-read on the hydrate-success bump AND on any blob-identity change (a cloud
// sync writes back into the blob) so the wallet ref never drifts from storage.
watch(saveDataVersion, refresh)
watch(glyphyxState, refresh, { deep: false })

const useEconomy = () => {
  const addCoins = (amount: number): void => {
    if (!Number.isFinite(amount) || amount === 0) return
    const next = Math.max(0, Math.floor(coins.value + amount))
    const nextLifetime = amount > 0
      ? lifetimeCoins.value + Math.floor(amount)
      : lifetimeCoins.value
    coins.value = next
    lifetimeCoins.value = nextLifetime
    // One batched write → one reactive pass, one persist schedule.
    setStates({ [COINS_KEY]: next, [TOTAL_COINS_KEY]: nextLifetime })
  }

  const spendCoins = (amount: number): boolean => {
    if (amount < 0 || coins.value < amount) return false
    coins.value -= amount
    setStates({ [COINS_KEY]: coins.value })
    return true
  }

  const canAfford = (amount: number): boolean => coins.value >= amount

  return { coins, lifetimeCoins, addCoins, spendCoins, canAfford }
}

export { coins, lifetimeCoins }
export default useEconomy
