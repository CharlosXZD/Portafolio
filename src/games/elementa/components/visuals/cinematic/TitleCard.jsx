import { useMemo } from 'react'
import { Easing, interpolate, useCurrentFrame } from 'remotion'
import strings from '../../../../../i18n/strings.js'
import { ELEMENTS } from '../../../data/elements.js'
import PixelIcon from '../../PixelIcon.jsx'
import { TITLE_CARD } from './titleCardConfig.js'

// The V1 Remotion spike, rebuilt to read as the main menu in motion
// (VISUALS.md section 0b): the real banded-gold `el-logo`, the game's own
// fonts (the logo's Press Start 2P, the body font for the tagline), the
// tagline read from the strings file, and the real element PixelIcons, in
// their own colors, orbiting the logo. Parallax stars sit behind, on the
// menu's own night-sky colors. The LAST frame is the finished card, so
// Reduced motion can simply show it. All motion is driven by the frame
// number, never by CSS. It renders inside `.elementa-root`, so the game's
// CSS (logo, fonts, tokens) applies as it does everywhere else.

const { width: W, height: H } = TITLE_CARD
const INK = '#120c1a'
// The main menu's sky (PixelBackdrop `menu`).
const SKY = ['#07060e', '#0c0a18', '#131026', '#1b1636', '#261c48', '#352358', '#4a2c66']
// Same four elements, same order and same earth tint as the menu's ElementOrbs.
const ORBS = ['fire', 'water', 'earth', 'air']
const orbColor = (id) => (id === 'earth' ? '#c89a5c' : ELEMENTS[id].color)
// The orbit is a wide, shallow ellipse around the logo (the icons pass behind it), clear of the tagline.
const CENTER_Y = 224
const RADIUS_X = 300
const RADIUS_Y = 96

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
  const shadows = useMemo(() => STAR_LAYERS.map((l) => starShadow(l.seed, l.count, l.size)), [])
  const tagline = strings['elementa.menu.tagline'][lang] ?? strings['elementa.menu.tagline'].en
  const words = tagline.split(' ')
  const out = Easing.bezier(0.23, 1, 0.32, 1)
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

  // The menu's own entrance: the block rises 12px and fades in with a soft overshoot.
  const enter = interpolate(frame, [4, 30], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.3, 0.64, 1) })
  const enterOpacity = interpolate(frame, [4, 22], [0, 1], { ...clamp, easing: out })
  const ringIn = interpolate(frame, [10, 50], [0, 1], { ...clamp, easing: out })
  // The orbit slows to a stop by the last frame, where each icon rests at a corner of the logo, clear of it.
  const spin = interpolate(frame, [0, 179], [1, 0], { ...clamp, easing: Easing.out(Easing.quad) }) * 540

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', background: INK, fontFamily: 'var(--body-font)' }}>
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

      {/* The four element marks orbit the logo: the real PixelIcons, upright, in their own colors. */}
      {ORBS.map((id, i) => {
        const a = ((i / ORBS.length) * 360 + 45 + spin) * (Math.PI / 180)
        const x = W / 2 + Math.cos(a) * RADIUS_X
        const y = CENTER_Y + Math.sin(a) * RADIUS_Y
        return (
          <span
            key={id}
            style={{
              position: 'absolute',
              left: x - 21,
              top: y - 21,
              opacity: ringIn,
              lineHeight: 0,
              filter: `drop-shadow(0 0 8px ${orbColor(id)}88)`,
            }}
          >
            <PixelIcon name={id} size={42} color={orbColor(id)} hi="#fff4d6" />
          </span>
        )
      })}

      {/* Logo and tagline, laid out like the main menu. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 176,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 74,
          opacity: enterOpacity,
          translate: `0 ${(1 - enter) * 12}px`,
        }}
      >
        <h1 className="el-logo select-none tracking-tight" style={{ fontSize: 88, margin: 0 }}>
          Elementa
        </h1>
        <p style={{ display: 'flex', gap: 12, margin: 0, fontSize: 26, color: 'var(--text-dim)' }}>
          {words.map((w, i) => {
            const t = interpolate(frame, [64 + i * 7, 64 + i * 7 + 14], [0, 1], { ...clamp, easing: out })
            return (
              <span key={`${w}-${i}`} style={{ opacity: t, translate: `0 ${(1 - t) * 10}px` }}>
                {w}
              </span>
            )
          })}
        </p>
      </div>

      {/* Soft vignette, and a fade-in from black at the very start. */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(7,6,14,0.7) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: INK, opacity: interpolate(frame, [0, 14], [1, 0], clamp) }} />
    </div>
  )
}
