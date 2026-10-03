# Elementa content reference

Everything in the game as of 2026-10-03 (Alpha v0.7.5 "Constellations" in development), pulled straight from the data files so it matches the code.

> This file describes only what is in the game right now. Planned changes live in `EXPANSION.md`; ideas without a home yet live in `IDEAS.md`.

Contents: 1. Core rules · 2. Dice · 3. Relics · 4. Consumables · 5. Reactions · 6. Characters (Pip, keepers, bosses, Wardens) · 7a. The three paths and the endings · 7b. The Firmament · 7. Shops and the Road · 8. Loadouts, difficulties, achievements · 9. Lore · 10. Synergy map · 11. Counters: bosses vs builds · 12. Known issues found while compiling this

---

## 1. Core rules (what every synergy plugs into)

- **Score = Base x Mult.** Base is the sum of every die's contribution plus flat bonuses and reactions. Mult starts at 1.
- **Die contribution** is its face (plus explosion chain), then per-die modifiers in this order: fizzle/ban zeroes it, Gravity Well halves faces over 4, Bedrock x1.5 (pure Earth), Double-on-set x2, Sapling growth, Whetstone bonus, Fusion Crucible x1.5, Glacier Heart x2 (locked), Tide Chart +3 (locked), Loaded Die +3 (max face). Then placement: Mirror copies, Beacon x1.5 neighbors, Bookends +4, Heart of the Circle x2 middle, The Pillar zeroes the best die.
- **Explosions:** max face rolls again and adds, chaining up to 10 times. Each explosion is also **+0.5 Mult**.
- **Sets:** only count if at least one die in the pool "enables sets" (Air family). Grouped by face: pair **+1 Mult**, three of a kind **+2**, straight of 4 consecutive faces **+3**.
- **Reactions:** two side-by-side dice react if between them they cover a reaction's two elements, and both actually scored (a fizzled die doesn't react). Fusions bring every parent element, so one link can fire several reactions.
- **Families:** a family is the pure element plus every fusion containing it. Water-family relics look for the free-lock ability; Earth relics currently only count **pure** Earth (see §12).
- **Family abilities** (v0.4), shared by the whole family; a fusion gets one per family it belongs to (Lightning has Kindling and Drift):
  - **Fire, Kindling:** a die that fizzles on a 1 after a reroll grants +1 reroll this round, with no cap (only dice that can fizzle, so not Steel, Obsidian or Magma).
  - **Water:** free locks that refund a reroll (unchanged).
  - **Earth, Patience:** +2 for every reroll it sits out (held or locked) this round. Unlike Sapling, it keeps the bonus if it is rerolled later in the round.
  - **Air, Drift:** once per round (one charge total), nudge one Air-family die up or down by 1, free. Landing on the max face doesn't explode; frozen dice can't drift.
- **Score reveal (v0.6.5):** before you cast, the Score reads "?" and the target bar sits empty (Options, Display, "Show live total before casting" brings the old live number back). Base, Mult and the Cast ledger always show. On cast the score is added up step by step (see the next bullet).
- **Cast ledger (v0.6.5):** repeated lines from one source are grouped ("Kindle x6 +6"), with an arrow to show each line and an "Expand all / Compact" switch. The cast reveal takes one step per group.
- **Cast choreography (v0.6.7):** the cast follows the ledger's order. Each step lights its source (a die lifts, a reaction draws a line between its two dice, a set is outlined and named, a relic or pact bounces), pops a number (blue Base, red Mult, a bigger red multiplier) that flies into the Base or Mult box, and shows a caption ("Kindle: Fire + Air, +1 Mult"). Steps tick higher through the cast; multipliers hit heavier. Instant skips it; Reduced motion drops the flying and shaking.
- **Dice details (v0.6.5):** three levels. Hover: name, type, families, current score. Click (still holds or releases the die): the short description and keyword tags. Click and hold about half a second, right-click, or the Info button: the full description. The Gallery shows the full one.
- **Loadouts and stakes (v0.6.5):** each loadout shows one flame per difficulty, lit once that loadout has beaten it. Dice in your final pool when you beat Cataclysm wear a gold star in the Gallery.
- **Rerolls:** 3 per round (Inferno and Cataclysm: 2). Locks on Water-family dice are free and refund +1.
- **Economy:** clearing pays 5 Shards, +1 per 25% over target (max +15), plus interest (1 per 3 Shards held, max 5).
- **Lives:** 3. A miss costs one, then Tobb's **Camp** (see §7) and you retry the round. +1 life back every 4th round cleared.
- **Caps:** 10 dice, 5 relics, 3 consumables (boss rewards and deals change these).
- **Die sizes:** d3, d5, d6, d10, d20 (v0.6.6 added the d5). Starting dice, forged dice and the Soul Die are d6. Bigger means higher faces but rarer explosions. Growing costs 4 / 6 / 12 / 20 Shards (into d5 / d6 / d10 / d20). Selling pays 2 / 3 / 3 / 6 / 10 (fusions x1.5).
- **Shop dice come in sizes:** each die on offer has its own size, drawn by weight: d3 (60, from round 1), d5 (22, from round 2), d6 (12, from round 3), d10 (5, from round 5), d20 (1.2, from round 8). The Aether Bazaar counts as three rounds later. A bigger die costs its normal price plus a premium: d5 +3, d6 +6, d10 +14, d20 +28.
- **Rarity unlocks by round:** Common 1, Uncommon 2, Rare 4, Epic 7, Legendary 10.
- **Prices by rarity** (relics and consumables): Common 5, Uncommon 8, Rare 12, Epic 18, Legendary 28. Selling pays half.

---

## 2. Dice

### Pure (Common)
| Die | Rarity | Made from | Shop price | Abilities |
|---|---|---|---|---|
| **Earth** | Common | - | 4 (+1 per copy owned) | Reliable filler. No risk, no downside.  |
| **Fire** | Common | - | 4 (+1 per copy owned) | Volatile. Explodes on max, fizzles on a 1. • Rolling the max face rerolls and adds again, chaining. • Rolling a 1 scores 0 this round. |
| **Water** | Common | - | 4 (+1 per copy owned) | Manipulation. Free locks that refuel your rerolls. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. |
| **Air** | Common | - | 4 (+1 per copy owned) | Combo. Rewards matching sets across the whole pool. • Enables the matching-set bonus for the whole pool. |

### Double fusions (Rare)
| Die | Rarity | Made from | Shop price | Abilities |
|---|---|---|---|---|
| **Lightning** | Rare | Fire + Air | 12 | Chained explosions re-check the set bonus mid-roll. • Rolling the max face rerolls and adds again, chaining. • Rolling a 1 scores 0 this round. • Enables the matching-set bonus for the whole pool. |
| **Ice** | Rare | Water + Air | 12 | Locked faces count toward sets. Manufacture a straight. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. • Enables the matching-set bonus for the whole pool. |
| **Steel** | Rare | Fire + Earth | 12 | Explodes like Fire, but Earth's reliability kills the downside. • Rolling the max face rerolls and adds again, chaining. |
| **Mud** | Rare | Water + Earth | 12 | Locking this die locks the next one free too. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. • Locking it also locks the next die for free. |
| **Steam** | Rare | Fire + Water | 12 | Rerolling it can duplicate the result onto another die. • Rolling the max face rerolls and adds again, chaining. • Rolling a 1 scores 0 this round. • Rerolling it can copy its result onto another die. |
| **Crystal** | Rare | Earth + Air | 12 | Counts double when part of a matching set. • Enables the matching-set bonus for the whole pool. • Counts double when part of a matching set. |

### Triple fusions (Epic)
| Die | Rarity | Made from | Shop price | Abilities |
|---|---|---|---|---|
| **Storm** | Epic | Fire + Water + Air | 20 | Manufacture a set with a free lock, then detonate it. • Rolling the max face rerolls and adds again, chaining. • Rolling a 1 scores 0 this round. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. • Enables the matching-set bonus for the whole pool. |
| **Obsidian** | Epic | Fire + Water + Earth | 20 | Safe, stacking value. Explodes without the fizzle risk. • Rolling the max face rerolls and adds again, chaining. • Rerolling it can copy its result onto another die. |
| **Magma** | Epic | Fire + Air + Earth | 20 | Exploded totals can double if part of a set. • Rolling the max face rerolls and adds again, chaining. • Enables the matching-set bonus for the whole pool. • Counts double when part of a matching set. |
| **Monsoon** | Epic | Water + Air + Earth | 20 | One lock, two dice join a set: the cheapest combo enabler. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. • Locking it also locks the next die for free. • Enables the matching-set bonus for the whole pool. |

### Quadra fusion (Legendary)
| Die | Rarity | Made from | Shop price | Abilities |
|---|---|---|---|---|
| **Aether** | Legendary | Fire + Water + Air + Earth | 64 | Every mechanic, on one die. Capped at one per run. • Rolling the max face rerolls and adds again, chaining. • Rolling a 1 scores 0 this round. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. • Locking it also locks the next die for free. • Rerolling it can copy its result onto another die. • Enables the matching-set bonus for the whole pool. • Counts double when part of a matching set. |

### Arcane dice (no element; they care about their neighbors)
| Die | Rarity | Made from | Shop price | Abilities |
|---|---|---|---|---|
| **Gilded** | Common | - | 8 | Scores nothing. Pays its face in Shards when you clear the round. • Scores 0, but its face is paid out in Shards on a clear. |
| **Sapling** | Rare | - | 14 | Grows +2 every reroll it stays held. Rerolling it resets the growth. • Gains +2 for every reroll it sits out. |
| **Mirror** | Rare | - | 14 | Copies the score of the die to its left. • Copies the score of the die on its left. |
| **Conduit** | Epic | - | 20 | Its two neighbors react with each other as if they touched, and those reactions count double. • Bridges reactions between its two neighbors, and doubles them. |
| **Kairos** | Epic | - | 20 | A rolled 1 rewinds and rolls again, until it is no longer a 1. • A 1 rerolls itself for free until it is no longer a 1. |
| **Beacon** | Rare | - | 14 | The dice on either side of it score x1.5. • Both neighbors score x1.5. |
| **Prism** | Epic | - | 25 | Counts as all four elements for reactions with its neighbors. • Reacts as Fire, Water, Earth, and Air at once. |
| **Bullion** | Epic | - | 25 | Scores nothing. Pays your final Mult in Shards when you clear the round. • Scores 0, but pays your final Mult (rounded down) in Shards on a clear. |
| **Masquerade** | Legendary | - | 30 | Copies the abilities and the score of the die to its left. • Acts as the die on its left: its abilities (reactions, sets, free lock, Beacon, Conduit...), and its score. At the left end it has nothing to copy and scores its own face. |
| **Chameleon** | Legendary | - | 30 | Copies the abilities of the die to its left and the score of the die to its right. • Acts as the die on its left, but scores what the die on its right scores on its own (before any copying). At either end it keeps what it can't copy. |

