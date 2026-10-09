# Elementa visual overhaul

The plan for making Elementa look and move much better: item models, event backgrounds, cinematics, the map, characters and their small animations. It is built **in small phases, one at a time**, like the game itself. Each phase ends with a playable game, a Visual Lab page to look at the new work, patch notes and a report. Carlos reviews a phase before the next one is written in detail.

Status: **V1 is Built (2026-10-08, Alpha 0.9.6, see `VISUALS_V1_REPORT.md`). V2 to V8 are Proposed** (each gets a full spec after the one before it is built and reviewed). Carlos's direction (2026-10-08): **pixel art in feel, but crisp and premium, and the game must feel alive**: menus and shops most of all should feel like magical places where people actually live, not squares on a background.

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

**Fixing V1 (a small job for the V2 agent to do first):** the V1 title-card spike breaks rules 1, 2 and 3 (wrong typeface and logo, the wrong tagline "Four elements. One cast.", plain colored squares for the elements). Rebuild it so it reuses the real logo component or CSS, the real fonts, the tagline from the strings file, and the real element `PixelIcon`s orbiting, so it reads as the main menu in motion. Check the other V1 spikes (the 3D item spike, the keeper rig and the Market) against rules 4 to 6 and fix any drift.

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

### V2: Item models (Ready once the V1 fix pass is accepted)

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

### V3: Shop rooms and event backgrounds (Proposed)

Turn every shop and event screen into a **lived-in room** (section 1): layered parallax backdrops with ambient animation, props, light, the keeper idling and reacting. Shops: Market, Forge (Brasa and Vesper together), Black Market, Shrine, Vault, Alchemist, Camp, Observatory, Cartography, Clockwork, Pantry, the legendary shops; events: the Crossroads, boss intros, each realm, the Unwritten. SVG, canvas and CSS only, static under Reduced motion. The V1 slice is the template.

### V4: Menus and shop interfaces (Proposed)

Overhaul the **interfaces themselves**: the main menu, file select, options, pause, run preview, the shop's item shelves, price tags, the buy, sell and forge interactions, the Inscribe screen, the Gallery, the Road screen frame, round results. Replace "squares on a background" with a coherent premium system: panels with material and depth, shelves and counters instead of grids, real hover and press states, animated transitions, sound hooks. Keep every function and keyboard path working.

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
