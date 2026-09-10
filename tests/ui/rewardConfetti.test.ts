import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import RewardConfetti from '@/components/game/RewardConfetti.vue'

/**
 * ─── The reward burst ───────────────────────────────────────────────────────
 *
 * jsdom has no 2D context and no layout, so this suite pins the two things
 * that can actually be checked without pixels, and both of them are contracts
 * rather than decoration:
 *
 *   • the CANVAS may never eat a pointer. A tap anywhere on the reward overlay
 *     is what continues to the next screen; a full-viewport canvas that
 *     swallowed it would strand the player behind an eight-second timer. That
 *     lives in the scoped stylesheet, which `@vue/test-utils` does not apply,
 *     so it is asserted against the source the way `resultFlow` does.
 *   • the LOOP may never outlive the burst. A RAF still running behind the
 *     next match is a frame budget spent on nothing, so it has to stop on the
 *     last piece, on `burst: false`, and on unmount.
 *
 * Everything else — that it survives a null context, that the pool never
 * grows — is about the component not breaking the screen it is celebrating on.
 */

const source = readFileSync(
  resolve(__dirname, '../..', 'src/components/game/RewardConfetti.vue'),
  'utf8'
)
const styleOf = (src: string): string =>
  src.match(/<style scoped lang="sass">([\s\S]*?)<\/style>/)?.[1] ?? ''

/** The exposed test seams — see the component's `defineExpose`. */
interface Seams {
  __capacity: () => number
  __alive: () => number
  __running: () => boolean
}
const seams = (w: VueWrapper): Seams => w.vm as unknown as Seams

let wrapper: VueWrapper | null = null

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.restoreAllMocks()
  // `matchMedia` is absent in jsdom; tests that add it clean up after themselves.
  delete (window as unknown as Record<string, unknown>).matchMedia
})

describe('the reward confetti', () => {
  it('mounts and unmounts with no 2D context at all', () => {
    // jsdom's `getContext` is not implemented — the same shape as a lost
    // context — and every path has to survive it without throwing.
    expect(() => {
      wrapper = mount(RewardConfetti, { props: { burst: true } })
      wrapper.unmount()
      wrapper = null
    }).not.toThrow()
  })

  it('never takes the pointer, and sits in front of the prize', () => {
    wrapper = mount(RewardConfetti)
    expect(wrapper.find('canvas.reward-confetti').exists()).toBe(true)

    // Scoped styles are not applied in jsdom, so the rule is pinned at source.
    const css = styleOf(source)
    expect(css).toMatch(/pointer-events:\s*none/)
    expect(css).toMatch(/position:\s*fixed/)
    expect(css).toMatch(/inset:\s*0/)
    expect(css).toMatch(/z-index:\s*3/)
  })

  it('fills the pool on a burst and empties it when the burst is taken away', async () => {
    wrapper = mount(RewardConfetti, { props: { burst: false, count: 90 } })
    const s = seams(wrapper)
    expect(s.__alive()).toBe(0)

    await wrapper.setProps({ burst: true })
    expect(s.__alive()).toBeGreaterThan(0)
    expect(s.__running()).toBe(true)

    await wrapper.setProps({ burst: false })
    expect(s.__alive()).toBe(0)
    expect(s.__running()).toBe(false)
  })

  it('flipping the burst on and off repeatedly never throws', async () => {
    wrapper = mount(RewardConfetti, { props: { burst: false } })
    const w = wrapper
    await expect((async () => {
      for (let i = 0; i < 4; i++) {
        await w.setProps({ burst: true })
        await w.setProps({ burst: false })
      }
    })()).resolves.toBeUndefined()
    expect(seams(w).__alive()).toBe(0)
  })

  it('cancels its frame loop on unmount, so nothing runs into the next match', async () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')
    wrapper = mount(RewardConfetti, { props: { burst: false } })
    await wrapper.setProps({ burst: true })
    expect(seams(wrapper).__running()).toBe(true)

    wrapper.unmount()
    wrapper = null
    expect(cancel).toHaveBeenCalled()
  })

  it('emits nothing at all when the player has asked for less motion', async () => {
    // Half-speed confetti is still confetti; the rays and the prize carry the
    // moment instead.
    ;(window as unknown as Record<string, unknown>).matchMedia = (q: string) => ({
      matches: q.includes('prefers-reduced-motion'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {}
    })

    wrapper = mount(RewardConfetti, { props: { burst: true } })
    const s = seams(wrapper)
    expect(s.__alive()).toBe(0)
    expect(s.__running()).toBe(false)

    await wrapper.setProps({ burst: false })
    await wrapper.setProps({ burst: true })
    expect(s.__alive()).toBe(0)
  })

  it('keeps ONE pool: its capacity never changes, and no burst overruns it', async () => {
    // The pool is allocated once and reused. A burst that could grow it would
    // be allocating typed arrays inside a celebration on a phone.
    wrapper = mount(RewardConfetti, { props: { burst: false, count: 1000 } })
    const s = seams(wrapper)
    const capacity = s.__capacity()
    expect(capacity).toBeGreaterThan(0)

    for (let i = 0; i < 3; i++) {
      await wrapper.setProps({ burst: true })
      expect(s.__capacity()).toBe(capacity)
      // Even asked for a thousand pieces, it stops at the slots it owns.
      expect(s.__alive()).toBeLessThanOrEqual(capacity)
      await wrapper.setProps({ burst: false })
    }
  })

  it('asks for fewer pieces than the ceiling, never more', async () => {
    wrapper = mount(RewardConfetti, { props: { burst: true, count: 60 } })
    expect(seams(wrapper).__alive()).toBeLessThanOrEqual(60)
  })
})

