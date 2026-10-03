// Every die (pure or fused) is defined purely by its mechanic flags; the
// scoring engine (see ../engine/scoring.js) is generic over these flags.
// Fusions are dice that carry a hand-picked combination of their parents'
// flags (sometimes with overrides, e.g. Steel drops Fire's zeroOnMin).
// See ../GDD.md §3 for the design rationale.

import { RARITY } from './relics.js'
import { localize, ELEMENTS_ES, FLAG_DESCRIPTIONS_ES } from './i18n.js'

export const FLAGS = {
  EXPLODE: 'explode',
  ZERO_ON_MIN: 'zeroOnMin',
  FREE_LOCK: 'freeLock',
  GRANTS_REROLL_ON_LOCK: 'grantsRerollOnLock',
  ADJACENT_FREE_LOCK: 'adjacentFreeLock',
  DUPLICATE_ON_REROLL: 'duplicateOnReroll',
  ENABLES_SET_BONUS: 'enablesSetBonus',
  DOUBLE_ON_SET: 'doubleOnSet',
  // Arcane (non-elemental) dice: mostly about *where* the die sits.
  MIDAS: 'midas',
  GROWS: 'grows',
  MIRROR_LEFT: 'mirrorLeft',
  CONDUIT: 'conduit',
  // Kairos (the old Chrono, H4): a 1 rolls again until it is not a 1.
  KAIROS: 'kairos',
  BEACON: 'beacon',
  ALL_ELEMENTS: 'allElements',
  // EXPANSION.md B10.
  BULLION: 'bullion',
  MIMIC_LEFT: 'mimicLeft', // Masquerade: abilities and score of the left die
  MIMIC_SPLIT: 'mimicSplit', // Chameleon: abilities of the left, score of the right
  // EXPANSION.md H3 to H5: the Firmament's dice.
  CHRONO: 'chronoLoop', // Chrono: any 1 rewinds time and rerolls the whole pool
  LIGHT: 'lightFloor', // Light: no die scores below its face
  DARKNESS: 'darkness', // Darkness: eats its neighbors into Mult
  TIME: 'timeRewind', // Time: undo a reroll once per round
  SPACE: 'spaceLink', // Space: neighbors and the two ends all touch
  CHAOS: 'chaos', // Chaos: becomes a random die every roll
  VOID: 'void', // Void: +1 Mult per empty slot
  ENTROPY: 'entropy', // Entropy: face + 104, +10 Mult
  // EXPANSION.md I1: the Celestial dice, sold only past the door.
  COMET: 'comet', // Comet: explodes on its two top faces, scores double when it does
  PULSAR: 'pulsar', // Pulsar: +1 Base per reroll this round, up to +10
  SATELLITE: 'satellite', // Satellite: neighbors count their face +1; scores nothing
  QUASAR: 'quasar', // Quasar: its face goes to Mult; one per run
  ZENITH: 'zenith', // Zenith: +1 reroll a round, more at rounds 20 and 25
}

const flagSet = (...flags) => Object.fromEntries(flags.map((f) => [f, true]))

export const TIERS = {
  PURE: 'pure',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  QUADRA: 'quadra',
  ARCANE: 'arcane',
  // B4: the four gods, forged from 4 of one pure die; B1: the Primordial
  // die, lent for the Primordial path's last battle.
  GOD: 'god',
  PRIMAL: 'primal',
  // H3: the Mythic dice of the Firmament (no element), and Entropy (H5).
  MYTHIC: 'mythic',
}

