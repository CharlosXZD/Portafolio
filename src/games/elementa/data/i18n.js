// Spanish translations for game *content* (element/relic/consumable/deck/
// difficulty/boss names & copy), kept as a separate lookup-by-id table
// rather than rewriting every entry in elements.js/relics.js/etc. into
// {en, es} pairs in place. Two reasons: those files are read by the
// reducer/scoring engine as plain data (id, flags, effects), so keeping
// them English-only-and-untouched avoids any risk of a translation pass
// nicking a field the engine actually reads; and it mirrors the site's own
// convention (src/i18n/strings.js) of translation content living in one
// place, separate from the logic that uses it.
//
// `localize(en, dict, id, field)` is the lookup: pass the English fallback
// string, the relevant dictionary below, the item's id, and the field name.
export function localize(lang, en, dict, id, field) {
  if (lang !== 'es') return en
  return dict[id]?.[field] ?? en
}

export const ELEMENTS_ES = {
  earth: { name: 'Tierra', tagline: 'Relleno confiable. Sin riesgo, sin desventaja.' },
  fire: { name: 'Fuego', tagline: 'Volátil. Explota al máximo, se apaga con un 1.' },
  water: { name: 'Agua', tagline: 'Manipulación. Bloqueos gratis que recargan tus rerolls.' },
  air: { name: 'Aire', tagline: 'Combo. Premia formar sets iguales en toda la reserva.' },
  lightning: {
    name: 'Relámpago',
    tagline: 'Las explosiones encadenadas revisan el bono de set a mitad de tirada.',
  },
  ice: { name: 'Hielo', tagline: 'Las caras bloqueadas cuentan para los sets. Fabrica una escalera.' },
  steel: {
    name: 'Acero',
    tagline: 'Explota como el Fuego, pero la confiabilidad de la Tierra elimina la desventaja.',
  },
  mud: { name: 'Lodo', tagline: 'Bloquear este dado también bloquea el siguiente gratis.' },
  steam: { name: 'Vapor', tagline: 'Al volver a tirarlo puede duplicar el resultado en otro dado.' },
  crystal: { name: 'Cristal', tagline: 'Cuenta doble cuando forma parte de un set igual.' },
  storm: { name: 'Tormenta', tagline: 'Fabrica un set con un bloqueo gratis, luego detónalo.' },
  obsidian: {
    name: 'Obsidiana',
    tagline: 'Valor seguro y acumulativo. Explota sin el riesgo de apagarse.',
  },
  magma: { name: 'Magma', tagline: 'Los totales explotados pueden duplicarse si forman parte de un set.' },
  monsoon: {
    name: 'Monzón',
    tagline: 'Un bloqueo, dos dados se unen a un set: la forma más barata de armar combos.',
  },
  aether: { name: 'Éter', tagline: 'Todos los mecanismos en un solo dado. Limitado a uno por partida.' },
  midas: { name: 'Dorado', tagline: 'No anota nada. Paga su cara en Fragmentos al superar la ronda.' },
  sapling: { name: 'Brote', tagline: 'Crece +2 por cada reroll que se queda guardado. Relanzarlo lo reinicia.' },
  mirror: { name: 'Espejo', tagline: 'Copia el puntaje del dado a su izquierda.' },
  conduit: { name: 'Conducto', tagline: 'Sus dos vecinos reaccionan entre sí como si se tocaran, y esas reacciones cuentan doble.' },
  kairos: { name: 'Kairós', tagline: 'Un 1 retrocede y vuelve a tirarse, hasta que deja de ser 1.' },
  beacon: { name: 'Faro', tagline: 'Los dados a sus lados anotan x1.5.' },
  prism: { name: 'Prisma', tagline: 'Cuenta como los cuatro elementos para reaccionar con sus vecinos.' },
  bullion: { name: 'Lingote', tagline: 'No anota nada. Paga tu Multiplicador final en Fragmentos al superar la ronda.' },
  masquerade: { name: 'Mascarada', tagline: 'Copia las habilidades y el puntaje del dado a su izquierda.' },
  gaea: { name: 'Gaea', tagline: 'La diosa de la Tierra. Saca su poder de toda su familia.' },
  ognen: { name: 'Ognen', tagline: 'El dios del Fuego. Arde con cualquier cara por encima de la mitad.' },
  varuna: { name: 'Varuna', tagline: 'La diosa del Agua. Todo dado se dobla ante su marea.' },
  zephyr: { name: 'Zephyr', tagline: 'El dios del Aire. Eleva cada set un escalón.' },
  primordial_die: { name: 'Primordial', tagline: 'Todos los mecanismos del Éter, y el poder de cada dios que derrotes.' },
  chameleon: { name: 'Camaleón', tagline: 'Copia las habilidades del dado a su izquierda y el puntaje del dado a su derecha.' },
  // The Firmament (EXPANSION.md H3 to H5).
  chrono: { name: 'Crono', tagline: 'Un 1 rebobina el tiempo: todo dado no guardado vuelve a tirarse, y te quedas con la mejor reserva.' },
  light: { name: 'Luz', tagline: 'Ningún dado puede anotar menos que su cara. Nada se apaga y las caras siguen visibles.' },
  darkness: { name: 'Oscuridad', tagline: 'Los dados a sus lados anotan 0. Lo que habrían anotado va a tu Multiplicador.' },
  time: { name: 'Tiempo', tagline: 'Una vez por ronda, deshaz tu último reroll y recupéralo. Los rerolls sin usar pasan a la siguiente ronda, hasta +3.' },
  space: { name: 'Espacio', tagline: 'Sus dos vecinos y los dos dados de los extremos cuentan como vecinos entre sí. Siempre Warp.' },
  chaos: { name: 'Caos', tagline: 'En cada tirada se vuelve un dado al azar de todo el juego, de un tamaño al azar.' },
  void: { name: 'Vacío', tagline: 'No anota nada. Cada espacio vacío que tengas da +1 Multiplicador.' },
  entropy: { name: 'Entropía', tagline: 'Todo a la vez. Anota su cara + 104, y +10 Multiplicador.' },
}

