import { createContext, useContext, useMemo, useState } from 'react'
import {
  getCrtEffect,
  setCrtEffect as persistCrtEffect,
  getReducedMotion,
  setReducedMotion as persistReducedMotion,
  getGameSpeed,
  setGameSpeed as persistGameSpeed,
  getScreenShake,
  setScreenShake as persistScreenShake,
} from './settings.js'

// The two visual settings (CRT filter, reduced motion) are read by
// components scattered arbitrarily deep in the tree (Die.jsx's hover
// wobble, the CRT overlay at the game root), so they live in a small
// context instead of being threaded through every intermediate component's
// props. Everything else in OptionsScreen.jsx (volume, music, language,
// theme) is either read fresh at call-time (sound.js) or already globally
// reactive (useLanguage, the `data-theme` attribute), so it doesn't need a
// context of its own.
const GameSettingsContext = createContext(null)

export function GameSettingsProvider({ children }) {
  const [crtEffect, setCrtEffectState] = useState(getCrtEffect)
  const [reducedMotion, setReducedMotionState] = useState(getReducedMotion)
  const [gameSpeed, setGameSpeedState] = useState(getGameSpeed)
  const [screenShake, setScreenShakeState] = useState(getScreenShake)

  const value = useMemo(() => {
    function setCrtEffect(v) {
      persistCrtEffect(v)
      setCrtEffectState(v)
    }
    function setReducedMotion(v) {
      persistReducedMotion(v)
      setReducedMotionState(v)
    }
    function setGameSpeed(v) {
      persistGameSpeed(v)
      setGameSpeedState(v)
    }
    function setScreenShake(v) {
      persistScreenShake(v)
      setScreenShakeState(v)
    }
    return {
      crtEffect,
      setCrtEffect,
      reducedMotion,
      setReducedMotion,
      gameSpeed,
      setGameSpeed,
      screenShake,
      setScreenShake,
    }
  }, [crtEffect, reducedMotion, gameSpeed, screenShake])

  return <GameSettingsContext.Provider value={value}>{children}</GameSettingsContext.Provider>
}

export function useGameSettings() {
  const ctx = useContext(GameSettingsContext)
  if (!ctx) throw new Error('useGameSettings must be used within GameSettingsProvider')
  return ctx
}
