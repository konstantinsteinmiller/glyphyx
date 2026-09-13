/**
 * ─── The loading screen's panning tile ─────────────────────────────────────
 *
 *   pnpm art:splash-tile          → public/images/bg/splash-tile.svg
 *
 * The backdrop behind the Keeper and the logo is a seamless tile that drifts
 * toward the bottom right, the way a Brawl Stars loading screen does: faint
 * line drawings of the game's own things on a dark ground. Here the things
 * are the RUNES — eight of them, each in a different skin, because a rune in
 * a skin is what this game is made of and what its shop sells. No filler
 * doodles, and eight is the cap: past that the tile turns into wallpaper.
 *
 * Nothing is drawn by hand. The stone is `stoneOutline(cut, type, seed)`,
 * seeded exactly as `paintPebble` seeds it, and the glyph is `GLYPH_PATHS`
 * placed by `glyphFit`, so the bow on the loading screen is the bow in the
 * hand tray with its flakes in the same places. Change a rune's profile or a
 * cut and re-run this; the tile follows.
 *
 * What a skin looks like as a LINE is what its cut does to the outline, plus
 * one mark that says the material: the carved stones' raised border, a flake
 * scar on obsidian, cracks through the ember slab, the step cut's table, the
 * cabochon's highlight, the diamond's star points. Each stone is tinted with
 * its skin's own colour, pulled most of the way to one shared ink so the tile
 * reads as one drawing and not as a sticker sheet; the CSS decides how faint
 * the whole thing is (`opacity` on the layer), not this file.
 *
 * Seamless by construction: every stone that crosses an edge is drawn again
 * on the far side through `<use>`, so tile copies meet with no seam.
 *
 * Not part of the app build — the SVG is committed.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { INSET, cutIsFramed, glyphFit, mixHex, pebbleSeed, stoneOutline } from '@/use/arenaPainters'
import { GLYPH_PATHS } from '@/game/glyphs'
import { RUNES, SKINS } from '@/game/rules'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/images/bg/splash-tile.svg')

/** The tile's own units. The CSS shows it at whatever size it likes; it is vector. */
const TILE = 512

/** One ink for everything, which each stone's tint is pulled toward. */
const INK = '#c9d4ff'
/** How far toward `INK` a skin's colour is pulled (0 = pure skin, 1 = pure ink). */
const TINT_PULL = 0.42

/** Stroke widths, in tile units. */
const LINE = { stone: 3.4, detail: 2.2 }

/**
 * The glyph is FILLED, the one solid thing on a tile of lines. It was drawn
 * as a hairline first, and the glyphs are not built for that (`glyphs.ts`:
 * "no strokes, no thin lines, solid mass") — the axe's crescent on a haft came
 * out an umbrella and the bow a tangle of rectangles. Solid, each stone gets
 * one bright mark in the middle, the way the game's glyph glows out of it.
 * Held a touch under the lines' strength so a sword does not outshout its stone.
 */
const GLYPH_ALPHA = 0.8
/** A size up from `glyphFit`: at a sixth of the opacity the orb's rings need the room. */
const GLYPH_BOOST = 1.12

/** The colour a skin is known by — its lit face, or the rim light on the dark ones. */
const SKIN_TINT = {
  river: SKINS.river.hi,
  obsidian: SKINS.obsidian.rim,
  jade: SKINS.jade.hi,
  amber: SKINS.amber.hi,
  marble: SKINS.marble.hi,
  ember: SKINS.ember.rim,
  sapphire: SKINS.sapphire.hi,
  ruby: SKINS.ruby.hi,
  diamond: SKINS.diamond.glow
}

/**
 * The cast. Eight runes and eight skins, no repeats of either, so the tile
 * previews as much of the game as eight stones can. Placed on a sheared
 * lattice (one stone per row AND per column of an 8x8 grid, basis (192, 64)
 * and (64, 192)), which is as far apart as eight points on a torus get, then
 * nudged and turned so the repeat does not read as rows.
 */
