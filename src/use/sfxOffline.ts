import type { FxSound, SfxOpts } from '@/game/cues'
import { LAYER_SAMPLES, SAMPLE_CUES, THROTTLES, synthFor } from '@/use/useGameAudio'
import { beginVoice, endVoice } from '@/use/sfxKit'
import { busFor } from '@/use/audioBus'
import { prependBaseUrl } from '@/utils/function'

/**
 * ─── Offline cue rendering (DEV / bench only) ───────────────────────────────
 *
 * Render a TIMELINE of cues — exactly what the game asked for during a
 * scenario, recorded through `__setSfxTap` — into an `OfflineAudioContext`,
 * through the same recipes, the same room, the same glue compressor and the
 * same per-cue throttle the live mixer applies. What comes out is what a
 * player would have heard, as an `AudioBuffer`: a headless run that can be
 * listened to, measured and drawn.
 *
 * Imported only by the FX bench (a dev route), so it never reaches a build.
 */

export interface CueCall {
  id: FxSound
  power: number
  opts?: SfxOpts
  /** When it was asked for, ms from the start of the render. */
  atMs: number
}

/** The live mixer's per-cue throttle, replayed on recorded timestamps: which calls would have sounded. */
export const throttleCalls = (calls: readonly CueCall[]): CueCall[] => {
  const sorted = [...calls].sort((a, b) => a.atMs - b.atMs)
  const last: Partial<Record<FxSound, number>> = {}
  const windows: Partial<Record<FxSound, number[]>> = {}
  const out: CueCall[] = []
  for (const c of sorted) {
    const t = THROTTLES[c.id]
    if (t) {
      if (c.atMs - (last[c.id] ?? -Infinity) < t.minGapMs) continue
      const w = (windows[c.id] ??= [])
      while (w.length > 0 && c.atMs - w[0]! > t.windowMs) w.shift()
      if (w.length >= t.maxPerWindow) continue
      w.push(c.atMs)
      last[c.id] = c.atMs
    }
    out.push(c)
  }
  return out
}

const sampleCache = new Map<string, Promise<AudioBuffer | null>>()

const loadSample = (ctx: BaseAudioContext, name: string): Promise<AudioBuffer | null> => {
  const key = `${name}|${ctx.sampleRate}`
  let hit = sampleCache.get(key)
  if (!hit) {
    hit = fetch(prependBaseUrl(`audio/sfx/${name}.ogg`))
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((b) => (b ? ctx.decodeAudioData(b) : null))
      .catch(() => null)
    sampleCache.set(key, hit)
  }
  return hit
}

export interface RenderOptions {
  /** Length of the render, seconds. Default: the last cue + 2.5 s of tail. */
  seconds?: number
  sampleRate?: number
  /** Apply the live throttle (default true). */
  throttle?: boolean
  /** Include the recorded sample layers (default true). */
  samples?: boolean
}

/** Render `calls` offline, stereo. Resolves with the rendered buffer. */
export const renderCues = async (calls: readonly CueCall[], o: RenderOptions = {}): Promise<AudioBuffer> => {
  const list = o.throttle === false ? [...calls] : throttleCalls(calls)
  const sr = o.sampleRate ?? 48_000
  const lastMs = list.reduce((m, c) => Math.max(m, c.atMs), 0)
  const seconds = o.seconds ?? lastMs / 1000 + 2.5
  const ctx = new OfflineAudioContext(2, Math.max(1, Math.ceil(sr * seconds)), sr)
  busFor(ctx)

  // Samples decode asynchronously; fetch them all before scheduling anything.
  const wantSamples = o.samples !== false
  const sampleOf = (id: FxSound): [string, number] | null => (SAMPLE_CUES[id] ?? LAYER_SAMPLES[id] ?? null)
  const names = new Set<string>()
  if (wantSamples) for (const c of list) { const s = sampleOf(c.id); if (s) names.add(s[0]) }
  const decoded = new Map<string, AudioBuffer | null>()
  await Promise.all([...names].map(async (n) => { decoded.set(n, await loadSample(ctx, n)) }))

  for (const c of list) {
    const at = c.atMs / 1000
    const s = wantSamples ? sampleOf(c.id) : null
    if (s) {
      const buf = decoded.get(s[0])
      if (buf) {
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = 0.94 + Math.random() * 0.12
        const g = ctx.createGain()
        g.gain.value = s[1]
        src.connect(g).connect(ctx.destination)
        src.start(at)
      }
      if (SAMPLE_CUES[c.id]) continue
    }
    const synth = synthFor(c.id)
    if (!synth) continue
    beginVoice(ctx, c.opts, at)
    try {
      synth(ctx, Number.isFinite(c.power) ? c.power : 0, Math.random(), { pan: 0, level: 1, ...c.opts })
    } finally {
      endVoice()
    }
  }
  return ctx.startRendering()
}

