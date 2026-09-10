/**
 * ─── FAIL (10 s): "seized it, threw it" ─────────────────────────────────────
 *
 * WHAT THE VIEWER SEES — with NO interface, so the board is the score
 *
 * The same knife-edge match, played the other way. The axe comes down into the
 * goblin line and breaks their bow — the player has the initiative. Then the
 * bow rises for the winning move, rests on the open tile at the top of the
 * board… and moves on, onto the square a goblin blade has been standing over,
 * facing, since the first frame. The blade cuts it down, a goblin shield lands
 * on the tile the bow was just resting on, and the board is theirs. Defeat
 * ash; the level wipes and starts again, and a shield is already on its way
 * to that same square.
 *
 * WHY THIS ONE AND NOT A GRIND-DOWN
 *
 * The mistake is legible in one frame: a 2 HP bow placed nose-to-nose with a
 * blade that has been aimed at that tile the whole clip. With no hand tray on
 * screen, the better move is shown by the stone itself — it rested on the
 * winning tile first — and the goblin that ends the match lands exactly there.
 *
 * BEAT SHEET  (10 s @ 30 fps = 300 frames; seconds into `record`)
 *
 *   0.0   the axe is already rising in; the blade on (3,1) faces (3,2)
 *   0.4   it rests on (2,2) — aim cone up
 *   1.3   RELEASE onto (2,1): straight to the reveal
 *   1.6   the arc breaks the goblin bow on (2,0); the shields either side ring
 *   3.2   the bow rises — rests on (2,0), the winning tile, for most of a second
 *   4.8   …and RELEASE onto (3,2), under the blade
 *   5.1   the reveal: a goblin SHIELD lands on (2,0)
 *   5.9   the blade swings; the bow shatters (`hero`, the poster, just after)
 *   6.8   defeat ash — the renderer's own
 *   8.1   the level wipes and restarts; a shield is rising toward (3,2)
 *
 * THE TILE ARITHMETIC — checked headlessly against `resolveTurn`
 *
 *   start        P6  E7  neutral 3
 *   exchange 1   P7  E7  the axe claims (2,1); its arc shatters the bow on
 *                        (2,0), the two goblin shields either side survive;
 *                        the goblins' blade claims (2,2)
 *   exchange 2   P7  E8  the bow claims (3,2) → P8 for one step; the goblin
 *                        shield claims (2,0) → E8. The bow's arrow flies OVER
 *                        the blade and rings off the shield on (3,0); then the
 *                        blade on (3,1) hits the bow for 2. It had 2.  → LOST
 *
 * The goblins' last stone is a SHIELD on purpose: the axe is still swinging into
 * that arc, and anything softer would be cut down and give the eighth tile
 * back. Both goblin shields carry extra hit points for the same reason.
 */

import * as g from './_drive.mjs'

const BOARD = {
  turn: 5,
  runes: [
    ['enemy', 'melee', 0, 0, 'down', 1, 3],
    ['enemy', 'defense', 1, 0, 'omni', 1, 14],  // rings, twice, and lives
    ['enemy', 'archer', 2, 0, 'down', 1, 2],    // the axe takes this one
    ['enemy', 'defense', 3, 0, 'omni', 1, 14],  // rings, twice, and lives
    ['enemy', 'melee', 0, 1, 'down', 1, 3],
    ['enemy', 'melee', 1, 1, 'down', 1, 3],
    // THE KILLER. Over the tile that ends the match, facing it, all clip long.
    ['enemy', 'melee', 3, 1, 'down', 1, 3],
    ['player', 'defense', 0, 2, 'omni', 2, 18],
    ['player', 'defense', 1, 2, 'omni', 2, 18],
    ['player', 'melee', 0, 3, 'up', 2, 6],      // faces its own shield: no accidental kill
    ['player', 'defense', 1, 3, 'omni', 2, 18]
  ],
  player: [[2, 3], [3, 3]],
  // neutral: (2,1) the axe's tile, (2,2) the goblins' answer, (3,2) the fatal one
  hand: ['cleave', 'archer', 'defense']
}

const c = (col, row) => ({ col, row })
const WINNING = c(2, 0)
const FATAL = c(3, 2)

const ENEMY_TURNS = [
  [{ type: 'melee', ...c(2, 2), dir: 'up' }],    // answers into the player's half
  [{ type: 'defense', ...WINNING, dir: 'omni' }], // …and walls off the eighth tile
  [{ type: 'melee', ...c(3, 1), dir: 'down' }]   // the retry: the blade again
]

export default {
  id: 'fail',
  label: 'Seized it, threw it',

  async setup(ctx) {
    await g.boot(ctx, { save: g.saveFixture({ gx_power_runes: { cleave: 1 } }) })
    const tiles = await g.stageBoard(ctx, BOARD)
    await g.scriptEnemyTurns(ctx, ENEMY_TURNS)
    await g.primeInput(ctx)
    ctx.log.info(`staged YOU ${tiles.player} / FOE ${tiles.enemy}${ctx.clean ? ' (clean feed)' : ''}`)
  },

  async record(ctx) {
    const t = g.budget(ctx)
    await g.unfreeze(ctx)
    ctx.beat('open')

    const ok = await g.playExchanges(ctx, t, [
      { label: 'axe', beat: 'axe', hand: ['cleave', 'archer', 'defense'],
        carry: { via: [{ cell: c(2, 2), dir: 'up' }], to: { cell: c(2, 1), dir: 'up' } } },
      // Most of a second on the winning tile, then one tile over. The blade
      // lands at +760 into the resolution and the dead are swept at +920;
      // `hero` at +1000 is the bow gone and the goblin shield standing.
      { label: 'the throw', beat: 'throw', hand: ['archer', 'defense', 'nuker'], hero: 1000,
        carry: { via: [{ cell: WINNING, dir: 'up', dwell: 700 }], to: { cell: FATAL, dir: 'up', dwell: 340 } } }
    ])
    if (!ok) return

    ctx.beat('defeat')
    ctx.log.info(JSON.stringify(await g.snapshot(ctx)))
    // The ash falls over a still board, so the hold is short: ~0.9 s measured
    // as the longest near-static stretch at 1.3 s, and the retry is the hook.
    if (!(await t.wait(850))) return
    // The same level, again — and the right piece heading for the same square.
    await g.playAgain(ctx, { next: false })
    ctx.beat('retry')
    await g.awaitPlanning(ctx, t, 1500, 100, { strict: true })
    await g.primeInput(ctx)
    await g.setHand(ctx, ['defense', 'archer', 'melee'])
    await g.carry(ctx, t, { to: { cell: FATAL }, dwellMs: 600 })
  }
}
