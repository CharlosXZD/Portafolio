// Small hex color helpers for the procedural pixel art (DieSprite,
// PixelSprite), where SVG fills need concrete colors, not color-mix().
function toRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** Blend `a` toward `b` by t (0 = a, 1 = b). */
export function mix(a, b, t) {
  const ca = toRgb(a)
  const cb = toRgb(b)
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}
