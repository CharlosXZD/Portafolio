import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { TUTORIAL_GROUPS } from '../data/tutorial.js'
import { readTutorial, markTutorialSeen, turnTutorialOff } from '../utils/tutorial.js'
import { playClick } from '../utils/sound.js'

// Pip, the guide: a small arcane wisp, 14x14, with a blink frame.
const PIP_OPEN = [
  '......k.......',
  '.....kck......',
  '.....kcak.....',
  '....kcaak.....',
  '...kkcaaakk...',
  '..kcaaaaaaak..',
  '.kcaaaaaaaaabk',
  '.kaawaaaawaabk',
  '.kaaeaaaaeaabk',
  '.kaaaaaaaaaabk',
  '.kaaaaddaaaabk',
  '..kbaaaaaabk..',
  '...kbbbbbbk...',
  '....kkkkkk....',
]
const PIP_BLINK = PIP_OPEN.map((row, y) =>
  y === 7 ? '.kaaaaaaaaaabk' : y === 8 ? '.kaadaaaadaabk' : row,
)
const PIP_PALETTE = {
  k: '#120c1a',
  a: '#8f6bff',
  b: '#5a41c0',
  c: '#ffd166',
  w: '#ffffff',
  e: '#120c1a',
  d: '#2a1a55',
}

export function Pip({ size = 70 }) {
  const { reducedMotion } = useGameSettings()
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 140)
    }, 2800)
    return () => clearInterval(id)
  }, [reducedMotion])

  const rows = blink ? PIP_BLINK : PIP_OPEN
  const rects = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = PIP_PALETTE[row[x]]
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />)
    }
  })
  return (
    <motion.svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'drop-shadow(0 0 12px #8f6bff99)' }}
    >
      {rects}
    </motion.svg>
  )
}

/** Tracks an element's on-screen rect while a step points at it. */
function useTargetRect(target) {
  const [rect, setRect] = useState(null)
  useEffect(() => {
    if (!target) {
      setRect(null)
      return
    }
    const el = document.querySelector(`[data-tut="${target}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    function measure() {
      const node = document.querySelector(`[data-tut="${target}"]`)
      if (!node) return setRect(null)
      const r = node.getBoundingClientRect()
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    measure()
    const id = setInterval(measure, 150)
    window.addEventListener('resize', measure)
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', measure)
    }
  }, [target])
  return rect
}

/**
 * Shows Pip's first-time explanations over the game. Picks the first
 * unseen tutorial group relevant to the current state, walks its steps,
 * and blocks game input (clicks and hotkeys) while open. `onActiveChange`
 * lets the parent pause the dice tray's keyboard shortcuts.
 */
export default function Tutorial({ state, onActiveChange, paused = false }) {
  const { t, lang } = useLanguage()
  const [progress, setProgress] = useState(readTutorial)
  const [active, setActive] = useState(null) // { group, index }

  // Pick a group when the game reaches a new situation. Checked after a
  // short delay so newly mounted screens (and their data-tut targets) exist.
  useEffect(() => {
    if (active || paused || progress.off) return
    const id = setTimeout(() => {
      const group = TUTORIAL_GROUPS.find((g) => !progress.seen.includes(g.id) && g.when(state))
      if (group) setActive({ group, index: 0 })
    }, 700)
    return () => clearTimeout(id)
  }, [state, active, paused, progress])

  useEffect(() => {
    onActiveChange?.(Boolean(active))
  }, [active, onActiveChange])

  const step = active ? active.group.steps[active.index] : null
  const rect = useTargetRect(step?.target ?? null)

  function finishGroup() {
    markTutorialSeen(active.group.id)
    setProgress(readTutorial())
    setActive(null)
  }

  function next() {
    playClick()
    if (active.index + 1 < active.group.steps.length) setActive({ ...active, index: active.index + 1 })
    else finishGroup()
  }

  function skipAll() {
    playClick()
    turnTutorialOff()
    setProgress(readTutorial())
    setActive(null)
  }

  // While Pip is talking, the keyboard belongs to the tutorial: Enter/Space
  // advance, Escape closes this group, and nothing reaches the game.
  useEffect(() => {
    if (!active) return
    function onKey(e) {
      e.stopImmediatePropagation()
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'Escape') {
        finishGroup()
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const pad = 10
  // Keep the bubble out of the spotlight: if the target sits in the lower
  // half of the screen, Pip talks from the top instead.
  const lowTarget = rect ? rect.y + rect.h / 2 > window.innerHeight * 0.55 : false
  const last = active && active.index === active.group.steps.length - 1

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="tutorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label={t('elementa.tutorial.label')}
        >
          {/* Spotlight: a hole over the target, everything else dimmed. */}
          {rect ? (
            <motion.div
              className="pointer-events-none absolute"
              animate={{ left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2 }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
              style={{
                boxShadow: '0 0 0 9999px rgba(7,5,12,0.72), 0 0 0 3px #ffd166, 0 0 24px 4px #ffd16688',
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#07050c]/70" />
          )}

          <div
            className={`absolute inset-x-4 flex gap-3 sm:left-8 sm:right-auto sm:max-w-xl ${
              lowTarget ? 'top-4 items-start sm:top-8' : 'bottom-4 items-end sm:bottom-8'
            }`}
          >
            <div className="shrink-0">
              <Pip size={70} />
            </div>
            <motion.div
              key={`${active.group.id}-${active.index}`}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
              className="el-panel flex flex-1 flex-col gap-4 p-4"
              style={{ '--edge': '#ffd166' }}
            >
              <div className="flex items-center justify-between">
                <span className="pixel-heading text-[10px] text-[var(--gold-1)]">Pip</span>
                {active.group.steps.length > 1 && (
                  <span className="pixel-score text-[8px] text-[var(--text-mute)]">
                    {active.index + 1}/{active.group.steps.length}
                  </span>
                )}
              </div>
              <p className="text-lg leading-snug text-[var(--text)]">{step.text[lang] ?? step.text.en}</p>
              <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={skipAll} className="el-btn el-btn--ghost el-btn--sm">
                  {t('elementa.tutorial.skip')}
                </button>
                <button type="button" onClick={next} className="el-btn el-btn--gold el-btn--sm">
                  {last ? t('elementa.tutorial.gotIt') : t('elementa.tutorial.next')}
                  <span className="el-key">Enter</span>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
