import { useEffect, useMemo, useRef, useState } from 'react'
import { Reorder, motion, useReducedMotion } from 'framer-motion'
import '../../games/elementa/elementa.css'
import DieToken from '../../games/elementa/components/DieToken.jsx'
import { evaluatePool } from '../../games/elementa/engine/scoring.js'
import { reactionById } from '../../games/elementa/data/reactions.js'
import { localizeReaction } from '../../games/elementa/data/i18n.js'
import { ELEMENTS } from '../../games/elementa/data/elements.js'
import { GameSettingsProvider } from '../../games/elementa/utils/gameSettingsContext.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

/*
 * A small, playable piece of Elementa for the portfolio page. It uses the game's real
 * dice sprites and its real scoring engine (evaluatePool), so the numbers are exactly what
 * the game would give for this row. Drag the dice and the neighbors react.
 */

const mk = (id, elementId, value) => ({
  id,
  elementId,
  sides: 6,
  tierId: 'd6',
  value,
  total: value,
  explosions: 0,
  held: false,
  locked: false,
})

const START = [
  mk(1, 'fire', 5),
  mk(2, 'earth', 4),
  mk(3, 'water', 6),
  mk(4, 'air', 3),
  mk(5, 'fire', 2),
  mk(6, 'water', 3),
]

// The order that scores lowest, and the one that scores highest (found by trying every order)
const WORST = [1, 5, 2, 4, 3, 6]
const BEST = [4, 5, 6, 1, 3, 2]

const L = {
  en: {
    base: 'Base',
    mult: 'Mult',
    score: 'Score',
    drag: 'Drag the dice to reorder them',
    best: 'Best order',
    worst: 'Worst order',
    reset: 'Reset',
    dice: 'Dice',
    straight: 'Straight',
    pair: 'Pair',
    three: 'Three of a kind',
    sameDice: 'The same six dice.',
    range: (lo, hi) => `Anywhere from ${lo} to ${hi}, depending only on the order.`,
    ledger: 'Why this score',
  },
  es: {
    base: 'Base',
    mult: 'Mult',
    score: 'Puntaje',
    drag: 'Arrastra los dados para reordenarlos',
    best: 'Mejor orden',
    worst: 'Peor orden',
    reset: 'Reiniciar',
    dice: 'Dados',
    straight: 'Escalera',
    pair: 'Par',
    three: 'Trío',
    sameDice: 'Los mismos seis dados.',
    range: (lo, hi) => `Entre ${lo} y ${hi}, solo según el orden.`,
    ledger: 'Por qué este puntaje',
  },
}

const fmt = (n) => Math.round(n * 100) / 100

function permutations(a) {
  if (a.length < 2) return [a]
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]))
}

function Num({ value, className = '', color }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.18, y: -2 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.35, duration: 0.4 }}
      className={`pixel-score inline-block tabular-nums ${className}`}
      style={{ color }}
    >
      {value}
    </motion.span>
  )
}

