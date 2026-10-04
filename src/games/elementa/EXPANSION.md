# Elementa expansion plan

A living design document between Carlos (the designer) and Claude. It collects every idea that "stuck" so an agent with no prior context can execute it.

**Guiding principle (Carlos):** the current game is complete, fun, and has a self-contained story. The expansion builds on it; it never replaces it. Lay everything out first, then add it piece by piece in phases (Part C).

## For the agent executing this document

**Only build items marked `Status: Ready`**, and only within the roadmap phase Carlos tells you to execute (Part C). Items marked `Agreed` have a settled concept but unfinished details. Items marked `Proposed` or `Open` are still being designed. Build neither; if a Ready item depends on one of them, stop at the boundary and say so.

**About "Claude's spec":** some Ready items contain details marked *Claude's spec* or *default*. Carlos approved building them as written so work isn't blocked; build them exactly as specified. List every such default in your end-of-phase report so Carlos can tune them after playtesting.

**Work in the main checkout only.** Do not create git worktrees, sibling folders, or copies of the project unless Carlos explicitly asks. (An earlier phase used a sibling worktree `Portafolio-v0.5` to keep a playtest undisturbed; Carlos did not want the extra folder. Work on the current branch in `/Users/charly/Desktop/Projects/Portafolio`.) If you need isolation, use a branch and ask first.

**Mute the game before any browser test.** Carlos plays in his own tab while agents test, and he hears double music. Before driving the game in the browser pane, set `elementa-music-enabled` to `false`, and `elementa-music-volume` and `elementa-sfx-volume` to `0` in localStorage (in the same call that writes any test save), then reload. Never leave sound on in a test save. The Jukebox page is the only exception, and only when the task is to check a song.

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
- **The legendary shop is named per realm** (Carlos, 2026-10-03: "I would change it for each realm"). Elementa keeps **Aether Bazaar** (Aether is the quintessence above the four elements). Proposed names for the next realms, Carlos to pick or change: Firmament **Astral Exchange**; Empyrean **The Ledger**; Pleroma **Cornucopia**; Meridian **Equinox Market**. In v0.7 the legendary shop's name comes from the realm (Part H6).

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
  - What happens when Mote is full: workshopped in A5 (Proposed: Mote is the key to the fourth place).

**Tobb returns in every realm (Decided, Carlos).** He is the constant friendly face of the shops.

**Returning by route** (the path decides who follows you into the Firmament):
- **Split path:** Aeris, in her true form, as guide and shop.
- **Primordial path:** Nix, revealed, running an "eclipse market".
- **Neutral path:** Tobb, somehow already there ("I go everywhere").

**Story characters:**
- **Pip** is the emotional thread to the true ending: its origin as a spark of Aether pays off there.
- **The First Caster**, who caused the Split, is a candidate final villain.
- **The gods (B4)** can become characters after the reveal: on the Split path, a god you honor could run a shop.

## A5. Workshop: the fourth place, the true ending, and Mote

**Status: Proposed** (Carlos, 2026-10-03: "these are the things we will be workshopping today"). Not for building yet; this is the current pitch to react to.

- **The idea that ties them together.** The Void is absence: what existed before the First Word. Mote, a speck of Void, is the first "nothing" that wanted to be something. It eats everything you sell it to become a Word. **When Mote is full, it becomes the pen**, and the pen opens the fourth place. So Mote's hunger (A4) is not a side quirk: it is the long-term goal that gates the true ending.
- **The fourth place, three candidates** (pick one, or keep iterating):
  1. **The Unwritten** (recommended): the blank page the First Caster wrote the Split on. The interface itself starts to erase: dice faces fade, the ledger goes blank line by line.
  2. **The Source:** all three paths' rules at once, alternating each round (Empyrean order, Pleroma merging, Meridian balance).
  3. **The Waking:** the Primordial's dream ends and the world decides what is next.
- **The true ending** is less a fight and more a choice made with everything you earned, with one hard fight in front of it:
  - **The fight (proposed): the First Caster fields your own best build** (a snapshot of the dice and relics from your highest-scoring cast on this file) and a target built from your best cast. "You have to beat yourself."
  - **The choice:** the pen is held out to you: rewrite the world. Three options, one per path, and Pip's quiet choice (Pip is a spark of Aether) decides which one is the true one.
  - **Gating:** Cataclysm, a full Mote, all six Mythic dice unlocked and Entropy forged, every path's three endings seen.
- **Open for Carlos:** the place's name, whether the First Caster is the last villain, and what the pen writes.

---

# Part B: Systems

## B1. The three paths

**Status: Built** (v0.5 recording, v0.6 live paths). Carlos agreed the design on 2026-10-02; Claude's specs fill the remaining details.

**Agreed (Carlos):** a run's choices sort the player into one of three paths. The path changes the final battle and what it unlocks.
- **Neutral:** the player sided neither with the Primordial nor against it.
- **Primordial path:** the player wants the Primordial complete again, back to what it was before the Split.
- **Split path:** the player wants to defeat the Primordial and keep it split.

**Agreed (Carlos): how a run is sorted.** A hidden "Accord" meter, like TBOI's hidden devil/angel chance. It stays mostly hidden: never a number, only hints.

| Pushes toward the Primordial | Pushes toward the Split |
|---|---|
| Forging fusions | Holding pure dice |
| Holding fusion dice, Aether, Prism | Mono-element pools |
| Nix pacts, especially betrayal pacts (B3) | God dice |
| | Aeris blessings |

