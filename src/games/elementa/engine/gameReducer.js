import {
  ELEMENTS,
  FLAGS,
  PURE_ELEMENT_IDS,
  DOUBLE_FUSION_IDS,
  TRIPLE_FUSION_IDS,
  QUADRA_FUSION_ID,
  ARCANE_DIE_IDS,
  fusionsUnlockedBy,
  rarityForElement,
} from '../data/elements.js'
import { nextTier, prevTier, tierById, sellValueForDie } from '../data/diceTiers.js'
import { RELICS, RARITY, relicById, costForRelic, sellValueForRelic } from '../data/relics.js'
import { CONSUMABLES, consumableById, costForConsumable, sellValueForConsumable } from '../data/consumables.js'
import { deckById } from '../data/decks.js'
import { difficultyById } from '../data/difficulty.js'
import { BOSS_MODIFIERS, PRIMORDIAL, PRIMORDIAL_POOL, bossById, isBossRound } from '../data/bossModifiers.js'
import { rollDie, rerollPool, evaluatePool, thresholdForRound, shardsEarned, interestFor } from './scoring.js'

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
  quadra: 32,
}

// Arcane dice have no fusion tier, so they're priced by rarity instead.
const ARCANE_DIE_COST_BY_RARITY = {
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
  return list[Math.floor(Math.random() * list.length)]
}

// Primordial's current twist: a copy of one pool boss's effects, tagged so
// the UI can name which twist is active right now.
function primordialWith(twistId) {
  const twist = bossById(twistId)
  return { ...PRIMORDIAL, twistId, effects: { ...twist.effects } }
}

