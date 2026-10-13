// Checks CONTENT.md against the data files (QA, v0.9.17): every English line of the data that CONTENT.md
// is meant to carry must appear in it, so the reference cannot fall behind the game unnoticed.
// Run: node src/games/elementa/tools/contentCheck.mjs [--verbose]   (exit code 1 when something is missing)
import { readFileSync } from 'node:fs'
const base = new URL('../', import.meta.url).pathname
const md = readFileSync(base + 'CONTENT.md', 'utf8')
// Markdown dresses text a little (curly quotes, bold, a pipe escaped in a table): compare the plain words.
const plain = (s) => s.toLowerCase().replace(/[*_`\\]/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim()
const body = plain(md)
const verbose = process.argv.includes('--verbose')
let missing = 0, checked = 0

/** Every string in the value that sits under an `en` key, or is a plain string in an `{en, es}` pair. */
function englishStrings(value, out = [], keyPath = '') {
  if (!value || typeof value !== 'object') return out
  if (typeof value.en === 'string') { out.push([keyPath, value.en]); return out }
  for (const [k, v] of Object.entries(value)) {
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === 'string' ? null : englishStrings(x, out, keyPath + '.' + k + '[' + i + ']')))
    else englishStrings(v, out, keyPath + '.' + k)
  }
  return out
}
function expect(group, label, value) {
  const text = value && typeof value === 'object' ? value.en : value
  if (typeof text !== 'string' || text.length < 3) return
  checked++
  if (!body.includes(plain(text))) {
    missing++
    if (verbose || missing <= 60) console.log(`MISSING ${group}: ${label}: ${text.slice(0, 110)}`)
  }
}
const load = (f) => import(base + 'data/' + f)

const { KEEPERS } = await load('keepers.js')
for (const k of Object.values(KEEPERS)) for (const [path, text] of englishStrings(k)) if (!/\.(es)$/.test(path)) expect('keeper ' + k.id, path, text)
const { ACHIEVEMENTS } = await load('achievements.js')
for (const a of ACHIEVEMENTS) { expect('achievement', a.id + ' name', a.name); expect('achievement', a.id + ' text', a.description) }
const { DECKS } = await load('decks.js')
for (const d of DECKS) { expect('loadout', d.id, d.name); expect('loadout', d.id + ' tagline', d.tagline) }
const { SHOP_TYPES } = await load('shops.js')
for (const s of Object.values(SHOP_TYPES)) expect('shop', s.id, s.name) // (CONTENT.md describes each shop in its own, longer words)
const { DIFFICULTIES } = await load('difficulty.js')
for (const d of DIFFICULTIES) { expect('difficulty', d.id, d.name); expect('difficulty', d.id + ' tagline', d.tagline) }
const B = await load('bossModifiers.js')
for (const w of [...B.WARDENS, ...B.GOD_TRIALS]) { expect('boss', w.id, w.name); expect('boss', w.id + ' text', w.description) }
const { RELICS } = await load('relics.js')
for (const r of RELICS) expect('relic', r.id, r.name)
const { CONSUMABLES } = await load('consumables.js')
for (const c of CONSUMABLES) expect('consumable', c.id, c.name)
const { ELEMENTS } = await load('elements.js')
for (const e of Object.values(ELEMENTS)) expect('die', e.id, e.name)
const { REACTIONS } = await load('reactions.js')
for (const r of REACTIONS) expect('reaction', r.id, r.name)
const R3 = await load('realm3.js')
for (const r of Object.values(R3).filter((x) => x && typeof x === 'object' && x.tier === 5)) { expect('rewriter', r.id, r.name); expect('rewriter', r.id + ' rule', r.description) }
const C = await load('convergence.js')
for (const [id, line] of Object.entries(C.CALLBACKS)) expect('callback', id, line)
for (const [id, line] of Object.entries(C.GHOST_LINES ?? {})) for (const [p, t] of englishStrings({ [id]: line })) expect('ghost line', p, t)
const E = await load('endings.js')
for (const e of Object.values(E).filter((x) => Array.isArray(x)).flat()) if (e?.id && e.title) expect('ending', e.id, e.title)

// Every named thing in these files (the Abstract and Absolute dice, sigils, runes, Constellations, Totems, the Arbiter).
function named(mod, group) {
  const seen = new Set()
  const walk = (o, depth = 0) => {
    if (!o || typeof o !== 'object' || depth > 4 || seen.has(o)) return
    seen.add(o)
    if (o.name && typeof o.name !== 'function' && (typeof o.name === 'string' || typeof o.name.en === 'string') && (o.id || o.tier != null || o.kind)) { expect(group, o.id ?? '', o.name); return }
    for (const v of Object.values(o)) walk(v, depth + 1)
  }
  for (const v of Object.values(mod)) walk(v)
}
for (const f of ['abstract', 'sigils', 'runes', 'constellations', 'totems']) named(await load(f + '.js'), f)
const AR = await load('arbiter.js')
for (const [p, t] of englishStrings(AR)) if (!p.includes('ARBITER_FW_ALL')) expect('arbiter', p, t) // (FW_ALL is the two other lists joined)

console.log(missing ? `${missing} of ${checked} data lines are not in CONTENT.md` : `CONTENT.md carries every checked data line (${checked})`)
process.exit(missing ? 1 : 0)
