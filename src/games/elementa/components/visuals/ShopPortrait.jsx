import { Suspense, lazy } from 'react'
import KeeperSprite from '../KeeperSprite.jsx'

// The shop header's keeper: the rig (a lazy chunk) with the flat sprite as
// the fallback while it loads, so the header never jumps.
const ShopKeeper = lazy(() => import('./ShopKeeper.jsx'))

export default function ShopPortrait({ id, size = 72, lineLength }) {
  return (
    <Suspense fallback={<KeeperSprite id={id} size={size} />}>
      <ShopKeeper id={id} size={size} lineLength={lineLength} />
    </Suspense>
  )
}
