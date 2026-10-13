// Forced fallbacks (VISUALS.md V8.3). The Visual Lab's Fallbacks page stores a list of things to
// break in localStorage ('elementa-force-fail'); the lazy loaders below pass through `guard`, which
// rejects when its kind is on the list, so the real fallback runs. Nothing in a normal session
// ever sets the key. Kinds: cinematic, rooms, map, items, rigs, gallery.
const KEY = 'elementa-force-fail'
export const FORCE_KINDS = ['cinematic', 'rooms', 'map', 'items', 'rigs', 'gallery']

export function forcedKinds() {
  try {
    return (window.localStorage.getItem(KEY) || '').split(',').filter(Boolean)
  } catch {
    return []
  }
}
export function setForcedKinds(list) {
  try {
    if (list.length) window.localStorage.setItem(KEY, list.join(','))
    else window.localStorage.removeItem(KEY)
  } catch {
    // no storage: nothing to force
  }
}

/** Wraps a dynamic import: it rejects instead when `kind` is being forced to fail. */
export function guard(kind, load) {
  return () => (forcedKinds().includes(kind) ? Promise.reject(new Error(`forced failure: ${kind}`)) : load())
}
