import { Suspense, lazy } from 'react'

// The Gallery (with its Library room and its cabinets) loads only when it is opened (VISUALS.md V4.7),
// so it stays out of the first load.
const GalleryScreen = lazy(() => import('./GalleryScreen.jsx'))

export default function GalleryLazy(props) {
  return (
    <Suspense fallback={null}>
      <GalleryScreen {...props} />
    </Suspense>
  )
}