// ─── Measurement ────────────────────────────────────────────────────────────

export interface AudioStats {
  seconds: number
  /** Sample peak, dBFS. Anything near 0 is clipping into the soft clip. */
  peakDb: number
  /** Loudest 50 ms window, dB RMS — how hard the cue HITS. */
  maxShortDb: number
  /** Mean RMS over the part above −50 dB — how loud it sits overall. */
  activeRmsDb: number
  /** How long the render stays above −40 dB, seconds — the cue's audible length. */
  audibleSec: number
  /** Brightness: the power-weighted mean frequency, Hz. */
  centroidHz: number
  /** Stereo width: 0 = mono, 1 = fully decorrelated. */
  width: number
}

const db = (v: number): number => (v <= 1e-9 ? -180 : 20 * Math.log10(v))

/** In-place radix-2 FFT (re, im of length n, a power of two). */
export const fft = (re: Float32Array, im: Float32Array): void => {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { const tr = re[i]!; re[i] = re[j]!; re[j] = tr; const ti = im[i]!; im[i] = im[j]!; im[j] = ti }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k]!, ai = im[i + k]!
        const br = re[i + k + len / 2]!, bi = im[i + k + len / 2]!
        const tr = br * cr - bi * ci
        const ti = br * ci + bi * cr
        re[i + k] = ar + tr; im[i + k] = ai + ti
        re[i + k + len / 2] = ar - tr; im[i + k + len / 2] = ai - ti
        const ncr = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = ncr
      }
    }
  }
}

export const measure = (buf: AudioBuffer): AudioStats => {
  const L = buf.getChannelData(0)
  const R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L
  const n = L.length
  const sr = buf.sampleRate
  let peak = 0
  for (let i = 0; i < n; i++) { const a = Math.max(Math.abs(L[i]!), Math.abs(R[i]!)); if (a > peak) peak = a }
  // Short-term loudness on a SLIDING 50 ms window (5 ms hop): a fixed grid
  // read the same cue ±2 dB apart depending on where it happened to land.
  const win = Math.max(1, Math.round(sr * 0.05))
  const hop = Math.max(1, Math.round(sr * 0.005))
  let maxShort = 0
  let activeSum = 0
  let activeN = 0
  let audible = 0
  let e = 0
  for (let i = 0; i < Math.min(win, n); i++) e += (L[i]! * L[i]! + R[i]! * R[i]!) * 0.5
  for (let s = 0; s + win <= n; s += hop) {
    const rms = Math.sqrt(Math.max(0, e) / win)
    if (rms > maxShort) maxShort = rms
    if (db(rms) > -50) { activeSum += rms * rms; activeN++ }
    if (db(rms) > -40) audible += hop / sr
    // Slide the window by one hop.
    for (let i = s; i < s + hop && i + win < n; i++) {
      e -= (L[i]! * L[i]! + R[i]! * R[i]!) * 0.5
      e += (L[i + win]! * L[i + win]! + R[i + win]! * R[i + win]!) * 0.5
    }
  }
  // Brightness and width over the loud part.
  const N = 2048
  const re = new Float32Array(N)
  const im = new Float32Array(N)
  let num = 0
  let den = 0
  for (let s = 0; s + N <= n; s += N) {
    for (let i = 0; i < N; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1))
      re[i] = ((L[s + i]! + R[s + i]!) * 0.5) * w
      im[i] = 0
    }
    fft(re, im)
    for (let k = 1; k < N / 2; k++) {
      const p = re[k]! * re[k]! + im[k]! * im[k]!
      num += p * (k * sr / N)
      den += p
    }
  }
  let sLL = 0, sRR = 0, sLR = 0
  for (let i = 0; i < n; i++) { sLL += L[i]! * L[i]!; sRR += R[i]! * R[i]!; sLR += L[i]! * R[i]! }
  const corr = sLL > 0 && sRR > 0 ? sLR / Math.sqrt(sLL * sRR) : 1
  return {
    seconds: n / sr,
    peakDb: db(peak),
    maxShortDb: db(maxShort),
    activeRmsDb: activeN > 0 ? db(Math.sqrt(activeSum / activeN)) : -180,
    audibleSec: audible,
    centroidHz: den > 0 ? num / den : 0,
    width: Math.max(0, Math.min(1, 1 - corr))
  }
}

