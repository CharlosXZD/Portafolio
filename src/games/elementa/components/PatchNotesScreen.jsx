import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import { PATCH_NOTES, LATEST_VERSION } from '../data/patchNotes.js'
import { setSeenVersion } from '../utils/settings.js'
import Modal from './Modal.jsx'

function VersionHeader({ note }) {
  const { t, lang } = useLanguage()
  return (
    <span className="flex flex-1 items-baseline justify-between gap-3 text-left">
      <span className="pixel-heading text-[10px] leading-relaxed text-[var(--gold-hi)]">
        {note.stage} v{note.version} <span className="text-[var(--text)]">{note.name[lang]}</span>
      </span>
      <span className="shrink-0 text-sm text-[var(--text-mute)]">{note.date ?? t('elementa.patchNotes.inDevelopment')}</span>
    </span>
  )
}

function Highlights({ note }) {
  const { lang } = useLanguage()
  return (
    <ul className="flex flex-col gap-2 text-left">
      {note.highlights.map((h) => (
        <li key={h.en} className="text-base leading-snug text-[var(--text-dim)] before:mr-2 before:text-[var(--gold-2)] before:content-['+']">
          {h[lang]}
        </li>
      ))}
    </ul>
  )
}

/**
 * "What's new" (EXPANSION.md E12): every version's notes, the current one
 * open at the top and older ones collapsed below. Opening it marks the
 * newest version as seen, which clears the NEW chip on the menu.
 */
export default function PatchNotesScreen({ onClose }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(() => new Set([LATEST_VERSION]))
  const [latest, ...older] = PATCH_NOTES

  useEffect(() => {
    setSeenVersion(LATEST_VERSION)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      // Capture + stop: this may sit over Options or the pause menu.
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [onClose])

  function toggle(version) {
    playClick()
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(version)) next.delete(version)
      else next.add(version)
      return next
    })
  }

  return (
    <Modal title={t('elementa.patchNotes.title')} onClose={onClose} width="max-w-xl" closeLabel={t('elementa.options.close')}>
      <section className="el-well flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className="el-chip bg-[var(--gold-1)] text-[var(--ink)]">{t('elementa.patchNotes.current')}</span>
          <VersionHeader note={latest} />
        </div>
        <Highlights note={latest} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="el-label">{t('elementa.patchNotes.earlier')}</h3>
        {older.map((note) => {
          const isOpen = open.has(note.version)
          return (
            <div key={note.version} className="el-well flex flex-col">
              <button
                type="button"
                onClick={() => toggle(note.version)}
                aria-expanded={isOpen}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="pixel-score w-3 text-[9px] text-[var(--text-mute)]">{isOpen ? '-' : '+'}</span>
                <VersionHeader note={note} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <Highlights note={note} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </section>
    </Modal>
  )
}
