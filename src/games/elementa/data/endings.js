// Endings (EXPANSION.md B2). One card per path, and the visions of the four
// gods that follow the first Neutral win and grant their recipes. All text
// here is a DRAFT for Carlos to rewrite.

const L = (en, es) => ({ en, es })

export const ENDINGS = [
  {
    id: 'neutral',
    color: '#ffd166',
    boss: 'primordial',
    name: L('The Circle Holds', 'El Círculo Resiste'),
    text: L(
      'The Primordial sinks back into its dream, neither whole nor broken. The last Circle holds, for now. Somewhere past it, something older is listening.',
      'El Primordial vuelve a hundirse en su sueño, ni entero ni roto. El último Círculo resiste, por ahora. Más allá, algo más antiguo escucha.',
    ),
  },
  {
    id: 'split',
    color: '#9fd8ff',
    boss: 'primordial',
    name: L('The Split Holds Forever', 'La División Para Siempre'),
    text: L(
      'You held every piece apart while it fought to take them back. Fire, Water, Earth and Air stay four. Aeris smiles. Something beyond the Circle does not.',
      'Mantuviste cada pedazo separado mientras luchaba por recuperarlos. Fuego, Agua, Tierra y Aire siguen siendo cuatro. Aeris sonríe. Algo más allá del Círculo, no.',
    ),
  },
  {
    id: 'primordial',
    color: '#ff4d6d',
    boss: 'primordial',
    name: L('Made Whole', 'Uno Otra Vez'),
    text: L(
      'The four who broke it fall, one by one, and the die in your hand remembers what it was. The Primordial is whole again. Nix bows. The dream ends, and another begins.',
      'Los cuatro que lo rompieron caen, uno a uno, y el dado en tu mano recuerda lo que fue. El Primordial vuelve a ser uno. Nix se inclina. El sueño termina, y empieza otro.',
    ),
  },
]

// The visions after the first Neutral win, one god at a time.
export const VISIONS = [
  {
    id: 'gaea',
    name: L('Gaea', 'Gaea'),
    text: L('A mountain opens its eyes. "I held the ground still while they cut it apart."', 'Una montaña abre los ojos. "Yo sostuve el suelo quieto mientras lo partían."'),
  },
  {
    id: 'ognen',
    name: L('Ognen', 'Ognen'),
    text: L('A flame laughs. "I burned the first seam. It was the best thing I ever did."', 'Una llama ríe. "Yo quemé la primera costura. Fue lo mejor que he hecho."'),
  },
  {
    id: 'varuna',
    name: L('Varuna', 'Varuna'),
    text: L('A tide pulls at your dice. "I carried the pieces away so they could never touch."', 'Una marea tira de tus dados. "Yo me llevé los pedazos para que nunca se tocaran."'),
  },
  {
    id: 'zephyr',
    name: L('Zephyr', 'Zephyr'),
    text: L('A wind whispers your name. "We were four. We broke it. Now you know how."', 'Un viento susurra tu nombre. "Éramos cuatro. Lo rompimos. Ahora sabes cómo."'),
  },
]

export const ENDING_IDS = ENDINGS.map((e) => e.id)

export function endingById(id) {
  return ENDINGS.find((e) => e.id === id)
}
