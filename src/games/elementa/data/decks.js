// Starting loadouts, chosen on the new-run screen. Each is a starting dice
// pool only; everything else about the run (economy, fusion tree) is
// identical. They form a ladder: a loadout unlocks once the one before it
// has been beaten (won on any difficulty), tracked in utils/profile.js.
// Order goes safe -> volatile -> mixed -> starting with fusions.
export const DECKS = [
  {
    id: 'balanced',
    name: 'Stonecaller',
    dice: ['earth', 'earth', 'earth'],
    tagline: 'Steady stone. No risk, no tricks.',
  },
  {
    id: 'tidecaller',
    name: 'Tidecaller',
    dice: ['water', 'water', 'water'],
    tagline: 'Free locks that feed your rerolls.',
  },
  {
    id: 'tempest',
    name: 'Tempest',
    dice: ['air', 'air', 'air'],
    tagline: 'Sets from the very first roll.',
  },
  {
    id: 'pyromancer',
    name: 'Pyromancer',
    dice: ['fire', 'fire', 'fire'],
    tagline: 'All explosion, no safety net.',
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    dice: ['earth', 'water', 'fire', 'air'],
    tagline: 'One of every element. Fuse anything.',
  },
  {
    id: 'forgeborn',
    name: 'Forgeborn',
    dice: ['earth', 'fire', 'steel'],
    tagline: 'Starts with Steel: fire without the fizzle.',
  },
  {
    id: 'stormchaser',
    name: 'Stormchaser',
    dice: ['fire', 'air', 'lightning'],
    tagline: 'Chain explosions straight into sets.',
  },
  // v0.8.5 (EXPANSION.md O3). Since v0.9.5 (T5) it follows Stormchaser, like every loadout in the chain.
  {
    id: 'gambler',
    name: 'Gambler',
    dice: ['poker', 'poker', 'poker', 'poker', 'joker'],
    tagline: 'Four poker dice and a Joker. Make hands.',
  },
  // v0.9.5 (EXPANSION.md T5): each opens when the file has won with the one before it.
  {
    id: 'climate',
    name: 'Climate',
    dice: ['magma', 'storm', 'monsoon'],
    tagline: 'Weather as a weapon: the three climate phenomena.',
  },
  {
    id: 'geologist',
    name: 'Geologist',
    dice: ['mud', 'crystal', 'obsidian'],
    tagline: "Earth's patient fusions.",
  },
  {
    id: 'tidal',
    name: 'Tidal',
    dice: ['ice', 'steam', 'water'],
    tagline: 'Everything water can become.',
  },
  {
    id: 'arcanist',
    name: 'Arcanist',
    dice: ['mirror', 'beacon', 'conduit'],
    tagline: 'No element, all neighbors.',
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    dice: ['midas', 'bullion', 'earth'],
    tagline: 'Money first, dice later.',
  },
  {
    id: 'twinflame',
    name: 'Twin Flame',
    dice: ['fire', 'lightning', 'magma'],
    tagline: 'Fire and everything that burns.',
  },
  // The Lottery draws its three dice per run from LOTTERY_POOL (the seeded generator, no two alike).
  {
    id: 'lottery',
    name: 'Lottery',
    dice: [],
    lottery: 3,
    tagline: 'Whatever the universe hands you.',
  },
]

/**
 * The dice the Lottery can hand out (T5): the Elementa shop's pure elements,
 * double and triple fusions and arcane dice. Never a god, a Mythic, an
 * Absolute, a sigil or a number die, and nothing from the Firmament.
 */
export const LOTTERY_POOL = [
  'earth', 'fire', 'water', 'air',
  'lightning', 'ice', 'steel', 'mud', 'steam', 'crystal',
  'storm', 'obsidian', 'magma', 'monsoon',
  'midas', 'sapling', 'mirror', 'conduit', 'kairos', 'beacon', 'prism', 'bullion', 'masquerade', 'chameleon',
]

export function deckById(id) {
  return DECKS.find((d) => d.id === id) ?? DECKS[0]
}
