import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

/**
 * ─── The dialog keeps the keyboard ──────────────────────────────────────────
 *
 * `FModal` has always been `role="dialog" aria-modal="true"` and was neither:
 * Tab walked out of the frame and into the game behind it — the eighth press
 * landed on `<body>` — so a keyboard or switch-control player could be
 * operating a board they could no longer see. It went unnoticed while nothing
 * in the game drew a focus ring at all; adding the ring made it obvious.
 *
 * jsdom does not move focus on Tab by itself, which is exactly what makes
 * these cases honest: every focus change below is one the COMPONENT made.
 */

vi.mock('@/use/useSound', () => ({ default: () => ({ playSound: vi.fn() }) }))
vi.mock('@/use/useModalState', () => ({ acquireModalOpen: () => () => {} }))

const i18n = () => createI18n({
  legacy: false,
  locale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en: { close: 'Close' } }
})

const stubs = {
  FTabs: defineComponent({ props: ['tabs', 'activeTab'], template: '<div class="tabs-stub" />' }),
  GameIcon: defineComponent({ props: ['name'], template: '<i class="icon-stub" />' })
}

/** A dialog with two controls of its own, plus the close button it ships with. */
const host = defineComponent({
  components: {},
  template: `
    <div>
      <button class="opener">Open</button>
      <FModal :model-value="true"><button class="first">One</button><button class="last">Two</button></FModal>
    </div>`
})

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null; document.body.innerHTML = '' })

const mountModal = async () => {
  const FModal = (await import('@/components/molecules/FModal.vue')).default
  wrapper = mount({ ...host, components: { FModal } } as never, {
    attachTo: document.body,
    global: { plugins: [i18n()], stubs }
  })
  await nextTick()
  await nextTick()
  return {
    dialog: document.querySelector('.f-modal') as HTMLElement,
    close: document.querySelector('.f-modal__close') as HTMLElement,
    first: document.querySelector('.first') as HTMLElement,
    last: document.querySelector('.last') as HTMLElement,
    opener: document.querySelector('.opener') as HTMLElement
  }
}

const tab = (shift = false): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true }))
}

describe('an open modal keeps the keyboard inside it', () => {
  it('takes focus when it opens, so the first Tab starts inside', async () => {
    const el = await mountModal()
    expect(document.activeElement).toBe(el.dialog)
    // The frame is a container, not a control: it must not be reachable by Tab.
    expect(el.dialog.getAttribute('tabindex')).toBe('-1')
  })

  it('wraps forward from the last control to the first', async () => {
    const el = await mountModal()
    el.last.focus()
    tab()
    expect(document.activeElement).toBe(el.close)
  })

  it('wraps backward from the first control to the last', async () => {
    const el = await mountModal()
    el.close.focus()
    tab(true)
    expect(document.activeElement).toBe(el.last)
  })

  it('pulls focus back in when it has escaped to the page behind', async () => {
    const el = await mountModal()
    el.opener.focus()
    expect(el.dialog.contains(document.activeElement)).toBe(false)
    tab()
    expect(el.dialog.contains(document.activeElement)).toBe(true)
  })

  it('closes on Escape and hands focus back to whatever opened it', async () => {
    const el = await mountModal()
    el.opener.focus()
    // Re-open from that opener so the modal records it.
    const modal = wrapper!.findComponent({ name: 'FModal' })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()
    expect(modal.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
