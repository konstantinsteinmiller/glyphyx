import { describe, expect, it } from 'vitest'
import { LATE_LESSON_NODES, nodeConfig } from '@/game/campaign'
import { rewardOf } from '@/use/useCampaign'
import { beginPlanning, commitPlayerMove, createMatch, resolveCurrentTurn } from '@/game/match'
import { runesOf } from '@/game/board'
import type { Dir } from '@/game/rules'
import { careless, clearRate, ghostThen, greedy, playNode, zeroInput } from './policies'

/**
 * ─── The floor of the lessons ───────────────────────────────────────────────
 *
 * Every relief moves the difficulty floor, and this file pins where it moved
 * to. Three players, per the onboarding rule: the one who does what the ghost
 * shows, the one who taps at random, and the one who never taps.
 *
 * Measured on 2026-09-09, after stacking went to Lv 8 (medium setting unless
 * noted). Lessons run to `TUTORIAL_TURN_LIMIT` = 200 turns: with every friendly
 * rune stackable to Lv 8 a random player wastes many more turns piling stones,
 * and under the old 30-turn limit 1-2 became losable after the ghost's move
 * (85 %) and 1-6 dropped to 45 % — a lesson may not be losable by dawdling.
 *
 *   node   ghost+greedy   ghost+careless   careless   zero
 *   1-1    20/20 in 1     100 %            100 %
 *   1-2    20/20 in ≤2    100 %             75 %
 *   1-3    20/20 in ≤2    100 %            100 %
 *   1-4    20/20 in 1     100 %            100 %
 *   1-5    20/20 in ≤2    100 %             75 %
 *   1-6    20/20 in ≤2    100 %             55 %
 *   1-7 (easy)  greedy 98 %                 28 %      0 %
 *   1-8 (easy)  greedy 85 %                 38 %      0 %
 *
 * (1-8 with `easy` factions was a 52 % walk for a careless player, which is
 * why the chapter boss keeps `medium` ones.)
 *
 * The four LATE lessons — 2-2 axe, 2-6 boulder, 3-2 mortar, 4-2 nuke, each one
 * node after the chest that hands its rune over — are held to a harder line
 * than chapter 1's: the ghost's move must win in exactly ONE turn, on every
 * seed. Each is a single shape (three tiles wide, a whole lane, the far rank,
 * the whole board) laid out so that one drop clears it, and a lesson that took
 * two turns would mean the shape had missed something.
 */

const LESSONS = [1, 2, 3, 4, 5, 6]

describe('the lessons', () => {
  it('are cleared by a player who does what the ghost shows, on every seed, in three turns or fewer', () => {
    for (const id of LESSONS) {
      for (let seed = 1; seed <= 20; seed++) {
        const s = playNode(id, 'medium', seed, ghostThen(greedy))
        expect(s.result?.won, `node ${id} seed ${seed}`).toBe(true)
        expect(s.result!.turns, `node ${id} seed ${seed}`).toBeLessThanOrEqual(3)
      }
    }
  })

  it('cannot be lost once the ghost\'s move is made, whatever comes after it', () => {
    for (const id of LESSONS) {
      expect(clearRate(id, 'hard', 20, (seed) => ghostThen(careless(seed))), `node ${id}`).toBe(1)
    }
  })

  it('are still mostly cleared by a player who taps at random — the dummies cannot win', () => {
    for (const id of LESSONS) {
      expect(clearRate(id, 'medium', 20, (seed) => careless(seed)), `node ${id}`).toBeGreaterThanOrEqual(0.5)
    }
  })
})

