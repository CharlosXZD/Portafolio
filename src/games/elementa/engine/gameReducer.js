import {
  ELEMENTS,
  FLAGS,
  PURE_ELEMENT_IDS,
  DOUBLE_FUSION_IDS,
  TRIPLE_FUSION_IDS,
  QUADRA_FUSION_ID,
  ARCANE_DIE_IDS,
  fusionsUnlockedBy,
  inFamily,
  elementHasFlag,
  actingElementIds,
  GOD_IDS,
  PRIMORDIAL_DIE_ID,
  TIERS,
  rarityForElement,
  MYTHIC_DIE_IDS,
  ENTROPY_ID,
  CHRONO_ID,
  isMythic,
  isOnePerRun,
  CELESTIAL_DIE_IDS,
  canGrowBig,
  takesNoSlot,
  VOID_CAP,
  NEW_DICE_IDS,
  ABSTRACT_BASE_IDS,
  ABSTRACT_FUSION_IDS,
  ABSOLUTE_IDS,
  NUMBER_DICE_IDS,
  POKER_DIE_IDS,
  BLACK_HOLE_DIE_ID,
  TIME_GHOST_ID,
  isTempDie,
  COSMIC_BASE_IDS,
  COSMIC_FUSION_IDS,
  DEAD_STAR_ID,
  isCosmicBase,
} from '../data/elements.js'
import { nextTier, prevTier, tierById, sellValueForDie, DICE_TIERS } from '../data/diceTiers.js'
import { RELICS, RARITY, relicById, costForRelic, sellValueForRelic } from '../data/relics.js'
import { CONSUMABLES, consumableById, costForConsumable, sellValueForConsumable } from '../data/consumables.js'
import { deckById } from '../data/decks.js'
import { difficultyById } from '../data/difficulty.js'
import {
  BOSS_MODIFIERS,
  PRIMORDIAL,
  PRIMORDIAL_POOL,
  GOD_TRIALS,
  UNBOUND_TARGET,
  WARDEN_TARGET,
  bossById,
  isBossRound,
  wardenFor,
} from '../data/bossModifiers.js'
import {
  rollDie,
  rerollPool,
  starChain,
  SIGIL,
  evaluatePool,
  thresholdForRound,
  shardsEarned,
  interestFor,
  shiftChaos,
  chronoLoop,
} from './scoring.js'
import { random, getRngState, setRngState, seedToState, randomSeed, cleanSeed } from './rng.js'
import {
  shopTypeById,
  DEALS,
  BLESSINGS,
  BETRAYALS,
  isBetrayal,
  FOLLOWER_SHOP,
  ATLAS_SERVICES,
  MOTE_STAGES,
  MOTE_RATE,
  MOTE_PACT_PRICE,
  HOROLOGIST_STOCK,
} from '../data/shops.js'
import {
  newMap,
  ensureLayers,
  nodeById,
  currentNode,
  nextChoices,
  retypeAhead,
  enterFirmament,
  enterRealm3,
  redrawRow,
  addPath,
  unlinkedNext,
} from './map.js'
import { firmamentEnding } from '../data/endings.js'
import { LEVEL_CAP, LEVELABLE } from '../data/constellations.js'
import { isPokerId, pokerFaces, JOKER_CAP } from '../data/poker.js'
import { REWRITER_ROUNDS, rewriterFor, REWRITER_SETS, REWRITER_TARGET, rewriterById, realm3Ending, REALM3_END } from '../data/realm3.js'
import { isSigilId, sigilFaces, sigilSetOf, isGreaterSigil, SIGIL_SETS, SIGIL_SET_IDS, SIGIL_OFFER_CHANCE, SIGIL_PRICE, SIGIL_GREATER_PRICE } from '../data/sigils.js'
import { TOTEM_CAP, totemLevel, kindlingReroll } from '../data/totems.js'
import { GLASS_BREAK_CHANCE, RUNE_CLASH_FEE, runesOf, hasActiveRune, migrateDieRunes, fitRunes, faceCap } from '../data/runes.js'
import { rollContext, settleTide, tideLocks, isGodDie } from './gods.js'

const STARTING_TIER = 'd6'
// Dice bought in a shop usually arrive small (d3); Upgrade Stones, the Forge
// and boss rewards are how they grow. Bigger ones turn up now and then, each
// size rarer and pricier than the last. Forged and starting dice stay d6.
const SHOP_DIE_TIER = 'd3'
// Weight of each size in a shop's die offers, the first round (shop luck
// included) it can show up in, and the flat premium over the die's usual
// price: a d20 Fire die costs its 4 Shards plus 28.
const SHOP_DIE_SIZES = [
  { id: 'd3', weight: 60, from: 1, premium: 0 },
  { id: 'd5', weight: 22, from: 2, premium: 3 },
  { id: 'd6', weight: 12, from: 3, premium: 6 },
  { id: 'd10', weight: 5, from: 5, premium: 14 },
  { id: 'd20', weight: 1.2, from: 8, premium: 28 },
]
const STARTING_REROLLS = 3
const WIN_ROUND = 15
// The Firmament (EXPANSION.md H1): rounds 16 to 30, past the door.
const FIRMAMENT_END = 30
const WARDEN_COUNT = 6
const LIFE_REGEN_EVERY_N_ROUNDS = 4
const MAX_DICE = 10
const MAX_CONSUMABLES = 3
// Warp (EXPANSION.md H3, Claude's defaults): a Warp die does not count
// toward the dice cap, at most WARP_CAP of them at once; a Firmament die
// offer comes with Warp this often, for WARP_PREMIUM more Shards.
const WARP_CAP = 3
const WARP_OFFER_CHANCE = 0.02
const WARP_PREMIUM = 12
// The apprentice discount (EXPANSION.md N6): a new die's next two upgrades cost half, for two shop visits.
const APPRENTICE_UPGRADES = 2
const APPRENTICE_VISITS = 2
// Stardust (EXPANSION.md K2, Defaults): what a boss and a Warden drop, and
// Vesper's price for one.
const STARDUST_PER_BOSS = 1
const STARDUST_PER_WARDEN = 2
const STARDUST_PRICE = 30
const ALL_FUSION_IDS = [...DOUBLE_FUSION_IDS, ...TRIPLE_FUSION_IDS, QUADRA_FUSION_ID]

// Rarity is round-gated so a run can't snowball into a legendary-item build
// in round 2. This is one of the build restrictions (see also relicCap on
// the chosen difficulty) that make "just buy everything" not a strategy.
// Dice share this same scale (data/elements.js rarityForElement), so a
// "rare" die and a "rare" relic unlock on the same schedule.
const RARITY_UNLOCK_ROUND = {
  [RARITY.COMMON]: 1,
  [RARITY.UNCOMMON]: 2,
  [RARITY.RARE]: 4,
  [RARITY.EPIC]: 7,
  [RARITY.LEGENDARY]: 10,
  // Mythic dice are sold only in the Firmament (H3), from its first shop.
  [RARITY.MYTHIC]: 15,
  // Realm 3 (R3).
  [RARITY.ABSTRACT]: 31,
  [RARITY.ABSOLUTE]: 31,
}

const RARITY_WEIGHT = {
  [RARITY.COMMON]: 6,
  [RARITY.UNCOMMON]: 4,
  [RARITY.RARE]: 2,
  [RARITY.EPIC]: 1,
  [RARITY.LEGENDARY]: 1,
  [RARITY.MYTHIC]: 1,
  [RARITY.ABSTRACT]: 1,
  [RARITY.ABSOLUTE]: 1,
}

const FORGE_BASE_COST_BY_TIER = {
  double: 6,
  triple: 10,
  quadra: 16,
  // The gods (B4, Claude's default): consume 4 pure dice plus 24 Shards.
  god: 24,
  // Entropy (H5): every Mythic die and Aether, plus a high Shard cost.
  mythic: 300,
}

const DIE_BASE_COST_BY_TIER = {
  double: 12,
  triple: 20,
  quadra: 64,
  // The Mythic dice (H3).
  mythic: 45,
}

// Arcane dice have no fusion tier, so they're priced by rarity instead (a
// die can set its own `price`, as Prism and Bullion do).
const ARCANE_DIE_COST_BY_RARITY = {
  [RARITY.COMMON]: 8,
  [RARITY.RARE]: 14,
  [RARITY.EPIC]: 20,
  [RARITY.LEGENDARY]: 30,
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function relicEffects(relics) {
  return relics.reduce((acc, r) => ({ ...acc, ...r.effects }), {})
}

// A boss round's modifier is shaped exactly like a relic (see
// data/bossModifiers.js) so every scoring/rolling call site can pick it up
// for free by merging it in here, without a parallel "is this a boss round"
// branch at each call site. It's deliberately never added to state.relics
// itself, so it can't be sold or shown as an owned relic.
function effectiveRelics(state) {
  // The Law (O2) sits outside the relic slots but scores like a relic.
  const law = state.law ? [state.law] : []
  if (!state.bossModifier) return law.length ? [...state.relics, ...law] : state.relics
  // Silence seals one owned relic for the round; the Hollow seals them all (H2).
  const twists = [state.bossModifier, state.extraTwist].filter(Boolean)
  const sealed = twists.map((t) => t.effects?.sealedRelicId).filter(Boolean)
  const sealAll = twists.some((t) => t.effects?.sealAllRelics)
  const relics = sealAll ? [] : sealed.length ? state.relics.filter((r) => !sealed.includes(r.id)) : state.relics
  return [...relics, ...law, ...twists]
}

function randomOf(list) {
  return list[Math.floor(random() * list.length)]
}

// Primordial's current twist: a copy of one pool boss's effects, tagged so
// the UI can name which twist is active right now.
function primordialWith(twistId) {
  const twist = bossById(twistId)
  return { ...PRIMORDIAL, twistId, effects: { ...twist.effects } }
}

// The run's last round: 15, or 30 past the door (H1).
function finalRound(state) {
  return state.realm3 ? REALM3_END : state.realm === 'firmament' ? FIRMAMENT_END : WIN_ROUND
}

/** The Rewriter waiting at a round of realm 3 for this path and set, or null (R2). */
function rewriterAt(state, round) {
  return state.realm3 ? rewriterFor(state.path, state.realm3Set, round) : null
}

// A boss no pact can swap out: the Primordial, or a Warden (H1, H2).
function isFixedBoss(state, round) {
  if (state.realm3 && round > FIRMAMENT_END) return Boolean(rewriterAt(state, round))
  if (state.realm === 'firmament') return Boolean(wardenFor(state.path, state.firmamentSet, round))
  return round % WIN_ROUND === 0
}

function pickBossModifier(state, round) {
  // Past the door, rounds 20, 25 and 30 are the path's Wardens (H1, H2).
  const rewriter = rewriterAt(state, round)
  if (rewriter) return rewriter
  const warden = state.realm === 'firmament' ? wardenFor(state.path, state.firmamentSet, round) : null
  if (warden) return warden
  if (round % WIN_ROUND === 0 && state.realm !== 'firmament') return primordialWith(randomOf(PRIMORDIAL_POOL))
  const ownedIds = [...new Set(state.dice.map((d) => d.elementId))]
  const maxTier = round >= 10 ? 2 : 1
  const pool = BOSS_MODIFIERS.filter((m) => {
    if (m.tier > maxTier) return false
    // Null Zone would zero every die (an unwinnable round) if the pool is
    // still mono-element, so it needs a second element to fall back on.
    if (m.id === 'null_zone' && ownedIds.length < 2) return false
    if (m.id === 'silence' && !(state.relics?.length > 0)) return false
    return true
  })
  return instantiateBoss(state, randomOf(pool))
}

// Fills in a boss's per-run target (Null Zone's element, Silence's relic).
function instantiateBoss(state, template) {
  if (template.id === 'null_zone') {
    const ownedIds = [...new Set(state.dice.map((d) => d.elementId))]
    return { ...template, effects: { ...template.effects, bannedElementId: randomOf(ownedIds) } }
  }
  if (template.id === 'silence') {
    return { ...template, effects: { ...template.effects, sealedRelicId: randomOf(state.relics).id } }
  }
  return template
}

// The Long Night (B3): a second twist of the same tier (tier 2 for
// Primordial), never the boss's own twist, never Ermal.
function secondTwist(state, boss) {
  const tier = Math.min(boss.tier, 2)
  const ownedIds = new Set(state.dice.map((d) => d.elementId))
  const pool = BOSS_MODIFIERS.filter(
    (m) =>
      m.tier === tier &&
      m.id !== 'ermal' &&
      m.id !== boss.id &&
      m.id !== boss.twistId &&
      !(m.id === 'null_zone' && ownedIds.size < 2) &&
      !(m.id === 'silence' && !state.relics.length),
  )
  return pool.length ? instantiateBoss(state, randomOf(pool)) : null
}

// Round-start boss effects that change the dice themselves (for the boss
// and, with The Long Night, its second twist).
function applyTwistsRoundStart(dice, boss, extra) {
  return applyBossRoundStart(applyBossRoundStart(dice, boss), extra)
}

function applyBossRoundStart(dice, boss) {
  if (!boss?.effects?.frostbite || dice.length === 0) return dice
  const target = randomOf(dice)
  return dice.map((d) =>
    d.id === target.id
      ? { ...d, value: 1, total: 1, explosions: 0, held: true, locked: true, lockedVia: 'freeze' }
      : d,
  )
}

function makeDie(elementId, tierId = STARTING_TIER, edition = null) {
  // A poker die has one fixed size of its own (O3).
  if (isPokerId(elementId)) tierId = elementId
  // A sigil die has one size of its own, and no number (P1).
  if (isSigilId(elementId)) tierId = 'sigil'
  const sides = tierById(tierId).sides
  return {
    id: makeId(),
    elementId,
    tierId,
    sides,
    // Warp (H3): the Space die always carries it.
    edition: elementId === 'space' ? 'warp' : edition,
    held: false,
    locked: false,
    lockedVia: null,
    value: isPokerId(elementId) ? pokerFaces(elementId)[0] : isSigilId(elementId) ? 0 : 1,
    total: isPokerId(elementId) ? pokerFaces(elementId)[0] : isSigilId(elementId) ? 0 : 1,
    ...(isSigilId(elementId) ? { symbol: sigilFaces(elementId)[0], spirals: 0 } : {}),
    explosions: 0,
    rollId: 0,
  }
}

const countExplosions = (dice) => dice.reduce((sum, d) => sum + (d.explosions || 0), 0)

// --- The Firmament's dice rules (EXPANSION.md H3 to H5). ---

const isWarp = (d) => d.edition === 'warp'
// The Void and what it is part of take no slot (EXPANSION.md N2); the
// temporary dice (Black Holes, the Time ghost) never do.
const isSlotFree = (d) => takesNoSlot(d.elementId)

/** Dice that count toward the dice cap: Warp dice, the Void's family and temporary dice do not (H3, N2). */
function poolSize(dice) {
  return dice.filter((d) => !isWarp(d) && !isSlotFree(d) && !isTempDie(d)).length
}

function warpCount(dice) {
  return dice.filter(isWarp).length
}

/** Whether a pool fits the dice cap, the Warp cap and the Void cap. */
function fitsPool(state, dice) {
  return (
    poolSize(dice) <= maxDiceFor(state) &&
    warpCount(dice) <= WARP_CAP &&
    dice.filter(isSlotFree).length <= VOID_CAP &&
    dice.filter((d) => d.elementId === 'joker').length <= JOKER_CAP &&
    // One sigil die per set, the normal or the Greater one (P1).
    SIGIL_SET_IDS.every((k) => dice.filter((d) => sigilSetOf(d.elementId) === k).length <= 1)
  )
}

/** One of each Mythic die (and one Entropy) per run (H3). */
function holdsKind(dice, elementId) {
  return isOnePerRun(elementId) && dice.some((d) => d.elementId === elementId)
}

/** Dice that can't be copied: gods, the lent Primordial die, Mythic dice. */
function uncopyable(die) {
  return isGodDie(die) || die.elementId === PRIMORDIAL_DIE_ID || isOnePerRun(die.elementId)
}

/** The size a die grows to next: past d20 only for big dice in the Firmament (H5). */
function growTier(state, die) {
  return nextTier(die.tierId, state.realm === 'firmament' && canGrowBig(die.elementId))
}

/** Free dice, relic and consumable slots, for Void (H3), read at cast time. */
function emptySlots(state) {
  return (
    Math.max(0, maxDiceFor(state) - poolSize(state.dice)) +
    Math.max(0, relicCapFor(state) - state.relics.length) +
    Math.max(0, consumableCapFor(state) - state.consumables.length)
  )
}

const holdsTime = (dice) => dice.some((d) => d.elementId === 'time')

// The Maelstrom (H2) lends a die a pure element for the round; this gives
// its own back.
function unmaelstrom(d) {
  return d.maelstromFrom ? { elementId: d.maelstromFrom, maelstromFrom: null } : {}
}

// Chrono's rewinds (H4) after a roll: `rolled` is the ids that rolled.
function chronoAfterRoll(dice, relics, ctx, rolled) {
  return chronoLoop(dice, relics, ctx, rolled, settleTide)
}

// Round-level counters that reset whenever a round (or a retry) starts:
// the Drift and Gust charges, and the explosions Heat has seen so far.
function freshRoundCounters(dice) {
  // Time (H3): the reroll Rewind can undo, and whether it was used.
  // Pulsar counts the rerolls made (I1); the Hourglass's free rerolls (I2)
  // last the round. Alba (K4) makes the round's first reroll free.
  const alba = actingElementIds(dice).some((id) => elementHasFlag(id, FLAGS.ALBA))
  return {
    driftsUsed: 0,
    lockedThisRound: false,
    // Divergence's free rerolls this round (R3).
    divergeCount: 0,
    // The Eye (P2, P5): table changes since the last reroll, whether the Eye was struck blind this round, and the warning on screen.
    eyeShifts: 0,
    eyeBlind: false,
    eyeNotice: null,
    // Closed Timelike Curve (N5): its 20-second window has not run out yet.
    ctcExpired: false,
    gustUsed: false,
    explosionsThisRound: countExplosions(dice),
    lastReroll: null,
    rewindUsed: false,
    rerollsMade: 0,
    freeRerolls: alba ? 1 : 0,
  }
}

// What scoring needs to know beyond the dice and relics.
function scoreContext(state) {
  const buffs = state.roundBuffs || {}
  return {
    rerollsLeft: availableRerolls(state),
    explosionsThisRound: state.explosionsThisRound || 0,
    // Severed Grace, Blessing of Communion and Blessing of Ember-ward (B3).
    permanentMult: state.permanentMult || 0,
    reactionMultBonus: buffs.communion ? 0.5 : 0,
    noFizzle: Boolean(buffs.noFizzle),
    // Void (H3): every empty slot is +1 Mult. Null and Abyss count only the
    // empty dice slots (K1, K4).
    emptySlots: emptySlots(state),
    emptyDiceSlots: Math.max(0, maxDiceFor(state) - poolSize(state.dice)),
    // Pulsar (I1) counts the rerolls made this round.
    rerollsMade: state.rerollsMade || 0,
    // Mult that comes from items rather than dice (I2): the Metronome, the
    // Cuckoo Clock.
    bonusMult: itemMult(state),
    // Levelled reactions and sets (J1), Totems (L4).
    constellations: state.constellations || {},
    totems: state.totems || {},
    // Realm 3 (R3, R4): Mult kept from explosions, Divergence's rerolls, rerolls made this run.
    infMult: state.infMult || 0,
    divergeCount: state.divergeCount || 0,
    rerollsTotal: state.rerollsTotal || 0,
    // Law of Greed (O2) reads the Shards held; Link (O1) the elements the run has met.
    shards: state.shards,
    firmament: state.realm === 'firmament',
    // Crown of Ages (M3) multiplies by the round.
    round: state.round,
    // Closed Timelike Curve (N5): the cast window is open until the timer runs out.
    ctcActive: !state.ctcExpired,
    // Deep Current (L3): whether a lock has happened this round.
    lockedThisRound: Boolean(state.lockedThisRound),
  }
}

/**
 * Drift charges a round (L2, L3, L4): one, +1 with Second Wind, +1 for every
 * Air Totem level. Each charge nudges one die. A save from before charges
 * existed carries a boolean `driftUsed`.
 */
function driftChargesLeft(state) {
  const fx = relicEffects(effectiveRelics(state))
  const total = 1 + (fx.driftCharges || 0) + totemLevel(state.totems, 'air')
  const used = state.driftsUsed ?? (state.driftUsed ? 1 : 0)
  return Math.max(0, total - used)
}

/**
 * Rune of Glass (EXPANSION.md J3): after a cast has scored, each Glass die
 * has GLASS_BREAK_CHANCE to shatter and leave the pool, one seeded draw per
 * die, left to right. The pool never loses its last die.
 */
function shatterGlass(state) {
  // Since K3b only a die showing its Glass number can break.
  const broken = state.dice.filter((d) => hasActiveRune(d, 'glass', d.value) && random() < GLASS_BREAK_CHANCE).map((d) => d.id)
  if (broken.length === 0) return { state, shattered: [] }
  if (broken.length >= state.dice.length) broken.pop()
  return {
    state: { ...state, dice: state.dice.filter((d) => !broken.includes(d.id)) },
    shattered: state.dice.filter((d) => broken.includes(d.id)).map((d) => d.elementId),
  }
}

/** Metronome and Cuckoo Clock: +1 Mult on this round's cast (I2). */
function itemMult(state) {
  const out = []
  const m = state.metronome
  if (m && state.round >= m.from && state.round <= m.to) out.push({ kind: 'consumable', id: 'metronome', value: 1 })
  if (state.cuckooRound === state.round && state.relics.some((r) => r.id === 'cuckoo_clock')) {
    out.push({ kind: 'relic', id: 'cuckoo_clock', value: 1 })
  }
  return out
}

/** One use of the apprentice discount; the mark ends when none are left. */
function agedFresh(fresh, key) {
  if (!fresh) return fresh
  const next = { ...fresh, [key]: Math.max(0, (fresh[key] || 0) - 1) }
  return next.upgrades > 0 && next.visits > 0 ? next : null
}

// --- Temporary dice and the dice that pick or spawn (EXPANSION.md N2, N5). ---

/** A Black Hole die or the Time ghost: it takes no slot, cannot be held, sold or upgraded, and goes with the round. */
function makeTempDie(elementId, temp, extra = {}) {
  return {
    id: makeId(),
    elementId,
    temp,
    tierId: 'd3',
    sides: 0,
    edition: null,
    held: true,
    locked: true,
    lockedVia: null,
    value: 0,
    total: 0,
    explosions: 0,
    chain: [0],
    rollId: 0,
    ...extra,
  }
}

const withoutTemps = (dice) => dice.filter((d) => !isTempDie(d))

/**
 * What happens to the new dice after a roll: a Quantum Entanglement picks a
 * random other die (seeded; a held one keeps its pick while it is still
 * there), and an Event Horizon on its highest face opens two Black Hole dice
 * on either side of it, once a round.
 */
function settleNewDice(dice) {
  const real = withoutTemps(dice)
  let out = dice.map((d) => {
    if (!elementHasFlag(d.elementId, FLAGS.ENTANGLE)) return d
    const kept = (d.held || d.locked) && real.some((x) => x.id === d.entangledWith && x.id !== d.id)
    if (kept) return d
    const others = real.filter((x) => x.id !== d.id)
    return { ...d, entangledWith: others.length ? randomOf(others).id : null }
  })
  out = out.flatMap((d) => {
    if (!elementHasFlag(d.elementId, FLAGS.HORIZON) || d.bhOpen || d.value !== d.sides || d.sides < 1) return [d]
    return [makeTempDie(BLACK_HOLE_DIE_ID, 'hole'), { ...d, bhOpen: true }, makeTempDie(BLACK_HOLE_DIE_ID, 'hole')]
  })
  return out
}

/** The Time die's ghost (N2): the Base the dice scored before this reroll, in a temporary die beside the Time die. One at a time. */
function summonGhost(dice, ghostBase) {
  const at = dice.findIndex((d) => !isTempDie(d) && (elementHasFlag(d.elementId, FLAGS.MOMENT) || elementHasFlag(actingElementIds(dice)[dice.indexOf(d)], FLAGS.MOMENT)))
  if (at < 0) return dice
  const rest = dice.filter((d) => d.temp !== 'ghost')
  const idx = rest.findIndex((d) => d.id === dice[at].id)
  return [...rest.slice(0, idx + 1), makeTempDie(TIME_GHOST_ID, 'ghost', { ghostBase: Math.round(ghostBase * 100) / 100 }), ...rest.slice(idx + 1)]
}

function rollFreshRound(dice, relics) {
  const fx = relicEffects(relics)
  // A fresh round frees every die, so Chaos takes a new form first (H3).
  // Temporary dice go with the round that made them (N5).
  const pool = shiftChaos(
    withoutTemps(dice).map((d) => ({ ...d, ...unmaelstrom(d), held: false, locked: false, lockedVia: null, swallowed: false, bhOpen: false })),
  )
  // Masquerade and Chameleon roll with the abilities they borrow.
  const acting = actingElementIds(pool)
  const rolled = pool.map((d, i) => ({
    ...d,
    growth: 0,
    patience: 0,
    kindled: false,
    drifted: false,
    ...rollDie(acting[i], d.sides, relics, rollContext(d, pool, fx, acting[i])),
  }))
  // Varuna's tide settles every roll (B4), and a Chrono 1 rewinds it (H4).
  // A Pocket Watch (I2) keeps its die on the face it showed, held.
  return settleNewDice(
    chronoAfterRoll(starChain(settleTide(rolled)), relics, {}, null).dice.map((d) => {
      if (!d.watch) return d
      const v = Math.min(d.watch, d.sides)
      return { ...d, watch: null, value: v, total: v, explosions: 0, chain: [v], held: true }
    }),
  )
}

// `cut` is the current shop type's own price cut (data/shops.js), stacked
// on top of any relic discount.
function applyDiscount(base, relics, cut = 0) {
  const fx = relicEffects(relics)
  return Math.max(1, Math.round(base * (1 - (fx.shopDiscountPct || 0)) * (1 - cut)))
}

function shopCut(shop, kind) {
  if (!shop) return 0
  const type = shopTypeById(shop.type)
  return 1 - (1 - (type.discount || 0)) * (1 - (kind === 'consumable' ? type.consumableDiscount || 0 : 0))
}

function dieUpgradeCost(die, relics, shop, realm = 'elementa') {
  const next = nextTier(die.tierId, realm === 'firmament' && canGrowBig(die.elementId))
  if (!next) return null
  // The apprentice discount (N6): a new die's next two upgrades cost half.
  const apprentice = (die.fresh?.upgrades || 0) > 0
  const cost = applyDiscount(next.upgradeCost, relics, shopCut(shop, 'upgrade'))
  return { next, cost: apprentice ? Math.max(1, Math.round(cost / 2)) : cost, apprentice }
}

function isFusionElement(elementId) {
  return ELEMENTS[elementId].tier !== 'pure'
}

function newDieCost(elementId, dice, relics, shop, sizeId = SHOP_DIE_TIER) {
  const tier = ELEMENTS[elementId].tier
  const owned = dice.filter((d) => d.elementId === elementId).length
  const base =
    tier === 'pure'
      ? 4 + owned
      : tier === 'arcane'
        ? ELEMENTS[elementId].price ?? ARCANE_DIE_COST_BY_RARITY[rarityForElement(elementId)]
        : ELEMENTS[elementId].price ?? DIE_BASE_COST_BY_TIER[tier]
  // Bigger dice cost more: a d3 is the base price. A Mythic die is a d6 at
  // its own price, and a Warp offer costs more (H3).
  const premium = isMythic(elementId) || isPokerId(elementId) ? 0 : sizePremium(sizeId)
  const warp = shop?.dieWarp?.[elementId] && elementId !== 'space' ? WARP_PREMIUM : 0
  return applyDiscount(base + premium + warp, relics, shopCut(shop, 'die'))
}

function relicCost(relic, relics, shop) {
  return applyDiscount(costForRelic(relic), relics, shopCut(shop, 'relic'))
}

// Buying removes one copy of an offer (a Constellation can be offered twice).
function dropOffer(offers, kind, id) {
  const i = offers.findIndex((o) => o.kind === kind && o.id === id)
  return i < 0 ? offers : offers.filter((_, j) => j !== i)
}

function consumableCost(def, relics, shop) {
  return applyDiscount(costForConsumable(def), relics, shopCut(shop, 'consumable'))
}

// Hollow Crown (B3): relics sell for nothing for the rest of the run.
function relicSellValue(state, relic, fx = relicEffects(state.relics)) {
  return state.relicsSellZero ? 0 : sellValueForRelic(relic) + (fx.sellBonus || 0)
}

function rerollShopOffersCost(state) {
  const fx = relicEffects(state.relics)
  return Math.max(1, 3 + state.shop.rerollShopUses - (fx.shopRerollDiscount || 0))
}

// Forging a fusion die trades its parent dice (consumed) plus Shards for
// the fusion die, an alternative to hoping the shop offers it. Works for
// any fusion tier: a double costs 2 parents, a triple 3, the quadra all 4.
// See GDD.md §13a/§18.
function forgeCost(relics, tier, shop, base = FORGE_BASE_COST_BY_TIER[tier]) {
  const fx = relicEffects(relics)
  return applyDiscount(Math.max(1, base - (fx.forgeDiscount || 0)), relics, shopCut(shop, 'forge'))
}

/** A recipe's own Forge cost (a Mythic die's 20, an element fusion's 10), or its tier's. */
function forgeCostFor(state, def) {
  return forgeCost(state.relics, def.tier, state.shop, def.forgeCost ?? FORGE_BASE_COST_BY_TIER[def.tier])
}

// Aether's recipe is secret until Primordial falls on this save file
// (EXPANSION.md B6): until then it can't be forged or bought.
function knowsAether(state) {
  return Boolean(state.recipes?.includes(QUADRA_FUSION_ID))
}

function withRecipe(state, id) {
  const recipes = state.recipes || []
  return recipes.includes(id) ? state : { ...state, recipes: [...recipes, id] }
}

// How many of each die a recipe consumes: one of each parent, or a god's
// four pure dice of its element (B4).
function recipeNeeds(def) {
  return def.recipe ?? Object.fromEntries(def.parents.map((p) => [p, 1]))
}

// The god recipes come from the visions after a Neutral win (B2).
function knowsGods(state) {
  return GOD_IDS.every((id) => state.recipes?.includes(id))
}

// The four gods may share a pool (Carlos, 2026-10-04: the old "one god at a
// time" is lifted); each is still one of a kind (`holdsKind`). The Pantheon
// relic now pays for a full house instead (a Mult per god held).
function godCapFor() {
  return GOD_IDS.length
}

function godCount(dice) {
  return dice.filter(isGodDie).length
}

function forgeableRecipes(state) {
  const ownedCounts = new Map()
  state.dice.forEach((d) => ownedCounts.set(d.elementId, (ownedCounts.get(d.elementId) || 0) + 1))
  const fusions = knowsAether(state) ? ALL_FUSION_IDS : ALL_FUSION_IDS.filter((id) => id !== QUADRA_FUSION_ID)
  // Gods, Mythic dice, element fusions and Entropy need their recipe (B4, K1, K4, H5).
  const learned = [...GOD_IDS, ...MYTHIC_DIE_IDS, ...COSMIC_FUSION_IDS, ...ABSTRACT_FUSION_IDS, ...ABSOLUTE_IDS, ENTROPY_ID].filter((id) => state.recipes?.includes(id))
  return [...fusions, ...learned].map((fusionElementId) => {
    const def = ELEMENTS[fusionElementId]
    const needs = recipeNeeds(def)
    const godFull =
      (def.tier === TIERS.GOD && godCount(state.dice) >= godCapFor(state)) || holdsKind(state.dice, fusionElementId)
    // The Forge is open only in Forge-type shops (or with a Fusion Spark).
    const canForge =
      Boolean(state.shop?.forgeOpen) && !godFull && Object.entries(needs).every(([p, n]) => (ownedCounts.get(p) || 0) >= n)
    return {
      fusionElementId,
      parents: Object.entries(needs).flatMap(([p, n]) => Array(n).fill(p)),
      tier: def.tier,
      canForge,
      cost: forgeCostFor(state, def),
    }
  })
}

// --- The Forge, rebuilt (EXPANSION.md K3, K3b, K4): four open slots. The
// player places the dice to absorb; the recipe is read from them. ---

export const FORGE_SLOTS = 4
// A volatile fusion's chance to collapse into a Dead Star (K4, Default).
export const COLLAPSE_CHANCE = 0.25
// Every recipe the Forge can make, by what it consumes.
const FORGE_RESULTS = [
  ...ALL_FUSION_IDS,
  ...GOD_IDS,
  ...MYTHIC_DIE_IDS,
  ...COSMIC_FUSION_IDS,
  ...ABSTRACT_FUSION_IDS,
  ...ABSOLUTE_IDS,
  ENTROPY_ID,
]

/** Whether the run (its file) knows how to forge this. */
function knowsForge(state, id) {
  const def = ELEMENTS[id]
  if (id === QUADRA_FUSION_ID) return knowsAether(state)
  if (def.tier === TIERS.GOD || def.tier === TIERS.MYTHIC || def.cosmic) return Boolean(state.recipes?.includes(id))
  return true
}

/** The recipes whose dice are exactly the placed ones (as a multiset of elements). */
function forgeMatches(state, dice) {
  const key = (counts) =>
    Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, n]) => `${id}x${n}`)
      .join(',')
  const placed = {}
  dice.forEach((d) => (placed[d.elementId] = (placed[d.elementId] || 0) + 1))
  const want = key(placed)
  return FORGE_RESULTS.filter((id) => key(recipeNeeds(ELEMENTS[id])) === want).map((id) => ({ id, known: knowsForge(state, id) }))
}

