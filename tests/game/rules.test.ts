import { describe, expect, it } from 'vitest'
import {
  MAX_LEVEL, RUNES, RUNE_TYPES, archerRange, clampLevel, statsFor, supportHeal, dirsFor, defaultDir, snapDir, streakMultiplier, DIR_VEC, CARDINALS, DIAGONALS,
  BOMBARD_RANGE, bombardCells, cleaveCells, crownTarget, crownTurns, rollerLane, rollerPierce,
  FREE_RANK_WINDOW_MS, MAX_RUNE_RANK, NUKE_DAMAGE, NUKE_SURVIVES_LEVEL, RANK_HP_PER_RANK, RANK_PRICES,
  clampRank, freeRankWindow, freeRankWindowLeft, nukeVaporises, rankHpBonus, rankOf, rankPrice, statsWithRank,
  aimRegionOuterEdge, aimRegionPolygon, aimRegionShape, aimRegions, dirFromCellPoint, isAimChosen, AIM_CENTRE_DEAD_ZONE,
  type Cell
} from '@/game/rules'

/** Cell order is not part of any contract — these compare as sets. */
const byCell = (a: Cell, b: Cell): number => a.row - b.row || a.col - b.col

describe('the crown, as geometry and as a rule', () => {
  it('reaches exactly one tile — the neighbour it faces, a sword\'s reach', () => {
    expect(crownTarget({ col: 1, row: 2 }, 'up')).toEqual({ col: 1, row: 1 })
    expect(crownTarget({ col: 1, row: 2 }, 'down')).toEqual({ col: 1, row: 3 })
    expect(crownTarget({ col: 1, row: 2 }, 'left')).toEqual({ col: 0, row: 2 })
    expect(crownTarget({ col: 1, row: 2 }, 'right')).toEqual({ col: 2, row: 2 })
  })

  it('reaches nothing off the board, and nothing at all without a facing', () => {
    expect(crownTarget({ col: 0, row: 0 }, 'up')).toBeNull()
    expect(crownTarget({ col: 0, row: 0 }, 'left')).toBeNull()
    expect(crownTarget({ col: 3, row: 3 }, 'down')).toBeNull()
    expect(crownTarget({ col: 3, row: 3 }, 'right')).toBeNull()
    // `omni` names no direction; a crown is never omni, but the helper is total.
    expect(crownTarget({ col: 1, row: 1 }, 'omni')).toBeNull()
  })

  it('turns a rune of its own level or below, and no higher', () => {
    // The answer to "can they steal the tower I built?" is "only by building
    // one themselves" — the same shape as the nuke's Lv 2 rule.
    expect(crownTurns(1, 1)).toBe(true)
    expect(crownTurns(1, 2)).toBe(false)
    expect(crownTurns(2, 1)).toBe(true)
    expect(crownTurns(2, 2)).toBe(true)
    expect(crownTurns(2, 3)).toBe(false)
    // A power-rune crown lands at Lv 3 and takes anything the board can hold.
    for (let lv = 1; lv <= MAX_LEVEL; lv++) expect(crownTurns(MAX_LEVEL, lv), `lv ${lv}`).toBe(true)
  })

  it('clamps whatever it is handed, like every other level rule here', () => {
    expect(crownTurns(1, 0)).toBe(true)
    expect(crownTurns(0, 1)).toBe(true)
    expect(crownTurns(1, 99)).toBe(false)
    expect(crownTurns(99, 99)).toBe(true)
  })
})

