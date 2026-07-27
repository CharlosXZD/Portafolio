import { useLanguage } from '../i18n/LanguageContext.jsx'

function FeatureSection({ eyebrow, headline, body, image, reverse = false }) {
  const { pick } = useLanguage()

  return (
    <div
      className={`flex flex-col gap-8 sm:items-center sm:gap-10 ${
        reverse ? 'sm:flex-row-reverse' : 'sm:flex-row'
      }`}
    >
      <div className="sm:w-1/2">
        <img
          src={image}
          alt={pick(headline)}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800"
        />
      </div>
      <div className="sm:w-1/2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          {pick(eyebrow)}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {pick(headline)}
        </h3>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">{pick(body)}</p>
      </div>
    </div>
  )
}

export default FeatureSection
