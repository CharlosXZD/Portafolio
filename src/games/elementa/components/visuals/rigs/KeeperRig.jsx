import { memo, useMemo } from 'react'
import { useVisualEnv } from '../VisualEnv.jsx'
import { BODY_ROWS, CONCLAVE_IDS, RIG_KEEPERS } from './rigData.js'
import './rig.css'

// Draws a grid of characters as merged runs of <rect>, skipping cells for which `skip` is true.
function runs(rows, palette, y0, skip) {
  const out = []
  rows.forEach((row, i) => {
    const y = y0 + i
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x + 1
      while (end < row.length && row[end] === ch && !skip?.(end, y, ch)) end++
      const fill = palette[ch]
      if (fill && !skip?.(x, y, ch)) out.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height="1.02" fill={fill} />)
      x = end
    }
  })
  return out
}

/**
 * A keeper as stacked SVG layers (VISUALS.md V1 spike 3, V3.4): chest, head,
 * headpiece, accent (the flame hair, the halo, the horns), eyes, eyelids,
 * closed and open mouth. Idle breathing (the head settles one art pixel), a
 * blink every few seconds, a talking mouth while `talking`, eyes that glance
 * `left`/`right`, and a reaction beat when `react` changes (pass a new
 * `reactKey` to replay it): 'nod', 'shake' (a grumble), 'hop' (glad). All
 * motion is CSS keyframes that move whole art pixels; Reduced motion leaves
 * the first pose, and `still` also drops the blink (the low-end tier keeps
 * only the blink, so it passes `blinkOnly`). The data comes from the shipping
 * sprites (rigData.js), so a rig matches KeeperSprite at rest.
 */
function Rig({ id = 'brasa', size, scale = 8, native = 14, talking = false, look = 'center', react = null, reactKey = 0, blinkOnly = false, className = '', style }) {
  const { reduced } = useVisualEnv()
  const def = RIG_KEEPERS[id] ?? RIG_KEEPERS.brasa
  const { palette } = def
  const layers = useMemo(() => {
    const body = BODY_ROWS(def.mouth)
    const isMouth = (x, y) => y === 8 && x >= 3 && x <= 10
    const faceRows = body.slice(0, 5).map((row, i) => (i === 1 ? row.replace(/[we]/g, 'a') : i === 3 ? '..kaaaaaaaaak.' : row))
    const accent = def.quirk === 'flame' || def.quirk === 'halo' || def.quirk === 'horns'
    return {
      chest: runs(body.slice(5), palette, 10),
      hat: runs(def.head, palette, 0, accent ? (x, y, ch) => ch === 'c' : undefined),
      accent: accent ? runs(def.head.map((r) => r.replace(/[^c]/g, '.')), palette, 0) : null,
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
      data-quirk={def.quirk}
      data-reduced={reduced ? '' : undefined}
      data-blink-only={blinkOnly ? '' : undefined}
      style={style}
      role="img"
      aria-label={id}
    >
      <g>{layers.chest}</g>
      <g key={reactKey} className="v-rig__beat" data-react={react && !reduced ? react : undefined}>
        <g className="v-rig__nod">
          <g className="v-rig__head">
            <g>{layers.face}</g>
            <g className="v-rig__mouth-closed">{layers.mouthClosed}</g>
            <g className="v-rig__mouth-open">{layers.mouthOpen}</g>
            <g className="v-rig__eyes">{layers.eyes}</g>
            <g className="v-rig__lids">{layers.lids}</g>
            <g className="v-rig__hat">{layers.hat}</g>
            {layers.accent && <g className="v-rig__accent">{layers.accent}</g>}
          </g>
        </g>
      </g>
    </svg>
  )
}

/** One keeper by id; the Conclave is six of them side by side, as in the sprite. */
function KeeperRig({ id = 'brasa', size, scale = 8, native = 14, ...rest }) {
  if (id === 'conclave') {
    const small = Math.round((size ?? native * scale) * 0.55)
    return (
      <span className="inline-flex items-end" style={{ gap: 2 }}>
        {CONCLAVE_IDS.map((k) => (
          <Rig key={k} id={k} size={small} {...rest} />
        ))}
      </span>
    )
  }
  return <Rig id={id} size={size} scale={scale} native={native} {...rest} />
}

export default memo(KeeperRig)
