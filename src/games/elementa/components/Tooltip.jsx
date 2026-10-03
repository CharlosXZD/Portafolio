import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useFloating } from './useFloating.js'

/** The panel itself, drawn in a portal on top of the game (see useFloating.js). */
function Panel({ content }) {
  const { markerRef, panelRef, pos, root } = useFloating('top', 24)
  return (
    <>
      <span ref={markerRef} className="hidden" aria-hidden="true" />
      {createPortal(
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 4, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
          className="el-panel--dark el-panel pointer-events-none w-56 p-3 text-left text-[15px] leading-snug text-[var(--text-dim)]"
          style={{
            position: 'absolute',
            left: pos?.left ?? 0,
            top: pos?.top ?? 0,
            zIndex: 90,
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          {content}
        </motion.div>,
        root,
      )}
    </>
  )
}

/** Hover-only info panel. Wraps any element; shows `content` above it. */
export default function Tooltip({ content, children, className = '', disabled = false }) {
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
      <AnimatePresence>{open && !disabled && <Panel content={content} />}</AnimatePresence>
    </span>
  )
}