// Keyed by the flag's string value (FLAGS.EXPLODE === 'explode', etc.), not
// by an id, since flag descriptions aren't per-item.
export const FLAG_DESCRIPTIONS_ES = {
  explode: 'Sacar la cara máxima vuelve a tirar y suma de nuevo, encadenando.',
  zeroOnMin: 'Sacar un 1 anota 0 esta ronda.',
  freeLock: 'Puede bloquear su cara gratis (sin gastar un reroll).',
  grantsRerollOnLock: 'Bloquearlo otorga +1 reroll.',
  adjacentFreeLock: 'Bloquearlo también bloquea el siguiente dado gratis.',
  duplicateOnReroll: 'Al volver a tirarlo puede copiar su resultado en otro dado.',
  enablesSetBonus: 'Activa el bono de set igual para toda la reserva.',
  doubleOnSet: 'Cuenta doble cuando forma parte de un set igual.',
  midas: 'Anota 0, pero su cara se paga en Fragmentos al superar la ronda.',
  grows: 'Gana +2 por cada reroll que se queda fuera.',
  mirrorLeft: 'Copia el puntaje del dado a su izquierda.',
  conduit: 'Conecta las reacciones entre sus dos vecinos, y las duplica.',
  kairos: 'Un 1 se vuelve a tirar gratis hasta que deja de ser 1.',
  chronoLoop: 'Cuando saca un 1, todo dado no guardado vuelve a tirarse gratis (él también), y te quedas con la mejor reserva. Hasta 8 veces.',
  lightFloor: 'Ningún dado puede anotar menos que su cara: las caras menores suben hasta ella, y nada se apaga. Las caras siguen visibles bajo el Eclipse.',
  darkness: 'Los dados a sus lados anotan 0, y su puntaje combinado se suma a tu Multiplicador.',
  timeRewind: 'Una vez por ronda, Rebobinar: deshaz tu último reroll y recupéralo. Los rerolls sin usar pasan a la siguiente ronda, hasta +3.',
  spaceLink: 'Sus dos vecinos y los dos dados de los extremos cuentan como vecinos entre sí para las reacciones.',
  chaos: 'En cada tirada se vuelve un dado al azar de todo el juego, de un tamaño al azar. Bloquearlo conserva su forma.',
  void: 'Anota 0. Cada espacio vacío de dados, reliquias y consumibles da +1 Multiplicador.',
  entropy: 'Anota su cara + 104, y suma +10 a tu Multiplicador.',
  beacon: 'Ambos vecinos anotan x1.5.',
  bullion: 'Anota 0, pero paga tu Multiplicador final (redondeado hacia abajo) en Fragmentos al superar la ronda.',
  mimicLeft: 'Actúa como el dado a su izquierda: sus habilidades y su puntaje.',
  mimicSplit: 'Actúa como el dado a su izquierda, pero anota lo que anota el dado a su derecha.',
  allElements: 'Reacciona como Fuego, Agua, Tierra y Aire a la vez.',
}

