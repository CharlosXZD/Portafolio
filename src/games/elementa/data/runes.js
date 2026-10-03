// Runes (EXPANSION.md J3, Part B9): permanent enchantments socketed into one
// die with a consumable (`rune_<id>`, target: a die). A die holds one rune;
// applying another replaces it. Sold at Forge-type shops and in the
// Firmament Market. Not on Mythic dice or Entropy. Chisel keeps the rune on
// both halves, Transmute removes it, Shadow Twin and Mirror Shard copy it.
// The rules themselves live in engine/scoring.js, engine/gods.js (Ember)
// and engine/gameReducer.js (Glass shattering).
const R = (id, en, es, short, shortEs, rarity, color, descEn, descEs) => ({
  id,
  name: { en: `Rune of ${en}`, es: `Runa de ${es}` },
  short: { en: short, es: shortEs },
  rarity,
  color,
  description: { en: descEn, es: descEs },
})

// Chance a Rune of Glass shatters its die after a cast scores (seeded).
export const GLASS_BREAK_CHANCE = 0.2

export const RUNES = [
  R('echo', 'Echo', 'Eco', 'Echo', 'Eco', 'epic', '#9fd8ff', 'Socket into a die: it scores twice.', 'Engárzala en un dado: anota dos veces.'),
  R(
    'glass',
    'Glass',
    'Cristal',
    'Glass',
    'Cristal',
    'rare',
    '#d6f2ff',
    'Socket into a die: its score is doubled, but each cast it has a 20% chance to shatter after scoring (the die is lost).',
    'Engárzala en un dado: su puntaje se duplica, pero en cada lanzamiento tiene un 20% de romperse tras anotar (el dado se pierde).',
  ),
  R(
    'kinship',
    'Kinship',
    'Parentesco',
    'Kin',
    'Par.',
    'rare',
    '#ffb8e8',
    "Socket into a die: for reactions it counts as its left neighbor's element.",
    'Engárzala en un dado: para las reacciones cuenta como el elemento de su vecino izquierdo.',
  ),
  R(
    'ember',
    'Ember',
    'Brasa',
    'Ember',
    'Brasa',
    'uncommon',
    '#ff8a4d',
    'Socket into a die: it explodes on its top two faces.',
    'Engárzala en un dado: explota con sus dos caras más altas.',
  ),
  R(
    'anchor',
    'Anchor',
    'Ancla',
    'Anchor',
    'Ancla',
    'uncommon',
    '#9fb4c8',
    'Socket into a die: it never fizzles.',
    'Engárzala en un dado: nunca se apaga.',
  ),
]

export const runeById = (id) => RUNES.find((r) => r.id === id)

/** Whether a die can take a rune: not a Mythic die, not Entropy (J3). */
export const RUNE_BLOCKED_TIERS = ['mythic']