/** A log-frequency spectrogram (40 Hz … 16 kHz), drawn into a new canvas. */
export const spectrogram = (buf: AudioBuffer, w = 900, h = 240): HTMLCanvasElement => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = '#05060a'
  g.fillRect(0, 0, w, h)
  const L = buf.getChannelData(0)
  const R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L
  const sr = buf.sampleRate
  const N = 2048
  const re = new Float32Array(N)
  const im = new Float32Array(N)
  const img = g.getImageData(0, 0, w, h)
  const fLo = Math.log(40)
  const fHi = Math.log(16_000)
  // magma-ish: black → purple → orange → pale yellow
  const ramp = (t: number): [number, number, number] => {
    const k = Math.max(0, Math.min(1, t))
    const r = Math.min(255, Math.max(0, 255 * (k < 0.5 ? k * 1.4 : 0.7 + (k - 0.5) * 0.6)))
    const gg = Math.min(255, Math.max(0, 255 * (k < 0.4 ? k * 0.3 : k < 0.8 ? 0.12 + (k - 0.4) * 1.5 : 0.72 + (k - 0.8) * 1.4)))
    const b = Math.min(255, Math.max(0, 255 * (k < 0.45 ? 0.25 + k * 0.9 : Math.max(0.1, 0.65 - (k - 0.45) * 1.4))))
    return [r, gg, b]
  }
  for (let x = 0; x < w; x++) {
    const centre = Math.floor((x / w) * L.length)
    const s = centre - N / 2
    for (let i = 0; i < N; i++) {
      const j = s + i
      const v = j >= 0 && j < L.length ? (L[j]! + R[j]!) * 0.5 : 0
      re[i] = v * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)))
      im[i] = 0
    }
    fft(re, im)
    for (let y = 0; y < h; y++) {
      const f = Math.exp(fLo + (1 - y / (h - 1)) * (fHi - fLo))
      const k = Math.min(N / 2 - 1, Math.max(1, Math.round((f * N) / sr)))
      const mag = Math.sqrt(re[k]! * re[k]! + im[k]! * im[k]!) / (N / 4)
      const t = (db(mag) + 90) / 80
      const [r, gg, b] = ramp(t)
      const o = (y * w + x) * 4
      img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  return c
}

/** 16-bit PCM stereo WAV, as a base64 string (for a harness to write to disk). */
export const wavBase64 = (buf: AudioBuffer): string => {
  const ch = Math.min(2, buf.numberOfChannels)
  const n = buf.length
  const bytes = 44 + n * ch * 2
  const dv = new DataView(new ArrayBuffer(bytes))
  const w = (o: number, s: string): void => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)) }
  w(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); w(8, 'WAVE'); w(12, 'fmt ')
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true)
  dv.setUint32(24, buf.sampleRate, true); dv.setUint32(28, buf.sampleRate * ch * 2, true)
  dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * ch * 2, true)
  const chans = [buf.getChannelData(0), ch > 1 ? buf.getChannelData(1) : buf.getChannelData(0)]
  let o = 44
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, chans[c]![i]!))
      dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true)
      o += 2
    }
  }
  const u8 = new Uint8Array(dv.buffer)
  let bin = ''
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000))
  return btoa(bin)
}
