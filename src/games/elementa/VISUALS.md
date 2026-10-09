# Elementa visual overhaul

The plan for making Elementa look and move much better: item models, event backgrounds, cinematics, the map, characters and their small animations. It is built **in small phases, one at a time**, like the game itself. Each phase ends with a playable game, a Visual Lab page to look at the new work, patch notes and a report. Carlos reviews a phase before the next one is written in detail.

Status: **V1 is Ready. V2 to V7 are Proposed** (each gets a full spec after the one before it is built and reviewed).

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
| **remotion-best-practices** (Remotion, 587k installs) | `npx skills add remotion-dev/skills` | Every Remotion composition: timing, sequences, interpolation, the Player, rendering. **Required for V1 and V4.** |
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
| **threejs-fundamentals, threejs-geometry, threejs-animation, threejs-shaders** (`cloudai-x/threejs-skills`, 12k to 17k installs) | `npx skills add cloudai-x/threejs-skills` | The item models and the low-resolution 3D look (V1, V2, V6). The project already uses `three` and React Three Fiber. |
| **playwright-best-practices** (`currents-dev`, 91k) | `npx skills add currents-dev/playwright-best-practices-skill` | Reliable screenshot and interaction checks of the new visuals. |
| *Optional:* **hyperframes-animation / hyperframes-creative** (`heygen-com/hyperframes`, 723k and 683k) | `npx skills add heygen-com/hyperframes` | An HTML-to-video alternative to Remotion with animation guidance; read for ideas, do not mix frameworks without asking Carlos. |
| *Optional:* **pixel-art-sprites** (`omer-metin/skills-for-antigravity`, 2.4k) | `npx skills add omer-metin/skills-for-antigravity` | Pixel-art craft notes; **read it first and ignore anything that generates images**. |

**Skills that must NOT be used here** (they make generative images or do not fit): `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code`, `stitch-design-taste`, the Nano Banana plugin (`banana-claude`) and `json-prompting-for-nano-banana`, `anthropics/skills@canvas-design` (static generated art). `minimalist-ui` and `industrial-brutalist-ui` do not match the game's style.

*A note on third-party skills:* they are instructions the agent will follow. Install only from owners Carlos already trusts or the well-known ones listed above, and read a new skill's `SKILL.md` before relying on it.

## 1. Art direction (Default, Carlos may change it)

- **Keep the pixel-art feel.** The game is pixel art with a CRT mood. New work should look like *"pixel-lit"*: low-resolution rendering scaled up with nearest-neighbor, a **limited palette** drawn from the existing tokens in `elementa.css` and each element's color in `data/elements.js`, hard shadows, a little dithering. 3D is rendered at low resolution (about 64 to 128 px per item) and shown pixelated, so it matches the sprites.
- **Light and mood by realm.** Elementa warm and earthy; the Firmament cold violet and starry; the Empyrean strict and gridded; the Pleroma soft and dissolving; the Meridian swinging; the Unwritten fading to blank paper.
- **Consistency over detail.** One light direction (top left), one outline style, one animation language (snappy in, soft out).

## 2. Swappable assets (important)

Carlos will draw his own art for v1.0. Every new asset is looked up **by id** through one registry (`data/visualRegistry.js`): an id resolves to a `kind` (`code`, `three`, `remotion`, `image`) and a loader. Dropping a PNG, SVG or sprite sheet at a path named for the id must replace the code-made version with **no code changes**. Document the naming rule in `ASSETS.md`.

## 3. The phases

Each phase is one release: "Alpha v0.9.x" patch notes in `data/patchNotes.js` and EXPANSION Part D, a CONTENT or GDD note, the Visual Lab page updated, and a report. A phase is done when Carlos has seen it and said yes.

### V1: Foundations and the Visual Lab (Ready)

Goal: prove the tools and set the rules before any mass work. Nothing user-facing changes except new routes.

