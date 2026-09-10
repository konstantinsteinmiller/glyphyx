import { describe, expect, it } from 'vitest'
import {
  LATE_LESSON_NODES, NODES_PER_CHAPTER, RUNE_UNLOCK_NODES, chapterOf, indexInChapter, nodeConfig, nodeId
} from '@/game/campaign'
import {
  NUKE_DAMAGE, RUNE_TYPES, SKIN_IDS, STARTING_RUNES, TUTORIAL_TURN_LIMIT, chestIsGift, crownTurns, dirsFor,
  nukeVaporises, statsFor, type RuneType
} from '@/game/rules'

describe('node numbering', () => {
  it('eight nodes per chapter, 1-based both ways', () => {
    expect(NODES_PER_CHAPTER).toBe(8)
    expect(chapterOf(1)).toBe(1)
    expect(indexInChapter(1)).toBe(1)
    expect(chapterOf(8)).toBe(1)
    expect(indexInChapter(8)).toBe(8)
    expect(chapterOf(9)).toBe(2)
    expect(indexInChapter(9)).toBe(1)
    expect(nodeId(3, 4)).toBe(20)
    expect(chapterOf(nodeId(3, 4))).toBe(3)
  })
})

describe('chapter 1 is the onboarding', () => {
  it('1-1 is exactly the one-HP skeleton BESIDE the ghost\'s tile, unlosable, sword-only, no timer', () => {
    const n = nodeConfig(1, 'medium')
    expect(n).toMatchObject({ chapter: 1, index: 1, mode: '1v1', objective: 'eliminate', tutorial: 'drag', timer: false })
    expect(n.presets).toHaveLength(1)
    // To the LEFT of (1,2): a sword dropped there faces up at nothing until it is re-aimed.
    expect(n.presets[0]).toMatchObject({ side: 'enemy', faction: 'skeleton', type: 'melee', col: 0, row: 2, hp: 1 })
    expect(n.playerDeck).toEqual(['melee'])
    expect(n.enemies).toHaveLength(1)
    expect(n.enemies[0]!.ai).toBe('passive')
    expect(n.enemies[0]!.atkMul).toBe(0)
    // ONE move: carry the sword to (1,2) and release on the LEFT of that tile,
    // which is what makes it face the skeleton. No `reaim` — the lesson is the
    // gesture the game leads with, not the correction that backs it up.
    expect(n.ghost).toEqual({ type: 'melee', to: { col: 1, row: 2 }, dir: 'left' })
    expect(n.ghost?.reaim).toBeUndefined()
    expect(n.reward).toMatchObject({ coins: 15, unlockRune: 'archer' })
    // The first board anyone sees is cut from obsidian, whatever the save says:
    // a new player has no material of their own yet, and black glass with a
    // neon cut reads better at a glance than the beige starting pebble.
    expect(n.skin).toBe('obsidian')
  })

  it('pins the opening material to 1-1 alone, and lets the player choose everywhere else', () => {
    for (let id = 2; id <= 40; id++) {
      expect(nodeConfig(id, 'medium').skin, `node ${id}`).toBeUndefined()
    }
  })

  it('only a rune or a skin makes a chest a gift; the coin-only chests of 1-2 and 1-6 are not', () => {
    expect(chestIsGift(nodeConfig(1, 'medium').reward)).toBe(true)
    expect(chestIsGift(nodeConfig(2, 'medium').reward)).toBe(false)
    expect(chestIsGift(nodeConfig(6, 'medium').reward)).toBe(false)
    expect(chestIsGift(nodeConfig(7, 'medium').reward)).toBe(true)
    expect(chestIsGift(null)).toBe(false)
  })

  it('1-2 teaches the bow: your sword in front, a dummy behind a dummy in column 1', () => {
    const n = nodeConfig(2, 'medium')
    expect(n.tutorial).toBe('archer')
    expect(n.objective).toBe('eliminate')
    const cells = n.presets.map((p) => `${p.side}:${p.col},${p.row}`)
    expect(cells).toContain('player:1,2')
    expect(cells).toContain('enemy:1,1')
    expect(cells).toContain('enemy:1,0')
    expect(n.ghost).toEqual({ type: 'archer', to: { col: 1, row: 3 }, dir: 'up' })
    expect(n.playerDeck).toEqual(['melee', 'archer'])
  })

  it('1-3 teaches stacking: a sword dropped onto your sword, against a 5-HP brute on the edge', () => {
    const n = nodeConfig(3, 'medium')
    expect(n.tutorial).toBe('stack')
    expect(n.presets.some((p) => p.hp === 5 && p.side === 'enemy' && p.row === 0)).toBe(true)
    const mine = n.presets.find((p) => p.side === 'player')!
    expect(mine).toMatchObject({ type: 'melee', col: 2, row: 1 })
    expect(n.ghost).toEqual({ type: 'melee', to: { col: 2, row: 1 }, dir: 'up' })
    expect(n.reward.unlockRune).toBe('mage')
  })

  it('1-4 teaches the orb: two dummies on one diagonal from the ghost\'s tile', () => {
    const n = nodeConfig(4, 'medium')
    expect(n).toMatchObject({ tutorial: 'mage', objective: 'eliminate', timer: false })
    expect(n.ghost).toEqual({ type: 'mage', to: { col: 1, row: 2 }, dir: 'ur' })
    expect(n.presets.map((p) => `${p.col},${p.row}`).sort()).toEqual(['2,1', '3,0'])
    expect(n.playerDeck).toEqual(['melee', 'archer', 'mage'])
    expect(n.reward).toMatchObject({ coins: 30, unlockRune: 'defense' })
  })

  it('1-5 teaches the shield: an enemy bow that fires but never places, yours behind the ghost\'s tile', () => {
    const n = nodeConfig(5, 'medium')
    expect(n).toMatchObject({ tutorial: 'defense', objective: 'eliminate', timer: false })
    expect(n.ghost).toEqual({ type: 'defense', to: { col: 1, row: 1 }, dir: 'omni' })
    expect(n.presets).toContainEqual(expect.objectContaining({ side: 'player', type: 'archer', col: 1, row: 2, dir: 'up', hp: 2 }))
    expect(n.presets).toContainEqual(expect.objectContaining({ side: 'enemy', type: 'archer', col: 1, row: 0, dir: 'down', hp: 4 }))
    expect(n.enemies[0]).toMatchObject({ ai: 'passive', atkMul: 1 })
    expect(n.playerDeck).toContain('defense')
    expect(n.reward).toMatchObject({ coins: 35, unlockRune: 'support' })
  })

  it('1-6 teaches the cross: a wounded sword the ghost\'s cross heals, against an orc that hits for one', () => {
    const n = nodeConfig(6, 'medium')
    expect(n).toMatchObject({ tutorial: 'support', objective: 'eliminate', timer: false })
    expect(n.ghost).toEqual({ type: 'support', to: { col: 0, row: 2 }, dir: 'omni' })
    expect(n.presets).toContainEqual(expect.objectContaining({ side: 'player', type: 'melee', col: 1, row: 2, hp: 1, maxHp: 3 }))
    expect(n.presets).toContainEqual(expect.objectContaining({ side: 'enemy', type: 'melee', col: 1, row: 1, hp: 6 }))
    expect(n.enemies[0]).toMatchObject({ ai: 'passive', atkMul: 0.5 })
    expect(n.playerDeck).toContain('support')
    expect(n.reward.coins).toBe(40)
  })

  it('every lesson: a ghost script for a rune in the deck, a passive enemy, no clock, a limit no lesson runs into', () => {
    for (let id = 1; id <= 6; id++) {
      const n = nodeConfig(id, 'hard')
      expect(n.tutorial).not.toBeNull()
      expect(n.ghost).toBeDefined()
      expect(n.playerDeck).toContain(n.ghost!.type)
      expect(n.timer).toBe(false)
      expect(n.turnLimit).toBe(TUTORIAL_TURN_LIMIT)
      expect(n.objective).toBe('eliminate')
      for (const e of n.enemies) expect(e.ai).toBe('passive')
      // The ghost drops onto a tile nobody stands on.
      expect(n.presets.some((p) => p.col === n.ghost!.to.col && p.row === n.ghost!.to.row && !(id === 3))).toBe(false)
      // The ghost's facing is legal for its rune.
      expect(dirsFor(n.ghost!.type)).toContain(n.ghost!.dir)
    }
    // The first four cannot even be scratched.
    for (let id = 1; id <= 4; id++) for (const e of nodeConfig(id, 'hard').enemies) expect(e.atkMul).toBe(0)
  })

  it('unlocks the roster one rune per lesson, in the order the lessons need them', () => {
    expect([1, 2, 3, 4, 5, 6].map((id) => nodeConfig(id, 'medium').reward.unlockRune))
      .toEqual(['archer', null, 'mage', 'defense', 'support', null])
  })

  it('1-7 and 1-8 are the first real fights, with the two chapter skins', () => {
    const duel = nodeConfig(7, 'medium')
    expect(duel).toMatchObject({ mode: '1v1', objective: 'conquest', timer: true, tutorial: null, turnLimit: 10 })
    expect(duel.ghost).toBeUndefined()
    expect(duel.enemies[0]).toMatchObject({ faction: 'goblin', ai: 'easy', atkMul: 1 })
    expect(duel.playerDeck).toBeNull()
    expect(duel.reward).toMatchObject({ coins: 45, unlockSkin: 'obsidian' })
    const siege = nodeConfig(8, 'medium')
    expect(siege).toMatchObject({ mode: 'siege', objective: 'siege', timer: true, tutorial: null, turnLimit: 10 })
    expect(siege.enemies.map((e) => e.post)).toEqual(['north', 'west', 'east'])
    for (const e of siege.enemies) expect(e).toMatchObject({ ai: 'medium', atkMul: 1 })
    expect(siege.reward).toMatchObject({ coins: 100, unlockSkin: 'jade', big: true })
  })
})

