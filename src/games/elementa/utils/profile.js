// A save file's permanent progress (see utils/saveManager.js): gallery
// discoveries, beaten loadouts and difficulties, achievements, and stats.
// Every function takes the save slot it applies to.
import { ELEMENTS } from '../data/elements.js'
import { RELICS } from '../data/relics.js'
import { CONSUMABLES } from '../data/consumables.js'
import { DECKS } from '../data/decks.js'
import { DIFFICULTIES } from '../data/difficulty.js'
import { BOSS_MODIFIERS, PRIMORDIAL, GOD_TRIALS, WARDENS } from '../data/bossModifiers.js'
import { ENDING_IDS } from '../data/endings.js'
import { SECRET_REACTION_IDS, FIRMAMENT_REACTION_IDS } from '../data/reactions.js'
import { ACHIEVEMENTS } from '../data/achievements.js'
import { sigilsFromEndings } from '../data/sigils.js'
import { REWRITERS } from '../data/realm3.js'
import { readFile, updateProfile, listFiles, emptyProfile } from './saveManager.js'

export const ALL_BOSS_IDS = [...BOSS_MODIFIERS.map((b) => b.id), PRIMORDIAL.id, ...GOD_TRIALS.map((b) => b.id), ...WARDENS.map((b) => b.id), ...REWRITERS.map((b) => b.id)]

export function readProfile(slot) {
  if (slot == null) return emptyProfile()
  return readFile(slot)?.profile ?? emptyProfile()
}

/** Adds ids to a seen list. Returns the ids that were new. */
export function markSeen(slot, kind, ids) {
  if (slot == null) return []
  let fresh = []
  updateProfile(slot, (p) => {
    const known = new Set(p.seen[kind] || [])
    fresh = [...new Set(ids.filter((id) => id && !known.has(id)))]
    if (fresh.length === 0) return p
    return { ...p, seen: { ...p.seen, [kind]: [...(p.seen[kind] || []), ...fresh] } }
  })
  return fresh
}

export function markDeckBeaten(slot, deckId) {
  if (slot == null || !deckId) return
  updateProfile(slot, (p) => (p.decksBeaten.includes(deckId) ? p : { ...p, decksBeaten: [...p.decksBeaten, deckId] }))
}

export function markDifficultyBeaten(slot, difficultyId) {
  if (slot == null || !difficultyId) return
  updateProfile(slot, (p) =>
    p.difficultiesBeaten.includes(difficultyId) ? p : { ...p, difficultiesBeaten: [...p.difficultiesBeaten, difficultyId] },
  )
}

/** Records one win as a loadout x difficulty pair (P16). */
export function markWin(slot, deckId, difficultyId) {
  if (slot == null || !deckId || !difficultyId) return
  updateProfile(slot, (p) => {
    const have = p.wins[deckId] || []
    return have.includes(difficultyId) ? p : { ...p, wins: { ...p.wins, [deckId]: [...have, difficultyId] } }
  })
}

/** Remembers the dice that beat Cataclysm, for the Gallery sticker (P16). */
export function markCataclysmDice(slot, elementIds) {
  if (slot == null) return
  updateProfile(slot, (p) => {
    const fresh = [...new Set(elementIds)].filter((id) => !p.cataclysmDice.includes(id))
    return fresh.length ? { ...p, cataclysmDice: [...p.cataclysmDice, ...fresh] } : p
  })
}

export function knowsRecipe(profile, id) {
  return Boolean(profile?.recipes?.includes(id))
}

/** Learns a secret recipe. Returns true if it was new. */
export function learnRecipe(slot, id) {
  if (slot == null) return false
  let fresh = false
  updateProfile(slot, (p) => {
    if (p.recipes.includes(id)) return p
    fresh = true
    return { ...p, recipes: [...p.recipes, id] }
  })
  return fresh
}

/**
 * Records an ending (B2) for the file and for the loadout that reached it
 * (its completion marks). Returns true if the file had never seen it.
 */
export function markEnding(slot, ending, deckId) {
  if (slot == null || !ending) return false
  let fresh = false
  updateProfile(slot, (p) => {
    fresh = !p.endings.includes(ending)
    const marks = p.deckEndings[deckId] || []
    const endings = fresh ? [...p.endings, ending] : p.endings
    return {
      ...p,
      endings,
      // A Firmament ending opens that path's sigil die (P3).
      sigils: [...new Set([...(p.sigils || []), ...sigilsFromEndings(endings)])],
      deckEndings: deckId && !marks.includes(ending) ? { ...p.deckEndings, [deckId]: [...marks, ending] } : p.deckEndings,
    }
  })
  return fresh
}

/** Adds ids to one of the profile's lists (H8). Returns the ids that were new. */
function addToList(slot, key, ids) {
  if (slot == null) return []
  let fresh = []
  updateProfile(slot, (p) => {
    fresh = [...new Set(ids)].filter((id) => id && !(p[key] || []).includes(id))
    return fresh.length ? { ...p, [key]: [...(p[key] || []), ...fresh] } : p
  })
  return fresh
}

