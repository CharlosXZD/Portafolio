# Visual overhaul, phase V1: report

Built 2026-10-08 on branch `elementa-v0.6.5` as Alpha 0.9.6 "Visual foundations". Small commits, nothing pushed or merged, no worktrees. The real menus, shops, backgrounds and scenes are untouched. The only edits outside the new code are the Options link, one lazy route in `App.jsx`, the patch notes and the docs.

## What was built

| Piece | Where |
|---|---|
| The audit | `VISUALS_AUDIT.md` (regenerate its tables with `tools/genVisualsAudit.mjs`) |
| Registry and the swap-by-id rule | `data/visualRegistry.js`, docs in `ASSETS.md` section 8, `components/visuals/Visual.jsx`, `useVisual.js` |
| Spike 1, Remotion in the game | `components/visuals/cinematic/` (`CinematicPlayer`, `TitleCard`) |
| Spike 2, low-resolution 3D items with a cache | `components/visuals/three/` (`itemAtlas.js`, `Item3D.jsx`, `ticker.js`) |
| Spike 3, a layered SVG character | `components/visuals/rigs/` (`KeeperRig.jsx`, Brasa and Tobb) |
| The lived-in Market (Visual Lab only) | `components/visuals/room/` |
| The Visual Lab | `/games/elementa/visuals`, `components/visuals/VisualsLabPage.jsx`, linked from Options next to the Jukebox |
| Device probe for the low-end fallback | `utils/perfProbe.js` |
| Budget gate | `tools/visualBudget.mjs` plus `tools/visualBudget.baseline.json` |
| Patch notes | Alpha 0.9.6 in `data/patchNotes.js` and Part D of `EXPANSION.md` |

The Lab has: a language switch, a Reduced motion switch, a quality switch (auto, force low, force high), a frame-rate readout, the registry table, the three spikes with their costs, the Market, and a log of the sound-hook names the room emits. The switches change that page only and never the saved game settings (`?lang=es&reduced=1&quality=low` set them from the URL).

## Numbers

**Bundle** (`node src/games/elementa/tools/visualBudget.mjs --build`, gzip level 9):

| | Before V1 | After V1 |
|---|---|---|
| First-load JavaScript | 413.27 kB (Vite reports 428.26 kB) | 414.87 kB, **+1.60 kB** of the 150 kB budget |
| First-load CSS | 14.90 kB | 15.05 kB |

The +1.6 kB is the lazy route, the Options link and the patch notes text. Everything heavy loads on demand, only when the Lab is opened:

| On-demand chunk (gzip) | kB | Note |
|---|---|---|
| `CinematicPlayer` (Remotion and the Player) | 100.03 | loads only when "Load the cinematic" is pressed |
| `three.module` | 177.51 | shared with the portfolio's existing Hero3D chunk, which used to carry it inside `OrbitControls` (that chunk shrank from 229 kB to 52 kB), so three adds nothing new overall |
| `MarketRoom` | 6.45 | the whole room, art included |
| `VisualsLabPage` plus its CSS | 5.75 + 3.14 | |
| `itemAtlas` + `Item3D` + `ticker` | 1.96 + 1.11 + 0.23 | the 3D item path, without three |
| `KeeperRig` | 1.20 | |
| `Visual` (registry component) | 1.67 | |

On-demand JavaScript in total went from 233.4 kB to 353.0 kB, of which Remotion is 100 kB.

**Spike 1, Remotion.** Chunk loads in 19 to 54 ms from the local server. The title card is 180 frames at 30 fps, 960 by 540, about 50 DOM nodes (three star layers are single `box-shadow` lists, so 168 stars cost 3 nodes). React commit time per frame, measured with a `Profiler` around the Player: **4.4 to 4.8 ms average, 7.1 ms worst**, on the dev build. I could not measure a production build (see "Not verified").

**Spike 2, 3D items.** One shared WebGL context for the whole game. Each item is rendered once from 24 angles into a **24 by 24 pixel atlas strip: 54 KB of canvas memory per item**. Build time per item: 48 ms for the first (it includes creating the context), then **18 to 25 ms** (production numbers; the dev build is similar). Copying one frame out of the cache costs about 0.5 microseconds of script time. The shared idle-turn clock costs **3.0 microseconds per frame with 6 items listening**. Nothing runs live 3D per item.

**Spike 3, layered rig.** 3.9 KB of rendered SVG for one keeper (7 layers), 1.2 kB gzip of code, 5 CSS keyframe sets, no JavaScript per frame. At rest it is pixel-identical to today's sprite (screenshot 03).

