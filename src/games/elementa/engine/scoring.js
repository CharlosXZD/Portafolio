import { ELEMENTS, FLAGS, TIERS, reactionElementsOf, inFamily, actingElementIds } from '../data/elements.js'
import { REACTIONS, reactionById } from '../data/reactions.js'
import { random } from './rng.js'
import { godPowers, rollContext } from './gods.js'

const DEFAULT_EXPLODE_CAP = 10

function randInt(max) {
  return 1 + Math.floor(random() * max)
}

function hasFlag(elementId, flag) {
  return Boolean(ELEMENTS[elementId]?.flags[flag])
}

function relicEffects(relics) {
  return relics.reduce((acc, r) => ({ ...acc, ...r.effects }), {})
}

/**
 * Rolls a single die from scratch, resolving its full explosion chain.
 * Returns the shape stored on the die in game state: { value, total, explosions, rollId }.
 * `value` is the original face (used for zeroOnMin + set-matching);
 * `total` is the summed contribution after any explosion chain.
 * `rollId` changes on every roll (even if the face repeats) so the UI can
 * key a roll animation off it instead of off the value.
 */
export function rollDie(elementId, sides, relics = [], ctx = {}) {
  const fx = relicEffects(relics)
  let value = randInt(sides)
  // Chrono: a 1 rewinds and rolls again until it isn't a 1 (B10).
  if (hasFlag(elementId, FLAGS.CHRONO)) while (value === 1) value = randInt(sides)
  // Steady: Earth-family faces never land below its floor.
  if (fx.earthFamilyMinFace && inFamily(elementId, 'earth')) value = Math.max(value, Math.min(fx.earthFamilyMinFace, sides))
  let total = value
  let explosions = 0

  if (hasFlag(elementId, FLAGS.EXPLODE)) {
    // A boss round's "Calm Winds" twist caps every explosion chain at
    // exactly 1 (the first max face still explodes once, then stops),
    // overriding even an uncapped-chain relic for the round. `ctx` (from
    // engine/gods.js rollContext) can lower the explode face, make each
    // explosion a coin flip, and set the god's own chain cap.
    const cap = fx.noExplodeChain
      ? 1
      : ctx.chainCap ?? (fx.explodeChainUncapped ? Infinity : DEFAULT_EXPLODE_CAP)
    const from = ctx.explodeFrom ?? sides
    const chance = ctx.explodeChance ?? 1
    let current = value
    while (current >= from && explosions < cap) {
      if (chance < 1 && random() >= chance) break
      const next = randInt(sides)
      const addValue = fx.fireExplodeDouble ? next * 2 : next
      total += addValue
      explosions += 1
      current = next
    }
  }

  return { value, total, explosions, rollId: random() }
}

/** Rerolls every die in `dice` that is not held/locked, applying reroll-time relics. */
export function rerollPool(dice, relics = []) {
  const next = dice.map((d) => ({ ...d }))

  for (let i = 0; i < next.length; i++) {
    const die = next[i]
    if (die.held || die.locked) {
      // Sapling grows while it sits a reroll out.
      if (hasFlag(die.elementId, FLAGS.GROWS)) die.growth = (die.growth || 0) + 2
      // Patience (Earth family): the same, but it keeps it until the round ends.
      if (inFamily(die.elementId, 'earth')) die.patience = (die.patience || 0) + 2
      continue
    }
    const rolled = rollDie(die.elementId, die.sides, relics, rollContext(die, dice, relicEffects(relics)))
    Object.assign(die, rolled, { growth: 0 })

    const canDuplicate = hasFlag(die.elementId, FLAGS.DUPLICATE_ON_REROLL)
    if (canDuplicate && random() < 0.33) {
      const targets = next.filter((d, j) => j !== i && !d.held && !d.locked)
      if (targets.length > 0) {
        const target = targets[Math.floor(random() * targets.length)]
        Object.assign(target, {
          value: die.value,
          total: die.total,
          explosions: die.explosions,
          rollId: random(),
        })
      }
    }
  }

  return next
}

function longestConsecutiveRun(sortedUniqueVals) {
  if (sortedUniqueVals.length === 0) return 0
  let best = 1
  let current = 1
  for (let i = 1; i < sortedUniqueVals.length; i++) {
    if (sortedUniqueVals[i] === sortedUniqueVals[i - 1] + 1) {
      current += 1
    } else {
      current = 1
    }
    best = Math.max(best, current)
  }
  return best
}

