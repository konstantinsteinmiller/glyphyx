/**
 * ─── The campaign map ───────────────────────────────────────────────────────
 *
 * Chapters of eight nodes. Chapter 1 is written by hand — it is the onboarding,
 * and every node in it teaches exactly one thing — and every chapter after it
 * is generated from the node number alone, so a save that stores one integer
 * can rebuild any node on any device.
 *
 * The player's difficulty setting is deliberately NOT part of a node: it feeds
 * the AI's dice (see `ai.ts`) and nothing else, so two players on "Level 3-4"
 * are looking at the same board.
 */

import {
  FACTION_DEFS, TURN_LIMIT, TUTORIAL_TURN_LIMIT, type AiLevel, type EnemySetup, type Faction, type GhostSpec,
  type Move, type NodeConfig, type PresetRune, type RuneType, type SkinId
} from './rules'
import { seedFrom } from './rng'

export const NODES_PER_CHAPTER = 8

export const chapterOf = (id: number): number => Math.floor((Math.max(1, id) - 1) / NODES_PER_CHAPTER) + 1
export const indexInChapter = (id: number): number => ((Math.max(1, id) - 1) % NODES_PER_CHAPTER) + 1
export const nodeId = (chapter: number, index: number): number => (chapter - 1) * NODES_PER_CHAPTER + index

const enemy = (
  faction: Faction, post: EnemySetup['post'], ai: AiLevel,
  opts: { atkMul?: number; deck?: RuneType[]; script?: readonly Move[] } = {}
): EnemySetup => ({
  faction,
  post,
  deck: opts.deck ?? FACTION_DEFS[faction].deck.slice(),
  ai,
  atkMul: opts.atkMul ?? 1,
  ...(opts.script ? { script: opts.script } : {})
})

const base = (id: number): Omit<NodeConfig, 'mode' | 'objective' | 'enemies' | 'reward'> => ({
  id,
  chapter: chapterOf(id),
  index: indexInChapter(id),
  presets: [],
  playerDeck: null,
  tutorial: null,
  // No clock, on any node. See `NodeConfig.timer`.
  timer: false,
  turnLimit: TURN_LIMIT,
  seed: seedFrom(id, 7)
})

const reward = (coins: number, unlockRune: RuneType | null = null, unlockSkin: SkinId | null = null, big = false) =>
  ({ coins, unlockRune, unlockSkin, big })

// ─── Chapter 1, by hand ─────────────────────────────────────────────────────
//
// Six lessons, then two real fights. Every lesson introduces ONE rune with a
// ghost hand that shows the single move that makes the point, against dummies
// that never place (`passive`) — so the objective can only be met, never
// raced — and with no clock (`timer: false`) and a turn limit no lesson can
// run into. The dummies of the first four cannot hurt (`atkMul 0`); the
// shield and cross lessons need an enemy that DOES hit, so their dummies fire
// (`atkMul` 1 and 0.5) but still never place. What each teaches:
//
//   1-1 drag     a sword carried onto a tile and released on the side that faces
//                the skeleton — the drop and the aim as one move
//   1-2 archer   the bow shoots OVER the tile in front of it (your own sword)
//   1-3 stack    a sword dropped onto a sword is a Lv 2 sword
//   1-4 mage     the orb's beam sweeps two tiles on the diagonal
//   1-5 defense  a shield stops an arrow; your bow shoots over your shield
//   1-6 support  a cross heals the wounded sword beside it, every turn
//   1-7          the first real duel, easy goblins (obsidian skin)
//   1-8          the first siege, easy, the chapter chest (jade skin)
//
// The floor of each lesson is pinned in `tests/game/floor.test.ts`.

const skeleton = (type: RuneType, col: number, row: number, hp: number): PresetRune =>
  ({ side: 'enemy', faction: 'skeleton', type, col, row, dir: 'down', hp })

const lesson = (
  b: ReturnType<typeof base>, beat: NonNullable<NodeConfig['tutorial']>, ghost: GhostSpec, playerDeck: RuneType[]
): Omit<NodeConfig, 'mode' | 'objective' | 'enemies' | 'reward'> =>
  ({ ...b, tutorial: beat, ghost, playerDeck, timer: false, turnLimit: TUTORIAL_TURN_LIMIT })

