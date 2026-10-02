# Elementa expansion plan

A living design document between Carlos (the designer) and Claude. It collects every idea that "stuck" so an agent with no prior context can execute it.

**Guiding principle (Carlos):** the current game is complete, fun, and has a self-contained story. The expansion builds on it; it never replaces it. Lay everything out first, then add it piece by piece in phases (Part C).

## For the agent executing this document

**Only build items marked `Status: Ready`**, and only within the roadmap phase Carlos tells you to execute (Part C). Items marked `Agreed` have a settled concept but unfinished details. Items marked `Proposed` or `Open` are still being designed. Build neither; if a Ready item depends on one of them, stop at the boundary and say so.

**Never build from `IDEAS.md`** (Carlos's inbox of loose ideas). Never treat `CONTENT.md` as a plan: it describes only the current game.

**Read first, in this order:**
1. `src/games/elementa/GDD.md`: design history. §26 to §29 describe the most recent systems (save files, boss rewards, the Road map, shop types, keepers, boons, run summary).
2. `src/games/elementa/CONTENT.md`: every die, relic, consumable, boss, keeper line, and synergy, generated from the data files.
3. Key code:
   - `engine/gameReducer.js` (all game state and actions)
   - `engine/scoring.js` (Base x Mult evaluation)
   - `engine/map.js` (the Road)
   - `data/*.js` (content)
   - `utils/profile.js` and `utils/saveManager.js` (per-save-file progress)
   - `utils/keepers.js` (keeper memory)
   - `ElementaGame.jsx` (phase routing, end-of-run bookkeeping)

**Project conventions (non-negotiable):**
- **No em dashes anywhere:** code comments, UI copy, docs, replies. Use commas, colons, or separate sentences.
- **Every UI string is bilingual (en/es):**
  - UI chrome goes in `src/i18n/strings.js` under `elementa.*` keys.
  - Content goes in `data/i18n.js`, or `{ en, es }` objects as in `data/keepers.js` and `data/shops.js`.
- **No AI-generated art.** Carlos draws the real art. Use the existing procedural or CSS pixel placeholders (`KeeperSprite`, `BossAvatar`, `PixelSprite`, `DieSprite`).
- **All randomness goes through the seeded RNG** (`engine/rng.js` `random()`), never `Math.random()`, in anything that affects gameplay.
- **Match the surrounding code:** comment density, naming, and structure.
- **Verify:**
  - Reducer logic: with a Node script that imports `engine/gameReducer.js` directly (the repo is ESM, so `node script.mjs` works).
  - UI: in the browser via the `portfolio-dev` launch config (`/games/elementa`).
  - You can build test saves by writing `elementa-files-v2` in localStorage from reducer-generated states.
- **When done:**
  - Add a numbered section to `GDD.md` describing what was built.
  - Update `CONTENT.md` if content changed.
  - Add an entry to the patch notes (Part D).
  - Mark the item `Status: Built`.

---

# Part A: World and story

## A1. Names

**Status: Decided** (Carlos, 2026-09-30) unless marked Open

- **Elementa:** the realm of the base game (the world shares the game's name).
- **The Firmament:** the mythical realm beyond the last Circle, the frame of reality: Light, Darkness, Time, Space, Chaos, Void.
- **Zephyr:** the Air god (Carlos). The four gods are Gaea, Ognen, Varuna and Zephyr.
- **The third realms** (one per path, see A3):
  - **The Empyrean:** Split path. Decided (Carlos).
  - **The Pleroma:** Primordial path. Decided (Carlos).
  - **The Meridian:** Neutral path, the line between, where things balance. Decided (Carlos, 2026-10-01).
- **A fourth place where the three paths meet:** Open, still iterating (Carlos isn't sure it should be the final place). Candidate names: the Source, the Origin, the Unwritten.
- **Open:** the legendary shop, still called "Aether Bazaar" as a placeholder.

## A2. Core lore (current draft, see CONTENT.md §9 for the base-game version)

**Status: Agreed** (the shape; wording is Carlos's to rewrite)

- The Primordial was one thing that was everything, dreaming. The first Casters split it into Fire, Water, Earth and Air (the Split) and bound the pieces into dice. Every boss is a Fragment trying to make it whole again.
- **New:** defeating the Primordial reveals it is part of something bigger. Beyond the last Circle lies the mythical realm (A1), where Light, Darkness, Time, Space and Chaos live: the frame the Primordial dreamed inside of.
- **New:** the four god dice (Gaea, Ognen, Varuna, the Air god) are the beings who made the Split. They were bound into dice themselves.
- **New: the factions.**
  - **Nix** has listened to the Primordial and serves it (the Primordial path).
  - **Aeris** speaks for keeping the world split (the Split path).
  - Both are keepers the player already meets on the Road.

## A3. The realm ladder: each realm more abstract than the last

**Status: Agreed concept** (Carlos: "distorting reality itself"); details Proposed

1. **Elementa:** matter and magic. The four elements, fusions, the Primordial. (The base game.)
2. **The Firmament:** the frame of reality. Light, Darkness, Time, Space, Chaos, Void. The hub where new item kinds unlock (B9).
3. **The Empyrean / the Pleroma / the Meridian:** one per path, the rules of reality itself, more abstract.
4. **A fourth place (Open, still iterating):** possibly where the three paths meet. Whether it is the true ending's location is undecided.

**Proposed for realm 3:**
- **Theme:** reality's "source code" exposed. Math, logic and binary. Carlos's number dice (B12: Two's Complement, Reversed Bits, Undivisible) live here.
- **Distortion as presentation:** screen glitches and faces shown in binary, CSS or canvas only, no AI art.
- **Bosses rewrite the scoring formula itself:**
  - **The Axiom:** score is Base + Mult instead of Base x Mult.
  - **Zero:** every face below 3 counts as 0.
  - **Infinity:** no cap on anything, including the target.
  - **The Observer:** a die's face only settles when you hover it.
- **Path split:**
  - **The Empyrean (Split path):** pure order, rigid rules.
  - **The Pleroma (Primordial path):** everything merging, rules dissolving.
  - **The Meridian (Neutral path):** rules that swing back and forth, balancing each other.

## A4. Cast of characters

**Status: Agreed need** (Carlos wants new shopkeepers and characters, some returning by route); characters Proposed

**New Firmament keepers:**
- **Seren:** an astronomer who sells Constellations (B9).
- **Atlas:** a cartographer. Reveals more of the Road, lets you skip a stop, or rerolls the next layer.
- **The Horologist:** sells Time items (rewinds, banked rerolls).
- **Mote:** a speck of Void running an anti-shop that only buys. **Agreed (Carlos), it needs a twist.** Proposed:
  - Mote is hungry. Every good item you sell it fills its appetite, which persists across runs on the save file.
  - Feed it well and it pays in effects instead of only Shards.
  - After your first generous visit, it opens a secret stock: hollow pacts, Void-touched dice, things found nowhere else.
  - Open lore hook: what happens when Mote is full? A candidate tie-in to the true ending.

**Tobb returns in every realm (Decided, Carlos).** He is the constant friendly face of the shops.

**Returning by route** (the path decides who follows you into the Firmament):
- **Split path:** Aeris, in her true form, as guide and shop.
- **Primordial path:** Nix, revealed, running an "eclipse market".
- **Neutral path:** Tobb, somehow already there ("I go everywhere").

**Story characters:**
- **Pip** is the emotional thread to the true ending: its origin as a spark of Aether pays off there.
- **The First Caster**, who caused the Split, is a candidate final villain.
- **The gods (B4)** can become characters after the reveal: on the Split path, a god you honor could run a shop.

---

# Part B: Systems

## B1. The three paths

**Status: Agreed concept** (Carlos); details Proposed

**Agreed (Carlos):** a run's choices sort the player into one of three paths. The path changes the final battle and what it unlocks.
- **Neutral:** the player sided neither with the Primordial nor against it.
- **Primordial path:** the player wants the Primordial complete again, back to what it was before the Split.
- **Split path:** the player wants to defeat the Primordial and keep it split.

**Proposed: how a run is sorted (a hidden "Accord" meter, like TBOI's hidden devil/angel chance):**

| Pushes toward the Primordial | Pushes toward the Split |
|---|---|
| Forging fusions | Holding pure dice |
| Holding fusion dice, Aether, Prism | Mono-element pools |
| Nix pacts, especially betrayal pacts (B3) | God dice |
| | Aeris blessings |

- Near zero, or no strong lean, means Neutral.
- The meter is never shown as a number. It's hinted through Aeris, Nix and Pip's dialog, the Primordial's lines during the final fight, and the arena's tint.
- **Open:** the exact weights and thresholds, to be tuned with playtests. **Open:** whether the path is locked when entering round 15, or decided by a final choice inside the fight.

**Proposed: the final battle per path:**
- **Neutral:** today's Primordial fight (shifting twist). Ending: "The Circle Holds".
- **Split:** the Primordial at full strength, fighting to take your dice back. A new boss variant, for example it fuses two of your pure dice each reroll. Ending: the Split holds forever.
- **Primordial:** the Primordial doesn't fight you. You fight the four gods who made the Split, one god twist per reroll or one per die. Ending: the Primordial made whole.

**Proposed: where Mythic dice come from:** the Split path (order) leads to Light, Time and Space; the Primordial path leads to Chaos and Darkness.

## B2. Endings and unlock structure (TBOI style)

**Status: Agreed concept** (Carlos: "it depends on what ending you have and what you have accomplished", like TBOI's Mom unlocking more); details Proposed

**Proposed progression:**
1. **First win (any path):** ends the run. Unlocks the Aether recipe (B6). The Primordial starts speaking in later fights, so the player learns there's more.
2. **First win on the Split or Primordial path:** ends the run with that path's ending card. Opens that path's door for future runs.
3. **Later runs on a path whose door is open:** after the final battle, a Crossroads screen offers the door or "Rest here" (end the run). Through the door, the same run continues into the mythical realm (B5).
4. **The first playthrough always ends Neutral.** The Split and Primordial paths, and the gods (B4), unlock after the first win (Agreed: gods hidden on the first playthrough).
5. **True ending (Agreed, Carlos):** the only true victory. It requires:
   - Cataclysm difficulty.
   - The hardest path.
   - Beating everything: every Mythic die unlocked and every path ending seen.
   - Going through the Firmament and realm 3 to the end.

   Proposed: earlier endings are partial or bittersweet, and their ending cards hint that something is still missing, so the true ending feels earned.

**Also proposed:**
- An **Endings** tab in the Gallery, with an ending card (pixel placeholder plus short text) per ending.
- **Completion marks:** each loadout records which endings it has beaten, shown on its card, like TBOI's per-character marks.

## B3. Nix and Aeris: pact symmetry

**Status: Agreed** (Carlos); numbers Proposed

**Agreed (Carlos):**
- Siding with Nix makes Aeris's blessings cost something, and makes Aeris appear less. With enough Nix pacts you are fully locked out of Aeris.
- Aeris senses it in dialog ("something is strange with you").
- **Nix never locks you out:** he wants more of you, to stop you, because he has listened to the Primordial (he is on the Primordial path).
- If you hold Aeris blessings, Nix offers different pacts: **betrayal pacts** that break your Aeris blessings to turn you to his side.

**Proposed numbers:**

| Nix pacts this run | Effect on Aeris |
|---|---|
| 0 | Normal |
| 1 | Blessings cost Shards; Shrines appear half as often; Aeris: "Something is strange about you." |
| 2 | Blessings cost a relic or consumable; Aeris: "You carry a shadow. I can still help, for a price." |
| 3+ | No Shrines on the Road (converted deterministically to Black Markets); Aeris no longer appears |

- **Betrayal pacts** (offered when you hold at least one Aeris blessing):
  - Give up a blessing's effect for a large reward with no life cost.
  - Example: **Broken Vow**: lose Blessing of Wind for a legendary relic.
  - They count double toward the Primordial path.
- **Taking blessings** pushes toward the Split path. Walking away from a Black Market without a deal raises the Shrine weight, like TBOI's angel chance.
- **Across runs (Proposed):**
  - Lifetime pacts unlock Nix's inner stock (cursed legendaries).
  - Lifetime blessings unlock a no-downside blessing.
  - Builds on `profile.keepers`.

## B4. God dice

**Status: Proposed** (Carlos's table; abilities are Claude's)

**Carlos's table:** Gaea (Earth), Ognen (Fire), Varuna (Water), Zephyr (Air). Made from 4 of the same pure die. Only one can be held, and it makes other pure dice weaker.

**Agreed (Carlos):** the gods are hidden on the first playthrough.

**Proposed reveal:**
- After the first win, the Primordial's dying words mention "the four who broke me."
- From then on, holding 4 pure dice of one element makes that god's recipe whisper in the Forge ("Gaea stirs").

**Proposed details:**
- **Rarity:** a new **Divine** rarity between Legendary and Mythic.
- **How to get them:** forge-only (consume 4 pure dice of one element), not sold.
- **Recipe unlock:** win with a mono-element pool to learn that element's god recipe.
- **Story role:** the enemies in the Primordial path's final battle (B1).
- **Drawback:** the other elements' pure dice are weaker; the god's own element is spared, so mono builds stay strong. Carlos to confirm versus "every other pure die".

| God | Ability | Drawback on the other elements' pure dice |
|---|---|---|
| **Gaea** | Also scores every other Earth-family die's face; Earth dice are set wildcards | They score -1 |
| **Ognen** | Explodes on any face in its top half, chains uncapped, +1 Mult per explosion | They fizzle on 1 and 2 |
| **Varuna** | Any die can lock for free; after each reroll the lowest free die rises to Varuna's face | Locks no longer refund a reroll |
| **Zephyr** | Sets go up one tier (pair counts as three, three as straight); Air's face is a wildcard | Pure Air dice no longer turn sets on |

## B5. Mythic dice and the mythical realm

**Status: Proposed**

**Mythic dice** (Carlos's list: Light, Darkness, Time, Space, Chaos, Void; Mythic rarity; price 45; no element):
- One per run.
- Unlocked by endings (B1, B2).
- Once unlocked, sold in the mythical realm's shops (Open: also very rarely in the Aether Bazaar?).

| Die | Ability |
|---|---|
| **Light** | No die scores below Light's face (1s become Light's face, fizzles cancelled); faces visible under Eclipse |
| **Darkness** | The die on its left scores 0; Darkness adds that die's score to Mult (divided by 4) |
| **Time** | Once per round, Rewind: undo your last reroll and refund it; unused rerolls carry over (up to +3) |
| **Space** | The dice on both sides of Space, and the two end dice, all count as neighbors of each other |
| **Chaos** | Every roll it becomes a random die from the whole game in a random size; locking keeps its form |
| **Void** | Scores nothing; every empty slot you have (dice, relic, consumable) gives +1 Mult (Claude's proposal, Carlos added Void without an ability) |

**Void's ability (Decided, Carlos):** scores nothing; every empty slot (dice, relic, consumable) gives +1 Mult.

**Carlos's additions (moved here from CONTENT.md, not built):**
- **Entropy (Decided):** a Mythic fusion of all six Mythic dice (Light, Darkness, Time, Space, Chaos, Void) plus Aether.
  - Price 300. Scores face + 104 and +10 Mult. Only one.
  - Works like Aether: its recipe is unknown until you beat the Firmament.
  - Carlos: "even if it doesn't make sense it would be fun to combine all of them." 
- **Growth to d100:** Aether and Mythic dice can grow past d20, through d30, d40 and so on up to d100.
  - Proposed: only at a Firmament forge.
  - Needs new `DieSprite` shapes, or one shared "big die" shape with the size printed on it.

**The mythical realm:**
- A continuation of 5 rounds (16 to 20) through a path's door.
- Its own Road weights (more Shrines, Black Markets and Bazaars).
- Possibly a new keeper, or Pip's origin.
- **Wardens:** each guards a Mythic die, with a twist opposite to it:
  - **The Dawn:** max faces score 0.
  - **The Umbra:** faces hidden, and each reroll swallows a die.
  - **The Clockwork:** a 30-second cast timer (Open: optional?).
  - **The Expanse:** the order shuffles each reroll.
  - **The Maelstrom:** elements scramble each reroll.
- **True ending boss:** target = your best cast of the run x 1.5.
- Each Warden gets a music theme, a `BossAvatar`, and a Gallery entry.

## B9. New kinds of items (the next level)

**Status: Agreed need** (Carlos: "something that truly advances the game to the next level", and the Firmament is where it unlocks); items Proposed

Ranked by how much new depth each adds:
1. **Editable die faces** (like Dicey Dungeons, or Slice & Dice): replace one face of a die with a special face. Examples:
   - a wild face (matches any set)
   - a x2 face (doubles Mult)
   - a shard face (pays Shards)
   - a rune face (triggers a reaction with both neighbors)

   It turns each die into a little build of its own. Biggest change, biggest payoff.
2. **Constellations** (Firmament consumables, sold by Seren): permanently level up one reaction or set type for the run, like Balatro's planet cards. Example: Kindle level 3 gives +2 Mult instead of +1.
3. **Runes** (Carlos's note: "items that work for combinations, added on the forge shop"): permanent enchantments socketed into a die.
   - Rune of Echo: scores twice.
   - Rune of Glass: x2, but may shatter.
   - Rune of Kinship: counts as its neighbor's element for reactions.
4. **Laws:** Mythic relics that rewrite a scoring rule.
   - Law of Inversion: your lowest die counts as your highest.
   - Law of Unity: all reactions also count as Resonance.

## B10. Carlos's dice and balance changes

**Status: Decided** (Carlos, 2026-09-30), **not shipped yet**. Carlos: "I don't want to ship the ideas yet, move them to the expansion." They moved here from CONTENT.md, which again describes only the current game. Build them when Carlos assigns them a roadmap phase (Part C).

**Balance changes to existing content (Decided):**

| Change | Notes |
|---|---|
| Aether price 32 to 64 | |
| Gilded Rare to Common | |
| Mirror Epic to Rare | |
| Beacon Epic to Rare | |
| Prism Legendary to Epic, price 30 to 25 | |
| Conduit also doubles (x2) the reaction it bridges | |
| Chrono rerolls a 1 repeatedly until it is no longer a 1 | Carlos likes this die: **move Chrono to the Firmament**, sold by the Horologist (A4), instead of the Elementa arcane pool |
| Upgrade Stone Uncommon to Epic | Price follows rarity, so 8 becomes 18. Intended: "upgrading dice should be a bit more rare" |

**New Elementa arcane dice (Decided):**

| Die | Rarity, price | Ability |
|---|---|---|
| **Bullion** | Epic, 25 | Scores nothing; pays your Mult in Shards on a clear. Pairs with Gilded |
| **Masquerade** | Legendary, 30 | Copies the abilities and score of the die to its left |
| **Chameleon** | Legendary, 30 | Copies the abilities of the die to its left and the score of the die to its right |

**Number dice (Decided; Proposed home: realm 3, A3):**

| Die | Ability |
|---|---|
| **Two's Complement** | If its face is even: double the score of both neighboring dice, and +2 Mult |
| **Reversed Bits** | Scores nothing. Every die in the pool has its face bit-reversed in 4 bits (1 becomes 8, 2 becomes 4, 3 becomes 12, 4 becomes 2, 5 becomes 10, 6 stays 6, 7 becomes 14, 8 becomes 1), and you see the whole pool flip. This turns fizzling 1s into 8s |
| **Rolling Joke** | +1 for every reroll, compounding across the run (shop rerolls count too) |
| **Undivisible** | If its face is prime: square it, minus one (on d20, 19 becomes 360) |

- **Reversed Bits bit width:** Carlos chose a whole byte (8 bits), which covers every size up to d100.
  - Claude's balance concern: a byte reversal throws small faces to the top of the 0 to 255 range (1 becomes 128, 2 becomes 64, 3 becomes 192, 4 becomes 32, 5 becomes 160, 6 becomes 96), so a d6 pool's average face goes from 3.5 to about 112.
  - **Decided (Carlos, 2026-10-01): option (b).**
    - **Normal die:** reverses each die's face within that die's own bit width. d3 and d6 use 3 bits (1 becomes 4, 3 becomes 6), d10 uses 4, d20 uses 5 (1 becomes 16), and so on up to d100, which uses 7 bits.
    - **Proposed:** the full-byte version (1 becomes 128) is an upgraded form, such as a relic or a Firmament "Overflow" version.

## B11. Dice without numbers

**Status: Agreed concept** (Carlos: "dice that don't have numbers, like poker dice, a joker die, or different sigils depending on the path, not just gamble games"); details Proposed

- **Poker dice** (faces 9, 10, J, Q, K, A): score poker hands across all poker dice in the pool (pair, two pair, three of a kind, full house, straight, four and five of a kind), each adding Mult.
- **Joker die:** wild, it counts as any face for poker hands and any value for sets.
- **Sigil dice, by path:** faces are symbols that trigger effects instead of points.
  - **Split side:** sun, scale, key. A scale balances your two lowest dice to their average.
  - **Primordial side:** eye, spiral, maw. An eye reveals the next boss; a maw eats a die's score and adds it to Mult.
  - **Neutral:** a mix of both sides.
- **Where they come from:** sigil dice could be a Warden's drop alongside its Mythic die, and poker and Joker dice fit a Firmament shop.
- **Engine note for the executing agent:** these need faces that aren't numbers. Each face could be a `{ symbol, value }` pair, so existing scoring still has a value to read.

## B6. Aether recipe lock

**Status: Built** (v0.4)

**Design:** Aether cannot be forged, and never appears as a shop offer, until the player has beaten Primordial at least once on that save file. On that first win, the Curator hands over the recipe. The Avatar loadout (starts with Aether) is unaffected, since it already requires winning with every other loadout.

**Implementation notes:**
- **Profile:** add `recipes: []` to `emptyProfile()` and `normalizeProfile()` in `utils/saveManager.js`.
  - **Migration:** a file with a non-empty `difficultiesBeaten` has beaten Primordial, so treat `'aether'` as known.
  - Add `knowsRecipe(profile, id)` and `learnRecipe(slot, id)` to `utils/profile.js`.
- **Run state:**
  - Pass the file's recipes in the `START_RUN` action (dispatched from `components/TitleScreen.jsx`), store them as `state.recipes` in `startNewRun`, and default to `[]` in `baseTitleState`.
  - `LOAD_RUN` of an older save: read the profile in `ElementaGame.jsx` before dispatching, or default to `['aether']` if the file has any beaten difficulty.
- **Forge:** in `forgeableRecipes()` (`engine/gameReducer.js`), only include the quadra recipe when `state.recipes` includes `'aether'`. Also guard `FUSE_DICE`.
- **Shop:** in `rollShopStock()`, filter `QUADRA_FUSION_ID` out of buyable dice unless the recipe is known.
- **Learning it:** in `ElementaGame.jsx`'s run-end effect (where victory calls `markDeckBeaten`), call `learnRecipe(slot, 'aether')`. If it was new, toast it: add a `recipe` kind to `components/Toasts.jsx` with "New recipe: Aether" / "Nueva receta: Éter".
- **Curator line:** a one-off Curator line on the first Vault visit after learning it.
  - EN: "You defeated it. Then you have earned this: the recipe the first Casters swore never to write down."
  - ES: "Lo derrotaste. Entonces te ganaste esto: la receta que los primeros Lanzadores juraron nunca escribir."
  - Needs a context flag in `utils/keepers.js`, such as `justLearnedRecipe`.
- **Copy:** in the Gallery, an unknown recipe reads "Recipe unknown: beat Primordial". Update `CONTENT.md` §2 and §12 (known issue 3 is resolved by this).

## B7. Credits: add The Binding of Isaac

**Status: Built** (v0.4)

In `components/CreditsScreen.jsx`, change the inspiration line from `Balatro, Ultrapool` to `Balatro, Ultrapool, The Binding of Isaac`.

## B8. Parking lot

Moved to `IDEAS.md`, Carlos's file for ideas that don't have a place yet.

---

# Part C: Roadmap

**Status: Proposed** (phase order and contents are Claude's suggestion; Carlos decides). Each phase should ship as a complete, playable update with its own patch notes.

| Version | Name | Contents |
|---|---|---|
| **v0.4** | The Road | Already built, not yet released or committed: the Road map, shop types, keepers, music themes, playtest pass (Part D). Add B6 (Aether recipe), B7 (credits), the E1 to E10 playtest polish, and E12 (in-game patch notes), all Ready. E11 moves to v0.5. The version tag becomes "v0.4 alpha" through E12. Then bump the in-game version tag (`ElementaGame.jsx`, currently "v0.3 alpha"). |
| **v0.5** | Allegiance | E11 (new-run screen). B3: pact symmetry, Aeris costs and lockout, betrayal pacts, new Nix/Aeris dialog. The hidden Accord meter from B1 starts recording, with dialog hints, but no new endings yet. |
| **v0.6** | Three Paths | B1 final-battle variants, B2 ending cards and Endings tab, completion marks. B4 god dice (enemies in the Primordial path fight, plus mono-element recipe unlocks). |
| **v0.7** | The Firmament | B5: path doors, the Firmament continuation, Wardens, Mythic dice, the d100 growth path. A4: Firmament keepers and returning characters. B9: the first new item kinds (Constellations and Runes). |
| **v0.8** | Rewriting reality | A3: realm 3 (Empyrean and Pleroma), formula-rewriting bosses, B10 number dice, editable die faces, Laws. |
| **v0.9** | Echoes | Ideas Carlos promotes from `IDEAS.md`; B10 if not shipped earlier (Carlos decides when). B11 dice without numbers could land in v0.7 (poker, Joker) and v0.8 (sigils). |
| **v1.0** | True ending | The true ending (Cataclysm, hardest path, everything), balance pass, Carlos's hand-drawn art swapped in. |

---

# Part D: Patch notes

Newest first. Versions before v0.4 are reconstructed from GDD.md; the dates are when the work was done in development.

### v0.4 "The Road" (in development, unreleased)
- **The Road:** a seeded, branching map of shops. You choose your next stop from inside each shop.
- **Seven shop types,** each with its own keeper: Market (Tobb), Alchemist (Vessa), Relic Vault (the Curator), Forge (Brasa), Black Market (Nix), Shrine (Aeris), and the legendary Aether Bazaar (all of them at once).
- **Keepers** remember you on each save file, change their dialog as you visit, and tell lore over time. A new Keepers tab in the Gallery collects it.
- **Boss rewards:** grow one die of your choice a size, plus +1 slot for dice, relics, or consumables.
- **Music:** every screen, shop, and boss has its own generated theme, crossfading between them.
- **Playtest fixes:**
  - Dice no longer jump vertically when reordered.
  - Reaction bars no longer overlap in big pools, and the magic circle grows with the pool.
- **Shop polish:**
  - Rerolling shows its price clearly, and restocks animate.
  - Inventory dice show their real shape and upgrades, and can be dragged to reorder.
- **Consumables** can be used during a round.
- **Boons and pacts panel:** active blessings, deals, and the Prophecy stay visible.
- **Run summary:** shows right after the final boss, with your dice, items, everyone you met, and every pact.
- **Reference:** CONTENT.md lists all game content and synergies.
- **The Aether recipe:** Aether can't be forged or bought until you beat Primordial on that save file. Your first win teaches you the recipe, and the Curator has something to say about it.
- **Family abilities:** Fire dice that fizzle refund a reroll (Kindling), Earth dice grow while they wait (Patience), and Air dice can nudge a face by 1 once per round (Drift).
- **Three new relics:** Heat (Fire), Gust (Air) and Steady (Earth).
- **Clearer dice:** Held, Locked and Frozen tags now sit above the die; buttons and hotkeys stay below, and nothing shifts when they change.
- **Family tags:** a die's families show as colored tags with the element's mark, the same in the shop, on the table and in the Gallery.
- **Element symbols:** dice in the shop, boss reward and load screen show their element's symbol in the middle instead of "d6" (the shape already tells the size).
- **Credits:** The Binding of Isaac joins Balatro and Ultrapool as an inspiration.

### v0.3 "Beta feedback" (2026-09-28)
- **Save files are whole games:** profile plus run, with a File hub.
- **Achievements:** 19 total.
- **Seeds and Endless mode.**
- **Boss reward choice;** the Forge opens only after bosses.
- **Harder targets.**
- **Consumables:** Buy and use, plus new consumables.
- **New content:** 8 secret reactions, the Ermal boss, boss portraits.
- **Gallery:** sorted by rarity, family, or name.
- **Run Info** screen.
- **Tutorial:** interactive.
- **Display:** Tiny5 font and display options.

### v0.2 "Juice and depth" (2026-09-27 to 2026-09-28)
- **Pixel UI kit** and procedural backgrounds; full-screen round layout.
- **Juice:** score popups, screen shake.
- **Content:**
  - Relic waves bring the total to 38.
  - Adjacency reactions with draggable dice, and arcane placement dice.
  - Tiered bosses and Primordial.
  - Shaped dice per size.
- **Cast ledger** with a step-by-step reveal.
- **Loadout and difficulty unlock ladders.**
- **Gallery** and completion percentage.
- **Pip's tutorial,** backup files, bilingual UI.

### v0.1 "MVP" (2026-09-27)
- **Core loop:** elemental dice; Earth, Fire, Water and Air with fusions up to Aether.
- **Economy:** relics, shop economy with interest.
- **Dice tiers:** d3 to d20.
- **Structure:** lives, boss rounds, four difficulty tiers.
- **Fusion Forge,** procedural sound.

---

# Part E: Playtest backlog

Carlos's notes from playing. Each gets a proposal and a target phase.

- **E1 to E6:** Decided for **v0.4** (Carlos, 2026-10-01). Their proposals below are the spec.
- **E7 onward:** Proposed for v0.4 unless noted (Carlos to confirm).

## E1. Boons panel: icons only

**Status: Ready** (v0.4, decided by Carlos)

- **Note (Carlos, 2026-10-01):** persistent blessings and pacts should only show their icon; clicking it should show all the information.
- **Proposal:**
  - `components/BoonsList.jsx` in compact mode shows a row of icons only: an Aeris or Nix sprite, plus a BossAvatar for the Prophecy.
  - Each icon has a small status dot: active, coming up.
  - Clicking an icon opens the same anchored popover relics use (`components/ItemInspector.jsx`), with name, text, status and the round it was taken.
  - Use icons in the round HUD and the shop sidebar. The run summary and Run Info keep the full list.

## E2. Family tags, consistent everywhere

**Status: Built** (v0.4)

- **Note:** clicking a die in the shop should show its family as a tag, like the rarity tag, and these tags should look the same on the table (the circle) too.
- **Proposal:**
  - One shared `FamilyTag` chip: element-colored, with the element's pixel icon and name. A fusion shows one chip per parent family; arcane dice show an "Arcane" chip.
  - Show it next to the rarity pill in `ItemInspector.jsx` (shop, inventory, upgrade shelf) and in the die tooltip on the table (`components/Die.jsx`, which currently lists families as plain text).
  - Same chip in the Gallery's die detail.

## E3. Element effects on dice (telling similar colors apart)

**Status: Ready** (v0.4, decided by Carlos)

- **Note:** some dice colors are too similar. Carlos's original idea was a subtle animation per element on the die body: the fire die covered in flames (it can stay orange), wind around the air die, and so on.
- **Proposal:** a procedural pixel-particle layer per element, drawn around and over `DieSprite`.

| Group | Effect |
|---|---|
| **Pure** | **Fire:** flickering flame pixels rising off the top. **Air:** wind streaks circling the die. **Water:** drips falling and a ripple at the base. **Earth:** pebbles and dust settling. |
| **Fusions** (blend their parents) | **Lightning:** sparks jumping. **Ice:** frost crystals at the corners. **Steam:** puffs. **Mud:** slow drips. **Crystal:** glints. **Steel:** a metallic sheen sweep. **Storm, Obsidian, Magma, Monsoon:** a mix of their parents. **Aether:** a soft white halo cycling all four. |
| **Arcane** | **Gilded:** shimmer. **Sapling:** a sprouting leaf. **Mirror:** reflection sweep. **Conduit:** current between its edges. **Chrono:** a ticking hand. **Beacon:** a pulsing light. **Prism:** a rainbow cycle. |

- **Where:** on the table, in the shop, in the inventory, and in the summary. In tiny sizes (inventory) use a lighter version.
- **Performance:** one shared CSS or canvas loop, not one timer per die. Pause when the tab is hidden.
- **Reduced motion and an Options toggle** ("Element effects") turn it off.
- This is a placeholder layer: Carlos will draw the real art (`ASSETS.md`), and the effects can then become sprite animations.

## E4. Element symbol in the middle (outside the table)

**Status: Built** (v0.4)

- **Note:** instead of "d#" on dice in their 3D form, show their symbol in the middle.
- **Proposal:** `components/DieToken.jsx` (shop inventory, upgrade shelf, boss reward, run preview) shows the element's `PixelIcon`, large and centered, instead of the "d6" label. The shape already tells the size, and the popover and tooltips still say "d6". On the table, dice keep showing their rolled face number.

## E5. Picking dice up in the shop

**Status: Ready** (v0.4, decided by Carlos)

- **Note:** dragging dice in the shop shows the browser's drag image (a PNG ghost), which looks cheap. Dice also have no hover animation; they could rotate or roll.
- **Proposal:**
  - Replace native HTML5 drag and drop in `ShopScreen.jsx` with pointer-based dragging (framer-motion `drag`, or `Reorder` per row). The picked die lifts (scale up, slight tilt, drop shadow), follows the pointer, and the other dice slide aside.
  - The shop inventory is a wrapping grid, and framer's `Reorder` only supports one axis. Use a custom grid reorder: compute the target slot from the pointer position, and animate the others with `layout`.
  - Hover: a small wobble or a quarter-turn spin (reusing `utils/motionPresets.js` `juicyHover`), and maybe a quick mini-roll on hover.
  - Keep Reduced motion support.

## E6. A real rolling animation

**Status: Ready** (v0.4, decided by Carlos)

- **Note:** rolling should look like the dice are actually rotating. It doesn't need to be perfect, just motion. Add a setting to pick this or the legacy version.
- **Proposal:**
  - A "Tumble" animation in `components/Die.jsx`:
    - The die hops up, then rotates through a few quarter turns with a squash and stretch.
    - The face flickers on each turn, with fake 3D from a horizontal scale flip mid-turn.
    - It lands with a bounce.
    - A small random spin direction and hop height per die, so the pool doesn't move in lockstep.
  - The current flicker plus settle becomes "Classic".
  - New Options setting in `utils/settings.js`: "Dice roll animation: Tumble / Classic". Tumble is the default; Reduced motion forces Classic.
  - Keep the total duration close to today's, so rerolls don't feel slower.

## E7. "Held" tag above the die

**Status: Built** (v0.4)

- **Note (Carlos):** move the held tag to the top of the die, so it isn't confused with the bottom.
- **Proposal:**
  - In `components/Die.jsx`, state tags (Held, Locked, Frozen) move to a fixed-height row above the die.
  - Action buttons (Lock, Freeze) and the hotkey number stay in the row below.
  - Both rows keep a fixed height, so dice never shift when a tag appears. This keeps the vertical-stability fix from GDD §29.

## E8. Element balance: make Fire, Air and Earth more enticing

**Status: Built** (v0.4). The Water trim was not applied: the simulation below shows Water does not dominate (results in GDD §30).

- **Note (Carlos):** Water-family dice always seem like the best choice because of the rerolls; give the other families more flavor.
- **Analysis:** this is real, not just a play style.
  - Rerolls are the one resource every build needs, and Water is the only family that creates them (+1 per lock, +2 with Riverstone).
  - Locking also keeps a good face for free.
  - Water's relics pay twice: Glacier Heart doubles locked dice, and Tide Chart adds +3 per locked die.
  - The other families have weaker trade-offs: Fire has a real downside, Earth has no upside, and Air's sets depend on luck.

**New family abilities.** They apply to the **whole family**: every die whose element or parents include that element. A fusion gets the ability of each family it belongs to, so Lightning gets both Kindling and Drift.

| Family | Ability | Implementation notes |
|---|---|---|
| **Fire** | **Kindling:** a Fire-family die that fizzles on a 1 grants +1 reroll this round | Only dice that actually fizzle (have `zeroOnMin`), so Steel, Obsidian and Magma never trigger it. Grant it in `REROLL_UNHELD` when a die lands on a 1, at most once per die per reroll. Show it as a small "+1" pop on the die |
| **Air** | **Drift:** once per round, nudge one Air-family die's face up or down by 1, for free | New action `NUDGE_DIE { dieId, delta }`, clamped to 1..sides. One charge per round, regardless of how many Air dice you have (Open for tuning: one per Air die?). UI: small up and down arrows on Air-family dice while the charge is unused. Nudging a die to its max face does not trigger an explosion |
| **Earth** | **Patience:** an Earth-family die scores +2 for each reroll it sat out (held or locked) this round | Same mechanism as Sapling's `growth`, but resetting each round. Show it with the existing green "+N" chip |

- **Option 2s become relics** (Carlos). Proposed rarities, which Carlos can tweak:

| Relic | Rarity | Family | Effect |
|---|---|---|---|
| **Heat** | Uncommon | Fire | Each explosion this round gives every Fire-family die +1 for the rest of the round |
| **Gust** | Rare | Air | Once per round, reroll a single chosen die for free |
| **Steady** | Uncommon | Earth | Earth-family dice never roll below 3 |

- Add all six to `CONTENT.md`, the tooltips and family descriptions (`FAMILY_TEXT` in `components/GalleryScreen.jsx`), and the tutorial's family explanation.
- **Verify:** with a Node simulation of mono-element pools before and after (a simple bot that holds its best dice). If Water still clearly dominates, the agreed fallback is a light trim: only the first Water lock each round refunds a reroll. Report the numbers to Carlos before applying the trim.

## E9. Load-save screen: use the whole screen

**Status: Ready** (v0.4, decided by Carlos)

- **Note (Carlos):** the screen when you load a save is a little square in the center. It should use the whole screen, and better convey the items, dice, lives, and where in the game the player is.
- **Proposal:** rebuild `components/RunPreview.jsx` as a full-screen layout.
  - **Left column:** difficulty, loadout, seed, lives, Shards, and a round progress strip (1 to 15, with boss rounds marked and the current round highlighted).
  - **Center:** the dice pool as large `DieToken`s with element effects (E3), then relics and consumables, each inspectable.
  - **Right column:**
    - A compact Road map (`RoadMap.jsx`) showing where you are and the next stop.
    - Active boons (E1).
    - Bosses faced so far.
  - **Bottom:** a big Continue button (Enter), plus Back.

## E10. Missing a round: a centered, dimmed screen, and a safety camp

**Status: Ready** (v0.4, decided by Carlos)

- **Note (Carlos, with a screenshot):**
  - The "Missed! -1 life" panel is not centered (it sits in the dice column next to the HUD), and the background should be grayed out.
  - When a player loses a life, the best way forward should be a safety camp: give them some Shards and send them to a shop. They still have to beat the round, but they get a chance to improve.
- **Layout fix:** render the missed panel (`components/RoundResult.jsx` in the `missed` phase) as a viewport-centered overlay, over a dimmed and desaturated backdrop (for example `bg-[#07050c]/75` with `backdrop-filter: grayscale(0.6)`). Same treatment for game over.
- **Safety camp, proposed flow:**
  1. Miss: -1 life.
  2. The missed overlay.
  3. **Camp**, a small shop.
  4. Retry the same round with fresh dice.

  The camp:
  - **Keeper:** Tobb runs it. He returns everywhere (A4) and fits the comfort role. Placeholder line: "Sit, Caster. Nobody wins every fight. Have some tea, then try again."
  - **Payout:** a few Shards on arrival, Proposed 3 + half the round number (rounded down).
  - **Stock:** a small Market (2 dice, 2 items) plus rerolls, no Forge.
  - **The Road:** the camp doesn't use up a Road stop; your next chosen shop stays the same.
  - **Game over** (no lives left) skips the camp.
  - **Decided (Carlos):** the camp pays Shards and also sells items. Item effects that trigger on a miss (Steadfast's +3 Shards) stack with the camp payout.

## E11. New-run screen: animated loadout carousel and difficulty picker

**Status: Agreed** (design accepted by Carlos; ships in **v0.5**, not v0.4)

- **Note (Carlos):** the play screen could be animated. Instead of squares, scroll through the loadouts, show the dice in "3D" with a stylized name, and make the difficulty more appealing, without showing every option at once, like Balatro or TBOI.
- **Proposal:** rebuild `components/TitleScreen.jsx`.
  - **Loadout carousel:**
    - One loadout at a time, centered and large: its dice as `DieToken`s with element effects, the name in the `el-logo` banded-gold style, and the tagline.
    - Left and right arrows (and keyboard arrows or swipe) slide to the next loadout, with a short slide-and-tilt transition.
    - Locked loadouts appear as dark silhouettes with their unlock condition.
    - Small dots underneath show position and completion marks (B2, later).
  - **Difficulty picker** (like Balatro's stake chips):
    - One difficulty shown at a time, as a big flame emblem in its color, growing from Ember to Cataclysm.
    - Its name, its one twist, and arrows to step up or down.
    - Locked difficulties show as dim, with "Beat X to unlock".
  - **Seed** field tucked under an "Advanced" toggle.
  - **Start** is one big button; Enter starts.
  - Honors Reduced motion.

## E12. In-game patch notes ("What's new")

**Status: Ready** (v0.4, decided by Carlos 2026-10-01)

- **Note (Carlos):** add a section in the game to see the new additions, like patch notes, including previous versions.
- **Spec:**
  - **Data:** `data/patchNotes.js` holds every version, newest first: `{ version, name, date, highlights: [{ en, es }] }`. Its content mirrors Part D of this document (v0.1 to v0.4), written for players: short, friendly, no file names.
    - Keep the two in sync: when a phase ships, add the entry to both.
    - The in-game version tag (`ElementaGame.jsx`, currently "v0.3 alpha") should read from the newest entry, so it can never drift.
  - **Screen:** `components/PatchNotesScreen.jsx`, opened from a new "What's new" / "Novedades" button on the main menu (`components/MainMenu.jsx`), and from the Options screen.
    - The current version is expanded at the top; older versions sit below as collapsible entries.
    - Pixel UI kit styling, matching `CreditsScreen.jsx`. Bilingual through `useLanguage()`.
  - **"New" badge:** store the last version the player has seen in localStorage (`elementa-seen-version`, via `utils/settings.js`, wrapped in try/catch like the other settings).
    - When the newest version is newer than the stored one, the "What's new" button shows a small "NEW" chip.
    - Opening the screen marks it seen.
    - Include the key in backup files (`utils/backup.js` already exports every `elementa-*` key; confirm).
  - **Release step for every future phase:**
    1. Add the patch notes entry to `data/patchNotes.js` and Part D.
    2. The version tag then updates automatically.

---

## Decision log

- **2026-09-30:**
  - Multiple TBOI-style endings driven by run choices: agreed.
  - Aether recipe locked until Primordial is beaten on the file: Ready (B6).
  - Credit The Binding of Isaac: Ready (B7).
  - Three paths, Neutral, Primordial and Split, decided by the player's choices, each with its own final battle: agreed (B1).
  - New run or continue depends on the ending and what the player has accomplished, TBOI style: agreed (B2).
  - Pact symmetry: Nix makes Aeris cost more, then locks her out; Nix never locks you out; betrayal pacts break Aeris blessings; Nix is on the Primordial path: agreed (B3).
  - Lay out the whole expansion first, then add it in phases, with patch notes and a playtest backlog: agreed (Parts C, D, E).
  - Names: Elementa (base realm) and the Firmament (mythical realm): decided (A1).
  - Air god named Zephyr: decided (A1, B4).
  - Gods hidden on the first playthrough: agreed (B4); the reveal trigger is proposed.
  - More abstract realms after the Firmament, distorting reality itself, with Empyrean and Pleroma as candidates: agreed concept (A3).
  - The Firmament unlocks new items and systems: agreed (B9).
  - True ending only on Cataclysm, through the hardest path, beating everything: agreed (B2).
  - New shopkeepers and characters, some returning depending on the route: agreed need (A4).
  - Carlos's dice ideas and edits in CONTENT.md: recorded, awaiting answers (B10).
  - Third realms: Empyrean (Split) and Pleroma (Primordial) decided; the Neutral realm's name is open (Meridian proposed); a shared final place, the Source, proposed (A1, A3).
  - Mote needs a twist; the hunger and secret-stock idea is proposed (A4).
  - Tobb returns in every realm: decided (A4). Keepers as family: kept in `IDEAS.md`.
  - Dice without numbers (poker, Joker, path sigils): agreed concept (B11).
  - B10 answers:
    - Two's Complement: even face, +2 Mult.
    - Reversed Bits: real bit reversal across the whole pool.
    - Entropy: combines all six Mythic dice plus Aether, recipe after beating the Firmament.
    - Void ability approved.
    - Upgrade Stone to Epic intended.
    - All of Carlos's edits are decided but not shipped yet, and moved out of CONTENT.md.
    - Chrono moves to the Firmament.
  - Created `IDEAS.md` for ideas without a place yet.
- **2026-10-01:**
  - The Neutral realm is named the Meridian: decided (A1).
  - The fourth place where paths meet: back to Open, still iterating (A1, A3).
  - Mote's hunger hook: Carlos likes it (A4).
  - Reversed Bits on a whole byte (Carlos): balance concern recorded, Carlos to choose full byte or each die's own width (B10).
  - Playtest notes added as E1 to E6 (boons as icons, family tags, element effects, symbol in the middle, shop pickup, tumble roll animation), proposed for v0.4.
  - Reversed Bits uses each die's own bit width (option b): decided (B10).
  - E1 to E6 ship in v0.4: decided, marked Ready.
  - New playtest notes E7 to E11 (held tag above the die, element balance, full-screen load screen, centered missed screen with a safety camp, animated new-run screen): proposed.
  - E8: Kindling, Drift and Patience, family-wide; Heat, Gust and Steady become relics: decided.
  - E10: the camp pays Shards and sells items; Steadfast stacks with it: decided.
  - E7 to E10 Ready for v0.4; E11 moves to v0.5.
  - E12: in-game patch notes screen with every version and a "NEW" badge: decided, Ready for v0.4.
