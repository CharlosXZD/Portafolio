# Audit: Elementa

Audited 2026-11-15 on branch `portfolio` (the game lives in `src/games/elementa`, last commit `f3170f7`, 2026-10-12).

## What was run
- Dev server (`portfolio-dev`), game at `/games/elementa`, sound muted through localStorage first.
- Started a fresh run end to end (title, file select, new run, table, tutorial from Pip).
- Loaded the project's own test saves (`tools/*-test-saves.json`, built by the real game reducer) to reach late states: a 30-dice boss round, a shop, realm 3, the Convergence. These are constructed states, not hand-played runs, so the numbers on screen (for example Base 286.75 x Mult 703.98) show that the engine can reach them, not a typical run.

## Claims on the site vs reality (`elementa` in `src/data/projects.js`)

| Claim | Verdict | Evidence |
|---|---|---|
| Playable alpha "v0.9" | Imprecise | In-game tag reads **v0.9.17 alpha**; 34 patch notes in `data/patchNotes.js` |
| 140+ dice | **Wrong, 89** | `Object.keys(ELEMENTS).length` is 89, and the game's own Gallery shows 0/89 |
| 62 relics | True | `RELICS.length` 62, Gallery 0/62 |
| 53 consumables | True | `CONSUMABLES.length` 53, Gallery 0/53 |
| 72 achievements | True in data | `ACHIEVEMENTS.length` 72 (the Gallery tab shows 22 because 50 are hidden) |
| 15 loadouts, 4 difficulties | True | `DECKS` 15, `DIFFICULTIES` 4 |
| 45 rounds, four realms | True | Realm 3 is rounds 31 to 45, plus the Convergence after round 45 |
| Nine endings | **Out of date, 17** | `ENDINGS.length` 17 (5 per path variant plus the Unwritten). Confirm in the in-game Gallery before publishing a number |
| 0 image or audio files, all art and music made in code | True | No png, jpg, mp3, ogg or wav inside `src/games/elementa` outside `reports/`; `public/elementa` is empty |
| Four elements, adjacency reactions, drag to reorder | True | seen on the table; Gallery lists 54 reactions |
| Bosses every fifth round | True | boss rounds 5, 10, 15 on the run-so-far grid |
| Bilingual EN/ES | True | `lang` switches UI and data (`ACHIEVEMENTS_ES`, `i18n.js`) |

New numbers the Gallery gives us: **32 bosses, 12 keepers (shopkeepers), 54 reactions**, 89 dice, 62 relics, 53 items, 15 loadouts.

## Features worth leading with (not numbers)
- **Neighbors react.** Dice sit in a row, and order changes the score, so it is a spatial puzzle, not just luck.
- **The ledger explains every point.** Base and Mult are itemized live ("Resonance x3 +18 Base"), so a score is never a mystery.
- **The Greater Eye** boss shows the next roll of every die you have not held.
- **Fusion and forging**: pairs and trios of elemental dice become new dice that inherit both parents.
- **Shops with people in them.** Tobb the peddler, the Forge, the Atlas's Cartography: a branching road map between rounds.
- **Story scenes in pixel art** for each boss (the Primordial, Entropy) with skippable dialog.
- **An Arbiter** that can read your browser's time, language and window size to write lines about you, only after an explicit yes/no consent prompt, nothing stored or sent. This is a distinctive, privacy-conscious touch.
- **A tutorial character (Pip)** with a skip button.

## Corrections to make
1. "140+ dice" to "89 dice" (also in the first `bullets` item and `highlights`).
2. "nine endings" to the verified in-game count (17 in the data).
3. "v0.9" to "v0.9.17".
4. Add 32 bosses, 54 reactions and 12 shopkeepers if numbers stay on the card.
5. Sound: the Browser pane's WebGL/audio is fine; no issues found. No console errors from the game.

## Assets captured (`public/projects/elementa/`, 2880x1800 or 3840x2160)
| File | What it shows |
|---|---|
| `title.png` | Title screen with the wooden sign and cabin |
| `shop.png` | Tobb's Market with relics, dice, the road map and inventory |
| `run-recap.png` | "Where you left off": 30 dice, 9 relics, 3 consumables, the map |
| `boss-table.png` | Boss round at 1920x1080: 30 dice, the Primordial rule, live Base x Mult, Greater Eye panel |
| `boss-intro.png` | The Primordial story scene |
| `realm3-table.png` | Realm 3 table with the Arbiter |
| `gallery.png` | Gallery tab with all counters |
| `map-atlas.png` | Atlas's Cartography stop (realm map) |

Not captured yet: the cast animation mid-reveal and a reaction highlight; those need a hand-played moment or a scripted cast.
