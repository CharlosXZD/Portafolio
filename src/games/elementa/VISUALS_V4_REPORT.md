# Visuals V4 report: the shop is the room (Alpha 0.9.10)

Date: 2026-10-11. Branch `elementa-v0.6.5`. Nothing pushed or merged. Screenshots: `reports/v4/` (13). Scope done: V4.1, V4.2, V4.3, V4.5, V4.6. **V4.4 (the other menus) is not started**, as asked, until Carlos accepts the shop scenes.

## What was built
- **The shop is a scene** (`components/visuals/scene/`, wired in `ShopScreen.jsx`). The four dark panels are gone. In the Market (screenshots `00` before, `01` after):
  - the keeper (the V3.1 bust, cropped at the hands) stands **behind a wooden counter**, their line on a **hanging parchment signboard** with ropes (name, title, visits in its foot);
  - **dice stand on the counter** with **hang-tags** (name and price on a string); an unaffordable tag dims;
  - **relics and items rest on wall shelves**, each on its own plank with a tag pinned under it; **a bought item leaves a gap** until the shop restocks;
  - your pool is a **leather pouch** (stitching, brass buckle, empty slots are recessed pockets, the round result is a stamped ticket); drag to reorder keeps its geometry;
  - the Road is a **map table**: hearts on a brass rail, Shards in a **coin purse**, round and next target as **engraved plaques**, the Road on a **slate** in a brass frame, **Next round is a lever** (a brass arm swings down when pressed) and **Reroll is a bell pull**;
  - the **Forge, Brew, Pantry meter, upgrades, deals, blessings and services** are **boards, scrolls and slates** pinned on the counter (deals and blessings are rolled **scrolls**), sized to their content.
- **Materials system** (`materials.js`): each of the 13 shops has a set (wood, leather, parchment, metal, stone) as four-tone ramps plus its own accent, written as CSS variables; the old wooden sign and every nested panel take them. The object components are `Counter`, `Shelf`, `HangTag`, `Signboard`, `Pouch`, `Pocket`, `Plaque`, `Slate`, `Lever`, `BellPull`, `Board`, `Drawer`; all code art in the pixel style (3 px ink outlines with notched corners, flat tones, hard shadows, light from the upper left). **Swappable by id**: `obj.counter`, `obj.signboard`, `obj.pouch`, `obj.board` accept a file in `public/elementa/visuals/`. Hover, focus, pressed, disabled and selected states are on every button object. The item inspector (a portal) is a parchment tag while a shop is open (the materials are also set on the body).
- **Phones** (V4.2, screenshots `10`, `11`): the scene stacks: signboard, shelf, keeper with sign, counter. The pouch and the map are **drawers** under the counter, with 44 px tabs. No horizontal scroll at 375 px.
- **Sound hooks wired** (`room/roomSounds.js`): `hover` a new very quiet tick (`playTick`, softer than the click), `pick` the click, `buy` and `sell` the coin, `broke` the fail buzz, `bell` (the lever) the clank, through the existing engine, so the Options volume and mute apply; the old direct sounds on buy paths were removed so nothing doubles (BUY_ actions sound through the event; upgrade, brew and service keep their direct coin). The Lab does not install it, so the Lab stays silent.
- **V4.5:** Tiny5's missing ó, ú, ñ, ü now fall back to Pixelify Sans (a pixel face) letter by letter (`--body-font`); the six Laws' scroll rollers and ribbons wear their seal color; Gallery tiles stay 72 px; the old 3D item code is untouched.
- **Also:** the Conclave (six keepers in the Bazaar) is smaller in the stage so the sign keeps room; a "Your pouch" string for the drawer tab; room backdrops are brighter behind shops (dim 0.6) since panels no longer cover them.

## How every control was verified (Browser pane, muted, from the test saves)
Run with JS-driven clicks and DOM checks at 1280 by 720:
- **Market:** buy a die from the counter (dice 3 to 4 of 10, tag showed `Buy 4`), buy a relic (relics 0 to 1, a gap appears), open the inspector (parchment), **reroll** (offers changed), **sell** a die from the pouch (4 to 3, `Sell +2`), pick a stop on the Road (the lever went from `PICK A STOP`, disabled, to `NEXT ROUND`, enabled).
- **Forge:** pick a die and place it in a slot (the slot filled); upgrade board renders.
- **Black Market deal:** taking one deal locked the others (2 enabled to 0). **Shrine blessing:** 3 enabled to 0. **Cartography service:** 3 enabled to 2 (each service once per visit). **Pantry:** feeding a die gave `Feed +8` and the meter moved 0 to 5.
- **Dice drag geometry:** the grid steps 56 px (48 plus the new 8 px gap), matching `DIE_CELL` and `DIE_GAP`, so the drag-to-slot math is unchanged. Not exercised with a real drag: the pane does not run animation frames.
- Reduced motion on: 0 running animations in a Spanish Market (screenshot `02`, also the Spanish check: `Mercado`, `Reliquias y objetos`, `PRÓXIMO OBJETIVO`, accents render).
- Phone width 375: no horizontal scroll; drawers open; tags and counter tap targets are at least 44 px high.
- `vite build` clean.

