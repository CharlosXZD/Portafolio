import { useEffect, useRef } from 'react'
import { useGameSettings } from '../utils/gameSettingsContext.jsx'

/**
 * Procedural pixel-art background, drawn at 1/PX of screen resolution onto
 * a canvas that the browser upscales with `image-rendering: pixelated`, so
 * every "pixel" is a real, crisp PX x PX block. Nothing here is an image
 * asset: sky bands are Bayer-dithered together, ridgelines are summed sine
 * waves, and the drifting motes are one pixel each in the four element
 * colors. This is a stand-in that already reads as the game's world; a
 * hand-drawn 480x270 background can replace any scene later (ASSETS.md).
 *
 * Scenes:
 *  - menu:  arcane night sky, twin ridges, all four element motes
 *  - table: darker, with a slowly turning magic circle under the dice
 *  - shop:  warm dusk, fireflies, closer hills
 *  - boss:  blood-red sky, heavy embers
 */
const PX = 4
const FPS = 15

const SCENES = {
  menu: {
    sky: ['#07060e', '#0c0a18', '#131026', '#1b1636', '#261c48', '#352358', '#4a2c66'],
    ridges: ['#1c1433', '#110c20'],
    stars: 1,
    motes: 46,
    moteKinds: ['fire', 'water', 'air', 'earth'],
  },
  table: {
    sky: ['#06050c', '#0a0814', '#0e0b1c', '#130f25', '#18132e', '#1c1634'],
    ridges: null,
    stars: 0.55,
    motes: 26,
    moteKinds: ['fire', 'water', 'air', 'earth'],
    circle: true,
  },
  shop: {
    sky: ['#120d24', '#1f1535', '#34203f', '#4f2944', '#733545', '#9c4a43', '#c46a45'],
    ridges: ['#2a1730', '#170d1c'],
    stars: 0.5,
    motes: 30,
    moteKinds: ['firefly'],
  },
  boss: {
    sky: ['#070305', '#10050a', '#1c070e', '#2a0a13', '#3d0e18', '#55121d'],
    ridges: ['#1f0710', '#10040a'],
    stars: 0.25,
    motes: 60,
    moteKinds: ['ember'],
    circle: true,
  },
}

const MOTE_STYLE = {
  fire: { colors: ['#ff7a45', '#ffc15a'], vy: -0.55, sway: 0.25 },
  water: { colors: ['#4aa3ff', '#9fd4ff'], vy: -0.25, sway: 0.5 },
  air: { colors: ['#dff2f7', '#a8d8e6'], vy: -0.35, sway: 0.9 },
  earth: { colors: ['#c89a5c', '#8f6b3d'], vy: -0.15, sway: 0.2 },
  firefly: { colors: ['#ffe27a', '#c6ff7a'], vy: -0.1, sway: 0.7 },
  ember: { colors: ['#ff4a3a', '#ff9a3a'], vy: -0.7, sway: 0.35 },
}

// Circle-node colors match data/elements.js pure elements (earth lightened
// so it reads against the dark sky).
const NODE_COLORS = ['#e5533d', '#3d8fe5', '#cfe0e8', '#c89a5c']

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

// Tiny seeded PRNG so a scene's stars/ridges are stable across redraws.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function drawStatic(ctx, W, H, scene) {
  const { sky } = scene
  const img = ctx.createImageData(W, H)
  const rgb = sky.map((hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)])
  for (let y = 0; y < H; y++) {
    const t = (y / (H - 1)) * (rgb.length - 1)
    const band = Math.min(rgb.length - 2, Math.floor(t))
    const frac = t - band
    for (let x = 0; x < W; x++) {
      const c = BAYER[y & 3][x & 3] / 16 < frac ? rgb[band + 1] : rgb[band]
      const i = (y * W + x) * 4
      img.data[i] = c[0]
      img.data[i + 1] = c[1]
      img.data[i + 2] = c[2]
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  if (scene.ridges) {
    const rand = rng(7)
    scene.ridges.forEach((color, layer) => {
      const base = H * (0.78 + layer * 0.08)
      const amp = H * (0.07 - layer * 0.02)
      const p1 = rand() * 10
      const p2 = rand() * 10
      ctx.fillStyle = color
      for (let x = 0; x < W; x++) {
        const h = Math.sin(x * 0.021 + p1) * amp + Math.sin(x * 0.057 + p2) * amp * 0.45
        const top = Math.round(base - h)
        ctx.fillRect(x, top, 1, H - top)
      }
    })
  }
}

function makeStars(W, H, density) {
  const rand = rng(1337)
  const count = Math.round(((W * H) / 230) * density)
  return Array.from({ length: count }, () => ({
    x: Math.floor(rand() * W),
    y: Math.floor(rand() * H * 0.72),
    phase: rand() * Math.PI * 2,
    speed: 0.6 + rand() * 1.8,
    big: rand() < 0.05,
  }))
}

function makeMote(W, H, kinds, rand, anywhere) {
  const kind = kinds[Math.floor(rand() * kinds.length)]
  return {
    kind,
    x: rand() * W,
    y: anywhere ? rand() * H : H + rand() * 20,
    speed: 0.6 + rand() * 0.8,
    phase: rand() * Math.PI * 2,
    life: rand(),
  }
}

// Midpoint-style ring: step the angle finely and plot integer pixels, which
// at this resolution gives a clean one-pixel circle outline.
function ring(ctx, cx, cy, r) {
  const steps = Math.max(32, Math.round(r * 7))
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1)
  }
}

