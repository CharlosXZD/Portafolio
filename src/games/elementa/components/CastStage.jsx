import { useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { ELEMENTS } from '../data/elements.js'
import { reactionById } from '../data/reactions.js'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import { useLineLabel } from './CastLedger.jsx'

// The cast's choreography (EXPANSION.md Q5, Balatro style). Every step of
// the cast script (utils/castScript.js) does four things together: the
// source lights up (Die.jsx lifts it; this overlay draws a reaction's line
// between its two dice, or outlines a set), a number pops from the source
// and flies into the Base or Mult box, the box reacts (DiceTray.jsx
// ScoreBox), and a caption names who is doing what. This file is the
// overlay and the caption; both read positions off the page, so they follow
// wherever the dice, relics and boxes happen to be.

const BASE_COLOR = '#6fa8ff'
const MULT_COLOR = '#ff6a55'
const fmt = (n) => Math.round(n * 100) / 100

const centerOf = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

/** "+7", "+1.5" or "x1.5": what a step adds. */
export const stepValueText = (step) => `${step.op === 'mul' ? 'x' : '+'}${fmt(step.total)}`

/**
 * One line saying who is doing what: { who, detail, effect }, for example
 * "Kindle", "Fire + Air", "+1 Mult". A group of reactions drops the dice and
 * shows its count instead ("Kindle x3").
 */
export function useStepCaption(discovered) {
  const { t, lang } = useLanguage()
  const label = useLineLabel(discovered)
  const dieName = (d) => localize(lang, ELEMENTS[d.elementId].name, ELEMENTS_ES, d.elementId, 'name')
  return (step, dice) => {
    const unit = t(step.section === 'base' ? 'elementa.diceTray.base' : 'elementa.diceTray.mult')
    const effect = `${stepValueText(step)} ${unit}`
    if (step.kind === 'die') return { who: dieName(dice[step.dieIndex]), effect }
    const first = step.lines[0]
    let who = label(first)
    if (step.kind === 'reaction' || step.kind === 'relic' || step.kind === 'boon') {
      if (step.count > 1) who = `${who} x${step.count}`
    }
    let detail = null
    if (step.kind === 'reaction' && step.count === 1 && first.dice) detail = first.dice.map((i) => dieName(dice[i])).join(' + ')
    // The explosions line already carries its own count ("Explosions x3").
    return { who, detail, effect }
  }
}

/** The caption under the score: who, what they touch, what they add. */
export function CastCaption({ caption, stepKey, section }) {
  const { reducedMotion } = useGameSettings()
  return (
    <div className="flex h-7 items-center justify-center" aria-live="polite">
      {caption && (
        <motion.div
          key={stepKey}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="pixel-score flex items-center gap-2 text-[10px] leading-none"
          style={{ textShadow: '2px 2px 0 var(--ink)' }}
        >
          <span className="text-[var(--text)]">{caption.who}:</span>
          {caption.detail && <span className="text-[var(--text-dim)]">{caption.detail},</span>}
          <span style={{ color: section === 'base' ? BASE_COLOR : MULT_COLOR }}>{caption.effect}</span>
        </motion.div>
      )}
    </div>
  )
}

/** Where a step comes from on the page: its dice, its relic or pact icon. */
function findSource(step) {
  const q = (sel) => document.querySelector(sel)
  const dieRects = step.lit.map((i) => q(`[data-die-index="${i}"] button`)?.getBoundingClientRect()).filter(Boolean)
  if (step.kind === 'relic' || step.kind === 'boon') {
    const el = q(step.kind === 'relic' ? `[data-relic-id="${step.id}"]` : `[data-boon-id="${step.id}"]`)
    if (el) return centerOf(el.getBoundingClientRect())
  }
  if (dieRects.length) {
    const cs = dieRects.map(centerOf)
    return { x: cs.reduce((s, c) => s + c.x, 0) / cs.length, y: Math.min(...dieRects.map((r) => r.top)) }
  }
  // A relic with no icon on screen, or a line with no dice: the dice row.
  const row = [...document.querySelectorAll('[data-die-index] button')].map((b) => b.getBoundingClientRect())
  if (row.length) return { x: (row[0].left + row[row.length - 1].right) / 2, y: row[0].top }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

/**
 * The overlay for the step being shown: reaction lines between dice, a set's
 * outline and name, and the number that pops and flies into its box. Fixed to
 * the viewport and outside the shaking table. `dwell` is how long the step
 * lasts in ms (the scoring speed), `setLabel` the set's name.
 */
export default function CastStage({ step, dwell, setLabel }) {
  const { reducedMotion } = useGameSettings()
  const [geo, setGeo] = useState(null)

  useLayoutEffect(() => {
    const dice = step.lit.map((i) => document.querySelector(`[data-die-index="${i}"] button`)?.getBoundingClientRect()).filter(Boolean)
    const rectOf = (i) => document.querySelector(`[data-die-index="${i}"] button`)?.getBoundingClientRect()
    const box = document.querySelector(`[data-score-box="${step.section}"]`)?.getBoundingClientRect()
    setGeo({
      from: findSource(step),
      to: box ? centerOf(box) : { x: window.innerWidth / 2, y: 80 },
      outlines: step.kind === 'set' ? dice : [],
      links: step.links.map(([a, b]) => [rectOf(a), rectOf(b)]).filter(([ra, rb]) => ra && rb),
    })
  }, [step])

  if (!geo) return null
  const isBase = step.section === 'base'
  const color = isBase ? BASE_COLOR : MULT_COLOR
  const mul = step.op === 'mul'
  const zero = step.total === 0 && !mul
  // The pop takes the first 40% of the step, the flight the rest.
  const pop = 0.4
  const sec = Math.max(0.15, (dwell / 1000) * 0.92)
  const reaction = step.kind === 'reaction' ? reactionById(step.id)?.color ?? '#ffffff' : null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {geo.links.map(([ra, rb], i) => {
          const a = centerOf(ra)
          const b = centerOf(rb)
          const adjacent = Math.abs(a.x - b.x) < Math.max(ra.width, rb.width) * 1.9
          const d = adjacent
            ? `M ${ra.right} ${a.y} L ${rb.left} ${b.y}`
            : `M ${a.x} ${ra.top} Q ${(a.x + b.x) / 2} ${Math.min(ra.top, rb.top) - 60} ${b.x} ${rb.top}`
          return (
            <g key={i}>
              <motion.path
                d={d}
                fill="none"
                stroke="#0a0710"
                strokeWidth={9}
                strokeLinecap="square"
                initial={{ pathLength: reducedMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.18 }}
              />
              <motion.path
                d={d}
                fill="none"
                stroke={reaction}
                strokeWidth={5}
                strokeLinecap="square"
                style={{ filter: `drop-shadow(0 0 6px ${reaction})` }}
                initial={{ pathLength: reducedMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.18 }}
              />
            </g>
          )
        })}
        {geo.outlines.map((r, i) => (
          <rect
            key={i}
            x={r.left - 7}
            y={r.top - 7}
            width={r.width + 14}
            height={r.height + 14}
            fill="none"
            stroke="#ffd166"
            strokeWidth={4}
            strokeDasharray="10 6"
            style={{ filter: 'drop-shadow(0 0 5px #ffd166)' }}
          />
        ))}
      </svg>
      {geo.outlines.length > 0 && setLabel && (
        <span
          className="el-chip absolute whitespace-nowrap bg-[#ffd166] text-[var(--ink)]"
          style={{ left: Math.min(...geo.outlines.map((r) => r.left)) - 7, top: Math.min(...geo.outlines.map((r) => r.top)) - 34 }}
        >
          {setLabel}
        </span>
      )}
      {/* The number: pops at its source, then flies into its box. */}
      <motion.span
        className="pixel-score absolute left-0 top-0 whitespace-nowrap"
        style={{
          color,
          fontSize: mul ? 30 : 20,
          opacity: zero ? 0.6 : 1,
          textShadow: `3px 3px 0 var(--ink), -2px 0 0 var(--ink), 0 -2px 0 var(--ink)${mul ? `, 0 0 14px ${color}` : ''}`,
        }}
        initial={{ x: geo.from.x, y: geo.from.y, scale: 0.4, opacity: 0 }}
        animate={
          reducedMotion || zero
            ? { x: geo.from.x, y: [geo.from.y, geo.from.y - 26], scale: 1, opacity: [0, 1, 1, 0] }
            : {
                x: [geo.from.x, geo.from.x, geo.to.x],
                y: [geo.from.y, geo.from.y - 34, geo.to.y],
                scale: [0.4, mul ? 1.7 : 1.3, 0.8],
                opacity: [0, 1, 1],
              }
        }
        transition={
          reducedMotion || zero
            ? { duration: sec, times: [0, 0.2, 0.75, 1], ease: 'easeOut' }
            : { duration: sec, times: [0, pop, 1], ease: ['easeOut', 'easeIn'] }
        }
      >
        <span className="block" style={{ transform: 'translate(-50%, -50%)' }}>
          {stepValueText(step)}
        </span>
      </motion.span>
    </div>
  )
}
