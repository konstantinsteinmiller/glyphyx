import { spriteFor } from '@/game/art'
import type { RuneType } from '@/game/rules'
import { bucketFor } from '@/use/arenaFx'
import { suspendEmit } from '@/use/useVfx'
import { RUNE_FX } from './index'
import { SCENARIOS, build } from './scenarios'
import { intercepted, ownerOf, type FxApi, type RuneEvent } from './types'

/**
 * ─── The warm-up: bake every effect's light before it is needed ─────────────
 *
 * Each rune module bakes its sprites (glows, rings, shards, smoke…) the FIRST
 * time its effect plays — and the first time is the frame the player is
 * watching: on a 4× throttled CPU a first boulder or aura frame cost 13–27 ms
 * of bakes. So during PLANNING (quiet time) the renderer hands this one rune
 * per idle slice: its FX scenarios (`scenarios.ts`) are played through the
 * module offscreen — a 4 px canvas, the board 100 000 px off to the side, no
 * sound, no shake, no poses and particle emission SUSPENDED — which bakes
 * exactly the sprites the real effect will ask for, at the real tile size.
 *
 * Best effort: anything it misses bakes on first use, as before.
 */

const done = new Set<string>()
const STEPS = [0, 0.06, 0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.35]
const OFF = -100_000

/** Warm `type` for a tile of `size` px at `tier`. Returns false when there was nothing to do. */
export const warmRune = (type: RuneType, size: number, tier: 0 | 1 | 2, mul: number): boolean => {
  const key = `${type}|${bucketFor(size)}|${tier}`
  if (done.has(key)) return false
  done.add(key)
  let ctx: CanvasRenderingContext2D | null = null
  try {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 4
    ctx = c.getContext('2d')
  } catch { ctx = null }
  if (!ctx) return false
  const api: FxApi = {
    ctx, size, tier, mul, canEmit: true, now: 0,
    board: { x: OFF, y: OFF, w: size * 4, h: size * 4 },
    scratch: Array.from({ length: 24 }, () => ({ x: 0, y: 0 })),
    cx: (col) => OFF + col * size + size / 2,
    cy: (_c, row) => OFF + row * size + size / 2,
    pose: () => undefined,
    flash: () => undefined,
    shake: () => undefined,
    sound: () => undefined,
    sideColor: (side) => (side === 'player' ? '#7fd0ff' : '#ff5a5a'),
    stoneOf: () => '#8a8f9c',
    inkOf: () => '#1b1206',
    art: (kind, id) => spriteFor(kind, id)
  }
  suspendEmit(true)
  try {
    for (const sc of SCENARIOS) {
      if (sc.rune !== type) continue
      const { events } = build(sc)
      for (const e of events) {
        const owner = ownerOf(e)
        if (!owner) continue
        const mod = RUNE_FX[owner]
        const re = e as RuneEvent
        const ia = mod.impactAt?.(re) ?? 0.5
        const wall = e.kind === 'shot' && intercepted(e)
        const last = e.kind === 'shot' ? e.path[e.path.length - 1] : undefined
        const wx = last ? api.cx(last.col, last.row) : OFF
        const wy = last ? api.cy(last.col, last.row) : OFF
        mod.start?.(re, api)
        let hit = false
        for (const p of STEPS) {
          if (!hit && p >= ia) {
            hit = true
            if ('hits' in e) {
              for (const h of e.hits) {
                if (h.absorbed > 0 || h.amount === 0) RUNE_FX.defense.absorb?.(h, api.cx(h.target.col, h.target.row), api.cy(h.target.col, h.target.row), api)
              }
            }
            if (wall && e.kind === 'shot') RUNE_FX.defense.interceptImpact?.(e, wx, wy, api)
            mod.impact?.(re, api)
          }
          mod.paint?.(re, p, api)
          if (wall && e.kind === 'shot' && p >= ia) RUNE_FX.defense.interceptPaint?.(e, Math.min(1, (p - ia) / Math.max(1e-6, 1 - ia)), wx, wy, api)
        }
      }
    }
  } catch {
    // Warming is best-effort: whatever it could not bake bakes on first use.
  } finally {
    // After the bursts a module deferred to a microtask (the shield parks its
    // dome) — those must not spawn either.
    queueMicrotask(() => suspendEmit(false))
  }
  return true
}

/** Test seam: forget what has been warmed. */
export const __resetWarm = (): void => { done.clear() }
