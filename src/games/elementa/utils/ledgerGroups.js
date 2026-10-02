// Cast ledger grouping (EXPANSION.md P4). Repeated lines from the same
// source ("Kindle +1 Mult" six times) collapse into one group, in order of
// first appearance. Shared by the ledger and the cast reveal so both step
// through the same groups.

const keyOf = (section, line) => `${section}:${line.kind}:${line.id ?? line.tier ?? ''}:${line.op ?? 'add'}`

/**
 * Groups one section's lines. Each group lists the indices of its lines in
 * `lines`, the total it adds (a sum, or a product for multiplicative
 * lines), and `count`. The Dice line is never merged with anything.
 */
export function groupLines(lines, section) {
  const groups = []
  const byKey = new Map()
  lines.forEach((line, index) => {
    const key = line.kind === 'dice' ? `${section}:dice` : keyOf(section, line)
    let g = byKey.get(key)
    if (!g) {
      g = { key, section, kind: line.kind, id: line.id, tier: line.tier, op: line.op ?? 'add', indices: [], lines: [], count: 0, value: line.op === 'mul' ? 1 : 0 }
      byKey.set(key, g)
      groups.push(g)
    }
    g.indices.push(index)
    g.lines.push(line)
    g.count += 1
    g.value = g.op === 'mul' ? g.value * line.value : g.value + line.value
  })
  return groups
}
