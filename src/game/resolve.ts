/**
 * ─── One resolution ─────────────────────────────────────────────────────────
 *
 * The GDD's combat priority, as one pure function: placements → the nuke →
 * auras → heals → ranged → melee → settle. Takes a board and every committed
 * move, returns a NEW board and the time-stamped event list the renderer
 * animates.
 *
 * ── Simultaneity ──
 *
 * Inside a step every attacker fires against the board as it stood at the
 * step's start: hits are applied as they are computed (so `hpAfter` reads
 * correctly and a shield is only spent once), but nobody DIES until the step
 * ends. Two archers shooting each other both fire and both shatter.
 *
 * ── Capture events: SETTLE ONLY ──
 *
 * Tile ownership changes are tracked on the working board the moment they
 * happen (a placement claims, a death neutralises, a knockback moves the
 * claim), so every later step sees the true board. But the renderer is told
 * about them exactly once, in the `settle` step, as a diff of the input board
 * against the result: one `capture` per tile whose owner changed. `place`,
 * `shatter`, `clash` and `knockback` therefore carry NO capture of their own —
 * the tile's tint flips in the settle wave, after the fighting, which is the
 * "tile control recalculation" the GDD lists as its own step.
 *
 * ── The shield is a wall ──
 *
 * With `SHIELD_BLOCKS_PROJECTILES`, an ENEMY defense rune ends any projectile
 * that reaches its tile: a beam stops there (the shield takes the hit, nothing
 * behind it does, and a Lv 2 orb's cross bursts around the shield's tile), and
 * an arrow is intercepted on any tile it flies over — the skipped tile
 * included. A friendly shield is never in the way, and a blade only ever
 * reaches the tile it faces. The event's `path` is cut at the wall so the
 * renderer shows the projectile stopping.
 *
 * ── Three shapes that are not a line ──
 *
 * The late runes hit patterns, and each one breaks a habit of the steps above.
 * The axe (`cleave`) swings WITH the swords, but across the three tiles ahead,
 * and never knocks anything back. The boulder (`roller`) travels its lane in
 * the ranged step and hits EVERYTHING standing on it, its own side included:
 * it rolls on through whatever it breaks and comes to rest on the first rune
 * it does not (a Lv 2 ploughs through one survivor first). The bombard's shell
 * is LOBBED (`BOMBARD_IS_LOBBED`): it arcs over the tiles between the tube and
 * the impact, so nothing on the way is touched and no shield can intercept it —
 * the one attack in the game a wall does not stop.
 *
 * The patterns themselves are `cleaveCells` / `rollerLane` / `bombardCells` in
 * `rules.ts`, so the AI and the renderer read the same shapes this does.
 *
 * ── The nuke, and why it has a step of its own ──
 *
 * A nuker is fired by its own PLACEMENT, not by a turn of attacking, so it
 * detonates in the resolution it lands in and never again. That is why the
 * blast is a step between the placements and everything else rather than
 * another entry in the ranged step: what it destroys must not get to swing,
 * heal or shield anyone first. It reads the target's LEVEL and not its hit
 * points — `nukeVaporises` — so a Lv 1 rune is gone whatever its body and a
 * Lv 2 rune takes `NUKE_DAMAGE` and lives. It never catches the bomb itself,
 * and it never checks sides: the player's own Lv 1 runes go with everyone
 * else's.
 *
 * ── Ranks ──
 *
 * `opts.playerRanks` is the player's permanent per-rune upgrade, worth extra
 * maximum hit points and nothing else. It is read in exactly one place —
 * `bodyOf` — and only for `side === 'player'`, so a ranked roster changes what
 * the player STANDS UP and no other number in this file.
 */

import {
  ARCHER_RANGE, DEFENSE_AURA_SHIELD, DEFENSE_MITIGATION, DIR_VEC, MAGE_REACH, MAX_LEVEL, NUKE_DAMAGE, clampLevel,
  RESOLVE_TIMELINE, SHIELD_BLOCKS_PROJECTILES, SUPPORT_ATK_BONUS, archerRange, bombardCells, cleaveCells,
  nukeVaporises, rankOf, rollerLane, rollerPierce, supportHeal, cellIndex, inBounds, statsFor, statsWithRank,
  type BoardState, type Cell, type Faction, type Hit, type Move, type RankTable, type ResolveEvent,
  type ResolveStep, type Rune, type RuneSnapshot, type RuneStats
} from './rules'
import { cloneBoard, neighbors, placementKind, runeAt, runesOf } from './board'

