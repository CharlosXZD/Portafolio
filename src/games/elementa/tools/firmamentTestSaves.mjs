// Test saves for the Firmament (EXPANSION.md H8, H9). Writes a backup file
// (the format Options > Backup loads) with three save files, each standing
// at round 15 on one path with that path's door open, so the whole
// Firmament can be clicked through without playing a run:
//   File 1: Neutral path. Its file has already beaten the Expanse, the
//           Maelstrom and the Hollow, and beating Set I teaches the rest.
//           The run also holds base-element dice (four Glimmer, a Flux, a
//           Moment, a Null) to try every kind of forge past the door.
//   File 2: Split path.
//   File 3: Primordial path, in the gods' gauntlet. Mote has eaten 35 Shards
//           of goods, so a little more makes it speak.
// Since v0.8 (EXPANSION.md K7) every file knows every recipe (the gods,
// Aether, the six Mythic dice, the seven element fusions, Entropy), every
// run holds 4 Stardust and two runed dice (one rune each, and a clash on
// the same number to test the Forge's fee). Targets are tiny (the run's
// difficulty is patched to a target of 1 every round), the tutorial is off,
// every run has Shards to spend, and the game is muted (music and sound off),
// as the agent rules ask.
//
// Run from the repo root:
//   node src/games/elementa/tools/firmamentTestSaves.mjs
// It writes src/games/elementa/tools/firmament-test-saves.json.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer, initialState } from '../engine/gameReducer.js'
import { nextChoices } from '../engine/map.js'
import { emptyProfile } from '../utils/saveManager.js'
import { MYTHIC_DIE_IDS, COSMIC_FUSION_IDS } from '../data/elements.js'
import { tierById } from '../data/diceTiers.js'

const GODS = ['gaea', 'ognen', 'varuna', 'zephyr']
const ALL_RECIPES = ['aether', ...GODS, ...MYTHIC_DIE_IDS, ...COSMIC_FUSION_IDS, 'entropy']

const FILES = [
  {
    path: 'neutral',
    seed: 'NEUTRAL7',
    deckId: 'balanced',
    endings: ['neutral'],
    wardens: ['expanse', 'maelstrom', 'hollow'],
    mythics: ['space', 'chaos', 'void'],
    moteFed: 0,
    extraDice: ['glimmer', 'glimmer', 'glimmer', 'glimmer', 'flux', 'moment', 'nil'],
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
function runTo15({ path, seed, deckId, endings, wardens, mythics, moteFed, extraDice }) {
  const file = { endings, wardens, mythics, mote: { fed: moteFed } }
  let s = gameReducer(initialState(), {
    type: 'START_RUN',
    deckId,
    difficultyId: 'ember',
    seed,
    recipes: ALL_RECIPES,
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
  // Two runed dice that clash on their top face, and (File 1) base dice.
  const runed = s.dice.map((d, i) =>
    i === 0 ? { ...d, runes: [{ id: 'echo', face: d.sides }] } : i === 1 ? { ...d, runes: [{ id: 'ember', face: d.sides }, { id: 'anchor', face: 1 }] } : d,
  )
  const extra = (extraDice || []).map((elementId, k) => ({
    id: `test-${elementId}-${k}`,
    elementId,
    tierId: 'd6',
    sides: tierById('d6').sides,
    held: false,
    locked: false,
    lockedVia: null,
    value: 1,
    total: 1,
    explosions: 0,
    rollId: k,
    runes: [],
  }))
  return { ...s, dice: [...runed, ...extra], diceCapBonus: (s.diceCapBonus || 0) + extra.length, shards: 300, stardust: 4 }
}

const files = {}
FILES.forEach((spec, slot) => {
  const run = { ...runTo15(spec), activeSlot: slot }
  const profile = {
    ...emptyProfile(),
    recipes: ALL_RECIPES,
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
    // Muted, so a test never plays over Carlos's own tab.
    'elementa-music-enabled': 'false',
    'elementa-music-volume': '0',
    'elementa-sfx-volume': '0',
  },
}
const out = fileURLToPath(new URL('./firmament-test-saves.json', import.meta.url))
writeFileSync(out, JSON.stringify(backup))
console.log(`wrote ${out}`)
FILES.forEach((f, i) => console.log(`  file ${i + 1}: ${f.path}, round 15, seed ${f.seed}`))