const CAST = [
  { type: 'melee', skin: 'river', x: 44, y: 40, r: 50, rot: -14 },
  { type: 'archer', skin: 'obsidian', x: 236, y: 100, r: 50, rot: 12 },
  { type: 'mage', skin: 'jade', x: 420, y: 172, r: 44, rot: -8 },
  { type: 'defense', skin: 'marble', x: 104, y: 236, r: 46, rot: 14 },
  { type: 'support', skin: 'ruby', x: 296, y: 290, r: 42, rot: -18 },
  { type: 'cleave', skin: 'ember', x: 484, y: 360, r: 48, rot: 8 },
  { type: 'bombard', skin: 'sapphire', x: 168, y: 426, r: 46, rot: -10 },
  { type: 'crown', skin: 'diamond', x: 360, y: 476, r: 44, rot: 16 }
]

/** Tile units: a tenth of a unit is plenty. */
const n = (v) => Math.round(v * 10) / 10
/** Outline units (R = 1), which get scaled by the radius: a thousandth, or the curves come out stepped. */
const u = (v) => Math.round(v * 1000) / 1000
const poly = (pts, s = 1) => pts.map((p) => `${u(p.x * s)},${u(p.y * s)}`).join(' ')

/** Where two outline points `t` of the way apart sit — for marks that hug the rim. */
const along = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

/** The index of the outline point closest to an angle (0 = right, clockwise, y down). */
const nearestAt = (pts, angle) => {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < pts.length; i++) {
    const a = Math.atan2(pts[i].y, pts[i].x)
    const d = Math.abs(Math.atan2(Math.sin(a - angle), Math.cos(a - angle)))
    if (d < bestD) { bestD = d; best = i }
  }
  return best
}

/**
 * The one mark per cut that says the material, in outline units (R = 1).
 * Every mark stays out near the rim: the glyph owns the middle.
 */
const cutMarks = (cut, pts) => {
  const lines = []
  if (cutIsFramed(cut)) {
    // River, jade, amber, marble: the raised border round a sunken field — the
    // same `INSET` `paintFrame` carves.
    lines.push(`<polygon points="${poly(pts, 1 - INSET)}"/>`)
    return lines
  }
  const P = (i) => pts[(i + pts.length) % pts.length]
  switch (cut) {
    case 'knapped': {
      // Obsidian: two flake scars, straight chords knocked off the shoulders.
      for (const ang of [-2.3, 0.5]) {
        const i = nearestAt(pts, ang)
        const a = along(P(i - 1), { x: 0, y: 0 }, 0.12)
        const b = along(P(i + 2), { x: 0, y: 0 }, 0.12)
        lines.push(`<polyline points="${poly([a, b])}"/>`)
      }
      break
    }
    case 'slab': {
      // Ember: the cooled slab's cracks, running in from the rim and stopping
      // short of the glyph.
      const crack = (ang, bends) => {
        const s = P(nearestAt(pts, ang))
        const out = [s]
        for (const [t, side] of bends) {
          const c = along(s, { x: 0, y: 0 }, t)
          out.push({ x: c.x + side * -Math.sin(ang), y: c.y + side * Math.cos(ang) })
        }
        return `<polyline points="${poly(out)}"/>`
      }
      lines.push(crack(-2.5, [[0.14, 0.05], [0.26, -0.04]]))
      lines.push(crack(0.7, [[0.12, -0.05], [0.24, 0.03]]))
      break
    }
    case 'step': {
      // Sapphire: the step cut's table, and the corners stepping down to it.
      const k = 0.78
      lines.push(`<polygon points="${poly(pts, k)}"/>`)
      for (const p of pts) lines.push(`<line x1="${u(p.x * k)}" y1="${u(p.y * k)}" x2="${u(p.x)}" y2="${u(p.y)}"/>`)
      break
    }
    case 'cabochon': {
      // Ruby: the one long highlight sliding round the dome, following the
      // stone's own outline a little way in from the top-left rim.
      const lit = []
      for (let k = 0; k <= 8; k++) {
        const ang = -2.75 + (k / 8) * 1.1
        const p = P(nearestAt(pts, ang))
        const rim = Math.hypot(p.x, p.y)
        lit.push({ x: Math.cos(ang) * rim * 0.76, y: Math.sin(ang) * rim * 0.76 })
      }
      lines.push(`<polyline points="${poly(lit)}"/>`)
      break
    }
    case 'brilliant': {
      // Diamond: the fire — two glints off the upper right shoulder, the only
      // stone that throws light rather than holding it.
      const glint = (ang, dist, s) => {
        const c = { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist }
        const w = s * 0.22
        const star = [[0, -s], [w, -w], [s, 0], [w, w], [0, s], [-w, w], [-s, 0], [-w, -w]]
        return `<polygon points="${poly(star.map(([x, y]) => ({ x: c.x + x, y: c.y + y })))}"/>`
      }
      lines.push(glint(-0.72, 1.3, 0.24))
      lines.push(glint(-0.2, 1.36, 0.13))
      break
    }
  }
  return lines
}

