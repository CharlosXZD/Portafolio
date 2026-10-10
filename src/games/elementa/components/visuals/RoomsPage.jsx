import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../utils/perfProbe.js'
import { KEEPERS } from '../../data/keepers.js'
import { VisualEnv } from './VisualEnv.jsx'
import { useFps } from './useFps.js'
import RoomStage from './room/RoomStage.jsx'
import KeeperRig from './rigs/KeeperRig.jsx'
import { ROOM_IDS, ROOM_INFO, REALMS } from './room/rooms.js'
import { ROOM_EVENTS, emitRoom, onRoom } from './room/roomBus.js'
import '../../elementa.css'
import './visuals.css'

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Rooms', 'Salas'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'Every shop room and scene backdrop (V3), in the shared 320 by 180 art box. Pick a room and a realm; the keeper reacts to the events the shop emits (no sound is played, these are only the hooks). The switches change this page only.',
    'Cada sala de tienda y fondo de escena (V3), en la caja de arte compartida de 320 por 180. Elige una sala y un reino; el guardián reacciona a los eventos que emite la tienda (no suena nada, son solo los ganchos). Los controles cambian solo esta página.',
  ),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  room: L('Room', 'Sala'),
  realm: L('Realm', 'Reino'),
  keeper: L('Keeper in the room', 'Guardián en la sala'),
  events: L('Events', 'Eventos'),
  anims: L('running animations', 'animaciones activas'),
  nodes: L('DOM nodes', 'nodos DOM'),
  fps: L('Frame rate', 'Cuadros por segundo'),
  worst: L('slowest frame', 'cuadro más lento'),
  log: L('Event hooks (names only, no audio)', 'Ganchos de eventos (solo nombres, sin audio)'),
  none: L('Press an event to see it.', 'Pulsa un evento para verlo.'),
}
const REALM_NAME = {
  en: { elementa: 'Elementa', firmament: 'Firmament', empyrean: 'Empyrean', pleroma: 'Pleroma', meridian: 'Meridian' },
  es: { elementa: 'Elementa', firmament: 'Firmamento', empyrean: 'Empíreo', pleroma: 'Pleroma', meridian: 'Meridiano' },
}
const EVENT_NAME = {
  en: { welcome: 'Welcome', hover: 'Hover', pick: 'Pick', buy: 'Buy', bell: 'Bell', broke: "Can't afford", restock: 'Restock', sell: 'Sell', leave: 'Leave' },
  es: { welcome: 'Bienvenida', hover: 'Cursor', pick: 'Elegir', buy: 'Comprar', bell: 'Campana', broke: 'Sin fondos', restock: 'Reabastecer', sell: 'Vender', leave: 'Salir' },
}

