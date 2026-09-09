import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

/**
 * ─── Every rewarded button wears the film frame ─────────────────────────────
 *
 * The product rule: a player must never start a video by accident. So every
 * control that can play a rewarded ad shows `RewardAdIcon` — the film-frame
 * mark — BEFORE its label, symbol or price, and is gated on `canOfferReward`
 * so it is not rendered at all on a build that cannot play one (the
 * CrazyGames pre-release build, and any build with no ad provider resolved —
 * see the header of `useAdGate.ts`, which owns those exclusions).
 *
 * ── Why this test derives its own file list ──
 *
 * A hard-coded list of components would pass forever after someone adds a
 * tenth rewarded button without the mark — which is exactly the regression
 * worth catching, because it is invisible until a portal reviewer taps a
 * button and a video they did not expect starts playing.
 *
 * So the surfaces are DISCOVERED, in two steps:
 *
 *   1. the transitive closure of "functions that end in a rewarded video",
 *      starting from the two in `useAdGate` that actually show one
 *      (`watchRewarded`, `claimReward`) and walking outward through the
 *      composables. That closure is what makes the scan honest: a component
 *      almost never calls `watchRewarded` itself — it calls
 *      `unlockSkinByAd`, which calls `watchRewardedFor`, which calls
 *      `watchRewarded`. A wrapper added tomorrow is picked up for free.
 *   2. every `.vue` under `src/components` and `src/views` that calls any name
 *      in that closure.
 */

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8')

/**
 * Comments out, so a MENTION is never mistaken for a call. This codebase
 * documents itself heavily and its prose is full of back-ticked function
 * names — `watchRewardedFor`'s own doc comment says "the ad gate's
 * `watchRewarded(reason)` never throws", which was enough to make the
 * neighbouring export look like it played a video.
 */
const stripComments = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Every file under `rel` matching `re`, recursively, as repo-relative paths. */
const walk = (rel: string, re: RegExp): string[] => {
  const out: string[] = []
  const visit = (dir: string): void => {
    for (const entry of readdirSync(resolve(ROOT, dir))) {
      const child = join(dir, entry).replace(/\\/g, '/')
      if (statSync(resolve(ROOT, child)).isDirectory()) visit(child)
      else if (re.test(entry)) out.push(child)
    }
  }
  visit(rel)
  return out
}

/** The two calls in `useAdGate` that actually put a video on the screen. */
const SEEDS = ['watchRewarded', 'claimReward'] as const

/**
 * Split a module into its exported declarations: each chunk runs from one
 * top-level declaration to the NEXT top-level declaration of any kind, and
 * only the exported ones are returned.
 *
 * Ending at the next declaration rather than the next `export` matters. A
 * module here typically reads `export const armedBoons = …` followed by a
 * private helper and only then the next export — so a chunk that ran to the
 * next `export` would hand `armedBoons` the body of a helper it has nothing
 * to do with, and the closure below would report it as a rewarded call. It
 * did exactly that before this was tightened.
 */
const exportedChunks = (src: string): { name: string; body: string }[] => {
  const re = /^(export\s+)?(?:const|let|function|async function|class)\s+(\w+)/gm
  const marks: { name: string; at: number; exported: boolean }[] = []
  for (let m = re.exec(src); m !== null; m = re.exec(src)) {
    marks.push({ name: m[2]!, at: m.index, exported: m[1] !== undefined })
  }
  const out: { name: string; body: string }[] = []
  for (let i = 0; i < marks.length; i++) {
    if (!marks[i]!.exported) continue
    const end = i + 1 < marks.length ? marks[i + 1]!.at : src.length
    out.push({ name: marks[i]!.name, body: src.slice(marks[i]!.at, end) })
  }
  return out
}

const composables = walk('src/use', /\.ts$/).filter((f) => !f.endsWith('.stub.ts'))

/** Names whose call ends, directly or through wrappers, in a rewarded video. */
const rewardedNames = ((): Set<string> => {
  const names = new Set<string>(SEEDS)
  const sources = composables.map((f) => ({ file: f, src: stripComments(read(f)) }))
  // Fixpoint: keep adding wrappers until a pass discovers nothing new.
  for (let pass = 0; pass < 8; pass++) {
    const before = names.size
    for (const { src } of sources) {
      for (const { name, body } of exportedChunks(src)) {
        if (names.has(name)) continue
        for (const known of names) {
          if (body.includes(`${known}(`)) { names.add(name); break }
        }
      }
    }
    if (names.size === before) break
  }
  return names
})()

/** A component is a rewarded surface if it CALLS any of those names. */
const surfaces = walk('src/components', /\.vue$/)
  .concat(walk('src/views', /\.vue$/))
  .map((file) => ({ file, src: read(file), code: stripComments(read(file)) }))
  .filter(({ code }) => {
    for (const name of rewardedNames) {
      // A call, not an import line — `import { watchRewarded }` is not a surface.
      const re = new RegExp(`(?<!import[^\\n]*)\\b${name}\\s*\\(`)
      if (re.test(code)) return true
    }
    return false
  })

describe('the rewarded-video mark', () => {
  it('finds the rewarded call chain, wrappers included', () => {
    // The scan is only as good as its closure, so pin the closure itself: if
    // this shrinks to the seeds, step 1 has broken and every assertion below
    // would pass vacuously.
    for (const seed of SEEDS) expect(rewardedNames.has(seed), seed).toBe(true)
    for (const wrapper of ['watchRewardedFor', 'unlockSkinByAd', 'earnPowerRuneByAd']) {
      expect([...rewardedNames], `${wrapper} is a rewarded wrapper`).toContain(wrapper)
    }
  })

  it('finds every rewarded surface in the game', () => {
    const files = surfaces.map((s) => s.file)
    // The five that exist today: a power rune, a skin, the result screen's ×3,
    // a rune rank, and the nuker's early unlock. This list is a FLOOR, not the
    // definition — a sixth surface is found by the scan and held to the same
    // rules without touching this test. A name disappearing from here means
    // either the surface is gone or the scan stopped seeing it; both are worth
    // a human look, which is why it is asserted rather than inferred.
    for (const known of [
      'src/components/organisms/PowerRuneCard.vue',
      'src/components/organisms/SkinsPanel.vue',
      'src/components/organisms/RuneRankCard.vue',
      'src/components/organisms/RankShopPanel.vue',
      'src/views/GameScene.vue'
    ]) {
      expect(files, `${known} is a rewarded surface`).toContain(known)
    }
    expect(files.length).toBeGreaterThanOrEqual(5)
  })

  it('shows the film frame on every one of them', () => {
    for (const { file, src } of surfaces) {
      expect(src, `${file} does not import RewardAdIcon`).toMatch(/import RewardAdIcon from '@\/components\/atoms\/RewardAdIcon\.vue'/)
      // …and actually renders it, not just imports it.
      const template = src.match(/<template lang="pug">([\s\S]*?)<\/template>/)?.[1] ?? ''
      expect(template, `${file} imports RewardAdIcon but never renders it`).toMatch(/RewardAdIcon/)
    }
  })

  it('hides every one of them where no video can play', () => {
    for (const { file, src } of surfaces) {
      // `canOfferReward` is false on the CG pre-release build and wherever no
      // ad provider is resolved. A surface that ignores it either offers a
      // video that cannot play, or hands the perk over for nothing.
      expect(src, `${file} does not gate on canOfferReward`).toMatch(/\bcanOfferReward\b/)
    }
  })
})
