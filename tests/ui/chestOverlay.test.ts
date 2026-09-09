import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import { CHEST_AUTO_CONTINUE_MS, type ChestReward } from '@/game/rules'

/**
 * ─── The chest step stays until the player has seen the loot ────────────────
 *
 * The first chest used to vanish about a second after it opened — the player
 * never saw what they had won. Now the overlay continues on ONE of two
 * signals, whichever comes first, and never twice: a tap once the loot has
 * settled, or its own clock after `CHEST_AUTO_CONTINUE_MS`. The clock freezes
 * while the game is paused.
 */

// `vi.mock` is hoisted above the imports, so the switch it reads is hoisted too;
// the rest of the pause module is the real thing.
const gate = vi.hoisted(() => ({ paused: { value: false } }))
vi.mock('@/use/useGamePause', async (orig) => ({
  ...(await orig<typeof import('@/use/useGamePause')>()),
  isGamePaused: gate.paused
}))
const paused = gate.paused

/** `FReward` reduced to its contract: the slot, and a continue button while the hint is up. */
const FRewardStub = defineComponent({
  props: { modelValue: { type: Boolean, default: false }, showContinue: { type: Boolean, default: false } },
  emits: ['continue', 'update:modelValue'],
  setup(props, { emit, slots }) {
    return () => h('div', { class: 'freward' }, [
      slots.ribbon?.(),
      slots.default?.(),
      props.showContinue ? h('button', { class: 'cont', onClick: () => emit('continue') }, 'c') : null
    ])
  }
})
const ChestRevealStub = defineComponent({
  props: { reward: { type: Object, default: null }, opened: { type: Boolean, default: false } },
  setup: () => () => h('div', { class: 'chest-stub' })
})

const reward: ChestReward = { coins: 20, unlockRune: 'archer', unlockSkin: null, big: false }

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })

const mountOverlay = async (): Promise<VueWrapper> => {
  const { default: ChestOverlay } = await import('@/components/game/ChestOverlay.vue')
  return mount(ChestOverlay, {
    props: { modelValue: true, reward, opened: false },
    global: { plugins: [i18n], stubs: { FReward: FRewardStub, ChestReveal: ChestRevealStub } }
  })
}

const continues = (w: VueWrapper): number => (w.emitted('continue') ?? []).length

describe('the chest overlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    paused.value = false
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('continues on a tap once the loot has settled, and only once', async () => {
    const w = await mountOverlay()
    await w.setProps({ opened: true })
    vi.advanceTimersByTime(599)
    await nextTick()
    expect(w.find('.cont').exists()).toBe(false)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(w.find('.cont').exists()).toBe(true)
    await w.find('.cont').trigger('click')
    expect(continues(w)).toBe(1)
    await w.find('.cont').trigger('click')
    expect(continues(w)).toBe(1)
    // The clock does not fire a second `continue` after the tap.
    vi.advanceTimersByTime(CHEST_AUTO_CONTINUE_MS + 500)
    await nextTick()
    expect(continues(w)).toBe(1)
    w.unmount()
  })

  it('continues by itself after CHEST_AUTO_CONTINUE_MS, and only once', async () => {
    const w = await mountOverlay()
    await w.setProps({ opened: true })
    vi.advanceTimersByTime(CHEST_AUTO_CONTINUE_MS - 100)
    await nextTick()
    expect(continues(w)).toBe(0)
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(continues(w)).toBe(1)
    vi.advanceTimersByTime(CHEST_AUTO_CONTINUE_MS)
    await nextTick()
    // Nor does a late tap.
    if (w.find('.cont').exists()) await w.find('.cont').trigger('click')
    expect(continues(w)).toBe(1)
    w.unmount()
  })

  it('does not count while the game is paused', async () => {
    const w = await mountOverlay()
    await w.setProps({ opened: true })
    paused.value = true
    vi.advanceTimersByTime(CHEST_AUTO_CONTINUE_MS * 2)
    await nextTick()
    expect(continues(w)).toBe(0)
    paused.value = false
    vi.advanceTimersByTime(CHEST_AUTO_CONTINUE_MS)
    await nextTick()
    expect(continues(w)).toBe(1)
    w.unmount()
  })

  it('shows the clock as a bar that drains', async () => {
    const w = await mountOverlay()
    await w.setProps({ opened: true })
    expect(w.find('.chest-overlay__auto').exists()).toBe(false)
    vi.advanceTimersByTime(600)
    await nextTick()
    const bar = w.find('.chest-overlay__auto-fill')
    expect(bar.exists()).toBe(true)
    const widthAt = (): number => parseFloat((bar.element as HTMLElement).style.width)
    const early = widthAt()
    expect(early).toBeLessThan(100)
    expect(early).toBeGreaterThan(80)
    vi.advanceTimersByTime(4000)
    await nextTick()
    expect(widthAt()).toBeLessThan(early)
    w.unmount()
  })

  it('does nothing until the chest is actually opened', async () => {
    const w = await mountOverlay()
    vi.advanceTimersByTime(CHEST_AUTO_CONTINUE_MS * 2)
    await nextTick()
    expect(continues(w)).toBe(0)
    expect(w.find('.cont').exists()).toBe(false)
    w.unmount()
  })
})
