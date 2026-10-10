import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { GameSettingsProvider, useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../utils/perfProbe.js'
import { RELICS, RARITY_GLOW, RARITY_ORDER } from '../../data/relics.js'
import { CONSUMABLES } from '../../data/consumables.js'
import { ITEM_ART, SPRITES } from '../../data/sprites.js'
import { relicDescriptor, consumableDescriptor } from '../../data/itemDescriptors.js'
import PixelSprite from '../PixelSprite.jsx'
import ItemModel from './ItemModel.jsx'
import ItemSprite from './ItemSprite.jsx'
import { VisualEnv } from './VisualEnv.jsx'
import { SPRITE_IDS, itemBitmap } from './sprites/index.js'
import { spriteDuplicates } from './sprites/spriteCheck.js'
import '../../elementa.css'
import './visuals.css'

const L = (en, es) => ({ en, es })
const TEXT = {
  title: L('Item sprites', 'Sprites de objetos'),
  back: L('Back to the Visual Lab', 'Volver al Laboratorio Visual'),
  intro: L(
    'V2.5: every item as a hand-authored 32 by 32 pixel sprite drawn in code (the style bible is in ASSETS.md). The sheet shows the new sprite, its silhouette and the old 3D model and flat sprite it replaces.',
    'V2.5: cada objeto como un sprite de 32 por 32 píxeles hecho a mano en código (la guía de estilo está en ASSETS.md). La hoja muestra el sprite nuevo, su silueta y el modelo 3D y el sprite plano anteriores.',
  ),
  language: L('Language', 'Idioma'),
  reduced: L('Reduced motion', 'Movimiento reducido'),
  quality: L('Quality', 'Calidad'),
  auto: L('Auto', 'Auto'),
  forceLow: L('Force low', 'Forzar baja'),
  forceHigh: L('Force high', 'Forzar alta'),
  view: L('View', 'Vista'),
  sheet: L('Sheet', 'Hoja'),
  silhouettes: L('Silhouettes', 'Siluetas'),
  nameIt: L('Name it', 'Adivínalo'),
  size: L('Size', 'Tamaño'),
  old: L('Show old versions', 'Mostrar versiones anteriores'),
  labels: L('Show names', 'Mostrar nombres'),
  count: L('Items drawn', 'Objetos dibujados'),
  check: L('Uniqueness check (silhouettes first, then colors)', 'Verificación de unicidad (siluetas primero, luego colores)'),
  nearest: L('The closest pairs', 'Los pares más cercanos'),
  nameHint: L('Look at the items without names and say what each one is. Then show the names and note the ones you could not tell.', 'Mira los objetos sin nombre y di qué es cada uno. Luego muestra los nombres y anota los que no pudiste distinguir.'),
}
const RARITY_NAME = {
  en: { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic' },
  es: { common: 'Común', uncommon: 'Poco común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario', mythic: 'Mítico' },
}

function Cell({ item, desc, scale, view, showOld, labels, i }) {
  const art = ITEM_ART[item.id]
  const named = view !== 'nameIt' || labels
  return (
    <li className="v-gcell" title={item.itemConcept}>
      <span className="v-gcell__art" style={{ gap: 10, alignItems: 'flex-end' }}>
        {view !== 'silhouettes' && <ItemSprite itemId={item.id} scale={scale} rarity={item.rarity} index={i} />}
        {view !== 'nameIt' && (
          <span className="v-sil" style={{ padding: 4 }}>
            <ItemSprite itemId={item.id} scale={view === 'silhouettes' ? scale : Math.max(1, scale - 1)} mode="silhouette" motion="still" />
          </span>
        )}
        {showOld && view === 'sheet' && (
          <>
            <ItemModel itemId={item.id} scale={2} motion="still" rarity={item.rarity} priority={0} fallback={<span style={{ width: 48, height: 48 }} />} />
            {art && SPRITES[art[0]] && <PixelSprite name={art[0]} color={art[1]} accent={art[2]} accent2={art[3]} size={24} />}
          </>
        )}
      </span>
      {named && (
        <>
          <span className="v-gcell__name" style={{ color: RARITY_GLOW[item.rarity] }}>
            {desc.name}
          </span>
          {view === 'sheet' && <code>{item.id}</code>}
        </>
      )}
    </li>
  )
}

function Sprites() {
  const { lang: siteLang } = useLanguage()
  const settings = useGameSettings()
  const [params] = useSearchParams()
  const [lang, setLang] = useState(() => (params.get('lang') === 'es' ? 'es' : params.get('lang') === 'en' ? 'en' : siteLang))
  const [reduced, setReduced] = useState(() => (params.has('reduced') ? params.get('reduced') !== '0' : settings.reducedMotion))
  const [qualityMode, setQualityMode] = useState(() => params.get('quality') ?? 'auto')
  const [view, setView] = useState(() => params.get('view') ?? 'sheet')
  const [scale, setScale] = useState(() => Number(params.get('scale')) || 3)
  const [showOld, setShowOld] = useState(() => params.get('old') === '1')
  const [labels, setLabels] = useState(() => params.get('labels') === '1')
  const [probed, setProbed] = useState(null)
  const tx = TEXT

  useEffect(() => {
    getVisualQuality().then(setProbed)
  }, [])
  const quality = qualityMode === 'low' ? 'low' : qualityMode === 'high' ? 'high' : (probed ?? 'high')
  const env = useMemo(() => ({ lang, reduced, quality, onEvent: null }), [lang, reduced, quality])

  const ids = SPRITE_IDS()
  const items = useMemo(() => [...RELICS, ...CONSUMABLES].filter((i) => ids.includes(i.id)), [ids.length]) // eslint-disable-line react-hooks/exhaustive-deps
  const descs = useMemo(() => {
    const out = new Map()
    RELICS.forEach((r) => out.set(r.id, relicDescriptor(r, lang)))
    CONSUMABLES.forEach((c) => out.set(c.id, consumableDescriptor({ id: c.id, instanceId: c.id, ...c }, lang)))
    return out
  }, [lang])
  const sections = useMemo(() => {
    if (view === 'nameIt') return [{ key: 'all', label: '', items }]
    return RARITY_ORDER.map((r) => ({ key: r, label: RARITY_NAME[lang][r], items: items.filter((i) => i.rarity === r) })).filter((s) => s.items.length)
  }, [items, lang, view])
  const check = useMemo(() => spriteDuplicates(ids), [ids.length]) // eslint-disable-line react-hooks/exhaustive-deps
  const cell = view === 'silhouettes' ? 32 * scale + 24 : view === 'nameIt' ? 32 * scale + 20 : 32 * scale + (showOld ? 150 : 32 * (scale - 1) + 40)

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
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.quality[lang]}</span>
              {[['auto', tx.auto], ['low', tx.forceLow], ['high', tx.forceHigh]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${qualityMode === k ? 'el-btn--gold' : ''}`} onClick={() => setQualityMode(k)} aria-pressed={qualityMode === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.view[lang]}</span>
              {[['sheet', tx.sheet], ['silhouettes', tx.silhouettes], ['nameIt', tx.nameIt]].map(([k, label]) => (
                <button key={k} type="button" className={`el-btn el-btn--sm ${view === k ? 'el-btn--gold' : ''}`} onClick={() => setView(k)} aria-pressed={view === k}>
                  {label[lang]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="el-label">{tx.size[lang]}</span>
              {[1, 2, 3, 4].map((s) => (
                <button key={s} type="button" className={`el-btn el-btn--sm ${scale === s ? 'el-btn--gold' : ''}`} onClick={() => setScale(s)} aria-pressed={scale === s}>
                  x{s}
                </button>
              ))}
            </div>
            {view === 'sheet' && (
              <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
                <input type="checkbox" checked={showOld} onChange={(e) => setShowOld(e.target.checked)} />
                {tx.old[lang]}
              </label>
            )}
            {view === 'nameIt' && (
              <label className="flex items-center gap-2 text-base text-[var(--text-dim)]">
                <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} />
                {tx.labels[lang]}
              </label>
            )}
          </section>

          {view === 'nameIt' && <p className="max-w-3xl text-base text-[var(--text-dim)]">{tx.nameHint[lang]}</p>}

          {sections.map((s) => (
            <section key={s.key} className="el-panel el-panel--dark flex flex-col gap-3 p-4">
              {s.label && (
                <h2 className="el-label">
                  {s.label} ({s.items.length})
                </h2>
              )}
              <ul className="v-ggrid" style={{ '--cell': `${cell}px` }}>
                {s.items.map((item, i) => (
                  <Cell key={item.id} item={item} desc={descs.get(item.id)} scale={scale} view={view} showOld={showOld} labels={labels} i={i} />
                ))}
              </ul>
            </section>
          ))}

          <section className="el-panel el-panel--dark flex flex-col gap-2 p-4">
            <h2 className="el-label">
              {tx.count[lang]}: {ids.length}
            </h2>
            <p className="text-base text-[var(--text-dim)]">{tx.check[lang]}:</p>
            <p className="text-base text-[var(--text-mute)]">{tx.nearest[lang]}:</p>
            <ul className="v-log" data-testid="sprite-check">
              {check.nearest.map((p) => (
                <li key={p.a + p.b}>
                  <code>{p.a}</code> / <code>{p.b}</code> shape <b className="v-num">{p.shape.toFixed(2)}</b> color <b className="v-num">{p.color.toFixed(2)}</b>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </VisualEnv.Provider>
  )
}

export { itemBitmap }

export default function ItemSpritesPage() {
  return (
    <GameSettingsProvider>
      <Sprites />
    </GameSettingsProvider>
  )
}
