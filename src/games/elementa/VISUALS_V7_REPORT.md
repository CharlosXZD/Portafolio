# V7 report: Characters and small animations (Alpha 0.9.14)

Built 2026-10-11 on `elementa-v0.6.5`. Not pushed.

## What was built
- `components/visuals/rigs/charData.js`: new 16x16 pixel sprites for the four gods (Gaea, Ognen, Varuna, Zephyr), the Primordial and You, plus Pip (the shipping 14x14 rows). Palettes come from the boss colors (`BOSS_COLORS`), so a god matches its Gallery and stage color.
- `charPose.js`: a pure `poseAt(def, {t, react, reactAt, talking, still})`: idle (breathe 1 px every 600 ms, or a 4 step float), blink every 3.4 s (out of phase per character), talking mouth, the Primordial's aspect swap every 2.4 s, Pip's sparkle, and 11 reactions: bosses `enter taunt hit defeat`, Pip `tip cheer worry curious`, the Arbiter `warn smite favor`. All whole art pixels in 120 ms steps.
- `CharacterRig.jsx`: one component, three bodies (sprite, the Arbiter's hand, any boss avatar). Time from a frame (`t`, cinematics) or one shared 8 fps clock that runs only while a live rig is mounted. `reactKey` replays a reaction. Reduced motion and the low tier draw one pose. Rows are cached per blink and mouth state.
- Wired in: V5 `CharacterArt` (bosses, gods, Primordial, You, Pip, the Arbiter; a direction `hit` makes the character flinch, typing makes it talk), the boss on the table (`enter`), the boss reward (`defeat`, slumped), `Pip` everywhere (Tutorial now wraps the rig; a `tip` on every tutorial step and Pip's table lines), the Arbiter's speech bubble (`warn` on a cold line, `favor` on a warm one). `ArbiterHand` moved to its own file to avoid an import cycle.
- Small animation pass (via `find-animation-opportunities`, restraint first): one change that passed the gate, a lost life (the empty heart jumps, shakes and settles, 420 ms, 4 steps, skipped under Reduced motion; occasional frequency, purpose: feedback). Shards already tick, toasts and cast ledger are already choreographed (left alone). Rejected: dice and cast buttons (hit hundreds of times a run), keyboard actions, boss banner (already has an entrance).
- Lab: `/games/elementa/visuals/characters`: every rig, every reaction button, talking, silhouette check, old sprite beside the rig at rest, node count, sprite row-length check (no problems).

## Numbers
- First-load JS 428.99 kB gzip, +15.72 kB vs the V1 baseline (V5 was +20.37 at its commit; a later V6 tidy changed the main chunk, so compare with care). The rig, data and pose code are in the main chunk because Pip and the boss avatar are on the table (about 3 kB gzip).
- Nodes: a 16x16 sprite is about 60 to 110 SVG rects; the whole Lab page with 31 rigs is 3367 nodes. Each live rig re-renders at 8 fps (cached rows, small SVG).
- Animations per rig: 0 CSS animations; JS steps only (the heart is one CSS keyframe).
- Screenshots: `reports/v7/`.

## Verified
Lab page renders all 31 rigs with no errors; the `cheer` reaction steps in whole art pixels (9.14 px steps at 128 px) and returns to rest; `defeat` ends slumped at 0.45 opacity; the boss rig mounts on the table from the `boss` test save; the cinematics show the rigs (Pip and the finals checked).

## Not verified
- The lost heart animation was not triggered in a real round (no test save that loses a life on demand); `Hearts` builds and renders.
- Live 8 fps playback and the loop seam (the cinematic loops every 2 s of page time, the rig idle cycles are not multiples of it: a one-pixel bob phase change once per 20 s).
- Gallery boss and keeper pages still use the static sprites (not wired).
- Hand-drawn swap by id for the rigs is not wired (the sprites are code; `findImageOverride` is not consulted).
- The sprites are placeholders by design: they read as the right element and creature, but Carlos should judge the faces.

## Open questions
- Should the Gallery pages use the rigs (idle only)?
- Do you want the Arbiter to gesture on every line, or only on warnings and favors (now)?
