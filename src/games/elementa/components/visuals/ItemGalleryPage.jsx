import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../utils/perfProbe.js'
import { RARITY_ORDER, RARITY_GLOW, RELICS } from '../../data/relics.js'
import { CONSUMABLES } from '../../data/consumables.js'
import { ITEM_ART, SPRITES } from '../../data/sprites.js'
import { relicDescriptor, consumableDescriptor } from '../../data/itemDescriptors.js'
import PixelSprite from '../PixelSprite.jsx'
import ItemModel from './ItemModel.jsx'
import { VisualEnv } from './VisualEnv.jsx'
import { findNearDuplicates } from './itemCheck.js'
import { getAtlasStats } from './three/itemAtlas.js'
import { MODEL_IDS } from '../../data/itemModels.js'
import '../../elementa.css'
import './visuals.css'

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Item gallery', 'Galería de objetos'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'Every relic and consumable as a 3D model (V2), beside the flat sprite it replaces. Dice are not here: on the table they keep their shaped sprite, element color, symbol and effect.',
    'Cada reliquia y consumible como modelo 3D (V2), junto al sprite plano al que reemplaza. Los dados no están aquí: en la mesa conservan su sprite con forma, color de elemento, símbolo y efecto.',
  ),
  group: L('Group by', 'Agrupar por'),
  byRarity: L('Rarity', 'Rareza'),
  byElement: L('Element', 'Elemento'),
  byKind: L('Kind', 'Tipo'),
  size: L('Size', 'Tamaño'),
  turn: L('Idle turn', 'Giro en reposo'),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  buildAll: L('Build all models', 'Construir todos los modelos'),
  building: L('Building...', 'Construyendo...'),
  built: L('Built', 'Construidos'),
  total: L('total build time', 'tiempo total de construcción'),
  perItem: L('per item (avg / worst)', 'por objeto (prom / peor)'),
  memory: L('atlas memory', 'memoria de atlas'),
  check: L('Run the uniqueness check', 'Ejecutar la verificación de unicidad'),
  checking: L('Comparing...', 'Comparando...'),
  checkResult: L('Compared', 'Comparados'),
  noDupes: L('No pair is too alike.', 'Ningún par es demasiado parecido.'),
  dupes: L('Pairs that look too alike (smaller means more alike)', 'Pares demasiado parecidos (menor significa más parecidos)'),
  fallbacks: L('Items that fell back to the old sprite', 'Objetos que usan el sprite anterior'),
  none: L('none', 'ninguno'),
  neutral: L('Neutral', 'Neutro'),
  relics: L('Relics', 'Reliquias'),
  consumables: L('Consumables', 'Consumibles'),
  before: L('Before', 'Antes'),
  after: L('After', 'Después'),
}
const RARITY_NAME = {
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic' },
  es: { common: 'Común', uncommon: 'Poco común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario', mythic: 'Mítico' },
}
const ELEMENT_ORDER = ['fire', 'water', 'earth', 'air', null]
const ELEMENT_NAME = { en: { fire: 'Fire', water: 'Water', earth: 'Earth', air: 'Air', none: 'Neutral' }, es: { fire: 'Fuego', water: 'Agua', earth: 'Tierra', air: 'Aire', none: 'Neutro' } }

const ALL = [...RELICS, ...CONSUMABLES].filter((i) => MODEL_IDS.includes(i.id))

function Cell({ item, scale, motion, desc }) {
  const art = ITEM_ART[item.id]
  return (
    <li className="v-gcell" title={item.itemConcept}>
      <span className="v-gcell__art" style={{ minWidth: 24 * scale, minHeight: 24 * scale }}>
        <ItemModel
          itemId={item.id}
          scale={scale}
          motion={motion}
          rarity={item.rarity}
          priority={0}
          fallback={<span className="v-gcell__wait" style={{ width: 24 * scale, height: 24 * scale }} />}
        />
        {art && SPRITES[art[0]] && <PixelSprite name={art[0]} color={art[1]} accent={art[2]} accent2={art[3]} size={12 * Math.max(1, Math.round(scale / 1.5))} />}
      </span>
      <span className="v-gcell__name" style={{ color: RARITY_GLOW[item.rarity] }}>
        {desc.name}
      </span>
      <code>{item.id}</code>
    </li>
  )
}

