import { FRAMES, NATIVE, getModelAtlas } from './three/itemAtlas.js'

// The uniqueness check (VISUALS.md V2.2): two items must never look the same
// at a glance. For every pair of built atlases this compares a few frames of
// the turn pixel by pixel (color and shape together) and flags the pairs that
// are too alike. It runs in the Visual Lab's Item gallery, because it needs
// the real renders, which need WebGL.

const SAMPLE_FRAMES = [0, 4, 8, 12].map((f) => Math.min(f, FRAMES - 1))

async function framesOf(id) {
  const atlas = await getModelAtlas(id, 0)
  if (!atlas) return null
  const ctx = atlas.canvas.getContext('2d', { willReadFrequently: true })
  return SAMPLE_FRAMES.map((f) => ctx.getImageData(f * NATIVE, 0, NATIVE, NATIVE).data)
}

// Share of pixels (among those solid in either image) that differ in color or shape.
function difference(a, b) {
  let solid = 0
  let diff = 0
  for (let i = 0; i < a.length; i += 4) {
    const sa = a[i + 3] > 0
    const sb = b[i + 3] > 0
    if (!sa && !sb) continue
    solid++
    if (sa !== sb) diff++
    else if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 60) diff++
  }
  return solid ? diff / solid : 0
}

/** Compares every pair of ids; returns the pairs below `threshold` (default 0.2), most alike first. */
export async function findNearDuplicates(ids, threshold = 0.2) {
  const frames = new Map()
  for (const id of ids) {
    const f = await framesOf(id)
    if (f) frames.set(id, f)
  }
  const list = [...frames.keys()]
  const pairs = []
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = frames.get(list[i])
      const b = frames.get(list[j])
      // Mean over the sampled turns, so two items that only match from one angle do not count.
      const d = a.reduce((sum, fa, n) => sum + difference(fa, b[n]), 0) / a.length
      if (d < threshold) pairs.push({ a: list[i], b: list[j], diff: d })
    }
  }
  return { compared: list.length, pairs: pairs.sort((x, y) => x.diff - y.diff) }
}
