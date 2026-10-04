// Runes (EXPANSION.md J3, K3b): permanent enchantments inscribed on one face
// (one number) of one die with a consumable (`rune_<id>`, target: a die, then
// the Inscribe screen picks the number). A rune works only when the die lands
// on its number. A die can carry runes on several faces; inscribing on a
// face that already has one replaces it, unless the die has a Gem Socket
// (then a second rune stacks on that number). Data: `die.runes = [{ id, face }]`.
// Sold at Forge-type shops and in the Firmament Market. Not on Mythic dice or
// Entropy. Chisel keeps them (numbers that no longer exist move to the top
// face), Transmute removes them, Shadow Twin and Mirror Shard copy them, the
// Forge keeps them on the same number (K3b).
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

// What Brasa and Vesper charge to superpose clashing runes when forging
// (K3b, Default): per clash.
export const RUNE_CLASH_FEE = 8

// How many runes one face can hold: one, or two with a Gem Socket (K6).
export const faceCap = (die) => (die.socket ? 2 : 1)

export const RUNES = [
  R('echo', 'Echo', 'Eco', 'Echo', 'Eco', 'epic', '#9fd8ff', 'Inscribe on a number: when the die shows it, it scores twice.', 'Inscríbela en un número: cuando el dado lo muestra, anota dos veces.'),
  R(
    'glass',
    'Glass',
    'Cristal',
    'Glass',
    'Cristal',
    'rare',
    '#d6f2ff',
    'Inscribe on a number: when the die shows it, its score is doubled, and there is a 20% chance it shatters after scoring (the die is lost).',
    'Inscríbela en un número: cuando el dado lo muestra, su puntaje se duplica, y hay un 20% de que se rompa tras anotar (el dado se pierde).',
  ),
  R(
    'kinship',
    'Kinship',
    'Parentesco',
    'Kin',
    'Par.',
    'rare',
    '#ffb8e8',
    "Inscribe on a number: when the die shows it, it counts as its left neighbor's element for reactions.",
    'Inscríbela en un número: cuando el dado lo muestra, cuenta como el elemento de su vecino izquierdo para las reacciones.',
  ),
  R(
    'ember',
    'Ember',
    'Brasa',
    'Ember',
    'Brasa',
    'uncommon',
    '#ff8a4d',
    'Inscribe on a number: that number becomes an exploding face.',
    'Inscríbela en un número: ese número se vuelve una cara que explota.',
  ),
  R(
    'anchor',
    'Anchor',
    'Ancla',
    'Anchor',
    'Ancla',
    'uncommon',
    '#9fb4c8',
    "Inscribe on a number: when the die shows it, it cannot fizzle (good on a Fire die's 1).",
    'Inscríbela en un número: cuando el dado lo muestra, no puede apagarse (buena en el 1 de un dado de Fuego).',
  ),
  R('wild', 'Wild', 'Comodín', 'Wild', 'Comodín', 'epic', '#e9dcff', 'Inscribe on a number: when the die shows it, it counts as any value for sets.', 'Inscríbela en un número: cuando el dado lo muestra, cuenta como cualquier valor en los sets.'),
  R('gold', 'Gold', 'Oro', 'Gold', 'Oro', 'uncommon', '#ffd166', 'Inscribe on a number: when the die shows it, it pays 2 Shards each cast.', 'Inscríbela en un número: cuando el dado lo muestra, paga 2 Fragmentos por lanzamiento.'),
  R(
    'link',
    'Link',
    'Enlace',
    'Link',
    'Enlace',
    'rare',
    '#8fe8d0',
    'Inscribe on a number: when the die shows it, it reacts with both neighbors as the element that makes the best reaction with each.',
    'Inscríbela en un número: cuando el dado lo muestra, reacciona con ambos vecinos como el elemento que hace la mejor reacción con cada uno.',
  ),
  R('double', 'Double', 'Doble', 'Double', 'Doble', 'rare', '#ff9ad9', 'Inscribe on a number: when the die shows it, its score is also added to Mult, once per cast.', 'Inscríbela en un número: cuando el dado lo muestra, su puntaje también se suma al Mult, una vez por lanzamiento.'),
]

export const runeById = (id) => RUNES.find((r) => r.id === id)

/** Whether a die can take a rune: not a Mythic die, not Entropy (J3). */
export const RUNE_BLOCKED_TIERS = ['mythic']

/**
 * A die's runes as `[{ id, face }]`. An old save's single `die.rune` (J3)
 * sat on the whole die; it moves to the die's top face (K3b).
 */
export function runesOf(die) {
  if (Array.isArray(die?.runes)) return die.runes
  return die?.rune ? [{ id: die.rune, face: die.sides }] : []
}

/** The rune ids on one face of a die. */
export function runesOnFace(die, face) {
  return runesOf(die)
    .filter((r) => r.face === face)
    .map((r) => r.id)
}

/** Whether a rune works right now: the die shows its number (`face`). */
export function hasActiveRune(die, id, face = die.rolledFace ?? die.value) {
  return runesOf(die).some((r) => r.id === id && r.face === face)
}

/** An old die, its single rune moved onto its top face (K3b). */
export function migrateDieRunes(die) {
  if (!die || Array.isArray(die.runes)) return die
  const { rune, ...rest } = die
  return { ...rest, runes: runesOf(die) }
}

/**
 * Runes that move onto a die with `sides` faces: any number it no longer
 * has goes to its top face (Chisel, the Forge's shrink).
 */
export function fitRunes(runes, sides) {
  return runes.map((r) => (r.face > sides ? { ...r, face: sides, moved: true } : r))
}
