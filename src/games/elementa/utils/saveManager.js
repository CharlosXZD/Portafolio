// Save files (GDD §26). Each of the three slots is a whole game file, like
// The Binding of Isaac's: its own gallery discoveries, unlocked loadouts
// and difficulties, achievements, and stats (`profile`), plus the run in
// progress if there is one (`run`, a full reducer-state snapshot).
//
// Storage: one localStorage key holding { [slot]: file }. Older versions
// kept per-slot runs and one shared profile; those are migrated on first
// read (each old run becomes a file, carrying a copy of the old profile).
// The six Mythic dice (data/elements.js MYTHIC_DIE_IDS), for the v0.8 migration.
import { sigilsFromEndings } from '../data/sigils.js'
const MYTHIC_IDS = ['light', 'darkness', 'time', 'space', 'chaos', 'void']
const KEY = 'elementa-files-v2'
const LEGACY_SAVES = 'elementa-saves-v1'
const LEGACY_PROFILE = 'elementa-profile-v1'
export const SAVE_SLOT_COUNT = 3

export function emptyProfile() {
  return {
    seen: { dice: [], relics: [], consumables: [], bosses: [], reactions: [] },
    decksBeaten: [],
    difficultiesBeaten: [],
    achievements: [],
    stats: { runs: 0, wins: 0, bestCast: 0, bestRound: 0 },
    // Shop keepers remember you (utils/keepers.js): visits and lore told.
    keepers: {},
    // Secret recipes learned on this file (EXPANSION.md B6): 'aether', and
    // the four gods after the first Neutral win (B2).
    recipes: [],
    // Endings reached on this file (B2), and per loadout (completion marks).
    endings: [],
    deckEndings: {},
    // Wins as loadout x difficulty pairs (EXPANSION.md P16): the stake
    // badges under each loadout. { [deckId]: [difficultyId, ...] }
    wins: {},
    // Every die element in the final pool of a Cataclysm win: they wear a
    // gold sticker in the Gallery.
    cataclysmDice: [],
    // The Firmament (EXPANSION.md H8): Mythic dice unlocked on this file
    // (each Warden's prize), Wardens beaten, and how much Mote has eaten.
    mythics: [],
    wardens: [],
    // Rewriters beaten in realm 3 (EXPANSION.md R2).
    rewriters: [],
    mote: { fed: 0 },
    // Story scenes already shown (H7); they play once unless replayed.
    scenes: [],
    // Sigil dice unlocked by the Firmament endings (EXPANSION.md P3).
    sigils: [],
    // An Arbiter (Part S): whether he has appeared on this file, and the deepest realm 3 round seen with him.
    arbiter: { met: false, deepest: 0 },
    // One-time data fixes already applied to this file (a new file needs none).
    migrations: ['kairos'],
  }
}

// Fill in any fields an older file is missing, so callers can rely on shape.
function normalizeProfile(p = {}) {
  const base = emptyProfile()
  return {
    ...base,
    ...p,
    seen: { ...base.seen, ...(p.seen || {}) },
    stats: { ...base.stats, ...(p.stats || {}) },
    decksBeaten: p.decksBeaten || [],
    difficultiesBeaten: p.difficultiesBeaten || [],
    achievements: p.achievements || [],
    keepers: p.keepers || {},
    // Files from before recipes: any beaten difficulty means Primordial
    // fell at least once, so the Aether recipe is already known.
    // A Warden used to unlock its Mythic die in the shops; since v0.8 it
    // teaches the recipe (K1), so `mythics` folds into `recipes`. The old
    // list stays as it was, read-only.
    recipes: withMythicRecipes(p.recipes || ((p.difficultiesBeaten || []).length > 0 ? ['aether'] : []), p.mythics),
    endings: p.endings || [],
    deckEndings: p.deckEndings || {},
    wins: p.wins || winsFromLists(p.decksBeaten || [], p.difficultiesBeaten || []),
    cataclysmDice: p.cataclysmDice || [],
    mythics: p.mythics || [],
    wardens: p.wardens || [],
    rewriters: p.rewriters || [],
    mote: { fed: p.mote?.fed || 0 },
    scenes: p.scenes || [],
    arbiter: { met: Boolean(p.arbiter?.met), deepest: p.arbiter?.deepest || 0 },
    // A file that already has the Firmament endings has the sigil dice they unlock.
    sigils: [...new Set([...(p.sigils || []), ...sigilsFromEndings(p.endings || [])])],
    ...kairosRename(p),
    ...oldVisions(p),
  }
}

