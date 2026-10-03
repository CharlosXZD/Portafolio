// Test saves for the Firmament (EXPANSION.md H8, H9). Writes a backup file
// (the format Options > Backup loads) with three save files, each standing
// at round 15 on one path with that path's door open, so the whole
// Firmament can be clicked through without playing a run:
//   File 1: Neutral path. Its file has already beaten the Expanse, the
//           Maelstrom and the Hollow, so Space, Chaos and Void are on sale
//           past the door, and beating Set I teaches Entropy's recipe.
//   File 2: Split path, a clean file (no Mythic dice yet).
//   File 3: Primordial path, in the gods' gauntlet. Mote has eaten 35 Shards
//           of goods, so a little more makes it speak.
// Targets are tiny (the run's difficulty is patched to a target of 1 every
// round), the tutorial is off, and every run has Shards to spend.
//
// Run from the repo root:
//   node src/games/elementa/tools/firmamentTestSaves.mjs
// It writes src/games/elementa/tools/firmament-test-saves.json.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer, initialState } from '../engine/gameReducer.js'
import { nextChoices } from '../engine/map.js'
import { emptyProfile } from '../utils/saveManager.js'

const GODS = ['gaea', 'ognen', 'varuna', 'zephyr']

const FILES = [
  {
    path: 'neutral',
    seed: 'NEUTRAL7',
    deckId: 'balanced',
    endings: ['neutral'],
    wardens: ['expanse', 'maelstrom', 'hollow'],
    mythics: ['space', 'chaos', 'void'],
    moteFed: 0,
  },
  { path: 'split', seed: 'SPLITPTH', deckId: 'tidecaller', endings: ['neutral', 'split'], wardens: [], mythics: [], moteFed: 0 },
  {
    path: 'primordial',
    seed: 'PRIMPATH',
    deckId: 'tempest',
    endings: ['neutral', 'primordial'],
    wardens: [],
    mythics: [],
    moteFed: 35,
  },
]

// Walks a run to round 15 with tiny targets, leaning the Accord to `path`
// just before the final battle locks it.
function runTo15({ path, seed, deckId, endings, wardens, mythics, moteFed }) {
  const file = { endings, wardens, mythics, mote: { fed: moteFed } }
  let s = gameReducer(initialState(), {
    type: 'START_RUN',
    deckId,
    difficultyId: 'ember',
    seed,
    recipes: ['aether', ...GODS],
    file,
  })
  s = { ...s, activeSlot: null, difficulty: { ...s.difficulty, thresholdBase: 1, thresholdGrowth: 1 }, threshold: 1 }
  for (let i = 0; i < 200 && !(s.round === 15 && s.phase === 'rolling'); i++) {
    if (s.phase === 'rolling') s = gameReducer(s, { type: 'SUBMIT_ROUND' })
    else if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
    else if (s.phase === 'shop') {
      if (s.round === 14) s = { ...s, accord: path === 'primordial' ? 20 : path === 'split' ? -20 : 0 }
      const choices = nextChoices(s.map)
      if (choices.length > 1) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: choices[0].id })
      s = gameReducer(s, { type: 'NEXT_ROUND' })
    } else throw new Error(`unexpected phase ${s.phase}`)
  }
  if (s.path !== path) throw new Error(`${seed} landed on ${s.path}, wanted ${path}`)
  return { ...s, shards: 150 }
}

const files = {}
FILES.forEach((spec, slot) => {
  const run = { ...runTo15(spec), activeSlot: slot }
  const profile = {
    ...emptyProfile(),
    recipes: ['aether', ...GODS],
    endings: spec.endings,
    deckEndings: { [spec.deckId]: spec.endings },
    decksBeaten: ['balanced', 'tidecaller', 'tempest'],
    difficultiesBeaten: ['ember'],
    wins: { balanced: ['ember'] },
    wardens: spec.wardens,
    mythics: spec.mythics,
    mote: { fed: spec.moteFed },
    stats: { runs: 3, wins: 3, bestCast: 0, bestRound: 15 },
  }
  files[slot] = { createdAt: Date.now(), updatedAt: Date.now(), profile, run }
})

const backup = {
  format: 'elementa-backup',
  version: 1,
  exportedAt: new Date().toISOString(),
  data: {
    'elementa-files-v2': JSON.stringify(files),
    'elementa-tutorial-v1': JSON.stringify({ seen: [], off: true }),
  },
}
const out = fileURLToPath(new URL('./firmament-test-saves.json', import.meta.url))
writeFileSync(out, JSON.stringify(backup))
console.log(`wrote ${out}`)
FILES.forEach((f, i) => console.log(`  file ${i + 1}: ${f.path}, round 15, seed ${f.seed}`))
