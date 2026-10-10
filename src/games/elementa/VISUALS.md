# Elementa visual overhaul

The plan for making Elementa look and move much better: item models, event backgrounds, cinematics, the map, characters and their small animations. It is built **in small phases, one at a time**, like the game itself. Each phase ends with a playable game, a Visual Lab page to look at the new work, patch notes and a report. Carlos reviews a phase before the next one is written in detail.

Status: **V1 (Alpha 0.9.6), V2 (Alpha 0.9.7) and V3 (Alpha 0.9.8, 2026-10-09, see `VISUALS_V3_REPORT.md`) are Built, plus V2.5 (readable item sprites) and V3.1 (fixes from Carlos's V3 review) on 2026-10-10, Alpha 0.9.9, see `VISUALS_V25_REPORT.md`. V4 to V8 are Proposed** (each gets a full spec after the one before it is built and reviewed). Carlos's direction (2026-10-08): **pixel art in feel, but crisp and premium, and the game must feel alive**: menus and shops most of all should feel like magical places where people actually live, not squares on a background.

## 0. For the agent: read this first

**Rules that never change**
- **Code art only.** Carlos's rule (2026-10-08): *no generative visual art*. Everything visual is made with code: **SVG, canvas, CSS, JavaScript, Three.js / React Three Fiber, framer-motion and Remotion compositions.** Do not use image-generation models, image-generation tools or plugins, AI-generated textures or sprites, or any skill that produces images with a generative model. Do not paste in images made that way. (Carlos's own hand-drawn art will replace the placeholders at v1.0, so assets must be swappable, see V1.)
- **Work in the main checkout only**, branch `elementa-v0.6.5`, no worktrees or extra folders. Commit in small groups. **Do not push or merge** (Carlos pushes).
- **Mute the game before any browser test** (`elementa-music-enabled` = `false`, `elementa-music-volume` and `elementa-sfx-volume` = `0` in localStorage). Carlos plays in his own tab and hears double music otherwise.
- **No em dashes** anywhere. **English and Spanish** for every string. Match the existing code style. Keep the ErrorBoundary working.
- **Respect Reduced motion and the Instant setting** (`useGameSettings`): every animation has a static or instant version.
- **The game stays playable and fast.** Lazy-load everything heavy (Remotion, Three.js scenes, big backdrops). Budget: the first screen's JavaScript may grow by at most **150 kB gzipped** over the whole overhaul; heavy modules load on demand. Measure with `npx vite build` before and after each phase and report both numbers. Target 60 fps on a mid phone; fall back to the current static art on low-end devices (check `navigator.hardwareConcurrency` and `deviceMemory`, and a quick frame-rate probe).
- **Never remove the current art.** The old sprites and backgrounds stay as the fallback until a phase says otherwise.
- Verify with **screenshots** (the Browser pane, muted) of every new asset in the Visual Lab and in the real game at desktop and phone widths, in both languages and with Reduced motion on. Include the screenshot list in the report.
- **Read** the current visuals before changing them: `components/PixelBackdrop.jsx`, `components/PixelSprite.jsx`, `components/ItemIcon.jsx`, `components/KeeperSprite.jsx`, `components/BossAvatar.jsx`, `components/StoryScene.jsx`, `components/RoadMap.jsx`, `data/sprites.js`, `data/story.js`, `ASSETS.md` and GDD sections on art.

**Skills the agent must use.** Load the relevant skills with the Skill tool *before* starting any change, every time (list them in the report). Install missing ones from the registry with the command shown (`npx skills add ...`); Carlos approves installs.

| Skill | Install | Use it for |
|---|---|---|
| **remotion-best-practices** and the other **remotion-*** skills (`remotion-create`, `remotion-docs`, `remotion-markup`, `remotion-interactivity`, `remotion-render`, `remotion-studio`, `remotion-multimedia`, `remotion-captions`, `remotion-maps`, `remotion-saas`, `remotion-upgrade`) (Remotion, 587k installs) | **installed 2026-10-08** | Every Remotion composition: timing, sequences, interpolation, the Player, rendering. `remotion-best-practices` is the router: start there. **Required for V1 and V5 (cinematics).** |
| **animation-vocabulary** (Emil Kowalski, installed) | already installed | Naming exactly what a motion is before building it ("pop in", "rubber-banding"). |
| **find-animation-opportunities** (installed) | already installed | Read-only scan for places that should animate and shouldn't. Run at the start of every phase. |
| **improve-animations** (installed) | already installed | A prioritized audit and plans for motion code. Run at the start of V1 and V7. |
| **review-animations** (installed) | already installed | A strict review of every animation written in a phase. **Run before finishing each phase** and fix what it flags. |
| **emil-design-eng** (installed) | already installed | Design-engineering craft for easing, timing, springs, polish. |
| **impeccable** (installed) | already installed | Overall design quality checks and polish. (Its `overdrive` skill, `pbakaus/impeccable@overdrive`, 63k installs, can be tried for one-off dramatic moments if Carlos approves.) |
| **high-end-visual-design** (installed; `leonxlnx/taste-skill`, 421k) | already installed | Visual hierarchy, spacing, depth and lighting judgment. |
| **design-taste-frontend** (installed) | already installed | General frontend taste, composition and consistency. |
| **redesign-existing-projects** (installed) | already installed | Upgrading an existing UI without breaking it (the map, the shop screens). |
| **full-output-enforcement** (installed) | already installed | Complete files, no placeholders or "rest unchanged" cuts. |
| **find-skills** (installed) | already installed | Looking for another skill when a task needs one. |
| **threejs-fundamentals, -geometry, -animation, -shaders, -materials, -lighting, -postprocessing, -textures, -loaders, -interaction** (`cloudai-x/threejs-skills`, 12k to 17k installs) | **installed 2026-10-08** | The item models and the low-resolution 3D look (V1, V2, V7). The project already uses `three` and React Three Fiber. Postprocessing and shaders help with the pixelation and the glow. |
| **playwright-best-practices** (`currents-dev`, 91k) | **installed 2026-10-08** | Reliable screenshot, visual and interaction checks of the new visuals. |
| *Optional:* **hyperframes-animation / hyperframes-creative** (`heygen-com/hyperframes`, 723k and 683k) | `npx skills add heygen-com/hyperframes` | An HTML-to-video alternative to Remotion with animation guidance; read for ideas, do not mix frameworks without asking Carlos. |
| *Optional:* **pixel-art-sprites** (`omer-metin/skills-for-antigravity`, 2.4k) | `npx skills add omer-metin/skills-for-antigravity` | Pixel-art craft notes; **read it first and ignore anything that generates images**. |

