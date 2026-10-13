// Item sprites, consumables, part B: the families (VISUALS.md V2.5.2, style bible rule 10):
// transmute vials, Constellation charts, Totem poles and Rune tablets share a base each.
import { add, ell, poly, rect, sub, MAT, ramp } from './spriteKit.js'
import { EL, chartDisc, flask, pole, tablet } from './bases.js'
import { ring, star } from './shapes.js'
import { reactionColors } from './recipes.js'

// ---- Transmute: a tall prism vial, the liquid in the element's own color and its mark swirling inside
const transmute = (el, mark) => (S) => {
  flask(S, { liquid: EL[el], shape: 'tall', level: 0.82 })
  S.paint(ring(16, 19, 4.2, 1.2), EL[el], { flat: true, tone: 3 })
  mark(S)
  S.shimmer(13, 14, 3, '#ffffff')
}
// ---- Constellations: a star chart on a dark disc, the sign drawn in the reaction's colors
const chart = (reactionId, pts, links) => (S) => {
  const { frame, stars } = reactionColors(reactionId)
  chartDisc(S, { frame, stars, pts, links })
  S.twinkle(pts[0][0], pts[0][1])
}
// ---- Totems: a carved pole painted in the element's colors with its mark on top
const totem = (el, mark) => (S) => pole(S, { paint: EL[el], mark })
// ---- Runes: a stone tablet with a glowing glyph in the colors of the rune's effect
const rune = (color, glyph) => (S) => {
  tablet(S, {})
  glyph(S, ramp(color))
  S.twinkle(16, 16, '#ffffff')
}
const g = (S, c, list) => {
  for (const [x, y, w = 1, h = 1] of list) S.box(x, y, w, h, c)
}

export const CONSUMABLES_B = {
  transmute_fire: transmute('fire', (S) => S.paint(poly([[16, 14], [19, 19], [16, 23], [13, 19]]), ramp('#ffc24a'), { flat: true, tone: 2 })),
  transmute_water: transmute('water', (S) => S.paint(poly([[16, 14], [19, 19], [16, 23], [13, 19]]), ramp('#bfe0ff'), { flat: true, tone: 2 })),
  transmute_earth: transmute('earth', (S) => S.paint(ell(16, 19, 3, 2.6), ramp('#c8a064'), { flat: true, tone: 2 })),
  transmute_air: transmute('air', (S) => S.paint(ring(16, 19, 2.6, 1), ramp('#ffffff'), { flat: true, tone: 2 })),

  const_anvil: chart('forge', [[9, 12], [23, 12], [18, 16], [18, 21], [10, 21]], [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]]),
  const_geyser: chart('scald', [[16, 23], [16, 16], [16, 10], [11, 8], [21, 8], [10, 14], [22, 14]], [[0, 1], [1, 2], [2, 3], [2, 4], [1, 5], [1, 6]]),
  const_cloud: chart('mist', [[9, 19], [12, 13], [17, 11], [21, 14], [23, 19], [16, 20]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]),
  const_seedling: chart('bloom', [[16, 23], [16, 17], [16, 12], [10, 9], [22, 9]], [[0, 1], [1, 2], [2, 3], [2, 4]]),
  const_whirl: chart('dust', [[16, 16], [19, 15], [18, 11], [13, 10], [10, 15], [13, 21], [20, 21]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]),
  const_twins: chart('resonance', [[12, 9], [12, 16], [12, 23], [20, 9], [20, 16], [20, 23]], [[0, 1], [1, 2], [3, 4], [4, 5], [1, 4]]),
  const_pair: chart('pair', [[11, 16], [21, 16], [16, 10], [16, 22]], [[0, 1], [2, 3]]),
  const_trio: chart('three_kind', [[16, 9], [9, 21], [23, 21]], [[0, 1], [1, 2], [2, 0]]),
  const_ladder: chart('straight', [[9, 22], [13, 19], [17, 16], [21, 13], [25, 10]], [[0, 1], [1, 2], [2, 3], [3, 4]]),

  totem_water: totem('water', (S) => S.paint(poly([[16, 1], [20, 7], [16, 10], [12, 7]]), ramp('#bfe0ff'))),
  totem_earth: totem('earth', (S) => S.paint(poly([[16, 1], [21, 9], [11, 9]]), ramp('#c8a064'))),
  totem_air: totem('air', (S) => S.paint(ring(16, 5, 4, 1.6), ramp('#ffffff'), { flat: true, tone: 2 })),

  rune_glass: rune('#9fe8ff', (S, c) => {
    S.paint(poly([[16, 8], [22, 16], [16, 24], [10, 16]]), c, { flat: true, tone: 1 })
    S.paint(poly([[16, 11], [19, 16], [16, 21], [13, 16]]), MAT.stone, { flat: true, tone: 0 })
    g(S, c[3], [[14, 12], [13, 13]])
  }),
  rune_kinship: rune('#74d08a', (S, c) => {
    S.paint(ring(13.5, 16, 4.6, 1.4), c, { flat: true, tone: 2 })
    S.paint(ring(18.5, 16, 4.6, 1.4), c, { flat: true, tone: 1 })
  }),
  rune_ember: rune('#ff9a3a', (S, c) => {
    S.paint(poly([[16, 8], [21, 15], [20, 22], [16, 24], [12, 22], [11, 15]]), c, { flat: true, tone: 1 })
    S.paint(poly([[16, 14], [18, 19], [16, 22], [14, 19]]), MAT.stone, { flat: true, tone: 0 })
  }),
  rune_anchor: rune('#b8c0d0', (S, c) => {
    g(S, c[2], [[15, 9, 2, 12], [12, 11, 8, 2], [11, 19, 3, 1], [18, 19, 3, 1], [12, 20, 2, 1], [18, 20, 2, 1], [13, 21, 6, 1]])
    S.paint(ring(16, 9, 2.4, 1), c, { flat: true, tone: 2 })
  }),
  rune_wild: rune('#ff4fd8', (S, c) => {
    S.paint(star(16, 16, 8, 3.2), c, { flat: true, tone: 2 })
    g(S, c[3], [[15, 15, 2, 2]])
  }),
  rune_gold: rune('#ffd86a', (S, c) => {
    S.paint(ring(16, 16, 6.4, 1.6), c, { flat: true, tone: 2 })
    g(S, c[3], [[15, 11, 2, 10]])
  }),
  rune_link: rune('#6fe8f0', (S, c) => {
    S.paint(sub(add(rect(9, 12, 8, 8)), rect(11, 14, 4, 4)), c, { flat: true, tone: 2 })
    S.paint(sub(add(rect(15, 12, 8, 8)), rect(17, 14, 4, 4)), c, { flat: true, tone: 1 })
  }),
  rune_double: rune('#ff6a7a', (S, c) => {
    S.paint(poly([[16, 8], [21, 15], [11, 15]]), c, { flat: true, tone: 2 })
    S.paint(poly([[16, 16], [21, 23], [11, 23]]), c, { flat: true, tone: 1 })
  }),
}
