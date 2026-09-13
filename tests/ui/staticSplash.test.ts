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

describe('the two splashes pan the same rune tile', () => {
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))
  const vueStyle = vue.slice(vue.indexOf('<style'))
  const tile = readFileSync(join(ROOT, 'public/images/bg/splash-tile.svg'), 'utf8')
  const block = (css: string, selector: string): string => {
    const at = css.indexOf(selector)
    return at < 0 ? '' : css.slice(at, css.indexOf('}', at) + 1)
  }
  const sassBlock = (sass: string, selector: string): string => {
    const at = sass.indexOf(`\n${selector}\n`)
    if (at < 0) return ''
    const next = sass.slice(at + selector.length + 2).search(/\n\S/)
    return sass.slice(at, next < 0 ? undefined : at + selector.length + 2 + next)
  }

  it('name the one tile file, which caps the cast at eight stones', () => {
    expect(style).toContain('url(./images/bg/splash-tile.svg)')
    expect(vue).toContain("prependBaseUrl('images/bg/splash-tile.svg')")
    const stones = [...tile.matchAll(/<g id="s\d+"/g)].length
    expect(stones).toBeGreaterThan(0)
    expect(stones).toBeLessThanOrEqual(8)
  })

  it('paint the same ground, the same haze, and the tile at the same strength', () => {
    const gradients = (css: string): string[] => [...css.matchAll(/radial-gradient\([^;\n]*\)/g)].map((m) => m[0])
    const staticGround = gradients(block(style, '#static-splash {'))
    const vueGround = gradients(sassBlock(vueStyle, '.splash-backdrop'))
    expect(staticGround).toHaveLength(1)
    expect(vueGround.slice(0, 1)).toEqual(staticGround)
    const staticHaze = gradients(block(style, '#static-splash::after'))
    expect(staticHaze).toHaveLength(1)
    expect(vueGround.slice(1)).toEqual(staticHaze)

    const opacity = (css: string): string | undefined => css.match(/opacity:\s*([\d.]+)/)?.[1]
    expect(opacity(sassBlock(vueStyle, '.backdrop-tiles'))).toBe(opacity(block(style, '.splash-tiles {')))
  })

  it('drift one tile down-right on the same clock, and adopt it at the handover', () => {
    const staticTile = block(style, '.splash-tiles {')
    const size = staticTile.match(/\/ (\d+)px \1px repeat/)?.[1]
    expect(size).toBeDefined()
    expect(staticTile).toContain(`top: -${size}px`)
    expect(staticTile).toContain(`left: -${size}px`)
    expect(style).toContain(`translate3d(${size}px, ${size}px, 0)`)
    expect(vueStyle).toContain(`$tile: ${size}px`)
    expect(vueStyle).toContain('translate3d($tile, $tile, 0)')

    // Same animations, in the same ORDER — `adoptAnimationClock` pairs them by index.
    const timings = (css: string, prefix: string): string =>
      css.match(new RegExp(`animation: (${prefix}-tiles-in [^,]+, ${prefix}-tiles-pan [^;\\n]+)`))?.[1]
        ?.replaceAll(`${prefix}-`, '') ?? ''
    expect(timings(style, 'splash')).not.toBe('')
    expect(timings(vueStyle, 'backdrop')).toBe(timings(style, 'splash'))

    expect(vue).toMatch(/adoptAnimationClock\(\s*staticSplash\.querySelector\('\.splash-tiles'\),\s*document\.querySelector\('\.backdrop-tiles'\)\s*\)/)
  })

  it('stand still for anyone who asked for less motion', () => {
    const reduced = style.slice(style.indexOf('prefers-reduced-motion'))
    expect(reduced.slice(0, reduced.indexOf('}'))).toContain('.splash-tiles')
    expect(vueStyle).toMatch(/prefers-reduced-motion: reduce\)\n\s+\.backdrop-tiles\n\s+animation: none/)
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
