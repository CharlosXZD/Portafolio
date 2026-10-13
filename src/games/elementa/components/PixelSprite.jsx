import { memo } from 'react'
import { SPRITES } from '../data/sprites.js'
import { mix } from '../utils/color.js'

/**
 * Renders one of the placeholder 12x12 item sprites (data/sprites.js),
 * tinted from a base color: shade and highlight are derived, accents are
 * explicit. Runs of one color per row become one <rect>.
 */
const uriCache = new Map()

function PixelSprite({ name, color = '#9aa0a6', accent = '#ffd166', accent2 = '#8f6bff', size = 48 }) {
  const rows = SPRITES[name]
  if (!rows) return null
  // One <img> per sprite and palette (a data URI) instead of a <rect> per run: far fewer DOM nodes (V8.5).
  const key = `${name}|${color}|${accent}|${accent2}`
  let uri = uriCache.get(key)
  if (!uri) {
    const palette = {
      k: '#120c1a',
      a: color,
      b: mix(color, '#120c1a', 0.35),
      c: mix(color, '#ffffff', 0.45),
      d: accent,
      e: accent2,
    }
    let body = ''
    rows.forEach((row, y) => {
      let x = 0
      while (x < row.length) {
        const ch = row[x]
        let end = x + 1
        while (end < row.length && row[end] === ch) end++
        if (palette[ch]) body += `<rect x="${x}" y="${y}" width="${end - x}" height="1.02" fill="${palette[ch]}"/>`
        x = end
      }
    })
    uri = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges">${body}</svg>`)}`
    uriCache.set(key, uri)
  }
  return <img src={uri} width={size} height={size} alt="" aria-hidden="true" draggable={false} style={{ imageRendering: 'pixelated', display: 'inline-block' }} />
}

export default memo(PixelSprite)
