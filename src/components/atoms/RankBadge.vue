<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GameIcon from '@/components/icons/GameIcon.vue'
import { OUTSIDE_BOARD, leaderboardEnabled, leaderboardFailed, playerTotal, rankFor } from '@/use/useLeaderboard'
import { formatCount } from '@/utils/localeNumber'

/**
 * ─── "🏆 #1130 of 2345" ─────────────────────────────────────────────────────
 *
 * The whole leaderboard, reduced to one pill on the result screen. It is the
 * only part of the feature most players ever see, and the population is the
 * half that gives the placing meaning: a bare "#1130" says nothing.
 *
 * THREE STATES, and only one of them is a number:
 *
 *   • a rank        → `#1130`, plus `of 2345 players` once the count has landed
 *   • still waiting → `…`, holding the row's width so the headline does not
 *                     jump sideways when the rank arrives a beat later
 *   • nothing to say → the badge does not render AT ALL
 *
 * There is no `#100+` state, and adding one back is a regression. A placing
 * that cannot be stated as a number is not shown as prose instead: `rankFor`
 * ranks against the histogram — live, cached or baked — so below the published
 * hundred it still answers with a real number, and `OUTSIDE_BOARD` survives
 * only for the case where no histogram exists anywhere. That case renders
 * nothing, because "past the end of what we published" is the game admitting
 * it did not look, delivered to exactly the players who most need a number.
 *
 * The empty state is the one to respect. An empty plaque is a question the
 * screen cannot answer, and a permanent "…" on a player with no connection
 * reads as a broken game — so once the fetch has actually failed the badge is
 * gone and stays gone. It rarely comes to that: the offline ladder usually has
 * a cached or baked board to rank against, and the player never learns which
 * rung answered.
 *
 * `score` is a PROP rather than an import, so the badge does not need to know
 * where the game keeps its lifetime best — pass the same number `reportRun`
 * posts (here: the deepest node ever cleared).
 */
interface Props {
  /**
   * The player's LIFETIME BEST, not this run's result. Ranking one match
   * against a board of bests would show a player their rank falling after a
   * bad run, which is the opposite of what this pill is for.
   */
  score: number
  /** Drop the "of N players" tail where the width genuinely is not there. */
  compact?: boolean
}
const props = withDefaults(defineProps<Props>(), { compact: false })

const { t, locale } = useI18n()

/**
 * Both numbers in this pill are GROUPED for the active locale — `#41,032 of
 * 154,331` rather than `#41032 of 154331`. Reading `locale.value` inside a
 * render keeps it reactive, so switching language in Options re-groups the
 * number rather than leaving the old separators behind.
 */
const fmt = (n: number): string => formatCount(n, locale.value)

/** The population, grouped — used by both the visible tail and the aria label. */
const totalLabel = computed(() => fmt(playerTotal.value))

/**
 * The rank as PROSE — `#42`, `…`, or empty.
 *
 * The `#` is built here and not in the template because `#{}` is Pug
 * interpolation: a literal `#` in front of a mustache is a parse error rather
 * than a hash sign.
 */
const label = computed<string>(() => {
  if (!leaderboardEnabled) return ''
  const rank = rankFor(props.score)
  if (rank > 0) return `#${fmt(rank)}`
  // `0` means "nothing honest to say yet" and `OUTSIDE_BOARD` means "no
  // histogram to say it with". Until the endpoint has actually failed, the
  // first is a request still in flight, so hold the slot; after that, and for
  // the second, give the slot back.
  if (rank === OUTSIDE_BOARD) return ''
  return leaderboardFailed.value ? '' : '…'
})

/**
 * Only once the population has landed — before that there is no "of N" to
 * print, and a placeholder there would be a second unanswered question.
 */
const showTotal = computed(() => !props.compact && playerTotal.value > 0)

/**
 * One accessible name for the whole pill: without it a screen reader reads
 * "number 1130 of 2345 players" with no idea what is being counted.
 */
const ariaLabel = computed(() => (showTotal.value
  ? `${t('leaderboard.title')}: ${label.value} ${t('leaderboard.of', { n: totalLabel.value })}`
  : `${t('leaderboard.title')}: ${label.value}`))
</script>

<template lang="pug">
  //- No cell at all when there is nothing honest to say.
  div.rank-badge(v-if="label" role="img" :aria-label="ariaLabel")
    GameIcon.rank-badge__icon(name="trophy")
    span.rank-badge__rank {{ label }}
    span.rank-badge__of(v-if="showTotal") {{ t('leaderboard.of', { n: totalLabel }) }}
</template>

<style scoped lang="sass">
// The same pill the rest of the HUD wears — dark plate, gold rule, glyph then
// number — so the placing reads as one of the game's own numbers rather than a
// widget bolted on. Gold because it is the one number on the screen that is not
// about this run: it is about everyone else.
.rank-badge
  display: inline-flex
  align-items: baseline
  gap: 0.3em
  padding: clamp(0.15rem, 0.9vmin, 0.3rem) clamp(0.4rem, 2vmin, 0.7rem)
  border: 2px solid rgba(255, 217, 60, 0.45)
  border-radius: 999px
  background-color: rgba(255, 217, 60, 0.1)
  color: #ffd93c

.rank-badge__icon
  // `align-self` rather than centring the row: the numbers set the baseline,
  // and a glyph hung off it sits where a capital letter would.
  align-self: center
  flex: 0 0 auto
  width: clamp(0.85rem, 4vmin, 1.2rem)
  height: clamp(0.85rem, 4vmin, 1.2rem)

.rank-badge__rank
  color: #fff
  font-weight: 900
  font-size: clamp(0.85rem, 4.2vmin, 1.3rem)
  line-height: 1
  // Every number in this game sits on a hard black shadow; without it the pill
  // looks like a different app's component.
  text-shadow: 2px 2px 0 #000

.rank-badge__of
  color: #b9cbe8
  text-transform: uppercase
  font-size: clamp(0.5rem, 2.4vmin, 0.7rem)
</style>
