// One entry per die (EXPANSION.md P5 to P9): the short description shown on
// click (at most two short sentences, a touch of the world's lore) and the
// keyword tags (data/keywords.js). The flag-by-flag text of the full view
// is not repeated here: it is generated from the die's flags by
// describeElement() in data/elements.js, so it can never drift from the
// rules. `tags` lists every keyword the die uses, most defining first.
const T = (en, es, tags) => ({ short: { en, es }, tags })

export const DICE_TEXT = {
  earth: T('Dependable as the ground itself. Waiting a reroll out makes it stronger.', 'Firme como el suelo mismo. Esperar un reroll la hace más fuerte.', ['patience']),
  fire: T('A spark from the first Split. It explodes on its top face, but a 1 burns it out.', 'Una chispa de la primera División. Explota en su cara máxima, pero un 1 la apaga.', ['explodes', 'fizzles', 'kindling']),
  water: T('It remembers every shape it has held. It locks for free and gives a reroll back.', 'Recuerda cada forma que ha tenido. Se bloquea gratis y te devuelve un reroll.', ['freelock', 'refund']),
  air: T('A breath no Caster could bind. It calls matching sets, and you can nudge it.', 'Un aliento que ningún Lanzador pudo atar. Llama sets iguales y puedes empujarlo.', ['sets', 'drift']),

  lightning: T("A Storm's first word. It explodes like Fire and calls sets like Air.", 'La primera palabra de una Tormenta. Explota como el Fuego y llama sets como el Aire.', ['explodes', 'fizzles', 'sets', 'kindling', 'drift']),
  ice: T('Water that held its breath. It locks for free, refunds the reroll, and calls sets.', 'Agua que contuvo el aliento. Se bloquea gratis, devuelve el reroll y llama sets.', ['freelock', 'refund', 'sets', 'drift']),
  steel: T("Fire hardened on Earth's anvil. It explodes and never burns out.", 'Fuego endurecido en el yunque de la Tierra. Explota y nunca se apaga.', ['explodes', 'patience']),
  mud: T('Water that sank into the soil. Lock it and its neighbor locks too, for free.', 'Agua que se hundió en la tierra. Bloquéalo y su vecino se bloquea también, gratis.', ['chain', 'freelock', 'refund', 'patience']),
  steam: T('Fire and Water in one breath. It explodes, and a reroll may copy it onto another die.', 'Fuego y Agua en un solo suspiro. Explota, y un reroll puede copiarlo a otro dado.', ['explodes', 'fizzles', 'copy', 'kindling']),
  crystal: T('Earth that learned the wind. Inside a set, it counts double.', 'Tierra que aprendió del viento. Dentro de un set, cuenta doble.', ['doubles', 'sets', 'drift', 'patience']),

  storm: T('Fire, Water and Air in one temper. It explodes, locks for free, and calls sets.', 'Fuego, Agua y Aire en un solo temple. Explota, se bloquea gratis y llama sets.', ['explodes', 'freelock', 'sets', 'fizzles', 'refund', 'kindling', 'drift']),
  obsidian: T('Fire that Water cooled into glass. It explodes without burning out, and can copy itself.', 'Fuego que el Agua enfrió en vidrio. Explota sin apagarse y puede copiarse.', ['explodes', 'copy', 'patience']),
  magma: T('Fire pressed under Earth. It explodes, and inside a set it counts double.', 'Fuego apretado bajo la Tierra. Explota, y dentro de un set cuenta doble.', ['explodes', 'doubles', 'sets', 'drift', 'patience']),
  monsoon: T('A season with a memory. Lock it and its neighbor locks too, and both feed sets.', 'Una estación con memoria. Bloquéalo y su vecino también, y ambos alimentan los sets.', ['chain', 'freelock', 'sets', 'refund', 'drift', 'patience']),

  aether: T('Every piece of the Split, whole again. It carries every mechanic, one per run.', 'Cada pieza de la División, entera otra vez. Lleva todos los mecanismos, solo uno por partida.', ['explodes', 'freelock', 'chain', 'copy', 'sets', 'doubles', 'fizzles', 'refund', 'kindling', 'drift', 'patience']),

  midas: T('Not made for scoring. Clear the round and it pays its face in Shards.', 'No es para anotar. Si superas la ronda, paga su cara en Fragmentos.', ['payout']),
  sapling: T('A seed the Casters forgot. Held through rerolls, it grows.', 'Una semilla que los Lanzadores olvidaron. Guardado entre rerolls, crece.', ['grows']),
  mirror: T('It shows what stands beside it. Copies the score of the die to its left.', 'Muestra lo que tiene al lado. Copia el puntaje del dado a su izquierda.', ['mirror']),
  conduit: T('A channel between neighbors. Its two neighbors react together, doubled.', 'Un canal entre vecinos. Sus dos vecinos reaccionan entre sí, al doble.', ['reaction']),
  kairos: T('The right moment, caught twice. A 1 rolls again until it is not a 1.', 'El momento justo, atrapado dos veces. Un 1 se vuelve a tirar hasta que deja de serlo.', ['rewind']),
  beacon: T('A light left on for its neighbors. The dice beside it score x1.5.', 'Una luz encendida para sus vecinos. Los dados a su lado anotan x1.5.', ['boost']),
  prism: T('It splits one light into four. Reacts as every element at once.', 'Parte una luz en cuatro. Reacciona como todos los elementos a la vez.', ['reaction']),
  bullion: T('A bar of stored Mult. It scores nothing, but pays your final Mult in Shards on a clear.', 'Una barra de Mult guardado. No anota, pero paga tu Mult final en Fragmentos al superar la ronda.', ['payout']),
  masquerade: T('It wears its neighbor\'s face. Copies the abilities and score of the die on its left.', 'Se pone la cara de su vecino. Copia las habilidades y el puntaje del dado a su izquierda.', ['copy', 'mirror']),
  chameleon: T("Borrows the left die's abilities and the right die's score.", 'Toma las habilidades del dado izquierdo y el puntaje del derecho.', ['copy', 'mirror']),

  gaea: T('The Earth god, bound into a die. Adds the faces of her whole family, and weighs them down.', 'La diosa de la Tierra, atada a un dado. Suma las caras de toda su familia, y las hunde.', ['divine', 'wild', 'patience']),
  ognen: T('The Fire god, bound into a die. Burns on any high face and goes out on a low one.', 'El dios del Fuego, atado a un dado. Arde con cualquier cara alta y se apaga con una baja.', ['divine', 'explodes', 'fizzles']),
  varuna: T('The Water god, bound into a die. Any die can lock for free, but the tide pulls every roll toward 1.', 'La diosa del Agua, atada a un dado. Todo dado se bloquea gratis, pero la marea empuja cada tirada hacia el 1.', ['divine', 'freelock', 'refund']),
  zephyr: T('The Air god, bound into a die. Every set rises a step, but Fire burns less.', 'El dios del Aire, atado a un dado. Cada set sube un escalón, pero el Fuego arde menos.', ['divine', 'wild', 'sets', 'drift']),
  primordial_die: T("The dreamer's own die, lent to you. Every Aether power, and a share of each god's.", 'El dado del soñador, prestado. Todo el poder del Éter y una parte del de cada dios.', ['divine', 'explodes', 'freelock', 'chain', 'copy', 'sets', 'doubles', 'fizzles', 'refund', 'kindling', 'drift', 'patience']),

  // The Firmament (EXPANSION.md H3 to H5).
  chrono: T('Time itself, wound tight. Any 1 rewinds the whole table, again and again, and you keep the better roll.', 'El tiempo mismo, bien tenso. Cualquier 1 rebobina toda la mesa, una y otra vez, y te quedas con la mejor tirada.', ['loop']),
  light: T('The first dawn, kept in a die. Nothing near it falls below its face.', 'El primer amanecer, guardado en un dado. Nada a su alrededor cae por debajo de su cara.', ['mythic', 'floor']),
  darkness: T('What the light leaves behind. It swallows its neighbors and turns them into Mult.', 'Lo que la luz deja atrás. Se traga a sus vecinos y los vuelve Multiplicador.', ['mythic', 'devour']),
  time: T('A moment you can take back. Undo a reroll once a round, and save the rest for later.', 'Un momento que puedes recuperar. Deshaz un reroll una vez por ronda, y guarda el resto para después.', ['mythic', 'undo']),
  space: T('The distance between things, folded. Its neighbors and both ends all touch.', 'La distancia entre las cosas, doblada. Sus vecinos y ambos extremos se tocan.', ['mythic', 'reaction', 'warp']),
  chaos: T('Never the same die twice. Every roll it becomes something else.', 'Nunca el mismo dado dos veces. En cada tirada se vuelve otra cosa.', ['mythic', 'shift']),
  void: T('Absence with an appetite. It scores nothing, and every empty slot feeds your Mult.', 'Una ausencia con hambre. No anota nada, y cada espacio vacío alimenta tu Multiplicador.', ['mythic', 'empty']),
  entropy: T('Every Mythic die and Aether, forged into the end of all things.', 'Todos los dados Míticos y el Éter, forjados en el fin de todas las cosas.', ['mythic']),
  // The Celestial dice (EXPANSION.md I1).
  comet: T('A star that burned out long ago and is still falling. Its biggest rolls blaze, and count twice.', 'Una estrella que se apagó hace siglos y aún cae. Sus tiradas más altas arden, y cuentan doble.', ['explodes', 'burst']),
  pulsar: T('A dead star that ticks like a clock. Every reroll makes it hit harder.', 'Una estrella muerta que late como un reloj. Cada reroll la hace golpear más fuerte.', ['pulse']),
  satellite: T('It scores nothing and lifts everyone near it.', 'No anota nada y levanta a todo el que tiene cerca.', ['boost']),
  quasar: T('The brightest thing in the sky, and all of it goes to Mult. Only one can shine.', 'Lo más brillante del cielo, y todo va al Mult. Solo uno puede brillar.', ['flare']),
  zenith: T('The highest point the Casters ever reached. Holding it buys you more time.', 'El punto más alto que los Lanzadores alcanzaron. Tenerlo te da más tiempo.', ['rerolls']),
  // The Firmament's base elements and their fusions (K1, K4).
  glimmer: T('A spark of the first dawn, small enough to hold. It keeps its neighbors from going out.', 'Una chispa del primer amanecer, tan pequeña que cabe en la mano. Evita que sus vecinos se apaguen.', ['cosmic', 'steady']),
  gloom: T('A little of the night. It eats the die on its right and keeps half of it as Mult.', 'Un poco de la noche. Se come al dado de su derecha y guarda la mitad como Multiplicador.', ['cosmic', 'devour']),
  moment: T('One moment, saved for later. One more reroll every round.', 'Un momento, guardado para después. Un reroll más cada ronda.', ['cosmic', 'undo']),
  reach: T('A little distance, folded. It reaches the dice two places away.', 'Un poco de distancia, doblada. Alcanza los dados a dos lugares.', ['cosmic', 'reaction']),
  flux: T('Never the same element twice. Each roll it is Fire, Water, Earth or Air.', 'Nunca el mismo elemento dos veces. En cada tirada es Fuego, Agua, Tierra o Aire.', ['cosmic', 'shift']),
  nil: T('A small absence. It scores nothing and feeds on your empty dice slots.', 'Una pequeña ausencia. No anota nada y se alimenta de tus espacios de dado vacíos.', ['cosmic', 'empty']),
  shadow: T('Light and dark in one die. It eats its left neighbor and steadies its right one.', 'Luz y oscuridad en un dado. Se come a su vecino izquierdo y sostiene al derecho.', ['devour', 'steady']),
  continuum: T('Time that loops through space. Your pool becomes a ring.', 'Tiempo que da la vuelta por el espacio. Tu reserva se vuelve un anillo.', ['reaction', 'undo']),
  oblivion: T('It forgets your weakest die, and remembers it as Mult.', 'Olvida tu dado más débil, y lo recuerda como Multiplicador.', ['devour', 'empty']),
  alba: T('The first light of a new day. Nothing rolls below 2, and the first reroll is free.', 'La primera luz de un día nuevo. Nada sale por debajo de 2, y el primer reroll es gratis.', ['floor', 'undo']),
  anomaly: T('Something that should not happen, happening. After a reroll, one more die rolls again.', 'Algo que no debería pasar, pasando. Tras un reroll, un dado más se tira de nuevo.', ['volatile', 'shift']),
  singularity: T('Everything falls toward it. Its neighbors score double; it scores nothing.', 'Todo cae hacia ella. Sus vecinos anotan el doble; ella no anota nada.', ['volatile', 'boost']),
  abyss: T('A hole in the table. Its neighbors fall in, and empty slots feed it.', 'Un agujero en la mesa. Sus vecinos caen dentro, y los espacios vacíos lo alimentan.', ['volatile', 'devour', 'empty']),
  dead_star: T('What is left when a fusion collapses. It weighs on everything around it.', 'Lo que queda cuando una fusión colapsa. Pesa sobre todo lo que la rodea.', ['empty']),
}

export function diceText(elementId, lang = 'en') {
  const entry = DICE_TEXT[elementId]
  if (!entry) return { short: '', tags: [] }
  return { short: entry.short[lang] ?? entry.short.en, tags: entry.tags }

}
