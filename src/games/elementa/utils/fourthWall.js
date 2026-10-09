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
import { ARBITER_FW_ALL, REWRITER_FOURTH_WALL, WINK, hashText } from '../data/arbiter.js'

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

const WORDS = {
  en: {
    moon: ['new', 'a waxing crescent', 'at first quarter', 'waxing gibbous', 'full', 'waning gibbous', 'at last quarter', 'a waning crescent'],
    season: { north: ['winter', 'spring', 'summer', 'autumn'], south: ['summer', 'autumn', 'winter', 'spring'] },
    weather: { clear: 'clear', cloudy: 'cloudy', overcast: 'overcast', rainy: 'rainy' },
    rain: { yes: 'raining', no: 'dry' },
    daylight: { day: 'daytime', night: 'night' },
    input: { touch: 'touch', mouse: 'mouse' },
    orientation: { portrait: 'portrait', landscape: 'landscape' },
    theme: { dark: 'dark', light: 'light' },
    saver: 'data saver on',
  },
  es: {
    moon: ['nueva', 'creciente', 'en cuarto creciente', 'gibosa creciente', 'llena', 'gibosa menguante', 'en cuarto menguante', 'menguante'],
    season: { north: ['invierno', 'primavera', 'verano', 'otoño'], south: ['verano', 'otoño', 'invierno', 'primavera'] },
    weather: { clear: 'despejado', cloudy: 'nublado', overcast: 'cubierto', rainy: 'lluvioso' },
    rain: { yes: 'lloviendo', no: 'seco' },
    daylight: { day: 'de día', night: 'de noche' },
    input: { touch: 'táctil', mouse: 'de ratón' },
    orientation: { portrait: 'vertical', landscape: 'horizontal' },
    theme: { dark: 'oscuro', light: 'claro' },
    saver: 'ahorro de datos activado',
  },
}

/** The phase of the moon on a date, computed here from the date alone (no lookup). */
export function moonPhase(date, lang = 'en') {
  const synodic = 29.530588853
  const knownNew = Date.UTC(2000, 0, 6, 18, 14)
  const days = (date.getTime() - knownNew) / 86400000
  const age = ((days % synodic) + synodic) % synodic
  return (WORDS[lang] ?? WORDS.en).moon[Math.floor(((age / synodic) * 8 + 0.5) % 8)]
}

/** The season for a date: the northern calendar unless the weather said the player is in the south. */
export function seasonOf(date, south, lang = 'en') {
  const m = date.getMonth()
  const k = m === 11 || m <= 1 ? 0 : m <= 4 ? 1 : m <= 7 ? 2 : 3
  return (WORDS[lang] ?? WORDS.en).season[south ? 'south' : 'north'][k]
}

/** "America/Mexico_City" is "Mexico City": the city comes from the timezone's name, offline. */
export function cityFromZone(zone) {
  if (!zone || !zone.includes('/')) return null
  const city = zone.split('/').pop().replace(/_/g, ' ')
  return city && city !== 'UTC' ? city : null
}

/** A few plain words for the weather summary kept by utils/weather.js. */
function weatherWords(w, lang, date) {
  const x = WORDS[lang] ?? WORDS.en
  const out = {}
  out.temperature = `${w.temperatureC} °C`
  out.weather = w.rainMm > 0 ? x.weather.rainy : w.cloud >= 80 ? x.weather.overcast : w.cloud >= 40 ? x.weather.cloudy : x.weather.clear
  out.rain = w.rainMm > 0 ? x.rain.yes : x.rain.no
  out.daylight = w.isDay ? x.daylight.day : x.daylight.night
  if (w.sunset) {
    const t = new Date(w.sunset)
    if (!Number.isNaN(t.getTime())) out.sunset = t.toLocaleTimeString(lang === 'es' ? 'es' : 'en', { hour: 'numeric', minute: '2-digit' })
  }
  void date
  return out
}

// What the battery says, read once when the sitting starts (a few browsers only; skipped elsewhere).
let batteryNow = null
export function probeBattery(nav = globalThis.navigator) {
  try {
    nav?.getBattery?.()
      .then((b) => {
        batteryNow = { level: b.level, charging: b.charging }
      })
      .catch(() => {})
  } catch {
    // no battery information: lines that need it are skipped
  }
}

/**
 * The details a line can use. Any value the page cannot see is left out, and a
 * line that needs it is skipped. `env` carries the pieces so a test can run
 * this anywhere: { navigator, screen, window, matchMedia, referrer, now,
 * timeZone, profile, file, weather, battery, lang }.
 */
