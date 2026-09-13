/**
 * ─── Adaptive difficulty ────────────────────────────────────────────────────
 *
 * The enemy plays WORSE — and sometimes not at all — when the player is
 * struggling. Pure and total: any input yields a valid, clamped `Handicap`.
 *
 * Four signals, four answers:
 *
 *   • the player let the clock run out last turn → the enemy MIRRORS the pass
 *     and skips (always on easy, usually on medium, sometimes on hard). A
 *     beginner who could not decide in time must not fall a tile behind for it.
 *   • the player is behind on tiles → the enemy plays more random moves and
 *     sometimes passes.
 *   • the player has lost this node before, or is on a losing streak → the
 *     enemy hits softer, plays worse, and the planning clock runs longer.
 *   • it is the player's FIRST real fight → that same curve starts one tier
 *     in, because the loss it would otherwise wait for is the one that ends
 *     the session (see `FIRST_FIGHT_FAILS`).
 *
 * Never announced; never on a tutorial (the ghost hand is the relief there);
 * never a skip in sudden death (the match has to end); and scaled by the
 * player's own difficulty setting — "hard" halves every relief, "easy" adds a
 * quarter. The pass mirror is the one thing that is NOT scaled or clamped: it
 * is a mirror, not a relief, and its per-difficulty values are already the
 * answer.
 *
 * And the STALL-BREAKER, which is none of the above: past `STALL_BREAKER_MS`
 * the enemy starts making very stupid mistakes whatever the difficulty, the
 * node or the phase — a match may not be dragged out for ever. It ramps to
 * full strength at `STALL_BREAKER_FULL_MS` and, alone among the reliefs, keeps
 * its skip chance in sudden death, which is what ends a stalled one.
 *
 * `useAdaptive` gathers the input (persisted fails and streak, the board's
 * deficits, the clock's passes) and hands the result to `match.beginPlanning`
 * and the planning timer.
 */

import {
  NO_HANDICAP, PLANNING_MAX_MS, PLANNING_MS, STALL_BREAKER_FULL_MS, STALL_BREAKER_MS, type Handicap, type HandicapInput
} from './rules'

type Difficulty = HandicapInput['difficulty']

/** Chance the enemy skips after the player let the clock run out. */
export const PASS_MIRROR: Record<Difficulty, number> = { easy: 1, medium: 0.75, hard: 0.4 }
/** Every relief delta (skip, extra random, attack cut, timer bonus) is scaled by this. */
export const RELIEF_SCALE: Record<Difficulty, number> = { easy: 1.25, medium: 1, hard: 0.5 }

/** The most relief can make the enemy pass. */
export const SKIP_MAX = 0.8
/** The most relief can add to the enemy's random-move chance. */
export const EXTRA_RANDOM_MAX = 0.6
/** The softest the enemy ever hits. */
export const ATK_MUL_MIN = 0.6

/** Relief per tile deficit tier: `[deficit, extraRandom, skipChance]`, largest tier wins. */
const DEFICIT_TIERS: ReadonlyArray<readonly [number, number, number]> = [
  [5, 0.35, 0.35],
  [3, 0.2, 0.2]
]
/**
 * Relief per losses on this node: `[fails, attackCut, extraRandom, skipChance,
 * timerBonusMs]`, largest tier wins.
 *
 * ─── Why these numbers moved one tier earlier ───────────────────────────────
 *
 * The shape of this curve was right and its PHASE was wrong. Measured on node
 * 1-7 — the first conquest node, and the first thing after six tutorial wins —
 * with the `careless` policy, which is the scripted stand-in for a tester who
 * has not understood the controls yet:
 *
 *     attempt 1 (0 fails)   25 %
 *     attempt 2 (1 fail)    28 %   ← the relief had not arrived
 *     attempt 3 (2 fails)   75 %
 *     attempt 4 (3 fails)   93 %
 *
 * Flat across the first retry, because the old one-fail tier granted no
 * `skipChance` at all and the skip is what actually decides these matches.
 * Two blind testers lost 1-7 twice and stopped there — in the window where
 * the relief did not exist yet. Neither ever played the attempt that would
 * have been 75 %; one of them ran out of session in the middle of it
 * (2026-09-12 round 4).
 *
 * So each tier now gives what the tier above it used to. A player who loses
 * once gets the old two-loss relief, which is the one that visibly works. The
 * ceiling is unchanged in kind — three losses is still the most the game ever
 * holds back — and none of this touches a tutorial node, which gets no relief
 * by construction (the ghost hand is the relief there).
 */
