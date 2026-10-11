import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Player } from '@remotion/player'
import strings from '../../../../../i18n/strings.js'
import { useVisualEnv } from '../VisualEnv.jsx'
import TitleCard from './TitleCard.jsx'
import { TITLE_CARD } from './titleCardConfig.js'

// The opening of the game (VISUALS.md V5): the title card (logo reveal, the four
// element marks, the tagline) played once over the main menu. Click, Enter,
// Space or Esc skips; when it ends it fades out. It is its own overlay, so the
// menu underneath is already there when it goes.

export default function IntroPlayer({ onDone }) {
  const { lang } = useVisualEnv()
  const ref = useRef(null)
  const [leaving, setLeaving] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const leave = useCallback(() => {
    setLeaving(true)
    ref.current?.pause()
    setTimeout(() => doneRef.current?.(), 380)
  }, [])

  useEffect(() => {
    const p = ref.current
    if (!p) return
    p.addEventListener('ended', leave)
    return () => p.removeEventListener('ended', leave)
  }, [leave])

  useEffect(() => {
    function onKey(e) {
      if (!['Escape', 'Enter', ' '].includes(e.key)) return
      e.stopImmediatePropagation()
      e.preventDefault()
      leave()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [leave])

  const root = typeof document !== 'undefined' ? document.querySelector('.elementa-root') : null
  if (!root) return null
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: '#07060e', opacity: leaving ? 0 : 1, transition: 'opacity 380ms cubic-bezier(0.23, 1, 0.32, 1)' }}
      onClick={leave}
      role="presentation"
    >
      <div style={{ width: 'min(100vw, calc(100dvh * 16 / 9))' }}>
        <Player
          ref={ref}
          component={TitleCard}
          inputProps={{ lang }}
          durationInFrames={TITLE_CARD.durationInFrames}
          fps={TITLE_CARD.fps}
          compositionWidth={TITLE_CARD.width}
          compositionHeight={TITLE_CARD.height}
          autoPlay
          controls={false}
          clickToPlay={false}
          acknowledgeRemotionLicense
          style={{ width: '100%', imageRendering: 'pixelated' }}
        />
      </div>
      <button type="button" className="el-btn el-btn--ghost el-btn--sm absolute bottom-4 right-4" onClick={leave}>
        {strings['elementa.story.skip'][lang]}
        <span className="el-key">Esc</span>
      </button>
    </div>,
    root,
  )
}
