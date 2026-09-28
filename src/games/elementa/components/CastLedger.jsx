import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { relicById } from '../data/relics.js'
import { reactionById } from '../data/reactions.js'
import { localize, RELICS_ES, localizeReaction } from '../data/i18n.js'
import { overkillShards } from '../engine/scoring.js'

const SET_TIER_LABEL = {
  en: { pair: 'Pair', three: 'Three of a kind', straight: 'Straight' },
  es: { pair: 'Par', three: 'Trío', straight: 'Escalera' },
}

function fmt(n) {
  return Math.round(n * 100) / 100
}

export function useLineLabel() {
  const { t, lang } = useLanguage()
  return (line) => {
    if (line.kind === 'dice') return t('elementa.cast.dice')
    if (line.kind === 'explosions') return `${t('elementa.cast.explosions')} x${line.count}`
    if (line.kind === 'set') return SET_TIER_LABEL[lang][line.tier] ?? line.tier
    if (line.kind === 'reaction') return localizeReaction(reactionById(line.id), lang).name
    if (line.kind === 'relic') {
      const relic = relicById(line.id)
      return relic ? localize(lang, relic.name, RELICS_ES, relic.id, 'name') : t('elementa.cast.boss')
    }
    return '?'
  }
}

function Line({ label, value, op, state, color }) {
  // state: 'idle' | 'pending' | 'active' | 'done'
  return (
    <motion.li
      animate={{
        opacity: state === 'pending' ? 0.3 : 1,
        x: state === 'active' ? 4 : 0,
      }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-between gap-3 text-base leading-tight"
      style={{ color: state === 'active' ? 'var(--gold-hi)' : undefined }}
    >
      <span className="flex items-center gap-2 truncate">
        {color && <span className="h-2 w-2 shrink-0" style={{ background: color, boxShadow: '0 0 0 1px var(--ink)' }} />}
        {label}
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
 * and Mult for the current roll, in the order they're applied. Idle, it's
 * a live preview; during the cast reveal, lines light up one at a time
 * (`activeStep` says which), so the player watches the math happen.
 */
export default function CastLedger({ result, reveal, hidden, target }) {
  const { t } = useLanguage()
  const label = useLineLabel()

  const lineState = (section, index) => {
    if (!reveal) return 'idle'
    const step = reveal.steps[reveal.index]
    const pos = reveal.order.findIndex((o) => o.section === section && o.index === index)
    const cur = step ? reveal.order.findIndex((o) => o.section === step.section && o.index === step.index) : Infinity
    if (pos < cur) return 'done'
    if (pos === cur) return 'active'
    return 'pending'
  }

  const base = reveal ? reveal.base : result.baseValue
  const mult = reveal ? reveal.mult : result.multiplier
  const score = reveal ? Math.round(reveal.base * reveal.mult) : result.roundScore
  const diff = score - target
  const finished = reveal && reveal.index >= reveal.steps.length

  return (
    <aside className="el-panel--dark el-panel flex w-full flex-col gap-4 p-4 lg:w-64">
      <h3 className="pixel-heading text-[10px] text-[var(--gold-hi)]">{t('elementa.cast.ledger')}</h3>
      {hidden ? (
        <p className="text-base text-[var(--text-mute)]">{t('elementa.cast.hidden')}</p>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="el-label" style={{ color: '#6fa8ff' }}>
                {t('elementa.diceTray.base')}
              </span>
              <span className="pixel-score text-[10px] text-[#9fc4ff]">{fmt(base)}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {result.baseLines.map((line, i) => (
                <Line
                  key={`b${i}`}
                  label={label(line)}
                  value={line.value}
                  op={line.kind === 'dice' ? 'add' : line.op}
                  state={lineState('base', i)}
                  color={line.kind === 'reaction' ? reactionById(line.id)?.color : null}
                />
              ))}
            </ul>
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
              {result.multLines.map((line, i) => (
                <Line
                  key={`m${i}`}
                  label={label(line)}
                  value={line.value}
                  op={line.op}
                  state={lineState('mult', i)}
                  color={line.kind === 'reaction' ? reactionById(line.id)?.color : null}
                />
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2 border-t-2 border-[var(--ink)] pt-3">
            <span className="el-label">{t('elementa.diceTray.score')}</span>
            <span className="pixel-score text-center text-xs leading-relaxed text-[var(--gold-1)]">
              {fmt(base)} x {fmt(mult)} = {score}
            </span>
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
          </div>
        </>
      )}
    </aside>
  )
}
