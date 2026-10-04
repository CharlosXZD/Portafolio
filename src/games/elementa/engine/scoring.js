import { ELEMENTS, FLAGS, TIERS, reactionElementsOf, inFamily, actingElementIds } from '../data/elements.js'
import { tierById } from '../data/diceTiers.js'
import { REACTIONS, reactionById } from '../data/reactions.js'
import { random } from './rng.js'
import { godPowers, rollContext } from './gods.js'
import { levelBonus } from '../data/constellations.js'
import { hasActiveRune } from '../data/runes.js'
import { totemLevel, tideShare, FIRE_TOTEM_MULT } from '../data/totems.js'

const DEFAULT_EXPLODE_CAP = 10
// Darkness (EXPANSION.md H3) adds its neighbors' score to Mult divided by
// this. Carlos asked for it undivided; one constant so it is easy to tune.
export const DARKNESS_DIVISOR = 1
// Obscurity (Darkness, Carlos 2026-10-04): its neighbors keep this share of
// their score (half) instead of scoring 0; their whole score still goes to Mult.
export const DARKNESS_KEEP = 0.5
// Chrono (H4) has no gameplay limit; this only stops a pool that can never
// leave 1 from looping forever.
export const CHRONO_SAFETY_STOP = 2000
// Pulsar (I1): at most this much Base from rerolls.
export const PULSAR_CAP = 10
// The sizes Chaos can take (H3).
const CHAOS_SIZES = ['d3', 'd5', 'd6', 'd10', 'd20']
// Every die Chaos can become: everything but the gods, the Primordial die
// and the Mythic dice.
const CHAOS_FORM_IDS = Object.keys(ELEMENTS).filter(
  (id) => ![TIERS.GOD, TIERS.PRIMAL, TIERS.MYTHIC].includes(ELEMENTS[id].tier),
)
// What Flux can become each roll (K1): a pure element.
const FLUX_FORM_IDS = ['earth', 'fire', 'water', 'air']

function randInt(max) {
  return 1 + Math.floor(random() * max)
}

// Who changed a die's score through its position (Beacon, Satellite, Mirror
// and friends): display only, for the cast choreography's captions.
function noteBoost(d, boost) {
  d.boosts = [...(d.boosts ?? []), boost]
}

function hasFlag(elementId, flag) {
  return Boolean(ELEMENTS[elementId]?.flags[flag])
}

function relicEffects(relics) {
  return relics.reduce((acc, r) => ({ ...acc, ...r.effects }), {})
}

/**
 * Rolls a single die from scratch, resolving its full explosion chain.
 * Returns the shape stored on the die in game state: { value, total, explosions, chain, rollId }.
 * `value` is the original face (used for zeroOnMin + set-matching);
 * `total` is the summed contribution after any explosion chain.
 * `chain` lists the faces rolled in order ([6, 6, 4]) so the UI can replay
 * an explosion chain (EXPANSION.md P11); it never affects scoring.
 * `rollId` changes on every roll (even if the face repeats) so the UI can
 * key a roll animation off it instead of off the value.
 */
// A face with an optional lean toward 1 (Varuna's drawback): a bias of 1.5
// makes a 1 half again as likely, the other faces share the rest evenly.
function rollFace(sides, oneBias = 1) {
  if (oneBias !== 1 && sides > 1) {
    if (random() < Math.min(1, oneBias / sides)) return 1
    return 2 + Math.floor(random() * (sides - 1))
  }
  return randInt(sides)
}