/**
 * The forged die's size (K3): the average of the absorbed dice's size tier
 * (d3 0, d5 1, d6 2, d10 3, d20 4, then the big sizes), rounded down. A
 * result that cannot grow big stops at d20.
 */
export function forgedSize(dice, resultId) {
  const index = (d) => Math.max(0, DICE_TIERS.findIndex((t) => t.id === d.tierId))
  let i = Math.floor(dice.reduce((sum, d) => sum + index(d), 0) / dice.length)
  if (!canGrowBig(resultId)) i = Math.min(i, DICE_TIERS.findIndex((t) => t.id === 'd20'))
  return DICE_TIERS[i].id
}

/**
 * The runes the forged die receives (K3b): every rune stays on its number;
 * a number the new die lacks moves to its top face (a shrink). Two dice
 * with runes on the same number clash: `clashes` counts the extra sources.
 */
function forgedRunes(dice, sides) {
  const all = dice.flatMap((d) => fitRunes(runesOf(d), sides).map((r) => ({ ...r, from: d.id })))
  const byFace = new Map()
  all.forEach((r) => byFace.set(r.face, [...(byFace.get(r.face) || []), r]))
  let clashes = 0
  const clashFaces = []
  byFace.forEach((list, face) => {
    const sources = new Set(list.map((r) => r.from)).size
    if (sources > 1) {
      clashes += sources - 1
      clashFaces.push(face)
    }
  })
  return { all, clashes, clashFaces, moved: all.filter((r) => r.moved).length }
}

/**
 * Everything the Forge shows before you commit (K3): the result (or the
 * matches to choose from), its size, cost, Stardust, what carries over, the
 * rune clash fee, a volatile fusion's collapse chance, and why it can't be
 * forged right now (`blocked`). `opts`: { resultId, superpose, catalyst }.
 */
function forgePlan(state, dieIds, opts = {}) {
  const dice = dieIds.map((id) => state.dice.find((d) => d.id === id)).filter(Boolean)
  if (dice.length === 0) return { dice, matches: [], result: null }
  const matches = forgeMatches(state, dice)
  const pick = matches.find((m) => m.id === opts.resultId) ?? matches[0] ?? null
  if (!pick) return { dice, matches, result: null, blocked: 'noMatch' }
  const def = ELEMENTS[pick.id]
  const tierId = forgedSize(dice, pick.id)
  const sides = tierById(tierId).sides
  const runes = forgedRunes(dice, sides)
  const fee = runes.clashes * RUNE_CLASH_FEE
  const cost = forgeCostFor(state, def)
  const stardust = def.stardust || 0
  // A Catalyst is only ever spent on a volatile fusion (K6).
  const catalyst = Boolean(opts.catalyst) && Boolean(def.volatile) && state.consumables.some((c) => c.type === 'catalyst')
  const collapseChance = def.volatile && !catalyst ? COLLAPSE_CHANCE : 0
  const total = cost + (opts.superpose ? fee : 0)
  const rest = state.dice.filter((d) => !dieIds.includes(d.id))
  let blocked = null
  if (!pick.known) blocked = 'unknown'
  else if (!state.shop?.forgeOpen) blocked = 'closed'
  else if (def.tier === TIERS.GOD && godCount(rest) >= godCapFor(state)) blocked = 'godCap'
  else if (holdsKind(rest, pick.id)) blocked = 'onePerRun'
  else if ((state.stardust || 0) < stardust) blocked = 'stardust'
  else if (state.shards < total) blocked = 'shards'
  return {
    dice,
    matches,
    result: pick.id,
    known: pick.known,
    tierId,
    sides,
    cost,
    stardust,
    fee,
    total,
    clashes: runes.clashes,
    clashFaces: runes.clashFaces,
    movedRunes: runes.moved,
    runes: runes.all,
    // Upgrades carry over (K3, Default): bonuses add up, Warp stays if any
    // absorbed die had it, Weights and a Gem Socket stay too.
    carry: {
      bonus: dice.reduce((sum, d) => sum + (d.bonus || 0), 0),
      warp: dice.some(isWarp),
      weights: dice.some((d) => d.weights),
      socket: dice.some((d) => d.socket),
    },
    volatile: Boolean(def.volatile),
    collapseChance,
    catalyst,
    blocked,
  }
}

/**
 * Forges the placed dice (K3). With `superpose` the clash fee is paid and
 * every rune stays; otherwise, on each clashing number, the runes of one
 * absorbed die (a seeded 50/50, never shown) survive and the others are
 * lost. A volatile fusion may collapse into a Dead Star unless a Catalyst
 * steadies it.
 */
function forge(state, dieIds, opts = {}) {
  const plan = forgePlan(state, dieIds, opts)
  if (!plan.result || plan.blocked) return state
  let runes = plan.runes
  const lost = []
  if (!opts.superpose) {
    plan.clashFaces.forEach((face) => {
      const sources = [...new Set(runes.filter((r) => r.face === face).map((r) => r.from))]
      const keep = randomOf(sources)
      runes = runes.filter((r) => {
        const drop = r.face === face && r.from !== keep
        if (drop) lost.push(r.id)
        return !drop
      })
    })
  }
  const collapsed = plan.collapseChance > 0 && random() < plan.collapseChance
  const resultId = collapsed ? DEAD_STAR_ID : plan.result
  const made = {
    ...makeDie(resultId, plan.tierId, plan.carry.warp ? 'warp' : null),
    bonus: plan.carry.bonus || undefined,
    weights: plan.carry.weights || undefined,
    socket: plan.carry.socket || undefined,
    runes: runes.map(({ id, face }) => ({ id, face })),
  }
  // The forged die takes the place of the first absorbed one.
  const at = state.dice.findIndex((d) => dieIds.includes(d.id))
  const kept = state.dice.filter((d) => !dieIds.includes(d.id))
  const dice = [...kept.slice(0, at), made, ...kept.slice(at)]
  const consumables = plan.catalyst
    ? state.consumables.filter((c, i) => i !== state.consumables.findIndex((x) => x.type === 'catalyst'))
    : state.consumables
  const ownedElementsEver = state.ownedElementsEver.includes(resultId) ? state.ownedElementsEver : [...state.ownedElementsEver, resultId]
  const def = ELEMENTS[plan.result]
  const next = {
    ...state,
    dice,
    consumables,
    ownedElementsEver,
    shards: state.shards - plan.cost - (opts.superpose ? plan.fee : 0),
    stardust: (state.stardust || 0) - plan.stardust,
    shop: {
      ...state.shop,
      lastForge: { resultId, wanted: plan.result, collapsed, lost, dieId: made.id, superposed: Boolean(opts.superpose && plan.clashes) },
    },
  }
  // A fusion still leans the Accord (B1); gods, Mythic dice and Entropy don't.
  const fusion = [TIERS.DOUBLE, TIERS.TRIPLE, TIERS.QUADRA].includes(def.tier)
  return addAccord(next, fusion ? 'fusion' : null)
}

// Weighted sample without replacement: a rarity with weight 0 (round-gated)
// can never be picked, and common items are simply more likely early on.
function weightedSample(items, n, weightFn) {
  const pool = [...items]
  const out = []
  while (pool.length && out.length < n) {
    const weights = pool.map(weightFn)
    const total = weights.reduce((a, b) => a + b, 0)
    if (total <= 0) break
    let roll = random() * total
    let idx = weights.length - 1
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i]
      if (roll <= 0) {
        idx = i
        break
      }
    }
    out.push(pool.splice(idx, 1)[0])
  }
  return out
}

function rarityWeight(item, round) {
  // Poker dice (O3) have their own first round.
  if (item.minRound !== undefined) return round >= item.minRound ? RARITY_WEIGHT[item.rarity] ?? 1 : 0
  if (round < RARITY_UNLOCK_ROUND[item.rarity]) return 0
  return RARITY_WEIGHT[item.rarity] ?? 1
}

// Vault luck: rarities unlock 3 rounds early and lean rare.
const VAULT_WEIGHT = {
  [RARITY.COMMON]: 1,
  [RARITY.UNCOMMON]: 3,
  [RARITY.RARE]: 4,
  [RARITY.EPIC]: 3,
  [RARITY.LEGENDARY]: 2,
}

function vaultWeight(item, round) {
  if (item.kind !== 'relic') return rarityWeight(item, round)
  if (round + 3 < RARITY_UNLOCK_ROUND[item.rarity]) return 0
  return VAULT_WEIGHT[item.rarity] ?? 1
}

const RARITY_ORDER = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY, RARITY.DIVINE]

