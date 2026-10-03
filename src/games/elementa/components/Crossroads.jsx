import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { playClick } from '../utils/sound.js'
import { selectors } from '../engine/gameReducer.js'
import { endingById } from '../data/endings.js'
import { WARDEN_SETS, bossById } from '../data/bossModifiers.js'
import { localizeBossModifier } from '../data/i18n.js'
import BossAvatar from './BossAvatar.jsx'
import { EndingArt } from './EndingCards.jsx'

const PATH_COLOR = { neutral: '#ffd166', split: '#9fd8ff', primordial: '#ff4d6d' }
const ROMAN = { 1: 'I', 2: 'II' }

/**
 * The Crossroads (EXPANSION.md H1): the final battle is won on a path whose
 * door is open. Walk through into the Firmament (the run goes on, the set
 * of Wardens shown), or rest here and end the run with the Elementa ending.
 */
export default function Crossroads({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const path = state.path ?? 'neutral'
  const color = PATH_COLOR[path]
  const sets = selectors.firmamentSets(state)
  const ending = endingById(path)

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
      className="el-panel flex w-full max-w-3xl flex-col items-center gap-7 px-6 py-9 text-center sm:px-10"
      style={{ '--edge': color }}
    >
      <span className="el-label">{t('elementa.crossroads.label')}</span>
      <h2 className="el-logo text-xl">{t('elementa.crossroads.title')}</h2>
      <p className="max-w-xl text-lg leading-snug text-[var(--text-dim)]">{t(`elementa.crossroads.door.${path}`)}</p>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          {sets.map((set) => (
            <div key={set} className="el-well flex flex-col items-center gap-3 px-4 py-4" style={{ '--edge': color }}>
              <span className="pixel-heading text-[11px]" style={{ color }}>
                {t('elementa.crossroads.firmament').replace('{n}', ROMAN[set])}
              </span>
              <div className="flex items-end justify-center gap-4">
                {WARDEN_SETS[path][set - 1].map((id, i) => {
                  const warden = localizeBossModifier(bossById(id), lang)
                  return (
                    <span key={id} className="flex flex-col items-center gap-1" title={warden.description}>
                      <BossAvatar id={id} size={40} />
                      <span className="text-sm text-[var(--text-dim)]">{warden.name}</span>
                      <span className="pixel-score text-[7px] text-[var(--text-mute)]">
                        {t('elementa.hud.round')} {[20, 25, 30][i]}
                      </span>
                    </span>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  playClick()
                  dispatch({ type: 'ENTER_FIRMAMENT', set })
                }}
                className="el-btn el-btn--arcane el-btn--lg min-w-[240px]"
              >
                {t('elementa.crossroads.enter')}
                {sets.length > 1 ? ` ${ROMAN[set]}` : ''}
              </button>
            </div>
          ))}
        </div>

        <div className="el-well flex flex-col items-center justify-center gap-3 px-5 py-4">
          <EndingArt ending={path} size={56} />
          <span className="pixel-heading text-[10px]" style={{ color: ending?.color }}>
            {ending?.name[lang]}
          </span>
          <button
            type="button"
            onClick={() => {
              playClick()
              dispatch({ type: 'REST_HERE' })
            }}
            className="el-btn el-btn--gold"
          >
            {t('elementa.crossroads.rest')}
          </button>
          <span className="max-w-[14rem] text-sm text-[var(--text-mute)]">{t('elementa.crossroads.restHint')}</span>
        </div>
      </div>
      <p className="text-sm text-[var(--text-mute)]">{t('elementa.crossroads.keep')}</p>
    </motion.div>
  )
}
