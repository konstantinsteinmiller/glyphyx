import {
  FACTION_DEFS, RUNES, RUNE_TYPES, SKINS, SKIN_IDS,
  type Faction, type Owner, type RuneType, type SkinId
} from './rules'
import { ART_CATALOGUE, artTarget, type ArtKind } from './artCatalogue'
import type { PebbleShape } from './rules'

/**
 * ─── Art sheet manifest ─────────────────────────────────────────────────────
 *
 * Glyphyx draws itself: every stone, glyph, tile and chip is a few hundred
 * canvas operations (`arenaPainters.ts`), which is wonderful for payload and
 * useless for one specific job — handing the art to somebody, or something,
 * that paints. This module describes the CONTACT SHEETS that bake the whole
 * cast onto a strict pixel lattice, so the art can leave the renderer, be
 * repainted in the game's hand-drawn mythical-fantasy style, and come back as
 * drop-in bitmaps at the paths `spriteFor()` already probes.
 *
 * THE LATTICE IS THE CONTRACT.
 *
 * Every panel is a whole number of `CELL` px on a side and sits at an exact
 * multiple of `CELL` from the sheet's origin. No gutters, no padding, no
 * centring fudge. That is what makes the return trip mechanical: a repainted
 * sheet is cut with integer arithmetic, and `sheet-index.json` says which
 * slice belongs in which file. Captions live on a SEPARATE key sheet rendered
 * from the same manifest — text inside a panel is text an image model will
 * faithfully repaint as art.
 *
 * Every sheet is a standard aspect ratio (1:1, 2:1, 4:3, 16:9) because that is
 * what an image tool can be told to return. A 5:2 sheet comes back 2:1, the
 * grid is re-composed, and every rect in the index is wrong.
 *
 * PROMPTS ARE GENERATED, NEVER HAND-WRITTEN. One style block, one background
 * rule, per-panel text only where the panel genuinely differs — so forty
 * assets brief one art direction. Adding a drawable is adding a manifest line;
 * its prompt exists the moment `pnpm art:prompts` runs.
 *
 * Nothing here imports a canvas, Vue, or `import.meta.env`: the manifest says
 * WHAT goes in each panel and WHERE the result belongs, `ArtSheets.vue` knows
 * how to paint it, and `tools/art-prompts.mjs` reads this file under plain Node.
 */

/** Lattice unit, px. Every panel is a whole number of these on both axes. */
export const CELL = 256
/** Edge of a single-object reference, px. */
export const SINGLE_SIZE = 512
/** The slicer's default cap on a written frame, px. A manifest `maxEdge` may only lower it. */
export const MAX_EDGE = 256
/**
 * How much of its panel a stone's ink occupies, as a fraction of the panel's
 * width — the NOMINAL value, used in a prompt when no measured fit exists yet.
 * The bench measures the real extent off the painter and the index carries it.
 */
export const STONE_SPAN = 0.82

// ─── What a panel holds ─────────────────────────────────────────────────────

export type CellArt =
  | { kind: 'pebble'; type: RuneType; level: 1 | 2; owner: 'player' | 'enemy'; skin: SkinId; faction?: Faction }
  | { kind: 'glyph'; type: RuneType; skin: SkinId }
  | { kind: 'tile'; owner: Owner; faction?: Faction }
  | { kind: 'frame' }
  | { kind: 'forge' }
  | { kind: 'reroll' }
  | { kind: 'spark' }
  | { kind: 'laurel'; shape: PebbleShape }
  | { kind: 'sky' }
  | { kind: 'bolt' }
  | { kind: 'ridge'; layer: 'far' | 'near' }
  /** An existing bitmap under `public/`, letterboxed into the panel. */
  | { kind: 'bitmap'; src: string }
  | { kind: 'blank' }

export interface SheetCell {
  /** Stable identity. Never reused across sheets; the slice's filename stem. */
  id: string
  /** Key-sheet caption, roughly twelve characters. */
  label: string
  /** Second caption line — the level, the material, the faction. */
  sub: string
  /** One sentence saying what this object IS, for the painter. Empty on a blank. */
  blurb: string
  /** The colour identity handed to the painter — hue words first, hex as a hint. */
  colour?: string
  /** Lattice coordinates and footprint, in cells, from the sheet's top-left. */
  col: number
  row: number
  cw: number
  ch: number
  /** Where a repainted slice belongs on disk, relative to `public/`. Absent on a blank. */
  target?: string
  /**
   * The drawing fills its panel edge to edge (a tile, the frame). The slicer
   * trims such a slice back to its own edges instead of keying a margin, and
   * the prompt asks for square corners and no air.
   */
  fill?: boolean
  /** Lower cap than `MAX_EDGE` for a thing drawn small in play. */
  maxEdge?: number
  /** A native size the slice must be restored to (a non-square bitmap letterboxed into its panel). */
  letterboxed?: { w: number; h: number }
  note?: string
  art: CellArt
}

export type SheetKind = 'stones' | 'enemyStones' | 'glyphs' | 'tiles' | 'frame' | 'ui' | 'fx'

export interface SheetSpec {
  id: string
  /** Base filename, without extension: `sheet-<id>`. */
  file: string
  title: string
  kind: SheetKind
  /** Lattice width, in cells. Height is derived from the cells. */
  cols: number
  /** One paragraph on what this sheet is for — the README and the prompt's WHAT IT IS. */
  brief: string
  /** The READ THE PANELS paragraph: which panel is which, when the grid has a meaning. */
  panels?: string
  cells: SheetCell[]
}

/** Lattice height of a sheet, in cells. */
export const sheetRows = (s: SheetSpec): number => s.cells.reduce((m, c) => Math.max(m, c.row + c.ch), 0)
/** Pixel size of a clean sheet. */
export const sheetSize = (s: SheetSpec): { w: number; h: number } => ({ w: s.cols * CELL, h: sheetRows(s) * CELL })
/** `w:h` reduced, e.g. `2:1`, `4:3`. */
export const aspectOf = (w: number, h: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const g = gcd(w, h)
  return `${w / g}:${h / g}`
}

// ─── Words for the painter ──────────────────────────────────────────────────

const RUNE_WORDS: Record<RuneType, { name: string; glyph: string; hue: string }> = {
  melee: { name: 'Sword', glyph: 'a straight sword point-up: tapered blade, cross-guard, grip, round pommel', hue: 'crimson' },
  archer: { name: 'Bow', glyph: 'a bow with the string drawn and an arrow nocked, flying to the right', hue: 'emerald' },
  mage: { name: 'Orb', glyph: 'an arcane orb: a solid core inside a ring, four diagonal sparks', hue: 'amethyst violet' },
  defense: { name: 'Shield', glyph: 'a heater shield with a cross cut out of its face', hue: 'sapphire blue' },
  support: { name: 'Cross', glyph: 'a radiant cross, four flared arms and a small burst at the centre', hue: 'topaz gold' },
  cleave: { name: 'Axe', glyph: 'a broad axe, bit upward: a wide crescent blade with drooping horns on a short haft with a round pommel', hue: 'burnt orange' },
  roller: { name: 'Boulder', glyph: 'a chipped round boulder mid-roll, two cracks knocked out of it and two short speed bars trailing behind it', hue: 'cold teal' },
  bombard: { name: 'Mortar', glyph: 'a squat mortar canted up to the right on a heavy base plate, its bore open, one shell already in the air above the muzzle', hue: 'hot magenta' },
  nuker: { name: 'Warhead', glyph: 'a three-bladed hazard trefoil: a solid round core with three heavy wedge blades spaced evenly around it, a clear ring of empty space between the core and the blades', hue: 'acid yellow-green' }
}

