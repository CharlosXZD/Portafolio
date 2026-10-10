// The item sprite kit (VISUALS.md V2.5): hand-authored 32 by 32 pixel art, drawn in
// code. An item is a short recipe that paints shapes (masks) with a four-tone ramp;
// the kit does the part that has to be identical for every item, so a set reads as a
// set (the style bible in ASSETS.md, "Item sprite style"):
//   * light comes from the upper left: the upper-left edge of a shape is the light
//     tone, the lower-right edge the dark tone, the inside the mid tone, and one
//     bright highlight pixel sits on the lit corner (flat tones, no dithering);
//   * a 1 px dark outline, tinted by the color it surrounds (never pure black);
//   * a 1 px soft drop shadow at the lower right.
// The result is a palette-colored bitmap (a Uint8ClampedArray of RGBA) plus the
// silhouette (body plus outline) used by the silhouette sheet and the uniqueness check.
import { mix } from '../../../utils/color.js'

export const W = 32
const N = W * W
const INK = '#150c1c'

const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

// ---------------------------------------------------------------- masks
const blank = () => new Uint8Array(N)
const at = (m, x, y) => x >= 0 && y >= 0 && x < W && y < W && m[y * W + x] === 1

/** A filled ellipse (pixel centers). */
export function ell(cx, cy, rx, ry = rx) {
  const m = blank()
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / rx
      const dy = (y + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) m[y * W + x] = 1
    }
  return m
}
/** A rectangle: x, y, width, height. */
export function rect(x0, y0, w, h) {
  const m = blank()
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < W && y < W) m[y * W + x] = 1
  return m
}
/** A rectangle with its corners cut by r pixels. */
export function rrect(x0, y0, w, h, r = 2) {
  const m = rect(x0, y0, w, h)
  for (let i = 0; i < r; i++)
    for (let j = 0; j < r - i; j++) {
      m[(y0 + i) * W + (x0 + j)] = 0
      m[(y0 + i) * W + (x0 + w - 1 - j)] = 0
      m[(y0 + h - 1 - i) * W + (x0 + j)] = 0
      m[(y0 + h - 1 - i) * W + (x0 + w - 1 - j)] = 0
    }
  return m
}
/** A polygon from [x, y] points (even-odd, pixel centers). */
export function poly(pts) {
  const m = blank()
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      let inside = false
      const px = x + 0.5
      const py = y + 0.5
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i]
        const [xj, yj] = pts[j]
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
      }
      if (inside) m[y * W + x] = 1
    }
  return m
}
/** A line of thickness t from (x0, y0) to (x1, y1). */
export function line(x0, y0, x1, y1, t = 2) {
  const m = blank()
  const dx = x1 - x0
  const dy = y1 - y0
  const len2 = dx * dx + dy * dy || 1
  for (let y = 0; y < W; y++)
    for (let x = 0; x < W; x++) {
      let u = ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2
      u = Math.max(0, Math.min(1, u))
      const ex = x0 + u * dx - (x + 0.5)
      const ey = y0 + u * dy - (y + 0.5)
      if (ex * ex + ey * ey <= (t / 2) * (t / 2)) m[y * W + x] = 1
    }
  return m
}
/** The union of masks. */
export function add(...ms) {
  const m = blank()
  for (const a of ms) for (let i = 0; i < N; i++) if (a[i]) m[i] = 1
  return m
}
/** `a` without `b`. */
export function sub(a, ...bs) {
  const m = Uint8Array.from(a)
  for (const b of bs) for (let i = 0; i < N; i++) if (b[i]) m[i] = 0
  return m
}
/** The part of `a` inside `b`. */
export function and(a, b) {
  const m = blank()
  for (let i = 0; i < N; i++) if (a[i] && b[i]) m[i] = 1
  return m
}
/** `a` moved by (dx, dy). */
export function move(a, dx, dy) {
  const m = blank()
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (a[y * W + x]) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < W && ny < W) m[ny * W + nx] = 1
  }
  return m
}
/** `a` mirrored left to right about the vertical axis x = 16. */
export function flipX(a) {
  const m = blank()
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (a[y * W + x]) m[y * W + (W - 1 - x)] = 1
  return m
}
/** `a` shrunk by one pixel on every side. */
export function erode(a) {
  const m = blank()
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (a[y * W + x] && at(a, x - 1, y) && at(a, x + 1, y) && at(a, x, y - 1) && at(a, x, y + 1)) m[y * W + x] = 1
  return m
}
/** The ring of `a` (a pixel wide, inside its edge). */
export function edge(a) {
  const m = blank()
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (a[y * W + x] && (!at(a, x - 1, y) || !at(a, x + 1, y) || !at(a, x, y - 1) || !at(a, x, y + 1))) m[y * W + x] = 1
  return m
}

