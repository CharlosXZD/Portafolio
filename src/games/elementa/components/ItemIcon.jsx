import { motion } from 'framer-motion'
import { RARITY_GLOW } from '../data/relics.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { juicyHover, juicyTap } from '../utils/motionPresets.js'
import PixelIcon from './PixelIcon.jsx'
import PixelSprite from './PixelSprite.jsx'

/**
 * The visual stand-in for a relic/consumable/die "item": a pixel tile with
 * an ink outline, a rarity-colored inner frame, and a placeholder mark (a
 * pixel element icon when there is one, otherwise a letter) until real
 * hand-drawn art exists. Pass `iconSrc` (a 32x32 sprite, see ASSETS.md) and
 * it renders that instead. Click to inspect (ItemInspector.jsx); `static`
 * renders a plain, non-interactive tile for read-only lists.
 */
export default function ItemIcon({
  glyph,
  icon,
  sprite,
  color = '#9ca3af',
  rarity = 'common',
  size = 56,
  iconSrc,
  armed = false,
  disabled = false,
  onClick,
  title,
  static: isStatic = false,
}) {
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

  const content = iconSrc ? (
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

  if (isStatic) {
    return (
      <span title={title} className="relative inline-flex shrink-0 items-center justify-center" style={style}>
        {content}
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
