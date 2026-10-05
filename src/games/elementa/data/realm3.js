// Realm 3 (EXPANSION.md Part R, v0.9): rounds 31 to 45 past the Firmament.
// One realm, three looks (the path picks the name and the colors), six
// Rewriters at rounds 35, 40 and 45 that rewrite the scoring formula, and the
// Abstract and Absolute dice that go with them. All text is a DRAFT for Carlos.
const L = (en, es) => ({ en, es })

export const REALM3_START = 31
export const REALM3_END = 45
/** Realm 3 grows x1.40 a round from round 31, the same as the Firmament (Carlos, 2026-10-05: better too easy than too hard; it was x1.45). */
export const REALM3_GROWTH = 1.4

/** The realm's name and look for each path. */
export const REALM3 = {
  split: {
    id: 'empyrean',
    name: L('The Empyrean', 'El Empíreo'),
    blurb: L('Strict, grid-like, ordered. Every line is straight and every number agrees with itself.', 'Estricto, de cuadrícula, ordenado. Cada línea es recta y cada número está de acuerdo consigo mismo.'),
    color: '#9fd8ff',
    accent: '#ffe9a0',
    legendary: L('The Ledger', 'El Libro Mayor'),
  },
  primordial: {
    id: 'pleroma',
    name: L('The Pleroma', 'El Pleroma'),
    blurb: L('Merging and dissolving. Edges blur, shapes drift into each other, everything wants to be one thing.', 'Se funde y se disuelve. Los bordes se difuminan, las formas se mezclan, todo quiere ser una sola cosa.'),
    color: '#ff7a9a',
    accent: '#c08cff',
    legendary: L('Cornucopia', 'Cornucopia'),
  },
  neutral: {
    id: 'meridian',
    name: L('The Meridian', 'El Meridiano'),
    blurb: L('Swinging between the two: a line that is sometimes a wall and sometimes a river.', 'Oscila entre los dos: una línea que a veces es muro y a veces río.'),
    color: '#ffd166',
    accent: '#7ad1ff',
    legendary: L('Equinox Market', 'Mercado del Equinoccio'),
  },
}
export const realm3For = (path) => REALM3[path] ?? REALM3.neutral

// The six Rewriters (R2): tier 5. `hint` is the one-line nudge toward the
// counter, shown on the boss card. `target` is the multiplier on the round's
// normal target, calibrated with tools/balanceSim.mjs (see the file).
export const REWRITERS = [
  {
    id: 'axiom',
    tier: 5,
    name: 'The Axiom',
    description: 'Your score is Base + Mult, not Base x Mult.',
    hint: 'Flat Base wins: big dice, Whetstone, Honing Oil, Gold. Multipliers do little.',
    effects: { addScore: true },
    teaches: 'monad',
    voice: L('I state it; therefore it is.', 'Lo enuncio; por lo tanto, es.'),
  },
  {
    id: 'zero',
    tier: 5,
    name: 'Zero',
    description: 'Every face below 3 counts as 0, and fizzles.',
    hint: 'Big dice, Luminance, Alba, Weights and rerolls. A pool of d3s will not survive.',
    effects: { zeroBelow: 3 },
    teaches: 'nun',
    voice: L('...', '...'),
  },
  {
    id: 'infinity',
    tier: 5,
    name: 'Infinity',
    description: 'Nothing is capped, but the target rises 10% for every reroll used and 5% for every explosion this round.',
    hint: 'Few rerolls, big bursts, cast early. Ognen and Comet shine.',
    effects: { explodeChainUncapped: true, thresholdPerReroll: 0.1, thresholdPerExplosion: 0.05 },
    teaches: 'apeiron',
    voice: L('and then, and then, and then', 'y luego, y luego, y luego'),
  },
  {
    id: 'observer',
    tier: 5,
    name: 'The Observer',
    description: 'A die\'s face is hidden until you hover over it, tap it or focus it. Casting shows them all.',
    hint: 'Luminance keeps faces visible, and so does the sigil Eye. Fewer, bigger dice are easier to read by feel.',
    effects: { observerHide: true },
    teaches: 'janus',
    voice: L('I am only here if you look.', 'Solo estoy aquí si me miras.'),
  },
  {
    id: 'floating',
    tier: 5,
    name: 'Floating Point',
    description: 'No decimals: Base and Mult are rounded down at every step of the ledger.',
    hint: 'Whole-number sources, flat Mult, Tide. Every 0.5 and 1.5 bonus vanishes.',
    effects: { floorSteps: true },
    prizeRelic: 'epsilon',
    voice: L('approximately.', 'aproximadamente.'),
  },
  {
    id: 'deadlock',
    tier: 5,
    name: 'Deadlock',
    description: 'You can hold or lock at most one die at a time.',
    hint: 'Reroll-everything builds, Chrono, Alba and high floors. Let the explosions carry you.',
    effects: { holdLimit: 1 },
    prizeRelic: 'release',
    voice: L('One at a time, please.', 'De uno en uno, por favor.'),
  },
]
export const REWRITER_IDS = REWRITERS.map((r) => r.id)
export const rewriterById = (id) => REWRITERS.find((r) => r.id === id) ?? null

/** Set I and Set II per path (R2); Neutral shares the Split's, the Primordial's are reversed. */
const SET_I = ['axiom', 'zero', 'floating']
const SET_II = ['infinity', 'observer', 'deadlock']
export const REWRITER_SETS = {
  split: [SET_I, SET_II],
  primordial: [SET_II, SET_I],
  neutral: [SET_I, SET_II],
}
export const REWRITER_ROUNDS = [35, 40, 45]

// The target multiplier on the round's normal target for each Rewriter
// (R2). Calibrated by `node tools/balanceSim.mjs ember 80 45 rewriters`: about
// 1.1 times the median of a bot that has the counter-play, never above what
// a strong build reaches. Re-run it after changing any rule.
export const REWRITER_TARGET = { axiom: 0.0008, zero: 0.373, infinity: 1.314, observer: 0.423, floating: 0.074, deadlock: 0.045 }

/** The Rewriter waiting at `round` for this path and set, or null. */
export function rewriterFor(path, set, round) {
  const i = REWRITER_ROUNDS.indexOf(round)
  if (i === -1) return null
  const id = (REWRITER_SETS[path] ?? REWRITER_SETS.neutral)[(set || 1) - 1][i]
  return rewriterById(id)
}

/** Realm 3's ending for a path and set (R1): the last Rewriter of the set falls. */
export const realm3Ending = (path, set) => `realm3_${path}_${set}`

/** A shop's name for this run: past the second door the legendary shop takes the realm's own name (R1). */
export const shopNameIn = (state, type, lang) =>
  state?.realm3 && type.id === 'astral' ? realm3For(state.path).legendary[lang] : type.name[lang]
