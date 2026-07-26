import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { projects, comingSoonProjects } from '../data/projects.js'

function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
      </Reveal>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.08}>
            <Link
              to={`/projects/${project.slug}`}
              className="group flex h-full flex-col rounded-xl border border-neutral-200 p-6 transition-colors hover:border-brand-300 dark:border-neutral-800 dark:hover:border-brand-700"
            >
              <h3 className="font-medium tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {project.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {project.tagline}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              {project.stats && (
                <ul className="mt-6 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  {project.stats.map((stat) => (
                    <li key={stat.label}>
                      <p className="text-lg font-semibold tracking-tight text-brand-600 dark:text-brand-400">
                        {stat.value}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {stat.label}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          </Reveal>
        ))}
        {comingSoonProjects.map((project, i) => (
          <Reveal key={project.title} delay={(projects.length + i) * 0.08}>
            <div className="flex h-full flex-col rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-400 dark:border-neutral-700 dark:text-neutral-600">
              <h3 className="font-medium tracking-tight">{project.title}</h3>
              <p className="mt-2 text-sm">{project.tagline}</p>
              <span className="mt-4 inline-block w-fit text-xs uppercase tracking-wide">
                Coming soon
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Projects
