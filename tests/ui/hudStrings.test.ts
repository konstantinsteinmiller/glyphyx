import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import en from '@/i18n/locales/en'

/**
 * ─── No hardcoded copy in the HUD ───────────────────────────────────────────
 *
 * Every string a player can read has to come out of the i18n bundles, or the
 * translators never see it. jsdom cannot render a canvas or measure a layout,
 * so this is a SOURCE scan: every component under `components/game` and the
 * scene that prints text has to go through `useI18n`, every static `t('…')`
 * key it uses has to exist in the English bundle, and no pug line may carry a
 * bare capitalised English phrase as its text node.
 */

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(join(ROOT, rel), 'utf8')

const OWNED = [
  'src/views/GameScene.vue',
  ...readdirSync(join(ROOT, 'src/components/game')).filter((f) => f.endsWith('.vue')).map((f) => `src/components/game/${f}`),
  'src/components/organisms/CampaignModal.vue',
  'src/components/organisms/LeaderboardModal.vue',
  'src/components/organisms/OptionsModal.vue',
  'src/components/atoms/FLogoProgress.vue',
  'src/components/atoms/FMuteButton.vue'
]

/** Does `path` (dotted) resolve to something in the English bundle? */
const hasKey = (path: string): boolean => {
  let cur: unknown = en
  for (const part of path.split('.')) {
    if (typeof cur !== 'object' || cur === null || !(part in cur)) return false
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur !== undefined
}

/**
 * Components whose only printed text is a string the CALLER already
 * translated and passed in as a prop. `PebblePreview` prints `{{ label }}` —
 * the "Lv 3" caption its own canvas also paints, repeated as real text so a
 * screen reader gets it — and the callers build that string with `t()`. A
 * `useI18n()` of its own would have nothing to look up.
 */
const TRANSLATED_BY_CALLER = new Set(['src/components/game/PebblePreview.vue'])

/** A pug text node that is plain prose: `| Word words` or `tag Word words`. */
const BARE_TEXT = /^\s*(?:\|\s*)?([A-Z][a-z]{2,}(?:\s+[a-z]+)+)\s*$/

const templateOf = (src: string): string =>
  src.match(/<template lang="pug">([\s\S]*?)<\/template>/)?.[1] ?? ''

describe('HUD components print only translated strings', () => {
  for (const rel of OWNED) {
    const src = read(rel)
    // Only the TEMPLATE decides whether a component prints: a pipe in the
    // script is a union type (`'player' | 'enemy'`), not a pug text node.
    const tpl = templateOf(src)
    const prints = /\{\{/.test(tpl) || /^\s*\|\s+\S/m.test(tpl)

    it(`${rel} goes through useI18n when it renders text`, () => {
      if (!prints || TRANSLATED_BY_CALLER.has(rel)) return
      expect(src).toMatch(/useI18n\(/)
    })

    it(`${rel} references only keys that exist in en.ts`, () => {
      const missing: string[] = []
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) {
        const key = m[1]!
        // A key ending in a dot is a prefix concatenated at runtime
        // (`'options.difficultyHints.' + level`); template-literal keys never
        // match this regex at all. Both are covered by the per-key tests of
        // the modules that own the suffixes.
        if (key.endsWith('.')) continue
        if (!hasKey(key)) missing.push(key)
      }
      expect(missing, `${rel} uses keys missing from en.ts`).toEqual([])
    })

    it(`${rel} has no bare English prose in its template`, () => {
      const offenders: string[] = []
      for (const line of templateOf(src).split('\n')) {
        if (line.trim().startsWith('//-')) continue
        if (BARE_TEXT.test(line)) offenders.push(line.trim())
      }
      expect(offenders).toEqual([])
    })
  }
})

describe('every icon-only HUD control carries an aria-label', () => {
  it('GameScene (and the shop button it mounts) names each icon-only FHudButton / FButton', () => {
    // The shop's HUD button moved into its own Button+Modal component; it is
    // still one of the scene's icon-only controls, so it is scanned with it.
    const tpl = ['src/views/GameScene.vue', 'src/components/organisms/ShopButton.vue']
      .map((f) => templateOf(read(f))).join('\n')
    // Split the template into one chunk per component opening line; a chunk
    // that opens an FHudButton or an icon-only FButton must name itself
    // somewhere inside its own attribute list.
    const chunks = tpl.split(/\n(?=\s*(?:FHudButton|FButton)\b)/)
    let checked = 0
    for (const c of chunks) {
      const head = c.trimStart()
      const isHud = head.startsWith('FHudButton')
      const isIconOnly = head.startsWith('FButton') && /^\s*icon-only\s*$/m.test(c)
      if (!isHud && !isIconOnly) continue
      checked++
      expect(c, `unnamed control:\n${c.slice(0, 200)}`).toMatch(/:aria-label="[^"]*\bt\(/)
    }
    expect(checked).toBeGreaterThanOrEqual(5)
  })
})
