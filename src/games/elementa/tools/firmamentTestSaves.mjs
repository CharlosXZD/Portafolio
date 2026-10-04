// Test saves for the Firmament (EXPANSION.md H8, H9). Writes a backup file
// (the format Options > Backup loads) with three save files, each standing
// at round 15 on one path with that path's door open, so the whole
// Firmament can be clicked through without playing a run:
//   File 1: Neutral path. Its file has already beaten the Expanse, the
//           Maelstrom and the Hollow, and beating Set I teaches the rest.
//           The run also holds base-element dice (four Glimmer, a Flux, a
//           Moment, a Null) to try every kind of forge past the door.
//           Since v0.8.1 (EXPANSION.md L6) it also holds Water, Air, Earth and
//           Fire dice, the five family relics, all four Totems at level 1 or
//           2 plus one of each in the bag, the four multiplying relics (v0.8.2)
//           and Constellations at levels 4, 5 and 10, and has seen two Firmament
//           reactions, so Tide, Drift, Totems and the Gallery's new section
//           can be tried at once.
//           Since v0.8.3 (N7) it also holds the new dice: Closed Timelike
//           Curve, Shooting and Neutron Star, Event Horizon, Quantum
//           Entanglement, Non-Euclidean, Comet, Pulsar, Shadow, Continuum.
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
import { relicById } from '../data/relics.js'
import { consumableById } from '../data/consumables.js'

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
    extraDice: ['glimmer', 'glimmer', 'glimmer', 'glimmer', 'flux', 'moment', 'nil', 'water', 'ice', 'air', 'lightning', 'timelike_curve', 'shooting_star', 'neutron_star', 'event_horizon', 'entanglement', 'non_euclid', 'comet', 'pulsar', 'shadow', 'continuum'],
    familyKit: true,
    lawId: 'law_symmetry',
    pokerDice: ['poker', 'poker', 'poker', 'joker'],
  },
  // File 2 stays in Elementa (the door is not crossed) and holds the v0.8.5 kit (O4): poker dice, a Law, the four new runes.
  { path: 'split', seed: 'SPLITPTH', deckId: 'tidecaller', endings: ['neutral', 'split'], wardens: [], mythics: [], moteFed: 0, lawId: 'law_greed', pokerDice: ['poker', 'poker', 'poker', 'poker', 'joker'], extraDice: ['air', 'fire'], newRunes: true },
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
function runTo15({ path, seed, deckId, endings, wardens, mythics, moteFed, extraDice, familyKit, lawId, pokerDice, newRunes }) {
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
    // The curve (M1) no longer follows thresholdBase alone, so pin the target.
    if (s.phase === 'rolling') s = gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
    else if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
    else if (s.phase === 'shop') {
      if (s.round === 14) s = { ...s, accord: path === 'primordial' ? 20 : path === 'split' ? -20 : 0 }
      const choices = nextChoices(s.map)
      if (choices.length > 1) s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: choices[0].id })
      s = gameReducer(s, { type: 'NEXT_ROUND' })
    } else throw new Error(`unexpected phase ${s.phase}`)
  }
  s = { ...s, threshold: 1 }
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
  // Poker dice (O3) at their own fixed size, a Law (O2) and the four new runes (O1).
  const poker = (pokerDice || []).map((elementId, k) => ({
    ...extra[0],
    id: `test-${elementId}-${k}`,
    elementId,
    tierId: elementId,
    sides: elementId === 'joker' ? 15 : 14,
    value: 9 + k,
    total: 9 + k,
    rollId: 50 + k,
    runes: [],
  }))
  if (newRunes && poker.length >= 4) {
    poker[0].runes = [{ id: 'wild', face: 12 }]
    poker[1].runes = [{ id: 'gold', face: 10 }]
    poker[2].runes = [{ id: 'link', face: 11 }]
    poker[3].runes = [{ id: 'double', face: 14 }]
  }
  const law = lawId ? { law: relicById(lawId) } : {}
  const kit = familyKit
    ? {
        relics: ['deep_current', 'spring_tide', 'gale_seal', 'second_wind', 'standing_stones', 'crown_of_ages', 'heart_of_the_forge', 'starmap', 'echo_chamber'].map((id) => relicById(id)),
        relicCapBonus: 4,
        totems: { fire: 1, water: 2, earth: 1, air: 1 },
        // Pair at the level-5 milestone, Kindle at 10, Straight at 4 (EXPANSION.md M4).
        constellations: { pair: 5, kindle: 10, straight: 4, three: 1 },
        consumables: ['totem_fire', 'totem_water', 'totem_earth'].map((id, k) => ({ ...consumableById(id), instanceId: `test-${id}-${k}` })),
      }
    : {}
  return { ...s, ...kit, ...law, dice: [...runed, ...extra, ...poker], diceCapBonus: (s.diceCapBonus || 0) + extra.length + poker.length, shards: 300, stardust: 4 }
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
    // The Gallery's Firmament reactions show once the file crossed the door.
    achievements: spec.familyKit ? ['through_door'] : [],
    seen: { ...emptyProfile().seen, reactions: spec.familyKit ? ['sunburst', 'rift'] : [] },
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
