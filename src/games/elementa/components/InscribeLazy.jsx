import { Suspense, lazy } from 'react'
import { guard } from '../utils/forceFail.js'
import LazyBoundary from './LazyBoundary.jsx'
import LoadFailed from './LoadFailed.jsx'

// The Inscribe scroll loads when a rune or graft first opens it (VISUALS.md V4.7). If its chunk cannot
// load, a plain note with a Back button shows (the rune stays in the bag).
const InscribeScreen = lazy(guard('gallery', () => import('./InscribeScreen.jsx')))

export default function InscribeLazy(props) {
  return (
    <LazyBoundary fallback={<LoadFailed onBack={props.onCancel ?? props.onClose ?? props.onBack} />}>
      <Suspense fallback={null}>
        <InscribeScreen {...props} />
      </Suspense>
    </LazyBoundary>
  )
}