describe('the rune roster is the GDD table', () => {
  it('has the ten runes with their Lv 1 / Lv 2 stats', () => {
    expect(RUNE_TYPES).toEqual(
      ['melee', 'archer', 'mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker', 'crown'])
    expect(RUNES.melee.lv1).toEqual({ hp: 3, atk: 2 })
    expect(RUNES.melee.lv2).toEqual({ hp: 6, atk: 4 })
    expect(RUNES.archer.lv1).toEqual({ hp: 2, atk: 2 })
    expect(RUNES.archer.lv2).toEqual({ hp: 4, atk: 4 })
    expect(RUNES.mage.lv1).toEqual({ hp: 2, atk: 3 })
    expect(RUNES.mage.lv2).toEqual({ hp: 4, atk: 5 })
    // The shield is sturdier than the GDD's first draft: a wall, not a speed bump.
    expect(RUNES.defense.lv1).toEqual({ hp: 9, atk: 0 })
    expect(RUNES.defense.lv2).toEqual({ hp: 18, atk: 0 })
    expect(RUNES.support.lv1).toEqual({ hp: 3, atk: 0 })
    expect(RUNES.support.lv2).toEqual({ hp: 6, atk: 0 })
    // The three late unlocks: a sword's damage spread over three tiles, a
    // boulder with a sword's damage and no armour, and a fragile tube.
    expect(RUNES.cleave.lv1).toEqual({ hp: 4, atk: 2 })
    expect(RUNES.cleave.lv2).toEqual({ hp: 8, atk: 4 })
    expect(RUNES.roller.lv1).toEqual({ hp: 3, atk: 2 })
    expect(RUNES.roller.lv2).toEqual({ hp: 6, atk: 4 })
    expect(RUNES.bombard.lv1).toEqual({ hp: 2, atk: 2 })
    expect(RUNES.bombard.lv2).toEqual({ hp: 4, atk: 4 })
    // The nuker never attacks: its damage is the blast on placement.
    expect(RUNES.nuker.lv1).toEqual({ hp: 2, atk: 0 })
    expect(RUNES.nuker.lv2).toEqual({ hp: 4, atk: 0 })
    expect(RUNES.nuker.aim).toBe('omni')
    // The crown never attacks either: it takes the rune it faces and is spent.
    // A bow's body, because it is meant to be spent rather than defended.
    expect(RUNES.crown.lv1).toEqual({ hp: 2, atk: 0 })
    expect(RUNES.crown.lv2).toEqual({ hp: 4, atk: 0 })
    // …and it is AIMED, unlike the other two runes with no attack: which stone
    // it takes is the whole decision.
    expect(RUNES.crown.aim).toBe('cardinal')
  })

  it('a nuke is decided by LEVEL, and every Lv 2 body outlives its damage', () => {
    expect(NUKE_SURVIVES_LEVEL).toBe(2)
    expect(nukeVaporises(1)).toBe(true)
    for (let level = 2; level <= MAX_LEVEL; level++) expect(nukeVaporises(level)).toBe(false)
    // Garbage is treated as Lv 1 — a rune whose level cannot be read is not
    // quietly made immune to the one attack that ignores hit points.
    expect(nukeVaporises(0)).toBe(true)
    expect(nukeVaporises(Number.NaN)).toBe(true)
    // The rule "Lv 2 survives" holds for the SMALLEST Lv 2 body on the roster,
    // which is what makes it a rule rather than an arithmetic accident.
    const smallestLv2 = Math.min(...RUNE_TYPES.map((t) => statsFor(t, 2).hp))
    expect(smallestLv2).toBe(4)
    expect(NUKE_DAMAGE).toBeLessThan(smallestLv2)
    // …and a Lv 1 shield, the biggest Lv 1 body in the game, is still vaporised:
    // the blast does not care that 9 HP is three times its damage.
    expect(statsFor('defense', 1).hp).toBeGreaterThan(NUKE_DAMAGE)
    expect(nukeVaporises(1)).toBe(true)
  })

  it('ranks are five, worth one hit point each, and identical for every rune', () => {
    expect(MAX_RUNE_RANK).toBe(5)
    expect(RANK_PRICES).toHaveLength(MAX_RUNE_RANK)
    // The balance guarantee, asserted rather than described: a rank is worth
    // the SAME to every rune, and it never touches attack.
    for (const t of RUNE_TYPES) {
      for (let rank = 0; rank <= MAX_RUNE_RANK; rank++) {
        for (const level of [1, 2, MAX_LEVEL]) {
          const base = statsFor(t, level)
          expect(statsWithRank(t, level, rank)).toEqual({ hp: base.hp + rank * RANK_HP_PER_RANK, atk: base.atk })
        }
      }
      // Rank 0 is exactly the roster's own table.
      expect(statsWithRank(t, 1, 0)).toEqual(statsFor(t, 1))
    }
    expect(rankHpBonus(MAX_RUNE_RANK)).toBe(MAX_RUNE_RANK * RANK_HP_PER_RANK)
  })

  it('rank prices climb and run out at the cap; ranks and lookups clamp on garbage', () => {
    for (let i = 1; i < RANK_PRICES.length; i++) expect(RANK_PRICES[i]!).toBeGreaterThan(RANK_PRICES[i - 1]!)
    expect(rankPrice(0)).toBe(RANK_PRICES[0])
    expect(rankPrice(MAX_RUNE_RANK - 1)).toBe(RANK_PRICES[MAX_RUNE_RANK - 1])
    expect(rankPrice(MAX_RUNE_RANK)).toBeNull()
    expect(rankPrice(99)).toBeNull()
    expect(clampRank(-4)).toBe(0)
    expect(clampRank(99)).toBe(MAX_RUNE_RANK)
    expect(clampRank(Number.NaN)).toBe(0)
    expect(clampRank(2.9)).toBe(2)
    expect(rankOf(undefined, 'melee')).toBe(0)
    expect(rankOf({}, 'melee')).toBe(0)
    expect(rankOf({ melee: 3 }, 'melee')).toBe(3)
    expect(rankOf({ melee: 99 }, 'melee')).toBe(MAX_RUNE_RANK)
    expect(rankOf({ melee: -1 }, 'melee')).toBe(0)
  })

  it('the free upgrade turns on the clock, not on a stored counter', () => {
    expect(FREE_RANK_WINDOW_MS).toBe(20 * 60_000)
    expect(freeRankWindow(0)).toBe(0)
    expect(freeRankWindow(FREE_RANK_WINDOW_MS - 1)).toBe(0)
    expect(freeRankWindow(FREE_RANK_WINDOW_MS)).toBe(1)
    expect(freeRankWindow(FREE_RANK_WINDOW_MS * 7 + 5)).toBe(7)
    // It keeps turning while the game is shut, so a returning player never
    // finds the window they left behind.
    expect(freeRankWindow(-5)).toBe(0)
    expect(freeRankWindowLeft(0)).toBe(FREE_RANK_WINDOW_MS)
    expect(freeRankWindowLeft(FREE_RANK_WINDOW_MS - 1)).toBe(1)
    expect(freeRankWindowLeft(FREE_RANK_WINDOW_MS * 3 + 1000)).toBe(FREE_RANK_WINDOW_MS - 1000)
  })

  it('Lv 2 doubles Lv 1 HP for every rune', () => {
    for (const t of RUNE_TYPES) expect(statsFor(t, 2).hp).toBe(statsFor(t, 1).hp * 2)
  })

  it('stacks to Lv 8: HP grows by the Lv 1 body per level, attack by the Lv 1 → Lv 2 step, never past the cap', () => {
    expect(MAX_LEVEL).toBe(8)
    for (const t of RUNE_TYPES) {
      const { lv1, lv2 } = RUNES[t]
      for (let level = 1; level <= MAX_LEVEL; level++) {
        expect(statsFor(t, level)).toEqual({ hp: lv1.hp * level, atk: lv1.atk + (lv2.atk - lv1.atk) * (level - 1) })
      }
      for (let level = 2; level <= MAX_LEVEL; level++) {
        expect(statsFor(t, level).hp).toBeGreaterThan(statsFor(t, level - 1).hp)
        expect(statsFor(t, level).atk).toBeGreaterThanOrEqual(statsFor(t, level - 1).atk)
      }
      // Garbage clamps to the ends of the ladder.
      expect(statsFor(t, 0)).toEqual(lv1)
      expect(statsFor(t, -3)).toEqual(lv1)
      expect(statsFor(t, 99)).toEqual(statsFor(t, MAX_LEVEL))
      expect(statsFor(t, 2.7)).toEqual(lv2)
    }
    expect(clampLevel(Number.NaN)).toBe(1)
    expect(supportHeal(1)).toBe(1)
    expect(supportHeal(3)).toBe(3)
    expect(supportHeal(50)).toBe(MAX_LEVEL)
    expect(archerRange(1)).toEqual([2])
    expect(archerRange(2)).toEqual([2, 3])
    expect(archerRange(7)).toEqual([2, 3])
  })

  it('aims: swords and bows cardinal, orbs diagonal, shields and crosses omni', () => {
    expect(dirsFor('melee')).toEqual(CARDINALS)
    expect(dirsFor('archer')).toEqual(CARDINALS)
    expect(dirsFor('mage')).toEqual(DIAGONALS)
    expect(dirsFor('defense')).toEqual(['omni'])
    expect(dirsFor('support')).toEqual(['omni'])
    // The three late runes all aim down a rank, so they all snap to cardinals.
    expect(dirsFor('cleave')).toEqual(CARDINALS)
    expect(dirsFor('roller')).toEqual(CARDINALS)
    expect(dirsFor('bombard')).toEqual(CARDINALS)
    // The nuker is not aimed at all: it goes off where it lands.
    expect(dirsFor('nuker')).toEqual(['omni'])
  })

  it('the cleave fans across the three tiles ahead, whichever way it faces', () => {
    // Middle of the board, facing up: the rank above, three wide.
    expect(cleaveCells({ col: 1, row: 2 }, 'up')).toEqual([
      { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }
    ])
    // Facing right: the column to its right, three tall.
    expect(cleaveCells({ col: 1, row: 1 }, 'right').sort(byCell)).toEqual([
      { col: 2, row: 0 }, { col: 2, row: 1 }, { col: 2, row: 2 }
    ].sort(byCell))
    // Along the left edge the off-board horn is simply dropped.
    expect(cleaveCells({ col: 0, row: 2 }, 'up')).toEqual([{ col: 0, row: 1 }, { col: 1, row: 1 }])
    // Facing nowhere hits nothing.
    expect(cleaveCells({ col: 1, row: 1 }, 'omni')).toEqual([])
  })

  it('the bombard shells the rank three ahead — and from Lv 2 the middle one on the way', () => {
    expect(BOMBARD_RANGE).toBe(3)
    // From the bottom rank facing up, the far rank: only reachable from row 3.
    expect(bombardCells({ col: 1, row: 3 }, 'up', 1).sort(byCell)).toEqual([
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }
    ].sort(byCell))
    // Lv 2 adds the single tile at BOMBARD_MID_RANGE, dead ahead.
    expect(bombardCells({ col: 1, row: 3 }, 'up', 2).sort(byCell)).toEqual([
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 1, row: 1 }
    ].sort(byCell))
    // Too close to the far edge: the shells land off the board, so nothing lands.
    expect(bombardCells({ col: 1, row: 2 }, 'up', 1)).toEqual([])
    expect(bombardCells({ col: 1, row: 2 }, 'up', 2)).toEqual([{ col: 1, row: 0 }])
  })

  it('carves a tile into the facings the rune actually has', () => {
    // Cardinal runes get four triangles cut by the diagonals; the triangle's
    // WIDE EDGE is the edge the rune faces, which is what makes it readable.
    expect(aimRegionShape('melee')).toBe('diagonals')
    expect(aimRegionShape('bombard')).toBe('diagonals')
    // The orb aims at corners, so its tile splits on the midlines instead.
    expect(aimRegionShape('mage')).toBe('quadrants')
    // A shield has nothing to aim: one region, the whole tile.
    for (const t of ['defense', 'support', 'nuker'] as const) expect(aimRegionShape(t)).toBe('whole')
    for (const t of RUNE_TYPES) expect(aimRegions(t)).toEqual(dirsFor(t))
  })

  it('picks the facing from where the pointer stands, with no dead zone', () => {
    // Near each edge of a cardinal tile: the facing points at that edge.
    expect(dirFromCellPoint('melee', 0.5, 0.05)).toBe('up')
    expect(dirFromCellPoint('melee', 0.95, 0.5)).toBe('right')
    expect(dirFromCellPoint('melee', 0.5, 0.95)).toBe('down')
    expect(dirFromCellPoint('melee', 0.05, 0.5)).toBe('left')
    // Just off centre still commits — the centre is where a pointer ARRIVES
    // from, so a dead zone there would make the facing flicker.
    expect(dirFromCellPoint('melee', 0.5, 0.49)).toBe('up')
    expect(dirFromCellPoint('melee', 0.5, 0.51)).toBe('down')
    // …and the tie AT the centre falls on the player's own default rather than
    // on `down`. The tile's middle is where a pebble snaps and where a pointer
    // that never aimed deliberately ends up, so the accidental answer must not
    // be the one that points a fresh rune at the player's own base.
    expect(dirFromCellPoint('melee', 0.5, 0.5)).toBe(defaultDir('melee', 'player'))
    expect(dirFromCellPoint('mage', 0.5, 0.5)).toBe(defaultDir('mage', 'player'))
    for (const t of RUNE_TYPES) {
      expect(dirFromCellPoint(t, 0.5, 0.5), `${t} centre`).toBe(defaultDir(t, 'player'))
    }
    // The orb's quadrants.
    expect(dirFromCellPoint('mage', 0.2, 0.2)).toBe('ul')
    expect(dirFromCellPoint('mage', 0.8, 0.2)).toBe('ur')
    expect(dirFromCellPoint('mage', 0.8, 0.8)).toBe('dr')
    expect(dirFromCellPoint('mage', 0.2, 0.8)).toBe('dl')
    // A shield is 'omni' wherever the pointer is.
    for (const [x, y] of [[0, 0], [0.5, 0.5], [1, 1]]) expect(dirFromCellPoint('defense', x!, y!)).toBe('omni')
    // Every point of the tile lands in exactly one region, and always a legal
    // one — swept rather than spot-checked.
    for (const t of RUNE_TYPES) {
      for (let i = 0; i <= 20; i++) {
        for (let j = 0; j <= 20; j++) {
          expect(dirsFor(t), `${t} at ${i / 20},${j / 20}`).toContain(dirFromCellPoint(t, i / 20, j / 20))
        }
      }
    }
    // Off-tile coordinates clamp instead of throwing or returning nonsense.
    expect(dirFromCellPoint('melee', -3, 0.5)).toBe('left')
    expect(dirFromCellPoint('melee', 0.5, 9)).toBe('down')
    expect(dirsFor('melee')).toContain(dirFromCellPoint('melee', Number.NaN, Number.NaN))
  })

  it('treats the tile centre as "not chosen yet" rather than as a choice', () => {
    // Naming a region and CHOOSING one are different acts: the renderer needs a
    // region for every point, the placement logic needs to know whether the
    // player actually picked. Inside the dead zone they have not.
    expect(isAimChosen(0.5, 0.5)).toBe(false)
    expect(isAimChosen(0.5, 0.5 + AIM_CENTRE_DEAD_ZONE / 2)).toBe(false)
    expect(isAimChosen(0.5, 0.5 - AIM_CENTRE_DEAD_ZONE / 2)).toBe(false)
    // …and just outside it they have.
    expect(isAimChosen(0.5, 0.5 - AIM_CENTRE_DEAD_ZONE - 0.01)).toBe(true)
    expect(isAimChosen(0.05, 0.5)).toBe(true)
    expect(isAimChosen(0.5, 0.95)).toBe(true)
    expect(isAimChosen(0.95, 0.95)).toBe(true)
    // The zone is small: the great majority of a tile is still a live choice,
    // or the control would feel dead rather than forgiving.
    let chosen = 0
    let total = 0
    for (let i = 0; i <= 40; i++) {
      for (let j = 0; j <= 40; j++) {
        total++
        if (isAimChosen(i / 40, j / 40)) chosen++
      }
    }
    expect(chosen / total).toBeGreaterThan(0.85)
    // Garbage is "not chosen": a pointer whose position cannot be read must
    // never silently overrule a facing the player set deliberately.
    expect(isAimChosen(Number.NaN, Number.NaN)).toBe(false)
  })

  it('gives every region a polygon that contains its own facing', () => {
    for (const t of RUNE_TYPES) {
      for (const dir of aimRegions(t)) {
        const poly = aimRegionPolygon(t, dir)
        expect(poly.length, `${t}/${dir}`).toBeGreaterThanOrEqual(3)
        // Its centroid must be inside the region it claims to draw — the check
        // that catches a polygon and a hit-test that have drifted apart.
        const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length
        const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length
        expect(dirFromCellPoint(t, cx, cy), `${t}/${dir} centroid`).toBe(dir)
        for (const [x, y] of poly) {
          expect(x, `${t}/${dir}`).toBeGreaterThanOrEqual(0)
          expect(x, `${t}/${dir}`).toBeLessThanOrEqual(1)
          expect(y, `${t}/${dir}`).toBeGreaterThanOrEqual(0)
          expect(y, `${t}/${dir}`).toBeLessThanOrEqual(1)
        }
      }
    }
  })

  it('knows which part of every region faces OUT of the tile', () => {
    // What the compass draws its chevron over and leans its arrow toward. It
    // has to be OUTWARD on every facing of every rune, and it used not to be:
    // the old code took the polygon's first point as the outer one, which is
    // true of `up` and `ul` and false of the other six. On `dr` the first
    // point IS the tile's centre, so the mark that was meant to lean clear of
    // a fingertip leaned straight under it.
    for (const t of RUNE_TYPES) {
      for (const dir of aimRegions(t)) {
        if (dir === 'omni') continue
        const { a, b, ax, ay } = aimRegionOuterEdge(t, dir)
        const poly = aimRegionPolygon(t, dir)
        expect(a, `${t}/${dir}`).not.toBe(b)
        expect(poly[a], `${t}/${dir} a`).toBeDefined()
        expect(poly[b], `${t}/${dir} b`).toBeDefined()
        // The anchor lies away from the centre, along the facing's own vector.
        const [dx, dy] = DIR_VEC[dir]
        const n = Math.hypot(dx, dy) || 1
        const dot = (ax - 0.5) * (dx / n) + (ay - 0.5) * (dy / n)
        expect(dot, `${t}/${dir} anchor`).toBeGreaterThan(0.4)
        // …and it is still a point of this region, so the mark cannot stray
        // onto a neighbouring facing's ground.
        expect(dirFromCellPoint(t, ax, ay), `${t}/${dir} anchor region`).toBe(dir)
        // Both arms are further out than the region's inner vertex.
        const d2 = (x: number, y: number): number => (x - 0.5) ** 2 + (y - 0.5) ** 2
        const inner = poly.reduce((lo, p) => Math.min(lo, d2(p[0], p[1])), Infinity)
        expect(d2(poly[a]![0], poly[a]![1]), `${t}/${dir} arm a`).toBeGreaterThan(inner)
        expect(d2(poly[b]![0], poly[b]![1]), `${t}/${dir} arm b`).toBeGreaterThan(inner)
      }
    }
  })

  it('gives an omni region no outward feature to draw', () => {
    // A shield fires nowhere, so there is no edge to point a chevron at, and
    // the caller is told by getting the same index twice.
    const e = aimRegionOuterEdge('defense', 'omni')
    expect(e.a).toBe(e.b)
    expect([e.ax, e.ay]).toEqual([0.5, 0.5])
  })

  it('the roller lane runs from the tile ahead to the edge', () => {
    expect(rollerLane({ col: 1, row: 3 }, 'up')).toEqual([
      { col: 1, row: 2 }, { col: 1, row: 1 }, { col: 1, row: 0 }
    ])
    expect(rollerLane({ col: 3, row: 1 }, 'right')).toEqual([])
    expect(rollerLane({ col: 1, row: 1 }, 'omni')).toEqual([])
    // A Lv 1 boulder stops at the first survivor; each level above ploughs one further.
    expect(rollerPierce(1)).toBe(0)
    expect(rollerPierce(2)).toBe(1)
    expect(rollerPierce(MAX_LEVEL)).toBe(MAX_LEVEL - 1)
  })

  it('defaults face the enemy', () => {
    expect(defaultDir('melee', 'player')).toBe('up')
    expect(defaultDir('melee', 'enemy')).toBe('down')
    expect(defaultDir('mage', 'player')).toBe('ur')
    expect(defaultDir('mage', 'enemy')).toBe('dl')
    expect(defaultDir('defense', 'player')).toBe('omni')
  })

  it('up is toward row 0', () => {
    expect(DIR_VEC.up).toEqual([0, -1])
    expect(DIR_VEC.dr).toEqual([1, 1])
  })
})

