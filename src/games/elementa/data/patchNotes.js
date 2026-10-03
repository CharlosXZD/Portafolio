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
    version: '0.7.5',
    name: L('Constellations', 'Constelaciones'),
    date: null,
    highlights: [
      L(
        'Seren the astronomer opens her Observatory in the Firmament: four Constellations a visit.',
        'Seren, la astrónoma, abre su Observatorio en el Firmamento: cuatro Constelaciones por visita.',
      ),
      L(
        'Ten Constellations level a reaction or a set type for the rest of the run, up to level 10: Kindle, Forge, Scald, Mist, Bloom, Dust Devil, Resonance, Pairs, Three of a kind and Straights. The Cast ledger shows it ("Kindle Lv 3").',
        'Diez Constelaciones suben de nivel una reacción o un tipo de set por el resto de la partida, hasta el nivel 10: Avivar, Forja, Escaldar, Neblina, Florecer, Remolino, Resonancia, Pares, Tríos y Escaleras. La cuenta del hechizo lo muestra ("Avivar Nv 3").',
      ),
      L(
        'The Black Hole levels all ten at once. It is rare.',
        'El Agujero Negro sube las diez a la vez. Es raro.',
      ),
      L(
        'Constellations also turn up, rarely, in other Firmament shops, and Run Info lists your levels.',
        'Las Constelaciones también aparecen, pocas veces, en otras tiendas del Firmamento, y la Info de la partida muestra tus niveles.',
      ),
      L(
        'Five Runes for your dice, sold at the Forge and in the Firmament Market: Echo (scores twice), Glass (doubled, but may shatter), Kinship (counts as its left neighbor for reactions), Ember (explodes on its top two faces) and Anchor (never fizzles).',
        'Cinco Runas para tus dados, a la venta en la Forja y en el Mercado del Firmamento: Eco (anota dos veces), Cristal (doble, pero puede romperse), Parentesco (cuenta como su vecino izquierdo en las reacciones), Brasa (explota con sus dos caras más altas) y Ancla (nunca se apaga).',
      ),
      L('A new song for the Observatory, and three secret achievements.', 'Una canción nueva para el Observatorio, y tres logros secretos.'),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.7.2',
    name: L('Firmament depth', 'Profundidad del Firmamento'),
    date: null,
    highlights: [
      L(
        'Five Celestial dice, sold only past the door: Comet (explodes on its top two faces and scores twice when it does), Pulsar (+1 Base per reroll this round), Satellite (lifts the dice beside it), Quasar (its face goes to Mult; one per run) and Zenith (extra rerolls every round).',
        'Cinco dados Celestiales, solo a la venta más allá de la puerta: Cometa (explota con sus dos caras más altas y anota doble cuando lo hace), Púlsar (+1 Base por reroll de la ronda), Satélite (levanta a los dados de al lado), Cuásar (su cara va al Mult; uno por partida) y Cénit (rerolls extra cada ronda).',
      ),
      L(
        'The Horologist never sells the same shop twice: six offers a visit, drawn from a pool. Chrono is always there.',
        'El Relojero nunca vende la misma tienda dos veces: seis ofertas por visita, sacadas de un grupo. Crono siempre está.',
      ),
      L(
        'New time items: the Hourglass (3 free rerolls), Pocket Watch (a die starts next round held), Metronome (+1 Mult for 3 rounds) and Almanac (the next three targets and the next boss, exactly).',
        'Objetos de tiempo nuevos: el Reloj de Arena (3 rerolls gratis), el Reloj de Bolsillo (un dado empieza guardado la próxima ronda), el Metrónomo (+1 Mult por 3 rondas) y el Almanaque (los próximos tres objetivos y el próximo jefe, con exactitud).',
      ),
      L(
        'Two time relics: the Mainspring (banks unused rerolls) and the Cuckoo Clock (clear with no rerolls left for Shards and a Mult).',
        'Dos reliquias de tiempo: el Resorte Maestro (guarda los rerolls sin usar) y el Reloj de Cuco (supera una ronda sin rerolls para ganar Fragmentos y un Mult).',
      ),
      L(
        'The Astral Exchange always has a Celestial die on its shelf, and Firmament Markets offer them now and then.',
        'El Intercambio Astral siempre tiene un dado Celestial en su estante, y los Mercados del Firmamento los ofrecen de vez en cuando.',
      ),
      L(
        'The cast now names the helper when a Beacon, Satellite or Mirror changes a die, and lights it up.',
        'El lanzamiento ahora nombra al ayudante cuando un Faro, Satélite o Espejo cambia un dado, y lo ilumina.',
      ),
      L('The Horologist has a few more things to say.', 'El Relojero tiene algunas cosas más que decir.'),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.7.1',
    name: L('Settling in', 'Asentándose'),
    date: null,
    highlights: [
      L(
        'Neutral is easier to reach: the Primordial path now needs a stronger pull (+8 instead of +6). The Split is still hard on purpose, but a pool that stays in one element family now leans toward it.',
        'Neutral es más fácil de alcanzar: el camino del Primordial ahora pide un empuje mayor (+8 en vez de +6). La División sigue siendo difícil a propósito, pero una reserva que se queda en una sola familia de elemento ahora se inclina hacia ella.',
      ),
      L(
        'Nix only offers pacts you can actually pay.',
        'Nix solo ofrece pactos que de verdad puedes pagar.',
      ),
      L(
        'The Road shows a portal where round 15 meets the Firmament.',
        'El Camino muestra un portal donde la ronda 15 se une con el Firmamento.',
      ),
      L(
        'The Gallery keeps dice you have not unlocked in an Unlocks box: no family, no rarity, nothing spoiled.',
        'La Galería guarda los dados que aún no desbloqueas en una caja de Desbloqueos: sin familia, sin rareza, sin spoilers.',
      ),
      L(
        'Nine new secret reactions for the Mythic dice, and 23 new achievements (most of them secret).',
        'Nueve reacciones secretas nuevas para los dados Míticos, y 23 logros nuevos (casi todos secretos).',
      ),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.7',
    name: L('The Firmament', 'El Firmamento'),
    date: null,
    highlights: [
      L(
        'A door past the last Circle. Once you have seen a path\'s ending, winning round 15 on that path again leads to the Crossroads: rest there, or walk into the Firmament and keep the same run going, everything you carry included.',
        'Una puerta más allá del último Círculo. Cuando ya viste el final de un camino, volver a ganar la ronda 15 en ese camino te lleva a la Encrucijada: descansa ahí, o entra al Firmamento y sigue la misma partida, con todo lo que llevas.',
      ),
      L(
        'Rounds 16 to 30, with a Warden at 20, 25 and 30. Six Wardens in two sets of three, each with its own twist: The Dawn, The Umbra, The Clockwork (a real 90-second countdown), The Expanse, The Maelstrom and The Hollow.',
        'Rondas 16 a 30, con un Custodio en la 20, la 25 y la 30. Seis Custodios en dos grupos de tres, cada uno con su giro: El Alba, La Umbra, El Mecanismo (una cuenta regresiva real de 90 segundos), La Extensión, La Vorágine y El Hueco.',
      ),
      L(
        'Six new endings: Firmament I and Firmament II for each path. The Endings tab now has nine cards, with hints for the ones you have not reached.',
        'Seis finales nuevos: Firmamento I y Firmamento II para cada camino. La pestaña de Finales ahora tiene nueve cartas, con pistas para las que aún no alcanzas.',
      ),
      L(
        'Mythic dice, a new rarity: Light, Darkness, Time, Space, Chaos and Void. Each Warden guards one, and beating it for the first time puts that die in the Firmament\'s shops. One of each per run.',
        'Dados Míticos, una nueva rareza: Luz, Oscuridad, Tiempo, Espacio, Caos y Vacío. Cada Custodio guarda uno, y vencerlo por primera vez pone ese dado en las tiendas del Firmamento. Uno de cada tipo por partida.',
      ),
      L(
        'Warp: a die with Warp does not count toward your dice cap (up to 3). The Space die always has it, the Warp Seal gives it, and Firmament offers sometimes come with it.',
        'Warp: un dado con Warp no cuenta para tu límite de dados (hasta 3). El dado Espacio siempre lo tiene, el Sello Warp lo da, y a veces las ofertas del Firmamento vienen con él.',
      ),
      L(
        'Chrono is now Kairos. The new Chrono lives in the Firmament: a 1 rewinds time and rerolls your whole table, keeping the better roll.',
        'Crono ahora es Kairós. El nuevo Crono vive en el Firmamento: un 1 rebobina el tiempo y vuelve a tirar toda tu mesa, quedándose con la mejor tirada.',
      ),
      L(
        'Beat all six Wardens to learn Entropy: every Mythic die and Aether, forged into one. Aether, the Mythic dice and Entropy can grow past d20, all the way to d100.',
        'Vence a los seis Custodios para aprender la Entropía: todos los dados Míticos y el Éter, forjados en uno. El Éter, los dados Míticos y la Entropía pueden crecer más allá de d20, hasta d100.',
      ),
      L(
        'New keepers: Atlas redraws the Road, the Horologist sells time, and Mote buys anything you will sell it. It is very hungry. Tobb, Aeris and Nix follow you through the door.',
        'Nuevos guardianes: Atlas redibuja el Camino, el Relojero vende tiempo, y Mote compra todo lo que le vendas. Tiene mucha hambre. Tobb, Aeris y Nix te siguen al cruzar la puerta.',
      ),
      L(
        'Story scenes before every big fight, a longer vision of the four gods, and a scene for learning the recipes, with a new achievement, Remembering. Skip any of them, and replay them from the Endings tab.',
        'Escenas de historia antes de cada pelea grande, una visión más larga de los cuatro dioses, y una escena al aprender las recetas, con un logro nuevo, Recordar. Puedes saltar cualquiera, y repetirlas desde la pestaña de Finales.',
      ),
      L(
        'New music for the Wardens, the new shops and the scenes.',
        'Música nueva para los Custodios, las tiendas nuevas y las escenas.',
      ),
    ],
  },
  {
    stage: 'Alpha',
    version: '0.6.7',
    name: L('Showtime', 'Función'),
    date: null,
    highlights: [
      L(
        'The cast is now a show. Every step follows the Cast ledger in order, and you can see who is doing what.',
        'El lanzamiento ahora es un espectáculo. Cada paso sigue la cuenta del hechizo en orden, y se ve quién hace qué.',
      ),
      L(
        'The source lights up: the die lifts, a reaction draws a line between its two dice, a set is outlined and named, a relic or pact bounces.',
        'La fuente se ilumina: el dado se levanta, una reacción traza una línea entre sus dos dados, un set se enmarca con su nombre, una reliquia o pacto rebota.',
      ),
      L(
        'A number pops out of it, blue for Base, red for Mult and a big red one for a multiplier, and flies into the Base or Mult box, which pulses and ticks up. A multiplier shakes the Mult box.',
        'Sale un número, azul para Base, rojo para Mult y uno rojo grande para un multiplicador, y vuela hasta la caja de Base o Mult, que pulsa y sube. Un multiplicador sacude la caja de Mult.',
      ),
      L(
        'A caption under the score names the source, for example "Kindle: Fire + Air, +1 Mult".',
        'Un letrero bajo el puntaje nombra la fuente, por ejemplo "Yesca: Fuego + Aire, +1 Mult".',
      ),
      L(
        'Each step ticks higher than the last, with a heavier hit for multipliers.',
        'Cada paso suena más agudo que el anterior, con un golpe más pesado para los multiplicadores.',
      ),
      L(
        'It follows your scoring speed (Instant skips the show) and Reduced motion: numbers and captions stay, flying and shaking go.',
        'Sigue tu velocidad de puntaje (Instantáneo se salta el espectáculo) y Reducir movimiento: los números y letreros se quedan, el vuelo y las sacudidas se van.',
      ),
      L(
        'A Jukebox: every song in the game, playable and editable. Open it from Options, Audio.',
        'Una Rockola: todas las canciones del juego, para escuchar y editar. Ábrela desde Opciones, Audio.',
      ),
    ],
  },
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
        'Fixed Kindling handing out rerolls from forced 1s: only a die that really fizzles pays one back now.',
        'Arreglado Avivar, que daba relanzamientos por 1 forzados: ahora solo paga uno un dado que de verdad se apaga.',
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
