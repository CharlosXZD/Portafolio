import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { RARITY_GLOW } from '../data/relics.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import FamilyTags from './FamilyTag.jsx'
import KeywordTags from './KeywordTag.jsx'
import RichText from './RichText.jsx'
import { useFloating, arrowStyle } from './useFloating.js'

export const RARITY_LABEL = {
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', divine: 'Divine', mythic: 'Mythic' },
  es: { common: 'Común', uncommon: 'Poco común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario', divine: 'Divino', mythic: 'Mítico' },
}

/**
 * A small popover anchored to the item that opened it (not a centered
 * full-screen modal): name + description + rarity pill + a row of
 * contextual actions (Buy / Sell / Apply / Close), with a pointer triangle
 * so it's visibly attached to its trigger, matching how Balatro's own card
 * tooltip is anchored to the card rather than taking over the screen.
 * The caller conditionally renders this inside its trigger's container;
 * the popover itself is drawn in a portal on top of the game (see
 * useFloating.js), so no neighbor can ever cover it.
 */
const FROM = { top: { y: 8 }, bottom: { y: -8 }, right: { x: -8 }, left: { x: 8 } }

export default function ItemInspector({ item, onClose, actions = [], placement = 'top' }) {
  const { markerRef, panelRef: ref, pos, root } = useFloating(placement)
  const { lang, t } = useLanguage()

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
  const from = FROM[pos?.place ?? placement] ?? FROM.top

  return (
    <>
    <span ref={markerRef} className="hidden" aria-hidden="true" />
    {createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94, ...from }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, ...from }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.22 }}
      onClick={(e) => e.stopPropagation()}
      // On the table the popover sits inside a draggable die: pressing it
      // must not start a drag.
      onPointerDown={(e) => e.stopPropagation()}
      data-tut-inspector=""
      className="el-panel--dark el-panel w-60 text-left"
      style={{
        '--edge': glow,
        position: 'absolute',
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        zIndex: 90,
        // Hidden for the one frame before it has been measured.
        visibility: pos ? 'visible' : 'hidden',
      }}
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
      <p className="px-3 pb-3 text-[15px] leading-snug text-[var(--text-dim)]">
        <RichText text={item.description} />
      </p>
      {item.tags?.length > 0 && <KeywordTags ids={item.tags} className="px-3 pb-3" />}
      {item.footnote && <p className="-mt-1 px-3 pb-3 text-sm text-[var(--text-mute)]">{item.footnote}</p>}
      {/* Level 3 is one click away for touch and keyboard players (P5). */}
      {item.onInfo && (
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <span className="text-sm leading-tight text-[var(--text-mute)]">{t('elementa.info.holdHint')}</span>
          <button type="button" className="el-btn el-btn--sm shrink-0" onClick={() => item.onInfo()}>
            {t('elementa.info.button')}
          </button>
        </div>
      )}
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
      <span aria-hidden="true" style={arrowStyle(pos ?? { place: placement }, glow)} />
    </motion.div>,
    root,
    )}
    </>
  )
}