const SKIN_WORDS: Record<SkinId, { name: string; material: string; shape: string; cut: string }> = {
  river: {
    name: 'River',
    material: 'warm river sandstone, tan and beige, faintly banded',
    shape: 'an irregular rounded pebble with a couple of chipped facets',
    cut: 'the glyph is CUT INTO the stone, a dark engraved groove lit from inside by its own colour'
  },
  obsidian: {
    name: 'Obsidian',
    material: 'black volcanic glass, knapped, with glassy conchoidal chips catching a cold rim light',
    shape: 'an angular shard, straight-edged, faceted',
    cut: 'the glyph is a cold neon line drawn on the dark glass'
  },
  jade: {
    name: 'Jade',
    material: 'polished green jade, translucent at the edges, faint cloudy veins',
    shape: 'a smooth oval, egg-like, no facets',
    cut: 'the glyph is INLAID in gold, a thin bevelled gold line set flush into the jade'
  },
  amber: {
    name: 'Amber',
    material: 'cut amber, honey to orange, with small dark inclusions trapped inside',
    shape: 'a hexagonal gem with a flat table and bevelled facets',
    cut: 'the glyph glows from INSIDE the gem, a warm light trapped in the amber'
  },
  marble: {
    name: 'Marble',
    material: 'white marble with grey veins, softly polished',
    shape: 'a flat coin-like disc with a rounded edge',
    cut: 'the glyph is CARVED deep, a shadowed groove with no glow at all'
  },
  ember: {
    name: 'Ember',
    material: 'a slab of cooled lava, black-brown crust cracked into plates',
    shape: 'a rounded rectangular slab, thick, cracked',
    cut: 'the glyph BURNS through the fissures, orange ember light in the cracks'
  }
}

const FACTION_WORDS: Record<Faction, { name: string; rock: string; accent: string }> = {
  skeleton: { name: 'Bone Dummies', rock: 'rust-red sandstone, dusty and dry', accent: 'bleached bone-white' },
  goblin: { name: 'Goblin Archers', rock: 'rust-red sandstone with a mossy tint in the cracks', accent: 'acid green' },
  orc: { name: 'Orc Berserkers', rock: 'dark blood-red rock, heavy and rough', accent: 'ember orange' },
  undead: { name: 'Undead Mages', rock: 'ashen maroon stone with a cold sheen', accent: 'pale violet' }
}

const muted = (hex: string, hue: string): string => `${hue} (about ${hex}, kept muted and paper-toned, never neon)`

/** The colour line for a player's stone. */
const stoneColour = (type: RuneType, skin: SkinId): string => {
  const s = SKINS[skin]
  const w = SKIN_WORDS[skin]
  const glow = s.glow ? `its glow around ${s.glow}` : `its glow the rune's own ${RUNE_WORDS[type].hue} (${RUNES[type].color})`
  return `${w.material}: lit face around ${s.hi}, body ${s.base}, shadow side ${s.lo}, rim light ${s.rim}. `
    + `Glyph ink ${s.ink}, ${glow}.`
}

/** The colour line for an enemy's stone: the faction's rock, the rune's glow. */
const enemyStoneColour = (type: RuneType, faction: Faction): string => {
  const f = FACTION_WORDS[faction]
  return `${f.rock}; a thin ${f.accent} accent on the rim (the faction's colour, about ${FACTION_DEFS[faction].color}). `
    + `Glyph ink near-black, glowing ${muted(RUNES[type].color, RUNE_WORDS[type].hue)}.`
}

// ─── The sheets ─────────────────────────────────────────────────────────────

const blank = (col: number, row: number, n: number): SheetCell =>
  ({ id: `blank-${n}`, label: '', sub: '', blurb: '', col, row, cw: 1, ch: 1, art: { kind: 'blank' } })

/** One sheet per rune TYPE: six skins × two levels on a 4×3 grid (4:3). */
const stoneSheet = (type: RuneType): SheetSpec => {
  const w = RUNE_WORDS[type]
  const cells: SheetCell[] = []
  let i = 0
  for (const skin of SKIN_IDS) {
    for (const level of [1, 2] as const) {
      const id = `${type}-${skin}-lv${level}`
      cells.push({
        id,
        label: SKIN_WORDS[skin].name,
        sub: `Lv ${level}`,
        blurb: `the ${w.name} rune as a ${SKIN_WORDS[skin].name} stone at level ${level}: `
          + `${SKIN_WORDS[skin].shape}, ${SKIN_WORDS[skin].cut}`
          + (level === 2
            ? '; a heavier, slightly larger stone, ringed by a gold rim with a small gold crest on its shoulder, the glyph glowing stronger'
            : ''),
        colour: stoneColour(type, skin),
        col: i % 4, row: Math.floor(i / 4), cw: 1, ch: 1,
        target: artTarget('rune', id),
        art: { kind: 'pebble', type, level, owner: 'player', skin }
      })
      i++
    }
  }
  return {
    id: `runes-${type}`,
    file: `sheet-runes-${type}`,
    title: `${w.name} stones — the player's six skins`,
    kind: 'stones',
    cols: 4,
    brief: `The player's ${w.name} rune, cut into each of the six stone skins the shop sells, at level 1 and level 2. `
      + `The glyph is ${w.glyph}, in ${w.hue}; it is the SAME glyph in every panel — the same rune carved into six different materials.`,
    panels: 'Read the grid two panels at a time: each PAIR of neighbouring panels is one material, first at level 1 then at level 2. '
      + `Left to right, top to bottom: ${SKIN_IDS.map((s) => SKIN_WORDS[s].name).join(', ')} — each as Lv 1 then Lv 2. `
      + 'A level-2 stone is the same material and the same glyph, a little larger and heavier, with a gold rim, a small gold crest on its shoulder and a stronger glow.',
    cells
  }
}

/** One sheet per rune TYPE for the enemy: four factions × two levels on a 4×2 grid (2:1). */
const enemyStoneSheet = (type: RuneType): SheetSpec => {
  const w = RUNE_WORDS[type]
  const cells: SheetCell[] = []
  let i = 0
  for (const faction of Object.keys(FACTION_DEFS) as Faction[]) {
    for (const level of [1, 2] as const) {
      const id = `${type}-e-${faction}-lv${level}`
      cells.push({
        id,
        label: FACTION_WORDS[faction].name,
        sub: `Lv ${level}`,
        blurb: `the enemy's ${w.name} rune as a ${FACTION_WORDS[faction].name} stone at level ${level}: `
          + 'an irregular rounded pebble of the faction\'s own rock, the glyph cut in and glowing'
          + (level === 2
            ? '; heavier and slightly larger, a dull-gold rim and a small dull-gold crest on its shoulder, the glyph glowing stronger'
            : ''),
        colour: enemyStoneColour(type, faction),
        col: i % 4, row: Math.floor(i / 4), cw: 1, ch: 1,
        target: artTarget('rune', id),
        art: { kind: 'pebble', type, level, owner: 'enemy', skin: 'river', faction }
      })
      i++
    }
  }
  return {
    id: `runes-enemy-${type}`,
    file: `sheet-runes-enemy-${type}`,
    title: `${w.name} stones — the four enemy factions`,
    kind: 'enemyStones',
    cols: 4,
    brief: `The enemy's ${w.name} rune, one stone per faction, at level 1 and level 2. Every enemy stone is RED-TINTED rock so a player tells `
      + `it from their own at a glance; the glyph is ${w.glyph}, in ${w.hue}, the same glyph in every panel.`,
    panels: 'Each PAIR of neighbouring panels is one faction, first at level 1 then at level 2. '
      + `Left to right, top to bottom: ${(Object.keys(FACTION_DEFS) as Faction[]).map((f) => FACTION_WORDS[f].name).join(', ')}.`,
    cells
  }
}

const glyphSheet = (): SheetSpec => {
  // Nine runes tile a THREE-wide grid exactly — three rows of three, a square
  // sheet. The grid was 4 wide while the roster was eight; keeping it there
  // would have left three blank panels on the last row, and a blank panel is
  // the thing these prompts most often lose (an image model fills it in). The
  // width is chosen to fit the roster, not the other way round.
  const COLS = 3
  const cells: SheetCell[] = RUNE_TYPES.map((type, i) => ({
    id: type,
    label: RUNE_WORDS[type].name,
    sub: 'glyph icon',
    blurb: `the ${RUNE_WORDS[type].name} glyph ALONE, no stone: ${RUNE_WORDS[type].glyph}, one bold flat pictogram`,
    colour: `ink ${SKINS.river.ink} with a tight ${muted(RUNES[type].color, RUNE_WORDS[type].hue)} glow`,
    col: i % COLS, row: Math.floor(i / COLS), cw: 1, ch: 1,
    target: artTarget('rune', type),
    art: { kind: 'glyph', type, skin: 'river' }
  }))
  return {
    id: 'glyphs',
    file: 'sheet-glyphs',
    title: 'Glyph icons — the nine runes, no stone',
    kind: 'glyphs',
    cols: COLS,
    brief: 'The nine rune glyphs on their own, as UI icons: the unlock card, the campaign map and the shop show a rune without its stone. '
      + 'Bold, flat, one strong silhouette each, readable at 24 px. Every panel carries a glyph — none is blank.',
    cells
  }
}

