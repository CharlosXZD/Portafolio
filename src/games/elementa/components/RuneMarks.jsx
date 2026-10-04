import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { runeById, runesOf } from '../data/runes.js'
import { KeywordTag } from './KeywordTag.jsx'

/**
 * A die's runes on the table (EXPANSION.md K3b): one small chip per rune with
 * its number. The ones on the face the die shows now are lit.
 */
export function RuneBadges({ die, showFace = true }) {
  const { lang } = useLanguage()
  const runes = runesOf(die)
  if (runes.length === 0) return null
  return (
    <span className="pointer-events-none absolute -bottom-3 -right-3 z-10 flex flex-col items-end gap-0.5">
      {runes.map((r, i) => {
        const def = runeById(r.id)
        if (!def) return null
        const lit = showFace && die.value === r.face
        return (
          <span
            key={`${r.id}-${r.face}-${i}`}
            title={`${def.name[lang]}: ${r.face}`}
            className="el-chip text-[var(--ink)]"
            style={{
              backgroundColor: def.color,
              opacity: lit ? 1 : 0.6,
              boxShadow: lit ? `0 0 8px ${def.color}` : undefined,
              fontSize: 7,
            }}
          >
            {def.short[lang]} {r.face}
          </span>
        )
      })}
    </span>
  )
}

/** Small squares for a die outside the table (DieToken), one per rune. */
export function RuneDots({ die }) {
  const runes = runesOf(die)
  if (runes.length === 0) return null
  return (
    <span className="pointer-events-none absolute -bottom-1 -right-1 flex gap-0.5">
      {runes.map((r, i) => (
        <span
          key={`${r.id}-${r.face}-${i}`}
          className="h-2.5 w-2.5"
          style={{ background: runeById(r.id)?.color ?? '#d6c4ff', boxShadow: '0 0 0 2px #1d1829' }}
        />
      ))}
    </span>
  )
}

/**
 * A die's runes in words, for the hover card, the popover and the full
 * description: "Rune of Echo, on 4", with the rune's keyword.
 */
export function RuneLines({ runes = [] }) {
  const { t, lang } = useLanguage()
  if (!runes.length) return null
  return (
    <div className="flex flex-col gap-1">
      {runes.map((r, i) => {
        const def = runeById(r.id)
        if (!def) return null
        return (
          <span key={`${r.id}-${r.face}-${i}`} className="flex flex-wrap items-center gap-1.5 text-[15px] leading-snug text-[var(--text-dim)]">
            <KeywordTag id={`rune_${r.id}`} inline />
            {t('elementa.rune.onFace').replace('{rune}', def.name[lang]).replace('{n}', r.face)}
          </span>
        )
      })}
    </div>
  )
}

/** The popover's footnote for runes: "Rune of Echo on 4: it scores twice." */
export function runeFootnote(die, lang, t) {
  return runesOf(die)
    .map((r) => {
      const def = runeById(r.id)
      return def ? t('elementa.rune.onFace').replace('{rune}', def.name[lang]).replace('{n}', r.face) : null
    })
    .filter(Boolean)
    .join('. ')
}
