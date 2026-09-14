import { describe, expect, it } from 'vitest'
import { LANGUAGES } from '@/utils/enums'
import { formatCount } from '@/utils/localeNumber'

/**
 * ─── Grouping, in all 21 locales the game ships ─────────────────────────────
 *
 * `formatCount` exists because `#41032 of 154331` is two strings of digits
 * rather than a placing. What is pinned here is not the comma — it is that the
 * separator is the PLAYER'S, that the digits stay Latin, and that no locale in
 * `LANGUAGES` makes the formatter throw.
 *
 * The last one is the reason this walks the real list instead of a sample: a
 * locale added to `LANGUAGES` with a tag `Intl` cannot parse would throw on
 * every render of the result screen, in exactly one language, which is the
 * kind of bug that ships.
 */
describe('formatCount', () => {
  it('groups a six-digit number in every shipped locale, and never throws', () => {
    for (const locale of LANGUAGES) {
      const out = formatCount(154331, locale)
      // Something separates the groups: a comma, a dot, or one of the several
      // spaces (U+0020, U+00A0, U+202F) the space-grouping locales use.
      expect(out, `${locale} must group`).toMatch(/^\d{1,3}[.,\s\u00a0\u202f]\d/)
      // Latin digits, in every one of them — see the note in `utils/number.ts`.
      expect(out, `${locale} must stay Latin`).toMatch(/^[\d.,\s\u00a0\u202f]+$/)
    }
  })

  it('uses each locale own convention rather than one house style', () => {
    expect(formatCount(154331, 'en')).toBe('154,331')
    expect(formatCount(154331, 'de')).toBe('154.331')
    // Hindi groups in lakhs — 1,54,331, not 154,331. Proof the formatter is
    // asking a real locale database rather than inserting a comma every three.
    expect(formatCount(154331, 'hi')).toBe('1,54,331')
  })

  it('leaves small numbers alone', () => {
    expect(formatCount(7, 'en')).toBe('7')
    expect(formatCount(999, 'de')).toBe('999')
    expect(formatCount(1000, 'en')).toBe('1,000')
  })

  it('renders nothing rather than NaN for a number that is not one', () => {
    // This lands in a pill on the result screen: a blank reads as "not yet",
    // where `NaN` reads as a broken game.
    expect(formatCount(Number.NaN, 'en')).toBe('')
    expect(formatCount(Number.POSITIVE_INFINITY, 'en')).toBe('')
  })

  it('falls back to plain digits on a locale tag Intl cannot parse', () => {
    // Never throw at a render site: ungrouped digits beat no board at all.
    expect(formatCount(154331, 'not a locale')).toBe('154331')
  })
})
