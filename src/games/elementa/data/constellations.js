// Constellations (EXPANSION.md J1): Firmament consumables that permanently
// level one reaction or set type for the rest of the run, like Balatro's
// planet cards. They apply at once and need no target. Each level adds
// `base` and `mult` on top of the thing's own effect, up to LEVEL_CAP.
// `target` is a base reaction id (data/reactions.js) or a set tier. Black
// Hole levels all ten at once. Secret reactions do not level.
export const LEVEL_CAP = 10

const C = (id, en, es, target, kind, base, mult, targetEn, targetEs) => ({ id, en, es, target, kind, base, mult, targetEn, targetEs })

export const CONSTELLATIONS = [
  C('phoenix', 'The Phoenix', 'El Fénix', 'kindle', 'reaction', 0, 0.5, 'Kindle', 'Avivar'),
  C('anvil', 'The Anvil', 'El Yunque', 'forge', 'reaction', 2, 0, 'Forge', 'Forja'),
  C('geyser', 'The Geyser', 'El Géiser', 'scald', 'reaction', 2, 0.25, 'Scald', 'Escaldar'),
  C('cloud', 'The Cloud', 'La Nube', 'mist', 'reaction', 0, 0.5, 'Mist', 'Neblina'),
  C('seedling', 'The Seedling', 'El Brote', 'bloom', 'reaction', 2, 0, 'Bloom', 'Florecer'),
  C('whirl', 'The Whirl', 'El Remolino', 'dust', 'reaction', 3, 0, 'Dust Devil', 'Remolino'),
  C('twins', 'The Twins', 'Los Gemelos', 'resonance', 'reaction', 2, 0, 'Resonance', 'Resonancia'),
  C('pair', 'The Pair', 'El Par', 'pair', 'set', 0, 0.5, 'Pair', 'Par'),
  C('trio', 'The Trio', 'El Trío', 'three', 'set', 0, 0.75, 'Three of a kind', 'Trío'),
  C('ladder', 'The Ladder', 'La Escalera', 'straight', 'set', 0, 1, 'Straight', 'Escalera'),
]

/** Every id a Constellation can level. */
export const LEVELABLE = CONSTELLATIONS.map((c) => c.target)

export const constellationFor = (target) => CONSTELLATIONS.find((c) => c.target === target)

const num = (n) => String(n)
const perLevel = (c, lang) => {
  const parts = []
  if (c.base) parts.push(`+${num(c.base)} ${lang === 'es' ? 'Base' : 'Base'}`)
  if (c.mult) parts.push(`+${num(c.mult)} Mult`)
  return parts.join(', ')
}

/** The Constellation's description, from its numbers. */
export function constellationText(c, lang = 'en') {
  return lang === 'es'
    ? `Sube un nivel ${c.kind === 'set' ? 'el set' : 'la reacción'} ${c.targetEs} para el resto de la partida: ${perLevel(c, lang)} por nivel (máx. ${LEVEL_CAP}). El nivel 5 duplica su Mult, el nivel 10 lo triplica.`
    : `Levels up ${c.kind === 'set' ? 'the set' : 'the reaction'} ${c.targetEn} for the rest of the run: ${perLevel(c, lang)} per level (max ${LEVEL_CAP}). Level 5 doubles its Mult, level 10 triples it.`
}

export const BLACK_HOLE_TEXT = {
  en: `Levels up every base reaction and set type by one at once (max ${LEVEL_CAP} each).`,
  es: `Sube un nivel todas las reacciones base y todos los tipos de set a la vez (máx. ${LEVEL_CAP} cada uno).`,
}

// Milestones (EXPANSION.md M4): at level 5 the Mult a reaction or set gives is
// doubled, at level 10 tripled. A reaction with no Mult of its own (Forge,
// Bloom, Dust Devil, Resonance) doubles or triples its Base instead.
export const MILESTONES = [{ level: 5, factor: 2 }, { level: 10, factor: 3 }]
export const milestoneFactor = (level) => MILESTONES.reduce((f, m) => (level >= m.level ? m.factor : f), 1)

/** The extra Base and Mult a level adds, for scoring (engine/scoring.js). */
export function levelBonus(constellations, target) {
  const level = constellations?.[target] || 0
  const c = constellationFor(target)
  if (!level || !c) return { level: 0, base: 0, mult: 0, factor: 1 }
  return { level, base: c.base * level, mult: c.mult * level, factor: milestoneFactor(level) }
}

/** The Spanish name/description for each Constellation, for data/i18n.js. */
export const CONSTELLATIONS_ES = Object.fromEntries([
  ...CONSTELLATIONS.map((c) => [`const_${c.id}`, { name: c.es, description: constellationText(c, 'es') }]),
  ['const_black_hole', { name: 'El Gran Atractor', description: BLACK_HOLE_TEXT.es }],
])