const tileSheet = (): SheetSpec => ({
  id: 'tiles',
  file: 'sheet-tiles',
  title: 'Board tiles — player, enemy, neutral',
  kind: 'tiles',
  cols: 2,
  brief: 'One square floor tile of the arena in each of its three states. The board is a 4×4 grid of these; the owner\'s tint is the '
    + 'difference between them. Each tile fills its panel edge to edge with square corners — they sit side by side in play.',
  panels: 'Top-left: a tile the PLAYER holds (a cool teal-blue glow in its bevel). Top-right: a tile the ENEMY holds (a hot red-magenta glow). '
    + 'Bottom-left: an unclaimed NEUTRAL tile (plain slate with a faint violet edge light). Bottom-right is blank on purpose.',
  cells: [
    {
      id: 'player', label: 'Player tile', sub: 'teal glow',
      blurb: 'a square slate floor tile with a bevelled edge and a few faint cracks, its bevel lit teal-blue because the player holds it',
      colour: 'dark blue-grey slate around #23283a, bevel light teal-blue around #4fd6ff, a violet edge glow around #8a5cff',
      col: 0, row: 0, cw: 1, ch: 1, target: artTarget('tile', 'player'), fill: true,
      art: { kind: 'tile', owner: 'player' }
    },
    {
      id: 'enemy', label: 'Enemy tile', sub: 'red glow',
      blurb: 'the same slate tile, its bevel lit hot red-magenta because the enemy holds it',
      colour: 'dark blue-grey slate around #23283a, bevel light red around #ff4d5a, a violet edge glow around #8a5cff',
      col: 1, row: 0, cw: 1, ch: 1, target: artTarget('tile', 'enemy'), fill: true,
      art: { kind: 'tile', owner: 'enemy' }
    },
    {
      id: 'neutral', label: 'Neutral tile', sub: 'unclaimed',
      blurb: 'the same slate tile unclaimed: plain, with only the faint violet edge light of the arena grid',
      colour: 'dark blue-grey slate around #23283a with a faint violet edge glow around #8a5cff',
      col: 0, row: 1, cw: 1, ch: 1, target: artTarget('tile', 'neutral'), fill: true,
      art: { kind: 'tile', owner: 'neutral' }
    },
    blank(1, 1, 1)
  ]
})

const frameSheet = (): SheetSpec => ({
  id: 'frame',
  file: 'sheet-frame',
  title: 'The board frame',
  kind: 'frame',
  cols: 4,
  brief: 'The carved stone frame around the 4×4 board: a square RING of weathered sandstone with runic ornament in the corners and a '
    + 'plain repeatable band along the middle of each side. The inside of the ring is EMPTY — the tiles show through it. It is '
    + 'nine-sliced at the outer 12 %, so the corners are the ornament and the sides must stretch.',
  cells: [{
    id: 'frame', label: 'Frame', sub: 'nine-sliced ring',
    blurb: 'a square ring of carved sandstone, ornamented at the four corners, plain along the sides, EMPTY in the middle',
    colour: 'warm sandstone around #b39b73, lit edge #d9c9a6, shadow #7d6547, faint violet rune light in the corner carvings around #8a5cff',
    col: 0, row: 0, cw: 4, ch: 4, target: artTarget('tile', 'frame'), fill: true,
    maxEdge: 1024,
    note: 'Written at 1024 px: the frame is the largest thing on screen and is stretched by CSS-style nine-slicing.',
    art: { kind: 'frame' }
  }]
})

const bitmap = (id: string, folder: ArtKind, label: string, sub: string, blurb: string, colour: string,
  col: number, row: number, cw = 1, ch = 1, native?: { w: number; h: number }, maxEdge?: number): SheetCell => ({
  id, label, sub, blurb, colour, col, row, cw, ch,
  target: artTarget(folder, id),
  ...(native ? { letterboxed: native } : {}),
  ...(maxEdge ? { maxEdge } : {}),
  art: { kind: 'bitmap', src: artTarget(folder, id) }
})

const uiSheet = (): SheetSpec => ({
  id: 'ui',
  file: 'sheet-ui',
  title: 'HUD chips — chest, crown, coin, forge, reroll, ribbon',
  kind: 'ui',
  cols: 4,
  brief: 'The HUD\'s small pictures: the reward chest, the elite crown, the coin, the Rune Forge chip, the reroll stone and the result '
    + 'ribbon. Each is a single object on flat magenta; the ribbon is the one wide panel.',
  panels: 'Top row: chest, crown, coin, forge. Bottom row: the reroll chip, then the ribbon spanning the last three panels.',
  cells: [
    bitmap('chest', 'ui', 'Chest', 'reward', 'a closed wooden treasure chest with iron bands and a gold lock, seen from the front, slightly above',
      'dark oak around #5a3a1e, iron bands #3a3f4a, gold fittings #e6b84a', 0, 0),
    bitmap('crown', 'ui', 'Crown', 'elite mark', 'a small gold crown with three points and a red jewel, a badge not a portrait',
      'gold around #e6b84a with a ruby around #d8283c', 1, 0),
    bitmap('coin', 'ui', 'Coin', 'currency', 'a single gold coin seen face-on with a rune stamped into it',
      'gold around #f2c14e, shadow #9a6a12', 2, 0),
    {
      id: 'forge', label: 'Forge', sub: 'offline chip',
      blurb: 'the Rune Forge chip: a small stone anvil with a glowing rune resting on it, a chip-sized emblem',
      colour: 'dark iron anvil around #3a3f4a on a sandstone base around #b39b73, the rune glowing violet around #8a5cff',
      col: 3, row: 0, cw: 1, ch: 1, target: artTarget('ui', 'forge'), art: { kind: 'forge' }
    },
    {
      id: 'reroll', label: 'Reroll', sub: 'hand chip',
      blurb: 'the reroll chip: a small blank river pebble with two curved arrows chasing each other around its face, no text',
      colour: 'river sandstone around #b39b73, arrows in pale teal around #4fd6ff',
      col: 0, row: 1, cw: 1, ch: 1, target: artTarget('ui', 'reroll'), art: { kind: 'reroll' }
    },
    bitmap('ribbon', 'ui', 'Ribbon', 'result banner', 'a wide heraldic ribbon banner, its ends folded and notched, the middle a plain band (a caption is printed over it in play — leave it EMPTY)',
      'deep crimson cloth around #a8232f with gold edging around #e6b84a', 1, 1, 3, 1, { w: 597, h: 256 })
  ]
})