function drawCircle(ctx, W, H, time, boss, anchor) {
  const cx = Math.round(anchor ? anchor.x : W / 2)
  const cy = Math.round(anchor ? anchor.y : H * 0.46)
  const r = Math.round(Math.min(W, H) * 0.27)
  ctx.globalAlpha = 0.22
  ctx.fillStyle = boss ? '#ff5a5a' : '#8f6bff'
  ring(ctx, cx, cy, r)
  ring(ctx, cx, cy, r - 5)
  ctx.globalAlpha = 0.12
  ring(ctx, cx, cy, Math.round(r * 0.55))

  // Rune ticks orbiting between the two outer rings.
  ctx.globalAlpha = 0.35
  const runes = 28
  const spin = time * 0.05
  for (let i = 0; i < runes; i++) {
    const a = (i / runes) * Math.PI * 2 + spin
    const rr = r - 2.5
    const x = Math.round(cx + Math.cos(a) * rr)
    const y = Math.round(cy + Math.sin(a) * rr)
    ctx.fillRect(x, y, 1, 1)
    if (i % 3 === 0) ctx.fillRect(x, y - 1, 1, 1)
  }

  // Four element nodes on the compass points, each gently pulsing.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2 - spin * 0.4
    const x = Math.round(cx + Math.cos(a) * r)
    const y = Math.round(cy + Math.sin(a) * r)
    const pulse = 0.45 + 0.35 * Math.sin(time * 1.6 + i * 1.7)
    ctx.globalAlpha = pulse
    ctx.fillStyle = boss ? '#ff6a4a' : NODE_COLORS[i]
    ctx.fillRect(x - 1, y - 1, 3, 3)
    ctx.globalAlpha = pulse * 0.4
    ctx.fillRect(x - 2, y, 5, 1)
    ctx.fillRect(x, y - 2, 1, 5)
  }
  ctx.globalAlpha = 1
}

export default function PixelBackdrop({ scene = 'menu', anchor = '[data-backdrop-anchor]' }) {
  const canvasRef = useRef(null)
  const { reducedMotion } = useGameSettings()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cfg = SCENES[scene] ?? SCENES.menu
    const staticLayer = document.createElement('canvas')
    const sctx = staticLayer.getContext('2d')
    let W = 0
    let H = 0
    let stars = []
    let motes = []
    let anchorPos = null
    const rand = rng(99)

    // The magic circle centers itself on whatever element is marked as the
    // anchor (the dice row), so it sits under the dice even with a sidebar.
    function measureAnchor() {
      const el = document.querySelector(anchor)
      if (!el) {
        anchorPos = null
        return
      }
      const r = el.getBoundingClientRect()
      anchorPos = { x: (r.left + r.width / 2) / PX, y: (r.top + r.height / 2) / PX }
    }

    function resize() {
      W = Math.max(1, Math.ceil(window.innerWidth / PX))
      H = Math.max(1, Math.ceil(window.innerHeight / PX))
      canvas.width = W
      canvas.height = H
      staticLayer.width = W
      staticLayer.height = H
      drawStatic(sctx, W, H, cfg)
      stars = makeStars(W, H, cfg.stars)
      motes = Array.from({ length: cfg.motes }, () => makeMote(W, H, cfg.moteKinds, rand, true))
    }

    function frame(time) {
      ctx.drawImage(staticLayer, 0, 0)

      for (const s of stars) {
        const b = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase))
        ctx.globalAlpha = b
        ctx.fillStyle = '#f4ecff'
        ctx.fillRect(s.x, s.y, 1, 1)
        if (s.big && b > 0.8) {
          ctx.globalAlpha = b * 0.45
          ctx.fillRect(s.x - 1, s.y, 3, 1)
          ctx.fillRect(s.x, s.y - 1, 1, 3)
        }
      }
      ctx.globalAlpha = 1

      if (cfg.circle) drawCircle(ctx, W, H, time, scene === 'boss', anchorPos)

      for (const m of motes) {
        const style = MOTE_STYLE[m.kind]
        const flicker = m.kind === 'firefly' ? 0.5 + 0.5 * Math.sin(time * 3 + m.phase) : 1
        const x = Math.round(m.x + Math.sin(time * style.sway + m.phase) * 3)
        const y = Math.round(m.y)
        ctx.globalAlpha = flicker * 0.9
        ctx.fillStyle = style.colors[Math.sin(time * 5 + m.phase) > 0 ? 0 : 1]
        ctx.fillRect(x, y, 1, 1)
        ctx.globalAlpha = flicker * 0.3
        ctx.fillRect(x, y + 1, 1, 1)
      }
      ctx.globalAlpha = 1
    }

    let frameCount = 0
    function step() {
      if (cfg.circle && frameCount++ % 8 === 0) measureAnchor()
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i]
        m.y += MOTE_STYLE[m.kind].vy * m.speed
        if (m.y < -4) motes[i] = makeMote(W, H, cfg.moteKinds, rand, false)
      }
    }

    resize()
    measureAnchor()
    window.addEventListener('resize', resize)

    if (reducedMotion) {
      frame(0)
      return () => window.removeEventListener('resize', resize)
    }

    let raf = 0
    let last = 0
    const start = performance.now()
    function loop(now) {
      raf = requestAnimationFrame(loop)
      if (now - last < 1000 / FPS) return
      last = now
      step()
      frame((now - start) / 1000)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [scene, reducedMotion, anchor])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="el-backdrop h-full w-full" />
      {/* Soft vignette so edges fall off into the dark, keeping focus center. */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(4,3,8,0.7) 100%)' }}
      />
    </div>
  )
}
