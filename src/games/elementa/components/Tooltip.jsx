import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/** Hover-only info panel. Wraps any element; shows `content` above it. */
export default function Tooltip({ content, children, className = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
            className="el-panel--dark el-panel pointer-events-none absolute bottom-full left-1/2 z-50 mb-6 w-56 -translate-x-1/2 p-3 text-left text-[15px] leading-snug text-[var(--text-dim)]"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
