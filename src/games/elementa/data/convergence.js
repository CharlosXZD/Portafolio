// The Convergence (EXPANSION.md Part T, v0.9.5): the place after round 45, the
// Rush, Pip's fight and the ghost duel. This file holds the numbers, the order
// of the fights, the bosses that only exist here (Pip and You), the ghost's
// moves and every line of text. The rules are in engine/gameReducer.js. All
// text is a DRAFT for Carlos to rewrite, and every string has English and Spanish.
import { WARDEN_SETS } from './bossModifiers.js'
import { REWRITER_SETS } from './realm3.js'

const L = (en, es) => ({ en, es })

/** What the file gets for arriving at the Unwritten (T1): Stardust at the start of every later run. */
export const ARRIVAL_STARDUST = 2

// --- The Rush (T2) ---

/** A Rush fight's target is this much of the best cast of the run so far, times the boss's own factor (Default). */
export const RUSH_BASE = 0.6
/** Wardens come in sets of three: the factor by order within a set (the Firmament's own 1, 1.1, 1.25). */
export const RUSH_WARDEN_FACTORS = [1, 1.1, 1.25]
/** Pip's target, as a fraction of the best cast of the run (Default): the easiest fight in the game. */
export const PIP_FRACTION = 0.1

/** The fights in order, one boss at a time (the four gods are one block): ids for `convergence.fights`. */
export function rushFights() {
  const wardens = [...WARDEN_SETS.split[0], ...WARDEN_SETS.split[1]]
  const rewriters = [...REWRITER_SETS.split[0], ...REWRITER_SETS.split[1]]
  return ['primordial', 'gods', ...wardens, ...rewriters, 'pip', 'you']
}

/** Which fights are the Rush (everything before Pip). */
export const isRushFight = (id) => id !== 'pip' && id !== 'you'

// --- The two bosses that only exist here (T3, T4) ---

export const PIP_BOSS = {
  id: 'pip',
  tier: 6,
  convergence: true,
  name: 'Pip',
  description: 'Pip repeats your very first cast of this run. It says it is the final boss.',
  effects: {},
}

export const YOU_BOSS = {
  id: 'you',
  tier: 6,
  convergence: true,
  name: 'You',
  description: 'A ghost of your own build. It races you, takes your dice and interferes. It never destroys a die.',
  effects: {},
}

export const CONVERGENCE_BOSS_ES = {
  pip: { name: 'Pip', description: 'Pip repite tu primera tirada de esta partida. Dice que es el jefe final.' },
  you: { name: 'Tú', description: 'Un fantasma de tu propio equipo. Compite contigo, te quita dados e interfiere. Nunca destruye un dado.' },
}

// --- A callback line for each Rush boss (T2) ---

export const CALLBACKS = {
  primordial: L('You again. I remember the first dream. You were smaller then.', 'Tú otra vez. Recuerdo el primer sueño. Eras más pequeño entonces.'),
  gods: L('Four of us, one after another. We have been waiting to be asked back.', 'Los cuatro, uno tras otro. Esperábamos que nos volvieran a invitar.'),
  dawn: L('I was the first morning. Do you remember being asked to look?', 'Fui la primera mañana. ¿Recuerdas que te pedí mirar?'),
  clockwork: L('Tick. You are late, and also early. Both are true here.', 'Tic. Llegas tarde, y también temprano. Ambas cosas son ciertas aquí.'),
  expanse: L('So far you have come. Look how far there still is.', 'Qué lejos has llegado. Mira cuánto queda todavía.'),
  umbra: L('The dark does not mind being visited twice.', 'A la oscuridad no le molesta que la visiten dos veces.'),
  maelstrom: L('Everything is the same as before, only rearranged.', 'Todo es igual que antes, solo que reordenado.'),
  hollow: L('There is still room in here. There is always room.', 'Todavía hay lugar aquí dentro. Siempre hay lugar.'),
  axiom: L('I state it; therefore it is. I stated that you would return.', 'Lo enuncio; por tanto es. Enuncié que volverías.'),
  zero: L('...', '...'),
  floating: L('Approximately you. Approximately here.', 'Aproximadamente tú. Aproximadamente aquí.'),
  infinity: L('and then, and then, and then, and then you came back', 'y luego, y luego, y luego, y luego volviste'),
  observer: L('I am only here if you look. You looked. How kind.', 'Solo estoy aquí si miras. Miraste. Qué amable.'),
  deadlock: L('One at a time, please. Even now. Especially now.', 'De uno en uno, por favor. Incluso ahora. Sobre todo ahora.'),
  pip: L('Pip is the final boss. Pip has always been the final boss. (Pip has not.)', 'Pip es el jefe final. Pip siempre ha sido el jefe final. (Pip no lo ha sido.)'),
}

