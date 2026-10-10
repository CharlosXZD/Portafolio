// Item sprites, relics, part C: charms of the later rounds, clocks and the six Laws (VISUALS.md V2.5.2).
import { add, ell, line, poly, rect, sub, METAL, MAT, ramp } from './spriteKit.js'
import { EL, sealedScroll } from './bases.js'
import { bell, feather, gear, quill, ring } from './shapes.js'

const GOLD = METAL.gold
const IRON = METAL.iron
const BRASS = METAL.brass
const SILVER = METAL.silver

// A Law is a scroll with a wax seal (style bible rule 10); each has its own seal color and a mark.
const law = (seal, emblem) => (S) => {
  sealedScroll(S, { seal, emblem })
  S.glint(9, 9)
}

export const RELICS_C = {
  spring_tide(S) {
    // a pale moon-shell resting on a wet stone
    S.paint(sub(ell(16, 27, 14, 3), ell(16, 27, 11, 1.6)), EL.water, { flat: true, tone: 2 })
    S.paint(ell(16, 22, 11, 5), MAT.stone)
    S.paint(add(ell(16, 14, 9, 8), rect(7, 14, 18, 4)), ramp('#e8e0f6'))
    S.paint(ring(16, 14, 5.4, 1.2), ramp('#e8e0f6'), { flat: true, tone: 0 })
    for (const x of [10, 13, 16, 19, 22]) S.dot(x, 8, '#bfb4dc')
    S.twinkle(11, 11, '#ffffff')
  },
  gale_seal(S) {
    // a pale blue wax seal pressed with a spiral wind
    S.paint(add(ell(16, 16, 11, 11), ell(9, 22, 4, 4), ell(24, 10, 4, 3)), EL.air)
    S.paint(ring(16, 16, 7, 1.4), EL.air, { flat: true, tone: 0 })
    S.paint(ring(16, 16, 4, 1.2), EL.air, { flat: true, tone: 0 })
    S.paint(rect(11, 15, 6, 1), EL.air, { flat: true, tone: 0 })
    S.dots('13,26 16,27 19,26', EL.air[3])
    S.flicker(22, 5, '#ffffff')
  },
  second_wind(S) {
    // a grey feather tied with a loop of thread
    S.paint(feather(5, 27, 25, 5, 9), ramp('#9aa4b4'))
    S.paint(quill(5, 27, 24, 6), MAT.slate, { flat: true, tone: 3 })
    S.paint(ring(9, 22, 4.4, 1.2), MAT.parch, { flat: true, tone: 1 })
    S.paint(line(9, 22, 4, 28, 1), MAT.parch, { flat: true, tone: 1 })
  },
  standing_stones(S) {
    // three tall stones in a ring, lichen on their north faces
    S.paint(ell(16, 26, 14, 4), MAT.green, { flat: true, tone: 0 })
    S.paint(poly([[3, 26], [5, 12], [9, 11], [12, 26]]), MAT.stone)
    S.paint(poly([[20, 26], [22, 10], [27, 12], [29, 26]]), MAT.stone)
    S.paint(poly([[11, 28], [12, 5], [20, 4], [21, 28]]), MAT.stone)
    S.dots('13,6 14,7 15,6 6,13 7,12 23,12 24,13', MAT.green[1])
  },
  crown_of_ages(S) {
    // a worn gold crown with a band of notches
    S.paint(poly([[3, 24], [3, 8], [10, 15], [16, 4], [22, 15], [29, 8], [29, 24]]), GOLD)
    S.paint(rect(3, 20, 26, 6), GOLD, { flat: true, tone: 1 })
    S.paint(rect(3, 24, 26, 2), GOLD, { flat: true, tone: 0 })
    for (const x of [7, 10, 13, 16, 19, 22, 25]) S.box(x, 21, 1, 3, GOLD[0])
    S.paint(ell(16, 10, 2, 2), ramp('#ff4f6a'))
    S.glint(8, 12)
  },
  heart_of_the_forge(S) {
    // a small anvil with a heart glowing in its seams
    S.paint(poly([[3, 8], [29, 8], [27, 14], [20, 16], [20, 22], [26, 22], [26, 27], [6, 27], [6, 22], [12, 22], [12, 16], [6, 14]]), IRON)
    S.paint(rect(3, 8, 26, 2), IRON, { flat: true, tone: 2 })
    S.paint(ell(14.5, 16.5, 2.6, 2.6), MAT.flame).paint(ell(17.5, 16.5, 2.6, 2.6), MAT.flame)
    S.paint(poly([[12, 17], [20, 17], [16, 22]]), MAT.flame)
    S.flicker(16, 13, '#fff4c8')
  },
  starmap(S) {
    // a folded sky chart with pinholes where the Constellations would be
    S.paint(poly([[3, 6], [12, 4], [20, 7], [29, 5], [29, 26], [20, 28], [12, 25], [3, 27]]), ramp('#2a3a7a'))
    S.paint(line(12, 4, 12, 25, 1), ramp('#2a3a7a'), { flat: true, tone: 0 }).paint(line(20, 7, 20, 28, 1), ramp('#2a3a7a'), { flat: true, tone: 0 })
    for (const [x, y] of [[7, 11], [9, 18], [16, 10], [16, 20], [24, 12], [25, 21], [6, 22]]) S.box(x, y, 1, 1, '#fff4d6')
    S.dots('7,11 8,14 9,18', '#5a6aa8')
    S.twinkle(16, 10, '#ffffff').twinkle(24, 12, '#ffffff')
  },
  echo_chamber(S) {
    // a round bronze bell with a second, fainter bell hanging inside it
    S.paint(rect(14, 2, 4, 3), BRASS).paint(bell(16, 4, 20, 20), BRASS)
    S.paint(ell(16, 25, 11, 3), MAT.black, { flat: true, tone: 1 })
    S.paint(bell(16, 17, 10, 11), ramp('#8a6a3a'))
    S.paint(ell(16, 28, 2, 2), BRASS, { flat: true, tone: 2 })
    S.glint(9, 11)
  },
  law_inversion: law('#8a5cff', (S) => S.box(14, 15, 4, 1, '#e6d8ff').box(13, 17, 6, 1, '#e6d8ff').box(14, 19, 4, 1, '#e6d8ff').box(15, 14, 2, 1, '#e6d8ff').box(15, 20, 2, 1, '#e6d8ff')),
  law_unity: law('#3f9f5f', (S) => S.paint(ring(14.5, 17, 3, 1), METAL.gold, { flat: true, tone: 2 }).paint(ring(17.5, 17, 3, 1), METAL.silver, { flat: true, tone: 2 })),
  law_symmetry: law('#3d8fe5', (S) => S.box(13, 15, 2, 4, '#cfe0ff').box(17, 15, 2, 4, '#cfe0ff').box(15, 16, 2, 2, '#1a2e6a').box(12, 14, 1, 2, '#cfe0ff').box(19, 14, 1, 2, '#cfe0ff')),
  law_greed: law('#e0a82e', (S) => S.box(14, 15, 4, 4, '#6e4a22').box(15, 14, 2, 6, '#6e4a22').box(15, 16, 2, 2, '#ffd86a')),
  law_echo: law('#c8283a', (S) => S.paint(ring(16, 17, 4, 1), '#ffb0b8', { flat: true, tone: 1 }).box(15, 16, 2, 2, '#ffb0b8')),
  law_small: law('#ff4fd8', (S) => S.box(14, 15, 4, 2, '#fff4fb').box(15, 17, 2, 3, '#fff4fb').box(13, 16, 1, 1, '#fff4fb')),
  epsilon(S) {
    // a tiny silver epsilon, the smallest number that is still a number: two open arcs joined by a bar
    const top = sub(ring(17, 10, 7.5, 3), rect(19, 7, 12, 6))
    const bottom = sub(ring(17, 22, 7.5, 3), rect(19, 19, 12, 6))
    S.paint(add(top, bottom, rect(10, 14, 9, 4)), SILVER)
    S.glint(9, 6)
  },
  release(S) {
    // an open brass latch beside a padlock cut cleanly in two
    S.paint(rect(3, 14, 12, 4), BRASS).paint(rect(3, 10, 3, 12), BRASS).paint(poly([[15, 12], [22, 15], [15, 20]]), BRASS)
    S.paint(rect(22, 17, 8, 10), IRON).paint(sub(ell(26, 14, 4, 4.4), add(ell(26, 14, 2, 2.6), rect(0, 14, 32, 18))), IRON)
    S.paint(line(20, 16, 22, 26, 1), MAT.black, { flat: true, tone: 1 })
    S.paint(poly([[22, 17], [25, 17], [22, 27]]), IRON, { flat: true, tone: 0 })
    S.glint(5, 12)
  },
  mainspring(S) {
    // a coiled brass spring wound tight around a tiny gear, with its winding key
    S.paint(gear(14, 17, 5.5, 8, 2), IRON)
    S.paint(ring(14, 17, 11.5, 2), BRASS)
    S.paint(ring(14, 17, 8.6, 1.6), BRASS, { flat: true, tone: 2 })
    S.paint(rect(24, 3, 2, 6), BRASS).paint(rect(21, 2, 8, 3), BRASS)
    S.paint(line(21, 9, 24, 7, 2), BRASS, { flat: true, tone: 1 })
    S.glint(5, 9)
  },
  cuckoo_clock(S) {
    // a carved wooden clock house with the little bird mid-chirp
    S.paint(poly([[16, 2], [29, 12], [3, 12]]), MAT.darkwood)
    S.paint(rect(5, 12, 22, 14), MAT.wood)
    S.paint(ell(16, 18, 5.4, 5.4), MAT.paper)
    S.paint(rect(16, 14, 1, 4), MAT.black, { flat: true, tone: 0 }).paint(rect(16, 18, 3, 1), MAT.black, { flat: true, tone: 0 })
    S.paint(rect(14, 6, 4, 4), MAT.black, { flat: true, tone: 1 })
    S.box(12, 7, 3, 3, '#e0a82e').box(10, 8, 2, 1, '#e0a82e')
    S.paint(line(9, 26, 9, 31, 1), BRASS, { flat: true, tone: 1 }).paint(ell(9, 30, 1.6, 1.6), BRASS)
    S.paint(line(23, 26, 23, 30, 1), BRASS, { flat: true, tone: 1 }).paint(ell(23, 29, 1.6, 1.6), BRASS)
  },
}
