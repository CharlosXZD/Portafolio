import { motion } from 'framer-motion'
import { compactNumber } from '../utils/formatNumber.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'

const SEGMENTS = 20

/** Segmented pixel progress bar for the live score against the target. */
export default function TargetBar({ score, target, unknown = false }) {
  const { t } = useLanguage()
  const pct = target > 0 ? Math.min(1, score / target) : 0
  const met = score >= target
  const lit = Math.round(pct * SEGMENTS)

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="el-label">{t('elementa.targetBar.target')}</span>
        <span className={`pixel-score text-[10px] ${met ? 'text-[var(--good)]' : 'text-[var(--text-dim)]'}`}>
          {unknown ? '?' : compactNumber(score)} / {compactNumber(target)}
        </span>
      </div>
      <div
        className="flex gap-[3px] bg-[var(--stone-0)] p-[3px]"
        style={{ boxShadow: '0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink)' }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={score}
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <motion.span
            key={i}
            className="h-3 flex-1"
            animate={{
              backgroundColor: i < lit ? (met ? '#5fd38a' : '#f2a93b') : '#2a2338',
              opacity: i < lit ? 1 : 0.7,
            }}
            transition={{ duration: 0.12, delay: i < lit ? i * 0.012 : 0 }}
          />
        ))}
      </div>
    </div>
  )
}
