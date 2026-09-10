import { watch } from 'vue'
import { renderScaleTier, type QualityTier } from '@/use/useVfx'

/**
 * ─── HUD motion budget ──────────────────────────────────────────────────────
 *
 * Stamps `perf-lite` on `<body>` once the quality ladder has settled on a tier
 * that cannot afford decorative motion, and takes it off again if the device
 * earns its way back up.
 *
 * ── Why this exists ──
 *
 * The DOM HUD sits over a canvas that repaints every frame, and seven infinite
 * CSS animations run through ordinary play. Measured at 4x CPU throttle over
 * 16 s captures, they cost ~994 ms of style recalculation, ~891 ms of
 * layerization and ~729 ms of paint — roughly 17 % of a core, permanently, on
 * top of everything the renderer does. None of it appears in `window.__perf`,
 * because none of it happens inside the RAF callback.
 *
 * ── Why the fix is "fewer animations" and not something cleverer ──
 *
 * Five remedies were measured against each other (`PERF-LEDGER.md`):
 * removing `filter`, removing `backdrop-filter`, removing `box-shadow`, and
 * promoting every animating element with `will-change: transform, opacity`.
 * NONE of them moved the numbers. Only removing the animations did, and it
 * removed ~99 % of the cost. Blink recalculates style for an animating element
 * every frame whether or not the property it animates is compositable, so
 * there is no free version of this — only a cheaper one.
 *
 * That makes it a fidelity decision, so it is spent where fidelity is already
 * being spent: the same ladder that has, by this point, also cut the canvas
 * DPR and switched the mote field off. A device holding `high` or `medium`
 * keeps every animation.
 */
const LITE_TIERS: ReadonlySet<QualityTier> = new Set<QualityTier>(['low', 'min'])

export const useHudMotion = (): void => {
  if (typeof document === 'undefined') return
  const apply = (tier: QualityTier): void => {
    document.body.classList.toggle('perf-lite', LITE_TIERS.has(tier))
  }
  // `renderScaleTier` is the SETTLED tier, not the twitchy live one: it only
  // moves after the live tier has sat at a lower rung, which is exactly the
  // hysteresis this wants. Toggling a body class on every tier wobble would
  // itself be a style recalculation of the whole document.
  watch(renderScaleTier, apply, { immediate: true })
}
