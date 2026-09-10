import { describe, expect, it } from 'vitest'
import {
  BARS, BEATS_PER_BAR, BPM, LOOP_BEATS, LOOP_SECONDS, SCORE, SECONDS_PER_BEAT,
  chordNames, midiHz, notesInWindow, type Part
} from '@/game/music'

/**
 * ─── The loop, as arithmetic ────────────────────────────────────────────────
 *
 * "Emberlight" is a score, not a file, so the things that would be obvious in
 * a waveform editor — is it a minute long, does anything hang over the join,
 * is the violin in the same key as the cello — are checkable here instead, and
 * they are the things that go wrong when somebody edits a bar.
 *
 * None of this is a taste test. It cannot hear the piece. What it can do is
 * refuse the four ways a loop stops looping.
 */

const KEY = 'D natural minor'
/** D E F G A B♭ C, as pitch classes (D = 2). */
const D_MINOR_CLASSES = new Set([2, 4, 5, 7, 9, 10, 0])
/** The one note outside it, and the reason the piece sounds the way it does. */
const BORROWED = 1 // C♯

const melodic = (p: Part): boolean => p === 'piano' || p === 'violin' || p === 'cello' || p === 'bell'
const notesOf = (p: Part) => SCORE.filter((n) => n.part === p)

describe('the score is a minute long, exactly', () => {
  it('is 16 bars of 4/4 at 64 BPM — which is 60.000 seconds', () => {
    // The tempo was chosen for this: a loop that is a whole number of seconds
    // can be lined up with anything else that wants to.
    expect(BPM).toBe(64)
    expect(BEATS_PER_BAR).toBe(4)
    expect(BARS).toBe(16)
    expect(LOOP_BEATS).toBe(64)
    expect(SECONDS_PER_BEAT).toBeCloseTo(0.9375, 6)
    expect(LOOP_SECONDS).toBeCloseTo(60, 6)
  })

  it('has one chord a bar, and ends on the dominant so the join pulls home', () => {
    const chords = chordNames()
    expect(chords).toHaveLength(BARS)
    // The last bar is A — the dominant of D minor — and the first is the tonic.
    // That is the entire trick to a loop with no audible seam: the ear is
    // ASKING for bar 1 by the time it arrives.
    expect(chords[BARS - 1]).toBe('A')
    expect(chords[0]).toBe('Dm')
  })
})

describe('nothing hangs over the join', () => {
  it('starts every note inside the loop', () => {
    for (const n of SCORE) {
      expect(n.at, `${n.part} at ${n.at}`).toBeGreaterThanOrEqual(0)
      expect(n.at, `${n.part} at ${n.at}`).toBeLessThan(LOOP_BEATS)
    }
  })

  it('leaves the last bar quiet enough for the return to feel like a beginning', () => {
    // The busiest bar and the last bar are not the same bar. A loop that is
    // full at the moment it repeats announces the repeat.
    const perBar = Array.from({ length: BARS }, (_, b) =>
      notesInWindow(b * BEATS_PER_BAR, (b + 1) * BEATS_PER_BAR).length)
    const last = perBar[BARS - 1]!
    const busiest = Math.max(...perBar)
    expect(last).toBeLessThan(busiest * 0.75)
  })

  it('has the violin gone before the join, so no phrase is cut in half', () => {
    const v = notesOf('violin')
    expect(v.length).toBeGreaterThan(6)
    const lastEnd = Math.max(...v.map((n) => n.at + n.dur))
    // Two clear bars of daylight between the melody's last note and bar 1.
    expect(lastEnd).toBeLessThanOrEqual(LOOP_BEATS - 2 * BEATS_PER_BAR)
  })

  it('never lets a bowed note run past the end of the loop', () => {
    // A cello note that ran over would be cut off by nothing — the scheduler
    // does not stop — but it WOULD collide with the next pass's bar 1.
    for (const n of SCORE) {
      if (n.part !== 'cello' && n.part !== 'violin') continue
      expect(n.at + n.dur, `${n.part} at ${n.at}`).toBeLessThanOrEqual(LOOP_BEATS)
    }
  })
})

