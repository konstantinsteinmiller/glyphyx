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

Runes are carved stone PLAQUES with glowing neon glyphs cut into their faces.

**A rune says what it is twice: in its glyph, and in its OUTLINE.** A glyph at
hand-tray size is four dark strokes in a hollow; a silhouette is the whole
object, and it is what a player actually reads across a board of forty stones.
So the shape belongs to the RUNE TYPE and the skin only decides how that shape
is worked:

| Rune | Silhouette |
| :--- | :--- |
| **Sword** | a blade-tip plaque: a sharp point at the top over a full belly and a round base — the pointiest of them |
| **Bow** | a slender spindle, tapered at both ends — the thinnest of them |
| **Orb** | a smooth upright egg: no point, no corner anywhere |
| **Shield** | blocky: flat across the top, straight sides, a blunt point at the FOOT — the only one that points down |
| **Cross** | a four-lobed medallion, an arm up, an arm down and one to each side |
| **Axe** | an axe bit: narrow on top, a broad crescent below with a horn at each bottom corner |
| **Boulder** | squat, wider than it is tall, a flat plane knocked off each side |
| **Mortar** | narrow on top, flaring to a wide base plate with square corners |
| **Warhead** | a needle apex over a narrow body, stepping out to a collar at the foot |
| **Crown** | a heavy band whose top edge rises into three peaks |

Every one of them is exactly symmetric, half an outline mirrored, and the
default cut wraps it in a **raised bevelled border** round a shallow **sunken
field** — an amulet somebody cut a rune into. That structure is doing work a
plain rock could not: the border frames the glyph at tile size, and the two
edges of the bevel (lit at the top-left, shadowed at the bottom-right, and
reversed inside the hollow) give a flat sprite depth from four strokes.

The nine SKINS are nine ways of working that outline, in three families —
carved stone, raw stone, cut gem:

| Skin | Cut |
| :--- | :--- |
| **River** | the default: carved smooth, bordered |
| **Jade** | worn round, every corner and point softened, bordered |
| **Amber** | the same outline CUT rather than polished: flats, so light breaks along an edge |
| **Marble** | quarried heavy: broader, its sides filled out toward the block, bordered |
| **Obsidian** | knapped: long straight flats struck off a flake point, no border |
| **Ember** | blunted a third of the way to a cracked slab, no border |
| **Sapphire** | a step cut: few long hard flats, chamfered corners, a white star under the table |
| **Ruby** | a cabochon: domed until there is not a facet left on it |
| **Diamond** | brilliant cut: many small crisp flats, and a glyph that splits the light |

Obsidian and ember are deliberately NOT carved, and the three gems are cut
rather than carved: a roster where every stone is a bordered plaque has nothing
left to say about the ones that were never carved.

```
        [ RUNE PLAQUE LAYOUT ]
               /\            ← the point, at the top
              /  \
             / __ \          ← raised border
            | |  | |
            | | G| |         ← G: the glyph, in the sunken field
            | |__| |
             \    /
              \__/           ← [SWIPE ARROW] under it, [HP / LVL] below
```

### 3.1 Complete Rune Roster

| Rune Type | Glyph Icon & Color | Targeting & Direction | Base Stats (Lv. 1) | Ability & Attack Behavior | Level 2 Stacked Bonus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Melee** | Crimson Sword | Cardinal (Up, Down, Left, Right) | HP: 3 | Atk: 2 | Attacks the 1 adjacent tile in facing direction. Deals direct physical damage. | **HP: 6 | Atk: 4.** Adds knockback effect—pushes enemy back 1 tile if target survives. |
| **Archer** | Emerald Bow | Cardinal (Up, Down, Left, Right) | HP: 2 | Atk: 2 | **Skips 1st tile**, strikes the 2nd tile ahead. Bypasses frontline units completely. | **HP: 4 | Atk: 4.** Fires a 2-arrow volley hitting both 2nd and 3rd tiles ahead. |
| **Mage** | Amethyst Arcane Orb | Diagonal (4 Diagonal Angles) | HP: 2 | Atk: 3 | Fires a diagonal energy beam penetrating through **2 diagonal tiles**, damaging all targets. | **HP: 4 | Atk: 5.** Expands into a 3x3 cross-explosion around the end destination tile. |
| **Defense** | Sapphire Shield | **Omni-Directional** (No swipe needed) | HP: 6 | Atk: 0 | Absorbs incoming attacks. Automatically mitigates 1 extra damage from all directions. | **HP: 12 | Atk: 0.** Grants +1 HP shield aura to all adjacent friendly runes at round start. |
| **Support** | Topaz Radiant Cross | **Omni-Directional** (No swipe needed) | HP: 3 | Atk: 0 | Restores **+1 HP** to all adjacent friendly runes at the end of each resolution phase. | **HP: 6 | Atk: 0.** Heals **+2 HP** and grants +1 bonus Attack power to adjacent friendly runes. |
| **Cleave** | Burnt-Orange Axe | Cardinal (Up, Down, Left, Right) | HP: 4 | Atk: 2 | Swings across the **3 tiles ahead** — the one it faces and the two beside it. Never knocks back. | **HP: 8 | Atk: 4.** The same fan, twice the steel. |
| **Roller** | Teal Boulder | Cardinal (Up, Down, Left, Right) | HP: 3 | Atk: 2 | Rolls down its lane and damages **everything standing in it, friendlies included**. Rolls on through whatever it breaks; comes to rest on the first rune it fails to break, or at the board edge. | **HP: 6 | Atk: 4.** Ploughs through one survivor before stopping (one more per level). |
| **Bombard** | Magenta Mortar | Cardinal (Up, Down, Left, Right) | HP: 2 | Atk: 2 | **Lobs** a shell onto the 3 side-by-side tiles **3 ranks ahead**. It arcs over everything between, so no shield can intercept it — and nothing beside the tube is ever in danger. | **HP: 4 | Atk: 4.** Also shells the tile 2 ranks ahead, dead centre. |
| **Nuker** | Acid-Yellow Warhead | **Omni-Directional** (never aimed) | HP: 2 | Atk: 0 | **Detonates once, on the placement itself**, and never attacks again. Every Lv 1 rune on the board is destroyed outright — **friendlies included** — whatever its hit points; Lv 2+ runes survive with 3 damage. The nuker itself is untouched. | **HP: 4 | Atk: 0.** Its own body outlives a second nuke. |