const chapterOne = (id: number): NodeConfig => {
  const b = base(id)
  switch (indexInChapter(id)) {
    case 1:
      // ONE gesture, and it is the one the game is actually played with: carry
      // the sword to (1,2) and let go on the LEFT side of that tile, where the
      // 1-HP skeleton stands on (0,2). Where you release inside a tile is which
      // way the rune faces, so the drop and the aim are a single move.
      //
      // This lesson used to drop the sword facing nothing and then teach a
      // press-and-flick correction, holding the window open until the player
      // performed it. That was right when a stroke was the only way to aim; it
      // is now a tutorial in the game's FALLBACK — slower, and harder to
      // understand than the thing it is standing in for. The correction still
      // exists (it is how a finger fixes a mis-drop, and how a keyboard aims),
      // but it is discovered from the hint pill, not drilled at minute one.
      return {
        ...lesson(b, 'drag', { type: 'melee', to: { col: 1, row: 2 }, dir: 'left' }, ['melee']),
        // The first board anyone sees is cut from OBSIDIAN, not from the beige
        // river sandstone a new save starts with: black glass with the glyph
        // as a cold neon line reads far better at a glance, and this is the
        // one node where no player has a material of their own to override.
        skin: 'obsidian',
        mode: '1v1', objective: 'eliminate',
        enemies: [enemy('skeleton', 'top', 'passive', { atkMul: 0, deck: ['melee'] })],
        presets: [skeleton('melee', 0, 2, 1)],
        reward: reward(15, 'archer')
      }
    case 2:
      // Your sword stands at (1,2) under a 3-HP skeleton at (1,1). The bow
      // dropped at (1,3) shoots OVER your own sword and lands on that skeleton
      // — `ARCHER_RANGE[1]` is [2], so from (1,3) the arrow skips (1,2) and
      // strikes (1,1) — and sword plus arrow is 4 against 3. One move, one
      // turn, lesson over.
      //
      // It used to hold a second skeleton, an archer at (1,0), on the theory
      // that the arrow reached IT. It does not: nothing the lesson put on the
      // board could reach (1,0), so the ghost's move left a survivor and
      // finishing the lesson needed a second move it never taught. Four of five
      // blind testers were still in this lesson when they quit (2026-09-11),
      // boards full, watching a turn counter. The floor test now holds every
      // lesson to the same one-turn rule the late lessons already pass.
      return {
        ...lesson(b, 'archer', { type: 'archer', to: { col: 1, row: 3 }, dir: 'up' }, ['melee', 'archer']),
        mode: '1v1', objective: 'eliminate',
        enemies: [enemy('skeleton', 'top', 'passive', { atkMul: 0, deck: ['melee', 'archer'] })],
        presets: [
          { side: 'player', faction: null, type: 'melee', col: 1, row: 2, dir: 'up' },
          skeleton('melee', 1, 1, 3)
        ],
        reward: reward(20)
      }
    case 3:
      // A 5-HP brute on the top edge (no knockback), your sword below it. A
      // sword dropped ONTO the sword makes it Lv 2: 4 − 1 mitigation = 3 a
      // turn, the brute is gone in two — alone, the Lv 1 sword needs five.
      return {
        ...lesson(b, 'stack', { type: 'melee', to: { col: 2, row: 1 }, dir: 'up' }, ['melee', 'archer']),
        mode: '1v1', objective: 'eliminate',
        enemies: [enemy('orc', 'top', 'passive', { atkMul: 0, deck: ['melee'] })],
        presets: [
          { side: 'player', faction: null, type: 'melee', col: 2, row: 1, dir: 'up' },
          { side: 'enemy', faction: 'orc', type: 'defense', col: 2, row: 0, dir: 'omni', hp: 5 }
        ],
        reward: reward(25, 'mage')
      }
    case 4:
      // Two 3-HP skeletons on one diagonal; the orb at (1,2) facing up-right
      // beams (2,1) and (3,0) in one shot.
      return {
        ...lesson(b, 'mage', { type: 'mage', to: { col: 1, row: 2 }, dir: 'ur' }, ['melee', 'archer', 'mage']),
        mode: '1v1', objective: 'eliminate',
        enemies: [enemy('skeleton', 'top', 'passive', { atkMul: 0, deck: ['melee', 'archer'] })],
        presets: [skeleton('melee', 2, 1, 3), skeleton('archer', 3, 0, 3)],
        reward: reward(30, 'defense')
      }
    case 5:
      // Two bows face each other down column 1. The enemy's fires every turn
      // and would kill yours (2 HP) at once; the shield dropped between them
      // takes the arrow instead, while YOUR arrow flies over the shield and
      // finishes the 4-HP archer in two turns.
      return {
        ...lesson(b, 'defense', { type: 'defense', to: { col: 1, row: 1 }, dir: 'omni' }, ['melee', 'archer', 'defense']),
        mode: '1v1', objective: 'eliminate',
        enemies: [enemy('skeleton', 'top', 'passive', { atkMul: 1, deck: ['archer'] })],
        presets: [
          { side: 'player', faction: null, type: 'archer', col: 1, row: 2, dir: 'up', hp: 2 },
          { ...skeleton('archer', 1, 0, 4) }
        ],
        reward: reward(35, 'support')
      }
    case 6:
      // Your sword at (1,2) is down to 1 HP against a 6-HP orc that hits for
      // 1. The cross dropped beside it heals 1 every turn BEFORE the blades
      // swing, so the sword out-trades the orc in three turns instead of dying
      // on the first.
      return {
        ...lesson(b, 'support', { type: 'support', to: { col: 0, row: 2 }, dir: 'omni' }, ['melee', 'archer', 'support']),
        mode: '1v1', objective: 'eliminate',
        enemies: [enemy('orc', 'top', 'passive', { atkMul: 0.5, deck: ['melee'] })],
        presets: [
          { side: 'player', faction: null, type: 'melee', col: 1, row: 2, dir: 'up', hp: 1, maxHp: 3 },
          { side: 'enemy', faction: 'orc', type: 'melee', col: 1, row: 1, dir: 'down', hp: 6 }
        ],
        reward: reward(40)
      }
    case 7:
      // The first real duel: easy goblins, the whole roster in hand.
      //
      // And the first time the game asks for something other than "kill them
      // all", which is why it opens with one taught move (`guide`, not a
      // lesson — the node stays a real fight with a real clock and the
      // adaptive relief intact). The sword onto (1,2) steps OFF the player's
      // home row onto neutral ground and claims it: the whole rule of the mode
      // in one gesture, which is how every rune was taught. Two blind testers
      // lost this node twice and quit without ever learning that a placed rune
      // takes its tile (2026-09-12 round 4).
      return {
        ...b, mode: '1v1', objective: 'conquest',
        guide: { type: 'melee', to: { col: 1, row: 2 }, dir: 'up' },
        enemies: [enemy('goblin', 'top', 'easy')],
        reward: reward(45, null, 'obsidian')
      }
    default:
      // The first siege, easy, and the chapter chest.
      return {
        ...b, mode: 'siege', objective: 'siege',
        enemies: [enemy('goblin', 'north', 'medium'), enemy('orc', 'west', 'medium'), enemy('undead', 'east', 'medium')],
        reward: reward(100, null, 'jade', true)
      }
  }
}

