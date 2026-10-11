import { Easing, interpolate } from 'remotion'
import { mix } from '../../../utils/color.js'
import { ELEMENTS } from '../../../data/elements.js'
import PixelIcon from '../../PixelIcon.jsx'
import { H, LOOP, W } from './sceneLayout.js'

// The parts a shot is built from (VISUALS.md V5): backdrops, effects, set pieces
// and the camera. Every one is a pure function of `t`, the page's time in
// frames, and nothing here uses CSS animation (Remotion renders by frame).
// Whatever keeps moving while a page waits for a press is periodic over LOOP
// frames, so the player can loop the wait without a seam (sceneLayout.js).
// Backdrops and effects are a handful of nodes each: bands, clip-path
// silhouettes and one box-shadow list per particle layer.

export const INK = '#120c1a'
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
const out = Easing.bezier(0.23, 1, 0.32, 1)
const TAU = Math.PI * 2

function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const cache = new Map()
function memo(key, make) {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key)
}

/** A list of box-shadow particles, tiled `tiles` times down a tile of height `tile`, so a layer can scroll by a whole tile without a seam. */
function field(seed, count, size, colors, tile, tiles) {
  return memo(`f${seed}-${count}-${size}-${tile}-${colors.join()}`, () => {
    const rnd = seeded(seed)
    const shadows = []
    for (let i = 0; i < count; i++) {
      const x = Math.floor((rnd() * W) / size) * size
      const y = Math.floor((rnd() * tile) / size) * size
      const c = colors[Math.floor(rnd() * colors.length)]
      for (let k = 0; k < tiles; k++) shadows.push(`${x}px ${y + k * tile}px 0 ${c}`)
    }
    return shadows.join(',')
  })
}

/** A silhouette: a stepped skyline of one-art-pixel-high columns, as a clip-path (one node). */
function skyline(seed, base, amp, step = 24) {
  return memo(`s${seed}-${base}-${amp}`, () => {
    const rnd = seeded(seed)
    const pts = [`0 100%`]
    let y = base
    for (let x = 0; x <= W; x += step) {
      y = Math.max(base - amp, Math.min(base + amp, y + (rnd() - 0.5) * amp * 0.9))
      const py = Math.round(y / 6) * 6
      pts.push(`${x}px ${py}px`, `${x + step}px ${py}px`)
    }
    pts.push(`100% 100%`)
    return `polygon(${pts.join(',')})`
  })
}

const flat = (style) => ({ position: 'absolute', ...style })

/** Seven flat bands from `top` to `bottom`, with a dithered seam between each, like the title card's sky. */
function Sky({ top, bottom }) {
  const bands = Array.from({ length: 7 }, (_, i) => mix(top, bottom, i / 6))
  return bands.map((c, i) => (
    <div key={i} style={flat({ left: 0, right: 0, top: (H / 7) * i, height: H / 7 + 16, background: c })}>
      {i > 0 && (
        <div
          style={flat({
            left: 0,
            right: 0,
            top: -8,
            height: 16,
            backgroundImage: `conic-gradient(${c} 25%, ${bands[i - 1]} 0 50%, ${c} 0 75%, ${bands[i - 1]} 0)`,
            backgroundSize: '8px 8px',
          })}
        />
      )}
    </div>
  ))
}

function Stars({ t, density = 1, y1 = H }) {
  const ph = t / LOOP
  const layers = [
    { seed: 11, count: Math.round(46 * density), size: 4, tw: 1, o: 0.6 },
    { seed: 29, count: Math.round(24 * density), size: 6, tw: 2, o: 0.85 },
  ]
  return layers.map((l) => (
    <div
      key={l.seed}
      style={flat({
        left: 0,
        top: 0,
        width: l.size,
        height: l.size,
        boxShadow: field(l.seed, l.count, l.size, ['#e8f4ff', '#ffe9a0'], y1, 1),
        opacity: l.o * (0.82 + 0.18 * Math.sin(TAU * ph * l.tw)),
      })}
    />
  ))
}

function Moon({ color, x = 700, y = 90, r = 54 }) {
  const c = mix('#fff6d6', color, 0.18)
  return (
    <div style={flat({ left: x - r, top: y - r, width: r * 2, height: r * 2, background: c, borderRadius: '50%', boxShadow: `0 0 0 6px ${mix(c, INK, 0.7)}, 0 0 60px 20px ${mix(c, INK, 0.55)}` })} />
  )
}

