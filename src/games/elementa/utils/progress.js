// Game-side progress tracking for a save file (GDD §26): which things the
// player has seen, and which achievements a given moment earns. Pure
// "what should unlock" logic lives here; ElementaGame.jsx calls it and
// writes the results through utils/profile.js.
import { DECKS } from '../data/decks.js'
import { runesOf } from '../data/runes.js'
import { ELEMENTS, TIERS, MYTHIC_DIE_IDS } from '../data/elements.js'
import { ENDING_IDS } from '../data/endings.js'
import { SECRET_REACTION_IDS, REACTIONS, FIRMAMENT_REACTION_IDS, CLASSIC_SECRET_IDS } from '../data/reactions.js'

const MYTHIC_REACTION_IDS = REACTIONS.filter((r) => r.mythic).map((r) => r.id)
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
  if ((state.nixPacts || 0) >= 3) ids.push('bad_company')
  if ((state.boons || []).filter((b) => b.source === 'aeris').length >= 3) ids.push('blessed')
  if (state.dice.some((d) => ELEMENTS[d.elementId]?.tier === TIERS.GOD)) ids.push('divine_spark')
  if (state.realm === 'firmament' && state.round >= 16) ids.push('through_door')
  if (state.realm === 'firmament' && state.round >= 25) ids.push('deep_sky')
  if (state.dice.filter((d) => ELEMENTS[d.elementId]?.tier === TIERS.MYTHIC && d.elementId !== 'entropy').length >= 3) ids.push('mythic_trio')
  const levels = Object.values(state.constellations || {})
  if (levels.some((l) => l >= 5)) ids.push('stargazer')
  if (levels.some((l) => l >= 10)) ids.push('sky_cartographer')
  if (state.dice.some((d) => runesOf(d).length > 0)) ids.push('runesmith')
  if (state.dice.some((d) => d.edition === 'warp')) ids.push('warp_slot')
  if (state.dice.some((d) => d.sides >= 100)) ids.push('century')
  if (state.dice.some((d) => d.elementId === 'chrono')) ids.push('stopped_clock')
  if (state.dice.some((d) => d.elementId === 'entropy')) ids.push('heat_death')
  return ids
}

/** Achievements earned by a cast result (state is the post-cast state). */
export function achievementsFromCast(state, result) {
  const ids = []
  if (!result.passed) return ids
  ids.push('first_clear')
  if (result.roundScore >= 1000) ids.push('cast_1000')
  if (result.roundScore >= 10000) ids.push('cast_10000')
  if (result.roundScore >= 100000) ids.push('cast_100000')
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
  if (state.path === 'primordial') ids.push('made_whole')
  if (state.path === 'split') ids.push('kept_apart')
  return ids
}

/** Achievements that depend on the whole file's discoveries. */
export function achievementsFromProfile(profile) {
  const ids = []
  const secrets = (profile.seen.reactions || []).filter((id) => SECRET_REACTION_IDS.includes(id))
  if (secrets.length >= 1) ids.push('secret_one')
  // Master Alchemist stays for the classic secrets; Cosmic Alchemist (L5)
  // needs every Firmament reaction.
  if (CLASSIC_SECRET_IDS.every((id) => secrets.includes(id))) ids.push('secret_all')
  if (FIRMAMENT_REACTION_IDS.every((id) => secrets.includes(id))) ids.push('cosmic_alchemist')
  // The Firmament (v0.7).
  // A Mythic die counts once its recipe is known (K1; old files' `mythics`
  // were folded into `recipes`).
  const mythics = (profile.recipes || []).filter((id) => MYTHIC_DIE_IDS.includes(id))
  if (mythics.length >= 1) ids.push('first_myth')
  if (mythics.length >= MYTHIC_DIE_IDS.length) ids.push('six_unspoken')
  const wardens = profile.wardens || []
  if (wardens.length >= 1) ids.push('first_warden')
  if (wardens.length >= 6) ids.push('all_wardens')
  if ((profile.seen.reactions || []).some((id) => MYTHIC_REACTION_IDS.includes(id))) ids.push('beyond_chemistry')
  if ((profile.mote?.fed || 0) >= 40) ids.push('first_course')
  if ((profile.mote?.fed || 0) >= 400) ids.push('never_full')
  const endings = profile.endings || []
  if (endings.some((id) => id.startsWith('firmament_'))) ids.push('other_side')
  if (['neutral', 'split', 'primordial'].every((id) => endings.includes(id))) ids.push('three_roads')
  if (ENDING_IDS.every((id) => endings.includes(id))) ids.push('every_word')
  if (ALL_BOSS_IDS.every((id) => (profile.seen.bosses || []).includes(id))) ids.push('bestiary')
  // Remembering (G Q4a): the recipes scene has played (files that learned
  // the recipes before the scene existed count it as seen, utils/saveManager.js).
  if ((profile.scenes || []).includes('recipes')) ids.push('remembering')
  if (
    new Set(profile.seen.dice).size >= TOTALS.dice &&
    new Set(profile.seen.relics).size >= TOTALS.relics &&
    new Set(profile.seen.consumables).size >= TOTALS.consumables
  ) {
    ids.push('archivist')
  }
  return ids
}
