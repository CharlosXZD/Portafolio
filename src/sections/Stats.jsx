import Reveal from '../components/Reveal.jsx'
import { stats } from '../data/projects.js'

function Stats() {
  return (
    <section className="border-y border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} y={16} className="text-center">
            <p className="text-3xl font-semibold tracking-tight text-brand-600 dark:text-brand-400 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Stats
