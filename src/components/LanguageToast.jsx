import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const VISIBLE_MS = 9000

/** Shown once after the site switched itself to Spanish, with a one-click way back. */
function LanguageToast() {
  const { t, setLang, autoSwitched, dismissAutoSwitch } = useLanguage()

  useEffect(() => {
    if (!autoSwitched) return undefined
    const timer = setTimeout(dismissAutoSwitch, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [autoSwitched, dismissAutoSwitch])

  return (
    <AnimatePresence>
      {autoSwitched && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-xl shadow-neutral-900/20 sm:left-auto sm:right-6 sm:bottom-6 sm:mx-0 dark:bg-white dark:text-neutral-900"
        >
          <p className="flex-1 text-pretty">{t('langToast.message')}</p>
          <button
            type="button"
            onClick={() => setLang('en')}
            className="pressable shrink-0 rounded-full bg-white/15 px-3 py-1.5 font-medium transition-colors hover:bg-white/25 dark:bg-neutral-900/10 dark:hover:bg-neutral-900/20"
          >
            {t('langToast.switch')}
          </button>
          <button
            type="button"
            onClick={dismissAutoSwitch}
            aria-label={t('langToast.dismiss')}
            className="pressable -mr-1 shrink-0 rounded-full p-1.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LanguageToast
