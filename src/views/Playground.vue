<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { FACTION_DEFS, RUNE_TYPES, SKINS, SKIN_IDS, type Faction, type RuneType, type SkinId } from '@/game/rules'
import { setArtOverrides, artOverridesEnabled, spriteFor } from '@/game/art'
import { ART_CATALOGUE } from '@/game/artCatalogue'
import { WALKS } from '@/game/artSheet'
import { stripFrame } from '@/game/spriteStrip'
import { paintPebble, paintTile, paintBoardFrame, paintForge, paintRerollChip, paintLaurel, paintSky, paintRidge, RIDGE_SKYLINE } from '@/use/arenaPainters'

/**
 * ─── Playground ─────────────────────────────────────────────────────────────
 *
 * Every drawable the art pipeline can replace, on one screen, moving.
 *
 * It exists because the alternative is playing the game to look at the art:
 * a Lv 2 ember-skin orb needs a bought skin and a merged stack before anyone
 * can see whether its painting sits where the drawing sat. Every registration
 * bug a pipeline produces — a stone a third too big, a glyph off-centre, a
 * frame whose corners stretch — is visible in one frame once the thing is on
 * screen. Getting it on screen is the expensive part.
 *
 * TWO RULES, and they are what make it worth having:
 *
 *   1. It calls the GAME'S painters, not lookalikes: `paintPebble`, `paintTile`
 *      and the rest are the functions the arena bakes from, and the strips
 *      come through `stripFrame`, the same lookup the enemy badge uses.
 *   2. The art layer flips live. A painted stone is only ever wrong RELATIVE
 *      to the drawing it replaces, and A/B on one button is the diagnosis.
 *
 * THE BLIT CONTRACT the renderer honours and this scene mirrors: a painted
 * stone file is drawn into exactly the box `paintPebble(ctx, w, h)` paints in
 * — same rect, no offset, no scale of its own. The slicer normalises every
 * return onto the drawn extent so that rule can stay that simple.
 *
 * Dev only, and out of every portal build — see the router.
 */

const canvas = ref<HTMLCanvasElement | null>(null)
const painted = ref(artOverridesEnabled())
const outlines = ref(true)
const running = ref(true)

/** One stone box, px. Big enough to judge a glyph, small enough to fit the cast. */
const BOX = 84
const PAD = 14
const LABEL = 14
const FACTIONS = Object.keys(FACTION_DEFS) as Faction[]

let raf = 0
let t0 = 0

