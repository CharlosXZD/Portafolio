# Elementa: Game Design Document

Status: **v0.7 draft**, living document. Update this file as design changes. It is the source of truth, not the code comments.

## 1. Pitch

A score-based roguelite, structurally like *Balatro*, played out on elemental dice instead of cards. No enemies, no combat. You roll a pool of dice each round, manipulate them with rerolls and locks, and must beat an escalating score target. Between rounds, a shop lets you buy new dice, upgrade die sizes, buy relics (passive scoring rules), and buy more rerolls. The hook: dice belong to one of 4 elements (Fire, Water, Air, Earth), each with a distinct scoring mechanic, and pairs/trios/all-four can be **fused** into new dice that combine their parents' mechanics, Avatar-style (Fire+Air = Lightning, Water+Air = Ice, etc).

Reference points: *Balatro* (chip times mult scoring, shop-between-rounds loop, joker/relic economy), *Ultrapool* (elemental synergy scoring, "crazy combos" feel).

Note on terminology: the score a round must beat is called the **"threshold"** in the code and internal formulas (`thresholdForRound`, `state.threshold`) but is always labelled **"Target"** in the UI. Keep the code name; only the player-facing label changed, after early playtesting found "Threshold" read as clinical/unclear.

## 2. Core Loop

1. **Round starts.** Player has a dice pool (starts at 3d6 Earth) and a target score to beat.
2. **Roll phase.** All unheld dice roll. Player can hold/lock dice, spend rerolls to reroll unheld dice, and use element-specific actions (e.g. Water's free lock).
3. **Submit.** Final roll is scored: `Round Score = Base Value × Multiplier`. If Round Score meets or beats the Target, proceed to the shop; otherwise the player loses one life (see §8a) and may retry the same round with a fresh roll. The run only ends when lives reach 0.
4. **Shop phase.** Player earns Shards (currency) based on performance, gains interest on unspent Shards, and spends them on new dice, die upgrades, relics, and rerolls. Every purchase and sale requires a second confirming tap (arm, then confirm) so a stray click can't spend Shards by accident.
5. **Next round.** Target escalates. Repeat. Every 5th round is a **Boss Round** with a twist rule (see §7, still a stub).

## 3. Elements & Scoring Mechanics

Every die (pure or fused) is defined by a set of **mechanic flags**. The scoring engine is generic over these flags: fusions are simply dice that carry the union (with some overrides) of their parents' flags. This is the core technical/design trick that makes the fusion tree cheap to extend.

| Flag | Effect |
|---|---|
| `explode` | If the die shows its max face, reroll and add (chain), incrementing the run's explode counter (+0.5x Mult each) |
| `zeroOnMin` | If the die's original roll is a 1, it contributes 0 to Base Value this round |
| `freeLock` | Player may lock this die's current face without spending a reroll charge |
| `grantsRerollOnLock` | First time this die is locked each round, pool gains +1 reroll charge |
| `adjacentFreeLock` | Locking this die also locks the next die in the pool for free |
| `duplicateOnReroll` | When rerolled, has a chance to copy its new value onto another unheld die |
| `enablesSetBonus` | If any die in the pool has this flag, the whole pool is checked for matching sets/straights (by face value), adding flat Mult |
| `doubleOnSet` | If this die is part of a matching set, its contribution to Base Value is doubled |

### Pure elements (starting roster)

| Element | Flags | Identity |
|---|---|---|
| **Earth** | *(none)* | Reliable filler. Flat pips, no risk, cheapest to buy/upgrade. Starting deck. |
| **Fire** | `explode`, `zeroOnMin` | Volatile. High ceiling via chained explosions, but 1s fizzle to 0. |
| **Water** | `freeLock`, `grantsRerollOnLock` | Manipulation. Fixes dice for free and refuels your reroll economy. |
| **Air** | `enablesSetBonus` | Combo. Rewards building matching sets/straights across the whole pool. |

### Fusion dice (double, 6 total)

| Combo | Name | Flags (mechanic) |
|---|---|---|
| Fire + Air | **Lightning** | `explode`, `zeroOnMin`, `enablesSetBonus`, and explosions re-check the set bonus mid-roll |
| Water + Air | **Ice** | `freeLock`, `grantsRerollOnLock`, `enablesSetBonus`. Locked faces count toward sets, so you can manufacture a straight |
| Fire + Earth | **Steel** | `explode`, but **not** `zeroOnMin` (Earth's reliability suppresses Fire's downside) |
| Water + Earth | **Mud** | `freeLock`, `grantsRerollOnLock`, `adjacentFreeLock` |
| Fire + Water | **Steam** | `explode`, `zeroOnMin`, `duplicateOnReroll` |
| Earth + Air | **Crystal** | `enablesSetBonus`, `doubleOnSet` |

**Unlock rule:** a fusion die becomes purchasable in the shop only after the player has owned at least one die of *each* parent element simultaneously at some point in the run ("discovered"). Discovered fusions stay purchasable for the rest of the run.

### Triple fusions (4 total, one per element left out)

| Combo (missing) | Name | Flags |
|---|---|---|
| Fire+Water+Air (no Earth) | **Storm** | `explode`, `zeroOnMin`, `freeLock`, `grantsRerollOnLock`, `enablesSetBonus`. Locked faces can still explode, so you can manufacture *and then detonate* a set |
| Fire+Water+Earth (no Air) | **Obsidian** | `explode` (no zeroOnMin), `duplicateOnReroll`. Safe, stacking reroll value |
| Fire+Air+Earth (no Water) | **Magma** | `explode` (no zeroOnMin), `enablesSetBonus`, `doubleOnSet`. Exploded totals can double if part of a set |
| Water+Air+Earth (no Fire) | **Monsoon** | `freeLock`, `grantsRerollOnLock`, `adjacentFreeLock`, `enablesSetBonus`. Cheapest way to lock two dice into a matching set at once |

**Unlock rule:** requires having owned all 3 parent pure elements simultaneously (or the relevant double fusion + the third pure element; TBD in balancing pass).

### Quadra fusion (legendary, 1 total)

| Combo | Name | Flags |
|---|---|---|
| Fire+Water+Air+Earth | **Aether** | All flags at once. Capped to **one Aether die per run**. Unlocks only after the player has owned all 4 triple fusions at least once in the same run (or across runs; TBD). Deliberately a run-defining prize, not a buildable core strategy. |

## 4. Dice Tiers (size)

Die *element* is one axis; die *size* is the other. Size scales the numbers, not the mechanic.

| Tier | Sides | Role |
|---|---|---|
| D3 | 1–3 | Cheap, low-variance filler; good for Air's set-matching (narrower value range = easier matches) |
| D6 | 1–6 | Default starting tier |
| D10 | 1–10 | Mid-game upgrade |
| D20 | 1–20 | Late-game, high ceiling, pairs well with Fire's explode chains |

Upgrading a die changes its size but keeps its element (and flags). Price scales flat per tier (see §6), independent of element.

## 5. Scoring Formula

```
Base Value = Σ (die contribution) for every die in the pool
  - normal die: contribution = final rolled value (post-explosion chain sum)
  - zeroOnMin die whose ORIGINAL roll was a 1: contribution = 0
  - doubleOnSet die that is part of a matching set: contribution × 2

Multiplier = 1
  + (0.5 × total explosions triggered this round)
  + Set Bonus Mult, if enablesSetBonus is active anywhere in the pool:
      pair            → +1
      three-of-a-kind → +2
      straight (4+)    → +3

Round Score = round(Base Value × Multiplier)
```

Relics and shop upgrades hook into this formula as flat adders to Base, flat adders to Mult, or multipliers on either, mirroring Balatro's chip/mult split so "which half of the formula am I building toward" stays the central deckbuilding question.

## 6. Economy

**Currency: Shards.**

- Earned at round end: `Shards = 5 + overkill`, where **overkill = +1 per 25% the score went past the target, capped at +15** (`overkillShards` in `engine/scoring.js`; 2x = +4, 3x = +8). Ratio-based rather than the old `floor((score - target) / 8)`, which paid nothing early and unboundedly late. The cast ledger previews the overkill Shards before you cast, and the shop's result card breaks the gain down (reward, overkill, interest, relics).
- **Interest:** +1 Shard per 3 unspent Shards, capped at +5 (some relics raise the cap), applied before entering the shop.
- Skipping a shop purchase phase entirely grants a small flat bonus (TBD: Balatro-style skip tags, deferred to a later pass).
- Selling a die or relic in the shop always pays out less than it cost to buy (see `data/diceTiers.js` `sellValueForDie` and `data/relics.js` `sellValueForRelic`). This lets players correct a bad buy or respec a build without it being free.

**Price curve (anchors, subject to balancing):**

| Item | Base price | Scaling |
|---|---|---|
| New pure-element die (D6) | 4 | +1 per die already owned of that element |
| Die size upgrade (tier step) | 6 / 12 | flat per tier jump |
| Extra reroll (permanent, run-long) | 5 | +2 per reroll already owned |
| Relic | 6-10 | tiered by rarity (common/uncommon/rare) |
| Reroll the shop's offers | 3 | +1 each use, resets next shop visit |
| Fusion die (once discovered) | 10-14 | pricier, a build commitment |

**Threshold scaling:** originally doubled roughly every 2-3 rounds; rebalanced to a gentler `6 * 1.35^(round-1)` curve after the lives system (see §8a) was added, since a slower ramp plus retries feels much less punishing than a steep ramp with no retries. Every 5th round is a **Boss Round** (implemented, see §15) with a random twist modifier.

## 7. Relics

See [`data/relics.js`](./data/relics.js) for the implemented list and rarity tiers. Design intent: relics should mostly *amplify* an element's existing identity (fire wants more explosions, water wants more rerolls, air wants easier sets, earth wants reliability) rather than adding unrelated systems. This keeps build-around synergy legible even as the list grows.

## 8. Run Structure (MVP scope)

- Starting deck: 3x D6 Earth.
- Starting rerolls per round: 3.
- Win condition (demo scope): survive N rounds (placeholder: 15) then Victory screen. No content past round 15 yet.
- Loss condition: lives reach 0 (see §8a) then Game Over screen with run summary (rounds survived, dice/relics owned).

### 8a. Lives

Added after early playtesting: a single missed round used to end the whole run immediately, which felt too punishing when a player's build simply wasn't ready yet. Now:

- The player starts each run with **3 lives** (hearts in the HUD).
- Missing the target costs 1 life. If lives remain, the player sees a "Target missed, you lost a life" screen with a **Try again, this round** button: the same round, same target, freshly rolled dice, rerolls reset. Nothing else about the run resets (Shards, relics, dice all carry over).
- Only when lives hit 0 does the run actually end (Game Over).
- Lives passively regenerate: +1 life (capped at max) every 4 rounds successfully cleared, so a strong stretch buys back some safety margin for a later rough patch. See `LIFE_REGEN_EVERY_N_ROUNDS` in `engine/gameReducer.js`.

### 8b. Title screen

The game now opens on a title/home screen (`components/TitleScreen.jsx`) rather than dropping the player straight into round 1: game name, one-line pitch, a 4-bullet how-to-play, and a **Start Run** button. `RETURN_HOME` (dispatched from the Game Over / Victory screen) sends the player back here rather than immediately starting a fresh run, so "one more run" is a deliberate choice, not an automatic reset.

### 8c. Shop UX

- Every buyable die shows its element's one-line tagline (from `data/elements.js`) directly on the buy button, not just its name, so new players understand what they're buying without needing outside knowledge.
- Every purchase and sale (buy die, upgrade die, buy relic, buy reroll, sell die, sell relic) goes through `components/ConfirmButton.jsx`: first tap arms the button (it turns amber and shows "Confirm?"), second tap within 3 seconds executes it. This exists purely to stop accidental Shard spends, not to add friction. A future revisit is a "confirm-optional" preference toggle if a repeat visitor finds it slows things down.
- The shop has a "Your dice" and "Your relics" section listing everything currently owned, each with a Sell action. Selling always pays less than buying (see §6). Selling is blocked while only 1 die remains, since an empty pool can't score.

## 9. Sound

Procedural only (`utils/sound.js`), no audio asset files: short synthesized tones via the Web Audio API, generated on the fly per cue. Deliberately sparse, per the "utility" rule that feedback should be reserved for meaningful moments rather than fired on every tick:

- One roll cue per reroll action (not per die).
- A distinct cue each for: holding/selecting a die, locking/freezing a die, a shop purchase, a round clear, a round miss, and losing a life.
- A mute toggle lives in the game header and persists via `localStorage`.

## 10. Build restriction (relic cap + rarity gating)

Added because early playtesting found the run "too easy, no restriction on builds", once the shop had enough rounds to run, a player could eventually own most relics and most fusion dice simultaneously, so every run converged on the same maximal strategy instead of a chosen one. Two independent levers now restrict this, both difficulty-tunable (`data/difficulty.js`):

- **Relic cap.** A run can hold at most `difficulty.relicCap` relics at once (5 on every difficulty tier currently, see §11). Buying past the cap is blocked in the reducer (`BUY_RELIC`) and the shop shows a live `relics X / cap` counter plus a note once it's full. This is the direct analogue of Balatro's joker slot limit: it forces "which synergy am I committing to" instead of "buy everything offered."
- **Rarity-gated shop pool, now 5 tiers.** Rarity expanded from 3 tiers (common/uncommon/rare) to 5 (`RARITY` in `data/relics.js`: common, uncommon, rare, epic, legendary), each with its own glow color (§14) and its own round it can't appear before (`RARITY_UNLOCK_ROUND` in `engine/gameReducer.js`: common round 1, uncommon 2, rare 4, epic 7, legendary 10). Offers are drawn with `weightedSample`, a weighted pick-without-replacement where a locked rarity has weight 0 (can never appear) and common items are simply more likely even once everything is unlocked. Dice share this exact scale (see §18) rather than having their own separate one.
- **Dice pool cap.** A softer version of the same idea: the dice pool is capped at `maxDiceFor(difficulty)` (10 by default, 4 on Inferno/Cataclysm, see §11), shown as `X / cap dice` in the shop, so a build can't just snowball into an arbitrarily large pool that trivializes Air's set-matching.

## 11. Decks and difficulty

Chosen on the title screen (`components/TitleScreen.jsx`), before `START_RUN` is dispatched with `{ deckId, difficultyId }`.

- **Decks** (`data/decks.js`) are starting dice loadouts only, nothing else about the run changes. Kept to 3 for now: Balanced (3x Earth, the original default), Pyromancer (2x Earth + 1x Fire), Tempest (2x Earth + 1x Air). More decks are just more entries in that file.
- **Difficulty** (`data/difficulty.js`) is a single cumulative ladder, not four independently-tuned presets: each tier keeps every rule from the tier before it and adds exactly one new twist. Named for escalating heat rather than "normal/hard/hardest", and each tier's `color` field (a heat gradient: amber, orange, red, violet) is shown next to its name everywhere the difficulty appears (title screen card, `RoundHUD`), so the player always has a visual reminder of what they signed up for:

  | Tier | Adds on top of the previous tier |
  |---|---|
  | **Ember** | The base run (this is what used to just be called "Normal"). |
  | **Blaze** | Every round's target is doubled (`thresholdMultiplier: 2`). |
  | **Inferno** | Blaze, plus 1 fewer reroll (`rerollPenalty: 1`) and the dice pool is capped at 4 (`maxDiceOverride: 4`) instead of the usual 10. |
  | **Cataclysm** | Inferno, plus every round is a boss round (`allRoundsBoss: true`, see §15) and the target multiplier becomes 3 instead of 2 (it replaces Blaze's multiplier rather than stacking with it: "targets triple", not "targets sextuple"). |

  Lives (3) and relic cap (5) are deliberately left flat across all four tiers: the ladder is about the target curve, the reroll/dice economy, and boss density, not about attrition. One caught during implementation: `startNewRun` used to only ever set `bossModifier: null` for round 1, so Cataclysm's "every round is a boss" silently didn't apply to round 1. Fixed by having `startNewRun` run the same `isBossRound` check `NEXT_ROUND` does.

## 12. Feedback and legibility

Added a layer of UI whose whole job is answering "why did that happen" and "what does this do", none of it changes scoring, all of it makes the existing scoring legible:

- **Hover tooltips.** Every die in play shows its element's tagline, a plain-language line per active mechanic flag (from `FLAG_DESCRIPTIONS` in `data/elements.js`), and its live contribution to the current roll ("Scores N this roll"), via the generic `components/Tooltip.jsx`.
- **Target progress bar.** `components/TargetBar.jsx` shows the live score against the round's target as a fill bar (turns green once met), replacing a bare number as the primary read during the roll phase. The HUD still shows the numeric target too.
- **Submit counter.** Hitting Submit no longer jumps straight to the result. `DiceTray.jsx` replays each die's contribution to the Base Value one at a time (highlighting the scoring die with a gold flash, distinct from held/locked/frozen), then reveals the multiplier and final score, before the round actually submits to the reducer. Purely theatrical, the reducer already knows the outcome; this is Balatro's signature scoring reveal adapted to dice. Interaction is disabled for the ~1-2 seconds this takes.

## 13a. Shop luck and the Fusion Forge

Added because the shop originally showed *every* die element the player had unlocked, every visit, guaranteed. Once a run had a few good rounds under its belt, "go to the shop" stopped being a decision and became "buy the obviously-correct thing", every visit, every run. Two changes:

- **Dice offers are now luck-gated too**, the same way relic offers already were. `buildShopOffers` draws a `weightedSample` of at most 3 buyable elements per visit instead of listing all of them, weighted so pure elements are 4x more likely to appear than a discovered fusion (fusions are meant to feel like a lucky find in the shop; see the Forge below for the reliable path to one). Rerolling the shop's offers (`REROLL_SHOP_OFFERS`) now regenerates both the die and relic offers together, for one cost.
- **The Fusion Forge** is the answer to "what if the shop just won't offer me the fusion I want": a shop section that lets the player combine currently-owned parent dice directly into their fusion, consuming all of them, for a flat Shard cost that scales with tier (double 6, triple 10, quadra 16, before relic/shop discounts), cheaper than the shop's discovered-fusion price since parent dice are also given up. Works for **every** fusion tier now, not just doubles: a triple consumes 3 parent dice, the quadra (Aether) all 4. This is computed live every render (`selectors.forgeableRecipes(state)`), not frozen at shop-open time, so it reacts immediately if the player buys, sells, or transmutes (§18) a die mid-visit. A recipe only appears once the player owns at least one die of each parent element. Dispatched as `FUSE_DICE({ fusionElementId })`.

## 13b. More relics

Six more relics (`data/relics.js`), aimed at giving the shop's economy and safety-net levers more to interact with, on top of the original sixteen: **Fusion Catalyst** (cheaper Forging), **Deep Pockets** (cheaper shop rerolls), **Windfall** (faster Shard interest), **Hoarder** (a small bonus on every sell), **Steadfast** (consolation Shards on a miss), and **Safety Net** (survive your first would-be run-ending loss with 1 life). Safety Net needed one small new piece of state, `secondWindUsed`, to make sure it can only trigger once per run; `RoundResult.jsx` shows a distinct message when it fires.

## 14. Art direction and color palette

The pixel CSS shell (§13) needed a real, named palette behind it rather than ad hoc Tailwind defaults, so the game reads as one consistent world instead of a pile of colored boxes:

- **Elements own their color, everywhere.** Each element's `color` in `data/elements.js` is the single source of truth for that element's identity, used identically on the die face, the shop's buy/upgrade/sell cards, the Fusion Forge recipe cards, and tooltips. An element is never re-colored per-context.
- **Difficulty owns a heat-gradient color.** Ember → Blaze → Inferno → Cataclysm maps to amber → orange → red → violet (`data/difficulty.js` `color` field), shown next to the difficulty name on the title screen and in the HUD for the whole run, so the chosen stakes are always visible, not just stated once at the title screen.
- **Semantic UI colors are fixed and reused, not reinvented per component:** emerald for a pass/success, red for a fail, rose for a boss round, sky/blue for a freeze/ice effect, amber for an armed confirm-button, violet for Safety Net. These are chosen to stay visually distinct from every element color so game-state feedback never gets confused with element identity.
- **Rarity has its own scale**, independent of both of the above: neutral gray (common) → sky (uncommon) → amber (rare), used for relic card borders and labels.

## 15. Pixel art (hybrid plan)

Per an explicit choice between CSS-only, fully generated assets, or a hybrid: **hybrid**. Two halves:

- **CSS pixel shell (done).** `elementa.css`, scoped under `.elementa-root` so it never touches the rest of the portfolio site: the "Press Start 2P" pixel font for headings and score numbers (`.pixel-heading`, `.pixel-score`), and hard-edged panels with square corners and a solid offset shadow instead of a blurred one (`.pixel-panel`, `.pixel-die`). Respects `prefers-reduced-motion`.
- **Hand-drawn assets: not AI-generated, by design.** Carlos wants to draw the real art himself (title banner, element icons, dice faces) rather than use an image-generation model, and isn't setting up the paid API either. So there is no generated-art track for this project: the CSS shell above is not a placeholder for a later AI-generated pass, it *is* the alpha's visual identity, and stays that way until hand-drawn assets are dropped in. When those arrive, they slot in as `files`/`public` assets referenced by the same components (Die, TitleScreen, etc.) without needing an engine change.

## 16. Boss rounds (implemented)

Every 5th round (`isBossRound` in `data/bossModifiers.js`) rolls a random twist modifier for that round only. Modeled deliberately as an object shaped exactly like a relic (an `effects` bag), so it needs no parallel system: `effectiveRelics(state)` in `engine/gameReducer.js` merges it into the relics array for every scoring/rolling call site for the duration of the round, without ever adding it to `state.relics` itself (so it can't be sold or shown as owned). The same merged list is what the UI preview (`DiceTray.jsx`) uses, so the live score preview reflects the twist honestly before the player submits.

Current twists (`data/bossModifiers.js`), one picked at random per boss round:
- **Calm Winds**: explosions do not chain, the max face still adds once, then stops (caps the explosion loop at 1 instead of the usual 10, or infinite with Static Charge).
- **Grounded**: the matching-set Multiplier bonus is suppressed entirely for the round.
- **Iron Grip**: rerolls are capped at 1 for the round, no matter how many the player has bought or earned.
- **Null Zone**: one element the player currently owns (picked at random from owned dice) scores 0 for the round.

The modifier persists across a `RETRY_ROUND` retry of that same round (so retrying doesn't let you re-roll for an easier twist) but is freshly re-picked (or cleared) every time `NEXT_ROUND` moves to a new round. `DiceTray.jsx` shows a banner naming the twist and its plain-language effect while it's active.

## 18. Item system rebuild (5-tier rarity, dice rarity, consumables, Item Icon + Inspector)

Driven by UI/UX feedback from Pinterest references (see the session that produced this): the old shop was a wall of always-expanded text cards, relics and dice had no distinct visual identity, and there was no lever to reshape an existing die short of buying a brand new one.

**Rarity expanded from 3 tiers to 5**, shared identically by relics, consumables, and dice (`data/relics.js` `RARITY`/`RARITY_GLOW`, `data/elements.js` `rarityForElement`):

| Rarity | Glow | Dice mapped to it |
|---|---|---|
| Common | dim neutral gray | the 4 pure elements |
| Uncommon | sky blue | (relics/consumables only, no dice at this tier) |
| Rare | red | the 6 double fusions |
| Epic | violet | the 4 triple fusions |
| Legendary | gold | Aether (the one quadra) |

All 22 existing relics were re-sorted across the 5 tiers (see `data/relics.js` for the current assignment), and dice inherit their rarity directly from fusion tier, so a "rare" die and a "rare" relic unlock on the exact same round and read as the same rarity everywhere.

**Consumables are a new item kind**, distinct from passive relics (`data/consumables.js`): bought or found like a relic, but instead of taking effect immediately they sit in an inventory (capped at `MAX_CONSUMABLES = 3` held at once, unlimited total obtainable over a run) until *applied* to a target die, then they're spent (`APPLY_CONSUMABLE({ instanceId, dieId })`). Five exist:
- **Upgrade Stone** (Uncommon): bumps a die's tier one step. This replaces the old always-available, free "Upgrade" button that used to sit next to every owned die (`UPGRADE_DIE` is gone from the reducer); upgrading a die now costs finding/buying a Stone first, then choosing where to spend it.
- **Transmute: Earth / Water / Air / Fire** (Common, one per pure element): changes a die's element to that specific target, keeping its tier. Deliberately never random and never a fusion target, picking the destination is the point. Getting a fusion die stays Forge-only or a direct shop buy.

This is also the intended balance lever against dice-count growth being the strictly-best move: growing the pool (`BUY_DIE`) stays the rarer, luck-gated action it already was, while reshaping what you already have (Upgrade Stone, Transmute) is meant to be the more reliably available path.

**Item + Inspector interaction model**, modeled directly on Balatro's card popup: every relic, consumable, and die is just its glowing icon (`components/ItemIcon.jsx`, rarity-tinted glow ring, a placeholder glyph until real art exists via an `iconSrc` prop) sitting in a row, no name or description visible until clicked. Clicking opens `components/ItemInspector.jsx`, a small popover **anchored directly above the item that opened it** (with a pointer triangle connecting it to the icon), not a centered full-screen modal, closing on an outside click or its own X button. It shows the name, description with numbers/element names/"Shards" highlighted, a rarity pill, and contextual action buttons (Buy / Sell / Apply / Close) supplied by the caller, since what's available depends on whether it's a shop offer, something owned, or a consumable. First pass used a fixed centered modal with a dark backdrop; per feedback (it "looked like a whole window pop up") this was reworked to the anchored popover. Every purchasable item also carries a persistent price tag (`components/PriceTag.jsx`, a small amber tag hanging above the icon) visible without clicking, since price wasn't legible before. Applying a consumable is two steps: open its inspector and press Apply (arms it, no die chosen yet), then click a die (visibly highlighted as targetable, with a "choose a die" banner and a Cancel link) to complete it. `data/itemDescriptors.js` holds the shared logic that turns a relic/consumable/die/forge-recipe into the uniform shape both components expect, so the shop and the in-round HUD (which now shows owned relics/consumables as small view-only icons too) never duplicate this. Only one popover can be open at a time (a single `openKey` lifted to the parent screen), opening a new one closes whatever was open.

**Not done yet, explicitly deferred:** the moodier/deeper background treatment. Real hand-drawn art per item (§13/§15) is still entirely on Carlos, the per-relic `itemConcept` noun-phrases are the art brief for that.

## 18a. Shop layout: horizontal 3-column (implemented)

Following feedback that the shop was "building in vertical too much" (a single long stacked column) and a reference mockup, `ShopScreen.jsx` is now a responsive 3-column CSS grid (`grid-cols-1 md:grid-cols-[200px_1fr_180px]`, stacking to one column below the `md` breakpoint):

- **Left column**: everything currently owned, as fixed-capacity slot grids (`SlotGrid` in `ShopScreen.jsx`). Dice, relics, and consumables each render exactly `capacity` slots, real items first, then dashed empty placeholders for the rest, so remaining inventory room is visible at a glance instead of living only in a "3 / 5" caption (that caption is now supplementary, not the only signal).
- **Center column**: the actual shop, a decorative wood-styled "SHOP" banner (`ShopBanner`, CSS only, no art asset yet), then Buy a die, the Fusion Forge (when anything's forgeable), and the item offers.
- **Right column**: a compact vertical HUD (lives, Shards, **Next target**, Round, difficulty name) plus every round-transition action as a real button: Next Round, Run Info, Reroll offers, Options. The standalone `RoundHUD` strip is hidden specifically during the shop phase (`ElementaGame.jsx`) since its content now lives here instead; it still renders normally for every other phase. The game's outer container drops its width cap entirely during the shop phase (`w-full max-w-none`, versus the narrower `max-w-3xl` everywhere else), `ShopScreen.jsx` itself caps at `max-w-[1800px]` so it doesn't stretch absurdly on an ultra-wide monitor. The version tag moved out of the header into a `fixed bottom-2 right-3` corner so it never competes with page content.
- **"Next target"**, not the just-finished round's target: computed live as `thresholdForRound(state.round + 1, state.difficulty)` for display only (state.threshold itself doesn't advance until `NEXT_ROUND` actually dispatches), so the shop previews what's coming instead of restating what was just cleared (the `RoundResult` banner in the left column still correctly shows the completed round's own target).
- **Run Info** and **Options** are small anchored popovers (`SidebarPanel` in `ShopScreen.jsx`, same anchor-and-outside-click-close pattern as `ItemInspector` but without the item/rarity concept). Run Info is read-only run stats (difficulty, round, dice/relic/consumable counts vs. cap, lives, permanent rerolls bought). Options holds the sound toggle and an "Abandon run" action (`ConfirmButton`-gated, dispatches `RETURN_HOME`), the first way to deliberately end a run early rather than only via a loss.
- **Extra rerolls are a consumable now, not an always-available button.** The old `BUY_REROLL` action (always purchasable, scaling cost) is gone entirely. Buying more rerolls now means finding/buying the **Extra Reroll** consumable (`data/consumables.js`, `type: 'reroll'`) in the luck-gated shop pool like everything else, then applying it. This introduced a second consumable *target* kind: `target: 'self'` (takes effect immediately, no die needed) versus the existing `target: 'die'` (Upgrade Stone, Transmute), so `APPLY_CONSUMABLE` branches on that before requiring a `dieId`.

Not yet matched from the reference mockup: the specific decorative treatment (wood-crate SHOP sign texture, the diagonal corner-tag flourish on offer icons) since the mockup itself was flagged as still needing assets and tweaking; those are cosmetic finishing passes for once real art exists, not structural. The rolling-phase screen (`DiceTray.jsx`) was intentionally left on its existing narrower layout, since the mockup was specifically about the shop; revisit it later if the same horizontal treatment is wanted there too.

## 19. Open Questions / Backlog

- Exact straight/set definitions when pool size varies (5 dice vs 10 dice); needs a concrete algorithm once dice-pool-size growth is balanced.
- More boss twists beyond the initial 4 (§16), and whether they should scale in severity with round number instead of being uniformly random.
- Whether the shop purchase confirmation step (superseded in practice by the Inspector's own open-then-click-Buy flow, see §18) still needs anything extra, or whether that's sufficient friction on its own.
- Whether life regeneration (§8a) should be suppressed on a round that was also a boss round.
- Whether the rarity-unlock rounds (§10) should scale per difficulty instead of being flat.
- Swapping the procedural backgrounds and CSS panels (§22) for Carlos's hand-drawn art as it lands (`ASSETS.md`).
- Full tech stack is React + Tailwind (matches the existing portfolio site), state via `useReducer`, no physics/canvas needed for the dice-tray MVP.

## 20. Main menu and save slots (implemented)

Replaces the old flow where the app dropped straight onto the deck/difficulty picker (`components/TitleScreen.jsx`) with a proper front-end: `phase: 'menu'` (`components/MainMenu.jsx`) is now the true entry point (`initialState`/`RETURN_HOME` both land here), showing the game name, tagline, and three actions: **Play**, **Options** (an inline popover with just the sound toggle for now), and **Credits** (`components/CreditsScreen.jsx`, a static back-only screen).

**Save slots.** Play goes to `phase: 'slots'` (`components/SaveSlots.jsx`), 3 fixed slots (`SAVE_SLOT_COUNT` in `utils/saveManager.js`). Saves are plain `localStorage` snapshots keyed by slot index (`elementa-saves-v1`): the entire reducer state is serializable as-is (no functions in it), so a save is just `JSON.stringify(state)`, no separate save-schema to keep in sync with the game state shape. An empty slot shows a **New Run** button (dispatches `NEW_RUN_SETUP({ slot })`, which sends the player to the existing deck/difficulty picker at `phase: 'title'` with `state.activeSlot` set); a filled slot shows its progress at a glance (difficulty name/color, round, dice count, Shards, lives) plus **Continue** and a `ConfirmButton`-gated **Delete**.

**Autosave**, not a manual save button: `ElementaGame.jsx` writes the active slot's save on every state change while `state.phase` is `rolling`, `missed`, or `shop` (i.e. an actual run in progress) and `state.activeSlot` is set. `state.activeSlot` (0-2, or `null` outside an active run) rides along in the reducer state itself rather than as separate component state, set once by `NEW_RUN_SETUP`/`START_RUN`/`LOAD_RUN` and cleared by `RETURN_HOME`. A run that reaches `gameover` or `victory` can't be resumed, so that slot's save is deleted automatically the moment either phase is reached, freeing the slot for a new run; abandoning a run early (Options → Abandon in the shop) does *not* delete the save, since the last autosaved point is still a valid resume target.

**Run preview, not a straight drop back in.** Loading a filled slot dispatches `LOAD_RUN({ save })`, which hydrates the full saved state but forces `phase: 'runPreview'` and stashes the save's real phase in `resumePhase`, rather than dropping the player straight back into a mid-round dice tray with no context. `components/RunPreview.jsx` shows difficulty, round, lives, Shards, and the current dice loadout as `ItemIcon`s, with a **See more** toggle that expands owned relics/consumables and the round's target (reusing `data/itemDescriptors.js`, the same descriptor shapes the shop uses). **Continue** dispatches `RESUME_RUN`, which swaps `phase` for the stashed `resumePhase` (so a save mid-shop resumes in the shop, one mid-round resumes rolling, etc.); **Back** discards the hydrated preview state and returns to the slot list without touching the save file on disk.

**Not done yet, explicitly deferred:** Credits is static text, not pulling from any data file. (Options is no longer sound-only, see §21.)

## 21. Full-screen Options, bilingual UI, generated music, and a CRT filter

Replaces the old header "Sound on/off" button and the small per-screen sound popovers with one shared, full-screen `components/OptionsScreen.jsx`, opened from the main menu, the pause menu (see §20's Escape overlay), and the shop's own Options panel via a "More options" button. It covers:

- **Language.** English/Spanish, reusing the portfolio site's own `LanguageContext`/`useLanguage()` (`src/i18n/LanguageContext.jsx`) rather than a separate game-only store, since the game is mounted inside the same `LanguageProvider` as the rest of the site (`src/main.jsx`): one language preference for the whole domain, not two. Game UI chrome strings live in the shared `src/i18n/strings.js` under an `elementa.*` key prefix. Game *content* (element/relic/consumable/deck/difficulty/boss-modifier names and copy) is translated in a separate lookup table, `data/i18n.js`, keyed by id, rather than rewriting every entry in `data/elements.js`/`data/relics.js`/etc. into `{en, es}` pairs in place, since those files are read by the reducer/scoring engine as plain data (id, flags, effects), so translation content stays out of the way of anything the engine actually reads. `data/itemDescriptors.js`'s functions all take a `lang` argument and localize through `data/i18n.js`'s `localize()`/`localizeDeck()`/`localizeDifficulty()`/`localizeBossModifier()` helpers.
- **Theme.** *Superseded by §22:* the game now always renders in its own night palette and the theme toggle was removed from Options.
- **Audio.** Sound effects and music now have independent volume sliders (`utils/settings.js`: `getSfxVolume`/`getMusicVolume`, 0–1, persisted). `utils/sound.js`'s `tone()` (every existing SFX cue) multiplies its gain by the live SFX volume instead of a binary mute flag, which is gone entirely.
- **Music.** Procedural and generated, no audio files, matching the project's existing "no external audio assets" stance (§9): `utils/sound.js` schedules a looping 4-bar minor-pentatonic arpeggio + bassline via the Web Audio API (`startMusic`/`stopMusic`/`refreshMusicVolume`/`applyMusicEnabled`), self-scheduling a little ahead of `audioCtx.currentTime` rather than `setInterval` so it doesn't drift under tab throttling. It runs through its own persistent `GainNode` so the volume slider drags live without restarting the loop. `ElementaGame.jsx` calls `startMusic()` on mount and on the first pointer/key interaction, since browsers won't actually play audio until a user gesture unlocks the shared `AudioContext`; `startMusic()` itself is a safe no-op until that happens.
- **Visual effects.** Two toggles, both persisted and both read through a small `GameSettingsProvider`/`useGameSettings()` context (`utils/gameSettingsContext.jsx`) rather than being prop-drilled through every intermediate component, since they're needed both deep in the tree (`Die.jsx`'s hover wobble) and at the game root (the CRT overlay):
  - **CRT screen filter** (`components/CrtOverlay.jsx`): scanlines and a corner vignette (a plain CSS overlay layer) plus a genuine chromatic-aberration effect via an inline SVG filter (`feColorMatrix` to isolate each color channel from `SourceGraphic`, `feOffset` to shift the red/blue channels a couple pixels apart, `feBlend`/`screen` to recombine), applied as `filter: url(#elementa-chromatic)` on the whole game root. The one non-obvious gotcha: every `feColorMatrix` after the first must set `in="SourceGraphic"` explicitly: leaving it off defaults to the *previous* primitive's result, not the source, which silently chains all three channel isolations into one wash instead of three independent offset copies (this produced a full red tint over the entire page before it was caught).
  - **Reduced motion**: strips the "juicy" hover/tap animations (see below) back to plain, motionless defaults, independent of the OS-level `prefers-reduced-motion` setting `MotionConfig reducedMotion="user"` already respects site-wide. This is a game-specific opt-out layered on top, defaulting to the OS preference the first time it's read (`getReducedMotion()` in `utils/settings.js`).
- **Balatro-style "juicy" interaction feel.** `utils/motionPresets.js` exports shared `juicyHover`/`juicyTap` framer-motion targets (a squash-and-settle scale sequence on tap, a small wobble-rotate on hover), applied to `Die.jsx`, `ItemIcon.jsx`, and `ConfirmButton.jsx` (the highest-traffic interactive elements) instead of each component inventing its own spring constants. Every call site branches on `reducedMotion` from `useGameSettings()` and returns the plain, motionless default instead when it's on.

## 22. Visual identity pass: pixel UI kit, procedural backgrounds, full-screen round layout (implemented)

Driven by Carlos's reference board (a banded-gold pixel "GAME FONT", an old spellbook sprite, isometric pixel dice, a wooden prop sheet, a pixel HUD with framed bars, and two top-down pixel landscapes) plus feedback that menus had "ugly and unnecessary text" and the whole thing still felt rough.

- **The game owns its palette.** `.elementa-root` pins `data-theme="dark"` and defines its own tokens (`--ink`, `--stone-*`, `--wood-*`, `--gold-*`, `--arcane`) in `elementa.css`, and remaps the site's `brand-*` scale to arcane gold inside the game. The light/dark theme option was removed from Options: a night-sky arcane world regardless of the portfolio's theme. Body text is Pixelify Sans (readable pixel font); headings, numbers, and buttons stay Press Start 2P.
- **Pixel UI kit (CSS only, `elementa.css`).** `.el-panel` (stone, `--dark`, `--wood` planks), `.el-well` (recessed slot), `.el-btn` (beveled, presses down 2px; `--gold` primary, `--arcane`, `--green`, `--danger`, `--ghost`; `--sm`/`--lg`), `.el-chip`, `.el-label`, `.el-key` (hotkey hint), `.el-toggle`, `.el-range`, and `.el-logo` (banded gold letters with an ink outline and drop, built from a hard-stop gradient plus stacked `drop-shadow` filters, echoing the reference title font). Pixel borders use four one-axis box-shadows, which leaves the corners notched like a real sprite. None of these classes set `position`, so Tailwind positioning utilities always win (a real bug: an unlayered `position: relative` beat `absolute`/`fixed` and broke the inspector popover and the pause button).
- **Procedural pixel backgrounds (`components/PixelBackdrop.jsx`).** A canvas at 1/4 screen resolution upscaled with `image-rendering: pixelated`: Bayer-dithered sky bands, summed-sine ridgelines, twinkling stars, and one-pixel motes in the four element colors, at 15fps (a single static frame with reduced motion). Four scenes: `menu` (night sky), `table` (darker, with a slowly turning magic circle whose four element nodes pulse), `shop` (warm dusk, fireflies), `boss` (blood red, embers). The magic circle centers itself on whatever element carries `data-backdrop-anchor` (the dice row), so it sits under the dice even with the sidebar. No image assets; a hand-drawn 480x270 background can replace any scene (see `ASSETS.md`).
- **Pixel icons (`components/PixelIcon.jsx`).** Tiny hand-authored bitmaps as crisp SVG: heart/empty heart, shard, pause, reroll, spark, and 7x7 marks for the four pure elements. Pure-element dice, transmutes, and deck previews use these marks instead of a letter; relics keep a letter until Carlos draws them.
- **Full-screen round layout.** Rolling/missed phases are now a two-column grid: `RoundHUD.jsx` became a left sidebar (difficulty, boss tag, Round and Target stat blocks, hearts, Shards, relic and consumable slots with empty wells showing capacity), and `DiceTray.jsx` fills the rest: a Balatro-style **Base x Mult = Score** readout (Base in water blue, Mult in fire red), the set-bonus chip, a segmented pixel target bar, big dice over the magic circle, and two large actions (Reroll with remaining count, Cast). The old "EARTH . D6" caption under each die is gone: the element mark sits in the die's corner and the tier in the other.
- **Dice restyle (`Die.jsx`).** 96px (64px on phones or with 7+ dice, integer multiples of a future 32px sprite), element-colored beveled face, ink outline, held = lifts and gets a gold ring plus a HELD tag, locked/frozen keep their own ring colors.
- **Menus.** Main menu is the logo, the four element orbs bobbing, a one-line tagline ("Roll the elements. Bend the odds."), and three buttons. The duplicate header title and duplicate version tag are gone (one `v0.3 alpha` in the corner). The run setup screen dropped its four how-to-play bullets (a one-line hint now shows on round 1 instead), deck cards preview their starting dice as icons, and difficulty cards show 1-4 heat pips. Save slots, credits, run preview, game over, pause, and options all share the new panels and buttons (`components/Modal.jsx` is the shared overlay).
- **Shop cleanup.** Owned items on the left in one panel, with "Full" replacing "3/3" when a section is capped; the center is a hanging wooden SHOP sign and three shelves (Dice, Fusion Forge, Relics & items) instead of repeated captions; the right panel is status plus exactly two actions (Next Round, Reroll shop). The Run Info and in-shop Options popovers were removed: counts are visible from the slot grids, and Options/Main menu live in the pause menu, reachable from a visible pause button on every in-run screen. Price tags carry a shard icon and dim when unaffordable.
- **QOL.** Keyboard: `1-9` hold/release a die, `R` reroll, `Enter`/`Space` cast, `Esc` pause (or cancel an armed consumable / close an inspector first), `Enter` retries after a miss. The score reveal can be skipped by clicking or pressing any key, and a new **Scoring speed** option (Normal / Fast / Instant) sets its pace.

**Asset sizes:** see `ASSETS.md` for the full list of what to draw and at what native size (dice 32x32, relics/consumables 24x24, element marks 8x8 and 16x16, UI 9-slices, backgrounds 480x270 in layers).

## 23. Juice, relic wave 2, loadout ladder, Gallery (implemented)

- **Score juice.** During the cast reveal each die throws a floating `+N` (dim `+0` for a fizzle or banned die) as it scores (`Die.jsx`). When the total lands, the Mult box pops, and the table shakes harder the further past the target you went (6px on a clear, 11px at 2x, 16px at 3x+; a short thud on a miss). 2x+ overkill also flashes the screen gold, a miss flashes faintly red (`DiceTray.jsx`, `celebrate()`). New **Screen shake** toggle in Options; reduced motion also disables it.
- **11 new relics** (33 total, `data/relics.js`), each a new effect key read by `evaluatePool`: Loaded Die (max face +3 Base), Tide Chart (locked/frozen die +3 Base), Feather Charm (pairs +1 Mult), Lucky Coin (+1 Shard per explosion on a clear, reducer), Ember Heart (+1 Mult per exploding die), Keystone (+1 Mult if nothing scores 0), Patient Hourglass (+0.5 Mult per unused reroll, `evaluatePool` now takes a `ctx.rerollsLeft`), Prism Lens (+0.5 Mult per distinct element), Glacier Heart (locked/frozen dice score double), Fusion Crucible (fusion dice x1.5), Aether Crown (final Mult x1.5). Per-die bonuses are folded into that die's own contribution so the `+N` popups show them.
- **Loadout ladder** (`data/decks.js`): Stonecaller (3 Earth), Tidecaller (3 Water), Tempest (3 Air), Pyromancer (3 Fire), Wanderer (one of each), Forgeborn (Earth, Fire, Steel), Stormchaser (Fire, Air, Lightning), Avatar (2 Earth + Aether). Each unlocks after **winning a run with the one before it, on any difficulty**. Locked cards show `???`; only the next one names what to beat. Runs now store `deckId`.
- **Profile + completion** (`utils/profile.js`, localStorage `elementa-profile-v1`, independent of save slots): everything seen during a run (own dice/relics/consumables, every shop offer, every forgeable fusion) is recorded; wins mark the loadout beaten. Completion % = (dice + relics + consumables seen + loadouts beaten) / (15 + 33 + 6 + 8), shown on the main menu's Gallery button and in the Gallery.
- **Gallery** (`components/GalleryScreen.jsx`, `phase: 'gallery'`): tabs for Dice, Relics, Items, Loadouts with seen/total counts; undiscovered entries are `?` tiles; clicking a discovered one shows its art tile, rarity, description, and for dice the fusion recipe and mechanics.

### Idea backlog (not built yet)

**Bosses:** Drought (Water can't lock), Eclipse (faces hidden until you cast), Tax Collector (each reroll costs 1 Shard), The Pillar (your highest die scores 0), Gravity Well (faces above 4 score half), Frostbite (one random die starts frozen on a 1), Silence (one random relic is sealed), Scatter (only pairs/threes count, no straights). Severity tiers so round 5/10/15 draw from harder pools, and a unique round-15 final boss (Primordial: the twist changes on every reroll).

**Dice / combination systems:** adjacency "reactions" (dice order matters: Fire next to Air sparks +Mult, Water next to Lightning conducts), Wood (+1 each reroll it stays held, grows), Gold/Midas (scores 0 but pays its face in Shards), Echo (repeats the previous die's contribution), Spirit (copies the element of the die to its left), Chaos (random element every roll), Chrono (a 1 rerolls itself for free once).

## 24. Reactions, bosses 2.0, arcane dice, shaped dice, placeholder item art, cast ledger (implemented)

- **Adjacency reactions** (`data/reactions.js`, `findReactions` in `engine/scoring.js`). Dice are draggable during a round (`REORDER_DICE`, framer-motion `Reorder`), and two neighbors react when between them they cover a reaction's element pair and both actually score. Fusions react as their parents, so one Lightning die can trigger several reactions. Resonance (two identical dice, +2 Base), Kindle (Fire+Air, +1 Mult), Forge (Fire+Earth, + lower face to Base), Scald (Fire+Water, +3 Base +0.5 Mult), Mist (Water+Air, +0.5 Mult), Bloom (Water+Earth, + higher face to Base), Dust Devil (Earth+Air, +4 Base). Reacting edges glow in the reaction's color and each active reaction is listed as a chip under the dice.
- **Arcane dice** (`tier: 'arcane'`, explicit `rarity`, no element, bought from the shop, priced by rarity): Gilded (rare, scores 0 but pays its face in Shards on a clear), Sapling (rare, +2 per reroll it sits out), Mirror (epic, copies its left neighbor), Conduit (epic, its two neighbors react through it), Chrono (epic, a 1 rerolls once for free), Beacon (epic, neighbors x1.5), Prism (legendary, reacts as all four elements).
- **Relics +5 (38)**: Alchemist's Table (+2 Base per reaction), Bookends (first/last die +4), Catalyst Stone (Mult reactions +0.5), Heart of the Circle (middle die x2), Ley Line (first and last dice are neighbors).
- **Consumables +5 (11)**: Whetstone (die permanently +2), Chisel (shrink a tier, the only way to get a d3), Phoenix Feather (+1 life), Aether Dust (pure die becomes a random double fusion containing it), Arcane Seal (die becomes a random rare/epic arcane die).
- **Bosses** (`data/bossModifiers.js`) now have tiers: tier 1 from round 5 (Calm Winds, Grounded, Iron Grip, Drought, Tax Collector, Scatter), tier 2 added from round 10 (Null Zone, Gravity Well, The Pillar, Frostbite, Eclipse, Silence), and round 15 is always **Primordial**, whose twist is re-drawn after every reroll.
- **Shaped pixel dice** (`components/DieSprite.jsx`): a 32x32 rasterized silhouette per tier (d3 triangle, d6 chamfered square, d10 kite with facets, d20 hexagon with a center triangle), outlined, rim-lit and shaded from the element color, drawn at 3x (96px) or 2x (64px). Every element and arcane die has a 7x7 mark (`PixelIcon.jsx`).
- **Placeholder item art** (`data/sprites.js`, `components/PixelSprite.jsx`): 29 hand-authored 12x12 object sprites (orb, gem, flask, crown, hourglass, ...), each relic/consumable mapped to one plus its tint in `ITEM_ART`. Replace with the 24x24 hand-drawn versions per ASSETS.md.
- **Cast ledger** (`components/CastLedger.jsx`): `evaluatePool` now returns `baseLines`/`multLines`, every source of Base and Mult in order (dice, relics, reactions, explosions, sets). The ledger shows them live while rolling (with "Clears by N" / "Short by N"), and the cast reveal steps through them one line at a time: dice pop +N into Base, then Base bonuses, then Mult sources (the Mult box pops on each), then a CLEARED/MISSED verdict before the shop.
- **Stakes unlock like loadouts**: a difficulty needs a win on the one before it (`difficultiesBeaten` in the profile, counted in completion %). Gallery gained a Reactions tab and opens from the pause menu. Shop price tags are about twice as big.

## 25. Tutorial (Pip) and backup files (implemented)

- **Pip, the guide** (`components/Tutorial.jsx`, `data/tutorial.js`, `utils/tutorial.js`): a 14x14 pixel wisp (with a blink frame) who explains each part of the game the first time the player reaches it. Contextual groups, each shown once: `basics` (first round: dice, holding, reroll, Base x Mult, the ledger, the target bar, the HUD, cast), `missed` (first miss: lives and retry), `shop` (Shards and interest, inspecting and buying, inventory, next round), `forge` (first time the Fusion Forge appears), `reactions` (first pool with 2+ elements: neighbors react, drag to reorder), `boss` (first boss round). Each step can spotlight an element tagged `data-tut="..."` (dimmed screen with a gold-ringed hole that tracks the element), and the bubble moves to the top of the screen when the target is in the lower half. While Pip talks, the tutorial owns input: Enter/Space advance, Escape closes the group, and game hotkeys are paused. "Skip tutorial" turns it off; Options has "Replay tutorial". Progress lives in its own `elementa-tutorial-v1` key.
- **Backup files** (`utils/backup.js`, `components/BackupControls.jsx`): because everything lives in localStorage, clearing browser data would erase runs and progress. "Download backup" bundles every `elementa-*` key (3 save slots, gallery/unlock profile, tutorial progress, settings) into `elementa-backup-YYYY-MM-DD.json`; "Load backup" validates the file format, asks for confirmation, replaces those keys, and reloads. Available in Options and on the save-slot screen. Also the way to move progress between devices or browsers.
