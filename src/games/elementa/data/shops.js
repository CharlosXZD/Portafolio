// Shop types (GDD §28). Every shop on the Road map (engine/map.js) is one
// of these. The Market is the classic shop; the others each lean into one
// part of the economy, and the Aether Bazaar is all of them at once.
//
// Fields the reducer reads (engine/gameReducer.js buildShopOffers):
//   dice / items      how many die and item offers to roll
//   itemKinds         which item kinds the item shelf can hold
//   relicLuck         'vault' weighting: rarer relics, unlocked earlier
//   forge             the Fusion Forge is open
//   upgrades          die size upgrades can be bought
//   brew              two consumables can be brewed into a stronger one
//   deals             how many Black Market deals to offer (take one)
//   blessings         how many Shrine blessings to offer (take one), plus the prophecy
//   discount          extra price cut on everything here (0 to 1)
//   consumableDiscount extra cut on consumables only
//   reroll            the offers can be rerolled for Shards
//   camp              the safety camp after a missed round (not on the Road)
//   dieStock / consumableStock   a fixed stock instead of the rarity pools
//   services          Atlas's map services (Redraw, Add a path, Peek)
//   pantry            Mote buys your goods and keeps a secret stock
const L = (en, es) => ({ en, es })

export const SHOP_TYPES = {
  market: {
    id: 'market',
    keeper: 'tobb',
    name: L('Market', 'Mercado'),
    blurb: L('Dice, relics and consumables. The classic shop.', 'Dados, reliquias y consumibles. La tienda de siempre.'),
    color: '#e5a53d',
    music: 'shop_market',
    dice: 3,
    items: 4,
    itemKinds: ['relic', 'consumable'],
    reroll: true,
  },
  alchemist: {
    id: 'alchemist',
    keeper: 'vessa',
    name: L('Alchemist', 'Alquimista'),
    blurb: L('Consumables only, 20% off. Brew two into a stronger one.', 'Solo consumibles, 20% menos. Destila dos en uno más fuerte.'),
    color: '#4fd1a5',
    music: 'shop_alchemist',
    dice: 0,
    items: 5,
    itemKinds: ['consumable'],
    brew: true,
    consumableDiscount: 0.2,
    reroll: true,
  },
  vault: {
    id: 'vault',
    keeper: 'curator',
    name: L('Relic Vault', 'Bóveda de Reliquias'),
    blurb: L('Three rarer relics. Shows up after bosses.', 'Tres reliquias más raras. Aparece después de los jefes.'),
    color: '#c8b6ff',
    music: 'shop_vault',
    dice: 0,
    items: 3,
    itemKinds: ['relic'],
    relicLuck: true,
    reroll: true,
  },
  forge: {
    id: 'forge',
    keeper: 'brasa',
    name: L('Forge', 'Forja'),
    blurb: L('The Fusion Forge and die size upgrades.', 'La Forja de Fusión y mejoras de tamaño de dado.'),
    color: '#ff7a1a',
    music: 'shop_forge',
    dice: 2,
    items: 0,
    itemKinds: [],
    forge: true,
    upgrades: true,
    reroll: true,
  },
  blackmarket: {
    id: 'blackmarket',
    keeper: 'nix',
    name: L('Black Market', 'Mercado Negro'),
    blurb: L('Rare. One risky deal, paid in more than Shards.', 'Rara. Un trato arriesgado que se paga con más que Fragmentos.'),
    color: '#8a5cff',
    music: 'shop_blackmarket',
    dice: 0,
    items: 0,
    itemKinds: [],
    deals: 2,
    reroll: false,
  },
  shrine: {
    id: 'shrine',
    keeper: 'aeris',
    name: L('Shrine', 'Santuario'),
    blurb: L('Rare. A free blessing, or a prophecy of the next boss.', 'Rara. Una bendición gratis, o una profecía del próximo jefe.'),
    color: '#9fd8ff',
    music: 'shop_shrine',
    dice: 0,
    items: 0,
    itemKinds: [],
    blessings: 3,
    reroll: false,
  },
  bazaar: {
    id: 'bazaar',
    keeper: 'conclave',
    name: L('Aether Bazaar', 'Bazar del Éter'),
    blurb: L(
      'Legendary. Every shop in one, 25% off, with rarer stock.',
      'Legendaria. Todas las tiendas en una, 25% menos, con mercancía más rara.',
    ),
    color: '#ffd166',
    music: 'shop_bazaar',
    dice: 3,
    items: 5,
    itemKinds: ['relic', 'consumable'],
    relicLuck: true,
    forge: true,
    upgrades: true,
    brew: true,
    deals: 1,
    discount: 0.25,
    reroll: true,
    legendary: true,
  },
  // The Firmament's legendary shop (EXPANSION.md H6): the Aether Bazaar's
  // stock rules under the realm's own name. One per stretch, always the
  // stop before the round-30 Warden.
  astral: {
    id: 'astral',
    keeper: 'conclave',
    name: L('Astral Exchange', 'Intercambio Astral'),
    blurb: L(
      'Legendary. Every shop in one, 25% off, with rarer stock, past the door.',
      'Legendaria. Todas las tiendas en una, 25% menos, con mercancía más rara, más allá de la puerta.',
    ),
    color: '#d9b8ff',
    music: 'shop_bazaar',
    dice: 3,
    items: 5,
    itemKinds: ['relic', 'consumable'],
    relicLuck: true,
    forge: true,
    upgrades: true,
    brew: true,
    deals: 1,
    discount: 0.25,
    reroll: true,
    legendary: true,
  },
  // --- The Firmament's own keepers (EXPANSION.md H6). ---
  // Atlas sells no goods: three map services, paid in Shards.
  cartography: {
    id: 'cartography',
    keeper: 'atlas',
    name: L("Atlas's Cartography", 'Cartografía de Atlas'),
    blurb: L(
      'No goods. Redraw the next row of the Road, add a path to it, or peek at the next Warden.',
      'Sin mercancía. Redibuja la próxima fila del Camino, añade un sendero o espía al próximo Custodio.',
    ),
    color: '#7ad1ff',
    music: 'shop_cartography',
    dice: 0,
    items: 0,
    itemKinds: [],
    services: true,
    reroll: false,
  },
  // The Horologist: the Chrono die and two time consumables.
  clockwork: {
    id: 'clockwork',
    keeper: 'horologist',
    name: L("The Horologist's Clockwork", 'El Mecanismo del Relojero'),
    blurb: L('The Chrono die, the Stopwatch and the Time Capsule.', 'El dado Crono, el Cronómetro y la Cápsula del Tiempo.'),
    color: '#c9a46b',
    music: 'shop_clockwork',
    dice: 1,
    dieStock: ['chrono'],
    items: 2,
    itemKinds: ['consumable'],
    consumableStock: ['stopwatch', 'time_capsule'],
    reroll: false,
  },
  // Mote sells nothing: it buys anything for half again its sell value, and
  // what it eats opens a secret stock.
  pantry: {
    id: 'pantry',
    keeper: 'mote',
    name: L("Mote's Pantry", 'La Despensa de Mote'),
    blurb: L(
      'Sells nothing. Buys any die, relic or consumable for 150% of its sell value. It is always hungry.',
      'No vende nada. Compra cualquier dado, reliquia o consumible por el 150% de su valor de venta. Siempre tiene hambre.',
    ),
    color: '#8a7aa8',
    music: 'shop_pantry',
    dice: 0,
    items: 0,
    itemKinds: [],
    pantry: true,
    reroll: false,
  },
  // Not a Road stop: after a missed round, Tobb sets up camp (EXPANSION.md
  // E10). A few Shards on arrival, a small Market, then retry the round.
  camp: {
    id: 'camp',
    keeper: 'tobb',
    name: L('Camp', 'Campamento'),
    blurb: L(
      'After a missed round: a few Shards and a small shop, then try the round again.',
      'Tras fallar una ronda: unos Fragmentos y una tienda pequeña, y luego reintentas la ronda.',
    ),
    color: '#e8a86b',
    music: 'shop_market',
    line: L(
      'Sit, Caster. Nobody wins every fight. Have some tea, then try again.',
      'Siéntate, Lanzador. Nadie gana todas las peleas. Tómate un té y vuelve a intentarlo.',
    ),
    dice: 2,
    items: 2,
    itemKinds: ['relic', 'consumable'],
    reroll: true,
    camp: true,
  },
}