export const ELEMENTS = {
  earth: {
    id: 'earth',
    name: 'Earth',
    tier: TIERS.PURE,
    parents: [],
    color: '#8a6a3d',
    tagline: 'Reliable filler. No risk, no downside.',
    flags: flagSet(),
  },
  fire: {
    id: 'fire',
    name: 'Fire',
    tier: TIERS.PURE,
    parents: [],
    color: '#e5533d',
    tagline: 'Volatile. Explodes on max, fizzles on a 1.',
    flags: flagSet(FLAGS.EXPLODE, FLAGS.ZERO_ON_MIN),
  },
  water: {
    id: 'water',
    name: 'Water',
    tier: TIERS.PURE,
    parents: [],
    color: '#3d8fe5',
    tagline: 'Manipulation. Free locks that refuel your rerolls.',
    flags: flagSet(FLAGS.FREE_LOCK, FLAGS.GRANTS_REROLL_ON_LOCK),
  },
  air: {
    id: 'air',
    name: 'Air',
    tier: TIERS.PURE,
    parents: [],
    color: '#cfe0e8',
    tagline: 'Combo. Rewards matching sets across the whole pool.',
    flags: flagSet(FLAGS.ENABLES_SET_BONUS),
  },

  // --- Double fusions ---
  lightning: {
    id: 'lightning',
    name: 'Lightning',
    tier: TIERS.DOUBLE,
    parents: ['fire', 'air'],
    color: '#f2c94c',
    tagline: 'Chained explosions re-check the set bonus mid-roll.',
    flags: flagSet(FLAGS.EXPLODE, FLAGS.ZERO_ON_MIN, FLAGS.ENABLES_SET_BONUS),
  },
  ice: {
    id: 'ice',
    name: 'Ice',
    tier: TIERS.DOUBLE,
    parents: ['water', 'air'],
    color: '#9fe8e0',
    tagline: 'Locked faces count toward sets. Manufacture a straight.',
    flags: flagSet(FLAGS.FREE_LOCK, FLAGS.GRANTS_REROLL_ON_LOCK, FLAGS.ENABLES_SET_BONUS),
  },
  steel: {
    id: 'steel',
    name: 'Steel',
    tier: TIERS.DOUBLE,
    parents: ['fire', 'earth'],
    color: '#9aa0a6',
    tagline: "Explodes like Fire, but Earth's reliability kills the downside.",
    flags: flagSet(FLAGS.EXPLODE),
  },
  mud: {
    id: 'mud',
    name: 'Mud',
    tier: TIERS.DOUBLE,
    parents: ['water', 'earth'],
    color: '#6b4f3a',
    tagline: 'Locking this die locks the next one free too.',
    flags: flagSet(FLAGS.FREE_LOCK, FLAGS.GRANTS_REROLL_ON_LOCK, FLAGS.ADJACENT_FREE_LOCK),
  },
  steam: {
    id: 'steam',
    name: 'Steam',
    tier: TIERS.DOUBLE,
    parents: ['fire', 'water'],
    color: '#d8e8ec',
    tagline: 'Rerolling it can duplicate the result onto another die.',
    flags: flagSet(FLAGS.EXPLODE, FLAGS.ZERO_ON_MIN, FLAGS.DUPLICATE_ON_REROLL),
  },
  crystal: {
    id: 'crystal',
    name: 'Crystal',
    tier: TIERS.DOUBLE,
    parents: ['earth', 'air'],
    color: '#b28df2',
    tagline: 'Counts double when part of a matching set.',
    flags: flagSet(FLAGS.ENABLES_SET_BONUS, FLAGS.DOUBLE_ON_SET),
  },

  // --- Triple fusions ---
  storm: {
    id: 'storm',
    name: 'Storm',
    tier: TIERS.TRIPLE,
    parents: ['fire', 'water', 'air'],
    color: '#5b6ee8',
    tagline: 'Manufacture a set with a free lock, then detonate it.',
    flags: flagSet(
      FLAGS.EXPLODE,
      FLAGS.ZERO_ON_MIN,
      FLAGS.FREE_LOCK,
      FLAGS.GRANTS_REROLL_ON_LOCK,
      FLAGS.ENABLES_SET_BONUS,
    ),
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    tier: TIERS.TRIPLE,
    parents: ['fire', 'water', 'earth'],
    color: '#2b2b33',
    tagline: 'Safe, stacking value. Explodes without the fizzle risk.',
    flags: flagSet(FLAGS.EXPLODE, FLAGS.DUPLICATE_ON_REROLL),
  },
  magma: {
    id: 'magma',
    name: 'Magma',
    tier: TIERS.TRIPLE,
    parents: ['fire', 'air', 'earth'],
    color: '#c94f2b',
    tagline: 'Exploded totals can double if part of a set.',
    flags: flagSet(FLAGS.EXPLODE, FLAGS.ENABLES_SET_BONUS, FLAGS.DOUBLE_ON_SET),
  },
  monsoon: {
    id: 'monsoon',
    name: 'Monsoon',
    tier: TIERS.TRIPLE,
    parents: ['water', 'air', 'earth'],
    color: '#3f7a8c',
    tagline: 'One lock, two dice join a set: the cheapest combo enabler.',
    flags: flagSet(
      FLAGS.FREE_LOCK,
      FLAGS.GRANTS_REROLL_ON_LOCK,
      FLAGS.ADJACENT_FREE_LOCK,
      FLAGS.ENABLES_SET_BONUS,
    ),
  },

  // --- Quadra fusion (legendary) ---
  aether: {
    id: 'aether',
    name: 'Aether',
    tier: TIERS.QUADRA,
    // Can grow past d20 in the Firmament (H5).
    bigGrowth: true,
    parents: ['fire', 'water', 'air', 'earth'],
    color: '#f2f2f2',
    tagline: 'Every mechanic, on one die. Capped at one per run.',
    flags: flagSet(
      FLAGS.EXPLODE,
      FLAGS.ZERO_ON_MIN,
      FLAGS.FREE_LOCK,
      FLAGS.GRANTS_REROLL_ON_LOCK,
      FLAGS.ADJACENT_FREE_LOCK,
      FLAGS.DUPLICATE_ON_REROLL,
      FLAGS.ENABLES_SET_BONUS,
      FLAGS.DOUBLE_ON_SET,
    ),
  },

  // --- Arcane dice (GDD §24): no element, no fusion recipe. Bought
  // directly from the shop (rarity-gated like everything else); each one
  // cares about its neighbors, so the order of your dice matters. ---
  midas: {
    id: 'midas',
    name: 'Gilded',
    tier: TIERS.ARCANE,
    rarity: RARITY.COMMON,
    parents: [],
    color: '#e8b923',
    tagline: 'Scores nothing. Pays its face in Shards when you clear the round.',
    flags: flagSet(FLAGS.MIDAS),
  },
  sapling: {
    id: 'sapling',
    name: 'Sapling',
    tier: TIERS.ARCANE,
    rarity: RARITY.RARE,
    parents: [],
    color: '#6fbf4a',
    tagline: 'Grows +2 every reroll it stays held. Rerolling it resets the growth.',
    flags: flagSet(FLAGS.GROWS),
  },
  mirror: {
    id: 'mirror',
    name: 'Mirror',
    tier: TIERS.ARCANE,
    rarity: RARITY.RARE,
    parents: [],
    color: '#b8c4d6',
    tagline: 'Copies the score of the die to its left.',
    flags: flagSet(FLAGS.MIRROR_LEFT),
  },
  conduit: {
    id: 'conduit',
    name: 'Conduit',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    parents: [],
    color: '#7ae0c8',
    tagline: 'Its two neighbors react with each other as if they touched, and those reactions count double.',
    flags: flagSet(FLAGS.CONDUIT),
  },
  // Kairos was called Chrono until the Firmament (H4).
  kairos: {
    id: 'kairos',
    name: 'Kairos',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    parents: [],
    color: '#c9a0ff',
    tagline: 'A rolled 1 rewinds and rolls again, until it is no longer a 1.',
    flags: flagSet(FLAGS.KAIROS),
  },
  beacon: {
    id: 'beacon',
    name: 'Beacon',
    tier: TIERS.ARCANE,
    rarity: RARITY.RARE,
    parents: [],
    color: '#ffb347',
    tagline: 'The dice on either side of it score x1.5.',
    flags: flagSet(FLAGS.BEACON),
  },
  prism: {
    id: 'prism',
    name: 'Prism',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    price: 25,
    parents: [],
    color: '#ff7ad9',
    tagline: 'Counts as all four elements for reactions with its neighbors.',
    flags: flagSet(FLAGS.ALL_ELEMENTS),
  },
  // --- The gods (EXPANSION.md B4): Divine, forge-only from 4 pure dice of
  // their element, one at a time. They carry their element's abilities;
  // their own ability and drawback live in engine/gods.js. ---
  gaea: {
    id: 'gaea',
    name: 'Gaea',
    tier: TIERS.GOD,
    rarity: RARITY.DIVINE,
    god: 'gaea',
    parents: ['earth'],
    recipe: { earth: 4 },
    color: '#b8894a',
    tagline: 'The Earth god. Draws her power from her whole family.',
    flags: flagSet(),
  },
  ognen: {
    id: 'ognen',
    name: 'Ognen',
    tier: TIERS.GOD,
    rarity: RARITY.DIVINE,
    god: 'ognen',
    parents: ['fire'],
    recipe: { fire: 4 },
    color: '#ff5a1a',
    tagline: 'The Fire god. Burns on anything above the middle.',
    flags: flagSet(FLAGS.EXPLODE),
  },
  varuna: {
    id: 'varuna',
    name: 'Varuna',
    tier: TIERS.GOD,
    rarity: RARITY.DIVINE,
    god: 'varuna',
    parents: ['water'],
    recipe: { water: 4 },
    color: '#2f7fe0',
    tagline: 'The Water god. Every die bends to her tide.',
    flags: flagSet(FLAGS.FREE_LOCK, FLAGS.GRANTS_REROLL_ON_LOCK),
  },
  zephyr: {
    id: 'zephyr',
    name: 'Zephyr',
    tier: TIERS.GOD,
    rarity: RARITY.DIVINE,
    god: 'zephyr',
    parents: ['air'],
    recipe: { air: 4 },
    color: '#dff3ff',
    tagline: 'The Air god. Lifts every set one step higher.',
    flags: flagSet(FLAGS.ENABLES_SET_BONUS),
  },
  // The Primordial die (B1): lent on the Primordial path, never kept.
  primordial_die: {
    id: 'primordial_die',
    name: 'Primordial',
    tier: TIERS.PRIMAL,
    rarity: RARITY.DIVINE,
    parents: ['fire', 'water', 'air', 'earth'],
    color: '#ff4d6d',
    tagline: 'Every Aether mechanic, and the power of every god you defeat.',
    flags: flagSet(
      FLAGS.EXPLODE,
      FLAGS.ZERO_ON_MIN,
      FLAGS.FREE_LOCK,
      FLAGS.GRANTS_REROLL_ON_LOCK,
      FLAGS.ADJACENT_FREE_LOCK,
      FLAGS.DUPLICATE_ON_REROLL,
      FLAGS.ENABLES_SET_BONUS,
      FLAGS.DOUBLE_ON_SET,
    ),
  },

  // --- B10: Carlos's arcane dice. ---
  bullion: {
    id: 'bullion',
    name: 'Bullion',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    price: 25,
    parents: [],
    color: '#d9a441',
    tagline: 'Scores nothing. Pays your final Mult in Shards when you clear the round.',
    flags: flagSet(FLAGS.BULLION),
  },
  masquerade: {
    id: 'masquerade',
    name: 'Masquerade',
    tier: TIERS.ARCANE,
    rarity: RARITY.LEGENDARY,
    parents: [],
    color: '#c45bd6',
    tagline: 'Copies the abilities and the score of the die to its left.',
    flags: flagSet(FLAGS.MIMIC_LEFT),
  },
  chameleon: {
    id: 'chameleon',
    name: 'Chameleon',
    tier: TIERS.ARCANE,
    rarity: RARITY.LEGENDARY,
    parents: [],
    color: '#5fbf7a',
    tagline: 'Copies the abilities of the die to its left and the score of the die to its right.',
    flags: flagSet(FLAGS.MIMIC_SPLIT),
  },

  // --- The Firmament (EXPANSION.md H3 to H5). ---
  // Chrono (H4): sold only by the Horologist, in the Firmament.
  chrono: {
    id: 'chrono',
    name: 'Chrono',
    tier: TIERS.ARCANE,
    rarity: RARITY.LEGENDARY,
    price: 30,
    firmament: true,
    parents: [],
    color: '#8f7bff',
    tagline: 'Any die that rolls a 1 rewinds time: every unheld die rolls again, and you keep the better pool. Repeats until a roll comes up with no 1.',
    flags: flagSet(FLAGS.CHRONO),
  },
  // --- The Celestial dice (EXPANSION.md I1): arcane dice sold only past the
  // door (Firmament Markets, the Astral Exchange, the Horologist). No unlock.
  // `stockWeight` thins one out of the shop pool; `price` is its own price.
  comet: {
    id: 'comet',
    name: 'Comet',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    price: 16,
    firmament: true,
    parents: [],
    color: '#8fd8ff',
    tagline: 'Explodes on its two highest faces, and scores its whole total twice when it does.',
    flags: flagSet(FLAGS.COMET),
  },
  pulsar: {
    id: 'pulsar',
    name: 'Pulsar',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    price: 16,
    firmament: true,
    parents: [],
    color: '#ff8fd0',
    tagline: 'Every reroll this round adds +1 to its Base, up to +10.',
    flags: flagSet(FLAGS.PULSAR),
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    price: 16,
    firmament: true,
    parents: [],
    color: '#b8c8e8',
    tagline: 'The dice on both sides count their face +1. It does not score itself.',
    flags: flagSet(FLAGS.SATELLITE),
  },
  quasar: {
    id: 'quasar',
    name: 'Quasar',
    tier: TIERS.ARCANE,
    rarity: RARITY.LEGENDARY,
    price: 30,
    firmament: true,
    stockWeight: 0.4,
    parents: [],
    color: '#c58cff',
    tagline: 'Its face goes to Mult instead of Base. One per run.',
    flags: flagSet(FLAGS.QUASAR),
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    price: 16,
    firmament: true,
    parents: [],
    color: '#ffe08a',
    tagline: 'While it is in your pool: +1 reroll every round, +1 more from round 20 and again from round 25.',
    flags: flagSet(FLAGS.ZENITH),
  },
  // The six Mythic dice (H3): no element, one of each per run, each the
  // prize of the Warden that guards it. Sold only in the Firmament.
  light: {
    id: 'light',
    name: 'Light',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    warden: 'dawn',
    bigGrowth: true,
    parents: [],
    color: '#fff2a8',
    tagline: 'No die can score below its face. Fizzles are cancelled, and faces stay visible.',
    flags: flagSet(FLAGS.LIGHT),
  },
  darkness: {
    id: 'darkness',
    name: 'Darkness',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    warden: 'umbra',
    bigGrowth: true,
    parents: [],
    color: '#6a4fb8',
    tagline: 'The dice on either side of it score 0. What they would have scored goes to your Mult.',
    flags: flagSet(FLAGS.DARKNESS),
  },
  time: {
    id: 'time',
    name: 'Time',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    warden: 'clockwork',
    bigGrowth: true,
    parents: [],
    color: '#b9a6ff',
    tagline: 'Once per round, undo your last reroll and get it back. Unused rerolls carry over, up to +3.',
    flags: flagSet(FLAGS.TIME),
  },
  space: {
    id: 'space',
    name: 'Space',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    warden: 'expanse',
    bigGrowth: true,
    parents: [],
    color: '#5a7cff',
    tagline: 'Its two neighbors and the two end dice all count as neighbors of each other. Always Warp.',
    flags: flagSet(FLAGS.SPACE),
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    warden: 'maelstrom',
    bigGrowth: true,
    parents: [],
    color: '#ff3fa4',
    tagline: 'Every roll it becomes a random die from the whole game, in a random size.',
    flags: flagSet(FLAGS.CHAOS),
  },
  void: {
    id: 'void',
    name: 'Void',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    warden: 'hollow',
    bigGrowth: true,
    parents: [],
    color: '#8a7aa8',
    tagline: 'Scores nothing. Every empty slot you have gives +1 Mult.',
    flags: flagSet(FLAGS.VOID),
  },
  // Entropy (H5): all six Mythic dice and Aether, forged into one.
  entropy: {
    id: 'entropy',
    name: 'Entropy',
    tier: TIERS.MYTHIC,
    rarity: RARITY.MYTHIC,
    bigGrowth: true,
    parents: [],
    recipe: { light: 1, darkness: 1, time: 1, space: 1, chaos: 1, void: 1, aether: 1 },
    color: '#f0e8ff',
    tagline: 'Everything at once. Scores its face + 104, and +10 Mult.',
    flags: flagSet(FLAGS.ENTROPY),
  },
}

