import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { MAX_RUNE_RANK, RANK_PRICES } from '@/game/rules'

/**
 * ─── The rank ladder, mounted ───────────────────────────────────────────────
 *
 * What is under test is the CARD's behaviour — which of the three payment
 * routes it offers, what it refuses to offer, and the marks it puts on them —
 * not the ledger behind it. `useRuneRanks` is therefore mocked with a
 * controllable stand-in (its own arithmetic is covered by
 * `tests/use/runeRanks.test.ts`), exactly as `shop.test.ts` mocks the ads gate.
 *
 * The one invariant this file exists to protect: a rewarded button ALWAYS
 * carries the film mark, and a FREE button never does.
 */

const gate = vi.hoisted(() => ({ granted: true, rewardGated: true, calls: [] as string[] }))
const canOffer = vi.hoisted(() => ({ ref: null as null | { value: boolean } }))

vi.mock('@/use/useAdGate', async () => {
  const { ref } = await import('vue')
  const r = ref(true)
  canOffer.ref = r
  return {
    watchRewarded: vi.fn(async (reason: string) => { gate.calls.push(reason); return gate.granted }),
    claimReward: vi.fn(async (grant: () => void) => { if (gate.granted) grant(); return gate.granted }),
    canOfferReward: r,
    adInFlight: ref(false),
    // `RewardAdIcon` gates ITSELF on this: the film mark is drawn only on a
    // build where a video actually plays. `canOfferReward` is also true on an
    // ad-free build, where the perk is simply granted and a film mark would
    // be a lie — so the two are not interchangeable.
    get isRewardGated () { return gate.rewardGated }
  }
})
vi.mock('@/use/useGameAudio', () => ({ playFx: vi.fn() }))

/**
 * The stand-in ledger every case drives.
 *
 * It is made REACTIVE inside the factory below — a `computed` over a plain
 * object has no dependencies, so it would cache its first read and no card
 * would ever repaint. Cases set these fields before mounting; the mock's own
 * writes (a purchase raising a rank) go through the proxy and repaint.
 *
 * `coins` here is what the LEDGER would allow; the card reads the real wallet
 * through `useEconomy` for its shortfall line. A case sets both to the same
 * number — they are two different consumers, and `fresh()` resets the module
 * registry between cases, so the factory cannot hold the card's wallet.
 */
const ranks = vi.hoisted(() => ({
  table: {} as Record<string, number>,
  coins: 0,
  freeRune: null as string | null,
  freeAvailable: true,
  freeLeftMs: 754_000,
  bought: [] as string[],
  watched: [] as string[],
  claimed: [] as string[]
}))

vi.mock('@/use/useRuneRanks', async () => {
  const { computed, reactive } = await import('vue')
  const rules = await import('@/game/rules')
  const state = reactive(ranks)
  const runeRanks = computed(() =>
    Object.fromEntries(rules.RUNE_TYPES.map((t) => [t, state.table[t] ?? 0])) as Record<string, number>)
  const rankOfRune = (t: string): number => state.table[t] ?? 0
  const isRankMaxed = (t: string): boolean => rankOfRune(t) >= rules.MAX_RUNE_RANK
  const nextRankPrice = (t: string): number | null => rules.rankPrice(rankOfRune(t))
  const api = {
    runeRanks,
    rankOfRune,
    isRankMaxed,
    nextRankPrice,
    rankBonusOf: (t: string) => rules.rankHpBonus(rankOfRune(t)),
    rankTable: () => ({ ...state.table }),
    canAffordRank: (t: string) => {
      const p = nextRankPrice(t)
      return p !== null && state.coins >= p
    },
    freeRankRune: computed(() => state.freeRune),
    freeRankAvailable: computed(() => state.freeAvailable),
    freeRankLeftMs: computed(() => state.freeLeftMs),
    buyRankWithCoins: vi.fn((t: string) => {
      state.bought.push(t)
      state.table[t] = (state.table[t] ?? 0) + 1
      return true
    }),
    buyRankByAd: vi.fn(async (t: string) => { state.watched.push(t); return true }),
    claimFreeRank: vi.fn((t: string) => { state.claimed.push(t); return true }),
    reloadRuneRanks: vi.fn()
  }
  // Cases drive the ledger through THIS proxy, never through the raw object:
  // a raw write is invisible to the computeds above.
  return { ...api, __state: state, default: () => api }
})

