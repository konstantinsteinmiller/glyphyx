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
  | 'shield'      // damage absorbed by a defense / aura
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
