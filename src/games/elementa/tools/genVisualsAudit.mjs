import { writeFileSync } from 'node:fs'
const root = '/Users/charly/Desktop/Projects/Portafolio/src/games/elementa/'
const { RELICS } = await import(root + 'data/relics.js')
const { CONSUMABLES } = await import(root + 'data/consumables.js')
const { ITEM_ART, SPRITES } = await import(root + 'data/sprites.js')
const { ELEMENTS } = await import(root + 'data/elements.js')
const { RUNES } = await import(root + 'data/runes.js')
const { SYMBOL_INFO } = await import(root + 'data/sigils.js')
const { SCENES } = await import(root + 'data/story.js')
const { SHOP_TYPES } = await import(root + 'data/shops.js')
const { KEEPERS } = await import(root + 'data/keepers.js')

// Which V2 generator family each placeholder shape should become.
const FAMILY = {
  orb: 'gem (round cut)', stone: 'gem (rough)', gem: 'gem (faceted)', vane: 'key / vane', flask: 'potion', wave: 'shard (liquid)',
  flame: 'shard (flame)', mountain: 'block / shard', bolt: 'shard (bolt)', chest: 'chest', tag: 'scroll / tag', gear: 'gear', shell: 'shell / coin',
  bag: 'pouch', coin: 'coin', anchor: 'key / anchor', clover: 'charm', die: 'die', scroll: 'scroll', feather: 'feather', heart: 'gem (heart)',
  block: 'block', hourglass: 'hourglass', prism: 'gem (prism)', crucible: 'potion (crucible)', crown: 'crown', book: 'tome', ring: 'ring', chisel: 'key / tool',
}
const shapeOf = (id) => ITEM_ART[id]?.[0] ?? '?'
const en = (x) => (x && typeof x === 'object' ? x.en : x)

const shapeUse = {}
for (const k of Object.keys(ITEM_ART)) shapeUse[ITEM_ART[k][0]] = (shapeUse[ITEM_ART[k][0]] || 0) + 1
const tiers = {}
for (const [id, e] of Object.entries(ELEMENTS)) (tiers[e.tier] ??= []).push(id)

let md = ''
const w = (s = '') => { md += s + '\n' }