export function rollDie(elementId, sides, relics = [], ctx = {}) {
  const fx = relicEffects(relics)
  const bias = ctx.oneBias ?? 1
  let value = rollFace(sides, bias)
  // Kairos (the old Chrono): a 1 rolls again until it isn't a 1 (B10, H4).
  if (hasFlag(elementId, FLAGS.KAIROS)) while (value === 1) value = rollFace(sides, bias)
  // Steady: Earth-family faces never land below its floor.
  if (fx.earthFamilyMinFace && inFamily(elementId, 'earth')) value = Math.max(value, Math.min(fx.earthFamilyMinFace, sides))
  let total = value
  let explosions = 0
  const chain = [value]

  // A Rune of Ember (J3) makes any die explode (ctx.runeExplode).
  if (hasFlag(elementId, FLAGS.EXPLODE) || hasFlag(elementId, FLAGS.COMET) || ctx.runeExplode) {
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
    // A Rune of Ember (K3b) makes its own number an exploding face.
    const runeFaces = ctx.explodeFaces ?? []
    while ((current >= from || runeFaces.includes(current)) && explosions < cap) {
      if (chance < 1 && random() >= chance) break
      const next = rollFace(sides, bias)
      const addValue = fx.fireExplodeDouble ? next * 2 : next
      total += addValue
      explosions += 1
      chain.push(next)
      current = next
    }
  }

  return { value, total, explosions, chain, rollId: random() }
}

/**
 * Chaos (H3): every Chaos die about to roll (not held, not locked) takes a
 * new form, a random die and size from the whole game. It keeps its own
 * element for saving and display; `actingElementIds` reads the form.
 */
export function shiftChaos(dice) {
  return dice.map((d) => {
    // Flux (K1) becomes a random pure element, keeping its own size.
    if (d.elementId === 'flux' && !d.held && !d.locked) {
      return { ...d, chaosForm: { elementId: FLUX_FORM_IDS[Math.floor(random() * FLUX_FORM_IDS.length)], tierId: d.tierId } }
    }
    if (d.elementId !== 'chaos' || d.held || d.locked) return d
    const elementId = CHAOS_FORM_IDS[Math.floor(random() * CHAOS_FORM_IDS.length)]
    const tierId = CHAOS_SIZES[Math.floor(random() * CHAOS_SIZES.length)]
    return { ...d, chaosForm: { elementId, tierId }, sides: tierById(tierId).sides }
  })
}

/**
 * Rerolls every die in `dice` that is not held/locked, applying reroll-time
 * relics. `opts.noGrowth` skips Sapling and Patience growth, for the extra
 * rolls of a Chrono rewind (H4), which are not rerolls the dice sit out.
 */
export function rerollPool(dice, relics = [], opts = {}) {
  const next = shiftChaos(dice).map((d) => ({ ...d }))
  const fx = relicEffects(relics)

  // A Masquerade or Chameleon rolls with the abilities it borrows (Chrono's
  // rewind, a Fire die's explosions), the same ones its score uses.
  const acting = actingElementIds(next)
  for (let i = 0; i < next.length; i++) {
    const die = next[i]
    if (die.held || die.locked) {
      if (opts.noGrowth) continue
      // Sapling grows while it sits a reroll out.
      if (hasFlag(acting[i], FLAGS.GROWS)) die.growth = (die.growth || 0) + 2
      // Patience (Earth family): the same, but it keeps it until the round
      // ends. Standing Stones and the Earth Totem make it grow faster (L3, L4).
      if (inFamily(acting[i], 'earth')) die.patience = (die.patience || 0) + 2 + (fx.patienceBonus || 0) + (opts.patienceBonus || 0)
      continue
    }
    const rolled = rollDie(acting[i], die.sides, relics, rollContext(die, next, fx, acting[i]))
    Object.assign(die, rolled, { growth: 0, drifted: false })

    const canDuplicate = hasFlag(acting[i], FLAGS.DUPLICATE_ON_REROLL)
    if (canDuplicate && random() < 0.33) {
      const targets = next.filter((d, j) => j !== i && !d.held && !d.locked)
      if (targets.length > 0) {
        const target = targets[Math.floor(random() * targets.length)]
        Object.assign(target, {
          value: die.value,
          total: die.total,
          explosions: die.explosions,
          chain: die.chain,
          rollId: random(),
        })
      }
    }
  }

  return next
}

/**
 * Chrono (H4): when a Chrono is in the pool and any die that just rolled lands on a 1, time
 * rewinds: every unheld, unlocked die rolls again for free (Chrono too) and
 * the better pool by round score stays. It repeats while any die still shows
 * a 1 (no limit). `rolled` is the set of die ids that
 * rolled this time (held and locked dice never trigger it); `settle` runs
 * after each extra roll (Varuna's tide). Returns the pool and the count.
 */