// ---------------------------------------------------------------- ramps
/** A four-tone ramp [dark, mid, light, highlight] built from one base color. */
export function ramp(base, bias = 0) {
  return [mix(base, INK, 0.42 - bias), base, mix(base, '#ffffff', 0.3 + bias), mix(base, '#ffffff', 0.72)]
}
export const METAL = {
  gold: ['#8a5a1a', '#e0a82e', '#ffd86a', '#fff6c8'],
  brass: ['#6e4a22', '#c9a46b', '#ecd08e', '#fff4d6'],
  silver: ['#4a5262', '#a8b2c2', '#dce4f0', '#ffffff'],
  iron: ['#2c3240', '#6a7488', '#98a4ba', '#dfe6f2'],
  copper: ['#6a2e1c', '#c8693a', '#f09a62', '#ffd6b0'],
}
export const MAT = {
  wood: ['#4a2c18', '#8a5a34', '#b88050', '#e0b078'],
  darkwood: ['#2a1810', '#5a3a24', '#7e5636', '#a87c52'],
  stone: ['#3a3650', '#6e6a86', '#9a96b4', '#d4d0e8'],
  slate: ['#1e1c2e', '#3e3a56', '#5c5878', '#8a86a8'],
  paper: ['#a8946c', '#e8dcc0', '#f6eed8', '#ffffff'],
  parch: ['#8a6a3c', '#d8bf8a', '#ecd8a8', '#fff6dc'],
  leather: ['#3a2216', '#7a4a2a', '#a06a3e', '#c89060'],
  cloth: ['#3a2a5a', '#6a5aa0', '#8e7ec8', '#c4b8f0'],
  glass: ['#4a7a96', '#a8d4e8', '#dff3fb', '#ffffff'],
  bone: ['#8a7a5a', '#e8dcc0', '#f8f0dc', '#ffffff'],
  black: ['#08060e', '#1c1630', '#2e2650', '#5a4e8a'],
  red: ['#5a1018', '#c8283a', '#f0586a', '#ffb0b8'],
  green: ['#1a4a2a', '#3f9f5f', '#74d08a', '#c8f4d4'],
  blue: ['#1a2e6a', '#3d6fe5', '#78a8ff', '#cfe0ff'],
  violet: ['#3a1a6a', '#8a5cff', '#b896ff', '#e6d8ff'],
  ice: ['#2a5a8a', '#6fc4f0', '#b8ecff', '#ffffff'],
  flame: ['#a8321a', '#ff7a1a', '#ffc24a', '#fff4c8'],
}

// ---------------------------------------------------------------- canvas
class Sprite {
  constructor() {
    this.px = new Array(N).fill(null)
    this.fx = []
    this.glintAt = null
  }

  /** Paints a mask in one tone, or shaded by the upper-left light with a ramp [dark, mid, light, hi]. */
  paint(mask, r, o = {}) {
    const { flat = false, tone = 1, hi = true, under = false } = o
    const [d, m, l, h] = typeof r === 'string' ? ramp(r) : r
    let best = null
    for (let y = 0; y < W; y++)
      for (let x = 0; x < W; x++) {
        if (!mask[y * W + x]) continue
        if (under && this.px[y * W + x]) continue
        let c = m
        if (flat) c = [d, m, l, h][tone]
        else {
          const up = !at(mask, x, y - 1)
          const left = !at(mask, x - 1, y)
          const down = !at(mask, x, y + 1)
          const right = !at(mask, x + 1, y)
          const lit = up || left
          const shade = down || right
          if (lit && shade) c = m
          else if (lit) c = l
          else if (shade) c = d
          else if (!at(mask, x - 1, y - 1)) c = l
          else if (!at(mask, x + 1, y + 1)) c = d
          if (c === l && hi && (!best || x + y < best[0])) best = [x + y, x, y]
        }
        this.px[y * W + x] = c
      }
    // the one bright highlight, on the lit corner
    if (best && hi && !flat) {
      const [, x, y] = best
      this.px[y * W + x] = h
      if (at(mask, x + 1, y) && this.px[y * W + x + 1] === l) this.px[y * W + x + 1] = h
    }
    return this
  }

