import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The renderer's one performance rule for light: no `shadowBlur`, no
 * `shadowColor`, no `filter` on the FRAME path. A blur is a per-pixel
 * convolution the rasteriser re-runs every frame for every glow, and it is
 * what turns a phone's 60 fps into 20. Glow comes from sprites baked once
 * (`arenaFx.ts`) and blitted.
 *
 * Asserted on the source rather than hoped: everything inside
 * `createArenaRenderer` (the per-frame code) must be clean, and the only blur
 * left in the module-level half must sit inside a bake helper — a function
 * that runs once per sprite and caches it.
 */

const read = (rel: string): string => readFileSync(resolve(__dirname, '../../', rel), 'utf8')
const BLUR = /shadowBlur|shadowColor|\.filter\s*=/

/** The name of the nearest enclosing `const name = (` above `index`. */
const enclosingFunction = (src: string, index: number): string => {
  const head = src.slice(0, index)
  const m = [...head.matchAll(/(?:^|\n)\s*(?:export )?const (\w+) = (?:\(|async \()/g)]
  return m.length > 0 ? m[m.length - 1]![1]! : '<module>'
}

describe('no blur on the frame path', () => {
  const art = read('src/use/useArenaArt.ts')
  const cut = art.indexOf('export const createArenaRenderer')

  it('finds the renderer factory', () => {
    expect(cut).toBeGreaterThan(0)
  })

  it('draws every frame without shadowBlur, shadowColor or filter', () => {
    const frame = art.slice(cut)
    const offenders = frame.split('\n')
      .map((line, i) => ({ line, i }))
      .filter(({ line }) => BLUR.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line))
      .map(({ line, i }) => `${i}: ${line.trim()}`)
    expect(offenders).toEqual([])
  })

  it('keeps the remaining blur inside bake helpers that run once per sprite', () => {
    const head = art.slice(0, cut)
    const re = /shadowBlur|shadowColor/g
    const names = new Set<string>()
    for (const m of head.matchAll(re)) {
      const lineStart = head.lastIndexOf('\n', m.index!) + 1
      const line = head.slice(lineStart, head.indexOf('\n', m.index!))
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue
      names.add(enclosingFunction(head, m.index!))
    }
    for (const n of names) expect(n, `blur in "${n}" is not a bake helper`).toMatch(/Sprite$|Glow$|^bake/)
  })

  it('the effects library and the particle pool never blur', () => {
    for (const rel of ['src/use/arenaFx.ts', 'src/use/useVfx.ts']) {
      const src = read(rel)
      const offenders = src.split('\n')
        .filter((line) => BLUR.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line))
      expect(offenders, rel).toEqual([])
    }
  })
})
