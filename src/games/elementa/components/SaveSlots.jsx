import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { listSaves, readSave, deleteSave, SAVE_SLOT_COUNT } from '../utils/saveManager.js'
import { localizeDifficulty } from '../data/i18n.js'
import { dieDescriptor } from '../data/itemDescriptors.js'
import ConfirmButton from './ConfirmButton.jsx'
import ItemIcon from './ItemIcon.jsx'
import { Hearts, ShardCount } from './RoundHUD.jsx'
import BackupControls from './BackupControls.jsx'

function SlotCard({ slot, save, onPlay, onDelete, index }) {
  const { t, lang } = useLanguage()
  const empty = !save
  const difficulty = save ? localizeDifficulty(save.state.difficulty, lang) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.45, delay: index * 0.06 }}
      className={`${empty ? 'el-panel--dark' : 'el-panel'} el-panel flex min-h-[220px] w-full flex-col gap-4 p-5 sm:w-64`}
    >
      <div className="flex items-center justify-between">
        <span className="el-label">
          {t('elementa.saveSlots.slot')} {slot + 1}
        </span>
        {difficulty && (
          <span className="pixel-score text-[8px] uppercase" style={{ color: difficulty.color }}>
            {difficulty.name}
          </span>
        )}
      </div>

      {empty ? (
        <>
          <div className="el-well flex flex-1 items-center justify-center text-base text-[var(--text-mute)]">
            {t('elementa.saveSlots.empty')}
          </div>
          <button
            type="button"
            onClick={() => {
              playClick()
              onPlay()
            }}
            className="el-btn el-btn--gold"
          >
            {t('elementa.saveSlots.newRun')}
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-3">
            <div className="pixel-heading text-sm">
              {t('elementa.hud.round')} {save.state.round}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {save.state.dice.slice(0, 8).map((die) => {
                const item = dieDescriptor(die.elementId, lang)
                return <ItemIcon key={die.id} size={24} icon={item.icon} sprite={item.sprite} glyph={item.glyph} color={item.color} rarity={item.rarity} static />
              })}
            </div>
            <div className="flex items-center gap-4">
              <Hearts lives={save.state.lives} maxLives={save.state.maxLives} size={12} />
              <ShardCount value={save.state.shards} />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                playClick()
                onPlay()
              }}
              className="el-btn el-btn--gold flex-1"
            >
              {t('elementa.saveSlots.continue')}
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

export default function SaveSlots({ dispatch }) {
  const { t } = useLanguage()
  const [saves, setSaves] = useState(() => listSaves())

  function handleDelete(slot) {
    deleteSave(slot)
    setSaves(listSaves())
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex w-full max-w-4xl flex-col items-center gap-10"
    >
      <h2 className="pixel-heading text-xl text-[var(--gold-1)] sm:text-2xl">{t('elementa.saveSlots.title')}</h2>
      <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
        {Array.from({ length: SAVE_SLOT_COUNT }).map((_, slot) => (
          <SlotCard
            key={slot}
            index={slot}
            slot={slot}
            save={saves[slot]}
            onPlay={() => {
              const save = readSave(slot)
              if (save) dispatch({ type: 'LOAD_RUN', save: save.state })
              else dispatch({ type: 'NEW_RUN_SETUP', slot })
            }}
            onDelete={() => handleDelete(slot)}
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
