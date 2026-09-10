/**
 * ─── FAIL (30 s): "took their home, lost your own" ──────────────────────────
 *
 * WHAT THE VIEWER SEES — with NO interface, so the board is the score
 *
 * The player tears the goblins apart. In the first three seconds a Lv 3 axe
 * cleaves their whole home row — three stones shattering at once — and then
 * the player marches blue stones INTO that row, one after another: a shield, a
 * heavy sword, a bow, and a stack on the axe for good measure. Blue is all over
 * the enemy's side of the board; it looks won. Meanwhile, one goblin at a time,
 * red creeps into the player's own backyard — the left column, the far corner.
 *
 * Then the last move. The bow rises, rests on the open tile in the middle —
 * the one that wins the match — hesitates… and goes one tile right instead,
 * onto the square a goblin blade has been standing over, facing, since the
 * first frame. The blade cuts it down, a goblin steps onto the tile the bow
 * was just resting on, and the board is theirs. Defeat ash. The level wipes and
 * starts again, and this time a SHIELD goes down on that same square — and
 * holds.
 *
 * WHY THIS AND NOT A GRIND-DOWN
 *
 * A preview that makes a player want to press start has to lose in a way they
 * can see through, and here there is no hand tray to show the better piece —
 * so the better MOVE is shown instead: the bow rests on the winning tile for
 * most of a second before it is moved to the fatal one, and the goblin that
 * ends the match lands exactly there. "I had it, I moved it, I threw it." The
 * killer is on screen, aimed, and unmoving for twenty seconds before it acts.
 * And the retry ends on the right answer, which is the hook.
 *
 * BEAT SHEET  (30 s @ 30 fps = 900 frames; seconds into `record`)
 *
 *   0.0   the axe is already rising in from the bottom of the frame
 *   0–4   F1  THE AXE onto (1,1): its arc takes the goblins' whole home row —
 *              three shatters (`hero`-worthy, but the poster is saved for the
 *              throw). A goblin blade lands on (2,1).
 *   4–8   F2  a shield marches into the cleared corner (0,0); a goblin slips
 *              into (0,1)
 *   8–11  F3  a Lv 3 sword into (1,0), their home rank; a goblin to (0,2)
 *   11–15 F4  the axe is stacked — its glow; a goblin bow into the player's
 *              own home corner (0,3)
 *   15–19 F5  a Lv 3 bow into (2,0) — three blue stones in the goblins' home
 *              row; a goblin blade into the far corner (3,3). Seven each.
 *   19–21 F6  THE THROW: the bow rests on (2,2) — the winning tile — then
 *              slides onto (3,2), under the goblin blade on (3,1)
 *   21–23     the reveal: a goblin lands on (2,2); the blade swings at +760
 *              and the bow shatters (`hero` — the poster — is that frame)
 *   23–24     defeat ash (the renderer's own; no banner, no result screen)
 *   24–30     the retry: the wipe, the fresh board, and a SHIELD on (3,2) —
 *              the goblin blade lands where it stood before and the shield
 *              takes it; the next stone is rising when the clip ends.
 *
 * THE TILE ARITHMETIC — checked headlessly against `resolveTurn` itself
 *
 * The goblins can only finish on eight from seven, and kills only neutralise a
 * tile (a side gains at most one a turn, by placing). So: the axe's three kills
 * clear the goblins' home row, and every tile it cleared stays under the axe's
 * arc for the rest of the match — the goblins can never re-use them, so the
 * PLAYER does (F2 F3 F5), while the goblins rebuild on tiles no blue stone
 * attacks: the player's own half.
 *
 *   start      P3 E5    (blue: shields (1,2) (2,3) Lv2, ground (1,3))
 *   F1  P4 E3   the axe claims (1,1), kills (0,0) (1,0) (2,0); goblins take (2,1)
 *   F2  P5 E4   shield on (0,0); goblins take (0,1)
 *   F3  P6 E5   sword on (1,0) facing right, into nothing; goblins take (0,2)
 *   F4  P6 E6   a stack gains no tile; goblins take (0,3), the player's corner
 *   F5  P7 E7   bow on (2,0) facing right — it SKIPS the goblin bow on (3,0)
 *               and shoots off the board, so nobody dies; goblins take (3,3)
 *   F6  P7 E8   the bow claims (3,2): P8 for one step; the goblin bow on (3,0)
 *               and the blade on (3,1) hit it for 2 each — it had 2 → P7.
 *               A goblin claims (2,2)                    → enemy conquest, LOST
 */

import * as g from './_drive.mjs'

const BOARD = {
  turn: 4,
  runes: [
    ['enemy', 'melee', 0, 0, 'down', 1, 3],
    ['enemy', 'archer', 1, 0, 'down', 1, 2],
    ['enemy', 'melee', 2, 0, 'down', 1, 3],
    ['enemy', 'archer', 3, 0, 'down', 1, 2],
    // THE KILLER. Over the tile that ends the match, facing it, all clip long.
    ['enemy', 'melee', 3, 1, 'down', 1, 3],
    ['player', 'defense', 1, 2, 'omni', 2, 18],
    ['player', 'defense', 2, 3, 'omni', 2, 18]
  ],
  player: [[1, 3]],
  hand: ['cleave', 'defense', 'melee']
}

