import { describe, expect, it } from 'vitest'
import {
  ATK_MUL_MIN, EXTRA_RANDOM_MAX, PASS_MIRROR, RELIEF_SCALE, SKIP_MAX, STALL_ATK_MUL, STALL_EXTRA_RANDOM, STALL_SKIP,
  computeHandicap, stallRamp
} from '@/game/adaptive'
import {
  NO_HANDICAP, PLANNING_MAX_MS, PLANNING_MS, STALL_BREAKER_FULL_MS, STALL_BREAKER_MS, type Handicap, type HandicapInput
} from '@/game/rules'

/** A player who is doing fine. */
const fine = (over: Partial<HandicapInput> = {}): HandicapInput => ({
  difficulty: 'medium', nodeFails: 0, lossStreak: 0, playerPassedLastTurn: false, passesThisMatch: 0,
  tileDeficit: 0, runeDeficit: 0, turn: 1, suddenDeath: false, tutorial: false, matchElapsedMs: 0, ...over
})

const inBounds = (h: Handicap): void => {
  expect(h.skipChance).toBeGreaterThanOrEqual(0)
  expect(h.skipChance).toBeLessThanOrEqual(1)
  expect(h.extraRandom).toBeGreaterThanOrEqual(0)
  expect(h.extraRandom).toBeLessThanOrEqual(EXTRA_RANDOM_MAX)
  expect(h.atkMul).toBeGreaterThanOrEqual(ATK_MUL_MIN)
  expect(h.atkMul).toBeLessThanOrEqual(1)
  expect(h.timerMs).toBeGreaterThanOrEqual(PLANNING_MS)
  expect(h.timerMs).toBeLessThanOrEqual(PLANNING_MAX_MS)
  for (const v of Object.values(h)) expect(Number.isFinite(v)).toBe(true)
}

describe('no relief', () => {
  it('for a player who is fine', () => {
    expect(computeHandicap(fine())).toEqual(NO_HANDICAP)
    expect(computeHandicap(fine({ difficulty: 'easy' }))).toEqual(NO_HANDICAP)
  })

  it('ever on a tutorial, whatever else is true', () => {
    const struggling = fine({ tutorial: true, nodeFails: 9, lossStreak: 9, playerPassedLastTurn: true, tileDeficit: 8 })
    expect(computeHandicap(struggling)).toEqual(NO_HANDICAP)
    // …and a fresh object, never the shared constant.
    expect(computeHandicap(struggling)).not.toBe(NO_HANDICAP)
  })
})

describe('mirroring a pass', () => {
  it('skips at the difficulty\'s own rate after the player let the clock run out', () => {
    expect(computeHandicap(fine({ playerPassedLastTurn: true, difficulty: 'easy' })).skipChance).toBe(1)
    expect(computeHandicap(fine({ playerPassedLastTurn: true, difficulty: 'medium' })).skipChance).toBe(0.75)
    expect(computeHandicap(fine({ playerPassedLastTurn: true, difficulty: 'hard' })).skipChance).toBe(0.4)
    expect(PASS_MIRROR).toEqual({ easy: 1, medium: 0.75, hard: 0.4 })
  })

  it('touches nothing but the skip', () => {
    const h = computeHandicap(fine({ playerPassedLastTurn: true }))
    expect(h).toMatchObject({ extraRandom: 0, atkMul: 1, timerMs: PLANNING_MS })
  })

  it('never in sudden death — the match has to end', () => {
    const h = computeHandicap(fine({ playerPassedLastTurn: true, suddenDeath: true, difficulty: 'easy' }))
    expect(h.skipChance).toBe(0)
    const behind = computeHandicap(fine({ suddenDeath: true, tileDeficit: 6, nodeFails: 4 }))
    expect(behind.skipChance).toBe(0)
    // The other reliefs stay.
    expect(behind.extraRandom).toBeGreaterThan(0)
    expect(behind.atkMul).toBeLessThan(1)
  })
})

