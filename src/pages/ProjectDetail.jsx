import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import FeatureSection from '../components/FeatureSection.jsx'
import PhoneMockup from '../components/PhoneMockup.jsx'
import BrowserMockup from '../components/BrowserMockup.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { projects } from '../data/projects.js'
import NotFound from './NotFound.jsx'

const Robot3D = lazy(() => import('../components/Robot3D.jsx'))

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

function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  const { t, pick } = useLanguage()

  if (!project) {
    return <NotFound />
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <Link to="/#projects" className="text-sm text-neutral-500 hover:underline">
          {t('projectDetail.back')}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {pick(project.role)} · {pick(project.period)}
        </p>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">{pick(project.tagline)}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tech}
            </li>
          ))}
        </ul>

        {project.apkUrl && (
          <div className="mt-6">
            <motion.a
              href={project.apkUrl}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-500"
            >
              <DownloadIcon className="h-4 w-4" />
              {t('projectDetail.downloadApk')}
            </motion.a>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-600">
              {t('projectDetail.downloadApkCaption')}
            </p>
          </div>
        )}
      </Reveal>

      {project.screens && (
        <Reveal delay={0.1} className="mt-12">
          {project.screenType === 'browser' ? (
            <BrowserMockup screens={project.screens} />
          ) : (
            <PhoneMockup screens={project.screens} />
          )}
          <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-600">
            {t('projectDetail.liveCaption')}
          </p>
        </Reveal>
      )}

      {project.model3d && (
        <Reveal delay={0.1}>
          <Suspense fallback={<div className="h-80 w-full sm:h-[26rem]" />}>
            <Robot3D url={project.model3d} />
          </Suspense>
          <p className="-mt-2 text-center text-xs text-neutral-400 dark:text-neutral-600">
            {t('projectDetail.robotCaption')}
          </p>
        </Reveal>
      )}

      {project.features && (
        <div className="mt-16 space-y-16 sm:space-y-24">
          {project.features.map((feature, i) => (
            <Reveal key={feature.image ?? pick(feature.headline)} delay={0.1 + i * 0.05}>
              <FeatureSection
                eyebrow={feature.eyebrow}
                headline={feature.headline}
                body={feature.body}
                image={feature.image}
                reverse={i % 2 === 1}
              />
            </Reveal>
          ))}
        </div>
      )}

      {project.securityNotes && (
        <Reveal delay={0.15}>
          <div className="mt-16 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-brand-400">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 6V5a2 2 0 1 0-4 0v2h4Z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-wider">
                {t('projectDetail.securityNotes')}
              </h2>
            </div>
            <ul className="mt-5 space-y-3">
              {pick(project.securityNotes).map((note) => (
                <li key={note} className="flex gap-3 text-sm text-neutral-300">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {project.stats && (
        <Reveal delay={0.15}>
          <ul className="mt-10 grid grid-cols-3 gap-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            {project.stats.map((stat, i) => (
              <li key={stat.value + i} className="text-center">
                <p className="text-2xl font-semibold tracking-tight text-brand-600 dark:text-brand-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                  {pick(stat.label)}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {project.highlights && (
        <Reveal delay={0.2}>
          <h2 className="mt-10 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {t('projectDetail.whatsImpressive')}
          </h2>
          <ul className="mt-4 space-y-3">
            {pick(project.highlights).map((highlight) => (
              <li
                key={highlight}
                className="rounded-lg border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-neutral-700 dark:border-brand-900 dark:bg-brand-950/40 dark:text-neutral-300"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <Reveal delay={0.25}>
        <h2 className="mt-10 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {t('projectDetail.whatIDid')}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          {pick(project.bullets).map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {t('projectDetail.viewCode')}
          </a>
        )}
      </Reveal>
    </section>
  )
}

export default ProjectDetail