export const PURE_ELEMENT_IDS = ['earth', 'fire', 'water', 'air']
export const DOUBLE_FUSION_IDS = ['lightning', 'ice', 'steel', 'mud', 'steam', 'crystal']
export const TRIPLE_FUSION_IDS = ['storm', 'obsidian', 'magma', 'monsoon']
export const QUADRA_FUSION_ID = 'aether'
export const GOD_IDS = ['gaea', 'ognen', 'varuna', 'zephyr']
export const PRIMORDIAL_DIE_ID = 'primordial_die'

export const ARCANE_DIE_IDS = ['midas', 'sapling', 'mirror', 'conduit', 'kairos', 'beacon', 'prism', 'bullion', 'masquerade', 'chameleon']
// The Firmament (H3, H4, H5).
export const CHRONO_ID = 'chrono'
// The Celestial dice (I1): sold only in the Firmament; the Horologist also
// sells Pulsar and Zenith (I2), and Kairos there.
export const CELESTIAL_DIE_IDS = ['comet', 'pulsar', 'satellite', 'quasar', 'zenith']
export const MYTHIC_DIE_IDS = ['light', 'darkness', 'time', 'space', 'chaos', 'void']
export const ENTROPY_ID = 'entropy'

/** A Mythic die or Entropy: one of each kind per run (H3). */
export const isMythic = (elementId) => ELEMENTS[elementId]?.tier === TIERS.MYTHIC