export const SHOP_TYPE_IDS = Object.keys(SHOP_TYPES)

export function shopTypeById(id) {
  return SHOP_TYPES[id] ?? SHOP_TYPES.market
}

// Map weights for an ordinary layer. `from` is the first round the type can
// show up after. The Bazaar is also guaranteed in the last layer before
// Primordial (see engine/map.js).
export const SHOP_WEIGHTS = [
  { id: 'market', weight: 46, from: 1 },
  { id: 'alchemist', weight: 16, from: 2 },
  { id: 'forge', weight: 12, from: 2 },
  { id: 'vault', weight: 7, from: 3 },
  { id: 'shrine', weight: 6, from: 2 },
  { id: 'blackmarket', weight: 6, from: 3 },
  { id: 'bazaar', weight: 2, from: 8 },
]

// The Firmament's stretch of the Road (H6, Claude's default). The Astral
// Exchange follows the Bazaar's rule: one per stretch, guaranteed before
// the Warden at 30.
export const FIRMAMENT_SHOP_WEIGHTS = [
  { id: 'market', weight: 30, from: 1 },
  { id: 'alchemist', weight: 10, from: 1 },
  { id: 'forge', weight: 10, from: 1 },
  { id: 'vault', weight: 8, from: 1 },
  { id: 'shrine', weight: 6, from: 1 },
  { id: 'blackmarket', weight: 6, from: 1 },
  { id: 'cartography', weight: 10, from: 1 },
  { id: 'clockwork', weight: 8, from: 1 },
  { id: 'pantry', weight: 8, from: 1 },
  { id: 'astral', weight: 2, from: 1 },
]