describe('falling behind on tiles', () => {
  it('three behind: more random moves and a one-in-five pass', () => {
    expect(computeHandicap(fine({ tileDeficit: 3 }))).toEqual({ skipChance: 0.2, extraRandom: 0.2, atkMul: 1, timerMs: PLANNING_MS })
    expect(computeHandicap(fine({ tileDeficit: 4 }))).toEqual(computeHandicap(fine({ tileDeficit: 3 })))
  })
  it('five behind: more of both, as one tier — not both tiers stacked', () => {
    expect(computeHandicap(fine({ tileDeficit: 5 }))).toEqual({ skipChance: 0.35, extraRandom: 0.35, atkMul: 1, timerMs: PLANNING_MS })
    expect(computeHandicap(fine({ tileDeficit: 12 }))).toEqual(computeHandicap(fine({ tileDeficit: 5 })))
  })
  it('two behind is nothing yet', () => {
    expect(computeHandicap(fine({ tileDeficit: 2 }))).toEqual(NO_HANDICAP)
    expect(computeHandicap(fine({ tileDeficit: -4 }))).toEqual(NO_HANDICAP)
  })
})

describe('losing the same node again', () => {
  // ── Re-based when the curve moved one tier earlier (2026-09-12) ──
  // The first loss now gives what the second used to. Measured cause: on the
  // first conquest node a `careless` player cleared 25 % on attempt 1 and
  // 28 % on attempt 2 — the relief had not arrived — and two blind testers
  // quit inside that window. See `FAIL_TIERS` for the numbers and the why.
  it('once: a pass now and then, softer hits, two seconds more on the clock', () => {
    expect(computeHandicap(fine({ nodeFails: 1 }))).toEqual({ skipChance: 0.2, extraRandom: 0.3, atkMul: 0.75, timerMs: 7000 })
  })
  it('twice: more of everything', () => {
    expect(computeHandicap(fine({ nodeFails: 2 }))).toEqual({ skipChance: 0.3, extraRandom: 0.4, atkMul: 0.65, timerMs: 8000 })
  })
  it('three or more: the most a node ever gives', () => {
    const three = computeHandicap(fine({ nodeFails: 3 }))
    expect(three).toEqual({ skipChance: 0.35, extraRandom: 0.45, atkMul: 0.6, timerMs: 8500 })
    expect(computeHandicap(fine({ nodeFails: 7 }))).toEqual(three)
  })
  it('is monotonic: one more loss never means less relief', () => {
    let prev = computeHandicap(fine({ nodeFails: 0 }))
    for (let fails = 1; fails <= 6; fails++) {
      const h = computeHandicap(fine({ nodeFails: fails }))
      expect(h.skipChance).toBeGreaterThanOrEqual(prev.skipChance)
      expect(h.extraRandom).toBeGreaterThanOrEqual(prev.extraRandom)
      expect(h.atkMul).toBeLessThanOrEqual(prev.atkMul)
      expect(h.timerMs).toBeGreaterThanOrEqual(prev.timerMs)
      prev = h
    }
  })
})

describe('a losing streak', () => {
  it('two losses in a row: a little randomness and a second on the clock', () => {
    expect(computeHandicap(fine({ lossStreak: 2 }))).toEqual({ skipChance: 0, extraRandom: 0.1, atkMul: 1, timerMs: 6000 })
    expect(computeHandicap(fine({ lossStreak: 1 }))).toEqual(NO_HANDICAP)
  })
  it('adds to the node\'s own relief', () => {
    const h = computeHandicap(fine({ lossStreak: 3, nodeFails: 1 }))
    expect(h.extraRandom).toBeCloseTo(0.4)
    expect(h.timerMs).toBe(8000)
  })
})