/** Dice limited to one per run: the Mythic dice, and the Quasar (I1). */
export const isOnePerRun = (elementId) => isMythic(elementId) || elementId === 'quasar'

/** Dice that can grow past d20 in the Firmament (H5): Aether, the Mythic dice, Entropy. */
export const canGrowBig = (elementId) => Boolean(ELEMENTS[elementId]?.bigGrowth)

const isMimic = (id) => Boolean(ELEMENTS[id]?.flags[FLAGS.MIMIC_LEFT] || ELEMENTS[id]?.flags[FLAGS.MIMIC_SPLIT])

/**
 * Which element each die acts as, left to right (B10): Masquerade and
 * Chameleon take on the abilities of the die to their left (a chain of
 * them passes the same abilities along). At the left end they have none
 * of their own to borrow and stay themselves.
 */
export function actingElementIds(dice) {
  const out = []
  dice.forEach((d, i) => {
    // Chaos (H3) acts as the die it became on its last roll.
    const own = d.chaosForm?.elementId ?? d.elementId
    out.push(isMimic(d.elementId) && i > 0 ? out[i - 1] : own)
  })
  return out
}

// Which elements a die brings to an adjacency reaction (data/reactions.js):
// a pure die is itself, a fusion is its parents, Prism is all four, and the
// other arcane dice bring nothing.
export function reactionElementsOf(elementId) {
  const def = ELEMENTS[elementId]
  if (!def) return []
  if (def.flags[FLAGS.ALL_ELEMENTS]) return [...PURE_ELEMENT_IDS]
  if (def.tier === TIERS.PURE) return [elementId]
  return def.parents
}

