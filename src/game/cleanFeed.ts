/**
 * ─── Clean feed: the arena with nothing painted on top of it ────────────────
 *
 * `?clean=1` makes the renderer draw the game and only the game: no planning
 * timer, no hand tray or reroll chip, no banners, no floating numbers, no HP
 * or level text, no correction ring — and the board centred in the whole
 * canvas instead of in whatever the HUD leaves. The attacks, the shatters, the
 * capture waves, the aim previews and every particle stay.
 *
 * It exists for scripted gameplay capture (`tools/preview-video`): trailer and
 * store specs ask for "pure gameplay — no hardcoded text, score counters,
 * watermarks, UI or logos", and the DOM half of that is the recorder's job
 * (it hides everything but the canvas), while this is the half nothing outside
 * the renderer can reach.
 *
 * DEV only, and resolved ONCE at module load, like `?tier=` in `useVfx`: a
 * flag the frame loop re-read would be a URL parse per frame, and a player's
 * build has no reason to hide its own interface.
 */
export const CLEAN_FEED: boolean = import.meta.env.DEV && devParam('clean') === '1'

/**
 * A query param from EITHER half of the URL — the router is on hash history,
 * so it can arrive as `?clean=1#/` or `#/?clean=1` (the same rule `?art=` in
 * `art.ts` follows). DEV builds only read it; see the callers.
 */
export function devParam(name: string): string | null {
  try {
    const url = new URL(window.location.href)
    const hashQuery = url.hash.includes('?') ? url.hash.slice(url.hash.indexOf('?') + 1) : ''
    return url.searchParams.get(name) ?? new URLSearchParams(hashQuery).get(name)
  } catch {
    return null
  }
}
