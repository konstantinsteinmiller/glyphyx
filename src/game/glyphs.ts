import { DIR_VEC, RUNES, type Dir, type RuneType } from './rules'

/**
 * ─── The ten glyphs ─────────────────────────────────────────────────────────
 *
 * Each is ONE path in a 100×100 box, filled with the `nonzero` rule. Solid
 * parts wind clockwise, holes (the sword's fuller, the shield's cross, the
 * orb's ring, the boulder's chips, the mortar's bore) wind the other way, so a
 * glyph is a single `fill()` — which is what lets the renderer
 * bake it with a glow in one pass and keeps it legible at 24 px: no strokes,
 * no thin lines, solid mass with one strong silhouette per rune.
 *
 * The same paths drive the pebble sprites on the field, the hand, the unlock
 * card and any DOM icon that needs a rune, so the thing bought and the thing
 * placed are one drawing.
 */
export const GLYPH_PATHS: Record<RuneType, string> = {
  // A broad sword, point up: a wide blade with a fuller cut down it, a heavy
  // cross-guard, a short grip and a round pommel.
  melee:
    'M50 2 L65 22 L62 58 L38 58 L35 22 Z ' +
    'M47 26 L47 50 L53 50 L53 26 Z ' +
    'M20 58 L80 58 L80 68 L20 68 Z ' +
    'M43 68 L57 68 L57 84 L43 84 Z ' +
    'M50 88 m-10 0 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0 Z',
  // A recurve bow with its string, an arrow nocked and flying right — the head
  // is the biggest thing on it, so the direction reads at 24 px.
  //
  // The limb is a CRESCENT of even thickness, not a filled belly. That is the
  // whole difference between this drawing and the one it replaces: the old
  // limb ran from the string to two thirds across the box as one solid mass,
  // which reads as a bow only while the glyph is a glowing OUTLINE. The
  // moment a skin fills it — jade's gold inlay, marble's carved ink, amber's
  // lit interior — the belly became a solid sail with a stick through it, and
  // the same rune looked like a different object on every material. A stroke
  // of steady width survives every one of the six ways this game carves a
  // glyph, which is the only test a glyph has to pass.
  //
  // It is also the DOM icon's geometry, scaled: `bow` in `iconPaths.ts` is
  // this drawing in a 24-box, so the stone in the hand and the icon on the
  // unlock card are one bow rather than two.
  archer:
    'M25.8 10 C53 19 66 33.5 66 50 C66 66.5 53 81 25.8 90 ' +
    'L22.1 80.8 C44 72.6 55.5 62.6 55.5 50 C55.5 37.4 44 27.4 22.1 19.2 Z ' +
    'M21.7 11.7 L29.6 11.7 L29.6 88.3 L21.7 88.3 Z ' +
    'M8 44 L86 44 L86 56 L8 56 Z ' +
    'M78 32 L100 50 L78 68 Z ' +
    'M10 38 L20 50 L10 62 L0 50 Z',
  // An arcane orb: a solid core inside a ring, four sparks on the diagonals.
  mage:
    'M50 50 m-20 0 a20 20 0 1 1 40 0 a20 20 0 1 1 -40 0 Z ' +
    'M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0 Z ' +
    'M50 50 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0 Z ' +
    'M14 5 L23 14 L14 23 L5 14 Z M86 5 L95 14 L86 23 L77 14 Z ' +
    'M14 77 L23 86 L14 95 L5 86 Z M86 77 L95 86 L86 95 L77 86 Z',
  // A heater shield with a cross cut clean through it (one hole, so the
  // arms meet without a filled square at the crossing).
  defense:
    'M50 3 L92 16 C92 50 78 80 50 97 C22 80 8 50 8 16 Z ' +
    'M45 22 L45 44 L27 44 L27 54 L45 54 L45 78 L55 78 L55 54 L73 54 L73 44 L55 44 L55 22 Z',
  // A radiant cross: a thick plus with four rays between the arms.
  support:
    'M40 3 L60 3 L60 40 L97 40 L97 60 L60 60 L60 97 L40 97 L40 60 L3 60 L3 40 L40 40 Z ' +
    'M24 15 L33 24 L24 33 L15 24 Z M76 15 L85 24 L76 33 L67 24 Z ' +
    'M24 67 L33 76 L24 85 L15 76 Z M76 67 L85 76 L76 85 L67 76 Z',
  // A broad axe, bit up: a crescent blade that spans nearly the whole box with
  // its horns drooping, on a haft with a round pommel. The width IS the
  // meaning — this is the rune that swings across three tiles at once, and the
  // arc of the edge is the same arc the attack draws on the board.
  cleave:
    'M6 44 C10 18 28 4 50 4 C72 4 90 18 94 44 ' +
    'C84 30 70 26 50 26 C30 26 16 30 6 44 Z ' +
    'M45 20 L55 20 L55 86 L45 86 Z ' +
    'M50 88 m-9 0 a9 9 0 1 1 18 0 a9 9 0 1 1 -18 0 Z',
  // A boulder mid-roll: a chipped angular mass with two cracks knocked out of
  // it (counter-wound, so they read as holes in the rock) and two speed bars
  // trailing behind. The mass is deliberately off-centre to the right — a rock
  // sitting still is the mage's orb; a rock that has left its bars behind is
  // travelling.
  roller:
    'M56 16 L76 22 L88 38 L90 58 L78 76 L58 84 L38 80 L26 66 L24 44 L34 26 Z ' +
    'M48 36 L40 50 L52 54 L58 42 Z ' +
    'M66 58 L60 70 L72 72 L76 60 Z ' +
    'M2 36 L20 36 L20 46 L2 46 Z ' +
    'M2 56 L20 56 L20 66 L2 66 Z',
  // A mortar: a squat tube canted up to the right on a heavy base plate, its
  // bore punched out of the muzzle, and the shell already in the air above it.
  // The gap between tube and shell is the point — this rune never touches what
  // stands in front of it, it drops its round three ranks away.
  bombard:
    'M14 86 L86 86 L78 98 L22 98 Z ' +
    'M25 72 L65 30 L83 46 L43 88 Z ' +
    'M70 36 L64 42 L70 48 L76 42 Z ' +
    'M97 5 L94 17 L84 24 L76 17 L79 7 Z',
  // The hazard trefoil: a solid core with three heavy blades at 120°, the gap
  // between core and blades left open. Every other rune on the roster is an
  // OBJECT — a sword, a bow, an axe, a tube — because every other rune is a
  // weapon you aim. This one is a warning sign, because it is not aimed at
  // anything: it goes off where it lands and takes the whole board with it,
  // your own runes included. The trefoil is the one silhouette a player reads
  // as "everything near this dies" without being told, and at 24 px it cannot
  // be confused with the orb (concentric rings) or the boulder (a lopsided
  // mass) the way a plain burst could.
  nuker:
    'M38 29.2 L27 10.2 A46 46 0 0 1 73 10.2 L62 29.2 A24 24 0 0 0 38 29.2 Z ' +
    'M74 50 L96 50 A46 46 0 0 1 73 89.8 L62 70.8 A24 24 0 0 0 74 50 Z ' +
    'M38 70.8 L27 89.8 A46 46 0 0 1 4 50 L26 50 A24 24 0 0 0 38 70.8 Z ' +
    'M50 36 A14 14 0 1 1 50 64 A14 14 0 1 1 50 36 Z',
  // A crown: three peaks over a heavy band, with one gem cut clean out of the
  // band (counter-wound, so it is a hole). Every other glyph is a thing that
  // does damage; this one is a thing that commands, and a crown is the only
  // silhouette that says "this stone is MINE now" without a word of text. The
  // peaks are deliberately unequal — the middle one tallest — so the shape
  // still reads as a crown rather than a saw at 24 px.
  crown:
    'M8 72 L4 24 L27 47 L50 12 L73 47 L96 24 L92 72 Z ' +
    'M6 68 L94 68 L94 90 L6 90 Z ' +
    'M50 72 L43 79 L50 86 L57 79 Z'
}