- Near zero, or no strong lean, means Neutral.
- The meter is never shown as a number. It's hinted through Aeris, Nix and Pip's dialog, the Primordial's lines during the final fight, and the arena's tint.
- **Accord meter, starting weights (Claude's spec, tune after playtests).** The meter starts each run at 0 and is stored in run state.

| Toward the Primordial | | Toward the Split | |
|---|---|---|---|
| Each fusion forged | +1 | Each Aeris blessing | -2 |
| Each Nix pact | +2 | Holding a god die at round 15 | -3 |
| Each betrayal pact | +4 | | |

  - **When round 15 begins:** add +1 for each fusion or Aether die held, and -1 for each pure die held. Prism counts as a fusion.
  - **Thresholds:** +6 or more is the Primordial path, -6 or less is the Split path, anything in between is Neutral.
  - **Path gating (B2):** before the paths are unlocked, the run is always Neutral.
- **Hints, never a number:**
  - Aeris and Nix lines react to a strong lean (|meter| of 4 or more).
  - Pip says one line at round 14 hinting at the coming path.
  - The round-15 arena tints toward red for the Primordial path, toward blue-white for the Split path, and stays neutral for Neutral.
- **Decided (Carlos):** the path is locked in the moment you walk into round 15.

**Agreed (Carlos): the final battle per path:**
- **Neutral:** today's Primordial fight (shifting twist). Ending: "The Circle Holds".
- **Split:** the Primordial at full strength, fighting to take your dice back. Ending: the Split holds forever.
  - **Claude's spec, "Primordial Unbound":** after every reroll, it fuses two neighboring pure dice of different elements into their double fusion for the rest of the round (the round only, your pool goes back afterwards). It keeps its shifting twist too.
  - **Target:** 1.5x the normal round-15 target.
- **Primordial:** the Primordial doesn't fight you. You fight the four gods who made the Split. Ending: the Primordial made whole.

**The Primordial path's battle (Agreed, Carlos 2026-10-02: a gauntlet).**
- **One by one, as a gauntlet inside round 15:** four stages, one god each, each with its own twist and target. No shop between stages, and lives still count.
- **Why not all four at once:** four twists stacked would feel random rather than hard.
- **Why the gauntlet:** it tells the story of reuniting the Primordial as you play it.
- **Claude's spec for the stages:**
  - **Order:** Gaea, Ognen, Varuna, Zephyr.
  - **Targets:** 0.7x, 0.9x, 1.1x and 1.4x the normal round-15 target.
  - **Each stage is a fresh roll with full rerolls.** A miss costs a life and retries that stage, with no safety camp mid-gauntlet.
  - **Each god fights with its own drawback (B4) turned against you:**

| Stage | God | Twist on your pool |
|---|---|---|
| 1 | **Gaea** | Your Earth-family dice score -5 (-10 on a 1) |
| 2 | **Ognen** | Your Fire-family dice fizzle on 1, 2 and 3 |
| 3 | **Varuna** | 1s come up 50% more often on every die (changed from "every die becomes a 1" after playtesting, Alpha v0.6.6) |
| 4 | **Zephyr** | Your Fire-family dice explode 50% less often, and sets need one more matching die |

  - **The boss banner** shows the current god (`BossAvatar` placeholders, one color each) and "Stage N of 4". Each god has its own music theme (`boss_gaea`, `boss_ognen`, `boss_varuna`, `boss_zephyr`).

**The Primordial die (Agreed, Carlos):** a die like Aether but more powerful, in the spirit of Entropy, that you have for this battle.
- **Agreed (Carlos):** it gets stronger with each god defeated.
- **Claude's spec:**
  - The Primordial lends it to you when you walk into round 15 on its path. It joins your pool as an extra die (ignoring the dice cap), as a d20, and leaves when the run ends.
  - It starts with every Aether mechanic. Each god you beat adds that god's ability (B4) to it, without the drawback: after Gaea it also scores every other Earth-family die's face, and so on.
  - After the fourth god falls, the die is whole: the ending.
  - It gets a Gallery entry when first used, and is never sold or kept.

**Proposed: where Mythic dice come from:** the Split path (order) leads to Light, Time and Space; the Primordial path leads to Chaos and Darkness.

## B2. Endings and unlock structure (TBOI style)

**Status: Built** (v0.6; the Firmament door itself is v0.7). Carlos: "it depends on what ending you have and what you have accomplished", like TBOI's Mom unlocking more.

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

**Path unlock order (Decided, Carlos 2026-10-02: option A):**
- Beating the Primordial on the Neutral path ends with **visions of the four gods**: a short ending-card sequence where each god appears in turn.
- The visions grant all four god recipes (stored in `profile.recipes`, like Aether's), which opens both the Split and the Primordial paths for future runs.
- **The Primordial path is impossible without the god recipes** (Carlos).
- **For v0.6:** the Split and Primordial endings end the run with their own ending cards. The Crossroads door into the Firmament (step 3 above) arrives in v0.7.
- **Ending card text:** the agent writes short bilingual drafts, clearly marked as drafts for Carlos to rewrite.

**Endings per path (Agreed, Carlos 2026-10-03):** three. The Elementa ending (built in v0.6), then **Firmament I** (beat the path's first set of three Wardens) and **Firmament II** (a later run, the other three Wardens). Three paths, nine endings; the true ending is separate and later (A5). Details in Part H1.

**Agreed (Carlos):**
- An **Endings** tab in the Gallery, with an ending card (pixel placeholder plus short text) per ending.
- **Completion marks:** each loadout records which endings it has beaten, shown on its card, like TBOI's per-character marks.

## B3. Nix and Aeris: pact symmetry

**Status: Built** (v0.5). Carlos's answers (2026-10-02): Aeris costs 4 + half the round in Shards at one pact and your cheapest item at two; Shrine odds change by converting stops ahead; The Long Night adds a second twist. Carlos approved the numbers, the new pacts (2026-10-02), and the matching new blessings below.

**Agreed (Carlos):**
- Siding with Nix makes Aeris's blessings cost something, and makes Aeris appear less. With enough Nix pacts you are fully locked out of Aeris.
- Aeris senses it in dialog ("something is strange with you").
- **Nix never locks you out:** he wants more of you, to stop you, because he has listened to the Primordial (he is on the Primordial path).
- If you hold Aeris blessings, Nix offers different pacts: **betrayal pacts** that break your Aeris blessings to turn you to his side.

**Numbers (Agreed):**

| Nix pacts this run | Effect on Aeris |
|---|---|
| 0 | Normal |
| 1 | Blessings cost Shards; Shrines appear half as often; Aeris: "Something is strange about you." |
| 2 | Blessings cost a relic or consumable; Aeris: "You carry a shadow. I can still help, for a price." |
| 3+ | No Shrines on the Road (converted deterministically to Black Markets); Aeris no longer appears |

- **Betrayal pacts** (Agreed; offered when you hold at least one Aeris blessing):
  - Give up a blessing's effect for a large reward with no life cost.
  - Example: **Broken Vow**: lose Blessing of Wind for a legendary relic.
  - They count double toward the Primordial path.
- **Taking blessings** pushes toward the Split path. Walking away from a Black Market without a deal raises the Shrine weight, like TBOI's angel chance.
- **More pacts (Approved, Carlos 2026-10-02)**, alongside today's four (Blood Price, Nix's Loan, Soul Die, Hollow Pact):

| Pact | Effect |
|---|---|
| **Gambler's Oath** | Double the Shards from your next clear, or lose them all (coin flip, seeded) |
| **Hollow Crown** | +1 relic slot, but your relics sell for 0 for the rest of the run |
| **Shadow Twin** | Clone your best die; the clone fizzles on 1 and 2 |
| **The Long Night** | The next boss's twist is doubled; beating it pays a legendary relic |
| **Bound Tongue** | Remove one Fragment from the rest of the run; Aeris can never appear again this run |

  For **Bound Tongue**, "remove one Fragment" means the next boss is replaced by Ermal the Unbothered.

- **Betrayal pacts (Claude's spec).** Generated from the blessings you actually hold; one is offered per Black Market visit when eligible, in addition to the normal deals.

| Betrayal pact | Requires | Effect |
|---|---|---|
| **Broken Vow** | Blessing of Wind | Lose Wind's +1 reroll; gain a random legendary relic (needs a free relic slot) |
| **Unspoken Prayer** | An active Prophecy | Break it: the foretold boss becomes a random tier-1 boss, and +12 Shards |
| **Stolen Breath** | Blessing of Tide pending | Cancel the +3 rerolls; your next clear pays double Shards |
| **Severed Grace** | Any Aeris blessing this run | Permanently +1 Mult for the run; Shrines can never appear again this run |

- **More blessings, the same love for Aeris (Approved, Carlos 2026-10-02: "give the same love to Nix and Aeris, maybe a pact that doubles your Shards for something").** Claude's spec, added to the Shrine pool:

| Blessing | Effect |
|---|---|
| **Blessing of Plenty** | Your next clear pays double Shards, but the next shop's offers can't be rerolled |
| **Blessing of Ember-ward** | Next round, no die can fizzle |
| **Blessing of Clarity** | See two extra rows of the Road, and change your chosen next stop once |
| **Blessing of Communion** | Next round, every reaction gives +0.5 more Mult |
| **Blessing of Grace** | Restore all lives; Shrines skip the next two stops |

- **Nix vs Aeris on Shard doubling:** Nix's Gambler's Oath is the risky version (double or nothing); Aeris's Blessing of Plenty is the safe version with a small cost.
- **Aeris's cost per Nix pact (table above)** applies to every blessing, the new ones included.

- **Across runs (Proposed):**
  - Lifetime pacts unlock Nix's inner stock (cursed legendaries).
  - Lifetime blessings unlock a no-downside blessing.
  - Builds on `profile.keepers`.

## B4. God dice

**Status: Built** (v0.6; Carlos decided everything below on 2026-10-02)

**The gods:** Gaea (Earth), Ognen (Fire), Varuna (Water), Zephyr (Air). Each is made from 4 of the same pure die.

**Agreed (Carlos):**
- **Hidden on the first playthrough.**
- **Rarity:** a new **Divine** rarity between Legendary and Mythic.
- **Forge-only:** consume 4 pure dice of one element. Never sold.
- **One god at a time.** Holding more would be overpowered.
  - Claude's spec: a Legendary relic **Pantheon** allows a second god. Sold only in the Aether Bazaar, after the god recipes are known.
- **Recipes come from progress:** beating the Primordial on the Neutral path shows visions of the gods and grants all four recipes (B2, option A).
- **Story role:** the enemies of the Primordial path's final battle (B1).

**Proposed reveal:** after the first win, the Primordial's dying words mention "the four who broke me."

**Abilities and drawbacks (Carlos's versions).** Each god has its own drawback, replacing the earlier shared "other pure dice are weaker" rule:

| God | Ability | Drawback |
|---|---|---|
| **Gaea** | Also scores the face of every other Earth-family die; Earth dice are set wildcards | Earth-family dice score -5 (-10 if their face is a 1) (Carlos: "it just hits earth die"). Gaea draws her power from her own family |
| **Ognen** | Explodes on any face of 4 or more, not just the max | Fizzles on 1, 2 and 3. If any Water-family die is in the pool, explosions are 50% rarer. Chain cap of 10 explosions per roll (decided) |
| **Varuna** | Any die can lock for free, and those locks still refund a reroll. Every die showing a 1 takes Varuna's face instead | 1s come up 50% more often, on every die (Carlos, 2026-10-04: the old "every die becomes a 1" was too punishing and bugged Kindling) |
| **Zephyr** | Sets go up one tier (a pair counts as a three, a three as a straight); Zephyr's face is a wildcard | Fire-family dice explode 50% less often |

**New relic: Chain Break (Decided, Carlos 2026-10-02; rarity is Claude's spec).**
- **Rarity:** Epic, Fire family.
- **Effect:**
  - Normal Fire-family dice explode more often: on their top two faces instead of only the max.
  - Removes Ognen's chain cap.
- Ships with the gods (v0.6), and appears only after the god recipes are known.

## B5. Mythic dice and the mythical realm

**Status: Built** (v0.7, GDD §37). The full spec, with Carlos's answers of 2026-10-03, is **Part H**.

Summary: the Firmament continues the run from round 16 to 30 with a Warden boss at 20, 25 and 30; six Wardens in two sets of three give two more endings per path; each Warden guards a Mythic die (Light, Darkness, Time, Space, Chaos, Void) that unlocks when it falls; the Space die and a rare item carry the new "Warp" tag (an extra slot, like Balatro's Negative); Entropy fuses every Mythic die with Aether; Aether and the Mythic dice can grow past d20 up to d100. The Firmament's final Warden is **not** the true ending (Carlos): the true ending is the fourth place (A5).

## B9. New kinds of items (the next level)

**Release (Carlos, 2026-10-03): Constellations and Runes ship in v0.7.5; editable faces and Laws in v0.8.5.** Seren (the astronomer) joins the Firmament with the Constellations in v0.7.5.

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

**Status: Decided** (Carlos, 2026-09-30), **not shipped yet**. Carlos: "I don't want to ship the ideas yet, move them to the expansion." They moved here from CONTENT.md, which again describes only the current game.

**Status for the v0.5 part: Built** (v0.5; Chrono's repeat-until-not-1 ability shipped too, Carlos 2026-10-02, only its move waits for v0.7). **Timing (Agreed, 2026-10-02):**
- The balance changes, Bullion, Masquerade and Chameleon ship in **v0.5**.
- Chrono's move ships with the Firmament (**v0.7**), together with a new design (Part H4): the pool-rewinding Chrono is a Firmament die, and the old self-rerolling one is renamed Kairos and stays in Elementa.
- The number dice ship with realm 3 (**v0.8**).

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

**Release (Carlos, 2026-10-03): poker and Joker dice in v0.7.5, sigil dice in v0.8.5.**

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

**Status: Agreed** (Carlos, 2026-10-02). Each phase should ship as a complete, playable update with its own patch notes.

**Version naming (Decided, Carlos):** three stages.
1. **Alpha:** Alpha v0.4 to Alpha v1.0 (the phases below; in-game tag "v0.4 alpha"). Carlos calls them "AV0.4", "AV0.5", and so on.
2. **Beta:** after Alpha v1.0, numbering restarts: Beta v0.1, v0.2, and so on, until Beta v1.0.
3. **Release:** the full 1.0 comes after the beta.

Patch notes (Part D and `data/patchNotes.js`) should label versions with their stage, for example "Alpha v0.4".

| Version | Name | Contents |
|---|---|---|
| **v0.4** | The Road | Already built, not yet released or committed: the Road map, shop types, keepers, music themes, playtest pass (Part D). Add B6 (Aether recipe), B7 (credits), the E1 to E10 playtest polish, and E12 (in-game patch notes), all Ready. E11 moves to v0.5. The version tag becomes "v0.4 alpha" through E12. Then bump the in-game version tag (`ElementaGame.jsx`, currently "v0.3 alpha"). |
| **v0.5** | Allegiance | **Ready.** E11 (new-run screen). B10 balance changes plus Bullion, Masquerade and Chameleon. B3 (pacts, betrayal pacts, new blessings), plus the B1 Accord meter recording with its dialog hints (paths not yet active). New Nix and Aeris dialog for the pact costs and lockout. No new endings yet. |
| **v0.6** | Three Paths | **Ready.** B1 (Accord meter goes live, the three final battles, the gauntlet, the Primordial die), B2 (path unlock via god visions, ending cards, Endings tab, completion marks), B4 (gods, Divine rarity, Pantheon, Chain Break). |
| **v0.6.5** | Polish | Carlos's v0.6 playtest notes, Part F (P1 to P18). Built, except P2, which Carlos answered and v0.6.6 built. Ships before the Firmament. |
| **v0.6.6** | Loose ends | Part G Q1 to Q3 and Carlos's d5 and Chisel answers: popovers on top, Varuna's 1-bias, the Kindling fix, copy dice rolling with borrowed abilities, the d5, sized shop dice, the new Chisel. **Built.** |
| **v0.6.7** | Showtime | Part G Q5: Balatro-style scoring choreography. **Built.** |
| **v0.7** | The Firmament | **Built.** Part H: the Firmament (rounds 16 to 30, Wardens at 20, 25, 30, six Wardens in two sets), the Mythic dice and the Warp tag, Chrono and Kairos, Entropy and the d100 path, the Firmament keepers (Atlas, the Horologist, Mote) and the path followers, the Crossroads door, and the story scenes of Part G Q4a. |
| **v0.7.2** | Firmament depth | **Built.** Part I: five Celestial dice, the Horologist's rotating pool (six offers per visit, three new consumables, two relics). |
| **v0.7.5** | Constellations | **Built.** Part J: Seren and the Observatory, the ten Constellations plus Black Hole, five Runes. Poker and Joker dice (B11) merge into v0.8.5. |
| **v0.8** | Cosmic elements | **Built.** Part K: six base elements in shops, the six Mythic dice forged with Stardust (bosses drop it) after a Warden teaches the recipe, the Forge rebuilt with slots and size-by-average, runes inscribed on a number by rotating the die, seven element fusions with volatile collapse (Dead Star), Vesper the Cosmologist, Pip's crossing scene, six new die items. |
| **v0.8.1** | Family growth | **Built.** Part L: Water's Tide (half the locked score to Mult), Drift to the top face, five relics, four Totems, 27 reactions for the new elements. |
| **v0.8.2** | Late scaling | **Ready.** Part M: targets grow x1.40 instead of x1.45 after round 15, any die grows past d20 in the Firmament, four multiplying relics, Constellation milestones, checked with the committed balance simulator. |
| **v0.8.5** | Strange faces | B9 editable die faces and Laws; B11 poker, Joker and sigil dice (Carlos 2026-10-04: poker and Joker dice merged in here). Face-bound runes (v0.8) already cover part of editable faces, so scope the rest in a workshop first. |
| **v0.9** | Echoes | Ideas Carlos promotes from `IDEAS.md`; the fourth place and the true-ending groundwork (A5). |
| **Later** | Rewriting reality | The third realms (Empyrean, Pleroma, Meridian), formula-rewriting bosses, B10 number dice. Moved out of v0.8 (2026-10-03); needs its own workshop first. |
| **v1.0** | True ending | The true ending (Cataclysm, hardest path, everything), balance pass, Carlos's hand-drawn art swapped in. This is Alpha v1.0; the beta starts after it. |
| **Beta v0.1** | Cinematics and depth | Part G Q4b: full animated cinematics, 3D-style item sprites like the dice, and more interesting items and synergies. The beta starts after Alpha v1.0. |

---

# Part D: Patch notes

Newest first. Versions before v0.4 are reconstructed from GDD.md; the dates are when the work was done in development.

### Alpha v0.8.1 "Family growth" (in development, unreleased)
- **Water's Tide:** a locked Water-family die also sends half its final score to Mult (its own ledger line). Held dice do not count.
- **Drift to the top:** the nudge can go to a die's top face (a third button). It scores that face and does not explode.
- **Five relics:** Deep Current, Spring Tide (the spec's "Undertow", renamed because Undertow exists), Gale Seal, Second Wind, Standing Stones.
- **Four Totems** (Fire, Water, Earth, Air; level 5 at most): in Seren's Observatory, the Firmament shops and Elementa's Market (low weight); their own Gallery family.
- **27 reactions for the six new elements** (12 with the classic four, 15 between themselves), all secret, with a Gallery section of their own and the secret achievement Cosmic Alchemist. Master Alchemist stays for the classic secrets.
- **CONTENT.md regenerated** with the current names.

### Alpha v0.8 "Cosmic elements" (in development, unreleased)
- **Six base elements** in Firmament shops: Light, Darkness, Time, Space, Chaos and Void (renamed after the first build; the ids are still glimmer, gloom, moment, reach, flux, nil), each its own family.
- **Mythic dice are forged:** a Warden teaches its recipe (old files' unlocked Mythic dice become known recipes); 4 of the matching base die, 1 Stardust and 20 Shards. They are no longer sold anywhere. A run that holds one keeps it.
- **Stardust:** a run resource; 1 per boss, 2 per Warden; Vesper sells 1 a visit for 30; Mote's 120 stock sells 2.
- **The Forge, rebuilt (every Forge):** four slots, the recipe read from what you place, a live preview, a chooser when several match. Size is the average of the absorbed sizes (rounded down, capped at d20 unless it grows big). Bonuses, Warp, Weights and a Gem Socket carry over.
- **Runes on a number:** the Inscribe screen (arrows, keys, drag, a stepper for big dice). Clashes and shrinks in the Forge: pay 8 per clash to superpose, or a silent seeded 50/50 loss. Chisel moves runes to the new top face; Transmute clears them; Graft moves one.
- **Seven element fusions** (Shadow, Continuum, Oblivion, Alba stable; Anomaly, Singularity, Nadir volatile, 25% collapse into a Dead Star unless a Catalyst steadies it). Entropy is now Shadow, Continuum, Oblivion and Aether.
- **Vesper, the Cosmologist**, beside Brasa past the door; her first meeting and Pip's crossing are story scenes; a new song, `shop_vesper`.
- **Die items:** Weights, Honing Oil, Graft, Solvent, Gem Socket, Catalyst.

### Alpha v0.7.5 "Constellations" (in development, unreleased)
- **Seren and her Observatory:** a new Firmament keeper and shop with four Constellations a visit.
- **Constellations:** ten permanent levels (to 10) for the seven base reactions and the three set types, shown in the Cast ledger and Run Info, plus the rare Black Hole that levels all ten.
- **Runes:** Echo, Glass, Kinship, Ember and Anchor, sold at Forge shops and in the Firmament Market, socketed one to a die.
- **A new song** (`shop_observatory`), and three secret achievements.

### Alpha v0.7.2 "Firmament depth" (in development, unreleased)
- **Celestial dice, Firmament only:** Comet, Pulsar, Satellite, Quasar and Zenith, in Firmament Markets (weight 1 each, Quasar 0.4) and always one on the Astral Exchange's shelf.
- **The Horologist's rotating pool:** six offers a visit. Chrono always, plus one of Pulsar, Zenith and Kairos; three of Stopwatch, Time Capsule, Hourglass, Pocket Watch, Metronome and Almanac; one of Mainspring and Cuckoo Clock.
- **New items:** Hourglass, Pocket Watch, Metronome, Almanac (consumables) and Mainspring, Cuckoo Clock (relics).
- **Showtime follow-up:** a die changed by a Beacon, Satellite or Mirror names its helper in the cast caption and lights it.
- **Horologist:** three more lore lines.

### Alpha v0.7.1 "Settling in" (in development, unreleased)
- **Paths:** the Primordial path now needs +8 (was +6); a pool of 4 or more dice that all share one element family counts -3 toward the Split (which stays hard, -6). Neutral is the wide middle.
- **Nix:** only offers pacts that are payable right now (the whole pact list is drawn from, then filtered).
- **The Road:** a portal between round 15 and 16.
- **Gallery:** undiscovered gods, Primordial die, Mythic dice and Aether sit in an Unlocks box with no family or rarity.
- **Reactions:** nine secret Mythic reactions (Eclipse, Event Horizon, Paradox, Solar Flare, Black Tide, Sinkhole, Slipstream, Frozen Moment, Cascade).
- **Achievements:** 23 new, the Firmament ones secret.

### Alpha v0.7 "The Firmament" (in development, unreleased)
- **The door and the Crossroads:** once a path's ending has been seen on the file, winning round 15 on that path again leads to the Crossroads: rest (the run ends with the Elementa ending) or enter the Firmament and keep the same run.
- **The Firmament:** rounds 16 to 30 on a new stretch of the Road, with a Warden at 20, 25 and 30. Six Wardens in two sets of three: The Dawn, The Umbra, The Clockwork (a 90-second countdown), The Expanse, The Maelstrom and The Hollow.
- **Six new endings:** Firmament I and II per path. Nine ending cards, hints for the locked ones, completion marks for all nine.
- **Mythic dice:** Light, Darkness, Time, Space, Chaos and Void, a new rarity. Each Warden's first defeat unlocks its die in Firmament shops; one of each per run.
- **Warp:** a Warp die does not count toward the dice cap (at most 3). Space always has it; the Warp Seal gives it; Firmament offers sometimes carry it.
- **Chrono and Kairos:** the old Chrono is Kairos; the new Chrono (the Horologist) rewinds the whole table on a 1 and keeps the better pool.
- **Entropy and the d100 path:** beating all six Wardens teaches Entropy. Aether, the Mythic dice and Entropy grow past d20 in the Firmament, up to d100.
- **New keepers:** Atlas's Cartography (Redraw, Add a path, Peek), the Horologist's Clockwork (Chrono, Stopwatch, Time Capsule), Mote's Pantry (buys at 150%, an appetite meter and a secret stock), the Astral Exchange. Tobb, Aeris and Nix follow their paths through the door.
- **Story scenes:** before every final battle and gauntlet stage, the Primordial die's loan, the visions and the recipes scene (achievement: Remembering), the Crossroads, each Warden, Mote's first words, the follower's arrival, Entropy. Skippable and replayable from the Endings tab.
- **Music:** themes for the six Wardens, the three new shops and two story scenes.

### Alpha v0.6.7 "Showtime" (in development, unreleased)
- **A Jukebox:** every song in the game, playable and editable (Options, Audio, Open the Jukebox).
- **Scoring choreography:** the cast follows the Cast ledger step by step. Each step lights its source (a die lifts, a reaction draws a line between its two dice, a set is outlined and named, a relic or pact bounces), pops a number (blue Base, red Mult, a bigger red multiplier) that flies into the Base or Mult box, which pulses and ticks up, and shows a caption saying who is doing what.
- **Sound:** each step ticks higher than the last, with a heavier hit for multipliers.
- **Settings:** Instant skips it; Reduced motion keeps the numbers and captions and drops the flying and shaking.

### Alpha v0.6.6 "Loose ends" (in development, unreleased)
- **The d5:** a new die size between d3 and d6. Shop dice now come in d3, d5, d6, d10 and d20, each rarer and pricier than the last, with the bigger sizes showing up later in a run.
- **New Chisel:** splits a die in two of the next size down; a d5 chips into a d3 and a Transmute; a d3 is too small; 3 Shards.
- **Varuna is gentler:** 1s come up 50% more often instead of every die becoming a 1, in her drawback and in her trial.
- **Fixed:** Kindling no longer hands out rerolls for forced 1s (only a die that really fizzles pays one back). Masquerade and Chameleon roll with the abilities they borrow. Item descriptions and hover cards always appear on top.
- **Saves** now pick up the latest relics and consumables.

### Alpha v0.6.5 "Polish" (in development, unreleased)
- **Shop dice are d3:** dice bought in the shop arrive as d3, and the offers show the d3 shape.
- **Three levels of detail for dice:** hover shows the name, type, families and current score; click (which still holds or releases the die) opens a short description with a bit of lore; click and hold, right-click or the Info button opens the full description. The table, shop, inventory and Gallery share one component.
- **Keyword tags:** #Explodes, #Fizzles and friends, each with a one-line definition on hover or tap.
- **New short descriptions** for every die, and numbers, element names, Base, Mult and Shards colored the same everywhere.
- **Compact Cast ledger:** repeated lines are grouped, the cast steps once per group with the count ticking up, and Expand all brings back every line.
- **Show live total:** a new option, off by default; the Score reads "?" until you cast.
- **New roll animation:** a toss arc with 3D spin, two bounces, a ground shadow, a landing burst per element, heavier d20s, a cascade across the pool, and landing sounds.
- **Explosion chains play out** face by face with a "+N" and a growing "xK", and a look for each exploding die.
- **Drift and lock animations:** a gust and an arrow for Drift; chain links and a clicking padlock for locks, with a look per Water-family die.
- **Relics and pacts react** while the score is added up, with a bounce and a floating "+N Base" or "x Mult".
- **Loadout stake badges and Cataclysm stars:** one flame per difficulty under each loadout, a gold star on dice that beat Cataclysm, and no "Cleared" chip on the difficulty card.
- **Cleared sash:** a green corner sash on the loadout panel replaces the old tag.

### Alpha v0.6 "Three Paths" (in development, unreleased)
- **The three paths:** the Accord locks a path when you walk into round 15. Neutral fights the Primordial as before; the Split path faces Primordial Unbound (target x1.5, it fuses your pure dice as you reroll); the Primordial path is a four-stage gauntlet of the gods, with the lent Primordial die absorbing each one.
- **God visions:** the first Neutral win shows Gaea, Ognen, Varuna and Zephyr and teaches their recipes, opening both new paths.
- **God dice:** Gaea, Ognen, Varuna and Zephyr, a new Divine rarity, forged from 4 pure dice, one at a time.
- **New relics:** Chain Break (Fire explodes on its top two faces, uncaps Ognen) and Pantheon (a second god, Bazaar only).
- **Endings:** three ending cards, an Endings tab in the Gallery, and completion marks per loadout.
- **Hints:** Pip at round 14, the Primordial's line in round 15, and a tinted arena on the Split and Primordial paths.

### Alpha v0.5 "Allegiance" (in development, unreleased)
- **New Nix pacts:** Gambler's Oath, Hollow Crown, Shadow Twin, The Long Night, Bound Tongue.
- **Betrayal pacts:** Broken Vow, Unspoken Prayer, Stolen Breath, Severed Grace, offered when you hold the Aeris blessing they break.
- **New Aeris blessings:** Plenty, Ember-ward, Clarity, Communion, Grace.
- **Pact symmetry:** blessings cost Shards after one Nix pact, an item after two, and Aeris is gone after three; Shrines ahead on the Road thin out or vanish, and walking away from a Black Market invites one back.
- **The Accord:** a hidden lean toward the Primordial or the Split starts recording; Aeris and Nix comment on a strong lean.
- **New arcane dice:** Bullion, Masquerade, Chameleon.
- **Balance:** Aether 64, Gilded Common, Mirror and Beacon Rare, Prism Epic (25), Upgrade Stone Epic, Conduit doubles its bridged reactions, Chrono rerolls a 1 until it isn't one.
- **New-run screen:** a loadout carousel and a one-at-a-time difficulty picker.

### Alpha v0.4 "The Road" (in development, unreleased)
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
- **Boons as icons:** active blessings and pacts show as a row of icons with a status dot during rounds and in shops; click one for the details. Run Info and the run summary keep the full list.
- **Safety camp:** missing a round now shows a centered screen over the dimmed table, then Tobb's camp: a few free Shards and a small shop before you try the round again.
- **Tumbling dice:** dice now hop and turn when they roll. Options has "Dice roll animation: Tumble / Classic" (Reduced motion uses Classic).
- **Element effects:** every die has its own little animation (flames, drips, wind, pebbles, sparks, frost, glints and more), so similar colors are easy to tell apart. Toggle it under Options, Display.
- **Picking dice up:** in the shop, dragged dice lift and tilt under your cursor while the others slide aside, and dice wobble when you hover them.
- **A real load screen:** continuing a saved run now shows the whole picture: stakes, lives, Shards, a round-by-round progress strip, your dice, relics and items (click to inspect), the Road ahead, active boons and the bosses you've beaten.
- **What's new:** a patch notes screen on the main menu and in Options, with every version. A NEW chip appears when there's a version you haven't read.
- **Credits:** The Binding of Isaac joins Balatro and Ultrapool as an inspiration.

### Alpha v0.3 "Beta feedback" (2026-09-28)
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

### Alpha v0.2 "Juice and depth" (2026-09-27 to 2026-09-28)
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

### Alpha v0.1 "MVP" (2026-09-27)
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

**Status: Built** (v0.4)

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

**Status: Built** (v0.4)

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

**Status: Built** (v0.4)

- **Note:** dragging dice in the shop shows the browser's drag image (a PNG ghost), which looks cheap. Dice also have no hover animation; they could rotate or roll.
- **Proposal:**
  - Replace native HTML5 drag and drop in `ShopScreen.jsx` with pointer-based dragging (framer-motion `drag`, or `Reorder` per row). The picked die lifts (scale up, slight tilt, drop shadow), follows the pointer, and the other dice slide aside.
  - The shop inventory is a wrapping grid, and framer's `Reorder` only supports one axis. Use a custom grid reorder: compute the target slot from the pointer position, and animate the others with `layout`.
  - Hover: a small wobble or a quarter-turn spin (reusing `utils/motionPresets.js` `juicyHover`), and maybe a quick mini-roll on hover.
  - Keep Reduced motion support.

## E6. A real rolling animation

**Status: Built** (v0.4)

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

**Status: Built** (v0.4)

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

**Status: Built** (v0.4)

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

**Status: Built** (v0.5). Completion marks on the dots arrive with B2 (v0.6).

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

**Status: Built** (v0.4). Backups include `elementa-seen-version` (confirmed: `utils/backup.js` exports every `elementa-*` key).

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

# Part F: Alpha v0.6.5 "Polish" (Carlos's v0.6 playtest notes)

Carlos's playtest of Alpha v0.6, 2026-10-03. The numbers P1 to P18 match the numbers in his note. **Status key:** Built (done on branch `elementa-v0.6.5`), Ready (build it), Proposed (needs Carlos before building).

## Already done

- **P1 Built: dice bought in the shop are d3.** `BUY_DIE` creates a d3 (`SHOP_DIE_TIER` in `engine/gameReducer.js`), and the shop offers show the d3 shape and read "Fire d3". Starting dice, forged dice and Soul Die stay d6. **Interaction to remember:** with d3 shop dice, the old Chisel (shrinks a d6 to a d3) loses its point, which is part of why P2 needs a redesign.
- **P13 Built: symbols on d3 are centered.** A lone element mark on a d3 sits at the triangle's centroid (`dieIconY` in `components/DieSprite.jsx`), not on the face-number line.
- **P17 Built: the cleared tag is a corner sash.** `ClearedSash` in `components/TitleScreen.jsx`: a green pixel band across the top-right corner of the loadout panel that stamps in. The old chip under the card is gone. The difficulty card still has its own "Cleared" chip until P16 replaces it.
- **P18 Mostly done: the extra folder.** `Portafolio-v0.5` was a git worktree the agent made on Claude's instruction, so a playtest could run undisturbed while work continued. All work now lives in the main folder on branch `elementa-v0.6.5` (created from the v0.6 tip). **Left for Carlos:** stop the dev server running in `Portafolio-v0.5`, then run `git worktree remove ../Portafolio-v0.5` from the main folder. The branch `elementa-v0.5` stays as history. The agent must not recreate it (see the rule at the top).

## P2. Chisel redesign, and a possible Flask consumable

**Status: Built** (Alpha v0.6.6, with Carlos's answers). Flasks and grinding a d3 stay parked in `IDEAS.md`.

- **Carlos's answers (2026-10-04):** add a real **d5**; the shop sometimes offers d5, d6, d10 and d20 dice, which are pricier and progressively rarer; **Chisel does not work on a d3**; grinding a d3 into an item (an Estus-like idea) is not decided, keep thinking.
- **Built:**
  - Sizes are now d3, d5, d6, d10, d20.
  - Chisel is Common, 3 Shards, and splits: d20 into two d10, d10 into two d5, d6 into two d3, and a d5 into a d3 plus a Transmute of its element.
  - Shop dice come in sizes (weights, unlock rounds and premiums are in `SHOP_DIE_SIZES`).
- **Still open:** Flasks (refillable consumables), and what a d3 could be ground into. Both live in `IDEAS.md`.

## P3. A richer rolling animation

**Status: Built**

Carlos: the Tumble animation is on the right track but only rolls the icon left and right; give it more flare. Improve `components/Die.jsx`'s Tumble (keep the Classic option, and Reduced motion forcing Classic):
- **A toss arc.** The die lifts off, spins with real 3D rotation (CSS `perspective` with `rotateX` and `rotateY`, not just a horizontal flip), and lands with two diminishing bounces. Keep the total duration near today's so rerolls don't feel slower.
- **A ground shadow** that shrinks as the die rises and grows as it falls.
- **A landing burst by element:** Fire sheds embers, Water splashes, Air swirls, Earth puffs dust, Lightning sparks, and so on, reusing the particle code from `components/ElementFx.jsx`.
- **Weight by size:** a d20 lands heavier (longer settle, slightly bigger shadow, a tiny table nudge) and a d3 lighter.
- **A face that slows down:** the number flickers fast while spinning, then ticks slower and slower before it lands (ease-out ticks).
- **A cascade:** dice start 40 ms apart, left to right, so the pool ripples instead of moving in lockstep.
- **Sound:** a soft landing tick per die, pitched by size (a small extension to `utils/sound.js`).

## P4. A compressed cast ledger

**Status: Built**

Carlos: the Cast ledger gets crowded when the same effect repeats. In `components/CastLedger.jsx`:
- **Group repeated lines** by source and kind: "Kindle x6  +6 Mult" instead of six rows. Keep the order of first appearance.
- **A small expand arrow** on each group shows the individual lines.
- **The cast reveal** (`components/DiceTray.jsx` `buildReveal`) steps once per group, with the count ticking up ("x1", "x2", ...), instead of once per line. Dice score popups stay per die.
- **A ledger-wide "Expand all / Compact"** control, stored with the other display options. Compact is the default.

## P5 to P9 and P15. One description system, three levels of detail

**Status: Built.** This is the largest item. Carlos's goal: players should not need to read a novel to understand a die, but everything must still be available. The table (the circle), the shop, the inventory and the Gallery all use the same system, and the numbers look the same everywhere.

**The three levels** (apply to dice; relics, consumables and bosses reuse the same component, with their existing short text as level 2):

1. **Hover (basic information only):**
   - Name (for example Lightning).
   - Type: "D6".
   - Families as colored chips (Air, Fire), the same chips as E2's `FamilyTag`.
   - **Score:** the die's current contribution, shown as an important number, not a plain line: a small "SCORE" label with a large gold pixel-font number and an ink shadow, like the family chips are important. It reads "?" under Eclipse.
   - Nothing else. No description.
2. **Click (short description):**
   - Clicking still holds or releases the die, exactly as today (on the table; in the shop it opens the inspector).
   - It also opens a small popover with the **short description**: one or two short sentences, with a bit of lore, and the **keyword tags** (below).
   - A footer line: "Hold for more, or see the Gallery."
3. **Click and hold (full description):** pressing for about 450 ms opens the full description, the same content as the Gallery's die detail.
   - It must **not** toggle the held state.
   - It stays open until you click outside or press Esc.
   - Also reachable by right-click, and by an "Info" button inside the short popover, so touch and keyboard players can get there.

**Keyword tags (Carlos's example):** a fire die shows `#Explodes` and `#Fizzles`, and Lightning would add `#Kindling`. Each tag is a colored chip. Hovering or tapping a tag shows a one-line definition ("Fizzles: a die that rolls a 1 scores nothing this round").
- Keywords live in a new `data/keywords.js`: `{ id, label, color, definition }` per keyword, bilingual.
- Start with: Explodes, Fizzles, Kindling, Drift, Patience, FreeLock, Refund, Sets, Wild, Reaction, Copy, Mirror, Chain, Divine.
- The full description lists every keyword the die uses, with its definition.

**Short descriptions with a little lore (P9):** rewrite the short text of every die so it says what the die does in a few words, with a touch of the world's lore.
- **Rules:** at most two short sentences, no stacked numbers, plain words. The long flag-by-flag text moves to the full view.
- **New file:** `data/diceText.js` (bilingual), one entry per die: `{ short, tags: [...], full }`. Cover every die in `ELEMENTS`, including the gods, the Primordial die, Bullion, Masquerade and Chameleon.
- **Tone examples (not final copy; Carlos will rewrite):**
  - **Fire:** "A spark from the first Split. It explodes on its top face, but a 1 burns it out." `#Explodes #Fizzles`
  - **Water:** "It remembers every shape it has held. It locks for free and gives a reroll back." `#FreeLock #Refund`
  - **Lightning:** "A Storm's first word. It explodes like Fire and calls sets like Air." `#Explodes #Fizzles #Sets`
- **Compress the forged dice (P6):** the forged dice (doubles, triples, Aether, the gods) are too long for play. Their short text names the one idea that defines them. The full flag-by-flag text stays in the full view and the Gallery.

**Matching shop and table, with numbers in yellow (P15):**
- **One shared component** (for example `components/RichText.jsx` plus `components/DieInfo.jsx`) renders descriptions in the shop inspector, the inventory, the table tooltip and popovers, and the Gallery. It replaces today's separate `highlightDescription` in `components/ItemInspector.jsx` and the plain tooltip text in `components/Die.jsx`.
- **Numbers and units are gold** (as the shop shows them now: `+2`, `x1.5`, `50%`), element names use their element colors, and keywords are tag chips. Same look in every place.
- **Check every relic, consumable and boss text** against the same rules, and shorten any over about 120 characters (the full text still shows on hold).

## P10. Hide the running total until you cast

**Status: Built.** Carlos asked what Claude thinks: **good idea.** It gives a cast the tension Balatro's scoring has. Players still see Base and Mult and the ledger, so they can do the math; the payoff is the reveal.

- **New option:** "Show live total" (`utils/settings.js`, Options > Display). **Off by default.**
- **When off:**
  - Before casting, show Base, Mult and the Cast ledger as now. The big Score number is replaced by "?", and the target bar sits empty (it still shows the target).
  - On cast, the score is revealed **step by step** as the ledger lines light up, and the target bar fills little by little alongside it. This already works in the reveal code (`reveal.base * reveal.mult`); it just needs the pre-cast state hidden.
  - Applies to the preview only, never to the final verdict.
- **When on:** exactly today's behavior.
- **Interactions:** Eclipse (faces hidden) already shows "?" and keeps working. The tutorial text that mentions the score preview needs a short rewrite for the default-off case.
- **Double cast** (items, dice or pacts that let you cast twice) is a good follow-up, but needs its own design. It is parked in `IDEAS.md`.

## P11. Real explosion animations

**Status: Built**

Carlos: explosions should be clearer, an actual animation so the player sees how they chain, different for each Fire-family die (Lightning thunders, Fire explodes, and so on).
- **Engine:** `rollDie` in `engine/scoring.js` currently returns only the total and the explosion count. Add a `chain` array (the faces rolled in order, for example `[6, 6, 4]`) to the returned die, so the UI can replay the chain. Older saves without it fall back to the count. Gameplay does not change.
- **Replay:** when a die lands on its max face and explodes, show each step in turn:
  - A burst on the die.
  - The face re-rolls visibly into the next value.
  - A "+N" chip, and an "x2", "x3" counter that grows in intensity.
  - The whole chain takes at most about 1.2 s, even for long chains (speed up for long chains).
- **Per-die flavor** (small, reusing `ElementFx.jsx`):

| Die | Explosion |
|---|---|
| Fire | Flame burst and embers |
| Lightning | Forked bolt, a quick white flash |
| Steel | Sparks, a metal flash |
| Steam | A cloud puff |
| Storm | A thunder cloud and a flash |
| Obsidian | Shattering shards |
| Magma | A lava splash |
| Aether | A radiant ring |
| Ognen | A pillar of fire |

- **Sound:** a short boom per explosion, rising in pitch along the chain.
- Honors Reduced motion (one simple flash) and the existing screen-shake option.

## P12. Drift and lock animations

**Status: Built**
- **Drift:** an air animation: a gust sweeps across the die, the face number ticks up or down with an arrow, and wind streaks drift off. Varies a little for each Air-family die (Lightning adds a spark, Crystal a glint, Zephyr a heavier gust).
- **Locking:** a chain animation: pixel chain links wrap around the die and a lock clicks shut. Per family: Water ripples, Ice frosts over, Mud clamps thick, Steel clangs, Monsoon swirls. Frozen dice (Petrify) keep their ice effect.
- Both honor Reduced motion (a simple highlight instead).

## P14. Relics and pacts react while the score is added

**Status: Built**

Carlos: when an item does something during score calculation, show its reaction.
- During the cast reveal, when a ledger line comes from a relic (`kind: 'relic'` with an `id`), that relic's icon in the round HUD plays a short trigger animation: a bounce and a glow, plus a floating "+N Base" or "+x Mult" chip above it.
- The same for **Boons and pacts** that change scoring, such as Blessing of Communion (E1's icons).
- Needs a stable way to find the icon: add `data-relic-id` and `data-boon-id` attributes in `components/RoundHUD.jsx`.
- The grouped ledger (P4) triggers the animation once per group, with the group's total.

## P16. Per-loadout difficulty badges, and Cataclysm stickers

**Status: Built**

Carlos: the difficulty picker should not have a "Cleared" tag. Under each loadout, show badges for which difficulties you have beaten that loadout on, like Balatro's deck stickers. Also add a sticker, as a reward, to the dice in the Gallery that you used to beat Cataclysm.
- **Data:** record wins as loadout x difficulty pairs in the profile, for example `profile.wins = { [deckId]: [difficultyId, ...] }` (`utils/saveManager.js`, `utils/profile.js`, and the run-end bookkeeping in `ElementaGame.jsx`).
  - **Migration:** the old profile only has two separate lists (`decksBeaten`, `difficultiesBeaten`). For each beaten loadout, assume it was beaten on every difficulty in `difficultiesBeaten` (generous, since the pairing cannot be known). Keep the old fields working so unlocks do not break.
- **Loadout card:** a row of small stake badges under the loadout, one per difficulty (a flame in its color, bright if beaten with this loadout, dim otherwise), with a tooltip. Keep the corner sash (P17) for "beaten on any difficulty".
- **Difficulty card:** remove its "Cleared" chip.
- **Cataclysm sticker:** when a run is won on Cataclysm, record every die element in the final pool as `profile.cataclysmDice`. In the Gallery's Dice tab, those dice show a small gold sticker (a pixel star) with the tooltip "Beat Cataclysm with this die". It counts toward nothing; it is just a reward. (Carlos wrote "Calamity", meaning Cataclysm.)

## Patch notes for this release

Add "Alpha v0.6.5 Polish" to Part D and `data/patchNotes.js`, in plain language: d3 shop dice, the three-level descriptions with keyword tags, the compact ledger, the hidden live total option, explosion, drift and lock animations, relic reactions, loadout badges, the cleared sash, and the new roll animation. Bump the in-game version tag.

---

# Part G: Playtest round 2 (the v0.6.5 playtest, 2026-10-04)

Carlos's notes from playing Alpha v0.6.5, numbered Q1 to Q5.

## Q1. Item descriptions appear behind things

**Status: Built** (Alpha v0.6.6). Cause: popovers lived inside their item's cell, so a later sibling with its own layer could cover them. Now every popover and hover tooltip is drawn in a portal on top of the game (`components/useFloating.js`), flips and clamps near screen edges. GDD §34.

## Q2. Varuna is too punishing, and reroll exploits

**Status: Built** (Alpha v0.6.6).
- **Varuna:** now "1s come up 50% more often" (drawback and gauntlet trial). The old rule (every die becomes 1, held and locked too) made it impossible to roll anything else once a 1 appeared.
- **The exploit Carlos found:** that same forced-1 rule ran before the Kindling check, so every Fire die counted as a fizzle and paid a reroll, which fed Patience. Fixed at the root. A cap of 3 rerolls a round on Kindling was tried and then removed on Carlos's request (2026-10-03): it stays uncapped, so a pool of several small Fire dice earns back about a reroll per reroll, on purpose.

## Q3. Chrono does not always rewind a 1

**Status: Built as far as it could be found** (Alpha v0.6.6). Real inconsistency found and fixed: Masquerade and Chameleon scored with the borrowed abilities but rolled with their own, so a copied Chrono never rewound and a copied Fire die never exploded. **Carlos's answer (2026-10-03):** the real wish is that Chrono rerolls the whole pool, not only itself (his plan: Chrono plus small Fire dice for a lot of explosions). That is now designed in Part H4: the new Chrono rewinds the pool, and the old one becomes its brother Kairos.

## Q4a. Story beats before every big fight, and better god visions

**Status: Built** (Alpha v0.7, GDD §37; drafts only, Carlos rewrites the words). Carlos: fighting without understanding why, and being handed a new die without a reason, felt anticlimactic. The visions at the end of a Neutral win need to be more solid and give context. Telling the player they unlocked the Aether and god recipes should be its own scene, with an achievement.

- **A story scene component** (`components/StoryScene.jsx`), full screen: a tinted backdrop, a portrait (a `BossAvatar`, a keeper sprite or a god die token), lines that type in, "Continue" and "Skip" (skipping is remembered per scene, and a scene can be replayed from the Gallery's Endings tab). Bilingual. A music cue per scene using the existing themes. No new art.
- **Scenes (draft text written by the agent, marked as drafts):**
  1. **Before Primordial on each path.** *Neutral:* the Primordial wakes and says who it is: the dreamer, what the Split took from it, why it wants the Casters' dice. *Split:* it knows you chose to keep it divided; it fights to take its dice back. *Primordial path:* it does not fight you, it asks you to bring the four back to it; the gods stand in the way.
  2. **Before each gauntlet stage.** The god speaks for a few lines: who they are, why they split the Primordial, what they want of you.
  3. **When the Primordial die is lent to you:** a short scene explaining what the die is and that it grows as each god falls.
  4. **After a Neutral win, the visions:** a longer sequence, one card per god (Gaea, Ognen, Varuna, Zephyr) with their portrait and a lore line each, then the Primordial's last words about "the four who broke me".
  5. **The recipes scene:** a separate scene right after, explaining that the Aether recipe and the four god recipes are now known and how each is made (forge, 4 pure dice, one god at a time). It ends with a toast and a new achievement, **"Remembering"** (learn the recipes). Add it to `data/achievements.js` and the Gallery's Achievements tab (counts toward completion).
- **Rules:** a scene never blocks the run for long (every scene is skippable, and none needs more than about 20 seconds read normally); scenes only show the first time unless replayed; all text in `data/story.js`, bilingual, easy to rewrite.

## Q4b. Full cinematics, 3D item sprites, more interesting items

**Status: Agreed for Beta v0.1** (Carlos: not needed now, not a bug, but we definitely need to improve it).
- **Animated cinematics** for the same moments as Q4a: motion (camera moves, parallax, particles, dice and portraits animating), replacing the text-card scenes.
- **Item sprites that look "3D" like the dice:** relics and consumables drawn with a shaped body, rim light and shade like `DieSprite`, instead of flat tiles (Carlos draws the art; the placeholder pass can add the shading).
- **More interesting items:** Carlos likes hunting for synergies. More relics, consumables and dice with unusual effects, built around the existing systems (Part B9, `IDEAS.md`).

## Q5. Scoring choreography, like Balatro

**Status: Built** (Alpha v0.6.7 "Showtime", GDD §35). Carlos: the explosion animations are nice, but the mult and interactions need clear animations that tell the player who is doing what; order matters, and it should follow the cast ledger, not just show a list.

- **One rule: the order is the ledger's order**, step by step: each die left to right adds to Base, then flat Base bonuses, then reaction Base, then explosions' Mult, the set, reaction Mult, relics, and the final multiplier. Every step does the same four things, together:
  1. **The source lights up.** A die gets an outline and lifts a little; a relic or pact bounces (already built in P14); a reaction draws a bright line between its two dice; a set outlines every die in it with its name ("Pair", "Straight").
  2. **A number pops from the source.** Blue "+N" for Base, red "+N" for Mult, a bigger red "xN" for a multiplier. It flies into the Base or Mult box.
  3. **The destination reacts.** The Base or Mult box pulses and its value ticks up as the number lands. A multiplier shakes the Mult box and flashes it.
  4. **A caption says who.** One line under the score, for example "Kindle: Fire + Air, +1 Mult" or "Beacon: x1.5 on both neighbors".
- **The ledger row lights in sync** (already does), grouped rows (P4) pop once per group with the group's total.
- **Pacing** follows the existing scoring speed option; Instant skips choreography and shows the result.
- **Sound:** a short tick per step whose pitch climbs through the cast, like Balatro, and a heavier hit for multipliers.
- **Reduced motion:** the number pops and captions stay, the flying and shaking go.
- **Where:** mostly `components/DiceTray.jsx` (`buildReveal`, the reveal timeline) and `components/Die.jsx`, `CastLedger.jsx`, `RoundHUD.jsx`; the data for each step (which dice, which source) is already in the scoring result's `baseLines` and `multLines`.

---

# Part H: Alpha v0.7 "The Firmament"

**Status: Built** (Alpha v0.7, GDD §37, branch `elementa-v0.6.5`). Built from Carlos's answers of 2026-10-03 and Claude's specs for the gaps. Items marked **Open** were built with the default given and are still questions for Carlos (listed in the build report and in GDD §37). Read B2, B4, G Q4a and the v0.6 section of GDD.md (§32) first; the paths, endings and gauntlet code from v0.6 are what this builds on.

**Do NOT build here:** Constellations, Runes, Seren (v0.7.5); poker, Joker or sigil dice (v0.7.5, v0.8.5); number dice; editable faces; Laws; the third realms; the fourth place; the true ending. Do not touch anything in `IDEAS.md`.

**Build order** (commit after each, and keep the game playable throughout): H8 data and profile, H3 and H4 and H5 dice, H1 the Firmament run structure, H2 Wardens, H6 shops and keepers, H7 story scenes, then tests and docs.

## H1. The door, the run, and the endings

**Status: Built** (Alpha v0.7, GDD §37).

- **A door per path.** A path's door opens when that path's Elementa ending has been seen once on the file (`profile.endings` holds `neutral`, `split`, `primordial`). Because the first run is always Neutral, the Neutral door is open from the second run on.
- **The Crossroads.** After the round-15 final battle is won on a path whose door is open, a new phase `crossroads` replaces the straight jump to the summary: a story scene (H7), then two choices, **Enter the Firmament** or **Rest here** (the run ends with the usual summary and the Elementa ending). Without an open door nothing changes from v0.6.
- **Continuing the run.** Entering keeps everything: dice, relics, consumables, lives, Shards, seed and path. Set `state.realm = 'firmament'`. Play the existing boss reward and then a first Firmament shop (a Market with Tobb), then round 16. Rounds 16 to 30 use the same target curve (`thresholdForRound`, nothing new). The Road is already generated in blocks of 15 layers (`engine/map.js`, `ensureLayers`), so the second block is the Firmament's: give it its own shop weights (H6).
- **Bosses at 20, 25 and 30** are Wardens (H2), not the normal boss pool. On Cataclysm every other round is still a boss round drawn from the normal pool (Cataclysm's rule), and 20, 25, 30 are the Wardens.
- **Two sets of three.** There are six Wardens. A path's first Firmament run faces its **Set I**; a later run faces **Set II**. Proposed assignment (Open: Carlos to confirm the Neutral sets):

| Path | Set I (rounds 20, 25, 30) | Set II |
|---|---|---|
| Split | The Dawn, The Clockwork, The Expanse | The Umbra, The Maelstrom, The Hollow |
| Primordial | The Umbra, The Maelstrom, The Hollow | The Dawn, The Clockwork, The Expanse |
| Neutral | The Dawn, The Umbra, The Clockwork | The Expanse, The Maelstrom, The Hollow |

  The Crossroads shows which set the door leads to ("Firmament I" or "Firmament II"). If both sets of that path are done, the player chooses.
- **Endings.** Beating the round-30 Warden wins the run with an ending card: `firmament_<path>_1` or `firmament_<path>_2` (six new cards, drafts in `data/endings.js`, bilingual, for Carlos to rewrite). Add them to `ENDING_IDS`, the Endings tab (nine cards plus hints for the locked ones), completion marks and the completion percentage. No Endless after a Firmament ending.
- **Run state:** `state.realm` (`'elementa'` or `'firmament'`), `state.firmamentSet` (1 or 2). Old saves default to `'elementa'`.

## H2. The six Wardens

**Status: Built** (Alpha v0.7, GDD §37).

Each Warden is a boss entry in `data/bossModifiers.js` (tier 4), with a `BossAvatar` color, a music theme (`boss_dawn` and so on, in `data/musicThemes.js`), and a Gallery entry (Bosses tab). Targets are the round's normal target times 1.0 for the round-20 Warden, 1.1 for round 25 and 1.25 for round 30 (Claude's default).

| Warden | Twist | Guards |
|---|---|---|
| **The Dawn** | Overexposure: dice showing their max face score 0 | Light |
| **The Umbra** | Faces hidden until you cast, and every reroll swallows one random unheld die for the rest of the round (it scores 0 and stays out) | Darkness |
| **The Clockwork** | A real countdown of **90 seconds** (Carlos's number; not optional). It runs only while the table is live and the game is not paused; at 0 the round casts whatever is on the table. Show it prominently | Time |
| **The Expanse** | The order of the dice shuffles after every reroll | Space |
| **The Maelstrom** | After every reroll one die that just rolled becomes a random pure element for the round (size kept; changed in v0.7.1 from every unheld die); the pool is restored afterwards | Chaos |
| **The Hollow** | Every relic is sealed and consumables cannot be used this round (Claude's default; the opposite of Void) | Void |

- **First time a Warden falls** on a file, its Mythic die joins `profile.mythics` and can be sold in later Firmament shops (H3, H6). Record every Warden beaten in `profile.wardens`. When all six are in, the **Entropy** recipe is learned (H5), with a scene and a toast.
- Each Warden speaks a few lines before its fight (H7).
- **The Firmament's last Warden is not the true ending** (Carlos). Do not build the old "your best cast x 1.5" boss here.

## H3. Mythic dice and the Warp tag

**Status: Built** (Alpha v0.7, GDD §37).

**Mythic** is a new rarity after Divine (a glow color distinct from the others; show it in the Gallery legend). The six dice have no element and no reaction elements, cost **45**, and arrive as a d6. **One of each kind per run** (no duplicates; Mirror Shard and Shadow Twin cannot copy them), which is what lets Entropy ask for all six.

| Die | Ability | Status |
|---|---|---|
| **Light** | No die can score below Light's face (a 1 becomes Light's face, fizzles are cancelled). Faces stay visible under Eclipse | Agreed |
| **Darkness** | The die on each side of it scores 0, and Darkness adds the combined score of those dice to your Mult, **undivided** | **Open:** Carlos wrote "the die on its left and right ... Change to which die, and it doesn't get divided". Built as both neighbors, undivided, behind one constant (`DARKNESS_DIVISOR = 1`). Ask Carlos what "change to which die" meant (the player choosing the target?). Balance note: a 20-point neighbor is +20 Mult |
| **Time** | Once per round, **Rewind**: undo your last reroll and refund it. Unused rerolls carry into the next round, up to +3 | Claude's default (Carlos did not comment) |
| **Space** | The dice on both sides of it and the two end dice all count as neighbors of each other (a super Conduit). Always carries the **Warp** tag | Agreed, plus Warp |
| **Chaos** | Every roll it becomes a random die from the whole game, in a random size. Locking keeps its current form | Agreed |
| **Void** | Scores nothing. Every empty slot you have (dice, relic, consumable) gives +1 Mult | Agreed |

- **Chaos implementation hint:** each roll picks a `chaosForm { elementId, tierId }` from every non-god, non-Mythic, non-Primordial die; extend `actingElementIds` so scoring uses it, and set `sides` to match. The die keeps `elementId: 'chaos'` for saving and display.
- **Darkness hint:** a scoring pass after the per-die pass zeroes the neighbors and adds their contributions to a Mult line named for Darkness (so the ledger and the P14 reactions show it).
- **Void hint:** "empty slots" = free dice slots (not counting Warp dice) plus free relic slots plus free consumable slots, read at cast time.
- **The Warp tag** (Carlos: "something like the Negative from Balatro", name to be workshopped; **Claude recommends "Warp"**, short and not confusable with the Space die; alternatives Rift, Infinite Space). An *edition* a die can carry, `die.edition = 'warp'`:
  - A Warp die does **not** count toward the dice cap (`maxDiceFor` compares against the number of non-Warp dice). At most **3 Warp dice** in the pool at once (Claude's default, one constant, `WARP_CAP`).
  - Shown as a violet "WARP" corner badge on the die and a line in its hover card and popover; `data/keywords.js` gets a `#Warp` tag.
  - **The Space die always has it.** A new **Legendary consumable, Warp Seal**, applies Warp to any die (not a Mythic die that already has it). It is very rare: Firmament shops only, weighted like the rarest Legendary.
  - Any die offer in a Firmament shop can rarely come with Warp (about 2%, Claude's default); a Warp offer costs +12.
  - **Future (IDEAS.md):** each Mythic die gets its own tag.
- **Where Mythic dice are sold** (Carlos): **the Firmament and after**, never in Elementa. A Firmament shop's die offers draw from the Elementa pool (every die from the previous realm still shows up, Carlos: "you can find dice from the previous dimension") plus any Mythic dice the file has unlocked (`profile.mythics`) and not yet held, at Mythic weight (about Legendary).

## H4. Chrono, Kairos and Time

**Status: Built** (Alpha v0.7, GDD §37).

- **Kairos** is the current Chrono (a 1 rerolls itself until it is not a 1), renamed. It stays in the Elementa arcane pool at its current rarity and price. **Save migration:** an existing die or shop offer with `elementId: 'chrono'` becomes `'kairos'` on `LOAD_RUN`.
- **Chrono** is new and lives in the Firmament (sold by the Horologist, Legendary, 30). Carlos: "I want Chrono to reroll the entire pool, not just itself" (his plan: Chrono plus small Fire dice for a lot of explosions; he accepts that it is powerful). Claude's design:
  - When Chrono lands on a 1 after any roll or reroll, **time rewinds: every unheld, unlocked die rerolls for free, Chrono included**, and **you keep the better of the two pools** (by round score). It repeats while Chrono still shows a 1 (at most 8 times, a safety stop). Held and locked dice stay put, so locks and Chrono work together.
  - Each extra roll goes through the normal roll rules (explosions, Kindling for fizzles). It never costs a reroll.
  - Implementation hint: after `rollFreshRound` or the reroll, call a `chronoRewind` that clones the pool, rerolls it with `rerollPool`, compares `evaluatePool(...).roundScore` for both, and keeps the higher.
- **Time** (Mythic) is different: a player-controlled undo (H3).

## H5. Entropy and the d100 path

**Status: Built** (Alpha v0.7, GDD §37).

- **Entropy:** a Mythic fusion of all six Mythic dice plus Aether (Carlos: "even if it doesn't make sense it would be fun to combine all of them"). Forge-only, price 300 in the Forge sense (a high Shard cost), scores its face + 104 and adds +10 to Mult, one per run. Its recipe is learned when `profile.wardens` holds all six Wardens (H2), like Aether's recipe lock (B6); reuse `recipes`.
- **Growth past d20:** Aether, the Mythic dice, the Primordial die excluded, and Entropy can grow in steps of 10: d30, d40, ... d100, through Upgrade Stones and the Forge's "grow a die" in Firmament shops. Normal dice still stop at d20. Add the tiers to `DICE_TIERS` flagged `bigOnly`; the upgrade cost of d30 to d100 equals the number of sides. Rendering: reuse the d20 shape with the size printed on the die; 3-digit faces need a smaller number font.

## H6. Firmament shops and keepers

**Status: Built** (Alpha v0.7, GDD §37).

- **Dice and items from earlier realms keep appearing** (H3). The legendary shop is called **Astral Exchange** in the Firmament (A1, Proposed; the shop type's name is per realm). Same stock rules as the Aether Bazaar.
- **New shop types** (each with a keeper, a `KeeperSprite` placeholder, a music theme, bilingual keeper lines in `data/keepers.js`, and its own entries in `data/shops.js`):
  - **Atlas's Cartography** (Atlas, cartographer): sells no goods. Three services per visit, each for Shards: *Redraw* the next row of shops, *Add a path* (link your stop to one more shop in the next row), and *Peek* (reveal the next Warden, like a Prophecy).
  - **The Horologist's Clockwork** (the Horologist): sells the Chrono die and two new consumables: **Stopwatch** (undo your last reroll and refund it) and **Time Capsule** (bank 2 rerolls for the next round).
  - **Mote's Pantry** (Mote): sells nothing; **buys** any die, relic or consumable at 150% of its sell value. Its appetite (`profile.mote.fed`, summed sell value on this file, across runs) fills in stages: at **40** it opens a secret stock (a Hollow Pact and a random die carrying Warp), at **120** a second tier, at **400** it is full (what that does is workshopped in A5 and **not built in v0.7**: only track the number and show the meter). Mote speaks for the first time in H7.
  - **Seren is not in v0.7** (Constellations are v0.7.5).
- **Path followers.** Each path gets one guaranteed shop of its follower per Firmament block, with true-form dialog: *Split*, Aeris's Shrine ("in her true form"); *Primordial*, Nix's Black Market ("the eclipse market"); *Neutral*, an extra Market with Tobb ("I go everywhere"). Tobb's Market still appears normally in every realm (Carlos).
- **Firmament shop weights** (`data/shops.js`, Claude's default): Market 30, Alchemist 10, Forge 10, Vault 8, Shrine 6, Black Market 6, Cartography 10, Clockwork 8, Pantry 8, Astral Exchange as the Bazaar rule (one per block, guaranteed before the Warden at 30).
- **Music:** add themes for `shop_cartography`, `shop_clockwork`, `shop_pantry`, the six Wardens, and the Firmament's scenes, in the style of `data/musicThemes.js` (Carlos can tune them in the Jukebox, `MUSIC.md`).

## H7. Story scenes

**Status: Built** (Alpha v0.7, GDD §37).

Build the scenes of Part G Q4a (all of them: before each path's Primordial fight, before each gauntlet stage, the Primordial die's loan, the improved visions, the recipes scene with the "Remembering" achievement), **and these new ones** (all drafts in `data/story.js`, bilingual, Carlos rewrites):
- **The Crossroads**, as the last Circle cracks and what lies past it ("something older, something that frames everything").
- **Each Warden's intro** (about 4 lines, spoken by the Warden: who it is and what it guards).
- **Mote's first words**, the first time its appetite reaches 40.
- **A path follower's arrival** (Aeris, Nix or Tobb) in the first Firmament shop.
- **The six Firmament ending cards** (H1).

## H8. Data and profile

**Status: Built** (Alpha v0.7, GDD §37).

- `profile.mythics` (unlocked Mythic dice), `profile.wardens` (Wardens beaten), `profile.mote = { fed }`, and new `recipes` entries (`'entropy'`). Migrate older files with sensible defaults. The doors are derived from `profile.endings`.
- `RARITY.MYTHIC`; `ELEMENTS` entries for the six Mythic dice, Entropy, Chrono (new), Kairos; `data/diceText.js` short texts and keywords for each; `data/i18n.js` Spanish; Gallery entries; `CONTENT.md` updated.
- Test saves: write `elementa-files-v2` files that stand at round 15 on each path with an open door so the whole Firmament can be reached without playing it.

## H9. Verify and report

**Status: Built** (Alpha v0.7, GDD §37).

- Node scripts: the Crossroads flow per path; Warden sets by path and by earlier endings; Mythic uniqueness and the one-of-each rule; the Warp cap and a Warp die not counting toward the dice cap; Void's slot counting; Darkness's neighbors; Chrono rewinding the pool (keeps the better pool, stops at 8); Kairos migration; Chaos forms scoring correctly; d100 growth; the Entropy recipe unlock; Mote's meter.
- Browser: click through a path into the Firmament (use test saves), a Warden of each twist (including the Clockwork's timer and pause behavior), the keepers' shops, the Gallery tabs, and Reduced motion.
- Report: what you built, how you verified it, every default you chose (list the **Open** items), anything skipped, open questions.

---

## Part I: v0.7.2 "Firmament depth" (spec, 2026-10-03)

**Status: Built (GDD §38).** From Carlos's v0.7 playtest notes 4 ("add more dice to the Firmament") and his Horologist question ("so it doesn't feel empty on a second visit"). Everything here is Claude's spec; tune after playtests. Do not build anything outside this part.

### I1. Celestial dice (new, Firmament only)

Five new dice, **sold only past the door** (Firmament Markets, the Astral Exchange, and the Horologist where noted), never in Elementa. They need no unlock. Tier: Arcane (no element, family tag "Arcane"), rarity Epic unless noted, base price 16 (Legendary 30). Not Mythic (Mythic stays "one of each, unlocked by Wardens"). Procedural placeholder art like every other die; each gets a keyword tag and a Gallery entry (they belong in the normal rarity groups, not the Unlocks box).

| Die | Rule | Notes |
|---|---|---|
| **Comet** | Explodes on its two highest faces. When it explodes it scores its total twice. | A burst die. Fire-family dice reward it; Varuna's 1-bias hurts it. |
| **Pulsar** | Every reroll this round adds +1 to its Base, up to +10. Resets next round. | Rerolls become a resource. Sold by the Horologist too. |
| **Satellite** | The dice on both sides count their face +1 (explosion chains unchanged). Does not score itself. | A support die, like Beacon but for faces. |
| **Quasar** | Its face goes to Mult instead of Base (flat, not multiplied). Max 1 per run. | Legendary. Pairs with high dice sizes. |
| **Zenith** | Held in the pool: +1 reroll every round and +1 more at round 20 and again at round 25. Scores its face normally. | Utility. Sold by the Horologist too. |

Rules: Pulsar and Satellite interact with Masquerade/Chameleon through `actingElementIds` like all arcane dice. They can grow past d20 only if they already can (they cannot; only Aether, Mythic and Entropy grow big).

### I2. The Horologist's pool

Today it always sells the same three things (Chrono, Stopwatch, Time Capsule). New rule: **each visit offers six things, drawn from a pool**, so it changes every time.

- **Dice (2):** Chrono is always one. The other is drawn from Pulsar, Zenith and Kairos (the old Chrono, never otherwise sold in the Firmament).
- **Consumables (3):** drawn from six (all `firmament: true`):
  - Stopwatch (exists)
  - Time Capsule (exists)
  - **Hourglass** (Uncommon): your next 3 rerolls this round do not use up a reroll.
  - **Pocket Watch** (Rare): pick a die; it starts next round held, on the face it shows now.
  - **Metronome** (Uncommon): for the next 3 rounds, +1 Mult on every cast.
  - **Almanac** (Rare): shows the next three targets and the next boss modifier (Pip's hint, exact).
- **Relic (1):** drawn from two time relics (Firmament only, Epic):
  - **Mainspring:** rerolls you do not use are banked for the next round, up to 3.
  - **Cuckoo Clock:** clear a round with 0 rerolls left to gain 5 Shards and +1 Mult for the next round.
- Prices as normal (rarity table; he gives no discount). No reroll of his stock (it stays `reroll: false`).
- Keeper lines: add three new Horologist lines for the second and third visits (EN and ES), drawn from his lore in the Keepers table.

### I3. Firmament Market and Exchange

The Celestial dice join the normal die pool in the Firmament: weight 1 each (Quasar 0.4), same size-by-round rules as other dice (they roll as d3/d5/d6... like the rest). The Astral Exchange offers one Celestial die guaranteed.

### I4. Also in this step

- Kindling note and Kairos check: Kairos must appear in no Elementa shop that Chrono used to be in unless it was before (leave as is); just confirm saves.
- Patch notes: Alpha 0.7.2 "Firmament depth" in Part D and `data/patchNotes.js`; CONTENT.md; GDD section; Gallery totals (`TOTALS`) updated.
- Tests: Node scripts for each new die's scoring, the Horologist's pool across 40 seeds (never the same six every time, always Chrono), and a browser pass on a Firmament test save.

## Part J: v0.7.5 "Constellations" (spec, 2026-10-03)

**Status: Built (GDD §39).** Carlos asked for this next because the Firmament is hard without it ("lets get the constellations on"). Claude's spec; tune after playtests. Scope: Seren, Constellations and Runes. Poker and Joker dice (B11) move to a later step (v0.7.6) so this one stays small.

### J1. Constellations

Firmament consumables that **permanently level one thing for the rest of the run**, like Balatro's planet cards. Used from the shop or the Run screen with no target (they apply at once); they are not dice, so no pool limit; they use no consumable slot if used the moment they are bought (the shop offers a "Use now" button), otherwise they sit in a slot like any consumable.

- **What levels:** the seven base reactions and the three set types. Secret reactions do not level.
- **Level cap 10.** Each level adds the amount below on top of the base effect.
- **Run state:** `constellations: { [id]: level }`, saved and loaded, shown in Run Info under a "Constellations" heading and in the Cast ledger ("Kindle Lv 3").
- **Price and rarity:** the ten are Uncommon, price 6; **Black Hole** is Legendary, price 25 (`stockWeight` 0.4): +1 level to every base reaction and set type.

| Constellation | Levels | Per level |
|---|---|---|
| The Phoenix | Kindle | +0.5 Mult |
| The Anvil | Forge | +2 Base |
| The Geyser | Scald | +2 Base, +0.25 Mult |
| The Cloud | Mist | +0.5 Mult |
| The Seedling | Bloom | +2 Base |
| The Whirl | Dust Devil | +3 Base |
| The Twins | Resonance | +2 Base |
| The Pair | Pair sets | +0.5 Mult |
| The Trio | Three of a kind | +0.75 Mult |
| The Ladder | Straights | +1 Mult |

Wire the bonuses where `findReactions` and the set-tier bonus are computed in `engine/scoring.js`, so every bonus appears as a ledger line and the cast choreography needs no special case.

### J2. Seren and her Observatory

- **Seren** (the astronomer): a keeper with her own sprite (procedural placeholder), lore lines (EN/ES, 3 per visit pattern like the other keepers), and the `observatory` shop on the Road, **Firmament only**, same weight as the Horologist.
- **Stock per visit:** four Constellations drawn by weight (Black Hole rare). Duplicates allowed. A reroll button (cost 3).
- **Everywhere else:** Constellations also appear, at low weight, in Firmament Markets and the Astral Exchange.
- **Music:** a new theme `shop_observatory` (calm, high, a pad; see MUSIC.md), and a Jukebox entry.
- **Gallery:** the ten plus Black Hole appear under Consumables (rarity groups). The Keepers tab gains Seren.

### J3. Runes (Part B9 item 3, simplified)

Permanent enchantments socketed into one die, sold at **Forge** shops (Elementa too) and in the Firmament Market. A die holds **one** rune (applying a second replaces the first). A rune is a consumable that targets a die, like Whetstone.

| Rune | Rarity | Effect |
|---|---|---|
| Rune of Echo | Epic | The die scores twice |
| Rune of Glass | Rare | The die's score is doubled, but each cast it has a 20% chance to shatter after scoring (the die is lost) |
| Rune of Kinship | Rare | The die counts as its left neighbor's element for reactions |
| Rune of Ember | Uncommon | The die explodes on its top two faces |
| Rune of Anchor | Uncommon | The die never fizzles |

Show a small rune glyph on the die, a line in its tooltip, and keywords. Runes cannot go on Mythic dice or Entropy. Chisel keeps the rune on both halves; Transmute removes it; Shadow Twin copies it.

### J4. Also in this step

- Patch notes "Alpha 0.7.5 Constellations" in Part D and `data/patchNotes.js`; CONTENT.md; GDD section; `TOTALS` and the Gallery; MUSIC.md for the new song.
- Achievements: "Stargazer" (own a level 5 Constellation), "Cartographer of Skies" (level 10), "Runesmith" (a die with a rune). Secret.
- Node tests: each Constellation's bonus in the ledger, Black Hole, level cap, save/load, each Rune, Glass shattering with a seeded RNG. Browser pass on a Firmament test save.

## Part K: v0.8 "Cosmic elements" (spec, 2026-10-03, second pass)

**Status: Built** (Alpha v0.8, GDD §40, branch `elementa-v0.6.5`). Workshopped with Carlos on 2026-10-03 (this is the corrected version after his second pass). Every **Default** below was built as written and is listed in GDD §40 and the build report. Claude fills the gaps with defaults, marked **Default** (Carlos can change any of them after a playtest). The agent reads this, B1 to B4, Part H (H3, H5, H6, H7) and Part J (Runes, which K3b changes). The third realms and the number dice (the old "Rewriting reality") are **not** in this step; they move to the end of the roadmap and need their own workshop.

### K1. Two layers: base elements (shops) and Mythic dice (forged)

**Status: Built** (Alpha v0.8, GDD §40).

- **Six new base elements, found in shops** like Fire, Water, Earth and Air: Light, Dark, Time, Space, Chaos and Void, as weaker dice. Working names so they do not clash with the Mythic dice (**Default**, Carlos can rename): **Glimmer** (Light), **Gloom** (Dark), **Moment** (Time), **Reach** (Space), **Flux** (Chaos), **Null** (Void). Firmament only (they join the shop dice pool the moment you cross the door), rare-ish weight, price 14, sized by round like other shop dice. They need no unlock. Each is a family, like Fire; fusions belong to both parents' families.
- **Draft abilities (Claude's spec, tune after playtests):**

| Base die | Ability |
|---|---|
| Glimmer | Its neighbors never fizzle. |
| Gloom | The die on its right scores 0; half of that score goes to Mult. |
| Moment | +1 reroll every round. |
| Reach | Reacts with the die two places away as well as its neighbors. |
| Flux | Becomes a random pure element each roll. |
| Null | Scores nothing; +0.5 Mult for every empty dice slot. |

- **The six Mythic dice** (Light, Darkness, Time, Space, Chaos, Void, abilities exactly as built in H3) **are forged, like the god dice, never bought.** Remove them from every shop pool, from the Astral Exchange and from Mote's secret stock.
  - **Recipe (file level):** beating a Warden in any run teaches the file that Warden's Mythic recipe (Dawn: Light, Umbra: Darkness, Clockwork: Time, Expanse: Space, Maelstrom: Chaos, Hollow: Void). This replaces "its die joins the shops"; migrate `profile.mythics` into `profile.recipes`.
  - **To forge one:** 4 slots of the same base die (for Light, 4 Glimmer) **plus 1 Stardust** (K2) and 20 Shards (**Default**, exactly the shape of a god forge, and Stardust is the new part).
  - Still one of each Mythic held at a time (`holdsKind`); Space keeps Warp. The Gallery keeps them in the Unlocks box until the file knows the recipe.

### K2. Stardust

**Status: Built** (Alpha v0.8, GDD §40).

- A **run resource** beside Shards (`state.stardust`, saved, shown in Run Info and the Forge).
- **Bosses drop it**: every boss defeated gives **1 Stardust**, and a Warden gives **2** (**Default**). It is spent only by forging a Mythic die.
- Vesper sells 1 Stardust per visit for 30 Shards (**Default**), so a run is never stuck. Mote's 120-appetite stock gives 2 Stardust instead of a die.

### K3. The Forge, rebuilt: slots, sizes, carry-over

**Status: Built** (Alpha v0.8, GDD §40).

Applies to **every Forge** (Elementa too).

- **Four open slots.** Click a die, then a slot (drag works too); click a placed die to take it back. Nothing is automatic: you choose exactly which dice are absorbed.
- **Recipes are read from what you place**, with a live preview of the result, its cost, its size and what carries over. No match says so. Unknown recipes (gods, Aether, Mythic dice) show "???" until learned, as today. A single recipe family can have several matches (a chooser appears).
- **Recipe shapes:** double fusion 2 slots, triple 3, Aether and gods 4 (as today), a **Mythic die 4 of one base die + Stardust**, an **element fusion 2 slots** (two different base dice, K4). **Entropy becomes 4 slots: Shadow, Continuum, Oblivion and Aether** (**Default**: the old 7-dice recipe cannot fit; it is still learned after all six Wardens have fallen).
- **Result size = the average size of what you absorbed.** Average the **size tier index** (d3 is 0, d5 is 1, d6 is 2, d10 is 3, d20 is 4, then the big sizes) and round **down**. Two d5 make a d5; a d3 and a d6 make a d5; two d10 make a d10 (Carlos wrote "2 d15"; there is no d15, so the d10 reading is used). A result that cannot grow big is capped at d20.
- **Upgrades carry over** (**Default**): Whetstone and Honing Oil bonuses add up across the absorbed dice; Warp stays if any absorbed die had it; growth counters (Sapling, Patience, Pulsar) reset. **Runes stay**, see K3b.
- The Fusion Spark and discount relics still work; the Forge shows the final cost. A fusion still adds +1 Accord (a Mythic forge adds nothing).

### K3b. Runes are inscribed on a number

**Status: Built** (Alpha v0.8, GDD §40).

Part J's Runes (Echo, Glass, Kinship, Ember, Anchor) change: **a rune now belongs to one face (one number) of one die**, and works only when the die lands on that number. A die can carry runes on several faces. Data: `die.runes = [{ id, face }]`; migrate an old `die.rune` to `{ id, face: die.sides }` (its top face).

| Rune | Effect on its number |
|---|---|
| Echo | When the die shows this number it scores twice. |
| Glass | When it shows this number the score is doubled, and there is a 20% chance the die shatters after scoring (the die is lost). |
| Kinship | When it shows this number the die counts as its left neighbor's element for reactions. |
| Ember | This number is an exploding face. |
| Anchor | When the die shows this number it cannot fizzle (useful on a Fire die's 1). |

**How a rune is placed (interactive, like the Forge):** use the rune item, pick the die, and a **Inscribe screen** opens with the die shown large. **Rotate it to the number you want** (arrow buttons, the left and right keys, or drag; faces that already hold a rune are marked) and confirm. A die with many faces (d30 and up) uses a number stepper (plus and minus one, plus and minus ten) as well. Inscribing on a face that already has a rune **replaces** it. Show a rune's number on the die and in its tooltip. Respect Reduced motion (no spin, just a fade).

**What the Forge does with runes:** all runes stay on the forged die, on the **same number**. Two cases need help:
- **A number clash:** two absorbed dice carry runes on the same number.
- **A shrink:** the result is a smaller die, and a rune's number no longer exists on it (that rune moves to the new die's top face, which can then clash).

When there is a clash or a shrink, **Brasa** (and **Vesper** in the Firmament) says so before you forge: *for an extra fee they can superpose the runes (both stay, stacked on one number), or forge as is and **one of them is lost**.* The fee is **8 Shards per clash** (**Default**). If you decline, which rune is lost is a **silent 50/50** with the run's seeded RNG: you cannot choose and are not told the odds. The preview shows only "one will be lost". The result card then shows what survived.

**Chisel:** each half keeps the runes; numbers that no longer exist move to the new top face, and clashes superpose for free (a consumable has no fee). **Transmute** removes runes; **Shadow Twin** copies them. **Gem Socket** (K6) lets a die superpose a second rune on an already runed number when you inscribe it (instead of replacing it).

### K4. Fusions of the base elements

**Status: Built** (Alpha v0.8, GDD §40).

Only **two-element fusions** (Vesper's rule, K5), made from two **different base dice** placed in the slots. Seven, curated (**Default** list; the other pairs wait):

| Die | Made of | Kind | Draft ability (Claude's spec; tune after playtests) |
|---|---|---|---|
| **Shadow** | Gloom + Glimmer | stable | The die on its left scores 0 and its score goes to Mult; the die on its right never fizzles and counts +1 on its face. |
| **Continuum** | Moment + Reach | stable | Joins the two ends of the pool into a ring (like Ley Line) and gives +1 reroll every round. |
| **Oblivion** | Flux + Null | stable | Each cast it swallows your lowest die (that die scores 0) and adds twice that die's face to Mult. |
| **Alba** | Glimmer + Moment | stable | Faces never roll below 2 (a floor of 2 for every die) and your first reroll each round is free. |
| **Anomaly** | Flux + Moment | volatile | After every reroll, one random unheld die rolls once more for free. |
| **Singularity** | Glimmer + Null | volatile | Scores nothing; the Base of both neighbors is doubled. |
| **Abyss** | Gloom + Null | volatile | Both neighbors score 0; every empty dice slot adds +2 Mult. |

- Each is Epic, belongs to both parents' families, has a procedural placeholder, a keyword tag and a Gallery entry (Unlocks box until its recipe is known). **Vesper teaches a fusion the first time you place its two parents** (a short line, no Warden needed).
- **Volatile fusions can collapse:** 25% (**Default**), shown in the Forge preview before you commit. A collapse consumes both dice and gives a **Dead Star** (usual size, scores nothing, +0.5 Mult for every other die in your pool). A **Catalyst** (K6) makes one fusion 100% safe. Stable fusions never collapse. (Black Hole is a Constellation name, hence Dead Star.)

### K5. Vesper, the Cosmologist

**Status: Built** (Alpha v0.8, GDD §40).

- A new keeper in the **same Forge shop** (and the Astral Exchange's forge) beside Brasa: a second portrait and her own lines, not a new Road stop. **Firmament only.**
- **Personality (Carlos):** mysterious, fun, we do not know much about her, and she is smart. Lines (EN and ES, three per visit pattern) playful, a little teasing, always knowing more than she says, never explaining where she is from.
- **First meeting scene:** she introduces herself, says the new elements are **dangerous**, and that for now she will only combine **two** at a time. She teaches fusions (K4), sells Stardust (K2) and the Catalyst (K6), and shares the rune warnings with Brasa (K3b).
- Procedural placeholder portrait (no AI art), a Keepers-tab entry, lore lines unlocking with visits.

### K6. Pip's scene and more die items

**Status: Built** (Alpha v0.8, GDD §40).

- **Pip's scene on crossing the door** (the first time on a file): this is a new realm, there are new elements (Glimmer, Gloom, Moment, Reach, Flux, Null), Wardens guard the recipes of the Mythic dice, Stardust is how you forge them. Two or three short pages, replayable from the Gallery like the other scenes.
- **More die items** (Carlos: "I've been really grinding for them and it's super fun"). Consumables that modify a die, Uncommon to Epic, sold where Whetstone and Chisel are (Elementa too, except where noted), each with a keyword, sprite and Gallery entry:

| Item | Rarity | Effect |
|---|---|---|
| **Weights** | Uncommon | The die's faces below 2 count as 2, for good. |
| **Honing Oil** | Rare | Like Whetstone, but +4 (adds on top of a Whetstone). |
| **Graft** | Rare | Pick a die with a rune, then another die: move that rune onto the other die, and rotate to choose its number (same Inscribe screen). |
| **Solvent** | Uncommon | Strips every upgrade from a die (bonus, runes, Weights) and pays back 5 Shards. |
| **Gem Socket** | Epic | The die can superpose a second rune on an already runed number (see K3b). |
| **Catalyst** | Rare | Firmament only (Vesper, the Astral Exchange). Placed in the Forge: one volatile fusion becomes 100% safe. |

### K7. Data, saves and the rest

**Status: Built** (Alpha v0.8, GDD §40).

- **Profile:** Mythic recipes in `recipes` (migrate `mythics`; keep it read-only for old files).
- **Run:** `stardust`, `die.runes`, a base-element family per new die. Old saves still load: a run holding Mythic dice keeps them; old `die.rune` migrates (K3b).
- **Mute the game for every test** (see the agent rules at the top).
- **Test saves:** update `tools/firmamentTestSaves.mjs` so the file knows every recipe and holds Stardust and some runed dice.
- **Gallery:** Unlocks box rules use "recipe known". Add Vesper to Keepers; new dice and items in their groups.
- **Scenes and music:** Pip's crossing scene and Vesper's first meeting; a short theme for Vesper's visits if possible (otherwise the Forge's), noted in MUSIC.md.
- **Docs and release:** GDD section, CONTENT.md, patch notes "Alpha 0.8 Cosmic elements" in Part D and `data/patchNotes.js`; mark Part K Built.
- **Tests:** Node scripts for the size rule (the four examples), carry-over (bonuses, Warp), each recipe from slots, the Mythic forge with Stardust, rune effects per face for every rune, a clash and a shrink with fee and with the seeded 50/50, Chisel and rune moves, a collapse with a seeded RNG (and Catalyst preventing it), Stardust from a boss and a Warden, the save migrations. Browser pass on a test save (muted): place dice in slots, see the preview, inscribe a rune by rotating, forge each kind.

**Open (Carlos can answer after a playtest):** base-die names; Stardust amounts (1 per boss, 2 per Warden; Vesper 30 Shards); forging a Mythic die (4 of a base die, 20 Shards); the collapse chance; the rune fee (8 per clash); a shrunk rune moving to the top face; whether Alba is stable; Entropy's new recipe; the Mythic dice leaving the shops entirely.

## Part L: v0.8.1 "Family growth" (spec, 2026-10-04)

**Status: Built** (Alpha v0.8.1, GDD §41, branch `elementa-v0.6.5`; every Default below was built as written and is listed in GDD §41 and the build report). Carlos (2026-10-04): "fire is super strong, the ability to explode is something else", so Water and Air grow to match, new relics and items push the families, and the six new elements get reactions. Claude's numbers are **Defaults** (tune after playtests). Do not nerf Fire. Everything here is Elementa-compatible except where it says Firmament.

### L1. Water: Tide

A **locked Water-family die also adds half its score to Mult** (**Carlos: half**, Default amount). Only locked dice, not held ones. A fusion in two families gets each family's ability. Show it as its own ledger line ("Tide +N Mult") and in the family text and the keyword.

### L2. Air: Drift reaches the top

Drift stays **one charge per round, one die**, but the nudge can now go **all the way to the die's top face** (**Carlos**): the player chooses "up or down by 1" or "to the top". The die then scores that face. Landing on the max face by Drift still does not explode (unchanged). Frozen dice cannot drift. UI: the Drift control gets a third button "To the top"; keyboard friendly.

### L3. Relics (five, Default rarities)

| Relic | Rarity | Effect |
|---|---|---|
| **Deep Current** | Epic | The first lock each round gives +10 Mult (Carlos's idea, scaled so free locks cannot give +80). |
| **Undertow** | Rare | Each locked Water-family die gives +2 Mult. |
| **Gale Seal** | Epic | When you use Drift, the nudged die's whole score also goes to Mult. |
| **Second Wind** | Rare | +1 Drift charge per round. |
| **Standing Stones** | Rare | Patience gives +3 per reroll sat out instead of +2. |

Each needs a sprite (existing procedural sprites), an `itemConcept`, Spanish text, a Gallery entry and a ledger line when it fires. Sold in the normal relic pool (round-gated by rarity as usual).

### L4. Totems (new consumables, both relics and items)

Four **Totems** level a family's ability **for the rest of the run**, like Constellations (cap level 5, apply at once, no target, `state.totems: { fire, water, earth, air }`, shown in Run Info and the ledger). Uncommon, price 8. Sold at **Seren's Observatory and the Firmament shops** like Constellations, and also in Elementa's Market at low weight (this is the first item that is not Firmament-only). They live under their own Gallery family "Totems" (not with the Constellations).

| Totem | Per level |
|---|---|
| Fire Totem | Kindling pays +1 reroll more every 2 levels; explosions add +0.1 Mult each per level (so Fire stays fun, not stronger than the rest) |
| Water Totem | Tide adds +10% more of the locked score to Mult (so half becomes 60%, 70%... up to 100% at level 5) |
| Earth Totem | Patience +1 per reroll sat out |
| Air Totem | +1 Drift charge per level (one die each) |

### L5. Reactions for the new elements

The six shop elements (Light, Darkness, Time, Space, Chaos, Void, ids `glimmer`, `gloom`, `moment`, `reach`, `flux`, `nil`) have no element today, so they react with nothing. Fix: `reactionElementsOf` returns the element's own id for them (a fusion of two of them returns both parents), and reactions can name them. Two groups:

**Cross reactions (new with classic, 12, curated "natural pairs").** Each is worth about a classic reaction.

| Reaction | Pair | Effect |
|---|---|---|
| Sunburst | Light + Fire | +2 Mult |
| Rainbow | Light + Air | +3 Base, +1 Mult |
| Ink | Darkness + Water | the higher face to Base |
| Cavern | Darkness + Earth | +4 Base |
| Erosion | Time + Earth | +1.5 Mult |
| Burnout | Time + Fire | +4 Base |
| Horizon | Space + Air | +3 Base, +1 Mult |
| Orbit | Space + Earth | the lower face to Base, +1 Mult |
| Wildfire | Chaos + Fire | +2 Mult |
| Whirlwind | Chaos + Air | +4 Base, +0.5 Mult |
| Drain | Void + Water | +1.5 Mult |
| Hollow Ground | Void + Earth | both faces to Base |

**New with new (15, every pair).** Each is worth about a secret reaction.

| Reaction | Pair | Effect |
|---|---|---|
| Twilight | Light + Darkness | both faces to Base, +1.5 Mult |
| Spacetime | Time + Space | +3 Base, +2 Mult |
| Maw | Chaos + Void | +2 Mult |
| Daybreak | Light + Time | +4 Base, +1 Mult |
| Glitch | Chaos + Time | +2.5 Mult |
| Blackout | Darkness + Void | +5 Base |
| Pinhole | Light + Void | +2 Mult |
| Starlight | Light + Space | +4 Base, +1 Mult |
| Dusk | Darkness + Time | +1.5 Mult |
| Rift | Chaos + Space | +3 Mult |
| Flicker | Chaos + Light | +1 Mult, +3 Base |
| Corruption | Chaos + Darkness | +2 Mult |
| Stasis | Time + Void | +2 Mult |
| Vacuum | Space + Void | +3 Mult |
| Eclipse Shade | Space + Darkness | +3 Base, +1 Mult |

(The Mythic reactions from v0.7.1 are unchanged: they name the Mythic dice.)

- **All 27 are secret** (hidden "???" in the Gallery until triggered, so nothing spoils) and live in their own Gallery section "Firmament reactions", shown once the file has crossed the door. Fusions of the elements (Shadow, Continuum, Oblivion, Alba, Anomaly, Singularity, Nadir) bring both parents, so they trigger several of these.
- Constellations do not level them. Add **Master Alchemist** exclusions: the existing "Master Alchemist" achievement stays for the classic secrets only, and a new secret achievement **Cosmic Alchemist** needs every Firmament reaction. `TOTALS.reactions` grows by 27.
- Names and texts are drafts for Carlos to rewrite (EN and ES).

### L6. Also in this step

- Patch notes "Alpha 0.8.1 Family growth" in Part D and `data/patchNotes.js`; CONTENT.md (regenerate it fully, it still has pre-rename names); GDD section; mark Part L Built.
- Tests: Node scripts for Tide at half and at each Totem level, Drift to the top (and that it does not explode), each relic, each Totem level, every one of the 27 reactions in the ledger, fusions triggering several, the achievements, old saves loading. Browser pass on a test save, **muted**.

## Part M: v0.8.2 "Late scaling" (spec, 2026-10-04)

**Status: Ready.** Carlos's playtest (2026-10-04): at round 25 he scored about 79,000 against a target near 86,000 with good dice (some dice scored 200), and agreed with Claude's simulation: the start is easy, but from round 15 the targets (x1.45 every round) outgrow what builds can do. He asked for **a late scaler and a slightly easier curve**. All numbers are **Defaults** (tune after playtests). The goal: a good build should sit near **1.0 to 1.3 times the target at every round up to 30**, a mediocre one falls behind slowly, and the first 15 rounds stay as easy as they are.

### M1. The curve (**already built by Claude on 2026-10-04; the agent must not redo it**)

`thresholdForRound` in `engine/scoring.js` now has three stretches (Carlos asked for a harder start after the first simulation, and the ease after 15): **rounds 1 to 10 start 75% higher but grow x1.37** (round 1 is 14, was 8; round 5 is 49, was 35; round 10 is 238, was 227); **rounds 11 to 15 keep x1.45** (round 15 is 1,526, was 1,453); **after round 15 the growth is x1.40** (round 20 is 8,205, round 24 is 31,521, round 25 is 44,130, round 30 is 237,342 on Ember; it was 9,313, 41,167, 59,693 and 382,615). Constants `EARLY_BASE_FACTOR`, `EARLY_GROWTH`, `LATE_GROWTH`. Warden multipliers and difficulty multipliers still apply last. The balance bot now clears round 1 with a median 1.4 times the target (it was 2.25). Only retune these numbers if M5's simulation says to.

### M2. Every die can grow past d20 in the Firmament

Today only Aether, the Mythic dice and Entropy grow big (d30 to d100). **In the Firmament any die can** (`canGrowBig` becomes true past the door): the upgrade tiers and costs already exist in `data/diceTiers.js` (d30 for 30 Shards, up to d100). This is the main late lever: faces scale linearly, so a d50 beats a d20 by far. The Upgrade Stone and every upgrade shop follow it. Chisel still splits one size down (a d30 splits into two d20).

### M3. Four multiplying relics (the first x-Mult sources)

Firmament and Elementa Markets both sell them from round 15 (round-gated by rarity as usual; the Legendary ones are Firmament-only). `multMult` effects multiply the final Mult, shown as one ledger line each.

| Relic | Rarity | Effect |
|---|---|---|
| **Crown of Ages** | Legendary | Mult x(1 + round / 20): x1.75 at round 15, x2.25 at round 25, x2.5 at round 30. |
| **Heart of the Forge** | Epic | Every fusion or element-fusion die in your pool multiplies Mult by x1.15. |
| **Starmap** | Epic | Mult x(1 + 0.05 per Constellation level you own, all ten added up). Pairs with Seren. |
| **Echo Chamber** | Legendary | The best reaction of the cast (by Mult) triggers twice. |

### M4. Constellation milestones

A Constellation at **level 5** doubles the Mult of that reaction (or the set tier's Mult); at **level 10** it triples it. Black Hole counts for every one of them. Show a small marker on a milestone level in Run Info.

### M5. Verify with the simulator

`tools/balanceSim.mjs` (committed, 2026-10-04) runs a modest bot and prints the pass rate and the median (score / target) for every round. The bot buys relics, dice and upgrades but does **not** use Constellations, Totems, consumables or the new elements, so it is a floor. Before and after the changes, run it for Ember, 60 runs, rounds up to 30, and include both tables in the report. **Extend the bot** (in the same file) to also buy the new relics and to upgrade dice past d20 in the Firmament, then check: a bot that takes these should hold a median ratio near 1.0 through round 25, and the unaided bot should still fall behind slowly (so choices matter). If a number is off, adjust the Defaults and say what you changed.

### M6. Also in this step

- Patch notes "Alpha 0.8.2 Late scaling" in Part D and `data/patchNotes.js`; CONTENT.md; GDD section; mark Part M Built.
- Gallery, Spanish text, sprites (existing procedural sprites), `itemConcept` for each relic.
- Tests: Node scripts for the threshold table, a die growing past d20 and scoring, each relic in the ledger, the milestones at levels 4, 5, 9, 10, an old save loading. Browser pass on a Firmament test save, **muted**.

## Decision log

- **2026-10-04 (late scaling, Carlos):** after his round-25 run (79k against about 86k) and Claude's simulation (a modest bot falls from 2.2 times the target at round 3 to 0.8 by round 16), Carlos wants a late scaler and a slightly easier curve: Part M.
- **2026-10-04 (closing the questions, Carlos):** Neutral faces the same Warden sets as the Split; Obscurity's neighbors score half instead of 0 (their whole score still goes to Mult); Part K's defaults are confirmed as built; poker and Joker dice merge into v0.8.5 (no separate v0.7.6).
- **2026-10-04 (families, Carlos):** Fire is strong, so lift the others: Water's locked dice add half their score to Mult, Drift can jump a die to its top face (once a round), five relics, four Totems (relics and items both), and reactions between the new elements, the old ones and each other: Part L.
- **2026-10-04 (gods, Carlos):** the four gods may share a pool; the old one-god-at-a-time cap is lifted, one of each remains. The Pantheon relic, which only raised the cap, now gives +2 Mult per god die held (Claude's proposal).
- **2026-10-04 (names, Carlos):** the six shop elements are now **Light, Darkness, Time, Space, Chaos, Void** (families take the same names; they were Glimmer, Gloom, Moment, Reach, Flux, Null). The six Mythic dice are **Luminance (Light), Obscurity (Darkness), Tempus (Time), Ouranos (Space), Hundun (Chaos), Abyss (Void)**; Entropy stays the top. The fusion that was called Abyss is now **Nadir** (Darkness + Void), proposed by Claude. Only display names changed; internal ids are the same (the base elements are `glimmer`, `gloom`, `moment`, `reach`, `flux`, `nil`; the Mythic dice are `light`, `darkness`, `time`, `space`, `chaos`, `void`).
- **2026-10-03 (v0.8 workshop):**
  - Base elements (Glimmer, Gloom, Moment, Reach, Flux, Null) are bought in shops; the six Mythic dice are forged like gods with a Warden's recipe and Stardust from bosses; the Forge gets 4 slots, size by average and carry-over; runes are inscribed on a number by rotating the die, and a forge clash or shrink offers Brasa's or Vesper's superpose fee or a silent 50/50 loss; seven curated two-element fusions, some volatile (Dead Star on collapse); Vesper joins the Forge; Pip explains it on crossing the door; more die items; the third realms leave v0.8 for a later workshop: Part K.
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
- **2026-10-02:**
  - Versioning: Alpha v0.4 to Alpha v1.0, then Beta v0.1 to Beta v1.0, then the full 1.0 release (Part C).
  - B10 timing: decided, balance changes and three arcane dice in v0.5 (B10).
  - Pact numbers agreed; Nix needs more pacts, starters proposed (B3).
  - Betrayal pacts agreed (B3).
  - Accord meter directions agreed, mostly hidden (B1).
  - Final battles agreed; a Primordial die for the Primordial path's battle agreed; gods one by one (gauntlet) proposed (B1).
  - The path locks in when you walk into round 15 (B1).
  - Gods: Divine rarity, forge-only, one at a time (an item may allow more), recipes from a Neutral or Split win, the Primordial path requires the recipes; Carlos's ability and drawback versions recorded (B4).
  - Endings tab and completion marks agreed (B2).
  - Carlos's answers to points 11 to 20 still to come.
- **2026-10-02 (later):**
  - Gods are fought one by one in a gauntlet, and the Primordial die gets stronger with each god defeated: agreed (B1).
  - Unlock order: option A, a Neutral win shows visions of the gods and grants their recipes, opening both paths (B2).
  - Ognen chain cap 10; new relic Chain Break (Fire explodes more, removes Ognen's cap) (B4).
  - Gaea's drawback hits Earth dice; Varuna's 1 sets every die to 1 (B4).
  - Nix's new pacts approved; Aeris gets the same love, with new blessings, including a safe Shard doubler (B3).
  - Claude's specs filled the remaining gaps (Accord weights, Split boss twist, gauntlet stages, betrayal pacts, new blessings, Pantheon) so v0.5 and v0.6 are Ready. Carlos can tune them after playtesting.
- **2026-10-03:**
  - Carlos's v0.6 playtest notes become Alpha v0.6.5 "Polish", between v0.6 and v0.7 (Part F, P1 to P18).
  - P1 (shop dice are d3), P13 (d3 symbol centering) and P17 (cleared tag as a corner sash) built by Claude on branch `elementa-v0.6.5`.
  - P18: the extra folder was a git worktree created on Claude's instruction; work moved to the main folder, and agents must not create extra folders again.
  - P10: a good idea; "Show live total" setting, off by default.
  - P2 (Chisel and Flasks) stays Proposed until Carlos answers the three questions.
- **2026-10-03 (build):**
  - P3, P4, P5 to P9, P10, P11, P12, P14, P15 and P16 built on branch `elementa-v0.6.5` (GDD §33). Defaults chosen by Claude are listed in the end-of-build report: keyword extras (Grows, Payout, Rewind, Boost, Doubles), the full view generated from flags, Info button and right-click as the touch and keyboard route to the full description, and a stake badge size of one flame per difficulty.
  - P2 (Chisel and Flasks) is still Proposed; nothing from `IDEAS.md` was built.
- **2026-10-04:**
  - Kindling stays uncapped (Carlos); the cap added in Alpha v0.6.6 was removed.
  - Playtest round 2 (Part G): popovers rendered in a portal (Q1 built); Varuna's drawback is a 50% bias toward 1s and Kindling is fixed and capped (Q2 built); Masquerade and Chameleon roll with borrowed abilities (Q3, Chrono).
  - A real d5 tier; shop dice sometimes come as d5, d6, d10, d20, pricier and progressively rarer; Chisel splits dice and does not work on a d3 (P2 built). Grinding a d3 into an item and Flasks stay open in `IDEAS.md`.
  - Story beats before every big fight and a better god-vision and recipes scene (with an achievement): Ready for Alpha v0.7 (Q4a). Full cinematics, 3D item sprites and more interesting items: Beta v0.1 (Q4b).
  - Scoring choreography in ledger order: Ready for Alpha v0.6.7 "Showtime" (Q5).
- **2026-10-03:**
  - Kindling stays uncapped (Carlos).
  - The Firmament continues the run: rounds 16 to 30, a Warden at 20, 25 and 30; six Wardens in two sets of three; per path three endings (Elementa, Firmament I, Firmament II); the Firmament's last Warden is not the true ending. The Clockwork's timer is 90 seconds, not optional.
  - Mythic dice only in the Firmament and after; dice from earlier realms keep appearing in later realms.
  - Light and Chaos and Void agreed; Darkness hits both neighbors and its Mult is undivided (the phrase "change to which die" is Open); Space gets a Negative-style tag (name to workshop; Claude recommends "Warp") and a rare Legendary item gives the tag; Mythic dice get their own tags later (`IDEAS.md`).
  - Chrono must reroll the whole pool: the new Chrono is a Firmament die, the old one becomes Kairos and stays in Elementa.
  - Keepers and item kinds agreed (14, 15). v0.7.5: Constellations, Runes, poker and Joker dice. v0.8.5: editable faces, Laws, sigil dice. Realm 3 is a later, workshopped version.
  - The legendary shop is named per realm; names proposed.
  - Workshop of the fourth place, the true ending and Mote started (A5, Proposed). Lore wording stays drafts until the beta.
  - Part H written and marked Ready for Alpha v0.7.
- **2026-10-03 (v0.7 build):**
  - Part H built on branch `elementa-v0.6.5` (GDD §37), with the story scenes of Part G Q4a. Nothing from `IDEAS.md`; no Constellations, Runes, Seren, poker, Joker, sigil or number dice, editable faces, Laws, third realms, fourth place or true ending.
  - Open items built with their defaults: the Neutral Warden sets; Darkness as both neighbors, undivided (`DARKNESS_DIVISOR = 1`); the name "Warp". Claude's defaults are listed in GDD §37 for Carlos to tune.
  - Test saves: `tools/firmamentTestSaves.mjs` writes a backup file (Options > Backup) with three files at round 15, one per path, door open.
- **2026-10-03 (v0.8 build):**
  - Part K built on branch `elementa-v0.6.5` (GDD §40). Not built: the third realms, number dice, poker or Joker dice, editable faces beyond runes, Laws, the fourth place, the true ending, anything from `IDEAS.md`.
  - Every Default built as written (names, Stardust amounts and price, the Mythic forge, the 25% collapse, the 8-Shard rune fee, a shrunk rune moving to the top face, Alba stable, Entropy's four-slot recipe, the Mythic dice out of every shop). Claude's other defaults are in GDD §40.