describe('the late lessons', () => {
  // 2-2, 2-6, 3-2, 4-2 and 4-6 — one node after the chest that hands each rune
  // over. Each is won by the ghost's single placement, which is the point: the
  // shape of the move is the whole lesson, so it has to land in ONE turn.
  //
  // Read off the campaign's own table rather than listed here, so a lesson
  // added later is held to this contract without anybody remembering to add it.
  const LATE = Object.keys(LATE_LESSON_NODES).map(Number)

  it('are lessons at all: clockless, scripted, against dummies that never place', () => {
    for (const id of LATE) {
      const cfg = nodeConfig(id, 'medium')
      expect(cfg.tutorial, `node ${id}`).toBe(cfg.ghost!.type)
      expect(cfg.timer, `node ${id}`).toBe(false)
      expect(cfg.mode, `node ${id}`).toBe('1v1')
      expect(cfg.playerDeck, `node ${id}`).toContain(cfg.ghost!.type)
      for (const e of cfg.enemies) {
        expect(e.ai, `node ${id}`).toBe('passive')
        expect(e.atkMul, `node ${id}`).toBe(0)
      }
    }
  })

  it('teach the rune the node before them just handed over', () => {
    for (const id of LATE) {
      expect(rewardOf(id - 1).unlockRune, `node ${id - 1}`).toBe(nodeConfig(id, 'medium').ghost!.type)
    }
  })

  it('are won by the ghost\'s move alone, in a single turn, on every seed', () => {
    for (const id of LATE) {
      for (let seed = 1; seed <= 20; seed++) {
        const s = playNode(id, 'medium', seed, ghostThen(greedy))
        expect(s.result?.won, `node ${id} seed ${seed}`).toBe(true)
        expect(s.result!.turns, `node ${id} seed ${seed}`).toBe(1)
      }
    }
  })

  it('cannot be lost once the ghost\'s move is made, whatever comes after it', () => {
    for (const id of LATE) {
      expect(clearRate(id, 'hard', 20, (seed) => ghostThen(careless(seed))), `node ${id}`).toBe(1)
    }
  })

  it('are still cleared by a player who taps at random — the dummies cannot win', () => {
    for (const id of LATE) {
      expect(clearRate(id, 'medium', 20, (seed) => careless(seed)), `node ${id}`).toBeGreaterThanOrEqual(0.5)
    }
  })
})

describe('the first real fights', () => {
  it('1-7 is lost by a player who never places', () => {
    expect(clearRate(7, 'easy', 10, () => zeroInput())).toBe(0)
  })

  it('1-7 and 1-8 are NOT reliably walkable by a player who taps at random, even on easy', () => {
    expect(clearRate(7, 'easy', 40, (seed) => careless(seed))).toBeLessThan(0.5)
    expect(clearRate(8, 'easy', 40, (seed) => careless(seed))).toBeLessThan(0.5)
  })

  it('…and are cleared by a player who plays: the ceiling is intact', () => {
    expect(clearRate(7, 'medium', 40, () => greedy)).toBeGreaterThanOrEqual(0.8)
    expect(clearRate(8, 'medium', 40, () => greedy)).toBeGreaterThanOrEqual(0.8)
  })
})

describe('1-1 teaches the aim, not just the drop', () => {
  /**
   * One turn of 1-1: the sword on the ghost's tile, facing `dir`.
   *
   * The lesson is ONE gesture — the side of the tile the pebble is released on
   * is the side it faces — so `dir` here is what the player's release chose,
   * not a correction made afterwards. Both facings still have to be pinned:
   * the point of the lesson is that the choice decides the turn.
   */
  const oneTurn = (dir: Dir, seed = 1) => {
    const config = nodeConfig(1, 'medium')
    const g = config.ghost!
    let s = beginPlanning(createMatch(config, ['melee'], seed, 0), 'medium')
    s = commitPlayerMove(s, { side: 'player', faction: null, type: g.type, col: g.to.col, row: g.to.row, dir })
    return resolveCurrentTurn(s).state
  }

  it('a sword released in the middle of the tile keeps its default facing and hits nothing', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const s = oneTurn('up', seed)
      expect(runesOf(s.board, 'enemy'), `seed ${seed}`).toHaveLength(1)
      expect(s.result).toBeNull()
    }
  })

  it('…released on the side the ghost shows, it shatters the skeleton on turn 1', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const s = oneTurn('left', seed)
      expect(runesOf(s.board, 'enemy'), `seed ${seed}`).toHaveLength(0)
    }
    for (let seed = 1; seed <= 20; seed++) {
      const s = playNode(1, 'medium', seed, ghostThen(greedy))
      expect(s.result?.won).toBe(true)
      expect(s.result!.turns).toBe(1)
    }
  })
})
