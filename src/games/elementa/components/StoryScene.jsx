import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { playClick } from '../utils/sound.js'
import { sceneById } from '../data/story.js'
import { ELEMENTS } from '../data/elements.js'
import BossAvatar from './BossAvatar.jsx'
import KeeperSprite from './KeeperSprite.jsx'
import PixelIcon from './PixelIcon.jsx'
import { Pip } from './Tutorial.jsx'

// How fast lines type in, in characters per second.
const TYPE_RATE = 70

function Portrait({ portrait, color }) {
  if (!portrait) return null
  if (portrait.kind === 'boss') return <BossAvatar id={portrait.id} size={112} />
  if (portrait.kind === 'keeper') return <KeeperSprite id={portrait.id} size={112} />
  if (portrait.kind === 'pip') return <Pip size={96} />
  return <PixelIcon name={portrait.id} size={96} color={ELEMENTS[portrait.id]?.color ?? color} hi="#fffaf0" />
}

/**
 * A story scene (EXPANSION.md G Q4a, H7): a tinted full-screen backdrop, a
 * portrait, and a few lines that type in, page by page. Click or Enter
 * finishes the typing, then moves on; Skip (or Esc) ends the scene. Reduced
 * motion shows every line at once. `onDone(skipped)` closes it.
 */
export default function StoryScene({ id, onDone }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const scene = sceneById(id)
  const [pageIndex, setPageIndex] = useState(0)
  const [shown, setShown] = useState(0)
  const page = scene?.pages[pageIndex]
  const text = page ? page.lines.map((l) => l[lang] ?? l.en) : []
  const total = text.reduce((n, line) => n + line.length, 0)
  const typing = !reducedMotion && shown < total
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  // Type the page in.
  useEffect(() => {
    setShown(reducedMotion ? Infinity : 0)
  }, [pageIndex, id, reducedMotion])
  useEffect(() => {
    if (!typing) return
    const id = setInterval(() => setShown((n) => n + Math.ceil(TYPE_RATE / 20)), 50)
    return () => clearInterval(id)
  }, [typing])

  function next() {
    if (!scene) return
    playClick()
    if (typing) return setShown(Infinity)
    if (pageIndex < scene.pages.length - 1) setPageIndex((i) => i + 1)
    else doneRef.current(false)
  }

  function skip() {
    playClick()
    doneRef.current(true)
  }

  // Enter or Space moves on, Esc skips. Captured, so the table and the pause
  // menu underneath never see them.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        e.preventDefault()
        skip()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.stopImmediatePropagation()
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  })

  const root = typeof document !== 'undefined' ? document.querySelector('.elementa-root') : null
  if (!scene || !root) return null

  // How much of each line has typed in so far.
  let budget = shown
  const lines = text.map((line) => {
    const part = line.slice(0, Math.max(0, budget))
    budget -= line.length
    return part
  })

  return createPortal(
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: `radial-gradient(ellipse at center, ${scene.color}38 0%, transparent 62%), #07050cf5` }}
      onClick={next}
      role="dialog"
      aria-modal="true"
      aria-label={scene.title[lang]}
    >
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center" onClick={(e) => e.stopPropagation()}>
        <span className="el-label" style={{ color: scene.color }}>
          {scene.title[lang]}
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={pageIndex}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex w-full flex-col items-center gap-5"
          >
            <span className="flex h-32 items-center justify-center" style={{ filter: `drop-shadow(0 0 22px ${scene.color}88)` }}>
              <Portrait portrait={page.portrait} color={scene.color} />
            </span>
            <span className="pixel-heading text-sm" style={{ color: scene.color }}>
              {page.speaker[lang]}
            </span>
            <div
              className="el-panel flex min-h-[9rem] w-full flex-col gap-2 px-6 py-5 text-left"
              style={{ '--edge': scene.color }}
              onClick={next}
            >
              {lines.map((line, i) =>
                line ? (
                  <p key={i} className="text-lg leading-snug text-[var(--text)]">
                    {line}
                  </p>
                ) : null,
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        {scene.pages.length > 1 && (
          <div className="flex items-center gap-3">
            {scene.pages.map((_, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5"
                style={{ background: i <= pageIndex ? scene.color : 'var(--stone-0)', boxShadow: '0 0 0 2px var(--ink)' }}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={skip} className="el-btn el-btn--ghost">
            {t('elementa.story.skip')}
            <span className="el-key">Esc</span>
          </button>
          <button type="button" onClick={next} className="el-btn el-btn--gold el-btn--lg min-w-[200px]">
            {typing
              ? t('elementa.story.more')
              : pageIndex < scene.pages.length - 1
                ? t('elementa.story.next')
                : t('elementa.story.continue')}
            <span className="el-key">Enter</span>
          </button>
        </div>
      </div>
    </motion.div>,
    root,
  )
}
