# Visuals V3 report: Shop rooms and event backgrounds (Alpha 0.9.8)

Date: 2026-10-09. Branch `elementa-v0.6.5`. Nothing pushed or merged.

## What was built

- **Room engine** (`components/visuals/room/`): a room is data (a module with `Back`, `Ambient`, optional `Front`, `lights`, `motes`, `keeper` position) drawn by one `RoomStage` in a 320 by 180 art box, scaled by a whole number (a fraction on phones). Static layers and animated layers are separate SVGs. Motion is CSS only, transform and opacity, stepped where it can be. One prop library (`props.jsx`, 56 props) so a room is a short list of props plus a palette.
- **17 rooms**, each a lazy chunk: Market, Forge, Alchemist, Relic Vault, Black Market, Shrine, Aether Bazaar, Astral Exchange, Cartography, Clockwork, Observatory, Pantry, Camp, Crossroads, Boss stage, the Table, the Unwritten. The Forge has Vesper's corner (star charts and an orrery) in the Firmament. The Pantry's Void brightens with Mote's meter (`moteFed / 40`).
- **Realm tints** (palette shift only, no new art): Elementa none, Firmament cold violet, Empyrean gridded, Pleroma dissolving, Meridian swinging bands.
- **Real game**: `SceneBackdrop` (new) replaces the single `PixelBackdrop` line in `ElementaGame.jsx`. Shops, the table, boss fights, the Crossroads and the Unwritten get their room; the menus keep `PixelBackdrop`, which is also the fallback while a chunk loads or if it fails to load.
- **12 keeper rigs** (`rigs/`, data from the shipping 14x14 sprites): breathe, blink, talking mouth, nod, shake, hop, glance. `ShopPortrait` (lazy, with the old `KeeperSprite` as fallback) replaces the 72 px portrait in the shop header (`KeeperGreeting`, `CampGreeting`). Vesper's second portrait in the Forge uses the same path.
- **Room event bus** (`roomBus.js`): `welcome, hover, pick, buy, bell, broke, restock, sell, leave`. `ShopScreen` emits them from a wrapped `dispatch` (buy, sell, restock, leave), from opening an inspector (`pick`) and from the existing `playFail` calls (`broke`). **No sound is played**; the names are the V4 hooks.
- **Gallery silhouettes** (V3.5): unseen dice, relics and items show the dark model (or sprite) shape on a neutral tile, in the grid and in the detail panel. Text stays "???", no color, no rarity color.
- **Lab "Rooms" page** (`/games/elementa/visuals/rooms`): every room, every realm, Reduced motion and low-end toggles, keeper on or off, the event buttons, a Mote meter slider, FPS and a running-animation counter.
- **Test saves** (`tools/roomTestSaves.mjs`, output in `tools/room-test-saves/*.json`, index in `room-test-index.json`): the real game standing in 19 states (see Verification).

## Numbers per room

Chunk is the room's own gzip size; the shared engine is `RoomStage` 2.10 kB gzip plus the prop library, loaded once. DOM nodes and animations are measured in the Lab (high tier, keeper off, 2.3 s after the room mounted); the animation count includes the drifting specks.

| Room | Chunk (gz) | DOM nodes | Running animations |
|---|---|---|---|
| Market | 0.82 kB | 355 | 28 |
| Forge | 1.09 kB | 446 | 38 |
| Alchemist | 0.96 kB | 312 | 22 |
| Relic Vault | 0.88 kB | 362 | 19 |
| Black Market | 0.84 kB | 378 | 13 |
| Shrine | 0.78 kB | 306 | 16 |
| Aether Bazaar | 0.86 kB | 267 | 17 |
| Astral Exchange | 0.88 kB | 144 | 38 |
| Cartography | 0.95 kB | 280 | 17 |
| Clockwork | 0.77 kB | 278 | 17 |
| Observatory | 0.94 kB | 220 | 25 |
| Pantry | 0.84 kB | 253 | 12 |
| Camp | 0.82 kB | 173 | 34 |
| Crossroads | 0.73 kB | 60 | 23 |
| Boss stage | 0.63 kB | 229 | 15 |
| Table | 0.59 kB | 75 | 14 |
| Unwritten | 0.61 kB | 30 | 14 |

- `ShopKeeper` chunk 0.66 kB gzip, rig CSS 0.57 kB gzip.
- **Reduced motion:** 0 running animations in all 17 rooms (also with the keeper on).
- **Low-end tier:** static layers only, plus the keeper's blink: 1 running animation (`v-blink`) in every shop room, 0 in the Crossroads. DOM nodes stay 290 to 450 in shops because the static wall and the keeper rig are still drawn.
- **First-load growth:** budget script, first-load JS 419.88 kB gzip against the 413.27 kB baseline = **+6.61 kB overall**, of which about +3.2 kB is V3 (V2 ended at +3.42 kB; the 0.9.5 work in the shared folder is in the same build). Target for V3 was 15 kB or less. On-demand JS 398.4 kB gzip. Room art is never in the main bundle.

## How it was verified