function setBonusTier(maxGroupSize, longestRun, noStraight) {
  if (longestRun >= 4 && !noStraight) return 'straight'
  if (maxGroupSize >= 3) return 'three'
  if (maxGroupSize >= 2) return 'pair'
  return null
}

const BASE_TIER_MULT = { pair: 1, three: 2, straight: 3 }

// Which relic (if any) supplied an effect key, so the score breakdown can
// name the relic behind each line instead of a generic "relic bonus".
function sourceOf(relics, key) {
  return relics.find((r) => r.effects && key in r.effects)?.id ?? null
}

/**
 * Adjacent pairs that can react. Normally i and i+1; a Conduit die also
 * links its two neighbors to each other; the Ley Line relic joins the two
 * ends of the pool into a ring.
 */
function adjacencyLinks(perDie, fx) {
  const links = []
  const n = perDie.length
  for (let i = 0; i < n - 1; i++) links.push([i, i + 1])
  // A Conduit's bridge counts double (B10), marked with a third entry.
  for (let i = 1; i < n - 1; i++) {
    if (hasFlag(perDie[i].actingAs, FLAGS.CONDUIT)) links.push([i - 1, i + 1, 2])
  }
  if (fx.wrapAdjacency && n > 2) links.push([n - 1, 0])
  return links
}

const isFusion = (id) => [TIERS.DOUBLE, TIERS.TRIPLE].includes(ELEMENTS[id]?.tier)

function secretPairMatches([x, y], a, b) {
  const match = (want, got) => (want === '*fusion' ? isFusion(got) : want === got)
  return (match(x, a) && match(y, b)) || (match(x, b) && match(y, a))
}

function findReactions(perDie, fx, extraMult = 0) {
  const found = []
  for (const [i, j, factor = 1] of adjacencyLinks(perDie, fx)) {
    const a = perDie[i]
    const b = perDie[j]
    if (!(a.contribution > 0 && b.contribution > 0)) continue
    const ea = reactionElementsOf(a.actingAs)
    const eb = reactionElementsOf(b.actingAs)
    if (ea.length === 0 || eb.length === 0) continue
    const ids = new Set()
    if (a.actingAs === b.actingAs) ids.add('resonance')
    for (const r of REACTIONS) {
      if (r.secret) {
        if (secretPairMatches(r.pair, a.actingAs, b.actingAs)) ids.add(r.id)
        continue
      }
      if (!r.elements) continue
      const [x, y] = r.elements
      if ((ea.includes(x) && eb.includes(y)) || (ea.includes(y) && eb.includes(x))) ids.add(r.id)
    }
    for (const id of ids) {
      const r = reactionById(id)
      const base =
        r.base === 'lowerFace'
          ? Math.min(a.value, b.value)
          : r.base === 'higherFace'
            ? Math.max(a.value, b.value)
            : r.base === 'bothFaces'
              ? a.value + b.value
              : r.base === 'bothFacesDouble'
                ? (a.value + b.value) * 2
                : r.base
      const mult = r.mult > 0 ? r.mult + (fx.reactionMultBonus || 0) + extraMult : 0
      found.push({
        id,
        a: i,
        b: j,
        base: (base + (fx.reactionBaseBonus || 0)) * factor,
        mult: mult * factor,
        secret: Boolean(r.secret),
      })
    }
  }
  return found
}

// A die scores 0 this roll: a fizzling die on a 1, or a Shadow Twin on its
// low faces (B3). Blessing of Ember-ward cancels every fizzle for a round.
function fizzles(d, ctx, fx = {}) {
  if (ctx.noFizzle) return false
  // Ognen fizzles on 1 to 3 (B4), and so does the Fire family in his trial.
  const upTo = Math.max(
    d.fizzleUpTo || 0,
    ELEMENTS[d.elementId]?.god === 'ognen' ? 3 : 0,
    fx.fireFizzleUpTo && inFamily(d.elementId, 'fire') ? fx.fireFizzleUpTo : 0,
  )
  return (hasFlag(d.actingAs ?? d.elementId, FLAGS.ZERO_ON_MIN) && d.value === 1) || d.value <= upTo
}

/**
 * Evaluates an already-rolled pool into a final Round Score.
 * See GDD.md §5 for the formula this implements. Besides the totals, it
 * returns `baseLines` / `multLines`: every source of Base and Mult in the
 * order it's applied, which is what the cast screen's ledger shows and
 * what the reveal animation steps through.
 */