/** The neon colour of each glyph — the GDD's palette, shared with the roster. */
export const GLYPH_COLORS: Record<RuneType, string> = {
  melee: RUNES.melee.color,
  archer: RUNES.archer.color,
  mage: RUNES.mage.color,
  defense: RUNES.defense.color,
  support: RUNES.support.color,
  cleave: RUNES.cleave.color,
  roller: RUNES.roller.color,
  bombard: RUNES.bombard.color,
  nuker: RUNES.nuker.color,
  crown: RUNES.crown.color
}

const path2dCache = new Map<RuneType, Path2D>()

/** The glyph as a `Path2D`, built once per type. Only callable where `Path2D` exists. */
export const glyphPath = (type: RuneType): Path2D => {
  let p = path2dCache.get(type)
  if (!p) {
    p = new Path2D(GLYPH_PATHS[type])
    path2dCache.set(type, p)
  }
  return p
}

/**
 * Fill the glyph centred on the current origin, `size` px across.
 *
 * Colour, glow and alpha are the caller's — this only sets the geometry, so
 * one function serves the carved glyph, its glow layer and a flat DOM icon.
 */
export const drawGlyph = (ctx: CanvasRenderingContext2D, type: RuneType, size: number): void => {
  const s = size / 100
  ctx.save()
  ctx.translate(-size / 2, -size / 2)
  ctx.scale(s, s)
  ctx.fill(glyphPath(type))
  ctx.restore()
}