// Atlas's services (H6, Claude's default prices), each once per visit.
export const ATLAS_SERVICES = [
  {
    id: 'redraw',
    cost: 6,
    name: L('Redraw', 'Redibujar'),
    body: L('The next row of the Road is drawn again.', 'La próxima fila del Camino se dibuja de nuevo.'),
  },
  {
    id: 'path',
    cost: 5,
    name: L('Add a path', 'Añadir un sendero'),
    body: L('Link this stop to one more shop in the next row.', 'Une esta parada con una tienda más de la próxima fila.'),
  },
  {
    id: 'peek',
    cost: 8,
    name: L('Peek', 'Espiar'),
    body: L('Learn which Warden waits next, like a Prophecy.', 'Descubre qué Custodio espera después, como una Profecía.'),
  },
]

// Mote's appetite (H6): what it has eaten on this file, summed sell value.
// Each stage opens more of its secret stock; at FULL it is full (what that
// does is not built yet, EXPANSION.md A5).
export const MOTE_STAGES = [40, 120]
export const MOTE_FULL = 400
// What Mote pays for your goods, over their sell value.
export const MOTE_RATE = 1.5
// The secret stock's Hollow Pact price (Claude's default).
export const MOTE_PACT_PRICE = 15

// Each path's follower (H6): one of their shops is guaranteed in every
// Firmament stretch. Aeris's Shrine for the Split, Nix's eclipse market for
// the Primordial, and one more Market with Tobb for the Neutral path.
export const FOLLOWER_SHOP = { split: 'shrine', primordial: 'blackmarket', neutral: 'market' }
export const FOLLOWER_KEEPER = { split: 'aeris', primordial: 'nix', neutral: 'tobb' }