  /** One pixel. */
  dot(x, y, c) {
    if (x >= 0 && y >= 0 && x < W && y < W) this.px[y * W + x] = c
    return this
  }
  /** Several pixels in one color: 'x,y x,y x,y'. */
  dots(list, c) {
    for (const p of list.split(' ')) {
      const [x, y] = p.split(',').map(Number)
      this.dot(x, y, c)
    }
    return this
  }
  /** A flat rectangle of pixels. */
  box(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.dot(x + i, y + j, c)
    return this
  }
  /** Rows of characters painted with a legend ({ 'a': '#fff' }), '.' is empty; anchored at (x, y). */
  art(x, y, rows, legend) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => legend[ch] && this.dot(x + i, y + j, legend[ch])))
    return this
  }
  /** Clears a mask. */
  erase(mask) {
    for (let i = 0; i < N; i++) if (mask[i]) this.px[i] = null
    return this
  }
  /** Idle sparkle at (x, y) (a glint on a metal or a gem), an animation overlay not part of the bitmap. */
  glint(x, y, c = '#ffffff') {
    this.fx.push({ k: 'glint', x, y, c })
    return this
  }
  /** A flickering flame pixel pair or a drifting spark (an animation overlay). */
  flicker(x, y, c = '#ffc24a') {
    this.fx.push({ k: 'flicker', x, y, c })
    return this
  }
  /** A pixel that twinkles in and out (stars, dust). */
  twinkle(x, y, c = '#ffffff') {
    this.fx.push({ k: 'twinkle', x, y, c })
    return this
  }
  /** A liquid pixel row that shifts a pixel (potions). */
  shimmer(x, y, w, c = '#ffffff') {
    this.fx.push({ k: 'shimmer', x, y, w, c })
    return this
  }

  /** Adds the outline and the drop shadow and returns the bitmap. */
  finish(o = {}) {
    const { outline = null } = o
    const body = new Uint8Array(N)
    for (let i = 0; i < N; i++) if (this.px[i]) body[i] = 1
    const data = new Uint8ClampedArray(N * 4)
    const sil = new Uint8Array(N)
    const put = (i, rgb, a = 255) => {
      data[i * 4] = rgb[0]
      data[i * 4 + 1] = rgb[1]
      data[i * 4 + 2] = rgb[2]
      data[i * 4 + 3] = a
    }
    for (let i = 0; i < N; i++) if (this.px[i]) put(i, hexRgb(this.px[i]))
    const cache = new Map()
    const outlineOf = (c) => {
      const key = outline ?? c
      if (!cache.has(key)) cache.set(key, hexRgb(outline ?? mix(c, INK, 0.7)))
      return cache.get(key)
    }
    // outline: any empty pixel touching the body (4-neighbors) takes a dark tint of the color it touches
    const ring = new Uint8Array(N)
    for (let y = 0; y < W; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (body[i]) {
          sil[i] = 1
          continue
        }
        const nb = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].find(([nx, ny]) => at(body, nx, ny))
        if (nb) {
          ring[i] = 1
          sil[i] = 1
          put(i, outlineOf(this.px[nb[1] * W + nb[0]]))
        }
      }
    // drop shadow: the silhouette moved one pixel down and right, where nothing else is
    for (let y = 1; y < W; y++)
      for (let x = 1; x < W; x++) {
        const i = y * W + x
        if (!sil[i] && sil[(y - 1) * W + (x - 1)]) put(i, hexRgb(INK), 96)
      }
    return { w: W, data, sil, fx: this.fx }
  }
}

export const sprite = () => new Sprite()

/** The silhouette bitmap (dark, one tone) as RGBA, for the silhouette sheet. */
export function silhouetteOf(bitmap, color = [16, 10, 24]) {
  const out = new Uint8ClampedArray(N * 4)
  for (let i = 0; i < N; i++)
    if (bitmap.sil[i]) {
      out[i * 4] = color[0]
      out[i * 4 + 1] = color[1]
      out[i * 4 + 2] = color[2]
      out[i * 4 + 3] = 255
    }
  return out
}

/** A 16 by 16 version for small tiles: each 2 by 2 block keeps its darkest solid pixel (so outlines survive). */
export function miniOf(bitmap) {
  const out = new Uint8ClampedArray(16 * 16 * 4)
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      let pick = null
      let solid = 0
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const k = ((y * 2 + j) * W + (x * 2 + i)) * 4
          if (bitmap.data[k + 3] === 255) {
            solid++
            const lum = bitmap.data[k] + bitmap.data[k + 1] + bitmap.data[k + 2]
            if (!pick || lum < pick.lum) pick = { lum, k }
          }
        }
      if (pick && solid >= 2) {
        const o = (y * 16 + x) * 4
        out[o] = bitmap.data[pick.k]
        out[o + 1] = bitmap.data[pick.k + 1]
        out[o + 2] = bitmap.data[pick.k + 2]
        out[o + 3] = 255
      }
    }
  return out
}
