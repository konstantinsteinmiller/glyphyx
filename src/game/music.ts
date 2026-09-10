/**
 * ─── "Emberlight" — the loop ────────────────────────────────────────────────
 *
 * Sixty seconds of D minor for piano, violin, cello and cozy percussion,
 * written as DATA. No file ships: `useMusicEngine` builds every note out of
 * oscillators and filtered noise on the shared AudioContext, the same way the
 * board is drawn rather than downloaded.
 *
 * That is not only a payload decision. A recorded loop has a SEAM — the file
 * ends, the element restarts, and whatever was still ringing is cut off. This
 * one has no seam to hide, because nothing restarts: the scheduler walks the
 * score forever, wrapping the beat count, so bar 16 hands over to bar 1 with
 * the piano's decay and the reverb tail crossing the join untouched. The join
 * is composed rather than crossfaded — bar 16 is the dominant (A), which the
 * ear WANTS to resolve, and bar 1 is the tonic it resolves to.
 *
 * ── The arithmetic ──
 *
 * 64 BPM, 4/4, 16 bars. A beat is 60/64 = 0.9375 s, a bar 3.75 s, the loop
 * exactly 60.000 s. The tempo was chosen for that: slow enough to be cozy
 * rather than busy, and a whole number of seconds so anything else that wants
 * to line up with the music can.
 *
 * ── The shape ──
 *
 *   bars  1–4    piano alone, then the shaker. The room, empty.
 *   bars  5–8    cello underneath — long bowed roots, no melody yet.
 *   bars  9–14   violin sings over the top; the frame drum keeps a heartbeat.
 *   bars 15–16   everything falls away to the piano figure and one last bowed
 *                note, so the loop point is the quietest bar in the piece.
 *
 * Nobody is mid-phrase at the join, which is the other half of a seamless
 * loop: a violin cut off at bar 16 would announce the repeat however smooth
 * the audio was.
 *
 * ── The harmony ──
 *
 * D natural minor, with ONE borrowed chord: bar 12 and bar 16 are A major, the
 * dominant, whose C♯ is not in the key. That single accidental is the whole
 * "mystical" colour — a minor loop that never leaves its own scale sounds
 * folk-cozy but flat, and this is the note that lifts it.
 *
 * Everything here is pure: no Web Audio, no Vue, no clock. `tests/audio/
 * music.test.ts` reads it as numbers.
 */

/** Which instrument plays a note. The engine owns what each one sounds like. */
export type Part = 'piano' | 'violin' | 'cello' | 'bell' | 'shaker' | 'drum' | 'wood'

export interface Note {
  part: Part
  /** Beats from the top of the loop. */
  at: number
  /** Length in beats. A struck instrument ignores it; a bowed one holds it. */
  dur: number
  /** MIDI note number. Percussion carries its own pitch here too. */
  midi: number
  /** 0…1. The engine scales it by the part's own level and the music slider. */
  vel: number
}

export const BPM = 64
export const BEATS_PER_BAR = 4
export const BARS = 16
export const LOOP_BEATS = BARS * BEATS_PER_BAR
export const SECONDS_PER_BEAT = 60 / BPM
export const LOOP_SECONDS = LOOP_BEATS * SECONDS_PER_BEAT

/** MIDI → Hz, equal temperament, A4 = 440. */
export const midiHz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12)

// ─── The changes ────────────────────────────────────────────────────────────
//
// One chord a bar. `voicing` is what the piano plays, low to high, and it is
// written out rather than generated from a root so the inner voices MOVE:
// F stays under the Bb that follows it, G falls to F, and the top line walks
// instead of jumping an octave every time the root does.
//
// `bass` is the cello's note. It sits under the piano and inside what a cello
// can actually reach — nothing below C2, which is the instrument's bottom
// string and the reason the line leaps UP to B♭2 rather than down to B♭1.
// Read from bar 5, where the cello comes in: G–G–C–D–B♭–F–G–A–D–B♭–G–A.

interface Chord {
  /** For the tests and for anybody reading the file. */
  name: string
  voicing: [number, number, number, number]
  bass: number
}

