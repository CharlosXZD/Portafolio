import { useMemo } from 'react'
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { TITLE_CARD } from './titleCardConfig.js'

// The V1 Remotion spike: a 6 second title card (180 frames at 30 fps) with
// three layers of parallax stars, a turning ring of the four element
// colors, the logo popping in, and a bilingual line that arrives word by
// word. The LAST frame is the finished card, so Reduced motion can simply
// show it. All motion is driven by the frame number, never by CSS.

const { width: W, height: H } = TITLE_CARD
const INK = '#120c1a'
const SKY = ['#07060e', '#0c0a18', '#131026', '#1b1636', '#261c48', '#352358', '#4a2c66']
const ELEMENT_COLORS = ['#e5533d', '#3d8fe5', '#cfe0e8', '#c89a5c'] // fire, water, air, earth


const LINES = {
  en: 'Four elements. One cast.',
  es: 'Cuatro elementos. Una tirada.',
}

// Tiny seeded generator so the stars are the same on every render.
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// One layer of stars as a single box-shadow list (two copies side by side,
// so the layer can wrap around without a seam).
function starShadow(seed, count, size) {
  const rnd = seeded(seed)
  const shadows = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rnd() * (W / size)) * size
    const y = Math.floor(rnd() * (H / size)) * size
    const c = rnd() > 0.82 ? '#ffe9a0' : '#e8f4ff'
    shadows.push(`${x}px ${y}px 0 ${c}`, `${x + W}px ${y}px 0 ${c}`)
  }
  return shadows.join(',')
}

const STAR_LAYERS = [
  { seed: 11, count: 46, size: 4, speed: 0.12, opacity: 0.55 },
  { seed: 29, count: 26, size: 6, speed: 0.38, opacity: 0.8 },
  { seed: 47, count: 12, size: 8, speed: 0.95, opacity: 1 },
]

export default function TitleCard({ lang = 'en' }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const shadows = useMemo(() => STAR_LAYERS.map((l) => starShadow(l.seed, l.count, l.size)), [])
  const words = (LINES[lang] ?? LINES.en).split(' ')
  const out = Easing.bezier(0.23, 1, 0.32, 1)

  const ringIn = interpolate(frame, [0, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: out })
  const logoPop = spring({ frame: frame - 18, fps, config: { damping: 11, mass: 0.7, stiffness: 140 } })
  const logoFade = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const glint = interpolate(frame, [96, 126], [-20, 120], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) })

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', background: INK, fontFamily: "'Press Start 2P', 'Pixelify Sans', monospace" }}>
      {/* Sky: seven flat bands with a dithered seam between each. */}
      {SKY.map((c, i) => (
        <div key={c} style={{ position: 'absolute', left: 0, right: 0, top: (H / SKY.length) * i, height: H / SKY.length + 16, background: c }}>
          {i > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -8,
                height: 16,
                backgroundImage: `conic-gradient(${c} 25%, ${SKY[i - 1]} 0 50%, ${c} 0 75%, ${SKY[i - 1]} 0)`,
                backgroundSize: '8px 8px',
              }}
            />
          )}
        </div>
      ))}

      {/* Parallax stars: far layers drift slowly, near layers quickly. */}
      {STAR_LAYERS.map((l, i) => (
        <div
          key={l.seed}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: l.size,
            height: l.size,
            boxShadow: shadows[i],
            opacity: l.opacity * (i === 0 ? 0.8 + 0.2 * Math.sin(frame / 9) : 1),
            transform: `translateX(${-((frame * l.speed * 4) % W)}px)`,
          }}
        />
      ))}

      {/* A ring of the four element colors, turning slowly behind the logo. */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0, opacity: ringIn * 0.9, scale: String(0.9 + 0.1 * ringIn) }}
        shapeRendering="crispEdges"
      >
        <g transform={`rotate(${frame * 0.5} ${W / 2} 250)`}>
          <circle cx={W / 2} cy="250" r="168" fill="none" stroke="#352358" strokeWidth="8" strokeDasharray="16 16" />
          {ELEMENT_COLORS.map((c, i) => {
            const a = (i / 4) * Math.PI * 2
            return <rect key={c} x={W / 2 + Math.cos(a) * 168 - 12} y={250 + Math.sin(a) * 168 - 12} width="24" height="24" fill={c} stroke={INK} strokeWidth="4" />
          })}
        </g>
      </svg>

      {/* The logo pops in with a little overshoot, then a glint sweeps over it. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 196, textAlign: 'center', opacity: logoFade, scale: String(0.82 + 0.18 * logoPop) }}>
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            fontSize: 76,
            letterSpacing: 6,
            color: '#ffd166',
            textShadow: `0 8px 0 #c46a24, 0 0 0 ${INK}, 6px 6px 0 ${INK}, -4px 0 0 ${INK}, 4px 0 0 ${INK}, 0 -4px 0 ${INK}`,
          }}
        >
          ELEMENTA
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(100deg, transparent ${glint - 12}%, rgba(255,255,255,0.75) ${glint}%, transparent ${glint + 12}%)`,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
      </div>

      {/* The line arrives one word at a time. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 336, display: 'flex', justifyContent: 'center', gap: 18, fontSize: 22, color: '#efe6d8' }}>
        {words.map((w, i) => {
          const t = interpolate(frame, [72 + i * 6, 72 + i * 6 + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: out })
          return (
            <span key={`${w}-${i}`} style={{ opacity: t, translate: `0 ${(1 - t) * 14}px`, textShadow: `3px 3px 0 ${INK}` }}>
              {w}
            </span>
          )
        })}
      </div>

      {/* The four marks pop in under the line, each a beat apart. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {ELEMENT_COLORS.map((c, i) => {
          const p = spring({ frame: frame - (112 + i * 5), fps, config: { damping: 9, mass: 0.5 } })
          return <div key={c} style={{ width: 20, height: 20, background: c, border: `4px solid ${INK}`, scale: String(0.6 + 0.4 * Math.max(0, p)), opacity: Math.min(1, Math.max(0, p) * 3) }} />
        })}
      </div>

      {/* Soft vignette, and a fade-in from black at the very start. */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(7,6,14,0.7) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: INK, opacity: interpolate(frame, [0, 14], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
    </div>
  )
}
