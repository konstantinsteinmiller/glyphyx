/**
 * ─── Glyphyx: everything the preview recorder needs to know about THIS game ──
 *
 * The scenario modules are pure beat sheets. All of the game-specific
 * knowledge — how to boot it, how to freeze it, how to force a board, how to
 * carry a rune onto it — lives here, so porting the pipeline to another game is
 * "rewrite this one file plus the beat sheets".
 *
 * ── The three seams this game gives us ──
 *
 *   window.__glyphyx   { battle, campaign, economy, streak, skins, overlays,
 *                        winNow, stripRoom, layout }   (GameScene.vue)
 *   window.__arena     { layout(), hitTest(x, y) }     (useArenaInput.ts)
 *   window.__art       { status() }                    (the painted-art layer)
 *
 * ALL THREE ARE `import.meta.env.DEV` ONLY. They do not exist in a production
 * build, which is why the pipeline records against the Vite dev server. If you
 * port this, either keep an equivalent dev seam or drive the game through real
 * input events instead.
 *
 * ── The one non-obvious thing about staging a board ──
 *
 * `battle.view.board` and `battle.view.hand` are the SAME OBJECTS the match
 * state holds (`syncPlanning` assigns them by reference), so mutating them
 * mutates the live game. But the renderer keeps a display copy that it only
 * refreshes when `view.board` is a DIFFERENT OBJECT (`useArenaArt.ts`:
 * `else if (view.board !== dispSource)`). So a staged board has to be written
 * two ways at once: mutate the tiles/runes the engine holds IN PLACE, then
 * hand the view a NEW WRAPPER around those very same containers. Mutating
 * without re-wrapping stages a board only the engine can see; re-wrapping
 * without mutating stages one only the renderer can see. Both took a probe to
 * find, and neither fails loudly.
 *
 * ── Carrying a stone in a clean feed ──
 *
 * With no hand tray on screen (`?clean=1`), a rune that is merely SELECTED is
 * invisible: tap-to-place draws the selection as a highlight in the tray, and
 * the tray is gone. So placements here use the real DRAG protocol instead
 * (`beginDrag` / `updateDrag` / `endDrag`, as a precise pointer) — the renderer
 * draws a dragged stone under the pointer, snaps it onto a tile it rests on
 * with its aim cone, and slams it down on release. The clean layout parks the
 * hand slots just below the frame, so every stone visibly RISES into the shot.
 * See `carry()`.
 *
 * Every beat sheet checked here was first played headlessly against the
 * game's own resolver (`resolveTurn`) — board, moves and verdict — so the
 * tile arithmetic in each file header is the resolver's, not a guess.
 */

import { RUNE_TYPES, TIMING } from './_constants.mjs'

export { RUNE_TYPES, TIMING }

// ─── The save fixture ───────────────────────────────────────────────────────
//
// One `glyphyx_state` blob (src/keys.ts). Node 7 ("Level 1-7") is the first
// REAL duel — 1v1, objective `conquest`, easy goblins, the whole roster in
// hand. Nodes 1-1…1-6 and 10/14/18 are authored LESSONS with scripted ghost
// hands and no clock; they will fight any script you write, so never record on
// one. `gx_best_node: 8` makes node 7 a REPLAY, which matters: a first clear
// opens the chest ceremony before the result screen and would eat two seconds
// of the clip.

