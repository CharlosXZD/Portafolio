import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { selectors } from '../engine/gameReducer.js'
import { localizeBossModifier } from '../data/i18n.js'
import DieToken from './DieToken.jsx'
import PixelIcon from './PixelIcon.jsx'

/**
 * The Eye (EXPANSION.md P2, P5): while a sigil die shows an Eye, a look at
 * the next reroll. It is a dry run of the reroll on a copy of the table as it
 * stands, so it is exact for this table and shifts when the table changes (the
 * dice that changed flicker). The Greater Eye shows every unheld die, the
 * normal one the die you pick. Under it, the next boss, and the Arbiter's
 * warnings if you keep reshaping the table to fish for a roll.
 */
export default function EyePanel({ state }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const [pick, setPick] = useState(null)
  const previous = useRef({})
  const [flicker, setFlicker] = useState({})

  const active = selectors.eyeActive(state)
  const greater = selectors.eyeGreater(state)
  const vision = useMemo(() => (active ? selectors.peekReroll(state) : null), [state, active])
  const unheld = state.dice.filter((d) => !d.held && !d.locked && !d.temp)
  const shown = vision ? unheld.filter((d) => greater || d.id === (pick ?? unheld[0]?.id)) : []

  // Which dice show something different from a moment ago: they flicker.
  useEffect(() => {
    if (!vision) {
      previous.current = {}
      return
    }
    const next = {}
    const changed = {}
    vision.forEach((d) => {
      const key = `${d.value}:${d.symbol ?? ''}`
      next[d.id] = key
      if (previous.current[d.id] !== undefined && previous.current[d.id] !== key) changed[d.id] = Date.now()
    })
    previous.current = next
    if (Object.keys(changed).length) setFlicker(changed)
  }, [vision])

  const boss = state.map?.prophecy?.boss ? localizeBossModifier(state.map.prophecy.boss, lang) : null
  const notice = state.eyeNotice
  const noticeText = notice ? t(`elementa.eye.notice${notice.level}`) : null

  if (!active && !notice && !state.eyeBlind) return null
  return (
    <div className="el-panel flex w-full max-w-3xl flex-col items-center gap-2 px-4 py-3" style={{ '--edge': state.eyeBlind ? '#6e6480' : '#a8324a' }}>
      {active && vision && (
        <>
          <div className="flex items-center gap-2">
            <PixelIcon name="sym_eye" size={16} color="#a8324a" hi="#8a5cff" />
            <span className="el-label">{t(greater ? 'elementa.eye.greater' : 'elementa.eye.normal')}</span>
          </div>
          {!greater && unheld.length > 1 && (
            <div className="flex flex-wrap justify-center gap-1">
              {unheld.map((d) => (
                <button key={d.id} type="button" onClick={() => setPick(d.id)} aria-pressed={(pick ?? unheld[0].id) === d.id} className="el-btn el-btn--sm">
                  {d.elementId}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3" aria-live="polite">
            {shown.map((d) => {
              const after = vision.find((v) => v.id === d.id)
              if (!after) return null
              return (
                <motion.span
                  key={`${d.id}-${flicker[d.id] ?? 0}`}
                  initial={reducedMotion || !flicker[d.id] ? false : { opacity: 0.15, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-1"
                  style={{ outline: flicker[d.id] ? '2px dashed #ffd166' : undefined, outlineOffset: 3 }}
                >
                  <DieToken die={after} size={44} face={after.value} />
                </motion.span>
              )
            })}
          </div>
          <p className="text-sm text-[var(--text-mute)]">{t('elementa.eye.hint')}</p>
          {boss && (
            <p className="text-base text-[var(--text-dim)]">
              {t('elementa.eye.boss').replace('{round}', state.map.prophecy.round).replace('{boss}', boss.name)}: {boss.description}
            </p>
          )}
        </>
      )}
      {state.eyeBlind && <p className="text-base text-[var(--text-mute)]">{t('elementa.eye.blind')}</p>}
      {noticeText && (
        <p role="status" className="text-base italic" style={{ color: notice.level >= 3 ? '#ffb0b0' : '#ffd9a0' }}>
          {noticeText}
          {notice.level >= 3 && notice.lostLife ? ` ${t('elementa.eye.lostLife')}` : ''}
        </p>
      )}
    </div>
  )
}
