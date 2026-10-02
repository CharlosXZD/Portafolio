import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { ELEMENTS } from '../data/elements.js'
import OptionsScreen from './OptionsScreen.jsx'
import PatchNotesScreen from './PatchNotesScreen.jsx'
import { LATEST_VERSION, isNewerVersion } from '../data/patchNotes.js'
import { getSeenVersion } from '../utils/settings.js'
import PixelIcon from './PixelIcon.jsx'

const ORBS = ['fire', 'water', 'earth', 'air']

/** The four pure elements, each bobbing slightly out of phase under the logo. */
export function ElementOrbs({ size = 22 }) {
  const { reducedMotion } = useGameSettings()
  return (
    <div className="flex items-center justify-center gap-5">
      {ORBS.map((id, i) => (
        <motion.span
          key={id}
          animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${ELEMENTS[id].color}88)` }}
        >
          <PixelIcon name={id} size={size} color={id === 'earth' ? '#c89a5c' : ELEMENTS[id].color} hi="#fff4d6" />
        </motion.span>
      ))}
    </div>
  )
}

export function Logo({ className = 'text-3xl sm:text-5xl md:text-7xl' }) {
  return <h1 className={`el-logo select-none tracking-tight ${className}`}>Elementa</h1>
}

export default function MainMenu({ dispatch }) {
  const { t } = useLanguage()
  const [showOptions, setShowOptions] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  // NEW until this version's notes have been opened once.
  const [seenVersion, setSeenVersionState] = useState(getSeenVersion)
  const hasNews = isNewerVersion(LATEST_VERSION, seenVersion)

  function go(fn) {
    return () => {
      playClick()
      fn()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      className="flex flex-col items-center gap-12 text-center"
    >
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <ElementOrbs />
        <p className="text-lg text-[var(--text-dim)]">{t('elementa.menu.tagline')}</p>
      </div>

      <nav className="flex w-64 flex-col gap-4">
        <button type="button" className="el-btn el-btn--gold el-btn--lg" onClick={go(() => dispatch({ type: 'GO_TO_SLOTS' }))}>
          {t('elementa.menu.play')}
        </button>
        <button type="button" className="el-btn" onClick={go(() => setShowOptions(true))}>
          {t('elementa.menu.options')}
        </button>
        <button type="button" className="el-btn relative" onClick={go(() => setShowNotes(true))}>
          {t('elementa.menu.whatsNew')}
          {hasNews && (
            <span className="el-chip absolute -right-3 -top-3 bg-[var(--gold-1)] text-[var(--ink)]">{t('elementa.patchNotes.new')}</span>
          )}
        </button>
        <button type="button" className="el-btn" onClick={go(() => dispatch({ type: 'GO_TO_CREDITS' }))}>
          {t('elementa.menu.credits')}
        </button>
      </nav>

      {showOptions && <OptionsScreen onClose={() => setShowOptions(false)} onNotesSeen={() => setSeenVersionState(LATEST_VERSION)} />}
      {showNotes && (
        <PatchNotesScreen
          onClose={() => {
            setShowNotes(false)
            setSeenVersionState(LATEST_VERSION)
          }}
        />
      )}
    </motion.div>
  )
}
