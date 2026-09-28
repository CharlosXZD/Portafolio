import Reveal from '../components/Reveal.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { stats } from '../data/projects.js'

function Stats() {
  const { pick } = useLanguage()

  return (
    <section className="mx-auto max-w-6xl px-6">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-neutral-200 py-10 sm:grid-cols-4 dark:border-neutral-800">
        {stats.map((stat, i) => (
          <Reveal key={stat.value + i} delay={i * 0.05} y={12} className="flex flex-col">
            <dt className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{pick(stat.label)}</dt>
            <dd className="order-first text-3xl font-semibold tracking-[-0.03em] text-neutral-900 tabular-nums dark:text-white">
              {stat.value}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}

export default Stats
