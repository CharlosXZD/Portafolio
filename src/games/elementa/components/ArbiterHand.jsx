import { ARBITER } from '../data/arbiter.js'

/**
 * The Arbiter's portrait (Part S): an open, empty hand, drawn in code with
 * crisp pixel rectangles (no art). It is the one portrait everything uses:
 * story scenes, the speech bubble and the Gallery. Colors come from ARBITER.
 */
export function ArbiterHand({ size = 48 }) {
  const skin = ARBITER.accent
  const shade = ARBITER.color
  const line = '#1a1a24'
  // fingers: x, top y (palm top is y 17)
  const fingers = [
    [9, 9],
    [13, 5],
    [17, 7],
    [21, 11],
  ]
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {/* A faint ring above the palm: nothing in it. */}
      <rect x="12" y="1" width="8" height="1" fill={shade} opacity="0.5" />
      <rect x="11" y="2" width="1" height="1" fill={shade} opacity="0.5" />
      <rect x="20" y="2" width="1" height="1" fill={shade} opacity="0.5" />
      {fingers.map(([x, y]) => (
        <g key={x}>
          <rect x={x - 0.5} y={y - 0.5} width="4" height={18 - y + 1} fill={line} />
          <rect x={x} y={y} width="3" height={18 - y} fill={skin} />
        </g>
      ))}
      {/* Thumb */}
      <rect x="3.5" y="15.5" width="6" height="7" fill={line} />
      <rect x="4" y="16" width="5" height="6" fill={skin} />
      {/* Palm */}
      <rect x="8.5" y="16.5" width="16" height="11" fill={line} />
      <rect x="9" y="17" width="15" height="10" fill={skin} />
      <rect x="9" y="24" width="15" height="3" fill={shade} />
      <rect x="12" y="20" width="9" height="1" fill={shade} />
    </svg>
  )
}
