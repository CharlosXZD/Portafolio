import { Suspense, lazy, useCallback, useState } from 'react'

// The map's drawing is its own chunk (VISUALS.md V6), so the first screen's JavaScript does not grow.
// It is asked for as soon as this file loads, so it is nearly always there before the first shop
// opens; until then the slate shows an empty sheet of the right size. The full-screen map loads
// the first time someone opens it.
const loadCanvas = () => import('./visuals/map/MapCanvas.jsx')
const MapCanvas = lazy(loadCanvas)
loadCanvas()
const MapFull = lazy(() => import('./visuals/map/MapFull.jsx'))

/**
 * The Road (GDD §28, drawn as a map since V6). Rows are the shops you visit after each round, drawn
 * bottom to top; the trails show where each shop leads, and the shops linked from where you stand
 * are the ones you can pick. Boss rounds are marked on the left of the row that follows them.
 *
 * This is the entry every screen uses, with the same props it always had. `variant` says how much
 * of the map it is: 'compact' (the default: a fixed window onto the next rows, with a small button
 * that opens the big map when `expandable`), 'panel' (the whole Road in a box you can drag and
 * zoom) or 'full' (the full-screen map itself). The data model lives in engine/map.js and does not
 * change; every action (CHOOSE_PATH and Atlas's services) still goes through the callbacks.
 */
export default function RoadMap({ expandable = false, variant = 'compact', onPick, ...rest }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const openFull = useCallback(() => setOpen(true), [])
  return (
    <>
      <Suspense fallback={<div aria-hidden="true" style={{ width: rest.width ?? 220, height: Math.max(1, (rest.toRound - rest.fromRound + 1) * (rest.rowHeight ?? 64)), background: 'rgba(0,0,0,0.18)' }} />}>
        <MapCanvas {...rest} variant={variant} onPick={onPick} onOpenFull={variant === 'compact' && expandable ? openFull : null} />
      </Suspense>
      {open && (
        <Suspense fallback={null}>
          <MapFull state={rest.state} onPick={onPick} onClose={close} />
        </Suspense>
      )}
    </>
  )
}
