import { useLanguage } from '../../../i18n/LanguageContext.jsx'

/** What a screen shows when the lazy part that draws it cannot load (VISUALS.md V8.3): a note and a way back. */
export default function LoadFailed({ onBack }) {
  const { t } = useLanguage()
  return (
    <div className="el-panel mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center" role="alert">
      <p className="text-base text-[var(--text)]">{t('elementa.fallback.failed')}</p>
      {onBack && (
        <button type="button" className="el-btn el-btn--gold" onClick={onBack}>
          {t('elementa.common.back')}
        </button>
      )}
    </div>
  )
}
