import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { saveDataVersion, flushSaveNow } from '@/use/useSaveStatus'
import { getState, setStates, glyphyxState } from '@/use/useGlyphyxState'
import { BEST_NODE_KEY, MATCHES_KEY, NODE_KEY, UNLOCKED_RUNES_KEY, WINS_KEY } from '@/keys'
import {
  RUNE_TYPES, STARTING_RUNES, type ChestReward, type NodeConfig, type RuneType, type SkinId
} from '@/game/rules'
import { NODES_PER_CHAPTER, chapterOf, indexInChapter, nodeConfig } from '@/game/campaign'
import useUser from '@/use/useUser'
import useEconomy from '@/use/useEconomy'
import { grantSkin } from '@/use/useSkins'

/**
 * ─── Campaign progress ──────────────────────────────────────────────────────
 *
 * Where the player is on the map, what they have unlocked, and what a cleared
 * node pays. Every persisted number here lives inside the single
 * `glyphyx_state` blob and rides the cloud save.
 *
 * Two numbers, deliberately separate:
 *
 *   `currentNode`  — the node the player is PLAYING. `startNode()` with no
 *                    argument resumes it, which is the visible half of the
 *                    hydration guarantee: a returning player lands on their own
 *                    node, never on 1-1.
 *   `bestNode`     — the highest node ever CLEARED. It is the leaderboard score,
 *                    the unlock gate (`isNodeUnlocked`), and what decides whether
 *                    a clear pays its chest — a node replayed for fun pays coins
 *                    for the win but never its chest twice.
 */

const readNumber = (key: string, fallback: number): number => {
  const v = getState<unknown>(key)
  if (v === undefined || v === null) return fallback
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}

const isRuneType = (v: unknown): v is RuneType =>
  typeof v === 'string' && (RUNE_TYPES as readonly string[]).includes(v)

/**
 * The unlocked roster, sanitised. A cloud blob from an older build can hand
 * back anything; whatever it is, the sword is always in it — a player with no
 * placeable rune has no game.
 */
const readUnlocked = (): RuneType[] => {
  const raw = getState<unknown>(UNLOCKED_RUNES_KEY)
  const out: RuneType[] = []
  if (Array.isArray(raw)) {
    for (const v of raw) if (isRuneType(v) && !out.includes(v)) out.push(v)
  }
  for (const s of STARTING_RUNES) if (!out.includes(s)) out.unshift(s)
  // Keep the roster in the canonical order so the hand's deck and the campaign
  // modal read the same left to right regardless of unlock order.
  return RUNE_TYPES.filter((t) => out.includes(t))
}

/** The node the player is on (global 1-based). Persisted as `gx_node`. */
export const currentNode: Ref<number> = ref(Math.max(1, readNumber(NODE_KEY, 1)))
/** Highest node ever cleared (`gx_best_node`). 0 for a new player. */
export const bestNode: Ref<number> = ref(Math.max(0, readNumber(BEST_NODE_KEY, 0)))
export const unlockedRunes: Ref<RuneType[]> = ref(readUnlocked())
export const matchesPlayed: Ref<number> = ref(Math.max(0, readNumber(MATCHES_KEY, 0)))
export const wins: Ref<number> = ref(Math.max(0, readNumber(WINS_KEY, 0)))

const refresh = (): void => {
  currentNode.value = Math.max(1, readNumber(NODE_KEY, currentNode.value))
  bestNode.value = Math.max(0, readNumber(BEST_NODE_KEY, bestNode.value))
  unlockedRunes.value = readUnlocked()
  matchesPlayed.value = Math.max(0, readNumber(MATCHES_KEY, matchesPlayed.value))
  wins.value = Math.max(0, readNumber(WINS_KEY, wins.value))
}

// Re-read on the hydrate-success bump AND on any blob-identity change (a cloud
// sync writes back into the blob) so the refs never drift from storage.
watch(saveDataVersion, refresh)
watch(glyphyxState, refresh, { deep: false })

export interface ClearOutcome {
  coins: number
  newRune: RuneType | null
  newSkin: SkinId | null
  /** True the FIRST time this node was cleared (rewards only pay once). */
  first: boolean
  isRecord: boolean
}

// ─── Node configs ───────────────────────────────────────────────────────────
//
// Memoised per (id, difficulty). A node's setup is a pure function of those two
// and the renderer, the HUD and the match all ask for it in the same frame; a
// fresh object each time would also defeat identity checks downstream.

const configCache = new Map<string, NodeConfig>()

/** The config of node `id` for the active difficulty setting (memoised). */
export const nodeConfigFor = (id: number): NodeConfig => {
  const safeId = Math.max(1, Math.floor(Number(id) || 1))
  const difficulty = useUser().userDifficulty.value
  const key = `${safeId}|${difficulty}`
  const hit = configCache.get(key)
  if (hit) return hit
  const cfg = nodeConfig(safeId, difficulty)
  configCache.set(key, cfg)
  return cfg
}