const c = (col, row) => ({ col, row })
const SAFE = c(2, 2)
const FATAL = c(3, 2)

const ENEMY_TURNS = [
  [{ type: 'melee', ...c(2, 1), dir: 'down' }],
  [{ type: 'melee', ...c(0, 1), dir: 'down' }],
  [{ type: 'melee', ...c(0, 2), dir: 'down' }],
  [{ type: 'archer', ...c(0, 3), dir: 'right' }],
  [{ type: 'melee', ...c(3, 3), dir: 'up' }],
  [{ type: 'melee', ...SAFE, dir: 'left' }],
  // ── the retry, node 7 again from a fresh board ──
  [{ type: 'melee', ...c(3, 1), dir: 'down' }],
  []
]

const EXCHANGES = [
  { label: 'F1 AXE', beat: 'axe', hand: ['cleave', 'defense', 'melee'],
    carry: { via: [{ cell: c(2, 1), dir: 'up' }], to: { cell: c(1, 1), dir: 'up' } } },
  { label: 'F2 shield', hand: ['defense', 'melee', 'archer'],
    carry: { via: [{ cell: c(0, 2) }, { cell: c(0, 1) }], to: { cell: c(0, 0) } } },
  { label: 'F3 sword', hand: ['melee', 'archer', 'cleave'],
    carry: { via: [{ cell: SAFE, dir: 'up' }, { cell: c(2, 0), dir: 'right' }], to: { cell: c(1, 0), dir: 'right' } } },
  { label: 'F4 stack', hand: ['cleave', 'archer', 'defense'],
    carry: { via: [{ cell: c(3, 3), dir: 'up' }, { cell: SAFE, dir: 'up' }], to: { cell: c(1, 1), dir: 'up' } } },
  { label: 'F5 bow', beat: 'won?', hand: ['archer', 'defense', 'nuker'],
    carry: { via: [{ cell: SAFE, dir: 'up' }, { cell: c(3, 2), dir: 'up' }], to: { cell: c(2, 0), dir: 'right' } } },
  // The hesitation is the whole beat: most of a second on the winning tile,
  // then one tile right. The blade lands at +760 into the resolution and the
  // dead are swept at +920; `hero` at +900 is the bow breaking.
  { label: 'F6 THE THROW', beat: 'throw', hand: ['archer', 'defense', 'nuker'], hero: 900,
    carry: { via: [{ cell: SAFE, dir: 'up', dwell: 750 }], to: { cell: FATAL, dir: 'left', dwell: 380 } } }
]

export default {
  id: 'fail',
  label: 'Took their home, lost your own',

  async setup(ctx) {
    await g.boot(ctx, { save: g.saveFixture({ gx_power_runes: { cleave: 1, melee: 1, archer: 1 } }) })
    const tiles = await g.stageBoard(ctx, BOARD)
    await g.scriptEnemyTurns(ctx, ENEMY_TURNS)
    await g.primeInput(ctx)
    ctx.log.info(`staged YOU ${tiles.player} / FOE ${tiles.enemy}${ctx.clean ? ' (clean feed)' : ''}`)
  },

  async record(ctx) {
    const t = g.budget(ctx)
    await g.unfreeze(ctx)
    ctx.beat('open')

    if (!(await g.playExchanges(ctx, t, EXCHANGES))) return

    // ── the defeat: the renderer's ash over the board ──
    ctx.beat('defeat')
    ctx.log.info(JSON.stringify(await g.snapshot(ctx)))
    // Ash over a still board: the draft measured this hold at 1.5 s as the one
    // near-static stretch in the clip, so it is kept short — the retry is the hook.
    if (!(await t.wait(850))) return

    // ── the retry: the same level, and the right piece on the same square ──
    await g.playAgain(ctx, { next: false })
    ctx.beat('retry')
    await g.awaitPlanning(ctx, t, 2000, 100, { strict: true })
    await g.primeInput(ctx)
    await g.playExchanges(ctx, t, [
      { label: 'retry 1', beat: 'better', hand: ['defense', 'archer', 'melee'],
        carry: { via: [{ cell: SAFE }], to: { cell: FATAL, dwell: 360 } } }
    ])
    await g.awaitPlanning(ctx, t, 1500, 100, { strict: true })
    await g.setHand(ctx, ['cleave', 'archer', 'defense'])
    await g.carry(ctx, t, { via: [{ cell: c(1, 2), dir: 'up' }, { cell: c(2, 2), dir: 'up' }], to: { cell: c(1, 1), dir: 'up' }, dwellMs: 500 })
  }
}
