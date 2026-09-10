import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { SKIN_IDS } from '@/game/rules'

/**
 * ─── The shop, the goal rail and the goal intro, mounted ────────────────────
 *
 * jsdom has no canvas, no ResizeObserver and no audio, so the stone painter,
 * the modal frame and the cues are stubbed; what is under test is the
 * behaviour the player meets — which buttons exist, when they are disabled,
 * what a tap does — not the pixels.
 *
 * The English bundle is used as-is; the `shop.*` keys ship in it once the
 * coordinator merges the shop's strings (see `shop-i18n.json`), and until
 * then the inline fallback below keeps this file honest about what the
 * components ask for.
 */

const gate = vi.hoisted(() => ({
  granted: true,
  calls: [] as string[]
}))
const canOffer = vi.hoisted(() => ({ ref: null as null | { value: boolean } }))

vi.mock('@/use/useAdGate', async () => {
  const { ref } = await import('vue')
  const r = ref(true)
  canOffer.ref = r
  return {
    watchRewarded: vi.fn(async (reason: string) => { gate.calls.push(reason); return gate.granted }),
    claimReward: vi.fn(async (grant: () => void) => { if (gate.granted) grant(); return gate.granted }),
    canOfferReward: r,
    adInFlight: ref(false)
  }
})
vi.mock('@/use/useGameAudio', () => ({ playFx: vi.fn() }))

const SHOP_EN = {
  title: 'Shop',
  tabs: { runes: 'Power Runes', skins: 'Skins' },
  runesTagline: 'Your first placement of each armed rune lands at Lv {n}.',
  landsAt: 'Lands at Lv {n} on your first placement next match.',
  armed: 'Armed ×{n}',
  watchAd: 'Watch ad',
  boosts: { melee: 'm', archer: 'a', mage: 'g', defense: 'd', support: 's', cleave: 'c', roller: 'r', bombard: 'b', nuker: 'n' }
}

const i18n = () => createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: { ...(en as Record<string, unknown>), shop: (en as Record<string, unknown>).shop ?? SHOP_EN } }
})

/** The modal frame, reduced to its slot and its props. */
const FModalStub = defineComponent({
  props: ['modelValue', 'title', 'tabs', 'activeTab', 'isClosable'],
  emits: ['update:modelValue', 'update:activeTab'],
  template: '<div class="fmodal-stub" :data-active-tab="activeTab"><slot /></div>'
})
const FButtonStub = defineComponent({
  props: ['isDisabled', 'type', 'size', 'label'],
  emits: ['click'],
  template: '<button class="fbutton-stub" :disabled="isDisabled" @click="$emit(\'click\')"><slot /></button>'
})
const stubs = {
  FModal: FModalStub,
  FButton: FButtonStub,
  PebblePreview: defineComponent({ props: ['type', 'skin', 'level', 'label', 'animated'], template: '<div class="pebble-stub" :data-type="type" :data-level="level" />' }),
  ArtIcon: defineComponent({ props: ['kind', 'id', 'fallback'], template: '<i class="art-stub" />' }),
  RewardAdIcon: defineComponent({ template: '<i class="ad-icon-stub" />' }),
  IconCoin: defineComponent({ template: '<i class="coin-stub" />' }),
  GameIcon: defineComponent({ props: ['name'], template: '<i class="icon-stub" />' })
}

/**
 * The shop only lists runes the player has unlocked, so every case that is
 * about the CARDS rather than the roster starts from a full roster. A case
 * about the gate itself passes its own `gx_unlocked_runes` and overrides this.
 */
const FULL_ROSTER =
  ['melee', 'archer', 'mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker', 'crown']

const fresh = async (blob: Record<string, unknown> = {}) => {
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify({ gx_unlocked_runes: FULL_ROSTER, ...blob }))
  gate.calls = []
  gate.granted = true
  const ShopModal = (await import('@/components/organisms/ShopModal.vue')).default
  const economy = (await import('@/use/useEconomy')).default()
  const power = await import('@/use/usePowerRunes')
  return { ShopModal, economy, power }
}

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null })

