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
  rarityForElement,
} from '../data/elements.js'
import { nextTier, prevTier, tierById, sellValueForDie } from '../data/diceTiers.js'
import { RELICS, RARITY, relicById, costForRelic, sellValueForRelic } from '../data/relics.js'
import { CONSUMABLES, consumableById, costForConsumable, sellValueForConsumable } from '../data/consumables.js'
import { deckById } from '../data/decks.js'
import { difficultyById } from '../data/difficulty.js'
import { BOSS_MODIFIERS, PRIMORDIAL, PRIMORDIAL_POOL, bossById, isBossRound } from '../data/bossModifiers.js'
import { rollDie, rerollPool, evaluatePool, thresholdForRound, shardsEarned, interestFor } from './scoring.js'
import { random, getRngState, setRngState, seedToState, randomSeed, cleanSeed } from './rng.js'
import { shopTypeById, DEALS, BLESSINGS, dealById, blessingById } from '../data/shops.js'
import { newMap, ensureLayers, nodeById, currentNode, nextChoices } from './map.js'

const STARTING_TIER = 'd6'
const STARTING_REROLLS = 3
const WIN_ROUND = 15
const LIFE_REGEN_EVERY_N_ROUNDS = 4
const MAX_DICE = 10
const MAX_CONSUMABLES = 3
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
}

const RARITY_WEIGHT = {
  [RARITY.COMMON]: 6,
  [RARITY.UNCOMMON]: 4,
  [RARITY.RARE]: 2,
  [RARITY.EPIC]: 1,
  [RARITY.LEGENDARY]: 1,
}

const FORGE_BASE_COST_BY_TIER = {
  double: 6,
  triple: 10,
  quadra: 16,
}

