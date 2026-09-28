import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { education, experience, sideProjects, additional } from '../data/resume.js'

function GraduationCapIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10 1.5 1 6l9 4.5L18.5 6.7v5.55a.75.75 0 0 0 1.5 0V6a.75.75 0 0 0-.41-.67L10.34 1.58a.75.75 0 0 0-.68 0L10 1.5Z" />
      <path d="M4.5 9.7v3.55c0 .3.14.58.4.75C6.02 15 7.9 16 10 16s3.98-1 5.1-1.99a.9.9 0 0 0 .4-.76V9.7L10 13.34a.75.75 0 0 1-.69 0L4.5 9.7Z" />
    </svg>
  )
}

function BriefcaseIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4Zm2-.5a.5.5 0 0 0-.5.5v1h5V4a.5.5 0 0 0-.5-.5H8ZM4 7v2.4c1.7.86 3.72 1.35 6 1.35s4.3-.49 6-1.35V7H4Zm12 4.13c-1.76.75-3.8 1.17-6 1.17s-4.24-.42-6-1.17V14a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-2.87Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

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

function Resume() {
  const { t, pick } = useLanguage()

  return (
    <section id="resume" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeader eyebrow={t('resume.eyebrow')} heading={t('resume.heading')}>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="max-w-md text-neutral-600 dark:text-neutral-400">{t('resume.blurb')}</p>
          <a
            href="/Carlos_de_la_Pena_Resume.pdf"
            download
            className="pressable inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <DownloadIcon className="h-4 w-4" />
            {t('resume.download')}
          </a>
        </div>
      </SectionHeader>

      <div className="max-w-3xl">

      {/* Education */}
      <Reveal delay={0.08} className="mt-12">
        <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <GraduationCapIcon className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t('resume.education')}
            </span>
          </div>
          <h3 className="mt-3 font-medium tracking-tight">{pick(education.school)}</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {pick(education.degree)}
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
            {pick(education.period)} · {pick(education.meta)}
          </p>
          <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-600">
            {pick(education.coursework)}
          </p>
        </div>
      </Reveal>

      {/* Experience timeline */}
      <div className="mt-12">
        <Reveal>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <BriefcaseIcon className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t('resume.experience')}
            </span>
          </div>
        </Reveal>

        <div className="relative mt-6 space-y-8 border-l border-neutral-200 pl-6 dark:border-neutral-800">
          {experience.map((job, i) => (
            <Reveal key={job.org} delay={0.06 + i * 0.08}>
              <div className="relative">
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.1 + i * 0.08 }}
                  className="absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500 dark:border-neutral-950"
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="font-medium tracking-tight">
                    {job.link ? (
                      <Link to={job.link} className="hover:text-brand-600 dark:hover:text-brand-400">
                        {job.org}
                      </Link>
                    ) : (
                      job.org
                    )}
                  </h4>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {pick(job.period)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {pick(job.role)} · {pick(job.location)}
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {pick(job.bullets).map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Side projects */}
      <Reveal delay={0.1} className="mt-12">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
          {t('resume.sideProjects')}
        </span>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {sideProjects.map((project) => (
            <Link
              key={pick(project.title)}
              to={project.link}
              className="group rounded-xl border border-neutral-200 p-4 transition-colors hover:border-brand-300 dark:border-neutral-800 dark:hover:border-brand-700"
            >
              <p className="font-medium tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {pick(project.title)}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                {pick(project.role)} · {pick(project.period)}
              </p>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.12} className="mt-10">
        <p className="text-xs text-neutral-400 dark:text-neutral-600">{pick(additional)}</p>
      </Reveal>
      </div>
    </section>
  )
}

export default Resume
