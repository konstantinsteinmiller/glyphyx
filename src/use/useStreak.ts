import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { saveDataVersion } from '@/use/useSaveStatus'
import { getState, setStates, glyphyxState } from '@/use/useGlyphyxState'
import { BEST_STREAK_KEY, STREAK_KEY } from '@/keys'
import { streakMultiplier } from '@/game/rules'

/**
 * ─── Win-streak momentum ────────────────────────────────────────────────────
 *
 * Consecutive wins multiply the conquest gold (×1 → ×3, see
 * `STREAK_MULTIPLIERS`) and light a flame aura around the player's side of the
 * board. Persisted so a streak survives a reload — and so a loss on another
 * device ends it there too, which is what makes it feel like a real streak
 * rather than a per-tab counter.
 */

const readNumber = (key: string, fallback: number): number => {
  const v = getState<unknown>(key)
  if (v === undefined || v === null) return fallback
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? Math.max(0, n) : fallback
}

/** Consecutive wins right now (`gx_streak`). */
export const streak: Ref<number> = ref(readNumber(STREAK_KEY, 0))
/** Best streak ever (`gx_best_streak`). */
export const bestStreak: Ref<number> = ref(readNumber(BEST_STREAK_KEY, 0))

const refresh = (): void => {
  streak.value = readNumber(STREAK_KEY, streak.value)
  bestStreak.value = readNumber(BEST_STREAK_KEY, bestStreak.value)
}
watch(saveDataVersion, refresh)
watch(glyphyxState, refresh, { deep: false })

/** The gold multiplier the current streak earns (×1 … ×3). */
export const multiplier: ComputedRef<number> = computed(() => streakMultiplier(streak.value))
/** 0 (no aura) … 3 (full blaze) — drives the flame around the avatar and board. */
export const auraLevel: ComputedRef<number> = computed(() => Math.min(3, Math.floor(streak.value / 2)))

/** A win: bumps the streak, returns the new value. */
export const recordWin = (): number => {
  const next = streak.value + 1
  streak.value = next
  if (next > bestStreak.value) bestStreak.value = next
  setStates({ [STREAK_KEY]: next, [BEST_STREAK_KEY]: bestStreak.value })
  return next
}

/** A loss resets the streak to 0. */
export const recordLoss = (): void => {
  if (streak.value === 0) return
  streak.value = 0
  setStates({ [STREAK_KEY]: 0 })
}

const useStreak = () => ({ streak, bestStreak, multiplier, auraLevel, recordWin, recordLoss })
export default useStreak
