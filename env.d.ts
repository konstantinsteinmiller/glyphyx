/// <reference types="vite/client" />

/**
 * The paintings that exist on disk, as `images/<folder>/<id>` keys. Defined by
 * `vite.config.ts` for BUILDS only — on a dev server (and under vitest) the
 * identifier is undefined, which `src/game/art.ts` reads as "probe everything".
 * Always test it with `typeof`.
 */
declare const __PAINTED_ART__: string[] | null | undefined