w(`# Elementa visual audit (V1)`)
w()
w(`Read-only inventory of every visual in the game as of V1 (2026-10-08, branch \`elementa-v0.6.5\`), with the current state of each and what V2 to V7 should do. It feeds the later phase specs in \`VISUALS.md\`. Generated tables come from the data files (\`tools\` script kept in the V1 report), the commentary from reading the components and running the **find-animation-opportunities** and **improve-animations** passes by hand (read-only, no code changed).`)
w()
w(`## 0. Headline findings`)
w()
w(`1. **The game ships as one bundle.** \`App.jsx\` imports \`ElementaGame\` eagerly, so every sprite table, story scene and screen is in the first load (baseline **428 kB gzipped** JS, 15.5 kB CSS). The visual overhaul has a 150 kB gzip budget on top of that, so every new heavy module (Remotion, Three.js scenes, cached item atlases) **must** load on demand. V1 proves this works (see the report).`)
w(`2. **${Object.keys(ITEM_ART).length} items share ${Object.keys(shapeUse).length} 12x12 shapes.** Relics (${RELICS.length}) and consumables (${CONSUMABLES.length}) are tinted copies of the same silhouettes (\`data/sprites.js\`), so a shop reads as a row of colored blobs. V2's biggest win is silhouette variety plus a rarity-glow system, not more detail.`)
w(`3. **The backgrounds are good and cheap, but flat.** \`PixelBackdrop.jsx\` is one canvas for every screen: dithered sky, two ridges, motes, an optional circle. Same canvas behind a shop as behind the menu; no room, no props, no keeper in the scene. V3 builds rooms on top of it instead of replacing it.`)
w(`4. **Characters are static 14x14 SVG grids.** Keepers, Pip, the Arbiter and the 32 boss avatars never move. They are the cheapest thing to bring alive (V1's Brasa/Tobb rig costs a few kB).`)
w(`5. **Motion is already in decent shape**: 29 CSS keyframes, \`prefers-reduced-motion\` handled globally plus a per-setting \`reducedMotion\` read in 116 places, 0 uses of \`transition: all\`, juicy shared presets (\`motionPresets.js\`). The gaps are *life*, not polish (see section 7).`)
w()
w(`## 1. Summary`)
w()
w(`| Area | Count | Current state | Phase |`)
w(`|---|---|---|---|`)
w(`| Relics | ${RELICS.length} | 12x12 shared shapes, tinted, rarity frame in CSS | V2 |`)
w(`| Consumables | ${CONSUMABLES.length} | same shapes, tinted | V2 |`)
w(`| Dice | ${Object.keys(ELEMENTS).length} | \`DieSprite.jsx\` draws 4 tier silhouettes (d3/d6/d10/d20), tinted per element | V2 |`)
w(`| Runes | ${RUNES.length} | text and color chips | V2 |`)
w(`| Sigils | 6 dice + 6 symbols | pixel marks | V2 |`)
w(`| Backgrounds | 11 scenes in 1 canvas | procedural, no props | V3 |`)
w(`| Shops | ${Object.keys(SHOP_TYPES).length} types | one shared \`ShopScreen\` layout (1363 lines), keeper portrait in a panel | V3, V4 |`)
w(`| Story scenes | ${Object.keys(SCENES).length} | tinted backdrop + portrait + typed text | V5 |`)
w(`| Map | 1 | SVG-ish rows with node tiles (\`RoadMap.jsx\`) | V6 |`)
w(`| Characters | ${Object.keys(KEEPERS).length} keepers, 32 bosses, Pip, Arbiter, You | static pixel grids | V7 |`)
w(`| Menus | ~12 screens | CSS panels, button states exist | V4 |`)
w()
w(`## 2. Items`)
w()
w(`Placeholder shape reuse (how many items use each 12x12 shape): ` + Object.entries(shapeUse).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') + `.`)
w()
w(`### 2.1 Relics (${RELICS.length})`)
w()
w(`| id | rarity | element | placeholder shape | V2 generator |`)
w(`|---|---|---|---|---|`)
for (const r of RELICS) w(`| ${r.id} | ${r.rarity} | ${r.element ?? '-'} | ${shapeOf(r.id)} | ${FAMILY[shapeOf(r.id)] ?? '?'} |`)
w()
w(`### 2.2 Consumables (${CONSUMABLES.length})`)
w()
w(`| id | type | rarity | placeholder shape | V2 generator |`)
w(`|---|---|---|---|---|`)
for (const c of CONSUMABLES) w(`| ${c.id} | ${c.type ?? '-'} | ${c.rarity} | ${shapeOf(c.id)} | ${FAMILY[shapeOf(c.id)] ?? '?'} |`)
w()
w(`### 2.3 Dice (${Object.keys(ELEMENTS).length})`)
w()
w(`| tier | count | state |`)
w(`|---|---|---|`)
for (const [t, a] of Object.entries(tiers)) w(`| ${t} | ${a.length} | tinted tier silhouette (\`DieSprite\`), element mark on the face |`)
w()
w(`Dice are on screen 90% of the time, so V2 treats them separately from items: a gem-cut body per tier, an element mark, a rarity rim, and the cached 3D path only for the shop reveal and the inspector (the table keeps the cheap SVG).`)
w()
w(`### 2.4 Runes (${RUNES.length}) and sigils`)
w()
w(`Runes: ` + RUNES.map((r) => `${r.id} (${r.rarity})`).join(', ') + `. Today they are a colored chip with text; V2 gives each a carved-stone generator with a glyph and a glow. Sigils: 6 dice (\`sigil_aeris\`, \`sigil_nix\`, \`sigil_tobb\` and their greater versions) and 6 symbols (` + Object.keys(SYMBOL_INFO).join(', ') + `); V2 turns the symbols into engraved discs.`)
w()
w(`## 3. Backgrounds and screens`)
w()
w(`| Scene key | Used for | Current | V3 plan |`)
w(`|---|---|---|---|`)
const scenes = [
  ['menu', 'main menu, slots, setup, game over', 'dithered violet sky, twin ridges, four element motes', 'keep as the exterior; add a lived-in "door" vignette'],
  ['table', 'a normal round', 'dark sky, turning magic circle behind the dice', 'add depth layers and a table surface; circle stays'],
  ['shop', 'every shop', 'warm dusk sky, ridges, fireflies (same for all 13 shop types)', 'one room per shop type, the Market is the V1 template'],
  ['boss', 'boss rounds', 'blood sky, embers, circle', 'per-boss arena tint and a looming silhouette'],
  ['empyrean / pleroma / meridian', 'realm 3 (table and shop)', 'palette plus a grid or smear glitch layer', 'keep the glitch, add architecture layers'],
  ['unwritten', 'the Convergence', 'blank-page sky, almost still', 'paper grain and erasing line art'],
]
for (const s of scenes) w(`| ${s.join(' | ')} |`)
w()
w(`Screens that are "squares on a background" today (V4): main menu (\`MainMenu\`, \`TitleScreen\`), file select (\`SaveSlots\`, \`FileHub\`), Options, Pause, Run preview, Setup, the shop shelves and price tags (\`ShopScreen\`, \`PriceTag\`), the Forge (\`ForgePanel\`), Inscribe, the Gallery, the Road frame, Round results, Crossroads, Game over, Credits, the Jukebox.`)
w()
w(`### 3.1 Shops (${Object.keys(SHOP_TYPES).length} types, 1 layout)`)
w()
w(`| Shop | Keeper | V3 room idea |`)
w(`|---|---|---|`)
const rooms = {
  market: ['tobb', 'a peddler wagon opened up: crates, hanging lanterns, a counter piled with trinkets (the V1 slice)'],
  alchemist: ['vessa', 'a cluttered lab: bubbling alembic, shelves of jars, steam'],
  vault: ['curator', 'a stone vault: pedestals under glass, dust shafts, a sleeping golem'],
  forge: ['brasa', 'a forge with an anvil and bellows, ember sparks, glowing ingot rack'],
  blackmarket: ['nix', 'a back alley under a hood of shadow: a lone lamp, eyes in the dark'],
  shrine: ['aeris', 'a sky shrine: floating candles, a halo of light, drifting feathers'],
  bazaar: ['conclave', 'a wide plaza where every keeper has a stall'],
  astral: ['-', 'an astral crossing: constellations on the floor'],
  cartography: ['atlas', 'a chart room with pinned maps and a rolling globe'],
  clockwork: ['horologist', 'gear walls, a pendulum, a cuckoo that is always late'],
  observatory: ['seren', 'a dome with a telescope and a starfield'],
  pantry: ['mote', 'a void pantry with shelves of things that are not quite jars'],
  camp: ['-', 'a campfire at night, a tent, a kettle'],
}
for (const id of Object.keys(SHOP_TYPES)) w(`| ${id} | ${rooms[id]?.[0] ?? '-'} | ${rooms[id]?.[1] ?? ''} |`)
w()
w(`## 4. Story scenes (${Object.keys(SCENES).length})`)
w()
w(`Today every scene is the same template (\`StoryScene.jsx\`): a full-screen tint (\`color\`), one portrait (boss, keeper, die, Pip) at 96-112px, typed lines, Skip. Replays work from the Gallery. V5 rebuilds each as a Remotion composition behind \`CinematicPlayer\` (the V1 spike proves the player, skip, replay, Reduced motion and language).`)
w()
w(`| scene | pages | portrait | tint | V5 note |`)
w(`|---|---|---|---|---|`)
for (const [id, s] of Object.entries(SCENES)) {
  const p = s.pages[0].portrait
  const pt = p ? (p.id ? `${p.kind}:${p.id}` : p.kind) : '-'
  w(`| ${id} | ${s.pages.length} | ${pt} | ${s.color ?? '-'} | ${s.pages.length > 1 ? 'multi-page: one shot per page with a camera push' : 'single shot: portrait reveal'} |`)
}
w()
w(`## 5. The map (\`RoadMap.jsx\`, 190 lines; data in \`engine/map.js\`)`)
w()
w(`Rows are shops, bottom to top, drawn with node tiles (a keeper sprite or boss avatar inside a tile), lines for links, a marker for the current node, boss rounds marked on the left. It works but reads as a spreadsheet: no realm identity, no portals at realm borders, "you are here" is a border color, nothing pans or zooms, 220px wide by default. V6 changes visuals and layout only; \`engine/map.js\` stays.`)
w()
w(`## 6. Characters`)
w()
w(`| Character | Where | Current | V7 |`)
w(`|---|---|---|---|`)
for (const [id, k] of Object.entries(KEEPERS)) w(`| ${en(k.name)} (${id}) | ${en(k.title)} | 14x14 SVG grid (\`KeeperSprite\`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |`)
w(`| Bosses (32) | boss rounds, scenes | symmetric 12x12 "invader" generated from the id (\`BossAvatar\`) | intro animation, hit and defeat reactions, bigger rigs for the gods and Wardens |`)
w(`| Pip | tutorial, Crossroads, scenes | 14x14 SVG (\`Tutorial.jsx\`) | blink, bounce, expressions |`)
w(`| The Arbiter | scenes, shops | hand and eye parts (\`ArbiterParts.jsx\`) | slow float, the eye follows the cursor |`)
w(`| You | the ghost duel | white boss avatar | mirrors the player's last cast |`)
w()
w(`## 7. Motion audit (find-animation-opportunities and improve-animations, read-only)`)
w()
w(`**Recon.** React 19, framer-motion 12, 29 CSS keyframes in \`elementa.css\`, shared presets in \`utils/motionPresets.js\` (juicy hover and tap), a \`reducedMotion\` flag in \`GameSettingsContext\` read in 116 places, a global \`prefers-reduced-motion\` block. The personality is playful and tactile (Balatro-like), so bounce and squash are on-brand. Easing tokens are not centralized: durations and curves are inline. Frequency map: dice and the table are 100+/session, shop entry and Road occasional, story scenes and endings rare.`)
w()
w(`### Opportunities (survivors of the gate)`)
w()
w(`| # | Location | Today | Purpose | Frequency | Suggested motion |`)
w(`|---|---|---|---|---|---|`)
w(`| 1 | \`ShopScreen.jsx\` item cards | items are tiles on a flat grid; a bought item just vanishes | Spatial consistency | Occasional | bought item lifts 6px (120ms ease-out \`cubic-bezier(0.23,1,0.32,1)\`), flies to the counter, **leaves a shadowed gap** that fades over 400ms; keeper nods (V3, V1 slice proves it) |`)
w(`| 2 | Keepers everywhere | static portraits | State indication | Occasional | 5s breathe loop (1 art px translate), blink every 3 to 6s (90ms), talking mouth only while a line types |`)
w(`| 3 | \`PixelBackdrop\` shop scene | same sky and fireflies for 13 shops | Preventing a jarring change | Occasional | room layers with parallax of 2 to 6px max, lantern flicker (opacity 0.85 to 1, 2.4s), dust motes drifting 8s loops |`)
w(`| 4 | Rarity reveal on buy | none | Delight (rare tier) | Rare | glow ring pop: scale 0.9 to 1.04 to 1, 280ms, then a 600ms fade; only for rare and above |`)
w(`| 5 | \`StoryScene.jsx\` | text only | Delight / explanation | Rare | camera push 1.0 to 1.06 over the page, portrait fade-in 400ms ease-out, parallax stars (V5 via Remotion) |`)
w(`| 6 | \`RoadMap.jsx\` current node | border color | State indication | Occasional | pulse ring 2.4s ease-in-out between scale 1 and 1.18, off under Reduced motion |`)
w()
w(`### Rejected candidates`)
w()
w(`- Dice hover wobble and cast rolls (\`Die.jsx\`, \`RollFx.jsx\`): **already animated, tens to hundreds per session.** Do not add anything; if anything, V8 should check they stay under 300ms on phones.`)
w(`- A new animation on **keyboard shortcuts** (reroll, lock, hold): rejected, 100+/session and keyboard-initiated. Never animate.`)
w(`- Score numbers and target bar (\`AnimatedNumber\`, \`TargetBar\`): functional data the player is reading; keep tabular and quick.`)
w(`- Page-to-page transitions between menus: the player sees these constantly; V4 may add a 160ms fade at most.`)
w()
w(`### Findings on the existing motion (improve-animations categories)`)
w()
w(`| Severity | Category | Location | Finding | Fix |`)
w(`|---|---|---|---|---|`)
w(`| MEDIUM | Easing | \`elementa.css:420\`, \`:450\` | \`el-fx-drip\` and \`el-fx-settle\` use \`ease-in\` on an infinite loop | switch to \`ease-in-out\`; looping ambient motion should not start slow then snap |`)
w(`| MEDIUM | Accessibility | \`elementa.css:864\` | global reduce block shrinks durations to 0.01ms, which leaves **infinite** loops firing every 0.01ms (a flicker risk in some browsers) | add \`animation-iteration-count: 1 !important\` to that block |`)
w(`| LOW | Cohesion | components (inline) | spring configs and durations are inline in 39 files | extract a small token file in V8 (do not do it before the visual work) |`)
w(`| LOW | Performance | \`PixelBackdrop.jsx:20\` | canvas redraw at 15 fps with full-screen putImageData for the sky only once; motes redraw each frame (fine). No device probe, no low-end fallback | V1 adds \`utils/perfProbe.js\` to feed the fallback in V3 |`)
w(`| LOW | Performance | \`StoryScene.jsx:50\` | typing driven by a 50ms setInterval + React state per tick | fine for 20 s scenes; V5 replaces it with frame-driven text |`)
w()
w(`Nothing above was changed in V1 (the brief says read-only for the real game).`)
w()
w(`## 8. Recommendations per phase`)
w()
w(`- **V2 items:** go with **pre-rendered, cached low-resolution 3D**, with the cheap procedural SVG as the fallback on low-end devices (numbers in the V1 report). Start from ${new Set(Object.values(FAMILY)).size} generator families, not 115 models.`)
w(`- **V3 rooms:** start from the V1 Market slice (\`components/visuals/MarketRoom.jsx\`), same layer contract (backdrop, props, light, particles, keeper, items).`)
w(`- **V4 menus:** one panel material and one button system first (ASSETS.md section 4 already describes the 9-slice), then screens.`)
w(`- **V5 cinematics:** Remotion Player is cheap enough lazy-loaded (V1 report); keep text as live bilingual text.`)
w(`- **V6 map:** new layout over the same \`engine/map.js\` data.`)
w(`- **V7 characters:** extend the V1 rig (\`components/visuals/rigs\`) with expressions and boss intro animations.`)
w(`- **V8:** token file for easings and durations, the two CSS fixes above, a phone performance pass.`)
writeFileSync(root + 'VISUALS_AUDIT.md', md)
console.log(md.length, 'chars')
