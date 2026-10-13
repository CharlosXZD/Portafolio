import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../elementa.css'
import './visuals.css'

// A dev tool of the Visual Lab (VISUALS.md V8.5): it walks the real game in hidden iframes, one
// test save at a time, in both visual styles, at phone, tablet and desktop widths and with Reduced
// motion, and records what it finds (the steps that worked, a crash screen, horizontal scroll,
// running animations, DOM size, small tap targets, errors). The queue and the results live in
// localStorage, so a reload (a dev server restart) resumes where it stopped. Everything is muted:
// the saves carry the three sound keys. Nothing here touches the game's code.

const KEY = 'elementa-smoke-v1'
const SAVES = ['table', 'shop-market', 'shop-forge', 'shop-bazaar', 'fshop-astral', 'fshop-pantry', 'missed', 'gameover', 'boss', 'crossroads', 'inscribe', 'scene-crossing']
const STYLES = ['new', 'legacy']
const WIDTHS = [375, 768, 1024]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { results: {}, queue: null }
  } catch {
    return { results: {}, queue: null }
  }
}
const save = (s) => localStorage.setItem(KEY, JSON.stringify(s))

function buildQueue(subset) {
  const q = []
  // ?quick runs phone and desktop only (and Reduced motion on the new style only).
  const quick = typeof location !== 'undefined' && location.search.includes('quick')
  for (const style of STYLES) for (const w of quick ? [375, 1024] : WIDTHS) for (const s of SAVES) q.push({ save: s, style, w, reduced: false })
  for (const style of quick ? ['new'] : STYLES) for (const s of SAVES) q.push({ save: s, style, w: 1024, reduced: true })
  // The forced fallbacks (V8.3): the low-end tier, Instant speed, and every lazy part failing at once.
  for (const extra of ['low', 'instant', 'fail']) for (const s of SAVES) q.push({ save: s, style: 'new', w: 1024, reduced: false, extra })
  return subset ? q.filter((j) => j.save === subset) : q
}

async function runJob(job, host) {
  const j = await fetch(`/src/games/elementa/tools/room-test-saves/${job.save}.json`).then((r) => r.json())
  const keep = { [KEY]: localStorage.getItem(KEY) }
  localStorage.clear()
  localStorage.setItem(KEY, keep[KEY])
  Object.entries(j.data).forEach(([k, v]) => localStorage.setItem(k, v))
  localStorage.setItem('elementa-visual-style', job.style)
  localStorage.setItem('elementa-reduced-motion', String(job.reduced))
  if (job.extra === 'low') localStorage.setItem('elementa-force-quality', 'low')
  if (job.extra === 'instant') localStorage.setItem('elementa-game-speed', 'instant')
  if (job.extra === 'fail') localStorage.setItem('elementa-force-fail', 'cinematic,rooms,map,items,rigs,gallery')
  sessionStorage.clear()
  const f = document.createElement('iframe')
  f.style.cssText = `position:fixed;left:0;top:0;width:${job.w}px;height:${job.w < 500 ? 740 : 800}px;opacity:0.01;pointer-events:none;border:0`
  f.src = '/games/elementa'
  host.appendChild(f)
  await new Promise((r) => (f.onload = r))
  const w = f.contentWindow
  const errors = []
  w.addEventListener('error', (e) => errors.push(String(e.message).slice(0, 120)))
  const origError = w.console.error
  w.console.error = (...a) => {
    errors.push(a.map(String).join(' ').slice(0, 120))
    origError.apply(w.console, a)
  }
  const d = f.contentDocument
  await sleep(1500)
  const click = async (re) => {
    for (let i = 0; i < 16; i++) {
      const b = [...d.querySelectorAll('button')].find((x) => re.test(x.textContent.trim()))
      if (b) {
        b.click()
        await sleep(900)
        return true
      }
      await sleep(300)
    }
    return false
  }
  const steps = [await click(/^play$/i), await click(/^open$/i), await click(/continue/i), await click(/^(continue|enter)/i)].map((x) => (x ? 1 : 0)).join('')
  await sleep(1800)
  const root = d.documentElement
  const vw = w.innerWidth
  const small = [...d.querySelectorAll('button, a, [role=button]')].filter((e) => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && (r.width < 28 || r.height < 28) && r.bottom > 0 && r.top < w.innerHeight
  }).length
  // Accessible names: every button and link needs text, an aria-label, a title or a labelled image inside.
  const unlabeled = [...d.querySelectorAll('button, a[href], [role=button]')].filter((e) => {
    const r = e.getBoundingClientRect()
    if (!(r.width > 0 && r.height > 0)) return false
    if ((e.textContent || '').trim()) return false
    return !(e.getAttribute('aria-label') || e.getAttribute('title') || e.getAttribute('aria-labelledby') || e.querySelector('[aria-label], img[alt]:not([alt=""]), [role=img]'))
  }).length
  // A rough contrast pass: text color against the nearest opaque background, below 3:1 is flagged.
  const lum = (c) => {
    const m = c.match(/[\d.]+/g)?.map(Number)
    if (!m || m.length < 3) return null
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return { l: 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]), a: m.length > 3 ? m[3] : 1 }
  }
  const bgOf = (e) => {
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      const c = lum(w.getComputedStyle(n).backgroundColor)
      if (c && c.a > 0.85) return c.l
    }
    return 0.01
  }
  let low = 0
  const sample = [...d.querySelectorAll('p, span, h1, h2, h3, button, label, li')].filter((e) => e.children.length === 0 && (e.textContent || '').trim().length > 1).slice(0, 400)
  for (const e of sample) {
    const cs = w.getComputedStyle(e)
    const fg = lum(cs.color)
    if (!fg || cs.visibility === 'hidden' || +cs.opacity === 0) continue
    const r = e.getBoundingClientRect()
    if (!(r.width > 0 && r.height > 0) || r.bottom < 0 || r.top > w.innerHeight) continue
    const bg = bgOf(e)
    const ratio = (Math.max(fg.l, bg) + 0.05) / (Math.min(fg.l, bg) + 0.05)
    if (ratio < 3) low++
  }
  const res = {
    unlabeled,
    lowContrast: low,
    steps,
    broke: /Something broke|Algo se rompi/.test(d.body.innerText),
    style: d.querySelector('.elementa-root')?.getAttribute('data-visual-style') ?? 'new',
    overflowX: Math.max(root.scrollWidth, d.body.scrollWidth) > vw + 1,
    anims: d.getAnimations ? d.getAnimations().filter((a) => a.playState === 'running').length : -1,
    nodes: d.querySelectorAll('*').length,
    small,
    scene: !!d.querySelector('[role=dialog]'),
    errors: errors.slice(0, 3),
  }
  f.remove()
  return res
}

