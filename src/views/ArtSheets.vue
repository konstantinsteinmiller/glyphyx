<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  CELL, SINGLE_SIZE, SHEETS, WALKS, SCENERY, SINGLES, sheetRows, sheetSize, sheetTarget, promptDocs,
  type CellArt, type Fit, type FitMap, type SheetCell, type SheetSpec, type SingleSpec, type WalkSpec, type SceneryAsset
} from '@/game/artSheet'
import { SKINS, type GlyphStyle } from '@/game/rules'
import {
  paintPebble, paintGlyph, paintTile, paintBoardFrame, paintForge, paintRerollChip, paintLaurel, paintSky, paintRidge, paintBolt,
  paintCounterPlate, paintRibbon
} from '@/use/arenaPainters'
import { RIBBON_PLATE } from '@/game/artCatalogue'
import { prependBaseUrl } from '@/utils/function'

/**
 * `/art-sheets` — the contact-sheet bench. Dev only; see the router.
 *
 * Glyphyx has no art folder for its stones: every rune, tile and chip is a few
 * hundred canvas operations in `arenaPainters.ts`, which is exactly what you
 * want in a bundle and exactly what you cannot hand to somebody who paints.
 * This screen bakes the whole cast onto the lattice described in
 * `artSheet.ts` and writes the sheets into `art-sheets/` through a dev-only
 * endpoint, so the art can go out to be repainted and come back as drop-in
 * bitmaps.
 *
 * THREE RULES, and they are all about the return trip.
 *
 *   1. Every panel is clipped to its exact rect. One glow bleeding into the
 *      neighbouring panel and the whole sheet has to be sliced by hand.
 *   2. Nothing is written inside a panel. Captions live on the key sheet,
 *      rendered from the same manifest — text inside a panel is text an
 *      image model will faithfully repaint as art.
 *   3. It paints through the GAME'S OWN painters, never lookalikes, so a
 *      painted return is registered against exactly the drawing it replaces.
 *
 * Until the painters land (`arenaPainters.ts` ships as a stub that throws)
 * every such panel draws a neutral STUB and the bar says so: the sheets still
 * export, the lattice and the prompts are right, only the pictures — and the
 * measured fits — are placeholders to be re-exported later.
 */

const previews = ref<{ id: string; title: string; url: string; dims: string }[]>([])
const status = ref('')
const busy = ref(false)
const includeSingles = ref(false)
const stubbed = ref(0)

/** Existing bitmaps referenced by the manifest, decoded once. */
const bitmaps = new Map<string, HTMLImageElement>()

const loadBitmaps = async (): Promise<void> => {
  const srcs = new Set<string>()
  for (const s of SHEETS) for (const c of s.cells) if (c.art.kind === 'bitmap') srcs.add(c.art.src)
  for (const w of WALKS) srcs.add(w.src)
  // The backdrop layers are painted now, not restyled from a shipped bitmap,
  // so scenery contributes a source only if one of them ever goes back to a
  // `bitmap` reference.
  for (const a of SCENERY) if (a.art.kind === 'bitmap') srcs.add(a.art.src)
  await Promise.all([...srcs].filter((src) => !bitmaps.has(src)).map((src) => new Promise<void>((done) => {
    const img = new Image()
    img.addEventListener('load', () => { bitmaps.set(src, img); done() }, { once: true })
    // A missing bitmap is not worth failing the export over — the panel comes
    // out empty and the key sheet still names it.
    img.addEventListener('error', () => done(), { once: true })
    img.src = prependBaseUrl(src)
  })))
}

// ─── Painting one panel ─────────────────────────────────────────────────────