export const RELICS_ES = {
  molten_core: { name: 'Núcleo Fundido', description: 'Cada explosión suma +2 al Valor Base.' },
  riverstone: {
    name: 'Piedra de Río',
    description: 'Bloquear un dado de la familia Agua otorga +2 rerolls en vez de +1.',
  },
  stormcaller: {
    name: 'Convocatormentas',
    description: 'El bono de escalera otorga +1 Multiplicador adicional.',
  },
  bedrock: { name: 'Lecho Rocoso', description: 'Los dados de Tierra pura contribuyen ×1.5 al Valor Base.' },
  glass_cannon: {
    name: 'Cañón de Cristal',
    description:
      'Las explosiones suman el doble, pero un dado que se apaga con un 1 también anula otro dado al azar.',
  },
  undertow: {
    name: 'Resaca',
    description: 'Bloquear un dado de bloqueo libre también vuelve a tirar gratis un dado suelto al azar.',
  },
  petrify: {
    name: 'Petrificar',
    description: 'Una vez por ronda, congela gratis la cara de cualquier dado, sin importar el elemento.',
  },
  wildfire: {
    name: 'Fuego Salvaje',
    description:
      'Cada explosión tiene 20% de probabilidad de activar también una explosión en otro dado de la familia Fuego.',
  },
  tidal_pool: {
    name: 'Poza de Marea',
    description: 'El bono de set se duplica si todos los dados del set son de la familia Agua.',
  },
  groundswell: { name: 'Marejada', description: 'Si toda la reserva es de Tierra pura, el Valor Base es +50%.' },
  static_charge: {
    name: 'Carga Estática',
    description: 'Las cadenas de explosión ya no tienen límite de iteraciones.',
  },
  momentum: {
    name: 'Momentum',
    description: 'Superar el objetivo por 2x o más otorga +1 reroll permanente para el resto de la partida.',
  },
  shard_vault: {
    name: 'Bóveda de Fragmentos',
    description: 'El límite de interés sube de +5 a +8 Fragmentos por ronda.',
  },
  discount_merchant: {
    name: 'Comerciante con Descuento',
    description: 'Todos los precios de la tienda se reducen un 10%.',
  },
  overclock: {
    name: 'Sobrecarga',
    description:
      '+1 reroll máximo por ronda, pero cada dado tiene 10% de probabilidad de resetear a su cara mínima al volver a tirarlo.',
  },
  fossil: {
    name: 'Fósil',
    description: 'Los dados de Tierra son comodines para el bono de set: igualan cualquier valor de cara.',
  },
  fusion_catalyst: {
    name: 'Catalizador de Fusión',
    description: 'Forjar un dado de fusión en la Forja cuesta 2 Fragmentos menos.',
  },
  deep_pockets: {
    name: 'Bolsillos Profundos',
    description: 'Volver a tirar las ofertas de la tienda cuesta 1 Fragmento menos.',
  },
  windfall: {
    name: 'Golpe de Suerte',
    description: 'El interés se gana cada 2 Fragmentos sin gastar en vez de cada 3.',
  },
  hoarder: { name: 'Acaparador', description: 'Vender un dado o reliquia devuelve +1 Fragmento extra.' },
  steadfast: { name: 'Firme', description: 'Fallar el objetivo igual otorga +3 Fragmentos como consuelo.' },
  safety_net: {
    name: 'Red de Seguridad',
    description: 'La primera vez que te quedarías sin vidas, sobrevives con 1 en su lugar.',
  },
  loaded_die: { name: 'Dado Cargado', description: 'Los dados que muestran su cara más alta suman +3 a la Base.' },
  tide_chart: { name: 'Carta de Mareas', description: 'Cada dado bloqueado o congelado suma +3 a la Base.' },
  feather_charm: { name: 'Amuleto de Pluma', description: 'Los pares otorgan +1 Multiplicador extra.' },
  lucky_coin: {
    name: 'Moneda de la Suerte',
    description: 'Superar una ronda otorga +1 Fragmento por cada explosión de la tirada ganadora.',
  },
  ember_heart: { name: 'Corazón de Brasa', description: 'Cada dado que explota suma +1 Multiplicador.' },
  keystone: { name: 'Piedra Angular', description: '+1 Multiplicador si ningún dado anota 0 en esta tirada.' },
  hourglass: {
    name: 'Reloj Paciente',
    description: '+0.5 Multiplicador por cada reroll que no usaste al lanzar.',
  },
  prism_lens: { name: 'Lente Prisma', description: '+0.5 Multiplicador por cada elemento distinto en tu reserva.' },
  glacier_heart: { name: 'Corazón de Glaciar', description: 'Los dados bloqueados y congelados anotan el doble.' },
  fusion_crucible: { name: 'Crisol de Fusión', description: 'Los dados de fusión anotan x1.5.' },
  aether_crown: { name: 'Corona de Éter', description: 'Tu Multiplicador final es x1.5.' },
  alchemists_table: { name: 'Mesa del Alquimista', description: 'Cada reacción también suma +2 a la Base.' },
  bookends: { name: 'Sujetalibros', description: 'Tu primer y último dado anotan +4 cada uno.' },
  catalyst_stone: { name: 'Piedra Catalizadora', description: 'Las reacciones que dan Mult dan +0.5 más.' },
  heart_of_circle: { name: 'Corazón del Círculo', description: 'El dado del medio (o los dos) de tu reserva anota el doble.' },
  ley_line: { name: 'Línea Ley', description: 'Tu primer y último dado cuentan como vecinos, así que pueden reaccionar.' },
  heat: { name: 'Calor', description: 'Cada explosión de esta ronda da +1 a todo dado de la familia Fuego por el resto de la ronda.' },
  gust: { name: 'Ráfaga', description: 'Una vez por ronda, vuelve a tirar un dado elegido gratis.' },
  steady: { name: 'Firmeza', description: 'Los dados de la familia Tierra nunca sacan menos de 3.' },
  chain_break: {
    name: 'Cadena Rota',
    description: 'Los dados de la familia Fuego explotan con sus dos caras más altas. La cadena de Ognen no tiene límite.',
  },
  pantheon: { name: 'Panteón', description: 'Puedes tener un segundo dado dios.' },
}

