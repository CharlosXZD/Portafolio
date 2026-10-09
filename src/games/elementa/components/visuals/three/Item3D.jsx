import { memo, useEffect, useRef, useState } from 'react'
import { RARITY_GLOW } from '../../../data/relics.js'
import { ELEMENTS } from '../../../data/elements.js'
import { dieColors } from '../../DieToken.jsx'
import ElementFx from '../../ElementFx.jsx'
import PixelIcon from '../../PixelIcon.jsx'
import PixelSprite from '../../PixelSprite.jsx'
import { useVisualEnv } from '../VisualEnv.jsx'
import { FRAMES, NATIVE, getAtlas } from './itemAtlas.js'
import { subscribeTicker } from './ticker.js'

const IDLE_FPS = 6 // frames per second of the idle turn: 16 frames, about 2.7 seconds per revolution
const REST_FRAME = 3 // the resting three-quarter view

/**
 * A relic, consumable or die rendered as a cached low-resolution 3D object
 * (see itemAtlas.js). Idle turn, rarity halo, and a hover tilt that follows
 * the pointer. Reduced motion keeps the resting frame still; the 'low'
 * quality tier (or a browser without WebGL) shows the shipping sprite.
 * `scale` is the whole-number pixel size of one art pixel.
 *
 * Design rules (VISUALS.md section 0b): an item with an `elementId` takes
 * that element's own color (never a made-up one). A die (`shape="die"`)
 * keeps what every die in the game has: its body color derived from the
 * element exactly like DieSprite (`dieColors`), the element's own particle
 * effect (`ElementFx`, behind and in front, off under Reduced motion), and
 * the element's mark in the middle where there is no face to show.
 */
function Item3D({ shape, elementId, color: colorProp, rarity = 'common', scale = 4, fallbackSprite, float = false, className = '', onAtlas }) {
  const { reduced, quality } = useVisualEnv()
  const [atlas, setAtlas] = useState(null)
  const [failed, setFailed] = useState(false)
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const hoverRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const isDie = shape === 'die'
  const def = elementId ? ELEMENTS[elementId] : null
  // A die's body is the element color darkened toward the night palette, like its sprite.
  const color = colorProp ?? (isDie && def ? dieColors(elementId).top : (def?.color ?? '#9ca3af'))
  const glow = RARITY_GLOW[rarity] || RARITY_GLOW.common
  const size = NATIVE * scale
  const useFallback = quality === 'low' || failed

  useEffect(() => {
    if (useFallback) return
    let live = true
    getAtlas({ shape, color, rarity }).then((a) => {
      if (!live) return
      if (!a) return setFailed(true)
      setAtlas(a)
      onAtlas?.({ shape, ms: a.ms })
    })
    return () => {
      live = false
    }
  }, [shape, color, rarity, useFallback, onAtlas])

  // Draw the right frame: the idle turn, or the pointer's angle while hovered.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!atlas || !canvas) return
    const ctx = canvas.getContext('2d')
    let shown = -1
    const draw = (frame) => {
      if (frame === shown) return
      shown = frame
      ctx.clearRect(0, 0, NATIVE, NATIVE)
      ctx.drawImage(atlas.canvas, frame * NATIVE, 0, NATIVE, NATIVE, 0, 0, NATIVE, NATIVE)
    }
    draw(REST_FRAME)
    if (reduced) return
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    if (rootRef.current) io.observe(rootRef.current)
    const stop = subscribeTicker((now) => {
      if (!visible || document.hidden) return
      const hover = hoverRef.current
      if (hover != null) draw(Math.round(hover * (FRAMES - 1)))
      else draw(Math.floor((now / 1000) * IDLE_FPS) % FRAMES)
    })
    return () => {
      stop()
      io.disconnect()
    }
  }, [atlas, reduced])

  function onMove(e) {
    // Hover is a mouse thing: a finger dragging across the screen should not tilt items.
    if (reduced || e.pointerType !== 'mouse') return
    const r = rootRef.current.getBoundingClientRect()
    const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    hoverRef.current = fx
    setTilt({ x: (0.5 - fy) * 16, y: (fx - 0.5) * 16 })
  }
  function onLeave() {
    hoverRef.current = null
    setTilt({ x: 0, y: 0 })
  }

  return (
    <span
      ref={rootRef}
      className={`v-item3d ${float && !reduced ? 'v-item3d--float' : ''} ${className}`}
      data-rarity={rarity}
      data-shape={shape}
      style={{ width: size, height: size, '--glow': glow }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {isDie && def && !reduced && quality !== 'low' && <ElementFx elementId={elementId} size={size} behind lite={size < 56} />}
      {rarity !== 'common' && !isDie && <span className="v-item3d__halo" data-still={reduced ? '' : undefined} />}
      <span className="v-item3d__tilt" style={{ transform: `perspective(${size * 2}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
        {useFallback ? (
          fallbackSprite && <PixelSprite {...fallbackSprite} size={12 * Math.max(1, Math.round((size * 0.85) / 12))} />
        ) : (
          <canvas ref={canvasRef} width={NATIVE} height={NATIVE} style={{ width: size, height: size, imageRendering: 'pixelated', opacity: atlas ? 1 : 0 }} />
        )}
      </span>
      {isDie && def && !reduced && quality !== 'low' && <ElementFx elementId={elementId} size={size} lite={size < 56} />}
      {isDie && def && (
        <span className="v-item3d__mark" style={{ filter: 'drop-shadow(1px 1px 0 var(--ink))' }}>
          <PixelIcon name={elementId} size={7 * Math.max(1, Math.round((size * 0.34) / 7))} color="#fffaf0" hi={def.color} />
        </span>
      )}
    </span>
  )
}

export default memo(Item3D)
