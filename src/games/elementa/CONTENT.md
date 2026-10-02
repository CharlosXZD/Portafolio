# Elementa content reference

Everything in the game as of 2026-09-29, pulled straight from the data files so it matches the code.

> This file describes only what is in the game right now. Planned changes live in `EXPANSION.md`; ideas without a home yet live in `IDEAS.md`.

Contents: 1. Core rules · 2. Dice · 3. Relics · 4. Consumables · 5. Reactions · 6. Characters (Pip, keepers, bosses) · 7. Shops and the Road · 8. Loadouts, difficulties, achievements · 9. Lore · 10. Synergy map · 11. Counters: bosses vs builds · 12. Known issues found while compiling this

---

## 1. Core rules (what every synergy plugs into)

- **Score = Base x Mult.** Base is the sum of every die's contribution plus flat bonuses and reactions. Mult starts at 1.
- **Die contribution** is its face (plus explosion chain), then per-die modifiers in this order: fizzle/ban zeroes it, Gravity Well halves faces over 4, Bedrock x1.5 (pure Earth), Double-on-set x2, Sapling growth, Whetstone bonus, Fusion Crucible x1.5, Glacier Heart x2 (locked), Tide Chart +3 (locked), Loaded Die +3 (max face). Then placement: Mirror copies, Beacon x1.5 neighbors, Bookends +4, Heart of the Circle x2 middle, The Pillar zeroes the best die.
- **Explosions:** max face rolls again and adds, chaining up to 10 times. Each explosion is also **+0.5 Mult**.
- **Sets:** only count if at least one die in the pool "enables sets" (Air family). Grouped by face: pair **+1 Mult**, three of a kind **+2**, straight of 4 consecutive faces **+3**.
- **Reactions:** two side-by-side dice react if between them they cover a reaction's two elements, and both actually scored (a fizzled die doesn't react). Fusions bring every parent element, so one link can fire several reactions.
- **Families:** a family is the pure element plus every fusion containing it. Water-family relics look for the free-lock ability; Earth relics currently only count **pure** Earth (see §12).
- **Rerolls:** 3 per round (Inferno and Cataclysm: 2). Locks on Water-family dice are free and refund +1.
- **Economy:** clearing pays 5 Shards, +1 per 25% over target (max +15), plus interest (1 per 3 Shards held, max 5).
- **Lives:** 3. A miss costs one and you retry the round. +1 life back every 4th round cleared.
- **Caps:** 10 dice, 5 relics, 3 consumables (boss rewards and deals change these).
- **Die sizes:** d3, d6, d10, d20. Bigger means higher faces but rarer explosions. Growing costs 6 / 12 / 20 Shards (into d6 / d10 / d20). Selling pays 2 / 3 / 6 / 10 (fusions x1.5).
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
| **Aether** | Legendary | Fire + Water + Air + Earth | 32 | Every mechanic, on one die. Capped at one per run. • Rolling the max face rerolls and adds again, chaining. • Rolling a 1 scores 0 this round. • Can lock its face for free (no reroll spent). • Locking it grants +1 reroll. • Locking it also locks the next die for free. • Rerolling it can copy its result onto another die. • Enables the matching-set bonus for the whole pool. • Counts double when part of a matching set. |

### Arcane dice (no element; they care about their neighbors)
| Die | Rarity | Made from | Shop price | Abilities |
|---|---|---|---|---|
| **Gilded** | Rare | - | 14 | Scores nothing. Pays its face in Shards when you clear the round. • Scores 0, but its face is paid out in Shards on a clear. |
| **Sapling** | Rare | - | 14 | Grows +2 every reroll it stays held. Rerolling it resets the growth. • Gains +2 for every reroll it sits out. |
| **Mirror** | Epic | - | 20 | Copies the score of the die to its left. • Copies the score of the die on its left. |
| **Conduit** | Epic | - | 20 | Its two neighbors react with each other as if they touched. • Bridges reactions between its two neighbors. |
| **Chrono** | Epic | - | 20 | A rolled 1 rewinds and rolls again for free. • A 1 rerolls itself once, for free. |
| **Beacon** | Epic | - | 20 | The dice on either side of it score x1.5. • Both neighbors score x1.5. |
| **Prism** | Legendary | - | 30 | Counts as all four elements for reactions with its neighbors. • Reacts as Fire, Water, Earth, and Air at once. |

**Forging** (at the Forge, the Bazaar, or with a Fusion Spark) consumes one die of each parent: 6 Shards for a double, 10 for a triple, 16 for Aether.

---

## 3. Relics (38 total)

