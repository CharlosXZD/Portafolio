import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality, lowEndHint } from '../../utils/perfProbe.js'
import { ELEMENTS } from '../../data/elements.js'
import { VISUAL_IDS, IMAGE_BASE, clearImageOverrides, visualEntry } from '../../data/visualRegistry.js'
import KeeperSprite from '../KeeperSprite.jsx'
import PixelSprite from '../PixelSprite.jsx'
import Visual from './Visual.jsx'
import { useVisual } from './useVisual.js'
import { VisualEnv } from './VisualEnv.jsx'
import { useFps } from './useFps.js'
import '../../elementa.css'
import './visuals.css'

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Visual Lab', 'Laboratorio Visual'),
  back: L('Back to the game', 'Volver al juego'),
  intro: L(
    'Every new visual of the overhaul lives here first (VISUALS.md, phase V1). Nothing on this page is in the real game yet. The toggles below change this page only and never your saved settings.',
    'Todo lo visual nuevo vive primero aquí (VISUALS.md, fase V1). Nada de esta página está aún en el juego real. Los controles de abajo solo cambian esta página y nunca tus ajustes guardados.',
  ),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  fps: L('Frame rate', 'Cuadros por segundo'),
  worst: L('slowest frame', 'cuadro más lento'),
  device: L('Device', 'Dispositivo'),
  cores: L('cores', 'núcleos'),
  memory: L('GB memory', 'GB de memoria'),
  unknown: L('unknown', 'desconocido'),
  decision: L('Decision', 'Decisión'),
  registry: L('Registry', 'Registro'),
  registryBody: L(
    'Every asset is looked up by id. Drop a PNG, WebP or SVG named after the id into public/elementa/visuals/ and it replaces the code-made version with no code changes.',
    'Cada recurso se busca por id. Pon un PNG, WebP o SVG con el nombre del id en public/elementa/visuals/ y reemplaza la versión hecha con código sin cambiar código.',
  ),
  lookAgain: L('Look for files again', 'Buscar archivos otra vez'),
  id: L('id', 'id'),
  kind: L('kind', 'tipo'),
  now: L('showing', 'mostrando'),
  swapFile: L('swap file', 'archivo de reemplazo'),
  spike1: L('Spike 1: Remotion in the game', 'Prueba 1: Remotion en el juego'),
  spike1Body: L(
    'A 6 second title card (parallax stars, a bilingual line) played by the CinematicPlayer. It loads only when asked. Reduced motion shows the last frame.',
    'Una carta de título de 6 segundos (estrellas con paralaje, una línea bilingüe) reproducida por el CinematicPlayer. Solo carga cuando se pide. Movimiento reducido muestra el último cuadro.',
  ),
  loadCinematic: L('Load the cinematic', 'Cargar la cinemática'),
  loading: L('Loading...', 'Cargando...'),
  loadedIn: L('Loaded in', 'Cargó en'),
  commit: L('React commit per frame (avg / worst)', 'Render de React por cuadro (prom / peor)'),
  spike2: L('Spike 2: low-resolution 3D items', 'Prueba 2: objetos 3D de baja resolución'),
  spike2Body: L(
    'A gem, a flask and a d20 rendered once into cached 24 by 24 pixel atlases and shown at 96 pixels. Idle turn; hover to tilt and steer the angle. Beside each, today\'s sprite.',
    'Una gema, un frasco y un d20 renderizados una vez en atlas cacheados de 24 por 24 píxeles y mostrados a 96 píxeles. Giro en reposo; pasa el cursor para inclinar y dirigir el ángulo. Al lado, el sprite actual.',
  ),
  current: L('Today', 'Hoy'),
  cost: L('Cost per item', 'Costo por objeto'),
  build: L('build (ms)', 'creación (ms)'),
  atlas: L('atlas (KB)', 'atlas (KB)'),
  draw: L('frame copy (µs)', 'copia de cuadro (µs)'),
  tick: L('Idle-turn clock, script time per frame', 'Reloj del giro, tiempo de script por cuadro'),
  subs: L('items listening', 'objetos escuchando'),
  spike3: L('Spike 3: a layered SVG character', 'Prueba 3: un personaje SVG en capas'),
  spike3Body: L(
    'Brasa and Tobb rebuilt from the shipping 14 by 14 sprites as layers: idle breathing, a blink, a talking mouth, eyes that glance, a nod. At rest they match the sprite on the left.',
    'Brasa y Tobb reconstruidos desde los sprites de 14 por 14 como capas: respiración, parpadeo, boca que habla, ojos que miran, un asentimiento. En reposo coinciden con el sprite de la izquierda.',
  ),
  talk: L('Talk', 'Hablar'),
  stopTalk: L('Stop talking', 'Dejar de hablar'),
  nod: L('Nod', 'Asentir'),
  lookLeft: L('Look left', 'Mirar a la izquierda'),
  lookCenter: L('Look ahead', 'Mirar al frente'),
  lookRight: L('Look right', 'Mirar a la derecha'),
  markup: L('Rig markup', 'Marcado del rig'),
  spike4: L('The Market, lived in', 'El Mercado, habitado'),
  spike4Body: L(
    'The feel test every later shop is measured against. Hover an item, pick it, buy it. Tobb glances, answers and nods; the item flies to the counter, the bell rings and a clean gap stays on the shelf. A fox sleeps in the sun; dust drifts; the lanterns flicker.',
    'La prueba de ambiente con la que se medirán todas las tiendas. Pasa el cursor sobre un objeto, elígelo, cómpralo. Tobb mira, responde y asiente; el objeto vuela al mostrador, suena la campana y queda un hueco limpio en el estante. Un zorro duerme al sol; flota el polvo; los faroles titilan.',
  ),
  hooks: L('Sound hooks (names only, no audio)', 'Ganchos de sonido (solo nombres, sin audio)'),
  noHooks: L('Interact with the room to see them.', 'Interactúa con la sala para verlos.'),
}

