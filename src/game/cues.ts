/**
 * ─── Audio cue vocabulary ───────────────────────────────────────────────────
 *
 * Every sound the game can ask for, by name. Lives apart from the mixer
 * (`useGameAudio.ts`) so the renderer, the battle composable and the HUD can
 * import the TYPE without pulling the synthesis code into their chunk — and so
 * a typo in a call site is a compile error rather than a silent missing sound.
 *
 * `useGameAudio.playFx(id, power)` is the only entry point. `power` is a 0..1
 * intensity hint (a bigger combo, a heavier shatter); it never changes WHICH
 * sound plays.
 */
export type FxSound =
  // ── input ──
  | 'pickup'      // a pebble lifted off the hand
  | 'hover'       // the drag crosses onto a valid tile
  | 'invalid'     // …onto a tile it cannot go
  | 'aim'         // the swipe snapped to a new direction
  | 'place'       // the heavy stone THUD of a placement locking in
  | 'reroll'
  // ── the clock ──
  | 'tick'        // planning timer, last three seconds
  | 'tickFinal'   // the final second
  | 'reveal'      // both moves shown; arrows fan out
  // ── resolution ──
  | 'arrow'       // an archer fires
  | 'arrowHit'
  | 'beam'        // a mage beam ignites
  | 'beamHit'
  | 'slash'       // a sword swings
  | 'slashHit'
  | 'cleave'      // the axe fans across the three tiles ahead
  | 'cleaveHit'
  | 'roll'        // the boulder sets off down its lane
  | 'rollHit'     // …and meets something it has to break
  | 'shell'       // the bombard lobs a round over the board
  | 'shellHit'    // …and it lands three ranks away
  | 'explode'     // the mage's Lv 2 cross
  | 'nuke'        // a nuker goes off: the whole board at once
  | 'crown'       // a crown takes an enemy rune and is spent doing it
  | 'shield'      // damage absorbed by a defense / aura
  | 'aura'        // a Lv 2 defense raising its shields over its neighbours
  | 'intercept'   // an arrow, beam or blade stopped dead on a shield stone
  | 'heal'
  | 'buff'
  | 'shatter'     // a rune breaks into rubble
  | 'clash'       // two placements collided
  | 'knockback'
  | 'capture'     // a tile changes hands
  | 'merge'       // the golden Lv 2 burst
  | 'combo'
  // ── match ──
  | 'victory'
  | 'defeat'
  | 'suddenDeath'
  | 'reset'       // the 0.2 s board wipe on play-again
  // ── meta ──
  | 'chestPop'    // the chest lands on the result screen
  | 'chestOpen'
  | 'unlock'      // a new rune / skin revealed
  | 'coin'
  | 'countUp'
  | 'streak'      // the flame aura climbs a step
  | 'forge'       // the offline forge paid out
  | 'skinBuy'
  | 'uiOpen'
  | 'uiReject'

/**
 * Where a cue happens and what made it — handed to a cue's recipe so the same
 * sound can sit where it happened and weigh what it weighs.
 *
 *   `pan`   −1 (left) … +1 (right): the renderer derives it from the event's
 *           position on the board, so a bow on the left twangs from the left.
 *   `level` the rune's level (1…8): a Lv 2+ rune may play heavier.
 *   `side`  whose rune it was, for a recipe that colours the two sides apart.
 *
 * All optional: a cue with no placement plays centred, at Lv 1.
 */
export interface SfxOpts {
  pan?: number
  level?: number
  side?: 'player' | 'enemy'
}
