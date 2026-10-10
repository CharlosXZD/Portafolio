// The item recipes (VISUALS.md V2.5): one function per item id that paints a 32 by 32
// sprite on a kit Sprite. Each one is the plainest drawing that says what the item is,
// with one signature detail (style bible, ASSETS.md "Item sprite style"). Families share
// bases (bases.js); the idle sparkle, flicker and shimmer overlays are declared here and
// animated by ItemSprite.
import { add, ell, line, poly, rect, rrect, sub, METAL, MAT, ramp } from './spriteKit.js'
import { EL, coinFlat, chartDisc, flask, sealedScroll, tablet, pole } from './bases.js'
import { REACTIONS } from '../../../data/reactions.js'

const GOLD = METAL.gold
const IRON = METAL.iron

// A Constellation takes its colors from its reaction (data/reactions.js): the bezel the
// first element's, the stars the second's (resonance and the poker sets use their own color).
export function reactionColors(id) {
  const r = REACTIONS.find((x) => x.id === id)
  const [a, b] = r?.elements ?? []
  const frame = a ? EL[a] : ramp(r?.color ?? '#e0a82e')
  const star = b ? EL[b] : ramp(r?.color ?? '#ffd86a')
  return { frame, stars: [star[0], star[2], star[3], '#ffffff'] }
}

