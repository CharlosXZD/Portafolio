import { useForm, ValidationError } from '@formspree/react'
import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const FORM_ID = import.meta.env.VITE_FORMSPREE_ID

function CheckCircleIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.7 2.3a1 1 0 0 0-1.03-.24l-14 5a1 1 0 0 0-.03 1.87l5.6 2.24 2.24 5.6a1 1 0 0 0 1.87-.02l5-14a1 1 0 0 0-.24-1.03l-.06-.06ZM8.7 10.7 4.9 9.2l9.8-3.5-6 5Zm1.4 1.4 5-6-3.5 9.8-1.5-3.8Z" />
    </svg>
  )
}

const fieldClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-600 dark:focus:border-brand-600'

const errorClass = 'mt-1.5 text-xs text-red-500'

function ContactForm() {
  const { t } = useLanguage()
  const [state, handleSubmit, reset] = useForm(FORM_ID)

  if (state.succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-6 py-10 text-center dark:border-brand-900 dark:bg-brand-950/40"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'backOut' }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white"
        >
          <CheckCircleIcon className="h-6 w-6" />
        </motion.span>
        <p className="font-medium tracking-tight">{t('contact.form.successTitle')}</p>
        <p className="max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
          {t('contact.form.successBody')}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          {t('contact.form.sendAnother')}
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {t('contact.form.name')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={`mt-1.5 ${fieldClass}`}
            placeholder={t('contact.form.namePlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {t('contact.form.email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={`mt-1.5 ${fieldClass}`}
            placeholder={t('contact.form.emailPlaceholder')}
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className={errorClass} />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {t('contact.form.message')}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className={`mt-1.5 resize-none ${fieldClass}`}
          placeholder={t('contact.form.messagePlaceholder')}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className={errorClass} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <motion.button
          type="submit"
          disabled={state.submitting}
          whileHover={{ scale: state.submitting ? 1 : 1.03 }}
          whileTap={{ scale: state.submitting ? 1 : 0.97 }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.submitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
              />
              {t('contact.form.sending')}
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4" />
              {t('contact.form.send')}
            </>
          )}
        </motion.button>

        <ValidationError errors={state.errors} className="text-sm text-red-500" />
      </div>
    </form>
  )
}

export default ContactForm
