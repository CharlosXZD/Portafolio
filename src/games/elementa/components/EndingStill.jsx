import { Suspense, lazy, useMemo } from 'react'
import { guard } from '../utils/forceFail.js'
import { CinematicBoundary } from './StorySceneHost.jsx'
import { useVisualEnv } from './visuals/VisualEnv.jsx'

// An ending card as a short still with a slow push (VISUALS.md V5). It loads the
// cinematic chunk on demand and shows `fallback` (the old card) on the low-end
// tier and if anything fails.
const CinematicCard = lazy(() => guard('cinematic', () => import('./visuals/cinematic/CinematicScene.jsx'))().then((m) => ({ default: m.CinematicCard })))

/** The scene data of an ending card: one page, the ending's own text, no typing. */
export function endingScene(ending, label) {
  return {
    id: ending.id,
    still: true,
    color: ending.color,
    title: ending.name,
    label,
    pages: [{ portrait: { kind: 'ending', id: ending.id, boss: ending.boss }, speaker: ending.name, lines: [ending.text] }],
  }
}

export default function EndingStill({ ending, label, fallback }) {
  const { quality } = useVisualEnv()
  const scene = useMemo(() => endingScene(ending, label), [ending, label])
  if (quality === 'low') return fallback
  return (
    <CinematicBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <CinematicCard scene={scene} />
      </Suspense>
    </CinematicBoundary>
  )
}