export const CONSUMABLES_ES = {
  upgrade_stone: {
    name: 'Piedra de Mejora',
    description: 'Aplícala a un dado para subir su nivel un escalón (d6 a d10, etc.).',
  },
  extra_reroll: {
    name: 'Reroll Extra',
    description: 'Otorga +1 reroll permanente para el resto de la partida.',
  },
  transmute_earth: {
    name: 'Transmutar: Tierra',
    description: 'Aplícala a un dado para cambiar su elemento a Tierra, conservando su nivel.',
  },
  transmute_water: {
    name: 'Transmutar: Agua',
    description: 'Aplícala a un dado para cambiar su elemento a Agua, conservando su nivel.',
  },
  transmute_air: {
    name: 'Transmutar: Aire',
    description: 'Aplícala a un dado para cambiar su elemento a Aire, conservando su nivel.',
  },
  transmute_fire: {
    name: 'Transmutar: Fuego',
    description: 'Aplícala a un dado para cambiar su elemento a Fuego, conservando su nivel.',
  },
  whetstone: { name: 'Piedra de Afilar', description: 'Aplícala a un dado: anota +2 permanente cada vez que anote.' },
  chisel: {
    name: 'Cincel',
    description: 'Parte un dado en dos del tamaño anterior (d20 en dos d10, d10 en dos d5, d6 en dos d3). Un d5 se astilla en un d3 y deja una Transmutación. Un d3 es demasiado pequeño.',
  },
  phoenix_feather: { name: 'Pluma de Fénix', description: 'Recupera 1 vida.' },
  aether_dust: {
    name: 'Polvo de Éter',
    description: 'Aplícalo a un dado puro para convertirlo en una fusión doble aleatoria que contenga su elemento.',
  },
  shard_pouch: { name: 'Bolsa de Fragmentos', description: 'Gana Fragmentos igual al doble de la ronda actual (mínimo 4).' },
  lucky_charm: { name: 'Amuleto de la Suerte', description: '+3 relanzamientos: en esta ronda si lo usas durante una, si no en la próxima.' },
  fusion_spark: {
    name: 'Chispa de Fusión',
    description: 'Abre la Forja de Fusión en esta tienda, aunque no hayas vencido a un jefe.',
  },
  mirror_shard: {
    name: 'Fragmento de Espejo',
    description: 'Aplícalo a un dado para añadir una copia exacta a tu reserva (necesita un espacio libre).',
  },
  loom_of_fate: { name: 'Telar del Destino', description: 'Renueva las ofertas de la tienda, gratis.' },
  stopwatch: { name: 'Cronómetro', description: 'Durante una ronda: deshaz tu último reroll y recupéralo.' },
  time_capsule: { name: 'Cápsula del Tiempo', description: 'Guarda 2 rerolls para la próxima ronda.' },
  warp_seal: {
    name: 'Sello Warp',
    description: 'Aplícalo a un dado para darle Warp: deja de contar para tu límite de dados (como mucho 3 dados Warp).',
  },
  arcane_seal: {
    name: 'Sello Arcano',
    description: 'Aplícalo a un dado para convertirlo en un dado Arcano raro o épico aleatorio, conservando su nivel.',
  },
}

