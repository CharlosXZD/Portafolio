import { createContext, useContext } from 'react'

/**
 * The environment every new visual reads: language, Reduced motion and the
 * quality tier ('high' draws the new art, 'low' keeps the current static
 * art). The real game will feed this from its settings once a phase ships
 * to players; the Visual Lab overrides it locally so toggling here never
 * changes the saved game settings.
 */
export const VisualEnv = createContext({ lang: 'en', reduced: false, quality: 'high', onEvent: null })

export function useVisualEnv() {
  return useContext(VisualEnv)
}
