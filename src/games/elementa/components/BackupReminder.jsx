import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { downloadBackup, lastBackupAt } from '../utils/backup.js'
import { playClick } from '../utils/sound.js'

/**
 * Shown after every run win: a nudge to download a backup file, since all
 * progress lives in browser storage that clearing site data would erase.
 */
export default function BackupReminder() {
  const { t } = useLanguage()
  const [last, setLast] = useState(lastBackupAt)
  const [state, setState] = useState('ask') // 'ask' | 'done' | 'dismissed'

  return (
    <AnimatePresence>
      {state !== 'dismissed' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ delay: 0.6 }}
          className="el-well flex w-full flex-col items-center gap-3 p-4 text-center"
        >
          {state === 'done' ? (
            <p className="text-base text-[var(--good)]">{t('elementa.backup.reminderDone')}</p>
          ) : (
            <>
              <p className="pixel-heading text-[10px] text-[var(--gold-hi)]">{t('elementa.backup.reminderTitle')}</p>
              <p className="text-base leading-snug text-[var(--text-dim)]">{t('elementa.backup.reminderBody')}</p>
              <p className="text-sm text-[var(--text-mute)]">
                {last
                  ? t('elementa.backup.lastBackup').replace('{date}', new Date(last).toLocaleDateString())
                  : t('elementa.backup.neverBackedUp')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="el-btn el-btn--sm el-btn--ghost"
                  onClick={() => {
                    playClick()
                    setState('dismissed')
                  }}
                >
                  {t('elementa.backup.notNow')}
                </button>
                <button
                  type="button"
                  className="el-btn el-btn--sm el-btn--gold"
                  onClick={() => {
                    playClick()
                    downloadBackup()
                    setLast(lastBackupAt())
                    setState('done')
                  }}
                >
                  {t('elementa.backup.download')}
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
