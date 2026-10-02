// In-game patch notes (EXPANSION.md E12), newest first. They mirror Part D
// of EXPANSION.md, written for players: short, friendly, no file names.
// Release step for every phase: add the entry here and to Part D. The
// version tag in the corner (ElementaGame.jsx) reads the newest entry, and
// the "What's new" button shows NEW until the player opens this version.
//
// `date` is null while a version is still in development. `stage` is the
// release stage (Part C of EXPANSION.md): Alpha, then Beta, then Release.

const L = (en, es) => ({ en, es })

export const PATCH_NOTES = [
  {
    stage: 'Alpha',
    version: '0.5',
    name: L('Allegiance', 'Lealtad'),
    date: null,
    highlights: [
      L(
        "Nix has five new pacts: Gambler's Oath, Hollow Crown, Shadow Twin, The Long Night and Bound Tongue.",
        'Nix tiene cinco pactos nuevos: Juramento del Apostador, Corona Hueca, Gemelo de Sombra, La Larga Noche y Lengua Atada.',
      ),
      L(
        "Betrayal pacts: if you carry Aeris's blessings, Nix offers to break them for something bigger.",
        'Pactos de traición: si llevas bendiciones de Aeris, Nix ofrece romperlas a cambio de algo mayor.',
      ),
      L(
        'Aeris has five new blessings: Plenty, Ember-ward, Clarity, Communion and Grace.',
        'Aeris tiene cinco bendiciones nuevas: Abundancia, Brasa Guardiana, Claridad, Comunión y Gracia.',
      ),
      L(
        "Every pact has a price with Aeris: her blessings cost Shards, then an item, and after three pacts she's gone. Shrines on the Road change with your choices.",
        'Cada pacto tiene un precio con Aeris: sus bendiciones cuestan Fragmentos, luego un objeto, y tras tres pactos desaparece. Los Santuarios del Camino cambian con tus decisiones.',
      ),
      L(
        "Something is listening to your choices. Aeris and Nix have started to notice which way you lean.",
        'Algo escucha tus decisiones. Aeris y Nix empiezan a notar hacia dónde te inclinas.',
      ),
      L(
        'Three new arcane dice: Bullion pays your Mult in Shards, Masquerade and Chameleon copy their neighbors.',
        'Tres dados arcanos nuevos: Lingote paga tu Multiplicador en Fragmentos, Mascarada y Camaleón copian a sus vecinos.',
      ),
      L(
        'Balance: Aether costs more, Gilded, Mirror, Beacon and Prism are easier to find, Upgrade Stones are rarer, Conduit doubles its bridge, and Chrono never stays on a 1.',
        'Balance: el Éter cuesta más, Dorado, Espejo, Faro y Prisma son más fáciles de encontrar, las Piedras de Mejora son más raras, el Conducto duplica su puente y Crono nunca se queda en 1.',
      ),
      L(
        'A new run screen: browse loadouts one at a time and pick your stakes, like choosing a deck.',
        'Una nueva pantalla de partida: recorre los equipos uno a uno y elige tu dificultad, como quien elige un mazo.',
      ),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.4',
    name: L('The Road', 'El Camino'),
    date: null,
    highlights: [
      L(
        'The Road: a branching map of shops. Pick your next stop from inside each shop.',
        'El Camino: un mapa de tiendas con rutas. Elige tu próxima parada desde cada tienda.',
      ),
      L(
        'Seven shop types, each with its own keeper: Market, Alchemist, Relic Vault, Forge, Black Market, Shrine, and the legendary Aether Bazaar.',
        'Siete tipos de tienda, cada una con su tendero: Mercado, Alquimista, Bóveda de Reliquias, Forja, Mercado Negro, Santuario y el legendario Bazar del Éter.',
      ),
      L(
        'Keepers remember you, change what they say as you keep visiting, and tell the story of the Split over time. The Gallery collects it.',
        'Los tenderos te recuerdan, cambian lo que dicen según tus visitas y cuentan la historia de la División con el tiempo. La Galería la reúne.',
      ),
      L(
        "Tobb's camp: missing a round gives you a few Shards and a small shop before you try again.",
        'El campamento de Tobb: fallar una ronda te da unos Fragmentos y una tienda pequeña antes de reintentar.',
      ),
      L(
        'Family abilities: Fire dice that fizzle refund a reroll, Earth dice grow while they wait, and Air dice can nudge a face by 1 once per round.',
        'Habilidades de familia: los dados de Fuego que se apagan devuelven un reroll, los de Tierra crecen mientras esperan y los de Aire pueden mover una cara 1 una vez por ronda.',
      ),
      L('Three new relics: Heat, Gust and Steady.', 'Tres reliquias nuevas: Calor, Ráfaga y Firmeza.'),
      L(
        'The Aether recipe is a secret until you beat Primordial. The Curator has something to tell you when you do.',
        'La receta del Éter es secreta hasta que venzas al Primordial. El Curador tiene algo que decirte cuando lo hagas.',
      ),
      L(
        'Dice tumble when they roll, and every element has its own little effect so similar colors are easy to tell apart.',
        'Los dados dan volteretas al tirarse, y cada elemento tiene su propio efecto para distinguir colores parecidos.',
      ),
      L(
        'Boss rewards: grow one die a size, plus one more slot for dice, relics or consumables.',
        'Recompensas de jefe: un dado crece un tamaño, más un espacio extra de dados, reliquias o consumibles.',
      ),
      L(
        'Music: every screen, shop and boss has its own theme.',
        'Música: cada pantalla, tienda y jefe tiene su propio tema.',
      ),
      L(
        'Easier to read: family tags, element symbols on dice, tags above the dice, boons as icons, and a full load screen.',
        'Más fácil de leer: etiquetas de familia, símbolos de elemento en los dados, etiquetas sobre los dados, bendiciones como íconos y una pantalla de carga completa.',
      ),
      L(
        'Shop polish: pick dice up and drop them where you want, clearer reroll prices, and restocks that deal in like cards.',
        'Mejoras en la tienda: levanta los dados y suéltalos donde quieras, precios de reroll más claros y mercancía que se reparte como cartas.',
      ),
      L(
        'Consumables work during a round, and a run summary shows everything you met after the final boss.',
        'Los consumibles funcionan durante la ronda, y un resumen muestra todo lo que encontraste tras el jefe final.',
      ),
      L('This screen: the notes for every version.', 'Esta pantalla: las notas de cada versión.'),
      L(
        'Credits: The Binding of Isaac joins Balatro and Ultrapool as an inspiration.',
        'Créditos: The Binding of Isaac se une a Balatro y Ultrapool como inspiración.',
      ),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.3',
    name: L('Beta feedback', 'Comentarios de la beta'),
    date: '2026-09-28',
    highlights: [
      L(
        'Save files are whole games: each one keeps its own progress and run, with a home screen of its own.',
        'Cada archivo de guardado es una partida completa: guarda su propio progreso y su partida, con su propia pantalla de inicio.',
      ),
      L('19 achievements to unlock.', '19 logros por desbloquear.'),
      L('Seeds to replay a run, and Endless mode after a win.', 'Semillas para repetir una partida, y modo Infinito tras ganar.'),
      L(
        'Bosses give a reward, and the Fusion Forge opens after them.',
        'Los jefes dan una recompensa, y la Forja de Fusión se abre después de ellos.',
      ),
      L('Harder targets.', 'Objetivos más difíciles.'),
      L('Buy & use consumables, plus five new ones.', 'Compra y usa consumibles, y cinco nuevos.'),
      L(
        'Eight secret reactions, the Ermal boss, and a portrait for every boss.',
        'Ocho reacciones secretas, el jefe Ermal y un retrato para cada jefe.',
      ),
      L('The Gallery sorts by rarity, family or name.', 'La Galería se ordena por rareza, familia o nombre.'),
      L('A Run Info screen.', 'Una pantalla de información de la partida.'),
      L('An interactive tutorial with Pip.', 'Un tutorial interactivo con Pip.'),
      L('A new pixel font and display options.', 'Una nueva fuente pixel y opciones de pantalla.'),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.2',
    name: L('Juice and depth', 'Jugo y profundidad'),
    date: '2026-09-28',
    highlights: [
      L(
        'A pixel look for the whole game, with backgrounds and a full-screen table.',
        'Un estilo pixel para todo el juego, con fondos y una mesa a pantalla completa.',
      ),
      L('Score popups and screen shake.', 'Puntos que saltan y la pantalla que tiembla.'),
      L(
        'Relics up to 38, reactions between neighboring dice, and arcane dice that care where they sit.',
        'Hasta 38 reliquias, reacciones entre dados vecinos y dados arcanos a los que les importa dónde están.',
      ),
      L(
        'Boss tiers and the final boss, Primordial. Dice take a different shape for each size.',
        'Niveles de jefes y el jefe final, el Primordial. Los dados cambian de forma según su tamaño.',
      ),
      L('The cast ledger, revealing your score step by step.', 'El registro de tirada, que revela tu puntaje paso a paso.'),
      L(
        'Loadouts and difficulties unlock as you win, and the Gallery tracks your completion.',
        'Los equipos y dificultades se desbloquean al ganar, y la Galería sigue tu progreso.',
      ),
      L('Pip the guide, backup files, and English and Spanish.', 'Pip el guía, archivos de respaldo, e inglés y español.'),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.1',
    name: L('MVP', 'Primera versión'),
    date: '2026-09-27',
    highlights: [
      L(
        'Elemental dice: Earth, Fire, Water and Air, with fusions all the way to Aether.',
        'Dados elementales: Tierra, Fuego, Agua y Aire, con fusiones hasta el Éter.',
      ),
      L('Relics and a shop economy with interest.', 'Reliquias y una economía de tienda con intereses.'),
      L('Dice sizes from d3 to d20.', 'Dados de d3 a d20.'),
      L('Lives, boss rounds and four difficulties.', 'Vidas, rondas de jefe y cuatro dificultades.'),
      L('The Fusion Forge and sound effects.', 'La Forja de Fusión y efectos de sonido.'),
    ],
  },
]

export const LATEST_VERSION = PATCH_NOTES[0].version

/** Compares dotted versions ('0.10' is newer than '0.9'). */
export function isNewerVersion(a, b) {
  if (!b) return true
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d !== 0) return d > 0
  }
  return false
}
