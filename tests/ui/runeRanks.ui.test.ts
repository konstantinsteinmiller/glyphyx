import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { MAX_RUNE_RANK, RANK_PRICES, RUNE_UNLOCK_PRICE } from '@/game/rules'

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
/** "A real provider can play a video" as a REF, so the gate below re-reads it. */
const videoPlays = vi.hoisted(() => ({ ref: null as null | { value: boolean } }))

vi.mock('@/use/useAdGate', async () => {
  const { computed, ref } = await import('vue')
  const r = ref(true)
  canOffer.ref = r
  const v = ref(gate.rewardGated)
  videoPlays.ref = v
  return {
    watchRewarded: vi.fn(async (reason: string) => { gate.calls.push(reason); return gate.granted }),
    claimReward: vi.fn(async (grant: () => void) => { if (gate.granted) grant(); return gate.granted }),
    canOfferReward: r,
    // As the real gate defines it: a video is offered beside a coin price only
    // where a real provider can play one AND the slot is ready.
    canOfferVideo: computed(() => v.value && r.value),
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
  nukerLocked: 'Or win it at Level 4-1',
  mystery: '???',
  mysteryHint: 'Keep winning to find out',
  mysteryAria: 'A rune you have not unlocked yet',
  nextUp: 'Next up',
  winsAt: 'Win it at Level {c}-{n}'
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
        // Merged, not chosen: the shipped strings win wherever they exist, and
        // the fallback fills any key the locales have not landed yet — so a
        // half-finished bundle cannot make these cases pass on an empty string.
        ranks: { ...RANKS_EN, ...((bundle.ranks as Record<string, unknown>) ?? {}) }
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

const FULL_ROSTER =
  ['melee', 'archer', 'mage', 'defense', 'support', 'cleave', 'roller', 'bombard', 'nuker', 'crown']

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
  const MysteryRuneCard = (await import('@/components/organisms/MysteryRuneCard.vue')).default
  const RankShopPanel = (await import('@/components/organisms/RankShopPanel.vue')).default
  const campaign = await import('@/use/useCampaign')
  return { RuneRankCard, MysteryRuneCard, RankShopPanel, campaign, st }
}

const mountCard = (Card: unknown, type: string): VueWrapper =>
  mount(Card as never, { props: { type }, global: { plugins: [i18n()], stubs } })

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null })

beforeEach(() => {
  // The ledger itself is reset inside `fresh()`, through the proxy.
  gate.rewardGated = true
  if (canOffer.ref) canOffer.ref.value = true
  if (videoPlays.ref) videoPlays.ref.value = true
})

