import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import FReward from '@/components/atoms/FReward.vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * ─── The reward overlay's frame ─────────────────────────────────────────────
 *
 * One component, two contracts, and the whole point of this file is that the
 * second one did not break the first.
 *
 *   • the RESULT screen scrolls. It has a headline, coins, a rank badge, a
 *     rewarded button and two actions, which on a short window is genuinely
 *     more than fits. That is the DEFAULT and it must stay byte-identical.
 *   • the CHEST screen passes `fit`: the prize is scaled to the window instead,
 *     because a reward the player has to scroll to see is one they may miss.
 *
 * jsdom has no layout, so the scale ARITHMETIC is not what is under test here —
 * it is the structure and the behaviour: which mode produces which DOM, and
 * that `continue` still fires on exactly the signals it used to.
 */

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.unstubAllGlobals()
})

const mountReward = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}): VueWrapper =>
  mount(FReward, {
    props: { modelValue: true, showContinue: false, ...props },
    slots: { default: () => h('div', { class: 'prize' }, 'prize'), ...slots },
    global: { plugins: [i18n] }
  })

const continues = (w: VueWrapper): number => (w.emitted('continue') ?? []).length

/** The overlay div. `mount` returns the `<Transition>`, which has no classes. */
const root = (w: VueWrapper) => w.find('.reward-root')

/**
 * Pin whether this looks like a touch device. jsdom answers yes to
 * `'ontouchstart' in window`, so the DESKTOP voice has to be arranged for just
 * as deliberately as the touch one.
 */
const withTouch = (on: boolean, fn: () => void): void => {
  const had = Object.prototype.hasOwnProperty.call(window, 'ontouchstart')
  const desc = Object.getOwnPropertyDescriptor(window, 'ontouchstart')
  const w = window as unknown as Record<string, unknown>
  if (on) w.ontouchstart = null
  else if (had) delete w.ontouchstart
  vi.stubGlobal('navigator', { userAgent: navigator.userAgent, maxTouchPoints: on ? 5 : 0 })
  try {
    fn()
  } finally {
    if (on && !had) delete w.ontouchstart
    if (!on && had && desc) Object.defineProperty(window, 'ontouchstart', desc)
    vi.unstubAllGlobals()
  }
}

/** A keydown on `window`, which is where the shortcut is bound. */
const press = (code: string, target?: EventTarget): void => {
  const e = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true })
  if (target) Object.defineProperty(e, 'target', { value: target })
  window.dispatchEvent(e)
}

