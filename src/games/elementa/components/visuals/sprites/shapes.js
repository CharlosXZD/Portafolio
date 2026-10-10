// Reusable masks for the item recipes (VISUALS.md V2.5): a gear, a star, a heart, a ring, a
// bell, a feather, a hanging cord. They are shapes only; recipes choose the palette.
import { add, ell, line, poly, rect, sub } from './spriteKit.js'

/** A ring: outer radius r, thickness t. */
export const ring = (cx, cy, r, t = 2) => sub(ell(cx, cy, r, r), ell(cx, cy, r - t, r - t))

/** A gear: a disc with `teeth` square teeth and a hole. */
export function gear(cx, cy, r, teeth = 8, hole = 0) {
  const parts = [ell(cx, cy, r, r)]
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2
    const x = cx + Math.cos(a) * (r + 1.4)
    const y = cy + Math.sin(a) * (r + 1.4)
    parts.push(line(cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), x, y, 3.2))
  }
  const g = add(...parts)
  return hole ? sub(g, ell(cx, cy, hole, hole)) : g
}

/** A five-pointed star. */
export function star(cx, cy, R, r = R * 0.45) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 ? r : R
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad])
  }
  return poly(pts)
}

/** A heart, w wide. */
export function heart(cx, cy, w) {
  const r = w / 4
  return add(ell(cx - r, cy - r * 0.6, r + 0.4, r), ell(cx + r, cy - r * 0.6, r + 0.4, r), poly([[cx - w / 2 + 0.3, cy - r * 0.2], [cx + w / 2 - 0.3, cy - r * 0.2], [cx, cy + w / 2 - 0.5]]))
}

/** A bell: dome, flared lip, clapper not included. */
export function bell(cx, top, w, h) {
  return add(
    ell(cx, top + h * 0.45, w / 2, h * 0.45),
    poly([[cx - w / 2, top + h * 0.45], [cx + w / 2, top + h * 0.45], [cx + w / 2 + 2, top + h], [cx - w / 2 - 2, top + h]]),
  )
}

/** A feather slanting from the lower left up to the right. */
export function feather(x0 = 5, y0 = 27, x1 = 26, y1 = 4, w = 7) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy)
  const nx = -dy / len
  const ny = dx / len
  const pt = (t, side) => [x0 + dx * t + nx * side * w * Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.5, y0 + dy * t + ny * side * w * Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.5]
  const left = []
  const right = []
  for (let i = 0; i <= 10; i++) {
    left.push(pt(i / 10, 1))
    right.unshift(pt(i / 10, -1))
  }
  return poly([...left, ...right])
}

/** The rib (quill) of the same feather. */
export const quill = (x0 = 4, y0 = 28, x1 = 26, y1 = 4) => line(x0, y0, x1, y1, 1)

/** A cord loop hanging above an item (a charm). */
export const cordLoop = (cx, top, r = 3) => sub(ell(cx, top + r, r, r), ell(cx, top + r + 0.5, r - 1.3, r - 1.3))

/** A thin tapering flame. */
export const flame = (cx, bottom, w, h) => poly([[cx, bottom - h], [cx + w * 0.55, bottom - h * 0.45], [cx + w / 2, bottom - h * 0.1], [cx, bottom], [cx - w / 2, bottom - h * 0.1], [cx - w * 0.55, bottom - h * 0.45]])

export { rect }
