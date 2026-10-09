// Bundle budget gate for the visual overhaul (VISUALS.md section 0, V1 item 6).
//
// Prints the gzipped size of every file in dist/assets, marks which ones the
// first screen loads (the scripts and styles linked from dist/index.html,
// including modulepreloads) and which load on demand, and FAILS when the
// first-load JavaScript has grown more than 150 kB gzipped over the baseline
// measured before the overhaul began (visualBudget.baseline.json).
//
//   node src/games/elementa/tools/visualBudget.mjs              check dist/ as it is
//   node src/games/elementa/tools/visualBudget.mjs --build      run `vite build` first
//   node src/games/elementa/tools/visualBudget.mjs --write-baseline   record dist/ as the new baseline
//
// Sizes use gzip level 9, so they run a little under Vite's own report.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../..')
const dist = join(root, 'dist')
const baselineFile = join(here, 'visualBudget.baseline.json')
const BUDGET_KB = 150
const args = new Set(process.argv.slice(2))

if (args.has('--build')) execSync('npx vite build', { cwd: root, stdio: 'inherit' })
if (!existsSync(join(dist, 'index.html'))) {
  console.error('No dist/index.html. Run with --build (or `npx vite build`) first.')
  process.exit(2)
}

const kb = (n) => (n / 1024).toFixed(2).padStart(9)
const gz = (file) => gzipSync(readFileSync(file), { level: 9 }).length

const html = readFileSync(join(dist, 'index.html'), 'utf8')
const firstLoad = new Set(
  [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1].replace(/^\//, '')),
)

const files = readdirSync(join(dist, 'assets'))
  .map((f) => join('assets', f))
  .filter((f) => statSync(join(dist, f)).isFile())
const rows = files.map((f) => ({ file: f, size: statSync(join(dist, f)).size, gz: gz(join(dist, f)), first: firstLoad.has(f) }))
rows.sort((a, b) => Number(b.first) - Number(a.first) || b.gz - a.gz)

console.log('\n  file'.padEnd(52) + 'raw kB'.padStart(10) + 'gzip kB'.padStart(10) + '  loads')
for (const r of rows) {
  console.log(`  ${r.file.padEnd(48)}${kb(r.size)}${kb(r.gz)}  ${r.first ? 'first screen' : 'on demand'}`)
}

const sum = (pred) => rows.filter(pred).reduce((n, r) => n + r.gz, 0)
const firstJs = sum((r) => r.first && r.file.endsWith('.js'))
const firstCss = sum((r) => r.first && r.file.endsWith('.css'))
const lazyJs = sum((r) => !r.first && r.file.endsWith('.js'))
console.log(`\n  first-load JS  ${kb(firstJs)} kB gzip   first-load CSS ${kb(firstCss)} kB gzip   on-demand JS ${kb(lazyJs)} kB gzip`)

if (args.has('--write-baseline')) {
  const commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim()
  writeFileSync(baselineFile, JSON.stringify({ firstLoadJsGzip: firstJs, firstLoadCssGzip: firstCss, measuredAt: commit, note: 'Before the visual overhaul (V1). gzip level 9, bytes.' }, null, 2) + '\n')
  console.log(`  baseline written (${commit}).`)
  process.exit(0)
}

if (!existsSync(baselineFile)) {
  console.error('  No baseline file. Run with --write-baseline on a build from before the overhaul.')
  process.exit(2)
}
const base = JSON.parse(readFileSync(baselineFile, 'utf8'))
const growth = (firstJs - base.firstLoadJsGzip) / 1024
console.log(`  baseline JS    ${kb(base.firstLoadJsGzip)} kB gzip (at ${base.measuredAt})`)
console.log(`  growth         ${growth >= 0 ? '+' : ''}${growth.toFixed(2)} kB of the ${BUDGET_KB} kB budget`)
if (growth > BUDGET_KB) {
  console.error(`\n  FAIL: first-load JavaScript grew ${growth.toFixed(2)} kB gzip, over the ${BUDGET_KB} kB budget.`)
  process.exit(1)
}
console.log('  OK: within budget.')
