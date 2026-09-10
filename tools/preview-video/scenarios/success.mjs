/**
 * ─── SUCCESS (10 s): "behind, level, won" ───────────────────────────────────
 *
 * WHAT THE VIEWER SEES — with NO interface, so the board is the score
 *
 * The goblins hold most of the board and the player is one tile behind. An
 * axe rises in from the bottom of the frame, considers the open tile beside
 * the enemy line, and slams down: its arc takes two goblin stones at once.
 * Then the bomb rises, reads three tiles — and goes off. Every goblin stone on
 * the board is vaporised in one flash; every wreathed blue stone walks out of
 * it. The victory shower, the board wipes, and the next level is on screen
 * before the clip ends.
 *
 * BEAT SHEET  (10 s @ 30 fps = 300 frames; seconds into `record`)
 *
 *   0.0   the axe is already rising in from the bottom edge
 *   0.4   it rests on (3,2) — its aim cone lights the goblin line above
 *   1.3   RELEASE onto (3,1), aimed up: straight to the reveal
 *   1.6   the resolution: the arc takes the goblin blade and bow on row 0
 *   3.2   the bomb rises; rests on (2,0), (3,0)…
 *   5.1   …and RELEASE onto (0,2)
 *   5.6   THE FLASH: six goblin stones vaporised (`hero` just after, the poster)
 *   7.0   the victory shower and shake — the renderer's own
 *   8.3   the board wipes into the next level; the next stone is rising at 10
 *
 * THE TILE ARITHMETIC — checked headlessly against `resolveTurn`
 *
 *   start      P6  E7   (the goblins hold row 0, (0,1) (1,1), and ground (2,1))
 *   exchange 1 P7  E6   the axe (Lv 3, a power rune) claims (3,1); its arc
 *                       kills the blade on (2,0) and the bow on (3,0). The
 *                       goblins answer into (3,2).
 *   exchange 2 P8  E1   the bomb claims (0,2) and vaporises every Lv 1 stone —
 *                       all six goblins, their new one included. Every blue
 *                       stone is Lv 2+ and survives NUKE_DAMAGE (3). (2,1) is
 *                       EMPTY goblin ground: nothing on it to lose.  → WON
 *
 * The player's line is deliberately all SHIELDS (attack 0) plus one blade
 * facing its own shield, so the only things that change hands are the two
 * placements and the two blasts. (It was a cross until the clean feed: the
 * painted obsidian cross carries a baked sheet number and is denied for the
 * recording, and its procedural stand-in is a different art style.)
 */

import * as g from './_drive.mjs'

const BOARD = {
  turn: 5,
  runes: [
    ['enemy', 'melee', 0, 0, 'down', 1, 3],
    ['enemy', 'archer', 1, 0, 'down', 1, 2],
    ['enemy', 'melee', 2, 0, 'down', 1, 3],   // the axe takes this one
    ['enemy', 'archer', 3, 0, 'down', 1, 2],  // …and this one
    ['enemy', 'melee', 0, 1, 'down', 1, 3],
    ['enemy', 'defense', 1, 1, 'omni', 1, 9],
    ['player', 'defense', 1, 2, 'omni', 2, 18],
    ['player', 'defense', 2, 2, 'omni', 2, 18],
    ['player', 'melee', 0, 3, 'up', 2, 6],    // faces its own shield: swings, hits nothing
    ['player', 'defense', 1, 3, 'omni', 2, 18]
  ],
  enemy: [[2, 1]],
  player: [[2, 3], [3, 3]],
  hand: ['cleave', 'nuker', 'defense']
}

const c = (col, row) => ({ col, row })

const ENEMY_TURNS = [
  [{ type: 'melee', ...c(3, 2), dir: 'up' }],   // answers into the player's half
  [{ type: 'melee', ...c(3, 0), dir: 'down' }], // …and is vaporised committing it
  // Node 8, the siege, in the last half-second: all three armies close on the
  // shield the player just put down. Authored like the rest — the AI's own pick
  // put a goblin bow on the player's centre square.
  [
    { type: 'melee', ...c(2, 0), dir: 'down', faction: 'goblin' },
    { type: 'archer', ...c(0, 1), dir: 'right', faction: 'orc' },
    { type: 'melee', ...c(3, 1), dir: 'left', faction: 'undead' }
  ]
]

export default {
  id: 'success',
  label: 'Behind, level, won',

  async setup(ctx) {
    // One power rune arms the first axe at Lv 3 — a real mechanic, and
    // load-bearing: a Lv 1 axe would be vaporised by the player's own bomb.
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
      { label: 'axe', beat: 'axe', hand: ['cleave', 'nuker', 'defense'],
        carry: { via: [{ cell: c(3, 2), dir: 'up' }], to: { cell: c(3, 1), dir: 'up' } } },
      // The flash is at +160 into the resolution and runs to +440; `hero` at
      // +520 is past the white, where the wreckage reads — the poster.
      { label: 'bomb', beat: 'bomb', hand: ['nuker', 'defense', 'melee'], hero: 520,
        carry: { via: [{ cell: c(2, 0) }, { cell: c(3, 0) }], to: { cell: c(0, 2), dwell: 280 } } }
    ])
    if (!ok) return

    ctx.beat('victory')
    ctx.log.info(JSON.stringify(await g.snapshot(ctx)))
    // The shower and the shake are the verdict; then straight into the next
    // level, so the last second is a board wipe and a stone rising, not a hold.
    if (!(await t.wait(1250))) return
    await g.playAgain(ctx, { next: true })
    ctx.beat('next')
    await g.awaitPlanning(ctx, t, 1500, 100, { strict: true })
    await g.primeInput(ctx)
    await g.setHand(ctx, ['defense', 'melee', 'archer'])
    await g.carry(ctx, t, { via: [{ cell: c(1, 2) }], to: { cell: c(2, 1) }, dwellMs: 420 })
  }
}
