// English source bundle. Single source of truth for translation keys — every
// new player-facing string gets a key here first; the per-language files in
// this folder mirror the shape. Vite ships each non-English locale as its own
// lazy chunk (see `src/i18n/index.ts`).
//
// Glyphyx is a zero-text-onboarding game: the words below are labels, aria
// names, result screens and menus — never instructions the player has to read
// to get started. Keep every value SHORT: most of them render on a 320 px
// phone in a pill or a chip.
export default {
  'shop': {
    'boosts': {
      'support': 'Heals 3 and sharpens its neighbours\' attack, from the very first turn.',
      'defense': 'A wall that shields its neighbours, from the very first turn.',
      'mage': 'Its beam bursts in a cross at the end, from the very first turn.',
      'archer': 'Fires at two tiles at once, from the very first turn.',
      'melee': 'Knocks its target back — three stones\' worth of steel in one drop.',
      'cleave': 'Fells all three tiles ahead at once, from the very first turn.',
      'roller': 'Ploughs through two survivors before it stops, from the very first turn.',
      'bombard': 'Shells the far rank and the tile between, from the very first turn.',
      'nuker': 'Lands at Lv 3, tough enough to hold the board it just cleared, from the very first turn.',
      'crown': 'Lands at Lv 3 — takes even a stacked rune, from the very first turn.'
    },
    'watchAd': 'Watch ad',
    'armed': 'Armed ×{n}',
    'landsAt': 'Lands at Lv {n} on your first placement next match.',
    'runesTagline': 'Your first placement of each armed rune lands at Lv {n}.',
    'tabs': {
      'skins': 'Skins',
      'runes': 'Power Runes',
    },
    'title': 'Shop',
  },
  'gameName': 'Glyphyx',
  'cancel': 'Cancel',
  'close': 'Close',
  'ok': 'Ok',
  'continue': 'Continue',
  'tapToContinue': 'Tap to continue',
  'clickToContinue': 'Click to continue',
  'rewards': 'REWARDS',
  'tip': 'Tip',
  'crazyGamesOnly': 'This game is only available on',

  // ─── Shared UI labels ─────────────────────────────────────────────────────
  // The `aria-label` of icon-only controls. Read aloud, never seen.
  'ui': {
    'next': 'Next',
    'replay': 'Replay',
    'back': 'Back',
    'play': 'Play',
    'pause': 'Pause',
    'menu': 'Menu',
    'home': 'Home',
    'info': 'Info',
    'skip': 'Skip'
  },

  // ─── HUD ──────────────────────────────────────────────────────────────────
  'hud': {
    // `{c}` chapter, `{n}` node inside it — "Level 1-3".
    'stage': 'Level {c}-{n}',
    'conquest': 'Conquest',
    // `{n}` tiles held of `{total}` needed — "5 / 8".
    'tiles': '{n} / {total}',
    'turn': 'Turn {n}',
    'you': 'You',
    'enemy': 'Enemy',
    'streak': 'Win streak',
    'streakMult': '×{n} gold',
    'suddenDeath': 'Sudden death!',
    'reroll': 'Reroll',
    'rerollsLeft': '{n} left'
  },

  // ─── Factions ─────────────────────────────────────────────────────────────
  'factions': {
    'skeleton': 'Bone Dummies',
    'goblin': 'Goblin Archers',
    'orc': 'Orc Berserkers',
    'undead': 'Undead Mages'
  },

  // ─── Runes ────────────────────────────────────────────────────────────────
  'runes': {
    'level': 'Lv {n}',
    'hp': 'HP',
    'atk': 'ATK',
    'names': {
      'melee': 'Sword',
      'archer': 'Bow',
      'mage': 'Arcane Orb',
      'defense': 'Shield',
      'support': 'Radiant Cross',
      'cleave': 'Axe',
      'roller': 'Boulder',
      'bombard': 'Mortar',
      'nuker': 'Nuker',
      'crown': 'Crown'
    },
    'descriptions': {
      'melee': 'Strikes the tile it faces. Lv 2 knocks the target back.',
      'archer': 'Skips one tile and hits the next. Lv 2 fires at two tiles.',
      'mage': 'Fires a diagonal beam through two tiles. Lv 2 explodes at the end.',
      'defense': 'Absorbs 1 damage from every hit. Lv 2 shields its neighbours.',
      'support': 'Heals friendly neighbours every turn. Lv 2 also sharpens their attack.',
      'cleave': 'Cuts the three tiles ahead — the one it faces and both beside it.',
      'roller': 'Rolls until a rune survives it, friends included. Lv 2 rolls one further.',
      'bombard': 'Shells three tiles, three ranks ahead, over any wall. Lv 2 also hits halfway.',
      'nuker': 'Detonates where it lands: every Lv 1 rune on the board dies, yours too. Lv 2 stacks live.',
      'crown': 'Takes the rune it faces and is spent doing it — it fights for you at once. Lv 2 takes stacks.'
    }
  },

  // ─── Control hints ────────────────────────────────────────────────────────
  // One pill at a time, retired the moment the thing it names has happened.
  'hints': {
    'drag': {
      'touch': 'Drag a rune onto the board',
      'desktop': 'Drag a rune onto the board'
    },
    'aim': {
      'touch': 'Let go on the edge it should face',
      'desktop': 'Move to the edge it should face, then click'
    },
    'archer': {
      'touch': 'Bows skip a tile and hit the next',
      'desktop': 'Bows skip a tile and hit the next'
    },
    'stack': {
      'touch': 'Drop a matching rune on yours to level it up',
      'desktop': 'Drop a matching rune on yours to level it up'
    },
    'conquest': {
      'touch': 'Hold 8 tiles to win',
      'desktop': 'Hold 8 tiles to win'
    },
    'siege': {
      'touch': 'Surrounded! Break out and hold 8 tiles',
      'desktop': 'Surrounded! Break out and hold 8 tiles'
    },
    'mage': {
      'touch': 'The orb beams two tiles diagonally',
      'desktop': 'The orb beams two tiles diagonally'
    },
    'defense': {
      'touch': 'The shield blocks arrows and beams',
      'desktop': 'The shield blocks arrows and beams'
    },
    'support': {
      'touch': 'The cross heals and sharpens its neighbours',
      'desktop': 'The cross heals and sharpens its neighbours'
    },
    'cleave': {
      'touch': 'The axe cuts all three tiles ahead',
      'desktop': 'The axe cuts all three tiles ahead'
    },
    'roller': {
      'touch': 'The boulder rolls on through everything it breaks',
      'desktop': 'The boulder rolls on through everything it breaks'
    },
    'bombard': {
      'touch': 'The mortar shells three tiles, three ranks away',
      'desktop': 'The mortar shells three tiles, three ranks away'
    },
    'correct': {
      'touch': 'Tap an arrow or swipe to re-aim',
      'desktop': 'Click & drag anywhere, or press an arrow key / WASD, to re-aim'
    },
    'tap': {
      'touch': 'Tap a tile to place it',
      'desktop': 'Click a tile to place it'
    },
    'nuker': {
      'touch': 'The nuker destroys every Lv 1 rune — including yours',
      'desktop': 'The nuker destroys every Lv 1 rune — including yours'
    },
    'crown': {
      'touch': 'The crown takes the rune it faces — it fights for you now',
      'desktop': 'The crown takes the rune it faces — it fights for you now'
    }
  },

  // ─── Words the canvas prints ──────────────────────────────────────────────
  // Floating text and banners drawn by the renderer. Uppercase where the
  // glyph font looks best; translate for punch, not for literalness.
  'canvas': {
    'level': 'Lv.{n}',
    'combo': '×{n} COMBO',
    'clash': 'CLASH!',
    'victory': 'VICTORY!',
    'defeat': 'DEFEAT',
    'reveal': 'REVEAL',
    'suddenDeath': 'SUDDEN DEATH',
    'turn': 'TURN {n}',
    'you': 'YOU',
    'foe': 'FOE',
    'reroll': 'REROLL',
    'lastTurn': 'LAST TURN'
  },

  // ─── The stage banner ─────────────────────────────────────────────────────
  'banner': {
    'duel': '1v1 Duel',
    'siege': '1v3 Siege',
    'vs': 'vs {name}',
    'unlocked': 'Unlocked!'
  },

  // ─── Result screen ────────────────────────────────────────────────────────
  'result': {
    'chestCoins': 'Chest +{n}',
    'victory': 'Victory!',
    'defeat': 'Defeat',
    'turns': 'Turns',
    'playAgain': 'Play again',
    'nextStage': 'Next level',
    'newRecord': 'New record!',
    'streakBonus': 'Streak ×{n}',
    // Renders as `[film] 3× [coin] (+123)`.
    'tripleCoins': '3×',
    'tripleBonus': '(+{n})',
    'tripleClaimed': 'Coins tripled!',
    'chestTap': 'Tap the chest!',
    'newRune': 'New rune',
    'newSkin': 'New skin',
    'skins': 'Rune skins',
    'reasons': {
      'conquest': 'Eight tiles conquered',
      'conquestLost': 'The enemy conquered eight tiles',
      'eliminated': 'Every enemy rune shattered',
      'overrun': 'Your runes were overrun',
      'turnLimit': 'Decided on tiles held',
      'suddenDeath': 'Sudden death',
      'siegeHeld': 'You held the line',
      'siegeBroken': 'The siege broke you'
    }
  },

  // ─── Campaign map ─────────────────────────────────────────────────────────
  'campaign': {
    'title': 'Campaign',
    'chapter': 'Chapter {n}',
    'cleared': 'Cleared',
    'current': 'Current',
    'locked': 'Locked',
    'modes': {
      '1v1': '1v1 Duel',
      'siege': '1v3 Siege'
    },
    'objectives': {
      'conquest': 'Hold 8 tiles',
      'eliminate': 'Destroy every enemy rune',
      'siege': 'Break the siege'
    },
    'reward': 'Reward',
    'play': 'Play',
    'replay': 'Replay',
    'nextUnlock': 'Win Level {c}-{n} for',
    'nextUnlockAria': 'Win Level {c}-{n} to unlock {rune}'
  },

  // ─── Rune skins (the coin sink) ───────────────────────────────────────────
  'skins': {
    'title': 'Rune Skins',
    'owned': 'Owned',
    'equipped': 'Equipped',
    'equip': 'Equip',
    'buy': 'Buy',
    'names': {
      'river': 'River Stone',
      'obsidian': 'Obsidian',
      'jade': 'Jade',
      'amber': 'Amber',
      'marble': 'Marble',
      'ember': 'Ember',
      'sapphire': 'Sapphire',
      'ruby': 'Ruby',
      'diamond': 'Diamond'
    },
    'tagline': 'Every rune you place wears it.',
    'needMore': '{n} more coins',
    'blurbs': {
      'river': 'Warm river sandstone, the glyph cut deep and lit from within.',
      'obsidian': 'Knapped volcanic glass with a cold neon line.',
      'jade': 'Polished green jade, the glyph inlaid in gold.',
      'amber': 'A faceted amber gem, glowing from the inside.',
      'marble': 'White marble, carved deep and shadowed.',
      'ember': 'A slab of cooled lava, the glyph burning through the cracks.',
      'sapphire': 'Deep blue sapphire, step cut, a white star held under the table.',
      'ruby': 'A domed ruby cabochon, the glyph burning red beneath it.',
      'diamond': 'Brilliant-cut diamond, the glyph split into a spectrum.'
    }
  },

  'ranks': {
    'tab': 'Ranks',
    'title': 'Rune ranks',
    'tagline': 'Every rank is +{n} max HP — the same for every rune.',
    'rank': 'Rank {n}/{max}',
    'maxed': 'Maxed',
    'hpGain': '+{n} HP',
    'next': 'Next: +{n} HP',
    'upgrade': 'Upgrade',
    'locked': 'Not unlocked yet',
    'free': 'Free',
    'freeGift': 'Free upgrade!',
    'freeIn': 'New gift in {t}',
    'freeTaken': 'Come back for the next one',
    'nukerUnlock': 'Unlock the Nuker',
    'nukerLocked': 'Or win it at Level 4-1',
    'mystery': '???',
    'mysteryHint': 'Keep winning to find out',
    'mysteryAria': 'A rune you have not unlocked yet',
    'nextUp': 'Next up',
    'winsAt': 'Win it at Level {c}-{n}'
  },

  // ─── The offline rune forge ───────────────────────────────────────────────
  // A drawing with a number under it; these are what a screen reader gets.
  'forge': {
    'label': 'Rune Forge',
    'ready': 'Collect {n} coins from the forge',
    'filling': 'Rune Forge — forging',
    'full': 'Rune Forge — full',
    'perHour': '+{n} / h'
  },

  // ─── Leaderboard ──────────────────────────────────────────────────────────
  'leaderboard': {
    'title': 'Leaderboard',
    'rank': '#',
    'player': 'Player',
    'stage': 'Level',
    'streak': 'Streak',
    'empty': 'No matches posted yet. Be the first.',
    'failed': "Couldn't reach the leaderboard.",
    'loading': 'Loading…',
    'you': 'You',
    'yourRank': 'You are #{n}',
    'of': 'of {n} players'
  },

  // ─── Options ──────────────────────────────────────────────────────────────
  'options': {
    'title': 'Options',
    'general': 'General',
    'audio': 'Audio',
    'language': 'Language',
    'difficulty': 'Difficulty',
    'soundEffects': 'Sound Effects',
    'music': 'Music',
    'musicTrack': 'Music Track',
    'musicTracks': {
      'emberlight': 'Emberlight',
      'cozy': 'Quiet Stone',
      'trance': 'Rune Pulse'
    },
    'close': 'Save & Close',
    'difficulties': {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    },
    'difficultyHints': {
      'easy': 'Enemies hesitate and misfire more often.',
      'medium': 'The standard campaign.',
      'hard': 'Enemies plan sharper and stack faster.'
    }
  },

  // ─── System ───────────────────────────────────────────────────────────────
  'adsBlocked': {
    'title': "Couldn't show ad",
    'body': 'We tried to show you a video so you could earn your reward, but something on your browser is blocking ads.',
    'allowPrefix': 'Please allow ads on',
    'allowSuffix': '(or pause your ad-blocker for this game) and try again.',
    'gotIt': 'Got it'
  },
  'saveStatus': {
    'restoredTitle': 'Cloud save restored',
    'restoredBody': '+{n} bonus coins for the recovery',
    'tap': 'tap',
    'pausedTitle': 'Cloud sync paused',
    'pausedBody': 'Playing offline. Your progress is saved here.',
    'retry': 'Retry',
    'dismiss': 'dismiss'
  },
  'loading': {
    'tooLong': 'Loading taking too long? Try disabling your ad blocker and refresh.'
  },
  'license': {
    'denied': 'Access Denied: Please purchase a license.'
  }
}