### Fire family
| Relic | Rarity | Price | Effect |
|---|---|---|---|
| **Molten Core** | Common | 5 | Every explosion adds +2 flat Base Value. |
| **Ember Heart** | Uncommon | 8 | Each die that explodes adds +1 Multiplier. |
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
| **Keystone** | Uncommon | 8 | +1 Multiplier if no die scores 0 this roll. |
| **Fossil** | Rare | 12 | Earth dice are wildcards for the set bonus: they match any face value. |

### Air family
| Relic | Rarity | Price | Effect |
|---|---|---|---|
| **Feather Charm** | Common | 5 | Pairs grant +1 extra Multiplier. |
| **Stormcaller** | Uncommon | 8 | Straight bonus grants +1 additional Multiplier. |
| **Static Charge** | Legendary | 28 | Explosion chains no longer have an iteration cap. |

### Neutral (no element)
| Relic | Rarity | Price | Effect |
|---|---|---|---|

---

## 4. Consumables (16 total)

| Consumable | Rarity | Price | Target | Effect |
|---|---|---|---|---|
| **Upgrade Stone** | Uncommon | 8 | A die | Apply to a die to bump its tier one step (d6 to d10, and so on). |
| **Extra Reroll** | Uncommon | 8 | You | Grants +1 permanent reroll for the rest of the run. |
| **Transmute: Earth** | Common | 5 | A die | Apply to a die to change its element to Earth, keeping its tier. |
| **Transmute: Water** | Common | 5 | A die | Apply to a die to change its element to Water, keeping its tier. |
| **Transmute: Air** | Common | 5 | A die | Apply to a die to change its element to Air, keeping its tier. |
| **Transmute: Fire** | Common | 5 | A die | Apply to a die to change its element to Fire, keeping its tier. |
| **Whetstone** | Common | 5 | A die | Apply to a die: it permanently scores +2 whenever it scores. |
| **Chisel** | Common | 5 | A die | Apply to a die to shrink it one tier (d6 to d3). Small dice hit their max face, and explode, more often. |
| **Phoenix Feather** | Uncommon | 8 | You | Restore 1 life. |
| **Aether Dust** | Rare | 12 | A die | Apply to a pure die to turn it into a random double fusion that contains its element. |
| **Arcane Seal** | Epic | 18 | A die | Apply to a die to turn it into a random rare or epic Arcane die, keeping its tier. |
| **Shard Pouch** | Common | 5 | You | Gain Shards equal to twice the current round (at least 4). |
| **Lucky Charm** | Uncommon | 8 | You | +3 rerolls: this round if used during a round, otherwise next round. |
| **Fusion Spark** | Rare | 12 | You | Opens the Fusion Forge in this shop, even without beating a boss. |
| **Mirror Shard** | Rare | 12 | A die | Apply to a die to add an exact copy of it to your pool (needs a free dice slot). |
| **Loom of Fate** | Uncommon | 8 | You | Restock the shop with new offers, for free. |

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

Ermal the Unbothered is named after beta tester Ermal and has a sleepy portrait.

---

## 7. Shops and the Road

| Shop | Keeper | What it does | Music |
|---|---|---|---|
| **Market** | Tobb | Dice, relics and consumables. The classic shop. | `shop_market` |
| **Alchemist** | Vessa | Consumables only, 20% off. Brew two into a stronger one. | `shop_alchemist` |
| **Relic Vault** | The Curator | Three rarer relics. Shows up after bosses. | `shop_vault` |
| **Forge** | Brasa | The Fusion Forge and die size upgrades. | `shop_forge` |
| **Black Market** | Nix | Rare. One risky deal, paid in more than Shards. | `shop_blackmarket` |
| **Shrine** | Aeris | Rare. A free blessing, or a prophecy of the next boss. | `shop_shrine` |
| **Aether Bazaar** | The Wanderers | Legendary. Every shop in one, 25% off, with rarer stock. | `shop_bazaar` |

**How the Road is built:** round 1 is always a Market. The shop right after a boss (rounds 5, 10, 15) is a choice of Relic Vault, Forge, and sometimes Market. The last stop before Primordial always includes the Aether Bazaar. Every other stop is drawn by weight, never two of the same type in one row:

- Market: weight 46, from round 1
- Alchemist: weight 16, from round 2
- Forge: weight 12, from round 2
- Relic Vault: weight 7, from round 3
- Shrine: weight 6, from round 2
- Black Market: weight 6, from round 3
- Aether Bazaar: weight 2, from round 8

**Black Market deals** (2 offered, take one; the Bazaar offers 1):
- **Blood Price**: Take a legendary relic. Costs 1 life.
- **Nix's Loan**: Get {shards} Shards now. The next target is 50% higher.
- **Soul Die**: Take a random triple fusion die. Costs 1 max life.
- **Hollow Pact**: +2 rerolls every round. Lose 1 relic slot for the run.