// --- The ghost duel (T4) ---

/** Exchanges in a duel, and the running total that wins it, as a multiple of the ghost build's best cast (Default). */
export const DUEL_EXCHANGES = 6
export const DUEL_GOAL_MULT = 3
/** The ghost's best cast is the best of this many seeded casts of its build. */
export const GHOST_SAMPLES = 5
/** From this exchange on the ghost makes two moves instead of one. */
export const DUEL_TWO_MOVES_FROM = 4

/** The ghost's moves: it announces them before the exchange; they land on your first reroll or your cast. */
export const MOVES = {
  steal: {
    name: L('Steal', 'Robar'),
    announce: L('I will take your highest die for this exchange. Hold it, and it stays yours.', 'Me llevaré tu dado más alto en este intercambio. Guárdalo, y seguirá siendo tuyo.'),
  },
  rewind: {
    name: L('Rewind', 'Rebobinar'),
    announce: L('Your best die will be thrown again. Hold it, and it is safe.', 'Tu mejor dado se volverá a lanzar. Guárdalo, y estará a salvo.'),
  },
  borrow: {
    name: L('Borrow', 'Tomar prestado'),
    announce: L('One of your relics fights for me this exchange. It comes back.', 'Una de tus reliquias pelea para mí en este intercambio. Vuelve después.'),
  },
  shuffle: {
    name: L('Shuffle', 'Barajar'),
    announce: L('Your row will be shuffled. Neighbors are only neighbors for a moment.', 'Tu fila se va a barajar. Los vecinos solo lo son por un momento.'),
  },
  lock: {
    name: L('Lock', 'Bloquear'),
    announce: L('Your lowest die will be locked where it lies, and will not roll again.', 'Tu dado más bajo se bloqueará donde esté y no volverá a rodar.'),
  },
}
export const MOVE_IDS = Object.keys(MOVES)

/** What the ghost is called, by the difficulty it was built for (T4). */
export const GHOST_NAME = {
  ember: L('Your build, as it is now', 'Tu equipo, tal como está ahora'),
  blaze: L('Your build, improved', 'Tu equipo, mejorado'),
  inferno: L('The best build on this file', 'El mejor equipo de este archivo'),
  cataclysm: L('The best of the best', 'El mejor de los mejores'),
}

/**
 * The Cataclysm ghost (T6): a fixed, realistic best-of-the-best build, from
 * the best-build search of tools/bestBuild.mjs. Ten dice at d20 to d50, five
 * relics and a Law. The sizes are tuned in tools/balanceSim.mjs (`ghost`) so
 * its best cast is a few times the round-45 target.
 */
export const CATACLYSM_GHOST = {
  dice: [
    ['monad', 'd40'],
    ['singularity', 'd30'],
    ['undivisible', 'd50'],
    ['darkness', 'd30'],
    ['parity', 'd30'],
    ['light', 'd30'],
    ['oblivion', 'd30'],
    ['space', 'd30'],
    ['ice', 'd20'],
    ['sigil_aeris_g', 'sigil'],
  ],
  relics: ['aether_crown', 'heart_of_circle', 'heart_of_the_forge', 'crown_of_ages', 'chain_break'],
  law: 'law_echo',
}

/**
 * The Theoretical Best (T6): the search's consensus build at any size. A run
 * that holds all ten of these dice, the five relics and the Law at once earns
 * the secret achievement.
 */
