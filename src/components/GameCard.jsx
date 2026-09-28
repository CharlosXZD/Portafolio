import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import DieSprite from '../games/elementa/components/DieSprite.jsx'
import PixelIcon from '../games/elementa/components/PixelIcon.jsx'
import { mix } from '../games/elementa/utils/color.js'
import '../games/elementa/elementa.css'

// Three dice from the game, one per silhouette, drawn with the game's own
// procedural pixel renderer so the card is a real preview, not a mockup.
const DICE = [
  { tier: 'd3', color: '#e5533d', element: 'fire', value: 3 },
  { tier: 'd20', color: '#3d8fe5', element: 'water', value: 17 },
  { tier: 'd10', color: '#6fbf4a', element: 'sapling', value: 8 },
]

const NUMBER_Y = { d3: 0.72, d6: 0.5, d10: 0.4, d20: 0.56 }

function PreviewDie({ tier, color, element, value, delay }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="relative size-24"
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <DieSprite
        tier={tier}
        size={96}
        top={mix(color, '#1a1426', 0.38)}
        bottom={mix(color, '#120d1c', 0.58)}
        rim={mix(color, '#ffffff', 0.35)}
        shade={mix(color, '#0a0710', 0.7)}
        facet={mix(color, '#120d1c', 0.5)}
      />
      <span className="absolute left-[18%] top-[16%]" style={tier === 'd3' ? { left: '43%', top: '26%' } : undefined}>
        <PixelIcon name={element} size={14} color="#fffaf0" hi={color} />
      </span>
      <span
        className="pixel-score absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl leading-none text-[#fffaf0] [text-shadow:3px_3px_0_#120c1a]"
        style={{ top: `${NUMBER_Y[tier] * 100}%`, fontSize: tier === 'd3' ? 20 : 26 }}
      >
        {value}
      </span>
    </motion.div>
  )
}

/** Entry point from the portfolio into the playable game. */
function GameCard() {
  const { t } = useLanguage()

  return (
    <div
      className="elementa-root relative grid overflow-hidden rounded-3xl lg:grid-cols-[1.15fr_1fr]"
      style={{
        background:
          'radial-gradient(1px 1px at 12% 20%, #fff8 99%, transparent), radial-gradient(1px 1px at 38% 70%, #fff6 99%, transparent), radial-gradient(1px 1px at 64% 14%, #fff7 99%, transparent), radial-gradient(1px 1px at 82% 58%, #fff5 99%, transparent), radial-gradient(1px 1px at 91% 30%, #fff8 99%, transparent), linear-gradient(to bottom, #0b0914, #1b1636 60%, #352358)',
      }}
    >
      <div className="relative z-10 flex flex-col gap-5 p-8 sm:p-10">
        <span className="el-label">{t('game.eyebrow')}</span>
        <h3 className="el-logo text-4xl sm:text-5xl">Elementa</h3>
        <p className="max-w-md text-lg leading-snug text-[var(--text-dim)]">{t('game.tagline')}</p>
        <p className="text-sm text-[var(--text-mute)]">{t('game.tech')}</p>
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/games/elementa" className="el-btn el-btn--gold el-btn--lg">
            {t('game.play')}
          </Link>
          <Link to="/projects/elementa" className="el-btn el-btn--ghost">
            {t('projects.viewCaseStudy')}
          </Link>
        </div>
      </div>
      <div className="relative flex min-h-56 items-center justify-center gap-6 pb-10 lg:pb-0">
        <div
          aria-hidden="true"
          className="absolute size-64 rounded-full"
          style={{ boxShadow: '0 0 0 2px #8f6bff55, inset 0 0 0 10px #8f6bff14, 0 0 60px 10px #8f6bff22' }}
        />
        {DICE.map((d, i) => (
          <PreviewDie key={d.tier} {...d} delay={i * 0.4} />
        ))}
      </div>
    </div>
  )
}

export default GameCard
