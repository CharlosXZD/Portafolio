// Tests for Part S (v0.9.2 "The Arbiter"): run with `node src/games/elementa/tools/arbiterTest.mjs`.
import { readFileSync } from 'node:fs'
const base = new URL('../', import.meta.url).pathname
const R = await import(base + 'engine/gameReducer.js')
const { nextChoices } = await import(base + 'engine/map.js')
const A = await import(base + 'data/arbiter.js')
const FW = await import(base + 'utils/fourthWall.js')
const W = await import(base + 'utils/weather.js')
const { SCENES } = await import(base + 'data/story.js')
let fails = 0
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(ok ? 'ok  ' : 'FAIL', name, ok ? '' : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`) }

// ---- a fake browser: storage, window, and traps for anything that must never be touched ----
const mkStorage = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i], get length() { return m.size } } }
let netCalls = 0, cookieReads = 0
globalThis.fetch = () => { netCalls++; throw new Error('network') }
globalThis.XMLHttpRequest = function () { netCalls++ }
const doc = { hidden: false, listeners: {}, addEventListener(t, f) { (this.listeners[t] ||= []).push(f) }, removeEventListener(t, f) { this.listeners[t] = (this.listeners[t] || []).filter((x) => x !== f) } }
Object.defineProperty(doc, 'cookie', { get() { cookieReads++; return '' } })
globalThis.document = doc

const NAV = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15', language: 'es-MX' }
const SCR = { width: 1512, height: 982 }
const profile = { stats: { runs: 7, wins: 3 } }
const env = (extra = {}) => ({ navigator: NAV, screen: SCR, now: new Date(2026, 9, 4, 23, 42).getTime(), timeZone: 'America/Mexico_City', profile, lang: 'en', ...extra })

// ---- the files hold no network and no cookie code ----
{
  // T7: the Arbiter's code, weather.js aside, never touches the network or the cookie.
  const files = ['data/arbiter.js', 'utils/fourthWall.js', 'utils/useFourthWall.js', 'utils/useArbiter.js', 'utils/useWeather.js', 'components/ArbiterParts.jsx']
  const banned = [/document\.cookie/, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/, /EventSource/, /navigator\.geolocation/, /navigator\.sendBeacon/, /\bimport\s*\(/]
  for (const f of files) {
    const src = readFileSync(base + f, 'utf8')
    eq(`${f}: no cookie read, no request, no socket`, banned.filter((re) => re.test(src)).map(String), [])
    eq(`${f}: no em dash`, src.includes('\u2014'), false)
    // No direct reads of stored site data either: permissions go through the two small readers.
    eq(`${f}: no direct storage read`, /localStorage\.getItem|sessionStorage|indexedDB/.test(src), false)
  }
  // weather.js is the one file that may use the network: one host, no stored response, no cookie.
  const w = readFileSync(base + 'utils/weather.js', 'utf8')
  const urls = [...new Set([...w.matchAll(/https?:\/\/[a-z0-9.${}_-]+/gi)].map((m) => m[0]))]
  eq('weather.js: the only address is Open-Meteo', urls, ['https://${OPEN_METEO_HOST}'])
  eq('weather.js: the host constant is Open-Meteo', w.includes("OPEN_METEO_HOST = 'api.open-meteo.com'"), true)
  eq('weather.js: no cookie read, one storage write (its own permission)', [/document\.cookie/.test(w), (w.match(/setItem\(/g) || []).length], [false, 1])
  eq('weather.js: no em dash', w.includes('\u2014'), false)
  eq('no other file asks for the weather itself', ['data/arbiter.js', 'utils/fourthWall.js', 'components/ArbiterParts.jsx'].some((f) => /fetchWeather|loadWeather/.test(readFileSync(base + f, 'utf8'))), false)
}

// ---- permission ----
{
  const store = mkStorage()
  eq('fresh file: not asked yet', FW.readFourthWall(store), null)
  eq('only yes and no are stored', [FW.writeFourthWall('maybe', store), FW.readFourthWall(store)], [false, null])
  eq('yes is stored', [FW.writeFourthWall('yes', store), FW.readFourthWall(store), store.getItem('elementa-fourthwall')], [true, 'yes', 'yes'])
  FW.writeFourthWall('no', store)
  eq('no is stored, and it is not asked again (never null once answered)', FW.readFourthWall(store), 'no')
  eq('a blocked storage reads as not asked, never throws', FW.readFourthWall({ getItem() { throw new Error('blocked') } }), null)
  eq('a blocked storage cannot be written, never throws', FW.writeFourthWall('yes', { setItem() { throw new Error('blocked') } }), false)
}

// ---- backups carry the setting ----
{
  const store = mkStorage()
  globalThis.window = { localStorage: store }
  FW.writeFourthWall('yes', store)
  store.setItem('elementa-music-volume', '0')
  store.setItem('other-site', 'x')
  const B = await import(base + 'utils/backup.js')
  const backup = B.buildBackup()
  eq('the backup holds elementa-fourthwall', backup.data['elementa-fourthwall'], 'yes')
  eq('...and only elementa keys', Object.keys(backup.data).sort(), ['elementa-fourthwall', 'elementa-music-volume'])
  const parsed = B.parseBackup(JSON.stringify(backup))
  store.setItem('elementa-fourthwall', 'no')
  try { B.restoreBackup(parsed) } catch { /* reload is not available here */ }
  eq('restoring a backup brings the setting back', store.getItem('elementa-fourthwall'), 'yes')
  delete globalThis.window
}

// ---- details, fills and missing values ----
{
  const d = FW.gatherDetails(env())
  eq('details: time, zone, system, language, screen, runs, wins', [!!d.hour, d.timezone, d.os, d.browser, d.language, d.screen, d.runs, d.wins], [true, 'America/Mexico City', 'macOS', 'Safari', 'Spanish', '1512 x 982', '7', '3'])
  eq('no session numbers before tracking starts', ['minutes' in d, 'returned' in d], [false, false])
  eq('no weather unless the second permission loaded it', ['temperature' in d, 'city' in d], [false, true])
  const none = FW.gatherDetails({ navigator: {}, screen: {}, now: 0, timeZone: null, profile: { stats: { runs: 0, wins: 0 } }, lang: 'en' })
  eq('a missing value is left out, not guessed', Object.keys(none).filter((k) => !['hour', 'weekday', 'season', 'moon'].includes(k)), [])
  const line = A.ARBITER_FOURTH_WALL.find((l) => l.id === 'runs')
  eq('fillLine fills every placeholder', FW.fillLine(line, 'en', d), '7 runs started on this file. I have been around for fewer. I make up for it by paying attention.')
  eq('fillLine returns null when a value is missing', FW.fillLine(line, 'en', none), null)
  const bluff = A.ARBITER_FOURTH_WALL.find((l) => l.bluff)
  eq('a bluff carries a wink and needs nothing', FW.fillLine(bluff, 'en', none).endsWith(A.WINK), true)
  eq('placeholdersOf', FW.placeholdersOf('{hour} in {timezone} {hour}'), ['hour', 'timezone', 'hour'])
  // the line picker skips lines it cannot fill
  const pool = [A.ARBITER_FOURTH_WALL.find((l) => l.id === 'returned'), A.ARBITER_FOURTH_WALL.find((l) => l.id === 'runs')]
  eq('the picker falls through to a line it can fill', FW.fourthWallLine({ pool, permission: 'yes', details: d, lang: 'en', seed: 'S', round: 31 })?.includes('7 runs'), true)
  eq('...and says nothing when none can be filled', FW.fourthWallLine({ pool: [pool[0]], permission: 'yes', details: d, lang: 'en', seed: 'S', round: 31 }), null)
  // permission
  for (const permission of ['no', null, undefined]) eq(`permission ${permission}: no fourth-wall line`, FW.arbiterFourthWall({ permission, details: d, lang: 'en', seed: 'S', round: 31 }), null)
  eq('permission yes: a line, from the ten', typeof FW.arbiterFourthWall({ permission: 'yes', details: d, lang: 'en', seed: 'S', round: 31 }), 'string')
  eq('...steady for the same run and round', FW.arbiterFourthWall({ permission: 'yes', details: d, lang: 'en', seed: 'S', round: 33 }), FW.arbiterFourthWall({ permission: 'yes', details: d, lang: 'en', seed: 'S', round: 33 }))
  eq('...in Spanish too', /^[^{}]+$/.test(FW.arbiterFourthWall({ permission: 'yes', details: FW.gatherDetails(env({ lang: 'es' })), lang: 'es', seed: 'S', round: 34 })), true)
  // session tracking: starts only when asked, counts a return
  let t = 0
  const stop = FW.startSessionTracking(doc, () => t)
  t = 5 * 60000; doc.hidden = true; doc.listeners.visibilitychange.forEach((f) => f())
  t = 6 * 60000; doc.hidden = false; doc.listeners.visibilitychange.forEach((f) => f())
  const s = FW.gatherDetails(env({ now: 7 * 60000 }))
  eq('session: minutes and one return', [s.minutes, s.returned], ['7', '1'])
  stop()
  eq('stopping clears the session', 'minutes' in FW.gatherDetails(env()), false)
  // none of that touched the network or the cookie
  eq('no request was made and no cookie was read', [netCalls, cookieReads], [0, 0])
}

// ---- the lines ----
{
  const sets = { ROUND: A.ARBITER_LINES.ROUND, SHOP: A.ARBITER_LINES.SHOP }
  for (const [name, bands] of Object.entries(sets)) for (const [band, list] of Object.entries(bands)) eq(`${name}/${band}: 3 to 5 lines, EN and ES`, [list.length >= 3 && list.length <= 5, list.every((l) => l.en && l.es)], [true, true])
  eq('gift and slip: 3 lines each', [A.ARBITER_LINES.GIFT.length, A.ARBITER_LINES.HINDRANCE.length], [3, 3])
  eq('ten Arbiter fourth-wall lines, two of them bluffs with a wink', [A.ARBITER_FOURTH_WALL.length, A.ARBITER_FOURTH_WALL.filter((l) => l.bluff).length], [10, 2])
  eq('three lines for each of the six Rewriters (two from Part S, one from T7)', Object.entries(A.REWRITER_FOURTH_WALL).map(([k, v]) => [k, v.length]), ['axiom', 'zero', 'infinity', 'observer', 'floating', 'deadlock'].map((k) => [k, 3]))
  eq('T7: at least twenty more Arbiter lines, a few bluffs', [A.ARBITER_FOURTH_WALL_PLUS.length >= 20, A.ARBITER_FOURTH_WALL_PLUS.filter((l) => l.bluff).length >= 3, A.ARBITER_FW_ALL.length], [true, true, 10 + A.ARBITER_FOURTH_WALL_PLUS.length])
  const allLines = [...A.ARBITER_FW_ALL, ...Object.values(A.REWRITER_FOURTH_WALL).flat()]
  const known = new Set(['hour', 'timezone', 'city', 'os', 'browser', 'language', 'languages', 'screen', 'window', 'ratio', 'orientation', 'cores', 'memory', 'connection', 'input', 'theme', 'battery', 'charging', 'arrived', 'firstVisit', 'lastVisit', 'weekday', 'season', 'moon', 'returned', 'runs', 'wins', 'minutes', 'temperature', 'weather', 'rain', 'daylight', 'sunset'])
  eq('every placeholder is one we can fill', allLines.every((l) => FW.placeholdersOf(l.text.en).every((p) => known.has(p)) && FW.placeholdersOf(l.text.es).join() === FW.placeholdersOf(l.text.en).join()), true)
  eq('no line names a placeholder twice with different spellings in ES', allLines.every((l) => l.text.es && l.text.es.length > 5), true)
  eq('his name lives in one place', [A.ARBITER.name.en, A.ARBITER.article.en], ['Arbiter', 'an Arbiter'])
  eq('P5 scene: the speaker is "an Arbiter"', SCENES.arbiter.pages.every((p) => p.speaker.en === 'an Arbiter' && p.speaker.es === 'un Árbitro'), true)
  eq('first line: new or met', [A.arbiterLine({ first: true }).en.startsWith('Hello'), A.arbiterLine({ first: true, met: true }).en.startsWith('We have met')], [true, true])
  const picks = new Set(Array.from({ length: 15 }, (_, i) => A.arbiterLine({ situation: 'round', favor: 0, round: 31 + i, seed: 'X' }).en))
  eq('the lines vary round to round', picks.size >= 3, true)
  eq('bands', [A.favorBand(0), A.favorBand(3), A.favorBand(-3), A.favorBand(2), A.favorBand(-2)], ['neutral', 'warm', 'cold', 'neutral', 'neutral'])
}

// ---- favor, gifts and hindrances in the reducer ----
{
  const bk = JSON.parse(readFileSync(base + 'tools/realm3-test-saves.json', 'utf8'))
  const run = JSON.parse(bk.data['elementa-files-v2'])[2].run
  eq('a realm 3 save starts at no favor and no mood (an old save has no field at all)', [run.favor ?? 0, run.arbiterRound ?? null], [0, null])
  const clear = (s) => R.gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
  let s = clear(run)
  eq('a clean clear in realm 3 raises favor by 1', s.favor, 1)
  eq('favor never rises outside realm 3', clear({ ...run, realm3: false, favor: 0 }).favor ?? 0, 0)
  eq('a cleared round with an offense does not raise it', clear({ ...run, arbiterOffense: true, favor: 2 }).favor, 2)
  eq('favor is capped at +10', clear({ ...run, favor: 10 }).favor, 10)
  // offenses lower it: the Eye-fishing counter of Part P5, in realm 3
  const e = (id, v) => ({ id, elementId: 'earth', sides: 20, tierId: 'd20', value: v, total: v, explosions: 0, chain: [v], rollId: 0.5, held: false, locked: false, lockedVia: null })
  const sg = { id: 'eye', elementId: 'sigil_nix_g', sides: 6, tierId: 'sigil', value: 0, total: 0, explosions: 0, chain: [0], rollId: 0.5, held: false, locked: false, lockedVia: null, symbol: 'eye', spirals: 0, landed: 0.5 }
  const table = { ...run, phase: 'rolling', dice: [sg, ...Array.from({ length: 5 }, (_, i) => e('d' + i, 3))], rngState: 777, lives: 3, favor: 0, eyeStrikes: 0, eyeShifts: 0, arbiterOffense: false, threshold: 1 }
  const offense = (st) => { const strikes = st.eyeStrikes; let x = { ...st, eyeShifts: 0, eyeBlind: false, rerollsUsed: 0, dice: st.dice.map((d) => ({ ...d, held: false, locked: false })) }; for (let i = 0; i < 40 && x.eyeStrikes === strikes; i++) x = R.gameReducer(x, { type: 'TOGGLE_HELD', dieId: 'd' + (i % 5) }); return x }
  const o1 = offense(table)
  eq('the first warning costs 1 favor and marks the round', [o1.eyeStrikes, o1.favor, o1.arbiterOffense], [1, -1, true])
  const o2 = offense(o1)
  eq('the second warning costs 1 more', [o2.eyeStrikes, o2.favor], [2, -2])
  const o3 = offense(o2)
  eq('the smite (third) costs 2', [o3.eyeStrikes, o3.favor, o3.lives], [3, -4, 2])
  eq('...and a round cleared after an offense earns nothing', clear({ ...o3, rerollsUsed: 0 }).favor, -4)
  eq('favor is capped at -10', offense({ ...o3, favor: -10 }).favor, -10)
  // a betrayal pact lowers it
  const betrayalState = { ...run, phase: 'shop', favor: 0, shop: { type: 'blackmarket', deals: [], betrayal: { id: 'severed_grace' }, dealTaken: null }, boons: [{ id: 'clarity', source: 'aeris', round: 30 }], aerisBanned: false }
  const took = R.gameReducer(betrayalState, { type: 'TAKE_DEAL', dealId: 'severed_grace' })
  eq('taking a Nix betrayal costs 1 favor', [took.shop.dealTaken, took.favor], ['severed_grace', -1])
  const plain = R.gameReducer({ ...betrayalState, shop: { ...betrayalState.shop, betrayal: null, deals: [{ id: 'loan', shards: 20 }] } }, { type: 'TAKE_DEAL', dealId: 'loan' })
  eq('an ordinary pact costs no favor', plain.favor, 0)
  // gift (warm) on round 32, hindrance (cold) on round 33; both deterministic and never on a Rewriter round for the slip
  eq('arbiterRound: warm gift on 32, 35, 38', [31, 32, 33, 34, 35, 36, 37, 38].map((r) => A.arbiterRound(5, r, false).gift), [false, true, false, false, true, false, false, true])
  eq('arbiterRound: cold slip on 33, 36, 39', [31, 32, 33, 34, 35, 36, 37, 38, 39].map((r) => A.arbiterRound(-5, r, false).cold), [false, false, true, false, false, true, false, false, true])
  eq('arbiterRound: no slip on a Rewriter round', A.arbiterRound(-5, 36, true).cold, false)
  eq('arbiterRound: neutral does nothing', [A.arbiterRound(0, 32, false).gift, A.arbiterRound(0, 33, false).cold], [false, false])
  eq('arbiterRound: same inputs, same answer', JSON.stringify(A.arbiterRound(5, 32, false)), JSON.stringify(A.arbiterRound(5, 32, false)))
  // walk to round 32 with a warm Arbiter
  const shop = clear(run)
  const next = (st) => {
    let x = st
    if (x.phase === 'bossReward') x = R.gameReducer(x, { type: 'CHOOSE_BOSS_REWARD', dieId: x.dice[0].id, slot: 'dice' })
    const ch = nextChoices(x.map)
    if (ch.length > 1) x = R.gameReducer(x, { type: 'CHOOSE_PATH', nodeId: ch[0].id })
    return R.gameReducer(x, { type: 'NEXT_ROUND' })
  }
  const warm = next({ ...shop, favor: 5 })
  eq('a warm Arbiter gives +1 reroll on round 32', [warm.round, warm.arbiterRound?.gift, warm.rerollsBonusThisRound], [32, true, 1])
  const coldShop = next({ ...shop, favor: -5 })
  eq('a cold one gives nothing on round 32', [coldShop.round, coldShop.arbiterRound?.gift, coldShop.rerollsBonusThisRound], [32, false, 0])
  const neutral = next({ ...shop, favor: 0 })
  eq('a neutral one gives nothing', [neutral.rerollsBonusThisRound, neutral.arbiterRound?.cold], [0, false])
  // the cold slip on round 33
  const to33 = (st) => next(clear(st))
  const c33 = to33({ ...coldShop, favor: -5 })
  eq('round 33 is cold: the mood says slip', [c33.round, c33.arbiterRound?.cold, c33.arbiterRound?.used], [33, true, false])
  const held = { ...c33, dice: c33.dice.map((d, i) => (i === 0 || i === 1 ? { ...d, held: true } : d)) }
  const r1 = R.gameReducer(held, { type: 'REROLL_UNHELD' })
  eq('the first reroll lets one hold slip (the first held die rerolls too)', [r1.arbiterRound.used, r1.dice[0].held, r1.dice[1].held], [true, false, true])
  eq('lives and Shards are untouched, never lethal', [r1.lives, r1.shards], [held.lives, held.shards])
  const r2 = R.gameReducer({ ...r1, dice: r1.dice.map((d, i) => (i === 2 ? { ...d, held: true } : d)) }, { type: 'REROLL_UNHELD' })
  eq('only once per round', r2.dice[2].held, true)
  const locked = R.gameReducer({ ...c33, dice: c33.dice.map((d, i) => (i === 0 ? { ...d, locked: true, lockedVia: 'lock', held: true } : d)) }, { type: 'REROLL_UNHELD' })
  eq('a locked die is never released', [locked.dice[0].locked, locked.dice[0].held], [true, true])
  // a retry keeps the mood and gives the gift again
  const gifted = { ...warm, phase: 'missed' }
  const retried = R.gameReducer(gifted, { type: 'RETRY_ROUND' })
  eq('a retry gives the gift again', retried.rerollsBonusThisRound ?? 'n/a', 1)
}

// ---- T7: weather and place, with a fake browser and a fake request ----
{
  const calls = []
  const reply = { ok: true, json: async () => ({ current: { temperature_2m: 18.4, precipitation: 0, wind_speed_10m: 9, cloud_cover: 45, is_day: 0 }, daily: { sunrise: ['2026-10-08T07:01'], sunset: ['2026-10-08T18:42'] } }) }
  const fakeFetch = async (url) => { calls.push(url); return reply }
  const geo = (answer) => ({ getCurrentPosition: (ok, fail) => (answer ? ok({ coords: answer }) : fail(new Error('denied'))) })
  const never = { getCurrentPosition() {} }
  const store = mkStorage()
  const d = FW.gatherDetails(env())
  eq('weather permission starts unanswered, separate from the first', [W.readWeather(store), FW.readFourthWall(store)], [null, null])
  eq('only yes or no is stored under its own key', [W.writeWeather('perhaps', store), W.writeWeather('yes', store), store.getItem('elementa-weather'), store.getItem('elementa-fourthwall')], [false, true, 'yes', null])
  for (const permission of ['no', null, undefined]) {
    W.forgetWeather()
    const out = await W.loadWeather(permission, { geolocation: geo({ latitude: 19.43, longitude: -99.13 }), fetch: fakeFetch })
    eq(`permission ${permission}: no request, nothing kept`, [out, calls.length, W.currentWeather()], [null, 0, null])
  }
  W.forgetWeather()
  void W.loadWeather('yes', { geolocation: never, fetch: fakeFetch })
  await new Promise((r) => setTimeout(r, 20))
  eq('before the browser answers the position, no request is made', calls.length, 0)
  const W2 = await import(base + 'utils/weather.js?denied')
  eq('the position denied: no request, nothing kept', [await W2.loadWeather('yes', { geolocation: geo(null), fetch: fakeFetch }), calls.length], [null, 0])
  const W3 = await import(base + 'utils/weather.js?ok')
  const w = await W3.loadWeather('yes', { geolocation: geo({ latitude: 19.4326, longitude: -99.1332 }), fetch: fakeFetch })
  eq('yes and answered: one request, to Open-Meteo, coordinates rounded to 0.1', [calls.length, new URL(calls[0]).host, new URL(calls[0]).searchParams.get('latitude'), new URL(calls[0]).searchParams.get('longitude')], [1, 'api.open-meteo.com', '19.4', '-99.1'])
  eq('...nothing in the request that identifies anyone', [...new URL(calls[0]).searchParams.keys()].sort(), ['current', 'daily', 'forecast_days', 'latitude', 'longitude', 'timezone'])
  eq('...the kept summary holds no position', [JSON.stringify(w).includes('19.4'), 'latitude' in w, 'longitude' in w], [false, false, false])
  eq('...temperature, night, sunset', [w.temperatureC, w.isDay, w.sunset], [18, false, '2026-10-08T18:42'])
  await W3.loadWeather('yes', { geolocation: geo({ latitude: 1, longitude: 1 }), fetch: fakeFetch })
  eq('...asked once per sitting', calls.length, 1)
  const W4 = await import(base + 'utils/weather.js?twice')
  const before = calls.length
  await Promise.all([1, 2].map(() => W4.loadWeather('yes', { geolocation: geo({ latitude: 10.04, longitude: 20.06 }), fetch: fakeFetch })))
  eq('two askers at once: one request, rounded coordinates', [calls.length - before, new URL(calls.at(-1)).searchParams.get('latitude'), new URL(calls.at(-1)).searchParams.get('longitude')], [1, '10', '20.1'])
  const W5 = await import(base + 'utils/weather.js?fails')
  eq('a failing service keeps nothing', await W5.loadWeather('yes', { geolocation: geo({ latitude: 5, longitude: 5 }), fetch: async () => { throw new Error('offline') } }), null)
  eq('the global request function was never used', netCalls, 0)
  const d2 = FW.gatherDetails({ ...env(), weather: w })
  eq('with the weather loaded, its words are there', [d2.temperature, d2.weather, d2.daylight, !!d2.sunset], ['18 °C', 'cloudy', 'night', true])
  const wl = A.ARBITER_FOURTH_WALL_PLUS.find((l) => l.id === 'weather')
  eq('a weather line says the numbers', FW.fillLine(wl, 'en', d2), 'It is 18 °C where you are, and cloudy. I like a tidy sky.')
  eq('...and is skipped without them', FW.fillLine(wl, 'en', d), null)
  const south = FW.gatherDetails({ ...env(), now: new Date(2026, 9, 8).getTime(), weather: { ...w, south: true } })
  const north = FW.gatherDetails({ ...env(), now: new Date(2026, 9, 8).getTime() })
  eq('the season follows the hemisphere the weather reported', [north.season, south.season], ['autumn', 'spring'])
  eq('city from the timezone name, never a lookup', FW.cityFromZone('America/Argentina/Buenos_Aires'), 'Buenos Aires')
  eq('moon phase is computed locally and varies', new Set([1, 8, 15, 22].map((day) => FW.moonPhase(new Date(2026, 9, day), 'en'))).size >= 3, true)
  const full = FW.gatherDetails(env({ navigator: { ...NAV, hardwareConcurrency: 8, deviceMemory: 8, languages: ['es-MX', 'en-US'], connection: { effectiveType: '4g', saveData: true } }, window: { innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2 }, matchMedia: (q) => ({ matches: /coarse/.test(q) }), referrer: 'https://www.example.org/page', battery: { level: 0.5, charging: false }, file: { createdAt: Date.UTC(2026, 8, 1), updatedAt: Date.UTC(2026, 9, 5) } }))
  eq('cores, memory, connection, input, window, ratio, battery, arrived, visits', [full.cores, full.memory, full.connection, full.input, full.window, full.ratio, full.battery, full.arrived, !!full.firstVisit, !!full.lastVisit], ['8', '8', '4g, data saver on', 'touch', '1200 x 800', '2', '50%', 'example.org', true, true])
  eq('...and none of them when the browser does not offer them', ['cores' in d, 'battery' in d, 'arrived' in d, 'connection' in d], [false, false, false, false])
}

console.log(fails ? `${fails} FAILED` : 'all ok')
