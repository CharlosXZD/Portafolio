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
import { CONSTELLATIONS, BLACK_HOLE_TEXT, constellationText } from './constellations.js'
import { TOTEMS, totemText } from './totems.js'
import { RUNES } from './runes.js'

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
    description: 'Splits a die in two of the next size down (d30 into two d20, d20 into two d10, d10 into two d5, d6 into two d3). A d5 chips into a d3 and leaves a Transmute. A d3 is too small.',
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
  // --- The Firmament (EXPANSION.md H3, H6): sold only past the door.
  // `firmament` keeps them out of Elementa's shops; `stockWeight` thins a
  // very rare one out of the rarity pool.
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    kind: 'consumable',
    type: 'rewind',
    target: 'self',
    rarity: RARITY.RARE,
    element: null,
    firmament: true,
    itemConcept: 'a brass stopwatch with its hand frozen mid-tick',
    description: 'During a round: undo your last reroll and get it back.',
  },
  {
    id: 'time_capsule',
    name: 'Time Capsule',
    kind: 'consumable',
    type: 'capsule',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: null,
    firmament: true,
    itemConcept: 'a sealed glass capsule with two tiny dice inside',
    description: 'Bank 2 rerolls for the next round.',
  },
  {
    id: 'warp_seal',
    name: 'Warp Seal',
    kind: 'consumable',
    type: 'warp',
    target: 'die',
    rarity: RARITY.LEGENDARY,
    element: null,
    firmament: true,
    stockWeight: 0.25,
    itemConcept: 'a violet wax seal pressed with a folded star',
    description: 'Apply to a die to give it Warp: it no longer counts toward your dice cap (at most 3 Warp dice).',
  },
  // --- The Horologist's wares (EXPANSION.md I2): Firmament only. ---
  {
    id: 'sand_hourglass',
    horologistOnly: true,
    name: 'Hourglass',
    kind: 'consumable',
    type: 'sand',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: null,
    firmament: true,
    itemConcept: 'a small hourglass of pale gold sand, one bulb already empty',
    description: 'During a round: your next 3 rerolls this round do not use up a reroll.',
  },
  {
    id: 'pocket_watch',
    horologistOnly: true,
    name: 'Pocket Watch',
    kind: 'consumable',
    type: 'watch',
    target: 'die',
    rarity: RARITY.RARE,
    element: null,
    firmament: true,
    itemConcept: 'a chained pocket watch whose hands never move',
    description: 'Apply to a die: next round it starts held, on the face it shows now.',
  },
  {
    id: 'metronome',
    horologistOnly: true,
    name: 'Metronome',
    kind: 'consumable',
    type: 'metronome',
    target: 'self',
    rarity: RARITY.UNCOMMON,
    element: null,
    firmament: true,
    itemConcept: 'a wooden metronome mid-swing, its weight a tiny gold die',
    description: 'For the next 3 rounds, +1 Mult on every cast.',
  },
  {
    id: 'almanac',
    horologistOnly: true,
    name: 'Almanac',
    kind: 'consumable',
    type: 'almanac',
    target: 'self',
    rarity: RARITY.RARE,
    element: null,
    firmament: true,
    itemConcept: 'a thick almanac bound in star-blue cloth, pages marked with dates',
    description: 'Shows the next three targets and the next boss modifier, exactly.',
  },
  // --- Constellations (EXPANSION.md J1): permanently level one reaction or
  // set type. Firmament only; Seren's Observatory sells them, other
  // Firmament shops rarely. They apply at once, with no target. ---
  ...CONSTELLATIONS.map((c) => ({
    id: `const_${c.id}`,
    name: c.en,
    kind: 'consumable',
    type: 'constellation',
    levels: c.target,
    target: 'self',
    rarity: RARITY.UNCOMMON,
    cost: 6,
    element: null,
    firmament: true,
    constellation: true,
    stockWeight: 0.3,
    itemConcept: `a small brass star chart marked with the sign of ${c.targetEn}`,
    description: constellationText(c, 'en'),
  })),
  {
    id: 'const_black_hole',
    name: 'The Great Attractor',
    kind: 'consumable',
    type: 'blackhole',
    target: 'self',
    rarity: RARITY.LEGENDARY,
    cost: 25,
    element: null,
    firmament: true,
    constellation: true,
    stockWeight: 0.4,
    itemConcept: 'a black glass sphere ringed in a thin bright halo',
    description: BLACK_HOLE_TEXT.en,
  },
  // --- Totems (EXPANSION.md L4): level a family's ability for the run. Not
  // Firmament-only: the Elementa Market sells them too, at low weight. ---
  ...TOTEMS.map((t) => ({
    id: `totem_${t.id}`,
    name: t.en,
    kind: 'consumable',
    type: 'totem',
    totem: t.id,
    target: 'self',
    rarity: RARITY.UNCOMMON,
    cost: 8,
    element: t.family,
    stockWeight: 0.3,
    itemConcept: `a small carved totem pole, painted in the colors of ${t.family}`,
    description: totemText(t, 'en'),
  })),
  // --- Runes (J3): socketed into one die. Forge-type shops and the
  // Firmament Market. ---
  ...RUNES.map((r) => ({
    id: `rune_${r.id}`,
    name: r.name.en,
    kind: 'consumable',
    type: 'rune',
    rune: r.id,
    target: 'die',
    rarity: r.rarity,
    element: null,
    runeItem: true,
    stockWeight: 0.6,
    itemConcept: `a small carved stone glowing with the rune of ${r.id}`,
    description: r.description.en,
  })),
  // --- Die items (EXPANSION.md K6): they modify one die for good. Sold
  // where Whetstone and Chisel are; the Catalyst only by Vesper and in the
  // Astral Exchange. ---
  {
    id: 'weights',
    name: 'Weights',
    kind: 'consumable',
    type: 'weights',
    target: 'die',
    rarity: RARITY.UNCOMMON,
    element: null,
    itemConcept: 'two tiny lead weights on a loop of string',
    description: "Apply to a die: its faces below 2 count as 2, for good.",
  },
  {
    id: 'honing_oil',
    name: 'Honing Oil',
    kind: 'consumable',
    type: 'hone',
    honeBy: 4,
    target: 'die',
    rarity: RARITY.RARE,
    element: null,
    itemConcept: 'a small corked vial of golden oil',
    description: 'Apply to a die: it permanently scores +4 whenever it scores (on top of a Whetstone).',
  },
  {
    id: 'graft',
    name: 'Graft',
    kind: 'consumable',
    type: 'graft',
    target: 'die',
    rarity: RARITY.RARE,
    element: null,
    itemConcept: 'a silver needle threaded with a glowing line',
    description: 'Pick a die with a rune, then another die: the rune moves onto it, on the number you choose.',
  },
  {
    id: 'solvent',
    name: 'Solvent',
    kind: 'consumable',
    type: 'solvent',
    target: 'die',
    rarity: RARITY.UNCOMMON,
    element: null,
    itemConcept: 'a dropper bottle of clear, fizzing liquid',
    description: 'Apply to a die: strip every upgrade from it (bonus, runes, Weights) and get 5 Shards back.',
  },
  {
    id: 'gem_socket',
    name: 'Gem Socket',
    kind: 'consumable',
    type: 'socket',
    target: 'die',
    rarity: RARITY.EPIC,
    element: null,
    itemConcept: 'a tiny gold setting with two empty prongs',
    description: 'Apply to a die: a second rune can stack on a number that already has one, instead of replacing it.',
  },
  {
    id: 'catalyst',
    name: 'Catalyst',
    kind: 'consumable',
    type: 'catalyst',
    target: 'self',
    rarity: RARITY.RARE,
    element: null,
    firmament: true,
    vesperOnly: true,
    itemConcept: 'a cold blue crystal humming in a wire cage',
    description: 'In the Forge: one volatile fusion forges 100% safe (it cannot collapse). Used when you forge.',
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

// Gallery families for items (v0.7.1 notes): grouped by what they do, not by
// element. A new consumable falls under 'misc' until it is listed here.
const L2 = (en, es) => ({ en, es })
export const CONSUMABLE_FAMILIES = [
  { id: 'time', name: L2('Rerolls and Time', 'Relanzamientos y Tiempo'), note: L2('Spend or bend your rerolls.', 'Gasta o dobla tus relanzamientos.'), color: '#b9a6ff' },
  { id: 'craft', name: L2('Die Upgrades', 'Mejoras de Dados'), note: L2('Make one die bigger, sharper or different for good.', 'Hacen un dado más grande, más afilado o distinto para siempre.'), color: '#ffd166' },
  { id: 'change', name: L2('Transmutation', 'Transmutación'), note: L2('Turn one die into another.', 'Convierten un dado en otro.'), color: '#7ad1ff' },
  { id: 'rune', name: L2('Runes', 'Runas'), note: L2('Inscribed on one number of a die.', 'Se inscriben en un número de un dado.'), color: '#ff9fd0' },
  { id: 'stars', name: L2('Constellations', 'Constelaciones'), note: L2('Level a reaction or a set for the whole run.', 'Suben de nivel una reacción o un set toda la partida.'), color: '#d9b8ff' },
  { id: 'totem', name: L2('Totems', 'Tótems'), note: L2('Level a family\'s ability for the whole run.', 'Suben de nivel la habilidad de una familia toda la partida.'), color: '#e0b070' },
  { id: 'forge', name: L2('Forge and Shop', 'Forja y Tienda'), note: L2('Help the Forge or restock the shop.', 'Ayudan a la Forja o reabastecen la tienda.'), color: '#e8a86b' },
  { id: 'fortune', name: L2('Life and Fortune', 'Vida y Fortuna'), note: L2('Lives and Shards.', 'Vidas y Fragmentos.'), color: '#6fbf4a' },
  { id: 'misc', name: L2('Other', 'Otros'), note: null, color: '#a8a0b8' },
]

const FAMILY_BY_ID = {
  extra_reroll: 'time', lucky_charm: 'time', stopwatch: 'time', time_capsule: 'time', sand_hourglass: 'time',
  pocket_watch: 'time', metronome: 'time', almanac: 'time',
  upgrade_stone: 'craft', whetstone: 'craft', chisel: 'craft', weights: 'craft', honing_oil: 'craft',
  solvent: 'craft', graft: 'craft', gem_socket: 'craft', warp_seal: 'craft',
  aether_dust: 'change', arcane_seal: 'change', mirror_shard: 'change',
  fusion_spark: 'forge', loom_of_fate: 'forge', catalyst: 'forge',
  shard_pouch: 'fortune', phoenix_feather: 'fortune',
}

export function consumableFamily(c) {
  if (c.type === 'rune') return 'rune'
  if (c.type === 'totem') return 'totem'
  if (c.type === 'constellation' || c.type === 'blackhole') return 'stars'
  if (c.id.startsWith('transmute_')) return 'change'
  return FAMILY_BY_ID[c.id] ?? 'misc'
}
