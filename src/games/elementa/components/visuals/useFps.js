import { useEffect, useState } from 'react'

/** Frames per second and the slowest frame (ms) over the last half second. */
export function useFps() {
  const [fps, setFps] = useState({ fps: 0, worst: 0 })
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let frames = 0
    let worst = 0
    let windowStart = last
    const tick = (now) => {
      frames++
      worst = Math.max(worst, now - last)
      last = now
      if (now - windowStart >= 500) {
        setFps({ fps: Math.round((frames * 1000) / (now - windowStart)), worst: Math.round(worst) })
        frames = 0
        worst = 0
        windowStart = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}
