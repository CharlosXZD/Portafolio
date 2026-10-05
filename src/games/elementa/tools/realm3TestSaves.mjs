// Test saves for realm 3 (EXPANSION.md R5). Writes a backup file (the format
// Options > Backup loads) with three save files:
//   File 1: Split path, standing at the round-30 Crossroads with the door open
//           (the file has seen firmament_split_1).
//   File 2: Primordial path, the same.
//   File 3: Neutral path, already in realm 3 (the Meridian) at round 31 holding
//           the new dice: the four Abstract elements, the four fusions, the four
//           Absolute dice and the four number dice, with Stardust and Shards.
// Targets are tiny (patched to 1 every round), the tutorial is off, and the game
// is muted (music and sound off), as the agent rules ask.
//
// Run from the repo root:
//   node src/games/elementa/tools/realm3TestSaves.mjs
// It writes src/games/elementa/tools/realm3-test-saves.json.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer, initialState, selectors } from '../engine/gameReducer.js'
import { nextChoices } from '../engine/map.js'
import { emptyProfile } from '../utils/saveManager.js'
import { MYTHIC_DIE_IDS, COSMIC_FUSION_IDS } from '../data/elements.js'
import { ABSTRACT_IDS, ABSOLUTE_IDS, NUMBER_DICE_IDS } from '../data/abstract.js'
import { tierById } from '../data/diceTiers.js'
import { rewriterFor } from '../data/realm3.js'
import { SCENE_IDS } from '../data/story.js'

const GODS = ['gaea', 'ognen', 'varuna', 'zephyr']
const ALL_RECIPES = ['aether', ...GODS, ...MYTHIC_DIE_IDS, ...COSMIC_FUSION_IDS, 'entropy', ...ABSOLUTE_IDS]
const FILES = [
  { path: 'split', seed: 'R3SPLIT', deckId: 'balanced', endings: ['neutral', 'split', 'firmament_split_1'], enter: false },
  { path: 'primordial', seed: 'R3PRIM', deckId: 'tempest', endings: ['neutral', 'primordial', 'firmament_primordial_1'], enter: false },
  { path: 'neutral', seed: 'R3NEUT', deckId: 'tidecaller', endings: ['neutral', 'firmament_neutral_1'], enter: true },
]

function walk({ path, seed, deckId, endings }, stopAt) {
  const file = { endings, wardens: [], mythics: [], mote: { fed: 0 } }
  let s = gameReducer(initialState(), { type: 'START_RUN', deckId, difficultyId: 'ember', seed, recipes: ALL_RECIPES, file })
  s = { ...s, activeSlot: null }
  for (let i = 0; i < 600 && !stopAt(s); i++) {
    if (s.phase === 'rolling') s = gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    else if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
    else if (s.phase === 'shop') {
      if (s.round === 14) s = { ...s, accord: path === 'primordial' ? 20 : path === 'split' ? -20 : 0 }
      const choices = nextChoices(s.map)
      if (choices.length > 1) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: choices[0].id })
      s = gameReducer(s, { type: 'NEXT_ROUND' })
    } else if (s.phase === 'crossroads' && s.round === 15) s = gameReducer(s, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(s)[0] })
    else if (s.phase === 'victory') s = gameReducer(s, { type: 'CONTINUE_ENDLESS' })
    else if (s.phase === 'missed') s = gameReducer(s, { type: 'RETRY_ROUND' })
    else throw new Error(`unexpected phase ${s.phase} at round ${s.round}`)
  }
  if (s.path !== path) throw new Error(`${seed} landed on ${s.path}, wanted ${path}`)
  return s
}

const mkDie = (s, elementId, k, tierId = 'd6') => ({
  ...s.dice[0],
  id: `test-${elementId}-${k}`,
  elementId,
  tierId,
  sides: tierById(tierId).sides,
  held: false,
  locked: false,
  lockedVia: null,
  value: 4,
  total: 4,
  explosions: 0,
  rollId: 200 + k,
  runes: [],
})

const files = {}
FILES.forEach((spec, slot) => {
  let s = walk(spec, (st) => st.phase === 'crossroads' && st.round === 30)
  if (spec.enter) {
    s = gameReducer(s, { type: 'ENTER_REALM3', set: 1 })
    // The boss reward and the first Market come first, then round 31.
    s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
    const choices = nextChoices(s.map)
    if (choices.length > 1) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: choices[0].id })
    s = gameReducer(s, { type: 'NEXT_ROUND' })
    if (s.round !== 31 || s.phase !== 'rolling') throw new Error(`expected round 31 rolling, got ${s.round} ${s.phase}`)
    s = { ...s, threshold: 1 }
    const ids = [...ABSTRACT_IDS, ...ABSOLUTE_IDS, ...NUMBER_DICE_IDS]
    const extra = ids.map((id, k) => mkDie(s, id, k))
    s = { ...s, dice: [...s.dice, ...extra], diceCapBonus: (s.diceCapBonus || 0) + extra.length, shards: 400, stardust: 6 }
  }
  s = { ...s, difficulty: { ...s.difficulty, thresholdBase: 1, thresholdGrowth: 1 }, shards: Math.max(s.shards, 400), stardust: Math.max(s.stardust || 0, 6), activeSlot: slot }
  const profile = {
    ...emptyProfile(),
    recipes: ALL_RECIPES,
    endings: spec.endings,
    deckEndings: { [spec.deckId]: spec.endings },
    decksBeaten: ['balanced', 'tidecaller', 'tempest'],
    difficultiesBeaten: ['ember'],
    wins: { balanced: ['ember'] },
    wardens: ['expanse', 'maelstrom', 'hollow'],
    mythics: [],
    mote: { fed: 0 },
    stats: { runs: 3, wins: 3, bestCast: 0, bestRound: 30 },
    achievements: ['through_door'],
    // Every older scene is already seen, so the clicks go straight to realm 3's own (R2).
    scenes: SCENE_IDS.filter((id) => id !== 'realm3' && !id.startsWith('rewriter_')),
  }
  files[slot] = { createdAt: Date.now(), updatedAt: Date.now(), profile, run: s }
})

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
const out = fileURLToPath(new URL('./realm3-test-saves.json', import.meta.url))
writeFileSync(out, JSON.stringify(backup))
console.log(`wrote ${out}`)
FILES.forEach((f, i) => console.log(`  file ${i + 1}: ${f.path}, ${f.enter ? 'realm 3 round 31' : 'round-30 Crossroads'}, seed ${f.seed}`))
console.log('  first Rewriters:', rewriterFor('neutral', 1, 35)?.id)