export default function SmokePage() {
  const [state, setState] = useState(load)
  const [running, setRunning] = useState(false)
  const host = useRef(null)
  const stop = useRef(false)

  async function run(queue) {
    stop.current = false
    setRunning(true)
    let s = load()
    s.queue = queue ?? s.queue ?? buildQueue()
    save(s)
    while (s.queue.length && !stop.current) {
      const job = s.queue[0]
      let res
      try {
        res = await runJob(job, host.current)
      } catch (e) {
        res = { err: String(e).slice(0, 120) }
      }
      s = load()
      s.results[`${job.style}:${job.w}${job.reduced ? 'r' : ''}${job.extra ? '-' + job.extra : ''}:${job.save}`] = res
      s.queue = (s.queue ?? []).slice(1)
      save(s)
      setState(s)
    }
    setRunning(false)
  }

  useEffect(() => {
    const s = load()
    if (s.queue?.length) run()
    return () => {
      stop.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = Object.entries(state.results)
  const bad = rows.filter(([, r]) => r.err || r.broke || r.steps !== '1111' || r.errors?.length)
  return (
    <div data-theme="dark" className="elementa-root v-lab min-h-screen w-full p-6" style={{ background: 'var(--night-0)' }}>
      <div ref={host} />
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-center gap-3">
          <h1 className="el-logo text-2xl">Smoke</h1>
          <Link to="/games/elementa/visuals" className="el-btn el-btn--sm">
            Lab
          </Link>
          <button type="button" className="el-btn el-btn--sm el-btn--gold" disabled={running} onClick={() => run(buildQueue())}>
            Run all ({buildQueue().length})
          </button>
          <button type="button" className="el-btn el-btn--sm" onClick={() => (stop.current = true)}>
            Stop
          </button>
          <button
            type="button"
            className="el-btn el-btn--sm el-btn--danger"
            onClick={() => {
              save({ results: {}, queue: null })
              setState({ results: {}, queue: null })
            }}
          >
            Clear
          </button>
          <span id="smoke-status" className="text-base text-[var(--text-dim)]">
            {running ? 'running' : 'idle'} · queue {state.queue?.length ?? 0} · done {rows.length} · problems {bad.length}
          </span>
        </div>
        <pre id="smoke-out" className="max-h-[70vh] overflow-auto text-sm text-[var(--text-dim)]">
          {rows.map(([k, r]) => `${k}  ${r.err ?? `${r.steps}${r.broke ? ' BROKE' : ''} ${r.style} ox=${r.overflowX ? 'YES' : 'no'} anims=${r.anims} nodes=${r.nodes} small=${r.small} unl=${r.unlabeled} low=${r.lowContrast}${r.scene ? ' scene' : ''}${r.errors?.length ? ' ERR ' + r.errors.join(' | ') : ''}`}`).join('\n')}
        </pre>
      </div>
    </div>
  )
}