/** What a panel shows while the real painter is still a stub: a flat disc, unmistakably not art. */
const paintStub = (ctx: CanvasRenderingContext2D, w: number, h: number): void => {
  ctx.save()
  ctx.fillStyle = 'rgba(120,120,130,0.85)'
  ctx.beginPath()
  ctx.ellipse(w / 2, h / 2, w * 0.36, h * 0.34, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  stubbed.value++
}

/** A bitmap letterboxed into the box, centred, proportions kept. */
const paintBitmap = (ctx: CanvasRenderingContext2D, src: string, w: number, h: number): void => {
  const img = bitmaps.get(src)
  if (!img?.naturalWidth) return
  const k = Math.min(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * k, dh = img.naturalHeight * k
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

/** The rune's own neon, when a skin has no glow colour of its own. */
const glowFor = (art: Extract<CellArt, { kind: 'glyph' }>): string =>
  SKINS[art.skin].glow ?? '#ffffff'

/** Draw a panel's art into (0, 0, w, h). Never throws: a stub stands in for a painter that does. */
const paintCell = (ctx: CanvasRenderingContext2D, art: CellArt, w: number, h: number): void => {
  if (art.kind === 'blank') return
  if (art.kind === 'bitmap') { paintBitmap(ctx, art.src, w, h); return }
  try {
    ctx.save()
    switch (art.kind) {
      case 'pebble':
        // `laurel: false` — the wreath is its own panel on the laurel sheet and
        // its own layer in play. A stone reference that wore one would be repainted
        // with one, and the game would lay a second wreath over that.
        paintPebble(ctx, w, h, {
          type: art.type, level: art.level, owner: art.owner, faction: art.faction ?? null,
          skin: SKINS[art.skin], pulse: 0.5, laurel: false
        })
        break
      case 'bolt':
        paintBolt(ctx, w, h)
        break
      case 'sky':
        paintSky(ctx, w, h)
        break
      case 'ridge':
        paintRidge(ctx, w, h, art.layer)
        break
      case 'laurel':
        paintLaurel(ctx, w, h, art.type)
        break
      case 'glyph': {
        const skin = SKINS[art.skin]
        const style: GlyphStyle = skin.glyph
        paintGlyph(ctx, w, h, art.type, style, skin.ink, glowFor(art))
        break
      }
      case 'tile':
        paintTile(ctx, w, h, { owner: art.owner, faction: art.faction ?? null })
        break
      case 'frame':
        paintBoardFrame(ctx, w, h)
        break
      case 'forge':
        paintForge(ctx, w, h)
        break
      case 'reroll':
        paintRerollChip(ctx, w, h)
        break
      case 'counter': {
        // The plaque is drawn at the proportions the GAME uses (~2.3:1),
        // centred in its 2:1 panel rather than stretched to fill it. The slicer
        // keys the magenta away and trims to the plate's own edges, so the
        // returned file carries those proportions instead of the panel's.
        const pw = Math.min(w, h * 2.27)
        const ph = pw / 2.27
        ctx.save()
        ctx.translate((w - pw) / 2, (h - ph) / 2)
        paintCounterPlate(ctx, pw, ph, art.side)
        ctx.restore()
        break
      }
      case 'ribbon': {
        // Letterboxed like the plaque: drawn at the plate's own proportions
        // (`RIBBON_PLATE`), centred in its 3:1 panel, so the slice restores
        // the shape the result screen's 9-slice cuts.
        const ratio = RIBBON_PLATE.w / RIBBON_PLATE.h
        const pw = Math.min(w, h * ratio)
        const ph = pw / ratio
        ctx.save()
        ctx.translate((w - pw) / 2, (h - ph) / 2)
        paintRibbon(ctx, pw, ph)
        ctx.restore()
        break
      }
      case 'spark': {
        // The beam's spark has no painter of its own — it is a few pooled
        // particles in `useVfx` — so the reference is a stand-in the prompt
        // describes in words: a bright star with a short trail, flying right.
        const cx = w * 0.55, cy = h / 2, r = w * 0.09
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2)
        g.addColorStop(0, '#ffffff')
        g.addColorStop(0.35, '#d9b8ff')
        g.addColorStop(1, 'rgba(181,123,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(181,123,255,0.8)'
        ctx.lineWidth = r * 0.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(cx - r * 4.5, cy)
        ctx.lineTo(cx - r * 0.8, cy)
        ctx.stroke()
        break
      }
    }
    ctx.restore()
  } catch {
    ctx.restore()
    paintStub(ctx, w, h)
  }
}

// ─── Sheets ─────────────────────────────────────────────────────────────────

const MAGENTA = '#ff00ff'

/** The clean sheet: magenta ground, every panel clipped to its rect. `transparent` for measuring. */
const renderSheet = (spec: SheetSpec, transparent = false): HTMLCanvasElement => {
  const { w, h } = sheetSize(spec)
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')!
  if (!transparent) {
    ctx.fillStyle = MAGENTA
    ctx.fillRect(0, 0, w, h)
  }
  for (const cell of spec.cells) {
    const x = cell.col * CELL, y = cell.row * CELL
    const cw = cell.cw * CELL, ch = cell.ch * CELL
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cw, ch)
    ctx.clip()
    ctx.translate(x, y)
    paintCell(ctx, cell.art, cw, ch)
    ctx.restore()
  }
  return cv
}

/**
 * Alpha floor for the fit measurement. Deliberately high: a soft glow is
 * light, not extent, and letting a halo into the bounding box is how a fitted
 * stone ends up a fraction of the size it should be. The slicer measures a
 * return at the same floor, or the two disagree about what the subject is.
 */
const FIT_ALPHA = 140

/** Solid-pixel bbox of one rect of a canvas, in that rect's own pixels. */
const solidBox = (
  cv: HTMLCanvasElement, ox: number, oy: number, W: number, H: number
): { x0: number; y0: number; x1: number; y1: number } | null => {
  const d = cv.getContext('2d')!.getImageData(ox, oy, W, H).data
  let x0 = W, y0 = H, x1 = -1, y1 = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (d[(y * W + x) * 4 + 3]! <= FIT_ALPHA) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 }
}

/** Where each panel's drawing sits inside its rect, measured on a TRANSPARENT render. */
const measureFits = (spec: SheetSpec): FitMap => {
  const probe = renderSheet(spec, true)
  const fits: FitMap = {}
  for (const cell of spec.cells) {
    if (!cell.target) continue
    const W = cell.cw * CELL, H = cell.ch * CELL
    const b = solidBox(probe, cell.col * CELL, cell.row * CELL, W, H)
    if (!b) continue
    fits[cell.id] = {
      w: (b.x1 - b.x0 + 1) / W,
      h: (b.y1 - b.y0 + 1) / H,
      cx: ((b.x0 + b.x1 + 1) / 2) / W,
      cy: ((b.y0 + b.y1 + 1) / 2) / H
    }
  }
  return fits
}

/** The human half of the pair: same lattice, art knocked back, captions over it. */
const renderKey = (spec: SheetSpec): HTMLCanvasElement => {
  const { w, h } = sheetSize(spec)
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#11151c'
  ctx.fillRect(0, 0, w, h)

  for (const cell of spec.cells) {
    const x = cell.col * CELL, y = cell.row * CELL
    const cw = cell.cw * CELL, ch = cell.ch * CELL
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cw, ch)
    ctx.clip()
    ctx.translate(x, y)
    ctx.globalAlpha = 0.45
    paintCell(ctx, cell.art, cw, ch)
    ctx.restore()

    const blank = cell.art.kind === 'blank'
    ctx.save()
    ctx.strokeStyle = cell.target ? 'rgba(120,224,255,0.8)' : 'rgba(255,255,255,0.2)'
    ctx.lineWidth = cell.target ? 3 : 1
    if (blank) ctx.setLineDash([8, 8])
    ctx.strokeRect(x + 1.5, y + 1.5, cw - 3, ch - 3)
    ctx.restore()

    ctx.fillStyle = 'rgba(6,9,14,0.82)'
    ctx.fillRect(x, y + ch - 48, cw, 48)
    ctx.fillStyle = '#eef4fb'
    ctx.font = '700 19px ui-sans-serif, system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(blank ? 'blank' : cell.label, x + 8, y + ch - 27, cw - 16)
    ctx.fillStyle = cell.target ? '#7fe0ff' : '#8e9aa8'
    ctx.font = '500 15px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(blank ? 'leave magenta' : `${cell.sub}${cell.fill ? ' · fills panel' : ''}`, x + 8, y + ch - 8, cw - 16)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '600 14px ui-monospace, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`c${cell.col} r${cell.row}`, x + cw - 8, y + 22)
    ctx.textAlign = 'left'
  }
  return cv
}

