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
]

export function reactionById(id) {
  return REACTIONS.find((r) => r.id === id)
}
