// Big numbers read cleanly (EXPANSION.md R1): realm 3's targets reach the
// tens of millions. Below a million a number is written out; above, it is
// shortened to K-style suffixes with one decimal (12.3M, 4.5B, 1.2T).
const STEPS = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
]

export function compactNumber(n) {
  if (!Number.isFinite(n)) return String(n)
  const abs = Math.abs(n)
  for (const [size, suffix] of STEPS) {
    if (abs >= size) {
      const v = n / size
      // 12.3M, but 123M and not 123.0M.
      return `${Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10}${suffix}`
    }
  }
  return String(Math.round(n))
}
