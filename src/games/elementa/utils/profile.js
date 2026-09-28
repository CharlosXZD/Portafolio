// The player's permanent, cross-run profile: which dice/relics/consumables
// they have ever seen (feeds the Gallery), and which starting loadouts they
// have beaten (unlocks the next loadout). Separate from the per-slot run
// saves in saveManager.js: deleting a save never erases discoveries.
import { ELEMENTS } from '../data/elements.js'
import { RELICS } from '../data/relics.js'
import { CONSUMABLES } from '../data/consumables.js'
import { DECKS } from '../data/decks.js'
import { DIFFICULTIES } from '../data/difficulty.js'

const KEY = 'elementa-profile-v1'

function empty() {
  return { seen: { dice: [], relics: [], consumables: [] }, decksBeaten: [], difficultiesBeaten: [] }
}

export function readProfile() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    const base = empty()
    return {
      seen: { ...base.seen, ...parsed.seen },
      decksBeaten: Array.isArray(parsed.decksBeaten) ? parsed.decksBeaten : [],
      difficultiesBeaten: Array.isArray(parsed.difficultiesBeaten) ? parsed.difficultiesBeaten : [],
    }
  } catch {
    return empty()
  }
}

function writeProfile(profile) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // storage blocked: discoveries just won't persist this visit
  }
}

/** Adds ids to a seen list. Only writes when something is actually new. */
export function markSeen(kind, ids) {
  const profile = readProfile()
  const known = new Set(profile.seen[kind])
  const fresh = ids.filter((id) => id && !known.has(id))
  if (fresh.length === 0) return false
  profile.seen[kind] = [...profile.seen[kind], ...new Set(fresh)]
  writeProfile(profile)
  return true
}

export function markDeckBeaten(deckId) {
  if (!deckId) return
  const profile = readProfile()
  if (profile.decksBeaten.includes(deckId)) return
  profile.decksBeaten = [...profile.decksBeaten, deckId]
  writeProfile(profile)
}

export function markDifficultyBeaten(difficultyId) {
  if (!difficultyId) return
  const profile = readProfile()
  if (profile.difficultiesBeaten.includes(difficultyId)) return
  profile.difficultiesBeaten = [...profile.difficultiesBeaten, difficultyId]
  writeProfile(profile)
}

/** Stakes unlock the same way as loadouts: beat the one before it. */
export function isDifficultyUnlocked(difficultyId, profile = readProfile()) {
  const idx = DIFFICULTIES.findIndex((d) => d.id === difficultyId)
  if (idx <= 0) return true
  return profile.difficultiesBeaten.includes(DIFFICULTIES[idx - 1].id)
}

/** A loadout is playable if it's the first one, or the one before it is beaten. */
export function isDeckUnlocked(deckId, profile = readProfile()) {
  const idx = DECKS.findIndex((d) => d.id === deckId)
  if (idx <= 0) return true
  return profile.decksBeaten.includes(DECKS[idx - 1].id)
}

export const TOTALS = {
  dice: Object.keys(ELEMENTS).length,
  relics: RELICS.length,
  consumables: CONSUMABLES.length,
  decks: DECKS.length,
  difficulties: DIFFICULTIES.length,
}

/**
 * Completion: every discoverable item counts once and every beaten loadout
 * counts once, so filling the Gallery and climbing the loadout ladder both
 * move the same percentage.
 */
export function completion(profile = readProfile()) {
  const parts = {
    dice: profile.seen.dice.filter((id) => ELEMENTS[id]).length,
    relics: profile.seen.relics.filter((id) => RELICS.some((r) => r.id === id)).length,
    consumables: profile.seen.consumables.filter((id) => CONSUMABLES.some((c) => c.id === id)).length,
    decks: profile.decksBeaten.filter((id) => DECKS.some((d) => d.id === id)).length,
    difficulties: profile.difficultiesBeaten.filter((id) => DIFFICULTIES.some((d) => d.id === id)).length,
  }
  const done = Object.values(parts).reduce((a, b) => a + b, 0)
  const total = Object.values(TOTALS).reduce((a, b) => a + b, 0)
  return { pct: Math.floor((done / total) * 100), parts }
}
