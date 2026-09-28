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