export const DECKS_ES = {
  balanced: { name: 'Invocapiedras', tagline: 'Piedra firme. Sin riesgo, sin trucos.' },
  tidecaller: { name: 'Llamamareas', tagline: 'Bloqueos gratis que alimentan tus rerolls.' },
  tempest: { name: 'Tempestad', tagline: 'Sets desde la primera tirada.' },
  pyromancer: { name: 'Piromante', tagline: 'Pura explosión, sin red de seguridad.' },
  wanderer: { name: 'Errante', tagline: 'Uno de cada elemento. Fusiona lo que sea.' },
  forgeborn: { name: 'Forjado', tagline: 'Empieza con Acero: fuego sin apagarse.' },
  stormchaser: { name: 'Cazatormentas', tagline: 'Encadena explosiones directo a los sets.' },
  avatar: { name: 'Avatar', tagline: 'Maestro de los cuatro. Empieza con Éter.' },
}

export const DIFFICULTIES_ES = {
  ember: { name: 'Brasa', tagline: 'La partida base. Sin giros.' },
  blaze: { name: 'Llamarada', tagline: 'Brasa, pero cada objetivo se duplica.' },
  inferno: {
    name: 'Infierno',
    tagline: 'Llamarada, pero 1 reroll menos y un límite de 4 dados en la reserva.',
  },
  cataclysm: {
    name: 'Cataclismo',
    tagline: 'Infierno, pero cada ronda es una ronda de jefe y los objetivos se triplican.',
  },
}

// Small convenience wrappers for the handful of places that render a whole
// deck/difficulty/boss-modifier object directly (title screen, HUD, shop)
// rather than going through itemDescriptors.js.
export function localizeDeck(deck, lang) {
  return {
    ...deck,
    name: localize(lang, deck.name, DECKS_ES, deck.id, 'name'),
    tagline: localize(lang, deck.tagline, DECKS_ES, deck.id, 'tagline'),
  }
}

export function localizeDifficulty(difficulty, lang) {
  return {
    ...difficulty,
    name: localize(lang, difficulty.name, DIFFICULTIES_ES, difficulty.id, 'name'),
    tagline: localize(lang, difficulty.tagline, DIFFICULTIES_ES, difficulty.id, 'tagline'),
  }
}

export function localizeBossModifier(modifier, lang) {
  if (!modifier) return modifier
  return {
    ...modifier,
    name: localize(lang, modifier.name, BOSS_MODIFIERS_ES, modifier.id, 'name'),
    description: localize(lang, modifier.description, BOSS_MODIFIERS_ES, modifier.id, 'description'),
  }
}

