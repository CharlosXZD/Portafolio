// Item sprites, relics, part B: charms, jewelry, containers and tools (VISUALS.md V2.5.2).
import { add, ell, line, poly, rect, rrect, sub, and, METAL, MAT, ramp } from './spriteKit.js'
import { EL, coinFace } from './bases.js'
import { bell, cordLoop, feather, flame, gear, heart, quill, ring, star } from './shapes.js'

const GOLD = METAL.gold
const IRON = METAL.iron
const BRASS = METAL.brass
const SILVER = METAL.silver

export const RELICS_B = {
  loaded_die(S) {
    // a bone die with a lead weight showing through one face
    S.paint(poly([[16, 3], [28, 9], [16, 15], [4, 9]]), MAT.bone, { flat: true, tone: 2 })
    S.paint(poly([[4, 9], [16, 15], [16, 29], [4, 22]]), MAT.bone, { flat: true, tone: 1 })
    S.paint(poly([[28, 9], [16, 15], [16, 29], [28, 22]]), MAT.bone, { flat: true, tone: 0 })
    S.box(14, 8, 3, 2, '#150c1c').dots('7,15 8,16 9,17 11,19 12,20', '#150c1c').dots('20,17 22,18 24,19', '#150c1c')
    S.paint(ell(22, 22, 2.6, 2.6), IRON, { flat: true, tone: 1 })
    S.dot(21, 21, IRON[3])
  },
  tide_chart(S) {
    // a sea chart rolled up and tied with a strand of kelp
    S.paint(line(5, 27, 26, 6, 10), MAT.paper)
    S.paint(ell(5.5, 26.5, 5, 5), MAT.paper, { flat: true, tone: 0 })
    S.paint(ell(26, 6, 5, 5), MAT.paper, { flat: true, tone: 2 })
    S.paint(ring(26, 6, 4.4, 1.2), MAT.paper, { flat: true, tone: 0 })
    S.dots('10,20 11,19 12,20 13,19 15,16 16,15 17,16 18,15', EL.water[1])
    S.paint(line(13, 23, 20, 22, 2), MAT.green, { flat: true, tone: 1 })
    S.paint(line(18, 8, 14, 12, 2), MAT.green, { flat: true, tone: 1 })
    S.dots('13,25 20,24 17,9', MAT.green[1])
  },
  feather_charm(S) {
    // a white feather bound with silver thread
    S.paint(feather(4, 28, 27, 4, 11), ramp('#e8f0f6'))
    S.paint(quill(4, 28, 25, 6), MAT.slate, { flat: true, tone: 3 })
    S.paint(rect(7, 22, 5, 3), SILVER)
    S.dots('8,22 9,24 10,22 11,24', SILVER[0])
    S.glint(22, 8)
  },
  lucky_coin(S) {
    // a gold coin stamped with a flame on one side and a wave on the other
    coinFace(S, 16, 16, 12)
    S.paint(and(ell(16, 16, 9.5, 9.5), rect(0, 0, 16, 32)), GOLD, { flat: true, tone: 1 })
    S.paint(rect(15, 6, 2, 20), GOLD, { flat: true, tone: 0 })
    S.paint(flame(11, 22, 6, 11), EL.fire, { hi: false })
    S.dots('19,12 20,11 21,12 22,11 23,12 19,16 20,15 21,16 22,15 23,16 19,20 20,19 21,20 22,19 23,20', EL.water[1])
    S.glint(9, 8)
  },
  ember_heart(S) {
    // a pulsing ember sealed inside a glass locket
    S.paint(cordLoop(16, 1, 3), GOLD, { flat: true, tone: 1 })
    S.paint(heart(16, 15, 24), GOLD)
    S.paint(heart(16, 15.5, 17), MAT.glass, { flat: true, tone: 3 })
    S.paint(heart(16, 16, 11), MAT.flame)
    S.flicker(16, 14, '#fff4c8')
  },
  keystone(S) {
    // a carved arch keystone with a glowing rune
    S.paint(poly([[8, 4], [24, 4], [28, 28], [4, 28]]), MAT.stone)
    S.paint(poly([[10, 7], [22, 7], [25, 25], [7, 25]]), MAT.stone, { flat: true, tone: 0 })
    const g = ramp('#ffe27a')
    S.paint(poly([[16, 10], [21, 16], [16, 22], [11, 16]]), g, { flat: true, tone: 2 })
    S.paint(poly([[16, 13], [18, 16], [16, 19], [14, 16]]), MAT.stone, { flat: true, tone: 0 })
    S.twinkle(16, 16, '#ffffff')
  },
  hourglass(S) {
    // a patient hourglass of violet sand in a stone frame
    S.paint(rect(5, 2, 22, 3), MAT.stone).paint(rect(5, 27, 22, 3), MAT.stone)
    S.paint(rect(6, 5, 2, 22), MAT.stone, { flat: true, tone: 0 }).paint(rect(24, 5, 2, 22), MAT.stone, { flat: true, tone: 0 })
    S.paint(add(poly([[9, 5], [23, 5], [16, 15]]), poly([[16, 15], [9, 27], [23, 27]])), MAT.glass)
    S.paint(poly([[16, 19], [21, 26], [11, 26]]), MAT.violet)
    S.paint(poly([[16, 8], [19, 5], [13, 5]]), MAT.violet, { flat: true, tone: 2 })
    S.dots('16,15 16,16 16,17', MAT.violet[2])
  },
  glacier_heart(S) {
    // a shard of blue ice that never melts
    S.paint(poly([[16, 2], [23, 10], [27, 22], [19, 29], [10, 28], [4, 18], [9, 8]]), MAT.ice)
    S.paint(poly([[16, 7], [21, 13], [18, 24], [11, 20]]), MAT.ice, { flat: true, tone: 3 })
    S.dots('14,10 13,12 14,14', '#ffffff')
    S.twinkle(9, 8, '#ffffff')
  },
  fusion_crucible(S) {
    // an alchemical crucible with four swirling colors
    S.paint(poly([[6, 12], [26, 12], [22, 28], [10, 28]]), IRON)
    S.paint(rect(4, 10, 24, 3), IRON)
    S.paint(ell(16, 11, 10, 2.6), IRON, { flat: true, tone: 0 })
    for (const [x, y, c] of [[11, 8, EL.fire], [16, 6, EL.water], [21, 8, EL.earth], [16, 10, EL.air]]) S.paint(ell(x, y, 3, 3), c)
    S.flicker(16, 5, '#ffffff')
  },
  aether_crown(S) {
    // a thin circlet set with four elemental gems
    S.paint(poly([[3, 22], [3, 10], [9, 16], [16, 6], [23, 16], [29, 10], [29, 22]]), GOLD)
    S.paint(rect(3, 20, 26, 5), GOLD)
    S.paint(rect(3, 23, 26, 2), GOLD, { flat: true, tone: 0 })
    for (const [x, y, c] of [[8, 22, EL.fire], [13, 22, EL.water], [19, 22, EL.earth], [24, 22, EL.air]]) S.paint(ell(x, y, 2, 2), c, { hi: true })
    S.paint(ell(16, 9, 2, 2), ramp('#ffffff'))
    S.glint(7, 12)
  },
  alchemists_table(S) {
    // a small wooden table crowded with bubbling flasks
    S.paint(rect(3, 20, 26, 3), MAT.wood).paint(rect(5, 23, 3, 6), MAT.darkwood).paint(rect(24, 23, 3, 6), MAT.darkwood)
    S.paint(ell(9, 16, 4.4, 4), MAT.glass).paint(rect(8, 7, 3, 7), MAT.glass).paint(ell(9, 17.5, 3.4, 2.6), MAT.green)
    S.paint(rrect(14, 9, 6, 11, 2), MAT.glass).paint(rrect(15, 14, 4, 6, 1), EL.fire)
    S.paint(ell(25, 16, 4.4, 4), MAT.glass).paint(rect(24, 9, 3, 5), MAT.glass).paint(ell(25, 17.5, 3.4, 2.4), EL.water)
    S.dots('10,5 8,3 24,6 26,3', '#c6ffd4')
    S.twinkle(9, 4, '#c6ffd4')
  },
  catalyst_stone(S) {
    // a cracked grey stone leaking colored sparks
    S.paint(add(ell(16, 18, 11, 9), ell(10, 14, 5, 5)), MAT.stone)
    S.dots('16,10 15,12 16,14 15,16 16,18 17,20 16,22', MAT.slate[0])
    for (const [x, y, c] of [[16, 7, EL.fire[2]], [11, 5, EL.water[2]], [21, 5, EL.earth[2]], [26, 9, EL.air[3]]]) S.box(x, y, 2, 2, c)
    S.flicker(16, 6, '#ffffff')
  },
  heart_of_circle(S) {
    // a ring of runestones around a glowing center gem
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      S.paint(ell(16 + Math.cos(a) * 11, 16 + Math.sin(a) * 11, 3.2, 3.2), MAT.stone)
    }
    S.paint(ell(16, 16, 6, 6), ramp('#b896ff'))
    S.paint(ell(15, 15, 2, 2), ramp('#ffffff'), { flat: true, tone: 1 })
    S.twinkle(16, 16, '#ffffff')
  },
  ley_line(S) {
    // a loop of glowing rope tied in an endless knot
    S.paint(ring(12, 16, 9, 3), ramp('#6fe8c0'))
    S.paint(ring(20, 16, 9, 3), ramp('#6fe8c0'))
    S.paint(and(ring(12, 16, 9, 3), rect(16, 0, 8, 32)), ramp('#3a9a7a'))
    S.glint(8, 10)
    S.twinkle(24, 22, '#ffffff')
  },
  heat(S) {
    // a glowing bellows: two wooden boards, a pleated leather body and an iron nozzle
    S.paint(poly([[3, 14], [20, 14], [20, 18], [3, 26]]), MAT.leather)
    S.paint(poly([[3, 5], [20, 12], [20, 15], [3, 12]]), MAT.leather)
    S.paint(poly([[3, 3], [21, 11], [21, 14], [3, 9]]), MAT.wood)
    S.paint(poly([[3, 27], [21, 17], [21, 20], [3, 31]]), MAT.wood)
    for (const x of [7, 11, 15]) S.paint(line(x, 11 + (x - 7) * 0.2, x, 18 - (x - 7) * 0.4, 1), MAT.darkwood, { flat: true, tone: 0 })
    S.paint(poly([[21, 13], [28, 15], [28, 18], [21, 17]]), IRON)
    S.paint(flame(29, 15, 4, 7), MAT.flame)
    S.paint(rect(1, 6, 3, 22), MAT.darkwood)
    S.flicker(29, 8, '#ffc24a').flicker(30, 11, '#fff4c8')
  },
  gust(S) {
    // a small paper fan with a swirl painted on it
    S.paint(poly([[16, 28], [2, 13], [8, 7], [16, 5], [24, 7], [30, 13]]), MAT.paper)
    for (const [x, y] of [[4, 11], [9, 7], [16, 5], [23, 7], [28, 11]]) S.paint(line(16, 28, x, y, 1), MAT.darkwood, { flat: true, tone: 1 })
    S.paint(ring(16, 14, 5, 1.4), EL.air, { flat: true, tone: 0 })
    S.paint(ring(16, 14, 2.4, 1.2), EL.air, { flat: true, tone: 0 })
    S.paint(rect(15, 26, 3, 4), MAT.wood)
  },
  steady(S) {
    // a heavy iron plumb bob on a cord
    S.paint(line(16, 1, 16, 10, 1), MAT.parch, { flat: true, tone: 1 })
    S.paint(poly([[10, 10], [22, 10], [22, 14], [18, 28], [14, 28], [10, 14]]), IRON)
    S.paint(rect(8, 9, 16, 3), IRON)
    S.paint(poly([[14, 28], [18, 28], [16, 31]]), IRON)
    S.dots('13,17 13,19 14,21', IRON[3])
  },
  chain_break(S) {
    // a snapped iron chain, the broken link glowing
    const link = (cx, cy, rx, ry) => sub(ell(cx, cy, rx, ry), ell(cx, cy, rx - 2, ry - 1.6))
    S.paint(link(7, 10, 5, 3.4), IRON).paint(link(14, 12, 3.6, 5), IRON).paint(link(23, 22, 5, 3.4), IRON).paint(link(25, 14, 3.6, 5), IRON)
    S.paint(poly([[16, 14], [20, 16], [18, 19], [21, 21], [17, 20], [15, 17]]), MAT.flame)
    S.flicker(19, 17, '#fff4c8')
  },
  pantheon(S) {
    // a tiny temple with four empty pedestals
    S.paint(poly([[16, 3], [29, 11], [3, 11]]), MAT.stone)
    S.paint(rect(3, 11, 26, 2), MAT.stone)
    for (const x of [6, 12, 18, 24]) S.paint(rect(x, 13, 3, 12), MAT.paper)
    S.paint(rect(2, 25, 28, 4), MAT.stone)
    S.box(15, 6, 2, 2, GOLD[2])
  },
  deep_current(S) {
    // a bottle of dark seawater with a slow spiral inside
    S.paint(add(ell(16, 20, 10, 9), rect(13, 6, 6, 8)), MAT.glass)
    S.paint(ell(16, 20, 8.6, 7.6), ramp('#1a3a8a'), { flat: false })
    S.paint(ring(16, 20, 5, 1.2), EL.water, { flat: true, tone: 2 })
    S.paint(ring(16, 20, 2.4, 1), EL.water, { flat: true, tone: 3 })
    S.paint(rect(12, 3, 8, 4), MAT.wood)
  },
}
export { star, gear, bell, MAT, SILVER, rect, rrect, sub, ramp }