// ─── Chapter 2 and on, generated ────────────────────────────────────────────

const REAL_FACTIONS: readonly Faction[] = ['goblin', 'orc', 'undead']
/**
 * Skins handed out by the campaign after the two chapter-1 ones, in order.
 *
 * The three gems are at the end because they are the top of the shop ladder
 * too: a player who buys nothing still meets them, several chapters after the
 * stone ones, and a player who buys everything has already earned them.
 */
const LATER_SKINS: readonly SkinId[] = ['amber', 'marble', 'ember', 'sapphire', 'ruby', 'diamond']

/**
 * The four late runes and the node that hands each one over.
 *
 * Keyed by NODE, not by rune, for two reasons: `generated()` looks its own id
 * up here once per node with no scan, and a chest has room for exactly one
 * `unlockRune` — so a table that cannot name two runes for one node is a table
 * that cannot express the illegal state.
 *
 * They sit on the ODD indices 1 and 5, which is where the skins are not (those
 * ride the 4th and the 8th), so no node ever has to choose between the two
 * gifts. `tests/game/campaign.test.ts` asserts that rather than trusting it.
 */
export const RUNE_UNLOCK_NODES: Readonly<Record<number, RuneType>> = {
  [nodeId(2, 1)]: 'cleave',   // 2-1, straight out of the chapter-1 chest
  [nodeId(2, 5)]: 'roller',   // 2-5, once the axe has been swung a few times
  [nodeId(3, 1)]: 'bombard',  // 3-1, the artillery that opens chapter 3
  // 4-1. The nuke is the one move that can undo a whole board, so it is handed
  // over only to a player who has three chapters of position behind them and
  // something worth resetting — and it is the one rune impatience can buy
  // early, for a rewarded video.
  [nodeId(4, 1)]: 'nuker',
  // 4-5, and the LAST rune the campaign ever gives. The crown is kept for the
  // end because it is the only rune that plays the WIN CONDITION rather than
  // the fight: a player who has not yet felt a match decided by who holds
  // eight tiles has no idea what they are being handed. It also lands one
  // chapter's worth of play after the nuke on purpose — those two are the
  // opposite answers to a board that has gone wrong (burn it down, or take a
  // piece of theirs), and meeting them together would blur both.
  [nodeId(4, 5)]: 'crown'
}