// ─── Walks and scenery: the bitmaps that already ship, laid out for a restyle ─

/** The slicer's fit format for a strip: folded into ONE panel. */
interface WalkFit { h: number; w: number; bottom: number; cx: number }
const walkFits = new Map<string, WalkFit>()

const renderWalk = (walk: WalkSpec, transparent = false): HTMLCanvasElement => {
  const cv = document.createElement('canvas')
  cv.width = walk.w
  cv.height = walk.h
  const ctx = cv.getContext('2d')!
  if (!transparent) {
    ctx.fillStyle = MAGENTA
    ctx.fillRect(0, 0, walk.w, walk.h)
  }
  const img = bitmaps.get(walk.src)
  if (img?.naturalWidth) {
    // The strip's own panel count, read off its shape — the same rule the
    // runtime uses — so a strip of six frames lays out as six.
    const n = Math.max(1, Math.round(img.naturalWidth / (img.naturalHeight * (walk.panelW / walk.panelH))))
    const fw = img.naturalWidth / n, fh = img.naturalHeight
    for (let i = 0; i < walk.frames; i++) {
      const src = i % n
      const x = (i % walk.cols) * walk.panelW, y = Math.floor(i / walk.cols) * walk.panelH
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, walk.panelW, walk.panelH)
      ctx.clip()
      ctx.drawImage(img, src * fw, 0, fw, fh, x, y, walk.panelW, walk.panelH)
      ctx.restore()
    }
  }
  return cv
}