/** `ranks.*` ships once fork F's locales land; until then this keeps the file honest. */
const RANKS_EN = {
  tab: 'Ranks',
  title: 'Rune ranks',
  tagline: 'Every rank is +{n} max HP, on every rune. Five ranks each.',
  rank: 'Rank {n}/{max}',
  maxed: 'Maxed',
  hpGain: '+{n} HP',
  next: 'Next: +{n} HP',
  upgrade: 'Upgrade',
  locked: 'Not unlocked yet',
  free: 'Free',
  freeGift: 'Free upgrade!',
  freeIn: 'New gift in {t}',
  freeTaken: 'Come back for the next one',
  nukerUnlock: 'Unlock the Nuker',
  nukerLocked: 'Wins it at Stage 4-1'
}
const SHOP_EN_FALLBACK = { watchAd: 'Watch ad' }

const i18n = () => {
  const bundle = en as Record<string, unknown>
  const shop = (bundle.shop ?? {}) as Record<string, unknown>
  return createI18n({
    legacy: false,
    locale: 'en',
    missingWarn: false,
    fallbackWarn: false,
    messages: {
      en: {
        ...bundle,
        shop: { ...SHOP_EN_FALLBACK, ...shop },
        ranks: (bundle.ranks as Record<string, unknown>) ?? RANKS_EN
      }
    }
  })
}

const FButtonStub = defineComponent({
  props: ['isDisabled', 'type', 'size', 'label'],
  emits: ['click'],
  template: '<button class="fbutton-stub" :disabled="isDisabled" @click="$emit(\'click\')"><slot /></button>'
})
const stubs = {
  FModal: defineComponent({
    props: ['modelValue', 'title', 'tabs', 'activeTab', 'isClosable'],
    emits: ['update:modelValue', 'update:activeTab'],
    template: '<div class="fmodal-stub" :data-active-tab="activeTab"><slot /></div>'
  }),
  FButton: FButtonStub,
  PebblePreview: defineComponent({
    props: ['type', 'skin', 'level', 'label', 'animated'],
    template: '<div class="pebble-stub" :data-type="type" :data-level="level" />'
  }),
  RewardAdIcon: defineComponent({ template: '<i class="ad-icon-stub" />' }),
  IconCoin: defineComponent({ template: '<i class="coin-stub" />' }),
  GameIcon: defineComponent({ props: ['name'], template: '<i class="icon-stub" />' })
}

const FULL_ROSTER = ['melee', 'archer', 'mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker']

const fresh = async (blob: Record<string, unknown> = {}) => {
  vi.resetModules()
  localStorage.clear()
  localStorage.setItem('glyphyx_state', JSON.stringify({ gx_unlocked_runes: FULL_ROSTER, ...blob }))
  gate.calls = []
  gate.granted = true
  const mod = await import('@/use/useRuneRanks') as unknown as { __state: typeof ranks }
  const st = mod.__state
  st.coins = Number(blob.gx_coins ?? 0)
  st.table = {}
  st.freeRune = null
  st.freeAvailable = true
  st.freeLeftMs = 754_000
  st.bought = []
  st.watched = []
  st.claimed = []
  const RuneRankCard = (await import('@/components/organisms/RuneRankCard.vue')).default
  const RankShopPanel = (await import('@/components/organisms/RankShopPanel.vue')).default
  const campaign = await import('@/use/useCampaign')
  return { RuneRankCard, RankShopPanel, campaign, st }
}

const mountCard = (Card: unknown, type: string): VueWrapper =>
  mount(Card as never, { props: { type }, global: { plugins: [i18n()], stubs } })

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null })

beforeEach(() => {
  // The ledger itself is reset inside `fresh()`, through the proxy.
  gate.rewardGated = true
  if (canOffer.ref) canOffer.ref.value = true
})

