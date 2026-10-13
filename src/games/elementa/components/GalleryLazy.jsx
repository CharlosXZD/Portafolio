import { Suspense, lazy } from 'react'
import { guard } from '../utils/forceFail.js'
import LazyBoundary from './LazyBoundary.jsx'
import LoadFailed from './LoadFailed.jsx'

// The Gallery (with its Library room and its cabinets) loads only when it is opened (VISUALS.md V4.7),
// so it stays out of the first load. If its chunk cannot load, a plain note with a Back button shows.
const GalleryScreen = lazy(guard('gallery', () => import('./GalleryScreen.jsx')))

export default function GalleryLazy(props) {
  return (
    <LazyBoundary fallback={<LoadFailed onBack={props.onBack} />}>
      <Suspense fallback={null}>
        <GalleryScreen {...props} />
      </Suspense>
    </LazyBoundary>
  )
}