function pickBossModifier(state, round) {
  if (round >= WIN_ROUND) return primordialWith(randomOf(PRIMORDIAL_POOL))
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

function rollFreshRound(dice, relics) {
  return dice.map((d) => ({
    ...d,
    growth: 0,
    held: false,
    locked: false,
    lockedVia: null,
    ...rollDie(d.elementId, d.sides, relics),
  }))
}

function applyDiscount(base, relics) {
  const fx = relicEffects(relics)
  return Math.max(1, Math.round(base * (1 - (fx.shopDiscountPct || 0))))
}

function dieUpgradeCost(die, relics) {
  const next = nextTier(die.tierId)
  if (!next) return null
  return { next, cost: applyDiscount(next.upgradeCost, relics) }
}

function isFusionElement(elementId) {
  return ELEMENTS[elementId].tier !== 'pure'
}

function newDieCost(elementId, dice, relics) {
  const tier = ELEMENTS[elementId].tier
  const owned = dice.filter((d) => d.elementId === elementId).length
  const base =
    tier === 'pure'
      ? 4 + owned
      : tier === 'arcane'
        ? ARCANE_DIE_COST_BY_RARITY[rarityForElement(elementId)]
        : DIE_BASE_COST_BY_TIER[tier]
  return applyDiscount(base, relics)
}

function relicCost(relic, relics) {
  return applyDiscount(costForRelic(relic), relics)
}

function consumableCost(def, relics) {
  return applyDiscount(costForConsumable(def), relics)
}

function rerollShopOffersCost(state) {
  const fx = relicEffects(state.relics)
  return Math.max(1, 3 + state.shop.rerollShopUses - (fx.shopRerollDiscount || 0))
}

// Forging a fusion die trades its parent dice (consumed) plus Shards for
// the fusion die, an alternative to hoping the shop offers it. Works for
// any fusion tier: a double costs 2 parents, a triple 3, the quadra all 4.
// See GDD.md §13a/§18.
function forgeCost(relics, tier) {
  const fx = relicEffects(relics)
  return applyDiscount(Math.max(1, FORGE_BASE_COST_BY_TIER[tier] - (fx.forgeDiscount || 0)), relics)
}

function forgeableRecipes(state) {
  const ownedCounts = new Map()
  state.dice.forEach((d) => ownedCounts.set(d.elementId, (ownedCounts.get(d.elementId) || 0) + 1))
  return ALL_FUSION_IDS.map((fusionElementId) => {
    const def = ELEMENTS[fusionElementId]
    const canForge = def.parents.every((p) => (ownedCounts.get(p) || 0) >= 1)
    return { fusionElementId, parents: def.parents, tier: def.tier, canForge, cost: forgeCost(state.relics, def.tier) }
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
    let roll = Math.random() * total
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

// The whole shop is luck-gated the same way: a small random sample rather
// than "everything you've unlocked, guaranteed". Relics and consumables
// share one pool (an item is an item), dice are a separate pool, both
// weighted by the same rarity scale/round-gating.
function buildShopOffers(state) {
  const ownedRelicIds = new Set(state.relics.map((r) => r.id))
  const itemPool = [...RELICS.filter((r) => !ownedRelicIds.has(r.id)), ...CONSUMABLES]
  const itemOffers = weightedSample(itemPool, 4, (item) => rarityWeight(item, state.round)).map((item) => ({
    kind: item.kind,
    id: item.id,
  }))

  const unlockedFusions = fusionsUnlockedBy(state.ownedElementsEver)
  const allBuyable = [...PURE_ELEMENT_IDS, ...unlockedFusions, ...ARCANE_DIE_IDS].map((id) => ({
    id,
    rarity: rarityForElement(id),
  }))
  const dieOfferCount = Math.min(3, allBuyable.length)
  const buyableElements = weightedSample(allBuyable, dieOfferCount, (item) =>
    rarityWeight(item, state.round),
  ).map((item) => item.id)

  return {
    itemOffers,
    buyableElements,
    rerollShopUses: 0,
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

function maxDiceFor(difficulty) {
  return difficulty.maxDiceOverride ?? MAX_DICE
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
  }
}

function startNewRun(deckId, difficultyId, activeSlot = null) {
  const deck = deckById(deckId)
  const difficulty = difficultyById(difficultyId)
  const dice = deck.dice.map((elementId) => makeDie(elementId))
  const relics = []
  const round = 1
  // Cataclysm's "every round is a boss" must apply from round 1 too, not
  // just from NEXT_ROUND onward.
  const bossModifier = isBossRound(round, difficulty) ? pickBossModifier({ dice, relics }, round) : null
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
    dice: applyBossRoundStart(rollFreshRound(dice, bossModifier ? [bossModifier] : relics), bossModifier),
    relics,
    ownedElementsEver: [...new Set(deck.dice)],
  }
}

export function initialState() {
  return baseTitleState()
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'GO_TO_SLOTS':
      return { ...baseTitleState(), phase: 'slots' }

    case 'GO_TO_CREDITS':
      return { ...baseTitleState(), phase: 'credits' }

    case 'GO_TO_GALLERY':
      return { ...baseTitleState(), phase: 'gallery' }

    case 'BACK_TO_MENU':
      return { ...baseTitleState(), phase: 'menu' }

    // Discard a loaded-but-not-yet-resumed preview and go back to slot
    // picking. The save file on disk is untouched, only the in-memory
    // hydrated state is thrown away.
    case 'BACK_TO_SLOTS_FROM_PREVIEW':
      return { ...baseTitleState(), phase: 'slots' }

    // Chosen an empty slot from the save-slot screen: go pick a deck and
    // difficulty (the existing TitleScreen), remembering which slot the
    // resulting run should autosave to.
    case 'NEW_RUN_SETUP':
      return { ...baseTitleState(), phase: 'title', activeSlot: action.slot }

    case 'START_RUN':
      return startNewRun(action.deckId, action.difficultyId, state.activeSlot)

    // Chosen a filled slot: hydrate its full snapshot, but land on a
    // preview screen (dice loadout, difficulty, round) rather than
    // dropping straight back into whatever mid-round state it was saved
    // at. The saved phase is stashed in resumePhase for RESUME_RUN.
    case 'LOAD_RUN':
      return { ...action.save, phase: 'runPreview', resumePhase: action.save.phase }

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
      const die = state.dice.find((d) => d.id === action.dieId)
      if (!die || die.locked || !ELEMENTS[die.elementId].flags[FLAGS.FREE_LOCK]) return state

      const fx = relicEffects(effectiveRelics(state))
      if (fx.noFreeLock) return state
      const grantsReroll = ELEMENTS[die.elementId].flags[FLAGS.GRANTS_REROLL_ON_LOCK]
      const rerollGrant = grantsReroll ? 1 + (fx.waterLockRerollBonus || 0) : 0
      const adjacent = ELEMENTS[die.elementId].flags[FLAGS.ADJACENT_FREE_LOCK]

      const idx = state.dice.findIndex((d) => d.id === action.dieId)
      const adjacentId = adjacent ? state.dice[idx + 1]?.id : null

      let dice = state.dice.map((d) => {
        if (d.id === action.dieId) return { ...d, held: true, locked: true, lockedVia: 'lock' }
        if (adjacentId && d.id === adjacentId) return { ...d, held: true, locked: true, lockedVia: 'lock' }
        return d
      })

      let rerollsBonusThisRound = state.rerollsBonusThisRound + rerollGrant
      if (fx.undertowRippleReroll) {
        const targets = dice.filter((d) => d.id !== action.dieId && !d.held && !d.locked)
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)]
          const rolled = rollDie(target.elementId, target.sides, effectiveRelics(state))
          dice = dice.map((d) => (d.id === target.id ? { ...d, ...rolled } : d))
        }
      }

      return { ...state, dice, rerollsBonusThisRound }
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
          if (Math.random() < fx.overclockZeroChance) {
            return { ...d, value: 1, total: 1, explosions: 0 }
          }
          return d
        })
      }
      // Primordial reshapes its twist after every reroll.
      const bossModifier =
        state.bossModifier?.id === 'primordial'
          ? primordialWith(randomOf(PRIMORDIAL_POOL.filter((id) => id !== state.bossModifier.twistId)))
          : state.bossModifier
      return { ...state, dice, bossModifier, shards: state.shards - tax, rerollsUsed: state.rerollsUsed + 1 }
    }

    case 'SUBMIT_ROUND': {
      if (state.phase !== 'rolling') return state
      const result = evaluatePool(state.dice, effectiveRelics(state), { rerollsLeft: availableRerolls(state) })
      const passed = result.roundScore >= state.threshold

      if (passed) {
        const earned = shardsEarned(result.roundScore, state.threshold, state.difficulty)
        const fx = relicEffects(effectiveRelics(state))
        const interest = interestFor(state.shards, fx.interestCapBonus || 0, fx.interestDivisor || 3)
        const base = Math.round(5 * state.difficulty.shardMultiplier)
        const bonus = (fx.shardPerExplosion || 0) * result.explodeCount + result.midasShards
        let shards = state.shards + earned + interest + bonus
        // Kept for the round-result card, so the player sees where Shards came from.
        const shardGain = { base, overkill: earned - base, interest, bonus, total: earned + interest + bonus }
        let permanentRerollBonus = state.permanentRerollBonus
        if (fx.momentumRerollOnOverkill && result.roundScore >= state.threshold * 2) {
          permanentRerollBonus += 1
        }
        let lives = state.lives
        if (state.round % LIFE_REGEN_EVERY_N_ROUNDS === 0 && lives < state.maxLives) lives += 1

        return {
          ...state,
          phase: 'shop',
          lastResult: { ...result, passed, threshold: state.threshold, shardGain },
          shards,
          permanentRerollBonus,
          lives,
          shop: buildShopOffers(state),
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
      return {
        ...state,
        phase: 'rolling',
        dice: applyBossRoundStart(rollFreshRound(state.dice, effectiveRelics(state)), state.bossModifier),
        rerollsUsed: 0,
        rerollsBonusThisRound: 0,
        freezeChargesUsed: 0,
        lastResult: null,
      }
    }

    case 'BUY_DIE': {
      if (state.phase !== 'shop') return state
      if (state.dice.length >= maxDiceFor(state.difficulty)) return state
      const cost = newDieCost(action.elementId, state.dice, state.relics)
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
      if (state.phase !== 'shop') return state
      const def = ELEMENTS[action.fusionElementId]
      if (!def || def.tier === 'pure') return state
      const usedIds = new Set()
      const parentDice = []
      for (const parentId of def.parents) {
        const match = state.dice.find((d) => d.elementId === parentId && !usedIds.has(d.id))
        if (!match) return state
        usedIds.add(match.id)
        parentDice.push(match)
      }
      const cost = forgeCost(state.relics, def.tier)
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
      if (state.relics.length >= state.difficulty.relicCap) return state
      const relic = relicById(action.relicId)
      if (!relic || state.relics.some((r) => r.id === relic.id)) return state
      const cost = relicCost(relic, state.relics)
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
      if (state.consumables.length >= MAX_CONSUMABLES) return state
      const def = consumableById(action.consumableId)
      if (!def) return state
      const cost = consumableCost(def, state.relics)
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

    case 'APPLY_CONSUMABLE': {
      if (state.phase !== 'shop') return state
      const item = state.consumables.find((c) => c.instanceId === action.instanceId)
      if (!item) return state

      const spent = state.consumables.filter((c) => c.instanceId !== action.instanceId)
      if (item.target === 'self') {
        if (item.type === 'reroll') {
          return { ...state, permanentRerollBonus: state.permanentRerollBonus + 1, consumables: spent }
        }
        if (item.type === 'heal') {
          if (state.lives >= state.maxLives) return state
          return { ...state, lives: state.lives + 1, consumables: spent }
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

      return {
        ...state,
        dice,
        ownedElementsEver,
        consumables: spent,
      }
    }

    case 'REROLL_SHOP_OFFERS': {
      if (state.phase !== 'shop') return state
      const cost = rerollShopOffersCost(state)
      if (state.shards < cost) return state
      const fresh = buildShopOffers(state)
      return {
        ...state,
        shards: state.shards - cost,
        shop: { ...fresh, rerollShopUses: state.shop.rerollShopUses + 1 },
      }
    }

    case 'NEXT_ROUND': {
      if (state.phase !== 'shop') return state
      const round = state.round + 1
      if (round > WIN_ROUND) {
        return { ...state, phase: 'victory' }
      }
      const bossModifier = isBossRound(round, state.difficulty) ? pickBossModifier(state, round) : null
      return {
        ...state,
        phase: 'rolling',
        round,
        bossModifier,
        threshold: thresholdForRound(round, state.difficulty),
        dice: applyBossRoundStart(
          rollFreshRound(state.dice, bossModifier ? effectiveRelics({ relics: state.relics, bossModifier }) : state.relics),
          bossModifier,
        ),
        rerollsUsed: 0,
        rerollsBonusThisRound: 0,
        freezeChargesUsed: 0,
        shop: null,
        lastResult: null,
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
  effectiveRelics,
  isBossRound,
  forgeCost,
  forgeableRecipes,
}
