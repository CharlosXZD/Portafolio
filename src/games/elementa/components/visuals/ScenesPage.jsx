import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../utils/perfProbe.js'
import { SCENE_IDS, SCENES } from '../../data/story.js'
import { ENDINGS } from '../../data/endings.js'
import StoryScene from '../StoryScene.jsx'
import { endingScene } from '../EndingStill.jsx'
import { VisualEnv } from './VisualEnv.jsx'
import '../../elementa.css'
import './visuals.css'

// The Scenes page of the Visual Lab (VISUALS.md V5): play any story scene in
// either language, with Reduced motion and the low-end tier switched on or off,
// scrub the timeline, read the frame time and the DOM size, and see a contact
// sheet of three frames of every scene. Like the rest of the Lab it changes
// this page only, never the saved settings. The cinematic code loads here on
// demand, as it does in the game.

const CinematicScene = lazy(() => import('./cinematic/CinematicScene.jsx'))
const IntroPlayer = lazy(() => import('./cinematic/IntroPlayer.jsx'))
const ContactSheet = lazy(() => import('./cinematic/ContactSheet.jsx'))

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Scenes', 'Escenas'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'The 36 story scenes and the ending cards, played by the cinematic player (V5). Pick one, switch language, Reduced motion or the low-end tier, and scrub the timeline. The switches change this page only.',
    'Las 36 escenas de historia y las cartas de final, reproducidas por el reproductor cinemático (V5). Elige una, cambia idioma, Movimiento reducido o la gama baja, y recorre la línea de tiempo. Los controles cambian solo esta página.',
  ),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  scene: L('Scene', 'Escena'),
  endings: L('Ending cards', 'Cartas de final'),
  frame: L('Frame', 'Cuadro'),
  play: L('Play', 'Reproducir'),
  pause: L('Pause', 'Pausa'),
  restart: L('Restart', 'Reiniciar'),
  measure: L('Measure frame time', 'Medir tiempo de cuadro'),
  nodes: L('DOM nodes in the picture', 'nodos DOM en la imagen'),
  commit: L('React commit', 'commit de React'),
  sweep: L('Sweep', 'Barrido'),
  lowNote: L(
    'On the low-end tier the game plays the plain scene (typed text on a backdrop) instead. Showing it here.',
    'En la gama baja el juego reproduce la escena sencilla (texto escrito sobre un fondo). Se muestra aquí.',
  ),
  playIntro: L('Play the intro', 'Reproducir el inicio'),
  sheet: L('Contact sheet', 'Hoja de contacto'),
  sheetShow: L('Show the contact sheet (111 frames)', 'Mostrar la hoja de contacto (111 cuadros)'),
  sheetHide: L('Hide the contact sheet', 'Ocultar la hoja de contacto'),
  none: L('Nothing measured yet.', 'Nada medido todavía.'),
}

// Yields to the event loop without a timer (timers are throttled in background tabs).
function nextTask() {
  return new Promise((resolve) => {
    const c = new MessageChannel()
    c.port1.onmessage = () => resolve()
    c.port2.postMessage(0)
  })
}

