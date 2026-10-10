import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { listFiles, createFile, deleteFile, SAVE_SLOT_COUNT } from '../utils/saveManager.js'
import { completion } from '../utils/profile.js'
import { localizeDifficulty } from '../data/i18n.js'
import ConfirmButton from './ConfirmButton.jsx'
import BackupControls from './BackupControls.jsx'
import MenuScene from './visuals/scene/MenuScene.jsx'

function ProgressBar({ pct }) {
  return (
    <div className="obj-ribbon w-full">
      <span style={{ width: `${pct}%` }} />
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
      className={`obj-book sm:w-64 ${empty ? 'obj-book--empty' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="obj-plate">
          {t('elementa.files.file')} {slot + 1}
        </span>
        {!empty && <span className="pixel-score text-[10px] text-[var(--p2)]">{pct}%</span>}
      </div>

      {empty ? (
        <>
          <div className="obj-page flex flex-1 items-center justify-center text-base">
            {t('elementa.saveSlots.empty')}
          </div>
          <button type="button" onClick={onOpen} className="el-btn el-btn--gold">
            {t('elementa.files.newGame')}
          </button>
        </>
      ) : (
        <>
          <ProgressBar pct={pct} />
          <div className="obj-page flex flex-1 flex-col gap-1 text-base">
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
    <MenuScene><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full max-w-4xl flex-col items-center gap-10">
      <h2 className="obj-hangsign !mt-0 !px-8 !py-3 pixel-heading text-xl text-[var(--gold-hi)] sm:text-2xl">{t('elementa.files.title')}</h2>
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
    </MenuScene>
  )
}
