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
    K('drift', '#cfe8f2', L('Drift', 'Deriva'), L('Once per round, nudge an Air-family die up or down by 1, for free.', 'Una vez por ronda, mueve un dado de la familia Aire 1 arriba o abajo, gratis.')),
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
    K('loop', '#8f7bff', L('Loop', 'Bucle'), L('A 1 rerolls every unheld die for free, and the better pool stays.', 'Un 1 vuelve a tirar gratis todo dado no guardado, y se queda la mejor reserva.')),
    K('floor', '#fff2a8', L('Floor', 'Piso'), L('No die can score below this face.', 'Ningún dado puede anotar menos que esta cara.')),
    K('devour', '#6a4fb8', L('Devour', 'Devora'), L('Its neighbors score 0, and their score becomes Mult.', 'Sus vecinos anotan 0, y su puntaje se vuelve Multiplicador.')),
    K('undo', '#b9a6ff', L('Undo', 'Deshacer'), L('Takes back your last reroll, and refunds it.', 'Deshace tu último reroll, y lo devuelve.')),
    K('shift', '#ff3fa4', L('Shift', 'Cambia'), L('Becomes a different random die on every roll.', 'Se vuelve otro dado al azar en cada tirada.')),
    K('empty', '#8a7aa8', L('Empty', 'Vacío'), L('Feeds on the empty slots you have.', 'Se alimenta de los espacios vacíos que tienes.')),
  ].map((k) => [k.id, k]),
)

export const keywordById = (id) => KEYWORDS[id]
