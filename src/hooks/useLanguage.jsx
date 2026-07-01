import { useState, useEffect, createContext, useContext } from 'react'
import { translations } from '../lib/translations'
import { siteConfig } from '../config/site'

const LANG_STORAGE_KEY = `${siteConfig.storageKeyPrefix}_lang`

// Create Language Context
const LanguageContext = createContext()

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    // Default to Amharic, or get from localStorage
    return localStorage.getItem(LANG_STORAGE_KEY) || 'am'
  })

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  }, [lang])

  const t = (key) => {
    return translations[lang]?.[key] || key
  }

  const toggleLanguage = () => {
    setLang(prev => prev === 'am' ? 'en' : 'am')
  }

  const value = {
    lang,
    t,
    toggleLanguage,
    setLang
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Default context value (fallback)
const defaultContext = {
  lang: 'am',
  t: (key) => translations['am']?.[key] || key,
  toggleLanguage: () => {},
  setLang: () => {}
}

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  // If context is not available (component outside provider), use default
  if (!context) {
    console.warn('useLanguage called outside LanguageProvider, using default context')
    return defaultContext
  }
  return context
}




