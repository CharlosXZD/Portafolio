import { memo } from 'react'
import { SPRITES } from '../data/sprites.js'
import { mix } from '../utils/color.js'

/**
 * Renders one of the placeholder 12x12 item sprites (data/sprites.js),
 * tinted from a base color: shade and highlight are derived, accents are
 * explicit. Runs of one color per row become one <rect>.
 */
function PixelSprite({ name, color = '#9aa0a6', accent = '#ffd166', accent2 = '#8f6bff', size = 48 }) {
  const rows = SPRITES[name]
  if (!rows) return null
  const palette = {
    k: '#120c1a',
    a: color,
    b: mix(color, '#120c1a', 0.35),
    c: mix(color, '#ffffff', 0.45),
    d: accent,
    e: accent2,
  }
  const rects = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      if (palette[ch]) rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={end - x} height="1.02" fill={palette[ch]} />)
      x = end
    }
  })
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  )
}

export default memo(PixelSprite)
