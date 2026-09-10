/**
 * ─── The painted Keeper on the splash — the build-time half ────────────────
 *
 * The Keeper is the one drawable whose shipped form was inline SVG: he is on
 * screen in the first frame, before any request could come back, in both the
 * static splash (`index.html`) and `FLogoProgress.vue`. So slicing a painting
 * of him changed nothing — no code ever asked for `images/heroes/keeper.webp`.
 *
 * When the build ships painted art and that file exists, `vite.config.ts`
 * passes it here and it is baked into the static splash as a `data:` URI:
 * still no request, still the first frame, and the SVG steps aside through
 * `.splash-painted + svg` in the splash's own CSS. `data:` is in every build's
 * CSP `img-src`, and it needs no script — which the CSP would refuse on most
 * builds, so an `onload` swap was never an option. `FLogoProgress` then takes
 * this element's src, so the handover to Vue is the same decoded picture.
 *
 * Pure (no Node, no DOM) so it can be tested without spinning up Vite, like
 * `src/platforms/csp.ts`.
 */

/** Sits in `index.html` right before the hero's `<svg>`, which is what makes `+ svg` match. */
export const KEEPER_SPLASH_MARKER = '<!-- painted keeper: baked in at build time when the art ships (src/game/keeperSplash.ts) -->'

/**
 * Above this the painting is not inlined. As base64 it rides in the very first
 * response, and a big one would delay the page more than the pop-in it saves;
 * the runtime probe in `FLogoProgress` still fades it in.
 */
export const KEEPER_INLINE_MAX = 64 * 1024

const toBase64 = (bytes: Uint8Array): string => {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

/**
 * The splash with the painting baked in, or with the marker simply removed
 * when there is nothing to bake (art off, no painting yet, or too big).
 */
export const bakeKeeperSplash = (html: string, painted: Uint8Array | null): string => {
  if (!html.includes(KEEPER_SPLASH_MARKER)) return html
  if (!painted || painted.length === 0 || painted.length > KEEPER_INLINE_MAX) return html.replace(KEEPER_SPLASH_MARKER, '')
  return html.replace(
    KEEPER_SPLASH_MARKER,
    `<img class="splash-painted" src="data:image/webp;base64,${toBase64(painted)}" alt="" decoding="sync">`
  )
}