function withMythicRecipes(recipes, mythics = []) {
  const extra = (mythics || []).filter((id) => MYTHIC_IDS.includes(id) && !recipes.includes(id))
  return extra.length ? [...recipes, ...extra] : recipes
}

// A file that learned the god recipes before the story scenes existed
// already saw the old visions: count the visions and recipes scenes as seen
// (EXPANSION.md G Q4a), so it is not shown them again and earns Remembering.
function oldVisions(p) {
  const scenes = p.scenes || []
  const knows = ['gaea', 'ognen', 'varuna', 'zephyr'].every((id) => (p.recipes || []).includes(id))
  if (!knows || scenes.includes('recipes') || p.scenes) return {}
  return { scenes: [...scenes, 'visions', 'recipes'] }
}

// Chrono became Kairos when the new Chrono arrived (EXPANSION.md H4): a file
// that saw or won with the old one keeps it, under its new name. Applied
// once, so the new Chrono can be discovered later.
function kairosRename(p) {
  const migrations = p.migrations || []
  if (migrations.includes('kairos')) return { migrations }
  const swap = (list) => (list || []).map((id) => (id === 'chrono' ? 'kairos' : id))
  return {
    seen: { ...emptyProfile().seen, ...(p.seen || {}), dice: swap(p.seen?.dice) },
    cataclysmDice: swap(p.cataclysmDice),
    migrations: [...migrations, 'kairos'],
  }
}

// Older files only know which loadouts and which difficulties were beaten,
// not the pairing. Be generous: every beaten loadout counts on every beaten
// difficulty (P16). The old lists keep driving the unlocks.
function winsFromLists(decks, difficulties) {
  return Object.fromEntries(decks.map((id) => [id, [...difficulties]]))
}

function readRaw(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function migrate() {
  const legacySaves = readRaw(LEGACY_SAVES) || {}
  const legacyProfile = readRaw(LEGACY_PROFILE)
  const files = {}
  for (let slot = 0; slot < SAVE_SLOT_COUNT; slot++) {
    const old = legacySaves[slot]
    if (old?.state) {
      files[slot] = {
        createdAt: old.savedAt ?? Date.now(),
        updatedAt: old.savedAt ?? Date.now(),
        profile: normalizeProfile(legacyProfile || {}),
        run: old.state,
      }
    }
  }
  if (Object.keys(files).length === 0 && legacyProfile) {
    files[0] = { createdAt: Date.now(), updatedAt: Date.now(), profile: normalizeProfile(legacyProfile), run: null }
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(files))
    window.localStorage.removeItem(LEGACY_SAVES)
    window.localStorage.removeItem(LEGACY_PROFILE)
  } catch {
    // storage blocked: work in memory for this visit
  }
  return files
}

function readAll() {
  const files = readRaw(KEY)
  if (files) return files
  return migrate()
}

function writeAll(files) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(files))
  } catch {
    // Storage can be full or unavailable; saving is best-effort.
  }
}

/** Always SAVE_SLOT_COUNT entries: a file, or null for an empty slot. */
export function listFiles() {
  const all = readAll()
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => (all[i] ? { ...all[i], profile: normalizeProfile(all[i].profile) } : null))
}

export function readFile(slot) {
  const file = readAll()[slot]
  return file ? { ...file, profile: normalizeProfile(file.profile) } : null
}

export function createFile(slot) {
  const all = readAll()
  all[slot] = { createdAt: Date.now(), updatedAt: Date.now(), profile: emptyProfile(), run: null }
  writeAll(all)
  return all[slot]
}

export function deleteFile(slot) {
  const all = readAll()
  delete all[slot]
  writeAll(all)
}

function updateFile(slot, fn) {
  const all = readAll()
  if (!all[slot]) return null
  all[slot] = { ...fn({ ...all[slot], profile: normalizeProfile(all[slot].profile) }), updatedAt: Date.now() }
  writeAll(all)
  return all[slot]
}

export function writeRun(slot, state) {
  updateFile(slot, (f) => ({ ...f, run: state }))
}

export function clearRun(slot) {
  updateFile(slot, (f) => ({ ...f, run: null }))
}

/** Read-modify-write a file's profile; `fn` returns the new profile. */
export function updateProfile(slot, fn) {
  const file = updateFile(slot, (f) => ({ ...f, profile: fn(f.profile) }))
  return file ? normalizeProfile(file.profile) : null
}
