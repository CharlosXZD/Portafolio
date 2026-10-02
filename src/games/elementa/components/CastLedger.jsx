import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { relicById } from '../data/relics.js'
import { reactionById } from '../data/reactions.js'
import { localize, RELICS_ES, localizeReaction } from '../data/i18n.js'
import { overkillShards } from '../engine/scoring.js'
import { dealById } from '../data/shops.js'
import { groupLines } from '../utils/ledgerGroups.js'

const SET_TIER_LABEL = {
  en: { pair: 'Pair', three: 'Three of a kind', straight: 'Straight' },
  es: { pair: 'Par', three: 'Trío', straight: 'Escalera' },
}

function fmt(n) {
  return Math.round(n * 100) / 100
}

export function useLineLabel(discovered) {
  const { t, lang } = useLanguage()
  return (line) => {
    if (line.kind === 'dice') return t('elementa.cast.dice')
    if (line.kind === 'explosions') return `${t('elementa.cast.explosions')} x${line.count}`
    if (line.kind === 'set') return SET_TIER_LABEL[lang][line.tier] ?? line.tier
    if (line.kind === 'reaction') {
      const r = reactionById(line.id)
      if (r.secret && discovered && !discovered.has(r.id)) return '???'
      return localizeReaction(r, lang).name
    }
    if (line.kind === 'boon') return dealById(line.id)?.name[lang] ?? '?'
    if (line.kind === 'relic') {
      const relic = relicById(line.id)
      return relic ? localize(lang, relic.name, RELICS_ES, relic.id, 'name') : t('elementa.cast.boss')
    }
    return '?'
  }
}

function Line({ label, value, op, state, color, count = 0, toggle = null, nested = false }) {
  // state: 'idle' | 'pending' | 'active' | 'done'
  return (
    <motion.li
      animate={{
        opacity: state === 'pending' ? 0.3 : 1,
        x: state === 'active' ? 4 : 0,
      }}
      transition={{ duration: 0.15 }}
      className={`flex items-center justify-between gap-3 text-base leading-tight ${nested ? 'pl-4 text-[var(--text-dim)]' : ''}`}
      style={{ color: state === 'active' ? 'var(--gold-hi)' : undefined }}
    >
      <span className="flex items-center gap-2 truncate">
        {toggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle.onClick()
            }}
            aria-expanded={toggle.open}
            aria-label={toggle.label}
            title={toggle.label}
            className="-ml-1 flex h-4 w-4 shrink-0 items-center justify-center text-[var(--text-mute)] hover:text-[var(--gold-hi)]"
          >
            <svg width={7} height={7} viewBox="0 0 5 5" shapeRendering="crispEdges" aria-hidden>
              {(toggle.open ? ['.....', '#####', '.###.', '..#..', '.....'] : ['.#...', '.##..', '.###.', '.##..', '.#...']).map((row, y) =>
                [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
              )}
            </svg>
          </button>
        )}
        {color && <span className="h-2 w-2 shrink-0" style={{ background: color, boxShadow: '0 0 0 1px var(--ink)' }} />}
        {label}
        {count > 1 && <span className="pixel-score text-[8px] text-[var(--text-mute)]">x{count}</span>}
      </span>
      <span className="pixel-score shrink-0 text-[9px]">
        {op === 'mul' ? 'x' : '+'}
        {fmt(value)}
      </span>
    </motion.li>
  )
}

/**
 * "Why is my score this number?" A running receipt of every source of Base
 * and Mult for the current roll, in the order they're applied. Repeated
 * lines from one source are grouped ("Kindle x6 +6") with an arrow to show
 * each one (EXPANSION.md P4). Idle, it's a live preview; during the cast
 * reveal, groups light up one at a time and their count ticks up, so the
 * player watches the math happen.
 */
