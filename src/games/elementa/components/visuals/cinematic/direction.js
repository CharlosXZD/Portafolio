import { DIRECTIONS } from '../../../data/sceneDirections.js'

// The standard shot grammar (VISUALS.md V5): what a scene with no hand-written
// direction gets. An establishing backdrop from the scene's music and colour, a
// push on the first page, then a drift, a pan or a pull on the next ones, and
// effects from the colour's warmth. Hero scenes override pieces of it in
// data/sceneDirections.js.

const CAMERAS = ['push', 'drift', 'pan', 'pull']

function hue(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d < 0.08) return { h: 0, s: 0, l: max }
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s: d / max, l: max }
}

function defaultBackdrop(scene) {
  const music = scene.music ?? ''
  const { s, l } = hue(scene.color)
  if (music.startsWith('boss_')) return s < 0.2 ? 'code' : l > 0.85 ? 'sky' : 'hall'
  if (music.includes('unwritten') || music.includes('realm3')) return 'void'
  if (music.includes('firmament') || music.includes('crossroads')) return 'night'
  return 'night'
}

function defaultFx(scene) {
  const { h, s, l } = hue(scene.color)
  if (s < 0.2) return ['stars']
  if (h < 50 || h > 330) return ['embers']
  if (h > 180 && h < 260 && l > 0.85) return ['snow']
  return ['motes']
}

/** The direction of a scene: its data, with the standard grammar behind it. */
export function directionFor(id, scene) {
  const own = DIRECTIONS[id] ?? {}
  return {
    backdrop: own.backdrop ?? defaultBackdrop(scene),
    fx: own.fx ?? defaultFx(scene),
    piece: own.piece ?? null,
    pages: scene.pages.map((_, i) => ({
      cam: CAMERAS[i % CAMERAS.length],
      hits: [],
      flash: [],
      fx: null,
      char: {},
      ...(own.pages?.[i] ?? {}),
    })),
  }
}