**Skills that must NOT be used here** (they make generative images or do not fit): `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code`, `stitch-design-taste`, the Nano Banana plugin (`banana-claude`) and `json-prompting-for-nano-banana`, `anthropics/skills@canvas-design` (static generated art). `minimalist-ui` and `industrial-brutalist-ui` do not match the game's style.

*A note on third-party skills:* they are instructions the agent will follow. Install only from owners Carlos already trusts or the well-known ones listed above, and read a new skill's `SKILL.md` before relying on it.

## 0b. Design rules already in the game that every phase MUST keep (Carlos, 2026-10-09)

New visuals must **match what the game already looks like**, and Carlos prefers the existing look to anything that drifts from it. Before any change, read GDD sections 14 and 15 (palette, pixel art), E3 and E4 in `EXPANSION.md`, and `elementa.css`. The rules:

1. **Typography:** the game's own fonts and the `el-logo` banded-gold logo style (`.el-logo`, `.pixel-heading`, Press Start 2P for headings and small text, the body font for sentences) as they appear in the main menu. **Never introduce a different typeface or logo style** (the V1 title card did; it must be redone with the real logo and fonts).
2. **The tagline** is **"Roll the elements. Bend the odds."** (`elementa.menu.tagline`, Spanish "Tira los elementos. Doblega la suerte."). Always read it from the strings file, never retype it.
3. **Elements are shown with their real pixel icons** (`PixelIcon`, the four 7x7 marks and the other elements' marks), never as plain colored boxes.
4. **Elements own their color, everywhere** (GDD 14): each element's `color` in `data/elements.js` is its identity, used identically on the die, shop cards, forge cards and tooltips. Never recolor an element. Semantic UI colors, difficulty colors and the rarity scale stay as they are.
5. **Every die emanates its element** (E3): the element's particle layer (`ElementFx`: flames rising off Fire, wind streaks around Air, drips and ripples on Water, pebbles settling on Earth, and each fusion, arcane, god, Mythic and new element's own effect), in the element's color. Any new die model, sprite or 3D render **must keep its element effect**, and the effects keep their Reduced motion and Options toggle.
6. **Every die carries its element logo** (E4): the element's symbol in the middle where there is no face to show, and its mark beside or on the face elsewhere, so dice are told apart at a glance, and **each element's die is a different color that matches its element**. A new rendering of a die must preserve the shape per size (DieSprite silhouettes), the element color, the symbol and the effect.
7. **Palette tokens:** `--ink`, `--stone-*`, `--wood-*`, `--gold-*`, `--arcane` and the realm palettes already used by the screens. New art draws from them.
8. **Existing screens are the reference:** the main menu, the title screen, the shop and the table. When a new piece sits beside an old one (a cinematic next to the title screen, a room behind the existing shop UI), the two must look like the same game.

**Fixing V1 (done 2026-10-09, see `VISUALS_V1_REPORT.md`):** the V1 title-card spike breaks rules 1, 2 and 3 (wrong typeface and logo, the wrong tagline "Four elements. One cast.", plain colored squares for the elements). Rebuild it so it reuses the real logo component or CSS, the real fonts, the tagline from the strings file, and the real element `PixelIcon`s orbiting, so it reads as the main menu in motion. Check the other V1 spikes (the 3D item spike, the keeper rig and the Market) against rules 4 to 6 and fix any drift.

## 1. Art direction (Carlos confirmed the pixel feel on 2026-10-08)

**Crisp, premium, alive.** Carlos: the new visuals stay pixel art in feel, but should feel **crisp and premium**, and **the game must feel alive.** The menus and the shops "just feel like squares on a background"; a shop should feel like **a magical place where people actually live.** What that means for every phase:
- **Lived-in rooms.** Each shop is a *room*, not a panel: a backdrop with depth, props on shelves and walls, a counter, light sources, and the keeper behind it, doing small things (stirring, polishing, reading, glancing at the player, reacting to a purchase). Ambient life: dust, sparks, steam, moving shadows, a creature in a corner, a window with weather or stars.
- **Objects behave like objects.** Items sit on the shelf with a shadow, rock when hovered, lift when picked, and **leave a gap** when bought; the keeper reacts (a nod, a smile, a grumble).
- **Micro-interactions everywhere.** Buttons press and release, panels slide with weight, numbers tick, rewards pop and settle; sounds hook in at the same moments (sound hooks only, the audio system stays as it is).
- **Premium finish.** Consistent spacing and type, soft depth (hard pixel shadows plus a faint glow), proper hierarchy, clean states (hover, focus, pressed, disabled), no stray default-looking elements. Everything crisp at integer scales.
- **Alive but calm.** Motion is slow and gentle by default (idle loops of 3 to 8 seconds), never noisy, and always off with Reduced motion.

