# Elementa: Art Asset Spec

What to draw, at what size, and how it will be displayed. Every sprite is drawn at its **native pixel size** and the game scales it up by a **whole number** (×2, ×3, ×4) with `image-rendering: pixelated`, so pixels never blur or wobble. Never draw at display size, and never pick a size that forces a ×1.5 scale.

## Ground rules

- **Pixel grid:** 1 art pixel = 2, 3, or 4 screen pixels depending on the element (listed per asset below).
- **Format:** PNG, transparent background, no anti-aliasing, no semi-transparent edge pixels (except glows on purpose).
- **Outline:** 1px dark outline in the ink color `#120c1a`, same as the UI. Light from the top-left.
- **Palette:** stick close to the tokens in `elementa.css` (`--ink`, `--stone-*`, `--wood-*`, `--gold-*`, `--arcane`) plus each element's color in `data/elements.js`. Elements own their color everywhere (GDD §14).
- **Where files go:** `public/elementa/<category>/<id>.png` (for example `public/elementa/relics/molten_core.png`). Use the item's `id` from the data files as the file name, so wiring them in is one line per component (`ItemIcon` already takes an `iconSrc`).

## 1. Dice (you're drawing these)

| Asset | Native size | Shown at | Count |
|---|---|---|---|
| Die face, one per element | **32 × 32** | ×3 = 96px (table), ×2 = 64px (crowded pool / phones) | 22 (4 pure, 6 double, 4 triple, Aether, 7 arcane) |
| Face numbers 1-20 (sheet) | **10 × 12** per glyph | drawn on top of the face by code | 1 sheet |
| Roll animation (optional) | 32 × 32, **6 frames** in a strip (192 × 32) | ×3 | 1 generic, or 1 per element |
| Held / Locked / Frozen overlays | **36 × 36** (2px bigger than the die on each side) | ×3 | 3 |
| Tier badge d3 / d6 / d10 / d20 | **12 × 7** | ×2 | 4 |

Leave the **center ~16 × 14** of the die face flat (no detail), that's where the number goes. Put the element mark in the top-left corner (about 8 × 8), like the placeholders do now.

**Placeholders in the game right now:** `components/DieSprite.jsx` draws each tier's silhouette procedurally on the same 32×32 grid (d3 triangle, d6 square, d10 kite, d20 hexagon). Match those silhouettes so the tiers stay recognizable: you can draw one blank body per tier and let the game tint it per element, or one per element and tier.

## 2. Relics and consumables (you're drawing these)

| Asset | Native size | Shown at | Count |
|---|---|---|---|
| Relic icon | **24 × 24** | ×3 = 72px (shop), ×2 = 48px (inventory, round sidebar) | 38 (`data/relics.js`) |
| Consumable icon | **24 × 24** | same as relics | 11 (`data/consumables.js`) |
| Rarity frame (optional) | **28 × 28** | drawn behind the icon | 5 (common, uncommon, rare, epic, legendary) |

The current placeholders are 12 × 12 objects in `data/sprites.js` (`ITEM_ART` says which object each item uses), a good starting sketch for each one. The game already draws a rarity-colored frame and glow around every icon, so relic art should **not** include its own border or background: just the object on transparency, with 1-2px of breathing room inside the 24 × 24. The `itemConcept` text on each relic in `data/relics.js` is the art brief.

## 3. Small UI icons

| Asset | Native size | Shown at |
|---|---|---|
| Element marks (Fire, Water, Earth, Air) | **8 × 8** (inline) and **16 × 16** (menus, orbs) | ×2 |
| Fusion element marks (optional) | 8 × 8 / 16 × 16 | ×2 |
| Heart full / empty | **8 × 8** | ×2 |
| Shard (currency) | **8 × 8** | ×2 |
| Pause, reroll, lock, snowflake | **8 × 8** | ×2 |

## 4. UI frames (9-slice)

These replace the CSS panels/buttons later. Draw each as a small square with the **corners** fully detailed and the **edges/center** tileable; the code stretches the middle.

