import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { playClick, playLand } from '../utils/sound.js'
import { runeById, runesOf, faceCap } from '../data/runes.js'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import { ELEMENTS } from '../data/elements.js'
import DieToken from './DieToken.jsx'

// Dragging the die this many pixels turns it by one number.
const DRAG_STEP = 28

/**
 * The Inscribe screen (EXPANSION.md K3b): the die shown large, turned to the
 * number a rune will sit on. Arrow buttons, the left and right keys, or a
 * drag turn it; big dice (d30 and up) also get a stepper (one and ten at a
 * time). Faces that already hold a rune are marked, and the line under the
 * die says whether the rune will replace one or stack (a Gem Socket).
 * Reduced motion fades instead of spinning.
 *
 * `die` is the die that receives the rune, `runeId` the rune, or, for a
 * Graft (K6), `choices` the source die's runes to pick from. `onConfirm`
 * gets `{ face, runeIndex }`.
 */
export default function InscribeScreen({ die, runeId = null, choices = null, onConfirm, onCancel }) {
  const { t, lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const [face, setFace] = useState(die.sides)
  const [turn, setTurn] = useState(0)
  const [pick, setPick] = useState(0)
  const drag = useRef(null)
  const rune = runeById(choices ? choices[pick]?.id : runeId)
  const existing = runesOf(die)
  const onFace = existing.filter((r) => r.face === face)
  const stacks = onFace.length > 0 && onFace.length < faceCap(die)
  const big = die.sides >= 30

  function go(delta) {
    const next = ((face - 1 + delta) % die.sides + die.sides) % die.sides + 1
    setFace(next)
    setTurn((v) => v + Math.sign(delta))
    playLand(Math.min(die.sides, 20))
  }

  function confirm() {
    playClick()
    onConfirm({ face, runeIndex: pick })
  }

  // Left and right turn the die, Enter confirms, Esc cancels. Captured, so
  // nothing underneath reacts.
  useEffect(() => {
    function onKey(e) {
      const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }
      if (keys[e.key]) go(keys[e.key])
      else if (e.key === 'Enter') confirm()
      else if (e.key === 'Escape') onCancel()
      else return
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  })

  const root = document.querySelector('.elementa-root')
  if (!root || !rune) return null
  const dieName = localize(lang, ELEMENTS[die.elementId].name, ELEMENTS_ES, die.elementId, 'name')

  return createPortal(
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[#07050ce6] px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('elementa.inscribe.title')}
      onClick={onCancel}
    >
      <div className="el-panel flex w-full max-w-lg flex-col items-center gap-5 px-6 py-7 text-center" style={{ '--edge': rune.color }} onClick={(e) => e.stopPropagation()}>
        <span className="el-label" style={{ color: rune.color }}>
          {t('elementa.inscribe.title')}
        </span>
        <h2 className="pixel-heading text-sm" style={{ color: rune.color }}>
          {rune.name[lang]}
        </h2>
        {choices && choices.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            {choices.map((r, i) => (
              <button
                key={`${r.id}-${r.face}-${i}`}
                type="button"
                onClick={() => setPick(i)}
                className={`el-btn el-btn--sm ${pick === i ? 'el-btn--gold' : ''}`}
              >
                {runeById(r.id)?.name[lang]} {r.face}
              </button>
            ))}
          </div>
        )}
        <p className="text-base text-[var(--text-dim)]">{t('elementa.inscribe.hint').replace('{die}', `${dieName} d${die.sides}`)}</p>

        <div className="flex items-center gap-5">
          <button type="button" onClick={() => go(-1)} className="el-btn" aria-label={t('elementa.inscribe.prev')}>
            ◀
          </button>
          <div
            className="relative cursor-grab touch-none select-none"
            onPointerDown={(e) => {
              drag.current = { x: e.clientX }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              if (!drag.current) return
              const dx = e.clientX - drag.current.x
              if (Math.abs(dx) >= DRAG_STEP) {
                go(dx > 0 ? 1 : -1)
                drag.current = { x: e.clientX }
              }
            }}
            onPointerUp={() => (drag.current = null)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={face}
                className="block"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: turn > 0 ? -70 : 70 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: turn > 0 ? 70 : -70 }}
                transition={{ duration: reducedMotion ? 0.12 : 0.18 }}
                style={{ transformPerspective: 500 }}
              >
                <DieToken die={{ ...die, runes: [] }} size={150} face={face} />
              </motion.span>
            </AnimatePresence>
          </div>
          <button type="button" onClick={() => go(1)} className="el-btn" aria-label={t('elementa.inscribe.next')}>
            ▶
          </button>
        </div>

        {big && (
          <div className="flex items-center gap-2">
            {[-10, -1, 1, 10].map((d) => (
              <button key={d} type="button" onClick={() => go(d)} className="el-btn el-btn--sm">
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
        )}

        {/* Every number, with a mark on the ones that already hold a rune. */}
        <div className="flex max-w-full flex-wrap justify-center gap-1">
          {Array.from({ length: die.sides }, (_, i) => i + 1).map((n) => {
            const marked = existing.filter((r) => r.face === n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setTurn(n > face ? 1 : -1)
                  setFace(n)
                }}
                className="pixel-score relative h-7 min-w-[1.75rem] px-1 text-[9px]"
                style={{
                  background: n === face ? rune.color : 'var(--stone-0)',
                  color: n === face ? 'var(--ink)' : 'var(--text-dim)',
                  boxShadow: '0 0 0 2px var(--ink)',
                }}
                aria-pressed={n === face}
              >
                {n}
                {marked.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex gap-px">
                    {marked.map((r, k) => (
                      <span key={k} className="h-2 w-2" style={{ background: runeById(r.id)?.color, boxShadow: '0 0 0 1px var(--ink)' }} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <p className="min-h-[1.5rem] text-sm" style={{ color: onFace.length ? '#ffd166' : 'var(--text-mute)' }}>
          {onFace.length === 0
            ? t('elementa.inscribe.free').replace('{n}', face)
            : stacks
              ? t('elementa.inscribe.stack').replace('{rune}', runeById(onFace[0].id)?.name[lang] ?? '')
              : t('elementa.inscribe.replace').replace('{rune}', runeById(onFace[0].id)?.name[lang] ?? '')}
        </p>

        <div className="flex gap-4">
          <button type="button" onClick={onCancel} className="el-btn el-btn--ghost">
            {t('elementa.shop.cancel')}
            <span className="el-key">Esc</span>
          </button>
          <button type="button" onClick={confirm} className="el-btn el-btn--gold el-btn--lg">
            {t('elementa.inscribe.confirm').replace('{n}', face)}
            <span className="el-key">Enter</span>
          </button>
        </div>
      </div>
    </div>,
    root,
  )
}
