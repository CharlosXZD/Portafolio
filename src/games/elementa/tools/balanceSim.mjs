// Balance simulation (Carlos asked for it, 2026-10-04). A bot that plays a
// modest game (keeps good dice, rerolls the rest, buys relics and dice,
// upgrades the smallest die, forges classic fusions) and prints, per round, the
// pass rate and the median and 90th percentile of (best score / target).
// It does NOT use consumables, Constellations, Totems or the new elements, so
// it is a floor, not a skilled player. Run: node tools/balanceSim.mjs ember 60 30
// (difficulty, runs, last round, 'aided', 'immortal'); DECK=gambler picks one loadout. Past round 15 it continues in Endless mode.
// 'aided' (EXPANSION.md M5) also takes the late scalers: it buys the multiplying
// relics first, spends on Constellations and Totems (steering the Road to the
// Observatory and the Forge), and keeps upgrading dice past d20 in the Firmament.
// Extend the bot's shop policy to buy any new scaler before trusting its
// numbers past round 20. Mute nothing: it never touches the browser.
import { gameReducer, selectors } from '../engine/gameReducer.js'
import { evaluatePool } from '../engine/scoring.js'
import { nextChoices } from '../engine/map.js'
import { ELEMENTS, NEW_DICE_IDS, POKER_DIE_IDS } from '../data/elements.js'
import { SIGIL_DIE_IDS } from '../data/sigils.js'
import { DECKS } from '../data/decks.js'
import { DIFFICULTIES } from '../data/difficulty.js'
const DIFFICULTIES_BY_ID = (id) => DIFFICULTIES.find((d) => d.id === id)

const diffId = process.argv[2] || 'ember', runs = +(process.argv[3] || 60), maxRound = +(process.argv[4] || 30)
const aided = process.argv.includes('aided')
// 'sigils' gives the file every sigil die unlocked, and the bot buys them when a keeper offers one (EXPANSION.md P3).
const sigils = process.argv.includes('sigils')
// 'immortal' lets the bot pass a round it missed (the target drops to its score
// after the ratio is recorded), so it reaches the late rounds and shows how its
// build scales there. The pass rate then means "would have lived".
const immortal = process.argv.includes('immortal')
const phasesSeen = new Set()
const LATE_RELICS = ['crown_of_ages', 'echo_chamber', 'starmap', 'heart_of_the_forge']
const STAR_ITEMS = (o) => o.kind === 'consumable' && /^(const_|totem_)/.test(o.id)
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
    // Aided: Constellations and Totems apply on the spot (no slot needed)
    if (aided) {
      const star = (s.shop?.itemOffers || []).find(STAR_ITEMS)
      if (star) { const n = gameReducer(s, { type: 'BUY_AND_APPLY_CONSUMABLE', consumableId: star.id }); if (n !== s) { s = n; did = true; continue } }
    }
    // A keeper's sigil die (P3)
    if (sigils && s.shop?.sigilOffer) { const n = gameReducer(s, { type: 'BUY_SIGIL', elementId: s.shop.sigilOffer }); if (n !== s) { s = n; did = true; continue } }
    // relics, best (priciest) first; the aided bot wants the multipliers first
    const rank = (o) => (aided && LATE_RELICS.includes(o.id) ? 1e6 - LATE_RELICS.indexOf(o.id) : o.cost ?? 0)
    const relics = (s.shop?.itemOffers || []).filter((o) => o.kind === 'relic').sort((a, b) => rank(b) - rank(a))
    for (const o of relics) { const n = gameReducer(s, { type: 'BUY_RELIC', relicId: o.id }); if (n !== s) { s = n; did = true; break } }
    if (did) continue
    // upgrade the smallest die
    const ups = [...s.dice].sort((a, b) => a.sides - b.sides)
    for (const d of ups) { const n = gameReducer(s, { type: 'UPGRADE_DIE', dieId: d.id }); if (n !== s) { s = n; did = true; break } }
    if (did) continue
    // buy a die if room
    if (selectors.poolSize(s.dice) < selectors.maxDiceFor(s)) {
      // Aided: poker dice (v0.8.5) and the dice of v0.8.3 first
      const buyable = [...(s.shop?.buyableElements || [])].sort((a, b) => (aided ? +(NEW_DICE_IDS.includes(b) || POKER_DIE_IDS.includes(b)) - +(NEW_DICE_IDS.includes(a) || POKER_DIE_IDS.includes(a)) : 0))
      for (const id of buyable) { const n = gameReducer(s, { type: 'BUY_DIE', elementId: id }); if (n !== s) { s = n; did = true; break } }
    }
    if (!did) break
  }
  return s
}

