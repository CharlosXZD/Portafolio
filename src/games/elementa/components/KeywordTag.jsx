import { useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { keywordById } from '../data/keywords.js'
import { mix } from '../utils/color.js'

/**
 * One keyword chip (EXPANSION.md P5 to P9): `#Explodes`, in its own color.
 * Hover, focus or tap shows its one-line definition. With `inline` the
 * definition prints next to the chip instead (the full description).
 */
export function KeywordTag({ id, inline = false }) {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const kw = keywordById(id)
  if (!kw) return null
  const chip = (
    <button
      type="button"
      className="el-chip cursor-help"
      style={{ background: mix(kw.color, '#120d1c', 0.62), color: mix(kw.color, '#ffffff', 0.55), '--edge': kw.color }}
      aria-expanded={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation()
        setOpen((o) => !o)
      }}
    >
      #{kw.label[lang]}
    </button>
  )
  if (inline) {
    return (
      <div className="flex flex-col items-start gap-1">
        {chip}
        <span className="text-[15px] leading-snug text-[var(--text-dim)]">{kw.definition[lang]}</span>
      </div>
    )
  }
  return (
    <span className="relative inline-flex">
      {chip}
      {open && (
        <span
          role="tooltip"
          className="el-panel--dark el-panel pointer-events-none absolute left-0 top-full z-[60] mt-3 w-48 p-2 text-left text-sm leading-snug text-[var(--text)]"
          style={{ '--edge': kw.color }}
        >
          {kw.definition[lang]}
        </span>
      )}
    </span>
  )
}

/** A row of keyword chips; `max` folds the rest into a "+N" chip. */
export default function KeywordTags({ ids = [], max = 4, className = '' }) {
  if (ids.length === 0) return null
  const shown = ids.slice(0, max)
  const rest = ids.length - shown.length
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {shown.map((id) => (
        <KeywordTag key={id} id={id} />
      ))}
      {rest > 0 && <span className="el-chip bg-[#2a2338] text-[var(--text-mute)]">+{rest}</span>}
    </span>
  )
}