export const RECIPES = {
  // ---------------------------------------------------------------- the weak six of V2
  windfall(S) {
    // a heap of coins with two more falling
    coinFlat(S, 9, 24, 6)
    coinFlat(S, 16, 25, 6)
    coinFlat(S, 23, 24, 6)
    coinFlat(S, 12.5, 19, 6)
    coinFlat(S, 19.5, 19, 6)
    coinFlat(S, 16, 14, 6)
    S.paint(ell(8, 7, 2, 3.2), GOLD).paint(ell(25, 5, 2, 3.2), GOLD)
    S.glint(15, 13).glint(26, 4)
  },
  weights(S) {
    // two lead weights hanging from a loop of string
    const bell = (cx) => poly([[cx - 4, 17], [cx + 4, 17], [cx + 6, 28], [cx - 6, 28]])
    S.paint(line(16, 6, 9, 16, 1), MAT.parch, { flat: true, tone: 2 }).paint(line(16, 6, 23, 16, 1), MAT.parch, { flat: true, tone: 2 })
    S.paint(sub(ell(16, 5, 3.2, 3.2), ell(16, 5, 1.6, 1.6)), MAT.parch, { flat: true, tone: 1 })
    for (const cx of [9, 23]) {
      S.paint(bell(cx), IRON)
      S.paint(sub(ell(cx, 15.5, 2.8, 2.8), ell(cx, 15.5, 1.2, 1.2)), IRON, { flat: true, tone: 2 })
      S.box(cx - 1, 22, 3, 3, IRON[0])
    }
    S.glint(7, 20)
  },
  loom_of_fate(S) {
    // a wooden frame strung with golden thread, a heddle bar and a woven red-and-gold cloth
    S.paint(rect(3, 3, 26, 4), MAT.wood).paint(rect(3, 25, 26, 3), MAT.wood)
    S.paint(rect(4, 3, 3, 25), MAT.wood).paint(rect(25, 3, 3, 25), MAT.wood)
    for (let x = 9; x <= 22; x += 3) S.paint(rect(x, 7, 1, 11), GOLD, { flat: true, tone: 2 })
    S.paint(rect(8, 11, 16, 2), MAT.darkwood)
    S.paint(rect(8, 17, 16, 8), MAT.red)
    for (let y = 17; y < 25; y += 2) for (let x = 8 + ((y / 2) % 2) * 2; x < 24; x += 4) S.box(x, y, 2, 2, GOLD[1])
    S.paint(poly([[10, 14], [12, 13], [19, 13], [21, 14.5], [19, 16], [12, 16]]), METAL.brass)
    S.glint(9, 8)
  },  prism_lens(S) {
    // a glass prism splitting a white beam into four colors
    S.paint(poly([[12, 4], [23, 24], [1, 24]]), MAT.glass)
    S.paint(poly([[12, 11], [17, 21], [7, 21]]), MAT.glass, { flat: true, tone: 3 })
    S.paint(line(0, 18, 9, 17, 2), ramp('#ffffff'), { flat: true, tone: 2 })
    const rays = [[EL.fire, 11], [GOLD, 16], [EL.water, 21], [EL.air, 26]]
    for (const [r, y] of rays) S.paint(line(18, 16, 30, y, 2), r, { flat: true, tone: 1 })
    S.glint(10, 8)
  },
  bookends(S) {
    // two stone owls holding up three books
    const body = add(rrect(2, 9, 10, 18, 4), poly([[2, 9], [3, 4], [7, 9]]), poly([[7, 9], [11, 4], [12, 9]]))
    const flip = (a) => {
      const out = new Uint8Array(1024)
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (a[y * 32 + x]) out[y * 32 + (31 - x)] = 1
      return out
    }
    let x = 12
    for (const [c, h, w] of [['red', 17, 3], ['green', 14, 3], ['blue', 16, 2]]) {
      S.paint(rect(x, 28 - h, w, h), MAT[c])
      x += w
    }
    for (const mirror of [false, true]) {
      const f = (px, w = 1) => (mirror ? 31 - px - (w - 1) : px)
      S.paint(mirror ? flip(body) : body, MAT.stone)
      S.paint(rect(mirror ? 20 : 2, 27, 10, 2), MAT.stone)
      S.paint(rect(f(4, 5), 17, 5, 8), MAT.stone, { flat: true, tone: 2 })
      for (const ex of [3, 8]) S.box(f(ex, 3), 11, 3, 3, '#fff4d6').dot(f(ex + 1), 12, '#150c1c')
      S.box(f(6, 2), 15, 2, 2, '#e0a82e')
    }
  },  time_capsule(S) {
    // a sealed glass capsule with two tiny dice inside
    S.paint(rrect(9, 3, 14, 26, 6), MAT.glass)
    S.paint(rrect(10, 4, 12, 24, 5), MAT.glass, { flat: true, tone: 3 })
    S.paint(rrect(9, 3, 14, 6, 3), METAL.brass).paint(rrect(9, 23, 14, 6, 3), METAL.brass)
    const die = (x, y, pips) => {
      S.paint(rect(x, y, 7, 7), MAT.bone)
      for (const [px, py] of pips) S.dot(x + px, y + py, '#150c1c')
    }
    die(10, 10, [[2, 2], [4, 4]])
    die(14, 17, [[3, 3]])
    S.glint(11, 12)
  },
  // ---------------------------------------------------------------- others across families
  molten_core(S) {
    // a cracked obsidian core with lava veins
    S.paint(add(ell(16, 16, 12, 11), ell(9, 10, 5, 5), ell(24, 22, 5, 4)), MAT.black)
    const veins = '16,16 15,15 14,14 13,13 12,12 11,11 11,10 17,17 18,18 19,18 20,19 21,20 22,21 15,17 14,18 14,19 13,20 13,21 18,15 19,14 20,13 21,12 22,12 16,9 16,10 16,11 16,12 17,23 17,22 17,21 17,20'
    S.dots(veins, MAT.flame[1])
    S.box(14, 14, 4, 4, MAT.flame[2]).box(15, 15, 2, 2, MAT.flame[3])
    S.flicker(15, 14, '#fff4c8')
  },  honing_oil(S) {
    flask(S, { liquid: ramp('#e8b43a'), shape: 'vial', level: 0.72 })
    S.paint(ell(16, 21, 2, 3), ramp('#fff1a8'), { flat: true, tone: 2 })
    S.shimmer(12, 17, 3, '#fff6c8')
  },
  rune_echo(S) {
    tablet(S, {})
    // the rune of echo: three nested arcs ringing out from a point
    const glow = ramp('#b896ff')
    S.paint(sub(ell(16, 16, 7, 7), ell(16, 16, 5.6, 5.6)), glow, { flat: true, tone: 1 })
    S.paint(sub(ell(16, 16, 4.6, 4.6), ell(16, 16, 3.2, 3.2)), glow, { flat: true, tone: 2 })
    S.box(15, 15, 2, 2, glow[3])
    S.twinkle(16, 16, '#ffffff')
  },  law_greed(S) {
    sealedScroll(S, {
      seal: '#e0a82e',
      emblem(S2) {
        // a coin stamped in the wax
        S2.box(14, 15, 4, 4, '#6e4a22').box(15, 14, 2, 6, '#6e4a22').box(15, 16, 2, 2, '#ffd86a')
      },
    })
    S.glint(9, 9)
  },  totem_fire(S) {
    pole(S, {
      paint: EL.fire,
      mark(S2) {
        S2.paint(poly([[16, 1], [20, 6], [16, 5], [12, 6]]), ramp('#ffc24a'))
      },
    })
    S.flicker(16, 3, '#fff4c8')
  },
  const_phoenix(S) {
    const { frame, stars } = reactionColors('kindle')
    chartDisc(S, {
      frame,
      stars,
      pts: [[16, 9], [13, 14], [19, 14], [10, 21], [22, 20], [16, 23]],
      links: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 5]],
    })
    S.twinkle(16, 9)
  },
}

