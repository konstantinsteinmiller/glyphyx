<script setup lang="ts">
import { ref } from 'vue'
import { prependBaseUrl } from '@/utils/function'

/**
 * ─── The film frame ─────────────────────────────────────────────────────────
 *
 * The painted clapper in `public/images/icons/movie_128x96.webp`, which is the
 * mark every rewarded button in the game wears. This component is the PICTURE
 * only — whether a button should be wearing it at all is `RewardAdIcon`'s
 * decision, and that split is deliberate: the same frame is wanted in places
 * that are not themselves a reward gate.
 *
 * Two things it fixes over the drawing it replaces:
 *
 *   • The file is used DIRECTLY rather than probed for. The old version drew a
 *     vector clapper first and swapped the bitmap in from an async probe, so
 *     the painted frame arrived a tick late on every button and the procedural
 *     one is what a player actually saw flash. Here the `<img>` is the first
 *     thing rendered and the vector is only a fallback for a build where the
 *     file genuinely is not there.
 *   • The URL goes through `prependBaseUrl`. The old absolute `/images/…` is
 *     wrong on every portal build, which ships with `--base=./` — the icon
 *     would have 404'd on exactly the builds that have ads.
 */
const SRC = prependBaseUrl('images/icons/movie_128x96.webp')

/** Flipped only if the bitmap genuinely fails to decode. */
const failed = ref(false)
</script>

<template lang="pug">
  img.movie-icon(
    v-if="!failed"
    :src="SRC"
    alt=""
    draggable="false"
    aria-hidden="true"
    @error="failed = true"
  )
  //- The fallback: a film clapper, THE convention for "this plays a video",
  //- drawn as a filled silhouette rather than a stroked outline so it survives
  //- the ~16 px it renders at inside a button.
  svg.movie-icon(v-else viewBox="0 0 24 18" fill="currentColor" aria-hidden="true" focusable="false")
    path(d="M2.6 5.6h18.8c.66 0 1.2.54 1.2 1.2v8.4c0 .66-.54 1.2-1.2 1.2H2.6c-.66 0-1.2-.54-1.2-1.2V6.8c0-.66.54-1.2 1.2-1.2Z")
    path(d="M1.7 4.4 20.4 1.05a1 1 0 0 1 1.16.81l.24 1.36L2.4 6.6l-.7-1.34a.95.95 0 0 1 0-.86Z")
    path(d="m7 2.55 1.3 2.3-2.2.4-1.3-2.3zM13 1.5l1.3 2.3-2.2.4-1.3-2.3z" fill="#0d1526")
    path(d="M10.1 8.5v5l4.4-2.5z" fill="#0d1526")
</template>

<style scoped lang="sass">
.movie-icon
  flex: 0 0 auto
  // 4:3, matching the authored frame, so the bitmap and the fallback occupy
  // exactly the same box and a label beside it never reflows.
  height: 1.15em
  width: calc(1.15em * 4 / 3)
  object-fit: contain
  user-select: none
  -webkit-user-drag: none
</style>
