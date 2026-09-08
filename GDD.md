# GAME DESIGN DOCUMENT: GLYPHYX
**Project Name:** Glyphyx (Momentum Strategy)  
**Document Version:** 1.0.0  
**Target Platforms:** Mobile (iOS / Android) primary; Web / Desktop secondary  
**Genre:** Fast-Paced Tactical Grid Battler / Momentum Puzzle Strategy  
**Target Audience:** Casual & Mid-Core Strategy Players, Puzzle Fans, "Lazy Learners"  
**Session Length:** ~90 seconds per match | 10–20 minutes average session  
**KPI Benchmarks:** >50% D1 Retention, >15 min Average Daily Session Length

---

## 1. EXECUTIVE SUMMARY & CORE CONCEPT

### 1.1 High-Level Overview
**Glyphyx** is a ultra-fast, visually intuitive tactical grid game played on a 4x4 board. Players drag stone pebble runes with glowing elemental symbols onto board tiles, swipe to set their facing direction, and watch turns resolve simultaneously in dramatic, action-packed combat rounds.

The game eliminates tedious tutorials and reading. Every mechanic is taught through instant visual feedback, high-impact combat animations, and screen-shattering destruction effects. With 90-second match times, zero loading delays, and deep strategic synergies created by unit stacking and directional targeting, *Glyphyx* delivers an addictive "just one more round" gameplay loop.

```
       [ PLAYER DECK / HAND ]
       (Melee) (Archer) (Mage) (Defense) (Support)
                  |
                  v  (Drag & Swipe Direction)
   +---+---+---+---+
   |   |   | E | E |  <- Enemy Territory
   +---+---+---+---+
   |   |   |   |   |
   +---+---+---+---+
   |   | P |   |   |  <- Active Combat Zone
   +---+---+---+---+
   | P | P |   |   |  <- Player Territory
   +---+---+---+---+
   (Goal: Conquer 8 total tiles to instantly win)
```

### 1.2 Core Design Pillars
1. **Zero-Text Onboarding ("Lazy Learner Friendly"):** Absolutely no text walls or mandatory tutorial popups. Every rule is self-explanatory within 3 seconds of interaction.
2. **Instant Dopamine Hook:** Players win their first round within 15 seconds, accompanied by celebratory particle bursts, gold coins, and immediate progress.
3. **Simultaneous Turn Momentum:** Both sides plan in secret during a 5-second window, leading to simultaneous high-stakes reveals and action resolution.
4. **Low Barrier, High Ceiling:** Only 1 rune placed per turn, keeping short-term choices trivial while emergent combinations create vast long-term strategic depth.
5. **Hyper-Snappy Game Loop:** 0.2-second match resets allow players to lose, adapt, and retry instantly without friction or loading fatigue.

---

## 2. CORE GAME MECHANICS & RULES

### 2.1 The Grid & Win Conditions
* **Grid Dimensions:** 4x4 board (16 tiles total).
* **Conquest Threshold:** The first player (or side) to control **8 or more tiles** simultaneously at the end of a resolution phase wins immediately.
* **Secondary Win Condition:** If the turn limit (10 turns / 90 seconds) is reached, the player controlling the highest number of tiles wins. Ties trigger a sudden-death over-drive turn.

### 2.2 Turn Execution Cycle
Each match is played in rapid, synchronized turns following a strict 3-step loop:

```
+-------------------------------------------------------------------+
| 1. PLANNING PHASE (5 sec) -> 2. REVEAL PHASE -> 3. RESOLUTION    |
| - Drag pebble onto tile    - Both moves shown  - All runes fire   |
| - Swipe to aim direction   - Preview paths      - Tiles captured  |
+-------------------------------------------------------------------+
```

#### Step 1: Planning Phase (5-Second Countdown)
* Players select 1 pebble from their available hand (3 random pebbles drawn from a 5-rune deck).
* Drag the pebble to any **unoccupied tile** OR onto a **friendly occupied tile** to stack.
* While holding the finger down, a small swipe sets the rune's facing direction.
* Defense and Support runes auto-lock without requiring directional swipes.

