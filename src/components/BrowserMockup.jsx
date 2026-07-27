import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function BrowserMockup({ screens, url = 'tigerprice.app' }) {
  const list = Array.isArray(screens) ? screens : [screens]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (list.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 3800)
    return () => clearInterval(id)
  }, [list.length])

  return (
    <div className="flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-xl shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/40">
        <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1 text-xs text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M6 1a2.5 2.5 0 0 0-2.5 2.5V4H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-.5v-.5A2.5 2.5 0 0 0 6 1Zm1.5 3h-3v-.5a1.5 1.5 0 0 1 3 0V4Z" />
              </svg>
              {url}
            </div>
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full bg-white dark:bg-neutral-950">
          <AnimatePresence mode="sync">
            <motion.img
              key={list[index]}
              src={list[index]}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </AnimatePresence>
        </div>
      </div>

      {list.length > 1 && (
        <div className="mt-5 flex gap-1.5">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Screen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-brand-500' : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowserMockup
