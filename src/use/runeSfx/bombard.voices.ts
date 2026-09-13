import { getNoise, land, startAt, withPan, type AudioCtx, type NoiseOpts } from '@/use/sfxKit'

/**
 * ─── Click-free voices (the mortar's, and the bow borrows them) ─────────────
 *
 * TWINS of the kit's noise-driven instruments (`noiseBurst`, `whoosh`,
 * `crackle`, `swell`, `pluck`) — same arguments, same sound, same node count —
 * with one difference: each gain node is SILENT until its first scheduled
 * event.
 *
 * Why: a `GainNode` starts at its default gain of 1.0, and the kit's voices
 * only begin automating it at the note's start time `now`. When `now` does not
 * fall exactly on a sample (a voice offset or a delay makes that the usual
 * case), Chrome's buffer source emits its first, interpolated frame one sample
 * BEFORE the gain event takes hold — one frame of noise at full gain. Measured
 * on the bench: a lone single-sample spike of ±0.6…0.9 (−4 … −0.8 dBFS) at the
 * mortar's launch, through a sound whose loudest 50 ms sits at −22 dB. It is
 * an audible tick and it breaks the −1 dBFS sample-peak rule on its own.
 * (The fix in `sfxKit.ts` itself is one line per instrument —
 * `gain.gain.value = 0` right after `createGain()` — requested in the report.)
 *
 * Oscillator voices (`tone`, `fm`, `thump`'s body, `whistle` below) start at
 * phase 0 and cannot spike; those still come from the kit.
 */

/** A gain that is 0 until its first event, not 1. */
const quietGain = (ctx: AudioCtx): GainNode => {
  const g = ctx.createGain()
  g.gain.value = 0
  return g
}

/** `noiseBurst`, click-free. 4–5 nodes. */
export const noise = (ctx: AudioCtx, o: NoiseOpts): void => {
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.playbackRate.value = (o.rate ?? 1) * (0.85 + Math.random() * 0.3)
  const filter = ctx.createBiquadFilter()
  filter.type = o.type ?? 'lowpass'
  filter.Q.value = o.q ?? 1
  const now = startAt(ctx, o.delay)
  filter.frequency.setValueAtTime(Math.max(40, o.filterFrom), now)
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, o.filterTo), now + o.duration)
  const gain = quietGain(ctx)
  gain.gain.setValueAtTime(o.gain, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)
  src.connect(filter).connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, o.panTo, now, o.duration), o.space ?? 0.1)
  if (o.loop) {
    src.loop = true
    src.start(now, Math.random() * 0.9)
  } else {
    src.start(now)
  }
  src.stop(now + o.duration + 0.02)
}

/** `whoosh`, click-free: band-passed air that swells and sweeps. 4–5 nodes. */
export const air = (
  ctx: AudioCtx,
  o: { duration: number; from: number; to: number; gain: number; q?: number; rise?: number; delay?: number; pan?: number; panTo?: number; space?: number }
): void => {
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.loop = true
  src.playbackRate.value = 0.9 + Math.random() * 0.2
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = o.q ?? 1.4
  f.frequency.setValueAtTime(Math.max(60, o.from), now)
  f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), now + o.duration)
  const g = quietGain(ctx)
  const peak = now + o.duration * Math.max(0.05, Math.min(0.9, o.rise ?? 0.4))
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), peak)
  g.gain.exponentialRampToValueAtTime(0.0001, now + o.duration)
  src.connect(f).connect(g)
  land(ctx, withPan(ctx, g, o.pan, o.panTo, now, o.duration), o.space ?? 0.15)
  src.start(now, Math.random() * 0.5)
  src.stop(now + o.duration + 0.02)
}

/** `crackle`, click-free: one noise source, gain driven by a spike train. 4 nodes. */
export const grit = (
  ctx: AudioCtx,
  o: { duration: number; density: number; gain: number; freq: number; q?: number; grainMs?: number; delay?: number; pan?: number; space?: number; decay?: boolean }
): void => {
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = o.freq
  f.Q.value = o.q ?? 2.2
  const g = quietGain(ctx)
  g.gain.setValueAtTime(0.0001, now)
  const n = Math.min(160, Math.max(1, Math.round(o.density * o.duration)))
  const grain = (o.grainMs ?? 7) / 1000
  for (let i = 0; i < n; i++) {
    const t = now + (i + Math.random()) * (o.duration / n)
    const fall = o.decay === false ? 1 : 1 - (t - now) / o.duration
    const a = Math.max(0.0002, o.gain * (0.35 + Math.random() * 0.65) * fall)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(a, t + grain * 0.15)
    g.gain.exponentialRampToValueAtTime(0.0001, t + grain)
  }
  src.connect(f).connect(g)
  land(ctx, withPan(ctx, g, o.pan, undefined, now, o.duration), o.space ?? 0.12)
  src.start(now, Math.random() * 0.4)
  src.stop(now + o.duration + 0.05)
}

/** `swell`, click-free: noise rising into a moment and cut at its end. 4–5 nodes. */
export const rise = (
  ctx: AudioCtx,
  o: { duration: number; from: number; to: number; gain: number; q?: number; delay?: number; pan?: number; space?: number }
): void => {
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = getNoise(ctx)
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = o.q ?? 1.2
  f.frequency.setValueAtTime(Math.max(60, o.from), now)
  f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), now + o.duration)
  const g = quietGain(ctx)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), now + o.duration * 0.96)
  g.gain.linearRampToValueAtTime(0.0001, now + o.duration)
  src.connect(f).connect(g)
  land(ctx, withPan(ctx, g, o.pan, undefined, now, o.duration), o.space ?? 0.25)
  src.start(now, Math.random() * 0.4)
  src.stop(now + o.duration + 0.02)
}

// Karplus–Strong strings, rendered once per pitch bucket and cached — the kit's
// algorithm exactly (its cache is private, so this one keeps its own).
const pluckCache = new Map<string, AudioBuffer>()

/** `pluck`, click-free: a Karplus–Strong string. 2–4 nodes. */
export const string = (
  ctx: AudioCtx, o: { freq: number; duration: number; gain: number; bright?: number; delay?: number; pan?: number; space?: number }
): void => {
  const sr = ctx.sampleRate
  const bright = Math.max(0, Math.min(1, o.bright ?? 0.6))
  const key = `${Math.round(o.freq)}|${Math.round(bright * 10)}|${Math.round(o.duration * 20)}|${sr}`
  let buf = pluckCache.get(key)
  if (!buf) {
    const len = Math.max(1, Math.floor(sr * o.duration))
    buf = ctx.createBuffer(1, len, sr)
    const d = buf.getChannelData(0)
    const period = Math.max(2, Math.round(sr / Math.max(30, o.freq)))
    const line = new Float32Array(period)
    let lp = 0
    for (let i = 0; i < period; i++) {
      lp += (0.25 + bright * 0.75) * ((Math.random() * 2 - 1) - lp)
      line[i] = lp
    }
    const decay = 0.4955 + bright * 0.0035
    let idx = 0
    for (let i = 0; i < len; i++) {
      const cur = line[idx]!
      const nxt = line[(idx + 1) % period]!
      line[idx] = (cur + nxt) * decay
      d[i] = cur
      idx = (idx + 1) % period
    }
    if (pluckCache.size > 48) pluckCache.clear()
    pluckCache.set(key, buf)
  }
  const now = startAt(ctx, o.delay)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const gain = quietGain(ctx)
  gain.gain.setValueAtTime(o.gain, now)
  gain.gain.setValueAtTime(o.gain, now + o.duration * 0.8)
  gain.gain.linearRampToValueAtTime(0.0001, now + o.duration)
  src.connect(gain)
  land(ctx, withPan(ctx, gain, o.pan, undefined, now, o.duration), o.space ?? 0.18)
  src.start(now)
  src.stop(now + o.duration + 0.02)
}

/**
 * The incoming whistle: a sine gliding DOWN from `from` to `to` Hz, a slow
 * wobble on its pitch (the round tumbling), and a gain that CLIMBS the whole
 * way — quiet up at the top of the lob, loudest the instant before it lands —
 * then cut dead, because the blast is what ends it. None of the kit's voices
 * swell into their end (`tone` / `fm` peak at their attack). 5 nodes (6 with
 * `pan`).
 */
export const whistle = (
  ctx: AudioCtx,
  o: { from: number; to: number; duration: number; gain: number; delay?: number; wobble?: number; pan?: number; space?: number }
): void => {
  const now = startAt(ctx, o.delay)
  const end = now + o.duration
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(Math.max(20, o.from), now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), end)
  const lfo = ctx.createOscillator()
  lfo.frequency.setValueAtTime(9, now)
  lfo.frequency.linearRampToValueAtTime(14, end)
  const depth = ctx.createGain()
  depth.gain.setValueAtTime(o.from * (o.wobble ?? 0.012), now)
  depth.gain.linearRampToValueAtTime(o.to * (o.wobble ?? 0.012), end)
  lfo.connect(depth).connect(osc.frequency)
  const g = quietGain(ctx)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain * 0.18), now + o.duration * 0.25)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain), now + o.duration * 0.94)
  g.gain.linearRampToValueAtTime(0.0001, end)
  osc.connect(g)
  land(ctx, withPan(ctx, g, o.pan, undefined, now, o.duration), o.space ?? 0.2)
  osc.start(now)
  lfo.start(now)
  osc.stop(end + 0.02)
  lfo.stop(end + 0.02)
}
