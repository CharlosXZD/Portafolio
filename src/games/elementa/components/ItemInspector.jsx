import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RARITY_GLOW } from '../data/relics.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import FamilyTags from './FamilyTag.jsx'

const RARITY_LABEL = {
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' },
  es: { common: 'Común', uncommon: 'Poco común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario' },
}

// Highlights numbers, element names, and Shard/Fragmento mentions in a
// description, a lighter version of Balatro's colored-keyword card text.
// Matches both languages' keywords since the description text itself is
// already localized by the time it reaches here (see data/itemDescriptors.js).
const KEYWORD_RE =
  /(\+?-?\d+(?:\.\d+)?x?%?|\bShards?\b|\bFragmentos?\b|\bEarth\b|\bWater\b|\bFire\b|\bAir\b|\bTierra\b|\bAgua\b|\bFuego\b|\bAire\b)/g

function highlightDescription(text) {
  const parts = text.split(KEYWORD_RE)
  return parts.map((part, i) => {
    if (/^\+?-?\d/.test(part)) {
      return (
        <span key={i} className="text-[var(--gold-1)]">
          {part}
        </span>
      )
    }
    if (/^(Shards?|Fragmentos?)$/.test(part)) {
      return (
        <span key={i} className="text-[var(--gold-1)]">
          {part}
        </span>
      )
    }
    if (/^(Earth|Water|Fire|Air|Tierra|Agua|Fuego|Aire)$/.test(part)) {
      return (
        <span key={i} className="text-[#9fd4ff]">
          {part}
        </span>
      )
    }
    return part
  })
}

/**
 * A small popover anchored directly above the item that opened it (not a
 * centered full-screen modal): name + description + rarity pill + a row of
 * contextual actions (Buy / Sell / Apply / Close), with a pointer triangle
 * so it's visibly attached to its trigger, matching how Balatro's own card
 * tooltip is anchored to the card rather than taking over the screen.
 * The caller is responsible for wrapping its trigger in a `relative`
 * container and conditionally rendering this inside it.
 */
const PLACEMENT = {
  top: {
    box: 'bottom-full left-1/2 mb-4 -translate-x-1/2',
    arrow: 'left-1/2 top-full -translate-x-1/2 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent',
    arrowSide: 'borderTopColor',
    from: { y: 8 },
  },
  right: {
    box: 'left-full top-1/2 ml-4 -translate-y-1/2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-b-[7px] border-r-[7px] border-t-[7px] border-b-transparent border-t-transparent',
    arrowSide: 'borderRightColor',
    from: { x: -8 },
  },
}

export default function ItemInspector({ item, onClose, actions = [], placement = 'top' }) {
  const ref = useRef(null)
  const { lang } = useLanguage()

  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function handleKey(e) {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKey, { capture: true })
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKey, { capture: true })
    }
  }, [onClose])

  if (!item) return null
  // A boon has no rarity: it brings its own badge (status) and color.
  const glow = item.badge?.color ?? (RARITY_GLOW[item.rarity] || RARITY_GLOW.common)
  const p = PLACEMENT[placement] ?? PLACEMENT.top

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94, ...p.from }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, ...p.from }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.22 }}
      onClick={(e) => e.stopPropagation()}
      data-tut-inspector=""
      className={`el-panel--dark el-panel absolute z-50 w-60 text-left ${p.box}`}
      style={{ '--edge': glow }}
    >
      <div className="flex items-start justify-between gap-2 px-3 pb-2 pt-3">
        <h4 className="pixel-heading text-[10px] leading-relaxed text-[var(--text)]">{item.name}</h4>
        <span
          className="el-chip shrink-0 text-[var(--ink)]"
          style={{ backgroundColor: glow, '--edge': 'var(--ink)' }}
        >
          {item.badge?.label ?? RARITY_LABEL[lang][item.rarity]}
        </span>
      </div>
      {/* Dice and forge recipes show their families next to the rarity (E2). */}
      {(item.kind === 'die' || item.kind === 'forge') && <FamilyTags elementId={item.id} className="px-3 pb-2" />}
      <p className="px-3 pb-3 text-[15px] leading-snug text-[var(--text-dim)]">{highlightDescription(item.description)}</p>
      {item.footnote && <p className="-mt-1 px-3 pb-3 text-sm text-[var(--text-mute)]">{item.footnote}</p>}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3 border-t-2 border-[var(--ink)] bg-black/20 px-3 py-3">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={a.disabled}
              title={a.disabledReason && a.disabled ? a.disabledReason : undefined}
              onClick={() => {
                a.onClick()
                if (!a.keepOpen) onClose()
              }}
              className={`el-btn el-btn--sm flex-1 ${
                a.variant === 'danger' ? 'el-btn--danger' : a.variant === 'neutral' ? '' : 'el-btn--gold'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      <span aria-hidden="true" className={`absolute h-0 w-0 ${p.arrow}`} style={{ [p.arrowSide]: glow }} />
    </motion.div>
  )
}
