import { useLanguage } from '../i18n/LanguageContext.jsx'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
      <p>
        &copy; {new Date().getFullYear()} Carlos de la Peña. {t('footer.builtWith')}
      </p>
    </footer>
  )
}

export default Footer
