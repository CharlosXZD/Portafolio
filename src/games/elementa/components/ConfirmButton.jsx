import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { juicyTap } from '../utils/motionPresets.js'

/**
 * A two-step "arm, then confirm" button for irreversible shop actions
 * (buy/sell/upgrade). First click arms it; a second click within `armMs`
 * confirms. Disarms automatically on timeout, or immediately if disabled.
 */
export default function ConfirmButton({
  onConfirm,
  disabled,
  className = '',
  armedClassName = '',
  confirmLabel = 'Confirm?',
  armMs = 3000,
  style,
  children,
}) {
  const [armed, setArmed] = useState(false)
  const timeoutRef = useRef(null)
  const { reducedMotion } = useGameSettings()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  useEffect(() => {
    if (disabled) setArmed(false)
  }, [disabled])

  function handleClick() {
    if (disabled) return
    if (!armed) {
      setArmed(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setArmed(false), armMs)
      return
    }
    clearTimeout(timeoutRef.current)
    setArmed(false)
    onConfirm()
  }

  return (
    <motion.button
      type="button"
      whileTap={disabled ? {} : juicyTap(reducedMotion)}
      onClick={handleClick}
      disabled={disabled}
      className={armed ? armedClassName || className : className}
      style={style}
    >
      {armed ? confirmLabel : children}
    </motion.button>
  )
}
