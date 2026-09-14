import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import de from '@/i18n/locales/de'
import ar from '@/i18n/locales/ar'
import RankBadge from '@/components/atoms/RankBadge.vue'

/**
 * ─── The one piece of the leaderboard most players ever see ─────────────────
 *
 * Three states, and only one of them is a number. What is pinned here is the
 * two that are NOT: an in-flight request holds the slot with `…` so the result
 * screen does not jump when the rank lands a beat later, and everything else
 * renders NOTHING — no empty plaque, no "Loading…" forever on a player with no
 * connection, and above all no `#100+`.
 *
 * `#100+` is the one this test exists for. It is not a placing, it is the game
 * admitting it did not look, shown to exactly the players who most need a
 * number — and it comes back the moment somebody "helpfully" renders the
 * `OUTSIDE_BOARD` sentinel instead of hiding on it.
 */

const board = vi.hoisted(() => ({
  enabled: true,
  failed: false,
  total: 2345,
  rank: 1130
}))

// Plain getters, not `computed`: a module-level computed over a non-reactive
// object caches its first read and every later case then asserts against the
// first case's board.
vi.mock('@/use/useLeaderboard', () => ({
  OUTSIDE_BOARD: -1,
  get leaderboardEnabled() { return board.enabled },
  leaderboardFailed: { get value() { return board.failed } },
  playerTotal: { get value() { return board.total } },
  rankFor: () => board.rank
}))

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })

const badge = (score = 12, compact = false) =>
  mount(RankBadge, { props: { score, compact }, global: { plugins: [i18n] } })

describe('the rank badge', () => {
  it('states the placing and the population, both grouped to read', () => {
    Object.assign(board, { enabled: true, failed: false, total: 2345, rank: 1130 })
    const w = badge()
    // Grouped, not raw: `#41032 of 154331` is two strings of digits that have
    // to be counted before they mean anything, and a rank you have to count is
    // not a rank. English groups on commas.
    expect(w.text()).toContain('#1,130')
    expect(w.text()).toContain('2,345')
    // The population is what makes the placing mean anything; a bare "#1130"
    // says nothing at all.
    expect(w.find('.rank-badge__of').exists()).toBe(true)
    expect(w.attributes('aria-label')).toContain('#1,130')
  })

  it('holds the slot with an ellipsis while the request is still out', () => {
    Object.assign(board, { enabled: true, failed: false, total: 0, rank: 0 })
    const w = badge()
    expect(w.text()).toContain('…')
    // …and says nothing about a population it does not have yet.
    expect(w.find('.rank-badge__of').exists()).toBe(false)
  })

  it('disappears once the fetch has actually failed', () => {
    Object.assign(board, { enabled: true, failed: true, total: 0, rank: 0 })
    expect(badge().find('.rank-badge').exists()).toBe(false)
  })

  it('never renders the "past the cut" sentinel', () => {
    Object.assign(board, { enabled: true, failed: false, total: 2345, rank: -1 })
    const w = badge()
    expect(w.find('.rank-badge').exists()).toBe(false)
    expect(w.text()).not.toContain('+')
    expect(w.text()).not.toContain('100')
  })

  it('renders nothing at all on a build with no leaderboard', () => {
    Object.assign(board, { enabled: false, failed: false, total: 2345, rank: 1130 })
    expect(badge().find('.rank-badge').exists()).toBe(false)
  })

  it('drops the population tail when compact, and keeps the placing', () => {
    Object.assign(board, { enabled: true, failed: false, total: 2345, rank: 7 })
    const w = badge(12, true)
    expect(w.text()).toContain('#7')
    expect(w.find('.rank-badge__of').exists()).toBe(false)
  })
})

/**
 * ─── The separator belongs to the player, not to us ─────────────────────────
 *
 * A German player reads `154.331` and a French one `154 331`; hard-coding the
 * English comma makes the population look like a decimal in half of the 21
 * locales this game ships.
 */
describe('the badge groups its numbers for the active locale', () => {
  const inLocale = (locale: string, messages: Record<string, unknown>) => {
    const i = createI18n({ legacy: false, locale, messages: { [locale]: messages } })
    return mount(RankBadge, { props: { score: 12, compact: false }, global: { plugins: [i] } })
  }

  it('uses the separator the locale itself uses, not the English one', () => {
    Object.assign(board, { enabled: true, failed: false, total: 154331, rank: 41032 })
    expect(inLocale('en', en).text()).toContain('#41,032')
    // German groups on dots — a comma there reads as a decimal point.
    expect(inLocale('de', de).text()).toContain('#41.032')
  })

  it('keeps LATIN digits in Arabic, because every other number in the game is', () => {
    Object.assign(board, { enabled: true, failed: false, total: 154331, rank: 41032 })
    const text = inLocale('ar', ar).text()
    // `Intl.NumberFormat('ar')` would give ٤١٬٠٣٢ — correct Arabic, and the one
    // panel in the game whose digits do not match the HUD above it. The coins,
    // the score and the damage numbers are all painted as raw Latin digits.
    expect(text).toContain('41')
    expect(text).not.toMatch(/[٠-٩]/)
  })

  it('re-groups when the player switches language', async () => {
    Object.assign(board, { enabled: true, failed: false, total: 154331, rank: 41032 })
    const i = createI18n({ legacy: false, locale: 'en', messages: { en, de } })
    const w = mount(RankBadge, { props: { score: 12 }, global: { plugins: [i] } })
    expect(w.text()).toContain('#41,032')
    // The formatter reads `locale` during render, so a language change is a
    // re-render and the separators follow it.
    i.global.locale.value = 'de'
    await w.vm.$nextTick()
    expect(w.text()).toContain('#41.032')
  })
})