const aiForChapter = (chapter: number): AiLevel =>
  chapter <= 2 ? 'medium' : chapter === 3 ? 'hard' : 'brutal'

/**
 * The late rune each faction learns in chapter 4 — one each, chosen to sharpen
 * what the faction already is rather than to even them out: the orc line gets
 * the axe, the goblin swarm the boulder that ploughs a lane (their own runes
 * are cheap enough to roll over), the undead the artillery behind their wall.
 */
const LATE_RUNE: Readonly<Record<Faction, RuneType | null>> = {
  skeleton: null, // the tutorial dummies never reach chapter 4
  goblin: 'roller',
  orc: 'cleave',
  undead: 'bombard'
}

const widenedDeck = (faction: Faction, chapter: number): RuneType[] => {
  const deck = FACTION_DEFS[faction].deck.slice()
  if (chapter >= 3) {
    for (const extra of ['defense', 'support'] as const) if (!deck.includes(extra)) deck.push(extra)
  }
  if (chapter >= 4) {
    const late = LATE_RUNE[faction]
    if (late && !deck.includes(late)) deck.push(late)
  }
  return deck
}

const generated = (id: number): NodeConfig => {
  const b = base(id)
  const chapter = chapterOf(id)
  const index = indexInChapter(id)
  const ai = aiForChapter(chapter)
  const rot = (k: number): Faction => REAL_FACTIONS[(id + chapter + k) % REAL_FACTIONS.length]!
  const coins = (30 + 5 * chapter) * (index === NODES_PER_CHAPTER ? 2 : 1)
  let unlockSkin: SkinId | null = null
  if (index === 4 || index === NODES_PER_CHAPTER) {
    const slot = (chapter - 2) * 2 + (index === 4 ? 0 : 1)
    unlockSkin = LATER_SKINS[slot] ?? null
  }
  const chest = reward(coins, RUNE_UNLOCK_NODES[id] ?? null, unlockSkin, index === NODES_PER_CHAPTER)

  if (index % 2 === 1) {
    const f = rot(0)
    return {
      ...b, mode: '1v1', objective: 'conquest',
      enemies: [enemy(f, 'top', ai, { deck: widenedDeck(f, chapter) })],
      reward: chest
    }
  }
  const [n, w, e] = [rot(0), rot(1), rot(2)]
  return {
    ...b, mode: 'siege', objective: 'siege',
    enemies: [
      enemy(n, 'north', ai, { deck: widenedDeck(n, chapter) }),
      enemy(w, 'west', ai, { deck: widenedDeck(w, chapter) }),
      enemy(e, 'east', ai, { deck: widenedDeck(e, chapter) })
    ],
    reward: chest
  }
}