**The Market.** 8 SVG layers and about 700 DOM nodes in total. 49 running CSS animations while idle (transform and opacity only, mostly 16 dust motes and 14 star twinkles, all stepped to whole art pixels); **0** under Reduced motion, 7 with quality forced low. The animated parts of the back wall sit in their own thin layer so the static wall is not repainted.

**Frame rate: not measured.** The Browser pane throttles `requestAnimationFrame` to 1 or 2 frames a second (and marks the tab hidden at times), so the Lab's frame-rate readout cannot be validated here. It is built and works; please read it in your own browser. The numbers above are script and commit costs, which stay honest under throttling.

## Screenshots (`reports/v1/`)

1. `01-lab-registry-desktop-en.jpg`: Lab header, switches, readout, registry table
2. `02-spike-3d-items-desktop-en.jpg`: gem, flask, d20 beside today's sprites, with the cost table
3. `03-spike-keeper-rig-desktop-en.jpg`: today's Brasa sprite, the Brasa rig, the Tobb rig
4. `04-spike-remotion-last-frame-desktop-en.jpg`: the title card's final frame (after Skip)
5. `05-market-idle-desktop-en.jpg`: the Market at rest
6. `06-market-item-picked-desktop-en.jpg`: an item lifted, Tobb glancing and answering
7. `07-market-after-buy-desktop-en.jpg`: item on the counter, the clean gap left on the shelf, shards spent
8. `08-market-picked-desktop-es-reduced-motion.jpg`: Spanish with Reduced motion (everything still)
9. `09-market-picked-phone-en.jpg`: 375 px wide, no horizontal scroll
10. `10-options-with-visual-lab-link.jpg`: the new link in Options
11. `11-swap-rule-png-replaces-coin-phone.jpg`: a PNG dropped in `public/elementa/visuals/` replaced the code-made coin (a test file, since removed)
12. `12-market-low-quality-fallback-desktop-en.jpg`: quality forced low, the shipping sprites instead of 3D

Not captured: the real game screens (nothing changed there beyond Options, screenshot 10), and the Remotion title card mid-play (the pane renders too slowly to catch a clean frame).

## What worked

- **The cached atlas is the right shape for items.** Clean pixel art falls out of rendering at 96 px, shrinking to 24 px, hard alpha, a 5-level palette and a 1 px ink outline, with a toon ramp for the stepped shading. It looks like pixel art, not like a 3D model.
- **The Market reads as a room, not a panel.** Layering (wall, window sky, light shafts, lanterns, shelf, items, keeper, counter, dust) did most of the work. Items as objects (rock, lift, fly, leave a gap) and Tobb reacting are what make it feel inhabited. It is the right template for V3.
- **The registry swap rule works** end to end (screenshot 11), including in production, since it checks the content type and a missing file falls through to the app's index page.
- **Everything is cheap to ship**: +1.6 kB on first load.

## What cost too much, or bit me

- **Remotion is 100 kB gzip.** Fine lazy, but a Remotion scene should not be added to the table or shop screens. Its per-frame React commit (about 4.5 ms in dev) says V5 scenes must stay light: few DOM nodes, `box-shadow` star fields, no per-frame layout.
- **The first 3D item pays for WebGL setup** (about 30 ms extra, plus a 177 kB gzip three chunk on first use). Build item atlases in idle time, after the shop appears, not on the click.
- **Hidden tabs never build atlases** (the build waits for a frame). That is fine, they build when the tab is shown, but V2 must not block a purchase on it.
- **Bugs I hit and fixed during the work:** the objects filled only half the frame (I had fitted the bounding sphere instead of the widest extent), `flatShading` is not a property of a toon material (now un-indexed geometry gives the facets), Skip showed a black frame until the order became seek then pause, and the low-quality fallback showed nothing because the fallback sprite was not forwarded.

## Recommendation for V2 (items)

**Pre-rendered and cached 3D, with the shipping SVG sprite as the fallback for low-end devices.** Live 3D per item is out (one WebGL context is cheap, one per item is not, and a shelf has 5 to 12 items). Procedural SVG alone cannot give rotating, lit objects. Concretely: about 14 generator families (gem round, rough and faceted, potion, scroll, key, coin, tome, shard, pouch, crown, ring, hourglass, die, tag) with per-item parameters, built lazily when an item first becomes visible, 16 to 24 frames, 24 by 24. At 54 KB and about 20 ms each, all 115 items cost 6 MB of memory and 2.5 seconds if built eagerly, so build on demand and keep dice on the cheap SVG on the table (they are on screen all the time), using the 3D path only for the shop reveal and the inspector. A later option is to bake the atlases to PNG at build time, which would drop three from the runtime entirely.

## Skills