function Table() {
  const { lang } = useLanguage()
  const t = L[lang] ?? L.en
  const reduce = useReducedMotion()
  const [order, setOrder] = useState(START)
  const wrapRef = useRef(null)
  const [slot, setSlot] = useState(96)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSlot(Math.max(44, Math.min(150, Math.floor(entry.contentRect.width / START.length))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const result = useMemo(() => evaluatePool(order, [], {}), [order])

  // The full range of what these six dice can score, computed once with the real engine
  const range = useMemo(() => {
    const scores = permutations(START).map((p) => evaluatePool(p, [], {}).roundScore)
    return [Math.min(...scores), Math.max(...scores)]
  }, [])

  const byId = (ids) => ids.map((id) => START.find((d) => d.id === id))
  const dieSize = Math.round(slot * 0.92)

  // Group the ledger by what produced it
  const nameOf = (line) => {
    if (line.kind === 'dice') return t.dice
    if (line.kind === 'set') return t[line.tier] ?? line.tier
    if (line.kind === 'reaction') {
      const r = reactionById(line.id)
      return r ? localizeReaction(r, lang).name : line.id
    }
    return line.kind
  }
  const rows = [
    ...result.baseLines.filter((l) => l.value).map((l) => ({ name: nameOf(l), text: `+${fmt(l.value)} ${t.base}`, kind: 'base' })),
    ...result.multLines.filter((l) => l.value).map((l) => ({ name: nameOf(l), text: `+${fmt(l.value)} ${t.mult}`, kind: 'mult' })),
  ]

  return (
    <div className="elementa-root w-full !min-h-0 overflow-hidden rounded-[1.75rem] bg-[#0d0a18] p-5 ring-1 ring-white/10 sm:p-8">
      {/* score */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-end gap-3 sm:gap-5">
          <div className="text-center">
            <p className="text-[10px] tracking-widest text-white/50 uppercase">{t.base}</p>
            <div className="mt-1 rounded-md bg-[#2f5fd0] px-3 py-2 text-xl sm:px-4 sm:text-3xl">
              <Num value={fmt(result.baseValue)} className="text-white" />
            </div>
          </div>
          <span className="pb-3 text-xl text-white/50 sm:pb-4">×</span>
          <div className="text-center">
            <p className="text-[10px] tracking-widest text-white/50 uppercase">{t.mult}</p>
            <div className="mt-1 rounded-md bg-[#d2452f] px-3 py-2 text-xl sm:px-4 sm:text-3xl">
              <Num value={fmt(result.multiplier)} className="text-white" />
            </div>
          </div>
          <span className="pb-3 text-xl text-white/50 sm:pb-4">=</span>
          <div className="text-center">
            <p className="text-[10px] tracking-widest text-white/50 uppercase">{t.score}</p>
            <div className="mt-1 px-1 py-2 text-3xl sm:text-5xl">
              <Num value={Math.round(result.roundScore)} className="text-[#ffc94d]" />
            </div>
          </div>
        </div>
        <div className="max-w-xs text-sm text-white/70">
          <p className="font-medium text-white">{t.sameDice}</p>
          <p>{t.range(range[0], range[1])}</p>
        </div>
      </div>

      {/* the row */}
      <div ref={wrapRef} className="mt-8 w-full select-none">
      <div className="relative mx-auto" style={{ width: slot * START.length }}>
        {/* reaction links in the gaps */}
        <div className="pointer-events-none absolute inset-x-0 -top-1 h-6" aria-hidden="true">
          {result.reactions.map((r, i) => {
            const def = reactionById(r.id)
            return (
              <motion.span
                key={`${r.id}-${r.a}-${r.b}`}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: i * 0.03 }}
                className="absolute -translate-x-1/2 rounded-full bg-[#ffc94d] px-2 py-0.5 text-[9px] font-semibold tracking-wide whitespace-nowrap text-[#2a1d05] uppercase sm:text-[10px]"
                style={{ left: (Math.min(r.a, r.b) + 1) * slot }}
              >
                {def ? localizeReaction(def, lang).name : r.id}
              </motion.span>
            )
          })}
        </div>

        <Reorder.Group
          axis="x"
          values={order}
          onReorder={setOrder}
          className="mt-7 flex w-full list-none p-0"
          style={{ height: slot + 24 }}
        >
          {order.map((d) => (
            <Reorder.Item
              key={d.id}
              value={d}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              whileDrag={{ scale: 1.08, zIndex: 20, cursor: 'grabbing' }}
              className="flex shrink-0 cursor-grab items-center justify-center"
              style={{ width: slot, height: slot + 24 }}
              aria-label={`${ELEMENTS[d.elementId].name} ${d.value}`}
            >
              <DieToken die={d} size={dieSize} face={d.value} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-white/50">{t.drag}</p>
        <div className="flex gap-2">
          {[
            [t.worst, () => setOrder(byId(WORST))],
            [t.best, () => setOrder(byId(BEST))],
            [t.reset, () => setOrder(START)],
          ].map(([label, fn]) => (
            <button
              key={label}
              type="button"
              onClick={fn}
              className="pressable rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* the ledger */}
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-eyebrow text-white/50">{t.ledger}</p>
        <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
          {rows.map((r, i) => (
            <li key={i} className="flex items-baseline justify-between gap-4 text-white/80">
              <span>{r.name}</span>
              <span className={`tabular-nums ${r.kind === 'base' ? 'text-[#7fa8ff]' : 'text-[#ff8a75]'}`}>{r.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function ElementaTable() {
  return (
    <GameSettingsProvider>
      <Table />
    </GameSettingsProvider>
  )
}
