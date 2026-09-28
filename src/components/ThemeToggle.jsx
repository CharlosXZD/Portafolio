import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function SunIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.66 4.34a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM6.46 13.54a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.6 13.54a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM4.34 4.34a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06L4.34 5.4a.75.75 0 0 1 0-1.06Z" />
    </svg>
  )
}

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M7.46 2.3a.75.75 0 0 1 .1.83 6 6 0 0 0 8.3 8.3.75.75 0 0 1 1.04.93A7.5 7.5 0 1 1 6.63 2.2a.75.75 0 0 1 .83.1Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const systemQuery = '(prefers-color-scheme: dark)'

function readTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)

  // The attribute on <html> is the source of truth, so every toggle instance stays in sync
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()))
    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Until someone picks a theme, keep following the OS setting live
  useEffect(() => {
    const media = window.matchMedia(systemQuery)
    const onChange = (e) => {
      let saved = null
      try {
        saved = localStorage.getItem('theme')
      } catch {
        // storage blocked: just follow the OS
      }
      if (!saved) document.documentElement.dataset.theme = e.matches ? 'dark' : 'light'
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage blocked: the choice still applies for this visit
    }
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="pressable relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full text-neutral-500 ring-1 ring-neutral-200 transition-colors ring-inset hover:text-neutral-900 dark:text-neutral-400 dark:ring-neutral-800 dark:hover:text-white"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          className="flex"
        >
          {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-3.5 w-3.5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
