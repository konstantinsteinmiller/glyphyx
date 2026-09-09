# Sound todo — drop-in manifest

Glyphyx's board layer is **synthesised at runtime** (`src/use/useGameAudio.ts`):
the stone thud of a placement, the arrow leaving the bow, the arcane beam, the
shatter into rubble, the golden Lv 2 burst — all built from oscillators and
filtered noise, with per-event pitch and envelope jitter. That is deliberate:
a reveal fires every rune on the board inside one second, and no sample
survives that repetition without turning into a loop. It also costs zero
download, which is what lets the game be playable the moment the JS parses.

Only the cues where a *recorded* sound is unmistakably better are samples. Those
are listed first, and every one of them can be replaced by dropping a file at
the exact path.

Format for everything: **OGG Vorbis**, 44.1 kHz mono, −16 LUFS, trimmed to zero
crossings, no baked-in reverb tail longer than the entry says.

## Samples in use today (drop a file to replace)

| Path | Length | Cue | Fired when |
| --- | --- | --- | --- |
| `public/audio/sfx/celebration-1.ogg` | ≤ 1.5 s | `victory` | The match is won. A synthesised G-major swell plays UNDER it (see *Layered*). |
| `public/audio/sfx/lose.ogg` | ≤ 1.5 s | `defeat` | The match is lost. A synthesised sub drop plays under it. Should land as a fall, not a joke. |
| `public/audio/sfx/happy.ogg` | ≤ 0.6 s | `chestPop` | The reward chest lands on the result screen. Also played by the coin explosion (`useCoinExplosion.ts`). |
| `public/audio/sfx/win.ogg` | ≤ 1.2 s | `chestOpen` | The chest is tapped open. |
| `public/audio/sfx/level-up.ogg` | ≤ 0.8 s | `unlock` | A new rune or skin is revealed. |
| `public/audio/sfx/coin-pickup.ogg` | ≤ 0.3 s | `coin` | A coin flies into the wallet. Must survive being played 6× in 300 ms. |
| `public/audio/sfx/reward-continue.ogg` | ≤ 0.6 s | `skinBuy` | A pebble skin is bought. |
| `public/audio/sfx/modal-open.ogg` | ≤ 0.4 s | `uiOpen` | Any panel opening (also played directly by `FModal.vue`). |
| `public/audio/sfx/obstacle-hit.ogg` | ≤ 0.25 s | `uiReject` | Tapping something you cannot afford / a locked node. |

### Layered (a sample UNDER a synthesised voice)

These play the recording quietly beneath the synth. The recording gives the
transient a body no oscillator has; the synth on top is what scales with
`power` and never repeats exactly. Replacing the file changes the floor of the
sound, not its shape.

| Path | Length | Cue | Notes |
| --- | --- | --- | --- |
| `public/audio/sfx/stone-cut.ogg` | ≤ 0.25 s | `place` | THE signature — a pebble hitting slate. The file is a dry stone tap; the synth adds the 70→35 Hz body, the sub and the crack. Replace with a real pebble-on-slate hit, no tail. |
| `public/audio/sfx/shrapnel.ogg` | ≤ 0.5 s | `shatter` | Rubble under the synthesised break. Replace with real stone breaking; keep the tumbling debris short. |
| `public/audio/sfx/celebration-1.ogg` | ≤ 1.5 s | `victory` | See above. |
| `public/audio/sfx/lose.ogg` | ≤ 1.5 s | `defeat` | See above. |

Samples shipped but currently **unused** (safe to delete or repurpose):
`anchor-swap`, `barricade`, `celebration-2`, `celebration-3`, `dodge`,
`gravity`, `plastic-torn-1`, `plastic-torn-2`, `wood-cut`.

## Music

| Path | Length | Notes |
| --- | --- | --- |
| `public/audio/music/trance.ogg` | 2–4 min loop | "Rune Pulse" — the default track. Seamless loop; the engine can drive `playbackRate` (`setMusicRate`), so avoid anything that breaks when pitched ±15 %. |
| `public/audio/music/bg-cozy.ogg` | 2–4 min loop | "Quiet Stone" — the alternate track, selectable in Options. |

Both names live in `options.musicTracks` in the locale files; the file map is
`MUSIC_TRACK_FILES` in `src/use/useUser.ts`.

## Synthesised cues you can replace (all in `useGameAudio.ts`)

Every one of these is generated per event. Dropping a sample in is a two-line
change (see *How to wire a new sample* below) — but read the note first,
because several of them are doing something a flat sample cannot.