export function elementHasFlag(elementId, flag) {
  return Boolean(ELEMENTS[elementId]?.flags[flag])
}

// A family is a pure element plus every fusion made with it (Prism and the
// other arcane dice belong to none).
export function inFamily(elementId, family) {
  const def = ELEMENTS[elementId]
  if (!def || def.tier === TIERS.ARCANE) return false
  return elementId === family || def.parents.includes(family)
}

// The families a die belongs to, for tags and grouping: a pure die is its
// own family, a fusion belongs to each parent's, arcane dice to 'arcane'.
export function familiesOf(elementId) {
  const def = ELEMENTS[elementId]
  if (!def) return []
  if (def.tier === TIERS.ARCANE) return ['arcane']
  if (def.tier === TIERS.MYTHIC) return ['mythic']
  if (def.tier === TIERS.PURE) return [elementId]
  return def.parents
}

// Family abilities (EXPANSION.md E8), shared by every die in the family; a
// fusion gets one per family it belongs to. Kindling only fires on dice
// that can actually fizzle.
export function familyAbilitiesOf(elementId) {
  const out = []
  if (inFamily(elementId, 'fire') && elementHasFlag(elementId, FLAGS.ZERO_ON_MIN)) out.push('kindling')
  if (inFamily(elementId, 'earth')) out.push('patience')
  if (inFamily(elementId, 'air')) out.push('drift')
  return out
}

