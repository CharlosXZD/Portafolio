import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { playClick } from '../utils/sound.js'
import { ENDINGS, endingById } from '../data/endings.js'
import { ELEMENTS } from '../data/elements.js'
import BossAvatar from './BossAvatar.jsx'
import PixelIcon from './PixelIcon.jsx'
import StoryScene from './StoryScene.jsx'

/** One card: a pixel placeholder portrait, a title, a few lines. */
export function EndingCard({ art, title, text, color, label, small = false }) {
  return (
    <div
      className={`el-panel flex flex-col items-center gap-5 text-center ${small ? 'w-full p-4' : 'w-full max-w-lg px-8 py-10'}`}
      style={{ '--edge': color }}
    >
      {label && <span className="el-label">{label}</span>}
      <span className="flex items-center justify-center" style={{ filter: `drop-shadow(0 0 18px ${color}88)` }}>
        {art}
      </span>
      <h3 className={`pixel-heading ${small ? 'text-[10px]' : 'text-base'}`} style={{ color }}>
        {title}
      </h3>
      <p className={`${small ? 'text-sm' : 'text-lg'} leading-snug text-[var(--text-dim)]`}>{text}</p>
    </div>
  )
}

/** Placeholder art per ending: the Primordial asleep (Neutral), the four
 * elements kept apart (Split), the Primordial die made whole (Primordial). */
export function EndingArt({ ending, size = 96 }) {
  if (ending === 'split') {
    return (
      <span className="flex items-center gap-4">
        {['fire', 'water', 'earth', 'air'].map((id) => (
          <PixelIcon key={id} name={id} size={Math.round(size / 3)} color={ELEMENTS[id].color} hi="#fffaf0" />
        ))}
      </span>
    )
  }
  if (ending === 'primordial') return <PixelIcon name="primordial_die" size={size} color={ELEMENTS.primordial_die.color} hi="#fffaf0" />
  return <BossAvatar id={endingById(ending)?.boss ?? 'primordial'} size={size} />
}

/**
 * The end of a winning run (EXPANSION.md B2, Q4a): after the first Neutral
 * win, the visions of the four gods and the recipes scene play first (story
 * scenes, `onScene` records each and awards "Remembering"), then the path's
 * ending card. Click or Enter moves on; `onDone` opens the summary.
 */
export default function EndingCards({ ending, visions = false, onDone, onScene }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  // The story scenes still to play before the card.
  const [scenes, setScenes] = useState(visions ? ['visions', 'recipes'] : [])
  const cards = [
    ...[endingById(ending) ?? ENDINGS[0]].map((e) => ({
      key: e.id,
      label: t('elementa.ending.label'),
      title: e.name[lang],
      text: e.text[lang],
      color: e.color,
      art: <EndingArt ending={e.id} />,
    })),
  ]
  const [index, setIndex] = useState(0)
  const last = index === cards.length - 1

  function next() {
    playClick()
    if (last) onDone()
    else setIndex((i) => i + 1)
  }

  useEffect(() => {
    function onKey(e) {
      if (scenes.length > 0 || (e.key !== 'Enter' && e.key !== ' ')) return
      e.preventDefault()
      next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const card = cards[index]
  if (scenes.length > 0) {
    return (
      <StoryScene
        key={scenes[0]}
        id={scenes[0]}
        onDone={() => {
          onScene?.(scenes[0])
          setScenes((list) => list.slice(1))
        }}
      />
    )
  }
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={card.key}
          initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
          className="flex w-full justify-center"
        >
          <EndingCard {...card} />
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-3">
        {cards.map((c, i) => (
          <span key={c.key} className="h-2.5 w-2.5" style={{ background: i <= index ? c.color : 'var(--stone-0)', boxShadow: '0 0 0 2px var(--ink)' }} />
        ))}
      </div>
      <button type="button" onClick={next} className="el-btn el-btn--gold el-btn--lg min-w-[220px]">
        {last ? t('elementa.ending.summary') : t('elementa.ending.next')}
        <span className="el-key">Enter</span>
      </button>
    </div>
  )
}