| Asset | Native size | Corner size | Notes |
|---|---|---|---|
| Stone panel | 24 × 24 | 8px | main panel (sidebar, modals) |
| Dark panel | 24 × 24 | 8px | shop shelves, tooltips |
| Wood panel / sign | 24 × 24 | 8px | modal title bars, shop sign |
| Recessed slot (well) | 12 × 12 | 4px | empty inventory slots |
| Button, 4 colors × 3 states | 16 × 16 each | 5px | gold, arcane, green, danger; normal / hover / pressed |
| Progress bar segment | 6 × 6 | n/a | lit + unlit |

Shown at ×3 (so an 8px corner becomes 24px on screen).

## 5. Big pieces

| Asset | Native size | Shown at |
|---|---|---|
| Logo "ELEMENTA" | about **160 × 32** | ×4 desktop (640 × 128), ×2 phone |
| Shop sign (hanging) | **64 × 20** | ×3 |
| Boss round banner | **96 × 16** | ×3 |

## 6. Backgrounds

The game fills the whole screen, so backgrounds are drawn at **480 × 270** (16:9) and shown at ×4 on a 1080p screen (×3 on 1440 × 810 laptops, ×2 on small screens), cropped to cover. Split each into layers so they can drift independently:

| Scene | Used for | Layers (each 480 × 270, transparent where empty) |
|---|---|---|
| **Night sky** | main menu, slots, setup, game over | sky gradient, stars, far hills, near hills |
| **Arcane table** | rolling a round | sky, magic circle (separate **160 × 160**, so the code can spin it), floor or altar |
| **Dusk market** | shop | sky, far hills, market stall / props |
| **Blood moon** | boss rounds | sky, moon, embers, hills |

Keep the middle 60% of the table and shop scenes calm and dark: that's where the dice and shop shelves sit. The current procedural backdrop (`components/PixelBackdrop.jsx`) already follows this layout, so it doubles as a composition guide.

## 7. Optional extras

- Cursor: **12 × 12** (×2).
- Particle sprites for element motes: **3 × 3** each, 4 elements, 2 frames.
- Title screen character or familiar: whatever fits in about **64 × 64** (×3).

## Suggested drawing order

1. The 4 pure dice (32 × 32) and the 4 element marks. These are on screen 90% of the time.
2. 6-8 relics you like most (24 × 24), to prove the style in the shop.
3. Stone panel + gold button 9-slices, which re-skin every menu at once.
4. One background (the arcane table).
5. Everything else.

## 8. Swapping any new visual for your own art (the registry rule)

The visual overhaul (`VISUALS.md`) never imports its assets directly. Every new visual has an **id** in `data/visualRegistry.js` (for example `spike.relic.ember_heart`, `rig.keeper.tobb`, `room.market`), and the game asks the registry for the id. The registry says what the id is today: `code` (drawn by code), `three` (a cached low-resolution 3D render), `remotion` (a composition) or `image` (a file).

**To replace a code-made visual with your own drawing, with no code changes:** save a file named exactly like the id in `public/elementa/visuals/`:

```
public/elementa/visuals/spike.relic.ember_heart.png
public/elementa/visuals/rig.keeper.tobb.svg
```

- Accepted formats, tried in this order: `.png`, `.webp`, `.svg`. The first one found wins.
- Draw at the **native size** from section 2 to 6 above (24 x 24 for items) and the game scales it by a whole number with `image-rendering: pixelated`. The registry does not smooth or resize art.
- The lookup is a small request made the first time an id is shown and remembered for the session. In the Visual Lab (`/games/elementa/visuals`) the "showing" column says `image (file)` for every id that found a file, and "Look for files again" re-checks after you drop one in.
- A file replaces the whole visual for that id. For a layered rig that means a still picture instead of the moving rig, so use it only when the art is meant to be still.
- Ids are lowercase with dots between the category, the kind and the name. New ids are added to `data/visualRegistry.js`, never invented in components.