#### Step 2: Reveal Phase (0.3 Seconds)
* The board locks. Both players' choices are revealed at once.
* Glowing directional arrows highlight the trajectory of all attacks and spells.

#### Step 3: Resolution Phase (1.2 Seconds)
* All active runes on the board fire simultaneously.
* Damage is calculated and applied to target tiles.
* Runes reduced to 0 HP shatter into stone rubble, neutralizing the tile.
* Surviving runes on enemy or neutral tiles claim ownership of that tile for the controlling player.

---

## 3. RUNE & GLYPH SYSTEM

Runes are represented as smooth, dark river pebbles with glowing neon glyphs carved into their surface.

```
       [ STONE PEBBLE RUNE LAYOUT ]
             /--------------\
            /   [GLYPH ICON]  \
           |   (Glowing Neon)  |
           |    [SWIPE ARROW]  |
            \    [HP / LVL]   /
             \--------------/
```

### 3.1 Complete Rune Roster

| Rune Type | Glyph Icon & Color | Targeting & Direction | Base Stats (Lv. 1) | Ability & Attack Behavior | Level 2 Stacked Bonus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Melee** | Crimson Sword | Cardinal (Up, Down, Left, Right) | HP: 3 | Atk: 2 | Attacks the 1 adjacent tile in facing direction. Deals direct physical damage. | **HP: 6 | Atk: 4.** Adds knockback effect—pushes enemy back 1 tile if target survives. |
| **Archer** | Emerald Bow | Cardinal (Up, Down, Left, Right) | HP: 2 | Atk: 2 | **Skips 1st tile**, strikes the 2nd tile ahead. Bypasses frontline units completely. | **HP: 4 | Atk: 4.** Fires a 2-arrow volley hitting both 2nd and 3rd tiles ahead. |
| **Mage** | Amethyst Arcane Orb | Diagonal (4 Diagonal Angles) | HP: 2 | Atk: 3 | Fires a diagonal energy beam penetrating through **2 diagonal tiles**, damaging all targets. | **HP: 4 | Atk: 5.** Expands into a 3x3 cross-explosion around the end destination tile. |
| **Defense** | Sapphire Shield | **Omni-Directional** (No swipe needed) | HP: 6 | Atk: 0 | Absorbs incoming attacks. Automatically mitigates 1 extra damage from all directions. | **HP: 12 | Atk: 0.** Grants +1 HP shield aura to all adjacent friendly runes at round start. |
| **Support** | Topaz Radiant Cross | **Omni-Directional** (No swipe needed) | HP: 3 | Atk: 0 | Restores **+1 HP** to all adjacent friendly runes at the end of each resolution phase. | **HP: 6 | Atk: 0.** Heals **+2 HP** and grants +1 bonus Attack power to adjacent friendly runes. |

---

### 3.2 Stacking & Upgrade Mechanics
* **Mechanic:** Dragging an identical rune onto a tile already occupied by that rune merges them into a **Level 2 Rune**.
* **Visual FX:** A golden burst ring expands from the stone pebble; the carved glyph glows brighter with a metallic border, and a "Lv. 2" badge appears.
* **Benefits:**
    * Immediately doubles current and maximum HP.
    * Amplifies attack damage or support effectiveness.
    * Unlocks enhanced secondary abilities (e.g., Archer multi-shot, Mage AoE explosion).
* **Cap:** Max Level 2 per tile to preserve strategic mobility and prevent invincible mega-towers.

---

## 4. GAME MODES & CAMPAIGN STRUCTURE

### 4.1 Mode 1: 1v1 Classic Battle (PvP & Casual AI)
* **Setup:** Standard 4x4 grid. Player occupies bottom row (4 tiles); opponent occupies top row (4 tiles). Middle 8 tiles are neutral gray stone.
* **Goal:** Expand across the center line and secure 8 total tiles before the opponent.