/** Wardens beaten on this file (H2). Returns the ones that are new. */
export const markWardens = (slot, ids) => addToList(slot, 'wardens', ids)
export const markRewriters = (slot, ids) => addToList(slot, 'rewriters', ids)

/** Mythic dice unlocked on this file (H2, H3). Returns the ones that are new. */
export const unlockMythics = (slot, ids) => addToList(slot, 'mythics', ids)

/** Story scenes already shown on this file (H7). */
export const markScenes = (slot, ids) => addToList(slot, 'scenes', ids)

/** Mote's appetite only ever grows (H6). */
export function setMoteFed(slot, fed) {
  if (slot == null) return
  updateProfile(slot, (p) => (fed > (p.mote?.fed || 0) ? { ...p, mote: { ...p.mote, fed } } : p))
}

/** Unlocks achievements; returns the ids that were newly unlocked. */
export function unlockAchievements(slot, ids) {
  if (slot == null) return []
  let fresh = []
  updateProfile(slot, (p) => {
    fresh = ids.filter((id) => !p.achievements.includes(id))
    return fresh.length ? { ...p, achievements: [...p.achievements, ...fresh] } : p
  })
  return fresh
}

export function updateStats(slot, fn) {
  if (slot == null) return
  updateProfile(slot, (p) => ({ ...p, stats: fn(p.stats) }))
}

export function isDifficultyUnlocked(difficultyId, profile) {
  const idx = DIFFICULTIES.findIndex((d) => d.id === difficultyId)
  if (idx <= 0) return true
  return profile.difficultiesBeaten.includes(DIFFICULTIES[idx - 1].id)
}

export function isDeckUnlocked(deckId, profile) {
  const idx = DECKS.findIndex((d) => d.id === deckId)
  if (idx <= 0) return true
  // The Gambler (O3) opens once any other loadout has won.
  if (deckId === 'gambler') return profile.decksBeaten.length > 0
  return profile.decksBeaten.includes(DECKS[idx - 1].id)
}

const PUBLIC_ACHIEVEMENTS = ACHIEVEMENTS.filter((a) => !a.secret)

/** Whether this file has stepped through the Firmament's door (EXPANSION.md L5). */
export function crossedDoor(profile) {
  return (
    (profile.achievements || []).includes('through_door') ||
    (profile.wardens || []).length > 0 ||
    (profile.endings || []).some((id) => id.startsWith('firmament_')) ||
    (profile.seen?.reactions || []).some((id) => FIRMAMENT_REACTION_IDS.includes(id))
  )
}

export const TOTALS = {
  dice: Object.keys(ELEMENTS).length,
  relics: RELICS.length,
  consumables: CONSUMABLES.length,
  bosses: ALL_BOSS_IDS.length,
  reactions: SECRET_REACTION_IDS.length,
  decks: DECKS.length,
  difficulties: DIFFICULTIES.length,
  achievements: PUBLIC_ACHIEVEMENTS.length,
  endings: ENDING_IDS.length,
}

const known = {
  dice: (id) => Boolean(ELEMENTS[id]),
  relics: (id) => RELICS.some((r) => r.id === id),
  consumables: (id) => CONSUMABLES.some((c) => c.id === id),
  bosses: (id) => ALL_BOSS_IDS.includes(id),
  reactions: (id) => SECRET_REACTION_IDS.includes(id),
}

/**
 * Completion: every discovery, beaten loadout and difficulty, and public
 * achievement counts once. 100% means the file has seen and done it all.
 */
export function completion(profile) {
  const parts = {
    dice: profile.seen.dice.filter(known.dice).length,
    relics: profile.seen.relics.filter(known.relics).length,
    consumables: profile.seen.consumables.filter(known.consumables).length,
    bosses: (profile.seen.bosses || []).filter(known.bosses).length,
    reactions: (profile.seen.reactions || []).filter(known.reactions).length,
    decks: profile.decksBeaten.filter((id) => DECKS.some((d) => d.id === id)).length,
    difficulties: profile.difficultiesBeaten.filter((id) => DIFFICULTIES.some((d) => d.id === id)).length,
    achievements: profile.achievements.filter((id) => PUBLIC_ACHIEVEMENTS.some((a) => a.id === id)).length,
    endings: (profile.endings || []).filter((id) => ENDING_IDS.includes(id)).length,
  }
  const done = Object.values(parts).reduce((a, b) => a + b, 0)
  const total = Object.values(TOTALS).reduce((a, b) => a + b, 0)
  return { pct: Math.floor((done / total) * 100), parts }
}

/** The secret "Trinity": all three files exist and are at 100%. */
export function allFilesComplete() {
  const files = listFiles()
  return files.every((f) => f && completion(f.profile).pct >= 100)
}