- Lab Rooms page: every room at desktop, with realm tints, event buttons driving the keeper, high, low and Reduced motion modes, EN and ES, phone width. Screenshots in `reports/v3/` (26 files: 14 Lab rooms, Spanish with Reduced motion, phone, Firmament Forge, Pantry meter, and the Gallery).
- **Real game** loaded from the test saves, each opened with Play, Open, Continue run: Forge, Alchemist, Black Market, Camp (shops), the table, a boss fight, the Crossroads. Screenshots 17 to 24. Dice, the HUD, shelves and buttons sit above the room, which is dimmed behind the UI.
- Phone (375 px): `scrollWidth` equals the viewport in the Lab and in a real shop (no horizontal scroll); the room scales to the window height and crops its sides; the shelf and buttons stay on top.
- No new console errors after a fresh load of the Lab Rooms page, the Item gallery or the game (the pane's console buffer still lists four old errors from mid-edit states: a missing-room-file 500 and an old Item gallery trace; both pages load); `vite build` clean; every browser test ran with music and sound at 0 (the test saves set it).
- **Not covered by a real-game save:** Pantry and Astral Exchange (the seeded runs never rolled them in 40 seeds); both verified in the Lab only. Realm 3 and the Unwritten backdrops were verified in the Lab only (the existing realm3 and convergence saves were not re-run in V3).

## `improve-animations` audit (written pass on every loop in the rooms)

Skills `find-animation-opportunities`, `improve-animations`, `animation-vocabulary` and `emil-design-eng` were applied as a checklist; `review-animations` is for you to run (`/review-animations`).

- **Properties:** every loop animates `transform` or `opacity` only (flame, spark, steam, bubble, bob, sway, pulse, twinkle, pendulum, spin, mote, erase, draw, eyes). The constellation "draws" with stepped opacity, not stroke-dashoffset, for that reason.
- **Rhythm:** stepped timing for flames, sparks, bubbles, ticks and eyes (pixel feel); slow ease only for light shafts and bobs. Loops are 2.4 to 20 s with negative delays so nothing starts in sync.
- **Budget:** 12 to 38 running animations per room, one shared ambient loop style, no JS per frame. Ambient layers and motes are not rendered on the low tier, and `data-reduced` turns every animation off.
- **Reactions:** keeper reactions are 150 to 900 ms one-shots (nod, hop, shake) and the mouth runs only as long as the line takes to read (400 ms plus 38 ms per character, max 3.2 s).
- **Findings fixed:** Crossroads door glow was bright enough to wash out the panel text; dimmed the door and added a stronger dim for that backdrop. The Pendulum needed an explicit `transform-origin`.
- **Not done:** the Astral Exchange runs 38 animations (a full ticker plus star twinkles). Fine on the high tier; trim if V6 stacks more on top.

## Defaults I chose (change any)

1. The shop keeps its own 72 px keeper portrait in the header (now a rig); the room behind it has no keeper in the real game, to avoid two of the same person. The Lab shows the keeper standing in the room.
2. The table and realm backdrops are one `table` room plus the realm tint, not five rooms.
3. Boss stages use one stage and the boss's `tone` color when the modifier provides one; none do yet, so every boss uses the default ember red.
4. The Pantry's Void reaches full brightness at 40 fed Shards (the same threshold Mote's first line uses).
5. Crossroads dim is 1.7 times the normal dim, for legibility.
6. Low-end tier is static Back and lights plus the blink, as in V3.7.

## Touches in the other agent's area (minimal, listed for review)

- `ElementaGame.jsx`: the `PixelBackdrop` import and its one JSX line now use `SceneBackdrop` (4 changed lines).
- `components/ShopScreen.jsx`: portraits use `ShopPortrait`; a wrapped `dispatch` and one effect emit room events; `playFail` is a local function that also emits `broke` (about 26 lines; no price, layout or keyboard change).
- `components/ItemIcon.jsx` and `GalleryScreen.jsx`: the `silhouette` prop and its two call sites.
- `src/App.jsx`: the Rooms route (committed with my first V3 commit; the diff there was only my lines when I checked).
- `data/patchNotes.js`, `EXPANSION.md` Part D and `VISUALS.md` status line: V3 entries only, re-read right before editing.

## Skipped or not done

- The V2 weak-spot polish (Windfall, Weights, Loom of Fate, Prism Lens, Bookends, Time Capsule): separate job after V4, as agreed.
- Cinematic boss entrances (V5), the shop interface (V4), the map (V6), Pip, boss, god and Arbiter rigs (V7).
- No sounds; hooks only.
- Pantry and Astral Exchange real-game screenshots (see above). No Playwright run; browser checks were manual in the Browser pane, whose slow frame rate means the animation counter is the reliable measure, not FPS.

## Open questions

1. The Gallery groups unseen entries under rarity or family headers ("Common", "Rare"...), which already reveals a rarity. V3.5 asked for no rarity spoilers in the tile; should unseen entries be grouped under one neutral header too?
2. The Spanish "Bazar del Éter" shows a missing glyph for the É in the pixel font in uppercase labels (Lab and probably elsewhere). Do you want the font patched, or the label spelled without the accent in caps?
3. Boss stage colors: want one color per boss tier (or per boss) in `data/bossModifiers.js`? It is a data change in the other agent's area.
4. Should the real game show the keeper standing inside the room on wide windows (the Lab does), instead of only the header portrait?
5. Keep the dim at its current strength? The rooms read clearly at the edges but the center column is mostly covered by the shop panels.
