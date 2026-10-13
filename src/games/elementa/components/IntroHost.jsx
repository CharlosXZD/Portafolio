import { Suspense, lazy, useState } from 'react'
import { guard } from '../utils/forceFail.js'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'
import { CinematicBoundary } from './StorySceneHost.jsx'
import { useVisualEnv } from './visuals/VisualEnv.jsx'

// The game's opening animation (VISUALS.md V5): once per browser session, over the
// main menu, skippable, off with Options -> Display -> Intro animation. It never
// plays on the low-end tier or with Reduced motion, and it loads on demand.
const IntroPlayer = lazy(guard('cinematic', () => import('./visuals/cinematic/IntroPlayer.jsx')))
const KEY = 'elementa-intro-seen'

function seenThisSession() {
  try {
    return window.sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export default function IntroHost() {
  const { display } = useGameSettings()
  const { quality, reduced } = useVisualEnv()
  const [open, setOpen] = useState(() => !seenThisSession())
  if (!open || !display.introAnimation || quality === 'low' || reduced) return null
  function done() {
    try {
      window.sessionStorage.setItem(KEY, '1')
    } catch {
      // private mode: the intro may play again on reload, which is harmless
    }
    setOpen(false)
  }
  return (
    <CinematicBoundary fallback={null}>
      <Suspense fallback={null}>
        <IntroPlayer onDone={done} />
      </Suspense>
    </CinematicBoundary>
  )
}
