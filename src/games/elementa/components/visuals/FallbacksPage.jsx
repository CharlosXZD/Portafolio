import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { FORCE_KINDS, forcedKinds, setForcedKinds } from '../../utils/forceFail.js'
import { GAME_SPEEDS } from '../../utils/settings.js'
import { sampleState } from './map/mapSamples.js'
import ItemIcon from '../ItemIcon.jsx'
import ItemInspector from '../ItemInspector.jsx'
import RoadMap from '../RoadMap.jsx'
import StorySceneHost from '../StorySceneHost.jsx'
import EndingStill from '../EndingStill.jsx'
import GalleryLazy from '../GalleryLazy.jsx'
import SceneBackdrop from './SceneBackdrop.jsx'
import ShopPortrait from './ShopPortrait.jsx'
import { ENDINGS } from '../../data/endings.js'
import '../../elementa.css'
import './visuals.css'

// The Fallbacks page of the Visual Lab (VISUALS.md V8.3): switches that force each way the overhaul
// can degrade (a lazy chunk that will not load, the low-end tier, Reduced motion, Instant speed,
// the Legacy style, a very old save) and live probes of the parts that must still work. The
// switches are stored for the real game too (they are the same keys the game reads), so open the
// game from here to see the whole screen degrade. "Clear all" puts everything back.

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Fallbacks', 'Respaldos'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'Force each way the new visuals can degrade and check that the screen still works. Switches are saved and also apply to the real game until you clear them; the probes below reload after every change.',
    'Fuerza cada forma en que los visuales nuevos pueden degradarse y comprueba que la pantalla sigue funcionando. Los controles se guardan y también valen para el juego real hasta que los limpies; las pruebas de abajo se recargan tras cada cambio.',
  ),
  chunks: L('Lazy chunks that fail to load', 'Partes diferidas que fallan al cargar'),
  tier: L('Quality tier', 'Nivel de calidad'),
  auto: L('Auto', 'Auto'),
  low: L('Force low-end', 'Forzar gama baja'),
  high: L('Force high', 'Forzar alta'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  speed: L('Game speed', 'Velocidad del juego'),
  style: L('Visual style', 'Estilo visual'),
  styleNew: L('New', 'Nuevo'),
  styleLegacy: L('Legacy', 'Clásico'),
  clear: L('Clear all and reset', 'Limpiar todo y restablecer'),
  open: L('Open the game', 'Abrir el juego'),
  oldSave: L('Write a minimal pre-overhaul save (stats only, no profile fields added since)', 'Escribir un archivo mínimo anterior a la renovación (solo estadísticas, sin los campos añadidos después)'),
  oldDone: L('Saved as file 3 in the real game.', 'Guardado como archivo 3 en el juego real.'),
  webgl: L('No WebGL: the game itself never uses WebGL since V2.5 (items are 2D sprites). Only the Lab\'s item model pages do; nothing to force.', 'Sin WebGL: el juego ya no usa WebGL desde V2.5 (los objetos son sprites 2D). Solo lo usan las páginas de modelos de objetos del Laboratorio; no hay nada que forzar.'),
  probes: L('Live probes', 'Pruebas en vivo'),
  reload: L('Reload probes', 'Recargar pruebas'),
  probeItems: L('Items: the flat sprite when the sprite chunk fails', 'Objetos: el sprite plano si falla la parte de sprites'),
  probeKeeper: L('Keeper: the flat sprite when the rig chunk fails', 'Guardián: el sprite plano si falla la parte del rig'),
  probeRoom: L('Room: the old backdrop when the room chunk fails', 'Sala: el fondo anterior si falla la parte de salas'),
  probeMap: L('Road: the plain list of stops when the map chunk fails (picking still works)', 'Camino: la lista simple de paradas si falla el mapa (elegir sigue funcionando)'),
  probeEnding: L('Ending card: the old card when the cinematic chunk fails or on the low tier', 'Carta de final: la carta anterior si falla la parte cinemática o en gama baja'),
  probeScene: L('Story scene', 'Escena de historia'),
  probeGallery: L('Gallery', 'Galería'),
  play: L('Play scene', 'Reproducir escena'),
  picked: L('Picked stop:', 'Parada elegida:'),
}

