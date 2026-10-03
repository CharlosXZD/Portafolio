// Consumables are bought/found like relics, but instead of sitting
// passively in your relic row, they go into a small inventory (capped at
// MAX_CONSUMABLES, see engine/gameReducer.js) until applied, at which point
// they're spent. `target` says what applying one needs:
//   - 'die': the player picks a die to apply it to (upgrade, transmute).
//   - 'self': it takes effect immediately, no die needed (extra reroll).
// Kinds:
//   - 'upgrade': bumps the target die's tier one step (d6 -> d10, etc).
//   - 'transmute': changes the target die's element, keeping its tier.
//   - 'reroll': grants +1 permanent reroll for the rest of the run.
// Transmute is deliberately one item per pure element (never random, never
// a fusion target): picking the destination element is the point, and
// fusion dice stay Forge-only or a direct shop buy (GDD.md §13a/§18).
// Extra rerolls used to be an always-available shop button; they're a
// luck-gated consumable now, like everything else purchasable.
import { RARITY, RARITY_COST } from './relics.js'

export const CONSUMABLES = [
  {
    id: 'upgrade_stone',
    name: 'Upgrade Stone',
    kind: 'consumable',
    type: 'upgrade',
    target: 'die',
    rarity: RARITY.EPIC,
    element: null,
    itemConcept: 'a faceted whetstone with tier-pips of light',
    description: 'Apply to a die to bump its tier one step (d6 to d10, and so on).',
  },
  {
    id: 'extra_reroll',
    name: 'Extra Reroll',
    kind: 'consumable',
    type: 'reroll',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: null,
    itemConcept: 'a small hourglass with sand flowing backward',
    description: 'Grants +1 permanent reroll for the rest of the run.',
  },
  {
    id: 'transmute_earth',
    name: 'Transmute: Earth',
    kind: 'consumable',
    type: 'transmute',
    target: 'die',
    rarity: RARITY.COMMON,
    element: 'earth',
    targetElementId: 'earth',
    itemConcept: 'a swirling brown prism vial',
    description: 'Apply to a die to change its element to Earth, keeping its tier.',
  },
  {
    id: 'transmute_water',
    name: 'Transmute: Water',
    kind: 'consumable',
    type: 'transmute',
    target: 'die',
    rarity: RARITY.COMMON,
    element: 'water',
    targetElementId: 'water',
    itemConcept: 'a swirling blue prism vial',
    description: 'Apply to a die to change its element to Water, keeping its tier.',
  },
  {
    id: 'transmute_air',
    name: 'Transmute: Air',
    kind: 'consumable',
    type: 'transmute',
    target: 'die',
    rarity: RARITY.COMMON,
    element: 'air',
    targetElementId: 'air',
    itemConcept: 'a swirling pale prism vial',
    description: 'Apply to a die to change its element to Air, keeping its tier.',
  },
  {
    id: 'transmute_fire',
    name: 'Transmute: Fire',
    kind: 'consumable',
    type: 'transmute',
    target: 'die',
    rarity: RARITY.COMMON,
    element: 'fire',
    targetElementId: 'fire',
    itemConcept: 'a swirling red prism vial',
    description: 'Apply to a die to change its element to Fire, keeping its tier.',
  },
  {
    id: 'whetstone',
    name: 'Whetstone',
    kind: 'consumable',
    type: 'hone',
    target: 'die',
    rarity: RARITY.COMMON,
    element: null,
    itemConcept: 'a flat grey sharpening stone with a bright edge',
    description: 'Apply to a die: it permanently scores +2 whenever it scores.',
  },
  {
    id: 'chisel',
    name: 'Chisel',
    kind: 'consumable',
    type: 'split',
    target: 'die',
    rarity: RARITY.COMMON,
    cost: 3,
    element: null,
    itemConcept: 'a small iron chisel with a wooden grip',
    description: 'Splits a die in two of the next size down (d20 into two d10, d10 into two d5, d6 into two d3). A d5 chips into a d3 and leaves a Transmute. A d3 is too small.',
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    kind: 'consumable',
    type: 'heal',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: 'fire',
    itemConcept: 'a burning red-gold feather',
    description: 'Restore 1 life.',
  },
  {
    id: 'aether_dust',
    name: 'Aether Dust',
    kind: 'consumable',
    type: 'infuse',
    target: 'die',
    rarity: RARITY.RARE,
    element: null,
    itemConcept: 'a pinch of shimmering four-colored dust in a paper twist',
    description: 'Apply to a pure die to turn it into a random double fusion that contains its element.',
  },
  {
    id: 'arcane_seal',
    name: 'Arcane Seal',
    kind: 'consumable',
    type: 'arcanize',
    target: 'die',
    rarity: RARITY.EPIC,
    element: null,
    itemConcept: 'a wax seal stamped with a violet eye',
    description: 'Apply to a die to turn it into a random rare or epic Arcane die, keeping its tier.',
  },
  {
    id: 'shard_pouch',
    name: 'Shard Pouch',
    kind: 'consumable',
    type: 'pouch',
    target: 'self',
    rarity: RARITY.COMMON,
    element: null,
    itemConcept: 'a small leather pouch clinking with shards',
    description: 'Gain Shards equal to twice the current round (at least 4).',
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    kind: 'consumable',
    type: 'charm',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: null,
    itemConcept: 'a four-leaf clover pressed in glass',
    description: '+3 rerolls: this round if used during a round, otherwise next round.',
  },
  {
    id: 'fusion_spark',
    name: 'Fusion Spark',
    kind: 'consumable',
    type: 'spark',
    target: 'self',
    rarity: RARITY.RARE,
    element: 'fire',
    itemConcept: 'a spark that never stops crackling, held in tongs',
    description: 'Opens the Fusion Forge in this shop, even without beating a boss.',
  },
  {
    id: 'mirror_shard',
    name: 'Mirror Shard',
    kind: 'consumable',
    type: 'clone',
    target: 'die',
    rarity: RARITY.RARE,
    element: null,
    itemConcept: 'a jagged mirror fragment reflecting a die',
    description: 'Apply to a die to add an exact copy of it to your pool (needs a free dice slot).',
  },
  {
    id: 'loom_of_fate',
    name: 'Loom of Fate',
    kind: 'consumable',
    type: 'loom',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: null,
    itemConcept: 'a tiny wooden loom threaded with golden string',
    description: 'Restock the shop with new offers, for free.',
  },
]

export function consumableById(id) {
  return CONSUMABLES.find((c) => c.id === id)
}

export function costForConsumable(def, discountPct = 0) {
  const base = def.cost ?? RARITY_COST[def.rarity]
  return Math.max(1, Math.round(base * (1 - discountPct)))
}

export function sellValueForConsumable(def) {
  return Math.max(1, Math.round((def.cost ?? RARITY_COST[def.rarity]) / 2))
}
