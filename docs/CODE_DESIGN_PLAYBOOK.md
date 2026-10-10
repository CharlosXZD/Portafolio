# Code-art design playbook

For any agent working with Carlos on a project that needs **designed, animated, premium visuals made with code**. It collects the rules, the skills (with install commands), the tooling, the workflow and the lessons learned while building the Elementa visual overhaul (2026-10). Copy it into the project, read it first, and follow it.

Written 2026-10-10 by Claude for Carlos. Skill names and install commands are from the open skills registry (`npx skills`); check a skill's `SKILL.md` before relying on it, because third-party skills are instructions the agent will follow.

## 1. Carlos's rules (they apply to every project unless he says otherwise)

1. **Code art only. No generative visual art.** "No AI art" means: do not use image-generation models, tools, plugins or skills, and do not paste in generated images or textures. **Art made with code is welcome and expected:** SVG, canvas, CSS, JavaScript, Three.js / React Three Fiber, WebGL shaders, framer-motion, Remotion compositions, hand-authored pixel bitmaps written as data. His own hand-drawn art may replace the placeholders later, so every asset must be **swappable by id with no code change** (see section 5).
2. **No em dashes** (the character "—") in any text written for him: copy, UI strings, code comments that surface as text, chat replies. Use a period, a comma, a colon or parentheses.
3. **English and Spanish** for every user-facing string, unless the project says otherwise.
4. **Mute before testing.** When you run a dev server and drive it in a browser, turn the app's sound and music off first (set the project's volume and mute keys in localStorage), because Carlos plays in another tab and hears double music otherwise.
5. **Work in the main checkout only.** No git worktrees, sibling folders or copies of the project unless he asks. Commit in **small commits with explicit paths** (`git add <paths>`, never `git add -A` or `git commit -a`). **Never push or merge**: Carlos pushes. Never revert, stash or reformat files you did not change (other agents may be working in the same folder).
6. **Respect Reduced motion and the Instant setting** in every animation (a static or instant version). Keep a **low-end fallback** (fewer layers, no particles, a still frame) and test phones.
7. **Match what already exists.** Before changing a screen, read the project's design rules and look at the existing screens. New pieces next to old ones must look like the same product. Carlos prefers the existing look to a drift (typefaces, logos, taglines, element colors, palettes). Never retype copy that lives in a strings file: read it from there.
8. **Report faithfully.** If something did not work, a test failed or you skipped a step, say so with the evidence. Say what you did **not** verify (real frame rate on a phone, other browsers, the audio, a real drag).

## 2. Skills to load before designing or animating

Load skills with the Skill tool **before** each phase, and name them in your report. Installed means "already in `~/.claude/skills` on Carlos's machine"; install the others with the command shown (Carlos approves installs).

| Skill | Install | Use it for |
|---|---|---|
| `remotion-best-practices` (router), `remotion-create`, `remotion-docs`, `remotion-markup`, `remotion-interactivity`, `remotion-render`, `remotion-studio`, `remotion-multimedia`, `remotion-captions`, `remotion-maps`, `remotion-saas`, `remotion-upgrade` | `npx skills add remotion-dev/skills` (installed 2026-10-08) | Video and cinematics made from React code: sequences, springs, interpolation, the live `Player`, rendering to a file. Start with the router. |
| `threejs-fundamentals`, `-geometry`, `-materials`, `-lighting`, `-textures`, `-loaders`, `-shaders`, `-postprocessing`, `-animation`, `-interaction` | `npx skills add cloudai-x/threejs-skills` (installed) | 3D objects, lit scenes, shaders, post-processing, GLTF, picking. |
| `playwright-best-practices` | `npx skills add currents-dev/playwright-best-practices-skill` (installed) | Reliable browser tests, screenshots, visual and mobile checks. |
| `animation-vocabulary` | installed (`emilkowalski/skills`) | Naming a motion exactly before building it ("pop in", "rubber-banding"). |
| `find-animation-opportunities` | installed | A read-only scan for places that should animate (and rejection of those that should not). Run at the start of a phase. |
| `improve-animations` | installed | A prioritized motion audit with plans another agent can execute. |
| `review-animations` | installed, **user-invoked only** (`disable-model-invocation`) | A strict review of animation code. The agent cannot run it: ask Carlos to run `/review-animations` and say where. Do a manual review against Emil Kowalski's rules meanwhile and say so. |
| `emil-design-eng` | installed | Design engineering craft: easing, timing, springs, polish, micro-interactions. |
| `impeccable` | installed | Overall UI quality: hierarchy, spacing, states, polish. (`pbakaus/impeccable@overdrive`, 63k installs, exists for a one-off dramatic effect; ask first.) |
| `high-end-visual-design`, `design-taste-frontend`, `redesign-existing-projects` | installed (`leonxlnx/taste-skill`) | Judgment on depth, hierarchy and "premium" feel; upgrading an existing UI without breaking it. |
| `apple-design` | installed | Fluid, physical motion, springs, gestures, materials and depth for the web. |
| `full-output-enforcement` | installed | Complete files, no placeholders, no "rest unchanged". |
| `find-skills` | installed | Finding another skill when a task needs one. |
| `pick-ui-library` | installed | Choosing a UI library when a project needs one. |
| `skill-creator` (anthropic-skills) | built in | Writing a new skill for a repeated workflow. |
| *Optional:* `hyperframes-animation`, `hyperframes-creative` (`heygen-com/hyperframes`, 723k and 683k installs) | `npx skills add heygen-com/hyperframes` | An HTML-to-video alternative to Remotion with animation guidance; read for ideas, do not mix frameworks without asking. |
| *Optional:* `pixel-art-sprites` (`omer-metin/skills-for-antigravity`) | `npx skills add omer-metin/skills-for-antigravity` | Pixel-art craft notes. Ignore anything in it that generates images. |