// The whole shop is luck-gated the same way: a small random sample rather
// than "everything you've unlocked, guaranteed". Relics and consumables
// share one pool (an item is an item), dice are a separate pool, both
// weighted by the same rarity scale/round-gating. What a shop stocks, and
// how much of it, comes from its type (data/shops.js).
function rollShopStock(state, type) {
  const firmament = state.realm === 'firmament'
  const ownedRelicIds = new Set(state.relics.map((r) => r.id))
  if (type.horologist) return rollHorologistStock(state, ownedRelicIds)
  // Seren's Observatory: four Constellations, duplicates allowed (J2).
  if (type.observatory) {
    // The Totems (L4) are on the shelf too, a little less often.
    const stars = CONSUMABLES.filter((c) => c.constellation || c.totem)
    const offers = Array.from({ length: type.items }, () => weightedSample(stars, 1, (c) => (c.id === 'const_black_hole' ? 0.2 : c.totem ? 0.6 : 1))[0])
    return finishStock(state, [...offers.map((c) => ({ kind: 'consumable', id: c.id })), ...lawOffer(state, type)], [], state.round)
  }
  // Runes (J3): the Forge's whole shelf, the Bazaar and Exchange's pool, and
  // the Firmament Market's pool.
  const runesIn = type.runes || (firmament && type.id === 'market')
  const consumablePool = type.runesOnly
    ? CONSUMABLES.filter((c) => c.runeItem)
    : CONSUMABLES.filter(
        (c) =>
          (!c.firmament || firmament) &&
          // Totems (L4): every Firmament shop, and Elementa's Market.
          (!c.totem || firmament || type.id === 'market') &&
          !c.horologistOnly &&
          (!c.runeItem || runesIn) &&
          // The Catalyst: Vesper's, and the Astral Exchange's (K6).
          (!c.vesperOnly || type.id === 'astral'),
      )
  const itemPool = [
    ...(type.itemKinds.includes('relic')
      ? RELICS.filter(
          (r) =>
            !ownedRelicIds.has(r.id) &&
            (!r.needsGods || knowsGods(state)) &&
            (!r.bazaarOnly || type.legendary) &&
            !r.law &&
            !r.bossPrize &&
            relicInReach(state, r) &&
            !r.horologistOnly,
        )
      : []),
    ...(type.itemKinds.includes('consumable') ? consumablePool : []),
  ]
  const weight = type.relicLuck ? vaultWeight : rarityWeight
  const itemOffers = weightedSample(itemPool, type.items, (item) => weight(item, state.round) * (item.stockWeight ?? 1)).map((item) => ({
    kind: item.kind,
    id: item.id,
  }))
  itemOffers.push(...lawOffer(state, type))

  const unlockedFusions = fusionsUnlockedBy(state.ownedElementsEver).filter(
    (id) => id !== QUADRA_FUSION_ID || knowsAether(state),
  )
  // The Firmament still sells every die from Elementa, plus its six base
  // elements (K1) and the Celestial dice (I3). The Mythic dice are forged
  // now, never sold (K1).
  const cosmic = firmament ? COSMIC_BASE_IDS : []
  const celestials = firmament ? CELESTIAL_DIE_IDS.filter((id) => !holdsKind(state.dice, id)) : []
  const asOffer = (id) => ({ id, rarity: rarityForElement(id), stockWeight: ELEMENTS[id].stockWeight ?? 1, minRound: ELEMENTS[id].minRound })
  // Poker dice (O3): Elementa's Markets and every Firmament shop.
  const poker = firmament || type.id === 'market' ? POKER_DIE_IDS.filter((id) => id !== 'joker' || poolHoldsFewJokers(state)) : []
  // Realm 3 (R3, R4): the Abstract elements in its shops, the number dice only in its Markets and legendary shop.
  const abstract = state.realm3 ? ABSTRACT_BASE_IDS : []
  const numbers = state.realm3 && ['market', 'astral'].includes(type.id) ? NUMBER_DICE_IDS : []
  const allBuyable = [...PURE_ELEMENT_IDS, ...unlockedFusions, ...ARCANE_DIE_IDS, ...cosmic, ...celestials, ...poker, ...abstract, ...numbers].map(asOffer)
  const dieOfferCount = Math.min(type.dice, allBuyable.length)
  const luckyRound = state.round + (type.legendary ? 3 : 0)
  const dieWeight = (item) => rarityWeight(item, luckyRound) * item.stockWeight
  // The Astral Exchange always has a Celestial die on its shelf (I3).
  const guaranteed =
    type.celestial && celestials.length && dieOfferCount > 0 ? weightedSample(celestials.map(asOffer), 1, () => 1) : []
  const buyableElements = [
    ...guaranteed,
    ...weightedSample(
      allBuyable.filter((o) => !guaranteed.some((g) => g.id === o.id)),
      dieOfferCount - guaranteed.length,
      dieWeight,
    ),
  ].map((item) => item.id)
  return finishStock(state, itemOffers, buyableElements, luckyRound)
}

// Each die on offer has its own size, most often a d3; a Mythic die arrives
// as a d6. In the Firmament an offer now and then comes with Warp (H3).
// Laws (O2) are on the shelf of the Vault, the Aether Bazaar, the Astral
// Exchange and Seren's Observatory: one a visit (Default), never the one you
// already carry.
/** Two Laws to choose from after a Warden or a round-10 boss (O2). */
function pickRewardLaws(state) {
  const laws = lawsAvailable(state)
  const out = []
  while (out.length < 2 && laws.length) out.push(laws.splice(Math.floor(random() * laws.length), 1)[0].id)
  return out
}

const LAW_SHOPS = ['vault', 'bazaar', 'astral', 'observatory']
const lawsAvailable = (state) => RELICS.filter((r) => r.law && r.id !== state.law?.id)
function lawOffer(state, type) {
  if (!LAW_SHOPS.includes(type.id)) return []
  const laws = lawsAvailable(state)
  return laws.length ? [{ kind: 'relic', id: randomOf(laws).id }] : []
}

/**
 * The size a die of v0.8.3 arrives in (N6): drawn from one tier below to one
 * above the median tier of your pool, instead of the round's weights. Capped
 * at d20 in Elementa and at d100 past the door.
 */
function arrivalSize(state, elementId) {
  const index = (d) => Math.max(0, DICE_TIERS.findIndex((t) => t.id === d.tierId))
  const sorted = withoutTemps(state.dice).filter((d) => !isPokerId(d.elementId)).map(index).sort((a, b) => a - b)
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
  const cap = DICE_TIERS.length - 1 - (canGrowBig(elementId) ? 0 : DICE_TIERS.length - 1 - DICE_TIERS.findIndex((t) => t.id === 'd20'))
  const lo = Math.max(0, Math.min(median - 1, cap))
  const hi = Math.min(cap, median + 1)
  return DICE_TIERS[lo + Math.floor(random() * (hi - lo + 1))].id
}

/** A size's price premium (K1 sizes, then 1.5 Shards a side past d20). */
function sizePremium(sizeId) {
  const known = SHOP_DIE_SIZES.find((x) => x.id === sizeId)
  return known ? known.premium : Math.round((tierById(sizeId)?.sides ?? 0) * 1.5)
}

const poolHoldsFewJokers = (state) => state.dice.filter((d) => d.elementId === 'joker').length < JOKER_CAP

function finishStock(state, itemOffers, buyableElements, luckyRound) {
  const firmament = state.realm === 'firmament'
  const dieSizes = Object.fromEntries(
    buyableElements.map((id) => [
      id,
      isMythic(id)
        ? STARTING_TIER
        : isPokerId(id)
          ? id
          : firmament && NEW_DICE_IDS.includes(id)
          ? arrivalSize(state, id)
          : weightedSample(SHOP_DIE_SIZES, 1, (size) => (luckyRound >= size.from ? size.weight : 0))[0]?.id ?? SHOP_DIE_TIER,
    ]),
  )
  const dieWarp = firmament
    ? Object.fromEntries(buyableElements.map((id) => [id, id === 'space' || random() < WARP_OFFER_CHANCE]).filter(([, w]) => w))
    : {}
  return { itemOffers, buyableElements, dieSizes, dieWarp }
}

/**
 * The Horologist's six offers (I2): Chrono and one of Pulsar, Zenith and
 * Kairos; three of his six consumables; one of his two relics (none if you
 * own both). All drawn with the run's seeded generator.
 */
function rollHorologistStock(state, ownedRelicIds) {
  const other = randomOf(HOROLOGIST_STOCK.dice)
  const consumables = weightedSample(HOROLOGIST_STOCK.consumables, 3, () => 1).map((id) => ({ kind: 'consumable', id }))
  const relicIds = HOROLOGIST_STOCK.relics.filter((id) => !ownedRelicIds.has(id))
  const relic = relicIds.length ? [{ kind: 'relic', id: randomOf(relicIds) }] : []
  return finishStock(state, [...consumables, ...relic], [CHRONO_ID, other], state.round)
}

// Relics a pact or prize may hand out: never the god relics before the god
// recipes are known, never the Bazaar's Pantheon.
function relicGrantable(state, r) {
  return (!r.needsGods || knowsGods(state)) && !r.bazaarOnly && !r.horologistOnly && !r.bossPrize && relicInReach(state, r)
}

// The multiplying relics (M3) wait for round 15, and the Legendary two are
// Firmament only.
function relicInReach(state, r) {
  return state.round >= (r.minRound || 0) && (!r.firmament || state.realm === 'firmament')
}

function rollDeal(state, id) {
  if (id === 'blood_relic') {
    const owned = new Set(state.relics.map((r) => r.id))
    const pick = (rarity) => RELICS.filter((r) => r.rarity === rarity && !owned.has(r.id) && relicGrantable(state, r))
    const pool = pick(RARITY.LEGENDARY).length ? pick(RARITY.LEGENDARY) : pick(RARITY.EPIC)
    return pool.length ? { id, relicId: randomOf(pool).id } : null
  }
  if (id === 'soul_die') return { id, elementId: randomOf(TRIPLE_FUSION_IDS) }
  if (id === 'loan') return { id, shards: 10 + state.round * 2 }
  if (id === 'broken_vow') {
    const relic = rollDeal(state, 'blood_relic')
    return relic?.relicId && relicById(relic.relicId).rarity === RARITY.LEGENDARY ? { id, relicId: relic.relicId } : null
  }
  return { id }
}

// Shards Tobb hands over at the safety camp: 3 + half the round.
function campPayout(round) {
  return 3 + Math.floor(round / 2)
}

/**
 * The keeper's sigil die on the shelf (P3): Aeris's Shrine, Nix's Black Market
 * and Tobb's Market sell their set's die, about one visit in four, once the
 * file has unlocked it and you hold none of that set. No random draw is spent
 * for a file with nothing unlocked, so old seeds replay the same.
 */
function sigilOfferFor(state, type) {
  const set = SIGIL_SET_IDS.find((k) => SIGIL_SETS[k].shop === type.id)
  if (!set) return null
  const unlocked = (state.sigils || []).filter((id) => sigilSetOf(id) === set)
  if (unlocked.length === 0 || state.dice.some((d) => sigilSetOf(d.elementId) === set)) return null
  if (random() >= SIGIL_OFFER_CHANCE) return null
  return unlocked[Math.floor(random() * unlocked.length)]
}

const sigilCost = (elementId, relics, shop) => applyDiscount(isGreaterSigil(elementId) ? SIGIL_GREATER_PRICE : SIGIL_PRICE, relics, shopCut(shop, 'die'))

function buildShopOffers(state, typeId = 'market') {
  const type = shopTypeById(typeId)
  const stock = rollShopStock(state, type)
  // Nix never offers a deal you could not pay (carlos, v0.7 notes): only
  // pacts that are payable right now go on the table, and the pool is drawn
  // from the whole list so a short offer is rare.
  const deals = type.deals
    ? weightedSample(DEALS, DEALS.length, () => 1)
        .map((d) => rollDeal(state, d.id))
        .filter((d) => d && dealAvailable(state, d))
        .slice(0, type.deals)
    : []
  const blessings = type.blessings ? weightedSample(BLESSINGS, type.blessings, () => 1).map((b) => b.id) : []
  // A Black Market also offers one betrayal pact when you qualify (B3).
  const eligible = type.id === 'blackmarket' ? BETRAYALS.filter((b) => betrayalEligible(state, b.id)) : []
  const betrayal = eligible.length ? rollDeal(state, randomOf(eligible).id) : null
  return {
    type: type.id,
    ...stock,
    rerollShopUses: 0,
    sigilOffer: sigilOfferFor(state, type),
    forgeOpen: Boolean(type.forge),
    deals,
    betrayal,
    dealTaken: false,
    blessings,
    blessingTaken: false,
    // Vesper (K5) adds a Catalyst to a Firmament Forge's shelf.
    ...(type.id === 'forge' && state.realm === 'firmament'
      ? { itemOffers: [...stock.itemOffers, { kind: 'consumable', id: 'catalyst' }] }
      : {}),
    // Atlas (H6): the services used this visit. Mote: its secret stock.
    ...(type.services ? { servicesUsed: [] } : {}),
    ...(type.pantry ? { moteTier: moteTier(state.moteFed), moteStock: moteStockFor(state, 0, moteTier(state.moteFed)) } : {}),
  }
}

// --- Mote's Pantry (EXPANSION.md H6). ---

/** How many stages of Mote's secret stock its appetite has opened. */
function moteTier(fed = 0) {
  return MOTE_STAGES.filter((n) => fed >= n).length
}

/**
 * The secret stock for the stages from `from` to `to` (Claude's default):
 * at 40, a Hollow Pact and a random die carrying Warp; at 120, a Warp Seal
 * and 2 Stardust (K2; it used to be a Mythic die, which is forged now).
 */
function moteStockFor(state, from, to) {
  const out = []
  if (from < 1 && to >= 1) {
    out.push({ kind: 'pact', id: 'hollow_pact' })
    const unlocked = fusionsUnlockedBy(state.ownedElementsEver).filter((id) => id !== QUADRA_FUSION_ID || knowsAether(state))
    out.push({ kind: 'die', elementId: randomOf([...PURE_ELEMENT_IDS, ...unlocked, ...ARCANE_DIE_IDS]) })
  }
  if (from < 2 && to >= 2) {
    out.push({ kind: 'consumable', id: 'warp_seal' })
    out.push({ kind: 'stardust', amount: 2 })
  }
  return out
}

/** What one of Mote's offers costs. Its dice are d6 and carry Warp (+12). */
function moteOfferCost(state, offer) {
  if (offer.kind === 'pact') return MOTE_PACT_PRICE
  if (offer.kind === 'stardust') return STARDUST_PRICE
  if (offer.kind === 'consumable') return consumableCost(consumableById(offer.id), state.relics, state.shop)
  return newDieCost(offer.elementId, state.dice, state.relics, null, STARTING_TIER) + WARP_PREMIUM
}

/**
 * A sale in the Pantry: Mote pays 150% (rounded up) and eats the item's sell
 * value; a new stage opens more of its stock on the spot.
 */
function feedMote(state, value) {
  const fed = (state.moteFed || 0) + value
  const before = state.shop.moteTier || 0
  const tier = moteTier(fed)
  const stock = tier > before ? [...(state.shop.moteStock || []), ...moteStockFor(state, before, tier)] : state.shop.moteStock
  return { ...state, moteFed: fed, shop: { ...state.shop, moteTier: tier, moteStock: stock } }
}

const motePays = (value) => Math.ceil(value * MOTE_RATE)

function availableRerolls(state) {
  const fx = relicEffects(effectiveRelics(state))
  const uncapped =
    STARTING_REROLLS -
    (state.difficulty.rerollPenalty || 0) +
    state.permanentRerollBonus +
    state.rerollsBonusThisRound +
    (fx.overclockRerollBonus || 0) +
    zenithRerolls(state)
  const cap = fx.maxRerollsOverride != null ? Math.min(uncapped, fx.maxRerollsOverride) : uncapped
  // The Hourglass's rerolls (I2) come on top of everything.
  return cap - state.rerollsUsed + (state.freeRerolls || 0)
}

/**
 * Zenith (I1): +1 reroll every round, +1 more from round 20 and again from
 * 25. Moment (K1) and Continuum (K4): +1 every round.
 */
function zenithRerolls(state) {
  // Zenith, Time, the Continuum and the Anomaly each give +2 (N2 to N4); the
  // Zenith adds one more from round 20 and again from round 25.
  const each = 2 + (state.round >= 20 ? 1 : 0) + (state.round >= 25 ? 1 : 0)
  const acting = actingElementIds(state.dice)
  const steady = acting.filter((id) => [FLAGS.MOMENT, FLAGS.CONTINUUM, FLAGS.ANOMALY].some((f) => elementHasFlag(id, f))).length
  return acting.filter((id) => id === 'zenith').length * each + steady * 2
}

// Boss rewards (CHOOSE_BOSS_REWARD) can widen these for the rest of a run.
function relicCapFor(state) {
  return (state.difficulty?.relicCap ?? 5) + (state.relicCapBonus || 0)
}

function consumableCapFor(state) {
  return MAX_CONSUMABLES + (state.consumableCapBonus || 0)
}

// Takes the run state (for the boss-reward bonus); a bare difficulty object
// still works for callers that only know the difficulty.
function maxDiceFor(stateOrDifficulty) {
  const difficulty = stateOrDifficulty?.difficulty ?? stateOrDifficulty
  const bonus = stateOrDifficulty?.difficulty ? stateOrDifficulty.diceCapBonus || 0 : 0
  return (difficulty?.maxDiceOverride ?? MAX_DICE) + bonus
}

// --- Two entry points into a game session: the title screen (nothing to
// play yet, but the player has chosen a deck/difficulty) and an actual run
// (dice rolled, round 1, full economy reset). ---

function baseTitleState() {
  return {
    phase: 'menu',
    round: 0,
    threshold: 0,
    dice: [],
    rerollsUsed: 0,
    rerollsBonusThisRound: 0,
    freezeChargesUsed: 0,
    permanentRerollBonus: 0,
    shards: 0,
    difficulty: difficultyById('ember'),
    // Which starting loadout this run began with, so a win can mark it
    // beaten in the player profile (utils/profile.js) and unlock the next.
    deckId: null,
    lives: 3,
    maxLives: 3,
    bossModifier: null,
    secondWindUsed: false,
    relics: [],
    consumables: [],
    ownedElementsEver: [],
    shop: null,
    lastResult: null,
    // Which save slot (0-2, or null) the current session is tied to. Set
    // when a slot is chosen (NEW_RUN_SETUP/LOAD_RUN) so ElementaGame knows
    // where to autosave, and cleared again on RETURN_HOME.
    activeSlot: null,
    // Only meaningful during the 'runPreview' phase: the actual gameplay
    // phase a loaded save should drop into once RESUME_RUN fires.
    resumePhase: null,
    // Run seed (8 characters) and the generator state (engine/rng.js).
    seed: null,
    rngState: null,
    // Endless mode: keep going past the final round after a win.
    endless: false,
    // Permanent run upgrades picked after beating a boss.
    relicCapBonus: 0,
    consumableCapBonus: 0,
    diceCapBonus: 0,
    // The Road of shops (engine/map.js), generated from the seed.
    map: null,
    // Nix's Loan: the next round's target is multiplied by this once.
    nextTargetMult: 1,
    // Every Shrine blessing and Black Market deal taken this run (with the
    // round), for the Boons panel and the run summary.
    boons: [],
    // What this run met: bosses faced and shops visited, for the summary.
    chronicle: { bosses: [], shops: [] },
    // Extra rerolls granted for the next round only (Lucky Charm).
    nextRoundRerollBonus: 0,
    // The Horologist's wares (I2): the Metronome's rounds, the Cuckoo Clock's.
    metronome: null,
    cuckooRound: null,
    // Constellations (J1): { [reaction or set id]: level } for the run.
    constellations: {},
    // Highest single cast this run, for Run Info and achievements.
    bestCast: 0,
    // Secret recipes this save file knows (copied from the profile).
    recipes: [],
    // Family abilities and relics with a per-round charge (E8).
    driftsUsed: 0,
    lockedThisRound: false,
    // Totems (L4): { fire, water, earth, air } levels for the run.
    totems: { fire: 0, water: 0, earth: 0, air: 0 },
    // The Law slot (O2): one Law, apart from the relic slots; and the Laws on offer after a boss.
    law: null,
    rewardLaws: [],
    // Fishing with the Eye (P5): offenses so far this run.
    eyeStrikes: 0,
    // Realm 3 (R1): whether the run has walked through the second door, and which Rewriter set; the Rewriters beaten on this file;
    // Mult kept from Infinity's explosions; rerolls made this run for the Rolling Joke.
    realm3: false,
    realm3Set: null,
    rewriters: [],
    infMult: 0,
    rerollsTotal: 0,
    gustUsed: false,
    explosionsThisRound: 0,
    // The Accord (B1): a hidden lean, + toward the Primordial, - toward
    // the Split. Never shown as a number.
    accord: 0,
    // Allegiance (B3): Nix pacts taken (betrayals included), and whether
    // Aeris is gone for the rest of the run (Bound Tongue, Severed Grace).
    nixPacts: 0,
    aerisBanned: false,
    // Pacts and blessings waiting on the next clear: 'double' or 'gamble'.
    clearEffects: [],
    // Blessing of Plenty: the next shop's offers can't be rerolled.
    plentyLock: false,
    // Next-round blessings (Ember-ward, Communion), active for one round.
    nextRoundBuffs: {},
    roundBuffs: {},
    // Blessing of Clarity: extra rows of the Road, and stop changes left.
    roadSight: 0,
    reroutes: 0,
    // Hollow Crown: relics sell for 0. Severed Grace: permanent Mult.
    relicsSellZero: false,
    permanentMult: 0,
    // Pacts that change the next boss: 'long_night', 'bound_tongue'.
    nextBossEffects: [],
    // The Long Night's second twist for the current boss round, and its prize.
    extraTwist: null,
    longNightActive: false,
    // The three paths (B1): locked when round 15 begins ('neutral',
    // 'split' or 'primordial'), the gauntlet's progress on the Primordial
    // path ({ stage: 0..3 }), the pool to restore after Primordial Unbound
    // fuses your dice, and the ending a win reached.
    path: null,
    gauntlet: null,
    roundPool: null,
    ending: null,
    // Bumped whenever a fresh roll of a round starts (a new round, a retry,
    // a gauntlet stage), so the table can start clean.
    roundSeq: 0,
    // The Firmament (EXPANSION.md H1): which realm the run is in, and which
    // set of three Wardens it faces (1 or 2).
    realm: 'elementa',
    firmamentSet: null,
    // Copied from the save file (H8) when a run starts or loads: endings
    // seen (the doors), Mythic dice unlocked, Wardens beaten, Mote's meal.
    endingsSeen: [],
    mythics: [],
    // Stardust (K2): dropped by bosses, spent forging a Mythic die.
    stardust: 0,
    wardens: [],
    moteFed: 0,
  }
}

