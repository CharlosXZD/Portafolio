import { useEffect, useState } from 'react'
import { findImageOverride, visualEntry } from '../../data/visualRegistry.js'

/**
 * What an id resolves to right now: a hand-drawn image if a file named after
 * the id exists (the swap rule, see data/visualRegistry.js), otherwise the
 * registry's own kind. `status` is 'checking' for the moment the file lookup
 * is in flight; callers render the registry version meanwhile, so nothing
 * ever waits on the lookup.
 */
export function useVisual(id) {
  const entry = visualEntry(id)
  const [override, setOverride] = useState({ id: null, src: null })
  useEffect(() => {
    let live = true
    findImageOverride(id).then((src) => live && setOverride({ id, src }))
    return () => {
      live = false
    }
  }, [id])
  const src = override.id === id ? override.src : null
  const status = override.id === id ? 'done' : 'checking'
  return { entry, kind: src ? 'image' : (entry?.kind ?? 'missing'), src, status }
}
