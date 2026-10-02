import { ELEMENTS } from '../data/elements.js'
import { mix } from '../utils/color.js'
import PixelIcon from './PixelIcon.jsx'
import DieSprite, { dieNumberY, dieIconY } from './DieSprite.jsx'
import ElementFx from './ElementFx.jsx'

// Die body colors come from the element, darkened toward the night palette
// so pale elements (Air, Steam) still carry a light number. Shared by the
// live Die and the static DieToken.
export function dieColors(elementId, frozen = false) {
  const base = frozen ? '#3a7cb0' : ELEMENTS[elementId].color
  return {
    top: mix(base, '#1a1426', 0.38),
    bottom: mix(base, '#120d1c', 0.58),
    rim: frozen ? '#bfefff' : mix(base, '#ffffff', 0.35),
    shade: mix(base, '#0a0710', 0.7),
    facet: mix(base, '#120d1c', 0.5),
  }
}

/**
 * A die outside the table (shop inventory, boss reward, run summary): its
 * real tier shape plus either its face (with a small element mark) or, when
 * there is no face to show, the element's mark large in the middle (the
 * shape already says the size; tooltips still say "d6"). A green badge
 * shows permanent upgrades (Whetstone and friends).
 */
export default function DieToken({ die, size = 48, face = null, ringColor = null, onClick, title, dimmed = false }) {
  const def = ELEMENTS[die.elementId]
  const extra = die.bonus || 0
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`pixel-score relative isolate block shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: size, height: size, opacity: dimmed ? 0.45 : 1 }}
    >
      <ElementFx elementId={die.elementId} size={size} behind lite={size < 56} />
      <DieSprite tier={die.tierId} size={size} {...dieColors(die.elementId)} ringColor={ringColor} />
      {!dimmed && <ElementFx elementId={die.elementId} size={size} lite={size < 56} />}
      {face == null ? (
        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: `${dieIconY(die.tierId) * 100}%`, filter: 'drop-shadow(2px 2px 0 var(--ink))' }}
        >
          <PixelIcon name={die.elementId} size={Math.round(size * (die.tierId === 'd3' ? 0.26 : 0.34))} color="#fffaf0" hi={def.color} />
        </span>
      ) : (
        <>
          <span
            className="pointer-events-none absolute left-[18%] top-[16%]"
            style={die.tierId === 'd3' ? { left: '43%', top: '24%' } : undefined}
          >
            <PixelIcon name={die.elementId} size={size >= 64 ? 10 : 6} color="#fffaf0" hi={def.color} />
          </span>
          <span
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none"
            style={{
              top: `${dieNumberY(die.tierId) * 100}%`,
              fontSize: Math.max(7, Math.round(size * (die.tierId === 'd3' ? 0.22 : 0.27))),
              color: '#fffaf0',
              textShadow: '2px 2px 0 var(--ink)',
            }}
          >
            {face}
          </span>
        </>
      )}
      {extra > 0 && (
        <span className="el-chip pointer-events-none absolute -left-2 -top-2 bg-[#6fbf4a] text-[var(--ink)]" style={{ fontSize: 7 }}>
          +{extra}
        </span>
      )}
    </Tag>
  )
}