function advance(s) {
  const ch = nextChoices(s.map)
  const want = ['observatory', 'forge', 'market']
  const pick = aided ? [...ch].sort((a, b) => (want.indexOf(a.type) + 1 || 9) - (want.indexOf(b.type) + 1 || 9))[0] : ch[0]
  s = gameReducer(s, { type: 'CHOOSE_PATH', nodeId: pick.id })
  return gameReducer(s, { type: 'NEXT_ROUND' })
}

// --- 'build' mode (EXPANSION.md M5) ------------------------------------------
// The play-through bot is too weak to reach round 20 with a real build, so this
// mode checks the late targets directly: for each round it sets up a REFERENCE
// build (what a player at that stage could plausibly own), lets the same bot hold
// and reroll, and reports the median score / target. Three builds:
//   unaided   the bot's own kind of game: dice only up to d20, basic relics, no Constellations
//   mediocre  the same plus two dice grown past d20 in the Firmament
//   good      three dice grown, the multiplying relics as they unlock, Constellations
//   crutched  the mediocre build, but four of its dice are v0.8.3 dice (Charged, arriving at the pool's size)
// These are assumptions about spending, not measurements: change them here.
if (process.argv.includes('build')) {
  const { thresholdForRound } = await import('../engine/scoring.js')
  const { relicById } = await import('../data/relics.js')
  const { tierById, DICE_TIERS } = await import('../data/diceTiers.js')
  const { rollDie } = await import('../engine/scoring.js')
  const POOL = ['air', 'lightning', 'crystal', 'storm', 'magma', 'steel', 'earth', 'fire', 'ice', 'monsoon']
  const tierFor = (R, kind, i) => {
    let t = R < 4 ? 'd6' : R < 8 ? 'd10' : 'd20'
    if (R < 6 && i >= 6) t = 'd6'
    const grown = kind === 'good' ? 3 : kind === 'mediocre' ? 1 : 0
    if (R > 15 && i < grown) {
      const target = kind === 'good' ? Math.min(100, 30 + Math.floor((R - 16) / 3) * 10) : Math.min(60, 30 + Math.max(0, Math.floor((R - 20) / 4)) * 10)
      t = 'd' + target
    }
    return t
  }
  const relicsFor = (R, kind) => {
    const ids = ['molten_core', 'ember_heart', 'stormcaller', 'static_charge', 'loaded_die'].slice(0, Math.min(5, 1 + Math.floor(R / 3)))
    if (kind !== 'unaided' && R >= 15) ids.splice(ids.length - 1, 1, 'feather_charm')
    if (kind !== 'unaided' && R >= 16) ids.splice(0, 1, 'crown_of_ages')
    if (kind === 'good') {
      if (R >= 16) ids.splice(0, 1, 'crown_of_ages')
      if (R >= 19) ids.splice(1, 1, 'heart_of_the_forge')
      if (R >= 22) ids.splice(2, 1, 'starmap')
      if (R >= 25) ids.splice(3, 1, 'echo_chamber')
    }
    return ids.map(relicById).filter(Boolean)
  }
  const constFor = (R, kind) => {
    // Seren's Observatory every few rounds: about 1.2 levels a round from round 10
    // (good, spread over three targets), 0.5 from round 12 into one (mediocre).
    const total = kind === 'good' ? Math.floor((R - 10) * 1.2) : Math.floor((R - 12) * 0.5)
    if (total <= 0) return {}
    const targets = kind === 'good' ? ['pair', 'straight', 'kindle'] : ['pair']
    return Object.fromEntries(targets.map((t) => [t, Math.min(10, Math.floor(total / targets.length))]))
  }
  console.log('Reference builds on', diffId, '(median score / target over', runs, 'samples per round)')
  console.log('round  target   unaided mediocre   good crutched')
  for (let R = 1; R <= maxRound; R++) {
    const out = []
    for (const kind of ['unaided', 'mediocre', 'good', 'crutched']) {
      const ratios = []
      for (let k = 0; k < runs; k++) {
        let s = gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: DECKS[k % DECKS.length].id, difficultyId: diffId, seed: 'B' + R + kind + k })
        const th = thresholdForRound(R, s.difficulty)
        const n = Math.min(10, 3 + Math.floor(R / 2))
        const NEWER = ['comet', 'pulsar', 'shooting_star', 'glimmer', 'timelike_curve']
        const dice = Array.from({ length: n }, (_, i) => { const tier = tierById(tierFor(R, kind === 'crutched' ? 'mediocre' : kind, i)); return { ...s.dice[0], id: 'b' + i, elementId: kind === 'crutched' && R > 15 && i >= n - 4 ? NEWER[i % NEWER.length] : POOL[i % POOL.length], tierId: tier.id, sides: tier.sides, held: false, locked: false } })
        s = { ...s, round: R, threshold: th, realm: R > 15 ? 'firmament' : 'elementa', dice, relics: relicsFor(R, kind === 'crutched' ? 'mediocre' : kind), constellations: constFor(R, kind === 'crutched' ? 'mediocre' : kind), rerollsUsed: 0 }
        s = gameReducer(s, { type: 'REROLL_UNHELD' })
        s = playRound(s)
        ratios.push(score(s) / th)
      }
      ratios.sort((a, b) => a - b)
      out.push(ratios[Math.floor(ratios.length / 2)])
    }
    console.log(String(R).padStart(3), String(thresholdForRound(R, DIFFICULTIES_BY_ID(diffId))).padStart(9), ...out.map((x) => x.toFixed(2).padStart(8)))
  }
  process.exit(0)
}