/** @param {Record<string, unknown>} [over] */
export const saveFixture = (over = {}) => ({
  gx_node: 7,
  gx_best_node: 8,
  gx_coins: 4200,
  gx_total_coins: 9000,
  gx_matches: 40,
  gx_wins: 26,
  // A live streak lights the flame aura around the board — free spectacle, and
  // unlike the ×2.5 on the result screen it survives a clean feed.
  gx_streak: 3,
  gx_best_streak: 5,
  gx_best_combo: 4,
  gx_unlocked_runes: RUNE_TYPES.slice(),
  gx_skins_owned: ['river', 'obsidian', 'jade'],
  // Obsidian: black glass with the glyph as a cold neon line. It reads far
  // better at video size than the beige river sandstone a new save starts on.
  gx_skin: 'obsidian',
  // Without these two the global control primers overlay the board.
  gx_tutorial_seen: true,
  gx_aimed: true,
  gx_results_seen: 9,
  gx_goal_seen: true,
  gx_rune_uses: Object.fromEntries(RUNE_TYPES.map((t) => [t, 20])),
  gx_power_runes: {},
  gx_rune_ranks: {},
  gx_failed_nodes: {},
  gx_loss_streak: 0,
  gx_user_difficulty: 'medium',
  // Recording is muted at the browser level too (`--mute-audio`); this stops
  // the game from even starting its audio graph.
  gx_user_sound_volume: 0,
  gx_user_music_volume: 0,
  gx_mobile_mute: true,
  ...over
})

/** Seed the save before the app's first line runs. */
export const seedSaveScript = (save) => {
  try { localStorage.setItem('glyphyx_state', JSON.stringify(save)) } catch { /* private mode */ }
}

// ─── Talking to the page safely ─────────────────────────────────────────────

/**
 * `ctx.evaluate` with a retry, in SETUP.
 *
 * A Vite hot update re-executes `GameScene.vue`, which unmounts the scene —
 * `onUnmounted` deletes `__arena` — and remounts it a tick later. Any evaluate
 * that lands in that window throws "Cannot read properties of undefined". The
 * retry re-waits for the seam in real time and tries again.
 *
 * In RECORD it is a plain evaluate: the retry's wait is real time, and a
 * real-time wait under the virtual clock is a deadlock (see `waitForSeam`).
 * The recorder mutes the dev server's socket for recording pages, so nothing
 * remounts mid-take anyway.
 */
export const evalSafe = async (ctx, fn, arg, tries = 6) => {
  if (ctx.phase === 'record') return ctx.evaluate(fn, arg)
  let last
  for (let i = 0; i < tries; i++) {
    try {
      return await ctx.evaluate(fn, arg)
    } catch (err) {
      last = err
      if (!/__glyphyx|__arena|__art|Execution context|destroyed|undefined/i.test(String(err))) throw err
      await waitForSeam(ctx)
      await ctx.page.waitForTimeout(200)
    }
  }
  throw last
}

/**
 * Wait until the dev seams exist and a match is live.
 *
 * REAL TIME ONLY. Under the recorder's virtual clock nothing in the page
 * advances unless the capture loop steps it, and the capture loop is waiting
 * for this scenario to go idle — so a `waitForFunction` inside `record()` is a
 * deadlock. Everything that waits on the game happens in `setup()`; `record()`
 * is scheduled on `ctx.wait(ms)` against the game's own constants.
 */
export const waitForSeam = (ctx) => ctx.page.waitForFunction(() => {
  const g = /** @type {any} */ (window).__glyphyx
  return !!g && !!g.battle && g.battle.matchActive.value === true && !!(/** @type {any} */ (window).__arena)
}, null, { timeout: 30_000 })

// ─── Boot ───────────────────────────────────────────────────────────────────

/**
 * Navigate with the save seeded, wait out every curtain, then FREEZE the game.
 *
 * The freeze is the important part. The planning clock is a real 5-second
 * countdown: staging a board and then taking your time over the first frame
 * means the turn auto-passes and resolves before the recording starts. So the
 * last thing boot does is `battle.setPaused(true)`; `unfreeze()` is the first
 * thing `record()` does.
 */