function Hills({ color, seed = 5, base = 410, amp = 60 }) {
  return (
    <>
      <div style={flat({ inset: 0, background: mix(INK, color, 0.14), clipPath: skyline(seed, base - 40, amp) })} />
      <div style={flat({ inset: 0, background: mix(INK, color, 0.04), clipPath: skyline(seed + 7, base + 30, amp * 0.7, 18) })} />
      <div style={flat({ left: 0, right: 0, bottom: 0, height: 70, background: mix(INK, '#000000', 0.5) })} />
      <div style={flat({ left: 0, right: 0, bottom: 70, height: 6, background: mix(INK, color, 0.1) })} />
    </>
  )
}

function Columns({ color, t }) {
  const shaft = 0.1 + 0.03 * Math.sin(TAU * (t / LOOP))
  return (
    <>
      {[70, 250, 670, 850].map((x, i) => (
        <div key={x} style={flat({ left: x - 34, top: 40 + (i % 2) * 14, width: 68, bottom: 70, background: mix(INK, color, 0.1), boxShadow: `inset -14px 0 0 ${mix(INK, '#000000', 0.45)}, 0 0 0 3px ${INK}` })}>
          <div style={flat({ left: -12, right: -12, top: 0, height: 22, background: mix(INK, color, 0.16), boxShadow: `0 0 0 3px ${INK}` })} />
        </div>
      ))}
      <div style={flat({ left: 0, right: 0, bottom: 0, height: 120, background: mix(INK, '#000000', 0.55), clipPath: 'polygon(0 30%, 100% 30%, 100% 100%, 0 100%)' })} />
      <div style={flat({ left: 330, width: 300, top: 0, height: 420, background: `linear-gradient(${mix(INK, color, 0.9)}, transparent)`, opacity: shaft, clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)' })} />
    </>
  )
}

function Grid({ color, t }) {
  const line = mix(INK, color, 0.28)
  return (
    <div
      style={flat({
        inset: 0,
        backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`,
        backgroundSize: '60px 60px',
        backgroundPosition: `0 ${(t % LOOP) }px`,
        opacity: 0.6,
      })}
    />
  )
}

function Water({ color, t }) {
  const ph = t / LOOP
  return (
    <>
      <div style={flat({ left: 0, right: 0, top: 360, bottom: 0, background: mix(INK, color, 0.2) })} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={flat({
            left: -64,
            right: -64,
            top: 372 + i * 40,
            height: 6,
            backgroundImage: `linear-gradient(90deg, ${mix(INK, color, 0.5)} 50%, transparent 50%)`,
            backgroundSize: `${64 + i * 24}px 6px`,
            transform: `translateX(${(((ph * (1 + (i % 2))) % 1) * (64 + i * 24))}px)`,
          })}
        />
      ))}
    </>
  )
}

function Ruins({ color }) {
  const dark = mix(INK, color, 0.07)
  return [120, 480, 820].map((x, i) => (
    <div key={x} style={flat({ left: x - 90, bottom: 70, width: 180, height: 200 + i * 40, background: dark, boxShadow: `0 0 0 3px ${INK}`, clipPath: 'polygon(0 100%, 0 30%, 12% 30%, 12% 10%, 30% 10%, 30% 24%, 70% 24%, 70% 0, 88% 0, 88% 40%, 100% 40%, 100% 100%)' })} />
  ))
}

/** The scene's backdrop. Colours come from the scene's own `color`, always darker than the foreground. */
export function Backdrop({ kind, color, t }) {
  const sky = (top, bottom) => <Sky top={mix(INK, color, top)} bottom={mix(INK, color, bottom)} />
  if (kind === 'void') {
    return (
      <>
        <div style={flat({ inset: 0, background: `radial-gradient(ellipse at 50% 55%, ${mix(INK, color, 0.2)} 0%, ${INK} 70%)` })} />
        <Stars t={t} density={0.7} />
      </>
    )
  }
  if (kind === 'hall') {
    return (
      <>
        {sky(0.04, 0.16)}
        <Columns color={color} t={t} />
      </>
    )
  }
  if (kind === 'code') {
    return (
      <>
        {sky(0.02, 0.1)}
        <Grid color={color} t={t} />
      </>
    )
  }
  if (kind === 'embers') {
    return (
      <>
        {sky(0.05, 0.5)}
        <Hills color={mix(color, '#000000', 0.2)} seed={9} amp={70} />
      </>
    )
  }
  if (kind === 'sea') {
    return (
      <>
        {sky(0.06, 0.34)}
        <Moon color={color} x={260} y={110} r={44} />
        <Water color={color} t={t} />
      </>
    )
  }
  if (kind === 'sky') {
    return (
      <>
        {sky(0.2, 0.55)}
        {[0, 1, 2].map((i) => (
          <div key={i} style={flat({ left: ((i * 380 + (t / LOOP) * 60) % 1100) - 140, top: 90 + i * 70, width: 220, height: 34, background: mix(INK, color, 0.8), opacity: 0.35, boxShadow: `40px -22px 0 ${mix(INK, color, 0.8)}, 110px 10px 0 ${mix(INK, color, 0.8)}` })} />
        ))}
        <Hills color={color} seed={3} amp={40} base={450} />
      </>
    )
  }
  if (kind === 'ruins') {
    return (
      <>
        {sky(0.05, 0.3)}
        <Stars t={t} density={0.5} y1={300} />
        <Ruins color={color} />
        <Hills color={color} seed={21} amp={30} base={470} />
      </>
    )
  }
  // 'night': stars, a moon, two ranges of hills.
  return (
    <>
      {sky(0.05, 0.32)}
      <Stars t={t} y1={320} />
      <Moon color={color} />
      <Hills color={color} />
    </>
  )
}

/** Particle effects: one box-shadow layer each, scrolling by a whole tile per LOOP so the wait loops cleanly. */
export function Effect({ kind, color, t }) {
  const ph = t / LOOP
  const warm = mix(color, '#ffd166', 0.55)
  if (kind === 'embers') {
    return [
      { seed: 3, count: 14, size: 4, tile: 135, o: 0.85 },
      { seed: 8, count: 8, size: 6, tile: 270, o: 1 },
    ].map((l) => (
      <div key={l.seed} style={flat({ left: 0, top: 0, width: l.size, height: l.size, boxShadow: field(l.seed, l.count, l.size, [warm, color, '#fff1c2'], l.tile, Math.ceil(H / l.tile) + 3), opacity: l.o, transform: `translate(${Math.sin(TAU * ph) * 10}px, ${-((ph % 1) * l.tile) - l.tile}px)` })} />
    ))
  }
  if (kind === 'snow') {
    return [
      { seed: 13, count: 16, size: 4, tile: 135, o: 0.8 },
      { seed: 17, count: 9, size: 6, tile: 270, o: 0.95 },
    ].map((l) => (
      <div key={l.seed} style={flat({ left: 0, top: 0, width: l.size, height: l.size, boxShadow: field(l.seed, l.count, l.size, ['#ffffff', '#dff3ff'], l.tile, Math.ceil(H / l.tile) + 3), opacity: l.o, transform: `translate(${Math.sin(TAU * ph) * 14}px, ${(ph % 1) * l.tile - l.tile}px)` })} />
    ))
  }
  if (kind === 'motes') {
    const c = mix(color, '#ffffff', 0.45)
    return (
      <div style={flat({ left: 0, top: 0, width: 6, height: 6, boxShadow: field(23, 18, 6, [c, mix(color, '#ffffff', 0.7)], 90, Math.ceil(H / 90) + 3), opacity: 0.55, transform: `translate(${Math.sin(TAU * ph) * 16}px, ${-((ph % 1) * 90) - 90}px)` })} />
    )
  }
  if (kind === 'stars') return <Stars t={t} density={0.6} />
  if (kind === 'glitch') {
    const k = Math.floor(t / 3) % 20
    const rnd = seeded(k * 7919 + 13)
    const bars = Array.from({ length: 5 }, () => ({ y: Math.floor(rnd() * 30) * 18, h: 6 + Math.floor(rnd() * 5) * 6, dx: Math.floor((rnd() - 0.5) * 80), on: rnd() > 0.45, c: rnd() > 0.5 ? color : '#7ad8ff' }))
    return bars.map((b, i) =>
      b.on ? <div key={i} style={flat({ left: 0, right: 0, top: b.y, height: b.h, background: b.c, opacity: 0.22, transform: `translateX(${b.dx}px)`, mixBlendMode: 'screen' })} /> : null,
    )
  }
  if (kind === 'ink') {
    const grow = interpolate(t, [0, 240], [0, 1], clamp)
    return [
      [60, 0.5], [210, 0.8], [380, 0.6], [560, 0.9], [740, 0.55], [880, 0.7],
    ].map(([x, h], i) => (
      <div key={i} style={flat({ left: x - 30, top: 0, width: 60, height: 40 + h * grow * 230, background: INK, opacity: 0.88, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 70% 100%, 30% 88%, 0 100%)' })} />
    ))
  }
  if (kind === 'rings') {
    return [0, 1].map((i) => {
      const p = (((ph * 1 + i / 2) % 1) + 1) % 1
      const s = 120 + p * 520
      return <div key={i} style={flat({ left: W / 2 - s / 2, top: 250 - s / 2, width: s, height: s, borderRadius: '50%', border: `4px solid ${color}`, opacity: (1 - p) * 0.5 })} />
    })
  }
  return null
}

/** Set pieces: the one big thing a hero scene is about, between the backdrop and the character. */
export function Piece({ piece, color, t, tEnd, pageIndex }) {
  if (!piece) return null
  const grow = interpolate(t, [0, tEnd], [0, 1], { ...clamp, easing: out })
  const ph = t / LOOP
  if (piece.kind === 'door') {
    const open = pageIndex === 0 ? grow : 1
    const gap = 8 + open * 150
    return (
      <div style={flat({ left: W / 2 - 110, top: 110, width: 220, height: 330, background: mix(INK, '#c9a46b', 0.35), boxShadow: `0 0 0 6px ${INK}, 0 0 0 12px ${mix(INK, '#c9a46b', 0.25)}` })}>
        <div style={flat({ left: 110 - gap / 2, top: 8, width: gap, bottom: 0, background: `linear-gradient(${mix('#fff6d6', color, 0.2)}, ${mix(INK, color, 0.5)})`, boxShadow: `0 0 ${30 + open * 60}px ${10 + open * 30}px ${color}66` })} />
        <div style={flat({ left: 0, top: 8, width: 102 - gap / 2, bottom: 0, background: mix(INK, '#7a5530', 0.5), boxShadow: `inset -6px 0 0 ${INK}` })} />
        <div style={flat({ right: 0, top: 8, width: 102 - gap / 2, bottom: 0, background: mix(INK, '#7a5530', 0.5), boxShadow: `inset 6px 0 0 ${INK}` })} />
      </div>
    )
  }
  if (piece.kind === 'bloom') {
    return [0, 1, 2].map((i) => {
      const r = (60 + grow * (520 - i * 130)) * (1 + 0.02 * Math.sin(TAU * ph))
      return <div key={i} style={flat({ left: W / 2 - r, top: 270 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: mix(color, '#ffffff', 0.4 + i * 0.25), opacity: 0.32 + 0.05 * i })} />
    })
  }
  if (piece.kind === 'sigil') {
    const spin = Math.sin(TAU * ph) * 5
    return (
      <span style={flat({ left: W / 2 - 230, top: 40, lineHeight: 0, opacity: 0.3 * grow, transform: `rotate(${spin}deg) scale(${0.9 + 0.1 * grow})` })}>
        <PixelIcon name={piece.icon} size={460} color={ELEMENTS[piece.icon]?.color ?? color} hi="#fffaf0" />
      </span>
    )
  }
  return null
}

/** The four elements around the character (the Primordial's pieces), swaying on a ring. */
export function Orbs({ color, t, tEnd }) {
  const grow = interpolate(t, [0, tEnd * 0.6], [0, 1], { ...clamp, easing: out })
  const ph = t / LOOP
  return ['fire', 'water', 'earth', 'air'].map((id, i) => {
    const a = (i * 90 + 45 + Math.sin(TAU * ph) * 24) * (Math.PI / 180)
    const x = W / 2 + Math.cos(a) * 330 * grow
    const y = 250 + Math.sin(a) * 120 * grow
    const c = id === 'earth' ? '#c89a5c' : ELEMENTS[id].color
    return (
      <span key={id} style={flat({ left: x - 32, top: y - 32, lineHeight: 0, opacity: grow, filter: `drop-shadow(0 0 10px ${c}99)` })}>
        <PixelIcon name={id} size={64} color={c} hi="#fff4d6" />
      </span>
    )
  })
}

/** The camera for a page: a base move over the settle, plus a tiny drift and a decaying shake after each hit. */
export function cameraAt(cam, t, tEnd, hits) {
  const p = interpolate(t, [0, tEnd], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) })
  const ph = t / LOOP
  let scale = 1
  let x = 0
  let y = 0
  if (cam === 'push') scale = 1 + 0.12 * p
  else if (cam === 'pull') scale = 1.12 - 0.12 * p
  else if (cam === 'pan') {
    scale = 1.1
    x = -28 + 56 * p
  } else if (cam === 'shake') scale = 1.06
  else scale = 1.05
  x += Math.sin(TAU * ph) * 3
  y += Math.cos(TAU * ph) * 2
  let shake = cam === 'shake' ? 2.5 : 0
  for (const h of hits) {
    const dt = t - h
    if (dt >= 0 && dt < 26) shake += 11 * Math.exp(-dt / 6)
  }
  if (shake > 0.3) {
    const n = Math.floor(t)
    x += Math.sin(n * 12.9898) * shake
    y += Math.cos(n * 78.233) * shake
  }
  return { scale, x, y }
}

/** 0 to 1 flash strength at time t for the page's flash frames. */
export function flashAt(t, flashes) {
  let v = 0
  for (const f of flashes) {
    const dt = t - f
    if (dt >= 0 && dt < 30) v = Math.max(v, Math.exp(-dt / 7))
  }
  return v
}
