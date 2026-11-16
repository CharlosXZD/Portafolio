# Audit: Ohmstead

Audited 2026-11-15 against the `ohmstead` branch, which lives in the sibling worktree `../Portafolio-ohmstead` (HEAD `d7951a9`, 238 commits, first 2026-07-26, last 2026-11-14). The game code is NOT on `portfolio` or `main`; the site currently shows only a "coming soon" card.

## What was run
- `node --test` on all 16 `*.test.mjs` files in `src/games/ohmstead`: 16 pass, 0 fail.
- Dev server on port 5180 (`ohmstead-dev` in `.claude/launch.json`), game at `/games/ohmstead`, Art Lab at `/games/ohmstead/lab`. Both load; no game errors in the console.
- Built a real tutorial line headlessly (drill on copper, powered smelter, belt to the Dock), loaded it as a save, and confirmed it plays: ingots flow, M01 completes (1/39 missions).

## Claims on the site vs reality (`comingSoonProjects` in `src/data/projects.js`)

| Claim | Verdict | Evidence |
|---|---|---|
| 57 research nodes | True | `data/research.json`, tech tree report |
| 39 missions | True | `data/missions.json` |
| 72 recipes | **Wrong, 73** | `data/recipes.json` has 73 entries |
| 20 Hz fixed-step simulation | True | `engine/sim.js` header, 20 ticks per second |
| "deterministic simulation" | True | no `Math.random` in the engine, integer positions, state hash tests |
| "belts, machines, crafting, labs" built and tested | True | `belts`, `machines`, `crafting`, `labs` engines each have tests |
| "art is being drawn in code" | True | 38 machine files in `art/machines`, all procedural |
| PixiJS, JavaScript, Node tests | True | `pixi.js 8.22.0`, tests run on plain Node |

## What is real but not on the site yet
- Power networks (poles, coal burner, satisfaction as a speed multiplier), fluids (pipes, pumps, refinery, generators), the fab chain (crystal furnace to packager, heat, cooling, exact Tester yield), and the Logic Lab **engine** (gate evaluator, six specs). About 13.7k lines of engine, render and art code.
- A machine Art Lab with three zoom detail levels, four rotations, and status states.
- A tech tree reference page: 106 required points, 36 optional, 646 lab minutes, four forks.

## What is not done (do not claim it)
- Logic Lab UI (B16) is not built, so the gate editor cannot be played yet.
- Plastics Plant, SMT Line and Integrator as placeable machines (B17), tanks and underground pipe.
- The campaign end (final product, credits) and tutorial polish are not done.
- Not a playable alpha. The CV removed Ohmstead for this reason and should stay that way.
- Not deployed. Needs the `ohmstead` branch merged into the site before a link can exist.

## Corrections to make
1. Site: change "72 recipes" to 73, or drop the count.
2. Site tagline: add power, fluids and the fab chain to what is "built and tested", and mention the Logic Lab engine.
3. My own notes said "no code yet", which is out of date; updated.
4. The worktree has no `.env.local`, so the Home page throws a Formspree error there. Only matters if the site is run from that worktree.

## Assets captured (`public/projects/ohmstead/`)
| File | What it shows | Use |
|---|---|---|
| `factory-close.png` | Powered drill, smelter, pole cluster and belt of ingots into the Dock, HUD hidden, 3200x2000 | Hero image |
| `factory-wide.png` | Same scene zoomed out, HUD hidden | Wide / full-bleed section |
| `game-ui.png` | Full game with toolbar, missions, inventory, power panel | "It is a real game" proof |
| `art-lab.png` | The Art Lab with state, zoom, rotation controls | Craft / tooling section |
| `tech-tree.png` | Blueprint-style tech tree, 57 nodes | Depth / systems section |

Better assets to get later: a short screen recording of the belt running, a bigger factory (needs a machine chain beyond the tutorial line), and the Art Lab scrolled to the full machine grid.