| **Crown** | Royal-Indigo Crown | Cardinal (Up, Down, Left, Right) | HP: 2 | Atk: 0 | **Never attacks.** On the placement itself, the Lv 1 rune it faces **changes side** — same body, same hit points, turned to face the way its new owner's runes face — and the crown is **spent** doing it. A stack, an empty tile, a friendly or the board's edge: nothing happens, and nothing is paid. | **HP: 4 | Atk: 0.** A Lv 2 crown takes a Lv 2 stack. |

**Why the crown is a trade and not a gift.** Its own tile empties as the
enemy's tile changes hands, so the swing is ONE tile, not two: a body for a
body, plus the position. Nothing is left standing to crown a second stone, so
it can never be spammed, and the stolen rune fights for its new owner on the
very turn it changes hands — the crown step runs before every attack — which is
the whole reason to spend a rune taking one rather than breaking it.

Nine runes win by killing; the game is won by **holding eight of sixteen
tiles**. The crown is the only rune that plays the win condition directly,
which is why the campaign keeps it for last (4-5, one chapter's play after the
nuke). Those two are the opposite answers to a board that has gone wrong —
burn it down, or take a piece of theirs — and meeting them together would blur
both. It is never given to an enemy faction: having a stone you built taken and
turned on you is the sourest thing these rules can express, and there is no
counter-play to it, only a rune gone.

**Why the nuke reads levels, not hit points.** A Lv 1 shield with 9 HP is
vaporised exactly like a 2-HP bow, and the smallest Lv 2 body in the game (4)
is larger than the 3 damage a survivor takes. So "stacks survive, singles do
not" is a rule the player can plan around rather than an arithmetic accident —
which is what makes the nuker a *reset button with a price*. From behind it
wipes a board you are losing; from in front it clears everything except the
stacks you have built. It is the last rune the campaign hands over (4-1).

**Where they come from.** The first five are chapter 1's lessons. The last
five are the long game: the campaign hands the axe over at **Level 2-1**, the
boulder at **2-5**, the mortar at **3-1**, the nuke at **4-1** and the crown at
**4-5**, and every result screen and the campaign map advertise the next one by
name and stone ("Win Level 2-1 for …"), so a new player knows there is
something to come before they have earned it.

**And each is taught the node after it is given.** 2-2, 2-6, 3-2, 4-2 and 4-6
are lessons, built exactly like chapter 1's — a ghost hand, bone dummies that
never place and cannot hurt, no clock — and each is won by the ghost's single
placement: three dummies abreast for the axe, three queued down one lane for
the boulder, three on the far rank behind your own shield for the mortar, three
scattered so that nothing but a nuke could take them all.

The crown's is the one lesson that does not clear the board by breaking it: a
skeleton sword with a 2-HP bow behind it, in one file. The crown takes the
sword, and the sword — now the player's, and turned around — kills the bow in
the same resolution. One drop teaches both halves of the rune, and the second
half is the one that decides matches.

A rune out of a chest is a rune nobody has used, and these five are the least
guessable in the game.

---

### 3.2 Stacking & Upgrade Mechanics
* **Mechanic:** Dragging an identical rune onto a tile already occupied by that rune merges them into a **Level 2 Rune**.
* **Visual FX:** A golden burst ring expands from the stone pebble; the carved glyph glows brighter with a metallic border, and a "Lv. 2" badge appears.
* **Benefits:**
    * Immediately doubles current and maximum HP.
    * Amplifies attack damage or support effectiveness.
    * Unlocks enhanced secondary abilities (e.g., Archer multi-shot, Mage AoE explosion).
* **Cap:** Max Level 2 per tile to preserve strategic mobility and prevent invincible mega-towers.
  *(Shipped as Lv 8 — see `MAX_LEVEL`; Lv 3+ extrapolate the Lv 1 / Lv 2 pair linearly.)*