// --- Black Market deals: pay with lives, slots, or future pain. ---
export const DEALS = [
  {
    id: 'blood_relic',
    name: L('Blood Price', 'Precio de Sangre'),
    body: L('Take a legendary relic. Costs 1 life.', 'Toma una reliquia legendaria. Cuesta 1 vida.'),
  },
  {
    id: 'loan',
    name: L("Nix's Loan", 'El Préstamo de Nix'),
    body: L('Get {shards} Shards now. The next target is 50% higher.', 'Recibe {shards} Fragmentos ahora. El próximo objetivo es 50% más alto.'),
  },
  {
    id: 'soul_die',
    name: L('Soul Die', 'Dado del Alma'),
    body: L('Take a random triple fusion die. Costs 1 max life.', 'Toma un dado de fusión triple al azar. Cuesta 1 vida máxima.'),
  },
  {
    id: 'hollow_pact',
    name: L('Hollow Pact', 'Pacto Hueco'),
    body: L('+2 rerolls every round. Lose 1 relic slot for the run.', '+2 relanzamientos cada ronda. Pierdes 1 espacio de reliquia en la partida.'),
  },
  // EXPANSION.md B3: more pacts (Carlos, 2026-10-02).
  {
    id: 'gamble',
    name: L("Gambler's Oath", 'Juramento del Apostador'),
    body: L(
      'Your next clear pays double Shards, or nothing at all. A coin decides.',
      'Tu próxima ronda superada paga el doble de Fragmentos, o nada. Una moneda decide.',
    ),
  },
  {
    id: 'hollow_crown',
    name: L('Hollow Crown', 'Corona Hueca'),
    body: L('+1 relic slot, but your relics sell for 0 for the rest of the run.', '+1 espacio de reliquia, pero tus reliquias se venden por 0 el resto de la partida.'),
  },
  {
    id: 'shadow_twin',
    name: L('Shadow Twin', 'Gemelo de Sombra'),
    body: L('Clone your best die. The clone fizzles on 1 and 2.', 'Clona tu mejor dado. El clon se apaga con 1 y 2.'),
  },
  {
    id: 'long_night',
    name: L('The Long Night', 'La Larga Noche'),
    body: L(
      'The next boss brings a second twist. Beat it for a legendary relic.',
      'El próximo jefe trae un segundo giro. Si lo vences, ganas una reliquia legendaria.',
    ),
  },
  {
    id: 'bound_tongue',
    name: L('Bound Tongue', 'Lengua Atada'),
    body: L(
      'The next boss is replaced by Ermal the Unbothered. Aeris can never appear again this run.',
      'El próximo jefe es reemplazado por Ermal el Imperturbable. Aeris no podrá aparecer más en esta partida.',
    ),
  },
]

// Betrayal pacts (B3, Claude's spec): built from the Aeris blessings you
// hold. One is offered per Black Market visit when you qualify. They break
// the blessing and count double toward the Primordial.
export const BETRAYALS = [
  {
    id: 'broken_vow',
    name: L('Broken Vow', 'Voto Roto'),
    body: L(
      "Lose Blessing of Wind's +1 reroll. Take a legendary relic.",
      'Pierdes el +1 relanzamiento de la Bendición de Viento. Toma una reliquia legendaria.',
    ),
  },
  {
    id: 'unspoken_prayer',
    name: L('Unspoken Prayer', 'Plegaria Callada'),
    body: L(
      'Break your Prophecy: the foretold boss becomes a random lesser one, and +12 Shards.',
      'Rompe tu Profecía: el jefe anunciado se vuelve uno menor al azar, y +12 Fragmentos.',
    ),
  },
  {
    id: 'stolen_breath',
    name: L('Stolen Breath', 'Aliento Robado'),
    body: L(
      "Cancel Blessing of Tide's +3 rerolls. Your next clear pays double Shards.",
      'Cancela los +3 relanzamientos de la Bendición de Marea. Tu próxima ronda superada paga el doble de Fragmentos.',
    ),
  },
  {
    id: 'severed_grace',
    name: L('Severed Grace', 'Gracia Cortada'),
    body: L('+1 Mult for the rest of the run. Shrines never appear again.', '+1 Multiplicador el resto de la partida. Los Santuarios no vuelven a aparecer.'),
  },
]

