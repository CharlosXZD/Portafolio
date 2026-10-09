import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { playClick } from '../utils/sound.js'
import { localize, ELEMENTS_ES, RELICS_ES } from '../data/i18n.js'
import { ELEMENTS } from '../data/elements.js'
import { relicById } from '../data/relics.js'
import { CALLBACKS, MOVES, GHOST_NAME, GHOST_LINES, DUEL_EXCHANGES } from '../data/convergence.js'
import { hashText } from '../data/arbiter.js'
import { compactNumber } from '../utils/formatNumber.js'
import { endingById } from '../data/endings.js'
import BossAvatar from './BossAvatar.jsx'
import { EndingArt } from './EndingCards.jsx'
import { Pip } from './Tutorial.jsx'

/** The last door (T1): rest here, or enter the Unwritten. Everyone who arrives may enter. */
export function UnwrittenDoor({ state, dispatch }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const ending = endingById(state.ending)
  const fights = ['primordial', 'gods', 'dawn', 'axiom', 'pip', 'you']
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
      className="el-panel flex w-full max-w-3xl flex-col items-center gap-7 px-6 py-9 text-center sm:px-10"
      style={{ '--edge': '#e8e4f4' }}
    >
      <span className="el-label">{t('elementa.convergence.label')}</span>
      <h2 className="el-logo text-xl">{t('elementa.convergence.title')}</h2>
      <p className="max-w-xl text-lg leading-snug text-[var(--text-dim)]">{t('elementa.convergence.body')}</p>
      <div className="flex items-end justify-center gap-4">
        {fights.map((id) => (
          <span key={id} className="flex flex-col items-center gap-1" title={id}>
            {id === 'gods' ? <BossAvatar id="gaea" size={36} /> : <BossAvatar id={id} size={36} />}
          </span>
        ))}
      </div>
      <p className="max-w-xl text-base text-[var(--text-mute)]">{t('elementa.convergence.fights')}</p>
      <div className="flex flex-wrap items-stretch justify-center gap-5">
        <button
          type="button"
          onClick={() => {
            playClick()
            dispatch({ type: 'ENTER_UNWRITTEN' })
          }}
          className="el-btn el-btn--arcane el-btn--lg min-w-[240px]"
        >
          {t('elementa.convergence.enter')}
        </button>
        <div className="el-well flex flex-col items-center justify-center gap-3 px-5 py-3">
          <EndingArt ending={state.ending} size={40} />
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
      <p className="text-sm text-[var(--text-mute)]">{t('elementa.convergence.keep')}</p>
    </motion.div>
  )
}

/** Which Rush fight this is, and the boss's one new line (T2). */
export function RushLine({ state }) {
  const { t, lang } = useLanguage()
  const c = state.convergence
  if (!c || state.duel) return null
  const id = c.fights[c.index]
  const callback = CALLBACKS[state.gauntlet ? 'gods' : id]
  const total = c.fights.indexOf('pip')
  return (
    <div className="flex flex-col items-center gap-1 text-center" data-rush>
      <span className="el-label">
        {id === 'pip' ? t('elementa.convergence.pipFight') : t('elementa.convergence.progress').replace('{n}', c.index + 1).replace('{total}', total)}
      </span>
      {callback && <span className="max-w-xl text-base italic text-[var(--text)]">{callback[lang]}</span>}
    </div>
  )
}

/** Pip repeats your very first cast (T3): its dice and its score. */
export function PipEcho({ state }) {
  const { t, lang } = useLanguage()
  if (state.bossModifier?.id !== 'pip') return null
  const first = state.firstCast
  return (
    <div className="el-panel flex items-center gap-3 px-4 py-2 text-left" style={{ '--edge': '#b88cff' }}>
      <Pip size={36} />
      <span className="flex flex-col leading-snug">
        <span className="el-label">{t('elementa.convergence.pipEcho')}</span>
        <span className="text-base text-[var(--text)]">
          {first
            ? `${first.dice.map((d) => `${localize(lang, ELEMENTS[d.elementId]?.name ?? d.elementId, ELEMENTS_ES, d.elementId, 'name')} ${d.value}`).join(', ')}: ${compactNumber(first.score)}`
            : t('elementa.convergence.pipNoFirst')}
        </span>
      </span>
    </div>
  )
}