**Do not use** (they produce generative images, or do not fit): `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code`, `stitch-design-taste`, `brandkit`, `json-prompting-for-nano-banana` and the Nano Banana plugin (`banana-claude`), `anthropics/skills@canvas-design`, `gpt-taste`'s image features. `minimalist-ui` and `industrial-brutalist-ui` only if the project's style calls for them.

Skill commands: `npx skills find <query>` searches the registry; `npx skills add <owner/repo> -g -a claude-code -s '*' -y` installs non-interactively (global); `npx skills add <owner/repo> -l` lists a repo's skills first.

## 3. Libraries and tools that worked

- **React + Vite + Tailwind**, `framer-motion` for UI motion.
- **Remotion** (`remotion`, `@remotion/player`): live cinematics with the Player (about 100 kB gzip, load it lazily; keep scenes light: few DOM nodes, `box-shadow` star fields, no per-frame layout). Rendered video (`remotion-render`) is for trailers, not for in-game scenes.
- **Three.js** (plain `three`, one shared renderer): render small 3D objects once into a cached canvas or sprite strip instead of running live 3D per item. A shelf has many items; one WebGL context is cheap, one per item is not. R3F is fine for a real scene, not for dozens of icons.
- **Procedural pixel art:** palette-indexed bitmaps in a data file rendered as crisp SVG or canvas at integer scales (a `PixelIcon`-style component). Better than 3D for small icons (see lessons).
- **Layered SVG characters:** separate layers (body, head, arms, eyes, mouth) with stepped CSS keyframes for idle, blink, talk and reactions.
- **CSS for ambient life:** transform and opacity only; stepped (`steps()`) to whole art pixels for a pixel look; animated layers separate from static ones; one shared timer, not a timer per object.
- **Browser pane / Playwright** for screenshots and interaction checks; `read_page` and DOM measurements beat eyeballing.
- **Budget scripts:** a small node script that prints bundle sizes (gzip) and fails past a budget (Elementa: `tools/visualBudget.mjs`).
- **Mods for Claude Code** (this machine): `~/.claude/mission-control-mods/` holds three mods (`session-link`, `model-router`, `mission-dashboard`) for talking between sessions, routing side work to cheaper models and a `/dash` status pane. See its README.

## 4. The workflow that worked (phases, specs, reports)

1. **One planning session, one or more building sessions.** The planner writes specs and reviews; builders build. Specs live in Markdown files in the repo (Elementa: `VISUALS.md`).
2. **Phases of one release each, "little by little":** a foundations phase first (audit, registry, spikes, a **feel test** of one real piece, a lab page, a budget gate), then one family of work per phase (items, rooms, interfaces, cinematics, map, characters, polish). A phase ends with a playable app, patch notes, a report and Carlos's review. **The next phase is specced in full only after the previous one is reviewed.**
3. **Every spec has:** the goal, the rules that must hold, exact numbers (sizes, frame counts, budgets), what **not** to build, how to verify, and what to report. Decisions Claude had to guess are marked **Default**; the builder builds the default and lists each one in its report as a question for Carlos.
4. **A Visual Lab page** (`/…/visuals`): shows every new asset on a test page with switches for language, Reduced motion and quality, a frame-rate readout, the registry table and the budget. It is how Carlos reviews work without playing to the right screen.
5. **An audit first** (read-only): inventory every visual, what it does now, what the phases should do. Regenerate its tables with a script.
6. **Test saves and tools** that put the real app in every state you built (every shop, every screen), so verification is real and repeatable.
7. **Reports** (`VISUALS_Vx_REPORT.md`): what was built, **numbers** (bundle gzip before and after, chunk sizes, DOM nodes, running animations, build times), how it was verified, what was **not** verified, screenshots (with paths), skills used, defaults chosen, open questions. Builders also message the planner when done.
8. **Before and after screenshots** for every redesigned screen; check desktop and phone, both languages, Reduced motion.
9. **Parallel agents in one folder are risky.** Give each a separate area, explicit-path commits, "re-read a shared file right before editing it", and small targeted edits to shared files (patch notes, docs, strings). Prefer sequential work when the areas overlap.
10. **Resume cheaply.** If a builder nears its usage limit it commits a working state and writes one line on what remains. A resumed builder re-reads the spec and its own notes, commits what works, then finishes.