**Not exercised in a real click** (code paths unchanged, they render): the Brew, buying and using a consumable with the armed-die flow, the Inscribe screen, keyboard shortcuts (Escape cancels an armed item; the pause menu), Spanish and Reduced-motion screenshots of every shop (Market only), the low-end tier (the scene's loops stop under `quality=low` like Reduced motion, by `data-calm`), and the Camp, Clockwork, Observatory and Astral Exchange scenes (their saves exist and load; I did not open them after the final layout).

## Numbers
Measured at 1280 by 720, high tier, 2.5 s after load (scene nodes include the pouch, its sprites and the keeper; "room" is the V3 backdrop):

| Shop | Scene DOM nodes | Room DOM nodes | Scene animations | Room animations | Boards |
|---|---|---|---|---|---|
| Market | 2746 | 356 | 31 | 28 | 0 |
| Forge (Firmament, with Vesper) | 3474 | 447 | 47 | 38 | 2 |
| Alchemist | 2453 | 313 | 25 | 22 | 1 |

The other ten shops were not measured one by one. First-load JS is **424.70 kB gzip** (baseline 413.27), **+11.43 kB over the whole overhaul, of which about +3.5 kB JS and +2.7 kB CSS is this phase**, under the 15 kB V4 budget. The scene objects and CSS are in the main bundle (they are small); the room art, the keeper rigs and the item sprites stay lazy chunks. The scene's own loops are the sign's sway, the tags' swing and the lever arm.

## `improve-animations` pass on the new motion
- All loops are transform or opacity only and stepped: the signboard sways 0.8 degrees on a 7 s step loop, a tag swings once (0.5 s, 3 steps) when you hover its slot, the lever arm swings from -24 to 28 degrees in 3 steps when pressed, plaques press down 2 px. Nothing runs continuously except the sign's sway.
- Hover on any slot also sends the `hover` event (a very quiet tick); the existing keeper reactions (nod, hop, shake) still answer pick, buy and broke.
- Reduced motion and the low-end tier set `data-calm` on the scene root, which switches the sway, the swing and the lever off; there was nothing to switch off in a still scene.
- Kept short: the stagger of the shelf cards on a restock is the old one (0.06 s each).
- **Risk to watch:** the pane showed the shelf and sign mid-fade for about 10 s after a load (the pane runs about 1 frame a second); in a real browser this is the usual 0.45 s fade.

## Defaults I chose (change any)
- The bag and the map sit at the top of their columns (I tried sticky-to-the-bottom; the game root clips overflow, so sticky never engaged). The center column is the room.
- Left column 312 px, right 262 px at 1024 px and up. Below that the scene stacks and the bag and map are drawers.
- The keeper is crop 17 of 18 rows (the hands rest on the counter's far edge) at 112 px on desktop, 126 px from 1500 px, 84 px on phones. A second keeper (Vesper) stands beside the first, with a second sign under the first.
- Dim behind shops is 0.6 of the V3 value (more of the room shows).
- Parchment objects remap the text tokens to dark ink; boards, the pouch and the map table remap them to light parchment text, so every label stays readable (contrast checked by eye, not by a tool).
- The Forge panel, the Pantry meter and every OfferShelf that is not dice or items are `Board`s; the card text colors (deal and blessing titles) are darkened toward ink so they read on parchment.

## Skipped or open
- **V4.4** (main menu, file select, options, pause, run preview, results, game over, Gallery, Inscribe, the boss reward screen) not started.
- The flat dark tooltips for dice (`DieHoverCard`, `DieFullModal`) are unchanged (small, sized to the text).
- The boss reward and the Inscribe screens are still the old panels (V4.4).
- A bought item's gap is per shelf and visit; the shelf does not close up until the restock.
- The Road map itself is the existing component on a slate (V6 redraws it).

## Skills used
`emil-design-eng`, `impeccable`, `high-end-visual-design`, `design-taste-frontend`, `redesign-existing-projects`, `full-output-enforcement`, `find-animation-opportunities`, `improve-animations` (the written pass above), `animation-vocabulary`, `playwright-best-practices` (loaded; checks were manual). `review-animations` is user-only: please run `/review-animations`.

## Open questions
1. The bag and map are tall objects at the sides (about 45 percent of a 1280 px window together). Is that the right balance of room to objects, or should the bag shrink to a satchel on the counter's near edge?
2. The center column grows downward with the boards (the Forge panel is below the fold at 720 px). Prefer boards beside the keeper, or stacked as now?
3. The shelf planks share the screen with the room's own shelves (the Market has one). Should the room art lose its shelves in the shop version?
4. May I now start V4.4 once you have looked at these scenes?