// --- 'rewriters' mode (EXPANSION.md R2) -------------------------------------
// Calibrates REWRITER_TARGET in data/realm3.js. For each Rewriter it builds the
// reference builds of 'build' mode at the Rewriter's round (35, 40, 45), switches
// the Rewriter's rule on, and plays with the counter-play the boss card hints at:
//   axiom     every die grown big (flat Base); the multiplying relics are dead weight
//   zero      no die below d10 (faces under 3 fizzle), so every die can score
//   infinity  at most one reroll (the target rises 10% a reroll, 5% an explosion)
//   observer  Luminance or the Eye keep the faces visible: plays like a normal round
//   floating  the same build, whole-number sources only (the rule rounds every step)
//   deadlock  holds at most one die: the rest are rerolled each time
// The multiplier on the round's normal target is 1.1 times the median of the
// 'good' counter-play bot, capped at the 75th percentile of the 'great' one
// (never above what a strong build reaches). Run: node tools/balanceSim.mjs ember 60 45 rewriters
if (process.argv.includes('rewriters')) {
  const { thresholdForRound } = await import('../engine/scoring.js')
  const { relicById } = await import('../data/relics.js')
  const { tierById } = await import('../data/diceTiers.js')
  const { REWRITERS, REWRITER_ROUNDS, REWRITER_SETS } = await import('../data/realm3.js')
  const POOL = ['air', 'lightning', 'crystal', 'storm', 'magma', 'steel', 'earth', 'fire', 'ice', 'monsoon']
  // 'great' also owns four of realm 3's own dice (Parity doubles evens, Limit and Infinity feed Mult, Divergence rerolls lows).
  const REALM3_POOL = ['parity', 'limit', 'abs_infinity', 'divergence']
  // 'good' is the build of 'build' mode carried into realm 3 (a die more grown every 3 rounds,
  // up to d100); 'great' has every die at the top size and the whole relic set.
  const sizeFor = (R, kind, i, rw) => {
    const grown = kind === 'great' || rw === 'axiom' || rw === 'zero' ? 10 : Math.min(10, 3 + Math.floor((R - 16) / 3))
    if (i >= grown) return 'd20'
    return 'd' + Math.min(100, 30 + Math.floor((R - 16) / 3) * 10 + (kind === 'great' ? 10 : 0))
  }
  const relicsFor = (R, kind, rw) => {
    if (rw === 'axiom') return []
    const ids = ['molten_core', 'ember_heart', 'stormcaller', 'static_charge', 'loaded_die', 'feather_charm', 'crown_of_ages', 'heart_of_the_forge', 'starmap', 'echo_chamber']
    return ids.map(relicById).filter(Boolean)
  }
  const constFor = (R, kind) => {
    const total = Math.floor((R - 10) * 1.2)
    return Object.fromEntries(['pair', 'straight', 'kindle'].map((t) => [t, Math.min(10, Math.floor(total / 3))]))
  }
  const play = (st, maxRerolls) => {
    let n = 0
    for (let guard = 0; guard < 40; guard++) {
      if (n >= maxRerolls || selectors.availableRerolls(st) <= 0) break
      const dice = st.dice
      const counts = {}; dice.forEach((d) => (counts[d.value] = (counts[d.value] || 0) + 1))
      const holds = dice.map((d) => d.locked || d.value >= Math.ceil(d.sides * 0.7) || counts[d.value] >= 2)
      if (holds.every(Boolean)) break
      dice.forEach((d, i) => { if (!d.locked && d.held !== holds[i]) st = gameReducer(st, { type: 'TOGGLE_HELD', dieId: d.id }) })
      const next = gameReducer(st, { type: 'REROLL_UNHELD' })
      if (next === st) break
      st = next; n++
    }
    return st
  }
  console.log('Rewriter calibration on', diffId, '(' + runs, 'samples each)')
  console.log('rewriter   round  normal target  counter median  strong p75   multiplier  target')
  const result = {}
  for (const rw of REWRITERS) {
    const R = REWRITER_ROUNDS[REWRITER_SETS.split.findIndex((set) => set.includes(rw.id)) === 0 ? REWRITER_SETS.split[0].indexOf(rw.id) : REWRITER_SETS.split[1].indexOf(rw.id)]
    const out = {}
    for (const kind of ['good', 'great']) {
      const ratios = []
      for (let k = 0; k < runs; k++) {
        let st = gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: DECKS[k % DECKS.length].id, difficultyId: diffId, seed: 'W' + rw.id + kind + k })
        const th = thresholdForRound(R, st.difficulty)
        const dice = Array.from({ length: 10 }, (_, i) => { const tier = tierById(sizeFor(R, kind, i, rw.id)); return { ...st.dice[0], id: 'b' + i, elementId: kind === 'great' && i >= 6 ? REALM3_POOL[i - 6] : POOL[i % POOL.length], tierId: tier.id, sides: tier.sides, held: false, locked: false } })
        st = { ...st, round: R, threshold: th, realm: 'firmament', realm3: true, realm3Set: 1, path: 'split', bossModifier: rw, dice, relics: relicsFor(R, kind, rw.id), constellations: constFor(R, kind), rerollsUsed: 0 }
        st = gameReducer(st, { type: 'REROLL_UNHELD' })
        st = play(st, rw.id === 'infinity' ? 0 : 99)
        ratios.push(score(st) / selectors.effectiveThreshold(st))
      }
      ratios.sort((a, b) => a - b)
      out[kind] = { median: ratios[Math.floor(ratios.length / 2)], p75: ratios[Math.floor(ratios.length * 0.75)] }
    }
    const mult = Math.min(1.1 * out.good.median, out.great.p75)
    const target = Math.round(thresholdForRound(R, DIFFICULTIES_BY_ID(diffId)) * mult)
    result[rw.id] = Math.round(mult * 1000) / 1000
    console.log(rw.id.padEnd(9), String(R).padStart(6), String(thresholdForRound(R, DIFFICULTIES_BY_ID(diffId))).padStart(14), out.good.median.toFixed(3).padStart(15), out.great.p75.toFixed(3).padStart(11), mult.toFixed(3).padStart(12), String(target).padStart(10))
  }
  console.log('REWRITER_TARGET =', JSON.stringify(result))
  process.exit(0)
}

