import { groupLines } from './ledgerGroups.js'

// The cast reveal's script (EXPANSION.md P4, Q5). A snapshot of the scoring
// result becomes a list of steps in the cast ledger's order: each die left
// to right adds to Base, then each group of Base lines, then each group of
// Mult lines. A group (utils/ledgerGroups.js) is one step: its sources light
// together, one number pops with the group's total, and the Base or Mult box
// takes it. Applying a step walks the group's lines one by one in ledger
// order, with the same arithmetic as `evaluatePool`, so the last step always
// lands on exactly the score the reducer computes. Pure data: no React.

/** Which dice (indices into `result.dice`) a ledger group is about. */
function litDice(result, kind, lines) {
  if (kind === 'reaction') return [...new Set(lines.flatMap((l) => l.dice ?? []))]
  if (kind === 'explosions') return result.dice.flatMap((d, i) => ((d.explosions || 0) > 0 ? [i] : []))
  if (kind === 'set') return result.dice.flatMap((d, i) => ((result.setDiceIds ?? []).includes(d.id) ? [i] : []))
  return []
}

export function buildCastScript(result) {
  const groups = { base: groupLines(result.baseLines, 'base'), mult: groupLines(result.multLines, 'mult') }
  const steps = []
  result.dice.forEach((d, i) =>
    steps.push({
      kind: 'die',
      section: 'base',
      group: 0,
      op: 'add',
      lines: [{ kind: 'dice', value: d.contribution || 0, op: 'add' }],
      total: d.contribution || 0,
      dieId: d.id,
      dieIndex: i,
      lit: [i],
      links: [],
    }),
  )
  for (const section of ['base', 'mult']) {
    groups[section].forEach((g, gi) => {
      // The Dice group is the die steps above.
      if (section === 'base' && gi === 0) return
      steps.push({
        kind: g.kind,
        section,
        group: gi,
        op: g.op,
        lines: g.lines,
        total: g.value,
        id: g.id,
        tier: g.tier,
        count: g.count,
        lit: litDice(result, g.kind, g.lines),
        links: g.kind === 'reaction' ? g.lines.filter((l) => l.dice).map((l) => l.dice) : [],
      })
    })
  }
  const order = []
  steps.forEach((s) => {
    if (!order.some((o) => o.section === s.section && o.group === s.group)) order.push({ section: s.section, group: s.group })
  })
  return { result, steps, order, groups, index: 0, base: 0, mult: 1 }
}

/** Plays the next step into Base or Mult, line by line, like the engine. */
export function applyCastStep(r) {
  const step = r.steps[r.index]
  let { base, mult } = r
  for (const line of step.lines) {
    if (step.section === 'base') base = line.op === 'mul' ? base * line.value : base + line.value
    else mult = line.op === 'mul' ? mult * line.value : mult + line.value
  }
  return { ...r, index: r.index + 1, base, mult }
}

export function finishCastScript(r) {
  let cur = r
  while (cur.index < cur.steps.length) cur = applyCastStep(cur)
  return cur
}