/**
 * ─── What the burst is allowed to cost ──────────────────────────────────────
 *
 * This fires on a phone, on top of a celebration that is already animating,
 * while the next match is being built. None of that is visible to a jsdom
 * mount — there are no pixels and no frames — so the budget is pinned at
 * source, the way the rest of this repo pins a renderer contract.
 *
 * Each of these is a rule that was bought with a rewrite, and each is cheap to
 * lose by accident in a later "just add one more sparkle" change.
 */
describe('the burst\'s frame budget', () => {
  const between = (from: string, to: string): string => {
    const a = source.indexOf(from)
    const b = source.indexOf(to, a + 1)
    expect(a, `anchor ${from}`).toBeGreaterThanOrEqual(0)
    expect(b, `anchor ${to}`).toBeGreaterThan(a)
    return source.slice(a, b)
  }
  /** The per-frame loop: everything from `step` to the function after it. */
  const step = (): string => between('const step = (now: number)', 'const fire = ()')

  it('draws every piece as one blit out of a pre-rendered atlas', () => {
    // Gradients and specular streaks are what make paper look like paper, and
    // they are paid for ONCE per burst. A path walked per piece per frame —
    // `arc`, a gradient built in the loop — is the same picture at many times
    // the price.
    expect(step()).toMatch(/ctx\.drawImage\(atlas/)
    expect(step(), 'no paths in the frame loop').not.toMatch(/beginPath|createLinearGradient|createRadialGradient/)
    // …and the atlas is painted BEFORE the reveal, not on it: the frame that
    // opens the chest is already mounting the card and lighting the stage.
    expect(source).toMatch(/if \(!reducedMotion\(\)\) ensureAtlas\(\)/)
    expect(between('const spawn = ()', 'const kill = ')).toMatch(/ensureAtlas\(\)/)
    expect(step(), 'the atlas is never painted in a frame').not.toMatch(/buildAtlas|ensureAtlas/)
  })

  it('clears only what it drew, never the whole viewport, once a burst is running', () => {
    // A full-screen clear at 60 Hz is pure fill rate on the device least able
    // to spare it. The frame loop wipes the boxes the LAST frame drew into;
    // `clearAll` belongs to starting and stopping.
    expect(step()).toMatch(/clearDrawn\(\)/)
    expect(step().match(/clearAll\(\)/g) ?? [], 'clearAll only on the last piece').toHaveLength(1)
    expect(step()).toMatch(/else \{ raf = 0; clearAll\(\) \}/)
  })

  it('caps its backing store below the device pixel ratio', () => {
    // Fast-moving paper: nobody has ever seen its third device pixel, and the
    // cap is most of the cost on a phone.
    const cap = source.match(/dpr = Math\.min\((\d+(?:\.\d+)?),/)
    expect(cap, 'the DPR cap is declared in `measure`').toBeTruthy()
    expect(Number(cap![1])).toBeLessThanOrEqual(1.5)
  })

  it('spends nothing on a piece that has not launched yet', () => {
    // The three sources are staggered, which is what lets the burst last a
    // second and a half without ever putting more paper on screen at once. A
    // delayed piece must cost one float add, not a transform and a blit.
    expect(step()).toMatch(/if \(t < 0\) continue/)
  })

  it('keeps the pool and the wipe list the same size, so neither can overrun', () => {
    expect(source).toMatch(/const dbox = new Float32Array\(CAPACITY \* 3\)/)
  })
})
