// Language toggle component for KR/EN switch
"use client"

import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]",
          locale === "en"
            ? "bg-gradient-to-r from-[#0F7B6C] to-[#0A5C8A] text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLocale("ko")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]",
          locale === "ko"
            ? "bg-gradient-to-r from-[#0F7B6C] to-[#0A5C8A] text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        )}
        aria-label="Switch to Korean"
      >
        KO
      </button>
    </div>
  )
}