describe('the reward frame', () => {
  it('scrolls by default — the result screen has more to say than a short window holds', () => {
    wrapper = mountReward()
    const body = wrapper.find('.reward-body')
    expect(body.exists()).toBe(true)
    expect(body.classes()).not.toContain('is-fit')
    // No scaling wrapper at all: the result screen's DOM is what it always was.
    expect(wrapper.find('.reward-body__fit').exists()).toBe(false)
    expect(wrapper.find('.prize').exists()).toBe(true)
  })

  it('fits instead of scrolling when asked, and still renders the content once', () => {
    wrapper = mountReward({ fit: true })
    const body = wrapper.find('.reward-body')
    expect(body.classes()).toContain('is-fit')
    const fitted = wrapper.find('.reward-body__fit')
    expect(fitted.exists()).toBe(true)
    // The prize is inside the scaled wrapper, and there is exactly one of it —
    // a `v-if`/`v-else` pair that rendered both would double every prize.
    expect(fitted.find('.prize').exists()).toBe(true)
    expect(wrapper.findAll('.prize')).toHaveLength(1)
    // With no layout to measure (jsdom), the scale stands down rather than
    // resolving to `NaN` and blanking the screen.
    expect((fitted.element as HTMLElement).style.transform).toBe('scale(1)')
  })

  it('dresses the backdrop for a celebration only in fit mode', () => {
    // Darkness, and no blur at all any more: a `backdrop-filter` smears the
    // painted art behind it, and the art is what people came for. The rays
    // still need contrast to read as light, so the celebration's ground is the
    // darker of the two.
    wrapper = mountReward()
    expect(root(wrapper).classes()).toContain('bg-black/60')
    wrapper.unmount()

    wrapper = mountReward({ fit: true })
    expect(root(wrapper).classes()).toContain('bg-black/80')
  })

  it('blurs nothing, anywhere', () => {
    for (const fit of [false, true]) {
      wrapper = mountReward({ fit })
      expect(root(wrapper).classes().filter((c) => c.includes('blur'))).toEqual([])
      wrapper.unmount()
    }
    wrapper = null
  })

  it('gives full-bleed layers a home OUTSIDE the body, so nothing scales or clips them', () => {
    // The wrapper is `.reward-layers`, NOT `.reward-stage` — that name belongs
    // to the component the caller puts inside it, and two nested elements of
    // the same name make the DOM ambiguous to read and to query.
    wrapper = mountReward({ fit: true }, { stage: () => h('div', { class: 'rays' }) })
    const stage = wrapper.find('.reward-layers')
    expect(stage.exists()).toBe(true)
    expect(stage.find('.rays').exists()).toBe(true)
    // Not inside the scroll container, and not inside the scaled wrapper —
    // either would make a "full-screen" plane neither full-screen nor still.
    expect(wrapper.find('.reward-body .rays').exists()).toBe(false)
    expect(wrapper.find('.reward-body__fit .rays').exists()).toBe(false)
    // And no empty stage element when the caller has no layers to put in it.
    wrapper.unmount()
    wrapper = mountReward({ fit: true })
    expect(wrapper.find('.reward-layers').exists()).toBe(false)
  })

  it('continues on a click only while the caller says it may', async () => {
    wrapper = mountReward({ showContinue: false })
    await root(wrapper).trigger('click')
    expect(continues(wrapper)).toBe(0)

    await wrapper.setProps({ showContinue: true })
    await root(wrapper).trigger('click')
    expect(continues(wrapper)).toBe(1)
  })

  it('continues on Space and Enter, and never while the hint is down or the overlay is shut', async () => {
    wrapper = mountReward({ showContinue: false })
    press('Space')
    press('Enter')
    expect(continues(wrapper)).toBe(0)

    await wrapper.setProps({ showContinue: true })
    press('Space')
    expect(continues(wrapper)).toBe(1)
    press('Enter')
    expect(continues(wrapper)).toBe(2)
    press('NumpadEnter')
    expect(continues(wrapper)).toBe(3)
    // Any other key is not a continue.
    press('KeyA')
    expect(continues(wrapper)).toBe(3)

    // Closed: the listener comes off, so a stray key cannot advance a screen
    // that is not on the player's screen.
    await wrapper.setProps({ modelValue: false })
    press('Space')
    expect(continues(wrapper)).toBe(3)
  })

  it('ignores the keyboard while the player is typing', async () => {
    wrapper = mountReward({ showContinue: true })
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT']) {
      press('Space', document.createElement(tag))
    }
    const editable = document.createElement('div')
    editable.contentEditable = 'true'
    Object.defineProperty(editable, 'isContentEditable', { value: true })
    press('Enter', editable)
    expect(continues(wrapper)).toBe(0)

    // …and still fires from anywhere else.
    press('Space', document.createElement('div'))
    expect(continues(wrapper)).toBe(1)
    await nextTick()
  })

  it('asks in the voice of the device it is on', () => {
    withTouch(false, () => {
      wrapper = mountReward({ showContinue: true })
      expect(wrapper.find('.continue-hint').text()).toBe(en.clickToContinue)
      wrapper.unmount()
      wrapper = null
    })
    withTouch(true, () => {
      wrapper = mountReward({ showContinue: true })
      expect(wrapper.find('.continue-hint').text()).toBe(en.tapToContinue)
    })
  })

  it('shows the hint only while the caller says it may', async () => {
    wrapper = mountReward({ showContinue: false })
    expect(wrapper.find('.continue-hint').exists()).toBe(false)
    await wrapper.setProps({ showContinue: true })
    expect(wrapper.find('.continue-hint').exists()).toBe(true)
  })
})

/**
 * ─── The prize is never cut off ─────────────────────────────────────────────
 *
 * jsdom has no layout, so this is a SOURCE scan — and the bug it guards is
 * precisely the one a layout-free check missed the first time round.
 *
 * `fit` mode scales the prize down to the window, and the scale is written by
 * `measureFit` AFTER the loot has been laid out. For the frame between the card
 * mounting and the ResizeObserver answering, the content sits at scale 1 and is
 * taller than its box. While that box clipped, the overflow came off the
 * bottom: measured on the shipped build at 294px of box holding 332px of card,
 * cutting 26px off the rune's description — the single line that says what the
 * rune DOES, at the one moment a player is reading it. Two blind testers hit it
 * on every unlock they saw; one zoomed in to check it was not his screen
 * (2026-09-12).
 *
 * The first fix clamped the description to two lines and was verified with
 * `scrollHeight > clientHeight` on the description itself — which cannot see an
 * ANCESTOR clipping it, so it passed while the bug was still there. Hence a
 * test against the rule that actually did the clipping.
 */
describe("the fitted body's overflow", () => {
  const source = readFileSync(resolve(__dirname, '../../src/components/atoms/FReward.vue'), 'utf8')
  /** The `&.is-fit` block inside `.reward-body`, up to the next top-level rule. */
  const fitBlock = (): string => {
    const at = source.indexOf('  &.is-fit')
    expect(at).toBeGreaterThan(-1)
    const rest = source.slice(at + 10)
    const end = rest.search(/\n[.&@]/)
    return rest.slice(0, end === -1 ? undefined : end)
  }

  it('does not clip the content it is about to make room for', () => {
    expect(fitBlock()).not.toMatch(/overflow:\s*hidden/)
  })

  it('still centres what it is fitting', () => {
    expect(fitBlock()).toMatch(/justify-content:\s*center/)
  })

  it('keeps the scrolling body for the screens that need it', () => {
    // The result screen is the DEFAULT mode and genuinely has more to say than
    // a short window holds. Only `fit` gave up its clip.
    expect(source).toMatch(/overflow-y:\s*auto/)
  })
})
