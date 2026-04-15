// Home page for Verity EHS
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Shield, FileText, HelpCircle, Clock } from "lucide-react"
import { Nav } from "@/components/nav"
import { useLanguage } from "@/components/language-provider"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { getSearchHistory, addToSearchHistory, clearSearchHistory } from "@/lib/search-history"

const searchSuggestions = {
  en: [
    "What PPE is required for chemical handling?",
    "How to conduct a confined space entry?",
    "OSHA requirements for hot work permits",
    "Emergency response procedures for spills",
    "Safety requirements for working at height",
  ],
  ko: [
    "화학물질 취급 시 필요한 보호구는?",
    "밀폐공간 진입 절차는 어떻게 되나요?",
    "고열 작업 허가 요건은 무엇인가요?",
    "유출 사고 시 비상 대응 절차는?",
    "고소 작업 안전 요건은 무엇인가요?",
  ],
}

export default function Home() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [query, setQuery] = useState("")
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % searchSuggestions.en.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      addToSearchHistory(query.trim())
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleHistoryClick(item: string) {
    setQuery(item)
    setShowHistory(false)
    addToSearchHistory(item)
    router.push(`/search?q=${encodeURIComponent(item)}`)
  }

  const currentSuggestion = locale === "ko"
    ? searchSuggestions.ko[suggestionIndex]
    : searchSuggestions.en[suggestionIndex]

  const features = [
    { icon: FileText, label: t.nav.docs, href: "/documents", color: "bg-blue-600" },
    { icon: Shield, label: t.nav.permits, href: "/approvals", color: "bg-amber-600" },
    { icon: HelpCircle, label: t.nav.faq, href: "/faq", color: "bg-purple-600" },
  ]

  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-20 pb-28 md:pb-8">
        <div className="w-full max-w-3xl text-center animate-fade-in">
          {/* Hero with Logo */}
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <Logo variant="mark" className="h-20 w-20 md:h-24 md:w-24" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              <span className="text-stone-800">Verity</span>
              <span className="text-teal-700 ml-2">EHS</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-500 max-w-xl mx-auto">
              {t.home.subtitle}
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-sm border border-stone-200">
              <div className="relative flex-1" ref={searchRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                  placeholder={currentSuggestion}
                  className="w-full h-14 pl-12 pr-4 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-stone-400 transition-all duration-300"
                />
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100">
                      <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                        {locale === "ko" ? "최근 검색" : "Recent Searches"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          clearSearchHistory()
                          setSearchHistory([])
                          setShowHistory(false)
                        }}
                        className="text-xs text-stone-400 hover:text-stone-600"
                      >
                        {locale === "ko" ? "지우기" : "Clear"}
                      </button>
                    </div>
                    {searchHistory.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
                      >
                        <Clock className="h-4 w-4 text-stone-400 flex-shrink-0" />
                        <span className="text-sm text-stone-700 truncate">{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="h-14 px-8 rounded-xl text-base font-medium min-w-[120px] bg-teal-700 text-white hover:bg-teal-800 transition-colors duration-200"
              >
                {t.common.search}
              </button>
            </div>
          </form>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="card-hover rounded-xl p-5 text-center group"
                >
                  <div className={`inline-flex p-3.5 rounded-lg ${feature.color} mb-3 group-hover:opacity-90 transition-opacity duration-200`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-stone-700">{feature.label}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
