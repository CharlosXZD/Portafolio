// The Road as a drawing (VISUALS.md V6): everything the map view needs to know that is not
// drawing. Pure functions only (no React, no DOM), so Node can test them. The data model
// (engine/map.js) and every rule stay as they are: this file only reads a map and says where
// each stop sits, which state it is in, and which realm's paper it is drawn on.
import { MAP_COLS, nextChoices, nodeById } from '../../../engine/map.js'
import { isBossRound } from '../../../data/bossModifiers.js'
import { realm3For } from '../../../data/realm3.js'

const L = (en, es) => ({ en, es })

/** The realms the Road passes through, in order, with the name written on their gate. */
export const MAP_REALMS = {
  elementa: { name: L('Elementa', 'Elementa'), gate: null },
  firmament: { name: L('The Firmament', 'El Firmamento'), gate: L('The Firmament', 'El Firmamento') },
  empyrean: { name: L('The Empyrean', 'El Empíreo'), gate: L('The Empyrean', 'El Empíreo') },
  pleroma: { name: L('The Pleroma', 'El Pleroma'), gate: L('The Pleroma', 'El Pleroma') },
  meridian: { name: L('The Meridian', 'El Meridiano'), gate: L('The Meridian', 'El Meridiano') },
  unwritten: { name: L('The Unwritten', 'Lo No Escrito'), gate: L('The Unwritten', 'Lo No Escrito') },
}

/**
 * Each realm's paper. `paper` is the ground, `paper2` the lower tone of its gradient, `ink` draws the
 * trails and the labels, `edge` is the band's rule, `gate` the glow of its door. Elementa's paper is
 * the shop's own parchment (`--p*` of the room's materials) when the map sits in a shop.
 */
export const REALM_STYLE = {
  elementa: { paper: 'var(--p2, #e8dcc0)', paper2: 'var(--p1, #cdbb94)', ink: '#4a3320', faint: 'rgba(74,51,32,0.38)', edge: '#8a6a3a', gate: '#ffd166', label: '#4a3320', pattern: 'grain' },
  firmament: { paper: '#1b1a44', paper2: '#2a2468', ink: '#c8c6ff', faint: 'rgba(200,198,255,0.4)', edge: '#6a5cff', gate: '#9a7ee0', label: '#e6e0ff', pattern: 'stars' },
  empyrean: { paper: '#13283c', paper2: '#1e3d58', ink: '#bfe7ff', faint: 'rgba(191,231,255,0.42)', edge: '#5aa8d8', gate: '#9fd8ff', label: '#e6f6ff', pattern: 'grid' },
  pleroma: { paper: '#2c1026', paper2: '#4a1a3c', ink: '#ffb6cc', faint: 'rgba(255,182,204,0.42)', edge: '#c0507a', gate: '#ff7a9a', label: '#ffe0ea', pattern: 'blur' },
  meridian: { paper: '#2a2a1c', paper2: '#3c3a22', ink: '#ffe9a0', faint: 'rgba(255,233,160,0.42)', edge: '#c8a64a', gate: '#ffd166', label: '#fff4cc', pattern: 'split' },
  unwritten: { paper: '#f4f1fa', paper2: '#d8d4e6', ink: '#5a566e', faint: 'rgba(90,86,110,0.32)', edge: '#b0acc6', gate: '#ffffff', label: '#3a364e', pattern: 'blank' },
}

/** Which realm's paper a round's row is drawn on. */
export function realmOfRound(round, state) {
  const map = state?.map
  if (round <= 15) return 'elementa'
  if (round <= 30) return map?.firmament ? 'firmament' : 'elementa'
  if (round <= 45) return state?.realm3 || map?.layers?.length > 30 ? realm3For(state?.path).id : 'firmament'
  return 'unwritten'
}

/** Every node reachable from the current one, walking forward. */
export function reachableFrom(map) {
  const out = new Set([map.currentId])
  const queue = [map.currentId]
  while (queue.length) {
    const node = nodeById(map, queue.shift())
    node?.next.forEach((id) => {
      if (!out.has(id)) {
        out.add(id)
        queue.push(id)
      }
    })
  }
  return out
}

/**
 * The boss that waits before a row, as far as the player may know it: the final Primordial, a Warden
 * or Rewriter Atlas let them peek at, or a foretold boss. `null` when it is still unknown.
 */
export function knownBossAt(round, state) {
  const map = state.map
  if (!isBossRound(round, state.difficulty)) return { boss: false, known: null }
  const firm = state.realm === 'firmament' && round > 15
  const peeked = firm ? map.peeks?.[round] : null
  const known = peeked ?? (!firm && round % 15 === 0 ? 'primordial' : map.prophecy?.round === round ? map.prophecy.boss.id : null)
  return { boss: true, known: known ?? null }
}

/**
 * Where everything sits. Sizes are in pixels at zoom 1. The Road is drawn bottom to top, round 1 at the
 * bottom. A left gutter holds the round labels and the boss banners.
 */