// What a run needs to know about its save file (H8). `file` is the
// profile, or an object with the same fields.
function fileFields(file = {}) {
  return {
    endingsSeen: [...(file.endings || [])],
    mythics: [...(file.mythics || [])],
    wardens: [...(file.wardens || [])],
    moteFed: file.mote?.fed || 0,
    // The sigil dice this file has unlocked (P3).
    sigils: [...(file.sigils || [])],
    rewriters: [...(file.rewriters || [])],
  }
}

// Runes moved onto faces (EXPANSION.md K3b): an old `die.rune` sits on the
// die's top face. A run from before Stardust has none.
function migrateRuns(save) {
  const fix = (list) => (Array.isArray(list) ? list.map(migrateDieRunes) : list)
  return {
    ...save,
    stardust: save.stardust ?? 0,
    dice: fix(save.dice || []),
    roundPool: fix(save.roundPool),
    lastReroll: save.lastReroll ? { ...save.lastReroll, dice: fix(save.lastReroll.dice) } : save.lastReroll,
  }
}

// Chrono became Kairos (EXPANSION.md H4). A save from before the Firmament
// (it has no realm) can only hold the old one.
function renameChrono(save) {
  if (save.realm) return save
  const id = (x) => (x === 'chrono' ? 'kairos' : x)
  const shop = save.shop
    ? {
        ...save.shop,
        buyableElements: (save.shop.buyableElements || []).map(id),
        dieSizes: Object.fromEntries(Object.entries(save.shop.dieSizes || {}).map(([k, v]) => [id(k), v])),
      }
    : save.shop
  return {
    ...save,
    realm: 'elementa',
    dice: (save.dice || []).map((d) => ({ ...d, elementId: id(d.elementId) })),
    roundPool: save.roundPool ? save.roundPool.map((d) => ({ ...d, elementId: id(d.elementId) })) : save.roundPool,
    ownedElementsEver: (save.ownedElementsEver || []).map(id),
    shop,
  }
}

function startNewRun(deckId, difficultyId, activeSlot = null, seedInput = '', recipes = [], file = {}) {
  // Seed first, so every roll below is reproducible from it.
  const seed = cleanSeed(seedInput) || randomSeed()
  setRngState(seedToState(seed))
  // The Road first, so its layout depends on the seed alone.
  const map = newMap()
  const deck = deckById(deckId)
  const difficulty = difficultyById(difficultyId)
  const dice = deck.dice.map((elementId) => makeDie(elementId))
  const relics = []
  const round = 1
  // Cataclysm's "every round is a boss" must apply from round 1 too, not
  // just from NEXT_ROUND onward.
  const bossModifier = isBossRound(round, difficulty) ? pickBossModifier({ dice, relics }, round) : null
  const rolled = applyBossRoundStart(rollFreshRound(dice, bossModifier ? [bossModifier] : relics), bossModifier)
  return {
    ...baseTitleState(),
    phase: 'rolling',
    activeSlot,
    deckId: deck.id,
    round,
    difficulty,
    lives: difficulty.lives,
    maxLives: difficulty.lives,
    bossModifier,
    threshold: thresholdForRound(round, difficulty),
    dice: rolled,
    ...freshRoundCounters(rolled),
    relics,
    ownedElementsEver: [...new Set(deck.dice)],
    chronicle: noteBoss(null, bossModifier),
    map,
    seed,
    recipes: [...recipes],
    ...fileFields(file),
    rngState: getRngState(),
  }
}

// Shared by NEXT_ROUND and CONTINUE_ENDLESS: roll into `round`. Walking
// into round 15 locks the path and sets up its battle (B1).
function enterRound(state, round) {
  const next = enterRoundBase(state, round)
  return round === WIN_ROUND && !state.endless ? enterFinalBattle(next) : next
}

function enterRoundBase(state, round) {
  const prophecy = state.map?.prophecy
  const foretold = prophecy?.round === round ? revalidateBoss(state, prophecy.boss, round) : null
  let bossModifier = isBossRound(round, state.difficulty) ? foretold ?? pickBossModifier(state, round) : null
  // Pacts aimed at the next boss (B3). Bound Tongue never touches Primordial.
  let nextBossEffects = state.nextBossEffects || []
  let extraTwist = null
  if (bossModifier) {
    if (nextBossEffects.includes('bound_tongue') && !isFixedBoss(state, round)) {
      bossModifier = bossById('ermal')
      nextBossEffects = nextBossEffects.filter((e) => e !== 'bound_tongue')
    }
    if (nextBossEffects.includes('long_night')) {
      extraTwist = secondTwist(state, bossModifier)
      nextBossEffects = nextBossEffects.filter((e) => e !== 'long_night')
    }
  }
  const twistRelics = bossModifier ? effectiveRelics({ relics: state.relics, bossModifier, extraTwist }) : state.relics
  const dice = applyTwistsRoundStart(rollFreshRound(state.dice, twistRelics), bossModifier, extraTwist)
  return {
    ...state,
    phase: 'rolling',
    round,
    bossModifier,
    extraTwist,
    longNightActive: Boolean(extraTwist),
    nextBossEffects,
    // Next-round blessings take effect now, for this round (and its retries).
    roundBuffs: state.nextRoundBuffs || {},
    nextRoundBuffs: {},
    roundSeq: (state.roundSeq || 0) + 1,
    map: prophecy?.round === round ? { ...state.map, prophecy: null } : state.map,
    chronicle: noteBoss(state.chronicle, bossModifier),
    // A Warden's target is the round's own times 1, 1.1 or 1.25 (H2); a Rewriter's is calibrated (R2).
    threshold: Math.round(
      thresholdForRound(round, state.difficulty) *
        (state.nextTargetMult || 1) *
        (bossModifier?.tier === 4 ? WARDEN_TARGET[round] ?? 1 : bossModifier?.tier === 5 ? REWRITER_TARGET[bossModifier.id] ?? 1 : 1),
    ),
    nextTargetMult: 1,
    dice,
    ...freshRoundCounters(dice),
    rerollsUsed: 0,
    rerollsBonusThisRound: state.nextRoundRerollBonus || 0,
    nextRoundRerollBonus: 0,
    freezeChargesUsed: 0,
    shop: null,
    lastResult: null,
  }
}

/**
 * The Wardens' twists after every reroll (EXPANSION.md H2), from the boss
 * effects `fx`. `rerolled` is the ids of the dice that just rolled.
 *   The Umbra swallows one of them for the round: it scores 0 and stays out.
 *   The Maelstrom turns each of them into a random pure element for the
 *   round, keeping its size (restored after the cast).
 *   The Expanse shuffles the order of the whole row.
 */
function wardenAfterReroll(dice, rerolled, fx) {
  let out = dice
  if (fx.swallowOnReroll) {
    const prey = out.filter((d) => rerolled.has(d.id) && !d.swallowed)
    if (prey.length) {
      const id = randomOf(prey).id
      out = out.map((d) => (d.id === id ? { ...d, swallowed: true, held: true, locked: true, lockedVia: 'swallow' } : d))
    }
  }
  // One die per reroll, not all of them (v0.7.1 playtest): a seeded pick among
  // the dice that just rolled.
  if (fx.maelstrom) {
    const prey = out.filter((d) => rerolled.has(d.id) && !d.swallowed)
    if (prey.length) {
      const id = randomOf(prey).id
      out = out.map((d) =>
        d.id === id ? { ...d, maelstromFrom: d.maelstromFrom ?? d.elementId, elementId: randomOf(PURE_ELEMENT_IDS), chaosForm: null } : d,
      )
    }
  }
  if (fx.shuffleOnReroll) {
    out = [...out]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
  }
  return out
}

/**
 * A rune on a die's number (K3b). Without a Gem Socket a rune already on
 * that number is replaced; with one, up to two stack there.
 */
function inscribe(die, runeId, face) {
  const runes = runesOf(die)
  const here = runes.filter((r) => r.face === face)
  const keep = here.length < faceCap(die) ? runes : runes.filter((r) => r.face !== face || r !== here[0])
  return { ...die, rune: undefined, runes: [...keep, { id: runeId, face }] }
}

// Puts the table back as it was before the last reroll, and refunds it.
function undoReroll(state) {
  const before = state.lastReroll
  return {
    ...state,
    dice: before.dice.map((d) => ({ ...d, rollId: random() })),
    shards: before.shards,
    rerollsUsed: before.rerollsUsed ?? Math.max(0, state.rerollsUsed - 1),
    freeRerolls: before.freeRerolls ?? state.freeRerolls ?? 0,
    rerollsMade: before.rerollsMade ?? Math.max(0, (state.rerollsMade || 0) - 1),
    rerollsBonusThisRound: before.rerollsBonusThisRound,
    explosionsThisRound: before.explosionsThisRound,
    bossModifier: before.bossModifier,
    lastReroll: null,
    chronoLoops: 0,
  }
}

// Try the same round again with fresh dice (after a miss, or leaving the
// camp). A Lucky Charm or Blessing of Tide bought at camp counts here.
function retryRound(state) {
  const dice = applyTwistsRoundStart(rollFreshRound(state.dice, effectiveRelics(state)), state.bossModifier, state.extraTwist)
  return {
    ...state,
    phase: 'rolling',
    roundSeq: (state.roundSeq || 0) + 1,
    // Primordial Unbound gives back your pool after every attempt.
    roundPool: state.bossModifier?.variant === 'unbound' ? dice : state.roundPool,
    dice,
    ...freshRoundCounters(dice),
    rerollsUsed: 0,
    rerollsBonusThisRound: state.nextRoundRerollBonus || 0,
    nextRoundRerollBonus: 0,
    freezeChargesUsed: 0,
    shop: null,
    lastResult: null,
  }
}

// A foretold boss (Shrine prophecy) was chosen rounds ago: re-check its
// per-run target against the pool you have now, so it can never become
// unwinnable (Null Zone on a mono pool) or point at a relic you sold.
function revalidateBoss(state, boss, round) {
  if (!boss) return null
  if (boss.id === 'null_zone') {
    const owned = [...new Set(state.dice.map((d) => d.elementId))]
    if (owned.length < 2) return pickBossModifier(state, round)
    if (owned.includes(boss.effects.bannedElementId)) return boss
    return { ...boss, effects: { ...boss.effects, bannedElementId: randomOf(owned) } }
  }
  if (boss.id === 'silence') {
    if (!state.relics.length) return pickBossModifier(state, round)
    if (state.relics.some((r) => r.id === boss.effects.sealedRelicId)) return boss
    return { ...boss, effects: { ...boss.effects, sealedRelicId: randomOf(state.relics).id } }
  }
  return boss
}

function noteBoss(chronicle, boss) {
  const c = chronicle ?? { bosses: [], shops: [] }
  if (!boss || c.bosses.includes(boss.id)) return c
  return { ...c, bosses: [...c.bosses, boss.id] }
}

function addBoon(state, id, source, detail = null) {
  return [...(state.boons || []), { id, source, round: state.round, detail }]
}

/** A round's target as it will be when you get there (Almanac, I2). */
function almanacTarget(state, round, next) {
  const warden = state.realm === 'firmament' && (rewriterAt(state, round) || wardenFor(state.path, state.firmamentSet, round))
  const bossMult = warden ? (warden.tier === 5 ? REWRITER_TARGET[warden.id] ?? 1 : WARDEN_TARGET[round] ?? 1) : 1
  return Math.round(thresholdForRound(round, state.difficulty) * (next ? state.nextTargetMult || 1 : 1) * bossMult)
}

function nextBossRound(state) {
  for (let r = state.round + 1; r < state.round + 40; r++) {
    if (isBossRound(r, state.difficulty)) return r
  }
  return null
}

// What a boss reward does. The player gets both: one die grows a size, and
// one slot of their choice (dice, relics or consumables).
export const BOSS_REWARDS = ['dice', 'relics', 'consumables']

function applyBossReward(state, { dieId, slot }) {
  let dice = state.dice
  const die = state.dice.find((d) => d.id === dieId)
  const next = die && growTier(state, die)
  if (next) dice = state.dice.map((d) => (d.id === die.id ? { ...d, tierId: next.id, sides: next.sides } : d))
  return {
    ...state,
    dice,
    diceCapBonus: (state.diceCapBonus || 0) + (slot === 'dice' ? 1 : 0),
    relicCapBonus: (state.relicCapBonus || 0) + (slot === 'relics' ? 1 : 0),
    consumableCapBonus: (state.consumableCapBonus || 0) + (slot === 'consumables' ? 1 : 0),
  }
}

function giveConsumable(state, def) {
  return [...state.consumables, { ...def, instanceId: makeId() }]
}

const SHOP_ONLY_CONSUMABLES = ['spark', 'loom']

// What Chisel does to a die (EXPANSION.md P2), or null when it can't: each
// size splits into two of the next size down (d20 into two d10, d10 into two
// d5, d6 into two d3), a d5 chips into a d3 and a Transmute, and a d3 is
// left alone.
// A die past d20 splits one size down (M2): a d30 into two d20, a d40 into two d30.
const SPLITS = { d100: 'd90', d90: 'd80', d80: 'd70', d70: 'd60', d60: 'd50', d50: 'd40', d40: 'd30', d30: 'd20', d20: 'd10', d10: 'd5', d6: 'd3' }
export function splitPlan(die) {
  if (SPLITS[die.tierId]) return { kind: 'two', tierId: SPLITS[die.tierId] }
  if (die.tierId === 'd5') return { kind: 'chip', tierId: 'd3' }
  return null
}

// The pure element a chipped die leaves a Transmute of: its own, or one of
// its parents, or any pure element for dice with none.
function transmuteTargetFor(elementId) {
  const def = ELEMENTS[elementId]
  if (def.tier === 'pure') return elementId
  return randomOf(def.parents.length ? def.parents : PURE_ELEMENT_IDS)
}

/**
 * Whether a die-targeting consumable can be applied to this die right now.
 * The reducer ignores an impossible one; the UI asks first, so it can say no
 * instead of silently spending the click.
 */
export function consumableTargetOk(state, item, die) {
  if (!die || isTempDie(die)) return false
  switch (item.type === 'downgrade' ? 'split' : item.type) {
    case 'upgrade':
      return Boolean(growTier(state, die))
    case 'clone':
      return fitsPool(state, [...state.dice, die]) && !uncopyable(die)
    case 'infuse':
      return ELEMENTS[die.elementId].tier === 'pure'
    case 'split': {
      const plan = splitPlan(die)
      if (uncopyable(die)) return false
      return Boolean(plan) && (plan.kind === 'chip' || fitsPool(state, [...state.dice, die]))
    }
    // Runes (J3, K3b): any die but a Mythic one, Entropy included. Which
    // number is chosen on the Inscribe screen.
    case 'rune':
      return !isMythic(die.elementId)
    // Graft (K6): the first die picked must carry a rune.
    case 'graft':
      return runesOf(die).length > 0
    case 'weights':
      return !die.weights
    case 'socket':
      return !die.socket && !isMythic(die.elementId)
    // Solvent (K6): only a die with something to strip.
    case 'solvent':
      return Boolean(die.bonus || die.weights || runesOf(die).length)
    // Warp Seal (H3): any die without Warp, under the Warp cap.
    case 'warp':
      return !isWarp(die) && warpCount(state.dice) < WARP_CAP
    default:
      return true
  }
}

function brewCost(state) {
  return applyDiscount(4, state.relics, shopCut(state.shop, 'brew'))
}

// Whether a Black Market deal can be paid right now (never lethal, never
// past a cap).
function dealAvailable(state, deal) {
  if (deal.id === 'blood_relic') return state.lives >= 2 && state.relics.length < relicCapFor(state)
  if (deal.id === 'soul_die') return state.maxLives >= 2 && poolSize(state.dice) < maxDiceFor(state)
  if (deal.id === 'hollow_pact') return state.relics.length < relicCapFor(state)
  if (deal.id === 'shadow_twin') {
    const best = bestDie(state.dice)
    return Boolean(best) && fitsPool(state, [...state.dice, best])
  }
  if (deal.id === 'long_night') return Boolean(nextBossRound(state)) && !state.nextBossEffects?.includes('long_night')
  // Bound Tongue can't replace Primordial, so it needs a lesser boss ahead.
  if (deal.id === 'bound_tongue') {
    const r = nextBossRound(state)
    return Boolean(r) && !isFixedBoss(state, r) && !state.nextBossEffects?.includes('bound_tongue')
  }
  if (deal.id === 'gamble') return !state.clearEffects?.includes('gamble')
  if (isBetrayal(deal.id)) {
    if (deal.id === 'broken_vow' && state.relics.length >= relicCapFor(state)) return false
    return betrayalEligible(state, deal.id)
  }
  return true
}

function blessingAvailable(state, id) {
  if (id === 'kindle') return state.dice.some((d) => growTier(state, d))
  // Two Nix pacts: Aeris may take a consumable, freeing the slot it needs.
  if (id === 'aether_gift') {
    const freed = aerisCost(state).kind === 'consumable' ? 1 : 0
    return state.consumables.length - freed < consumableCapFor(state)
  }
  if (id === 'grace') return state.lives < state.maxLives
  return true
}

// Moves along the Road into `round`: to the picked stop, or the only one.
// Returns null when the player still has to choose.
function travel(map, round, autoPick = false) {
  if (!map) return null
  const grown = ensureLayers(map, round + 1)
  const choices = nextChoices(grown)
  const pick =
    nodeById(grown, grown.pendingId) ?? (choices.length === 1 || autoPick ? choices[0] : null)
  if (!pick) return null
  return { ...grown, currentId: pick.id, pendingId: null, path: [...grown.path, pick.id] }
}

// A save from before the Road existed: lay one out and stand on round N.
function legacyMap(save) {
  if (!save?.round) return null
  const map = ensureLayers(newMap(), save.round + 1)
  const node = map.layers[save.round - 1].find((n) => n.type === 'market') ?? map.layers[save.round - 1][0]
  return { ...map, currentId: node.id, path: [node.id] }
}

// --- The three paths (EXPANSION.md B1, B2). ---

// What the dice in hand add to the Accord when round 15 begins (Claude's
// spec): +1 per fusion, Aether or Prism, -1 per pure die, -3 per god die.
const PRIMORDIAL_AT = 8
const SPLIT_AT = -6
const MONO_ACCORD = -3
function accordFromPool(dice) {
  const base = dice.reduce((sum, d) => {
    const def = ELEMENTS[d.elementId]
    if (def.tier === TIERS.GOD) return sum - 3
    if (def.tier === TIERS.PURE) return sum - 1
    if ([TIERS.DOUBLE, TIERS.TRIPLE, TIERS.QUADRA].includes(def.tier) || d.elementId === 'prism') return sum + 1
    return sum
  }, 0)
  // A pool that stays in one family (every die shares it) leans to the Split
  // (v0.7 notes: the Split should be reachable, if hard).
  const mono =
    dice.length >= 4 && ['fire', 'water', 'earth', 'air'].some((f) => dice.every((d) => inFamily(d.elementId, f)))
  return base + (mono ? MONO_ACCORD : 0)
}

// Path thresholds (v0.7 notes: Neutral was too hard to reach, so the
// Primordial's line moved from +6 to +8): +8 or more is the Primordial's,
// -6 or less the Split's (hard on purpose). Until the god recipes are
// known, always Neutral.
function pathFor(state, accord) {
  if (!knowsGods(state)) return 'neutral'
  if (accord >= PRIMORDIAL_AT) return 'primordial'
  if (accord <= SPLIT_AT) return 'split'
  return 'neutral'
}

/** The path the run would take if round 15 began now (for Pip's hint). */
function projectedPath(state) {
  return pathFor(state, (state.accord || 0) + accordFromPool(state.dice))
}

// The Primordial path's gauntlet: stage `stage` (0 to 3) of the four gods.
function trialFor(stage) {
  return GOD_TRIALS[stage]
}

