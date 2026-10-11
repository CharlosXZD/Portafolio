import { Suspense, lazy } from 'react'

// The Inscribe scroll loads when a rune or graft first opens it (VISUALS.md V4.7).
const InscribeScreen = lazy(() => import('./InscribeScreen.jsx'))

export default function InscribeLazy(props) {
  return (
    <Suspense fallback={null}>
      <InscribeScreen {...props} />
    </Suspense>
  )
}
