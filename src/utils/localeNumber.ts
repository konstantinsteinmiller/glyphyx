/**
 * ─── Numbers a player READS rather than counts ──────────────────────────────
 *
 * `41032` and `154331` are not numbers anybody reads — they are strings of
 * digits that have to be counted before they mean anything, and a rank is
 * worthless if you have to count it. Grouped, `41,032 of 154,331` states a
 * position at a glance.
 *
 * The separator is not ours to choose: a German player reads `154.331`, a
 * French one `154 331`, an English one `154,331`, and getting it wrong makes
 * the number look like a decimal or like a typo. `Intl.NumberFormat` already
 * knows all 21 of the locales this game ships, so the rule is simply to ask it.
 *
 * ── Latin digits, on purpose ──
 *
 * `Intl.NumberFormat('ar')` returns `١٥٤٬٣٣١` — correct Arabic, and wrong here.
 * Every other number this game paints is Latin: the coins, the score, the
 * streak, the level, the damage numbers on the board. They come out of the
 * canvas painters as raw digits and none of them goes through a formatter, so
 * an Arabic-Indic leaderboard would be the one panel in the game whose digits
 * do not match the HUD two centimetres above it. `numberingSystem: 'latn'`
 * keeps the digits and takes only the grouping, which is the half that was
 * actually asked for. Revisit this if the HUD itself ever localises its digits
 * — then the leaderboard should follow it rather than lead.
 *
 * ── Why the cache ──
 *
 * Building an `Intl.NumberFormat` is expensive next to formatting with one, and
 * the board modal formats a rank per row for a hundred rows on every open. One
 * instance per locale, kept.
 */

/** One formatter per locale, built on first use. */
const formatters = new Map<string, Intl.NumberFormat>()

const formatterFor = (locale: string): Intl.NumberFormat | null => {
  const hit = formatters.get(locale)
  if (hit) return hit
  try {
    // `latn` is a REQUEST, not a guarantee — a runtime that does not have the
    // numbering system falls back to the locale's own, which is still better
    // than no grouping at all.
    const made = new Intl.NumberFormat(locale, { useGrouping: true, numberingSystem: 'latn' })
    formatters.set(locale, made)
    return made
  } catch {
    // An unknown or malformed locale tag throws rather than falling back. A
    // board that renders no number at all would be a worse bug than a board
    // with ungrouped ones, so the caller gets `null` and prints plain digits.
    return null
  }
}

/**
 * A whole number, grouped for `locale` — `154331` → `154,331` / `154.331` /
 * `154 331`.
 *
 * Anything that is not a finite number comes back as an empty string rather
 * than as `NaN`: these numbers sit in a pill on the result screen, and `NaN`
 * there reads as a broken game where a blank simply reads as "not yet".
 */
export const formatCount = (value: number, locale: string): string => {
  if (!Number.isFinite(value)) return ''
  const n = Math.trunc(value)
  const fmt = formatterFor(locale)
  return fmt ? fmt.format(n) : String(n)
}