function stageTarget(state, stage) {
  return Math.round(thresholdForRound(WIN_ROUND, state.difficulty) * trialFor(stage).target)
}

// Round 15 has begun: lock the path and set its battle up.
function enterFinalBattle(state) {
  const accord = (state.accord || 0) + accordFromPool(state.dice)
  const path = pathFor(state, accord)
  const base = { ...state, accord, path }
  if (path === 'split') {
    // Primordial Unbound: full strength, and a harder target.
    return {
      ...base,
      bossModifier: { ...state.bossModifier, variant: 'unbound' },
      threshold: Math.round(state.threshold * UNBOUND_TARGET),
      roundPool: state.dice,
    }
  }
  if (path === 'primordial') {
    // The Primordial lends its die (a d20, outside the dice cap), and the
    // gods who made the Split come one at a time.
    const lent = { ...makeDie(PRIMORDIAL_DIE_ID, 'd20'), absorbed: [] }
    const trial = trialFor(0)
    const dice = rollFreshRound([...state.dice, lent], effectiveRelics({ ...state, bossModifier: trial }))
    return {
      ...base,
      gauntlet: { stage: 0 },
      bossModifier: trial,
      chronicle: noteBoss(state.chronicle, trial),
      threshold: stageTarget(state, 0),
      dice,
      ...freshRoundCounters(dice),
    }
  }
  return base
}

// A god falls: the Primordial die takes its power, the next god steps up.
function advanceGauntlet(state, result) {
  const fallen = trialFor(state.gauntlet.stage).id
  const stage = state.gauntlet.stage + 1
  const trial = trialFor(stage)
  const pool = state.dice.map((d) =>
    d.elementId === PRIMORDIAL_DIE_ID ? { ...d, absorbed: [...(d.absorbed || []), fallen] } : d,
  )
  const dice = rollFreshRound(pool, effectiveRelics({ ...state, bossModifier: trial }))
  return {
    ...state,
    phase: 'rolling',
    gauntlet: { stage, fallen },
    bossModifier: trial,
    chronicle: noteBoss(state.chronicle, trial),
    threshold: stageTarget(state, stage),
    dice,
    ...freshRoundCounters(dice),
    rerollsUsed: 0,
    rerollsBonusThisRound: 0,
    freezeChargesUsed: 0,
    roundSeq: (state.roundSeq || 0) + 1,
    lastResult: { ...result, stageCleared: fallen },
  }
}

// Primordial Unbound, after every reroll: two neighboring pure dice of
// different elements become their double fusion for the rest of the
// round (a seeded pick among the pairs; nothing if there are none).
function unboundFuse(dice, relics) {
  const pairs = []
  for (let i = 0; i < dice.length - 1; i++) {
    const a = ELEMENTS[dice[i].elementId]
    const b = ELEMENTS[dice[i + 1].elementId]
    if (a.tier === TIERS.PURE && b.tier === TIERS.PURE && a.id !== b.id) pairs.push(i)
  }
  if (pairs.length === 0) return dice
  const i = randomOf(pairs)
  const [a, b] = [dice[i], dice[i + 1]]
  const fusionId = DOUBLE_FUSION_IDS.find((id) => {
    const parents = ELEMENTS[id].parents
    return parents.includes(a.elementId) && parents.includes(b.elementId)
  })
  const tier = a.sides >= b.sides ? a : b
  const fused = { ...makeDie(fusionId, tier.tierId), unbound: true }
  const rolled = { ...fused, ...rollDie(fusionId, fused.sides, relics, rollContext(fused, dice, relicEffects(relics))) }
  return [...dice.slice(0, i), rolled, ...dice.slice(i + 2)]
}

// --- Allegiance (EXPANSION.md B1, B3): the Accord, Nix's pacts, Aeris's
// blessings and what each costs the other. ---

// Accord weights (B1, Claude's spec): + toward the Primordial, - the Split.
const ACCORD = { fusion: 1, pact: 2, betrayal: 4, blessing: -2 }

function addAccord(state, key) {
  if (!key) return state
  return { ...state, accord: (state.accord || 0) + ACCORD[key] }
}

// The most recent unbroken boon with this id (for betrayals).
function liveBoon(state, id) {
  return [...(state.boons || [])].reverse().find((b) => b.id === id && !b.broken)
}

function breakBoon(state, id) {
  const target = liveBoon(state, id)
  return { ...state, boons: (state.boons || []).map((b) => (b === target ? { ...b, broken: true } : b)) }
}

function betrayalEligible(state, id) {
  if (id === 'broken_vow') return Boolean(liveBoon(state, 'gale'))
  // A foretold Primordial or Warden can't be broken (H1).
  if (id === 'unspoken_prayer') {
    const prophecy = state.map?.prophecy
    return Boolean(prophecy && !prophecy.broken && liveBoon(state, 'prophecy') && !isFixedBoss(state, prophecy.round))
  }
  // Tide pays out next round: it's still pending in the shop it was taken in.
  if (id === 'stolen_breath') return liveBoon(state, 'tide')?.round === state.round
  if (id === 'severed_grace') return (state.boons || []).some((b) => b.source === 'aeris') && !state.aerisBanned
  return false
}

/** Aeris is gone for the rest of the run: 3+ Nix pacts, or a pact that banished her. */
function aerisGone(state) {
  return (state.nixPacts || 0) >= 3 || Boolean(state.aerisBanned)
}

/**
 * What Aeris asks for a blessing (B3): free with no Nix pacts; Shards with
 * one (4 + half the round); your cheapest item with two (a consumable if
 * you have one, else your lowest-rarity relic); nothing at all with three.
 */
