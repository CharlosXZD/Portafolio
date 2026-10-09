// Test saves for the Convergence (EXPANSION.md T9). Writes a backup file (the
// format Options > Backup loads) with three save files, built from the realm 3
// test saves (tools/realm3-test-saves.json, run tools/realm3TestSaves.mjs first):
//   File 1: round 45, Floating Point (the last Rewriter of Set I) on the table,
//           target 1: clear it and the Unwritten's door opens.
//   File 2: inside the Unwritten, in the Market just before Pip (every fight
//           of the Rush behind it), Ember. Walk on to Pip and then the duel.
//   File 3: a file that has beaten every loadout and the Unwritten, on
//           Cataclysm at the round-45 table (the duel's curated ghost), with the
//           Theoretical Best's ten dice, five relics and Law in the run.
// Targets are tiny where it saves clicks, the tutorial is off and the game is
// muted (music and sound off), as the agent rules ask.
//
// Run from the repo root:
//   node src/games/elementa/tools/convergenceTestSaves.mjs
// It writes src/games/elementa/tools/convergence-test-saves.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer } from '../engine/gameReducer.js'
import { rewriterById } from '../data/realm3.js'
import { DECKS } from '../data/decks.js'
import { SCENE_IDS } from '../data/story.js'
import { THEORETICAL_BEST } from '../data/convergence.js'
import { difficultyById } from '../data/difficulty.js'
import { relicById } from '../data/relics.js'
import { makeDieForTest } from './testDie.mjs'

const source = JSON.parse(readFileSync(fileURLToPath(new URL('./realm3-test-saves.json', import.meta.url)), 'utf8'))
const base = JSON.parse(source.data['elementa-files-v2'])[2]
const seen = SCENE_IDS.filter((id) => !['unwritten', 'pip_before', 'pip_after', 'you_before', 'true_ending'].includes(id))

const atRound45 = (run, extra = {}) => ({ ...run, round: 45, phase: 'rolling', bossModifier: rewriterById('floating'), threshold: 1, realm3Set: 1, bestCast: 40000000, ...extra })
const profileFor = (extra = {}) => ({
  ...base.profile,
  endings: [...new Set([...(base.profile.endings || []), 'realm3_neutral_1'])],
  scenes: seen,
  ...extra,
})

const files = {}

// File 1: round 45, about to open the door.
files[0] = { createdAt: Date.now(), updatedAt: Date.now(), profile: profileFor(), run: { ...atRound45(base.run), activeSlot: 0 } }

// File 2: in the Unwritten, the Market before Pip.
{
  let s = atRound45(base.run, { activeSlot: 1 })
  s = gameReducer(s, { type: 'SUBMIT_ROUND' })
  s = gameReducer(s, { type: 'ENTER_UNWRITTEN' })
  s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
  for (let i = 0; i < 200 && s.convergence.fights[s.convergence.index] !== 'pip'; i++) {
    if (s.phase === 'shop') s = gameReducer(s, { type: 'NEXT_ROUND' })
    else if (s.phase === 'rolling') s = gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    else throw new Error(`unexpected phase ${s.phase}`)
  }
  if (s.phase !== 'shop') throw new Error(`expected the Market before Pip, got ${s.phase}`)
  files[1] = { createdAt: Date.now(), updatedAt: Date.now(), profile: profileFor({ endings: [...profileFor().endings, 'unwritten'], scenes: [...seen, 'unwritten'] }), run: s }
}

// File 3: every loadout beaten, Cataclysm, the Theoretical Best in the pool.
{
  const dice = THEORETICAL_BEST.dice.map((elementId, k) => makeDieForTest(elementId, elementId === 'sigil_aeris_g' ? 'sigil' : 'd30', k))
  const s = atRound45(base.run, {
    activeSlot: 2,
    difficulty: difficultyById('cataclysm'),
    lives: 3,
    maxLives: 3,
    dice,
    diceCapBonus: 6,
    relics: THEORETICAL_BEST.relics.map(relicById),
    relicCapBonus: 6,
    law: relicById(THEORETICAL_BEST.law),
    bestCast: 300000000,
    shards: 500,
    stardust: 4,
  })
  files[2] = {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    profile: profileFor({
      decksBeaten: DECKS.map((d) => d.id),
      difficultiesBeaten: ['ember', 'blaze', 'inferno'],
      endings: [...profileFor().endings, 'unwritten'],
      scenes: [...seen, 'unwritten'],
    }),
    run: s,
  }
}

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
const out = fileURLToPath(new URL('./convergence-test-saves.json', import.meta.url))
writeFileSync(out, JSON.stringify(backup))
console.log(`wrote ${out}`)
console.log('  file 1: round 45, Floating Point, door about to open')
console.log('  file 2: the Unwritten, Market before Pip (Ember)')
console.log('  file 3: every loadout beaten, Cataclysm, the Theoretical Best in the pool, round 45')