function Rooms() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' ? 'es' : params.get('lang') === 'en' ? 'en' : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [room, setRoom] = useState(() => (ROOM_IDS.includes(params.get('room')) ? params.get('room') : 'market'))
  const [realm, setRealm] = useState(() => (REALMS.includes(params.get('realm')) ? params.get('realm') : 'elementa'))
  const [meter, setMeter] = useState(() => Number(params.get('meter') ?? 0.5))
  const [withKeeper, setWithKeeper] = useState(() => params.get('keeper') !== '0')
  const [probed, setProbed] = useState(null)
  const [anims, setAnims] = useState(0)
  const [nodes, setNodes] = useState(0)
  const [log, setLog] = useState([])
  const [talking, setTalking] = useState(false)
  const [look, setLook] = useState('center')
  const [beat, setBeat] = useState({ type: null, key: 0 })
  const fps = useFps()
  const host = useRef(null)
  const tx = TEXT
  const info = ROOM_INFO[room]

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')
  const onEvent = useCallback((name, data) => setLog((l) => [{ n: l.length ? l[0].n + 1 : 1, name, data }, ...l].slice(0, 30)), [])
  const env = useMemo(() => ({ lang, reduced, quality, onEvent }), [lang, reduced, quality, onEvent])

  // Count the DOM nodes in the room whenever it changes.
  useEffect(() => {
    const id = setTimeout(() => setNodes(host.current?.querySelectorAll('.r-root *').length ?? 0), 800)
    return () => clearTimeout(id)
  }, [room, realm, withKeeper, quality, reduced])

  // The room's keeper reacts to the bus, the same way the shop's portrait does.
  useEffect(
    () =>
      onRoom((name) => {
        if (reduced) return
        const play = (type, ms) => {
          setBeat((b) => ({ type, key: b.key + 1 }))
          if (ms) {
            setTalking(true)
            setTimeout(() => setTalking(false), ms)
          }
        }
        if (name === 'welcome') play('nod', 1800)
        else if (name === 'pick') {
          setLook('left')
          play('nod')
          setTimeout(() => setLook('center'), 1400)
        } else if (name === 'buy') play('hop', 900)
        else if (name === 'broke') play('shake')
        else if (name === 'sell') play('nod', 500)
        else if (name === 'restock') play('hop', 600)
        else if (name === 'leave') {
          setLook('right')
          play('nod')
        }
        onEvent(name)
      }),
    [reduced, onEvent],
  )

  const keeperId = info.keeper
  const keeper = withKeeper && keeperId ? { id: keeperId, props: { talking, look, react: beat.type, reactKey: beat.key } } : null

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
            <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
              <input type="checkbox" checked={withKeeper} onChange={(e) => setWithKeeper(e.target.checked)} />
              {tx.keeper[lang]}
            </label>
            {room === 'pantry' && (
              <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
                {lang === 'es' ? 'Medidor de Mote' : "Mote's meter"}
                <input type="range" min="0" max="1" step="0.05" value={meter} onChange={(e) => setMeter(Number(e.target.value))} />
              </label>
            )}
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.quality[lang]}</span>
              {[['auto', tx.auto], ['low', tx.forceLow], ['high', tx.forceHigh]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${qualityMode === k ? 'el-btn--gold' : ''}`} onClick={() => setQualityMode(k)} aria-pressed={qualityMode === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <div className="ml-auto text-base text-[var(--text-dim)]">
              {tx.fps[lang]}: <b className="v-num text-[var(--gold-1)]">{fps.fps}</b> · {tx.worst[lang]}: <b className="v-num">{fps.worst} ms</b> · <b className="v-num">{anims}</b> {tx.anims[lang]} · <b className="v-num">{nodes}</b> {tx.nodes[lang]}
            </div>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="el-label">{tx.room[lang]}</span>
              {ROOM_IDS.map((id) => (
                <button key={id} type="button" className={`el-btn el-btn--sm ${room === id ? 'el-btn--gold' : ''}`} onClick={() => setRoom(id)} aria-pressed={room === id}>
                  {ROOM_INFO[id].label[lang]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="el-label">{tx.realm[lang]}</span>
              {REALMS.map((r) => (
                <button key={r} type="button" className={`el-btn el-btn--sm ${realm === r ? 'el-btn--gold' : ''}`} onClick={() => setRealm(r)} aria-pressed={realm === r}>
                  {REALM_NAME[lang][r]}
                </button>
              ))}
            </div>
          </section>

          <div className="mx-auto w-full max-w-[960px]" style={{ border: '3px solid var(--ink)', boxShadow: '0 0 0 3px var(--wood-2), 6px 6px 0 3px rgba(0,0,0,0.5)' }}>
            <RoomStage roomId={room} realm={realm} meter={meter} framed dim={0} keeper={keeper} onCount={setAnims} />
          </div>

          {keeperId && (
            <p className="text-center text-base text-[var(--text-dim)]">
              {KEEPERS[keeperId]?.name?.[lang] ?? keeperId}: {KEEPERS[keeperId]?.title?.[lang] ?? ''}
            </p>
          )}

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.events[lang]}</h2>
            <div className="flex flex-wrap gap-2">
              {ROOM_EVENTS.map((e) => (
                <button key={e} type="button" className="el-btn el-btn--sm" onClick={() => emitRoom(e, room)}>
                  {EVENT_NAME[lang][e]}
                </button>
              ))}
            </div>
            <h3 className="el-label">{tx.log[lang]}</h3>
            <ul className="v-log">
              {log.length === 0 && <li>{tx.none[lang]}</li>}
              {log.map((e) => (
                <li key={e.n}>
                  <b className="v-num">{e.n}</b> <code>{e.name}</code>
                </li>
              ))}
            </ul>
          </section>
          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{lang === 'es' ? 'Los guardianes' : 'The keepers'}</h2>
            <div className="flex flex-wrap items-end gap-6">
              {['tobb', 'vessa', 'curator', 'brasa', 'nix', 'aeris', 'atlas', 'horologist', 'seren', 'mote', 'vesper'].map((id) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <KeeperRig id={id} size={84} talking={talking} look={look} react={beat.type} reactKey={beat.key} />
                  <span className="pixel-score text-[8px] text-[var(--gold-hi)]">{KEEPERS[id]?.name?.[lang] ?? id}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </VisualEnv.Provider>
  )
}

export default function RoomsPage() {
  return (
    <GameSettingsProvider>
      <Rooms />
    </GameSettingsProvider>
  )
}