// --- Shrine blessings: free, pick one (or the prophecy instead). ---
export const BLESSINGS = [
  {
    id: 'mend',
    name: L('Blessing of Stone', 'Bendición de Piedra'),
    body: L('Restore 1 life. If you are full, +8 Shards.', 'Recupera 1 vida. Si estás completo, +8 Fragmentos.'),
    element: 'earth',
  },
  {
    id: 'kindle',
    name: L('Blessing of Flame', 'Bendición de Llama'),
    body: L('A random die grows one size.', 'Un dado al azar crece un tamaño.'),
    element: 'fire',
  },
  {
    id: 'tide',
    name: L('Blessing of Tide', 'Bendición de Marea'),
    body: L('+3 rerolls next round.', '+3 relanzamientos la próxima ronda.'),
    element: 'water',
  },
  {
    id: 'gale',
    name: L('Blessing of Wind', 'Bendición de Viento'),
    body: L('+1 reroll every round for the rest of the run.', '+1 relanzamiento cada ronda por el resto de la partida.'),
    element: 'air',
  },
  {
    id: 'aether_gift',
    name: L('Blessing of Aether', 'Bendición de Éter'),
    body: L('A free rare consumable (needs a free slot).', 'Un consumible raro gratis (necesita un espacio libre).'),
    element: 'aether',
  },
  // B3: the same love for Aeris (Claude's spec).
  {
    id: 'plenty',
    name: L('Blessing of Plenty', 'Bendición de Abundancia'),
    body: L(
      "Your next clear pays double Shards, but the next shop's offers can't be rerolled.",
      'Tu próxima ronda superada paga el doble de Fragmentos, pero en la próxima tienda no se pueden renovar las ofertas.',
    ),
    element: 'midas',
  },
  {
    id: 'ember_ward',
    name: L('Blessing of Ember-ward', 'Bendición de Brasa Guardiana'),
    body: L('Next round, no die can fizzle.', 'La próxima ronda, ningún dado puede apagarse.'),
    element: 'fire',
  },
  {
    id: 'clarity',
    name: L('Blessing of Clarity', 'Bendición de Claridad'),
    body: L(
      'See two more rows of the Road, and change your chosen next stop once, even mid-round.',
      'Ve dos filas más del Camino, y cambia tu próxima parada elegida una vez, incluso a mitad de ronda.',
    ),
    element: 'crystal',
  },
  {
    id: 'communion',
    name: L('Blessing of Communion', 'Bendición de Comunión'),
    body: L('Next round, every reaction gives +0.5 more Mult.', 'La próxima ronda, cada reacción da +0.5 Multiplicador más.'),
    element: 'prism',
  },
  {
    id: 'grace',
    name: L('Blessing of Grace', 'Bendición de Gracia'),
    body: L('Restore all lives. Shrines skip your next two stops.', 'Recupera todas las vidas. Los Santuarios se saltan tus próximas dos paradas.'),
    element: 'water',
  },
]

export const PROPHECY = {
  id: 'prophecy',
  name: L('Prophecy', 'Profecía'),
  body: L('Instead of a blessing, learn which boss waits at round {round}.', 'En vez de una bendición, descubre qué jefe espera en la ronda {round}.'),
}

export function dealById(id) {
  return DEALS.find((d) => d.id === id) ?? BETRAYALS.find((d) => d.id === id)
}

export const isBetrayal = (id) => BETRAYALS.some((b) => b.id === id)

export function blessingById(id) {
  return BLESSINGS.find((b) => b.id === id)
}
