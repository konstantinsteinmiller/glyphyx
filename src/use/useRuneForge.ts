import { computed, onUnmounted, ref, watch, type ComputedRef } from 'vue'
import { FORGE_AT_KEY } from '@/keys'
import { getState, setStates, glyphyxState } from '@/use/useGlyphyxState'
import { saveDataVersion, flushSaveNow } from '@/use/useSaveStatus'
import { FORGE_CAP_HOURS, FORGE_COINS_PER_HOUR, FORGE_HEAD_START_MIN } from '@/game/rules'

/**
 * ─── The offline rune forge ─────────────────────────────────────────────────
 *
 * A forge on the HUD that turns absence into coins: `FORGE_COINS_PER_HOUR` for
 * every hour the tab was closed, up to `FORGE_CAP_HOURS`. It is the game's
 * reason to come back tomorrow, which is why every number here is a retention
 * decision rather than a balance one.
 *
 * The clock is the last CLAIM, stored as an absolute epoch ms inside the save
 * blob — so it survives a reload, rides the cloud save (a forge whose clock is
 * per-device hands a player on two devices two payouts), and a player who
 * closes the tab for an hour has genuinely waited an hour.
 */

const HOUR_MS = 3_600_000
const CAP_MS = FORGE_CAP_HOURS * HOUR_MS
/** ms of absence one coin is worth. */
const MS_PER_COIN = HOUR_MS / FORGE_COINS_PER_HOUR

/**
 * When the forge was last emptied.
 *
 * A player who has NEVER claimed gets a forge that is already
 * `FORGE_HEAD_START_MIN` minutes along rather than one that starts cold at
 * boot: the forge is the one thing on the HUD that has to be TAUGHT (nothing
 * else pays you for waiting), and a first-time player who is shown an empty
 * anvil learns nothing, while one who taps it in the first minute and watches
 * coins fly into the wallet learns all of it.
 *
 * The seed is a computed value, never written: until the first claim there is
 * no forge field in the save at all, so a cloud blob that arrives late cannot
 * lose a race against a locally-written placeholder.
 */
export const readForgeAt = (now: number = Date.now()): number => {
  const v = getState<unknown>(FORGE_AT_KEY)
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : now - FORGE_HEAD_START_MIN * 60_000
}

/** Coins the forge holds after `elapsedMs` of absence. */
export const accruedFor = (elapsedMs: number): number =>
  Math.floor(Math.min(Math.max(0, elapsedMs), CAP_MS) / MS_PER_COIN)

export interface RuneForge {
  /** Coins waiting in the forge right now. */
  accrued: ComputedRef<number>
  /** 0..1 of the cap. */
  fill01: ComputedRef<number>
  /** A tap would pay something. */
  isReady: ComputedRef<boolean>
  /** At the cap — nothing more accrues until collected. */
  isFull: ComputedRef<boolean>
  /** `MM:SS` (or `H:MM:SS`) until the next whole coin — or until full. */
  timeDisplay: ComputedRef<string>
  ratePerHour: number
  /** Claim. Returns the coins won (0 when nothing was ready). Does NOT touch the wallet. */
  collect: () => number
}

const format = (ms: number): string => {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** The forge, ticking. Call from a component's `setup` — it owns a 1 Hz interval released on unmount. */
export const useRuneForge = (): RuneForge => {
  const now = ref(Date.now())
  const forgeAt = ref(readForgeAt(now.value))

  // A cloud save can arrive seconds after boot and rewrite the blob under us —
  // on a second device that is the ONLY thing standing between the player and
  // a second payout. Re-read on the hydrate bump and on any blob identity
  // change, exactly as the wallet does.
  const refresh = (): void => { forgeAt.value = readForgeAt(now.value) }
  watch(saveDataVersion, refresh)
  watch(glyphyxState, refresh, { deep: false })

  const tick = typeof window !== 'undefined'
    ? window.setInterval(() => { now.value = Date.now() }, 1000)
    : null
  onUnmounted(() => { if (tick !== null) clearInterval(tick) })

  const elapsedMs = computed(() => Math.max(0, now.value - forgeAt.value))
  const accrued = computed(() => accruedFor(elapsedMs.value))
  const isFull = computed(() => elapsedMs.value >= CAP_MS)
  const isReady = computed(() => accrued.value >= 1)
  const fill01 = computed(() => Math.min(1, elapsedMs.value / CAP_MS))

  const timeDisplay = computed(() => {
    if (isFull.value) return format(0)
    // Time until the NEXT whole coin lands, so the number under the forge is
    // always moving toward something the player will see happen.
    const intoCoin = elapsedMs.value % MS_PER_COIN
    return format(MS_PER_COIN - intoCoin)
  })

  const collect = (): number => {
    if (!isReady.value) return 0
    const won = accrued.value
    const at = Date.now()
    now.value = at
    forgeAt.value = at
    setStates({ [FORGE_AT_KEY]: at })
    void flushSaveNow()
    return won
  }

  return { accrued, fill01, isReady, isFull, timeDisplay, ratePerHour: FORGE_COINS_PER_HOUR, collect }
}
