<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SKINS, STARTING_SKIN, type Faction, type RuneType, type SkinId } from '@/game/rules'
import { paintPebble } from '@/use/arenaPainters'

/**
 * A rune stone for the DOM: the shop, the unlock card, the campaign map.
 *
 * It paints through the SAME painter the field bakes its sprites from
 * (`arenaPainters.paintPebble`), so the stone a player buys is the stone they
 * place. The canvas fills its parent's width and keeps square; it is sized by
 * a ResizeObserver, never by a pixel prop, and repaints at the device's DPR.
 * `animated` breathes the glyph's glow on a RAF loop — only while mounted, and
 * meant for ONE hero preview, not a grid of thirty.
 */
interface Props {
  type: RuneType
  /** Which stone the rune is cut into; defaults to the starting skin. */
  skin?: SkinId
  level?: number
  /** `enemy` wears the rust-red enemy stone whatever `skin` says. */
  owner?: 'player' | 'enemy'
  faction?: Faction | null
  /** Draw the glyph alone, no stone (for icons). */
  glyphOnly?: boolean
  /** Idle breathing glow. Off by default: a shop grid of breathing stones costs frames. */
  animated?: boolean
  /** The Lv 2 crest's caption — pass the localised "Lv.2" for parity with the field; bare crest without. */
  label?: string
}
const props = withDefaults(defineProps<Props>(), {
  skin: STARTING_SKIN, level: 1, owner: 'player', faction: null, glyphOnly: false, animated: false, label: undefined
})

const canvas = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null
let raf = 0
let cssSize = 0

const paint = (pulse: number): void => {
  const el = canvas.value
  if (!el || cssSize <= 0) return
  const dpr = Math.min(2, Math.max(1, (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1))
  const px = Math.max(1, Math.round(cssSize * dpr))
  if (el.width !== px || el.height !== px) { el.width = px; el.height = px }
  let ctx: CanvasRenderingContext2D | null = null
  try { ctx = el.getContext('2d') } catch { ctx = null }
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssSize, cssSize)
  paintPebble(ctx, cssSize, cssSize, {
    type: props.type, level: props.level, owner: props.owner, faction: props.faction,
    skin: SKINS[props.skin] ?? SKINS.river, glyphOnly: props.glyphOnly, pulse, label: props.label
  })
}

const measure = (): void => {
  const el = canvas.value
  if (!el) return
  const w = el.clientWidth || el.parentElement?.clientWidth || 0
  cssSize = Math.max(0, Math.round(w))
  paint(0.5)
}

const loop = (t: number): void => {
  paint(0.5 + 0.5 * Math.sin(t * 0.0025))
  raf = requestAnimationFrame(loop)
}
const startLoop = (): void => { if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(loop) }
const stopLoop = (): void => { if (raf) cancelAnimationFrame(raf); raf = 0 }

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && canvas.value) {
    observer = new ResizeObserver(measure)
    observer.observe(canvas.value)
  }
  if (props.animated) startLoop()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  stopLoop()
})
watch(
  () => [props.type, props.skin, props.level, props.owner, props.faction, props.glyphOnly, props.label],
  () => paint(0.5)
)
watch(() => props.animated, (on) => {
  if (on) startLoop()
  else { stopLoop(); paint(0.5) }
})
</script>

<template lang="pug">
  //- Fluid: fills its parent's width and keeps square; never sized in px, never 0 (see min-width).
  canvas.pebble-preview(
    ref="canvas"
    draggable="false"
    aria-hidden="true"
    :data-type="type"
    :data-skin="skin"
    :data-level="level"
  )
  //- The caption is PAINTED into the canvas ("Lv 3" on a power rune), which
  //- means a screen reader never gets it and a reader who has scaled their
  //- text up never sees it grow. The same string, once more, as real text
  //- that only assistive tech reads — the drawing stays the drawing.
  span.pebble-preview__label(v-if="label") {{ label }}
</template>

<style scoped lang="sass">
// Read aloud, never seen: the painted caption's twin.
.pebble-preview__label
  position: absolute
  width: 1px
  height: 1px
  margin: -1px
  padding: 0
  border: 0
  overflow: hidden
  clip-path: inset(50%)
  white-space: nowrap

.pebble-preview
  display: block
  width: 100%
  min-width: 1.5rem
  aspect-ratio: 1
  // Not web content: no selection, no callout, no drag image — and clicks fall
  // through to whatever card or button holds it.
  user-select: none
  -webkit-user-select: none
  -webkit-touch-callout: none
  -webkit-user-drag: none
  pointer-events: none
</style>
