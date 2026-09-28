/**
 * The optional CRT filter (Options → Visuals): scanlines, a corner
 * vignette, and a faint per-channel color offset (chromatic aberration),
 * all CSS/SVG, no images. Two pieces:
 *  - `ChromaticFilterDefs` is an invisible <svg> holding the actual filter
 *    definition; it only needs to exist once in the document for
 *    `filter: url(#elementa-chromatic)` to work anywhere.
 *  - `CrtScanlines` is the visible pointer-events-none overlay (scanlines
 *    + vignette) painted on top of the game.
 * Kept as two exports so ElementaGame can put the filter defs once at the
 * root and apply the `filter` CSS property to the whole game container,
 * while the scanline overlay sits as a sibling layer above everything.
 */
export function ChromaticFilterDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="elementa-chromatic" colorInterpolationFilters="sRGB">
          {/* Each channel isolation must branch from SourceGraphic
              explicitly: leaving `in` off a non-first primitive defaults to
              the previous primitive's result, not the source, which
              chained all three into one wash instead of three offset
              copies of the original image. */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="red"
          />
          <feOffset in="red" dx="-1.5" dy="0" result="redOffset" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="green"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="blue"
          />
          <feOffset in="blue" dx="1.5" dy="0" result="blueOffset" />
          <feBlend in="redOffset" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blueOffset" mode="screen" />
        </filter>
      </defs>
    </svg>
  )
}

export function CrtScanlines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        backgroundImage:
          'repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 3px)',
        boxShadow: 'inset 0 0 140px 40px rgba(0,0,0,0.55)',
        mixBlendMode: 'multiply',
      }}
    />
  )
}