// ─── The late lessons ───────────────────────────────────────────────────────
//
// A rune handed over by a chest is a rune the player has never used, and the
// four late ones are the least guessable in the game: an axe that hits three
// tiles, a boulder that hits its own side, a mortar that cannot touch anything
// nearer than three ranks, and a bomb that clears the board of both armies at
// once. So each unlock chest is followed IMMEDIATELY by a lesson for what it
// just gave — 2-2 after the axe of 2-1, 2-6 after the boulder of 2-5, 3-2
// after the mortar of 3-1, 4-2 after the nuker of 4-1.
//
// They are built exactly like chapter 1's: a ghost hand showing the ONE move
// that makes the point, dummies that never place (`passive`) and cannot hurt
// (`atkMul 0`), no clock, and a turn limit no lesson can run into. Each is
// won by the ghost's move alone, in one turn, so the shape of the attack is
// the whole lesson — and each keeps the coins the generated node would have
// paid, so replacing a fight with a lesson costs the player nothing.

/** The node each late rune is taught on, one after the node that gives it. */
export const LATE_LESSON_NODES: Readonly<Record<number, RuneType>> = {
  [nodeId(2, 2)]: 'cleave',
  [nodeId(2, 6)]: 'roller',
  [nodeId(3, 2)]: 'bombard',
  [nodeId(4, 2)]: 'nuker',
  [nodeId(4, 6)]: 'crown'
}

/**
 * Turn the generated node `gen` into the lesson for `rune`, keeping its id,
 * chapter, seed and chest. Every one of these is a 1v1 against bone dummies:
 * a siege has three factions placing runes, and a lesson may not have anything
 * moving on the board but the player.
 */