export const rewardOf = (id: number): ChestReward => nodeConfigFor(id).reward

export const isNodeCleared = (id: number): boolean => id >= 1 && id <= bestNode.value

// ─── The next rune, as a promise the map can show ───────────────────────────

export interface NextUnlock {
  nodeId: number
  chapter: number
  index: number
  rune: RuneType
}

/** How far ahead the scan looks before giving up. Five chapters is well past
 *  the last rune the campaign hands out; the bound only stops a runaway loop. */
const UNLOCK_SCAN_NODES = 5 * NODES_PER_CHAPTER

/**
 * The next node that will hand over a rune the player does not own yet, or
 * `null` when there is none within reach.
 *
 * It scans forward from `bestNode + 1` — the first node NOT yet cleared —
 * rather than from `currentNode`, because a chest pays only on a node's first
 * clear (`markNodeCleared`'s `first`). A player replaying an old node has
 * already banked whatever it held, so it can never be the answer.
 *
 * A `computed` over `bestNode` and `unlockedRunes`, both of which the watches
 * above re-read after a hydrate — so a returning player's teaser is right as
 * soon as their save lands, without this module knowing the save exists.
 */
export const nextRuneUnlock: ComputedRef<NextUnlock | null> = computed(() => {
  const have = unlockedRunes.value
  const from = Math.max(1, bestNode.value + 1)
  for (let id = from; id < from + UNLOCK_SCAN_NODES; id++) {
    const rune = rewardOf(id).unlockRune
    if (rune && !have.includes(rune)) {
      return { nodeId: id, chapter: chapterOf(id), index: indexInChapter(id), rune }
    }
  }
  return null
})

/** Playable = cleared, current, or the one right after the best cleared. */
export const isNodeUnlocked = (id: number): boolean => id >= 1 && id <= bestNode.value + 1

export const setCurrentNode = (id: number): void => {
  const clamped = Math.max(1, Math.min(bestNode.value + 1, Math.floor(Number(id) || 1)))
  currentNode.value = clamped
  setStates({ [NODE_KEY]: clamped })
}

/** Add a rune to the roster. False when it was already there. */
export const unlockRune = (type: RuneType): boolean => {
  if (!isRuneType(type) || unlockedRunes.value.includes(type)) return false
  const next = RUNE_TYPES.filter((t) => t === type || unlockedRunes.value.includes(t))
  unlockedRunes.value = next
  setStates({ [UNLOCKED_RUNES_KEY]: next })
  return true
}

/**
 * Record a cleared node: pays the chest (once), unlocks, advances `currentNode`.
 *
 * The chest is paid ONLY the first time the node is beaten — `first` — and that
 * is read off `bestNode` BEFORE it moves. Everything the chest hands out (coins,
 * a rune, a skin) is written in one batch with the counters, then flushed: a
 * cleared node is a hard checkpoint, and a player who closes the tab on the
 * victory screen must not be asked to win it again.
 */
export const markNodeCleared = (id: number): ClearOutcome => {
  const safeId = Math.max(1, Math.floor(Number(id) || 1))
  const previousBest = bestNode.value
  const first = safeId > previousBest
  const isRecord = first
  const reward = rewardOf(safeId)

  matchesPlayed.value += 1
  wins.value += 1
  if (first) bestNode.value = safeId
  currentNode.value = safeId + 1

  let coins = 0
  let newRune: RuneType | null = null
  let newSkin: SkinId | null = null
  if (first) {
    coins = Math.max(0, Math.floor(reward.coins))
    if (coins > 0) useEconomy().addCoins(coins)
    if (reward.unlockRune && unlockRune(reward.unlockRune)) newRune = reward.unlockRune
    if (reward.unlockSkin && grantSkin(reward.unlockSkin)) newSkin = reward.unlockSkin
  }

  setStates({
    [MATCHES_KEY]: matchesPlayed.value,
    [WINS_KEY]: wins.value,
    [BEST_NODE_KEY]: bestNode.value,
    [NODE_KEY]: currentNode.value
  })
  void flushSaveNow()

  return { coins, newRune, newSkin, first, isRecord }
}

/** Record a lost match (counters only). */
export const markNodeLost = (_id: number): void => {
  matchesPlayed.value += 1
  setStates({ [MATCHES_KEY]: matchesPlayed.value })
  void flushSaveNow()
}

const useCampaign = () => ({
  currentNode, bestNode, unlockedRunes, matchesPlayed, wins, nextRuneUnlock,
  nodeConfigFor, markNodeCleared, markNodeLost, setCurrentNode, isNodeCleared, isNodeUnlocked, rewardOf, unlockRune
})
export default useCampaign
