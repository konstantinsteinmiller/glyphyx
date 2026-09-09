import {
  FACTION_DEFS, RUNE_TYPES, SKIN_IDS, SKINS, STARTING_RUNES, STARTING_SKIN,
  type Faction, type NodeConfig, type RuneType, type SkinId
} from './rules'
import { ART_CATALOGUE, allArtIds, enemyStoneIds, playerStoneIds } from './artCatalogue'
import { artOverridesEnabled, artSettled, type ArtWant } from './art'
import { getState } from '@/use/useGlyphyxState'
import { NODE_KEY, SKIN_KEY, UNLOCKED_RUNES_KEY } from '@/keys'

/**
 * ─── Staged art loading ─────────────────────────────────────────────────────
 *
 * With painted art on, an unstaged build fetches everything: ninety-six player
 * stones, sixty-four enemy stones, tiles, chips, effects, four commanders —
 * 204 files, most of them for things a first-time player will not see for
 * twenty minutes. An ember-skin orb is bought in chapter 3; a mortar is not
 * handed over until 3-1. A first-time player on a phone would pay for both at
 * node 1-1.
 *
 * So the set is staged, and the stages are DERIVED from the save rather than
 * listed: which skin is equipped, which node the player resumes to, which
 * factions that node's chapter fields. A balance change moves the art with it.
 *
 *   tier 0 — behind the splash, `fetchPriority: high`. What the FIRST SCREEN
 *            shows: the board (tiles, frame), the horizon, the HUD chips, the
 *            player's commander, the commanders of the resumed node, the
 *            stones of the player's EQUIPPED skin FOR THE RUNES THEY HAVE
 *            UNLOCKED, and the effects every resolution makes. A brand-new
 *            player holds one rune, so that is two stones behind the splash
 *            rather than sixteen — the roster is a campaign-long unlock, and
 *            tier 0 is only ever what the first screen can actually show.
 *   tier 1 — right after the splash, normal priority, ONE AT A TIME in order
 *            of need: the resumed node's own factions' stones first, then the
 *            rest of the chapter's factions, then the remaining effects, then
 *            the equipped skin's still-locked stones — those are wanted the
 *            moment a chest opens, which is the soonest a locked rune can be
 *            drawn. A slow connection gets the stones the first reveal shows
 *            before the ones three nodes away — a parallel burst would let
 *            the biggest file win.
 *   tier 2 — on an idle slot after tier 1 has settled, `fetchPriority: low`,
 *            one batch: every other skin, every other faction, the glyph
 *            icons, the other commanders. By then order no longer matters and
 *            the browser's scheduler fits them around play.
 *
 * Nothing waits on tiers 1 or 2. A painting that has not arrived when it is
 * first needed simply means the drawing stays up, exactly as with the art off.
 * And with the art off — every portal build until the paintings are in — not
 * one request is made: every tier checks the flag before it asks for anything.
 */

