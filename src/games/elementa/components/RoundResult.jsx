import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import AnimatedNumber from './AnimatedNumber.jsx'
import PixelIcon from './PixelIcon.jsx'
import { relicById } from '../data/relics.js'
import { relicDescriptor } from '../data/itemDescriptors.js'
import { playSuccess, playFail, playLifeLost } from '../utils/sound.js'

/**
 * Result of the last cast. Two sizes: the big card on a miss (with the way
 * to Tobb's camp), and a `compact` summary at the top of the shop.
 */
export default function RoundResult({ state, dispatch, compact = false }) {
  const { t, lang } = useLanguage()
  const r = state.lastResult
  const missed = state.phase === 'missed'

  useEffect(() => {
    // The camp's summary of a miss already played its sound on the miss.
    if (!r || (compact && !r.passed)) return
    if (r.passed) playSuccess()
    else {
      playFail()
      if (missed) playLifeLost()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!missed) return
    function onKey(e) {
      if (e.key === 'Enter' && !(e.target instanceof HTMLElement && e.target.closest('button'))) {
        dispatch({ type: state.gauntlet ? 'RETRY_ROUND' : 'GO_TO_CAMP' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [missed, dispatch, state.gauntlet])

  if (!r) return null

  const title = r.passed
    ? t('elementa.roundResult.cleared')
    : missed
      ? t('elementa.roundResult.missedLostLife')
      : t('elementa.roundResult.missed')

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.35, duration: 0.45 }}
      className={`el-panel flex w-full flex-col items-center text-center ${compact ? 'gap-2 px-4 py-4' : 'max-w-md gap-6 px-8 py-10'}`}
      style={{ '--edge': r.passed ? '#2f7a4a' : '#8a2a32' }}
    >
      <h2 className={`pixel-heading ${compact ? 'text-[10px]' : 'text-base'}`} style={{ color: r.passed ? 'var(--good)' : 'var(--bad)' }}>
        {title}
      </h2>
      <div className="flex items-baseline gap-2">
        <AnimatedNumber value={r.roundScore} className={`pixel-score text-[var(--gold-1)] ${compact ? 'text-base' : 'text-3xl'}`} />
        <span className="pixel-score text-[10px] text-[var(--text-mute)]">/ {r.threshold}</span>
      </div>
      {!compact && (
        <span className="text-base text-[var(--text-mute)]">
          {r.baseValue} × {r.multiplier}
        </span>
      )}
      {r.shardGain && (
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1.5">
            <PixelIcon name="shard" size={14} />
            <span className="pixel-score text-xs text-[var(--gold-1)]">+{r.shardGain.total}</span>
          </span>
          <span className="text-sm leading-tight text-[var(--text-mute)]">
            {[
              `${t('elementa.roundResult.reward')} ${r.shardGain.base}`,
              r.shardGain.overkill > 0 && `${t('elementa.roundResult.overkill')} +${r.shardGain.overkill}`,
              r.shardGain.interest > 0 && `${t('elementa.roundResult.interest')} +${r.shardGain.interest}`,
              r.shardGain.bonus > 0 && `${t('elementa.roundResult.relics')} +${r.shardGain.bonus}`,
              // Pacts and blessings that waited on this clear (B3).
              ...(r.shardGain.effects || []).map((e) => t(`elementa.roundResult.clear.${e}`)),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
      )}
      {r.longNightRelic && (
        <p className="text-base text-[var(--arcane-hi)]">
          {t('elementa.roundResult.longNight').replace('{relic}', relicDescriptor(relicById(r.longNightRelic), lang).name)}
        </p>
      )}
      {r.secondWindTriggered && <p className="text-base text-[var(--arcane-hi)]">{t('elementa.roundResult.safetyNet')}</p>}
      {missed && state.gauntlet && (
        <>
          <p className="max-w-xs text-base leading-snug text-[var(--text-dim)]">{t('elementa.roundResult.gauntletHint')}</p>
          <button type="button" onClick={() => dispatch({ type: 'RETRY_ROUND' })} className="el-btn el-btn--gold el-btn--lg">
            {t('elementa.roundResult.retryStage')}
            <span className="el-key">Enter</span>
          </button>
        </>
      )}
      {missed && !state.gauntlet && (
        <>
          <p className="max-w-xs text-base leading-snug text-[var(--text-dim)]">{t('elementa.roundResult.campHint')}</p>
          <button type="button" onClick={() => dispatch({ type: 'GO_TO_CAMP' })} className="el-btn el-btn--gold el-btn--lg">
            {t('elementa.roundResult.toCamp')}
            <span className="el-key">Enter</span>
          </button>
        </>
      )}
    </motion.div>
  )
}
