// The fourth wall (EXPANSION.md Part Q6, S). Some of the Arbiter's and the
// Rewriters' lines mention small details the page can see on its own: the
// local time, timezone, language, operating system and browser, window size,
// how long this sitting has lasted, whether the tab was left and returned, and
// the runs and wins on this file.
//
// What this file never does, by design: it reads no stored site data, sends
// nothing anywhere, and makes no requests at all. It only reads values the
// browser hands to the page, and only after the player said yes (stored in
// localStorage as `elementa-fourthwall`, `yes` or `no`, asked once and carried
// in backups because every elementa- key is). The environment is passed in, so
// the tests can run it without a browser.
import { ARBITER_FOURTH_WALL, REWRITER_FOURTH_WALL, WINK, hashText } from '../data/arbiter.js'

export const FOURTH_WALL_KEY = 'elementa-fourthwall'

/** 'yes', 'no', or null when the player has not been asked yet. */
export function readFourthWall(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(FOURTH_WALL_KEY)
    return raw === 'yes' || raw === 'no' ? raw : null
  } catch {
    return null
  }
}

export function writeFourthWall(value, storage = globalThis.localStorage) {
  if (value !== 'yes' && value !== 'no') return false
  try {
    storage.setItem(FOURTH_WALL_KEY, value)
    return true
  } catch {
    // storage blocked: the answer still applies for this sitting through the caller
    return false
  }
}

// --- How long this sitting has lasted, and how often the tab was left. ---

const session = { start: null, returned: 0, leftAt: null }

/** Starts counting (once, and only when the player said yes). Returns a stop function. */
export function startSessionTracking(doc = globalThis.document, now = () => Date.now()) {
  if (!doc || session.start != null) return () => {}
  session.start = now()
  const onChange = () => {
    if (doc.hidden) session.leftAt = now()
    else if (session.leftAt != null) {
      session.returned += 1
      session.leftAt = null
    }
  }
  doc.addEventListener('visibilitychange', onChange)
  return () => {
    doc.removeEventListener('visibilitychange', onChange)
    session.start = null
    session.returned = 0
    session.leftAt = null
  }
}

// --- What the browser tells the page. ---

export function parseOs(ua = '') {
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS'
  if (/CrOS/i.test(ua)) return 'ChromeOS'
  if (/Linux|X11/i.test(ua)) return 'Linux'
  return null
}

export function parseBrowser(ua = '') {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\/|Opera/.test(ua)) return 'Opera'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return null
}

function languageName(code, uiLang) {
  if (!code) return null
  try {
    const names = new Intl.DisplayNames([uiLang || 'en'], { type: 'language' })
    return names.of(code.split('-')[0]) || null
  } catch {
    return code
  }
}

function timeOfDay(date, uiLang) {
  try {
    return date.toLocaleTimeString(uiLang === 'es' ? 'es' : 'en', { hour: 'numeric', minute: '2-digit' })
  } catch {
    return null
  }
}

/**
 * The details a line can use. Any value the page cannot see is left out, and a
 * line that needs it is skipped. `env` carries the pieces so a test can run
 * this anywhere: { navigator, screen, now, timeZone, profile, lang }.
 */
export function gatherDetails(env = {}) {
  const nav = env.navigator ?? globalThis.navigator
  const scr = env.screen ?? globalThis.screen
  const date = new Date(env.now ?? Date.now())
  const uiLang = env.lang ?? 'en'
  const out = {}
  const put = (key, value) => {
    if (value != null && value !== '' && !(typeof value === 'number' && !Number.isFinite(value))) out[key] = String(value)
  }
  put('hour', timeOfDay(date, uiLang))
  let zone = env.timeZone
  if (zone === undefined) {
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      zone = null
    }
  }
  put('timezone', zone ? zone.replace(/_/g, ' ') : null)
  const ua = nav?.userAgent ?? ''
  put('os', parseOs(ua))
  put('browser', parseBrowser(ua))
  put('language', languageName(nav?.language, uiLang))
  if (scr?.width && scr?.height) put('screen', `${scr.width} x ${scr.height}`)
  if (session.start != null) {
    const minutes = Math.floor(((env.now ?? Date.now()) - session.start) / 60000)
    if (minutes >= 1) put('minutes', minutes)
    if (session.returned >= 1) put('returned', session.returned)
  }
  const stats = env.profile?.stats
  if (stats?.runs >= 1) put('runs', stats.runs)
  if (stats?.wins >= 1) put('wins', stats.wins)
  return out
}

/** The placeholders a text uses, e.g. ['hour', 'timezone']. */
export const placeholdersOf = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1])

/** Fills a line, or returns null when a value it needs is missing. */
export function fillLine(line, lang, details) {
  const text = line.text[lang] ?? line.text.en
  for (const key of placeholdersOf(text)) if (!(key in details)) return null
  const filled = text.replace(/\{(\w+)\}/g, (_, key) => details[key])
  return line.bluff ? filled + WINK : filled
}

/**
 * One fourth-wall line from a pool, or null. Nothing is said unless the player
 * said yes. The pick is steady for a run and a round (a hash, never the game's
 * seeded generator), and a line with a missing value is skipped for the next.
 */
export function fourthWallLine({ pool, permission, details, lang, seed = '', round = 0 }) {
  if (permission !== 'yes' || !pool?.length) return null
  const start = hashText(`${seed}:${round}`) % pool.length
  for (let k = 0; k < pool.length; k++) {
    const filled = fillLine(pool[(start + k) % pool.length], lang, details)
    if (filled) return filled
  }
  return null
}

export const arbiterFourthWall = (args) => fourthWallLine({ ...args, pool: ARBITER_FOURTH_WALL })
export const rewriterFourthWall = (rewriterId, args) => fourthWallLine({ ...args, pool: REWRITER_FOURTH_WALL[rewriterId] })
