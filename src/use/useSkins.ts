import { ref, watch, type Ref } from 'vue'
import { saveDataVersion, flushSaveNow } from '@/use/useSaveStatus'
import { getState, setStates, glyphyxState } from '@/use/useGlyphyxState'
import { SKIN_KEY, SKINS_OWNED_KEY } from '@/keys'
import { SKINS, SKIN_IDS, STARTING_SKIN, type SkinId } from '@/game/rules'
import useEconomy from '@/use/useEconomy'
import { watchRewardedFor } from '@/use/usePowerRunes'

/**
 * ─── Pebble skins — the coin sink ───────────────────────────────────────────
 *
 * The one thing coins buy. A skin recolours the stone every player rune is
 * carved from (see `SKINS` for the palettes); the glyph colours never change,
 * because those are the rules of the game and a skin must never make a bow
 * look like a sword.
 *
 * Both fields live in the save blob so a purchase rides the cloud save.
 *
 * A skin can also be UNLOCKED BY A REWARDED VIDEO (`unlockSkinByAd`) — the
 * alternative payment for a player with an empty wallet. Same grant path as a
 * purchase, so it equips too.
 */

const isSkinId = (v: unknown): v is SkinId =>
  typeof v === 'string' && (SKIN_IDS as readonly string[]).includes(v)

/** Every skin the blob says the player owns, sanitised; the starter is always in it. */
const readOwned = (): SkinId[] => {
  const raw = getState<unknown>(SKINS_OWNED_KEY)
  const out: SkinId[] = []
  if (Array.isArray(raw)) {
    for (const v of raw) if (isSkinId(v) && !out.includes(v)) out.push(v)
  }
  if (!out.includes(STARTING_SKIN)) out.unshift(STARTING_SKIN)
  return SKIN_IDS.filter((id) => out.includes(id))
}

/** The equipped skin — only ever one the player owns. */
const readActive = (owned: readonly SkinId[]): SkinId => {
  const raw = getState<unknown>(SKIN_KEY)
  return isSkinId(raw) && owned.includes(raw) ? raw : STARTING_SKIN
}

/** Every skin the player owns (`gx_skins_owned`). Always contains the starting one. */
export const ownedSkins: Ref<SkinId[]> = ref(readOwned())
/** The equipped pebble skin (`gx_skin`). */
export const activeSkin: Ref<SkinId> = ref(readActive(ownedSkins.value))

const refresh = (): void => {
  ownedSkins.value = readOwned()
  activeSkin.value = readActive(ownedSkins.value)
}
watch(saveDataVersion, refresh)
watch(glyphyxState, refresh, { deep: false })

export const isSkinOwned = (id: SkinId): boolean => ownedSkins.value.includes(id)
export const priceOf = (id: SkinId): number => SKINS[id]?.price ?? 0

const own = (id: SkinId): void => {
  const next = SKIN_IDS.filter((s) => s === id || ownedSkins.value.includes(s))
  ownedSkins.value = next
  setStates({ [SKINS_OWNED_KEY]: next })
}

/** Grant a skin for free (a chest reward). Returns false if already owned. */
export const grantSkin = (id: SkinId): boolean => {
  if (!isSkinId(id) || isSkinOwned(id)) return false
  own(id)
  void flushSaveNow()
  return true
}

/**
 * Spend coins and own it. False when unaffordable or already owned.
 *
 * Coins are spent FIRST and the skin granted only if that succeeded, so a
 * purchase can never half-happen. Equips it too — a player who just paid for a
 * look wants to see it, not find a second button.
 */
export const buySkin = (id: SkinId): boolean => {
  if (!isSkinId(id) || isSkinOwned(id)) return false
  if (!useEconomy().spendCoins(priceOf(id))) return false
  own(id)
  activeSkin.value = id
  setStates({ [SKIN_KEY]: id })
  void flushSaveNow()
  return true
}

/**
 * One rewarded video → own and wear `id`. Resolves to whether it was granted;
 * an owned skin or a bad id resolves false without showing anything.
 */
export const unlockSkinByAd = (id: SkinId): Promise<boolean> => {
  if (!isSkinId(id) || isSkinOwned(id)) return Promise.resolve(false)
  return watchRewardedFor('skin', () => {
    own(id)
    activeSkin.value = id
    setStates({ [SKIN_KEY]: id })
    void flushSaveNow()
  })
}

export const equipSkin = (id: SkinId): boolean => {
  if (!isSkinId(id) || !isSkinOwned(id)) return false
  if (activeSkin.value === id) return true
  activeSkin.value = id
  setStates({ [SKIN_KEY]: id })
  return true
}

const useSkins = () => ({ activeSkin, ownedSkins, isSkinOwned, priceOf, buySkin, grantSkin, equipSkin, unlockSkinByAd })
export default useSkins
