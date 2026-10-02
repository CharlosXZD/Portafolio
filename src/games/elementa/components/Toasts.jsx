import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { ACHIEVEMENTS, localizeAchievement } from '../data/achievements.js'
import { reactionById } from '../data/reactions.js'
import { localizeReaction } from '../data/i18n.js'
import { playSuccess } from '../utils/sound.js'
import PixelSprite from './PixelSprite.jsx'

function Toast({ item, onDone }) {
  const { t, lang } = useLanguage()
  useEffect(() => {
    playSuccess()
    const id = setTimeout(() => onDone(item.key), 4200)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let title
  let name
  let sprite
  if (item.kind === 'achievement') {
    const a = localizeAchievement(ACHIEVEMENTS.find((x) => x.id === item.id), lang)
    title = t('elementa.toast.achievement')
    name = a.name
    sprite = a.sprite
  } else {
    const r = localizeReaction(reactionById(item.id), lang)
    title = t('elementa.toast.secretReaction')
    name = r.name
    sprite = ['flask', r.color]
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
      className="el-panel flex w-72 items-center gap-3 p-3"
      style={{ '--edge': 'var(--gold-1)' }}
      role="status"
    >
      <span className="el-well flex h-12 w-12 shrink-0 items-center justify-center">
        <PixelSprite name={sprite[0]} color={sprite[1]} accent={sprite[2]} accent2={sprite[3]} size={36} />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="el-label text-[var(--gold-2)]">{title}</span>
        <span className="pixel-heading truncate text-[10px] text-[var(--text)]">{name}</span>
      </div>
    </motion.div>
  )
}

/** Stacked unlock notifications (achievements, secret reactions). */
export default function Toasts({ items, onDone }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-[70] flex flex-col-reverse gap-3">
      <AnimatePresence>
        {items.map((item) => (
          <Toast key={item.key} item={item} onDone={onDone} />
        ))}
      </AnimatePresence>
    </div>
  )
}
