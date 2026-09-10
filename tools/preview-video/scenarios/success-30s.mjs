/**
 * ─── SUCCESS (30 s): "the whole match, and the button that ends it" ─────────
 *
 * WHAT THE VIEWER SEES — with NO interface, so the board is the score
 *
 * A match already under way, and the goblins are winning it. Their stones walk
 * down the board and the player's stones break under them — red spreading into
 * the blue half, two blue stones shattering in the first seven seconds. The
 * player digs in: a shield is stacked (its wreath appears — the tell that a
 * stone got stronger), a heavy sword holds the line and cuts a goblin down, and
 * then the axe comes down in the middle and cleaves three goblins at once.
 * The player rebuilds, both sides fill the board to seven… and the player
 * drops the bomb. Every unstacked stone on the board is vaporised in one flash;
 * every wreathed blue stone walks out of it. Victory shower, the board wipes,
 * and the next level — three enemy armies at once — is already moving.
 *
 * WHY THIS ARC
 *
 * It is the game's thesis played out at full length: simultaneous turns, the
 * swing of territory, and a win that pays off a decision (STACK, don't spread)
 * the player made three turns earlier. With no counters on screen, every beat
 * had to be something the board itself shows — a shatter, a tint flipping, a
 * wreath appearing, a flash.
 *
 * BEAT SHEET  (30 s @ 30 fps = 900 frames; seconds into `record`)
 *
 *   0.0   the first stone is already rising in from the bottom of the frame
 *   0–3   S1  the goblins push: a goblin blade lands mid-board, their bow and
 *              blade break the blue sword on (2,2). Blue plants a shield.
 *   3–6   S2  again: the blue sword on (0,2) falls to the goblin bow, a goblin
 *              archer lands on (1,1). Blue STACKS the shield — the wreath.
 *              The board is mostly red. This is the low point.
 *   6–10  S3  a Lv 3 sword drops onto (2,2) and cuts the wounded goblin blade
 *              down — holding, just.
 *   10–13 S4  THE AXE, Lv 3, into (1,2): its arc cleaves the goblin archer,
 *              the blade beside it and the goblin that has just stepped in —
 *              three shatters, the comeback starts.
 *   13–16 S5  the sword is stacked (it had been worn down by the goblin bow)
 *   16–19 S6  a Lv 3 bow into the gap on (1,1). Seven tiles each: the goblins'
 *              stones now fill the top and both flanks.
 *   19–22 S7  THE BOMB onto (2,1). The flash at ~21 s, seven goblin stones
 *              vaporised at once; every blue stone is Lv 2+ and survives.
 *              (`hero` — the poster — is the frame after the flash.)
 *   22–24     the victory shower and shake (the renderer's own; no banner)
 *   24–30     the board wipes into the next level — a 1v3 siege — and the
 *              player's shield takes a hit from all three armies; the next
 *              stone is already rising when the clip ends.
 *
 * THE TILE ARITHMETIC — checked headlessly against `resolveTurn` itself
 *
 *   start      P5  E5   (blue: swords (0,2) (2,2), shield (1,3) Lv2, ground (0,3) (2,3))
 *   S1  P5 E6   the blue sword on (2,2) takes the bow's 2 and the new blade's 2
 *   S2  P4 E7   the blue sword on (0,2) — worn to 1 — falls to the bow
 *   S3  P5 E7   Lv 3 sword kills the blade on (2,1); the goblins take (0,1)
 *   S4  P6 E5   the axe's arc (0,1) (1,1) (2,1): three kills; +1 each side
 *   S5  P6 E6   a stack gains no tile; the goblins take (0,2)
 *   S6  P7 E7   the bow on (1,1); the goblins take (3,3)
 *   S7  P8 E1   the bomb claims (2,1) and vaporises all seven goblin stones
 *               (their new one included); blue is all Lv 2+, NUKE_DAMAGE is 3,
 *               the worn sword was re-stacked in S5 for exactly this reason
 *                                                        → conquest, WON
 *
 * Every enemy move is authored (`scriptEnemyTurns`) and three power runes arm
 * the Lv 3 sword, axe and bow — the game's own mechanic, and what keeps every
 * blue stone alive through the blast.
 */

import * as g from './_drive.mjs'

const BOARD = {
  turn: 3,
  runes: [
    ['enemy', 'archer', 0, 0, 'down', 1, 2],
    ['enemy', 'melee', 1, 0, 'down', 1, 3],
    ['enemy', 'archer', 2, 0, 'down', 1, 2],
    ['enemy', 'melee', 3, 1, 'down', 1, 3],
    ['player', 'melee', 0, 2, 'up', 1, 3],
    ['player', 'melee', 2, 2, 'up', 1, 3],
    ['player', 'defense', 1, 3, 'omni', 2, 18]
  ],
  enemy: [[3, 0]],
  player: [[0, 3], [2, 3]],
  hand: ['defense', 'melee', 'archer']
}