const FAMILY_ABILITY_TEXT = {
  en: {
    kindling: 'Kindling: fizzling on a 1 after a reroll grants +1 reroll this round.',
    patience: 'Patience: +2 for every reroll it sits out this round.',
    drift: 'Drift: once per round, nudge an Air-family die up or down by 1, for free.',
  },
  es: {
    kindling: 'Yesca: apagarse con un 1 tras un reroll otorga +1 reroll esta ronda.',
    patience: 'Paciencia: +2 por cada reroll que se queda fuera esta ronda.',
    drift: 'Deriva: una vez por ronda, mueve un dado de la familia Aire 1 arriba o abajo, gratis.',
  },
}

export function familyAbilityText(id, lang = 'en') {
  return (FAMILY_ABILITY_TEXT[lang] ?? FAMILY_ABILITY_TEXT.en)[id]
}

// A fusion is "discovered" once the player has owned at least one die of
// each parent element simultaneously at some point in the current run.
export function fusionsUnlockedBy(ownedElementIdsEverSimultaneously) {
  const owned = new Set(ownedElementIdsEverSimultaneously)
  const unlocked = []
  for (const id of [...DOUBLE_FUSION_IDS, ...TRIPLE_FUSION_IDS]) {
    const def = ELEMENTS[id]
    if (def.parents.every((p) => owned.has(p))) unlocked.push(id)
  }
  if (TRIPLE_FUSION_IDS.every((id) => owned.has(id))) unlocked.push(QUADRA_FUSION_ID)
  return unlocked
}

