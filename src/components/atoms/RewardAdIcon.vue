<script setup lang="ts">
import MovieIcon from '@/components/icons/MovieIcon.vue'
import { isRewardGated } from '@/use/useAdGate'

/**
 * The "a video follows this click" mark, prepended to every rewarded button.
 *
 * The picture itself is `MovieIcon`; what this component adds is the one
 * decision — WHETHER the mark belongs here at all.
 *
 * ── It renders ONLY where a video really plays ──
 *
 * The mark is a promise to the player: press this and you will watch an ad.
 * So it is gated on `isRewardGated` — "a real ad provider is resolved" — and
 * NOT on `canOfferReward`, which is also true on the builds that have no
 * inventory and simply grant the perk (local dev, itch, plain web) and on
 * which a film icon would be a lie. The CrazyGames PRE-release build offers no
 * rewarded surface at all, so it never reaches this component.
 *
 * The gate lives HERE rather than at each call site on purpose: every rewarded
 * button in the game renders this component, so one predicate in one file
 * makes all of them correct — including the ones added later, which is exactly
 * where a per-call-site `v-if` would eventually be forgotten. The button and
 * its label are the caller's business; whether a film frame belongs in front
 * of them is this component's.
 */
</script>

<template lang="pug">
  MovieIcon.reward-ad-icon(v-if="isRewardGated")
</template>