```
+---+---+---+---+  Row 4 (Enemy Base)
| E | E | E | E |
+---+---+---+---+  Row 3 (Neutral)
| . | . | . | . |
+---+---+---+---+  Row 2 (Neutral)
| . | . | . | . |
+---+---+---+---+  Row 1 (Player Base)
| P | P | P | P |
+---+---+---+---+
```

---

### 4.2 Mode 2: 1v3 Siege Campaign (PvE Territory Expansion)
In campaign mode, the player acts as a surrounded commander holding the center of the board against 3 distinct enemy AI factions.

```
          [ NORTH FACTION: ORC BERSERKERS ]
                 +---+---+---+---+
                 | E1| E1| E1| E1|
                 +---+---+---+---+
[ WEST FACTION:  | E2| P | P | E3|  [ EAST FACTION:
 GOBLIN ARCHERS] +---+---+---+---+   UNDEAD MAGES ]
                 | E2| P | P | E3|
                 +---+---+---+---+
                 | . | . | . | . |
                 +---+---+---+---+
```

* **Board Configuration:**
    * **Player Starting Area:** Central 2x2 grid (4 tiles).
    * **Enemy Factions:**
        1. **North (Orcs):** High HP Melee heavy hitters.
        2. **West (Goblins):** Rapid ranged archers.
        3. **East (Undead):** Diagonal Mage spammers.
* **Rogue-lite Campaign Map:**
    * The campaign world map is divided into chapters, each containing 8 territory nodes.
    * Conquering a node awards permanent **Rune Chests**, unlocking new runes and rune cosmetics.

---

## 5. FIRST 15 SECONDS ONBOARDING & RETENTION ENGINE

### 5.1 The "Lazy Learner" Onboarding Script

To guarantee zero cognitive drop-off and maximize Day 1 retention (>50%), Level 1-1 uses zero text and forces instant dopamine delivery:

```
[00:00 - App Launch] -> Instant transition directly to Level 1-1 Arena (No Loading Screens)
[00:02 - Ghost Hint] -> Faint animated finger drags Sword Pebble to tile (0,1) & swipes UP
[00:04 - User Drag ] -> Player replicates gesture in < 2 seconds with soft haptic snap
[00:05 - Resolution] -> Player Sword attacks 1-HP Skeleton. Skeleton shatters with Screen Shake
[00:07 - Victory!  ] -> Gold explosion, "VICTORY!" audio cue, Chest pops open
[00:10 - Claim     ] -> Player taps chest -> Unlocks Archer Rune
[00:15 - Level 1-2 ] -> Next level starts immediately
```

```
+-----------------------------------------------------------------------+
| ONBOARDING DESIGN PRINCIPLES FOR LAZY LEARNERS                        |
+-----------------------------------------------------------------------+
| 1. NO DIALOGUE BOXES: Never show a "Tap to Continue" text window.     |
| 2. NO TUTORIAL POPUPS: Teach rules through visual combat outcomes.   |
| 3. FORCED EARLY SUCCESS: Level 1-1 to 1-3 cannot be lost.             |
| 4. REWARD DENSITY: Award a chest or new rune every 45 seconds early on.|
+-----------------------------------------------------------------------+
```

---

### 5.2 Retention Engine & Session Length Drivers

To maintain an average session length of **10–20 minutes** with **>50% D1 Retention**, the game implements three core psychological drivers:

#### 1. Frictionless Match Iteration
* **0.2-Second Replay:** Tapping "Play Again" instantly wipes the board with a glowing wave effect and resets the grid without returning to the main menu.
* **Micro-Matches:** A full game takes 60–90 seconds, allowing players to squeeze in 10–15 matches per 15-minute session.

#### 2. AFK / Offline Rune Forge
* Generating passive **Rune Shards** every hour offline ensures players are greeted with valuable loot upon opening the app on Day 1.

#### 3. Win-Streak Momentum Multipliers
* Winning consecutive matches grants visual flame aura effects on the player's board avatar and multiplies conquest gold rewards by up to 3x.

---

## 6. USER INTERFACE & ART DIRECTION