const fxSheet = (): SheetSpec => {
  const fx = (id: string, label: string, blurb: string, colour: string, i: number, native?: { w: number; h: number }, maxEdge?: number): SheetCell =>
    bitmap(id, 'fx', label, 'effect', blurb, colour, i % 6, Math.floor(i / 6), 1, 1, native, maxEdge)
  const LAUREL_STONE: Record<PebbleShape, string> = {
    pebble: 'a rounded river pebble', shard: 'an angular knapped shard', oval: 'a wide smooth oval',
    hex: 'a hexagonal cut gem', disc: 'a round flat disc', slab: 'a rounded rectangular slab'
  }
  const laurel = (shape: PebbleShape, i: number): SheetCell => ({
    id: `laurel-${shape}`, label: `Laurel · ${shape}`, sub: 'Lv 2 wreath',
    blurb: `the level-2 laurel for ${LAUREL_STONE[shape]}: a gold laurel wreath of two leafy branches curving up from a small tie at the bottom, `
      + 'OPEN at the top like a horseshoe, its branches hugging the FOOT of that stone shape (the drawn reference shows exactly where they sit) — '
      + 'the game lays it around an upgraded rune stone of that shape, so paint the wreath ALONE with nothing inside it and nothing behind it: '
      + 'no stone, no shield, no medal, no ribbon banner, no glyph',
    colour: 'polished gold, light #ffefb0 through #e6b53a to a deep #a8741a, with a dark #5a3a06 edge',
    col: i % 6, row: Math.floor(i / 6), cw: 1, ch: 1, target: artTarget('fx', `laurel-${shape}`), art: { kind: 'laurel', shape }
  })
  return {
    id: 'fx',
    file: 'sheet-fx',
    title: 'Effects — rings, dome, smoke, scorch, flashes, the six Lv 2 laurels',
    kind: 'fx',
    cols: 6,
    brief: 'The arena\'s effects: three shockwave rings, the shield dome, the absorb flash, the smoke puff, the scorch mark a shattered '
      + 'rune leaves, the archer\'s muzzle flash, two crests, the mage beam\'s travelling spark, the archer\'s arrow, and six gold laurels — one per '
      + 'stone silhouette — the game lays around a level-2 stone. Soft light on flat magenta — every glow must stay TIGHT to its own shape, because a halo over '
      + 'magenta cannot be keyed.',
    cells: [
      fx('ring-heal', 'Heal ring', 'a thin expanding ring of soft golden light seen from above, brightest at the rim', 'warm gold around #ffd23f', 0),
      fx('ring-shock', 'Shock ring', 'a thin expanding ring of white-blue impact light, the capture shockwave', 'cold white-blue around #cfe9ff', 1),
      fx('ring-heat', 'Heat ring', 'a thicker ring of violet-orange heat with a few sparks, the level-2 orb\'s burst', 'violet core around #b57bff to orange edge around #ff8a3d', 2),
      fx('shield', 'Dome', 'a translucent hemispherical dome of blue light with faint hexagonal facets', 'sapphire blue around #4aa8ff', 3),
      fx('guard', 'Absorb', 'a short bright flash where a hit meets a shield: a starburst of blue light', 'sapphire blue around #4aa8ff to white', 4),
      fx('smoke', 'Smoke', 'a soft round puff of dust, a single cloud, no ground', 'neutral warm grey around #c9bfae', 5, { w: 192, h: 192 }),
      fx('scorch', 'Scorch', 'a dark scorch mark with cracked edges, the stain a shattered rune leaves on a tile, seen from above', 'near-black soot around #14100c with an ember rim around #ff5a1f', 6, { w: 261, h: 144 }),
      fx('muzzle', 'Muzzle', 'a small bright flash with three short rays, the archer\'s release', 'pale emerald-white around #b8ffd6', 7, undefined, 128),
      fx('crest-shield', 'Crest S', 'a small heraldic crest: a shield emblem, one flat badge', 'sapphire blue around #4aa8ff, gold rim', 8, undefined, 128),
      fx('crest-guard', 'Crest G', 'a small heraldic crest: a guard emblem, one flat badge', 'topaz gold around #ffd23f, dark rim', 9, undefined, 128),
      {
        id: 'spark', label: 'Spark', sub: 'beam round',
        blurb: 'the mage beam\'s travelling spark: a small bright violet star with a short trail, flying to the RIGHT',
        colour: 'white core, violet around #b57bff, kept tight',
        col: 4, row: 1, cw: 1, ch: 1, target: artTarget('round', 'spark'), maxEdge: 128, art: { kind: 'spark' }
      },
      laurel('pebble', 11), laurel('shard', 12), laurel('oval', 13), laurel('hex', 14), laurel('disc', 15), laurel('slab', 16),
      {
        id: 'bolt', label: 'Bolt', sub: 'arrow in flight',
        blurb: 'the archer\'s arrow in flight, seen from the side and flying to the RIGHT: a straight ash shaft, a broad iron '
          + 'head at the right end, two emerald fletching vanes at the left end, and a short faint speed streak trailing off '
          + 'behind the nock — ONE arrow lying flat and level across the panel, not a bundle, not a quiver, not a bow',
        colour: 'ash shaft around #b1935f, iron head around #8e98a6, emerald vanes around #35e07a, the streak pale mint #b8ffd6',
        col: 5, row: 2, cw: 1, ch: 1, target: artTarget('round', 'bolt'),
        // The sprite ships 4:1: the panel is square, the arrow is drawn into
        // the middle of it, and the slicer trims the padding back off.
        letterboxed: { w: 256, h: 64 }, art: { kind: 'bolt' }
      }
    ]
  }
}

export const SHEETS: SheetSpec[] = [
  ...RUNE_TYPES.map(stoneSheet),
  ...RUNE_TYPES.map(enemyStoneSheet),
  glyphSheet(),
  tileSheet(),
  frameSheet(),
  uiSheet(),
  fxSheet()
]

// ─── Walk cycles: the strips that already ship as bitmaps ───────────────────

export interface WalkSpec {
  kind: 'monster' | 'hero' | 'round'
  id: string
  file: string
  target: string
  name: string
  blurb: string
  colour?: string
  /** The strip that ships today — the reference is that strip laid out as a grid. */
  src: string
  frames: number
  cols: number
  rows: number
  panelW: number
  panelH: number
  w: number
  h: number
  faces: 'left' | 'right'
  anchor: 'feet' | 'centre'
}

const walk = (kind: WalkSpec['kind'], id: string, name: string, blurb: string, colour: string | undefined,
  panelW: number, panelH: number, faces: 'left' | 'right', anchor: 'feet' | 'centre'): WalkSpec => ({
  kind, id, name, blurb, colour,
  file: `walk-${id}`,
  target: artTarget(kind, id),
  src: artTarget(kind, id),
  frames: 8, cols: 4, rows: 2,
  panelW, panelH, w: panelW * 4, h: panelH * 2,
  faces, anchor
})

export const WALKS: WalkSpec[] = [
  walk('monster', 'bonecap', 'Bone Dummies commander',
    'a small skeleton in a cracked bone cap, shambling, a training dummy of a warrior', 'bone white around #d9d9e8, cap shadow #6c6c80', 228, 256, 'left', 'feet'),
  walk('monster', 'nibbler', 'Goblin Archers commander',
    'a wiry goblin archer with a short bow on its back and a wide grin, scampering', 'goblin green around #8dff5a with a brown leather jerkin', 228, 256, 'left', 'feet'),
  walk('monster', 'snaggletusk', 'Orc Berserkers commander',
    'a broad orc with one snagged tusk, a cleaver in hand, stomping', 'orc hide around #ff5a3d muted to brick, iron cleaver', 228, 256, 'left', 'feet'),
  walk('monster', 'marrowknight', 'Undead Mages commander',
    'a gaunt undead knight in tattered robes, a violet flame in one hand, gliding', 'ashen robes around #c98cff muted to mauve', 228, 256, 'left', 'feet'),
  walk('hero', 'teal', 'The player\'s commander',
    'a young rune-keeper in a teal cloak with a satchel of stones, running', 'teal cloak around #2fb8a8, sandstone satchel', 192, 192, 'right', 'feet'),
]

// The archer's arrow was here, as an eight-panel flight strip. It is a single
// still on the fx sheet now (`fx` → `round/bolt`). Two reasons, and both are
// general: the renderer blits it as ONE image rotated to the heading, so a
// strip arrived as a ribbon of eight arrows laid along the shot; and an arrow
// in flight has nothing to animate — the movement is the simulation's, not a
// cycle's. Asking for eight consistent arrows got eight different ones.

// ─── Scenery: the two ridge bands ───────────────────────────────────────────

export interface SceneryAsset {
  id: string
  file: string
  target: string
  name: string
  blurb: string
  /**
   * What DRAWS the reference. It used to be `src` — the bitmap that already
   * shipped — which is fine for a restyle and wrong for a re-subject: the two
   * ridges were the previous game's graveyard silhouettes, and a restyle of a
   * graveyard is a graveyard. They are painted by the game now (`kind: 'ridge'`),
   * so the reference carries the rune world the prompt only claims.
   */
  art: CellArt
  w: number
  h: number
  tileable: boolean
  /**
   * What the slicer does with the ground the artwork sits on.
   *
   * `magenta-sky` — a band: the sky along the TOP edge is keyed out and the
   * rock runs to the bottom edge (the flood may only seed from the top, or it
   * eats the range from the base up).
   * `opaque` — the whole image IS the artwork, edge to edge. Nothing is keyed,
   * nothing is trimmed, and a solid rectangle is the correct answer rather
   * than a warning.
   */
  bg: 'magenta-sky' | 'opaque'
}

