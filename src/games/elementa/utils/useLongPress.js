import { useCallback, useMemo, useRef } from 'react'

// Click-and-hold (EXPANSION.md P5 to P9): pressing for about 450 ms runs
// `onLong` instead of a click. `handlers` goes on the pressable element;
// `consumed()` is checked in its click handler (or a capture handler on a
// wrapper) to swallow the click that follows a long press. Moving more than
// a few pixels (a drag) cancels it, and right-click counts as a long press,
// so mouse and touch players share one way in.
export const LONG_PRESS_MS = 450

export function useLongPress(onLong, { enabled = true, ms = LONG_PRESS_MS } = {}) {
  const timer = useRef(null)
  const fired = useRef(false)
  const origin = useRef(null)
  const latest = useRef(onLong)
  latest.current = onLong

  const clear = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
  }, [])

  const handlers = useMemo(
    () => ({
      onPointerDown(e) {
        if (!enabled || e.button !== 0) return
        fired.current = false
        origin.current = { x: e.clientX, y: e.clientY }
        clear()
        timer.current = setTimeout(() => {
          fired.current = true
          latest.current()
        }, ms)
      },
      onPointerMove(e) {
        if (!timer.current || !origin.current) return
        if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > 8) clear()
      },
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
      onContextMenu(e) {
        if (!enabled) return
        e.preventDefault()
        clear()
        fired.current = true
        latest.current()
      },
    }),
    [enabled, ms, clear],
  )

  const consumed = useCallback(() => {
    const was = fired.current
    fired.current = false
    return was
  }, [])

  return { handlers, consumed }
}
