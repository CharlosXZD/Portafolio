// Stage directions for the story scenes (VISUALS.md V5). A scene in story.js is
// its words; this file is how it is SHOWN: the backdrop, the effects, the
// camera on each page, the beats where something hits. It is data only (no
// components), so it ships in the cinematic chunk and never in the first load.
//
// A scene that has no entry here gets the standard grammar (cinematic/direction.js):
// an establishing backdrop from the scene's music and colour, a slow push on the
// first page, a drift or a pan on the next, effects from the colour's warmth.
// The hero scenes below get their own backdrop, a set piece and hand-timed beats.
//
// Fields (all optional):
//   backdrop  'night' | 'hall' | 'void' | 'embers' | 'sea' | 'sky' | 'ruins' | 'code'
//   fx        effects, any of 'embers' 'snow' 'stars' 'motes' 'glitch' 'ink' 'rings'
//   piece     a set piece drawn between the backdrop and the character:
//             { kind: 'door' | 'bloom' | 'sigil' | 'orbs' | 'mirror', icon?: element id }
//   pages[i]  { cam: 'push' | 'pull' | 'pan' | 'drift' | 'shake', hits: [frame, ...],
//               flash: [frame, ...], fx: [...], char: { x, y, scale, tone } }
//             `hits` shake the camera and play the hit sound; `flash` is a white
//             flash; frames count from the page's first frame; `tone: 'shadow'`
//             draws the character as a silhouette.

export const DIRECTIONS = {
  // The first meeting with the Primordial, on each path.
  final_neutral: {
    backdrop: 'embers',
    fx: ['embers'],
    piece: { kind: 'orbs' },
    pages: [{ cam: 'push', hits: [90, 150], char: { scale: 1.15 } }],
  },
  final_split: {
    backdrop: 'sky',
    fx: ['snow', 'stars'],
    piece: { kind: 'orbs' },
    pages: [{ cam: 'push', hits: [110], char: { scale: 1.15 } }],
  },
  final_primordial: {
    backdrop: 'embers',
    fx: ['embers', 'rings'],
    piece: { kind: 'orbs' },
    pages: [{ cam: 'push', hits: [120], flash: [150], char: { scale: 1.2 } }],
  },
  loan: {
    backdrop: 'void',
    fx: ['motes', 'rings'],
    piece: { kind: 'bloom' },
    pages: [{ cam: 'push', flash: [40], char: { scale: 1.1 } }],
  },

  // The four god trials: the god's own element behind it as a sigil.
  trial_gaea: {
    backdrop: 'ruins',
    fx: ['motes'],
    piece: { kind: 'sigil', icon: 'earth' },
    pages: [{ cam: 'push', hits: [70], char: { scale: 1.1 } }],
  },
  trial_ognen: {
    backdrop: 'embers',
    fx: ['embers'],
    piece: { kind: 'sigil', icon: 'fire' },
    pages: [{ cam: 'push', hits: [60, 130], char: { scale: 1.1 } }],
  },
  trial_varuna: {
    backdrop: 'sea',
    fx: ['motes'],
    piece: { kind: 'sigil', icon: 'water' },
    pages: [{ cam: 'pan', char: { scale: 1.1 } }],
  },
  trial_zephyr: {
    backdrop: 'sky',
    fx: ['snow'],
    piece: { kind: 'sigil', icon: 'air' },
    pages: [{ cam: 'pan', hits: [80], char: { scale: 1.1 } }],
  },

  // Crossroads, and the door.
  crossroads: {
    backdrop: 'night',
    fx: ['motes', 'stars'],
    pages: [{ cam: 'push' }],
  },
  crossing: {
    backdrop: 'night',
    fx: ['stars'],
    piece: { kind: 'door' },
    pages: [{ cam: 'push', hits: [90] }, { cam: 'push', flash: [60], char: { x: -150, scale: 0.8 } }],
  },

  // The Convergence.
  unwritten: {
    backdrop: 'void',
    fx: ['ink', 'motes'],
    pages: [{ cam: 'drift', hits: [120], char: { tone: 'shadow', scale: 1.1 } }],
  },
  pip_before: {
    backdrop: 'code',
    fx: ['motes'],
    pages: [{ cam: 'push', hits: [70, 130], char: { scale: 1.25 } }],
  },
  pip_after: {
    backdrop: 'night',
    fx: ['motes'],
    pages: [{ cam: 'pull', char: { scale: 1.1 } }, { cam: 'drift', char: { x: -130, scale: 0.9 } }],
  },
  you_before: {
    backdrop: 'void',
    fx: ['glitch'],
    piece: { kind: 'mirror' },
    pages: [{ cam: 'push', hits: [80, 150], char: { scale: 1.15 } }],
  },
  true_ending: {
    backdrop: 'void',
    fx: ['stars', 'motes'],
    piece: { kind: 'bloom' },
    pages: [{ cam: 'pull', flash: [20], char: { scale: 1.1 } }],
  },
}
