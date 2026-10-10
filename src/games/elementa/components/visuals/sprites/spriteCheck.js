import { itemBitmap } from './index.js'

// The uniqueness check for the item sprites (VISUALS.md V2.5.4): two items must not look the
// same at a glance. Silhouettes come first (the share of the union of two shapes that does
// not overlap), then colors (the share of shared body pixels whose color differs). A pair is
// "too alike" when both are small. It needs no WebGL, so it runs anywhere in milliseconds.

function compare(a, b) {
  let union = 0
  let xor = 0
  let shared = 0
  let colorDiff = 0
  for (let i = 0; i < a.sil.length; i++) {
    const sa = a.sil[i]
    const sb = b.sil[i]
    if (sa || sb) union++
    if (sa !== sb) xor++
    if (sa && sb) {
      shared++
      const k = i * 4
      if (Math.abs(a.data[k] - b.data[k]) + Math.abs(a.data[k + 1] - b.data[k + 1]) + Math.abs(a.data[k + 2] - b.data[k + 2]) > 70) colorDiff++
    }
  }
  return { shape: union ? xor / union : 0, color: shared ? colorDiff / shared : 0 }
}

/** Compares every pair; `pairs` are those below both thresholds, `nearest` the 8 closest by shape. */
export function spriteDuplicates(ids, { shape = 0.35, color = 0.45 } = {}) {
  const maps = ids.map((id) => [id, itemBitmap(id)]).filter(([, b]) => b)
  const all = []
  for (let i = 0; i < maps.length; i++)
    for (let j = i + 1; j < maps.length; j++) {
      const d = compare(maps[i][1], maps[j][1])
      all.push({ a: maps[i][0], b: maps[j][0], ...d })
    }
  all.sort((x, y) => x.shape - y.shape)
  return { compared: maps.length, pairs: all.filter((p) => p.shape < shape && p.color < color), nearest: all.slice(0, 8) }
}