describe('everybody is playing the same piece', () => {
  it(`keeps every melodic note in ${KEY}, bar the one borrowed C♯`, () => {
    const outside = SCORE
      .filter((n) => melodic(n.part))
      .map((n) => n.midi % 12)
      .filter((c) => !D_MINOR_CLASSES.has(c))
    // The dominant's third, and nothing else. It appears in the violin's line
    // and in the piano's voicing of bars 12 and 16.
    expect([...new Set(outside)]).toEqual([BORROWED])
  })

  it('gives each instrument its own register, so the arrangement has room', () => {
    const range = (p: Part) => {
      const ns = notesOf(p).map((n) => n.midi)
      return { lo: Math.min(...ns), hi: Math.max(...ns) }
    }
    const mid = (p: Part) => {
      const ns = notesOf(p).map((n) => n.midi).sort((a, b) => a - b)
      return ns[Math.floor(ns.length / 2)]!
    }
    const cello = range('cello')
    const piano = range('piano')
    const violin = range('violin')
    // Cello under piano under violin. Their EDGES may overlap — a cello and a
    // pianist's left hand share a register in every string quartet ever
    // written — but their centres are a clear octave apart, which is what makes
    // a four-voice arrangement sound bigger than it is.
    expect(mid('piano') - mid('cello')).toBeGreaterThanOrEqual(10)
    expect(mid('violin') - mid('piano')).toBeGreaterThanOrEqual(12)
    // The violin never crosses under the piano's top note.
    expect(violin.lo).toBeGreaterThan(piano.hi)
    // …and all three stay inside what the instrument can actually play.
    expect(cello.lo, 'below a cello\'s bottom C').toBeGreaterThanOrEqual(36)
    expect(cello.hi).toBeLessThanOrEqual(69)
    expect(violin.lo, 'below a violin\'s open G').toBeGreaterThanOrEqual(55)
    expect(violin.hi).toBeLessThanOrEqual(96)
  })

  it('holds the cello back for four bars and the violin for eight', () => {
    // An ambient loop that starts full has nowhere to go on its second pass.
    expect(Math.min(...notesOf('cello').map((n) => n.at))).toBeGreaterThanOrEqual(4 * BEATS_PER_BAR)
    expect(Math.min(...notesOf('violin').map((n) => n.at))).toBeGreaterThanOrEqual(8 * BEATS_PER_BAR)
  })

  it('keeps the percussion soft and off the front of the piece', () => {
    for (const p of ['shaker', 'drum', 'wood'] as const) {
      const ns = notesOf(p)
      expect(ns.length, p).toBeGreaterThan(0)
      // Nothing percussive is the loudest thing in the mix…
      for (const n of ns) expect(n.vel, `${p} at ${n.at}`).toBeLessThanOrEqual(0.5)
      // …and the first two bars are piano alone.
      expect(Math.min(...ns.map((n) => n.at)), p).toBeGreaterThanOrEqual(2 * BEATS_PER_BAR)
    }
  })
})

describe('the notes are notes', () => {
  it('converts MIDI to hertz the way a tuner does', () => {
    expect(midiHz(69)).toBeCloseTo(440, 6) //  A4
    expect(midiHz(57)).toBeCloseTo(220, 6) //  A3
    expect(midiHz(62)).toBeCloseTo(293.66, 2) // D4
  })

  it('is sorted, positive in length, and audible', () => {
    for (let i = 1; i < SCORE.length; i++) expect(SCORE[i]!.at).toBeGreaterThanOrEqual(SCORE[i - 1]!.at)
    for (const n of SCORE) {
      expect(n.dur, `${n.part} at ${n.at}`).toBeGreaterThan(0)
      expect(n.vel, `${n.part} at ${n.at}`).toBeGreaterThan(0)
      expect(n.vel).toBeLessThanOrEqual(1)
    }
  })

  it('hands the scheduler a window it can walk', () => {
    // The engine asks for one beat at a time and expects the notes on it.
    expect(notesInWindow(0, 1).every((n) => n.at >= 0 && n.at < 1)).toBe(true)
    expect(notesInWindow(0, LOOP_BEATS)).toHaveLength(SCORE.length)
    expect(notesInWindow(LOOP_BEATS, LOOP_BEATS + 4)).toHaveLength(0)
  })
})
