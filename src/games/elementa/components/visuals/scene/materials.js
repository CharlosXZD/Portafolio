// The materials system for the shop scenes (VISUALS.md V4.3). Every shop is made of
// a handful of materials (wood, leather, parchment, metal, stone), one accent and the
// light that falls on them. A material is a four-tone ramp (dark, base, light, highlight),
// the same ramp the item sprites use, set as CSS variables on the scene root so every
// object (counter, shelf, hang-tag, plaque, lever, pouch, sign, slate, pocket) is drawn
// from them. A shop picks its set here; realms tint the accent only.
import { mix } from '../../../utils/color.js'

const INK = '#120c1a'
const ramp4 = (c) => [mix(c, INK, 0.5), mix(c, INK, 0.2), c, mix(c, '#ffffff', 0.28)]

// base colors per shop: wood (counter, planks, signs), leather (the bag), parch (tags, signs), metal (rims, levers), stone (slates, recesses)
const SETS = {
  market: { wood: '#8a5a34', leather: '#7a4a2a', parch: '#e8dcc0', metal: '#c9a46b', stone: '#5a5470' },
  alchemist: { wood: '#4a5a4a', leather: '#3a5a4a', parch: '#d8e8d0', metal: '#6fb8a0', stone: '#3a4a4a' },
  vault: { wood: '#4a3a6a', leather: '#4a3a5a', parch: '#e0d8f0', metal: '#b8a8e0', stone: '#4a4666' },
  forge: { wood: '#5a3626', leather: '#5a3a2a', parch: '#e0cfa8', metal: '#9aa0a8', stone: '#3a3438' },
  blackmarket: { wood: '#2e2438', leather: '#2a2236', parch: '#bcaed0', metal: '#8a5cff', stone: '#241e30' },
  shrine: { wood: '#9ab0d0', leather: '#8aa0c8', parch: '#f2f6ff', metal: '#dfeaff', stone: '#7088b0' },
  bazaar: { wood: '#6a3ab0', leather: '#5a2a90', parch: '#f4ead0', metal: '#ffd166', stone: '#3a2a6a' },
  astral: { wood: '#2a2060', leather: '#2a1f5a', parch: '#d8d0f0', metal: '#d9b8ff', stone: '#1e1850' },
  cartography: { wood: '#6a6a74', leather: '#5a5a6a', parch: '#eadfc4', metal: '#7ad1ff', stone: '#3e4252' },
  clockwork: { wood: '#6a5430', leather: '#5a4628', parch: '#e8dcc0', metal: '#c9a46b', stone: '#3a3020' },
  observatory: { wood: '#3a4a8a', leather: '#2e3a70', parch: '#d8e0f8', metal: '#9fb8ff', stone: '#222a58' },
  pantry: { wood: '#4a3a5a', leather: '#3a2e4a', parch: '#d8cfe0', metal: '#8a7aa8', stone: '#2a2238' },
  camp: { wood: '#7a4a2a', leather: '#6a4228', parch: '#e8d8b8', metal: '#e8a86b', stone: '#4a3e38' },
}

/** CSS variables for one shop's scene. `accent` is the shop's own color from data/shops.js. */
export function sceneVars(shopId, accent) {
  const set = SETS[shopId] ?? SETS.market
  const vars = {}
  for (const [name, key] of [['w', 'wood'], ['l', 'leather'], ['p', 'parch'], ['m', 'metal'], ['s', 'stone']]) {
    ramp4(set[key]).forEach((c, i) => {
      vars[`--${name}${i}`] = c
    })
  }
  vars['--acc'] = accent ?? set.metal
  // the existing wood tokens follow the shop, so the old wooden signs and panels take its wood
  const w = ramp4(set.wood)
  vars['--wood-0'] = w[0]
  vars['--wood-1'] = w[1]
  vars['--wood-2'] = set.wood
  vars['--wood-3'] = w[3]
  vars['--wood-hi'] = mix(set.wood, '#ffffff', 0.42)
  return vars
}

export const SCENE_SHOPS = Object.keys(SETS)