function Fallbacks() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [lang, setLang] = useState(siteLang)
  const [forced, setForced] = useState(forcedKinds)
  const [quality, setQuality] = useState(() => localStorage.getItem('elementa-force-quality') ?? 'auto')
  const [run, setRun] = useState(0)
  const [scene, setScene] = useState(false)
  const [gallery, setGallery] = useState(false)
  const [picked, setPicked] = useState(null)
  const [saved, setSaved] = useState(false)
  const tx = TEXT
  const mapState = useMemo(() => sampleState({ round: 5, realm: 'elementa' }), [])

  function toggle(kind) {
    const next = forced.includes(kind) ? forced.filter((k) => k !== kind) : [...forced, kind]
    setForcedKinds(next)
    setForced(next)
    setRun((r) => r + 1)
  }
  function pickQuality(q) {
    try {
      if (q === 'auto') localStorage.removeItem('elementa-force-quality')
      else localStorage.setItem('elementa-force-quality', q)
    } catch {
      // storage blocked
    }
    setQuality(q)
    window.location.reload()
  }
  function clearAll() {
    setForcedKinds([])
    try {
      localStorage.removeItem('elementa-force-quality')
    } catch {
      // storage blocked
    }
    settings.setReducedMotion(false)
    settings.setGameSpeed('normal')
    settings.setVisualStyle('new')
    setForced([])
    setQuality('auto')
    window.location.reload()
  }
  function writeOldSave() {
    try {
      const files = JSON.parse(localStorage.getItem('elementa-files-v2') || '{}')
      files[2] = { createdAt: 1700000000000, updatedAt: 1700000000000, profile: { stats: { runs: 3, wins: 1, bestCast: 120, bestRound: 12 } }, run: null }
      localStorage.setItem('elementa-files-v2', JSON.stringify(files))
      setSaved(true)
    } catch {
      // storage blocked
    }
  }
  useEffect(() => setSaved(false), [run])

  const chip = (on, label, onClick) => (
    <button type="button" className={`el-btn el-btn--sm ${on ? 'el-btn--gold' : ''}`} onClick={onClick} aria-pressed={on}>
      {label}
    </button>
  )
  const end = ENDINGS[0]

  return (
    <div data-theme="dark" data-font={settings.display.fontStyle} className="elementa-root v-lab relative min-h-screen w-full overflow-x-hidden" style={{ background: 'var(--night-0)' }}>
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="el-logo text-2xl">{tx.title[lang]}</h1>
            <p className="max-w-3xl text-base leading-snug text-[var(--text-dim)]">{tx.intro[lang]}</p>
          </div>
          <div className="flex gap-2">
            {['en', 'es'].map((l) => chip(lang === l, l.toUpperCase(), () => setLang(l)))}
            <Link to="/games/elementa/visuals" className="el-btn el-btn--sm">
              {tx.back[lang]}
            </Link>
          </div>
        </header>

        <section className="el-panel flex flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="el-label">{tx.chunks[lang]}</span>
            {FORCE_KINDS.map((k) => (
              <span key={k}>{chip(forced.includes(k), k, () => toggle(k))}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="el-label">{tx.tier[lang]}</span>
            {[['auto', tx.auto], ['low', tx.low], ['high', tx.high]].map(([k, label]) => (
              <span key={k}>{chip(quality === k, label[lang], () => pickQuality(k))}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="el-label">{tx.reduced[lang]}</span>
            {chip(settings.reducedMotion, settings.reducedMotion ? 'on' : 'off', () => settings.setReducedMotion(!settings.reducedMotion))}
            <span className="el-label ml-4">{tx.speed[lang]}</span>
            {GAME_SPEEDS.map((s) => (
              <span key={s}>{chip(settings.gameSpeed === s, s, () => settings.setGameSpeed(s))}</span>
            ))}
            <span className="el-label ml-4">{tx.style[lang]}</span>
            {chip(settings.visualStyle === 'new', tx.styleNew[lang], () => settings.setVisualStyle('new'))}
            {chip(settings.visualStyle === 'legacy', tx.styleLegacy[lang], () => settings.setVisualStyle('legacy'))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="el-btn el-btn--sm" onClick={writeOldSave}>
              {tx.oldSave[lang]}
            </button>
            {saved && <span className="text-base text-[var(--gold-1)]">{tx.oldDone[lang]}</span>}
          </div>
          <p className="text-sm text-[var(--text-mute)]">{tx.webgl[lang]}</p>
          <div className="flex gap-2">
            <Link to="/games/elementa" className="el-btn el-btn--gold el-btn--sm">
              {tx.open[lang]}
            </Link>
            <button type="button" className="el-btn el-btn--sm el-btn--danger" onClick={clearAll}>
              {tx.clear[lang]}
            </button>
          </div>
        </section>

        <section className="el-panel el-panel--dark flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <h2 className="el-label">{tx.probes[lang]}</h2>
            <button type="button" className="el-btn el-btn--sm" onClick={() => setRun((r) => r + 1)}>
              {tx.reload[lang]}
            </button>
          </div>
          <div key={run} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-base text-[var(--text-dim)]">{tx.probeItems[lang]}</span>
              <div className="flex gap-3">
                <ItemIcon itemId="molten_core" size={64} glyph="?" />
                <ItemIcon itemId="rune_echo" size={64} glyph="?" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-base text-[var(--text-dim)]">{tx.probeKeeper[lang]}</span>
              <ShopPortrait id="tobb" stage />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-base text-[var(--text-dim)]">{tx.probeRoom[lang]}</span>
              <div className="relative h-40 overflow-hidden" style={{ border: '3px solid var(--ink)' }}>
                <SceneBackdrop state={{ phase: 'shop', shop: { type: 'market' } }} scene="shop" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-base text-[var(--text-dim)]">{tx.probeMap[lang]}</span>
              <RoadMap state={mapState} fromRound={5} toRound={8} onPick={(id) => setPicked(id)} width={220} rowHeight={48} nodeSize={30} expandable />
              {picked && <span className="text-base text-[var(--gold-1)]">{tx.picked[lang]} {picked}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-base text-[var(--text-dim)]">{tx.probeEnding[lang]}</span>
              <Suspense fallback={null}>
                <EndingStill ending={end} label="ENDING" fallback={<div className="el-panel p-3 text-base">{end.name[lang]}</div>} />
              </Suspense>
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="text-base text-[var(--text-dim)]">{tx.probeScene[lang]} / {tx.probeGallery[lang]}</span>
              <div className="flex gap-2">
                <button type="button" className="el-btn el-btn--sm" onClick={() => setScene(true)}>
                  {tx.play[lang]}
                </button>
                <button type="button" className="el-btn el-btn--sm" onClick={() => setGallery(true)}>
                  {tx.probeGallery[lang]}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {scene && <StorySceneHost id="crossing" onDone={() => setScene(false)} />}
      {gallery && (
        <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-[#07050c] px-4 py-10">
          <GalleryLazy slot={0} onBack={() => setGallery(false)} />
        </div>
      )}
    </div>
  )
}

export default function FallbacksPage() {
  return (
    <GameSettingsProvider>
      <Fallbacks />
    </GameSettingsProvider>
  )
}
