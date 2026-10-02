// Save files (GDD §26). Each of the three slots is a whole game file, like
// The Binding of Isaac's: its own gallery discoveries, unlocked loadouts
// and difficulties, achievements, and stats (`profile`), plus the run in
// progress if there is one (`run`, a full reducer-state snapshot).
//
// Storage: one localStorage key holding { [slot]: file }. Older versions
// kept per-slot runs and one shared profile; those are migrated on first
// read (each old run becomes a file, carrying a copy of the old profile).
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
  }
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
