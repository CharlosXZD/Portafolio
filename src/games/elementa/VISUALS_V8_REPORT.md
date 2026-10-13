# V8 report: Polish, Legacy visuals, fallbacks (Alpha 0.9.15 and 0.9.16)

Built 2026-10-12 on `elementa-v0.6.5`. Not pushed. Commits: `ddb552a` (V8.0 to V8.3), `4d0b56d` (V8.4, V8.5 part), `4bfd38f` (docs, lint), and the final one with this report.

## What was done

**V8.0 Legacy visuals.** Options > Display > Visual style: New / Legacy (`elementa-visual-style`, new by default, in backups by the `elementa-` prefix, read through `useGameSettings().visualStyle`; the switch is in the Display tab of the new Options and in the legacy Options, so you can always go back).
- Because the engine, data and saves have not changed since `4c7ad36` (checked with `git diff`: only additive color and descriptor lines), the old UI is fully compatible with every current rule. `tools/buildLegacy.py` recovered the 35 pre-overhaul components that changed since then, plus every component that depends on them (so no new file leaks into the old tree), into `components/legacy/`, rewriting imports; `legacy/LegacyGame.jsx` is the old `ElementaGame` (it exports `LegacyGameInner`).
- `ElementaGame.jsx` now picks the tree: `StyleSwitch` renders the new game or the lazy legacy chunk (about 57 kB gzip, loaded only when Legacy is chosen). Switching remounts on the main menu (a run is autosaved and can be continued in either style).
- Legacy gets: the old `PixelBackdrop` scenes, the original shop panels and keeper sprites, original item icons, old menus, old Road, typed `StoryScene` with no intro, old boss avatars and Pip, the old fonts (scoped CSS under `.elementa-root[data-visual-style='legacy']`). Stardust, the four-slot Forge, the Arbiter, the Rush and the Convergence are all reachable exactly as they were (same components).

**V8.1 Aether Bazaar and Astral Exchange.** The cause was a layout bug, not art: when a shop has boards (the Forge), the shop opens a 350 px column; the Conclave's six keepers (262 px) took it, and the greeting sign got a 60 px by 549 px sliver. Fix: `.stage__row[data-conclave]` puts the keepers on one row and the sign under them at full width (338 px at 1280, 331 px at 375, checked in the real game). Art: bigger stalls with striped awnings, a chandelier and larger wares in the Bazaar, larger wares in the Astral Exchange. Before (800 px) and after (1280 and 375 px, the Astral Exchange) are in `reports/v8/`. Not changed and unsure: the Firmament dome starfield and the orbit of wares (they looked fine), the Conclave sign's wording, whether Carlos wants the keepers larger.

**V8.2** The Gallery's boss pages show `CharacterRig` and the keeper pages `KeeperRig` (the Arbiter his rig); unseen tiles stay silhouettes and "???" (checked: unseen bosses read "???", a seen boss page shows one live rig). Swap by id: a file `rig.<id>` in `public/elementa/visuals/` replaces any V7 rig (png, webp or svg), documented in `ASSETS.md`.

**V8.3 Fallbacks.** New `LazyBoundary`, `LoadFailed`, `RoadList` and `utils/forceFail.js`. Every lazy part now has a working plain version: item sprite to icon, keeper rig to flat sprite, room to the old backdrop (already), cinematics to the typed scene (already), the map to a list of the stops you can pick (choosing still works), Gallery and Inscribe to a note with Back. The Lab has a **Fallbacks** page (`/games/elementa/visuals/fallbacks`) with switches for each failure, the low-end tier (`?quality=low` or the page), Reduced motion, Instant, Legacy, and a button that writes a minimal pre-overhaul save, plus live probes. No WebGL: the game does not use it since V2.5 (only the Lab's item model pages do), so there is nothing to force.

**V8.4 Items.** Redrawn: Safety Net (a rope net in a gold hoop, it was a clover like Lucky Charm), Heat (a thermometer, the bellows did not read), the sand Hourglass (round bulbs, no frame, distinct from the Patient Hourglass). Constellations: the chart's sky is tinted by its stars and the poker sets have their own colors; Rune of Anchor is steel. `tools/spriteDuplicates.mjs`: close pairs inside a family went from 7 to 0, across families stays 0. Riverstone, Bedrock, Whetstone, Keystone, Upgrade Stone, Release, Mirror Shard, Epsilon, Time Capsule and Loom of Fate looked readable on the sheet and were left alone (Carlos to judge). The parked second item art style was not touched.

**V8.5 The checklist.**
- Smoke tool (`/games/elementa/visuals/smoke`): walks 12 test saves in hidden iframes, 132 runs: both styles at 375, 768 and 1024 px, Reduced motion in both styles, and on the new style the low-end tier, Instant and every lazy part failing at once. Results: all 132 runs complete the four steps (Play, Open, Continue, Continue); no crash screen; no horizontal scroll at any width; no console error except the forced ones; zero running animations under Reduced motion in both styles; zero unlabeled buttons or links.
- DOM nodes: a die is now one `<img>` (cached data URI) instead of about 100 `<rect>`s. Heaviest scene (a 30-die Astral Exchange with the Forge open): 14,400 to 6,200 nodes in the new style (16,200 to 7,200 in Legacy, which shares the die); typical shops 1,900 to 2,600 (Forge 2,948 to 1,909, Market 2,189 to 2,005). The game's first-load JS is 439.35 kB gzip, +26.08 kB over the V1 baseline, inside the 150 kB budget (part of that is the Build agent's 0.9.17 data).
- Phones: small buttons are 40 px on touch screens and under 640 px wide; the map button too.
- Engine tests (shared by both styles): `arbiterTest`, `convergenceTest`, `realm3Test`, `mapTest` all ok; `contentCheck` ok; `oxlint`: no errors (a hooks error in `ShopScreen` was fixed).
- Docs: `ASSETS.md` (rigs by id), `VISUALS.md`, GDD section 49, CONTENT section 13, Part D, patch notes 0.9.15 and 0.9.16 (EN and ES).

## Numbers
First load +26.08 kB gzip (budget 150). Legacy chunk 215 kB raw, 57 kB gzip, on demand. New lazy parts: Fallbacks, Smoke, Characters, Scenes pages 2.6 to 3.9 kB gzip each.

## Skills used
`improve-animations` and `find-animation-opportunities` (V7, short self-audits, no plans written), `remotion-docs` (V5). Carlos runs `/review-animations`.

## Not verified, or skipped
- Slow connection: only through the chunk-failure fallbacks and the Suspense fallbacks, not a throttled network.
- The low-end tier still runs the shop's remaining CSS loops (24 running animations in the Bazaar: tags, dice effects); only the room's loops stop. Reduced motion is the zero-animation mode.
- The rough contrast check flagged 1 text per screen in the iframe harness that did not reproduce in the real page; the Lab has no contrast tool, so contrast was not measured screen by screen.
- Section 0b consistency was checked on the screens I opened (screenshots in `reports/v8/`), not on every screen of both styles; the final screenshot sweep and before/after are a selection (Bazaar, Astral, fallbacks, legacy menu, table and shop), not all 40 screens.
- An old save was only covered by `convergenceTest` and the Fallbacks page's minimal save button (not opened in both styles).
- The trailer composition (optional) was not made.

## Defaults and open questions
- Switching the style returns to the main menu. Should it instead keep the current screen (it would need the run state shared between the two trees)?
- Legacy keeps the pre-overhaul look exactly, so the Conclave stage fix lives only in the new style (the old stage had no such bug).
- The Smoke page is a dev tool, not linked from the Lab; say if it should be.