const measureWalk = (walk: WalkSpec): void => {
  const probe = renderWalk(walk, true)
  const w = walk.panelW, h = walk.panelH
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let i = 0; i < walk.frames; i++) {
    const b = solidBox(probe, (i % walk.cols) * w, Math.floor(i / walk.cols) * h, w, h)
    if (!b) continue
    if (b.x0 < x0) x0 = b.x0
    if (b.y0 < y0) y0 = b.y0
    if (b.x1 > x1) x1 = b.x1
    if (b.y1 > y1) y1 = b.y1
  }
  if (x1 >= 0) {
    walkFits.set(`${walk.kind}/${walk.id}`, {
      h: (y1 - y0 + 1) / h, w: (x1 - x0 + 1) / w, bottom: (y1 + 1) / h, cx: ((x0 + x1) / 2) / w
    })
  }
}

/**
 * One backdrop layer. A BAND is drawn over magenta — its sky is keyed out in
 * play — while the sky itself is opaque by contract and covers the key colour
 * completely, which is exactly what `bg: 'opaque'` tells the slicer to expect.
 */
const renderScenery = (a: SceneryAsset): HTMLCanvasElement => {
  const cv = document.createElement('canvas')
  cv.width = a.w
  cv.height = a.h
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = MAGENTA
  ctx.fillRect(0, 0, a.w, a.h)
  paintCell(ctx, a.art, a.w, a.h)
  return cv
}

/** One object, one image, no lattice — the sturdy route. */
const renderSingle = (t: SingleSpec): HTMLCanvasElement => {
  const cv = document.createElement('canvas')
  cv.width = SINGLE_SIZE
  cv.height = SINGLE_SIZE
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = MAGENTA
  ctx.fillRect(0, 0, SINGLE_SIZE, SINGLE_SIZE)
  // A wide panel (the ribbon) keeps its proportions inside the square.
  const cell = t.cell
  const boxW = SINGLE_SIZE, boxH = Math.round(SINGLE_SIZE * (cell.ch / cell.cw))
  ctx.save()
  ctx.translate(0, (SINGLE_SIZE - boxH) / 2)
  ctx.beginPath()
  ctx.rect(0, 0, boxW, boxH)
  ctx.clip()
  paintCell(ctx, cell.art, boxW, boxH)
  ctx.restore()
  return cv
}

// ─── The index ──────────────────────────────────────────────────────────────

const nativeSize = (src: string): { w: number; h: number } | undefined => {
  const img = bitmaps.get(src)
  return img?.naturalWidth ? { w: img.naturalWidth, h: img.naturalHeight } : undefined
}

// `target` is passed EXPLICITLY by both callers, and must not have a default.
// A sheet passes `sheetTarget(c)`, which is `undefined` for a `singleOnly`
// cell — and a JS default parameter fires on an explicit `undefined`, so the
// cell got its own target back and the index told the slicer to cut the
// ribbon out of the UI sheet after all. That is the one thing `singleOnly`
// exists to prevent, and `artSheet.test.ts` is what noticed.
const cellEntry = (c: SheetCell, fits: FitMap, x: number, y: number, w: number, h: number, target: string | undefined) => ({
  id: c.id,
  label: c.label,
  variant: c.sub,
  x, y, w, h,
  ...(target ? { target } : {}),
  ...(c.fill ? { fill: true } : {}),
  ...(c.maxEdge ? { maxEdge: c.maxEdge } : {}),
  // A panel holding an EXISTING bitmap was letterboxed to fit — the ribbon is
  // 2.3:1, the scorch 1.8:1. Without its true size the slicer would write a
  // padded rect back over the file and wreck the result screen; with it, it
  // trims the margin and restores the shape.
  ...(c.letterboxed ? { letterboxed: c.letterboxed } : c.art.kind === 'bitmap' && nativeSize(c.art.src) ? { letterboxed: nativeSize(c.art.src) } : {}),
  // Where the drawing sits in its panel. The slicer normalises a returned
  // panel onto this, so a stone painted twice its size lands at the size the
  // renderer blits.
  ...(fits[c.id] ? { fit: fits[c.id] } : {}),
  ...(c.art.kind === 'blank' ? { blank: true } : {}),
  ...(c.note ? { note: c.note } : {})
})

