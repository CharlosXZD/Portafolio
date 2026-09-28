// Backup files: every Elementa key in localStorage (save slots, gallery and
// unlock progress, tutorial, settings) bundled into one JSON file the
// player downloads, so clearing browser data doesn't wipe their progress.
// Loading a backup replaces those keys and reloads the game.
const PREFIX = 'elementa-'
const FORMAT = 'elementa-backup'

export function buildBackup() {
  const data = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key?.startsWith(PREFIX)) data[key] = window.localStorage.getItem(key)
  }
  return { format: FORMAT, version: 1, exportedAt: new Date().toISOString(), data }
}

const LAST_BACKUP_KEY = 'elementa-last-backup'

/** When the player last downloaded a backup (ISO string), or null. */
export function lastBackupAt() {
  try {
    return window.localStorage.getItem(LAST_BACKUP_KEY)
  } catch {
    return null
  }
}

export function downloadBackup() {
  try {
    window.localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
  } catch {
    // storage blocked: the file still downloads
  }
  const backup = buildBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `elementa-backup-${backup.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Parses a backup file's text. Returns the backup, or throws with a reason. */
export function parseBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('notJson')
  }
  if (parsed?.format !== FORMAT || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('notBackup')
  }
  const keys = Object.keys(parsed.data)
  if (keys.some((k) => !k.startsWith(PREFIX) || typeof parsed.data[k] !== 'string')) throw new Error('notBackup')
  return parsed
}

export function restoreBackup(backup) {
  // Replace, don't merge: clear our keys first so the result matches the file.
  const existing = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key?.startsWith(PREFIX)) existing.push(key)
  }
  existing.forEach((k) => window.localStorage.removeItem(k))
  Object.entries(backup.data).forEach(([k, v]) => window.localStorage.setItem(k, v))
}
