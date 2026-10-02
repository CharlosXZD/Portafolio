// The gods on the table (EXPANSION.md B4). A god die brings its god's
// power and its drawback; the Primordial die (B1) brings the power of
// every god it has absorbed (`die.absorbed`), without the drawback. The
// gauntlet's trials (data/bossModifiers.js GOD_TRIALS) turn the drawbacks
// on the player through boss effects. Scoring reads the powers in
// engine/scoring.js; this file holds the rolling side.
import { ELEMENTS, PRIMORDIAL_DIE_ID, inFamily } from '../data/elements.js'

/** Every god power in the pool: { god, index, drawback }. */
export function godPowers(dice) {
  const out = []
  dice.forEach((d, index) => {
    const god = ELEMENTS[d.elementId]?.god
    if (god) out.push({ god, index, drawback: true })
    if (d.elementId === PRIMORDIAL_DIE_ID) (d.absorbed || []).forEach((g) => out.push({ god: g, index, drawback: false }))
  })
  return out
}

export const isGodDie = (die) => Boolean(ELEMENTS[die?.elementId]?.god)

/**
 * How one die explodes, given the rest of the pool and the relic effects:
 * from which face (`explodeFrom`), how likely each explosion is
 * (`explodeChance`), and its chain cap (`chainCap`, or undefined for the
 * usual rules).
 */
export function rollContext(die, dice, fx) {
  const index = dice.findIndex((d) => d.id === die.id)
  const powers = godPowers(dice)
  const own = powers.filter((p) => p.index === index)
  const fire = inFamily(die.elementId, 'fire')
  let explodeFrom = die.sides
  // Chain Break: Fire-family dice explode on their top two faces.
  if (fx.fireTopTwoExplode && fire) explodeFrom = die.sides - 1
  // Ognen explodes on any face of 4 or more.
  const ognen = own.find((p) => p.god === 'ognen')
  if (ognen) explodeFrom = Math.min(explodeFrom, Math.min(4, die.sides))
  let explodeChance = 1
  // Ognen's drawback: a Water-family die in the pool halves his explosions.
  if (ognen?.drawback && dice.some((d, i) => i !== index && inFamily(d.elementId, 'water'))) explodeChance *= 0.5
  // Zephyr's drawback, and his trial: Fire-family dice explode half as often.
  if (fire && powers.some((p) => p.god === 'zephyr' && p.drawback)) explodeChance *= 0.5
  if (fire && fx.fireExplodeHalf) explodeChance *= 0.5
  // Ognen chains up to 10, or without a cap under Chain Break.
  const chainCap = ognen ? (fx.ognenUncapped ? Infinity : 10) : undefined
  return { explodeFrom, explodeChance, chainCap }
}

const toFace = (d, value) => ({ ...d, value, total: value, explosions: 0 })

/**
 * Varuna's tide, applied after every roll. Her trial (and her drawback,
 * when she shows a 1): every die becomes a 1, held and locked ones too.
 * Her power: every die showing a 1 takes her face instead.
 */
export function settleTide(dice, fx = {}) {
  if (fx.varunaCurse && dice.some((d) => d.value === 1)) return dice.map((d) => toFace(d, 1))
  const tides = godPowers(dice).filter((p) => p.god === 'varuna')
  if (tides.length === 0) return dice
  const cursed = tides.find((p) => p.drawback && dice[p.index].value === 1)
  if (cursed) return dice.map((d) => toFace(d, 1))
  const source = dice[tides[0].index]
  if (source.value === 1) return dice
  return dice.map((d) => (d.value === 1 && d.id !== source.id ? toFace(d, source.value) : d))
}

/** With Varuna's power on the table, any die can lock for free. */
export function tideLocks(dice) {
  return godPowers(dice).some((p) => p.god === 'varuna')
}