const buildIndex = (fits: FitMap) => ({
  generated: new Date().toISOString(),
  cell: CELL,
  note: 'Rects are in clean-sheet pixels. `target` is the path under public/ a repainted slice belongs at; '
    + '`fit` is the drawn content\'s box as fractions of its panel (solid pixels, alpha > 140); '
    + '`fill` marks a panel the art fills edge to edge.',
  sheets: SHEETS.map((s) => {
    const { w, h } = sheetSize(s)
    return {
      id: s.id,
      title: s.title,
      kind: s.kind,
      brief: s.brief,
      files: { clean: `${s.file}.png`, key: `${s.file}-key.png` },
      cols: s.cols,
      rows: sheetRows(s),
      width: w,
      height: h,
      cells: s.cells.map((c) => cellEntry(c, fits, c.col * CELL, c.row * CELL, c.cw * CELL, c.ch * CELL, sheetTarget(c))),
      singles: SINGLES.filter((t) => t.sheet === s.id).map((t) => {
        const boxH = Math.round(SINGLE_SIZE * (t.cell.ch / t.cell.cw))
        return {
          id: t.id,
          file: `singles/${t.file}.png`,
          width: SINGLE_SIZE,
          height: SINGLE_SIZE,
          cells: [cellEntry(t.cell, fits, 0, (SINGLE_SIZE - boxH) / 2, SINGLE_SIZE, boxH, t.cell.target)]
        }
      })
    }
  }),
  walks: WALKS.map((w) => ({
    id: w.id,
    kind: w.kind,
    file: `${w.file}.png`,
    width: w.w,
    height: w.h,
    cols: w.cols,
    rows: w.rows,
    frames: w.frames,
    panel: { w: w.panelW, h: w.panelH },
    ...(walkFits.has(`${w.kind}/${w.id}`) ? { fit: walkFits.get(`${w.kind}/${w.id}`) } : {}),
    faces: w.faces,
    anchor: w.anchor,
    target: w.target
  })),
  scenery: SCENERY.map((a) => ({
    id: a.id,
    file: `${a.file}.png`,
    width: a.w,
    height: a.h,
    tileable: a.tileable,
    bg: a.bg,
    target: a.target
  }))
})

// ─── Export ─────────────────────────────────────────────────────────────────