**Forging** (at the Forge, the Bazaar, or with a Fusion Spark) consumes one die of each parent: 6 Shards for a double, 10 for a triple, 16 for Aether.

### God dice (Divine; forge-only, hidden until their recipes are known)
| Die | Made from | Forge cost | Ability | Drawback |
|---|---|---|---|---|
| **Gaea** | 4 Earth | 24 | Also scores the face of every other Earth-family die. Earth-family dice are set wildcards. | Every other Earth-family die scores -5 (-10 on a 1). |
| **Ognen** | 4 Fire | 24 | Explodes on any face of 4 or more (chains of up to 10). | Fizzles on 1, 2 and 3. With a Water-family die in the pool, each explosion is a coin flip. |
| **Varuna** | 4 Water | 24 | Any die can lock for free, and those locks refund a reroll. After every roll, every die showing a 1 takes her face. | 1s come up 50% more often, on every die. |
| **Zephyr** | 4 Air | 24 | Sets go up one tier (pair counts as three, three as a straight). His face is a set wildcard. | Fire-family dice explode half as often. |

- **One god at a time** (Pantheon allows two). Gods can't be cloned or copied by Shadow Twin. They count as their element's family, and holding one at round 15 pushes the Accord -3.
- **The recipes** are learned from the visions after a Neutral win (see §7a).

**The Primordial die** (Divine, d20): lent on the Primordial path for round 15 only, outside the dice cap, never sold. Every Aether mechanic, plus the ability of each god defeated in the gauntlet, without the drawback.

**The Aether recipe is secret.** Until you beat Primordial once on a save file, Aether can't be forged and never appears in a shop; the Gallery reads "Recipe unknown: beat Primordial". The first win teaches it (a "New recipe" toast), and the Curator mentions it on your next Vault visit. The Avatar loadout still starts with Aether.

### The Firmament's dice (v0.7)
Sold only past the door (see §7b), never in Elementa. Every die from Elementa still shows up in the Firmament's shops too.

**Mythic dice** (a new rarity after Divine): no element, no reactions of their own, 45 Shards, always a d6. One of each per run (a second can't be bought, and Mirror Shard, Shadow Twin and the Chisel can't copy them). Each is unlocked on the file the first time its Warden falls, and from then on it can turn up in Firmament die offers at Legendary weight.

| Die | Guarded by | Abilities |
|---|---|---|
| **Light** | The Dawn | No die can score below its face. Fizzles are cancelled, and faces stay visible. • No die can score below its face: lower faces rise to it, and nothing fizzles. Faces stay visible under Eclipse. • Mythic: one of each kind per run. It cannot be copied. • Can grow past d20 in the Firmament, up to d100. |
| **Darkness** | The Umbra | The dice on either side of it score 0. What they would have scored goes to your Mult. • The dice on either side of it score 0, and their combined score is added to your Mult. • Mythic: one of each kind per run. It cannot be copied. • Can grow past d20 in the Firmament, up to d100. |
| **Time** | The Clockwork | Once per round, undo your last reroll and get it back. Unused rerolls carry over, up to +3. • Once per round, Rewind: undo your last reroll and get it back. Unused rerolls carry into the next round, up to +3. • Mythic: one of each kind per run. It cannot be copied. • Can grow past d20 in the Firmament, up to d100. |
| **Space** | The Expanse | Its two neighbors and the two end dice all count as neighbors of each other. Always Warp. • Its two neighbors and the two end dice all count as neighbors of each other for reactions. • Mythic: one of each kind per run. It cannot be copied. • Always carries Warp: it does not count toward your dice cap. • Can grow past d20 in the Firmament, up to d100. |
| **Chaos** | The Maelstrom | Every roll it becomes a random die from the whole game, in a random size. • Every roll it becomes a random die from the whole game, in a random size. Locking keeps its current form. • Mythic: one of each kind per run. It cannot be copied. • Can grow past d20 in the Firmament, up to d100. |
| **Void** | The Hollow | Scores nothing. Every empty slot you have gives +1 Mult. • Scores 0. Every empty dice, relic and consumable slot gives +1 Mult. • Mythic: one of each kind per run. It cannot be copied. • Can grow past d20 in the Firmament, up to d100. |

| Die | Rarity | Where | Price | Abilities |
|---|---|---|---|---|
| **Chrono** | Legendary | The Horologist's Clockwork only | 30 | Any die that rolls a 1 rewinds time: every unheld die rolls again, and you keep the better pool, repeating until no 1 is left (up to 8 times). • When it lands on a 1, every unheld die rolls again for free (it too), and you keep the better pool. Up to 8 times. • Sold only by the Horologist, in the Firmament. |
| **Entropy** | Mythic | Forge only, once the file has beaten all six Wardens | 300 to forge (Light, Darkness, Time, Space, Chaos, Void and Aether) | Everything at once. Scores its face + 104, and +10 Mult. • Scores its face + 104, and adds +10 to your Mult. • Mythic: one of each kind per run. It cannot be copied. • Can grow past d20 in the Firmament, up to d100. |

### Celestial dice (Alpha v0.7.2; Firmament only)
Five arcane dice (no element, family "Arcane") sold only past the door: in Firmament Markets and the Astral Exchange, weight 1 each (Quasar 0.4), arriving in the usual sizes. The Astral Exchange always has one Celestial on its shelf. No unlock needed. They work through Masquerade and Chameleon like all arcane dice.

| Die | Rarity | Price | Abilities |
|---|---|---|---|
| **Comet** | Epic | 16 | Explodes on its two highest faces, and when it explodes it scores its whole total twice. |
| **Pulsar** | Epic | 16 | Every reroll made this round adds +1 to its Base, up to +10 (it starts over next round). The Hourglass's free rerolls count. The Horologist sells it too. |
| **Satellite** | Epic | 16 | Scores nothing. The dice on both sides count their face +1 (an explosion chain is unchanged; a fizzled die stays 0). Two Satellites on one die stack. |
| **Quasar** | Legendary | 30 | Scores 0 Base; its whole total goes to Mult, flat (a "Quasar" line on the ledger). One per run, cannot be copied. |
| **Zenith** | Epic | 16 | While it is in your pool: +1 reroll every round, +1 more from round 20 and again from round 25 (so +2, then +3). Each Zenith adds its own. The Horologist sells it too. |

