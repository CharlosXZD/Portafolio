// Realm 3's dice (EXPANSION.md R3, R4): four Abstract base elements (bought),
// four Abstract fusions (Vesper's Forge), four Absolute dice (forged from 4 of
// an element plus Stardust, the recipe taught by a Rewriter) and the four
// number dice (B12, sold only here). The definitions are built into ELEMENTS
// in data/elements.js; the rules are in engine/scoring.js. All text is a DRAFT.
const L = (en, es) => ({ en, es })

export const ABSTRACT_BASE_IDS = ['abs_zero', 'abs_one', 'abs_infinity', 'abs_negation']
export const ABSTRACT_FUSION_IDS = ['bit', 'limit', 'parity', 'divergence']
export const ABSOLUTE_IDS = ['nun', 'monad', 'apeiron', 'janus']
export const NUMBER_DICE_IDS = ['twos_complement', 'reversed_bits', 'rolling_joke', 'undivisible']
export const ABSTRACT_IDS = [...ABSTRACT_BASE_IDS, ...ABSTRACT_FUSION_IDS]

export const ABSTRACT_PRICE = 14
export const ABSTRACT_FUSION_COST = 12
export const ABSOLUTE_FORGE_COST = 30
/** The most Mult Limit adds in a round (Q4). */
export const LIMIT_MULT_CAP = 20

// id: { name, flag key, tagline, parents / recipe, color, es }
export const ABSTRACT_DEFS = {
  abs_zero: { name: L('Zero', 'Cero'), flag: 'ABS_ZERO', color: '#9a9ab0', tagline: L("Scores nothing. The dice either side of it ignore the round's boss twist.", 'No anota nada. Los dados a sus lados ignoran el efecto del jefe de la ronda.') },
  abs_one: { name: L('One', 'Uno'), flag: 'ABS_ONE', color: '#e8e0c8', tagline: L('Wild: counts as any face for sets. Scores 1 Base for every die in your pool.', 'Comodín: cuenta como cualquier cara en los sets. Anota 1 Base por cada dado en tu reserva.') },
  abs_infinity: { name: L('Infinity', 'Infinito'), flag: 'ABS_INFINITY', color: '#8ad0ff', tagline: L('Its explosions have no chain cap, and each explosion adds +1 Mult for the rest of the run.', 'Sus explosiones no tienen tope de cadena, y cada explosión suma +1 Mult el resto de la partida.') },
  abs_negation: { name: L('Negation', 'Negación'), flag: 'ABS_NEGATION', color: '#ff9ad0', tagline: L('The dice either side of it count the better of their face and its opposite.', 'Los dados a sus lados cuentan la mejor entre su cara y su opuesta.') },
  bit: { name: L('Bit', 'Bit'), flag: 'BIT', parents: ['abs_zero', 'abs_one'], color: '#cfcfe8', tagline: L('Its neighbors ignore boss twists and count as any face for sets.', 'Sus vecinos ignoran los efectos de jefe y cuentan como cualquier cara en los sets.') },
  limit: { name: L('Limit', 'Límite'), flag: 'LIMIT', parents: ['abs_zero', 'abs_infinity'], color: '#9fb8ff', tagline: L('Scores nothing. Each explosion this round gives +1 Mult, up to +20.', 'No anota nada. Cada explosión de esta ronda da +1 Mult, hasta +20.') },
  parity: { name: L('Parity', 'Paridad'), flag: 'PARITY', parents: ['abs_one', 'abs_negation'], color: '#ffc8a0', tagline: L('Every even face in your pool scores double.', 'Toda cara par de tu reserva anota el doble.') },
  divergence: { name: L('Divergence', 'Divergencia'), flag: 'DIVERGENCE', parents: ['abs_infinity', 'abs_negation'], color: '#b8a0ff', tagline: L('A die that shows its lowest face gets a free reroll, and each time that happens +1 Mult.', 'Un dado que muestra su cara más baja recibe un reroll gratis, y cada vez que ocurre suma +1 Mult.') },
  nun: { name: L('Nun', 'Nun'), flag: 'NUN', base: 'abs_zero', teacher: 'zero', color: '#6a6a80', tagline: L('Every die ignores the boss twist.', 'Todo dado ignora el efecto del jefe.') },
  monad: { name: L('Monad', 'Mónada'), flag: 'MONAD', base: 'abs_one', teacher: 'axiom', color: '#fff0c0', tagline: L('Every die counts as any face for sets, and its score is multiplied by your dice count.', 'Todo dado cuenta como cualquier cara en los sets, y su puntaje se multiplica por tu cantidad de dados.') },
  apeiron: { name: L('Apeiron', 'Apeiron'), flag: 'APEIRON', base: 'abs_infinity', teacher: 'infinity', color: '#4aa8ff', tagline: L('Nothing is capped for you, and each explosion adds +2 Mult for good.', 'Nada tiene tope para ti, y cada explosión suma +2 Mult para siempre.') },
  janus: { name: L('Janus', 'Jano'), flag: 'JANUS', base: 'abs_negation', teacher: 'observer', color: '#ff6ab0', tagline: L('Every die counts the better of its face and its opposite.', 'Todo dado cuenta la mejor entre su cara y su opuesta.') },
  twos_complement: { name: L("Two's Complement", 'Complemento a Dos'), flag: 'TWOS', rarity: 'epic', price: 16, color: '#7affd8', tagline: L('If its face is even: doubles the score of both neighbors, and +2 Mult.', 'Si su cara es par: duplica el puntaje de ambos vecinos, y +2 Mult.') },
  reversed_bits: { name: L('Reversed Bits', 'Bits Invertidos'), flag: 'REVBITS', rarity: 'legendary', price: 30, color: '#ffb36b', tagline: L("Scores nothing. Every die that rolls has its face bit-reversed within its own bit width (a 1 on a d6 becomes a 4).", 'No anota nada. Todo dado que se tira tiene su cara con los bits invertidos dentro de su propio ancho (un 1 en un d6 se vuelve 4).') },
  rolling_joke: { name: L('Rolling Joke', 'Chiste Rodante'), flag: 'ROLLJOKE', rarity: 'epic', price: 16, color: '#ff8aff', tagline: L('Scores its face + 1 for every reroll you have made this run (shop rerolls count too).', 'Anota su cara + 1 por cada reroll que has hecho en la partida (los de la tienda cuentan).') },
  undivisible: { name: L('Undivisible', 'Indivisible'), flag: 'UNDIV', rarity: 'legendary', price: 30, color: '#c8ff7a', tagline: L('If its face is prime: its score is the square minus one (a 19 on a d20 is 360).', 'Si su cara es prima: su puntaje es el cuadrado menos uno (un 19 en un d20 vale 360).') },
}

export const ABSTRACT_ES = Object.fromEntries(Object.entries(ABSTRACT_DEFS).map(([id, d]) => [id, { name: d.name.es, tagline: d.tagline.es }]))
