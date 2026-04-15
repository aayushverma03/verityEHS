// Language context provider for KR/EN toggle
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Locale, TranslationKeys, getTranslations, getStoredLocale, setStoredLocale } from "@/lib/i18n"

type LanguageContextType = {
  locale: Locale
  t: TranslationKeys
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLocaleState(getStoredLocale())
    setMounted(true)
  }, [])

  function setLocale(newLocale: Locale) {
    setStoredLocale(newLocale)
    setLocaleState(newLocale)
  }

  const t = getTranslations(locale)

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
