// Sigil dice (EXPANSION.md P1 to P3): six faces of symbols, no numbers. A
// sigil die never takes part in sets, straights or reactions and scores no
// Base; landing on a face triggers that symbol's effect. Three sets, one per
// path, each with a normal die and a Greater one.
const L = (en, es) => ({ en, es })

export const SYMBOLS = ['sun', 'scale', 'key', 'eye', 'spiral', 'maw']

// The Split die shows Sun, Scale and Key twice; the Primordial's Eye,
// Spiral and Maw twice; the Neutral die each of the six once (P1).
export const SIGIL_FACES = {
  aeris: ['sun', 'sun', 'scale', 'scale', 'key', 'key'],
  nix: ['eye', 'eye', 'spiral', 'spiral', 'maw', 'maw'],
  tobb: ['sun', 'scale', 'key', 'eye', 'spiral', 'maw'],
}

/** The three sets: the path they come from, the keeper who sells them, and their colors. */
export const SIGIL_SETS = {
  aeris: { path: 'split', shop: 'shrine', normal: 'sigil_aeris', greater: 'sigil_aeris_g', color: '#f4e3a8', accent: '#d9a441', name: L("Aeris's Sigil", 'Sigilo de Aeris'), greaterName: L('Greater Sigil of Aeris', 'Gran Sigilo de Aeris') },
  nix: { path: 'primordial', shop: 'blackmarket', normal: 'sigil_nix', greater: 'sigil_nix_g', color: '#a8324a', accent: '#8a5cff', name: L("Nix's Sigil", 'Sigilo de Nix'), greaterName: L('Greater Sigil of Nix', 'Gran Sigilo de Nix') },
  tobb: { path: 'neutral', shop: 'market', normal: 'sigil_tobb', greater: 'sigil_tobb_g', color: '#b9b2a0', accent: '#4fc3b0', name: L("Tobb's Sigil", 'Sigilo de Tobb'), greaterName: L('Greater Sigil of Tobb', 'Gran Sigilo de Tobb') },
}
export const SIGIL_SET_IDS = Object.keys(SIGIL_SETS)
export const SIGIL_DIE_IDS = SIGIL_SET_IDS.flatMap((k) => [SIGIL_SETS[k].normal, SIGIL_SETS[k].greater])
export const isSigilId = (elementId) => SIGIL_DIE_IDS.includes(elementId)
/** Which set a sigil die belongs to ('aeris', 'nix' or 'tobb'). */
export const sigilSetOf = (elementId) => SIGIL_SET_IDS.find((k) => SIGIL_SETS[k].normal === elementId || SIGIL_SETS[k].greater === elementId) ?? null
export const isGreaterSigil = (elementId) => SIGIL_SET_IDS.some((k) => SIGIL_SETS[k].greater === elementId)
export const sigilFaces = (elementId) => SIGIL_FACES[sigilSetOf(elementId)] ?? []

// Prices (P3): 20 Shards, the Greater one 40.
export const SIGIL_PRICE = 20
export const SIGIL_GREATER_PRICE = 40
/** The chance a keeper's shop offers a sigil die you have unlocked (about 1 visit in 4, Default). */
export const SIGIL_OFFER_CHANCE = 0.25

/** Which sigil dice a file has unlocked, from its Firmament endings (P3). */
export function sigilsFromEndings(endings = []) {
  return SIGIL_SET_IDS.flatMap((k) => {
    const path = SIGIL_SETS[k].path
    return [
      ...(endings.includes(`firmament_${path}_1`) ? [SIGIL_SETS[k].normal] : []),
      ...(endings.includes(`firmament_${path}_2`) ? [SIGIL_SETS[k].greater] : []),
    ]
  })
}

// What each symbol does (P2), normal and Greater, for tooltips and the key
// on a card. The numbers live in engine/scoring.js (SIGIL).
export const SYMBOL_INFO = {
  sun: { name: L('Sun', 'Sol'), normal: L('All your dice score +50% Base.', 'Todos tus dados anotan +50% de Base.'), greater: L('All your dice score +100% Base.', 'Todos tus dados anotan +100% de Base.') },
  scale: {
    name: L('Scale', 'Balanza'),
    normal: L('Tips the scales: your Base is raised to the expected average of your number dice, if it came out lower.', 'Inclina la balanza: tu Base sube al promedio esperado de tus dados numéricos, si salió menor.'),
    greater: L('The floor is 1.5 times the expected average.', 'El piso es 1.5 veces el promedio esperado.'),
  },
  key: { name: L('Key', 'Llave'), normal: L('+1 reroll this round, and one locked or frozen die is released.', '+1 reroll esta ronda, y un dado bloqueado o congelado se libera.'), greater: L('+2 rerolls, and every locked or frozen die is released.', '+2 rerolls, y todo dado bloqueado o congelado se libera.') },
  eye: {
    name: L('Eye', 'Ojo'),
    normal: L('Shows the next roll of one die of your choice, and the next boss. +5 Mult.', 'Muestra la próxima tirada de un dado a tu elección, y el próximo jefe. +5 Mult.'),
    greater: L('Shows the next roll of every unheld die, and the next boss. +10 Mult.', 'Muestra la próxima tirada de todo dado no guardado, y el próximo jefe. +10 Mult.'),
  },
  spiral: {
    name: L('Spiral', 'Espiral'),
    normal: L('The die rolls again for free; each Spiral in the chain adds +2 Mult (up to 5).', 'El dado se tira otra vez gratis; cada Espiral en la cadena suma +2 Mult (hasta 5).'),
    greater: L('+4 Mult each, up to 8 times.', '+4 Mult cada una, hasta 8 veces.'),
  },
  maw: { name: L('Maw', 'Fauces'), normal: L('Eats your lowest other die (it scores 0); twice its score goes to Mult.', 'Se come tu otro dado más bajo (anota 0); el doble de su puntaje va al Mult.'), greater: L('Eats your two lowest other dice; 3 times their scores go to Mult.', 'Se come tus dos otros dados más bajos; 3 veces sus puntajes van al Mult.') },
}

/** A symbol's rules text, normal or Greater. */
export const symbolText = (symbol, greater, lang) => SYMBOL_INFO[symbol][greater ? 'greater' : 'normal'][lang]
