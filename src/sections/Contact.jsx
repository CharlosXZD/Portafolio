import Reveal from '../components/Reveal.jsx'

const links = [
  { label: 'Email', href: 'mailto:carlosalbertodelapenagonzalez@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/carlos-alberto-de-la-peña-gonzález' },
  { label: 'GitHub', href: 'https://github.com/CharlosXZD' },
]

function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Reach out directly, or find me on these platforms.
        </p>
        <ul className="mt-6 flex flex-wrap gap-4">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-neutral-400 dark:text-neutral-600">
          A contact form (Formspree) is on the way in a later milestone.
        </p>
      </Reveal>
    </section>
  )
}

export default Contact
