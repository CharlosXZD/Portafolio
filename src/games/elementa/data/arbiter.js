// An Arbiter (EXPANSION.md Part S, v0.9.2): the unarmed voice of realm 3, and
// the god who bans fishing (Part P5) is this same Arbiter. Everything about
// him lives here: his name (a placeholder until Carlos names him, change it in
// ARBITER below and nowhere else), his colors, his lines for every situation,
// the hidden `favor` rules and the fourth-wall lines. All text is a DRAFT for
// Carlos to rewrite.
//
// This file only holds words and numbers. Reading anything about the player's
// device happens in utils/fourthWall.js, and only when the player said yes.
// Nothing in either file talks to a network, and neither reads stored cookies.
const L = (en, es) => ({ en, es })

/** The one place his name is set. "An Arbiter", not "the" one: there may be more. */
export const ARBITER = {
  id: 'arbiter',
  name: L('Arbiter', 'Árbitro'),
  /** How scenes and the Gallery introduce him. */
  article: L('an Arbiter', 'un Árbitro'),
  color: '#d8d2e8',
  accent: '#f4f0fa',
}

// --- Favor (hidden). It lives on the run as `state.favor`. ---

export const FAVOR_MIN = -10
export const FAVOR_MAX = 10
/** At this much favor or more his lines are warm and he sometimes gives a gift. */
export const FAVOR_WARM = 3
/** At this little favor or less his lines are cold and he sometimes hinders. */
export const FAVOR_COLD = -3
/** A realm 3 round cleared without an offense. */
export const FAVOR_CLEAN = 1
/** An Eye-fishing warning (the first two offenses), and the smite (the third and later). */
export const FAVOR_WARNING = -1
export const FAVOR_SMITE = -2
/** Taking a Nix betrayal pact. */
export const FAVOR_BETRAYAL = -1

export const clampFavor = (n) => Math.max(FAVOR_MIN, Math.min(FAVOR_MAX, n))

/** 'warm', 'neutral' or 'cold'. */
export function favorBand(favor = 0) {
  if (favor >= FAVOR_WARM) return 'warm'
  if (favor <= FAVOR_COLD) return 'cold'
  return 'neutral'
}

/**
 * What he does this round (realm 3 only). Never random and never lethal: a
 * warm Arbiter gives one reroll every third round; a cold one lets a hold slip
 * once every third round, on the first reroll. Never on a Rewriter's round
 * (the hindrance), so a boss is never made harder by his mood.
 */
export function arbiterRound(favor, round, rewriterRound) {
  const band = favorBand(favor)
  const step = (round - 31) % 3
  return {
    gift: band === 'warm' && step === 1,
    cold: band === 'cold' && step === 2 && !rewriterRound,
    used: false,
  }
}

// --- His lines. Three to five per situation, so they rarely repeat. ---

const ROUND = {
  neutral: [
    L('Another round. Do keep the numbers honest.', 'Otra ronda. Procura que los números sean honestos.'),
    L('I am only here to watch. I will pretend I am not.', 'Solo estoy aquí para mirar. Fingiré que no.'),
    L('Whatever happens next was always going to happen. Roll anyway.', 'Lo que pase a continuación siempre iba a pasar. Tira igual.'),
    L('No weapons, no tricks. Only a polite eye on the table.', 'Sin armas, sin trucos. Solo un ojo cortés sobre la mesa.'),
    L('Carry on. I will tell you if it matters.', 'Sigue. Te diré si importa.'),
  ],
  warm: [
    L('You play cleanly. It is a pleasure to watch.', 'Juegas con limpieza. Da gusto mirarte.'),
    L('Go on. I have a good feeling about this one.', 'Adelante. Tengo buena espina con esta.'),
    L('I do not usually say so, but I am on your side today.', 'No suelo decirlo, pero hoy estoy de tu lado.'),
    L('Take your time. The numbers can wait for you.', 'Tómate tu tiempo. Los números pueden esperarte.'),
  ],
  cold: [
    L('I remember what you did. I am not angry. I just remember.', 'Recuerdo lo que hiciste. No estoy enojado. Solo recuerdo.'),
    L('Play on. I will be here, unimpressed.', 'Sigue jugando. Estaré aquí, sin impresionarme.'),
    L('You are on a short list. It is not a good list.', 'Estás en una lista corta. No es una buena lista.'),
    L('Do be careful with the table today.', 'Ten cuidado con la mesa hoy.'),
  ],
}

