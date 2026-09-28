import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import BrandTile from '../components/BrandTile.jsx'
import GameCard from '../components/GameCard.jsx'
import { brandWash } from '../utils/brand.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { projects, comingSoonProjects } from '../data/projects.js'

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

function Cover({ project, featured }) {
  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ background: brandWash(project.brand.color) }}
    >
      <BrandTile
        project={project}
        className={`transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
          featured ? 'size-36 sm:size-44' : 'size-28'
        }`}
      />
    </div>
  )
}

function ProjectCard({ project, featured = false }) {
  const { t, pick } = useLanguage()

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={`pressable group grid h-full overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-neutral-200/70 transition-shadow hover:shadow-xl hover:shadow-neutral-900/5 dark:bg-neutral-900 dark:ring-neutral-800 ${
        featured ? 'lg:grid-cols-[1fr_1.35fr]' : 'grid-rows-[auto_1fr]'
      }`}
    >
      <div className={`flex flex-col p-7 sm:p-8 ${featured ? 'lg:order-none lg:justify-center lg:p-10' : ''}`}>
        <p className="text-eyebrow text-neutral-500 dark:text-neutral-400">
          {pick(project.role)} · {pick(project.period)}
        </p>
        <h3
          className={`mt-3 font-semibold text-neutral-900 dark:text-white ${
            featured ? 'text-3xl tracking-[-0.025em]' : 'text-xl tracking-[-0.015em]'
          }`}
        >
          {project.title}
        </h3>
        <p className="mt-2 text-pretty text-neutral-600 dark:text-neutral-400">
          {pick(project.tagline)}
        </p>
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
          {project.tech.join(' · ')}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
          {t('projects.viewCaseStudy')}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className={featured ? 'min-h-72' : 'order-first h-48'}>
        <Cover project={project} featured={featured} />
      </div>
    </Link>
  )
}

function Projects() {
  const { t, pick } = useLanguage()
  const [featured, ...rest] = projects.filter((p) => !p.hideFromGrid)

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeader eyebrow={t('projects.eyebrow')} heading={t('projects.heading')} />

      <Reveal className="mt-12">
        <ProjectCard project={featured} featured />
      </Reveal>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {rest.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-5">
        <GameCard />
      </Reveal>

      {comingSoonProjects.map((project) => (
        <Reveal key={project.title} className="mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-3xl px-7 py-5 ring-1 ring-neutral-200 ring-inset sm:px-8 dark:ring-neutral-800">
            <p className="text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-white">{project.title}</span>
              {'. '}
              {pick(project.tagline)}
            </p>
            <span className="text-eyebrow text-neutral-400 dark:text-neutral-500">
              {t('projects.comingSoon')}
            </span>
          </div>
        </Reveal>
      ))}
    </section>
  )
}

export default Projects