export const THEORETICAL_BEST = {
  dice: ['monad', 'singularity', 'undivisible', 'darkness', 'parity', 'light', 'oblivion', 'space', 'ice', 'sigil_aeris_g'],
  relics: CATACLYSM_GHOST.relics,
  law: CATACLYSM_GHOST.law,
}

// --- What the ghost says (a short line each exchange, and at the ends) ---

export const GHOST_LINES = {
  open: [
    L('Cast first. I am in no hurry. I am you.', 'Tira primero. No tengo prisa. Soy tú.'),
    L('I know every die you hold. I picked them with you.', 'Conozco cada dado que tienes. Los elegí contigo.'),
    L('Let us see who wins an argument with themselves.', 'Veamos quién gana una discusión consigo mismo.'),
  ],
  ahead: [
    L('I am ahead. You would have been, too.', 'Voy ganando. Tú también lo habrías hecho.'),
    L('Careful. I have your habits.', 'Cuidado. Tengo tus costumbres.'),
  ],
  behind: [
    L('You are ahead. I would not have trusted that.', 'Vas ganando. Yo no me lo habría creído.'),
    L('Hm. You are better than I remember.', 'Hm. Eres mejor de lo que recuerdo.'),
  ],
}

// --- Story scenes of the Convergence (read by data/story.js) ---

export const SCENE_TEXT = {
  unwritten: [
    L('This is the page the Split was written on, before anything was written.', 'Esta es la página sobre la que se escribió la División, antes de que se escribiera nada.'),
    L('The numbers on your dice are fading. The ledger forgets its own lines. Something here is erasing the interface, and it does not mind.', 'Los números de tus dados se desvanecen. El libro olvida sus propias líneas. Algo aquí está borrando la interfaz, y no le importa.'),
    L('Everyone who has come this far is welcome. Everything you have beaten is waiting, one at a time.', 'Todo el que llegó hasta aquí es bienvenido. Todo lo que has vencido espera, uno a la vez.'),
  ],
  pipBefore: [
    L('Pip puffs up to twice its size. This is it. Pip is the final boss. Pip says so loudly.', 'Pip se hincha al doble de su tamaño. Esto es todo. Pip es el jefe final. Pip lo dice en voz alta.'),
    L('Pip will do the one thing it knows: repeat your very first cast. Watch closely, it was a good one.', 'Pip hará lo único que sabe: repetir tu primera tirada. Mira bien, fue buena.'),
  ],
  pipAfter: [
    L('Pip stops. It looks at the dice, and at you, and a little sheepishly at the floor.', 'Pip se detiene. Mira los dados, te mira a ti, y un poco avergonzado, al suelo.'),
    L('Pip says: that was all I had. The real one is behind me. It is my master. It has your face.', 'Pip dice: eso era todo lo que tenía. El verdadero está detrás de mí. Es mi amo. Tiene tu cara.'),
  ],
  youBefore: [
    L('The page turns over. On the other side is a table, and on it, your dice. All of them. All the ones you chose.', 'La página se da la vuelta. Del otro lado hay una mesa, y sobre ella, tus dados. Todos. Todos los que elegiste.'),
    L('You will not be fighting a god. You will be fighting everything you decided, at once.', 'No pelearás contra un dios. Pelearás contra todo lo que decidiste, a la vez.'),
  ],
  trueEnding: [
    L('You beat yourself. It is the only way anyone has ever beaten you.', 'Te venciste a ti mismo. Es la única manera en que alguien te ha vencido.'),
    L('The ghost sits down where you were, and the table remembers its build. The next to come this far will meet it.', 'El fantasma se sienta donde estabas tú, y la mesa recuerda su equipo. Quien llegue tan lejos lo enfrentará.'),
    L('Pip is already asleep on the page. Somewhere, the Arbiter makes a note. It is, for once, a kind one.', 'Pip ya duerme sobre la página. En alguna parte, el Árbitro toma nota. Por una vez, es amable.'),
  ],
}
