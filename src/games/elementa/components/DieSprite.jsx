import { memo } from 'react'
import { isBigTier } from '../data/diceTiers.js'

/**
 * Procedural pixel-art die body on a 32x32 grid (the same native size as
 * the hand-drawn dice in ASSETS.md), so each tier has its own silhouette:
 *   d3  triangle   d6  chamfered square   d10 kite   d20 hexagon
 * A shape is rasterized once (point-in-polygon on pixel centers), then
 * each pixel is classified (outline / rim light / shade / facet / body /
 * outer ring) and painted from the die's element colors. Horizontal runs
 * of one color are merged into a single <rect> to keep the DOM small.
 */
const G = 32

const SHAPES = {
  d3: { poly: [[16, 1.5], [30.5, 28.5], [1.5, 28.5]], facets: [], numberY: 0.72 },
  // d5: a pentagon, a shade rounder than the d6's chamfered square.
  d5: {
    poly: [[16, 1.5], [29.5, 11.5], [24.5, 29], [7.5, 29], [2.5, 11.5]],
    facets: [],
    numberY: 0.55,
  },
  d6: {
    poly: [[6, 3], [26, 3], [29, 6], [29, 26], [26, 29], [6, 29], [3, 26], [3, 6]],
    facets: [],
    numberY: 0.5,
  },
  d10: {
    poly: [[16, 1.5], [29.5, 13], [16, 30.5], [2.5, 13]],
    facets: [[[2.5, 13], [16, 19]], [[16, 19], [29.5, 13]], [[16, 19], [16, 30.5]]],
    numberY: 0.4,
  },
  d20: {
    poly: [[16, 1.5], [29, 8.5], [29, 23.5], [16, 30.5], [3, 23.5], [3, 8.5]],
    facets: [[[16, 7], [25, 22]], [[25, 22], [7, 22]], [[7, 22], [16, 7]]],
    numberY: 0.56,
  },
}

// Sizes past d20 (EXPANSION.md H5) reuse the d20's hexagon; the die prints
// its size on the body instead.
function shapeOf(tier) {
  return SHAPES[tier] ?? (isBigTier(tier) ? SHAPES.d20 : SHAPES.d6)
}

function inside(poly, x, y) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

function distToSegment(px, py, [[x1, y1], [x2, y2]]) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

// Pixel classes.
const OUT = 0
const OUTLINE = 1
const RIM = 2
const SHADE = 3
const FACET = 4
const BODY_TOP = 5
const BODY_BOTTOM = 6
const RING = 7

const cache = new Map()

function classify(tier) {
  if (cache.has(tier)) return cache.get(tier)
  const shape = shapeOf(tier)
  const mask = Array.from({ length: G }, (_, y) => Array.from({ length: G }, (_, x) => inside(shape.poly, x + 0.5, y + 0.5)))
  const at = (x, y) => x >= 0 && y >= 0 && x < G && y < G && mask[y][x]
  const grid = Array.from({ length: G }, () => new Array(G).fill(OUT))
  let minY = G
  let maxY = 0
  for (let y = 0; y < G; y++)
    for (let x = 0; x < G; x++)
      if (mask[y][x]) {
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
  const split = minY + (maxY - minY) * 0.58
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      if (!mask[y][x]) {
        // Outer selection ring: up to 2px outside the silhouette.
        let near = false
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) near = at(x + dx, y + dy)
        grid[y][x] = near ? RING : OUT
        continue
      }
      const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1)
      if (edge) grid[y][x] = OUTLINE
      else if (!at(x, y - 2)) grid[y][x] = RIM
      else if (!at(x, y + 2)) grid[y][x] = SHADE
      else if (shape.facets.some((seg) => distToSegment(x + 0.5, y + 0.5, seg) < 0.7)) grid[y][x] = FACET
      else grid[y][x] = y + 0.5 < split ? BODY_TOP : BODY_BOTTOM
    }
  }
  const result = { grid, numberY: shape.numberY }
  cache.set(tier, result)
  return result
}

export function dieNumberY(tier) {
  return shapeOf(tier).numberY
}

/** How big a face number is, as a share of the die: a d3's is smaller, and so is a 3-digit face. */
export function dieNumberScale(tier, face) {
  const base = tier === 'd3' ? 0.22 : 0.27
  return String(face ?? '').length >= 3 ? base * 0.72 : base
}

// Where a lone element mark goes. A d3's face number sits low, in the wide
// base, but a mark with no number belongs at the triangle's centroid.
export function dieIconY(tier) {
  return tier === 'd3' ? 0.61 : dieNumberY(tier)
}

function DieSprite({ tier = 'd6', size = 96, top, bottom, rim, shade, facet, ringColor = null }) {
  const { grid } = classify(tier)
  const colors = {
    [OUTLINE]: '#120c1a',
    [RIM]: rim,
    [SHADE]: shade,
    [FACET]: facet,
    [BODY_TOP]: top,
    [BODY_BOTTOM]: bottom,
    [RING]: ringColor,
  }
  const rects = []
  for (let y = 0; y < G; y++) {
    let x = 0
    while (x < G) {
      const c = grid[y][x]
      let end = x + 1
      while (end < G && grid[y][end] === c) end++
      const fill = colors[c]
      if (c !== OUT && fill) rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={end - x} height="1.02" fill={fill} />)
      x = end
    }
  }
  return (
    <svg
      viewBox={`0 0 ${G} ${G}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {rects}
    </svg>
  )
}

export default memo(DieSprite)
