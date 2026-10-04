import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { ENDINGS, visibleEndingIds } from '../data/endings.js'

/**
 * A loadout's completion marks (EXPANSION.md B2), like The Binding of
 * Isaac's per-character marks: one pip per ending, lit once this loadout
 * has reached it.
 */
export default function CompletionMarks({ profile, deckId, size = 10 }) {
  const { lang } = useLanguage()
  const reached = profile.deckEndings?.[deckId] || []
  // Only what the file has reached or may hint at (no count of endings on a new file).
  const shown = new Set(visibleEndingIds(profile.endings || []))
  reached.forEach((id) => shown.add(id))
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
      {ENDINGS.filter((e) => shown.has(e.id)).map((e) => {
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