export const SCENERY: SceneryAsset[] = [
  {
    id: 'sky', file: 'bg-sky', target: artTarget('bg', 'sky'),
    name: 'The night sky',
    blurb: 'the night sky over a rune world, seen from the ground: deep indigo shading to near-black at the bottom, a pale full moon '
      + 'high on the RIGHT with a soft halo, a violet aurora drifting across the upper left, a scatter of small stars, and a faint '
      + 'violet haze along the bottom where the mountains will stand. No ground, no mountains, no buildings, no birds, no lettering '
      + 'and NOTHING in the middle of the picture — the game board covers it',
    w: 1024, h: 576, tileable: false, bg: 'opaque', art: { kind: 'sky' }
  },
  {
    id: 'ridge-far', file: 'bg-ridge-far', target: artTarget('bg', 'ridge-far'),
    name: 'The far ridge',
    blurb: 'a distant mountain ridge in silhouette, hazy and blue with moonlight catching its top edge, three tall stone pinnacles '
      + 'standing above the skyline; the sky above it is empty',
    w: 1024, h: 256, tileable: false, bg: 'magenta-sky', art: { kind: 'ridge', layer: 'far' }
  },
  {
    id: 'ridge-near', file: 'bg-ridge-near', target: artTarget('bg', 'ridge-near'),
    name: 'The near ridge',
    blurb: 'a nearer ridge of broken black rock, its base running along the bottom edge, with five standing rune monoliths on it — '
      + 'rough megaliths the size of towers, two of them carved with a glowing violet glyph; the sky above it is empty',
    w: 1024, h: 256, tileable: false, bg: 'magenta-sky', art: { kind: 'ridge', layer: 'near' }
  }
]

// ─── Singles: one object per generation ─────────────────────────────────────
//
// An image model will not hold a lattice while it repaints; it re-composes.
// A sheet is the cheap route and a single is the sturdy one: one object, one
// image, nothing to drift. Every targeted panel can be exported as a single.

export interface SingleSpec {
  id: string
  file: string
  sheet: string
  cell: SheetCell
}

export const SINGLES: SingleSpec[] = SHEETS.flatMap((s) =>
  s.cells.filter((c) => c.target).map((c) => ({ id: c.id, file: `single-${c.id}`, sheet: s.id, cell: c })))

// ─── Every drawable, for the parity tests and the preload ───────────────────

/** Every `(kind, id)` this manifest gives a target to, with the file it comes from. */
export const manifestTargets = (): Map<string, { kind: ArtKind; id: string; from: string }> => {
  const out = new Map<string, { kind: ArtKind; id: string; from: string }>()
  const kindOf = (target: string): ArtKind => {
    const folder = target.slice(0, target.lastIndexOf('/'))
    const hit = (Object.entries(ART_CATALOGUE) as [ArtKind, readonly string[]][])
      .map(([k]) => k).find((k) => artTarget(k, 'x').startsWith(`${folder}/`))
    if (!hit) throw new Error(`no art kind owns ${target}`)
    return hit
  }
  const put = (target: string, from: string): void => {
    const id = target.slice(target.lastIndexOf('/') + 1).replace(/\.webp$/, '')
    out.set(target, { kind: kindOf(target), id, from })
  }
  for (const s of SHEETS) for (const c of s.cells) if (c.target) put(c.target, s.file)
  for (const w of WALKS) put(w.target, w.file)
  for (const a of SCENERY) put(a.target, a.file)
  return out
}

// ─── The master prompt ──────────────────────────────────────────────────────
//
// One style block for the whole game, so a hundred assets brief one art
// direction. Prohibitions are written from what actually comes back wrong,
// because a stated negative beats another adjective about what is wanted.

const STYLE_HEAD = [
  'STYLE — hand-drawn, stylized MYTHICAL FANTASY, like a plate from an illuminated',
  'bestiary or a hand-painted board-game piece. Match this in every panel:',
  '· INK FIRST. Visible hand-drawn contour lines in dark warm umber, the line',
  '  weight varying like a real pen, a little uneven. The drawing should look',
  '  DRAWN, with the linework still showing through the paint.',
  '· PAINTERLY WASHES inside the lines — gouache and watercolour with visible',
  '  brush texture, softly mottled, a gentle sense of volume from ONE light',
  '  (top-left), a warm rim light on the shadow side. No airbrush, no gloss.',
  '· CHUNKY, READABLE SILHOUETTES. Every object is one strong shape that reads',
  '  at thumbnail size; small detail is suggested with a few confident marks.',
  '· PALETTE: warm sandstone, ochre, umber and slate, earthy and slightly',
  '  desaturated — with the arcane accents (the glyph glows, the violet grid',
  '  light) as the ONLY saturated notes. Rich, not candy-bright.',
  '· Mythic, weathered, a little worn: chipped edges, hairline cracks, dust in',
  '  the grooves. Charming craft rather than slick rendering.',
  '',
  'AVOID — this is exactly how earlier attempts went wrong:',
  '· NO glossy, plasticky, airbrushed mobile-game look. No bevelled plastic',
  '  edges, no smooth 3D-rendered shading, no lens flares.',
  '· NO photorealism and no vector-flat icon look either — it is a painting.',
  '· NO heavy uniform black outlines, no hard cel-shaded banding.',
  '· NO text, letters, numbers, runes-as-alphabet, watermarks or captions.',
  '· NO neon-bright saturation outside the glyph glow. If a stone looks vivid,',
  '  it is wrong; if the GLOW looks vivid, that part is right.'
]

const STYLE_TAIL = [
  '· Do not invent content for a panel that is blank in the reference. Leave',
  '  it blank — flat magenta and nothing else.',
  '· Keep each object the same subject and silhouette it already has. This is',
  '  a RESTYLE, not a redesign: the reference decides what is there.'
]

/**
 * The one clause every stone prompt carries about the wreath.
 *
 * The laurel is a LAYER (`fx/laurel`, `arenaPainters.paintLaurel`): the game
 * lays one painted wreath around every level-2 stone. It used to be words in
 * the stone prompt instead — "a small gold laurel emblem set into its lower
 * rim" — a thing no reference panel drew, so each generation designed its own
 * and the Sword sheet's wreath had nothing to do with the Bow sheet's. Now the
 * stones must come back WITHOUT one, or the composite lays a wreath on a
 * wreath.
 */
export const NO_LAUREL = '· NO laurel wreath, no leafy branches, no ribbon, banner, badge or medal\n'
  + '  around the stone. The game lays its own gold wreath around a level-2\n'
  + '  stone afterwards; one painted into the picture ends up under a second.'

/** For things that fill their panel edge to edge: the tiles, the frame. */
export const STYLE = [
  ...STYLE_HEAD,
  '· NO frames, borders, cards, vignettes, matting or paper background inside a',
  '  panel. The object itself fills the panel edge to edge, corner to corner.',
  ...STYLE_TAIL
].join('\n')

/**
 * The style block for the ONE drawable that is a whole picture rather than an
 * object on a ground: the sky.
 *
 * It has no panels, no neighbours and no key colour, so the shared tail — "a
 * panel that is blank in the reference … flat magenta and nothing else" —
 * would contradict the clause three paragraphs above it that forbids magenta
 * in this file at all. A prompt that contradicts itself is a prompt the
 * painter resolves on its own.
 */
export const STYLE_SCENE = [
  ...STYLE_HEAD.map((l, i) => (i === 1 ? 'bestiary or a hand-painted board-game board. Match this everywhere in it:' : l)),
  '· NO frame, border, card, vignette, matting or paper edge: the painting runs',
  '  off all four sides of the image.',
  '· Keep the same layout the reference has — the same things in the same',
  '  places, at the same size. This is a RESTYLE, not a redesign.'
].join('\n')

/** The same block for artwork that must NOT fill its panel — everything else. */
export const STYLE_PART = [
  ...STYLE_HEAD,
  '· NO frames, borders, cards, vignettes, matting or paper background behind',
  '  the drawing. Nothing but flat magenta behind it, right up to its outline.',
  ...STYLE_TAIL
].join('\n')

/**
 * The background clause, stated near the top of every prompt and repeated in
 * the checklist. It matters more than any styling: a background that cannot be
 * removed is welded into the sprite forever.
 */
