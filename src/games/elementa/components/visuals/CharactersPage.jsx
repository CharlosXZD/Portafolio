import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../utils/perfProbe.js'
import { BOSS_COLORS } from '../../data/bossModifiers.js'
import BossAvatar from '../BossAvatar.jsx'
import { VisualEnv } from './VisualEnv.jsx'
import CharacterRig from './rigs/CharacterRig.jsx'
import { CHAR_SPRITES, spriteProblems } from './rigs/charData.js'
import { REACTION_NAMES } from './rigs/charPose.js'
import '../../elementa.css'
import './visuals.css'

// The Characters page of the Visual Lab (VISUALS.md V7): every rig (Pip, the Arbiter, the four
// gods, the Primordial, You, and every boss avatar), every reaction, talking, a silhouette check
// and the old sprite beside the new one. Like the rest of the Lab it changes this page only.

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Characters', 'Personajes'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'Every character rig (V7): idle, blink, talking and the reactions the game emits, in whole-pixel steps. Press a reaction to play it on every rig at once (a rig ignores reactions that are not its own kind only in the game; here they all play). The switches change this page only.',
    'Cada rig de personaje (V7): reposo, parpadeo, hablar y las reacciones que emite el juego, en pasos de píxel entero. Pulsa una reacción para reproducirla en todos los rigs a la vez (en el juego un rig solo usa las suyas; aquí todas funcionan). Los controles cambian solo esta página.',
  ),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  talk: L('Talking', 'Hablando'),
  silhouette: L('Silhouette check', 'Prueba de silueta'),
  reactions: L('Reactions', 'Reacciones'),
  sprites: L('Sprites and hand', 'Sprites y mano'),
  bosses: L('Boss avatars', 'Avatares de jefe'),
  compare: L('Palette check: the old sprite (left) and the rig at rest (right)', 'Prueba de paleta: el sprite anterior (izquierda) y el rig en reposo (derecha)'),
  nodes: L('DOM nodes', 'nodos DOM'),
  rigs: L('rigs', 'rigs'),
  bad: L('Sprite problems', 'Problemas de sprites'),
}
const NAMES = { pip: 'Pip', arbiter: 'Arbiter', gaea: 'Gaea', ognen: 'Ognen', varuna: 'Varuna', zephyr: 'Zephyr', primordial: 'Primordial', you: 'You' }
const FEATURED = ['pip', 'arbiter', 'gaea', 'ognen', 'varuna', 'zephyr', 'primordial', 'you']
const BOSS_IDS = Object.keys(BOSS_COLORS).filter((id) => !FEATURED.includes(id))

function Characters() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' ? 'es' : params.get('lang') === 'en' ? 'en' : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [probed, setProbed] = useState(null)
  const [talking, setTalking] = useState(true)
  const [silhouette, setSilhouette] = useState(false)
  const [react, setReact] = useState({ name: null, key: 0 })
  const [nodes, setNodes] = useState(0)
  const host = useRef(null)
  const tx = TEXT

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')
  const env = useMemo(() => ({ lang, reduced, quality, onEvent: null }), [lang, reduced, quality])
  useEffect(() => {
    const id = setTimeout(() => setNodes(host.current?.querySelectorAll('.v-chars *').length ?? 0), 600)
    return () => clearTimeout(id)
  }, [quality, reduced])
  const problems = spriteProblems()

  const rig = (id, size = 112) => (
    <div key={id} className="flex flex-col items-center gap-1">
      <CharacterRig id={id} size={size} react={react.name} reactKey={react.key} talking={talking} silhouette={silhouette} />
      <span className="pixel-score text-[8px] text-[var(--gold-hi)]">{NAMES[id] ?? id}</span>
    </div>
  )

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
              <input type="checkbox" checked={talking} onChange={(e) => setTalking(e.target.checked)} />
              {tx.talk[lang]}
            </label>
            <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
              <input type="checkbox" checked={silhouette} onChange={(e) => setSilhouette(e.target.checked)} />
              {tx.silhouette[lang]}
            </label>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.quality[lang]}</span>
              {[['auto', tx.auto], ['low', tx.forceLow], ['high', tx.forceHigh]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${qualityMode === k ? 'el-btn--gold' : ''}`} onClick={() => setQualityMode(k)} aria-pressed={qualityMode === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <span className="ml-auto text-base text-[var(--text-dim)]">
              <b className="v-num text-[var(--gold-1)]">{FEATURED.length + BOSS_IDS.length}</b> {tx.rigs[lang]} · <b className="v-num">{nodes}</b> {tx.nodes[lang]}
              {problems.length > 0 && <span className="text-[var(--danger)]"> · {tx.bad[lang]}: {problems.join('; ')}</span>}
            </span>
          </section>

          <section className="el-panel el-panel--dark flex flex-wrap items-center gap-2 p-4">
            <span className="el-label">{tx.reactions[lang]}</span>
            {REACTION_NAMES.map((n) => (
              <button key={n} type="button" className="el-btn el-btn--sm" onClick={() => setReact((r) => ({ name: n, key: r.key + 1 }))}>
                {n}
              </button>
            ))}
          </section>

          <section className="v-chars el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.sprites[lang]}</h2>
            <div className="flex flex-wrap items-end gap-8">{FEATURED.map((id) => rig(id, 128))}</div>
          </section>

          <section className="v-chars el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.bosses[lang]}</h2>
            <div className="flex flex-wrap items-end gap-6">{BOSS_IDS.map((id) => rig(id, 84))}</div>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <h2 className="el-label">{tx.compare[lang]}</h2>
            <div className="flex flex-wrap items-end gap-8">
              {['gaea', 'ognen', 'varuna', 'zephyr', 'primordial', 'you', 'pip'].map((id) => (
                <div key={id} className="flex flex-col items-center gap-1">
                  <span className="flex items-end gap-2">
                    <BossAvatar id={id} size={84} />
                    <CharacterRig id={id} size={84} still />
                  </span>
                  <span className="pixel-score text-[8px] text-[var(--gold-hi)]">{NAMES[id]}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--text-mute)]">{Object.keys(CHAR_SPRITES).join(', ')}</p>
          </section>
        </main>
      </div>
    </VisualEnv.Provider>
  )
}

export default function CharactersPage() {
  return (
    <GameSettingsProvider>
      <Characters />
    </GameSettingsProvider>
  )
}