export function chronoLoop(dice, relics = [], ctx = {}, rolled = null, settle = (x) => x) {
  const triggered = (pool) => {
    // Any die that just rolled a 1 sets it off while a Chrono is in the pool
    // (v0.7.1 playtest: it used to need Chrono's own 1).
    const acting = actingElementIds(pool)
    if (!pool.some((d, i) => hasFlag(acting[i], FLAGS.CHRONO))) return false
    return pool.some((d) => d.value === 1 && !d.held && !d.locked && (!rolled || rolled.has(d.id)))
  }
  // No limit by design (Carlos): it keeps rewinding until a roll comes up
  // with no 1 on a rolled die. `best` is the better pool seen so far; each
  // rewind rolls from the latest roll. CHRONO_SAFETY_STOP only guards against
  // a pool that can never leave 1 (it is never reached in normal play).
  let best = dice
  let bestScore = null
  let latest = dice
  let loops = 0
  while (loops < CHRONO_SAFETY_STOP && triggered(latest)) {
    if (bestScore === null) bestScore = evaluatePool(best, relics, ctx).roundScore
    latest = settle(rerollPool(latest, relics, { noGrowth: true }))
    const score = evaluatePool(latest, relics, ctx).roundScore
    if (score > bestScore) {
      best = latest
      bestScore = score
    }
    loops += 1
  }
  return { dice: best, loops }
}

/** The face Light lifts every die to (H3), or 0 without Light. */
export function lightFloor(dice) {
  const acting = actingElementIds(dice)
  return dice.reduce((best, d, i) => (hasFlag(acting[i], FLAGS.LIGHT) ? Math.max(best, d.value) : best), 0)
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

// The faces of the longest run of consecutive values (the dice that make a
// straight), for the cast choreography to outline. Display only.
function longestRunValues(sortedUniqueVals) {
  let best = []
  let current = []
  sortedUniqueVals.forEach((v, i) => {
    current = i > 0 && v === sortedUniqueVals[i - 1] + 1 ? [...current, v] : [v]
    if (current.length > best.length) best = current
  })
  return best
}

function setBonusTier(maxGroupSize, longestRun, noStraight) {
  if (longestRun >= 4 && !noStraight) return 'straight'
  if (maxGroupSize >= 3) return 'three'
  if (maxGroupSize >= 2) return 'pair'
  return null
}

// Fusions for Heart of the Forge (M3): doubles, triples and Aether; the element fusions are doubles.
const FUSION_TIERS = [TIERS.DOUBLE, TIERS.TRIPLE, TIERS.QUADRA]
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
  // The Ley Line relic, or a Continuum in the pool (K4), joins the ends.
  const ring = fx.wrapAdjacency || perDie.some((d) => hasFlag(d.actingAs, FLAGS.CONTINUUM))
  if (ring && n > 2) links.push([n - 1, 0])
  // Space (H3): its two neighbors and the two end dice all touch each other.
  const linked = (a, b) => links.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
  // Reach (K1) also reacts with the dice two places away.
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.REACH)) return
    for (const j of [i - 2, i + 2]) if (j >= 0 && j < n && !linked(i, j)) links.push([Math.min(i, j), Math.max(i, j)])
  })
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.SPACE)) return
    const group = [...new Set([i - 1, i + 1, 0, n - 1])].filter((j) => j >= 0 && j < n && j !== i).sort((a, b) => a - b)
    group.forEach((a, k) => group.slice(k + 1).forEach((b) => !linked(a, b) && links.push([a, b])))
  })
  return links
}

const isFusion = (id) => [TIERS.DOUBLE, TIERS.TRIPLE].includes(ELEMENTS[id]?.tier)

// Secret pairs name exact dice, or '*fusion' (any double or triple fusion),
// '*mythic' (any Mythic die) or '@fire' (any die of that element family,
// v0.7: the Mythic reactions).
function secretPairMatches([x, y], a, b) {
  const match = (want, got) =>
    want === '*fusion'
      ? isFusion(got)
      : want === '*mythic'
        ? ELEMENTS[got]?.tier === TIERS.MYTHIC
        : want.startsWith('@')
          ? reactionElementsOf(got).includes(want.slice(1))
          : want === got
  return (match(x, a) && match(y, b)) || (match(x, b) && match(y, a))
}

