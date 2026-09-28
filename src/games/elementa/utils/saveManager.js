// Local, best-effort save slots. Each slot holds a full snapshot of the
// reducer state, so resuming a save is just re-hydrating that object rather
// than replaying a run; see LOAD_RUN/RESUME_RUN in engine/gameReducer.js.
const STORAGE_KEY = 'elementa-saves-v1'
export const SAVE_SLOT_COUNT = 3

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(saves) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves))
  } catch {
    // Storage can be full or unavailable (private browsing); saving is
    // best-effort and shouldn't crash the game.
  }
}

// Always returns SAVE_SLOT_COUNT entries, `null` for an empty slot.
export function listSaves() {
  const all = readAll()
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => all[i] ?? null)
}

export function readSave(slot) {
  return readAll()[slot] ?? null
}

export function writeSave(slot, state) {
  const all = readAll()
  all[slot] = { savedAt: Date.now(), state }
  writeAll(all)
}

export function deleteSave(slot) {
  const all = readAll()
  delete all[slot]
  writeAll(all)
}
