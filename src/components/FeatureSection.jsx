import { useLanguage } from '../i18n/LanguageContext.jsx'
import { brandWash } from '../utils/brand.js'

function FeatureSection({ eyebrow, headline, body, image, reverse = false, portrait = false, color }) {
  const { pick } = useLanguage()

  return (
    <div
      className={`flex flex-col gap-8 md:items-center md:gap-14 ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}
    >
      <div
        className={`overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-neutral-200/70 md:w-[55%] dark:bg-neutral-900 dark:ring-neutral-800 ${
          portrait ? 'flex justify-center px-8 pt-10' : 'p-6 sm:p-8'
        }`}
        style={color ? { backgroundImage: brandWash(color) } : undefined}
      >
        <img
          src={image}
          alt={pick(headline)}
          loading="lazy"
          className={
            portrait
              ? 'w-full max-w-[15rem] rounded-t-[1.75rem] shadow-2xl shadow-neutral-900/20 ring-1 ring-black/5'
              : 'w-full rounded-xl shadow-2xl shadow-neutral-900/15 ring-1 ring-black/5'
          }
        />
      </div>
      <div className="md:w-[45%]">
        <p className="text-eyebrow text-brand-600 dark:text-brand-400">{pick(eyebrow)}</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-balance text-neutral-900 sm:text-3xl dark:text-white">
          {pick(headline)}
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-pretty text-neutral-600 dark:text-neutral-400">
          {pick(body)}
        </p>
      </div>
    </div>
  )
}

export default FeatureSection
