import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function NotFound() {
  const { t } = useLanguage()

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t('notFound.heading')}</h1>
      <Link to="/" className="text-sm text-neutral-500 hover:underline">
        {t('notFound.backHome')}
      </Link>
    </section>
  )
}

export default NotFound