const lateLesson = (gen: NodeConfig, rune: RuneType): NodeConfig => {
  const b: Omit<NodeConfig, 'mode' | 'objective' | 'enemies' | 'reward'> = {
    id: gen.id, chapter: gen.chapter, index: gen.index, seed: gen.seed,
    presets: [], playerDeck: null, tutorial: null, timer: false, turnLimit: TURN_LIMIT
  }
  const duel = (
    beat: NonNullable<NodeConfig['tutorial']>, ghost: GhostSpec, playerDeck: RuneType[],
    presets: PresetRune[], deck: RuneType[]
  ): NodeConfig => ({
    ...lesson(b, beat, ghost, playerDeck),
    mode: '1v1', objective: 'eliminate',
    enemies: [enemy('skeleton', 'top', 'passive', { atkMul: 0, deck })],
    presets,
    reward: gen.reward
  })

  switch (rune) {
    case 'cleave':
      // Three dummies shoulder to shoulder on the rank above. A sword would
      // need three turns; the axe dropped below the middle one fells the whole
      // line in a single swing — the width IS the rune.
      return duel(
        'cleave',
        { type: 'cleave', to: { col: 1, row: 2 }, dir: 'up' },
        ['melee', 'cleave'],
        [skeleton('melee', 0, 1, 2), skeleton('melee', 1, 1, 2), skeleton('archer', 2, 1, 2)],
        ['melee', 'archer']
      )
    case 'roller':
      // Three dummies queued down ONE lane. The boulder does not stop at the
      // first: it breaks each one and rolls on through, so the whole column
      // goes in one placement. (What it also does to friendlies standing in
      // that lane is the rune's own card, not this lesson's — nothing of the
      // player's is on the board to be flattened here.)
      return duel(
        'roller',
        { type: 'roller', to: { col: 1, row: 3 }, dir: 'up' },
        ['melee', 'roller'],
        [skeleton('melee', 1, 2, 2), skeleton('melee', 1, 1, 2), skeleton('archer', 1, 0, 2)],
        ['melee', 'archer']
      )
    case 'crown':
      // Two dummies in one file: a sword on (1,1) and, behind it, a 2-HP bow
      // the player cannot reach this turn. The crown dropped at (1,2) facing up
      // takes the sword — and the sword, now theirs and turned around, kills
      // the bow in the same resolution.
      //
      // One drop teaches both halves of the rune, which is why the board is
      // shaped like this and not around a single target: that the stone you
      // face becomes YOURS, and that it fights for you immediately. A lesson
      // with one dummy on it would have taught the first half and quietly
      // hidden the second, which is the half that decides matches.
      //
      // The crown is spent doing it and leaves the board; the player ends the
      // turn holding the tile it stood on and the sword it took.
      return duel(
        'crown',
        { type: 'crown', to: { col: 1, row: 2 }, dir: 'up' },
        ['melee', 'crown'],
        [skeleton('melee', 1, 1, 3), skeleton('archer', 1, 0, 2)],
        ['melee', 'archer']
      )
    case 'bombard':
      // Three dummies on the FAR rank, out of reach of everything the player
      // owns — a bow from the back row strikes the second rank, not the
      // fourth — and the player's own shield standing in the way, which the
      // shell is lobbed straight over. Three ranks ahead, three tiles wide,
      // over any wall: the whole rune in one drop.
      return duel(
        'bombard',
        { type: 'bombard', to: { col: 1, row: 3 }, dir: 'up' },
        ['archer', 'bombard'],
        [
          { side: 'player', faction: null, type: 'defense', col: 1, row: 2, dir: 'omni' },
          skeleton('archer', 0, 0, 2), skeleton('archer', 1, 0, 2), skeleton('archer', 2, 0, 2)
        ],
        ['archer']
      )
    default:
      // The nuke, and the only lesson that teaches all three halves of a rune
      // at once — because one placement demonstrates all three, and nothing
      // else could.
      //
      //   • it clears the board — the three dummies stand like non-attacking
      //     queens, no two sharing a rank, a file OR a diagonal, so that no
      //     other rune in the game could take two of them in one move, let
      //     alone three: not a cleave's fan, not a roller's lane, not a mage's
      //     beam, not a bombard's rank. The test asserts that geometry rather
      //     than trusting the layout;
      //   • hit points do not save anything — the dummy on (3,2) is a 9-HP
      //     shield, the fattest Lv 1 body in the game, and it goes with the
      //     2-HP bow, because the blast reads LEVEL, not health;
      //   • it does not spare the player either — their own Lv 1 sword on (2,3)
      //     is vaporised with the rest, while their Lv 2 sword on (1,2) walks
      //     out of it on 3 of its 6 HP. Stack, and you survive the apocalypse.
      //
      // Safe to blow up the player's own rune here: `eliminate` has no
      // "player has no runes" loss (see `evaluateResult`), so the only way to
      // lose a lesson is still the turn limit.
      return duel(
        'nuker',
        { type: 'nuker', to: { col: 1, row: 3 }, dir: 'omni' },
        ['melee', 'nuker'],
        [
          { side: 'player', faction: null, type: 'melee', col: 1, row: 2, dir: 'up', level: 2 },
          { side: 'player', faction: null, type: 'melee', col: 2, row: 3, dir: 'up' },
          skeleton('melee', 2, 0, 3),
          skeleton('archer', 0, 1, 2),
          { side: 'enemy', faction: 'skeleton', type: 'defense', col: 3, row: 2, dir: 'omni', hp: 9 }
        ],
        ['melee']
      )
  }
}

// ─── The clash lesson ───────────────────────────────────────────────────────
//
// Both sides plan at once and reveal at once, which means both can reach for
// the SAME tile in the same turn. When they do the two stones smash: the one
// with more health is the one still standing, minus what the other one had,
// and two equal stones break each other. It is the only rule in the game whose
// cause is invisible — the player watches a rune they just paid for come apart
// on the tile they chose, with nothing on that tile to blame.
//
// It cannot be taught the way every other lesson is, because a lesson's
// dummies never place and this lesson NEEDS the enemy to place. So 2-3's dummy
// carries a script (`EnemySetup.script`) and dives for (1,2) every turn until
// somebody is standing there.
//
// It sits at 2-3 rather than earlier because the enemy does not place a single
// rune until 1-7, and a rule explained before it can happen is a rule nobody
// remembers. By 2-3 the player has fought three real matches and has most
// likely already had this happen to them once.
export const CLASH_LESSON_NODE = nodeId(2, 3)

