// Balance simulation (Carlos asked for it, 2026-10-04). A bot that plays a
// modest game (keeps good dice, rerolls the rest, buys relics and dice,
// upgrades the smallest die, forges classic fusions) and prints, per round, the
// pass rate and the median and 90th percentile of (best score / target).
// It does NOT use consumables, Constellations, Totems or the new elements, so
// it is a floor, not a skilled player. Run: node tools/balanceSim.mjs ember 60 30
// (difficulty, runs, last round). Past round 15 it continues in Endless mode.
// Extend the bot's shop policy to buy any new scaler before trusting its
// numbers past round 20. Mute nothing: it never touches the browser.
import { gameReducer, selectors } from '../engine/gameReducer.js'
import { evaluatePool } from '../engine/scoring.js'
import { nextChoices } from '../engine/map.js'
import { ELEMENTS } from '../data/elements.js'
import { DECKS } from '../data/decks.js'

const diffId = process.argv[2] || 'ember', runs = +(process.argv[3] || 60), maxRound = +(process.argv[4] || 30)
const phasesSeen = new Set()
const score = (s) => evaluatePool(s.dice, selectors.effectiveRelics(s), selectors.scoreContext(s)).roundScore

function playRound(s) {
  // hold the good dice, reroll the rest, cast
  for (let guard = 0; guard < 40; guard++) {
    const cur = score(s)
    if (cur >= s.threshold || selectors.availableRerolls(s) <= 0) break
    const dice = s.dice
    const counts = {}; dice.forEach((d) => (counts[d.value] = (counts[d.value] || 0) + 1))
    const holds = dice.map((d) => d.locked || d.value >= Math.ceil(d.sides * 0.7) || counts[d.value] >= 2)
    if (holds.every(Boolean)) break
    // set holds
    dice.forEach((d, i) => { if (!d.locked && d.held !== holds[i]) s = gameReducer(s, { type: 'TOGGLE_HELD', dieId: d.id }) })
    const next = gameReducer(s, { type: 'REROLL_UNHELD' })
    if (next === s) break
    // keep the better outcome (the bot may undo nothing; just continue)
    s = next
  }
  return s
}

function shop(s) {
  const type = s.shop?.type
  // spend: upgrades, relics, dice, fusions
  for (let i = 0; i < 12; i++) {
    let did = false
    const forgeable = s.shop?.forgeOpen ? selectors.forgeableRecipes(s).filter((r) => r.canForge && s.shards >= r.cost) : []
    if (forgeable.length) { const n = gameReducer(s, { type: 'FUSE_DICE', fusionElementId: forgeable[0].fusionElementId }); if (n !== s) { s = n; did = true; continue } }
    // relics, best (priciest) first
    const relics = (s.shop?.itemOffers || []).filter((o) => o.kind === 'relic').sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))
    for (const o of relics) { const n = gameReducer(s, { type: 'BUY_RELIC', relicId: o.id }); if (n !== s) { s = n; did = true; break } }
    if (did) continue
    // upgrade the smallest die
    const ups = [...s.dice].sort((a, b) => a.sides - b.sides)
    for (const d of ups) { const n = gameReducer(s, { type: 'UPGRADE_DIE', dieId: d.id }); if (n !== s) { s = n; did = true; break } }
    if (did) continue
    // buy a die if room
    if (selectors.poolSize(s.dice) < selectors.maxDiceFor(s)) {
      for (const id of s.shop?.buyableElements || []) { const n = gameReducer(s, { type: 'BUY_DIE', elementId: id }); if (n !== s) { s = n; did = true; break } }
    }
    if (!did) break
  }
  return s
}

function advance(s) {
  const ch = nextChoices(s.map)
  s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: ch[0].id })
  return gameReducer(s, { type: 'NEXT_ROUND' })
}

const rows = {} // round -> {n, passed, ratios[]}
let deaths = {}, reached = []
for (let run = 0; run < runs; run++) {
  const deck = DECKS[run % DECKS.length].id
  let s = gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: deck, difficultyId: diffId, seed: 'S' + run })
  let last = 0
  for (let step = 0; step < 400; step++) {
    phasesSeen.add(s.phase)
    if (s.phase === 'rolling') {
      s = playRound(s)
      const r = s.round, th = s.threshold, sc = score(s)
      const row = (rows[r] ||= { n: 0, passed: 0, ratios: [] }); row.n++; row.ratios.push(sc / th); if (sc >= th) row.passed++
      last = r
      s = gameReducer(s, { type: 'SUBMIT_ROUND' })
    } else if (s.phase === 'bossReward') {
      const canGrow = s.dice.find((d) => selectors.growTier(s, d))
      s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: (canGrow ?? s.dice[0]).id, slot: 'dice' })
      if (s.phase === 'bossReward') s = gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'relics' })
    } else if (s.phase === 'shop') {
      s = shop(s)
      if (s.round >= maxRound) break
      s = s.shop?.type === 'camp' ? gameReducer(s, { type: 'NEXT_ROUND' }) : advance(s)
    } else if (s.phase === 'victory') {
      s = gameReducer(s, { type: 'CONTINUE_ENDLESS' })
    } else if (s.phase === 'crossroads') {
      s = gameReducer(s, { type: 'ENTER_FIRMAMENT', set: selectors.firmamentSets(s)[0] })
    } else if (s.phase === 'missed') {
      s = gameReducer(s, { type: 'GO_TO_CAMP' }); if (s.phase === 'missed') s = gameReducer(s, { type: 'RETRY_ROUND' })
    } else if (s.phase === 'gameover') { deaths[last] = (deaths[last] || 0) + 1; break }
    else { console.log('unhandled phase', s.phase, 'round', s.round); break }
    if (last >= maxRound) break
  }
  reached.push(last)
}
console.log('phases', [...phasesSeen].join(','))
console.log('difficulty', diffId, 'runs', runs, 'median round reached', reached.sort((a, b) => a - b)[Math.floor(runs / 2)], 'deaths by round', JSON.stringify(deaths))
console.log('round  n  pass%  median(score/target)  p90')
Object.keys(rows).map(Number).sort((a, b) => a - b).forEach((r) => {
  const x = rows[r]; const q = (p) => x.ratios.sort((a, b) => a - b)[Math.floor(x.ratios.length * p)]
  console.log(String(r).padStart(3), String(x.n).padStart(3), String(Math.round(100 * x.passed / x.n)).padStart(5), q(0.5).toFixed(2).padStart(10), q(0.9).toFixed(2).padStart(8))
})