export const BACKGROUND_RULE = [
  'BACKGROUND — read this before anything else. It matters more than the style.',
  'Fill every pixel that is not the object itself with solid, flat, pure magenta',
  '#FF00FF. Treat it as a green-screen: one flat chroma-key colour, edge to edge.',
  '· EXACTLY #FF00FF — red 255, green 0, blue 255. Not pink, not rose, not dusty',
  '  pink, not mauve, not a soft or tinted version of it. Only the true colour',
  '  can be cut away cleanly; a near miss has to be flood-filled instead, and a',
  '  flood fill eats any pale paint it can reach.',
  '· NOT transparent. Transparency gets exported as a grey-and-white CHECKERBOARD',
  '  and then baked into the artwork as though the squares were paint.',
  '· NOT white, cream, parchment, paper, or any tinted or textured ground.',
  '· The object must NOT sit on a card, panel, sheet, badge, frame or rectangle',
  '  of any kind. The magenta must touch the outline of the object on every side.',
  '· No drop shadow onto the background, and no vignette.',
  '· The object itself must contain no magenta or hot pink.',
  '· The muted, earthy palette above is for the OBJECT. The ground is not part',
  '  of the painting and is not toned down with it: it stays a vivid,',
  '  eye-hurting #FF00FF however soft everything else is. Dusty rose, pale pink',
  '  and mauve are the failure this whole clause is about.',
  '· KEEP ANY GLOW TIGHT. A halo or bloom spreading into the background is',
  '  measured as part of the object when the return is fitted back onto the',
  '  reference — a wide aura comes back as a tiny stone inside a huge smear —',
  '  and it cannot be keyed: soft light over magenta turns pink, not',
  '  transparent. A glow belongs inside the shape\'s own outline, or within a',
  '  hair of it.'
].join('\n')

/** A measured content box, as fractions of a panel. The bench records these. */
export interface Fit { w: number; h: number; cx: number; cy: number }
export type FitMap = Record<string, Fit>

const pct = (v: number): string => `${Math.round(v * 100)}%`
const ratioWords = (w: number, h: number): string => {
  const a = aspectOf(w, h)
  if (a === '1:1') return 'square, 1:1'
  if (a === '2:1') return 'landscape, twice as wide as it is tall (2:1)'
  if (a === '4:3') return 'landscape, 4:3'
  if (a === '16:9') return 'landscape, 16:9'
  return `landscape, ${a}`
}

/** The colour clause for one panel, when the cell carries one. */
const colourLine = (c: SheetCell): string => (c.colour ? ` Colour identity (keep the HUE, muted and paper-toned): ${c.colour}` : '')

/** The numbered panel list — every panel named, blanks included, so nothing is inferred from pixels. */
const panelList = (s: SheetSpec): string => {
  const rows = sheetRows(s)
  const ordered = [...s.cells].sort((a, b) => a.row - b.row || a.col - b.col)
  return ordered.map((c, i) => {
    const where = rows > 1 ? ` (row ${c.row + 1}, column ${c.col + 1}${c.cw > 1 ? ` to ${c.col + c.cw}` : ''})` : ''
    if (c.art.kind === 'blank') return `${i + 1}.${where} BLANK — leave it flat magenta.`
    return `${i + 1}.${where} ${c.label}${c.sub ? `, ${c.sub}` : ''}: ${c.blurb}.${colourLine(c)}`
  }).join('\n')
}

/** What the sheet's objects are, as a kind: names the noun the checklist counts. */
const nounsOf = (kind: SheetKind): { it: string; them: string } => {
  switch (kind) {
    case 'stones': case 'enemyStones': return { it: 'rune stone', them: 'rune stones' }
    case 'glyphs': return { it: 'glyph icon', them: 'glyph icons' }
    case 'tiles': return { it: 'floor tile', them: 'floor tiles' }
    case 'frame': return { it: 'stone frame', them: 'stone frame' }
    case 'ui': return { it: 'HUD chip', them: 'HUD chips' }
    case 'fx': return { it: 'effect', them: 'effects' }
  }
}

/** The measured (or nominal) extent of a stone in its panel, for the SIZE clause. */
const spanOf = (s: SheetSpec, fits?: FitMap): number => {
  const measured = s.cells.filter((c) => c.target && fits?.[c.id]).map((c) => fits![c.id]!.w)
  if (measured.length) return Math.max(...measured)
  return STONE_SPAN
}

/** A ready-to-paste prompt for one lattice sheet. */
export const promptForSheet = (s: SheetSpec, fits?: FitMap): string => {
  const { w, h } = sheetSize(s)
  const rows = sheetRows(s)
  const n = s.cells.length
  const fills = s.kind === 'tiles' || s.kind === 'frame'
  const nouns = nounsOf(s.kind)
  const span = spanOf(s, fits)
  const stones = s.kind === 'stones' || s.kind === 'enemyStones'

  const shape = s.kind === 'frame'
    ? [
      'WHAT COMES BACK IS ONE OBJECT: a square RING, the frame around a game board,',
      `in a single square image ${w} x ${h} pixels. The inside of the ring is empty`,
      'magenta — the board is drawn there by the game — and the ring reaches all',
      'four edges of the image. Not a picture of a board. Not a plaque, not a card.'
    ]
    : [
      `WHAT COMES BACK IS A SPRITE SHEET, NOT A PICTURE OF A ${nouns.it.toUpperCase()}.`,
      `One image, ${w} x ${h} pixels — ${ratioWords(w, h)} — holding ${n} SEPARATE`,
      `panels laid out ${s.cols} across and ${rows} down, on the same grid as the attached`,
      'reference, read left to right along each row, top row first.',
      `· ${n} panels. Not 1, not ${Math.max(1, n - 2)}, not ${n * 2}. Exactly ${rows} row${rows > 1 ? 's' : ''} of ${s.cols} — do not add a row.`,
      `· ONE big painting of a single ${nouns.it} filling the canvas is the wrong answer`,
      '  however well it is painted, and so is a re-composed grid.'
    ]

  const not = fills
    ? [
      'WHAT IT IS NOT — read this before the subject.',
      '· Draw ONLY what the reference shows in each panel. No board, no other',
      '  tiles, no stones standing on it, no hands, no scenery, no text.',
      '· The reference settles every argument about what belongs.'
    ]
    : [
      'WHAT IT IS NOT — read this before the subject.',
      `· Each panel holds ONE ${nouns.it} and nothing else: no board, no tile under`,
      '  it, no hand, no table, no ground, no cast shadow on the ground, no',
      '  scenery, no text, no numbers, no labels.',
      ...(stones ? [NO_LAUREL] : []),
      '· The reference settles every argument about what belongs. If it is not in',
      '  the reference panel, it is not in the picture.'
    ]

  const view = stones || s.kind === 'glyphs' || s.kind === 'tiles' || s.kind === 'frame'
    ? [
      'THE VIEW — seen from straight above, flat, the way a game token lies on a',
      'table. No three-quarter view, no perspective, no tilt, no foreshortening.',
      'The light comes from the top-left; the shadow side is lower-right.'
    ]
    : [
      'THE VIEW — flat, square on, the way an emblem or a badge is drawn. No',
      'perspective, no vanishing point, no tilt.'
    ]

  const consistency = stones
    ? [
      'ONE GLYPH.',
      `All ${n} panels carry the SAME glyph — ${RUNE_WORDS[(s.cells[0]!.art as { type: RuneType }).type].glyph} —`,
      'identical in shape, proportion and orientation in every panel. It is one',
      'rune cut into different stones, not a set of similar runes. Only the STONE',
      'changes between panels, exactly as the reference shows it.',
      '· A pair of panels is one material at two levels: same stone, same cut,',
      '  the level-2 one a little larger and heavier, with its gold rim and the',
      '  small gold crest on its shoulder — and NOTHING else added.',
      '· Do not re-scale a stone from the reference. Do not move it in its panel.'
    ]
    : s.kind === 'tiles'
      ? [
        'ONE TILE.',
        'The three tiles are the SAME slate tile with a different edge light. Same',
        'bevel, same cracks, same stone, same size. Only the glow colour changes.'
      ]
      : [
        'ONE HAND.',
        `Every ${nouns.it} on this sheet is painted by the same hand at the same`,
        'scale of detail, in the same light, so they read as one set.'
      ]

  const layout = fills
    ? [
      'LAYOUT — the grid is a cutting guide, and it is cut blindly.',
      `Each panel is exactly 1/${s.cols} of the width and 1/${rows} of the height.`,
      `Each ${nouns.it} fills its panel EDGE TO EDGE, corner to corner, with SQUARE`,
      'corners and NO margin: in play these sit side by side, and a polite',
      'border shows as a seam around every one of them.',
      'Do NOT draw the panel edges as lines: the tiles meet, nothing marks the join.'
    ]
    : [
      'LAYOUT — the grid is a cutting guide, and it is cut blindly.',
      `Each panel is exactly 1/${s.cols} of the width and 1/${rows} of the height.`,
      `The ${nouns.it} is CENTRED in its panel and does not fill it: it floats`,
      'clear of all four panel edges with flat magenta around it, exactly as the',
      'reference has it. Never let anything cross into a neighbouring panel.',
      '',
      'SIZE — measure it against the PANEL, not against the paper. In the',
      `reference the widest ${nouns.it} spans about ${pct(span)} of its panel's width`,
      `and never touches the edges. If yours reaches the panel edge it is too big;`,
      'if it is under half the panel it is too small. Bigger is not clearer here.',
      '',
      'WHERE it sits is not a composition choice: the exact centre of a panel is',
      'where the game places it. Do not re-centre it on its own outline, do not',
      'tidy the arrangement, do not even out the spacing.',
      'Do not add, drop, merge or reorder panels.',
      'Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,',
      'in any colour, magenta included.'
    ]

  const checklist = [
    'BEFORE YOU CALL IT FINISHED, count and check:',
    ...(s.kind === 'frame'
      ? ['· One square ring reaching all four edges, empty magenta inside it.']
      : [`· ${s.cols} panels across, ${rows} down, ${n} in all${s.cells.some((c) => c.art.kind === 'blank') ? `, ${s.cells.filter((c) => c.art.kind === 'blank').length} of them blank` : ''}.`]),
    `· The canvas is ${ratioWords(w, h)}.`,
    ...(fills
      ? ['· Every tile reaches all four edges of its panel with square corners.']
      : [`· No ${nouns.it} is anywhere near filling its panel, and none touches an edge.`,
        `· Every panel holds one ${nouns.it}, at the size the reference has it, centred.`]),
    ...(stones ? ['· The glyph is the same shape in every panel.'] : []),
    '· No text, numbers or labels anywhere.',
    '· Every pixel that is not the object itself is flat, vivid #FF00FF — hold it',
    '  against a pure magenta swatch, not against your memory of one.'
  ]

  return [
    `# ${s.title}  (${s.file}.png)`,
    '',
    ...shape,
    '',
    ...not,
    '',
    `WHAT IT IS: ${s.brief}`,
    ...(s.panels ? ['', `READ THE PANELS: ${s.panels}`] : []),
    '',
    'WHAT EACH PANEL IS, in reading order:',
    panelList(s),
    '',
    ...view,
    '',
    ...consistency,
    '',
    fills ? STYLE : STYLE_PART,
    '',
    ...layout,
    '',
    BACKGROUND_RULE,
    '',
    ...checklist,
    '',
    `OUTPUT: one image, ${w} x ${h} pixels (${aspectOf(w, h)}, ${w === h ? 'square' : 'landscape'}). If your`,
    `tool has an aspect-ratio control, set it to ${aspectOf(w, h)} — a different ratio crushes the`,
    'grid and cannot be cut. PNG, not JPEG. No labels, captions, numbers or watermarks.'
  ].join('\n')
}