export function gatherDetails(env = {}) {
  const nav = env.navigator ?? globalThis.navigator
  const scr = env.screen ?? globalThis.screen
  const win = env.window ?? globalThis.window
  const media = env.matchMedia ?? globalThis.matchMedia?.bind(globalThis)
  const date = new Date(env.now ?? Date.now())
  const uiLang = env.lang ?? 'en'
  const words = WORDS[uiLang] ?? WORDS.en
  const out = {}
  const put = (key, value) => {
    if (value != null && value !== '' && !(typeof value === 'number' && !Number.isFinite(value))) out[key] = String(value)
  }
  const matches = (q) => {
    try {
      return media ? Boolean(media(q)?.matches) : null
    } catch {
      return null
    }
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
  put('city', cityFromZone(zone))
  const ua = nav?.userAgent ?? ''
  put('os', parseOs(ua))
  put('browser', parseBrowser(ua))
  put('language', languageName(nav?.language, uiLang))
  const langs = [...new Set((nav?.languages ?? []).map((l) => languageName(l, uiLang)).filter(Boolean))].slice(0, 3)
  if (langs.length > 1) put('languages', langs.join(', '))
  if (scr?.width && scr?.height) put('screen', `${scr.width} x ${scr.height}`)
  if (win?.innerWidth && win?.innerHeight) {
    put('window', `${win.innerWidth} x ${win.innerHeight}`)
    put('orientation', win.innerWidth >= win.innerHeight ? words.orientation.landscape : words.orientation.portrait)
  }
  if (win?.devicePixelRatio) put('ratio', Math.round(win.devicePixelRatio * 100) / 100)
  put('cores', nav?.hardwareConcurrency)
  put('memory', nav?.deviceMemory)
  const conn = nav?.connection
  if (conn?.effectiveType) put('connection', conn.saveData ? `${conn.effectiveType}, ${words.saver}` : conn.effectiveType)
  const coarse = matches('(pointer: coarse)')
  if (coarse != null) put('input', coarse ? words.input.touch : words.input.mouse)
  const dark = matches('(prefers-color-scheme: dark)')
  if (dark != null) put('theme', dark ? words.theme.dark : words.theme.light)
  const battery = env.battery !== undefined ? env.battery : batteryNow
  if (battery && Number.isFinite(battery.level)) {
    put('battery', `${Math.round(battery.level * 100)}%`)
    put('charging', battery.charging ? 'yes' : 'no')
  }
  // How the visitor arrived: the site that linked here, when there is one.
  const ref = env.referrer ?? globalThis.document?.referrer
  if (ref) {
    try {
      const host = new URL(ref).hostname.replace(/^www\./, '')
      if (host && host !== win?.location?.hostname) put('arrived', host)
    } catch {
      // not an address: nothing to say
    }
  }
  // The first and last visit to this file, from its own record.
  const place = uiLang === 'es' ? 'es' : 'en'
  const day = (t) => (t ? new Date(t).toLocaleDateString(place, { weekday: 'long', month: 'long', day: 'numeric' }) : null)
  put('firstVisit', day(env.file?.createdAt))
  if (env.file?.updatedAt && env.file?.createdAt && env.file.updatedAt - env.file.createdAt > 3600000) put('lastVisit', day(env.file.updatedAt))
  put('weekday', date.toLocaleDateString(place, { weekday: 'long' }))
  put('season', seasonOf(date, Boolean(env.weather?.south), uiLang))
  put('moon', moonPhase(date, uiLang))
  if (session.start != null) {
    const minutes = Math.floor(((env.now ?? Date.now()) - session.start) / 60000)
    if (minutes >= 1) put('minutes', minutes)
    if (session.returned >= 1) put('returned', session.returned)
  }
  const stats = env.profile?.stats
  if (stats?.runs >= 1) put('runs', stats.runs)
  if (stats?.wins >= 1) put('wins', stats.wins)
  // The weather, only when the second permission was given and utils/weather.js has it.
  if (env.weather) Object.entries(weatherWords(env.weather, uiLang, date)).forEach(([k, v]) => put(k, v))
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

export const arbiterFourthWall = (args) => fourthWallLine({ ...args, pool: ARBITER_FW_ALL })
export const rewriterFourthWall = (rewriterId, args) => fourthWallLine({ ...args, pool: REWRITER_FOURTH_WALL[rewriterId] })