describe('a rune rank card', () => {
  it('lights one star per rank, and prints no number beside them', async () => {
    const { RuneRankCard, st } = await fresh()
    st.table = { melee: 3 }
    wrapper = mountCard(RuneRankCard, 'melee')
    expect(wrapper.findAll('.rrc__star')).toHaveLength(MAX_RUNE_RANK)
    expect(wrapper.findAll('.rrc__star.is-lit')).toHaveLength(3)
    // The count is a SHAPE, not a sentence: nothing on the card says "3/5",
    // and no hit-point arithmetic appears either. The number still reaches a
    // screen reader through the meter's label.
    expect(wrapper.find('.rrc__stars').attributes('aria-label')).toBe(`Rank 3/${MAX_RUNE_RANK}`)
    expect(wrapper.text()).not.toContain(`3/${MAX_RUNE_RANK}`)
    expect(wrapper.text()).not.toMatch(/HP/i)
  })

  it("shows the stone in the player's skin and five dark stars at rank 0", async () => {
    const { RuneRankCard } = await fresh()
    wrapper = mountCard(RuneRankCard, 'archer')
    expect(wrapper.findAll('.rrc__star')).toHaveLength(MAX_RUNE_RANK)
    expect(wrapper.findAll('.rrc__star.is-lit')).toHaveLength(0)
    expect(wrapper.find('.pebble-stub').attributes('data-type')).toBe('archer')
    expect(wrapper.find('.pebble-stub').attributes('data-level')).toBe('1')
    // Four lines and no more: stone, name, stars, price.
    expect(wrapper.find('.rrc__next').exists()).toBe(false)
    expect(wrapper.find('.rrc__gain').exists()).toBe(false)
    expect(wrapper.find('.rrc__stats').exists()).toBe(false)
  })

  it('reads as FINISHED at the cap: every star lit, no buttons, no price', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: 99_999 })
    st.table = { mage: MAX_RUNE_RANK }
    wrapper = mountCard(RuneRankCard, 'mage')
    expect(wrapper.findAll('.rrc__star.is-lit')).toHaveLength(MAX_RUNE_RANK)
    expect(wrapper.find('.rrc__maxed').text()).toBe('Maxed')
    expect(wrapper.find('.rrc__buy').exists()).toBe(false)
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    expect(wrapper.classes()).toContain('is-maxed')
  })

  it('disables the coin button while the wallet is short, and says how short', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: RANK_PRICES[0]! - 10 })
    wrapper = mountCard(RuneRankCard, 'melee')
    const buy = wrapper.find('.rrc__buy')
    expect(buy.text()).toContain(String(RANK_PRICES[0]))
    expect((buy.element as HTMLButtonElement).disabled).toBe(true)
    // The gap to the next rank, printed the way the power-rune and skin cards
    // print it. The ladder went without it for a while and was the one tab
    // that made the player do the subtraction — while the next rank costs 70
    // on one card and 560 on another, that number is this card's own.
    const need = wrapper.find('.rrc__need')
    expect(need.exists()).toBe(true)
    expect(need.text()).toContain('10')
    // …and it belongs to the COIN button, not to the row: under the row it
    // would sit beneath the video half too, which a blind tester read as what
    // the video would pay out.
    expect(wrapper.find('.rrc__buycol .rrc__need').exists()).toBe(true)
    await buy.trigger('click')
    expect(st.bought).toEqual([])
  })

  it('…and buys with coins when it is not, lighting the new star', async () => {
    const { RuneRankCard, st } = await fresh({ gx_coins: 99_999 })
    wrapper = mountCard(RuneRankCard, 'melee')
    const buy = wrapper.find('.rrc__buy')
    expect((buy.element as HTMLButtonElement).disabled).toBe(false)
    await buy.trigger('click')
    await nextTick()
    expect(st.bought).toEqual(['melee'])
    // The star lights immediately, and the price moves on to the next rank.
    expect(wrapper.findAll('.rrc__star.is-lit')).toHaveLength(1)
    expect(wrapper.find('.rrc__stars').attributes('aria-label')).toBe(`Rank 1/${MAX_RUNE_RANK}`)
    expect(wrapper.find('.rrc__buy').text()).toContain(String(RANK_PRICES[1]))
  })

  it('offers a video only while the ads layer can play one — and ALWAYS behind the film mark', async () => {
    const { RuneRankCard, st } = await fresh()
    wrapper = mountCard(RuneRankCard, 'defense')
    const ad = wrapper.find('.rrc__ad')
    expect(ad.exists()).toBe(true)
    // The row lays itself out as a two-half switch (flush halves, the price
    // sized to the card) only while it holds one.
    expect(wrapper.find('.rrc__switch').classes()).toContain('has-video')
    // The invariant: the mark is inside the button, before its label.
    expect(ad.find('.ad-icon-stub').exists()).toBe(true)
    // ICON ONLY: the caption would overflow the card in a longer language,
    // so the sentence lives on the label and the film frame does the talking.
    expect(ad.text()).not.toContain('Watch ad')
    // The label names BOTH halves of the switch — what it does, and what it
    // costs — because neither is written on the button.
    expect(ad.attributes('aria-label')).toContain('Watch ad')
    expect(ad.attributes('aria-label')).toContain('Upgrade')
    await ad.trigger('click')
    await Promise.resolve(); await Promise.resolve(); await nextTick()
    expect(st.watched).toEqual(['defense'])

    canOffer.ref!.value = false
    await nextTick()
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    // The coin route survives a build with no ads at all.
    expect(wrapper.find('.rrc__buy').exists()).toBe(true)
    expect(wrapper.find('.rrc__switch').classes()).not.toContain('has-video')
  })

  it('offers no video half on an ad-free build — the coin price, coin first, is the whole control', async () => {
    // Local dev, the CrazyGames pre-release build: `canOfferReward` is still
    // true there (it would grant the perk for nothing), but no video can play,
    // so the film mark would not be drawn and the half used to stand there
    // holding a lone arrow. The coin route carries the card instead.
    gate.rewardGated = false
    const { RuneRankCard } = await fresh()
    videoPlays.ref!.value = false
    wrapper = mountCard(RuneRankCard, 'defense')
    await nextTick()
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    const buy = wrapper.find('.rrc__buy')
    expect(buy.exists()).toBe(true)
    expect(buy.text()).toContain(String(RANK_PRICES[0]))
    // "🪙 70", not "70 🪙": the coin names the currency before the number.
    const coin = buy.find('.coin-stub').element
    const price = buy.find('.rrc__price').element
    expect(coin.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // …and it is laid out as a whole control, not as the left half of a switch.
    expect(wrapper.find('.rrc__switch').classes()).not.toContain('has-video')
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
    // The countdown is the PANEL's, not the card's — one gift, one clock.
    expect(wrapper.find('.rrc__timer').exists()).toBe(false)
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
    expect(wrapper.find('.rrc__taken').exists()).toBe(false)
  })

  it('shows a rune the player does not own as a named SILHOUETTE, and sells it nothing', async () => {
    // A save one node into the game: the sword is owned, so the campaign's
    // next hand-over is the bow at 1-1.
    const { RuneRankCard } = await fresh({ gx_coins: 99_999, gx_unlocked_runes: ['melee'] })
    wrapper = mountCard(RuneRankCard, 'archer')
    expect(wrapper.classes()).toContain('is-promise')
    expect(wrapper.classes()).toContain('is-next')
    // Named, and drawn from the REAL stone under a filter — never a second shape.
    expect(wrapper.find('.rrc__name').text().length).toBeGreaterThan(0)
    expect(wrapper.find('.rrc__stone').classes()).toContain('is-silhouette')
    expect(wrapper.find('.pebble-stub').attributes('data-type')).toBe('archer')
    // The ribbon says which one is coming; the line under it says where.
    expect(wrapper.find('.rrc__ribbon').text().length).toBeGreaterThan(0)
    const winsAt = wrapper.find('.rrc__winsat')
    expect(winsAt.exists()).toBe(true)
    expect(winsAt.text()).toMatch(/1/)
    // Nothing to buy: a rank cannot be bought for a rune that is not owned.
    expect(wrapper.find('.rrc__buy').exists()).toBe(false)
    expect(wrapper.find('.rrc__ad').exists()).toBe(false)
    expect(wrapper.find('.rrc__free').exists()).toBe(false)
    // …and no ladder either: pips for a rune you do not have are noise.
    expect(wrapper.find('.rrc__stars').exists()).toBe(false)
    expect(wrapper.find('.rrc__stat').exists()).toBe(false)
  })

  it('names the LATE runes by their own unlock stage once the tab reveals one', async () => {
    // The nuker is not the campaign's next hand-over here, but the tab sells it
    // (see the panel), so its card must still know where it is won: 4-1.
    const { RuneRankCard } = await fresh({ gx_unlocked_runes: ['melee'] })
    wrapper = mountCard(RuneRankCard, 'nuker')
    expect(wrapper.classes()).toContain('is-promise')
    // Not the campaign's NEXT, so no "next up" ribbon — but still placed.
    expect(wrapper.classes()).not.toContain('is-next')
    expect(wrapper.find('.rrc__ribbon').exists()).toBe(false)
    const winsAt = wrapper.find('.rrc__winsat')
    expect(winsAt.exists()).toBe(true)
    expect(winsAt.text()).toMatch(/4/)
  })
})

