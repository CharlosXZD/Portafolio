import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../../utils/perfProbe.js'
import { VisualEnv } from '../VisualEnv.jsx'
import { useFps } from '../useFps.js'
import MapCanvas from './MapCanvas.jsx'
import MapFull from './MapFull.jsx'
import { MAP_REALMS, REALM_STYLE } from './mapModel.js'
import { SAMPLE_SCENARIOS, sampleState, withPick } from './mapSamples.js'
import { SHOP_TYPES } from '../../../data/shops.js'
import { ShopSign, Traveler, Flag } from './mapIcons.jsx'
import { SIGN_IDS } from './mapSigns.js'
import '../../../elementa.css'
import '../visuals.css'

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Maps', 'Mapas'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'The Road as a map (V6): every realm\'s paper, the gates between them, boss banners, fog, the traveler and the walk to a picked stop. Pick a scenario, then try the gestures on the big map. The switches change this page only.',
    'El Camino como mapa (V6): el papel de cada reino, las puertas entre ellos, estandartes de jefe, niebla, el viajero y el paseo hasta una parada elegida. Elige un escenario y prueba los gestos en el mapa grande. Los controles cambian solo esta página.',
  ),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  scenario: L('Scenario', 'Escenario'),
  realms: L('Every realm\'s paper (compact)', 'El papel de cada reino (compacto)'),
  signs: L('The signs', 'Las señales'),
  big: L('The map (panel variant): drag, Ctrl and wheel, pinch, arrows, + and -, C, 0', 'El mapa (variante panel): arrastra, Ctrl y rueda, pellizca, flechas, + y -, C, 0'),
  fullBtn: L('Open the full-screen map', 'Abrir el mapa a pantalla completa'),
  picked: L('Picked', 'Elegida'),
  none: L('nothing yet', 'nada aún'),
  fps: L('Frame rate', 'Cuadros por segundo'),
  worst: L('slowest frame', 'cuadro más lento'),
  walker: L('Pick a stop on a map that has choices to see the walker step along the trail.', 'Elige una parada en un mapa con opciones para ver al caminante avanzar por el sendero.'),
  figures: L('The traveler and the flag', 'El viajero y la bandera'),
}
const SCENARIO_NAME = {
  start: L('Round 1', 'Ronda 1'),
  early: L('Round 4', 'Ronda 4'),
  boss: L('A foretold boss ahead', 'Un jefe anunciado adelante'),
  late: L('Round 14, a stop picked', 'Ronda 14, una parada elegida'),
  firmament: L('The Firmament, round 19', 'El Firmamento, ronda 19'),
  firmamentPeek: L('The Firmament, a Warden peeked', 'El Firmamento, un Custodio espiado'),
  empyrean: L('The Empyrean (Split)', 'El Empíreo (División)'),
  pleroma: L('The Pleroma (Primordial)', 'El Pleroma (Primordial)'),
  meridian: L('The Meridian (Neutral)', 'El Meridiano (Neutral)'),
  unwritten: L('The door to the Unwritten', 'La puerta a Lo No Escrito'),
  clarity: L('Clarity: a longer sight', 'Claridad: más vista'),
}

