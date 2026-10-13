// Device capability probe for the visual overhaul (VISUALS.md, rule "fall
// back to the current static art on low-end devices"). Nothing here runs at
// import time; callers ask when they need to decide. `lowEndHint()` is a
// synchronous guess from hardware hints, `probeFrameRate()` measures real
// frames for a moment, and `getVisualQuality()` combines both once and
// remembers the answer for the session.

let cached = null
let pending = null

/** True when the browser reports a weak device or the player asked to save data. */
export function lowEndHint() {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency
  const memory = navigator.deviceMemory
  const saveData = navigator.connection?.saveData === true
  return saveData || (typeof cores === 'number' && cores <= 2) || (typeof memory === 'number' && memory <= 2)
}

/** Average frames per second over `ms` milliseconds of requestAnimationFrame. */
export function probeFrameRate(ms = 450) {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'undefined') return resolve(60)
    let frames = 0
    let start = 0
    function tick(now) {
      if (!start) start = now
      frames++
      if (now - start >= ms) resolve((frames * 1000) / (now - start))
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

/**
 * 'high' or 'low', decided once. A hidden tab never produces frames, so the
 * probe gives up after a short timeout and trusts the hardware hint instead.
 */
// A forced tier (VISUALS.md V8.3): `?quality=low` or `?quality=high` in the address, or the Lab's
// Fallbacks page, which stores it under 'elementa-force-quality'. Never set in a normal session.
function forcedQuality() {
  try {
    const q = new URLSearchParams(window.location.search).get('quality') ?? window.localStorage.getItem('elementa-force-quality')
    return q === 'low' || q === 'high' ? q : null
  } catch {
    return null
  }
}

export function getVisualQuality() {
  const forced = forcedQuality()
  if (forced) return Promise.resolve(forced)
  if (cached) return Promise.resolve(cached)
  if (pending) return pending
  pending = Promise.race([
    probeFrameRate(),
    new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
  ]).then((fps) => {
    cached = lowEndHint() || (fps != null && fps < 24) ? 'low' : 'high'
    pending = null
    return cached
  })
  return pending
}
