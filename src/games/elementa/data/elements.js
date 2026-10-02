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
  CHRONO: 'chrono',
  BEACON: 'beacon',
  ALL_ELEMENTS: 'allElements',
}

const flagSet = (...flags) => Object.fromEntries(flags.map((f) => [f, true]))

export const TIERS = {
  PURE: 'pure',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  QUADRA: 'quadra',
  ARCANE: 'arcane',
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
    rarity: RARITY.RARE,
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
    rarity: RARITY.EPIC,
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
    tagline: 'Its two neighbors react with each other as if they touched.',
    flags: flagSet(FLAGS.CONDUIT),
  },
  chrono: {
    id: 'chrono',
    name: 'Chrono',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    parents: [],
    color: '#c9a0ff',
    tagline: 'A rolled 1 rewinds and rolls again for free.',
    flags: flagSet(FLAGS.CHRONO),
  },
  beacon: {
    id: 'beacon',
    name: 'Beacon',
    tier: TIERS.ARCANE,
    rarity: RARITY.EPIC,
    parents: [],
    color: '#ffb347',
    tagline: 'The dice on either side of it score x1.5.',
    flags: flagSet(FLAGS.BEACON),
  },
  prism: {
    id: 'prism',
    name: 'Prism',
    tier: TIERS.ARCANE,
    rarity: RARITY.LEGENDARY,
    parents: [],
    color: '#ff7ad9',
    tagline: 'Counts as all four elements for reactions with its neighbors.',
    flags: flagSet(FLAGS.ALL_ELEMENTS),
  },
}

export const PURE_ELEMENT_IDS = ['earth', 'fire', 'water', 'air']
export const DOUBLE_FUSION_IDS = ['lightning', 'ice', 'steel', 'mud', 'steam', 'crystal']
export const TRIPLE_FUSION_IDS = ['storm', 'obsidian', 'magma', 'monsoon']
export const QUADRA_FUSION_ID = 'aether'
export const ARCANE_DIE_IDS = ['midas', 'sapling', 'mirror', 'conduit', 'chrono', 'beacon', 'prism']

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
  [FLAGS.CONDUIT]: 'Bridges reactions between its two neighbors.',
  [FLAGS.CHRONO]: 'A 1 rerolls itself once, for free.',
  [FLAGS.BEACON]: 'Both neighbors score x1.5.',
  [FLAGS.ALL_ELEMENTS]: 'Reacts as Fire, Water, Earth, and Air at once.',
}

export function describeElement(elementId, lang = 'en') {
  const def = ELEMENTS[elementId]
  const flagLines = Object.keys(def.flags)
    .map((f) => (lang === 'es' ? (FLAG_DESCRIPTIONS_ES[f] ?? FLAG_DESCRIPTIONS[f]) : FLAG_DESCRIPTIONS[f]))
    .filter(Boolean)
  flagLines.push(...familyAbilitiesOf(elementId).map((id) => familyAbilityText(id, lang)))
  return { tagline: localize(lang, def.tagline, ELEMENTS_ES, elementId, 'tagline'), flagLines }
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
}

export function rarityForElement(elementId) {
  const def = ELEMENTS[elementId]
  return def?.rarity ?? TIER_RARITY[def?.tier] ?? RARITY.COMMON
}
