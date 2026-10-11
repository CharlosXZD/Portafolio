# V5 report: Cinematics (Alpha 0.9.12)

Built 2026-10-11 on branch `elementa-v0.6.5`. Not pushed.

## What was built
- **Story scenes as compositions.** All 37 `SCENES` play through `components/StorySceneHost.jsx` (a drop-in for `StoryScene`) as one Remotion composition each, in `components/visuals/cinematic/`:
  - `sceneLayout.js` (the timeline: each page = intro, typing, then a wait that loops seamlessly because everything that moves in it has a 60 frame period), `direction.js` (the standard shot grammar), `shots.jsx` (backdrops, effects, set pieces, camera), `characters.jsx` (the swappable character slot), `StoryComposition.jsx`, `CinematicScene.jsx` (player, live caption, controls, key handling).
  - `data/sceneDirections.js` is the data: hero scenes (finals x3, loan, four gods, crossroads, crossing, unwritten, Pip before and after, You, true ending) get their own backdrop, set piece (orbs, sigil, door that opens, bloom, mirror), effects and hand-timed hits and flashes. The other scenes get the standard grammar (backdrop from music and color, push then drift, pan, pull, effects from the color's warmth).
  - Text stays live DOM beside the picture (EN and ES, game fonts, typed at the old rate), with the full page in an sr-only node. Enter shows the whole page then moves on, Esc skips, click advances, plays once per file, replays from the Gallery, scene music unchanged.
- **Fallbacks:** the old `StoryScene` on the low-end tier and if the lazy chunk fails or crashes (`CinematicBoundary`). Reduced motion keeps the composition but paused: each press shows the next page's finished shot with all text.
- **Character slot:** `CharacterArt` in `characters.jsx` is the only place that says what a portrait looks like (today boss avatar, keeper sprite, Pip, die icon, ending art). V7 swaps its body. Pip got a static `PipSprite` (the animated `Pip` wraps it).
- **Intro:** `IntroHost` plays the V1 title card once per session over the menu (sessionStorage), skippable (click, Enter, Space, Esc, button), Options > Display > Intro animation (default on). Never on low tier or Reduced motion.
- **Ending cards:** all 17 endings are a short still with a slow push (`EndingStill`, old card as fallback).
- **Loading:** Remotion is a lazy chunk (CinematicScene about 23.4 kB, 8.1 kB gzip, plus the shared Remotion player chunk), preloaded in idle time once a file is open (not on data saver). Never in the first load.
- **Lab:** `/games/elementa/visuals/scenes` (any scene or ending, EN/ES, Reduced motion, quality auto/low/high, scrubber, play/pause/restart, DOM node count, commit time, a synchronous 150 frame sweep, intro button, and a contact sheet of three frames of every scene).
- **Test saves:** `scene-gallery` (every scene seen: replay each from Gallery > Endings) and `scene-crossing` (plays `crossing` on Continue). All test saves now set `introAnimation: false`.
- Sound hooks on existing sfx only: scene start (gust), a tick on each new page, a clank on each `hits` frame, the existing click on advance.
- Fixed on the way: Esc during a replay closed the whole Gallery (FileHub overlay and Pause gallery now yield to `[data-story-scene]`); `runPreview.where.gameover` string (V4.7).

## Numbers
- First-load JS: 433.64 kB gzip, +20.37 kB vs the V1 baseline (was +10.34 after V4.7). The V6 commit landed between and accounts for most of that; V5's own share in the main chunk is about 1.5 kB gzip (host, ending still, intro host, Pip split, settings).
- Per scene (all 37) DOM nodes and frame time: `reports/v5/scene-metrics.txt`. Nodes 59 to 259 (heaviest: You 259 with the mirror, finals about 230). Render plus commit per frame, dev build: 0.36 to 1.7 ms average, p95 at most 3.9 ms except the three Primordial finals (18 ms p95 at the first frames). The first scene measured shows 16.9 ms from warm-up.
- Screenshots: `reports/v5/` (contact sheets of finals and gods, a live crossing frame). The contact sheet in the Lab shows three frames of all 37 scenes (111 thumbnails).

## Verified
In the real game: crossing plays from `scene-crossing` (2 pages, advance, finish, closes), Gallery replay opens, Esc closes only the scene. Intro plays and Esc skips (sessionStorage set). Lab: EN and ES, Reduced motion (full text at once, advance works), ending card renders, contact sheet renders 111 frames, no console errors from the new code.

## Not verified
- Real-time playback smoothness and sound: the Browser pane throttles rAF and has no audio, so playback was checked frame by frame (sweep, scrubber, contact sheet), not live.
- The low-end tier was verified by code path only (it renders the old `StoryScene`), and the failure fallback was not forced.
- Ending cards inside a real winning run were not played (they share the Lab path).
- `improve-animations` was run as a short self-audit only (no subagents, no plans written): no feel-breaking motion found; the page dip and the push are linear-ish and meant to be judged by eye. Carlos runs `/review-animations`.

## Defaults I chose
Intro once per session via sessionStorage; Reduced motion = paused still shots (not the old StoryScene); `sceneDirections.js` hero data is a first pass for Carlos to direct further; effect and camera values are in `shots.jsx`.

## Open questions
- Should Reduced motion keep the intro off entirely (it does now)?
- Hero direction taste (set pieces, hit timing) is mine; expect notes.
