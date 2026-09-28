// Boss round twists (GDD §16, §24). Deliberately modeled as objects shaped
// exactly like a relic (an `effects` bag) rather than a new system: the
// scoring engine and reducer already read relic effects via relicEffects(),
// so a boss modifier just gets merged into that list for the duration of
// the boss round (see `effectiveRelics` in engine/gameReducer.js). It is
// never added to state.relics itself, so it can't be sold or shown as owned.
//
// `tier` sets when a twist can appear: tier 1 from the first boss (round
// 5), tier 2 from round 10. The final round is always Primordial.
export const BOSS_MODIFIERS = [
  {
    id: 'calm_winds',
    tier: 1,
    name: 'Calm Winds',
    description: 'Explosions do not chain this round: max face still adds once, then stops.',
    effects: { noExplodeChain: true },
  },
  {
    id: 'grounded',
    tier: 1,
    name: 'Grounded',
    description: 'Matching sets grant no Multiplier this round.',
    effects: { noSetBonus: true },
  },
  {
    id: 'iron_grip',
    tier: 1,
    name: 'Iron Grip',
    description: 'Only 1 reroll allowed this round, no matter how many you own.',
    effects: { maxRerollsOverride: 1 },
  },
  {
    id: 'drought',
    tier: 1,
    name: 'Drought',
    description: 'No die can use a free lock this round.',
    effects: { noFreeLock: true },
  },
  {
    id: 'tax_collector',
    tier: 1,
    name: 'Tax Collector',
    description: 'Every reroll costs 1 Shard this round.',
    effects: { rerollShardCost: 1 },
  },
  {
    id: 'scatter',
    tier: 1,
    name: 'Scatter',
    description: 'Straights do not count this round. Pairs and threes still do.',
    effects: { noStraight: true },
  },
  {
    id: 'null_zone',
    tier: 2,
    name: 'Null Zone',
    // bannedElementId is resolved per-run when the boss round is picked
    // (see pickBossModifier), not fixed here.
    description: 'One of your elements scores nothing this round.',
    effects: { bannedElementId: null },
  },
  {
    id: 'gravity_well',
    tier: 2,
    name: 'Gravity Well',
    description: 'Faces above 4 score half this round.',
    effects: { highFaceHalf: true },
  },
  {
    id: 'the_pillar',
    tier: 2,
    name: 'The Pillar',
    description: 'Your highest-scoring die scores 0 this round.',
    effects: { highestDieZero: true },
  },
  {
    id: 'frostbite',
    tier: 2,
    name: 'Frostbite',
    description: 'One random die starts the round frozen on a 1.',
    effects: { frostbite: true },
  },
  {
    id: 'eclipse',
    tier: 2,
    name: 'Eclipse',
    description: 'Your dice faces are hidden until you cast.',
    effects: { hideFaces: true },
  },
  {
    id: 'silence',
    tier: 2,
    name: 'Silence',
    // sealedRelicId is resolved when picked; only offered if you own a relic.
    description: 'One of your relics is sealed and does nothing this round.',
    effects: { sealedRelicId: null },
  },
]

// The final boss. Its twist is drawn from this pool and changes every
// time you reroll (see REROLL_UNHELD).
export const PRIMORDIAL = {
  id: 'primordial',
  tier: 3,
  name: 'Primordial',
  description: 'The final boss. Its twist changes every time you reroll.',
  effects: {},
}
export const PRIMORDIAL_POOL = ['calm_winds', 'grounded', 'drought', 'tax_collector', 'scatter', 'gravity_well', 'the_pillar']

export function bossById(id) {
  return BOSS_MODIFIERS.find((b) => b.id === id)
}

export function isBossRound(round, difficulty) {
  if (difficulty?.allRoundsBoss) return round > 0
  return round > 0 && round % 5 === 0
}
