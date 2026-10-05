import { memo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { ARBITER } from '../data/arbiter.js'
import Modal from './Modal.jsx'

/**
 * The Arbiter's portrait (Part S): an open, empty hand, drawn in code with
 * crisp pixel rectangles (no art). It is the one portrait everything uses:
 * story scenes, the speech bubble and the Gallery. Colors come from ARBITER.
 */
function ArbiterHand({ size = 48 }) {
  const skin = ARBITER.accent
  const shade = ARBITER.color
  const line = '#1a1a24'
  // fingers: x, top y (palm top is y 17)
  const fingers = [
    [9, 9],
    [13, 5],
    [17, 7],
    [21, 11],
  ]
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {/* A faint ring above the palm: nothing in it. */}
      <rect x="12" y="1" width="8" height="1" fill={shade} opacity="0.5" />
      <rect x="11" y="2" width="1" height="1" fill={shade} opacity="0.5" />
      <rect x="20" y="2" width="1" height="1" fill={shade} opacity="0.5" />
      {fingers.map(([x, y]) => (
        <g key={x}>
          <rect x={x - 0.5} y={y - 0.5} width="4" height={18 - y + 1} fill={line} />
          <rect x={x} y={y} width="3" height={18 - y} fill={skin} />
        </g>
      ))}
      {/* Thumb */}
      <rect x="3.5" y="15.5" width="6" height="7" fill={line} />
      <rect x="4" y="16" width="5" height="6" fill={skin} />
      {/* Palm */}
      <rect x="8.5" y="16.5" width="16" height="11" fill={line} />
      <rect x="9" y="17" width="15" height="10" fill={skin} />
      <rect x="9" y="24" width="15" height="3" fill={shade} />
      <rect x="12" y="20" width="9" height="1" fill={shade} />
    </svg>
  )
}
export const ArbiterPortrait = memo(ArbiterHand)

/** His line in Pip's speech-bubble style: the hand, a small name, a sentence. */
export function ArbiterSays({ text, tone = 'neutral', label }) {
  const { lang } = useLanguage()
  if (!text) return null
  const edge = tone === 'cold' ? '#8a8aa8' : tone === 'warm' ? '#ffe9a0' : ARBITER.color
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="el-panel flex items-center gap-3 px-4 py-2 text-left"
      style={{ '--edge': edge }}
      aria-live="polite"
      data-arbiter
    >
      <ArbiterHand size={36} />
      <span className="flex flex-col leading-snug">
        <span className="el-label">{label ?? ARBITER.name[lang]}</span>
        <span className="text-base text-[var(--text)]">{text}</span>
      </span>
    </motion.div>
  )
}

/**
 * The first time he appears (Part S): plain words about what he may notice.
 * Asked once. "No" changes nothing about play; his lines just stay generic.
 */
export function FourthWallPrompt({ onChoose }) {
  const { t } = useLanguage()
  return (
    <Modal title={t('elementa.fourthwall.title')} width="max-w-md" onClose={() => onChoose('no')} closeLabel={t('elementa.fourthwall.no')}>
      <div className="flex items-center gap-3">
        <ArbiterHand size={56} />
        <p className="text-base">{t('elementa.fourthwall.ask')}</p>
      </div>
      <ul className="list-disc pl-5 text-sm text-[var(--text-dim)]">
        <li>{t('elementa.fourthwall.reads')}</li>
        <li>{t('elementa.fourthwall.sends')}</li>
        <li>{t('elementa.fourthwall.decline')}</li>
      </ul>
      <div className="flex gap-3">
        <button type="button" className="el-btn el-btn--gold flex-1" onClick={() => onChoose('yes')}>
          {t('elementa.fourthwall.yes')}
        </button>
        <button type="button" className="el-btn flex-1" onClick={() => onChoose('no')}>
          {t('elementa.fourthwall.no')}
        </button>
      </div>
      <p className="text-sm text-[var(--text-mute)]">{t('elementa.fourthwall.later')}</p>
    </Modal>
  )
}

export default ArbiterHand
