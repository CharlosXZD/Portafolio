// Game-side progress tracking for a save file (GDD §26): which things the
// player has seen, and which achievements a given moment earns. Pure
// "what should unlock" logic lives here; ElementaGame.jsx calls it and
// writes the results through utils/profile.js.
import { DECKS } from '../data/decks.js'
import { SECRET_REACTION_IDS } from '../data/reactions.js'
import { selectors } from '../engine/gameReducer.js'
import { ALL_BOSS_IDS, TOTALS } from './profile.js'

/** Everything visible in the current run state that belongs in the Gallery. */
export function seenInState(state) {
  const dice = state.dice.map((d) => d.elementId)
  const relics = state.relics.map((r) => r.id)
  const consumables = state.consumables.map((c) => c.id)
  const bosses = []
  if (state.shop) {
    dice.push(...state.shop.buyableElements)
    dice.push(...selectors.forgeableRecipes(state).filter((r) => r.canForge).map((r) => r.fusionElementId))
    state.shop.itemOffers.forEach((o) => (o.kind === 'relic' ? relics : consumables).push(o.id))
  }
  if (state.bossModifier) bosses.push(state.bossModifier.id)
  return { dice, relics, consumables, bosses }
}

/** Achievements earned just by the current state of a run. */
export function achievementsFromState(state) {
  const ids = []
  if (state.shards >= 100) ids.push('rich')
  if (state.dice.some((d) => d.elementId === 'aether')) ids.push('aether')
  const cap = selectors.relicCapFor(state)
  if (cap > 0 && state.relics.length >= cap) ids.push('full_relics')
  if (state.endless && state.round >= 20) ids.push('endless_20')
  if (state.bossModifier?.id === 'ermal') ids.push('ermal')
  return ids
}

/** Achievements earned by a cast result (state is the post-cast state). */
export function achievementsFromCast(state, result) {
  const ids = []
  if (!result.passed) return ids
  ids.push('first_clear')
  if (result.roundScore >= 1000) ids.push('cast_1000')
  if (result.roundScore >= 10000) ids.push('cast_10000')
  if (result.roundScore >= result.threshold * 5) ids.push('overkill')
  if ((result.reactions || []).length >= 5) ids.push('chain_reaction')
  if (result.beatBoss && state.rerollsUsed === 0) ids.push('one_shot')
  return ids
}

/** Achievements earned by winning a run. */
export function achievementsFromVictory(state, profile) {
  const ids = ['first_win']
  if (state.difficulty?.id === 'cataclysm') ids.push('cataclysm')
  const beaten = new Set([...profile.decksBeaten, state.deckId])
  if (DECKS.every((d) => beaten.has(d.id))) ids.push('all_loadouts')
  return ids
}

/** Achievements that depend on the whole file's discoveries. */
export function achievementsFromProfile(profile) {
  const ids = []
  const secrets = (profile.seen.reactions || []).filter((id) => SECRET_REACTION_IDS.includes(id))
  if (secrets.length >= 1) ids.push('secret_one')
  if (secrets.length >= SECRET_REACTION_IDS.length) ids.push('secret_all')
  if (ALL_BOSS_IDS.every((id) => (profile.seen.bosses || []).includes(id))) ids.push('bestiary')
  if (
    new Set(profile.seen.dice).size >= TOTALS.dice &&
    new Set(profile.seen.relics).size >= TOTALS.relics &&
    new Set(profile.seen.consumables).size >= TOTALS.consumables
  ) {
    ids.push('archivist')
  }
  return ids
}
