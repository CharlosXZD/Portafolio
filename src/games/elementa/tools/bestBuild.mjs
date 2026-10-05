// "Best build" search (Carlos asked: run bots on the best dice and see which
// is best, 2026-10-05). A hill-climb over a pool of 10 dice at top size and
// five relics, scored by the mean of the best of 5 rolls of its round score.
// It uses evaluatePool and rerollPool only (no shop, no rules of the shop),
// so it ranks DICE and RELICS by raw power, not by how easy they are to get.
// Run: node tools/bestBuild.mjs [iterations] [seed]
import { rerollPool, evaluatePool } from '../engine/scoring.js'
import { ELEMENTS, TIERS } from '../data/elements.js'
import { RELICS } from '../data/relics.js'

const iterations = +(process.argv[2] || 2500)
let seed = +(process.argv[3] || 7)
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
const pick = (a) => a[Math.floor(rnd() * a.length)]

const SKIP = new Set(['dead_star', 'primordial_die', 'entropy'])
const DIE_IDS = Object.keys(ELEMENTS).filter((id) => !SKIP.has(id) && ELEMENTS[id].tier !== undefined)
const REPEATABLE = new Set(DIE_IDS.filter((id) => [TIERS.PURE, TIERS.COSMIC].includes(ELEMENTS[id].tier) && ELEMENTS[id].cosmic !== false))
const RELIC_IDS = RELICS.map((r) => r.id)
const relicById = Object.fromEntries(RELICS.map((r) => [r.id, r]))

let n = 0
const mk = (elementId) => ({ id: 'd' + n++, elementId, tierId: 'd100', sides: 100, value: 1, total: 1, bonus: 0, held: false, locked: false })
const score = (dieIds, relicIds, samples = 24) => {
  const relics = relicIds.map((id) => relicById[id])
  let sum = 0
  for (let s = 0; s < samples; s++) {
    let best = 0
    for (let k = 0; k < 5; k++) {
      const dice = rerollPool(dieIds.map(mk), relics, { round: 45, rerollsLeft: 3 })
      const r = evaluatePool(dice, relics, { round: 45, rerollsLeft: 3, emptySlots: 0 })
      if (Number.isFinite(r.roundScore) && r.roundScore > best) best = r.roundScore
    }
    sum += best
  }
  return sum / samples
}
const valid = (dice) => dice.every((id, i) => REPEATABLE.has(id) || dice.indexOf(id) === i)
const randomBuild = () => {
  const dice = []
  while (dice.length < 10) { const id = pick(DIE_IDS); if (REPEATABLE.has(id) || !dice.includes(id)) dice.push(id) }
  const relics = []
  while (relics.length < 5) { const id = pick(RELIC_IDS); if (!relics.includes(id)) relics.push(id) }
  return { dice, relics }
}
let cur = randomBuild(); let curScore = score(cur.dice, cur.relics)
let best = { ...cur, score: curScore }
for (let i = 0; i < iterations; i++) {
  const next = { dice: [...cur.dice], relics: [...cur.relics] }
  const r = rnd()
  if (r < 0.5) { const j = Math.floor(rnd() * 10); next.dice[j] = pick(DIE_IDS) }
  else if (r < 0.8) { const j = Math.floor(rnd() * 5); const id = pick(RELIC_IDS); if (!next.relics.includes(id)) next.relics[j] = id }
  else { const a = Math.floor(rnd() * 10), b = Math.floor(rnd() * 10); [next.dice[a], next.dice[b]] = [next.dice[b], next.dice[a]] }
  if (!valid(next.dice)) continue
  const sc = score(next.dice, next.relics)
  if (sc >= curScore || rnd() < 0.02) { cur = next; curScore = sc }
  if (sc > best.score) best = { ...next, score: sc }
}
const finalScore = score(best.dice, best.relics, 120)
console.log('best build (mean best-of-5 score, 120 samples):', Math.round(finalScore).toLocaleString())
console.log('dice  :', best.dice.map((id) => ELEMENTS[id].name).join(', '))
console.log('relics:', best.relics.map((id) => relicById[id].name).join(', '))