| cue | what it is | a recording must… |
| --- | --- | --- |
| `pickup` | a pebble lifted off the hand: stone tick + a puff of air | be ≤ 60 ms, dry |
| `hover` | the drag crossed onto a valid tile: the softest tick in the mix | be ≤ 40 ms; it fires on every tile crossed |
| `invalid` | …onto a tile it cannot go: dull double thud | be unmusical — this is a refusal |
| `aim` | the swipe snapped to a new facing: a 12 ms detent click | be a click, not a note; fires up to 8× a second while aiming |
| `place` | **the** stone thud: body 70→35 Hz + sub + slate crack (+ `stone-cut` under it). `power` = weight; a Lv 2 merge lands heavier | scale with `power` — keep the synth, replace only the layered file |
| `reroll` | three stones rattling in a cup | be three distinct ticks in ~180 ms |
| `tick` | woodblock at 3-2-1. `power` 0→1 raises the pitch half an octave, so the deadline is audible without a glance | be a single dry hit with no tail so it can be pitch-shifted |
| `tickFinal` | the last second: brighter, longer | — |
| `reveal` | both moves shown: a whoosh opening 400→5000 Hz under two detuned sines | rise; the arrows fan out on it |
| `arrow` | a plucked string + the air of the shaft leaving | be ≤ 150 ms; several fire in the same step |
| `arrowHit` | thock: the arrow burying in stone | — |
| `beam` | the arcane hum: sines 160/163 Hz swelling in over 120 ms, a shimmer rising above | have a slow attack; it is the one cue in the combat mix that swells |
| `beamHit` | zap: square 900→200 Hz | — |
| `slash` | a blade through air: highpass noise opening upward | rise, not fall — every other impact here falls |
| `slashHit` | steel on stone: clank + bright edge + low body | — |
| `explode` | the mage's Lv 2 cross: sub 90→30 Hz, wide body, long dark tail, crackle | be the biggest thing in the mix; pairs with the screen shake |
| `shield` | damage eaten by a shield: a glassy 1100/2200 Hz ping | be ≤ 120 ms; several hits land at once |
| `heal` | two pure notes rising a fifth. The only cue with no noise in it | rise and stay clean — a bar going UP must sound like the opposite of a hit |
| `buff` | a short bright three-note arpeggio | — |
| `shatter` | stone breaking: two bursts, a low body, five staggered debris clicks. `power` = rune size (+ `shrapnel` under it) | scale with `power`; keep the tumble under 300 ms |
| `clash` | two placements on one tile: two thuds 50 ms apart and the sparks between | — |
| `knockback` | a scrape sliding 2400→400 Hz, a low push under it | move, not thud |
| `capture` | a tile changing hands: a resonant flip + a soft chord settling | be short; up to 8 tiles flip in one settle |
| `merge` | the golden Lv 2 burst: C-E-G-C rising over 180 ms, a shimmer, a thump. Deliberately the most satisfying sound in the game | be as rewarding as the one it replaces — stacking is what the player has to WANT |
| `combo` | several runes shattered at once: stacked impact + a bright hit whose pitch climbs with `power` | scale with `power` |
| `suddenDeath` | a low horn holding while a tension line climbs | be ~1 s and ominous |
| `reset` | the 0.2 s board wipe: a whoosh that pans left → right | be exactly the wipe's length; the pan is done in code |
| `countUp` | the coin tally's dry tick, pitched up as it runs | be ≤ 40 ms |
| `streak` | the flame aura climbing a step: whoosh + rumble + bright ping | — |
| `forge` | an anvil: inharmonic partials (1 : 1.77 : 2.71 : 3.42) over a strike | ring like a struck bar, not a bell |

## Worth recording (would beat the synth)

| Suggested path | Length | Cue | Why a sample would win |
| --- | --- | --- | --- |
| `public/audio/sfx/stone-thud.ogg` | ≤ 0.25 s | `place` | The signature sound. A real pebble dropped on slate, close-miked, has a crack the synth only approximates. Keep it dry and let the synth's sub carry the weight. |
| `public/audio/sfx/stone-shatter-1..3.ogg` | ≤ 0.5 s | `shatter` | Three real stone breaks, randomised. The synth's debris clicks are the weakest part of the mix. |
| `public/audio/sfx/merge-burst.ogg` | ≤ 0.6 s | `merge` | A recorded chime/harp arpeggio with a real shimmer tail. Layer under the synth's rising C-E-G-C so the pitch relation with `place` survives. |
| `public/audio/sfx/reveal-whoosh.ogg` | ≤ 0.5 s | `reveal` | A real air whoosh with a rising cutoff; the arrows fan out on it every turn, so it is the second most heard sound in the game. |
| `public/audio/sfx/victory.ogg` | ≤ 2.0 s | `victory` | The current fanfare is a generic celebration sample. A stone-and-brass sting in the game's register would own the moment. |
| `public/audio/sfx/defeat.ogg` | ≤ 1.5 s | `defeat` | Same — a stone cracking under a low drum rather than a stock sting. |
| `public/audio/sfx/arcane-drone.ogg` | 4 s loop | ambience | There is currently NO ambience under the board. A low arcane drone, volume tied to how many runes are standing, would make the arena feel inhabited between turns. Wire through `useSounds().playLoop`. |
| `public/audio/sfx/chest-open.ogg` | ≤ 1.0 s | `chestOpen` | A real latch + creak + coin spill would sell the reward better than the generic `win` sample. |

## How to wire a new sample

1. Drop the file in `public/audio/sfx/`.
2. Add it to `SAMPLE_CUES` in `src/use/useGameAudio.ts` as
   `cueName: ['file-basename', volumeRatio]` — the synth for that cue is then
   skipped automatically. (To keep the synth and play the sample UNDER it, add
   it to `LAYER_SAMPLES` instead.)
3. Add the basename to `GAMEPLAY_SFX` in `src/use/useSoundPreload.ts` so it is
   decoded on an idle slot after first paint instead of stuttering on first play.

`tests/audio/cues.test.ts` checks that every file named in either table exists
under `public/audio/sfx`, so a typo in step 2 fails the suite rather than a
portal QA console.

## Audio rules this project already enforces

* Nothing plays while an ad is on screen: the shared AudioContext is suspended
  by the pause gate, and one-shots are hard-stopped (`killOneShotSfx`).
* Music never starts *under* an ad — it resumes only after the gate clears.
* On mobile the mute button is a hard silence toggle, not a volume change,
  because the OS volume rocker owns the device level.
* Every cue is throttled per name (minimum gap + voices per window), so a
  full-board reveal or a five-rune combo reads as one event instead of mud.