const FAIL_TIERS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [3, 0.4, 0.45, 0.35, 3500],
  [2, 0.35, 0.4, 0.3, 3000],
  [1, 0.25, 0.3, 0.2, 2000]
]

/**
 * ─── The first real fight starts one tier in ────────────────────────────────
 *
 * The curve above answers a player who has LOST. That is the right shape for
 * every node but one: 1-7, where the loss it waits for is the one that ends
 * the session. Six lessons precede it, each won with a single correct move
 * against dummies that never place, and then the game asks for a planned match
 * against an opponent trying to win — the steepest step it ever takes, and the
 * only one where the player has no prior fight to have learned from.
 *
 * Measured on 1-7 with the scripted stand-ins for a player who has not
 * mastered the controls (40 seeds each, medium, `tests/game/floor.test.ts`):
 *
 *                        careless   inputBiased   greedy   zero
 *     first attempt         25 %        25 %       98 %     0 %
 *     …at this tier         70 %        75 %      100 %     0 %
 *
 * Four of the five round-2 blind testers reached 1-7 and lost it (2026-09-12).
 * Three quarters of weak players losing the first fight is not a difficulty
 * curve, it is the quit point.
 *
 * So the first fight opens at the ONE-LOSS tier rather than at nothing: the
 * enemy passes now and then, plays worse, and hits at three quarters. Nothing
 * new is invented — it is the tier the same player would have been given one
 * loss later, moved to where the loss actually costs something. A quarter of
 * them still lose it and then get the two-loss tier exactly as before, the
 * ceiling is untouched (a player who plays takes it either way), and a player
 * who never places still cannot win: relief is a thumb on the scale, never a
 * hand.
 *
 * Node-keyed on purpose, and one node wide. 1-8 keeps its own numbers.
 *
 * (The tier's clock bonus rides along and does nothing: no node has a planning
 * clock any more. It is left in so the rule stays "the one-loss tier" whole,
 * and so a timed variant would inherit it without a second decision.)
 */
const FIRST_FIGHT_FAILS = 1

/**
 * How many windows a player may let run out before the pass mirror stops
 * answering. Generous — a beginner reading the board is the case it exists
 * for — but finite, because an enemy that mirrors an absent player for ever
 * hands them a win they never played for.
 */
export const MIRROR_PATIENCE = 3

/** Two losses in a row, anywhere: a little more randomness and a longer clock. */
const LOSS_STREAK_AT = 2
const LOSS_STREAK_EXTRA_RANDOM = 0.1
const LOSS_STREAK_TIMER_MS = 1000

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

/** 0 before `STALL_BREAKER_MS`, 1 from `STALL_BREAKER_FULL_MS` on, linear between. */
export const stallRamp = (matchElapsedMs: number): number =>
  clamp01((num(matchElapsedMs) - STALL_BREAKER_MS) / (STALL_BREAKER_FULL_MS - STALL_BREAKER_MS))

/** The stall-breaker's floor on the enemy's mistakes at ramp `k`. */
export const STALL_EXTRA_RANDOM = (k: number): number => 0.5 + 0.4 * k
export const STALL_SKIP = (k: number): number => 0.3 + 0.3 * k
export const STALL_ATK_MUL = (k: number): number => 1 - 0.25 * k