function Bar({ label, value, goal, color }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, goal)) * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="el-label w-14 shrink-0 text-left">{label}</span>
      <span className="relative h-3 flex-1 bg-[var(--stone-0)]" style={{ boxShadow: '0 0 0 2px var(--ink)' }}>
        <span className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="pixel-score w-24 shrink-0 text-right text-[9px]">{compactNumber(value)}</span>
    </div>
  )
}

/** The ghost duel (T4): who the ghost is, the race, and the move it announced. */
export function DuelPanel({ state }) {
  const { t, lang } = useLanguage()
  const duel = state.duel
  if (!duel) return null
  const taken = (duel.stolen || []).map((s) => localize(lang, ELEMENTS[s.die.elementId]?.name ?? s.die.elementId, ELEMENTS_ES, s.die.elementId, 'name'))
  const lent = duel.borrowed ? relicById(duel.borrowed) : null
  const mood = duel.you >= duel.them ? GHOST_LINES.behind : GHOST_LINES.ahead
  const say = (duel.exchange === 1 && !duel.last ? GHOST_LINES.open : mood)[hashText(`${state.seed}:${duel.exchange}:${duel.rematches}`) % (duel.exchange === 1 && !duel.last ? GHOST_LINES.open.length : mood.length)]
  return (
    <div className="el-panel flex w-full flex-col gap-3 px-4 py-3 text-left" style={{ background: '#1d1a2c', '--edge': '#f4f0fa' }} data-duel>
      <div className="flex items-center gap-3">
        <BossAvatar id="you" size={44} />
        <div className="flex flex-col leading-snug">
          <span className="pixel-heading text-[10px] text-[#f4f0fa]">{t('elementa.convergence.duel')}</span>
          <span className="text-base text-[var(--text-dim)]">{(GHOST_NAME[duel.kind] ?? GHOST_NAME.ember)[lang]}</span>
        </div>
        <span className="el-chip ml-auto bg-[#f4f0fa] text-[var(--ink)]">
          {t('elementa.convergence.exchange').replace('{n}', duel.exchange).replace('{total}', DUEL_EXCHANGES)}
        </span>
      </div>
      <Bar label={t('elementa.convergence.you')} value={duel.you} goal={duel.goal} color="var(--gold-1)" />
      <Bar label={t('elementa.convergence.ghost')} value={duel.them} goal={duel.goal} color="#c8c2d8" />
      <p className="text-sm text-[var(--text-mute)]">{t('elementa.convergence.goal').replace('{goal}', compactNumber(duel.goal))}</p>
      <div className="flex flex-col gap-1">
        {duel.moves.map((m) => (
          <p key={m} className="text-base text-[#ffd0d0]">
            <strong>{MOVES[m].name[lang]}.</strong> {MOVES[m].announce[lang]}
            {duel.moveDone ? ` (${t('elementa.convergence.landed')})` : ''}
          </p>
        ))}
        {taken.length > 0 && <p className="text-sm text-[var(--text-dim)]">{t('elementa.convergence.taken').replace('{die}', taken.join(', '))}</p>}
        {lent && <p className="text-sm text-[var(--text-dim)]">{t('elementa.convergence.lent').replace('{relic}', localize(lang, lent.name, RELICS_ES, lent.id, 'name'))}</p>}
      </div>
      {duel.last && (
        <p className="text-sm text-[var(--text-dim)]">
          {t('elementa.convergence.last').replace('{n}', duel.last.exchange).replace('{you}', compactNumber(duel.last.you)).replace('{ghost}', compactNumber(duel.last.them))}
        </p>
      )}
      <p className="text-base italic text-[var(--text)]">{say[lang]}</p>
    </div>
  )
}
