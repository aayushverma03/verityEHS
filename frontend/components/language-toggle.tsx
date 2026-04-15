// Language toggle component for KR/EN switch
"use client"

import { useLanguage } from "./language-provider"

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ko" : "en")}
      className="px-2 py-1 text-sm font-medium rounded border border-gray-200 hover:bg-gray-100 min-h-[36px] min-w-[44px]"
      aria-label={locale === "en" ? "Switch to Korean" : "Switch to English"}
    >
      {locale === "en" ? "KO" : "EN"}
    </button>
  )
}
