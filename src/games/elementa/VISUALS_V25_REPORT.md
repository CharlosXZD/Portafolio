# Visuals V3.1 and V2.5 report: keeper bodies, neutral Gallery, readable item sprites (Alpha 0.9.9)

Date: 2026-10-10. Branch `elementa-v0.6.5`. Nothing pushed or merged. Screenshots: `reports/v31/` (4) and `reports/v25/` (13).

## Job 1: V3.1, fixes from Carlos's V3 review

| Carlos's answer or note | What I did |
|---|---|
| Group unseen Gallery entries neutrally | In the Dice, Relics and Items tabs, sorted by rarity or family, every unseen entry now sits in one "???" group at the end (ordered by id, so the order says nothing); seen entries keep their rarity or family groups. Sort by name was already neutral. `GalleryScreen.jsx`. |
| "Bazar del Ether"; check other uppercase pixel-font strings | Renamed in `data/shops.js`, the Jukebox label and the Rooms Lab. Glyph audit (measured in the browser): Press Start 2P has every Spanish accent and ñ, and lacks only the em dash, the ellipsis, arrows, the star and the heart. The only game string with an ellipsis is the contact form (not in the game). **A finding you did not ask about:** the default body font, Tiny5, lacks the lowercase **ó, ú, ñ and ü**, so in Spanish body text those letters fall back to the monospace font. Not changed. |
| Colors for bosses, gods and Wardens | The colors already existed inside `BossAvatar.jsx`. I moved them to `data/bossModifiers.js` as `BOSS_COLORS` plus `bossColor(id)` (the only edit in the data file; `BossAvatar` imports it). The boss stage uses it as its tone; very dark colors (the Eclipse, the Umbra) are lifted so they show on the dark stage. |
| The keeper stands inside the room on wide windows | **Not possible as asked, see "What I saw" below.** I did the part that works: on windows 1500 px and wider the shop-header keeper is drawn bigger (8 px per art pixel instead of 5; both whole multiples of the 14 px grid). |
| Keepers need a body | All 12 rigs are now busts: head, neck, shoulders, torso, two arms with hands, in each keeper's own palette (the garment is the keeper's accent color, shaded). The right hand holds a small prop and does the keeper's work on a stepped loop: Vessa stirs, Brasa taps a hammer, Nix flips a coin, the Curator reads a ledger, Atlas unrolls a chart, the Horologist's watch ticks, Tobb rubs his hands, Aeris, Mote, Seren and Vesper have a glinting orb or star. Reactions use the arms too: a raised hand when you pick or sell, both arms up when you buy, a shrug when you cannot afford it. Breathe, blink, mouth and glance are unchanged; the low-end tier still keeps only the blink, Reduced motion keeps one pose. The Lab Rooms page has a strip with all 11 single keepers (the Conclave is six of them). |
| Panels clash with the room (V4's job) | Noted, not redesigned. See below. Dim strength left alone, except one small legibility fix. |

### What I saw about the shop panels and the room (for V4)
- At 1100 px and at 1600 px the three columns (inventory, shelf, Road) cover the whole window edge to edge; there is no margin. Everything inside the room (including where a standing keeper would be) is hidden behind opaque panels. Only the top band (the shop sign and the keeper's line) and thin gaps show the room. **So the room is visible at about 10 percent of the screen.** That is why a keeper "inside the room" cannot be seen in this layout: it needs V4's layout (panels that leave the counter and the room visible).
- The panels are opaque dark rectangles with square corners, evenly spaced; they read as flat squares laid on a picture, as Carlos said. The room's style (warm light, depth) and the panels' (flat, cold) do not meet.
- One real clash, fixed: the keeper's greeting panel is semi-transparent, and bright wall props (the Forge's pinned notice) showed through its text. I added a soft top dim for the real game only (`--dim-top`, 30 percent black over the top third, none in the Lab). Prices and buttons were already readable.
- The Crossroads, boss stage, table and camp backdrops read fine behind their screens.

## Job 2: V2.5, readable items

### The decision, as specified
Items are no longer rendered 3D. Each of the 115 relics, consumables, runes, Constellations, Totems and Laws is a **hand-authored 32 by 32 pixel sprite drawn in code** (`components/visuals/sprites/`). The style bible (10 points) is written into `ASSETS.md` ("Item sprite style") and followed by every recipe. I did **not** copy, trace or commit Carlos's reference images; I only looked at them for the feel (chunky shapes, colored outline, 3 or 4 flat tones, one highlight, one detail).

### How it is built
- `spriteKit.js`: masks (ellipse, rect, polygon, line, union, difference, shift) and one `paint` that shades by the upper-left light with a four-tone ramp (light on the upper-left edge, dark on the lower-right edge, mid inside, one highlight pixel on the lit corner), then `finish` adds the colored 1 px outline (a dark tint of what it touches, never pure black) and the 1 px soft drop shadow. So every item has the same light, outline and shadow. A recipe is only shapes, a palette and one detail.
- Shared bases (`bases.js`, `shapes.js`): tablet (Runes), star chart with four studs (Constellations, colors from `data/reactions.js`), pole (Totems), tall vial (Transmutes, the element's own liquid color), sealed scroll (Laws, one seal color each), flask, coin, gear, bell, feather, heart, star, ring.
- Recipes by family, committed as I went: 12 test items, relics A, B and C (59), consumables A (the one-of-a-kind tools, seals and potions) and B (the families).
- Where it shows: shop shelves (x2), the inventory strips (x1), the inspector (x2), the Gallery (tiles x2, detail x3), the Run Preview, the game-over screen. Tiles too small for 32 px use a 16 by 16 version derived by keeping the darkest solid pixel of each 2 by 2 block. Until the sprite chunk arrives (a few milliseconds) the old flat sprite shows. The swap rule still works: `public/elementa/visuals/item.<id>.png` wins over the sprite.
- Unseen Gallery items show the sprite's silhouette in one dark tone (the V3.5 behavior, now on the new shapes).

### Numbers
- All 115 sprites build in about **40 ms in total** (measured in Node); each is cached after first use. No build queue, no WebGL, no memory beyond 115 small bitmaps.
- The whole set (kit, shapes, bases, 115 recipes) is one lazy chunk: **13.5 kB gzip** (39.9 kB raw), plus 0.65 kB of CSS. Target was under 40 kB. First load: 421.24 kB gzip against the 413.27 baseline = **+7.97 kB for the whole overhaul**; V3 ended at +6.61, so this job added about **1.3 kB** to the first load (the new `BOSS_COLORS` data, the Gallery grouping, the keeper bodies in `ShopPortrait`, an `ItemIcon` import swap). The sprites themselves add nothing to the first load. The first-load growth is small but not zero; I could not find a way to avoid the Gallery and boss-color code.
- Idle motion: a Lab sheet with all 115 on screen runs 115 bobs and 106 overlay loops (221 animations); a real screen shows about 10 items. Reduced motion and the low-end tier: 0 animations (the overlay elements are not rendered).

### Verification
- Lab "Item sprites" page (`/games/elementa/visuals/sprites`): the sheet (sprite beside its silhouette and the old 3D model and flat sprite, `?old=1`), the silhouette sheet (dark shape on a pale tile), and the "name it" sheet (`?view=nameIt`: no names, then `labels=1`). The V2.5.1 test set is `?ids=test12`.
- Uniqueness check (silhouettes first, then colors; Runes, Constellations, Totems, Transmutes and Laws share a silhouette on purpose and are judged on color): **0 pairs across families are too alike** (shape difference under 0.12 and color difference under 0.55), 7 pairs inside a family have close colors, all of them Constellation signs of the same reaction colors (the poker sets, which stay gold). The first run flagged several round items (coins, charts, seals, a medallion); I redrew the Epsilon, Tide Chart, Safety Net, Warp Seal, Mainspring and Great Attractor and gave the charts four studs so they no longer look like coins.
- Real game from the test saves (the V2 item shop save): shelf, inspector (Extra Reroll), inventory strip, Gallery (seen and unseen), phone Gallery at 375 px (no horizontal scroll). English with Reduced motion on and off; items have no text, so Spanish only changes the names. All browser tests ran with music and sound at 0.
- `vite build` clean; every recipe also runs in plain Node.
- I did **not** re-run the Run Preview and game-over screens in the browser (they use the same `ItemIcon`; code path unchanged).

### Skills used
Loaded earlier in this session and applied: `emil-design-eng`, `impeccable`, `high-end-visual-design`, `design-taste-frontend`, `redesign-existing-projects`, `full-output-enforcement`, `find-animation-opportunities`, `improve-animations` (as a written pass, below), `animation-vocabulary`, `playwright-best-practices` (loaded; the checks were manual in the Browser pane), and the `remotion-*` and `threejs-*` skills (not needed for this job). `review-animations` is user-only: please run `/review-animations`. I did not use any image generation skill.

### `improve-animations` pass on the item and keeper motion
- Everything moves with `transform` or `opacity` only, stepped (`step-end`), so the pixels stay crisp: the 2 px bob (4.2 s, delay per item so a shelf never bobs in unison), sparkle opacity pulses, a 1 px flame lift, a 1 px liquid shift. The hover lift is a 2 px step.
- Kept CSS-only. The spec mentioned "one shared ticker"; stepped CSS needs no JavaScript per frame, so there is no ticker for the sprites.
- Keeper arm loops are 1.6 to 5 s one-shots inside long idles (the hammer taps once every 2.6 s, the coin flips once every 2.2 s) so a shop does not look busy.
- Reaction beats are 0.5 to 0.66 s.
- Fixed while writing: arms pivot at the shoulder (`transform-origin` in art pixels), reaction animations override the idle loops on the same arm, and the low-end tier switches the arms off.

### Items I am still unsure about (please judge in the "name it" sheet)
1. **Riverstone and Bedrock** (a blue blob on water; a striped hexagon): readable as stones, not as those stones.
2. **Safety Net** (a four-leaf clover) vs **Lucky Charm** (a clover pressed in glass, a rounded rectangle): fine apart, but both are green clover shapes.
3. **The three hourglasses** (Glass Cannon, Patient Hourglass, Hourglass) and **Extra Reroll**: same idea, told apart by frame, sand color and the arrow.
4. **Keystone** (a dark tombstone shape with a gold diamond) and **Upgrade Stone** (a grey block with three pips).
5. **Release** (a latch and a cut padlock, small), **Whetstone**, **Mirror Shard** (a blob with a die in it) and **Heat** (the bellows, redrawn once).
6. **Transmute: Earth and Air** (the brown and white vials are the weakest of the four).
7. **Time Capsule** and **Loom of Fate**: much better than V2, but the capsule reads as a jar.
8. **Laws:** the six scrolls differ by seal color and a 4 pixel mark; they are the most alike set by design (the family rule).
9. **Epsilon:** redrawn at the end; check it reads as an epsilon.
10. The old 3D models did not show in the Lab's "show old versions" columns in this Browser pane (WebGL idle build too slow there); the flat sprites did. Compare in your own browser.

### Defaults I chose (change any)
- Recipes live in `components/visuals/sprites/` (kit, shapes, bases, family files), not in `data/itemModels.js` as the spec suggested, because the 3D table stays valid for the Lab's Item gallery and the code needs the kit next to it. `itemModels.js` and the 3D pipeline are untouched and still used by the V2 Item gallery.
- I did not remove the V2 3D code (`ItemModel.jsx`, `three/`): the Lab's Item gallery and the V1 spikes still use it. The game itself no longer uses it for items. If you want it gone after your review, it is a clean delete.
- Silhouette rule: the check treats a family's shared shape as intended.
- Gallery tiles went from 56 to 72 px (sprite at x2) and the detail picture from 72 to 104 px (x3), and the shop shelf was already 72 px (x2). The sidebar strips stay at 44 and 48 px (x1).
- Rarity: the tile frame and glow keep the existing rarity colors; the sprite body is never recolored by rarity (the Gallery unseen silhouettes are neutral).
- Header keeper: 70 px normally and 112 px on windows 1500 px wide or more (whole multiples of the 14 px grid).

### Not done
- V4 and later. The shop interface redesign is V4; I only noted what I saw.
- Spanish and Reduced-motion screenshots of the real game shelf (the Lab pages were checked in both).
- A keeper physically standing inside the room (needs V4's layout).

### Open questions
1. Should the old 3D models and their pipeline be deleted after you accept the sprites?
2. The default Spanish body font (Tiny5) lacks ó, ú, ñ and ü. Switch the Spanish body font, add a fallback font for those letters, or leave it?
3. Do you want the Laws' seals distinguished more (a bigger mark, different scroll ribbons), or is "one family, six seals" right?
4. Gallery tiles are bigger now (72 px). Is that the right density, or should the Gallery stay compact and show the sprite x1?
5. For V4: should the shop shelf stand in a counter or alcove drawn in the room, with the panels reduced to labels and prices, so the room stays visible and the keeper can stand behind it?
