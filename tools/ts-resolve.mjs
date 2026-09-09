/**
 * Run the game's own TypeScript modules under plain Node.
 *
 * Node strips types natively, but its ESM resolver wants explicit extensions
 * and knows nothing about Vite's `@/` alias. This hook fills both gaps for the
 * pure modules a tool needs — `src/game/artSheet.ts`, `artCatalogue.ts`,
 * `rules.ts` — which have no Vue, no `import.meta.env` and no canvas in them.
 *
 *   node --import ./tools/ts-resolve.mjs tools/art-prompts.mjs
 *
 * Not part of the app build.
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src')

const withTs = (specifier) => (/\.[cm]?[jt]s$/.test(specifier) ? specifier : `${specifier}.ts`)

registerHooks({
  resolve(specifier, context, next) {
    // `@/game/rules` → <repo>/src/game/rules.ts
    if (specifier.startsWith('@/')) {
      const file = resolve(SRC, withTs(specifier.slice(2)))
      if (existsSync(file)) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    try {
      return next(specifier, context)
    } catch (err) {
      // `./rules` → `./rules.ts`
      if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
        return next(withTs(specifier), context)
      }
      throw err
    }
  }
})