/** A ready-to-paste prompt for one single-object reference. */
export const promptForSingle = (t: SingleSpec, fits?: FitMap): string => {
  const c = t.cell
  const sheet = SHEETS.find((s) => s.id === t.sheet)!
  const fills = !!c.fill
  const span = fits?.[c.id]?.w ?? STONE_SPAN
  const nouns = nounsOf(sheet.kind)
  return [
    `# ${c.label}${c.sub ? ` — ${c.sub}` : ''}  (${t.file}.png → ${c.target})`,
    '',
    `Repaint ONE ${nouns.it}, in a single square image ${SINGLE_SIZE} x ${SINGLE_SIZE} pixels.`,
    'The attached reference is exactly what to paint, at exactly the size and',
    'position it is drawn at. Match both.',
    '',
    `WHAT IT IS: ${c.blurb}.${colourLine(c)}`,
    ...(sheet.kind === 'stones' || sheet.kind === 'enemyStones'
      ? ['', `THE GLYPH is ${RUNE_WORDS[(c.art as { type: RuneType }).type].glyph}. Keep its shape exactly.`,
        '', 'WHAT IT IS NOT:', NO_LAUREL]
      : []),
    '',
    'THE VIEW — seen from straight above, flat, no perspective, no tilt. Light',
    'from the top-left.',
    '',
    fills ? STYLE : STYLE_PART,
    '',
    ...(fills
      ? ['It fills the image EDGE TO EDGE with square corners and no margin.']
      : [
        'SIZE AND PLACEMENT — this is the part that goes wrong.',
        `Do not enlarge it to fill the frame. In the reference it spans about ${pct(span)}`,
        'of the image\'s width, centred, with flat magenta on every side. Keep it the',
        'same fraction of the frame, in the same place. Bigger is not clearer here.'
      ]),
    '',
    BACKGROUND_RULE,
    '',
    `OUTPUT: one image, exactly ${SINGLE_SIZE} x ${SINGLE_SIZE} pixels (square, 1:1). PNG. No labels,`,
    'captions or watermarks.'
  ].join('\n')
}

/** A ready-to-paste prompt for one walk-cycle strip (a restyle of the strip that ships). */
export const promptForWalk = (w: WalkSpec): string => {
  const creature = w.kind !== 'round'
  const IT = creature ? 'character' : 'arrow'
  const MOMENT = creature
    ? `the SAME ${IT} at a different moment of one ${w.kind === 'hero' ? 'running stride' : 'walking step'}`
    : 'the same arrow at a different moment of one flight'
  return [
    `# ${w.name}  (${w.file}.png → ${w.target})`,
    '',
    `WHAT COMES BACK IS A SPRITE SHEET, NOT A PORTRAIT. One image, ${w.w} x ${w.h} pixels`,
    `— ${ratioWords(w.w, w.h)} — holding ${w.frames} SEPARATE panels, ${w.cols} across and ${w.rows} down,`,
    'on the same grid as the attached reference, read left to right along the top',
    `row and then the bottom row. Every panel is ${MOMENT}.`,
    `· ${w.frames} panels. Not ${w.frames + 4}, not ${w.frames * 2}. Exactly ${w.rows} rows of ${w.cols} — do not add a row.`,
    '',
    `ONE ${IT.toUpperCase()} — read this before anything else.`,
    `All ${w.frames} panels must show the same ${creature ? 'individual' : 'arrow'}: identical colours,`,
    `identical ${creature ? 'clothing and gear' : 'shaft, head and fletching'}, identical proportions, identical silhouette.`,
    'Only the POSE changes, and it changes exactly as the reference shows —',
    `${creature ? 'same limb positions, same body lean, same head angle' : 'same tilt, same streak length'}, panel for panel.`,
    `· ONE colour scheme in every panel. A ${IT} that is one colour in one panel and`,
    `  another in the next is not one ${IT} animated, it is several side by side,`,
    '  and the result is unusable.',
    '· Do not redesign it. Do not add or remove parts between panels.',
    `· It faces ${w.faces.toUpperCase()} in the reference. Keep that direction in all ${w.frames} panels.`,
    '· Do not re-scale it: the same size in every panel, and the same size as the',
    '  reference. Do not move it around inside its panel.',
    '',
    `WHAT IT IS: ${w.name} — ${w.blurb}.`,
    ...(w.colour ? ['', `Colour identity (keep the HUE, muted and paper-toned): ${w.colour}.`] : []),
    '',
    'THIS IS A RESTYLE of the reference strip into the style below, not a new',
    'design: keep the silhouette, the gear and the gait the reference has.',
    '',
    STYLE_PART,
    '',
    'LAYOUT — the grid is a cutting guide, and it is cut blindly.',
    `Each panel is exactly 1/${w.cols} of the width and 1/${w.rows} of the height. The ${IT}`,
    'does NOT fill its panel — it is centred, at the size the reference draws it,',
    'with clear magenta all round. Never let a limb, weapon, streak or shadow',
    'cross into a neighbouring panel. Do not add, drop, merge or reorder panels.',
    'Do NOT draw the panel edges: no boxes, borders, gutters, guides or numbers,',
    'in any colour, magenta included. The panels are found by measuring.',
    '',
    BACKGROUND_RULE,
    '',
    w.anchor === 'feet'
      ? 'The feet land on the same line in every panel — the same height from the\n'
        + 'bottom of the panel as in the reference. If the feet drift up or down\n'
        + `between panels the ${IT} bobs as it moves.`
      : 'It has no feet: keep it centred on the middle of its panel, exactly as the\n'
        + 'reference has it, in every panel.',
    '',
    'BEFORE YOU CALL IT FINISHED, count and check:',
    `· ${w.cols} panels across, ${w.rows} down, ${w.frames} in all.`,
    `· The canvas is ${ratioWords(w.w, w.h)}.`,
    `· Every panel holds the same ${IT}, at the same size, in the same colours, facing ${w.faces.toUpperCase()}.`,
    '· Every pixel that is not the subject is flat, vivid #FF00FF.',
    '',
    `OUTPUT: one image, ${w.w} x ${w.h} pixels (${aspectOf(w.w, w.h)}). If your tool has an`,
    'aspect-ratio control, set it to match. PNG. No labels or watermarks.'
  ].join('\n')
}

