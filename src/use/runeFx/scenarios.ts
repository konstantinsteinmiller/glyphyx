import { addRune } from '@/game/board'
import { resolveTurn } from '@/game/resolve'
import { GRID, type BoardState, type Dir, type Move, type PresetRune, type ResolveEvent, type RuneType, type Tile } from '@/game/rules'
import type { CanvasLabels } from '@/game/view'
import { ownerOf } from './types'

/**
 * ─── The FX scenarios ───────────────────────────────────────────────────────
 *
 * Staged boards that put ONE rune's attack — or its defence — on screen,
 * through the real resolver. Shared by the FX bench (`src/views/FxBench.vue`,
 * driven by `tools/fx-bench/shoot.mjs`) and the rune-effects contract test, so
 * what is judged by eye is exactly what is tested for totality and budget.
 *
 * Coordinates: col 0…3 left→right, row 0 the enemy's home rank (top), row 3
 * the player's. Enemy dummies are warheads and crowns: a PRE-PLACED one never
 * acts (both only act on the placement itself), so the only thing that fires
 * is the rune under test. Where another rune's events are needed (the sword a
 * shield absorbs), `keep` names it.
 */

export interface Scenario {
  id: string
  rune: RuneType
  title: string
  /** `[side, type, col, row, dir, level?, hp?, maxHp?]` — row 0 is the enemy's home rank. */
  runes: Array<[('player' | 'enemy'), RuneType, number, number, Dir, number?, number?, number?]>
  moves?: Move[]
  /** Rune types whose events are kept. Default: the scenario's own rune. */
  keep?: RuneType[]
}

const P = 'player' as const
const E = 'enemy' as const

/** The catalogue. Enemy dummies are warheads and crowns: a pre-placed one never acts. */
export const SCENARIOS: Scenario[] = [
  { id: 'melee-hit', rune: 'melee', title: 'Sword strikes a stone that survives',
    runes: [[P, 'melee', 1, 2, 'up'], [E, 'crown', 1, 1, 'down', 2]] },
  { id: 'melee-kill', rune: 'melee', title: 'Sword shatters a stone',
    runes: [[P, 'melee', 1, 2, 'up'], [E, 'nuker', 1, 1, 'down', 1]] },
  { id: 'melee-lv2', rune: 'melee', title: 'Lv 2 sword: the blow and the knockback',
    runes: [[P, 'melee', 1, 2, 'up', 2], [E, 'crown', 1, 1, 'down', 3]] },
  { id: 'archer-hit', rune: 'archer', title: 'Bow: an arrow over the near tile into a stone',
    runes: [[P, 'archer', 1, 3, 'up'], [E, 'crown', 1, 1, 'down', 2]] },
  { id: 'archer-kill', rune: 'archer', title: 'Bow shatters a stone',
    runes: [[P, 'archer', 1, 3, 'up'], [E, 'nuker', 1, 1, 'down', 1]] },
  { id: 'mage-beam', rune: 'mage', title: 'Orb: the diagonal beam',
    runes: [[P, 'mage', 0, 3, 'ur'], [E, 'crown', 2, 1, 'down', 2]] },
  { id: 'mage-lv2', rune: 'mage', title: 'Lv 2 orb: the beam and the cross',
    runes: [[P, 'mage', 0, 3, 'ur', 2], [E, 'crown', 2, 1, 'down', 3], [E, 'nuker', 2, 0, 'down', 1], [E, 'nuker', 3, 1, 'down', 1], [E, 'crown', 1, 1, 'down', 1]] },
  { id: 'cleave-fan', rune: 'cleave', title: 'Axe: the fan across three tiles',
    runes: [[P, 'cleave', 1, 2, 'up'], [E, 'crown', 0, 1, 'down', 2], [E, 'nuker', 1, 1, 'down', 1], [E, 'crown', 2, 1, 'down', 1]] },
  { id: 'roller-lane', rune: 'roller', title: 'Boulder: down the lane, through one, stopped by the next',
    runes: [[P, 'roller', 1, 3, 'up'], [E, 'nuker', 1, 2, 'down', 1], [E, 'crown', 1, 0, 'down', 3]] },
  { id: 'bombard-shell', rune: 'bombard', title: 'Mortar: the lobbed shell and its footprint',
    runes: [[P, 'bombard', 1, 3, 'up'], [E, 'crown', 1, 0, 'down', 2], [E, 'nuker', 2, 0, 'down', 1]] },
  { id: 'defense-aura', rune: 'defense', title: 'Lv 2 shield raises shields over its neighbours',
    runes: [[P, 'defense', 1, 2, 'omni', 2], [P, 'crown', 0, 2, 'up'], [P, 'crown', 2, 2, 'up'], [P, 'nuker', 1, 3, 'up']] },
  { id: 'defense-absorb', rune: 'defense', title: 'A shielded stone absorbs a sword',
    runes: [[P, 'defense', 1, 3, 'omni', 2], [P, 'crown', 1, 2, 'up'], [E, 'melee', 1, 1, 'down']], keep: ['defense', 'melee'] },
  { id: 'defense-intercept', rune: 'defense', title: 'A shield stone stops an arrow',
    runes: [[P, 'defense', 1, 2, 'omni'], [E, 'archer', 1, 0, 'down']], keep: ['defense', 'archer'] },
  { id: 'defense-beam', rune: 'defense', title: 'A shield stone stops a beam',
    runes: [[P, 'defense', 1, 1, 'omni'], [E, 'mage', 0, 0, 'dr']], keep: ['defense', 'mage'] },
  { id: 'support-heal', rune: 'support', title: 'Cross heals a wounded neighbour',
    runes: [[P, 'support', 1, 3, 'omni'], [P, 'melee', 1, 2, 'up', 1, 1, 3]] },
  { id: 'support-buff', rune: 'support', title: 'Lv 2 cross sharpens a bow, which fires',
    runes: [[P, 'support', 1, 3, 'omni', 2], [P, 'archer', 2, 3, 'up'], [E, 'crown', 2, 1, 'down', 2]], keep: ['support', 'archer'] },
  { id: 'nuker-nuke', rune: 'nuker', title: 'Warhead: the whole board at once',
    runes: [[E, 'crown', 0, 0, 'down'], [E, 'nuker', 2, 0, 'down'], [E, 'crown', 3, 1, 'down', 2], [E, 'nuker', 0, 1, 'down'], [P, 'crown', 3, 3, 'up'], [P, 'crown', 0, 3, 'up', 2]],
    moves: [{ side: 'player', faction: null, type: 'nuker', col: 1, row: 2, dir: 'omni' }] },
  { id: 'crown-take', rune: 'crown', title: 'Crown takes the stone it faces',
    runes: [[E, 'melee', 1, 1, 'down'], [E, 'crown', 3, 0, 'down']],
    moves: [{ side: 'player', faction: null, type: 'crown', col: 1, row: 2, dir: 'up' }] }
]