/** An SVG `d` attribute for a DOM `<svg viewBox="0 0 100 100">`. */
export const glyphSvgPath = (type: RuneType): string => GLYPH_PATHS[type]

/**
 * ─── Which way each glyph already points ────────────────────────────────────
 *
 * Every glyph above was drawn facing SOMEWHERE: the sword's point is up, the
 * bow's arrow flies right, the boulder has left its speed bars behind on the
 * left. That heading is a fact about the drawing, and until now nothing read
 * it — a rune aimed right sat on the board with its sword still pointing at
 * the ceiling, and the only thing that said "right" was a chevron the size of
 * a fingernail.
 *
 * So the renderer turns the stone instead. `glyphSpin` is the angle it has to
 * turn through for the glyph's own heading to land on the facing, and because
 * the heading lives here — beside the path it describes — a redrawn glyph
 * corrects its own rotation.
 *
 * An omni rune has no heading and never turns: a shield pointing somewhere
 * would be a lie, and the trefoil means "everything near this dies".
 */
export const GLYPH_HEADING: Record<RuneType, Dir> = {
  // The sword's point, the axe's bit, the mortar's muzzle and the crown's
  // tallest peak are all drawn toward the top of the box.
  melee: 'up',
  cleave: 'up',
  bombard: 'up',
  crown: 'up',
  // The arrow is nocked and flying right; the boulder is travelling right,
  // which is why its speed bars trail off the left edge.
  archer: 'right',
  roller: 'right',
  // The orb aims on the DIAGONALS, and `defaultDir` starts a player's at `ur`
  // — so that is the heading a freshly placed one is already wearing.
  mage: 'ur',
  // No heading: these three never face anything.
  defense: 'omni',
  support: 'omni',
  nuker: 'omni'
}

/**
 * How far a stone must turn for its glyph to point `dir`, in radians.
 *
 * Zero whenever there is nothing to turn — an omni rune, a facing it does not
 * have, or a glyph already drawn that way — so a caller can rotate
 * unconditionally and pay nothing for the runes that do not move.
 */
export const glyphSpin = (type: RuneType, dir: Dir): number => {
  if (dir === 'omni') return 0
  const heading = GLYPH_HEADING[type]
  if (heading === 'omni' || heading === dir) return 0
  const [hx, hy] = DIR_VEC[heading]
  const [dx, dy] = DIR_VEC[dir]
  // Wrapped into (-PI, PI] so the stone always turns the SHORT way round: a
  // sword going from up to left swings a quarter turn widdershins, never three
  // quarters the other way.
  const raw = Math.atan2(dy, dx) - Math.atan2(hy, hx)
  return Math.atan2(Math.sin(raw), Math.cos(raw))
}
