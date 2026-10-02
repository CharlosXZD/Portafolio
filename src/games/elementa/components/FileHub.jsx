import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { readFile } from '../utils/saveManager.js'
import { completion } from '../utils/profile.js'
import { localizeDifficulty } from '../data/i18n.js'
import { dieDescriptor } from '../data/itemDescriptors.js'
import ConfirmButton from './ConfirmButton.jsx'
import GalleryScreen from './GalleryScreen.jsx'
import AchievementsList from './AchievementsList.jsx'
import ItemIcon from './ItemIcon.jsx'
import { Stat } from './RoundHUD.jsx'

/** Full-screen overlay used for the gallery and achievements from the hub. */
function Overlay({ onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [onClose])
  return <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[#07050c] px-4 py-10">{children}</div>
}

/**
 * A save file's home: its progress, its run in progress (if any), and the
 * way into a new run, the gallery, and achievements.
 */
export default function FileHub({ slot, dispatch }) {
  const { t, lang } = useLanguage()
  const [file] = useState(() => readFile(slot))
  const [view, setView] = useState(null) // null | 'gallery' | 'achievements'
  if (!file) return null
  const { pct } = completion(file.profile)
  const run = file.run
  const stats = file.profile.stats
  const difficulty = run?.difficulty ? localizeDifficulty(run.difficulty, lang) : null

  const go = (action) => () => {
    playClick()
    dispatch(action)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
      className="el-panel flex w-full max-w-lg flex-col gap-6 px-8 py-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="pixel-heading text-base text-[var(--gold-1)]">
          {t('elementa.files.file')} {slot + 1}
        </h2>
        <span className="pixel-score text-xs text-[var(--gold-hi)]">{pct}%</span>
      </div>
      <div className="h-3 w-full bg-[var(--stone-0)]" style={{ boxShadow: '0 0 0 2px var(--ink)' }}>
        <div className="h-full bg-[var(--gold-2)]" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label={t('elementa.files.wins')}>{stats.wins}</Stat>
        <Stat label={t('elementa.files.runs')}>{stats.runs}</Stat>
        <Stat label={t('elementa.files.bestCast')} accent="var(--gold-1)">
          {stats.bestCast.toLocaleString()}
        </Stat>
      </div>

      {run ? (
        <div className="el-well flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="el-label">{t('elementa.files.runInProgress')}</span>
            {difficulty && (
              <span className="text-sm" style={{ color: difficulty.color }}>
                {difficulty.name}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="pixel-heading text-sm">
              {t('elementa.hud.round')} {run.round}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {run.dice.slice(0, 8).map((die) => {
                const item = dieDescriptor(die.elementId, lang)
                return <ItemIcon key={die.id} static size={24} icon={item.icon} glyph={item.glyph} color={item.color} rarity={item.rarity} />
              })}
            </div>
          </div>
          <button type="button" className="el-btn el-btn--gold el-btn--lg" onClick={go({ type: 'LOAD_RUN', save: run, slot, recipes: file.profile.recipes })}>
            {t('elementa.files.continueRun')}
          </button>
          <ConfirmButton
            onConfirm={() => dispatch({ type: 'NEW_RUN_SETUP', slot })}
            className="el-btn el-btn--sm"
            armedClassName="el-btn el-btn--sm el-btn--danger"
            confirmLabel={t('elementa.files.abandonConfirm')}
          >
            {t('elementa.files.newRunInstead')}
          </ConfirmButton>
        </div>
      ) : (
        <button type="button" className="el-btn el-btn--gold el-btn--lg" onClick={go({ type: 'NEW_RUN_SETUP', slot })}>
          {t('elementa.files.newRun')}
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button type="button" className="el-btn" onClick={() => {
            playClick()
            setView('gallery')
          }}>
          {t('elementa.menu.gallery')}
        </button>
        <button type="button" className="el-btn" onClick={() => {
            playClick()
            setView('achievements')
          }}>
          {t('elementa.achievements.title')}
        </button>
      </div>

      <button type="button" className="el-btn el-btn--ghost" onClick={go({ type: 'GO_TO_SLOTS' })}>
        {t('elementa.files.changeFile')}
      </button>

      {view === 'gallery' && (
        <Overlay onClose={() => setView(null)}>
          <GalleryScreen slot={slot} onBack={() => setView(null)} />
        </Overlay>
      )}
      {view === 'achievements' && (
        <Overlay onClose={() => setView(null)}>
          <div className="flex w-full max-w-5xl flex-col gap-8">
            <h2 className="pixel-heading text-center text-xl text-[var(--gold-1)]">{t('elementa.achievements.title')}</h2>
            <AchievementsList profile={file.profile} />
            <button type="button" className="el-btn el-btn--ghost self-center" onClick={() => setView(null)}>
              {t('elementa.common.back')}
            </button>
          </div>
        </Overlay>
      )}
    </motion.div>
  )
}
