import { ELEMENTS, familiesOf } from '../data/elements.js'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { mix } from '../utils/color.js'
import PixelIcon from './PixelIcon.jsx'

const ARCANE_COLOR = '#8f6bff'
const MYTHIC_COLOR = '#ff4fd8'
const CELESTIAL_COLOR = '#7ad1ff'

/**
 * One family chip: the element's color, pixel mark and name, or "Arcane".
 * Shared by the shop inspector, the die tooltip on the table, and the
 * Gallery, so a family reads the same everywhere (EXPANSION.md E2).
 */
export function FamilyTag({ family }) {
  const { t, lang } = useLanguage()
  const arcane = family === 'arcane' || family === 'mythic' || family === 'celestial'
  const color = family === 'mythic' ? MYTHIC_COLOR : family === 'celestial' ? CELESTIAL_COLOR : arcane ? ARCANE_COLOR : ELEMENTS[family].color
  const name = arcane ? t(`elementa.gallery.${family}`) : localize(lang, ELEMENTS[family].name, ELEMENTS_ES, family, 'name')
  return (
    <span
      className="el-chip inline-flex items-center gap-1.5"
      style={{ background: mix(color, '#120d1c', 0.45), color: mix(color, '#ffffff', 0.6), '--edge': color }}
    >
      <PixelIcon name={arcane ? 'spark' : family} size={7} color={mix(color, '#ffffff', 0.5)} hi="#fffaf0" />
      {name}
    </span>
  )
}

/** Every family a die belongs to: one chip per parent for a fusion. */
export default function FamilyTags({ elementId, className = '' }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {familiesOf(elementId).map((f) => (
        <FamilyTag key={f} family={f} />
      ))}
    </span>
  )
}