**Map signs (V6).** Each shop type's sign on the Road is code art (`components/visuals/map/mapSigns.js`, 12 by 12 letter grids). To replace one, save `public/elementa/visuals/map.node.<shop id>.png` (or `.webp`, `.svg`), for example `map.node.market.png`, `map.node.forge.png`, `map.node.crown.png` (the Crown stop). Draw it square (24 by 24 suggested); it is shown at 28 to 44 px with pixelated scaling, inside the shop-colored seal.

**Characters (V7, V8.2).** Every V7 rig (`components/visuals/rigs/CharacterRig.jsx`) is the registry id `rig.<id>`: `rig.pip`, `rig.arbiter`, `rig.gaea`, `rig.ognen`, `rig.varuna`, `rig.zephyr`, `rig.primordial`, `rig.you`, and every boss avatar by its boss id (`rig.dawn`, `rig.axiom`, `rig.calm_winds`, the ids in `data/bossModifiers.js` `BOSS_COLORS`). A file `public/elementa/visuals/rig.<id>.png` (or `.webp`, `.svg`) replaces the body everywhere that character shows (story scenes, the table, the boss reward, the Gallery page, Pip's tips); the motion of the rig (a one-pixel float, the flinch, the slump, the glow) still applies to your picture, so draw it as one standing figure on a transparent background, square, 16 by 16 or 32 by 32. The keepers' layered rigs keep `rig.keeper.<id>` (section above).

**Items (V2).** Every relic and consumable is the registry id `item.<item id>`: `item.molten_core`, `item.rune_echo`, `item.const_phoenix` and so on (the ids in `data/relics.js` and `data/consumables.js`). A file at `public/elementa/visuals/item.<id>.png` (32 by 32 since V2.5, drawn at its native size; a 24 by 24 file still works and is shown at its own size) replaces that item's sprite in the shop, the inventory, the inspector and the Gallery. The model table is `data/itemModels.js`; the "Item gallery" page in the Visual Lab shows every id with its current model.

**Item sprite style (V2.5).** Items are hand-authored 32 by 32 pixel sprites drawn in code (`components/visuals/sprites/`): a recipe per item id (`relicsA.js`, `relicsB.js`, `relicsC.js`, `consumablesA.js`, `consumablesB.js`, `recipes.js`) painted with a small kit (`spriteKit.js`) and shared base shapes (`bases.js`, `shapes.js`). The kit applies the same light, outline and shadow to every item, so a recipe is only shapes and a palette. If you draw your own art to replace one, follow the same bible so it sits beside the others:
1. **32 by 32**, a 1 px transparent margin, shown at x2 to x4 (16 by 16 for tiles under 38 px, derived by keeping each 2 by 2 block's darkest solid pixel).
2. **One silhouette that reads in solid black.** The Lab's silhouette sheet shows every item as a dark shape; two items must not share one (families excepted, rule 10).
3. **A 1 px colored dark outline**, never pure black (a dark tint of the color it surrounds), and a **1 px soft drop shadow** at the lower right.
4. **Three or four flat tones per material** (dark, mid, light, highlight), no dithering inside an object, **one bright highlight** at the upper left; light always comes from the upper left.
5. **Clear bezels and frames:** a rim or setting is one even tone.
6. **One signature detail** (a flame, a drop, a gear, an eye), at most 4 by 4 pixels, centered.
7. **Simple beats detailed:** the plainest drawing a stranger can name.
8. **Front view**, or a 3/4 top view for books, chests and boxes. No rotation poses.
9. **Elements own their color** (fire red-orange, water blue, earth tan and brown, air pale); neutral items use gold, brass, stone and wood. **Rarity** is the glow and the frame of the tile, never a recolor of the body, and trims stay metallic.
10. **A family look so a set reads as a set:** Runes are stone tablets with a glowing glyph, Constellations star charts on a dark disc with four studs in the reaction's colors, Totems carved poles in the element's colors, Transmutes tall vials of the element's liquid, Laws sealed scrolls with a colored wax seal.
The idle life is 2D and stepped (a 2 px bob, glints on metals and gems, flickers on flames, a shimmer on liquids; hover lifts); Reduced motion and the low-end tier show one still frame. The old 3D models (V2) stay in the Lab's Item gallery; the game no longer builds them.
