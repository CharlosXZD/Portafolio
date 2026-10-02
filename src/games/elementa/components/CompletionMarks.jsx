import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { ENDINGS } from '../data/endings.js'

/**
 * A loadout's completion marks (EXPANSION.md B2), like The Binding of
 * Isaac's per-character marks: one pip per ending, lit once this loadout
 * has reached it.
 */
export default function CompletionMarks({ profile, deckId, size = 10 }) {
  const { lang } = useLanguage()
  const reached = profile.deckEndings?.[deckId] || []
  return (
    <span className="inline-flex items-center gap-1.5">
      {ENDINGS.map((e) => {
        const lit = reached.includes(e.id)
        return (
          <span
            key={e.id}
            title={lit ? e.name[lang] : '???'}
            className="inline-block"
            style={{
              width: size,
              height: size,
              background: lit ? e.color : 'var(--stone-0)',
              boxShadow: `0 0 0 2px var(--ink)${lit ? `, 0 0 6px ${e.color}` : ''}`,
            }}
          />
        )
      })}
    </span>
  )
}