function findReactions(perDie, fx, extraMult = 0, constellations = null) {
  const found = []
  // A Rune of Kinship (J3): for reactions, the die is its left neighbor.
  // Since K3b it works only when the die shows the rune's number.
  const reactAs = perDie.map((d, i) => (hasActiveRune(d, 'kinship') && i > 0 ? perDie[i - 1].actingAs : d.actingAs))
  for (const [i, j, factor = 1] of adjacencyLinks(perDie, fx)) {
    const a = perDie[i]
    const b = perDie[j]
    // The Void and a die the Darkness swallowed score 0 but are still there:
    // only the Mythic reactions (v0.7) may use them.
    const live = (x) => x.contribution > 0 || x.reactsAtZero || x.swallowed || x.darkened || hasFlag(x.actingAs, FLAGS.VOID)
    if (!(live(a) && live(b))) continue
    const strict = (a.contribution > 0 || a.reactsAtZero) && (b.contribution > 0 || b.reactsAtZero)
    const ra = reactAs[i]
    const rb = reactAs[j]
    const ea = reactionElementsOf(ra)
    const eb = reactionElementsOf(rb)
    const ids = new Set()
    // Mythic dice have no element: only the secret reactions that name them
    // can fire (v0.7).
    if (ea.length === 0 || eb.length === 0) {
      for (const r of REACTIONS) if (r.secret && r.pair && secretPairMatches(r.pair, ra, rb)) ids.add(r.id)
    } else {
    if (ra === rb) ids.add('resonance')
    for (const r of REACTIONS) {
      // The Firmament's reactions (L5) are secret but name plain elements.
      if (r.secret && r.pair) {
        if (secretPairMatches(r.pair, ra, rb)) ids.add(r.id)
        continue
      }
      if (!r.elements) continue
      const [x, y] = r.elements
      if ((ea.includes(x) && eb.includes(y)) || (ea.includes(y) && eb.includes(x))) ids.add(r.id)
    }
    }
    for (const id of ids) {
      const r = reactionById(id)
      if (!strict && !r.mythic) continue
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
      // A Constellation's levels (J1) add on top, base reactions only.
      const lv = r.secret || r.mythic ? { level: 0, base: 0, mult: 0, factor: 1 } : levelBonus(constellations, id)
      // A milestone (M4) doubles or triples the reaction's Mult, or its Base when it has no Mult.
      const hasMult = r.mult > 0
      const mult = hasMult ? (r.mult + (fx.reactionMultBonus || 0) + extraMult + lv.mult) * lv.factor : 0
      found.push({
        id,
        a: i,
        b: j,
        base: (base + (fx.reactionBaseBonus || 0) + lv.base) * (hasMult ? 1 : lv.factor) * factor,
        mult: mult * factor,
        secret: Boolean(r.secret),
        level: lv.level,
      })
    }
  }
  return found
}