const SHOP = {
  neutral: [
    L('Buy what you like. I do not tax. I only observe.', 'Compra lo que quieras. No cobro impuestos. Solo observo.'),
    L('A shop in a realm of numbers. The prices are, at least, honest.', 'Una tienda en un reino de números. Los precios, al menos, son honestos.'),
    L('Everything here is for sale except me.', 'Aquí todo está en venta menos yo.'),
    L('Take your time. The next round is not going anywhere.', 'Tómate tu tiempo. La próxima ronda no se va a ninguna parte.'),
  ],
  warm: [
    L('Spend well. You have earned a good shelf.', 'Gasta bien. Te has ganado un buen estante.'),
    L('If anyone asks, I did not recommend anything.', 'Si alguien pregunta, yo no recomendé nada.'),
    L('You are welcome here. I wanted you to know.', 'Eres bienvenido aquí. Quería que lo supieras.'),
    L('A fine pool, this. Do keep it.', 'Una buena reserva, esta. Consérvala.'),
  ],
  cold: [
    L('Spend what you like. It will not change my mind.', 'Gasta lo que quieras. No cambiará mi opinión.'),
    L('I see you looking at the shelves. I see the whole shop.', 'Te veo mirar los estantes. Yo veo toda la tienda.'),
    L('Buy something sensible. For once.', 'Compra algo sensato. Por una vez.'),
    L('The merchants may smile at you. I do not have to.', 'Los comerciantes pueden sonreírte. Yo no tengo por qué.'),
  ],
}

/** His first line in realm 3: warmer if he has already smote you for fishing. */
const FIRST = {
  new: L(
    'Hello. I am an Arbiter. I have no weapons and no opinions. Yet. Play on.',
    'Hola. Soy un Árbitro. No tengo armas ni opiniones. Todavía. Sigue jugando.',
  ),
  met: L(
    'We have met. You shook the future and I took a life. No hard feelings. Mostly.',
    'Ya nos conocemos. Sacudiste el futuro y me llevé una vida. Sin rencores. Casi.',
  ),
}

const GIFT = [
  L('A small gift: one more reroll, only for today.', 'Un pequeño regalo: un reroll más, solo por hoy.'),
  L('Have a reroll. Do not tell the others.', 'Toma un reroll. No se lo digas a los demás.'),
  L('One extra reroll. Think of it as a nod.', 'Un reroll extra. Considéralo un gesto.'),
]

const HINDRANCE = [
  L('One hand slipped. It happens to those I remember.', 'Una mano se soltó. Les pasa a quienes recuerdo.'),
  L('I let go of one of your holds. Only one. I am not cruel.', 'Solté uno de tus bloqueos. Solo uno. No soy cruel.'),
  L('A hold, taken back. You will manage.', 'Un bloqueo, recuperado. Te las arreglarás.'),
]

// --- The fourth wall (Part Q6, S). Placeholders are filled from what the page
// can see (utils/fourthWall.js). A line with a value that is missing is
// skipped. A `bluff` is an invented joke: it claims to know something it
// cannot, and is shown with a wink so nobody takes it for real. ---

export const WINK = ' ;)'

/** Ten for the Arbiter. */
export const ARBITER_FOURTH_WALL = [
  { id: 'hour', text: L('It is {hour} in {timezone}. I never judge when people play. I only notice.', 'Son las {hour} en {timezone}. Nunca juzgo cuándo juega la gente. Solo me fijo.') },
  { id: 'system', text: L('{browser} on {os}. A tidy place to be counted from.', '{browser} en {os}. Un lugar ordenado desde el cual contarte.') },
  { id: 'runs', text: L('{runs} runs started on this file. I have been around for fewer. I make up for it by paying attention.', '{runs} partidas empezadas en este archivo. Yo he estado en menos. Lo compenso prestando atención.') },
  { id: 'returned', text: L('You left and came back {returned} times. I waited. I am very good at waiting.', 'Te fuiste y volviste {returned} veces. Esperé. Se me da muy bien esperar.') },
  { id: 'screen', text: L('A {screen} window, and the whole realm fits through it. Impressive, in its way.', 'Una ventana de {screen}, y todo el reino cabe por ella. Impresionante, a su modo.') },
  { id: 'language', text: L('I see you speak {language}. I will keep my sentences short.', 'Veo que hablas {language}. Mantendré mis frases cortas.') },
  { id: 'minutes', text: L('{minutes} minutes in this sitting. Drink some water. That is advice, not surveillance.', '{minutes} minutos en esta sesión. Toma agua. Eso es un consejo, no vigilancia.') },
  { id: 'wins', text: L('{wins} wins on this file. I would not call it a habit. I would call it a pattern.', '{wins} victorias en este archivo. No lo llamaría un hábito. Lo llamaría un patrón.') },
  { id: 'downloads', bluff: true, text: L('I know what is in your Downloads folder. Do not worry. It is mostly numbers.', 'Sé lo que hay en tu carpeta de Descargas. No te preocupes. Son sobre todo números.') },
  { id: 'unsent', bluff: true, text: L('I did not read your messages. I did read the one you drafted and never sent.', 'No leí tus mensajes. Sí leí el que redactaste y nunca enviaste.') },
]

