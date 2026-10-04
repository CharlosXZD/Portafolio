import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { ELEMENTS } from '../data/elements.js'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import PixelIcon from './PixelIcon.jsx'

/**
 * A temporary die (EXPANSION.md N2, N5): the Event Horizon's Black Hole dice
 * and the Time die's ghost. Drawn smaller than a real die, with a dashed
 * edge; it cannot be held, locked or sold. The ghost shows the Base it adds.
 */
export default function TempDie({ die, contribution = null, lit = false }) {
  const { lang, t } = useLanguage()
  const def = ELEMENTS[die.elementId]
  const name = localize(lang, def.name, ELEMENTS_ES, die.elementId, 'name')
  const ghost = die.temp === 'ghost'
  return (
    <div
      className="flex h-20 w-16 flex-col items-center justify-center gap-1 px-1 text-center"
      style={{
        border: `2px dashed ${def.color}`,
        background: ghost ? 'rgba(203,188,255,0.08)' : 'rgba(0,0,0,0.45)',
        boxShadow: lit ? `0 0 0 2px ${def.color}` : 'none',
        opacity: ghost ? 0.85 : 1,
      }}
      title={`${name}: ${t('elementa.temp.hint')}`}
    >
      <PixelIcon name={die.elementId} size={22} color={def.color} hi="#fff4d6" />
      <span className="pixel-score text-[8px] leading-tight" style={{ color: def.color }}>
        {ghost ? `+${Math.round((contribution ?? die.ghostBase ?? 0) * 100) / 100}` : name}
      </span>
      <span className="text-[10px] leading-none text-[var(--text-mute)]">{t('elementa.temp.label')}</span>
    </div>
  )
}
