import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

// Critically damped: settles without overshoot, since nothing was flung
const settle = { type: 'spring', bounce: 0, duration: 0.8 }

function ArrowDownIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 0 1 .75.75v10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function Hero() {
  const { t } = useLanguage()

  const rise = (delay) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...settle, delay },
  })

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Static glow: a slow looping pulse is a vestibular trigger and competes with the copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-brand-400/15 blur-3xl dark:bg-brand-500/15"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-16 sm:pt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6 lg:pb-24">
        <div>
          <motion.p {...rise(0)} className="text-eyebrow text-brand-600 dark:text-brand-400">
            {t('hero.eyebrow')}
          </motion.p>
          <motion.h1
            {...rise(0.06)}
            className="text-display mt-5 text-balance text-neutral-900 dark:text-white"
          >
            {t('hero.heading')}
          </motion.h1>
          <motion.p
            {...rise(0.12)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div {...rise(0.18)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="pressable inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {t('hero.ctaWork')}
              <ArrowDownIcon className="h-4 w-4" />
            </a>
            <a
              href="/Carlos_de_la_Pena_Resume.pdf"
              download
              className="pressable inline-flex items-center rounded-full px-5 py-3 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 transition-colors ring-inset hover:bg-neutral-50 dark:text-neutral-300 dark:ring-neutral-800 dark:hover:bg-neutral-900"
            >
              {t('hero.ctaResume')}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...settle, duration: 1, delay: 0.25 }}
          className="relative"
        >
          <Suspense fallback={<div className="h-72 w-full sm:h-96" />}>
            <Hero3D />
          </Suspense>
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
            {t('hero.dragHint')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
