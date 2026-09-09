/**
 * ─── The hand ───────────────────────────────────────────────────────────────
 *
 * Three pebbles drawn from a deck of rune TYPES, with replacement — the deck is
 * the roster, not a pile that runs out. One rule of taste: a hand of three
 * identical pebbles is a turn with no decision in it, so when the deck has any
 * variety at all the third pebble is redrawn once.
 */

import { HAND_SIZE, STARTING_RUNES, type RuneType } from './rules'
import { pick } from './rng'

const distinct = (deck: readonly RuneType[]): number => new Set(deck).size

const safeDeck = (deck: readonly RuneType[]): readonly RuneType[] =>
  deck.length > 0 ? deck : STARTING_RUNES

/** Draw a fresh hand of HAND_SIZE from `deck`. */
export const drawHand = (deck: readonly RuneType[], rng: number): [RuneType[], number] =>
  fillHand([], deck, rng)

/** Top `hand` up to HAND_SIZE, applying the no-triples rule to the last draw. */
export const fillHand = (hand: readonly RuneType[], deck: readonly RuneType[], rng: number): [RuneType[], number] => {
  const d = safeDeck(deck)
  const out = hand.slice(0, HAND_SIZE)
  let s = rng
  while (out.length < HAND_SIZE) {
    const [t, next] = pick(s, d)
    s = next
    out.push(t)
  }
  if (distinct(d) >= 2 && out.every((t) => t === out[0])) {
    const [t, next] = pick(s, d)
    s = next
    out[out.length - 1] = t
  }
  return [out, s]
}

/** Replace slot `index` with a new draw. */
export const refillSlot = (hand: readonly RuneType[], index: number, deck: readonly RuneType[], rng: number): [RuneType[], number] => {
  const out = hand.slice()
  const [t, next] = pick(rng, safeDeck(deck))
  if (index >= 0 && index < out.length) out[index] = t
  else out.push(t)
  return [out, next]
}