function Scenes() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' ? 'es' : params.get('lang') === 'en' ? 'en' : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [probed, setProbed] = useState(null)
  const [id, setId] = useState(() => (SCENE_IDS.includes(params.get('scene')) ? params.get('scene') : SCENE_IDS[0]))
  const [stats, setStats] = useState(null)
  const [nodes, setNodes] = useState(0)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [showIntro, setShowIntro] = useState(false)
  const [sheet, setSheet] = useState(params.get('sheet') === '1')
  const [sweep, setSweep] = useState(null)
  const [run, setRun] = useState(0)
  const [total, setTotal] = useState(1)
  const handle = useRef(null)
  const host = useRef(null)
  const tx = TEXT

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')
  const env = useMemo(() => ({ lang, reduced, quality, onEvent: null }), [lang, reduced, quality])
  const endingId = id.startsWith('ending:') ? id.slice(7) : null
  const endingScenes = useMemo(() => ENDINGS.map((e) => endingScene(e, lang === 'es' ? 'FINAL' : 'ENDING')), [lang])
  const scene = endingId ? endingScenes.find((s) => s.id === endingId) : SCENES[id]
  const playerOf = () => handle.current?.player?.current ?? null

  // Follow the player's frame for the scrubber, and count the picture's DOM nodes.
  useEffect(() => {
    setStats(null)
    setSweep(null)
    setFrame(0)
    setPlaying(!reduced)
    const t1 = setTimeout(() => {
      const p = playerOf()
      if (!p) return
      p.addEventListener('frameupdate', (e) => setFrame(e.detail.frame))
      p.addEventListener('play', () => setPlaying(true))
      p.addEventListener('pause', () => setPlaying(false))
      setNodes(host.current?.querySelectorAll('.v-cinematic__screen *').length ?? 0)
      setTotal(handle.current?.layout?.total ?? 1)
    }, 900)
    return () => clearTimeout(t1)
  }, [id, reduced, quality, run])

  const onStats = useCallback((s) => setStats(s), [])

  // Render the first 150 frames of the first page one by one, synchronously, and time each (the Browser pane throttles rAF, so real playback cannot be timed there).
  async function measure() {
    const p = playerOf()
    if (!p) return
    p.pause()
    const times = []
    for (let f = 0; f < 150; f++) {
      // A macrotask between frames, so React does not count them as one runaway update.
      await nextTask()
      const t0 = performance.now()
      flushSync(() => p.seekTo(f))
      times.push(performance.now() - t0)
    }
    times.sort((a, b) => a - b)
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    setSweep({ avg, p95: times[Math.floor(times.length * 0.95)], max: times[times.length - 1], n: times.length })
  }

  return (
    <VisualEnv.Provider value={env}>
      <div ref={host} data-theme="dark" data-font={settings.display.fontStyle} className="elementa-root v-lab relative min-h-screen w-full overflow-x-hidden" style={{ background: 'var(--night-0)' }}>
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="el-logo text-2xl">{tx.title[lang]}</h1>
              <p className="max-w-3xl text-base leading-snug text-[var(--text-dim)]">{tx.intro[lang]}</p>
            </div>
            <Link to="/games/elementa/visuals" className="el-btn el-btn--sm">
              {tx.back[lang]}
            </Link>
          </header>

          <section className="el-panel flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.language[lang]}</span>
              {['en', 'es'].map((l) => (
                <button key={l} type="button" className={`el-btn el-btn--sm ${lang === l ? 'el-btn--gold' : ''}`} onClick={() => setLang(l)} aria-pressed={lang === l}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
              <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
              {tx.reduced[lang]}
            </label>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.quality[lang]}</span>
              {[['auto', tx.auto], ['low', tx.forceLow], ['high', tx.forceHigh]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${qualityMode === k ? 'el-btn--gold' : ''}`} onClick={() => setQualityMode(k)} aria-pressed={qualityMode === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <button type="button" className="el-btn el-btn--sm" onClick={() => setShowIntro(true)}>
              {tx.playIntro[lang]}
            </button>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="el-label">{tx.scene[lang]}</span>
              {SCENE_IDS.map((s) => (
                <button key={s} type="button" className={`el-btn el-btn--sm ${id === s ? 'el-btn--gold' : ''}`} onClick={() => setId(s)} aria-pressed={id === s}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="el-label">{tx.endings[lang]}</span>
              {ENDINGS.map((e) => (
                <button key={e.id} type="button" className={`el-btn el-btn--sm ${id === `ending:${e.id}` ? 'el-btn--gold' : ''}`} onClick={() => setId(`ending:${e.id}`)} aria-pressed={id === `ending:${e.id}`}>
                  {e.id}
                </button>
              ))}
            </div>
          </section>

          <Suspense fallback={null}>
            {quality === 'low' && !endingId ? (
              <>
                <p className="text-center text-base text-[var(--text-dim)]">{tx.lowNote[lang]}</p>
                <StoryScene key={id} id={id} onDone={() => setQualityMode('high')} />
              </>
            ) : endingId ? (
              <EndingPreview key={`${id}-${lang}-${reduced}`} scene={scene} />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <CinematicScene key={`${id}-${reduced}-${run}`} ref={handle} id={id} inline onStats={onStats} onDone={() => setRun((r) => r + 1)} />
                <div className="el-panel el-panel--dark flex w-full max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
                  <button type="button" className="el-btn el-btn--sm" onClick={() => (playing ? playerOf()?.pause() : playerOf()?.play())} disabled={reduced}>
                    {playing ? tx.pause[lang] : tx.play[lang]}
                  </button>
                  <button type="button" className="el-btn el-btn--sm" onClick={() => setRun((r) => r + 1)}>
                    {tx.restart[lang]}
                  </button>
                  <label className="flex flex-1 items-center gap-2 text-base text-[var(--text-dim)]">
                    {tx.frame[lang]}
                    <input
                      type="range"
                      className="min-w-[160px] flex-1"
                      min="0"
                      max={Math.max(0, total - 1)}
                      value={frame}
                      onChange={(e) => {
                        const p = playerOf()
                        p?.pause()
                        p?.seekTo(Number(e.target.value))
                      }}
                    />
                    <b className="v-num">{frame}</b> / {total - 1}
                  </label>
                  <button type="button" className="el-btn el-btn--sm" onClick={measure}>
                    {tx.measure[lang]}
                  </button>
                </div>
                <div className="text-base text-[var(--text-dim)]">
                  {tx.nodes[lang]}: <b className="v-num text-[var(--gold-1)]">{nodes}</b> · {tx.commit[lang]}:{' '}
                  <b className="v-num">{stats ? `${stats.avgMs.toFixed(2)} ms (max ${stats.maxMs.toFixed(1)})` : tx.none[lang]}</b> · {tx.sweep[lang]}:{' '}
                  <b className="v-num">{sweep ? `${sweep.avg.toFixed(2)} ms avg, ${sweep.p95.toFixed(1)} p95, ${sweep.max.toFixed(1)} max (${sweep.n})` : tx.none[lang]}</b>
                </div>
              </div>
            )}
          </Suspense>

          <section className="flex flex-col gap-3">
            <button type="button" className="el-btn el-btn--sm w-fit" onClick={() => setSheet((v) => !v)}>
              {sheet ? tx.sheetHide[lang] : tx.sheetShow[lang]}
            </button>
            {sheet && (
              <Suspense fallback={null}>
                <ContactSheet lang={lang} onPick={setId} />
              </Suspense>
            )}
          </section>
        </main>
        {showIntro && (
          <Suspense fallback={null}>
            <IntroPlayer onDone={() => setShowIntro(false)} />
          </Suspense>
        )}
      </div>
    </VisualEnv.Provider>
  )
}

const CinematicCard = lazy(() => import('./cinematic/CinematicScene.jsx').then((m) => ({ default: m.CinematicCard })))
function EndingPreview({ scene }) {
  return (
    <div className="flex justify-center">
      <CinematicCard scene={scene} />
    </div>
  )
}

export default function ScenesPage() {
  return (
    <GameSettingsProvider>
      <Scenes />
    </GameSettingsProvider>
  )
}