/** Two for each Rewriter, in its own voice. */
export const REWRITER_FOURTH_WALL = {
  axiom: [
    { id: 'hour', text: L('It is {hour}. I measure everything by sums, and this hour adds up to a long night.', 'Son las {hour}. Mido todo con sumas, y esta hora suma una noche larga.') },
    { id: 'screen', text: L('Your {screen} screen holds exactly as many pixels as I allow. Add them yourself.', 'Tu pantalla de {screen} tiene exactamente los píxeles que yo permito. Súmalos tú.') },
  ],
  zero: [
    { id: 'timezone', text: L('Nothing is as quiet as {timezone} at this hour. I am almost at home.', 'Nada es tan silencioso como {timezone} a esta hora. Casi me siento en casa.') },
    { id: 'notifications', bluff: true, text: L('I counted your unread notifications. The answer was zero. Then I counted again.', 'Conté tus notificaciones sin leer. La respuesta fue cero. Luego volví a contar.') },
  ],
  infinity: [
    { id: 'minutes', text: L('{minutes} minutes so far. I have been here forever. The ratio is rude.', '{minutes} minutos hasta ahora. Yo llevo aquí para siempre. La proporción es grosera.') },
    { id: 'runs', text: L('{runs} runs. I would offer you infinitely many more, but you would take them.', '{runs} partidas. Te ofrecería infinitas más, pero las aceptarías.') },
  ],
  observer: [
    { id: 'system', text: L('A {os} user. I see you looking at me looking at you.', 'Un usuario de {os}. Te veo mirarme mirándote.') },
    { id: 'returned', text: L('You left and came back {returned} times. I was only here when you looked.', 'Te fuiste y volviste {returned} veces. Yo solo estaba aquí cuando mirabas.') },
  ],
  floating: [
    { id: 'language', text: L('{language}. Approximately. I round everything, including you.', '{language}. Aproximadamente. Redondeo todo, tú incluido.') },
    { id: 'battery', bluff: true, text: L('Your battery is at roughly 63 percent. Roughly. I round.', 'Tu batería está en unos 63 por ciento. Más o menos. Yo redondeo.') },
  ],
  deadlock: [
    { id: 'hour', text: L('It is {hour}, and you will not hold more than one thing. Try holding your breath instead.', 'Son las {hour}, y no sostendrás más de una cosa. Mejor prueba a contener la respiración.') },
    { id: 'wins', text: L('{wins} wins and still only one hand. How do you manage?', '{wins} victorias y aún una sola mano. ¿Cómo lo logras?') },
  ],
}

export const ARBITER_LINES = { ROUND, SHOP, FIRST, GIFT, HINDRANCE }

/** His Gallery lore, revealed a line at a time as he appears (Keepers-like page). */
export const ARBITER_LORE = [
  L('Unarmed, and a little bored. An Arbiter does not fight; he simply does not allow it.', 'Sin armas, y un poco aburrido. Un Árbitro no pelea; simplemente no lo permite.'),
  L('He keeps no list. He remembers. The difference matters to him.', 'No lleva ninguna lista. Recuerda. La diferencia le importa.'),
  L('He says he is an Arbiter, not the Arbiter. He does not say how many there are.', 'Dice que es un Árbitro, no el Árbitro. No dice cuántos hay.'),
]

/** A small, stable number from a text, for picking lines without touching the game's seeded generator. */
export function hashText(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const pickFrom = (list, key) => list[hashText(String(key)) % list.length]

/** The line for a round or a shop: one of three to five per band, stable for the same run and round. */
export function arbiterLine({ situation, favor = 0, round = 31, seed = '', met = false, first = false }) {
  if (first) return (met ? FIRST.met : FIRST.new)
  const band = favorBand(favor)
  const pool = (situation === 'shop' ? SHOP : ROUND)[band]
  return pickFrom(pool, `${seed}:${situation}:${round}`)
}

export const giftLine = (key) => pickFrom(GIFT, key)
export const hindranceLine = (key) => pickFrom(HINDRANCE, key)