/** The stall-breaker on top of any relief: mistakes at least this bad, hits at most this hard. */
const applyStall = (h: Handicap, matchElapsedMs: number): Handicap => {
  const k = stallRamp(matchElapsedMs)
  if (k <= 0) return h
  return {
    skipChance: Math.min(SKIP_MAX, Math.max(h.skipChance, STALL_SKIP(k))),
    extraRandom: Math.min(EXTRA_RANDOM_MAX, Math.max(h.extraRandom, STALL_EXTRA_RANDOM(k))),
    atkMul: Math.max(ATK_MUL_MIN, Math.min(h.atkMul, STALL_ATK_MUL(k))),
    timerMs: h.timerMs
  }
}
const difficultyOf = (v: unknown): Difficulty => (v === 'easy' || v === 'hard' ? v : 'medium')

/**
 * How much the enemy should hold back this turn, given how the player is
 * doing. Returns `NO_HANDICAP` for a tutorial node and for a player who is
 * fine; every field of the result is inside its clamp whatever the input.
 */
export const computeHandicap = (input: HandicapInput): Handicap =>
  applyStall(baseHandicap(input), num(input.matchElapsedMs))

/** Everything but the stall-breaker. */
const baseHandicap = (input: HandicapInput): Handicap => {
  if (input.tutorial) return { ...NO_HANDICAP }
  const difficulty = difficultyOf(input.difficulty)
  const scale = RELIEF_SCALE[difficulty]

  let skip = 0
  let extraRandom = 0
  let attackCut = 0
  let timerBonus = 0

  const deficit = num(input.tileDeficit)
  const deficitTier = DEFICIT_TIERS.find(([at]) => deficit >= at)
  if (deficitTier) {
    extraRandom += deficitTier[1]
    skip = Math.max(skip, deficitTier[2])
  }

  // The first fight enters the curve at `FIRST_FIGHT_FAILS`; a player who has
  // really lost more than that keeps the larger tier, so relief stays monotonic
  // in the losses whatever the node.
  const fails = Math.max(num(input.nodeFails), input.firstFight === true ? FIRST_FIGHT_FAILS : 0)
  const failTier = FAIL_TIERS.find(([at]) => fails >= at)
  if (failTier) {
    attackCut = Math.max(attackCut, failTier[1])
    extraRandom += failTier[2]
    skip = Math.max(skip, failTier[3])
    timerBonus += failTier[4]
  }

  if (num(input.lossStreak) >= LOSS_STREAK_AT) {
    extraRandom += LOSS_STREAK_EXTRA_RANDOM
    timerBonus += LOSS_STREAK_TIMER_MS
  }

  // Scale, then clamp.
  skip = Math.min(SKIP_MAX, skip * scale)
  extraRandom = Math.min(EXTRA_RANDOM_MAX, extraRandom * scale)
  const atkMul = Math.max(ATK_MUL_MIN, 1 - attackCut * scale)
  const timerMs = Math.min(PLANNING_MAX_MS, PLANNING_MS + Math.round(timerBonus * scale))

  // The mirror sits on top of the relief; sudden death switches every skip off.
  //
  // …but it mirrors a player who is THINKING, not one who is absent. On easy
  // the mirror is a certainty, so a player who passes every single window
  // faces an enemy who does the same, and the match becomes a staring contest
  // that the siege's "hold out" objective then awards to the player: a
  // zero-input run took node 1-8 100 % of the time at full relief. That is the
  // game playing itself, which teaches nothing and is worth nothing.
  //
  // So the mirror expires. Up to `MIRROR_PATIENCE` passes it is a courtesy for
  // someone who ran out of time; past that the player is not playing, and the
  // enemy stops waiting for them. Measured in passes, never in wall clock —
  // see the same rule in the onboarding traps.
  const absent = num(input.passesThisMatch) > MIRROR_PATIENCE
  if (input.playerPassedLastTurn === true && !input.suddenDeath && !absent) {
    skip = Math.max(skip, PASS_MIRROR[difficulty])
  }
  if (input.suddenDeath) skip = 0

  return { skipChance: skip, extraRandom, atkMul, timerMs }
}