const label = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void => {
  ctx.font = `${LABEL - 2}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#8d9bb0'
  ctx.fillText(text, x, y)
}

const heading = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void => {
  ctx.font = '600 13px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#5f6b7e'
  ctx.fillText(text.toUpperCase(), x, y)
}

/** The box a thing is allowed to occupy. Overflow is the commonest fault and it is invisible without something to overflow. */
const cellBox = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void => {
  if (!outlines.value) return
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.setLineDash([4, 4])
  ctx.lineWidth = 1
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))
  ctx.restore()
}

/** What a box shows while the painter it needs is still a stub. */
const stub = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void => {
  ctx.save()
  ctx.fillStyle = 'rgba(120,120,130,0.5)'
  ctx.beginPath()
  ctx.ellipse(x + w / 2, y + h / 2, w * 0.36, h * 0.34, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/** A painting, if the layer is on and it has decoded; otherwise the drawing. Never throws. */
const paintOrDraw = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  probe: () => HTMLImageElement | null, draw: () => void
): void => {
  const img = probe()
  if (img) { ctx.drawImage(img, x, y, w, h); return }
  ctx.save()
  ctx.translate(x, y)
  try { draw() } catch { ctx.restore(); stub(ctx, x, y, w, h); return }
  ctx.restore()
}

/**
 * The Lv 2 wreath, laid over a stone exactly as `bakePebble` lays it: the
 * painted `fx/laurel` when it has decoded, the drawing otherwise. The stones
 * below are painted with `laurel: false` for the same reason the arena does —
 * so what the A/B compares is one wreath over two stones, not two wreaths.
 */
const overlayLaurel = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, type: RuneType = 'melee'): void => {
  const img = spriteFor('fx', `laurel-${type}`)
  if (img) { ctx.drawImage(img, x, y, w, h); return }
  ctx.save()
  ctx.translate(x, y)
  try { paintLaurel(ctx, w, h, type) } catch { /* a stub stone is enough of a signal */ }
  ctx.restore()
}

/** A bitmap-only drawable: the painting or an empty box, since the drawn fallback lives elsewhere (DOM, particles). */
const bitmapOnly = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, img: HTMLImageElement | null): void => {
  if (img) {
    const k = Math.min(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * k, dh = img.naturalHeight * k
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  }
}

const paint = (now: number): void => {
  const cv = canvas.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return
  if (!t0) t0 = now
  const t = running.value ? now - t0 : 0

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const W = cv.clientWidth, H = cv.clientHeight
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#141922'
  ctx.fillRect(0, 0, W, H)

  const pulse = 0.5 + 0.5 * Math.sin(t / 700)
  const step = BOX + PAD
  let y = 30

  // ── The player's stones: every skin × every rune × two levels, breathing ──
  heading(ctx, `stones — ${SKIN_IDS.length} skins, Lv 1 / Lv 2 · ${painted.value ? 'PAINTED' : 'drawn'}`, PAD, y)
  y += 14
  for (const skin of SKIN_IDS) {
    let x = PAD
    for (const type of RUNE_TYPES) {
      for (const level of [1, 2] as const) {
        const id = `${type}-${skin}-lv${level}`
        cellBox(ctx, x, y, BOX, BOX)
        paintOrDraw(ctx, x, y, BOX, BOX,
          () => spriteFor('rune', id),
          () => paintPebble(ctx, BOX, BOX, { type, level, owner: 'player', faction: null, skin: SKINS[skin], pulse, laurel: false }))
        if (level >= 2) overlayLaurel(ctx, x, y, BOX, BOX, type)
        x += step
      }
    }
    label(ctx, skin, PAD + 5 * 2 * step + 30, y + BOX / 2 + 4)
    y += step + 4
  }
  y += 10

  // ── The enemy's stones: four factions × five runes × two levels ──
  heading(ctx, 'enemy stones — four factions', PAD, y)
  y += 14
  for (const faction of FACTIONS) {
    let x = PAD
    for (const type of RUNE_TYPES) {
      for (const level of [1, 2] as const) {
        const id = `${type}-e-${faction}-lv${level}`
        cellBox(ctx, x, y, BOX, BOX)
        paintOrDraw(ctx, x, y, BOX, BOX,
          () => spriteFor('rune', id),
          () => paintPebble(ctx, BOX, BOX, { type, level, owner: 'enemy', faction, skin: SKINS.river, pulse, laurel: false }))
        if (level >= 2) overlayLaurel(ctx, x, y, BOX, BOX)
        x += step
      }
    }
    label(ctx, faction, PAD + 5 * 2 * step + 30, y + BOX / 2 + 4)
    y += step + 4
  }
  y += 10

  // ── Glyph icons, tiles, the frame ──
  heading(ctx, 'glyph icons · tiles · frame', PAD, y)
  y += 14
  {
    let x = PAD
    for (const type of RUNE_TYPES) {
      cellBox(ctx, x, y, BOX, BOX)
      paintOrDraw(ctx, x, y, BOX, BOX,
        () => spriteFor('rune', type),
        () => paintPebble(ctx, BOX, BOX, { type, level: 1, owner: 'player', faction: null, skin: SKINS.river, glyphOnly: true, pulse }))
      label(ctx, type, x + BOX / 2, y + BOX + LABEL)
      x += step
    }
    x += PAD
    for (const owner of ['player', 'enemy', 'neutral'] as const) {
      cellBox(ctx, x, y, BOX, BOX)
      paintOrDraw(ctx, x, y, BOX, BOX,
        () => spriteFor('tile', owner),
        () => paintTile(ctx, BOX, BOX, { owner, faction: owner === 'enemy' ? 'goblin' : null }))
      label(ctx, owner, x + BOX / 2, y + BOX + LABEL)
      x += step
    }
    x += PAD
    const F = BOX * 2 + PAD
    cellBox(ctx, x, y, F, F)
    paintOrDraw(ctx, x, y, F, F, () => spriteFor('tile', 'frame'), () => paintBoardFrame(ctx, F, F))
    label(ctx, 'frame', x + F / 2, y + F + LABEL)
    y += F + LABEL + 16
  }

  // ── HUD chips and effects: painted or nothing, their drawn fallbacks live in the DOM and the particle pool ──
  heading(ctx, 'hud chips · effects — bitmaps (empty box = no painting decoded, the drawn fallback lives outside the canvas)', PAD, y)
  y += 14
  {
    let x = PAD
    cellBox(ctx, x, y, BOX, BOX)
    paintOrDraw(ctx, x, y, BOX, BOX, () => spriteFor('ui', 'forge'), () => paintForge(ctx, BOX, BOX))
    label(ctx, 'forge', x + BOX / 2, y + BOX + LABEL)
    x += step
    cellBox(ctx, x, y, BOX, BOX)
    paintOrDraw(ctx, x, y, BOX, BOX, () => spriteFor('ui', 'reroll'), () => paintRerollChip(ctx, BOX, BOX))
    label(ctx, 'reroll', x + BOX / 2, y + BOX + LABEL)
    x += step
    for (const id of ['chest', 'crown', 'coin'] as const) {
      cellBox(ctx, x, y, BOX, BOX)
      bitmapOnly(ctx, x, y, BOX, BOX, spriteFor('ui', id))
      label(ctx, id, x + BOX / 2, y + BOX + LABEL)
      x += step
    }
    const RW = BOX * 3
    cellBox(ctx, x, y, RW, BOX)
    bitmapOnly(ctx, x, y, RW, BOX, spriteFor('ui', 'ribbon'))
    label(ctx, 'ribbon', x + RW / 2, y + BOX + LABEL)
    y += step + LABEL + 6
    x = PAD
    for (const id of ART_CATALOGUE.fx) {
      cellBox(ctx, x, y, BOX, BOX)
      // The laurel is the one fx with a painter of its own, so it gets the A/B
      // the others cannot have — and it is the layer every Lv 2 stone wears.
      if (id.startsWith('laurel-')) overlayLaurel(ctx, x, y, BOX, BOX, id.slice('laurel-'.length) as RuneType)
      else bitmapOnly(ctx, x, y, BOX, BOX, spriteFor('fx', id))
      label(ctx, id, x + BOX / 2, y + BOX + LABEL)
      x += step
    }
    cellBox(ctx, x, y, BOX, BOX)
    bitmapOnly(ctx, x, y, BOX, BOX, spriteFor('round', 'spark'))
    label(ctx, 'spark', x + BOX / 2, y + BOX + LABEL)
    y += step + LABEL + 10
  }

  // ── Walk cycles, both facings — a strip that is subtly off-centre only shows with the two side by side ──
  heading(ctx, 'commanders and the bolt — one cycle, both facings', PAD, y)
  y += 14
  {
    let x = PAD
    const WB = BOX * 1.4
    for (const w of WALKS) {
      const frame = stripFrame(w.kind, w.id, w.panelW / w.panelH, t / 900)
      for (const dir of [1, -1]) {
        const bw = WB * (w.panelW / w.panelH), bh = WB
        cellBox(ctx, x, y, bw, bh)
        if (frame) {
          ctx.save()
          ctx.translate(x + bw / 2, y)
          ctx.scale(dir, 1)
          ctx.drawImage(frame, -bw / 2, 0, bw, bh)
          ctx.restore()
        }
        label(ctx, dir > 0 ? w.id : `${w.id} ←`, x + bw / 2, y + bh + LABEL)
        x += bw + PAD
      }
    }
    y += WB + LABEL + 12
  }

  // ── The backdrop, stacked the way the arena stacks it ──
  //
  // Sky, then the far band, then the near one, in one box: the layers are only
  // ever wrong in relation to each other — a ridge that floats above its own
  // horizon, or a sky whose moon sits behind a peak — and three separate
  // swatches would show none of that.
  heading(ctx, 'the backdrop — sky, far ridge, near ridge', PAD, y)
  y += 14
  {
    const bw = Math.min(W - PAD * 2, 1024), bh = bw * (9 / 16)
    cellBox(ctx, PAD, y, bw, bh)
    ctx.save()
    ctx.beginPath()
    ctx.rect(PAD, y, bw, bh)
    ctx.clip()
    const sky = spriteFor('bg', 'sky')
    if (sky) ctx.drawImage(sky, PAD, y, bw, bh)
    else {
      ctx.save()
      ctx.translate(PAD, y)
      paintSky(ctx, bw, bh)
      ctx.restore()
    }
    // The bands sit where they sit in play: the far one higher, the near one
    // lower, both 4:1 and both running off the bottom of the box.
    const band = (id: 'ridge-far' | 'ridge-near', layer: 'far' | 'near', top: number, alpha: number): void => {
      const h = bw / 4
      const img = spriteFor('bg', id)
      ctx.globalAlpha = alpha
      if (img) ctx.drawImage(img, PAD, y + top, bw, h)
      else {
        ctx.save()
        ctx.translate(PAD, y + top)
        paintRidge(ctx, bw, h, layer)
        ctx.restore()
      }
      ctx.fillStyle = layer === 'far' ? '#101838' : '#0a0e22'
      ctx.fillRect(PAD, y + top + h - 1, bw, bh - (top + h) + 1)
      ctx.globalAlpha = 1
    }
    // Placed by each band's own skyline, exactly as the arena places them.
    band('ridge-far', 'far', bh * 0.62 - (bw / 4) * RIDGE_SKYLINE.far, 1)
    band('ridge-near', 'near', bh * 0.74 - (bw / 4) * RIDGE_SKYLINE.near, 1)
    ctx.restore()
    label(ctx, 'backdrop', PAD + bw / 2, y + bh + LABEL)
    y += bh + LABEL + 10
  }

  // Grow the canvas to exactly what was drawn. A fixed height either clips the
  // last row or leaves a screen of empty dark under a short cast.
  const need = Math.ceil(y + 40)
  if (Math.abs(cv.clientHeight - need) > 4) cv.style.height = `${need}px`

  raf = requestAnimationFrame(paint)
}

const toggleArt = (): void => {
  // `remember: false` — an A/B look must not leave a flag behind on a machine
  // that will later be used to check a portal build.
  painted.value = setArtOverrides(!painted.value, false)
}

onMounted(() => { raf = requestAnimationFrame(paint) })
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template lang="pug">
  .playground
    header.playground__bar
      strong Playground
      button(:class="{ on: painted }" @click="toggleArt")
        | {{ painted ? 'painted art' : 'drawn art' }}
      button(:class="{ on: outlines }" @click="outlines = !outlines") boxes
      button(:class="{ on: running }" @click="running = !running")
        | {{ running ? 'running' : 'paused' }}
      span.playground__hint
        | Every drawable the pipeline can replace, through the game's own painters. Dashed box = the rect the painting is blitted into.
    canvas.playground__canvas(ref="canvas")
</template>

<style scoped lang="sass">
.playground
  height: 100vh
  overflow: auto
  background: #141922
  color: #c7d0dd

  &__bar
    position: sticky
    top: 0
    left: 0
    z-index: 2
    display: flex
    flex-wrap: wrap
    gap: 0.6rem
    align-items: center
    padding: 0.6rem 1.5rem
    background: #10141b
    border-bottom: 1px solid #222a36
    font: 13px system-ui, sans-serif

    button
      padding: 0.25rem 0.6rem
      border: 1px solid #2b3442
      border-radius: 6px
      background: #1a212b
      color: #8d9bb0
      cursor: pointer
      &.on
        border-color: #3f7fbf
        color: #cfe4ff

  &__hint
    margin-left: auto
    color: #5f6b7e

  &__canvas
    display: block
    width: 100%
    min-width: 62rem
    // Replaced on the first frame by the height the scene actually needs.
    height: 1400px
</style>
