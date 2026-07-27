import Reveal from '../components/Reveal.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function About() {
  const { t } = useLanguage()

  const skills = [
    {
      label: t('about.skills.languagesFrameworks'),
      items: ['JavaScript', 'React', 'Vite', 'CSS', 'HTML', 'Dart (Flutter)', 'C++ (Arduino)'],
    },
    {
      label: t('about.skills.toolsPlatforms'),
      items: ['Firebase', 'Stripe', 'Git/GitHub', 'Arduino IDE', 'CAD (3D Modeling)'],
    },
    {
      label: t('about.skills.hardwareSystems'),
      items: [
        t('about.skills.pcRepair'),
        t('about.skills.windowsOs'),
        t('about.skills.embeddedSystems'),
      ],
    },
    {
      label: t('about.skills.spokenLanguages'),
      items: [t('about.skills.spanish'), t('about.skills.english'), t('about.skills.french')],
    },
  ]

  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">{t('about.heading')}</h2>
        <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">{t('about.bio')}</p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex gap-1.5">
            <dt className="text-neutral-400 dark:text-neutral-500">{t('about.email')}:</dt>
            <dd>
              <a
                href="mailto:carlosalbertodelapenagonzalez@gmail.com"
                className="hover:text-brand-600 dark:hover:text-brand-400"
              >
                carlosalbertodelapenagonzalez@gmail.com
              </a>
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-neutral-400 dark:text-neutral-500">{t('about.phone')}:</dt>
            <dd>
              <a href="tel:+17345104024" className="hover:text-brand-600 dark:hover:text-brand-400">
                +1 (734) 510-4024
              </a>
            </dd>
          </div>
        </dl>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.08}>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {group.label}
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default About
