import Reveal from './Reveal.jsx'

function SectionHeader({ eyebrow, heading, children }) {
  return (
    <Reveal>
      <p className="text-eyebrow text-brand-600 dark:text-brand-400">{eyebrow}</p>
      <h2 className="text-title mt-3 max-w-2xl text-balance text-neutral-900 dark:text-white">
        {heading}
      </h2>
      {children}
    </Reveal>
  )
}

export default SectionHeader
