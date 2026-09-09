import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import EnemyBadge, { ROOMY_MIN_HEIGHT, ROOMY_MIN_WIDTH, isRoomyViewport } from '@/components/game/EnemyBadge.vue'
import { windowHeight, windowWidth } from '@/use/useUser'
import { nodeConfig } from '@/game/campaign'

/**
 * ─── The commander grows into a roomy desktop corner ────────────────────────
 *
 * Only there: a phone, a landscape phone or a short embed keeps the compact
 * badge exactly as it was, so nothing pushes into the board where the board
 * has no room to give.
 */

// `vi.mock` is hoisted above every import, so the flag it reads has to be too.
const ua = vi.hoisted(() => ({ mobile: false }))
vi.mock('@/utils/function', async (orig) => ({
  ...(await orig<typeof import('@/utils/function')>()),
  mobileCheck: () => ua.mobile
}))

describe('the roomy tier', () => {
  it('is a wide AND tall non-mobile viewport', () => {
    expect(isRoomyViewport(1440, 900, false)).toBe(true)
    expect(isRoomyViewport(ROOMY_MIN_WIDTH, ROOMY_MIN_HEIGHT, false)).toBe(true)
    expect(isRoomyViewport(ROOMY_MIN_WIDTH - 1, 900, false)).toBe(false)
    expect(isRoomyViewport(1440, ROOMY_MIN_HEIGHT - 1, false)).toBe(false)
    expect(isRoomyViewport(844, 390, false)).toBe(false)
    // A tablet in landscape that sniffs as mobile keeps the compact badge.
    expect(isRoomyViewport(1440, 900, true)).toBe(false)
  })

  it('is applied as a class on the badge, live with the viewport', async () => {
    const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })
    const enemies = nodeConfig(7, 'medium').enemies
    windowWidth.value = 1440
    windowHeight.value = 900
    ua.mobile = false
    const w = mount(EnemyBadge, {
      props: { enemies, turn: 1, turnLimit: 10, suddenDeath: false },
      global: { plugins: [i18n] }
    })
    expect(w.find('.enemy').classes()).toContain('is-roomy')
    windowHeight.value = 600
    await nextTick()
    expect(w.find('.enemy').classes()).not.toContain('is-roomy')
    windowHeight.value = 900
    ua.mobile = true
    await w.setProps({ turn: 2 })
    await nextTick()
    // `mobileCheck` is read when the tier is computed; a mobile UA never grows.
    expect(w.find('.enemy').classes()).not.toContain('is-roomy')
    w.unmount()
  })
})