describe('a rune rank card', () => {
  it('lights one pip per rank and names the rank it is at', async () => {
    const { RuneRankCard, st } = await fresh()
    st.table = { melee: 3 }
    wrapper = mountCard(RuneRankCard, 'melee')
    expect(wrapper.findAll('.rrc__pip')).toHaveLength(MAX_RUNE_RANK)
    expect(wrapper.findAll('.rrc__pip.is-lit')).toHaveLength(3)
    expect(wrapper.find('.rrc__rank').text()).toBe(`Rank 3/${MAX_RUNE_RANK}`)
    // The body it stands up with: a Lv 1 sword is 3, plus one per rank.
    expect(wrapper.find('.rrc__stat-val').text()).toBe('6')
    expect(wrapper.find('.rrc__gain').text()).toBe('+3 HP')
  })

  it('shows the stone in the player\'s skin, and the next rank\'s gain, at rank 0', async () => {
    const { RuneRankCard } = await fresh()
    wrapper = mountCard(RuneRankCard, 'archer')
    expect(wrapper.findAll('.rrc__pip.is-lit')).toHaveLength(0)
    expect(wrapper.find('.pebble-stub').attributes('data-type')).toBe('archer')
    expect(wrapper.find('.pebble-stub').attributes('data-level')).toBe('1')
    expect(wrapper.find('.rrc__next').text()).toBe('Next: +1 HP')
    // Nothing gained yet, so no gain chip at all.
    expect(wrapper.find('.rrc__gain').exists()).toBe(false)
  })

  it('reads as FINISHED at the cap: every pip lit, no buttons, no price', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: 99_999 })
    st.table = { mage: MAX_RUNE_RANK }
    wrapper = mountCard(RuneRankCard, 'mage')
    expect(wrapper.findAll('.rrc__pip.is-lit')).toHaveLength(MAX_RUNE_RANK)
    expect(wrapper.find('.rrc__maxed').text()).toBe('Maxed')
    expect(wrapper.find('.rrc__buy').exists()).toBe(false)
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    expect(wrapper.find('.rrc__next').exists()).toBe(false)
    expect(wrapper.classes()).toContain('is-maxed')
  })

  it('disables the coin button while the wallet is short, and spells out the shortfall', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: RANK_PRICES[0]! - 10 })
    wrapper = mountCard(RuneRankCard, 'melee')
    const buy = wrapper.find('.rrc__buy')
    expect(buy.text()).toContain(String(RANK_PRICES[0]))
    expect((buy.element as HTMLButtonElement).disabled).toBe(true)
    expect(wrapper.find('.rrc__need').text()).toBe('10 more coins')
    await buy.trigger('click')
    expect(st.bought).toEqual([])
  })

  it('…and buys with coins when it is not, lighting the new pip', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: 99_999 })
    wrapper = mountCard(RuneRankCard, 'melee')
    const buy = wrapper.find('.rrc__buy')
    expect((buy.element as HTMLButtonElement).disabled).toBe(false)
    await buy.trigger('click')
    await nextTick()
    expect(st.bought).toEqual(['melee'])
    // The pip lights immediately, and the price moves on to the next rank.
    expect(wrapper.findAll('.rrc__pip.is-lit')).toHaveLength(1)
    expect(wrapper.find('.rrc__buy').text()).toContain(String(RANK_PRICES[1]))
    expect(wrapper.find('.rrc__need').exists()).toBe(false)
  })

  it('offers a video only while the ads layer can play one — and ALWAYS behind the film mark', async () => {
    const { RuneRankCard, st } = await fresh()
    wrapper = mountCard(RuneRankCard, 'defense')
    const ad = wrapper.find('.rrc__ad')
    expect(ad.exists()).toBe(true)
    // The invariant: the mark is inside the button, before its label.
    expect(ad.find('.ad-icon-stub').exists()).toBe(true)
    expect(ad.text()).toContain('Watch ad')
    await ad.trigger('click')
    await Promise.resolve(); await Promise.resolve(); await nextTick()
    expect(st.watched).toEqual(['defense'])

    canOffer.ref!.value = false
    await nextTick()
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    // The coin route survives a build with no ads at all.
    expect(wrapper.find('.rrc__buy').exists()).toBe(true)
  })

  it('draws no film mark on an ad-free build, where the perk is granted without a video', async () => {
    // The rewarded BUTTON still stands (`canOfferReward` is true — the perk is
    // reachable), but nothing plays, so the mark must not be drawn. Rendered
    // with the REAL icon rather than the stub, since that gate lives inside it.
    gate.rewardGated = false
    const { RuneRankCard } = await fresh()
    const realIcon: Record<string, unknown> = { ...stubs }
    delete realIcon.RewardAdIcon
    wrapper = mount(RuneRankCard as never, {
      props: { type: 'defense' },
      global: { plugins: [i18n()], stubs: realIcon }
    })
    await nextTick()
    const ad = wrapper.find('.rrc__ad')
    expect(ad.exists()).toBe(true)
    expect(ad.find('.reward-ad-icon').exists()).toBe(false)
    expect(ad.text()).toContain('Watch ad')
  })

  it('wears the gift ribbon on the window\'s rune, and its FREE button carries no film mark', async () => {
    const { RuneRankCard, st } = await fresh()
    st.freeRune = 'roller'
    st.freeAvailable = true
    st.freeLeftMs = 754_000
    wrapper = mountCard(RuneRankCard, 'roller')
    expect(wrapper.classes()).toContain('is-gift')
    expect(wrapper.find('.rrc__ribbon').text()).toBe('Free upgrade!')
    const free = wrapper.find('.rrc__free')
    expect(free.text()).toContain('Free')
    // Free is free: no price, no video, and therefore no film mark — an ad
    // icon on a button that plays no ad would be a lie.
    expect(free.find('.ad-icon-stub').exists()).toBe(false)
    expect(wrapper.find('.rrc__buy').exists()).toBe(false)
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    // 754 s → 12:34, formatted in the component, never in a locale file.
    expect(wrapper.find('.rrc__timer').text()).toBe('New gift in 12:34')
    await free.trigger('click')
    expect(st.claimed).toEqual(['roller'])
  })

  it('falls back to the paid routes on every OTHER rune, and once the gift is spent', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: 99_999 })
    st.freeRune = 'roller'
    // A rune that is not this window's pick pays as usual.
    wrapper = mountCard(RuneRankCard, 'melee')
    expect(wrapper.find('.rrc__free').exists()).toBe(false)
    expect(wrapper.find('.rrc__buy').exists()).toBe(true)
    wrapper.unmount()

    // …and so does the gift's own rune once the window's gift has been taken.
    st.freeAvailable = false
    wrapper = mountCard(RuneRankCard, 'roller')
    expect(wrapper.find('.rrc__free').exists()).toBe(false)
    expect(wrapper.find('.rrc__ribbon').exists()).toBe(false)
    expect(wrapper.find('.rrc__buy').exists()).toBe(true)
    expect(wrapper.find('.rrc__taken').text()).toBe('Come back for the next one')
  })

  it('greys a rune the player has not unlocked and sells it nothing', async () => {
    const { RuneRankCard } = await fresh({ gx_coins: 99_999, gx_unlocked_runes: ['melee'] })
    wrapper = mountCard(RuneRankCard, 'nuker')
    expect(wrapper.classes()).toContain('is-locked')
    expect(wrapper.find('.rrc__locked').text()).toBe('Not unlocked yet')
    expect(wrapper.find('.rrc__buy').exists()).toBe(false)
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    expect(wrapper.find('.rrc__free').exists()).toBe(false)
  })
})