const rows = {} // round -> {n, passed, ratios[]}
let deaths = {}, reached = []
for (let run = 0; run < runs; run++) {
  const deck = process.env.DECK || DECKS[run % DECKS.length].id
  let s = gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: deck, difficultyId: diffId, seed: 'S' + run, ...(sigils ? { file: { sigils: SIGIL_DIE_IDS } } : {}) })
  let last = 0
  for (let step = 0; step < 400; step++) {
    phasesSeen.add(s.phase)
    if (s.phase === 'rolling') {
      s = playRound(s)
      const r = s.round, th = s.threshold, sc = score(s)
      const row = (rows[r] ||= { n: 0, passed: 0, ratios: [] }); row.n++; row.ratios.push(sc / th); if (sc >= th) row.passed++
      last = r
      if (process.env.SIMDEBUG && run === 0 && [10, 15, 20, 25, 30].includes(r)) console.log('R' + r, 'shards', s.shards, 'dice', s.dice.map((d) => d.elementId + ':' + d.sides).join(' '), 'relics', s.relics.map((x) => x.id).join(','), 'const', JSON.stringify(s.constellations), 'totems', JSON.stringify(s.totems), 'score', sc, 'target', th)
      if (immortal && sc < th) s = { ...s, threshold: Math.max(1, Math.floor(sc)) }
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
