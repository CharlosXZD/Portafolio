import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ELEMENTS, describeElement, rarityForElement } from '../data/elements.js'
import { RARITY_GLOW } from '../data/relics.js'
import { diceText } from '../data/diceText.js'
import { keywordById } from '../data/keywords.js'
import { localize, ELEMENTS_ES } from '../data/i18n.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { dieColors } from './DieToken.jsx'
import FamilyTags from './FamilyTag.jsx'
import KeywordTags, { KeywordTag } from './KeywordTag.jsx'
import RichText from './RichText.jsx'
import Modal from './Modal.jsx'
import { RARITY_LABEL } from './ItemInspector.jsx'

// The three levels of detail for a die (EXPANSION.md P5 to P9), one set of
// pieces used by the table, the shop, the inventory and the Gallery:
//   hover  DieHoverCard   name, type, families, score. Nothing else.
//   click  DieShort       the short text with a bit of lore, and keyword tags
//                         (the popover frame is ItemInspector.jsx).
//   hold   DieFullModal   everything: mechanics line by line, every keyword
//                         with its definition. The Gallery shows DieDetails.

/** "SCORE" over a big gold pixel number, like the family chips: important. */
export function ScoreBlock({ value }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between gap-3 border-t-2 border-[var(--ink)] pt-2">
      <span className="el-label">{t('elementa.info.score')}</span>
      <span className="pixel-score text-xl leading-none text-[var(--gold-1)] [text-shadow:3px_3px_0_var(--ink)]">{value}</span>
    </div>
  )
}

export function dieTypeLabel(sides, bonus = 0) {
  return `D${sides}${bonus ? ` +${bonus}` : ''}`
}

function useDieName(elementId) {
  const { lang } = useLanguage()
  return localize(lang, ELEMENTS[elementId].name, ELEMENTS_ES, elementId, 'name')
}

/** Level 1: hover. `score` is a number, '?' (Eclipse) or null (no roll). */
export function DieHoverCard({ elementId, sides, bonus = 0, score = null }) {
  const name = useDieName(elementId)
  const colors = dieColors(elementId)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="pixel-heading text-[10px]" style={{ color: colors.rim }}>
          {name}
        </span>
        {sides && <span className="el-chip bg-[#2a2338] text-[var(--text)]">{dieTypeLabel(sides, bonus)}</span>}
      </div>
      <FamilyTags elementId={elementId} />
      {score != null && <ScoreBlock value={score} />}
    </div>
  )
}

/** Level 2 body: the short text and its tags (inside an ItemInspector). */
export function DieShort({ elementId }) {
  const { lang } = useLanguage()
  const { short, tags } = diceText(elementId, lang)
  return (
    <>
      <p className="text-[15px] leading-snug text-[var(--text-dim)]">
        <RichText text={short} />
      </p>
      <KeywordTags ids={tags} />
    </>
  )
}

/**
 * Level 3 body, also the Gallery's die detail: how it works, line by line,
 * then every keyword it uses with its definition.
 */
export function DieDetails({ elementId, withFamilies = false }) {
  const { lang, t } = useLanguage()
  const { flagLines } = describeElement(elementId, lang)
  const { tags } = diceText(elementId, lang)
  return (
    <div className="flex flex-col gap-3">
      {withFamilies && <FamilyTags elementId={elementId} />}
      {flagLines.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="el-label">{t('elementa.info.howItWorks')}</span>
          <ul className="flex list-none flex-col gap-1 text-[15px] leading-snug text-[var(--text-dim)]">
            {flagLines.map((line) => (
              <li key={line} className="before:mr-1.5 before:text-[var(--gold-2)] before:content-['+']">
                <RichText text={line} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {tags.some((id) => keywordById(id)) && (
        <div className="flex flex-col gap-2">
          <span className="el-label">{t('elementa.info.keywords')}</span>
          {tags.map((id) => (
            <KeywordTag key={id} id={id} inline />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Level 3 as a centered dialog. Stays open until you click outside, press
 * Esc, or use the X. Portaled into the game root: a fixed overlay inside the
 * shaking table would only cover its own column, and the game's colors and
 * fonts are scoped to `.elementa-root`.
 */
export function DieFullModal({ elementId, sides, bonus = 0, score = null, onClose }) {
  const { lang, t } = useLanguage()
  const name = useDieName(elementId)
  const { short } = diceText(elementId, lang)
  const rarity = rarityForElement(elementId)

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      // Capture phase: the pause menu's own Escape must not also fire.
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [onClose])

  const root = document.querySelector('.elementa-root')
  if (!root) return null
  return createPortal(
    <Modal title={name} onClose={onClose} width="max-w-md" closeLabel={t('elementa.info.close')}>
      <div className="flex flex-wrap items-center gap-2">
        {sides && <span className="el-chip bg-[#2a2338] text-[var(--text)]">{dieTypeLabel(sides, bonus)}</span>}
        <span className="el-chip text-[var(--ink)]" style={{ background: RARITY_GLOW[rarity] || RARITY_GLOW.common }}>
          {RARITY_LABEL[lang][rarity]}
        </span>
        <FamilyTags elementId={elementId} />
      </div>
      <p className="text-base leading-snug text-[var(--text)]">
        <RichText text={short} />
      </p>
      {score != null && <ScoreBlock value={score} />}
      <DieDetails elementId={elementId} />
    </Modal>,
    root,
  )
}
