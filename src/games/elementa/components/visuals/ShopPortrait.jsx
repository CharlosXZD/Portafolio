import { Suspense, lazy, useEffect, useState } from 'react'
import KeeperSprite from '../KeeperSprite.jsx'

// The shop header's keeper: the rig (a lazy chunk) with the flat sprite as
// the fallback while it loads, so the header never jumps. The rig is a bust
// (VISUALS.md V3.1) drawn on a 14 px grid, so it is shown at a whole number of
// screen pixels per art pixel: 5x on a normal window, 8x on a wide one (the keeper
// "steps forward" when there is room), and the old sprite keeps its 72 px slot.
const ShopKeeper = lazy(() => import('./ShopKeeper.jsx'))

function useWide() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1500px)').matches)
  useEffect(() => {
    const mq = window.matchMedia?.('(min-width: 1500px)')
    if (!mq) return
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

export default function ShopPortrait({ id, size = 72, lineLength }) {
  const wide = useWide()
  const rig = wide ? 112 : 70
  return (
    <Suspense fallback={<KeeperSprite id={id} size={size} />}>
      <ShopKeeper id={id} size={rig} lineLength={lineLength} />
    </Suspense>
  )
}
