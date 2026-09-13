import { describe, expect, it } from 'vitest'
import {
  CLASH_LESSON_NODE, FIRST_FIGHT_NODE, LATE_LESSON_NODES, isFirstFightNode, isLessonNode, nodeConfig, nodeId
} from '@/game/campaign'
import { LESSON_RESCUE_TURNS } from '@/game/rules'
import { rewardOf } from '@/use/useCampaign'
import { beginPlanning, commitPlayerMove, createMatch, nextTurn, resolveCurrentTurn } from '@/game/match'
import { runesOf } from '@/game/board'
import type { Dir } from '@/game/rules'
import { careless, clearRate, ghostThen, greedy, inputBiased, playNode, zeroInput } from './policies'
import { MIRROR_PATIENCE, PASS_MIRROR, computeHandicap } from '@/game/adaptive'
import { NO_HANDICAP, cellIndex, type Handicap, type HandicapInput } from '@/game/rules'
import type { Policy } from './policies'

/** Clear rate for one policy instance, reused across the conquest-wall tests. */
const rate1 = (id: number, policy: Policy, h: Handicap, diff: 'easy' | 'medium' = 'medium'): number => {
  let wins = 0
  for (let seed = 1; seed <= 40; seed++) if (playNode(id, diff, seed, policy, h).result?.won) wins++
  return wins / 40
}

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
 * Those numbers are what the DOMAIN measured, and the 2026-09-11 blind playtest
 * is why they were not enough: a policy names a facing, and a first-time player
 * does not. With the facing decided for them by the tile edge nearest the tray,
 * four of five testers were still in 1-2 when they quit. Three tests were added
 * for what that missed — the ghost's move has to FINISH its lesson, an
 * `inputBiased` player has to get out of every lesson, and a player who never
 * touches anything has to be carried out rather than parked for 200 turns
 * (`LESSON_RESCUE_TURNS`). All three fail on the build the testers played.
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

  /**
   * ─── What the blind playtest measured, as a test ──────────────────────────
   *
   * Everything above asks the domain a question in the domain's own terms: a
   * policy names a facing, so a policy always aims. A first-time player does
   * not aim — they drop the pebble in the middle of a tile and the input layer
   * decides — and on 2026-09-11 what it decided was the edge nearest the tray:
   * away from the enemy, every time. Four of five testers were still in 1-2
   * when they gave up, boards full, nothing in reach of the last dummy.
   *
   * These two are the ones that would have caught it.
   */
  it('the ghost\'s move FINISHES the lesson, with no second move the lesson never taught', () => {
    // Not "in one turn": 1-3's stack needs two swings and 1-6's cross needs
    // three, by design. The contract is that the taught move is ENOUGH — do it
    // and the lesson plays itself out, whatever the player does next.
    //
    // 1-2 failed this. Its comment had the arrow killing the archer at (1,0),
    // which `ARCHER_RANGE[1] = [2]` cannot reach from (1,3), so the ghost's move
    // left a survivor nothing on the board could touch. Note the REASON as well
    // as the win: the rescue below would otherwise hide exactly this bug.
    for (const id of LESSONS) {
      for (let seed = 1; seed <= 20; seed++) {
        const s = playNode(id, 'medium', seed, ghostThen(zeroInput()))
        expect(s.result?.won, `node ${id} seed ${seed}`).toBe(true)
        expect(s.result?.reason, `node ${id} seed ${seed}`).toBe('eliminated')
        expect(s.result!.turns, `node ${id} seed ${seed}`).toBeLessThanOrEqual(3)
      }
    }
  })

  it('cannot trap a player whose stones all point the wrong way', () => {
    // `inputBiased` is the real first-timer: random tiles, every stone facing
    // the tray it came from. Both hands, because the tray is below the board on
    // a phone and to the right of it on a desktop.
    for (const from of ['tray-below', 'tray-right'] as const) {
      for (const id of LESSONS) {
        expect(clearRate(id, 'medium', 20, (seed) => inputBiased(seed, from)), `node ${id} from ${from}`).toBe(1)
        for (let seed = 1; seed <= 5; seed++) {
          const s = playNode(id, 'medium', seed, inputBiased(seed, from))
          // Cleared, and NOT after a hundred turns of nothing: either they
          // blunder into a hit, or the lesson crumbles and hands itself over.
          expect(s.result!.turns, `node ${id} seed ${seed} from ${from}`).toBeLessThanOrEqual(LESSON_RESCUE_TURNS + 2)
        }
      }
    }
  })

  it('a player who never touches anything is carried out of a lesson, not left in it', () => {
    // The floor of the floor: no input at all. Some lessons finish themselves
    // (1-2's preset sword is already swinging at the skeleton), the rest
    // crumble — but none of them sits there for 200 turns, which is what the
    // testers actually experienced.
    for (const id of LESSONS) {
      const s = playNode(id, 'medium', 1, zeroInput())
      expect(s.result?.won, `node ${id}`).toBe(true)
      expect(['eliminated', 'crumbled'], `node ${id}`).toContain(s.result!.reason)
      expect(s.result!.turns, `node ${id}`).toBeLessThanOrEqual(LESSON_RESCUE_TURNS + 1)
    }
  })

  it('crumbles the lesson nobody can finish — the exact stall the testers hit', () => {
    // 1-1 with no input at all: one skeleton, nothing of the player's on the
    // board to hurt it, and a 200-turn limit. Before the rescue this was a
    // match that could not end.
    const s = playNode(1, 'medium', 1, zeroInput())
    expect(s.result?.reason).toBe('crumbled')
    expect(s.result?.won).toBe(true)
    expect(s.result!.turns).toBe(LESSON_RESCUE_TURNS)
  })

  it('never crumbles a real fight, however long it drags', () => {
    // The rescue is a LESSON's, and only a lesson's. A duel that stalls has the
    // stall-breaker, sudden death and a turn limit — none of which hand out a
    // win the player did not earn.
    for (const id of [7, 8]) {
      const s = playNode(id, 'easy', 1, zeroInput())
      expect(s.result?.reason, `node ${id}`).not.toBe('crumbled')
      expect(s.result?.won, `node ${id}`).toBe(false)
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

/**
 * ─── The clash lesson ───────────────────────────────────────────────────────
 *
 * 2-3, and the only lesson in the game whose dummy PLACES anything — it has
 * to, because the rule is what happens when both sides reach for one tile in
 * the same turn, and a dummy that places nothing can never demonstrate it.
 *
 * So the invariant the late lessons are held to ("every enemy is passive and
 * places nothing") is deliberately broken here, and these tests stand in its
 * place: the dummy still cannot HURT anything (`atkMul: 0`), it places exactly
 * what the script says and nowhere else, and the node is still cleared by the
 * ghost's single move in one turn.
 */
describe('the clash lesson', () => {
  const id = CLASH_LESSON_NODE
  const cfg = () => nodeConfig(id, 'medium')

  it('is a lesson: clockless, scripted, a 1v1 against a dummy that cannot hurt', () => {
    const c = cfg()
    expect(c.tutorial).toBe('clash')
    expect(c.timer).toBe(false)
    expect(c.mode).toBe('1v1')
    expect(c.playerDeck).toContain(c.ghost!.type)
    for (const e of c.enemies) expect(e.atkMul).toBe(0)
  })

  it("sends its dummy at the ghost hand's own tile — the collision is the lesson", () => {
    const c = cfg()
    const written = c.enemies[0]!.script!
    expect(written.length).toBeGreaterThan(0)
    for (const m of written) {
      expect(m.side).toBe('enemy')
      expect({ col: m.col, row: m.row }).toEqual({ col: c.ghost!.to.col, row: c.ghost!.to.row })
    }
  })

  it('the dummy really does dive for that tile on turn 1, whatever the dice say', () => {
    const c = cfg()
    for (let seed = 1; seed <= 20; seed++) {
      const s = beginPlanning(createMatch(c, ['melee'], seed, 0), 'medium')
      expect(s.enemyMoves, `seed ${seed}`).toHaveLength(1)
      expect({ col: s.enemyMoves[0]!.col, row: s.enemyMoves[0]!.row })
        .toEqual({ col: c.ghost!.to.col, row: c.ghost!.to.row })
    }
  })

  it("the player's sword wins the tile and walks out of it WOUNDED", () => {
    // The half of the rule that costs matches: you keep the tile and you do
    // NOT keep the stone you paid for. 3 HP against the bow's 2 leaves 1.
    const c = cfg()
    const g = c.ghost!
    for (let seed = 1; seed <= 10; seed++) {
      let s = beginPlanning(createMatch(c, ['melee'], seed, 0), 'medium')
      s = commitPlayerMove(s, { side: 'player', faction: null, type: g.type, col: g.to.col, row: g.to.row, dir: g.dir })
      const { state, events } = resolveCurrentTurn(s)
      const clash = events.find((e) => e.kind === 'clash')
      expect(clash, `seed ${seed}`).toBeDefined()
      expect(clash!.kind === 'clash' && clash!.survivor?.side, `seed ${seed}`).toBe('player')
      expect(clash!.kind === 'clash' && clash!.survivor?.hp, `seed ${seed}`).toBe(1)
      // …and the enemy's stone is gone, with nothing but the sword standing.
      const mine = runesOf(state.board, 'player')
      expect(mine, `seed ${seed}`).toHaveLength(1)
      expect(mine[0]!.hp, `seed ${seed}`).toBeLessThan(mine[0]!.maxHp)
    }
  })

  it("is won by the ghost's move alone, in a single turn, on every seed", () => {
    // The wounded survivor still swings: the 1-HP skeleton above it falls in
    // the same resolution, so the lesson clears in one turn like every other.
    for (let seed = 1; seed <= 20; seed++) {
      const s = playNode(id, 'medium', seed, ghostThen(greedy))
      expect(s.result?.won, `seed ${seed}`).toBe(true)
      expect(s.result!.turns, `seed ${seed}`).toBe(1)
    }
  })

  it("cannot be lost once the ghost's move is made, whatever comes after it", () => {
    expect(clearRate(id, 'hard', 20, (seed) => ghostThen(careless(seed)))).toBe(1)
  })

  it('is still cleared by a player who taps at random — the dummy cannot win', () => {
    expect(clearRate(id, 'medium', 20, (seed) => careless(seed))).toBeGreaterThanOrEqual(0.5)
  })

  it('a script never overwrites a tile somebody is already standing on', () => {
    // The guard in `planEnemyMove`: the dummy dives only while the tile is
    // free. A player who took it on turn 1 is not evicted on turn 2.
    const c = cfg()
    const g = c.ghost!
    let s = beginPlanning(createMatch(c, ['melee'], 3, 0), 'medium')
    s = commitPlayerMove(s, { side: 'player', faction: null, type: g.type, col: g.to.col, row: g.to.row, dir: g.dir })
    s = nextTurn(resolveCurrentTurn(s).state, 0, 'medium')
    // The node is already won by here, so plan a turn on the resulting board
    // directly: the tile is occupied, and the passive dummy falls back to
    // placing nothing rather than to placing on top of the sword.
    const after = beginPlanning({ ...s, phase: 'planning', result: null, turn: 2 }, 'medium')
    expect(after.enemyMoves).toHaveLength(0)
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

/**
 * ─── The step from the last lesson to the first fight ───────────────────────
 *
 * The tests above measure 1-7 UNRELIEVED, which is the ceiling and stays put.
 * These measure what a player actually meets there on their first attempt,
 * which since `FIRST_FIGHT_FAILS` is the one-loss tier rather than nothing.
 *
 *                        careless   inputBiased   greedy   zero
 *     first attempt         25 %        25 %       98 %     0 %
 *     …at the tier          70 %        75 %      100 %     0 %
 *
 * (40 seeds each, medium, 2026-09-14. The before column is the same 25 % the
 * `FAIL_TIERS` ledger recorded, and the reason four of five round-2 blind
 * testers lost this node.)
 */
describe('the first fight opens one tier in', () => {
  const input = (over: Partial<HandicapInput> = {}): HandicapInput => ({
    difficulty: 'medium', nodeFails: 0, lossStreak: 0, playerPassedLastTurn: false, passesThisMatch: 0,
    tileDeficit: 0, runeDeficit: 0, turn: 1, suddenDeath: false, tutorial: false, matchElapsedMs: 0, ...over
  })
  /** What 1-7 hands a player who has not lost it yet. */
  const firstFight = computeHandicap(input({ firstFight: isFirstFightNode(FIRST_FIGHT_NODE) }))

  it('is 1-7: the first node that is a fight and not a lesson', () => {
    expect(isLessonNode(FIRST_FIGHT_NODE)).toBe(false)
    for (let id = 1; id < FIRST_FIGHT_NODE; id++) expect(isLessonNode(id), `node ${id}`).toBe(true)
    expect(isFirstFightNode(FIRST_FIGHT_NODE)).toBe(true)
  })

  /** A fresh policy per seed, as everywhere else in this file — 40 matches, 40 players. */
  const firstFightRate = (policy: (seed: number) => Policy, h: Handicap): number =>
    clearRate(FIRST_FIGHT_NODE, 'medium', 40, policy, h)

  it('lifts the players who were losing it out of the quit point', () => {
    // The cliff, as the blind testers met it…
    expect(firstFightRate((seed) => careless(seed), NO_HANDICAP)).toBeLessThanOrEqual(0.35)
    expect(firstFightRate((seed) => inputBiased(seed), NO_HANDICAP)).toBeLessThanOrEqual(0.35)
    // …and what the same seeds do once the first fight opens one tier in.
    expect(firstFightRate((seed) => careless(seed), firstFight)).toBeGreaterThanOrEqual(0.6)
    expect(firstFightRate((seed) => inputBiased(seed), firstFight)).toBeGreaterThanOrEqual(0.6)
  })

  it('is a thumb on the scale, not a hand: a player who never places still loses', () => {
    expect(clearRate(FIRST_FIGHT_NODE, 'medium', 10, () => zeroInput(), firstFight)).toBe(0)
    expect(clearRate(FIRST_FIGHT_NODE, 'easy', 10, () => zeroInput(), firstFight)).toBe(0)
  })

  it('leaves the ceiling where it was: a player who plays takes it either way', () => {
    expect(firstFightRate(() => greedy, NO_HANDICAP)).toBeGreaterThanOrEqual(0.8)
    expect(firstFightRate(() => greedy, firstFight)).toBeGreaterThanOrEqual(0.8)
  })

  it('is one node wide — 1-8 and every node after it start at nothing', () => {
    for (const id of [FIRST_FIGHT_NODE + 1, nodeId(2, 1), nodeId(3, 4)]) {
      expect(isFirstFightNode(id), `node ${id}`).toBe(false)
      expect(computeHandicap(input({ firstFight: isFirstFightNode(id) }))).toEqual(NO_HANDICAP)
    }
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

/**
 * ─── The wall at 1-7, and where the floor ended up ──────────────────────────
 *
 * Six tutorial nodes a beginner clears every time, then conquest: a new
 * objective, a live clock and a 10-turn limit, all arriving together. Two
 * blind testers lost 1-7 twice and stopped playing there, at about the three
 * minute mark — which is also where Poki's player fit test measures.
 *
 * Measured with `careless`, the scripted stand-in for someone who has not
 * understood the controls yet:
 *
 *     attempt 1   25 %      ← see below; no longer what 1-7 itself serves
 *     attempt 2   28 % → 70 %
 *     attempt 3   75 % → 93 %
 *
 * The adaptive curve was not missing, it was late: its one-loss tier granted
 * no `skipChance` at all, and the skip is what decides these matches. Each
 * tier now gives what the tier above it used to (see `FAIL_TIERS`).
 *
 * These tests pin BOTH halves — that the second attempt is genuinely easier,
 * and that none of it made the game playable by not playing.
 *
 * The 25 % first attempt was left alone here on the reasoning that a first
 * loss teaches. Round 2 of the blind playtest priced that reasoning: four of
 * the five testers who reached 1-7 lost it, and a first loss only teaches
 * somebody who plays again. The CURVE is unchanged — what moved is where 1-7
 * enters it (`FIRST_FIGHT_FAILS`, and 'the first fight opens one tier in'
 * above). So the rates below are the curve's own, measured by handing a
 * handicap straight to the harness; only 1-7's first attempt is served
 * differently, and no other node's is.
 */
describe('the conquest wall', () => {
  /** What the game holds back by, after `fails` losses on this node. */
  const afterLosses = (fails: number, difficulty: 'easy' | 'medium' = 'medium'): Handicap =>
    computeHandicap({
      difficulty, nodeFails: fails, lossStreak: fails, playerPassedLastTurn: false,
      passesThisMatch: 0, tileDeficit: 0, runeDeficit: 0, turn: 1,
      suddenDeath: false, tutorial: false, matchElapsedMs: 0
    })

  const rate = (id: number, h: Handicap, diff: 'easy' | 'medium' = 'medium'): number => {
    let wins = 0
    for (let seed = 1; seed <= 40; seed++) if (playNode(id, diff, seed, careless(seed), h).result?.won) wins++
    return wins / 40
  }

  it('starts at a real fight: with nothing held back, 1-7 is mostly lost', () => {
    // The curve's own zero point, and what every node except 1-7 serves on a
    // first attempt. 1-7 itself now opens one tier in — see 'the first fight
    // opens one tier in' above, which measures the same node the other way.
    const first = rate(7, NO_HANDICAP)
    expect(first).toBeGreaterThan(0.1)
    expect(first).toBeLessThan(0.45)
  })

  it('makes the SECOND attempt meaningfully easier, which is where they quit', () => {
    // The regression this guards: a one-loss tier with no skip in it, worth
    // three points over no relief at all.
    expect(rate(7, afterLosses(1))).toBeGreaterThan(0.55)
  })

  it('is monotone across attempts — losing again never gets harder', () => {
    let prev = 0
    for (const fails of [0, 1, 2, 3]) {
      const r = rate(7, afterLosses(fails))
      expect(r, `after ${fails} losses`).toBeGreaterThanOrEqual(prev - 0.05)
      prev = r
    }
    expect(prev).toBeGreaterThan(0.85)
  })

  it('FLOOR: a player who never places still cannot win, at any relief', () => {
    // Relief aimed at a beginner must never become a game that plays itself.
    for (const id of [7, 9]) {
      for (const fails of [0, 3]) {
        expect(rate1(id, zeroInput(), afterLosses(fails, 'easy')), `node ${id} after ${fails}`).toBe(0)
      }
    }
  })

  it('FLOOR: the pass mirror stops answering a player who is simply absent', () => {
    // On easy the mirror is a certainty, so a player who lets every window
    // run out used to face an enemy who did the same — and the siege's
    // hold-out objective then handed them the win: node 8 went to a
    // zero-input run 100 % of the time. `MIRROR_PATIENCE` ends that.
    const absent = (passes: number): Handicap => computeHandicap({
      difficulty: 'easy', nodeFails: 3, lossStreak: 3, playerPassedLastTurn: true,
      passesThisMatch: passes, tileDeficit: 6, runeDeficit: 4, turn: 9,
      suddenDeath: false, tutorial: false, matchElapsedMs: 0
    })
    // Still generous while the player is plausibly thinking…
    expect(absent(MIRROR_PATIENCE).skipChance).toBe(PASS_MIRROR.easy)
    // …and done once they are not.
    expect(absent(MIRROR_PATIENCE + 1).skipChance).toBeLessThan(PASS_MIRROR.easy)
    expect(rate1(8, zeroInput(), absent(9), 'easy')).toBeLessThan(0.25)
  })

  it('CEILING: a player who has understood it still wins it outright', () => {
    let wins = 0
    for (let seed = 1; seed <= 40; seed++) if (playNode(7, 'medium', seed, greedy).result?.won) wins++
    expect(wins / 40).toBeGreaterThan(0.9)
  })
})

/**
 * ─── The conquest guide ─────────────────────────────────────────────────────
 *
 * Every rune gets a lesson; the objective never did. 1-7 changes the win
 * condition, starts a clock and imposes a turn limit all at once, and two
 * blind testers lost it twice and stopped without working out how a tile
 * changes hands — one of them read the enemy placing runes as pieces that
 * "spawn and creep onto my side".
 *
 * A `guide` is the lesson hand on a node that stays a real fight: one taught
 * opening move, turn 1 only. What matters is that it did NOT quietly turn the
 * first real match into a seventh tutorial.
 */
describe('the conquest guide', () => {
  const FIRST_CONQUEST = 7

  it('opens the first conquest node with one taught move', () => {
    const cfg = nodeConfig(FIRST_CONQUEST, 'medium')
    expect(cfg.objective).toBe('conquest')
    expect(cfg.guide).toBeDefined()
    // The taught move steps OFF the player's home row onto neutral ground —
    // claiming a tile is the rule it exists to show.
    const board = createMatch(cfg, ['melee', 'archer', 'mage', 'defense', 'support'], 1, 0).board
    const home = board.tiles[cellIndex(cfg.guide!.to.col, cfg.guide!.to.row)]!
    expect(home.owner).toBe('neutral')
    expect(home.runeId).toBeNull()
  })

  it('is NOT a lesson — the node keeps its limit and its relief', () => {
    const cfg = nodeConfig(FIRST_CONQUEST, 'medium')
    // The distinction the whole design turns on: a tutorial beat would switch
    // off the adaptive relief (the ghost is the relief there), and the relief
    // on this node is measured and tuned. See `FAIL_TIERS`.
    expect(cfg.tutorial).toBeNull()
    // No clock anywhere now; the turn LIMIT is what still bounds this node.
    expect(cfg.timer).toBe(false)
    expect(cfg.turnLimit).toBe(10)
    expect(computeHandicap({
      difficulty: 'medium', nodeFails: 2, lossStreak: 2, playerPassedLastTurn: false,
      passesThisMatch: 0, tileDeficit: 0, runeDeficit: 0, turn: 1,
      suddenDeath: false, tutorial: cfg.tutorial !== null, matchElapsedMs: 0
    }).skipChance).toBeGreaterThan(0)
  })

  it('names a rune to teach with, and it is one the player owns by 1-7', () => {
    expect(nodeConfig(FIRST_CONQUEST, 'medium').guide!.type).toBe('melee')
  })

  it('leaves every other node alone', () => {
    for (const id of [1, 2, 3, 4, 5, 6, 8, 9, 10]) {
      expect(nodeConfig(id, 'medium').guide, `node ${id}`).toBeUndefined()
    }
  })
})
