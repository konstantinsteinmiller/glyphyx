import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'

/**
 * ─── Two things the shop audit found that no mounted test can see ───────────
 *
 * Both were invisible to the suite because both are about what a component
 * NAMES, not about what it renders: a key that exists in no locale still
 * renders (as itself), and a focus ring that was never written still passes
 * every assertion about buttons.
 */

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(join(ROOT, rel), 'utf8')

/** Does `path` (dotted) resolve to a string in the English bundle? */
const hasKey = (path: string): boolean => {
  let cur: unknown = en
  for (const part of path.split('.')) {
    if (typeof cur !== 'object' || cur === null || !(part in cur)) return false
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' && cur.length > 0
}

describe('the shop names only keys that ship', () => {
  const shop = read('src/components/organisms/ShopModal.vue')

  it('labels the wallet with a real key', () => {
    // `t('coins')` named a key that existed in NONE of the 21 locales. With
    // `missingWarn: false` in `main.ts` that fails silently: vue-i18n echoes
    // the key, so every screen reader in every language read out "coins".
    expect(shop).toContain("t('coins')")
    expect(hasKey('coins'), 'the wallet label must exist in en.ts').toBe(true)
  })

  it('takes all three tab labels from one namespace', () => {
    // The ranks tab used to be labelled from `ranks.tab` while its two
    // neighbours came from `shop.tabs.*`: a translator updating "tabs" would
    // have missed one of the three words sitting side by side.
    for (const key of ['shop.tabs.runes', 'shop.tabs.ranks', 'shop.tabs.skins']) {
      expect(shop, `${key} is the tab label`).toContain(`t('${key}')`)
      expect(hasKey(key), `${key} must exist in en.ts`).toBe(true)
    }
    expect(hasKey('ranks.tab'), 'the old duplicate is gone').toBe(false)
  })

  it('resolves every static translation key the shop panels name', () => {
    for (const rel of [
      'src/components/organisms/ShopModal.vue',
      'src/components/organisms/RankShopPanel.vue',
      'src/components/organisms/RuneRankCard.vue',
      'src/components/organisms/PowerRuneCard.vue',
      'src/components/organisms/MysteryRuneCard.vue'
    ]) {
      const src = read(rel)
      // Only STATIC keys. A key built from a rune type is covered by the
      // exhaustive-record tests that own the roster.
      for (const m of src.matchAll(/\bt\('([a-zA-Z][\w.]*)'/g)) {
        expect(hasKey(m[1]!), `${rel} names ${m[1]}`).toBe(true)
      }
    }
  })
})

describe('a keyboard player can see where they are', () => {
  const app = read('src/App.vue')

  it('paints a focus ring that the global reset cannot swallow', () => {
    // `* { outline: none }` is there to stop a TAPPED button wearing a ring,
    // and it also left the game with no focus indicator at all: keyboard,
    // gamepad and switch-control players moved through the shop's tabs, buy
    // buttons and skin cards with nothing to see. `:focus-visible` only
    // matches keyboard-like focus, so both stay true.
    expect(app).toMatch(/\*:focus-visible/)
    const ring = app.slice(app.indexOf('*:focus-visible'))
    expect(ring).toMatch(/outline:\s*\d/)
    expect(ring).toMatch(/outline-offset/)
  })

  it('keeps the ring clear of the painted button bevel', () => {
    expect(app).toMatch(/\.f-button:focus-visible/)
  })
})