export function layoutRoad({ state, fromRound, toRound: wantedTo, width = 220, rowHeight = 64, nodeSize = 40 }) {
  const map = state.map
  const toRound = Math.min(wantedTo, map.layers.length)
  const rows = []
  for (let r = toRound; r >= fromRound; r--) if (map.layers[r - 1]) rows.push(r)
  const gutter = Math.round(nodeSize * 1.1) + 6
  // a little margin on the right, so the seals never touch the edge of the paper
  const inner = width - gutter - nodeSize - 14
  // The door above the last row of realm 3 opens on the Unwritten: leave room for it.
  const topGate = rows.includes(45) && toRound >= 45
  const topPad = topGate ? Math.round(rowHeight * 0.9) : 0
  const x = (col) => gutter + nodeSize / 2 + (inner * col) / (MAP_COLS - 1)
  const y = (round) => topPad + (toRound - round) * rowHeight + rowHeight / 2
  const height = topPad + rows.length * rowHeight
  // The gates between realms, drawn between two rows that are both in view.
  const gates = []
  for (const [below, realm] of [
    [15, 'firmament'],
    [30, realmOfRound(31, state)],
  ]) {
    if (rows.includes(below) && rows.includes(below + 1) && realmOfRound(below + 1, state) !== realmOfRound(below, state)) {
      gates.push({ id: `gate-${below}`, realm, y: (y(below) + y(below + 1)) / 2, below })
    }
  }
  if (topGate) gates.push({ id: 'gate-45', realm: 'unwritten', y: topPad / 2 + 2, below: 45 })
  return { map, rows, toRound, gutter, inner, x, y, height, width, rowHeight, nodeSize, gates, topPad }
}

/** The state each stop is in. `sight` is the last round whose shops the player may see (rows past it are fog). */
export function nodeState(map, node, { reachable, choices, sight, path }) {
  const here = node.id === map.currentId
  if (here) return 'here'
  if (map.pendingId === node.id) return 'picked'
  if (choices.has(node.id)) return 'choice'
  if (path.has(node.id)) return 'walked'
  if (node.round > sight) return 'unknown'
  if (reachable.has(node.id)) return 'reachable'
  return 'fog'
}

/** The last round whose shops the player can see: three ahead of the round, plus what Atlas and Clarity gave. */
export const sightOf = (state) => state.round + 3 + (state.roadSight || 0)

/** A trail between two stops, as a cubic curve, and what it is like right now. */
export function trailBetween(layout, from, to) {
  const x1 = layout.x(from.col)
  const y1 = layout.y(from.round)
  const x2 = layout.x(to.col)
  const y2 = layout.y(to.round)
  const dy = layout.rowHeight * 0.42
  // A small wobble, steady for the same pair of stops, so trails read as hand-inked and not as rulers.
  const w = (((from.round * 7 + from.col * 3 + to.col) % 5) - 2) * 2
  const pts = [
    [x1, y1],
    [x1 + w, y1 - dy],
    [x2 - w, y2 + dy],
    [x2, y2],
  ]
  return { d: `M ${x1} ${y1} C ${pts[1][0]} ${pts[1][1]}, ${pts[2][0]} ${pts[2][1]}, ${x2} ${y2}`, pts, x1, y1, x2, y2 }
}

/** A point on a trail, `t` from 0 (the lower stop) to 1 (the upper). */
export function pointOnTrail(pts, t) {
  const u = 1 - t
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return [0, 1].map((i) => k[0] * pts[0][i] + k[1] * pts[1][i] + k[2] * pts[2][i] + k[3] * pts[3][i])
}

/** What a stop sells, in words, for the tooltip. */
export const SELLS_LABEL = {
  dice: L('Dice', 'Dados'),
  relics: L('Relics', 'Reliquias'),
  items: L('Items', 'Objetos'),
  forge: L('Forge', 'Forja'),
  upgrades: L('Upgrades', 'Mejoras'),
  brew: L('Brewing', 'Destilado'),
  services: L('Map services', 'Servicios de mapa'),
  deals: L('Pacts', 'Pactos'),
  runes: L('Runes', 'Runas'),
}

/** The shops a node's tooltip lists as what it sells, from the shop type's own fields. */
export function sellsOf(type) {
  const out = []
  if (type.dice > 0) out.push('dice')
  if (type.itemKinds?.includes('relic')) out.push('relics')
  if (type.itemKinds?.includes('consumable')) out.push('items')
  if (type.forge) out.push('forge')
  if (type.upgrades) out.push('upgrades')
  if (type.brew) out.push('brew')
  if (type.services) out.push('services')
  if (type.deals) out.push('deals')
  if (type.runes) out.push('runes')
  return out
}

/** Which stops can be focused with the keyboard, in reading order (bottom to top, left to right). */
export function focusOrder(layout, status) {
  const out = []
  for (const round of [...layout.rows].reverse()) {
    for (const node of layout.map.layers[round - 1]) {
      const s = status(node)
      if (s === 'here' || s === 'choice' || s === 'picked' || s === 'reachable') out.push(node)
    }
  }
  return out
}

/** The nearest focusable stop in a direction ('up', 'down', 'left', 'right'), or null. */
export function neighborInDirection(layout, list, current, dir) {
  const cx = layout.x(current.col)
  const cy = layout.y(current.round)
  let best = null
  let bestScore = Infinity
  for (const n of list) {
    if (n.id === current.id) continue
    const dx = layout.x(n.col) - cx
    const dy = layout.y(n.round) - cy
    const along = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'right' ? dx : -dx
    const across = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy)
    if (along <= 1) continue
    // up and down go to the nearest row first; left and right stay on the row
    const score = dir === 'up' || dir === 'down' ? along * 1000 + across : along + across * 4
    if (score < bestScore) {
      best = n
      bestScore = score
    }
  }
  return best
}

export { nextChoices }
