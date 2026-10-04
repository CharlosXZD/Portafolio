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
  {
    id: 'avatar',
    name: 'Avatar',
    dice: ['earth', 'earth', 'aether'],
    tagline: 'Master of all four. Starts with Aether.',
  },
  // v0.8.5 (EXPANSION.md O3): unlocked by winning with any other loadout.
  {
    id: 'gambler',
    name: 'Gambler',
    dice: ['poker', 'poker', 'poker', 'poker', 'joker'],
    tagline: 'Four poker dice and a Joker. Make hands.',
  },
]

export function deckById(id) {
  return DECKS.find((d) => d.id === id) ?? DECKS[0]
}
