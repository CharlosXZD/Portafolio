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
]

export const PROPHECY = {
  id: 'prophecy',
  name: L('Prophecy', 'Profecía'),
  body: L('Instead of a blessing, learn which boss waits at round {round}.', 'En vez de una bendición, descubre qué jefe espera en la ronda {round}.'),
}

export function dealById(id) {
  return DEALS.find((d) => d.id === id)
}

export function blessingById(id) {
  return BLESSINGS.find((b) => b.id === id)
}
