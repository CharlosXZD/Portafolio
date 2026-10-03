import { useLayoutEffect, useRef, useState } from 'react'

const EDGE = 8

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi))

/**
 * Positions a floating panel (an item popover, a hover tooltip) next to
 * whatever it was rendered inside, but draws it in a portal on top of the
 * whole game instead of inside its parent.
 *
 * Why: a popover that lives inside its item's cell can never be painted
 * above a later sibling that has its own stacking layer (a hover-lifted
 * cell, the sticky sidebar, the shuffling shelves), so neighbors used to
 * cover it. In the portal it always sits on top, flips to the other side
 * when there is no room, and stays on screen.
 *
 * Usage: render `<span ref={markerRef} className="hidden" />` where the
 * panel used to be (its parent is the anchor), and portal the panel into
 * `root` with the returned `pos` (left and top are relative to `root`).
 * `pos.place` is the side it ended up on, `pos.ax` / `pos.ay` where the
 * pointer arrow should sit along its edge.
 */
export function useFloating(preferred = 'top', gap = 16) {
  const markerRef = useRef(null)
  const panelRef = useRef(null)
  const [pos, setPos] = useState(null)
  const root = typeof document === 'undefined' ? null : document.querySelector('.elementa-root') ?? document.body

  useLayoutEffect(() => {
    let raf = 0
    function measure() {
      const anchor = markerRef.current?.parentElement
      const panel = panelRef.current
      if (anchor && panel && root) {
        const a = anchor.getBoundingClientRect()
        // offsetWidth and offsetHeight ignore the entrance scale animation.
        const w = panel.offsetWidth
        const h = panel.offsetHeight
        const vw = window.innerWidth
        const vh = window.innerHeight
        let place = preferred
        if (place === 'top' && a.top - h - gap < EDGE && vh - a.bottom - h - gap > EDGE) place = 'bottom'
        else if (place === 'bottom' && vh - a.bottom - h - gap < EDGE && a.top - h - gap > EDGE) place = 'top'
        else if (place === 'right' && a.right + gap + w > vw - EDGE && a.left - gap - w > EDGE) place = 'left'
        else if (place === 'left' && a.left - gap - w < EDGE && a.right + gap + w < vw - EDGE) place = 'right'
        let left
        let top
        if (place === 'top' || place === 'bottom') {
          left = a.left + a.width / 2 - w / 2
          top = place === 'top' ? a.top - h - gap : a.bottom + gap
        } else {
          top = a.top + a.height / 2 - h / 2
          left = place === 'right' ? a.right + gap : a.left - gap - w
        }
        left = clamp(left, EDGE, vw - w - EDGE)
        top = clamp(top, EDGE, vh - h - EDGE)
        const rr = root.getBoundingClientRect()
        const next = {
          left: Math.round(left - rr.left),
          top: Math.round(top - rr.top),
          place,
          ax: Math.round(clamp(a.left + a.width / 2 - left, 16, w - 16)),
          ay: Math.round(clamp(a.top + a.height / 2 - top, 16, h - 16)),
        }
        setPos((prev) =>
          prev && prev.left === next.left && prev.top === next.top && prev.place === next.place && prev.ax === next.ax && prev.ay === next.ay
            ? prev
            : next,
        )
      }
      raf = requestAnimationFrame(measure)
    }
    measure()
    return () => cancelAnimationFrame(raf)
  }, [preferred, gap, root])

  return { markerRef, panelRef, pos, root }
}

/** The pointer triangle on the edge facing the anchor. */
export function arrowStyle(pos, color) {
  const size = 7
  const clear = `${size}px solid transparent`
  const solid = `${size}px solid ${color}`
  const base = { position: 'absolute', width: 0, height: 0 }
  switch (pos?.place) {
    case 'bottom':
      return { ...base, bottom: '100%', left: pos.ax, marginLeft: -size, borderLeft: clear, borderRight: clear, borderBottom: solid }
    case 'right':
      return { ...base, right: '100%', top: pos.ay, marginTop: -size, borderTop: clear, borderBottom: clear, borderRight: solid }
    case 'left':
      return { ...base, left: '100%', top: pos.ay, marginTop: -size, borderTop: clear, borderBottom: clear, borderLeft: solid }
    default:
      return { ...base, top: '100%', left: pos?.ax ?? 0, marginLeft: -size, borderLeft: clear, borderRight: clear, borderTop: solid }
  }
}