const DIE_BASE_COST_BY_TIER = {
  double: 12,
  triple: 20,
  quadra: 64,
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
  if (!state.bossModifier) return state.relics
  // Silence seals one owned relic for the round.
  const sealed = state.bossModifier.effects?.sealedRelicId
  const relics = sealed ? state.relics.filter((r) => r.id !== sealed) : state.relics
  return [...relics, state.bossModifier]
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

function pickBossModifier(state, round) {
  if (round % WIN_ROUND === 0) return primordialWith(randomOf(PRIMORDIAL_POOL))
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
  const template = randomOf(pool)
  if (template.id === 'null_zone') {
    return { ...template, effects: { ...template.effects, bannedElementId: randomOf(ownedIds) } }
  }
  if (template.id === 'silence') {
    return { ...template, effects: { ...template.effects, sealedRelicId: randomOf(state.relics).id } }
  }
  return template
}

// Round-start boss effects that change the dice themselves.
function applyBossRoundStart(dice, boss) {
  if (!boss?.effects?.frostbite || dice.length === 0) return dice
  const target = randomOf(dice)
  return dice.map((d) =>
    d.id === target.id
      ? { ...d, value: 1, total: 1, explosions: 0, held: true, locked: true, lockedVia: 'freeze' }
      : d,
  )
}

function makeDie(elementId, tierId = STARTING_TIER) {
  const sides = tierById(tierId).sides
  return {
    id: makeId(),
    elementId,
    tierId,
    sides,
    held: false,
    locked: false,
    lockedVia: null,
    value: 1,
    total: 1,
    explosions: 0,
    rollId: 0,
  }
}

const countExplosions = (dice) => dice.reduce((sum, d) => sum + (d.explosions || 0), 0)

// Round-level counters that reset whenever a round (or a retry) starts:
// the Drift and Gust charges, and the explosions Heat has seen so far.
function freshRoundCounters(dice) {
  return { driftUsed: false, gustUsed: false, explosionsThisRound: countExplosions(dice) }
}

// What scoring needs to know beyond the dice and relics.
function scoreContext(state) {
  return { rerollsLeft: availableRerolls(state), explosionsThisRound: state.explosionsThisRound || 0 }
}

function rollFreshRound(dice, relics) {
  return dice.map((d) => ({
    ...d,
    growth: 0,
    patience: 0,
    kindled: false,
    held: false,
    locked: false,
    lockedVia: null,
    ...rollDie(d.elementId, d.sides, relics),
  }))
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

function dieUpgradeCost(die, relics, shop) {
  const next = nextTier(die.tierId)
  if (!next) return null
  return { next, cost: applyDiscount(next.upgradeCost, relics, shopCut(shop, 'upgrade')) }
}

function isFusionElement(elementId) {
  return ELEMENTS[elementId].tier !== 'pure'
}

function newDieCost(elementId, dice, relics, shop) {
  const tier = ELEMENTS[elementId].tier
  const owned = dice.filter((d) => d.elementId === elementId).length
  const base =
    tier === 'pure'
      ? 4 + owned
      : tier === 'arcane'
        ? ELEMENTS[elementId].price ?? ARCANE_DIE_COST_BY_RARITY[rarityForElement(elementId)]
        : DIE_BASE_COST_BY_TIER[tier]
  return applyDiscount(base, relics, shopCut(shop, 'die'))
}

function relicCost(relic, relics, shop) {
  return applyDiscount(costForRelic(relic), relics, shopCut(shop, 'relic'))
}

function consumableCost(def, relics, shop) {
  return applyDiscount(costForConsumable(def), relics, shopCut(shop, 'consumable'))
}

function rerollShopOffersCost(state) {
  const fx = relicEffects(state.relics)
  return Math.max(1, 3 + state.shop.rerollShopUses - (fx.shopRerollDiscount || 0))
}

// Forging a fusion die trades its parent dice (consumed) plus Shards for
// the fusion die, an alternative to hoping the shop offers it. Works for
// any fusion tier: a double costs 2 parents, a triple 3, the quadra all 4.
// See GDD.md §13a/§18.
function forgeCost(relics, tier, shop) {
  const fx = relicEffects(relics)
  return applyDiscount(Math.max(1, FORGE_BASE_COST_BY_TIER[tier] - (fx.forgeDiscount || 0)), relics, shopCut(shop, 'forge'))
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

function forgeableRecipes(state) {
  const ownedCounts = new Map()
  state.dice.forEach((d) => ownedCounts.set(d.elementId, (ownedCounts.get(d.elementId) || 0) + 1))
  const ids = knowsAether(state) ? ALL_FUSION_IDS : ALL_FUSION_IDS.filter((id) => id !== QUADRA_FUSION_ID)
  return ids.map((fusionElementId) => {
    const def = ELEMENTS[fusionElementId]
    // The Forge is open only in Forge-type shops (or with a Fusion Spark).
    const canForge = Boolean(state.shop?.forgeOpen) && def.parents.every((p) => (ownedCounts.get(p) || 0) >= 1)
    return {
      fusionElementId,
      parents: def.parents,
      tier: def.tier,
      canForge,
      cost: forgeCost(state.relics, def.tier, state.shop),
    }
  })
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

const RARITY_ORDER = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY]

// The whole shop is luck-gated the same way: a small random sample rather
// than "everything you've unlocked, guaranteed". Relics and consumables
// share one pool (an item is an item), dice are a separate pool, both
// weighted by the same rarity scale/round-gating. What a shop stocks, and
// how much of it, comes from its type (data/shops.js).
function rollShopStock(state, type) {
  const ownedRelicIds = new Set(state.relics.map((r) => r.id))
  const itemPool = [
    ...(type.itemKinds.includes('relic') ? RELICS.filter((r) => !ownedRelicIds.has(r.id)) : []),
    ...(type.itemKinds.includes('consumable') ? CONSUMABLES : []),
  ]
  const weight = type.relicLuck ? vaultWeight : rarityWeight
  const itemOffers = weightedSample(itemPool, type.items, (item) => weight(item, state.round)).map((item) => ({
    kind: item.kind,
    id: item.id,
  }))

  const unlockedFusions = fusionsUnlockedBy(state.ownedElementsEver).filter(
    (id) => id !== QUADRA_FUSION_ID || knowsAether(state),
  )
  const allBuyable = [...PURE_ELEMENT_IDS, ...unlockedFusions, ...ARCANE_DIE_IDS].map((id) => ({
    id,
    rarity: rarityForElement(id),
  }))
  const dieOfferCount = Math.min(type.dice, allBuyable.length)
  const buyableElements = weightedSample(allBuyable, dieOfferCount, (item) =>
    rarityWeight(item, state.round + (type.legendary ? 3 : 0)),
  ).map((item) => item.id)

  return { itemOffers, buyableElements }
}

function rollDeal(state, id) {
  if (id === 'blood_relic') {
    const owned = new Set(state.relics.map((r) => r.id))
    const pick = (rarity) => RELICS.filter((r) => r.rarity === rarity && !owned.has(r.id))
    const pool = pick(RARITY.LEGENDARY).length ? pick(RARITY.LEGENDARY) : pick(RARITY.EPIC)
    return pool.length ? { id, relicId: randomOf(pool).id } : null
  }
  if (id === 'soul_die') return { id, elementId: randomOf(TRIPLE_FUSION_IDS) }
  if (id === 'loan') return { id, shards: 10 + state.round * 2 }
  return { id }
}

// Shards Tobb hands over at the safety camp: 3 + half the round.
function campPayout(round) {
  return 3 + Math.floor(round / 2)
}

function buildShopOffers(state, typeId = 'market') {
  const type = shopTypeById(typeId)
  const stock = rollShopStock(state, type)
  const deals = type.deals
    ? weightedSample(DEALS, type.deals, () => 1)
        .map((d) => rollDeal(state, d.id))
        .filter(Boolean)
    : []
  const blessings = type.blessings ? weightedSample(BLESSINGS, type.blessings, () => 1).map((b) => b.id) : []
  return {
    type: type.id,
    ...stock,
    rerollShopUses: 0,
    forgeOpen: Boolean(type.forge),
    deals,
    dealTaken: false,
    blessings,
    blessingTaken: false,
  }
}

function availableRerolls(state) {
  const fx = relicEffects(effectiveRelics(state))
  const uncapped =
    STARTING_REROLLS -
    (state.difficulty.rerollPenalty || 0) +
    state.permanentRerollBonus +
    state.rerollsBonusThisRound +
    (fx.overclockRerollBonus || 0)
  const cap = fx.maxRerollsOverride != null ? Math.min(uncapped, fx.maxRerollsOverride) : uncapped
  return cap - state.rerollsUsed
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
    // Highest single cast this run, for Run Info and achievements.
    bestCast: 0,
    // Secret recipes this save file knows (copied from the profile).
    recipes: [],
    // Family abilities and relics with a per-round charge (E8).
    driftUsed: false,
    gustUsed: false,
    explosionsThisRound: 0,
  }
}

function startNewRun(deckId, difficultyId, activeSlot = null, seedInput = '', recipes = []) {
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
    rngState: getRngState(),
  }
}

// Shared by NEXT_ROUND and CONTINUE_ENDLESS: roll into `round`.
function enterRound(state, round) {
  const prophecy = state.map?.prophecy
  const foretold = prophecy?.round === round ? revalidateBoss(state, prophecy.boss, round) : null
  const bossModifier = isBossRound(round, state.difficulty) ? foretold ?? pickBossModifier(state, round) : null
  const dice = applyBossRoundStart(
    rollFreshRound(state.dice, bossModifier ? effectiveRelics({ relics: state.relics, bossModifier }) : state.relics),
    bossModifier,
  )
  return {
    ...state,
    phase: 'rolling',
    round,
    bossModifier,
    map: prophecy?.round === round ? { ...state.map, prophecy: null } : state.map,
    chronicle: noteBoss(state.chronicle, bossModifier),
    threshold: Math.round(thresholdForRound(round, state.difficulty) * (state.nextTargetMult || 1)),
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

// Try the same round again with fresh dice (after a miss, or leaving the
// camp). A Lucky Charm or Blessing of Tide bought at camp counts here.
function retryRound(state) {
  const dice = applyBossRoundStart(rollFreshRound(state.dice, effectiveRelics(state)), state.bossModifier)
  return {
    ...state,
    phase: 'rolling',
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
  const next = die && nextTier(die.tierId)
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

function brewCost(state) {
  return applyDiscount(4, state.relics, shopCut(state.shop, 'brew'))
}

// Whether a Black Market deal can be paid right now (never lethal, never
// past a cap).
function dealAvailable(state, deal) {
  if (deal.id === 'blood_relic') return state.lives >= 2 && state.relics.length < relicCapFor(state)
  if (deal.id === 'soul_die') return state.maxLives >= 2 && state.dice.length < maxDiceFor(state)
  if (deal.id === 'hollow_pact') return state.relics.length < relicCapFor(state)
  return true
}

function blessingAvailable(state, id) {
  if (id === 'kindle') return state.dice.some((d) => nextTier(d.tierId))
  if (id === 'aether_gift') return state.consumables.length < consumableCapFor(state)
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

export function initialState() {
  return baseTitleState()
}

// Restores the seeded generator from the state before each action and saves
// it back after, so randomness is part of the (saveable) game state.
export function gameReducer(state, action) {
  if (typeof state.rngState === 'number') setRngState(state.rngState)
  const next = reduce(state, action)
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
      return startNewRun(action.deckId, action.difficultyId, state.activeSlot, action.seed, action.recipes)

    // Chosen a filled slot: hydrate its full snapshot, but land on a
    // preview screen (dice loadout, difficulty, round) rather than
    // dropping straight back into whatever mid-round state it was saved
    // at. The saved phase is stashed in resumePhase for RESUME_RUN.
    case 'LOAD_RUN':
      // Older saves predate seeds: give them a generator state so the rest
      // of the run is still saved and reproducible from here on.
      return {
        ...action.save,
        activeSlot: action.slot ?? action.save.activeSlot,
        rngState: action.save.rngState ?? Math.floor(Math.random() * 4294967296),
        // Saves from before the Road: lay one out from here.
        map: action.save.map ?? legacyMap(action.save),
        // The file's recipes win over the snapshot's (it may predate them).
        recipes: action.recipes ?? action.save.recipes ?? [],
        phase: 'runPreview',
        resumePhase: action.save.phase,
      }

    case 'RESUME_RUN': {
      if (state.phase !== 'runPreview' || !state.resumePhase) return state
      return { ...state, phase: state.resumePhase, resumePhase: null }
    }

    case 'TOGGLE_HELD': {
      if (state.phase !== 'rolling') return state
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
      if (!die || die.locked || !acting.flags[FLAGS.FREE_LOCK]) return state

      const fx = relicEffects(effectiveRelics(state))
      if (fx.noFreeLock) return state
      const grantsReroll = acting.flags[FLAGS.GRANTS_REROLL_ON_LOCK]
      const rerollGrant = grantsReroll ? 1 + (fx.waterLockRerollBonus || 0) : 0
      const adjacent = acting.flags[FLAGS.ADJACENT_FREE_LOCK]

      const adjacentId = adjacent ? state.dice[idx + 1]?.id : null

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
          const rolled = rollDie(target.elementId, target.sides, effectiveRelics(state))
          dice = dice.map((d) => (d.id === target.id ? { ...d, ...rolled } : d))
          explosionsThisRound += rolled.explosions
        }
      }

      return { ...state, dice, rerollsBonusThisRound, explosionsThisRound }
    }

    case 'FREEZE_DIE': {
      if (state.phase !== 'rolling') return state
      const fx = relicEffects(effectiveRelics(state))
      const charges = fx.freezeChargePerRound || 0
      if (state.freezeChargesUsed >= charges) return state
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
      const tax = fx.rerollShardCost || 0
      if (state.shards < tax) return state
      let dice = rerollPool(state.dice, effectiveRelics(state))
      if (fx.overclockZeroChance) {
        dice = dice.map((d) => {
          if (d.held || d.locked) return d
          if (random() < fx.overclockZeroChance) {
            return { ...d, value: 1, total: 1, explosions: 0 }
          }
          return d
        })
      }
      // Kindling (Fire family): a rerolled die that lands on a fizzling 1
      // pays back one reroll this round. `kindled` drives the "+1" pop.
      const rerolled = new Set(state.dice.filter((d) => !d.held && !d.locked).map((d) => d.id))
      let kindling = 0
      dice = dice.map((d) => {
        if (!rerolled.has(d.id)) return d
        const kindled = d.value === 1 && elementHasFlag(d.elementId, FLAGS.ZERO_ON_MIN) && inFamily(d.elementId, 'fire')
        if (kindled) kindling += 1
        return { ...d, kindled }
      })
      const explosionsThisRound =
        (state.explosionsThisRound || 0) + countExplosions(dice.filter((d) => rerolled.has(d.id)))
      // Primordial reshapes its twist after every reroll.
      const bossModifier =
        state.bossModifier?.id === 'primordial'
          ? primordialWith(randomOf(PRIMORDIAL_POOL.filter((id) => id !== state.bossModifier.twistId)))
          : state.bossModifier
      return {
        ...state,
        dice,
        bossModifier,
        shards: state.shards - tax,
        rerollsUsed: state.rerollsUsed + 1,
        rerollsBonusThisRound: state.rerollsBonusThisRound + kindling,
        explosionsThisRound,
      }
    }

    // Drift (Air family): once per round, nudge one Air-family die's face
    // up or down by 1. Landing on the max face doesn't explode, and a
    // boss-frozen or frozen die stays put.
    case 'NUDGE_DIE': {
      if (state.phase !== 'rolling' || state.driftUsed) return state
      if (action.delta !== 1 && action.delta !== -1) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die || !inFamily(die.elementId, 'air') || die.lockedVia === 'freeze') return state
      const value = die.value + action.delta
      if (value < 1 || value > die.sides) return state
      return {
        ...state,
        driftUsed: true,
        dice: state.dice.map((d) => (d.id === die.id ? { ...d, value, total: value, explosions: 0, kindled: false } : d)),
      }
    }

    // Gust (relic): once per round, reroll one chosen die for free.
    case 'GUST_REROLL': {
      if (state.phase !== 'rolling' || state.gustUsed) return state
      const relics = effectiveRelics(state)
      if (!relicEffects(relics).freeSingleReroll) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die || die.locked) return state
      const rolled = rollDie(die.elementId, die.sides, relics)
      return {
        ...state,
        gustUsed: true,
        explosionsThisRound: (state.explosionsThisRound || 0) + rolled.explosions,
        dice: state.dice.map((d) => (d.id === die.id ? { ...d, ...rolled, held: false, growth: 0, kindled: false } : d)),
      }
    }

    case 'SUBMIT_ROUND': {
      if (state.phase !== 'rolling') return state
      const result = evaluatePool(state.dice, effectiveRelics(state), scoreContext(state))
      const passed = result.roundScore >= state.threshold

      if (passed) {
        const earned = shardsEarned(result.roundScore, state.threshold, state.difficulty)
        const fx = relicEffects(effectiveRelics(state))
        const interest = interestFor(state.shards, fx.interestCapBonus || 0, fx.interestDivisor || 3)
        const base = Math.round(5 * state.difficulty.shardMultiplier)
        const bonus = (fx.shardPerExplosion || 0) * result.explodeCount + result.midasShards + result.bullionShards
        let shards = state.shards + earned + interest + bonus
        // Kept for the round-result card, so the player sees where Shards came from.
        const shardGain = { base, overkill: earned - base, interest, bonus, total: earned + interest + bonus }
        let permanentRerollBonus = state.permanentRerollBonus
        if (fx.momentumRerollOnOverkill && result.roundScore >= state.threshold * 2) {
          permanentRerollBonus += 1
        }
        let lives = state.lives
        if (state.round % LIFE_REGEN_EVERY_N_ROUNDS === 0 && lives < state.maxLives) lives += 1

        const beatBoss = Boolean(state.bossModifier)
        // The shop you walk into is the stop you picked on the Road.
        const shopType = currentNode(state.map)?.type ?? 'market'
        const chronicle = state.chronicle ?? { bosses: [], shops: [] }
        // Beating the final boss ends the run on the spot (Endless picks up
        // from the reward and shop, see CONTINUE_ENDLESS).
        const won = state.round >= WIN_ROUND && !state.endless
        // Beating Primordial teaches the Aether recipe (EXPANSION.md B6).
        if (won) state = withRecipe(state, QUADRA_FUSION_ID)
        return {
          ...state,
          // Beating a boss first offers a permanent upgrade, then the shop.
          phase: won ? 'victory' : beatBoss ? 'bossReward' : 'shop',
          chronicle: won ? chronicle : { ...chronicle, shops: [...chronicle.shops, { round: state.round, type: shopType }] },
          lastResult: { ...result, passed, threshold: state.threshold, shardGain, beatBoss },
          shards,
          permanentRerollBonus,
          lives,
          bestCast: Math.max(state.bestCast || 0, result.roundScore),
          shop: { ...buildShopOffers(state, shopType), afterBoss: beatBoss },
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
        lastResult: { ...result, passed, threshold: state.threshold, secondWindTriggered },
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
      if (state.phase !== 'missed') return state
      const pay = campPayout(state.round)
      return {
        ...state,
        phase: 'shop',
        shards: state.shards + pay,
        shop: { ...buildShopOffers(state, 'camp'), campPay: pay },
      }
    }

    case 'BUY_DIE': {
      if (state.phase !== 'shop') return state
      if (state.dice.length >= maxDiceFor(state)) return state
      const cost = newDieCost(action.elementId, state.dice, state.relics, state.shop)
      if (state.shards < cost) return state
      const die = makeDie(action.elementId)
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

    case 'SELL_DIE': {
      if (state.phase !== 'shop') return state
      if (state.dice.length <= 1) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die) return state
      const fx = relicEffects(state.relics)
      const value = sellValueForDie(die, isFusionElement(die.elementId)) + (fx.sellBonus || 0)
      return {
        ...state,
        shards: state.shards + value,
        dice: state.dice.filter((d) => d.id !== action.dieId),
      }
    }

    case 'FUSE_DICE': {
      if (state.phase !== 'shop' || !state.shop?.forgeOpen) return state
      const def = ELEMENTS[action.fusionElementId]
      if (!def || def.tier === 'pure' || def.tier === 'arcane') return state
      if (action.fusionElementId === QUADRA_FUSION_ID && !knowsAether(state)) return state
      const usedIds = new Set()
      const parentDice = []
      for (const parentId of def.parents) {
        const match = state.dice.find((d) => d.elementId === parentId && !usedIds.has(d.id))
        if (!match) return state
        usedIds.add(match.id)
        parentDice.push(match)
      }
      const cost = forgeCost(state.relics, def.tier, state.shop)
      if (state.shards < cost) return state
      const fusionDie = makeDie(action.fusionElementId)
      const ownedElementsEver = state.ownedElementsEver.includes(action.fusionElementId)
        ? state.ownedElementsEver
        : [...state.ownedElementsEver, action.fusionElementId]
      return {
        ...state,
        shards: state.shards - cost,
        dice: [...state.dice.filter((d) => !usedIds.has(d.id)), fusionDie],
        ownedElementsEver,
      }
    }

    case 'BUY_RELIC': {
      if (state.phase !== 'shop') return state
      if (state.relics.length >= relicCapFor(state)) return state
      const relic = relicById(action.relicId)
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
      const value = sellValueForRelic(relic) + (fx.sellBonus || 0)
      return {
        ...state,
        shards: state.shards + value,
        relics: state.relics.filter((r) => r.id !== action.relicId),
      }
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
          itemOffers: state.shop.itemOffers.filter(
            (o) => !(o.kind === 'consumable' && o.id === def.id),
          ),
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
          itemOffers: state.shop.itemOffers.filter((o) => !(o.kind === 'consumable' && o.id === def.id)),
        },
      }
      const applied = reduce(bought, { type: 'APPLY_CONSUMABLE', instanceId, dieId: action.dieId ?? null })
      // Couldn't apply (e.g. no valid target): undo the purchase entirely.
      return applied === bought ? state : applied
    }

    case 'SELL_CONSUMABLE': {
      if (state.phase !== 'shop') return state
      const item = state.consumables.find((c) => c.instanceId === action.instanceId)
      if (!item) return state
      const fx = relicEffects(state.relics)
      const value = sellValueForConsumable(item) + (fx.sellBonus || 0)
      return {
        ...state,
        shards: state.shards + value,
        consumables: state.consumables.filter((c) => c.instanceId !== action.instanceId),
      }
    }

    // Consumables work in the shop and during a round (except the ones
    // that only make sense in a shop: Fusion Spark, Loom of Fate).
    case 'APPLY_CONSUMABLE': {
      const rolling = state.phase === 'rolling'
      if (state.phase !== 'shop' && !rolling) return state
      const item = state.consumables.find((c) => c.instanceId === action.instanceId)
      if (!item) return state
      if (rolling && SHOP_ONLY_CONSUMABLES.includes(item.type)) return state

      const spent = state.consumables.filter((c) => c.instanceId !== action.instanceId)
      if (item.target === 'self') {
        if (item.type === 'reroll') {
          return { ...state, permanentRerollBonus: state.permanentRerollBonus + 1, consumables: spent }
        }
        if (item.type === 'heal') {
          if (state.lives >= state.maxLives) return state
          return { ...state, lives: state.lives + 1, consumables: spent }
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
        const next = nextTier(die.tierId)
        if (!next) return state
        dice = state.dice.map((d) =>
          d.id === die.id ? { ...d, tierId: next.id, sides: next.sides } : d,
        )
      } else if (item.type === 'downgrade') {
        const prev = prevTier(die.tierId)
        if (!prev) return state
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, tierId: prev.id, sides: prev.sides } : d))
      } else if (item.type === 'clone') {
        if (state.dice.length >= maxDiceFor(state)) return state
        dice = [...state.dice, { ...die, id: makeId(), held: false, locked: false, lockedVia: null, rollId: random() }]
      } else if (item.type === 'hone') {
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, bonus: (d.bonus || 0) + 2 } : d))
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
        dice = state.dice.map((d) => (d.id === die.id ? { ...d, elementId: item.targetElementId } : d))
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
      if (state.phase !== 'shop' || !shopTypeById(state.shop.type).reroll) return state
      const cost = rerollShopOffersCost(state)
      if (state.shards < cost) return state
      const fresh = rollShopStock(state, shopTypeById(state.shop.type))
      return {
        ...state,
        shards: state.shards - cost,
        shop: { ...state.shop, ...fresh, rerollShopUses: state.shop.rerollShopUses + 1, restocks: (state.shop.restocks || 0) + 1 },
      }
    }

    // Forge (and Bazaar): pay to grow one die a size.
    case 'UPGRADE_DIE': {
      if (state.phase !== 'shop' || !shopTypeById(state.shop.type).upgrades) return state
      const die = state.dice.find((d) => d.id === action.dieId)
      const up = die && dieUpgradeCost(die, state.relics, state.shop)
      if (!up || state.shards < up.cost) return state
      return {
        ...state,
        shards: state.shards - up.cost,
        dice: state.dice.map((d) => (d.id === die.id ? { ...d, tierId: up.next.id, sides: up.next.sides } : d)),
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

    case 'TAKE_DEAL': {
      if (state.phase !== 'shop' || state.shop.dealTaken) return state
      const deal = state.shop.deals?.find((d) => d.id === action.dealId)
      if (!deal || !dealAvailable(state, deal)) return state
      const shop = { ...state.shop, dealTaken: deal.id }
      state = { ...state, boons: addBoon(state, deal.id, 'nix', deal.relicId ?? deal.elementId ?? deal.shards ?? null) }
      if (deal.id === 'blood_relic') {
        return { ...state, lives: state.lives - 1, relics: [...state.relics, relicById(deal.relicId)], shop }
      }
      if (deal.id === 'loan') {
        return { ...state, shards: state.shards + deal.shards, nextTargetMult: 1.5, shop }
      }
      if (deal.id === 'soul_die') {
        const maxLives = state.maxLives - 1
        const ownedElementsEver = state.ownedElementsEver.includes(deal.elementId)
          ? state.ownedElementsEver
          : [...state.ownedElementsEver, deal.elementId]
        return {
          ...state,
          maxLives,
          lives: Math.min(state.lives, maxLives),
          dice: [...state.dice, makeDie(deal.elementId)],
          ownedElementsEver,
          shop,
        }
      }
      if (deal.id === 'hollow_pact') {
        return {
          ...state,
          permanentRerollBonus: state.permanentRerollBonus + 2,
          relicCapBonus: (state.relicCapBonus || 0) - 1,
          shop,
        }
      }
      return state
    }

    case 'TAKE_BLESSING': {
      if (state.phase !== 'shop' || state.shop.blessingTaken) return state
      const shop = { ...state.shop, blessingTaken: action.blessingId }
      if (action.blessingId === 'prophecy') {
        const round = nextBossRound(state)
        if (!round) return state
        const boss = pickBossModifier(state, round)
        return {
          ...state,
          map: { ...state.map, prophecy: { round, boss } },
          boons: addBoon(state, 'prophecy', 'aeris', { round, bossId: boss.id }),
          shop,
        }
      }
      if (!state.shop.blessings?.includes(action.blessingId)) return state
      if (!blessingAvailable(state, action.blessingId)) return state
      state = { ...state, boons: addBoon(state, action.blessingId, 'aeris') }
      switch (action.blessingId) {
        case 'mend':
          return state.lives < state.maxLives
            ? { ...state, lives: state.lives + 1, shop }
            : { ...state, shards: state.shards + 8, shop }
        case 'kindle': {
          const growable = state.dice.filter((d) => nextTier(d.tierId))
          const die = randomOf(growable)
          const next = nextTier(die.tierId)
          return {
            ...state,
            dice: state.dice.map((d) => (d.id === die.id ? { ...d, tierId: next.id, sides: next.sides } : d)),
            shop: { ...shop, blessedDieId: die.id },
          }
        }
        case 'tide':
          return { ...state, nextRoundRerollBonus: (state.nextRoundRerollBonus || 0) + 3, shop }
        case 'gale':
          return { ...state, permanentRerollBonus: state.permanentRerollBonus + 1, shop }
        case 'aether_gift': {
          const def = randomOf(CONSUMABLES.filter((c) => c.rarity === RARITY.RARE))
          return { ...state, consumables: giveConsumable(state, def), shop: { ...shop, giftId: def.id } }
        }
        default:
          return state
      }
    }

    case 'CHOOSE_BOSS_REWARD': {
      if (state.phase !== 'bossReward' || !BOSS_REWARDS.includes(action.slot)) return state
      const canGrow = state.dice.some((d) => nextTier(d.tierId))
      const die = state.dice.find((d) => d.id === action.dieId)
      if (canGrow && !(die && nextTier(die.tierId))) return state
      return { ...applyBossReward(state, action), phase: 'shop' }
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
      if (round > WIN_ROUND && !state.endless) {
        return { ...withRecipe(state, QUADRA_FUSION_ID), phase: 'victory' }
      }
      const map = travel(state.map, round)
      if (!map) return state
      return enterRound({ ...state, map }, round)
    }

    // After a win: keep playing the same run, with targets still climbing.
    // The final boss's reward and shop come first, then round 16.
    case 'CONTINUE_ENDLESS': {
      if (state.phase !== 'victory') return state
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

    case 'RETURN_HOME':
      return { ...baseTitleState(), phase: 'menu' }

    default:
      return state
  }
}

export const selectors = {
  availableRerolls,
  scoreContext,
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
}