describe('snapDir', () => {
  it('snaps a short swipe to the default', () => {
    expect(snapDir('melee', 'player', 3, -2, 20)).toBe('up')
    expect(snapDir('mage', 'enemy', 0, 0, 20)).toBe('dl')
  })
  it('snaps cardinal swipes to the nearest of four', () => {
    expect(snapDir('melee', 'player', 0, -50, 20)).toBe('up')
    expect(snapDir('melee', 'player', 50, 5, 20)).toBe('right')
    expect(snapDir('melee', 'player', -5, 50, 20)).toBe('down')
    expect(snapDir('melee', 'player', -50, -10, 20)).toBe('left')
  })
  // NOTE for the owner of rules.ts: the diagonal branch of `snapDir` adds a
  // +PI/4 shift BEFORE flooring, which centres the sectors on the cardinals and
  // maps an up-right swipe to 'dr'. Remove the shift (keep the table) and this
  // passes: a = ((angle + 2PI) % 2PI) / (PI/2); q = floor(a) % 4.
  it('snaps diagonal swipes to the nearest of four', () => {
    expect(snapDir('mage', 'player', 40, -40, 20)).toBe('ur')
    expect(snapDir('mage', 'player', -40, -40, 20)).toBe('ul')
    expect(snapDir('mage', 'player', 40, 40, 20)).toBe('dr')
    expect(snapDir('mage', 'player', -40, 40, 20)).toBe('dl')
    // Straight up, for a mage, is the nearest diagonal — never a cardinal.
    expect(DIAGONALS).toContain(snapDir('mage', 'player', 0, -50, 20))
  })
  it('omni runes ignore the swipe', () => {
    expect(snapDir('defense', 'player', 100, 100, 20)).toBe('omni')
  })
})

describe('streak multiplier', () => {
  it('climbs from ×1 to ×3 and caps', () => {
    expect(streakMultiplier(0)).toBe(1)
    expect(streakMultiplier(1)).toBe(1)
    expect(streakMultiplier(2)).toBe(1.5)
    expect(streakMultiplier(5)).toBe(3)
    expect(streakMultiplier(40)).toBe(3)
  })
})