const uniq = (wants: ArtWant[]): ArtWant[] => {
  const seen = new Set<string>()
  return wants.filter(([k, id]) => {
    const key = `${k}/${id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** The node the player is about to play, or 1 for a new player. Any surprise → 1. */
export const resumeNode = (): number => {
  try {
    const raw = Number(getState(NODE_KEY, 1))
    return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1
  } catch { return 1 }
}

/**
 * The runes the player can actually place, or just the starting sword. Any
 * surprise → the starting roster: this decides what tier 0 fetches, and a
 * garbled blob must make the splash SHORTER, never longer.
 */
export const resumeRunes = (): RuneType[] => {
  const out: RuneType[] = []
  try {
    const raw = getState<unknown>(UNLOCKED_RUNES_KEY)
    if (Array.isArray(raw)) {
      for (const v of raw) {
        if (typeof v === 'string' && (RUNE_TYPES as readonly string[]).includes(v) && !out.includes(v as RuneType)) {
          out.push(v as RuneType)
        }
      }
    }
  } catch { /* fall through to the starting roster */ }
  for (const s of STARTING_RUNES) if (!out.includes(s)) out.push(s)
  return out
}

/** The skin the player's stones wear, or the starting skin. Any surprise → the starting skin. */
export const resumeSkin = (): SkinId => {
  try {
    const raw = getState<unknown>(SKIN_KEY, STARTING_SKIN)
    return typeof raw === 'string' && (SKIN_IDS as readonly string[]).includes(raw) ? raw as SkinId : STARTING_SKIN
  } catch { return STARTING_SKIN }
}

const ALL_FACTIONS = Object.keys(FACTION_DEFS) as Faction[]

/** The enemy factions of `config`, or every faction when the config is unknown. */
const factionsOf = (config: NodeConfig | null): Faction[] => {
  if (config) return [...new Set(config.enemies.map((e) => e.faction))]
  return ALL_FACTIONS
}

/**
 * The stones of one skin — both levels of every rune type, or only of `types`
 * when the caller has a narrower need (tier 0 passes the unlocked roster).
 */
export const skinStoneWants = (skin: SkinId, types?: readonly RuneType[]): ArtWant[] =>
  playerStoneIds()
    .filter((id) => id.includes(`-${skin}-`))
    .filter((id) => !types || types.some((t) => id.startsWith(`${t}-`)))
    .map((id): ArtWant => ['rune', id])

/** The sixteen stones of one enemy faction. */
export const factionStoneWants = (faction: Faction): ArtWant[] =>
  enemyStoneIds().filter((id) => id.includes(`-e-${faction}-`)).map((id): ArtWant => ['rune', id])

/**
 * The effects the very first resolution can make: a hit, a capture, a heal, a
 * shield, a shatter — and the laurel, which is not an effect at all but the
 * wreath every level-2 stone wears. It rides in tier 0 with the stones it sits
 * on: arriving late means a hand of Lv 2 stones bakes with the DRAWN wreath and
 * repaints when the painted one lands.
 */
const FIRST_FX: ArtWant[] = [
  ['fx', 'ring-heal'], ['fx', 'ring-shock'], ['fx', 'shield'], ['fx', 'guard'], ['fx', 'smoke'], ['fx', 'scorch'], ['fx', 'muzzle'],
  ['fx', 'laurel-pebble'],
  ['round', 'bolt']
]

/**
 * Tier 0: what the splash holds for — the first screen, and only that.
 *
 * `config` is the node the save resumes to when the caller knows it. `null`
 * fetches every commander, which is four small strips rather than one.
 */
export const criticalArtWants = (config: NodeConfig | null): ArtWant[] => uniq([
  ['bg', 'sky'], ['bg', 'ridge-far'], ['bg', 'ridge-near'],
  ['tile', 'player'], ['tile', 'enemy'], ['tile', 'neutral'], ['tile', 'frame'],
  ['ui', 'chest'], ['ui', 'ribbon'], ['ui', 'coin'], ['ui', 'forge'], ['ui', 'reroll'],
  ['hero', 'teal'],
  ...factionsOf(config).map((f): ArtWant => ['monster', FACTION_DEFS[f].avatar]),
  ...skinStoneWants(resumeSkin(), resumeRunes()),
  ['fx', `laurel-${SKINS[resumeSkin()].shape}`],
  ...FIRST_FX
])

/**
 * Tier 1: the stones the first reveals show, in order of need.
 *
 * `chapterFactions` is every faction the resumed chapter fields, resolved by
 * the caller (the campaign module is imported lazily so the loader's own chunk
 * stays small); the resumed node's own factions go first.
 */
export const earlyArtWants = (config: NodeConfig | null, chapterFactions: Faction[]): ArtWant[] => {
  const own = factionsOf(config)
  const ordered = [...own, ...chapterFactions.filter((f) => !own.includes(f))]
  // With the node unknown `own` is every faction already; the chapter adds nothing.
  return uniq([
    ...ordered.flatMap(factionStoneWants),
    ...ART_CATALOGUE.fx.map((id): ArtWant => ['fx', id]),
    ['round', 'spark'],
    // The equipped skin's still-locked stones. `artTiers` drops whatever tier 0
    // already took, so this is exactly the roster the player has not earned yet.
    ...skinStoneWants(resumeSkin())
  ])
}

/** Every painting the game can ask for, in one low-priority sweep — tier 2 is whatever the first two left. */
export const allArtWants = (): ArtWant[] => uniq(allArtIds().map(([kind, id]): ArtWant => [kind, id]))

/** The three tiers as disjoint lists, for a test and for `__art.status()`. */
export const artTiers = (config: NodeConfig | null, chapterFactions: Faction[]): [ArtWant[], ArtWant[], ArtWant[]] => {
  const t0 = criticalArtWants(config)
  const key = (w: ArtWant): string => `${w[0]}/${w[1]}`
  const seen = new Set(t0.map(key))
  const t1 = earlyArtWants(config, chapterFactions).filter((w) => !seen.has(key(w)))
  for (const w of t1) seen.add(key(w))
  const t2 = allArtWants().filter((w) => !seen.has(key(w)))
  return [t0, t1, t2]
}

/** How long the tiers will wait for the page's own load before going anyway. */
const LOAD_CEILING_MS = 5000

/** Resolve on the next idle slot, or after `timeout`, whichever comes first. */
const idle = (timeout: number): Promise<void> => new Promise<void>((resolve) => {
  const ric = (globalThis as {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
  }).requestIdleCallback
  if (typeof ric === 'function') ric(() => resolve(), { timeout })
  else setTimeout(resolve, Math.min(timeout, 1500))
})

const networkQuiet = async (): Promise<void> => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined'
    && document.readyState !== 'complete') {
    await new Promise<void>((resolve) => {
      const done = (): void => { window.removeEventListener('load', done); resolve() }
      window.addEventListener('load', done, { once: true })
      setTimeout(done, LOAD_CEILING_MS)
    })
  }
  await idle(3000)
}

const dataSaver = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return !!(navigator as { connection?: { saveData?: boolean } }).connection?.saveData
}

/**
 * The factions the resumed chapter fields, read off the campaign table. The
 * campaign module is imported lazily so a failure here only widens tier 1 to
 * every faction — never blocks it.
 */
const chapterFactionsOf = async (node: number): Promise<{ config: NodeConfig | null; factions: Faction[] }> => {
  try {
    const { nodeConfig, chapterOf, nodeId, NODES_PER_CHAPTER } = await import('./campaign')
    const chapter = chapterOf(node)
    const config = nodeConfig(node, 'medium')
    const factions = new Set<Faction>()
    for (let i = 1; i <= NODES_PER_CHAPTER; i++) {
      for (const e of nodeConfig(nodeId(chapter, i), 'medium').enemies) factions.add(e.faction)
    }
    return { config, factions: [...factions] }
  } catch {
    return { config: null, factions: ALL_FACTIONS }
  }
}

let started = false

/**
 * Tiers 1 and 2. Idempotent; call it once the splash is down. Resolves when
 * tier 1 has landed — `useAssets` sequences the SFX decode behind it so sound
 * never takes bandwidth from a stone still on the wire. With overrides off it
 * returns at once, having asked for nothing.
 */
export const preloadRemainingArt = async (): Promise<void> => {
  if (started || !artOverridesEnabled()) return
  started = true
  await networkQuiet()

  const { config, factions } = await chapterFactionsOf(resumeNode())
  const [, tier1, tier2] = artTiers(config, factions)

  // Tier 1, one at a time: the first reveal's stones before the third node's.
  for (const [kind, id] of tier1) await artSettled(kind, id)

  // Tier 2 is a courtesy on a data-saver connection, not a need — the drawn
  // field is exactly the fallback that setting asks for.
  if (dataSaver()) return
  await idle(3000)
  await Promise.allSettled(tier2.map(([kind, id]) => artSettled(kind, id, 'low')))
}

/** Test seam: forget that the tiers have run. */
export const __resetArtPreload = (): void => { started = false }
