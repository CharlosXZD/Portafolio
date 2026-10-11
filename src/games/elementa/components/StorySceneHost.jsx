import { Component, Suspense, lazy } from 'react'
import StoryScene from './StoryScene.jsx'
import { useVisualEnv } from './visuals/VisualEnv.jsx'

// The one door into story scenes (VISUALS.md V5). It plays the cinematic scene
// (a Remotion composition, loaded on demand) and falls back to the old typed
// StoryScene on the low-end tier and if the cinematic chunk fails to load or
// crashes. Reduced motion stays in the cinematic scene, which then shows
// still shots (CinematicScene.jsx). The Remotion chunk is never in the first
// load: `preloadCinematics` fetches it during an earlier screen.

const load = () => import('./visuals/cinematic/CinematicScene.jsx')
const CinematicScene = lazy(load)

let preloaded = false
/** Fetches the cinematic chunk ahead of the first scene (idle time, a screen before it is needed). */
export function preloadCinematics() {
  if (preloaded) return
  preloaded = true
  load().catch(() => {
    preloaded = false
  })
}

/** Catches a crash in the lazy cinematic code and hands over to the plain fallback. */
export class CinematicBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.warn('Cinematic failed, using the plain version:', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Drop-in for StoryScene: same props, the cinematic version when the device can show it. */
export default function StorySceneHost({ id, onDone }) {
  const { quality } = useVisualEnv()
  const plain = <StoryScene id={id} onDone={onDone} />
  if (quality === 'low') return plain
  return (
    <CinematicBoundary fallback={plain}>
      <Suspense fallback={<div className="fixed inset-0 z-[80]" style={{ background: '#07050c' }} />}>
        <CinematicScene id={id} onDone={onDone} />
      </Suspense>
    </CinematicBoundary>
  )
}
