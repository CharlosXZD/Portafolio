// Smoke walk of every test-save family (QA loop, v0.9.17): loads each saved run the way the game does
// (LOAD_RUN then RESUME_RUN), then plays it forward with a small bot for up to STEPS actions and checks
// that nothing throws, no number turns NaN and the phase stays one the game knows.
// Run: node src/games/elementa/tools/smokeWalk.mjs
import { readFileSync, readdirSync } from 'node:fs'
const base = new URL('../', import.meta.url).pathname
const { gameReducer, selectors } = await import(base + 'engine/gameReducer.js')
const { nextChoices } = await import(base + 'engine/map.js')
const { evaluatePool } = await import(base + 'engine/scoring.js')
const STEPS = 60
const KNOWN = new Set(['title', 'runPreview', 'rolling', 'shop', 'bossReward', 'victory', 'crossroads', 'missed', 'gameover', 'duel', 'ending', 'story'])
const score = (s) => evaluatePool(s.dice, selectors.effectiveRelics(s), selectors.scoreContext(s)).roundScore

function files(path) {
  const bk = JSON.parse(readFileSync(path, 'utf8'))
  return Object.entries(JSON.parse(bk.data['elementa-files-v2'])).filter(([, f]) => f && f.run).map(([slot, f]) => ({ slot, run: f.run, file: f }))
}

function walk(run, slot) {
  let s = gameReducer({ phase: 'title', activeSlot: slot }, { type: 'LOAD_RUN', save: run, slot })
  s = gameReducer(s, { type: 'RESUME_RUN' })
  const seen = []
  for (let i = 0; i < STEPS; i++) {
    seen.push(s.phase)
    if (!KNOWN.has(s.phase)) { seen.push('UNKNOWN:' + s.phase); break }
    const before = s
    if (s.phase === 'rolling') {
      for (let g = 0; g < 6 && selectors.availableRerolls(s) > 0 && score(s) < s.threshold; g++) {
        s.dice.forEach((d) => { if (!d.locked && d.held !== d.value >= Math.ceil(d.sides * 0.7)) s = gameReducer(s, { type: 'TOGGLE_HELD', dieId: d.id }) })
        s = gameReducer(s, { type: 'REROLL_UNHELD' })
      }
      s = gameReducer(s, { type: 'SUBMIT_ROUND' })
    } else if (s.phase === 'shop') {
      const nodes = s.map ? nextChoices(s.map) : []
      if (s.shop?.type !== 'camp' && !s.convergence && nodes.length && !s.map.pendingId) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: nodes[0].id })
      s = gameReducer(s, { type: 'NEXT_ROUND' })
    } else if (s.phase === 'bossReward') {
      const canGrow = s.dice.find((d) => selectors.growTier(s, d))
      s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: (canGrow ?? s.dice[0]).id, slot: 'dice' })
      if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'relics' })
    } else if (s.phase === 'victory') s = gameReducer(s, { type: 'CONTINUE_ENDLESS' })
    else if (s.phase === 'crossroads') {
      s = gameReducer(s, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(s)[0] })
      if (s === before) s = gameReducer(s, { type: 'ENTER_REALM3', set: selectors.realm3Sets(s)[0] })
      if (s === before) s = gameReducer(s, { type: 'ENTER_UNWRITTEN' })
    }
    else if (s.phase === 'missed') { s = gameReducer(s, { type: 'GO_TO_CAMP' }); if (s.phase === 'missed') s = gameReducer(s, { type: 'RETRY_ROUND' }) }
    else break // gameover, ending, story, duel: a stop
    if (s === before && before.phase === 'victory') { seen.push('victory (closed run)'); break }
    if (s === before) { seen.push('STUCK'); if (process.env.DEBUG) console.log('   stuck in', before.phase, before.shop?.type, 'round', before.round, 'pending', before.map?.pendingId, 'choices', before.map ? nextChoices(before.map).length : '-'); break }
    for (const k of ['shards', 'threshold', 'round']) if (typeof s[k] === 'number' && !Number.isFinite(s[k])) throw new Error(k + ' is not finite in phase ' + s.phase)
  }
  return seen
}

let fails = 0, walked = 0
const report = (name, fn) => {
  try {
    const seen = fn()
    const bad = seen.some((p) => p.startsWith('UNKNOWN') || p === 'STUCK')
    if (bad) fails++
    walked++
    if (bad && process.env.DEBUG) console.log('   phases', seen.join(' > '))
    console.log(bad ? 'FAIL' : 'ok  ', name, seen.slice(0, 1).join(''), '->', seen.at(-1), `(${seen.length} steps)`)
  } catch (e) { fails++; walked++; console.log('FAIL', name, e.message) }
}
for (const fam of ['firmament', 'realm3', 'convergence', 'item-shop', 'map']) {
  for (const f of files(base + `tools/${fam}-test-saves.json`)) report(`${fam} file ${f.slot} (round ${f.run.round})`, () => walk(f.run, +f.slot))
}
for (const name of readdirSync(base + 'tools/room-test-saves').filter((n) => n.endsWith('.json'))) {
  for (const f of files(base + 'tools/room-test-saves/' + name)) report(`room ${name} file ${f.slot} (round ${f.run.round}, ${f.run.phase})`, () => walk(f.run, +f.slot))
}
console.log(fails ? `${fails} FAILED of ${walked}` : `all ok (${walked} saves walked)`)
