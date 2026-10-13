// Item sprites, relics, part A: natural and elemental things (VISUALS.md V2.5.2).
import { add, ell, line, poly, rect, rrect, sub, and, METAL, MAT, ramp } from './spriteKit.js'
import { EL } from './bases.js'
import { cordLoop, flame, gear, ring, heart } from './shapes.js'

const GOLD = METAL.gold
const IRON = METAL.iron
const BRASS = METAL.brass

export const RELICS_A = {
  riverstone(S) {
    // a smooth blue-grey stone on rippling water
    S.paint(sub(ell(16, 26, 13, 3.2), ell(16, 26, 10.5, 1.8)), EL.water, { flat: true, tone: 2 })
    S.paint(add(ell(16, 17, 11, 8), ell(10, 18, 5, 5)), ramp('#6f86a8'))
    S.paint(ell(21, 14, 3, 1.4), ramp('#6f86a8'), { flat: true, tone: 2 })
    S.dots('22,12 23,12', '#dce8f6')
    S.twinkle(10, 13, '#ffffff')
  },
  stormcaller(S) {
    // a brass wind vane with a lightning arc
    S.paint(rect(15, 17, 2, 11), BRASS).paint(ell(16, 28, 6, 2), BRASS)
    S.paint(poly([[3, 19], [8, 15], [8, 18], [22, 18], [22, 15], [29, 20], [22, 25], [22, 22], [8, 22], [8, 24]]), BRASS)
    S.paint(ell(16, 20, 3, 3), BRASS)
    S.paint(poly([[20, 1], [14, 8], [18, 8], [13, 15], [23, 6], [19, 6], [23, 1]]), ramp('#ffe27a'), { hi: false })
    S.flicker(21, 4, '#ffffff')
  },
  bedrock(S) {
    // a chunk of layered stone
    const slab = poly([[3, 11], [19, 5], [29, 10], [29, 24], [12, 29], [3, 23]])
    S.paint(slab, EL.earth)
    const bands = [[0, 11, EL.earth[0]], [14, 4, EL.earth[2]], [19, 3, EL.earth[0]], [24, 4, EL.earth[2]]]
    for (const [y, h, c] of bands) S.paint(and(slab, rect(0, y, 32, h)), [c, c, c, c], { flat: true, tone: 1 })
    S.paint(slab, EL.earth, { flat: false, hi: false, under: true })
    S.dots('8,10 9,10', EL.earth[3])
  },
  glass_cannon(S) {
    // a cracked hourglass full of embers
    S.paint(rect(5, 2, 22, 3), MAT.wood).paint(rect(5, 27, 22, 3), MAT.wood)
    S.paint(add(poly([[8, 5], [24, 5], [16, 15]]), poly([[16, 15], [8, 27], [24, 27]])), MAT.glass)
    S.paint(poly([[16, 18], [21, 26], [11, 26]]), MAT.flame)
    S.paint(poly([[16, 8], [19, 5], [13, 5]]), MAT.flame, { flat: true, tone: 2 })
    S.dots('15,9 16,11 15,13 16,15 17,16 16,18 17,20', '#2a1010')
    S.flicker(16, 22, '#fff4c8').flicker(14, 24, '#ffc24a')
  },
  undertow(S) {
    // a spiral conch shell: a spire, a wide whorl and a dark opening
    const sh = ramp('#8fc4f2')
    S.paint(add(ell(13, 18, 11, 8.5), poly([[18, 12], [29, 3], [28, 12], [23, 17]])), sh)
    S.paint(ring(13, 18, 6.5, 1.3), sh, { flat: true, tone: 0 })
    S.paint(ring(13, 18, 3.4, 1.2), sh, { flat: true, tone: 0 })
    S.dots('20,11 22,9 24,7 26,5 24,12 26,10', sh[0])
    S.paint(ell(4.5, 20, 2.6, 4), ramp('#1a2e6a'), { flat: true, tone: 1 })
    S.paint(ell(5, 20.5, 1.2, 2.4), ramp('#ff9ad0'), { flat: true, tone: 1 })
    S.twinkle(10, 12, '#ffffff')
  },
  petrify(S) {
    // a grey stone charm carved with an eye
    S.paint(cordLoop(16, 2, 3.5), MAT.leather, { flat: true, tone: 1 })
    S.paint(rrect(6, 9, 20, 19, 8), MAT.stone)
    S.paint(poly([[8, 18], [16, 12], [24, 18], [16, 24]]), MAT.paper, { flat: true, tone: 2 })
    S.paint(ell(16, 18, 3.4, 3.4), ramp('#2e2650'), { flat: true, tone: 1 })
    S.dot(15, 17, '#ffffff')
  },
  wildfire(S) {
    // a bundle of kindling bound with red ribbon, crackling
    S.paint(line(7, 28, 22, 10, 4), MAT.wood).paint(line(12, 29, 26, 14, 4), MAT.darkwood).paint(line(4, 22, 20, 7, 4), MAT.wood)
    S.paint(rect(11, 16, 9, 4), MAT.red)
    S.paint(poly([[12, 20], [10, 24], [13, 22]]), MAT.red).paint(poly([[18, 20], [20, 24], [17, 22]]), MAT.red)
    S.paint(flame(21, 11, 8, 11), MAT.flame)
    S.paint(flame(21, 11, 3.5, 6), MAT.flame, { flat: true, tone: 3 })
    S.flicker(21, 3, '#fff4c8')
  },
  tidal_pool(S) {
    // a tide-pool rock with a glowing anemone
    S.paint(ell(16, 25, 13, 4), EL.water, { flat: true, tone: 0 })
    S.paint(add(ell(16, 22, 11, 7), ell(9, 22, 5, 5)), MAT.stone)
    for (const [x, h] of [[11, 8], [14, 11], [17, 10], [20, 8]]) S.paint(line(x + 1, 17, x, 17 - h, 2), ramp('#ff9ad0'), { flat: true, tone: 1 })
    S.dots('10,9 14,6 17,7 19,9', '#fff4fb')
    S.paint(ell(16, 17, 6, 2.2), ramp('#ff9ad0'))
    S.twinkle(14, 6, '#ffffff')
  },
  groundswell(S) {
    // a mossy boulder with light seeping from the cracks below
    S.paint(rect(5, 25, 22, 2), MAT.flame, { flat: true, tone: 2 })
    S.paint(rect(8, 27, 16, 1), MAT.flame, { flat: true, tone: 1 })
    const b = add(ell(16, 17, 12, 9), ell(9, 19, 6, 6))
    S.paint(b, EL.earth)
    S.paint(and(b, rect(0, 0, 32, 13)), MAT.green)
    S.dots('10,14 12,15 15,14 18,15 21,14 8,16 24,16', MAT.green[0])
    S.glint(25, 25, '#fff4c8')
  },
  static_charge(S) {
    // a glass Leyden jar crackling with electricity
    S.paint(rrect(7, 11, 18, 18, 3), MAT.glass)
    S.paint(rect(8, 18, 16, 10), IRON, { flat: true, tone: 2 })
    S.paint(rect(15, 4, 2, 8), IRON).paint(ell(16, 4, 3, 3), BRASS)
    S.paint(poly([[26, 2], [21, 9], [24, 9], [20, 16]]), ramp('#ffe27a'), { flat: true, tone: 2 })
    S.paint(poly([[6, 5], [11, 9], [8, 9], [12, 14]]), ramp('#ffe27a'), { flat: true, tone: 2 })
    S.flicker(23, 8, '#ffffff').flicker(9, 9, '#ffffff')
  },
  momentum(S) {
    // a spinning gyroscope
    S.paint(rect(15, 3, 2, 26), BRASS)
    S.paint(ring(16, 16, 12.5, 2), BRASS)
    S.paint(ell(16, 18, 9, 3.4), IRON)
    S.paint(ell(16, 17, 4, 1.6), IRON, { flat: true, tone: 2 })
    S.paint(poly([[14, 28], [18, 28], [16, 31]]), IRON)
    S.glint(7, 8)
  },
  shard_vault(S) {
    // a small chest studded with shard gems
    S.paint(rect(4, 15, 24, 13), MAT.wood)
    S.paint(poly([[4, 15], [6, 8], [26, 8], [28, 15]]), MAT.wood)
    S.paint(rect(4, 14, 24, 2), GOLD, { flat: true, tone: 1 })
    S.paint(rect(4, 14, 3, 14), GOLD, { flat: true, tone: 1 }).paint(rect(25, 14, 3, 14), GOLD, { flat: true, tone: 1 })
    S.paint(rect(14, 14, 4, 6), GOLD)
    S.dot(15, 17, '#2a1810').dot(16, 17, '#2a1810')
    for (const [x, c] of [[9, '#ffffff'], [16, '#ffd86a'], [23, '#ffffff']]) S.paint(poly([[x, 6], [x + 3, 9], [x, 12], [x - 3, 9]]), ramp(c), { hi: true })
    S.glint(10, 8)
  },
  discount_merchant(S) {
    // a brass scale with a coin in one pan
    S.paint(rect(10, 27, 12, 2), BRASS).paint(rect(15, 7, 2, 21), BRASS)
    S.paint(poly([[3, 9], [29, 7], [29, 9], [3, 11]]), BRASS)
    S.paint(ell(16, 6, 3, 3), BRASS)
    for (const [x, y] of [[5, 21], [27, 18]]) {
      S.paint(line(x, 10, x - 3, y, 1), BRASS, { flat: true, tone: 1 }).paint(line(x, 10, x + 3, y, 1), BRASS, { flat: true, tone: 1 })
      S.paint(poly([[x - 5, y], [x + 5, y], [x + 3, y + 3], [x - 3, y + 3]]), BRASS)
    }
    S.paint(ell(27, 16.5, 2.4, 1.6), GOLD).paint(ell(5, 19, 1.5, 1.2), GOLD)
    S.glint(15, 6)
  },
  overclock(S) {
    // an overheating, cracked gear
    S.paint(gear(16, 16, 9, 8, 3.4), BRASS)
    S.paint(line(10, 8, 16, 14, 1), MAT.flame, { flat: true, tone: 2 }).paint(line(16, 14, 14, 22, 1), MAT.flame, { flat: true, tone: 2 }).paint(line(14, 22, 22, 24, 1), MAT.flame, { flat: true, tone: 2 })
    S.dots('10,8 11,9 12,10', MAT.flame[3])
    S.flicker(16, 4, '#ffc24a').flicker(26, 14, '#ff7a1a')
  },
  fossil(S) {
    // an ammonite in stone
    S.paint(rrect(3, 4, 26, 24, 4), MAT.stone)
    S.paint(ell(16, 16, 9.5, 9.5), MAT.bone)
    S.paint(ring(16, 16, 9.5, 1.3), MAT.bone, { flat: true, tone: 0 })
    S.paint(ring(16, 16, 6, 1.2), MAT.bone, { flat: true, tone: 0 })
    S.paint(ring(16, 16, 3, 1.2), MAT.bone, { flat: true, tone: 0 })
    S.box(10, 16, 4, 1, MAT.bone[0]).box(18, 16, 4, 1, MAT.bone[0])
  },
  fusion_catalyst(S) {
    // a glowing alchemical crucible
    S.paint(poly([[7, 14], [25, 14], [22, 27], [10, 27]]), IRON)
    S.paint(rect(5, 12, 22, 3), IRON)
    S.paint(rect(9, 27, 3, 3), IRON, { flat: true, tone: 0 }).paint(rect(20, 27, 3, 3), IRON, { flat: true, tone: 0 })
    S.paint(ell(16, 12, 9, 2.4), MAT.flame, { flat: true, tone: 3 })
    S.paint(flame(16, 11, 9, 10), MAT.flame)
    S.paint(flame(16, 11, 4, 6), MAT.flame, { flat: true, tone: 3 })
    S.flicker(12, 6, '#ffc24a').flicker(20, 5, '#fff4c8')
  },
  deep_pockets(S) {
    // a patched leather coin pouch
    S.paint(ell(16, 20, 11, 9), MAT.leather)
    S.paint(poly([[11, 12], [21, 12], [19, 8], [13, 8]]), MAT.leather)
    S.paint(rect(10, 11, 12, 3), MAT.darkwood)
    S.paint(line(16, 12, 7, 5, 1), MAT.parch, { flat: true, tone: 1 }).paint(line(16, 12, 25, 5, 1), MAT.parch, { flat: true, tone: 1 })
    S.paint(rect(17, 17, 7, 7), MAT.cloth)
    S.dots('17,17 19,17 21,17 23,17 17,23 19,23 21,23 23,23', MAT.parch[2])
    S.paint(ell(12, 22, 2, 1.4), GOLD)
  },
  hoarder(S) {
    // a magpie's nest with one shiny gem
    S.paint(ell(16, 22, 13, 6), MAT.darkwood)
    for (let i = 0; i < 6; i++) S.paint(line(5 + i * 4, 26, 9 + i * 4, 18, 1), MAT.wood, { flat: true, tone: 1 })
    S.paint(line(4, 20, 28, 22, 2), MAT.wood).paint(line(6, 24, 26, 18, 2), MAT.darkwood)
    S.paint(poly([[16, 8], [21, 13], [16, 21], [11, 13]]), ramp('#4fd6ff'))
    S.dots('14,12 15,11', '#ffffff')
    S.paint(line(5, 14, 11, 20, 1), MAT.black, { flat: true, tone: 2 })
    S.glint(15, 9)
  },
  steadfast(S) {
    // a worn anchor charm
    S.paint(ring(16, 6, 3.4, 1.6), IRON)
    S.paint(rect(15, 8, 2, 18), IRON).paint(rect(9, 11, 14, 2), IRON)
    S.paint(sub(ell(16, 18, 12, 10), add(ell(16, 18, 9.5, 7.5), rect(0, 0, 32, 18))), IRON)
    S.paint(poly([[3, 17], [8, 17], [5.5, 22]]), IRON).paint(poly([[24, 17], [29, 17], [26.5, 22]]), IRON)
    S.paint(rect(14, 25, 4, 3), IRON)
  },
  safety_net(S) {
    // a rope net hung from a gold hoop: the catch under a fall
    S.paint(poly([[4, 12], [28, 12], [22, 28], [10, 28]]), MAT.parch, { flat: true, tone: 1 })
    for (const [x0, x1] of [[4, 20], [10, 24], [16, 28]]) S.paint(line(x0, 12, x1, 28, 1), MAT.darkwood, { flat: true, tone: 0 })
    for (const [x0, x1] of [[28, 12], [22, 6], [16, 0]]) S.paint(line(x0, 12, x1, 28, 1), MAT.darkwood, { flat: true, tone: 0 })
    S.paint(line(6, 18, 26, 18, 1), MAT.darkwood, { flat: true, tone: 0 }).paint(line(8, 23, 24, 23, 1), MAT.darkwood, { flat: true, tone: 0 })
    S.paint(ring(16, 11, 13, 2.2), GOLD)
    S.paint(heart(16, 5, 5), ramp('#e0485a'))
    S.glint(7, 7)
  },
}