1. **Audit first (read-only).** Run `find-animation-opportunities` and `improve-animations` on the current visuals and write `VISUALS_AUDIT.md`: an inventory of every item sprite (relics, consumables, dice, runes, sigils), every background and event screen, every story scene (about 36 in `data/story.js`), the map and every character (keepers, bosses, gods, Pip, the Arbiter), each with its current state and what V2 to V6 should do. This list feeds the later specs.
2. **The registry and the swap rule** (`data/visualRegistry.js`, section 2) plus the first docs in `ASSETS.md`.
3. **Three spikes, each one tiny and lazy-loaded:**
   - **Remotion in the game.** Install `remotion` and `@remotion/player`. Build one 6 second composition (a title card with parallax stars and a bilingual line) and play it in a small `CinematicPlayer` wrapper with skip, replay, Reduced motion (shows the last frame) and language. Report the bundle cost and a simple frame-time number.
   - **Low-resolution 3D items.** With React Three Fiber, render **one relic, one consumable and one die** as 96 px pixelated 3D objects (a parametric gem, a potion, a die) with a rarity glow, an idle turn and a hover tilt; render once into a cached canvas or sprite so the game itself does not run live 3D on every item. Report cost per item.
   - **A layered SVG character.** Rig **one keeper** (Brasa) as layers with an idle breathe, a blink and a talking mouth, from the existing sprite shapes. Report cost.
4. **The Visual Lab**, a standalone page at `/games/elementa/visuals` (like the Jukebox): shows every spike, the registry's assets, toggles for Reduced motion and language, and a frame-rate readout. Linked from Options next to the Jukebox.
5. **Budget and performance gate:** a small script (`tools/visualBudget.mjs`) that prints the bundle sizes and fails if the first-load budget is exceeded.
6. **Report:** what worked, what cost too much, and a recommendation for V2 (which approach for items: live 3D, pre-rendered cache or procedural SVG), with numbers and screenshots.

Do not build anything else in V1: no mass item models, no backgrounds, no scenes.

### V2: Item models (Proposed)

Parametric generators (a gem, a potion, a scroll, a key, a coin, a tome, a shard, a die...) instead of 150 bespoke models; each relic, consumable, rune and die gets a generator plus parameters (shape, color, rarity glow, a signature detail). Idle motion, hover and inspect animations, a rarity-based reveal when bought. Pre-rendered and cached. Old sprites stay as a fallback.

### V3: Event backgrounds (Proposed)

Layered parallax backdrops with ambient animation for every shop type and event (Market, Forge, Black Market, Shrine, Vault, Alchemist, Camp, Observatory, Cartography, Clockwork, Pantry, the Crossroads, boss intros, each realm, the Unwritten), SVG, canvas and CSS only, static under Reduced motion.

### V4: Cinematics (Proposed)

Rebuild every story scene as a Remotion composition played by the `CinematicPlayer`: camera moves, parallax, character poses and expressions, text reveals, hooks for sound. Skip, replay and the Gallery's replay list keep working. English and Spanish stay live text.

### V5: The Map (Proposed)

A new layout and visuals for the Road: clearer realm dividers and portals, node icons by shop type, animated paths, a clear "you are here", zoom and pan, phone friendly. The data model (`engine/map.js`) does not change.

### V6: Characters and small animations (Proposed)

Layered SVG rigs and expressions for keepers, bosses, gods, Pip and the Arbiter: idle breathing, blinking, talking, reactions to events, boss intro animations.

### V7: Polish and performance (Proposed)

A full pass with `review-animations`: consistency, timing, Reduced motion, phone performance, bundle budget, a final screenshot sweep, docs. Optionally a trailer composition (see `STEAM.md`).

## 4. Open questions for Carlos

- Pixel-lit art direction (section 1), yes or a new direction?
- Remotion live in the game for cinematics (V4) and rendered video only for the trailer, yes?
- Which phase matters most to you after V1?
