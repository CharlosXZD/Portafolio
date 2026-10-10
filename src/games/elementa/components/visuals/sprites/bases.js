// Shared base shapes for the item sprites (VISUALS.md V2.5, style bible rule 10): a
// family reads as a family because it starts from the same base. A recipe picks a
// base, gives it a palette and adds one signature detail. Every base paints on a
// kit Sprite and stays inside the 3 to 28 pixel box.
import { add, ell, erode, line, poly, rect, rrect, sub, METAL, MAT, ramp } from './spriteKit.js'
import { ELEMENTS } from '../../../data/elements.js'

/** Element ramps from the element's own color (section 0b: elements own their color). */
const lift = (c) => (c === '#8a6a3d' ? '#a8814a' : c)
export const EL = {
  fire: ramp(lift(ELEMENTS.fire.color)),
  water: ramp(lift(ELEMENTS.water.color)),
  earth: ramp(lift(ELEMENTS.earth.color)),
  air: ramp(lift(ELEMENTS.air.color)),
}

/** A coin lying flat: edge below, face above. */
export function coinFlat(S, cx, cy, r = 6, metal = METAL.gold, mark = true) {
  S.paint(ell(cx, cy + 2, r, r * 0.5), metal, { flat: true, tone: 0 })
  S.paint(ell(cx, cy, r, r * 0.5), metal)
  if (mark) S.paint(ell(cx, cy, r * 0.5, r * 0.25), metal, { flat: true, tone: 0 })
}

/** A coin standing on its edge, facing the viewer (a full disc). */
export function coinFace(S, cx, cy, r = 7, metal = METAL.gold) {
  S.paint(ell(cx, cy, r, r), metal)
  S.paint(sub(ell(cx, cy, r - 2, r - 2), ell(cx, cy, r - 3.2, r - 3.2)), metal, { flat: true, tone: 0 })
}

/** A potion bottle: neck, cork and a body of one of three shapes, with liquid under a glass rim. */
export function flask(S, { liquid, shape = 'round', glass = MAT.glass, cork = MAT.wood, level = 0.7 }) {
  let body
  let neck
  let top
  if (shape === 'vial') {
    body = rrect(10, 11, 12, 17, 4)
    neck = rect(13, 6, 6, 6)
    top = rect(12, 3, 8, 4)
  } else if (shape === 'tall') {
    body = rrect(11, 9, 10, 19, 3)
    neck = rect(14, 5, 4, 5)
    top = rect(13, 2, 6, 3)
  } else {
    body = ell(16, 20, 10, 8.4)
    neck = rect(13, 7, 6, 7)
    top = rect(12, 4, 8, 4)
  }
  S.paint(add(body, neck), glass)
  let y0 = 99
  let y1 = 0
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (body[y * 32 + x]) {
    y0 = Math.min(y0, y)
    y1 = Math.max(y1, y)
  }
  const surface = Math.round(y1 - (y1 - y0) * level)
  S.paint(sub(erode(body), rect(0, 0, 32, surface)), liquid)
  S.paint(top, cork)
}

/** A carved stone tablet: rounded top, a recessed face and a glowing glyph painted by the caller. */
export function tablet(S, { stone = MAT.stone }) {
  const body = rrect(7, 5, 18, 23, 5)
  S.paint(body, stone)
  S.paint(rrect(10, 8, 12, 17, 3), stone, { flat: true, tone: 0 })
}

/** A scroll lying across, with ribbon and a wax seal in the middle (the Laws' family look). */
export function sealedScroll(S, { seal = '#c8283a', paper = MAT.parch, emblem }) {
  S.paint(rrect(5, 8, 22, 15, 2), paper)
  S.paint(ell(5.5, 15.5, 2.5, 8.5), paper)
  S.paint(ell(26.5, 15.5, 2.5, 8.5), paper)
  S.paint(ell(5.5, 15.5, 1.1, 4), paper, { flat: true, tone: 0 })
  S.paint(ell(26.5, 15.5, 1.1, 4), paper, { flat: true, tone: 0 })
  S.box(9, 12, 14, 1, '#8a6a3c').box(9, 15, 14, 1, '#8a6a3c').box(9, 18, 10, 1, '#8a6a3c')
  S.paint(rect(14, 7, 4, 17), ramp('#a8323a'), { flat: true, tone: 1 })
  S.paint(ell(16, 17, 5.2, 5.2), ramp(seal))
  if (emblem) emblem(S)
}

/** A star chart: dark disc with a metal bezel and stars joined by lines. */
export function chartDisc(S, { frame, stars, pts, links }) {
  S.paint(ell(16, 16, 12.5, 12.5), frame)
  S.paint(ell(16, 16, 10, 10), MAT.slate, { flat: true, tone: 1 })
  S.paint(ell(16, 16, 10, 10), MAT.slate, { flat: true, tone: 0, under: true })
  for (const [a, b] of links) {
    const [x0, y0] = pts[a]
    const [x1, y1] = pts[b]
    S.paint(line(x0, y0, x1, y1, 1), [stars[0], stars[2], stars[2], stars[2]], { flat: true, tone: 1 })
  }
  for (const [x, y] of pts) {
    S.box(x - 1, y - 1, 3, 3, stars[1])
    S.dot(x, y, stars[3])
    S.dot(x - 1, y - 1, null).dot(x + 1, y - 1, null).dot(x - 1, y + 1, null).dot(x + 1, y + 1, null)
  }
}

/** A carved totem pole: a wooden pole with a painted face block and a crowning mark. */
export function pole(S, { paint, mark }) {
  S.paint(rect(11, 5, 10, 23), MAT.wood)
  // three painted bands: crown, face, base
  S.paint(rect(11, 5, 10, 6), paint)
  S.paint(rect(11, 12, 10, 8), paint)
  S.paint(rect(11, 21, 10, 7), MAT.darkwood)
  // the face: two eyes and a mouth
  S.box(13, 14, 2, 2, '#fff4d6').box(17, 14, 2, 2, '#fff4d6').box(14, 15, 1, 1, '#150c1c').box(18, 15, 1, 1, '#150c1c')
  S.box(14, 18, 4, 1, '#150c1c')
  // the wings: carved arms
  S.paint(rect(8, 12, 3, 3), MAT.wood).paint(rect(21, 12, 3, 3), MAT.wood)
  if (mark) mark(S)
}

/** A gem: a faceted stone shape. */
export function gem(S, { color, cut = 'round' }) {
  if (cut === 'diamond') S.paint(poly([[16, 4], [27, 13], [16, 28], [5, 13]]), color)
  else S.paint(ell(16, 16, 11, 11), color)
}
