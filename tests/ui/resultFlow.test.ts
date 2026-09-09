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

  it('keeps the ad before the first overlay, chest or result', () => {
    const body = between(scene, 'const presentResult', 'const openResultOverlay')
    const adAt = body.indexOf('await maybeShowInterstitial()')
    const chestAt = body.indexOf('showChest.value = true')
    expect(adAt).toBeGreaterThan(0)
    expect(chestAt).toBeGreaterThan(adAt)
    expect(body).not.toMatch(/showResult\.value = true/)
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
    expect(en.hints.aim.desktop).toMatch(/WASD/)
    expect(en.hints.correct.desktop).toMatch(/WASD/)
    expect(en.hints.correct.touch).toMatch(/arrow/i)
  })
})