describe('later chapters are generated', () => {
  it('alternate duel and siege and escalate the AI per chapter', () => {
    for (let id = 9; id <= 40; id++) {
      // …everywhere the three late lessons have not been carved out of the
      // pattern. Those are authored (see the block below) and deliberately
      // break the duel/siege alternation: a lesson is always a 1v1.
      if (LATE_LESSON_NODES[id]) continue
      const n = nodeConfig(id, 'medium')
      expect(n.mode).toBe(indexInChapter(id) % 2 === 1 ? '1v1' : 'siege')
      expect(n.objective).toBe(n.mode === '1v1' ? 'conquest' : 'siege')
      expect(n.turnLimit).toBe(10)
      expect(n.timer).toBe(true)
      expect(n.tutorial).toBeNull()
      for (const e of n.enemies) {
        expect(e.atkMul).toBe(1)
        expect(e.ai).toBe(n.chapter === 2 ? 'medium' : n.chapter === 3 ? 'hard' : 'brutal')
      }
      if (n.mode === 'siege') {
        expect(n.enemies.map((e) => e.post)).toEqual(['north', 'west', 'east'])
        expect(new Set(n.enemies.map((e) => e.faction)).size).toBe(3)
      }
    }
  })

  it('widens every deck with defense and support from chapter 3', () => {
    // 3-3, not 3-2: the second node of chapter 3 is the mortar LESSON, whose
    // dummies carry an authored deck rather than a widened faction one.
    for (const e of nodeConfig(nodeId(3, 3), 'medium').enemies) {
      expect(e.deck).toContain('defense')
      expect(e.deck).toContain('support')
    }
    // A chapter-2 goblin duel keeps the goblins' own narrow deck (no defense in it).
    const goblinDuel = [1, 3, 5, 7].map((i) => nodeConfig(nodeId(2, i), 'medium'))
      .find((n) => n.enemies[0]!.faction === 'goblin')!
    expect(goblinDuel).toBeDefined()
    expect(goblinDuel.enemies[0]!.deck).not.toContain('defense')
  })

  it('hands out the remaining skins on the 4th and 8th nodes until they run out', () => {
    // Two per chapter from chapter 2 on, in shop order — the three carved and
    // raw ones first, then the gem tier, which is the top of the price ladder
    // as well as the end of this one.
    const slots = [nodeId(2, 4), nodeId(2, 8), nodeId(3, 4), nodeId(3, 8), nodeId(4, 4), nodeId(4, 8)]
    const later = slots.map((id) => nodeConfig(id, 'medium').reward.unlockSkin)
    expect(later).toEqual(['amber', 'marble', 'ember', 'sapphire', 'ruby', 'diamond'])
    expect(nodeConfig(nodeId(5, 4), 'medium').reward.unlockSkin).toBeNull()
    expect(nodeConfig(nodeId(2, 3), 'medium').reward.unlockSkin).toBeNull()
    // Every skin in the roster is reachable through the campaign.
    const fromCampaign = new Set<string>()
    for (let id = 1; id <= 40; id++) {
      const s = nodeConfig(id, 'medium').reward.unlockSkin
      if (s) fromCampaign.add(s)
    }
    for (const s of SKIN_IDS) if (s !== 'river') expect(fromCampaign.has(s)).toBe(true)
  })

  it('hands the five late runes over on 2-1, 2-5, 3-1, 4-1 and 4-5', () => {
    expect(RUNE_UNLOCK_NODES).toEqual({
      [nodeId(2, 1)]: 'cleave', [nodeId(2, 5)]: 'roller', [nodeId(3, 1)]: 'bombard',
      [nodeId(4, 1)]: 'nuker', [nodeId(4, 5)]: 'crown'
    })
    expect(nodeConfig(nodeId(2, 1), 'medium').reward.unlockRune).toBe('cleave')
    expect(nodeConfig(nodeId(2, 5), 'medium').reward.unlockRune).toBe('roller')
    expect(nodeConfig(nodeId(3, 1), 'medium').reward.unlockRune).toBe('bombard')
    expect(nodeConfig(nodeId(4, 1), 'medium').reward.unlockRune).toBe('nuker')
    expect(nodeConfig(nodeId(4, 5), 'medium').reward.unlockRune).toBe('crown')
    // …and nowhere else in the generated chapters.
    for (let id = 9; id <= 60; id++) {
      const rune = nodeConfig(id, 'medium').reward.unlockRune
      expect(rune).toBe(RUNE_UNLOCK_NODES[id] ?? null)
    }
    // A rune makes the chest a gift, so all three get the ceremony.
    for (const id of Object.keys(RUNE_UNLOCK_NODES).map(Number)) {
      expect(chestIsGift(nodeConfig(id, 'medium').reward)).toBe(true)
    }
  })

  it('never puts a rune and a skin in the same chest — a chest hands over one gift', () => {
    for (let id = 1; id <= 60; id++) {
      const { unlockRune, unlockSkin } = nodeConfig(id, 'medium').reward
      expect(unlockRune === null || unlockSkin === null).toBe(true)
    }
  })

  it('the campaign is the whole roster: every rune arrives exactly once', () => {
    const seen: RuneType[] = []
    for (let id = 1; id <= 60; id++) {
      const rune = nodeConfig(id, 'medium').reward.unlockRune
      if (rune) {
        // Exactly once — a rune handed out twice would be a chest that pays nothing.
        expect(seen).not.toContain(rune)
        seen.push(rune)
      }
    }
    // The sword is never a reward: the player starts holding it.
    for (const s of STARTING_RUNES) expect(seen).not.toContain(s)
    expect([...STARTING_RUNES, ...seen].sort()).toEqual([...RUNE_TYPES].sort())
    // The last two, in this order and no other. The nuke is the reward for
    // having a board worth undoing; the crown comes after it because it is the
    // only rune that plays the WIN CONDITION rather than the fight, and a
    // player who has not yet lost a match on tiles held has no idea what they
    // are being given.
    expect(seen.slice(-2)).toEqual(['nuker', 'crown'])
  })

  it('never gives the nuke or the crown to an enemy faction, at any chapter', () => {
    // A nuke in the AI's hand would clear the player's board on a die roll,
    // and no relief in `adaptive.ts` can soften an attack that reads level
    // rather than damage. It stays the player's button.
    //
    // The crown is held back for a different reason: having a stone you built
    // TAKEN and turned on you is the sourest thing this rule set can express,
    // and a player cannot answer it — there is no counter-play, only a rune
    // gone. It reads as a delight in the player's hand and as a cheat in the
    // AI's, so it stays in one of them.
    for (let id = 1; id <= 80; id++) {
      for (const e of nodeConfig(id, 'medium').enemies) {
        expect(e.deck, `node ${id} / ${e.faction}`).not.toContain('nuker')
        expect(e.deck, `node ${id} / ${e.faction}`).not.toContain('crown')
      }
    }
  })

  it('gives each faction one late rune from chapter 4, and not before', () => {
    const deckOf = (chapter: number, faction: string): string[] | null => {
      for (let i = 1; i <= NODES_PER_CHAPTER; i++) {
        const e = nodeConfig(nodeId(chapter, i), 'medium').enemies.find((x) => x.faction === faction)
        if (e) return e.deck
      }
      return null
    }
    for (const [faction, rune] of [['orc', 'cleave'], ['goblin', 'roller'], ['undead', 'bombard']] as const) {
      expect(deckOf(3, faction)).not.toContain(rune)
      expect(deckOf(4, faction)).toContain(rune)
      // One each: no faction picks up somebody else's.
      const four = deckOf(4, faction)!
      for (const other of ['cleave', 'roller', 'bombard'] as const) {
        if (other !== rune) expect(four).not.toContain(other)
      }
      // The chapter-3 widening is untouched.
      expect(four).toContain('defense')
      expect(four).toContain('support')
    }
  })

  it('rewards scale with the chapter and double on the chapter boss', () => {
    expect(nodeConfig(nodeId(2, 1), 'medium').reward.coins).toBe(40)
    expect(nodeConfig(nodeId(2, 8), 'medium').reward).toMatchObject({ coins: 80, big: true })
    expect(nodeConfig(nodeId(5, 3), 'medium').reward.coins).toBe(55)
  })

  it('teaches each late rune on the node right after the chest that gives it', () => {
    // The pairing is the whole point: a rune arrives, and the very next node
    // is a lesson in it. Derived from the two tables so they cannot drift.
    for (const [nodeStr, rune] of Object.entries(LATE_LESSON_NODES)) {
      const id = Number(nodeStr)
      expect(RUNE_UNLOCK_NODES[id - 1], `node ${id - 1}`).toBe(rune)
      expect(nodeConfig(id, 'medium').tutorial, `node ${id}`).toBe(rune)
    }
    expect(Object.keys(LATE_LESSON_NODES).map(Number))
      .toEqual([nodeId(2, 2), nodeId(2, 6), nodeId(3, 2), nodeId(4, 2), nodeId(4, 6)])
  })

  it('gives the late lessons the same contract chapter 1\'s have', () => {
    for (const [nodeStr, rune] of Object.entries(LATE_LESSON_NODES)) {
      const n = nodeConfig(Number(nodeStr), 'hard')
      const where = `node ${nodeStr}`
      expect(n.mode, where).toBe('1v1')
      expect(n.objective, where).toBe('eliminate')
      expect(n.timer, where).toBe(false)
      expect(n.turnLimit, where).toBe(TUTORIAL_TURN_LIMIT)
      expect(n.ghost, where).toBeDefined()
      expect(n.ghost!.type, where).toBe(rune)
      expect(dirsFor(rune), where).toContain(n.ghost!.dir)
      expect(n.playerDeck, where).toContain(rune)
      // Dummies: one faction, never places, cannot hurt — a lesson is unlosable.
      expect(n.enemies, where).toHaveLength(1)
      expect(n.enemies[0], where).toMatchObject({ faction: 'skeleton', ai: 'passive', atkMul: 0 })
      // The ghost drops onto a tile nobody stands on.
      expect(n.presets.some((p) => p.col === n.ghost!.to.col && p.row === n.ghost!.to.row), where).toBe(false)
      // Three enemy dummies each, and each one removable by the ghost's single
      // move — that is what makes one placement clear the node. For the three
      // weapons that means a body no bigger than one hit; for the nuke it
      // means Lv 1, because the blast reads level and ignores health entirely.
      const dummies = n.presets.filter((p) => p.side === 'enemy')
      if (rune === 'crown') {
        // The crown's lesson is the one that does not clear the board by
        // BREAKING it. It takes the stone it faces, and that stone — now the
        // player's, and turned around — kills the one behind it in the same
        // resolution. So there are two dummies rather than three, and neither
        // is measured against the crown's own attack, because it has none.
        expect(dummies, where).toHaveLength(2)
        const taken = dummies.find((d) => d.col === n.ghost!.to.col && d.row === n.ghost!.to.row - 1)
        expect(taken, `${where}: a dummy stands on the tile the crown faces`).toBeDefined()
        expect(crownTurns(1, taken!.level ?? 1), where).toBe(true)
        const behind = dummies.filter((d) => d !== taken)
        expect(behind, where).toHaveLength(1)
        // …and the stolen stone can finish it on the turn it changes hands,
        // which is the half of the rune a one-dummy board would have hidden.
        expect(behind[0]!.hp, where).toBeLessThanOrEqual(statsFor(taken!.type, 1).atk)
        continue
      }
      expect(dummies, where).toHaveLength(3)
      for (const d of dummies) {
        if (rune === 'nuker') expect(nukeVaporises(d.level ?? 1), where).toBe(true)
        else expect(d.hp, where).toBeLessThanOrEqual(statsFor(rune, 1).atk)
      }
    }
  })

  it('4-2 lays the nuke out so one drop shows all three of its rules', () => {
    const n = nodeConfig(nodeId(4, 2), 'medium')
    expect(n.tutorial).toBe('nuker')
    // The nuker is not aimed, so the ghost's facing is the only legal one.
    expect(n.ghost).toEqual({ type: 'nuker', to: { col: 1, row: 3 }, dir: 'omni' })
    expect(n.playerDeck).toEqual(['melee', 'nuker'])

    // 1. It clears the board — and the dummies are scattered so that no OTHER
    //    rune in the game could take all three in one move: no two of them
    //    share a rank, a file, or a diagonal.
    const foes = n.presets.filter((p) => p.side === 'enemy')
    expect(foes).toHaveLength(3)
    for (let i = 0; i < foes.length; i++) {
      for (let j = i + 1; j < foes.length; j++) {
        const a = foes[i]!
        const b = foes[j]!
        expect(a.row, 'two dummies on one rank would fall to a cleave').not.toBe(b.row)
        expect(a.col, 'two dummies in one file would fall to a roller').not.toBe(b.col)
        expect(Math.abs(a.col - b.col), 'two dummies on one diagonal would fall to a mage')
          .not.toBe(Math.abs(a.row - b.row))
      }
    }

    // 2. Hit points do not save anything: the fattest Lv 1 body in the game is
    //    standing there, and it goes with the 2-HP bow beside it.
    expect(foes.some((p) => p.type === 'defense' && p.hp === statsFor('defense', 1).hp)).toBe(true)
    for (const f of foes) expect(nukeVaporises(f.level ?? 1)).toBe(true)

    // 3. It does not spare the player: their Lv 1 sword is vaporised with the
    //    rest, and their Lv 2 sword is the only rune on the board that lives.
    const mine = n.presets.filter((p) => p.side === 'player')
    expect(mine).toHaveLength(2)
    expect(mine.filter((p) => nukeVaporises(p.level ?? 1))).toHaveLength(1)
    const survivor = mine.find((p) => !nukeVaporises(p.level ?? 1))!
    expect(survivor.level).toBe(2)
    expect(statsFor(survivor.type, 2).hp).toBeGreaterThan(NUKE_DAMAGE)
  })

  it('lets a late lesson keep the coins of the fight it replaced, and hands over no gift', () => {
    // A lesson that also opened a chest would put a ceremony between the rune
    // and the move that explains it.
    for (const nodeStr of Object.keys(LATE_LESSON_NODES)) {
      const id = Number(nodeStr)
      const n = nodeConfig(id, 'medium')
      expect(n.reward.coins, `node ${id}`).toBe(30 + 5 * chapterOf(id))
      expect(chestIsGift(n.reward), `node ${id}`).toBe(false)
    }
  })

  it('is deterministic and independent of the difficulty setting', () => {
    for (const id of [1, 5, 9, 17, 33, 128]) {
      const a = JSON.stringify(nodeConfig(id, 'easy'))
      const b = JSON.stringify(nodeConfig(id, 'hard'))
      const c = JSON.stringify(nodeConfig(id, 'easy'))
      expect(a).toBe(b)
      expect(a).toBe(c)
    }
    expect(nodeConfig(9, 'medium').seed).not.toBe(nodeConfig(10, 'medium').seed)
  })
})
