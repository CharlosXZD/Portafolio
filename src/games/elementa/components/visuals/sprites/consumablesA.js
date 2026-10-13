// Item sprites, consumables, part A: the one-of-a-kind tools, seals and potions (VISUALS.md V2.5.2).
import { add, ell, line, poly, rect, rrect, sub, and, METAL, MAT, ramp } from './spriteKit.js'
import { EL } from './bases.js'
import { feather, flame, heart, quill, ring, star } from './shapes.js'

const GOLD = METAL.gold
const IRON = METAL.iron
const BRASS = METAL.brass
const SILVER = METAL.silver

// A wax seal: a round, slightly uneven blob of one color.
const waxSeal = (S, color, mark) => {
  S.paint(add(ell(16, 16, 11.5, 11.5), ell(8, 21, 4, 3.4), ell(24, 9, 4, 3.4), ell(10, 8, 3, 3)), ramp(color))
  S.paint(ring(16, 16, 8, 1.2), ramp(color), { flat: true, tone: 0 })
  mark?.(S)
}

export const CONSUMABLES_A = {
  upgrade_stone(S) {
    // a faceted whetstone with tier pips of light above it
    S.paint(poly([[7, 14], [25, 14], [29, 20], [26, 28], [6, 28], [3, 20]]), MAT.stone)
    S.paint(poly([[7, 14], [25, 14], [22, 19], [10, 19]]), MAT.stone, { flat: true, tone: 3 })
    S.paint(poly([[10, 19], [22, 19], [26, 28], [6, 28]]), MAT.stone, { flat: true, tone: 1 })
    for (const x of [10, 15, 20]) S.box(x, 6, 3, 3, '#ffe27a').dot(x + 1, 7, '#ffffff')
    S.twinkle(15, 6, '#ffffff')
  },
  extra_reroll(S) {
    // a small hourglass whose sand flows backward, an arrow rising beside it
    S.paint(rect(8, 2, 16, 3), MAT.wood).paint(rect(8, 27, 16, 3), MAT.wood)
    S.paint(add(ell(16, 10, 7, 5.5), ell(16, 22, 7, 5.5), rect(15, 13, 2, 7)), MAT.glass)
    S.paint(ell(16, 9, 5, 3), ramp('#ffe9a0'), { hi: false })
    S.paint(rect(15, 14, 2, 5), ramp('#ffe9a0'), { flat: true, tone: 1 })
    S.paint(poly([[27, 12], [31, 18], [28, 18], [28, 24], [26, 24], [26, 18], [23, 18]]), EL.air, { hi: false })
    S.shimmer(14, 15, 4, '#ffffff')
  },
  whetstone(S) {
    // a flat grey sharpening stone with a bright edge
    S.paint(poly([[3, 14], [24, 9], [29, 13], [29, 19], [8, 24], [3, 20]]), MAT.stone)
    S.paint(line(4, 14, 25, 9, 1), MAT.stone, { flat: true, tone: 3 })
    S.dots('10,16 14,15 18,14 9,19 13,18 17,17', MAT.stone[0])
    S.glint(25, 8)
  },
  chisel(S) {
    // a small iron chisel with a wooden grip
    S.paint(line(6, 26, 18, 14, 4), MAT.wood)
    S.paint(line(18, 14, 26, 6, 3), IRON)
    S.paint(poly([[24, 4], [29, 3], [28, 8]]), IRON, { flat: true, tone: 3 })
    S.paint(rect(15, 14, 3, 3), IRON, { flat: true, tone: 0 })
    S.paint(ell(6.5, 26.5, 2.4, 2.4), MAT.wood)
    S.glint(27, 5)
  },
  phoenix_feather(S) {
    // a burning red-gold feather
    S.paint(feather(5, 28, 25, 6, 10), ramp('#e5533d'))
    S.paint(feather(8, 26, 22, 9, 4), MAT.flame, { flat: true, tone: 2 })
    S.paint(quill(5, 28, 23, 8), MAT.flame, { flat: true, tone: 3 })
    S.paint(flame(26, 8, 6, 9), MAT.flame)
    S.paint(flame(20, 6, 4, 6), MAT.flame, { flat: true, tone: 2 })
    S.flicker(26, 2, '#fff4c8').flicker(20, 1, '#ffc24a')
  },
  aether_dust(S) {
    // a pinch of four-colored dust in a paper twist
    S.paint(poly([[16, 8], [28, 12], [24, 28], [8, 28], [4, 12]]), MAT.paper)
    S.paint(poly([[10, 8], [22, 8], [24, 12], [8, 12]]), MAT.paper, { flat: true, tone: 0 })
    S.paint(line(10, 6, 8, 2, 1), MAT.paper, { flat: true, tone: 0 }).paint(line(22, 6, 24, 2, 1), MAT.paper, { flat: true, tone: 0 })
    for (const [x, y, c] of [[11, 17, EL.fire], [16, 14, EL.water], [21, 17, EL.air], [14, 22, EL.earth], [19, 22, EL.fire], [11, 25, EL.water], [22, 25, EL.earth]]) S.box(x, y, 2, 2, c[2])
    S.twinkle(16, 14, '#ffffff').twinkle(21, 17, '#ffffff')
  },
  arcane_seal: (S) =>
    waxSeal(S, '#8a5cff', (S2) => {
      S2.paint(poly([[9, 16], [16, 11], [23, 16], [16, 21]]), MAT.paper, { flat: true, tone: 2 })
      S2.paint(ell(16, 16, 2.6, 2.6), ramp('#8a5cff'), { flat: true, tone: 1 })
      S2.dot(15, 15, '#ffffff')
    }),
  shard_pouch(S) {
    // a small leather pouch clinking with shards
    S.paint(poly([[8, 11], [24, 11], [28, 26], [4, 26]]), MAT.leather)
    S.paint(ell(16, 26, 12, 3), MAT.leather)
    S.paint(rect(8, 10, 16, 3), MAT.darkwood)
    S.paint(poly([[10, 11], [13, 3], [16, 11]]), ramp('#4fd6ff')).paint(poly([[15, 11], [19, 5], [22, 11]]), ramp('#8fe8ff'))
    S.paint(poly([[12, 11], [14, 8], [18, 11]]), ramp('#4fd6ff'), { flat: true, tone: 2 })
    S.dots('13,17 14,18 18,21 19,22', MAT.leather[3])
    S.glint(14, 5)
  },
  lucky_charm(S) {
    // a four-leaf clover pressed in glass
    S.paint(rrect(5, 3, 22, 26, 3), MAT.glass)
    S.paint(rrect(7, 5, 18, 22, 2), MAT.paper, { flat: true, tone: 2 })
    for (const [x, y] of [[13, 12], [19, 12], [13, 18], [19, 18]]) S.paint(heart(x, y - 1, 7), MAT.green, { hi: false })
    S.paint(line(16, 17, 19, 25, 1), MAT.green, { flat: true, tone: 0 })
    S.dots('8,6 9,6 8,7', '#ffffff')
  },
  fusion_spark(S) {
    // a spark that never stops crackling, held in tongs
    S.paint(line(4, 28, 17, 17, 2), IRON).paint(line(9, 29, 19, 18, 2), IRON)
    S.paint(poly([[16, 15], [20, 15], [22, 19], [19, 20]]), IRON, { flat: true, tone: 0 })
    S.paint(star(22, 11, 9, 3.2), MAT.flame)
    S.box(21, 10, 2, 2, '#ffffff')
    S.flicker(22, 2, '#fff4c8').flicker(28, 12, '#ffc24a')
  },
  mirror_shard(S) {
    // a jagged mirror fragment reflecting a die
    S.paint(poly([[14, 2], [24, 7], [29, 17], [22, 29], [12, 27], [4, 16], [7, 8]]), SILVER)
    S.paint(poly([[14, 6], [22, 10], [25, 17], [20, 25], [12, 23], [8, 16], [10, 10]]), MAT.glass, { flat: true, tone: 3 })
    S.paint(rect(12, 13, 7, 7), MAT.bone)
    S.dots('14,15 17,18', '#150c1c')
    S.paint(line(10, 9, 16, 13, 1), '#ffffff', { flat: true, tone: 1 })
    S.glint(9, 8)
  },
  stopwatch(S) {
    // a brass stopwatch with its hand frozen mid-tick
    S.paint(rect(14, 1, 4, 4), BRASS).paint(rect(12, 4, 8, 3), BRASS)
    S.paint(ell(16, 18, 12, 12), BRASS)
    S.paint(ell(16, 18, 9.5, 9.5), MAT.paper)
    for (const [x, y] of [[16, 10], [24, 18], [16, 26], [8, 18]]) S.box(x - 1, y - 1, 2, 2, '#150c1c')
    S.paint(line(16, 18, 21, 12, 1), MAT.red, { flat: true, tone: 1 })
    S.paint(rect(15, 17, 2, 2), '#150c1c', { flat: true })
    S.glint(7, 9)
  },
  warp_seal(S) {
    // a violet wax seal pressed with a folded star, its edge a warped starburst
    S.paint(star(16, 16, 15, 10.5), ramp('#b896ff'))
    S.paint(ring(16, 16, 8, 1.2), ramp('#b896ff'), { flat: true, tone: 0 })
    S.paint(poly([[16, 8], [18, 14], [24, 16], [18, 18], [16, 24], [14, 18], [8, 16], [14, 14]]), MAT.paper, { flat: true, tone: 2 })
    S.paint(poly([[16, 12], [17, 15], [20, 16], [17, 17], [16, 20], [15, 17], [12, 16], [15, 15]]), ramp('#8a5cff'), { flat: true, tone: 1 })
    S.twinkle(16, 16, '#ffffff')
  },
  sand_hourglass(S) {
    // a round-bulbed hourglass of pale gold sand, brass caps, no frame: one bulb already empty
    S.paint(rect(7, 1, 18, 3), BRASS).paint(rect(7, 28, 18, 3), BRASS)
    S.paint(add(ell(16, 9, 7, 5.6), ell(16, 23, 7, 5.6), rect(15, 13, 2, 6)), MAT.glass)
    S.paint(ell(16, 25, 5.4, 3.4), ramp('#f0d480'))
    S.dots('16,14 16,15 16,16 16,17', '#f0d480')
    S.shimmer(14, 24, 4, '#fff6c8')
  },
  pocket_watch(S) {
    // a chained pocket watch whose hands never move
    S.paint(ring(9, 5, 4, 1.4), GOLD)
    S.paint(line(10, 8, 15, 11, 1), GOLD, { flat: true, tone: 1 })
    S.paint(rect(14, 6, 4, 4), GOLD)
    S.paint(ell(16, 19, 12, 11), GOLD)
    S.paint(ell(16, 19, 9.5, 8.6), MAT.paper)
    for (const [x, y] of [[16, 12], [24, 19], [16, 26], [8, 19]]) S.box(x - 1, y - 1, 2, 2, '#6e4a22')
    S.paint(line(16, 19, 16, 14, 1), '#150c1c', { flat: true, tone: 1 }).paint(line(16, 19, 20, 19, 1), '#150c1c', { flat: true, tone: 1 })
    S.glint(7, 12)
  },
  metronome(S) {
    // a wooden metronome mid-swing, its weight a tiny gold die
    S.paint(poly([[10, 28], [22, 28], [19, 6], [13, 6]]), MAT.wood)
    S.paint(poly([[13, 9], [19, 9], [20, 24], [12, 24]]), MAT.wood, { flat: true, tone: 0 })
    S.paint(line(16, 24, 22, 3, 1), BRASS, { flat: true, tone: 2 })
    S.paint(rect(19, 8, 5, 5), GOLD)
    S.dots('21,10', '#6e4a22')
    S.paint(rect(8, 27, 16, 3), MAT.darkwood)
  },
  almanac(S) {
    // a thick almanac bound in star-blue cloth with gold corners, pages marked with dates
    S.paint(poly([[4, 7], [26, 5], [29, 9], [29, 25], [7, 27], [4, 23]]), ramp('#2f78c8'))
    S.paint(rect(8, 22, 21, 4), MAT.paper, { flat: true, tone: 2 })
    S.paint(line(4, 7, 4, 23, 2), ramp('#1a4a8a'), { flat: true, tone: 0 })
    S.paint(star(17, 14, 5, 2), GOLD)
    S.box(5, 7, 3, 3, GOLD[1]).box(5, 20, 3, 3, GOLD[1])
    S.dots('10,23 13,23 17,23 20,23 24,23', '#c8283a')
    S.glint(8, 8)
  },
  graft(S) {
    // a silver needle threaded with a glowing line
    S.paint(line(5, 27, 25, 6, 2), SILVER)
    S.paint(poly([[24, 4], [29, 3], [28, 8]]), SILVER, { flat: true, tone: 3 })
    S.paint(ell(8, 24, 1.6, 2.6), MAT.black, { flat: true, tone: 0 })
    S.paint(line(7, 25, 4, 18, 1), ramp('#6fe8c0'), { flat: true, tone: 2 })
    S.paint(line(4, 18, 9, 10, 1), ramp('#6fe8c0'), { flat: true, tone: 2 })
    S.paint(line(9, 10, 6, 4, 1), ramp('#6fe8c0'), { flat: true, tone: 2 })
    S.glint(26, 5)
    S.twinkle(6, 5, '#ffffff')
  },
  solvent(S) {
    // a dropper bottle of clear, fizzing liquid
    S.paint(rrect(7, 12, 18, 17, 4), MAT.glass)
    S.paint(rrect(8, 18, 16, 10, 3), ramp('#bff0e6'), { hi: false })
    S.paint(rect(12, 8, 8, 5), METAL.iron)
    S.paint(ell(16, 5, 3.4, 4.6), MAT.red)
    S.paint(ell(16, 28, 2, 1.6), ramp('#bff0e6'), { flat: true, tone: 2 })
    S.dots('11,21 20,24 14,25 18,20', '#ffffff')
    S.twinkle(11, 21, '#ffffff')
  },
  gem_socket(S) {
    // a tiny gold setting with two empty prongs
    S.paint(rect(5, 22, 22, 6), GOLD)
    S.paint(poly([[7, 22], [25, 22], [21, 14], [11, 14]]), GOLD)
    S.paint(poly([[10, 14], [12, 4], [14, 14]]), GOLD).paint(poly([[18, 14], [20, 4], [22, 14]]), GOLD)
    S.paint(rect(13, 8, 6, 6), MAT.slate, { flat: true, tone: 0 })
    S.glint(12, 4)
  },
  catalyst(S) {
    // a cold blue crystal humming in a wire cage
    S.paint(poly([[16, 4], [23, 11], [21, 25], [16, 28], [11, 25], [9, 11]]), MAT.ice)
    S.paint(poly([[16, 8], [20, 12], [18, 22], [14, 22], [12, 12]]), MAT.ice, { flat: true, tone: 3 })
    S.paint(ring(16, 16, 12, 1.3), IRON, { flat: true, tone: 1 })
    S.paint(rect(15, 3, 2, 26), IRON, { flat: true, tone: 1 })
    S.paint(rect(4, 15, 24, 2), IRON, { flat: true, tone: 1 })
    S.twinkle(16, 12, '#ffffff')
  },
  const_black_hole(S) {
    // a black glass sphere ringed in a thin bright halo that crosses it
    S.paint(ell(16, 16, 9.5, 9.5), MAT.black)
    S.paint(sub(ell(16, 16, 15, 5.2), ell(16, 16, 13, 3.6)), ramp('#fff1c1'), { flat: true, tone: 2 })
    S.paint(and(sub(ell(16, 16, 15, 5.2), ell(16, 16, 13, 3.6)), rect(0, 0, 32, 16)), ramp('#ffe27a'), { flat: true, tone: 3 })
    S.dots('12,11 11,13', '#5a4e8a')
    S.twinkle(26, 6, '#ffffff').glint(5, 25, '#ffe27a')
  },
}
