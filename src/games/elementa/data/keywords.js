// Keyword tags (EXPANSION.md P5 to P9): the colored #Tags on a die's short
// and full descriptions. Each has a one-line definition, shown when you
// hover or tap the tag. The tags a die carries live in data/diceText.js.
// { id, label, color, definition } with bilingual label and definition.
const K = (id, color, label, definition) => ({ id, color, label, definition })
const L = (en, es) => ({ en, es })

export const KEYWORDS = Object.fromEntries(
  [
    K('explodes', '#ff7a45', L('Explodes', 'Explota'), L('Rolling its top face rolls again and adds the new roll, chaining.', 'Sacar su cara máxima tira otra vez y suma la nueva tirada, en cadena.')),
    K('fizzles', '#d9604d', L('Fizzles', 'Apagado'), L('A die that rolls a 1 scores nothing this round.', 'Un dado que saca un 1 no anota nada esta ronda.')),
    K('kindling', '#ffb36b', L('Kindling', 'Yesca'), L('A Fire-family die that fizzles pays back +1 reroll.', 'Un dado de la familia Fuego que se apaga devuelve +1 reroll.')),
    K('drift', '#cfe8f2', L('Drift', 'Deriva'), L('Once per round, nudge an Air-family die up or down by 1, or to its top face, for free.', 'Una vez por ronda, mueve un dado de la familia Aire 1 arriba o abajo, o hasta su cara máxima, gratis.')),
    K('tide', '#4aa0ff', L('Tide', 'Marea'), L('A locked Water-family die also sends half its score to Mult.', 'Un dado de la familia Agua bloqueado también manda la mitad de su puntaje al Mult.')),
    K('patience', '#c89a5c', L('Patience', 'Paciencia'), L('An Earth-family die gains +2 for every reroll it sits out this round.', 'Un dado de la familia Tierra gana +2 por cada reroll que se queda fuera esta ronda.')),
    K('freelock', '#6fb6ff', L('FreeLock', 'BloqueoLibre'), L('Can lock its face in place without spending a reroll.', 'Puede fijar su cara sin gastar un reroll.')),
    K('refund', '#7ae0c8', L('Refund', 'Reembolso'), L('Locking it gives you +1 reroll back.', 'Bloquearlo te devuelve +1 reroll.')),
    K('sets', '#9fe3ff', L('Sets', 'Sets'), L('Switches on the matching-set bonus for the whole pool.', 'Activa el bono de sets iguales para toda la reserva.')),
    K('wild', '#e9dcff', L('Wild', 'Comodín'), L('Counts as any face when forming a set.', 'Cuenta como cualquier cara al formar un set.')),
    K('reaction', '#ff7ad9', L('Reaction', 'Reacción'), L('Changes how it reacts with the dice next to it.', 'Cambia cómo reacciona con los dados de al lado.')),
    K('copy', '#f3d1ff', L('Copy', 'Copia'), L('Duplicates a result or an ability from another die.', 'Duplica un resultado o una habilidad de otro dado.')),
    K('mirror', '#b8c4d6', L('Mirror', 'Espejo'), L('Takes the score of a neighboring die as its own.', 'Toma como suyo el puntaje de un dado vecino.')),
    K('chain', '#8fa6f0', L('Chain', 'Cadena'), L('Locking it also locks the next die, for free.', 'Bloquearlo también bloquea el siguiente dado, gratis.')),
    K('divine', '#ffd166', L('Divine', 'Divino'), L('A god. Forge-only, one at a time, with a power and a price.', 'Un dios. Solo se forja, uno a la vez, con un poder y un precio.')),
    // Arcane dice and Crystal need a few more words of their own.
    K('grows', '#6fbf4a', L('Grows', 'Crece'), L('Gains +2 for every reroll it stays held.', 'Gana +2 por cada reroll que se queda guardado.')),
    K('payout', '#e8b923', L('Payout', 'Pago'), L('Scores nothing, but pays Shards when you clear the round.', 'No anota, pero paga Fragmentos al superar la ronda.')),
    K('rewind', '#c9a0ff', L('Rewind', 'Rebobina'), L('A rolled 1 rolls again until it is no longer a 1.', 'Un 1 se vuelve a tirar hasta que deja de ser 1.')),
    K('boost', '#ffb347', L('Boost', 'Impulso'), L('Raises the score of the dice beside it.', 'Sube el puntaje de los dados a su lado.')),
    K('doubles', '#b28df2', L('Doubles', 'Doble'), L('Counts double when it is part of a matching set.', 'Cuenta doble cuando forma parte de un set igual.')),
    // The Firmament (EXPANSION.md H3 to H5).
    K('mythic', '#ff4fd8', L('Mythic', 'Mítico'), L('No element. One of each kind per run, and it cannot be copied.', 'Sin elemento. Uno de cada tipo por partida, y no se puede copiar.')),
    K('warp', '#a66bff', L('Warp', 'Warp'), L('Does not count toward your dice cap. At most 3 Warp dice at once.', 'No cuenta para tu límite de dados. Como mucho 3 dados Warp a la vez.')),
    K('loop', '#8f7bff', L('Loop', 'Bucle'), L('Any 1 rerolls every unheld die for free, and the better pool stays.', 'Cualquier 1 vuelve a tirar gratis todo dado no guardado, y se queda la mejor reserva.')),
    K('floor', '#fff2a8', L('Floor', 'Piso'), L('No die can score below this face.', 'Ningún dado puede anotar menos que esta cara.')),
    K('devour', '#6a4fb8', L('Devour', 'Devora'), L('Its neighbors score 0, and their score becomes Mult.', 'Sus vecinos anotan 0, y su puntaje se vuelve Multiplicador.')),
    K('undo', '#b9a6ff', L('Undo', 'Deshacer'), L('Takes back your last reroll, and refunds it.', 'Deshace tu último reroll, y lo devuelve.')),
    K('shift', '#ff3fa4', L('Shift', 'Cambia'), L('Becomes a different random die on every roll.', 'Se vuelve otro dado al azar en cada tirada.')),
    K('empty', '#8a7aa8', L('Empty', 'Vacío'), L('Feeds on the empty slots you have.', 'Se alimenta de los espacios vacíos que tienes.')),
    // EXPANSION.md K1, K4, K6.
    K('cosmic', '#c9b8ff', L('Cosmic', 'Cósmico'), L('A base element of the Firmament, a family of its own.', 'Un elemento base del Firmamento, una familia propia.')),
    K('steady', '#fff3b8', L('Steady', 'Firme'), L('Keeps the dice beside it from fizzling.', 'Evita que los dados de al lado se apaguen.')),
    K('volatile', '#ff8a6b', L('Volatile', 'Volátil'), L('Forging it can collapse into a Dead Star (25%). A Catalyst prevents it.', 'Al forjarlo puede colapsar en una Estrella Muerta (25%). Un Catalizador lo evita.')),
    K('rune', '#d6c4ff', L('Rune', 'Runa'), L('Inscribed on one number of a die: it works only when the die shows that number.', 'Inscrita en un número de un dado: solo funciona cuando el dado muestra ese número.')),
    K('burst', '#8fd8ff', L('Burst', 'Estallido'), L('Scores its whole total twice when it explodes.', 'Anota todo su total dos veces cuando explota.')),
    K('pulse', '#ff8fd0', L('Pulse', 'Pulso'), L('Gains Base for every reroll made this round.', 'Gana Base por cada reroll hecho esta ronda.')),
    K('flare', '#c58cff', L('Flare', 'Destello'), L('Its face goes to Mult instead of Base.', 'Su cara va al Mult en lugar de la Base.')),
    K('poker', '#ff7a8a', L('Poker', 'Póker'), L('Faces 9 to Ace. Poker dice together make hands that add Mult.', 'Caras del 9 al As. Los dados de póker juntos hacen manos que suman Mult.')),
    K('charged', '#ffd84a', L('Charged', 'Cargado'), L('Half of its face is also added to your Mult.', 'La mitad de su cara también se suma a tu Mult.')),
    K('summon', '#b8a0ff', L('Summon', 'Invoca'), L('Creates a temporary die that lasts the round and takes no slot.', 'Crea un dado temporal que dura la ronda y no ocupa espacio.')),
    K('rerolls', '#ffe08a', L('Rerolls', 'Rerolls'), L('Gives you extra rerolls while it is in your pool.', 'Te da rerolls extra mientras esté en tu reserva.')),
    // The Runes (J3), shown on a die that carries one.
    K('sigil', '#f4e3a8', L('Sigil', 'Sigilo'), L('Symbols instead of numbers: no sets, no reactions, no Base. Each face does its own thing.', 'Símbolos en lugar de números: sin sets, sin reacciones, sin Base. Cada cara hace lo suyo.')),
    K('scale', '#f4e3a8', L('Tip the scales', 'Inclina la balanza'), L('Raises your Base to the expected average of your number dice, if it came out lower.', 'Sube tu Base al promedio esperado de tus dados numéricos, si salió menor.')),
    K('spiral', '#b08cff', L('Spiral', 'Espiral'), L('Rolls again for free; each Spiral in the chain adds Mult.', 'Se tira otra vez gratis; cada Espiral en la cadena suma Mult.')),
    K('law', '#ffd166', L('Law', 'Ley'), L('Rewrites one scoring rule. Only one Law at a time, and it takes no relic slot.', 'Reescribe una regla de puntaje. Solo una Ley a la vez, y no ocupa espacio de reliquia.')),
    K('rune_wild', '#e9dcff', L('Wild', 'Comodín'), L('Rune: on its number, the die counts as any value for sets.', 'Runa: en su número, el dado cuenta como cualquier valor en los sets.')),
    K('rune_gold', '#ffd166', L('Gold', 'Oro'), L('Rune: on its number, the die pays 2 Shards each cast.', 'Runa: en su número, el dado paga 2 Fragmentos por lanzamiento.')),
    K('rune_link', '#8fe8d0', L('Link', 'Enlace'), L('Rune: on its number, the die reacts with both neighbors as the element that reacts best with each.', 'Runa: en su número, el dado reacciona con ambos vecinos como el elemento que mejor reacciona con cada uno.')),
    K('rune_double', '#ff9ad9', L('Double', 'Doble'), L('Rune: on its number, its score is also added to Mult.', 'Runa: en su número, su puntaje también se suma al Mult.')),
    K('rune_echo', '#9fd8ff', L('Echo', 'Eco'), L('Rune: on its number, the die scores twice.', 'Runa: en su número, el dado anota dos veces.')),
    K('rune_glass', '#d6f2ff', L('Glass', 'Cristal'), L('Rune: on its number, doubled score, but it may shatter after the cast.', 'Runa: en su número, puntaje doble, pero puede romperse tras el lanzamiento.')),
    K('rune_kinship', '#ffb8e8', L('Kinship', 'Parentesco'), L("Rune: on its number, counts as its left neighbor's element for reactions.", 'Runa: en su número, cuenta como el elemento de su vecino izquierdo para las reacciones.')),
    K('rune_ember', '#ff8a4d', L('Ember', 'Brasa'), L('Rune: its number is an exploding face.', 'Runa: su número es una cara que explota.')),
    K('rune_anchor', '#9fb4c8', L('Anchor', 'Ancla'), L('Rune: on its number, the die cannot fizzle.', 'Runa: en su número, el dado no puede apagarse.')),
  ].map((k) => [k.id, k]),
)

export const keywordById = (id) => KEYWORDS[id]
