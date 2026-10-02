// Difficulty is a single, cumulative ladder: each tier keeps every rule from
// the tier before it and adds exactly one new twist, so "harder" always
// means one coherent thing getting worse, not a scattered pile of tweaks.
// Named for escalating heat rather than "normal/hard/hardest" (GDD.md §11).
export const DIFFICULTIES = [
  {
    id: 'ember',
    name: 'Ember',
    color: '#f59e0b',
    lives: 3,
    thresholdBase: 8,
    thresholdGrowth: 1.45,
    thresholdMultiplier: 1,
    relicCap: 5,
    shardMultiplier: 1,
    rerollPenalty: 0,
    maxDiceOverride: null,
    allRoundsBoss: false,
    tagline: 'The base run. No twists.',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    color: '#f97316',
    lives: 3,
    thresholdBase: 8,
    thresholdGrowth: 1.45,
    thresholdMultiplier: 2,
    relicCap: 5,
    shardMultiplier: 1,
    rerollPenalty: 0,
    maxDiceOverride: null,
    allRoundsBoss: false,
    tagline: 'Ember, but every target is doubled.',
  },
  {
    id: 'inferno',
    name: 'Inferno',
    color: '#dc2626',
    lives: 3,
    thresholdBase: 8,
    thresholdGrowth: 1.45,
    thresholdMultiplier: 2,
    relicCap: 5,
    shardMultiplier: 1,
    rerollPenalty: 1,
    maxDiceOverride: 4,
    allRoundsBoss: false,
    tagline: 'Blaze, but 1 fewer reroll and a 4-die pool cap.',
  },
  {
    id: 'cataclysm',
    name: 'Cataclysm',
    color: '#7c3aed',
    lives: 3,
    thresholdBase: 8,
    thresholdGrowth: 1.45,
    thresholdMultiplier: 3,
    relicCap: 5,
    shardMultiplier: 1,
    rerollPenalty: 1,
    maxDiceOverride: 4,
    allRoundsBoss: true,
    tagline: 'Inferno, but every round is a boss round and targets triple.',
  },
]

export function difficultyById(id) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[0]
}