describe('a mystery rune card', () => {
  it('says nothing about the rune it is standing in for', async () => {
    const { MysteryRuneCard } = await fresh()
    wrapper = mount(MysteryRuneCard as never, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.find('.mrc__name').text()).toBe('???')
    expect(wrapper.find('.mrc__hint').text().length).toBeGreaterThan(0)
    expect(wrapper.find('.mrc__mark').text()).toBe('?')
    // No stone, and therefore no silhouette to read an identity off.
    expect(wrapper.find('.pebble-stub').exists()).toBe(false)
    // The whole sentence for a screen reader; the parts are hidden from it.
    expect(wrapper.attributes('aria-label')!.length).toBeGreaterThan(0)
    expect(wrapper.find('.mrc__stage').attributes('aria-hidden')).toBe('true')
  })

  it('is inert: nothing to press, nothing to focus', async () => {
    const { MysteryRuneCard } = await fresh()
    wrapper = mount(MysteryRuneCard as never, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.findAll('.fbutton-stub')).toHaveLength(0)
  })

  it('answers a press with a shake, without becoming something that can be opened', async () => {
    // Inert is right; SILENT is not. A six-year-old in the shop audit pressed
    // these over and over, got nothing back at all, and read the game as
    // broken. The shake says "heard you, not this one" and promises nothing.
    const { MysteryRuneCard } = await fresh()
    wrapper = mount(MysteryRuneCard as never, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.classes()).not.toContain('is-nudging')
    await wrapper.trigger('pointerdown')
    expect(wrapper.classes()).toContain('is-nudging')
    // …and it is still not a control.
    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })
})

