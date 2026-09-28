// Turns a relic/consumable/die/forge-recipe into the small, uniform shape
// ItemIcon + ItemInspector expect: { name, description, rarity, color, glyph }.
// Shared so the shop and the in-round HUD render the same "item" concept
// identically rather than each inventing their own card markup. Every
// function takes `lang` ('en'/'es', from useLanguage()) and localizes name/
// description via data/i18n.js, which holds the Spanish copy keyed by id
// rather than duplicating each item's object.
import { ELEMENTS, rarityForElement } from './elements.js'
import { localize, RELICS_ES, CONSUMABLES_ES, ELEMENTS_ES } from './i18n.js'
import { ITEM_ART } from './sprites.js'

function spriteFor(id) {
  const art = ITEM_ART[id]
  return art ? { name: art[0], color: art[1], accent: art[2], accent2: art[3] } : null
}

const NEUTRAL = '#9ca3af'

// Every die has a pixel mark named after its element id (components/
// PixelIcon.jsx); relics and consumables get a placeholder object sprite.

export function relicDescriptor(relic, lang = 'en') {
  const name = localize(lang, relic.name, RELICS_ES, relic.id, 'name')
  return {
    kind: 'relic',
    id: relic.id,
    name,
    description: localize(lang, relic.description, RELICS_ES, relic.id, 'description'),
    rarity: relic.rarity,
    color: relic.element ? ELEMENTS[relic.element].color : NEUTRAL,
    glyph: name[0],
    sprite: spriteFor(relic.id),
  }
}

const CONSUMABLE_GLYPH = {
  upgrade: '⬆',
  reroll: '↻',
}

export function consumableDescriptor(def, lang = 'en') {
  const name = localize(lang, def.name, CONSUMABLES_ES, def.id, 'name')
  const elementName = def.targetElementId
    ? localize(lang, ELEMENTS[def.targetElementId].name, ELEMENTS_ES, def.targetElementId, 'name')
    : null
  return {
    kind: 'consumable',
    id: def.id,
    name,
    description: localize(lang, def.description, CONSUMABLES_ES, def.id, 'description'),
    rarity: def.rarity,
    color: def.element ? ELEMENTS[def.element].color : '#c4b5fd',
    glyph: CONSUMABLE_GLYPH[def.type] ?? elementName?.[0] ?? '?',
    sprite: spriteFor(def.id),
  }
}

export function dieDescriptor(elementId, lang = 'en') {
  const def = ELEMENTS[elementId]
  const name = localize(lang, def.name, ELEMENTS_ES, elementId, 'name')
  return {
    kind: 'die',
    id: elementId,
    name,
    description: localize(lang, def.tagline, ELEMENTS_ES, elementId, 'tagline'),
    rarity: rarityForElement(elementId),
    color: def.color,
    glyph: name[0],
    icon: elementId,
  }
}

export function forgeDescriptor(recipe, lang = 'en') {
  const def = ELEMENTS[recipe.fusionElementId]
  const name = localize(lang, def.name, ELEMENTS_ES, recipe.fusionElementId, 'name')
  const parentNames = recipe.parents
    .map((p) => localize(lang, ELEMENTS[p].name, ELEMENTS_ES, p, 'name'))
    .join(' + ')
  const description =
    lang === 'es'
      ? `Combina ${parentNames} para obtener ${name}. Consume los dados originales.`
      : `Combine ${parentNames} into ${name}. Consumes the parent dice.`
  return {
    kind: 'forge',
    id: recipe.fusionElementId,
    name,
    description,
    rarity: rarityForElement(recipe.fusionElementId),
    color: def.color,
    glyph: name[0],
    icon: recipe.fusionElementId,
  }
}
