import { createContext, useContext, useEffect, useState } from 'react'
import { useLanguage } from '../../../../i18n/LanguageContext.jsx'
import { useGameSettings } from '../../utils/gameSettingsContext.jsx'
import { getVisualQuality } from '../../utils/perfProbe.js'

/**
 * The environment every new visual reads: language, Reduced motion and the
 * quality tier ('high' draws the new art, 'low' keeps the current static
 * art). The Visual Lab provides it to override the settings locally (so
 * toggling there never changes the saved game settings). Anywhere else, in
 * the real game, there is no provider and the values come from the game's
 * own settings and the device probe (utils/perfProbe.js).
 */
export const VisualEnv = createContext(null)

export function useVisualEnv() {
  const ctx = useContext(VisualEnv)
  const { lang } = useLanguage()
  const { reducedMotion } = useGameSettings()
  const [quality, setQuality] = useState('high')
  useEffect(() => {
    if (ctx) return
    let live = true
    getVisualQuality().then((q) => live && setQuality(q))
    return () => {
      live = false
    }
  }, [ctx])
  return ctx ?? { lang, reduced: reducedMotion, quality, onEvent: null }
}