/**
 * The board: the player's sword (3 HP) and the dummy's bow (2 HP) both dropped
 * on (1,2).
 *
 * The sword wins on health and comes out of it on 1 — hurt, which is the half
 * of the rule that costs matches — and then swings up into the 1-HP skeleton
 * on (1,1) in the same resolution, so the ghost's single move still clears the
 * node in one turn like every other lesson. A bow on the enemy's side rather
 * than a second sword on purpose: two swords would have broken each other, the
 * player would have ended the turn with nothing on the board and no idea which
 * stone had won, and there would have been no survivor to read the wound on.
 */
const clashLesson = (gen: NodeConfig): NodeConfig => {
  const b: Omit<NodeConfig, 'mode' | 'objective' | 'enemies' | 'reward'> = {
    id: gen.id, chapter: gen.chapter, index: gen.index, seed: gen.seed,
    presets: [], playerDeck: null, tutorial: null, timer: false, turnLimit: TURN_LIMIT
  }
  return {
    ...lesson(b, 'clash', { type: 'melee', to: { col: 1, row: 2 }, dir: 'up' }, ['melee']),
    mode: '1v1', objective: 'eliminate',
    enemies: [enemy('skeleton', 'top', 'passive', {
      atkMul: 0,
      deck: ['archer'],
      script: [{ side: 'enemy', faction: 'skeleton', type: 'archer', col: 1, row: 2, dir: 'down' }]
    })],
    presets: [skeleton('melee', 1, 1, 1)],
    reward: gen.reward
  }
}

/**
 * Is node `id` a LESSON — one of the scripted, clockless, cannot-be-lost nodes?
 *
 * Asked by everything that must not interrupt the teaching: a lesson hands over
 * silently (the coins fly, the next lesson starts), so an ad dropped between
 * two of them reads as an ad dropped INSIDE one. A blind tester on 2026-09-12
 * described exactly that — "it cut into an active fight" — for an interstitial
 * that had in fact fired at a clean 1-6 → 1-7 boundary.
 */
export const isLessonNode = (id: number): boolean => nodeConfig(id, 'medium').tutorial !== null

/**
 * The first node that is a FIGHT — 1-7, the one the six lessons lead up to.
 *
 * It is named because it is the game's steepest step, and the step is
 * structural rather than a tuning miss. Every node before it is won by making
 * ONE correct move against dummies that never place; this one is a full match
 * against an opponent trying to win it, and the player arrives having never
 * planned a turn against anybody. Measured with the scripted stand-ins for a
 * player who has not mastered the controls (`tests/game/floor.test.ts`), a
 * first attempt here is won 25 % of the time — and in the 2026-09-12 round-2
 * blind playtest four of the five testers who reached it lost it.
 *
 * `adaptive.ts` answers that; the node itself is left alone. Its goblins are
 * already the gentlest real opponent in the game (`easy`, the only single-
 * faction duel), so there is nothing left to soften here that would not make
 * it a seventh lesson.
 */
export const FIRST_FIGHT_NODE = nodeId(1, 7)

/** Is `id` the first real fight? `adaptive.ts` gives it the one-loss relief up front. */
export const isFirstFightNode = (id: number): boolean => Math.floor(id) === FIRST_FIGHT_NODE

/** The full setup of global node `id`. Chapter 1 is authored; later chapters are generated. Pure and deterministic. */
export const nodeConfig = (id: number, _difficulty: 'easy' | 'medium' | 'hard'): NodeConfig => {
  const safe = Math.max(1, Math.floor(id))
  if (chapterOf(safe) === 1) return chapterOne(safe)
  const gen = generated(safe)
  if (safe === CLASH_LESSON_NODE) return clashLesson(gen)
  const late = LATE_LESSON_NODES[safe]
  return late ? lateLesson(gen, late) : gen
}