Loaded with the Skill tool before starting: `remotion-best-practices`, `remotion-saas`, `remotion-markup`, `remotion-docs`, `find-animation-opportunities`, `improve-animations`, `animation-vocabulary`, `emil-design-eng`, `impeccable`, `high-end-visual-design`, `design-taste-frontend`, `redesign-existing-projects`, `full-output-enforcement`, `playwright-best-practices`, and `threejs-fundamentals`, `-geometry`, `-materials`, `-lighting`, `-textures`, `-loaders`, `-shaders`, `-postprocessing`, `-animation`, `-interaction`.

How they were used: the Remotion skills for the composition (frame-driven animation, `spring`, `interpolate`, the Player, no CSS animation inside it); the three.js skills for the lathe geometry, toon material and ramp, lighting, the orthographic camera and cleanup; `find-animation-opportunities` and `improve-animations` for the read-only motion audit in `VISUALS_AUDIT.md` section 7; `emil-design-eng` and `animation-vocabulary` for the easing, durations, press and hover rules and the names of the motions; `impeccable`, `high-end-visual-design`, `design-taste-frontend` and `redesign-existing-projects` as design judgment (hierarchy, depth, restraint) rather than as code generators, since the game has its own pixel system; `playwright-best-practices` for the verification approach (I drove the Browser pane, since Playwright itself is not installed). The `threejs-postprocessing` pixelation pass was not used, the pixelation is done in 2D. I did not run `impeccable`'s `context.mjs` setup script.

**`review-animations` was not run.** It is marked as user-invoked only, so the Skill tool refused it and I did not imitate it. Instead I reviewed everything I wrote against Emil Kowalski's rules by hand and fixed what that found: the speech bubble now fades out faster than it enters, the four title-card marks no longer start from scale 0, the 3D tilt only follows a mouse (not a touch drag), the shelf items got a larger touch target, and every hover effect is behind `@media (hover: hover)` or a mouse check. Please run `/review-animations` on `components/visuals/` and `visuals.css` for the real pass.

## Defaults I built (VISUALS.md marks these as questions for you)

1. **Pixel-lit art direction** (section 1b): low-resolution rendering scaled up with nearest-neighbor, the existing palette tokens, hard shadows, top-left light. Built as written.
2. **Remotion live in the game for cinematics, rendered video only for the trailer** (open question 2): built as a live Player.
3. **V3 and V4 first after V1** (open question 3): the Market slice and the registry are shaped for it.

Choices I made that the spec did not fix:

- Tobb is the Market's keeper (he is the Market's keeper in the game); Brasa is the spike rig. The rig is data-driven, so Vesper and the rest are one palette and head each.
- Items are rendered at **24 by 24 native** and shown at ×4 (96 px) in the spike and ×1 inside the 320 by 180 room (×3 on screen), matching the 24 by 24 relic spec in `ASSETS.md`, instead of 96 px native.
- Plain `three` with one shared renderer instead of React Three Fiber, because the result is a cached 2D canvas and R3F would add a reconciler and a canvas per item for no gain.
- The Lab route is lazy and its switches never write to the saved settings.
- The Options link opens in a new tab, like the Jukebox.
- Adding the 0.9.6 entry means the in-game version tag and "What's new" now read 0.9.6, which is the one thing a player will notice.
- The budget baseline is the start-of-V1 build (`4c7ad36`), at gzip level 9.
- `acknowledgeRemotionLicense` is set on the Player so it does not log the license notice. Remotion is free for individuals and small teams and needs a company license above that; please confirm that is fine for you.

## Open questions for you

1. Is **24 frames** per item right, or should it be 16 to save memory? Today the idle turn is 3 seconds, stepped at 8 fps.
2. Should rigs and the old keeper sprites coexist, or should V3 replace `KeeperSprite` everywhere? At rest they match.
3. For a hand-drawn replacement of a **rig**, do you want a still PNG per keeper (what the swap rule gives) or layered files? Layered needs a small extension to the registry.
4. How much dust, flicker and sway is right? I kept it gentle and sparse; the "alive" amount is the thing to judge in the Lab, and it is easy to dial.
5. Do you want the **sound hooks** (`hover`, `pick`, `buy`, `bell`, `broke`, `restock`) wired to real sounds in V4, and which existing sfx fit?

## Not verified

- **Real frame rate** and production-build Remotion commit time (the pane throttles frames and hid the tab). Please check the readout in your browser, desktop and a phone.
- A real phone, and Safari or Firefox. I tested the Browser pane at 375 px (no horizontal scroll, the room scales to the width) and desktop.
- The fractional scale on phones: below 640 px the room scales by a fraction to fit (about ×1), so its pixels are slightly uneven. At 640 px and wider the scale is a whole number.
- The audio side: Remotion's Player adds silent audio elements; the Lab itself plays no sound, and the game was muted for every test.