// Plain-language line per flag, for tooltips. Kept separate from the
// mechanic flag itself so the scoring engine never has to care about copy.
const FLAG_DESCRIPTIONS = {
  [FLAGS.EXPLODE]: 'Rolling the max face rerolls and adds again, chaining.',
  [FLAGS.ZERO_ON_MIN]: 'Rolling a 1 scores 0 this round.',
  [FLAGS.FREE_LOCK]: 'Can lock its face for free (no reroll spent).',
  [FLAGS.GRANTS_REROLL_ON_LOCK]: 'Locking it grants +1 reroll.',
  [FLAGS.ADJACENT_FREE_LOCK]: 'Locking it also locks the next die for free.',
  [FLAGS.DUPLICATE_ON_REROLL]: 'Rerolling it can copy its result onto another die.',
  [FLAGS.ENABLES_SET_BONUS]: 'Enables the matching-set bonus for the whole pool.',
  [FLAGS.DOUBLE_ON_SET]: 'Counts double when part of a matching set.',
  [FLAGS.MIDAS]: 'Scores 0, but its face is paid out in Shards on a clear.',
  [FLAGS.GROWS]: 'Gains +2 for every reroll it sits out.',
  [FLAGS.MIRROR_LEFT]: 'Copies the score of the die on its left.',
  [FLAGS.CONDUIT]: 'Bridges reactions between its two neighbors, and doubles them.',
  [FLAGS.KAIROS]: 'A 1 rerolls itself for free until it is no longer a 1.',
  [FLAGS.CHRONO]: 'When it lands on a 1, every unheld die rolls again for free (it too), and you keep the better pool. Up to 8 times.',
  [FLAGS.LIGHT]: "No die can score below its face: lower faces rise to it, and nothing fizzles. Faces stay visible under Eclipse.",
  [FLAGS.DARKNESS]: 'The dice on either side of it score 0, and their combined score is added to your Mult.',
  [FLAGS.TIME]: 'Once per round, Rewind: undo your last reroll and get it back. Unused rerolls carry into the next round, up to +3.',
  [FLAGS.SPACE]: 'Its two neighbors and the two end dice all count as neighbors of each other for reactions.',
  [FLAGS.CHAOS]: 'Every roll it becomes a random die from the whole game, in a random size. Locking keeps its current form.',
  [FLAGS.VOID]: 'Scores 0. Every empty dice, relic and consumable slot gives +1 Mult.',
  [FLAGS.ENTROPY]: 'Scores its face + 104, and adds +10 to your Mult.',
  [FLAGS.COMET]: 'Explodes on its two highest faces. When it explodes, it scores its whole total twice.',
  [FLAGS.PULSAR]: 'Every reroll this round adds +1 to its Base, up to +10. It starts over next round.',
  [FLAGS.SATELLITE]: 'Scores 0. The dice on both sides count their face +1 (explosion chains unchanged).',
  [FLAGS.QUASAR]: 'Scores 0 Base. Its face goes to your Mult instead, flat. One per run.',
  [FLAGS.ZENITH]: 'While it is in your pool: +1 reroll every round, +1 more from round 20 and again from round 25.',
  [FLAGS.BEACON]: 'Both neighbors score x1.5.',
  [FLAGS.ALL_ELEMENTS]: 'Reacts as Fire, Water, Earth, and Air at once.',
  [FLAGS.BULLION]: 'Scores 0, but pays your final Mult (rounded down) in Shards on a clear.',
  [FLAGS.MIMIC_LEFT]: 'Acts as the die on its left: its abilities, and its score.',
  [FLAGS.MIMIC_SPLIT]: 'Acts as the die on its left, but scores what the die on its right scores.',
}

export function describeElement(elementId, lang = 'en') {
  const def = ELEMENTS[elementId]
  const flagLines = Object.keys(def.flags)
    .map((f) => (lang === 'es' ? (FLAG_DESCRIPTIONS_ES[f] ?? FLAG_DESCRIPTIONS[f]) : FLAG_DESCRIPTIONS[f]))
    .filter(Boolean)
  flagLines.push(...familyAbilitiesOf(elementId).map((id) => familyAbilityText(id, lang)))
  flagLines.push(...godTextLines(elementId, lang))
  flagLines.push(...mythicTextLines(elementId, lang))
  return { tagline: localize(lang, def.tagline, ELEMENTS_ES, elementId, 'tagline'), flagLines }
}

