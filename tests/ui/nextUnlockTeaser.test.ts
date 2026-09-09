import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent, type Ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { RUNES, type RuneType } from '@/game/rules'

/**
 * ─── The carrot, mounted ────────────────────────────────────────────────────
 *
 * The band that tells a new player the campaign hands out runes at all. What
 * is under test is what the player MEETS — the stage line, the rune's name,
 * the stone it promises, and the whole sentence for a screen reader — not the
 * pixels: jsdom has no canvas, so `PebblePreview` is stubbed the way the shop
 * test stubs it, and the selector it reads is faked so the component can be
 * put in any campaign state.
 */

type Next = null | { nodeId: number; chapter: number; index: number; rune: RuneType }

// `vi.hoisted` runs before the imports at the top of this file, so the ref is
// built inside the mock factory and handed back out through this box.
const campaign = vi.hoisted(() => ({ next: null as null | Ref<Next> }))

vi.mock('@/use/useCampaign', async () => {
  const { ref: r } = await import('vue')
  const next = r<Next>(null)
  campaign.next = next
  return { nextRuneUnlock: next }
})
vi.mock('@/use/useSkins', async () => {
  const { ref: r } = await import('vue')
  return { activeSkin: r('river') }
})

/**
 * The English bundle is used as-is; the two `campaign.nextUnlock*` keys and the
 * three late rune names ship in it once the locale pass lands, and until then
 * these fallbacks keep this file honest about what the component ASKS for —
 * the real strings win the moment they exist (they are spread last).
 */
const enBundle = {
  ...(en as unknown as Record<string, unknown>),
  campaign: {
    nextUnlock: 'Win Stage {c}-{n} for',
    nextUnlockAria: 'Win Stage {c}-{n} to unlock {rune}',
    ...(en as unknown as { campaign: Record<string, unknown> }).campaign
  },
  runes: {
    ...(en as unknown as { runes: Record<string, unknown> }).runes,
    names: {
      cleave: 'Cleaver', roller: 'Boulder', bombard: 'Bombard',
      ...(en as unknown as { runes: { names: Record<string, string> } }).runes.names
    }
  }
}
/** What the bundle above ends up calling each rune — the real name once it ships. */
const runeName = (t: RuneType): string => (enBundle.runes.names as Record<string, string>)[t]!

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', missingWarn: false, fallbackWarn: false, messages: { en: enBundle } })

const stubs = {
  PebblePreview: defineComponent({
    props: ['type', 'skin', 'level', 'animated', 'glyphOnly', 'label'],
    template: '<div class="pebble-stub" :data-type="type" :data-skin="skin" :data-level="level" />'
  })
}

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null })

/**
 * Put the campaign in a state and mount the band on it. The selector is set
 * through the mocked module itself, because the mock factory only runs on the
 * first import of it — reaching for the ref any earlier finds nothing.
 */
const mountTeaser = async (n: Next, props: Record<string, unknown> = {}) => {
  await import('@/use/useCampaign')
  campaign.next!.value = n
  const NextUnlockTeaser = (await import('@/components/game/NextUnlockTeaser.vue')).default
  return mount(NextUnlockTeaser, { props, global: { plugins: [i18n], stubs } })
}

describe('NextUnlockTeaser', () => {
  it('names the stage that pays the next rune, and the rune', async () => {
    wrapper = await mountTeaser({ nodeId: 9, chapter: 2, index: 1, rune: 'cleave' })
    const text = wrapper.text()
    // The user's own phrasing: "Win Stage 2-1 for" → the stone.
    expect(text).toContain(i18n.global.t('campaign.nextUnlock', { c: 2, n: 1 }))
    expect(text).toContain('2-1')
    expect(text).toContain(runeName('cleave'))
  })

  it('shows the stone itself, in the player’s skin, at Lv 1', async () => {
    wrapper = await mountTeaser({ nodeId: 13, chapter: 2, index: 5, rune: 'roller' })
    const stone = wrapper.find('.pebble-stub')
    expect(stone.exists()).toBe(true)
    expect(stone.attributes('data-type')).toBe('roller')
    expect(stone.attributes('data-skin')).toBe('river')
    // Lv 1: what actually lands in the hand, not a hero level nothing pays out.
    expect(stone.attributes('data-level')).toBe('1')
  })

  it('carries the whole sentence as its label — the visible text is a fragment', async () => {
    wrapper = await mountTeaser({ nodeId: 17, chapter: 3, index: 1, rune: 'bombard' })
    const band = wrapper.find('.teaser')
    const label = band.attributes('aria-label') ?? ''
    expect(label).toContain('3-1')
    expect(label).toContain(runeName('bombard'))
    // …and the fragments themselves are hidden, so the reader hears it once.
    expect(wrapper.find('.teaser__text').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.teaser__stone').attributes('aria-hidden')).toBe('true')
  })

  it('is tinted with the rune’s own neon', async () => {
    wrapper = await mountTeaser({ nodeId: 9, chapter: 2, index: 1, rune: 'cleave' })
    expect(wrapper.find('.teaser').attributes('style')).toContain(RUNES.cleave.color)
  })

  it('renders nothing at all once there is no rune left to promise', async () => {
    wrapper = await mountTeaser(null)
    expect(wrapper.find('.teaser').exists()).toBe(false)
    expect(wrapper.find('.pebble-stub').exists()).toBe(false)
  })

  it('shrinks on a short landscape phone rather than pushing the buttons off', async () => {
    wrapper = await mountTeaser({ nodeId: 9, chapter: 2, index: 1, rune: 'cleave' }, { compact: true })
    expect(wrapper.find('.teaser').classes()).toContain('is-compact')
  })
})

describe('where the carrot is mounted', () => {
  const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')

  it('sits on the result screen between the coins and the ×3 — on a loss as much as a win', () => {
    const scene = read('src/views/GameScene.vue')
    expect(scene).toMatch(/import NextUnlockTeaser from '@\/components\/game\/NextUnlockTeaser\.vue'/)
    const teaserAt = scene.indexOf('NextUnlockTeaser.result__teaser')
    const coinsAt = scene.indexOf('.result__coins(ref="rewardCoinRef")')
    const rewardAt = scene.indexOf('FButton.result__reward(')
    expect(coinsAt).toBeGreaterThan(0)
    expect(teaserAt).toBeGreaterThan(coinsAt)
    expect(rewardAt).toBeGreaterThan(teaserAt)
    // It takes the screen's own compact flag, so the landscape phone shrinks it.
    expect(scene).toMatch(/NextUnlockTeaser\.result__teaser\(:compact="resultCompact"\)/)
    // No `won` gate: a defeat is exactly when the goal has to be visible.
    expect(scene).not.toMatch(/NextUnlockTeaser[^\n]*v-if="won"/)
  })

  it('sits on the campaign map under the chapter heading', () => {
    const modal = read('src/components/organisms/CampaignModal.vue')
    expect(modal).toMatch(/import NextUnlockTeaser from '@\/components\/game\/NextUnlockTeaser\.vue'/)
    const headingAt = modal.indexOf("div.map__chapter {{ t('campaign.chapter'")
    const teaserAt = modal.indexOf('NextUnlockTeaser.map__teaser')
    const listAt = modal.indexOf('div.map__list')
    expect(headingAt).toBeGreaterThan(0)
    expect(teaserAt).toBeGreaterThan(headingAt)
    expect(listAt).toBeGreaterThan(teaserAt)
  })
})
