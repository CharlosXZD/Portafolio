# Visual overhaul, phase V2: report (Item models)

Built 2026-10-09 on branch `elementa-v0.6.5` as Alpha 0.9.7 "Item models". Small commits, nothing pushed or merged, no worktrees, the game muted for every browser test, no generated art (everything is code: Three.js geometry, canvas glyphs, CSS). Scope was relics, consumables, runes, Constellations, Totems and Laws: **115 items**. Dice are untouched.

## What was built

| Piece | Where |
|---|---|
| The toolkit (palette, 2D silhouettes to extrude, pixel glyph decals, toon-lit mesh helpers) | `components/visuals/three/itemKit.js` |
| 20 generator families: gem, flask, scroll, tool, coin and seal, tome, pouch, crown and temple, ring and bell, hourglass, clock (gear, watch, gyro, spring, metronome, cuckoo), rock (core, river, slab, stones, arch, whetstone, charm, runestone, ammonite), totem, cut (extruded silhouettes), orb, chest, shell, composite (bundle, balance, nest, jar, chain, table, twist, padlock, mirror, thimble, bellows), plate (star charts), cube | `components/visuals/three/itemGenerators.js` |
| **The item table**: every item id to a family, parameters and details, built from its `itemConcept` and element | `data/itemModels.js` |
| Idle-time atlas queue (priority, hidden-tab aware), 16 frames of 24 by 24 | `components/visuals/three/itemAtlas.js` |
| `ItemModel` component: fallback until ready, fade in, idle turn, hover steer and tilt, buy reveal, swap rule | `components/visuals/ItemModel.jsx`, `itemModel.css` |
| Integration: `ItemIcon` gets an `itemId` and loads `ItemModel` lazily; descriptors carry `itemId`; the inspector shows a larger turn; shop owned slots and the sidebar reveal new items | `ItemIcon.jsx`, `data/itemDescriptors.js`, `ItemInspector.jsx`, `ShopScreen.jsx`, `RoundHUD.jsx`, `GalleryScreen.jsx` |
| **Item gallery** page (all items by rarity, element or kind; build-everything timer; the uniqueness check) | `/games/elementa/visuals/items`, `ItemGalleryPage.jsx`, `itemCheck.js` |
| Test save that stands in a shop with Shards and a few items | `tools/itemShopTestSave.mjs` |
| Patch notes "Alpha 0.9.7 Item models" | `data/patchNotes.js`, Part D of `EXPANSION.md` |

Where it shows: shop shelves (slow idle turn), the sidebar and shop inventory strips and the Gallery (still until you point at them, then the angle follows the cursor), the inspector (a 72 px model in a well above the name, turning), the Run Preview and game-over lists (still). Everything with an `itemId` and a tile of at least 36 px gets a model, everything else keeps the sprite. Unseen items in the Gallery keep their "?" tile, so nothing is revealed.

## How an item is made

An entry is `{ gen, p, d, tone }`: the family, its parameters, optional extra details (sparks, a glint, a gold bolt, four element colors, a cage...) and a neutral tone for items without an element. The element comes from the item's own data (Fire `#e5533d`, Water `#3d8fe5`, Earth with the menu's lift `#c89a5c`, Air `#cfe0e8`), neutral items use the gold and stone palette (or the concept's own color where it names one: green clover, violet sand, blue crystal), and **rarity sets the trim and the glow** from `RARITY_GLOW` (the existing scale, no new colors): the trim bands, rims and small gems are in the rarity color, plus the halo in the tile. Rendering reuses the V1 pipeline: orthographic camera, a toon ramp, light from the top left, 96 px supersampled and shrunk to 24, hard alpha, 5 levels per channel, a 1 px ink outline. Signature details are mostly geometry (a flame cutout, a gear's teeth, a bell's second bell, a clover's four lobes) and, where 24 pixels need a mark, canvas decals (an eye, nine rune glyphs, ten constellation signs).

## Numbers

All 115 items, "Build all models" in the Item gallery (dev server, one item per idle slot, so wall time depends on how busy the browser is):

| | |
|---|---|
| Build time, whole set | 0.8 to 2.7 s across runs (sequential, in idle time) |
| Per item | **17 to 18 ms average**, 64 to 91 ms for the slowest (the first, which creates the WebGL context, and the biggest composites) |
| Memory | **4.04 MB for all 115** (36.9 KB each: 16 frames of 24 by 24 RGBA) |
| Cost per frame afterwards | one `drawImage` of a 24 px frame; the shared turn clock is a few microseconds a frame |

Bundle (`node src/games/elementa/tools/visualBudget.mjs --build`): first-load JavaScript **416.69 kB gzip, +3.42 kB** over the pre-overhaul baseline (V1 was +2.03; V2 adds 1.4 for the lazy hooks, the `itemId` plumbing and the patch notes text). Loaded on demand with the first item that needs it: the model code, table and atlas 16.2 kB gzip, `ItemModel` 1.3 kB plus 0.4 kB of CSS, and the shared `three` chunk (177.6 kB gzip, already on-demand since V1). The Item gallery page is a further 4.2 kB and only loads at its URL.

