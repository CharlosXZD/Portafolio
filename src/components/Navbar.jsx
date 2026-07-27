import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const links = [
  { href: '/#about', key: 'nav.about' },
  { href: '/#projects', key: 'nav.projects' },
  { href: '/#resume', key: 'nav.resume' },
  { href: '/#contact', key: 'nav.contact' },
]

function LanguageToggle({ className }) {
  const { lang, toggleLang } = useLanguage()
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label="Toggle language"
      className={
        className ??
        'rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:text-brand-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-brand-400'
      }
    >
      {lang === 'en' ? 'ES' : 'EN'}
    </button>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-sm font-medium tracking-tight" onClick={() => setOpen(false)}>
          Carlos de la Peña
        </Link>
        <div className="hidden items-center gap-6 sm:flex">
          <ul className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {t(link.key)}
                </a>
              </li>
            ))}
          </ul>
          <LanguageToggle />
        </div>
        <div className="flex items-center gap-3 sm:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 5 : 0 }}
              className="h-px w-5 bg-neutral-700 dark:bg-neutral-300"
            />
            <motion.span
              animate={{ opacity: open ? 0 : 1 }}
              className="h-px w-5 bg-neutral-700 dark:bg-neutral-300"
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? -5 : 0 }}
              className="h-px w-5 bg-neutral-700 dark:bg-neutral-300"
            />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-neutral-200 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 sm:hidden"
          >
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-6 py-3 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {t(link.key)}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
