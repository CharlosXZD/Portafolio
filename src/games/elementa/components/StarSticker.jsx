import { useLanguage } from '../../../i18n/LanguageContext.jsx'

const ROWS = ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '.#...#.']

/**
 * The gold pixel star a die wears in the Gallery once it helped beat
 * Cataclysm (EXPANSION.md P16). A reward only: it counts toward nothing.
 */
export default function StarSticker({ size = 18, className = '' }) {
  const { t } = useLanguage()
  const label = t('elementa.gallery.cataclysmSticker')
  return (
    <span
      title={label}
      role="img"
      aria-label={label}
      className={`inline-flex ${className}`}
      style={{ filter: 'drop-shadow(0 0 4px #ffd166aa)' }}
    >
      <svg width={size} height={size} viewBox="0 0 7 7" shapeRendering="crispEdges">
        {ROWS.flatMap((row, y) =>
          [...row].map((c, x) =>
            c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={y < 2 ? '#fff4d6' : '#ffd166'} stroke="#1d1829" strokeWidth={0.18} /> : null,
          ),
        )}
      </svg>
    </span>
  )
}
