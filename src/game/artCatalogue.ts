import { FACTION_DEFS, RUNE_TYPES, SKIN_IDS } from './rules'

/**
 * ─── Every still the renderer can ask for, by kind ──────────────────────────
 *
 * The runtime side of the drop-in manifest (`art-todo.md`, and the sheet
 * manifest in `artSheet.ts`, which is tested against this list both ways). A
 * boot-path module can read this without dragging the renderer in behind it,
 * and a Node script can read it without a browser — nothing here touches
 * `window`, `import.meta.env` or a canvas.
 */

/** Folder layout the drop-in art targets, one per drawable kind. */
export const ART_FOLDERS = {
  /**
   * Painted rune stones.
   *
   *   `<type>-<skin>-lv<1|2>`      the player's stone in that skin at that level
   *                                 (`melee-river-lv1`, `mage-ember-lv2`, …)
   *   `<type>-e-<faction>-lv<1|2>`  the enemy's stone, in the faction's own
   *                                 red-tinted rock (`archer-e-goblin-lv1`, …)
   *   `<type>`                      the glyph alone on transparency, for the
   *                                 unlock card, the campaign map, an icon
   *
   * Each a single square still. The renderer blits a stone file into exactly
   * the box `paintPebble` draws in, so a painting replaces the drawing 1:1.
   */
  rune: 'images/runes',
  /** The board's stone: `player`, `enemy`, `neutral` tiles and the nine-sliced `frame`. */
  tile: 'images/tiles',
  /**
   * Effects: rings, the shield dome, smoke, scorch, the muzzle flash, crests,
   * and `laurel-<rune>` — the gold wreath the arena lays around a level-2
   * stone, one per rune because the wreath hugs the rune's own silhouette. The
   * wreath is a LAYER of its own so all nine skins of a rune wear the SAME one;
   * see `arenaPainters.paintLaurel`. It is drawn into the stone's own box, so
   * it is blitted over the pebble sprite with no arithmetic.
   */
  fx: 'images/fx',
  /** HUD art: the reward chest, the result ribbon, the elite crown, the forge,
   *  the coin, the reroll chip, and the two conquest plaques. The plaques are the
   *  only `ui` art the DOM consumes (as a CSS `background-image`) rather than the
   *  canvas — see `ConquestCounters.vue`. */
  ui: 'images/ui',
  /** Enemy commander walk cycles, one 8-panel strip per design (228×256 per panel). */
  monster: 'images/monsters',
  /** The player's commander run cycle, one strip per outfit (192×192 per panel). */
  hero: 'images/heroes',
  /**
   * The backdrop, back to front: `sky` (one full-bleed night sky, the only
   * drawable with no transparency and no key colour — it IS the background),
   * then the two ridge bands whose sky is keyed out over it.
   */
  bg: 'images/bg',
  /** Projectiles: the archer's bolt (an 8-panel flight strip), the mage's spark. */
  round: 'images/rounds'
} as const

export type ArtKind = keyof typeof ART_FOLDERS

/** The ids of the player's stones: every type in every skin at both levels. */
export const playerStoneIds = (): string[] =>
  RUNE_TYPES.flatMap((t) => SKIN_IDS.flatMap((s) => [`${t}-${s}-lv1`, `${t}-${s}-lv2`]))

/** The ids of the enemy's stones: every type in every faction's rock at both levels. */
export const enemyStoneIds = (): string[] =>
  RUNE_TYPES.flatMap((t) => (Object.keys(FACTION_DEFS) as (keyof typeof FACTION_DEFS)[])
    .flatMap((f) => [`${t}-e-${f}-lv1`, `${t}-e-${f}-lv2`]))

export const ART_CATALOGUE: Record<ArtKind, readonly string[]> = {
  rune: [
    ...RUNE_TYPES,
    ...playerStoneIds(),
    ...enemyStoneIds()
  ],
  tile: ['player', 'enemy', 'neutral', 'frame'],
  fx: ['ring-heal', 'ring-shock', 'ring-heat', 'shield', 'guard', 'smoke', 'scorch', 'muzzle', 'crest-shield', 'crest-guard',
    // One wreath per RUNE, because the silhouette is the rune's: the skin only
    // decides how that outline is finished, and a wreath cut for a blade sits
    // half in mid-air under an axe. Derived, never listed — the roster grows.
    ...RUNE_TYPES.map((t) => `laurel-${t}`)],
  ui: ['chest', 'ribbon', 'elite', 'forge', 'coin', 'reroll', 'counter-you', 'counter-foe'],
  monster: [...new Set(Object.values(FACTION_DEFS).map((f) => f.avatar))],
  // `keeper` is the hooded figure on the loading screen — the game's mascot,
  // and the only drawable whose DRAWN form is inline SVG (it has to paint in
  // the first frame, before a request could return). No renderer probes it:
  // the build bakes the painting into the static splash as a data: URI and
  // FLogoProgress takes it from there (src/game/keeperSplash.ts).
  hero: ['teal', 'keeper'],
  bg: ['sky', 'ridge-far', 'ridge-near'],
  round: ['bolt', 'spark']
}

/** The path under `public/` a `(kind, id)` painting is probed at. */
export const artTarget = (kind: ArtKind, id: string): string => `${ART_FOLDERS[kind]}/${id}.webp`

/** Every `(kind, id)` the catalogue names, flattened, in catalogue order. */
export const allArtIds = (): (readonly [ArtKind, string])[] =>
  (Object.entries(ART_CATALOGUE) as [ArtKind, readonly string[]][])
    .flatMap(([kind, ids]) => ids.map((id) => [kind, id] as const))