export const boot = async (ctx, { save = saveFixture() } = {}) => {
  // The runner has already opened the page at the FULL recording URL — the
  // resolved port and every param: the config's, the format's, the clean
  // feed's (`clean=1`, `artdeny=…`), the scenario's and `--url-param`. Reuse it.
  // Never rebuild it from the config: that silently drops all of those, and
  // the clip records with the interface ON while every log line looks right.
  const current = typeof ctx.page.url === 'function' ? ctx.page.url() : ''
  if (!/^https?:/.test(current)) {
    throw new Error(
      `preview-video: boot() expected the runner to have opened the recording URL, but the page is at "${current}". ` +
      'Refusing to rebuild it from the config — it would drop the clean-feed and --url-param params.'
    )
  }
  const url = current.split('#')[0]

  await ctx.page.addInitScript(seedSaveScript, save)
  // Bounce through about:blank first. The runner has usually already opened the
  // page, and vue-router leaves a `#/` on the URL — so a `goto` back to the
  // same address is a SAME-DOCUMENT navigation: the document is never
  // rebuilt, the init scripts never run, and the game keeps whatever save it
  // booted with. The symptom is a clip recorded on node 1-1 (a tutorial, with
  // a chest ceremony) while every log line says the board was staged fine.
  await ctx.page.goto('about:blank')
  await ctx.page.goto(url, { waitUntil: 'domcontentloaded' })

  await waitForSeam(ctx)
  // Three curtains, in order: the static splash in index.html, the Vue splash
  // behind it, and the stage banner that plays over the middle of the board for
  // the first second of a match. A clean feed HIDES them, which is not the same
  // as gone: the banner still eats pointer events while it is up.
  await ctx.page.waitForFunction(() => !document.getElementById('static-splash'), null, { timeout: 30_000 })
  await ctx.page.waitForFunction(() => !document.querySelector('.splash-backdrop'), null, { timeout: 30_000 })
  await ctx.page.waitForFunction(() => !document.querySelector('.turn-banner'), null, { timeout: 8_000 }).catch(() => {})

  await freeze(ctx)
  await waitForArt(ctx)

  // Prove the fixture actually landed. Every way this can go wrong — a
  // same-document navigation, a blob the save layer rejected, a stale page —
  // produces a perfectly playable clip of the WRONG NODE, and the staged-board
  // log line still reads correctly. Fail loudly here instead.
  const node = await evalSafe(ctx, () => {
    const w = /** @type {any} */ (window)
    return {
      id: w.__glyphyx.campaign.currentNode.value,
      objective: w.__glyphyx.battle.view.config.objective,
      tutorial: !!w.__glyphyx.battle.view.config.tutorial,
      streak: w.__glyphyx.streak?.streak?.value ?? 0
    }
  })
  if (node.tutorial || node.objective !== 'conquest') {
    throw new Error(
      `preview-video: booted node ${node.id} (objective ${node.objective}` +
      `${node.tutorial ? ', TUTORIAL' : ''}) — the save fixture did not take. ` +
      'A lesson node has a scripted ghost hand and no clock; it will fight the beat sheet.'
    )
  }
  ctx.log.info(`booted node ${node.id} (${node.objective}), streak ${node.streak}${ctx.clean ? ', clean feed' : ''}`)
  return ctx
}

/**
 * Hold until the painted art has landed.
 *
 * Every painting that decodes drops the sprite bakes made from it, so a clip
 * that starts too early opens on procedural stones and swaps to painted ones
 * mid-shot. `__art.status()` is the only honest counter: the dev server answers
 * a missing `images/*.webp` with the SPA fallback (200 HTML), so resource
 * timings say everything loaded even when nothing did.
 */
export const waitForArt = async (ctx, { timeout = 30_000 } = {}) => {
  const enabled = await ctx.page.evaluate(() => !!(/** @type {any} */ (window).__art?.status?.().enabled)).catch(() => false)
  if (!enabled) return { enabled: false }
  await ctx.page.waitForFunction(() => {
    const s = /** @type {any} */ (window).__art?.status?.()
    return !!s && s.probes > 0 && s.ready >= s.probes - s.missing
  }, null, { timeout }).catch(() => {})
  // One more beat so the last bakes are on screen rather than in flight.
  await ctx.page.waitForTimeout(400)
  return ctx.page.evaluate(() => (/** @type {any} */ (window).__art?.status?.() ?? null))
}

