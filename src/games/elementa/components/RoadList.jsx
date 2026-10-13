import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { nextChoices } from '../engine/map.js'
import { shopNameIn } from '../data/realm3.js'
import { shopTypeById } from '../data/shops.js'

/**
 * The plainest Road: the stops you can pick next, as buttons. It is the fallback if the map drawing
 * cannot load (VISUALS.md V8.3), so the run can always go on. Same callback as the map: `onPick(nodeId)`.
 */
export default function RoadList({ state, onPick }) {
  const { t, lang } = useLanguage()
  const choices = state?.map ? nextChoices(state.map) : []
  if (!onPick || choices.length === 0) return null
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={t('elementa.map.roadAhead')}>
      {choices.map((node) => {
        const type = shopTypeById(node.type)
        return (
          <button key={node.id} type="button" className="el-btn el-btn--sm w-full" onClick={() => onPick(node.id)}>
            {type ? shopNameIn(state, type, lang) : node.type}
          </button>
        )
      })}
    </div>
  )
}
