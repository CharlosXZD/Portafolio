// Totems (EXPANSION.md L4): consumables that level a family's ability for the
// rest of the run, up to TOTEM_CAP. Like a Constellation they apply at once
// with no target; the levels live in `state.totems` ({ fire, water, earth,
// air }, missing keys count as 0 so old saves load).
export const TOTEM_CAP = 5

// Fire: explosions add this much more Mult each, per level, and Kindling pays
// one reroll more every two levels (so Fire stays fun, not stronger than the rest).
export const FIRE_TOTEM_MULT = 0.1
// Water: Tide starts at half the locked score and grows by this per level, so
// level 5 sends all of it.
export const TIDE_BASE_SHARE = 0.5
export const TIDE_SHARE_PER_LEVEL = 0.1

export const TOTEMS = [
  { id: 'fire', family: 'fire', en: 'Fire Totem', es: 'Tótem de Fuego', color: '#ff8a3d' },
  { id: 'water', family: 'water', en: 'Water Totem', es: 'Tótem de Agua', color: '#3d8fe5' },
  { id: 'earth', family: 'earth', en: 'Earth Totem', es: 'Tótem de Tierra', color: '#c89a5c' },
  { id: 'air', family: 'air', en: 'Air Totem', es: 'Tótem de Aire', color: '#cfe8f2' },
]

export const totemById = (id) => TOTEMS.find((t) => t.id === id)

/** A family's Totem level this run (0 when none, or for an old save). */
export const totemLevel = (totems, family) => Math.min(TOTEM_CAP, totems?.[family] || 0)

/** The part of a locked Water die's score that Tide sends to Mult. */
export const tideShare = (level) => Math.min(1, TIDE_BASE_SHARE + TIDE_SHARE_PER_LEVEL * level)

/** The extra rerolls Kindling pays for each fizzled die: 1, +1 every 2 levels. */
export const kindlingReroll = (level) => 1 + Math.floor(level / 2)

const TEXT = {
  fire: {
    en: 'Each level: every explosion adds +0.1 Mult more, and every 2 levels Kindling pays +1 reroll more. Level 5 at most, for the whole run.',
    es: 'Cada nivel: cada explosión suma +0.1 Mult más, y cada 2 niveles la Yesca devuelve +1 reroll más. Nivel 5 como máximo, toda la partida.',
  },
  water: {
    en: 'Each level: Tide sends 10% more of a locked Water die\'s score to Mult (half to start, all of it at level 5). Level 5 at most, for the whole run.',
    es: 'Cada nivel: la Marea manda un 10% más de la puntuación de un dado de Agua bloqueado al Mult (la mitad al inicio, todo en el nivel 5). Nivel 5 como máximo, toda la partida.',
  },
  earth: {
    en: 'Each level: Patience gives +1 more for every reroll a die sits out. Level 5 at most, for the whole run.',
    es: 'Cada nivel: la Paciencia da +1 más por cada reroll que un dado se queda fuera. Nivel 5 como máximo, toda la partida.',
  },
  air: {
    en: 'Each level: +1 Drift charge every round (each charge nudges one die). Level 5 at most, for the whole run.',
    es: 'Cada nivel: +1 carga de Deriva cada ronda (cada carga mueve un dado). Nivel 5 como máximo, toda la partida.',
  },
}

export const totemText = (totem, lang = 'en') => TEXT[totem.id][lang]

/** The Spanish name/description for each Totem, for data/i18n.js. */
export const TOTEMS_ES = Object.fromEntries(TOTEMS.map((t) => [`totem_${t.id}`, { name: t.es, description: TEXT[t.id].es }]))