function Gallery() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' ? 'es' : params.get('lang') === 'en' ? 'en' : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [group, setGroup] = useState(() => params.get('group') ?? 'rarity')
  const [scale, setScale] = useState(() => Number(params.get('scale')) || 3)
  const [turn, setTurn] = useState(false)
  const [probed, setProbed] = useState(null)
  const [build, setBuild] = useState({ state: 'idle' })
  const [check, setCheck] = useState(null)
  const [checking, setChecking] = useState(false)
  const tx = TEXT

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')
  const env = useMemo(() => ({ lang, reduced, quality, onEvent: null }), [lang, reduced, quality])

  const descs = useMemo(() => {
    const out = new Map()
    RELICS.forEach((r) => out.set(r.id, relicDescriptor(r, lang)))
    CONSUMABLES.forEach((c) => out.set(c.id, consumableDescriptor({ id: c.id, instanceId: c.id, ...c }, lang)))
    return out
  }, [lang])

  const sections = useMemo(() => {
    const keyOf = {
      rarity: (i) => i.rarity,
      element: (i) => i.element ?? 'none',
      kind: (i) => i.kind,
    }[group]
    const order = group === 'rarity' ? RARITY_ORDER.filter((r) => ALL.some((i) => i.rarity === r)) : group === 'element' ? ELEMENT_ORDER.map((e) => e ?? 'none') : ['relic', 'consumable']
    const label = (k) => (group === 'rarity' ? RARITY_NAME[lang][k] ?? k : group === 'element' ? ELEMENT_NAME[lang][k] : k === 'relic' ? tx.relics[lang] : tx.consumables[lang])
    return order.map((k) => ({ key: k, label: label(k), items: ALL.filter((i) => keyOf(i) === k) })).filter((s) => s.items.length)
  }, [group, lang, tx])

  const buildAll = useCallback(async () => {
    setBuild({ state: 'building' })
    const t0 = performance.now()
    const { getModelAtlas } = await import('./three/itemAtlas.js')
    const results = await Promise.all(MODEL_IDS.map((id) => getModelAtlas(id, 0)))
    const total = performance.now() - t0
    const stats = getAtlasStats().filter((s) => s.key.startsWith('model:'))
    const ms = stats.map((s) => s.ms)
    setBuild({
      state: 'done',
      total,
      count: stats.length,
      avg: ms.reduce((a, b) => a + b, 0) / Math.max(1, ms.length),
      worst: Math.max(0, ...ms),
      bytes: stats.reduce((a, s) => a + s.bytes, 0),
      failed: MODEL_IDS.filter((id, i) => !results[i]),
    })
  }, [])

  const runCheck = useCallback(async () => {
    setChecking(true)
    setCheck(await findNearDuplicates(MODEL_IDS))
    setChecking(false)
  }, [])

  return (
    <VisualEnv.Provider value={env}>
      <div data-theme="dark" data-font={settings.display.fontStyle} className="elementa-root v-lab relative min-h-screen w-full overflow-x-hidden" style={{ background: 'var(--night-0)' }}>
        <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
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
              <input type="checkbox" checked={turn} onChange={(e) => setTurn(e.target.checked)} />
              {tx.turn[lang]}
            </label>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.quality[lang]}</span>
              {[['auto', tx.auto], ['low', tx.forceLow], ['high', tx.forceHigh]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${qualityMode === k ? 'el-btn--gold' : ''}`} onClick={() => setQualityMode(k)} aria-pressed={qualityMode === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.group[lang]}</span>
              {[['rarity', tx.byRarity], ['element', tx.byElement], ['kind', tx.byKind]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${group === k ? 'el-btn--gold' : ''}`} onClick={() => setGroup(k)} aria-pressed={group === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.size[lang]}</span>
              {[2, 3, 4].map((s) => (
                <button key={s} type="button" className={`el-btn el-btn--sm ${scale === s ? 'el-btn--gold' : ''}`} onClick={() => setScale(s)} aria-pressed={scale === s}>
                  x{s}
                </button>
              ))}
            </div>
          </section>

          <section className="el-panel el-panel--dark flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="el-btn el-btn--gold el-btn--sm" onClick={buildAll} disabled={build.state === 'building'}>
                {build.state === 'building' ? tx.building[lang] : tx.buildAll[lang]}
              </button>
              <button type="button" className="el-btn el-btn--sm" onClick={runCheck} disabled={checking || build.state !== 'done'}>
                {checking ? tx.checking[lang] : tx.check[lang]}
              </button>
              {build.state === 'done' && (
                <span className="text-base text-[var(--text-dim)]" data-testid="build-result">
                  {tx.built[lang]}: <b className="v-num">{build.count}</b> · {tx.total[lang]}: <b className="v-num">{build.total.toFixed(0)} ms</b> · {tx.perItem[lang]}: <b className="v-num">{build.avg.toFixed(1)} / {build.worst.toFixed(1)} ms</b> · {tx.memory[lang]}: <b className="v-num">{(build.bytes / 1024 / 1024).toFixed(2)} MB</b>
                </span>
              )}
            </div>
            {build.state === 'done' && (
              <p className="text-base text-[var(--text-dim)]" data-testid="fallbacks">
                {tx.fallbacks[lang]}: {build.failed.length ? build.failed.join(', ') : tx.none[lang]}
              </p>
            )}
            {check && (
              <div data-testid="check-result">
                <p className="text-base text-[var(--text-dim)]">
                  {tx.checkResult[lang]} <b className="v-num">{check.compared}</b>: {check.pairs.length === 0 ? tx.noDupes[lang] : `${check.pairs.length} ${tx.dupes[lang]}`}
                </p>
                {check.pairs.length > 0 && (
                  <ul className="v-log">
                    {check.pairs.map((p) => (
                      <li key={p.a + p.b}>
                        <code>{p.a}</code> / <code>{p.b}</code> <b className="v-num">{p.diff.toFixed(3)}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {sections.map((s) => (
            <section key={s.key} className="el-panel el-panel--dark flex flex-col gap-3 p-4">
              <h2 className="el-label">
                {s.label} ({s.items.length})
              </h2>
              <ul className="v-ggrid" style={{ '--cell': `${24 * scale + 56}px` }}>
                {s.items.map((item) => (
                  <Cell key={item.id} item={item} scale={scale} motion={turn ? 'turn' : 'still'} desc={descs.get(item.id)} />
                ))}
              </ul>
            </section>
          ))}
        </main>
      </div>
    </VisualEnv.Provider>
  )
}

export default function ItemGalleryPage() {
  return (
    <GameSettingsProvider>
      <Gallery />
    </GameSettingsProvider>
  )
}
