import { Suspense, lazy, useEffect, useState } from 'react'
import KeeperSprite from '../KeeperSprite.jsx'
import { guard } from '../../utils/forceFail.js'
import LazyBoundary from '../LazyBoundary.jsx'

// The shop's keeper: the rig (a lazy chunk) with the flat sprite as the fallback while it loads, so
// the layout never jumps. The rig is a bust drawn on a 14 px grid, shown at a whole number of screen
// pixels per art pixel. In the shop scene (`stage`) the keeper stands behind the counter: the bottom
// row is cropped so the counter hides the waist and the hands rest on its far edge (VISUALS.md V4.1).
const ShopKeeper = lazy(guard('rigs', () => import('./ShopKeeper.jsx')))

function useMedia(query) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches))
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const fn = () => setOn(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [query])
  return on
}

export default function ShopPortrait({ id, size = 72, lineLength, stage = false }) {
  const wide = useMedia('(min-width: 1500px)')
  const desk = useMedia('(min-width: 1024px)')
  const rig = stage ? (wide ? 126 : desk ? 112 : 84) : wide ? 112 : 70
  const flat = <KeeperSprite id={id} size={stage ? rig * 0.8 : size} />
  return (
    <LazyBoundary fallback={flat}>
      <Suspense fallback={flat}>
        <ShopKeeper id={id} size={rig} lineLength={lineLength} crop={stage ? 17 : undefined} />
      </Suspense>
    </LazyBoundary>
  )
}
