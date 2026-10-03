// Music themes (GDD §28): every screen, shop and boss has its own generated
// loop, no audio files. utils/sound.js plays them with a small step
// sequencer and crossfades when the theme changes.
//
// Patterns are strings of space-separated steps (16 steps per bar):
//   a number   scale degree (0 = root; 7 on a 7-note scale is the octave;
//              negatives go below the root)
//   -          hold the previous note
//   .          rest
// Percussion steps use letters instead:
//   k kick, s snare, h hat, t tick, a anvil, b bell, p bubble, z snore
//
// `root` is a MIDI note for the bass register; the lead plays two octaves
// up (plus `leadOctave`), pads one octave up.

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  pentMinor: [0, 3, 5, 7, 10],
  pentMajor: [0, 2, 4, 7, 9],
  wholeTone: [0, 2, 4, 6, 8, 10],
}

export const MUSIC_THEMES = {
  // --- Screens ---
  menu: {
    root: 43,
    scale: 'pentMinor',
    step: 0.15,
    lead: '5 . 7 . 6 . 5 . 3 - - . 2 . 3 . 5 . 7 . 8 - - . 7 . 6 . 5 - - -',
    bass: '0 - - - - - - - 0 - - - - - - - -2 - - - - - - - -1 - - - - - - -',
    voices: { lead: 'triangle', bass: 'triangle' },
  },
  table: {
    root: 43,
    scale: 'minor',
    step: 0.1125,
    lead:
      '0 - - - 2 - - - 4 - - - 2 - - - 2 - - - 4 - - - 2 - - - 0 - - - ' +
      '4 - - - 2 - - - 0 - - - 2 - - - 2 - - - 0 - - - 2 - - - 4 - - -',
    bass: '0 - - - - - - - - - - - - - - - 0 - - - - - - - - - - - - - - - 2 - - - - - - - - - - - - - - - 1 - - - - - - - - - - - - - - -',
    perc: '. . . . . . . . h . . . . . . .',
    voices: { lead: 'sine', bass: 'triangle' },
  },
  gameover: {
    root: 45,
    scale: 'minor',
    step: 0.25,
    lead: '4 - - - 3 - - - 2 - - - 1 - - - 0 - - - - - - - - - - - . . . .',
    bass: '0 - - - - - - - - - - - - - - - -2 - - - - - - - - - - - - - - -',
    voices: { lead: 'sine', bass: 'triangle' },
  },
  victory: {
    root: 48,
    scale: 'major',
    step: 0.12,
    lead: '0 . 2 . 4 . 7 - - - 4 . 7 - - - 9 - 8 - 7 - 9 - 11 - - - - - - -',
    bass: '0 . . . 4 . . . 0 . . . 4 . . . 5 . . . 4 . . . 0 - - - - - - -',
    pad: [
      [0, 2, 4],
      [3, 5, 7],
    ],
    perc: 'k . h . s . h . k . h . s . h h',
    voices: { lead: 'square', bass: 'triangle', pad: 'sine' },
  },

  // --- Shops ---
  shop_market: {
    root: 48,
    scale: 'major',
    step: 0.13,
    lead:
      '4 . 2 . 4 . 5 . 7 . . . 5 . 4 . 2 . 0 . 2 . 4 . 2 - - - . . . . ' +
      '4 . 2 . 4 . 5 . 7 . 9 . 7 . 5 . 4 . 2 . 1 . 2 . 0 - - - . . . .',
    bass:
      '0 . . . 4 . . . 3 . . . 4 . . . 0 . . . 4 . . . 4 . . . 1 . . . ' +
      '0 . . . 4 . . . 3 . . . 4 . . . 4 . . . 1 . . . 0 . . . 0 . . .',
    perc: 'k . h . s . h . k . h . s . h h',
    voices: { lead: 'square', bass: 'triangle' },
  },
  shop_alchemist: {
    root: 50,
    scale: 'wholeTone',
    step: 0.12,
    lead: '0 3 5 . 4 . 2 . 6 . 5 3 . 1 . . 2 4 6 . 8 . 6 . 5 3 2 . 0 . . .',
    bass: '0 - - - . . 0 . 3 - - - . . 3 . 0 - - - . . 0 . 2 - - - . . 2 .',
    perc: '. . p . . . . p . p . . . . . .',
    voices: { lead: 'sine', bass: 'triangle' },
  },
  shop_vault: {
    root: 45,
    scale: 'harmonicMinor',
    step: 0.2,
    lead:
      '4 - - - - - - - 2 - - - 3 - - - 0 - - - - - - - . . . . . . . . ' +
      '5 - - - 4 - - - 3 - - - 2 - - - 4 - - - - - - - - - - - . . . .',
    bass: '0 - - - - - - - - - - - - - - - -2 - - - - - - - - - - - - - - - -4 - - - - - - - - - - - - - - - -3 - - - - - - - - - - - - - - -',
    pad: [
      [0, 2, 4],
      [5, 7, 9],
      [3, 5, 7],
      [4, 6, 8],
    ],
    perc: 'b . . . . . . . . . . . . . . .',
    voices: { lead: 'triangle', bass: 'sine', pad: 'triangle' },
  },
  shop_forge: {
    root: 40,
    scale: 'phrygian',
    step: 0.11,
    lead: '. . . . 4 . 5 . 4 . 3 . 1 - - . . . . . 4 . 5 . 7 . 5 . 4 - - .',
    bass: '0 0 . 0 . 0 1 . 0 0 . 0 . 0 -1 .',
    perc: 'k . a . k . a . k k a . k . a a',
    voices: { lead: 'square', bass: 'sawtooth' },
  },
  shop_blackmarket: {
    root: 50,
    scale: 'dorian',
    step: 0.15,
    swing: 0.3,
    lead: '. . 4 . . 6 - . . . 5 . 4 . . . . . 2 . . 3 - . 4 - - - . . . .',
    bass: '0 . . . 2 . . . 4 . . . 5 . . . 6 . . . 5 . . . 4 . . . 2 . . .',
    perc: '. . h . . . h . . . h . s . h .',
    voices: { lead: 'triangle', bass: 'triangle' },
  },
  shop_shrine: {
    root: 53,
    scale: 'pentMajor',
    step: 0.22,
    lead: '7 - - - - - 8 - 9 - - - - - - - 8 - - - 7 - - - 5 - - - - - - -',
    bass: '0 - - - - - - - - - - - - - - - 3 - - - - - - - - - - - - - - -',
    pad: [
      [0, 2, 3],
      [3, 5, 7],
    ],
    perc: 'b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
    voices: { lead: 'sine', bass: 'sine', pad: 'sine' },
  },
  shop_bazaar: {
    root: 48,
    scale: 'lydian',
    step: 0.12,
    lead: '0 2 4 6 7 6 4 2 0 2 4 6 9 7 6 4 1 3 5 7 8 7 5 3 7 - - - 11 - - -',
    bass: '0 - - - - - - - 0 - - - - - - - 1 - - - - - - - 1 - - - 4 - - -',
    pad: [
      [0, 2, 4],
      [1, 3, 5],
    ],
    perc: 'k . h . s . h . k . h k s . h h',
    voices: { lead: 'square', bass: 'triangle', pad: 'sine' },
  },

  // --- Bosses ---
  boss_calm_winds: {
    root: 50,
    scale: 'lydian',
    step: 0.2,
    lead: '0 - - 2 - - 4 - - - - - 3 - - - 2 - - 0 - - -1 - - - - - . . . .',
    bass: '0 - - - - - - - - - - - - - - - -3 - - - - - - - - - - - - - - -',
    perc: '. . . . . . . . h . . . . . . .',
    voices: { lead: 'sine', bass: 'sine' },
  },
  boss_grounded: {
    root: 40,
    scale: 'minor',
    step: 0.16,
    lead: '. . . . . . . . 4 - - - 3 - - - . . . . . . . . 2 - - - 1 - - -',
    bass: '0 - . 0 - . 0 . 1 - . 0 - . -1 .',
    perc: 'k . . . s . . . k . k . s . . .',
    voices: { lead: 'triangle', bass: 'square' },
  },
  boss_iron_grip: {
    root: 48,
    scale: 'harmonicMinor',
    step: 0.13,
    lead: '0 - - - 2 - 3 - 4 - - - 3 - 2 - 0 - - - -1 - - - 0 - - - - - - -',
    bass: '0 . 0 . 0 . 0 . 4 . 4 . 4 . 4 .',
    perc: 'k . s s k . s . k . s s k s s s',
    voices: { lead: 'square', bass: 'triangle' },
  },
  boss_drought: {
    root: 50,
    scale: 'phrygian',
    step: 0.15,
    lead: '0 1 . 4 - - 3 1 0 - - - . . . . . . 3 4 5 - 4 3 1 - - 0 - - - -',
    bass: '0 - - - - - - - - - - - - - - -',
    perc: '. . t . . . t . . . t . . . t .',
    voices: { lead: 'triangle', bass: 'sine' },
  },
  boss_tax_collector: {
    root: 45,
    scale: 'minor',
    step: 0.14,
    lead: '. . . . 2 3 4 . . . . . 4 3 2 . . . . . 4 5 6 . . . . . 7 - - .',
    bass: '0 . 4 . 0 . 4 . 0 . 4 . 0 . 5 .',
    perc: 't . . . t . . . t . . . t . . b',
    voices: { lead: 'square', bass: 'triangle' },
  },
  boss_scatter: {
    root: 48,
    scale: 'wholeTone',
    step: 0.1,
    lead: '0 5 2 7 . 3 9 1 . 6 . 4 8 . 2 . 1 7 . 3 8 . 0 5 . 9 2 . 6 . 4 .',
    bass: '0 . . . . . 3 . . . . . 1 . . .',
    perc: 'h h . h . h h . . h . h h . h .',
    voices: { lead: 'square', bass: 'triangle' },
  },
  boss_ermal: {
    root: 48,
    scale: 'major',
    step: 0.24,
    lead: '4 - - 2 - - 0 - - - - - . . . . 4 - - 5 - - 4 - - 2 - - - - - -',
    bass: '0 - - - - - - - 4 - - - - - - - 0 - - - - - - - 4 - - - - - - -',
    perc: '. . . . . . . . . . . . z . . . . . . . . . . . . . . . . . . .',
    voices: { lead: 'sine', bass: 'sine' },
  },
  boss_null_zone: {
    root: 42,
    scale: 'phrygian',
    step: 0.18,
    lead: '4 - - - . . . . . . . . 1 - . . . . . . 0 - - - . . . . . . . .',
    bass: '0 - - - - - - - - - - - - - - -',
    pad: [[0, 1]],
    voices: { lead: 'triangle', bass: 'sine', pad: 'sine' },
  },
  boss_gravity_well: {
    root: 45,
    scale: 'minor',
    step: 0.15,
    lead: '7 - - - 5 - - - 3 - - - 1 - - - 6 - - - 4 - - - 2 - - - 0 - - -',
    bass: '0 - - - - - - - -1 - - - - - - -',
    perc: 'k . . . . . . . k . . . . . . .',
    voices: { lead: 'triangle', bass: 'sine' },
    leadGlide: -12,
  },
  boss_the_pillar: {
    root: 43,
    scale: 'minor',
    step: 0.2,
    lead: '7 - - - - - - - - - - - - - - - 6 - - - - - - - 4 - - - - - - -',
    bass: '0 - - - - - - - 0 - - - - - - - -3 - - - - - - - -2 - - - - - - -',
    pad: [
      [0, 4, 7],
      [-3, 2, 4],
    ],
    voices: { lead: 'triangle', bass: 'triangle', pad: 'triangle' },
  },
  boss_frostbite: {
    root: 49,
    scale: 'pentMinor',
    step: 0.12,
    leadOctave: 1,
    lead: '5 6 7 6 5 . 4 . 5 6 8 6 5 . . . 4 5 6 5 4 . 3 . 2 3 4 3 2 . . .',
    bass: '0 - - - - - - - -1 - - - - - - -',
    perc: 'b . . . . . . . . . . . b . . .',
    voices: { lead: 'triangle', bass: 'sine' },
  },
  boss_eclipse: {
    root: 38,
    scale: 'minor',
    step: 0.2,
    leadOctave: -1,
    gain: 0.75,
    lead: '0 - - - 1 - - - 2 - - - 1 - - - 0 - - - -1 - - - 0 - - - - - - -',
    bass: '0 - - - - - - - - - - - - - - -',
    perc: 'k . . . . . . . . . . . . . . .',
    voices: { lead: 'sine', bass: 'sine' },
  },
  boss_silence: {
    root: 45,
    scale: 'pentMinor',
    step: 0.25,
    gain: 0.8,
    lead: '4 - - - - - - - . . . . . . . . . . . . . . . . . . . . . . . .',
    perc: 'b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
    voices: { lead: 'sine' },
  },
  boss_primordial: {
    root: 45,
    scale: 'harmonicMinor',
    step: 0.1,
    lead: '0 2 4 7 6 4 2 1 0 2 4 7 9 7 6 4 0 2 4 7 6 4 2 1 7 - 6 - 4 - 2 -',
    bass: '0 0 . 0 0 . 0 . -3 -3 . -3 -3 . -2 .',
    perc: 'k . h k s . h . k k h . s . s s',
    voices: { lead: 'square', bass: 'sawtooth' },
  },
  // The gods' gauntlet on the Primordial path (B1), one theme per god.
  // Gaea: slow and heavy, low drums under a dorian line.
  boss_gaea: {
    root: 40,
    scale: 'dorian',
    step: 0.16,
    lead: '0 - 2 - 3 - 2 0 4 - 3 - 2 - 0 -',
    bass: '0 . . 0 . . -3 . 0 . . 0 . . -2 .',
    perc: 'k . . . s . . . k . k . s . . .',
    voices: { lead: 'triangle', bass: 'sawtooth' },
  },
  // Ognen: fast phrygian, anvil hits and rising runs.
  boss_ognen: {
    root: 52,
    scale: 'phrygian',
    step: 0.09,
    lead: '0 1 3 4 7 4 3 1 0 1 3 4 8 7 4 3',
    bass: '0 0 . 0 1 . 0 . 0 0 . 0 -1 . 0 .',
    perc: 'k a h k s a h . k a h k s . s s',
    voices: { lead: 'square', bass: 'sawtooth' },
  },
  // Varuna: a rolling 6/8-ish lydian wash with bubbles.
  boss_varuna: {
    root: 48,
    scale: 'lydian',
    step: 0.12,
    lead: '0 2 4 6 4 2 0 - 4 6 7 6 4 - 2 -',
    bass: '0 . . 4 . . 0 . . 4 . . 3 . . .',
    perc: 'k . p . h p k . p . h p s . p .',
    voices: { lead: 'sine', bass: 'triangle' },
  },
  // Zephyr: airy whole-tone runs, light ticks, no kick.
  boss_zephyr: {
    root: 60,
    scale: 'wholeTone',
    step: 0.1,
    lead: '0 1 2 3 4 5 4 3 2 1 0 - 5 - 3 -',
    bass: '0 . . . 2 . . . 0 . . . 3 . . .',
    perc: 't . h t . h t . t . h t . h t h',
    voices: { lead: 'sine', bass: 'triangle' },
  },
}

