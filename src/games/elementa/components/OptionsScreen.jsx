import { useEffect, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import {
  getSfxVolume,
  setSfxVolume as persistSfxVolume,
  getMusicVolume,
  setMusicVolume as persistMusicVolume,
  getMusicEnabled,
  setMusicEnabled as persistMusicEnabled,
} from '../utils/settings.js'
import { playClick, refreshMusicVolume, applyMusicEnabled } from '../utils/sound.js'
import Modal from './Modal.jsx'
import BackupControls from './BackupControls.jsx'
import { resetTutorial } from '../utils/tutorial.js'
import PatchNotesScreen from './PatchNotesScreen.jsx'
import { useFourthWall } from '../utils/useFourthWall.js'

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => {
            playClick()
            onChange(opt.value)
          }}
          className={`el-btn el-btn--sm flex-1 ${value === opt.value ? 'el-btn--gold' : ''}`}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-base">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          playClick()
          onChange(!checked)
        }}
        className="el-toggle"
      />
    </label>
  )
}

function VolumeRow({ label, value, onChange, disabled = false }) {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <div className="mb-2 flex items-center justify-between text-base">
        <span>{label}</span>
        <span className="pixel-score text-[9px] text-[var(--text-dim)]">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="el-range w-full"
        aria-label={label}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="el-label">{title}</h3>
      {children}
    </section>
  )
}

/**
 * The one settings surface, opened from the main menu and the pause menu.
 * The site-wide light/dark theme toggle is intentionally gone from here:
 * the game always renders in its own palette.
 */
