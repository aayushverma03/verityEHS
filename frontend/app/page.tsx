// Home page for Verity EHS
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Shield, FileText, HelpCircle } from "lucide-react"
import { Nav } from "@/components/nav"
import { useLanguage } from "@/components/language-provider"
import { Logo } from "@/components/logo"
import Link from "next/link"

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

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % searchSuggestions.en.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
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
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={currentSuggestion}
                  className="w-full h-14 pl-12 pr-4 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-stone-400 transition-all duration-300"
                />
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
