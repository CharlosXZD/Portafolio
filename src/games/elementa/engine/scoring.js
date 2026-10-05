import { ELEMENTS, FLAGS, TIERS, reactionElementsOf, inFamily, actingElementIds, chargedOf, isTempDie, PURE_ELEMENT_IDS, COSMIC_BASE_IDS } from '../data/elements.js'
import { tierById } from '../data/diceTiers.js'
import { REACTIONS, reactionById } from '../data/reactions.js'
import { random } from './rng.js'
import { godPowers, rollContext } from './gods.js'
import { levelBonus } from '../data/constellations.js'
import { hasActiveRune } from '../data/runes.js'
import { isPokerId, JOKER_FACE, bestHand, pokerFaces } from '../data/poker.js'
import { isSigilId, isGreaterSigil } from '../data/sigils.js'
import { REALM3_GROWTH } from '../data/realm3.js'
import { LIMIT_MULT_CAP } from '../data/abstract.js'
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
export const PULSAR_CAP = 100
export const PULSAR_STEP = 10
// Black Hole dice (N5): what every die between a pair gets.
export const BLACK_HOLE_BONUS = 50
// The symbols (EXPANSION.md P2), normal / Greater.
export const SIGIL = {
  sunFactor: [1.5, 2],
  scaleFloor: [1, 1.5],
  keyRerolls: [1, 2],
  eyeMult: [5, 10],
  spiralMult: [2, 4],
  spiralCap: [5, 8],
  mawEats: [1, 2],
  mawFactor: [2, 3],
}
// What Light, Alba and Shadow add to the dice beside them (N2, N3).
export const NEIGHBOR_BONUS = 10
// The sizes Chaos can take (H3).
const CHAOS_SIZES = ['d3', 'd5', 'd6', 'd10', 'd20']
// Every die Chaos can become: everything but the gods, the Primordial die
// and the Mythic dice.
const CHAOS_FORM_IDS = Object.keys(ELEMENTS).filter(
  (id) => ![TIERS.GOD, TIERS.PRIMAL, TIERS.MYTHIC].includes(ELEMENTS[id].tier) && !['black_hole_die', 'time_ghost'].includes(id) && !ELEMENTS[id].sigilSet,
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

function isPrime(n) {
  if (n < 2) return false
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false
  return true
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

const isStarFlag = (elementId) => hasFlag(elementId, FLAGS.SHOOTING_STAR) || hasFlag(elementId, FLAGS.NEUTRON_STAR)

/**
 * The stars (N5): a Shooting Star explodes whenever another die does, and a
 * Neutron Star also when another die shows its face. A star that did not
 * explode on its own is made to, once (it rolls again and adds, chaining
 * from its three highest faces). Held and locked dice stay as they are.
 */
export function starChain(dice) {
  const acting = actingElementIds(dice)
  let out = dice
  for (let pass = 0; pass < dice.length; pass++) {
    let changed = false
    out = out.map((d, i) => {
      if (!isStarFlag(acting[i]) || (d.explosions || 0) > 0 || d.held || d.locked || d.temp) return d
      const others = out.filter((o, j) => j !== i && !o.temp)
      const triggered = others.some((o) => (o.explosions || 0) > 0) || (hasFlag(acting[i], FLAGS.NEUTRON_STAR) && others.some((o) => o.value === d.value))
      if (!triggered) return d
      changed = true
      const from = Math.max(1, d.sides - 2)
      const chain = [...(d.chain || [d.value])]
      let total = d.total
      let explosions = 0
      let value = d.value
      do {
        value = rollFace(d.sides)
        chain.push(value)
        total += value
        explosions += 1
      } while (value >= from && explosions < DEFAULT_EXPLODE_CAP)
      return { ...d, total, explosions, chain, rollId: random() }
    })
    if (!changed) break
  }
  return out
}

export function rollDie(elementId, sides, relics = [], ctx = {}) {
  // Sigil dice (P1, P2): a symbol, no number. A Spiral rolls again for free,
  // up to the cap, and every Spiral in the chain adds Mult at the cast.
  if (ctx.sigilFaces) {
    const cap = SIGIL.spiralCap[ctx.sigilGreater ? 1 : 0]
    let spirals = 0
    let symbol = ctx.sigilFaces[randInt(ctx.sigilFaces.length) - 1]
    const trail = [symbol]
    while (symbol === 'spiral' && spirals < cap) {
      spirals += 1
      symbol = ctx.sigilFaces[randInt(ctx.sigilFaces.length) - 1]
      trail.push(symbol)
    }
    return { value: 0, total: 0, explosions: 0, chain: [0], symbol, spirals, trail, rollId: random() }
  }
  // Poker dice (O3): one of the faces 9 to Ace (the Joker's seventh is wild).
  if (ctx.pokerFaces) {
    const value = ctx.pokerFaces[randInt(ctx.pokerFaces.length) - 1]
    return { value, total: value, explosions: 0, chain: [value], rollId: random() }
  }
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
  if (hasFlag(elementId, FLAGS.EXPLODE) || hasFlag(elementId, FLAGS.COMET) || isStarFlag(elementId) || ctx.runeExplode) {
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
// How much a reaction is worth when Chaos picks its form (N2): Mult counts
// five times a point of Base; a face-based Base reads as a typical 4.
const reactionRating = (r) => (r.mult || 0) * 5 + (typeof r.base === 'number' ? r.base : r.base ? 4 : 0)

/**
 * The pure element that makes the best reaction with a neighbor (N2): every
 * pure element is rated against the elements on each side, and one of the
 * best is drawn with the seeded RNG.
 */
export function bestReactingElement(dice, index) {
  const neighbors = [dice[index - 1], dice[index + 1]].filter((x) => x && !isTempDie(x))
  const elementsOf = (x) => reactionElementsOf(x.chaosForm?.elementId ?? x.elementId)
  let best = -1
  let picks = []
  for (const e of FLUX_FORM_IDS) {
    let rating = 0
    for (const nb of neighbors) {
      const eb = elementsOf(nb)
      for (const r of REACTIONS) {
        if (!r.elements) continue
        const [x, y] = r.elements
        if ((e === x && eb.includes(y)) || (e === y && eb.includes(x))) rating = Math.max(rating, reactionRating(r))
      }
      if (eb.includes(e)) rating = Math.max(rating, 2) // Resonance
    }
    if (rating > best) { best = rating; picks = [e] } else if (rating === best) picks.push(e)
  }
  return picks[Math.floor(random() * picks.length)]
}

export function shiftChaos(dice) {
  return dice.map((d, i) => {
    // Chaos (the base element, N2) takes the pure element that makes the best
    // reaction with a neighbor, keeping its own size. The Oblivion reacts as
    // that element too, but keeps its own abilities (`reactForm`).
    if (d.elementId === 'flux' && !d.held && !d.locked) {
      return { ...d, chaosForm: { elementId: bestReactingElement(dice, i), tierId: d.tierId } }
    }
    if (d.elementId === 'oblivion' && !d.held && !d.locked) return { ...d, reactForm: bestReactingElement(dice, i) }
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
    if (die.temp) continue
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

  return starChain(next)
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
  // A Non-Euclidean die (N5): every die reacts with every other, but a die
  // takes part in at most as many reactions as it has sides. Pairs are taken
  // left to right, so the result is the same every time.
  if (perDie.some((d) => hasFlag(d.actingAs, FLAGS.NON_EUCLID))) {
    const used = perDie.map(() => 0)
    const bridge = (k) => hasFlag(perDie[k].actingAs, FLAGS.NON_EUCLID)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // The Non-Euclidean die is the bridge itself: it does not use up a die's reactions.
        if (bridge(i) || bridge(j)) {
          links.push([i, j])
          continue
        }
        if (used[i] >= perDie[i].sides || used[j] >= perDie[j].sides) continue
        links.push([i, j])
        used[i] += 1
        used[j] += 1
      }
    }
    return links
  }
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
  // Space, the base element (K1, N2), also reacts with the dice two and three
  // places away, and bridges its two neighbors; so does the Continuum (N3).
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.REACH) && !hasFlag(d.actingAs, FLAGS.CONTINUUM)) return
    for (const j of [i - 3, i - 2, i + 2, i + 3]) if (j >= 0 && j < n && !linked(i, j)) links.push([Math.min(i, j), Math.max(i, j)])
    if (hasFlag(d.actingAs, FLAGS.REACH) && i > 0 && i < n - 1 && !linked(i - 1, i + 1)) links.push([i - 1, i + 1])
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

// The element that makes the best reaction with the given elements (Rune of
// Link, O1): the same rating Chaos uses, ties going to the first in this order.
const LINK_CANDIDATES = [...PURE_ELEMENT_IDS, ...COSMIC_BASE_IDS]
function bestElementFor(elements, candidates = LINK_CANDIDATES) {
  let best = null
  let bestRating = 0
  for (const e of candidates) {
    let rating = 0
    for (const r of REACTIONS) {
      if (!r.elements) continue
      const [x, y] = r.elements
      if ((e === x && elements.includes(y)) || (e === y && elements.includes(x))) rating = Math.max(rating, reactionRating(r))
    }
    if (rating > bestRating) {
      best = e
      bestRating = rating
    }
  }
  return best
}

function findReactions(perDie, fx, extraMult = 0, constellations = null, firmament = false) {
  // Link can only become an element the run has met (the Firmament's six come with the door).
  const candidates = firmament ? LINK_CANDIDATES : PURE_ELEMENT_IDS
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
    let ea = [...reactionElementsOf(ra), ...(a.reactForm ? [a.reactForm] : [])]
    let eb = [...reactionElementsOf(rb), ...(b.reactForm ? [b.reactForm] : [])]
    // A Rune of Link (O1): on its number the die reacts with each neighbor as
    // the element that makes the best reaction with that neighbor.
    const linkA = hasActiveRune(a, 'link') ? bestElementFor(eb, candidates) : null
    const linkB = hasActiveRune(b, 'link') ? bestElementFor(ea, candidates) : null
    if (linkA) ea = [linkA]
    if (linkB) eb = [linkB]
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
      // Chaos and the Oblivion (N2, N3): every reaction they take part in gets +1 Mult.
      const chaotic = [a, b].some((x) => ['flux', 'oblivion'].includes(x.elementId))
      const mult = (hasMult ? (r.mult + (fx.reactionMultBonus || 0) + extraMult + lv.mult) * lv.factor : 0) + (chaotic ? 1 : 0)
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
  // Zero, the Rewriter (R2): every face below 3 counts as 0 and fizzles.
  if (fx.zeroBelow && d.value < fx.zeroBelow) return true
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
  // The Event Horizon's Black Hole dice and the Time die's ghost (N2, N5) sit
  // in the row but are not part of the pool the rules see.
  if (dice.some(isTempDie)) return evaluateWithTemps(dice, relics, ctx)
  return evaluateCore(dice, relics, ctx)
}

/**
 * Scores a row that holds temporary dice. The rules run on the real dice; the
 * temporary ones add what they carry (the ghost its Base, a Black Hole pair
 * +50 to every die between them), and the result is laid back over the whole
 * row so its indices match the dice on the table.
 */
function evaluateWithTemps(row, relics, ctx) {
  const real = row.filter((d) => !isTempDie(d))
  const holes = row.flatMap((d, i) => (d.temp === 'hole' ? [i] : []))
  const dieBonus = {}
  if (holes.length >= 2) {
    const lo = Math.min(...holes)
    const hi = Math.max(...holes)
    row.forEach((d, i) => {
      if (i > lo && i < hi && !isTempDie(d)) dieBonus[d.id] = (dieBonus[d.id] || 0) + BLACK_HOLE_BONUS
    })
  }
  const ghostBase = row.filter((d) => d.temp === 'ghost').reduce((sum, d) => sum + (d.ghostBase || 0), 0)
  const res = evaluateCore(real, relics, { ...ctx, dieBonus, ghostBase })
  const fullIndex = []
  row.forEach((d, i) => !isTempDie(d) && fullIndex.push(i))
  const at = (i) => fullIndex[i]
  const remapLine = (l) => (l.dice ? { ...l, dice: l.dice.map(at) } : l)
  let r = 0
  const dice = row.map((d) => {
    if (!isTempDie(d)) {
      const x = res.dice[r++]
      return { ...x, boosts: x.boosts?.map((b) => (b.from == null ? b : { ...b, from: at(b.from) })) }
    }
    return { ...d, contribution: d.temp === 'ghost' ? d.ghostBase || 0 : 0, boosts: [] }
  })
  return {
    ...res,
    dice,
    baseLines: res.baseLines.map(remapLine),
    multLines: res.multLines.map(remapLine),
    reactions: res.reactions.map((x) => ({ ...x, a: at(x.a), b: at(x.b) })),
  }
}

function evaluateCore(dice, relics = [], ctx = {}) {
  let fx = relicEffects(relics)
  // `actingAs`: the element whose abilities a die uses (itself, unless it
  // is a Masquerade or Chameleon borrowing from its left neighbor, or a
  // Chaos die wearing its form).
  const acting = actingElementIds(dice)
  // The boss twist is every effect that is not a relic. Nun (R3) makes every
  // die ignore it; Zero and Bit (R3) do so for the dice beside them.
  const isRelic = (r) => r.kind === 'relic'
  if (acting.some((id) => hasFlag(id, FLAGS.NUN))) {
    relics = relics.filter(isRelic)
    fx = relicEffects(relics)
  }
  const fxClean = relicEffects(relics.filter(isRelic))
  // Light (H3): no face below Light's, and nothing fizzles. A lifted die
  // keeps its explosions on top. The Dawn (H2) still reads the rolled face.
  const floor = lightFloor(dice)
  // Alba (K4, N3) lifts every die to a quarter of its own size (at least 2),
  // and Weights (K6) its own die.
  const hasAlba = acting.some((id) => hasFlag(id, FLAGS.ALBA))
  const perDie = dice.map((d, i) => {
    const dieFloor = Math.max(floor, hasAlba ? Math.max(2, Math.ceil(d.sides / 4)) : 0, d.weights ? 2 : 0)
    const lift = dieFloor > d.value ? dieFloor - d.value : 0
    let value = d.value + lift
    let total = d.total + lift
    // Negation beside it, or a Janus anywhere (R3): the better of the face and its opposite.
    const negated = acting.some((id) => hasFlag(id, FLAGS.JANUS)) || hasFlag(acting[i - 1], FLAGS.ABS_NEGATION) || hasFlag(acting[i + 1], FLAGS.ABS_NEGATION)
    if (negated && !isSigilId(d.elementId) && !isPokerId(d.elementId) && d.sides > 1) {
      const opposite = d.sides + 1 - value
      if (opposite > value) {
        total += opposite - value
        value = opposite
      }
    }
    return { ...d, actingAs: acting[i], rolledFace: d.value, value, total }
  })
  if (floor > 0) ctx = { ...ctx, noFizzle: true }
  const n = perDie.length
  // A Glimmer keeps both neighbors from fizzling (K1); a Shadow its right one (K4).
  perDie.forEach((d, i) => {
    if (hasFlag(d.actingAs, FLAGS.GLIMMER)) [i - 1, i + 1].forEach((j) => perDie[j] && (perDie[j].steadied = true))
    if (hasFlag(d.actingAs, FLAGS.SHADOW) && perDie[i + 1]) perDie[i + 1].steadied = true
  })

  const explodeCount = perDie.reduce((sum, d) => sum + (d.explosions || 0), 0)

  // Sigil dice (P1, P2): the symbol each die reads at the cast. A Masquerade
  // or Chameleon beside a sigil die copies its cast-time effect (Default).
  const sigil = []
  perDie.forEach((d, i) => {
    if (isSigilId(d.elementId)) sigil[i] = { symbol: d.symbol, greater: isGreaterSigil(d.elementId), spirals: d.spirals || 0 }
    else if (i > 0 && sigil[i - 1] && (hasFlag(d.elementId, FLAGS.MIMIC_LEFT) || hasFlag(d.elementId, FLAGS.MIMIC_SPLIT))) sigil[i] = sigil[i - 1]
  })
  const isSigilDie = (i) => Boolean(sigil[i])

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
          powers.some((p) => p.index === i && p.god === 'zephyr') ||
          // A Rune of Wild on its number, or a Joker on its wild face (O1, O3).
          hasActiveRune(d, 'wild') ||
          (d.elementId === 'joker' && d.value === JOKER_FACE) ||
          // One, the Monad and Bit's neighbors count as any face (R3).
          hasFlag(d.actingAs, FLAGS.ABS_ONE) ||
          acting.some((id) => hasFlag(id, FLAGS.MONAD)) ||
          [i - 1, i + 1].some((j) => hasFlag(perDie[j]?.actingAs, FLAGS.BIT)),
      )
      .map((d) => d.id)
    const wildcardCount = wildcardIds.length

    const groups = new Map()
    perDie.forEach((d, i) => {
      // A sigil die has no number, so it joins no set (P1).
      if (wildcardIds.includes(d.id) || isSigilDie(i)) return
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
    // Zero and Bit make their neighbors ignore the boss twist (R3).
    const ignoresTwist = [i - 1, i + 1].some((j) => hasFlag(perDie[j]?.actingAs, FLAGS.ABS_ZERO) || hasFlag(perDie[j]?.actingAs, FLAGS.BIT))
    const f = ignoresTwist ? fxClean : fx
    const fizzled = fizzles(d, ctx, f)
    const banned = f.bannedElementId && d.elementId === f.bannedElementId
    const midas = hasFlag(d.actingAs, FLAGS.MIDAS)
    const bullion = hasFlag(d.actingAs, FLAGS.BULLION)
    if (midas) midasShards += d.total
    if (bullion) bullionDice += 1
    // Void scores nothing (H3); the Dawn's overexposure zeroes a max face and
    // the Umbra keeps a swallowed die out (H2).
    const empty = hasFlag(d.actingAs, FLAGS.VOID)
    const overexposed = f.maxFaceZero && d.rolledFace === d.sides
    // The Satellite scores nothing itself, and the Quasar's face goes to
    // Mult instead of Base (I1).
    const celestialOut = [FLAGS.SATELLITE, FLAGS.QUASAR, FLAGS.HORIZON, FLAGS.BLACK_HOLE_DIE].some((f) => hasFlag(d.actingAs, f))
    // Null, Singularity and the Dead Star score nothing either (K1, K4).
    const cosmicOut = [FLAGS.NIL, FLAGS.SINGULARITY, FLAGS.DEAD_STAR, FLAGS.ABS_ZERO, FLAGS.LIMIT, FLAGS.REVBITS].some((flag) => hasFlag(d.actingAs, flag))
    const out = midas || bullion || empty || overexposed || d.swallowed || celestialOut || cosmicOut || isSigilDie(i)
    // Null and Singularity score nothing by design, but they still react (L5):
    // seven of the new reactions name the Void.
    d.reactsAtZero = cosmicOut && !d.swallowed
    // A Comet that exploded scores its whole total twice (I1).
    const cometFactor = hasFlag(d.actingAs, FLAGS.COMET) && (d.explosions || 0) > 0 ? 2 : 1
    // One scores 1 for every die in the pool, the Rolling Joke its face plus every
    // reroll made this run, the Undivisible the square of a prime face minus one (R4).
    let base = d.total * cometFactor
    if (hasFlag(d.actingAs, FLAGS.ABS_ONE)) base = perDie.length
    if (hasFlag(d.actingAs, FLAGS.ROLLJOKE)) base = d.total + (ctx.rerollsTotal || 0)
    if (hasFlag(d.actingAs, FLAGS.UNDIV) && isPrime(d.value)) base = d.value * d.value - 1
    let contribution = fizzled || zeroTargets.has(i) || banned || out ? 0 : base
    // Parity doubles every even face in the pool, the Monad multiplies every die by the dice count (R3).
    if (contribution > 0 && d.value % 2 === 0 && acting.some((id) => hasFlag(id, FLAGS.PARITY))) {
      contribution *= 2
      noteBoost(d, { id: 'parity', from: acting.findIndex((id) => hasFlag(id, FLAGS.PARITY)), factor: 2 })
    }
    if (contribution > 0 && acting.some((id) => hasFlag(id, FLAGS.MONAD))) {
      contribution *= perDie.length
      noteBoost(d, { id: 'monad', from: acting.findIndex((id) => hasFlag(id, FLAGS.MONAD)), factor: perDie.length })
    }
    // Law of Small Things (O2): a d3 scores x3 and a d5 x2, as if they were d10s.
    if (fx.lawSmall && contribution > 0 && (d.sides === 3 || d.sides === 5)) {
      const factor = d.sides === 3 ? 3 : 2
      contribution *= factor
      noteBoost(d, { law: 'law_small', from: i, factor })
    }
    // Entropy (H5): its face + 104.
    if (contribution > 0 && hasFlag(d.actingAs, FLAGS.ENTROPY)) contribution += 104

    if (contribution > 0) {
      if (f.highFaceHalf && d.value > 4) contribution /= 2
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
      if (hasFlag(d.actingAs, FLAGS.PULSAR)) contribution += Math.min(PULSAR_CAP, PULSAR_STEP * (ctx.rerollsMade || 0))
      // A Satellite on either side lifts the face by 15% of this die's size (I1, N4).
      const satellites = [i - 1, i + 1].filter((j) => perDie[j] && hasFlag(perDie[j].actingAs, FLAGS.SATELLITE))
      const lift = Math.max(1, Math.ceil(d.sides * 0.15))
      contribution += satellites.length * lift
      satellites.forEach((j) => noteBoost(d, { id: 'satellite', from: j, add: lift }))
      // Light and Alba count both neighbors +10, a Shadow its right one (N2, N3).
      ;[i - 1, i + 1].forEach((j) => {
        if (!perDie[j] || !(hasFlag(perDie[j].actingAs, FLAGS.GLIMMER) || hasFlag(perDie[j].actingAs, FLAGS.ALBA))) return
        contribution += NEIGHBOR_BONUS
        noteBoost(d, { id: perDie[j].elementId, from: j, add: NEIGHBOR_BONUS })
      })
      if (perDie[i - 1] && hasFlag(perDie[i - 1].actingAs, FLAGS.SHADOW)) {
        contribution += NEIGHBOR_BONUS
        noteBoost(d, { id: 'shadow', from: i - 1, add: NEIGHBOR_BONUS })
      }
      // Black Hole dice (N5): every die between a pair gets +50.
      if (ctx.dieBonus?.[d.id]) {
        contribution += ctx.dieBonus[d.id]
        noteBoost(d, { id: 'black_hole_die', from: i, add: ctx.dieBonus[d.id], hole: true })
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
      const gaeaCurse = (f.earthCurse || (gaeaDrawback && !gaeaHere)) && inFamily(d.elementId, 'earth')
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
  // Quantum Entanglement (N5): the score of the die it picked this roll.
  perDie.forEach((d, i) => {
    if (!hasFlag(d.elementId, FLAGS.ENTANGLE)) return
    const target = perDie.findIndex((x) => x.id === d.entangledWith && x.id !== d.id)
    if (target < 0) return
    d.contribution = ownScores[target]
    d.boosts = []
    noteBoost(d, { id: 'entanglement', from: target, copy: true })
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
  // Two's Complement (R4): on an even face it doubles both neighbors' score.
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.TWOS) || d.value % 2 !== 0) return
    for (const j of [i - 1, i + 1]) {
      if (!perDie[j] || !(perDie[j].contribution > 0)) continue
      perDie[j].contribution *= 2
      noteBoost(perDie[j], { id: 'twos_complement', from: i, factor: 2 })
    }
  })
  // A Singularity triples both neighbors' Base (K4, N3).
  perDie.forEach((d, i) => {
    if (!hasFlag(d.actingAs, FLAGS.SINGULARITY)) return
    for (const j of [i - 1, i + 1]) {
      if (!perDie[j] || !(perDie[j].contribution > 0)) continue
      perDie[j].contribution *= 3
      noteBoost(perDie[j], { id: 'singularity', from: i, factor: 3 })
    }
  })
  // Law of Echo (O2): your highest-scoring die counts twice.
  if (fx.lawEcho && perDie.length) {
    let top = 0
    perDie.forEach((d, i) => {
      if (d.contribution > perDie[top].contribution) top = i
    })
    if (perDie[top].contribution > 0) {
      perDie[top].contribution *= 2
      noteBoost(perDie[top], { law: 'law_echo', from: top, factor: 2 })
    }
  }
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
  // Darkness, Shadow and Nadir (N2, N3) halve a neighbor: it keeps half its score.
  const halve = (j) => {
    if (!perDie[j]) return 0
    const half = perDie[j].contribution / 2
    perDie[j].contribution = half
    return half
  }
  perDie.forEach((d, i) => {
    if (hasFlag(d.actingAs, FLAGS.GLOOM)) {
      const v = halve(i + 1)
      if (v > 0) darkLines.push({ kind: 'mythic', id: 'gloom', value: v, dice: [i] })
    }
    if (hasFlag(d.actingAs, FLAGS.SHADOW)) {
      const v = halve(i - 1)
      if (v > 0) darkLines.push({ kind: 'mythic', id: 'shadow', value: v, dice: [i] })
    }
    if (hasFlag(d.actingAs, FLAGS.ABYSS)) [i - 1, i + 1].forEach(halve)
    // The Maw (P2) eats the lowest other die (two for the Greater one) and
    // pays a multiple of what it scored into Mult.
    if (sigil[i]?.symbol === 'maw') {
      const g = sigil[i].greater ? 1 : 0
      for (let k = 0; k < SIGIL.mawEats[g]; k++) {
        let low = -1
        perDie.forEach((o, j) => {
          if (j !== i && !isSigilDie(j) && !o.swallowed && !o.darkened && o.contribution > 0 && (low < 0 || o.contribution < perDie[low].contribution)) low = j
        })
        if (low < 0) break
        const eaten = eat(low)
        darkLines.push({ kind: 'sigil', id: 'maw', value: eaten * SIGIL.mawFactor[g], dice: [i, low] })
      }
    }
    if (hasFlag(d.actingAs, FLAGS.OBLIVION)) {
      let low = -1
      perDie.forEach((o, j) => {
        if (j !== i && !o.swallowed && (low < 0 || o.value < perDie[low].value)) low = j
      })
      if (low >= 0) {
        const face = perDie[low].value
        eat(low)
        darkLines.push({ kind: 'mythic', id: 'oblivion', value: face * 3, dice: [i, low] })
      }
    }
  })
  perDie.forEach((d) => (d.contribution = Math.round(d.contribution * 100) / 100))

  // --- Base ---
  const baseLines = []
  // The Time die's ghost adds the Base your dice scored before the last reroll (N2).
  const diceSum = perDie.reduce((sum, d) => sum + d.contribution, 0) + (ctx.ghostBase || 0)
  baseLines.push({ kind: 'dice', value: diceSum, op: 'add' })
  let baseValue = diceSum

  // The Scale (P2) tips the scales: the Base is raised to the expected
  // average of the number dice, if it came out lower. Then the Sun lifts it.
  const expectedBase = perDie.reduce((sum, d, i) => {
    if (isSigilDie(i)) return sum
    const faces = isPokerId(d.elementId) ? pokerFaces(d.elementId) : null
    return sum + (faces ? faces.reduce((a, b) => a + b, 0) / faces.length : (d.sides + 1) / 2)
  }, 0)
  sigil.forEach((sg, i) => {
    if (sg?.symbol !== 'scale') return
    const floor = expectedBase * SIGIL.scaleFloor[sg.greater ? 1 : 0]
    if (baseValue < floor) {
      baseLines.push({ kind: 'sigil', id: 'scale', value: floor - baseValue, op: 'add', dice: [i] })
      baseValue = floor
    }
  })
  sigil.forEach((sg, i) => {
    if (sg?.symbol !== 'sun') return
    const factor = SIGIL.sunFactor[sg.greater ? 1 : 0]
    baseValue *= factor
    baseLines.push({ kind: 'sigil', id: 'sun', value: factor, op: 'mul', dice: [i] })
  })

  if (fx.pureEarthBaseBonusPct && perDie.every((d) => d.elementId === 'earth')) {
    baseValue *= 1 + fx.pureEarthBaseBonusPct
    baseLines.push({ kind: 'relic', id: sourceOf(relics, 'pureEarthBaseBonusPct'), value: 1 + fx.pureEarthBaseBonusPct, op: 'mul' })
  }
  if (fx.explodeFlatBonus && explodeCount > 0) {
    const v = fx.explodeFlatBonus * explodeCount
    baseValue += v
    baseLines.push({ kind: 'relic', id: sourceOf(relics, 'explodeFlatBonus'), value: v, op: 'add' })
  }

  // Law of Inversion (O2): the lowest die counts as the highest face.
  if (fx.lawInversion && perDie.length > 1) {
    const values = perDie.filter((d, i) => !isSigilDie(i)).map((d) => d.value)
    const gain = values.length > 1 ? Math.max(...values) - Math.min(...values) : 0
    if (gain > 0) {
      baseValue += gain
      baseLines.push({ kind: 'relic', id: sourceOf(relics, 'lawInversion'), value: gain, op: 'add', dice: [perDie.findIndex((d, i) => !isSigilDie(i) && d.value === Math.min(...values))] })
    }
  }

  const reactions = findReactions(perDie, fx, ctx.reactionMultBonus || 0, ctx.constellations, ctx.firmament)
  // Echo Chamber (M3): the best reaction of the cast (by Mult) triggers twice.
  if (fx.echoChamber && reactions.length) {
    const best = reactions.reduce((b, r) => (r.mult > b.mult ? r : b), reactions[0])
    if (best.mult > 0 || best.base > 0) reactions.push({ ...best, echoed: true })
  }
  // Law of Unity (O2): every reaction also counts as a Resonance, +2 Base each.
  if (fx.lawUnity && reactions.length) {
    const gain = 2 * reactions.length
    baseValue += gain
    baseLines.push({ kind: 'relic', id: sourceOf(relics, 'lawUnity'), value: gain, op: 'add' })
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
    if (hasFlag(d.actingAs, FLAGS.NIL) && !d.swallowed) addMult({ kind: 'mythic', id: 'nil', value: (ctx.emptyDiceSlots || 0), dice: [i] })
    if (hasFlag(d.actingAs, FLAGS.ABYSS) && !d.swallowed) addMult({ kind: 'mythic', id: 'abyss', value: 3 * (ctx.emptyDiceSlots || 0), dice: [i] })
    if (hasFlag(d.actingAs, FLAGS.DEAD_STAR) && !d.swallowed) addMult({ kind: 'mythic', id: 'dead_star', value: n - 1, dice: [i] })
    // Quasar (I1): its face, flat, into Mult.
    if (hasFlag(d.actingAs, FLAGS.QUASAR) && !d.swallowed && !zeroTargets.has(i) && !(fx.bannedElementId && d.elementId === fx.bannedElementId)) addMult({ kind: 'celestial', id: 'quasar', value: d.total * 2, dice: [i] })
    // The Charged tag (N1): half of the face (or all of it) is also Mult, unless the die was swallowed.
    // A Rune of Double (O1): on its number the die's score is also added to Mult.
    if (hasActiveRune(d, 'double') && d.contribution > 0) addMult({ kind: 'rune', id: 'double', value: d.contribution, dice: [i] })
    const charge = chargedOf(d.elementId)
    if (charge && !d.swallowed) addMult({ kind: 'charged', id: 'charged', value: Math.round(d.value * (charge === 'full' ? 1 : 0.5) * 10) / 10, dice: [i] })
  })
  // Severed Grace (B3): +1 Mult for the rest of the run.
  if (ctx.permanentMult) addMult({ kind: 'boon', id: 'severed_grace', value: ctx.permanentMult })
  // The Metronome and the Cuckoo Clock (I2).
  ;(ctx.bonusMult || []).forEach((line) => addMult({ ...line }))
  // Closed Timelike Curve (N5): Mult x2 while the cast window is open.
  const curve = perDie.findIndex((d) => hasFlag(d.actingAs, FLAGS.TIMELIKE))
  if (ctx.ctcActive && curve >= 0) {
    multiplier *= 2
    multLines.push({ kind: 'celestial', id: 'timelike_curve', value: 2, op: 'mul', dice: [curve] })
  }
  // Realm 3's Mult (R3, R4): Two's Complement on an even face, Limit's explosions,
  // Infinity's and Apeiron's explosions kept for the run, Divergence's free rerolls.
  perDie.forEach((d, i) => {
    if (hasFlag(d.actingAs, FLAGS.TWOS) && d.value % 2 === 0) addMult({ kind: 'celestial', id: 'twos_complement', value: 2, dice: [i] })
    if (hasFlag(d.actingAs, FLAGS.LIMIT) && !d.swallowed) addMult({ kind: 'celestial', id: 'limit', value: Math.min(LIMIT_MULT_CAP, explodeCount), dice: [i] })
  })
  if (ctx.infMult) addMult({ kind: 'celestial', id: 'abs_infinity', value: ctx.infMult, dice: perDie.flatMap((d, i) => (hasFlag(d.actingAs, FLAGS.ABS_INFINITY) || hasFlag(d.actingAs, FLAGS.APEIRON) ? [i] : [])) })
  if (ctx.divergeCount) addMult({ kind: 'celestial', id: 'divergence', value: ctx.divergeCount, dice: perDie.flatMap((d, i) => (hasFlag(d.actingAs, FLAGS.DIVERGENCE) ? [i] : [])) })
  // Epsilon (R2): +2 Mult, and the Mult is never rounded down.
  if (fx.neverRoundMult) addMult({ kind: 'relic', id: sourceOf(relics, 'neverRoundMult'), value: 2 })
  // The Eye and the Spiral (P2) pay Mult at the cast.
  sigil.forEach((sg, i) => {
    const g = sg?.greater ? 1 : 0
    if (sg?.symbol === 'eye') addMult({ kind: 'sigil', id: 'eye', value: SIGIL.eyeMult[g], dice: [i] })
    if (sg?.spirals) addMult({ kind: 'sigil', id: 'spiral', value: SIGIL.spiralMult[g] * sg.spirals, dice: [i] })
  })
  // Poker hands (O3): read among the poker dice only; the best one adds its Mult.
  const pokerAt = perDie.flatMap((d, i) => (isPokerId(d.elementId) ? [i] : []))
  const hand = bestHand(pokerAt.map((i) => perDie[i].value))
  if (hand) addMult({ kind: 'poker', id: hand.id, value: hand.mult, dice: pokerAt })
  // Law of Greed (O2): each 10 Shards held adds +1 Mult.
  if (fx.lawGreed && ctx.shards >= 10) addMult({ kind: 'relic', id: sourceOf(relics, 'lawGreed'), value: Math.floor(ctx.shards / 10) })
  // Law of Symmetry (O2): faces that read the same both ways double the Mult.
  if (fx.lawSymmetry && perDie.length > 1) {
    const faces = perDie.map((d) => d.value)
    if (faces.every((v, i) => v === faces[faces.length - 1 - i])) {
      multiplier *= 2
      multLines.push({ kind: 'relic', id: sourceOf(relics, 'lawSymmetry'), value: 2, op: 'mul' })
    }
  }
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

  // Floating Point (R2): no decimals. Base and Mult are rounded down after every
  // step of the ledger, and each loss is a line of its own. Epsilon spares the Mult.
  if (fx.floorSteps) {
    const b = floorSteps(baseLines, 0)
    baseLines.splice(0, baseLines.length, ...b.lines)
    baseValue = b.total
    if (!fx.neverRoundMult) {
      const m = floorSteps(multLines, 1)
      multLines.splice(0, multLines.length, ...m.lines)
      multiplier = m.total
    }
  }
  // The Axiom (R2): the score is Base + Mult.
  const roundScore = fx.addScore ? Math.round(baseValue + multiplier) : Math.round(baseValue * multiplier)
  // Bullion pays the final Mult, rounded down, per Bullion die.
  const bullionShards = bullionDice * Math.floor(multiplier)

  return {
    baseValue: Math.round(baseValue * 100) / 100,
    multiplier: Math.round(multiplier * 100) / 100,
    roundScore,
    addScore: Boolean(fx.addScore),
    explodeCount,
    setTier,
    setDiceIds,
    reactions,
    baseLines,
    multLines,
    midasShards,
    // A Rune of Gold (O1): 2 Shards each cast for every die showing its number.
    goldShards: 2 * perDie.filter((d) => hasActiveRune(d, 'gold')).length,
    bullionShards,
    dice: perDie,
  }
}

/** Floating Point's rounding (R2): floors the running total after each line, adding the loss as a line. */
function floorSteps(lines, start) {
  const out = []
  let run = start
  for (const line of lines) {
    out.push(line)
    run = line.op === 'mul' ? run * line.value : run + line.value
    if (Math.abs(run - Math.round(run)) > 1e-9) {
      const floored = Math.floor(run)
      out.push({ kind: 'rounding', id: 'floating', value: floored - run, op: 'add' })
      run = floored
    } else {
      run = Math.round(run)
    }
  }
  return { lines: out, total: run }
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
    base = round <= 15 ? tenth * Math.pow(difficulty.thresholdGrowth, round - 10) : fifteenth * Math.pow(LATE_GROWTH, Math.min(round, 30) - 15)
    // Realm 3 is steeper: x1.45 a round from round 31 (R1).
    if (round > 30) base *= Math.pow(REALM3_GROWTH, round - 30)
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