function aerisCost(state) {
  const pacts = state.nixPacts || 0
  if (aerisGone(state)) return { kind: 'gone' }
  if (pacts === 0) return { kind: 'free' }
  if (pacts === 1) return { kind: 'shards', amount: 4 + Math.floor(state.round / 2) }
  const byValue = (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
  const consumable = [...state.consumables].sort(byValue)[0]
  if (consumable) return { kind: 'consumable', instanceId: consumable.instanceId, id: consumable.id }
  const relic = [...state.relics].sort(byValue)[0]
  if (relic) return { kind: 'relic', id: relic.id }
  return { kind: 'none' }
}

function canPayAeris(state) {
  const cost = aerisCost(state)
  if (cost.kind === 'gone' || cost.kind === 'none') return false
  if (cost.kind === 'shards') return state.shards >= cost.amount
  return true
}

function payAeris(state) {
  const cost = aerisCost(state)
  if (cost.kind === 'shards') return { ...state, shards: state.shards - cost.amount }
  if (cost.kind === 'consumable') return { ...state, consumables: state.consumables.filter((c) => c.instanceId !== cost.instanceId) }
  if (cost.kind === 'relic') return { ...state, relics: state.relics.filter((r) => r.id !== cost.id) }
  return state
}

// Shrines on the Road ahead (B3). The Road is laid out at the start of a
// run, so pacts and blessings rewrite the stops still to come.
const isShrine = (n) => n.type === 'shrine'

function halveShrines(map, round) {
  return retypeAhead(map, round, isShrine, (_, i) => (i % 2 === 1 ? 'blackmarket' : null))
}

function banShrines(map, round) {
  return retypeAhead(map, round, isShrine, () => 'blackmarket')
}

// Blessing of Grace: no Shrine in the next two rows of the Road.
function skipShrines(map, round) {
  return retypeAhead(map, round, (n) => isShrine(n) && n.round <= round + 2, () => 'market')
}

// Walking away from a Black Market without a deal: one Market at least two
// rows ahead (within this stretch of 15) becomes a Shrine.
function inviteShrine(map, round) {
  const end = Math.ceil((round + 1) / WIN_ROUND) * WIN_ROUND
  const markets = map.layers.flat().filter((n) => n.type === 'market' && n.round >= round + 2 && n.round < end)
  if (!markets.length) return map
  const pick = randomOf(markets)
  return retypeAhead(map, round, (n) => n.id === pick.id, () => 'shrine')
}

// After the pact count changes: halve the Shrines ahead at the first, ban
// them at the third (or when a pact banished Aeris).
function settleShrines(state, before) {
  if (!state.map) return state
  if (aerisGone(state)) return { ...state, map: banShrines(state.map, state.round) }
  if (before === 0 && state.nixPacts >= 1) return { ...state, map: halveShrines(state.map, state.round) }
  return state
}

// A new legendary relic for The Long Night's prize, if one is left.
function legendaryRelicId(state) {
  const owned = new Set(state.relics.map((r) => r.id))
  const pool = RELICS.filter((r) => r.rarity === RARITY.LEGENDARY && !owned.has(r.id) && relicGrantable(state, r))
  return pool.length ? randomOf(pool).id : null
}

// The die Shadow Twin copies: the biggest, then the rarest.
function bestDie(dice) {
  const rank = (d) => d.sides * 10 + RARITY_ORDER.indexOf(rarityForElement(d.elementId))
  return [...dice].filter((d) => !uncopyable(d)).sort((a, b) => rank(b) - rank(a))[0]
}

function applyDeal(state, deal) {
  if (deal.id === 'blood_relic') return { ...state, lives: state.lives - 1, relics: [...state.relics, relicById(deal.relicId)] }
  if (deal.id === 'loan') return { ...state, shards: state.shards + deal.shards, nextTargetMult: 1.5 }
  if (deal.id === 'soul_die') {
    const maxLives = state.maxLives - 1
    const ownedElementsEver = state.ownedElementsEver.includes(deal.elementId)
      ? state.ownedElementsEver
      : [...state.ownedElementsEver, deal.elementId]
    return { ...state, maxLives, lives: Math.min(state.lives, maxLives), dice: [...state.dice, makeDie(deal.elementId)], ownedElementsEver }
  }
  if (deal.id === 'hollow_pact') {
    return { ...state, permanentRerollBonus: state.permanentRerollBonus + 2, relicCapBonus: (state.relicCapBonus || 0) - 1 }
  }
  if (deal.id === 'gamble') return { ...state, clearEffects: [...(state.clearEffects || []), 'gamble'] }
  if (deal.id === 'hollow_crown') return { ...state, relicCapBonus: (state.relicCapBonus || 0) + 1, relicsSellZero: true }
  if (deal.id === 'shadow_twin') {
    const best = bestDie(state.dice)
    const twin = { ...best, id: makeId(), held: false, locked: false, lockedVia: null, fizzleUpTo: 2, rollId: random() }
    if (!fitsPool(state, [...state.dice, twin])) return state
    return { ...state, dice: [...state.dice, twin], shop: { ...state.shop, twinOf: best.id } }
  }
  if (deal.id === 'long_night') return { ...state, nextBossEffects: [...(state.nextBossEffects || []), 'long_night'] }
  if (deal.id === 'bound_tongue') {
    return { ...state, aerisBanned: true, nextBossEffects: [...(state.nextBossEffects || []), 'bound_tongue'] }
  }
  // Betrayals: break the blessing, take the reward.
  if (deal.id === 'broken_vow') {
    const next = breakBoon(state, 'gale')
    return { ...next, permanentRerollBonus: next.permanentRerollBonus - 1, relics: [...next.relics, relicById(deal.relicId)] }
  }
  if (deal.id === 'unspoken_prayer') {
    const next = breakBoon(state, 'prophecy')
    const lesser = instantiateBoss(next, randomOf(BOSS_MODIFIERS.filter((m) => m.tier === 1)))
    return { ...next, shards: next.shards + 12, map: { ...next.map, prophecy: { ...next.map.prophecy, boss: lesser, broken: true } } }
  }
  if (deal.id === 'stolen_breath') {
    const next = breakBoon(state, 'tide')
    return {
      ...next,
      nextRoundRerollBonus: Math.max(0, (next.nextRoundRerollBonus || 0) - 3),
      clearEffects: [...(next.clearEffects || []), 'double'],
    }
  }
  if (deal.id === 'severed_grace') return { ...state, permanentMult: (state.permanentMult || 0) + 1, aerisBanned: true }
  return state
}

function applyBlessing(state, id) {
  switch (id) {
    case 'mend':
      return state.lives < state.maxLives ? { ...state, lives: state.lives + 1 } : { ...state, shards: state.shards + 8 }
    case 'kindle': {
      const growable = state.dice.filter((d) => growTier(state, d))
      const die = randomOf(growable)
      const next = growTier(state, die)
      return {
        ...state,
        dice: state.dice.map((d) => (d.id === die.id ? { ...d, tierId: next.id, sides: next.sides } : d)),
        shop: { ...state.shop, blessedDieId: die.id },
      }
    }
    case 'tide':
      return { ...state, nextRoundRerollBonus: (state.nextRoundRerollBonus || 0) + 3 }
    case 'gale':
      return { ...state, permanentRerollBonus: state.permanentRerollBonus + 1 }
    case 'aether_gift': {
      const def = randomOf(CONSUMABLES.filter((c) => c.rarity === RARITY.RARE))
      return { ...state, consumables: giveConsumable(state, def), shop: { ...state.shop, giftId: def.id } }
    }
    case 'plenty':
      return { ...state, clearEffects: [...(state.clearEffects || []), 'double'], plentyLock: true }
    case 'ember_ward':
      return { ...state, nextRoundBuffs: { ...(state.nextRoundBuffs || {}), noFizzle: true } }
    case 'clarity':
      return { ...state, roadSight: (state.roadSight || 0) + 2, reroutes: (state.reroutes || 0) + 1 }
    case 'communion':
      return { ...state, nextRoundBuffs: { ...(state.nextRoundBuffs || {}), communion: true } }
    case 'grace':
      return { ...state, lives: state.maxLives, map: skipShrines(state.map, state.round) }
    default:
      return state
  }
}

/**
 * A clear's Shards after pacts and blessings that wait on it (B3): Blessing
 * of Plenty and Stolen Breath double them, Gambler's Oath doubles them or
 * takes them all (a seeded coin flip). Returns the total and what happened.
 */
function resolveClearEffects(state, total) {
  const notes = []
  let shards = total
  for (const effect of state.clearEffects || []) {
    if (effect === 'double') {
      shards *= 2
      notes.push('double')
    } else if (effect === 'gamble') {
      const won = random() < 0.5
      shards = won ? shards * 2 : 0
      notes.push(won ? 'gambleWon' : 'gambleLost')
    }
  }
  return { shards, notes }
}

// --- The Firmament (EXPANSION.md H1, H2). ---

/** Vesper works the Forge and the Astral Exchange's forge, past the door (K5). */
function vesperHere(state) {
  return state.realm === 'firmament' && ['forge', 'astral'].includes(state.shop?.type)
}

/** A path's door opens once the file has seen that path's Elementa ending. */
function doorOpen(state) {
  return (state.endingsSeen || []).includes(state.path ?? 'neutral')
}

/** Realm 3's door (R1, Default): open once the file has seen the path's Firmament I ending. */
function doorOpen3(state) {
  return (state.endingsSeen || []).includes(firmamentEnding(state.path ?? 'neutral', 1))
}

/** Which set of Rewriters the door can lead to: Set I until the path's first Realm ending, then Set II, then the player chooses. */
function realm3Sets(state) {
  const path = state.path ?? 'neutral'
  const seen = state.endingsSeen || []
  const one = seen.includes(realm3Ending(path, 1))
  const two = seen.includes(realm3Ending(path, 2))
  if (!one) return [1]
  if (!two) return [2]
  return [1, 2]
}

// --- Realm 3's rules (EXPANSION.md R2). ---

/** Whether a Nun is in the pool: every die ignores the boss twist (R3). */
function nunActive(dice) {
  return actingElementIds(dice).some((id) => elementHasFlag(id, FLAGS.NUN))
}

/** The target as it stands: Infinity raises it 10% a reroll used and 5% an explosion (R2). */
export function effectiveThreshold(state) {
  const fx = relicEffects(effectiveRelics(state))
  if (!fx.thresholdPerReroll || nunActive(state.dice)) return state.threshold
  return Math.round(state.threshold * (1 + fx.thresholdPerReroll * (state.rerollsUsed || 0) + (fx.thresholdPerExplosion || 0) * (state.explosionsThisRound || 0)))
}

/** The most dice that may be held or locked at once: Deadlock allows one, Release one more (R2). */
export function holdLimit(state) {
  const fx = relicEffects(effectiveRelics(state))
  if (!fx.holdLimit || nunActive(state.dice)) return Infinity
  return fx.holdLimit + (fx.holdLimitBonus || 0)
}

/** Whether one more die may be held or locked right now. */
function canHoldMore(state, dieId) {
  const limit = holdLimit(state)
  if (limit === Infinity) return true
  const holding = state.dice.filter((d) => (d.held || d.locked) && !d.temp && d.id !== dieId).length
  return holding < limit
}

/**
 * Which set of Wardens the door can lead to: Set I until the path's first
 * Firmament ending, then Set II; with both done, the player chooses.
 */
function firmamentSets(state) {
  const path = state.path ?? 'neutral'
  const seen = state.endingsSeen || []
  const one = seen.includes(firmamentEnding(path, 1))
  const two = seen.includes(firmamentEnding(path, 2))
  if (!one) return [1]
  if (!two) return [2]
  return [1, 2]
}

/**
 * A Warden falls (H2): it teaches the file its Mythic die's recipe (K1; it
 * used to put the die in the shops), and all six teach Entropy (H5).
 */
/**
 * A Rewriter falls (R2): Zero, the Axiom, Infinity and the Observer teach the
 * recipe of an Absolute die; Floating Point and Deadlock leave a Legendary
 * relic (a free slot is made for it).
 */
function beatRewriter(state, id) {
  const def = rewriterById(id)
  let next = (state.rewriters || []).includes(id) ? state : { ...state, rewriters: [...(state.rewriters || []), id] }
  const taught = def.teaches ? ABSOLUTE_IDS.find((a) => ELEMENTS[a].teacher === id) : null
  if (taught) next = withRecipe(next, taught)
  if (def.prizeRelic && !next.relics.some((r) => r.id === def.prizeRelic)) {
    next = { ...next, relics: [...next.relics, relicById(def.prizeRelic)], relicCapBonus: Math.max(next.relicCapBonus || 0, next.relics.length + 1 - relicCapFor({ ...next, relicCapBonus: 0 })) }
  }
  return next
}

function beatWarden(state, id) {
  const guards = bossById(id)?.guards
  const wardens = (state.wardens || []).includes(id) ? state.wardens : [...(state.wardens || []), id]
  const next = guards ? withRecipe({ ...state, wardens }, guards) : { ...state, wardens }
  return WARDEN_COUNT <= wardens.length ? withRecipe(next, ENTROPY_ID) : next
}

export function initialState() {
  return baseTitleState()
}

// Restores the seeded generator from the state before each action and saves
// it back after, so randomness is part of the (saveable) game state.
// --- Sigil dice: landings, the Eye and the god who bans fishing (EXPANSION.md P2, P5). ---

/** How many table changes between two rerolls make one offense (P5, Default). */
export const FISHING_LIMIT = 6
const FISHING_ACTIONS = ['TOGGLE_HELD', 'LOCK_DIE', 'FREEZE_DIE', 'REORDER_DICE']

/** The sigil dice currently showing a symbol: [{ die, symbol, greater }]. */
function sigilReads(dice) {
  return dice.filter((d) => isSigilId(d.elementId) && d.symbol).map((d) => ({ die: d, symbol: d.symbol, greater: isGreaterSigil(d.elementId) }))
}

/** Whether an Eye is open: showing on a sigil die, not struck blind, with a reroll to look at. */
export function eyeActive(state) {
  return state.phase === 'rolling' && !state.eyeBlind && sigilReads(state.dice).some((r) => r.symbol === 'eye') && availableRerolls(state) > 0
}

/** Whether any shown Eye is a Greater one (it shows every unheld die). */
export const eyeGreater = (state) => sigilReads(state.dice).some((r) => r.symbol === 'eye' && r.greater)

/**
 * The Eye's look at the future (P2): the dice the next reroll would produce,
 * from the table as it stands. A dry run of REROLL_UNHELD on a copy, so every
 * rule is in it; the random generator is put back afterwards, so looking
 * changes nothing. Returns the dice, or null when no reroll is possible.
 */
export function peekReroll(state) {
  const keep = getRngState()
  const probe = { ...state, rngState: typeof state.rngState === 'number' ? state.rngState : keep }
  setRngState(probe.rngState)
  const out = settle(reduce(probe, { type: 'REROLL_UNHELD' }))
  setRngState(keep)
  return out === probe ? null : out.dice
}

const visionKey = (state) => {
  const dice = peekReroll(state)
  return dice ? JSON.stringify(dice.filter((d) => !d.held && !d.locked && !d.temp).map((d) => [d.id, d.value, d.symbol ?? null])) : null
}

/** The next boss is foretold the first time an Eye lands, like the Almanac does (P2). */
function foretellNextBoss(state) {
  if (!state.map) return state
  const bossRound = nextBossRound(state)
  if (!bossRound || state.map.prophecy?.round === bossRound) return state
  return { ...state, map: { ...state.map, prophecy: { round: bossRound, boss: pickBossModifier(state, bossRound) } } }
}

/**
 * The Key and the Eye resolve the moment they land (P2): once per roll of a
 * sigil die. A Key gives rerolls and frees locked dice; an Eye foretells.
 */
function applyLandings(state) {
  if (state.phase !== 'rolling') return state
  const fresh = sigilReads(state.dice).filter((r) => r.die.landed !== r.die.rollId)
  if (fresh.length === 0) return state
  let next = state
  let dice = state.dice
  let bonus = 0
  for (const { die, symbol, greater } of fresh) {
    dice = dice.map((d) => (d.id === die.id ? { ...d, landed: die.rollId } : d))
    if (symbol === 'key') {
      bonus += SIGIL.keyRerolls[greater ? 1 : 0]
      const locked = dice.filter((d) => d.locked)
      const freed = greater ? locked : locked.slice(0, 1)
      dice = dice.map((d) => (freed.some((f) => f.id === d.id) ? { ...d, locked: false, held: false, lockedVia: null } : d))
    }
    if (symbol === 'eye') next = foretellNextBoss(next)
  }
  return { ...next, dice, rerollsBonusThisRound: (next.rerollsBonusThisRound || 0) + bonus }
}

/**
 * What realm 3's dice do the moment a roll lands (R3, R4), once per roll of a
 * die: Infinity and the Apeiron keep Mult from explosions, Divergence gives a
 * die on its lowest face a free reroll (and +1 Mult), Reversed Bits turns the
 * face of every die that rolled over, bit by bit within its own width.
 */
function realmRolls(state) {
  if (state.phase !== 'rolling') return state
  const acting = actingElementIds(state.dice)
  const has = (flag) => acting.some((id) => elementHasFlag(id, flag))
  const apeiron = has(FLAGS.APEIRON)
  const divergence = has(FLAGS.DIVERGENCE)
  const reversed = has(FLAGS.REVBITS)
  const infinity = has(FLAGS.ABS_INFINITY)
  if (!apeiron && !divergence && !reversed && !infinity) return state
  const relics = effectiveRelics(state)
  let dice = state.dice
  let gain = 0
  let rerolled = 0
  if (apeiron || infinity) {
    dice = dice.map((d, i) => {
      if (d.temp || !(d.explosions > 0) || d.infCounted === d.rollId) return d
      const each = apeiron ? 2 : elementHasFlag(acting[i], FLAGS.ABS_INFINITY) ? 1 : 0
      if (!each) return d
      gain += each * d.explosions
      return { ...d, infCounted: d.rollId }
    })
  }
  if (divergence) {
    dice = dice.map((d, i) => {
      if (d.temp || d.held || d.locked || d.value !== 1 || d.divRoll === d.rollId || isSigilId(d.elementId)) return d
      const again = rollDie(acting[i], d.sides, relics, rollContext(d, dice, relicEffects(relics), acting[i]))
      rerolled += 1
      return { ...d, ...again, divRoll: again.rollId }
    })
  }
  if (reversed) {
    dice = dice.map((d, i) => {
      if (d.temp || d.revId === d.rollId || elementHasFlag(acting[i], FLAGS.REVBITS) || isSigilId(d.elementId) || isPokerId(d.elementId) || !(d.value > 0)) return d
      const value = reverseBits(d.value, d.sides)
      return { ...d, value, total: d.total - d.value + value, revId: d.rollId }
    })
  }
  if (dice === state.dice) return state
  return { ...state, dice, infMult: (state.infMult || 0) + gain, divergeCount: (state.divergeCount || 0) + rerolled }
}

/** A face with its bits reversed within the die's own width (B12): 3 bits up to d7, then as many as the size needs. */
export function reverseBits(value, sides) {
  const bits = Math.max(3, Math.ceil(Math.log2(sides + 1)))
  let out = 0
  for (let k = 0; k < bits; k++) if (value & (1 << k)) out |= 1 << (bits - 1 - k)
  return out
}

/** Everything that settles after a roll or a change of the table. */
function settle(state) {
  return realmRolls(applyLandings(state))
}

/** One more table change under a watching Eye. Six make an offense (P5). */
function countShift(state) {
  const shifts = (state.eyeShifts || 0) + 1
  if (shifts < FISHING_LIMIT) return { ...state, eyeShifts: shifts }
  const strikes = (state.eyeStrikes || 0) + 1
  const base = { ...state, eyeShifts: 0, eyeStrikes: strikes }
  if (strikes < 3) return { ...base, eyeNotice: { level: strikes, seq: strikes } }
  // The third offense and every one after: the Arbiter smites the dice away.
  const relics = effectiveRelics(base)
  const dice = settleNewDice(rerollPool(base.dice, relics, { patienceBonus: totemLevel(base.totems, 'earth') }))
  const left = availableRerolls(base)
  return {
    ...base,
    dice,
    rerollsUsed: base.rerollsUsed + left,
    eyeBlind: true,
    lives: base.lives > 1 ? base.lives - 1 : base.lives,
    arbiterScene: strikes === 3,
    eyeNotice: { level: 3, seq: strikes, first: strikes === 3, lostLife: base.lives > 1 },
  }
}

export function gameReducer(state, action) {
  if (typeof state.rngState === 'number') setRngState(state.rngState)
  // An Eye on the table makes the table's shape matter: note what it shows now (P5).
  const watching = FISHING_ACTIONS.includes(action.type) && state.phase === 'rolling' && eyeActive(state)
  const before = watching ? visionKey(state) : null
  let next = reduce(state, action)
  next = settle(next)
  if (watching && next !== state && next.phase === 'rolling') {
    const keep = getRngState()
    const after = visionKey({ ...next, rngState: keep })
    setRngState(keep)
    if (before !== after) next = countShift(next)
  }
  // A reroll starts the count again, and clears a warning (P5).
  if (action.type === 'REROLL_UNHELD' || action.type === 'GUST_REROLL') next = next.eyeShifts || next.eyeNotice ? { ...next, eyeShifts: 0, eyeNotice: null } : next
  // Black Hole dice and the Time ghost last only for the round (N5).
  if (next !== state && next.phase && next.phase !== 'rolling' && next.dice?.some(isTempDie)) next = { ...next, dice: withoutTemps(next.dice) }
  if (next !== state && typeof next.rngState === 'number') return { ...next, rngState: getRngState() }
  return next
}

function reduce(state, action) {
  switch (action.type) {
    case 'GO_TO_SLOTS':
      return { ...baseTitleState(), phase: 'slots' }

    case 'GO_TO_CREDITS':
      return { ...baseTitleState(), phase: 'credits' }

    // A save file's home screen: continue or start a run, gallery,
    // achievements. Also where a finished or quit run returns to.
    case 'GO_TO_HUB':
      return { ...baseTitleState(), phase: 'hub', activeSlot: action.slot ?? state.activeSlot }

    case 'BACK_TO_MENU':
      return { ...baseTitleState(), phase: 'menu' }

    // Discard a loaded-but-not-yet-resumed preview and go back to slot
    // picking. The save file on disk is untouched, only the in-memory
    // hydrated state is thrown away.
    case 'BACK_TO_SLOTS_FROM_PREVIEW':
      return { ...baseTitleState(), phase: 'hub', activeSlot: state.activeSlot }

    // Chosen an empty slot from the save-slot screen: go pick a deck and
    // difficulty (the existing TitleScreen), remembering which slot the
    // resulting run should autosave to.
    case 'NEW_RUN_SETUP':
      return { ...baseTitleState(), phase: 'title', activeSlot: action.slot ?? state.activeSlot }

    case 'START_RUN':
      return startNewRun(action.deckId, action.difficultyId, state.activeSlot, action.seed, action.recipes, action.file)

    // Chosen a filled slot: hydrate its full snapshot, but land on a
    // preview screen (dice loadout, difficulty, round) rather than
    // dropping straight back into whatever mid-round state it was saved
    // at. The saved phase is stashed in resumePhase for RESUME_RUN.
    case 'LOAD_RUN': {
      // Older saves predate seeds: give them a generator state so the rest
      // of the run is still saved and reproducible from here on.
      const save = migrateRuns(renameChrono(action.save))
      // A NaN purse (a bug in v0.8's first build priced the new base dice at
      // NaN) is repaired to a small float so the run can go on.
      if (!Number.isFinite(save.shards)) save.shards = 30
      return {
        ...save,
        // Past the door the gods' gauntlet is long over (H1).
        ...(save.realm === 'firmament' ? { gauntlet: null } : {}),
        // The file's progress wins over the snapshot's (H8).
        ...(action.file ? fileFields(action.file) : {}),
        activeSlot: action.slot ?? action.save.activeSlot,
        rngState: action.save.rngState ?? Math.floor(Math.random() * 4294967296),
        // Saves from before the Road: lay one out from here.
        map: action.save.map ?? legacyMap(action.save),
        // The file's recipes win over the snapshot's (it may predate them).
        recipes: action.recipes ?? action.save.recipes ?? [],
        // Held relics and consumables are copies of their definitions: take
        // the current ones, so a balance or text change reaches saved runs
        // (and an old Chisel becomes the new one).
        relics: (action.save.relics || []).map((r) => relicById(r.id) ?? r),
        consumables: (action.save.consumables || []).map((c) => ({
          ...(consumableById(c.id) ?? c),
          instanceId: c.instanceId,
        })),
        phase: 'runPreview',
        resumePhase: action.save.phase,
      }
    }

    case 'RESUME_RUN': {
      if (state.phase !== 'runPreview' || !state.resumePhase) return state
      return { ...state, phase: state.resumePhase, resumePhase: null }
    }

    // The Closed Timelike Curve's 20 seconds ran out (N5); the UI keeps the clock.
    case 'CTC_EXPIRE': {
      if (state.phase !== 'rolling' || state.ctcExpired) return state
      return { ...state, ctcExpired: true }
    }

    case 'TOGGLE_HELD': {
      if (state.phase !== 'rolling') return state
      const target = state.dice.find((d) => d.id === action.dieId)
      // Deadlock (R2): holding is refused past the limit; letting go is always fine.
      if (target && !target.held && !canHoldMore(state, target.id)) return state
      return {
        ...state,
        dice: state.dice.map((d) =>
          d.id === action.dieId && !d.locked ? { ...d, held: !d.held } : d,
        ),
      }
    }

    // Dice order matters (adjacency reactions, Mirror, Beacon, ...), so the
    // player can rearrange the pool while rolling or shopping.
    case 'REORDER_DICE': {
      if (state.phase !== 'rolling' && state.phase !== 'shop') return state
      const byId = new Map(state.dice.map((d) => [d.id, d]))
      const next = action.order.map((id) => byId.get(id)).filter(Boolean)
      if (next.length !== state.dice.length) return state
      return { ...state, dice: next }
    }

    case 'LOCK_DIE': {
      if (state.phase !== 'rolling') return state
      const idx = state.dice.findIndex((d) => d.id === action.dieId)
      const die = state.dice[idx]
      // Masquerade and Chameleon lock as the die they act as (B10).
      const acting = die ? ELEMENTS[actingElementIds(state.dice)[idx]] : null
      // Varuna's power: any die locks for free, and still refunds (B4).
      const tide = tideLocks(state.dice)
      if (!die || die.locked || !(acting.flags[FLAGS.FREE_LOCK] || tide)) return state
      // Deadlock (R2): at most one die held or locked.
      if (!canHoldMore(state, die.id)) return state

      const fx = relicEffects(effectiveRelics(state))
      if (fx.noFreeLock) return state
      const grantsReroll = acting.flags[FLAGS.GRANTS_REROLL_ON_LOCK] || tide
      const rerollGrant = grantsReroll ? 1 + (fx.waterLockRerollBonus || 0) : 0
      const adjacent = acting.flags[FLAGS.ADJACENT_FREE_LOCK]

      const adjacentId = adjacent && holdLimit(state) === Infinity ? state.dice[idx + 1]?.id : null

      let dice = state.dice.map((d) => {
        if (d.id === action.dieId) return { ...d, held: true, locked: true, lockedVia: 'lock' }
        if (adjacentId && d.id === adjacentId) return { ...d, held: true, locked: true, lockedVia: 'lock' }
        return d
      })

      let rerollsBonusThisRound = state.rerollsBonusThisRound + rerollGrant
      let explosionsThisRound = state.explosionsThisRound || 0
      if (fx.undertowRippleReroll) {
        const targets = dice.filter((d) => d.id !== action.dieId && !d.held && !d.locked)
        if (targets.length > 0) {
          const target = targets[Math.floor(random() * targets.length)]
          const relics = effectiveRelics(state)
          const actingIds = actingElementIds(dice)
          const actor = actingIds[dice.findIndex((d) => d.id === target.id)]
          const rolled = rollDie(actor, target.sides, relics, rollContext(target, dice, relicEffects(relics), actor))
          dice = dice.map((d) => (d.id === target.id ? { ...d, ...rolled } : d))
          explosionsThisRound += rolled.explosions
        }
      }

      return { ...state, dice, rerollsBonusThisRound, explosionsThisRound, lockedThisRound: true }
    }

    case 'FREEZE_DIE': {
      if (state.phase !== 'rolling') return state
      const fx = relicEffects(effectiveRelics(state))
      const charges = fx.freezeChargePerRound || 0
      if (state.freezeChargesUsed >= charges) return state
      if (!canHoldMore(state, action.dieId)) return state
      return {
        ...state,
        freezeChargesUsed: state.freezeChargesUsed + 1,
        dice: state.dice.map((d) =>
          d.id === action.dieId ? { ...d, held: true, locked: true, lockedVia: 'freeze' } : d,
        ),
      }
    }

    case 'REROLL_UNHELD': {
      if (state.phase !== 'rolling') return state
      if (availableRerolls(state) <= 0) return state
      const fx = relicEffects(effectiveRelics(state))
      // An Hourglass reroll (I2) is free: no reroll used, no tax.
      const free = (state.freeRerolls || 0) > 0
      const tax = free ? 0 : fx.rerollShardCost || 0
      if (state.shards < tax) return state
      // What Time's Rewind (and the Stopwatch) can undo (H3).
      const lastReroll = {
        dice: state.dice,
        shards: state.shards,
        rerollsUsed: state.rerollsUsed,
        freeRerolls: state.freeRerolls || 0,
        rerollsMade: state.rerollsMade || 0,
        rerollsBonusThisRound: state.rerollsBonusThisRound,
        explosionsThisRound: state.explosionsThisRound,
        bossModifier: state.bossModifier,
      }
      // The Time die's ghost keeps the Base the dice scored before this reroll (N2).
      const ghostBase = evaluatePool(withoutTemps(state.dice), effectiveRelics(state), scoreContext(state)).baseLines[0]?.value || 0
      let dice = rerollPool(state.dice, effectiveRelics(state), { patienceBonus: totemLevel(state.totems, 'earth') })
      if (fx.overclockZeroChance) {
        dice = dice.map((d) => {
          if (d.held || d.locked) return d
          if (random() < fx.overclockZeroChance) {
            return { ...d, value: 1, total: 1, explosions: 0 }
          }
          return d
        })
      }
      // Anomaly (K4, N3): after every reroll, two random unheld dice roll once
      // more, for free, and keep the better result.
      if (actingElementIds(dice).some((id) => elementHasFlag(id, FLAGS.ANOMALY))) {
        const loose = dice.filter((d) => !d.held && !d.locked && !d.temp)
        const relics = effectiveRelics(state)
        const picked = new Set()
        for (let k = 0; k < 2 && loose.length; k++) {
          const pick = loose.splice(Math.floor(random() * loose.length), 1)[0]
          picked.add(pick.id)
          const i = dice.findIndex((d) => d.id === pick.id)
          const actor = actingElementIds(dice)[i]
          const again = rollDie(actor, pick.sides, relics, rollContext(pick, dice, relicEffects(relics), actor))
          if (again.total > pick.total) dice = dice.map((d) => (d.id === pick.id ? { ...d, ...again } : d))
        }
        dice = dice.map((d) => ({ ...d, anomaly: picked.has(d.id) }))
      }
      dice = starChain(settleTide(dice))
      // Chrono (H4): any 1 rewinds time, as often as it takes (no limit).
      const chrono = chronoAfterRoll(
        dice,
        effectiveRelics(state),
        scoreContext(state),
        new Set(state.dice.filter((d) => !d.held && !d.locked).map((d) => d.id)),
      )
      // The Time die's ghost, the Entanglement's pick and the Event Horizon's holes (N2, N5).
      dice = settleNewDice(summonGhost(chrono.dice, ghostBase))
      // Kindling (Fire family): a rerolled die that lands on a fizzling 1
      // pays back one reroll this round. It is deliberately uncapped (Carlos):
      // a pool of three or more small Fire dice earns back about a reroll per
      // reroll, which is the point of building one. `kindled` drives the "+1" pop.
      const rerolled = new Set(state.dice.filter((d) => !d.held && !d.locked).map((d) => d.id))
      let kindling = 0
      dice = dice.map((d) => {
        if (!rerolled.has(d.id)) return d
        // No fizzles under Blessing of Ember-ward, so no Kindling either.
        const kindled =
          !state.roundBuffs?.noFizzle &&
          d.value === 1 &&
          !hasActiveRune(d, 'anchor', d.value) &&
          elementHasFlag(d.elementId, FLAGS.ZERO_ON_MIN) &&
          inFamily(d.elementId, 'fire')
        // The Fire Totem (L4) makes each fizzle pay more.
        if (kindled) kindling += kindlingReroll(totemLevel(state.totems, 'fire'))
        return { ...d, kindled }
      })
      const explosionsThisRound =
        (state.explosionsThisRound || 0) + countExplosions(dice.filter((d) => rerolled.has(d.id)))
      // Primordial reshapes its twist after every reroll.
      const bossModifier =
        state.bossModifier?.id === 'primordial'
          ? {
              ...primordialWith(randomOf(PRIMORDIAL_POOL.filter((id) => id !== state.bossModifier.twistId))),
              variant: state.bossModifier.variant,
            }
          : state.bossModifier
      // Primordial Unbound (the Split path) fuses two of your pure dice.
      if (bossModifier?.variant === 'unbound') dice = unboundFuse(dice, effectiveRelics({ ...state, bossModifier }))
      // The Wardens' twists after a reroll (H2).
      dice = wardenAfterReroll(dice, rerolled, relicEffects(effectiveRelics({ ...state, bossModifier })))
      return {
        ...state,
        dice,
        bossModifier,
        shards: state.shards - tax,
        rerollsUsed: state.rerollsUsed + (free ? 0 : 1),
        freeRerolls: free ? state.freeRerolls - 1 : state.freeRerolls || 0,
        rerollsMade: (state.rerollsMade || 0) + 1,
        rerollsTotal: (state.rerollsTotal || 0) + 1,
        rerollsBonusThisRound: state.rerollsBonusThisRound + kindling,
        explosionsThisRound,
        lastReroll,
        chronoLoops: chrono.loops,
      }
    }

    // Time's Rewind (H3): once per round, undo the last reroll and get it
    // back. The Stopwatch (H6) does the same as a consumable.
    case 'REWIND': {
      if (state.phase !== 'rolling' || !state.lastReroll) return state
      if (!holdsTime(state.dice) || state.rewindUsed) return state
      return { ...undoReroll(state), rewindUsed: true }
    }

    // Drift (Air family): spend a charge to nudge one Air-family die's face up
    // or down by 1, or (L2) all the way to its top face. The die then scores
    // that face. Landing on the max face doesn't explode, and a boss-frozen or
    // frozen die stays put.
    case 'NUDGE_DIE': {
      if (state.phase !== 'rolling' || driftChargesLeft(state) <= 0) return state
      const toTop = action.delta === 'top'
      if (!toTop && action.delta !== 1 && action.delta !== -1) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die || !inFamily(actingElementIds(state.dice)[state.dice.indexOf(die)], 'air') || die.lockedVia === 'freeze') return state
      const value = toTop ? die.sides : die.value + action.delta
      if (value < 1 || value > die.sides || value === die.value) return state
      return {
        ...state,
        driftsUsed: (state.driftsUsed ?? (state.driftUsed ? 1 : 0)) + 1,
        dice: state.dice.map((d) =>
          d.id === die.id ? { ...d, value, total: value, explosions: 0, chain: [value], kindled: false, drifted: true } : d,
        ),
      }
    }

    // Gust (relic): once per round, reroll one chosen die for free.
    case 'GUST_REROLL': {
      if (state.phase !== 'rolling' || state.gustUsed) return state
      const relics = effectiveRelics(state)
      if (!relicEffects(relics).freeSingleReroll) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die || die.locked) return state
      const actor = actingElementIds(state.dice)[state.dice.findIndex((d) => d.id === die.id)]
      const rolled = rollDie(actor, die.sides, relics, rollContext(die, state.dice, relicEffects(relics), actor))
      return {
        ...state,
        gustUsed: true,
        explosionsThisRound: (state.explosionsThisRound || 0) + rolled.explosions,
        dice: settleNewDice(starChain(state.dice.map((d) => (d.id === die.id ? { ...d, ...rolled, held: false, growth: 0, kindled: false, drifted: false } : d)))),
      }
    }

    case 'SUBMIT_ROUND': {
      if (state.phase !== 'rolling') return state
      const result = evaluatePool(state.dice, effectiveRelics(state), scoreContext(state))
      // Infinity, the Rewriter (R2), raises the target for every reroll and explosion.
      const target = effectiveThreshold(state)
      const passed = result.roundScore >= target
      // Runes of Gold (O1) pay on every cast, cleared or not.
      if (result.goldShards) state = { ...state, shards: state.shards + result.goldShards }
      // The Maelstrom only lent your dice their elements (H2): give them back.
      if (state.dice.some((d) => d.maelstromFrom)) state = { ...state, dice: state.dice.map((d) => ({ ...d, ...unmaelstrom(d) })) }
      // A god of the gauntlet falls; three more stages before the ending.
      if (passed && state.gauntlet && state.gauntlet.stage < GOD_TRIALS.length - 1) {
        const glass = shatterGlass(state)
        return advanceGauntlet(glass.state, { ...result, passed, threshold: target, shattered: glass.shattered })
      }
      // Primordial Unbound only borrowed your dice: give the pool back.
      if (state.bossModifier?.variant === 'unbound' && state.roundPool) state = { ...state, dice: state.roundPool }
      // Rune of Glass (J3): after scoring, each glass die may shatter.
      const glass = shatterGlass(state)
      state = glass.state
      result.shattered = glass.shattered

      if (passed) {
        const earned = shardsEarned(result.roundScore, target, state.difficulty)
        const fx = relicEffects(effectiveRelics(state))
        const interest = interestFor(state.shards, fx.interestCapBonus || 0, fx.interestDivisor || 3)
        const base = Math.round(5 * state.difficulty.shardMultiplier)
        // Cuckoo Clock (I2): clear with no rerolls left for 5 Shards, and
        // +1 Mult on the next round's cast.
        const cuckoo = Boolean(fx.cuckooClock) && availableRerolls(state) <= 0
        const bonus =
          (fx.shardPerExplosion || 0) * result.explodeCount + result.midasShards + result.bullionShards + (cuckoo ? 5 : 0)
        // Pacts and blessings waiting on this clear (B3) double or gamble it.
        const cleared = resolveClearEffects(state, earned + interest + bonus)
        let shards = state.shards + cleared.shards
        // Kept for the round-result card, so the player sees where Shards came from.
        const shardGain = { base, overkill: earned - base, interest, bonus, total: cleared.shards, effects: cleared.notes }
        // The Long Night's prize: a legendary relic (or 15 Shards if none fits).
        let relics = state.relics
        let longNightRelic = null
        if (state.longNightActive) {
          const id = relics.length < relicCapFor(state) ? legendaryRelicId(state) : null
          if (id) {
            relics = [...relics, relicById(id)]
            longNightRelic = id
          } else {
            shards += 15
          }
        }
        let permanentRerollBonus = state.permanentRerollBonus
        if (fx.momentumRerollOnOverkill && result.roundScore >= target * 2) {
          permanentRerollBonus += 1
        }
        let lives = state.lives
        if (state.round % LIFE_REGEN_EVERY_N_ROUNDS === 0 && lives < state.maxLives) lives += 1
        // Time (H3): unused rerolls carry into the next round, up to +3.
        // The Mainspring (I2) banks them too; the same rerolls never count twice.
        const left = Math.max(0, availableRerolls(state))
        const timeCarry = Math.max(holdsTime(state.dice) ? Math.min(3, left) : 0, fx.bankRerolls ? Math.min(fx.bankRerolls, left) : 0)

        const beatBoss = Boolean(state.bossModifier)
        // The shop you walk into is the stop you picked on the Road.
        const shopType = currentNode(state.map)?.type ?? 'market'
        const chronicle = state.chronicle ?? { bosses: [], shops: [] }
        // Beating the final boss ends the run on the spot (Endless picks up
        // from the reward and shop, see CONTINUE_ENDLESS).
        const won = state.round >= finalRound(state) && !state.endless
        // Beating Primordial teaches the Aether recipe (EXPANSION.md B6),
        // reaches the path's ending (B2), and takes back the lent die. Past
        // the door, the last Warden reaches a Firmament ending (H1).
        let crossroads = false
        if (won) {
          const firmament = state.realm === 'firmament'
          state = {
            ...withRecipe(state, QUADRA_FUSION_ID),
            ending: state.realm3
              ? realm3Ending(state.path ?? 'neutral', state.realm3Set)
              : firmament
                ? firmamentEnding(state.path ?? 'neutral', state.firmamentSet)
                : state.path ?? 'neutral',
            dice: state.dice.filter((d) => d.elementId !== PRIMORDIAL_DIE_ID),
          }
          // A path whose door is open stops at the Crossroads first (H1); so does the Firmament's last Warden (R1).
          crossroads = state.realm3 ? false : firmament ? doorOpen3(state) : doorOpen(state)
        }
        // A Warden that falls gives the file its Mythic die; all six teach
        // Entropy's recipe (H2, H5).
        const wardenBeaten = state.bossModifier?.tier === 4 ? state.bossModifier.id : null
        if (wardenBeaten) state = beatWarden(state, wardenBeaten)
        // A Rewriter that falls teaches a recipe or leaves a relic (R2).
        const rewriterBeaten = state.bossModifier?.tier === 5 ? state.bossModifier.id : null
        if (rewriterBeaten) state = beatRewriter(state, rewriterBeaten)
        // Stardust (K2): every boss drops some, a Warden more.
        const stardustGain = beatBoss ? (wardenBeaten || rewriterBeaten ? STARDUST_PER_WARDEN : STARDUST_PER_BOSS) : 0
        return {
          ...state,
          // Beating a boss first offers a permanent upgrade, then the shop.
          phase: crossroads ? 'crossroads' : won ? 'victory' : beatBoss ? 'bossReward' : 'shop',
          chronicle: won ? chronicle : { ...chronicle, shops: [...chronicle.shops, { round: state.round, type: shopType }] },
          lastResult: { ...result, passed, threshold: target, shardGain, beatBoss, longNightRelic, timeCarry, wardenBeaten, stardustGain },
          // A Warden or a round-10 boss also offers a choice of Laws (O2, Default).
          rewardLaws: beatBoss && (wardenBeaten || rewriterBeaten || state.round === 10) ? pickRewardLaws(state) : [],
          stardust: (state.stardust || 0) + stardustGain,
          shards,
          relics,
          permanentRerollBonus,
          lives,
          nextRoundRerollBonus: (state.nextRoundRerollBonus || 0) + timeCarry,
          cuckooRound: cuckoo ? state.round + 1 : state.cuckooRound ?? null,
          clearEffects: [],
          longNightActive: false,
          plentyLock: false,
          bestCast: Math.max(state.bestCast || 0, result.roundScore),
          shop: { ...buildShopOffers(state, shopType), afterBoss: beatBoss, rerollLocked: Boolean(state.plentyLock) },
        }
      }

      const fx = relicEffects(state.relics)
      let lives = state.lives - 1
      let secondWindUsed = state.secondWindUsed
      let secondWindTriggered = false
      if (lives <= 0 && fx.preventFirstDeath && !state.secondWindUsed) {
        lives = 1
        secondWindUsed = true
        secondWindTriggered = true
      }
      return {
        ...state,
        phase: lives <= 0 ? 'gameover' : 'missed',
        lastResult: { ...result, passed, threshold: target, secondWindTriggered },
        lives: Math.max(0, lives),
        secondWindUsed,
        shards: state.shards + (fx.lifeLostShardBonus || 0),
      }
    }

    case 'RETRY_ROUND': {
      if (state.phase !== 'missed') return state
      return retryRound(state)
    }

    // A missed round goes to Tobb's safety camp (EXPANSION.md E10): a few
    // Shards on arrival and a small Market. It isn't a Road stop, so the
    // next shop you picked stays the same; leaving retries the round.
    case 'GO_TO_CAMP': {
      // No camp in the middle of the gods' gauntlet (B1): retry the stage.
      if (state.phase !== 'missed' || state.gauntlet) return state
      const pay = campPayout(state.round)
      return {
        ...state,
        phase: 'shop',
        shards: state.shards + pay,
        shop: { ...buildShopOffers(state, 'camp'), campPay: pay },
      }
    }

    case 'BUY_DIE': {
      if (state.phase !== 'shop' || !state.shop.buyableElements.includes(action.elementId)) return state
      const sizeId = state.shop.dieSizes?.[action.elementId] ?? SHOP_DIE_TIER
      const bought = makeDie(action.elementId, sizeId, state.shop.dieWarp?.[action.elementId] ? 'warp' : null)
      // A die of v0.8.3 bought past the door is a new apprentice (N6).
      const die = state.realm === 'firmament' && NEW_DICE_IDS.includes(action.elementId) ? { ...bought, fresh: { visits: APPRENTICE_VISITS, upgrades: APPRENTICE_UPGRADES } } : bought
      // The dice cap (Warp dice aside), the Warp cap, one of each Mythic (H3).
      if (!fitsPool(state, [...state.dice, die]) || holdsKind(state.dice, action.elementId)) return state
      const cost = newDieCost(action.elementId, state.dice, state.relics, state.shop, sizeId)
      if (state.shards < cost) return state
      const ownedElementsEver = state.ownedElementsEver.includes(action.elementId)
        ? state.ownedElementsEver
        : [...state.ownedElementsEver, action.elementId]
      return {
        ...state,
        shards: state.shards - cost,
        dice: [...state.dice, die],
        ownedElementsEver,
        shop: {
          ...state.shop,
          buyableElements: state.shop.buyableElements.filter((id) => id !== action.elementId),
        },
      }
    }

    // A keeper's sigil die (P3): 20 Shards, the Greater one 40.
    case 'BUY_SIGIL': {
      if (state.phase !== 'shop' || !state.shop?.sigilOffer || state.shop.sigilOffer !== action.elementId) return state
      const die = makeDie(action.elementId)
      if (!fitsPool(state, [...state.dice, die])) return state
      const cost = sigilCost(action.elementId, state.relics, state.shop)
      if (state.shards < cost) return state
      const ownedElementsEver = state.ownedElementsEver.includes(action.elementId) ? state.ownedElementsEver : [...state.ownedElementsEver, action.elementId]
      return { ...state, shards: state.shards - cost, dice: [...state.dice, die], ownedElementsEver, shop: { ...state.shop, sigilOffer: null } }
    }

    case 'SELL_DIE': {
      if (state.phase !== 'shop') return state
      if (isTempDie(state.dice.find((d) => d.id === action.dieId))) return state
      if (state.dice.length <= 1) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      // The Primordial die is only lent (B1).
      if (!die || die.elementId === PRIMORDIAL_DIE_ID) return state
      const fx = relicEffects(state.relics)
      const value = sellValueForDie(die, isFusionElement(die.elementId)) + (fx.sellBonus || 0)
      const sold = { ...state, dice: state.dice.filter((d) => d.id !== action.dieId) }
      // Mote pays half again, and remembers the meal (H6).
      if (state.shop.type === 'pantry') return feedMote({ ...sold, shards: state.shards + motePays(value) }, value)
      return { ...sold, shards: state.shards + value }
    }

    // The old one-click forge: picks the first dice that fit the recipe and
    // forges them through the slots' rules (K3). Kept for older callers.
    case 'FUSE_DICE': {
      if (state.phase !== 'shop' || !state.shop?.forgeOpen) return state
      const def = ELEMENTS[action.fusionElementId]
      if (!def || !FORGE_RESULTS.includes(def.id)) return state
      const used = []
      for (const [parentId, n] of Object.entries(recipeNeeds(def))) {
        for (let k = 0; k < n; k++) {
          const match = state.dice.find((d) => d.elementId === parentId && !used.includes(d.id))
          if (!match) return state
          used.push(match.id)
        }
      }
      return forge(state, used, { resultId: def.id })
    }

    // The Forge's slots (K3): forge exactly the placed dice.
    case 'FORGE': {
      if (state.phase !== 'shop' || !Array.isArray(action.dieIds)) return state
      const ids = [...new Set(action.dieIds)].slice(0, FORGE_SLOTS)
      return forge(state, ids, { resultId: action.resultId, superpose: Boolean(action.superpose), catalyst: Boolean(action.catalyst) })
    }

    // Vesper teaches an element fusion the first time its two parents sit in
    // her Forge's slots (K4, K5).
    case 'TEACH_FUSION': {
      if (state.phase !== 'shop' || !vesperHere(state)) return state
      const def = ELEMENTS[action.fusionElementId]
      if (!def?.cosmic || state.recipes?.includes(def.id)) return state
      if (!def.parents.every((p) => state.dice.some((d) => d.elementId === p))) return state
      return withRecipe(state, def.id)
    }

    // Vesper's Stardust (K2): one per visit.
    case 'BUY_STARDUST': {
      if (state.phase !== 'shop' || !vesperHere(state) || state.shop.stardustBought) return state
      if (state.shards < STARDUST_PRICE) return state
      return {
        ...state,
        shards: state.shards - STARDUST_PRICE,
        stardust: (state.stardust || 0) + 1,
        shop: { ...state.shop, stardustBought: true },
      }
    }

    case 'BUY_RELIC': {
      if (state.phase !== 'shop') return state
      const wanted = relicById(action.relicId)
      // A Law (O2) goes in the Law slot and replaces the one there, no refund.
      if (wanted?.law) {
        if (state.law?.id === wanted.id) return state
        const price = relicCost(wanted, state.relics, state.shop)
        if (state.shards < price) return state
        return {
          ...state,
          shards: state.shards - price,
          law: wanted,
          shop: { ...state.shop, itemOffers: state.shop.itemOffers.filter((o) => !(o.kind === 'relic' && o.id === wanted.id)) },
        }
      }
      if (state.relics.length >= relicCapFor(state)) return state
      const relic = wanted
      if (!relic || state.relics.some((r) => r.id === relic.id)) return state
      const cost = relicCost(relic, state.relics, state.shop)
      if (state.shards < cost) return state
      return {
        ...state,
        shards: state.shards - cost,
        relics: [...state.relics, relic],
        shop: {
          ...state.shop,
          itemOffers: state.shop.itemOffers.filter((o) => !(o.kind === 'relic' && o.id === relic.id)),
        },
      }
    }

    case 'SELL_RELIC': {
      if (state.phase !== 'shop') return state
      const relic = state.relics.find((r) => r.id === action.relicId)
      if (!relic) return state
      const fx = relicEffects(state.relics)
      const value = relicSellValue(state, relic, fx)
      const sold = { ...state, relics: state.relics.filter((r) => r.id !== action.relicId) }
      if (state.shop.type === 'pantry') return feedMote({ ...sold, shards: state.shards + motePays(value) }, value)
      return { ...sold, shards: state.shards + value }
    }

    case 'BUY_CONSUMABLE': {
      if (state.phase !== 'shop') return state
      if (state.consumables.length >= consumableCapFor(state)) return state
      const def = consumableById(action.consumableId)
      if (!def) return state
      const cost = consumableCost(def, state.relics, state.shop)
      if (state.shards < cost) return state
      return {
        ...state,
        shards: state.shards - cost,
        consumables: [...state.consumables, { ...def, instanceId: makeId() }],
        shop: {
          ...state.shop,
          itemOffers: dropOffer(state.shop.itemOffers, 'consumable', def.id),
        },
      }
    }

    // Buy a consumable and use it right away: no inventory slot needed, so
    // it works even when the consumable inventory is full.
    case 'BUY_AND_APPLY_CONSUMABLE': {
      if (state.phase !== 'shop') return state
      const def = consumableById(action.consumableId)
      if (!def || !state.shop.itemOffers.some((o) => o.kind === 'consumable' && o.id === def.id)) return state
      const cost = consumableCost(def, state.relics, state.shop)
      if (state.shards < cost) return state
      const instanceId = makeId()
      const bought = {
        ...state,
        shards: state.shards - cost,
        consumables: [...state.consumables, { ...def, instanceId }],
        shop: {
          ...state.shop,
          itemOffers: dropOffer(state.shop.itemOffers, 'consumable', def.id),
        },
      }
      // A rune's number and a Graft's target travel along (K3b, K6).
      const applied = reduce(bought, {
        type: 'APPLY_CONSUMABLE',
        instanceId,
        dieId: action.dieId ?? null,
        face: action.face,
        toDieId: action.toDieId,
        runeIndex: action.runeIndex,
      })
      // Couldn't apply (e.g. no valid target): undo the purchase entirely.
      return applied === bought ? state : applied
    }

    case 'SELL_CONSUMABLE': {
      if (state.phase !== 'shop') return state
      const item = state.consumables.find((c) => c.instanceId === action.instanceId)
      if (!item) return state
      const fx = relicEffects(state.relics)
      const value = sellValueForConsumable(item) + (fx.sellBonus || 0)
      const sold = { ...state, consumables: state.consumables.filter((c) => c.instanceId !== action.instanceId) }
      if (state.shop.type === 'pantry') return feedMote({ ...sold, shards: state.shards + motePays(value) }, value)
      return { ...sold, shards: state.shards + value }
    }

    // Consumables work in the shop and during a round (except the ones
    // that only make sense in a shop: Fusion Spark, Loom of Fate).
    case 'APPLY_CONSUMABLE': {
      const rolling = state.phase === 'rolling'
      if (state.phase !== 'shop' && !rolling) return state
      let item = state.consumables.find((c) => c.instanceId === action.instanceId)
      if (!item) return state
      if (rolling && SHOP_ONLY_CONSUMABLES.includes(item.type)) return state
      // The Hollow (H2): no consumables this round.
      if (rolling && relicEffects(effectiveRelics(state)).noConsumables) return state
      // An old save's Chisel (it used to shrink a die) is the new one.
      if (item.type === 'downgrade') item = { ...item, type: 'split' }

      const spent = state.consumables.filter((c) => c.instanceId !== action.instanceId)
      if (item.target === 'self') {
        if (item.type === 'reroll') {
          return { ...state, permanentRerollBonus: state.permanentRerollBonus + 1, consumables: spent }
        }
        if (item.type === 'heal') {
          if (state.lives >= state.maxLives) return state
          return { ...state, lives: state.lives + 1, consumables: spent }
        }
        // Stopwatch (H6): undo the last reroll, mid-round.
        if (item.type === 'rewind') {
          if (!rolling || !state.lastReroll) return state
          return { ...undoReroll(state), consumables: spent }
        }
        // A Constellation (J1) levels one reaction or set type, up to the cap.
        if (item.type === 'constellation') {
          const level = state.constellations?.[item.levels] || 0
          if (level >= LEVEL_CAP) return state
          return { ...state, constellations: { ...state.constellations, [item.levels]: level + 1 }, consumables: spent }
        }
        // A Totem (L4) levels a family's ability, up to the cap.
        if (item.type === 'totem') {
          const level = totemLevel(state.totems, item.totem)
          if (level >= TOTEM_CAP) return state
          return { ...state, totems: { fire: 0, water: 0, earth: 0, air: 0, ...state.totems, [item.totem]: level + 1 }, consumables: spent }
        }
        // Black Hole (J1): one level to every reaction and set type.
        if (item.type === 'blackhole') {
          const now = state.constellations || {}
          if (LEVELABLE.every((id) => (now[id] || 0) >= LEVEL_CAP)) return state
          const next = { ...now }
          LEVELABLE.forEach((id) => (next[id] = Math.min(LEVEL_CAP, (next[id] || 0) + 1)))
          return { ...state, constellations: next, consumables: spent }
        }
        // Hourglass (I2): the next 3 rerolls this round are free. Only
        // useful mid-round.
        if (item.type === 'sand') {
          if (!rolling) return state
          return { ...state, freeRerolls: (state.freeRerolls || 0) + 3, consumables: spent }
        }
        // Metronome (I2): +1 Mult on every cast for the next 3 rounds.
        if (item.type === 'metronome') {
          return { ...state, metronome: { from: state.round + 1, to: state.round + 3 }, consumables: spent }
        }
        // Almanac (I2): the next three targets and the next boss, exactly.
        // The boss is foretold the way a Shrine's Prophecy is, so it is
        // really the one that comes.
        if (item.type === 'almanac') {
          const bossRound = nextBossRound(state)
          let map = state.map
          let boss = null
          if (bossRound) {
            const told = map?.prophecy?.round === bossRound ? map.prophecy.boss : null
            boss = told ?? pickBossModifier(state, bossRound)
            if (!told) map = { ...map, prophecy: { round: bossRound, boss } }
          }
          const targets = [1, 2, 3].map((k) => almanacTarget(state, state.round + k, k === 1))
          return {
            ...state,
            map,
            boons: addBoon(state, 'almanac', 'almanac', { round: bossRound, bossId: boss?.id ?? null, targets, from: state.round + 1 }),
            consumables: spent,
          }
        }
        // Time Capsule (H6): two rerolls for the next round.
        if (item.type === 'capsule') {
          return { ...state, nextRoundRerollBonus: (state.nextRoundRerollBonus || 0) + 2, consumables: spent }
        }
        if (item.type === 'pouch') {
          return { ...state, shards: state.shards + Math.max(4, state.round * 2), consumables: spent }
        }
        if (item.type === 'charm') {
          // Used mid-round it helps right now; in a shop, next round.
          if (rolling) return { ...state, rerollsBonusThisRound: state.rerollsBonusThisRound + 3, consumables: spent }
          return { ...state, nextRoundRerollBonus: (state.nextRoundRerollBonus || 0) + 3, consumables: spent }
        }
        if (item.type === 'spark') {
          if (state.shop?.forgeOpen) return state
          return { ...state, shop: { ...state.shop, forgeOpen: true }, consumables: spent }
        }
        if (item.type === 'loom') {
          const fresh = rollShopStock(state, shopTypeById(state.shop.type))
          return {
            ...state,
            shop: {
              ...state.shop,
              itemOffers: fresh.itemOffers,
              buyableElements: fresh.buyableElements,
              dieSizes: fresh.dieSizes,
              restocks: (state.shop.restocks || 0) + 1,
            },
            consumables: spent,
          }
        }
        return state
      }

      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die) return state

      let dice = state.dice
      let ownedElementsEver = state.ownedElementsEver

      if (item.type === 'upgrade') {
        const next = growTier(state, die)
        if (!next) return state
        dice = state.dice.map((d) =>
          d.id === die.id ? { ...d, tierId: next.id, sides: next.sides } : d,
        )
      } else if (item.type === 'split') {
        // Chisel (P2): a die splits in two, or a d5 chips down to a d3 and
        // leaves a Transmute behind. A d3 is too small to split.
        // Never a god (only one at a time) or the Primordial die (it is lent).
        if (uncopyable(die)) return state
        const plan = splitPlan(die)
        if (!plan) return state
        if (plan.kind === 'two' && !fitsPool(state, [...state.dice, die])) return state
        const smaller = tierById(plan.tierId)
        // Each half keeps the runes; a number it no longer has moves to its
        // top face, and runes that meet there stack for free (K3b).
        const halfRunes = fitRunes(runesOf(die), smaller.sides).map(({ id, face }) => ({ id, face }))
        const pieces = Array.from({ length: plan.kind === 'two' ? 2 : 1 }, (_, i) => ({
          ...die,
          runes: halfRunes,
          id: i === 0 ? die.id : makeId(),
          tierId: smaller.id,
          sides: smaller.sides,
          held: false,
          locked: false,
          lockedVia: null,
          ...rollDie(die.elementId, smaller.sides, state.relics),
        }))
        dice = state.dice.flatMap((d) => (d.id === die.id ? pieces : [d]))
        if (plan.kind === 'chip') {
          const target = transmuteTargetFor(die.elementId)
          const def = consumableById(`transmute_${target}`)
          return {
            ...state,
            dice: dice.map((d) =>
              d.value > d.sides ? { ...d, value: d.sides, total: d.sides, explosions: 0, rollId: random() } : d,
            ),
            consumables: [...spent, { ...def, instanceId: makeId() }],
          }
        }
      } else if (item.type === 'clone') {
        // Gods can't be copied, and the Primordial die is only lent.
        if (!fitsPool(state, [...state.dice, die]) || uncopyable(die)) return state
        dice = [...state.dice, { ...die, id: makeId(), held: false, locked: false, lockedVia: null, rollId: random() }]
      } else if (item.type === 'warp') {
        // Warp Seal (H3).
        if (!consumableTargetOk(state, item, die)) return state
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, edition: 'warp' } : d))
      } else if (item.type === 'rune') {
        // A Rune (K3b) is inscribed on one number (`action.face`, the top
        // face if none is given). A rune already there is replaced, unless a
        // Gem Socket lets a second one stack.
        if (!consumableTargetOk(state, item, die)) return state
        const face = Math.max(1, Math.min(die.sides, Math.round(action.face ?? die.sides)))
        dice = state.dice.map((d) => (d.id === die.id ? inscribe(d, item.rune, face) : d))
      } else if (item.type === 'graft') {
        // Graft (K6): a rune leaves this die (`action.runeIndex` among its
        // runes) for `action.toDieId`, on the number `action.face`.
        const to = state.dice.find((d) => d.id === action.toDieId)
        const moving = runesOf(die)[action.runeIndex ?? 0]
        if (!moving || !to || to.id === die.id || isMythic(to.elementId)) return state
        const face = Math.max(1, Math.min(to.sides, Math.round(action.face ?? to.sides)))
        const left = runesOf(die).filter((_, i) => i !== (action.runeIndex ?? 0))
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, runes: left } : d.id === to.id ? inscribe(d, moving.id, face) : d))
      } else if (item.type === 'weights') {
        // Weights (K6): faces below 2 count as 2 (engine/scoring.js).
        if (die.weights) return state
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, weights: true } : d))
      } else if (item.type === 'socket') {
        if (!consumableTargetOk(state, item, die)) return state
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, socket: true } : d))
      } else if (item.type === 'solvent') {
        // Solvent (K6): bonus, runes and Weights go; 5 Shards come back.
        if (!consumableTargetOk(state, item, die)) return state
        return {
          ...state,
          shards: state.shards + 5,
          dice: state.dice.map((d) => (d.id === die.id ? { ...d, bonus: 0, runes: [], weights: false } : d)),
          consumables: spent,
        }
      } else if (item.type === 'watch') {
        // Pocket Watch (I2): next round this die starts held, on this face.
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, watch: d.value } : d))
      } else if (item.type === 'hone') {
        // Whetstone +2; Honing Oil +4 (K6), on top.
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, bonus: (d.bonus || 0) + (item.honeBy || 2) } : d))
      } else if (item.type === 'infuse' || item.type === 'arcanize') {
        let options
        if (item.type === 'infuse') {
          if (ELEMENTS[die.elementId].tier !== 'pure') return state
          options = DOUBLE_FUSION_IDS.filter((id) => ELEMENTS[id].parents.includes(die.elementId))
        } else {
          options = ARCANE_DIE_IDS.filter((id) => {
            const r = rarityForElement(id)
            return (r === RARITY.RARE || r === RARITY.EPIC) && id !== die.elementId
          })
        }
        const elementId = randomOf(options)
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, elementId, growth: 0 } : d))
        if (!ownedElementsEver.includes(elementId)) ownedElementsEver = [...ownedElementsEver, elementId]
      } else if (item.type === 'transmute') {
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, elementId: item.targetElementId, rune: null, runes: [] } : d))
        if (!ownedElementsEver.includes(item.targetElementId)) {
          ownedElementsEver = [...ownedElementsEver, item.targetElementId]
        }
      } else {
        return state
      }

      // A die that shrank mid-round can't keep a face it no longer has.
      dice = dice.map((d) =>
        d.value > d.sides ? { ...d, value: d.sides, total: d.sides, explosions: 0, rollId: random() } : d,
      )
      return {
        ...state,
        dice,
        ownedElementsEver,
        consumables: spent,
      }
    }

    case 'REROLL_SHOP_OFFERS': {
      if (state.phase !== 'shop' || !shopTypeById(state.shop.type).reroll || state.shop.rerollLocked) return state
      const cost = rerollShopOffersCost(state)
      if (state.shards < cost) return state
      const fresh = rollShopStock(state, shopTypeById(state.shop.type))
      return {
        ...state,
        shards: state.shards - cost,
        // The Rolling Joke counts shop rerolls too (R4).
        rerollsTotal: (state.rerollsTotal || 0) + 1,
        shop: { ...state.shop, ...fresh, rerollShopUses: state.shop.rerollShopUses + 1, restocks: (state.shop.restocks || 0) + 1 },
      }
    }

    // Forge (and Bazaar): pay to grow one die a size.
    case 'UPGRADE_DIE': {
      if (state.phase !== 'shop' || !shopTypeById(state.shop.type).upgrades) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      const up = die && dieUpgradeCost(die, state.relics, state.shop, state.realm)
      if (!up || state.shards < up.cost) return state
      return {
        ...state,
        shards: state.shards - up.cost,
        dice: state.dice.map((d) => (d.id === die.id ? { ...d, tierId: up.next.id, sides: up.next.sides, fresh: up.apprentice ? agedFresh(d.fresh, 'upgrades') : d.fresh } : d)),
      }
    }

    // Alchemist (and Bazaar): two owned consumables become one of a rarer
    // kind (one step above the rarer input, as high as the pool goes).
    case 'BREW': {
      if (state.phase !== 'shop' || !shopTypeById(state.shop.type).brew) return state
      const [a, b] = [action.a, action.b].map((id) => state.consumables.find((c) => c.instanceId === id))
      if (!a || !b || a.instanceId === b.instanceId) return state
      const cost = brewCost(state)
      if (state.shards < cost) return state
      const want = Math.max(RARITY_ORDER.indexOf(a.rarity), RARITY_ORDER.indexOf(b.rarity)) + 1
      const top = Math.max(...CONSUMABLES.map((c) => RARITY_ORDER.indexOf(c.rarity)))
      const rarity = RARITY_ORDER[Math.min(want, top)]
      const def = randomOf(CONSUMABLES.filter((c) => c.rarity === rarity))
      const rest = state.consumables.filter((c) => c.instanceId !== a.instanceId && c.instanceId !== b.instanceId)
      return {
        ...state,
        shards: state.shards - cost,
        consumables: [...rest, { ...def, instanceId: makeId() }],
        shop: { ...state.shop, lastBrew: def.id },
      }
    }

    // One Nix deal per Black Market visit, the betrayal pact included.
    case 'TAKE_DEAL': {
      if (state.phase !== 'shop' || state.shop.dealTaken) return state
      const offered = [...(state.shop.deals || []), ...(state.shop.betrayal ? [state.shop.betrayal] : [])]
      const deal = offered.find((d) => d.id === action.dealId)
      if (!deal || !dealAvailable(state, deal)) return state
      const betrayal = isBetrayal(deal.id)
      const before = state.nixPacts || 0
      let next = {
        ...state,
        shop: { ...state.shop, dealTaken: deal.id },
        nixPacts: before + 1,
        boons: addBoon(state, deal.id, 'nix', deal.relicId ?? deal.elementId ?? deal.shards ?? null),
      }
      next = addAccord(applyDeal(next, deal), betrayal ? 'betrayal' : 'pact')
      return settleShrines(next, before)
    }

    // Aeris's blessings (and the Prophecy), paid for as your Nix pacts
    // demand (B3).
    case 'TAKE_BLESSING': {
      if (state.phase !== 'shop' || state.shop.blessingTaken) return state
      const id = action.blessingId
      if (id !== 'prophecy' && !state.shop.blessings?.includes(id)) return state
      if (!canPayAeris(state)) return state
      const shop = { ...state.shop, blessingTaken: id, paid: aerisCost(state) }
      if (id === 'prophecy') {
        const round = nextBossRound(state)
        if (!round) return state
        const boss = pickBossModifier(state, round)
        const paid = payAeris(state)
        return addAccord(
          {
            ...paid,
            map: { ...paid.map, prophecy: { round, boss } },
            boons: addBoon(paid, 'prophecy', 'aeris', { round, bossId: boss.id }),
            shop,
          },
          'blessing',
        )
      }
      if (!blessingAvailable(state, id)) return state
      const paid = payAeris({ ...state, shop })
      const blessed = applyBlessing({ ...paid, boons: addBoon(paid, id, 'aeris') }, id)
      return addAccord(blessed, 'blessing')
    }

    case 'CHOOSE_BOSS_REWARD': {
      if (state.phase !== 'bossReward' || !BOSS_REWARDS.includes(action.slot)) return state
      const canGrow = state.dice.some((d) => growTier(state, d))
      const die = state.dice.find((d) => d.id === action.dieId)
      if (canGrow && !(die && growTier(state, die))) return state
      // The optional third choice: one of the Laws on offer (O2).
      const lawChoice = (state.rewardLaws || []).includes(action.lawId) ? relicById(action.lawId) : null
      return { ...applyBossReward(state, action), phase: 'shop', ...(lawChoice ? { law: lawChoice } : {}), rewardLaws: [] }
    }

    // Pick the next stop on the Road (a shop linked from the current one).
    case 'CHOOSE_PATH': {
      if (state.phase !== 'shop' || !state.map) return state
      if (!nextChoices(state.map).some((n) => n.id === action.nodeId)) return state
      return { ...state, map: { ...state.map, pendingId: action.nodeId } }
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'shop') return state
      if (state.shop?.type === 'camp') return retryRound(state)
      const round = state.round + 1
      if (round > finalRound(state) && !state.endless) {
        return { ...withRecipe(state, QUADRA_FUSION_ID), phase: 'victory', ending: state.ending ?? state.path ?? 'neutral' }
      }
      // Leaving a shop ends one of an apprentice's two visits (N6).
      if (state.dice.some((d) => d.fresh)) state = { ...state, dice: state.dice.map((d) => (d.fresh ? { ...d, fresh: agedFresh(d.fresh, 'visits') } : d)) }
      let map = travel(state.map, round)
      if (!map) return state
      // Leaving a Black Market empty-handed invites a Shrine ahead (B3);
      // with Aeris gone, Shrines stay gone on newly laid Road too.
      if (state.shop.type === 'blackmarket' && !state.shop.dealTaken && !aerisGone(state)) map = inviteShrine(map, state.round)
      if (aerisGone(state)) map = banShrines(map, state.round)
      return enterRound({ ...state, map }, round)
    }

    // Blessing of Clarity: swap the stop this round leads to for another
    // one linked from the last shop, once per charge.
    case 'REROUTE': {
      if ((state.phase !== 'rolling' && state.phase !== 'missed') || !(state.reroutes > 0) || !state.map) return state
      const from = nodeById(state.map, state.map.path[state.map.path.length - 2])
      if (!from?.next.includes(action.nodeId) || action.nodeId === state.map.currentId) return state
      return {
        ...state,
        reroutes: state.reroutes - 1,
        map: { ...state.map, currentId: action.nodeId, path: [...state.map.path.slice(0, -1), action.nodeId] },
      }
    }

    // After a win: keep playing the same run, with targets still climbing.
    // The final boss's reward and shop come first, then round 16.
    case 'CONTINUE_ENDLESS': {
      // The Split and Primordial endings close the run (B2).
      if (state.phase !== 'victory' || (state.ending && state.ending !== 'neutral')) return state
      const shopType = currentNode(state.map)?.type ?? 'market'
      const chronicle = state.chronicle ?? { bosses: [], shops: [] }
      return {
        ...state,
        endless: true,
        phase: 'bossReward',
        chronicle: { ...chronicle, shops: [...chronicle.shops, { round: state.round, type: shopType }] },
        shop: { ...buildShopOffers(state, shopType), afterBoss: true },
      }
    }

    // Atlas's Cartography (EXPANSION.md H6): one of each service per visit.
    case 'USE_SERVICE': {
      if (state.phase !== 'shop' || !shopTypeById(state.shop.type).services || !state.map) return state
      const service = ATLAS_SERVICES.find((x) => x.id === action.serviceId)
      if (!service || state.shop.servicesUsed?.includes(service.id) || state.shards < service.cost) return state
      const map = ensureLayers(state.map, state.round + 1)
      let next = map
      let peek = null
      if (service.id === 'redraw') next = redrawRow(map, state.round)
      if (service.id === 'path') {
        if (unlinkedNext(map).length === 0) return state
        next = addPath(map)
      }
      if (service.id === 'peek') {
        // The next Warden, like a Prophecy (it is fixed by the set).
        const round = [20, 25, 30].find((r) => r > state.round)
        const warden = round && (rewriterAt(state, round) || wardenFor(state.path, state.firmamentSet, round))
        if (!warden) return state
        peek = { round, bossId: warden.id }
        next = { ...map, peeks: { ...(map.peeks || {}), [round]: warden.id } }
      }
      return {
        ...state,
        shards: state.shards - service.cost,
        map: next,
        shop: { ...state.shop, servicesUsed: [...(state.shop.servicesUsed || []), service.id], ...(peek ? { peek } : {}) },
      }
    }

    // Mote's secret stock (H6).
    case 'BUY_MOTE': {
      if (state.phase !== 'shop' || state.shop.type !== 'pantry') return state
      const offer = state.shop.moteStock?.[action.index]
      if (!offer || offer.sold) return state
      const cost = moteOfferCost(state, offer)
      if (state.shards < cost) return state
      let next = state
      if (offer.kind === 'pact') {
        // Mote's Hollow Pact is no deal with Nix: no pact counted, no Accord.
        if (state.relics.length >= relicCapFor(state)) return state
        next = applyDeal(state, { id: 'hollow_pact' })
      } else if (offer.kind === 'consumable') {
        if (state.consumables.length >= consumableCapFor(state)) return state
        next = { ...state, consumables: giveConsumable(state, consumableById(offer.id)) }
      } else if (offer.kind === 'stardust') {
        // Mote's 120 stock: 2 Stardust for one Stardust's price (K2, Default).
        next = { ...state, stardust: (state.stardust || 0) + offer.amount }
      } else {
        const die = makeDie(offer.elementId, STARTING_TIER, 'warp')
        if (!fitsPool(state, [...state.dice, die]) || holdsKind(state.dice, offer.elementId)) return state
        const ownedElementsEver = state.ownedElementsEver.includes(offer.elementId)
          ? state.ownedElementsEver
          : [...state.ownedElementsEver, offer.elementId]
        next = { ...state, dice: [...state.dice, die], ownedElementsEver }
      }
      const stock = state.shop.moteStock.map((o, i) => (i === action.index ? { ...o, sold: true } : o))
      return { ...next, shards: next.shards - cost, shop: { ...next.shop, moteStock: stock } }
    }

    // The Crossroads (EXPANSION.md H1): rest here and end the run with the
    // Elementa ending, or walk through the door.
    case 'REST_HERE': {
      if (state.phase !== 'crossroads') return state
      return { ...state, phase: 'victory' }
    }

    // Through the door: the same run goes on into the Firmament. Everything
    // is kept; the boss reward and a first Market with Tobb come first,
    // then round 16.
    case 'ENTER_FIRMAMENT': {
      if (state.phase !== 'crossroads' || !firmamentSets(state).includes(action.set)) return state
      const path = state.path ?? 'neutral'
      const chronicle = state.chronicle ?? { bosses: [], shops: [] }
      const next = {
        ...state,
        realm: 'firmament',
        firmamentSet: action.set,
        ending: null,
        // The final battle is over: no gauntlet stage or borrowed pool past
        // the door (the camp must open again after a miss).
        gauntlet: null,
        roundPool: null,
        map: enterFirmament(state.map, FOLLOWER_SHOP[path]),
        chronicle: { ...chronicle, shops: [...chronicle.shops, { round: state.round, type: 'market' }] },
      }
      return {
        ...next,
        phase: 'bossReward',
        // The path follower greets you in this first shop (H7).
        shop: { ...buildShopOffers(next, 'market'), afterBoss: true, firstFirmament: true },
      }
    }

    // Through the second door (R1): the same run goes on into realm 3, rounds
    // 31 to 45, with the path's Rewriters.
    case 'ENTER_REALM3': {
      if (state.phase !== 'crossroads' || state.realm !== 'firmament' || state.realm3 || !doorOpen3(state) || !realm3Sets(state).includes(action.set)) return state
      const chronicle = state.chronicle ?? { bosses: [], shops: [] }
      const next = {
        ...state,
        realm3: true,
        realm3Set: action.set,
        ending: null,
        map: enterRealm3(state.map),
        chronicle: { ...chronicle, shops: [...chronicle.shops, { round: state.round, type: 'market' }] },
      }
      return { ...next, phase: 'bossReward', shop: { ...buildShopOffers(next, 'market'), afterBoss: true, firstRealm3: true } }
    }

    case 'RETURN_HOME':
      return { ...baseTitleState(), phase: 'menu' }

    default:
      return state
  }
}

