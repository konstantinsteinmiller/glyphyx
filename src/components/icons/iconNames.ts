/**
 * ─── The glyph vocabulary ───────────────────────────────────────────────────
 *
 * One flat, closed list of every icon the UI can draw. It lives in its own
 * module rather than inside `GameIcon.vue` so a component can import the *type*
 * (`GameIconName`) for a prop without pulling the SFC — and, more importantly,
 * so a typo in a call site is a compile error instead of a silently blank
 * button.
 *
 * The redesign replaced most button captions with glyphs, which makes this list
 * load-bearing: `next` is no longer the word "Next", it is `skip-forward`.
 */
export const GAME_ICON_NAMES = [
  // Transport / run control
  'play', 'pause', 'replay', 'skip-forward', 'skip-back', 'stop',
  // Navigation
  'menu', 'home', 'back', 'forward', 'close', 'check',
  // Meta screens
  // `anvil` is the upgrade shop's mark — a rising chevron over an anvil, on
  // the HUD button and the result screen's button alike, so the thing tapped
  // during a run and the thing tapped after it are one object — and
  // `chest` is now the IDLE chest on the HUD, which pays coins for waiting.
  // They were one glyph until the chest became a thing of its own; two
  // buttons that do different things may not wear the same drawing.
  'settings', 'shop', 'chest', 'anvil', 'video', 'ads', 'book', 'info', 'help',
  // Audio
  'music', 'music-off', 'sound', 'sound-off',
  // Progression
  'lock', 'unlock', 'star', 'star-empty', 'trophy', 'chart', 'leaderboard',
  // Steppers / arrows
  'plus', 'minus', 'left', 'right', 'up', 'down',
  // Game nouns
  'coin', 'gem', 'heart', 'flask', 'wheel', 'gift', 'fullscreen', 'share',
  // ── glyphyx's own run nouns ────────────────────────────────────────────
  // The five stats this game is actually about, added to the shared set because
  // they were previously re-traced per component: `squad`, `bolt` and `rate`
  // existed as byte-identical `d` strings in BOTH `RunHud.vue` and
  // `UpgradeModal.vue`, which is the exact duplication this module exists to
  // end. Geometry moved verbatim from those call sites — they are tuned against
  // each other's weight in the HUD strip, so redraw them together or not at all.
  'squad', 'bolt', 'rate', 'range', 'flame', 'skull',
  // Active skills — see `SkillBar.vue`.
  'bomb', 'shield',
  // The two per-stage weapons. They front a shop row AND the run's weapon
  // badge, which is the same rule the five stat glyphs above follow: the thing
  // bought and the thing carried must be one drawing, or the player has to
  // learn the same object twice. See `game/weapons.ts`.
  'rocket', 'gatling',
  // ── Glyphyx ─────────────────────────────────────────────────────────────
  // The nine rune glyphs (`shield` above doubles as the defense rune's), the
  // offline forge, the campaign map, the skin shop and a board tile. The rune
  // glyphs front the unlock card, the campaign modal's reward column and the
  // hint pills — the same silhouettes the renderer carves into the pebbles, so
  // the thing unlocked and the thing placed are one drawing.
  //
  // `cleave` / `roller` / `bombard` are the three late unlocks, and each icon
  // has to carry its ATTACK, not just its weapon: the axe's edge is drawn as
  // the arc it sweeps, the boulder trails the bars of its lane, and the mortar
  // is separated from its shell by the gap it lobs the round across.
  //
  // `nuker` is the odd one out and is meant to be: a hazard trefoil, a SIGN
  // rather than a weapon, because it is the one rune nobody aims.
  'sword', 'bow', 'orb', 'cross', 'cleave', 'roller', 'bombard', 'nuker', 'forge', 'map', 'skin', 'tile'
] as const

export type GameIconName = (typeof GAME_ICON_NAMES)[number]

/** Runtime guard for the places a name arrives as a plain string (a legacy
 *  `FIconButton` call site, a config blob) and must be proven before use. */
export const isGameIconName = (v: unknown): v is GameIconName =>
  typeof v === 'string' && (GAME_ICON_NAMES as readonly string[]).includes(v)
