import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import en from '@/i18n/locales/en'

/**
 * ─── The post-match flow, pinned at the source ──────────────────────────────
 *
 * jsdom has no canvas and no layout, so the shape of the two post-match
 * screens is asserted against the source the same way the HUD-string scan is:
 *
 *   • the result screen carries NO stat chips (time / combo / tiles) — the
 *     row was the thing that made the screen a wall the moment a chest opened;
 *   • the chest lives on a screen of its OWN (`ChestOverlay`, built on
 *     `FReward`) and is no longer inside the result overlay;
 *   • the chest button is never `disabled`, because a disabled button swallows
 *     the click that has to reach the overlay to continue;
 *   • a tutorial node hands over right after the chest, with no result screen;
 *   • the rank line is there, keyed, and interpolates both numbers;
 *   • every hint the scene can choose exists in the bundle, in both voices.
 */

const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')
const scene = read('src/views/GameScene.vue')
const chestOverlay = read('src/components/game/ChestOverlay.vue')
const chestReveal = read('src/components/game/ChestReveal.vue')
const rewardStage = read('src/components/game/RewardStage.vue')
const rewardConfetti = read('src/components/game/RewardConfetti.vue')
const freward = read('src/components/atoms/FReward.vue')
const hint = read('src/components/game/ControlHint.vue')

const templateOf = (src: string): string =>
  src.match(/<template lang="pug">([\s\S]*?)<\/template>/)?.[1] ?? ''

/** The source between two anchors, so an assertion reads ONE function. */
const between = (src: string, from: string, to: string): string => {
  const a = src.indexOf(from)
  const b = src.indexOf(to, a + 1)
  expect(a, `anchor "${from}"`).toBeGreaterThanOrEqual(0)
  expect(b, `anchor "${to}"`).toBeGreaterThan(a)
  return src.slice(a, b)
}

