# Elementa visual audit (V1)

Read-only inventory of every visual in the game as of V1 (2026-10-08, branch `elementa-v0.6.5`), with the current state of each and what V2 to V7 should do. It feeds the later phase specs in `VISUALS.md`. Generated tables come from the data files (`tools` script kept in the V1 report), the commentary from reading the components and running the **find-animation-opportunities** and **improve-animations** passes by hand (read-only, no code changed).

## 0. Headline findings

1. **The game ships as one bundle.** `App.jsx` imports `ElementaGame` eagerly, so every sprite table, story scene and screen is in the first load (baseline **428 kB gzipped** JS, 15.5 kB CSS). The visual overhaul has a 150 kB gzip budget on top of that, so every new heavy module (Remotion, Three.js scenes, cached item atlases) **must** load on demand. V1 proves this works (see the report).
2. **115 items share 29 12x12 shapes.** Relics (62) and consumables (53) are tinted copies of the same silhouettes (`data/sprites.js`), so a shop reads as a row of colored blobs. V2's biggest win is silhouette variety plus a rarity-glow system, not more detail.
3. **The backgrounds are good and cheap, but flat.** `PixelBackdrop.jsx` is one canvas for every screen: dithered sky, two ridges, motes, an optional circle. Same canvas behind a shop as behind the menu; no room, no props, no keeper in the scene. V3 builds rooms on top of it instead of replacing it.
4. **Characters are static 14x14 SVG grids.** Keepers, Pip, the Arbiter and the 32 boss avatars never move. They are the cheapest thing to bring alive (V1's Brasa/Tobb rig costs a few kB).
5. **Motion is already in decent shape**: 29 CSS keyframes, `prefers-reduced-motion` handled globally plus a per-setting `reducedMotion` read in 116 places, 0 uses of `transition: all`, juicy shared presets (`motionPresets.js`). The gaps are *life*, not polish (see section 7).

## 1. Summary

| Area | Count | Current state | Phase |
|---|---|---|---|
| Relics | 62 | 12x12 shared shapes, tinted, rarity frame in CSS | V2 |
| Consumables | 53 | same shapes, tinted | V2 |
| Dice | 89 | `DieSprite.jsx` draws 4 tier silhouettes (d3/d6/d10/d20), tinted per element | V2 |
| Runes | 9 | text and color chips | V2 |
| Sigils | 6 dice + 6 symbols | pixel marks | V2 |
| Backgrounds | 11 scenes in 1 canvas | procedural, no props | V3 |
| Shops | 13 types | one shared `ShopScreen` layout (1363 lines), keeper portrait in a panel | V3, V4 |
| Story scenes | 37 | tinted backdrop + portrait + typed text | V5 |
| Map | 1 | SVG-ish rows with node tiles (`RoadMap.jsx`) | V6 |
| Characters | 12 keepers, 32 bosses, Pip, Arbiter, You | static pixel grids | V7 |
| Menus | ~12 screens | CSS panels, button states exist | V4 |

## 2. Items

Placeholder shape reuse (how many items use each 12x12 shape): gem 17, stone 14, flask 8, block 8, ring 7, coin 5, feather 5, hourglass 5, orb 4, wave 3, flame 3, bolt 3, gear 3, anchor 3, scroll 3, crown 3, book 3, mountain 2, chest 2, shell 2, bag 2, clover 2, heart 2, vane 1, tag 1, die 1, prism 1, crucible 1, chisel 1.

### 2.1 Relics (62)

| id | rarity | element | placeholder shape | V2 generator |
|---|---|---|---|---|
| molten_core | common | fire | orb | gem (round cut) |
| riverstone | common | water | stone | gem (rough) |
| stormcaller | uncommon | air | vane | key / vane |
| bedrock | common | earth | stone | gem (rough) |
| glass_cannon | epic | fire | flask | potion |
| undertow | uncommon | water | wave | shard (liquid) |
| petrify | rare | - | gem | gem (faceted) |
| wildfire | rare | fire | flame | shard (flame) |
| tidal_pool | uncommon | water | wave | shard (liquid) |
| groundswell | uncommon | earth | mountain | block / shard |
| static_charge | legendary | air | bolt | shard (bolt) |
| momentum | epic | - | bolt | shard (bolt) |
| shard_vault | rare | - | chest | chest |
| discount_merchant | rare | - | tag | scroll / tag |
| overclock | epic | - | gear | gear |
| fossil | rare | earth | shell | shell / coin |
| fusion_catalyst | epic | - | flask | potion |
| deep_pockets | common | - | bag | pouch |
| windfall | uncommon | - | coin | coin |
| hoarder | common | - | chest | chest |
| steadfast | epic | - | anchor | key / anchor |
| safety_net | legendary | - | clover | charm |
| loaded_die | common | - | die | die |
| tide_chart | common | water | scroll | scroll |
| feather_charm | common | air | feather | feather |
| lucky_coin | common | - | coin | coin |
| ember_heart | uncommon | fire | heart | gem (heart) |
| keystone | uncommon | earth | block | block |
| hourglass | uncommon | - | hourglass | hourglass |
| prism_lens | rare | - | prism | gem (prism) |
| glacier_heart | rare | water | gem | gem (faceted) |
| fusion_crucible | epic | - | crucible | potion (crucible) |
| aether_crown | legendary | - | crown | crown |
| alchemists_table | uncommon | - | book | tome |
| bookends | uncommon | - | book | tome |
| catalyst_stone | rare | - | stone | gem (rough) |
| heart_of_circle | rare | - | ring | ring |
| ley_line | epic | - | ring | ring |
| heat | uncommon | fire | flame | shard (flame) |
| gust | rare | air | feather | feather |
| steady | uncommon | earth | anchor | key / anchor |
| chain_break | epic | fire | bolt | shard (bolt) |
| pantheon | legendary | - | crown | crown |
| deep_current | epic | water | wave | shard (liquid) |
| spring_tide | rare | water | shell | shell / coin |
| gale_seal | epic | air | ring | ring |
| second_wind | rare | air | feather | feather |
| standing_stones | rare | earth | mountain | block / shard |
| crown_of_ages | legendary | - | crown | crown |
| heart_of_the_forge | epic | - | heart | gem (heart) |
| starmap | epic | - | scroll | scroll |
| echo_chamber | legendary | - | ring | ring |
| law_inversion | mythic | - | scroll | scroll |
| law_unity | mythic | - | ring | ring |
| law_symmetry | mythic | - | gem | gem (faceted) |
| law_greed | mythic | - | coin | coin |
| law_echo | mythic | - | orb | gem (round cut) |
| law_small | mythic | - | stone | gem (rough) |
| epsilon | legendary | - | gem | gem (faceted) |
| release | legendary | - | anchor | key / anchor |
| mainspring | epic | - | ring | ring |
| cuckoo_clock | epic | - | block | block |

### 2.2 Consumables (53)

| id | type | rarity | placeholder shape | V2 generator |
|---|---|---|---|---|
| upgrade_stone | upgrade | epic | gem | gem (faceted) |
| extra_reroll | reroll | uncommon | hourglass | hourglass |
| transmute_earth | transmute | common | flask | potion |
| transmute_water | transmute | common | flask | potion |
| transmute_air | transmute | common | flask | potion |
| transmute_fire | transmute | common | flask | potion |
| whetstone | hone | common | stone | gem (rough) |
| chisel | split | common | chisel | key / tool |
| phoenix_feather | heal | uncommon | feather | feather |
| aether_dust | infuse | rare | orb | gem (round cut) |
| arcane_seal | arcanize | epic | coin | coin |
| shard_pouch | pouch | common | bag | pouch |
| lucky_charm | charm | uncommon | clover | charm |
| fusion_spark | spark | rare | flame | shard (flame) |
| mirror_shard | clone | rare | gem | gem (faceted) |
| loom_of_fate | loom | uncommon | hourglass | hourglass |
| stopwatch | rewind | rare | gear | gear |
| time_capsule | capsule | uncommon | hourglass | hourglass |
| warp_seal | warp | legendary | coin | coin |
| sand_hourglass | sand | uncommon | hourglass | hourglass |
| pocket_watch | watch | rare | gear | gear |
| metronome | metronome | uncommon | block | block |
| almanac | almanac | rare | book | tome |
| const_phoenix | constellation | uncommon | gem | gem (faceted) |
| const_anvil | constellation | uncommon | gem | gem (faceted) |
| const_geyser | constellation | uncommon | gem | gem (faceted) |
| const_cloud | constellation | uncommon | gem | gem (faceted) |
| const_seedling | constellation | uncommon | gem | gem (faceted) |
| const_whirl | constellation | uncommon | gem | gem (faceted) |
| const_twins | constellation | uncommon | gem | gem (faceted) |
| const_pair | constellation | uncommon | gem | gem (faceted) |
| const_trio | constellation | uncommon | gem | gem (faceted) |
| const_ladder | constellation | uncommon | gem | gem (faceted) |
| const_black_hole | blackhole | legendary | orb | gem (round cut) |
| totem_fire | totem | uncommon | block | block |
| totem_water | totem | uncommon | block | block |
| totem_earth | totem | uncommon | block | block |
| totem_air | totem | uncommon | block | block |
| rune_echo | rune | epic | stone | gem (rough) |
| rune_glass | rune | rare | stone | gem (rough) |
| rune_kinship | rune | rare | stone | gem (rough) |
| rune_ember | rune | uncommon | stone | gem (rough) |
| rune_anchor | rune | uncommon | stone | gem (rough) |
| rune_wild | rune | epic | stone | gem (rough) |
| rune_gold | rune | uncommon | stone | gem (rough) |
| rune_link | rune | rare | stone | gem (rough) |
| rune_double | rune | rare | stone | gem (rough) |
| weights | weights | uncommon | block | block |
| honing_oil | hone | rare | flask | potion |
| graft | graft | rare | feather | feather |
| solvent | solvent | uncommon | flask | potion |
| gem_socket | socket | epic | ring | ring |
| catalyst | catalyst | rare | gem | gem (faceted) |

### 2.3 Dice (89)

| tier | count | state |
|---|---|---|
| pure | 4 | tinted tier silhouette (`DieSprite`), element mark on the face |
| double | 17 | tinted tier silhouette (`DieSprite`), element mark on the face |
| triple | 4 | tinted tier silhouette (`DieSprite`), element mark on the face |
| quadra | 1 | tinted tier silhouette (`DieSprite`), element mark on the face |
| arcane | 37 | tinted tier silhouette (`DieSprite`), element mark on the face |
| god | 4 | tinted tier silhouette (`DieSprite`), element mark on the face |
| primal | 1 | tinted tier silhouette (`DieSprite`), element mark on the face |
| mythic | 11 | tinted tier silhouette (`DieSprite`), element mark on the face |
| cosmic | 10 | tinted tier silhouette (`DieSprite`), element mark on the face |

Dice are on screen 90% of the time, so V2 treats them separately from items: a gem-cut body per tier, an element mark, a rarity rim, and the cached 3D path only for the shop reveal and the inspector (the table keeps the cheap SVG).

### 2.4 Runes (9) and sigils

Runes: echo (epic), glass (rare), kinship (rare), ember (uncommon), anchor (uncommon), wild (epic), gold (uncommon), link (rare), double (rare). Today they are a colored chip with text; V2 gives each a carved-stone generator with a glyph and a glow. Sigils: 6 dice (`sigil_aeris`, `sigil_nix`, `sigil_tobb` and their greater versions) and 6 symbols (sun, scale, key, eye, spiral, maw); V2 turns the symbols into engraved discs.

## 3. Backgrounds and screens

| Scene key | Used for | Current | V3 plan |
|---|---|---|---|
| menu | main menu, slots, setup, game over | dithered violet sky, twin ridges, four element motes | keep as the exterior; add a lived-in "door" vignette |
| table | a normal round | dark sky, turning magic circle behind the dice | add depth layers and a table surface; circle stays |
| shop | every shop | warm dusk sky, ridges, fireflies (same for all 13 shop types) | one room per shop type, the Market is the V1 template |
| boss | boss rounds | blood sky, embers, circle | per-boss arena tint and a looming silhouette |
| empyrean / pleroma / meridian | realm 3 (table and shop) | palette plus a grid or smear glitch layer | keep the glitch, add architecture layers |
| unwritten | the Convergence | blank-page sky, almost still | paper grain and erasing line art |

Screens that are "squares on a background" today (V4): main menu (`MainMenu`, `TitleScreen`), file select (`SaveSlots`, `FileHub`), Options, Pause, Run preview, Setup, the shop shelves and price tags (`ShopScreen`, `PriceTag`), the Forge (`ForgePanel`), Inscribe, the Gallery, the Road frame, Round results, Crossroads, Game over, Credits, the Jukebox.

### 3.1 Shops (13 types, 1 layout)

| Shop | Keeper | V3 room idea |
|---|---|---|
| market | tobb | a peddler wagon opened up: crates, hanging lanterns, a counter piled with trinkets (the V1 slice) |
| alchemist | vessa | a cluttered lab: bubbling alembic, shelves of jars, steam |
| vault | curator | a stone vault: pedestals under glass, dust shafts, a sleeping golem |
| forge | brasa | a forge with an anvil and bellows, ember sparks, glowing ingot rack |
| blackmarket | nix | a back alley under a hood of shadow: a lone lamp, eyes in the dark |
| shrine | aeris | a sky shrine: floating candles, a halo of light, drifting feathers |
| bazaar | conclave | a wide plaza where every keeper has a stall |
| astral | - | an astral crossing: constellations on the floor |
| cartography | atlas | a chart room with pinned maps and a rolling globe |
| clockwork | horologist | gear walls, a pendulum, a cuckoo that is always late |
| observatory | seren | a dome with a telescope and a starfield |
| pantry | mote | a void pantry with shelves of things that are not quite jars |
| camp | - | a campfire at night, a tent, a kettle |

## 4. Story scenes (37)

Today every scene is the same template (`StoryScene.jsx`): a full-screen tint (`color`), one portrait (boss, keeper, die, Pip) at 96-112px, typed lines, Skip. Replays work from the Gallery. V5 rebuilds each as a Remotion composition behind `CinematicPlayer` (the V1 spike proves the player, skip, replay, Reduced motion and language).

| scene | pages | portrait | tint | V5 note |
|---|---|---|---|---|
| final_neutral | 1 | boss:primordial | #ff5a5a | single shot: portrait reveal |
| final_split | 1 | boss:primordial | #9fd8ff | single shot: portrait reveal |
| final_primordial | 1 | boss:primordial | #ff4d6d | single shot: portrait reveal |
| loan | 1 | die:primordial_die | #ff4d6d | single shot: portrait reveal |
| trial_gaea | 1 | boss:gaea | #b8894a | single shot: portrait reveal |
| trial_ognen | 1 | boss:ognen | #ff5a1a | single shot: portrait reveal |
| trial_varuna | 1 | boss:varuna | #2f7fe0 | single shot: portrait reveal |
| trial_zephyr | 1 | boss:zephyr | #dff3ff | single shot: portrait reveal |
| visions | 5 | die:gaea | #ffd166 | multi-page: one shot per page with a camera push |
| recipes | 2 | pip | #c8b6ff | multi-page: one shot per page with a camera push |
| crossroads | 1 | pip | #d9b8ff | single shot: portrait reveal |
| warden_dawn | 1 | boss:dawn | #ffe27a | single shot: portrait reveal |
| warden_umbra | 1 | boss:umbra | #4a3a78 | single shot: portrait reveal |
| warden_clockwork | 1 | boss:clockwork | #c9a46b | single shot: portrait reveal |
| warden_expanse | 1 | boss:expanse | #5a7cff | single shot: portrait reveal |
| warden_maelstrom | 1 | boss:maelstrom | #ff3fa4 | single shot: portrait reveal |
| warden_hollow | 1 | boss:hollow | #6b5a8a | single shot: portrait reveal |
| mote_first | 1 | keeper:mote | #8a7aa8 | single shot: portrait reveal |
| follower_split | 1 | keeper:aeris | #9fd8ff | single shot: portrait reveal |
| follower_primordial | 1 | keeper:nix | #8a5cff | single shot: portrait reveal |
| follower_neutral | 1 | keeper:tobb | #e5a53d | single shot: portrait reveal |
| entropy | 1 | die:entropy | #f0e8ff | single shot: portrait reveal |
| crossing | 2 | pip | #c9b8ff | multi-page: one shot per page with a camera push |
| realm3 | 1 | pip | #7affd8 | single shot: portrait reveal |
| rewriter_axiom | 2 | boss:axiom | #ffe9a0 | multi-page: one shot per page with a camera push |
| rewriter_zero | 2 | boss:zero | #9a9ab0 | multi-page: one shot per page with a camera push |
| rewriter_infinity | 2 | boss:infinity | #8ad0ff | multi-page: one shot per page with a camera push |
| rewriter_observer | 2 | boss:observer | #ff9ad0 | multi-page: one shot per page with a camera push |
| rewriter_floating | 2 | boss:floating | #d8d8f0 | multi-page: one shot per page with a camera push |
| rewriter_deadlock | 2 | boss:deadlock | #c9a46b | multi-page: one shot per page with a camera push |
| arbiter | 2 | keeper:arbiter | #d8d2e8 | multi-page: one shot per page with a camera push |
| vesper_first | 2 | keeper:vesper | #9fb8ff | multi-page: one shot per page with a camera push |
| unwritten | 1 | boss:you | #e8e4f4 | single shot: portrait reveal |
| pip_before | 1 | pip | #c8b6ff | single shot: portrait reveal |
| pip_after | 1 | pip | #c8b6ff | single shot: portrait reveal |
| you_before | 1 | boss:you | #ffffff | single shot: portrait reveal |
| true_ending | 1 | boss:you | #fff6c8 | single shot: portrait reveal |

## 5. The map (`RoadMap.jsx`, 190 lines; data in `engine/map.js`)

Rows are shops, bottom to top, drawn with node tiles (a keeper sprite or boss avatar inside a tile), lines for links, a marker for the current node, boss rounds marked on the left. It works but reads as a spreadsheet: no realm identity, no portals at realm borders, "you are here" is a border color, nothing pans or zooms, 220px wide by default. V6 changes visuals and layout only; `engine/map.js` stays.

## 6. Characters

| Character | Where | Current | V7 |
|---|---|---|---|
| Tobb (tobb) | Traveling peddler | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Vessa (vessa) | Alchemist | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| The Curator (curator) | Keeper of the vault | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Brasa (brasa) | Smith of the Fusion Forge | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Nix (nix) | Dealer in the dark | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Aeris (aeris) | Voice of the shrine | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Atlas (atlas) | Cartographer | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| The Horologist (horologist) | Keeper of the hours | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Seren (seren) | The astronomer | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Mote (mote) | A speck of the Void | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Vesper (vesper) | The Cosmologist | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| The Wanderers (conclave) | Every keeper, one crossroads | 14x14 SVG grid (`KeeperSprite`), shared body, per-keeper head and palette | layered rig: idle breathe, blink, talk, react |
| Bosses (32) | boss rounds, scenes | symmetric 12x12 "invader" generated from the id (`BossAvatar`) | intro animation, hit and defeat reactions, bigger rigs for the gods and Wardens |
| Pip | tutorial, Crossroads, scenes | 14x14 SVG (`Tutorial.jsx`) | blink, bounce, expressions |
| The Arbiter | scenes, shops | hand and eye parts (`ArbiterParts.jsx`) | slow float, the eye follows the cursor |
| You | the ghost duel | white boss avatar | mirrors the player's last cast |

## 7. Motion audit (find-animation-opportunities and improve-animations, read-only)

**Recon.** React 19, framer-motion 12, 29 CSS keyframes in `elementa.css`, shared presets in `utils/motionPresets.js` (juicy hover and tap), a `reducedMotion` flag in `GameSettingsContext` read in 116 places, a global `prefers-reduced-motion` block. The personality is playful and tactile (Balatro-like), so bounce and squash are on-brand. Easing tokens are not centralized: durations and curves are inline. Frequency map: dice and the table are 100+/session, shop entry and Road occasional, story scenes and endings rare.

### Opportunities (survivors of the gate)

| # | Location | Today | Purpose | Frequency | Suggested motion |
|---|---|---|---|---|---|
| 1 | `ShopScreen.jsx` item cards | items are tiles on a flat grid; a bought item just vanishes | Spatial consistency | Occasional | bought item lifts 6px (120ms ease-out `cubic-bezier(0.23,1,0.32,1)`), flies to the counter, **leaves a shadowed gap** that fades over 400ms; keeper nods (V3, V1 slice proves it) |
| 2 | Keepers everywhere | static portraits | State indication | Occasional | 5s breathe loop (1 art px translate), blink every 3 to 6s (90ms), talking mouth only while a line types |
| 3 | `PixelBackdrop` shop scene | same sky and fireflies for 13 shops | Preventing a jarring change | Occasional | room layers with parallax of 2 to 6px max, lantern flicker (opacity 0.85 to 1, 2.4s), dust motes drifting 8s loops |
| 4 | Rarity reveal on buy | none | Delight (rare tier) | Rare | glow ring pop: scale 0.9 to 1.04 to 1, 280ms, then a 600ms fade; only for rare and above |
| 5 | `StoryScene.jsx` | text only | Delight / explanation | Rare | camera push 1.0 to 1.06 over the page, portrait fade-in 400ms ease-out, parallax stars (V5 via Remotion) |
| 6 | `RoadMap.jsx` current node | border color | State indication | Occasional | pulse ring 2.4s ease-in-out between scale 1 and 1.18, off under Reduced motion |

### Rejected candidates

- Dice hover wobble and cast rolls (`Die.jsx`, `RollFx.jsx`): **already animated, tens to hundreds per session.** Do not add anything; if anything, V8 should check they stay under 300ms on phones.
- A new animation on **keyboard shortcuts** (reroll, lock, hold): rejected, 100+/session and keyboard-initiated. Never animate.
- Score numbers and target bar (`AnimatedNumber`, `TargetBar`): functional data the player is reading; keep tabular and quick.
- Page-to-page transitions between menus: the player sees these constantly; V4 may add a 160ms fade at most.

### Findings on the existing motion (improve-animations categories)

| Severity | Category | Location | Finding | Fix |
|---|---|---|---|---|
| MEDIUM | Easing | `elementa.css:420`, `:450` | `el-fx-drip` and `el-fx-settle` use `ease-in` on an infinite loop | switch to `ease-in-out`; looping ambient motion should not start slow then snap |
| MEDIUM | Accessibility | `elementa.css:864` | global reduce block shrinks durations to 0.01ms, which leaves **infinite** loops firing every 0.01ms (a flicker risk in some browsers) | add `animation-iteration-count: 1 !important` to that block |
| LOW | Cohesion | components (inline) | spring configs and durations are inline in 39 files | extract a small token file in V8 (do not do it before the visual work) |
| LOW | Performance | `PixelBackdrop.jsx:20` | canvas redraw at 15 fps with full-screen putImageData for the sky only once; motes redraw each frame (fine). No device probe, no low-end fallback | V1 adds `utils/perfProbe.js` to feed the fallback in V3 |
| LOW | Performance | `StoryScene.jsx:50` | typing driven by a 50ms setInterval + React state per tick | fine for 20 s scenes; V5 replaces it with frame-driven text |

Nothing above was changed in V1 (the brief says read-only for the real game).

## 8. Recommendations per phase

- **V2 items:** go with **pre-rendered, cached low-resolution 3D**, with the cheap procedural SVG as the fallback on low-end devices (numbers in the V1 report). Start from 29 generator families, not 115 models.
- **V3 rooms:** start from the V1 Market slice (`components/visuals/MarketRoom.jsx`), same layer contract (backdrop, props, light, particles, keeper, items).
- **V4 menus:** one panel material and one button system first (ASSETS.md section 4 already describes the 9-slice), then screens.
- **V5 cinematics:** Remotion Player is cheap enough lazy-loaded (V1 report); keep text as live bilingual text.
- **V6 map:** new layout over the same `engine/map.js` data.
- **V7 characters:** extend the V1 rig (`components/visuals/rigs`) with expressions and boss intro animations.
- **V8:** token file for easings and durations, the two CSS fixes above, a phone performance pass.