/** Stop the planning clock (staging takes longer than a turn does). */
export const freeze = (ctx) => evalSafe(ctx, () => { /** @type {any} */ (window).__glyphyx.battle.setPaused(true) })

/** Let the match run again — the first line of every `record()`. */
export const unfreeze = (ctx) => ctx.evaluate(() => { /** @type {any} */ (window).__glyphyx.battle.setPaused(false) })

// ─── Staging a position ─────────────────────────────────────────────────────

/**
 * @typedef {[side: 'player'|'enemy', type: string, col: number, row: number,
 *            dir: string, level: number, hp: number]} StagedRune
 * @typedef {{
 *   turn?: number,
 *   runes: StagedRune[],
 *   player?: Array<[number, number]>,   // EMPTY tiles owned by the player
 *   enemy?: Array<[number, number]>,    // EMPTY tiles owned by the enemy
 *   hand: string[],
 * }} BoardPlan
 *
 * Coordinates: col 0..3 left→right, row 0..3 TOP→bottom. Row 0 is the enemy's
 * home rank, row 3 the player's, so "up" (dy = -1) is toward the enemy.
 *
 * Tile ownership, which is the whole win condition: a tile belongs to whoever
 * has a rune standing on it, an EMPTY tile keeps the owner it had, and a tile
 * whose rune shatters goes NEUTRAL (never back to territory). Eight of the
 * sixteen wins immediately — so a staged position is really a tile budget, and
 * `player`/`enemy` are the empty tiles each side is holding as territory. A
 * side gains at most ONE tile a turn (its placement); kills only neutralise.
 */

/** Force the exact position, hand and turn number the beat sheet needs. */
export const stageBoard = (ctx, plan) => evalSafe(ctx, (p) => {
  const b = /** @type {any} */ (window).__glyphyx.battle
  b.setPaused(true)

  // `view.board` IS `state.board`: keep the very same tiles array and runes
  // record, mutate them in place, and only the WRAPPER is new (see the header).
  const held = b.view.board
  const tiles = held.tiles
  const runes = held.runes
  for (const id of Object.keys(runes)) delete runes[id]
  for (const t of tiles) { t.runeId = null; t.owner = 'neutral'; t.faction = null }
  held.nextRuneId = 1

  const at = (col, row) => tiles[row * 4 + col]
  for (const [side, type, col, row, dir, level, hp] of p.runes) {
    const id = held.nextRuneId++
    runes[id] = {
      id, type, side,
      faction: side === 'enemy' ? 'goblin' : null,
      level, hp, maxHp: hp, dir, col, row, shield: 0, atkBonus: 0
    }
    const t = at(col, row)
    t.runeId = id
    t.owner = side
    t.faction = runes[id].faction
  }
  for (const [c, r] of p.player ?? []) { const t = at(c, r); t.owner = 'player'; t.faction = null }
  for (const [c, r] of p.enemy ?? []) { const t = at(c, r); t.owner = 'enemy'; t.faction = 'goblin' }

  b.view.board = { tiles, runes, nextRuneId: held.nextRuneId }

  // `view.hand` IS `state.hand` — mutate in place or the engine keeps the old
  // one and every `beginDrag(i)` picks a rune the player cannot see.
  b.view.hand.length = 0
  for (const t of p.hand) b.view.hand.push(t)

  // The counters are recomputed by the engine on every phase change; these are
  // the mirrors the HUD is bound to right now (hidden in a clean feed, logged).
  const count = (o) => tiles.reduce((n, t) => n + (t.owner === o ? 1 : 0), 0)
  b.view.playerTiles = count('player')
  b.view.enemyTiles = count('enemy')
  b.playerTiles.value = b.view.playerTiles
  b.enemyTiles.value = b.view.enemyTiles
  if (p.turn) { b.view.turn = p.turn; b.turn.value = p.turn }

  return { player: b.view.playerTiles, enemy: b.view.enemyTiles, hand: b.view.hand.slice() }
}, plan)