export default function OptionsScreen({ onClose, onNotesSeen }) {
  const { lang, setLang, t } = useLanguage()
  const [fourthWall, chooseFourthWall] = useFourthWall()
  const {
    crtEffect,
    setCrtEffect,
    reducedMotion,
    setReducedMotion,
    gameSpeed,
    setGameSpeed,
    screenShake,
    setScreenShake,
    display,
    updateDisplay,
  } = useGameSettings()

  const [sfxVolume, setSfxVolumeState] = useState(getSfxVolume)
  const [musicVolume, setMusicVolumeState] = useState(getMusicVolume)
  const [musicEnabled, setMusicEnabledState] = useState(getMusicEnabled)
  const [tutorialReset, setTutorialReset] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  useEffect(() => {
    function handleKeyDown(e) {
      // The patch notes on top handle their own Escape.
      if (e.key !== 'Escape' || showNotes) return
      // Capture phase + stopImmediatePropagation: this overlay may sit on
      // top of the pause menu, whose own window-level Escape listener
      // (ElementaGame.jsx) would otherwise close that too.
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [onClose, showNotes])

  function changeSfxVolume(v) {
    persistSfxVolume(v)
    setSfxVolumeState(v)
  }

  function changeMusicVolume(v) {
    persistMusicVolume(v)
    setMusicVolumeState(v)
    refreshMusicVolume()
  }

  function toggleMusicEnabled(next) {
    persistMusicEnabled(next)
    setMusicEnabledState(next)
    applyMusicEnabled(next)
  }

  return (
    <Modal title={t('elementa.options.title')} onClose={onClose} width="max-w-md" closeLabel={t('elementa.options.close')}>
      <Section title={t('elementa.options.language')}>
        <Segmented
          value={lang}
          onChange={setLang}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
          ]}
        />
      </Section>

      <Section title={t('elementa.options.audio')}>
        <VolumeRow label={t('elementa.options.sfxVolume')} value={sfxVolume} onChange={changeSfxVolume} />
        <Toggle label={t('elementa.options.music')} checked={musicEnabled} onChange={toggleMusicEnabled} />
        <VolumeRow
          label={t('elementa.options.musicVolume')}
          value={musicVolume}
          onChange={changeMusicVolume}
          disabled={!musicEnabled}
        />
        {/* Every song, playable and editable (MUSIC.md). A new tab, so a run in progress stays put. */}
        <a href="/games/elementa/jukebox" target="_blank" rel="noopener noreferrer" className="el-btn el-btn--sm w-fit">
          {lang === 'es' ? 'Abrir la Rockola' : 'Open the Jukebox'}
        </a>
      </Section>

      <Section title={t('elementa.options.gameplay')}>
        <div className="text-base">{t('elementa.options.scoringSpeed')}</div>
        <Segmented
          value={gameSpeed}
          onChange={setGameSpeed}
          options={[
            { value: 'normal', label: t('elementa.options.speedNormal') },
            { value: 'fast', label: t('elementa.options.speedFast') },
            { value: 'instant', label: t('elementa.options.speedInstant') },
          ]}
        />
        {/* The Arbiter's fourth wall (Part S): asked once when he first appears; changeable here. */}
        <Toggle label={t('elementa.options.fourthwall')} checked={fourthWall === 'yes'} onChange={(v) => chooseFourthWall(v ? 'yes' : 'no')} />
        <p className="-mt-1 text-sm text-[var(--text-mute)]">{t('elementa.options.fourthwallNote')}</p>
      </Section>

      <Section title={t('elementa.options.display')}>
        <div className="text-base">{t('elementa.options.textStyle')}</div>
        <Segmented
          value={display.fontStyle}
          onChange={(v) => updateDisplay({ fontStyle: v })}
          options={[
            { value: 'pixel', label: t('elementa.options.fontPixel') },
            { value: 'classic', label: t('elementa.options.fontClassic') },
            { value: 'clean', label: t('elementa.options.fontClean') },
          ]}
        />
        <div className="text-base">{t('elementa.options.reactionList')}</div>
        <Segmented
          value={display.reactions}
          onChange={(v) => updateDisplay({ reactions: v })}
          options={[
            { value: 'compact', label: t('elementa.options.reactionsCompact') },
            { value: 'full', label: t('elementa.options.reactionsFull') },
            { value: 'off', label: t('elementa.options.reactionsOff') },
          ]}
        />
        <div className="text-base">{t('elementa.options.rollAnimation')}</div>
        <Segmented
          value={reducedMotion ? 'classic' : display.rollAnimation}
          onChange={(v) => updateDisplay({ rollAnimation: v })}
          options={[
            { value: 'tumble', label: t('elementa.options.rollTumble') },
            { value: 'classic', label: t('elementa.options.rollClassic') },
          ]}
        />
        {reducedMotion && <p className="-mt-1 text-sm text-[var(--text-mute)]">{t('elementa.options.rollReducedNote')}</p>}
        <Toggle
          label={t('elementa.options.elementEffects')}
          checked={display.elementEffects && !reducedMotion}
          onChange={(v) => updateDisplay({ elementEffects: v })}
        />
        <Toggle label={t('elementa.options.glows')} checked={display.glows} onChange={(v) => updateDisplay({ glows: v })} />
        <Toggle label={t('elementa.options.keyHints')} checked={display.keyHints} onChange={(v) => updateDisplay({ keyHints: v })} />
        <Toggle label={t('elementa.options.liveTotal')} checked={display.liveTotal} onChange={(v) => updateDisplay({ liveTotal: v })} />
        <Toggle label={t('elementa.options.ledgerOpen')} checked={display.ledgerOpen} onChange={(v) => updateDisplay({ ledgerOpen: v })} />
      </Section>

      <Section title={t('elementa.backup.title')}>
        <BackupControls />
      </Section>

      <Section title={t('elementa.tutorial.title')}>
        <button
          type="button"
          className="el-btn el-btn--sm"
          onClick={() => {
            playClick()
            resetTutorial()
            setTutorialReset(true)
          }}
        >
          {tutorialReset ? t('elementa.tutorial.resetDone') : t('elementa.tutorial.replay')}
        </button>
      </Section>

      <Section title={t('elementa.patchNotes.title')}>
        <button
          type="button"
          className="el-btn el-btn--sm"
          onClick={() => {
            playClick()
            setShowNotes(true)
          }}
        >
          {t('elementa.patchNotes.open')}
        </button>
      </Section>

      <Section title={t('elementa.options.visuals')}>
        <Toggle label={t('elementa.options.screenShake')} checked={screenShake} onChange={setScreenShake} />
        <Toggle label={t('elementa.options.crtEffect')} checked={crtEffect} onChange={setCrtEffect} />
        <Toggle label={t('elementa.options.reducedMotion')} checked={reducedMotion} onChange={setReducedMotion} />
      </Section>

      {showNotes && (
        <PatchNotesScreen
          onClose={() => {
            setShowNotes(false)
            onNotesSeen?.()
          }}
        />
      )}
    </Modal>
  )
}