export interface ResolveOptions {
  /** Attack multiplier per enemy faction (0 = training dummy). */
  enemyAtkMul: (faction: Faction | null) => number
  /**
   * The PLAYER's permanent rune ranks — extra maximum hit points on the runes
   * they place. The enemy never has any, so this is only ever read for
   * `side === 'player'`; absent is a roster with no ranks bought.
   */
  playerRanks?: RankTable
}

export interface ResolveOutcome {
  board: BoardState
  events: ResolveEvent[]
  /** Enemy runes shattered by the player this resolution. */
  playerKills: number
  /** Player runes shattered this resolution. */
  enemyKills: number
}

/** Inside a step, successive events are spaced by this much… */
const STAGGER_MS = 40
/** …and a shatter lands this far before the step ends, so it is over before the next step starts. */
const SHATTER_LEAD_MS = 80
const SHATTER_DUR_MS = 220

const snap = (r: Rune): RuneSnapshot => ({ ...r })

/**
 * Apply `moves` (at most one per side per turn; several enemy moves only in a
 * siege) and run ONE resolution in the GDD's priority order. Pure: returns a
 * new board and the ordered, time-stamped event list.
 */
export const resolveTurn = (input: BoardState, moves: Move[], opts: ResolveOptions): ResolveOutcome => {
  const board = cloneBoard(input)
  const events: ResolveEvent[] = []
  let playerKills = 0
  let enemyKills = 0

  // ── timeline helpers ──
  const T = RESOLVE_TIMELINE
  const at = (step: ResolveStep, i: number): number =>
    T[step].at + Math.min(i * STAGGER_MS, Math.max(0, T[step].dur - 60))
  const stepEnd = (step: ResolveStep): number => T[step].at + T[step].dur

  // ── board helpers ──
  const tile = (col: number, row: number) => board.tiles[cellIndex(col, row)]!
  const claim = (rune: Rune): void => {
    const t = tile(rune.col, rune.row)
    t.runeId = rune.id
    t.owner = rune.side
    t.faction = rune.faction
  }
  const vacate = (col: number, row: number): void => {
    const t = tile(col, row)
    t.runeId = null
    t.owner = 'neutral'
    t.faction = null
  }
  /**
   * The body a rune of `side` stands up with. The player's carries their rank
   * bonus; the enemy's is the roster's own table and nothing else.
   */
  const bodyOf = (side: Rune['side'], type: Rune['type'], level: number): RuneStats =>
    side === 'player' ? statsWithRank(type, level, rankOf(opts.playerRanks, type)) : statsFor(type, level)
  // A placement on an empty tile lands at the move's level (a power-rune
  // boon), 1 otherwise. A stack never reaches here — it merges instead.
  const makeRune = (m: Move): Rune => {
    const level = clampLevel(m.level ?? 1)
    const stats = bodyOf(m.side, m.type, level)
    return {
      id: board.nextRuneId++,
      type: m.type,
      side: m.side,
      faction: m.side === 'enemy' ? m.faction : null,
      level,
      hp: stats.hp,
      maxHp: stats.hp,
      dir: m.dir,
      col: m.col,
      row: m.row,
      shield: 0,
      atkBonus: 0
    }
  }
  const countKill = (rune: Rune): void => {
    if (rune.side === 'enemy') playerKills++
    else enemyKills++
  }
  /** Remove a dead rune: event, count, tile → neutral. */
  const shatter = (rune: Rune, when: number): void => {
    events.push({ kind: 'shatter', at: when, dur: SHATTER_DUR_MS, rune: snap(rune) })
    countKill(rune)
    delete board.runes[rune.id]
    if (tile(rune.col, rune.row).runeId === rune.id) vacate(rune.col, rune.row)
  }
  /** Everyone at 0 HP after a step goes together. */
  const sweepDead = (step: ResolveStep): void => {
    const dead = Object.values(board.runes).filter((r) => r.hp <= 0).sort((a, b) => a.id - b.id)
    const base = stepEnd(step) - SHATTER_LEAD_MS
    dead.forEach((r, i) => shatter(r, base + Math.min(i * 20, 60)))
  }

  // Temporary buffs are rebuilt from zero every resolution.
  for (const r of Object.values(board.runes)) {
    r.shield = 0
    r.atkBonus = 0
  }

  // ── 1. Placements (and clashes) ────────────────────────────────────────────
  const byCell = new Map<number, Move[]>()
  for (const m of moves) {
    if (!inBounds(m.col, m.row)) continue
    const key = cellIndex(m.col, m.row)
    const list = byCell.get(key)
    if (list) list.push(m)
    else byCell.set(key, [m])
  }

  let placeIdx = 0
  let clashIdx = 0
  /**
   * Every nuker that LANDED this resolution — by a plain placement, by a stack
   * (you dropped another bomb onto the first), or by surviving a clash for the
   * tile. The blast is fired by the placement, not by a turn of attacking, so a
   * nuker that is already standing is inert: it never appears here again.
   */
  const detonators: Rune[] = []
  // One level up, and the dropped pebble brings its own Lv 1 body: a full
  // Lv 1 + Lv 1 lands exactly on the Lv 2 maximum, a wounded rune is healed by
  // the stone stacked onto it. Capped by `MAX_LEVEL` (the board refuses the
  // placement before this runs, but the cap is asserted here too).
  //
  // Both bodies are RANKED for the player: the stone dropped is one of theirs,
  // so it brings a ranked Lv 1 with it. The one consequence worth naming is
  // that a FULL ranked rune stacked no longer lands exactly on the new
  // maximum — it overshoots and is capped there — where an unranked one still
  // lands on it to the point. Either way a full rune stacks to a full rune;
  // what ranks change is that a WOUNDED one is healed by more.
  const merge = (existing: Rune, m: Move): void => {
    const level = Math.min(MAX_LEVEL, existing.level + 1)
    const next = bodyOf(existing.side, existing.type, level)
    existing.level = level
    existing.maxHp = next.hp
    existing.hp = Math.min(next.hp, existing.hp + bodyOf(existing.side, existing.type, 1).hp)
    // The new pebble's swipe re-aims the merged rune.
    existing.dir = m.dir
    events.push({ kind: 'merge', at: at('place', placeIdx++), dur: T.place.dur, rune: snap(existing) })
    if (existing.type === 'nuker') detonators.push(existing)
  }
  const place = (m: Move): void => {
    const rune = makeRune(m)
    board.runes[rune.id] = rune
    claim(rune)
    events.push({ kind: 'place', at: at('place', placeIdx++), dur: T.place.dur, rune: snap(rune) })
    if (rune.type === 'nuker') detonators.push(rune)
  }

  for (const list of byCell.values()) {
    const first = list[0]!
    const existing = runeAt(board, first.col, first.row)
    if (existing) {
      // Only a friendly stack can land on an occupied tile; anything else was
      // never legal and is ignored (defensive — the state machine validates).
      for (const m of list) {
        if (placementKind(board, m.side, m.type, m.col, m.row) === 'stack') merge(existing, m)
      }
      continue
    }
    const opposite = list.find((m) => m.side !== first.side)
    if (!opposite) {
      // One side, one cell (a second move from the same side is dropped).
      place(first)
      continue
    }
    // ── Clash: two placements, one tile ──
    const ra = makeRune(first)
    const rb = makeRune(opposite)
    let survivor: Rune | null = null
    if (ra.hp > rb.hp) {
      survivor = ra
      ra.hp -= rb.hp
    } else if (rb.hp > ra.hp) {
      survivor = rb
      rb.hp -= ra.hp
    }
    const when = at('clash', clashIdx++)
    if (survivor) {
      board.runes[survivor.id] = survivor
      claim(survivor)
      // A bomb that won the tile still went off; one that lost it never landed.
      if (survivor.type === 'nuker') detonators.push(survivor)
    }
    events.push({
      kind: 'clash', at: when, dur: T.clash.dur, col: first.col, row: first.row,
      a: { ...ra, hp: ra.maxHp }, b: { ...rb, hp: rb.maxHp },
      survivor: survivor ? snap(survivor) : null
    })
    for (const loser of [ra, rb]) {
      if (loser === survivor) continue
      events.push({ kind: 'shatter', at: when + 60, dur: SHATTER_DUR_MS, rune: snap(loser) })
      countKill(loser)
    }
    // A clash on somebody's territory that killed both leaves rubble, not a claim.
    if (!survivor) vacate(first.col, first.row)
  }

  // ── damage ─────────────────────────────────────────────────────────────────
  const rawAttack = (a: Rune): number => {
    const mul = a.side === 'enemy' ? opts.enemyAtkMul(a.faction) : 1
    const base = statsFor(a.type, a.level).atk + a.atkBonus
    if (mul <= 0 || base <= 0) return 0
    // A scaled-down attack never vanishes: relief makes the enemy hit SOFTER,
    // a training dummy (multiplier 0) is the only thing that hits for nothing.
    return Math.max(1, Math.round(base * mul))
  }
  /** Land `raw` on `target`: mitigation, then the temporary shield, then HP. */
  const hit = (target: Rune, raw: number): Hit => {
    let remaining = raw
    let absorbed = 0
    if (target.type === 'defense') {
      const m = Math.min(remaining, DEFENSE_MITIGATION)
      remaining -= m
      absorbed += m
    }
    if (target.shield > 0) {
      const s = Math.min(remaining, target.shield)
      target.shield -= s
      remaining -= s
      absorbed += s
    }
    target.hp = Math.max(0, target.hp - remaining)
    return { target: snap(target), amount: remaining, absorbed, hpAfter: target.hp }
  }
  /** The cells `steps` tiles along `dir` from `from`, clipped at the edge. */
  const ray = (from: Cell, dir: Rune['dir'], steps: number): Cell[] => {
    const [dx, dy] = DIR_VEC[dir]
    const out: Cell[] = []
    for (let i = 1; i <= steps; i++) {
      const col = from.col + dx * i
      const row = from.row + dy * i
      if (!inBounds(col, row)) break
      out.push({ col, row })
    }
    return out
  }
  const enemyAt = (a: Rune, c: Cell): Rune | null => {
    const r = runeAt(board, c.col, c.row)
    return r && r.side !== a.side ? r : null
  }
  /** An enemy shield on this tile stops a projectile dead. */
  const isWall = (t: Rune | null): t is Rune => SHIELD_BLOCKS_PROJECTILES && t !== null && t.type === 'defense'

  // ── 2. The nuke ────────────────────────────────────────────────────────────
  //
  // Every nuker that landed this resolution goes off, here, before anything on
  // the board gets to act — so a rune the blast took never swings, heals or
  // shields anyone. What it does to a target is decided by that target's LEVEL
  // and not by its hit points: `nukeVaporises` is the whole rule.
  if (detonators.length > 0) {
    let nukeIdx = 0
    // Rune id order, the same order every other step resolves in. Two bombs in
    // one resolution therefore go off in the order they were created, and the
    // second sees the board the first left — it finds fewer targets rather
    // than counting the same ones twice.
    for (const bomb of detonators.slice().sort((a, b) => a.id - b.id)) {
      // It lost its own clash and was never placed, so there is nothing to
      // detonate. A bomb the FIRST blast vaporised still goes off: this file's
      // simultaneity rule is that everything acting in a step acts, and dies at
      // the end of it — two archers shooting each other both fire, and two
      // bombs dropped in one resolution both burn.
      if (!board.runes[bomb.id]) continue
      const hits: Hit[] = []
      const vaporised: RuneSnapshot[] = []
      for (const target of Object.values(board.runes).sort((a, b) => a.id - b.id)) {
        // The bomb never catches itself — that is what lets a nuke deepen a
        // lead instead of only levelling the board.
        if (target.id === bomb.id || target.hp <= 0) continue
        if (nukeVaporises(target.level)) {
          // Destroyed outright, whatever its body: a 9-HP Lv 1 shield goes
          // exactly the way a 2-HP bow does. No `Hit` describes that, so it is
          // recorded as vaporised and dropped to zero for the sweep below,
          // which gives it the ordinary death — kill count, tile, shatter.
          vaporised.push(snap(target))
          target.hp = 0
        } else {
          // A survivor takes real damage, through the usual mitigation and
          // shields: living through the flash is not being immune to it.
          hits.push(hit(target, NUKE_DAMAGE))
        }
      }
      events.push({ kind: 'nuke', at: at('nuke', nukeIdx++), dur: T.nuke.dur, from: snap(bomb), hits, vaporised })
    }
    sweepDead('nuke')
  }

  // ── 3. Auras ───────────────────────────────────────────────────────────────
  let auraIdx = 0
  for (const def of Object.values(board.runes).sort((a, b) => a.id - b.id)) {
    if (def.type !== 'defense' || def.level < 2) continue
    const to: RuneSnapshot[] = []
    for (const c of neighbors(def)) {
      const r = runeAt(board, c.col, c.row)
      if (!r || r.side !== def.side || r.id === def.id) continue
      r.shield += DEFENSE_AURA_SHIELD
      to.push(snap(r))
    }
    if (to.length > 0) {
      events.push({ kind: 'aura', at: at('aura', auraIdx++), dur: T.aura.dur, from: snap(def), to, shield: DEFENSE_AURA_SHIELD })
    }
  }

  // ── 4. Heals and buffs ─────────────────────────────────────────────────────
  let healIdx = 0
  for (const sup of Object.values(board.runes).sort((a, b) => a.id - b.id)) {
    if (sup.type !== 'support') continue
    for (const c of neighbors(sup)) {
      const r = runeAt(board, c.col, c.row)
      if (!r || r.side !== sup.side || r.id === sup.id) continue
      const amount = Math.min(supportHeal(sup.level), r.maxHp - r.hp)
      if (amount > 0) {
        r.hp += amount
        events.push({ kind: 'heal', at: at('heal', healIdx++), dur: T.heal.dur, from: snap(sup), to: snap(r), amount, hpAfter: r.hp })
      }
      if (sup.level >= 2) {
        r.atkBonus += SUPPORT_ATK_BONUS
        events.push({ kind: 'buff', at: at('heal', healIdx++), dur: T.heal.dur, from: snap(sup), to: snap(r), bonus: SUPPORT_ATK_BONUS })
      }
    }
  }

  // ── 5. Ranged: archers, mages, boulders and tubes, simultaneously ──────────
  const RANGED_TYPES: ReadonlySet<Rune['type']> = new Set(['archer', 'mage', 'roller', 'bombard'])
  let rangedIdx = 0
  const ranged = Object.values(board.runes)
    .filter((r) => RANGED_TYPES.has(r.type))
    .sort((a, b) => a.id - b.id)
  for (const a of ranged) {
    const raw = rawAttack(a)
    if (a.type === 'roller') {
      // The boulder rolls down its lane and flattens EVERYTHING it reaches —
      // friendlies included. That is the rune, not an oversight: a lane is
      // cleared at the price of whatever of yours is standing in it.
      const lane = rollerLane(a, a.dir)
      const hits: Hit[] = []
      let pierceLeft = rollerPierce(a.level)
      let path = lane
      for (let i = 0; i < lane.length; i++) {
        const t = runeAt(board, lane[i]!.col, lane[i]!.row)
        if (!t) continue
        if (raw > 0) hits.push(hit(t, raw))
        // Nothing dies before `sweepDead`, so "did it break?" is read off the
        // working board's HP: 0 here is a rune that WILL shatter at the step's
        // end, and the boulder is entitled to roll over it now.
        if (t.hp <= 0) continue
        // It held. A Lv 2+ boulder ploughs through `rollerPierce` survivors
        // before one of them finally stops it on its own tile.
        if (pierceLeft > 0) {
          pierceLeft--
          continue
        }
        path = lane.slice(0, i + 1)
        break
      }
      events.push({ kind: 'shot', at: at('ranged', rangedIdx++), dur: T.ranged.dur, from: snap(a), weapon: 'roll', path, hits })
    } else if (a.type === 'bombard') {
      // Lobbed: the footprint is the ONLY thing the shell touches. There is no
      // flight path to intercept, so `isWall` is deliberately not consulted
      // here — a shield between the tube and the impact is simply flown over.
      // A tube too close to the far edge has no legal footprint; it still
      // emits its event, with an empty path and no hits, so the renderer can
      // show the tube firing into nothing rather than skipping a beat.
      const path = bombardCells(a, a.dir, a.level)
      const hits: Hit[] = []
      for (const c of path) {
        const t = enemyAt(a, c)
        if (t && raw > 0) hits.push(hit(t, raw))
      }
      events.push({ kind: 'shot', at: at('ranged', rangedIdx++), dur: T.ranged.dur, from: snap(a), weapon: 'shell', path, hits })
    } else if (a.type === 'archer') {
      const steps = archerRange(a.level)
      const full = ray(a, a.dir, Math.max(...steps))
      let path = full
      const hits: Hit[] = []
      for (let i = 0; i < full.length; i++) {
        const t = enemyAt(a, full[i]!)
        if (!t) continue
        if (isWall(t)) {
          // Intercepted — on the skipped tile as much as on a struck one.
          if (raw > 0) hits.push(hit(t, raw))
          path = full.slice(0, i + 1)
          break
        }
        if (steps.includes(i + 1) && raw > 0) hits.push(hit(t, raw))
      }
      events.push({ kind: 'shot', at: at('ranged', rangedIdx++), dur: T.ranged.dur, from: snap(a), weapon: 'arrow', path, hits })
    } else {
      const full = ray(a, a.dir, MAGE_REACH)
      let path = full
      const hits: Hit[] = []
      for (let i = 0; i < full.length; i++) {
        const t = enemyAt(a, full[i]!)
        if (!t) continue
        if (raw > 0) hits.push(hit(t, raw))
        if (isWall(t)) {
          // The beam ends at the wall; a Lv 2 cross bursts around it.
          path = full.slice(0, i + 1)
          break
        }
      }
      const when = at('ranged', rangedIdx++)
      events.push({ kind: 'shot', at: when, dur: T.ranged.dur, from: snap(a), weapon: 'beam', path, hits })
      if (a.level >= 2 && path.length > 0) {
        const center = path[path.length - 1]!
        const cells = [center, ...neighbors(center)]
        const crossHits: Hit[] = []
        for (const c of cells) {
          const t = enemyAt(a, c)
          if (t && raw > 0) crossHits.push(hit(t, raw))
        }
        events.push({ kind: 'explode', at: when + 120, dur: T.ranged.dur - 120, from: snap(a), center, cells, hits: crossHits })
      }
    }
  }
  sweepDead('ranged')

  // ── 6. Melee, simultaneously, then knockbacks ──────────────────────────────
  let meleeIdx = 0
  const blades = Object.values(board.runes)
    .filter((r) => r.type === 'melee' || r.type === 'cleave')
    .sort((a, b) => a.id - b.id)
  const pushes: Array<{ attacker: Rune; targetId: number }> = []
  for (const a of blades) {
    const raw = rawAttack(a)
    if (a.type === 'cleave') {
      // The whole arc is the path whether or not anyone was standing in it:
      // the renderer draws the SWING, not the casualties. No knockback at any
      // level — a blow that lands on three tiles has no one direction to shove.
      const arc = cleaveCells(a, a.dir)
      const arcHits: Hit[] = []
      for (const c of arc) {
        const t = enemyAt(a, c)
        if (t && raw > 0) arcHits.push(hit(t, raw))
      }
      events.push({ kind: 'shot', at: at('melee', meleeIdx++), dur: T.melee.dur, from: snap(a), weapon: 'cleave', path: arc, hits: arcHits })
      continue
    }
    const path = ray(a, a.dir, 1)
    const hits: Hit[] = []
    const c = path[0]
    if (c) {
      const t = enemyAt(a, c)
      if (t) {
        if (raw > 0) hits.push(hit(t, raw))
        if (a.level >= 2) pushes.push({ attacker: a, targetId: t.id })
      }
    }
    events.push({ kind: 'shot', at: at('melee', meleeIdx++), dur: T.melee.dur, from: snap(a), weapon: 'blade', path, hits })
  }
  let pushIdx = 0
  for (const { attacker, targetId } of pushes) {
    const target = board.runes[targetId]
    if (!target || target.hp <= 0) continue
    const [dx, dy] = DIR_VEC[attacker.dir]
    const to = { col: target.col + dx, row: target.row + dy }
    if (!inBounds(to.col, to.row) || runeAt(board, to.col, to.row)) continue
    const from = { col: target.col, row: target.row }
    vacate(from.col, from.row)
    target.col = to.col
    target.row = to.row
    claim(target)
    events.push({ kind: 'knockback', at: T.melee.at + 120 + pushIdx++ * STAGGER_MS, dur: 180, rune: snap(target), from, to })
  }
  sweepDead('melee')

  // ── 7. Settle: tile control, as a diff against the input ───────────────────
  let settleIdx = 0
  for (let i = 0; i < board.tiles.length; i++) {
    const before = input.tiles[i]!
    const after = board.tiles[i]!
    if (before.owner === after.owner && before.faction === after.faction) continue
    events.push({
      kind: 'capture', at: at('settle', settleIdx++), dur: T.settle.dur,
      col: after.col, row: after.row, owner: after.owner, faction: after.faction, prev: before.owner
    })
  }
  if (playerKills >= 2) {
    events.push({ kind: 'combo', at: T.settle.at, dur: T.settle.dur, count: playerKills, side: 'player' })
  }

  // Keep `runesOf` order stable for callers that read the result.
  void runesOf
  return { board, events, playerKills, enemyKills }
}
