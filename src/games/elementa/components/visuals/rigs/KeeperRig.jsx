import { memo, useMemo } from 'react'
import { useVisualEnv } from '../VisualEnv.jsx'
import { BODY_ROWS, RIG_KEEPERS } from './rigData.js'

// Draws a grid of characters as merged runs of <rect>, skipping `skip` cells.
function runs(rows, palette, y0, skip) {
  const out = []
  rows.forEach((row, i) => {
    const y = y0 + i
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x + 1
      while (end < row.length && row[end] === ch && !skip?.(end, y)) end++
      const fill = palette[ch]
      if (fill && !skip?.(x, y)) out.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height="1.02" fill={fill} />)
      x = end
    }
  })
  return out
}

/**
 * A keeper as stacked SVG layers (VISUALS.md V1 spike 3): chest, head,
 * headpiece, eyes, eyelids, closed and open mouth. Idle breathing (the head
 * settles one art pixel), a blink every few seconds, a talking mouth while
 * `talking`, eyes that glance `left`/`right`, and a nod when `react` changes
 * to 'nod' (pass a new `reactKey` to replay it). All motion is CSS keyframes
 * that move whole art pixels, so the sprite never goes soft; Reduced motion
 * leaves the first pose.
 */
function KeeperRig({ id = 'brasa', size, scale = 8, native = 14, talking = false, look = 'center', react = null, reactKey = 0, className = '', style }) {
  const { reduced } = useVisualEnv()
  const def = RIG_KEEPERS[id] ?? RIG_KEEPERS.brasa
  const { palette } = def
  const layers = useMemo(() => {
    const body = BODY_ROWS(def.mouth)
    const isMouth = (x, y) => y === 8 && x >= 3 && x <= 10
    const faceRows = body.slice(0, 5).map((row, i) => (i === 1 ? row.replace(/[we]/g, 'a') : i === 3 ? '..kaaaaaaaaak.' : row))
    return {
      chest: runs(body.slice(5), palette, 10),
      hat: runs(def.head, palette, 0),
      face: runs(faceRows, palette, 5),
      eyes: [
        <rect key="lw" x="4" y="6" width="1" height="1.02" fill={palette.w} />,
        <rect key="le" x="5" y="6" width="1" height="1.02" fill={palette.e} />,
        <rect key="rw" x="8" y="6" width="1" height="1.02" fill={palette.w} />,
        <rect key="re" x="9" y="6" width="1" height="1.02" fill={palette.e} />,
      ],
      lids: [
        <rect key="ll" x="4" y="6" width="2" height="1.02" fill={palette.b} />,
        <rect key="rl" x="8" y="6" width="2" height="1.02" fill={palette.b} />,
      ],
      mouthClosed: runs([def.mouth], palette, 8, (x, y) => !isMouth(x, y)),
      mouthOpen: [
        <rect key="o1" x="5" y="8" width="4" height="1.02" fill={palette.k} />,
        <rect key="o2" x="6" y="9" width="2" height="1.02" fill={palette.e === '#120c1a' ? '#5a2a22' : palette.k} />,
      ],
    }
  }, [def, palette])

  return (
    <svg
      viewBox="0 0 14 14"
      width={size ?? native * scale}
      height={size ?? native * scale}
      shapeRendering="crispEdges"
      className={`v-rig ${className}`}
      data-talking={talking && !reduced ? '' : undefined}
      data-look={look}
      data-reduced={reduced ? '' : undefined}
      style={style}
      role="img"
      aria-label={id}
    >
      <g>{layers.chest}</g>
      <g key={reactKey} className="v-rig__nod" data-react={react && !reduced ? react : undefined}>
        <g className="v-rig__head">
          <g>{layers.face}</g>
          <g className="v-rig__mouth-closed">{layers.mouthClosed}</g>
          <g className="v-rig__mouth-open">{layers.mouthOpen}</g>
          <g className="v-rig__eyes">{layers.eyes}</g>
          <g className="v-rig__lids">{layers.lids}</g>
          <g className="v-rig__hat">{layers.hat}</g>
        </g>
      </g>
    </svg>
  )
}

export default memo(KeeperRig)