/**
 * Author the enemy's committed move for the next N reveals.
 *
 * The AI is seeded off `Date.now()` and re-plans every turn, so it can never be
 * relied on to do the same thing twice. This takes the decision away from it:
 * `enterReveal` publishes `view.reveal.enemies` as the LIVE `state.enemyMoves`
 * array (same reference) and the resolver reads that array a beat later, so
 * emptying it and pushing our own moves in on the `reveal` event replaces the
 * enemy's turn wholesale — after the AI has planned, before anything resolves.
 *
 * The queue runs on across matches, so a clip that plays on into the next level
 * (or a retry) just lists that match's turns after this one's. A move may name
 * its own `faction` (a siege has three); it defaults to the goblins.
 *
 * @param {Array<Array<{type: string, col: number, row: number, dir: string, faction?: string}>>} turns
 *   One entry per upcoming reveal. `[]` makes the enemy pass that turn.
 */
export const scriptEnemyTurns = (ctx, turns) => evalSafe(ctx, (list) => {
  const w = /** @type {any} */ (window)
  const b = w.__glyphyx.battle
  w.__previewEnemy?.off?.()
  const queue = list.map((moves) => moves.map((m) => ({ side: 'enemy', faction: 'goblin', ...m })))
  const fired = []
  const off = b.onEvent((e) => {
    if (e.kind !== 'reveal' || !b.view.reveal) return
    const next = queue.shift()
    if (!next) return
    const live = b.view.reveal.enemies
    live.length = 0
    for (const m of next) live.push(m)
    fired.push(next.length)
  })
  w.__previewEnemy = { off, queue, fired }
  return list.length
}, turns)

// ─── Carrying a rune onto the board ─────────────────────────────────────────

/**
 * Publish the drag metrics the game's position aiming needs.
 *
 * `useBattle` only knows where the tiles are once the input layer has told it
 * (`setDragMetrics`, on every press). Without that, a dragged rune can still be
 * placed, but never AIMED BY POSITION — and an unaimed directional placement
 * opens the one-second correction window, a dead second in every exchange. A
 * real press anywhere on the canvas publishes them, so this dispatches one on a
 * corner of the canvas where there is nothing to hit (a tap on nothing just
 * lets any selection go). Dispatched straight at the canvas, so no overlay —
 * hidden or not — is in the way.
 */
export const primeInput = (ctx) => evalSafe(ctx, () => {
  const c = /** @type {HTMLCanvasElement|null} */ (document.querySelector('canvas.scene__canvas'))
  if (!c) return false
  const r = c.getBoundingClientRect()
  const at = { pointerId: 97, pointerType: 'mouse', isPrimary: true, clientX: r.left + 2, clientY: r.top + 2, bubbles: true, cancelable: true, button: 0 }
  c.dispatchEvent(new PointerEvent('pointerdown', { ...at, buttons: 1 }))
  c.dispatchEvent(new PointerEvent('pointerup', { ...at, buttons: 0 }))
  return true
})

/** The layout, flattened for Node: every tile rect, the hand slots, the canvas size. */
export const layoutOf = (ctx) => ctx.evaluate(() => {
  const l = /** @type {any} */ (window).__arena.layout()
  const tiles = []
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) tiles.push(l.tileRect(col, row))
  return { tiles, hand: l.hand.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h })), tile: l.tile, cssW: l.cssW, cssH: l.cssH }
})

/**
 * Where inside a tile to stand to AIM a rune that way — outside the centre dead
 * zone (`AIM_CENTRE_DEAD_ZONE`, 0.18), inside the facing's region. `omni` runes
 * aim nothing and are released from the middle.
 */
const AIM_POINT = {
  up: [0.5, 0.2], down: [0.5, 0.8], left: [0.2, 0.5], right: [0.8, 0.5], omni: [0.5, 0.5]
}

