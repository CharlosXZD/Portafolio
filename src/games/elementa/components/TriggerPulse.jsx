import { motion } from 'framer-motion'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'

/**
 * Wraps a relic or boon icon (EXPANSION.md P14): when its `pulse` count goes
 * up it bounces and glows (the number itself now flies out of the icon, see
 * CastStage.jsx, EXPANSION.md Q5). Reduced motion keeps just the glow.
 */
export default function TriggerPulse({ pulse, children, ...dataAttrs }) {
  const { reducedMotion } = useGameSettings()
  const n = pulse?.n ?? 0
  const isBase = pulse?.section === 'base'
  const color = isBase ? '#6fa8ff' : '#ff8a7a'
  return (
    <motion.div
      key={n}
      className="relative"
      {...dataAttrs}
      initial={n ? { scale: reducedMotion ? 1 : 0.8, filter: `drop-shadow(0 0 10px ${color})` } : false}
      animate={{
        scale: 1,
        y: n && !reducedMotion ? [0, -6, 0] : 0,
        filter: `drop-shadow(0 0 0px ${color}00)`,
      }}
      transition={{ type: 'spring', bounce: 0.6, duration: 0.45, filter: { duration: 0.7 } }}
    >
      {children}
    </motion.div>
  )
}