export function evaluatePool(dice, relics = [], ctx = {}) {
  const fx = relicEffects(relics)
  // `actingAs`: the element whose abilities a die uses (itself, unless it
  // is a Masquerade or Chameleon borrowing from its left neighbor).
  const acting = actingElementIds(dice)
  const perDie = dice.map((d, i) => ({ ...d, actingAs: acting[i] }))
  const n = perDie.length

  const explodeCount = perDie.reduce((sum, d) => sum + (d.explosions || 0), 0)

  let zeroTargets = new Set()
  if (fx.fizzleSpreadsZero) {
    perDie.forEach((d, i) => {
      const fizzled = fizzles(d, ctx, fx)
      if (fizzled) {
        const others = perDie.map((_, j) => j).filter((j) => j !== i)
        // Picked from the fizzling die's own roll id rather than a fresh
        // random draw, so the live preview and the real cast always agree.
        const pick = Math.floor(((d.rollId * 9973) % 1) * others.length)
        if (others.length > 0) zeroTargets.add(others[pick])
      }
    })
  }

  // God powers on the table (B4): from god dice and the Primordial die.
  const powers = godPowers(perDie)
  const gaeaPower = powers.some((p) => p.god === 'gaea')
  const gaeaDrawback = powers.some((p) => p.god === 'gaea' && p.drawback)

  // --- set / straight detection (grouped by original face value) ---
  const enablesSets = !fx.noSetBonus && perDie.some((d) => hasFlag(d.actingAs, FLAGS.ENABLES_SET_BONUS))
  let setTier = null
  let winningValues = new Set()
  let setIsAllWaterFamily = false

  if (enablesSets) {
    // Wildcards: pure Earth with Fossil, every Earth-family die with Gaea's
    // power, and the die carrying Zephyr's power (B4).
    const wildcardIds = perDie
      .filter(
        (d, i) =>
          (fx.earthWildcardForSets && d.elementId === 'earth') ||
          (gaeaPower && inFamily(d.elementId, 'earth') && !powers.some((p) => p.index === i && p.god === 'gaea')) ||
          powers.some((p) => p.index === i && p.god === 'zephyr'),
      )
      .map((d) => d.id)
    const wildcardCount = wildcardIds.length

    const groups = new Map()
    perDie.forEach((d) => {
      if (wildcardIds.includes(d.id)) return
      groups.set(d.value, (groups.get(d.value) || 0) + 1)
    })

    let maxGroupSize = 0
    let maxGroupValue = null
    for (const [val, count] of groups.entries()) {
      const withWildcards = count + wildcardCount
      if (withWildcards > maxGroupSize) {
        maxGroupSize = withWildcards
        maxGroupValue = val
      }
    }
    // A pool of nothing but wildcards still makes a set of their size.
    if (groups.size === 0) maxGroupSize = wildcardCount

    const uniqueVals = [...groups.keys()].sort((a, b) => a - b)
    const longestRun = longestConsecutiveRun(uniqueVals)

    // Zephyr's trial: sets need one more matching die (B1).
    const extra = fx.setsNeedExtra || 0
    const baseTier = setBonusTier(maxGroupSize - extra, longestRun - extra, fx.noStraight)
    setTier = baseTier
    // Zephyr's power: every set goes up one tier (B4).
    if (setTier && powers.some((p) => p.god === 'zephyr')) {
      setTier = setTier === 'pair' ? 'three' : setTier === 'three' && !fx.noStraight ? 'straight' : setTier
    }

    if (baseTier === 'pair' || baseTier === 'three') {
      perDie.forEach((d) => {
        if (d.value === maxGroupValue || wildcardIds.includes(d.id)) winningValues.add(d.id)
      })
      setIsAllWaterFamily = [...winningValues].every((id) => {
        const d = perDie.find((x) => x.id === id)
        return hasFlag(d.actingAs, FLAGS.FREE_LOCK)
      })
    }
  }

  // --- pass 1: each die's own score ---
  let midasShards = 0
  let bullionDice = 0
  perDie.forEach((d, i) => {
    const fizzled = fizzles(d, ctx, fx)
    const banned = fx.bannedElementId && d.elementId === fx.bannedElementId
    const midas = hasFlag(d.actingAs, FLAGS.MIDAS)
    const bullion = hasFlag(d.actingAs, FLAGS.BULLION)
    if (midas) midasShards += d.total
    if (bullion) bullionDice += 1
    let contribution = fizzled || zeroTargets.has(i) || banned || midas || bullion ? 0 : d.total

    if (contribution > 0) {
      if (fx.highFaceHalf && d.value > 4) contribution /= 2
      if (d.elementId === 'earth' && fx.earthPipMultiplier) contribution *= fx.earthPipMultiplier
      if (hasFlag(d.actingAs, FLAGS.DOUBLE_ON_SET) && winningValues.has(d.id)) contribution *= 2
      if (hasFlag(d.elementId, FLAGS.GROWS)) contribution += d.growth || 0
      if (inFamily(d.elementId, 'earth')) contribution += d.patience || 0
      // Heat: every explosion this round warms the whole Fire family.
      if (fx.fireFamilyBonusPerExplosion && inFamily(d.elementId, 'fire')) {
        contribution += fx.fireFamilyBonusPerExplosion * (ctx.explosionsThisRound || 0)
      }
      contribution += d.bonus || 0
      // Gaea scores the face of every other Earth-family die (B4).
      if (powers.some((p) => p.index === i && p.god === 'gaea')) {
        contribution += perDie.reduce((sum, o, j) => (j !== i && inFamily(o.elementId, 'earth') ? sum + o.value : sum), 0)
      }
      // Relic bonuses that belong to a single die are folded into its own
      // contribution, so the reveal's floating "+N" shows them honestly.
      const tier = ELEMENTS[d.elementId]?.tier
      if (fx.fusionContribMult && tier && tier !== 'pure' && tier !== 'arcane') contribution *= fx.fusionContribMult
      if (fx.lockedDieDouble && d.locked) contribution *= 2
      if (fx.lockedDieBaseBonus && d.locked) contribution += fx.lockedDieBaseBonus
      if (fx.maxFaceBaseBonus && d.value === d.sides) contribution += fx.maxFaceBaseBonus
      // Gaea's drawback (on every other Earth-family die) and her trial
      // (on all of them): -5, or -10 on a 1.
      const gaeaHere = powers.some((p) => p.index === i && p.god === 'gaea')
      const gaeaCurse = (fx.earthCurse || (gaeaDrawback && !gaeaHere)) && inFamily(d.elementId, 'earth')
      if (gaeaCurse) contribution = Math.max(0, contribution - (d.value === 1 ? 10 : 5))
    }
    d.contribution = contribution
  })

  // --- pass 2: placement. Mirrors copy left-to-right (so chains work),
  // then Beacons and positional relics scale their neighbors/slots. ---
  // Chameleon scores what its right neighbor scored on its own (before any
  // copying), Masquerade and Mirror what their left neighbor ends up with.
  const ownScores = perDie.map((d) => d.contribution)
  perDie.forEach((d, i) => {
    if (i < n - 1 && hasFlag(d.elementId, FLAGS.MIMIC_SPLIT)) d.contribution = ownScores[i + 1]
  })
  perDie.forEach((d, i) => {
    const copiesLeft = hasFlag(d.elementId, FLAGS.MIRROR_LEFT) || hasFlag(d.elementId, FLAGS.MIMIC_LEFT)
    if (i > 0 && copiesLeft) d.contribution = perDie[i - 1].contribution
  })
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.BEACON)) return
    for (const j of [i - 1, i + 1]) if (perDie[j]) perDie[j].contribution *= 1.5
  })
  if (fx.bookendsBonus && n > 0) {
    perDie[0].contribution += perDie[0].contribution > 0 ? fx.bookendsBonus : 0
    if (n > 1) perDie[n - 1].contribution += perDie[n - 1].contribution > 0 ? fx.bookendsBonus : 0
  }
  if (fx.middleDouble && n >= 3) {
    const mids = n % 2 === 1 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]
    mids.forEach((m) => (perDie[m].contribution *= 2))
  }
  // A boss round's "The Pillar": your best die is knocked down to 0.
  if (fx.highestDieZero && n > 0) {
    let best = 0
    perDie.forEach((d, i) => {
      if (d.contribution > perDie[best].contribution) best = i
    })
    perDie[best].contribution = 0
  }
  perDie.forEach((d) => (d.contribution = Math.round(d.contribution * 100) / 100))

  // --- Base ---
  const baseLines = []
  const diceSum = perDie.reduce((sum, d) => sum + d.contribution, 0)
  baseLines.push({ kind: 'dice', value: diceSum, op: 'add' })
  let baseValue = diceSum

  if (fx.pureEarthBaseBonusPct && perDie.every((d) => d.elementId === 'earth')) {
    baseValue *= 1 + fx.pureEarthBaseBonusPct
    baseLines.push({ kind: 'relic', id: sourceOf(relics, 'pureEarthBaseBonusPct'), value: 1 + fx.pureEarthBaseBonusPct, op: 'mul' })
  }
  if (fx.explodeFlatBonus && explodeCount > 0) {
    const v = fx.explodeFlatBonus * explodeCount
    baseValue += v
    baseLines.push({ kind: 'relic', id: sourceOf(relics, 'explodeFlatBonus'), value: v, op: 'add' })
  }

  const reactions = findReactions(perDie, fx, ctx.reactionMultBonus || 0)
  reactions.forEach((r) => {
    if (r.base > 0) {
      baseValue += r.base
      baseLines.push({ kind: 'reaction', id: r.id, value: r.base, op: 'add', dice: [r.a, r.b] })
    }
  })

  // --- Mult ---
  const multLines = []
  let multiplier = 1
  const addMult = (line) => {
    if (!line.value) return
    multiplier += line.value
    multLines.push({ op: 'add', ...line })
  }
  addMult({ kind: 'explosions', value: 0.5 * explodeCount, count: explodeCount })
  if (setTier) {
    const relicBonus = fx.setBonusMultBonus?.[setTier] || 0
    let tierMult = BASE_TIER_MULT[setTier] + relicBonus
    if (fx.waterFamilySetBonusDouble && setIsAllWaterFamily) tierMult *= 2
    if (setTier === 'pair' && fx.pairMultBonus) tierMult += fx.pairMultBonus
    addMult({ kind: 'set', tier: setTier, value: tierMult })
  }
  reactions.forEach((r) => {
    if (r.mult > 0) addMult({ kind: 'reaction', id: r.id, value: r.mult, dice: [r.a, r.b] })
  })
  if (fx.multPerExplodingDie) {
    addMult({
      kind: 'relic',
      id: sourceOf(relics, 'multPerExplodingDie'),
      value: fx.multPerExplodingDie * perDie.filter((d) => (d.explosions || 0) > 0).length,
    })
  }
  if (fx.noZeroMultBonus && perDie.every((d) => d.contribution > 0)) {
    addMult({ kind: 'relic', id: sourceOf(relics, 'noZeroMultBonus'), value: fx.noZeroMultBonus })
  }
  if (fx.multPerDistinctElement) {
    addMult({
      kind: 'relic',
      id: sourceOf(relics, 'multPerDistinctElement'),
      value: fx.multPerDistinctElement * new Set(perDie.map((d) => d.elementId)).size,
    })
  }
  if (fx.multPerUnusedReroll && ctx.rerollsLeft > 0) {
    addMult({ kind: 'relic', id: sourceOf(relics, 'multPerUnusedReroll'), value: fx.multPerUnusedReroll * ctx.rerollsLeft })
  }
  // Severed Grace (B3): +1 Mult for the rest of the run.
  if (ctx.permanentMult) addMult({ kind: 'boon', id: 'severed_grace', value: ctx.permanentMult })
  if (fx.finalMultFactor) {
    multiplier *= fx.finalMultFactor
    multLines.push({ kind: 'relic', id: sourceOf(relics, 'finalMultFactor'), value: fx.finalMultFactor, op: 'mul' })
  }

  const roundScore = Math.round(baseValue * multiplier)
  // Bullion pays the final Mult, rounded down, per Bullion die.
  const bullionShards = bullionDice * Math.floor(multiplier)

  return {
    baseValue: Math.round(baseValue * 100) / 100,
    multiplier: Math.round(multiplier * 100) / 100,
    roundScore,
    explodeCount,
    setTier,
    reactions,
    baseLines,
    multLines,
    midasShards,
    bullionShards,
    dice: perDie,
  }
}

// Round 1 must be clearable with the starting 3d6 Earth kit (max roll 18,
// no multiplier available yet), so keep the base well under that ceiling.
// The curve itself is driven by the chosen difficulty (data/difficulty.js).
export function thresholdForRound(round, difficulty) {
  const base = difficulty.thresholdBase * Math.pow(difficulty.thresholdGrowth, round - 1)
  return Math.round(base * (difficulty.thresholdMultiplier ?? 1))
}

// Overkill reward: +1 Shard for every 25% the score went past the target
// (2x = +4, 3x = +8), capped at +15. Ratio-based so it matters as much in
// round 1 as in round 15.
export const OVERKILL_CAP = 15
export function overkillShards(roundScore, threshold) {
  if (threshold <= 0 || roundScore < threshold) return 0
  return Math.min(OVERKILL_CAP, Math.floor((roundScore / threshold - 1) * 4))
}

export function shardsEarned(roundScore, threshold, difficulty) {
  return Math.round((5 + overkillShards(roundScore, threshold)) * difficulty.shardMultiplier)
}

export function interestFor(shards, capBonus = 0, divisor = 3) {
  const cap = 5 + capBonus
  return Math.min(cap, Math.floor(shards / divisor))
}