const tilePoint = (L, cell, dir = 'omni') => {
  const r = L.tiles[cell.row * 4 + cell.col]
  const [fx, fy] = AIM_POINT[dir] ?? AIM_POINT.omni
  return { x: r.x + r.w * fx, y: r.y + r.h * fy }
}

/** One pointer move, with the tile under it resolved the way the input layer would. */
const dragTo = (ctx, p) => ctx.evaluate((q) => {
  const w = /** @type {any} */ (window)
  const hit = w.__arena.hitTest(q.x, q.y)
  w.__glyphyx.battle.updateDrag(q.x, q.y, hit && hit.kind === 'tile' ? { col: hit.col, row: hit.row } : null)
}, p)

const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k))

/**
 * Move the carried stone from `from` to `to` over `ms` of VIDEO, one pointer
 * move per frame. Returns where it ended up (or null once the clip is spent).
 */
const glide = async (ctx, t, from, to, ms) => {
  const frame = 1000 / ctx.fps
  const n = Math.max(1, Math.round(ms / frame))
  for (let i = 1; i <= n; i++) {
    const k = ease(i / n)
    await dragTo(ctx, { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k })
    if (!(await t.wait(frame))) return null
  }
  return to
}

/**
 * Carry hand slot `slot` onto the board, the way a player would.
 *
 *   rise   — the stone lifts from its slot (in a clean feed, from just below
 *            the frame) and flies to the first stop
 *   stops  — at each one it RESTS: the game lands it on the tile (a rune that
 *            sits on a valid tile for `AIM_LAND_MS` snaps onto it) and draws its
 *            compass, its aim cone and its facing arrow. `via` stops are the
 *            tiles it considers; `to` is where it goes
 *   drop   — released while standing in its facing's aim region, so the game
 *            reads a deliberate aimed placement and skips the correction
 *            window: straight to the reveal
 *
 * Hover only tiles the rune can TAKE. An occupied tile draws a small "no"
 * marker and nothing else, which measured as a near-static beat.
 *
 * @param {object} t      the budget from `budget(ctx)`
 * @param {{ slot?: number, via?: Array<{cell: {col:number,row:number}, dir?: string, dwell?: number}>,
 *           to: {cell: {col:number,row:number}, dir?: string, dwell?: number},
 *           riseMs?: number, glideMs?: number, dwellMs?: number }} plan
 * @returns {Promise<{ ok: boolean, move: any, windowOpen: boolean, region: string|null }|null>}
 *   null when the clip ran out mid-carry
 */
export const carry = async (ctx, t, { slot = 0, via = [], to, riseMs = 420, glideMs = 280, dwellMs = 320 }) => {
  const L = await layoutOf(ctx)
  const home = L.hand[slot] ?? L.hand[0]
  const start = { x: home.x + home.w / 2, y: home.y + home.h / 2 }
  const lifted = await ctx.evaluate((a) => (/** @type {any} */ (window)).__glyphyx.battle.beginDrag(a.slot, a.x, a.y, true), { slot, ...start })
  if (!lifted) ctx.log.warn(`carry: could not lift hand slot ${slot}`)

  // Travel CENTRE TO CENTRE, then aim inside the tile. A landed stone only
  // leaves its tile once the pointer is `AIM_UNLOCK_TILES` (0.85 tile) from
  // where it LANDED; short of that, the motion is read as a stroke that re-aims
  // it where it sits. Two neighbouring aim points can be ~0.75 tile apart, so
  // gliding aim-point to aim-point would leave the stone on the tile it was
  // only considering — and drop it there. Centres are a full tile apart.
  const landMs = 100
  const aimMs = 130
  let at = start
  const stops = [...via, to]
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    at = await glide(ctx, t, at, tilePoint(L, stop.cell, 'omni'), i === 0 ? riseMs : glideMs)
    if (!at) return null
    if (!(await t.wait(landMs))) return null
    let rest = (stop.dwell ?? dwellMs) - landMs
    if (stop.dir && stop.dir !== 'omni') {
      // Landed: now the pointer walks into the facing's region and the stone
      // turns to face it — the arrow and the aim cone swing on screen.
      at = await glide(ctx, t, at, tilePoint(L, stop.cell, stop.dir), aimMs)
      if (!at) return null
      rest -= aimMs
    }
    if (!(await t.wait(Math.max(0, rest)))) return null
  }
  return ctx.evaluate(() => {
    const b = /** @type {any} */ (window).__glyphyx.battle
    const region = b.view.drag?.region ?? null
    b.endDrag(true)
    return { ok: b.hasPlaced.value, phase: b.phase.value, move: b.view.playerMove, windowOpen: !!b.view.lock, region }
  })
}

