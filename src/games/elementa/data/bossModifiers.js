// Boss round twists (GDD §16, §24). Deliberately modeled as objects shaped
// exactly like a relic (an `effects` bag) rather than a new system: the
// scoring engine and reducer already read relic effects via relicEffects(),
// so a boss modifier just gets merged into that list for the duration of
// the boss round (see `effectiveRelics` in engine/gameReducer.js). It is
// never added to state.relics itself, so it can't be sold or shown as owned.
//
// `tier` sets when a twist can appear: tier 1 from the first boss (round
// 5), tier 2 from round 10. The final round is always Primordial; past the
// door, rounds 20, 25 and 30 belong to the Wardens (tier 4).
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
    // Named after beta tester Ermal. Genuinely does nothing.
    id: 'ermal',
    tier: 1,
    name: 'Ermal the Unbothered',
    description: 'Does absolutely nothing. Enjoy the break.',
    effects: {},
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

// The Primordial path's last battle (EXPANSION.md B1): a gauntlet inside
// round 15, one god at a time, each turning its own drawback (B4) on you.
// `target` scales the normal round-15 target (Claude's spec).
export const GOD_TRIALS = [
  {
    id: 'gaea',
    tier: 3,
    stage: 1,
    target: 0.7,
    name: 'Gaea',
    description: 'Your Earth-family dice score -5 (-10 on a 1).',
    effects: { earthCurse: true },
  },
  {
    id: 'ognen',
    tier: 3,
    stage: 2,
    target: 0.9,
    name: 'Ognen',
    description: 'Your Fire-family dice fizzle on 1, 2 and 3.',
    effects: { fireFizzleUpTo: 3 },
  },
  {
    id: 'varuna',
    tier: 3,
    stage: 3,
    target: 1.1,
    name: 'Varuna',
    description: '1s come up 50% more often on every die.',
    effects: { varunaCurse: true },
  },
  {
    id: 'zephyr',
    tier: 3,
    stage: 4,
    target: 1.4,
    name: 'Zephyr',
    description: 'Your Fire-family dice explode half as often, and sets need one more matching die.',
    effects: { fireExplodeHalf: true, setsNeedExtra: 1 },
  },
]

// The Split path's last battle (B1, Claude's spec): the Primordial at full
// strength, fusing your pure dice back together as you reroll.
export const UNBOUND_TARGET = 1.5

// The six Wardens of the Firmament (EXPANSION.md H2): tier 4, at rounds
// 20, 25 and 30 past the door. Each guards one Mythic die (`guards`), which
// the file unlocks the first time it falls.
export const WARDENS = [
  {
    id: 'dawn',
    tier: 4,
    guards: 'light',
    name: 'The Dawn',
    description: 'Overexposure: dice showing their max face score 0.',
    effects: { maxFaceZero: true },
  },
  {
    id: 'umbra',
    tier: 4,
    guards: 'darkness',
    name: 'The Umbra',
    description: 'Faces are hidden until you cast, and every reroll swallows one unheld die for the round.',
    effects: { hideFaces: true, swallowOnReroll: true },
  },
  {
    id: 'clockwork',
    tier: 4,
    guards: 'time',
    name: 'The Clockwork',
    description: 'A 90-second countdown. At 0, whatever is on the table is cast.',
    effects: { countdown: 90 },
  },
  {
    id: 'expanse',
    tier: 4,
    guards: 'space',
    name: 'The Expanse',
    description: 'The order of your dice shuffles after every reroll.',
    effects: { shuffleOnReroll: true },
  },
  {
    id: 'maelstrom',
    tier: 4,
    guards: 'chaos',
    name: 'The Maelstrom',
    description: 'After every reroll, one die that just rolled becomes a random pure element for the round.',
    effects: { maelstrom: true },
  },
  {
    id: 'hollow',
    tier: 4,
    guards: 'void',
    name: 'The Hollow',
    description: 'Every relic is sealed and consumables cannot be used this round.',
    effects: { sealAllRelics: true, noConsumables: true },
  },
]

export const WARDEN_IDS = WARDENS.map((w) => w.id)

// Which Wardens a path faces (H1): Set I on its first Firmament run, Set II
// on a later one, at rounds 20, 25 and 30. The Neutral sets are Claude's
// proposal (Open for Carlos).
export const WARDEN_SETS = {
  split: [
    ['dawn', 'clockwork', 'expanse'],
    ['umbra', 'maelstrom', 'hollow'],
  ],
  primordial: [
    ['umbra', 'maelstrom', 'hollow'],
    ['dawn', 'clockwork', 'expanse'],
  ],
  neutral: [
    ['dawn', 'umbra', 'clockwork'],
    ['expanse', 'maelstrom', 'hollow'],
  ],
}

// The Warden rounds and their targets: the round's normal target times
// this (H2, Claude's default).
export const WARDEN_ROUNDS = [20, 25, 30]
export const WARDEN_TARGET = { 20: 1, 25: 1.1, 30: 1.25 }

/** The Warden waiting at `round` for this path and set, or null. */
export function wardenFor(path, set, round) {
  const i = WARDEN_ROUNDS.indexOf(round)
  if (i === -1) return null
  const id = (WARDEN_SETS[path] ?? WARDEN_SETS.neutral)[(set || 1) - 1][i]
  return WARDENS.find((w) => w.id === id) ?? null
}

export function bossById(id) {
  return BOSS_MODIFIERS.find((b) => b.id === id) ?? GOD_TRIALS.find((b) => b.id === id) ?? WARDENS.find((b) => b.id === id)
}

export function isBossRound(round, difficulty) {
  if (difficulty?.allRoundsBoss) return round > 0
  return round > 0 && round % 5 === 0
}
