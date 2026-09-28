// Which tutorial groups the player has already seen, and whether they
// turned the tutorial off. Its own key (not the save slots) so it survives
// deleting a save, and it's included in backup files (utils/backup.js).
const KEY = 'elementa-tutorial-v1'

export function readTutorial() {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { seen: Array.isArray(parsed.seen) ? parsed.seen : [], off: Boolean(parsed.off) }
  } catch {
    return { seen: [], off: false }
  }
}

function write(data) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // storage blocked: the tutorial just shows again next visit
  }
}

export function markTutorialSeen(id) {
  const t = readTutorial()
  if (!t.seen.includes(id)) write({ ...t, seen: [...t.seen, id] })
}

export function turnTutorialOff() {
  write({ ...readTutorial(), off: true })
}

export function resetTutorial() {
  write({ seen: [], off: false })
}
