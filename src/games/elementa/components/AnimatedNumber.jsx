import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts up/down to `value` with a spring instead of a linear tween. */
export default function AnimatedNumber({ value, className }) {
  const motionValue = useMotionValue(value)
  const spring = useSpring(
    motionValue,
    prefersReducedMotion ? { stiffness: 1000, damping: 200 } : { bounce: 0.2, duration: 0.7 },
  )
  const [display, setDisplay] = useState(Math.round(value))

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => setDisplay(Math.round(v)))
    return unsubscribe
  }, [spring])

  return <motion.span className={className}>{display}</motion.span>
}