### 3.3 Rune Ranks — the permanent upgrade, and the coin sink

Stacking is per match and dies with the board. **Ranks are permanent.** Every
rune carries a rank from 0 to **5**, and each rank is worth **+1 maximum hit
point** on the player's runes of that type — nothing else, and the same number
for every rune.

That uniformity is the balance design, not laziness about it. The game is
fought with attack values of 2–5 against bodies of 2–9, so one point of attack
on a sword is a 50 % damage buff and would end the roster's balance by itself;
hit points make a rune harder to remove without making it kill anything faster.
Giving every rune the same number per rank means **no rune can pull ahead of
another by construction** — there is no per-rune table to tune and therefore
none to get wrong. And because the bonus is flat rather than scaled by level,
it is transformative on a Lv 1 bow with a body of 2 and a rounding error on a
Lv 8 sword with 24: worth most exactly where a struggling player needs it.

The enemy never has ranks.

| | |
| :--- | :--- |
| **Ladder** | 70 → 140 → 240 → 380 → 560 coins. One rune fully ranked is 1390; the whole roster 12 510. |
| **Paid with** | coins, **one rewarded video**, or the free gift below. |
| **Where** | the shop's third tab, beside Power Runes and Skins. |

**The rotating free upgrade.** One rank, on one rune, is free at any moment —
no coins, no video — and which rune it is is redrawn **every 20 minutes**. It
is deliberately a rotation rather than a stock: a player who takes it has to
come back for the next one, and a player who is away is never accumulating a
debt of unclaimed gifts. The window is derived from the clock rather than
stored, so it keeps turning while the game is closed and cannot be farmed by
reloading. Only runes that are not already capped are ever drawn — a gift the
player cannot use is not a gift. This is the D1–D7 driver.

**Every rewarded button wears the film mark.** Any button in the game that
costs a video renders the clapper icon before its label or price, so a player
is never surprised into an ad — and it appears only on builds that actually
play one (`isRewardGated`: a real ad provider is resolved, which is false on
the CrazyGames pre-release build and on ad-free builds, where the perk is
simply granted instead).

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
| [Profile]   [Level 3-4]   [Settings]  |
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

**Shipped: the tile is a compass (position aiming), on every device.** The
facing comes from WHERE the pointer stands inside the tile rather than from a
stroke — for a cursor and for a thumb alike, because sliding toward the edge you
want is easier than a flick with a distance threshold in it. Each tile carves
into one region per facing the rune actually has:

| rune aim | carving | regions |
| :--- | :--- | :--- |
| cardinal (sword, bow, axe, boulder, mortar) | the tile's two **diagonals** → four triangles | up / right / down / left, each triangle's wide edge being the edge it faces |
| diagonal (orb) | the two **midlines** → four quadrants | ul / ur / dr / dl, each touching the corner it faces |
| omni (shield, cross, nuker) | none — one region | nothing to aim |

Every region is outlined with the orientation it would produce, and the one
under the pointer lights and grows inward from its own outer edge. The middle
of the tile is a small DEAD ZONE (`AIM_CENTRE_DEAD_ZONE`, 18 % of the tile):
every point still names a region — the renderer must draw something everywhere
— but inside that radius the player has not *chosen*, so the facing simply
holds whatever it already was, a pre-pressed key or the default. That is not
the flicker a neutral region would cause: nothing changes as the pointer
crosses the middle, which is the point. Without it, an arrow key pressed before
the click would be silently overridden by a click in the centre, and a stone
dropped dead-centre would count as aimed and skip the window that is the only
way to fix it.

**And therefore no correction window on a mouse.** The one-second window exists
because a stroke could be misread and because a pointer can hide what it is
choosing. A cursor is a few pixels that never covers the tile, so a player who
watched the region light up before clicking has already confirmed the facing and
goes straight to the reveal. A FINGERTIP covers the middle of the very tile it
is aiming — so touch gets the compass (leaned outward, away from the contact
patch) but keeps its window. That is the only thing the precise/imprecise
distinction still decides. The window is also kept for tap-to-place with no
direction and for a pebble released inside the centre dead zone.

It is no longer kept for node 1-1. That lesson used to BE the correction
window: the ghost dropped a sword facing nothing and then flicked it round, and
the player's own window was held open until they copied it. With the compass
that is a tutorial in the fallback — two gestures and a second of waiting to
teach the slower way to play — so 1-1 now shows the single gesture the game is
actually played with: the sword carried onto (1,2) and released on the LEFT
side of that tile, where the skeleton stands. The ghost lights the same compass
the player's own finger will light, from the same painter (`drawGhostCompass`).
The held window itself stays in the rules (`GhostSpec.reaim`) for any lesson
that wants to drill the correction later; nothing shipped asks for it today.

The swipe stays too, on both: a flick still re-aims inside the window, and it
is the whole of the correction gesture. Position wins while the pointer is
inside the tile; a stroke wins when it leaves.

Geometry: `aimRegionShape` / `dirFromCellPoint` / `aimRegionPolygon` in
`rules.ts`, pure and swept by `tests/game/rules.test.ts` over every point of
every tile for every rune.

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