export default function CastLedger({
  result,
  reveal,
  hidden,
  scoreHidden = false,
  target,
  open = true,
  onToggle,
  expanded = false,
  onToggleExpanded,
  discovered,
}) {
  const { t } = useLanguage()
  const label = useLineLabel(discovered)
  // Per-group overrides of the ledger-wide Expand all / Compact setting.
  const [overrides, setOverrides] = useState({})
  useEffect(() => setOverrides({}), [expanded])
  const baseGroups = useMemo(() => groupLines(result.baseLines, 'base'), [result])
  const multGroups = useMemo(() => groupLines(result.multLines, 'mult'), [result])

  const stepIndexOf = (section, lineIndex) =>
    reveal ? reveal.steps.findIndex((st) => st.section === section && st.index === lineIndex) : -1

  const groupState = (section, gi) => {
    if (!reveal) return 'idle'
    const step = reveal.steps[reveal.index]
    const pos = reveal.order.findIndex((o) => o.section === section && o.group === gi)
    const cur = step ? reveal.order.findIndex((o) => o.section === step.section && o.group === step.group) : Infinity
    if (pos < cur) return 'done'
    if (pos === cur) return 'active'
    return 'pending'
  }

  // The count and value a group shows while it is being added up: only the
  // lines applied so far plus the one being added now.
  const groupProgress = (g, state) => {
    if (state !== 'active') return { count: g.count, value: g.value }
    const upto = g.indices.filter((i) => stepIndexOf(g.section, i) <= reveal.index)
    const lines = upto.map((i) => g.lines[g.indices.indexOf(i)])
    return {
      count: lines.length,
      value: g.op === 'mul' ? lines.reduce((p, l) => p * l.value, 1) : lines.reduce((sum, l) => sum + l.value, 0),
    }
  }

  const lineState = (section, lineIndex) => {
    if (!reveal) return 'idle'
    const si = stepIndexOf(section, lineIndex)
    return si < reveal.index ? 'done' : si === reveal.index ? 'active' : 'pending'
  }

  const renderGroups = (groups, section) =>
    groups.flatMap((g, gi) => {
      const state = groupState(section, gi)
      const { count, value } = groupProgress(g, state)
      const isOpen = g.count > 1 && (overrides[g.key] ?? expanded)
      const color = g.kind === 'reaction' ? reactionById(g.id)?.color : null
      const rows = [
        <Line
          key={g.key}
          label={label(g.lines[0])}
          value={value}
          op={g.kind === 'dice' ? 'add' : g.op}
          state={state}
          color={color}
          count={count}
          toggle={
            g.count > 1
              ? {
                  open: isOpen,
                  label: isOpen ? t('elementa.cast.collapseGroup') : t('elementa.cast.expandGroup'),
                  onClick: () => setOverrides((o) => ({ ...o, [g.key]: !isOpen })),
                }
              : null
          }
        />,
      ]
      if (isOpen) {
        g.lines.forEach((line, k) =>
          rows.push(
            <Line
              key={`${g.key}#${k}`}
              nested
              label={label(line)}
              value={line.value}
              op={g.op}
              state={reveal && state === 'active' ? lineState(section, g.indices[k]) : state}
              color={color}
            />,
          ),
        )
      }
      return rows
    })

  const base = reveal ? reveal.base : result.baseValue
  const mult = reveal ? reveal.mult : result.multiplier
  const score = reveal ? Math.round(reveal.base * reveal.mult) : result.roundScore
  const diff = score - target
  const finished = reveal && reveal.index >= reveal.steps.length
  const canExpand = [...baseGroups, ...multGroups].some((g) => g.count > 1)

  return (
    <aside className="el-panel--dark el-panel flex w-full flex-col gap-4 p-4 lg:w-64">
      <div className="flex items-center justify-between gap-3">
        <h3 className="pixel-heading text-[10px] text-[var(--gold-hi)]">{t('elementa.cast.ledger')}</h3>
        {onToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="el-btn el-btn--sm"
            aria-expanded={open}
          >
            {open ? t('elementa.cast.hide') : t('elementa.cast.show')}
          </button>
        )}
      </div>
      {!open ? (
        !hidden && (
          <div className="flex flex-col gap-1">
            <span className="pixel-score text-[10px] text-[var(--gold-1)]">
              {fmt(base)} x {fmt(mult)} = {scoreHidden ? '?' : score}
            </span>
            {!scoreHidden && (
              <span className="text-sm" style={{ color: diff >= 0 ? 'var(--good)' : 'var(--text-dim)' }}>
                {diff >= 0 ? t('elementa.cast.clearsBy').replace('{n}', diff) : t('elementa.cast.shortBy').replace('{n}', -diff)}
              </span>
            )}
          </div>
        )
      ) : hidden ? (
        <p className="text-base text-[var(--text-mute)]">{t('elementa.cast.hidden')}</p>
      ) : (
        <>
          {canExpand && onToggleExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpanded()
              }}
              className="-mt-2 self-start text-sm text-[var(--text-mute)] underline decoration-dotted underline-offset-4 hover:text-[var(--gold-hi)]"
            >
              {expanded ? t('elementa.cast.compactAll') : t('elementa.cast.expandAll')}
            </button>
          )}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="el-label" style={{ color: '#6fa8ff' }}>
                {t('elementa.diceTray.base')}
              </span>
              <span className="pixel-score text-[10px] text-[#9fc4ff]">{fmt(base)}</span>
            </div>
            <ul className="flex flex-col gap-1.5">{renderGroups(baseGroups, 'base')}</ul>
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="el-label" style={{ color: '#ff8a7a' }}>
                {t('elementa.diceTray.mult')}
              </span>
              <span className="pixel-score text-[10px] text-[#ffb0a6]">{fmt(mult)}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              <Line label={t('elementa.cast.start')} value={1} op="add" state={reveal ? 'done' : 'idle'} />
              {renderGroups(multGroups, 'mult')}
            </ul>
          </section>

          <div className="flex flex-col gap-2 border-t-2 border-[var(--ink)] pt-3">
            <span className="el-label">{t('elementa.diceTray.score')}</span>
            <span className="pixel-score text-center text-xs leading-relaxed text-[var(--gold-1)]">
              {fmt(base)} x {fmt(mult)} = {scoreHidden ? '?' : score}
            </span>
            {!scoreHidden && (
              <>
                <div
                  className="pixel-score text-center text-[9px]"
                  style={{ color: diff >= 0 ? 'var(--good)' : finished ? 'var(--bad)' : 'var(--text-dim)' }}
                >
                  {diff >= 0
                    ? t('elementa.cast.clearsBy').replace('{n}', diff)
                    : t('elementa.cast.shortBy').replace('{n}', -diff)}
                </div>
                {overkillShards(score, target) > 0 && (
                  <div className="text-center text-sm text-[var(--gold-1)]">
                    {t('elementa.cast.overkill').replace('{n}', overkillShards(score, target))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
