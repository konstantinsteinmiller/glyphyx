import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import TurnBanner from '@/components/game/TurnBanner.vue'
import GoalIntro from '@/components/game/GoalIntro.vue'

/**
 * ─── Say what winning means ─────────────────────────────────────────────────
 *
 * Three blind testers cleared the entire six-lesson tutorial without the game
 * ever telling them what they were trying to do. One found the words "destroy
 * every enemy rune" only by backing out of the match to the campaign map;
 * another was told "hold 8 tiles" for the first time at level 1-7 and said the
 * six levels before it had her "winning without understanding why"; the third
 * only learned what the counters meant from the screen that told her she had
 * lost (2026-09-12).
 *
 * The strings existed the whole time — the campaign map has said them since
 * the map was built. What was missing was saying them where the match is.
 */

const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })
const mountWith = (component: unknown, props: Record<string, unknown>) =>
  mount(component as never, { props, global: { plugins: [i18n], stubs: { ArtIcon: true } } })

describe('the stage banner', () => {
  const base = { show: true, chapter: 1, node: 1, mode: '1v1' as const, foe: 'Bone Dummies' }

  it('names the objective of the match it is opening', () => {
    const w = mountWith(TurnBanner, { ...base, objective: 'eliminate' })
    expect(w.text()).toContain(en.campaign.objectives.eliminate)
  })

  it('names it for every objective the campaign has', () => {
    for (const objective of ['conquest', 'eliminate', 'siege'] as const) {
      const w = mountWith(TurnBanner, { ...base, objective })
      expect(w.text()).toContain(en.campaign.objectives[objective])
    }
  })

  it('says nothing extra when there is no objective to name', () => {
    const w = mountWith(TurnBanner, { ...base, objective: null })
    expect(w.find('.turn-banner__goal').exists()).toBe(false)
  })

  it('keeps the sudden-death variant to its one urgent line', () => {
    // Sudden death replaces the whole banner; an objective printed under it
    // would be reassuring at exactly the wrong moment.
    const w = mountWith(TurnBanner, { ...base, objective: 'conquest', suddenDeath: true })
    expect(w.text()).toContain(en.hud.suddenDeath)
    expect(w.find('.turn-banner__goal').exists()).toBe(false)
  })
})

describe('the goal card', () => {
  it('says the rule it is miming', () => {
    // The card animates eight tiles filling under a crown and says "7 / 8".
    // A tester watched the whole thing and wrote: "No label, no explanation of
    // what it was tracking. I still don't know what it meant."
    const w = mountWith(GoalIntro, { modelValue: true })
    const rule = w.find('.goal__rule')
    expect(rule.exists()).toBe(true)
    expect(rule.text()).toBe(en.hints.conquest.desktop)
  })

  it('still counts and still offers the way out', () => {
    const w = mountWith(GoalIntro, { modelValue: true })
    expect(w.find('.goal__count-num').exists()).toBe(true)
    expect(w.find('.goal__hint').exists()).toBe(true)
  })

  it('shows nothing at all while it is closed', () => {
    const w = mountWith(GoalIntro, { modelValue: false })
    expect(w.find('.goal__rule').exists()).toBe(false)
  })
})