/** MIDI numbers, for reference: D3 = 50, A3 = 57, D4 = 62, F4 = 65, A4 = 69. */
const CHORDS: readonly Chord[] = [
  { name: 'Dm', voicing: [50, 57, 62, 65], bass: 38 }, // 1  the tonic, bare
  { name: 'Dm', voicing: [50, 57, 62, 65], bass: 38 }, // 2
  { name: 'Bb', voicing: [46, 53, 58, 62], bass: 46 }, // 3  ♭VI — the warm one
  { name: 'F', voicing: [45, 53, 57, 60], bass: 41 }, //  4  ♭III
  { name: 'Gm', voicing: [43, 50, 55, 58], bass: 43 }, // 5  iv
  { name: 'Gm', voicing: [43, 50, 55, 58], bass: 43 }, // 6
  { name: 'C', voicing: [48, 52, 55, 60], bass: 48 }, //  7  ♭VII
  { name: 'Dm', voicing: [50, 57, 62, 64], bass: 38 }, // 8  add9 (E on top)
  { name: 'Bb', voicing: [46, 53, 58, 65], bass: 46 }, // 9  the violin enters
  { name: 'F', voicing: [45, 53, 60, 65], bass: 41 }, //  10
  { name: 'Gm', voicing: [43, 50, 58, 62], bass: 43 }, // 11
  { name: 'A', voicing: [45, 52, 57, 61], bass: 45 }, //  12 THE C♯ (61)
  { name: 'Dm', voicing: [50, 57, 62, 65], bass: 38 }, // 13 home
  { name: 'Bb', voicing: [46, 53, 58, 62], bass: 46 }, // 14
  { name: 'Gm', voicing: [43, 50, 55, 58], bass: 43 }, // 15
  { name: 'A', voicing: [45, 52, 57, 61], bass: 45 } //  16 the dominant → bar 1
]

export const chordNames = (): string[] => CHORDS.map((c) => c.name)

// ─── The parts ──────────────────────────────────────────────────────────────

const bar = (n: number): number => (n - 1) * BEATS_PER_BAR

/**
 * The piano figure: six notes a bar, lilting rather than square — beats 1, the
 * "and" of 1, 2, 3, the "and" of 3, and 4. It climbs through the voicing and
 * comes back down, so the pattern is the same in every bar and the CHORD is
 * what changes underneath it. Two hundred and forty years of lullabies work
 * this way for a reason: the ear stops listening to the figure after two bars
 * and starts listening to the harmony.
 */
const PIANO_FIGURE: readonly { beat: number; step: number; vel: number }[] = [
  { beat: 0, step: 0, vel: 0.85 },
  { beat: 0.5, step: 2, vel: 0.5 },
  { beat: 1, step: 3, vel: 0.62 },
  { beat: 2, step: 1, vel: 0.72 },
  { beat: 2.5, step: 3, vel: 0.5 },
  { beat: 3, step: 2, vel: 0.58 }
]

const piano = (): Note[] => {
  const out: Note[] = []
  for (let b = 0; b < BARS; b++) {
    const chord = CHORDS[b]!
    for (const f of PIANO_FIGURE) {
      // The last two bars thin out: only the strong beats, so the loop point is
      // the quietest thing in the piece and the join has room to breathe.
      if (b >= BARS - 2 && f.beat !== Math.floor(f.beat)) continue
      out.push({
        part: 'piano',
        at: b * BEATS_PER_BAR + f.beat,
        dur: 1,
        midi: chord.voicing[f.step]!,
        // A hair quieter in the opening bars — the piece fades UP into itself.
        vel: f.vel * (b < 2 ? 0.82 : 1)
      })
    }
  }
  return out
}

/**
 * The cello: one bowed note a bar from bar 5, held nearly the whole bar so the
 * bow never stops moving. Bars 1–4 are deliberately without it — the piece has
 * to have somewhere to grow to, and an ambient loop that starts full has
 * nothing left by its second pass.
 */
const cello = (): Note[] => {
  const out: Note[] = []
  for (let b = 4; b < BARS; b++) {
    const c = CHORDS[b]!
    out.push({ part: 'cello', at: b * BEATS_PER_BAR, dur: 3.6, midi: c.bass, vel: b >= BARS - 2 ? 0.5 : 0.62 })
  }
  return out
}

/**
 * The violin's six bars. It is a melody rather than a pad: it takes the top of
 * the arrangement at bar 9, sings one long phrase, and is GONE by bar 15 —
 * which is what makes the last two bars feel like an exhale and the return to
 * bar 1 feel like a beginning.
 *
 * The line: F–D–F over B♭, up to A and G over F, down through F–D over Gm,
 * then the C♯ over A — the borrowed note, held — resolving down to D over the
 * tonic, and out on F.
 */
