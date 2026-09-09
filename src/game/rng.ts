/**
 * ─── Seeded PRNG ────────────────────────────────────────────────────────────
 *
 * mulberry32. The state is a single 32-bit integer, so a match — AI dice,
 * hand draws — is fully described by one number and replays identically in a
 * test. Every function takes the state and RETURNS the next one; nothing here
 * is mutable.
 */

export const seedFrom = (...parts: number[]): number => {
  let h = 0x9e3779b9
  for (const p of parts) {
    h = Math.imul(h ^ (p | 0), 0x85ebca6b)
    h ^= h >>> 13
  }
  return h >>> 0
}

/** One step: `[value in [0, 1), nextState]`. */
export const rand = (state: number): [number, number] => {
  let a = (state + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return [value, a >>> 0]
}

/** Integer in `[0, n)`. */
export const randInt = (state: number, n: number): [number, number] => {
  const [v, next] = rand(state)
  return [Math.floor(v * n), next]
}

/** A uniformly chosen element. */
export const pick = <T>(state: number, items: readonly T[]): [T, number] => {
  const [i, next] = randInt(state, items.length)
  return [items[i]!, next]
}

/** Fisher–Yates, returning a new array. */
export const shuffle = <T>(state: number, items: readonly T[]): [T[], number] => {
  const out = items.slice()
  let s = state
  for (let i = out.length - 1; i > 0; i--) {
    const [j, next] = randInt(s, i + 1)
    s = next
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return [out, s]
}
