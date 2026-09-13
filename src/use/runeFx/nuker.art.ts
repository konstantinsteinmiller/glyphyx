import { glyphPath } from '@/game/glyphs'
import { bakeSprite, poolSprite, rgba } from './kit'

/**
 * ─── Warhead (`nuker`) — its baked light ────────────────────────────────────
 *
 * Every sprite the warhead blits, baked ONCE under a constant key, so the
 * frame path never builds a key string or a closure. With no 2D context
 * (tests) every getter returns `null` and `nuker.ts` falls back to strokes or
 * draws nothing — never a throw.
 *
 * The look: RADIOACTIVE LIGHT. A lime that is almost yellow at the core and
 * goes toxic green at the fringe, white-hot where it is hottest, and dark ash
 * for everything it leaves behind. The signature shape is the hazard trefoil —
 * the warhead's own glyph — branded across the board by the flash.
 */

/** The warhead's neon — `RUNES.nuker.color`. */
export const LIME = '#e8ff3d'
/** Hotter, paler — the flash's heart. */
export const HOT = '#f7ffc8'
/** The fringe of the light: a toxic green. */
export const TOXIC = '#86ff3a'
/** The deep shade: burnt olive. */
export const DEEP = '#43520a'
/** What is left. */
export const ASH = '#34362f'

type Draw = (t: CanvasRenderingContext2D, s: number) => void
const sprite = (key: string, px: number, draw: Draw) => (): HTMLCanvasElement | null => bakeSprite(key, px, draw)

const radial = (t: CanvasRenderingContext2D, s: number, stops: ReadonlyArray<readonly [number, string]>): void => {
  const g = t.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  for (const [o, c] of stops) g.addColorStop(o, c)
  t.fillStyle = g
  t.fillRect(0, 0, s, s)
}

/** The hazard trefoil — the stone's own glyph — as a brand of light: white at the core, lime blades, a glow round them. */
export const trefoilSprite = sprite('nuker|trefoil', 256, (t, s) => {
  const path = glyphPath('nuker')
  const k = (s * 0.86) / 100
  t.translate(s / 2 - 50 * k, s / 2 - 50 * k)
  t.scale(k, k)
  t.lineJoin = 'round'
  t.strokeStyle = rgba(TOXIC, 0.14)
  t.lineWidth = 11
  t.stroke(path)
  t.strokeStyle = rgba(LIME, 0.3)
  t.lineWidth = 5
  t.stroke(path)
  const g = t.createRadialGradient(50, 50, 0, 50, 50, 50)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.32, rgba(HOT, 0.95))
  g.addColorStop(0.64, rgba(LIME, 0.8))
  g.addColorStop(1, rgba(TOXIC, 0.45))
  t.fillStyle = g
  t.fill(path, 'nonzero')
  t.strokeStyle = rgba(HOT, 0.95)
  t.lineWidth = 1.3
  t.stroke(path)
})

/** The blast front: a shell of light with a razor outer edge and a soft wake behind it. Outer edge = sprite edge. */
export const frontSprite = sprite('nuker|front', 256, (t, s) => radial(t, s, [
  [0, rgba(LIME, 0)], [0.58, rgba(LIME, 0)], [0.8, rgba(TOXIC, 0.16)], [0.9, rgba(LIME, 0.5)],
  [0.955, rgba(HOT, 0.9)], [0.982, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']
]))

/** The flash's light over the board: brightest over ground zero. */
export const flashSprite = sprite('nuker|flash', 192, (t, s) => radial(t, s, [
  [0, 'rgba(255,255,255,0.95)'], [0.1, rgba(HOT, 0.85)], [0.32, rgba(LIME, 0.55)], [0.66, rgba(LIME, 0.2)], [1, rgba(TOXIC, 0)]
]))

/** The fireball's white-hot heart. */
export const coreSprite = sprite('nuker|core', 192, (t, s) => radial(t, s, [
  [0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,255,255,0.95)'], [0.34, rgba(HOT, 0.9)], [0.55, rgba(LIME, 0.5)],
  [0.8, rgba(TOXIC, 0.12)], [1, rgba(TOXIC, 0)]
]))

/** The afterglow: radioactive lime, hanging over ground zero. */
export const glowSprite = sprite('nuker|glow', 128, (t, s) => radial(t, s, [
  [0, rgba(LIME, 0.85)], [0.3, rgba(LIME, 0.42)], [0.65, rgba(TOXIC, 0.12)], [1, rgba(TOXIC, 0)]
]))

/** A tile lighting up as the front crosses it: a lit rim and a soft fill (rounded, like the slate). */
export const tileSprite = sprite('nuker|tile', 128, (t, s) => {
  const i = s * 0.08
  const r = s * 0.13
  const path = (): void => {
    t.beginPath()
    t.moveTo(i + r, i)
    t.arcTo(s - i, i, s - i, s - i, r)
    t.arcTo(s - i, s - i, i, s - i, r)
    t.arcTo(i, s - i, i, i, r)
    t.arcTo(i, i, s - i, i, r)
    t.closePath()
  }
  radial(t, s, [[0, rgba(LIME, 0.28)], [0.7, rgba(LIME, 0.12)], [1, rgba(LIME, 0)]])
  path()
  t.fillStyle = rgba(LIME, 0.14)
  t.fill()
  t.lineJoin = 'round'
  t.strokeStyle = rgba(TOXIC, 0.3)
  t.lineWidth = s * 0.1
  t.stroke()
  t.strokeStyle = rgba(HOT, 0.85)
  t.lineWidth = s * 0.022
  t.stroke()
})

// ─── Particle shapes ────────────────────────────────────────────────────────

const makeMote = (): HTMLCanvasElement | null => bakeSprite('nuker|mote', 32, (t, s) => radial(t, s, [
  [0, 'rgba(255,255,255,1)'], [0.25, rgba(LIME, 0.95)], [0.6, rgba(TOXIC, 0.3)], [1, rgba(TOXIC, 0)]
]))

/** A flake of ash with a lime-lit edge — it is still hot. */
const makeAsh = (): HTMLCanvasElement | null => bakeSprite('nuker|ash', 32, (t, s) => {
  // A thin, torn flake: long and narrow, so it flutters as it turns.
  t.beginPath()
  t.moveTo(s * 0.12, s * 0.5)
  t.lineTo(s * 0.34, s * 0.36)
  t.lineTo(s * 0.62, s * 0.4)
  t.lineTo(s * 0.9, s * 0.3)
  t.lineTo(s * 0.8, s * 0.56)
  t.lineTo(s * 0.5, s * 0.64)
  t.lineTo(s * 0.26, s * 0.62)
  t.closePath()
  t.fillStyle = rgba(ASH, 0.85)
  t.fill()
  // Its burnt edge is still glowing.
  t.strokeStyle = rgba(LIME, 0.7)
  t.lineWidth = s * 0.05
  t.lineJoin = 'round'
  t.beginPath()
  t.moveTo(s * 0.12, s * 0.5)
  t.lineTo(s * 0.34, s * 0.36)
  t.lineTo(s * 0.62, s * 0.4)
  t.lineTo(s * 0.9, s * 0.3)
  t.stroke()
})

export const moteId = (): number => poolSprite('nuker|p|mote', makeMote)
export const ashId = (): number => poolSprite('nuker|p|ash', makeAsh)
