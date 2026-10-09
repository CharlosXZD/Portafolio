// The item model table (VISUALS.md V2.2): every relic and consumable (runes,
// Constellations, Totems and Laws included) maps to ONE generator family and
// its parameters. The family code is components/visuals/three/itemGenerators.js;
// nothing here is geometry. Each entry is built from the item's `itemConcept`
// (data/relics.js, data/consumables.js) and its element:
//   gen  the family, p its parameters, d extra details, tone a neutral color
//   The element (from the item's data) colors it; neutral items use `tone`
//   from the gold and stone palette, or the concept's own color where the
//   concept names one (green clover, violet sand, blue crystal, red ribbon).
//   Rarity is read from the item's data and sets the trim and glow, using
//   the existing rarity scale (RARITY_GLOW), never new colors.
// Dice are not in this table: they keep their shaped sprite and ElementFx.
import { RELICS } from './relics.js'
import { CONSUMABLES } from './consumables.js'

const m = (gen, p = {}, d = [], tone) => ({ gen, p, d, tone })

export const ITEM_MODELS = {
  // ---------------- relics ----------------
  molten_core: m('rock', { kind: 'core' }),
  riverstone: m('rock', { kind: 'river' }),
  stormcaller: m('tool', { kind: 'vane' }, ['bolt']),
  bedrock: m('rock', { kind: 'slab' }),
  glass_cannon: m('hourglass', { sand: 'main', embers: true, cracked: true, top: 0.5 }),
  undertow: m('shell', { kind: 'conch' }),
  petrify: m('rock', { kind: 'charm', color: 'iron', glyph: 'eye' }),
  wildfire: m('composite', { kind: 'bundle' }),
  tidal_pool: m('rock', { kind: 'boulder', cap: true }, ['anemone']),
  groundswell: m('rock', { kind: 'boulder', moss: true, light: 'gold' }),
  static_charge: m('composite', { kind: 'jar' }),
  momentum: m('clock', { kind: 'gyro' }, [], 'gold'),
  shard_vault: m('chest', { gems: ['gold', 'white', 'gold'] }),
  discount_merchant: m('composite', { kind: 'balance', rightLoad: 0.1, leftLoad: 0 }),
  overclock: m('clock', { kind: 'gear', hot: true, color: 'goldLo' }),
  fossil: m('rock', { kind: 'ammonite' }),
  fusion_catalyst: m('flask', { body: 'crucible', liquid: 'white', glow: 0.6, flames: true }, ['sparks']),
  deep_pockets: m('pouch', { patch: true }),
  windfall: m('coin', { pile: true }, ['sparks']),
  hoarder: m('composite', { kind: 'nest' }, [], 'arcane'),
  steadfast: m('tool', { kind: 'anchor' }),
  safety_net: m('cut', { shape: 'clover' }),
  loaded_die: m('cube', {}),
  tide_chart: m('scroll', { kind: 'roll', paper: 'mainHi', tie: 'green', decal: 'wave', fg: 'water', bg: 'water' }),
  feather_charm: m('cut', { shape: 'feather', thread: 'iron', quill: true, glow: 0.35 }),
  lucky_coin: m('coin', { color: 'gold', front: 'flame', back: 'wave', fg: 'fire', bg: 'gold' }),
  ember_heart: m('cut', { shape: 'heart', inner: 'flame', innerColor: 'gold' }),
  keystone: m('rock', { kind: 'arch', glyph: 'star4' }),
  hourglass: m('hourglass', { sand: 'arcane', top: 0.5, frame: 'stone' }),
  prism_lens: m('gem', { cut: 'prism' }, ['rays'], 'ice'),
  glacier_heart: m('gem', { cut: 'shard', glow: 0.3 }, ['glint']),
  fusion_crucible: m('flask', { body: 'crucible', quad: true }, ['fourcolors']),
  aether_crown: m('crown', { points: 4, gems: ['fire', 'water', 'earth', 'air'] }, [], 'gold'),
  alchemists_table: m('composite', { kind: 'table' }, [], 'gold'),
  bookends: m('cut', { shape: 'owl', pair: true }, [], 'stone'),
  catalyst_stone: m('rock', { kind: 'boulder', color: 'iron' }, ['fourcolors']),
  heart_of_circle: m('ring', { kind: 'runes' }, [], 'arcane'),
  ley_line: m('ring', { kind: 'knot' }, [], 'arcane'),
  heat: m('composite', { kind: 'bellows' }),
  gust: m('cut', { shape: 'fan', color: 'parch', ribs: true }),
  steady: m('tool', { kind: 'plumb' }),
  chain_break: m('composite', { kind: 'chain' }),
  pantheon: m('crown', { kind: 'temple', gems: ['fire', 'water', 'earth', 'air'] }, [], 'stone'),
  deep_current: m('flask', { body: 'bottle', liquid: 'mainLo', swirl: 'white', level: 0.7 }),
  spring_tide: m('shell', { kind: 'moon' }),
  gale_seal: m('coin', { seal: true, front: 'spiral', fg: 'ink', bg: 'ink' }),
  second_wind: m('cut', { shape: 'feather', color: 'iron', thread: 'white', quill: true }),
  standing_stones: m('rock', { kind: 'stones3' }),
  crown_of_ages: m('crown', { points: 7, notches: true, gems: ['gold'] }, [], 'gold'),
  heart_of_the_forge: m('cut', { shape: 'anvil', color: 'iron', inner: 'heart', innerColor: 'glow' }),
  starmap: m('scroll', { kind: 'fold', paper: 'navy', decal: 'star5', fg: 'white', bg: 'gold' }),
  echo_chamber: m('ring', { kind: 'bell', inner: true }, [], 'brass'),
  law_inversion: m('composite', { kind: 'mirror' }),
  law_unity: m('ring', { kind: 'twin' }),
  law_symmetry: m('cut', { shape: 'butterfly', color: 'arcaneHi', pin: true, spots: true }, [], 'gold'),
  law_greed: m('composite', { kind: 'balance', tilt: -0.35, rightLoad: 0.45, leftLoad: 0.04 }),
  law_echo: m('ring', { kind: 'bell', echo: true }, [], 'brass'),
  law_small: m('composite', { kind: 'thimble' }),
  epsilon: m('cut', { shape: 'epsilon', color: 'iron', depth: 0.45 }),
  release: m('composite', { kind: 'padlock' }),
  mainspring: m('clock', { kind: 'spring' }),
  cuckoo_clock: m('clock', { kind: 'cuckoo' }, [], 'gold'),

  // ---------------- consumables ----------------
  upgrade_stone: m('rock', { kind: 'whet', color: 'stone', pips: true }),
  extra_reroll: m('hourglass', { sand: 'arcaneHi', flow: 'up', top: 0.2, frame: 'arcane' }),
  transmute_earth: m('flask', { body: 'vial', swirl: 'white', glass: 'mainHi', level: 0.8, glow: 0.45 }),
  transmute_water: m('flask', { body: 'vial', swirl: 'white', glass: 'mainHi', level: 0.8, glow: 0.45 }),
  transmute_air: m('flask', { body: 'vial', swirl: 'white', glass: 'mainHi', level: 0.8, glow: 0.45 }),
  transmute_fire: m('flask', { body: 'vial', swirl: 'white', glass: 'mainHi', level: 0.8, glow: 0.45 }),
  whetstone: m('rock', { kind: 'whet', color: 'iron' }),
  chisel: m('tool', { kind: 'chisel' }),
  phoenix_feather: m('cut', { shape: 'feather', inner: 'flame', innerColor: 'gold' }),
  aether_dust: m('composite', { kind: 'twist', fireC: 'fire', waterC: 'water', earthC: 'earth', airC: 'air' }),
  arcane_seal: m('coin', { seal: true, color: 'arcane', front: 'eye', fg: 'white', bg: 'arcaneHi' }),
  shard_pouch: m('pouch', { shards: true }),
  lucky_charm: m('cut', { shape: 'clover', disc: true, depth: 0.2 }),
  fusion_spark: m('tool', { kind: 'tongs' }, ['sparks', 'starglow']),
  mirror_shard: m('cut', { shape: 'shard', color: 'iron', decal: 'star4', fg: 'white', bg: 'white', decalSize: 0.6 }, ['glint']),
  loom_of_fate: m('tool', { kind: 'loom' }),
  stopwatch: m('clock', { kind: 'stopwatch', color: 'brass' }),
  time_capsule: m('flask', { body: 'capsule', liquid: 'goldHi', glass: 'glass', level: 0.2, glow: 0.3 }, ['dicepair']),
  warp_seal: m('coin', { seal: true, color: 'arcaneHi', front: 'foldstar', fg: 'ink', bg: 'arcane', sides: 6, tail: 'gold' }),
  sand_hourglass: m('hourglass', { sand: 'gold', top: 0, wide: true }),
  pocket_watch: m('clock', { kind: 'watch', color: 'gold' }),
  metronome: m('clock', { kind: 'metronome' }),
  almanac: m('tome', { cover: 'navy', marks: true, spine: 'woodLo' }),
  const_phoenix: m('plate', { sign: 'kindle', accent: 'fire', shape: 'tri' }),
  const_anvil: m('plate', { sign: 'forge', accent: 'earth', shape: 'wide' }),
  const_geyser: m('plate', { sign: 'scald', accent: 'water', shape: 'tall' }),
  const_cloud: m('plate', { sign: 'mist', accent: 'air', shape: 'round' }),
  const_seedling: m('plate', { sign: 'bloom', accent: 'green', shape: 'hex' }),
  const_whirl: m('plate', { sign: 'dust', accent: 'earth', shape: 'oct' }),
  const_twins: m('plate', { sign: 'resonance', accent: 'arcaneHi', shape: 'diamond' }),
  const_pair: m('plate', { sign: 'pair', accent: 'gold', shape: 'rect' }),
  const_trio: m('plate', { sign: 'three', accent: 'gold', shape: 'tri' }),
  const_ladder: m('plate', { sign: 'straight', accent: 'gold', shape: 'tall' }),
  const_black_hole: m('orb', { color: 'void', halo: true, glint: false }),
  totem_fire: m('totem', { faces: ['flame', 'eye', 'flame'] }),
  totem_water: m('totem', { faces: ['drop', 'eye', 'wave'] }),
  totem_earth: m('totem', { faces: ['star4', 'eye', 'leaf'] }),
  totem_air: m('totem', { faces: ['spiral', 'eye', 'bolt'] }),
  rune_echo: m('rock', { kind: 'runestone', glyph: 'echo', body: 'oval', color: 'stone', fg: 'arcaneHi' }),
  rune_glass: m('rock', { kind: 'runestone', glyph: 'glass', body: 'diamond', color: 'ice', fg: 'white' }),
  rune_kinship: m('rock', { kind: 'runestone', glyph: 'kinship', body: 'hex', color: 'pink', fg: 'white' }),
  rune_ember: m('rock', { kind: 'runestone', glyph: 'ember', body: 'tablet', color: 'woodLo', fg: 'fire' }),
  rune_anchor: m('rock', { kind: 'runestone', glyph: 'anchor', body: 'wide', color: 'iron', fg: 'white' }),
  rune_wild: m('rock', { kind: 'runestone', glyph: 'wild', body: 'tri', color: 'greenHi', fg: 'white' }),
  rune_gold: m('rock', { kind: 'runestone', glyph: 'gold', body: 'round', color: 'brass', fg: 'white' }),
  rune_link: m('rock', { kind: 'runestone', glyph: 'link', body: 'tall', color: 'navy', fg: 'white' }),
  rune_double: m('rock', { kind: 'runestone', glyph: 'double', body: 'twin', color: 'parch', fg: 'white' }),
  weights: m('tool', { kind: 'weights' }),
  honing_oil: m('flask', { body: 'vial', liquid: 'gold', level: 0.7 }),
  graft: m('cut', { shape: 'needle', color: 'white', thread: 'gold', threadR: 0.55, size: 1.3, rot: 0.6, depth: 0.2 }),
  solvent: m('flask', { body: 'dropper', liquid: 'glass', bubbles: true, level: 0.6 }),
  gem_socket: m('ring', { kind: 'setting' }),
  catalyst: m('gem', { cut: 'facet', tone: 'ice', glow: 0.3 }, ['cage']),
}

const ITEMS = new Map([...RELICS, ...CONSUMABLES].map((i) => [i.id, i]))

/** Every item id that has a model (the whole of relics and consumables). */
export const MODEL_IDS = Object.keys(ITEM_MODELS)

/**
 * The full description of one item's model: the generator and parameters
 * from the table plus the element and rarity from the item's own data.
 * Returns null for ids that are not items (dice, boons).
 */
export function modelFor(id) {
  const entry = ITEM_MODELS[id]
  const item = ITEMS.get(id)
  if (!entry || !item) return null
  return { id, gen: entry.gen, p: entry.p, d: entry.d, tone: entry.tone ?? entry.p.tone ?? null, element: item.element ?? null, rarity: item.rarity, kind: item.kind, concept: item.itemConcept }
}
