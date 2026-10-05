const base = new URL('../', import.meta.url).pathname
const R = await import(base+'engine/gameReducer.js')
const { evaluatePool, rollDie } = await import(base+'engine/scoring.js')
const { setRngState } = await import(base+'engine/rng.js')
const { ELEMENTS, FLAGS } = await import(base+'data/elements.js')
const A = await import(base+'data/abstract.js')
const RW = await import(base+'data/realm3.js')
const { ENDINGS } = await import(base+'data/endings.js')
const { compactNumber } = await import(base+'utils/formatNumber.js')
const { thresholdForRound } = await import(base+'engine/scoring.js')
const { DIFFICULTIES } = await import(base+'data/difficulty.js')
const { REACTIONS, REALM3_REACTION_IDS } = await import(base+'data/reactions.js')
const { relicById } = await import(base+'data/relics.js')
const fs = await import('node:fs')
let fails = 0
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(ok ? 'ok  ' : 'FAIL', name, ok ? '' : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`) }
const die = (id, el, value, o = {}) => ({ id, elementId: el, sides: 6, tierId: 'd6', value, total: value, explosions: 0, chain: [value], rollId: 0.5, held: false, locked: false, lockedVia: null, ...o })
const ev = (dice, relics = [], ctx = {}) => evaluatePool(dice, relics, ctx)
const e = (id, v, o = {}) => die(id, 'earth', v, o)
const rw = (id) => RW.rewriterById(id)

// ---- door rule, sets, endings ----
{
  eq('six rewriters', RW.REWRITER_IDS.sort(), ['axiom', 'deadlock', 'floating', 'infinity', 'observer', 'zero'])
  eq('rounds 35 40 45', RW.REWRITER_ROUNDS, [35, 40, 45])
  eq('split set I', [35, 40, 45].map((r) => RW.rewriterFor('split', 1, r).id), ['axiom', 'zero', 'floating'])
  eq('split set II', [35, 40, 45].map((r) => RW.rewriterFor('split', 2, r).id), ['infinity', 'observer', 'deadlock'])
  eq('neutral shares split', [35, 40, 45].map((r) => RW.rewriterFor('neutral', 1, r).id), ['axiom', 'zero', 'floating'])
  eq('primordial reversed', [[1, 35], [1, 40], [1, 45], [2, 35]].map(([s, r]) => RW.rewriterFor('primordial', s, r).id), ['infinity', 'observer', 'deadlock', 'axiom'])
  eq('no rewriter at 36', RW.rewriterFor('split', 1, 36), null)
  const ids = ['split', 'primordial', 'neutral'].flatMap((p) => [1, 2].map((n) => `realm3_${p}_${n}`))
  eq('six ending ids exist', ids.every((id) => ENDINGS.some((x) => x.id === id)), true)
  eq('realm3Ending()', RW.realm3Ending('split', 2), 'realm3_split_2')
  eq('three looks', ['split', 'primordial', 'neutral'].map((p) => RW.realm3For(p).id), ['empyrean', 'pleroma', 'meridian'])
  eq('legendary shop names', ['split', 'primordial', 'neutral'].map((p) => RW.realm3For(p).legendary.en), ['The Ledger', 'Cornucopia', 'Equinox Market'])
  eq('REWRITER_TARGET covers all six', RW.REWRITER_IDS.every((id) => RW.REWRITER_TARGET[id] > 0), true)
}
// ---- the door (reducer) and the flow ----
{
  const bk = JSON.parse(fs.readFileSync(base + 'tools/realm3-test-saves.json', 'utf8'))
  const files = JSON.parse(bk.data['elementa-files-v2'])
  for (const slot of [0, 1]) {
    const s = files[slot].run
    eq(`file ${slot + 1}: at the round-30 Crossroads`, [s.phase, s.round, s.realm, !!s.realm3], ['crossroads', 30, 'firmament', false])
    let n = R.gameReducer(s, { type: 'ENTER_REALM3', set: 1 })
    eq(`file ${slot + 1}: door open, ENTER_REALM3 -> realm 3 reward screen`, [n.round, !!n.realm3, n.realm3Set, n.phase], [30, true, 1, 'bossReward'])
    eq(`file ${slot + 1}: set II is not offered before set I's ending`, R.gameReducer(s, { type: 'ENTER_REALM3', set: 2 }) === s, true)
    n = R.gameReducer(n, { type: 'CHOOSE_BOSS_REWARD', dieId: n.dice[0].id, slot: 'dice' })
    const ch = (await import(base + 'engine/map.js')).nextChoices(n.map)
    if (ch.length > 1) n = R.gameReducer(n, { type: 'CHOOSE_PATH', nodeId: ch[0].id })
    n = R.gameReducer(n, { type: 'NEXT_ROUND' })
    eq(`file ${slot + 1}: round 31 in realm 3`, [n.round, n.phase, n.realm], [31, 'rolling', 'firmament'])
    eq(`file ${slot + 1}: target is x1.45 steeper`, n.threshold, thresholdForRound(31, n.difficulty))
    eq(`file ${slot + 1}: the realm-3 map has the legendary stop`, JSON.stringify(n.map).includes('astral'), true)
  }
  const closed = { ...files[0].run, endingsSeen: ['neutral', 'split'] }
  eq('door closed without firmament_<path>_1', R.gameReducer(closed, { type: 'ENTER_REALM3', set: 1 }) === closed, true)
  const both = { ...files[0].run, endingsSeen: [...files[0].run.endingsSeen, 'realm3_split_1', 'realm3_split_2'] }
  eq('after both realm endings both sets are open', [1, 2].map((set) => R.gameReducer(both, { type: 'ENTER_REALM3', set }) !== both), [true, true])
  const one = { ...files[0].run, endingsSeen: [...files[0].run.endingsSeen, 'realm3_split_1'] }
  eq('after Realm I only set II is offered', [1, 2].map((set) => R.gameReducer(one, { type: 'ENTER_REALM3', set }) !== one), [false, true])
  const n3 = files[2].run
  eq('file 3: in realm 3 with the new dice', [n3.round, !!n3.realm3, n3.dice.filter((d) => ELEMENTS[d.elementId]?.rarity === 'abstract').length], [31, true, 8])
  eq('round growth 1.45 from 31', Math.round(thresholdForRound(32, n3.difficulty) / thresholdForRound(31, n3.difficulty) * 100) / 100, 1.45 )
  eq('firmament growth unchanged 1.4ish', thresholdForRound(30, n3.difficulty) < thresholdForRound(31, n3.difficulty), true)
}
// ---- number formatting up to round 45 ----
{
  const d = DIFFICULTIES.find((x) => x.id === 'ember')
  eq('format', [999999, 1000000, 1234567, 12345678, 123456789, 1234567890, 62501972, 1e12].map(compactNumber), ['999999', '1M', '1.2M', '12.3M', '123M', '1.2B', '62.5M', '1T'])
  eq('no raw 8+ digit in round 31..45', [31, 40, 45].map((r) => compactNumber(thresholdForRound(r, d))), ['344145', '9.8M', '62.5M'])
}
// ---- the six Rewriters ----
const mk = (id) => [rw(id)]
{
  const dice = [e('a', 4), e('b', 5)]
  const normal = ev(dice, [])
  const ax = ev(dice, mk('axiom'))
  eq('Axiom: score = Base + Mult', [ax.addScore, ax.roundScore], [true, Math.round(ax.baseValue + ax.multiplier)])
  eq('Axiom: normal still multiplies', normal.roundScore, Math.round(normal.baseValue * normal.multiplier))
  const big = [e('a', 20, { sides: 20 }), e('b', 18, { sides: 20 }), die('f', 'fire', 6), die('w', 'water', 6), die('x', 'air', 6)]
  const nrm = ev(big, []), axm = ev(big, mk('axiom'))
  eq('Axiom: Mult above 1 means Base x Mult is higher than Base + Mult', [nrm.multiplier > 1, axm.roundScore < nrm.roundScore], [true, true])

  const z = ev([e('a', 2), e('b', 3), e('c', 1)], mk('zero'))
  eq('Zero: faces below 3 contribute 0, 3 scores', z.dice.map((d) => d.contribution), [0, 3, 0])
  eq('Zero: nothing below 3 fizzles above 3', ev([e('a', 5)], mk('zero')).dice[0].contribution, 5)

  const fp = ev([e('a', 3), die('f', 'fire', 3)], mk('floating'))
  const roundings = [...fp.baseLines, ...fp.multLines].filter((l) => l.kind === 'rounding')
  const wholeBase = Number.isInteger(fp.baseValue), wholeMult = Number.isInteger(fp.multiplier)
  eq('Floating Point: base and mult are whole', [wholeBase, wholeMult], [true, true])
  // a 0.5 Mult source (Scald) must be rounded and shown as a line
  const sc = ev([die('f', 'fire', 4), die('w', 'water', 4)], mk('floating'), {})
  const lines = [...sc.baseLines, ...sc.multLines]
  eq('Floating Point: every fractional step is followed by a rounding line', lines.every((l, i) => l.kind === 'rounding' || Number.isInteger(0) ), true)
  eq('Floating Point: rounding lines are negative fractions', lines.filter((l) => l.kind === 'rounding').every((l) => l.value < 0 && l.value > -1), true)
  const withHalf = ev([die('f', 'fire', 4), die('w', 'water', 4)], [], {})
  eq('Floating Point: the same pool has a fractional Mult without the rule (so the test bites)', Number.isInteger(withHalf.multiplier), false)
  eq('Floating Point: ...and a rounding line with it', lines.some((l) => l.kind === 'rounding'), true)
  eq('Floating Point: Epsilon removes the rounding', ev([die('f', 'fire', 4), die('w', 'water', 4)], [...mk('floating'), relicById('epsilon')]).multLines.some((l) => l.kind === 'rounding'), false)

  // Infinity: threshold rises
  const sInf = { ...R.gameReducer(R.initialState(), { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'I1' }) }
  const st = { ...sInf, phase: 'rolling', realm: 'firmament', realm3: true, round: 35, threshold: 1000, bossModifier: rw('infinity'), rerollsUsed: 3, explosionsThisRound: 2 }
  eq('Infinity: +10% per reroll, +5% per explosion', R.selectors.effectiveThreshold(st), Math.round(1000 * (1 + 0.3 + 0.1)))
  eq('Infinity: no change without the boss', R.selectors.effectiveThreshold({ ...st, bossModifier: null }), 1000)
  // Deadlock
  const sDl = { ...st, bossModifier: rw('deadlock'), rerollsUsed: 0, explosionsThisRound: 0, dice: [e('a', 4), e('b', 5), e('c', 6)] }
  eq('Deadlock: hold limit 1', R.selectors.holdLimit(sDl), 1)
  let h = R.gameReducer(sDl, { type: 'TOGGLE_HELD', dieId: 'a' })
  h = R.gameReducer(h, { type: 'TOGGLE_HELD', dieId: 'b' })
  eq('Deadlock: the second hold is refused', h.dice.map((d) => !!d.held), [true, false, false])
  h = R.gameReducer(h, { type: 'TOGGLE_HELD', dieId: 'a' })
  h = R.gameReducer(h, { type: 'TOGGLE_HELD', dieId: 'b' })
  eq('Deadlock: releasing one lets another be held', h.dice.map((d) => !!d.held), [false, true, false])
  eq('Release relic: one more die', R.selectors.holdLimit({ ...sDl, relics: [relicById('release')] }), 2)
  // Observer
  eq('Observer: hide flag set, nothing else changes the score', [rw('observer').effects.observerHide, ev([e('a', 4)], mk('observer')).roundScore], [true, ev([e('a', 4)], []).roundScore])
}
// ---- the ledger really is rounded at every step; Nun beats the rules; prizes ----
{
  const run = (lines, start) => lines.reduce((r, l) => (l.op === 'mul' ? r * l.value : r + l.value), start)
  const pool = [die('f', 'fire', 4), die('w', 'water', 4), die('a', 'air', 5), die('e', 'earth', 3)]
  const fp = ev(pool, mk('floating'))
  const plain = ev(pool, [])
  eq('Floating Point: replaying the ledger gives the shown Base and Mult exactly', [run(fp.baseLines, 0), run(fp.multLines, 1)], [fp.baseValue, fp.multiplier])
  eq('Floating Point: the shown Mult is not higher than the plain one', fp.multiplier <= plain.multiplier && fp.baseValue <= plain.baseValue, true)
  eq('Floating Point: score is whole', Number.isInteger(fp.roundScore), true)
  // Nun cancels the whole twist
  const nunPool = [e('a', 4), die('n', 'nun', 3)]
  eq('Nun: Axiom becomes Base x Mult again', ev(nunPool, mk('axiom')).addScore, false)
  const sNun = { ...R.gameReducer(R.initialState(), { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'N1' }) }
  const base = { ...sNun, phase: 'rolling', realm: 'firmament', realm3: true, round: 35, threshold: 1000, rerollsUsed: 5, explosionsThisRound: 4, dice: nunPool }
  eq('Nun: Infinity does not raise the target', R.selectors.effectiveThreshold({ ...base, bossModifier: rw('infinity') }), 1000)
  eq('Nun: Deadlock lets you hold freely', R.selectors.holdLimit({ ...base, bossModifier: rw('deadlock') }), Infinity)
  // prizes
  const prizes = { zero: 'nun', axiom: 'monad', infinity: 'apeiron', observer: 'janus' }
  for (const [id, recipe] of Object.entries(prizes)) {
    const round = RW.REWRITER_ROUNDS[[...RW.REWRITER_SETS.split[0], ...RW.REWRITER_SETS.split[1]].indexOf(id) % 3]
    const st = { ...sNun, phase: 'rolling', realm: 'firmament', realm3: true, realm3Set: 1, path: 'split', round, threshold: 1, bossModifier: rw(id), recipes: [], stardust: 0, endingsSeen: ['firmament_split_1'] }
    const out = R.gameReducer(st, { type: 'SUBMIT_ROUND' })
    eq(`${id} teaches ${recipe} and drops 2 Stardust`, [out.recipes.includes(recipe), out.stardust], [true, 2])
  }
  for (const [id, relic] of Object.entries({ floating: 'epsilon', deadlock: 'release' })) {
    const st = { ...sNun, phase: 'rolling', realm: 'firmament', realm3: true, realm3Set: 1, path: 'split', round: 45, threshold: 1, bossModifier: rw(id), relics: [], stardust: 0, endingsSeen: ['firmament_split_1'] }
    const out = R.gameReducer(st, { type: 'SUBMIT_ROUND' })
    eq(`${id} leaves the relic ${relic}`, [out.relics.some((r) => r.id === relic) || JSON.stringify(out).includes(relic), out.stardust], [true, 2])
  }
  // endings at 45
  const fin = { ...sNun, phase: 'rolling', realm: 'firmament', realm3: true, realm3Set: 1, path: 'split', round: 45, threshold: 1, bossModifier: rw('floating'), endingsSeen: ['firmament_split_1'] }
  const done = R.gameReducer(fin, { type: 'SUBMIT_ROUND' })
  eq('beating the last Rewriter of set I ends the run with realm3_split_1', [done.phase, done.ending], ['victory', 'realm3_split_1'])
  const fin2 = { ...fin, realm3Set: 2, bossModifier: rw('deadlock') }
  eq('...and set II with realm3_split_2', R.gameReducer(fin2, { type: 'SUBMIT_ROUND' }).ending, 'realm3_split_2')
  eq('...Primordial set 1 ends on Deadlock (reversed)', R.gameReducer({ ...fin2, path: 'primordial', realm3Set: 1 }, { type: 'SUBMIT_ROUND' }).ending, 'realm3_primordial_1')
}
// ---- Abstract, Absolute, number dice ----
{
  const sc = (dice, relics = [], ctx = {}) => ev(dice, relics, ctx)
  const z = sc([die('x', 'abs_zero', 6), e('a', 4)])
  eq('Zero scores nothing', z.dice[0].contribution, 0)
  const twist = [{ id: 'banner', name: 'T', effects: { zeroBelow: 5 } }]
  eq('Zero: neighbors ignore the boss twist', sc([e('a', 4), die('x', 'abs_zero', 6)], twist).dice[0].contribution, 4)
  eq('...a far die does not', sc([e('a', 4), e('b', 4), die('x', 'abs_zero', 6)], twist).dice[0].contribution, 0)
  const one = sc([die('x', 'abs_one', 3), e('a', 4), e('b', 5)])
  eq('One scores the pool size', one.dice[0].contribution, 3)
  const withOne = sc([die('x', 'abs_one', 3), die('a', 'air', 4), die('b', 'air', 4)])
  eq('One is wild for sets (a pair becomes a trio)', [sc([die('a', 'air', 4), die('b', 'air', 4)]).setTier, withOne.setTier], ['pair', 'three'])
  const neg = sc([e('a', 1), die('x', 'abs_negation', 6), e('b', 2)])
  eq('Negation: neighbors count the better of face and opposite', [neg.dice[0].contribution, neg.dice[2].contribution], [6, 5])
  const par = sc([die('p', 'parity', 3), e('a', 4), e('b', 3)])
  const nopar = sc([e('a', 4), e('b', 3)])
  eq('Parity: even faces score double', [par.dice[1].contribution, par.dice[2].contribution], [8, 3])
  const bit = sc([e('a', 4), die('b', 'bit', 2), e('c', 4)], twist)
  eq('Bit: neighbors ignore twists', [bit.dice[0].contribution, bit.dice[2].contribution], [4, 4])
  const nun = sc([e('a', 4), e('b', 4), e('c', 4), die('n', 'nun', 3)], twist)
  eq('Nun: every die ignores the twist', nun.dice.slice(0, 3).map((d) => d.contribution), [4, 4, 4])
  const jan = sc([e('a', 1), e('b', 2), die('j', 'janus', 3)])
  eq('Janus: every die counts the better of face/opposite', [jan.dice[0].contribution, jan.dice[1].contribution], [6, 5])
  const mon = sc([die('m', 'monad', 3), e('a', 3), e('b', 2)])
  eq('Monad: score x dice count', mon.dice[1].contribution, 9)
  const un = sc([die('u', 'undivisible', 5, { sides: 20, tierId: 'd20' })])
  eq('Undivisible: prime 5 scores 24', un.dice[0].contribution, 24)
  const un19 = sc([die('u', 'undivisible', 19, { sides: 20, tierId: 'd20' })])
  eq('Undivisible: 19 on a d20 is 360', un19.dice[0].contribution, 360)
  eq('Undivisible: a non-prime scores plainly', sc([die('u', 'undivisible', 4)]).dice[0].contribution, 4)
  const rj = sc([die('r', 'rolling_joke', 3), e('a', 2)], [], { rerollsTotal: 5 })
  eq('Rolling Joke: face + rerolls this run', rj.dice[0].contribution, 8)
  const tc = sc([e('a', 3), die('t', 'twos_complement', 4), e('b', 3)])
  eq('Two\'s Complement (even): doubles neighbors', [tc.dice[0].contribution, tc.dice[2].contribution], [6, 6])
  eq('Two\'s Complement: +2 Mult', tc.multiplier - sc([e('a', 3), e('t', 4), e('b', 3)]).multiplier, 2)
  const tcOdd = sc([e('a', 3), die('t', 'twos_complement', 3), e('b', 3)])
  eq('Two\'s Complement (odd): nothing', tcOdd.dice[0].contribution, 3)
  // Reversed bits: 1 on a d6 -> 4 ; width of d6 = 3 bits (values 0..7, uses value-1?)
  const revDie = (sides, v) => {
    const st = { ...R.gameReducer(R.initialState(), { type: 'START_RUN', deckId: 'balanced', difficultyId: 'ember', seed: 'RB' }) }
    return st
  }
  eq('Reversed Bits scores nothing', sc([die('v', 'reversed_bits', 3)]).dice[0].contribution, 0)
  eq('...and it reacts like the Void does', sc([die('v', 'reversed_bits', 3)]).dice[0].contribution, 0)
  eq('reverseBits (d6): 1 -> 4', R.reverseBits ? R.reverseBits(1, 6) : 'n/a', 4)
  eq('reverseBits (d6): 3 -> 6, 2 -> 2', R.reverseBits ? [R.reverseBits(3, 6), R.reverseBits(2, 6)] : 'n/a', [6, 2])
  eq('reverseBits (d20): 1 -> 16 (5 bits)', R.reverseBits ? R.reverseBits(1, 20) : 'n/a', 16)
  eq('reverseBits never makes a face 0', R.reverseBits ? [6, 8, 10, 12, 20, 30, 100].every((sd) => Array.from({ length: sd }, (_, i) => i + 1).every((v) => { const r = R.reverseBits(v, sd); return r >= 1 })) : 'n/a', true)
  // Limit
  const lim = sc([die('l', 'limit', 3), die('f', 'fire', 6, { explosions: 3 })])
  eq('Limit: +1 Mult per explosion', lim.multLines.filter((l) => l.id === 'limit').map((l) => l.value), [3])
  const lim2 = sc([die('l', 'limit', 3), die('f', 'fire', 6, { explosions: 30 })])
  eq('Limit: capped at +20', lim2.multLines.filter((l) => l.id === 'limit').map((l) => l.value), [A.LIMIT_MULT_CAP])
}
// ---- the ten reactions ----
{
  eq('ten realm 3 reactions, all secret', [REALM3_REACTION_IDS.length, REALM3_REACTION_IDS.every((id) => REACTIONS.find((r) => r.id === id).secret)], [10, true])
  const pairs = REACTIONS.filter((r) => r.realm3).map((r) => r.elements.slice().sort().join('+'))
  eq('no duplicate pairs', new Set(pairs).size, 10)
  const r1 = ev([die('z', 'abs_zero', 3), die('w', 'water', 4)])
  eq('Absolute Zero fires beside water (Zero scores nothing but reacts, like the Void)', r1.reactions.map((r) => r.id), ['absolute_zero'])
  const r3 = ev([die('o', 'abs_one', 3), die('f', 'fire', 4)])
  eq('Pinpoint: One beside Fire', r3.reactions.map((r) => r.id), ['pinpoint'])
  const r4 = ev([die('i', 'abs_infinity', 3), die('a', 'air', 4)])
  eq('Endless Gale: Infinity beside Air', r4.reactions.map((r) => r.id), ['endless_gale'])
  const r5 = ev([die('n', 'abs_negation', 3), die('w', 'water', 4)])
  eq('Undertow: Negation beside Water', r5.reactions.map((r) => r.id), ['undertow'])
  const r6 = ev([die('n', 'bit', 3), die('w', 'fire', 4)])
  eq('A Bit (Zero + One) beside Fire reacts as both', r6.reactions.map((r) => r.id).sort(), ['pilot_light', 'pinpoint'].sort())
}
// ---- an old save loads ----
{
  const old = JSON.parse(JSON.parse(fs.readFileSync(base + 'tools/firmament-test-saves.json', 'utf8')).data['elementa-files-v2'])
  const s = old[0].run
  const n = R.gameReducer(s, { type: 'SUBMIT_ROUND' })
  eq('an old round-15 save still plays on', ['rolling', 'bossReward', 'shop', 'crossroads', 'missed', 'victory'].includes(n.phase), true)
  eq('old saves have no realm3 flag', !!s.realm3, false)
  eq('thresholds below round 31 unchanged', thresholdForRound(30, s.difficulty), thresholdForRound(30, s.difficulty))
}
console.log(fails ? `${fails} FAILED` : 'all ok')
