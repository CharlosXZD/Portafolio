import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { projects } from '../data/projects.js'
import NotFound from './NotFound.jsx'

const Phone3D = lazy(() => import('../components/Phone3D.jsx'))
const Robot3D = lazy(() => import('../components/Robot3D.jsx'))

function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return <NotFound />
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <Link to="/#projects" className="text-sm text-neutral-500 hover:underline">
          &larr; Back to projects
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {project.role} · {project.period}
        </p>
        <p className="mt-6 text-neutral-600 dark:text-neutral-400">{project.tagline}</p>

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
      </Reveal>

      {project.mockScreen && (
        <Reveal delay={0.1}>
          <Suspense fallback={<div className="h-80 w-full sm:h-[26rem]" />}>
            <Phone3D screen={project.mockScreen} />
          </Suspense>
          <p className="-mt-2 text-center text-xs text-neutral-400 dark:text-neutral-600">
            Mock screen preview — real screenshots coming soon
          </p>
        </Reveal>
      )}

      {project.model3d && (
        <Reveal delay={0.1}>
          <Suspense fallback={<div className="h-80 w-full sm:h-[26rem]" />}>
            <Robot3D url={project.model3d} />
          </Suspense>
          <p className="-mt-2 text-center text-xs text-neutral-400 dark:text-neutral-600">
            Actual CAD model — drag to rotate, scroll to zoom
          </p>
        </Reveal>
      )}

      {project.stats && (
        <Reveal delay={0.15}>
          <ul className="mt-10 grid grid-cols-3 gap-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
            {project.stats.map((stat) => (
              <li key={stat.label} className="text-center">
                <p className="text-2xl font-semibold tracking-tight text-brand-600 dark:text-brand-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{stat.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {project.highlights && (
        <Reveal delay={0.2}>
          <h2 className="mt-10 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            What&apos;s impressive here
          </h2>
          <ul className="mt-4 space-y-3">
            {project.highlights.map((highlight) => (
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
          What I did
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          {project.bullets.map((bullet) => (
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
            View code on GitHub &rarr;
          </a>
        )}
      </Reveal>
    </section>
  )
}

export default ProjectDetail
