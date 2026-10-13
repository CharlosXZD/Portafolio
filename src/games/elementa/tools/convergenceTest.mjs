// Tests for Part T (v0.9.5 "The Convergence"): run with `node src/games/elementa/tools/convergenceTest.mjs`.
// (The privacy tests for the Arbiter's weather are in tools/arbiterTest.mjs.)
import { readFileSync } from 'node:fs'
const base = new URL('../', import.meta.url).pathname
const R = await import(base + 'engine/gameReducer.js')
const C = await import(base + 'data/convergence.js')
const { DECKS, LOTTERY_POOL } = await import(base + 'data/decks.js')
const { ELEMENTS } = await import(base + 'data/elements.js')
const { REWRITER_TARGET, rewriterById } = await import(base + 'data/realm3.js')
const { GOD_TRIALS } = await import(base + 'data/bossModifiers.js')
const { difficultyById } = await import(base + 'data/difficulty.js')
const { relicById } = await import(base + 'data/relics.js')
const { thresholdForRound } = await import(base + 'engine/scoring.js')
const { DECKS_ES } = await import(base + 'data/i18n.js')
const progress = await import(base + 'utils/progress.js')
const { feedbackUrl, parseFeedback, takeFeedbackPrefill, FEEDBACK_MAX } = await import(base + '../../utils/feedback.js')
const FB = await import(base + 'utils/feedback.js')
let fails = 0
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(ok ? 'ok  ' : 'FAIL', name, ok ? '' : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`) }

const bk = JSON.parse(readFileSync(base + 'tools/realm3-test-saves.json', 'utf8'))
const run = JSON.parse(bk.data['elementa-files-v2'])[2].run
const at45 = (extra = {}) => ({ ...run, round: 45, phase: 'rolling', bossModifier: rewriterById('floating'), threshold: 1, realm3Set: 1, bestCast: 10000000, endingsSeen: ['firmament_neutral_1'], ...extra })
const clear = (s) => R.gameReducer({ ...s, threshold: 1 }, { type: 'SUBMIT_ROUND' })
const enter = (extra = {}) => {
  let s = clear(at45(extra))
  s = R.gameReducer(s, { type: 'ENTER_UNWRITTEN' })
  return R.gameReducer(s, { type: 'CHOOSE_BOSS_REWARD', dieId: s.dice[0].id, slot: 'dice' })
}

// ---- the door ----
{
  const door = clear(at45())
  eq('round 45 opens the Unwritten door on every path, with the realm 3 ending', [door.phase, door.ending], ['crossroads', 'realm3_neutral_1'])
  eq('...resting ends the run with that ending', [R.gameReducer(door, { type: 'REST_HERE' }).phase, R.gameReducer(door, { type: 'REST_HERE' }).ending], ['victory', 'realm3_neutral_1'])
  for (const path of ['split', 'primordial']) eq(`...also on ${path}`, clear(at45({ path })).phase, 'crossroads')
  eq('the doors never lead back: ENTER_FIRMAMENT does nothing at realm 3\'s door or the Firmament\'s', [R.gameReducer(door, { type: 'ENTER_FIRMAMENT', set: 1 }).phase, R.gameReducer({ ...door, realm3: false }, { type: 'ENTER_FIRMAMENT', set: 1 }).phase], ['crossroads', 'crossroads'])
  eq('ENTER_UNWRITTEN only works at the door', R.gameReducer(at45(), { type: 'ENTER_UNWRITTEN' }).phase, 'rolling')
  const entered = R.gameReducer(door, { type: 'ENTER_UNWRITTEN' })
  eq('entering starts the Convergence with its reward and a first Market', [entered.phase, entered.convergence.index, entered.convergence.cleared, entered.shop.firstUnwritten], ['bossReward', 0, 0, true])
}

// ---- the Rush: order, targets, shops ----
{
  const order = C.rushFights()
  eq('the order: the Primordial, the gods, six Wardens (Set I, Set II), six Rewriters, Pip, You', order, ['primordial', 'gods', 'dawn', 'clockwork', 'expanse', 'umbra', 'maelstrom', 'hollow', 'axiom', 'zero', 'floating', 'infinity', 'observer', 'deadlock', 'pip', 'you'])
  let s = enter()
  eq('after the reward, a Market with the first fight next', [s.phase, s.convergence.index, s.convergence.shops], ['shop', 0, true])
  const best = Math.max(10000000, thresholdForRound(45, s.difficulty))
  const seen = []
  for (let i = 0; i < 80 && s.convergence && !s.duel; i++) {
    if (s.phase === 'shop') { s = R.gameReducer(s, { type: 'NEXT_ROUND' }); continue }
    if (s.phase !== 'rolling') throw new Error('phase ' + s.phase)
    seen.push({ id: s.convergence.fights[s.convergence.index], boss: s.bossModifier?.id, target: s.threshold, stage: s.gauntlet?.stage, phaseBefore: s.phase })
    s = clear(s)
    // a Market between fights, except inside the gods' block
    if (s.convergence && !s.duel && s.phase !== 'rolling') seen.at(-1).thenShop = s.phase === 'shop'
  }
  eq('the Rush ran 14 fights and 3 more (the gods are four stages)', [new Set(seen.map((x) => x.id)).size, seen.filter((x) => x.id === 'gods').length], [15, 4])
  const t = (id, stage) => seen.find((x) => x.id === id && (stage == null || x.stage === stage)).target
  const base6 = (x) => Math.round(Math.max(10000000, thresholdForRound(45, s.difficulty)) * C.RUSH_BASE * x)
  eq('Primordial: 0.6 x the best cast x its Rush factor', t('primordial'), base6(C.RUSH_FACTOR.primordial))
  eq('the gods: their own gauntlet factors', [0, 1, 2, 3].map((k) => t('gods', k)), GOD_TRIALS.map((g) => base6(C.RUSH_FACTOR[g.id])))
  eq('Wardens: each its own Rush factor (the Hollow lowered, v0.9.17)', ['dawn', 'clockwork', 'expanse', 'umbra', 'maelstrom', 'hollow'].map((id) => t(id)), ['dawn', 'clockwork', 'expanse', 'umbra', 'maelstrom', 'hollow'].map((id) => base6(C.RUSH_FACTOR[id])))
  eq('Rewriters: their Rush factors (the Axiom is flat, a fraction of round 45\'s target)', ['axiom', 'zero', 'floating', 'infinity', 'observer', 'deadlock'].map((id) => t(id)), ['axiom', 'zero', 'floating', 'infinity', 'observer', 'deadlock'].map((id) => (id === 'axiom' ? Math.round(thresholdForRound(45, s.difficulty) * C.RUSH_FLAT.axiom) : base6(C.RUSH_FACTOR[id]))))
  eq('the Rush factors are all positive and cover every fight but Pip and You', C.rushFights().filter((id) => id !== 'you' && id !== 'pip').flatMap((id) => (id === 'gods' ? GOD_TRIALS.map((g) => g.id) : [id])).every((id) => id === 'axiom' || C.RUSH_FACTOR[id] > 0), true)
  eq('the Hollow is the lowest Rush factor of the Wardens (its relics are sealed)', C.RUSH_FACTOR.hollow < Math.min(C.RUSH_FACTOR.dawn, C.RUSH_FACTOR.umbra), true)
  eq('each fight kept its own rules (the boss on the table is the fight)', seen.filter((x) => x.id !== 'gods').map((x) => x.boss === x.id), seen.filter((x) => x.id !== 'gods').map(() => true))
  eq('the gods came as one block of four with no shop between', seen.filter((x) => x.id === 'gods').map((x) => [x.stage, x.thenShop]), [[0, undefined], [1, undefined], [2, undefined], [3, true]])
  eq('Pip then the duel: Pip after the Rewriters', [seen.at(-1).id, s.duel ? 'duel' : 'none'], ['pip', 'duel'])
  // a target follows the best cast of the run
  const richer = enter({ bestCast: 50000000 })
  eq('a bigger best cast makes bigger targets (0.6 x best)', R.selectors.convergenceNext(richer).target, Math.round(50000000 * 0.6 * C.RUSH_FACTOR.primordial))
  // a shop between each fight; none on Cataclysm
  let a = enter()
  a = R.gameReducer(a, { type: 'NEXT_ROUND' })
  a = clear(a)
  eq('Ember: a Market follows a cleared fight', [a.phase, a.shop.type], ['shop', 'market'])
  const cata = enter({ difficulty: difficultyById('cataclysm') })
  eq('Cataclysm: the reward goes straight to the first fight, no shop', [cata.phase, cata.bossModifier.id, cata.convergence.index], ['rolling', 'primordial', 0])
  const cata2 = clear(cata)
  eq('Cataclysm: and between fights, none either', [cata2.phase, cata2.gauntlet?.rush], ['rolling', true])
  let c3 = cata2
  for (let i = 0; i < 4; i++) c3 = clear(c3)
  eq('...after the gods, straight to the first Warden', [c3.phase, c3.bossModifier.id], ['rolling', 'dawn'])
  // losing a fight costs a life; the Rush has no camp
  const fight = R.gameReducer(a, { type: 'NEXT_ROUND' })
  const lost = R.gameReducer({ ...fight, threshold: 1e15 }, { type: 'SUBMIT_ROUND' })
  eq('missing a fight costs a life and offers a retry, no camp', [lost.phase, lost.lives, R.gameReducer(lost, { type: 'GO_TO_CAMP' }).phase], ['missed', fight.lives - 1, 'missed'])
  const retried = R.gameReducer(lost, { type: 'RETRY_ROUND' })
  eq('...the retry keeps the same fight and target', [retried.phase, retried.bossModifier.id, retried.threshold], ['rolling', lost.bossModifier.id, lost.threshold])
  const dead = R.gameReducer({ ...fight, lives: 1, threshold: 1e15 }, { type: 'SUBMIT_ROUND' })
  eq('...with no life left the run is over', dead.phase, 'gameover')
}

// ---- Pip's callback ----
{
  const fresh = R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'wanderer', difficultyId: 'ember', seed: 'PIPSEED' })
  const faces = fresh.dice.map((d) => [d.elementId, d.value])
  const first = R.gameReducer({ ...fresh, threshold: 1 }, { type: 'SUBMIT_ROUND' })
  eq('the very first cast is remembered: the starting dice and their faces, and the score', [first.firstCast.dice.map((d) => [d.elementId, d.value]), typeof first.firstCast.score], [faces, 'number'])
  const second = R.gameReducer({ ...first, phase: 'rolling', threshold: 1 }, { type: 'SUBMIT_ROUND' })
  eq('...and not overwritten by a later one', second.firstCast, first.firstCast)
  let s = enter({ firstCast: first.firstCast })
  for (let i = 0; i < 80 && s.convergence.fights[s.convergence.index] !== 'pip'; i++) s = s.phase === 'shop' ? R.gameReducer(s, { type: 'NEXT_ROUND' }) : clear(s)
  s = s.phase === 'shop' ? R.gameReducer(s, { type: 'NEXT_ROUND' }) : s
  eq('Pip is the fight, with a small target (a tenth of the best cast)', [s.bossModifier.id, s.threshold, s.firstCast.score > 0], ['pip', Math.round(Math.max(10000000, thresholdForRound(45, s.difficulty)) * C.PIP_FRACTION), true])
  eq('Pip says it is the final boss, and the master is You', [C.CALLBACKS.pip.en.includes('final boss'), C.SCENE_TEXT.pipAfter.some((l) => l.en.includes('master'))], [true, true])
  eq('every Rush boss has a callback line in EN and ES', C.rushFights().filter((id) => id !== 'you').every((id) => C.CALLBACKS[id]?.en && C.CALLBACKS[id]?.es), true)
}

// ---- the duel ----
{
  const toDuel = (extra = {}) => {
    let s = enter(extra)
    for (let i = 0; i < 200 && !s.duel; i++) s = s.phase === 'shop' ? R.gameReducer(s, { type: 'NEXT_ROUND' }) : clear(s)
    return s
  }
  const sized = { ...run, dice: run.dice.map((d, i) => (i < 3 ? { ...d, bonus: 2 } : d)) }
  const ember = toDuel({ dice: sized.dice })
  const snap = R.selectors.snapshotBuild(ember)
  eq('Ember: the ghost is your current build', [ember.duel.kind, JSON.stringify(ember.duel.build.dice.map((d) => d.elementId)), ember.duel.build.relics], ['ember', JSON.stringify(snap.dice.map((d) => d.elementId)), snap.relics])
  const blazeState = { ...ember, difficulty: difficultyById('blaze'), duel: null }
  const blaze = R.selectors.ghostBuildFor(blazeState)
  const up = blazeState.dice.map((d, i) => [d.tierId, blaze.dice[i].tierId])
  eq('Blaze: every die that can grow is one size up, with doubled bonuses', [blaze.dice.every((d, i) => d.sides >= blazeState.dice[i].sides), blaze.dice.some((d, i) => d.sides > blazeState.dice[i].sides), blaze.dice[0].bonus, up.length], [true, true, 4, blazeState.dice.length])
  const inferno = { ...ember, difficulty: difficultyById('inferno'), duel: null }
  const bestBuild = { dice: [{ elementId: 'earth', tierId: 'd6', sides: 6, bonus: 0, runes: [] }], relics: [], law: null, score: 123 }
  eq('Inferno: the best build on the file', R.selectors.ghostBuildFor({ ...inferno, fileBestBuild: bestBuild }), bestBuild)
  const ghostBuild = { dice: [{ elementId: 'fire', tierId: 'd8', sides: 8, bonus: 0, runes: [] }], relics: [], law: null }
  eq('...and once someone beat the duel, their ghost is the true boss from then on', R.selectors.ghostBuildFor({ ...inferno, fileBestBuild: bestBuild, fileGhost: ghostBuild }), ghostBuild)
  eq('...with nothing on file, your current build', R.selectors.ghostBuildFor(inferno).dice.length, inferno.dice.length)
  const cat = R.selectors.ghostBuildFor({ ...ember, difficulty: difficultyById('cataclysm'), duel: null })
  eq('Cataclysm: the curated build, ten dice at d20 to d50, five relics and a Law', [cat.dice.length, cat.dice.every((d) => d.sides >= 20 && d.sides <= 50 || d.tierId === 'sigil'), cat.relics.length, cat.law], [10, true, 5, 'law_echo'])
  eq('...it is exactly the Theoretical Best list', [cat.dice.map((d) => d.elementId).sort(), [...cat.relics].sort(), cat.law], [[...C.THEORETICAL_BEST.dice].sort(), [...C.THEORETICAL_BEST.relics].sort(), C.THEORETICAL_BEST.law])
  eq('...every die and relic in it exists', [cat.dice.every((d) => ELEMENTS[d.elementId]), cat.relics.every((id) => relicById(id)), Boolean(relicById(cat.law))], [true, true, true])
  // the race
  eq('the duel starts with an announced move, a goal of 3 x the ghost reference cast, you first', [ember.duel.exchange, ember.duel.moves.length, ember.duel.goal, ember.duel.you, ember.duel.them], [1, 1, ember.duel.best * 3, 0, 0])
  eq('...the target shown is what is still needed', ember.threshold, ember.duel.goal)
  eq('...six exchanges at most; two moves from the fourth', [C.DUEL_EXCHANGES, C.DUEL_TWO_MOVES_FROM], [6, 4])
  // each move
  const table = (moves, extra = {}) => {
    const dice = ember.dice.map((d, i) => ({ ...d, value: 3 + i, total: 3 + i, held: false, locked: false }))
    return { ...ember, dice, duel: { ...ember.duel, moves, moveDone: false, stolen: [], borrowed: null }, ...extra }
  }
  const t1 = table(['steal'])
  const top = [...t1.dice].sort((a, b) => b.value - a.value)[0]
  const stolen = R.gameReducer(t1, { type: 'REROLL_UNHELD' })
  eq('steal: your highest unheld die is gone for the exchange, kept aside', [stolen.dice.some((d) => d.id === top.id), stolen.duel.stolen.map((s) => s.die.id)], [false, [top.id]])
  const held = R.gameReducer({ ...t1, dice: t1.dice.map((d) => (d.id === top.id ? { ...d, held: true } : d)) }, { type: 'REROLL_UNHELD' })
  eq('steal: a held die is safe (the next highest goes instead)', [held.dice.some((d) => d.id === top.id), held.duel.stolen.length], [true, 1])
  const after = R.gameReducer(stolen, { type: 'SUBMIT_ROUND' })
  eq('the die comes back after the exchange', [after.phase === 'rolling' ? after.dice.some((d) => d.id === top.id) : 'ended', after.duel?.stolen?.length ?? 0], [true, 0])
  const rewind = R.gameReducer(table(['rewind']), { type: 'REROLL_UNHELD' })
  eq('rewind: nothing is lost, the best die rolls again', [rewind.dice.length, rewind.duel.moveDone], [ember.dice.length, true])
  const borrow = R.gameReducer(table(['borrow'], { relics: [relicById('molten_core')] }), { type: 'REROLL_UNHELD' })
  eq('borrow: one of your relics is set against you for the exchange, and comes back', [borrow.duel.borrowed, R.selectors.effectiveRelics(borrow).some((r) => r.id === 'molten_core'), R.selectors.effectiveRelics({ ...borrow, duel: null }).some((r) => r.id === 'molten_core')], ['molten_core', false, true])
  const shuffle = R.gameReducer(table(['shuffle']), { type: 'REROLL_UNHELD' })
  eq('shuffle: same dice, the row is reordered', [[...shuffle.dice.map((d) => d.id)].sort().join(), [...table(['shuffle']).dice.map((d) => d.id)].sort().join()].every((x, _, a) => x === a[0]), true)
  const lock = R.gameReducer(table(['lock']), { type: 'REROLL_UNHELD' })
  const lowest = [...table(['lock']).dice].sort((a, b) => a.value - b.value)[0]
  eq('lock: your lowest die is locked where it lies', [lock.dice.find((d) => d.id === lowest.id).locked, lock.dice.find((d) => d.id === lowest.id).lockedVia], [true, 'ghost'])
  eq('no move destroys a die or keeps a relic', [stolen.dice.length + stolen.duel.stolen.length, borrow.relics.length], [ember.dice.length, 1])
  // played to the end: a win
  let w = toDuel()
  let guard = 0
  w = { ...w, duel: { ...w.duel, goal: 1 } }
  w = R.gameReducer(w, { type: 'SUBMIT_ROUND' })
  eq('reaching the goal wins: the true ending, with the winning build saved', [w.phase, w.ending, Boolean(w.ghostWin), w.ghostWin.dice.length], ['victory', 'true', true, w.dice.length])
  eq('...the build that won holds your dice and relics', w.ghostWin.relics, w.relics.map((r) => r.id))
  void guard
  // a loss: the ghost gets there first
  let l = toDuel()
  l = { ...l, duel: { ...l.duel, you: 0, them: l.duel.goal - 1 } }
  const lostDuel = R.gameReducer({ ...l, threshold: 1e15 }, { type: 'SUBMIT_ROUND' })
  eq('the ghost getting there first costs a life', [lostDuel.phase, lostDuel.lives], ['missed', l.lives - 1])
  const rematch = R.gameReducer(lostDuel, { type: 'RETRY_ROUND' })
  eq('...and a rematch starts the totals again, the same ghost', [rematch.phase, rematch.duel.you, rematch.duel.them, rematch.duel.exchange, rematch.duel.best === l.duel.best, rematch.duel.rematches], ['rolling', 0, 0, 1, true, 1])
  const out = R.gameReducer({ ...l, lives: 1, threshold: 1e15 }, { type: 'SUBMIT_ROUND' })
  eq('...with no life left the run ends', out.phase, 'gameover')
  // six exchanges and nobody at the goal: the higher total wins, a tie goes to the ghost
  let six = toDuel()
  six = { ...six, duel: { ...six.duel, exchange: 6, goal: 1e18, moveDone: true } }
  const ghostAhead = R.gameReducer({ ...six, duel: { ...six.duel, you: 5, them: 1e17 }, threshold: 1e15 }, { type: 'SUBMIT_ROUND' })
  eq('after six exchanges with nobody at the goal, the higher total wins: the ghost ahead beats you', ghostAhead.phase === 'missed' || ghostAhead.phase === 'gameover', true)
  const youAhead = R.gameReducer({ ...six, duel: { ...six.duel, you: 1e17, them: 5 }, threshold: 1e15 }, { type: 'SUBMIT_ROUND' })
  eq('...and you ahead beat the ghost', [youAhead.phase, youAhead.ending], ['victory', 'true'])
  // the ghost's cast is capped so one lucky roll cannot win it alone
  eq('a ghost cast never counts for more than half the goal', C.GHOST_CAST_CAP, 0.5)
  // determinism: the same state, the same exchange
  const x1 = R.gameReducer(toDuel(), { type: 'SUBMIT_ROUND' })
  const x2 = R.gameReducer(toDuel(), { type: 'SUBMIT_ROUND' })
  eq('the duel is seeded: the same table gives the same exchange', [x1.duel?.you, x1.duel?.them], [x2.duel?.you, x2.duel?.them])
  eq('the ghost duel uses the real engine: its reference cast is a real score', ember.duel.best > 1, true)
}

// ---- the loadout chain, Avatar, Lottery ----
{
  const ids = DECKS.map((d) => d.id)
  eq('the order: Stonecaller to Stormchaser, then the Gambler, then the seven new ones', ids, ['balanced', 'tidecaller', 'tempest', 'pyromancer', 'wanderer', 'forgeborn', 'stormchaser', 'gambler', 'climate', 'geologist', 'tidal', 'arcanist', 'hoarder', 'twinflame', 'lottery'])
  eq('Avatar is gone', [ids.includes('avatar'), JSON.stringify(DECKS).includes('Avatar')], [false, false])
  const { isDeckUnlocked } = await import(base + 'utils/profile.js')
  const prof = (beaten) => ({ decksBeaten: beaten })
  eq('only Stonecaller is open on a new file; the Gambler is not', [isDeckUnlocked('balanced', prof([])), isDeckUnlocked('tidecaller', prof([])), isDeckUnlocked('gambler', prof([]))], [true, false, false])
  eq('the Gambler follows Stormchaser, not any win', [isDeckUnlocked('gambler', prof(['balanced', 'tidecaller'])), isDeckUnlocked('gambler', prof(['stormchaser']))], [false, true])
  eq('each new loadout opens on beating the one before', ids.slice(8).map((id, i) => [isDeckUnlocked(id, prof([ids[7 + i]])), isDeckUnlocked(id, prof([]))]), ids.slice(8).map(() => [true, false]))
  eq('a file that beat Avatar still loads and loses nothing', [isDeckUnlocked('gambler', prof(['avatar', 'stormchaser'])), isDeckUnlocked('balanced', prof(['avatar']))], [true, true])
  const starts = Object.fromEntries(DECKS.filter((d) => !d.lottery).map((d) => [d.id, d.dice]))
  eq('the new loadouts start with their three dice', [starts.climate, starts.geologist, starts.tidal, starts.arcanist, starts.hoarder, starts.twinflame], [['magma', 'storm', 'monsoon'], ['mud', 'crystal', 'obsidian'], ['ice', 'steam', 'water'], ['mirror', 'beacon', 'conduit'], ['midas', 'bullion', 'earth'], ['fire', 'lightning', 'magma']])
  eq('every loadout has a name and tagline in Spanish', ids.every((id) => DECKS_ES[id]?.name && DECKS_ES[id]?.tagline), true)
  // Lottery
  const draw = (seed) => R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'lottery', difficultyId: 'ember', seed }).dice.map((d) => d.elementId)
  const draws = Array.from({ length: 40 }, (_, i) => draw('LOT' + i))
  eq('Lottery: three dice, no two alike, all from the Elementa shop pool', [draws.every((x) => x.length === 3 && new Set(x).size === 3), draws.flat().every((id) => LOTTERY_POOL.includes(id))], [true, true])
  const banned = draws.flat().filter((id) => ['god', 'mythic', 'absolute'].includes(ELEMENTS[id].tier) || ELEMENTS[id].rarity === 'absolute' || ELEMENTS[id].rarity === 'abstract' || id.startsWith('sigil') || ['twos_complement', 'reversed_bits', 'rolling_joke', 'undivisible', 'aether', 'primordial_die', 'gaea', 'ognen', 'varuna', 'zephyr'].includes(id))
  eq('...never gods, Mythic, Absolute, sigil or number dice', banned, [])
  const startTier = R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'LOT1' }).dice[0].tierId
  eq('...at the starting size', R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'lottery', difficultyId: 'ember', seed: 'LOT1' }).dice.map((d) => d.tierId), [startTier, startTier, startTier])
  eq('...seeded: the same seed, the same dice; another seed differs', [draw('SAME'), draw('SAME')].every((x, _, a) => JSON.stringify(x) === JSON.stringify(a[0])) && new Set(draws.map((x) => x.join())).size > 5, true)
  eq('...it varies across runs', new Set(draws.flat()).size > 10, true)
}

// ---- achievements ----
{
  const base0 = enter()
  eq('The Rush: finished once the Rush is behind you', progress.achievementsFromState({ ...base0, convergence: { ...base0.convergence, cleared: 14 } }).includes('the_rush'), true)
  eq('...not before', progress.achievementsFromState({ ...base0, convergence: { ...base0.convergence, cleared: 13 } }).includes('the_rush'), false)
  eq("Pip's Master: reaching the duel", [progress.achievementsFromState(base0).includes('pips_master'), progress.achievementsFromState({ ...base0, duel: { goal: 1 } }).includes('pips_master')], [false, true])
  const cat = R.cataclysmBuild()
  const full = { ...base0, dice: C.THEORETICAL_BEST.dice.map((id) => ({ id, elementId: id, tierId: 'd6', sides: 6 })), relics: C.THEORETICAL_BEST.relics.map(relicById), law: relicById(C.THEORETICAL_BEST.law) }
  eq('Theoretical Best: all ten dice, five relics and the Law at once', progress.achievementsFromState(full).includes('theoretical_best'), true)
  eq('...one die short is not enough', progress.achievementsFromState({ ...full, dice: full.dice.slice(1) }).includes('theoretical_best'), false)
  eq('...nor a missing relic or Law', [progress.achievementsFromState({ ...full, relics: full.relics.slice(1) }).includes('theoretical_best'), progress.achievementsFromState({ ...full, law: null }).includes('theoretical_best')], [false, false])
  void cat
  const prof = { decksBeaten: [], seen: {} }
  eq('Beat Yourself on the true ending; Final Form only on Cataclysm', [progress.achievementsFromVictory({ ending: 'true', difficulty: { id: 'ember' }, deckId: 'balanced' }, prof).filter((x) => ['beat_yourself', 'final_form'].includes(x)), progress.achievementsFromVictory({ ending: 'true', difficulty: { id: 'cataclysm' }, deckId: 'balanced' }, prof).filter((x) => ['beat_yourself', 'final_form'].includes(x)), progress.achievementsFromVictory({ ending: 'realm3_split_1', difficulty: { id: 'cataclysm' }, deckId: 'balanced' }, prof).filter((x) => ['beat_yourself', 'final_form'].includes(x))], [['beat_yourself'], ['beat_yourself', 'final_form'], []])
  const { ACHIEVEMENTS } = await import(base + 'data/achievements.js')
  const secret = ['where_roads_meet', 'the_rush', 'pips_master', 'beat_yourself', 'final_form', 'theoretical_best']
  eq('six new secret achievements, all in Spanish', [secret.every((id) => ACHIEVEMENTS.find((a) => a.id === id)?.secret), secret.length], [true, 6])
  // the arrival gift
  const gifted = R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'GIFT', file: { endings: ['neutral', 'unwritten'] } })
  const plain = R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'GIFT', file: { endings: ['neutral'] } })
  eq('a file that reached the Unwritten starts every run with +2 Stardust', [gifted.stardust, plain.stardust], [C.ARRIVAL_STARDUST, 0])
  eq('...and the same seed otherwise plays the same', JSON.stringify(gifted.dice.map((d) => d.value)), JSON.stringify(plain.dice.map((d) => d.value)))
}

// ---- the file's builds (bestBuild, ghost) ----
{
  const store = new Map()
  globalThis.window = { localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i], get length() { return store.size } } }
  const SM = await import(base + 'utils/saveManager.js')
  const PF = await import(base + 'utils/profile.js')
  SM.createFile(0)
  eq('a new file has no best build and no ghost', [SM.readFile(0).profile.bestBuild, SM.readFile(0).profile.ghost], [null, null])
  const snap = (n) => ({ dice: [{ elementId: 'earth', tierId: 'd6', sides: 6 }], relics: ['molten_core'], law: null, n })
  PF.recordBestBuild(0, 100, snap(1))
  PF.recordBestBuild(0, 50, snap(2))
  eq('the highest cast keeps its build; a lower one does not replace it', [SM.readFile(0).profile.bestBuild.n, SM.readFile(0).profile.bestBuild.score], [1, 100])
  PF.recordBestBuild(0, 200, snap(3))
  eq('a higher cast does', SM.readFile(0).profile.bestBuild.n, 3)
  PF.saveGhost(0, snap(9))
  eq('the winning build is saved as the ghost', SM.readFile(0).profile.ghost.n, 9)
  const builds = R.gameReducer({ phase: 'title' }, { type: 'START_RUN', deckId: 'balanced', difficultyId: 'inferno', seed: 'B', file: SM.readFile(0).profile })
  eq('a new run reads the best build and the ghost of its file', [builds.fileBestBuild.n, builds.fileGhost.n], [3, 9])
  eq('an old file normalizes with the new fields', JSON.stringify(SM.readFile(0).profile.ghost !== undefined), 'true')
  delete globalThis.window
}

// ---- feedback ----
{
  const url = feedbackUrl('Hola\nversion: 1 & more = ? #x')
  eq('the link opens /#contact with the text encoded', [url.startsWith('/?feedback='), url.endsWith('#contact'), parseFeedback(new URL(url, 'http://x').search)], [true, true, 'Hola\nversion: 1 & more = ? #x'])
  eq('the text is size-limited', [feedbackUrl('x'.repeat(5000)).length < FEEDBACK_MAX * 4, parseFeedback(new URL(feedbackUrl('x'.repeat(5000)), 'http://x').search).length], [true, FEEDBACK_MAX])
  const win = { location: { search: '?feedback=hello%20there&a=1', pathname: '/', hash: '#contact' }, history: { state: null, replaceState(_s, _t, u) { win.location.search = u.slice(u.indexOf('?'), u.indexOf('#')) || ''; win.replaced = u } } }
  eq('the form reads it once and clears the parameter, keeping the rest and the hash', [takeFeedbackPrefill(win, 1000), win.replaced], ['hello there', '/?a=1#contact'])
  eq('...a second look finds it already taken (or the first answer inside two seconds)', takeFeedbackPrefill({ location: { search: '', pathname: '/', hash: '' }, history: {} }, 100000), '')
  eq('nothing is sent by the link itself (it is only text in an address)', url.includes('formspree'), false)
  const msg = FB.feedbackMessage('en', { round: 31, realm: 'realm 3', difficulty: 'ember', deckId: 'balanced', seed: 'ABCD1234' }, new Error('boom'))
  eq('the draft names the version, round, realm, difficulty, loadout, seed and the error', ['Version:', 'Round: 31', 'Realm: realm 3', 'Difficulty: ember', 'Loadout: balanced', 'Seed: ABCD1234', 'Error: boom'].every((x) => msg.includes(x)), true)
  eq('...and in Spanish', FB.feedbackMessage('es', { round: 5, realm: 'elementa' }).includes('Ronda: 5'), true)
  const noRun = FB.feedbackMessage('en', null)
  eq('with no run (the title screen) it still has the version', [noRun.includes('Version:'), noRun.includes('Round:')], [true, false])
}

// ---- old saves ----
{
  const old = JSON.parse(JSON.parse(readFileSync(base + 'tools/firmament-test-saves.json', 'utf8')).data['elementa-files-v2'])[0].run
  const n = R.gameReducer(old, { type: 'SUBMIT_ROUND' })
  eq('a save from before the Convergence plays on', ['rolling', 'bossReward', 'shop', 'crossroads', 'missed', 'victory'].includes(n.phase), true)
  eq('...with no convergence, duel or ghost fields', [Boolean(old.convergence), Boolean(old.duel), n.convergence ?? null], [false, false, null])
  const r3 = R.gameReducer({ ...run, round: 45, phase: 'rolling', bossModifier: rewriterById('deadlock'), threshold: 1, realm3Set: 2, endingsSeen: ['firmament_neutral_1'] }, { type: 'SUBMIT_ROUND' })
  eq('a realm 3 save from before the door now reaches it at round 45', [r3.phase, r3.ending], ['crossroads', 'realm3_neutral_2'])
}

// ---- Aether is one per run (v0.9.17) ----
{
  const aeth = (id) => ({ ...run.dice[0], id, elementId: 'aether', held: false, locked: false })
  const base = { ...run, phase: 'shop', recipes: [...(run.recipes ?? []), 'aether'], shards: 500, shop: { ...(run.shop ?? {}), forgeOpen: true, type: 'forge' } }
  const one = { ...base, dice: [aeth('a1'), ...run.dice.slice(1, 4)] }
  const two = { ...base, dice: [aeth('a1'), aeth('a2'), ...run.dice.slice(2, 4)] }
  eq('holding one Aether blocks buying another', R.gameReducer({ ...one, shop: { ...one.shop, buyableElements: ['aether'] } }, { type: 'BUY_DIE', elementId: 'aether' }).dice.filter((d) => d.elementId === 'aether').length, 1)
  const four = ['fire', 'water', 'earth', 'air'].map((e, i) => ({ ...run.dice[0], id: 'e' + i, elementId: e, held: false, locked: false }))
  const canForge = (dice) => R.selectors.forgeableRecipes({ ...base, dice }).find((r) => r.fusionElementId === 'aether')?.canForge
  eq('Aether forges from the four elements, but not while one is held', [canForge(four), canForge([aeth('a1'), ...four])], [true, false])
  eq('Aether cannot be copied (Mirror Shard, Shadow Twin, Chisel)', R.selectors.holdsKind(one.dice, 'aether'), true)
  eq('an old save that holds two keeps both', R.gameReducer({ phase: 'title' }, { type: 'LOAD_RUN', save: two, slot: 0 }).dice.filter((d) => d.elementId === 'aether').length, 2)
  eq('with none, Aether can still be forged from its four elements', R.selectors.holdsKind(run.dice, 'aether'), false)
}

console.log(fails ? `${fails} FAILED` : 'all ok')