## 5. Design principles that Carlos asked for (reusable)

- **Crisp, premium, alive.** Pixel art can feel premium: whole-pixel positions, limited palette, 1 px colored outlines (never pure black), 3 to 4 flat tones, one upper-left highlight, hard shadows, consistent light.
- **The interface is the scene.** Panels laid on top of a background read as "squares". Build controls as **objects of the world** made of its materials (counters, shelves, plaques, levers, pouches, signboards, parchment, slate), with the same functions, hotkeys and accessibility as before. Keep at least half the picture as environment.
- **Lived-in rooms.** Layered depth, props that say who lives there, light sources, ambient motion (dust, sparks, steam), a character who idles and **reacts** to what the player does (picks, buys, can't afford, sells, leaves).
- **Objects behave like objects:** rock on hover, lift when picked, leave a gap when bought, cast shadows.
- **Legibility first:** at least as readable as before; no text shadows on names; the project's own fonts and logo style; contrast checked per screen.
- **Alive but calm:** gentle idle loops (3 to 8 s), never noisy; always off with Reduced motion.
- **Swappable assets by id.** A registry maps an asset id to a kind (`code`, `three`, `remotion`, `image`) and a loader; dropping a PNG or SVG at the path named for the id replaces the code-made version. Document the naming rule.
- **Sound hooks, then wiring.** Emit named events (`hover`, `pick`, `buy`, `broke`, `sell`, `restock`, `bell`, `welcome`, `leave`) first; wire them to the app's existing sounds later at today's loudness, respecting volume and mute, and remove any old direct sound call so nothing plays twice.
- **Performance budget:** heavy modules lazy-load; the first screen grows by a stated amount at most (Elementa: 150 kB gzip across the whole overhaul, 15 kB per phase); build caches in idle time and never block an action on them; probe the device (`hardwareConcurrency`, `deviceMemory`, a frame probe) and fall back to static art.

## 6. Lessons learned (do not repeat these)

- **3D at 24 pixels loses the silhouette.** Small item icons rendered from 3D looked wonky and unreadable. **Hand-authored pixel bitmaps (32 by 32, one strong silhouette, 3 to 4 tones, one signature detail, simple beats detailed)** read far better. Test every icon as a **flat black silhouette** and with an unlabeled "name it" sheet. Keep 3D for rare, special objects, rendered once and cached.
- **Rotating tiny pixel figures blurs.** A few degrees of rotation on a 14 px figure only smears pixels. Move parts by **whole pixels on a stepped path**.
- **A new piece that ignores the existing look gets rejected.** A cinematic with a different typeface, a retyped tagline and plain colored boxes instead of the product's real icons was sent back. Read the design rules and reuse the real components.
- **Panels over a nice background still look like an overlay.** Fixing the background is not enough; restructure the interface into the scene.
- **Layout checks need real viewports.** Check 1280 by 720 and 1440 by 900 and a phone width; things fall below the fold. The game root may clip `position: sticky`.
- **Hidden tabs and the pane throttle `requestAnimationFrame`.** Frame-rate numbers from an automated pane are not trustworthy: say so and ask Carlos to read the readout in his browser.
- **Fonts lack glyphs.** Pixel fonts miss accented capitals (É), and a body font missed ó ú ñ ü. Audit glyphs; add a pixel-compatible fallback or avoid the glyph.
- **Never auto-commit with `git add -A` in a shared folder.** One agent's final broad add swept another's files into its commit.
- **Check dates before assuming.** Look at commit dates and the real log before telling someone a phase has not run.
- **Third-party licences:** Remotion is free for individuals and small teams and needs a company licence above that. Check before shipping commercially.

## 7. A starter prompt for a new project

Paste this, adapt the first lines:

```
You are the builder for <project>. Read docs/CODE_DESIGN_PLAYBOOK.md completely, then <PROJECT_VISUALS.md>. Follow Carlos's rules (code art only, no em dashes, English and Spanish, mute before testing, small explicit-path commits, never push or merge, respect Reduced motion and the low-end tier). Load the skills in section 2 relevant to the phase and name them in your report. Build only the phase I name; do not start the next. Verify with screenshots and numbers, report what you did not verify, list every default you chose and your open questions.
```

## 8. Files in the Elementa repo that show these ideas in practice

`src/games/elementa/VISUALS.md` (the phased plan and its rules), `VISUALS_AUDIT.md`, `VISUALS_V1..V4_REPORT.md` (the reports), `ASSETS.md` (swap rule and the item sprite style bible), `tools/visualBudget.mjs` (budget gate), `components/visuals/` (rooms, rigs, sprites, scenes, Lab pages), `data/visualRegistry.js` (swap-by-id registry).