describe('the shop', () => {
  beforeEach(() => { if (canOffer.ref) canOffer.ref.value = true })

  it('opens on the power runes with all three tabs, a card per unlocked rune and the wallet', async () => {
    const { ShopModal } = await fresh({ gx_coins: 42 })
    wrapper = mount(ShopModal, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
    const frame = wrapper.findComponent(FModalStub)
    expect(frame.props('tabs').map((t: { value: string }) => t.value)).toEqual(['runes', 'ranks', 'skins'])
    expect(frame.props('activeTab')).toBe('runes')
    expect(wrapper.findAll('.prc')).toHaveLength(FULL_ROSTER.length)
    expect(wrapper.findAll('.pebble-stub[data-level="3"]')).toHaveLength(FULL_ROSTER.length)
    expect(wrapper.find('.shop__wallet-value').text()).toBe('42')
  })

  it('never sells a power rune for a rune the player has not unlocked', async () => {
    // A power rune arms the first placement of its type: bought for a rune
    // that is not in the deck yet, it is coins spent on nothing.
    const { ShopModal } = await fresh({ gx_coins: 999, gx_unlocked_runes: ['melee', 'archer'] })
    wrapper = mount(ShopModal, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
    expect(wrapper.findAll('.prc')).toHaveLength(2)
    expect(wrapper.find('.prc[data-type="melee"]').exists()).toBe(true)
    expect(wrapper.find('.prc[data-type="archer"]').exists()).toBe(true)
    for (const locked of ['mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker']) {
      expect(wrapper.find(`.prc[data-type="${locked}"]`).exists()).toBe(false)
    }
  })

  it('disables the coin button when the wallet is short and buys when it is not', async () => {
    const { ShopModal, economy, power } = await fresh({ gx_coins: 100 })
    wrapper = mount(ShopModal, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
    const card = wrapper.find('.prc[data-type="melee"]')
    const buy = card.find('.prc__buy')
    expect((buy.element as HTMLButtonElement).disabled).toBe(true)
    expect(card.find('.prc__need').exists()).toBe(true)

    economy.addCoins(100)
    await nextTick()
    expect((buy.element as HTMLButtonElement).disabled).toBe(false)
    await buy.trigger('click')
    await nextTick()
    expect(economy.coins.value).toBe(200 - power.POWER_RUNE_PRICE)
    expect(power.powerRuneCount('melee')).toBe(1)
    expect(card.find('.prc__armed').text()).toContain('1')
  })

  it('offers a video only while the ads layer can play one, and arms a rune when it was watched', async () => {
    const { ShopModal, power } = await fresh()
    wrapper = mount(ShopModal, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
    const card = wrapper.find('.prc[data-type="mage"]')
    expect(card.find('.prc__ad').exists()).toBe(true)
    await card.find('.prc__ad').trigger('click')
    await Promise.resolve(); await Promise.resolve(); await nextTick()
    expect(gate.calls).toEqual(['powerRune'])
    expect(power.powerRuneCount('mage')).toBe(1)

    canOffer.ref!.value = false
    await nextTick()
    expect(wrapper.findAll('.prc__ad')).toHaveLength(0)
  })

  it('switches to the rank ladder, which lists the whole roster', async () => {
    // The third tab, and the one the coin economy drains into: every rune is
    // listed, unlocked or not, because the ladder is also a map of the roster.
    const { ShopModal } = await fresh({ gx_coins: 500 })
    wrapper = mount(ShopModal, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
    const frame = wrapper.findComponent(FModalStub)
    frame.vm.$emit('update:activeTab', 'ranks')
    await nextTick()
    expect(frame.props('activeTab')).toBe('ranks')
    expect(wrapper.findAll('.rrc')).toHaveLength(FULL_ROSTER.length)
    // The power-rune grid is gone while the ranks are up.
    expect(wrapper.findAll('.prc')).toHaveLength(0)
  })

  it('switches to the materials, which can also be unlocked by a video', async () => {
    const { ShopModal } = await fresh()
    wrapper = mount(ShopModal, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
    const frame = wrapper.findComponent(FModalStub)
    frame.vm.$emit('update:activeTab', 'skins')
    await nextTick()
    expect(frame.props('activeTab')).toBe('skins')
    expect(wrapper.findAll('.card')).toHaveLength(SKIN_IDS.length)
    // The hero opens on the worn skin (owned): equip state, no ad button.
    expect(wrapper.find('.hero__ad').exists()).toBe(false)
    // Select an unowned one: coins or a video.
    await wrapper.find('.card[aria-label="Obsidian"]').trigger('click')
    await nextTick()
    expect(wrapper.find('.hero__ad').exists()).toBe(true)
    await wrapper.find('.hero__ad').trigger('click')
    await Promise.resolve(); await Promise.resolve(); await nextTick()
    expect(gate.calls).toEqual(['skin'])
    const skins = await import('@/use/useSkins')
    expect(skins.isSkinOwned('obsidian')).toBe(true)
    expect(skins.activeSkin.value).toBe('obsidian')
  })

  it('opens straight onto the tab it was asked for', async () => {
    const { ShopModal } = await fresh()
    wrapper = mount(ShopModal, { props: { modelValue: true, initialTab: 'skins' }, global: { plugins: [i18n()], stubs } })
    expect(wrapper.findComponent(FModalStub).props('activeTab')).toBe('skins')
    expect(wrapper.findAll('.prc')).toHaveLength(0)
  })
})

describe('the conquest rail', () => {
  it('shows the crown on the win line with the goal beside it, and says the rule on a tap', async () => {
    vi.resetModules()
    const ConquestBar = (await import('@/components/game/ConquestBar.vue')).default
    wrapper = mount(ConquestBar, { props: { player: 3, enemy: 2 }, global: { plugins: [i18n()], stubs } })
    expect(wrapper.find('.conquest__goal-num').text()).toBe('8')
    expect(wrapper.find('.conquest__crown .art-stub').exists()).toBe(true)
    expect(wrapper.find('.conquest__label').text()).toBe('3 / 8')
    expect(wrapper.find('.conquest__tip').exists()).toBe(false)
    await wrapper.find('.conquest').trigger('click')
    await nextTick()
    expect(wrapper.find('.conquest__tip').text()).toBe(en.hints.conquest.desktop)
  })

  it('pulses when a count changes', async () => {
    vi.useFakeTimers()
    try {
      vi.resetModules()
      const ConquestBar = (await import('@/components/game/ConquestBar.vue')).default
      wrapper = mount(ConquestBar, { props: { player: 3, enemy: 2 }, global: { plugins: [i18n()], stubs } })
      await wrapper.setProps({ player: 4 })
      await nextTick()
      vi.advanceTimersByTime(1)
      await nextTick()
      expect(wrapper.find('.conquest').classes()).toContain('is-pulse')
      vi.advanceTimersByTime(600)
      await nextTick()
      expect(wrapper.find('.conquest').classes()).not.toContain('is-pulse')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('the goal intro', () => {
  it('lights eight tiles, crowns them, then lets go exactly once', async () => {
    vi.useFakeTimers()
    try {
      vi.resetModules()
      const GoalIntro = (await import('@/components/game/GoalIntro.vue')).default
      wrapper = mount(GoalIntro, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
      expect(wrapper.findAll('.goal__cell')).toHaveLength(16)
      expect(wrapper.findAll('.goal__cell.is-lit')).toHaveLength(0)
      vi.advanceTimersByTime(230 * 3)
      await nextTick()
      expect(wrapper.findAll('.goal__cell.is-lit')).toHaveLength(3)
      expect(wrapper.find('.goal__count-num').text()).toBe('3 / 8')
      vi.advanceTimersByTime(230 * 5 + 250)
      await nextTick()
      expect(wrapper.findAll('.goal__cell.is-lit')).toHaveLength(8)
      expect(wrapper.find('.goal__card').classes()).toContain('is-crowned')
      expect(wrapper.emitted('done')).toBeUndefined()
      vi.advanceTimersByTime(900)
      await nextTick()
      expect(wrapper.emitted('done')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
      // Nothing fires twice, however long it sits.
      vi.advanceTimersByTime(5000)
      expect(wrapper.emitted('done')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('a tap skips it', async () => {
    vi.useFakeTimers()
    try {
      vi.resetModules()
      const GoalIntro = (await import('@/components/game/GoalIntro.vue')).default
      wrapper = mount(GoalIntro, { props: { modelValue: true }, global: { plugins: [i18n()], stubs } })
      await wrapper.find('.goal').trigger('click')
      expect(wrapper.emitted('done')).toHaveLength(1)
      vi.advanceTimersByTime(10_000)
      expect(wrapper.emitted('done')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