export const BOSS_MODIFIERS_ES = {
  calm_winds: {
    name: 'Vientos Calmos',
    description: 'Las explosiones no encadenan esta ronda: la cara máxima suma una vez y se detiene.',
  },
  grounded: { name: 'Aterrizado', description: 'Los sets iguales no otorgan Multiplicador esta ronda.' },
  iron_grip: {
    name: 'Puño de Hierro',
    description: 'Solo se permite 1 reroll esta ronda, sin importar cuántos tengas.',
  },
  null_zone: { name: 'Zona Nula', description: 'Uno de tus elementos no anota nada esta ronda.' },
  ermal: { name: 'Ermal el Imperturbable', description: 'No hace absolutamente nada. Disfruta el descanso.' },
  drought: { name: 'Sequía', description: 'Ningún dado puede usar un bloqueo gratis esta ronda.' },
  tax_collector: { name: 'Recaudador', description: 'Cada reroll cuesta 1 Fragmento esta ronda.' },
  scatter: { name: 'Dispersión', description: 'Las escaleras no cuentan esta ronda. Pares y tríos sí.' },
  gravity_well: { name: 'Pozo Gravitatorio', description: 'Las caras mayores a 4 anotan la mitad esta ronda.' },
  the_pillar: { name: 'El Pilar', description: 'Tu dado con mayor puntaje anota 0 esta ronda.' },
  frostbite: { name: 'Congelación', description: 'Un dado aleatorio empieza la ronda congelado en 1.' },
  eclipse: { name: 'Eclipse', description: 'Las caras de tus dados están ocultas hasta que lances.' },
  silence: { name: 'Silencio', description: 'Una de tus reliquias queda sellada y no hace nada esta ronda.' },
  primordial: { name: 'Primordial', description: 'El jefe final. Su giro cambia cada vez que relanzas.' },
  // The gauntlet of the Primordial path (B1).
  gaea: { name: 'Gaea', description: 'Tus dados de la familia Tierra anotan -5 (-10 con un 1).' },
  ognen: { name: 'Ognen', description: 'Tus dados de la familia Fuego se apagan con 1, 2 y 3.' },
  varuna: { name: 'Varuna', description: 'Los 1 salen un 50% más seguido en todos los dados.' },
  zephyr: {
    name: 'Zephyr',
    description: 'Tus dados de la familia Fuego explotan la mitad de las veces, y los sets necesitan un dado más.',
  },
  // The Wardens of the Firmament (EXPANSION.md H2).
  dawn: { name: 'El Alba', description: 'Sobreexposición: los dados que muestran su cara máxima anotan 0.' },
  umbra: {
    name: 'La Umbra',
    description: 'Las caras están ocultas hasta que lances, y cada reroll se traga un dado no guardado por la ronda.',
  },
  clockwork: { name: 'El Mecanismo', description: 'Una cuenta regresiva de 90 segundos. En 0, se lanza lo que haya en la mesa.' },
  expanse: { name: 'La Extensión', description: 'El orden de tus dados se baraja después de cada reroll.' },
  maelstrom: {
    name: 'La Vorágine',
    description: 'Después de cada reroll, cada dado no guardado se vuelve un elemento puro al azar por la ronda.',
  },
  hollow: { name: 'El Hueco', description: 'Todas las reliquias quedan selladas y no se pueden usar consumibles esta ronda.' },
}

export const REACTIONS_ES = {
  resonance: { name: 'Resonancia', description: 'Dos dados idénticos juntos: +2 Base.' },
  kindle: { name: 'Avivar', description: 'El Aire alimenta al Fuego: +1 Mult.' },
  forge: { name: 'Forja', description: 'El Fuego templa la Tierra: suma la cara menor de los dos a la Base.' },
  scald: { name: 'Escaldar', description: 'El Agua choca con el Fuego: +3 Base y +0.5 Mult.' },
  mist: { name: 'Neblina', description: 'El Agua viaja en el Aire: +0.5 Mult.' },
  bloom: { name: 'Florecer', description: 'El Agua nutre la Tierra: suma la cara mayor de los dos a la Base.' },
  dust: { name: 'Remolino', description: 'El Aire levanta la Tierra: +4 Base.' },
  thunderhead: { name: 'Nubarrón', description: 'Relámpago junto a Vapor: se forma una tormenta. +2 Mult.' },
  superconductor: {
    name: 'Superconductor',
    description: 'Relámpago junto a Hielo: corriente sin resistencia. +5 Base, +1.5 Mult.',
  },
  thermal_shock: {
    name: 'Choque Térmico',
    description: 'Hielo junto a Magma: la piedra se parte. Suma ambas caras a la Base, +1 Mult.',
  },
  geode: { name: 'Geoda', description: 'Lodo junto a Cristal: una geoda oculta. Suma ambas caras dos veces a la Base.' },
  railgun: { name: 'Cañón de Riel', description: 'Acero junto a Relámpago: lanzamiento magnético. +3 Mult.' },
  hurricane: { name: 'Huracán', description: 'Tormenta junto a Monzón: el cielo se rompe. +8 Base, +3 Mult.' },
  caldera: {
    name: 'Caldera',
    description: 'Obsidiana junto a Magma: el volcán colapsa. Suma ambas caras dos veces a la Base, +1 Mult.',
  },
  ascension: {
    name: 'Ascensión',
    description: 'Éter junto a cualquier fusión: los elementos recuerdan que eran uno. +10 Base, +3 Mult.',
  },
}

export function localizeReaction(reaction, lang) {
  return {
    ...reaction,
    name: localize(lang, reaction.name, REACTIONS_ES, reaction.id, 'name'),
    description: localize(lang, reaction.description, REACTIONS_ES, reaction.id, 'description'),
  }
}