## Uniqueness check

The check (`components/visuals/itemCheck.js`, run from the Item gallery) renders four angles of every item and compares every pair pixel by pixel (shape and color together); a pair is "too alike" below **0.20** (the share of solid pixels that differ, averaged over the angles). Across 115 items (6,555 pairs):

- **First run: 40 pairs flagged.** 36 were the nine rune stones (same slab, only the glyph differed), then the two crucibles (Fusion Catalyst and Fusion Crucible), the two violet seals (Arcane and Warp) and two hourglass pairs (Patient Hourglass, Extra Reroll, Sand Hourglass).
- **Fixes:** each rune is now its own stone (nine different silhouettes and colors with its glyph on a dark plate); the Crucible shows four element-colored quadrants while the Catalyst sits on flames with white-hot contents; the Warp Seal is a six-sided seal with gold tails; the hourglasses got different frames (stone, violet with a reverse arrow, a wide wooden one). The ten star charts were nearly identical blue plates, so they now differ in outline and frame color (triangle, wide, tall, round, hexagon, octagon, diamond, rectangle).
- **Final run: no pair below 0.20.** Closest pairs: Petrify and Rune of Echo 0.269, Deep Pockets and Shard Pouch 0.333, Transmute: Earth and Transmute: Water 0.418 (the four transmute vials and the four Totems differ only by element color, which is the rule, and the check counts that as different).

The check is a floor, not a verdict: it cannot say whether something reads as the right object. See "Weak spots" below.

## Items that fell back, and why

**None failed to build** (0 of 115 resolved to null). The old sprite is shown in these cases, by design:

1. Until an item's model is built (it fades in over 160 ms when ready).
2. On the low-end tier (fewer than 3 cores or 2 GB of memory, data saver, or under 24 fps on the probe), and in a browser without WebGL.
3. Tiles under 36 px (the Gallery's 24 px mini tiles, the run summary's smallest strips).
4. Items the Gallery has not seen (they stay "?" tiles).
5. A hidden tab: the queue waits and builds when the tab is shown.
6. Dice, boons and anything without an entry in `data/itemModels.js`.

## Verification

- **The Item gallery** at 820 px (1:1), 1280 px and 375 px, by rarity, element and kind, in English and Spanish, with Reduced motion on and off, quality forced low, and the swap rule with a test PNG (screenshots below). No horizontal scroll at 375.
- **The real game**, on a test save that stands in the Market (`tools/itemShopTestSave.mjs`) and on the Firmament test save at the table: shelf models, the sidebar relics, the Law slot, the consumables, the Run Preview, the inspector with its larger model, a purchase (the new item gets `data-reveal` and, from uncommon up, the ring), and no console errors. Dice kept their sprites and `ElementFx` throughout.
- Lint is clean for everything new; the build and the budget script pass.
- **Changed but not opened in the browser:** the in-game Gallery's three `ItemIcon` call sites (they pass `itemId` the same way the others do), and the Run Preview and game-over lists beyond the Run Preview on the Firmament save.
- **Not verified:** real frame rate and phone performance (the Browser pane throttles frames to 1 or 2 a second and sets the tab hidden at times; I spoofed visibility to let idle builds run), Safari and Firefox, a production build's idle behaviour, and a real touch device. Please open the gallery and a shop in your own browser and watch the shelf turn.

## Screenshots (`reports/v2/`)

1. `01-gallery-common-desktop-en.jpg`: Common (16)
2. `02-gallery-uncommon-desktop-en.jpg`: Uncommon, the first rows
3. `03-gallery-rare-desktop-en.jpg`: Rare
4. `04-gallery-epic-legendary-desktop-en.jpg`: Epic and Legendary
5. `05-gallery-mythic-laws-desktop-en.jpg`: Mythic (the Laws)
6. `06-gallery-by-element-desktop-es-reduced-motion.jpg`: grouped by element, Spanish, Reduced motion
7. `07-market-shelf-and-inspector-desktop-en.jpg`: the real Market, an item inspected (larger model)
8. `08-swap-rule-png-replaces-molten-core.jpg`: a test PNG replacing the Molten Core model (file since removed)
9. `09-gallery-common-phone-en.jpg`: 375 px
10. `10-table-sidebar-relics-law-consumables.jpg`: the table's sidebar
11. `11-market-shelf-desktop-en.jpg`: the shelf of the Market
There is no "before" strip as a separate image: every gallery cell shows the old flat sprite beside the new model (the small sprite at the right of each cell).

## Motion audit (improve-animations, read-only on the idle and reveal motion)

