import { lazy, Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import BrandTile from '../components/BrandTile.jsx'
import FeatureSection from '../components/FeatureSection.jsx'
import PhoneMockup from '../components/PhoneMockup.jsx'
import BrowserMockup from '../components/BrowserMockup.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { projects } from '../data/projects.js'
import { brandWash } from '../utils/brand.js'
import NotFound from './NotFound.jsx'

const Robot3D = lazy(() => import('../components/Robot3D.jsx'))

const DEFAULT_TITLE = 'Carlos de la Peña · Portfolio'

// Critically damped: the page settles in without overshoot
const settle = { type: 'spring', bounce: 0, duration: 0.8 }

function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10 2a.75.75 0 0 1 .75.75v7.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V2.75A.75.75 0 0 1 10 2ZM4 13.25a.75.75 0 0 1 .75.75v1.5c0 .28.22.5.5.5h9.5a.5.5 0 0 0 .5-.5v-1.5a.75.75 0 0 1 1.5 0v1.5A2 2 0 0 1 14.75 17.5h-9.5A2 2 0 0 1 3.25 15.5v-1.5a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function PlayIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.3 3.2A1 1 0 0 0 4.8 4v12a1 1 0 0 0 1.5.86l10-6a1 1 0 0 0 0-1.72l-10-6Z" />
    </svg>
  )
}

function ArrowLeftIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.61l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L5.61 9.25h10.64A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.64l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10 1a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 6V5a2 2 0 1 0-4 0v2h4Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function SectionLabel({ children }) {
  return <h2 className="text-eyebrow text-neutral-500 dark:text-neutral-400">{children}</h2>
}

