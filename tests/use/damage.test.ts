import { describe, expect, it } from 'vitest'
import { crackNetwork, damageStage, paintDamage, type DamageStage } from '@/use/arenaPainters'

/**
 * ─── A stone that has been hit looks like a stone that has been hit ─────────
 *
 * Three blind testers in a row said the same thing in different words: they
 * could not tell that their attacks were doing anything. A rune gave nothing
 * away between the hit that landed and the hit that killed it, so a shielded
 * enemy read as invulnerable and a win read as luck.
 *
 * The answer is a break in the stone that deepens in three steps. What this
 * file pins is the part that has to be TRUE rather than pretty: the mapping
 * from health to stage, and that the network only ever GROWS — the hairline a
 * player saw at stage 1 has to still be there, in the same place, at stage 3.
 * A crack that redraws itself is a stone swapped for another stone.
 */

describe('damageStage', () => {
  it('leaves an untouched stone whole', () => {
    expect(damageStage(2, 2)).toBe(0)
    expect(damageStage(12, 12)).toBe(0)
  })

  it('reads the same three steps on a 2 HP dummy and a 12 HP wall', () => {
    // Proportional on purpose: "half gone" has to look the same whatever the
    // stone's size, or the shield wall never appears damaged at all.
    expect(damageStage(9, 12)).toBe(1)
    expect(damageStage(6, 12)).toBe(2)
    expect(damageStage(2, 12)).toBe(3)
    expect(damageStage(1, 2)).toBe(2)
  })

  it('never reports damage on a dead or nonsense stone', () => {
    expect(damageStage(0, 4)).toBe(0)
    expect(damageStage(-1, 4)).toBe(0)
    expect(damageStage(3, 0)).toBe(0)
  })

  it('is monotone: losing health never makes a stone look better', () => {
    let last = 0
    for (let hp = 8; hp >= 1; hp--) {
      const stage = damageStage(hp, 8)
      expect(stage).toBeGreaterThanOrEqual(last)
      last = stage
    }
    expect(last).toBe(3)
  })
})

describe('crackNetwork', () => {
  it('breaks the same stone the same way every time', () => {
    expect(crackNetwork(7)).toEqual(crackNetwork(7))
  })

  it('breaks different stones differently', () => {
    expect(crackNetwork(7)).not.toEqual(crackNetwork(8))
  })

  it('only ever ADDS — the hairline from stage 1 is still there at stage 3', () => {
    const net = crackNetwork(21)
    const at = (s: DamageStage) => net.fissures.filter((f) => f.from <= s)
    const one = at(1)
    const two = at(2)
    const three = at(3)
    expect(one.length).toBeGreaterThan(0)
    expect(two.length).toBeGreaterThan(one.length)
    expect(three.length).toBeGreaterThan(two.length)
    // Not "as many as before" — the SAME ones, unmoved.
    expect(two.slice(0, one.length)).toEqual(one)
    expect(three.slice(0, two.length)).toEqual(two)
  })

  it('keeps every fissure on the stone rather than out on the tile', () => {
    // Every point is pulled back onto the face as it is walked, rather than
    // left to be clipped at the rim: a clipped fissure is an amputated one,
    // and the first version of this drew breaks that ran off the stone and
    // hung in the air over the tile behind it.
    for (let seed = 0; seed < 60; seed++) {
      const net = crackNetwork(seed)
      for (const f of net.fissures) {
        for (const p of f.pts) {
          expect(Math.hypot(p.x / 0.26, p.y / 0.24)).toBeLessThanOrEqual(1.0001)
        }
      }
      // Chips sit ON fissure points, so they stay near the face too.
      for (const c of net.chips) {
        for (const p of c.pts) expect(Math.hypot(p.x / 0.26, p.y / 0.24)).toBeLessThan(1.35)
      }
    }
  })

  it('knocks chips out only where the fissures already cross', () => {
    const net = crackNetwork(3)
    expect(net.chips.length).toBeGreaterThan(0)
    for (const c of net.chips) expect(c.pts.length).toBeGreaterThanOrEqual(3)
  })
})

describe('paintDamage', () => {
  /** A context that records what it was asked to do — jsdom has no canvas. */
  const spyCtx = () => {
    const calls: string[] = []
    const strokes: Array<{ style: string; width: number }> = []
    const rec = (name: string) => (...a: unknown[]) => { calls.push(`${name}(${a.length})`) }
    const ctx = {
      save: rec('save'), restore: rec('restore'), beginPath: rec('beginPath'),
      moveTo: rec('moveTo'), lineTo: rec('lineTo'), closePath: rec('closePath'),
      fill: rec('fill'), clip: rec('clip'), ellipse: rec('ellipse'),
      stroke: (...a: unknown[]) => {
        calls.push(`stroke(${a.length})`)
        strokes.push({ style: String(ctx.strokeStyle), width: Number(ctx.lineWidth) })
      },
      lineWidth: 0, lineCap: '', lineJoin: '', strokeStyle: '', fillStyle: ''
    }
    return { calls, strokes, ctx: ctx as unknown as CanvasRenderingContext2D }
  }

  it('draws nothing at all on a whole stone', () => {
    const { calls, ctx } = spyCtx()
    paintDamage(ctx, 64, 64, 0, 1)
    expect(calls).toEqual([])
  })

  it('draws more at every stage', () => {
    const counts = ([1, 2, 3] as const).map((stage) => {
      const { calls, ctx } = spyCtx()
      paintDamage(ctx, 64, 64, stage, 5)
      return calls.filter((c) => c.startsWith('lineTo')).length
    })
    expect(counts[1]!).toBeGreaterThan(counts[0]!)
    expect(counts[2]!).toBeGreaterThan(counts[1]!)
  })

  it('clips to the stone and leaves the context as it found it', () => {
    const { calls, ctx } = spyCtx()
    paintDamage(ctx, 64, 64, 3, 5)
    expect(calls.filter((c) => c.startsWith('clip'))).toHaveLength(1)
    expect(calls.filter((c) => c.startsWith('save'))).toHaveLength(1)
    expect(calls.filter((c) => c.startsWith('restore'))).toHaveLength(1)
    expect(calls[0]).toMatch(/^save/)
    expect(calls[calls.length - 1]).toMatch(/^restore/)
  })

  it('paints a break in three passes, so it reads as depth and not as a line', () => {
    const { strokes, ctx } = spyCtx()
    paintDamage(ctx, 64, 64, 1, 5)
    // The lit lip, the shadow in the bottom of it, and the break itself.
    expect(new Set(strokes.map((s) => s.style)).size).toBe(3)
  })

  it('tapers every run, widest where it began and closing at the tip', () => {
    const { strokes, ctx } = spyCtx()
    paintDamage(ctx, 96, 96, 1, 5)
    // One fissure at stage 1, so each pass walks it start-to-tip in order.
    const byStyle = new Map<string, number[]>()
    for (const s of strokes) byStyle.set(s.style, [...(byStyle.get(s.style) ?? []), s.width])
    for (const widths of byStyle.values()) {
      expect(widths.length).toBeGreaterThan(1)
      expect(widths[0]!).toBeGreaterThan(widths[widths.length - 1]!)
    }
  })

  it('opens the break wider the worse the stone gets', () => {
    const widest = ([1, 2, 3] as const).map((stage) => {
      const { strokes, ctx } = spyCtx()
      paintDamage(ctx, 96, 96, stage, 5)
      return Math.max(...strokes.map((s) => s.width))
    })
    expect(widest[1]!).toBeGreaterThan(widest[0]!)
    expect(widest[2]!).toBeGreaterThan(widest[1]!)
  })
})
