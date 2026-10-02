// Seeded randomness for runs (GDD §26). Every gameplay roll, shop offer,
// and boss pick draws from this one mulberry32 generator. The reducer
// restores the generator from `state.rngState` before each action and
// saves it back after, so a run is fully reproducible from its seed and
// survives save/load mid-run without drifting.
let s = (Date.now() ^ 0x9e3779b9) >>> 0

export function random() {
  s = (s + 0x6d2b79f5) >>> 0
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function getRngState() {
  return s
}

export function setRngState(v) {
  s = v >>> 0
}

const SEED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** A fresh, human-friendly 8-character seed (no 0/O/1/I ambiguity). */
export function randomSeed() {
  let out = ''
  for (let i = 0; i < 8; i++) out += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)]
  return out
}

/** Normalizes user input: uppercase, only seed characters, max 8. */
export function cleanSeed(input) {
  return (input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
}

/** FNV-1a hash of the seed string into a generator state. */
export function seedToState(seed) {
  let h = 0x811c9dc5
  for (const ch of seed) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
