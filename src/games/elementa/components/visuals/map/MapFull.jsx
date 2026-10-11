import { useEffect, useRef } from 'react'
import strings from '../../../../../i18n/strings.js'
import { useVisualEnv } from '../VisualEnv.jsx'
import MapCanvas from './MapCanvas.jsx'
import { MAP_REALMS, realmOfRound } from './mapModel.js'
import { shopNameIn } from '../../../data/realm3.js'
import { shopTypeById } from '../../../data/shops.js'
import './map.css'

/**
 * The full-screen map (V6): the same Road in a box that fills the screen, with every gesture on.
 * It is its own chunk, loaded the first time the map is expanded, so the shop's first paint never
 * pays for it. Picking a stop here is the same CHOOSE_PATH as on the map table.
 */
export default function MapFull({ state, onPick, onClose }) {
  const { lang } = useVisualEnv()
  const t = (key) => strings[key]?.[lang] ?? key
  const back = useRef(null)
  const map = state.map
  const realm = realmOfRound(state.round, state)
  const pending = map.pendingId ? map.layers.flat().find((n) => n.id === map.pendingId) : null

  // Escape closes, and focus returns to what opened the map.
  useEffect(() => {
    back.current = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      back.current?.focus?.({ preventScroll: true })
    }
  }, [onClose])

  return (
    <div className="map-overlay" role="dialog" aria-modal="true" aria-label={t('elementa.map.road')} data-tut-block>
      <div className="map-overlay__head">
        <div className="flex flex-col leading-tight">
          <span className="el-label">{t('elementa.map.road')}</span>
          <span className="pixel-heading text-[11px] text-[var(--gold-hi)]">{MAP_REALMS[realm].name[lang]}</span>
        </div>
        <span className="hidden max-w-lg text-right text-sm leading-snug text-[var(--text-dim)] md:block">
          {t('elementa.map.keys')}
          <br />
          {pending ? `${shopNameIn(state, shopTypeById(pending.type), lang)}: ${shopTypeById(pending.type).blurb[lang]}` : t('elementa.map.pickHint')}
        </span>
      </div>
      <div className="map-overlay__body">
        <MapCanvas state={state} fromRound={1} toRound={Math.max(map.layers.length, state.round + 1)} onPick={onPick} width={340} rowHeight={104} nodeSize={56} variant="full" onClose={onClose} scrollToCurrent />
      </div>
    </div>
  )
}
