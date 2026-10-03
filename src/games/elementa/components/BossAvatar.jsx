import { memo } from 'react'
import { mix } from '../utils/color.js'

/**
 * Placeholder boss portraits (GDD §26): a symmetric 12x12 pixel creature
 * generated from the boss id, the classic "space invader" trick. The same
 * id always yields the same face, so each boss has a stable identity until
 * a hand-drawn portrait replaces it. Ermal gets a sleepy face, naturally.
 */
const G = 12
const COLORS = {
  calm_winds: '#9fe8e0',
  grounded: '#8a6a3d',
  iron_grip: '#9aa0a6',
  drought: '#e0b060',
  tax_collector: '#f2c94c',
  scatter: '#b28df2',
  ermal: '#5fd38a',
  null_zone: '#5b5f7a',
  gravity_well: '#6a4fd6',
  the_pillar: '#c8b6ff',
  frostbite: '#7dd3fc',
  eclipse: '#2b2b33',
  silence: '#8a8fa0',
  primordial: '#ff5a5a',
  // The gods of the Primordial path's gauntlet (B1).
  gaea: '#b8894a',
  ognen: '#ff5a1a',
  varuna: '#2f7fe0',
  zephyr: '#dff3ff',
  // The Wardens of the Firmament (EXPANSION.md H2).
  dawn: '#ffe27a',
  umbra: '#4a3a78',
  clockwork: '#c9a46b',
  expanse: '#5a7cff',
  maelstrom: '#ff3fa4',
  hollow: '#6b5a8a',
}

function rng(seedStr) {
  let h = 2166136261
  for (const ch of seedStr) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  let s = h >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const cache = new Map()

function build(id) {
  if (cache.has(id)) return cache.get(id)
  const rand = rng(id)
  const grid = Array.from({ length: G }, () => new Array(G).fill(0))
  // Fill the left half (with a solid core), then mirror it.
  for (let y = 1; y < G - 1; y++) {
    for (let x = 1; x < G / 2; x++) {
      const core = x >= 3 && y >= 3 && y <= 8
      const p = core ? 0.92 : 0.45 - Math.abs(y - 5.5) * 0.04
      if (rand() < p) {
        grid[y][x] = 1
        grid[y][G - 1 - x] = 1
      }
    }
  }
  // Horns or ears for some bosses, deterministic by id.
  if (rand() < 0.6) {
    grid[1][3] = grid[1][G - 4] = 1
    grid[0][3] = grid[0][G - 4] = rand() < 0.5 ? 1 : 0
  }
  const cells = []
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      if (grid[y][x]) {
        cells.push({ x, y, c: y < 5 ? 'a' : 'b' })
      } else {
        const touching = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => grid[y + dy]?.[x + dx])
        if (touching) cells.push({ x, y, c: 'k' })
      }
    }
  }
  cache.set(id, cells)
  return cells
}

function BossAvatar({ id, size = 48, unknown = false }) {
  const color = COLORS[id] ?? '#ff5a5a'
  const palette = unknown
    ? { k: '#120c1a', a: '#3a3048', b: '#2a2338' }
    : { k: '#120c1a', a: mix(color, '#ffffff', 0.15), b: mix(color, '#120c1a', 0.35) }
  const cells = build(id)
  const sleepy = id === 'ermal'
  return (
    <svg viewBox={`0 0 ${G} ${G}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {cells.map(({ x, y, c }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[c]} />
      ))}
      {!unknown &&
        (sleepy ? (
          <>
            <rect x="3" y="5" width="2" height="1" fill="#120c1a" />
            <rect x="7" y="5" width="2" height="1" fill="#120c1a" />
            <rect x="9.5" y="1.5" width="1" height="1" fill="#ffffff" opacity="0.8" />
            <rect x="10.5" y="0.5" width="1" height="1" fill="#ffffff" opacity="0.6" />
          </>
        ) : (
          <>
            <rect x="3" y="4" width="2" height="2" fill="#ffffff" />
            <rect x="7" y="4" width="2" height="2" fill="#ffffff" />
            <rect x="4" y="5" width="1" height="1" fill="#120c1a" />
            <rect x="7" y="5" width="1" height="1" fill="#120c1a" />
          </>
        ))}
    </svg>
  )
}

export default memo(BossAvatar)
