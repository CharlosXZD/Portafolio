# Elementa visual overhaul

The plan for making Elementa look and move much better: item models, event backgrounds, cinematics, the map, characters and their small animations. It is built **in small phases, one at a time**, like the game itself. Each phase ends with a playable game, a Visual Lab page to look at the new work, patch notes and a report. Carlos reviews a phase before the next one is written in detail.

Status: **V1 is Ready. V2 to V8 are Proposed** (each gets a full spec after the one before it is built and reviewed). Carlos's direction (2026-10-08): **pixel art in feel, but crisp and premium, and the game must feel alive**: menus and shops most of all should feel like magical places where people actually live, not squares on a background.

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

### V1: Foundations and the Visual Lab (Ready)

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

### V2: Item models (Proposed)

Parametric generators (a gem, a potion, a scroll, a key, a coin, a tome, a shard, a die...) instead of 150 bespoke models; each relic, consumable, rune and die gets a generator plus parameters (shape, color, rarity glow, a signature detail). Idle motion, hover and inspect animations, a rarity-based reveal when bought. Pre-rendered and cached. Old sprites stay as a fallback.

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
