import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { KEEPER_INLINE_MAX, KEEPER_SPLASH_MARKER, bakeKeeperSplash } from '@/game/keeperSplash'

/**
 * The two splashes are one picture. `index.html` paints the Keeper before any
 * script runs and `FLogoProgress.vue` takes over when Vue mounts; if they
 * differ, the handover shows. jsdom renders neither, so these are SOURCE
 * checks — and they would have caught the static splash's animated parts
 * shipping as `reet-eye` / `reet-glow` / … against CSS that styles
 * `.splash-eye`, which left the first frame without its glow and blink.
 */

const ROOT = resolve(__dirname, '../..')
const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
const vue = readFileSync(join(ROOT, 'src/components/atoms/FLogoProgress.vue'), 'utf8')

const staticSvg = html.slice(html.indexOf('<div class="splash-hero"'), html.indexOf('</svg>'))
const vueSvg = vue.slice(vue.indexOf('svg.greet-svg'), vue.indexOf('Transition(name="keeper-swap")'))

describe('the static splash and FLogoProgress draw the same Keeper', () => {
  it('animate the same parts, under the same class names', () => {
    const staticParts = [...staticSvg.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1]!.split(/\s+/))
      .filter((c) => c !== 'splash-hero').map((c) => c.replace(/^splash-/, 'greet-')).sort()
    const vueParts = [...vueSvg.matchAll(/^\s*\w+((?:\.[\w-]+)+)\(/gm)].flatMap((m) => m[1]!.split('.').filter(Boolean))
      .filter((c) => c !== 'greet-svg').sort()
    expect(staticParts).toEqual(vueParts)
    expect(staticParts.length).toBeGreaterThan(5)
  })

  it('style every animated part the static splash names', () => {
    const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))
    for (const base of ['splash-eye', 'splash-glow', 'splash-glyph', 'splash-mote']) {
      expect(staticSvg, base).toContain(base)
      expect(style, base).toContain(`.${base}`)
    }
  })
})

describe('the painted Keeper is baked into the static splash', () => {
  it('keeps the marker right before the hero svg, so `.splash-painted + svg` matches', () => {
    expect(html).toMatch(new RegExp(`${KEEPER_SPLASH_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<svg `))
    expect(html).toContain('.splash-painted + svg')
  })

  it('bakes a painting in as a data: URI and removes the marker', () => {
    const out = bakeKeeperSplash(html, new Uint8Array([82, 73, 70, 70, 1, 2, 3]))
    expect(out).not.toContain(KEEPER_SPLASH_MARKER)
    expect(out).toMatch(/<img class="splash-painted" src="data:image\/webp;base64,UklGRgECAw==" alt="" decoding="sync">\s*<svg /)
  })

  it('bakes nothing — and leaves the drawing — without art, or when the painting is too big to inline', () => {
    for (const painted of [null, new Uint8Array(0), new Uint8Array(KEEPER_INLINE_MAX + 1)]) {
      const out = bakeKeeperSplash(html, painted)
      expect(out).not.toContain(KEEPER_SPLASH_MARKER)
      expect(out).not.toContain('splash-painted"')
    }
  })

  it('FLogoProgress takes over the baked picture instead of fetching its own', () => {
    expect(vue).toContain("'#static-splash .splash-painted'")
    expect(vue).toMatch(/useArtImage\('hero', 'keeper'\)/)
  })
})
