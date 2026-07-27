import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import strings from './strings.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem('lang') === 'es' ? 'es' : 'en'
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => {
    const toggleLang = () => setLang((l) => (l === 'en' ? 'es' : 'en'))
    const t = (key) => strings[key]?.[lang] ?? key
    const pick = (field) => (field && typeof field === 'object' ? field[lang] : field)
    return { lang, setLang, toggleLang, t, pick }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