/** Which theme fits the current game state. */
export function themeForState(state) {
  const p = state.phase
  if (p === 'rolling' || p === 'missed') {
    const boss = state.bossModifier?.id
    return boss && MUSIC_THEMES[`boss_${boss}`] ? `boss_${boss}` : 'table'
  }
  if (p === 'bossReward' || p === 'victory' || p === 'crossroads') return 'victory'
  if (p === 'shop') return `shop_${state.shop?.type ?? 'market'}`
  if (p === 'gameover') return 'gameover'
  return 'menu'
}

// --- Jukebox support (JukeboxPage.jsx, MUSIC.md) ---
// The themes as written in this file, kept before any saved edit is applied.
export const BUILTIN_THEMES = JSON.parse(JSON.stringify(MUSIC_THEMES))

const OVERRIDES_KEY = 'elementa-music-overrides'

export function readMusicOverrides() {
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** Saves one edited theme in this browser (null puts the built-in one back) and applies it. */
export function saveMusicOverrides(id, theme) {
  const all = readMusicOverrides()
  if (theme) all[id] = theme
  else delete all[id]
  try {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all))
  } catch {
    // storage blocked: the edit only lasts until the page is closed
  }
  MUSIC_THEMES[id] = theme ?? JSON.parse(JSON.stringify(BUILTIN_THEMES[id]))
}

// Edits saved from the Jukebox replace the built-in themes in this browser.
Object.entries(readMusicOverrides()).forEach(([id, theme]) => {
  if (BUILTIN_THEMES[id]) MUSIC_THEMES[id] = theme
})
