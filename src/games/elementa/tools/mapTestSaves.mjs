// Test saves for the map (VISUALS.md V6). Writes a backup file (the format Options > Backup loads)
// with three save files, each standing in a shop so the map table on the right can be used:
//   File 1: Elementa, round 8, a Market. A boss is foretold for round 10 (a Shrine prophecy), so the
//           boss banner shows a name, and the Road ahead has forks to pick from.
//   File 2: the Firmament, round 20, Atlas's Cartography (Redraw, Add a path, Peek), so every map
//           service can be tried and the map watched as it changes.
//   File 3: realm 3 on the Primordial path (the Pleroma), round 38, a Market, three realms behind.
// Targets are tiny (patched to 1 every round), the tutorial is off and the game is muted (music
// and sound off), as the agent rules ask.
//
// Run from the repo root:
//   node src/games/elementa/tools/mapTestSaves.mjs
// It writes src/games/elementa/tools/map-test-saves.json.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer, initialState, selectors } from '../engine/gameReducer.js'
import { nextChoices, retypeAhead } from '../engine/map.js'
import { emptyProfile } from '../utils/saveManager.js'
import { MYTHIC_DIE_IDS, COSMIC_FUSION_IDS } from '../data/elements.js'
import { ABSOLUTE_IDS } from '../data/abstract.js'
import { SCENE_IDS } from '../data/story.js'

const GODS = ['gaea', 'ognen', 'varuna', 'zephyr']
const ALL_RECIPES = ['aether', ...GODS, ...MYTHIC_DIE_IDS, ...COSMIC_FUSION_IDS, 'entropy', ...ABSOLUTE_IDS]

function start({ seed, deckId, endings }) {
  const file = { endings, wardens: [], mythics: [], mote: { fed: 0 } }
  let s = gameReducer(initialState(), { type: 'START_RUN', deckId, difficultyId: 'ember', seed, recipes: ALL_RECIPES, file })
  return { ...s, activeSlot: null }
}

/** Plays with a target of 1 until `stop(state)` says the run is where we want it. */
function walk(s, path, stop) {
  for (let i = 0; i < 800 && !stop(s); i++) {
    if (s.phase === 'rolling') s = gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    else if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
    else if (s.phase === 'shop') {
      if (s.round === 14) s = { ...s, accord: path === 'primordial' ? 20 : path === 'split' ? -20 : 0 }
      const choices = nextChoices(s.map)
      if (choices.length > 1) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: choices[0].id })
      s = gameReducer(s, { type: 'NEXT_ROUND' })
    } else if (s.phase === 'crossroads' && s.round === 15) s = gameReducer(s, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(s)[0] })
    else if (s.phase === 'crossroads' && s.round === 30) s = gameReducer(s, { type: 'ENTER_REALM3', set: selectors.realm3Sets(s)[0] })
    else if (s.phase === 'victory') s = gameReducer(s, { type: 'CONTINUE_ENDLESS' })
    else if (s.phase === 'missed') s = gameReducer(s, { type: 'RETRY_ROUND' })
    else throw new Error(`unexpected phase ${s.phase} at round ${s.round}`)
  }
  return s
}
const inShop = (round) => (s) => s.phase === 'shop' && s.round === round

const files = {}

// File 1: Elementa, round 8, a foretold boss.
{
  let s = start({ seed: 'MAP1', deckId: 'balanced', endings: ['neutral'] })
  s = walk(s, 'neutral', inShop(8))
  s = { ...s, map: { ...s.map, prophecy: { round: 10, boss: { id: 'umbra' }, broken: false } }, threshold: 1, shards: 300 }
  files[0] = { s, endings: ['neutral'], deckId: 'balanced', path: 'neutral' }
}

// File 2: the Firmament, round 20, Atlas's Cartography.
{
  const endings = ['neutral', 'split']
  let s = start({ seed: 'MAP2', deckId: 'tidecaller', endings })
  s = walk(s, 'split', inShop(19))
  // The stop after round 20 (the Warden) is Atlas's: retype one stop in row 20 and pick it.
  let map = retypeAhead(s.map, 19, (n) => n.round === 20, (n, i) => (i === 0 ? 'cartography' : null))
  const target = map.layers[19][0]
  const from = map.layers[18].find((n) => n.id === map.currentId)
  // make sure the current stop leads to it
  if (!from.next.includes(target.id)) map = { ...map, layers: map.layers.map((l, i) => (i === 18 ? l.map((n) => (n.id === from.id ? { ...n, next: [...n.next, target.id].sort() } : n)) : l)) }
  s = { ...s, map }
  s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: target.id })
  s = gameReducer(s, { type: 'NEXT_ROUND' })
  s = walk(s, 'split', (x) => x.phase === 'shop' && x.round === 20)
  s = { ...s, shards: 400, threshold: 1 }
  files[1] = { s, endings, deckId: 'tidecaller', path: 'split' }
}

// File 3: realm 3, the Pleroma (Primordial path), round 38.
{
  const endings = ['neutral', 'primordial', 'firmament_primordial_1']
  let s = start({ seed: 'MAP3', deckId: 'tempest', endings })
  s = walk(s, 'primordial', inShop(38))
  s = { ...s, shards: 400, threshold: 1 }
  files[2] = { s, endings, deckId: 'tempest', path: 'primordial' }
}

const seen = SCENE_IDS.filter((id) => !['realm3', 'unwritten'].includes(id) && !id.startsWith('rewriter_'))
const out = {}
Object.entries(files).forEach(([slot, f]) => {
  const profile = {
    ...emptyProfile(),
    recipes: ALL_RECIPES,
    endings: f.endings,
    deckEndings: { [f.deckId]: f.endings },
    decksBeaten: ['balanced', 'tidecaller', 'tempest'],
    difficultiesBeaten: ['ember'],
    wins: { balanced: ['ember'] },
    wardens: ['expanse', 'maelstrom', 'hollow'],
    stats: { runs: 3, wins: 3, bestCast: 0, bestRound: 30 },
    achievements: ['through_door'],
    scenes: seen,
  }
  out[slot] = { createdAt: Date.now(), updatedAt: Date.now(), profile, run: { ...f.s, activeSlot: Number(slot) } }
})

const backup = {
  format: 'elementa-backup',
  version: 1,
  exportedAt: new Date().toISOString(),
  data: {
    'elementa-files-v2': JSON.stringify(out),
    'elementa-tutorial-v1': JSON.stringify({ seen: [], off: true }),
    'elementa-music-enabled': 'false',
    'elementa-music-volume': '0',
    'elementa-sfx-volume': '0',
  },
}
const outPath = fileURLToPath(new URL('./map-test-saves.json', import.meta.url))
writeFileSync(outPath, JSON.stringify(backup))
console.log(`wrote ${outPath}`)
Object.entries(files).forEach(([slot, f]) => console.log(`  file ${Number(slot) + 1}: round ${f.s.round}, ${f.s.shop?.type}, ${f.path}, realm3 ${Boolean(f.s.realm3)}`))