describe('the difficulty setting', () => {
  const struggling = (difficulty: HandicapInput['difficulty']) =>
    // Below every clamp on easy, so the scaling is visible in each field.
    // The tile-deficit tier left this fixture when `FAIL_TIERS` moved a tier
    // earlier: one fail plus a 3-tile deficit plus a streak now sums past
    // `EXTRA_RANDOM_MAX`, and a clamped field shows no scaling at all — easy
    // and medium both land on 0.6, which is exactly what this asserts against.
    computeHandicap(fine({ difficulty, nodeFails: 1, lossStreak: 2 }))

  it('hard halves every relief, easy adds a quarter', () => {
    expect(RELIEF_SCALE).toEqual({ easy: 1.25, medium: 1, hard: 0.5 })
    const m = struggling('medium')
    const h = struggling('hard')
    const e = struggling('easy')
    expect(h.skipChance).toBeCloseTo(m.skipChance / 2)
    expect(h.extraRandom).toBeCloseTo(m.extraRandom / 2)
    expect(1 - h.atkMul).toBeCloseTo((1 - m.atkMul) / 2)
    expect(h.timerMs - PLANNING_MS).toBe((m.timerMs - PLANNING_MS) / 2)
    expect(e.skipChance).toBeCloseTo(m.skipChance * 1.25)
    expect(e.extraRandom).toBeCloseTo(m.extraRandom * 1.25)
    expect(1 - e.atkMul).toBeCloseTo((1 - m.atkMul) * 1.25)
    expect(e.timerMs - PLANNING_MS).toBe((m.timerMs - PLANNING_MS) * 1.25)
  })

  it('orders the relief hard < medium < easy in every field', () => {
    const [h, m, e] = [struggling('hard'), struggling('medium'), struggling('easy')]
    expect(h.skipChance).toBeLessThan(m.skipChance)
    expect(m.skipChance).toBeLessThan(e.skipChance)
    expect(h.extraRandom).toBeLessThan(m.extraRandom)
    expect(m.extraRandom).toBeLessThan(e.extraRandom)
    expect(h.atkMul).toBeGreaterThan(m.atkMul)
    expect(m.atkMul).toBeGreaterThan(e.atkMul)
    expect(h.timerMs).toBeLessThan(m.timerMs)
    expect(m.timerMs).toBeLessThan(e.timerMs)
  })

  it('does not scale the pass mirror — it is a mirror, not a relief', () => {
    expect(computeHandicap(fine({ playerPassedLastTurn: true, difficulty: 'easy' })).skipChance).toBe(PASS_MIRROR.easy)
    expect(computeHandicap(fine({ playerPassedLastTurn: true, difficulty: 'hard' })).skipChance).toBe(PASS_MIRROR.hard)
  })
})

describe('clamps', () => {
  it('cap the skip, the randomness, the attack cut and the clock', () => {
    const worst = computeHandicap(fine({ difficulty: 'easy', nodeFails: 9, tileDeficit: 9, lossStreak: 9 }))
    // The relief's own skip tops out well under the cap (0.35 × 1.25); the cap is the safety net.
    expect(worst.skipChance).toBeCloseTo(0.4375)
    expect(worst.skipChance).toBeLessThanOrEqual(SKIP_MAX)
    expect(worst.extraRandom).toBe(EXTRA_RANDOM_MAX)
    expect(worst.atkMul).toBe(ATK_MUL_MIN)
    expect(worst.timerMs).toBe(PLANNING_MAX_MS)
    expect(SKIP_MAX).toBe(0.8)
    expect(EXTRA_RANDOM_MAX).toBe(0.6)
    expect(ATK_MUL_MIN).toBe(0.6)
    expect(PLANNING_MAX_MS).toBe(9000)
  })

  it('the mirror alone may exceed the skip cap; relief on top of it never lowers it', () => {
    const h = computeHandicap(fine({ difficulty: 'easy', playerPassedLastTurn: true, nodeFails: 9, tileDeficit: 9 }))
    expect(h.skipChance).toBe(1)
  })

  it('hold for any input, including garbage', () => {
    const garbage = [
      fine({ nodeFails: Number.NaN, lossStreak: Number.POSITIVE_INFINITY, tileDeficit: -Infinity }),
      fine({ nodeFails: -5, tileDeficit: 1e9, lossStreak: 1e9 }),
      { ...fine(), difficulty: 'nightmare' as HandicapInput['difficulty'] },
      { ...fine(), playerPassedLastTurn: undefined as unknown as boolean, suddenDeath: undefined as unknown as boolean }
    ]
    for (const g of garbage) inBounds(computeHandicap(g))
    expect(computeHandicap({ ...fine(), difficulty: 'nightmare' as HandicapInput['difficulty'], nodeFails: 1 }))
      .toEqual(computeHandicap(fine({ nodeFails: 1 })))
  })

  it('every combination of the signals stays inside the bounds', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (const nodeFails of [0, 1, 2, 3, 5]) {
        for (const tileDeficit of [0, 3, 5, 8]) {
          for (const lossStreak of [0, 2, 5]) {
            for (const passed of [false, true]) {
              for (const suddenDeath of [false, true]) {
                inBounds(computeHandicap(fine({ difficulty, nodeFails, tileDeficit, lossStreak, playerPassedLastTurn: passed, suddenDeath })))
              }
            }
          }
        }
      }
    }
  })
})

