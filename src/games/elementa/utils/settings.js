// Persisted game settings beyond language/theme (those two already have their
// own site-wide stores: src/i18n/LanguageContext.jsx and the `theme`
// localStorage key ThemeToggle.jsx reads/writes). Everything here is
// Elementa-specific: audio levels and the optional visual effects layer.
const KEYS = {
  sfxVolume: 'elementa-sfx-volume',
  musicVolume: 'elementa-music-volume',
  musicEnabled: 'elementa-music-enabled',
  crtEffect: 'elementa-crt-effect',
  reducedMotion: 'elementa-reduced-motion',
  gameSpeed: 'elementa-game-speed',
  screenShake: 'elementa-screen-shake',
  display: 'elementa-display',
}

function readNumber(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    const n = Number(raw)
    return Number.isFinite(n) ? n : fallback
  } catch {
    return fallback
  }
}

function readBool(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return raw === 'true'
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // storage blocked (private mode/quota): the choice still applies live
  }
}

export function getSfxVolume() {
  return readNumber(KEYS.sfxVolume, 1)
}
export function setSfxVolume(v) {
  write(KEYS.sfxVolume, v)
}

export function getMusicVolume() {
  return readNumber(KEYS.musicVolume, 0.5)
}
export function setMusicVolume(v) {
  write(KEYS.musicVolume, v)
}

export function getMusicEnabled() {
  return readBool(KEYS.musicEnabled, true)
}
export function setMusicEnabled(v) {
  write(KEYS.musicEnabled, v)
}

export function getCrtEffect() {
  return readBool(KEYS.crtEffect, false)
}
export function setCrtEffect(v) {
  write(KEYS.crtEffect, v)
}

// Reduced motion defaults to the OS preference the first time it's read, so
// a player who already asked their system for less motion gets that here
// too, without having to find the toggle first.
export function getReducedMotion() {
  try {
    const raw = window.localStorage.getItem(KEYS.reducedMotion)
    if (raw != null) return raw === 'true'
  } catch {
    // fall through to the OS preference
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
export function setReducedMotion(v) {
  write(KEYS.reducedMotion, v)
}

// How fast the score-reveal plays: 'normal' (the full count-up), 'fast'
// (a quick tally), or 'instant' (straight to the result).
export const GAME_SPEEDS = ['normal', 'fast', 'instant']
export function getGameSpeed() {
  try {
    const raw = window.localStorage.getItem(KEYS.gameSpeed)
    return GAME_SPEEDS.includes(raw) ? raw : 'normal'
  } catch {
    return 'normal'
  }
}
export function setGameSpeed(v) {
  write(KEYS.gameSpeed, v)
}

export function getScreenShake() {
  return readBool(KEYS.screenShake, true)
}
export function setScreenShake(v) {
  write(KEYS.screenShake, v)
}

// Display preferences (Options -> Display): how much information the round
// screen shows. Stored as one JSON object so new toggles don't each need
// their own key.
export const DISPLAY_DEFAULTS = {
  fontStyle: 'pixel', // 'pixel' | 'classic' | 'clean'
  reactions: 'compact', // 'compact' | 'full' | 'off'
  glows: true,
  keyHints: true,
  ledgerOpen: true,
  // How a die rolls: 'tumble' (hops and turns, EXPANSION.md E6) or
  // 'classic' (the face flickers in place). Reduced motion forces classic.
  rollAnimation: 'tumble',
  // Particle effects per element on dice (EXPANSION.md E3).
  elementEffects: true,
}
export function getDisplay() {
  try {
    const raw = window.localStorage.getItem(KEYS.display)
    return { ...DISPLAY_DEFAULTS, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    return { ...DISPLAY_DEFAULTS }
  }
}
export function setDisplay(v) {
  write(KEYS.display, JSON.stringify(v))
}
