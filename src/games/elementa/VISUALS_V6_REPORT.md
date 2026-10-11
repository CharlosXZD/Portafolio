# V6: The Map, report (Alpha 0.9.13 "The Road", 2026-10-11)

## What was built
- `components/visuals/map/` (new): `mapModel.js` (pure layout, realms, states, trails, keyboard neighbors), `mapSigns.js` and `mapIcons.jsx` (14 code-drawn shop signs, traveler, flag), `MapCanvas.jsx` (the SVG map), `MapFull.jsx` (full-screen overlay), `map.css`, `MapsPage.jsx` and `mapSamples.js` (Visual Lab "Maps" page at `/games/elementa/visuals/maps`).
- `components/RoadMap.jsx` is now a thin wrapper with the same props as before plus `variant` (`compact`, `panel`, `full`) and `expandable`. Users: the shop's map table (compact, with an "open the big map" button), Run Info (panel), Run Preview (compact).
- Looks: parchment (the shop's own `--p*` material) for Elementa; star chart (Firmament), grid (Empyrean), dissolving ink (Pleroma), split sheet (Meridian), blank page (Unwritten); drawn gates between realms and above round 45; inked trails (walked gold, live marching, fog dashed); boss banners with the boss avatar when known; traveler with a lantern on your stop; a ghost traveler walks the trail to the stop you pick (skipped under Reduced motion and Instant speed); a flag on the picked stop; fog beyond your sight (round + 3 + Road sight).
- Interaction: wheel zoom (full) or Ctrl/Cmd+wheel (panel), drag pan, two-finger pinch, arrows pan, plus/minus/0/C/Home keys, center on me, fit, keyboard moves between stops by direction, Enter/Space picks, Escape closes the big map, tooltips on hover and focus (name, blurb, sells, state), 44 px hit targets on touch, culling of rows outside the view.
- Words (EN and ES) in `src/i18n/strings.js` (`elementa.map.*`), patch notes 0.9.13, EXPANSION Part D, ASSETS section 8 note (`map.node.<shop id>` swap).

## Every map function still works (how it was checked)
- `engine/map.js` has no diff against HEAD (checked by `tools/mapTest.mjs`).
- `node src/games/elementa/tools/mapTest.mjs` ("all ok", 49+ checks) on three real test saves (`tools/map-test-saves.json`, built by `tools/mapTestSaves.mjs`: Elementa round 8 with a foretold boss, Firmament round 20 at Atlas's Cartography with 400 Shards, Pleroma round 38): realm and gate placement, node states, trails, keyboard navigation, tooltips, sign grids, and the engine actions CHOOSE_PATH, USE_SERVICE Redraw, Add a path and Peek, plus the Prophecy and peeked boss names reaching the banners.
- In the browser (muted): picking a stop on the compact map, the full map and the panel (CHOOSE_PATH, Next Round enabled); Atlas's Redraw changed the map's shop types, Add a path added a trail (12 to 13 trails, 2 choices) and Peek recorded the boss, all from the real game on the Cartography save.

## Numbers
- First load (main `index-*.js`): before 1,027.06 kB / 334.30 kB gzip; after 1,027.70 kB / 334.46 kB gzip (+0.16 kB gzip). CSS main unchanged (83.29 kB / 15.81 kB gzip).
- The map is lazy: `MapCanvas` chunk 28.48 kB / 10.43 kB gzip plus 5.06 kB / 1.66 kB gzip CSS (requested as soon as RoadMap.jsx loads, so it is normally ready before the first shop), `MapFull` 1.70 kB / 0.89 kB gzip, Maps Lab page about 10 kB / 3.8 kB gzip.
- Signs are one `<path>` per color (a sign is a few paths, not a hundred rects); the Road in the panel and full variants only draws visible rows plus 2.

## Screenshots (`reports/v6/`)
`full-map-phone-en.jpg`, `full-map-phone-es.jpg` (375 x 812), `phone-controls-es.png`, `lab-firmament-es-reduced-low.jpg` (Spanish, Reduced motion, forced low quality). Desktop views of the Lab page, the shop map table, the Run Preview and the picked-stop flow were checked in the Browser pane during the build.

## Skills used
emil-design-eng, impeccable, high-end-visual-design, design-taste-frontend, redesign-existing-projects, find-animation-opportunities, improve-animations, animation-vocabulary, playwright-best-practices, full-output-enforcement.

## Defaults I chose
- Rows beyond sight show "?" fog seals in the panel and full variants; the compact map is limited by its caller.
- The compact map is not interactive for gestures (only picking, hover and the open button); zoom and pan live in panel and full. The open button shows in the shop only (`expandable`).
- Panel wheel pans the page (Ctrl/Cmd+wheel zooms); the full map's wheel zooms. Zoom limits 0.55 to 2.6.
- The ghost walker previews the move; the real token stays on your current stop until the round is played.
- Signs are code-drawn grids with swap ids `map.node.<shop id>`.
- Rows past round 30 take the paper of the run's realm 3 (path-dependent); Elementa Endless rows keep the Elementa paper. The Unwritten gate sits above round 45.

## Skipped / open questions
- Focus-triggered tooltips could not be exercised with real keyboard focus (the Browser pane was unfocused); hover and `focusStop` calls were verified.
- The game's HUD buttons stay visible above the full-screen map (the header reserves room for them); say if you want the overlay to hide them.
- The traveler token overlaps the trail slightly; fog look (translucent seals) is open to taste.
- No hand-drawn sign art exists yet; all 14 signs are code placeholders in the game's pixel style.