/** One stone, drawn round the origin at radius `r`, unrotated. */
const stone = ({ type, skin, r }) => {
  const def = SKINS[skin]
  const pts = stoneOutline(def.cut, type, pebbleSeed(type, def.cut))
  const fit = glyphFit(def.cut, type)
  const tint = mixHex(SKIN_TINT[skin], INK, TINT_PULL)
  const glow = mixHex(def.glow ?? RUNES[type].color, INK, TINT_PULL)

  // Outline and marks share one transform, scaled to the radius, so their
  // stroke widths are divided back out.
  const s = r
  const marks = cutMarks(def.cut, pts)
  const size = r * fit.scale * GLYPH_BOOST
  const g = size / 100
  return [
    `<g stroke="${tint}">`,
    `<g transform="scale(${n(s)})" stroke-width="${(LINE.stone / s).toFixed(4)}">`,
    `<polygon points="${poly(pts)}"/>`,
    marks.length ? `<g stroke-width="${(LINE.detail / s).toFixed(4)}">${marks.join('')}</g>` : '',
    '</g>',
    `<path fill="${glow}" fill-opacity="${GLYPH_ALPHA}" stroke="none" transform="translate(${n(-size / 2)} ${n(r * fit.drop - size / 2)}) scale(${g.toFixed(4)})" d="${GLYPH_PATHS[type]}"/>`,
    '</g>'
  ].join('')
}

/** The tile offsets at which a stone's copy still shows inside the tile. */
const copies = ({ x, y, r }) => {
  // The unit box turned 45° reaches √2 out, and the diamond's glints a little past that.
  const reach = r * 1.6 + LINE.stone
  const out = []
  for (const dy of [-TILE, 0, TILE]) {
    for (const dx of [-TILE, 0, TILE]) {
      const cx = x + dx
      const cy = y + dy
      if (cx + reach < 0 || cx - reach > TILE || cy + reach < 0 || cy - reach > TILE) continue
      out.push([dx, dy])
    }
  }
  return out
}

const defs = CAST.map((c, i) => `<g id="s${i}" transform="translate(${c.x} ${c.y}) rotate(${c.rot})">${stone(c)}</g>`)
const uses = CAST.flatMap((c, i) => copies(c).map(([dx, dy]) => {
  const at = `${dx ? ` x="${dx}"` : ''}${dy ? ` y="${dy}"` : ''}`
  return `<use href="#s${i}"${at}/>`
}))

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">`,
  '<!-- generated by tools/splash-tile.mjs — edit that, not this -->',
  `<defs>${defs.join('')}</defs>`,
  `<g fill="none" stroke-linejoin="round" stroke-linecap="round">${uses.join('')}</g>`,
  '</svg>',
  ''
].join('\n')

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, svg)
console.log(`[splash-tile] ${OUT} — ${CAST.length} stones, ${uses.length} placements, ${(svg.length / 1024).toFixed(1)} kB`)
