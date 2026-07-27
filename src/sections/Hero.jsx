import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

function Hero() {
  const { t } = useLanguage()

  return (
    <section
      id="hero"
      className="relative flex min-h-[85vh] flex-col items-center justify-center gap-2 overflow-hidden bg-white px-6 py-16 text-center dark:bg-neutral-950"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/20"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        {t('hero.heading')}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-xl text-neutral-600 dark:text-neutral-400"
      >
        {t('hero.subtitle')}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative mx-auto mt-4 w-full max-w-2xl"
      >
        <Suspense fallback={<div className="h-72 w-full sm:h-96" />}>
          <Hero3D />
        </Suspense>
        <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
          {t('hero.dragHint')}
        </p>
      </motion.div>
    </section>
  )
}

export default Hero
