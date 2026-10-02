import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { listFiles, createFile, deleteFile, SAVE_SLOT_COUNT } from '../utils/saveManager.js'
import { completion } from '../utils/profile.js'
import { localizeDifficulty } from '../data/i18n.js'
import ConfirmButton from './ConfirmButton.jsx'
import BackupControls from './BackupControls.jsx'

function ProgressBar({ pct }) {
  return (
    <div className="h-2.5 w-full bg-[var(--stone-0)]" style={{ boxShadow: '0 0 0 2px var(--ink)' }}>
      <div className="h-full bg-[var(--gold-2)]" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** One save file: its overall completion, stats, and any run in progress. */
function FileCard({ slot, file, onOpen, onDelete, index }) {
  const { t, lang } = useLanguage()
  const empty = !file
  const pct = file ? completion(file.profile).pct : 0
  const run = file?.run
  const difficulty = run?.difficulty ? localizeDifficulty(run.difficulty, lang) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.45, delay: index * 0.06 }}
      className={`el-panel flex min-h-[240px] w-full flex-col gap-4 p-5 sm:w-64 ${empty ? 'el-panel--dark' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="pixel-heading text-[10px] text-[var(--gold-1)]">
          {t('elementa.files.file')} {slot + 1}
        </span>
        {!empty && <span className="pixel-score text-[10px] text-[var(--gold-hi)]">{pct}%</span>}
      </div>

      {empty ? (
        <>
          <div className="el-well flex flex-1 items-center justify-center text-base text-[var(--text-mute)]">
            {t('elementa.saveSlots.empty')}
          </div>
          <button type="button" onClick={onOpen} className="el-btn el-btn--gold">
            {t('elementa.files.newGame')}
          </button>
        </>
      ) : (
        <>
          <ProgressBar pct={pct} />
          <div className="flex flex-1 flex-col gap-1 text-base text-[var(--text-dim)]">
            <span>
              {t('elementa.files.wins')}: {file.profile.stats.wins} · {t('elementa.files.runs')}: {file.profile.stats.runs}
            </span>
            <span>
              {t('elementa.files.bestCast')}: {file.profile.stats.bestCast.toLocaleString()}
            </span>
            {run && (
              <span className="mt-2 text-[var(--gold-hi)]">
                {t('elementa.files.runInProgress')}: {t('elementa.hud.round')} {run.round}
                {difficulty && <span style={{ color: difficulty.color }}> · {difficulty.name}</span>}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onOpen} className="el-btn el-btn--gold flex-1">
              {t('elementa.files.open')}
            </button>
            <ConfirmButton
              onConfirm={onDelete}
              className="el-btn el-btn--sm"
              armedClassName="el-btn el-btn--sm el-btn--danger"
              confirmLabel={t('elementa.saveSlots.confirmDelete')}
            >
              {t('elementa.saveSlots.delete')}
            </ConfirmButton>
          </div>
        </>
      )}
    </motion.div>
  )
}

/** File select: three whole-game save files, each with its own progress. */
export default function SaveSlots({ dispatch }) {
  const { t } = useLanguage()
  const [files, setFiles] = useState(() => listFiles())

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full max-w-4xl flex-col items-center gap-10">
      <h2 className="pixel-heading text-xl text-[var(--gold-1)] sm:text-2xl">{t('elementa.files.title')}</h2>
      <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
        {Array.from({ length: SAVE_SLOT_COUNT }).map((_, slot) => (
          <FileCard
            key={slot}
            index={slot}
            slot={slot}
            file={files[slot]}
            onOpen={() => {
              playClick()
              if (!files[slot]) createFile(slot)
              dispatch({ type: 'GO_TO_HUB', slot })
            }}
            onDelete={() => {
              deleteFile(slot)
              setFiles(listFiles())
            }}
          />
        ))}
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <span className="el-label">{t('elementa.backup.title')}</span>
        <BackupControls compact />
      </div>
      <button
        type="button"
        onClick={() => {
          playClick()
          dispatch({ type: 'BACK_TO_MENU' })
        }}
        className="el-btn el-btn--ghost"
      >
        {t('elementa.common.back')}
      </button>
    </motion.div>
  )
}
