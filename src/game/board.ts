/**
 * ─── The board ──────────────────────────────────────────────────────────────
 *
 * Sixteen tiles and the runes standing on them. Pure data + pure helpers: no
 * Vue, no DOM. Every function that changes a board is in `resolve.ts`; this
 * module only builds, reads and copies.
 *
 * Ownership rule, stated once: a tile is owned by whoever has a rune on it. An
 * EMPTY tile keeps whatever owner it had (territory), and a tile that loses its
 * rune goes neutral — that is what "shatter neutralises the tile" means.
 */

import {
  GRID, MAX_LEVEL, TILE_COUNT, cellIndex, defaultDir, dirsFor, inBounds, rankOf, statsFor, statsWithRank,
  strikeCells,
  type BoardState, type Cell, type Dir, type EnemySetup, type NodeConfig, type Owner,
  type PresetRune, type RankTable, type Rune, type RuneType, type Side, type Tile
} from './rules'
import type { PlacementKind } from './view'

const byPost = (config: NodeConfig, post: EnemySetup['post']): EnemySetup | undefined =>
  config.enemies.find((e) => e.post === post)

/** Sixteen neutral tiles. */
const blankTiles = (): Tile[] => {
  const tiles: Tile[] = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      tiles.push({ col, row, owner: 'neutral', faction: null, runeId: null })
    }
  }
  return tiles
}

/**
 * Stand a rune on the board straight from a preset — used by `createBoard` for
 * the authored openings and by tests to build any position they like. The tile
 * is captured for the rune's side. Returns the rune it made.
 *
 * `ranks` is the PLAYER's permanent rune ranks; the enemy never has any. It
 * only ever reaches the DEFAULT body: a preset that states its own `hp` or
 * `maxHp` keeps exactly the number it was written with. That is deliberate and
 * load-bearing — every preset in the game is part of an authored lesson whose
 * arithmetic was measured (the 1-HP sword of 1-6 out-trades a 6-HP orc), and a
 * lesson that quietly changes shape once the player has bought ranks is a
 * lesson whose floor no longer holds. Ranks show up on what the player PLACES.
 */
export const addRune = (board: BoardState, preset: PresetRune, ranks: RankTable = {}): Rune => {
  const level = preset.level ?? 1
  const stats = preset.side === 'player'
    ? statsWithRank(preset.type, level, rankOf(ranks, preset.type))
    : statsFor(preset.type, level)
  const hp = preset.hp ?? stats.hp
  const maxHp = Math.max(hp, preset.maxHp ?? hp)
  const rune: Rune = {
    id: board.nextRuneId++,
    type: preset.type,
    side: preset.side,
    faction: preset.side === 'enemy' ? preset.faction : null,
    level,
    hp,
    maxHp,
    dir: preset.dir,
    col: preset.col,
    row: preset.row,
    shield: 0,
    atkBonus: 0
  }
  board.runes[rune.id] = rune
  const tile = board.tiles[cellIndex(rune.col, rune.row)]!
  tile.runeId = rune.id
  tile.owner = rune.side
  tile.faction = rune.faction
  return rune
}

/** The board at turn 1: territories per mode, presets standing (see `addRune` for `ranks`). */
export const createBoard = (config: NodeConfig, ranks: RankTable = {}): BoardState => {
  const board: BoardState = { tiles: blankTiles(), runes: {}, nextRuneId: 1 }
  const claim = (col: number, row: number, owner: Owner, faction: EnemySetup['faction'] | null): void => {
    const t = board.tiles[cellIndex(col, row)]!
    t.owner = owner
    t.faction = owner === 'enemy' ? faction : null
  }

  if (config.mode === '1v1') {
    const top = byPost(config, 'top') ?? config.enemies[0] ?? null
    for (let col = 0; col < GRID; col++) {
      if (top) claim(col, 0, 'enemy', top.faction)
      claim(col, GRID - 1, 'player', null)
    }
  } else {
    const north = byPost(config, 'north')
    const west = byPost(config, 'west')
    const east = byPost(config, 'east')
    for (let col = 0; col < GRID; col++) if (north) claim(col, 0, 'enemy', north.faction)
    for (let row = 1; row <= 2; row++) {
      if (west) claim(0, row, 'enemy', west.faction)
      if (east) claim(GRID - 1, row, 'enemy', east.faction)
      claim(1, row, 'player', null)
      claim(2, row, 'player', null)
    }
  }

  for (const preset of config.presets) addRune(board, preset, ranks)
  return board
}

/** A deep copy with no shared references. The state is plain JSON by design. */
export const cloneBoard = (b: BoardState): BoardState => ({
  tiles: b.tiles.map((t) => ({ ...t })),
  runes: Object.fromEntries(Object.entries(b.runes).map(([id, r]) => [id, { ...r }])),
  nextRuneId: b.nextRuneId
})

export const tileAt = (b: BoardState, col: number, row: number): Tile => {
  const t = b.tiles[cellIndex(col, row)]
  if (!t) throw new Error(`tileAt: (${col},${row}) is off the board`)
  return t
}

