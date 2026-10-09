// One shared animation clock for every cached 3D item on screen, so ten
// items cost one requestAnimationFrame loop instead of ten. It also keeps a
// running total of the time its subscribers take, which the Visual Lab shows
// (a number that stays honest even when the browser throttles frames).
const subs = new Set()
let raf = 0
let spent = 0
let frames = 0

function loop(now) {
  const t0 = performance.now()
  subs.forEach((fn) => fn(now))
  spent += performance.now() - t0
  frames++
  raf = subs.size ? requestAnimationFrame(loop) : 0
}

/** Calls fn(now) every frame until the returned function is called. */
export function subscribeTicker(fn) {
  subs.add(fn)
  if (!raf) raf = requestAnimationFrame(loop)
  return () => {
    subs.delete(fn)
  }
}

/** Average microseconds the subscribers spent per frame, and how many there are. */
export function tickerStats() {
  return { frames, avgUs: frames ? (spent / frames) * 1000 : 0, subscribers: subs.size }
}
