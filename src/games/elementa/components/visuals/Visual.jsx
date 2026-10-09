import { Suspense, lazy, useMemo } from 'react'
import { useVisual } from './useVisual.js'

const lazyCache = new Map()
function lazyFor(id, entry) {
  if (!lazyCache.has(id)) lazyCache.set(id, lazy(entry.load))
  return lazyCache.get(id)
}

/**
 * Renders a registry id at a whole-number pixel scale. `scale` multiplies the
 * image's native pixel size (images are never smoothed). Extra props go to
 * the registered component (merged over the entry's own props).
 */
export default function Visual({ id, scale = 4, native = 24, className, ...rest }) {
  const { entry, src } = useVisual(id)
  const Lazy = useMemo(() => (entry ? lazyFor(id, entry) : null), [id, entry])
  if (!entry) return null
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={className}
        style={{ width: native * scale, height: native * scale, imageRendering: 'pixelated', objectFit: 'contain' }}
      />
    )
  }
  return (
    <Suspense fallback={<span style={{ display: 'inline-block', width: native * scale, height: native * scale }} />}>
      <Lazy {...entry.props} {...rest} scale={scale} native={native} className={className} />
    </Suspense>
  )
}
