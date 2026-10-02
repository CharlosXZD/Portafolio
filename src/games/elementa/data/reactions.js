// Adjacency reactions (GDD §24): two dice sitting side by side react when
// between them they cover a reaction's pair of elements, and both actually
// score this roll (a fizzled Fire die doesn't react). Fusion dice bring
// their parents' elements, so one Lightning die can trigger several
// reactions with the right neighbor. Order your dice to chain them.
//
// `base` is flat Base Value, or 'lowerFace' / 'higherFace' to add one of
// the two dice's face values. `mult` is added to the Multiplier.
export const REACTIONS = [
  {
    id: 'resonance',
    name: 'Resonance',
    elements: null, // special: two dice of the exact same kind
    color: '#c8b6ff',
    base: 2,
    mult: 0,
    description: 'Two identical dice side by side: +2 Base.',
  },
  {
    id: 'kindle',
    name: 'Kindle',
    elements: ['fire', 'air'],
    color: '#ff8a3d',
    base: 0,
    mult: 1,
    description: 'Air feeds Fire: +1 Mult.',
  },
  {
    id: 'forge',
    name: 'Forge',
    elements: ['fire', 'earth'],
    color: '#d9892b',
    base: 'lowerFace',
    mult: 0,
    description: 'Fire tempers Earth: add the lower of the two faces to Base.',
  },
  {
    id: 'scald',
    name: 'Scald',
    elements: ['fire', 'water'],
    color: '#e8e0f0',
    base: 3,
    mult: 0.5,
    description: 'Water hits Fire: +3 Base and +0.5 Mult.',
  },
  {
    id: 'mist',
    name: 'Mist',
    elements: ['water', 'air'],
    color: '#9fe8e0',
    base: 0,
    mult: 0.5,
    description: 'Water rides the Air: +0.5 Mult.',
  },
  {
    id: 'bloom',
    name: 'Bloom',
    elements: ['water', 'earth'],
    color: '#6fbf4a',
    base: 'higherFace',
    mult: 0,
    description: 'Water feeds Earth: add the higher of the two faces to Base.',
  },
  {
    id: 'dust',
    name: 'Dust Devil',
    elements: ['earth', 'air'],
    color: '#c8a26a',
    base: 4,
    mult: 0,
    description: 'Air lifts Earth: +4 Base.',
  },
  // --- Secret reactions (GDD §26): only between specific fusion dice, and
  // hidden in the UI (shown as "???") until the player triggers one in a
  // cast, which discovers it for that save file. `pair` names the exact
  // dice; '*fusion' matches any double or triple fusion. ---
  {
    id: 'thunderhead',
    name: 'Thunderhead',
    secret: true,
    pair: ['lightning', 'steam'],
    color: '#8fa8ff',
    base: 0,
    mult: 2,
    description: 'Lightning beside Steam: a storm cloud forms. +2 Mult.',
  },
  {
    id: 'superconductor',
    name: 'Superconductor',
    secret: true,
    pair: ['lightning', 'ice'],
    color: '#bfefff',
    base: 5,
    mult: 1.5,
    description: 'Lightning beside Ice: current with no resistance. +5 Base, +1.5 Mult.',
  },
  {
    id: 'thermal_shock',
    name: 'Thermal Shock',
    secret: true,
    pair: ['ice', 'magma'],
    color: '#ff9a6a',
    base: 'bothFaces',
    mult: 1,
    description: 'Ice beside Magma: stone cracks apart. Add both faces to Base, +1 Mult.',
  },
  {
    id: 'geode',
    name: 'Geode',
    secret: true,
    pair: ['mud', 'crystal'],
    color: '#c79bff',
    base: 'bothFacesDouble',
    mult: 0,
    description: 'Mud beside Crystal: a hidden geode. Add both faces twice to Base.',
  },
  {
    id: 'railgun',
    name: 'Railgun',
    secret: true,
    pair: ['steel', 'lightning'],
    color: '#d0d8e0',
    base: 0,
    mult: 3,
    description: 'Steel beside Lightning: magnetic launch. +3 Mult.',
  },
  {
    id: 'hurricane',
    name: 'Hurricane',
    secret: true,
    pair: ['storm', 'monsoon'],
    color: '#7fb0ff',
    base: 8,
    mult: 3,
    description: 'Storm beside Monsoon: the sky breaks. +8 Base, +3 Mult.',
  },
  {
    id: 'caldera',
    name: 'Caldera',
    secret: true,
    pair: ['obsidian', 'magma'],
    color: '#ff6a3d',
    base: 'bothFacesDouble',
    mult: 1,
    description: 'Obsidian beside Magma: the volcano collapses. Add both faces twice to Base, +1 Mult.',
  },
  {
    id: 'ascension',
    name: 'Ascension',
    secret: true,
    pair: ['aether', '*fusion'],
    color: '#fff4c2',
    base: 10,
    mult: 3,
    description: 'Aether beside any fusion: the elements remember they were one. +10 Base, +3 Mult.',
  },
]

export const SECRET_REACTION_IDS = REACTIONS.filter((r) => r.secret).map((r) => r.id)

export function reactionById(id) {
  return REACTIONS.find((r) => r.id === id)
}