export const LABELS: CanvasLabels = {
  level: (n) => `Lv ${n}`, combo: (n) => `x${n}`, clash: 'CLASH', victory: '', defeat: '', reveal: '', suddenDeath: '',
  turn: (n) => `${n}`, you: 'YOU', foe: 'FOE', reroll: '', lastTurn: '', firesIn: '', yourTurn: ''
}

export const emptyBoard = (): BoardState => {
  const tiles: Tile[] = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) tiles.push({ col, row, owner: 'neutral', faction: null, runeId: null })
  }
  return { tiles, runes: {}, nextRuneId: 1 }
}

/** Build the scenario's board, resolve it for real, keep its rune's events, re-time them. */
export const build = (sc: Scenario): { before: BoardState; after: BoardState; events: ResolveEvent[]; endMs: number } => {
  const board = emptyBoard()
  for (const [side, type, col, row, dir, level, hp, maxHp] of sc.runes) {
    const preset: PresetRune = { side, faction: side === 'enemy' ? 'goblin' : null, type, col, row, dir, level, hp, maxHp }
    const r = addRune(board, preset)
    const t = board.tiles[row * GRID + col]!
    t.runeId = r.id
    t.owner = side
    t.faction = r.faction
  }
  const before = JSON.parse(JSON.stringify(board)) as BoardState
  const out = resolveTurn(board, sc.moves ?? [], { enemyAtkMul: () => 1 })
  const keep = new Set<RuneType>(sc.keep ?? [sc.rune])
  const kept = out.events.filter((e) => {
    const o = ownerOf(e)
    return o === null || keep.has(o)
  })
  const first = kept.reduce((m, e) => Math.min(m, e.at), Infinity)
  const shift = Number.isFinite(first) ? first - 150 : 0
  const events = kept.map((e) => ({ ...e, at: e.at - shift }))
  const endMs = events.reduce((m, e) => Math.max(m, e.at + e.dur), 0) + 600
  return { before, after: out.board, events, endMs }
}
