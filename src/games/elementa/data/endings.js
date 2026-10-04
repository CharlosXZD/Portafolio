// Endings (EXPANSION.md B2, H1). Three per path: the Elementa ending, then
// Firmament I and Firmament II past the door. All text here is a DRAFT for
// Carlos to rewrite. `hint` is what a locked card says.

const L = (en, es) => ({ en, es })

export const ENDINGS = [
  {
    id: 'neutral',
    path: 'neutral',
    color: '#ffd166',
    boss: 'primordial',
    hint: L('Win a run.', 'Gana una partida.'),
    name: L('The Circle Holds', 'El Círculo Resiste'),
    text: L(
      'The Primordial sinks back into its dream, neither whole nor broken. The last Circle holds, for now. Somewhere past it, something older is listening.',
      'El Primordial vuelve a hundirse en su sueño, ni entero ni roto. El último Círculo resiste, por ahora. Más allá, algo más antiguo escucha.',
    ),
  },
  {
    id: 'split',
    path: 'split',
    color: '#9fd8ff',
    boss: 'primordial',
    hint: L('Win on the Split path: hold pure dice, take Aeris\'s blessings.', 'Gana en el camino de la División: guarda dados puros, toma las bendiciones de Aeris.'),
    name: L('The Split Holds Forever', 'La División Para Siempre'),
    text: L(
      'You held every piece apart while it fought to take them back. Fire, Water, Earth and Air stay four. Aeris smiles. Something beyond the Circle does not.',
      'Mantuviste cada pedazo separado mientras luchaba por recuperarlos. Fuego, Agua, Tierra y Aire siguen siendo cuatro. Aeris sonríe. Algo más allá del Círculo, no.',
    ),
  },
  {
    id: 'primordial',
    path: 'primordial',
    color: '#ff4d6d',
    boss: 'primordial',
    hint: L('Win on the Primordial path: forge fusions, deal with Nix.', 'Gana en el camino Primordial: forja fusiones, haz tratos con Nix.'),
    name: L('Made Whole', 'Uno Otra Vez'),
    text: L(
      'The four who broke it fall, one by one, and the die in your hand remembers what it was. The Primordial is whole again. Nix bows. The dream ends, and another begins.',
      'Los cuatro que lo rompieron caen, uno a uno, y el dado en tu mano recuerda lo que fue. El Primordial vuelve a ser uno. Nix se inclina. El sueño termina, y empieza otro.',
    ),
  },
  // --- The Firmament (H1): beat the round-30 Warden of a path's set. ---
  {
    id: 'firmament_neutral_1',
    path: 'neutral',
    set: 1,
    color: '#ffe8a3',
    boss: 'clockwork',
    name: L('The Frame Unbroken', 'El Marco Intacto'),
    text: L(
      'Past the last Circle, the Wardens kept the edges of the world. You walked between them without taking a side, and the frame held. Tobb says he has never sold anything this far out.',
      'Más allá del último Círculo, los Custodios guardaban los bordes del mundo. Caminaste entre ellos sin tomar partido, y el marco resistió. Tobb dice que nunca había vendido nada tan lejos.',
    ),
    hint: L('Go through the Neutral door and beat the Firmament.', 'Cruza la puerta Neutral y vence al Firmamento.'),
  },
  {
    id: 'firmament_neutral_2',
    path: 'neutral',
    set: 2,
    color: '#fff6d6',
    boss: 'hollow',
    name: L('Balance Beyond', 'Equilibrio Más Allá'),
    text: L(
      'The other three Wardens fall, and the Firmament settles like a scale coming to rest. Nothing is whole and nothing is broken. Somewhere, a pen waits for a hand.',
      'Los otros tres Custodios caen, y el Firmamento se asienta como una balanza que se detiene. Nada está entero y nada está roto. En algún lugar, una pluma espera una mano.',
    ),
    hint: L('Beat the Firmament on the Neutral path a second time.', 'Vence al Firmamento en el camino Neutral por segunda vez.'),
  },
  {
    id: 'firmament_split_1',
    path: 'split',
    set: 1,
    color: '#bfe7ff',
    boss: 'expanse',
    name: L('Order in the Heavens', 'Orden en los Cielos'),
    text: L(
      'Dawn, gears and distance: you set each Warden in its place, and the sky above the Split stays ordered. Aeris, in her true form, writes your name among the stars.',
      'Alba, engranajes y distancia: pusiste a cada Custodio en su lugar, y el cielo sobre la División sigue en orden. Aeris, en su verdadera forma, escribe tu nombre entre las estrellas.',
    ),
    hint: L('Go through the Split door and beat the Firmament.', 'Cruza la puerta de la División y vence al Firmamento.'),
  },
  {
    id: 'firmament_split_2',
    path: 'split',
    set: 2,
    color: '#e6f6ff',
    boss: 'hollow',
    name: L('The Long Division', 'La Larga División'),
    text: L(
      'Shadow, storm and emptiness were the last things that wanted the pieces back. You kept them apart, every one. The Split will outlast the stars it was written under.',
      'Sombra, tormenta y vacío eran lo último que quería recuperar los pedazos. Los mantuviste separados, a todos. La División durará más que las estrellas bajo las que se escribió.',
    ),
    hint: L('Beat the Firmament on the Split path a second time.', 'Vence al Firmamento en el camino de la División por segunda vez.'),
  },
  {
    id: 'firmament_primordial_1',
    path: 'primordial',
    set: 1,
    color: '#ff8a9d',
    boss: 'hollow',
    name: L('The Eclipse Market Closes', 'Cierra el Mercado del Eclipse'),
    text: L(
      'The Umbra, the Maelstrom and the Hollow open for you like doors. Nix closes his stall for the last time and follows you out. The dreamer stirs, closer to whole than ever.',
      'La Umbra, la Vorágine y el Hueco se abren para ti como puertas. Nix cierra su puesto por última vez y te sigue. El soñador se agita, más cerca de estar entero que nunca.',
    ),
    hint: L('Go through the Primordial door and beat the Firmament.', 'Cruza la puerta Primordial y vence al Firmamento.'),
  },
  {
    id: 'firmament_primordial_2',
    path: 'primordial',
    set: 2,
    color: '#ffc2cc',
    boss: 'expanse',
    name: L('Everything, Remembered', 'Todo, Recordado'),
    text: L(
      'Light, time and space were the last walls of the frame. They fall, and for a moment every element remembers being one thing. Then the moment passes. Not yet, it says. Not yet.',
      'La luz, el tiempo y el espacio eran los últimos muros del marco. Caen, y por un momento cada elemento recuerda haber sido una sola cosa. Luego el momento pasa. Todavía no, dice. Todavía no.',
    ),
    hint: L('Beat the Firmament on the Primordial path a second time.', 'Vence al Firmamento en el camino Primordial por segunda vez.'),
  },
]

/** The Firmament ending for a path and set (H1). */
export const firmamentEnding = (path, set) => `firmament_${path}_${set}`

// The visions after the first Neutral win are a story scene now (data/story.js,
// EXPANSION.md G Q4a).

export const ENDING_IDS = ENDINGS.map((e) => e.id)

/**
 * Which endings the Gallery and the loadout marks may show (v0.7.1 notes: a
 * new file must not reveal how many endings there are). None until the first
 * is reached. Then the ones reached, plus a hint for the next step: the
 * other two Elementa paths once the Neutral ending is seen, and a path's
 * Firmament I once its Elementa ending is seen, Firmament II after I.
 */
export function visibleEndingIds(reached = []) {
  if (!reached.length) return []
  return ENDINGS.filter((e) => {
    if (reached.includes(e.id)) return true
    if (!e.id.startsWith('firmament_')) return e.id === 'neutral' || reached.includes('neutral')
    const [, path, set] = e.id.split('_')
    return reached.includes(path) && (set === '1' || reached.includes(`firmament_${path}_1`))
  }).map((e) => e.id)
}

export function endingById(id) {
  return ENDINGS.find((e) => e.id === id)
}