## 1b. Art direction details (Default, Carlos may change them)

- **Keep the pixel-art feel.** The game is pixel art with a CRT mood. New work should look like *"pixel-lit"*: low-resolution rendering scaled up with nearest-neighbor, a **limited palette** drawn from the existing tokens in `elementa.css` and each element's color in `data/elements.js`, hard shadows, a little dithering. 3D is rendered at low resolution (about 64 to 128 px per item) and shown pixelated, so it matches the sprites.
- **Light and mood by realm.** Elementa warm and earthy; the Firmament cold violet and starry; the Empyrean strict and gridded; the Pleroma soft and dissolving; the Meridian swinging; the Unwritten fading to blank paper.
- **Consistency over detail.** One light direction (top left), one outline style, one animation language (snappy in, soft out).

## 2. Swappable assets (important)

Carlos will draw his own art for v1.0. Every new asset is looked up **by id** through one registry (`data/visualRegistry.js`): an id resolves to a `kind` (`code`, `three`, `remotion`, `image`) and a loader. Dropping a PNG, SVG or sprite sheet at a path named for the id must replace the code-made version with **no code changes**. Document the naming rule in `ASSETS.md`.

## 3. The phases

Each phase is one release: "Alpha v0.9.x" patch notes in `data/patchNotes.js` and EXPANSION Part D, a CONTENT or GDD note, the Visual Lab page updated, and a report. A phase is done when Carlos has seen it and said yes.

### V1: Foundations and the Visual Lab (Built, waiting for Carlos's review)

Goal: prove the tools and set the rules before any mass work. Nothing user-facing changes except new routes.

1. **Audit first (read-only).** Run `find-animation-opportunities` and `improve-animations` on the current visuals and write `VISUALS_AUDIT.md`: an inventory of every item sprite (relics, consumables, dice, runes, sigils), every background and event screen, every story scene (about 36 in `data/story.js`), the map and every character (keepers, bosses, gods, Pip, the Arbiter), each with its current state and what V2 to V7 should do. This list feeds the later specs.
2. **The registry and the swap rule** (`data/visualRegistry.js`, section 2) plus the first docs in `ASSETS.md`.
3. **Three spikes, each one tiny and lazy-loaded:**
   - **Remotion in the game.** Install `remotion` and `@remotion/player`. Build one 6 second composition (a title card with parallax stars and a bilingual line) and play it in a small `CinematicPlayer` wrapper with skip, replay, Reduced motion (shows the last frame) and language. Report the bundle cost and a simple frame-time number.
   - **Low-resolution 3D items.** With React Three Fiber, render **one relic, one consumable and one die** as 96 px pixelated 3D objects (a parametric gem, a potion, a die) with a rarity glow, an idle turn and a hover tilt; render once into a cached canvas or sprite so the game itself does not run live 3D on every item. Report cost per item.
   - **A layered SVG character.** Rig **one keeper** (Brasa) as layers with an idle breathe, a blink and a talking mouth, from the existing sprite shapes. Report cost.
4. **A lived-in shop slice (the "feel test").** Build **one** shop room in the Visual Lab only, the Market: a layered backdrop with depth, shelves with a few of the spike items sitting on them, props, ambient particles and light, the keeper (the Brasa-style rig for the spike, Tobb if cheap) idling and reacting to a mock purchase (item lifts, a gap appears, a nod). It is the target the later shop work is measured against, so make it genuinely good, not a placeholder; keep it small. Report cost and include a screenshot set.
5. **The Visual Lab**, a standalone page at `/games/elementa/visuals` (like the Jukebox): shows every spike, the registry's assets, toggles for Reduced motion and language, and a frame-rate readout. Linked from Options next to the Jukebox.
6. **Budget and performance gate:** a small script (`tools/visualBudget.mjs`) that prints the bundle sizes and fails if the first-load budget is exceeded.
7. **Report:** what worked, what cost too much, and a recommendation for V2 (which approach for items: live 3D, pre-rendered cache or procedural SVG), with numbers and screenshots.

Do not build anything else in V1: no mass item models, no real-game backgrounds, no scenes, no changes to the real menus or shops.

### V2: Item models (Built 2026-10-09, Alpha 0.9.7, see `VISUALS_V2_REPORT.md`; waiting for Carlos's review)

**Carlos's V2 answers (2026-10-09):** 16 frames per item; rigs replace the old keeper sprites where a rig exists (V3); a still PNG per keeper for hand-drawn replacements (layered later if wanted); sound hooks wired to existing sfx in V4; V3 and V4 right after. **Dice are NOT part of V2's 3D items:** on the table dice keep their shaped sprite, element color, symbol and element effects (section 0b).