export const runeAt = (b: BoardState, col: number, row: number): Rune | null => {
  if (!inBounds(col, row)) return null
  const id = b.tiles[cellIndex(col, row)]!.runeId
  return id === null ? null : (b.runes[id] ?? null)
}

/**
 * ─── Which way a pebble should point when nobody has said ───────────────────
 *
 * The facing of a rune that is dropped without being aimed. `defaultDir` alone
 * answers "towards the other side of the board", which is right in a duel and
 * wrong in a siege, where the other side is three sides. This asks the board
 * instead: of the facings this rune HAS, which one puts an enemy stone in its
 * line? Ties, and a tile with nothing in reach at all, keep `defaultDir`.
 *
 * It exists because of what a first-time player actually does: they carry a
 * pebble to a tile and let go in the middle of it. The middle chooses nothing
 * (`AIM_CENTRE_DEAD_ZONE`), so that placement is decided entirely by this — and
 * in the 2026-09-11 playtest, when it was decided by the tile edge the pebble
 * had been carried in through, three of four testers spent a one-move lesson
 * shooting at their own back row. A stone that lands pointing at an enemy is
 * not playing the game for them: aiming it somewhere better is still the whole
 * skill, and every aim gesture still overrides this.
 */
export const usefulDir = (
  b: BoardState, side: Side, type: RuneType, at: Cell, level = 1
): Dir => {
  const base = defaultDir(type, side)
  if (base === 'omni') return 'omni'
  const dirs = dirsFor(type)
  // The default goes first so that a tie — nothing in reach, or two facings
  // with equally much in reach — keeps the facing the game has always used.
  const ordered = [base, ...dirs.filter((d) => d !== base)]
  let best: Dir = base
  let bestScore = 0
  for (const dir of ordered) {
    let score = 0
    for (const cell of strikeCells(type, level, dir, at)) {
      const rune = runeAt(b, cell.col, cell.row)
      if (rune && rune.side !== side) score++
    }
    if (score > bestScore) {
      best = dir
      bestScore = score
    }
  }
  return best
}

/** The four orthogonal neighbours inside the board. */
export const neighbors = (c: Cell): Cell[] => {
  const out: Cell[] = []
  const around: ReadonlyArray<readonly [number, number]> = [[0, -1], [1, 0], [0, 1], [-1, 0]]
  for (const [dx, dy] of around) {
    const col = c.col + dx
    const row = c.row + dy
    if (inBounds(col, row)) out.push({ col, row })
  }
  return out
}

/**
 * Can `side` drop a `type` pebble on (col, row)?
 *   empty   — no rune there (any territory)
 *   stack   — a friendly rune of the same type below `MAX_LEVEL` (→ one level up)
 *   invalid — anything else, including a rune already at the cap
 */
export const placementKind = (
  b: BoardState, side: Side, type: RuneType, col: number, row: number
): PlacementKind => {
  if (!inBounds(col, row)) return 'invalid'
  const rune = runeAt(b, col, row)
  if (!rune) return 'empty'
  if (rune.side === side && rune.type === type && rune.level < MAX_LEVEL) return 'stack'
  return 'invalid'
}

export const legalPlacements = (
  b: BoardState, side: Side, type: RuneType
): Array<{ cell: Cell; kind: PlacementKind }> => {
  const out: Array<{ cell: Cell; kind: PlacementKind }> = []
  for (let i = 0; i < TILE_COUNT; i++) {
    const t = b.tiles[i]!
    const kind = placementKind(b, side, type, t.col, t.row)
    if (kind !== 'invalid') out.push({ cell: { col: t.col, row: t.row }, kind })
  }
  return out
}

/**
 * Total health standing for `side` — the one number that says whether a turn
 * did anything. A kill, a scratch and a knock-back all move it; a turn where
 * every shot missed, hit a friend or flew off the board does not. See
 * `MatchState.stallTurns`.
 */
export const sideHp = (b: BoardState, side: Side): number => {
  let hp = 0
  for (const rune of Object.values(b.runes)) if (rune.side === side) hp += rune.hp
  return hp
}

export const countTiles = (b: BoardState, owner: Owner): number => {
  let n = 0
  for (const t of b.tiles) if (t.owner === owner) n++
  return n
}

export const runesOf = (b: BoardState, side: Side): Rune[] => {
  const out: Rune[] = []
  for (const id of Object.keys(b.runes)) {
    const r = b.runes[Number(id)]!
    if (r.side === side) out.push(r)
  }
  // Stable, id-ascending — the resolution order and the tests both depend on it.
  out.sort((a, c) => a.id - c.id)
  return out
}

/** Tiles held per enemy faction — the siege's turn-limit verdict reads this. */
export const factionTiles = (b: BoardState): Partial<Record<NonNullable<Tile['faction']>, number>> => {
  const out: Partial<Record<NonNullable<Tile['faction']>, number>> = {}
  for (const t of b.tiles) {
    if (t.owner !== 'enemy' || !t.faction) continue
    out[t.faction] = (out[t.faction] ?? 0) + 1
  }
  return out
}
