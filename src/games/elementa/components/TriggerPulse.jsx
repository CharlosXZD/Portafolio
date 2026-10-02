import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'

const fmt = (n) => Math.round(n * 100) / 100

/**
 * Wraps a relic or boon icon (EXPANSION.md P14): when its `pulse` count goes
 * up it bounces, glows, and floats a "+N Base" or "x1.5 Mult" chip. Reduced
 * motion keeps just the glow.
 */
export default function TriggerPulse({ pulse, children, ...dataAttrs }) {
  const { t } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const n = pulse?.n ?? 0
  const isBase = pulse?.section === 'base'
  const color = isBase ? '#6fa8ff' : '#ff8a7a'
  const label = pulse
    ? `${pulse.op === 'mul' ? 'x' : '+'}${fmt(pulse.value)} ${t(isBase ? 'elementa.diceTray.base' : 'elementa.diceTray.mult')}`
    : ''
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
      <AnimatePresence>
        {n > 0 && (
          <motion.span
            key={`chip-${n}`}
            initial={{ opacity: 0, y: 2, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: reducedMotion ? -16 : -30, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.8 : 1.1, ease: 'easeOut', times: [0, 0.15, 0.7, 1] }}
            className="pixel-score pointer-events-none absolute -top-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap text-[9px]"
            style={{ color, textShadow: '2px 2px 0 var(--ink), -1px 0 0 var(--ink), 0 -1px 0 var(--ink)' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