// A die scores 0 this roll: a fizzling die on a 1, or a Shadow Twin on its
// low faces (B3). Blessing of Ember-ward cancels every fizzle for a round.
function fizzles(d, ctx, fx = {}) {
  if (ctx.noFizzle) return false
  // A Rune of Anchor (K3b): this die can't fizzle on the rune's number. A
  // Glimmer or a Shadow beside it (K1, K4) keeps it from fizzling too.
  if (hasActiveRune(d, 'anchor') || d.steadied) return false
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
  // is a Masquerade or Chameleon borrowing from its left neighbor, or a
  // Chaos die wearing its form).
  const acting = actingElementIds(dice)
  // Light (H3): no face below Light's, and nothing fizzles. A lifted die
  // keeps its explosions on top. The Dawn (H2) still reads the rolled face.
  const floor = lightFloor(dice)
  // Alba (K4) lifts every die to 2 at least, and Weights (K6) its own die.
  const alba = acting.some((id) => hasFlag(id, FLAGS.ALBA)) ? 2 : 0
  const perDie = dice.map((d, i) => {
    const dieFloor = Math.max(floor, alba, d.weights ? 2 : 0)
    const lift = dieFloor > d.value ? dieFloor - d.value : 0
    return { ...d, actingAs: acting[i], rolledFace: d.value, value: d.value + lift, total: d.total + lift }
  })
  if (floor > 0) ctx = { ...ctx, noFizzle: true }
  const n = perDie.length
  // A Glimmer keeps both neighbors from fizzling (K1); a Shadow its right one (K4).
  perDie.forEach((d, i) => {
    if (hasFlag(d.actingAs, FLAGS.GLIMMER)) [i - 1, i + 1].forEach((j) => perDie[j] && (perDie[j].steadied = true))
    if (hasFlag(d.actingAs, FLAGS.SHADOW) && perDie[i + 1]) perDie[i + 1].steadied = true
  })

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
  // The dice that make the set, for the cast choreography (display only).
  let setDiceIds = []

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
      setDiceIds = [...winningValues]
    } else if (baseTier === 'straight') {
      const run = new Set(longestRunValues(uniqueVals))
      setDiceIds = perDie.filter((d) => !wildcardIds.includes(d.id) && run.has(d.value)).map((d) => d.id)
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
    // Void scores nothing (H3); the Dawn's overexposure zeroes a max face and
    // the Umbra keeps a swallowed die out (H2).
    const empty = hasFlag(d.actingAs, FLAGS.VOID)
    const overexposed = fx.maxFaceZero && d.rolledFace === d.sides
    // The Satellite scores nothing itself, and the Quasar's face goes to
    // Mult instead of Base (I1).
    const celestialOut = hasFlag(d.actingAs, FLAGS.SATELLITE) || hasFlag(d.actingAs, FLAGS.QUASAR)
    // Null, Singularity and the Dead Star score nothing either (K1, K4).
    const cosmicOut = [FLAGS.NIL, FLAGS.SINGULARITY, FLAGS.DEAD_STAR].some((f) => hasFlag(d.actingAs, f))
    const out = midas || bullion || empty || overexposed || d.swallowed || celestialOut || cosmicOut
    // Null and Singularity score nothing by design, but they still react (L5):
    // seven of the new reactions name the Void.
    d.reactsAtZero = cosmicOut && !d.swallowed
    // A Comet that exploded scores its whole total twice (I1).
    const cometFactor = hasFlag(d.actingAs, FLAGS.COMET) && (d.explosions || 0) > 0 ? 2 : 1
    let contribution = fizzled || zeroTargets.has(i) || banned || out ? 0 : d.total * cometFactor
    // Entropy (H5): its face + 104.
    if (contribution > 0 && hasFlag(d.actingAs, FLAGS.ENTROPY)) contribution += 104

    if (contribution > 0) {
      if (fx.highFaceHalf && d.value > 4) contribution /= 2
      if (d.elementId === 'earth' && fx.earthPipMultiplier) contribution *= fx.earthPipMultiplier
      if (hasFlag(d.actingAs, FLAGS.DOUBLE_ON_SET) && winningValues.has(d.id)) contribution *= 2
      // A Rune of Glass (K3b): on its number the score is doubled (it may
      // shatter after).
      if (hasActiveRune(d, 'glass')) {
        contribution *= 2
        noteBoost(d, { rune: 'glass', from: i, factor: 2 })
      }
      if (hasFlag(d.elementId, FLAGS.GROWS)) contribution += d.growth || 0
      if (inFamily(d.elementId, 'earth')) contribution += d.patience || 0
      // Heat: every explosion this round warms the whole Fire family.
      if (fx.fireFamilyBonusPerExplosion && inFamily(d.elementId, 'fire')) {
        contribution += fx.fireFamilyBonusPerExplosion * (ctx.explosionsThisRound || 0)
      }
      contribution += d.bonus || 0
      // Pulsar: +1 for every reroll made this round, up to +10 (I1).
      if (hasFlag(d.actingAs, FLAGS.PULSAR)) contribution += Math.min(PULSAR_CAP, ctx.rerollsMade || 0)
      // A Satellite on either side lifts the face by 1 (I1).
      const satellites = [i - 1, i + 1].filter((j) => perDie[j] && hasFlag(perDie[j].actingAs, FLAGS.SATELLITE))
      contribution += satellites.length
      satellites.forEach((j) => noteBoost(d, { id: 'satellite', from: j, add: 1 }))
      // A Shadow on its left counts this die +1 (K4).
      if (perDie[i - 1] && hasFlag(perDie[i - 1].actingAs, FLAGS.SHADOW)) {
        contribution += 1
        noteBoost(d, { id: 'shadow', from: i - 1, add: 1 })
      }
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
    if (i < n - 1 && hasFlag(d.elementId, FLAGS.MIMIC_SPLIT)) {
      d.contribution = ownScores[i + 1]
      d.boosts = []
      noteBoost(d, { id: d.elementId, from: i + 1, copy: true })
    }
  })
  perDie.forEach((d, i) => {
    const copiesLeft = hasFlag(d.elementId, FLAGS.MIRROR_LEFT) || hasFlag(d.elementId, FLAGS.MIMIC_LEFT)
    if (i > 0 && copiesLeft) {
      d.contribution = perDie[i - 1].contribution
      d.boosts = []
      noteBoost(d, { id: d.elementId, from: i - 1, copy: true })
    }
  })
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.BEACON)) return
    for (const j of [i - 1, i + 1]) {
      if (!perDie[j]) continue
      perDie[j].contribution *= 1.5
      // Only a die that actually scores shows the boost.
      if (perDie[j].contribution > 0) noteBoost(perDie[j], { id: d.elementId, from: i, factor: 1.5 })
    }
  })
  // A Singularity doubles both neighbors' Base (K4).
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.SINGULARITY)) return
    for (const j of [i - 1, i + 1]) {
      if (!perDie[j] || !(perDie[j].contribution > 0)) continue
      perDie[j].contribution *= 2
      noteBoost(perDie[j], { id: 'singularity', from: i, factor: 2 })
    }
  })
  // A Rune of Echo (K3b): on its number the die scores twice, after Beacon.
  perDie.forEach((d, i) => {
    if (!hasActiveRune(d, 'echo') || !(d.contribution > 0)) return
    d.contribution *= 2
    noteBoost(d, { rune: 'echo', from: i, factor: 2 })
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
  // Darkness (H3): the dice on either side score half (DARKNESS_KEEP), and
  // what they scored goes to Mult (divided by DARKNESS_DIVISOR, 1 for now).
  const darkLines = []
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.DARKNESS)) return
    let eaten = 0
    for (const j of [i - 1, i + 1]) {
      if (!perDie[j]) continue
      eaten += perDie[j].contribution
      perDie[j].contribution *= DARKNESS_KEEP
      perDie[j].darkened = true
    }
    if (eaten > 0) darkLines.push({ kind: 'mythic', id: 'darkness', value: eaten / DARKNESS_DIVISOR, dice: [i] })
  })
  // The Firmament's eaters (K1, K4). Each takes a neighbor's score (Gloom
  // the right one, half of it; Shadow the left one, all of it; Abyss both,
  // for nothing), and Oblivion swallows your lowest other die for twice its
  // face. Like Darkness, what they take goes to Mult as a line of their own.
  const eat = (j) => {
    if (!perDie[j]) return 0
    const v = perDie[j].contribution
    perDie[j].contribution = 0
    perDie[j].darkened = true
    return v
  }
  perDie.forEach((d, i) => {
    if (hasFlag(d.actingAs, FLAGS.GLOOM)) {
      const v = eat(i + 1)
      if (v > 0) darkLines.push({ kind: 'mythic', id: 'gloom', value: v / 2, dice: [i] })
    }
    if (hasFlag(d.actingAs, FLAGS.SHADOW)) {
      const v = eat(i - 1)
      if (v > 0) darkLines.push({ kind: 'mythic', id: 'shadow', value: v, dice: [i] })
    }
    if (hasFlag(d.actingAs, FLAGS.ABYSS)) [i - 1, i + 1].forEach(eat)
    if (hasFlag(d.actingAs, FLAGS.OBLIVION)) {
      let low = -1
      perDie.forEach((o, j) => {
        if (j !== i && !o.swallowed && (low < 0 || o.value < perDie[low].value)) low = j
      })
      if (low >= 0) {
        const face = perDie[low].value
        eat(low)
        darkLines.push({ kind: 'mythic', id: 'oblivion', value: face * 2, dice: [i, low] })
      }
    }
  })
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

  const reactions = findReactions(perDie, fx, ctx.reactionMultBonus || 0, ctx.constellations)
  // Echo Chamber (M3): the best reaction of the cast (by Mult) triggers twice.
  if (fx.echoChamber && reactions.length) {
    const best = reactions.reduce((b, r) => (r.mult > b.mult ? r : b), reactions[0])
    if (best.mult > 0 || best.base > 0) reactions.push({ ...best, echoed: true })
  }
  reactions.forEach((r) => {
    if (r.base > 0) {
      baseValue += r.base
      baseLines.push({ kind: 'reaction', id: r.id, value: r.base, op: 'add', dice: [r.a, r.b], level: r.level })
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
  // The Fire Totem (L4) makes every explosion worth a little more.
  const fireLevel = totemLevel(ctx.totems, 'fire')
  addMult({ kind: 'explosions', value: (0.5 + FIRE_TOTEM_MULT * fireLevel) * explodeCount, count: explodeCount, level: fireLevel })
  if (setTier) {
    const relicBonus = fx.setBonusMultBonus?.[setTier] || 0
    const lv = levelBonus(ctx.constellations, setTier)
    let tierMult = (BASE_TIER_MULT[setTier] + relicBonus + lv.mult) * lv.factor
    if (fx.waterFamilySetBonusDouble && setIsAllWaterFamily) tierMult *= 2
    if (setTier === 'pair' && fx.pairMultBonus) tierMult += fx.pairMultBonus
    addMult({ kind: 'set', tier: setTier, value: tierMult, level: lv.level })
  }
  reactions.forEach((r) => {
    if (r.mult > 0) addMult({ kind: 'reaction', id: r.id, value: r.mult, dice: [r.a, r.b], level: r.level })
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
  // Pantheon: Mult for every god die held, scoring or not.
  if (fx.godMult) {
    const gods = perDie.filter((d) => ELEMENTS[d.elementId]?.tier === TIERS.GOD).length
    addMult({ kind: 'relic', id: sourceOf(relics, 'godMult'), value: fx.godMult * gods })
  }
  if (fx.multPerUnusedReroll && ctx.rerollsLeft > 0) {
    addMult({ kind: 'relic', id: sourceOf(relics, 'multPerUnusedReroll'), value: fx.multPerUnusedReroll * ctx.rerollsLeft })
  }
  // Water's family ability, Tide (L1): a locked Water-family die sends part of
  // its final score to Mult too (half, more with the Water Totem). Held dice
  // that were not locked do not count.
  const waterLevel = totemLevel(ctx.totems, 'water')
  perDie.forEach((d, i) => {
    if (!d.locked || !(d.contribution > 0) || !inFamily(d.actingAs, 'water')) return
    addMult({ kind: 'family', id: 'tide', value: Math.round(d.contribution * tideShare(waterLevel) * 100) / 100, dice: [i], level: waterLevel })
  })
  // Deep Current and Spring Tide (L3): locks pay Mult.
  if (fx.firstLockMult && ctx.lockedThisRound) addMult({ kind: 'relic', id: sourceOf(relics, 'firstLockMult'), value: fx.firstLockMult })
  if (fx.lockedWaterMult) {
    const lockedWater = perDie.flatMap((d, i) => (d.locked && inFamily(d.actingAs, 'water') ? [i] : []))
    if (lockedWater.length) addMult({ kind: 'relic', id: sourceOf(relics, 'lockedWaterMult'), value: fx.lockedWaterMult * lockedWater.length, dice: lockedWater })
  }
  // Gale Seal (L3): a die Drift just moved also sends its whole score to Mult.
  if (fx.driftScoreToMult) {
    perDie.forEach((d, i) => {
      if (d.drifted && d.contribution > 0) addMult({ kind: 'relic', id: sourceOf(relics, 'driftScoreToMult'), value: d.contribution, dice: [i] })
    })
  }
  // The Firmament's dice (H3, H5): Darkness, Void's empty slots, Entropy.
  darkLines.forEach((line) => addMult({ ...line, value: Math.round(line.value * 100) / 100 }))
  perDie.forEach((d, i) => {
    if (hasFlag(d.actingAs, FLAGS.VOID) && !d.swallowed) addMult({ kind: 'mythic', id: 'void', value: ctx.emptySlots || 0, dice: [i] })
    if (hasFlag(d.actingAs, FLAGS.ENTROPY) && d.contribution > 0) addMult({ kind: 'mythic', id: 'entropy', value: 10, dice: [i] })
    // Null and Abyss feed on empty dice slots, the Dead Star on the rest of
    // the pool (K1, K4).
    if (hasFlag(d.actingAs, FLAGS.NIL) && !d.swallowed) addMult({ kind: 'mythic', id: 'nil', value: 0.5 * (ctx.emptyDiceSlots || 0), dice: [i] })
    if (hasFlag(d.actingAs, FLAGS.ABYSS) && !d.swallowed) addMult({ kind: 'mythic', id: 'abyss', value: 2 * (ctx.emptyDiceSlots || 0), dice: [i] })
    if (hasFlag(d.actingAs, FLAGS.DEAD_STAR) && !d.swallowed) addMult({ kind: 'mythic', id: 'dead_star', value: 0.5 * (n - 1), dice: [i] })
    // Quasar (I1): its face, flat, into Mult.
    if (hasFlag(d.actingAs, FLAGS.QUASAR) && !d.swallowed && !zeroTargets.has(i) && !(fx.bannedElementId && d.elementId === fx.bannedElementId)) addMult({ kind: 'celestial', id: 'quasar', value: d.total, dice: [i] })
  })
  // Severed Grace (B3): +1 Mult for the rest of the run.
  if (ctx.permanentMult) addMult({ kind: 'boon', id: 'severed_grace', value: ctx.permanentMult })
  // The Metronome and the Cuckoo Clock (I2).
  ;(ctx.bonusMult || []).forEach((line) => addMult({ ...line }))
  // The multiplying relics (M3): each is one ledger line.
  const multMult = (id, key, value) => {
    if (!(value > 1)) return
    multiplier *= value
    multLines.push({ kind: 'relic', id: sourceOf(relics, key) ?? id, value: Math.round(value * 1000) / 1000, op: 'mul' })
  }
  if (fx.roundMultMult) multMult('crown_of_ages', 'roundMultMult', 1 + (ctx.round || 0) / 20)
  if (fx.fusionMultMult) multMult('heart_of_the_forge', 'fusionMultMult', Math.pow(fx.fusionMultMult, perDie.filter((d) => FUSION_TIERS.includes(ELEMENTS[d.elementId]?.tier)).length))
  if (fx.constellationMult) multMult('starmap', 'constellationMult', 1 + fx.constellationMult * Object.values(ctx.constellations || {}).reduce((a, b) => a + Math.min(b || 0, 10), 0))
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
    setDiceIds,
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
// The target curve (Carlos, 2026-10-04, after Claude's balance simulation):
// the start was too easy and everything past round 15 outgrew the builds.
// Rounds 1 to 10 start 75% higher but grow slower (x1.37) so round 10 lands
// where it always did; rounds 11 to 15 keep the old x1.45; past round 15 the
// growth eases to x1.40 (the Firmament). Difficulty multipliers apply last.
export const EARLY_BASE_FACTOR = 1.75
export const EARLY_GROWTH = 1.37
export const LATE_GROWTH = 1.4
export function thresholdForRound(round, difficulty) {
  const tenth = difficulty.thresholdBase * EARLY_BASE_FACTOR * Math.pow(EARLY_GROWTH, 9)
  let base
  if (round <= 10) base = difficulty.thresholdBase * EARLY_BASE_FACTOR * Math.pow(EARLY_GROWTH, round - 1)
  else {
    const fifteenth = tenth * Math.pow(difficulty.thresholdGrowth, 5)
    base = round <= 15 ? tenth * Math.pow(difficulty.thresholdGrowth, round - 10) : fifteenth * Math.pow(LATE_GROWTH, round - 15)
  }
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