function Glance({ project }) {
  const { t, pick } = useLanguage()
  const rows = [
    [t('projectDetail.role'), pick(project.role)],
    [t('projectDetail.timeline'), pick(project.period)],
    [t('projectDetail.team'), pick(project.team)],
    [t('projectDetail.platform'), pick(project.platform)],
    [t('projectDetail.stack'), project.tech.join(', ')],
  ].filter(([, value]) => value)

  return (
    <div className="rounded-3xl bg-neutral-100 p-6 ring-1 ring-neutral-200/70 sm:p-7 dark:bg-neutral-900 dark:ring-neutral-800">
      <SectionLabel>{t('projectDetail.atAGlance')}</SectionLabel>
      <dl className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4 py-3 text-sm first:pt-0 last:pb-0">
            <dt className="w-24 shrink-0 text-neutral-500 dark:text-neutral-400">{label}</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ProjectDetail() {
  const { slug } = useParams()
  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index]
  const next = projects[(index + 1) % projects.length]
  const { t, pick } = useLanguage()

  useEffect(() => {
    if (!project) return
    document.title = `${project.title} · Carlos de la Peña`
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [project])

  if (!project) {
    return <NotFound />
  }

  const rise = (delay) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...settle, delay },
  })

  return (
    <article className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-14">
      <Link
        to="/#projects"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('projectDetail.back')}
      </Link>

      {/* Header: what it is, then the facts a reviewer scans for */}
      <header className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <motion.div {...rise(0)}>
            <BrandTile project={project} shadow={false} className="size-16" />
          </motion.div>
          <motion.p {...rise(0.05)} className="text-eyebrow mt-6 text-brand-600 dark:text-brand-400">
            {pick(project.role)}
          </motion.p>
          <motion.h1
            {...rise(0.1)}
            className="text-display mt-3 text-balance text-neutral-900 dark:text-white"
          >
            {project.title}
          </motion.h1>
          <motion.p
            {...rise(0.15)}
            className="mt-5 max-w-2xl text-xl leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400"
          >
            {pick(project.tagline)}
          </motion.p>

          {(project.apkUrl || project.repoUrl || project.playUrl) && (
            <motion.div {...rise(0.2)} className="mt-8 flex flex-wrap items-center gap-3">
              {project.playUrl && (
                <Link
                  to={project.playUrl}
                  className="pressable inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <PlayIcon className="h-4 w-4" />
                  {t('projectDetail.playNow')}
                </Link>
              )}
              {project.apkUrl && (
                <a
                  href={project.apkUrl}
                  className="pressable inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <DownloadIcon className="h-4 w-4" />
                  {t('projectDetail.downloadApk')}
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pressable inline-flex items-center rounded-full px-5 py-3 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200 transition-colors ring-inset hover:bg-neutral-50 dark:text-neutral-300 dark:ring-neutral-800 dark:hover:bg-neutral-900"
                >
                  {t('projectDetail.viewCode')}
                </a>
              )}
              {project.apkUrl && (
                <p className="basis-full text-xs text-neutral-400 dark:text-neutral-500">
                  {t('projectDetail.downloadApkCaption')}
                </p>
              )}
            </motion.div>
          )}
        </div>

        <motion.div {...rise(0.2)}>
          <Glance project={project} />
        </motion.div>
      </header>

      {/* Media: real screens, or the real CAD model */}
      {(project.screens || project.model3d) && (
        <Reveal className="mt-14">
          <div
            className="overflow-hidden rounded-3xl bg-neutral-100 px-6 py-10 ring-1 ring-neutral-200/70 sm:px-12 sm:py-14 dark:bg-neutral-900 dark:ring-neutral-800"
            style={{ backgroundImage: brandWash(project.brand.color) }}
          >
            {project.screens &&
              (project.screenType === 'browser' ? (
                <div className="mx-auto max-w-4xl">
                  <BrowserMockup screens={project.screens} url={project.browserUrl} />
                </div>
              ) : (
                <PhoneMockup screens={project.screens} />
              ))}
            {project.model3d && (
              <Suspense fallback={<div className="h-80 w-full sm:h-[26rem]" />}>
                <Robot3D url={project.model3d} />
              </Suspense>
            )}
            <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {project.model3d ? t('projectDetail.robotCaption') : t('projectDetail.liveCaption')}
            </p>
          </div>
        </Reveal>
      )}

      {project.stats && (
        <Reveal className="mt-16">
          <SectionLabel>{t('projectDetail.byTheNumbers')}</SectionLabel>
          <dl
            className={`mt-6 grid grid-cols-1 gap-x-6 gap-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-800 ${
              project.stats.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
            }`}
          >
            {project.stats.map((stat, i) => (
              <div key={stat.value + i} className="flex flex-col">
                <dt className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {pick(stat.label)}
                </dt>
                <dd className="order-first text-4xl font-semibold tracking-[-0.03em] text-neutral-900 tabular-nums dark:text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}

      {project.highlights && (
        <section className="mt-20">
          <Reveal>
            <SectionLabel>{t('projectDetail.whatsImpressive')}</SectionLabel>
          </Reveal>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {pick(project.highlights).map((highlight, i) => (
              <motion.li
                key={highlight}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ ...settle, duration: 0.7, delay: i * 0.06 }}
                className="flex h-full flex-col gap-4 rounded-3xl bg-neutral-100 p-6 ring-1 ring-neutral-200/70 dark:bg-neutral-900 dark:ring-neutral-800"
              >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: project.brand.color }}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </span>
                <p className="text-pretty text-neutral-800 dark:text-neutral-200">{highlight}</p>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      {project.features && (
        <section className="mt-24">
          <Reveal>
            <p className="text-eyebrow text-brand-600 dark:text-brand-400">
              {t('projectDetail.inside')}
            </p>
            <h2 className="text-title mt-3 max-w-2xl text-balance text-neutral-900 dark:text-white">
              {t('projectDetail.insideHeading')}
            </h2>
          </Reveal>
          <div className="mt-14 space-y-20 sm:space-y-28">
            {project.features.map((feature, i) => (
              <Reveal key={feature.image ?? pick(feature.headline)}>
                <FeatureSection
                  eyebrow={feature.eyebrow}
                  headline={feature.headline}
                  body={feature.body}
                  image={feature.image}
                  reverse={i % 2 === 1}
                  portrait={project.screenType === 'phone'}
                  color={project.brand.color}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* What I did, plus the engineering notes when there are any */}
      <section
        className={`mt-24 grid gap-10 ${project.securityNotes ? 'lg:grid-cols-2 lg:gap-14' : ''}`}
      >
        <Reveal>
          <SectionLabel>{t('projectDetail.whatIDid')}</SectionLabel>
          <ul className="mt-6 space-y-4">
            {pick(project.bullets).map((bullet) => (
              <li
                key={bullet}
                className="flex gap-3 text-pretty text-neutral-700 dark:text-neutral-300"
              >
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {bullet}
              </li>
            ))}
          </ul>
        </Reveal>

        {project.securityNotes && (
          <Reveal delay={0.08}>
            <div className="rounded-3xl bg-neutral-100 p-6 ring-1 ring-neutral-200/70 sm:p-8 dark:bg-neutral-900 dark:ring-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                <LockIcon className="h-4 w-4" />
                <SectionLabel>{t('projectDetail.securityNotes')}</SectionLabel>
              </div>
              <ul className="mt-5 space-y-4">
                {pick(project.securityNotes).map((note) => (
                  <li
                    key={note}
                    className="text-sm leading-relaxed text-pretty text-neutral-700 dark:text-neutral-300"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </section>

      {/* Close the loop: an invitation to talk, then somewhere to go next */}
      <Reveal className="mt-24">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col justify-between gap-8 rounded-3xl bg-neutral-900 p-8 text-white sm:p-10 dark:bg-neutral-100 dark:text-neutral-900">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl">
                {t('projectDetail.ctaHeading')}
              </h2>
              <p className="mt-3 max-w-md text-pretty text-neutral-300 dark:text-neutral-600">
                {t('projectDetail.ctaBody')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/#contact"
                className="pressable inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-700"
              >
                {t('projectDetail.ctaContact')}
              </Link>
              <a
                href="/Carlos_de_la_Pena_Resume.pdf"
                download
                className="pressable inline-flex items-center rounded-full px-5 py-3 text-sm font-medium ring-1 ring-white/25 transition-colors ring-inset hover:bg-white/10 dark:ring-neutral-900/20 dark:hover:bg-neutral-900/5"
              >
                {t('hero.ctaResume')}
              </a>
            </div>
          </div>

          <Link
            to={`/projects/${next.slug}`}
            className="pressable group flex items-center gap-5 rounded-3xl bg-neutral-100 p-8 ring-1 ring-neutral-200/70 transition-shadow hover:shadow-xl hover:shadow-neutral-900/5 dark:bg-neutral-900 dark:ring-neutral-800"
          >
            <BrandTile
              project={next}
              shadow={false}
              className="size-16 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-eyebrow text-neutral-500 dark:text-neutral-400">
                {t('projectDetail.nextProject')}
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.015em] text-neutral-900 dark:text-white">
                {next.title}
              </p>
            </div>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ease-out group-hover:translate-x-1 dark:text-neutral-500" />
          </Link>
        </div>
      </Reveal>
    </article>
  )
}

export default ProjectDetail
