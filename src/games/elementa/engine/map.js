// The Road (GDD §28): a seeded, Slay the Spire style map of shops. Layer N
// holds the shops you can visit after clearing round N; each shop links to
// one or more shops in the next layer, and the player picks their path one
// stop ahead from inside the current shop. Drawn from the run's seeded RNG,
// so the same seed always lays out the same Road.
import { random } from './rng.js'
import { SHOP_WEIGHTS } from '../data/shops.js'

const COLS = 3
const BLOCK = 15

function pickWeighted(options) {
  const total = options.reduce((a, o) => a + o.weight, 0)
  let roll = random() * total
  for (const o of options) {
    roll -= o.weight
    if (roll <= 0) return o.id
  }
  return options[options.length - 1].id
}

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function layerColumns(round) {
  if (round === 1) return [1]
  if (random() < 0.62) return [0, 1, 2]
  return [
    [0, 1],
    [1, 2],
    [0, 2],
  ][Math.floor(random() * 3)]
}

// Which shop types fill a layer. Distinct within a layer, so every fork is
// a real choice.
function layerTypes(round, count, bazaarUsed) {
  const inBlock = ((round - 1) % BLOCK) + 1
  if (round === 1) return ['market']
  // Right after a boss: the Vault (the boss's treasures) or the Forge.
  if (round % 5 === 0) return shuffle(['vault', 'forge', 'market'].slice(0, count))
  const types = []
  // The last stop before Primordial is always the Aether Bazaar.
  if (inBlock === BLOCK - 1) types.push('bazaar')
  // Endless blocks keep every shop unlocked.
  const gate = round > BLOCK ? BLOCK : inBlock
  while (types.length < count) {
    const options = SHOP_WEIGHTS.filter(
      (w) => gate >= w.from && !types.includes(w.id) && !(w.id === 'bazaar' && (bazaarUsed || inBlock === BLOCK - 1)),
    )
    if (options.length === 0) break
    types.push(pickWeighted(options))
  }
  return shuffle(types)
}

// Connect two sorted layers with a monotone "staircase": edges never cross,
// every node has at least one way in and one way out.
function link(prev, next) {
  let i = 0
  let j = 0
  const edges = [[0, 0]]
  while (i < prev.length - 1 || j < next.length - 1) {
    const canI = i < prev.length - 1
    const canJ = j < next.length - 1
    const r = random()
    if (canI && canJ && r < 0.34) {
      i++
      j++
    } else if (canJ && (!canI || r < 0.67)) {
      j++
    } else {
      i++
    }
    edges.push([i, j])
  }
  const linked = prev.map((n) => ({ ...n, next: [] }))
  edges.forEach(([a, b]) => {
    if (!linked[a].next.includes(next[b].id)) linked[a].next.push(next[b].id)
  })
  return linked
}

/**
 * Appends `count` layers after the map's last layer (or builds a fresh map
 * when `map` is null). Returns a new map object.
 */
export function extendMap(map, count) {
  const layers = map ? [...map.layers] : []
  let startRound = layers.length + 1
  let bazaarUsed = layers
    .slice(Math.floor((startRound - 1) / BLOCK) * BLOCK)
    .some((layer) => layer.some((n) => n.type === 'bazaar'))
  for (let round = startRound; round < startRound + count; round++) {
    if ((round - 1) % BLOCK === 0) bazaarUsed = false
    let cols = layerColumns(round)
    const types = layerTypes(round, cols.length, bazaarUsed)
    cols = cols.slice(0, types.length)
    if (types.includes('bazaar') && ((round - 1) % BLOCK) + 1 !== BLOCK - 1) bazaarUsed = true
    const layer = cols.map((col, k) => ({ id: `${round}-${col}`, round, col, type: types[k], next: [] }))
    if (layers.length > 0) layers[layers.length - 1] = link(layers[layers.length - 1], layer)
    layers.push(layer)
  }
  const first = layers[0][0]
  return {
    currentId: map?.currentId ?? first.id,
    pendingId: map?.pendingId ?? null,
    path: map?.path ?? [first.id],
    prophecy: map?.prophecy ?? null,
    layers,
  }
}

export function newMap() {
  return extendMap(null, BLOCK)
}

/** Makes sure layers exist up to `round`. */
export function ensureLayers(map, round) {
  if (map.layers.length >= round) return map
  return extendMap(map, Math.max(BLOCK, round - map.layers.length))
}

export function nodeById(map, id) {
  if (!map || !id) return null
  const round = Number(id.split('-')[0])
  return map.layers[round - 1]?.find((n) => n.id === id) ?? null
}

export function currentNode(map) {
  return nodeById(map, map?.currentId)
}

/** The shops reachable from the current one (the next layer). */
export function nextChoices(map) {
  const node = currentNode(map)
  if (!node) return []
  return node.next.map((id) => nodeById(map, id)).filter(Boolean)
}

export const MAP_BLOCK = BLOCK
export const MAP_COLS = COLS

/**
 * Rewrites shop types on the Road ahead (every layer after `afterRound`),
 * in Road order (by round, then column). `fn(node, index)` returns the new
 * type, or null to leave the node alone; `index` counts the nodes `fn` saw.
 * Used by pacts and blessings that change how often Shrines appear (B3),
 * since the Road is laid out in full at the start of a run.
 */
export function retypeAhead(map, afterRound, filter, fn) {
  if (!map) return map
  let index = 0
  const layers = map.layers.map((layer) =>
    layer.map((node) => {
      if (node.round <= afterRound || !filter(node)) return node
      const type = fn(node, index++)
      return type ? { ...node, type } : node
    }),
  )
  return { ...map, layers }
}
