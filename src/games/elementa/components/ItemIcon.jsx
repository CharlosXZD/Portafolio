import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { RARITY_GLOW } from '../data/relics.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { juicyHover, juicyTap } from '../utils/motionPresets.js'
import PixelIcon from './PixelIcon.jsx'
import PixelSprite from './PixelSprite.jsx'

// The V2 item models (VISUALS.md): cached 3D renders of every relic and
// consumable, loaded on demand (three.js and the generators are not part of
// the first load) and built in idle time. Until one is ready, and whenever it
// cannot be shown (low-end device, no WebGL, a tile too small to read), the
// flat sprite below stays.
const ItemModel = lazy(() => import('./visuals/ItemModel.jsx'))

/**
 * The visual stand-in for a relic/consumable/die "item": a pixel tile with
 * an ink outline, a rarity-colored inner frame, and a placeholder mark (a
 * pixel element icon when there is one, otherwise a letter) until real
 * hand-drawn art exists. Pass `iconSrc` (a 32x32 sprite, see ASSETS.md) and
 * it renders that instead. With an `itemId` (a relic or consumable) the 3D
 * model replaces the sprite once it is built; `reveal` plays the buy pop in
 * the item's rarity glow, and `modelMotion` is 'turn' (the slow idle turn,
 * used on shop shelves), 'hover' (still until the pointer is over it, the
 * default for interactive tiles, so a sidebar of relics does not spin while
 * you read the score) or 'still'. Click to inspect (ItemInspector.jsx); `static`
 * renders a plain, non-interactive tile for read-only lists.
 */
export default function ItemIcon({
  glyph,
  icon,
  sprite,
  color: colorProp = '#9ca3af',
  rarity: rarityProp = 'common',
  size = 56,
  iconSrc,
  itemId,
  modelMotion,
  reveal = false,
  armed = false,
  disabled = false,
  onClick,
  title,
  static: isStatic = false,
  silhouette = false,
}) {
  // The Gallery's unseen items (VISUALS.md V3.5): the shape of the model or sprite in
  // one dark tone, on a neutral tile. No color, no rarity, no detail to spoil it.
  const color = silhouette ? '#6e6480' : colorProp
  const rarity = silhouette ? 'common' : rarityProp
  const glow = RARITY_GLOW[rarity] || RARITY_GLOW.common
  const { reducedMotion } = useGameSettings()
  const b = size >= 40 ? 3 : 2
  const shiny = rarity !== 'common'

  const style = {
    width: size,
    height: size,
    color,
    fontSize: Math.round(size * 0.36),
    background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 26%, #1d1829) 0 50%, color-mix(in srgb, ${color} 16%, #151022) 50% 100%)`,
    boxShadow: [
      `0 -${b}px 0 0 var(--ink)`,
      `0 ${b}px 0 0 var(--ink)`,
      `-${b}px 0 0 0 var(--ink)`,
      `${b}px 0 0 0 var(--ink)`,
      `inset 0 0 0 ${b - 1}px ${armed ? '#ffe8a3' : glow}`,
      `inset 0 ${b + 1}px 0 0 rgba(255,255,255,0.12)`,
    ].join(', '),
    filter: armed
      ? `drop-shadow(0 0 6px #ffd166)`
      : shiny
        ? `drop-shadow(0 0 ${size >= 40 ? 6 : 3}px ${glow}88)`
        : undefined,
  }

  const flat = iconSrc ? (
    <img src={iconSrc} alt="" className="h-full w-full object-contain p-1" />
  ) : sprite ? (
    // 12px sprite at the largest whole-number scale that fits the tile.
    <PixelSprite {...sprite} size={12 * Math.max(1, Math.floor((size * 0.72) / 12))} />
  ) : icon ? (
    <PixelIcon name={icon} size={7 * Math.max(1, Math.floor((size * 0.5) / 7))} color={color} hi="#fff4d6" />
  ) : (
    <span className="pixel-score select-none leading-none" style={{ textShadow: '2px 2px 0 var(--ink)' }}>
      {glyph}
    </span>
  )
  // One art pixel of the model is a whole number of screen pixels; tiles under 36 are too small for it.
  const modelScale = Math.floor((size - 2 * b - 4) / 24)
  const content =
    itemId && !iconSrc && modelScale >= 1 ? (
      <Suspense fallback={flat}>
        <ItemModel itemId={itemId} scale={modelScale} motion={modelMotion ?? (isStatic ? 'still' : 'hover')} reveal={reveal} rarity={rarity} fallback={flat} />
      </Suspense>
    ) : (
      flat
    )

  const shown =
    silhouette && (itemId || sprite || icon) ? (
      <span className="flex items-center justify-center" style={{ filter: 'brightness(0) invert(0.27)' }}>
        {content}
      </span>
    ) : (
      content
    )

  if (isStatic) {
    return (
      <span title={title} className="relative inline-flex shrink-0 items-center justify-center" style={style}>
        {shown}
      </span>
    )
  }

  return (
    <motion.button
      type="button"
      whileTap={disabled ? {} : juicyTap(reducedMotion)}
      whileHover={disabled ? {} : juicyHover(reducedMotion)}
      animate={{ scale: armed ? 1.08 : 1, y: armed && !reducedMotion ? [0, -3, 0] : 0 }}
      transition={
        armed ? { y: { repeat: Infinity, duration: 0.9 }, scale: { type: 'spring', bounce: 0.3 } } : { type: 'spring', bounce: 0.3, duration: 0.25 }
      }
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`relative flex shrink-0 items-center justify-center disabled:opacity-40 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={style}
    >
      {content}
    </motion.button>
  )
}
