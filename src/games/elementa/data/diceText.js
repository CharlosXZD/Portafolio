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
  chrono: T('Time stumbles once and tries again. A 1 rolls again until it is not a 1.', 'El tiempo tropieza y lo intenta otra vez. Un 1 se vuelve a tirar hasta que deja de serlo.', ['rewind']),
  beacon: T('A light left on for its neighbors. The dice beside it score x1.5.', 'Una luz encendida para sus vecinos. Los dados a su lado anotan x1.5.', ['boost']),
  prism: T('It splits one light into four. Reacts as every element at once.', 'Parte una luz en cuatro. Reacciona como todos los elementos a la vez.', ['reaction']),
  bullion: T('A bar of stored Mult. It scores nothing, but pays your final Mult in Shards on a clear.', 'Una barra de Mult guardado. No anota, pero paga tu Mult final en Fragmentos al superar la ronda.', ['payout']),
  masquerade: T('It wears its neighbor\'s face. Copies the abilities and score of the die on its left.', 'Se pone la cara de su vecino. Copia las habilidades y el puntaje del dado a su izquierda.', ['copy', 'mirror']),
  chameleon: T("Borrows the left die's abilities and the right die's score.", 'Toma las habilidades del dado izquierdo y el puntaje del derecho.', ['copy', 'mirror']),

  gaea: T('The Earth god, bound into a die. Adds the faces of her whole family, and weighs them down.', 'La diosa de la Tierra, atada a un dado. Suma las caras de toda su familia, y las hunde.', ['divine', 'wild', 'patience']),
  ognen: T('The Fire god, bound into a die. Burns on any high face and goes out on a low one.', 'El dios del Fuego, atado a un dado. Arde con cualquier cara alta y se apaga con una baja.', ['divine', 'explodes', 'fizzles']),
  varuna: T('The Water god, bound into a die. Any die can lock for free, but her 1 floods them all.', 'La diosa del Agua, atada a un dado. Todo dado se bloquea gratis, pero su 1 los inunda a todos.', ['divine', 'freelock', 'refund']),
  zephyr: T('The Air god, bound into a die. Every set rises a step, but Fire burns less.', 'El dios del Aire, atado a un dado. Cada set sube un escalón, pero el Fuego arde menos.', ['divine', 'wild', 'sets', 'drift']),
  primordial_die: T("The dreamer's own die, lent to you. Every Aether power, and a share of each god's.", 'El dado del soñador, prestado. Todo el poder del Éter y una parte del de cada dios.', ['divine', 'explodes', 'freelock', 'chain', 'copy', 'sets', 'doubles', 'fizzles', 'refund', 'kindling', 'drift', 'patience']),
}

export function diceText(elementId, lang = 'en') {
  const entry = DICE_TEXT[elementId]
  if (!entry) return { short: '', tags: [] }
  return { short: entry.short[lang] ?? entry.short.en, tags: entry.tags }
}
