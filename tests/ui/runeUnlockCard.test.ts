import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { RUNES, SKINS } from '@/game/rules'

/**
 * ─── The prize, mounted ─────────────────────────────────────────────────────
 *
 * What the chest hands over. Under test is what the player MEETS — the stone,
 * whose stone it is, the name, the one line that explains it — and the two
 * promises the reward overlay depends on: that the card is BOUNDED in height
 * and that the datasheet it used to carry is gone. jsdom has no canvas, so
 * `PebblePreview` is stubbed the way the other UI suites stub it.
 */

vi.mock('@/use/useSkins', async () => {
  const { ref } = await import('vue')
  return { activeSkin: ref('jade') }
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: en as unknown as Record<string, unknown> }
})

const stubs = {
  PebblePreview: defineComponent({
    // `animated` is typed, not listed: the card passes it as a bare attribute,
    // which reaches an untyped prop as `""` and would make the assertion below
    // pass on nothing.
    props: {
      type: String,
      skin: String,
      level: Number,
      animated: { type: Boolean, default: false },
      glyphOnly: { type: Boolean, default: false },
      label: String
    },
    template: '<div class="pebble-stub" :data-type="type" :data-skin="skin" :data-level="level" :data-animated="String(animated)" />'
  })
}

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null })

const mountCard = async (props: Record<string, unknown>) => {
  const RuneUnlockCard = (await import('@/components/game/RuneUnlockCard.vue')).default
  return mount(RuneUnlockCard, { props, global: { plugins: [i18n], stubs } })
}

const t = (key: string): string => i18n.global.t(key)
/** The component's own source — for the claims layout cannot make in jsdom. */
const source = (): string =>
  readFileSync(resolve(__dirname, '../../src/components/game/RuneUnlockCard.vue'), 'utf8')

describe('a rune prize', () => {
  it('names the rune and explains it, over the stone in the player’s own skin', async () => {
    wrapper = await mountCard({ rune: 'cleave' })
    const text = wrapper.text()
    expect(text).toContain(t('runes.names.cleave'))
    expect(text).toContain(t('runes.descriptions.cleave'))
    // The banner word, so the moment reads as a gift rather than a summary.
    expect(text).toContain(t('banner.unlocked'))

    const stone = wrapper.find('.pebble-stub')
    expect(stone.attributes('data-type')).toBe('cleave')
    // The player's CURRENT material — the prize is the stone they will actually
    // place, not a stock one.
    expect(stone.attributes('data-skin')).toBe('jade')
    // Lv 1: what lands in the hand next turn.
    expect(stone.attributes('data-level')).toBe('1')
  })

  it('breathes: it is one hero stone, which is what `animated` is for', async () => {
    wrapper = await mountCard({ rune: 'roller' })
    expect(wrapper.find('.pebble-stub').attributes('data-animated')).toBe('true')
  })

  it('stands on a lit plinth and wears its own neon', async () => {
    wrapper = await mountCard({ rune: 'bombard' })
    // A pedestal and a gloss, not a bordered information box.
    expect(wrapper.find('.unlock__plinth').exists()).toBe(true)
    expect(wrapper.find('.unlock__pool').exists()).toBe(true)
    expect(wrapper.find('.unlock__sheen').exists()).toBe(true)
    expect(wrapper.find('.unlock').attributes('style')).toContain(RUNES.bombard.color)
  })
})

describe('a skin prize', () => {
  it('names the material and its blurb, and shows the sword cut from it', async () => {
    wrapper = await mountCard({ skin: 'ember' })
    const text = wrapper.text()
    expect(text).toContain(t('skins.names.ember'))
    expect(text).toContain(t('skins.blurbs.ember'))
    expect(text).toContain(t('result.newSkin'))

    const stone = wrapper.find('.pebble-stub')
    expect(stone.attributes('data-skin')).toBe('ember')
    // The sword at Lv 2 — a material has to be shown at its most carved.
    expect(stone.attributes('data-type')).toBe('melee')
    expect(stone.attributes('data-level')).toBe('2')
    expect(wrapper.find('.unlock').classes()).toContain('is-skin')
  })

  it('takes its light from the material’s rim, not from a rune', async () => {
    wrapper = await mountCard({ skin: 'obsidian' })
    expect(wrapper.find('.unlock').attributes('style')).toContain(SKINS.obsidian.rim)
  })

  it('a rune wins when both are handed over — the contract the chest relies on', async () => {
    wrapper = await mountCard({ rune: 'mage', skin: 'amber' })
    expect(wrapper.text()).toContain(t('runes.names.mage'))
    expect(wrapper.text()).not.toContain(t('skins.blurbs.amber'))
    expect(wrapper.find('.unlock').classes()).not.toContain('is-skin')
  })
})

describe('it is a trophy, not a datasheet', () => {
  it('no longer carries HP / ATK chips at all', async () => {
    wrapper = await mountCard({ rune: 'melee' })
    expect(wrapper.find('.unlock__stats').exists()).toBe(false)
    expect(wrapper.find('.unlock__stat').exists()).toBe(false)
    // …and not merely hidden: the words are not in the card either. A player
    // meeting a rune is not comparing numbers; the tooltip and the shop teach
    // stats where they are used.
    expect(wrapper.text()).not.toContain(t('runes.hp'))
    expect(wrapper.text()).not.toContain(t('runes.atk'))
  })

  it('declares a bounded height instead of growing with its content', () => {
    // jsdom does no layout, so the promise is checked where it is made. The
    // reward overlay must not scroll at 320×658 or on a 844×390 landscape
    // phone, and this cap is what makes that the card's problem and not the
    // overlay's.
    const css = source()
    expect(css).toMatch(/--unlock-max-h:\s*min\(/)
    expect(css).toMatch(/max-height:\s*var\(--unlock-max-h\)/)
    // Sized on the SHORT axis, which is the one that runs out in either
    // orientation.
    expect(css).toMatch(/vmin/)
    // …and the landscape phone brings the cap down again rather than inheriting
    // a portrait number that does not fit a 375 px window.
    expect(css).toMatch(/@media \(orientation: landscape\) and \(max-height: 30rem\)[\s\S]*--unlock-max-h/)
  })

  it('clamps the description so a long translation cannot grow the card', () => {
    const css = source()
    expect(css).toMatch(/-webkit-line-clamp:\s*2/)
    expect(css).toMatch(/max-height:\s*2\.6em/)
  })

  it('drops every flourish for a player who asked for less motion', () => {
    const css = source()
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toContain('.unlock__sheen')
    expect(reduced).toMatch(/animation: none/)
  })
})