### 6.1 Visual Style & Theme
* **Aesthetic:** Mythic Stone & Neon Magic.
* **Colors:** Dark slate stone background tiles accented by vibrant glowing neon rune symbols (Crimson Red, Amethyst Purple, Sapphire Blue, Emerald Green, Topaz Gold).
* **Tactile Feedback:** Pebble placements produce a heavy stone "thud" audio effect accompanied by haptic controller rumble.

### 6.2 Screen Layout (Mobile Portrait)

```
+---------------------------------------+
| [Profile]   [Stage 3-4]   [Settings]  |
| [ Conquest Progress: |||||||.. 7/8 ]  |
+---------------------------------------+
|                                       |
|            4x4 GAME BOARD             |
|                                       |
|    +-----+-----+-----+-----+          |
|    | (E) | (E) |     |     |          |
|    +-----+-----+-----+-----+          |
|    |     | [M] |     |     |          |
|    +-----+-----+-----+-----+          |
|    | [S] |     | [A] |     |          |
|    +-----+-----+-----+-----+          |
|    | [D] | [D] |     |     |          |
|    +-----+-----+-----+-----+          |
|                                       |
+---------------------------------------+
|        [ TIMER: 00:04 ]               |
+---------------------------------------+
|  HAND DECK:                           |
|  +---+  +---+  +---+                  |
|  | S |  | A |  | M |    [REROLL]      |
|  +---+  +---+  +---+                  |
+---------------------------------------+
```

---

## 7. BALANCE MATRIX & NUMERICAL FORMULAS

### 7.1 Combat Resolution Priority
When multiple runes fire simultaneously, interactions resolve in the following deterministic sequence:

1. **Defense / Shields:** Passive mitigation values active.
2. **Support Healing:** Heals applied to existing damaged runes.
3. **Ranged Attacks (Archer & Mage):** Projectiles hit target tiles simultaneously.
4. **Melee Attacks:** Sword strikes resolve.
5. **Tile Control Recalculation:** Neutralization and conquest ownership updated.

---

### 7.2 Numerical Scaling Formula

The HP and Damage values follow a strictly linear progression to keep mental math trivial:

$$	ext{Base Damage (Lv. 2)} = 	ext{Base Damage (Lv. 1)} 	imes 2$$

$$	ext{Base HP (Lv. 2)} = 	ext{Base HP (Lv. 1)} 	imes 2$$

$$	ext{Conquest Condition} = \lceil 	ext{Total Board Tiles} 	imes 0.5
ceil = 8 	ext{ Tiles}$$

---

## 8. TECHNICAL SPECIFICATIONS & INPUT HANDLING

### 8.1 Input State Machine
The drag-and-swipe control scheme uses a simple 3-state machine designed for low-latency mobile touchscreens and mouse input:

```
[ TOUCH DOWN ] -> Detect pebble in Hand Deck
       |
       v
[ DRAG MOVEMENT ] -> Project 3D ghost pebble onto grid + hover target visual
       |
       v
[ TOUCH RELEASE + SWIPE VECTOR ]
       |---> If swipe magnitude < threshold: Snap default direction (UP)
       |---> If swipe magnitude >= threshold: Snap angle to nearest 45° / 90° vector
```

### 8.2 Network & Determinism Architecture
* **Simultaneous Turn Synchronization:** Inputs are transmitted as lightweight 8-byte packets containing `(RuneID, TileIndex, DirectionVector)`.
* **Client-Side Simulation:** Combat outcome is completely deterministic, allowing both client devices to simulate identical visual animations locally without state lag.

---

## 9. FUTURE EXPANSION ROADMAP

* **Phase 1 (Launch):** Core 5 Runes, 1v1 Mode, 1v3 Campaign Chapter 1 (40 Nodes).
* **Phase 2 (v1.1):** 3 New Hybrid Runes (e.g., Flame Mage, Shield-Bash Guardian).
* **Phase 3 (v1.2):** Guild Boss Raids (Co-op 2v4 Board Defense).

---
*End of Game Design Document.*