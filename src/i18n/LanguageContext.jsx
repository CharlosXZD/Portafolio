import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import strings from './strings.js'

const LanguageContext = createContext(null)

function readStored() {
  try {
    const stored = localStorage.getItem('lang')
    return stored === 'es' || stored === 'en' ? stored : null
  } catch {
    return null
  }
}

function writeStored(lang) {
  try {
    localStorage.setItem('lang', lang)
  } catch {
    // storage can be blocked (private windows); the choice just won't persist
  }
}

// First visit only: start in Spanish when the browser's preferred language is Spanish.
// A saved choice always wins, and the detected value is saved right away so the
// notice below appears once, not on every visit.
function initialLanguage() {
  if (typeof window === 'undefined') return { lang: 'en', autoSwitched: false }
  const stored = readStored()
  if (stored) return { lang: stored, autoSwitched: false }
  const preferred = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase()
  if (preferred.startsWith('es')) {
    writeStored('es')
    return { lang: 'es', autoSwitched: true }
  }
  return { lang: 'en', autoSwitched: false }
}

export function LanguageProvider({ children }) {
  const [initial] = useState(initialLanguage)
  const [lang, setLangState] = useState(initial.lang)
  const [autoSwitched, setAutoSwitched] = useState(initial.autoSwitched)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => {
    const setLang = (next) => {
      writeStored(next)
      setLangState(next)
      setAutoSwitched(false)
    }
    const toggleLang = () => setLang(lang === 'en' ? 'es' : 'en')
    const dismissAutoSwitch = () => setAutoSwitched(false)
    const t = (key) => strings[key]?.[lang] ?? key
    const pick = (field) => (field && typeof field === 'object' ? field[lang] : field)
    return { lang, setLang, toggleLang, t, pick, autoSwitched, dismissAutoSwitch }
  }, [lang, autoSwitched])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
