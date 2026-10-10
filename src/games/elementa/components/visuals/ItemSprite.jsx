import { memo, useEffect, useRef, useState } from 'react'
import { RARITY_GLOW } from '../../data/relics.js'
import { findImageOverride, itemVisualId } from '../../data/visualRegistry.js'
import { useVisualEnv } from './VisualEnv.jsx'
import { itemBitmap, miniOf, silhouetteOf, W } from './sprites/index.js'
import './itemSprite.css'

/**
 * An item as a hand-authored 32 by 32 pixel sprite (VISUALS.md V2.5), drawn by a recipe
 * in sprites/recipes.js and shown at a whole-number scale. `mode` is 'color' (the
 * default), 'silhouette' (one dark tone, for the Gallery's unseen items and the
 * silhouette sheet) or 'mini' (16 by 16, for tiles under 38 px). The idle life is 2D: a
 * 2 px bob, sparkles on metals and gems, flickers on flames, a shimmer on liquids; hover
 * lifts it. Reduced motion and the low-end tier keep one still frame. The swap rule
 * (data/visualRegistry.js) still wins: a file named item.<id> replaces the sprite.
 */
function ItemSprite({ itemId, scale = 1, mode = 'color', motion = 'idle', reveal = false, rarity = 'common', fallback = null, className = '', index = 0 }) {
  const { reduced, quality } = useVisualEnv()
  const canvasRef = useRef(null)
  const bitmap = itemBitmap(itemId)
  const [override, setOverride] = useState({ id: null, src: null })
  const still = reduced || quality === 'low' || motion === 'still'
  const side = mode === 'mini' ? 16 : W
  const size = side * scale

  useEffect(() => {
    let live = true
    findImageOverride(itemVisualId(itemId)).then((src) => live && setOverride({ id: itemId, src }))
    return () => {
      live = false
    }
  }, [itemId])
  const src = override.id === itemId ? override.src : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!bitmap || !canvas) return
    const data = mode === 'silhouette' ? silhouetteOf(bitmap) : mode === 'mini' ? miniOf(bitmap) : bitmap.data
    canvas.getContext('2d').putImageData(new ImageData(data, side, side), 0, 0)
  }, [bitmap, mode, side, src])

  if (src) return <img src={src} alt="" className={`v-sprite ${className}`} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
  if (!bitmap) return fallback
  const glow = RARITY_GLOW[rarity] || RARITY_GLOW.common
  const strong = rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic'
  const fx = mode === 'color' && !still ? bitmap.fx : []
  return (
    <span className={`v-sprite ${className}`} data-still={still ? '' : undefined} data-motion={motion} style={{ width: size, height: size, '--glow': glow, '--u': `${scale}px`, '--i': index }}>
      {reveal && !reduced && rarity !== 'common' && <span className="v-sprite__ring" data-strong={strong ? '' : undefined} aria-hidden="true" />}
      <span className="v-sprite__bob">
        <canvas ref={canvasRef} width={side} height={side} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
        {fx.map((f, n) => {
          const k = mode === 'mini' ? 0.5 : 1
          return (
            <i
              key={n}
              className={`v-sprite__fx v-sprite__fx--${f.k}`}
              style={{ left: f.x * k * scale, top: f.y * k * scale, width: (f.w ?? 1) * k * scale, height: k * scale, background: f.c, '--d': `${((n * 1.3 + index * 0.7) % 5).toFixed(1)}s` }}
            />
          )
        })}
      </span>
    </span>
  )
}

export default memo(ItemSprite)
