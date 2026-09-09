import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import RuneTooltip from '@/components/game/RuneTooltip.vue'
import { RUNE_TOOLTIP_USES, RUNE_TYPES, statsFor } from '@/game/rules'
import { recordRuneUse, runeUses, tooltipWanted, tooltipWantedFor } from '@/use/useRuneUses'

/**
 * ─── A rune explains itself while it is new ─────────────────────────────────
 *
 * The card says the name, the sentence and the Lv 1 numbers of the rune in
 * hand; the scene shows it only while the player has placed that rune fewer
 * than `RUNE_TOOLTIP_USES` times, and never under an overlay or a modal.
 */

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })
const mountTip = (type: string | null) =>
  mount(RuneTooltip, {
    props: { type: type as never },
    global: { plugins: [i18n], stubs: { PebblePreview: true } }
  })

describe('RuneTooltip', () => {
  it('prints the name, the description and the Lv 1 numbers of the rune', () => {
    const w = mountTip('archer')
    const text = w.text()
    expect(text).toContain(en.runes.names.archer)
    expect(text).toContain(en.runes.descriptions.archer)
    const s = statsFor('archer', 1)
    expect(text).toContain(`${en.runes.hp}${s.hp}`.replace(/\s+/g, ''))
    expect(w.findAll('.rune-tip__stat')).toHaveLength(2)
    w.unmount()
  })

  it('skips the attack chip for a rune that does not attack', () => {
    const w = mountTip('defense')
    expect(w.text()).toContain(en.runes.names.defense)
    expect(w.findAll('.rune-tip__stat')).toHaveLength(1)
    w.unmount()
  })

  it('renders nothing for no rune', () => {
    const w = mountTip(null)
    expect(w.find('.rune-tip').exists()).toBe(false)
    w.unmount()
  })

  it('never takes the pointer', () => {
    const src = readFileSync(resolve(__dirname, '../../src/components/game/RuneTooltip.vue'), 'utf8')
    expect(src).toMatch(/pointer-events: none/)
    expect(src).toMatch(/user-select: none/)
  })
})

describe('when the card shows', () => {
  it('retires per rune after RUNE_TOOLTIP_USES placements', () => {
    for (const t of RUNE_TYPES) expect(tooltipWanted(t)).toBe(true)
    for (let i = 0; i < RUNE_TOOLTIP_USES - 1; i++) recordRuneUse('melee')
    expect(tooltipWanted('melee')).toBe(true)
    expect(tooltipWantedFor.melee.value).toBe(true)
    recordRuneUse('melee')
    expect(runeUses('melee')).toBe(RUNE_TOOLTIP_USES)
    expect(tooltipWanted('melee')).toBe(false)
    expect(tooltipWantedFor.melee.value).toBe(false)
    // Other runes are untouched.
    expect(tooltipWanted('archer')).toBe(true)
  })

  it('is gated in the scene on the active rune, the use count and no overlay', () => {
    const scene = readFileSync(resolve(__dirname, '../../src/views/GameScene.vue'), 'utf8')
    expect(scene).toMatch(/const type = battle\.activeRune\.value/)
    expect(scene).toMatch(/if \(!type \|\| overlayUp\.value \|\| isAnyModalOpen\.value\) return null/)
    expect(scene).toMatch(/return tooltipWantedFor\[type\]\.value \? type : null/)
    // Two homes, never both: the strip under the pill when it is tall enough,
    // the stage badge's slot on a short phone (the badge steps aside).
    expect(scene).toMatch(/RuneTooltip\.scene__tooltip\(v-if="!tightStrip" :type="tooltipRune"\)/)
    expect(scene).toMatch(/RuneTooltip\.scene__tooltip\.is-in-stage\(v-if="tipInStage" :type="tooltipRune"\)/)
    expect(scene).toMatch(/StageBadge\(\s*v-else/)
    expect(scene).toMatch(/const tipInStage = computed\(\(\) => tooltipRune\.value !== null && tightStrip\.value\)/)
  })
})