**Goal.** Every **relic, consumable, rune, Constellation, Totem and Law** (about 115 items) gets a crisp, premium, pixel-lit 3D-rendered model, cached as a 24 by 24, 16 frame sprite strip, replacing today's flat item sprite in the shop, the inventory, the inspector, the Gallery and reward screens, with the old sprite as the fallback. Per V1's recommendation: pre-rendered and cached, built lazily in idle time, never blocking a purchase.

**V2.1 The generators.** Parametric families (about 14): gem (round, rough, faceted), potion and flask, scroll, key, coin, tome, shard, pouch, crown, ring, hourglass, tag and rune stone, plus whatever the audit (`VISUALS_AUDIT.md`) shows is needed. Each is a function from parameters (shape, proportions, colors, a signature detail) to geometry, using the V1 toon-ramp pipeline. No bespoke model per item.

**V2.2 The item table.** One data file, `data/itemModels.js`, maps **every item id to a generator and its parameters**, built from each item's `itemConcept` text and its element (`itemConcept` in `data/relics.js` and `data/consumables.js` is the brief). Rules:
- **An item's element colors it** when it has one (a Fire relic leans red-orange, Water blue, Earth tan, Air pale); Neutral items use the gold and stone palette. Rarity sets the glow and trim, using the existing rarity scale (GDD 14), not new colors.
- Each item has a **signature detail** that makes it recognizable at 24 pixels (a flame, a drop, a gear, a star), taken from its concept. Two items must never look the same at a glance: run a uniqueness check (a script that compares atlases and flags near-duplicates).
- Swap rule: dropping a PNG at the registry path for an id replaces the model with no code change (V1's registry).

**V2.3 Where it shows.** Shop shelves (idle turn, hover tilt, a rarity-based reveal when bought), the inventory strip, the inspector (a larger turn), the Gallery (unseen items stay silhouettes), reward screens, the Run Info. Build the atlases **in idle time after the shop appears**, never on the click; a hidden tab builds when shown; low-end devices (V1's probe) and Reduced motion get the static first frame or the old sprite.

**V2.4 Quality bar.** Crisp at integer scales, consistent light from the top left, a 1 pixel ink outline, the limited palette, and **no item reads as a colored blob**. Before and after screenshots of every family in the Visual Lab ("Item gallery" page: all items in a grid, by rarity and by element).

**V2.5 Budget and report.** Keep the first-load budget; the item code lazy-loads with the shop. Report build time and memory for the whole set, the uniqueness check, the list of items that fell back and why, the screenshots, and the skills used. Run `improve-animations` on the idle and reveal motion; Carlos runs `/review-animations` himself afterward (that skill is user-invoked).

Do not build backgrounds, menus, scenes, characters or the map in V2. Patch notes "Alpha 0.9.7 Item models".

### V2.5: Readable items (Built 2026-10-10, Alpha 0.9.9, see `VISUALS_V25_REPORT.md`; waiting for Carlos's review)

**Carlos's verdict on V2:** the rooms and the look are good, but **most items look wonky and you cannot tell what they are.** They need **clearer shapes and bezels, or a simpler design.** Carlos attached five reference images of item sprites he likes. They are **style references only: do not copy or trace them, and do not use them as game assets** (read them from the paths below; do not commit them). Names of the files: `/Users/charly/.claude/uploads/28a1f7d7-17eb-4412-b834-1d8ee4ca4950/` followed by `71600530-image.jpg` (eight chunky items on a dark panel: candle, crystal, sword, chest, flame, ruby, gold bar, spiked ring), `4edc5071-image.jpg` (a sheet of small bright item icons: jars, feathers, keys, potions, food, eggs, books), `8e526807-image.jpg` (sixteen items on white: candle, split bread, key, scroll, books, ticket, bag, envelope, goblet, parcel, shell), `7f1ec447-image.jpg` (a column of fifteen spell books, each with a different rune and color), `da5aaa3e-image.jpg` (eight books in different covers).

**Why V2 reads wonky (diagnosis).** The V2 pipeline renders a small 3D model at 24 by 24 and shrinks it with a toon ramp. At that size a 3D model loses its silhouette: edges are soft, details are 1 pixel, and a rotating object has no single "icon pose". Carlos's references work because each is a **drawn icon with one strong silhouette, a clean dark outline, 3 to 4 flat tones, one highlight and one signature detail**, in a single readable pose.

**The decision (Carlos approved the diagnosis in spirit; this is Claude's spec): items become hand-authored pixel-art sprites defined in code**, not rendered 3D. This is still code art: each item is a small **palette-indexed bitmap in a data file** (like `PixelIcon`), drawn by the agent, rendered crisp at integer scales. The idle life comes from **2D motion** (a gentle bob, a glint sweeping across, a shimmer, a flicker), not from rotating a model. The 3D pipeline and atlas stay available (Item gallery, the swap rule, V1 spikes) but stop being the default for relics, consumables, runes and the rest. Keep the registry swap rule: a hand-drawn PNG still replaces any item.

**The style bible (write it down in `ASSETS.md` as "Item sprite style" and follow it for every item):**
1. **Size 32 by 32** (not 24), drawn on a 32 grid, shown at x2, x3 or x4. Keep a 1 px transparent margin. (A 16 by 16 mini version is derived by a documented rule for the Gallery's small tiles, or drawn by hand for the ones that need it.)
2. **One silhouette, readable in solid black.** Before coloring, every item must be recognizable as a flat black shape at 32 px. Test it: the Lab shows every item as a silhouette beside the colored one, and Carlos judges. If two items share a silhouette, change one.
3. **A colored dark outline, 1 px**, never pure black (a darker shade of the item's main color), with a 1 px **soft drop shadow** at the lower right.
4. **Three or four tones per material** (dark, mid, light, highlight), flat, no dithering inside an object, and **one bright highlight** at the upper left. Light always comes from the upper left.
5. **Clear bezels and frames:** anything with a frame, rim or gem setting has a clean, even bezel of one tone; no noisy edges.
6. **One signature detail** (a flame, a drop, a gear, an eye) at most 4 by 4 pixels, centered on the object, never a collection of tiny marks.
7. **Simple beats detailed.** Prefer the plainest drawing that says what it is (a key is a key; a book is a book with a cover mark). Remove detail until a stranger can name it.
8. **Consistent pose and perspective:** front view for most objects; a 3/4 top view for books, chests and boxes, as in the references. No rotation poses.
9. **Elements own their color** (section 0b): a Fire item leans red-orange, Water blue, Earth tan and brown, Air pale gray-white; Neutral items use the gold and stone palette. **Rarity** shows as a **soft glow and a small corner pip**, never a recolor of the body, and trims stay metallic (Carlos, 2026-10-09).
10. **A family look so a set reads as a set:** all Runes are a stone tablet with a glowing glyph (the colors of the rune's effect); all Constellations a star chart on a dark disc with the sign in the reaction's colors; all Totems a carved pole in the family's color; all Laws a scroll with a seal; consumables of the same type share a base shape and differ in color and a small mark; potions are a flask shape with a colored liquid.

**What to build.**
- **V2.5.1 The style bible and a test set of 12 items** (the 6 weak ones from V2: Windfall, Weights, Loom of Fate, Prism Lens, Bookends, Time Capsule, plus 6 others across relics, consumables, runes and Laws) as hand-authored 32 by 32 sprites. Put them in the Lab's Item gallery next to the old versions and their silhouettes. **Stop and report with screenshots here** if you are unsure of the direction; otherwise continue.
- **V2.5.2 All remaining items** (the 115) in the same style, from the `itemConcept` text and the element, in the item table `data/itemModels.js` (kind `bitmap`), by family, committing after each family. Reuse shared base shapes (flask, tablet, scroll, pole, pouch, coin, ring, crown) with per-item palettes and one detail each, then hand-tune the ones that need it.
- **V2.5.3 Idle motion in 2D:** bob (2 px, stepped, 3 to 5 s), glint sweep on metals and gems, a shimmer or flicker where it fits (a flame item flickers, a potion's liquid shifts a pixel), hover lifts and rocks the sprite, the buy reveal keeps its rarity ring. All transform and opacity, one shared ticker, static under Reduced motion, still frame on the low-end tier.
- **V2.5.4 Uniqueness and legibility checks:** keep the uniqueness script (now on silhouettes first, then colors), add the **silhouette sheet** page, and a **"name it" sheet** (all items at x2 with no labels, then with labels) so Carlos can quiz himself on which items still read poorly.
- **V2.5.5 Keep what works:** where V2 is cached 3D, the idle-time build queue and the old fallback sprite are no longer needed for these items (bitmaps are instant); remove dead paths only if safe, otherwise leave and note. The first-load budget must not grow; the bitmaps are small data, loaded with the shop (target: under 40 kB gzip for the whole set).

Verify and report as in V2 (screenshots of every family in the Lab and in the real game: the shop shelf, the inventory strip, the inspector, the Gallery, desktop and phone, EN and ES, Reduced motion), the skills used, the list of items you are unsure about, and open questions. Patch notes "Alpha 0.9.9 Readable items".

### V3: Shop rooms and event backgrounds (Ready, spec 2026-10-09)

**Carlos's V2 answers, applied from V3 on (2026-10-09):** (1) trims stay metallic and the rarity color goes in the glow only (elements own their color); (2) each Constellation model takes its colors from its reaction in `data/reactions.js`; (3) sidebar items move on hover only; (4) the polish pass on the V2 weak spots (Windfall, Weights, Loom of Fate, Prism Lens, Bookends, Time Capsule) is its own small job after V4, **but fix points 1 and 2 as part of V3's first commit**; (5) unseen Gallery items show the dark model silhouette instead of "?" (build it in V3).

**Goal.** Turn every shop and event screen from "squares on a background" into a **lived-in room where people actually live** (section 1): layered, animated, with props, light, a keeper who idles and reacts, and the shelves, counter and items already built (V2). The V1 Market (`components/visuals/room/MarketRoom.jsx`) is the template and the bar. This phase **replaces the real game's shop backdrops**; the shop's **functions, buttons, prices, keyboard paths and layout rules do not change** (V4 redoes the interface itself).

**V3.1 The room system.** Turn the Market slice into a reusable system: a room is data (layers, props, light sources, ambient particles, the keeper rig and its idle and reaction beats, shelf slots, a counter) rendered by one engine (`components/visuals/room/`), so each of the 14 rooms is a data file plus a few bespoke props, not a new component. Rules: SVG, canvas, CSS only; stepped to whole art pixels; transform and opacity animations only; animated layers separate from static ones; **a shared ambient loop**, not a timer per prop; static under Reduced motion; fewer layers and no particles on the low-end tier; the 320 by 180 art box scaled by whole numbers, with a graceful fractional scale on phones.

**V3.2 The rooms** (each: palette from the shop's color in `data/shops.js`, a different light, **at least 6 props that tell who lives there**, a keeper that does something, and an ambient detail that moves):

| Room | Keeper | Feel and props (Draft) |
|---|---|---|
| **Market** | Tobb | Warm wooden stall, lanterns, hanging goods, a cart, a sleeping cat. (Exists; adapt it to the real game.) |
| **Forge** | Brasa and Vesper (Firmament) | Glowing forge mouth, anvil, tongs, sparks, bellows pumping; Vesper's star-charts and a floating orrery in the Firmament version. |
| **Alchemist** | Vessa | Bubbling cauldron, shelves of bottles, drifting vapors, a stuffed owl, color-shifting flasks. |
| **Vault** | The Curator | Stone archive, cases under glass, a rolling ladder, dust in light shafts, the fallen's dice displayed. |
| **Black Market** | Nix | Back-alley under eclipse light, hooded crates, flickering sign, shadows moving, pact scrolls pinned to a wall. |
| **Shrine** | Aeris | Pale blue-white temple, floating feathers, a prayer flame, blessing glyphs, soft god-rays. |
| **Aether Bazaar** | the Conclave | The grand room: gold and violet, floating wares, every other shop's stall in miniature. |
| **Astral Exchange** | the Conclave | Firmament version: starfield through a glass dome, orbiting wares, ticker lights. |
| **Cartography** | Atlas | A map table, rolled charts, a compass, ink and pens, a window onto the Road. |
| **Clockwork** | The Horologist | Walls of ticking gears and clocks, a pendulum swinging, sand falling in a glass. |
| **Observatory** | Seren | A telescope under an open dome, star charts, constellation lights drawing themselves. |
| **Pantry** | Mote | A dim larder of hungry shadow, jars, a small Void that watches; it brightens as Mote's meter fills. |
| **Camp** | Tobb | A campfire in the dark, tea on a stone, a tent, the Road in the distance. |
| **Vesper's corner** | Vesper | Not a room: her second portrait and idle in the Forge. |

Realm tints: the same room takes a light shift per realm (Elementa warm, Firmament cold violet, Empyrean gridded, Pleroma dissolving, Meridian swinging) with a palette shift, not new art.

**V3.3 Event screens.** The same system builds the other scenes: **the Crossroads** (the door, a gate in the sky), **boss intros** (a stage per boss tier with that boss's color and an entrance beat), **realm backdrops** (Elementa, Firmament, Empyrean, Pleroma, Meridian and The Unwritten, whose blank page erases), **the table's backdrop** (the round screen's room, with realm tint) and **the Road screen's frame** (V6 does the map itself). Each replaces the matching `PixelBackdrop` scene with the old one as the fallback.

**V3.4 Keepers.** Replace `KeeperSprite` with a rig wherever a rig exists. Build rigs (palette and head from the existing sprites, the V1 data-driven `rigData.js`) for **all 12 keepers** in `data/keepers.js` (Tobb, Vessa, the Curator, Brasa, Nix, Aeris, Atlas, the Horologist, Seren, Mote, Vesper, the Conclave), each with an idle breathe, a blink, a talking mouth during their line, and **reaction beats** that the shop emits: welcome, an item picked, bought, can't afford (a grumble), sold, restock, leaving. Lines keep coming from `data/keepers.js` (the dialog system is unchanged). Pip and the Arbiter get rigs in V7, not here.

**V3.5 Gallery silhouettes (Carlos's answer 5).** Unseen items and dice show the dark silhouette of their model (the shape, no color, no detail) instead of "?", in the Gallery tiles and detail panel; the text stays "???" and spoils nothing (no family, no rarity, as already decided for the Unlocks box).

**V3.6 Rules that must hold** (section 0b): fonts and the logo style; elements own their color; the shop's own color and each keeper's palette stay; dice are never redrawn here; nothing covers the shop's controls or the dice tray; **contrast and legibility of every price, button and line of text must be at least as good as today**: dim the room behind the UI where needed.

**V3.7 Performance and phones.** Build each room's art lazily when its shop is entered (the room art is a lazy chunk per room family), never in the main bundle. Budget: first load grows by at most **15 kB gzip** in V3 (the rooms are lazy); report each room's chunk size and the idle animation count per room. Under Reduced motion nothing moves; on the low-end tier use the static backdrop plus the keeper rig's blink only; on phones the room scales to the width without horizontal scroll and the shelf stays tappable.

**V3.8 Sound hooks** only: rooms emit the event names from V1 (`hover`, `pick`, `buy`, `bell`, `broke`, `restock`) and the new ones (`welcome`, `leave`, `sell`) on a small event bus; V4 wires them to the existing sfx. **Do not play sounds in V3.**

**V3.9 Verify and report.** The Visual Lab gets a **Rooms** page: every room, every realm tint, Reduced motion and low tier toggles, an animation counter and a frame-rate readout. Test saves that put the real game in each shop and each event (use the existing test-save tools). Screenshots of every room in the Lab and in the real game at desktop and phone, English and Spanish, with Reduced motion. Run `improve-animations` on the rooms' motion; Carlos runs `/review-animations`. Report: what you built, numbers per room (chunk size, DOM nodes, running animations), skills used, every default you chose, anything skipped, open questions. Patch notes "Alpha 0.9.8 Shop rooms".

**Do not build** in V3: the menus or the shop's interface (V4), cinematics (V5), the Road map (V6), character rigs for Pip, bosses, gods or the Arbiter (V7), or the V2 weak-spot polish.

### V3.1: Fixes from Carlos's V3 review (Built 2026-10-10, see `VISUALS_V25_REPORT.md`)

Carlos reviewed V3: "they are looking good, we can advance". Answers to the V3 open questions and two new notes:
1. **Gallery grouping:** unseen entries are grouped **neutrally** (no rarity or family headers) so nothing is spoiled.
2. **The missing uppercase "É":** the Spanish name of the Aether Bazaar uses **"Ether"** (Carlos's choice; "Bazar del Ether"), avoiding the glyph. Check every other uppercase pixel-font string for characters the font lacks and fix them the same way.
3. **Boss colors:** add a `color` (and a stage color) to each boss, god and Warden in `data/bossModifiers.js` and use it for the boss stage rooms. (A small data change in the engine area; keep it minimal.)
4. **The keeper stands inside the room** in the real game on wide windows (the header portrait remains on narrow screens).
5. **Keepers need a body (new note from Carlos):** today a keeper rig is only a head floating in the room, which looks odd. Redraw the 12 rigs as a **head, neck and upper body (a bust or three-quarter figure)** with shoulders and arms/hands that can do the small actions (stirring, polishing, reading, holding a ledger, tending the forge) and reactions, using each keeper's existing palette and head so they are recognizably the same person. They sit behind the counter, so the legs are hidden. Keep the idle breathe, blink, mouth and reaction beats.
6. **The shop interface does not match its room (new note from Carlos, "blocking progress"):** in the real game the shop's panels still look like flat squares laid on top of the new room. **That is V4's job and the biggest next piece** (below); in V3.1 only make sure the room's dim and the panels do not clash badly, and note what you see.
7. **Dim strength:** leave as is for now; V4 will redo the panels, and the dim will be retuned then.

### V4: The shop as a scene, then the menus (Ready, spec 2026-10-10)

**Carlos's review (2026-10-10), from a screenshot of the real Market:** the items are clear and the keepers look good, but **the shop is still four flat dark panels laid on top of the room**: a left sidebar, a "Dice" panel, a "Relics & items" panel, a right sidebar, plus a greeting box and a row of buttons. You only see the overlay; the room is a strip at the edges. "They are still just panels on top." **This phase fixes it.** The keepers have no full body, so **their poses must look right behind the counter** (cropped by it, never floating).

**The principle.** *The interface is the room.* Every control a player uses must be an **object in the scene made of that shop's own materials** (wood, stone, brass, parchment, glass, cloth, iron), not a flat rectangle. The panels stop being panels. **Function does not change:** every button, price, key path, tooltip, drag and drop, popover and rule keeps working exactly as today (same actions, same hotkeys, same accessibility labels).

**V4.1 The scene layout (shops).** One composition, 16 by 9 friendly, scaling by whole numbers, shared by all 13 shops with per-shop materials and props:
1. **The back wall and the keeper:** the keeper (a V3.1 bust) stands behind the counter, centered a little left, **cropped at the waist by the counter** so a half-body reads as a person standing behind a bar, never as a floating bust. Their line of dialog is a **hanging sign or a chalkboard / parchment banner** near them (not a rectangle panel); the shop name keeps its signboard.
2. **The counter and shelves are the item display:** **Dice** sit on **the counter's surface** (a wooden, stone or brass top with a lip and a shadow), each die with its price on a **small tag hanging or standing next to it** (a hang-tag), not a price chip floating over a flat panel. **Relics and items** sit on **wall shelves behind the keeper** (two or three planks with brackets, items resting on them, small price tags pinned under each), as in the V2.5 sprites. A bought item leaves a gap; the keeper reacts (V3 events). The shelf's slots are the room's real depth: items overlap props, cast shadows on the plank, and the lantern light touches them.
3. **Left sidebar (your pool, relics, consumables):** becomes **your own bag and a satchel laid on the counter's near edge, or a chest at the bottom left**: an open pouch holding dice slots, a small rack for relics, a row of pegs or pockets for consumables, made of leather, cloth and brass, not a dark column. Empty slots are **pockets or recesses**, not black squares. The target-cleared result becomes a **stamped receipt or ticket** pinned beside it.
4. **Right sidebar (the Road and the buttons):** becomes **a map table or a parchment map pinned to a board** (the Road), with Shards as **a coin purse with a counter**, round and next target as **engraved plaques**, lives as **hearts on a rail**. The **Pick a stop** and **Reroll shop** buttons become **wooden or brass plaques and levers** (a physical lever or bell pull is welcome) with press and release states.
5. **Forge and other special shops:** their extra panels (the Forge's slots and recipes, the Brew, Cartography's services, the Black Market's deals, the Shrine's blessings, the Pantry's meter, Vesper's Stardust and the Inscribe screen) become **objects on the same counter or wall**: the Forge's four slots are **four recesses in the anvil's stone with glowing rims**; the Brew is **a cauldron and two jars**; deals and blessings are **scrolls or tablets** on a board; the Pantry's meter is **a jar that fills**. Same functions, same data.
6. **The room stays visible:** the scene is composed so that **at least half the picture is room and props**, the UI objects sit in it, and **no flat panel bigger than a signboard** remains. Where text needs a quiet background (long descriptions, the inspector, the tooltips) use **parchment or a slate tablet** objects sized to the text, never a full-width dark box.
7. **Legibility is non-negotiable:** every price, button label and line of text stays **at least as readable as today** (contrast, size, the game's fonts and `el-logo` style, section 0b). Test with Reduced motion and at phone width.

**V4.2 Phones and narrow screens.** On narrow screens the scene stacks: the keeper and counter on top, the shelf below, the bag and the map as pull-up drawers (a pouch tab and a map tab) styled as the same objects. Everything stays tappable at 44 px minimum targets.

**V4.3 The materials system.** A small token set per shop (wood, stone, brass, parchment, cloth, iron, glass, plus an accent) and reusable **object components** (`Counter`, `Shelf`, `PriceTag`, `Plaque`, `Lever`, `Pouch`, `Signboard`, `Slate`, `Pocket`), drawn as SVG or CSS in the pixel style (hard shadows, 1 px colored outlines, 3 to 4 tones, upper-left light), all code art, all swappable by id for Carlos's hand-drawn versions (registry). Hover, focus, pressed, disabled and selected states for every object, with the V3 room events (`hover`, `pick`, `buy`, `broke`, `sell`, `restock`, `bell`) emitted as sound hooks. **Wire the sound hooks to the game's existing sfx now** (hover tick, pick, buy coin, a buzz for `broke`, bell), matching the loudness of today's sounds, and respecting the existing volume and mute settings.

**V4.4 The rest of the menus (second half of V4, after the shops are accepted).** Apply the same principle to: the main menu and title screen (a tavern-style board or a desk with the file slots as objects), file select (three save files as books or lockets), options (a control panel of knobs and sliders as physical objects), the pause menu (a small table), the run preview ("Where you left off": a map and a journal), the round results (a ledger and a stamp), the game-over screen (a gravestone-style board), the Gallery (display cabinets by category) and the Inscribe screen. **Do not start V4.4 until Carlos has accepted V4.1 to V4.3 in the real game.**

**V4.5 Fixes carried in.** (a) The Spanish body font Tiny5 lacks ó, ú, ñ, ü: add a pixel-compatible fallback for those letters or switch the Spanish body font, and check every Spanish screen. (b) Make the six Laws' seals more distinct. (c) Keep Gallery tiles at 72 px. (d) Leave the old 3D code in place until Carlos accepts the sprites in the real game (he decided to iterate on items later, see "Later").

**V4.6 Verify and report.** Test saves that put the real game in every shop (extend `tools/roomTestSaves.mjs`). Screenshots of every shop at desktop and phone, English and Spanish, with Reduced motion, plus **before and after** of the Market. Check with the Browser pane that every control still works (buy, sell, reroll, upgrade, forge, brew, deals, blessings, services, drag to reorder, inspect, keyboard shortcuts) and that the shop's text contrast has not dropped. Budget: first-load JS may grow by at most 15 kB gzip; the objects and scene are lazy per shop family. Run `improve-animations` on the new motion; Carlos runs `/review-animations`. Report: what you built, how you verified it, numbers per shop (chunk size, DOM nodes, running animations), skills used, every default, anything skipped, open questions. Patch notes "Alpha 0.9.10 The shop is the room".

**Do not build** in V4: cinematics (V5), the Road map's own visuals (V6, though the shop's map-table object shows the existing map component as is), character rigs for Pip, bosses, gods or the Arbiter (V7), the item redraw (Later).

### V5: Cinematics (Proposed)

Rebuild every story scene as a Remotion composition played by the `CinematicPlayer`: camera moves, parallax, character poses and expressions, text reveals, hooks for sound. Skip, replay and the Gallery's replay list keep working. English and Spanish stay live text.

### V6: The Map (Proposed)

A new layout and visuals for the Road: clearer realm dividers and portals, node icons by shop type, animated paths, a clear "you are here", zoom and pan, phone friendly. The data model (`engine/map.js`) does not change.

### V7: Characters and small animations (Proposed)

Layered SVG rigs and expressions for keepers, bosses, gods, Pip and the Arbiter: idle breathing, blinking, talking, reactions to events, boss intro animations.

### V8: Polish and performance (Proposed)

A full pass with `review-animations`: consistency, timing, Reduced motion, phone performance, bundle budget, a final screenshot sweep, docs. Optionally a trailer composition (see `STEAM.md`).

## 4. Open questions for Carlos

- Pixel-lit art direction (section 1), yes or a new direction?
- Remotion live in the game for cinematics (V4) and rendered video only for the trailer, yes?
- Which phase matters most to you after V1? (I would take V3 and V4 first, since the shops and menus are the screens players see most.)

## 5. Later (parked by Carlos, 2026-10-10)

- **Items, a second iteration.** Carlos: the V2.5 items are clear, but "we still need more iteration to land on something good". He wants **another version that is more low-res and fits the game better**, and he **likes that some items were 3D: maybe not all, but the Legendary and Mythic ones**. Plan for later: a lower-resolution sprite style for common items (a 16 by 16 or 24 by 24 look, bolder and simpler, matching the dice and icons), with **cached 3D models kept for Legendary, Mythic, Divine, Abstract and Absolute items** (the V2 pipeline stays in the repo for this, so **do not delete the old 3D code**). A rarity-based style ladder, then, instead of one style for everything. Also the weak-spot items (Riverstone, Bedrock, Safety Net versus Lucky Charm, the hourglasses, Keystone, Upgrade Stone, Release, Whetstone, Mirror Shard, Heat, Transmute Earth and Air, Time Capsule, Loom of Fate, Epsilon).
- **The V1 and V2 3D code** stays until that decision is made.
