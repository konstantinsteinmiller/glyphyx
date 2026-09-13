import { computed, onUnmounted, ref, watch, type ComputedRef } from 'vue'
import { SKIN_CHEST_AT_KEY } from '@/keys'
import { getState, setStates, glyphyxState } from '@/use/useGlyphyxState'
import { saveDataVersion, flushSaveNow } from '@/use/useSaveStatus'
import { SKIN_CHEST_MINUTES } from '@/game/rules'
import { SKIN_IDS, type SkinId } from '@/game/rules'
import { grantSkin, isSkinOwned } from '@/use/useSkins'

/**
 * ─── The skin chest ─────────────────────────────────────────────────────────
 *
 * A free material every `SKIN_CHEST_MINUTES`, taken from the ones the player
 * does not own yet. The shop sells nine materials at 220 coins and up, which
 * is hours of play for the first one; this is the door that opens without
 * paying, and the reason to still be here in ten minutes.
 *
 * Shaped deliberately like `useRuneForge`, the game's other timed collectable
 * — same storage, same 1 Hz tick owned by the component, same `collect()` that
 * returns what it gave. Two mechanics that behave alike are one mechanic to
 * learn. What differs is what runs out: the forge accrues forever against a
 * cap, while the chest is binary — it is ready or it is counting.
 *
 * ── Where the clock lives ──
 *
 * The last CLAIM, as absolute epoch ms inside the save blob (never raw
 * `localStorage`): it has to ride the cloud save, or a player on two devices
 * collects twice, and Poki mirrors the whole blob rather than offering an API.
 *
 * ── The first one is already waiting ──
 *
 * A player who has never claimed finds the chest READY rather than counting
 * down from ten minutes. Nothing else on the HUD gives a skin away, so a
 * countdown is a promise a first-time player has no reason to believe; a chest
 * that opens in the first minute and drops a material into the shop teaches
 * the whole mechanic at once. The seed is computed and never written, so a
 * cloud blob arriving late cannot lose a race with a local placeholder — the
 * same reasoning as the forge's head start.
 */

const COOLDOWN_MS = SKIN_CHEST_MINUTES * 60_000

/** When the chest was last emptied; 0 (never) reads as "ready now". */
export const readChestAt = (): number => {
  const v = getState<unknown>(SKIN_CHEST_AT_KEY)
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** The materials still to be won, in catalogue order. */
export const unownedSkins = (): SkinId[] => SKIN_IDS.filter((id) => !isSkinOwned(id))

export interface SkinChest {
  /** A tap would open it. */
  isReady: ComputedRef<boolean>
  /** 0..1 of the wait — what the ring around the chest draws. */
  fill01: ComputedRef<number>
  /** `MM:SS` until it opens; `00:00` when it is ready. */
  timeDisplay: ComputedRef<string>
  /** False when every material is owned: the chest has nothing left to give. */
  hasRewards: ComputedRef<boolean>
  /** The material a tap would win right now — what the closed chest previews. */
  nextSkin: ComputedRef<SkinId | null>
  /** Open it. Returns the material won, or null when it was not ready. */
  collect: () => SkinId | null
}

const format = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

/**
 * Which material the next chest holds.
 *
 * Keyed on the CLAIM TIME rather than rolled fresh, so the closed chest can
 * preview the very stone it is about to give without the preview changing
 * every second — and so the reward cannot be re-rolled by reloading the page.
 */
const pickFor = (at: number, pool: readonly SkinId[]): SkinId | null => {
  if (pool.length === 0) return null
  // A small integer hash of the claim stamp: stable, and spread enough that
  // consecutive claims do not walk the pool in order.
  const h = Math.abs(Math.imul(at ^ 0x9e3779b9, 0x85ebca6b)) % pool.length
  return pool[h] ?? null
}

/** The chest, ticking. Call from a component's `setup`; it owns a 1 Hz interval. */
export const useSkinChest = (): SkinChest => {
  const now = ref(Date.now())
  const chestAt = ref(readChestAt())
  const owned = ref(unownedSkins())

  // A cloud save can land seconds after boot and rewrite the blob underneath —
  // on a second device that is the only thing between the player and a second
  // free material. Re-read on the hydrate bump, exactly as the forge does.
  const refresh = (): void => {
    chestAt.value = readChestAt()
    owned.value = unownedSkins()
  }
  watch(saveDataVersion, refresh)
  watch(glyphyxState, refresh, { deep: false })

  const tick = typeof window !== 'undefined'
    ? window.setInterval(() => { now.value = Date.now() }, 1000)
    : null
  onUnmounted(() => { if (tick !== null) clearInterval(tick) })

  /** ms still to wait. Never claimed (`0`) means none. */
  const leftMs = computed(() => (chestAt.value === 0
    ? 0
    : Math.max(0, chestAt.value + COOLDOWN_MS - now.value)))

  const hasRewards = computed(() => owned.value.length > 0)
  const isReady = computed(() => hasRewards.value && leftMs.value <= 0)
  const fill01 = computed(() => (chestAt.value === 0 ? 1 : 1 - leftMs.value / COOLDOWN_MS))
  const timeDisplay = computed(() => format(leftMs.value))
  const nextSkin = computed(() => pickFor(chestAt.value, owned.value))

  const collect = (): SkinId | null => {
    if (!isReady.value) return null
    const won = nextSkin.value
    if (won === null || !grantSkin(won)) return null
    const at = Date.now()
    now.value = at
    chestAt.value = at
    owned.value = unownedSkins()
    setStates({ [SKIN_CHEST_AT_KEY]: at })
    void flushSaveNow()
    return won
  }

  return { isReady, fill01, timeDisplay, hasRewards, nextSkin, collect }
}
