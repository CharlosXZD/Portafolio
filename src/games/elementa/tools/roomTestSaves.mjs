// Test saves for the V3 shop rooms and event backdrops (VISUALS.md V3.9): one
// backup file with a save file standing in each shop type (found by playing
// seeded runs with tiny targets until each shop shows up), at the table, in a
// boss fight and at the Crossroads. Muted and with the tutorial off, like every
// test save.
//
//   node src/games/elementa/tools/roomTestSaves.mjs
// writes src/games/elementa/tools/room-test-saves.json (a backup file, slots 0 to 2:
// load it in Options > Backup, then open a slot). Also writes room-test-index.json,
// which says what each slot holds, one backup file per scenario in room-test-saves/.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer, initialState, selectors } from '../engine/gameReducer.js'
import { nextChoices } from '../engine/map.js'
import { emptyProfile } from '../utils/saveManager.js'

const found = {}
const want = (key, state) => {
  if (!found[key]) found[key] = JSON.parse(JSON.stringify(state))
}

for (let n = 0; n < 40; n++) {
  const seed = `ROOM${n}`
  let s = gameReducer(initialState(), { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed, recipes: [], file: { endings: [], wardens: [], mythics: [], mote: { fed: 0 } } })
  s = { ...s, activeSlot: 0, difficulty: { ...s.difficulty, thresholdBase: 1, thresholdGrowth: 1 }, threshold: 1 }
  for (let i = 0; i < 80 && s.round <= 24; i++) {
    if (s.phase === 'rolling') {
      if (!found['shop:camp'] && s.round === 2) {
        const missed = gameReducer({ ...s, threshold: 1e12 }, { type: 'SUBMIT_ROUND' })
        if (missed.phase === 'missed') want('shop:camp', gameReducer(missed, { type: 'GO_TO_CAMP' }))
      }
      want(s.bossModifier ? 'boss' : 'table', s)
      s = gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    } else if (s.phase === 'shop') {
      want(s.realm === 'firmament' ? `shop:${s.shop.type}` : `shop:${s.shop.type}`, s)
      if (s.map && !s.map.pendingId) {
        const choices = nextChoices(s.map)
        const fresh = choices.find((c) => !found[`shop:${c.type}`]) ?? choices[0]
        if (fresh) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: fresh.id })
      }
      s = gameReducer(s, { type: 'NEXT_ROUND' })
    } else if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
    else if (s.phase === 'crossroads') {
      want('crossroads', s)
      s = gameReducer(s, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(s)[0] })
    } else break
  }
}


