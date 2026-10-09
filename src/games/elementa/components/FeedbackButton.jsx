import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { openFeedback } from '../utils/feedback.js'
import { playClick } from '../utils/sound.js'

/** "Send feedback" (T8): opens the contact form, prefilled, in a new tab. The run here is untouched. */
export default function FeedbackButton({ className = 'el-btn el-btn--sm' }) {
  const { t, lang } = useLanguage()
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        playClick()
        openFeedback(lang)
      }}
    >
      {t('elementa.feedback.send')}
    </button>
  )
}
