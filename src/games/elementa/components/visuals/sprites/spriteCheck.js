import { itemBitmap } from './index.js'

// The uniqueness check for the item sprites (VISUALS.md V2.5.4): two items must not look the
// same at a glance. Silhouettes come first (the share of the union of two shapes that does
// not overlap), then colors (the share of shared body pixels whose color differs). Items of
// one family share a silhouette on purpose (all Runes are a tablet, all Constellations a
// chart, all Totems a pole, all Transmutes a vial, all Laws a scroll: style bible rule 10),
// so inside a family only the color and mark can tell them apart, and the pair is judged on
// color alone. It needs no WebGL, so it runs anywhere in milliseconds.
export const familyOf = (id) =>
  id.startsWith('const_') && id !== 'const_black_hole' ? 'chart' : id.startsWith('totem_') ? 'totem' : id.startsWith('rune_') ? 'rune' : id.startsWith('transmute_') ? 'vial' : id.startsWith('law_') ? 'law' : id

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

/**
 * Compares every pair. `across` are pairs from different families that are close in shape
 * (below `shape`) and in color (below `color`); `within` are pairs from one family whose
 * colors are close (below `within`); `nearest` the 8 closest pairs across families by shape.
 */
export function spriteDuplicates(ids, { shape = 0.12, color = 0.55, within = 0.2 } = {}) {
  const maps = ids.map((id) => [id, itemBitmap(id)]).filter(([, b]) => b)
  const all = []
  for (let i = 0; i < maps.length; i++)
    for (let j = i + 1; j < maps.length; j++) {
      const d = compare(maps[i][1], maps[j][1])
      all.push({ a: maps[i][0], b: maps[j][0], same: familyOf(maps[i][0]) === familyOf(maps[j][0]), ...d })
    }
  const cross = all.filter((p) => !p.same).sort((x, y) => x.shape - y.shape)
  return {
    compared: maps.length,
    across: cross.filter((p) => p.shape < shape && p.color < color),
    within: all.filter((p) => p.same && p.color < within).sort((x, y) => x.color - y.color),
    nearest: cross.slice(0, 8),
  }
}
