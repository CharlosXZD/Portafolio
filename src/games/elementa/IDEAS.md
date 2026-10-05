# Elementa ideas inbox

Carlos's place for ideas that don't have a home yet. Write anything here, half-formed is fine. When an idea is ready to become part of the plan, Claude moves it into `EXPANSION.md` and deletes it from here.

**For agents:** nothing in this file is decided or built. Never implement from this file. Only `EXPANSION.md` items marked `Status: Ready` get built.

**How the files fit together:**
- `CONTENT.md`: what is in the game right now (generated from the code).
- `EXPANSION.md`: the plan. Decided and proposed features, roadmap, patch notes.
- `IDEAS.md` (this file): the inbox. Loose ideas waiting for a place.

---

## Inbox

Add new ideas at the top. One heading per idea, with as much or as little detail as you have.

### Every Mythic die gets its own tag
The Space die carries the Warp tag (EXPANSION.md H3, a Negative-style edition). Carlos: it would be fun if all the Mythic dice had their own tags, each a rule-bending edition (Light, Darkness, Time, Chaos, Void each with a signature effect that other dice can also carry). Needs a lot of workshopping: what each tag does, how other dice get it, and how rare it is.

### The Warp tag on relics and consumables
Warp (EXPANSION.md H3) starts as an extra *dice* slot. The same tag could give an extra relic or consumable slot (Balatro's Negative works on jokers and consumables too). Decide after Warp dice have been played.

### Double cast
Items, dice or pacts that let you cast twice in a round. Natural follow-up to hiding the running total (EXPANSION.md P10): the second cast adds on top of the first, and the reveal becomes a two-act show. Possible forms: a relic ("Twin Cast"), a die that stores a second cast, a Nix pact that doubles your casts but costs a life if either misses.

### Flasks (the Estus idea)
A consumable family that refills instead of being used up: 1 to 3 charges, refilled at every camp or boss. First flask restores a life per charge (overlaps with Phoenix Feather, see EXPANSION.md P2). Other flasks could hold a reroll, a Shard gift, or a nudge. Needs a decision on how it relates to existing consumables.

### Grinding a d3 into something
Chisel (EXPANSION.md P2, built) splits dice, and a d5 chips into a d3 plus a Transmute. A d3 cannot be chiseled. Carlos is not parked on it, but wants to keep thinking: what could a d3 be ground into? An Estus-style flask, a Transmute, a Shard gift? Needs a decision.

### Keepers as family
Every realm has its own shop keepers, but they're all related (cousins, siblings, a great-aunt). Tobb appears in every realm (that part is decided, see EXPANSION.md A4), and he's slightly embarrassed by his relatives. Or the keepers have "echoes" in each realm: a star-alchemist Vessa in the Firmament, a binary-coded Curator in realm 3. Still iterating.

### What happens when Mote is full?
Mote's appetite (EXPANSION.md A4) grows across runs. When it's completely fed, something happens. It could become a character, open a door, or matter for the true ending.

### Relic of the Fallen
The Curator keeps one die from your last lost run and sells it in the Vault next run. His dialog already sets this up: "When you fall, I will keep your dice with honor."

### Tainted loadouts
Darker versions of each loadout, unlocked by a Primordial path ending (like TBOI's tainted characters).

### Bosses that remember
A boss beaten many times on a save file gets a harder variant.

### Daily seed run
One shared seed per day.

### Mythic elements: base forms and pairs (Carlos, 2026-10-03) [moved into EXPANSION.md Part K, v0.8]
Carlos: use the systems we already have to make Time, Space, Void, Chaos, Dark and Light into *elements* too. Each keeps its Mythic die as it is (found through Wardens), and also gets a weaker **base die**, a new element in its own right, obtained the way the god dice are (a recipe learned on the file, then forged). The base forms could then fuse with each other like the four classic elements do, producing more new elements. Claude's first thoughts, for the workshop: keep it to three opposed pairs (Light/Dark, Time/Space, Chaos/Void) so there are 6 base dice, 3 pair-fusions and the 6 Mythics (15 dice) instead of every combination; give each a family tag with its own reactions (the nine Mythic reactions are a start); Entropy stays the top of the tree. Open: how a base die is forged (four of a pure die like the gods? two fusions of opposed elements?), what its ability is, whether it needs an unlock, and which version it ships in (it fits v0.8 "Rewriting reality" well).

### Ometeotl (Carlos, 2026-10-03)
A name Carlos likes, saved for later. Ometeotl is the dual creator god of Aztec (Nahua) belief: one being that is both male and female, the source of everything and of duality itself ("god of duality"). It fits the game's themes of one thing split in two (the Primordial and the Split, light and dark, Nix and Aeris) and could name something at the very top: the Primordial's true origin, the fourth place, or the true-ending boss. Not tied to anything yet.

### The Umbra, readable on the lowest difficulty (Carlos, 2026-10-03)
The Umbra (a swallowed die scores 0 and Darkness-like) was fun and hard to beat, and Carlos likes that it took a few tries, but wants a way to play around it on the lowest difficulty: show the cast's score and Mult before casting, or show a die's score when you lock it. Needs more playtests before deciding. Related: the Maelstrom was changed in v0.7.1 to turn only one die per reroll.

### Elemental Die from the Firmament (Carlos, 2026-10-03)

#### 1 configration of Die 
**Note** We have 6, that combine into base 3, from those we have the extended futions, 

|Name|Element|Ability|Recipe|Unlock|
|----|-------|-------|------|------|
|/////|Dark|-----|------||
|/////|Light|-----|------||
|/////|Time|-----|------||
|/////|Space|-----|------||
|/////|Chaos|-----|------||
|/////|Void|-----|------||
|Shadow|Dark + Light|-----|------||
|Continuum|Time + Space|-----|------||
|Oblivion|Chaos + Void|-----|------||
|/////|Shadow + Continuum|-----|------||
|/////|Shadow + Oblivion|-----|------||
|/////|Continuum + Oblivion|-----|------||
|/////|Shadow + Continuum + Oblivion|-----|------||

#### Second configuration

##### Base Elements
|Name|Element|Ability|
|----|-------|-------|
|Dark|Dark|-----||
|Light|Light|-----||
|Time|Time|-----||
|Space|Space|-----||
|Chaos|Chaos|-----||
|Void|Void|-----||

##### Combinations for 2 elements
| Name | Combination |Ability|
|------|-------------|-------|
| Shadow|Dark + Light||
| Continuum|Time + Space||
| Oblivion|Chaos + Void||
| Corruption | Chaos + Dark ||
| Flare | Chaos + Light ||
| Paradox | Chaos + Time ||
| Rift | Chaos + Space ||
| Dusk | Dark + Time ||
| Penumbra | Dark + Space ||
| Abyss | Dark + Void ||
| Dawn | Light + Time ||
| Aurora | Light + Space ||
| Singularity | Light + Void ||
| Stasis | Time + Void ||
| Cosmos | Space + Void ||


*Note: The combinations for 3 elements and beyond will not be used for now.*

##### Combinations for 3 elements

| Name | Combination |Ability|
|------|-------------|-------|
| Twilight | Dark + Light + Time ||
| Horizon | Dark + Light + Space ||
| Discord | Dark + Light + Chaos ||
| Annihilation | Dark + Light + Void ||
| Aeon | Dark + Time + Space ||
| Decay | Dark + Time + Chaos ||
| Nether | Dark + Time + Void ||
| Fracture | Dark + Space + Chaos ||
| Abyssal | Dark + Space + Void ||
| Perdition | Dark + Chaos + Void ||
| Aeternum | Light + Time + Space ||
| Conflagration | Light + Time + Chaos ||
| Aftermath | Light + Time + Void ||
| Supernova | Light + Space + Chaos ||
| Nebula | Light + Space + Void ||
| Cataclysm | Light + Chaos + Void ||
| Singularity | Time + Space + Chaos ||
| Infinity | Time + Space + Void ||
| Event Horizon | Time + Chaos + Void ||
| Vortex | Space + Chaos + Void ||


##### Combinations for 4 elements
| Name | Combination | Ability |
|------|-------------|---------|
| **Creation** | Dark + Light + Time + Space ||
| **Tempest** | Dark + Light + Time + Chaos ||
| **Apocalypse** | Dark + Light + Time + Void ||
| **Maelstrom** | Dark + Light + Space + Chaos ||
| **Eventide** | Dark + Light + Space + Void ||
| **Ruin** | Dark + Light + Chaos + Void ||
| **Erosion** | Dark + Time + Space + Chaos ||
| **Desolation** | Dark + Time + Space + Void ||
| **Damnation** | Dark + Time + Chaos + Void ||
| **Tartarus** | Dark + Space + Chaos + Void ||
| **Zenith** | Light + Time + Space + Chaos ||
| **Transcendence** | Light + Time + Space + Void ||
| **Genesis** | Light + Time + Chaos + Void ||
| **Primordium** | Light + Space + Chaos + Void ||
| **Terminus** | Time + Space + Chaos + Void ||

##### Combinations for 5 elements
| Name | Combination | Ability |
|------|-------------|---------|
| **Absolute** | Dark + Light + Time + Space + Chaos | |
| **Obliteration** | Dark + Light + Time + Space + Void | |
| **Collapse** | Dark + Light + Time + Chaos + Void | |
| **Permanence** | Dark + Light + Space + Chaos + Void | |
| **Nightfall** | Dark + Time + Space + Chaos + Void | |
| **Illumination** | Light + Time + Space + Chaos + Void | |

##### Combination for 6 elements
| Name | Combination |Ability|
|------|-------------|-------|
|/////|Dark + Light + Time + Space + Chaos + Void||




#### Decided in the v0.8 workshop (Carlos, 2026-10-03)
- **The Cosmologist** is a new character in the **same Forge shop** (not a new shop on the Road). She introduces herself the first time, explains that the new elements are dangerous, so **for now only two new elements can be combined** (two-element fusions only).
- **Crossing into the Firmament** plays a scene where **Pip explains the new elements**, that this is a new realm, and what changes.
- **Whether the volatile fusions gate the true ending:** parked. Carlos is not sure how the story ends yet.

- **The six Mythic dice become the new base elements** (Carlos, 2026-10-03): Light, Darkness, Time, Space, Chaos and Void are elements "just like earth, air, water and fire". There is no separate set of weaker base dice (Glimmer, Gloom and the rest are dropped). They are **bought in shops**, no special forging recipe; only *fusions* are made at the Forge.
- **Renames:** Paradox is now **Anomaly** (Chaos + Time); Dawn is now **Alba** (Light + Time), also because a Warden is called The Dawn.
- **The Cosmologist** is mysterious, fun and clever; we do not know much about her. Her name is still open.

#### Claude's proposal for the workshop (2026-10-03)

**Recommendation: Configuration 2, curated.** Six base elements and 12 new dice instead of 21: the six base dice, the three opposed pairs, and three more chosen for flavor. The other pair-fusions wait for later. Mythic dice stay as they are.

| Group | Dice | Where it is made |
|---|---|---|
| Stable (always works) | Shadow (Dark + Light), Continuum (Time + Space), Oblivion (Chaos + Void) | Shadow at the normal Forge; Continuum at the Horologist; Oblivion at Mote (feed it two dice, it gives one back) |
| Volatile (can collapse) | Paradox (Chaos + Time), Singularity (Light + Void), Abyss (Dark + Void) | Only at the new **Cosmologist's bench** (a keeper who joins the Forge), with a stated chance |

(Paradox is also a reaction name, so one of them needs a new name.)

**So the player is never betrayed:**
- The Cosmologist shows the odds before you commit (for example "Singularity: 60%").
- A failure is not a loss: the two dice collapse into a **Black Hole**, a real die with its own use (scores 0 itself, adds Mult for each die it swallowed this run), so a bad roll still gives something.
- A **Stabilizer** (a Constellation-like consumable, sold by Seren or the Cosmologist) raises a fusion to 100%.
- The six base dice are forged from recipes the file learns when each Warden falls (like the gods), so nothing is a surprise purchase.

**Base dice (first thoughts, weaker than their Mythic):**
Light: neighbors never fizzle. Dark: the die on its right scores 0 and half of that goes to Mult. Time: +1 reroll each round. Space: reacts with the die two places away too. Chaos: a random pure element each roll. Void: +0.5 Mult per empty dice slot.

**Open:** names for the base dice (Dark and Darkness would clash), how each base die is forged, and whether volatile fusions can also gate the true ending.


#### Workshop new Die: 

Here's every die in the game, then the new ones with a power-up for each. The "new dice" are everything added since the Firmament.

**Older dice (not changing)**
- **Pure:** Earth, Fire, Water, Air.
- **Double fusions:** Lightning, Ice, Steel, Mud, Steam, Crystal.
- **Triple fusions:** Storm, Obsidian, Magma, Monsoon.
- **Quadra fusion:** Aether.
- **Gods:** Gaea, Ognen, Varuna, Zephyr, plus the Primordial die.
- **Arcane:** Gilded, Sapling, Mirror, Conduit, Kairos, Beacon, Prism, Bullion, Masquerade, Chameleon.

**New dice, with what I'd add.** "Face to Mult" is your idea, so the die's face value also goes into Mult.

| Die | Today | Power-up |
|---|---|---|
| **Light** | Neighbours never fizzle | Face to Mult (half); neighbours also count +10 |
| **Darkness** | Right neighbour scores half, half goes to Mult | Face to Mult (half) |
| **Time** | +1 reroll a round, It can get locked, it summons its past score. | +2 rerolls; face to Mult (half) |
| **Space** | Reacts two places away, it bridges the space between dice and makes them React. | Reacts three places away; face to Mult (half) |
| **Chaos** | Random pure element each roll, it can react with everything and strengthen the reaction. | Picks the element that makes the best reaction with a neighbour; face to Mult (half) |
| **Void** | Scores nothing; +5 Mult per empty slot | Face to Mult (full); +1 per empty slot, it dosnt ocupy space as a die. |
| **Shadow** | Left neighbour to Mult; right never fizzles | Face to Mult (half) |
| **Continuum** | Ring, +1 reroll | +2 rerolls; face to Mult (half) |
| **Oblivion** | Eats the lowest die for 2× its face | Eats it for 3×; face to Mult |
| **Alba** | No face below 2; first reroll free | No face below a quarter of the die's size, so it matters on big dice |
| **Anomaly** | A random die rerolls once more | Two dice reroll, and you keep the better outcome |
| **Singularity** | Scores nothing; neighbours' Base ×2 | Neighbours' Base ×3; face to Mult (full) |
| **Nadir** | Neighbours score 0; +2 Mult per empty slot | Neighbours score half; +3 per empty slot |
| **Dead Star** | Scores nothing; +0.5 Mult per other die | +1 Mult per other die, so a collapse is a fair consolation |
| **Comet** | Explodes on top two faces | Face to Mult (half) |
| **Pulsar** | +5 Base per reroll | +10 Base per reroll |
| **Satellite** | Neighbours' faces +5 | Neighbours' faces +15% of that die's size |
| **Quasar** | Its score goes to Mult | Its score goes to Mult, doubled |
| **Zenith** | +1 reroll, more at rounds 20 and 25 | +2 reroll; face to Mult (half) |


##### New Die Ideas: 

| **Closed Timelike Curve** | If you cast on the first 15s of the round x2 Mult | x2 Mult |
| **Shooting Star** | Explodes on top three faces, if another Die explodes it explodes too | Face to Mult (half) |
| **Neutron Star** | Explodes on top three faces, if another Die explodes it explodes too, it also explodes if it has the same face as another die | Face to Mult (half) |
| **Non-Euclidean Die** | Warps space arround it | Every die can react with each other. their placement dosnt matter.|
| **Event Horizon** | It creates 2 Balack Hole Dice when it scores its highest face.| Scores Nothing |
| **Balck Hole Die** | Anything inside a Black Hole gets +50 score.| Scores Nothing|
| **Quantum Entanglement** | Chooses a die at random and copies its hablities and its score.| |

All firmament dice in this list have the inherit *Firmament* buff, Face to Mult (half). 

**Combining the crutches you picked:**
- **Arrive at your level:** Firmament shop dice are sized around your pool's median instead of the round's odds.
- **Apprentice discount:** a die you just bought gets its next two upgrades at half price.
- **Stronger abilities:** the table above. Mult from the face grows with the die's size, so these dice get better as you upgrade them, and the flat bonuses help even a d3.

**Where I need your call:**
1. **Face to Mult at half or full?** I used half for most dice and full for the ones that score nothing, like Void, Singularity and Quasar. Fine?
2. **Which dice are in?** I included the six elements, the seven fusions, the Celestial dice and the Dead Star. Should the Horologist's dice be in too?
3. **Anything too strong or too boring?** Tell me what to cut or push, and I'll write it up as v0.8.3 with the prompt.




---

## Template

### (Idea name)
What it is, why it's fun, and anything it connects to (a die, a keeper, a realm, a boss).
