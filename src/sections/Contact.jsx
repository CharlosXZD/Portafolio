import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import ContactForm from '../components/ContactForm.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const EMAIL = 'carlosalbertodelapenagonzalez@gmail.com'

function EmailIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v.19l-7 4.15-7-4.15V5.5Z" />
      <path d="M3 7.4V14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V7.4l-6.65 3.94a.75.75 0 0 1-.7 0L3 7.4Z" />
    </svg>
  )
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.03 4.5a1.53 1.53 0 1 1-3.06 0 1.53 1.53 0 0 1 3.06 0ZM2.2 7.2h3.55V17.5H2.2V7.2ZM8.15 7.2h3.4v1.41h.05c.47-.89 1.63-1.84 3.36-1.84 3.6 0 4.26 2.37 4.26 5.45v5.28h-3.55v-4.68c0-1.12-.02-2.55-1.55-2.55-1.56 0-1.8 1.22-1.8 2.47v4.76H8.15V7.2Z" />
    </svg>
  )
}

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10 1.5a8.5 8.5 0 0 0-2.69 16.57c.425.078.581-.184.581-.409 0-.202-.008-.874-.011-1.586-2.365.514-2.865-1.011-2.865-1.011-.387-.983-.944-1.245-.944-1.245-.772-.528.058-.517.058-.517.854.06 1.304.877 1.304.877.759 1.3 1.992.925 2.478.707.077-.55.297-.925.54-1.138-1.888-.215-3.873-.944-3.873-4.202 0-.928.332-1.686.876-2.28-.088-.215-.38-1.08.083-2.252 0 0 .714-.229 2.34.87a8.15 8.15 0 0 1 4.26 0c1.624-1.1 2.337-.87 2.337-.87.464 1.172.172 2.037.084 2.252.546.594.875 1.352.875 2.28 0 3.267-1.988 3.985-3.882 4.195.305.263.577.78.577 1.573 0 1.136-.01 2.05-.01 2.328 0 .227.153.491.585.408A8.5 8.5 0 0 0 10 1.5Z"
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

const cards = [
  {
    key: 'contact.email',
    icon: EmailIcon,
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    key: 'contact.linkedin',
    icon: LinkedInIcon,
    value: 'linkedin.com/in/carlos-alberto-de-la-peña-gonzález',
    href: 'https://linkedin.com/in/carlos-alberto-de-la-peña-gonzález',
  },
  {
    key: 'contact.github',
    icon: GitHubIcon,
    value: 'github.com/CharlosXZD',
    href: 'https://github.com/CharlosXZD',
  },
]

function Contact() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  async function copyEmail(e) {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">{t('contact.heading')}</h2>
        <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-400">
          {t('contact.blurb')}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon
          const isEmail = card.key === 'contact.email'
          return (
            <Reveal key={card.key} delay={0.08 + i * 0.08}>
              <motion.a
                href={card.href}
                target={card.href.startsWith('http') ? '_blank' : undefined}
                rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                onClick={isEmail ? copyEmail : undefined}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="group relative flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 p-5 transition-colors hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 dark:border-neutral-800 dark:hover:border-brand-700"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  {isEmail && (
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={copied ? 'copied' : 'copy'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className={`text-xs font-medium ${copied ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400 dark:text-neutral-600'}`}
                      >
                        {copied ? (
                          <span className="flex items-center gap-1">
                            <CheckIcon className="h-3.5 w-3.5" />
                            {t('contact.copied')}
                          </span>
                        ) : (
                          t('contact.copy')
                        )}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {t(card.key)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-500">
                    {card.value}
                  </p>
                </div>
              </motion.a>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={0.2} className="mt-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
          {t('contact.form.heading')}
        </p>
        <ContactForm />
      </Reveal>
    </section>
  )
}

export default Contact