- **Kairos** is the old Chrono under a new name (a save from before v0.7 is renamed on load). It stays in Elementa's arcane pool.
- **Warp** is an edition a die can carry: a violet WARP badge. A Warp die does not count toward the dice cap; at most 3 Warp dice at once. Space always has it, the Warp Seal gives it, a Firmament die offer has a 2% chance to come with it (+12 Shards), and Mote's secret stock sells Warp dice.
- **Past d20:** in the Firmament, Aether, the Mythic dice and Entropy grow in steps of 10 up to d100 (the Forge's growth, Upgrade Stones, boss rewards, Blessing of Flame). Growing costs the new size in Shards (d30 costs 30); they sell for half their sides. They are drawn as a d20 with the size printed on it.

### Keyword tags (v0.6.5)
Hovering or tapping a tag shows its definition. A die's short description shows the first four; the full description lists them all.

| Tag | Meaning |
|---|---|
| #Explodes | Rolling its top face rolls again and adds the new roll, chaining. |
| #Fizzles | A die that rolls a 1 scores nothing this round. |
| #Kindling | A Fire-family die that fizzles pays back +1 reroll. |
| #Drift | Once per round, nudge an Air-family die up or down by 1, for free. |
| #Patience | An Earth-family die gains +2 for every reroll it sits out this round. |
| #FreeLock | Can lock its face in place without spending a reroll. |
| #Refund | Locking it gives you +1 reroll back. |
| #Sets | Switches on the matching-set bonus for the whole pool. |
| #Wild | Counts as any face when forming a set. |
| #Reaction | Changes how it reacts with the dice next to it. |
| #Copy | Duplicates a result or an ability from another die. |
| #Mirror | Takes the score of a neighboring die as its own. |
| #Chain | Locking it also locks the next die, for free. |
| #Divine | A god. Forge-only, one at a time, with a power and a price. |
| #Grows | Gains +2 for every reroll it stays held. |
| #Payout | Scores nothing, but pays Shards when you clear the round. |
| #Rewind | A rolled 1 rolls again until it is no longer a 1. |
| #Boost | Raises the score of the dice beside it. |
| #Burst | Scores its whole total twice when it explodes. |
| #Pulse | Gains Base for every reroll made this round. |
| #Flare | Its face goes to Mult instead of Base. |
| #Rerolls | Gives you extra rerolls while it is in your pool. |
| #Doubles | Counts double when it is part of a matching set. |
| #Mythic | No element. One of each kind per run, and it cannot be copied. |
| #Warp | Does not count toward your dice cap. At most 3 Warp dice at once. |
| #Loop | A 1 rerolls every unheld die for free, and the better pool stays. |
| #Floor | No die can score below this face. |
| #Devour | Its neighbors score 0, and their score becomes Mult. |
| #Undo | Takes back your last reroll, and refunds it. |
| #Shift | Becomes a different random die on every roll. |
| #Empty | Feeds on the empty slots you have. |

### Short descriptions (v0.6.5)
Shown when you click a die (table, shop, inventory). At most two short sentences with a bit of lore; the flag-by-flag text above is the full description, shown on click and hold and in the Gallery.

| Die | Short description | Tags |
|---|---|---|
| **Earth** | Dependable as the ground itself. Waiting a reroll out makes it stronger. | #Patience |
| **Fire** | A spark from the first Split. It explodes on its top face, but a 1 burns it out. | #Explodes #Fizzles #Kindling |
| **Water** | It remembers every shape it has held. It locks for free and gives a reroll back. | #FreeLock #Refund |
| **Air** | A breath no Caster could bind. It calls matching sets, and you can nudge it. | #Sets #Drift |
| **Lightning** | A Storm's first word. It explodes like Fire and calls sets like Air. | #Explodes #Fizzles #Sets #Kindling #Drift |
| **Ice** | Water that held its breath. It locks for free, refunds the reroll, and calls sets. | #FreeLock #Refund #Sets #Drift |
| **Steel** | Fire hardened on Earth's anvil. It explodes and never burns out. | #Explodes #Patience |
| **Mud** | Water that sank into the soil. Lock it and its neighbor locks too, for free. | #Chain #FreeLock #Refund #Patience |
| **Steam** | Fire and Water in one breath. It explodes, and a reroll may copy it onto another die. | #Explodes #Fizzles #Copy #Kindling |
| **Crystal** | Earth that learned the wind. Inside a set, it counts double. | #Doubles #Sets #Drift #Patience |
| **Storm** | Fire, Water and Air in one temper. It explodes, locks for free, and calls sets. | #Explodes #FreeLock #Sets #Fizzles #Refund #Kindling #Drift |
| **Obsidian** | Fire that Water cooled into glass. It explodes without burning out, and can copy itself. | #Explodes #Copy #Patience |
| **Magma** | Fire pressed under Earth. It explodes, and inside a set it counts double. | #Explodes #Doubles #Sets #Drift #Patience |
| **Monsoon** | A season with a memory. Lock it and its neighbor locks too, and both feed sets. | #Chain #FreeLock #Sets #Refund #Drift #Patience |
| **Aether** | Every piece of the Split, whole again. It carries every mechanic, one per run. | #Explodes #FreeLock #Chain #Copy #Sets #Doubles #Fizzles #Refund #Kindling #Drift #Patience |
| **Gilded** | Not made for scoring. Clear the round and it pays its face in Shards. | #Payout |
| **Sapling** | A seed the Casters forgot. Held through rerolls, it grows. | #Grows |
| **Mirror** | It shows what stands beside it. Copies the score of the die to its left. | #Mirror |
| **Conduit** | A channel between neighbors. Its two neighbors react together, doubled. | #Reaction |
| **Kairos** | The right moment, caught twice. A 1 rolls again until it is not a 1. | #Rewind |
| **Beacon** | A light left on for its neighbors. The dice beside it score x1.5. | #Boost |
| **Prism** | It splits one light into four. Reacts as every element at once. | #Reaction |
| **Gaea** | The Earth god, bound into a die. Adds the faces of her whole family, and weighs them down. | #Divine #Wild #Patience |
| **Ognen** | The Fire god, bound into a die. Burns on any high face and goes out on a low one. | #Divine #Explodes #Fizzles |
| **Varuna** | The Water god, bound into a die. Any die can lock for free, but the tide pulls every roll toward 1. | #Divine #FreeLock #Refund |
| **Zephyr** | The Air god, bound into a die. Every set rises a step, but Fire burns less. | #Divine #Wild #Sets #Drift |
| **Primordial** | The dreamer's own die, lent to you. Every Aether power, and a share of each god's. | #Divine #Explodes #FreeLock #Chain #Copy #Sets #Doubles #Fizzles #Refund #Kindling #Drift #Patience |
| **Chrono** | Time itself, wound tight. A 1 rewinds the whole table, and you keep the better roll. | #Loop |
| **Comet** | A star that burned out long ago and is still falling. Its biggest rolls blaze, and count twice. | #Explodes #Burst |
| **Pulsar** | A dead star that ticks like a clock. Every reroll makes it hit harder. | #Pulse |
| **Satellite** | It scores nothing and lifts everyone near it. | #Boost |
| **Quasar** | The brightest thing in the sky, and all of it goes to Mult. Only one can shine. | #Flare |
| **Zenith** | The highest point the Casters ever reached. Holding it buys you more time. | #Rerolls |
| **Light** | The first dawn, kept in a die. Nothing near it falls below its face. | #Mythic #Floor |
| **Darkness** | What the light leaves behind. It swallows its neighbors and turns them into Mult. | #Mythic #Devour |
| **Time** | A moment you can take back. Undo a reroll once a round, and save the rest for later. | #Mythic #Undo |
| **Space** | The distance between things, folded. Its neighbors and both ends all touch. | #Mythic #Reaction #Warp |
| **Chaos** | Never the same die twice. Every roll it becomes something else. | #Mythic #Shift |
| **Void** | Absence with an appetite. It scores nothing, and every empty slot feeds your Mult. | #Mythic #Empty |
| **Entropy** | Every Mythic die and Aether, forged into the end of all things. | #Mythic |
| **Bullion** | A bar of stored Mult. It scores nothing, but pays your final Mult in Shards on a clear. | #Payout |
| **Masquerade** | It wears its neighbor's face. Copies the abilities and score of the die on its left. | #Copy #Mirror |
| **Chameleon** | Borrows the left die's abilities and the right die's score. | #Copy #Mirror |

---

## 3. Relics (45 total)

### Fire family
| Relic | Rarity | Price | Effect |
|---|---|---|---|
| **Molten Core** | Common | 5 | Every explosion adds +2 flat Base Value. |
| **Ember Heart** | Uncommon | 8 | Each die that explodes adds +1 Multiplier. |
| **Heat** | Uncommon | 8 | Each explosion this round gives every Fire-family die +1 for the rest of the round. |
| **Chain Break** | Epic | 18 | Fire-family dice explode on their top two faces, not just the max. Ognen's chain has no cap. Offered only once the god recipes are known. |
| **Wildfire** | Rare | 12 | Each explosion has a 20% chance to also trigger an explosion on another Fire-family die. |
| **Glass Cannon** | Epic | 18 | Explosions add double value, but a die that fizzles on a 1 also zeroes one random other die. |

### Water family
| Relic | Rarity | Price | Effect |
|---|---|---|---|
| **Riverstone** | Common | 5 | Locking a Water-family die grants +2 rerolls instead of +1. |
| **Tide Chart** | Common | 5 | Each locked or frozen die adds +3 Base. |
| **Undertow** | Uncommon | 8 | Locking a free-lock die also rerolls one random unheld die for free. |
| **Tidal Pool** | Uncommon | 8 | The set bonus is doubled if every die in the matching set is Water-family. |
| **Glacier Heart** | Rare | 12 | Locked and frozen dice score double. |

### Earth family
| Relic | Rarity | Price | Effect |
|---|---|---|---|
| **Bedrock** | Common | 5 | Pure Earth dice contribute ×1.5 to Base Value. |
| **Groundswell** | Uncommon | 8 | If the entire pool is pure Earth dice, Base Value is +50%. |
| **Steady** | Uncommon | 8 | Earth-family dice never roll below 3. |
| **Keystone** | Uncommon | 8 | +1 Multiplier if no die scores 0 this roll. |
| **Fossil** | Rare | 12 | Earth dice are wildcards for the set bonus: they match any face value. |

### Air family
| Relic | Rarity | Price | Effect |
|---|---|---|---|
| **Feather Charm** | Common | 5 | Pairs grant +1 extra Multiplier. |
| **Stormcaller** | Uncommon | 8 | Straight bonus grants +1 additional Multiplier. |
| **Gust** | Rare | 12 | Once per round, reroll a single chosen die for free. |
| **Static Charge** | Legendary | 28 | Explosion chains no longer have an iteration cap. |

### Neutral (no element)
| Relic | Rarity | Price | Effect |
|
| **Pantheon** | Legendary | 28 | You can hold a second god die. Sold only in the Aether Bazaar, once the god recipes are known. |
| **Mainspring** | Epic | 18 | Rerolls you do not use are banked for the next round, up to 3 (the same rerolls never count twice with Time). Sold only by the Horologist, in the Firmament. |
| **Cuckoo Clock** | Epic | 18 | Clear a round with 0 rerolls left: +5 Shards and +1 Mult on the next round's cast. Sold only by the Horologist, in the Firmament. |

---|---|---|---|

---

## 4. Consumables (39 total)

| Consumable | Rarity | Price | Target | Effect |
|---|---|---|---|---|
| **Upgrade Stone** | Epic | 18 | A die | Apply to a die to bump its tier one step (d6 to d10, and so on). |
| **Extra Reroll** | Uncommon | 8 | You | Grants +1 permanent reroll for the rest of the run. |
| **Transmute: Earth** | Common | 5 | A die | Apply to a die to change its element to Earth, keeping its tier. |
| **Transmute: Water** | Common | 5 | A die | Apply to a die to change its element to Water, keeping its tier. |
| **Transmute: Air** | Common | 5 | A die | Apply to a die to change its element to Air, keeping its tier. |
| **Transmute: Fire** | Common | 5 | A die | Apply to a die to change its element to Fire, keeping its tier. |
| **Whetstone** | Common | 5 | A die | Apply to a die: it permanently scores +2 whenever it scores. |
| **Chisel** | Common | 3 | A die | Splits a die in two of the next size down (d20 into two d10, d10 into two d5, d6 into two d3). A d5 chips into a d3 and leaves a Transmute of its element. A d3 is too small. Needs a free dice slot for the two-way splits. Not for god dice or the Primordial die. |
| **Phoenix Feather** | Uncommon | 8 | You | Restore 1 life. |
| **Aether Dust** | Rare | 12 | A die | Apply to a pure die to turn it into a random double fusion that contains its element. |
| **Arcane Seal** | Epic | 18 | A die | Apply to a die to turn it into a random rare or epic Arcane die, keeping its tier. |
| **Shard Pouch** | Common | 5 | You | Gain Shards equal to twice the current round (at least 4). |
| **Lucky Charm** | Uncommon | 8 | You | +3 rerolls: this round if used during a round, otherwise next round. |
| **Fusion Spark** | Rare | 12 | You | Opens the Fusion Forge in this shop, even without beating a boss. |
| **Mirror Shard** | Rare | 12 | A die | Apply to a die to add an exact copy of it to your pool (needs a free dice slot). |
| **Loom of Fate** | Uncommon | 8 | You | Restock the shop with new offers, for free. |
| **Stopwatch** | Rare | 12 | You | During a round: undo your last reroll and get it back. Firmament only. |
| **Time Capsule** | Uncommon | 8 | You | Bank 2 rerolls for the next round. Firmament only. |
| **Hourglass** | Uncommon | 8 | You | During a round: your next 3 rerolls this round do not use up a reroll (no Shard tax either; Pulsar still counts them). Firmament only. |
| **Pocket Watch** | Rare | 12 | A die | Next round that die starts held, on the face it shows now. Firmament only. |
| **Metronome** | Uncommon | 8 | You | +1 Mult on every cast for the next 3 rounds. Firmament only. |
| **Almanac** | Rare | 12 | You | Adds an Almanac page to your pacts and boons with the next three targets and the next boss, exactly (it foretells the boss like a Prophecy). Firmament only. |
| **Warp Seal** | Legendary | 28 | A die | Apply to a die to give it Warp: it no longer counts toward your dice cap (at most 3 Warp dice). Firmament only. |
| **The Phoenix** | Uncommon | 6 | You | Levels Kindle: +0.5 Mult per level. Firmament only. |
| **The Anvil** | Uncommon | 6 | You | Levels Forge: +2 Base per level. Firmament only. |
| **The Geyser** | Uncommon | 6 | You | Levels Scald: +2 Base and +0.25 Mult per level. Firmament only. |
| **The Cloud** | Uncommon | 6 | You | Levels Mist: +0.5 Mult per level. Firmament only. |
| **The Seedling** | Uncommon | 6 | You | Levels Bloom: +2 Base per level. Firmament only. |
| **The Whirl** | Uncommon | 6 | You | Levels Dust Devil: +3 Base per level. Firmament only. |
| **The Twins** | Uncommon | 6 | You | Levels Resonance: +2 Base per level. Firmament only. |
| **The Pair** | Uncommon | 6 | You | Levels Pair sets: +0.5 Mult per level. Firmament only. |
| **The Trio** | Uncommon | 6 | You | Levels Three of a kind: +0.75 Mult per level. Firmament only. |
| **The Ladder** | Uncommon | 6 | You | Levels Straights: +1 Mult per level. Firmament only. |
| **Black Hole** | Legendary | 25 | You | One level on all ten at once. Firmament only; weight 0.4. |
| **Rune of Echo** | Epic | 18 | A die | The die scores twice (after Beacon's boost). |
| **Rune of Glass** | Rare | 12 | A die | The die's score is doubled, but after every cast it has a 20% chance to shatter and leave your pool (the pool never loses its last die). |
| **Rune of Kinship** | Rare | 12 | A die | For reactions the die counts as its left neighbor's element (nothing at the left end). |
| **Rune of Ember** | Uncommon | 8 | A die | The die explodes on its top two faces. |
| **Rune of Anchor** | Uncommon | 8 | A die | The die never fizzles (and so pays no Kindling). |

**Constellations (v0.7.5).** Used from a shop or mid-round, they apply at once and need no target; "Buy & use" in a shop spends no slot. Each levels one thing for the rest of the run, up to **level 10**: the seven base reactions (Kindle, Forge, Scald, Mist, Bloom, Dust Devil, Resonance) and the three set types (Pair, Three of a kind, Straight). The bonus is added inside the thing's own ledger line, which reads "Kindle Lv 3". Secret reactions do not level. Levels are saved with the run and listed in Run Info. Black Hole gives every one a level (those at 10 stay). Seren's Observatory sells them (four a visit, duplicates allowed, Black Hole about 2% of offers); other Firmament shops stock them at low weight (a tenth to a twentieth of their items). Using one at level 10 does nothing and keeps it.

**Runes (v0.7.5).** A die holds one rune; applying another replaces it. Not on Mythic dice or Entropy. A small tag on the die shows it, and its popover and full description say what it does. Chisel keeps the rune on both halves, Transmute removes it, Shadow Twin and Mirror Shard copy it. Sold at every Forge (two on its shelf), the Aether Bazaar, the Astral Exchange and in the Firmament Market; nowhere else.

The Stopwatch, the Time Capsule, the Hourglass, the Pocket Watch, the Metronome and the Almanac are all in the Horologist's pool; the last four are his alone (the Stopwatch and Time Capsule also turn up in other Firmament shops); the Warp Seal turns up in other Firmament shops, very rarely (a quarter of a Legendary's weight). During the Hollow's round no consumable can be used.

Any consumable can also be **Buy & use**: applied on the spot without taking a slot. Consumables can be used during a round too (from the round HUD), except Fusion Spark and Loom of Fate, which only work in a shop.

---

## 5. Reactions

### Basic (7)
| Reaction | Trigger (adjacent dice) | Reward |
|---|---|---|
| **Resonance** | Two identical dice | +2 Base. |
| **Kindle** | Fire + Air | +1 Mult. |
| **Forge** | Fire + Earth | add the lower of the two faces to Base. |
| **Scald** | Fire + Water | +3 Base and +0.5 Mult. |
| **Mist** | Water + Air | +0.5 Mult. |
| **Bloom** | Water + Earth | add the higher of the two faces to Base. |
| **Dust Devil** | Earth + Air | +4 Base. |

### Secret (8, shown as ??? until found)
| Reaction | Trigger (adjacent dice) | Reward |
|---|---|---|
| **Thunderhead** | Lightning + Steam | a storm cloud forms. +2 Mult. |
| **Superconductor** | Lightning + Ice | current with no resistance. +5 Base, +1.5 Mult. |
| **Thermal Shock** | Ice + Magma | stone cracks apart. Add both faces to Base, +1 Mult. |
| **Geode** | Mud + Crystal | a hidden geode. Add both faces twice to Base. |
| **Railgun** | Steel + Lightning | magnetic launch. +3 Mult. |
| **Hurricane** | Storm + Monsoon | the sky breaks. +8 Base, +3 Mult. |
| **Caldera** | Obsidian + Magma | the volcano collapses. Add both faces twice to Base, +1 Mult. |
| **Ascension** | Aether + any double or triple fusion | the elements remember they were one. +10 Base, +3 Mult. |

---

## 6. Characters

### Pip
A small arcane wisp, "keeper of the circle". Guides first-time players through the tutorial. In the lore, Pip is a spark of Aether that fell off during the Split.

### The keepers (shops)
Each keeper remembers you per save file. Tiers: stranger (visits 1 to 3), regular (4 to 9), friend (10+). Lore lines replace the greeting on the listed visits.

### Tobb, traveling peddler
- **First meeting:** Well met, Caster! Tobb's the name, and the Roads are my shop. Everything I own is for sale, except the backpack.
- **Stranger:** Back again? Good. Shards don't spend themselves.
- **Stranger:** Fresh stock, fresh from somewhere.
- **Regular:** My favorite customer! Don't tell the others.
- **Regular:** I saved you the good dice. Probably.
- **Friend:** You're the only Caster who ever came back this many times.
- **Friend:** Pull up a crate, friend. Business can wait a moment.
- **After a boss:** You beat a Fragment? Then you can afford my prices.
- **On your last life:** You look rough. Buy something shiny, it helps. Trust me.
- **At the camp** (after a missed round, not counted as a visit): Sit, Caster. Nobody wins every fight. Have some tea, then try again.
- **Lore** (told on visits 2, 4, 7, 11):
  1. Dice weren't always toys, you know. The first Casters carved them to hold the elements after the Split.
  2. The Split? Before Fire, Water, Earth and Air there was only the Primordial. One thing, everything at once. The Casters broke it in four.
  3. The bosses you face are what is left of it. Fragments. They twist the rules because they remember when there were no rules.
  4. Every Caster walks the Roads toward the last Circle. Most stop. You keep going. I like that. Good for business.

### Vessa, alchemist
- **First meeting:** Careful, that one bubbles. I'm Vessa. I brew what the elements forget to be.
- **Stranger:** Bring me two things and I'll give you one better thing. That's alchemy.
- **Stranger:** Don't touch the green flask. Or do. I'm curious.
- **Regular:** Ah, my favorite test subject. I mean customer.
- **Regular:** I made something new. It only exploded twice.
- **Friend:** I named a potion after you. It is very stubborn.
- **Friend:** Stay a while. The fumes are mostly harmless now.
- **After a boss:** You smell of Fragment. Delightful. Mind if I take a sample?
- **On your last life:** You're leaking vitality. Drink something. Not the green one.
- **Lore** (told on visits 2, 4, 7, 11):
  1. Water remembers every shape it has held. That's why my brews work: I just remind it.
  2. Steam, Mud, Ice. Fusions aren't new elements. They're old ones holding hands.
  3. Aether is all four holding hands at once. It's the closest thing to the Primordial we can still touch.
  4. Pip? That little wisp is Aether too. A spark that fell off during the Split and never found its way back.

### The Curator, keeper of the vault
- **First meeting:** Speak softly. Every relic here belonged to someone who did not finish the Road. I am the Curator. I keep them.
- **Stranger:** Choose with care. Relics choose back.
- **Stranger:** These were taken from the Fragments you defeated.
- **Regular:** You return, and you return. The relics notice.
- **Regular:** I polished the crown for you. Not that I expected you.
- **Friend:** When you fall, and all Casters do, I will keep your dice with honor.
- **Friend:** You have earned a seat by the vault. Few have.
- **After a boss:** The Fragment's echo is still warm. Its treasures are here now.
- **On your last life:** Your light is thin. Do not let me add you to the collection today.
- **After you first beat Primordial** (once, on the next Vault visit): You defeated it. Then you have earned this: the recipe the first Casters swore never to write down.
- **Lore** (told on visits 2, 4, 7, 11):
  1. I was a mountain once. A Caster carved me from the Earth half of the Split, to guard what matters.
  2. Each boss is a Fragment wearing a rule like a mask. Calm Winds, Iron Grip, Silence. Names we gave them so we could fight them.
  3. The Primordial does not want to destroy you. It wants to be whole again. It needs your dice for that.
  4. The last Circle is where the Split happened. If the Primordial reforms there, there will be no Road, no vault, and no me.

### Brasa, smith of the fusion forge
- **First meeting:** Mind the sparks! Name's Brasa. Bring me dice, I'll make them bigger, meaner, or both.
- **Stranger:** Two dice go in, one better die comes out. Simple.
- **Stranger:** Hot iron, hot dice, hot deals. Well, fair deals.
- **Regular:** Your dice sing when I hit them. Good sign.
- **Regular:** Back for more heat? I kept the forge warm.
- **Friend:** I'd forge you a die from my own flame if you asked. Don't ask.
- **Friend:** Every die you rolled against a Fragment, I hear it in the metal. You've been busy.
- **After a boss:** A Fragment down! We celebrate the only way I know: by melting things.
- **On your last life:** You're cooling off, Caster. Let's warm your dice before you go.
- **Lore** (told on visits 2, 4, 7, 11):
  1. Fire was the first piece of the Primordial to break free. It's been restless ever since. So am I.
  2. The Fusion Forge is older than me. The first Casters used it to glue elements back together, but only a little. Only in dice.
  3. Lightning, Magma, Steam. Every fusion is a tiny Primordial. Tame, though. Mostly.
  4. They say the Primordial burns without fire. If you meet it, roll hot.

### Nix, dealer in the dark
- **First meeting:** Shh. You didn't see me. I'm Nix, and my deals cost more than Shards.
- **Stranger:** Everything has a price. Mine are just honest about it.
- **Stranger:** One deal. Take it or walk away. Both are choices.
- **Regular:** You again. You like risk. I like you.
- **Regular:** I keep a list of people who pay. You're on it. That's good.
- **Friend:** Between us? The Fragments buy from me too. I sell them the same bad deals.
- **Friend:** For you, a discount. On the regret, not the price.
- **After a boss:** A Fragment fell and you're still standing. That's worth something.
- **On your last life:** You're low. That makes the deal sweeter. For me.
- **Lore** (told on visits 2, 4, 7, 11):
  1. Air goes everywhere and belongs nowhere. So do I.
  2. The Primordial whispers to anyone who listens. I listened once. That is how I learned what a life is worth.
  3. Tobb thinks the Roads are safe. The Roads were built by the Fragments. Before they were Fragments.
  4. If the Primordial reforms, every deal ever made comes due at once. I plan to be elsewhere.

### Aeris, voice of the shrine
- **First meeting:** Rest, Caster. I am Aeris. The wind brings me the whispers of the Fragments, and I bring them to you.
- **Stranger:** Take a blessing, or take a warning. Both are free.
- **Stranger:** The wind is quiet here. Breathe.
- **Regular:** The wind speaks of you now. It says you are stubborn.
- **Regular:** Welcome back to stillness.
- **Friend:** I have prayed for you on every Road. Keep walking.
- **Friend:** You have given the wind a new story. Thank you.
- **After a boss:** One Fragment sleeps again. The wind is lighter for it.
- **On your last life:** Your breath is short. Let me lend you some of mine.
- **Lore** (told on visits 2, 4, 7, 11):
  1. Before the Split there was no sky and no ground, only the Primordial, dreaming.
  2. The Casters did not want to break it. They broke it because its dream was ending everything else.
  3. Pip remembers that dream. Ask it someday. It won't answer, but it will glow.
  4. Each run you walk is a prayer. Each Fragment you defeat keeps the world split, and so, alive.

### The Wanderers, every keeper, one crossroads
- **First meeting:** Tobb: "Surprise! Once in a long while all of us set up at the same crossroads." Vessa: "It was my idea." Nix: "It was not."
- **Stranger:** The Aether Bazaar is open! Every keeper, every stall, every discount.
- **Regular:** Tobb: "Best prices on the Road." Brasa: "Best heat." Nix: "Best regrets."
- **Friend:** Aeris: "Look who it is." The Curator: "We saved you a stall."
- **After a boss:** Brasa: "A Fragment down! Drinks are on Tobb." Tobb: "They are not."
- **On your last life:** Vessa: "You look awful." Aeris: "Kindly, she means: rest here."
- **Lore** (told on visits 2, 3):
  1. Aeris: "When all the Wanderers meet, the Road remembers it was once one thing too."
  2. The Curator: "We always gather before the last Circle. Even keepers want to see how the story ends."

### The Firmament's keepers (v0.7, drafts)
### Atlas, cartographer
- **First meeting:** Mind the ink, it is still wet. I am Atlas. I draw the Roads up here, and sometimes the Roads agree with me.
- **Stranger:** Every map is a promise. Mine are mostly kept.
- **Stranger:** Where to next? I can make it somewhere better.
- **Regular:** You walk my lines well. I drew this one with you in mind.
- **Regular:** A Warden moved last night. I redrew three rows.
- **Friend:** I left a corner of every map blank for you. Fill it however you like.
- **Friend:** Sit. The stars can wait to be charted.
- **After a boss:** A Warden fell? Then a border just moved. Give me a moment.
- **On your last life:** You are running out of map, Caster. Let me draw you a shorter way.
- **Lore** (told on visits 2, 4):
  1. The Firmament is not a place. It is the frame around every place. The Wardens are its corners.
  2. There is a spot on every map I draw that will not take ink. A blank. I think something lives there.

### The Horologist, keeper of the hours
- **First meeting:** You are four seconds late. Not to worry, I wound them back. I am the Horologist. Time is my trade.
- **Stranger:** Tick. Tock. Buy something before the hour turns.
- **Stranger:** Every die rolls in time. Mine roll twice.
- **Regular:** Back again, at exactly the right moment. As usual.
- **Regular:** I have been expecting you since tomorrow.
- **Friend:** For you I stopped every clock in the shop. Take your time. Literally.
- **Friend:** We have met before. You just have not got there yet.
- **After a boss:** The Clockwork? A crude design. Mine are better. Do not tell it I said so.
- **On your last life:** Your time is short. I can sell you a little more of it.
- **Lore** (told on visits 2, 4):
  1. Kairos is the right moment. Chrono is every moment. The Casters only ever had the first.
  2. Before the Split there was no time, only the dream. Time is what the pieces do while they wait.
  3. I keep six things on the shelf and sell three of them. Which three depends on the minute you arrive. Do not ask me which minute.
  4. A Pulsar is a star that learned to count. Everything in this shop is just another way of counting.
  5. The Mainspring is the oldest thing I own. It was in the first clock, the one that wound the dream.

### Seren, the astronomer
- **First meeting:** Quiet, please, the sky is thinking. I am Seren. I chart the shapes the stars make when nobody is rolling anything.
- **Stranger:** Every reaction is a star you have not drawn yet. Buy one.
- **Stranger:** Look up. No, further. There.
- **Regular:** Your stars are coming along nicely. Mind the glare.
- **Regular:** I saved you a good one. It fell this morning.
- **Friend:** For you I leave the lens uncovered. Do not tell the Wardens.
- **Friend:** You and I have charted half this sky. The other half is shy.
- **After a boss:** A Warden down. The sky is a little wider tonight.
- **On your last life:** You are burning low. Take a star, it keeps longer than a heart.
- **Lore** (told on visits 2, 4, 6):
  1. A Constellation is just a habit the stars picked up. Feed a habit often enough and it becomes a law.
  2. The Black Hole is not a star. It is where the sky keeps what it has not decided about yet.
  3. Atlas draws where the Roads go. I draw why. We do not speak much, the maps get crowded.

### Mote, a speck of the void
- **First meeting:** ...
- **Stranger:** ...
- **Stranger:** (it stares at your dice)
- **Regular:** (it opens its mouth, hopefully)
- **Regular:** more?
- **Friend:** you came back. you always bring food.
- **Friend:** i remember you. i remember everything you fed me.
- **After a boss:** (it licks its lips)
- **On your last life:** (it looks at you, a little worried)
- **Lore** (told on visits 5):
  1. before the first word there was nothing. i was the nothing. now i am a little something.
- Mote says nothing but "..." until it has eaten 40 Shards of goods; then it speaks (a story scene, see §7b).

**True forms past the door** (shown in place of their usual mood lines in the Firmament):
- **Tobb:** What, you thought I'd stay behind? I go everywhere, Caster. The prices up here are astronomical. That's a joke. Mostly.
- **Aeris:** Here the wind is not a messenger. It is me, all of me. Ask, Caster, and the sky will answer.
- **Nix:** Welcome to the eclipse market. No more hiding in alleys. Up here I sell under a black sun, and everyone pays.

### Bosses (the Fragments)
Boss rounds are 5, 10 and 15 (Cataclysm: every round). Each boss has its own music theme.

| Boss | Appears | Twist | Music |
|---|---|---|---|
| **Calm Winds** | From round 5 | Explosions do not chain this round: max face still adds once, then stops. | `boss_calm_winds` |
| **Grounded** | From round 5 | Matching sets grant no Multiplier this round. | `boss_grounded` |
| **Iron Grip** | From round 5 | Only 1 reroll allowed this round, no matter how many you own. | `boss_iron_grip` |
| **Drought** | From round 5 | No die can use a free lock this round. | `boss_drought` |
| **Tax Collector** | From round 5 | Every reroll costs 1 Shard this round. | `boss_tax_collector` |
| **Scatter** | From round 5 | Straights do not count this round. Pairs and threes still do. | `boss_scatter` |
| **Ermal the Unbothered** | From round 5 | Does absolutely nothing. Enjoy the break. | `boss_ermal` |
| **Null Zone** | From round 10 | One of your elements scores nothing this round. | `boss_null_zone` |
| **Gravity Well** | From round 10 | Faces above 4 score half this round. | `boss_gravity_well` |
| **The Pillar** | From round 10 | Your highest-scoring die scores 0 this round. | `boss_the_pillar` |
| **Frostbite** | From round 10 | One random die starts the round frozen on a 1. | `boss_frostbite` |
| **Eclipse** | From round 10 | Your dice faces are hidden until you cast. | `boss_eclipse` |
| **Silence** | From round 10 | One of your relics is sealed and does nothing this round. | `boss_silence` |
| **Primordial** | Round 15 (and every 15 in Endless) | The final boss. Its twist changes every time you reroll. Pool: Calm Winds, Grounded, Drought, Tax Collector, Scatter, Gravity Well, The Pillar. | `boss_primordial` |
| **Primordial Unbound** | Round 15 on the Split path | The Primordial's shifting twist, a target x1.5, and after every reroll it fuses two neighboring pure dice of different elements into their double fusion for that attempt (your pool comes back afterwards). | `boss_primordial` |
| **Gaea** (gauntlet 1 of 4) | Round 15 on the Primordial path | Your Earth-family dice score -5 (-10 on a 1). Target x0.7. | `boss_gaea` |
| **Ognen** (gauntlet 2 of 4) | | Your Fire-family dice fizzle on 1, 2 and 3. Target x0.9. | `boss_ognen` |
| **Varuna** (gauntlet 3 of 4) | | 1s come up 50% more often on every die. Target x1.1. | `boss_varuna` |
| **Zephyr** (gauntlet 4 of 4) | | Your Fire-family dice explode half as often, and sets need one more matching die. Target x1.4. | `boss_zephyr` |

Ermal the Unbothered is named after beta tester Ermal and has a sleepy portrait.

### The Wardens (the Firmament, v0.7)
Rounds 20, 25 and 30 past the door. Targets: the round's normal target x1 (20), x1.1 (25), x1.25 (30). On Cataclysm the other Firmament rounds are bosses from the pool above. No pact can swap a Warden out (Bound Tongue and Unspoken Prayer skip them).

| Warden | Guards | Twist | Music |
|---|---|---|---|
| **The Dawn** | Light | Overexposure: dice showing their max face score 0. | `boss_dawn` |
| **The Umbra** | Darkness | Faces are hidden until you cast, and every reroll swallows one unheld die for the round. | `boss_umbra` |
| **The Clockwork** | Time | A 90-second countdown. At 0, whatever is on the table is cast. | `boss_clockwork` |
| **The Expanse** | Space | The order of your dice shuffles after every reroll. | `boss_expanse` |
| **The Maelstrom** | Chaos | After every reroll, one die that just rolled becomes a random pure element for the round. | `boss_maelstrom` |
| **The Hollow** | Void | Every relic is sealed and consumables cannot be used this round. | `boss_hollow` |

- **The Clockwork's timer** runs only while the table is live: not paused, no Run Info, tutorial or story scene, not casting, and the tab visible. At 0:00 it casts whatever is on the table.
- **The Umbra's swallowed die** is locked, dimmed and tagged, and scores 0 for the round. Light on the table keeps the faces visible.
- **The Maelstrom** keeps each die's size; your dice get their own elements back after the cast or a miss.
- **The sets** (Set I on a path's first Firmament run, Set II on a later one):

| Path | Set I | Set II |
|---|---|---|
| Split | The Dawn, The Clockwork, The Expanse | The Umbra, The Maelstrom, The Hollow |
| Primordial | The Umbra, The Maelstrom, The Hollow | The Dawn, The Clockwork, The Expanse |
| Neutral | The Dawn, The Umbra, The Clockwork | The Expanse, The Maelstrom, The Hollow |

---

## 7a. The three paths and the endings

- **The path locks when you walk into round 15.** The Accord adds the dice in hand: +1 per fusion, Aether or Prism, -1 per pure die, -3 per god die. +8 or more is the Primordial path, -6 or less the Split path, anything else Neutral. A pool of 4+ dice that all share one family also adds -3. Until the file knows the god recipes, every run is Neutral.
- **Hints:** Aeris and Nix react to a lean of 4 or more; Pip says one line at round 14 (once the paths are open) about where you are heading; in round 15 the Primordial speaks a line for your path, and the arena tints red (Primordial) or blue-white (Split).
- **Neutral:** the usual Primordial fight. Ending: **The Circle Holds**. The first Neutral win on a file shows the visions of Gaea, Ognen, Varuna and Zephyr and teaches their recipes (opening both other paths). Endless is only offered after this ending.
- **Split:** Primordial Unbound (see §6). Ending: **The Split Holds Forever**.
- **Primordial:** the gods' gauntlet, four stages inside round 15, no shop or camp between them (a miss costs a life and retries the stage). The Primordial die joins your pool and absorbs each fallen god. Ending: **Made Whole**.
- **Endings** are collected in the Gallery's Endings tab, and each loadout shows a completion mark per ending it has reached (on the new-run carousel and in the Gallery). Ending card texts are drafts for Carlos.

---

## 7b. The Firmament (v0.7)

- **The door:** a path's door opens once the file has seen that path's ending (The Circle Holds, The Split Holds Forever, Made Whole). The first run is always Neutral, so the Neutral door is open from the second run on.
- **The Crossroads:** win round 15 on a path whose door is open and, after a story scene, choose: **Rest here** (the run ends with that path's ending, as before) or **Enter the Firmament**. The round-15 win is recorded on the file either way (loadout, difficulty, stake, ending mark). The screen shows the Warden set the door leads to; with both sets done, you pick one.
- **Through the door** the same run goes on with everything you carry (dice, relics, consumables, lives, Shards, seed, path). The boss reward comes first, then a Market with Tobb (where the path's follower greets you), then rounds 16 to 30 on the Firmament's stretch of the Road, with the usual target curve. Wardens wait at 20, 25 and 30 (see §6). If the run ends in the Firmament it still counts as a win in the file's stats.
- **Endings:** beating the round-30 Warden ends the run with the path's Firmament ending. No Endless after it. Nine endings in all, each with a hint on its locked card (drafts for Carlos):

| Ending | Path | How |
|---|---|---|
| The Circle Holds | Neutral | Win a run. |
| The Split Holds Forever | Split | Win on the Split path. |
| Made Whole | Primordial | Win on the Primordial path. |
| The Frame Unbroken | Neutral | Beat Firmament I (the Dawn, the Umbra, the Clockwork). |
| Balance Beyond | Neutral | Beat Firmament II (the Expanse, the Maelstrom, the Hollow). |
| Order in the Heavens | Split | Beat Firmament I (the Dawn, the Clockwork, the Expanse). |
| The Long Division | Split | Beat Firmament II (the Umbra, the Maelstrom, the Hollow). |
| The Eclipse Market Closes | Primordial | Beat Firmament I (the Umbra, the Maelstrom, the Hollow). |
| Everything, Remembered | Primordial | Beat Firmament II (the Dawn, the Clockwork, the Expanse). |

- **The Mythic dice and Entropy:** each Warden's first defeat on the file unlocks the Mythic die it guards (a toast); all six teach Entropy's recipe (a scene and a toast).

**Story scenes** (text drafts for Carlos, `data/story.js`). Each plays once per file, can be skipped (Esc) and replayed from the Gallery's Endings tab; Reduced motion shows every line at once; the table and the Clockwork's timer wait while one is open.
- Before round 15: the Primordial speaks on each path (who it is, why it wants your dice; on the Split path it fights to take them back; on the Primordial path it asks you to bring the four back).
- The Primordial path: the loan of the Primordial die, then each god before their gauntlet stage.
- After the first Neutral win: the visions (one page per god, then the Primordial's last words about "the four who broke me"), then the recipes scene (Aether and the four gods, how each is made), which ends with the achievement **Remembering**.
- The Crossroads, each Warden before its fight, the path follower's arrival (Aeris in her true form, Nix's eclipse market, Tobb), Mote's first words, and Entropy.

---

## 7. Shops and the Road

| Shop | Keeper | What it does | Music |
|---|---|---|---|
| **Market** | Tobb | Dice, relics and consumables. The classic shop. | `shop_market` |
| **Alchemist** | Vessa | Consumables only, 20% off. Brew two into a stronger one. | `shop_alchemist` |
| **Relic Vault** | The Curator | Three rarer relics. Shows up after bosses. | `shop_vault` |
| **Forge** | Brasa | The Fusion Forge and die size upgrades, plus two Runes on the shelf. | `shop_forge` |
| **Black Market** | Nix | Rare. One risky deal, paid in more than Shards. | `shop_blackmarket` |
| **Shrine** | Aeris | Rare. A free blessing, or a prophecy of the next boss. | `shop_shrine` |
| **Aether Bazaar** | The Wanderers | Legendary. Every shop in one, 25% off, with rarer stock. | `shop_bazaar` |
| **Astral Exchange** | The Wanderers | The Firmament's legendary shop: the Aether Bazaar's stock and prices, with one Celestial die always on the shelf. Always the stop before the round-30 Warden. | `shop_bazaar` |
| **Seren's Observatory** | Seren | The Firmament only. Four Constellations a visit, duplicates allowed (Black Hole rarely). Reroll for 3 and up. | `shop_observatory` |
| **Atlas's Cartography** | Atlas | The Firmament only. No goods: three services, each once per visit. **Redraw** (6 Shards): the next row of the Road is drawn again (the follower's stop and the legendary shop stay). **Add a path** (5): this stop links to one more shop in the next row. **Peek** (8): learn which Warden waits next; it shows on the Road. | `shop_cartography` |
| **The Horologist's Clockwork** | The Horologist | The Firmament only. **Six offers a visit, drawn from a pool**: Chrono always, plus one of Pulsar, Zenith and Kairos; three of his six consumables (Stopwatch, Time Capsule, Hourglass, Pocket Watch, Metronome, Almanac); and one of his two relics (Mainspring, Cuckoo Clock). No restock button. | `shop_clockwork` |
| **Mote's Pantry** | Mote | The Firmament only. Sells nothing: it buys any die, relic or consumable for 150% of its sell value (rounded up), and eats its sell value. Its appetite (on this file, across runs) fills a meter to 400. At **40** its secret stock opens: a **Hollow Pact** for 15 Shards (Mote's, not a Nix pact: no Accord, no effect on Aeris) and a random die as a d6 with Warp (its price +12). At **120**: a **Warp Seal** and one of the file's Mythic dice the run lacks, with Warp (a Chrono if there is none). At 400 it is full (nothing more yet). | `shop_pantry` |
| **Camp** | Tobb | Not on the Road. After a missed round (not game over): 3 + half the round number in Shards on arrival (stacks with Steadfast), 2 dice and 2 relics or consumables with rerolls, no Forge. Leaving retries the same round; your next Road stop stays the same. Tobb: "Sit, Caster. Nobody wins every fight. Have some tea, then try again." | `shop_market` |

**How the Road is built:** round 1 is always a Market. The shop right after a boss (rounds 5, 10, 15) is a choice of Relic Vault, Forge, and sometimes Market. The last stop before Primordial always includes the Aether Bazaar. Every other stop is drawn by weight, never two of the same type in one row:

- Market: weight 46, from round 1
- Alchemist: weight 16, from round 2
- Forge: weight 12, from round 2
- Relic Vault: weight 7, from round 3
- Shrine: weight 6, from round 2
- Black Market: weight 6, from round 3
- Aether Bazaar: weight 2, from round 8

**The Firmament's stretch** (rounds 16 to 30): the shop after a Warden is a choice of Relic Vault, Forge and sometimes Market; the stop before the round-30 Warden always includes the Astral Exchange; each stretch has one guaranteed stop of the path's follower (a Shrine with Aeris on the Split path, a Black Market with Nix on the Primordial path, an extra Market with Tobb on the Neutral path), on a seeded row between 17 and 23. The other stops are drawn by weight:

- Market 30, Alchemist 10, Forge 10, Atlas's Cartography 10, Relic Vault 8, the Horologist's Clockwork 8, Mote's Pantry 8, Seren's Observatory 8, Shrine 6, Black Market 6, Astral Exchange 2.

**Black Market deals** (2 offered, take one; the Bazaar offers 1):
- **Blood Price**: Take a legendary relic. Costs 1 life.
- **Nix's Loan**: Get {shards} Shards now. The next target is 50% higher.
- **Soul Die**: Take a random triple fusion die. Costs 1 max life.
- **Hollow Pact**: +2 rerolls every round. Lose 1 relic slot for the run.
- **Gambler's Oath**: Your next clear pays double Shards, or nothing (a seeded coin flip at that clear).
- **Hollow Crown**: +1 relic slot, but your relics sell for 0 for the rest of the run.
- **Shadow Twin**: Clone your best die (biggest, then rarest). The clone fizzles on 1 and 2. Needs a free dice slot.
- **The Long Night**: The next boss brings a second random twist of its tier (tier 2 for Primordial). Beating it pays a random legendary relic (15 Shards if none fits).
- **Bound Tongue**: The next lesser boss becomes Ermal the Unbothered (never Primordial; unavailable if the next boss is Primordial). Aeris never appears again this run.

**Betrayal pacts** (one extra offer per Black Market visit, only when you hold the blessing it breaks; still one deal per visit). Each counts as a Nix pact:
- **Broken Vow** (needs Blessing of Wind): lose Wind's +1 reroll, take a random legendary relic (needs a relic slot).
- **Unspoken Prayer** (needs an active Prophecy): the foretold boss becomes a random tier-1 boss (no longer shown), +12 Shards.
- **Stolen Breath** (needs Blessing of Tide still pending): cancel the +3 rerolls; your next clear pays double Shards.
- **Severed Grace** (needs any Aeris blessing this run): +1 Mult for the rest of the run; Shrines never appear again.

**Aeris's price** (every blessing and the Prophecy), by Nix pacts this run:
- 0: free.
- 1: 4 + half the round number in Shards. Every second Shrine still ahead on the Road becomes a Black Market. Aeris: "Something is strange about you."
- 2: your cheapest consumable, or your lowest-rarity relic if you have no consumables (shown before you accept). Aeris: "You carry a shadow. I can still help, for a price."
- 3 or more (or Bound Tongue, or Severed Grace): every Shrine ahead becomes a Black Market; Aeris no longer appears.
- Leaving a Black Market without a deal turns one Market at least two rows ahead into a Shrine (seeded; not once Aeris is gone).

**Shrine blessings** (3 of these 10 offered, take one, or take the Prophecy instead):
- **Blessing of Stone** (Earth): Restore 1 life. If you are full, +8 Shards.
- **Blessing of Flame** (Fire): A random die grows one size.
- **Blessing of Tide** (Water): +3 rerolls next round.
- **Blessing of Wind** (Air): +1 reroll every round for the rest of the run.
- **Blessing of Aether** (Aether): A free rare consumable (needs a free slot).
- **Blessing of Plenty**: Your next clear pays double Shards, but the next shop's offers can't be rerolled.
- **Blessing of Ember-ward**: Next round, no die can fizzle.
- **Blessing of Clarity**: See two more rows of the Road, and change your chosen next stop once, even mid-round (the round HUD offers the other stops linked from your last shop).
- **Blessing of Communion**: Next round, every reaction gives +0.5 more Mult.
- **Blessing of Grace**: Restore all lives (only offered as takeable when you're missing one). Shrines in the next two rows of the Road become Markets.
- **Prophecy**: Instead of a blessing, learn which boss waits at round {round}.

**Boss reward:** after every boss, grow one die of your choice a size, and add +1 slot to dice, relics or consumables.

**The Accord** (hidden, never shown as a number; Claude's spec weights): +1 per fusion forged, +2 per Nix pact, +4 per betrayal pact, -2 per Aeris blessing (Prophecy included). In Alpha v0.5 it only colors dialog: at 4 or more either way, Aeris and Nix comment on your lean. Nix also has lines for your betrayal offers ("She blessed you? How sweet..."), for pacts in general, and once Aeris is gone.

---

## 8. Loadouts, difficulties, achievements

### Loadouts (each unlocks by winning with the previous one)
| Loadout | Starting dice | Tagline |
|---|---|---|
| **Stonecaller** | Earth, Earth, Earth | Steady stone. No risk, no tricks. |
| **Tidecaller** | Water, Water, Water | Free locks that feed your rerolls. |
| **Tempest** | Air, Air, Air | Sets from the very first roll. |
| **Pyromancer** | Fire, Fire, Fire | All explosion, no safety net. |
| **Wanderer** | Earth, Water, Fire, Air | One of every element. Fuse anything. |
| **Forgeborn** | Earth, Fire, Steel | Starts with Steel: fire without the fizzle. |
| **Stormchaser** | Fire, Air, Lightning | Chain explosions straight into sets. |
| **Avatar** | Earth, Earth, Aether | Master of all four. Starts with Aether. |

### Difficulties (each unlocks by winning the previous one)
Targets are 8 x 1.45^(round - 1), times the difficulty's target multiplier.

| Difficulty | Lives | Target x | Rerolls | Dice cap | Every round a boss |
|---|---|---|---|---|---|
| **Ember** | 3 | 1 | 3 | 10 | No |
| **Blaze** | 3 | 2 | 3 | 10 | No |
| **Inferno** | 3 | 2 | 2 | 4 | No |
| **Cataclysm** | 3 | 3 | 2 | 4 | Yes |

### Achievements
- **Stargazer** (secret): Own a Constellation at level 5.
- **Cartographer of Skies** (secret): Take a Constellation to level 10.
- **Runesmith** (secret): Own a die with a rune.
- **First Spark**: Clear your first round.
- **Keeper of the Circle**: Win a run.
- **Every Path**: Win with all 8 loadouts.
- **Through the Fire**: Win a run on Cataclysm.
- **Big Cast**: Score 1,000 in a single cast.
- **Colossal Cast**: Score 10,000 in a single cast.
- **Overkill**: Clear a round at 5x the target.
- **Chain Reaction**: Trigger 5 reactions in one cast.
- **Hidden Chemistry**: Discover a secret reaction.
- **Master Alchemist**: Discover every secret reaction.
- **Quintessence**: Own an Aether die.
- **Collector**: Fill every relic slot.
- **Dragon's Hoard**: Hold 100 Shards at once.
- **One Shot**: Beat a boss round without rerolling.
- **Beyond the Circle**: Reach round 20 in Endless mode.
- **Thanks, Ermal**: Face Ermal the Unbothered.
- **Bestiary**: Face every boss.
- **Archivist**: Discover every die, relic, and consumable.
- **Remembering**: Learn the recipes of Aether and the four gods (the scene after the visions). Files that knew them before v0.7 have it.
- **Trinity** (secret): Complete all three save files to 100%.

---

## 9. Lore (current draft)

**The Primordial.** Before the elements there was one thing that was everything at once, dreaming. Its dream was ending everything else.

**The Split.** The first **Casters** broke the Primordial into Fire, Water, Earth and Air, and carved dice to hold the pieces. Fire broke free first and has been restless ever since. The Curator was carved from the Earth half.

**Fusions** are old elements "holding hands again". **Aether** is all four at once, the closest thing to the Primordial anyone can still touch. **Pip** is a spark of Aether that fell off during the Split and never found its way back; it remembers the Primordial's dream.

**The Fragments.** Every boss is a fragment of the Primordial wearing a rule like a mask (Calm Winds, Iron Grip, Silence: names people gave them so they could fight them). They twist the rules because they remember when there were no rules. They want to become whole again, and they need the Casters' dice for that.

**The Roads and the Circles.** Casters roll in Circles and walk the Roads toward the last Circle, where the Split happened. If the Primordial reforms there, there will be no Road at all. Nix claims the Roads were built by the Fragments before they were Fragments.

**The Wanderers.** The keepers who follow the Casters: Tobb the peddler, Vessa the alchemist, the Curator of fallen Casters' relics, Brasa the smith, Nix who once listened to the Primordial's whispers and learned what a life is worth, and Aeris who hears the Fragments on the wind. Once in a long while they all set up at one crossroads (the Aether Bazaar), always before the last Circle, because even keepers want to see how the story ends.

**The point of it all** (Aeris): each run is a prayer, and each Fragment you defeat keeps the world split, and so, alive.

---

## 10. Synergy map

### Explosions (Fire family: Fire, Lightning, Steel, Steam, Storm, Obsidian, Magma, Aether)
- **Kindling:** a fizzle after a reroll refunds that reroll, so fizzling Fire dice are less of a dead end.
- **Payoffs:** Heat (+1 to every Fire-family die per explosion this round, counting rerolls), Molten Core (+2 Base per explosion), Ember Heart (+1 Mult per exploding die), Glass Cannon (explosion rolls count double), Static Charge (no chain cap), Loaded Die (+3 on the max face, which is exactly the explosion face), Lucky Coin (+1 Shard per explosion). Every explosion is also +0.5 Mult on its own.
- **Enablers:** Chisel (split into small dice: a d3 explodes 1 in 3 rolls instead of 1 in 6, and you get two of them). Blessing of Flame and Upgrade Stone pull the other way (bigger faces, fewer explosions), so Fire builds want small dice.
- **Safe explosions:** Steel, Obsidian and Magma explode without fizzling. They pair with Keystone (+1 Mult if nothing scores 0) and make Glass Cannon's downside disappear, because it only triggers when a die fizzles.
- **Anti-synergy:** Keystone with Fire, Lightning, Steam, Storm, Aether (any 1 breaks it). Glass Cannon with fizzling dice.

### Locks and rerolls (Water family: Water, Ice, Mud, Storm, Monsoon, Aether)
- **Payoffs:** Riverstone (+2 rerolls per lock instead of +1), Undertow (a lock also rerolls a random free die), Tide Chart (+3 Base per locked or frozen die), Glacier Heart (locked and frozen dice score double), Patient Hourglass (+0.5 Mult per unused reroll: locks refund rerolls, so Water builds cast with rerolls left over).
- **Mud and Monsoon** lock the next die too, and that neighbor counts as locked for Glacier Heart and Tide Chart **whatever its element**. Put your biggest die right after a Mud.
- **Petrify** freezes any die once per round; frozen counts as locked for every lock relic, and it still works in Drought.
- **Sapling** grows +2 for every reroll it sits out held or locked, so free locks plus lots of rerolls (Riverstone, Extra Reroll, Blessing of Wind, Hollow Pact) grow it fast.
- **Tidal Pool** doubles the set bonus when every die in the set is Water-family: combine with Ice or Monsoon (both enable sets).

### Sets (Air family: Air, Lightning, Ice, Crystal, Storm, Magma, Monsoon, Aether)
- One set-enabling die turns sets on for the whole pool.
- **Drift** nudges one Air-family die by 1 each round: turn a near miss into a pair, or a 3-4-5-7 into a straight. Gust (one free single-die reroll per round) fishes for the last face.
- **Payoffs:** Feather Charm (+1 on pairs), Stormcaller (+1 on straights), Crystal and Magma (score double when in the set), Tidal Pool (x2 if the set is all Water-family).
- **Enablers:** Fossil (pure Earth dice are wildcards for pairs and threes), Steam and Obsidian (rerolling can copy their face onto another die, which manufactures pairs), Mirror Shard (clone a die), locks to hold a matching face, Chisel (d3s match each other far more often).
- **Straights** need four different consecutive faces, so they want 4+ dice of d6 or bigger. d3s cannot make a straight.

### Earth (relics: pure Earth only right now; Patience and Steady are family-wide)
- **Patience:** every Earth-family die (Steel, Mud, Crystal, Obsidian, Magma, Monsoon, Aether too) gets +2 per reroll it sits out, so holding good Earth dice while you fish with the rest pays twice. Mud and Monsoon lock for free and still grow.
- **Steady:** Earth-family faces never land below 3, which also keeps Keystone safe.
- **Payoffs:** Bedrock (x1.5 each), Groundswell (+50% Base if the whole pool is pure Earth), Fossil (wildcards for sets), Keystone (Earth never scores 0).
- **Mono-Earth trick:** identical neighbors trigger **Resonance** (+2 Base per pair of neighbors), so a full Earth line gets Resonance on every link; Alchemist's Table adds +2 more per link. Stonecaller loadout plus Transmute: Earth feeds this.
- **Anti-synergy:** Groundswell with Prism Lens, element reactions, and any fusion or arcane die.

### Placement and reactions
- **Reaction payoffs:** Alchemist's Table (+2 Base per reaction), Catalyst Stone (+0.5 on every Mult reaction), Ley Line (first and last dice become neighbors, one extra link).
- **Triple fusions are reaction engines:** Storm (Fire, Water, Air) beside a pure Earth die fires Forge, Bloom and Dust Devil on one link.
- **Prism** reacts as all four elements: every basic reaction with its neighbor. Prism between two fusions is the strongest link in the game.
- **Conduit** makes its two neighbors react as if they touched (it adds a link without breaking one), and that bridged link's reactions count double.
- **Masquerade and Chameleon** take on the abilities of the die to their left, so [Prism, Masquerade] gives you two Prisms, and [Water, Chameleon, big die] gives you a free-locking copy of the big die's score.
- **Beacon** (x1.5 both neighbors), **Heart of the Circle** (middle die x2), **Bookends** (+4 on the ends): place your big dice where these land.
- **Mirror** copies the die on its left after that die's own bonuses, then Beacon and Heart apply on top: [big die, Mirror, Beacon] makes the Mirror copy the big die and then get x1.5.
- **Watch out:** arcane dice other than Prism bring no element, so they break reaction chains unless a Conduit bridges them. Gilded (Midas) scores 0, so it never reacts.
- **Secret reactions** are specific fusion pairs (table in §5). Ascension (Aether beside any fusion, +10 Base, +3 Mult) is the biggest.

### Fusion
- Fusion Crucible (fusion dice x1.5), Fusion Catalyst (forging -2 Shards), Fusion Spark (open the Forge anywhere), Aether Dust (pure die becomes a random double containing its element), Forge and Bazaar shops, and the Avatar, Forgeborn and Stormchaser loadouts.
- Prism Lens (+0.5 Mult per distinct element) rewards many different dice, which fusion builds naturally get.

### Economy
- **Interest:** Shard Vault (cap 5 to 8), Windfall (1 per 2 Shards instead of 3). Together they reach the cap with only 16 Shards held.
- **Discounts stack:** Discount Merchant (-10%) multiplies with the Alchemist (-20% consumables) and the Bazaar (-25% everything). Deep Pockets makes shop rerolls cheaper.
- **Income:** Gilded die (its face paid as Shards; grow it for more), Bullion (your final Mult as Shards: pairs with big-Mult builds), Lucky Coin, Hoarder (+1 on sells), Steadfast (+3 on a miss), Shard Pouch, Nix's Loan, Blessing of Stone at full health.
- **Brewing:** cheap Commons (Transmutes, Chisel, Whetstone, Shard Pouch) brew into Uncommons, which brew into Rares. The Alchemist discount makes the inputs cheap.

### Survival and risk
- Safety Net, Phoenix Feather, Steadfast and Blessing of Stone let you pay Nix: Blood Price (a life for a legendary relic) is much safer with Safety Net owned.
- Momentum (+1 permanent reroll for a 2x overkill) snowballs with any big-Mult build.

### Rerolls
- **Sources:** Extra Reroll, Lucky Charm, Blessing of Tide, Blessing of Wind, Hollow Pact, Overclock, Momentum, Water locks, Kindling (Fire fizzles), Gust (one free single-die reroll).
- **Spenders and payoffs:** Sapling (grows while it sits out), Patient Hourglass (rewards not spending them), Steam and Obsidian (each reroll is a chance to copy a face).
- **Overclock** gives +1 reroll but can reset dice to their minimum: bad with fizzling Fire, harmless with Steel or Earth.

---

## 11. Counters: bosses vs builds

| Boss | Hurts | Beats it |
|---|---|---|
| Calm Winds | Explosion builds (chains stop after 1) | Sets, locks, placement |
| Grounded | Set builds (no set Mult) | Explosions, reactions |
| Iron Grip | Reroll-heavy builds (1 reroll total) | Locks still hold faces; Patient Hourglass still pays for the 1 unused |
| Drought | Water lock builds | Petrify (freezing still works), everything else |
| Tax Collector | Reroll-heavy builds when you're poor | Economy builds, casting early |
| Scatter | Straight builds (Stormcaller) | Pairs and threes still count |
| Ermal | Nothing | Everything |
| Null Zone | Mono-element pools (one owned element scores 0) | Diverse pools, Prism Lens builds |
| Gravity Well | Big dice (faces over 4 score half) | d3 and d6 pools, Chisel |
| The Pillar | One-carry builds (your best die scores 0) | Many medium dice; a Mirror of your carry survives |
| Frostbite | Fire (a die frozen on 1 fizzles) | Lock builds: the frozen die counts as locked for Tide Chart and Glacier Heart |
| Eclipse | Planning (faces hidden until you cast) | Consistent dice: Earth, Steel, locks set up before |
| Silence | Builds leaning on one relic | Wide relic builds |
| Primordial | Whatever its current twist is | It changes twist every reroll, so you can reroll until the twist suits you (then cast) |

Shrine's Prophecy tells you which boss is coming, so you can buy toward its counter.

---

## 12. Known issues found while compiling this

These are places where the code and the text disagree. Tell me which way to go.

1. **Wildfire does nothing.** Its effect (20% chance an explosion spreads to another Fire-family die) is never read by the scoring engine. Needs implementing, or a new effect.
2. **Aether says "Capped at one per run" but nothing enforces it.** You can own several (buy one, forge one, or Mirror Shard it).
3. ~~Aether only appears in the shop after you have owned all four triple fusions.~~ **Resolved in v0.4 (B6):** Aether is locked behind the recipe (beat Primordial once on the file) for both the Forge and the shop. The shop still also needs all four triples owned this run.
4. **Earth relics only count pure Earth,** while Water relics count the whole Water family. Bedrock, Groundswell and Fossil ignore Steel, Mud, Crystal and the Earth triples. Make them family-wide?
5. **Two taglines promise more than the code does:** Lightning's "chained explosions re-check the set bonus mid-roll" and Ice's "locked faces count toward sets" describe nothing extra (every die already counts toward sets). Either give them those abilities or reword them.
6. **Wider circle ignores Inferno's 4-die cap** (it adds a fifth slot). Fine as a reward, or should the Inferno and Cataclysm cap be hard?
7. **Glass Cannon doubles only the extra explosion rolls,** not the first face. The text "Explosions add double value" matches, just flagging it.
