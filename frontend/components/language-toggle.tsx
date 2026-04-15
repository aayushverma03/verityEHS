// Language toggle component for KR/EN switch
"use client"

import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex rounded-lg border border-stone-300 overflow-hidden">
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors duration-200 min-h-[36px]",
          locale === "en"
            ? "bg-teal-700 text-white"
            : "bg-white text-stone-600 hover:bg-stone-50"
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLocale("ko")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors duration-200 min-h-[36px]",
          locale === "ko"
            ? "bg-teal-700 text-white"
            : "bg-white text-stone-600 hover:bg-stone-50"
        )}
        aria-label="Switch to Korean"
      >
        KO
      </button>
    </div>
  )
}
