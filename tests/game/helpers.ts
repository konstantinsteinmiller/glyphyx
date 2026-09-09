import type {
  BoardState, Dir, EnemySetup, MatchMode, Move, NodeConfig, Objective, PresetRune, RankTable, RuneType, Side
} from '@/game/rules'
import { addRune, createBoard } from '@/game/board'
import type { ResolveOptions } from '@/game/resolve'

/** A bare node with no presets and one full-strength goblin at the top. */
export const testConfig = (over: Partial<NodeConfig> = {}): NodeConfig => ({
  id: 999,
  chapter: 1,
  index: 1,
  mode: '1v1' as MatchMode,
  objective: 'conquest' as Objective,
  enemies: [{ faction: 'goblin', post: 'top', deck: ['melee', 'archer'], ai: 'easy', atkMul: 1 } as EnemySetup],
  presets: [],
  playerDeck: null,
  tutorial: null,
  timer: true,
  turnLimit: 10,
  reward: { coins: 0, unlockRune: null, unlockSkin: null, big: false },
  seed: 1,
  ...over
})

/** Shorthand preset. Player runes ignore `faction`. */
export const p = (
  side: Side, type: RuneType, col: number, row: number, dir: Dir, extra: Partial<PresetRune> = {}
): PresetRune => ({ side, faction: side === 'enemy' ? 'goblin' : null, type, col, row, dir, ...extra })

/** A 1v1 board with these runes standing on it (territories as in a 1v1). */
export const boardWith = (...presets: PresetRune[]): BoardState => {
  const board = createBoard(testConfig())
  for (const preset of presets) addRune(board, preset)
  return board
}

export const mv = (side: Side, type: RuneType, col: number, row: number, dir: Dir): Move =>
  ({ side, faction: side === 'enemy' ? 'goblin' : null, type, col, row, dir })

export const fullPower: ResolveOptions = { enemyAtkMul: () => 1 }
export const dummies: ResolveOptions = { enemyAtkMul: () => 0 }

/** Full-strength enemies, and a player carrying `ranks` on their runes. */
export const ranked = (ranks: RankTable): ResolveOptions => ({ enemyAtkMul: () => 1, playerRanks: ranks })

/** A 1v1 board whose PLAYER presets stand up with `ranks`; the enemy's never do. */
export const boardWithRanks = (ranks: RankTable, ...presets: PresetRune[]): BoardState => {
  const board = createBoard(testConfig(), ranks)
  for (const preset of presets) addRune(board, preset, ranks)
  return board
}

/** The rune standing at (col,row), asserting there is one. */
export const at = (b: BoardState, col: number, row: number) => {
  const id = b.tiles[row * 4 + col]!.runeId
  if (id === null) throw new Error(`no rune at (${col},${row})`)
  return b.runes[id]!
}
export const empty = (b: BoardState, col: number, row: number): boolean => b.tiles[row * 4 + col]!.runeId === null
export const ownerOf = (b: BoardState, col: number, row: number) => b.tiles[row * 4 + col]!.owner
