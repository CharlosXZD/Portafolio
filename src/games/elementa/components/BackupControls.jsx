import { useRef, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { downloadBackup, parseBackup, restoreBackup } from '../utils/backup.js'
import { playClick } from '../utils/sound.js'

/**
 * Download / load a backup file of every save slot, gallery and unlock
 * progress, tutorial progress, and setting. Loading asks for a second
 * click before it replaces what's in this browser, then reloads the game.
 */
export default function BackupControls({ compact = false }) {
  const { t } = useLanguage()
  const inputRef = useRef(null)
  const [pending, setPending] = useState(null) // parsed backup awaiting confirm
  const [message, setMessage] = useState(null) // { kind: 'ok' | 'error', text }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      setPending(backup)
      setMessage(null)
    } catch {
      setPending(null)
      setMessage({ kind: 'error', text: t('elementa.backup.invalid') })
    }
  }

  function confirmRestore() {
    playClick()
    restoreBackup(pending)
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-3">
      {!compact && <p className="text-base leading-snug text-[var(--text-dim)]">{t('elementa.backup.explain')}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="el-btn el-btn--sm"
          onClick={() => {
            playClick()
            downloadBackup()
            setMessage({ kind: 'ok', text: t('elementa.backup.downloaded') })
          }}
        >
          {t('elementa.backup.download')}
        </button>
        <button
          type="button"
          className="el-btn el-btn--sm"
          onClick={() => {
            playClick()
            inputRef.current?.click()
          }}
        >
          {t('elementa.backup.load')}
        </button>
        <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </div>

      {pending && (
        <div className="el-well flex flex-col items-center gap-3 p-3 text-center">
          <p className="text-base leading-snug">
            {t('elementa.backup.confirm').replace('{date}', new Date(pending.exportedAt).toLocaleDateString())}
          </p>
          <div className="flex gap-3">
            <button type="button" className="el-btn el-btn--sm el-btn--ghost" onClick={() => setPending(null)}>
              {t('elementa.shop.cancel')}
            </button>
            <button type="button" className="el-btn el-btn--sm el-btn--danger" onClick={confirmRestore}>
              {t('elementa.backup.replace')}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-center text-sm" style={{ color: message.kind === 'ok' ? 'var(--good)' : 'var(--bad)' }}>
          {message.text}
        </p>
      )}
    </div>
  )
}
