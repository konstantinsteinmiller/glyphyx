import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import RewardStage from '@/components/game/RewardStage.vue'

/**
 * ─── The plane the prize stands on, mounted ─────────────────────────────────
 *
 * Two halves, because this component is half behaviour and half CSS.
 *
 * What a mount can see — whether it renders at all, the tone it is handed, the
 * burst it is asked for — is asserted by mounting it. What a mount CANNOT see
 * is the styling: `@vue/test-utils` does not apply a scoped `<style>` block, so
 * `getComputedStyle` in jsdom reports nothing about `position` or
 * `pointer-events`. Those are pinned by reading the component's own source, the
 * way `resultFlow.test.ts` pins the scene's structure — a weaker check than a
 * real browser, but the alternative is asserting nothing at all about the two
 * rules this component must never lose.
 */

let wrapper: VueWrapper | null = null
afterEach(() => { wrapper?.unmount(); wrapper = null })

const source = readFileSync(
  resolve(__dirname, '../..', 'src/components/game/RewardStage.vue'),
  'utf8'
)

describe('RewardStage', () => {
  it('renders nothing at all until the plane is up', () => {
    wrapper = mount(RewardStage, { props: { active: false } })
    expect(wrapper.find('.reward-stage').exists()).toBe(false)
    // Not "present but transparent": there is no element to composite.
    expect(wrapper.html()).not.toContain('reward-stage')
  })

  it('raises the stage with all four layers once it is active', () => {
    wrapper = mount(RewardStage, { props: { active: true } })
    expect(wrapper.find('.reward-stage').exists()).toBe(true)
    expect(wrapper.find('.reward-stage__bloom').exists()).toBe(true)
    // TWO ray discs: one alone reads as a wagon wheel rather than as light.
    expect(wrapper.findAll('.reward-stage__rays')).toHaveLength(2)
    expect(wrapper.find('.reward-stage__rays.is-back').exists()).toBe(true)
    expect(wrapper.find('.reward-stage__rays.is-front').exists()).toBe(true)
    expect(wrapper.find('.reward-stage__vignette').exists()).toBe(true)
  })

  it('takes its colour from the prize', () => {
    wrapper = mount(RewardStage, { props: { active: true, tone: '#e8ff3d' } })
    expect(wrapper.find('.reward-stage').attributes('style')).toContain('#e8ff3d')
  })

  it('falls back to the chest gold when no prize colour is given', () => {
    wrapper = mount(RewardStage, { props: { active: true } })
    expect(wrapper.find('.reward-stage').attributes('style')).toContain('#ffd93c')
  })

  it('flares on the beat the lid comes off, and only while asked to', async () => {
    wrapper = mount(RewardStage, { props: { active: true, burst: false } })
    expect(wrapper.find('.reward-stage').classes()).not.toContain('is-burst')
    await wrapper.setProps({ burst: true })
    expect(wrapper.find('.reward-stage').classes()).toContain('is-burst')
  })

  it('says nothing to a screen reader — the prize does the announcing', () => {
    wrapper = mount(RewardStage, { props: { active: true } })
    expect(wrapper.find('.reward-stage').attributes('aria-hidden')).toBe('true')
  })
})

describe('the two rules the plane may never lose', () => {
  it('is a fixed sheet that can never swallow the tap that continues', () => {
    // The overlay's own click is what advances to the next screen. A
    // decorative layer with pointer events strands the player on the reward.
    const root = source.slice(source.indexOf('.reward-stage\n'))
    expect(root).toMatch(/position: fixed/)
    expect(root).toMatch(/pointer-events: none/)
    expect(root).toMatch(/inset: 0/)
    // …and it must not give the overlay a scrollbar with its oversized discs.
    expect(root).toMatch(/overflow: hidden/)
  })

  it('draws LIGHT and DARK wedges, not light and empty ones', () => {
    // A transparent gap on an already-dark backdrop is just more backdrop; the
    // contrast that makes a sunburst read comes from the shadowed wedge.
    const rays = source.slice(source.indexOf('.reward-stage__rays'))
    expect(rays).toMatch(/repeating-conic-gradient/)
    expect(rays).toMatch(/rgba\(0, 0, 0/)
    // Both wedges are mixed against the tone, so one prop tints the whole
    // effect and no rune needs a hand-picked companion colour.
    expect(rays.match(/color-mix\(in srgb, var\(--tone\)/g)?.length ?? 0).toBeGreaterThanOrEqual(4)
  })

  it('keeps the stage for a player who asked for less motion, and stops it moving', () => {
    expect(source).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
    const reduced = source.slice(source.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/animation: none/)
    // The bloom and the rays are both stilled — including under `is-burst`,
    // which would otherwise re-introduce the flare it is meant to suppress.
    expect(reduced).toMatch(/reward-stage__bloom/)
    expect(reduced).toMatch(/reward-stage__rays/)
    expect(reduced).toMatch(/is-burst/)
  })

  it('composites on the GPU: no blur on the moving layers', () => {
    // A `filter: blur()` on an element this size re-rasterises every frame on
    // a phone. The softness is in the gradients themselves.
    //
    // Scoped to the STYLE block on purpose: the header comment names the thing
    // it is avoiding, and a scan of the whole file would match the prose that
    // explains the rule and call it a violation of it.
    const styles = source.slice(source.indexOf('<style'))
    expect(styles).not.toMatch(/filter:\s*blur/)
  })
})