describe('the result screen', () => {
  it('has no stat chip row any more', () => {
    expect(scene).not.toMatch(/result__chip/)
    expect(scene).not.toMatch(/matchTime|maxCombo|tilesHeld/)
    const result = (en as { result: Record<string, unknown> }).result
    expect(result).not.toHaveProperty('matchTime')
    expect(result).not.toHaveProperty('maxCombo')
    expect(result).not.toHaveProperty('tilesHeld')
  })

  it('does not hold the chest — the chest has its own overlay', () => {
    const tpl = templateOf(scene)
    expect(tpl).not.toMatch(/ChestReveal\(/)
    expect(tpl).toMatch(/ChestOverlay\(/)
    // The chest overlay is a sibling of the result FReward, not a child of it.
    const chestAt = tpl.indexOf('ChestOverlay(')
    const resultAt = tpl.indexOf('FReward(v-model="showResult"')
    expect(chestAt).toBeGreaterThan(0)
    expect(resultAt).toBeGreaterThan(chestAt)
    expect(chestOverlay).toMatch(/FReward\(/)
    expect(chestOverlay).toMatch(/ChestReveal\(/)
  })

  it('carries the rank BADGE, fed the lifetime best, not a prose line', () => {
    // The pill owns its own three states (see tests/ui/rankBadge.test.ts), so
    // the scene must not gate it or format it: a second gate here is how a
    // screen ends up rendering "#0" or "#100+" that the badge refuses to.
    expect(templateOf(scene)).toMatch(/RankBadge\.result__rank\(:score="bestNode"\)/)
    expect(scene).not.toMatch(/rankLine/)
    // The best node ever cleared, never this match: ranking one run against a
    // board of bests would show a player their rank FALLING after a bad run.
    expect(scene).toMatch(/import RankBadge from '@\/components\/atoms\/RankBadge\.vue'/)
    // …and the prose key it replaced is gone from every locale.
    expect((en as { result: Record<string, unknown> }).result).not.toHaveProperty('rank')
  })

  it('shows the chest only for a gift; coins alone go to the result screen, or straight on for a lesson', () => {
    const body = scene
    expect(body).toMatch(/if \(s\.chest && chestIsGift\(s\.chest\)\) \{\s*showChest\.value = true/)
    expect(body).toMatch(/if \(s\.node\.tutorial && s\.result\.won\) \{[\s\S]*?scheduleHandover\(\)/)
    expect(body).toMatch(/result__chest-coins\(v-if="chestCoinsShown > 0"\)/)
  })

  it('keeps a WIN ad before the first overlay, chest or result', () => {
    // The original rule, unchanged: an ad must never land on a celebration
    // already in progress, so for a win it goes first.
    const body = between(scene, 'const presentResult', 'const openResultOverlay')
    const adAt = body.indexOf('await maybeShowInterstitial(s)')
    const chestAt = body.indexOf('showChest.value = true')
    expect(adAt).toBeGreaterThan(0)
    expect(chestAt).toBeGreaterThan(adAt)
    expect(body).not.toMatch(/showResult\.value = true/)
  })

  it('never shows an interstitial during the tutorial, or in front of a defeat', () => {
    // Both measured on blind testers: an ad at a lesson handover reads as an
    // ad inside the lesson (the handover is silent), and an ad in front of a
    // defeat screen makes the player watch it before learning what happened.
    expect(scene).toMatch(/const adsAllowedAfter = \(s: MatchSummary\): boolean => !isLessonNode\(s\.node\.id\)/)
    const gate = between(scene, 'const maybeShowInterstitial', 'const interstitialOnLeavingResult')
    expect(gate).toMatch(/if \(!adsAllowedAfter\(s\) \|\| !s\.result\.won\) return/)
    // A defeat's ad rides the player's own tap off the screen instead.
    expect(between(scene, 'const onRetry', 'const onSkinsFromResult')).toMatch(/await interstitialOnLeavingResult\(\)/)
    expect(between(scene, 'const onNext', 'const onRetry')).toMatch(/await interstitialOnLeavingResult\(\)/)
  })

  it('leaves the loot on screen: the chest overlay, not the scene, decides when to continue', () => {
    // Opening the chest schedules NOTHING — the loot used to vanish a second
    // later, before the player had read what they won.
    const open = between(scene, 'const onChestOpen', 'const onChestContinue')
    expect(open).not.toMatch(/scheduleAutoAdvance/)
    // The overlay's `continue` (a tap, or its own CHEST_AUTO_CONTINUE_MS clock)
    // is what hands a tutorial node over, with no result screen between.
    const cont = between(scene, 'const onChestContinue', 'const rewardClaimed')
    expect(cont).toMatch(/if \(s\.node\.tutorial && won\.value\) \{\s*onNext\(\)/)
    expect(cont).toMatch(/void openResultOverlay\(\)/)
    expect(chestOverlay).toMatch(/CHEST_AUTO_CONTINUE_MS/)
    // The no-chest replay path of a lesson waits the same eight seconds.
    expect(scene).toMatch(/const AUTO_ADVANCE_MS = CHEST_AUTO_CONTINUE_MS/)
  })

  it('stops the clock and locks the HUD for both screens', () => {
    expect(scene).toMatch(/const overlayUp = computed\(\(\) => showChest\.value \|\| showResult\.value \|\| showGoalIntro\.value\)/)
    expect(scene).toMatch(/if \(!isGamePaused\.value && !overlayUp\.value\)/)
    expect(scene).toMatch(/:locked="overlayUp \|\| adInFlight"/)
    expect(scene).toMatch(/showResult: overlayUp\.value/)
  })
})

describe('the chest', () => {
  it('never disables its button — the tap after opening must reach the overlay', () => {
    expect(templateOf(chestReveal)).not.toMatch(/:disabled=/)
    expect(templateOf(chestReveal)).toMatch(/:aria-disabled="opened"/)
  })

  it('gates the continue tap on the loot having settled', () => {
    expect(chestOverlay).toMatch(/const SETTLE_MS = \d+/)
    expect(chestOverlay).toMatch(/:show-continue="canContinue"/)
  })

  it('stacks the reward as three planes: rays behind, gift, confetti in front', () => {
    const tpl = templateOf(chestOverlay)
    // Both full-bleed planes go in the `#stage` slot. In `fit` mode the default
    // slot is wrapped in a `scale()`, and a transform is a containing block for
    // `position: fixed` — a plane rendered there would be positioned against
    // that wrapper AND scaled with it.
    const stageSlot = between(tpl, 'template(#stage)', 'div.chest-overlay(')
    expect(stageSlot).toMatch(/RewardStage\(/)
    expect(stageSlot).toMatch(/RewardConfetti\(/)

    // DOM order says nothing here — both planes precede the frame — so the
    // layering is carried entirely by z-index, and these are the four numbers
    // that make the effect work.
    // Newline-agnostic on purpose: these files do not agree on line endings,
    // and an anchor that assumes LF silently finds nothing in a CRLF file —
    // which reads as "no z-index declared" rather than as "bad anchor".
    const z = (src: string, selector: string): number => {
      const at = src.search(new RegExp(`\\r?\\n${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r?\\n`))
      expect(at, `selector ${selector}`).toBeGreaterThanOrEqual(0)
      const m = src.slice(at).match(/z-index: (\d+)/)
      expect(m, `${selector} declares a z-index`).toBeTruthy()
      return Number(m![1])
    }
    const rays = z(rewardStage, '.reward-stage')
    const confetti = z(rewardConfetti, '.reward-confetti')
    const frame = z(freward, '.reward-frame')
    expect(rays, 'the rays fall behind the prize').toBeLessThan(frame)
    expect(confetti, 'the confetti falls in front of it').toBeGreaterThan(frame)

    // …and it only works because the stage WRAPPER is not itself a stacking
    // context. Give `.reward-stage` a z-index and the confetti silently drops
    // behind the gift, which is the kind of bug nobody finds by reading.
    const wrapAt = freward.search(/\r?\n\.reward-layers\r?\n/)
    const frameAt = freward.search(/\r?\n\.reward-frame\r?\n/)
    expect(wrapAt, 'FReward declares a .reward-layers wrapper').toBeGreaterThanOrEqual(0)
    expect(frameAt).toBeGreaterThan(wrapAt)
    expect(freward.slice(wrapAt, frameAt)).not.toMatch(/z-index/)
  })

  it('lets a tap fall through both decorative planes — that is what "click to continue" rides on', () => {
    // A plane that eats the tap turns the celebration into a dead screen: the
    // continue handler lives on `FReward`'s overlay, and the click has to
    // reach it through whatever is painted on top.
    for (const [name, src] of [['RewardStage', rewardStage], ['RewardConfetti', rewardConfetti]] as const) {
      expect(src, `${name} must not swallow the tap`).toMatch(/pointer-events: none/)
    }
  })

  it('fires the beats in an order, not all on the frame of the tap', () => {
    // A reveal that lights everything at once reads as a glitch. The chest's
    // own squash owns the first beat; the rays follow, then the confetti.
    const beats = chestOverlay.match(/const BEATS = \{ stage: (\d+), confetti: (\d+) \}/)
    expect(beats, 'the schedule is declared in one place').toBeTruthy()
    const stage = Number(beats![1])
    const confetti = Number(beats![2])
    expect(stage).toBeGreaterThan(0)
    expect(confetti).toBeGreaterThan(stage)
    expect(chestOverlay).toMatch(/setTimeout\(\(\) => \{ stageLit\.value = true \}, BEATS\.stage\)/)
    expect(chestOverlay).toMatch(/setTimeout\(\(\) => \{ confettiFired\.value = true \}, BEATS\.confetti\)/)
    // …and every one of them is cleared with the rest, so a re-opened chest
    // cannot inherit a beat from the last one.
    expect(chestOverlay).toMatch(/for \(const id of beatTimers\) clearTimeout\(id\)/)
  })

  it("tints all three planes with the prize's own colour", () => {
    const tone = between(chestOverlay, 'const tone = computed', 'const stopTimers')
    expect(tone).toMatch(/RUNES\[r\.unlockRune\]\.color/)
    expect(tone).toMatch(/SKINS\[r\.unlockSkin\]\.rim/)
    // Coins have no colour of their own; they keep the game's gold.
    expect(tone).toMatch(/return '#ffd93c'/)
    const tpl = templateOf(chestOverlay)
    expect(tpl).toMatch(/RewardStage\([^)]*:tone="tone"/)
    expect(tpl).toMatch(/RewardConfetti\([^)]*:tone="tone"/)
  })

  it("gives up the chest's SPACE once it is open, not just its brightness", () => {
    // The gift needs the room. A transform-only shrink would dim a box that
    // still occupied a phone's worth of height, which is how this screen
    // ended up needing a scroll.
    // The rule body under a top-level selector, read by line so the anchor
    // cannot collide with the same class name in the template above.
    const ruleBody = (selector: string): string => {
      const lines = chestReveal.split(/\r?\n/)
      const at = lines.findIndex((l) => l === selector)
      expect(at, `selector ${selector}`).toBeGreaterThanOrEqual(0)
      const out: string[] = []
      for (let i = at + 1; i < lines.length && (lines[i] === '' || lines[i]!.startsWith('  ')); i++) out.push(lines[i]!)
      return out.join(' ')
    }
    const maxRem = (block: string): number => {
      const m = block.match(/width: clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/)
      expect(m, 'a width clamp').toBeTruthy()
      return Number(m![1])
    }
    const closed = ruleBody('.chest__btn')
    const open = ruleBody('.is-open .chest__btn')
    expect(maxRem(open)).toBeLessThan(maxRem(closed))
  })

  it('is sized so it never has to scroll, at any viewport the game supports', () => {
    // Every dimension that could push the overlay is viewport-relative, and
    // the flex chain can actually shrink — a flex child without `min-height: 0`
    // refuses to go below its content and grows a scrollbar instead.
    const rule = (src: string, selector: string): string => {
      const lines = src.split(/\r?\n/)
      const at = lines.findIndex((l) => l === selector)
      expect(at, `selector ${selector}`).toBeGreaterThanOrEqual(0)
      const out: string[] = []
      for (let i = at + 1; i < lines.length && (lines[i] === '' || lines[i]!.startsWith('  ')); i++) out.push(lines[i]!)
      return out.join(' ')
    }
    expect(rule(chestReveal, '.chest')).toMatch(/max-height: 100%/)
    expect(rule(chestReveal, '.chest')).toMatch(/min-height: 0/)
    expect(rule(chestReveal, '.chest__prize')).toMatch(/min-height: 0/)
    expect(rule(chestOverlay, '.chest-overlay')).toMatch(/max-height: 100%/)
    // The parts that carry real size are in vmin/vh, never a bare px or a
    // rem that cannot see the window.
    for (const decl of chestReveal.match(/^\s+(?:width|height|font-size): clamp\([^)]*\)/gm) ?? []) {
      expect(decl, `viewport-relative: ${decl.trim()}`).toMatch(/vmin|vh|vw/)
    }
  })

  it('shows its loot through the same stone the field draws', () => {
    expect(read('src/components/game/RuneUnlockCard.vue')).toMatch(/PebblePreview\(/)
    expect(chestReveal).toMatch(/RuneUnlockCard\(v-else-if="reward\.unlockSkin" :skin=/)
  })
})

describe('control hints', () => {
  const ids = ['drag', 'tap', 'aim', 'archer', 'stack', 'mage', 'defense', 'support', 'correct', 'conquest', 'siege',
    'cleave', 'roller', 'bombard'] as const

  it('declares every id the scene can choose', () => {
    for (const id of ids) expect(hint).toMatch(new RegExp(`'${id}'`))
  })

  it('has both voices for every id in the English bundle', () => {
    const hints = en.hints as Record<string, { touch: string; desktop: string }>
    for (const id of ids) {
      expect(hints[id]?.touch, `${id}.touch`).toBeTruthy()
      expect(hints[id]?.desktop, `${id}.desktop`).toBeTruthy()
    }
  })

  it('maps each rune lesson to its own hint and explains the re-aim window a few times', () => {
    for (const beat of ['mage', 'defense', 'support', 'cleave', 'roller', 'bombard']) {
      expect(scene).toMatch(new RegExp(`case '${beat}': return '${beat}'`))
    }
    expect(scene).toMatch(/const CORRECT_HINT_WINDOWS = 3/)
    expect(scene).toMatch(/battle\.lockOpen\.value\) return lockWindowsSeen\.value <= CORRECT_HINT_WINDOWS \? 'correct' : null/)
  })

  it('names the other way in — a selected pebble asks for a tile — and the keys on desktop', () => {
    expect(scene).toMatch(/if \(battle\.selectedHand\.value >= 0\) return 'tap'/)
    // The CORRECTION window is still keys-and-chevrons on both voices: it
    // survives on touch, and on any placement that was never aimed.
    expect(en.hints.correct.desktop).toMatch(/WASD/)
    expect(en.hints.correct.touch).toMatch(/arrow/i)
  })

  it('gives aiming two genuinely different voices now that the tile is a compass', () => {
    // BOTH inputs aim by POSITION now — where inside the tile the pointer or
    // the finger is picks the facing, and the region lights up before it is
    // committed — so neither voice may talk about a stroke or a key. They are
    // still two sentences because the commit differs: the mouse clicks where it
    // stands, the finger lets go where it stands. (Touch used to say "swipe";
    // that gesture is now the FALLBACK, taught by the correction hint.)
    expect(en.hints.aim.desktop).not.toMatch(/WASD/)
    expect(en.hints.aim.desktop).toMatch(/click/i)
    expect(en.hints.aim.touch).not.toMatch(/swipe/i)
    expect(en.hints.aim.touch).toMatch(/let go|release/i)
    expect(en.hints.aim.desktop).not.toBe(en.hints.aim.touch)
  })
})