export const selectors = {
  availableRerolls,
  projectedPath,
  knowsGods,
  godCapFor,
  scoreContext,
  driftChargesLeft,
  eyeActive,
  eyeGreater,
  sigilCost,
  peekReroll,
  aerisCost,
  canPayAeris,
  aerisGone,
  relicSellValue,
  betrayalEligible,
  newDieCost,
  dieUpgradeCost,
  relicCost,
  consumableCost,
  rerollShopOffersCost,
  sellValueForDie,
  sellValueForRelic,
  sellValueForConsumable,
  isFusionElement,
  rarityUnlockRound: (rarity) => RARITY_UNLOCK_ROUND[rarity],
  maxDiceFor,
  maxConsumables: MAX_CONSUMABLES,
  relicCapFor,
  consumableCapFor,
  winRound: WIN_ROUND,
  effectiveRelics,
  isBossRound,
  forgeCost,
  forgeableRecipes,
  brewCost,
  dealAvailable,
  blessingAvailable,
  nextBossRound,
  shopOnlyConsumables: SHOP_ONLY_CONSUMABLES,
  consumableTargetOk,
  shopDieSize: (shop, elementId) => shop?.dieSizes?.[elementId] ?? SHOP_DIE_TIER,
  // The Firmament (H3 to H5).
  poolSize,
  warpCount,
  warpCap: WARP_CAP,
  fitsPool,
  holdsKind,
  growTier,
  emptySlots,
  holdsTime,
  finalRound,
  moteOfferCost,
  motePays,
  moteTier,
  unlinkedNext,
  doorOpen,
  firmamentSets,
  realm3Sets,
  effectiveThreshold,
  holdLimit,
  isFixedBoss,
  stardustPrice: STARDUST_PRICE,
  forgePlan,
  inscribe,
  isMythicDie: isMythic,
  forgeMatches: (state, dieIds) => forgeMatches(state, dieIds.map((id) => state.dice.find((d) => d.id === id)).filter(Boolean)),
  vesperHere,
  forgeSlots: FORGE_SLOTS,
  collapseChance: COLLAPSE_CHANCE,
  canRewind: (state) => state.phase === 'rolling' && Boolean(state.lastReroll) && holdsTime(state.dice) && !state.rewindUsed,
}
