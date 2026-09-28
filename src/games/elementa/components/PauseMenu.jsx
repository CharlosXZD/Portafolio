import { useEffect, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { playClick } from '../utils/sound.js'
import ConfirmButton from './ConfirmButton.jsx'
import OptionsScreen from './OptionsScreen.jsx'
import Modal from './Modal.jsx'
import GalleryScreen from './GalleryScreen.jsx'

/**
 * Pause overlay, opened by Escape or the on-screen pause button (see
 * ElementaGame.jsx) while a run is live. The single home for Options and
 * leaving the run, from every in-run screen including the shop.
 */
export default function PauseMenu({ dispatch, onResume }) {
  const { t } = useLanguage()
  const [showOptions, setShowOptions] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

  // Escape closes the gallery first, before the pause menu underneath.
  useEffect(() => {
    if (!showGallery) return
    function onKey(e) {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      setShowGallery(false)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [showGallery])

  return (
    <Modal title={t('elementa.pause.title')} onClose={onResume} width="max-w-xs" closeLabel={t('elementa.options.close')}>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          className="el-btn el-btn--gold"
          onClick={() => {
            playClick()
            onResume()
          }}
        >
          {t('elementa.pause.resume')}
        </button>
        <button
          type="button"
          className="el-btn"
          onClick={() => {
            playClick()
            setShowGallery(true)
          }}
        >
          {t('elementa.pause.gallery')}
        </button>
        <button
          type="button"
          className="el-btn"
          onClick={() => {
            playClick()
            setShowOptions(true)
          }}
        >
          {t('elementa.options.title')}
        </button>
        <ConfirmButton
          onConfirm={() => dispatch({ type: 'RETURN_HOME' })}
          className="el-btn el-btn--danger"
          armedClassName="el-btn el-btn--danger brightness-125"
          confirmLabel={t('elementa.pause.confirmAbandon')}
        >
          {t('elementa.pause.returnHome')}
        </ConfirmButton>
      </div>
      {showOptions && <OptionsScreen onClose={() => setShowOptions(false)} />}
      {showGallery && (
        <div
          className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[#07050c] px-4 py-10"
          onClick={(e) => e.stopPropagation()}
        >
          <GalleryScreen onBack={() => setShowGallery(false)} />
        </div>
      )}
    </Modal>
  )
}
