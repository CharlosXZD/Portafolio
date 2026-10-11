import { memo } from 'react'
import { mix } from '../../../utils/color.js'
import { GRIDS } from './mapSigns.js'

// The little pictures on the Road (VISUALS.md V6), all drawn in code: a sign for every kind of
// shop, the traveler who shows where you are, the flag of a chosen stop. Each is a small grid of
// letters painted as crisp square pixels, so they match the game's other sprites. A hand-drawn
// file named `map.node.<shop id>` (png, webp or svg) in public/elementa/visuals/ replaces a sign
// with no code change (ASSETS.md section 8): MapCanvas looks for it.
//
// Letters: . empty  k outline  a the shop's color  b its dark tone  l its light tone
//          w wood  d dark wood  m metal  M light metal  y gold  r red  c cream  g green  u violet
const INK = '#120c1a'
const FIXED = { k: INK, w: '#a8703c', d: '#6a4224', m: '#8a909c', M: '#d8dce4', y: '#ffd166', r: '#e5533d', c: '#f2e6c8', g: '#6fbf4a', u: '#8a5cff' }

function palette(color) {
  return { a: color, b: mix(color, INK, 0.45), l: mix(color, '#ffffff', 0.4), ...FIXED }
}

/** One <path> per color: every pixel of that color as a unit square (a sign is a handful of paths, not a hundred rects). */
function gridPaths(grid, pal, fallback) {
  const byColor = new Map()
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x]
      if (c === '.') continue
      const fill = pal[c] ?? fallback
      byColor.set(fill, `${byColor.get(fill) ?? ''}M${x} ${y}h1v1h-1z`)
    }
  })
  return [...byColor.entries()].map(([fill, d]) => <path key={fill} d={d} fill={fill} />)
}

/**
 * A shop's sign, `size` px square, drawn from its grid in the shop's color. `src` is a hand-drawn
 * replacement when one exists (the swap rule).
 */
function SignBase({ type, color, size = 28, src = null }) {
  if (src) {
    return <img src={src} alt="" width={size} height={size} draggable={false} style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
  }
  const grid = GRIDS[type] ?? GRIDS.crown
  const pal = palette(color)
  return (
    <svg viewBox={`0 ${(grid.length - 12) / 2} 12 12`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {gridPaths(grid, pal, color)}
    </svg>
  )
}
export const ShopSign = memo(SignBase)

const TRAVELER = [
  '....kkkk....',
  '...kuuuuk...',
  '..kuuuuuuk..',
  '..kuckkcuk..',
  '..kuckkcuk..',
  '..kuuccuuk..',
  '.kuuuuuuuuk.',
  '.kuuyuuuuuk.',
  '.kuuuuuuuuk.',
  '..kk.kk.kk..',
]

/** The traveler: a hooded figure with a lantern, who stands on the stop you are at. */
function TravelerBase({ size = 30, lit = true }) {
  const pal = { ...FIXED, u: '#6a46c8', c: '#f2e6c8', y: lit ? '#ffd166' : '#a88a3a' }
  return (
    <svg viewBox="0 0 12 10" width={size} height={(size * 10) / 12} shapeRendering="crispEdges" aria-hidden="true">
      {gridPaths(TRAVELER, pal, '#fff')}
    </svg>
  )
}
export const Traveler = memo(TravelerBase)

const FLAG = ['.rrrr.', '.rrrrr', '.rrrr.', '.k....', '.k....', '.k....', 'kkk...']

/** The flag planted on the stop you picked. */
function FlagBase({ size = 22 }) {
  const pal = { ...FIXED, r: '#e5533d' }
  return (
    <svg viewBox="0 0 6 7" width={size} height={(size * 7) / 6} shapeRendering="crispEdges" aria-hidden="true">
      {gridPaths(FLAG, pal, '#fff')}
    </svg>
  )
}
export const Flag = memo(FlagBase)