const save = async (name: string, payload: { dataUrl?: string; text?: string }): Promise<void> => {
  const res = await fetch('/__art/save-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...payload })
  })
  if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`)
}

const frame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()))

const preview = async (): Promise<void> => {
  await loadBitmaps()
  stubbed.value = 0
  const out: typeof previews.value = []
  for (const s of SHEETS) {
    const cv = renderSheet(s)
    const { w, h } = sheetSize(s)
    out.push({ id: s.id, title: s.title, url: cv.toDataURL('image/png'), dims: `${w}x${h} · ${s.cols}x${sheetRows(s)} panels · ${s.cells.length} cells` })
  }
  for (const w of WALKS) {
    out.push({ id: w.id, title: w.name, url: renderWalk(w).toDataURL('image/png'), dims: `${w.w}x${w.h} · ${w.cols}x${w.rows} panels` })
  }
  for (const a of SCENERY) {
    out.push({ id: a.id, title: a.name, url: renderScenery(a).toDataURL('image/png'), dims: `${a.w}x${a.h} band` })
  }
  previews.value = out
}

const exportAll = async (): Promise<void> => {
  busy.value = true
  let files = 0
  try {
    await loadBitmaps()
    stubbed.value = 0
    const fits: FitMap = {}
    for (const s of SHEETS) {
      status.value = `rendering ${s.file}`
      await frame()
      Object.assign(fits, measureFits(s))
      await save(`${s.file}.png`, { dataUrl: renderSheet(s).toDataURL('image/png') })
      await save(`${s.file}-key.png`, { dataUrl: renderKey(s).toDataURL('image/png') })
      files += 2
    }
    for (const w of WALKS) {
      status.value = `rendering ${w.file}`
      await frame()
      measureWalk(w)
      await save(`${w.file}.png`, { dataUrl: renderWalk(w).toDataURL('image/png') })
      files++
    }
    for (const a of SCENERY) {
      status.value = `rendering ${a.file}`
      await frame()
      await save(`${a.file}.png`, { dataUrl: renderScenery(a).toDataURL('image/png') })
      files++
    }
    if (includeSingles.value) {
      for (const t of SINGLES) {
        status.value = `rendering ${t.file}`
        await frame()
        await save(`singles/${t.file}.png`, { dataUrl: renderSingle(t).toDataURL('image/png') })
        files++
      }
    }
    const docs = promptDocs(fits)
    for (const [name, text] of Object.entries(docs)) {
      await save(name, { text })
      files++
    }
    await save('sheet-index.json', { text: `${JSON.stringify(buildIndex(fits), null, 2)}\n` })
    files++
    status.value = `wrote ${files} files to art-sheets/`
      + (stubbed.value ? ` — ${stubbed.value} panels drew the STUB painter; re-export once arenaPainters lands` : '')
  } catch (e) {
    status.value = `FAILED — ${(e as Error).message}`
  } finally {
    busy.value = false
  }
}

onMounted(preview)
</script>

<template lang="pug">
  .art-sheets
    header.bar
      h1 Art sheets
      button(:disabled="busy" @click="exportAll") Export all sheets
      label.tick
        input(type="checkbox" v-model="includeSingles" :disabled="busy")
        |  singles (one object per file)
      span.status {{ status }}
      span.stub(v-if="stubbed") {{ stubbed }} panels are STUBS — arenaPainters is not implemented yet
      span.hint
        | Clean sheets go to a painter with the matching block from art-sheets/PROMPTS-*.md; the key sheet carries the captions.
    .grid
      figure(v-for="p in previews" :key="p.id")
        img(:src="p.url" :alt="p.title" draggable="false")
        figcaption
          strong {{ p.title }}
          span {{ p.dims }}
</template>

<style scoped lang="sass">
.art-sheets
  // The app shell is a fixed-height, overflow-hidden game screen, so this
  // does its own scrolling or the last sheet is unreachable.
  height: 100vh
  overflow-y: auto
  background: #0d1117
  color: #c7d0dd
  font: 13px system-ui, sans-serif

.bar
  position: sticky
  top: 0
  z-index: 2
  display: flex
  flex-wrap: wrap
  gap: 0.75rem
  align-items: center
  padding: 0.6rem 1.5rem
  background: #10141b
  border-bottom: 1px solid #222a36

  h1
    margin: 0
    font-size: 1rem
    font-weight: 700

  button
    padding: 0.3rem 0.8rem
    border: 1px solid #2f7d9e
    border-radius: 6px
    background: #16323d
    color: #cfe4ff
    cursor: pointer
    &:disabled
      opacity: 0.5
      cursor: wait

  .status
    color: #7fe0ff
  .stub
    color: #ffb060
  .hint
    margin-left: auto
    color: #5f6b7e

.grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 30rem), 1fr))
  gap: 1.25rem
  padding: 1.25rem 1.5rem 3rem

figure
  margin: 0
  img
    display: block
    width: 100%
    height: auto
    border: 1px solid #242c36
    // A checker, so a magenta ground is visibly the ground and a transparent
    // panel is visibly transparent.
    background-color: #1a2029
    background-image: linear-gradient(45deg, #232b35 25%, transparent 25%), linear-gradient(-45deg, #232b35 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #232b35 75%), linear-gradient(-45deg, transparent 75%, #232b35 75%)
    background-size: 16px 16px
    background-position: 0 0, 0 8px, 8px -8px, -8px 0
  figcaption
    display: flex
    justify-content: space-between
    gap: 0.5rem
    padding: 0.35rem 0.1rem
    span
      color: #5f6b7e
</style>