function Switch({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  )
}

function RegistryRow({ id, lang }) {
  const { entry, kind, src, status } = useVisual(id)
  return (
    <tr>
      <td>
        <code>{id}</code>
      </td>
      <td>{entry?.kind}</td>
      <td className="v-num">
        {kind}
        {src ? ' (file)' : ''}
        {status === 'checking' ? ' ...' : ''}
      </td>
      <td>
        <code>
          {IMAGE_BASE}
          {id}.png
        </code>
      </td>
      <td className="sr-only">{entry?.label?.[lang]}</td>
    </tr>
  )
}

const ITEMS = ['spike.relic.ember_heart', 'spike.consumable.tide_flask', 'spike.die.fire_d20']

function ItemsSpike({ lang, tx }) {
  const [stats, setStats] = useState([])
  const [draw, setDraw] = useState(null)
  const [tick, setTick] = useState(null)
  useEffect(() => {
    let live = true
    let timer = 0
    Promise.all([import('./three/itemAtlas.js'), import('./three/ticker.js')]).then(([mod, ticker]) => {
      const poll = () => {
        if (!live) return
        setStats(mod.getAtlasStats())
        setTick(ticker.tickerStats())
        timer = setTimeout(poll, 600)
      }
      poll()
      setTimeout(
        () => mod.benchmarkDraw({ shape: 'gem', color: ELEMENTS.fire.color, rarity: 'uncommon' }).then((us) => live && setDraw(us)),
        900,
      )
    })
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [])
  const entries = ITEMS.map((id) => visualEntry(id))
  return (
    <>
      <div className="v-stage">
        {entries.map((e, i) => (
          <div key={ITEMS[i]} className="v-cell">
            <div className="flex items-end gap-4">
              <Visual id={ITEMS[i]} scale={4} native={24} float />
              <PixelSprite {...e.fallbackSprite} size={48} />
            </div>
            <span>{e.label[lang]}</span>
            <span className="text-[var(--text-mute)]">
              {tx.current[lang]}: 12 px sprite
            </span>
          </div>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th>{tx.cost[lang]}</th>
            <th>{tx.build[lang]}</th>
            <th>{tx.atlas[lang]}</th>
            <th>{tx.draw[lang]}</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s, i) => (
            <tr key={s.key}>
              <td>
                <code>{s.key}</code>
              </td>
              <td className="v-num">{s.ms.toFixed(1)}</td>
              <td className="v-num">{(s.bytes / 1024).toFixed(0)}</td>
              <td className="v-num">{i === 0 && draw != null ? draw.toFixed(1) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tick && (
        <p className="text-base text-[var(--text-dim)]">
          {tx.tick[lang]}: <b className="v-num">{tick.avgUs.toFixed(1)} µs</b> ({tick.subscribers} {tx.subs[lang]})
        </p>
      )}
    </>
  )
}

function RigSpike({ lang, tx }) {
  const [talking, setTalking] = useState(false)
  const [look, setLook] = useState('center')
  const [nod, setNod] = useState(0)
  const [bytes, setBytes] = useState(null)
  const holder = useRef(null)
  useEffect(() => {
    const id = setTimeout(() => {
      const svg = holder.current?.querySelector('svg.v-rig')
      if (svg) setBytes(new Blob([svg.outerHTML]).size)
    }, 400)
    return () => clearTimeout(id)
  }, [])
  return (
    <>
      <div className="v-stage" ref={holder}>
        <div className="v-cell">
          <KeeperSprite id="brasa" size={140} />
          <span>{tx.current[lang]}</span>
        </div>
        <div className="v-cell">
          <Visual id="rig.keeper.brasa" scale={10} native={14} talking={talking} look={look} react={nod ? 'nod' : null} reactKey={nod} />
          <span>Brasa</span>
        </div>
        <div className="v-cell">
          <Visual id="rig.keeper.tobb" scale={10} native={14} talking={talking} look={look} react={nod ? 'nod' : null} reactKey={nod} />
          <span>Tobb</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="el-btn el-btn--sm" onClick={() => setTalking((v) => !v)} aria-pressed={talking}>
          {talking ? tx.stopTalk[lang] : tx.talk[lang]}
        </button>
        <button type="button" className="el-btn el-btn--sm" onClick={() => setNod((n) => n + 1)}>
          {tx.nod[lang]}
        </button>
        <button type="button" className="el-btn el-btn--sm" onClick={() => setLook('left')}>
          {tx.lookLeft[lang]}
        </button>
        <button type="button" className="el-btn el-btn--sm" onClick={() => setLook('center')}>
          {tx.lookCenter[lang]}
        </button>
        <button type="button" className="el-btn el-btn--sm" onClick={() => setLook('right')}>
          {tx.lookRight[lang]}
        </button>
        {bytes != null && (
          <span className="text-[var(--text-dim)]">
            {tx.markup[lang]}: <b className="v-num">{(bytes / 1024).toFixed(1)} KB</b>
          </span>
        )}
      </div>
    </>
  )
}

function CinematicSpike({ lang, tx }) {
  const [phase, setPhase] = useState('idle')
  const [loadMs, setLoadMs] = useState(null)
  const [stats, setStats] = useState(null)
  async function load() {
    setPhase('loading')
    const t0 = performance.now()
    await visualEntry('cinematic.title_card').load()
    setLoadMs(performance.now() - t0)
    setPhase('ready')
  }
  return (
    <div className="flex flex-col gap-3">
      {phase !== 'ready' ? (
        <div>
          <button type="button" className="el-btn el-btn--gold" onClick={load} disabled={phase === 'loading'}>
            {phase === 'loading' ? tx.loading[lang] : tx.loadCinematic[lang]}
          </button>
        </div>
      ) : (
        <>
          <div className="mx-auto w-full max-w-[960px]">
            <Visual id="cinematic.title_card" onStats={setStats} />
          </div>
          <p className="text-base text-[var(--text-dim)]">
            {tx.loadedIn[lang]} <b className="v-num">{loadMs?.toFixed(0)} ms</b>
            {stats && (
              <>
                {' · '}
                {tx.commit[lang]}: <b className="v-num">{stats.avgMs.toFixed(2)}</b> / <b className="v-num">{stats.maxMs.toFixed(1)} ms</b>
              </>
            )}
          </p>
        </>
      )}
    </div>
  )
}

function Section({ title, children, body }) {
  return (
    <section className="el-panel el-panel--dark flex flex-col gap-4 p-4 md:p-5">
      <h2 className="el-label">{title}</h2>
      {body && <p className="max-w-3xl text-base leading-snug text-[var(--text-dim)]">{body}</p>}
      {children}
    </section>
  )
}

function Lab() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' || params.get('lang') === 'en' ? params.get('lang') : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [probed, setProbed] = useState(null)
  const [log, setLog] = useState([])
  const fps = useFps()
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined
  const memory = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined
  const tx = TEXT

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')

  const onEvent = useCallback((name, data) => {
    setLog((l) => [{ n: l.length ? l[0].n + 1 : 1, name, data }, ...l].slice(0, 40))
  }, [])
  const env = useMemo(() => ({ lang, reduced, quality, onEvent }), [lang, reduced, quality, onEvent])

  const [lookKey, setLookKey] = useState(0)
  const lookAgain = () => {
    clearImageOverrides()
    setLookKey((k) => k + 1)
  }

  return (
    <VisualEnv.Provider value={env}>
      <div
        data-theme="dark"
        data-font={settings.display.fontStyle}
        className="elementa-root v-lab relative min-h-screen w-full overflow-x-hidden"
        style={{ background: 'var(--night-0)' }}
      >
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="el-logo text-2xl">{tx.title[lang]}</h1>
              <p className="max-w-2xl text-base leading-snug text-[var(--text-dim)]">{tx.intro[lang]}</p>
            </div>
            <Link to="/games/elementa" className="el-btn el-btn--sm">
              {tx.back[lang]}
            </Link>
          </header>

          <section className="el-panel flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3" aria-label="Controls">
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.language[lang]}</span>
              <button type="button" className={`el-btn el-btn--sm ${lang === 'en' ? 'el-btn--gold' : ''}`} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>
                EN
              </button>
              <button type="button" className={`el-btn el-btn--sm ${lang === 'es' ? 'el-btn--gold' : ''}`} onClick={() => setLang('es')} aria-pressed={lang === 'es'}>
                ES
              </button>
            </div>
            <Switch checked={reduced} onChange={setReduced}>
              {tx.reduced[lang]}
            </Switch>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.quality[lang]}</span>
              {[
                ['auto', tx.auto],
                ['low', tx.forceLow],
                ['high', tx.forceHigh],
              ].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${qualityMode === k ? 'el-btn--gold' : ''}`} onClick={() => setQualityMode(k)} aria-pressed={qualityMode === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-base text-[var(--text-dim)]">
              <span>
                {tx.fps[lang]}: <b className="v-num text-[var(--gold-1)]">{fps.fps}</b> · {tx.worst[lang]}: <b className="v-num">{fps.worst} ms</b>
              </span>
              <span>
                {tx.device[lang]}: {cores ?? tx.unknown[lang]} {tx.cores[lang]}, {memory ?? tx.unknown[lang]} {tx.memory[lang]}
              </span>
              <span>
                {tx.decision[lang]}: <b className="v-num">{quality}</b>
                {lowEndHint() ? ' (hint)' : ''}
              </span>
            </div>
          </section>

          <Section title={tx.registry[lang]} body={tx.registryBody[lang]}>
            <div className="overflow-x-auto">
              <table key={lookKey}>
                <thead>
                  <tr>
                    <th>{tx.id[lang]}</th>
                    <th>{tx.kind[lang]}</th>
                    <th>{tx.now[lang]}</th>
                    <th>{tx.swapFile[lang]}</th>
                  </tr>
                </thead>
                <tbody>
                  {VISUAL_IDS.map((id) => (
                    <RegistryRow key={id} id={id} lang={lang} />
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <button type="button" className="el-btn el-btn--sm" onClick={lookAgain}>
                {tx.lookAgain[lang]}
              </button>
            </div>
          </Section>

          <Section title={tx.spike1[lang]} body={tx.spike1Body[lang]}>
            <CinematicSpike lang={lang} tx={tx} />
          </Section>

          <Section title={tx.spike2[lang]} body={tx.spike2Body[lang]}>
            <ItemsSpike lang={lang} tx={tx} />
          </Section>

          <Section title={tx.spike3[lang]} body={tx.spike3Body[lang]}>
            <RigSpike lang={lang} tx={tx} />
          </Section>

          <Section title={tx.spike4[lang]} body={tx.spike4Body[lang]}>
            <Visual id="room.market" />
            <div>
              <h3 className="el-label mb-2">{tx.hooks[lang]}</h3>
              <ul className="v-log" aria-live="off">
                {log.length === 0 && <li>{tx.noHooks[lang]}</li>}
                {log.map((e) => (
                  <li key={e.n}>
                    <b className="v-num">{e.n}</b> <code>{e.name}</code> {e.data ? <span>{String(e.data)}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </main>
      </div>
    </VisualEnv.Provider>
  )
}

export default function VisualsLabPage() {
  return (
    <GameSettingsProvider>
      <Lab />
    </GameSettingsProvider>
  )
}
