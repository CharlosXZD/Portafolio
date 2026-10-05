// Tests for Part S (v0.9.2 "The Arbiter"): run with `node src/games/elementa/tools/arbiterTest.mjs`.
import { readFileSync } from 'node:fs'
const base = new URL('../', import.meta.url).pathname
const R = await import(base + 'engine/gameReducer.js')
const { nextChoices } = await import(base + 'engine/map.js')
const A = await import(base + 'data/arbiter.js')
const FW = await import(base + 'utils/fourthWall.js')
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
  const files = ['data/arbiter.js', 'utils/fourthWall.js', 'utils/useFourthWall.js', 'utils/useArbiter.js', 'components/ArbiterParts.jsx']
  const banned = [/document\.cookie/, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/, /EventSource/, /navigator\.geolocation/, /navigator\.sendBeacon/, /\bimport\s*\(/]
  for (const f of files) {
    const src = readFileSync(base + f, 'utf8')
    eq(`${f}: no cookie read, no request, no socket`, banned.filter((re) => re.test(src)).map(String), [])
    eq(`${f}: no em dash`, src.includes('—'), false)
  }
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
  const none = FW.gatherDetails({ navigator: {}, screen: {}, now: 0, timeZone: null, profile: { stats: { runs: 0, wins: 0 } }, lang: 'en' })
  eq('a missing value is left out, not guessed', Object.keys(none).filter((k) => k !== 'hour'), [])
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
  eq('two lines for each of the six Rewriters', Object.entries(A.REWRITER_FOURTH_WALL).map(([k, v]) => [k, v.length]), ['axiom', 'zero', 'infinity', 'observer', 'floating', 'deadlock'].map((k) => [k, 2]))
  const allLines = [...A.ARBITER_FOURTH_WALL, ...Object.values(A.REWRITER_FOURTH_WALL).flat()]
  const known = new Set(['hour', 'timezone', 'os', 'browser', 'language', 'screen', 'returned', 'runs', 'wins', 'minutes'])
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

console.log(fails ? `${fails} FAILED` : 'all ok')
