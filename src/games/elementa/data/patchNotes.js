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
    version: '0.6.6',
    name: L('Loose ends', 'Cabos sueltos'),
    date: null,
    highlights: [
      L(
        'A new die size, the d5. Dice in the shop now come in d3, d5, d6, d10 and d20: each size rarer and pricier than the last, and bigger sizes show up later in a run.',
        'Un nuevo tamaño de dado, el d5. Los dados de la tienda ahora vienen en d3, d5, d6, d10 y d20: cada tamaño más raro y más caro que el anterior, y los grandes aparecen más tarde en la partida.',
      ),
      L(
        'The Chisel splits a die in two of the next size down (d20 into two d10, d10 into two d5, d6 into two d3). A d5 chips into a d3 and leaves a Transmute. A d3 is too small. It costs 3 Shards now.',
        'El Cincel parte un dado en dos del tamaño anterior (d20 en dos d10, d10 en dos d5, d6 en dos d3). Un d5 se astilla en un d3 y deja una Transmutación. Un d3 es demasiado pequeño. Ahora cuesta 3 Fragmentos.',
      ),
      L(
        'Varuna is gentler: instead of turning your whole pool into 1s, her drawback makes 1s come up 50% more often. Her trial in the gods\' gauntlet works the same way.',
        'Varuna es más amable: en vez de volver todo tu grupo 1, su desventaja hace que los 1 salgan un 50% más seguido. Su prueba en el desafío de los dioses funciona igual.',
      ),
      L(
        'Fixed Kindling handing out endless rerolls (a forced 1 counted as a fizzle). It is now capped at 3 rerolls per round.',
        'Arreglado Avivar, que daba relanzamientos sin fin (un 1 forzado contaba como apagado). Ahora tiene un tope de 3 relanzamientos por ronda.',
      ),
      L(
        'Masquerade and Chameleon now roll with the abilities they borrow, so a copied Chrono rewinds its 1s and a copied Fire die explodes.',
        'Mascarada y Camaleón ahora tiran con las habilidades que copian, así que un Chrono copiado rebobina sus 1 y un dado de Fuego copiado explota.',
      ),
      L(
        'Item descriptions and hover cards no longer hide behind neighboring panels. They always appear on top, and stay on screen.',
        'Las descripciones de objetos y las tarjetas ya no se esconden detrás de paneles vecinos. Siempre aparecen al frente y se mantienen en pantalla.',
      ),
      L(
        'Saved runs now pick up the latest version of the relics and consumables they hold.',
        'Las partidas guardadas ahora toman la versión más reciente de las reliquias y consumibles que llevan.',
      ),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.6.5',
    name: L('Polish', 'Pulido'),
    date: null,
    highlights: [
      L(
        'Dice bought in the shop now arrive as d3, small and quick to explode, ready to grow later.',
        'Los dados que compras en la tienda ahora llegan como d3, pequeños y rápidos para explotar, listos para crecer después.',
      ),
      L(
        'Three levels of detail for every die: hover for the basics and its score, click for a short description with a bit of lore, click and hold for everything.',
        'Tres niveles de detalle para cada dado: pasa el cursor para lo básico y su puntaje, haz clic para una descripción corta con un poco de historia, mantén el clic para verlo todo.',
      ),
      L(
        'Keyword tags like #Explodes and #Fizzles. Hover or tap one to read what it means.',
        'Etiquetas como #Explota y #Apagado. Pasa el cursor o tócalas para ver qué significan.',
      ),
      L(
        'Every die has a new, shorter description. Numbers and element names are colored the same everywhere.',
        'Cada dado tiene una descripción nueva y más corta. Los números y los nombres de elementos tienen los mismos colores en todas partes.',
      ),
      L(
        'The Cast ledger groups repeated lines ("Kindle x6") and the cast steps through each group. Expand all brings every line back.',
        'La cuenta del hechizo agrupa las líneas repetidas ("Yesca x6") y el lanzamiento avanza grupo por grupo. Expandir todo trae de vuelta cada línea.',
      ),
      L(
        'The score stays a "?" until you cast, so the reveal has some tension. Turn on "Show live total" in Options for the old behavior.',
        'El puntaje es un "?" hasta que lanzas, para que la revelación tenga algo de tensión. Activa "Mostrar el total antes de lanzar" en Opciones para volver a lo de antes.',
      ),
      L(
        'A new roll: dice are tossed in an arc, spin in 3D, bounce twice, cast a shadow and kick up something from their element. A d20 lands heavier.',
        'Una tirada nueva: los dados salen en arco, giran en 3D, rebotan dos veces, proyectan una sombra y levantan algo de su elemento. Un d20 cae con más peso.',
      ),
      L(
        'Explosions play out one by one, with a different look for Fire, Lightning, Steel, Steam, Storm, Obsidian, Magma, Aether and Ognen.',
        'Las explosiones se ven una por una, con un aspecto distinto para Fuego, Relámpago, Acero, Vapor, Tormenta, Obsidiana, Magma, Éter y Ognen.',
      ),
      L(
        'Drift sends a gust across the die, and locking wraps it in chains until a lock clicks shut.',
        'La Deriva manda una ráfaga sobre el dado, y al bloquearlo lo envuelven cadenas hasta que un candado se cierra.',
      ),
      L(
        'Relics and pacts react while the score is added up, with a bounce and a floating bonus.',
        'Las reliquias y los pactos reaccionan mientras se suma el puntaje, con un rebote y un bono flotante.',
      ),
      L(
        'Each loadout shows which difficulties you beat it on, and dice that beat Cataclysm wear a gold star in the Gallery.',
        'Cada equipo inicial muestra en qué dificultades lo has superado, y los dados que vencieron Cataclismo llevan una estrella dorada en la Galería.',
      ),
      L(
        'A green "Cleared" sash on the loadout panel replaces the old tag, and the difficulty card no longer has one.',
        'Una banda verde de "Superado" en el panel del equipo inicial reemplaza la etiqueta anterior, y la tarjeta de dificultad ya no tiene una.',
      ),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.6',
    name: L('Three Paths', 'Tres Caminos'),
    date: null,
    highlights: [
      L(
        'Your choices now decide the ending: walk into round 15 leaning toward the Split, toward the Primordial, or neither.',
        'Tus decisiones ahora deciden el final: entra a la ronda 15 inclinado hacia la División, hacia el Primordial, o hacia ninguno.',
      ),
      L(
        'The Split path: face the Primordial Unbound, which fuses your dice back together as you reroll.',
        'El camino de la División: enfréntate al Primordial Desatado, que vuelve a fusionar tus dados mientras relanzas.',
      ),
      L(
        'The Primordial path: fight the four gods who made the Split, one by one, holding the Primordial die as it grows.',
        'El camino del Primordial: lucha contra los cuatro dioses que hicieron la División, uno a uno, con el dado Primordial creciendo en tu mano.',
      ),
      L(
        'Win once to see the gods. Their visions teach you their recipes and open both new paths.',
        'Gana una vez para ver a los dioses. Sus visiones te enseñan sus recetas y abren los dos caminos nuevos.',
      ),
      L(
        'Four god dice, Gaea, Ognen, Varuna and Zephyr: a new Divine rarity, forged from four pure dice, each with a power and a price.',
        'Cuatro dados dioses, Gaea, Ognen, Varuna y Zephyr: una nueva rareza Divina, forjados con cuatro dados puros, cada uno con un poder y un precio.',
      ),
      L('Two new relics: Chain Break and Pantheon.', 'Dos reliquias nuevas: Cadena Rota y Panteón.'),
      L(
        'Three endings to collect, an Endings tab in the Gallery, and completion marks on every loadout.',
        'Tres finales por coleccionar, una pestaña de Finales en la Galería y marcas de progreso en cada equipo.',
      ),
      L(
        'Pip, Aeris, Nix and the Primordial itself drop hints about where your run is heading.',
        'Pip, Aeris, Nix y el propio Primordial dejan pistas sobre hacia dónde va tu partida.',
      ),
    ],
  },
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