const VIOLIN: readonly { beat: number; dur: number; midi: number; vel: number }[] = [
  { beat: bar(9) + 0, dur: 2, midi: 77, vel: 0.6 }, //  F5
  { beat: bar(9) + 2, dur: 1, midi: 74, vel: 0.5 }, //  D5
  { beat: bar(9) + 3, dur: 1, midi: 77, vel: 0.52 }, // F5
  { beat: bar(10) + 0, dur: 3, midi: 81, vel: 0.66 }, // A5 — the high point
  { beat: bar(10) + 3, dur: 1, midi: 79, vel: 0.5 }, // G5
  { beat: bar(11) + 0, dur: 2, midi: 77, vel: 0.58 }, // F5
  { beat: bar(11) + 2, dur: 2, midi: 74, vel: 0.54 }, // D5
  { beat: bar(12) + 0, dur: 2, midi: 73, vel: 0.62 }, // C♯5 — the lift
  { beat: bar(12) + 2, dur: 2, midi: 76, vel: 0.56 }, // E5
  { beat: bar(13) + 0, dur: 3.5, midi: 74, vel: 0.6 }, // D5, home, long
  { beat: bar(14) + 0, dur: 3, midi: 77, vel: 0.48 } //  F5, and away
]

const violin = (): Note[] => VIOLIN.map((n) => ({ part: 'violin', at: n.beat, dur: n.dur, midi: n.midi, vel: n.vel }))

/**
 * A single struck bell on the two phrase openings (bar 1 and bar 9). It is the
 * quietest melodic voice in the mix and it is doing structural work: it is how
 * a player who is not listening still feels where they are in the loop.
 */
const bell = (): Note[] => [
  { part: 'bell', at: bar(1), dur: 2, midi: 86, vel: 0.3 },
  { part: 'bell', at: bar(9), dur: 2, midi: 81, vel: 0.34 }
]

/**
 * Percussion, all of it soft: a shaker in eighths from bar 3, a frame drum on
 * the half-note pulse through the middle, and a wood tick on the last upbeat
 * of a few bars — the detail that keeps a slow groove from sounding like a
 * metronome.
 *
 * Nothing here is a kit. It is a hand on a skin and beads in a gourd, which is
 * what "cozy percussion" means when the alternative is a drum machine.
 */
const percussion = (): Note[] => {
  const out: Note[] = []
  for (let b = 2; b < BARS; b++) {
    const tail = b >= BARS - 1
    for (let e = 0; e < 8; e++) {
      // The last bar keeps only the downbeats: the groove exhales into the loop.
      if (tail && e % 2 !== 0) continue
      out.push({
        part: 'shaker',
        at: b * BEATS_PER_BAR + e * 0.5,
        dur: 0.25,
        midi: 0,
        // Accent the offbeats, gently — that is the lilt.
        vel: (e % 2 === 1 ? 0.4 : 0.24) * (tail ? 0.6 : 1)
      })
    }
  }
  for (let b = 4; b < BARS - 2; b++) {
    out.push({ part: 'drum', at: b * BEATS_PER_BAR, dur: 0.5, midi: 0, vel: 0.5 })
    out.push({ part: 'drum', at: b * BEATS_PER_BAR + 2, dur: 0.5, midi: 0, vel: 0.36 })
    // From the violin's entry the drum picks up the last eighth of the bar.
    if (b >= 8) out.push({ part: 'drum', at: b * BEATS_PER_BAR + 3.5, dur: 0.4, midi: 0, vel: 0.26 })
  }
  for (const b of [6, 10, 14]) out.push({ part: 'wood', at: bar(b) + 3.5, dur: 0.2, midi: 0, vel: 0.3 })
  return out
}

/**
 * The whole loop, in beats, sorted. Built once at module load — it is a few
 * hundred plain objects and the scheduler reads it every 100 ms.
 */
export const SCORE: readonly Note[] = [
  ...piano(), ...cello(), ...violin(), ...bell(), ...percussion()
].sort((a, b) => a.at - b.at || a.part.localeCompare(b.part))

/** Every note whose start falls in `[from, to)` beats of the loop. */
export const notesInWindow = (from: number, to: number): Note[] =>
  SCORE.filter((n) => n.at >= from && n.at < to)