const c = (col, row) => ({ col, row })

/** The goblins' turns, then the siege's first — three armies at once. */
const ENEMY_TURNS = [
  [{ type: 'melee', ...c(2, 1), dir: 'down' }],
  [{ type: 'archer', ...c(1, 1), dir: 'down' }],
  [{ type: 'melee', ...c(0, 1), dir: 'down' }],
  [{ type: 'melee', ...c(2, 1), dir: 'down' }],
  [{ type: 'melee', ...c(0, 2), dir: 'down' }],
  [{ type: 'melee', ...c(3, 3), dir: 'up' }],
  [{ type: 'melee', ...c(0, 1), dir: 'down' }],
  // ── node 8, the siege: goblin north, orc west, undead east ──
  [
    { type: 'melee', ...c(2, 0), dir: 'down', faction: 'goblin' },
    { type: 'archer', ...c(0, 1), dir: 'right', faction: 'orc' },
    { type: 'melee', ...c(3, 1), dir: 'left', faction: 'undead' }
  ]
]

const EXCHANGES = [
  { label: 'S1 push', beat: 'push', hand: ['defense', 'melee', 'archer'],
    carry: { via: [{ cell: c(1, 2) }], to: { cell: c(3, 2) } } },
  { label: 'S2 stack', beat: 'low', hand: ['defense', 'cleave', 'archer'],
    carry: { via: [{ cell: c(1, 2) }], to: { cell: c(3, 2) } } },
  { label: 'S3 hold', hand: ['melee', 'cleave', 'archer'],
    carry: { via: [{ cell: c(1, 2), dir: 'up' }], to: { cell: c(2, 2), dir: 'up' } } },
  { label: 'S4 AXE', beat: 'axe', hand: ['cleave', 'archer', 'nuker'],
    carry: { via: [{ cell: c(0, 2), dir: 'up' }], to: { cell: c(1, 2), dir: 'up' } } },
  { label: 'S5 stack', hand: ['melee', 'archer', 'nuker'],
    carry: { via: [{ cell: c(0, 1), dir: 'up' }], to: { cell: c(2, 2), dir: 'up' } } },
  { label: 'S6 bow', beat: 'even', hand: ['archer', 'nuker', 'defense'],
    carry: { via: [{ cell: c(2, 1), dir: 'up' }], to: { cell: c(1, 1), dir: 'up' } } },
  // The bomb considers (0,1) first — a beat longer — and goes to the middle.
  // The flash is at +160 into the resolution and runs to +440; `hero` at +520
  // is past the white, on the frame where the wreckage reads.
  { label: 'S7 BOMB', hand: ['nuker', 'defense', 'archer'], hero: 520,
    carry: { via: [{ cell: c(0, 1), dwell: 420 }], to: { cell: c(2, 1), dwell: 300 } } }
]

export default {
  id: 'success',
  label: 'The whole match, and the bomb that ends it',

  async setup(ctx) {
    // One power rune each arms the first sword, axe and bow at Lv 3.
    await g.boot(ctx, { save: g.saveFixture({ gx_power_runes: { melee: 1, cleave: 1, archer: 1 } }) })
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

    // ── the verdict: the renderer's victory shower and shake ──
    ctx.beat('victory')
    ctx.log.info(JSON.stringify(await g.snapshot(ctx)))
    if (!(await t.wait(1300))) return

    // ── the next level: the wipe, then three armies at once ──
    await g.playAgain(ctx, { next: true })
    ctx.beat('next')
    await g.awaitPlanning(ctx, t, 2000, 100, { strict: true })
    await g.primeInput(ctx)
    await g.playExchanges(ctx, t, [
      { label: 'siege 1', beat: 'siege', hand: ['defense', 'melee', 'archer'],
        carry: { to: { cell: c(2, 1), dwell: 380 } } }
    ])
    // …and the next stone is on its way when the clip runs out.
    await g.awaitPlanning(ctx, t, 1500, 100, { strict: true })
    await g.setHand(ctx, ['melee', 'archer', 'defense'])
    await g.carry(ctx, t, { via: [{ cell: c(1, 3), dir: 'up' }, { cell: c(2, 3), dir: 'up' }], to: { cell: c(1, 1), dir: 'up' }, dwellMs: 500 })
  }
}