// The Firmament: start from the Firmament test save (its file has the door open), clear the
// round 15 boss, record the Crossroads, step through and walk the Road to see the Firmament's shops.
const fb = JSON.parse(readFileSync(fileURLToPath(new URL('./firmament-test-saves.json', import.meta.url)), 'utf8'))
const ffiles = JSON.parse(fb.data['elementa-files-v2'])
const profiles = { profile: ffiles[0].profile }
// Several seeded Firmament walks, so the rarer shops (Mote's Pantry, the Astral Exchange) turn up too.
for (let n = 0; n < 40; n++) {
  let fs = { ...ffiles[0].run, seed: n === 0 ? ffiles[0].run.seed : `FIR${n}`, difficulty: { ...ffiles[0].run.difficulty, thresholdBase: 1, thresholdGrowth: 1 }, threshold: 1 }
  for (let i = 0; i < 120 && fs.round <= 28; i++) {
    if (fs.phase === 'rolling') fs = gameReducer({ ...fs, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    else if (fs.phase === 'crossroads') {
      if (n === 0) want('crossroads', fs)
      fs = gameReducer(fs, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(fs)[0] })
    } else if (fs.phase === 'shop' || fs.phase === 'bossReward') {
      if (fs.phase === 'bossReward') fs = gameReducer(fs, { type: 'CHOOSE_BOSS_REWARD', dieId: fs.dice[0].id, slot: 'dice' })
      else {
        if (fs.realm === 'firmament') want(`fshop:${fs.shop.type}`, fs)
        if (fs.map && !fs.map.pendingId) {
          const choices = nextChoices(fs.map)
          const fresh = choices.find((c) => !found[`fshop:${c.type}`]) ?? choices[0]
          if (fresh) fs = gameReducer(fs, { type: 'CHOOSE_PATH', nodeId: fresh.id })
        }
        fs = gameReducer(fs, { type: 'NEXT_ROUND' })
      }
    } else break
  }
}


// Shops the walks never rolled (Mote's Pantry, the Astral Exchange): re-type the next stop of a
// Firmament run to that shop and step in, so the real reducer builds the shop.
for (const typeId of ['pantry', 'astral']) {
  if (found[`fshop:${typeId}`]) continue
  let fs = { ...ffiles[0].run, difficulty: { ...ffiles[0].run.difficulty, thresholdBase: 1, thresholdGrowth: 1 }, threshold: 1 }
  for (let i = 0; i < 120; i++) {
    if (fs.phase === 'rolling') fs = gameReducer({ ...fs, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    else if (fs.phase === 'crossroads') fs = gameReducer(fs, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(fs)[0] })
    else if (fs.phase === 'bossReward') fs = gameReducer(fs, { type: 'CHOOSE_BOSS_REWARD', dieId: fs.dice[0].id, slot: 'dice' })
    else if (fs.phase === 'shop' && fs.realm === 'firmament') {
      const map = JSON.parse(JSON.stringify(fs.map))
      const choice = nextChoices(map)[0]
      const walk = (o) => {
        if (o && typeof o === 'object') {
          if (o.id === choice.id && 'type' in o) o.type = typeId
          Object.values(o).forEach(walk)
        }
      }
      walk(map)
      fs = gameReducer({ ...fs, map }, { type: 'CHOOSE_PATH', nodeId: choice.id })
      fs = gameReducer(fs, { type: 'NEXT_ROUND' })
      while (fs.phase === 'rolling') fs = gameReducer({ ...fs, threshold: 1 }, { type: 'SUBMIT_ROUND' })
      if (fs.phase === 'bossReward') fs = gameReducer(fs, { type: 'CHOOSE_BOSS_REWARD', dieId: fs.dice[0].id, slot: 'dice' })
      if (fs.phase === 'shop' && fs.shop.type === typeId) want(`fshop:${typeId}`, fs)
      break
    } else if (fs.phase === 'shop') fs = gameReducer(fs, { type: 'NEXT_ROUND' })
    else break
  }
}

mkdirSync(fileURLToPath(new URL('./room-test-saves/', import.meta.url)), { recursive: true })
const index = {}
for (const [key, state] of Object.entries(found)) {
  const run = { ...state, shards: 400, threshold: 1 }
  const files = { 0: { createdAt: Date.now(), updatedAt: Date.now(), profile: { ...(key === 'crossroads' || key.startsWith('fshop') ? profiles.profile : emptyProfile()), stats: { runs: 1, wins: 0, bestCast: 0, bestRound: run.round } }, run } }
  const backup = {
    format: 'elementa-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      'elementa-files-v2': JSON.stringify(files),
      'elementa-tutorial-v1': JSON.stringify({ seen: [], off: true }),
      'elementa-music-enabled': 'false',
      'elementa-music-volume': '0',
      'elementa-sfx-volume': '0',
    },
  }
  const name = key.replace(':', '-')
  writeFileSync(fileURLToPath(new URL(`./room-test-saves/${name}.json`, import.meta.url)), JSON.stringify(backup))
  index[key] = { phase: run.phase, round: run.round, shop: run.shop?.type ?? null }
}
writeFileSync(fileURLToPath(new URL('./room-test-index.json', import.meta.url)), JSON.stringify(index, null, 1))
console.log(Object.keys(found).sort().join(', '))