// The Mythic rules (H3, H5), for tooltips and the Gallery.
const MYTHIC_TEXT = {
  en: {
    one: 'Mythic: one of each kind per run. It cannot be copied.',
    space: 'Always carries Warp: it does not count toward your dice cap.',
    big: 'Can grow past d20 in the Firmament, up to d100.',
    chronoShop: 'Sold only by the Horologist, in the Firmament.',
    celestial: 'Celestial: sold only in the Firmament.',
    onePerRun: 'One per run. It cannot be copied.',
  },
  es: {
    one: 'Mítico: uno de cada tipo por partida. No se puede copiar.',
    space: 'Siempre lleva Warp: no cuenta para tu límite de dados.',
    big: 'Puede crecer más allá de d20 en el Firmamento, hasta d100.',
    chronoShop: 'Solo lo vende el Relojero, en el Firmamento.',
    celestial: 'Celestial: solo se vende en el Firmamento.',
    onePerRun: 'Uno por partida. No se puede copiar.',
  },
}

export function mythicTextLines(elementId, lang = 'en') {
  const text = MYTHIC_TEXT[lang] ?? MYTHIC_TEXT.en
  const out = []
  if (isMythic(elementId)) out.push(text.one)
  if (elementId === 'space') out.push(text.space)
  if (canGrowBig(elementId)) out.push(text.big)
  if (elementId === CHRONO_ID) out.push(text.chronoShop)
  if (CELESTIAL_DIE_IDS.includes(elementId)) out.push(text.celestial)
  if (elementId === 'quasar') out.push(text.onePerRun)
  return out
}

// What each god does, for tooltips and the Gallery (B4). The engine side
// is engine/gods.js.
const GOD_TEXT = {
  en: {
    gaea: ['Also scores the face of every other Earth-family die. Earth dice are set wildcards.', 'Drawback: Earth-family dice score -5 (-10 on a 1).'],
    ognen: ['Explodes on any face of 4 or more (chains of up to 10).', 'Drawback: fizzles on 1, 2 and 3. With a Water-family die in the pool, it explodes half as often.'],
    varuna: ['Any die can lock for free, and those locks refund a reroll. Every die showing a 1 takes her face.', 'Drawback: 1s come up 50% more often, on every die.'],
    zephyr: ["Sets go up one tier (a pair counts as three, three as a straight). Zephyr's face is a wildcard.", 'Drawback: Fire-family dice explode half as often.'],
    primordial_die: ['Gains each defeated god\'s ability, without the drawback.'],
    oneGod: 'Only one god die at a time.',
  },
  es: {
    gaea: ['También anota la cara de cada otro dado de la familia Tierra. Los dados de Tierra son comodines de set.', 'Desventaja: los dados de la familia Tierra anotan -5 (-10 con un 1).'],
    ognen: ['Explota con cualquier cara de 4 o más (cadenas de hasta 10).', 'Desventaja: se apaga con 1, 2 y 3. Con un dado de la familia Agua en la reserva, explota la mitad de las veces.'],
    varuna: ['Cualquier dado se puede bloquear gratis, y esos bloqueos devuelven un reroll. Cada dado que muestra un 1 toma su cara.', 'Desventaja: los 1 salen un 50% más seguido, en todos los dados.'],
    zephyr: ['Los sets suben un nivel (un par cuenta como trío, un trío como escalera). La cara de Zephyr es comodín.', 'Desventaja: los dados de la familia Fuego explotan la mitad de las veces.'],
    primordial_die: ['Gana la habilidad de cada dios derrotado, sin la desventaja.'],
    oneGod: 'Solo un dado dios a la vez.',
  },
}

export function godTextLines(elementId, lang = 'en') {
  const text = GOD_TEXT[lang] ?? GOD_TEXT.en
  const lines = text[elementId]
  if (!lines) return []
  return ELEMENTS[elementId]?.tier === TIERS.GOD ? [...lines, text.oneGod] : lines
}

// Dice have their own rarity scale, driven directly by fusion tier: pure
// elements are Common, doubles Rare, triples Epic, and the one quadra
// (Aether) Legendary. This reuses the relic rarity scale/glow so a rare
// item and a rare die read as the same "rare" everywhere in the UI.
const TIER_RARITY = {
  [TIERS.PURE]: RARITY.COMMON,
  [TIERS.DOUBLE]: RARITY.RARE,
  [TIERS.TRIPLE]: RARITY.EPIC,
  [TIERS.QUADRA]: RARITY.LEGENDARY,
  [TIERS.MYTHIC]: RARITY.MYTHIC,
}

export function rarityForElement(elementId) {
  const def = ELEMENTS[elementId]
  return def?.rarity ?? TIER_RARITY[def?.tier] ?? RARITY.COMMON
}
