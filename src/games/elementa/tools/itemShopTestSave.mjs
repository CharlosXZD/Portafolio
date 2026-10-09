// A test save for the V2 item models (VISUALS.md V2): one file standing in a
// shop at round 3 with plenty of Shards and a few relics and consumables owned,
// so the shelf, the inventory strip, the inspector and the buy reveal can be
// looked at without playing. Muted, like every test save.
//
//   node src/games/elementa/tools/itemShopTestSave.mjs
// writes src/games/elementa/tools/item-shop-test-saves.json (a backup file).
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gameReducer, initialState } from '../engine/gameReducer.js'
import { emptyProfile } from '../utils/saveManager.js'
import { relicById } from '../data/relics.js'
import { consumableById } from '../data/consumables.js'

let s = gameReducer(initialState(), { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'ITEMSHOP', recipes: [], file: { endings: [], wardens: [], mythics: [], mote: { fed: 0 } } })
s = { ...s, activeSlot: 0, difficulty: { ...s.difficulty, thresholdBase: 1, thresholdGrowth: 1 }, threshold: 1 }
for (let i = 0; i < 50 && !(s.round === 3 && s.phase === 'shop'); i++) {
  if (s.phase === 'rolling') s = gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
  else if (s.phase === 'shop') s = gameReducer(s, { type: 'NEXT_ROUND' })
  else if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
  else throw new Error(`unexpected phase ${s.phase}`)
}
const owned = ['riverstone', 'lucky_coin'].map((id) => relicById(id))
const items = ['extra_reroll'].map((id, k) => ({ ...consumableById(id), instanceId: `test-${id}-${k}` }))
s = { ...s, shards: 400, relics: owned, consumables: items, threshold: 1 }

const files = { 0: { createdAt: Date.now(), updatedAt: Date.now(), profile: { ...emptyProfile(), stats: { runs: 1, wins: 0, bestCast: 0, bestRound: 3 } }, run: s } }
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
const out = fileURLToPath(new URL('./item-shop-test-saves.json', import.meta.url))
writeFileSync(out, JSON.stringify(backup))
console.log('phase', s.phase, 'round', s.round, 'shop', s.shop?.type, 'wrote', out)
