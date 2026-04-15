// Home page for EHS AI Platform
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, Shield, FileText, AlertTriangle } from "lucide-react"
import { Nav } from "@/components/nav"
import { useLanguage } from "@/components/language-provider"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const { t } = useLanguage()
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const features = [
    { icon: FileText, label: t.nav.docs, href: "/documents", color: "from-blue-500 to-cyan-500" },
    { icon: Shield, label: t.nav.permits, href: "/approvals", color: "from-emerald-500 to-teal-500" },
    { icon: AlertTriangle, label: t.nav.incident, href: "/incident", color: "from-orange-500 to-amber-500" },
  ]

  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 pt-20 pb-24 md:pb-8">
        <div className="w-full max-w-3xl text-center animate-fade-in">
          {/* Hero */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Compliance
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="gradient-text">{t.home.title}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto">
              {t.home.subtitle}
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="glass-card rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.home.searchPlaceholder}
                  className="w-full h-14 pl-12 pr-4 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="btn-primary h-14 px-8 rounded-xl text-base font-medium min-w-[120px]"
              >
                {t.common.search}
              </button>
            </div>
          </form>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="glass-card-hover rounded-2xl p-4 text-center group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{feature.label}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