**Shrine blessings** (3 of these 5 offered, take one, or take the Prophecy instead):
- **Blessing of Stone** (Earth): Restore 1 life. If you are full, +8 Shards.
- **Blessing of Flame** (Fire): A random die grows one size.
- **Blessing of Tide** (Water): +3 rerolls next round.
- **Blessing of Wind** (Air): +1 reroll every round for the rest of the run.
- **Blessing of Aether** (Aether): A free rare consumable (needs a free slot).
- **Prophecy**: Instead of a blessing, learn which boss waits at round {round}.

**Boss reward:** after every boss, grow one die of your choice a size, and add +1 slot to dice, relics or consumables.

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
- **Payoffs:** Molten Core (+2 Base per explosion), Ember Heart (+1 Mult per exploding die), Glass Cannon (explosion rolls count double), Static Charge (no chain cap), Loaded Die (+3 on the max face, which is exactly the explosion face), Lucky Coin (+1 Shard per explosion). Every explosion is also +0.5 Mult on its own.
- **Enablers:** Chisel (shrink to d3: explodes 1 in 3 rolls instead of 1 in 6). Blessing of Flame and Upgrade Stone pull the other way (bigger faces, fewer explosions), so Fire builds want small dice.
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
- **Payoffs:** Feather Charm (+1 on pairs), Stormcaller (+1 on straights), Crystal and Magma (score double when in the set), Tidal Pool (x2 if the set is all Water-family).
- **Enablers:** Fossil (pure Earth dice are wildcards for pairs and threes), Steam and Obsidian (rerolling can copy their face onto another die, which manufactures pairs), Mirror Shard (clone a die), locks to hold a matching face, Chisel (d3s match each other far more often).
- **Straights** need four different consecutive faces, so they want 4+ dice of d6 or bigger. d3s cannot make a straight.

### Earth (pure Earth only right now)
- **Payoffs:** Bedrock (x1.5 each), Groundswell (+50% Base if the whole pool is pure Earth), Fossil (wildcards for sets), Keystone (Earth never scores 0).
- **Mono-Earth trick:** identical neighbors trigger **Resonance** (+2 Base per pair of neighbors), so a full Earth line gets Resonance on every link; Alchemist's Table adds +2 more per link. Stonecaller loadout plus Transmute: Earth feeds this.
- **Anti-synergy:** Groundswell with Prism Lens, element reactions, and any fusion or arcane die.

### Placement and reactions
- **Reaction payoffs:** Alchemist's Table (+2 Base per reaction), Catalyst Stone (+0.5 on every Mult reaction), Ley Line (first and last dice become neighbors, one extra link).
- **Triple fusions are reaction engines:** Storm (Fire, Water, Air) beside a pure Earth die fires Forge, Bloom and Dust Devil on one link.
- **Prism** reacts as all four elements: every basic reaction with its neighbor. Prism between two fusions is the strongest link in the game.
- **Conduit** makes its two neighbors react as if they touched (it adds a link without breaking one).
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
- **Income:** Gilded die (its face paid as Shards; grow it for more), Lucky Coin, Hoarder (+1 on sells), Steadfast (+3 on a miss), Shard Pouch, Nix's Loan, Blessing of Stone at full health.
- **Brewing:** cheap Commons (Transmutes, Chisel, Whetstone, Shard Pouch) brew into Uncommons, which brew into Rares. The Alchemist discount makes the inputs cheap.

### Survival and risk
- Safety Net, Phoenix Feather, Steadfast and Blessing of Stone let you pay Nix: Blood Price (a life for a legendary relic) is much safer with Safety Net owned.
- Momentum (+1 permanent reroll for a 2x overkill) snowballs with any big-Mult build.

### Rerolls
- **Sources:** Extra Reroll, Lucky Charm, Blessing of Tide, Blessing of Wind, Hollow Pact, Overclock, Momentum, Water locks.
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
3. **Aether only appears in the shop after you have owned all four triple fusions.** The Forge can make it from one of each pure die, so the shop rule is much stricter than the Forge. Intended?
4. **Earth relics only count pure Earth,** while Water relics count the whole Water family. Bedrock, Groundswell and Fossil ignore Steel, Mud, Crystal and the Earth triples. Make them family-wide?
5. **Two taglines promise more than the code does:** Lightning's "chained explosions re-check the set bonus mid-roll" and Ice's "locked faces count toward sets" describe nothing extra (every die already counts toward sets). Either give them those abilities or reword them.
6. **Wider circle ignores Inferno's 4-die cap** (it adds a fifth slot). Fine as a reward, or should the Inferno and Cataclysm cap be hard?
7. **Glass Cannon doubles only the extra explosion rolls,** not the first face. The text "Explosions add double value" matches, just flagging it.