describe('the ranks panel', () => {
  it('lists the whole roster, locked runes included, and names the tab nowhere', async () => {
    const { RankShopPanel } = await fresh()
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.findAll('.rrc')).toHaveLength(FULL_ROSTER.length)
    // Neither the tagline NOR a title of its own. The shop's banner prints the
    // tagline for whichever tab is open and the tab pill already says RANKS,
    // so a heading here was the third "you are here" in a dozen lines — this
    // tab was the only one that repeated itself at all.
    expect(wrapper.find('.ranks__title').exists()).toBe(false)
    expect(wrapper.find('.ranks__tagline').exists()).toBe(false)
  })

  it('names only what the player can act on, and hides the rest behind question marks', async () => {
    // One rune owned, so: the sword's card, the bow as the campaign's next
    // hand-over, and every other rung a mystery.
    const { RankShopPanel } = await fresh({ gx_unlocked_runes: ['melee'] })
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    const named = wrapper.findAll('.rrc').map((c) => c.attributes('data-type'))
    expect(named).toContain('melee')
    expect(named).toContain('archer')
    // The runes two or more unlocks away give nothing away — not even a colour.
    for (const hidden of ['mage', 'defense', 'support', 'cleave', 'roller', 'bombard']) {
      expect(named, `${hidden} must stay a mystery`).not.toContain(hidden)
    }
    expect(wrapper.findAll('.mrc').length).toBeGreaterThan(0)
  })

  it('keeps ONE rung per rune whatever is hidden — a ladder, not a hole', async () => {
    // The count is the point: the player can see how much roster is left even
    // when they cannot see what it is.
    for (const roster of [['melee'], ['melee', 'archer', 'mage'], FULL_ROSTER]) {
      const { RankShopPanel } = await fresh({ gx_unlocked_runes: roster })
      const w = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
      expect(w.findAll('.rrc').length + w.findAll('.mrc').length, `roster of ${roster.length}`)
        .toBe(FULL_ROSTER.length)
      w.unmount()
    }
  })

  it('reveals the nuker\'s own rung while the tab is selling it', async () => {
    // A banner naming the Nuker directly under a card hiding it would be the
    // screen contradicting itself, so the offer reveals its rung too.
    const { RankShopPanel } = await fresh({ gx_unlocked_runes: ['melee'] })
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.find('.nuker').exists()).toBe(true)
    expect(wrapper.find('.rrc[data-type="nuker"]').exists()).toBe(true)
    wrapper.unmount()

    // With no video to play there is no offer — and the rung goes back to being
    // a mystery like every other rune that far away.
    canOffer.ref!.value = false
    const quiet = await fresh({ gx_unlocked_runes: ['melee'] })
    wrapper = mount(quiet.RankShopPanel, { global: { plugins: [i18n()], stubs } })
    expect(wrapper.find('.nuker').exists()).toBe(false)
    expect(wrapper.find('.rrc[data-type="nuker"]').exists()).toBe(false)
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

  it('sells the nuker for COINS where no video can play — never for free', async () => {
    // The leak this closes: `canOfferReward` is true on an ad-free build (it
    // would grant a perk that has no coin price), so this offer used to hand a
    // campaign-gated rune over for one button press on local dev, itch, plain
    // web, or any portal whose ad SDK failed to load.
    gate.rewardGated = false
    const { RankShopPanel, campaign } = await fresh({ gx_unlocked_runes: ['melee'], gx_coins: 10_000 })
    videoPlays.ref!.value = false
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    const card = wrapper.find('.nuker')
    expect(card.exists()).toBe(true)
    expect(card.find('.nuker__ad').exists()).toBe(false)
    expect(card.find('.ad-icon-stub').exists()).toBe(false)
    const buy = card.find('.nuker__buy')
    expect(buy.exists()).toBe(true)
    expect(buy.text()).toContain(String(RUNE_UNLOCK_PRICE))
    expect(buy.find('.coin-stub').exists()).toBe(true)

    await buy.trigger('click')
    await nextTick()
    expect(campaign.unlockedRunes.value).toContain('nuker')
    expect(gate.calls).toEqual([])
  })

  it('disables that price when the wallet is short, and says how short', async () => {
    gate.rewardGated = false
    const { RankShopPanel, campaign } = await fresh({ gx_unlocked_runes: ['melee'], gx_coins: 10 })
    videoPlays.ref!.value = false
    wrapper = mount(RankShopPanel, { global: { plugins: [i18n()], stubs } })
    const buy = wrapper.find('.nuker__buy')
    expect((buy.element as HTMLButtonElement).disabled).toBe(true)
    expect(wrapper.find('.nuker__need').text()).toContain(String(RUNE_UNLOCK_PRICE - 10))
    await buy.trigger('click')
    await nextTick()
    expect(campaign.unlockedRunes.value).not.toContain('nuker')
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
