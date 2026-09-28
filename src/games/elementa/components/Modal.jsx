import { motion } from 'framer-motion'

/**
 * Shared overlay for Pause and Options: a dimmed backdrop and one pixel
 * panel with a title bar. Clicking the backdrop closes it; clicks inside
 * the panel stop there so nested modals (Options over Pause) don't close
 * both at once.
 */
export default function Modal({ title, onClose, children, width = 'max-w-sm', closeLabel = 'Close' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07050c]/75 p-4"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`el-panel flex w-full ${width} flex-col`}
      >
        <div className="el-panel--wood flex items-center justify-between px-4 py-3">
          <h2 className="pixel-heading text-xs text-[var(--gold-hi)]">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="pixel-score text-xs text-[var(--gold-hi)] opacity-70 hover:opacity-100"
            >
              X
            </button>
          )}
        </div>
        <div className="flex max-h-[calc(100vh-9rem)] flex-col gap-5 overflow-y-auto p-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}