/**
 * Ride out one resolution after a drop: the reveal, the resolution animation
 * and the hand-over to the next turn. Returns false once the clip is spent.
 * `hero` (ms into the resolution) marks the poster frame on the way.
 */
export const resolveOut = async (ctx, t, { hero = null, heroName = 'hero', extra = 0 } = {}) => {
  if (!(await t.wait(TIMING.REVEAL_MS))) return false
  if (hero !== null) {
    if (!(await t.wait(hero))) return false
    ctx.beat(heroName)
    return t.wait(TIMING.RESOLVE_MS - hero + TIMING.BETWEEN_TURNS_MS + extra)
  }
  return t.wait(TIMING.RESOLVE_MS + TIMING.BETWEEN_TURNS_MS + extra)
}

/**
 * Replace the hand between exchanges.
 *
 * `commitPlayerMove` removes the rune that was played and `beginPlanning`
 * refills the slot from the deck at random, so the hand a second exchange
 * starts with is not deterministic. This puts it back. `view.hand` is
 * `state.hand`, so it has to be mutated in place — reassigning it leaves the
 * engine holding the old array and every `beginDrag(i)` picks a rune that is
 * not the one the beat sheet meant.
 */
export const setHand = (ctx, hand) => ctx.evaluate((list) => {
  const b = /** @type {any} */ (window).__glyphyx.battle
  b.view.hand.length = 0
  for (const t of list) b.view.hand.push(t)
  return b.view.hand.slice()
}, hand)

/**
 * Keep the HUD's turn counter consistent across a re-stage. Display only: the
 * ENGINE counts its own turns from 1, which is what we want — `evaluateResult`
 * reads the real turn for the turn-limit rule and a faked one could end the
 * match early.
 */
export const setTurn = (ctx, turn) => ctx.evaluate((n) => {
  const b = /** @type {any} */ (window).__glyphyx.battle
  b.view.turn = n
  b.turn.value = n
}, turn)

/**
 * Leave the verdict and start another match — the last movement of a clip.
 *
 * With the interface on, this dismisses the result screen; in a clean feed the
 * result screen is hidden anyway, and what the viewer sees is the renderer's
 * own 200 ms board wipe and a fresh board — "there is another round right
 * there", which is what a preview is selling. `next` advances a level (after a
 * win); without it the same level restarts, the honest ending for a loss.
 */
export const playAgain = (ctx, { next = false } = {}) => ctx.evaluate((wantNext) => {
  const w = /** @type {any} */ (window).__glyphyx
  w.overlays.showResult.value = false
  w.overlays.showChest.value = false
  if (wantNext) w.battle.nextNode()
  else w.battle.retryNode()
}, next)

