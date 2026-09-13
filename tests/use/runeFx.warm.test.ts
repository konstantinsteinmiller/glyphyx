// ─── The rune-effects warm-up ───────────────────────────────────────────────
//
// `warmRune` plays each rune's FX scenarios offscreen during planning so its
// sprites are baked before the first real effect. It must bake without
// SPAWNING (the live particle pool is untouched), make no sound and shake
// nothing, resume emission once it is done, and never warm the same rune
// twice for the same tile bucket and tier.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RUNE_TYPES } from '@/game/rules'
import { spawn } from '@/use/arenaFx'
import { __resetWarm, warmRune } from '@/use/runeFx/warm'
import { __setQualityTier, particleCount, resetVfx } from '@/use/useVfx'

// jsdom has no 2D context: hand every canvas a do-nothing one, so the bakes
// and the painters really run.
const makeCtx = (): CanvasRenderingContext2D => {
  const state: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1, filter: 'none', shadowBlur: 0 }
  const gradient = { addColorStop: () => undefined }
  return new Proxy(state, {
    get(t, k: string) {
      if (k in t) return t[k]
      if (k === 'createRadialGradient' || k === 'createLinearGradient' || k === 'createConicGradient') return () => gradient
      if (k === 'createPattern') return () => ({})
      if (k === 'measureText') return () => ({ width: 10 })
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
      return () => undefined
    },
    set(t, k: string, v) { t[k] = v; return true }
  }) as unknown as CanvasRenderingContext2D
}

const realCreate = document.createElement.bind(document)

beforeEach(() => {
  __resetWarm()
  resetVfx()
  __setQualityTier('high')
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    const el = realCreate(tag)
    if (tag === 'canvas') (el as HTMLCanvasElement).getContext = (() => makeCtx()) as unknown as HTMLCanvasElement['getContext']
    return el
  }) as typeof document.createElement)
})

afterEach(() => { vi.restoreAllMocks() })

const drain = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

describe('warmRune', () => {
  it('warms every rune without putting a single particle in the pool, then resumes emission', async () => {
    for (const t of RUNE_TYPES) {
      expect(warmRune(t, 80, 2, 1), t).toBe(true)
      expect(particleCount(), `${t} spawned while warming`).toBe(0)
    }
    await drain()
    // The shield's deferred bursts drained while emission was still suspended…
    expect(particleCount()).toBe(0)
    // …and emission is back on.
    spawn(0, 0, 0, 0, 100, 4, '#ffffff')
    expect(particleCount()).toBe(1)
  })

  it('warms a rune once per tile bucket and tier', async () => {
    expect(warmRune('mage', 80, 2, 1)).toBe(true)
    expect(warmRune('mage', 84, 2, 1)).toBe(false) // same size bucket
    expect(warmRune('mage', 80, 1, 0.35)).toBe(true) // another tier bakes other passes
    await drain()
  })

  it('does nothing — and says so — where there is no 2D context', async () => {
    vi.restoreAllMocks()
    expect(warmRune('crown', 80, 2, 1)).toBe(false)
    await drain()
  })
})
