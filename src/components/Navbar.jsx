import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { href: '/#projects', key: 'nav.projects' },
  { href: '/#about', key: 'nav.about' },
  { href: '/#resume', key: 'nav.resume' },
  { href: '/#contact', key: 'nav.contact' },
  { href: '/games/elementa', key: 'nav.play' },
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
        'pressable rounded-full px-2.5 py-1 text-xs font-medium text-neutral-500 ring-1 ring-neutral-200 transition-colors ring-inset hover:text-neutral-900 dark:text-neutral-400 dark:ring-neutral-800 dark:hover:text-white'
      }
    >
      {lang === 'en' ? 'ES' : 'EN'}
    </button>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useLanguage()

  // The divider is a scroll-edge effect: it only exists once content is actually underneath
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/70 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 dark:bg-neutral-950/70 ${
        scrolled || open
          ? 'border-neutral-200/80 dark:border-neutral-800/80'
          : 'border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link
          to="/"
          className="text-sm font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white"
          onClick={() => setOpen(false)}
        >
          Carlos de la Peña
        </Link>
        <div className="hidden items-center gap-6 sm:flex">
          <ul className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition-colors hover:text-neutral-900 dark:hover:text-white"
                >
                  {t(link.key)}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageToggle />
          <ThemeToggle />
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
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="overflow-hidden border-t border-neutral-200/80 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 sm:hidden"
          >
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-6 py-3 transition-colors hover:text-neutral-900 dark:hover:text-white"
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