function Maps() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' ? 'es' : params.get('lang') === 'en' ? 'en' : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [scenario, setScenario] = useState(() => (SAMPLE_SCENARIOS[params.get('scenario')] ? params.get('scenario') : 'late'))
  const [probed, setProbed] = useState(null)
  const [full, setFull] = useState(() => params.get('full') === '1')
  const fps = useFps()
  const tx = TEXT

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')
  const env = useMemo(() => ({ lang, reduced, quality, onEvent: null }), [lang, reduced, quality])
  const [state, setState] = useState(() => sampleState(SAMPLE_SCENARIOS[scenario]))
  useEffect(() => setState(sampleState(SAMPLE_SCENARIOS[scenario])), [scenario])
  const ref = useRef(null)
  const pick = (id) => setState((s) => withPick(s, id))
  // one compact map per realm, for the paper gallery
  const realmSamples = useMemo(
    () => [
      ['elementa', sampleState({ round: 6, realm: 'elementa' })],
      ['firmament', sampleState({ round: 21, realm: 'firmament', path: 'split' })],
      ['empyrean', sampleState({ round: 34, realm: 'realm3', path: 'split' })],
      ['pleroma', sampleState({ round: 34, realm: 'realm3', path: 'primordial' })],
      ['meridian', sampleState({ round: 34, realm: 'realm3', path: 'neutral' })],
      ['unwritten', sampleState({ round: 44, realm: 'realm3', path: 'split' })],
    ],
    [],
  )

  return (
    <VisualEnv.Provider value={env}>
      <div data-theme="dark" data-font={settings.display.fontStyle} className="elementa-root v-lab relative min-h-screen w-full overflow-x-hidden" style={{ background: 'var(--night-0)' }}>
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
            <div className="ml-auto text-base text-[var(--text-dim)]">
              {tx.fps[lang]}: <b className="v-num text-[var(--gold-1)]">{fps.fps}</b> · {tx.worst[lang]}: <b className="v-num">{fps.worst} ms</b>
            </div>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="el-label">{tx.scenario[lang]}</span>
              {Object.keys(SAMPLE_SCENARIOS).map((id) => (
                <button key={id} type="button" className={`el-btn el-btn--sm ${scenario === id ? 'el-btn--gold' : ''}`} onClick={() => setScenario(id)} aria-pressed={scenario === id}>
                  {SCENARIO_NAME[id][lang]}
                </button>
              ))}
            </div>
            <p className="text-base text-[var(--text-dim)]">{tx.walker[lang]}</p>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.big[lang]}</h2>
            <div className="mx-auto w-full max-w-[460px]" style={{ height: 560 }} data-testid="map-panel">
              <MapCanvas state={state} fromRound={1} toRound={Math.max(state.map.layers.length, state.round + 1)} width={340} rowHeight={104} nodeSize={56} variant="panel" onPick={pick} mapRef={ref} scrollToCurrent />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="el-btn el-btn--sm el-btn--gold" onClick={() => setFull(true)}>
                {tx.fullBtn[lang]}
              </button>
              <span className="text-base text-[var(--text-dim)]">
                {tx.picked[lang]}: <b className="v-num">{state.map.pendingId ?? tx.none[lang]}</b>
              </span>
            </div>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.realms[lang]}</h2>
            <div className="flex flex-wrap items-start justify-center gap-8">
              {realmSamples.map(([realm, st]) => (
                <div key={realm} className="flex flex-col items-center gap-2" data-testid={`realm-${realm}`}>
                  <span className="pixel-score text-[8px]" style={{ color: REALM_STYLE[realm].ink === '#4a3320' ? 'var(--gold-hi)' : REALM_STYLE[realm].ink }}>
                    {MAP_REALMS[realm].name[lang]}
                  </span>
                  <div style={{ boxShadow: '0 0 0 3px #120c1a, 0 0 0 6px var(--wood-2)' }}>
                    <MapCanvas
                      state={st}
                      fromRound={st.round - (st.round === 44 ? 3 : st.round === 34 || st.round === 21 ? 2 : 3)}
                      toRound={st.round + (st.round === 44 ? 2 : 3)}
                      width={220}
                      rowHeight={64}
                      nodeSize={40}
                      variant="compact"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.signs[lang]}</h2>
            <div className="flex flex-wrap gap-5">
              {Object.values(SHOP_TYPES).map((type) => (
                <div key={type.id} className="flex w-[84px] flex-col items-center gap-1 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#f2e6c8', boxShadow: `0 0 0 3px #120c1a, 0 0 0 5px ${type.color}` }}>
                    <ShopSign type={type.legendary && !SIGN_IDS.includes(type.id) ? 'crown' : type.id} color={type.color} size={36} />
                  </span>
                  <span className="text-sm" style={{ color: type.color }}>
                    {type.name[lang]}
                  </span>
                </div>
              ))}
            </div>
            <h2 className="el-label">{tx.figures[lang]}</h2>
            <div className="flex items-end gap-6">
              <Traveler size={60} />
              <Flag size={44} />
            </div>
          </section>
        </main>
        {full && <MapFull state={state} onPick={pick} onClose={() => setFull(false)} />}
      </div>
    </VisualEnv.Provider>
  )
}

export default function MapsPage() {
  return (
    <GameSettingsProvider>
      <Maps />
    </GameSettingsProvider>
  )
}