describe('the ranks panel', () => {
  it('lists the whole roster, locked runes included, under its own heading', async () => {
    const { RankShopPanel } = await fresh()
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.findAll('.rrc')).toHaveLength(FULL_ROSTER.length)
    expect(wrapper.find('.ranks__title').text().length).toBeGreaterThan(0)
    // The tagline belongs to the SHOP's banner, which already prints it for
    // whichever tab is open; the panel repeating it three lines below read as
    // a mistake rather than as emphasis.
    expect(wrapper.find('.ranks__tagline').exists()).toBe(false)
  })

  it('offers the nuker early for a video only while it is locked and a video can play', async () => {
    const { RankShopPanel, campaign } = await fresh({ gx_unlocked_runes: ['melee'] })
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    const card = wrapper.find('.nuker')
    expect(card.exists()).toBe(true)
    expect(card.find('.ad-icon-stub').exists()).toBe(true)
    // Whatever the shipped locale says — this pins that the key renders, not the copy.
    expect(wrapper.find('.nuker__note').text().length).toBeGreaterThan(0)
    expect(wrapper.find('.nuker__title').text().length).toBeGreaterThan(0)

    await wrapper.find('.nuker__ad').trigger('click')
    await Promise.resolve(); await Promise.resolve(); await nextTick()
    expect(gate.calls).toEqual(['nukerUnlock'])
    expect(campaign.unlockedRunes.value).toContain('nuker')
    // Granted: the offer is gone, because the rune is now owned.
    expect(wrapper.find('.nuker').exists()).toBe(false)
  })

  it('grants nothing when the video was not granted', async () => {
    const { RankShopPanel, campaign } = await fresh({ gx_unlocked_runes: ['melee'] })
    gate.granted = false
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    await wrapper.find('.nuker__ad').trigger('click')
    await Promise.resolve(); await Promise.resolve(); await nextTick()
    expect(gate.calls).toEqual(['nukerUnlock'])
    expect(campaign.unlockedRunes.value).not.toContain('nuker')
    expect(wrapper.find('.nuker').exists()).toBe(true)
  })

  it('hides the offer on a build with no video to play, and once the nuker is owned', async () => {
    canOffer.ref!.value = false
    const { RankShopPanel } = await fresh({ gx_unlocked_runes: ['melee'] })
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.find('.nuker').exists()).toBe(false)
    wrapper.unmount()

    canOffer.ref!.value = true
    const owned = await fresh()
    wrapper = mount(owned.RankShopPanel, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.find('.nuker').exists()).toBe(false)
  })
})