/**
 * A ready-to-paste prompt for one backdrop layer.
 *
 * Two shapes, and the difference is the whole prompt: a keyed BAND has a
 * magenta sky that is cut away in play, while the sky itself is the one
 * drawable in the game with no background at all — it IS the background, so
 * the magenta contract is not just unnecessary there, it would be welded into
 * the largest bitmap on screen.
 */
export const promptForScenery = (a: SceneryAsset): string => (a.bg === 'opaque'
  ? [
    `# ${a.name}  (${a.file}.png → ${a.target})`,
    '',
    `Repaint ONE full-bleed backdrop, a single image ${a.w} x ${a.h} pixels`,
    `(${aspectOf(a.w, a.h)}). The attached reference is exactly what to paint.`,
    '',
    `WHAT IT IS: ${a.blurb}.`,
    '',
    'IT FILLS THE IMAGE, edge to edge, corner to corner. There is NO background',
    'behind it and NO magenta anywhere in this one: it is itself the background',
    'the whole game is drawn on top of. No frame, no border, no vignette, no',
    'card, no matting, no rounded corners, no letterboxing.',
    '',
    'KEEP THE MIDDLE QUIET AND DARK. The board, its violet glow and a vignette',
    'are drawn over the centre of this image; anything detailed or bright there',
    'is noise under a grid of stones. The interest belongs in the top third.',
    '',
    'Stay in the reference\'s own range of darkness: this is a night sky, not a',
    'daylight one, and every colour in it is deep. Nothing in it may be as',
    'bright or as saturated as a rune stone, or the board stops reading first.',
    '',
    STYLE_SCENE,
    '',
    `OUTPUT: one image, ${a.w} x ${a.h} pixels (${aspectOf(a.w, a.h)}). If your tool has an`,
    'aspect-ratio control, set it to match. PNG. No labels, captions or',
    'watermarks.'
  ]
  : [
    `# ${a.name}  (${a.file}.png → ${a.target})`,
    '',
    `Repaint ONE landscape band, a single image ${a.w} x ${a.h} pixels — four times as`,
    'wide as it is tall (4:1). The attached reference is exactly what to paint.',
    '',
    `WHAT IT IS: ${a.blurb}.`,
    '',
    'This band sits BEHIND the game board as a horizon. Its base runs along the',
    'bottom edge of the image — the last row of pixels is rock, not background —',
    'and everything above the ridge line is EMPTY: flat magenta sky, keyed out in',
    'play. Paint no sky, no clouds, no moon, no sun, no stars, no birds: the sky',
    'is a separate painting that goes behind this one.',
    '',
    STYLE_PART,
    '',
    BACKGROUND_RULE,
    '',
    `OUTPUT: one image, ${a.w} x ${a.h} pixels (4:1, a wide band). If your tool has an`,
    'aspect-ratio control, set it as close to 4:1 as it goes and keep the ridge',
    'base on the bottom edge. PNG. No labels or watermarks.'
  ]).join('\n')

// ─── The prompt documents ───────────────────────────────────────────────────
//
// Generated from the manifest — never hand-edited. The bench writes these on
// export (with the measured fits folded in) and `pnpm art:prompts` writes the
// same files headlessly from this module, so a new manifest line has a prompt
// before anyone opens a browser. Deterministic: no timestamps, so a re-run
// with no manifest change is a no-op in git.

const GENERATED = 'Generated from `src/game/artSheet.ts` — do not hand-edit; run `pnpm art:prompts` (or export from `/#/art-sheets`) instead.'

const COPY_HINT = 'Every prompt below is one fenced block. Open this file in a markdown preview and\n'
  + 'use the block\'s copy button — one click takes the whole prompt to the clipboard,\n'
  + 'ready to paste at the image model. The heading above a block says which file to\n'
  + 'attach with it and where the return lands; it is NOT part of the prompt.'

/** A fence longer than any backtick run inside `body`, so nothing can close it early. */
const fenceFor = (body: string): string => {
  let longest = 0
  for (const run of body.match(/`+/g) ?? []) longest = Math.max(longest, run.length)
  return '`'.repeat(Math.max(3, longest + 1))
}

/**
 * One block as the preview wants it: the `# Name  (file.png → target)` line the
 * builders put first becomes a markdown heading OUTSIDE the fence — so the
 * document keeps an outline and the attach/target pair stays readable — and the
 * prompt itself goes inside a fenced block, which is what earns the
 * copy-to-clipboard button. Copying is then one click per generation instead of
 * a drag-select through 80 lines that either eats the first line or takes the
 * next block's heading with it.
 */
const block = (text: string): string => {
  const cut = text.indexOf('\n')
  const heading = (cut < 0 ? text : text.slice(0, cut)).replace(/^#+\s*/, '')
  const body = (cut < 0 ? '' : text.slice(cut + 1)).replace(/^\n+/, '')
  const fence = fenceFor(body)
  return [`## ${heading}`, '', `${fence}text`, body, fence].join('\n')
}

const doc = (title: string, intro: string[], blocks: string[]): string =>
  [`# ${title}`, '', GENERATED, '', ...intro, '', COPY_HINT, '', blocks.map(block).join('\n\n---\n\n'), ''].join('\n')

/** Every prompt document, keyed by filename under `art-sheets/`. */
export const promptDocs = (fits?: FitMap): Record<string, string> => {
  const stones = SHEETS.filter((s) => s.kind === 'stones' || s.kind === 'enemyStones' || s.kind === 'glyphs')
  const board = SHEETS.filter((s) => !stones.includes(s))
  return {
    'PROMPTS-RUNES.md': doc('Rune prompts — the stones and the glyph icons', [
      'One sheet per generation. Attach `art-sheets/<sheet>.png` (the CLEAN sheet, not the',
      '`-key` one) and paste the block below it. Every panel is named, because a whole-sheet',
      'pass that infers subjects from pixels turns a bow into a harp.',
      '',
      'Drop the return in `art-sheets/painted/` under the same name, then `pnpm art:slice`.'
    ], stones.map((s) => promptForSheet(s, fits))),
    'PROMPTS-BOARD.md': doc('Board prompts — tiles, frame, HUD chips, effects', [
      'One sheet per generation. The tile sheet and the frame FILL their panels edge to edge;',
      'everything else floats on flat magenta. Attach the clean sheet, paste the block.'
    ], board.map((s) => promptForSheet(s, fits))),
    'PROMPTS-CAST.md': doc('Cast prompts — walk cycles and the horizon', [
      'These restyle bitmaps that already ship. Attach `art-sheets/walk-<id>.png` or',
      '`bg-<id>.png` and paste the block beside it. A walk sheet is a grid of panels showing',
      'ONE character through ONE cycle, and the whole job is that it comes back as one',
      'character and not eight.'
    ], [...WALKS.map(promptForWalk), ...SCENERY.map(promptForScenery)]),
    'PROMPTS-SINGLES.md': doc('Single-object prompts — one object per generation', [
      'The sturdy route. An image model will not hold a lattice while it repaints; a single',
      'has no lattice to lose. Export the singles from the bench (tick "singles"), attach',
      '`art-sheets/singles/single-<id>.png`, paste the block. Slower, never mis-cut.'
    ], SINGLES.map((t) => promptForSingle(t, fits)))
  }
}