Recon: a playful, tactile game; shared easings `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out) and `(0.77, 0, 0.175, 1)`; frequency: the sidebar is on screen for the whole run, shop shelves are seen a few dozen times a run, the reveal happens at most a handful of times.

| # | Severity | Finding | Verdict |
|---|---|---|---|
| 1 | **HIGH, fixed** | The first integration made every interactive tile turn forever, which put ten spinning icons next to the score in the sidebar (decoration on a surface read constantly, "tens a day" frequency). | `ItemIcon` now defaults to `modelMotion="hover"` (still until pointed at); only shop shelf cards pass `"turn"`. |
| 2 | OK | Idle turn: 6 frames a second stepped (pixel feel), 2.7 s a revolution, one shared clock, paused off-screen (IntersectionObserver) and in hidden tabs, still under Reduced motion. | Purpose: state indication of "this is an object". Cheap and calm. |
| 3 | OK | Hover steer and tilt: a 140 ms `transition` (interruptible), `perspective` rotateX/Y of at most 7 degrees, mouse only (a finger dragging does not tilt), `transform` only. | Combined with the existing framer hover wobble on shelf buttons it is a lot of hover at once; if it feels busy, drop the tilt there first. |
| 4 | OK | Fade-in 160 ms ease-out when the atlas is ready (prevents a pop). | Exit is not needed. |
| 5 | OK | Buy reveal: 360 ms pop (0.88 to 1.08 to 1) and a ring that grows to 1.5 and fades in 560 ms (760 ms with a double glow for epic and up), common items only the pop. Over 300 ms, but it is the rare, deliberate moment (the delight tier); off under Reduced motion. | Keep; check by feel. |
| 6 | LOW | The ring and pop are keyframe one-shots (not interruptible). They cannot restart quickly because a bought item plays them once. | Fine. |
| 7 | LOW | Everything animates `transform` and `opacity` only; no `transition: all`, no `ease-in`, no animation from `scale(0)` (the pop starts at 0.88). | Pass. |

Carlos runs `/review-animations` himself on `components/visuals/` (`ItemModel.jsx`, `itemModel.css`, `ItemGalleryPage.jsx`) and `ItemIcon.jsx`.

## Weak spots (honest list)

The set is distinct, but some items are not yet great at 24 pixels and are the candidates for a polish pass: **Windfall** (reads as a gold nugget more than stacked coins), **Weights** (reads as a handbag), **Loom of Fate** (reads as a door), **Prism Lens** (a blue block with rays), **Bookends** (the owls read as a cat), **Time Capsule** (pale), **Mirror Shard** and **Keystone** (plain), and the three seals, which share a family. Also the model's own shading can be dark for deep colors (Molten Core, Fusion Crucible) because the toon ramp's darkest step is 41 percent.

## Skills

Loaded with the Skill tool earlier in this same session, before V1, and still in context for V2 (I did not reload them): `remotion-best-practices`, `remotion-saas`, `remotion-markup`, `remotion-docs`, `find-animation-opportunities`, `improve-animations`, `animation-vocabulary`, `emil-design-eng`, `impeccable`, `high-end-visual-design`, `design-taste-frontend`, `redesign-existing-projects`, `full-output-enforcement`, `playwright-best-practices`, and `threejs-fundamentals`, `-geometry`, `-materials`, `-lighting`, `-textures`, `-loaders`, `-shaders`, `-postprocessing`, `-animation`, `-interaction`. Used for V2: the three.js geometry, materials, lighting and textures skills (lathe, extrude, toon ramp, canvas textures with nearest filtering), `improve-animations` (the audit above), `emil-design-eng` and `animation-vocabulary` (the motion rules), `design-taste-frontend` and `redesign-existing-projects` (fitting the existing UI), `full-output-enforcement` (complete files). Not applicable this phase: the Remotion skills. `review-animations` is user-invoked and was not run.

## Defaults I chose

- Resting view is turned about 29 degrees (frame 0), so flat faces read and the sides show.
- Earth uses the menu's `#c89a5c` for items (the same lift the main menu's orbs use); the die colors are untouched.
- Neutral items use `gold` unless the concept names a color or stone (grey stone, iron, brass, parchment).
- Rarity trim is `RARITY_GLOW`: common grey, uncommon sky blue, rare red, epic violet, legendary yellow, mythic pink (the existing scale, even where a red trim sits beside a blue item).
- Sidebar and inventory tiles are "hover" (still), shop shelves "turn"; Reduced motion is always still.
- The tile threshold for a model is 36 px, the scale is the largest whole number of 24 px steps that fits inside the tile's border.
- Constellation signs are my own star patterns (ten pictograms), not data.
- The uniqueness threshold is 0.20 of differing pixels; stricter is possible.
- Probing for a hand-drawn file costs one cached `HEAD` request per item shown.

## Open questions

1. Is a red trim on a blue item (a rare Water relic) what you want from "rarity sets the trim", or should trims stay metallic and only the glow use the rarity color?
2. The star charts: keep the ten signs as drawn, or should each Constellation take its reaction's colors from `reactions.js`?
3. Shop shelves turn slowly. Should the sidebar do the same on hover only (as now), or never move?
4. Do you want the polish pass on the weak spots above now, or after V3 and V4?
5. Should owned-but-unseen Gallery items show a model silhouette (the dark shape of the model) instead of "?" in V3?
