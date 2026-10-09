import { memo, useEffect, useRef, useState } from 'react'
import { RARITY_GLOW } from '../../data/relics.js'
import { useVisualEnv } from './VisualEnv.jsx'
import { FRAMES, NATIVE, getModelAtlas } from './three/itemAtlas.js'
import { subscribeTicker } from './three/ticker.js'
import './itemModel.css'

const IDLE_FPS = 6 // 16 frames, about 2.7 seconds a turn
const REST_FRAME = 0 // the resting three-quarter view (the atlas is built turned a little, see itemAtlas)

/**
 * A relic or consumable as a cached 24 by 24, 16 frame 3D model (VISUALS.md V2).
 * Shows `fallback` (the old sprite) until the atlas is built in idle time,
 * then fades the model in; with no WebGL, on the low-end tier, or for an id
 * without a model, the fallback simply stays. `motion` is 'turn' (the slow
 * idle turn, a hover that steers the angle and tilts), 'hover' (still until
 * hovered) or 'still' (the resting frame). Reduced motion always shows the
 * resting frame. `reveal` plays a rarity-based pop when it turns true.
 * `scale` is the whole-number size of one art pixel.
 */
function ItemModel({ itemId, scale = 1, motion = 'still', reveal = false, rarity = 'common', fallback = null, priority = 1, className = '', onReady }) {
  const { reduced, quality } = useVisualEnv()
  const [atlas, setAtlas] = useState(null)
  const [failed, setFailed] = useState(false)
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const hoverRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const size = NATIVE * scale
  const off = quality === 'low' || failed

  useEffect(() => {
    if (off) return
    let live = true
    getModelAtlas(itemId, priority).then((a) => {
      if (!live) return
      if (!a) return setFailed(true)
      setAtlas(a)
      onReady?.(a)
    })
    return () => {
      live = false
    }
  }, [itemId, off, priority, onReady])

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
    if (reduced || motion === 'still') return
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    if (rootRef.current) io.observe(rootRef.current)
    const stop = subscribeTicker((now) => {
      if (!visible || document.hidden) return
      const hover = hoverRef.current
      if (hover != null) draw(Math.round(hover * (FRAMES - 1)))
      else if (motion === 'turn') draw(Math.floor((now / 1000) * IDLE_FPS) % FRAMES)
    })
    return () => {
      stop()
      io.disconnect()
    }
  }, [atlas, reduced, motion])

  function onMove(e) {
    // Hover is a mouse thing: a finger dragging across the screen should not tilt items.
    if (reduced || motion === 'still' || e.pointerType !== 'mouse') return
    const r = rootRef.current.getBoundingClientRect()
    const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    hoverRef.current = fx
    setTilt({ x: (0.5 - fy) * 14, y: (fx - 0.5) * 14 })
  }
  function onLeave() {
    hoverRef.current = null
    setTilt({ x: 0, y: 0 })
  }

  if (!atlas) return fallback
  const glow = RARITY_GLOW[rarity] || RARITY_GLOW.common
  const strong = rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic'
  return (
    <span
      ref={rootRef}
      className={`v-model ${className}`}
      data-rarity={rarity}
      style={{ width: size, height: size, '--glow': glow }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {reveal && !reduced && rarity !== 'common' && (
        <span className="v-model__ring" data-strong={strong ? '' : undefined} aria-hidden="true" />
      )}
      <span
        className="v-model__tilt"
        data-reveal={reveal && !reduced ? '' : undefined}
        style={{ transform: `perspective(${size * 2}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <canvas ref={canvasRef} width={NATIVE} height={NATIVE} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
      </span>
    </span>
  )
}

export default memo(ItemModel)