/**
 * Poll until the next planning phase begins, ON THE RECORDING CLOCK.
 *
 * An exchange has to start inside the planning phase or nothing works:
 * `beginDrag` refuses while the board is resolving (or wiping between
 * matches), and `syncPlanning` overwrites the hand when planning begins — so a
 * `setHand` that lands early is silently undone.
 *
 * The obvious tool is `page.waitForFunction`, and it is exactly the tool that
 * cannot be used here: under the virtual clock the page only advances when the
 * capture loop steps it, and the capture loop is waiting for this scenario to
 * go idle. This polls with `ctx.evaluate` + the clip's own clock instead — each
 * iteration advances the clip by `stepMs` — so it can slow a beat sheet down
 * but can never deadlock it. `strict` refuses 'ended' (right after a verdict,
 * before the next match's planning).
 */
export const awaitPlanning = async (ctx, clock, maxMs = 1500, stepMs = 100, { strict = false } = {}) => {
  let waited = 0
  for (;;) {
    const s = await ctx.evaluate(() => {
      const b = /** @type {any} */ (window).__glyphyx.battle
      return { phase: b.phase.value, resetting: !!b.view.resetting }
    })
    if (!s.resetting && (s.phase === 'planning' || (!strict && s.phase === 'ended'))) return s.phase
    if (waited >= maxMs) {
      ctx.log.warn(`awaitPlanning: still '${s.phase}' after ${waited} ms — the next exchange may not commit`)
      return s.phase
    }
    if (!(await clock.wait(stepMs))) return s.phase
    waited += stepMs
  }
}

/**
 * A wall clock for `record()` that cannot overrun the clip.
 *
 * Every wait is clamped to what is left of `ctx.durationMs`, and `wait`
 * returns false once the budget is spent, so `--duration 6` ends the beat
 * sheet early instead of scheduling beats past the last captured frame.
 */
export const budget = (ctx) => {
  const total = Math.max(1000, Number(ctx.durationMs) || 10_000)
  let spent = 0
  return {
    /** Wait `ms` (clamped). False once the clip is full. */
    async wait(ms) {
      const left = total - spent
      if (left <= 0) return false
      const take = Math.min(Math.max(0, ms), left)
      spent += take
      if (take > 0) await ctx.wait(take)
      return spent < total
    },
    left: () => total - spent,
    spent: () => spent
  }
}

/** Whatever the game thinks is true right now — for logging and assertions. */
export const snapshot = (ctx) => ctx.evaluate(() => {
  const b = /** @type {any} */ (window).__glyphyx.battle
  return {
    phase: b.phase.value,
    turn: b.turn.value,
    player: b.playerTiles.value,
    enemy: b.enemyTiles.value,
    result: b.result.value,
    enemyFired: (/** @type {any} */ (window).__previewEnemy?.fired ?? []).slice()
  }
})

/**
 * Play a list of exchanges back to back — the body of a longer beat sheet.
 *
 * Each exchange: wait for planning, put the hand back, carry the rune in,
 * ride out the resolution. Logs the board after each so a run can be checked
 * against the headless plan. Returns false once the clip is spent.
 *
 * @param {Array<{ label: string, hand: string[], carry: object, hero?: number, heroName?: string, beat?: string }>} list
 */
export const playExchanges = async (ctx, t, list) => {
  for (const x of list) {
    await awaitPlanning(ctx, t, 1500, 100, { strict: true })
    await setHand(ctx, x.hand)
    if (x.beat) ctx.beat(x.beat)
    const r = await carry(ctx, t, x.carry)
    if (!r) return false
    ctx.log.info(`${x.label}: ${r.move?.type ?? '—'} → (${x.carry.to.cell.col},${x.carry.to.cell.row}) aimed=${r.region ?? 'omni'} window=${r.windowOpen}`)
    if (r.windowOpen) ctx.log.warn(`${x.label}: the correction window opened — the drop was not read as aimed`)
    if (!(await resolveOut(ctx, t, { hero: x.hero ?? null, heroName: x.heroName }))) return false
    const s = await snapshot(ctx)
    ctx.log.info(`   → ${s.phase} YOU ${s.player} / FOE ${s.enemy}${s.result ? ` ${s.result.won ? 'WON' : 'LOST'} (${s.result.reason})` : ''}`)
  }
  return true
}