describe('the stall-breaker', () => {
  it('does nothing before 75 s, on any difficulty', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      expect(computeHandicap(fine({ difficulty, matchElapsedMs: 0 }))).toEqual(NO_HANDICAP)
      expect(computeHandicap(fine({ difficulty, matchElapsedMs: 74_000 }))).toEqual(NO_HANDICAP)
      expect(computeHandicap(fine({ difficulty, matchElapsedMs: STALL_BREAKER_MS }))).toEqual(NO_HANDICAP)
    }
    expect(stallRamp(STALL_BREAKER_MS)).toBe(0)
  })

  it('ramps from 75 s to full strength at 120 s and stays there', () => {
    const mid = computeHandicap(fine({ matchElapsedMs: (STALL_BREAKER_MS + STALL_BREAKER_FULL_MS) / 2 }))
    expect(mid.extraRandom).toBeCloseTo(Math.min(EXTRA_RANDOM_MAX, STALL_EXTRA_RANDOM(0.5)), 6)
    expect(mid.skipChance).toBeCloseTo(STALL_SKIP(0.5), 6)
    expect(mid.atkMul).toBeCloseTo(STALL_ATK_MUL(0.5), 6)
    inBounds(mid)
    const full = computeHandicap(fine({ matchElapsedMs: STALL_BREAKER_FULL_MS }))
    expect(full.extraRandom).toBe(EXTRA_RANDOM_MAX) // 0.9 wanted, clamped
    expect(full.skipChance).toBeCloseTo(0.6, 6)
    expect(full.atkMul).toBeCloseTo(0.75, 6)
    expect(full.timerMs).toBe(PLANNING_MS)
    expect(computeHandicap(fine({ matchElapsedMs: 10 * 60_000 }))).toEqual(full)
    expect(stallRamp(STALL_BREAKER_FULL_MS)).toBe(1)
    expect(stallRamp(Number.NaN)).toBe(0)
  })

  it('is monotone in the elapsed time', () => {
    let prev = computeHandicap(fine({ matchElapsedMs: 0 }))
    for (let t = 0; t <= 150_000; t += 5_000) {
      const h = computeHandicap(fine({ matchElapsedMs: t }))
      expect(h.extraRandom).toBeGreaterThanOrEqual(prev.extraRandom)
      expect(h.skipChance).toBeGreaterThanOrEqual(prev.skipChance)
      expect(h.atkMul).toBeLessThanOrEqual(prev.atkMul)
      inBounds(h)
      prev = h
    }
  })

  it('keeps its skip in sudden death — that is what ends a stalled one', () => {
    const sd = computeHandicap(fine({ suddenDeath: true, matchElapsedMs: STALL_BREAKER_FULL_MS }))
    expect(sd.skipChance).toBeCloseTo(0.6, 6)
    // …while the ordinary reliefs still switch theirs off there.
    const ordinary = computeHandicap(fine({ suddenDeath: true, tileDeficit: 5, playerPassedLastTurn: true }))
    expect(ordinary.skipChance).toBe(0)
  })

  it('applies on every difficulty and on a lesson too, and only ever adds to a relief', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const h = computeHandicap(fine({ difficulty, matchElapsedMs: STALL_BREAKER_FULL_MS }))
      expect(h.skipChance).toBeCloseTo(0.6, 6)
      expect(h.atkMul).toBeCloseTo(0.75, 6)
    }
    const lesson = computeHandicap(fine({ tutorial: true, matchElapsedMs: STALL_BREAKER_FULL_MS }))
    expect(lesson.skipChance).toBeCloseTo(0.6, 6)
    // A struggling player past the stall keeps whatever was larger.
    const struggling = computeHandicap(fine({ nodeFails: 3, matchElapsedMs: STALL_BREAKER_FULL_MS }))
    const base = computeHandicap(fine({ nodeFails: 3 }))
    expect(struggling.atkMul).toBe(Math.min(base.atkMul, 0.75))
    expect(struggling.skipChance).toBeGreaterThanOrEqual(base.skipChance)
    expect(struggling.timerMs).toBe(base.timerMs)
  })
})
